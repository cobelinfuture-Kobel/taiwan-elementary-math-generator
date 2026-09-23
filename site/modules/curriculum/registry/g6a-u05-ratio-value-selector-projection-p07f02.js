export const P07F02_TASK_ID="P07F_W7DirectProductVerticalSlice002Implementation";
export const G6A_U05_P07F02_SOURCE_ID="g6a_u05_6a05";
export const G6A_U05_P07F02_UNIT_CODE="6A-U05";
export const G6A_U05_P07F02_UNIT_TITLE="比和比值";
export const G6A_U05_P07F02_KP_ID="kp_g6a_u05_ratio_value";
export const G6A_U05_P07F02_PREDECESSOR_KP_IDS=Object.freeze(["kp_g6a_u05_ratio_notation_order"]);
export const G6A_U05_P07F02_PROTECTED_FUTURE_KP_IDS=Object.freeze([
  "kp_g6a_u05_equivalent_ratio",
  "kp_g6a_u05_simplify_ratio",
  "kp_g6a_u05_ratio_partition_application"
]);
export const G6A_U05_P07F02_QUEUE_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_ratio_percent_reasoning",
  "cap_ratio_rate_validator"
]);
export const G6A_U05_P07F02_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution",
  "cap_deterministic_answer_model",
  "cap_worksheet_document_assembly",
  "cap_answer_key_projection",
  "cap_html_print_renderer",
  "cap_ratio_percent_reasoning",
  "cap_ratio_rate_validator",
  "cap_text_application_representation"
]);
export const G6A_U05_P07F02_OPTIONAL_CAPABILITY_IDS=Object.freeze([]);
export const G6A_U05_P07F02_INCLUDED_RELATIONS=Object.freeze([
  "COMPUTE_RATIO_VALUE_AS_ANTECEDENT_DIVIDED_BY_CONSEQUENT",
  "REQUIRE_NONZERO_CONSEQUENT",
  "PRESERVE_Q001_ANTECEDENT_CONSEQUENT_ORDER",
  "PRESERVE_RATIO_VALUE_EQUIVALENCE_WITH_FRACTION_A_OVER_B"
]);
export const G6A_U05_P07F02_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g6a_u05_ratio_value",
  sourceId:G6A_U05_P07F02_SOURCE_ID,
  unitCode:G6A_U05_P07F02_UNIT_CODE,
  unitTitle:G6A_U05_P07F02_UNIT_TITLE,
  displayName:"比值",
  primaryKnowledgePointId:G6A_U05_P07F02_KP_ID,
  knowledgePointIds:Object.freeze([G6A_U05_P07F02_KP_ID]),
  supportClass:"A",
  mode:"numeric",
  publicQuestionMode:"numeric",
  representationTag:"text_numeric_ratio_value",
  representationTags:Object.freeze(["ratio","ratio_value","quotient","fraction_equivalence","text_numeric"]),
  patternSpecIds:Object.freeze([
    "ps_g6a_u05_ratio_value_fraction",
    "ps_g6a_u05_ratio_value_integer",
    "ps_g6a_u05_ratio_value_decimal"
  ]),
  allocationPolicy:"balanced_pattern_spec",
  visibilityStatus:"visible",
  holdReason:null
});
function spec(id,family,targetKind,answerDomain){
  return Object.freeze({
    patternSpecId:id,
    knowledgePointId:G6A_U05_P07F02_KP_ID,
    patternGroupId:G6A_U05_P07F02_PATTERN_GROUP.patternGroupId,
    patternFamilyId:family,
    relation:G6A_U05_P07F02_INCLUDED_RELATIONS[0],
    semanticCore:"RATIO_VALUE_EQUALS_ANTECEDENT_DIVIDED_BY_NONZERO_CONSEQUENT",
    targetKind,
    questionMode:"numeric",
    answerDomain,
    representation:"text_numeric_ratio_value",
    antecedentConsequentOrderRequired:true,
    consequentNonzeroRequired:true,
    quotientDirectionRequired:"ANTECEDENT_DIVIDED_BY_CONSEQUENT",
    fractionEquivalenceRequired:true,
    q001RatioNotationReownershipAllowed:false,
    equivalentRatioTransformationAllowed:false,
    simplestIntegerRatioTransformationAllowed:false,
    ratioPartitionApplicationAllowed:false,
    proportionCrossMultiplicationAllowed:false,
    directProportionTableOrGraphAllowed:false,
    percentConversionAllowed:false,
    applicationContextAllowed:false,
    sameUnitMixedAllowed:false,
    crossUnitMixedAllowed:false
  });
}
export const G6A_U05_P07F02_PATTERN_SPECS=Object.freeze([
  spec("ps_g6a_u05_ratio_value_fraction","RATIO_VALUE_FRACTION","FRACTION","RATIONAL_FRACTION_STRING"),
  spec("ps_g6a_u05_ratio_value_integer","RATIO_VALUE_INTEGER","INTEGER","POSITIVE_INTEGER"),
  spec("ps_g6a_u05_ratio_value_decimal","RATIO_VALUE_DECIMAL","DECIMAL","TERMINATING_DECIMAL")
]);
export const G6A_U05_P07F02_SPEC_IDS=Object.freeze(G6A_U05_P07F02_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G6A_U05_P07F02_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g6a_u05_ratio_value_p07f02",
  r04MappingId:"r04map_g6a_u05_ratio_value",
  sourceId:G6A_U05_P07F02_SOURCE_ID,
  sourcePages:Object.freeze([2]),
  r02EvidencePages:Object.freeze([2]),
  knowledgePointId:G6A_U05_P07F02_KP_ID,
  canonicalNameZh:"比值",
  capabilityStatement:"學生能以比的前項除以後項求比值。",
  reasoningInvariant:"後項不得為0，比值與分數a除以b等價。",
  sourceSemanticCore:"RATIO_VALUE_EQUALS_ANTECEDENT_DIVIDED_BY_NONZERO_CONSEQUENT",
  primaryRuntimeProfileId:"profile_ratio_percent",
  classificationRuleId:"rule_ratio_percent",
  appliedRuntimeModifierIds:Object.freeze([]),
  requiredCapabilityIds:G6A_U05_P07F02_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6A_U05_P07F02_OPTIONAL_CAPABILITY_IDS,
  queueRequiredW7CapabilityIds:G6A_U05_P07F02_QUEUE_REQUIRED_CAPABILITY_IDS,
  patternSpecIds:G6A_U05_P07F02_SPEC_IDS,
  q001OrderedAntecedentConsequentRolesRemainPrerequisite:true,
  ratioValueOperation:"ANTECEDENT_DIVIDED_BY_CONSEQUENT",
  consequentMustBeNonZero:true,
  fractionEquivalenceAOverBRequired:true,
  q001RatioNotationTeachingReownershipAllowed:false,
  equivalentRatioTransformationAllowed:false,
  simplestIntegerRatioTransformationAllowed:false,
  ratioPartitionApplicationAllowed:false,
  proportionCrossMultiplicationAllowed:false,
  directProportionTableOrGraphAllowed:false,
  percentConversionAllowed:false,
  applicationContextAllowed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false,
  r04ReclassificationAllowed:false,
  frozenQueueMutationAllowed:false
});
export const G6A_U05_P07F02_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G6A_U05_P07F02_KP_ID,
  sourceId:G6A_U05_P07F02_SOURCE_ID,
  unitCode:G6A_U05_P07F02_UNIT_CODE,
  unitTitle:G6A_U05_P07F02_UNIT_TITLE,
  displayName:"比值",
  canonicalNameZh:"比值",
  mode:"numeric",
  questionMode:"numeric",
  questionModes:Object.freeze(["numeric"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:"APPLICATION_COMPATIBLE",
  canonicalPatternGroupIds:Object.freeze([G6A_U05_P07F02_PATTERN_GROUP.patternGroupId]),
  canonicalPatternSpecIds:G6A_U05_P07F02_SPEC_IDS,
  patternGroupIds:Object.freeze([G6A_U05_P07F02_PATTERN_GROUP.patternGroupId]),
  patternSpecIds:G6A_U05_P07F02_SPEC_IDS,
  requiredCapabilityIds:G6A_U05_P07F02_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6A_U05_P07F02_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P07F02_G6A_U05_SOURCE_BACKED_RATIO_VALUE",
  productionUse:"full_product_w7_slice002_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6AU05P07F02SelectorRow=id=>id===G6A_U05_P07F02_KP_ID?clone(G6A_U05_P07F02_SELECTOR_ROW):null;
export const listG6AU05P07F02PatternGroups=id=>id===G6A_U05_P07F02_KP_ID?[clone(G6A_U05_P07F02_PATTERN_GROUP)]:[];
export const resolveG6AU05P07F02PatternSpecIds=id=>id===G6A_U05_P07F02_KP_ID?clone(G6A_U05_P07F02_SPEC_IDS):[];
export function auditG6AU05P07F02Projection(){
  const e=[];
  if(G6A_U05_P07F02_PATTERN_SPECS.length!==3||G6A_U05_P07F02_FORMAL_MAPPING.patternSpecIds.length!==3)e.push("P07F02_PATTERN_CARDINALITY_INVALID");
  if(new Set(G6A_U05_P07F02_SPEC_IDS).size!==3)e.push("P07F02_PATTERN_SPEC_DUPLICATE");
  if(G6A_U05_P07F02_PATTERN_SPECS.some(x=>x.questionMode!=="numeric"||x.semanticCore!=="RATIO_VALUE_EQUALS_ANTECEDENT_DIVIDED_BY_NONZERO_CONSEQUENT"||!x.antecedentConsequentOrderRequired||!x.consequentNonzeroRequired||x.quotientDirectionRequired!=="ANTECEDENT_DIVIDED_BY_CONSEQUENT"||!x.fractionEquivalenceRequired||x.q001RatioNotationReownershipAllowed||x.equivalentRatioTransformationAllowed||x.simplestIntegerRatioTransformationAllowed||x.ratioPartitionApplicationAllowed||x.proportionCrossMultiplicationAllowed||x.directProportionTableOrGraphAllowed||x.percentConversionAllowed||x.applicationContextAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed))e.push("P07F02_PATTERN_SCOPE_INVALID");
  const m=G6A_U05_P07F02_FORMAL_MAPPING;
  if(m.primaryRuntimeProfileId!=="profile_ratio_percent"||m.classificationRuleId!=="rule_ratio_percent"||m.appliedRuntimeModifierIds.length!==0||!m.q001OrderedAntecedentConsequentRolesRemainPrerequisite||m.ratioValueOperation!=="ANTECEDENT_DIVIDED_BY_CONSEQUENT"||!m.consequentMustBeNonZero||!m.fractionEquivalenceAOverBRequired||m.q001RatioNotationTeachingReownershipAllowed||m.equivalentRatioTransformationAllowed||m.simplestIntegerRatioTransformationAllowed||m.ratioPartitionApplicationAllowed||m.proportionCrossMultiplicationAllowed||m.directProportionTableOrGraphAllowed||m.percentConversionAllowed||m.applicationContextAllowed||m.sameUnitMixedAllowed||m.crossUnitMixedAllowed||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed)e.push("P07F02_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1})});
}
