
import { getBatchABrowserPatternDefinition as baseGetDefinition, getBatchAPatternSpecIdsForSource as baseGetPatternIds } from "./source-pattern-full-product-p03f5-extension.js";
import { G3A_U08_SOURCE_ID } from "../registry/g3a-u08-part-whole-fraction-selector-projection.js";
import {
  G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID,
  G3A_U08_SAME_DENOMINATOR_NUMERIC_GROUP_ID,
  G3A_U08_SAME_DENOMINATOR_APPLICATION_GROUP_ID,
  G3A_U08_SAME_DENOMINATOR_NUMERIC_SPEC_ID,
  G3A_U08_SAME_DENOMINATOR_APPLICATION_SPEC_ID,
  G3A_U08_SAME_DENOMINATOR_PATTERN_SPEC_IDS,
} from "../registry/g3a-u08-same-denominator-compare-selector-projection.js";

export const P03F6_REQUIRED_CAPABILITY_IDS = Object.freeze(["cap_fraction_domain_validator", "cap_fraction_number_system"]);
const common = {
  sourceId: G3A_U08_SOURCE_ID, title: "同分母分數比較", kind: "g3aU08SameDenominatorFractionCompare",
  operation: "fraction_compare", operationFamilyId: "fraction_compare", knowledgePointId: G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID,
  requestedUnknownRole: "comparison", givenRoles: Object.freeze(["leftNumerator", "leftDenominator", "rightNumerator", "rightDenominator"]),
  canonicalSkillIds: Object.freeze([G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID]),
  skillTags: Object.freeze(["fraction", "same_denominator", "comparison", "compare_with_one", G3A_U08_SOURCE_ID]),
  requiredCapabilityIds: P03F6_REQUIRED_CAPABILITY_IDS,
  applicationClassification: "APPLICATION_COMPATIBLE",
  numericDomain: Object.freeze({ denominatorMin: 2, denominatorMax: 10, samePositiveDenominatorRequired: true, compareWithOneRequired: true }),
  sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1", sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
};
const definitions = Object.freeze({
  [G3A_U08_SAME_DENOMINATOR_NUMERIC_SPEC_ID]: Object.freeze({ ...common, patternSpecId: G3A_U08_SAME_DENOMINATOR_NUMERIC_SPEC_ID, patternGroupId: G3A_U08_SAME_DENOMINATOR_NUMERIC_GROUP_ID, mode: "NUMERIC", questionMode: "numeric", difficultyTags: Object.freeze(["full_product_w3_slice006", "numeric", "same_denominator"]) , globalContextRequired: false }),
  [G3A_U08_SAME_DENOMINATOR_APPLICATION_SPEC_ID]: Object.freeze({ ...common, patternSpecId: G3A_U08_SAME_DENOMINATOR_APPLICATION_SPEC_ID, patternGroupId: G3A_U08_SAME_DENOMINATOR_APPLICATION_GROUP_ID, mode: "APPLICATION", questionMode: "application", difficultyTags: Object.freeze(["full_product_w3_slice006", "application", "same_denominator"]), globalContextRequired: true }),
});
export function getBatchABrowserPatternDefinition(id) { return definitions[id] ?? baseGetDefinition(id); }
export function getBatchAPatternSpecIdsForSource(sourceId) {
  return sourceId === G3A_U08_SOURCE_ID ? [...new Set([...baseGetPatternIds(sourceId), ...G3A_U08_SAME_DENOMINATOR_PATTERN_SPEC_IDS])] : baseGetPatternIds(sourceId);
}
export function validateP03F6PatternDefinitions() {
  const errors = [];
  for (const id of G3A_U08_SAME_DENOMINATOR_PATTERN_SPEC_IDS) {
    const definition = definitions[id];
    if (!definition || definition.knowledgePointId !== G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID) errors.push(`P03F6_KP_BINDING_INVALID:${id}`);
    if (JSON.stringify(definition?.requiredCapabilityIds) !== JSON.stringify(P03F6_REQUIRED_CAPABILITY_IDS)) errors.push(`P03F6_CAPABILITY_SET_INVALID:${id}`);
    if (definition?.questionMode === "application" && definition.globalContextRequired !== true) errors.push(`P03F6_APPLICATION_CONTEXT_INVALID:${id}`);
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: Object.keys(definitions).length });
}
