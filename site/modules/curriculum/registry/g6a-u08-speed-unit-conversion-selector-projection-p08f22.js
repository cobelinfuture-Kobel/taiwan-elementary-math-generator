export const P08F22_TASK_ID="P08F_W8DirectProductVerticalSlice022Implementation";
export const G6A_U08_P08F22_SOURCE_ID="g6a_u08_6a08";
export const G6A_U08_P08F22_SUPPORTING_SOURCE_IDS=Object.freeze(["g6b_u02_6b02"]);
export const G6A_U08_P08F22_UNIT_CODE="6A-U08";
export const G6A_U08_P08F22_UNIT_TITLE="認識速率";
export const G6A_U08_P08F22_KP_ID="kp_speed_unit_conversion";
export const G6A_U08_P08F22_PRIOR_OWNER_KP_IDS=Object.freeze([
  "kp_speed_distance_time_relation","kp_average_speed_total_distance_time",
  "kp_relative_speed_meeting_chasing","kp_effective_speed_current_wind"
]);
export const G6A_U08_P08F22_REQUIRED_PREREQUISITE_KP_IDS=Object.freeze([
  "kp_g4a_u10_length_km_m_conversion","kp_g4b_u09_time_second_minute_hour_conversion","kp_speed_distance_time_relation"
]);
export const G6A_U08_P08F22_CONTRACT_ONLY_CAPABILITY_IDS=Object.freeze([
  "cap_speed_rate_reasoning","cap_ratio_percent_reasoning","cap_fraction_number_system",
  "cap_ratio_rate_validator","cap_unit_conversion","cap_mixed_unit_normalization"
]);
export const G6A_U08_P08F22_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly","cap_answer_key_projection",
  "cap_html_print_renderer","cap_speed_rate_reasoning","cap_ratio_rate_validator","cap_quantity_dimension_unit_identity",
  "cap_text_application_representation","cap_unit_conversion","cap_mixed_unit_normalization","cap_quantity_semantic_role_binding"
]);
export const G6A_U08_P08F22_OPTIONAL_CAPABILITY_IDS=Object.freeze(["cap_global_context_binding"]);
export const G6A_U08_P08F22_APPLIED_MODIFIER_IDS=Object.freeze(["mod_unit_conversion","mod_quantity_relation_semantics"]);
export const G6A_U08_P08F22_INCLUDED_RELATIONS=Object.freeze([
  "KM_PER_HOUR_TO_M_PER_MIN","M_PER_MIN_TO_KM_PER_HOUR",
  "KM_PER_HOUR_TO_M_PER_SEC","M_PER_SEC_TO_KM_PER_HOUR",
  "M_PER_MIN_TO_M_PER_SEC","M_PER_SEC_TO_M_PER_MIN"
]);
const spec=(id,family,relation,sourceUnitId,targetUnitId,sourceStep)=>Object.freeze({
  patternSpecId:id,knowledgePointId:G6A_U08_P08F22_KP_ID,patternGroupId:"pg_g6a_u08_speed_unit_conversion",
  patternFamilyId:family,relation,sourceUnitId,targetUnitId,sourceStep,
  semanticCore:"CONVERT_EQUIVALENT_SPEED_UNITS_BY_COUPLED_DISTANCE_TIME_SCALING",
  questionMode:"numeric",representation:"speed_unit_conversion",answerDomain:"POSITIVE_INTEGER",
  coupledDistanceTimeScalingRequired:true,equivalentRateInvariantRequired:true,sourceAndTargetRateUnitsRequired:true,answerBackConversionRequired:true,
  speedDistanceTimeRelationPrerequisiteAllowed:true,speedDistanceTimeRelationTeachingReownershipAllowed:false,
  averageSpeedReownershipAllowed:false,relativeSpeedMeetingChasingReownershipAllowed:false,effectiveSpeedCurrentWindReownershipAllowed:false,
  applicationContextAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false
});
export const G6A_U08_P08F22_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g6a_u08_speed_unit_conversion",sourceId:G6A_U08_P08F22_SOURCE_ID,unitCode:G6A_U08_P08F22_UNIT_CODE,unitTitle:G6A_U08_P08F22_UNIT_TITLE,
  displayName:"速率單位換算",primaryKnowledgePointId:G6A_U08_P08F22_KP_ID,knowledgePointIds:Object.freeze([G6A_U08_P08F22_KP_ID]),
  supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",representationTag:"speed_unit_conversion",
  representationTags:Object.freeze(["speed","unit_conversion","equivalent_rate","distance_unit","time_unit"]),
  patternSpecIds:Object.freeze(["ps_g6a_u08_kmh_to_mmin","ps_g6a_u08_mmin_to_kmh","ps_g6a_u08_kmh_to_mps","ps_g6a_u08_mps_to_kmh","ps_g6a_u08_mmin_to_mps","ps_g6a_u08_mps_to_mmin"]),
  allocationPolicy:"balanced_pattern_spec",visibilityStatus:"visible",holdReason:null
});
export const G6A_U08_P08F22_PATTERN_SPECS=Object.freeze([
  spec("ps_g6a_u08_kmh_to_mmin","KMH_TO_MMIN",G6A_U08_P08F22_INCLUDED_RELATIONS[0],"KMH","MMIN",3),
  spec("ps_g6a_u08_mmin_to_kmh","MMIN_TO_KMH",G6A_U08_P08F22_INCLUDED_RELATIONS[1],"MMIN","KMH",50),
  spec("ps_g6a_u08_kmh_to_mps","KMH_TO_MPS",G6A_U08_P08F22_INCLUDED_RELATIONS[2],"KMH","MPS",18),
  spec("ps_g6a_u08_mps_to_kmh","MPS_TO_KMH",G6A_U08_P08F22_INCLUDED_RELATIONS[3],"MPS","KMH",5),
  spec("ps_g6a_u08_mmin_to_mps","MMIN_TO_MPS",G6A_U08_P08F22_INCLUDED_RELATIONS[4],"MMIN","MPS",60),
  spec("ps_g6a_u08_mps_to_mmin","MPS_TO_MMIN",G6A_U08_P08F22_INCLUDED_RELATIONS[5],"MPS","MMIN",1)
]);
export const G6A_U08_P08F22_SPEC_IDS=Object.freeze(G6A_U08_P08F22_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G6A_U08_P08F22_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g6a_u08_speed_unit_conversion_p08f22",r04MappingId:"r04map_speed_unit_conversion",
  sourceId:G6A_U08_P08F22_SOURCE_ID,supportingSourceIds:G6A_U08_P08F22_SUPPORTING_SOURCE_IDS,r02EvidencePages:Object.freeze([1,2]),
  knowledgePointId:G6A_U08_P08F22_KP_ID,canonicalNameZh:"速率單位換算",
  capabilityStatement:"學生能在公里每時、公尺每分、公尺每秒間換算。",reasoningInvariant:"距離與時間單位須同時按等值比例換算。",
  sourceSemanticCore:"CONVERT_EQUIVALENT_SPEED_UNITS_BY_COUPLED_DISTANCE_TIME_SCALING",
  semanticAuthority:"R02_FULL_PAGE_VISUAL_READBACK_PLUS_P08F_W8_Q022_PREFLIGHT",
  primaryRuntimeProfileId:"profile_speed_rate",classificationRuleId:"rule_speed_rate",
  appliedRuntimeModifierIds:G6A_U08_P08F22_APPLIED_MODIFIER_IDS,requiredCapabilityIds:G6A_U08_P08F22_REQUIRED_CAPABILITY_IDS,
  contractOnlyRequiredCapabilityIds:G6A_U08_P08F22_CONTRACT_ONLY_CAPABILITY_IDS,optionalCapabilityIds:G6A_U08_P08F22_OPTIONAL_CAPABILITY_IDS,
  patternSpecIds:G6A_U08_P08F22_SPEC_IDS,requiredPrerequisiteKnowledgePointIds:G6A_U08_P08F22_REQUIRED_PREREQUISITE_KP_IDS,
  unitEquivalences:Object.freeze(["1 公里 = 1000 公尺","1 小時 = 60 分鐘","1 分鐘 = 60 秒"]),
  coupledDistanceTimeScalingRequired:true,equivalentRateInvariantRequired:true,sourceAndTargetRateUnitsRequired:true,answerBackConversionRequired:true,
  speedDistanceTimeRelationPrerequisiteAllowed:true,speedDistanceTimeRelationTeachingReownershipAllowed:false,
  averageSpeedReownershipAllowed:false,relativeSpeedMeetingChasingReownershipAllowed:false,effectiveSpeedCurrentWindReownershipAllowed:false,
  applicationContextAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false,r04ReclassificationAllowed:false,frozenQueueMutationAllowed:false
});
export const G6A_U08_P08F22_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G6A_U08_P08F22_KP_ID,sourceId:G6A_U08_P08F22_SOURCE_ID,unitCode:G6A_U08_P08F22_UNIT_CODE,unitTitle:G6A_U08_P08F22_UNIT_TITLE,
  displayName:"速率單位換算",canonicalNameZh:"速率單位換算",mode:"numeric",questionMode:"numeric",questionModes:Object.freeze(["numeric"]),
  supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:"APPLICATION_COMPATIBLE_BUT_NOT_ADMITTED",
  canonicalPatternGroupIds:Object.freeze([G6A_U08_P08F22_PATTERN_GROUP.patternGroupId]),canonicalPatternSpecIds:G6A_U08_P08F22_SPEC_IDS,
  patternGroupIds:Object.freeze([G6A_U08_P08F22_PATTERN_GROUP.patternGroupId]),patternSpecIds:G6A_U08_P08F22_SPEC_IDS,
  requiredCapabilityIds:G6A_U08_P08F22_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G6A_U08_P08F22_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P08F22_G6A_U08_SPEED_UNIT_CONVERSION",productionUse:"full_product_w8_slice022_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6AU08P08F22SelectorRow=id=>id===G6A_U08_P08F22_KP_ID?clone(G6A_U08_P08F22_SELECTOR_ROW):null;
export const listG6AU08P08F22PatternGroups=id=>id===G6A_U08_P08F22_KP_ID?[clone(G6A_U08_P08F22_PATTERN_GROUP)]:[];
export const resolveG6AU08P08F22PatternSpecIds=id=>id===G6A_U08_P08F22_KP_ID?clone(G6A_U08_P08F22_SPEC_IDS):[];
export function auditG6AU08P08F22Projection(){
  const e=[],m=G6A_U08_P08F22_FORMAL_MAPPING;
  if(G6A_U08_P08F22_PATTERN_SPECS.length!==6||m.patternSpecIds.length!==6)e.push("P08F22_PATTERN_CARDINALITY_INVALID");
  if(new Set(G6A_U08_P08F22_SPEC_IDS).size!==6)e.push("P08F22_PATTERN_SPEC_DUPLICATE");
  for(const x of G6A_U08_P08F22_PATTERN_SPECS){
    if(x.questionMode!=="numeric"||x.representation!=="speed_unit_conversion"||x.semanticCore!=="CONVERT_EQUIVALENT_SPEED_UNITS_BY_COUPLED_DISTANCE_TIME_SCALING"||
      !x.coupledDistanceTimeScalingRequired||!x.equivalentRateInvariantRequired||!x.sourceAndTargetRateUnitsRequired||!x.answerBackConversionRequired||
      !x.speedDistanceTimeRelationPrerequisiteAllowed||x.speedDistanceTimeRelationTeachingReownershipAllowed||x.averageSpeedReownershipAllowed||
      x.relativeSpeedMeetingChasingReownershipAllowed||x.effectiveSpeedCurrentWindReownershipAllowed||x.applicationContextAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed)
      e.push("P08F22_PATTERN_SCOPE_INVALID:"+x.patternSpecId);
  }
  if(m.primaryRuntimeProfileId!=="profile_speed_rate"||m.classificationRuleId!=="rule_speed_rate"||
    m.appliedRuntimeModifierIds.join("|")!=="mod_unit_conversion|mod_quantity_relation_semantics"||
    m.requiredCapabilityIds.join("|")!==G6A_U08_P08F22_REQUIRED_CAPABILITY_IDS.join("|")||
    m.contractOnlyRequiredCapabilityIds.join("|")!==G6A_U08_P08F22_CONTRACT_ONLY_CAPABILITY_IDS.join("|")||
    m.optionalCapabilityIds.join("|")!==G6A_U08_P08F22_OPTIONAL_CAPABILITY_IDS.join("|")||!m.coupledDistanceTimeScalingRequired||
    !m.equivalentRateInvariantRequired||!m.sourceAndTargetRateUnitsRequired||!m.answerBackConversionRequired||
    !m.speedDistanceTimeRelationPrerequisiteAllowed||m.speedDistanceTimeRelationTeachingReownershipAllowed||m.averageSpeedReownershipAllowed||
    m.relativeSpeedMeetingChasingReownershipAllowed||m.effectiveSpeedCurrentWindReownershipAllowed||m.applicationContextAllowed||
    m.sameUnitMixedAllowed||m.crossUnitMixedAllowed||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed)e.push("P08F22_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:6,formalMappings:1})});
}
