export const P07F07_TASK_ID="P07F_W7DirectProductVerticalSlice007Implementation";
export const G6A_U09_P07F07_SOURCE_ID="g6a_u09_6a09";
export const G6A_U09_P07F07_UNIT_CODE="6A-U09";
export const G6A_U09_P07F07_UNIT_TITLE="放大圖縮圖與比例尺";
export const G6A_U09_P07F07_KP_ID="kp_g6a_u09_scale_factor_length";
export const G6A_U09_P07F07_PREDECESSOR_KP_IDS=Object.freeze(["kp_g6a_u05_equivalent_ratio"]);
export const G6A_U09_P07F07_PROTECTED_FUTURE_KP_IDS=Object.freeze([
  "kp_g6a_u09_similar_shape_angle",
  "kp_g6a_u09_scale_drawing_construction",
  "kp_g6a_u09_map_scale_distance",
  "kp_g6a_u09_scale_area_change"
]);
export const G6A_U09_P07F07_QUEUE_REQUIRED_CAPABILITY_IDS=Object.freeze([]);
export const G6A_U09_P07F07_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution",
  "cap_deterministic_answer_model",
  "cap_worksheet_document_assembly",
  "cap_answer_key_projection",
  "cap_html_print_renderer",
  "cap_quantity_dimension_unit_identity",
  "cap_quantity_domain_validator",
  "cap_text_numeric_representation"
]);
export const G6A_U09_P07F07_OPTIONAL_CAPABILITY_IDS=Object.freeze(["cap_scale_instrument_representation"]);
export const G6A_U09_P07F07_APPLIED_MODIFIER_IDS=Object.freeze([]);
export const G6A_U09_P07F07_INCLUDED_RELATIONS=Object.freeze([
  "INFER_SCALE_FACTOR_FROM_CORRESPONDING_LENGTH_PAIR",
  "COMPUTE_CORRESPONDING_LENGTH_BY_COMMON_SCALE_FACTOR",
  "VERIFY_COMMON_SCALE_FACTOR_ACROSS_CORRESPONDING_LENGTHS",
  "CLASSIFY_ENLARGEMENT_OR_REDUCTION_FROM_POSITIVE_SCALE_FACTOR"
]);
export const G6A_U09_P07F07_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g6a_u09_scale_factor_length",
  sourceId:G6A_U09_P07F07_SOURCE_ID,
  unitCode:G6A_U09_P07F07_UNIT_CODE,
  unitTitle:G6A_U09_P07F07_UNIT_TITLE,
  displayName:"放大縮小倍數與邊長",
  primaryKnowledgePointId:G6A_U09_P07F07_KP_ID,
  knowledgePointIds:Object.freeze([G6A_U09_P07F07_KP_ID]),
  supportClass:"A",
  mode:"numeric",
  publicQuestionMode:"numeric",
  representationTag:"text_numeric_scale_factor_length",
  representationTags:Object.freeze(["quantity","length","scale_factor","corresponding_length","numeric"]),
  patternSpecIds:Object.freeze([
    "ps_g6a_u09_scale_factor_from_pair",
    "ps_g6a_u09_target_length_from_factor",
    "ps_g6a_u09_common_factor_missing_length"
  ]),
  allocationPolicy:"balanced_pattern_spec",
  visibilityStatus:"visible",
  holdReason:null
});
function spec(id,family,targetKind){
  return Object.freeze({
    patternSpecId:id,
    knowledgePointId:G6A_U09_P07F07_KP_ID,
    patternGroupId:G6A_U09_P07F07_PATTERN_GROUP.patternGroupId,
    patternFamilyId:family,
    relation:targetKind==="INFER_FACTOR"?G6A_U09_P07F07_INCLUDED_RELATIONS[0]:targetKind==="TARGET_LENGTH"?G6A_U09_P07F07_INCLUDED_RELATIONS[1]:G6A_U09_P07F07_INCLUDED_RELATIONS[2],
    semanticCore:"CORRESPONDING_LENGTHS_SHARE_ONE_POSITIVE_NONZERO_SCALE_FACTOR",
    targetKind,
    questionMode:"numeric",
    answerDomain:targetKind==="INFER_FACTOR"?"POSITIVE_RATIONAL_SCALE_FACTOR":"POSITIVE_LENGTH_NUMBER",
    representation:"text_numeric_scale_factor_length",
    equivalentRatioPrerequisiteRequired:true,
    correspondingLengthRolesRequired:true,
    oneCommonScaleFactorAcrossAllCorrespondingLengthsRequired:true,
    scaleFactorMustBePositive:true,
    scaleFactorMustBeNonzero:true,
    enlargementFactorGreaterThanOneAllowed:true,
    reductionFactorBetweenZeroAndOneAllowed:true,
    scaleFactorMayBeFractionOrDecimal:true,
    computeTargetLengthFromKnownCorrespondingLengthAndScaleFactorAllowed:true,
    inferScaleFactorFromOneCorrespondingLengthPairAllowed:true,
    verifySameScaleFactorAcrossMultipleCorrespondingLengthPairsAllowed:true,
    sameUnitLengthPairOnlyForInitialGenerator:true,
    unitConversionAllowed:false,
    anglePreservationTeachingAllowed:false,
    scaleDrawingConstructionAllowed:false,
    mapScaleDistanceAllowed:false,
    scaleAreaChangeAllowed:false,
    mapScaleBarInterpretationAllowed:false,
    applicationContextAllowed:false,
    sameUnitMixedAllowed:false,
    crossUnitMixedAllowed:false
  });
}
export const G6A_U09_P07F07_PATTERN_SPECS=Object.freeze([
  spec("ps_g6a_u09_scale_factor_from_pair","SCALE_FACTOR_FROM_CORRESPONDING_PAIR","INFER_FACTOR"),
  spec("ps_g6a_u09_target_length_from_factor","TARGET_LENGTH_FROM_SCALE_FACTOR","TARGET_LENGTH"),
  spec("ps_g6a_u09_common_factor_missing_length","COMMON_FACTOR_ACROSS_LENGTH_PAIRS","COMMON_FACTOR")
]);
export const G6A_U09_P07F07_SPEC_IDS=Object.freeze(G6A_U09_P07F07_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G6A_U09_P07F07_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g6a_u09_scale_factor_length_p07f07",
  r04MappingId:"r04map_g6a_u09_scale_factor_length",
  sourceId:G6A_U09_P07F07_SOURCE_ID,
  r02EvidencePages:Object.freeze([1]),
  currentVisualSupportingPages:Object.freeze([1]),
  knowledgePointId:G6A_U09_P07F07_KP_ID,
  canonicalNameZh:"放大縮小倍數與邊長",
  capabilityStatement:"學生能依比例倍數求對應邊長。",
  reasoningInvariant:"所有對應長度必須乘同一非零比例因子。",
  sourceSemanticCore:"CORRESPONDING_LENGTHS_SHARE_ONE_POSITIVE_NONZERO_SCALE_FACTOR",
  semanticAuthority:"R02_REVIEWED_CANDIDATE_PLUS_CURRENT_DIRECT_VISUAL_LENGTH_SCALE_FACTOR_EVIDENCE",
  currentVisualSupportLevel:"DIRECT_LITERAL_SCALE_FACTOR_LENGTH_RELATION",
  currentVisualCorrespondingLengthPairs:Object.freeze([
    Object.freeze({redLength:12,blueLength:8}),
    Object.freeze({redLength:6,blueLength:4})
  ]),
  primaryRuntimeProfileId:"profile_quantity_measurement",
  classificationRuleId:"rule_quantity_measurement",
  appliedRuntimeModifierIds:G6A_U09_P07F07_APPLIED_MODIFIER_IDS,
  requiredCapabilityIds:G6A_U09_P07F07_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6A_U09_P07F07_OPTIONAL_CAPABILITY_IDS,
  queueRequiredW7CapabilityIds:G6A_U09_P07F07_QUEUE_REQUIRED_CAPABILITY_IDS,
  patternSpecIds:G6A_U09_P07F07_SPEC_IDS,
  equivalentRatioPrerequisiteRequired:true,
  oneCommonScaleFactorAcrossAllCorrespondingLengthsRequired:true,
  scaleFactorMustBePositive:true,
  scaleFactorMustBeNonzero:true,
  sameUnitLengthPairOnlyForInitialGenerator:true,
  unitConversionAllowed:false,
  anglePreservationTeachingAllowed:false,
  scaleDrawingConstructionAllowed:false,
  mapScaleDistanceAllowed:false,
  scaleAreaChangeAllowed:false,
  mapScaleBarInterpretationAllowed:false,
  applicationContextAllowed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false,
  r04ReclassificationAllowed:false,
  frozenQueueMutationAllowed:false
});
export const G6A_U09_P07F07_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G6A_U09_P07F07_KP_ID,
  sourceId:G6A_U09_P07F07_SOURCE_ID,
  unitCode:G6A_U09_P07F07_UNIT_CODE,
  unitTitle:G6A_U09_P07F07_UNIT_TITLE,
  displayName:"放大縮小倍數與邊長",
  canonicalNameZh:"放大縮小倍數與邊長",
  mode:"numeric",
  questionMode:"numeric",
  questionModes:Object.freeze(["numeric"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:"LENGTH_SCALE_FACTOR_ONLY_APPLICATION_NOT_ADMITTED",
  canonicalPatternGroupIds:Object.freeze([G6A_U09_P07F07_PATTERN_GROUP.patternGroupId]),
  canonicalPatternSpecIds:G6A_U09_P07F07_SPEC_IDS,
  patternGroupIds:Object.freeze([G6A_U09_P07F07_PATTERN_GROUP.patternGroupId]),
  patternSpecIds:G6A_U09_P07F07_SPEC_IDS,
  requiredCapabilityIds:G6A_U09_P07F07_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6A_U09_P07F07_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P07F07_G6A_U09_SOURCE_BACKED_SCALE_FACTOR_LENGTH",
  productionUse:"full_product_w7_slice007_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6AU09P07F07SelectorRow=id=>id===G6A_U09_P07F07_KP_ID?clone(G6A_U09_P07F07_SELECTOR_ROW):null;
export const listG6AU09P07F07PatternGroups=id=>id===G6A_U09_P07F07_KP_ID?[clone(G6A_U09_P07F07_PATTERN_GROUP)]:[];
export const resolveG6AU09P07F07PatternSpecIds=id=>id===G6A_U09_P07F07_KP_ID?clone(G6A_U09_P07F07_SPEC_IDS):[];
export function auditG6AU09P07F07Projection(){
  const e=[];
  if(G6A_U09_P07F07_PATTERN_SPECS.length!==3||G6A_U09_P07F07_FORMAL_MAPPING.patternSpecIds.length!==3)e.push("P07F07_PATTERN_CARDINALITY_INVALID");
  if(new Set(G6A_U09_P07F07_SPEC_IDS).size!==3)e.push("P07F07_PATTERN_SPEC_DUPLICATE");
  if(G6A_U09_P07F07_PATTERN_SPECS.some(x=>x.questionMode!=="numeric"||x.semanticCore!=="CORRESPONDING_LENGTHS_SHARE_ONE_POSITIVE_NONZERO_SCALE_FACTOR"||!x.equivalentRatioPrerequisiteRequired||!x.correspondingLengthRolesRequired||!x.oneCommonScaleFactorAcrossAllCorrespondingLengthsRequired||!x.scaleFactorMustBePositive||!x.scaleFactorMustBeNonzero||!x.enlargementFactorGreaterThanOneAllowed||!x.reductionFactorBetweenZeroAndOneAllowed||!x.scaleFactorMayBeFractionOrDecimal||!x.computeTargetLengthFromKnownCorrespondingLengthAndScaleFactorAllowed||!x.inferScaleFactorFromOneCorrespondingLengthPairAllowed||!x.verifySameScaleFactorAcrossMultipleCorrespondingLengthPairsAllowed||!x.sameUnitLengthPairOnlyForInitialGenerator||x.unitConversionAllowed||x.anglePreservationTeachingAllowed||x.scaleDrawingConstructionAllowed||x.mapScaleDistanceAllowed||x.scaleAreaChangeAllowed||x.mapScaleBarInterpretationAllowed||x.applicationContextAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed))e.push("P07F07_PATTERN_SCOPE_INVALID");
  const m=G6A_U09_P07F07_FORMAL_MAPPING;
  if(m.primaryRuntimeProfileId!=="profile_quantity_measurement"||m.classificationRuleId!=="rule_quantity_measurement"||m.appliedRuntimeModifierIds.length!==0||m.semanticAuthority!=="R02_REVIEWED_CANDIDATE_PLUS_CURRENT_DIRECT_VISUAL_LENGTH_SCALE_FACTOR_EVIDENCE"||m.currentVisualSupportLevel!=="DIRECT_LITERAL_SCALE_FACTOR_LENGTH_RELATION"||!m.equivalentRatioPrerequisiteRequired||!m.oneCommonScaleFactorAcrossAllCorrespondingLengthsRequired||!m.scaleFactorMustBePositive||!m.scaleFactorMustBeNonzero||!m.sameUnitLengthPairOnlyForInitialGenerator||m.unitConversionAllowed||m.anglePreservationTeachingAllowed||m.scaleDrawingConstructionAllowed||m.mapScaleDistanceAllowed||m.scaleAreaChangeAllowed||m.mapScaleBarInterpretationAllowed||m.applicationContextAllowed||m.sameUnitMixedAllowed||m.crossUnitMixedAllowed||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed)e.push("P07F07_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1})});
}
