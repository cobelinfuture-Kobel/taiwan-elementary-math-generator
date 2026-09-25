export const P07F25_TASK_ID="P07F_W7DirectProductVerticalSlice025Implementation";
export const G6A_U08_P07F25_SOURCE_ID="g6a_u08_6a08";
export const G6A_U08_P07F25_SUPPORTING_SOURCE_IDS=Object.freeze(["g6b_u02_6b02"]);
export const G6A_U08_P07F25_UNIT_CODE="6A-U08";
export const G6A_U08_P07F25_UNIT_TITLE="認識速率";
export const G6A_U08_P07F25_AVERAGE_KP_ID="kp_average_speed_total_distance_time";
export const G6A_U08_P07F25_RELATIVE_KP_ID="kp_relative_speed_meeting_chasing";
export const G6A_U08_P07F25_KP_IDS=Object.freeze([G6A_U08_P07F25_AVERAGE_KP_ID,G6A_U08_P07F25_RELATIVE_KP_ID]);
export const G6A_U08_P07F25_PROTECTED_FUTURE_KP_IDS=Object.freeze(["kp_speed_unit_conversion","kp_effective_speed_current_wind"]);
export const G6A_U08_P07F25_QUEUE_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_ratio_percent_reasoning","cap_ratio_rate_validator","cap_speed_rate_reasoning"
]);
export const G6A_U08_P07F25_AVERAGE_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly","cap_answer_key_projection",
  "cap_html_print_renderer","cap_speed_rate_reasoning","cap_ratio_rate_validator","cap_quantity_dimension_unit_identity",
  "cap_text_application_representation","cap_quantity_semantic_role_binding"
]);
export const G6A_U08_P07F25_RELATIVE_REQUIRED_CAPABILITY_IDS=Object.freeze([
  ...G6A_U08_P07F25_AVERAGE_REQUIRED_CAPABILITY_IDS,"cap_relation_model_binding","cap_word_problem_semantic_validation"
]);
export const G6A_U08_P07F25_AVERAGE_OPTIONAL_CAPABILITY_IDS=Object.freeze(["cap_unit_conversion","cap_global_context_binding"]);
export const G6A_U08_P07F25_RELATIVE_OPTIONAL_CAPABILITY_IDS=Object.freeze(["cap_unit_conversion","cap_global_context_binding","cap_pbl_task_set_projection"]);
export const G6A_U08_P07F25_AVERAGE_MODIFIER_IDS=Object.freeze(["mod_quantity_relation_semantics"]);
export const G6A_U08_P07F25_RELATIVE_MODIFIER_IDS=Object.freeze(["mod_quantity_relation_semantics","mod_application_semantics"]);

const avgSpec=Object.freeze({
  patternSpecId:"ps_g6a_u08_average_speed_two_segments",knowledgePointId:G6A_U08_P07F25_AVERAGE_KP_ID,
  patternGroupId:"pg_g6a_u08_average_speed_total_distance_time",patternFamilyId:"AVERAGE_SPEED_TWO_SEGMENTS",
  relation:"TOTAL_DISTANCE_DIVIDED_BY_TOTAL_TIME",targetKind:"AVERAGE_SPEED",
  semanticCore:"SOLVE_AVERAGE_SPEED_FROM_TOTAL_DISTANCE_AND_TOTAL_TIME",
  questionMode:"numeric",representation:"text_application",answerDomain:"POSITIVE_INTEGER",
  totalDistanceOverTotalTimeRequired:true,directSegmentSpeedArithmeticMeanAllowed:false,
  compatibleDistanceTimeRateUnitsRequired:true,quantitySemanticRoleBindingRequired:true,answerBackSubstitutionRequired:true,
  speedUnitConversionOwnershipAllowed:false,effectiveSpeedCurrentWindOwnershipAllowed:false,
  predecessorSpeedRelationReownershipAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false
});
const relSpec=(id,family,relation,relativeKind)=>Object.freeze({
  patternSpecId:id,knowledgePointId:G6A_U08_P07F25_RELATIVE_KP_ID,patternGroupId:"pg_g6a_u08_relative_speed_meeting_chasing",
  patternFamilyId:family,relation,relativeKind,semanticCore:"SOLVE_MEETING_CHASING_BY_RELATIVE_SPEED",
  questionMode:"numeric",representation:"text_application",answerDomain:"POSITIVE_INTEGER",
  relativeSpeedRelationRequired:true,meetingUsesSpeedSumRequired:true,chasingUsesPositiveSpeedDifferenceRequired:true,
  compatibleDistanceTimeRateUnitsRequired:true,quantitySemanticRoleBindingRequired:true,answerBackSubstitutionRequired:true,
  speedUnitConversionOwnershipAllowed:false,effectiveSpeedCurrentWindOwnershipAllowed:false,
  predecessorSpeedRelationReownershipAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false
});
export const G6A_U08_P07F25_PATTERN_GROUPS=Object.freeze([
  Object.freeze({
    patternGroupId:"pg_g6a_u08_average_speed_total_distance_time",sourceId:G6A_U08_P07F25_SOURCE_ID,unitCode:G6A_U08_P07F25_UNIT_CODE,unitTitle:G6A_U08_P07F25_UNIT_TITLE,
    displayName:"全程平均速率",primaryKnowledgePointId:G6A_U08_P07F25_AVERAGE_KP_ID,knowledgePointIds:Object.freeze([G6A_U08_P07F25_AVERAGE_KP_ID]),
    supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",representationTag:"text_application",
    representationTags:Object.freeze(["speed","distance","time","average_speed","total_distance","total_time","application"]),
    patternSpecIds:Object.freeze(["ps_g6a_u08_average_speed_two_segments"]),allocationPolicy:"balanced_pattern_spec",visibilityStatus:"visible",holdReason:null
  }),
  Object.freeze({
    patternGroupId:"pg_g6a_u08_relative_speed_meeting_chasing",sourceId:G6A_U08_P07F25_SOURCE_ID,unitCode:G6A_U08_P07F25_UNIT_CODE,unitTitle:G6A_U08_P07F25_UNIT_TITLE,
    displayName:"相遇與追趕",primaryKnowledgePointId:G6A_U08_P07F25_RELATIVE_KP_ID,knowledgePointIds:Object.freeze([G6A_U08_P07F25_RELATIVE_KP_ID]),
    supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",representationTag:"text_application",
    representationTags:Object.freeze(["speed","distance","time","relative_speed","meeting","chasing","application"]),
    patternSpecIds:Object.freeze(["ps_g6a_u08_meeting_relative_speed_sum","ps_g6a_u08_chasing_relative_speed_difference"]),
    allocationPolicy:"balanced_pattern_spec",visibilityStatus:"visible",holdReason:null
  })
]);
export const G6A_U08_P07F25_PATTERN_SPECS=Object.freeze([
  avgSpec,
  relSpec("ps_g6a_u08_meeting_relative_speed_sum","MEETING_RELATIVE_SPEED_SUM","MEETING_RELATIVE_SPEED_SUM","MEETING"),
  relSpec("ps_g6a_u08_chasing_relative_speed_difference","CHASING_RELATIVE_SPEED_DIFFERENCE","CHASING_RELATIVE_SPEED_DIFFERENCE","CHASING")
]);
export const G6A_U08_P07F25_SPEC_IDS=Object.freeze(G6A_U08_P07F25_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G6A_U08_P07F25_AVERAGE_SPEC_IDS=Object.freeze(["ps_g6a_u08_average_speed_two_segments"]);
export const G6A_U08_P07F25_RELATIVE_SPEC_IDS=Object.freeze(["ps_g6a_u08_meeting_relative_speed_sum","ps_g6a_u08_chasing_relative_speed_difference"]);
export const G6A_U08_P07F25_FORMAL_MAPPINGS=Object.freeze([
  Object.freeze({
    mappingId:"fm_g6a_u08_average_speed_total_distance_time_p07f25",r04MappingId:"r04map_average_speed_total_distance_time",
    sourceId:G6A_U08_P07F25_SOURCE_ID,supportingSourceIds:G6A_U08_P07F25_SUPPORTING_SOURCE_IDS,r02EvidencePages:Object.freeze([1,2]),
    knowledgePointId:G6A_U08_P07F25_AVERAGE_KP_ID,canonicalNameZh:"全程平均速率",capabilityStatement:"學生能以總距離除以總時間求平均速率。",
    reasoningInvariant:"平均速率不能直接平均各段速率，必須使用全程總量。",
    sourceSemanticCore:"SOLVE_AVERAGE_SPEED_FROM_TOTAL_DISTANCE_AND_TOTAL_TIME",semanticAuthority:"R02_FULL_PAGE_VISUAL_READBACK_PLUS_P07E_W7_SOURCE_AUTHORITY_INDEX",
    primaryRuntimeProfileId:"profile_speed_rate",classificationRuleId:"rule_speed_rate",appliedRuntimeModifierIds:G6A_U08_P07F25_AVERAGE_MODIFIER_IDS,
    requiredCapabilityIds:G6A_U08_P07F25_AVERAGE_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G6A_U08_P07F25_AVERAGE_OPTIONAL_CAPABILITY_IDS,
    queueRequiredW7CapabilityIds:G6A_U08_P07F25_QUEUE_REQUIRED_CAPABILITY_IDS,patternSpecIds:G6A_U08_P07F25_AVERAGE_SPEC_IDS,
    requiredPrerequisiteKnowledgePointIds:Object.freeze(["kp_speed_distance_time_relation"]),
    totalDistanceOverTotalTimeRequired:true,directSegmentSpeedArithmeticMeanAllowed:false,compatibleDistanceTimeRateUnitsRequired:true,
    quantitySemanticRoleBindingRequired:true,answerBackSubstitutionRequired:true,speedUnitConversionOwnershipAllowed:false,
    effectiveSpeedCurrentWindOwnershipAllowed:false,predecessorSpeedRelationReownershipAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false,
    r04ReclassificationAllowed:false,frozenQueueMutationAllowed:false
  }),
  Object.freeze({
    mappingId:"fm_g6a_u08_relative_speed_meeting_chasing_p07f25",r04MappingId:"r04map_relative_speed_meeting_chasing",
    sourceId:G6A_U08_P07F25_SOURCE_ID,supportingSourceIds:G6A_U08_P07F25_SUPPORTING_SOURCE_IDS,r02EvidencePages:Object.freeze([1,2]),
    knowledgePointId:G6A_U08_P07F25_RELATIVE_KP_ID,canonicalNameZh:"相遇追趕相對速率",capabilityStatement:"學生能以速率和或差處理相遇與追趕。",
    reasoningInvariant:"相向距離縮短率為速率和，同向追趕率為速率差。",
    sourceSemanticCore:"SOLVE_MEETING_CHASING_BY_RELATIVE_SPEED",semanticAuthority:"R02_FULL_PAGE_VISUAL_READBACK_PLUS_P07E_W7_SOURCE_AUTHORITY_INDEX",
    primaryRuntimeProfileId:"profile_speed_rate",classificationRuleId:"rule_speed_rate",appliedRuntimeModifierIds:G6A_U08_P07F25_RELATIVE_MODIFIER_IDS,
    requiredCapabilityIds:G6A_U08_P07F25_RELATIVE_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G6A_U08_P07F25_RELATIVE_OPTIONAL_CAPABILITY_IDS,
    queueRequiredW7CapabilityIds:G6A_U08_P07F25_QUEUE_REQUIRED_CAPABILITY_IDS,patternSpecIds:G6A_U08_P07F25_RELATIVE_SPEC_IDS,
    requiredPrerequisiteKnowledgePointIds:Object.freeze(["kp_g4a_u08_num_add_sub_left_assoc","kp_speed_distance_time_relation"]),
    relativeSpeedRelationRequired:true,meetingUsesSpeedSumRequired:true,chasingUsesPositiveSpeedDifferenceRequired:true,
    compatibleDistanceTimeRateUnitsRequired:true,quantitySemanticRoleBindingRequired:true,answerBackSubstitutionRequired:true,
    speedUnitConversionOwnershipAllowed:false,effectiveSpeedCurrentWindOwnershipAllowed:false,predecessorSpeedRelationReownershipAllowed:false,
    sameUnitMixedAllowed:false,crossUnitMixedAllowed:false,r04ReclassificationAllowed:false,frozenQueueMutationAllowed:false
  })
]);
const avgGroup=G6A_U08_P07F25_PATTERN_GROUPS[0],relGroup=G6A_U08_P07F25_PATTERN_GROUPS[1];
export const G6A_U08_P07F25_SELECTOR_ROWS=Object.freeze([
  Object.freeze({knowledgePointId:G6A_U08_P07F25_AVERAGE_KP_ID,sourceId:G6A_U08_P07F25_SOURCE_ID,unitCode:G6A_U08_P07F25_UNIT_CODE,unitTitle:G6A_U08_P07F25_UNIT_TITLE,
    displayName:"全程平均速率",canonicalNameZh:"全程平均速率",mode:"numeric",questionMode:"numeric",questionModes:Object.freeze(["numeric"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",
    holdReason:null,applicationClassification:"APPLICATION_COMPATIBLE",canonicalPatternGroupIds:Object.freeze([avgGroup.patternGroupId]),canonicalPatternSpecIds:G6A_U08_P07F25_AVERAGE_SPEC_IDS,
    patternGroupIds:Object.freeze([avgGroup.patternGroupId]),patternSpecIds:G6A_U08_P07F25_AVERAGE_SPEC_IDS,requiredCapabilityIds:G6A_U08_P07F25_AVERAGE_REQUIRED_CAPABILITY_IDS,
    optionalCapabilityIds:G6A_U08_P07F25_AVERAGE_OPTIONAL_CAPABILITY_IDS,qaStatusLabel:"P07F25_G6A_U08_AVERAGE_SPEED",productionUse:"full_product_w7_slice025_candidate"}),
  Object.freeze({knowledgePointId:G6A_U08_P07F25_RELATIVE_KP_ID,sourceId:G6A_U08_P07F25_SOURCE_ID,unitCode:G6A_U08_P07F25_UNIT_CODE,unitTitle:G6A_U08_P07F25_UNIT_TITLE,
    displayName:"相遇與追趕",canonicalNameZh:"相遇追趕相對速率",mode:"numeric",questionMode:"numeric",questionModes:Object.freeze(["numeric"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",
    holdReason:null,applicationClassification:"APPLICATION_COMPATIBLE",canonicalPatternGroupIds:Object.freeze([relGroup.patternGroupId]),canonicalPatternSpecIds:G6A_U08_P07F25_RELATIVE_SPEC_IDS,
    patternGroupIds:Object.freeze([relGroup.patternGroupId]),patternSpecIds:G6A_U08_P07F25_RELATIVE_SPEC_IDS,requiredCapabilityIds:G6A_U08_P07F25_RELATIVE_REQUIRED_CAPABILITY_IDS,
    optionalCapabilityIds:G6A_U08_P07F25_RELATIVE_OPTIONAL_CAPABILITY_IDS,qaStatusLabel:"P07F25_G6A_U08_RELATIVE_SPEED",productionUse:"full_product_w7_slice025_candidate"})
]);
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export function getG6AU08P07F25SelectorRow(id){const x=G6A_U08_P07F25_SELECTOR_ROWS.find(r=>r.knowledgePointId===id);return x?clone(x):null;}
export function listG6AU08P07F25PatternGroups(id){return G6A_U08_P07F25_PATTERN_GROUPS.filter(g=>g.primaryKnowledgePointId===id).map(clone);}
export function resolveG6AU08P07F25PatternSpecIds(id){const r=getG6AU08P07F25SelectorRow(id);return r?clone(r.patternSpecIds):[];}
export function auditG6AU08P07F25Projection(){
  const e=[];
  if(G6A_U08_P07F25_PATTERN_GROUPS.length!==2||G6A_U08_P07F25_PATTERN_SPECS.length!==3||G6A_U08_P07F25_FORMAL_MAPPINGS.length!==2)e.push("P07F25_CARDINALITY_INVALID");
  if(new Set(G6A_U08_P07F25_SPEC_IDS).size!==3)e.push("P07F25_PATTERN_SPEC_DUPLICATE");
  const avg=G6A_U08_P07F25_PATTERN_SPECS[0];
  if(avg.semanticCore!=="SOLVE_AVERAGE_SPEED_FROM_TOTAL_DISTANCE_AND_TOTAL_TIME"||!avg.totalDistanceOverTotalTimeRequired||avg.directSegmentSpeedArithmeticMeanAllowed||
    !avg.compatibleDistanceTimeRateUnitsRequired||!avg.quantitySemanticRoleBindingRequired||!avg.answerBackSubstitutionRequired||
    avg.speedUnitConversionOwnershipAllowed||avg.effectiveSpeedCurrentWindOwnershipAllowed||avg.predecessorSpeedRelationReownershipAllowed||avg.sameUnitMixedAllowed||avg.crossUnitMixedAllowed)
    e.push("P07F25_AVERAGE_SCOPE_INVALID");
  for(const x of G6A_U08_P07F25_PATTERN_SPECS.slice(1)){
    if(x.semanticCore!=="SOLVE_MEETING_CHASING_BY_RELATIVE_SPEED"||!x.relativeSpeedRelationRequired||!x.meetingUsesSpeedSumRequired||
      !x.chasingUsesPositiveSpeedDifferenceRequired||!x.compatibleDistanceTimeRateUnitsRequired||!x.quantitySemanticRoleBindingRequired||!x.answerBackSubstitutionRequired||
      x.speedUnitConversionOwnershipAllowed||x.effectiveSpeedCurrentWindOwnershipAllowed||x.predecessorSpeedRelationReownershipAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed)
      e.push("P07F25_RELATIVE_SCOPE_INVALID:"+x.patternSpecId);
  }
  const [am,rm]=G6A_U08_P07F25_FORMAL_MAPPINGS;
  if(am.r04MappingId!=="r04map_average_speed_total_distance_time"||am.appliedRuntimeModifierIds.join("|")!=="mod_quantity_relation_semantics"||
    am.requiredCapabilityIds.join("|")!==G6A_U08_P07F25_AVERAGE_REQUIRED_CAPABILITY_IDS.join("|")||am.directSegmentSpeedArithmeticMeanAllowed)e.push("P07F25_AVERAGE_MAPPING_INVALID");
  if(rm.r04MappingId!=="r04map_relative_speed_meeting_chasing"||rm.appliedRuntimeModifierIds.join("|")!=="mod_quantity_relation_semantics|mod_application_semantics"||
    rm.requiredCapabilityIds.join("|")!==G6A_U08_P07F25_RELATIVE_REQUIRED_CAPABILITY_IDS.join("|")||!rm.meetingUsesSpeedSumRequired||!rm.chasingUsesPositiveSpeedDifferenceRequired)
    e.push("P07F25_RELATIVE_MAPPING_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:2,patternGroups:2,patternSpecs:3,formalMappings:2})});
}
