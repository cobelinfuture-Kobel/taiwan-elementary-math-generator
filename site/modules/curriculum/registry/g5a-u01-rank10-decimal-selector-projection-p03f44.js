import { G5A_U01_P03F36_SOURCE_ID, G5A_U01_P03F36_UNIT_CODE, G5A_U01_P03F36_UNIT_TITLE } from "./g5a-u01-rank9-decimal-selector-projection-p03f36.js";

export const P03F44_TASK_ID="P03F_W3DirectProductVerticalSlice044Implementation";
export const G5A_U01_P03F44_SOURCE_ID=G5A_U01_P03F36_SOURCE_ID;
export const G5A_U01_P03F44_UNIT_CODE=G5A_U01_P03F36_UNIT_CODE;
export const G5A_U01_P03F44_UNIT_TITLE=G5A_U01_P03F36_UNIT_TITLE;
export const G5A_U01_P03F44_ROUND_KP_ID="kp_g5a_u01_decimal_round_estimate";
export const G5A_U01_P03F44_MISSING_KP_ID="kp_g5a_u01_missing_digit_inequality";
export const G5A_U01_P03F44_HIDDEN_INVERSE_KP_ID="kp_g5a_u01_inverse_rounding_range";
export const G5A_U01_P03F44_ROUND_GROUP_ID="pg_g5a_u01_decimal_round_estimate_numeric";
export const G5A_U01_P03F44_MISSING_GROUP_ID="pg_g5a_u01_missing_digit_inequality_numeric";
export const G5A_U01_P03F44_ROUNDED_SPEC_ID="ps_g5a_u01_decimal_round_estimate_rounded_numeric";
export const G5A_U01_P03F44_ESTIMATE_SPEC_ID="ps_g5a_u01_decimal_round_estimate_estimate_numeric";
export const G5A_U01_P03F44_MISSING_SPEC_ID="ps_g5a_u01_missing_digit_inequality_possible_digits_numeric";
export const P03F44_KP_IDS=Object.freeze([G5A_U01_P03F44_ROUND_KP_ID,G5A_U01_P03F44_MISSING_KP_ID]);
export const P03F44_GROUP_IDS=Object.freeze([G5A_U01_P03F44_ROUND_GROUP_ID,G5A_U01_P03F44_MISSING_GROUP_ID]);
export const P03F44_SPEC_IDS=Object.freeze([G5A_U01_P03F44_ROUNDED_SPEC_ID,G5A_U01_P03F44_ESTIMATE_SPEC_ID,G5A_U01_P03F44_MISSING_SPEC_ID]);
export const P03F44_HIDDEN_APPLICATION_SPEC_IDS=Object.freeze(["ps_g5a_u01_decimal_round_estimate_rounded_application","ps_g5a_u01_decimal_round_estimate_estimate_application"]);
export const P03F44_HIDDEN_SIBLING_KP_IDS=Object.freeze([G5A_U01_P03F44_HIDDEN_INVERSE_KP_ID]);
export const P03F44_REQUIRED_CAPABILITY_IDS=Object.freeze(["cap_decimal_domain_validator","cap_decimal_number_system"]);
const clone=(value)=>value==null?value:JSON.parse(JSON.stringify(value));
const freeze=(value)=>{if(!value||typeof value!=="object"||Object.isFrozen(value))return value;for(const nested of Object.values(value))freeze(nested);return Object.freeze(value);};
const group=(patternGroupId,primaryKnowledgePointId,displayName,patternSpecIds,representationTags)=>({patternGroupId,sourceId:G5A_U01_P03F44_SOURCE_ID,unitCode:G5A_U01_P03F44_UNIT_CODE,unitTitle:G5A_U01_P03F44_UNIT_TITLE,displayName,primaryKnowledgePointId,knowledgePointIds:[primaryKnowledgePointId],supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",representationTag:representationTags[0],representationTags,patternSpecIds,allocationPolicy:patternSpecIds.length>1?"balanced_by_pattern_spec":"single_pattern_spec",visibilityStatus:"visible",holdReason:null});
export const G5A_U01_P03F44_PATTERN_GROUPS=freeze([
 group(G5A_U01_P03F44_ROUND_GROUP_ID,G5A_U01_P03F44_ROUND_KP_ID,"多位小數取概數與估算",[G5A_U01_P03F44_ROUNDED_SPEC_ID,G5A_U01_P03F44_ESTIMATE_SPEC_ID],["decimal_rounding","estimate","place_value"]),
 group(G5A_U01_P03F44_MISSING_GROUP_ID,G5A_U01_P03F44_MISSING_KP_ID,"多位小數不等式缺位",[G5A_U01_P03F44_MISSING_SPEC_ID],["decimal_inequality","missing_digit","digit_set"])
]);
const row=(knowledgePointId,displayName,groupId,specIds,classification,hiddenApplicationPatternSpecIds=[])=>({knowledgePointId,sourceId:G5A_U01_P03F44_SOURCE_ID,unitCode:G5A_U01_P03F44_UNIT_CODE,unitTitle:G5A_U01_P03F44_UNIT_TITLE,displayName,canonicalNameZh:displayName,mode:"numeric",questionMode:"numeric",questionModes:["numeric"],supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:classification,canonicalPatternGroupIds:[groupId],canonicalPatternSpecIds:specIds,patternGroupIds:[groupId],patternSpecIds:specIds,requiredCapabilityIds:P03F44_REQUIRED_CAPABILITY_IDS,hiddenApplicationPatternSpecIds,qaStatusLabel:"P03F44_Q044_RANK10_DECIMAL_AUTHORITY_FROZEN",productionUse:"full_product_w3_slice044_candidate"});
export const G5A_U01_P03F44_SELECTOR_ROWS=freeze([
 row(G5A_U01_P03F44_ROUND_KP_ID,"多位小數取概數與估算",G5A_U01_P03F44_ROUND_GROUP_ID,[G5A_U01_P03F44_ROUNDED_SPEC_ID,G5A_U01_P03F44_ESTIMATE_SPEC_ID],"APPLICATION_COMPATIBLE",P03F44_HIDDEN_APPLICATION_SPEC_IDS),
 row(G5A_U01_P03F44_MISSING_KP_ID,"多位小數不等式缺位",G5A_U01_P03F44_MISSING_GROUP_ID,[G5A_U01_P03F44_MISSING_SPEC_ID],"APPLICATION_NOT_APPLICABLE",[])
]);
export const G5A_U01_P03F44_SELECTOR_PROJECTION=freeze({taskId:P03F44_TASK_ID,sourceId:G5A_U01_P03F44_SOURCE_ID,status:"Q044_TWO_KP_RANK10_DECIMAL_ALLOCATION_FROZEN_ON_EXISTING_PUBLIC_SOURCE",knowledgePointCount:2,hiddenSiblingKnowledgePointCount:1,patternGroupCount:2,patternSpecCount:3,numericPatternSpecCount:3,applicationPatternSpecCount:0,hiddenApplicationPatternSpecIds:P03F44_HIDDEN_APPLICATION_SPEC_IDS,publicSelectionEnabled:true,sharedPipelineRequired:true,sharedRendererRequired:true,applicationModeAllowed:false,decimalArithmeticCapabilityPromotionAllowed:false,expectedSourceVisibleCountAfterAdmission:7,expectedSourceHiddenCountAfterAdmission:1,expectedSourceNotSelectableCountAfterAdmission:0,expectedPublicSourceCountAfterAdmission:33,expectedPublicKnowledgePointCountAfterAdmission:245});
export function listG5AU01P03F44SelectorRows(){return clone(G5A_U01_P03F44_SELECTOR_ROWS);}
export function getG5AU01P03F44SelectorRow(id){return clone(G5A_U01_P03F44_SELECTOR_ROWS.find((row)=>row.knowledgePointId===id)??null);}
export function listG5AU01P03F44PatternGroups(id){return clone(G5A_U01_P03F44_PATTERN_GROUPS.filter((group)=>group.primaryKnowledgePointId===id));}
export function resolveG5AU01P03F44PatternSpecIds(id){return clone(G5A_U01_P03F44_PATTERN_GROUPS.find((group)=>group.primaryKnowledgePointId===id)?.patternSpecIds??[]);}
export function auditG5AU01P03F44SelectorProjection(){const errors=[];if(G5A_U01_P03F44_SELECTOR_ROWS.length!==2)errors.push("P03F44_KP_COUNT_INVALID");if(G5A_U01_P03F44_PATTERN_GROUPS.length!==2)errors.push("P03F44_GROUP_COUNT_INVALID");if(P03F44_SPEC_IDS.length!==3||new Set(P03F44_SPEC_IDS).size!==3)errors.push("P03F44_SPEC_COUNT_INVALID");if(G5A_U01_P03F44_PATTERN_GROUPS.some((group)=>group.publicQuestionMode!=="numeric"))errors.push("P03F44_APPLICATION_MODE_LEAK");if(G5A_U01_P03F44_SELECTOR_ROWS.some((r)=>r.patternSpecIds.some((id)=>P03F44_HIDDEN_APPLICATION_SPEC_IDS.includes(id))))errors.push("P03F44_HIDDEN_APPLICATION_SPEC_LEAK");if(P03F44_REQUIRED_CAPABILITY_IDS.includes("cap_decimal_arithmetic"))errors.push("P03F44_DECIMAL_ARITHMETIC_CAPABILITY_LEAK");return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:2,hiddenSiblings:1,patternGroups:2,patternSpecs:3,numeric:3,application:0})});}
