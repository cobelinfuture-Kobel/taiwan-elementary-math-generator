export const P06F10_TASK_ID="P06F_W6DirectProductVerticalSlice010Implementation";
export const G5B_U11_P06F10_SOURCE_ID="g5b_u11_5b11";
export const G5B_U11_P06F10_UNIT_CODE="5B-U11";
export const G5B_U11_P06F10_UNIT_TITLE="長條圖與折線圖";
export const G5B_U11_P06F10_READ_KP_ID="kp_g5b_u11_bar_line_chart_reading";
export const G5B_U11_P06F10_SCALE_KP_ID="kp_g5b_u11_chart_scale_broken_axis";
export const G5B_U11_P06F10_TARGET_KP_IDS=Object.freeze([G5B_U11_P06F10_READ_KP_ID,G5B_U11_P06F10_SCALE_KP_ID]);
export const G5B_U11_P06F10_FUTURE_KP_IDS=Object.freeze(["kp_g5b_u11_compare_two_data_series","kp_g5b_u11_construct_line_chart","kp_g5b_u11_line_chart_trend"]);
export const G5B_U11_P06F10_QUEUE_REQUIRED_CAPABILITY_IDS=Object.freeze(["cap_chart_data_model","cap_chart_representation","cap_data_domain_validator","cap_table_data_model"]);
export const G5B_U11_P06F10_INCLUDED_RELATIONS=Object.freeze(["READ_BAR_OR_LINE_CHART_VALUE_FROM_TITLE_AXES_LEGEND_AND_SCALE","INTERPRET_NON_UNIT_OR_OMITTED_AXIS_SCALE"]);
const GROUP_BY_KP=Object.freeze({
  [G5B_U11_P06F10_READ_KP_ID]:"pg_g5b_u11_bar_line_chart_reading",
  [G5B_U11_P06F10_SCALE_KP_ID]:"pg_g5b_u11_chart_scale_broken_axis"
});
export const G5B_U11_P06F10_PATTERN_SPECS=Object.freeze([
  Object.freeze({patternSpecId:"ps_g5b_u11_bar_chart_value_reading",knowledgePointId:G5B_U11_P06F10_READ_KP_ID,patternGroupId:GROUP_BY_KP[G5B_U11_P06F10_READ_KP_ID],patternFamilyId:"BAR_VALUE_READING",relation:G5B_U11_P06F10_INCLUDED_RELATIONS[0],semanticCore:"BAR_LINE_CHART_VALUE_READING",questionMode:"numeric",answerDomain:"INTEGER",representation:"bar_chart_data",requiresTitleAxisLegend:true,requiresCommonLabeledScale:true,nonUnitScale:true,omittedAxisStart:false,futureTrendUsed:false,futureComparisonUsed:false,futureConstructionUsed:false,applicationAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false}),
  Object.freeze({patternSpecId:"ps_g5b_u11_line_chart_point_reading",knowledgePointId:G5B_U11_P06F10_READ_KP_ID,patternGroupId:GROUP_BY_KP[G5B_U11_P06F10_READ_KP_ID],patternFamilyId:"LINE_POINT_READING",relation:G5B_U11_P06F10_INCLUDED_RELATIONS[0],semanticCore:"BAR_LINE_CHART_VALUE_READING",questionMode:"numeric",answerDomain:"INTEGER",representation:"line_chart_data",requiresTitleAxisLegend:true,requiresCommonLabeledScale:true,nonUnitScale:true,omittedAxisStart:false,futureTrendUsed:false,futureComparisonUsed:false,futureConstructionUsed:false,applicationAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false}),
  Object.freeze({patternSpecId:"ps_g5b_u11_nonunit_scale_value_reading",knowledgePointId:G5B_U11_P06F10_SCALE_KP_ID,patternGroupId:GROUP_BY_KP[G5B_U11_P06F10_SCALE_KP_ID],patternFamilyId:"NONUNIT_SCALE_READING",relation:G5B_U11_P06F10_INCLUDED_RELATIONS[1],semanticCore:"CHART_SCALE_AND_OMITTED_AXIS_INTERPRETATION",questionMode:"numeric",answerDomain:"INTEGER",representation:"bar_chart_data",requiresTitleAxisLegend:true,requiresCommonLabeledScale:true,nonUnitScale:true,omittedAxisStart:false,futureTrendUsed:false,futureComparisonUsed:false,futureConstructionUsed:false,applicationAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false}),
  Object.freeze({patternSpecId:"ps_g5b_u11_omitted_axis_line_value_reading",knowledgePointId:G5B_U11_P06F10_SCALE_KP_ID,patternGroupId:GROUP_BY_KP[G5B_U11_P06F10_SCALE_KP_ID],patternFamilyId:"OMITTED_AXIS_READING",relation:G5B_U11_P06F10_INCLUDED_RELATIONS[1],semanticCore:"CHART_SCALE_AND_OMITTED_AXIS_INTERPRETATION",questionMode:"numeric",answerDomain:"INTEGER",representation:"line_chart_data",requiresTitleAxisLegend:true,requiresCommonLabeledScale:true,nonUnitScale:true,omittedAxisStart:true,futureTrendUsed:false,futureComparisonUsed:false,futureConstructionUsed:false,applicationAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false})
]);
export const G5B_U11_P06F10_SPEC_IDS=Object.freeze(G5B_U11_P06F10_PATTERN_SPECS.map(x=>x.patternSpecId));
const CANDIDATES=Object.freeze({
  [G5B_U11_P06F10_READ_KP_ID]:Object.freeze({canonicalNameZh:"長條圖折線圖報讀",capabilityStatement:"學生能依標題、座標軸與圖例讀取資料。",reasoningInvariant:"每個點或長條必須依正確刻度對應數值。"}),
  [G5B_U11_P06F10_SCALE_KP_ID]:Object.freeze({canonicalNameZh:"圖表尺度與省略刻度",capabilityStatement:"學生能處理每格非1或有省略起點的圖表。",reasoningInvariant:"數值必須依標示尺度換算，視覺高度不能直接當數值。"})
});
const CORE=Object.freeze({[G5B_U11_P06F10_READ_KP_ID]:"BAR_LINE_CHART_VALUE_READING",[G5B_U11_P06F10_SCALE_KP_ID]:"CHART_SCALE_AND_OMITTED_AXIS_INTERPRETATION"});
export const G5B_U11_P06F10_FORMAL_MAPPINGS=Object.freeze(G5B_U11_P06F10_TARGET_KP_IDS.map(kp=>Object.freeze({
  mappingId:`fm_${kp.replace(/^kp_/,"")}_p06f10`,
  r04MappingId:`r04map_${kp.replace(/^kp_/,"")}`,
  sourceId:G5B_U11_P06F10_SOURCE_ID,
  sourcePages:Object.freeze([1,2]),
  knowledgePointId:kp,
  ...CANDIDATES[kp],
  sourceSemanticCore:CORE[kp],
  primaryRuntimeProfileId:"profile_chart_data",
  queueRequiredW6CapabilityIds:G5B_U11_P06F10_QUEUE_REQUIRED_CAPABILITY_IDS,
  dependencyClosureCapabilityIds:Object.freeze(["cap_table_data_model"]),
  patternSpecIds:Object.freeze(G5B_U11_P06F10_PATTERN_SPECS.filter(x=>x.knowledgePointId===kp).map(x=>x.patternSpecId)),
  lineChartPointReadingAllowed:true,
  lineChartTrendAsTargetAllowed:false,
  twoSeriesComparisonAsTargetAllowed:false,
  lineChartConstructionAsTargetAllowed:false,
  q012FutureKpReownershipAllowed:false,
  applicationImplementationAllowed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false,
  r04ReclassificationAllowed:false,
  q011OrLaterTouched:false
})));
export const G5B_U11_P06F10_PATTERN_GROUPS=Object.freeze(G5B_U11_P06F10_TARGET_KP_IDS.map(kp=>{
  const c=CANDIDATES[kp],specs=G5B_U11_P06F10_PATTERN_SPECS.filter(x=>x.knowledgePointId===kp).map(x=>x.patternSpecId);
  return Object.freeze({patternGroupId:GROUP_BY_KP[kp],sourceId:G5B_U11_P06F10_SOURCE_ID,unitCode:G5B_U11_P06F10_UNIT_CODE,unitTitle:G5B_U11_P06F10_UNIT_TITLE,displayName:c.canonicalNameZh,primaryKnowledgePointId:kp,knowledgePointIds:Object.freeze([kp]),supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",representationTag:"chart_data",representationTags:Object.freeze(kp===G5B_U11_P06F10_READ_KP_ID?["bar_chart","line_chart","value_reading","title_axis_legend","scale"]:["bar_chart","line_chart","nonunit_scale","omitted_axis","value_reading"]),patternSpecIds:Object.freeze(specs),allocationPolicy:"balanced_pattern_spec",visibilityStatus:"visible",holdReason:null});
}));
export const G5B_U11_P06F10_SELECTOR_ROWS=Object.freeze(G5B_U11_P06F10_TARGET_KP_IDS.map(kp=>{
  const c=CANDIDATES[kp],g=G5B_U11_P06F10_PATTERN_GROUPS.find(x=>x.primaryKnowledgePointId===kp);
  return Object.freeze({knowledgePointId:kp,sourceId:G5B_U11_P06F10_SOURCE_ID,unitCode:G5B_U11_P06F10_UNIT_CODE,unitTitle:G5B_U11_P06F10_UNIT_TITLE,displayName:c.canonicalNameZh,canonicalNameZh:c.canonicalNameZh,mode:"numeric",questionMode:"numeric",questionModes:Object.freeze(["numeric"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:"APPLICATION_COMPATIBLE",canonicalPatternGroupIds:Object.freeze([g.patternGroupId]),canonicalPatternSpecIds:Object.freeze([...g.patternSpecIds]),patternGroupIds:Object.freeze([g.patternGroupId]),patternSpecIds:Object.freeze([...g.patternSpecIds]),requiredCapabilityIds:G5B_U11_P06F10_QUEUE_REQUIRED_CAPABILITY_IDS,qaStatusLabel:"P06F10_G5B_U11_SOURCE_BACKED_CHART_READ_SCALE",productionUse:"full_product_w6_slice010_candidate"});
}));
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG5BU11P06F10SelectorRow=id=>clone(G5B_U11_P06F10_SELECTOR_ROWS.find(x=>x.knowledgePointId===id)??null);
export const listG5BU11P06F10PatternGroups=id=>clone(G5B_U11_P06F10_PATTERN_GROUPS.filter(x=>x.primaryKnowledgePointId===id));
export const resolveG5BU11P06F10PatternSpecIds=id=>clone(G5B_U11_P06F10_PATTERN_SPECS.filter(x=>x.knowledgePointId===id).map(x=>x.patternSpecId));
export function auditG5BU11P06F10Projection(){
  const e=[];
  if(G5B_U11_P06F10_TARGET_KP_IDS.length!==2||G5B_U11_P06F10_FORMAL_MAPPINGS.length!==2||G5B_U11_P06F10_PATTERN_GROUPS.length!==2||G5B_U11_P06F10_PATTERN_SPECS.length!==4)e.push("P06F10_CARDINALITY_INVALID");
  if(new Set(G5B_U11_P06F10_SPEC_IDS).size!==4)e.push("P06F10_PATTERN_ID_DUPLICATE");
  if(G5B_U11_P06F10_PATTERN_SPECS.some(x=>x.questionMode!=="numeric"||!x.requiresTitleAxisLegend||!x.requiresCommonLabeledScale||!x.nonUnitScale||x.futureTrendUsed||x.futureComparisonUsed||x.futureConstructionUsed||x.applicationAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed))e.push("P06F10_PATTERN_INVARIANT_INVALID");
  if(G5B_U11_P06F10_FORMAL_MAPPINGS.some(x=>x.primaryRuntimeProfileId!=="profile_chart_data"||x.lineChartTrendAsTargetAllowed||x.twoSeriesComparisonAsTargetAllowed||x.lineChartConstructionAsTargetAllowed||x.q012FutureKpReownershipAllowed||x.r04ReclassificationAllowed||x.q011OrLaterTouched))e.push("P06F10_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:2,patternGroups:2,patternSpecs:4,formalMappings:2})});
}
