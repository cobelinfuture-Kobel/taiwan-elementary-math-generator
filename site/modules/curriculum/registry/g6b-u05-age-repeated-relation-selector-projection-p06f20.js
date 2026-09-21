export const P06F20_TASK_ID="P06F_W6DirectProductVerticalSlice020Implementation";
export const G6B_U05_P06F20_SOURCE_ID="g6b_u05_6b05";
export const G6B_U05_P06F20_UNIT_CODE="6B-U05";
export const G6B_U05_P06F20_UNIT_TITLE="怎樣解題";
export const G6B_U05_P06F20_KP_ID="kp_g6b_u05_age_or_repeated_relation_problem";
export const G6B_U05_P06F20_PREDECESSOR_KP_ID="kp_g6b_u05_sum_difference_problem";
export const G6B_U05_P06F20_PROTECTED_KP_IDS=Object.freeze([
  "kp_g6b_u05_sum_multiple_problem",
  "kp_g6b_u05_difference_multiple_problem",
  "kp_g6b_u05_work_or_distribution_strategy"
]);
export const G6B_U05_P06F20_QUEUE_REQUIRED_CAPABILITY_IDS=Object.freeze(["cap_symbolic_relation_reasoning"]);
export const G6B_U05_P06F20_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution",
  "cap_deterministic_answer_model",
  "cap_worksheet_document_assembly",
  "cap_answer_key_projection",
  "cap_html_print_renderer",
  "cap_symbolic_relation_reasoning",
  "cap_relation_model_binding",
  "cap_word_problem_semantic_validation",
  "cap_text_application_representation"
]);
export const G6B_U05_P06F20_OPTIONAL_CAPABILITY_IDS=Object.freeze([
  "cap_global_context_binding",
  "cap_pbl_task_set_projection"
]);
export const G6B_U05_P06F20_INCLUDED_RELATIONS=Object.freeze([
  "PRESERVE_AGE_DIFFERENCE_UNDER_EQUAL_TIME_SHIFT",
  "SATISFY_SOURCE_GIVEN_SHIFTED_AGE_RELATION",
  "BACK_SUBSTITUTE_CURRENT_AND_SHIFTED_AGE_RELATIONS"
]);
export const G6B_U05_P06F20_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g6b_u05_age_repeated_relation_problem",
  sourceId:G6B_U05_P06F20_SOURCE_ID,
  unitCode:G6B_U05_P06F20_UNIT_CODE,
  unitTitle:G6B_U05_P06F20_UNIT_TITLE,
  displayName:"年齡與不變差關係",
  primaryKnowledgePointId:G6B_U05_P06F20_KP_ID,
  knowledgePointIds:Object.freeze([G6B_U05_P06F20_KP_ID]),
  supportClass:"A",
  mode:"numeric",
  publicQuestionMode:"numeric",
  representationTag:"text_numeric_age_relation",
  representationTags:Object.freeze(["problem_relation","text_application","age_relation","equal_time_shift","difference_invariant","back_substitution"]),
  patternSpecIds:Object.freeze([
    "ps_g6b_u05_age_relation_future_multiple",
    "ps_g6b_u05_age_relation_past_multiple"
  ]),
  allocationPolicy:"balanced_pattern_spec",
  visibilityStatus:"visible",
  holdReason:null
});
function spec(id,family,timeDirection,targetQuantity){
  return Object.freeze({
    patternSpecId:id,
    knowledgePointId:G6B_U05_P06F20_KP_ID,
    patternGroupId:G6B_U05_P06F20_PATTERN_GROUP.patternGroupId,
    patternFamilyId:family,
    relation:"PRESERVE_AGE_DIFFERENCE_UNDER_EQUAL_TIME_SHIFT",
    shiftedRelation:"SATISFY_SOURCE_GIVEN_SHIFTED_AGE_RELATION",
    validatorRelation:"BACK_SUBSTITUTE_CURRENT_AND_SHIFTED_AGE_RELATIONS",
    semanticCore:"AGE_DIFFERENCE_INVARIANT_UNDER_EQUAL_TIME_SHIFT",
    timeDirection,
    targetQuantity,
    questionMode:"numeric",
    answerDomain:"POSITIVE_INTEGER_AGE",
    representation:"text_numeric_age_relation",
    ageContextSemanticCore:true,
    sameTimeShiftRequired:true,
    ageDifferenceInvariantRequired:true,
    shiftedMultiplicativeRelationRequired:true,
    currentAndShiftedBackSubstitutionRequired:true,
    positiveAgeStateRequired:true,
    q019SumDifferenceCoreReownershipAllowed:false,
    generalSumMultipleProblemReownershipAllowed:false,
    generalDifferenceMultipleProblemReownershipAllowed:false,
    workOrDistributionStrategyReownershipAllowed:false,
    genericSequenceOrRecurrenceReownershipAllowed:false,
    genericApplicationOverlayAllowed:false,
    globalContextBindingUsed:false,
    pblProjectionUsed:false,
    sameUnitMixedAllowed:false,
    crossUnitMixedAllowed:false
  });
}
export const G6B_U05_P06F20_PATTERN_SPECS=Object.freeze([
  spec("ps_g6b_u05_age_relation_future_multiple","AGE_RELATION_FUTURE_MULTIPLE","FUTURE","CURRENT_YOUNGER"),
  spec("ps_g6b_u05_age_relation_past_multiple","AGE_RELATION_PAST_MULTIPLE","PAST","CURRENT_OLDER")
]);
export const G6B_U05_P06F20_SPEC_IDS=Object.freeze(G6B_U05_P06F20_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G6B_U05_P06F20_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g6b_u05_age_repeated_relation_problem_p06f20",
  r04MappingId:"r04map_g6b_u05_age_or_repeated_relation_problem",
  sourceId:G6B_U05_P06F20_SOURCE_ID,
  sourcePages:Object.freeze([1]),
  r02EvidencePages:Object.freeze([1,2]),
  knowledgePointId:G6B_U05_P06F20_KP_ID,
  canonicalNameZh:"年齡與不變差關係",
  capabilityStatement:"學生能利用經過相同時間後年齡差不變解題。",
  reasoningInvariant:"兩人的年齡同增同減時差量保持不變。",
  sourceSemanticCore:"AGE_DIFFERENCE_INVARIANT_UNDER_EQUAL_TIME_SHIFT",
  primaryRuntimeProfileId:"profile_word_problem",
  classificationRuleId:"rule_word_problem",
  appliedRuntimeModifierIds:Object.freeze(["mod_application_semantics"]),
  requiredCapabilityIds:G6B_U05_P06F20_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6B_U05_P06F20_OPTIONAL_CAPABILITY_IDS,
  queueRequiredW6CapabilityIds:G6B_U05_P06F20_QUEUE_REQUIRED_CAPABILITY_IDS,
  patternSpecIds:G6B_U05_P06F20_SPEC_IDS,
  ageContextIsSemanticCore:true,
  bothAgesUseSameTimeShift:true,
  ageDifferenceMustRemainInvariant:true,
  shiftedAgeRelationMustBeSatisfied:true,
  shiftedRelationMayUseSourceBackedMultiplicativeCondition:true,
  currentAndShiftedRelationsMustBackSubstitute:true,
  invalidNegativeAgeStatesFailClosed:true,
  q019SumDifferenceCoreReownershipAllowed:false,
  generalSumMultipleProblemReownershipAllowed:false,
  generalDifferenceMultipleProblemReownershipAllowed:false,
  workOrDistributionStrategyReownershipAllowed:false,
  genericSequenceOrRecurrenceReownershipAllowed:false,
  genericApplicationOverlayAllowed:false,
  globalContextBindingUsed:false,
  pblProjectionUsed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false,
  r04ReclassificationAllowed:false,
  frozenQueueMutationAllowed:false
});
export const G6B_U05_P06F20_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G6B_U05_P06F20_KP_ID,
  sourceId:G6B_U05_P06F20_SOURCE_ID,
  unitCode:G6B_U05_P06F20_UNIT_CODE,
  unitTitle:G6B_U05_P06F20_UNIT_TITLE,
  displayName:"年齡與不變差關係",
  canonicalNameZh:"年齡與不變差關係",
  mode:"numeric",
  questionMode:"numeric",
  questionModes:Object.freeze(["numeric"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:"APPLICATION_COMPATIBLE",
  canonicalPatternGroupIds:Object.freeze([G6B_U05_P06F20_PATTERN_GROUP.patternGroupId]),
  canonicalPatternSpecIds:G6B_U05_P06F20_SPEC_IDS,
  patternGroupIds:Object.freeze([G6B_U05_P06F20_PATTERN_GROUP.patternGroupId]),
  patternSpecIds:G6B_U05_P06F20_SPEC_IDS,
  requiredCapabilityIds:G6B_U05_P06F20_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6B_U05_P06F20_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P06F20_G6B_U05_SOURCE_BACKED_AGE_RELATION",
  productionUse:"full_product_w6_slice020_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6BU05P06F20SelectorRow=id=>id===G6B_U05_P06F20_KP_ID?clone(G6B_U05_P06F20_SELECTOR_ROW):null;
export const listG6BU05P06F20PatternGroups=id=>id===G6B_U05_P06F20_KP_ID?[clone(G6B_U05_P06F20_PATTERN_GROUP)]:[];
export const resolveG6BU05P06F20PatternSpecIds=id=>id===G6B_U05_P06F20_KP_ID?clone(G6B_U05_P06F20_SPEC_IDS):[];
export function auditG6BU05P06F20Projection(){
  const e=[];
  if(G6B_U05_P06F20_PATTERN_SPECS.length!==2||G6B_U05_P06F20_FORMAL_MAPPING.patternSpecIds.length!==2)e.push("P06F20_PATTERN_CARDINALITY_INVALID");
  if(new Set(G6B_U05_P06F20_SPEC_IDS).size!==2)e.push("P06F20_PATTERN_SPEC_DUPLICATE");
  if(G6B_U05_P06F20_PATTERN_SPECS.some(x=>x.questionMode!=="numeric"||x.semanticCore!=="AGE_DIFFERENCE_INVARIANT_UNDER_EQUAL_TIME_SHIFT"||!x.ageContextSemanticCore||!x.sameTimeShiftRequired||!x.ageDifferenceInvariantRequired||!x.shiftedMultiplicativeRelationRequired||!x.currentAndShiftedBackSubstitutionRequired||!x.positiveAgeStateRequired||x.q019SumDifferenceCoreReownershipAllowed||x.generalSumMultipleProblemReownershipAllowed||x.generalDifferenceMultipleProblemReownershipAllowed||x.workOrDistributionStrategyReownershipAllowed||x.genericSequenceOrRecurrenceReownershipAllowed||x.genericApplicationOverlayAllowed||x.globalContextBindingUsed||x.pblProjectionUsed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed))e.push("P06F20_PATTERN_SCOPE_INVALID");
  const m=G6B_U05_P06F20_FORMAL_MAPPING;
  if(m.primaryRuntimeProfileId!=="profile_word_problem"||m.classificationRuleId!=="rule_word_problem"||!m.ageContextIsSemanticCore||!m.bothAgesUseSameTimeShift||!m.ageDifferenceMustRemainInvariant||!m.shiftedAgeRelationMustBeSatisfied||!m.currentAndShiftedRelationsMustBackSubstitute||!m.invalidNegativeAgeStatesFailClosed||m.q019SumDifferenceCoreReownershipAllowed||m.generalSumMultipleProblemReownershipAllowed||m.generalDifferenceMultipleProblemReownershipAllowed||m.workOrDistributionStrategyReownershipAllowed||m.genericSequenceOrRecurrenceReownershipAllowed||m.genericApplicationOverlayAllowed||m.globalContextBindingUsed||m.pblProjectionUsed||m.sameUnitMixedAllowed||m.crossUnitMixedAllowed||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed)e.push("P06F20_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:2,formalMappings:1})});
}
