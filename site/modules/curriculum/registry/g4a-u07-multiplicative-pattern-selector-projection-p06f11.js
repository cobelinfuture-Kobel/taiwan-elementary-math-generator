export const P06F11_TASK_ID="P06F_W6DirectProductVerticalSlice011Implementation";
export const G4A_U07_P06F11_SOURCE_ID="g4a_u07_4a07";
export const G4A_U07_P06F11_UNIT_CODE="4A-U07";
export const G4A_U07_P06F11_UNIT_TITLE="數量關係與規律";
export const G4A_U07_P06F11_KP_ID="kp_g4a_u07_quantity_multiplicative_pattern";
export const G4A_U07_P06F11_PREDECESSOR_KP_IDS=Object.freeze([
  "kp_g4a_u07_geometric_arrangement_count",
  "kp_g4a_u07_quantity_additive_pattern",
  "kp_g4a_u07_input_output_table_rule"
]);
export const G4A_U07_P06F11_PROTECTED_FUTURE_KP_IDS=Object.freeze(["kp_g4a_u07_pattern_missing_term_reasoning"]);
export const G4A_U07_P06F11_QUEUE_REQUIRED_CAPABILITY_IDS=Object.freeze(["cap_pattern_relation_validator","cap_pattern_sequence_reasoning"]);
export const G4A_U07_P06F11_REQUIRED_CAPABILITY_IDS=Object.freeze(["cap_pattern_sequence_reasoning","cap_pattern_relation_validator","cap_text_numeric_representation"]);
export const G4A_U07_P06F11_OPTIONAL_CAPABILITY_IDS=Object.freeze(["cap_symbolic_relation_reasoning"]);
export const G4A_U07_P06F11_INCLUDED_RELATIONS=Object.freeze(["IDENTIFY_CONSTANT_MULTIPLICATIVE_FACTOR","EXTEND_FIXED_MULTIPLICATIVE_QUANTITY_PATTERN"]);
export const G4A_U07_P06F11_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g4a_u07_quantity_multiplicative_pattern",
  sourceId:G4A_U07_P06F11_SOURCE_ID,
  unitCode:G4A_U07_P06F11_UNIT_CODE,
  unitTitle:G4A_U07_P06F11_UNIT_TITLE,
  displayName:"倍數型數量規律",
  primaryKnowledgePointId:G4A_U07_P06F11_KP_ID,
  knowledgePointIds:Object.freeze([G4A_U07_P06F11_KP_ID]),
  supportClass:"A",
  mode:"numeric",
  publicQuestionMode:"numeric",
  representationTag:"text_numeric_pattern",
  representationTags:Object.freeze(["pattern","sequence","multiplicative","text_numeric"]),
  patternSpecIds:Object.freeze(["ps_g4a_u07_multiplicative_factor_identify","ps_g4a_u07_multiplicative_extend"]),
  allocationPolicy:"balanced_pattern_spec",
  visibilityStatus:"visible",
  holdReason:null
});
const spec=(id,relation,family)=>Object.freeze({
  patternSpecId:id,
  knowledgePointId:G4A_U07_P06F11_KP_ID,
  patternGroupId:G4A_U07_P06F11_PATTERN_GROUP.patternGroupId,
  patternFamilyId:family,
  relation,
  semanticCore:"FIXED_MULTIPLICATIVE_QUANTITY_PATTERN",
  questionMode:"numeric",
  answerDomain:"INTEGER",
  requiresPatternSequenceReasoning:true,
  requiresPatternRelationValidation:true,
  requiresTextNumericRepresentation:true,
  fixedMultiplicativeFactorRequired:true,
  constantAdjacentRatioRequired:true,
  multiplicativeGrowthOrShrinkAllowed:true,
  symbolicNthTermFormulaRequired:false,
  additivePatternReownershipAllowed:false,
  geometricPatternReownershipAllowed:false,
  inputOutputTableReownershipAllowed:false,
  missingTermReasoningReownershipAllowed:false,
  applicationAllowed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false
});
export const G4A_U07_P06F11_PATTERN_SPECS=Object.freeze([
  spec("ps_g4a_u07_multiplicative_factor_identify",G4A_U07_P06F11_INCLUDED_RELATIONS[0],"MULTIPLICATIVE_FACTOR_IDENTIFICATION"),
  spec("ps_g4a_u07_multiplicative_extend",G4A_U07_P06F11_INCLUDED_RELATIONS[1],"MULTIPLICATIVE_SEQUENCE_EXTENSION")
]);
export const G4A_U07_P06F11_SPEC_IDS=Object.freeze(G4A_U07_P06F11_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G4A_U07_P06F11_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g4a_u07_quantity_multiplicative_pattern_p06f11",
  r04MappingId:"r04map_g4a_u07_quantity_multiplicative_pattern",
  sourceId:G4A_U07_P06F11_SOURCE_ID,
  sourcePages:Object.freeze([1,2]),
  knowledgePointId:G4A_U07_P06F11_KP_ID,
  canonicalNameZh:"倍數型數量規律",
  capabilityStatement:"學生能辨認固定倍數成長或縮減的規律。",
  reasoningInvariant:"相鄰階段的倍率保持固定。",
  sourceSemanticCore:"FIXED_MULTIPLICATIVE_QUANTITY_PATTERN",
  primaryRuntimeProfileId:"profile_pattern_relation",
  requiredCapabilityIds:G4A_U07_P06F11_REQUIRED_CAPABILITY_IDS,
  queueRequiredW6CapabilityIds:G4A_U07_P06F11_QUEUE_REQUIRED_CAPABILITY_IDS,
  optionalRuntimeCapabilityIds:G4A_U07_P06F11_OPTIONAL_CAPABILITY_IDS,
  patternSpecIds:G4A_U07_P06F11_SPEC_IDS,
  fixedMultiplicativeFactorIsCore:true,
  adjacentStageRatioMustRemainConstant:true,
  q005PredecessorReownershipAllowed:false,
  q006PredecessorReownershipAllowed:false,
  q013FutureKpReownershipAllowed:false,
  applicationImplementationAllowed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false,
  r04ReclassificationAllowed:false,
  q012OrLaterTouched:false
});
export const G4A_U07_P06F11_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G4A_U07_P06F11_KP_ID,
  sourceId:G4A_U07_P06F11_SOURCE_ID,
  unitCode:G4A_U07_P06F11_UNIT_CODE,
  unitTitle:G4A_U07_P06F11_UNIT_TITLE,
  displayName:"倍數型數量規律",
  canonicalNameZh:"倍數型數量規律",
  mode:"numeric",
  questionMode:"numeric",
  questionModes:Object.freeze(["numeric"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:"APPLICATION_COMPATIBLE",
  canonicalPatternGroupIds:Object.freeze([G4A_U07_P06F11_PATTERN_GROUP.patternGroupId]),
  canonicalPatternSpecIds:G4A_U07_P06F11_SPEC_IDS,
  patternGroupIds:Object.freeze([G4A_U07_P06F11_PATTERN_GROUP.patternGroupId]),
  patternSpecIds:G4A_U07_P06F11_SPEC_IDS,
  requiredCapabilityIds:G4A_U07_P06F11_REQUIRED_CAPABILITY_IDS,
  qaStatusLabel:"P06F11_G4A_U07_SOURCE_BACKED_MULTIPLICATIVE_PATTERN",
  productionUse:"full_product_w6_slice011_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG4AU07P06F11SelectorRow=id=>id===G4A_U07_P06F11_KP_ID?clone(G4A_U07_P06F11_SELECTOR_ROW):null;
export const listG4AU07P06F11PatternGroups=id=>id===G4A_U07_P06F11_KP_ID?[clone(G4A_U07_P06F11_PATTERN_GROUP)]:[];
export const resolveG4AU07P06F11PatternSpecIds=id=>id===G4A_U07_P06F11_KP_ID?clone(G4A_U07_P06F11_SPEC_IDS):[];
export function auditG4AU07P06F11Projection(){
  const e=[];
  if(G4A_U07_P06F11_PATTERN_SPECS.length!==2||G4A_U07_P06F11_FORMAL_MAPPING.patternSpecIds.length!==2)e.push("P06F11_PATTERN_CARDINALITY_INVALID");
  if(new Set(G4A_U07_P06F11_SPEC_IDS).size!==2)e.push("P06F11_PATTERN_SPEC_DUPLICATE");
  if(G4A_U07_P06F11_PATTERN_SPECS.some(x=>x.questionMode!=="numeric"||!x.requiresPatternSequenceReasoning||!x.requiresPatternRelationValidation||!x.requiresTextNumericRepresentation||!x.fixedMultiplicativeFactorRequired||!x.constantAdjacentRatioRequired||!x.multiplicativeGrowthOrShrinkAllowed||x.symbolicNthTermFormulaRequired||x.additivePatternReownershipAllowed||x.geometricPatternReownershipAllowed||x.inputOutputTableReownershipAllowed||x.missingTermReasoningReownershipAllowed||x.applicationAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed))e.push("P06F11_PATTERN_INVARIANT_INVALID");
  if(G4A_U07_P06F11_FORMAL_MAPPING.primaryRuntimeProfileId!=="profile_pattern_relation"||G4A_U07_P06F11_FORMAL_MAPPING.q005PredecessorReownershipAllowed||G4A_U07_P06F11_FORMAL_MAPPING.q006PredecessorReownershipAllowed||G4A_U07_P06F11_FORMAL_MAPPING.q013FutureKpReownershipAllowed||G4A_U07_P06F11_FORMAL_MAPPING.r04ReclassificationAllowed||G4A_U07_P06F11_FORMAL_MAPPING.q012OrLaterTouched)e.push("P06F11_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:2,formalMappings:1})});
}
