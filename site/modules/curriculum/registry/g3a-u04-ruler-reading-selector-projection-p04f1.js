export const P04F1_TASK_ID="P04F_W4DirectProductVerticalSlice001Implementation";
export const G3A_U04_P04F1_SOURCE_ID="g3a_u04_3a04";
export const G3A_U04_P04F1_UNIT_CODE="3A-U04";
export const G3A_U04_P04F1_UNIT_TITLE="毫米與數線";
export const G3A_U04_P04F1_KP_ID="kp_length_mm_ruler_reading";
export const G3A_U04_P04F1_GROUP_ID="pg_g3a_u04_length_mm_ruler_reading_numeric";
export const G3A_U04_P04F1_SPEC_ID="ps_g3a_u04_length_mm_ruler_reading_numeric";
export const P04F1_REQUIRED_W4_CAPABILITY_IDS=Object.freeze([
  "cap_mixed_unit_normalization",
  "cap_quantity_domain_validator",
  "cap_scale_instrument_representation",
  "cap_unit_conversion"
]);
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const G3A_U04_P04F1_PATTERN_GROUP=Object.freeze({patternGroupId:G3A_U04_P04F1_GROUP_ID,sourceId:G3A_U04_P04F1_SOURCE_ID,unitCode:G3A_U04_P04F1_UNIT_CODE,unitTitle:G3A_U04_P04F1_UNIT_TITLE,displayName:"毫米直尺讀值",primaryKnowledgePointId:G3A_U04_P04F1_KP_ID,knowledgePointIds:Object.freeze([G3A_U04_P04F1_KP_ID]),supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",representationTag:"measurement_ruler",representationTags:Object.freeze(["numeric","measurement","ruler","millimeter_scale"]),patternSpecIds:Object.freeze([G3A_U04_P04F1_SPEC_ID]),allocationPolicy:"single_pattern_spec",visibilityStatus:"visible",holdReason:null});
export const G3A_U04_P04F1_SELECTOR_ROW=Object.freeze({knowledgePointId:G3A_U04_P04F1_KP_ID,sourceId:G3A_U04_P04F1_SOURCE_ID,unitCode:G3A_U04_P04F1_UNIT_CODE,unitTitle:G3A_U04_P04F1_UNIT_TITLE,displayName:"毫米刻度與直尺讀值",canonicalNameZh:"毫米刻度與直尺讀值",mode:"numeric",questionMode:"numeric",questionModes:Object.freeze(["numeric"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:"DIRECT_SOURCE_SCALE_READING",canonicalPatternGroupIds:Object.freeze([G3A_U04_P04F1_GROUP_ID]),canonicalPatternSpecIds:Object.freeze([G3A_U04_P04F1_SPEC_ID]),patternGroupIds:Object.freeze([G3A_U04_P04F1_GROUP_ID]),patternSpecIds:Object.freeze([G3A_U04_P04F1_SPEC_ID]),requiredCapabilityIds:P04F1_REQUIRED_W4_CAPABILITY_IDS,hiddenApplicationPatternSpecIds:Object.freeze([]),qaStatusLabel:"P04F1_G3A_U04_PAGE1_RULER_MM_DIRECT_WITNESS",productionUse:"full_product_w4_slice001_candidate"});
export const G3A_U04_P04F1_SELECTOR_PROJECTION=Object.freeze({taskId:P04F1_TASK_ID,sourceId:G3A_U04_P04F1_SOURCE_ID,status:"RULER_READING_KP_PROMOTED_ON_NEW_PUBLIC_SOURCE",knowledgePointCount:1,patternGroupCount:1,patternSpecCount:1,numericPatternSpecCount:1,applicationPatternSpecCount:0,publicSelectionEnabled:true,sharedPipelineRequired:true,scaleInstrumentRepresentationRequired:true,expectedSourceVisibleCountAfterAdmission:1,expectedSourceHiddenCountAfterAdmission:0,expectedSourceNotSelectableCountAfterAdmission:0,expectedPublicSourceCountAfterAdmission:35,expectedPublicKnowledgePointCountAfterAdmission:260});
export function listG3AU04P04F1SelectorRows(){return[clone(G3A_U04_P04F1_SELECTOR_ROW)];}
export function getG3AU04P04F1SelectorRow(id){return id===G3A_U04_P04F1_KP_ID?clone(G3A_U04_P04F1_SELECTOR_ROW):null;}
export function listG3AU04P04F1PatternGroups(id){return id===G3A_U04_P04F1_KP_ID?[clone(G3A_U04_P04F1_PATTERN_GROUP)]:[];}
export function resolveG3AU04P04F1PatternSpecIds(id){return id===G3A_U04_P04F1_KP_ID?[G3A_U04_P04F1_SPEC_ID]:[];}
export function auditG3AU04P04F1SelectorProjection(){const errors=[],rows=listG3AU04P04F1SelectorRows();if(rows.length!==1)errors.push("P04F1_KP_COUNT_INVALID");if(rows[0]?.patternSpecIds?.length!==1)errors.push("P04F1_SPEC_COUNT_INVALID");if(JSON.stringify(rows[0]?.requiredCapabilityIds)!==JSON.stringify(P04F1_REQUIRED_W4_CAPABILITY_IDS))errors.push("P04F1_CAPABILITY_SET_INVALID");if(rows[0]?.questionMode!=="numeric")errors.push("P04F1_NUMERIC_SURFACE_INVALID");if(rows[0]?.applicationClassification!=="DIRECT_SOURCE_SCALE_READING")errors.push("P04F1_SOURCE_CLASSIFICATION_INVALID");return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:1,numeric:1,application:0})});}
