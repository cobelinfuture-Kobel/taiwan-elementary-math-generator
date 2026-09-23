export const P06F18_TASK_ID="P06F_W6DirectProductVerticalSlice018Implementation";
export const G6A_U03_P06F18_SOURCE_ID="g6a_u03_6a03";
export const G6A_U03_P06F18_UNIT_CODE="6A-U03";
export const G6A_U03_P06F18_UNIT_TITLE="數量關係與規律問題";
export const G6A_U03_P06F18_KP_ID="kp_g6a_u03_relation_equation_unknown";
export const G6A_U03_P06F18_PREDECESSOR_KP_IDS=Object.freeze([
  "kp_g6a_u03_symbolic_quantity_relation",
  "kp_g6a_u03_geometric_count_generalization",
  "kp_g6a_u03_input_output_general_rule",
  "kp_g6a_u03_linear_pattern_nth_term"
]);
export const G6A_U03_P06F18_QUEUE_REQUIRED_CAPABILITY_IDS=Object.freeze(["cap_pattern_relation_validator","cap_pattern_sequence_reasoning"]);
export const G6A_U03_P06F18_REQUIRED_CAPABILITY_IDS=Object.freeze(["cap_pattern_sequence_reasoning","cap_pattern_relation_validator","cap_text_numeric_representation"]);
export const G6A_U03_P06F18_OPTIONAL_CAPABILITY_IDS=Object.freeze(["cap_symbolic_relation_reasoning"]);
export const G6A_U03_P06F18_INCLUDED_RELATIONS=Object.freeze(["SOLVE_RELATION_EQUATION_UNKNOWN","VERIFY_SOLVED_UNKNOWN_BY_SUBSTITUTION"]);
export const G6A_U03_P06F18_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g6a_u03_relation_equation_unknown",
  sourceId:G6A_U03_P06F18_SOURCE_ID,
  unitCode:G6A_U03_P06F18_UNIT_CODE,
  unitTitle:G6A_U03_P06F18_UNIT_TITLE,
  displayName:"數量關係列式求未知量",
  primaryKnowledgePointId:G6A_U03_P06F18_KP_ID,
  knowledgePointIds:Object.freeze([G6A_U03_P06F18_KP_ID]),
  supportClass:"A",
  mode:"numeric",
  publicQuestionMode:"numeric",
  representationTag:"text_numeric_relation_equation",
  representationTags:Object.freeze(["pattern_relation","text_numeric","relation_equation_unknown","reverse_operation","substitution_check"]),
  patternSpecIds:Object.freeze([
    "ps_g6a_u03_relation_equation_additive_unknown",
    "ps_g6a_u03_relation_equation_multiplicative_unknown"
  ]),
  allocationPolicy:"balanced_pattern_spec",
  visibilityStatus:"visible",
  holdReason:null
});
function spec(id,family,operation){
  return Object.freeze({
    patternSpecId:id,
    knowledgePointId:G6A_U03_P06F18_KP_ID,
    patternGroupId:G6A_U03_P06F18_PATTERN_GROUP.patternGroupId,
    patternFamilyId:family,
    relation:"SOLVE_RELATION_EQUATION_UNKNOWN",
    validatorRelation:"VERIFY_SOLVED_UNKNOWN_BY_SUBSTITUTION",
    semanticCore:"RELATION_EQUATION_UNKNOWN_SOLVING",
    operation,
    questionMode:"numeric",
    answerDomain:"INTEGER",
    representation:"text_numeric_relation_equation",
    requiresPatternSequenceReasoning:true,
    requiresPatternRelationValidation:true,
    requiresTextNumericRepresentation:true,
    reverseOperationRequired:true,
    substitutionBackValidationRequired:true,
    solvedUnknownMustSatisfyOriginalRelation:true,
    symbolicRelationReasoningRequired:false,
    symbolicRelationReasoningOptional:true,
    genericSymbolicQuantityRelationReownershipAllowed:false,
    geometricCountGeneralizationReownershipAllowed:false,
    inputOutputGeneralRuleReownershipAllowed:false,
    linearPatternNthTermReownershipAllowed:false,
    applicationAllowed:false,
    sameUnitMixedAllowed:false,
    crossUnitMixedAllowed:false
  });
}
export const G6A_U03_P06F18_PATTERN_SPECS=Object.freeze([
  spec("ps_g6a_u03_relation_equation_additive_unknown","RELATION_EQUATION_ADDITIVE_UNKNOWN","ADD"),
  spec("ps_g6a_u03_relation_equation_multiplicative_unknown","RELATION_EQUATION_MULTIPLICATIVE_UNKNOWN","MULTIPLY")
]);
export const G6A_U03_P06F18_SPEC_IDS=Object.freeze(G6A_U03_P06F18_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G6A_U03_P06F18_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g6a_u03_relation_equation_unknown_p06f18",
  r04MappingId:"r04map_g6a_u03_relation_equation_unknown",
  sourceId:G6A_U03_P06F18_SOURCE_ID,
  sourcePages:Object.freeze([2]),
  knowledgePointId:G6A_U03_P06F18_KP_ID,
  canonicalNameZh:"數量關係列式求未知量",
  capabilityStatement:"學生能依關係式反向運算求未知量。",
  reasoningInvariant:"解出的未知量代回原關係必須同時滿足所有條件。",
  sourceSemanticCore:"RELATION_EQUATION_UNKNOWN_SOLVING",
  primaryRuntimeProfileId:"profile_pattern_relation",
  requiredCapabilityIds:G6A_U03_P06F18_REQUIRED_CAPABILITY_IDS,
  queueRequiredW6CapabilityIds:G6A_U03_P06F18_QUEUE_REQUIRED_CAPABILITY_IDS,
  optionalRuntimeCapabilityIds:G6A_U03_P06F18_OPTIONAL_CAPABILITY_IDS,
  patternSpecIds:G6A_U03_P06F18_SPEC_IDS,
  reverseOperationFromRelationIsCore:true,
  solvedUnknownMustSatisfyOriginalRelation:true,
  substitutionBackValidationRequired:true,
  symbolicRelationReasoningPromotedToRequired:false,
  genericSymbolicQuantityRelationReownershipAllowed:false,
  geometricCountGeneralizationReownershipAllowed:false,
  inputOutputGeneralRuleReownershipAllowed:false,
  linearPatternNthTermReownershipAllowed:false,
  applicationImplementationAllowed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false,
  r04ReclassificationAllowed:false,
  q019OrLaterTouched:false
});
export const G6A_U03_P06F18_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G6A_U03_P06F18_KP_ID,
  sourceId:G6A_U03_P06F18_SOURCE_ID,
  unitCode:G6A_U03_P06F18_UNIT_CODE,
  unitTitle:G6A_U03_P06F18_UNIT_TITLE,
  displayName:"數量關係列式求未知量",
  canonicalNameZh:"數量關係列式求未知量",
  mode:"numeric",
  questionMode:"numeric",
  questionModes:Object.freeze(["numeric"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:"APPLICATION_COMPATIBLE",
  canonicalPatternGroupIds:Object.freeze([G6A_U03_P06F18_PATTERN_GROUP.patternGroupId]),
  canonicalPatternSpecIds:G6A_U03_P06F18_SPEC_IDS,
  patternGroupIds:Object.freeze([G6A_U03_P06F18_PATTERN_GROUP.patternGroupId]),
  patternSpecIds:G6A_U03_P06F18_SPEC_IDS,
  requiredCapabilityIds:G6A_U03_P06F18_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6A_U03_P06F18_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P06F18_G6A_U03_SOURCE_BACKED_RELATION_EQUATION_UNKNOWN",
  productionUse:"full_product_w6_slice018_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6AU03P06F18SelectorRow=id=>id===G6A_U03_P06F18_KP_ID?clone(G6A_U03_P06F18_SELECTOR_ROW):null;
export const listG6AU03P06F18PatternGroups=id=>id===G6A_U03_P06F18_KP_ID?[clone(G6A_U03_P06F18_PATTERN_GROUP)]:[];
export const resolveG6AU03P06F18PatternSpecIds=id=>id===G6A_U03_P06F18_KP_ID?clone(G6A_U03_P06F18_SPEC_IDS):[];
export function auditG6AU03P06F18Projection(){
  const e=[];
  if(G6A_U03_P06F18_PATTERN_SPECS.length!==2||G6A_U03_P06F18_FORMAL_MAPPING.patternSpecIds.length!==2)e.push("P06F18_PATTERN_CARDINALITY_INVALID");
  if(new Set(G6A_U03_P06F18_SPEC_IDS).size!==2)e.push("P06F18_PATTERN_SPEC_DUPLICATE");
  if(G6A_U03_P06F18_PATTERN_SPECS.some(x=>x.questionMode!=="numeric"||!x.requiresPatternSequenceReasoning||!x.requiresPatternRelationValidation||!x.requiresTextNumericRepresentation||!x.reverseOperationRequired||!x.substitutionBackValidationRequired||!x.solvedUnknownMustSatisfyOriginalRelation||x.symbolicRelationReasoningRequired||!x.symbolicRelationReasoningOptional||x.genericSymbolicQuantityRelationReownershipAllowed||x.geometricCountGeneralizationReownershipAllowed||x.inputOutputGeneralRuleReownershipAllowed||x.linearPatternNthTermReownershipAllowed||x.applicationAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed))e.push("P06F18_PATTERN_SCOPE_INVALID");
  const m=G6A_U03_P06F18_FORMAL_MAPPING;
  if(m.primaryRuntimeProfileId!=="profile_pattern_relation"||!m.reverseOperationFromRelationIsCore||!m.solvedUnknownMustSatisfyOriginalRelation||!m.substitutionBackValidationRequired||m.symbolicRelationReasoningPromotedToRequired||m.genericSymbolicQuantityRelationReownershipAllowed||m.geometricCountGeneralizationReownershipAllowed||m.inputOutputGeneralRuleReownershipAllowed||m.linearPatternNthTermReownershipAllowed||m.r04ReclassificationAllowed||m.q019OrLaterTouched)e.push("P06F18_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:2,formalMappings:1})});
}
