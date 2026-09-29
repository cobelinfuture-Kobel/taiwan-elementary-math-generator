export const P08F18_TASK_ID="P08F_W8DirectProductVerticalSlice018Implementation";
export const G6B_U06_P08F18_SOURCE_ID="g6b_u06_6b06";
export const G6B_U06_P08F18_UNIT_CODE="6B-U06";
export const G6B_U06_P08F18_UNIT_TITLE="圓形圖";
export const G6B_U06_P08F18_KP_ID="kp_g6b_u06_pie_chart_percent_angle_conversion";
export const G6B_U06_P08F18_PRIOR_KP_IDS=Object.freeze([
  "kp_g6b_u06_pie_chart_part_whole",
  "kp_g6b_u06_compare_pie_charts",
  "kp_g6b_u06_pie_chart_quantity_from_rate"
]);
export const G6B_U06_P08F18_FUTURE_KP_IDS=Object.freeze([
  "kp_g6b_u06_construct_pie_chart"
]);
export const G6B_U06_P08F18_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution",
  "cap_deterministic_answer_model",
  "cap_worksheet_document_assembly",
  "cap_answer_key_projection",
  "cap_html_print_renderer",
  "cap_ratio_percent_reasoning",
  "cap_ratio_rate_validator",
  "cap_text_application_representation"
]);
export const G6B_U06_P08F18_EFFECTIVE_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution",
  "cap_deterministic_answer_model",
  "cap_worksheet_document_assembly",
  "cap_answer_key_projection",
  "cap_html_print_renderer",
  "cap_ratio_percent_reasoning",
  "cap_fraction_number_system",
  "cap_ratio_rate_validator",
  "cap_text_application_representation"
]);
export const G6B_U06_P08F18_CONTRACT_ONLY_CAPABILITY_IDS=Object.freeze([
  "cap_fraction_number_system",
  "cap_ratio_percent_reasoning",
  "cap_ratio_rate_validator"
]);
export const G6B_U06_P08F18_OPTIONAL_CAPABILITY_IDS=Object.freeze([]);
export const G6B_U06_P08F18_APPLIED_MODIFIER_IDS=Object.freeze([]);
export const G6B_U06_P08F18_PATTERN_GROUP_ID="pg_g6b_u06_pie_chart_percent_angle_conversion";
export const G6B_U06_P08F18_INCLUDED_RELATIONS=Object.freeze([
  "PERCENT_TO_CENTRAL_ANGLE_CONVERSION",
  "CENTRAL_ANGLE_TO_PERCENT_CONVERSION",
  "VERIFY_PERCENT_ANGLE_EQUIVALENCE",
  "FULL_CIRCLE_100_PERCENT_360_DEGREE_CLOSURE"
]);
export const G6B_U06_P08F18_EXCLUDED_RELATIONS=Object.freeze([
  "Q014_PIE_CHART_PART_WHOLE_TEACHING_REOWNERSHIP",
  "Q016_COMPARE_PIE_CHARTS_TEACHING_REOWNERSHIP",
  "Q021_QUANTITY_FROM_RATE_TEACHING_REOWNERSHIP",
  "PIE_CHART_CONSTRUCTION",
  "GENERIC_SECTOR_GEOMETRY_TEACHING",
  "APPLICATION_CONTEXT",
  "SAME_UNIT_MIXED_MODE",
  "CROSS_UNIT_MIXED_MODE",
  "Q019_OR_LATER_IMPLEMENTATION"
]);
const spec=(id,family,relation,direction,answerDomain)=>Object.freeze({
  patternSpecId:id,
  knowledgePointId:G6B_U06_P08F18_KP_ID,
  patternGroupId:G6B_U06_P08F18_PATTERN_GROUP_ID,
  patternFamilyId:family,
  relation,
  direction,
  questionMode:"numeric",
  answerDomain,
  representation:"text_application",
  semanticCore:"BIDIRECTIONAL_PERCENT_AND_CENTRAL_ANGLE_CONVERSION_WITH_FULL_CIRCLE_360_DEGREES",
  fullCirclePercent:100,
  fullCircleDegrees:360,
  percentToCentralAngleRequired:direction==="PERCENT_TO_ANGLE",
  centralAngleToPercentRequired:direction==="ANGLE_TO_PERCENT",
  equivalenceBackCheckRequired:true,
  pieChartGraphicRequired:false,
  predecessorTeachingReownershipAllowed:false,
  pieChartConstructionAllowed:false,
  genericSectorGeometryTeachingAllowed:false,
  applicationContextAllowed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false
});
export const G6B_U06_P08F18_PATTERN_SPECS=Object.freeze([
  spec(
    "ps_g6b_u06_pie_percent_to_central_angle",
    "PIE_PERCENT_TO_CENTRAL_ANGLE",
    G6B_U06_P08F18_INCLUDED_RELATIONS[0],
    "PERCENT_TO_ANGLE",
    "INTEGER_DEGREES"
  ),
  spec(
    "ps_g6b_u06_pie_central_angle_to_percent",
    "PIE_CENTRAL_ANGLE_TO_PERCENT",
    G6B_U06_P08F18_INCLUDED_RELATIONS[1],
    "ANGLE_TO_PERCENT",
    "INTEGER_PERCENT"
  )
]);
export const G6B_U06_P08F18_SPEC_IDS=Object.freeze(G6B_U06_P08F18_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G6B_U06_P08F18_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g6b_u06_pie_chart_percent_angle_conversion_p08f18",
  r04MappingId:"r04map_g6b_u06_pie_chart_percent_angle_conversion",
  sourceId:G6B_U06_P08F18_SOURCE_ID,
  sourcePages:Object.freeze([1]),
  knowledgePointId:G6B_U06_P08F18_KP_ID,
  canonicalNameZh:"百分率與圓心角換算",
  capabilityStatement:"學生能在百分率與扇形圓心角間換算。",
  reasoningInvariant:"圓心角等於百分率乘360度。",
  semanticCore:"BIDIRECTIONAL_PERCENT_AND_CENTRAL_ANGLE_CONVERSION_WITH_FULL_CIRCLE_360_DEGREES",
  percentToCentralAngleIsCore:true,
  centralAngleToPercentIsCore:true,
  fullCircleEquals360Degrees:true,
  fullCircleEquals100Percent:true,
  percentToAngleRule:"ANGLE_DEG = PERCENT_RATE * 360",
  angleToPercentRule:"PERCENT_RATE = ANGLE_DEG / 360",
  requiredCapabilityIds:G6B_U06_P08F18_REQUIRED_CAPABILITY_IDS,
  effectiveRequiredCapabilityIds:G6B_U06_P08F18_EFFECTIVE_REQUIRED_CAPABILITY_IDS,
  contractOnlyRequiredCapabilityIds:G6B_U06_P08F18_CONTRACT_ONLY_CAPABILITY_IDS,
  optionalCapabilityIds:G6B_U06_P08F18_OPTIONAL_CAPABILITY_IDS,
  appliedRuntimeModifierIds:G6B_U06_P08F18_APPLIED_MODIFIER_IDS,
  patternSpecIds:G6B_U06_P08F18_SPEC_IDS,
  priorSameSourceOwners:G6B_U06_P08F18_PRIOR_KP_IDS,
  futureSameSourceOwners:G6B_U06_P08F18_FUTURE_KP_IDS,
  q014PartWholeTeachingReowned:false,
  q016ComparePieChartsTeachingReowned:false,
  q021QuantityFromRateTeachingReowned:false,
  futurePieChartConstructionTeachingReowned:false,
  genericSectorGeometryTeachingAllowed:false,
  applicationContextAllowed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false,
  r04ReclassificationAllowed:false,
  r05AssignmentMutationAllowed:false,
  frozenQueueMutationAllowed:false
});
export const G6B_U06_P08F18_PATTERN_GROUP=Object.freeze({
  patternGroupId:G6B_U06_P08F18_PATTERN_GROUP_ID,
  sourceId:G6B_U06_P08F18_SOURCE_ID,
  unitCode:G6B_U06_P08F18_UNIT_CODE,
  unitTitle:G6B_U06_P08F18_UNIT_TITLE,
  displayName:"百分率與圓心角換算",
  primaryKnowledgePointId:G6B_U06_P08F18_KP_ID,
  knowledgePointIds:Object.freeze([G6B_U06_P08F18_KP_ID]),
  supportClass:"A",
  mode:"numeric",
  publicQuestionMode:"numeric",
  representationTag:"text_application",
  representationTags:Object.freeze(["pie_chart","percent","central_angle","conversion","full_circle_360"]),
  patternSpecIds:G6B_U06_P08F18_SPEC_IDS,
  allocationPolicy:"balanced_pattern_spec",
  visibilityStatus:"visible",
  holdReason:null
});
export const G6B_U06_P08F18_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G6B_U06_P08F18_KP_ID,
  sourceId:G6B_U06_P08F18_SOURCE_ID,
  unitCode:G6B_U06_P08F18_UNIT_CODE,
  unitTitle:G6B_U06_P08F18_UNIT_TITLE,
  displayName:"百分率與圓心角換算",
  canonicalNameZh:"百分率與圓心角換算",
  mode:"numeric",
  questionMode:"numeric",
  questionModes:Object.freeze(["numeric"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:"APPLICATION_COMPATIBLE_CONTEXT_NOT_ADMITTED",
  canonicalPatternGroupIds:Object.freeze([G6B_U06_P08F18_PATTERN_GROUP_ID]),
  canonicalPatternSpecIds:G6B_U06_P08F18_SPEC_IDS,
  patternGroupIds:Object.freeze([G6B_U06_P08F18_PATTERN_GROUP_ID]),
  patternSpecIds:G6B_U06_P08F18_SPEC_IDS,
  requiredCapabilityIds:G6B_U06_P08F18_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6B_U06_P08F18_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P08F18_G6B_U06_SOURCE_BACKED_PIE_PERCENT_ANGLE_CONVERSION",
  productionUse:"full_product_w8_slice018_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6BU06P08F18SelectorRow=id=>id===G6B_U06_P08F18_KP_ID?clone(G6B_U06_P08F18_SELECTOR_ROW):null;
export const listG6BU06P08F18PatternGroups=id=>id===G6B_U06_P08F18_KP_ID?[clone(G6B_U06_P08F18_PATTERN_GROUP)]:[];
export const resolveG6BU06P08F18PatternSpecIds=id=>id===G6B_U06_P08F18_KP_ID?clone(G6B_U06_P08F18_SPEC_IDS):[];
export function auditG6BU06P08F18Projection(){
  const e=[],m=G6B_U06_P08F18_FORMAL_MAPPING;
  if(G6B_U06_P08F18_PATTERN_SPECS.length!==2||new Set(G6B_U06_P08F18_SPEC_IDS).size!==2)e.push("P08F18_PATTERN_CARDINALITY_INVALID");
  const dirs=new Set(G6B_U06_P08F18_PATTERN_SPECS.map(x=>x.direction));
  for(const d of ["PERCENT_TO_ANGLE","ANGLE_TO_PERCENT"])if(!dirs.has(d))e.push("P08F18_DIRECTION_MISSING:"+d);
  for(const x of G6B_U06_P08F18_PATTERN_SPECS){
    if(x.questionMode!=="numeric"||x.semanticCore!==m.semanticCore||x.fullCirclePercent!==100||x.fullCircleDegrees!==360||
      !x.equivalenceBackCheckRequired||x.pieChartGraphicRequired||x.predecessorTeachingReownershipAllowed||x.pieChartConstructionAllowed||
      x.genericSectorGeometryTeachingAllowed||x.applicationContextAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed)
      e.push("P08F18_PATTERN_SCOPE_INVALID:"+x.patternSpecId);
  }
  if(m.r04MappingId!=="r04map_g6b_u06_pie_chart_percent_angle_conversion"||m.appliedRuntimeModifierIds.length!==0||
    !m.percentToCentralAngleIsCore||!m.centralAngleToPercentIsCore||!m.fullCircleEquals360Degrees||!m.fullCircleEquals100Percent||
    m.q014PartWholeTeachingReowned||m.q016ComparePieChartsTeachingReowned||m.q021QuantityFromRateTeachingReowned||
    m.futurePieChartConstructionTeachingReowned||m.genericSectorGeometryTeachingAllowed||m.applicationContextAllowed||
    m.sameUnitMixedAllowed||m.crossUnitMixedAllowed||m.r04ReclassificationAllowed||m.r05AssignmentMutationAllowed||m.frozenQueueMutationAllowed)
    e.push("P08F18_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:2,formalMappings:1})});
}
