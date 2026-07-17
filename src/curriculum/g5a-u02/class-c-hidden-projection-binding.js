import {
  getG5AU02HiddenPatternSpecById,
  getG5AU02HiddenPatternSpecs,
} from "../../../site/modules/curriculum/batch-b/source-pattern-g5a-u02-extension.js";
import {
  G5A_U02_CLASS_C_LIFECYCLE,
  generateAndValidateG5AU02ClassC,
  getG5AU02ClassCPatternIds,
  validateG5AU02ClassC,
} from "./class-c-generator-validator.js";
import {
  expectedG5AU02S100Answer,
  generateG5AU02S100Pattern,
  isG5AU02S100Pattern,
  validateG5AU02S100Pattern,
} from "./s100-method-runtime.js";
import {
  expectedG5AU02S102Answer,
  generateG5AU02S102Pattern,
  isG5AU02S102Pattern,
  validateG5AU02S102Pattern,
} from "./s102-common-factor-runtime.js";
import {
  expectedG5AU02S106Answer,
  generateG5AU02S106Pattern,
  isG5AU02S106Pattern,
  validateG5AU02S106Pattern,
} from "./s106-factor-structure-runtime.js";
import {
  expectedG5AU02S107Answer,
  generateG5AU02S107Pattern,
  isG5AU02S107Pattern,
  validateG5AU02S107Pattern,
} from "./s107-selection-symbolic-common-runtime.js";

const CLASS_C_IDS = Object.freeze(getG5AU02ClassCPatternIds());
const CLASS_C_SET = new Set(CLASS_C_IDS);

const BINDING_LIFECYCLE = Object.freeze({
  unitId: "g5a_u02",
  bindingStatus: "class_c_runtime_bound_hidden",
  selectorStatus: "hidden",
  canonicalRouting: "disabled",
  productionUse: "forbidden",
  genericFallback: "forbidden",
});

function assertProjectionBoundary(spec) {
  if (!spec || spec.unitId !== "g5a_u02") throw new Error("G5AU02_HIDDEN_PROJECTION_SPEC_MISSING");
  if (spec.implementationClass !== "C") throw new Error("G5AU02_HIDDEN_PROJECTION_CLASS_D_FORBIDDEN");
  if (spec.selectorStatus !== "hidden" || spec.canonicalRouting !== "disabled") {
    throw new Error("G5AU02_HIDDEN_PROJECTION_LIFECYCLE_INVALID");
  }
  if (spec.productionUse !== "forbidden" || spec.genericFallback !== "forbidden") {
    throw new Error("G5AU02_HIDDEN_PROJECTION_PRODUCTION_FORBIDDEN");
  }
}

function bindSpec(spec) {
  assertProjectionBoundary(spec);
  return Object.freeze({
    patternSpecId: spec.patternSpecId,
    formalMappingId: spec.formalMappingId,
    patternGroupId: spec.patternGroupId,
    knowledgePointId: spec.knowledgePointId,
    mode: spec.mode,
    answerModelId: spec.answerModel.shape,
    implementationClass: spec.implementationClass,
    sourceEvidence: Object.freeze([...spec.sourceEvidence]),
    qaOverlayRefs: Object.freeze([...spec.qaOverlayRefs]),
    lifecycle: BINDING_LIFECYCLE,
  });
}

const BOUND_CLASS_C_SPECS = Object.freeze(
  CLASS_C_IDS.map((patternSpecId) => bindSpec(getG5AU02HiddenPatternSpecById(patternSpecId))),
);
const BOUND_BY_ID = new Map(BOUND_CLASS_C_SPECS.map((spec) => [spec.patternSpecId, spec]));

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createRng(seed) {
  if (!Number.isInteger(seed) || seed < 1 || seed > 0x7fffffff) throw new RangeError("seed must be in 1..2147483647");
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

function answerMismatchCode(patternSpecId) {
  if (patternSpecId === "ps_g5a_u02_factor_relation_equivalence") return "G5AU02_FACTOR_QUOTIENT_WITNESS_INVALID";
  if (patternSpecId === "ps_g5a_u02_factor_statement_judgement"
    || patternSpecId === "ps_g5a_u02_complete_factor_list_statement_evaluation") return "G5AU02_BOOLEAN_TRUTH_VALUE_INVALID";
  if (patternSpecId === "ps_g5a_u02_problem_type_classification") return "G5AU02_PROBLEM_TYPE_NOT_ALLOWED";
  return "G5AU02_FACTOR_SET_INCOMPLETE";
}

function s106AnswerMismatchCode(patternSpecId) {
  if (patternSpecId === "ps_g5a_u02_factor_pair_enumeration") return "G5AU02_P1_FACTOR_PAIR_PRODUCT_MISMATCH";
  if (patternSpecId === "ps_g5a_u02_factor_order_and_symmetry") return "G5AU02_P1_U_RECORD_LINK_MISMATCH";
  return "G5AU02_P1_MISSING_FACTOR_NOT_UNIQUE";
}

function s107AnswerMismatchCode(patternSpecId) {
  if (patternSpecId === "ps_g5a_u02_divisor_candidate_selection") return "G5AU02_P1_CANDIDATE_DIVISIBILITY_MISMATCH";
  if (patternSpecId === "ps_g5a_u02_complete_factor_list_unknown_values") return "G5AU02_P1_SYMBOLIC_SOLUTION_NOT_UNIQUE";
  return "G5AU02_P1_COMMON_FACTOR_MARKING_MISMATCH";
}

function makeSpecialClassCItem(patternSpecId, options, generated, parityField, parityTask, parityStatus) {
  if (!generated) throw new Error(`G5AU02_SPECIAL_PATTERN_NOT_IMPLEMENTED:${patternSpecId}`);
  return deepFreeze({
    schemaName: "G5AU02ClassCGeneratedItem",
    schemaVersion: 1,
    patternSpecId,
    implementationClass: "C",
    seed: options.seed ?? 1,
    prompt: generated.prompt,
    data: clone(generated.data),
    answer: clone(generated.answer),
    lifecycle: G5A_U02_CLASS_C_LIFECYCLE,
    [parityField]: {
      task: parityTask,
      status: parityStatus,
    },
  });
}

function generateS100ClassC(patternSpecId, options = {}) {
  const seed = options.seed ?? 1;
  return makeSpecialClassCItem(
    patternSpecId,
    options,
    generateG5AU02S100Pattern(patternSpecId, createRng(seed)),
    "methodParity",
    "G5AU02-S100_P0MethodWitnessLanguageAndReasoningFullFix",
    "source_method_structured_runtime",
  );
}

function generateS102ClassC(patternSpecId, options = {}) {
  const seed = options.seed ?? 1;
  return makeSpecialClassCItem(
    patternSpecId,
    options,
    generateG5AU02S102Pattern(patternSpecId, createRng(seed)),
    "commonFactorParity",
    "G5AU02-S102_P0NontrivialCommonFactorSamplingAndWitnessFullFix",
    "nondegenerate_factor_set_witness_runtime",
  );
}

function generateS106ClassC(patternSpecId, options = {}) {
  const seed = options.seed ?? 1;
  return makeSpecialClassCItem(
    patternSpecId,
    options,
    generateG5AU02S106Pattern(patternSpecId, createRng(seed)),
    "p1FactorStructureParity",
    "G5AU02-S106_P1FactorPairSymmetryAndMaskedTableFullFix",
    "factor_search_symmetry_masked_table_runtime",
  );
}

function generateS107ClassC(patternSpecId, options = {}) {
  const seed = options.seed ?? 1;
  return makeSpecialClassCItem(
    patternSpecId,
    options,
    generateG5AU02S107Pattern(patternSpecId, createRng(seed)),
    "p1SelectionSymbolicCommonParity",
    "G5AU02-S107_P1CandidateSymbolicRelationAndCommonFactorMarkingFullFix",
    "candidate_symbolic_common_marking_runtime",
  );
}

function validateSpecialBase(item, isPattern, errors) {
  if (!item || typeof item !== "object") {
    errors.push("G5AU02_ANSWER_SCHEMA_MISMATCH");
    return;
  }
  if (!isPattern(item.patternSpecId)) errors.push("G5AU02_PATTERN_SPEC_ID_INVALID");
  if (item.schemaName !== "G5AU02ClassCGeneratedItem" || item.implementationClass !== "C") errors.push("G5AU02_MAPPING_ID_INVALID");
  if (JSON.stringify(item.lifecycle) !== JSON.stringify(G5A_U02_CLASS_C_LIFECYCLE)) errors.push("G5AU02_LIFECYCLE_NOT_HIDDEN");
  if (typeof item.prompt !== "string" || item.prompt.length === 0) errors.push("G5AU02_VISIBLE_PROMPT_REQUIRED");
  const numbers = [];
  const visit = (value) => {
    if (Number.isInteger(value)) numbers.push(value);
    else if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === "object") Object.values(value).forEach(visit);
  };
  visit(item.data);
  if (numbers.some((value) => value < 0 || value > 9999)) errors.push("G5AU02_TARGET_OUT_OF_RANGE");
}

function validateS100ClassC(item) {
  const errors = [];
  validateSpecialBase(item, isG5AU02S100Pattern, errors);
  if (errors.length === 0) {
    errors.push(...validateG5AU02S100Pattern(item).errors);
    try {
      if (JSON.stringify(item.answer) !== JSON.stringify(expectedG5AU02S100Answer(item))) {
        errors.push(answerMismatchCode(item.patternSpecId));
      }
    } catch {
      errors.push("G5AU02_ANSWER_SCHEMA_MISMATCH");
    }
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze([...new Set(errors)]) });
}

function validateS102ClassC(item) {
  const errors = [];
  validateSpecialBase(item, isG5AU02S102Pattern, errors);
  if (errors.length === 0) {
    errors.push(...validateG5AU02S102Pattern(item).errors);
    try {
      const expected = expectedG5AU02S102Answer(item);
      if (JSON.stringify(item.answer) !== JSON.stringify(expected)) {
        if (item.patternSpecId === "ps_g5a_u02_common_factor_enumeration") {
          errors.push("G5AU02_P0_COMMON_FACTOR_INTERSECTION_MISMATCH");
        } else {
          if (JSON.stringify(item.answer?.commonFactors) !== JSON.stringify(expected.commonFactors)) {
            errors.push("G5AU02_P0_GCF_COMMON_SET_MISSING");
          }
          if (item.answer?.greatestCommonFactor !== expected.greatestCommonFactor) {
            errors.push("G5AU02_P0_GCF_NOT_MAXIMUM");
          }
        }
      }
    } catch {
      errors.push("G5AU02_ANSWER_SCHEMA_MISMATCH");
    }
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze([...new Set(errors)]) });
}

function validateS106ClassC(item) {
  const errors = [];
  validateSpecialBase(item, isG5AU02S106Pattern, errors);
  if (errors.length === 0) {
    errors.push(...validateG5AU02S106Pattern(item).errors);
    try {
      if (JSON.stringify(item.answer) !== JSON.stringify(expectedG5AU02S106Answer(item))) {
        errors.push(s106AnswerMismatchCode(item.patternSpecId));
      }
    } catch {
      errors.push("G5AU02_ANSWER_SCHEMA_MISMATCH");
    }
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze([...new Set(errors)]) });
}

function validateS107ClassC(item) {
  const errors = [];
  validateSpecialBase(item, isG5AU02S107Pattern, errors);
  if (errors.length === 0) {
    errors.push(...validateG5AU02S107Pattern(item).errors);
    try {
      if (JSON.stringify(item.answer) !== JSON.stringify(expectedG5AU02S107Answer(item))) errors.push(s107AnswerMismatchCode(item.patternSpecId));
    } catch {
      errors.push("G5AU02_ANSWER_SCHEMA_MISMATCH");
    }
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze([...new Set(errors)]) });
}

export function getG5AU02BoundClassCSpecs() {
  return BOUND_CLASS_C_SPECS;
}

export function getG5AU02BoundClassCSpecById(patternSpecId) {
  return BOUND_BY_ID.get(patternSpecId) ?? null;
}

export function auditG5AU02ClassCHiddenProjectionBinding() {
  const projectionSpecs = getG5AU02HiddenPatternSpecs();
  const projectionClassCIds = projectionSpecs.filter((spec) => spec.implementationClass === "C").map((spec) => spec.patternSpecId);
  const projectionClassDIds = projectionSpecs.filter((spec) => spec.implementationClass === "D").map((spec) => spec.patternSpecId);
  const errors = [];
  if (projectionSpecs.length !== 22) errors.push("G5AU02_PROJECTION_PATTERN_COUNT_MISMATCH");
  if (projectionClassCIds.length !== 14) errors.push("G5AU02_PROJECTION_CLASS_C_COUNT_MISMATCH");
  if (projectionClassDIds.length !== 8) errors.push("G5AU02_PROJECTION_CLASS_D_COUNT_MISMATCH");
  if (JSON.stringify(projectionClassCIds) !== JSON.stringify(CLASS_C_IDS)) errors.push("G5AU02_PROJECTION_CLASS_C_ID_MISMATCH");
  for (const patternSpecId of CLASS_C_IDS) {
    try {
      assertProjectionBoundary(getG5AU02HiddenPatternSpecById(patternSpecId));
    } catch (error) {
      errors.push(error.message);
    }
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze([...new Set(errors)]),
    totalProjectionCount: projectionSpecs.length,
    boundClassCCount: BOUND_CLASS_C_SPECS.length,
    unboundClassDCount: projectionClassDIds.length,
  });
}

function generateRuntimeItem(patternSpecId, options) {
  if (isG5AU02S107Pattern(patternSpecId)) return generateS107ClassC(patternSpecId, options);
  if (isG5AU02S106Pattern(patternSpecId)) return generateS106ClassC(patternSpecId, options);
  if (isG5AU02S100Pattern(patternSpecId)) return generateS100ClassC(patternSpecId, options);
  if (isG5AU02S102Pattern(patternSpecId)) return generateS102ClassC(patternSpecId, options);
  return generateAndValidateG5AU02ClassC(patternSpecId, options);
}

function validateRuntimeItem(item) {
  if (isG5AU02S107Pattern(item?.patternSpecId)) return validateS107ClassC(item);
  if (isG5AU02S106Pattern(item?.patternSpecId)) return validateS106ClassC(item);
  if (isG5AU02S100Pattern(item?.patternSpecId)) return validateS100ClassC(item);
  if (isG5AU02S102Pattern(item?.patternSpecId)) return validateS102ClassC(item);
  return validateG5AU02ClassC(item);
}

export function generateG5AU02ClassCFromHiddenProjection(patternSpecId, options = {}) {
  if (!CLASS_C_SET.has(patternSpecId)) throw new Error(`G5AU02_HIDDEN_PROJECTION_CLASS_C_ID_INVALID:${patternSpecId}`);
  const binding = getG5AU02BoundClassCSpecById(patternSpecId);
  if (!binding) throw new Error(`G5AU02_HIDDEN_PROJECTION_BINDING_MISSING:${patternSpecId}`);
  const item = generateRuntimeItem(patternSpecId, options);
  const runtimeValidation = validateRuntimeItem(item);
  if (!runtimeValidation.ok) throw new Error(`G5AU02_GENERATED_ITEM_BLOCKED:${runtimeValidation.errors.join(",")}`);
  return deepFreeze({ ...item, projectionBinding: binding });
}

export function validateG5AU02ClassCFromHiddenProjection(item) {
  const errors = [];
  const binding = item?.projectionBinding;
  if (!binding || !CLASS_C_SET.has(binding.patternSpecId)) {
    errors.push("G5AU02_HIDDEN_PROJECTION_BINDING_MISSING");
  } else {
    const canonicalBinding = getG5AU02BoundClassCSpecById(binding.patternSpecId);
    if (JSON.stringify(binding) !== JSON.stringify(canonicalBinding)) errors.push("G5AU02_HIDDEN_PROJECTION_BINDING_MISMATCH");
    if (binding.patternSpecId !== item.patternSpecId) errors.push("G5AU02_HIDDEN_PROJECTION_PATTERN_ID_MISMATCH");
  }
  errors.push(...validateRuntimeItem(item).errors);
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze([...new Set(errors)]) });
}

export const G5A_U02_CLASS_C_HIDDEN_BINDING_LIFECYCLE = BINDING_LIFECYCLE;
