export const P04F16_TASK_ID="P04F_W4DirectProductVerticalSlice016Implementation";
export const G4A_U10_P04F16_SOURCE_ID="g4a_u10_4a10";
export const G4A_U10_P04F16_UNIT_CODE="4A-U10";
export const G4A_U10_P04F16_UNIT_TITLE="公里";
export const G4A_U10_P04F16_ADD_SUB_KP_ID="kp_g4a_u10_length_km_m_add_sub";
export const G4A_U10_P04F16_COMPARE_KP_ID="kp_g4a_u10_length_km_m_mixed_compare";
export const G4A_U10_P04F16_ADD_SUB_GROUP_ID="pg_g4a_u10_length_km_m_add_sub_numeric";
export const G4A_U10_P04F16_COMPARE_GROUP_ID="pg_g4a_u10_length_km_m_mixed_compare_numeric";
export const G4A_U10_P04F16_ADD_SUB_SPEC_ID="ps_g4a_u10_length_km_m_add_sub_numeric";
export const G4A_U10_P04F16_COMPARE_SPEC_ID="ps_g4a_u10_length_km_m_mixed_compare_numeric";
export const P04F16_REQUIRED_W4_CAPABILITY_IDS=Object.freeze(["cap_mixed_unit_normalization","cap_quantity_domain_validator","cap_unit_conversion"]);
export const P04F16_RESERVED_SUCCESSOR_KP_IDS=Object.freeze(["kp_g4a_u10_route_distance_application"]);
const defs=[
 [G4A_U10_P04F16_ADD_SUB_KP_ID,G4A_U10_P04F16_ADD_SUB_GROUP_ID,G4A_U10_P04F16_ADD_SUB_SPEC_ID,"公里公尺加減","length_km_m_add_sub","DIRECT_SOURCE_LENGTH_KM_M_ADD_SUB"],
 [G4A_U10_P04F16_COMPARE_KP_ID,G4A_U10_P04F16_COMPARE_GROUP_ID,G4A_U10_P04F16_COMPARE_SPEC_ID,"公里公尺比較","length_km_m_mixed_compare","DIRECT_SOURCE_LENGTH_KM_M_MIXED_COMPARE"]
];
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const G4A_U10_P04F16_PATTERN_GROUPS=Object.freeze(defs.map(([kp,group,spec,name,rep])=>Object.freeze({patternGroupId:group,sourceId:G4A_U10_P04F16_SOURCE_ID,unitCode:G4A_U10_P04F16_UNIT_CODE,unitTitle:G4A_U10_P04F16_UNIT_TITLE,displayName:name,primaryKnowledgePointId:kp,knowledgePointIds:Object.freeze([kp]),supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",representationTag:rep,representationTags:Object.freeze(["numeric","quantity_measurement","length",rep]),patternSpecIds:Object.freeze([spec]),allocationPolicy:"single_pattern_spec",visibilityStatus:"visible",holdReason:null})));
export const G4A_U10_P04F16_SELECTOR_ROWS=Object.freeze(defs.map(([kp,group,spec,name,,classification])=>Object.freeze({knowledgePointId:kp,sourceId:G4A_U10_P04F16_SOURCE_ID,unitCode:G4A_U10_P04F16_UNIT_CODE,unitTitle:G4A_U10_P04F16_UNIT_TITLE,displayName:name,canonicalNameZh:name,mode:"numeric",questionMode:"numeric",questionModes:Object.freeze(["numeric"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:classification,canonicalPatternGroupIds:Object.freeze([group]),canonicalPatternSpecIds:Object.freeze([spec]),patternGroupIds:Object.freeze([group]),patternSpecIds:Object.freeze([spec]),requiredCapabilityIds:P04F16_REQUIRED_W4_CAPABILITY_IDS,hiddenApplicationPatternSpecIds:Object.freeze([]),qaStatusLabel:`P04F16_G4A_U10_${kp.toUpperCase()}`,productionUse:"full_product_w4_slice016_candidate"})));
export const G4A_U10_P04F16_SELECTOR_PROJECTION=Object.freeze({taskId:P04F16_TASK_ID,sourceId:G4A_U10_P04F16_SOURCE_ID,status:"Q016_TWO_LENGTH_RANK2_KPS_PROMOTED_ON_EXISTING_PUBLIC_SOURCE",knowledgePointCount:2,patternGroupCount:2,patternSpecCount:2,numericPatternSpecCount:2,applicationPatternSpecCount:0,publicSelectionEnabled:true,sharedPipelineRequired:true,expectedSourceVisibleCountAfterAdmission:4,expectedSourceHiddenCountAfterAdmission:0,expectedSourceNotSelectableCountAfterAdmission:0,expectedPublicSourceCountAfterAdmission:40,expectedPublicKnowledgePointCountAfterAdmission:284,reservedSuccessorKnowledgePointIds:P04F16_RESERVED_SUCCESSOR_KP_IDS});
export function listG4AU10P04F16SelectorRows(){return G4A_U10_P04F16_SELECTOR_ROWS.map(clone);}
export function getG4AU10P04F16SelectorRow(id){return clone(G4A_U10_P04F16_SELECTOR_ROWS.find(r=>r.knowledgePointId===id)??null);}
export function listG4AU10P04F16PatternGroups(id){return G4A_U10_P04F16_PATTERN_GROUPS.filter(g=>g.primaryKnowledgePointId===id).map(clone);}
export function resolveG4AU10P04F16PatternSpecIds(id){const row=G4A_U10_P04F16_SELECTOR_ROWS.find(r=>r.knowledgePointId===id);return row?[...row.patternSpecIds]:[];}
export function auditG4AU10P04F16SelectorProjection(){const errors=[];if(G4A_U10_P04F16_SELECTOR_ROWS.length!==2)errors.push("P04F16_KP_COUNT_INVALID");if(new Set(G4A_U10_P04F16_SELECTOR_ROWS.flatMap(r=>r.patternSpecIds)).size!==2)errors.push("P04F16_SPEC_IDENTITY_INVALID");for(const row of G4A_U10_P04F16_SELECTOR_ROWS)if(JSON.stringify([...row.requiredCapabilityIds].sort())!==JSON.stringify([...P04F16_REQUIRED_W4_CAPABILITY_IDS].sort()))errors.push(`P04F16_CAPABILITY_SET_INVALID:${row.knowledgePointId}`);return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:2,patternGroups:2,patternSpecs:2,numeric:2,application:0})});}
