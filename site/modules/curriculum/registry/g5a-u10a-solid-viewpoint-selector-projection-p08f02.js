export const P08F02_TASK_ID="P08F_W8DirectProductVerticalSlice002Implementation";
export const G5A_U10A_P08F02_SOURCE_ID="g5a_u10_5a10a";
export const G5A_U10A_P08F02_UNIT_CODE="5A-U10A";
export const G5A_U10A_P08F02_UNIT_TITLE="柱體錐體和球";
export const G5A_U10A_P08F02_KP_ID="kp_g5a_u10a_solid_viewpoint_representation";
export const G5A_U10A_P08F02_PROTECTED_FUTURE_KP_IDS=Object.freeze([
  "kp_g5a_u10a_solid_shape_classification",
  "kp_g5a_u10a_prism_pyramid_elements",
  "kp_g5a_u10a_solid_net_correspondence",
  "kp_g5a_u10a_solid_cross_section"
]);
export const G5A_U10A_P08F02_BLOCKING_CAPABILITY_IDS=Object.freeze([
  "cap_coordinate_map_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
  "cap_solid_geometry_representation",
  "cap_spatial_solid_reasoning"
]);
export const G5A_U10A_P08F02_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution",
  "cap_deterministic_answer_model",
  "cap_worksheet_document_assembly",
  "cap_answer_key_projection",
  "cap_html_print_renderer",
  "cap_spatial_solid_reasoning",
  "cap_geometry_property_reasoning",
  "cap_geometry_domain_validator",
  "cap_solid_geometry_representation",
  "cap_coordinate_map_representation"
]);
export const G5A_U10A_P08F02_OPTIONAL_CAPABILITY_IDS=Object.freeze(["cap_geometry_construction"]);
export const G5A_U10A_P08F02_APPLIED_MODIFIER_IDS=Object.freeze(["mod_coordinate_map"]);
export const G5A_U10A_P08F02_INCLUDED_RELATIONS=Object.freeze([
  "TURN_VISIBLE_SIDE_TO_FRONT",
  "TRACK_FRONT_FACE_AFTER_QUARTER_TURN",
  "COMPLETE_ROTATED_VIEW_FACE_LABEL"
]);
export const G5A_U10A_P08F02_SPEC_IDS=Object.freeze([
  "ps_g5a_u10a_viewpoint_turn_side_to_front",
  "ps_g5a_u10a_viewpoint_track_front_face",
  "ps_g5a_u10a_viewpoint_complete_rotated_view"
]);
export const G5A_U10A_P08F02_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g5a_u10a_solid_viewpoint_representation",
  sourceId:G5A_U10A_P08F02_SOURCE_ID,
  unitCode:G5A_U10A_P08F02_UNIT_CODE,
  unitTitle:G5A_U10A_P08F02_UNIT_TITLE,
  displayName:"立體視圖與位置",
  primaryKnowledgePointId:G5A_U10A_P08F02_KP_ID,
  knowledgePointIds:Object.freeze([G5A_U10A_P08F02_KP_ID]),
  supportClass:"A",
  mode:"diagram",
  publicQuestionMode:"diagram",
  representationTag:"solid_viewpoint_representation_diagram",
  representationTags:Object.freeze(["geometry","spatial_solid","viewpoint","rotation","coordinate_map","diagram"]),
  patternSpecIds:G5A_U10A_P08F02_SPEC_IDS,
  allocationPolicy:"balanced_pattern_spec",
  visibilityStatus:"visible",
  holdReason:null
});
function spec(patternSpecId,relation,answerDomain,pairedView){
  return Object.freeze({
    patternSpecId,
    knowledgePointId:G5A_U10A_P08F02_KP_ID,
    patternGroupId:G5A_U10A_P08F02_PATTERN_GROUP.patternGroupId,
    patternFamilyId:"SOLID_VIEWPOINT_REPRESENTATION",
    semanticCore:"SOLID_VIEWPOINT_RECOGNITION_AND_REPRESENTATION_WITH_ROTATION_INVARIANTS",
    relation,
    questionMode:"diagram",
    answerDomain,
    representation:"solid_viewpoint_representation_diagram",
    rotationAxis:"VERTICAL",
    quarterTurnOnly:true,
    pairedView,
    compositionInvariantRequired:true,
    adjacencyInvariantRequired:true,
    solidShapeClassificationAllowed:false,
    prismPyramidElementsAllowed:false,
    solidNetCorrespondenceAllowed:false,
    solidCrossSectionAllowed:false,
    geometryConstructionAllowed:false,
    sameUnitMixedAllowed:false,
    crossUnitMixedAllowed:false
  });
}
export const G5A_U10A_P08F02_PATTERN_SPECS=Object.freeze([
  spec(G5A_U10A_P08F02_SPEC_IDS[0],G5A_U10A_P08F02_INCLUDED_RELATIONS[0],"VISIBLE_FACE_LABEL",false),
  spec(G5A_U10A_P08F02_SPEC_IDS[1],G5A_U10A_P08F02_INCLUDED_RELATIONS[1],"LEFT_OR_RIGHT_FACE_ZH",false),
  spec(G5A_U10A_P08F02_SPEC_IDS[2],G5A_U10A_P08F02_INCLUDED_RELATIONS[2],"VISIBLE_FACE_LABEL",true)
]);
export const G5A_U10A_P08F02_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g5a_u10a_solid_viewpoint_representation_p08f02",
  sourceId:G5A_U10A_P08F02_SOURCE_ID,
  sourcePages:Object.freeze([1,2]),
  r02EvidencePages:Object.freeze([1,2]),
  knowledgePointId:G5A_U10A_P08F02_KP_ID,
  canonicalNameZh:"立體視圖與位置",
  capabilityStatement:"學生能由不同視角辨認或表示立體。",
  reasoningInvariant:"旋轉改變可見面但不改變立體的構成與相鄰關係。",
  sourceSemanticCore:"SOLID_VIEWPOINT_RECOGNITION_AND_REPRESENTATION_WITH_ROTATION_INVARIANTS",
  primaryRuntimeProfileId:"profile_spatial_solid",
  classificationRuleId:"rule_spatial_solid",
  appliedRuntimeModifierIds:G5A_U10A_P08F02_APPLIED_MODIFIER_IDS,
  requiredCapabilityIds:G5A_U10A_P08F02_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G5A_U10A_P08F02_OPTIONAL_CAPABILITY_IDS,
  blockingCapabilityIds:G5A_U10A_P08F02_BLOCKING_CAPABILITY_IDS,
  patternSpecIds:G5A_U10A_P08F02_SPEC_IDS,
  controlledRepresentationCarrier:"MARKED_CUBOID_QUARTER_TURN",
  sourceLearnerFigureCopied:false,
  r04ReclassificationAllowed:false,
  frozenQueueMutationAllowed:false
});
export const G5A_U10A_P08F02_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G5A_U10A_P08F02_KP_ID,
  sourceId:G5A_U10A_P08F02_SOURCE_ID,
  unitCode:G5A_U10A_P08F02_UNIT_CODE,
  unitTitle:G5A_U10A_P08F02_UNIT_TITLE,
  displayName:"立體視圖與位置",
  canonicalNameZh:"立體視圖與位置",
  mode:"diagram",
  questionMode:"diagram",
  questionModes:Object.freeze(["diagram"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:"APPLICATION_COMPATIBLE_DIAGRAM_CORE_ONLY",
  canonicalPatternGroupIds:Object.freeze([G5A_U10A_P08F02_PATTERN_GROUP.patternGroupId]),
  canonicalPatternSpecIds:G5A_U10A_P08F02_SPEC_IDS,
  patternGroupIds:Object.freeze([G5A_U10A_P08F02_PATTERN_GROUP.patternGroupId]),
  patternSpecIds:G5A_U10A_P08F02_SPEC_IDS,
  requiredCapabilityIds:G5A_U10A_P08F02_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G5A_U10A_P08F02_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P08F02_G5A_U10A_SOURCE_BACKED_SOLID_VIEWPOINT",
  productionUse:"full_product_w8_slice002_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG5AU10AP08F02SelectorRow=id=>id===G5A_U10A_P08F02_KP_ID?clone(G5A_U10A_P08F02_SELECTOR_ROW):null;
export const listG5AU10AP08F02PatternGroups=id=>id===G5A_U10A_P08F02_KP_ID?[clone(G5A_U10A_P08F02_PATTERN_GROUP)]:[];
export const resolveG5AU10AP08F02PatternSpecIds=id=>id===G5A_U10A_P08F02_KP_ID?clone(G5A_U10A_P08F02_SPEC_IDS):[];
export function auditG5AU10AP08F02Projection(){
  const e=[];
  if(G5A_U10A_P08F02_PATTERN_SPECS.length!==3||new Set(G5A_U10A_P08F02_SPEC_IDS).size!==3)e.push("P08F02_PATTERN_CARDINALITY_INVALID");
  if(G5A_U10A_P08F02_PATTERN_SPECS.some(x=>x.questionMode!=="diagram"||x.semanticCore!=="SOLID_VIEWPOINT_RECOGNITION_AND_REPRESENTATION_WITH_ROTATION_INVARIANTS"||!x.compositionInvariantRequired||!x.adjacencyInvariantRequired||x.solidShapeClassificationAllowed||x.prismPyramidElementsAllowed||x.solidNetCorrespondenceAllowed||x.solidCrossSectionAllowed||x.geometryConstructionAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed))e.push("P08F02_PATTERN_SCOPE_INVALID");
  const m=G5A_U10A_P08F02_FORMAL_MAPPING;
  if(m.primaryRuntimeProfileId!=="profile_spatial_solid"||m.classificationRuleId!=="rule_spatial_solid"||m.appliedRuntimeModifierIds.join("|")!=="mod_coordinate_map"||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed||m.sourceLearnerFigureCopied)e.push("P08F02_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1})});
}
