export const P07F03_TASK_ID="P07F_W7DirectProductVerticalSlice003Implementation";
export const G6A_U05_P07F03_SOURCE_ID="g6a_u05_6a05";
export const G6A_U05_P07F03_UNIT_CODE="6A-U05";
export const G6A_U05_P07F03_UNIT_TITLE="比和比值";
export const G6A_U05_P07F03_KP_ID="kp_g6a_u05_equivalent_ratio";
export const G6A_U05_P07F03_PREDECESSOR_KP_IDS=Object.freeze(["kp_g6a_u05_ratio_notation_order","kp_g6a_u05_ratio_value"]);
export const G6A_U05_P07F03_PROTECTED_FUTURE_KP_IDS=Object.freeze(["kp_g6a_u05_simplify_ratio","kp_g6a_u05_ratio_partition_application"]);
export const G6A_U05_P07F03_QUEUE_REQUIRED_CAPABILITY_IDS=Object.freeze([]);
export const G6A_U05_P07F03_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution",
  "cap_deterministic_answer_model",
  "cap_worksheet_document_assembly",
  "cap_answer_key_projection",
  "cap_html_print_renderer",
  "cap_integer_domain_validator",
  "cap_text_numeric_representation",
  "cap_integer_add_sub",
  "cap_integer_multiplication"
]);
export const G6A_U05_P07F03_OPTIONAL_CAPABILITY_IDS=Object.freeze([]);
export const G6A_U05_P07F03_APPLIED_MODIFIER_IDS=Object.freeze(["mod_integer_add_sub","mod_integer_multiplication"]);
export const G6A_U05_P07F03_INCLUDED_RELATIONS=Object.freeze([
  "ESTABLISH_EQUIVALENT_RATIO_BY_COMMON_NONZERO_MULTIPLICATION",
  "ESTABLISH_EQUIVALENT_RATIO_BY_EXACT_COMMON_NONZERO_DIVISION",
  "VERIFY_RATIO_VALUE_INVARIANCE",
  "PRESERVE_ANTECEDENT_CONSEQUENT_ROLE_ORDER"
]);
export const G6A_U05_P07F03_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g6a_u05_equivalent_ratio",
  sourceId:G6A_U05_P07F03_SOURCE_ID,
  unitCode:G6A_U05_P07F03_UNIT_CODE,
  unitTitle:G6A_U05_P07F03_UNIT_TITLE,
  displayName:"相等的比",
  primaryKnowledgePointId:G6A_U05_P07F03_KP_ID,
  knowledgePointIds:Object.freeze([G6A_U05_P07F03_KP_ID]),
  supportClass:"A",
  mode:"numeric",
  publicQuestionMode:"numeric",
  representationTag:"text_numeric_equivalent_ratio",
  representationTags:Object.freeze(["ratio","equivalent_ratio","common_scale_factor","text_numeric"]),
  patternSpecIds:Object.freeze([
    "ps_g6a_u05_equivalent_ratio_forward_scale",
    "ps_g6a_u05_equivalent_ratio_reverse_scale",
    "ps_g6a_u05_equivalent_ratio_missing_term"
  ]),
  allocationPolicy:"balanced_pattern_spec",
  visibilityStatus:"visible",
  holdReason:null
});
function spec(id,family,targetKind){
  return Object.freeze({
    patternSpecId:id,
    knowledgePointId:G6A_U05_P07F03_KP_ID,
    patternGroupId:G6A_U05_P07F03_PATTERN_GROUP.patternGroupId,
    patternFamilyId:family,
    semanticCore:"EQUIVALENT_RATIO_PRESERVES_RATIO_VALUE_UNDER_COMMON_NONZERO_SCALE_FACTOR",
    targetKind,
    questionMode:"numeric",
    answerDomain:targetKind==="MISSING_TERM"?"POSITIVE_INTEGER":"RATIO_STRING",
    representation:"text_numeric_equivalent_ratio",
    commonScaleFactorBothTermsRequired:true,
    commonScaleFactorNonzeroRequired:true,
    ratioValueInvariantRequired:true,
    antecedentConsequentOrderRequired:true,
    reverseDivisionExactRequired:targetKind==="REVERSE_SCALE",
    crossProductValidatorInternalAllowed:true,
    crossMultiplicationTeachingAllowed:false,
    q001RatioNotationReownershipAllowed:false,
    q002RatioValueReownershipAllowed:false,
    simplestIntegerRatioRequired:false,
    simplifyToCoprimeAllowed:false,
    ratioPartitionApplicationAllowed:false,
    percentConversionAllowed:false,
    applicationContextAllowed:false,
    genericIntegerOperationsDrillAllowed:false,
    sameUnitMixedAllowed:false,
    crossUnitMixedAllowed:false
  });
}
export const G6A_U05_P07F03_PATTERN_SPECS=Object.freeze([
  spec("ps_g6a_u05_equivalent_ratio_forward_scale","EQUIVALENT_RATIO_FORWARD_SCALE","FORWARD_SCALE"),
  spec("ps_g6a_u05_equivalent_ratio_reverse_scale","EQUIVALENT_RATIO_REVERSE_SCALE","REVERSE_SCALE"),
  spec("ps_g6a_u05_equivalent_ratio_missing_term","EQUIVALENT_RATIO_MISSING_TERM","MISSING_TERM")
]);
export const G6A_U05_P07F03_SPEC_IDS=Object.freeze(G6A_U05_P07F03_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G6A_U05_P07F03_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g6a_u05_equivalent_ratio_p07f03",
  r04MappingId:"r04map_g6a_u05_equivalent_ratio",
  sourceId:G6A_U05_P07F03_SOURCE_ID,
  sourcePages:Object.freeze([3]),
  r02EvidencePages:Object.freeze([3]),
  knowledgePointId:G6A_U05_P07F03_KP_ID,
  canonicalNameZh:"相等的比",
  capabilityStatement:"學生能以同比例乘除建立相等的比。",
  reasoningInvariant:"前後項同乘或同除非零數時比值不變。",
  sourceSemanticCore:"EQUIVALENT_RATIO_PRESERVES_RATIO_VALUE_UNDER_COMMON_NONZERO_SCALE_FACTOR",
  primaryRuntimeProfileId:"profile_integer_operations",
  classificationRuleId:"rule_integer_operations",
  appliedRuntimeModifierIds:G6A_U05_P07F03_APPLIED_MODIFIER_IDS,
  requiredCapabilityIds:G6A_U05_P07F03_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6A_U05_P07F03_OPTIONAL_CAPABILITY_IDS,
  queueRequiredW7CapabilityIds:G6A_U05_P07F03_QUEUE_REQUIRED_CAPABILITY_IDS,
  patternSpecIds:G6A_U05_P07F03_SPEC_IDS,
  semanticProfileInterpretation:"EXECUTION_ENVELOPE_ONLY_NOT_KNOWLEDGE_POINT_SEMANTIC_OWNER",
  q001OrderedAntecedentConsequentRolesRemainPrerequisite:true,
  q002RatioValueEqualityRemainsPrerequisite:true,
  commonScaleFactorMustBeAppliedToBothTerms:true,
  commonScaleFactorMustBeNonzero:true,
  forwardCommonIntegerMultiplicationAllowed:true,
  reverseCommonIntegerDivisionAllowedOnlyWhenExactOnBothTerms:true,
  ratioValueMustRemainInvariant:true,
  crossProductEqualityMayBeUsedByValidatorInternally:true,
  crossMultiplicationMayNotBeTaughtOrSurfacedAsQ003Method:true,
  q001RatioNotationTeachingReownershipAllowed:false,
  q002RatioValueTeachingReownershipAllowed:false,
  simplifyToCoprimeRatioAllowed:false,
  ratioPartitionApplicationAllowed:false,
  percentConversionAllowed:false,
  applicationContextAllowed:false,
  genericIntegerOperationsDrillAllowed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false,
  r04ReclassificationAllowed:false,
  frozenQueueMutationAllowed:false
});
export const G6A_U05_P07F03_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G6A_U05_P07F03_KP_ID,
  sourceId:G6A_U05_P07F03_SOURCE_ID,
  unitCode:G6A_U05_P07F03_UNIT_CODE,
  unitTitle:G6A_U05_P07F03_UNIT_TITLE,
  displayName:"相等的比",
  canonicalNameZh:"相等的比",
  mode:"numeric",
  questionMode:"numeric",
  questionModes:Object.freeze(["numeric"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:"APPLICATION_COMPATIBLE",
  canonicalPatternGroupIds:Object.freeze([G6A_U05_P07F03_PATTERN_GROUP.patternGroupId]),
  canonicalPatternSpecIds:G6A_U05_P07F03_SPEC_IDS,
  patternGroupIds:Object.freeze([G6A_U05_P07F03_PATTERN_GROUP.patternGroupId]),
  patternSpecIds:G6A_U05_P07F03_SPEC_IDS,
  requiredCapabilityIds:G6A_U05_P07F03_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6A_U05_P07F03_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P07F03_G6A_U05_SOURCE_BACKED_EQUIVALENT_RATIO",
  productionUse:"full_product_w7_slice003_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6AU05P07F03SelectorRow=id=>id===G6A_U05_P07F03_KP_ID?clone(G6A_U05_P07F03_SELECTOR_ROW):null;
export const listG6AU05P07F03PatternGroups=id=>id===G6A_U05_P07F03_KP_ID?[clone(G6A_U05_P07F03_PATTERN_GROUP)]:[];
export const resolveG6AU05P07F03PatternSpecIds=id=>id===G6A_U05_P07F03_KP_ID?clone(G6A_U05_P07F03_SPEC_IDS):[];
export function auditG6AU05P07F03Projection(){
  const e=[];
  if(G6A_U05_P07F03_PATTERN_SPECS.length!==3||G6A_U05_P07F03_FORMAL_MAPPING.patternSpecIds.length!==3)e.push("P07F03_PATTERN_CARDINALITY_INVALID");
  if(new Set(G6A_U05_P07F03_SPEC_IDS).size!==3)e.push("P07F03_PATTERN_SPEC_DUPLICATE");
  if(G6A_U05_P07F03_PATTERN_SPECS.some(x=>x.questionMode!=="numeric"||x.semanticCore!=="EQUIVALENT_RATIO_PRESERVES_RATIO_VALUE_UNDER_COMMON_NONZERO_SCALE_FACTOR"||!x.commonScaleFactorBothTermsRequired||!x.commonScaleFactorNonzeroRequired||!x.ratioValueInvariantRequired||!x.antecedentConsequentOrderRequired||!x.crossProductValidatorInternalAllowed||x.crossMultiplicationTeachingAllowed||x.q001RatioNotationReownershipAllowed||x.q002RatioValueReownershipAllowed||x.simplestIntegerRatioRequired||x.simplifyToCoprimeAllowed||x.ratioPartitionApplicationAllowed||x.percentConversionAllowed||x.applicationContextAllowed||x.genericIntegerOperationsDrillAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed))e.push("P07F03_PATTERN_SCOPE_INVALID");
  const m=G6A_U05_P07F03_FORMAL_MAPPING;
  if(m.primaryRuntimeProfileId!=="profile_integer_operations"||m.classificationRuleId!=="rule_integer_operations"||m.appliedRuntimeModifierIds.join("|")!==G6A_U05_P07F03_APPLIED_MODIFIER_IDS.join("|")||m.semanticProfileInterpretation!=="EXECUTION_ENVELOPE_ONLY_NOT_KNOWLEDGE_POINT_SEMANTIC_OWNER"||!m.q001OrderedAntecedentConsequentRolesRemainPrerequisite||!m.q002RatioValueEqualityRemainsPrerequisite||!m.commonScaleFactorMustBeAppliedToBothTerms||!m.commonScaleFactorMustBeNonzero||!m.forwardCommonIntegerMultiplicationAllowed||!m.reverseCommonIntegerDivisionAllowedOnlyWhenExactOnBothTerms||!m.ratioValueMustRemainInvariant||!m.crossProductEqualityMayBeUsedByValidatorInternally||!m.crossMultiplicationMayNotBeTaughtOrSurfacedAsQ003Method||m.q001RatioNotationTeachingReownershipAllowed||m.q002RatioValueTeachingReownershipAllowed||m.simplifyToCoprimeRatioAllowed||m.ratioPartitionApplicationAllowed||m.percentConversionAllowed||m.applicationContextAllowed||m.genericIntegerOperationsDrillAllowed||m.sameUnitMixedAllowed||m.crossUnitMixedAllowed||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed)e.push("P07F03_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1})});
}
