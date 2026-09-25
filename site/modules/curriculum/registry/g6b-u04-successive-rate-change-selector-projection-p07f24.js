export const P07F24_TASK_ID="P07F_W7DirectProductVerticalSlice024Implementation";
export const G6B_U04_P07F24_SOURCE_ID="g6b_u04_6b04";
export const G6B_U04_P07F24_UNIT_CODE="6B-U04";
export const G6B_U04_P07F24_UNIT_TITLE="基準量與比較量";
export const G6B_U04_P07F24_KP_ID="kp_g6b_u04_successive_rate_change";
export const G6B_U04_P07F24_REQUIRED_PREREQUISITE_KP_IDS=Object.freeze([
  "kp_g5b_u08_percent_discount_increase_application",
  "kp_g6b_u04_find_base_quantity",
  "kp_g6b_u04_find_comparison_quantity"
]);
export const G6B_U04_P07F24_QUEUE_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_ratio_percent_reasoning","cap_ratio_rate_validator"
]);
export const G6B_U04_P07F24_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly","cap_answer_key_projection",
  "cap_html_print_renderer","cap_ratio_percent_reasoning","cap_ratio_rate_validator","cap_text_application_representation",
  "cap_relation_model_binding","cap_word_problem_semantic_validation"
]);
export const G6B_U04_P07F24_OPTIONAL_CAPABILITY_IDS=Object.freeze(["cap_global_context_binding","cap_pbl_task_set_projection"]);
export const G6B_U04_P07F24_APPLIED_MODIFIER_IDS=Object.freeze(["mod_application_semantics"]);
export const G6B_U04_P07F24_INCLUDED_RELATIONS=Object.freeze([
  "SUCCESSIVE_DECREASE_DECREASE",
  "SUCCESSIVE_INCREASE_INCREASE",
  "SUCCESSIVE_INCREASE_THEN_DECREASE",
  "SUCCESSIVE_DECREASE_THEN_INCREASE"
]);
const spec=(id,family,relation,stage1,stage2)=>Object.freeze({
  patternSpecId:id,knowledgePointId:G6B_U04_P07F24_KP_ID,patternGroupId:"pg_g6b_u04_successive_rate_change",
  patternFamilyId:family,relation,stage1ChangeType:stage1,stage2ChangeType:stage2,
  semanticCore:"COMPOSE_SUCCESSIVE_RATE_CHANGE_BY_MULTIPLYING_STAGE_FACTORS",
  questionMode:"numeric",representation:"text_application",answerDomain:"POSITIVE_INTEGER_QUANTITY",
  stageFactorMultiplicationRequired:true,stage1OutputBecomesStage2BaseRequired:true,answerBackSubstitutionRequired:true,
  directPercentageAdditionAllowed:false,predecessorKnowledgePointReownershipAllowed:false,
  simpleSingleStageDiscountIncreaseReownershipAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false
});
export const G6B_U04_P07F24_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g6b_u04_successive_rate_change",sourceId:G6B_U04_P07F24_SOURCE_ID,unitCode:G6B_U04_P07F24_UNIT_CODE,unitTitle:G6B_U04_P07F24_UNIT_TITLE,
  displayName:"連續增減率",primaryKnowledgePointId:G6B_U04_P07F24_KP_ID,knowledgePointIds:Object.freeze([G6B_U04_P07F24_KP_ID]),
  supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",representationTag:"text_application",
  representationTags:Object.freeze(["ratio","percent","successive_change","retention_factor","growth_factor","application"]),
  patternSpecIds:Object.freeze([
    "ps_g6b_u04_successive_two_decreases",
    "ps_g6b_u04_successive_two_increases",
    "ps_g6b_u04_increase_then_decrease",
    "ps_g6b_u04_decrease_then_increase"
  ]),
  allocationPolicy:"balanced_pattern_spec",visibilityStatus:"visible",holdReason:null
});
export const G6B_U04_P07F24_PATTERN_SPECS=Object.freeze([
  spec("ps_g6b_u04_successive_two_decreases","SUCCESSIVE_TWO_DECREASES",G6B_U04_P07F24_INCLUDED_RELATIONS[0],"DECREASE","DECREASE"),
  spec("ps_g6b_u04_successive_two_increases","SUCCESSIVE_TWO_INCREASES",G6B_U04_P07F24_INCLUDED_RELATIONS[1],"INCREASE","INCREASE"),
  spec("ps_g6b_u04_increase_then_decrease","INCREASE_THEN_DECREASE",G6B_U04_P07F24_INCLUDED_RELATIONS[2],"INCREASE","DECREASE"),
  spec("ps_g6b_u04_decrease_then_increase","DECREASE_THEN_INCREASE",G6B_U04_P07F24_INCLUDED_RELATIONS[3],"DECREASE","INCREASE")
]);
export const G6B_U04_P07F24_SPEC_IDS=Object.freeze(G6B_U04_P07F24_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G6B_U04_P07F24_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g6b_u04_successive_rate_change_p07f24",r04MappingId:"r04map_g6b_u04_successive_rate_change",
  sourceId:G6B_U04_P07F24_SOURCE_ID,r02EvidencePages:Object.freeze([1,2]),knowledgePointId:G6B_U04_P07F24_KP_ID,
  canonicalNameZh:"連續增減率",capabilityStatement:"學生能處理連續折扣、成長或減少。",
  reasoningInvariant:"連續變化應乘各階段保留或成長因子，不能直接相加百分率。",
  sourceSemanticCore:"COMPOSE_SUCCESSIVE_RATE_CHANGE_BY_MULTIPLYING_STAGE_FACTORS",
  semanticAuthority:"R02_FULL_PAGE_VISUAL_READBACK_PLUS_EXISTING_G6B_U04_DIRECT_VISUAL_CORROBORATION",
  primaryRuntimeProfileId:"profile_ratio_percent",classificationRuleId:"rule_ratio_percent",appliedRuntimeModifierIds:G6B_U04_P07F24_APPLIED_MODIFIER_IDS,
  requiredCapabilityIds:G6B_U04_P07F24_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G6B_U04_P07F24_OPTIONAL_CAPABILITY_IDS,
  queueRequiredW7CapabilityIds:G6B_U04_P07F24_QUEUE_REQUIRED_CAPABILITY_IDS,patternSpecIds:G6B_U04_P07F24_SPEC_IDS,
  requiredPrerequisiteKnowledgePointIds:G6B_U04_P07F24_REQUIRED_PREREQUISITE_KP_IDS,
  stageFactorMultiplicationRequired:true,stage1OutputBecomesStage2BaseRequired:true,answerBackSubstitutionRequired:true,
  directPercentageAdditionAllowed:false,predecessorKnowledgePointReownershipAllowed:false,simpleSingleStageDiscountIncreaseReownershipAllowed:false,
  sameUnitMixedAllowed:false,crossUnitMixedAllowed:false,r04ReclassificationAllowed:false,frozenQueueMutationAllowed:false
});
export const G6B_U04_P07F24_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G6B_U04_P07F24_KP_ID,sourceId:G6B_U04_P07F24_SOURCE_ID,unitCode:G6B_U04_P07F24_UNIT_CODE,unitTitle:G6B_U04_P07F24_UNIT_TITLE,
  displayName:"連續增減率",canonicalNameZh:"連續增減率",mode:"numeric",questionMode:"numeric",questionModes:Object.freeze(["numeric"]),
  supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:"APPLICATION_COMPATIBLE",
  canonicalPatternGroupIds:Object.freeze([G6B_U04_P07F24_PATTERN_GROUP.patternGroupId]),canonicalPatternSpecIds:G6B_U04_P07F24_SPEC_IDS,
  patternGroupIds:Object.freeze([G6B_U04_P07F24_PATTERN_GROUP.patternGroupId]),patternSpecIds:G6B_U04_P07F24_SPEC_IDS,
  requiredCapabilityIds:G6B_U04_P07F24_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G6B_U04_P07F24_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P07F24_G6B_U04_SUCCESSIVE_RATE_CHANGE",productionUse:"full_product_w7_slice024_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6BU04P07F24SelectorRow=id=>id===G6B_U04_P07F24_KP_ID?clone(G6B_U04_P07F24_SELECTOR_ROW):null;
export const listG6BU04P07F24PatternGroups=id=>id===G6B_U04_P07F24_KP_ID?[clone(G6B_U04_P07F24_PATTERN_GROUP)]:[];
export const resolveG6BU04P07F24PatternSpecIds=id=>id===G6B_U04_P07F24_KP_ID?clone(G6B_U04_P07F24_SPEC_IDS):[];
export function auditG6BU04P07F24Projection(){
  const e=[],m=G6B_U04_P07F24_FORMAL_MAPPING;
  if(G6B_U04_P07F24_PATTERN_SPECS.length!==4||m.patternSpecIds.length!==4)e.push("P07F24_PATTERN_CARDINALITY_INVALID");
  if(new Set(G6B_U04_P07F24_SPEC_IDS).size!==4)e.push("P07F24_PATTERN_SPEC_DUPLICATE");
  for(const x of G6B_U04_P07F24_PATTERN_SPECS){
    if(x.questionMode!=="numeric"||x.representation!=="text_application"||x.semanticCore!=="COMPOSE_SUCCESSIVE_RATE_CHANGE_BY_MULTIPLYING_STAGE_FACTORS"||
      !x.stageFactorMultiplicationRequired||!x.stage1OutputBecomesStage2BaseRequired||!x.answerBackSubstitutionRequired||x.directPercentageAdditionAllowed||
      x.predecessorKnowledgePointReownershipAllowed||x.simpleSingleStageDiscountIncreaseReownershipAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed)
      e.push("P07F24_PATTERN_SCOPE_INVALID:"+x.patternSpecId);
  }
  if(m.primaryRuntimeProfileId!=="profile_ratio_percent"||m.classificationRuleId!=="rule_ratio_percent"||
    m.appliedRuntimeModifierIds.join("|")!=="mod_application_semantics"||m.requiredCapabilityIds.join("|")!==G6B_U04_P07F24_REQUIRED_CAPABILITY_IDS.join("|")||
    m.optionalCapabilityIds.join("|")!==G6B_U04_P07F24_OPTIONAL_CAPABILITY_IDS.join("|")||!m.stageFactorMultiplicationRequired||
    !m.stage1OutputBecomesStage2BaseRequired||!m.answerBackSubstitutionRequired||m.directPercentageAdditionAllowed||
    m.predecessorKnowledgePointReownershipAllowed||m.simpleSingleStageDiscountIncreaseReownershipAllowed||
    m.sameUnitMixedAllowed||m.crossUnitMixedAllowed||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed)e.push("P07F24_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:4,formalMappings:1})});
}
