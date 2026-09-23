export const P07F18_TASK_ID="P07F_W7DirectProductVerticalSlice018Implementation";
export const G6B_U03_P07F18_SOURCE_ID="g6b_u03_6b03";
export const G6B_U03_P07F18_UNIT_CODE="6B-U03";
export const G6B_U03_P07F18_UNIT_TITLE="柱體體積與表面積";
export const G6B_U03_P07F18_KP_ID="kp_g6b_u03_cylinder_volume";
export const G6B_U03_P07F18_PRIOR_VISIBLE_KP_IDS=Object.freeze([
  "kp_g6b_u03_prism_surface_area",
  "kp_g6b_u03_prism_base_area_height_volume",
  "kp_g6b_u03_composite_prism_volume_surface",
  "kp_g6b_u03_triangular_prism_volume"
]);
export const G6B_U03_P07F18_REQUIRED_PREREQUISITE_KP_IDS=Object.freeze([
  "kp_g6a_u07_circle_area_formula",
  "kp_g6b_u03_prism_base_area_height_volume"
]);
export const G6B_U03_P07F18_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly","cap_answer_key_projection",
  "cap_html_print_renderer","cap_spatial_solid_reasoning","cap_geometry_domain_validator","cap_solid_geometry_representation"
]);
export const G6B_U03_P07F18_OPTIONAL_CAPABILITY_IDS=Object.freeze(["cap_geometry_construction"]);
export const G6B_U03_P07F18_APPLIED_MODIFIER_IDS=Object.freeze([]);
export const G6B_U03_P07F18_INCLUDED_RELATIONS=Object.freeze([
  "CYLINDER_VOLUME_EQUALS_CIRCULAR_BASE_AREA_TIMES_HEIGHT",
  "DIAMETER_TO_RADIUS_THEN_CIRCULAR_BASE_AREA",
  "RADIUS_AND_HEIGHT_TO_CYLINDER_VOLUME"
]);
export const G6B_U03_P07F18_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g6b_u03_cylinder_volume",sourceId:G6B_U03_P07F18_SOURCE_ID,unitCode:G6B_U03_P07F18_UNIT_CODE,unitTitle:G6B_U03_P07F18_UNIT_TITLE,
  displayName:"圓柱體積",primaryKnowledgePointId:G6B_U03_P07F18_KP_ID,knowledgePointIds:Object.freeze([G6B_U03_P07F18_KP_ID]),
  supportClass:"A",mode:"diagram",publicQuestionMode:"diagram",representationTag:"cylinder-volume-diagram",
  representationTags:Object.freeze(["geometry","volume","spatial_solid","cylinder","circle_area","radius","diameter","height","pi","diagram"]),
  patternSpecIds:Object.freeze([
    "ps_g6b_u03_cylinder_radius_height",
    "ps_g6b_u03_cylinder_diameter_height",
    "ps_g6b_u03_cylinder_source_horizontal_diameter_height"
  ]),
  allocationPolicy:"balanced_pattern_spec",visibilityStatus:"visible",holdReason:null
});
function spec(id,family,relation,measurementMode,orientation,sourceCarrier=false){
  return Object.freeze({
    patternSpecId:id,knowledgePointId:G6B_U03_P07F18_KP_ID,patternGroupId:G6B_U03_P07F18_PATTERN_GROUP.patternGroupId,
    patternFamilyId:family,relation,semanticCore:"CYLINDER_VOLUME_AS_CIRCULAR_BASE_AREA_TIMES_PERPENDICULAR_HEIGHT",
    targetKind:"CYLINDER_VOLUME",questionMode:"diagram",answerDomain:"POSITIVE_DECIMAL_VOLUME",representation:"cylinder_volume_diagram",
    measurementMode,orientation,sourceCarrier,requiresDiagramRepresentation:true,
    circularBaseAreaRequired:true,perpendicularCylinderHeightRequired:true,positiveRadiusRequired:true,positiveHeightRequired:true,
    diameterToRadiusNormalizationRequired:measurementMode==="DIAMETER_HEIGHT",approximatePiValue:3.14,
    circleAreaFormulaPrerequisiteMayBeConsumed:true,prismBaseAreaTimesHeightRelationMayBeConsumed:true,
    q049PrismSurfaceAreaReownershipAllowed:false,q055GenericPrismVolumeReownershipAllowed:false,q060TriangularPrismVolumeReownershipAllowed:false,
    q060CompositePrismReownershipAllowed:false,cylinderSurfaceAreaAllowed:false,compositeCylinderPrismSurfaceVolumeAllowed:false,
    halfCylinderApplicationAsCoreAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false
  });
}
export const G6B_U03_P07F18_PATTERN_SPECS=Object.freeze([
  spec("ps_g6b_u03_cylinder_radius_height","CYLINDER_RADIUS_HEIGHT",G6B_U03_P07F18_INCLUDED_RELATIONS[2],"RADIUS_HEIGHT","UPRIGHT"),
  spec("ps_g6b_u03_cylinder_diameter_height","CYLINDER_DIAMETER_HEIGHT",G6B_U03_P07F18_INCLUDED_RELATIONS[1],"DIAMETER_HEIGHT","UPRIGHT"),
  spec("ps_g6b_u03_cylinder_source_horizontal_diameter_height","SOURCE_HORIZONTAL_CYLINDER_DIAMETER_HEIGHT",G6B_U03_P07F18_INCLUDED_RELATIONS[0],"DIAMETER_HEIGHT","HORIZONTAL",true)
]);
export const G6B_U03_P07F18_SPEC_IDS=Object.freeze(G6B_U03_P07F18_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G6B_U03_P07F18_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g6b_u03_cylinder_volume_p07f18",r04MappingId:"r04map_g6b_u03_cylinder_volume",
  sourceId:G6B_U03_P07F18_SOURCE_ID,r02EvidencePages:Object.freeze([1,2]),currentVisualSupportingPages:Object.freeze([1]),supportingApplicationPages:Object.freeze([2]),
  knowledgePointId:G6B_U03_P07F18_KP_ID,canonicalNameZh:"圓柱體積",capabilityStatement:"學生能以圓面積乘高求圓柱體積。",
  reasoningInvariant:"圓柱每層截面為等大的圓。",sourceSemanticCore:"CYLINDER_VOLUME_AS_CIRCULAR_BASE_AREA_TIMES_PERPENDICULAR_HEIGHT",
  semanticAuthority:"R02_FULL_PAGE_VISUAL_READBACK_PLUS_CURRENT_DIRECT_PDF_VISUAL_CORROBORATION",
  currentVisualSupportLevel:"DIRECT_LITERAL_CYLINDER_VOLUME_APPLICATION_EVIDENCE",
  primaryRuntimeProfileId:"profile_spatial_solid",classificationRuleId:"rule_spatial_solid",
  appliedRuntimeModifierIds:G6B_U03_P07F18_APPLIED_MODIFIER_IDS,requiredCapabilityIds:G6B_U03_P07F18_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6B_U03_P07F18_OPTIONAL_CAPABILITY_IDS,patternSpecIds:G6B_U03_P07F18_SPEC_IDS,
  requiredPrerequisiteKnowledgePointIds:G6B_U03_P07F18_REQUIRED_PREREQUISITE_KP_IDS,
  circularBaseAreaRequired:true,perpendicularCylinderHeightRequired:true,positiveRadiusRequired:true,positiveHeightRequired:true,
  diameterToRadiusNormalizationAllowed:true,approximatePiValue:3.14,circleAreaFormulaPrerequisiteMayBeConsumed:true,
  prismBaseAreaTimesHeightRelationMayBeConsumed:true,q049PrismSurfaceAreaReownershipAllowed:false,q055GenericPrismVolumeReownershipAllowed:false,
  q060TriangularPrismVolumeReownershipAllowed:false,q060CompositePrismReownershipAllowed:false,cylinderSurfaceAreaAllowed:false,
  compositeCylinderPrismSurfaceVolumeAllowed:false,halfCylinderApplicationAsCoreAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false,
  r04ReclassificationAllowed:false,frozenQueueMutationAllowed:false
});
export const G6B_U03_P07F18_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G6B_U03_P07F18_KP_ID,sourceId:G6B_U03_P07F18_SOURCE_ID,unitCode:G6B_U03_P07F18_UNIT_CODE,unitTitle:G6B_U03_P07F18_UNIT_TITLE,
  displayName:"圓柱體積",canonicalNameZh:"圓柱體積",mode:"diagram",questionMode:"diagram",questionModes:Object.freeze(["diagram"]),supportClass:"A",
  visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:"SOURCE_BACKED_CYLINDER_VOLUME_ADMITTED",
  canonicalPatternGroupIds:Object.freeze([G6B_U03_P07F18_PATTERN_GROUP.patternGroupId]),canonicalPatternSpecIds:G6B_U03_P07F18_SPEC_IDS,
  patternGroupIds:Object.freeze([G6B_U03_P07F18_PATTERN_GROUP.patternGroupId]),patternSpecIds:G6B_U03_P07F18_SPEC_IDS,
  requiredCapabilityIds:G6B_U03_P07F18_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G6B_U03_P07F18_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P07F18_G6B_U03_SOURCE_BACKED_CYLINDER_VOLUME",productionUse:"full_product_w7_slice018_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6BU03P07F18SelectorRow=id=>id===G6B_U03_P07F18_KP_ID?clone(G6B_U03_P07F18_SELECTOR_ROW):null;
export const listG6BU03P07F18PatternGroups=id=>id===G6B_U03_P07F18_KP_ID?[clone(G6B_U03_P07F18_PATTERN_GROUP)]:[];
export const resolveG6BU03P07F18PatternSpecIds=id=>id===G6B_U03_P07F18_KP_ID?clone(G6B_U03_P07F18_SPEC_IDS):[];
export function auditG6BU03P07F18Projection(){
  const e=[];
  if(G6B_U03_P07F18_PATTERN_SPECS.length!==3||G6B_U03_P07F18_FORMAL_MAPPING.patternSpecIds.length!==3)e.push("P07F18_PATTERN_CARDINALITY_INVALID");
  if(new Set(G6B_U03_P07F18_SPEC_IDS).size!==3)e.push("P07F18_PATTERN_SPEC_DUPLICATE");
  for(const x of G6B_U03_P07F18_PATTERN_SPECS){
    if(x.questionMode!=="diagram"||x.semanticCore!=="CYLINDER_VOLUME_AS_CIRCULAR_BASE_AREA_TIMES_PERPENDICULAR_HEIGHT"||!x.requiresDiagramRepresentation||
      !x.circularBaseAreaRequired||!x.perpendicularCylinderHeightRequired||!x.positiveRadiusRequired||!x.positiveHeightRequired||x.approximatePiValue!==3.14||
      x.q049PrismSurfaceAreaReownershipAllowed||x.q055GenericPrismVolumeReownershipAllowed||x.q060TriangularPrismVolumeReownershipAllowed||
      x.q060CompositePrismReownershipAllowed||x.cylinderSurfaceAreaAllowed||x.compositeCylinderPrismSurfaceVolumeAllowed||
      x.halfCylinderApplicationAsCoreAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed)e.push("P07F18_PATTERN_SCOPE_INVALID:"+x.patternSpecId);
  }
  const m=G6B_U03_P07F18_FORMAL_MAPPING;
  if(m.primaryRuntimeProfileId!=="profile_spatial_solid"||m.classificationRuleId!=="rule_spatial_solid"||m.appliedRuntimeModifierIds.length!==0||
    m.requiredCapabilityIds.join("|")!==G6B_U03_P07F18_REQUIRED_CAPABILITY_IDS.join("|")||
    m.optionalCapabilityIds.join("|")!==G6B_U03_P07F18_OPTIONAL_CAPABILITY_IDS.join("|")||
    !m.circularBaseAreaRequired||!m.perpendicularCylinderHeightRequired||!m.diameterToRadiusNormalizationAllowed||
    m.q049PrismSurfaceAreaReownershipAllowed||m.q055GenericPrismVolumeReownershipAllowed||m.q060TriangularPrismVolumeReownershipAllowed||
    m.q060CompositePrismReownershipAllowed||m.cylinderSurfaceAreaAllowed||m.sameUnitMixedAllowed||m.crossUnitMixedAllowed||
    m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed)e.push("P07F18_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1})});
}
