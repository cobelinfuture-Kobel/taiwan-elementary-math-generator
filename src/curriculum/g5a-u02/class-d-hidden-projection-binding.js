import {
  getG5AU02HiddenPatternSpecById,
  getG5AU02HiddenPatternSpecs,
} from "../../../site/modules/curriculum/batch-b/source-pattern-g5a-u02-extension.js";
import {
  generateAndValidateG5AU02ClassD,
  getG5AU02ClassDPatternIds,
  validateG5AU02ClassD,
} from "./class-d-semantic-generator-validator.js";

const CLASS_D_IDS = Object.freeze(getG5AU02ClassDPatternIds());
const CLASS_D_SET = new Set(CLASS_D_IDS);
const S101_ANSWER_MODEL_BY_PATTERN = Object.freeze({
  ps_g5a_u02_equal_partition_all_segment_counts: "partitionPairListAnswer",
  ps_g5a_u02_square_tile_area_possibilities: "tileSideAreaPairListAnswer",
});

const BINDING_LIFECYCLE = Object.freeze({
  unitId: "g5a_u02",
  bindingStatus: "class_d_runtime_bound_hidden",
  selectorStatus: "hidden",
  canonicalRouting: "disabled",
  productionUse: "forbidden",
  genericFallback: "forbidden",
  freeFormAI: "forbidden",
});

function assertProjectionBoundary(spec) {
  if (!spec || spec.unitId !== "g5a_u02") throw new Error("G5AU02_HIDDEN_PROJECTION_SPEC_MISSING");
  if (spec.implementationClass !== "D") throw new Error("G5AU02_HIDDEN_PROJECTION_CLASS_C_FORBIDDEN");
  if (spec.selectorStatus !== "hidden" || spec.canonicalRouting !== "disabled") throw new Error("G5AU02_HIDDEN_PROJECTION_LIFECYCLE_INVALID");
  if (spec.productionUse !== "forbidden" || spec.genericFallback !== "forbidden") throw new Error("G5AU02_HIDDEN_PROJECTION_PRODUCTION_FORBIDDEN");
  if (!Array.isArray(spec.templateFamilyIds) || spec.templateFamilyIds.length !== 1) throw new Error("G5AU02_HIDDEN_PROJECTION_TEMPLATE_FAMILY_INVALID");
}

function bindSpec(spec) {
  assertProjectionBoundary(spec);
  return Object.freeze({
    patternSpecId: spec.patternSpecId,
    formalMappingId: spec.formalMappingId,
    sourceMappingCandidateId: spec.sourceMappingCandidateId,
    patternGroupId: spec.patternGroupId,
    knowledgePointId: spec.knowledgePointId,
    mode: spec.mode,
    answerModelId: S101_ANSWER_MODEL_BY_PATTERN[spec.patternSpecId] ?? spec.answerModel.shape,
    implementationClass: spec.implementationClass,
    templateFamilyIds: Object.freeze([...spec.templateFamilyIds]),
    sourceEvidence: Object.freeze([...spec.sourceEvidence]),
    patternOrder: spec.patternOrder,
    qaOverlayRefs: Object.freeze([...spec.qaOverlayRefs]),
    lifecycle: BINDING_LIFECYCLE,
  });
}

const BOUND_CLASS_D_SPECS = Object.freeze(CLASS_D_IDS.map((patternSpecId) => bindSpec(getG5AU02HiddenPatternSpecById(patternSpecId))));
const BOUND_BY_ID = new Map(BOUND_CLASS_D_SPECS.map((spec) => [spec.patternSpecId, spec]));

export function getG5AU02BoundClassDSpecs() { return BOUND_CLASS_D_SPECS; }
export function getG5AU02BoundClassDSpecById(patternSpecId) { return BOUND_BY_ID.get(patternSpecId) ?? null; }

export function auditG5AU02ClassDHiddenProjectionBinding() {
  const projectionSpecs = getG5AU02HiddenPatternSpecs();
  const classCIds = projectionSpecs.filter((spec) => spec.implementationClass === "C").map((spec) => spec.patternSpecId);
  const classDIds = projectionSpecs.filter((spec) => spec.implementationClass === "D").map((spec) => spec.patternSpecId);
  const errors = [];
  if (projectionSpecs.length !== 22) errors.push("G5AU02_PROJECTION_PATTERN_COUNT_MISMATCH");
  if (classCIds.length !== 14) errors.push("G5AU02_PROJECTION_CLASS_C_COUNT_MISMATCH");
  if (classDIds.length !== 8) errors.push("G5AU02_PROJECTION_CLASS_D_COUNT_MISMATCH");
  if (JSON.stringify(classDIds) !== JSON.stringify(CLASS_D_IDS)) errors.push("G5AU02_PROJECTION_CLASS_D_ID_MISMATCH");
  for (const patternSpecId of CLASS_D_IDS) {
    const projection = getG5AU02HiddenPatternSpecById(patternSpecId);
    try {
      assertProjectionBoundary(projection);
      const binding = getG5AU02BoundClassDSpecById(patternSpecId);
      if (binding.templateFamilyIds[0] !== projection.templateFamilyIds[0]) errors.push("G5AU02_PROJECTION_TEMPLATE_FAMILY_MISMATCH");
      if (S101_ANSWER_MODEL_BY_PATTERN[patternSpecId] && binding.answerModelId !== S101_ANSWER_MODEL_BY_PATTERN[patternSpecId]) errors.push("G5AU02_S101_ANSWER_MODEL_BINDING_MISMATCH");
    } catch (error) { errors.push(error.message); }
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze([...new Set(errors)]), totalProjectionCount: projectionSpecs.length, unboundClassCCount: classCIds.length, boundClassDCount: BOUND_CLASS_D_SPECS.length });
}

export function generateG5AU02ClassDFromHiddenProjection(patternSpecId, options = {}) {
  if (!CLASS_D_SET.has(patternSpecId)) throw new Error(`G5AU02_HIDDEN_PROJECTION_CLASS_D_ID_INVALID:${patternSpecId}`);
  const binding = getG5AU02BoundClassDSpecById(patternSpecId);
  if (!binding) throw new Error(`G5AU02_HIDDEN_PROJECTION_BINDING_MISSING:${patternSpecId}`);
  const item = generateAndValidateG5AU02ClassD(patternSpecId, options);
  if (item.templateFamilyId !== binding.templateFamilyIds[0]) throw new Error(`G5AU02_HIDDEN_PROJECTION_TEMPLATE_FAMILY_MISMATCH:${patternSpecId}`);
  return Object.freeze({ ...item, projectionBinding: binding });
}

export function validateG5AU02ClassDFromHiddenProjection(item) {
  const errors = [];
  const binding = item?.projectionBinding;
  if (!binding || !CLASS_D_SET.has(binding.patternSpecId)) errors.push("G5AU02_HIDDEN_PROJECTION_BINDING_MISSING");
  else {
    const canonicalBinding = getG5AU02BoundClassDSpecById(binding.patternSpecId);
    if (JSON.stringify(binding) !== JSON.stringify(canonicalBinding)) errors.push("G5AU02_HIDDEN_PROJECTION_BINDING_MISMATCH");
    if (binding.patternSpecId !== item.patternSpecId) errors.push("G5AU02_HIDDEN_PROJECTION_PATTERN_ID_MISMATCH");
    if (binding.templateFamilyIds[0] !== item.templateFamilyId) errors.push("G5AU02_HIDDEN_PROJECTION_TEMPLATE_FAMILY_MISMATCH");
  }
  const runtimeValidation = validateG5AU02ClassD(item);
  errors.push(...runtimeValidation.errors);
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze([...new Set(errors)]) });
}

export const G5A_U02_CLASS_D_HIDDEN_BINDING_LIFECYCLE = BINDING_LIFECYCLE;
