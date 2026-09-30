export const P08F21_TASK_ID="P08F_W8DirectProductVerticalSlice021Implementation";
export const G6B_U06_P08F21_SOURCE_ID="g6b_u06_6b06";
export const G6B_U06_P08F21_UNIT_CODE="6B-U06";
export const G6B_U06_P08F21_UNIT_TITLE="圓形圖";
export const G6B_U06_P08F21_KP_ID="kp_g6b_u06_construct_pie_chart";
export const G6B_U06_P08F21_PRIOR_KP_IDS=Object.freeze([
  "kp_g6b_u06_pie_chart_part_whole",
  "kp_g6b_u06_compare_pie_charts",
  "kp_g6b_u06_pie_chart_quantity_from_rate",
  "kp_g6b_u06_pie_chart_percent_angle_conversion"
]);
export const G6B_U06_P08F21_FUTURE_KP_IDS=Object.freeze([]);
export const G6B_U06_P08F21_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly",
  "cap_answer_key_projection","cap_html_print_renderer","cap_ratio_percent_reasoning",
  "cap_ratio_rate_validator","cap_text_application_representation"
]);
export const G6B_U06_P08F21_EFFECTIVE_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly",
  "cap_answer_key_projection","cap_html_print_renderer","cap_ratio_percent_reasoning",
  "cap_fraction_number_system","cap_ratio_rate_validator","cap_text_application_representation"
]);
export const G6B_U06_P08F21_CONTRACT_ONLY_CAPABILITY_IDS=Object.freeze([
  "cap_ratio_percent_reasoning","cap_fraction_number_system","cap_ratio_rate_validator"
]);
export const G6B_U06_P08F21_OPTIONAL_CAPABILITY_IDS=Object.freeze([]);
export const G6B_U06_P08F21_APPLIED_MODIFIER_IDS=Object.freeze([]);
export const G6B_U06_P08F21_PATTERN_GROUP_ID="pg_g6b_u06_construct_pie_chart";
export const G6B_U06_P08F21_INCLUDED_RELATIONS=Object.freeze([
  "CLASSIFIED_DATA_TO_PERCENT_SHARE",
  "PERCENT_SHARE_TO_CENTRAL_ANGLE",
  "ALLOCATE_PIE_SECTORS_BY_ANGLE",
  "CONSTRUCT_PIE_CHART",
  "VERIFY_100_PERCENT_360_DEGREE_CLOSURE"
]);
export const G6B_U06_P08F21_EXCLUDED_RELATIONS=Object.freeze([
  "Q014_PIE_CHART_PART_WHOLE_TEACHING_REOWNERSHIP",
  "Q016_COMPARE_PIE_CHARTS_TEACHING_REOWNERSHIP",
  "Q021_W7_QUANTITY_FROM_RATE_TEACHING_REOWNERSHIP",
  "Q018_PERCENT_ANGLE_TEACHING_REOWNERSHIP",
  "GENERIC_SECTOR_GEOMETRY_TEACHING",
  "APPLICATION_CONTEXT",
  "SAME_UNIT_MIXED_MODE",
  "CROSS_UNIT_MIXED_MODE",
  "Q022_OR_LATER_IMPLEMENTATION"
]);
const spec=(id,family,inputMode)=>Object.freeze({
  patternSpecId:id,
  knowledgePointId:G6B_U06_P08F21_KP_ID,
  patternGroupId:G6B_U06_P08F21_PATTERN_GROUP_ID,
  patternFamilyId:family,
  relation:"CONSTRUCT_PIE_CHART",
  inputMode,
  semanticCore:"CONSTRUCT_PIE_CHART_FROM_CLASSIFIED_DATA_BY_PERCENT_AND_CENTRAL_ANGLE_ALLOCATION",
  questionMode:"diagram",
  answerDomain:"COMPLETE_FOUR_SECTOR_PERCENT_ANGLE_PLAN",
  representation:"pie_chart_construction_data_p08f21",
  sourceTableRequired:true,
  blankConstructionCanvasRequired:true,
  answerChartRequired:true,
  classifiedDataToPercentShareRequired:true,
  percentToCentralAngleRequired:true,
  sectorAllocationByAngleRequired:true,
  fullCircle100PercentClosureRequired:true,
  fullCircle360DegreeClosureRequired:true,
  predecessorTeachingReownershipAllowed:false,
  genericSectorGeometryTeachingAllowed:false,
  applicationContextAllowed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false
});
export const G6B_U06_P08F21_PATTERN_SPECS=Object.freeze([
  spec("ps_g6b_u06_construct_pie_chart_from_counts","PIE_CHART_CONSTRUCTION_FROM_COUNTS","COUNTS"),
  spec("ps_g6b_u06_construct_pie_chart_from_percents","PIE_CHART_CONSTRUCTION_FROM_PERCENTS","PERCENTS")
]);
export const G6B_U06_P08F21_SPEC_IDS=Object.freeze(G6B_U06_P08F21_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G6B_U06_P08F21_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g6b_u06_construct_pie_chart_p08f21",
  r04MappingId:"r04map_g6b_u06_construct_pie_chart",
  sourceId:G6B_U06_P08F21_SOURCE_ID,
  sourcePages:Object.freeze([1]),
  knowledgePointId:G6B_U06_P08F21_KP_ID,
  canonicalNameZh:"繪製圓形圖",
  capabilityStatement:"學生能由分類資料計算比例與角度並畫圖。",
  reasoningInvariant:"各扇形角度按資料比率分配且總和360度。",
  semanticCore:"CONSTRUCT_PIE_CHART_FROM_CLASSIFIED_DATA_BY_PERCENT_AND_CENTRAL_ANGLE_ALLOCATION",
  classifiedDataToProportionIsCore:true,
  percentShareCalculationIsCore:true,
  percentToCentralAngleMayConsumeQ018:true,
  sectorAllocationByCentralAngleIsCore:true,
  chartConstructionIsCore:true,
  fullCircleEquals100Percent:true,
  fullCircleEquals360Degrees:true,
  requiredCapabilityIds:G6B_U06_P08F21_REQUIRED_CAPABILITY_IDS,
  effectiveRequiredCapabilityIds:G6B_U06_P08F21_EFFECTIVE_REQUIRED_CAPABILITY_IDS,
  contractOnlyRequiredCapabilityIds:G6B_U06_P08F21_CONTRACT_ONLY_CAPABILITY_IDS,
  optionalCapabilityIds:G6B_U06_P08F21_OPTIONAL_CAPABILITY_IDS,
  appliedRuntimeModifierIds:G6B_U06_P08F21_APPLIED_MODIFIER_IDS,
  patternSpecIds:G6B_U06_P08F21_SPEC_IDS,
  priorSameSourceOwners:G6B_U06_P08F21_PRIOR_KP_IDS,
  futureSameSourceOwners:G6B_U06_P08F21_FUTURE_KP_IDS,
  q014PartWholeTeachingReowned:false,
  q016ComparePieChartsTeachingReowned:false,
  q021W7QuantityFromRateTeachingReowned:false,
  q018PercentAngleTeachingReowned:false,
  genericSectorGeometryTeachingAllowed:false,
  applicationContextAllowed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false,
  r04ReclassificationAllowed:false,
  r05AssignmentMutationAllowed:false,
  frozenQueueMutationAllowed:false
});
export const G6B_U06_P08F21_PATTERN_GROUP=Object.freeze({
  patternGroupId:G6B_U06_P08F21_PATTERN_GROUP_ID,
  sourceId:G6B_U06_P08F21_SOURCE_ID,
  unitCode:G6B_U06_P08F21_UNIT_CODE,
  unitTitle:G6B_U06_P08F21_UNIT_TITLE,
  displayName:"繪製圓形圖",
  primaryKnowledgePointId:G6B_U06_P08F21_KP_ID,
  knowledgePointIds:Object.freeze([G6B_U06_P08F21_KP_ID]),
  supportClass:"A",
  mode:"diagram",
  publicQuestionMode:"diagram",
  representationTag:"pie_chart_construction_data_p08f21",
  representationTags:Object.freeze(["pie_chart","construction","classified_data","percent","central_angle","full_circle_360"]),
  patternSpecIds:G6B_U06_P08F21_SPEC_IDS,
  allocationPolicy:"balanced_pattern_spec",
  visibilityStatus:"visible",
  holdReason:null
});
export const G6B_U06_P08F21_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G6B_U06_P08F21_KP_ID,
  sourceId:G6B_U06_P08F21_SOURCE_ID,
  unitCode:G6B_U06_P08F21_UNIT_CODE,
  unitTitle:G6B_U06_P08F21_UNIT_TITLE,
  displayName:"繪製圓形圖",
  canonicalNameZh:"繪製圓形圖",
  mode:"diagram",
  questionMode:"diagram",
  questionModes:Object.freeze(["diagram"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:"APPLICATION_COMPATIBLE_CONTEXT_NOT_ADMITTED",
  canonicalPatternGroupIds:Object.freeze([G6B_U06_P08F21_PATTERN_GROUP_ID]),
  canonicalPatternSpecIds:G6B_U06_P08F21_SPEC_IDS,
  patternGroupIds:Object.freeze([G6B_U06_P08F21_PATTERN_GROUP_ID]),
  patternSpecIds:G6B_U06_P08F21_SPEC_IDS,
  requiredCapabilityIds:G6B_U06_P08F21_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6B_U06_P08F21_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P08F21_G6B_U06_SOURCE_BACKED_PIE_CHART_CONSTRUCTION",
  productionUse:"full_product_w8_slice021_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6BU06P08F21SelectorRow=id=>id===G6B_U06_P08F21_KP_ID?clone(G6B_U06_P08F21_SELECTOR_ROW):null;
export const listG6BU06P08F21PatternGroups=id=>id===G6B_U06_P08F21_KP_ID?[clone(G6B_U06_P08F21_PATTERN_GROUP)]:[];
export const resolveG6BU06P08F21PatternSpecIds=id=>id===G6B_U06_P08F21_KP_ID?clone(G6B_U06_P08F21_SPEC_IDS):[];
export function auditG6BU06P08F21Projection(){
  const e=[],m=G6B_U06_P08F21_FORMAL_MAPPING;
  if(G6B_U06_P08F21_PATTERN_SPECS.length!==2||new Set(G6B_U06_P08F21_SPEC_IDS).size!==2)e.push("P08F21_PATTERN_CARDINALITY_INVALID");
  const modes=new Set(G6B_U06_P08F21_PATTERN_SPECS.map(x=>x.inputMode));
  for(const x of ["COUNTS","PERCENTS"])if(!modes.has(x))e.push("P08F21_INPUT_MODE_MISSING:"+x);
  for(const x of G6B_U06_P08F21_PATTERN_SPECS){
    if(x.questionMode!=="diagram"||x.semanticCore!==m.semanticCore||!x.sourceTableRequired||!x.blankConstructionCanvasRequired||
      !x.answerChartRequired||!x.classifiedDataToPercentShareRequired||!x.percentToCentralAngleRequired||
      !x.sectorAllocationByAngleRequired||!x.fullCircle100PercentClosureRequired||!x.fullCircle360DegreeClosureRequired||
      x.predecessorTeachingReownershipAllowed||x.genericSectorGeometryTeachingAllowed||x.applicationContextAllowed||
      x.sameUnitMixedAllowed||x.crossUnitMixedAllowed)e.push("P08F21_PATTERN_SCOPE_INVALID:"+x.patternSpecId);
  }
  if(m.r04MappingId!=="r04map_g6b_u06_construct_pie_chart"||m.appliedRuntimeModifierIds.length!==0||
    !m.classifiedDataToProportionIsCore||!m.percentShareCalculationIsCore||!m.percentToCentralAngleMayConsumeQ018||
    !m.sectorAllocationByCentralAngleIsCore||!m.chartConstructionIsCore||!m.fullCircleEquals100Percent||!m.fullCircleEquals360Degrees||
    m.q014PartWholeTeachingReowned||m.q016ComparePieChartsTeachingReowned||m.q021W7QuantityFromRateTeachingReowned||
    m.q018PercentAngleTeachingReowned||m.genericSectorGeometryTeachingAllowed||m.applicationContextAllowed||
    m.sameUnitMixedAllowed||m.crossUnitMixedAllowed||m.r04ReclassificationAllowed||m.r05AssignmentMutationAllowed||m.frozenQueueMutationAllowed)
    e.push("P08F21_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:2,formalMappings:1})});
}
