export const P07F08_TASK_ID="P07F_W7DirectProductVerticalSlice008Implementation";
export const G5B_U08_P07F08_SOURCE_ID="g5b_u08_5b08";
export const G5B_U08_P07F08_UNIT_CODE="5B-U08";
export const G5B_U08_P07F08_UNIT_TITLE="比率與百分率";
export const G5B_U08_P07F08_KP_ID="kp_g5b_u08_ratio_fraction_decimal_percent_conversion";
export const G5B_U08_P07F08_PREDECESSOR_KP_IDS=Object.freeze(["kp_g6a_u05_ratio_value","kp_g6b_u01_decimal_fraction_conversion"]);
export const G5B_U08_P07F08_PROTECTED_FUTURE_KP_IDS=Object.freeze([
  "kp_g5b_u08_find_percentage_rate",
  "kp_g5b_u08_percentage_of_quantity",
  "kp_g5b_u08_find_base_quantity_percent",
  "kp_g5b_u08_percent_discount_increase_application"
]);
export const G5B_U08_P07F08_QUEUE_REQUIRED_CAPABILITY_IDS=Object.freeze(["cap_ratio_percent_reasoning","cap_ratio_rate_validator"]);
export const G5B_U08_P07F08_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly",
  "cap_answer_key_projection","cap_html_print_renderer","cap_ratio_percent_reasoning",
  "cap_ratio_rate_validator","cap_text_application_representation"
]);
export const G5B_U08_P07F08_OPTIONAL_CAPABILITY_IDS=Object.freeze([]);
export const G5B_U08_P07F08_APPLIED_MODIFIER_IDS=Object.freeze([]);
export const G5B_U08_P07F08_INCLUDED_RELATIONS=Object.freeze([
  "FRACTION_TO_DECIMAL_EQUIVALENCE","DECIMAL_TO_FRACTION_EQUIVALENCE",
  "DECIMAL_TO_PERCENT_EQUIVALENCE","PERCENT_TO_DECIMAL_EQUIVALENCE",
  "FRACTION_TO_PERCENT_EQUIVALENCE","PERCENT_TO_FRACTION_EQUIVALENCE",
  "PERCENT_SYMBOL_BASE100_IDENTITY"
]);
export const G5B_U08_P07F08_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g5b_u08_fraction_decimal_percent_conversion",
  sourceId:G5B_U08_P07F08_SOURCE_ID,unitCode:G5B_U08_P07F08_UNIT_CODE,unitTitle:G5B_U08_P07F08_UNIT_TITLE,
  displayName:"分數小數百分率互換",primaryKnowledgePointId:G5B_U08_P07F08_KP_ID,
  knowledgePointIds:Object.freeze([G5B_U08_P07F08_KP_ID]),supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",
  representationTag:"fraction_decimal_percent_equivalence",
  representationTags:Object.freeze(["ratio","fraction","decimal","percent","equivalence","numeric"]),
  patternSpecIds:Object.freeze([
    "ps_g5b_u08_fraction_to_decimal","ps_g5b_u08_decimal_to_fraction",
    "ps_g5b_u08_decimal_to_percent","ps_g5b_u08_percent_to_decimal",
    "ps_g5b_u08_fraction_to_percent","ps_g5b_u08_percent_to_fraction"
  ]),
  allocationPolicy:"balanced_pattern_spec",visibilityStatus:"visible",holdReason:null
});
function spec(id,family,targetKind,relation){
  return Object.freeze({
    patternSpecId:id,knowledgePointId:G5B_U08_P07F08_KP_ID,patternGroupId:G5B_U08_P07F08_PATTERN_GROUP.patternGroupId,
    patternFamilyId:family,relation,semanticCore:"FRACTION_DECIMAL_PERCENT_REPRESENT_THE_SAME_RATIO",
    targetKind,questionMode:"numeric",answerDomain:targetKind.endsWith("_TO_FRACTION")?"SIMPLIFIED_FRACTION":targetKind.endsWith("_TO_PERCENT")?"PERCENT":"DECIMAL",
    representation:"fraction_decimal_percent_equivalence",ratioValuePrerequisiteRequired:true,decimalFractionConversionPrerequisiteRequired:true,
    fractionRepresentationRequired:true,decimalRepresentationRequired:true,percentRepresentationRequired:true,representationValueEquivalenceRequired:true,
    percentMayExceed100:true,percentIdentityOnePercentEqualsOneOverHundred:true,simplifyFractionOutputWhenFractionRequested:true,
    findPercentageRateFromTwoQuantitiesAllowed:false,percentageOfQuantityAllowed:false,findBaseQuantityAllowed:false,
    discountIncreaseApplicationAllowed:false,roleBasedBaseComparisonQuantityTeachingAllowed:false,applicationContextAllowed:false,
    sameUnitMixedAllowed:false,crossUnitMixedAllowed:false
  });
}
export const G5B_U08_P07F08_PATTERN_SPECS=Object.freeze([
  spec("ps_g5b_u08_fraction_to_decimal","FRACTION_TO_DECIMAL","FRACTION_TO_DECIMAL",G5B_U08_P07F08_INCLUDED_RELATIONS[0]),
  spec("ps_g5b_u08_decimal_to_fraction","DECIMAL_TO_FRACTION","DECIMAL_TO_FRACTION",G5B_U08_P07F08_INCLUDED_RELATIONS[1]),
  spec("ps_g5b_u08_decimal_to_percent","DECIMAL_TO_PERCENT","DECIMAL_TO_PERCENT",G5B_U08_P07F08_INCLUDED_RELATIONS[2]),
  spec("ps_g5b_u08_percent_to_decimal","PERCENT_TO_DECIMAL","PERCENT_TO_DECIMAL",G5B_U08_P07F08_INCLUDED_RELATIONS[3]),
  spec("ps_g5b_u08_fraction_to_percent","FRACTION_TO_PERCENT","FRACTION_TO_PERCENT",G5B_U08_P07F08_INCLUDED_RELATIONS[4]),
  spec("ps_g5b_u08_percent_to_fraction","PERCENT_TO_FRACTION","PERCENT_TO_FRACTION",G5B_U08_P07F08_INCLUDED_RELATIONS[5])
]);
export const G5B_U08_P07F08_SPEC_IDS=Object.freeze(G5B_U08_P07F08_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G5B_U08_P07F08_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g5b_u08_ratio_fraction_decimal_percent_conversion_p07f08",
  r04MappingId:"r04map_g5b_u08_ratio_fraction_decimal_percent_conversion",
  sourceId:G5B_U08_P07F08_SOURCE_ID,r02EvidencePages:Object.freeze([1,2]),currentVisualSupportingPages:Object.freeze([1]),
  knowledgePointId:G5B_U08_P07F08_KP_ID,canonicalNameZh:"分數小數百分率互換",
  capabilityStatement:"學生能在分數、小數與百分率間轉換。",
  reasoningInvariant:"三種表示須代表相同部分占全體的比率。",
  sourceSemanticCore:"FRACTION_DECIMAL_PERCENT_REPRESENT_THE_SAME_RATIO",
  semanticAuthority:"R02_REVIEWED_CANDIDATE_PLUS_CURRENT_DIRECT_VISUAL_FRACTION_DECIMAL_PERCENT_EQUIVALENCE_EVIDENCE",
  currentVisualSupportLevel:"DIRECT_LITERAL_FRACTION_DECIMAL_PERCENT_INTERCONVERSION",
  primaryRuntimeProfileId:"profile_ratio_percent",classificationRuleId:"rule_ratio_percent",
  appliedRuntimeModifierIds:G5B_U08_P07F08_APPLIED_MODIFIER_IDS,
  requiredCapabilityIds:G5B_U08_P07F08_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G5B_U08_P07F08_OPTIONAL_CAPABILITY_IDS,
  queueRequiredW7CapabilityIds:G5B_U08_P07F08_QUEUE_REQUIRED_CAPABILITY_IDS,patternSpecIds:G5B_U08_P07F08_SPEC_IDS,
  ratioValuePrerequisiteRequired:true,decimalFractionConversionPrerequisiteRequired:true,
  fractionRepresentationRequired:true,decimalRepresentationRequired:true,percentRepresentationRequired:true,representationValueEquivalenceRequired:true,
  percentMayExceed100:true,percentIdentityOnePercentEqualsOneOverHundred:true,simplifyFractionOutputWhenFractionRequested:true,
  findPercentageRateFromTwoQuantitiesAllowed:false,percentageOfQuantityAllowed:false,findBaseQuantityAllowed:false,
  discountIncreaseApplicationAllowed:false,roleBasedBaseComparisonQuantityTeachingAllowed:false,applicationContextAllowed:false,
  sameUnitMixedAllowed:false,crossUnitMixedAllowed:false,r04ReclassificationAllowed:false,frozenQueueMutationAllowed:false
});
export const G5B_U08_P07F08_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G5B_U08_P07F08_KP_ID,sourceId:G5B_U08_P07F08_SOURCE_ID,unitCode:G5B_U08_P07F08_UNIT_CODE,unitTitle:G5B_U08_P07F08_UNIT_TITLE,
  displayName:"分數小數百分率互換",canonicalNameZh:"分數小數百分率互換",mode:"numeric",questionMode:"numeric",questionModes:Object.freeze(["numeric"]),
  supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,
  applicationClassification:"REPRESENTATION_EQUIVALENCE_ONLY_APPLICATION_NOT_ADMITTED",
  canonicalPatternGroupIds:Object.freeze([G5B_U08_P07F08_PATTERN_GROUP.patternGroupId]),
  canonicalPatternSpecIds:G5B_U08_P07F08_SPEC_IDS,patternGroupIds:Object.freeze([G5B_U08_P07F08_PATTERN_GROUP.patternGroupId]),patternSpecIds:G5B_U08_P07F08_SPEC_IDS,
  requiredCapabilityIds:G5B_U08_P07F08_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G5B_U08_P07F08_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P07F08_G5B_U08_SOURCE_BACKED_FRACTION_DECIMAL_PERCENT_CONVERSION",productionUse:"full_product_w7_slice008_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG5BU08P07F08SelectorRow=id=>id===G5B_U08_P07F08_KP_ID?clone(G5B_U08_P07F08_SELECTOR_ROW):null;
export const listG5BU08P07F08PatternGroups=id=>id===G5B_U08_P07F08_KP_ID?[clone(G5B_U08_P07F08_PATTERN_GROUP)]:[];
export const resolveG5BU08P07F08PatternSpecIds=id=>id===G5B_U08_P07F08_KP_ID?clone(G5B_U08_P07F08_SPEC_IDS):[];
export function auditG5BU08P07F08Projection(){
  const e=[];
  if(G5B_U08_P07F08_PATTERN_SPECS.length!==6||G5B_U08_P07F08_FORMAL_MAPPING.patternSpecIds.length!==6)e.push("P07F08_PATTERN_CARDINALITY_INVALID");
  if(new Set(G5B_U08_P07F08_SPEC_IDS).size!==6)e.push("P07F08_PATTERN_SPEC_DUPLICATE");
  if(G5B_U08_P07F08_PATTERN_SPECS.some(x=>x.questionMode!=="numeric"||x.semanticCore!=="FRACTION_DECIMAL_PERCENT_REPRESENT_THE_SAME_RATIO"||!x.ratioValuePrerequisiteRequired||!x.decimalFractionConversionPrerequisiteRequired||!x.fractionRepresentationRequired||!x.decimalRepresentationRequired||!x.percentRepresentationRequired||!x.representationValueEquivalenceRequired||!x.percentMayExceed100||!x.percentIdentityOnePercentEqualsOneOverHundred||!x.simplifyFractionOutputWhenFractionRequested||x.findPercentageRateFromTwoQuantitiesAllowed||x.percentageOfQuantityAllowed||x.findBaseQuantityAllowed||x.discountIncreaseApplicationAllowed||x.roleBasedBaseComparisonQuantityTeachingAllowed||x.applicationContextAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed))e.push("P07F08_PATTERN_SCOPE_INVALID");
  const m=G5B_U08_P07F08_FORMAL_MAPPING;
  if(m.primaryRuntimeProfileId!=="profile_ratio_percent"||m.classificationRuleId!=="rule_ratio_percent"||m.appliedRuntimeModifierIds.length!==0||m.currentVisualSupportLevel!=="DIRECT_LITERAL_FRACTION_DECIMAL_PERCENT_INTERCONVERSION"||!m.ratioValuePrerequisiteRequired||!m.decimalFractionConversionPrerequisiteRequired||!m.representationValueEquivalenceRequired||!m.percentMayExceed100||!m.percentIdentityOnePercentEqualsOneOverHundred||m.findPercentageRateFromTwoQuantitiesAllowed||m.percentageOfQuantityAllowed||m.findBaseQuantityAllowed||m.discountIncreaseApplicationAllowed||m.applicationContextAllowed||m.sameUnitMixedAllowed||m.crossUnitMixedAllowed||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed)e.push("P07F08_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:6,formalMappings:1})});
}
