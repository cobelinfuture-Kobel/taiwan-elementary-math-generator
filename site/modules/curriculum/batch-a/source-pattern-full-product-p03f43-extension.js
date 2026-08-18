import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p03f42-extension.js";
import {
  G4B_U08_P03F43_BOUNDS_GROUP_ID,
  G4B_U08_P03F43_BOUNDS_KP_ID,
  G4B_U08_P03F43_BOUNDS_SPEC_ID,
  G4B_U08_P03F43_COORDINATE_SPEC_ID,
  G4B_U08_P03F43_DISTANCE_SPEC_ID,
  G4B_U08_P03F43_NUMBER_LINE_GROUP_ID,
  G4B_U08_P03F43_NUMBER_LINE_KP_ID,
  G4B_U08_P03F43_SOURCE_ID,
  P03F43_BOUNDS_REQUIRED_CAPABILITY_IDS,
  P03F43_NUMBER_LINE_REQUIRED_CAPABILITY_IDS,
  P03F43_SPEC_IDS,
} from "../registry/g4b-u08-rank10-fraction-selector-projection-p03f43.js";

const commonNumberLine = Object.freeze({
  sourceId: G4B_U08_P03F43_SOURCE_ID,
  title: "分數數線座標、移動與距離",
  kind: "g4bU08Rank10FractionNumberLine",
  operation: "number_line",
  operationFamilyId: "number_line",
  operationModelId: "op_g4b_u08_fraction_number_line_distance",
  knowledgePointId: G4B_U08_P03F43_NUMBER_LINE_KP_ID,
  patternGroupId: G4B_U08_P03F43_NUMBER_LINE_GROUP_ID,
  mode: "NUMERIC",
  questionMode: "numeric",
  answerType: "number_or_distance",
  canonicalExpressions: Object.freeze([
    "coordinate = origin + stepCount * unitStep",
    "distance = abs(rightCoordinate - leftCoordinate)",
  ]),
  canonicalSkillIds: Object.freeze([G4B_U08_P03F43_NUMBER_LINE_KP_ID]),
  skillTags: Object.freeze(["fraction", "number_line", "coordinate", "distance", "exact_rational", G4B_U08_P03F43_SOURCE_ID]),
  difficultyTags: Object.freeze(["rank10", "visual_representation", "fraction_coordinate", "full_product_w3_slice043"]),
  requiredCapabilityIds: P03F43_NUMBER_LINE_REQUIRED_CAPABILITY_IDS,
  applicationClassification: "APPLICATION_NOT_APPLICABLE",
  globalContextRequired: false,
  sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
  sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
  sharedRendererAdapterId: "SHARED_HTML_RENDERER_FRACTION_NUMBER_LINE_V1",
  numericDomain: Object.freeze({
    fractionNumberLineRequired: true,
    exactRationalModelRequired: true,
    visualRepresentationRequired: true,
    applicationRequired: false,
    applicationExpansionAllowed: false,
    fractionArithmeticRequired: false,
  }),
});

export const G4B_U08_P03F43_COORDINATE_PATTERN_DEFINITION = Object.freeze({
  ...commonNumberLine,
  patternSpecId: G4B_U08_P03F43_COORDINATE_SPEC_ID,
  requestedUnknownRole: "coordinate",
  givenRoles: Object.freeze(["origin", "unitStep", "stepCount", "distance"]),
  numberLineTask: "coordinate",
});
export const G4B_U08_P03F43_DISTANCE_PATTERN_DEFINITION = Object.freeze({
  ...commonNumberLine,
  patternSpecId: G4B_U08_P03F43_DISTANCE_SPEC_ID,
  requestedUnknownRole: "distance",
  givenRoles: Object.freeze(["origin", "unitStep", "stepCount", "coordinate"]),
  numberLineTask: "distance",
});
export const G4B_U08_P03F43_BOUNDS_PATTERN_DEFINITION = Object.freeze({
  sourceId: G4B_U08_P03F43_SOURCE_ID,
  title: "等值帶分數排序與界限",
  kind: "g4bU08Rank10MixedFractionBounds",
  operation: "fraction_bounds",
  operationFamilyId: "fraction_bounds",
  operationModelId: "op_g4b_u08_mixed_fraction_order_constraints",
  knowledgePointId: G4B_U08_P03F43_BOUNDS_KP_ID,
  patternGroupId: G4B_U08_P03F43_BOUNDS_GROUP_ID,
  patternSpecId: G4B_U08_P03F43_BOUNDS_SPEC_ID,
  mode: "NUMERIC",
  questionMode: "numeric",
  requestedUnknownRole: "possibleValues",
  givenRoles: Object.freeze(["lowerBound", "upperBound", "unknownPart"]),
  answerType: "integer_or_fraction_set",
  canonicalExpressions: Object.freeze(["possibleValues = {x | lowerBound < value(x) < upperBound}"]),
  canonicalSkillIds: Object.freeze([G4B_U08_P03F43_BOUNDS_KP_ID]),
  skillTags: Object.freeze(["fraction", "mixed_fraction", "bounds", "possible_values", "exact_rational", G4B_U08_P03F43_SOURCE_ID]),
  difficultyTags: Object.freeze(["rank10", "constraint_reasoning", "full_product_w3_slice043"]),
  requiredCapabilityIds: P03F43_BOUNDS_REQUIRED_CAPABILITY_IDS,
  applicationClassification: "APPLICATION_COMPATIBLE",
  globalContextRequired: false,
  sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
  sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
  sharedRendererAdapterId: "SHARED_HTML_RENDERER_NUMERIC_V1",
  numericDomain: Object.freeze({
    exactRationalBoundsRequired: true,
    exhaustivePossibleValuesRequired: true,
    applicationRequired: false,
    applicationExpansionAllowed: false,
    fractionArithmeticRequired: false,
  }),
});

export function getBatchABrowserPatternDefinition(id) {
  if (id === G4B_U08_P03F43_COORDINATE_SPEC_ID) return G4B_U08_P03F43_COORDINATE_PATTERN_DEFINITION;
  if (id === G4B_U08_P03F43_DISTANCE_SPEC_ID) return G4B_U08_P03F43_DISTANCE_PATTERN_DEFINITION;
  if (id === G4B_U08_P03F43_BOUNDS_SPEC_ID) return G4B_U08_P03F43_BOUNDS_PATTERN_DEFINITION;
  return baseGetDefinition(id);
}
export function getBatchAPatternSpecIdsForSource(sourceId) {
  const prior = baseGetPatternIds(sourceId);
  return sourceId === G4B_U08_P03F43_SOURCE_ID ? [...new Set([...prior, ...P03F43_SPEC_IDS])] : prior;
}
export function validateP03F43PatternDefinitions() {
  const errors = [];
  const definitions = [G4B_U08_P03F43_COORDINATE_PATTERN_DEFINITION, G4B_U08_P03F43_DISTANCE_PATTERN_DEFINITION, G4B_U08_P03F43_BOUNDS_PATTERN_DEFINITION];
  if (definitions.some((definition) => definition.sourceId !== G4B_U08_P03F43_SOURCE_ID || definition.questionMode !== "numeric" || definition.globalContextRequired)) errors.push("P03F43_PATTERN_BOUNDARY_INVALID");
  if (definitions.some((definition) => definition.requiredCapabilityIds.includes("cap_fraction_arithmetic"))) errors.push("P03F43_FRACTION_ARITHMETIC_LEAK");
  if (!G4B_U08_P03F43_COORDINATE_PATTERN_DEFINITION.requiredCapabilityIds.includes("cap_number_line_representation") || !G4B_U08_P03F43_DISTANCE_PATTERN_DEFINITION.requiredCapabilityIds.includes("cap_number_line_representation")) errors.push("P03F43_NUMBER_LINE_CAPABILITY_MISSING");
  if (G4B_U08_P03F43_BOUNDS_PATTERN_DEFINITION.requiredCapabilityIds.includes("cap_number_line_representation")) errors.push("P03F43_BOUNDS_REPRESENTATION_LEAK");
  if (!G4B_U08_P03F43_BOUNDS_PATTERN_DEFINITION.numericDomain.exhaustivePossibleValuesRequired) errors.push("P03F43_BOUNDS_EXHAUSTIVE_CONTRACT_MISSING");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: 3 });
}
