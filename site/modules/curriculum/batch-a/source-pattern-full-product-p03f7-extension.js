import { getBatchABrowserPatternDefinition as baseGetDefinition, getBatchAPatternSpecIdsForSource as baseGetPatternIds } from "./source-pattern-full-product-p03f6-extension.js";
import { G3B_U07_SOURCE_ID } from "../registry/g3b-u07-quotient-fraction-selector-projection.js";
import {
  G3B_U07_FRACTION_UNIT_CONVERSION_KP_ID, G3B_U07_FRACTION_UNIT_CONVERSION_NUMERIC_GROUP_ID,
  G3B_U07_FRACTION_UNIT_CONVERSION_APPLICATION_GROUP_ID, G3B_U07_FRACTION_UNIT_CONVERSION_ITEM_COUNT_NUMERIC_SPEC_ID,
  G3B_U07_FRACTION_UNIT_CONVERSION_FRACTIONAL_UNITS_NUMERIC_SPEC_ID, G3B_U07_FRACTION_UNIT_CONVERSION_ITEM_COUNT_APPLICATION_SPEC_ID,
  G3B_U07_FRACTION_UNIT_CONVERSION_FRACTIONAL_UNITS_APPLICATION_SPEC_ID, G3B_U07_FRACTION_UNIT_CONVERSION_PATTERN_SPEC_IDS,
} from "../registry/g3b-u07-fraction-unit-conversion-selector-projection.js";
export const P03F7_REQUIRED_CAPABILITY_IDS = Object.freeze(["cap_fraction_domain_validator", "cap_fraction_number_system"]);
const common = {
  sourceId: G3B_U07_SOURCE_ID, title: "單位分數與離散單位換算", kind: "g3bU07FractionUnitConversion",
  operation: "discrete_fraction_conversion", operationFamilyId: "discrete_fraction_conversion", operationModelId: "op_g3b_u07_fraction_unit_conversion",
  knowledgePointId: G3B_U07_FRACTION_UNIT_CONVERSION_KP_ID,
  canonicalExpressions: Object.freeze(["itemCount = wholeUnits * itemsPerWhole + numerator * itemsPerWhole / denominator", "fractionalUnits = itemCount / itemsPerWhole"]),
  canonicalSkillIds: Object.freeze([G3B_U07_FRACTION_UNIT_CONVERSION_KP_ID]),
  skillTags: Object.freeze(["fraction", "unit_fraction", "discrete_quantity", "unit_conversion", "items_per_whole", "role_preserving", "bidirectional_conversion", G3B_U07_SOURCE_ID]),
  requiredCapabilityIds: P03F7_REQUIRED_CAPABILITY_IDS, applicationClassification: "APPLICATION_REQUIRED",
  numericDomain: Object.freeze({ itemsPerWholeMin: 4, itemsPerWholeMax: 24, denominatorMin: 2, denominatorMax: 8, exactIntegerCountRequired: true }),
  sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1", sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
};
const definition = (patternSpecId, patternGroupId, mode, requestedUnknownRole) => Object.freeze({
  ...common, patternSpecId, patternGroupId, mode, questionMode: mode === "APPLICATION" ? "application" : "numeric", requestedUnknownRole,
  givenRoles: Object.freeze(requestedUnknownRole === "itemCount" ? ["wholeUnits", "itemsPerWhole", "numerator", "denominator", "fractionalUnits"] : ["wholeUnits", "itemsPerWhole", "numerator", "denominator", "itemCount"]),
  answerType: "fraction_or_integer_quantity", difficultyTags: Object.freeze(["full_product_w3_slice007", mode.toLowerCase(), requestedUnknownRole]),
  globalContextRequired: mode === "APPLICATION",
});
const definitions = Object.freeze({
  [G3B_U07_FRACTION_UNIT_CONVERSION_ITEM_COUNT_NUMERIC_SPEC_ID]: definition(G3B_U07_FRACTION_UNIT_CONVERSION_ITEM_COUNT_NUMERIC_SPEC_ID, G3B_U07_FRACTION_UNIT_CONVERSION_NUMERIC_GROUP_ID, "NUMERIC", "itemCount"),
  [G3B_U07_FRACTION_UNIT_CONVERSION_FRACTIONAL_UNITS_NUMERIC_SPEC_ID]: definition(G3B_U07_FRACTION_UNIT_CONVERSION_FRACTIONAL_UNITS_NUMERIC_SPEC_ID, G3B_U07_FRACTION_UNIT_CONVERSION_NUMERIC_GROUP_ID, "NUMERIC", "fractionalUnits"),
  [G3B_U07_FRACTION_UNIT_CONVERSION_ITEM_COUNT_APPLICATION_SPEC_ID]: definition(G3B_U07_FRACTION_UNIT_CONVERSION_ITEM_COUNT_APPLICATION_SPEC_ID, G3B_U07_FRACTION_UNIT_CONVERSION_APPLICATION_GROUP_ID, "APPLICATION", "itemCount"),
  [G3B_U07_FRACTION_UNIT_CONVERSION_FRACTIONAL_UNITS_APPLICATION_SPEC_ID]: definition(G3B_U07_FRACTION_UNIT_CONVERSION_FRACTIONAL_UNITS_APPLICATION_SPEC_ID, G3B_U07_FRACTION_UNIT_CONVERSION_APPLICATION_GROUP_ID, "APPLICATION", "fractionalUnits"),
});
export function getBatchABrowserPatternDefinition(id) { return definitions[id] ?? baseGetDefinition(id); }
export function getBatchAPatternSpecIdsForSource(sourceId) { return sourceId === G3B_U07_SOURCE_ID ? [...new Set([...baseGetPatternIds(sourceId), ...G3B_U07_FRACTION_UNIT_CONVERSION_PATTERN_SPEC_IDS])] : baseGetPatternIds(sourceId); }
export function validateP03F7PatternDefinitions() {
  const errors = [];
  for (const id of G3B_U07_FRACTION_UNIT_CONVERSION_PATTERN_SPEC_IDS) {
    const d = definitions[id];
    if (!d || d.knowledgePointId !== G3B_U07_FRACTION_UNIT_CONVERSION_KP_ID) errors.push(`P03F7_KP_BINDING_INVALID:${id}`);
    if (JSON.stringify(d?.requiredCapabilityIds) !== JSON.stringify(P03F7_REQUIRED_CAPABILITY_IDS)) errors.push(`P03F7_CAPABILITY_SET_INVALID:${id}`);
    if (d?.questionMode === "application" && d.globalContextRequired !== true) errors.push(`P03F7_APPLICATION_CONTEXT_INVALID:${id}`);
    if (!d?.givenRoles?.includes("itemsPerWhole")) errors.push(`P03F7_UNIT_ROLE_MISSING:${id}`);
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: Object.keys(definitions).length });
}
