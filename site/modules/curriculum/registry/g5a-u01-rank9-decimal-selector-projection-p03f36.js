export const P03F36_TASK_ID="P03F_W3DirectProductVerticalSlice036Implementation";
export const G5A_U01_P03F36_SOURCE_ID="g5a_u01_5a01";
export const G5A_U01_P03F36_UNIT_CODE="5A-U01";
export const G5A_U01_P03F36_UNIT_TITLE="多位小數與加減";
export const P03F36_REQUIRED_CAPABILITY_IDS=Object.freeze(["cap_decimal_arithmetic","cap_decimal_domain_validator","cap_decimal_number_system"]);
export const G5A_U01_P03F36_KP_IDS=Object.freeze(["kp_g5a_u01_decimal_add_sub","kp_g5a_u01_decimal_compare","kp_g5a_u01_place_value_factor_relation"]);
export const G5A_U01_P03F36_ADD_SUB_KP_ID=G5A_U01_P03F36_KP_IDS[0];
export const G5A_U01_P03F36_COMPARE_KP_ID=G5A_U01_P03F36_KP_IDS[1];
export const G5A_U01_P03F36_FACTOR_KP_ID=G5A_U01_P03F36_KP_IDS[2];
export const G5A_U01_P03F36_ADD_SUB_GROUP_ID="pg_g5a_u01_decimal_add_sub_numeric";
export const G5A_U01_P03F36_COMPARE_GROUP_ID="pg_g5a_u01_decimal_compare_numeric";
export const G5A_U01_P03F36_FACTOR_GROUP_ID="pg_g5a_u01_place_value_factor_relation_numeric";
export const G5A_U01_P03F36_ADD_SUB_SPEC_ID="ps_g5a_u01_decimal_add_sub_result_numeric";
export const G5A_U01_P03F36_COMPARE_SPEC_ID="ps_g5a_u01_decimal_compare_comparison_numeric";
export const G5A_U01_P03F36_FACTOR_SPEC_IDS=Object.freeze(["ps_g5a_u01_place_value_factor_relation_higher_place_value_numeric","ps_g5a_u01_place_value_factor_relation_lower_place_value_numeric"]);
export const G5A_U01_P03F36_NUMERIC_PATTERN_SPEC_IDS=Object.freeze([G5A_U01_P03F36_ADD_SUB_SPEC_ID,G5A_U01_P03F36_COMPARE_SPEC_ID,...G5A_U01_P03F36_FACTOR_SPEC_IDS]);
const clone=(v)=>v==null?v:JSON.parse(JSON.stringify(v));
const group=(id,kp,name,specs,tags)=>Object.freeze({patternGroupId:id,sourceId:G5A_U01_P03F36_SOURCE_ID,unitCode:G5A_U01_P03F36_UNIT_CODE,unitTitle:G5A_U01_P03F36_UNIT_TITLE,displayName:name,primaryKnowledgePointId:kp,knowledgePointIds:Object.freeze([kp]),supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",representationTag:tags[0],representationTags:Object.freeze(tags),patternSpecIds:Object.freeze(specs),allocationPolicy:specs.length>1?"balanced_by_pattern_spec":"single_pattern_spec",visibilityStatus:"visible",holdReason:null});
export const G5A_U01_P03F36_PATTERN_GROUPS=Object.freeze([
 group(G5A_U01_P03F36_ADD_SUB_GROUP_ID,G5A_U01_P03F36_ADD_SUB_KP_ID,"多位小數加減",[G5A_U01_P03F36_ADD_SUB_SPEC_ID],["decimal_add_sub","decimal","aligned_decimal"]),
 group(G5A_U01_P03F36_COMPARE_GROUP_ID,G5A_U01_P03F36_COMPARE_KP_ID,"多位小數比較",[G5A_U01_P03F36_COMPARE_SPEC_ID],["decimal_compare","decimal","place_value"]),
 group(G5A_U01_P03F36_FACTOR_GROUP_ID,G5A_U01_P03F36_FACTOR_KP_ID,"小數位值倍數關係",G5A_U01_P03F36_FACTOR_SPEC_IDS,["place_factor","decimal","base_ten"])
]);
const row=(kp,name,groupId,specs,classification,capabilities)=>Object.freeze({knowledgePointId:kp,sourceId:G5A_U01_P03F36_SOURCE_ID,unitCode:G5A_U01_P03F36_UNIT_CODE,unitTitle:G5A_U01_P03F36_UNIT_TITLE,displayName:name,canonicalNameZh:name,mode:"numeric",questionMode:"numeric",questionModes:Object.freeze(["numeric"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:classification,canonicalPatternGroupIds:Object.freeze([groupId]),canonicalPatternSpecIds:Object.freeze(specs),patternGroupIds:Object.freeze([groupId]),patternSpecIds:Object.freeze(specs),requiredCapabilityIds:Object.freeze(capabilities),qaStatusLabel:"P03F36_SLICE036_AUTHORITY_FROZEN",productionUse:"full_product_w3_slice036_candidate"});
export const G5A_U01_P03F36_SELECTOR_ROWS=Object.freeze([
 row(G5A_U01_P03F36_ADD_SUB_KP_ID,"多位小數加減",G5A_U01_P03F36_ADD_SUB_GROUP_ID,[G5A_U01_P03F36_ADD_SUB_SPEC_ID],"APPLICATION_COMPATIBLE",P03F36_REQUIRED_CAPABILITY_IDS),
 row(G5A_U01_P03F36_COMPARE_KP_ID,"多位小數比較",G5A_U01_P03F36_COMPARE_GROUP_ID,[G5A_U01_P03F36_COMPARE_SPEC_ID],"APPLICATION_COMPATIBLE",["cap_decimal_domain_validator","cap_decimal_number_system"]),
 row(G5A_U01_P03F36_FACTOR_KP_ID,"小數位值倍數關係",G5A_U01_P03F36_FACTOR_GROUP_ID,G5A_U01_P03F36_FACTOR_SPEC_IDS,"APPLICATION_NOT_APPLICABLE",["cap_decimal_domain_validator","cap_decimal_number_system"])
]);
export const G5A_U01_P03F36_SELECTOR_PROJECTION=Object.freeze({taskId:P03F36_TASK_ID,sourceId:G5A_U01_P03F36_SOURCE_ID,status:"THREE_RANK9_DECIMAL_KPS_ADDED_TO_EXISTING_PUBLIC_SOURCE",knowledgePointCount:3,patternGroupCount:3,patternSpecCount:4,numericPatternSpecCount:4,applicationPatternSpecCount:0,publicSelectionEnabled:true,sharedPipelineRequired:true,applicationModeAllowed:false,expectedSourceVisibleCountBeforeAdmission:2,expectedSourceHiddenCountBeforeAdmission:6,expectedSourceVisibleCountAfterAdmission:5,expectedSourceHiddenCountAfterAdmission:3,expectedPublicSourceCountAfterAdmission:32,expectedPublicKnowledgePointCountAfterAdmission:234});
export function listG5AU01P03F36SelectorRows(){return clone(G5A_U01_P03F36_SELECTOR_ROWS);}
export function getG5AU01P03F36SelectorRow(id){return clone(G5A_U01_P03F36_SELECTOR_ROWS.find((r)=>r.knowledgePointId===id)??null);}
export function listG5AU01P03F36PatternGroups(id){return clone(G5A_U01_P03F36_PATTERN_GROUPS.filter((g)=>g.primaryKnowledgePointId===id));}
export function resolveG5AU01P03F36PatternSpecIds(id){return clone(G5A_U01_P03F36_PATTERN_GROUPS.filter((g)=>g.primaryKnowledgePointId===id).flatMap((g)=>g.patternSpecIds));}
export function auditG5AU01P03F36SelectorProjection(){const errors=[];if(G5A_U01_P03F36_SELECTOR_ROWS.length!==3)errors.push("P03F36_KP_COUNT_INVALID");if(G5A_U01_P03F36_PATTERN_GROUPS.length!==3)errors.push("P03F36_GROUP_COUNT_INVALID");if(new Set(G5A_U01_P03F36_NUMERIC_PATTERN_SPEC_IDS).size!==4)errors.push("P03F36_SPEC_COUNT_INVALID");if(G5A_U01_P03F36_PATTERN_GROUPS.some((g)=>g.publicQuestionMode!=="numeric"))errors.push("P03F36_APPLICATION_SCOPE_INVALID");return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:3,patternGroups:3,patternSpecs:4,numeric:4,application:0})});}
