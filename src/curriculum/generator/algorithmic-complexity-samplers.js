import { randomIntBetween } from "../../core/random.js";

const PLACE_NAMES = Object.freeze([
  "ones",
  "tens",
  "hundreds",
  "thousands",
  "tenThousands",
  "hundredThousands",
  "millions",
  "tenMillions",
  "hundredMillions"
]);

const POLICY_ALIASES = Object.freeze({
  no_carry: "noCarry",
  noCarry: "noCarry",
  require_carry: "requireCarry",
  requireCarry: "requireCarry",
  single_carry: "singleCarry",
  singleCarry: "singleCarry",
  multi_carry: "multiCarry",
  multiCarry: "multiCarry",

  no_borrow: "noBorrow",
  noBorrow: "noBorrow",
  require_borrow: "requireBorrow",
  requireBorrow: "requireBorrow",
  single_borrow: "singleBorrow",
  singleBorrow: "singleBorrow",
  multi_borrow: "multiBorrow",
  multiBorrow: "multiBorrow",
  consecutive_borrow: "consecutiveBorrow",
  consecutiveBorrow: "consecutiveBorrow",
  zero_borrow_chain: "zeroBorrowChain",
  zeroBorrowChain: "zeroBorrowChain",

  no_multiplication_carry: "noMultiplicationCarry",
  noMultiplicationCarry: "noMultiplicationCarry",
  multiplication_with_carry: "multiplicationWithCarry",
  multiplicationWithCarry: "multiplicationWithCarry",
  multi_step_carry: "multiStepCarry",
  multiStepCarry: "multiStepCarry",

  exact: "exact",
  high_place_sufficient: "highPlaceSufficient",
  highPlaceSufficient: "highPlaceSufficient",
  high_place_insufficient: "highPlaceInsufficient",
  highPlaceInsufficient: "highPlaceInsufficient",
  high_place_exact: "highPlaceExact",
  highPlaceExact: "highPlaceExact",
  regroup_tens: "regroupTens",
  regroupTens: "regroupTens",
  regroup_hundreds: "regroupHundreds",
  regroupHundreds: "regroupHundreds",
  tens_insufficient: "tensInsufficient",
  tensInsufficient: "tensInsufficient",
  ones_insufficient: "onesInsufficient",
  onesInsufficient: "onesInsufficient",
  ones_equal_divisor: "onesEqualDivisor",
  onesEqualDivisor: "onesEqualDivisor"
});

const ADDITION_POLICIES = new Set(["noCarry", "requireCarry", "singleCarry", "multiCarry"]);
const SUBTRACTION_POLICIES = new Set(["noBorrow", "requireBorrow", "singleBorrow", "multiBorrow", "consecutiveBorrow", "zeroBorrowChain"]);
const MULTIPLICATION_POLICIES = new Set(["noMultiplicationCarry", "multiplicationWithCarry", "multiStepCarry"]);
const DIVISION_POLICIES = new Set(["exact", "highPlaceSufficient", "highPlaceInsufficient", "highPlaceExact", "regroupTens", "regroupHundreds", "tensInsufficient", "onesInsufficient", "onesEqualDivisor"]);

function normalizePolicy(policy) {
  return POLICY_ALIASES[policy] ?? policy;
}

function createIssue(code, path, message, severity = "error") {
  return { code, severity, path, message };
}

function success(operands, profile) {
  return { ok: true, operands, profile, errors: [], warnings: [] };
}

function failure(code, path, message) {
  return { ok: false, operands: [], profile: null, errors: [createIssue(code, path, message)], warnings: [] };
}

function getRange(ranges, position) {
  return ranges?.find((range) => range?.position === position) ?? null;
}

function valueAllowedByRange(value, range) {
  if (!range || !Number.isInteger(value)) {
    return false;
  }
  if (Number.isInteger(range.min) && value < range.min) {
    return false;
  }
  if (Number.isInteger(range.max) && value > range.max) {
    return false;
  }
  if (range.allowZero === false && value === 0) {
    return false;
  }
  if (range.allowOne === false && Math.abs(value) === 1) {
    return false;
  }
  if (range.allowNegative === false && value < 0) {
    return false;
  }
  return true;
}

function operandsAllowedByRanges(operands, ranges) {
  return operands.every((operand, index) => valueAllowedByRange(operand, getRange(ranges, index + 1)));
}

function digitsLsd(value) {
  return String(Math.abs(value)).split("").reverse().map((digit) => Number(digit));
}

function digitsMsd(value) {
  return String(Math.abs(value)).split("").map((digit) => Number(digit));
}

function digitLength(value) {
  return String(Math.abs(value)).length;
}

function placeNameFromPower(power) {
  return PLACE_NAMES[power] ?? `10^${power}`;
}

function hasAdjacentColumns(columnIndexes) {
  return columnIndexes.some((column, index) => index > 0 && column === columnIndexes[index - 1] + 1);
}

function randomPairFromRanges(ranges, randomFn) {
  const range1 = getRange(ranges, 1);
  const range2 = getRange(ranges, 2);
  if (!range1 || !range2) {
    return null;
  }
  return [
    randomIntBetween(randomFn, range1.min, range1.max),
    randomIntBetween(randomFn, range2.min, range2.max)
  ];
}

function candidateThenRandomSample({ policy, ranges, randomFn, candidates, classify, matches, code }) {
  const nextRandom = typeof randomFn === "function" ? randomFn : Math.random;

  for (let attempt = 0; attempt < 5000; attempt += 1) {
    const operands = randomPairFromRanges(ranges, nextRandom);
    if (!operands || !operandsAllowedByRanges(operands, ranges)) {
      continue;
    }
    const profile = classify(...operands);
    if (matches(profile, policy)) {
      return success(operands, profile);
    }
  }

  for (const operands of candidates) {
    if (!operandsAllowedByRanges(operands, ranges)) {
      continue;
    }
    const profile = classify(...operands);
    if (matches(profile, policy)) {
      return success(operands, profile);
    }
  }

  return failure(code, "algorithmicSampler.policy", `Unable to satisfy policy '${policy}' with the provided operand ranges.`);
}

export function classifyAdditionCarryProfile(left, right) {
  const leftDigits = digitsLsd(left);
  const rightDigits = digitsLsd(right);
  const maxLength = Math.max(leftDigits.length, rightDigits.length);
  const carryColumnIndexes = [];
  let carryIn = 0;

  for (let index = 0; index < maxLength; index += 1) {
    const sum = (leftDigits[index] ?? 0) + (rightDigits[index] ?? 0) + carryIn;
    if (sum >= 10) {
      carryColumnIndexes.push(index);
      carryIn = 1;
    } else {
      carryIn = 0;
    }
  }

  return {
    operation: "addition",
    left,
    right,
    carryCount: carryColumnIndexes.length,
    carryColumns: carryColumnIndexes.map(placeNameFromPower),
    requiresCarry: carryColumnIndexes.length > 0,
    singleCarry: carryColumnIndexes.length === 1,
    multiCarry: carryColumnIndexes.length >= 2,
    consecutiveCarry: hasAdjacentColumns(carryColumnIndexes)
  };
}

function additionPolicyMatches(profile, policy) {
  switch (policy) {
    case "noCarry":
      return profile.carryCount === 0;
    case "requireCarry":
      return profile.requiresCarry;
    case "singleCarry":
      return profile.singleCarry;
    case "multiCarry":
      return profile.multiCarry;
    default:
      return false;
  }
}

export function sampleAdditionOperandsByCarryPolicy(policy, ranges, randomFn = Math.random) {
  const normalizedPolicy = normalizePolicy(policy);
  if (!ADDITION_POLICIES.has(normalizedPolicy)) {
    return failure("SAMPLER_POLICY_UNSUPPORTED", "algorithmicSampler.policy", `Unsupported addition carry policy '${policy}'.`);
  }

  const candidates = {
    noCarry: [[1234, 1111]],
    requireCarry: [[1234, 1118], [4876, 3987]],
    singleCarry: [[1234, 1118]],
    multiCarry: [[4876, 3987], [2765, 1987]]
  }[normalizedPolicy];

  return candidateThenRandomSample({
    policy: normalizedPolicy,
    ranges,
    randomFn,
    candidates,
    classify: classifyAdditionCarryProfile,
    matches: additionPolicyMatches,
    code: "ADDITION_CARRY_POLICY_UNSATISFIED"
  });
}

export function classifySubtractionBorrowProfile(minuend, subtrahend) {
  const minuendDigits = digitsLsd(minuend);
  const subtrahendDigits = digitsLsd(subtrahend);
  const maxLength = Math.max(minuendDigits.length, subtrahendDigits.length);
  const borrowColumnIndexes = [];
  const zeroChainColumns = [];
  let borrowIn = 0;

  for (let index = 0; index < maxLength; index += 1) {
    const adjustedTopDigit = (minuendDigits[index] ?? 0) - borrowIn;
    const bottomDigit = subtrahendDigits[index] ?? 0;
    if (adjustedTopDigit < bottomDigit) {
      borrowColumnIndexes.push(index);
      const crossedZeros = [];
      for (let cursor = index + 1; cursor < maxLength; cursor += 1) {
        if ((minuendDigits[cursor] ?? 0) === 0) {
          crossedZeros.push(cursor);
          continue;
        }
        break;
      }
      zeroChainColumns.push(...crossedZeros);
      borrowIn = 1;
    } else {
      borrowIn = 0;
    }
  }

  return {
    operation: "subtraction",
    minuend,
    subtrahend,
    nonNegativeDifference: minuend >= subtrahend,
    borrowCount: borrowColumnIndexes.length,
    borrowColumns: borrowColumnIndexes.map(placeNameFromPower),
    requiresBorrow: borrowColumnIndexes.length > 0,
    singleBorrow: borrowColumnIndexes.length === 1,
    multiBorrow: borrowColumnIndexes.length >= 2,
    consecutiveBorrow: hasAdjacentColumns(borrowColumnIndexes),
    zeroBorrowChain: zeroChainColumns.length > 0,
    zeroChainColumns: [...new Set(zeroChainColumns)].map(placeNameFromPower)
  };
}

function subtractionPolicyMatches(profile, policy) {
  if (!profile.nonNegativeDifference) {
    return false;
  }
  switch (policy) {
    case "noBorrow":
      return profile.borrowCount === 0;
    case "requireBorrow":
      return profile.requiresBorrow;
    case "singleBorrow":
      return profile.singleBorrow;
    case "multiBorrow":
      return profile.multiBorrow;
    case "consecutiveBorrow":
      return profile.consecutiveBorrow;
    case "zeroBorrowChain":
      return profile.zeroBorrowChain;
    default:
      return false;
  }
}

export function sampleSubtractionOperandsByBorrowPolicy(policy, ranges, randomFn = Math.random) {
  const normalizedPolicy = normalizePolicy(policy);
  if (!SUBTRACTION_POLICIES.has(normalizedPolicy)) {
    return failure("SAMPLER_POLICY_UNSUPPORTED", "algorithmicSampler.policy", `Unsupported subtraction borrow policy '${policy}'.`);
  }

  const candidates = {
    noBorrow: [[4321, 1111]],
    requireBorrow: [[4321, 1987]],
    singleBorrow: [[5234, 1118]],
    multiBorrow: [[4321, 1987]],
    consecutiveBorrow: [[4321, 1987]],
    zeroBorrowChain: [[5000, 1234], [7000, 2689]]
  }[normalizedPolicy];

  return candidateThenRandomSample({
    policy: normalizedPolicy,
    ranges,
    randomFn,
    candidates,
    classify: classifySubtractionBorrowProfile,
    matches: subtractionPolicyMatches,
    code: "SUBTRACTION_BORROW_POLICY_UNSATISFIED"
  });
}

function partialMultiplicationCarryProfile(multiplicand, multiplierDigit, offset) {
  const multiplicandDigits = digitsLsd(multiplicand);
  let carryIn = 0;
  const carryColumnIndexes = [];

  for (let index = 0; index < multiplicandDigits.length; index += 1) {
    const product = (multiplicandDigits[index] * multiplierDigit) + carryIn;
    const carryOut = Math.floor(product / 10);
    if (carryOut > 0) {
      carryColumnIndexes.push(index + offset);
    }
    carryIn = carryOut;
  }

  return {
    multiplierDigit,
    offset,
    carryCount: carryColumnIndexes.length,
    carryColumns: carryColumnIndexes.map(placeNameFromPower)
  };
}

export function classifyMultiplicationCarryProfile(left, right) {
  const [multiplicand, multiplier] = digitLength(left) >= digitLength(right) ? [left, right] : [right, left];
  const multiplierDigits = digitsLsd(multiplier);
  const partialProfiles = [];

  for (const [offset, digit] of multiplierDigits.entries()) {
    if (digit === 0) {
      continue;
    }
    partialProfiles.push(partialMultiplicationCarryProfile(multiplicand, digit, offset));
  }

  const carryCount = partialProfiles.reduce((total, profile) => total + profile.carryCount, 0);
  return {
    operation: "multiplication",
    left,
    right,
    multiplicand,
    multiplier,
    carryCount,
    partialProfiles,
    requiresCarry: carryCount > 0,
    multiplicationWithCarry: carryCount > 0,
    multiStepCarry: carryCount >= 2
  };
}

function multiplicationPolicyMatches(profile, policy) {
  switch (policy) {
    case "noMultiplicationCarry":
      return profile.carryCount === 0;
    case "multiplicationWithCarry":
      return profile.multiplicationWithCarry;
    case "multiStepCarry":
      return profile.multiStepCarry;
    default:
      return false;
  }
}

export function sampleMultiplicationOperandsByCarryPolicy(policy, ranges, randomFn = Math.random) {
  const normalizedPolicy = normalizePolicy(policy);
  if (!MULTIPLICATION_POLICIES.has(normalizedPolicy)) {
    return failure("SAMPLER_POLICY_UNSUPPORTED", "algorithmicSampler.policy", `Unsupported multiplication carry policy '${policy}'.`);
  }

  const candidates = {
    noMultiplicationCarry: [[12, 3], [3, 12]],
    multiplicationWithCarry: [[27, 8], [8, 27], [327, 8], [8, 327], [34, 27]],
    multiStepCarry: [[27, 8], [327, 8], [8, 327], [34, 27]]
  }[normalizedPolicy];

  return candidateThenRandomSample({
    policy: normalizedPolicy,
    ranges,
    randomFn,
    candidates,
    classify: classifyMultiplicationCarryProfile,
    matches: multiplicationPolicyMatches,
    code: "MULTIPLICATION_CARRY_POLICY_UNSATISFIED"
  });
}

export function classifyDivisionPlaceCaseProfile(dividend, divisor) {
  if (!Number.isInteger(dividend) || !Number.isInteger(divisor) || divisor === 0) {
    return {
      operation: "division",
      dividend,
      divisor,
      valid: false,
      exact: false
    };
  }

  const digits = digitsMsd(dividend);
  const absDivisor = Math.abs(divisor);
  const firstDigit = digits[0];
  const steps = [];
  let remainder = 0;

  for (const [index, digit] of digits.entries()) {
    const partialDividend = (remainder * 10) + digit;
    const quotientDigit = Math.floor(partialDividend / absDivisor);
    const remainderAfter = partialDividend % absDivisor;
    steps.push({
      place: placeNameFromPower(digits.length - index - 1),
      partialDividend,
      quotientDigit,
      remainderAfter,
      insufficient: partialDividend < absDivisor
    });
    remainder = remainderAfter;
  }

  const insufficientPlaces = steps.filter((step) => step.insufficient).map((step) => step.place);
  const regroupPlaces = steps.slice(0, -1).filter((step) => step.remainderAfter > 0).map((step) => step.place);
  const onesDigit = digits[digits.length - 1];
  return {
    operation: "division",
    dividend,
    divisor,
    valid: true,
    exact: dividend % divisor === 0,
    firstDigit,
    firstDigitRemainder: firstDigit % absDivisor,
    highPlaceSufficient: firstDigit >= absDivisor,
    highPlaceInsufficient: firstDigit < absDivisor,
    highPlaceExact: firstDigit >= absDivisor && firstDigit % absDivisor === 0,
    steps,
    insufficientPlaces,
    regroupPlaces,
    hasRegroupRemainder: regroupPlaces.length > 0,
    tensInsufficient: insufficientPlaces.includes("tens"),
    onesInsufficient: insufficientPlaces.includes("ones") || onesDigit < absDivisor,
    onesEqualDivisor: onesDigit === absDivisor,
    onesDigitLessThanDivisor: onesDigit < absDivisor
  };
}

function divisionPolicyMatches(profile, policy) {
  if (!profile.valid || !profile.exact) {
    return false;
  }
  switch (policy) {
    case "exact":
      return profile.exact;
    case "highPlaceSufficient":
      return profile.highPlaceSufficient;
    case "highPlaceInsufficient":
      return profile.highPlaceInsufficient;
    case "highPlaceExact":
      return profile.highPlaceExact;
    case "regroupTens":
      return profile.hasRegroupRemainder;
    case "regroupHundreds":
      return profile.hasRegroupRemainder && digitLength(profile.dividend) >= 3;
    case "tensInsufficient":
      return profile.tensInsufficient;
    case "onesInsufficient":
      return profile.onesInsufficient;
    case "onesEqualDivisor":
      return profile.onesEqualDivisor;
    default:
      return false;
  }
}

function divisionRandomSample(policy, ranges, randomFn) {
  const dividendRange = getRange(ranges, 1);
  const divisorRange = getRange(ranges, 2);
  if (!dividendRange || !divisorRange) {
    return null;
  }

  for (let attempt = 0; attempt < 5000; attempt += 1) {
    const divisor = randomIntBetween(randomFn, divisorRange.min, divisorRange.max);
    if (!valueAllowedByRange(divisor, divisorRange) || divisor === 0) {
      continue;
    }
    const quotientMin = Math.max(1, Math.ceil(dividendRange.min / divisor));
    const quotientMax = Math.floor(dividendRange.max / divisor);
    if (quotientMin > quotientMax) {
      continue;
    }
    const quotient = randomIntBetween(randomFn, quotientMin, quotientMax);
    const dividend = divisor * quotient;
    const operands = [dividend, divisor];
    if (!operandsAllowedByRanges(operands, ranges)) {
      continue;
    }
    const profile = classifyDivisionPlaceCaseProfile(dividend, divisor);
    if (divisionPolicyMatches(profile, policy)) {
      return success(operands, profile);
    }
  }

  return null;
}

export function sampleDivisionOperandsByPlaceCasePolicy(policy, ranges, randomFn = Math.random) {
  const normalizedPolicy = normalizePolicy(policy);
  if (!DIVISION_POLICIES.has(normalizedPolicy)) {
    return failure("SAMPLER_POLICY_UNSUPPORTED", "algorithmicSampler.policy", `Unsupported division place-case policy '${policy}'.`);
  }

  const randomResult = divisionRandomSample(normalizedPolicy, ranges, typeof randomFn === "function" ? randomFn : Math.random);
  if (randomResult) {
    return randomResult;
  }

  const candidates = {
    exact: [[84, 7], [96, 8], [144, 9], [1008, 7], [8424, 4]],
    highPlaceSufficient: [[8424, 4], [8448, 8], [84, 4]],
    highPlaceInsufficient: [[1008, 7], [72, 9], [126, 9]],
    highPlaceExact: [[8424, 4], [6363, 3], [84, 4]],
    regroupTens: [[52, 4], [84, 6], [512, 4]],
    regroupHundreds: [[512, 4], [756, 6]],
    tensInsufficient: [[312, 3], [416, 4]],
    onesInsufficient: [[52, 4], [312, 3], [75, 5]],
    onesEqualDivisor: [[28, 4], [36, 6], [95, 5]]
  }[normalizedPolicy];

  for (const operands of candidates) {
    if (!operandsAllowedByRanges(operands, ranges)) {
      continue;
    }
    const profile = classifyDivisionPlaceCaseProfile(...operands);
    if (divisionPolicyMatches(profile, normalizedPolicy)) {
      return success(operands, profile);
    }
  }

  return failure("DIVISION_PLACE_POLICY_UNSATISFIED", "algorithmicSampler.policy", `Unable to satisfy policy '${normalizedPolicy}' with the provided operand ranges.`);
}
