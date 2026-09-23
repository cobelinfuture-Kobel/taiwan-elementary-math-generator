
export const P06F12_TASK_ID="P06F_W6DirectProductVerticalSlice012Implementation";
export const G5B_U11_P06F12_SOURCE_ID="g5b_u11_5b11";
export const G5B_U11_P06F12_UNIT_CODE="5B-U11";
export const G5B_U11_P06F12_UNIT_TITLE="長條圖與折線圖";
export const G5B_U11_P06F12_COMPARE_KP_ID="kp_g5b_u11_compare_two_data_series";
export const G5B_U11_P06F12_CONSTRUCT_KP_ID="kp_g5b_u11_construct_line_chart";
export const G5B_U11_P06F12_TREND_KP_ID="kp_g5b_u11_line_chart_trend";
export const G5B_U11_P06F12_TARGET_KP_IDS=Object.freeze([G5B_U11_P06F12_COMPARE_KP_ID,G5B_U11_P06F12_CONSTRUCT_KP_ID,G5B_U11_P06F12_TREND_KP_ID]);
export const G5B_U11_P06F12_PREDECESSOR_KP_IDS=Object.freeze(["kp_g5b_u11_bar_line_chart_reading","kp_g5b_u11_chart_scale_broken_axis"]);
export const G5B_U11_P06F12_QUEUE_REQUIRED_CAPABILITY_IDS=Object.freeze(["cap_chart_data_model","cap_chart_representation","cap_data_domain_validator","cap_table_data_model"]);
export const G5B_U11_P06F12_INCLUDED_RELATIONS=Object.freeze(["COMPARE_TWO_DATA_SERIES_AT_MATCHED_CATEGORY_AND_COMMON_SCALE","CONSTRUCT_LINE_CHART_FROM_TIME_SERIES_AND_SCALE","INTERPRET_LINE_CHART_TREND_FROM_ADJACENT_POINT_CHANGES"]);
const GROUP=Object.freeze({
  [G5B_U11_P06F12_COMPARE_KP_ID]:"pg_g5b_u11_compare_two_data_series",
  [G5B_U11_P06F12_CONSTRUCT_KP_ID]:"pg_g5b_u11_construct_line_chart",
  [G5B_U11_P06F12_TREND_KP_ID]:"pg_g5b_u11_line_chart_trend"
});
const NAME=Object.freeze({
  [G5B_U11_P06F12_COMPARE_KP_ID]:"雙資料系列比較",
  [G5B_U11_P06F12_CONSTRUCT_KP_ID]:"繪製折線圖",
  [G5B_U11_P06F12_TREND_KP_ID]:"折線圖趨勢判讀"
});
const CAP=Object.freeze({
  [G5B_U11_P06F12_COMPARE_KP_ID]:"學生能比較兩組長條或折線資料的差異與趨勢。",
  [G5B_U11_P06F12_CONSTRUCT_KP_ID]:"學生能由時間序列資料設定尺度、標點並連線。",
  [G5B_U11_P06F12_TREND_KP_ID]:"學生能描述資料隨時間的上升、下降、持平與轉折。"
});
const INV=Object.freeze({
  [G5B_U11_P06F12_COMPARE_KP_ID]:"比較必須使用相同時間或類別位置與共同尺度。",
  [G5B_U11_P06F12_CONSTRUCT_KP_ID]:"每個資料點位置須同時符合橫軸類別與縱軸數值。",
  [G5B_U11_P06F12_TREND_KP_ID]:"趨勢由相鄰資料點變化決定，不可只看單一點。"
});
const CORE=Object.freeze({
  [G5B_U11_P06F12_COMPARE_KP_ID]:"TWO_DATA_SERIES_COMPARISON",
  [G5B_U11_P06F12_CONSTRUCT_KP_ID]:"LINE_CHART_CONSTRUCTION",
  [G5B_U11_P06F12_TREND_KP_ID]:"LINE_CHART_TREND_INTERPRETATION"
});
function makeSpec(id,kp,family,relation){
  return Object.freeze({patternSpecId:id,knowledgePointId:kp,patternGroupId:GROUP[kp],patternFamilyId:family,relation:relation,semanticCore:CORE[kp],questionMode:"numeric",answerDomain:"INTEGER",representation:"line_chart_data",matchedCategoryOrTimeAlignmentRequired:kp===G5B_U11_P06F12_COMPARE_KP_ID,commonScaleRequired:kp===G5B_U11_P06F12_COMPARE_KP_ID,scalePointPlacementAndOrderedConnectionRequired:kp===G5B_U11_P06F12_CONSTRUCT_KP_ID,adjacentPointChangesRequired:kp===G5B_U11_P06F12_TREND_KP_ID,singlePointTrendInferenceAllowed:false,q010ValueReadingReownershipAllowed:false,q010BrokenAxisReownershipAllowed:false,applicationAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false});
}
export const G5B_U11_P06F12_PATTERN_SPECS=Object.freeze([
  makeSpec("ps_g5b_u11_compare_two_line_series_difference",G5B_U11_P06F12_COMPARE_KP_ID,"TWO_LINE_SERIES_MATCHED_DIFFERENCE",G5B_U11_P06F12_INCLUDED_RELATIONS[0]),
  makeSpec("ps_g5b_u11_construct_line_chart_missing_point_level",G5B_U11_P06F12_CONSTRUCT_KP_ID,"LINE_CHART_POINT_PLACEMENT",G5B_U11_P06F12_INCLUDED_RELATIONS[1]),
  makeSpec("ps_g5b_u11_line_chart_count_rising_segments",G5B_U11_P06F12_TREND_KP_ID,"LINE_CHART_ADJACENT_TREND_COUNT",G5B_U11_P06F12_INCLUDED_RELATIONS[2])
]);
export const G5B_U11_P06F12_SPEC_IDS=Object.freeze(G5B_U11_P06F12_PATTERN_SPECS.map(function(x){return x.patternSpecId;}));
export const G5B_U11_P06F12_FORMAL_MAPPINGS=Object.freeze(G5B_U11_P06F12_TARGET_KP_IDS.map(function(kp){return Object.freeze({
  mappingId:"fm_"+kp.replace(/^kp_/,"")+"_p06f12",r04MappingId:"r04map_"+kp.replace(/^kp_/,""),sourceId:G5B_U11_P06F12_SOURCE_ID,sourcePages:Object.freeze([1,2]),knowledgePointId:kp,canonicalNameZh:NAME[kp],capabilityStatement:CAP[kp],reasoningInvariant:INV[kp],sourceSemanticCore:CORE[kp],primaryRuntimeProfileId:"profile_chart_data",queueRequiredW6CapabilityIds:G5B_U11_P06F12_QUEUE_REQUIRED_CAPABILITY_IDS,dependencyClosureCapabilityIds:Object.freeze(["cap_table_data_model"]),patternSpecIds:Object.freeze(G5B_U11_P06F12_PATTERN_SPECS.filter(function(x){return x.knowledgePointId===kp;}).map(function(x){return x.patternSpecId;})),q010ValueReadingReownershipAllowed:false,q010BrokenAxisReownershipAllowed:false,applicationImplementationAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false,r04ReclassificationAllowed:false,q013OrLaterTouched:false
});}));
export const G5B_U11_P06F12_PATTERN_GROUPS=Object.freeze(G5B_U11_P06F12_TARGET_KP_IDS.map(function(kp){return Object.freeze({
  patternGroupId:GROUP[kp],sourceId:G5B_U11_P06F12_SOURCE_ID,unitCode:G5B_U11_P06F12_UNIT_CODE,unitTitle:G5B_U11_P06F12_UNIT_TITLE,displayName:NAME[kp],primaryKnowledgePointId:kp,knowledgePointIds:Object.freeze([kp]),supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",representationTag:"chart_data",representationTags:Object.freeze(["line_chart","scale","time_series",kp===G5B_U11_P06F12_COMPARE_KP_ID?"two_series":kp===G5B_U11_P06F12_CONSTRUCT_KP_ID?"construction":"trend"]),patternSpecIds:Object.freeze(G5B_U11_P06F12_PATTERN_SPECS.filter(function(x){return x.knowledgePointId===kp;}).map(function(x){return x.patternSpecId;})),allocationPolicy:"balanced_pattern_spec",visibilityStatus:"visible",holdReason:null
});}));
export const G5B_U11_P06F12_SELECTOR_ROWS=Object.freeze(G5B_U11_P06F12_TARGET_KP_IDS.map(function(kp){var g=G5B_U11_P06F12_PATTERN_GROUPS.find(function(x){return x.primaryKnowledgePointId===kp;});return Object.freeze({
  knowledgePointId:kp,sourceId:G5B_U11_P06F12_SOURCE_ID,unitCode:G5B_U11_P06F12_UNIT_CODE,unitTitle:G5B_U11_P06F12_UNIT_TITLE,displayName:NAME[kp],canonicalNameZh:NAME[kp],mode:"numeric",questionMode:"numeric",questionModes:Object.freeze(["numeric"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:"APPLICATION_COMPATIBLE",canonicalPatternGroupIds:Object.freeze([g.patternGroupId]),canonicalPatternSpecIds:Object.freeze(g.patternSpecIds.slice()),patternGroupIds:Object.freeze([g.patternGroupId]),patternSpecIds:Object.freeze(g.patternSpecIds.slice()),requiredCapabilityIds:G5B_U11_P06F12_QUEUE_REQUIRED_CAPABILITY_IDS,qaStatusLabel:"P06F12_G5B_U11_SOURCE_BACKED_COMPARE_CONSTRUCT_TREND",productionUse:"full_product_w6_slice012_candidate"
});}));
function clone(v){return v==null?v:JSON.parse(JSON.stringify(v));}
export function getG5BU11P06F12SelectorRow(id){return clone(G5B_U11_P06F12_SELECTOR_ROWS.find(function(x){return x.knowledgePointId===id;})||null);}
export function listG5BU11P06F12PatternGroups(id){return clone(G5B_U11_P06F12_PATTERN_GROUPS.filter(function(x){return x.primaryKnowledgePointId===id;}));}
export function resolveG5BU11P06F12PatternSpecIds(id){return clone(G5B_U11_P06F12_PATTERN_SPECS.filter(function(x){return x.knowledgePointId===id;}).map(function(x){return x.patternSpecId;}));}
export function auditG5BU11P06F12Projection(){var e=[];if(G5B_U11_P06F12_FORMAL_MAPPINGS.length!==3||G5B_U11_P06F12_PATTERN_GROUPS.length!==3||G5B_U11_P06F12_PATTERN_SPECS.length!==3)e.push("P06F12_CARDINALITY_INVALID");if(new Set(G5B_U11_P06F12_SPEC_IDS).size!==3)e.push("P06F12_PATTERN_ID_DUPLICATE");if(G5B_U11_P06F12_PATTERN_SPECS.some(function(x){return x.questionMode!=="numeric"||x.singlePointTrendInferenceAllowed||x.q010ValueReadingReownershipAllowed||x.q010BrokenAxisReownershipAllowed||x.applicationAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed;}))e.push("P06F12_PATTERN_INVARIANT_INVALID");if(G5B_U11_P06F12_FORMAL_MAPPINGS.some(function(x){return x.primaryRuntimeProfileId!=="profile_chart_data"||x.q010ValueReadingReownershipAllowed||x.q010BrokenAxisReownershipAllowed||x.r04ReclassificationAllowed||x.q013OrLaterTouched;}))e.push("P06F12_MAPPING_SCOPE_INVALID");return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:3,patternGroups:3,patternSpecs:3,formalMappings:3})});}
