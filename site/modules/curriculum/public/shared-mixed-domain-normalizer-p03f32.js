export const SHARED_MIXED_DOMAIN_NORMALIZER_VERSION = "shared-mixed-domain-normalizer-p03f32-v2";

const MAX_SAFE_BIGINT = BigInt(Number.MAX_SAFE_INTEGER);

function gcdBigInt(a, b) {
  let left = a < 0n ? -a : a;
  let right = b < 0n ? -b : b;
  while (right !== 0n) {
    const remainder = left % right;
    left = right;
    right = remainder;
  }
  return left === 0n ? 1n : left;
}

function reduce(numerator, denominator) {
  if (denominator === 0n) throw new Error("MIXED_DOMAIN_DENOMINATOR_ZERO");
  if (numerator < 0n || denominator < 0n) throw new Error("MIXED_DOMAIN_NEGATIVE_NOT_ALLOWED");
  const divisor = gcdBigInt(numerator, denominator);
  return Object.freeze({ numerator: numerator / divisor, denominator: denominator / divisor });
}

function rationalIdentity(value) {
  const normalized = reduce(value.numerator, value.denominator);
  return `${normalized.numerator}/${normalized.denominator}`;
}

function assertSafe(value) {
  if (value < 0n || value > MAX_SAFE_BIGINT) throw new Error("MIXED_DOMAIN_RESULT_OVERFLOW");
  return Number(value);
}

function decimalText(coefficient, scale) {
  const digits = coefficient.toString();
  if (scale === 0) return digits;
  const padded = digits.padStart(scale + 1, "0");
  const split = padded.length - scale;
  return `${padded.slice(0, split)}.${padded.slice(split)}`;
}

function fractionCanonical(rational) {
  const reduced = reduce(rational.numerator, rational.denominator);
  const numerator = assertSafe(reduced.numerator);
  const denominator = assertSafe(reduced.denominator);
  const wholeNumber = reduced.numerator / reduced.denominator;
  const remainder = reduced.numerator % reduced.denominator;
  const magnitudeClass = reduced.numerator === 0n
    ? "ZERO"
    : reduced.denominator === 1n
      ? "WHOLE_NUMBER"
      : reduced.numerator < reduced.denominator
        ? "PROPER_FRACTION"
        : "IMPROPER_FRACTION";
  return Object.freeze({
    numericDomainId:"NON_NEGATIVE_RATIONAL",
    valueForm:"REDUCED_IMPROPER_FRACTION",
    numerator,
    denominator,
    mixedProjection:Object.freeze({
      wholeNumber:assertSafe(wholeNumber),
      numerator:assertSafe(remainder),
      denominator,
    }),
    magnitudeClass,
    isReduced:true,
    exact:true,
  });
}

function decimalCanonical(coefficientInput, scaleInput, inputScale = scaleInput) {
  let coefficient = coefficientInput;
  let scale = scaleInput;
  if (coefficient === 0n) {
    scale = 0;
  } else {
    while (scale > 0 && coefficient % 10n === 0n) {
      coefficient /= 10n;
      scale -= 1;
    }
  }
  const canonicalText = decimalText(coefficient, scale);
  const [wholeNumberText, fractionalDigits = ""] = canonicalText.split(".");
  const magnitudeClass = coefficient === 0n ? "ZERO" : scale === 0 ? "WHOLE_NUMBER" : "DECIMAL_FRACTION";
  return Object.freeze({
    numericDomainId:"NON_NEGATIVE_DECIMAL",
    valueForm:"NORMALIZED_BASE10_COEFFICIENT_SCALE",
    coefficient:coefficient.toString(),
    scale,
    canonicalText,
    wholeNumberText,
    fractionalDigits,
    magnitudeClass,
    base:10,
    trailingZerosRemoved:inputScale - scale,
    exact:true,
  });
}

export function parseExactDecimal(value) {
  const text = String(value ?? "").trim();
  if (!/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(text)) throw new Error("MIXED_DOMAIN_DECIMAL_INVALID");
  const [whole, fraction = ""] = text.split(".");
  const inputScale = fraction.length;
  const rawCoefficient = BigInt(`${whole}${fraction}`);
  const canonical = decimalCanonical(rawCoefficient, inputScale, inputScale);
  const rational = reduce(BigInt(canonical.coefficient), 10n ** BigInt(canonical.scale));
  return Object.freeze({
    domain:"DECIMAL",
    canonicalText:canonical.canonicalText,
    coefficient:BigInt(canonical.coefficient),
    scale:canonical.scale,
    rational,
    canonical,
    canonicalRationalIdentity:rationalIdentity(rational),
  });
}

export function parseExactFraction(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("MIXED_DOMAIN_FRACTION_INVALID");
  if (!Number.isSafeInteger(value.numerator) || !Number.isSafeInteger(value.denominator)) throw new Error("MIXED_DOMAIN_FRACTION_INVALID");
  if (value.numerator < 0 || value.denominator <= 0) throw new Error("MIXED_DOMAIN_FRACTION_INVALID");
  const rational = reduce(BigInt(value.numerator), BigInt(value.denominator));
  return Object.freeze({
    domain:"FRACTION",
    numerator:BigInt(value.numerator),
    denominator:BigInt(value.denominator),
    rational,
    canonical:fractionCanonical(rational),
    canonicalRationalIdentity:rationalIdentity(rational),
  });
}

function terminatingDecimalFromRational(rational) {
  const reduced = reduce(rational.numerator, rational.denominator);
  let remainder = reduced.denominator;
  let factorTwoCount = 0;
  let factorFiveCount = 0;
  while (remainder % 2n === 0n) { remainder /= 2n; factorTwoCount += 1; }
  while (remainder % 5n === 0n) { remainder /= 5n; factorFiveCount += 1; }
  if (remainder !== 1n) throw new Error("MIXED_DOMAIN_NON_TERMINATING_DECIMAL");

  const scale = Math.max(factorTwoCount, factorFiveCount);
  let coefficient = reduced.numerator;
  if (factorTwoCount < scale) coefficient *= 2n ** BigInt(scale - factorTwoCount);
  if (factorFiveCount < scale) coefficient *= 5n ** BigInt(scale - factorFiveCount);
  const canonical = decimalCanonical(coefficient, scale, scale);
  return Object.freeze({
    canonical,
    factorTwoCount,
    factorFiveCount,
  });
}

export function exactDecimalToFraction(value) {
  const source = parseExactDecimal(value);
  const reduced = source.rational;
  return Object.freeze({
    ok:true,
    action:"TO_FRACTION",
    sourceDomain:"DECIMAL",
    targetDomain:"FRACTION",
    sourceCanonicalValue:source.canonical,
    canonicalValue:fractionCanonical(reduced),
    canonicalRationalIdentity:source.canonicalRationalIdentity,
    exact:true,
  });
}

export function exactFractionToDecimal(value) {
  const source = parseExactFraction(value);
  const decimal = terminatingDecimalFromRational(source.rational);
  return Object.freeze({
    ok:true,
    action:"TO_DECIMAL",
    sourceDomain:"FRACTION",
    targetDomain:"DECIMAL",
    sourceCanonicalValue:source.canonical,
    canonicalValue:decimal.canonical,
    canonicalRationalIdentity:source.canonicalRationalIdentity,
    termination:Object.freeze({
      factorTwoCount:decimal.factorTwoCount,
      factorFiveCount:decimal.factorFiveCount,
      canonicalScale:decimal.canonical.scale,
    }),
    exact:true,
  });
}

export function exactMixedDomainEquivalence({ leftDomain, leftValue, rightDomain, rightValue }) {
  if (leftDomain === rightDomain) throw new Error("MIXED_DOMAIN_CROSS_DOMAIN_REQUIRED");
  const left = leftDomain === "DECIMAL" ? parseExactDecimal(leftValue) : parseExactFraction(leftValue);
  const right = rightDomain === "DECIMAL" ? parseExactDecimal(rightValue) : parseExactFraction(rightValue);
  const comparison = left.rational.numerator * right.rational.denominator - right.rational.numerator * left.rational.denominator;
  return Object.freeze({
    ok:true,
    action:"EQUIVALENCE",
    equivalent:comparison === 0n,
    leftCanonicalValue:left.canonical,
    rightCanonicalValue:right.canonical,
    leftCanonicalRationalIdentity:left.canonicalRationalIdentity,
    rightCanonicalRationalIdentity:right.canonicalRationalIdentity,
    exact:true,
  });
}

export function exactMixedDomainCompare({ leftDomain, leftValue, rightDomain, rightValue }) {
  if (leftDomain === rightDomain) throw new Error("MIXED_DOMAIN_CROSS_DOMAIN_REQUIRED");
  const left = leftDomain === "DECIMAL" ? parseExactDecimal(leftValue) : parseExactFraction(leftValue);
  const right = rightDomain === "DECIMAL" ? parseExactDecimal(rightValue) : parseExactFraction(rightValue);
  const leftCross = left.rational.numerator * right.rational.denominator;
  const rightCross = right.rational.numerator * left.rational.denominator;
  const comparison = leftCross < rightCross ? -1 : leftCross > rightCross ? 1 : 0;
  const relation = comparison < 0 ? "LESS_THAN" : comparison > 0 ? "GREATER_THAN" : "EQUAL";
  return Object.freeze({
    ok:true,
    action:"COMPARE",
    comparison,
    relation,
    leftCanonicalValue:left.canonical,
    rightCanonicalValue:right.canonical,
    leftCanonicalRationalIdentity:left.canonicalRationalIdentity,
    rightCanonicalRationalIdentity:right.canonicalRationalIdentity,
    exact:true,
  });
}

export function executeSharedMixedDomainNormalization(request = {}) {
  try {
    if (request.action === "TO_FRACTION" && request.sourceDomain === "DECIMAL") return exactDecimalToFraction(request.value);
    if (request.action === "TO_DECIMAL" && request.sourceDomain === "FRACTION") return exactFractionToDecimal(request.value);
    if (request.action === "EQUIVALENCE") return exactMixedDomainEquivalence(request);
    if (request.action === "COMPARE") return exactMixedDomainCompare(request);
    return Object.freeze({ ok:false, blocked:true, errors:["MIXED_DOMAIN_ACTION_INVALID"] });
  } catch (error) {
    return Object.freeze({ ok:false, blocked:true, errors:[error instanceof Error ? error.message : String(error)] });
  }
}
