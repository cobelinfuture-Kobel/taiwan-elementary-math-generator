export const P05F49_TASK_ID="P05F_W5DirectProductVerticalSlice049Implementation";
export const G6B_U03_P05F49_SOURCE_ID="g6b_u03_6b03";
export const G6B_U03_P05F49_KP_ID="kp_g6b_u03_prism_surface_area";
export const G6B_U03_P05F49_PROTECTED_KP_IDS=Object.freeze([
  "kp_g6b_u03_prism_base_area_height_volume",
  "kp_g6b_u03_triangular_prism_volume",
  "kp_g6b_u03_cylinder_volume",
  "kp_g6b_u03_composite_prism_volume_surface",
]);
export const G6B_U03_P05F49_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
  "cap_solid_geometry_representation",
  "cap_spatial_solid_reasoning",
]);
export const G6B_U03_P05F49_OPTIONAL_CAPABILITY_IDS=Object.freeze(["cap_geometry_construction"]);
export const G6B_U03_P05F49_PATTERN_GROUP_ID="pg_g6b_u03_prism_surface_area";
export const G6B_U03_P05F49_SPEC_IDS=Object.freeze([
  "ps_g6b_u03_triangular_prism_surface_area",
  "ps_g6b_u03_trapezoidal_prism_surface_area",
  "ps_g6b_u03_parallelogram_prism_surface_area",
]);
const TASKS=Object.freeze([
  "TRIANGULAR_PRISM_EXPOSED_FACE_SUM",
  "TRAPEZOIDAL_PRISM_LATERAL_PERIMETER_NET",
  "PARALLELOGRAM_PRISM_LATERAL_PERIMETER_NET",
]);
export const G6B_U03_P05F49_PATTERN_SPECS=Object.freeze(G6B_U03_P05F49_SPEC_IDS.map((patternSpecId,index)=>Object.freeze({
  patternSpecId,
  knowledgePointId:G6B_U03_P05F49_KP_ID,
  patternGroupId:G6B_U03_P05F49_PATTERN_GROUP_ID,
  task:TASKS[index],
  relation:"SUM_TWO_BASES_AND_ALL_LATERAL_FACES_FOR_PRISM_SURFACE_AREA",
  questionMode:"diagram",
  diagramKind:"prism_pyramid_elements_diagram",
  baseFamily:index===0?"RIGHT_TRIANGLE":index===1?"ISOSCELES_TRAPEZOID":"PARALLELOGRAM",
  answerDomain:"EXACT_SURFACE_AREA_SQUARE_CENTIMETER",
  countEachExteriorFaceExactlyOnce:true,
  lateralNetWidthUsesBasePerimeter:true,
  spatialSolidReasoning:true,
  solidGeometryRepresentation:true,
  geometryDomainValidator:true,
  geometryPropertyReasoning:true,
  prismVolumeTarget:false,
  triangularPrismVolumeTarget:false,
  cylinderTarget:false,
  compositePrismTarget:false,
  applicationAllowed:false,
  mixedKnowledgePointAllowed:false,
})));
export const G6B_U03_P05F49_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g6b_u03_prism_surface_area_p05f49",
  sourceId:G6B_U03_P05F49_SOURCE_ID,
  sourcePages:Object.freeze([1,2]),
  knowledgePointId:G6B_U03_P05F49_KP_ID,
  canonicalNameZh:"柱體表面積",
  capabilityStatement:"學生能加總兩個底面與各側面求表面積。",
  reasoningInvariant:"所有外露面恰計一次，側面展開總寬等於底面周長。",
  includedRelations:Object.freeze([
    "SUM_TWO_BASES_AND_ALL_LATERAL_FACES_FOR_PRISM_SURFACE_AREA",
    "COUNT_EACH_EXPOSED_FACE_EXACTLY_ONCE",
    "LATERAL_NET_TOTAL_WIDTH_EQUALS_BASE_PERIMETER",
  ]),
  requiredCapabilityIds:G6B_U03_P05F49_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6B_U03_P05F49_OPTIONAL_CAPABILITY_IDS,
  patternSpecIds:G6B_U03_P05F49_SPEC_IDS,
  applicationImplementationAllowed:false,
});
export const G6B_U03_P05F49_PATTERN_GROUP=Object.freeze({
  patternGroupId:G6B_U03_P05F49_PATTERN_GROUP_ID,
  sourceId:G6B_U03_P05F49_SOURCE_ID,
  unitCode:"6B-U03",
  unitTitle:"柱體體積與表面積",
  displayName:"柱體表面積",
  primaryKnowledgePointId:G6B_U03_P05F49_KP_ID,
  knowledgePointIds:Object.freeze([G6B_U03_P05F49_KP_ID]),
  supportClass:"A",
  mode:"diagram",
  publicQuestionMode:"diagram",
  representationTag:"prism_pyramid_elements_diagram",
  representationTags:Object.freeze(["geometry","surface_area","spatial_solid","prism"]),
  patternSpecIds:G6B_U03_P05F49_SPEC_IDS,
  visibilityStatus:"visible",
});
export const G6B_U03_P05F49_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G6B_U03_P05F49_KP_ID,
  sourceId:G6B_U03_P05F49_SOURCE_ID,
  unitCode:"6B-U03",
  unitTitle:"柱體體積與表面積",
  displayName:"柱體表面積",
  canonicalNameZh:"柱體表面積",
  mode:"diagram",
  questionMode:"diagram",
  questionModes:Object.freeze(["diagram"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  applicationClassification:"DIAGRAM_ONLY_APPLICATION_COMPATIBLE_CONTEXT_NOT_ADMITTED",
  canonicalPatternGroupIds:Object.freeze([G6B_U03_P05F49_PATTERN_GROUP_ID]),
  canonicalPatternSpecIds:G6B_U03_P05F49_SPEC_IDS,
  patternGroupIds:Object.freeze([G6B_U03_P05F49_PATTERN_GROUP_ID]),
  patternSpecIds:G6B_U03_P05F49_SPEC_IDS,
  requiredCapabilityIds:G6B_U03_P05F49_REQUIRED_CAPABILITY_IDS,
  qaStatusLabel:"P05F49_G6B_U03_SOURCE_BACKED_PRISM_SURFACE_AREA",
  productionUse:"full_product_w5_slice049_candidate",
});
export const getG6BU03P05F49SelectorRow=id=>id===G6B_U03_P05F49_KP_ID?G6B_U03_P05F49_SELECTOR_ROW:null;
export const listG6BU03P05F49PatternGroups=id=>id===G6B_U03_P05F49_KP_ID?[G6B_U03_P05F49_PATTERN_GROUP]:[];
export const resolveG6BU03P05F49PatternSpecIds=id=>id===G6B_U03_P05F49_KP_ID?[...G6B_U03_P05F49_SPEC_IDS]:[];
export function auditG6BU03P05F49Projection(){
  const errors=[];
  if(G6B_U03_P05F49_PATTERN_SPECS.length!==3)errors.push("P05F49_PATTERN_CARDINALITY_INVALID");
  if(G6B_U03_P05F49_PATTERN_SPECS.some(x=>x.applicationAllowed||x.mixedKnowledgePointAllowed||x.prismVolumeTarget||x.triangularPrismVolumeTarget||x.cylinderTarget||x.compositePrismTarget))errors.push("P05F49_SCOPE_GUARD_INVALID");
  if(G6B_U03_P05F49_PATTERN_SPECS.some(x=>!x.countEachExteriorFaceExactlyOnce||!x.lateralNetWidthUsesBasePerimeter))errors.push("P05F49_SURFACE_AREA_INVARIANT_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1})});
}
