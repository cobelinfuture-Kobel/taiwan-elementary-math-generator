export const P06F02_TASK_ID="P06F_W6DirectProductVerticalSlice002Implementation";
export const G3A_U07_P06F02_SOURCE_ID="g3a_u07_3a07";
export const G3A_U07_P06F02_UNIT_CODE="3A-U07";
export const G3A_U07_P06F02_UNIT_TITLE="尋找規律";
export const G3A_U07_P06F02_KP_ID="kp_tabular_pattern_rule";
export const G3A_U07_P06F02_PREDECESSOR_KP_IDS=Object.freeze(["kp_arithmetic_sequence_extension","kp_repeating_visual_pattern","kp_spatial_growth_pattern_count"]);
export const G3A_U07_P06F02_QUEUE_REQUIRED_CAPABILITY_IDS=Object.freeze(["cap_data_domain_validator","cap_table_data_model","cap_table_representation"]);
export const G3A_U07_P06F02_REQUIRED_CAPABILITY_IDS=G3A_U07_P06F02_QUEUE_REQUIRED_CAPABILITY_IDS;
export const G3A_U07_P06F02_INCLUDED_RELATIONS=Object.freeze(["ORGANIZE_STAGE_INDEX_AND_QUANTITY_AS_TABLE_PAIRS","READ_OR_COMPLETE_A_TABULAR_PATTERN_PAIR","INFER_ONE_CONSISTENT_TABULAR_CORRESPONDENCE_RULE"]);
export const G3A_U07_P06F02_PATTERN_GROUP_ID="pg_g3a_u07_tabular_pattern_rule";
const spec=(id,relation)=>Object.freeze({patternSpecId:id,knowledgePointId:G3A_U07_P06F02_KP_ID,patternGroupId:G3A_U07_P06F02_PATTERN_GROUP_ID,patternFamilyId:"TABLE_DATA_PATTERN",relation,questionMode:"numeric",answerDomain:"INTEGER",requiresTableDataModel:true,requiresDataDomainValidation:true,requiresTableRepresentation:true,chartDataModelRequired:false,patternRelationReowned:false,symbolicNthTermFormulaRequired:false,applicationAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false});
export const G3A_U07_P06F02_PATTERN_SPECS=Object.freeze([
  spec("ps_g3a_u07_tabular_pattern_complete_output",G3A_U07_P06F02_INCLUDED_RELATIONS[0]),
  spec("ps_g3a_u07_tabular_pattern_complete_input",G3A_U07_P06F02_INCLUDED_RELATIONS[1]),
  spec("ps_g3a_u07_tabular_pattern_infer_output",G3A_U07_P06F02_INCLUDED_RELATIONS[2])
]);
export const G3A_U07_P06F02_SPEC_IDS=Object.freeze(G3A_U07_P06F02_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G3A_U07_P06F02_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g3a_u07_tabular_pattern_rule_p06f02",
  r04MappingId:"r04map_tabular_pattern_rule",
  sourceId:G3A_U07_P06F02_SOURCE_ID,
  sourcePages:Object.freeze([1]),
  knowledgePointId:G3A_U07_P06F02_KP_ID,
  canonicalNameZh:"列表對應規律",
  capabilityStatement:"學生能把圖形階段、項次與數量整理成表格並找出對應規則。",
  reasoningInvariant:"每一列或欄的輸入與輸出必須符合相同對應關係。",
  primaryRuntimeProfileId:"profile_table_data",
  requiredCapabilityIds:G3A_U07_P06F02_REQUIRED_CAPABILITY_IDS,
  queueRequiredW6CapabilityIds:G3A_U07_P06F02_QUEUE_REQUIRED_CAPABILITY_IDS,
  optionalRuntimeCapabilityIds:Object.freeze([]),
  patternSpecIds:G3A_U07_P06F02_SPEC_IDS,
  applicationImplementationAllowed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false,
  r04ReclassificationAllowed:false,
  q001PatternRelationReownershipAllowed:false,
  q003OrLaterTouched:false
});
export const G3A_U07_P06F02_PATTERN_GROUP=Object.freeze({
  patternGroupId:G3A_U07_P06F02_PATTERN_GROUP_ID,
  sourceId:G3A_U07_P06F02_SOURCE_ID,
  unitCode:G3A_U07_P06F02_UNIT_CODE,
  unitTitle:G3A_U07_P06F02_UNIT_TITLE,
  displayName:"列表對應規律",
  primaryKnowledgePointId:G3A_U07_P06F02_KP_ID,
  knowledgePointIds:Object.freeze([G3A_U07_P06F02_KP_ID]),
  supportClass:"A",
  mode:"numeric",
  publicQuestionMode:"numeric",
  representationTag:"tabular_pattern_table",
  representationTags:Object.freeze(["table","pattern","stage_quantity"]),
  patternSpecIds:G3A_U07_P06F02_SPEC_IDS,
  allocationPolicy:"balanced_pattern_spec",
  visibilityStatus:"visible",
  holdReason:null
});
export const G3A_U07_P06F02_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G3A_U07_P06F02_KP_ID,
  sourceId:G3A_U07_P06F02_SOURCE_ID,
  unitCode:G3A_U07_P06F02_UNIT_CODE,
  unitTitle:G3A_U07_P06F02_UNIT_TITLE,
  displayName:"列表對應規律",
  canonicalNameZh:"列表對應規律",
  mode:"numeric",
  questionMode:"numeric",
  questionModes:Object.freeze(["numeric"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:"APPLICATION_COMPATIBLE",
  canonicalPatternGroupIds:Object.freeze([G3A_U07_P06F02_PATTERN_GROUP_ID]),
  canonicalPatternSpecIds:G3A_U07_P06F02_SPEC_IDS,
  patternGroupIds:Object.freeze([G3A_U07_P06F02_PATTERN_GROUP_ID]),
  patternSpecIds:G3A_U07_P06F02_SPEC_IDS,
  requiredCapabilityIds:G3A_U07_P06F02_REQUIRED_CAPABILITY_IDS,
  qaStatusLabel:"P06F02_G3A_U07_SOURCE_BACKED_TABLE_DATA",
  productionUse:"full_product_w6_slice002_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG3AU07P06F02SelectorRow=id=>id===G3A_U07_P06F02_KP_ID?clone(G3A_U07_P06F02_SELECTOR_ROW):null;
export const listG3AU07P06F02PatternGroups=id=>id===G3A_U07_P06F02_KP_ID?[clone(G3A_U07_P06F02_PATTERN_GROUP)]:[];
export const resolveG3AU07P06F02PatternSpecIds=id=>id===G3A_U07_P06F02_KP_ID?[...G3A_U07_P06F02_SPEC_IDS]:[];
export function auditG3AU07P06F02Projection(){
  const e=[];
  if(G3A_U07_P06F02_PATTERN_SPECS.length!==3||new Set(G3A_U07_P06F02_SPEC_IDS).size!==3)e.push("P06F02_PATTERN_CARDINALITY_INVALID");
  if(G3A_U07_P06F02_PATTERN_SPECS.some(x=>x.questionMode!=="numeric"||!x.requiresTableDataModel||!x.requiresDataDomainValidation||!x.requiresTableRepresentation||x.chartDataModelRequired||x.patternRelationReowned||x.symbolicNthTermFormulaRequired||x.applicationAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed))e.push("P06F02_PATTERN_INVARIANT_INVALID");
  if(G3A_U07_P06F02_FORMAL_MAPPING.primaryRuntimeProfileId!=="profile_table_data"||G3A_U07_P06F02_FORMAL_MAPPING.r04ReclassificationAllowed||G3A_U07_P06F02_FORMAL_MAPPING.q001PatternRelationReownershipAllowed||G3A_U07_P06F02_FORMAL_MAPPING.q003OrLaterTouched)e.push("P06F02_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1})});
}
