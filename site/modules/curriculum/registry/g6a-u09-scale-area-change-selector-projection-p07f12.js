export const P07F12_TASK_ID="P07F_W7DirectProductVerticalSlice012Implementation";
export const G6A_U09_P07F12_SOURCE_ID="g6a_u09_6a09";
export const G6A_U09_P07F12_UNIT_CODE="6A-U09";
export const G6A_U09_P07F12_UNIT_TITLE="放大圖縮圖與比例尺";
export const G6A_U09_P07F12_KP_ID="kp_g6a_u09_scale_area_change";
export const G6A_U09_P07F12_PREDECESSOR_KP_IDS=Object.freeze([
  "kp_g4b_u07_rectangle_square_area_formula",
  "kp_g6a_u09_scale_factor_length"
]);
export const G6A_U09_P07F12_PROTECTED_FUTURE_KP_IDS=Object.freeze([
  "kp_g6a_u09_similar_shape_angle",
  "kp_g6a_u09_scale_drawing_construction",
  "kp_g6a_u09_map_scale_distance"
]);
export const G6A_U09_P07F12_QUEUE_REQUIRED_CAPABILITY_IDS=Object.freeze([]);
export const G6A_U09_P07F12_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution",
  "cap_deterministic_answer_model",
  "cap_worksheet_document_assembly",
  "cap_answer_key_projection",
  "cap_html_print_renderer",
  "cap_geometry_formula_evaluation",
  "cap_geometry_domain_validator",
  "cap_geometry_diagram_representation"
]);
export const G6A_U09_P07F12_OPTIONAL_CAPABILITY_IDS=Object.freeze([]);
export const G6A_U09_P07F12_APPLIED_MODIFIER_IDS=Object.freeze([]);
export const G6A_U09_P07F12_INCLUDED_RELATIONS=Object.freeze([
  "INFER_AREA_SCALE_FACTOR_FROM_LINEAR_SCALE_FACTOR",
  "COMPUTE_SCALED_AREA_FROM_LINEAR_SCALE_FACTOR",
  "COMPARE_ORIGINAL_AND_SCALED_AREA",
  "SOLVE_SOURCE_BACKED_RECTANGLE_SCALE_AREA_APPLICATION"
]);
export const G6A_U09_P07F12_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g6a_u09_scale_area_change",
  sourceId:G6A_U09_P07F12_SOURCE_ID,
  unitCode:G6A_U09_P07F12_UNIT_CODE,
  unitTitle:G6A_U09_P07F12_UNIT_TITLE,
  displayName:"比例縮放與面積變化",
  primaryKnowledgePointId:G6A_U09_P07F12_KP_ID,
  knowledgePointIds:Object.freeze([G6A_U09_P07F12_KP_ID]),
  supportClass:"A",
  mode:"diagram",
  publicQuestionMode:"diagram",
  representationTag:"scale_area_change_diagram",
  representationTags:Object.freeze(["geometry","scale","area","rectangle","k_squared","diagram"]),
  patternSpecIds:Object.freeze([
    "ps_g6a_u09_area_factor_from_linear_factor",
    "ps_g6a_u09_scaled_area_from_linear_factor",
    "ps_g6a_u09_compare_original_scaled_area",
    "ps_g6a_u09_source_rectangle_scale_area_application"
  ]),
  allocationPolicy:"balanced_pattern_spec",
  visibilityStatus:"visible",
  holdReason:null
});
function spec(id,family,targetKind,relation,answerDomain,applicationContextAllowed=false){
  return Object.freeze({
    patternSpecId:id,
    knowledgePointId:G6A_U09_P07F12_KP_ID,
    patternGroupId:G6A_U09_P07F12_PATTERN_GROUP.patternGroupId,
    patternFamilyId:family,
    relation,
    semanticCore:"LENGTH_SCALE_FACTOR_K_IMPLIES_AREA_SCALE_FACTOR_K_SQUARED",
    targetKind,
    questionMode:"diagram",
    answerDomain,
    representation:"scale_area_change_diagram",
    requiresDiagramRepresentation:true,
    rectangleAreaFormulaPrerequisiteRequired:true,
    scaleFactorLengthPrerequisiteRequired:true,
    correspondingLinearScaleFactorRequired:true,
    areaScaleFactorEqualsSquareOfLinearScaleFactorRequired:true,
    scaleFactorMustBePositive:true,
    scaleFactorMustBeNonzero:true,
    enlargementAndReductionAllowed:true,
    deriveScaledRectangleAreaFromScaledDimensionsAllowed:true,
    inferAreaMultiplierFromLinearMultiplierAllowed:true,
    compareOriginalAndScaledAreaAllowed:true,
    q007LengthScaleFactorPrerequisiteTeachingReownershipAllowed:false,
    similarShapeAngleTeachingAllowed:false,
    scaleDrawingConstructionAllowed:false,
    mapScaleDistanceAllowed:false,
    mapScaleBarInterpretationAllowed:false,
    genericGeometryAreaFormulaReownershipAllowed:false,
    applicationContextAllowed,
    sameUnitMixedAllowed:false,
    crossUnitMixedAllowed:false
  });
}
export const G6A_U09_P07F12_PATTERN_SPECS=Object.freeze([
  spec(
    "ps_g6a_u09_area_factor_from_linear_factor",
    "AREA_FACTOR_FROM_LINEAR_FACTOR",
    "AREA_FACTOR",
    G6A_U09_P07F12_INCLUDED_RELATIONS[0],
    "POSITIVE_RATIONAL_AREA_MULTIPLIER"
  ),
  spec(
    "ps_g6a_u09_scaled_area_from_linear_factor",
    "SCALED_AREA_FROM_LINEAR_FACTOR",
    "SCALED_AREA",
    G6A_U09_P07F12_INCLUDED_RELATIONS[1],
    "POSITIVE_AREA_NUMBER"
  ),
  spec(
    "ps_g6a_u09_compare_original_scaled_area",
    "COMPARE_ORIGINAL_SCALED_AREA",
    "AREA_COMPARISON",
    G6A_U09_P07F12_INCLUDED_RELATIONS[2],
    "POSITIVE_RATIONAL_AREA_MULTIPLIER_WITH_DIRECTION"
  ),
  spec(
    "ps_g6a_u09_source_rectangle_scale_area_application",
    "SOURCE_RECTANGLE_SCALE_AREA_APPLICATION",
    "SOURCE_RECTANGLE_APPLICATION",
    G6A_U09_P07F12_INCLUDED_RELATIONS[3],
    "POSITIVE_SQUARE_CENTIMETER_AREA",
    true
  )
]);
export const G6A_U09_P07F12_SPEC_IDS=Object.freeze(G6A_U09_P07F12_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G6A_U09_P07F12_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g6a_u09_scale_area_change_p07f12",
  r04MappingId:"r04map_g6a_u09_scale_area_change",
  sourceId:G6A_U09_P07F12_SOURCE_ID,
  r02EvidencePages:Object.freeze([1]),
  currentVisualSupportingPages:Object.freeze([1]),
  currentVisualSupportLevel:"DIRECT_LITERAL_SCALE_AREA_CHANGE_APPLICATION",
  sourcePdfDriveFileId:"1qnZyEDcmOgb94BYU350cmjvUN4kESlEZ",
  sourcePdfSha256:"80ec4d8df9a4d5bf98392cf846fac7df68c49781ba60eefa78e70e9109cbbe2c",
  sourceVisibleApplication:Object.freeze({
    context:"排球場",
    actualLengthMeters:18,
    actualWidthMeters:9,
    scaleDenominator:300
  }),
  knowledgePointId:G6A_U09_P07F12_KP_ID,
  canonicalNameZh:"比例縮放與面積變化",
  capabilityStatement:"學生能判斷長度倍數對面積的平方影響。",
  reasoningInvariant:"邊長乘k時面積乘k平方。",
  sourceSemanticCore:"LENGTH_SCALE_FACTOR_K_IMPLIES_AREA_SCALE_FACTOR_K_SQUARED",
  semanticAuthority:"R02_REVIEWED_CANDIDATE_PLUS_CURRENT_DIRECT_VISUAL_SCALE_AREA_CHANGE_EVIDENCE",
  primaryRuntimeProfileId:"profile_geometry_formula",
  classificationRuleId:"rule_geometry_formula",
  appliedRuntimeModifierIds:G6A_U09_P07F12_APPLIED_MODIFIER_IDS,
  requiredCapabilityIds:G6A_U09_P07F12_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6A_U09_P07F12_OPTIONAL_CAPABILITY_IDS,
  queueRequiredW7CapabilityIds:G6A_U09_P07F12_QUEUE_REQUIRED_CAPABILITY_IDS,
  patternSpecIds:G6A_U09_P07F12_SPEC_IDS,
  requiredPrerequisiteKnowledgePointIds:G6A_U09_P07F12_PREDECESSOR_KP_IDS,
  correspondingLinearScaleFactorRequired:true,
  areaScaleFactorEqualsSquareOfLinearScaleFactorRequired:true,
  scaleFactorMustBePositive:true,
  scaleFactorMustBeNonzero:true,
  enlargementAndReductionAllowed:true,
  deriveScaledRectangleAreaFromScaledDimensionsAllowed:true,
  inferAreaMultiplierFromLinearMultiplierAllowed:true,
  compareOriginalAndScaledAreaAllowed:true,
  sourceBackedRectangleApplicationAllowed:true,
  q007LengthScaleFactorPrerequisiteTeachingReownershipAllowed:false,
  similarShapeAngleTeachingAllowed:false,
  scaleDrawingConstructionAllowed:false,
  mapScaleDistanceAllowed:false,
  mapScaleBarInterpretationAllowed:false,
  genericGeometryAreaFormulaReownershipAllowed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false,
  r04ReclassificationAllowed:false,
  frozenQueueMutationAllowed:false
});
export const G6A_U09_P07F12_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G6A_U09_P07F12_KP_ID,
  sourceId:G6A_U09_P07F12_SOURCE_ID,
  unitCode:G6A_U09_P07F12_UNIT_CODE,
  unitTitle:G6A_U09_P07F12_UNIT_TITLE,
  displayName:"比例縮放與面積變化",
  canonicalNameZh:"比例縮放與面積變化",
  mode:"diagram",
  questionMode:"diagram",
  questionModes:Object.freeze(["diagram"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:"SOURCE_BACKED_RECTANGLE_SCALE_AREA_APPLICATION_ADMITTED",
  canonicalPatternGroupIds:Object.freeze([G6A_U09_P07F12_PATTERN_GROUP.patternGroupId]),
  canonicalPatternSpecIds:G6A_U09_P07F12_SPEC_IDS,
  patternGroupIds:Object.freeze([G6A_U09_P07F12_PATTERN_GROUP.patternGroupId]),
  patternSpecIds:G6A_U09_P07F12_SPEC_IDS,
  requiredCapabilityIds:G6A_U09_P07F12_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6A_U09_P07F12_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P07F12_G6A_U09_SOURCE_BACKED_SCALE_AREA_CHANGE",
  productionUse:"full_product_w7_slice012_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6AU09P07F12SelectorRow=id=>id===G6A_U09_P07F12_KP_ID?clone(G6A_U09_P07F12_SELECTOR_ROW):null;
export const listG6AU09P07F12PatternGroups=id=>id===G6A_U09_P07F12_KP_ID?[clone(G6A_U09_P07F12_PATTERN_GROUP)]:[];
export const resolveG6AU09P07F12PatternSpecIds=id=>id===G6A_U09_P07F12_KP_ID?clone(G6A_U09_P07F12_SPEC_IDS):[];
export function auditG6AU09P07F12Projection(){
  const e=[],m=G6A_U09_P07F12_FORMAL_MAPPING;
  if(G6A_U09_P07F12_PATTERN_SPECS.length!==4||m.patternSpecIds.length!==4||new Set(G6A_U09_P07F12_SPEC_IDS).size!==4)e.push("P07F12_PATTERN_CARDINALITY_INVALID");
  if(G6A_U09_P07F12_PATTERN_SPECS.some(x=>x.questionMode!=="diagram"||x.semanticCore!=="LENGTH_SCALE_FACTOR_K_IMPLIES_AREA_SCALE_FACTOR_K_SQUARED"||!x.requiresDiagramRepresentation||!x.rectangleAreaFormulaPrerequisiteRequired||!x.scaleFactorLengthPrerequisiteRequired||!x.correspondingLinearScaleFactorRequired||!x.areaScaleFactorEqualsSquareOfLinearScaleFactorRequired||!x.scaleFactorMustBePositive||!x.scaleFactorMustBeNonzero||!x.enlargementAndReductionAllowed||!x.deriveScaledRectangleAreaFromScaledDimensionsAllowed||!x.inferAreaMultiplierFromLinearMultiplierAllowed||!x.compareOriginalAndScaledAreaAllowed||x.q007LengthScaleFactorPrerequisiteTeachingReownershipAllowed||x.similarShapeAngleTeachingAllowed||x.scaleDrawingConstructionAllowed||x.mapScaleDistanceAllowed||x.mapScaleBarInterpretationAllowed||x.genericGeometryAreaFormulaReownershipAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed))e.push("P07F12_PATTERN_SCOPE_INVALID");
  if(m.primaryRuntimeProfileId!=="profile_geometry_formula"||m.classificationRuleId!=="rule_geometry_formula"||m.appliedRuntimeModifierIds.length!==0||m.semanticAuthority!=="R02_REVIEWED_CANDIDATE_PLUS_CURRENT_DIRECT_VISUAL_SCALE_AREA_CHANGE_EVIDENCE"||m.currentVisualSupportLevel!=="DIRECT_LITERAL_SCALE_AREA_CHANGE_APPLICATION"||!m.correspondingLinearScaleFactorRequired||!m.areaScaleFactorEqualsSquareOfLinearScaleFactorRequired||!m.scaleFactorMustBePositive||!m.scaleFactorMustBeNonzero||!m.enlargementAndReductionAllowed||!m.sourceBackedRectangleApplicationAllowed||m.q007LengthScaleFactorPrerequisiteTeachingReownershipAllowed||m.similarShapeAngleTeachingAllowed||m.scaleDrawingConstructionAllowed||m.mapScaleDistanceAllowed||m.mapScaleBarInterpretationAllowed||m.genericGeometryAreaFormulaReownershipAllowed||m.sameUnitMixedAllowed||m.crossUnitMixedAllowed||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed)e.push("P07F12_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:4,formalMappings:1})});
}
