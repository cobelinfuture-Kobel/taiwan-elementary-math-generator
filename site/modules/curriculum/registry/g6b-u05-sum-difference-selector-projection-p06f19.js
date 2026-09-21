export const P06F19_TASK_ID="P06F_W6DirectProductVerticalSlice019Implementation";
export const G6B_U05_P06F19_SOURCE_ID="g6b_u05_6b05";
export const G6B_U05_P06F19_UNIT_CODE="6B-U05";
export const G6B_U05_P06F19_UNIT_TITLE="怎樣解題";
export const G6B_U05_P06F19_KP_ID="kp_g6b_u05_sum_difference_problem";
export const G6B_U05_P06F19_FUTURE_KP_IDS=Object.freeze([
  "kp_g6b_u05_sum_multiple_problem",
  "kp_g6b_u05_difference_multiple_problem",
  "kp_g6b_u05_age_or_repeated_relation_problem",
  "kp_g6b_u05_work_or_distribution_strategy"
]);
export const G6B_U05_P06F19_Q020_RESERVED_KP_IDS=Object.freeze(["kp_g6b_u05_age_or_repeated_relation_problem"]);
export const G6B_U05_P06F19_QUEUE_REQUIRED_CAPABILITY_IDS=Object.freeze([]);
export const G6B_U05_P06F19_REQUIRED_CAPABILITY_IDS=Object.freeze(["cap_decimal_number_system","cap_decimal_domain_validator","cap_text_numeric_representation"]);
export const G6B_U05_P06F19_INCLUDED_RELATIONS=Object.freeze(["SOLVE_TWO_QUANTITIES_FROM_SUM_AND_DIFFERENCE","VERIFY_SUM_AND_DIFFERENCE_RECONSTRUCTION"]);
export const G6B_U05_P06F19_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g6b_u05_sum_difference_problem",
  sourceId:G6B_U05_P06F19_SOURCE_ID,
  unitCode:G6B_U05_P06F19_UNIT_CODE,
  unitTitle:G6B_U05_P06F19_UNIT_TITLE,
  displayName:"和差問題",
  primaryKnowledgePointId:G6B_U05_P06F19_KP_ID,
  knowledgePointIds:Object.freeze([G6B_U05_P06F19_KP_ID]),
  supportClass:"A",
  mode:"numeric",
  publicQuestionMode:"numeric",
  representationTag:"text_numeric_sum_difference",
  representationTags:Object.freeze(["problem_relation","text_numeric","sum_difference","two_quantity_decomposition","reconstruction_check"]),
  patternSpecIds:Object.freeze([
    "ps_g6b_u05_sum_difference_find_larger",
    "ps_g6b_u05_sum_difference_find_smaller"
  ]),
  allocationPolicy:"balanced_pattern_spec",
  visibilityStatus:"visible",
  holdReason:null
});
function spec(id,family,targetQuantity){
  return Object.freeze({
    patternSpecId:id,
    knowledgePointId:G6B_U05_P06F19_KP_ID,
    patternGroupId:G6B_U05_P06F19_PATTERN_GROUP.patternGroupId,
    patternFamilyId:family,
    relation:"SOLVE_TWO_QUANTITIES_FROM_SUM_AND_DIFFERENCE",
    validatorRelation:"VERIFY_SUM_AND_DIFFERENCE_RECONSTRUCTION",
    semanticCore:"SUM_DIFFERENCE_TWO_QUANTITY_DECOMPOSITION",
    targetQuantity,
    questionMode:"numeric",
    answerDomain:"INTEGER",
    representation:"text_numeric_sum_difference",
    knownSumAndDifferenceRequired:true,
    largerFormula:"(sum + difference) / 2",
    smallerFormula:"(sum - difference) / 2",
    sumReconstructionRequired:true,
    differenceReconstructionRequired:true,
    exactIntegerPartitionRequired:true,
    decimalProfileEnvelopeOnly:true,
    decimalPlaceValueReasoningCore:false,
    decimalNotationCore:false,
    sourceContextRepresentationOnly:true,
    sumMultipleProblemReownershipAllowed:false,
    differenceMultipleProblemReownershipAllowed:false,
    ageOrRepeatedRelationProblemReownershipAllowed:false,
    workOrDistributionStrategyReownershipAllowed:false,
    applicationImplementationAllowed:false,
    sameUnitMixedAllowed:false,
    crossUnitMixedAllowed:false
  });
}
export const G6B_U05_P06F19_PATTERN_SPECS=Object.freeze([
  spec("ps_g6b_u05_sum_difference_find_larger","SUM_DIFFERENCE_FIND_LARGER","LARGER"),
  spec("ps_g6b_u05_sum_difference_find_smaller","SUM_DIFFERENCE_FIND_SMALLER","SMALLER")
]);
export const G6B_U05_P06F19_SPEC_IDS=Object.freeze(G6B_U05_P06F19_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G6B_U05_P06F19_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g6b_u05_sum_difference_problem_p06f19",
  r04MappingId:"r04map_g6b_u05_sum_difference_problem",
  sourceId:G6B_U05_P06F19_SOURCE_ID,
  sourcePages:Object.freeze([1,2]),
  knowledgePointId:G6B_U05_P06F19_KP_ID,
  canonicalNameZh:"和差問題",
  capabilityStatement:"學生能由兩量的和與差求各量。",
  reasoningInvariant:"較大數等於和加差的一半，較小數等於和減差的一半。",
  sourceSemanticCore:"SUM_DIFFERENCE_TWO_QUANTITY_DECOMPOSITION",
  primaryRuntimeProfileId:"profile_decimal",
  requiredCapabilityIds:G6B_U05_P06F19_REQUIRED_CAPABILITY_IDS,
  queueRequiredW6CapabilityIds:G6B_U05_P06F19_QUEUE_REQUIRED_CAPABILITY_IDS,
  patternSpecIds:G6B_U05_P06F19_SPEC_IDS,
  profileIsRuntimeEnvelopeOnly:true,
  decimalPlaceValueMayNotBecomeCore:true,
  decimalNotationMayNotBeForcedByProfileName:true,
  knownSumAndDifferenceAreCore:true,
  largerQuantityFormula:"(sum + difference) / 2",
  smallerQuantityFormula:"(sum - difference) / 2",
  largerPlusSmallerMustReconstructSum:true,
  largerMinusSmallerMustReconstructDifference:true,
  exactIntegerPartitionRequired:true,
  sumMultipleProblemReownershipAllowed:false,
  differenceMultipleProblemReownershipAllowed:false,
  ageOrRepeatedRelationProblemReownershipAllowed:false,
  workOrDistributionStrategyReownershipAllowed:false,
  q020ReownershipAllowed:false,
  applicationImplementationAllowed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false,
  r04ReclassificationAllowed:false,
  q020OrLaterTouched:false
});
export const G6B_U05_P06F19_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G6B_U05_P06F19_KP_ID,
  sourceId:G6B_U05_P06F19_SOURCE_ID,
  unitCode:G6B_U05_P06F19_UNIT_CODE,
  unitTitle:G6B_U05_P06F19_UNIT_TITLE,
  displayName:"和差問題",
  canonicalNameZh:"和差問題",
  mode:"numeric",
  questionMode:"numeric",
  questionModes:Object.freeze(["numeric"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:"APPLICATION_COMPATIBLE",
  canonicalPatternGroupIds:Object.freeze([G6B_U05_P06F19_PATTERN_GROUP.patternGroupId]),
  canonicalPatternSpecIds:G6B_U05_P06F19_SPEC_IDS,
  patternGroupIds:Object.freeze([G6B_U05_P06F19_PATTERN_GROUP.patternGroupId]),
  patternSpecIds:G6B_U05_P06F19_SPEC_IDS,
  requiredCapabilityIds:G6B_U05_P06F19_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:Object.freeze([]),
  qaStatusLabel:"P06F19_G6B_U05_SOURCE_BACKED_SUM_DIFFERENCE",
  productionUse:"full_product_w6_slice019_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6BU05P06F19SelectorRow=id=>id===G6B_U05_P06F19_KP_ID?clone(G6B_U05_P06F19_SELECTOR_ROW):null;
export const listG6BU05P06F19PatternGroups=id=>id===G6B_U05_P06F19_KP_ID?[clone(G6B_U05_P06F19_PATTERN_GROUP)]:[];
export const resolveG6BU05P06F19PatternSpecIds=id=>id===G6B_U05_P06F19_KP_ID?clone(G6B_U05_P06F19_SPEC_IDS):[];
export function auditG6BU05P06F19Projection(){
  const e=[];
  if(G6B_U05_P06F19_PATTERN_SPECS.length!==2||G6B_U05_P06F19_FORMAL_MAPPING.patternSpecIds.length!==2)e.push("P06F19_PATTERN_CARDINALITY_INVALID");
  if(new Set(G6B_U05_P06F19_SPEC_IDS).size!==2)e.push("P06F19_PATTERN_SPEC_DUPLICATE");
  if(G6B_U05_P06F19_PATTERN_SPECS.some(x=>x.questionMode!=="numeric"||x.semanticCore!=="SUM_DIFFERENCE_TWO_QUANTITY_DECOMPOSITION"||!x.knownSumAndDifferenceRequired||!x.sumReconstructionRequired||!x.differenceReconstructionRequired||!x.exactIntegerPartitionRequired||!x.decimalProfileEnvelopeOnly||x.decimalPlaceValueReasoningCore||x.decimalNotationCore||!x.sourceContextRepresentationOnly||x.sumMultipleProblemReownershipAllowed||x.differenceMultipleProblemReownershipAllowed||x.ageOrRepeatedRelationProblemReownershipAllowed||x.workOrDistributionStrategyReownershipAllowed||x.applicationImplementationAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed))e.push("P06F19_PATTERN_SCOPE_INVALID");
  const m=G6B_U05_P06F19_FORMAL_MAPPING;
  if(m.primaryRuntimeProfileId!=="profile_decimal"||!m.profileIsRuntimeEnvelopeOnly||!m.decimalPlaceValueMayNotBecomeCore||!m.decimalNotationMayNotBeForcedByProfileName||!m.knownSumAndDifferenceAreCore||!m.largerPlusSmallerMustReconstructSum||!m.largerMinusSmallerMustReconstructDifference||!m.exactIntegerPartitionRequired||m.sumMultipleProblemReownershipAllowed||m.differenceMultipleProblemReownershipAllowed||m.ageOrRepeatedRelationProblemReownershipAllowed||m.workOrDistributionStrategyReownershipAllowed||m.q020ReownershipAllowed||m.r04ReclassificationAllowed||m.q020OrLaterTouched)e.push("P06F19_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:2,formalMappings:1})});
}
