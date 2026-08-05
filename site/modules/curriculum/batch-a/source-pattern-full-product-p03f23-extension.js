export * from "./source-pattern-full-product-p03f22-extension.js";
import { getBatchABrowserPatternDefinition as baseGet, getBatchAPatternSpecIdsForSource as baseIds } from "./source-pattern-full-product-p03f22-extension.js";
import { G6A_U02_SOURCE_ID, G6A_U02_RECIPROCAL_KP_ID, G6A_U02_RECIPROCAL_GROUP_ID, G6A_U02_RECIPROCAL_SPEC_IDS } from "../registry/g6a-u02-reciprocal-selector-projection.js";
import { P03F23_REQUIRED_CAPABILITY_IDS } from "./g6a-u02-reciprocal-runtime-p03f23.js";
const definitions = Object.freeze(Object.fromEntries(G6A_U02_RECIPROCAL_SPEC_IDS.map((patternSpecId) => [patternSpecId, Object.freeze({
  sourceId: G6A_U02_SOURCE_ID, title: "倒數概念", kind: "g6aU02ReciprocalSlice023", operation: "fraction_reciprocal",
  operationFamilyId: "fraction_reciprocal", operationModelId: "op_g6a_u02_reciprocal_concept",
  knowledgePointId: G6A_U02_RECIPROCAL_KP_ID, patternGroupId: G6A_U02_RECIPROCAL_GROUP_ID, patternSpecId,
  mode: "NUMERIC", questionMode: "numeric", requestedUnknownRole: patternSpecId.includes("identity_missing") ? "identityFactor" : "reciprocal",
  answerType: "fraction", canonicalSkillIds: Object.freeze([G6A_U02_RECIPROCAL_KP_ID]), requiredCapabilityIds: P03F23_REQUIRED_CAPABILITY_IDS,
  applicationClassification: "APPLICATION_COMPATIBLE_BUT_NOT_ADMITTED", globalContextRequired: false,
  sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1", sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
})])));
export function getBatchABrowserPatternDefinition(id) { return definitions[id] ?? baseGet(id); }
export function getBatchAPatternSpecIdsForSource(id) { return id === G6A_U02_SOURCE_ID ? [...G6A_U02_RECIPROCAL_SPEC_IDS] : baseIds(id); }
export function validateP03F23PatternDefinitions() { const errors = []; for (const id of G6A_U02_RECIPROCAL_SPEC_IDS) { if (!definitions[id]) errors.push("P03F23_PATTERN_DEFINITION_MISSING"); if (definitions[id]?.globalContextRequired) errors.push("P03F23_CONTEXT_SCOPE_INVALID"); } return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: Object.keys(definitions).length }); }
