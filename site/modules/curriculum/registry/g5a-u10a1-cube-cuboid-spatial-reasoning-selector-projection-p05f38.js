export const P05F38_TASK_ID="P05F_W5DirectProductVerticalSlice038Implementation";
export const G5A_U10A1_P05F38_SOURCE_ID="g5a_u10_5a10a1";
export const G5A_U10A1_P05F38_UNIT_CODE="5A-U10A1";
export const G5A_U10A1_P05F38_UNIT_TITLE="正方體和長方體";
export const G5A_U10A1_P05F38_KP_ID="kp_g5a_u10a1_cube_cuboid_spatial_reasoning";
export const G5A_U10A1_P05F38_PATTERN_GROUP_ID="pg_g5a_u10a1_cube_cuboid_spatial_reasoning";
export const G5A_U10A1_P05F38_REQUIRED_CAPABILITY_IDS=Object.freeze(["cap_geometry_domain_validator","cap_geometry_property_reasoning","cap_solid_geometry_representation","cap_spatial_solid_reasoning"]);
export const G5A_U10A1_P05F38_INCLUDED_RELATIONS=Object.freeze([
  "INFER_HIDDEN_OR_MISSING_FACE_POSITION_UNDER_CUBE_CUBOID_CONDITIONS",
  "INFER_FACE_COLOR_POSITION_UNDER_MULTIVIEW_OR_CONDITIONAL_INFORMATION",
  "INFER_CUBE_CUBOID_RELATION_AFTER_CUTTING_CONDITION_WITHOUT_SURFACE_AREA_ARITHMETIC",
  "PRESERVE_FIXED_FACE_EDGE_VERTEX_ADJACENCY_DURING_SPATIAL_INFERENCE"
]);
export const G5A_U10A1_P05F38_EXCLUDED_RELATIONS=Object.freeze([
  "REOWN_GENERIC_FACE_EDGE_VERTEX_IDENTIFICATION_OR_FIXED_COUNTS",
  "REOWN_EDGE_LENGTH_GROUP_RELATIONS",
  "REOWN_BASE_OPPOSITE_ADJACENT_OR_PERPENDICULAR_FACE_RELATIONSHIPS",
  "REOWN_NET_FOLDABILITY_OR_NET_COMPLETION",
  "SURFACE_AREA_FORMULA_OR_ARITHMETIC",
  "VOLUME_FORMULA_OR_ARITHMETIC",
  "GENERAL_OTHER_SOLID_VIEWPOINT_REPRESENTATION",
  "APPLICATION_CONTEXT_IMPLEMENTATION",
  "SAME_UNIT_MIXED_MODE",
  "CROSS_UNIT_MIXED_MODE",
  "Q039_OR_LATER_SEMANTICS"
]);
const spec=(patternSpecId,relation,diagramMode,answerDomain)=>Object.freeze({
  patternSpecId,knowledgePointId:G5A_U10A1_P05F38_KP_ID,patternGroupId:G5A_U10A1_P05F38_PATTERN_GROUP_ID,
  patternFamilyId:"CUBE_CUBOID_CONDITIONAL_SPATIAL_INFERENCE",relation,diagramMode,questionMode:"diagram",
  diagramKind:"cube_cuboid_elements_diagram",answerDomain,requiresGeometryDomainValidator:true,
  requiresGeometryPropertyReasoning:true,requiresSolidGeometryRepresentation:true,requiresSpatialSolidReasoning:true,
  preservesFixedAdjacency:true,geometryConstructionRequired:false,applicationAllowed:false,netFoldabilityAllowed:false,
  surfaceAreaArithmeticAllowed:false,volumeArithmeticAllowed:false,genericViewpointTargetAllowed:false,
  sameUnitMixedAllowed:false,crossUnitMixedAllowed:false
});
export const G5A_U10A1_P05F38_PATTERN_SPECS=Object.freeze([
  spec("ps_g5a_u10a1_spatial_missing_face_opposite_sum7",G5A_U10A1_P05F38_INCLUDED_RELATIONS[0],"MISSING_FACE_CONDITION","INTEGER_1_TO_6"),
  spec("ps_g5a_u10a1_spatial_face_color_multiview",G5A_U10A1_P05F38_INCLUDED_RELATIONS[1],"MULTIVIEW_FACE_COLOR_CONDITION","COLOR_LABEL"),
  spec("ps_g5a_u10a1_spatial_cut_position_outer_faces",G5A_U10A1_P05F38_INCLUDED_RELATIONS[2],"CUT_POSITION_RELATION","INTEGER_1_TO_3")
]);
export const G5A_U10A1_P05F38_SPEC_IDS=Object.freeze(G5A_U10A1_P05F38_PATTERN_SPECS.map(row=>row.patternSpecId));
export const G5A_U10A1_P05F38_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g5a_u10a1_cube_cuboid_spatial_reasoning_p05f38",sourceId:G5A_U10A1_P05F38_SOURCE_ID,sourcePages:Object.freeze([1,2]),
  knowledgePointId:G5A_U10A1_P05F38_KP_ID,canonicalNameZh:"正方體長方體空間推理",
  capabilityStatement:"學生能由缺面、塗色或切割條件推論立體關係。",
  reasoningInvariant:"推論必須保持面、稜、頂點的固定鄰接結構。",
  relationFamily:"CUBE_CUBOID_CONDITIONAL_SPATIAL_INFERENCE",inputRepresentation:"CUBE_CUBOID_CONDITIONAL_DIAGRAM",
  includedRelations:G5A_U10A1_P05F38_INCLUDED_RELATIONS,excludedRelations:G5A_U10A1_P05F38_EXCLUDED_RELATIONS,
  applicationSuitability:"APPLICATION_COMPATIBLE",applicationImplementationAllowed:false,
  requiredCapabilityIds:G5A_U10A1_P05F38_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:Object.freeze(["cap_geometry_construction"]),
  patternSpecIds:G5A_U10A1_P05F38_SPEC_IDS,q029ExactPdfVisualCorroborationPages:Object.freeze([1,2]),
  fixedAdjacencyMustBePreserved:true,genericViewpointMayOnlyBeConditionNotTarget:true,cuttingMayNotComputeSurfaceArea:true
});
export const G5A_U10A1_P05F38_PATTERN_GROUP=Object.freeze({
  patternGroupId:G5A_U10A1_P05F38_PATTERN_GROUP_ID,sourceId:G5A_U10A1_P05F38_SOURCE_ID,unitCode:G5A_U10A1_P05F38_UNIT_CODE,
  unitTitle:G5A_U10A1_P05F38_UNIT_TITLE,displayName:"正方體長方體條件空間推理",primaryKnowledgePointId:G5A_U10A1_P05F38_KP_ID,
  knowledgePointIds:Object.freeze([G5A_U10A1_P05F38_KP_ID]),supportClass:"A",mode:"diagram",publicQuestionMode:"diagram",
  representationTag:"cube_cuboid_elements_diagram",representationTags:Object.freeze(["geometry","spatial_solid","cube","conditional_inference","missing_face","multiview_color","cutting_relation"]),
  patternSpecIds:G5A_U10A1_P05F38_SPEC_IDS,allocationPolicy:"balanced_q038_conditional_spatial_relation",visibilityStatus:"visible",holdReason:null
});
export const G5A_U10A1_P05F38_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G5A_U10A1_P05F38_KP_ID,sourceId:G5A_U10A1_P05F38_SOURCE_ID,unitCode:G5A_U10A1_P05F38_UNIT_CODE,
  unitTitle:G5A_U10A1_P05F38_UNIT_TITLE,displayName:"正方體長方體空間推理",canonicalNameZh:"正方體長方體空間推理",
  mode:"diagram",questionMode:"diagram",questionModes:Object.freeze(["diagram"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",
  holdReason:null,applicationClassification:"DIAGRAM_ONLY_APPLICATION_COMPATIBLE_CONTEXT_NOT_ADMITTED",
  canonicalPatternGroupIds:Object.freeze([G5A_U10A1_P05F38_PATTERN_GROUP_ID]),canonicalPatternSpecIds:G5A_U10A1_P05F38_SPEC_IDS,
  patternGroupIds:Object.freeze([G5A_U10A1_P05F38_PATTERN_GROUP_ID]),patternSpecIds:G5A_U10A1_P05F38_SPEC_IDS,
  requiredCapabilityIds:G5A_U10A1_P05F38_REQUIRED_CAPABILITY_IDS,qaStatusLabel:"P05F38_G5A_U10A1_SOURCE_BACKED_CUBE_CUBOID_SPATIAL_REASONING",
  productionUse:"full_product_w5_slice038_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export function getG5AU10A1P05F38SelectorRow(id){return id===G5A_U10A1_P05F38_KP_ID?clone(G5A_U10A1_P05F38_SELECTOR_ROW):null;}
export function listG5AU10A1P05F38PatternGroups(id){return id===G5A_U10A1_P05F38_KP_ID?[clone(G5A_U10A1_P05F38_PATTERN_GROUP)]:[];}
export function resolveG5AU10A1P05F38PatternSpecIds(id){return id===G5A_U10A1_P05F38_KP_ID?clone(G5A_U10A1_P05F38_SPEC_IDS):[];}
export function auditG5AU10A1P05F38Projection(){
  const errors=[];
  if(G5A_U10A1_P05F38_PATTERN_SPECS.length!==3||new Set(G5A_U10A1_P05F38_SPEC_IDS).size!==3)errors.push("P05F38_PATTERN_CARDINALITY_INVALID");
  if(G5A_U10A1_P05F38_PATTERN_SPECS.some(row=>row.questionMode!=="diagram"||row.diagramKind!=="cube_cuboid_elements_diagram"||!row.requiresGeometryDomainValidator||!row.requiresGeometryPropertyReasoning||!row.requiresSolidGeometryRepresentation||!row.requiresSpatialSolidReasoning||!row.preservesFixedAdjacency||row.geometryConstructionRequired||row.applicationAllowed||row.netFoldabilityAllowed||row.surfaceAreaArithmeticAllowed||row.volumeArithmeticAllowed||row.genericViewpointTargetAllowed||row.sameUnitMixedAllowed||row.crossUnitMixedAllowed))errors.push("P05F38_PATTERN_INVARIANT_INVALID");
  if(!G5A_U10A1_P05F38_FORMAL_MAPPING.includedRelations.includes("PRESERVE_FIXED_FACE_EDGE_VERTEX_ADJACENCY_DURING_SPATIAL_INFERENCE"))errors.push("P05F38_ADJACENCY_INVARIANT_MISSING");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,diagram:3,application:0})});
}
