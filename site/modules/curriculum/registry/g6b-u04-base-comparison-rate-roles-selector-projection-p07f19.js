export const P07F19_TASK_ID="P07F_W7DirectProductVerticalSlice019Implementation";
export const G6B_U04_P07F19_SOURCE_ID="g6b_u04_6b04";
export const G6B_U04_P07F19_UNIT_CODE="6B-U04";
export const G6B_U04_P07F19_UNIT_TITLE="基準量與比較量";
export const G6B_U04_P07F19_KP_ID="kp_g6b_u04_base_comparison_rate_roles";
export const G6B_U04_P07F19_REQUIRED_PREREQUISITE_KP_IDS=Object.freeze(["kp_g5b_u08_find_percentage_rate"]);
export const G6B_U04_P07F19_PROTECTED_FUTURE_KP_IDS=Object.freeze([
  "kp_g6b_u04_find_base_quantity",
  "kp_g6b_u04_find_comparison_quantity",
  "kp_g6b_u04_find_rate_from_quantities",
  "kp_g6b_u04_successive_rate_change"
]);
export const G6B_U04_P07F19_QUEUE_REQUIRED_CAPABILITY_IDS=Object.freeze(["cap_ratio_percent_reasoning","cap_ratio_rate_validator"]);
export const G6B_U04_P07F19_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly","cap_answer_key_projection",
  "cap_html_print_renderer","cap_ratio_percent_reasoning","cap_ratio_rate_validator","cap_text_application_representation"
]);
export const G6B_U04_P07F19_OPTIONAL_CAPABILITY_IDS=Object.freeze([]);
export const G6B_U04_P07F19_APPLIED_MODIFIER_IDS=Object.freeze([]);
export const G6B_U04_P07F19_INCLUDED_RELATIONS=Object.freeze([
  "IDENTIFY_BASE_QUANTITY_FROM_RATE_STATEMENT",
  "IDENTIFY_COMPARISON_QUANTITY_FROM_RATE_STATEMENT",
  "IDENTIFY_RATE_FROM_RATE_STATEMENT",
  "ORIENT_COMPARISON_BASE_RATE_RELATION"
]);
const spec=(id,family,relation,targetKind)=>Object.freeze({
  patternSpecId:id,knowledgePointId:G6B_U04_P07F19_KP_ID,patternGroupId:"pg_g6b_u04_base_comparison_rate_roles",
  patternFamilyId:family,relation,targetKind,semanticCore:"IDENTIFY_BASE_COMPARISON_RATE_ROLES_AND_DIRECTION",
  questionMode:"numeric",representation:"text_application",answerDomain:"DETERMINISTIC_TEXT_ROLE_OR_RATE",
  identifyBaseQuantityRoleRequired:true,identifyComparisonQuantityRoleRequired:true,identifyRateRoleRequired:true,
  relationDirectionRequired:true,baseQuantityIsDenominatorRoleRequired:true,
  comparisonEqualsBaseTimesRateRelationMayBeShown:true,rateEqualsComparisonDividedByBaseRelationMayBeShown:true,
  solveForBaseQuantityAllowed:false,solveForComparisonQuantityAllowed:false,solveForRateAllowed:false,successiveRateChangeAllowed:false,
  discountInterestMultiStageComputationAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false
});
export const G6B_U04_P07F19_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g6b_u04_base_comparison_rate_roles",sourceId:G6B_U04_P07F19_SOURCE_ID,unitCode:G6B_U04_P07F19_UNIT_CODE,unitTitle:G6B_U04_P07F19_UNIT_TITLE,
  displayName:"基準量、比較量與比率角色",primaryKnowledgePointId:G6B_U04_P07F19_KP_ID,knowledgePointIds:Object.freeze([G6B_U04_P07F19_KP_ID]),
  supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",representationTag:"text_application",
  representationTags:Object.freeze(["ratio","percent","base_quantity","comparison_quantity","rate","role_identification","application"]),
  patternSpecIds:Object.freeze([
    "ps_g6b_u04_identify_base_quantity_role",
    "ps_g6b_u04_identify_comparison_quantity_role",
    "ps_g6b_u04_identify_rate_role",
    "ps_g6b_u04_orient_comparison_base_rate_relation"
  ]),
  allocationPolicy:"balanced_pattern_spec",visibilityStatus:"visible",holdReason:null
});
export const G6B_U04_P07F19_PATTERN_SPECS=Object.freeze([
  spec("ps_g6b_u04_identify_base_quantity_role","IDENTIFY_BASE_QUANTITY_ROLE",G6B_U04_P07F19_INCLUDED_RELATIONS[0],"BASE_QUANTITY_ROLE"),
  spec("ps_g6b_u04_identify_comparison_quantity_role","IDENTIFY_COMPARISON_QUANTITY_ROLE",G6B_U04_P07F19_INCLUDED_RELATIONS[1],"COMPARISON_QUANTITY_ROLE"),
  spec("ps_g6b_u04_identify_rate_role","IDENTIFY_RATE_ROLE",G6B_U04_P07F19_INCLUDED_RELATIONS[2],"RATE_ROLE"),
  spec("ps_g6b_u04_orient_comparison_base_rate_relation","ORIENT_RATE_RELATION",G6B_U04_P07F19_INCLUDED_RELATIONS[3],"RELATION_ORIENTATION")
]);
export const G6B_U04_P07F19_SPEC_IDS=Object.freeze(G6B_U04_P07F19_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G6B_U04_P07F19_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g6b_u04_base_comparison_rate_roles_p07f19",r04MappingId:"r04map_g6b_u04_base_comparison_rate_roles",
  sourceId:G6B_U04_P07F19_SOURCE_ID,r02EvidencePages:Object.freeze([1,2]),currentVisualSupportingPages:Object.freeze([1,2]),
  knowledgePointId:G6B_U04_P07F19_KP_ID,canonicalNameZh:"基準量比較量比率角色",capabilityStatement:"學生能辨認基準量、比較量與比率。",
  reasoningInvariant:"比較量等於基準量乘比率，分母角色固定為基準量。",
  sourceSemanticCore:"IDENTIFY_BASE_COMPARISON_RATE_ROLES_AND_DIRECTION",
  semanticAuthority:"R02_FULL_PAGE_VISUAL_READBACK_PLUS_CURRENT_DIRECT_PDF_VISUAL_CORROBORATION",
  currentVisualSupportLevel:"DIRECT_LITERAL_RATE_RELATION_ROLE_EVIDENCE",
  primaryRuntimeProfileId:"profile_ratio_percent",classificationRuleId:"rule_ratio_percent",
  appliedRuntimeModifierIds:G6B_U04_P07F19_APPLIED_MODIFIER_IDS,requiredCapabilityIds:G6B_U04_P07F19_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6B_U04_P07F19_OPTIONAL_CAPABILITY_IDS,queueRequiredW7CapabilityIds:G6B_U04_P07F19_QUEUE_REQUIRED_CAPABILITY_IDS,
  patternSpecIds:G6B_U04_P07F19_SPEC_IDS,requiredPrerequisiteKnowledgePointIds:G6B_U04_P07F19_REQUIRED_PREREQUISITE_KP_IDS,
  percentageRatePrerequisiteMayBeConsumed:true,priorKnowledgePointOwnershipMayNotBeReowned:true,
  identifyBaseQuantityRoleRequired:true,identifyComparisonQuantityRoleRequired:true,identifyRateRoleRequired:true,relationDirectionRequired:true,
  baseQuantityIsDenominatorRoleRequired:true,comparisonEqualsBaseTimesRateRelationMayBeShown:true,rateEqualsComparisonDividedByBaseRelationMayBeShown:true,
  solveForBaseQuantityAllowed:false,solveForComparisonQuantityAllowed:false,solveForRateAllowed:false,successiveRateChangeAllowed:false,
  discountInterestMultiStageComputationAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false,r04ReclassificationAllowed:false,frozenQueueMutationAllowed:false
});
export const G6B_U04_P07F19_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G6B_U04_P07F19_KP_ID,sourceId:G6B_U04_P07F19_SOURCE_ID,unitCode:G6B_U04_P07F19_UNIT_CODE,unitTitle:G6B_U04_P07F19_UNIT_TITLE,
  displayName:"基準量、比較量與比率角色",canonicalNameZh:"基準量比較量比率角色",mode:"numeric",questionMode:"numeric",questionModes:Object.freeze(["numeric"]),
  supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:"SOURCE_BACKED_ROLE_RELATION_ADMITTED",
  canonicalPatternGroupIds:Object.freeze([G6B_U04_P07F19_PATTERN_GROUP.patternGroupId]),canonicalPatternSpecIds:G6B_U04_P07F19_SPEC_IDS,
  patternGroupIds:Object.freeze([G6B_U04_P07F19_PATTERN_GROUP.patternGroupId]),patternSpecIds:G6B_U04_P07F19_SPEC_IDS,
  requiredCapabilityIds:G6B_U04_P07F19_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G6B_U04_P07F19_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P07F19_G6B_U04_BASE_COMPARISON_RATE_ROLES",productionUse:"full_product_w7_slice019_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6BU04P07F19SelectorRow=id=>id===G6B_U04_P07F19_KP_ID?clone(G6B_U04_P07F19_SELECTOR_ROW):null;
export const listG6BU04P07F19PatternGroups=id=>id===G6B_U04_P07F19_KP_ID?[clone(G6B_U04_P07F19_PATTERN_GROUP)]:[];
export const resolveG6BU04P07F19PatternSpecIds=id=>id===G6B_U04_P07F19_KP_ID?clone(G6B_U04_P07F19_SPEC_IDS):[];
export function auditG6BU04P07F19Projection(){
  const e=[];
  if(G6B_U04_P07F19_PATTERN_SPECS.length!==4||G6B_U04_P07F19_FORMAL_MAPPING.patternSpecIds.length!==4)e.push("P07F19_PATTERN_CARDINALITY_INVALID");
  if(new Set(G6B_U04_P07F19_SPEC_IDS).size!==4)e.push("P07F19_PATTERN_SPEC_DUPLICATE");
  for(const x of G6B_U04_P07F19_PATTERN_SPECS){
    if(x.questionMode!=="numeric"||x.representation!=="text_application"||x.semanticCore!=="IDENTIFY_BASE_COMPARISON_RATE_ROLES_AND_DIRECTION"||
      !x.identifyBaseQuantityRoleRequired||!x.identifyComparisonQuantityRoleRequired||!x.identifyRateRoleRequired||!x.relationDirectionRequired||!x.baseQuantityIsDenominatorRoleRequired||
      x.solveForBaseQuantityAllowed||x.solveForComparisonQuantityAllowed||x.solveForRateAllowed||x.successiveRateChangeAllowed||x.discountInterestMultiStageComputationAllowed||
      x.sameUnitMixedAllowed||x.crossUnitMixedAllowed)e.push("P07F19_PATTERN_SCOPE_INVALID:"+x.patternSpecId);
  }
  const m=G6B_U04_P07F19_FORMAL_MAPPING;
  if(m.primaryRuntimeProfileId!=="profile_ratio_percent"||m.classificationRuleId!=="rule_ratio_percent"||m.appliedRuntimeModifierIds.length!==0||
    m.requiredCapabilityIds.join("|")!==G6B_U04_P07F19_REQUIRED_CAPABILITY_IDS.join("|")||m.optionalCapabilityIds.length!==0||
    m.queueRequiredW7CapabilityIds.join("|")!==G6B_U04_P07F19_QUEUE_REQUIRED_CAPABILITY_IDS.join("|")||
    !m.identifyBaseQuantityRoleRequired||!m.identifyComparisonQuantityRoleRequired||!m.identifyRateRoleRequired||!m.relationDirectionRequired||!m.baseQuantityIsDenominatorRoleRequired||
    m.solveForBaseQuantityAllowed||m.solveForComparisonQuantityAllowed||m.solveForRateAllowed||m.successiveRateChangeAllowed||m.discountInterestMultiStageComputationAllowed||
    m.sameUnitMixedAllowed||m.crossUnitMixedAllowed||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed)e.push("P07F19_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:4,formalMappings:1})});
}
