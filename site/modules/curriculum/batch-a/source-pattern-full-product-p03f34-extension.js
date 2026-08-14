import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p03f33-extension.js";
import {
  G4A_U09_P03F34_KP_ID,
  G4A_U09_P03F34_PATTERN_GROUP_ID,
  G4A_U09_P03F34_PATTERN_SPEC_ID,
  G4A_U09_P03F34_SOURCE_ID,
  P03F34_REQUIRED_CAPABILITY_IDS,
} from "../registry/g4a-u09-rank9-missing-digit-inequality-selector-projection-p03f34.js";

export const G4A_U09_P03F34_PATTERN_DEFINITION=Object.freeze({
  sourceId:G4A_U09_P03F34_SOURCE_ID,
  title:"小數不等式未知數字",
  kind:"g4aU09Rank9_missing_digit_inequality_possibleDigits",
  operation:"missing_digit_inequality",
  operationFamilyId:"missing_digit_inequality",
  operationModelId:"op_g4a_u09_missing_digit_inequality",
  knowledgePointId:G4A_U09_P03F34_KP_ID,
  patternGroupId:G4A_U09_P03F34_PATTERN_GROUP_ID,
  patternSpecId:G4A_U09_P03F34_PATTERN_SPEC_ID,
  mode:"NUMERIC",
  questionMode:"numeric",
  requestedUnknownRole:"possibleDigits",
  givenRoles:Object.freeze(["missingDigit","left","right"]),
  answerType:"digit_set",
  canonicalExpressions:Object.freeze(["possibleDigits = {d in 0..9 | relation(left(d), right(d))}"]),
  canonicalSkillIds:Object.freeze([G4A_U09_P03F34_KP_ID]),
  skillTags:Object.freeze(["decimal","inequality","missing_digit","digit_set",G4A_U09_P03F34_SOURCE_ID]),
  difficultyTags:Object.freeze(["rank9","hundredths","constraint_reasoning","full_product_w3_slice034"]),
  requiredCapabilityIds:P03F34_REQUIRED_CAPABILITY_IDS,
  applicationClassification:"APPLICATION_NOT_APPLICABLE",
  globalContextRequired:false,
  sharedGeneratorAdapterId:"SHARED_OPERATION_FAMILY_GENERATOR_V1",
  sharedValidatorAdapterId:"SHARED_OPERATION_FAMILY_VALIDATOR_V1",
  numericDomain:Object.freeze({decimalScale:2,digitMin:0,digitMax:9,exhaustiveDigitSetRequired:true,applicationRequired:false,applicationExpansionAllowed:false}),
});
export function getBatchABrowserPatternDefinition(id){ return id===G4A_U09_P03F34_PATTERN_SPEC_ID?G4A_U09_P03F34_PATTERN_DEFINITION:baseGetDefinition(id); }
export function getBatchAPatternSpecIdsForSource(sourceId){ const prior=baseGetPatternIds(sourceId); return sourceId===G4A_U09_P03F34_SOURCE_ID?[...new Set([...prior,G4A_U09_P03F34_PATTERN_SPEC_ID])]:prior; }
export function validateP03F34PatternDefinitions(){
  const row=G4A_U09_P03F34_PATTERN_DEFINITION;
  const errors=[];
  if(row.patternSpecId!==G4A_U09_P03F34_PATTERN_SPEC_ID||row.knowledgePointId!==G4A_U09_P03F34_KP_ID) errors.push("P03F34_PATTERN_IDENTITY_INVALID");
  if(row.operationModelId!=="op_g4a_u09_missing_digit_inequality"||row.operationFamilyId!=="missing_digit_inequality"||row.answerType!=="digit_set") errors.push("P03F34_FORMAL_MAPPING_INVALID");
  if(JSON.stringify(row.requiredCapabilityIds)!==JSON.stringify(P03F34_REQUIRED_CAPABILITY_IDS)) errors.push("P03F34_CAPABILITY_SET_INVALID");
  if(row.questionMode!=="numeric"||row.globalContextRequired||row.numericDomain.applicationRequired||row.numericDomain.applicationExpansionAllowed) errors.push("P03F34_APPLICATION_SCOPE_INVALID");
  if(!row.numericDomain.exhaustiveDigitSetRequired) errors.push("P03F34_EXHAUSTIVE_SET_CONTRACT_MISSING");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),patternSpecCount:1});
}
