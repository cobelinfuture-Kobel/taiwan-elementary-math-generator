export const P07F01_TASK_ID="P07F_W7DirectProductVerticalSlice001Implementation";
export const G6A_U05_P07F01_SOURCE_ID="g6a_u05_6a05";
export const G6A_U05_P07F01_UNIT_CODE="6A-U05";
export const G6A_U05_P07F01_UNIT_TITLE="比和比值";
export const G6A_U05_P07F01_KP_ID="kp_g6a_u05_ratio_notation_order";
export const G6A_U05_P07F01_PROTECTED_FUTURE_KP_IDS=Object.freeze([
  "kp_g6a_u05_ratio_value",
  "kp_g6a_u05_equivalent_ratio",
  "kp_g6a_u05_simplify_ratio",
  "kp_g6a_u05_ratio_partition_application"
]);
export const G6A_U05_P07F01_QUEUE_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_ratio_percent_reasoning",
  "cap_ratio_rate_validator"
]);
export const G6A_U05_P07F01_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution",
  "cap_deterministic_answer_model",
  "cap_worksheet_document_assembly",
  "cap_answer_key_projection",
  "cap_html_print_renderer",
  "cap_ratio_percent_reasoning",
  "cap_ratio_rate_validator",
  "cap_text_application_representation"
]);
export const G6A_U05_P07F01_OPTIONAL_CAPABILITY_IDS=Object.freeze([]);
export const G6A_U05_P07F01_INCLUDED_RELATIONS=Object.freeze([
  "WRITE_ORDERED_RATIO_A_TO_B_AS_A_COLON_B",
  "IDENTIFY_ANTECEDENT_AS_FIRST_TERM",
  "IDENTIFY_CONSEQUENT_AS_SECOND_TERM",
  "PRESERVE_ROLE_ORDER_BETWEEN_CONTEXT_AND_RATIO_NOTATION"
]);
export const G6A_U05_P07F01_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g6a_u05_ratio_notation_order",
  sourceId:G6A_U05_P07F01_SOURCE_ID,
  unitCode:G6A_U05_P07F01_UNIT_CODE,
  unitTitle:G6A_U05_P07F01_UNIT_TITLE,
  displayName:"比的記法與順序",
  primaryKnowledgePointId:G6A_U05_P07F01_KP_ID,
  knowledgePointIds:Object.freeze([G6A_U05_P07F01_KP_ID]),
  supportClass:"A",
  mode:"numeric",
  publicQuestionMode:"numeric",
  representationTag:"text_numeric_ratio_notation",
  representationTags:Object.freeze(["ratio","ordered_relation","antecedent","consequent","colon_notation","text_numeric"]),
  patternSpecIds:Object.freeze([
    "ps_g6a_u05_ratio_notation_write",
    "ps_g6a_u05_ratio_notation_antecedent",
    "ps_g6a_u05_ratio_notation_consequent"
  ]),
  allocationPolicy:"balanced_pattern_spec",
  visibilityStatus:"visible",
  holdReason:null
});
function spec(id,family,targetKind,relation){
  return Object.freeze({
    patternSpecId:id,
    knowledgePointId:G6A_U05_P07F01_KP_ID,
    patternGroupId:G6A_U05_P07F01_PATTERN_GROUP.patternGroupId,
    patternFamilyId:family,
    relation,
    semanticCore:"ORDERED_RATIO_NOTATION_WITH_FIXED_ANTECEDENT_CONSEQUENT_ROLES",
    targetKind,
    questionMode:"numeric",
    answerDomain:targetKind==="RATIO_NOTATION"?"RATIO_NOTATION_STRING":"POSITIVE_INTEGER_TERM",
    representation:"text_numeric_ratio_notation",
    orderedRatioRequired:true,
    antecedentFirstRequired:true,
    consequentSecondRequired:true,
    swappingTermsChangesRelation:true,
    roleOrderPreservationRequired:true,
    ratioValueComputationAllowed:false,
    equivalentRatioTransformationAllowed:false,
    simplestIntegerRatioTransformationAllowed:false,
    ratioPartitionApplicationAllowed:false,
    proportionCrossMultiplicationAllowed:false,
    percentConversionAllowed:false,
    applicationContextAllowed:false,
    sameUnitMixedAllowed:false,
    crossUnitMixedAllowed:false
  });
}
export const G6A_U05_P07F01_PATTERN_SPECS=Object.freeze([
  spec("ps_g6a_u05_ratio_notation_write","RATIO_NOTATION_WRITE","RATIO_NOTATION",G6A_U05_P07F01_INCLUDED_RELATIONS[0]),
  spec("ps_g6a_u05_ratio_notation_antecedent","RATIO_NOTATION_ANTECEDENT","ANTECEDENT",G6A_U05_P07F01_INCLUDED_RELATIONS[1]),
  spec("ps_g6a_u05_ratio_notation_consequent","RATIO_NOTATION_CONSEQUENT","CONSEQUENT",G6A_U05_P07F01_INCLUDED_RELATIONS[2])
]);
export const G6A_U05_P07F01_SPEC_IDS=Object.freeze(G6A_U05_P07F01_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G6A_U05_P07F01_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g6a_u05_ratio_notation_order_p07f01",
  r04MappingId:"r04map_g6a_u05_ratio_notation_order",
  sourceId:G6A_U05_P07F01_SOURCE_ID,
  sourcePages:Object.freeze([1]),
  r02EvidencePages:Object.freeze([1]),
  knowledgePointId:G6A_U05_P07F01_KP_ID,
  canonicalNameZh:"比的記法與順序",
  capabilityStatement:"學生能以a比b表示兩量順序關係。",
  reasoningInvariant:"前項與後項角色固定，交換會改變比。",
  sourceSemanticCore:"ORDERED_RATIO_NOTATION_WITH_FIXED_ANTECEDENT_CONSEQUENT_ROLES",
  primaryRuntimeProfileId:"profile_ratio_percent",
  classificationRuleId:"rule_ratio_percent",
  appliedRuntimeModifierIds:Object.freeze([]),
  requiredCapabilityIds:G6A_U05_P07F01_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6A_U05_P07F01_OPTIONAL_CAPABILITY_IDS,
  queueRequiredW7CapabilityIds:G6A_U05_P07F01_QUEUE_REQUIRED_CAPABILITY_IDS,
  patternSpecIds:G6A_U05_P07F01_SPEC_IDS,
  ratioNotationIsOrdered:true,
  antecedentRoleMustRemainFirst:true,
  consequentRoleMustRemainSecond:true,
  swappingTermsChangesTheRatioRelation:true,
  colonNotationAndVerbalReadingMustPreserveRoleOrder:true,
  ratioValueComputationReownershipAllowed:false,
  equivalentRatioReownershipAllowed:false,
  simplestIntegerRatioReownershipAllowed:false,
  ratioPartitionApplicationReownershipAllowed:false,
  proportionCrossMultiplicationReownershipAllowed:false,
  percentConversionReownershipAllowed:false,
  applicationContextAllowed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false,
  r04ReclassificationAllowed:false,
  frozenQueueMutationAllowed:false
});
export const G6A_U05_P07F01_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G6A_U05_P07F01_KP_ID,
  sourceId:G6A_U05_P07F01_SOURCE_ID,
  unitCode:G6A_U05_P07F01_UNIT_CODE,
  unitTitle:G6A_U05_P07F01_UNIT_TITLE,
  displayName:"比的記法與順序",
  canonicalNameZh:"比的記法與順序",
  mode:"numeric",
  questionMode:"numeric",
  questionModes:Object.freeze(["numeric"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:"APPLICATION_COMPATIBLE",
  canonicalPatternGroupIds:Object.freeze([G6A_U05_P07F01_PATTERN_GROUP.patternGroupId]),
  canonicalPatternSpecIds:G6A_U05_P07F01_SPEC_IDS,
  patternGroupIds:Object.freeze([G6A_U05_P07F01_PATTERN_GROUP.patternGroupId]),
  patternSpecIds:G6A_U05_P07F01_SPEC_IDS,
  requiredCapabilityIds:G6A_U05_P07F01_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6A_U05_P07F01_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P07F01_G6A_U05_SOURCE_BACKED_RATIO_NOTATION_ORDER",
  productionUse:"full_product_w7_slice001_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6AU05P07F01SelectorRow=id=>id===G6A_U05_P07F01_KP_ID?clone(G6A_U05_P07F01_SELECTOR_ROW):null;
export const listG6AU05P07F01PatternGroups=id=>id===G6A_U05_P07F01_KP_ID?[clone(G6A_U05_P07F01_PATTERN_GROUP)]:[];
export const resolveG6AU05P07F01PatternSpecIds=id=>id===G6A_U05_P07F01_KP_ID?clone(G6A_U05_P07F01_SPEC_IDS):[];
export function auditG6AU05P07F01Projection(){
  const e=[];
  if(G6A_U05_P07F01_PATTERN_SPECS.length!==3||G6A_U05_P07F01_FORMAL_MAPPING.patternSpecIds.length!==3)e.push("P07F01_PATTERN_CARDINALITY_INVALID");
  if(new Set(G6A_U05_P07F01_SPEC_IDS).size!==3)e.push("P07F01_PATTERN_SPEC_DUPLICATE");
  if(G6A_U05_P07F01_PATTERN_SPECS.some(x=>x.questionMode!=="numeric"||x.semanticCore!=="ORDERED_RATIO_NOTATION_WITH_FIXED_ANTECEDENT_CONSEQUENT_ROLES"||!x.orderedRatioRequired||!x.antecedentFirstRequired||!x.consequentSecondRequired||!x.swappingTermsChangesRelation||!x.roleOrderPreservationRequired||x.ratioValueComputationAllowed||x.equivalentRatioTransformationAllowed||x.simplestIntegerRatioTransformationAllowed||x.ratioPartitionApplicationAllowed||x.proportionCrossMultiplicationAllowed||x.percentConversionAllowed||x.applicationContextAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed))e.push("P07F01_PATTERN_SCOPE_INVALID");
  const m=G6A_U05_P07F01_FORMAL_MAPPING;
  if(m.primaryRuntimeProfileId!=="profile_ratio_percent"||m.classificationRuleId!=="rule_ratio_percent"||m.appliedRuntimeModifierIds.length!==0||!m.ratioNotationIsOrdered||!m.antecedentRoleMustRemainFirst||!m.consequentRoleMustRemainSecond||!m.swappingTermsChangesTheRatioRelation||!m.colonNotationAndVerbalReadingMustPreserveRoleOrder||m.ratioValueComputationReownershipAllowed||m.equivalentRatioReownershipAllowed||m.simplestIntegerRatioReownershipAllowed||m.ratioPartitionApplicationReownershipAllowed||m.proportionCrossMultiplicationReownershipAllowed||m.percentConversionReownershipAllowed||m.applicationContextAllowed||m.sameUnitMixedAllowed||m.crossUnitMixedAllowed||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed)e.push("P07F01_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1})});
}
