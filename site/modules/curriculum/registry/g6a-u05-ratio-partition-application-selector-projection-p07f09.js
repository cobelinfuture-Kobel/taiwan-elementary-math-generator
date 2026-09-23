export const P07F09_TASK_ID="P07F_W7DirectProductVerticalSlice009Implementation";
export const G6A_U05_P07F09_SOURCE_ID="g6a_u05_6a05";
export const G6A_U05_P07F09_UNIT_CODE="6A-U05";
export const G6A_U05_P07F09_UNIT_TITLE="比和比值";
export const G6A_U05_P07F09_KP_ID="kp_g6a_u05_ratio_partition_application";
export const G6A_U05_P07F09_PREDECESSOR_KP_IDS=Object.freeze(["kp_g6a_u05_ratio_notation_order","kp_g6a_u05_ratio_value","kp_g6a_u05_equivalent_ratio","kp_g6a_u05_simplify_ratio"]);
export const G6A_U05_P07F09_PROTECTED_FUTURE_KP_IDS=Object.freeze([]);
export const G6A_U05_P07F09_QUEUE_REQUIRED_CAPABILITY_IDS=Object.freeze(["cap_ratio_percent_reasoning","cap_ratio_rate_validator"]);
export const G6A_U05_P07F09_REQUIRED_CAPABILITY_IDS=Object.freeze(["cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly","cap_answer_key_projection","cap_html_print_renderer","cap_ratio_percent_reasoning","cap_ratio_rate_validator","cap_text_application_representation","cap_relation_model_binding","cap_word_problem_semantic_validation"]);
export const G6A_U05_P07F09_OPTIONAL_CAPABILITY_IDS=Object.freeze(["cap_global_context_binding","cap_pbl_task_set_projection"]);
export const G6A_U05_P07F09_APPLIED_MODIFIER_IDS=Object.freeze(["mod_application_semantics"]);
export const G6A_U05_P07F09_INCLUDED_RELATIONS=Object.freeze(["SUM_GIVEN_RATIO_TERMS_TO_TOTAL_RATIO_UNITS","COMPUTE_ONE_RATIO_UNIT_FROM_TOTAL","COMPUTE_PARTS_FROM_RATIO_TERMS","VERIFY_PART_SUM_EQUALS_TOTAL","VERIFY_RESULTING_PART_RATIO_MATCHES_GIVEN_RATIO"]);
export const G6A_U05_P07F09_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g6a_u05_ratio_partition_application",sourceId:G6A_U05_P07F09_SOURCE_ID,unitCode:G6A_U05_P07F09_UNIT_CODE,unitTitle:G6A_U05_P07F09_UNIT_TITLE,
  displayName:"按比分配",primaryKnowledgePointId:G6A_U05_P07F09_KP_ID,knowledgePointIds:Object.freeze([G6A_U05_P07F09_KP_ID]),supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",
  representationTag:"text_ratio_partition_application",representationTags:Object.freeze(["ratio","partition","application","sum_conservation","numeric"]),
  patternSpecIds:Object.freeze(["ps_g6a_u05_ratio_partition_direct_parts","ps_g6a_u05_ratio_partition_target_part","ps_g6a_u05_ratio_partition_context"]),allocationPolicy:"balanced_pattern_spec",visibilityStatus:"visible",holdReason:null
});
function spec(id,family,targetKind){return Object.freeze({
  patternSpecId:id,knowledgePointId:G6A_U05_P07F09_KP_ID,patternGroupId:G6A_U05_P07F09_PATTERN_GROUP.patternGroupId,patternFamilyId:family,
  relation:targetKind==="DIRECT_PARTS"?G6A_U05_P07F09_INCLUDED_RELATIONS[2]:targetKind==="TARGET_PART"?G6A_U05_P07F09_INCLUDED_RELATIONS[1]:G6A_U05_P07F09_INCLUDED_RELATIONS[0],
  semanticCore:"PARTITION_TOTAL_BY_GIVEN_RATIO_WITH_SUM_CONSERVATION",targetKind,questionMode:"numeric",answerDomain:targetKind==="TARGET_PART"?"POSITIVE_INTEGER":"ORDERED_POSITIVE_INTEGER_PAIR",
  representation:"text_ratio_partition_application",givenTotalRequired:true,givenOrderedRatioTermsRequired:true,positiveRatioTermsRequired:true,totalRatioUnitsRequired:true,oneRatioUnitRequired:true,wholeNumberPartOutputsRequired:true,
  partSumEqualsTotalRequired:true,resultingPartRatioMatchesGivenRatioRequired:true,ratioValuePrerequisiteRequired:true,fractionOfQuantityPrerequisiteRequired:true,
  q001RatioNotationReownershipAllowed:false,q002RatioValueReownershipAllowed:false,q003EquivalentRatioReownershipAllowed:false,q005SimplifyRatioReownershipAllowed:false,
  ratioDifferenceApplicationAllowed:false,unitRateApplicationAllowed:false,mixedFractionRatioApplicationAllowed:false,proportionCrossMultiplicationTeachingAllowed:false,directProportionTableOrGraphAllowed:false,percentConversionAllowed:false,nonPartitionRateApplicationAllowed:false,ratioScaleApplicationAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false
});}
export const G6A_U05_P07F09_PATTERN_SPECS=Object.freeze([
  spec("ps_g6a_u05_ratio_partition_direct_parts","RATIO_PARTITION_DIRECT_PARTS","DIRECT_PARTS"),
  spec("ps_g6a_u05_ratio_partition_target_part","RATIO_PARTITION_TARGET_PART","TARGET_PART"),
  spec("ps_g6a_u05_ratio_partition_context","RATIO_PARTITION_TEXT_CONTEXT","CONTEXT_PARTS")
]);
export const G6A_U05_P07F09_SPEC_IDS=Object.freeze(G6A_U05_P07F09_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G6A_U05_P07F09_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g6a_u05_ratio_partition_application_p07f09",r04MappingId:"r04map_g6a_u05_ratio_partition_application",sourceId:G6A_U05_P07F09_SOURCE_ID,r02EvidencePages:Object.freeze([1]),currentVisualSupportingPages:Object.freeze([3]),
  knowledgePointId:G6A_U05_P07F09_KP_ID,canonicalNameZh:"按比分配",capabilityStatement:"學生能依給定比把總量分配成各部分。",reasoningInvariant:"各部分份數比符合指定比，部分和等於總量。",
  sourceSemanticCore:"PARTITION_TOTAL_BY_GIVEN_RATIO_WITH_SUM_CONSERVATION",semanticAuthority:"R02_PAGE1_PRIMARY_CURRENT_VISUAL_PAGE3_DIRECT_RATIO_PARTITION_WITHOUT_SILENT_RELOCATION",evidenceLocalizationMismatchPreserved:true,
  primaryRuntimeProfileId:"profile_ratio_percent",classificationRuleId:"rule_ratio_percent",appliedRuntimeModifierIds:G6A_U05_P07F09_APPLIED_MODIFIER_IDS,requiredCapabilityIds:G6A_U05_P07F09_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G6A_U05_P07F09_OPTIONAL_CAPABILITY_IDS,queueRequiredW7CapabilityIds:G6A_U05_P07F09_QUEUE_REQUIRED_CAPABILITY_IDS,
  patternSpecIds:G6A_U05_P07F09_SPEC_IDS,ratioValuePrerequisiteRequired:true,fractionOfQuantityPrerequisiteRequired:true,partSumEqualsTotalRequired:true,resultingPartRatioMatchesGivenRatioRequired:true,applicationContextAllowed:true,
  ratioDifferenceApplicationAllowed:false,unitRateApplicationAllowed:false,mixedFractionRatioApplicationAllowed:false,proportionCrossMultiplicationTeachingAllowed:false,directProportionTableOrGraphAllowed:false,percentConversionAllowed:false,nonPartitionRateApplicationAllowed:false,ratioScaleApplicationAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false,r04ReclassificationAllowed:false,frozenQueueMutationAllowed:false
});
export const G6A_U05_P07F09_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G6A_U05_P07F09_KP_ID,sourceId:G6A_U05_P07F09_SOURCE_ID,unitCode:G6A_U05_P07F09_UNIT_CODE,unitTitle:G6A_U05_P07F09_UNIT_TITLE,displayName:"按比分配",canonicalNameZh:"按比分配",mode:"numeric",questionMode:"numeric",questionModes:Object.freeze(["numeric"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,
  applicationClassification:"APPLICATION_ADMITTED_RATIO_PARTITION_ONLY",canonicalPatternGroupIds:Object.freeze([G6A_U05_P07F09_PATTERN_GROUP.patternGroupId]),canonicalPatternSpecIds:G6A_U05_P07F09_SPEC_IDS,patternGroupIds:Object.freeze([G6A_U05_P07F09_PATTERN_GROUP.patternGroupId]),patternSpecIds:G6A_U05_P07F09_SPEC_IDS,requiredCapabilityIds:G6A_U05_P07F09_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G6A_U05_P07F09_OPTIONAL_CAPABILITY_IDS,qaStatusLabel:"P07F09_G6A_U05_SOURCE_BACKED_RATIO_PARTITION_APPLICATION",productionUse:"full_product_w7_slice009_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6AU05P07F09SelectorRow=id=>id===G6A_U05_P07F09_KP_ID?clone(G6A_U05_P07F09_SELECTOR_ROW):null;
export const listG6AU05P07F09PatternGroups=id=>id===G6A_U05_P07F09_KP_ID?[clone(G6A_U05_P07F09_PATTERN_GROUP)]:[];
export const resolveG6AU05P07F09PatternSpecIds=id=>id===G6A_U05_P07F09_KP_ID?clone(G6A_U05_P07F09_SPEC_IDS):[];
export function auditG6AU05P07F09Projection(){const e=[];if(G6A_U05_P07F09_PATTERN_SPECS.length!==3)e.push("P07F09_PATTERN_CARDINALITY_INVALID");if(new Set(G6A_U05_P07F09_SPEC_IDS).size!==3)e.push("P07F09_PATTERN_SPEC_DUPLICATE");const m=G6A_U05_P07F09_FORMAL_MAPPING;if(m.primaryRuntimeProfileId!=="profile_ratio_percent"||m.classificationRuleId!=="rule_ratio_percent"||m.appliedRuntimeModifierIds.join("|")!=="mod_application_semantics"||!m.evidenceLocalizationMismatchPreserved||!m.ratioValuePrerequisiteRequired||!m.fractionOfQuantityPrerequisiteRequired||!m.partSumEqualsTotalRequired||!m.resultingPartRatioMatchesGivenRatioRequired||!m.applicationContextAllowed||m.ratioDifferenceApplicationAllowed||m.unitRateApplicationAllowed||m.mixedFractionRatioApplicationAllowed||m.proportionCrossMultiplicationTeachingAllowed||m.directProportionTableOrGraphAllowed||m.percentConversionAllowed||m.nonPartitionRateApplicationAllowed||m.ratioScaleApplicationAllowed||m.sameUnitMixedAllowed||m.crossUnitMixedAllowed||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed)e.push("P07F09_MAPPING_SCOPE_INVALID");return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1})});}
