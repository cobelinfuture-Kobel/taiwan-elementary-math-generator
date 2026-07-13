import {
  getG5AU02HiddenPatternSpecById,
  getG5AU02HiddenPatternSpecs,
} from "../../../site/modules/curriculum/batch-b/source-pattern-g5a-u02-extension.js";
import {
  generateAndValidateG5AU02ClassC,
  getG5AU02ClassCPatternIds,
  validateG5AU02ClassC,
} from "./class-c-generator-validator.js";

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
  const item = generateAndValidateG5AU02ClassC(patternSpecId, options);
  return Object.freeze({
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

  const runtimeValidation = validateG5AU02ClassC(item);
  errors.push(...runtimeValidation.errors);
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze([...new Set(errors)]) });
}

export const G5A_U02_CLASS_C_HIDDEN_BINDING_LIFECYCLE = BINDING_LIFECYCLE;
