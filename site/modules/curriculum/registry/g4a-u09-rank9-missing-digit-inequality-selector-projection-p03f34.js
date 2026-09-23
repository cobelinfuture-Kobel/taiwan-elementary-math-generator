import { G4A_U09_P03F26_SOURCE_ID } from "./g4a-u09-rank8-decimal-selector-projection-p03f26.js";

export const P03F34_TASK_ID = "P03F_W3DirectProductVerticalSlice034Implementation";
export const G4A_U09_P03F34_SOURCE_ID = G4A_U09_P03F26_SOURCE_ID;
export const G4A_U09_P03F34_UNIT_CODE = "4A-U09";
export const G4A_U09_P03F34_UNIT_TITLE = "2位小數";
export const P03F34_REQUIRED_CAPABILITY_IDS = Object.freeze([
  "cap_decimal_domain_validator",
  "cap_decimal_number_system",
]);
export const G4A_U09_P03F34_KP_ID = "kp_g4a_u09_missing_digit_inequality";
export const G4A_U09_P03F34_KP_IDS = Object.freeze([G4A_U09_P03F34_KP_ID]);
export const G4A_U09_P03F34_PATTERN_GROUP_ID = "pg_g4a_u09_missing_digit_inequality_numeric";
export const G4A_U09_P03F34_PATTERN_SPEC_ID = "ps_g4a_u09_missing_digit_inequality_possible_digits_numeric";
export const G4A_U09_P03F34_NUMERIC_PATTERN_SPEC_IDS = Object.freeze([G4A_U09_P03F34_PATTERN_SPEC_ID]);

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
export const G4A_U09_P03F34_PATTERN_GROUPS = Object.freeze([Object.freeze({
  patternGroupId:G4A_U09_P03F34_PATTERN_GROUP_ID,
  sourceId:G4A_U09_P03F34_SOURCE_ID,
  unitCode:G4A_U09_P03F34_UNIT_CODE,
  unitTitle:G4A_U09_P03F34_UNIT_TITLE,
  displayName:"小數不等式未知數字",
  primaryKnowledgePointId:G4A_U09_P03F34_KP_ID,
  knowledgePointIds:Object.freeze([G4A_U09_P03F34_KP_ID]),
  supportClass:"A",
  mode:"numeric",
  publicQuestionMode:"numeric",
  representationTag:"missing_digit_inequality",
  representationTags:Object.freeze(["decimal","hundredths","inequality","missing_digit","digit_set"]),
  patternSpecIds:G4A_U09_P03F34_NUMERIC_PATTERN_SPEC_IDS,
  allocationPolicy:"single_pattern_spec",
  visibilityStatus:"visible",
  holdReason:null,
})]);
export const G4A_U09_P03F34_SELECTOR_ROWS = Object.freeze([Object.freeze({
  knowledgePointId:G4A_U09_P03F34_KP_ID,
  sourceId:G4A_U09_P03F34_SOURCE_ID,
  unitCode:G4A_U09_P03F34_UNIT_CODE,
  unitTitle:G4A_U09_P03F34_UNIT_TITLE,
  displayName:"小數不等式未知數字",
  canonicalNameZh:"小數不等式未知數字",
  mode:"numeric",
  questionMode:"numeric",
  questionModes:Object.freeze(["numeric"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:"APPLICATION_NOT_APPLICABLE",
  canonicalPatternGroupIds:Object.freeze([G4A_U09_P03F34_PATTERN_GROUP_ID]),
  canonicalPatternSpecIds:G4A_U09_P03F34_NUMERIC_PATTERN_SPEC_IDS,
  patternGroupIds:Object.freeze([G4A_U09_P03F34_PATTERN_GROUP_ID]),
  patternSpecIds:G4A_U09_P03F34_NUMERIC_PATTERN_SPEC_IDS,
  requiredCapabilityIds:P03F34_REQUIRED_CAPABILITY_IDS,
  qaStatusLabel:"P03F34_SLICE034_AUTHORITY_FROZEN",
  productionUse:"full_product_w3_slice034_candidate",
})]);
export const G4A_U09_P03F34_SELECTOR_PROJECTION = Object.freeze({
  taskId:P03F34_TASK_ID,
  sourceId:G4A_U09_P03F34_SOURCE_ID,
  status:"ONE_RANK9_DECIMAL_KP_ADDED_TO_EXISTING_PUBLIC_SOURCE",
  knowledgePointCount:1,
  patternGroupCount:1,
  patternSpecCount:1,
  numericPatternSpecCount:1,
  applicationPatternSpecCount:0,
  publicSelectionEnabled:true,
  sharedPipelineRequired:true,
  applicationModeAllowed:false,
  expectedSourceVisibleCountAfterAdmission:7,
  expectedSourceHiddenCountAfterAdmission:1,
  expectedPublicSourceCountAfterAdmission:32,
  expectedPublicKnowledgePointCountAfterAdmission:230,
});
export function listG4AU09P03F34SelectorRows(){ return clone(G4A_U09_P03F34_SELECTOR_ROWS); }
export function getG4AU09P03F34SelectorRow(id){ return clone(id===G4A_U09_P03F34_KP_ID?G4A_U09_P03F34_SELECTOR_ROWS[0]:null); }
export function listG4AU09P03F34PatternGroups(id){ return clone(id===G4A_U09_P03F34_KP_ID?G4A_U09_P03F34_PATTERN_GROUPS:[]); }
export function resolveG4AU09P03F34PatternSpecIds(id){ return clone(id===G4A_U09_P03F34_KP_ID?G4A_U09_P03F34_NUMERIC_PATTERN_SPEC_IDS:[]); }
export function auditG4AU09P03F34SelectorProjection(){
  const errors=[];
  if(G4A_U09_P03F34_SELECTOR_ROWS.length!==1) errors.push("P03F34_KP_COUNT_INVALID");
  if(G4A_U09_P03F34_PATTERN_GROUPS.length!==1) errors.push("P03F34_GROUP_COUNT_INVALID");
  if(G4A_U09_P03F34_NUMERIC_PATTERN_SPEC_IDS.length!==1) errors.push("P03F34_SPEC_COUNT_INVALID");
  if(JSON.stringify(G4A_U09_P03F34_SELECTOR_ROWS[0].requiredCapabilityIds)!==JSON.stringify(P03F34_REQUIRED_CAPABILITY_IDS)) errors.push("P03F34_CAPABILITY_SET_INVALID");
  if(G4A_U09_P03F34_SELECTOR_ROWS[0].questionMode!=="numeric"||G4A_U09_P03F34_SELECTOR_ROWS[0].applicationClassification!=="APPLICATION_NOT_APPLICABLE") errors.push("P03F34_APPLICATION_SCOPE_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:1,numeric:1,application:0})});
}
