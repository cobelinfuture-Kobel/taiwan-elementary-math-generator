const PATTERN_ID = "ps_g5a_u02_multi_constraint_digit_code";
const SOURCE_PROFILE_ID = "source_1725_reference";
const GENERATED_PROFILE_ID = "generated_unique_code_v1";

const SOURCE_EVIDENCE = "g5a_u02_5a02a1:p2:right-top";

const GENERATED_DOMAIN = Object.freeze({
  min: 1000,
  max: 9999,
  digitCount: 4,
  distinctDigits: true,
  nonzeroThousandsDigit: true,
});

const SOURCE_DOMAIN = Object.freeze({
  min: 1000,
  max: 9999,
  digitCount: 4,
  distinctDigits: false,
  nonzeroThousandsDigit: true,
});

const POSITION_NAMES = Object.freeze(["第一個", "第二個", "第三個", "第四個"]);

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function same(left, right) { return JSON.stringify(left) === JSON.stringify(right); }
function digitsOf(value) { return String(value).padStart(4, "0").split("").map(Number); }

function conditionText(kind, params) {
  switch (kind) {
    case "all_digits_distinct":
      return "四個數字互不重複。";
    case "position_common_factor_and_not_equal":
      return `${POSITION_NAMES[params.position]}數字和${POSITION_NAMES[params.differentFromPosition]}數字不同，且${POSITION_NAMES[params.position]}數字是 ${params.values.join(" 和 ")} 的公因數。`;
    case "position_common_factor_of_values":
      return `${POSITION_NAMES[params.position]}數字是 ${params.values.join(" 和 ")} 的公因數。`;
    case "constant_common_multiple_of_positions":
      return `${params.constant} 是${POSITION_NAMES[params.positions[0]]}數字和${POSITION_NAMES[params.positions[1]]}數字的公倍數。`;
    case "whole_divisible_by_all":
      return `這個四位數同時是 ${params.divisors.join(" 和 ")} 的倍數。`;
    case "digit_offset_relation": {
      const amount = Math.abs(params.offset);
      const relation = params.offset > 0 ? `多 ${amount}` : `少 ${amount}`;
      return `${POSITION_NAMES[params.leftPosition]}數字比${POSITION_NAMES[params.rightPosition]}數字${relation}。`;
    }
    case "digit_sum_equals":
      return `四個數字的和是 ${params.value}。`;
    default:
      throw new Error(`G5AU02_P0_DIGIT_CODE_PROFILE_INVALID:${kind ?? "missing"}`);
  }
}

function makeCondition(conditionId, kind, params) {
  return deepFreeze({ conditionId, kind, params: clone(params), text: conditionText(kind, params) });
}

const SOURCE_CONDITIONS = deepFreeze([
  makeCondition("third_digit_common_factor", "position_common_factor_and_not_equal", {
    position: 2, differentFromPosition: 0, values: [6, 8],
  }),
  makeCondition("second_fourth_have_70_as_common_multiple", "constant_common_multiple_of_positions", {
    constant: 70, positions: [1, 3],
  }),
  makeCondition("first_digit_double_common_factor", "position_common_factor_of_values", {
    position: 0, values: [22, 33, 45, 60],
  }),
  makeCondition("whole_number_multiple_of_3_and_5", "whole_divisible_by_all", {
    divisors: [3, 5],
  }),
  makeCondition("all_digits_distinct", "all_digits_distinct", {}),
]);

const GENERATED_BLUEPRINTS = deepFreeze([
  {
    blueprintId: "generated_2016",
    expectedValue: 2016,
    conditions: [
      makeCondition("g2016_c1", "position_common_factor_of_values", { position: 2, values: [22, 33] }),
      makeCondition("g2016_c2", "constant_common_multiple_of_positions", { constant: 20, positions: [0, 2] }),
      makeCondition("g2016_c3", "whole_divisible_by_all", { divisors: [6, 7] }),
      makeCondition("g2016_c4", "digit_offset_relation", { leftPosition: 0, rightPosition: 1, offset: 2 }),
    ],
  },
  {
    blueprintId: "generated_3012",
    expectedValue: 3012,
    conditions: [
      makeCondition("g3012_c1", "position_common_factor_of_values", { position: 0, values: [45, 60] }),
      makeCondition("g3012_c2", "constant_common_multiple_of_positions", { constant: 20, positions: [2, 3] }),
      makeCondition("g3012_c3", "whole_divisible_by_all", { divisors: [3, 4] }),
      makeCondition("g3012_c4", "digit_offset_relation", { leftPosition: 1, rightPosition: 3, offset: -2 }),
    ],
  },
  {
    blueprintId: "generated_4015",
    expectedValue: 4015,
    conditions: [
      makeCondition("g4015_c1", "position_common_factor_of_values", { position: 2, values: [22, 33] }),
      makeCondition("g4015_c2", "constant_common_multiple_of_positions", { constant: 70, positions: [2, 3] }),
      makeCondition("g4015_c3", "digit_offset_relation", { leftPosition: 0, rightPosition: 3, offset: -1 }),
      makeCondition("g4015_c4", "digit_sum_equals", { value: 10 }),
    ],
  },
  {
    blueprintId: "generated_5014",
    expectedValue: 5014,
    conditions: [
      makeCondition("g5014_c1", "position_common_factor_of_values", { position: 2, values: [22, 33] }),
      makeCondition("g5014_c2", "constant_common_multiple_of_positions", { constant: 35, positions: [0, 2] }),
      makeCondition("g5014_c3", "digit_offset_relation", { leftPosition: 0, rightPosition: 3, offset: 1 }),
      makeCondition("g5014_c4", "digit_sum_equals", { value: 10 }),
    ],
  },
  {
    blueprintId: "generated_6012",
    expectedValue: 6012,
    conditions: [
      makeCondition("g6012_c1", "position_common_factor_of_values", { position: 2, values: [22, 33] }),
      makeCondition("g6012_c2", "constant_common_multiple_of_positions", { constant: 20, positions: [2, 3] }),
      makeCondition("g6012_c3", "whole_divisible_by_all", { divisors: [4, 9] }),
      makeCondition("g6012_c4", "digit_offset_relation", { leftPosition: 1, rightPosition: 2, offset: -1 }),
    ],
  },
  {
    blueprintId: "generated_7012",
    expectedValue: 7012,
    conditions: [
      makeCondition("g7012_c1", "position_common_factor_of_values", { position: 2, values: [22, 33] }),
      makeCondition("g7012_c2", "constant_common_multiple_of_positions", { constant: 35, positions: [0, 2] }),
      makeCondition("g7012_c3", "digit_offset_relation", { leftPosition: 1, rightPosition: 3, offset: -2 }),
      makeCondition("g7012_c4", "digit_sum_equals", { value: 10 }),
    ],
  },
  {
    blueprintId: "generated_8012",
    expectedValue: 8012,
    conditions: [
      makeCondition("g8012_c1", "position_common_factor_of_values", { position: 2, values: [22, 33] }),
      makeCondition("g8012_c2", "constant_common_multiple_of_positions", { constant: 12, positions: [2, 3] }),
      makeCondition("g8012_c3", "digit_offset_relation", { leftPosition: 1, rightPosition: 3, offset: -2 }),
      makeCondition("g8012_c4", "digit_sum_equals", { value: 11 }),
    ],
  },
  {
    blueprintId: "generated_9012",
    expectedValue: 9012,
    conditions: [
      makeCondition("g9012_c1", "position_common_factor_of_values", { position: 2, values: [22, 33] }),
      makeCondition("g9012_c2", "constant_common_multiple_of_positions", { constant: 70, positions: [2, 3] }),
      makeCondition("g9012_c3", "digit_offset_relation", { leftPosition: 1, rightPosition: 3, offset: -2 }),
      makeCondition("g9012_c4", "digit_sum_equals", { value: 12 }),
    ],
  },
]);

const BLUEPRINT_BY_ID = new Map(GENERATED_BLUEPRINTS.map((row) => [row.blueprintId, row]));

function domainAllows(value, domain) {
  if (!Number.isInteger(value) || value < domain.min || value > domain.max) return false;
  const digits = digitsOf(value);
  if (domain.nonzeroThousandsDigit && digits[0] === 0) return false;
  if (domain.distinctDigits && new Set(digits).size !== digits.length) return false;
  return true;
}

function dividesAll(digit, values) {
  return digit > 0 && values.every((value) => value % digit === 0);
}

function conditionMatches(value, digits, condition) {
  const params = condition.params ?? {};
  switch (condition.kind) {
    case "all_digits_distinct": return new Set(digits).size === digits.length;
    case "position_common_factor_and_not_equal":
      return dividesAll(digits[params.position], params.values)
        && digits[params.position] !== digits[params.differentFromPosition];
    case "position_common_factor_of_values":
      return dividesAll(digits[params.position], params.values);
    case "constant_common_multiple_of_positions":
      return params.positions.every((position) => digits[position] > 0 && params.constant % digits[position] === 0);
    case "whole_divisible_by_all":
      return params.divisors.every((divisor) => value % divisor === 0);
    case "digit_offset_relation":
      return digits[params.leftPosition] === digits[params.rightPosition] + params.offset;
    case "digit_sum_equals":
      return digits.reduce((sum, digit) => sum + digit, 0) === params.value;
    default:
      throw new Error(`G5AU02_P0_DIGIT_CODE_PROFILE_INVALID:${condition.kind ?? "missing"}`);
  }
}

export function solveG5AU02DigitCode(candidateDomain, conditions) {
  const solutions = [];
  for (let value = candidateDomain.min; value <= candidateDomain.max; value += 1) {
    if (!domainAllows(value, candidateDomain)) continue;
    const digits = digitsOf(value);
    if (conditions.every((condition) => conditionMatches(value, digits, condition))) {
      solutions.push(deepFreeze({ value, digits }));
    }
  }
  return deepFreeze(solutions);
}

function buildSourceProfile() {
  const solutions = solveG5AU02DigitCode(SOURCE_DOMAIN, SOURCE_CONDITIONS);
  return {
    profileId: SOURCE_PROFILE_ID,
    blueprintId: "source_1725_exact_v1",
    productionAllocation: "reference_only",
    candidateDomain: clone(SOURCE_DOMAIN),
    conditions: clone(SOURCE_CONDITIONS),
    solutionCount: solutions.length,
    conditionRemovalSolutionCounts: SOURCE_CONDITIONS.map((_, index) => solveG5AU02DigitCode(
      SOURCE_DOMAIN,
      SOURCE_CONDITIONS.filter((__, conditionIndex) => conditionIndex !== index),
    ).length),
    sourceReference: {
      sourceProfileId: SOURCE_PROFILE_ID,
      sourceEvidence: SOURCE_EVIDENCE,
      retainedExactly: true,
      defaultAllocationExcluded: true,
    },
    semanticRole: "source_password_reference",
    solution: solutions[0] ?? null,
  };
}

function buildGeneratedProfile(rng) {
  const blueprint = rng.pick(GENERATED_BLUEPRINTS);
  const solutions = solveG5AU02DigitCode(GENERATED_DOMAIN, blueprint.conditions);
  const removalAudits = blueprint.conditions.map((_, index) => {
    const reducedSolutions = solveG5AU02DigitCode(
      GENERATED_DOMAIN,
      blueprint.conditions.filter((__, conditionIndex) => conditionIndex !== index),
    );
    return {
      removedConditionId: blueprint.conditions[index].conditionId,
      solutionCount: reducedSolutions.length,
      retainsSameUniqueSolution: reducedSolutions.length === 1 && reducedSolutions[0].value === blueprint.expectedValue,
    };
  });
  return {
    profileId: GENERATED_PROFILE_ID,
    blueprintId: blueprint.blueprintId,
    productionAllocation: "default_regeneration",
    candidateDomain: clone(GENERATED_DOMAIN),
    conditions: clone(blueprint.conditions),
    solutionCount: solutions.length,
    conditionRemovalSolutionCounts: removalAudits.map((row) => row.solutionCount),
    conditionMinimality: removalAudits,
    sourceReference: {
      sourceProfileId: SOURCE_PROFILE_ID,
      sourceEvidence: SOURCE_EVIDENCE,
      retainedExactly: true,
      separatedFromDefaultAllocation: true,
    },
    semanticRole: "generated_unique_digit_code",
    expectedBlueprintValue: blueprint.expectedValue,
    solution: solutions[0] ?? null,
  };
}

export function isG5AU02S103Pattern(patternSpecId) { return patternSpecId === PATTERN_ID; }

export function generateG5AU02S103Pattern(patternSpecId, rng, options = {}) {
  if (!isG5AU02S103Pattern(patternSpecId)) return null;
  const profileId = options.digitCodeProfileId ?? options.profileId ?? GENERATED_PROFILE_ID;
  let profile;
  if (profileId === SOURCE_PROFILE_ID) profile = buildSourceProfile();
  else if (profileId === GENERATED_PROFILE_ID) profile = buildGeneratedProfile(rng);
  else throw new Error(`G5AU02_P0_DIGIT_CODE_PROFILE_INVALID:${profileId}`);

  const solution = profile.solution;
  const data = {
    profileId: profile.profileId,
    blueprintId: profile.blueprintId,
    productionAllocation: profile.productionAllocation,
    candidateDomain: profile.candidateDomain,
    conditions: profile.conditions,
    solutionCount: profile.solutionCount,
    conditionRemovalSolutionCounts: profile.conditionRemovalSolutionCounts,
    conditionMinimality: profile.conditionMinimality ?? null,
    sourceReference: profile.sourceReference,
    semanticRole: profile.semanticRole,
  };
  return deepFreeze({
    data,
    prompt: profile.profileId === SOURCE_PROFILE_ID
      ? "依照來源題的條件，找出唯一的四位數密碼。"
      : "依照下列條件，找出唯一的四位數密碼。",
    answer: solution ? { digits: clone(solution.digits), value: solution.value } : { digits: [], value: null },
  });
}

export function expectedG5AU02S103Answer(item) {
  const solutions = solveG5AU02DigitCode(item.data.candidateDomain, item.data.conditions);
  if (solutions.length !== 1) return null;
  return { digits: clone(solutions[0].digits), value: solutions[0].value };
}

export function validateG5AU02S103Pattern(item) {
  const errors = [];
  if (!isG5AU02S103Pattern(item?.patternSpecId)) return deepFreeze({ ok: true, errors });
  const data = item.data ?? {};
  if (![SOURCE_PROFILE_ID, GENERATED_PROFILE_ID].includes(data.profileId)) {
    errors.push("G5AU02_P0_DIGIT_CODE_PROFILE_INVALID");
    return deepFreeze({ ok: false, errors });
  }

  const expectedDomain = data.profileId === SOURCE_PROFILE_ID ? SOURCE_DOMAIN : GENERATED_DOMAIN;
  if (!same(data.candidateDomain, expectedDomain)
    || !Array.isArray(data.conditions)
    || data.conditions.length === 0
    || data.conditions.some((condition) => typeof condition?.text !== "string" || condition.text.length === 0)) {
    errors.push("G5AU02_P0_DIGIT_CODE_PROFILE_INVALID");
  }

  if (data.profileId === SOURCE_PROFILE_ID) {
    if (data.productionAllocation !== "reference_only"
      || data.blueprintId !== "source_1725_exact_v1"
      || !same(data.conditions, SOURCE_CONDITIONS)
      || data.sourceReference?.defaultAllocationExcluded !== true) {
      errors.push("G5AU02_P0_SOURCE_REFERENCE_REPEATED_AS_DEFAULT");
    }
  } else {
    const blueprint = BLUEPRINT_BY_ID.get(data.blueprintId);
    if (data.productionAllocation !== "default_regeneration"
      || !blueprint
      || !same(data.conditions, blueprint?.conditions)
      || data.sourceReference?.separatedFromDefaultAllocation !== true) {
      errors.push("G5AU02_P0_DIGIT_CODE_PROFILE_INVALID");
    }
  }

  let solutions = [];
  try {
    solutions = solveG5AU02DigitCode(data.candidateDomain, data.conditions);
  } catch {
    errors.push("G5AU02_P0_DIGIT_CODE_PROFILE_INVALID");
  }
  if (solutions.length !== 1 || data.solutionCount !== 1) {
    errors.push("G5AU02_P0_DIGIT_CODE_NOT_UNIQUE");
  }

  if (solutions.length === 1) {
    const expected = { digits: solutions[0].digits, value: solutions[0].value };
    if (!same(item.answer, expected)) {
      errors.push("G5AU02_P0_DIGIT_CODE_NOT_UNIQUE");
      if (data.profileId === SOURCE_PROFILE_ID) errors.push("G5AU02_DIGIT_TUPLE_NOT_1725");
    }
    if (data.profileId === SOURCE_PROFILE_ID && expected.value !== 1725) {
      errors.push("G5AU02_P0_DIGIT_CODE_PROFILE_INVALID");
    }
  }

  if (data.profileId === GENERATED_PROFILE_ID) {
    const minimality = data.conditions.map((condition, index) => {
      const reduced = solveG5AU02DigitCode(
        data.candidateDomain,
        data.conditions.filter((_, conditionIndex) => conditionIndex !== index),
      );
      return {
        removedConditionId: condition.conditionId,
        solutionCount: reduced.length,
        retainsSameUniqueSolution: solutions.length === 1
          && reduced.length === 1
          && reduced[0].value === solutions[0].value,
      };
    });
    if (minimality.some((row) => row.retainsSameUniqueSolution)
      || !same(data.conditionMinimality, minimality)
      || !same(data.conditionRemovalSolutionCounts, minimality.map((row) => row.solutionCount))) {
      errors.push("G5AU02_P0_DIGIT_CODE_CONDITION_INSUFFICIENT");
    }
  }

  return deepFreeze({ ok: errors.length === 0, errors: [...new Set(errors)] });
}

export function getG5AU02S103ProfileIds() { return [SOURCE_PROFILE_ID, GENERATED_PROFILE_ID]; }
export function getG5AU02S103GeneratedBlueprints() { return GENERATED_BLUEPRINTS; }
export const G5A_U02_S103_SOURCE_PROFILE_ID = SOURCE_PROFILE_ID;
export const G5A_U02_S103_GENERATED_PROFILE_ID = GENERATED_PROFILE_ID;
export const G5A_U02_S103_SOURCE_CONDITIONS = SOURCE_CONDITIONS;
