export const P07F21_TASK_ID="P07F_W7DirectProductVerticalSlice021Implementation";
export const G6B_U06_P07F21_SOURCE_ID="g6b_u06_6b06";
export const G6B_U06_P07F21_UNIT_CODE="6B-U06";
export const G6B_U06_P07F21_UNIT_TITLE="圓形圖";
export const G6B_U06_P07F21_KP_ID="kp_g6b_u06_pie_chart_quantity_from_rate";
export const G6B_U06_P07F21_PREDECESSOR_VISIBLE_KP_IDS=Object.freeze([
  "kp_g6b_u06_pie_chart_part_whole",
  "kp_g6b_u06_compare_pie_charts"
]);
export const G6B_U06_P07F21_PROTECTED_FUTURE_KP_IDS=Object.freeze([
  "kp_g6b_u06_pie_chart_percent_angle_conversion",
  "kp_g6b_u06_construct_pie_chart"
]);
export const G6B_U06_P07F21_REQUIRED_PREREQUISITE_KP_IDS=Object.freeze([
  "kp_g5b_u08_percentage_of_quantity",
  "kp_g6b_u06_pie_chart_part_whole"
]);
export const G6B_U06_P07F21_QUEUE_REQUIRED_CAPABILITY_IDS=Object.freeze(["cap_ratio_percent_reasoning","cap_ratio_rate_validator"]);
export const G6B_U06_P07F21_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly","cap_answer_key_projection",
  "cap_html_print_renderer","cap_ratio_percent_reasoning","cap_ratio_rate_validator","cap_text_application_representation"
]);
export const G6B_U06_P07F21_OPTIONAL_CAPABILITY_IDS=Object.freeze([]);
export const G6B_U06_P07F21_APPLIED_MODIFIER_IDS=Object.freeze([]);
export const G6B_U06_P07F21_INCLUDED_RELATIONS=Object.freeze([
  "SOLVE_PART_QUANTITY_FROM_TOTAL_AND_PIE_SECTOR_PERCENT",
  "SOLVE_PART_QUANTITY_FROM_TOTAL_AND_EQUIVALENT_DECIMAL_RATE",
  "SOLVE_PIE_CHART_HOUSEHOLD_EXPENSE_AMOUNT_FROM_TOTAL_AND_RATE",
  "BACK_SUBSTITUTE_PART_QUANTITY_TO_TOTAL_AND_RATE"
]);
const spec=(id,family,relation,rateDisplayMode,contextKind)=>Object.freeze({
  patternSpecId:id,knowledgePointId:G6B_U06_P07F21_KP_ID,patternGroupId:"pg_g6b_u06_pie_chart_quantity_from_rate",
  patternFamilyId:family,relation,rateDisplayMode,contextKind,semanticCore:"PART_QUANTITY_FROM_TOTAL_TIMES_PIE_CHART_RATE",
  questionMode:"numeric",answerDomain:"POSITIVE_INTEGER",representation:"text_application",
  totalQuantityGivenRequired:true,pieChartSectorRateGivenRequired:true,solvePartQuantityRequired:true,
  answerMustEqualTotalTimesRate:true,backSubstitutionRequired:true,discreteQuantityIntegerRequired:true,
  predecessorPiePartWholeReownershipAllowed:false,predecessorComparePieChartsReownershipAllowed:false,
  explicitPercentAngleConversionAllowed:false,pieChartConstructionAllowed:false,crossChartComparisonAllowed:false,
  sameUnitMixedAllowed:false,crossUnitMixedAllowed:false
});
export const G6B_U06_P07F21_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g6b_u06_pie_chart_quantity_from_rate",sourceId:G6B_U06_P07F21_SOURCE_ID,unitCode:G6B_U06_P07F21_UNIT_CODE,unitTitle:G6B_U06_P07F21_UNIT_TITLE,
  displayName:"由圓形圖比率求數量",primaryKnowledgePointId:G6B_U06_P07F21_KP_ID,knowledgePointIds:Object.freeze([G6B_U06_P07F21_KP_ID]),
  supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",representationTag:"text_application",
  representationTags:Object.freeze(["pie_chart","ratio","percent","part_quantity","total_quantity","application"]),
  patternSpecIds:Object.freeze([
    "ps_g6b_u06_pie_sector_percent_to_quantity",
    "ps_g6b_u06_pie_sector_decimal_rate_to_quantity",
    "ps_g6b_u06_household_expense_pie_rate_to_amount"
  ]),
  allocationPolicy:"balanced_pattern_spec",visibilityStatus:"visible",holdReason:null
});
export const G6B_U06_P07F21_PATTERN_SPECS=Object.freeze([
  spec("ps_g6b_u06_pie_sector_percent_to_quantity","PIE_SECTOR_PERCENT_TO_QUANTITY",G6B_U06_P07F21_INCLUDED_RELATIONS[0],"percent","generic_quantity"),
  spec("ps_g6b_u06_pie_sector_decimal_rate_to_quantity","PIE_SECTOR_DECIMAL_RATE_TO_QUANTITY",G6B_U06_P07F21_INCLUDED_RELATIONS[1],"decimal","generic_quantity"),
  spec("ps_g6b_u06_household_expense_pie_rate_to_amount","HOUSEHOLD_EXPENSE_PIE_RATE_TO_AMOUNT",G6B_U06_P07F21_INCLUDED_RELATIONS[2],"percent","household_expense")
]);
export const G6B_U06_P07F21_SPEC_IDS=Object.freeze(G6B_U06_P07F21_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G6B_U06_P07F21_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g6b_u06_pie_chart_quantity_from_rate_p07f21",r04MappingId:"r04map_g6b_u06_pie_chart_quantity_from_rate",
  sourceId:G6B_U06_P07F21_SOURCE_ID,r02EvidencePages:Object.freeze([1]),currentVisualSupportingPages:Object.freeze([1]),
  knowledgePointId:G6B_U06_P07F21_KP_ID,canonicalNameZh:"由圓形圖比率求數量",
  capabilityStatement:"學生能由總量與扇形比率求各類數量。",reasoningInvariant:"部分量等於總量乘扇形比例。",
  sourceSemanticCore:"PART_QUANTITY_FROM_TOTAL_TIMES_PIE_CHART_RATE",
  semanticAuthority:"R02_FULL_PAGE_VISUAL_READBACK_PLUS_CURRENT_DIRECT_PDF_VISUAL_CORROBORATION",
  currentVisualSupportLevel:"DIRECT_TOTAL_AND_PIE_CHART_RATE_TO_PART_QUANTITY_EVIDENCE",
  sourceStructuralCarrier:"2月份家用支出百分圖＋總支出80000表格",
  exactSourceRateReproduction:false,
  primaryRuntimeProfileId:"profile_ratio_percent",classificationRuleId:"rule_ratio_percent",
  appliedRuntimeModifierIds:G6B_U06_P07F21_APPLIED_MODIFIER_IDS,requiredCapabilityIds:G6B_U06_P07F21_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6B_U06_P07F21_OPTIONAL_CAPABILITY_IDS,queueRequiredW7CapabilityIds:G6B_U06_P07F21_QUEUE_REQUIRED_CAPABILITY_IDS,
  patternSpecIds:G6B_U06_P07F21_SPEC_IDS,requiredPrerequisiteKnowledgePointIds:G6B_U06_P07F21_REQUIRED_PREREQUISITE_KP_IDS,
  percentageOfQuantityPrerequisiteMayBeConsumed:true,pieChartPartWholePrerequisiteMayBeConsumed:true,priorKnowledgePointOwnershipMayNotBeReowned:true,
  totalQuantityGivenRequired:true,pieChartSectorRateGivenRequired:true,solvePartQuantityRequired:true,answerMustEqualTotalTimesRate:true,backSubstitutionRequired:true,
  predecessorPiePartWholeReownershipAllowed:false,predecessorComparePieChartsReownershipAllowed:false,
  explicitPercentAngleConversionAllowed:false,pieChartConstructionAllowed:false,crossChartComparisonAllowed:false,
  sameUnitMixedAllowed:false,crossUnitMixedAllowed:false,r04ReclassificationAllowed:false,frozenQueueMutationAllowed:false
});
export const G6B_U06_P07F21_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G6B_U06_P07F21_KP_ID,sourceId:G6B_U06_P07F21_SOURCE_ID,unitCode:G6B_U06_P07F21_UNIT_CODE,unitTitle:G6B_U06_P07F21_UNIT_TITLE,
  displayName:"由圓形圖比率求數量",canonicalNameZh:"由圓形圖比率求數量",mode:"numeric",questionMode:"numeric",questionModes:Object.freeze(["numeric"]),
  supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:"APPLICATION_COMPATIBLE",
  canonicalPatternGroupIds:Object.freeze([G6B_U06_P07F21_PATTERN_GROUP.patternGroupId]),canonicalPatternSpecIds:G6B_U06_P07F21_SPEC_IDS,
  patternGroupIds:Object.freeze([G6B_U06_P07F21_PATTERN_GROUP.patternGroupId]),patternSpecIds:G6B_U06_P07F21_SPEC_IDS,
  requiredCapabilityIds:G6B_U06_P07F21_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G6B_U06_P07F21_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P07F21_G6B_U06_PIE_CHART_QUANTITY_FROM_RATE",productionUse:"full_product_w7_slice021_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6BU06P07F21SelectorRow=id=>id===G6B_U06_P07F21_KP_ID?clone(G6B_U06_P07F21_SELECTOR_ROW):null;
export const listG6BU06P07F21PatternGroups=id=>id===G6B_U06_P07F21_KP_ID?[clone(G6B_U06_P07F21_PATTERN_GROUP)]:[];
export const resolveG6BU06P07F21PatternSpecIds=id=>id===G6B_U06_P07F21_KP_ID?clone(G6B_U06_P07F21_SPEC_IDS):[];
export function auditG6BU06P07F21Projection(){
  const e=[];
  if(G6B_U06_P07F21_PATTERN_SPECS.length!==3||G6B_U06_P07F21_FORMAL_MAPPING.patternSpecIds.length!==3)e.push("P07F21_PATTERN_CARDINALITY_INVALID");
  if(new Set(G6B_U06_P07F21_SPEC_IDS).size!==3)e.push("P07F21_PATTERN_SPEC_DUPLICATE");
  for(const x of G6B_U06_P07F21_PATTERN_SPECS){
    if(x.questionMode!=="numeric"||x.representation!=="text_application"||x.semanticCore!=="PART_QUANTITY_FROM_TOTAL_TIMES_PIE_CHART_RATE"||
      !x.totalQuantityGivenRequired||!x.pieChartSectorRateGivenRequired||!x.solvePartQuantityRequired||!x.answerMustEqualTotalTimesRate||!x.backSubstitutionRequired||
      !x.discreteQuantityIntegerRequired||x.predecessorPiePartWholeReownershipAllowed||x.predecessorComparePieChartsReownershipAllowed||
      x.explicitPercentAngleConversionAllowed||x.pieChartConstructionAllowed||x.crossChartComparisonAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed)
      e.push("P07F21_PATTERN_SCOPE_INVALID:"+x.patternSpecId);
  }
  const m=G6B_U06_P07F21_FORMAL_MAPPING;
  if(m.primaryRuntimeProfileId!=="profile_ratio_percent"||m.classificationRuleId!=="rule_ratio_percent"||m.appliedRuntimeModifierIds.length!==0||
    m.requiredCapabilityIds.join("|")!==G6B_U06_P07F21_REQUIRED_CAPABILITY_IDS.join("|")||m.optionalCapabilityIds.length!==0||
    m.queueRequiredW7CapabilityIds.join("|")!==G6B_U06_P07F21_QUEUE_REQUIRED_CAPABILITY_IDS.join("|")||
    !m.totalQuantityGivenRequired||!m.pieChartSectorRateGivenRequired||!m.solvePartQuantityRequired||!m.answerMustEqualTotalTimesRate||!m.backSubstitutionRequired||
    m.predecessorPiePartWholeReownershipAllowed||m.predecessorComparePieChartsReownershipAllowed||m.explicitPercentAngleConversionAllowed||
    m.pieChartConstructionAllowed||m.crossChartComparisonAllowed||m.sameUnitMixedAllowed||m.crossUnitMixedAllowed||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed)
    e.push("P07F21_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1})});
}
