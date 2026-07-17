const S102_PATTERN_IDS = Object.freeze([
  "ps_g5a_u02_common_factor_enumeration",
  "ps_g5a_u02_greatest_common_factor",
]);

const S102_PATTERN_SET = new Set(S102_PATTERN_IDS);

const NONDEGENERATE_MULTIPLIER_PAIRS = Object.freeze([
  Object.freeze([2, 3]),
  Object.freeze([3, 4]),
  Object.freeze([4, 5]),
  Object.freeze([4, 6]),
  Object.freeze([5, 6]),
  Object.freeze([6, 8]),
  Object.freeze([6, 9]),
  Object.freeze([7, 8]),
  Object.freeze([8, 9]),
  Object.freeze([8, 10]),
  Object.freeze([9, 10]),
  Object.freeze([10, 12]),
]);

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function same(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

function factorsOf(value) {
  if (!Number.isInteger(value) || value < 1) throw new RangeError("value must be a positive integer");
  const low = [];
  const high = [];
  for (let divisor = 1; divisor * divisor <= value; divisor += 1) {
    if (value % divisor !== 0) continue;
    low.push(divisor);
    const paired = value / divisor;
    if (paired !== divisor) high.push(paired);
  }
  return [...low, ...high.reverse()];
}

function gcd(a, b) {
  let left = a;
  let right = b;
  while (right !== 0) [left, right] = [right, left % right];
  return left;
}

function commonFactorsOf(a, b) {
  return factorsOf(gcd(a, b));
}

function intersection(left, right) {
  const rightSet = new Set(right);
  return left.filter((value) => rightSet.has(value));
}

function sampleNondegeneratePair(rng) {
  const commonBase = rng.int(2, 10);
  const selected = rng.pick(NONDEGENERATE_MULTIPLIER_PAIRS);
  const reverse = rng.int(0, 1) === 1;
  const multipliers = reverse ? [selected[1], selected[0]] : selected;
  const a = commonBase * multipliers[0];
  const b = commonBase * multipliers[1];
  const factorSetA = factorsOf(a);
  const factorSetB = factorsOf(b);
  const commonFactors = intersection(factorSetA, factorSetB);
  return deepFreeze({
    a,
    b,
    factorSetA,
    factorSetB,
    commonFactors,
    greatestCommonFactor: commonFactors.at(-1),
    samplingProfileId: "nontrivial_common_factor_pair_v1",
  });
}

function operandsAreNondegenerate(data) {
  if (!Number.isInteger(data?.a) || !Number.isInteger(data?.b) || data.a < 1 || data.b < 1) return false;
  if (data.a === data.b) return false;
  const greatest = gcd(data.a, data.b);
  if (greatest < 2 || greatest >= Math.min(data.a, data.b)) return false;
  return !same(factorsOf(data.a), factorsOf(data.b));
}

function expectedWitness(data) {
  const factorSetA = factorsOf(data.a);
  const factorSetB = factorsOf(data.b);
  const commonFactors = intersection(factorSetA, factorSetB);
  return {
    factorSetA,
    factorSetB,
    commonFactors,
    greatestCommonFactor: commonFactors.at(-1),
  };
}

export function isG5AU02S102Pattern(patternSpecId) {
  return S102_PATTERN_SET.has(patternSpecId);
}

export function getG5AU02S102PatternIds() {
  return [...S102_PATTERN_IDS];
}

export function generateG5AU02S102Pattern(patternSpecId, rng) {
  if (!isG5AU02S102Pattern(patternSpecId)) return null;
  const sampled = sampleNondegeneratePair(rng);
  const baseData = {
    a: sampled.a,
    b: sampled.b,
    factorSetA: clone(sampled.factorSetA),
    factorSetB: clone(sampled.factorSetB),
    commonFactors: clone(sampled.commonFactors),
    greatestCommonFactor: sampled.greatestCommonFactor,
    samplingProfileId: sampled.samplingProfileId,
  };

  if (patternSpecId === "ps_g5a_u02_common_factor_enumeration") {
    return deepFreeze({
      prompt: `先列出 ${sampled.a} 和 ${sampled.b} 的完整因數集合，再利用交集找出所有公因數。`,
      data: {
        ...baseData,
        semanticRole: "parallel_factor_sets_with_intersection",
      },
      answer: {
        values: clone(sampled.commonFactors),
      },
    });
  }

  return deepFreeze({
    prompt: `先列出 ${sampled.a} 和 ${sampled.b} 的完整因數集合與所有公因數，再由公因數集合找出最大公因數。`,
    data: {
      ...baseData,
      semanticRole: "common_factor_set_with_gcf",
    },
    answer: {
      commonFactors: clone(sampled.commonFactors),
      greatestCommonFactor: sampled.greatestCommonFactor,
    },
  });
}

export function expectedG5AU02S102Answer(item) {
  const witness = expectedWitness(item?.data ?? {});
  if (item?.patternSpecId === "ps_g5a_u02_common_factor_enumeration") {
    return deepFreeze({ values: witness.commonFactors });
  }
  if (item?.patternSpecId === "ps_g5a_u02_greatest_common_factor") {
    return deepFreeze({
      commonFactors: witness.commonFactors,
      greatestCommonFactor: witness.greatestCommonFactor,
    });
  }
  throw new Error(`G5AU02_S102_PATTERN_NOT_IMPLEMENTED:${item?.patternSpecId ?? "missing"}`);
}

export function validateG5AU02S102Pattern(item) {
  const errors = [];
  if (!isG5AU02S102Pattern(item?.patternSpecId)) return deepFreeze({ ok: true, errors });

  const data = item.data ?? {};
  const enumeration = item.patternSpecId === "ps_g5a_u02_common_factor_enumeration";
  const degeneracyCode = enumeration
    ? "G5AU02_P0_COMMON_FACTOR_OPERANDS_DEGENERATE"
    : "G5AU02_P0_GCF_OPERANDS_DEGENERATE";
  const witnessCode = enumeration
    ? "G5AU02_P0_FACTOR_SET_WITNESS_MISSING"
    : "G5AU02_P0_GCF_COMMON_SET_MISSING";

  if (!operandsAreNondegenerate(data)) errors.push(degeneracyCode);

  try {
    const expected = expectedWitness(data);
    if (!same(data.factorSetA, expected.factorSetA) || !same(data.factorSetB, expected.factorSetB)) {
      errors.push(witnessCode);
    }
    if (!same(data.commonFactors, expected.commonFactors)) {
      errors.push(enumeration
        ? "G5AU02_P0_COMMON_FACTOR_INTERSECTION_MISMATCH"
        : "G5AU02_P0_GCF_COMMON_SET_MISSING");
    }

    if (enumeration) {
      if (!same(item.answer, { values: expected.commonFactors })) {
        errors.push("G5AU02_P0_COMMON_FACTOR_INTERSECTION_MISMATCH");
      }
    } else {
      if (data.greatestCommonFactor !== expected.greatestCommonFactor) {
        errors.push("G5AU02_P0_GCF_NOT_MAXIMUM");
      }
      if (!same(item.answer?.commonFactors, expected.commonFactors)) {
        errors.push("G5AU02_P0_GCF_COMMON_SET_MISSING");
      }
      if (item.answer?.greatestCommonFactor !== expected.greatestCommonFactor) {
        errors.push("G5AU02_P0_GCF_NOT_MAXIMUM");
      }
    }
  } catch {
    errors.push("G5AU02_ANSWER_SCHEMA_MISMATCH");
  }

  return deepFreeze({ ok: errors.length === 0, errors: [...new Set(errors)] });
}

export const G5A_U02_S102_COMMON_FACTOR_LIFECYCLE = deepFreeze({
  task: "G5AU02-S102_P0NontrivialCommonFactorSamplingAndWitnessFullFix",
  status: "nondegenerate_sampling_and_factor_set_witness_runtime",
  samplingProfileId: "nontrivial_common_factor_pair_v1",
  genericFallback: "forbidden",
  freeFormAI: "forbidden",
});
