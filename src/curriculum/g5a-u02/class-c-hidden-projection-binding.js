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
  if (!spec || spec.unitId !== "g5a_u02") {
    throw new Error("G5AU02_HIDDEN_PROJECTION_SPEC_MISSING");
  }
  if (spec.implementationClass !== "C") {
    throw new Error("G5AU02_HIDDEN_PROJECTION_CLASS_D_FORBIDDEN");
  }
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
  CLASS_C_IDS.map((patternSpecId) => {
    const projection = getG5AU02HiddenPatternSpecById(patternSpecId);
    return bindSpec(projection);
  }),
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

function generateS100ClassC(patternSpecId, options = {}) {
  const seed = options.seed ?? 1;
  const generated = generateG5AU02S100Pattern(patternSpecId, createRng(seed));
  if (!generated) throw new Error(`G5AU02_S100_PATTERN_NOT_IMPLEMENTED:${patternSpecId}`);
  return deepFreeze({
    schemaName: "G5AU02ClassCGeneratedItem",
    schemaVersion: 1,
    patternSpecId,
    implementationClass: "C",
    seed,
    prompt: generated.prompt,
    data: clone(generated.data),
    answer: clone(generated.answer),
    lifecycle: G5A_U02_CLASS_C_LIFECYCLE,
    methodParity: {
      task: "G5AU02-S100_P0MethodWitnessLanguageAndReasoningFullFix",
      status: "source_method_structured_runtime",
    },
  });
}

function validateS100ClassC(item) {
  const errors = [];
  if (!item || typeof item !== "object") return Object.freeze({ ok: false, errors: Object.freeze(["G5AU02_ANSWER_SCHEMA_MISMATCH"]) });
  if (!isG5AU02S100Pattern(item.patternSpecId)) errors.push("G5AU02_PATTERN_SPEC_ID_INVALID");
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

  const methodValidation = validateG5AU02S100Pattern(item);
  errors.push(...methodValidation.errors);
  try {
    const expected = expectedG5AU02S100Answer(item);
    if (JSON.stringify(item.answer) !== JSON.stringify(expected)) errors.push(answerMismatchCode(item.patternSpecId));
  } catch {
    errors.push("G5AU02_ANSWER_SCHEMA_MISMATCH");
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
  const projectionClassCIds = projectionSpecs
    .filter((spec) => spec.implementationClass === "C")
    .map((spec) => spec.patternSpecId);
  const projectionClassDIds = projectionSpecs
    .filter((spec) => spec.implementationClass === "D")
    .map((spec) => spec.patternSpecId);
  const errors = [];

  if (projectionSpecs.length !== 22) errors.push("G5AU02_PROJECTION_PATTERN_COUNT_MISMATCH");
  if (projectionClassCIds.length !== 14) errors.push("G5AU02_PROJECTION_CLASS_C_COUNT_MISMATCH");
  if (projectionClassDIds.length !== 8) errors.push("G5AU02_PROJECTION_CLASS_D_COUNT_MISMATCH");
  if (JSON.stringify(projectionClassCIds) !== JSON.stringify(CLASS_C_IDS)) {
    errors.push("G5AU02_PROJECTION_CLASS_C_ID_MISMATCH");
  }

  for (const patternSpecId of CLASS_C_IDS) {
    const projection = getG5AU02HiddenPatternSpecById(patternSpecId);
    try {
      assertProjectionBoundary(projection);
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

export function generateG5AU02ClassCFromHiddenProjection(patternSpecId, options = {}) {
  if (!CLASS_C_SET.has(patternSpecId)) {
    throw new Error(`G5AU02_HIDDEN_PROJECTION_CLASS_C_ID_INVALID:${patternSpecId}`);
  }
  const binding = getG5AU02BoundClassCSpecById(patternSpecId);
  if (!binding) throw new Error(`G5AU02_HIDDEN_PROJECTION_BINDING_MISSING:${patternSpecId}`);
  const item = isG5AU02S100Pattern(patternSpecId)
    ? generateS100ClassC(patternSpecId, options)
    : generateAndValidateG5AU02ClassC(patternSpecId, options);
  const runtimeValidation = isG5AU02S100Pattern(patternSpecId)
    ? validateS100ClassC(item)
    : validateG5AU02ClassC(item);
  if (!runtimeValidation.ok) throw new Error(`G5AU02_GENERATED_ITEM_BLOCKED:${runtimeValidation.errors.join(",")}`);
  return deepFreeze({
    ...item,
    projectionBinding: binding,
  });
}

export function validateG5AU02ClassCFromHiddenProjection(item) {
  const errors = [];
  const binding = item?.projectionBinding;
  if (!binding || !CLASS_C_SET.has(binding.patternSpecId)) {
    errors.push("G5AU02_HIDDEN_PROJECTION_BINDING_MISSING");
  } else {
    const canonicalBinding = getG5AU02BoundClassCSpecById(binding.patternSpecId);
    if (JSON.stringify(binding) !== JSON.stringify(canonicalBinding)) {
      errors.push("G5AU02_HIDDEN_PROJECTION_BINDING_MISMATCH");
    }
    if (binding.patternSpecId !== item.patternSpecId) {
      errors.push("G5AU02_HIDDEN_PROJECTION_PATTERN_ID_MISMATCH");
    }
  }

  const runtimeValidation = isG5AU02S100Pattern(item?.patternSpecId)
    ? validateS100ClassC(item)
    : validateG5AU02ClassC(item);
  errors.push(...runtimeValidation.errors);
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze([...new Set(errors)]) });
}

export const G5A_U02_CLASS_C_HIDDEN_BINDING_LIFECYCLE = BINDING_LIFECYCLE;
