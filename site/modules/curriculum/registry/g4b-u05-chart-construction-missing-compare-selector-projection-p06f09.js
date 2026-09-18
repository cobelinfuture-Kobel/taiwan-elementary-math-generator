export const P06F09_TASK_ID="P06F_W6DirectProductVerticalSlice009Implementation";
export const G4B_U05_P06F09_SOURCE_ID="g4b_u05_4b05";
export const G4B_U05_P06F09_UNIT_CODE="4B-U05";
export const G4B_U05_P06F09_UNIT_TITLE="統計圖表";
export const G4B_U05_P06F09_CONSTRUCTION_KP_ID="kp_g4b_u05_bar_chart_construction";
export const G4B_U05_P06F09_MISSING_KP_ID="kp_g4b_u05_chart_missing_value_total";
export const G4B_U05_P06F09_COMPARE_KP_ID="kp_g4b_u05_multi_category_chart_compare";
export const G4B_U05_P06F09_TARGET_KP_IDS=Object.freeze([G4B_U05_P06F09_CONSTRUCTION_KP_ID,G4B_U05_P06F09_MISSING_KP_ID,G4B_U05_P06F09_COMPARE_KP_ID]);
export const G4B_U05_P06F09_PREDECESSOR_KP_IDS=Object.freeze(["kp_g4b_u05_bar_chart_reading","kp_g4b_u05_chart_scale_interpretation"]);
export const G4B_U05_P06F09_QUEUE_REQUIRED_CAPABILITY_IDS=Object.freeze(["cap_chart_data_model","cap_chart_representation","cap_data_domain_validator","cap_table_data_model"]);
export const G4B_U05_P06F09_INCLUDED_RELATIONS=Object.freeze(["CONSTRUCT_BAR_CHART_FROM_TABLE_AND_COMMON_SCALE","SOLVE_CHART_MISSING_VALUE_FROM_SPECIFIED_TOTAL","COMPARE_MULTI_CATEGORY_CHART_VALUES_ON_COMMON_SCALE"]);
const GROUP_BY_KP=Object.freeze({
  [G4B_U05_P06F09_CONSTRUCTION_KP_ID]:"pg_g4b_u05_bar_chart_construction",
  [G4B_U05_P06F09_MISSING_KP_ID]:"pg_g4b_u05_chart_missing_value_total",
  [G4B_U05_P06F09_COMPARE_KP_ID]:"pg_g4b_u05_multi_category_chart_compare"
});
const CORE_BY_KP=Object.freeze({
  [G4B_U05_P06F09_CONSTRUCTION_KP_ID]:"BAR_CHART_CONSTRUCTION",
  [G4B_U05_P06F09_MISSING_KP_ID]:"CHART_MISSING_VALUE_TOTAL",
  [G4B_U05_P06F09_COMPARE_KP_ID]:"MULTI_CATEGORY_CHART_COMPARE"
});
const SPEC_BY_KP=Object.freeze({
  [G4B_U05_P06F09_CONSTRUCTION_KP_ID]:"ps_g4b_u05_bar_chart_construct_from_table",
  [G4B_U05_P06F09_MISSING_KP_ID]:"ps_g4b_u05_chart_missing_from_total",
  [G4B_U05_P06F09_COMPARE_KP_ID]:"ps_g4b_u05_multi_category_difference"
});
const spec=(kp,relation)=>Object.freeze({
  patternSpecId:SPEC_BY_KP[kp],
  knowledgePointId:kp,
  patternGroupId:GROUP_BY_KP[kp],
  patternFamilyId:CORE_BY_KP[kp],
  relation,
  semanticCore:CORE_BY_KP[kp],
  questionMode:"numeric",
  answerDomain:"INTEGER",
  requiresChartDataModel:true,
  requiresDataDomainValidation:true,
  requiresChartRepresentation:true,
  requiresTableDataDependencyClosure:true,
  sourceTableRequired:kp===G4B_U05_P06F09_CONSTRUCTION_KP_ID,
  maskedBarRequired:kp!==G4B_U05_P06F09_COMPARE_KP_ID,
  q007PredecessorReownershipAllowed:false,
  lineChartAllowed:false,
  pieChartAllowed:false,
  applicationAllowed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false
});
export const G4B_U05_P06F09_PATTERN_SPECS=Object.freeze(G4B_U05_P06F09_TARGET_KP_IDS.map((kp,i)=>spec(kp,G4B_U05_P06F09_INCLUDED_RELATIONS[i])));
export const G4B_U05_P06F09_SPEC_IDS=Object.freeze(G4B_U05_P06F09_PATTERN_SPECS.map(x=>x.patternSpecId));
const candidateByKp=Object.freeze({
  [G4B_U05_P06F09_CONSTRUCTION_KP_ID]:Object.freeze({canonicalNameZh:"繪製長條圖",capabilityStatement:"學生能由資料表設定刻度並畫出正確長條圖。",reasoningInvariant:"每個類別長條高度須與資料值及共同尺度一致。"}),
  [G4B_U05_P06F09_MISSING_KP_ID]:Object.freeze({canonicalNameZh:"圖表合計與缺值",capabilityStatement:"學生能由總量與部分圖表資料求缺失值。",reasoningInvariant:"所有類別數值和必須等於指定總量。"}),
  [G4B_U05_P06F09_COMPARE_KP_ID]:Object.freeze({canonicalNameZh:"多類別圖表比較",capabilityStatement:"學生能比較不同類別的大小、差量與排序。",reasoningInvariant:"所有比較必須使用相同尺度與對應類別。"})
});
export const G4B_U05_P06F09_FORMAL_MAPPINGS=Object.freeze(G4B_U05_P06F09_TARGET_KP_IDS.map(kp=>Object.freeze({
  mappingId:`fm_${kp.replace(/^kp_/,"")}_p06f09`,
  r04MappingId:`r04map_${kp.replace(/^kp_/,"")}`,
  sourceId:G4B_U05_P06F09_SOURCE_ID,
  sourcePages:Object.freeze([1,2]),
  knowledgePointId:kp,
  ...candidateByKp[kp],
  sourceSemanticCore:CORE_BY_KP[kp],
  primaryRuntimeProfileId:"profile_chart_data",
  requiredCapabilityIds:G4B_U05_P06F09_QUEUE_REQUIRED_CAPABILITY_IDS,
  queueRequiredW6CapabilityIds:G4B_U05_P06F09_QUEUE_REQUIRED_CAPABILITY_IDS,
  optionalRuntimeCapabilityIds:Object.freeze([]),
  patternSpecIds:Object.freeze([SPEC_BY_KP[kp]]),
  q007PredecessorReownershipAllowed:false,
  applicationImplementationAllowed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false,
  r04ReclassificationAllowed:false,
  q010OrLaterTouched:false
})));
export const G4B_U05_P06F09_PATTERN_GROUPS=Object.freeze(G4B_U05_P06F09_TARGET_KP_IDS.map(kp=>{
  const c=candidateByKp[kp],specId=SPEC_BY_KP[kp];
  const tags=kp===G4B_U05_P06F09_CONSTRUCTION_KP_ID?["chart","bar_chart","construction","source_table","common_scale"]:kp===G4B_U05_P06F09_MISSING_KP_ID?["chart","bar_chart","missing_value","total"]:["chart","bar_chart","comparison","common_scale"];
  return Object.freeze({patternGroupId:GROUP_BY_KP[kp],sourceId:G4B_U05_P06F09_SOURCE_ID,unitCode:G4B_U05_P06F09_UNIT_CODE,unitTitle:G4B_U05_P06F09_UNIT_TITLE,displayName:c.canonicalNameZh,primaryKnowledgePointId:kp,knowledgePointIds:Object.freeze([kp]),supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",representationTag:"bar_chart",representationTags:Object.freeze(tags),patternSpecIds:Object.freeze([specId]),allocationPolicy:"single_pattern_spec",visibilityStatus:"visible",holdReason:null});
}));
export const G4B_U05_P06F09_SELECTOR_ROWS=Object.freeze(G4B_U05_P06F09_TARGET_KP_IDS.map(kp=>{
  const c=candidateByKp[kp],g=G4B_U05_P06F09_PATTERN_GROUPS.find(x=>x.primaryKnowledgePointId===kp);
  return Object.freeze({knowledgePointId:kp,sourceId:G4B_U05_P06F09_SOURCE_ID,unitCode:G4B_U05_P06F09_UNIT_CODE,unitTitle:G4B_U05_P06F09_UNIT_TITLE,displayName:c.canonicalNameZh,canonicalNameZh:c.canonicalNameZh,mode:"numeric",questionMode:"numeric",questionModes:Object.freeze(["numeric"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:"APPLICATION_COMPATIBLE",canonicalPatternGroupIds:Object.freeze([g.patternGroupId]),canonicalPatternSpecIds:Object.freeze([...g.patternSpecIds]),patternGroupIds:Object.freeze([g.patternGroupId]),patternSpecIds:Object.freeze([...g.patternSpecIds]),requiredCapabilityIds:G4B_U05_P06F09_QUEUE_REQUIRED_CAPABILITY_IDS,qaStatusLabel:"P06F09_G4B_U05_SOURCE_BACKED_FINAL_CHART",productionUse:"full_product_w6_slice009_candidate"});
}));
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG4BU05P06F09SelectorRow=id=>clone(G4B_U05_P06F09_SELECTOR_ROWS.find(x=>x.knowledgePointId===id)??null);
export const listG4BU05P06F09PatternGroups=id=>clone(G4B_U05_P06F09_PATTERN_GROUPS.filter(x=>x.primaryKnowledgePointId===id));
export const resolveG4BU05P06F09PatternSpecIds=id=>clone(G4B_U05_P06F09_PATTERN_SPECS.filter(x=>x.knowledgePointId===id).map(x=>x.patternSpecId));
export function auditG4BU05P06F09Projection(){
  const e=[];
  if(G4B_U05_P06F09_TARGET_KP_IDS.length!==3||G4B_U05_P06F09_FORMAL_MAPPINGS.length!==3||G4B_U05_P06F09_PATTERN_GROUPS.length!==3||G4B_U05_P06F09_PATTERN_SPECS.length!==3)e.push("P06F09_CARDINALITY_INVALID");
  if(new Set(G4B_U05_P06F09_SPEC_IDS).size!==3)e.push("P06F09_PATTERN_ID_DUPLICATE");
  if(G4B_U05_P06F09_PATTERN_SPECS.some(x=>x.questionMode!=="numeric"||!x.requiresChartDataModel||!x.requiresDataDomainValidation||!x.requiresChartRepresentation||!x.requiresTableDataDependencyClosure||x.q007PredecessorReownershipAllowed||x.lineChartAllowed||x.pieChartAllowed||x.applicationAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed))e.push("P06F09_PATTERN_INVARIANT_INVALID");
  if(G4B_U05_P06F09_FORMAL_MAPPINGS.some(x=>x.primaryRuntimeProfileId!=="profile_chart_data"||x.q007PredecessorReownershipAllowed||x.r04ReclassificationAllowed||x.q010OrLaterTouched))e.push("P06F09_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:3,patternGroups:3,patternSpecs:3,formalMappings:3})});
}
