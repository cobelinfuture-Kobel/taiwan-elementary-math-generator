export const P04F15_TASK_ID="P04F_W4DirectProductVerticalSlice015Implementation";
export const G3B_U06_P04F15_SOURCE_ID="g3b_u06_3b06";
export const G3B_U06_P04F15_UNIT_CODE="3B-U06";
export const G3B_U06_P04F15_UNIT_TITLE="公斤與公克";
export const G3B_U06_P04F15_ADD_SUB_KP_ID="kp_mass_mixed_unit_add_sub";
export const G3B_U06_P04F15_COMPARE_KP_ID="kp_mass_mixed_unit_compare";
export const G3B_U06_P04F15_TIMES_KP_ID="kp_mass_times_integer";
export const G3B_U06_P04F15_ADD_SUB_GROUP_ID="pg_g3b_u06_mass_mixed_unit_add_sub_numeric";
export const G3B_U06_P04F15_COMPARE_GROUP_ID="pg_g3b_u06_mass_mixed_unit_compare_numeric";
export const G3B_U06_P04F15_TIMES_GROUP_ID="pg_g3b_u06_mass_times_integer_numeric";
export const G3B_U06_P04F15_ADD_SUB_SPEC_ID="ps_g3b_u06_mass_mixed_unit_add_sub_numeric";
export const G3B_U06_P04F15_COMPARE_SPEC_ID="ps_g3b_u06_mass_mixed_unit_compare_numeric";
export const G3B_U06_P04F15_TIMES_SPEC_ID="ps_g3b_u06_mass_times_integer_numeric";
export const P04F15_REQUIRED_W4_CAPABILITY_IDS=Object.freeze(["cap_mixed_unit_normalization","cap_quantity_domain_validator","cap_unit_conversion"]);
const defs=[
 [G3B_U06_P04F15_ADD_SUB_KP_ID,G3B_U06_P04F15_ADD_SUB_GROUP_ID,G3B_U06_P04F15_ADD_SUB_SPEC_ID,"公斤公克加減","mass_mixed_unit_add_sub","DIRECT_SOURCE_MASS_MIXED_UNIT_ADD_SUB"],
 [G3B_U06_P04F15_COMPARE_KP_ID,G3B_U06_P04F15_COMPARE_GROUP_ID,G3B_U06_P04F15_COMPARE_SPEC_ID,"公斤公克比較","mass_mixed_unit_compare","DIRECT_SOURCE_MASS_MIXED_UNIT_COMPARE"],
 [G3B_U06_P04F15_TIMES_KP_ID,G3B_U06_P04F15_TIMES_GROUP_ID,G3B_U06_P04F15_TIMES_SPEC_ID,"重量乘整數","mass_times_integer","DIRECT_SOURCE_MASS_TIMES_INTEGER"]
];
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const G3B_U06_P04F15_PATTERN_GROUPS=Object.freeze(defs.map(([kp,group,spec,name,rep])=>Object.freeze({patternGroupId:group,sourceId:G3B_U06_P04F15_SOURCE_ID,unitCode:G3B_U06_P04F15_UNIT_CODE,unitTitle:G3B_U06_P04F15_UNIT_TITLE,displayName:name,primaryKnowledgePointId:kp,knowledgePointIds:Object.freeze([kp]),supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",representationTag:rep,representationTags:Object.freeze(["numeric","quantity_measurement","mass",rep]),patternSpecIds:Object.freeze([spec]),allocationPolicy:"single_pattern_spec",visibilityStatus:"visible",holdReason:null})));
export const G3B_U06_P04F15_SELECTOR_ROWS=Object.freeze(defs.map(([kp,group,spec,name,,classification])=>Object.freeze({knowledgePointId:kp,sourceId:G3B_U06_P04F15_SOURCE_ID,unitCode:G3B_U06_P04F15_UNIT_CODE,unitTitle:G3B_U06_P04F15_UNIT_TITLE,displayName:name,canonicalNameZh:name,mode:"numeric",questionMode:"numeric",questionModes:Object.freeze(["numeric"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:classification,canonicalPatternGroupIds:Object.freeze([group]),canonicalPatternSpecIds:Object.freeze([spec]),patternGroupIds:Object.freeze([group]),patternSpecIds:Object.freeze([spec]),requiredCapabilityIds:P04F15_REQUIRED_W4_CAPABILITY_IDS,hiddenApplicationPatternSpecIds:Object.freeze([]),qaStatusLabel:`P04F15_G3B_U06_${kp.toUpperCase()}`,productionUse:"full_product_w4_slice015_candidate"})));
export const G3B_U06_P04F15_SELECTOR_PROJECTION=Object.freeze({taskId:P04F15_TASK_ID,sourceId:G3B_U06_P04F15_SOURCE_ID,status:"Q015_THREE_MASS_RANK2_KPS_PROMOTED_ON_EXISTING_PUBLIC_SOURCE",knowledgePointCount:3,patternGroupCount:3,patternSpecCount:3,numericPatternSpecCount:3,applicationPatternSpecCount:0,publicSelectionEnabled:true,sharedPipelineRequired:true,expectedSourceVisibleCountAfterAdmission:6,expectedSourceHiddenCountAfterAdmission:0,expectedSourceNotSelectableCountAfterAdmission:0,expectedPublicSourceCountAfterAdmission:40,expectedPublicKnowledgePointCountAfterAdmission:282,reservedSuccessorKnowledgePointIds:Object.freeze([])});
export function listG3BU06P04F15SelectorRows(){return G3B_U06_P04F15_SELECTOR_ROWS.map(clone);}
export function getG3BU06P04F15SelectorRow(id){return clone(G3B_U06_P04F15_SELECTOR_ROWS.find(r=>r.knowledgePointId===id)??null);}
export function listG3BU06P04F15PatternGroups(id){return G3B_U06_P04F15_PATTERN_GROUPS.filter(g=>g.primaryKnowledgePointId===id).map(clone);}
export function resolveG3BU06P04F15PatternSpecIds(id){const row=G3B_U06_P04F15_SELECTOR_ROWS.find(r=>r.knowledgePointId===id);return row?[...row.patternSpecIds]:[];}
export function auditG3BU06P04F15SelectorProjection(){const errors=[];if(G3B_U06_P04F15_SELECTOR_ROWS.length!==3)errors.push("P04F15_KP_COUNT_INVALID");if(new Set(G3B_U06_P04F15_SELECTOR_ROWS.flatMap(r=>r.patternSpecIds)).size!==3)errors.push("P04F15_SPEC_IDENTITY_INVALID");for(const row of G3B_U06_P04F15_SELECTOR_ROWS)if(JSON.stringify([...row.requiredCapabilityIds].sort())!==JSON.stringify([...P04F15_REQUIRED_W4_CAPABILITY_IDS].sort()))errors.push(`P04F15_CAPABILITY_SET_INVALID:${row.knowledgePointId}`);return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:3,patternGroups:3,patternSpecs:3,numeric:3,application:0})});}
