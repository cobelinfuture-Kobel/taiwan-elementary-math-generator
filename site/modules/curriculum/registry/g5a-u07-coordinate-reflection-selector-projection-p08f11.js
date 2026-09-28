export const P08F11_TASK_ID="P08F_W8DirectProductVerticalSlice011Implementation";
export const G5A_U07_P08F11_SOURCE_ID="g5a_u07_5a07";
export const G5A_U07_P08F11_UNIT_CODE="5A-U07";
export const G5A_U07_P08F11_UNIT_TITLE="線對稱圖形";
export const G5A_U07_P08F11_KP_ID="kp_g5a_u07_coordinate_reflection";
export const G5A_U07_P08F11_PRIOR_KP_IDS=Object.freeze([
  "kp_g5a_u07_line_symmetry_recognition",
  "kp_g5a_u07_symmetry_axis_count",
  "kp_g5a_u07_symmetric_point_distance",
  "kp_g5a_u07_complete_symmetric_figure"
]);
export const G5A_U07_P08F11_BLOCKING_CAPABILITY_IDS=Object.freeze([
  "cap_coordinate_map_representation",
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning"
]);
export const G5A_U07_P08F11_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution",
  "cap_deterministic_answer_model",
  "cap_worksheet_document_assembly",
  "cap_answer_key_projection",
  "cap_html_print_renderer",
  "cap_geometry_property_reasoning",
  "cap_geometry_domain_validator",
  "cap_geometry_diagram_representation",
  "cap_coordinate_map_representation"
]);
export const G5A_U07_P08F11_OPTIONAL_CAPABILITY_IDS=Object.freeze(["cap_geometry_construction"]);
export const G5A_U07_P08F11_APPLIED_MODIFIER_IDS=Object.freeze(["mod_coordinate_map"]);
export const G5A_U07_P08F11_INCLUDED_RELATIONS=Object.freeze([
  "REFLECT_POINT_ACROSS_VERTICAL_AXIS",
  "REFLECT_POINT_ACROSS_HORIZONTAL_AXIS",
  "REFLECT_POINT_ACROSS_SHIFTED_GRID_AXIS"
]);
export const G5A_U07_P08F11_SPEC_IDS=Object.freeze([
  "ps_g5a_u07_coordinate_reflection_vertical_axis",
  "ps_g5a_u07_coordinate_reflection_horizontal_axis",
  "ps_g5a_u07_coordinate_reflection_shifted_axis"
]);
export const G5A_U07_P08F11_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g5a_u07_coordinate_reflection",
  sourceId:G5A_U07_P08F11_SOURCE_ID,
  unitCode:G5A_U07_P08F11_UNIT_CODE,
  unitTitle:G5A_U07_P08F11_UNIT_TITLE,
  displayName:"方格座標鏡射",
  primaryKnowledgePointId:G5A_U07_P08F11_KP_ID,
  knowledgePointIds:Object.freeze([G5A_U07_P08F11_KP_ID]),
  supportClass:"A",
  mode:"diagram",
  publicQuestionMode:"diagram",
  representationTag:"coordinate_reflection_diagram",
  representationTags:Object.freeze(["geometry","line-symmetry","coordinate","reflection","grid","diagram"]),
  patternSpecIds:G5A_U07_P08F11_SPEC_IDS,
  allocationPolicy:"balanced_pattern_spec",
  visibilityStatus:"visible",
  holdReason:null
});
function spec(patternSpecId,relation,diagramMode){
  return Object.freeze({
    patternSpecId,
    knowledgePointId:G5A_U07_P08F11_KP_ID,
    patternGroupId:G5A_U07_P08F11_PATTERN_GROUP.patternGroupId,
    patternFamilyId:"COORDINATE_REFLECTION_ACROSS_SYMMETRY_AXIS",
    semanticCore:"COORDINATE_OR_GRID_REFLECTION_ACROSS_SYMMETRY_AXIS",
    relation,
    questionMode:"diagram",
    answerDomain:"COORDINATE_PAIR_TEXT",
    representation:"coordinate_reflection_diagram",
    diagramMode,
    reflectionAxisRequired:true,
    sourceAndImagePointsRequired:true,
    perpendicularDistanceToAxisPreserved:true,
    segmentLengthsPreserved:true,
    angleMeasuresPreserved:true,
    orientationMayReverse:true,
    pointsOnAxisRemainFixed:true,
    coordinateOrGridRepresentationRequired:true,
    lineSymmetryRecognitionReownershipAllowed:false,
    symmetryAxisCountReownershipAllowed:false,
    symmetricPointDistanceStandaloneReownershipAllowed:false,
    completeSymmetricFigureReownershipAllowed:false,
    geometryConstructionAllowed:false,
    sameUnitMixedAllowed:false,
    crossUnitMixedAllowed:false
  });
}
export const G5A_U07_P08F11_PATTERN_SPECS=Object.freeze([
  spec(G5A_U07_P08F11_SPEC_IDS[0],G5A_U07_P08F11_INCLUDED_RELATIONS[0],"VERTICAL_AXIS"),
  spec(G5A_U07_P08F11_SPEC_IDS[1],G5A_U07_P08F11_INCLUDED_RELATIONS[1],"HORIZONTAL_AXIS"),
  spec(G5A_U07_P08F11_SPEC_IDS[2],G5A_U07_P08F11_INCLUDED_RELATIONS[2],"SHIFTED_AXIS")
]);
export const G5A_U07_P08F11_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g5a_u07_coordinate_reflection_p08f11",
  sourceId:G5A_U07_P08F11_SOURCE_ID,
  sourcePages:Object.freeze([1]),
  r02EvidencePages:Object.freeze([1]),
  knowledgePointId:G5A_U07_P08F11_KP_ID,
  canonicalNameZh:"方格座標鏡射",
  capabilityStatement:"學生能在方格或座標上進行線對稱映射。",
  reasoningInvariant:"鏡射保持長度與角度，只改變相對方向。",
  sourceSemanticCore:"COORDINATE_OR_GRID_REFLECTION_ACROSS_SYMMETRY_AXIS",
  primaryRuntimeProfileId:"profile_geometry_property",
  classificationRuleId:"rule_geometry_property",
  appliedRuntimeModifierIds:G5A_U07_P08F11_APPLIED_MODIFIER_IDS,
  requiredCapabilityIds:G5A_U07_P08F11_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G5A_U07_P08F11_OPTIONAL_CAPABILITY_IDS,
  blockingCapabilityIds:G5A_U07_P08F11_BLOCKING_CAPABILITY_IDS,
  patternSpecIds:G5A_U07_P08F11_SPEC_IDS,
  controlledRepresentationCarrier:"DEDICATED_COORDINATE_REFLECTION_GRID",
  priorLineSymmetryRecognitionReowned:false,
  priorSymmetryAxisCountReowned:false,
  priorSymmetricPointDistanceReowned:false,
  priorCompleteSymmetricFigureReowned:false,
  sourceLearnerFigureCopied:false,
  r04ReclassificationAllowed:false,
  frozenQueueMutationAllowed:false
});
export const G5A_U07_P08F11_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G5A_U07_P08F11_KP_ID,
  sourceId:G5A_U07_P08F11_SOURCE_ID,
  unitCode:G5A_U07_P08F11_UNIT_CODE,
  unitTitle:G5A_U07_P08F11_UNIT_TITLE,
  displayName:"方格座標鏡射",
  canonicalNameZh:"方格座標鏡射",
  mode:"diagram",
  questionMode:"diagram",
  questionModes:Object.freeze(["diagram"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:"APPLICATION_COMPATIBLE_DIAGRAM_CONTEXT_NOT_ADMITTED",
  canonicalPatternGroupIds:Object.freeze([G5A_U07_P08F11_PATTERN_GROUP.patternGroupId]),
  canonicalPatternSpecIds:G5A_U07_P08F11_SPEC_IDS,
  patternGroupIds:Object.freeze([G5A_U07_P08F11_PATTERN_GROUP.patternGroupId]),
  patternSpecIds:G5A_U07_P08F11_SPEC_IDS,
  requiredCapabilityIds:G5A_U07_P08F11_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G5A_U07_P08F11_OPTIONAL_CAPABILITY_IDS,
  appliedRuntimeModifierIds:G5A_U07_P08F11_APPLIED_MODIFIER_IDS,
  qaStatusLabel:"P08F11_G5A_U07_SOURCE_BACKED_COORDINATE_REFLECTION",
  productionUse:"full_product_w8_slice011_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export function getG5AU07P08F11SelectorRow(id){return clone(id===G5A_U07_P08F11_KP_ID?G5A_U07_P08F11_SELECTOR_ROW:null);}
export function listG5AU07P08F11PatternGroups(id){return clone(id===G5A_U07_P08F11_KP_ID?[G5A_U07_P08F11_PATTERN_GROUP]:[]);}
export function resolveG5AU07P08F11PatternSpecIds(id){return clone(id===G5A_U07_P08F11_KP_ID?G5A_U07_P08F11_SPEC_IDS:[]);}
export function auditG5AU07P08F11Projection(){
  const e=[];
  if(G5A_U07_P08F11_PATTERN_SPECS.length!==3||new Set(G5A_U07_P08F11_SPEC_IDS).size!==3)e.push("P08F11_CARDINALITY_INVALID");
  const relations=new Set(G5A_U07_P08F11_PATTERN_SPECS.map(r=>r.relation));
  for(const r of G5A_U07_P08F11_FORMAL_MAPPING.patternSpecIds)if(!G5A_U07_P08F11_SPEC_IDS.includes(r))e.push("P08F11_SPEC_IDENTITY_INVALID:"+r);
  for(const r of G5A_U07_P08F11_INCLUDED_RELATIONS)if(!relations.has(r))e.push("P08F11_RELATION_MISSING:"+r);
  if(G5A_U07_P08F11_PATTERN_SPECS.some(r=>r.questionMode!=="diagram"||r.answerDomain!=="COORDINATE_PAIR_TEXT"||!r.coordinateOrGridRepresentationRequired||r.geometryConstructionAllowed||r.sameUnitMixedAllowed||r.crossUnitMixedAllowed))e.push("P08F11_PATTERN_INVARIANT_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,diagram:3,application:0})});
}
