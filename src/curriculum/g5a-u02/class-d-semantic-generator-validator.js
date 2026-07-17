import {
  expectedG5AU02S101Answer,
  generateG5AU02S101Pattern,
  isG5AU02S101Pattern,
  validateG5AU02S101Pattern,
} from "./s101-representation-runtime.js";

const CLASS_D_PATTERN_IDS = Object.freeze([
  "ps_g5a_u02_equal_partition_all_segment_counts",
  "ps_g5a_u02_equal_partition_range_constrained_recipients",
  "ps_g5a_u02_remainder_transfer",
  "ps_g5a_u02_maximum_equal_grouping",
  "ps_g5a_u02_possible_equal_packaging_counts",
  "ps_g5a_u02_rectangle_square_side_lengths",
  "ps_g5a_u02_square_tile_area_possibilities",
  "ps_g5a_u02_multi_constraint_digit_code",
]);
const CLASS_D_SET = new Set(CLASS_D_PATTERN_IDS);

const LIFECYCLE = Object.freeze({
  unitId: "g5a_u02",
  generatorStatus: "class_d_semantic_implemented_hidden",
  validatorStatus: "class_d_blocking_runtime",
  selectorStatus: "hidden",
  canonicalRouting: "disabled",
  productionUse: "forbidden",
  genericFallback: "forbidden",
  freeFormAI: "forbidden",
});

const TEMPLATE_BY_PATTERN = Object.freeze({
  ps_g5a_u02_equal_partition_all_segment_counts: "tpl_g5a_u02_equal_partition_segments",
  ps_g5a_u02_equal_partition_range_constrained_recipients: "tpl_g5a_u02_range_recipients",
  ps_g5a_u02_remainder_transfer: "tpl_g5a_u02_remainder_transfer",
  ps_g5a_u02_maximum_equal_grouping: "tpl_g5a_u02_maximum_equal_grouping",
  ps_g5a_u02_possible_equal_packaging_counts: "tpl_g5a_u02_possible_equal_packaging",
  ps_g5a_u02_rectangle_square_side_lengths: "tpl_g5a_u02_rectangle_square_sides",
  ps_g5a_u02_square_tile_area_possibilities: "tpl_g5a_u02_square_tile_areas",
  ps_g5a_u02_multi_constraint_digit_code: "tpl_g5a_u02_source_password",
});

function assertInteger(value, name, min = 0, max = 9999) {
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
    pick(values) { return values[this.int(0, values.length - 1)]; },
  };
}

function factorsOf(value) {
  assertInteger(value, "value", 1);
  const result = [];
  for (let candidate = 1; candidate <= value; candidate += 1) {
    if (value % candidate === 0) result.push(candidate);
  }
  return result;
}

function gcd(a, b) {
  let left = a;
  let right = b;
  while (right !== 0) [left, right] = [right, left % right];
  return left;
}

function commonFactorsOf(a, b) { return factorsOf(gcd(a, b)); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function deepEqual(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

function makeItem(patternSpecId, seed, data, prompt, answer) {
  return Object.freeze({
    schemaName: "G5AU02ClassDSemanticGeneratedItem",
    schemaVersion: 1,
    patternSpecId,
    implementationClass: "D",
    templateFamilyId: TEMPLATE_BY_PATTERN[patternSpecId],
    seed,
    prompt,
    data: clone(data),
    answer: clone(answer),
    lifecycle: LIFECYCLE,
    representationParity: isG5AU02S101Pattern(patternSpecId) ? {
      task: "G5AU02-S101_P0PartitionAndGeometryRepresentationFullFix",
      status: "structured_bounded_representation",
    } : null,
  });
}

function pairedQuantities(rng) {
  const common = rng.int(2, 10);
  return [common * rng.int(2, 9), common * rng.int(2, 9)];
}

function generateByPattern(patternSpecId, rng, seed) {
  if (isG5AU02S101Pattern(patternSpecId)) {
    const generated = generateG5AU02S101Pattern(patternSpecId, rng);
    return makeItem(patternSpecId, seed, generated.data, generated.prompt, generated.answer);
  }

  switch (patternSpecId) {
    case "ps_g5a_u02_equal_partition_range_constrained_recipients": {
      const total = rng.int(4, 12) * rng.int(2, 8);
      const minRecipients = 2;
      const maxRecipients = Math.min(total, 12);
      const values = factorsOf(total).filter((value) => value >= minRecipients && value <= maxRecipients);
      return makeItem(patternSpecId, seed, {
        total, minRecipients, maxRecipients, unitLabel: "人", semanticRole: "equal_partition_range",
      }, `${total} 個物品平均分給 ${minRecipients} 到 ${maxRecipients} 人，每人同樣多且沒有剩下。可能有幾人？`, {
        values, unitLabel: "人",
      });
    }
    case "ps_g5a_u02_remainder_transfer": {
      const smallerDivisor = rng.int(2, 8);
      const multiplier = rng.int(2, 5);
      const largerDivisor = smallerDivisor * multiplier;
      const remainder = rng.int(0, smallerDivisor - 1);
      const quotient = rng.int(2, 12);
      const dividend = quotient * largerDivisor + remainder;
      return makeItem(patternSpecId, seed, {
        dividend, largerDivisor, smallerDivisor, multiplier, knownRemainder: remainder, semanticRole: "remainder_transfer",
      }, `${dividend} 除以 ${largerDivisor} 餘 ${remainder}。因為 ${largerDivisor} 是 ${smallerDivisor} 的倍數，${dividend} 除以 ${smallerDivisor} 的餘數是多少？`, {
        remainder, smallerDivisor,
      });
    }
    case "ps_g5a_u02_maximum_equal_grouping": {
      const [red, blue] = pairedQuantities(rng);
      return makeItem(patternSpecId, seed, {
        red, blue, unitLabel: "組", semanticRole: "maximum_equal_grouping",
      }, `${red} 個紅球和 ${blue} 個藍球要分成最多組，每組紅球數相同、藍球數也相同。最多可分成幾組？`, {
        value: gcd(red, blue),
      });
    }
    case "ps_g5a_u02_possible_equal_packaging_counts": {
      const [quantityA, quantityB] = pairedQuantities(rng);
      return makeItem(patternSpecId, seed, {
        quantityA, quantityB, unitLabel: "盒", semanticRole: "possible_equal_packaging",
      }, `${quantityA} 個甲物品和 ${quantityB} 個乙物品分裝成若干盒，每盒兩類物品的數量分別相同且全部用完。可能裝成幾盒？`, {
        values: commonFactorsOf(quantityA, quantityB), unitLabel: "盒",
      });
    }
    case "ps_g5a_u02_multi_constraint_digit_code":
      return makeItem(patternSpecId, seed, {
        predicates: ["四位數", "四個數字互不相同", "千位為1", "百位為7", "十位為2", "個位為5"],
        sourceSolution: 1725,
        semanticRole: "source_password",
      }, "依照來源題的定位條件，找出唯一的四位數密碼。", {
        digits: [1, 7, 2, 5], value: 1725,
      });
    default:
      throw new Error(`G5AU02_GENERIC_FALLBACK_FORBIDDEN:${patternSpecId}`);
  }
}

export function generateG5AU02ClassD(patternSpecId, options = {}) {
  if (!CLASS_D_SET.has(patternSpecId)) throw new Error(`G5AU02_PATTERN_SPEC_ID_INVALID:${patternSpecId}`);
  const seed = options.seed ?? 1;
  return generateByPattern(patternSpecId, createRng(seed), seed);
}

function expectedAnswer(item) {
  if (isG5AU02S101Pattern(item.patternSpecId)) return expectedG5AU02S101Answer(item);
  const data = item.data;
  switch (item.patternSpecId) {
    case "ps_g5a_u02_equal_partition_range_constrained_recipients":
      return { values: factorsOf(data.total).filter((value) => value >= data.minRecipients && value <= data.maxRecipients), unitLabel: "人" };
    case "ps_g5a_u02_remainder_transfer":
      return { remainder: data.dividend % data.smallerDivisor, smallerDivisor: data.smallerDivisor };
    case "ps_g5a_u02_maximum_equal_grouping":
      return { value: gcd(data.red, data.blue) };
    case "ps_g5a_u02_possible_equal_packaging_counts":
      return { values: commonFactorsOf(data.quantityA, data.quantityB), unitLabel: "盒" };
    case "ps_g5a_u02_multi_constraint_digit_code":
      return { digits: [1, 7, 2, 5], value: 1725 };
    default:
      throw new Error(`G5AU02_GENERIC_FALLBACK_FORBIDDEN:${item.patternSpecId}`);
  }
}

function legacyAnswerMismatchCode(patternSpecId) {
  if (patternSpecId.includes("remainder")) return "G5AU02_REMAINDER_NOT_REDUCED";
  if (patternSpecId.includes("maximum_equal_grouping")) return "G5AU02_GCF_NOT_MAXIMUM";
  if (patternSpecId.includes("packaging") || patternSpecId.includes("equal_partition")) return "G5AU02_EQUAL_PARTITION_NONDIVISOR";
  if (patternSpecId.includes("rectangle")) return "G5AU02_RECTANGLE_SIDE_NOT_COMMON_DIVISOR";
  if (patternSpecId.includes("square_tile")) return "G5AU02_SQUARE_AREA_NOT_SIDE_SQUARED";
  if (patternSpecId.includes("digit_code")) return "G5AU02_DIGIT_TUPLE_NOT_1725";
  return "G5AU02_ANSWER_SCHEMA_MISMATCH";
}

export function validateG5AU02ClassD(item) {
  const errors = [];
  if (!item || typeof item !== "object") return { ok: false, errors: ["G5AU02_ANSWER_SCHEMA_MISMATCH"] };
  if (!CLASS_D_SET.has(item.patternSpecId)) errors.push("G5AU02_PATTERN_SPEC_ID_INVALID");
  if (item.implementationClass !== "D") errors.push("G5AU02_MAPPING_ID_INVALID");
  if (item.templateFamilyId !== TEMPLATE_BY_PATTERN[item.patternSpecId]) errors.push("G5AU02_CONTROLLED_TEMPLATE_REQUIRED");
  if (!item.data?.semanticRole) errors.push("G5AU02_TEMPLATE_ROLE_MISSING");
  if (item.lifecycle?.selectorStatus !== "hidden" || item.lifecycle?.canonicalRouting !== "disabled") errors.push("G5AU02_LIFECYCLE_NOT_HIDDEN");
  if (item.lifecycle?.productionUse !== "forbidden") errors.push("G5AU02_PRODUCTION_USE_FORBIDDEN");
  if (item.lifecycle?.genericFallback !== "forbidden") errors.push("G5AU02_GENERIC_FALLBACK_FORBIDDEN");
  if (item.lifecycle?.freeFormAI !== "forbidden") errors.push("G5AU02_FREE_FORM_AI_FORBIDDEN");

  if (errors.length === 0) {
    try {
      if (item.patternSpecId === "ps_g5a_u02_remainder_transfer") {
        if (item.data.largerDivisor % item.data.smallerDivisor !== 0) errors.push("G5AU02_REMAINDER_DIVISOR_RELATION_INVALID");
        if (item.data.knownRemainder >= item.data.smallerDivisor) errors.push("G5AU02_REMAINDER_RANGE_INVALID");
      }

      const expected = expectedAnswer(item);
      const answerMismatch = !deepEqual(item.answer, expected);
      if (isG5AU02S101Pattern(item.patternSpecId)) {
        errors.push(...validateG5AU02S101Pattern(item).errors);
        if (answerMismatch) errors.push(legacyAnswerMismatchCode(item.patternSpecId));
      } else if (answerMismatch) {
        errors.push(legacyAnswerMismatchCode(item.patternSpecId));
      }
    } catch {
      errors.push("G5AU02_ANSWER_SCHEMA_MISMATCH");
    }
  }

  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze([...new Set(errors)]) });
}

export function generateAndValidateG5AU02ClassD(patternSpecId, options = {}) {
  const item = generateG5AU02ClassD(patternSpecId, options);
  const validation = validateG5AU02ClassD(item);
  if (!validation.ok) throw new Error(`G5AU02_GENERATED_ITEM_BLOCKED:${validation.errors.join(",")}`);
  return item;
}

export function getG5AU02ClassDPatternIds() { return [...CLASS_D_PATTERN_IDS]; }
export const G5A_U02_CLASS_D_LIFECYCLE = LIFECYCLE;
