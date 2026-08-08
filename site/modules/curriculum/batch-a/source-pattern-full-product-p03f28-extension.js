import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p03f27-extension.js";
import {
  G5A_U01_P03F28_GROUP_ID,
  G5A_U01_P03F28_KP_ID,
  G5A_U01_P03F28_SOURCE_ID,
  G5A_U01_P03F28_SPEC_ID,
} from "../registry/g5a-u01-rank8-decimal-selector-projection-p03f28.js";

export const P03F28_DECIMAL_CAPABILITY_IDS = Object.freeze([
  "cap_decimal_domain_validator",
  "cap_decimal_number_system",
]);

export const G5A_U01_P03F28_PATTERN_DEFINITION = Object.freeze({
  sourceId: G5A_U01_P03F28_SOURCE_ID,
  title: "多位小數組成分解",
  kind: "g5aU01Rank8DecimalComposeDecompose",
  operation: "decimal_representation",
  operationFamilyId: "decimal_representation",
  operationModelId: "op_g5a_u01_decimal_compose_decompose",
  knowledgePointId: G5A_U01_P03F28_KP_ID,
  patternGroupId: G5A_U01_P03F28_GROUP_ID,
  patternSpecId: G5A_U01_P03F28_SPEC_ID,
  mode: "NUMERIC",
  questionMode: "numeric",
  requestedUnknownRole: "decimal",
  givenRoles: Object.freeze(["whole", "fractionalUnits", "placeUnit"]),
  answerType: "decimal",
  canonicalExpressions: Object.freeze(["decimal = whole + fractionalUnits * placeUnit"]),
  canonicalSkillIds: Object.freeze([G5A_U01_P03F28_KP_ID]),
  skillTags: Object.freeze(["decimal", "place_value", "decimal_compose_decompose", G5A_U01_P03F28_SOURCE_ID]),
  difficultyTags: Object.freeze(["multi_place_decimal", "full_product_w3_slice028"]),
  requiredCapabilityIds: P03F28_DECIMAL_CAPABILITY_IDS,
  applicationClassification: "APPLICATION_NOT_APPLICABLE",
  globalContextRequired: false,
  sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
  sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
  numericDomain: Object.freeze({
    allowedDecimalScales: Object.freeze([3,4,5,6]),
    placeValueExpansionMustRecombineExactly: true,
    internalZeroDigitsMustBePreserved: true,
    applicationRequired: false,
    decimalArithmeticRequired: false,
    comparisonRequired: false,
    roundingRequired: false,
  }),
});

export function getBatchABrowserPatternDefinition(id){ return id===G5A_U01_P03F28_SPEC_ID ? G5A_U01_P03F28_PATTERN_DEFINITION : baseGetDefinition(id); }
export function getBatchAPatternSpecIdsForSource(sourceId){
  const prior=baseGetPatternIds(sourceId);
  return sourceId===G5A_U01_P03F28_SOURCE_ID ? [...new Set([...prior,G5A_U01_P03F28_SPEC_ID])] : prior;
}
export function validateP03F28PatternDefinitions(){
  const errors=[];
  const row=G5A_U01_P03F28_PATTERN_DEFINITION;
  if(row.sourceId!==G5A_U01_P03F28_SOURCE_ID || row.questionMode!=="numeric" || row.globalContextRequired) errors.push("P03F28_PATTERN_BOUNDARY_INVALID");
  if(JSON.stringify(row.requiredCapabilityIds)!==JSON.stringify(P03F28_DECIMAL_CAPABILITY_IDS)) errors.push("P03F28_CAPABILITY_SET_INVALID");
  if(row.numericDomain.applicationRequired || row.numericDomain.decimalArithmeticRequired || row.numericDomain.comparisonRequired || row.numericDomain.roundingRequired) errors.push("P03F28_DOMAIN_EXPANSION_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),patternSpecCount:1});
}
