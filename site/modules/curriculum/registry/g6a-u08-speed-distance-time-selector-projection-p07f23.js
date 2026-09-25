export const P07F23_TASK_ID="P07F_W7DirectProductVerticalSlice023Implementation";
export const G6A_U08_P07F23_SOURCE_ID="g6a_u08_6a08";
export const G6A_U08_P07F23_SUPPORTING_SOURCE_IDS=Object.freeze(["g6b_u02_6b02"]);
export const G6A_U08_P07F23_UNIT_CODE="6A-U08";
export const G6A_U08_P07F23_UNIT_TITLE="認識速率";
export const G6A_U08_P07F23_KP_ID="kp_speed_distance_time_relation";
export const G6A_U08_P07F23_REQUIRED_PREREQUISITE_KP_IDS=Object.freeze([
  "kp_g6a_u04_decimal_division_rate_application",
  "kp_g6b_u04_base_comparison_rate_roles"
]);
export const G6A_U08_P07F23_PROTECTED_FUTURE_KP_IDS=Object.freeze([
  "kp_speed_unit_conversion",
  "kp_average_speed_total_distance_time",
  "kp_relative_speed_meeting_chasing",
  "kp_effective_speed_current_wind"
]);
export const G6A_U08_P07F23_QUEUE_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_ratio_percent_reasoning","cap_ratio_rate_validator","cap_speed_rate_reasoning"
]);
export const G6A_U08_P07F23_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly","cap_answer_key_projection",
  "cap_html_print_renderer","cap_speed_rate_reasoning","cap_ratio_rate_validator","cap_quantity_dimension_unit_identity",
  "cap_text_application_representation","cap_quantity_semantic_role_binding"
]);
export const G6A_U08_P07F23_OPTIONAL_CAPABILITY_IDS=Object.freeze(["cap_unit_conversion","cap_global_context_binding"]);
export const G6A_U08_P07F23_APPLIED_MODIFIER_IDS=Object.freeze(["mod_quantity_relation_semantics"]);
export const G6A_U08_P07F23_INCLUDED_RELATIONS=Object.freeze([
  "SOLVE_DISTANCE_FROM_SPEED_AND_TIME",
  "SOLVE_SPEED_FROM_DISTANCE_AND_TIME",
  "SOLVE_TIME_FROM_DISTANCE_AND_SPEED"
]);
const spec=(id,family,relation,targetKind)=>Object.freeze({
  patternSpecId:id,knowledgePointId:G6A_U08_P07F23_KP_ID,patternGroupId:"pg_g6a_u08_speed_distance_time_relation",
  patternFamilyId:family,relation,targetKind,semanticCore:"SOLVE_SPEED_DISTANCE_TIME_THREE_QUANTITY_RELATION",
  questionMode:"numeric",representation:"text_application",answerDomain:"POSITIVE_INTEGER",
  fixedSpeedContextRequired:true,compatibleDistanceTimeRateUnitsRequired:true,quantitySemanticRoleBindingRequired:true,
  answerBackSubstitutionRequired:true,distanceEqualsSpeedTimesTimeRequired:true,
  speedUnitConversionOwnershipAllowed:false,averageSpeedOwnershipAllowed:false,relativeSpeedMeetingChasingOwnershipAllowed:false,
  effectiveSpeedCurrentWindOwnershipAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false
});
export const G6A_U08_P07F23_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g6a_u08_speed_distance_time_relation",sourceId:G6A_U08_P07F23_SOURCE_ID,unitCode:G6A_U08_P07F23_UNIT_CODE,unitTitle:G6A_U08_P07F23_UNIT_TITLE,
  displayName:"速率、距離與時間互求",primaryKnowledgePointId:G6A_U08_P07F23_KP_ID,knowledgePointIds:Object.freeze([G6A_U08_P07F23_KP_ID]),
  supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",representationTag:"text_application",
  representationTags:Object.freeze(["speed","distance","time","quantity_relation","application","compatible_units"]),
  patternSpecIds:Object.freeze([
    "ps_g6a_u08_solve_distance_from_speed_time",
    "ps_g6a_u08_solve_speed_from_distance_time",
    "ps_g6a_u08_solve_time_from_distance_speed"
  ]),
  allocationPolicy:"balanced_pattern_spec",visibilityStatus:"visible",holdReason:null
});
export const G6A_U08_P07F23_PATTERN_SPECS=Object.freeze([
  spec("ps_g6a_u08_solve_distance_from_speed_time","SPEED_TIME_TO_DISTANCE",G6A_U08_P07F23_INCLUDED_RELATIONS[0],"DISTANCE"),
  spec("ps_g6a_u08_solve_speed_from_distance_time","DISTANCE_TIME_TO_SPEED",G6A_U08_P07F23_INCLUDED_RELATIONS[1],"SPEED"),
  spec("ps_g6a_u08_solve_time_from_distance_speed","DISTANCE_SPEED_TO_TIME",G6A_U08_P07F23_INCLUDED_RELATIONS[2],"TIME")
]);
export const G6A_U08_P07F23_SPEC_IDS=Object.freeze(G6A_U08_P07F23_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G6A_U08_P07F23_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g6a_u08_speed_distance_time_relation_p07f23",r04MappingId:"r04map_speed_distance_time_relation",
  sourceId:G6A_U08_P07F23_SOURCE_ID,supportingSourceIds:G6A_U08_P07F23_SUPPORTING_SOURCE_IDS,r02EvidencePages:Object.freeze([1,2]),
  knowledgePointId:G6A_U08_P07F23_KP_ID,canonicalNameZh:"速率距離時間關係",capabilityStatement:"學生能在距離、速率、時間三量間互求。",
  reasoningInvariant:"距離等於速率乘時間，三量單位必須相容。",
  sourceSemanticCore:"SOLVE_SPEED_DISTANCE_TIME_THREE_QUANTITY_RELATION",
  semanticAuthority:"R02_FULL_PAGE_VISUAL_READBACK_PLUS_P07E_W7_SOURCE_AUTHORITY_INDEX",
  primaryRuntimeProfileId:"profile_speed_rate",classificationRuleId:"rule_speed_rate",
  appliedRuntimeModifierIds:G6A_U08_P07F23_APPLIED_MODIFIER_IDS,requiredCapabilityIds:G6A_U08_P07F23_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6A_U08_P07F23_OPTIONAL_CAPABILITY_IDS,queueRequiredW7CapabilityIds:G6A_U08_P07F23_QUEUE_REQUIRED_CAPABILITY_IDS,
  patternSpecIds:G6A_U08_P07F23_SPEC_IDS,requiredPrerequisiteKnowledgePointIds:G6A_U08_P07F23_REQUIRED_PREREQUISITE_KP_IDS,
  fixedSpeedContextRequired:true,compatibleDistanceTimeRateUnitsRequired:true,quantitySemanticRoleBindingRequired:true,
  answerBackSubstitutionRequired:true,distanceEqualsSpeedTimesTimeRequired:true,
  speedUnitConversionOwnershipAllowed:false,averageSpeedOwnershipAllowed:false,relativeSpeedMeetingChasingOwnershipAllowed:false,
  effectiveSpeedCurrentWindOwnershipAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false,
  r04ReclassificationAllowed:false,frozenQueueMutationAllowed:false
});
export const G6A_U08_P07F23_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G6A_U08_P07F23_KP_ID,sourceId:G6A_U08_P07F23_SOURCE_ID,unitCode:G6A_U08_P07F23_UNIT_CODE,unitTitle:G6A_U08_P07F23_UNIT_TITLE,
  displayName:"速率、距離與時間互求",canonicalNameZh:"速率距離時間關係",mode:"numeric",questionMode:"numeric",questionModes:Object.freeze(["numeric"]),
  supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:"APPLICATION_COMPATIBLE",
  canonicalPatternGroupIds:Object.freeze([G6A_U08_P07F23_PATTERN_GROUP.patternGroupId]),canonicalPatternSpecIds:G6A_U08_P07F23_SPEC_IDS,
  patternGroupIds:Object.freeze([G6A_U08_P07F23_PATTERN_GROUP.patternGroupId]),patternSpecIds:G6A_U08_P07F23_SPEC_IDS,
  requiredCapabilityIds:G6A_U08_P07F23_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G6A_U08_P07F23_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P07F23_G6A_U08_SPEED_DISTANCE_TIME_RELATION",productionUse:"full_product_w7_slice023_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6AU08P07F23SelectorRow=id=>id===G6A_U08_P07F23_KP_ID?clone(G6A_U08_P07F23_SELECTOR_ROW):null;
export const listG6AU08P07F23PatternGroups=id=>id===G6A_U08_P07F23_KP_ID?[clone(G6A_U08_P07F23_PATTERN_GROUP)]:[];
export const resolveG6AU08P07F23PatternSpecIds=id=>id===G6A_U08_P07F23_KP_ID?clone(G6A_U08_P07F23_SPEC_IDS):[];
export function auditG6AU08P07F23Projection(){
  const e=[];
  if(G6A_U08_P07F23_PATTERN_SPECS.length!==3||G6A_U08_P07F23_FORMAL_MAPPING.patternSpecIds.length!==3)e.push("P07F23_PATTERN_CARDINALITY_INVALID");
  if(new Set(G6A_U08_P07F23_SPEC_IDS).size!==3)e.push("P07F23_PATTERN_SPEC_DUPLICATE");
  for(const x of G6A_U08_P07F23_PATTERN_SPECS){
    if(x.questionMode!=="numeric"||x.representation!=="text_application"||x.semanticCore!=="SOLVE_SPEED_DISTANCE_TIME_THREE_QUANTITY_RELATION"||
      !x.fixedSpeedContextRequired||!x.compatibleDistanceTimeRateUnitsRequired||!x.quantitySemanticRoleBindingRequired||!x.answerBackSubstitutionRequired||
      !x.distanceEqualsSpeedTimesTimeRequired||x.speedUnitConversionOwnershipAllowed||x.averageSpeedOwnershipAllowed||x.relativeSpeedMeetingChasingOwnershipAllowed||
      x.effectiveSpeedCurrentWindOwnershipAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed)e.push("P07F23_PATTERN_SCOPE_INVALID:"+x.patternSpecId);
  }
  const m=G6A_U08_P07F23_FORMAL_MAPPING;
  if(m.primaryRuntimeProfileId!=="profile_speed_rate"||m.classificationRuleId!=="rule_speed_rate"||
    m.appliedRuntimeModifierIds.join("|")!=="mod_quantity_relation_semantics"||m.requiredCapabilityIds.join("|")!==G6A_U08_P07F23_REQUIRED_CAPABILITY_IDS.join("|")||
    m.optionalCapabilityIds.join("|")!==G6A_U08_P07F23_OPTIONAL_CAPABILITY_IDS.join("|")||!m.fixedSpeedContextRequired||
    !m.compatibleDistanceTimeRateUnitsRequired||!m.quantitySemanticRoleBindingRequired||!m.answerBackSubstitutionRequired||!m.distanceEqualsSpeedTimesTimeRequired||
    m.speedUnitConversionOwnershipAllowed||m.averageSpeedOwnershipAllowed||m.relativeSpeedMeetingChasingOwnershipAllowed||m.effectiveSpeedCurrentWindOwnershipAllowed||
    m.sameUnitMixedAllowed||m.crossUnitMixedAllowed||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed)e.push("P07F23_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1})});
}
