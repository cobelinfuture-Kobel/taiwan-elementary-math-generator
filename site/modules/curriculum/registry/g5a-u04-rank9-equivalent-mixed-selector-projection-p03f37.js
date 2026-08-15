export const P03F37_TASK_ID="P03F_W3DirectProductVerticalSlice037Implementation";
export const G5A_U04_P03F37_SOURCE_ID="g5a_u04_5a04";
export const G5A_U04_P03F37_UNIT_CODE="5A-U04";
export const G5A_U04_P03F37_UNIT_TITLE="擴分約分通分";
export const G5A_U04_P03F37_KP_ID="kp_g5a_u04_equivalent_mixed_selection";
export const G5A_U04_P03F37_GROUP_ID="pg_g5a_u04_equivalent_mixed_selection_numeric";
export const G5A_U04_P03F37_SPEC_IDS=Object.freeze([
  "ps_g5a_u04_equivalent_mixed_selection_whole_numeric",
  "ps_g5a_u04_equivalent_mixed_selection_remainder_numeric",
  "ps_g5a_u04_equivalent_mixed_selection_improper_numerator_numeric",
]);
export const P03F37_REQUIRED_CAPABILITY_IDS=Object.freeze(["cap_fraction_arithmetic","cap_fraction_domain_validator","cap_fraction_number_system"]);
const clone=(v)=>v==null?v:JSON.parse(JSON.stringify(v));
const freeze=(v)=>{if(!v||typeof v!=="object"||Object.isFrozen(v))return v;Object.values(v).forEach(freeze);return Object.freeze(v);};
export const G5A_U04_P03F37_PATTERN_GROUPS=freeze([{
  patternGroupId:G5A_U04_P03F37_GROUP_ID,sourceId:G5A_U04_P03F37_SOURCE_ID,unitCode:G5A_U04_P03F37_UNIT_CODE,unitTitle:G5A_U04_P03F37_UNIT_TITLE,
  displayName:"等值帶分數辨識",primaryKnowledgePointId:G5A_U04_P03F37_KP_ID,knowledgePointIds:[G5A_U04_P03F37_KP_ID],supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",
  representationTag:"improper_mixed_conversion",representationTags:["fraction","mixed_number","improper_fraction","integer_equivalence"],patternSpecIds:G5A_U04_P03F37_SPEC_IDS,
  allocationPolicy:"balanced_by_pattern_spec",visibilityStatus:"visible",holdReason:null,
}]);
export const G5A_U04_P03F37_SELECTOR_ROWS=freeze([{
  knowledgePointId:G5A_U04_P03F37_KP_ID,sourceId:G5A_U04_P03F37_SOURCE_ID,unitCode:G5A_U04_P03F37_UNIT_CODE,unitTitle:G5A_U04_P03F37_UNIT_TITLE,
  displayName:"等值帶分數辨識",canonicalNameZh:"等值帶分數辨識",mode:"numeric",questionMode:"numeric",questionModes:["numeric"],supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,
  applicationClassification:"APPLICATION_NOT_APPLICABLE",canonicalPatternGroupIds:[G5A_U04_P03F37_GROUP_ID],canonicalPatternSpecIds:G5A_U04_P03F37_SPEC_IDS,patternGroupIds:[G5A_U04_P03F37_GROUP_ID],patternSpecIds:G5A_U04_P03F37_SPEC_IDS,
  requiredCapabilityIds:P03F37_REQUIRED_CAPABILITY_IDS,qaStatusLabel:"P03F37_SLICE037_AUTHORITY_FROZEN",productionUse:"full_product_w3_slice037_candidate",
}]);
export const G5A_U04_P03F37_SELECTOR_PROJECTION=freeze({taskId:P03F37_TASK_ID,sourceId:G5A_U04_P03F37_SOURCE_ID,status:"ONE_RANK9_EQUIVALENT_MIXED_KP_ADDED_TO_EXISTING_PUBLIC_SOURCE",knowledgePointCount:1,patternGroupCount:1,patternSpecCount:3,numericPatternSpecCount:3,applicationPatternSpecCount:0,publicSelectionEnabled:true,sharedPipelineRequired:true,applicationModeAllowed:false,expectedSourceVisibleCountBeforeAdmission:5,expectedSourceHiddenCountBeforeAdmission:2,expectedSourceVisibleCountAfterAdmission:6,expectedSourceHiddenCountAfterAdmission:1,expectedPublicSourceCountAfterAdmission:32,expectedPublicKnowledgePointCountAfterAdmission:235});
export function listG5AU04P03F37SelectorRows(){return clone(G5A_U04_P03F37_SELECTOR_ROWS);}
export function getG5AU04P03F37SelectorRow(id){return clone(G5A_U04_P03F37_SELECTOR_ROWS.find((r)=>r.knowledgePointId===id)??null);}
export function listG5AU04P03F37PatternGroups(id){return clone(G5A_U04_P03F37_PATTERN_GROUPS.filter((g)=>g.primaryKnowledgePointId===id));}
export function resolveG5AU04P03F37PatternSpecIds(id){return id===G5A_U04_P03F37_KP_ID?[...G5A_U04_P03F37_SPEC_IDS]:[];}
export function auditG5AU04P03F37SelectorProjection(){const errors=[];if(G5A_U04_P03F37_SELECTOR_ROWS.length!==1)errors.push("P03F37_KP_COUNT_INVALID");if(G5A_U04_P03F37_PATTERN_GROUPS.length!==1)errors.push("P03F37_GROUP_COUNT_INVALID");if(new Set(G5A_U04_P03F37_SPEC_IDS).size!==3)errors.push("P03F37_SPEC_COUNT_INVALID");if(G5A_U04_P03F37_PATTERN_GROUPS[0].publicQuestionMode!=="numeric")errors.push("P03F37_APPLICATION_SCOPE_INVALID");if(JSON.stringify(G5A_U04_P03F37_SELECTOR_ROWS[0].requiredCapabilityIds)!==JSON.stringify(P03F37_REQUIRED_CAPABILITY_IDS))errors.push("P03F37_CAPABILITY_SET_INVALID");return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,numeric:3,application:0})});}
