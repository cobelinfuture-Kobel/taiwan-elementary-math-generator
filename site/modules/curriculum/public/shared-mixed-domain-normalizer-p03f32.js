export const SHARED_MIXED_DOMAIN_NORMALIZER_VERSION = "shared-mixed-domain-normalizer-p03f32-v1";

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

export function parseExactDecimal(value) {
  const text = String(value ?? "").trim();
  if (!/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(text)) throw new Error("MIXED_DOMAIN_DECIMAL_INVALID");
  const [whole, fraction = ""] = text.split(".");
  const scale = fraction.length;
  const coefficient = BigInt(`${whole}${fraction}`);
  const denominator = 10n ** BigInt(scale);
  const rational = reduce(coefficient, denominator);
  return Object.freeze({
    domain: "DECIMAL",
    canonicalText: text,
    coefficient,
    scale,
    rational,
    canonicalRationalIdentity: rationalIdentity(rational),
  });
}

export function parseExactFraction(value) {
  if (!value || typeof value !== "object") throw new Error("MIXED_DOMAIN_FRACTION_INVALID");
  if (!Number.isSafeInteger(value.numerator) || !Number.isSafeInteger(value.denominator)) {
    throw new Error("MIXED_DOMAIN_FRACTION_INVALID");
  }
  if (value.numerator < 0 || value.denominator <= 0) throw new Error("MIXED_DOMAIN_FRACTION_INVALID");
  const rational = reduce(BigInt(value.numerator), BigInt(value.denominator));
  return Object.freeze({
    domain: "FRACTION",
    numerator: BigInt(value.numerator),
    denominator: BigInt(value.denominator),
    rational,
    canonicalRationalIdentity: rationalIdentity(rational),
  });
}

function terminatingDecimalFromRational(rational) {
  const reduced = reduce(rational.numerator, rational.denominator);
  let remainder = reduced.denominator;
  let twos = 0;
  let fives = 0;
  while (remainder % 2n === 0n) {
    remainder /= 2n;
    twos += 1;
  }
  while (remainder % 5n === 0n) {
    remainder /= 5n;
    fives += 1;
  }
  if (remainder !== 1n) throw new Error("MIXED_DOMAIN_NON_TERMINATING_DECIMAL");

  let scale = Math.max(twos, fives);
  let coefficient = reduced.numerator;
  if (twos < scale) coefficient *= 2n ** BigInt(scale - twos);
  if (fives < scale) coefficient *= 5n ** BigInt(scale - fives);

  while (scale > 0 && coefficient % 10n === 0n) {
    coefficient /= 10n;
    scale -= 1;
  }

  const digits = coefficient.toString();
  const canonicalText = scale === 0
    ? digits
    : digits.length <= scale
      ? `0.${"0".repeat(scale - digits.length)}${digits}`
      : `${digits.slice(0, digits.length - scale)}.${digits.slice(digits.length - scale)}`;

  return Object.freeze({ coefficient, scale, canonicalText });
}

export function exactDecimalToFraction(value) {
  const source = parseExactDecimal(value);
  const reduced = source.rational;
  return Object.freeze({
    ok: true,
    action: "TO_FRACTION",
    sourceDomain: "DECIMAL",
    targetDomain: "FRACTION",
    sourceCanonicalValue: Object.freeze({
      canonicalText: source.canonicalText,
      coefficient: source.coefficient.toString(),
      scale: source.scale,
    }),
    canonicalValue: Object.freeze({
      numerator: assertSafe(reduced.numerator),
      denominator: assertSafe(reduced.denominator),
    }),
    canonicalRationalIdentity: source.canonicalRationalIdentity,
    exact: true,
  });
}

export function exactFractionToDecimal(value) {
  const source = parseExactFraction(value);
  const decimal = terminatingDecimalFromRational(source.rational);
  return Object.freeze({
    ok: true,
    action: "TO_DECIMAL",
    sourceDomain: "FRACTION",
    targetDomain: "DECIMAL",
    sourceCanonicalValue: Object.freeze({
      numerator: assertSafe(source.rational.numerator),
      denominator: assertSafe(source.rational.denominator),
    }),
    canonicalValue: Object.freeze({
      canonicalText: decimal.canonicalText,
      coefficient: decimal.coefficient.toString(),
      scale: decimal.scale,
    }),
    canonicalRationalIdentity: source.canonicalRationalIdentity,
    termination: "TERMINATING_BASE10",
    exact: true,
  });
}

export function exactMixedDomainEquivalence({ leftDomain, leftValue, rightDomain, rightValue }) {
  if (leftDomain === rightDomain) throw new Error("MIXED_DOMAIN_CROSS_DOMAIN_REQUIRED");
  const left = leftDomain === "DECIMAL" ? parseExactDecimal(leftValue) : parseExactFraction(leftValue);
  const right = rightDomain === "DECIMAL" ? parseExactDecimal(rightValue) : parseExactFraction(rightValue);
  return Object.freeze({
    ok: true,
    action: "EQUIVALENCE",
    equivalent: left.rational.numerator * right.rational.denominator === right.rational.numerator * left.rational.denominator,
    exact: true,
  });
}

export function exactMixedDomainCompare({ leftDomain, leftValue, rightDomain, rightValue }) {
  if (leftDomain === rightDomain) throw new Error("MIXED_DOMAIN_CROSS_DOMAIN_REQUIRED");
  const left = leftDomain === "DECIMAL" ? parseExactDecimal(leftValue) : parseExactFraction(leftValue);
  const right = rightDomain === "DECIMAL" ? parseExactDecimal(rightValue) : parseExactFraction(rightValue);
  const leftCross = left.rational.numerator * right.rational.denominator;
  const rightCross = right.rational.numerator * left.rational.denominator;
  const relation = leftCross < rightCross ? "LESS_THAN" : leftCross > rightCross ? "GREATER_THAN" : "EQUAL";
  return Object.freeze({ ok: true, action: "COMPARE", relation, exact: true });
}

export function executeSharedMixedDomainNormalization(request = {}) {
  try {
    if (request.action === "TO_FRACTION" && request.sourceDomain === "DECIMAL") {
      return exactDecimalToFraction(request.value);
    }
    if (request.action === "TO_DECIMAL" && request.sourceDomain === "FRACTION") {
      return exactFractionToDecimal(request.value);
    }
    if (request.action === "EQUIVALENCE") return exactMixedDomainEquivalence(request);
    if (request.action === "COMPARE") return exactMixedDomainCompare(request);
    return Object.freeze({ ok: false, blocked: true, errors: ["MIXED_DOMAIN_ACTION_INVALID"] });
  } catch (error) {
    return Object.freeze({ ok: false, blocked: true, errors: [error instanceof Error ? error.message : String(error)] });
  }
}
