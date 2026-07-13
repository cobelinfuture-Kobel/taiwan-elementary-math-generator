const CLASS_C_PATTERN_IDS = Object.freeze([
  "ps_g5a_u02_factor_relation_equivalence",
  "ps_g5a_u02_factor_enumeration_trial_division",
  "ps_g5a_u02_factor_pair_enumeration",
  "ps_g5a_u02_factor_list_from_pairs",
  "ps_g5a_u02_factor_order_and_symmetry",
  "ps_g5a_u02_missing_factor_reconstruction",
  "ps_g5a_u02_divisor_candidate_selection",
  "ps_g5a_u02_factor_statement_judgement",
  "ps_g5a_u02_problem_type_classification",
  "ps_g5a_u02_complete_factor_list_unknown_values",
  "ps_g5a_u02_complete_factor_list_statement_evaluation",
  "ps_g5a_u02_common_factor_concept_identification",
  "ps_g5a_u02_common_factor_enumeration",
  "ps_g5a_u02_greatest_common_factor",
]);

const CLASS_C_SET = new Set(CLASS_C_PATTERN_IDS);
const LIFECYCLE = Object.freeze({
  unitId: "g5a_u02",
  generatorStatus: "class_c_implemented_hidden",
  validatorStatus: "class_c_blocking_runtime",
  selectorStatus: "hidden",
  canonicalRouting: "disabled",
  productionUse: "forbidden",
  genericFallback: "forbidden",
});

function assertInteger(value, name, min = 1, max = 9999) {
  if (!Number.isInteger(value)) throw new TypeError(`${name} must be an integer`);
  if (value < min || value > max) throw new RangeError(`${name} must be in ${min}..${max}`);
}

function createRng(seed = 1) {
  assertInteger(seed, "seed", 1, 0x7fffffff);
  let state = seed >>> 0;
  return {
    int(min, max) {
      state = (1664525 * state + 1013904223) >>> 0;
      return min + (state % (max - min + 1));
    },
    pick(values) {
      return values[this.int(0, values.length - 1)];
    },
  };
}

function factorsOf(target) {
  assertInteger(target, "target");
  const low = [];
  const high = [];
  for (let divisor = 1; divisor * divisor <= target; divisor += 1) {
    if (target % divisor !== 0) continue;
    low.push(divisor);
    const paired = target / divisor;
    if (paired !== divisor) high.push(paired);
  }
  return [...low, ...high.reverse()];
}

function factorPairsOf(target) {
  return factorsOf(target)
    .filter((value) => value <= target / value)
    .map((value) => [value, target / value]);
}

function gcd(a, b) {
  assertInteger(a, "a");
  assertInteger(b, "b");
  let x = a;
  let y = b;
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

function commonFactorsOf(a, b) {
  return factorsOf(gcd(a, b));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function makeBase(patternSpecId, seed, data, prompt, answer) {
  return Object.freeze({
    schemaName: "G5AU02ClassCGeneratedItem",
    schemaVersion: 1,
    patternSpecId,
    implementationClass: "C",
    seed,
    prompt,
    data: clone(data),
    answer: clone(answer),
    lifecycle: LIFECYCLE,
  });
}

function compositeTarget(rng) {
  const left = rng.int(2, 12);
  const right = rng.int(2, 12);
  return left * right;
}

function generateByPattern(patternSpecId, rng, seed) {
  switch (patternSpecId) {
    case "ps_g5a_u02_factor_relation_equivalence": {
      const target = compositeTarget(rng);
      const isFactor = rng.int(0, 1) === 1;
      const candidateDivisor = isFactor
        ? rng.pick(factorsOf(target))
        : Array.from({ length: 20 }, (_, i) => i + 2).find((value) => target % value !== 0) ?? target + 1;
      const quotient = isFactor ? target / candidateDivisor : null;
      return makeBase(patternSpecId, seed, { target, candidateDivisor }, `${candidateDivisor} 是 ${target} 的因數嗎？`, { target, candidateDivisor, isFactor, quotient });
    }
    case "ps_g5a_u02_factor_enumeration_trial_division":
    case "ps_g5a_u02_factor_list_from_pairs": {
      const target = compositeTarget(rng);
      return makeBase(patternSpecId, seed, { target }, `列出 ${target} 的所有因數。`, { values: factorsOf(target) });
    }
    case "ps_g5a_u02_factor_pair_enumeration": {
      const target = compositeTarget(rng);
      return makeBase(patternSpecId, seed, { target }, `列出乘積為 ${target} 的所有因數配對。`, { pairs: factorPairsOf(target) });
    }
    case "ps_g5a_u02_factor_order_and_symmetry": {
      const target = compositeTarget(rng);
      return makeBase(patternSpecId, seed, { target }, `依序列出 ${target} 的因數及對稱配對。`, { factorList: factorsOf(target), symmetricPairs: factorPairsOf(target) });
    }
    case "ps_g5a_u02_missing_factor_reconstruction": {
      const target = compositeTarget(rng);
      const complete = factorsOf(target);
      const hiddenPosition = rng.int(0, complete.length - 1);
      const visibleValues = complete.map((value, index) => index === hiddenPosition ? null : value);
      return makeBase(patternSpecId, seed, { target, visibleValues, hiddenPositions: [hiddenPosition] }, `補回 ${target} 因數表中的缺漏值。`, { valuesByPosition: { [hiddenPosition]: complete[hiddenPosition] } });
    }
    case "ps_g5a_u02_divisor_candidate_selection": {
      const target = compositeTarget(rng);
      const allFactors = factorsOf(target);
      const candidates = [...new Set([1, ...allFactors.slice(1, 4), target, target + 1, Math.max(2, target - 1)])].sort((a, b) => a - b);
      return makeBase(patternSpecId, seed, { target, candidates }, `從候選數中選出 ${target} 的因數。`, { selectedValues: candidates.filter((value) => target % value === 0) });
    }
    case "ps_g5a_u02_factor_statement_judgement": {
      const target = compositeTarget(rng);
      const candidateDivisor = rng.int(2, 12);
      return makeBase(patternSpecId, seed, { target, candidateDivisor, statementKind: "candidate_is_factor_of_target" }, `判斷：${candidateDivisor} 是 ${target} 的因數。`, { value: target % candidateDivisor === 0 });
    }
    case "ps_g5a_u02_problem_type_classification": {
      const labels = ["factor", "multiple", "common_factor", "common_multiple"];
      const label = rng.pick(labels);
      const contexts = {
        factor: "找出可以整除一個數的數",
        multiple: "找出一個數依序乘上正整數的結果",
        common_factor: "找出同時整除兩個數的數",
        common_multiple: "找出同時是兩個數倍數的數",
      };
      return makeBase(patternSpecId, seed, { contextKind: label }, `這是哪一類問題：${contexts[label]}？`, { label });
    }
    case "ps_g5a_u02_complete_factor_list_unknown_values": {
      const target = compositeTarget(rng);
      const list = factorsOf(target);
      const positions = list.length > 2 ? [1, list.length - 2] : [0];
      const shown = list.map((value, index) => positions.includes(index) ? null : value);
      const inferredValues = Object.fromEntries(positions.map((position) => [`p${position}`, list[position]]));
      return makeBase(patternSpecId, seed, { shownFactorList: shown, unknownKeys: positions.map((position) => `p${position}`) }, "根據完整因數表，求目標數與缺漏值。", { targetNumber: target, inferredValues });
    }
    case "ps_g5a_u02_complete_factor_list_statement_evaluation": {
      const target = compositeTarget(rng);
      const list = factorsOf(target);
      const statements = [
        { kind: "contains_one", value: 1 },
        { kind: "contains_self", value: target },
        { kind: "factor_count_even", value: null },
      ];
      const square = Number.isInteger(Math.sqrt(target));
      return makeBase(patternSpecId, seed, { target, factorList: list, statements }, "判斷關於完整因數表的敘述。", { values: [true, true, !square] });
    }
    case "ps_g5a_u02_common_factor_concept_identification": {
      const a = compositeTarget(rng);
      const b = compositeTarget(rng);
      const candidates = [...new Set([1, ...factorsOf(a).slice(1, 3), ...factorsOf(b).slice(1, 3), gcd(a, b)])].sort((x, y) => x - y);
      return makeBase(patternSpecId, seed, { a, b, candidates }, `選出 ${a} 和 ${b} 的公因數。`, { selectedValues: candidates.filter((value) => a % value === 0 && b % value === 0) });
    }
    case "ps_g5a_u02_common_factor_enumeration": {
      const common = rng.int(2, 10);
      const a = common * rng.int(2, 10);
      const b = common * rng.int(2, 10);
      return makeBase(patternSpecId, seed, { a, b }, `列出 ${a} 和 ${b} 的所有公因數。`, { values: commonFactorsOf(a, b) });
    }
    case "ps_g5a_u02_greatest_common_factor": {
      const common = rng.int(2, 10);
      const a = common * rng.int(2, 10);
      const b = common * rng.int(2, 10);
      return makeBase(patternSpecId, seed, { a, b }, `求 ${a} 和 ${b} 的最大公因數。`, { value: gcd(a, b) });
    }
    default:
      throw new Error(`G5AU02_GENERIC_FALLBACK_FORBIDDEN:${patternSpecId}`);
  }
}

export function generateG5AU02ClassC(patternSpecId, options = {}) {
  if (!CLASS_C_SET.has(patternSpecId)) throw new Error(`G5AU02_PATTERN_SPEC_ID_INVALID:${patternSpecId}`);
  const seed = options.seed ?? 1;
  return generateByPattern(patternSpecId, createRng(seed), seed);
}

function expectedAnswer(item) {
  const { patternSpecId, data } = item;
  switch (patternSpecId) {
    case "ps_g5a_u02_factor_relation_equivalence": {
      const isFactor = data.target % data.candidateDivisor === 0;
      return { target: data.target, candidateDivisor: data.candidateDivisor, isFactor, quotient: isFactor ? data.target / data.candidateDivisor : null };
    }
    case "ps_g5a_u02_factor_enumeration_trial_division":
    case "ps_g5a_u02_factor_list_from_pairs": return { values: factorsOf(data.target) };
    case "ps_g5a_u02_factor_pair_enumeration": return { pairs: factorPairsOf(data.target) };
    case "ps_g5a_u02_factor_order_and_symmetry": return { factorList: factorsOf(data.target), symmetricPairs: factorPairsOf(data.target) };
    case "ps_g5a_u02_missing_factor_reconstruction": {
      const complete = factorsOf(data.target);
      return { valuesByPosition: Object.fromEntries(data.hiddenPositions.map((position) => [position, complete[position]])) };
    }
    case "ps_g5a_u02_divisor_candidate_selection": return { selectedValues: data.candidates.filter((value) => data.target % value === 0) };
    case "ps_g5a_u02_factor_statement_judgement": return { value: data.target % data.candidateDivisor === 0 };
    case "ps_g5a_u02_problem_type_classification": return { label: data.contextKind };
    case "ps_g5a_u02_complete_factor_list_unknown_values": {
      const nonNull = data.shownFactorList.filter((value) => value !== null);
      const targetNumber = Math.max(...nonNull);
      const complete = factorsOf(targetNumber);
      return { targetNumber, inferredValues: Object.fromEntries(data.unknownKeys.map((key) => [key, complete[Number(key.slice(1))]])) };
    }
    case "ps_g5a_u02_complete_factor_list_statement_evaluation": return { values: [true, true, !Number.isInteger(Math.sqrt(data.target))] };
    case "ps_g5a_u02_common_factor_concept_identification": return { selectedValues: data.candidates.filter((value) => data.a % value === 0 && data.b % value === 0) };
    case "ps_g5a_u02_common_factor_enumeration": return { values: commonFactorsOf(data.a, data.b) };
    case "ps_g5a_u02_greatest_common_factor": return { value: gcd(data.a, data.b) };
    default: throw new Error(`G5AU02_GENERIC_FALLBACK_FORBIDDEN:${patternSpecId}`);
  }
}

function validateLifecycle(item, errors) {
  if (item.lifecycle?.unitId !== "g5a_u02" || item.lifecycle?.selectorStatus !== "hidden") errors.push("G5AU02_LIFECYCLE_NOT_HIDDEN");
  if (item.lifecycle?.productionUse !== "forbidden") errors.push("G5AU02_PRODUCTION_USE_FORBIDDEN");
  if (item.lifecycle?.genericFallback !== "forbidden") errors.push("G5AU02_GENERIC_FALLBACK_FORBIDDEN");
}

function validateDomain(item, errors) {
  const numbers = [];
  const visit = (value) => {
    if (Number.isInteger(value)) numbers.push(value);
    else if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === "object") Object.values(value).forEach(visit);
  };
  visit(item.data);
  if (numbers.some((value) => value < 0 || value > 9999)) errors.push("G5AU02_TARGET_OUT_OF_RANGE");
  if (numbers.some((value) => !Number.isInteger(value))) errors.push("G5AU02_NONINTEGER_INPUT");
}

function answerErrorCode(patternSpecId) {
  if (patternSpecId.includes("factor_pair")) return "G5AU02_FACTOR_PAIR_PRODUCT_MISMATCH";
  if (patternSpecId.includes("common_factor")) return "G5AU02_COMMON_FACTOR_NONCOMMON_INCLUDED";
  if (patternSpecId.includes("greatest_common_factor")) return "G5AU02_GCF_NOT_MAXIMUM";
  if (patternSpecId.includes("factor_relation")) return "G5AU02_FACTOR_QUOTIENT_WITNESS_INVALID";
  if (patternSpecId.includes("missing_factor")) return "G5AU02_MISSING_FACTOR_POSITION_INVALID";
  if (patternSpecId.includes("statement")) return "G5AU02_BOOLEAN_TRUTH_VALUE_INVALID";
  if (patternSpecId.includes("problem_type")) return "G5AU02_PROBLEM_TYPE_NOT_ALLOWED";
  if (patternSpecId.includes("selection")) return "G5AU02_SELECTION_SET_INCOMPLETE";
  return "G5AU02_FACTOR_SET_INCOMPLETE";
}

export function validateG5AU02ClassC(item) {
  const errors = [];
  if (!item || typeof item !== "object") return { ok: false, errors: ["G5AU02_ANSWER_SCHEMA_MISMATCH"] };
  if (!CLASS_C_SET.has(item.patternSpecId)) errors.push("G5AU02_PATTERN_SPEC_ID_INVALID");
  if (item.implementationClass !== "C") errors.push("G5AU02_MAPPING_ID_INVALID");
  validateLifecycle(item, errors);
  validateDomain(item, errors);
  if (errors.length === 0) {
    try {
      const expected = expectedAnswer(item);
      if (!deepEqual(item.answer, expected)) errors.push(answerErrorCode(item.patternSpecId));
    } catch {
      errors.push("G5AU02_ANSWER_SCHEMA_MISMATCH");
    }
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze([...new Set(errors)]) });
}

export function generateAndValidateG5AU02ClassC(patternSpecId, options = {}) {
  const item = generateG5AU02ClassC(patternSpecId, options);
  const validation = validateG5AU02ClassC(item);
  if (!validation.ok) throw new Error(`G5AU02_GENERATED_ITEM_BLOCKED:${validation.errors.join(",")}`);
  return item;
}

export function getG5AU02ClassCPatternIds() {
  return [...CLASS_C_PATTERN_IDS];
}

export const G5A_U02_CLASS_C_LIFECYCLE = LIFECYCLE;
