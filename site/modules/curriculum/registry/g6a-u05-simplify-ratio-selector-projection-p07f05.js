export const P07F05_TASK_ID="P07F_W7DirectProductVerticalSlice005Implementation";
export const G6A_U05_P07F05_SOURCE_ID="g6a_u05_6a05";
export const G6A_U05_P07F05_UNIT_CODE="6A-U05";
export const G6A_U05_P07F05_UNIT_TITLE="比和比值";
export const G6A_U05_P07F05_KP_ID="kp_g6a_u05_simplify_ratio";
export const G6A_U05_P07F05_PREDECESSOR_KP_IDS=Object.freeze([
  "kp_g6a_u05_ratio_notation_order",
  "kp_g6a_u05_ratio_value",
  "kp_g6a_u05_equivalent_ratio"
]);
export const G6A_U05_P07F05_PROTECTED_FUTURE_KP_IDS=Object.freeze([
  "kp_g6a_u05_ratio_partition_application"
]);
export const G6A_U05_P07F05_QUEUE_REQUIRED_CAPABILITY_IDS=Object.freeze([]);
export const G6A_U05_P07F05_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution",
  "cap_deterministic_answer_model",
  "cap_worksheet_document_assembly",
  "cap_answer_key_projection",
  "cap_html_print_renderer",
  "cap_factor_multiple_reasoning",
  "cap_factor_multiple_validator",
  "cap_text_numeric_representation"
]);
export const G6A_U05_P07F05_OPTIONAL_CAPABILITY_IDS=Object.freeze([]);
export const G6A_U05_P07F05_APPLIED_MODIFIER_IDS=Object.freeze([]);
export const G6A_U05_P07F05_INCLUDED_RELATIONS=Object.freeze([
  "FIND_COMMON_DIVISOR_FOR_BOTH_RATIO_TERMS",
  "DIVIDE_BOTH_TERMS_BY_COMMON_DIVISOR",
  "REDUCE_RATIO_TO_COPRIME_POSITIVE_INTEGER_TERMS",
  "VERIFY_RATIO_VALUE_INVARIANCE_AND_FINAL_GCD_ONE"
]);
export const G6A_U05_P07F05_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g6a_u05_simplify_ratio",
  sourceId:G6A_U05_P07F05_SOURCE_ID,
  unitCode:G6A_U05_P07F05_UNIT_CODE,
  unitTitle:G6A_U05_P07F05_UNIT_TITLE,
  displayName:"最簡整數比",
  primaryKnowledgePointId:G6A_U05_P07F05_KP_ID,
  knowledgePointIds:Object.freeze([G6A_U05_P07F05_KP_ID]),
  supportClass:"A",
  mode:"numeric",
  publicQuestionMode:"numeric",
  representationTag:"text_numeric_ratio_simplification",
  representationTags:Object.freeze(["ratio","simplification","gcd","coprime","integer","numeric"]),
  patternSpecIds:Object.freeze([
    "ps_g6a_u05_simplify_ratio_direct_gcd",
    "ps_g6a_u05_simplify_ratio_given_gcd",
    "ps_g6a_u05_simplify_ratio_repeated_common_factor"
  ]),
  allocationPolicy:"balanced_pattern_spec",
  visibilityStatus:"visible",
  holdReason:null
});
function spec(id,family,targetKind){
  return Object.freeze({
    patternSpecId:id,
    knowledgePointId:G6A_U05_P07F05_KP_ID,
    patternGroupId:G6A_U05_P07F05_PATTERN_GROUP.patternGroupId,
    patternFamilyId:family,
    relation:targetKind==="DIRECT_GCD_REDUCTION"
      ?G6A_U05_P07F05_INCLUDED_RELATIONS[0]
      :targetKind==="GIVEN_GCD_REDUCTION"
        ?G6A_U05_P07F05_INCLUDED_RELATIONS[1]
        :G6A_U05_P07F05_INCLUDED_RELATIONS[2],
    semanticCore:"SIMPLIFY_RATIO_TO_COPRIME_POSITIVE_INTEGER_TERMS",
    targetKind,
    questionMode:"numeric",
    answerDomain:"POSITIVE_INTEGER_RATIO_STRING",
    representation:"text_numeric_ratio_simplification",
    positiveIntegerInputRatioOnly:true,
    greatestCommonFactorPrerequisiteRequired:true,
    equivalentRatioPrerequisiteRequired:true,
    commonDivisorMustDivideBothTermsExactly:true,
    directGcdDivisionAllowed:true,
    repeatedCommonFactorDivisionAllowed:true,
    outputTermsMustBePositiveIntegers:true,
    outputTermsMustBeCoprime:true,
    finalGcdMustEqualOne:true,
    ratioValueInvariantRequired:true,
    antecedentConsequentOrderRequired:true,
    q001RatioNotationReownershipAllowed:false,
    q002RatioValueReownershipAllowed:false,
    q003EquivalentRatioReownershipAllowed:false,
    decimalRatioInputNormalizationAllowed:false,
    fractionRatioInputNormalizationAllowed:false,
    ratioPartitionApplicationAllowed:false,
    proportionCrossMultiplicationInternalAllowed:false,
    proportionCrossMultiplicationTeachingAllowed:false,
    percentConversionAllowed:false,
    applicationContextAllowed:false,
    sameUnitMixedAllowed:false,
    crossUnitMixedAllowed:false
  });
}
export const G6A_U05_P07F05_PATTERN_SPECS=Object.freeze([
  spec("ps_g6a_u05_simplify_ratio_direct_gcd","SIMPLIFY_RATIO_DIRECT_GCD","DIRECT_GCD_REDUCTION"),
  spec("ps_g6a_u05_simplify_ratio_given_gcd","SIMPLIFY_RATIO_GIVEN_GCD","GIVEN_GCD_REDUCTION"),
  spec("ps_g6a_u05_simplify_ratio_repeated_common_factor","SIMPLIFY_RATIO_REPEATED_COMMON_FACTOR","REPEATED_COMMON_FACTOR_REDUCTION")
]);
export const G6A_U05_P07F05_SPEC_IDS=Object.freeze(G6A_U05_P07F05_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G6A_U05_P07F05_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g6a_u05_simplify_ratio_p07f05",
  r04MappingId:"r04map_g6a_u05_simplify_ratio",
  sourceId:G6A_U05_P07F05_SOURCE_ID,
  r02EvidencePages:Object.freeze([4]),
  currentVisualSupportingPages:Object.freeze([1]),
  knowledgePointId:G6A_U05_P07F05_KP_ID,
  canonicalNameZh:"最簡整數比",
  capabilityStatement:"學生能將比化為互質整數比。",
  reasoningInvariant:"化簡前後比值相同且前後項無大於1公因數。",
  sourceSemanticCore:"SIMPLIFY_RATIO_TO_COPRIME_POSITIVE_INTEGER_TERMS",
  semanticAuthority:"R02_PAGE4_PRIMARY_CURRENT_VISUAL_PAGE1_SIMPLIFICATION_CONTEXT_WITHOUT_SILENT_RECONCILIATION",
  evidenceLocalizationMismatchPreserved:true,
  primaryRuntimeProfileId:"profile_factor_multiple",
  classificationRuleId:"rule_factor_multiple",
  appliedRuntimeModifierIds:G6A_U05_P07F05_APPLIED_MODIFIER_IDS,
  requiredCapabilityIds:G6A_U05_P07F05_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6A_U05_P07F05_OPTIONAL_CAPABILITY_IDS,
  queueRequiredW7CapabilityIds:G6A_U05_P07F05_QUEUE_REQUIRED_CAPABILITY_IDS,
  patternSpecIds:G6A_U05_P07F05_SPEC_IDS,
  greatestCommonFactorPrerequisiteRequired:true,
  equivalentRatioPrerequisiteRequired:true,
  positiveIntegerInputRatioOnly:true,
  outputTermsMustBeCoprime:true,
  finalGcdMustEqualOne:true,
  ratioValueInvariantRequired:true,
  decimalRatioInputNormalizationAllowed:false,
  fractionRatioInputNormalizationAllowed:false,
  ratioPartitionApplicationAllowed:false,
  proportionCrossMultiplicationInternalAllowed:false,
  proportionCrossMultiplicationTeachingAllowed:false,
  percentConversionAllowed:false,
  applicationContextAllowed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false,
  r04ReclassificationAllowed:false,
  frozenQueueMutationAllowed:false
});
export const G6A_U05_P07F05_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G6A_U05_P07F05_KP_ID,
  sourceId:G6A_U05_P07F05_SOURCE_ID,
  unitCode:G6A_U05_P07F05_UNIT_CODE,
  unitTitle:G6A_U05_P07F05_UNIT_TITLE,
  displayName:"最簡整數比",
  canonicalNameZh:"最簡整數比",
  mode:"numeric",
  questionMode:"numeric",
  questionModes:Object.freeze(["numeric"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:"NUMERIC_RATIO_SIMPLIFICATION_ONLY_APPLICATION_NOT_ADMITTED",
  canonicalPatternGroupIds:Object.freeze([G6A_U05_P07F05_PATTERN_GROUP.patternGroupId]),
  canonicalPatternSpecIds:G6A_U05_P07F05_SPEC_IDS,
  patternGroupIds:Object.freeze([G6A_U05_P07F05_PATTERN_GROUP.patternGroupId]),
  patternSpecIds:G6A_U05_P07F05_SPEC_IDS,
  requiredCapabilityIds:G6A_U05_P07F05_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6A_U05_P07F05_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P07F05_G6A_U05_SOURCE_BACKED_SIMPLIFY_RATIO",
  productionUse:"full_product_w7_slice005_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6AU05P07F05SelectorRow=id=>id===G6A_U05_P07F05_KP_ID?clone(G6A_U05_P07F05_SELECTOR_ROW):null;
export const listG6AU05P07F05PatternGroups=id=>id===G6A_U05_P07F05_KP_ID?[clone(G6A_U05_P07F05_PATTERN_GROUP)]:[];
export const resolveG6AU05P07F05PatternSpecIds=id=>id===G6A_U05_P07F05_KP_ID?clone(G6A_U05_P07F05_SPEC_IDS):[];
export function auditG6AU05P07F05Projection(){
  const e=[];
  if(G6A_U05_P07F05_PATTERN_SPECS.length!==3||G6A_U05_P07F05_FORMAL_MAPPING.patternSpecIds.length!==3)e.push("P07F05_PATTERN_CARDINALITY_INVALID");
  if(new Set(G6A_U05_P07F05_SPEC_IDS).size!==3)e.push("P07F05_PATTERN_SPEC_DUPLICATE");
  if(G6A_U05_P07F05_PATTERN_SPECS.some(x=>x.questionMode!=="numeric"||x.semanticCore!=="SIMPLIFY_RATIO_TO_COPRIME_POSITIVE_INTEGER_TERMS"||!x.positiveIntegerInputRatioOnly||!x.greatestCommonFactorPrerequisiteRequired||!x.equivalentRatioPrerequisiteRequired||!x.commonDivisorMustDivideBothTermsExactly||!x.directGcdDivisionAllowed||!x.repeatedCommonFactorDivisionAllowed||!x.outputTermsMustBePositiveIntegers||!x.outputTermsMustBeCoprime||!x.finalGcdMustEqualOne||!x.ratioValueInvariantRequired||!x.antecedentConsequentOrderRequired||x.q001RatioNotationReownershipAllowed||x.q002RatioValueReownershipAllowed||x.q003EquivalentRatioReownershipAllowed||x.decimalRatioInputNormalizationAllowed||x.fractionRatioInputNormalizationAllowed||x.ratioPartitionApplicationAllowed||x.proportionCrossMultiplicationInternalAllowed||x.proportionCrossMultiplicationTeachingAllowed||x.percentConversionAllowed||x.applicationContextAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed))e.push("P07F05_PATTERN_SCOPE_INVALID");
  const m=G6A_U05_P07F05_FORMAL_MAPPING;
  if(m.primaryRuntimeProfileId!=="profile_factor_multiple"||m.classificationRuleId!=="rule_factor_multiple"||m.appliedRuntimeModifierIds.length!==0||m.semanticAuthority!=="R02_PAGE4_PRIMARY_CURRENT_VISUAL_PAGE1_SIMPLIFICATION_CONTEXT_WITHOUT_SILENT_RECONCILIATION"||!m.evidenceLocalizationMismatchPreserved||!m.greatestCommonFactorPrerequisiteRequired||!m.equivalentRatioPrerequisiteRequired||!m.positiveIntegerInputRatioOnly||!m.outputTermsMustBeCoprime||!m.finalGcdMustEqualOne||!m.ratioValueInvariantRequired||m.decimalRatioInputNormalizationAllowed||m.fractionRatioInputNormalizationAllowed||m.ratioPartitionApplicationAllowed||m.proportionCrossMultiplicationInternalAllowed||m.proportionCrossMultiplicationTeachingAllowed||m.percentConversionAllowed||m.applicationContextAllowed||m.sameUnitMixedAllowed||m.crossUnitMixedAllowed||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed)e.push("P07F05_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1})});
}
