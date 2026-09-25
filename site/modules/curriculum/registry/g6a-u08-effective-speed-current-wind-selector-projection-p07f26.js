export const P07F26_TASK_ID="P07F_W7DirectProductVerticalSlice026Implementation";
export const G6A_U08_P07F26_SOURCE_ID="g6a_u08_6a08";
export const G6A_U08_P07F26_SUPPORTING_SOURCE_IDS=Object.freeze(["g6b_u02_6b02"]);
export const G6A_U08_P07F26_UNIT_CODE="6A-U08";
export const G6A_U08_P07F26_UNIT_TITLE="認識速率";
export const G6A_U08_P07F26_KP_ID="kp_effective_speed_current_wind";
export const G6A_U08_P07F26_PROTECTED_NON_W7_KP_IDS=Object.freeze(["kp_speed_unit_conversion"]);
export const G6A_U08_P07F26_REQUIRED_PREREQUISITE_KP_IDS=Object.freeze(["kp_relative_speed_meeting_chasing"]);
export const G6A_U08_P07F26_QUEUE_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_ratio_percent_reasoning","cap_ratio_rate_validator","cap_speed_rate_reasoning"
]);
export const G6A_U08_P07F26_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly","cap_answer_key_projection",
  "cap_html_print_renderer","cap_speed_rate_reasoning","cap_ratio_rate_validator","cap_quantity_dimension_unit_identity",
  "cap_text_application_representation","cap_quantity_semantic_role_binding","cap_relation_model_binding","cap_word_problem_semantic_validation"
]);
export const G6A_U08_P07F26_OPTIONAL_CAPABILITY_IDS=Object.freeze(["cap_unit_conversion","cap_global_context_binding","cap_pbl_task_set_projection"]);
export const G6A_U08_P07F26_APPLIED_MODIFIER_IDS=Object.freeze(["mod_quantity_relation_semantics","mod_application_semantics"]);
export const G6A_U08_P07F26_INCLUDED_RELATIONS=Object.freeze([
  "DOWNSTREAM_EFFECTIVE_SPEED_SUM","UPSTREAM_EFFECTIVE_SPEED_DIFFERENCE","TAILWIND_EFFECTIVE_SPEED_SUM","HEADWIND_EFFECTIVE_SPEED_DIFFERENCE"
]);
const spec=(id,family,relation,medium,direction,operation)=>Object.freeze({
  patternSpecId:id,knowledgePointId:G6A_U08_P07F26_KP_ID,patternGroupId:"pg_g6a_u08_effective_speed_current_wind",
  patternFamilyId:family,relation,medium,direction,operation,semanticCore:"SOLVE_EFFECTIVE_SPEED_FROM_OWN_SPEED_AND_CURRENT_OR_WIND",
  questionMode:"numeric",representation:"text_application",answerDomain:"POSITIVE_INTEGER",
  computeEffectiveSpeedFromOwnAndCurrentWindRequired:true,sameDirectionAdditionRequired:true,oppositeDirectionSubtractionRequired:true,
  positiveOpposingEffectiveSpeedRequired:true,compatibleRateUnitsRequired:true,quantitySemanticRoleBindingRequired:true,answerBackSubstitutionRequired:true,
  reverseSolveOwnSpeedAllowed:false,reverseSolveCurrentWindSpeedAllowed:false,speedUnitConversionOwnershipAllowed:false,
  averageSpeedReownershipAllowed:false,relativeSpeedMeetingChasingReownershipAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false
});
export const G6A_U08_P07F26_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g6a_u08_effective_speed_current_wind",sourceId:G6A_U08_P07F26_SOURCE_ID,unitCode:G6A_U08_P07F26_UNIT_CODE,unitTitle:G6A_U08_P07F26_UNIT_TITLE,
  displayName:"順逆流與有效速率",primaryKnowledgePointId:G6A_U08_P07F26_KP_ID,knowledgePointIds:Object.freeze([G6A_U08_P07F26_KP_ID]),
  supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",representationTag:"text_application",
  representationTags:Object.freeze(["speed","effective_speed","current","wind","same_direction","opposite_direction","application"]),
  patternSpecIds:Object.freeze([
    "ps_g6a_u08_downstream_effective_speed",
    "ps_g6a_u08_upstream_effective_speed",
    "ps_g6a_u08_tailwind_effective_speed",
    "ps_g6a_u08_headwind_effective_speed"
  ]),
  allocationPolicy:"balanced_pattern_spec",visibilityStatus:"visible",holdReason:null
});
export const G6A_U08_P07F26_PATTERN_SPECS=Object.freeze([
  spec("ps_g6a_u08_downstream_effective_speed","DOWNSTREAM_EFFECTIVE_SPEED",G6A_U08_P07F26_INCLUDED_RELATIONS[0],"CURRENT","SAME","ADD"),
  spec("ps_g6a_u08_upstream_effective_speed","UPSTREAM_EFFECTIVE_SPEED",G6A_U08_P07F26_INCLUDED_RELATIONS[1],"CURRENT","OPPOSITE","SUBTRACT"),
  spec("ps_g6a_u08_tailwind_effective_speed","TAILWIND_EFFECTIVE_SPEED",G6A_U08_P07F26_INCLUDED_RELATIONS[2],"WIND","SAME","ADD"),
  spec("ps_g6a_u08_headwind_effective_speed","HEADWIND_EFFECTIVE_SPEED",G6A_U08_P07F26_INCLUDED_RELATIONS[3],"WIND","OPPOSITE","SUBTRACT")
]);
export const G6A_U08_P07F26_SPEC_IDS=Object.freeze(G6A_U08_P07F26_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G6A_U08_P07F26_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g6a_u08_effective_speed_current_wind_p07f26",r04MappingId:"r04map_effective_speed_current_wind",
  sourceId:G6A_U08_P07F26_SOURCE_ID,supportingSourceIds:G6A_U08_P07F26_SUPPORTING_SOURCE_IDS,r02EvidencePages:Object.freeze([1,2]),
  knowledgePointId:G6A_U08_P07F26_KP_ID,canonicalNameZh:"順逆流與有效速率",capabilityStatement:"學生能由本身速率與水流或風速求有效速率。",
  reasoningInvariant:"順向有效速率相加，逆向有效速率相減。",
  sourceSemanticCore:"SOLVE_EFFECTIVE_SPEED_FROM_OWN_SPEED_AND_CURRENT_OR_WIND",
  semanticAuthority:"R02_FULL_PAGE_VISUAL_READBACK_PLUS_P07E_W7_SOURCE_AUTHORITY_INDEX",
  primaryRuntimeProfileId:"profile_speed_rate",classificationRuleId:"rule_speed_rate",appliedRuntimeModifierIds:G6A_U08_P07F26_APPLIED_MODIFIER_IDS,
  requiredCapabilityIds:G6A_U08_P07F26_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G6A_U08_P07F26_OPTIONAL_CAPABILITY_IDS,
  queueRequiredW7CapabilityIds:G6A_U08_P07F26_QUEUE_REQUIRED_CAPABILITY_IDS,patternSpecIds:G6A_U08_P07F26_SPEC_IDS,
  requiredPrerequisiteKnowledgePointIds:G6A_U08_P07F26_REQUIRED_PREREQUISITE_KP_IDS,
  computeEffectiveSpeedFromOwnAndCurrentWindRequired:true,sameDirectionAdditionRequired:true,oppositeDirectionSubtractionRequired:true,
  positiveOpposingEffectiveSpeedRequired:true,compatibleRateUnitsRequired:true,quantitySemanticRoleBindingRequired:true,answerBackSubstitutionRequired:true,
  reverseSolveOwnSpeedAllowed:false,reverseSolveCurrentWindSpeedAllowed:false,speedUnitConversionOwnershipAllowed:false,
  averageSpeedReownershipAllowed:false,relativeSpeedMeetingChasingReownershipAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false,
  r04ReclassificationAllowed:false,frozenQueueMutationAllowed:false
});
export const G6A_U08_P07F26_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G6A_U08_P07F26_KP_ID,sourceId:G6A_U08_P07F26_SOURCE_ID,unitCode:G6A_U08_P07F26_UNIT_CODE,unitTitle:G6A_U08_P07F26_UNIT_TITLE,
  displayName:"順逆流與有效速率",canonicalNameZh:"順逆流與有效速率",mode:"numeric",questionMode:"numeric",questionModes:Object.freeze(["numeric"]),
  supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:"APPLICATION_COMPATIBLE",
  canonicalPatternGroupIds:Object.freeze([G6A_U08_P07F26_PATTERN_GROUP.patternGroupId]),canonicalPatternSpecIds:G6A_U08_P07F26_SPEC_IDS,
  patternGroupIds:Object.freeze([G6A_U08_P07F26_PATTERN_GROUP.patternGroupId]),patternSpecIds:G6A_U08_P07F26_SPEC_IDS,
  requiredCapabilityIds:G6A_U08_P07F26_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G6A_U08_P07F26_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P07F26_G6A_U08_EFFECTIVE_SPEED_CURRENT_WIND",productionUse:"full_product_w7_slice026_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6AU08P07F26SelectorRow=id=>id===G6A_U08_P07F26_KP_ID?clone(G6A_U08_P07F26_SELECTOR_ROW):null;
export const listG6AU08P07F26PatternGroups=id=>id===G6A_U08_P07F26_KP_ID?[clone(G6A_U08_P07F26_PATTERN_GROUP)]:[];
export const resolveG6AU08P07F26PatternSpecIds=id=>id===G6A_U08_P07F26_KP_ID?clone(G6A_U08_P07F26_SPEC_IDS):[];
export function auditG6AU08P07F26Projection(){
  const e=[],m=G6A_U08_P07F26_FORMAL_MAPPING;
  if(G6A_U08_P07F26_PATTERN_SPECS.length!==4||m.patternSpecIds.length!==4)e.push("P07F26_PATTERN_CARDINALITY_INVALID");
  if(new Set(G6A_U08_P07F26_SPEC_IDS).size!==4)e.push("P07F26_PATTERN_SPEC_DUPLICATE");
  for(const x of G6A_U08_P07F26_PATTERN_SPECS){
    if(x.questionMode!=="numeric"||x.representation!=="text_application"||x.semanticCore!=="SOLVE_EFFECTIVE_SPEED_FROM_OWN_SPEED_AND_CURRENT_OR_WIND"||
      !x.computeEffectiveSpeedFromOwnAndCurrentWindRequired||!x.sameDirectionAdditionRequired||!x.oppositeDirectionSubtractionRequired||
      !x.positiveOpposingEffectiveSpeedRequired||!x.compatibleRateUnitsRequired||!x.quantitySemanticRoleBindingRequired||!x.answerBackSubstitutionRequired||
      x.reverseSolveOwnSpeedAllowed||x.reverseSolveCurrentWindSpeedAllowed||x.speedUnitConversionOwnershipAllowed||x.averageSpeedReownershipAllowed||
      x.relativeSpeedMeetingChasingReownershipAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed)e.push("P07F26_PATTERN_SCOPE_INVALID:"+x.patternSpecId);
  }
  if(m.primaryRuntimeProfileId!=="profile_speed_rate"||m.classificationRuleId!=="rule_speed_rate"||
    m.appliedRuntimeModifierIds.join("|")!=="mod_quantity_relation_semantics|mod_application_semantics"||
    m.requiredCapabilityIds.join("|")!==G6A_U08_P07F26_REQUIRED_CAPABILITY_IDS.join("|")||
    m.optionalCapabilityIds.join("|")!==G6A_U08_P07F26_OPTIONAL_CAPABILITY_IDS.join("|")||
    !m.computeEffectiveSpeedFromOwnAndCurrentWindRequired||!m.sameDirectionAdditionRequired||!m.oppositeDirectionSubtractionRequired||
    !m.positiveOpposingEffectiveSpeedRequired||!m.compatibleRateUnitsRequired||!m.quantitySemanticRoleBindingRequired||!m.answerBackSubstitutionRequired||
    m.reverseSolveOwnSpeedAllowed||m.reverseSolveCurrentWindSpeedAllowed||m.speedUnitConversionOwnershipAllowed||m.averageSpeedReownershipAllowed||
    m.relativeSpeedMeetingChasingReownershipAllowed||m.sameUnitMixedAllowed||m.crossUnitMixedAllowed||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed)e.push("P07F26_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:4,formalMappings:1})});
}
