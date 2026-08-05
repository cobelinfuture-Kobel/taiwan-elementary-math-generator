import { getBatchABrowserPatternDefinition as baseGetDefinition, getBatchAPatternSpecIdsForSource as baseGetPatternIds } from "./source-pattern-full-product-p03f23-extension.js";
import { G3B_U07_SOURCE_ID } from "../registry/g3b-u07-quotient-fraction-selector-projection.js";
import {
  G3B_U07_P03F24_KP_IDS,
  G3B_U07_P03F24_PATTERN_GROUPS,
  G3B_U07_P03F24_PATTERN_SPEC_IDS,
  P03F24_REQUIRED_CAPABILITY_IDS,
  getG3BU07P03F24DefinitionMetadata,
} from "../registry/g3b-u07-fraction-context-selector-projection-p03f24.js";

export { P03F24_REQUIRED_CAPABILITY_IDS };
const groupsBySpec = new Map(G3B_U07_P03F24_PATTERN_GROUPS.flatMap((group) => group.patternSpecIds.map((id) => [id, group])));
const roleFor = (id) => id.includes("_difference_") ? "difference" : id.includes("_original_") ? "original" : id.includes("_total_") ? "total" : "result";
const modeFor = (id) => id.endsWith("_application") ? "APPLICATION" : "NUMERIC";
const givenRolesFor = (role, family) => {
  if (family === "fraction_add_sub") return Object.freeze(["leftNumerator", "leftDenominator", "rightNumerator", "rightDenominator", "operator"]);
  if (role === "total") return Object.freeze(["firstQuantity", "secondQuantity"]);
  if (role === "original") return Object.freeze(["used", "remaining"]);
  return Object.freeze(["larger", "smaller"]);
};

const definitions = Object.freeze(Object.fromEntries(G3B_U07_P03F24_PATTERN_SPEC_IDS.map((patternSpecId) => {
  const group = groupsBySpec.get(patternSpecId);
  const knowledgePointId = group.primaryKnowledgePointId;
  const meta = getG3BU07P03F24DefinitionMetadata(knowledgePointId);
  const mode = modeFor(patternSpecId);
  const requestedUnknownRole = roleFor(patternSpecId);
  const family = meta.operationFamilyId;
  return [patternSpecId, Object.freeze({
    sourceId: G3B_U07_SOURCE_ID,
    title: meta.name,
    kind: family === "fraction_add_sub" ? "g3bU07WholeFractionAddSub" : "g3bU07FractionContextRelation",
    operation: family === "fraction_add_sub" ? "fraction_add_sub" : requestedUnknownRole,
    operationFamilyId: family,
    operationModelId: meta.operationModelId,
    knowledgePointId,
    patternSpecId,
    patternGroupId: group.patternGroupId,
    mode,
    questionMode: mode === "APPLICATION" ? "application" : "numeric",
    requestedUnknownRole,
    givenRoles: givenRolesFor(requestedUnknownRole, family),
    answerType: family === "fraction_add_sub" ? "fraction" : "fraction_measure",
    canonicalExpressions: Object.freeze(family === "fraction_add_sub"
      ? ["result = leftNumerator/leftDenominator ± rightNumerator/rightDenominator"]
      : ["total = firstQuantity + secondQuantity", "original = used + remaining", "difference = larger - smaller"]),
    canonicalSkillIds: Object.freeze([knowledgePointId]),
    skillTags: Object.freeze(["fraction", family, knowledgePointId, G3B_U07_SOURCE_ID]),
    difficultyTags: Object.freeze(["full_product_w3_slice024", mode.toLowerCase(), requestedUnknownRole]),
    requiredCapabilityIds: P03F24_REQUIRED_CAPABILITY_IDS,
    applicationClassification: meta.classification,
    globalContextRequired: mode === "APPLICATION",
    numericDomain: Object.freeze({ denominatorMin: 2, denominatorMax: 12, commonMeasureRequired: true, nonNegativeResultRequired: true }),
    sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
  })];
})));

export function getBatchABrowserPatternDefinition(id) { return definitions[id] ?? baseGetDefinition(id); }
export function getBatchAPatternSpecIdsForSource(sourceId) {
  return sourceId === G3B_U07_SOURCE_ID ? [...new Set([...baseGetPatternIds(sourceId), ...G3B_U07_P03F24_PATTERN_SPEC_IDS])] : baseGetPatternIds(sourceId);
}
export function listP03F24PatternDefinitions() { return G3B_U07_P03F24_PATTERN_SPEC_IDS.map((id) => definitions[id]); }
export function validateP03F24PatternDefinitions() {
  const errors = [];
  if (Object.keys(definitions).length !== 20) errors.push("P03F24_PATTERN_COUNT_INVALID");
  for (const id of G3B_U07_P03F24_PATTERN_SPEC_IDS) {
    const d = definitions[id];
    if (!d || !G3B_U07_P03F24_KP_IDS.includes(d.knowledgePointId)) errors.push(`P03F24_KP_BINDING_INVALID:${id}`);
    if (JSON.stringify(d?.requiredCapabilityIds) !== JSON.stringify(P03F24_REQUIRED_CAPABILITY_IDS)) errors.push(`P03F24_CAPABILITY_SET_INVALID:${id}`);
    if (d?.questionMode === "application" && d.globalContextRequired !== true) errors.push(`P03F24_APPLICATION_CONTEXT_INVALID:${id}`);
    if (!groupsBySpec.has(id)) errors.push(`P03F24_GROUP_BINDING_INVALID:${id}`);
    if (!d?.givenRoles?.length) errors.push(`P03F24_GIVEN_ROLE_INVALID:${id}`);
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: Object.keys(definitions).length });
}
