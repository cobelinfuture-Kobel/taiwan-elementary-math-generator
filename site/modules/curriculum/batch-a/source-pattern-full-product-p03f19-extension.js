export * from "./source-pattern-full-product-p03f18-extension.js";
import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p03f18-extension.js";
import {
  G4B_U06_SLICE019_SOURCE_ID,
  G4B_U06_SLICE019_PATTERN_GROUPS,
  G4B_U06_SLICE019_PATTERN_SPEC_IDS,
} from "../registry/g4b-u06-two-decimal-rate-selector-projection.js";
import { P03F19_REQUIRED_CAPABILITY_IDS } from "./two-decimal-rate-runtime-p03f19.js";

const definitions = Object.freeze(Object.fromEntries(G4B_U06_SLICE019_PATTERN_GROUPS.flatMap((group) =>
  group.patternSpecIds.map((patternSpecId) => [patternSpecId, Object.freeze({
    sourceId: G4B_U06_SLICE019_SOURCE_ID,
    title: group.displayName,
    kind: "g4bU06TwoDecimalRateSlice019",
    operation: "decimal_multiply",
    operationFamilyId: "decimal_multiply",
    operationModelId: `op_${patternSpecId}`,
    knowledgePointId: group.primaryKnowledgePointId,
    patternGroupId: group.patternGroupId,
    patternSpecId,
    mode: group.publicQuestionMode.toUpperCase(),
    questionMode: group.publicQuestionMode,
    requestedUnknownRole: patternSpecId.includes("combined") ? "combined" : patternSpecId.includes("rate_distance_context") ? "total" : "product",
    answerType: "decimal",
    canonicalSkillIds: Object.freeze([group.primaryKnowledgePointId]),
    skillTags: Object.freeze([...group.representationTags, G4B_U06_SLICE019_SOURCE_ID]),
    difficultyTags: Object.freeze(["exact_scale_2", "full_product_w3_slice019"]),
    requiredCapabilityIds: P03F19_REQUIRED_CAPABILITY_IDS,
    applicationClassification: group.publicQuestionMode === "application" ? "APPLICATION_REQUIRED" : "APPLICATION_COMPATIBLE",
    globalContextRequired: group.publicQuestionMode === "application",
    sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    numericDomain: Object.freeze({ decimalScale: 2, arithmeticRequired: true, comparisonRequired: false }),
  })]),
)));

export function getBatchABrowserPatternDefinition(id) { return definitions[id] ?? baseGetDefinition(id); }
export function getBatchAPatternSpecIdsForSource(sourceId) {
  const base = baseGetPatternIds(sourceId);
  return sourceId === G4B_U06_SLICE019_SOURCE_ID ? [...new Set([...base, ...G4B_U06_SLICE019_PATTERN_SPEC_IDS])] : base;
}
export function validateP03F19PatternDefinitions() {
  const errors = [];
  for (const id of G4B_U06_SLICE019_PATTERN_SPEC_IDS) {
    const row = definitions[id];
    if (!row) errors.push("P03F19_PATTERN_DEFINITION_MISSING");
    if (JSON.stringify(row?.requiredCapabilityIds) !== JSON.stringify(P03F19_REQUIRED_CAPABILITY_IDS)) errors.push("P03F19_CAPABILITY_SET_INVALID");
    if (row?.globalContextRequired !== (row?.questionMode === "application")) errors.push("P03F19_CONTEXT_MODE_INVALID");
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: Object.keys(definitions).length });
}
