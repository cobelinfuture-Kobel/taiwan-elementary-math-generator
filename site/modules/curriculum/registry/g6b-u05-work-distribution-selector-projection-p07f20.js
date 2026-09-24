export const P07F20_TASK_ID="P07F_W7DirectProductVerticalSlice020Implementation";
export const G6B_U05_P07F20_SOURCE_ID="g6b_u05_6b05";
export const G6B_U05_P07F20_UNIT_CODE="6B-U05";
export const G6B_U05_P07F20_UNIT_TITLE="怎樣解題";
export const G6B_U05_P07F20_KP_ID="kp_g6b_u05_work_or_distribution_strategy";
export const G6B_U05_P07F20_PREDECESSOR_VISIBLE_KP_IDS=Object.freeze([
  "kp_g6b_u05_sum_difference_problem",
  "kp_g6b_u05_age_or_repeated_relation_problem",
  "kp_g6b_u05_difference_multiple_problem",
  "kp_g6b_u05_sum_multiple_problem"
]);
export const G6B_U05_P07F20_REQUIRED_PREREQUISITE_KP_IDS=Object.freeze([
  "kp_g5a_u08_mixed_operation_order",
  "kp_g6b_u05_difference_multiple_problem",
  "kp_g6b_u05_sum_multiple_problem"
]);
export const G6B_U05_P07F20_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly","cap_answer_key_projection",
  "cap_html_print_renderer","cap_factor_multiple_reasoning","cap_factor_multiple_validator","cap_text_numeric_representation"
]);
export const G6B_U05_P07F20_EFFECTIVE_ADDED_CAPABILITY_IDS=Object.freeze(["cap_integer_division"]);
export const G6B_U05_P07F20_OPTIONAL_CAPABILITY_IDS=Object.freeze([]);
export const G6B_U05_P07F20_APPLIED_MODIFIER_IDS=Object.freeze([]);
export const G6B_U05_P07F20_INCLUDED_RELATIONS=Object.freeze([
  "SOLVE_TOTAL_COUNT_PLUS_WEIGHTED_TOTAL_DISTRIBUTION",
  "SOLVE_TOTAL_TRIPS_PLUS_TOTAL_COST_DISTRIBUTION",
  "SOLVE_AFFINE_PRICE_RELATION_AND_COMPOSITE_PURCHASE_TOTAL",
  "BACK_SUBSTITUTE_ALL_SOURCE_CONDITIONS"
]);
const spec=(id,family,relation,targetKind)=>Object.freeze({
  patternSpecId:id,knowledgePointId:G6B_U05_P07F20_KP_ID,patternGroupId:"pg_g6b_u05_work_distribution_strategy",
  patternFamilyId:family,relation,targetKind,semanticCore:"MULTI_CONDITION_TO_SHARED_QUANTITY_MODEL_AND_BACK_SUBSTITUTION",
  questionMode:"numeric",answerDomain:"POSITIVE_INTEGER",representation:"text_numeric_multi_condition_distribution",
  multipleConditionsMustBindSameUnknownQuantities:true,answerMustBackSubstituteAllSourceConditions:true,
  nonnegativeOrPositiveCountDomainMustBeValidated:true,integerCountWhereContextRequiresDiscreteUnits:true,
  factorMultipleProfileIsRuntimeEnvelopeOnly:true,sumDifferenceProblemReownershipAllowed:false,sumMultipleProblemReownershipAllowed:false,
  differenceMultipleProblemReownershipAllowed:false,ageOrRepeatedRelationProblemReownershipAllowed:false,
  pureCombinatoricsOwnershipAllowed:false,routeCountingOwnershipAllowed:false,genericApplicationOverlayAllowed:false,
  sameUnitMixedAllowed:false,crossUnitMixedAllowed:false
});
export const G6B_U05_P07F20_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g6b_u05_work_distribution_strategy",sourceId:G6B_U05_P07F20_SOURCE_ID,unitCode:G6B_U05_P07F20_UNIT_CODE,unitTitle:G6B_U05_P07F20_UNIT_TITLE,
  displayName:"工作分配與策略問題",primaryKnowledgePointId:G6B_U05_P07F20_KP_ID,knowledgePointIds:Object.freeze([G6B_U05_P07F20_KP_ID]),
  supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",representationTag:"text_numeric_multi_condition_distribution",
  representationTags:Object.freeze(["problem_relation","multi_condition","distribution","weighted_total","back_substitution","text_numeric"]),
  patternSpecIds:Object.freeze([
    "ps_g6b_u05_boat_capacity_distribution",
    "ps_g6b_u05_transport_cost_distribution",
    "ps_g6b_u05_affine_price_composite_purchase"
  ]),
  allocationPolicy:"balanced_pattern_spec",visibilityStatus:"visible",holdReason:null
});
export const G6B_U05_P07F20_PATTERN_SPECS=Object.freeze([
  spec("ps_g6b_u05_boat_capacity_distribution","BOAT_CAPACITY_DISTRIBUTION","SOLVE_TOTAL_COUNT_PLUS_WEIGHTED_TOTAL_DISTRIBUTION","FIND_HIGH_CAPACITY_COUNT"),
  spec("ps_g6b_u05_transport_cost_distribution","TRANSPORT_COST_DISTRIBUTION","SOLVE_TOTAL_TRIPS_PLUS_TOTAL_COST_DISTRIBUTION","FIND_HIGH_FARE_COUNT"),
  spec("ps_g6b_u05_affine_price_composite_purchase","AFFINE_PRICE_COMPOSITE_PURCHASE","SOLVE_AFFINE_PRICE_RELATION_AND_COMPOSITE_PURCHASE_TOTAL","FIND_COMPOSITE_PURCHASE_TOTAL")
]);
export const G6B_U05_P07F20_SPEC_IDS=Object.freeze(G6B_U05_P07F20_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G6B_U05_P07F20_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g6b_u05_work_or_distribution_strategy_p07f20",r04MappingId:"r04map_g6b_u05_work_or_distribution_strategy",
  sourceId:G6B_U05_P07F20_SOURCE_ID,sourcePages:Object.freeze([2]),r02EvidencePages:Object.freeze([1,2]),
  knowledgePointId:G6B_U05_P07F20_KP_ID,canonicalNameZh:"工作分配與策略問題",
  capabilityStatement:"學生能把複合條件轉成份數、倍數或總量關係。",
  reasoningInvariant:"每個條件都必須在同一數量模型中成立，答案須回代驗證。",
  sourceSemanticCore:"MULTI_CONDITION_TO_SHARED_QUANTITY_MODEL_AND_BACK_SUBSTITUTION",
  authority:"ORIGINAL_G6B_U05_PAGE2_DIRECT_MULTI_CONDITION_EVIDENCE",
  primaryRuntimeProfileId:"profile_factor_multiple",classificationRuleId:"rule_factor_multiple",
  appliedRuntimeModifierIds:G6B_U05_P07F20_APPLIED_MODIFIER_IDS,requiredCapabilityIds:G6B_U05_P07F20_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6B_U05_P07F20_OPTIONAL_CAPABILITY_IDS,effectiveAddedCapabilityIds:G6B_U05_P07F20_EFFECTIVE_ADDED_CAPABILITY_IDS,
  patternSpecIds:G6B_U05_P07F20_SPEC_IDS,requiredPrerequisiteKnowledgePointIds:G6B_U05_P07F20_REQUIRED_PREREQUISITE_KP_IDS,
  patternFactorCollisionPolicy:"EXPLICIT_PATTERN_RELATION_OVERRIDES_FACTOR_MULTIPLE",
  multipleConditionsMustBindSameUnknownQuantities:true,answerMustBackSubstituteAllSourceConditions:true,
  sumDifferenceProblemReownershipAllowed:false,sumMultipleProblemReownershipAllowed:false,differenceMultipleProblemReownershipAllowed:false,
  ageOrRepeatedRelationProblemReownershipAllowed:false,pureCombinatoricsOwnershipAllowed:false,routeCountingOwnershipAllowed:false,
  genericApplicationOverlayAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false,r04ReclassificationAllowed:false,frozenQueueMutationAllowed:false
});
export const G6B_U05_P07F20_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G6B_U05_P07F20_KP_ID,sourceId:G6B_U05_P07F20_SOURCE_ID,unitCode:G6B_U05_P07F20_UNIT_CODE,unitTitle:G6B_U05_P07F20_UNIT_TITLE,
  displayName:"工作分配與策略問題",canonicalNameZh:"工作分配與策略問題",mode:"numeric",questionMode:"numeric",questionModes:Object.freeze(["numeric"]),
  supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:"DIRECT_MULTI_CONDITION_SOURCE_BACKED",
  canonicalPatternGroupIds:Object.freeze([G6B_U05_P07F20_PATTERN_GROUP.patternGroupId]),canonicalPatternSpecIds:G6B_U05_P07F20_SPEC_IDS,
  patternGroupIds:Object.freeze([G6B_U05_P07F20_PATTERN_GROUP.patternGroupId]),patternSpecIds:G6B_U05_P07F20_SPEC_IDS,
  requiredCapabilityIds:G6B_U05_P07F20_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G6B_U05_P07F20_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P07F20_G6B_U05_WORK_DISTRIBUTION_STRATEGY",productionUse:"full_product_w7_slice020_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6BU05P07F20SelectorRow=id=>id===G6B_U05_P07F20_KP_ID?clone(G6B_U05_P07F20_SELECTOR_ROW):null;
export const listG6BU05P07F20PatternGroups=id=>id===G6B_U05_P07F20_KP_ID?[clone(G6B_U05_P07F20_PATTERN_GROUP)]:[];
export const resolveG6BU05P07F20PatternSpecIds=id=>id===G6B_U05_P07F20_KP_ID?clone(G6B_U05_P07F20_SPEC_IDS):[];
export function auditG6BU05P07F20Projection(){
  const e=[];
  if(G6B_U05_P07F20_PATTERN_SPECS.length!==3||G6B_U05_P07F20_FORMAL_MAPPING.patternSpecIds.length!==3)e.push("P07F20_PATTERN_CARDINALITY_INVALID");
  if(new Set(G6B_U05_P07F20_SPEC_IDS).size!==3)e.push("P07F20_PATTERN_SPEC_DUPLICATE");
  for(const x of G6B_U05_P07F20_PATTERN_SPECS){
    if(x.questionMode!=="numeric"||x.semanticCore!=="MULTI_CONDITION_TO_SHARED_QUANTITY_MODEL_AND_BACK_SUBSTITUTION"||
      !x.multipleConditionsMustBindSameUnknownQuantities||!x.answerMustBackSubstituteAllSourceConditions||!x.nonnegativeOrPositiveCountDomainMustBeValidated||
      !x.integerCountWhereContextRequiresDiscreteUnits||!x.factorMultipleProfileIsRuntimeEnvelopeOnly||x.sumDifferenceProblemReownershipAllowed||
      x.sumMultipleProblemReownershipAllowed||x.differenceMultipleProblemReownershipAllowed||x.ageOrRepeatedRelationProblemReownershipAllowed||
      x.pureCombinatoricsOwnershipAllowed||x.routeCountingOwnershipAllowed||x.genericApplicationOverlayAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed)e.push("P07F20_PATTERN_SCOPE_INVALID:"+x.patternSpecId);
  }
  const m=G6B_U05_P07F20_FORMAL_MAPPING;
  if(m.primaryRuntimeProfileId!=="profile_factor_multiple"||m.classificationRuleId!=="rule_factor_multiple"||m.appliedRuntimeModifierIds.length!==0||
    m.requiredCapabilityIds.join("|")!==G6B_U05_P07F20_REQUIRED_CAPABILITY_IDS.join("|")||m.optionalCapabilityIds.length!==0||
    m.effectiveAddedCapabilityIds.join("|")!=="cap_integer_division"||m.patternFactorCollisionPolicy!=="EXPLICIT_PATTERN_RELATION_OVERRIDES_FACTOR_MULTIPLE"||
    !m.multipleConditionsMustBindSameUnknownQuantities||!m.answerMustBackSubstituteAllSourceConditions||m.sumDifferenceProblemReownershipAllowed||
    m.sumMultipleProblemReownershipAllowed||m.differenceMultipleProblemReownershipAllowed||m.ageOrRepeatedRelationProblemReownershipAllowed||
    m.pureCombinatoricsOwnershipAllowed||m.routeCountingOwnershipAllowed||m.genericApplicationOverlayAllowed||m.sameUnitMixedAllowed||
    m.crossUnitMixedAllowed||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed)e.push("P07F20_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1})});
}
