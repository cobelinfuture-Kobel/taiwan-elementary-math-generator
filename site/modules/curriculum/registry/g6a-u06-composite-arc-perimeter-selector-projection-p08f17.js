export const P08F17_TASK_ID="P08F_W8DirectProductVerticalSlice017Implementation";
export const G6A_U06_P08F17_SOURCE_ID="g6a_u06_6a06";
export const G6A_U06_P08F17_UNIT_CODE="6A-U06";
export const G6A_U06_P08F17_UNIT_TITLE="圓周長與扇形周長";
export const G6A_U06_P08F17_KP_ID="kp_g6a_u06_composite_arc_perimeter";
export const G6A_U06_P08F17_PRIOR_KP_IDS=Object.freeze([
  "kp_g6a_u06_pi_circumference_relation",
  "kp_g6a_u06_circle_circumference_formula",
  "kp_g6a_u06_semicircle_perimeter",
  "kp_g6a_u06_sector_arc_length"
]);
export const G6A_U06_P08F17_FUTURE_KP_IDS=Object.freeze([]);
export const G6A_U06_P08F17_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution",
  "cap_deterministic_answer_model",
  "cap_worksheet_document_assembly",
  "cap_answer_key_projection",
  "cap_html_print_renderer",
  "cap_geometry_formula_evaluation",
  "cap_geometry_domain_validator",
  "cap_geometry_diagram_representation"
]);
export const G6A_U06_P08F17_CONTRACT_ONLY_CAPABILITY_IDS=Object.freeze([
  "cap_geometry_property_reasoning"
]);
export const G6A_U06_P08F17_OPTIONAL_CAPABILITY_IDS=Object.freeze([]);
export const G6A_U06_P08F17_APPLIED_MODIFIER_IDS=Object.freeze([]);
export const G6A_U06_P08F17_PATTERN_GROUP_ID="pg_g6a_u06_composite_arc_perimeter";
export const G6A_U06_P08F17_INCLUDED_RELATIONS=Object.freeze([
  "IDENTIFY_EXTERNALLY_EXPOSED_BOUNDARY_COMPONENTS",
  "COMPUTE_ARC_COMPONENTS_FROM_RADIUS_AND_CENTRAL_ANGLE",
  "SUM_STRAIGHT_AND_ARC_COMPONENTS_FOR_TOTAL_PERIMETER",
  "EXCLUDE_INTERNAL_OR_SHARED_EDGES",
  "VERIFY_DECOMPOSED_BOUNDARY_RECONSTRUCTS_THE_SAME_OUTER_PERIMETER"
]);
export const G6A_U06_P08F17_EXCLUDED_RELATIONS=Object.freeze([
  "Q004_PI_CIRCUMFERENCE_RELATION_TEACHING_REOWNERSHIP",
  "Q006_CIRCLE_CIRCUMFERENCE_FORMULA_TEACHING_REOWNERSHIP",
  "Q010_SEMICIRCLE_PERIMETER_TEACHING_REOWNERSHIP",
  "Q015_SECTOR_ARC_LENGTH_TEACHING_REOWNERSHIP",
  "SECTOR_AREA",
  "COMPOSITE_CIRCLE_AREA",
  "GENERIC_GEOMETRY_FORMULA_DRILL",
  "APPLICATION_CONTEXT",
  "SAME_UNIT_MIXED_MODE",
  "CROSS_UNIT_MIXED_MODE",
  "Q018_OR_LATER_IMPLEMENTATION"
]);
const spec=(id,relation,promptMode,shapeMode)=>Object.freeze({
  patternSpecId:id,
  knowledgePointId:G6A_U06_P08F17_KP_ID,
  patternGroupId:G6A_U06_P08F17_PATTERN_GROUP_ID,
  patternFamilyId:"COMPOSITE_ARC_PERIMETER",
  relation,
  promptMode,
  shapeMode,
  questionMode:"diagram",
  answerDomain:"POSITIVE_PERIMETER_CM",
  semanticCore:"SUM_ONLY_EXTERNALLY_EXPOSED_STRAIGHT_SEGMENTS_AND_CIRCULAR_ARCS_TO_OBTAIN_COMPOSITE_PERIMETER",
  requiresDiagramRepresentation:true,
  requiresFormulaEvaluation:true,
  requiresPropertyReasoning:true,
  externalBoundaryOnly:true,
  internalSharedEdgesExcluded:true,
  straightBoundarySegmentsAllowed:true,
  multipleArcSegmentsAllowed:true,
  eachArcOwnRadiusAndCentralAngle:true,
  priorCircumferenceOwnersMayBeConsumed:true,
  priorArcLengthOwnerMayBeConsumed:true,
  teachingReownershipAllowed:false,
  areaAllowed:false,
  applicationContextAllowed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false
});
export const G6A_U06_P08F17_PATTERN_SPECS=Object.freeze([
  spec("ps_g6a_u06_composite_sector_perimeter",G6A_U06_P08F17_INCLUDED_RELATIONS[2],"SECTOR_EXTERNAL_BOUNDARY","SECTOR"),
  spec("ps_g6a_u06_composite_stadium_perimeter",G6A_U06_P08F17_INCLUDED_RELATIONS[2],"STADIUM_EXTERNAL_BOUNDARY","STADIUM"),
  spec("ps_g6a_u06_composite_rect_semicircle_perimeter",G6A_U06_P08F17_INCLUDED_RELATIONS[0],"RECTANGLE_WITH_SEMICIRCLE_CAP","RECT_SEMICIRCLE"),
  spec("ps_g6a_u06_composite_double_bump_verify",G6A_U06_P08F17_INCLUDED_RELATIONS[4],"DOUBLE_SEMICIRCLE_BUMP_VERIFY","DOUBLE_BUMP")
]);
export const G6A_U06_P08F17_SPEC_IDS=Object.freeze(G6A_U06_P08F17_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G6A_U06_P08F17_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g6a_u06_composite_arc_perimeter_p08f17",
  r04MappingId:"r04map_g6a_u06_composite_arc_perimeter",
  sourceId:G6A_U06_P08F17_SOURCE_ID,
  sourcePages:Object.freeze([1,2]),
  knowledgePointId:G6A_U06_P08F17_KP_ID,
  canonicalNameZh:"複合弧形周長",
  capabilityStatement:"學生能辨認外部直線與弧線並求總周長。",
  reasoningInvariant:"只計外部邊界，各弧須依其半徑與圓心角計算。",
  semanticCore:"SUM_ONLY_EXTERNALLY_EXPOSED_STRAIGHT_SEGMENTS_AND_CIRCULAR_ARCS_TO_OBTAIN_COMPOSITE_PERIMETER",
  externalBoundaryOnlyRequired:true,
  internalOrSharedEdgesExcluded:true,
  straightBoundarySegmentsAllowed:true,
  multipleArcSegmentsAllowed:true,
  eachArcUsesItsOwnRadiusAndCentralAngle:true,
  sectorPerimeterAsCompositeBoundaryPatternAllowed:true,
  stadiumCapsuleBoundaryPatternAllowed:true,
  semicircleArcCompositionAllowed:true,
  requiredCapabilityIds:G6A_U06_P08F17_REQUIRED_CAPABILITY_IDS,
  contractOnlyRequiredCapabilityIds:G6A_U06_P08F17_CONTRACT_ONLY_CAPABILITY_IDS,
  optionalCapabilityIds:G6A_U06_P08F17_OPTIONAL_CAPABILITY_IDS,
  appliedRuntimeModifierIds:G6A_U06_P08F17_APPLIED_MODIFIER_IDS,
  patternSpecIds:G6A_U06_P08F17_SPEC_IDS,
  priorSameSourceOwners:G6A_U06_P08F17_PRIOR_KP_IDS,
  futureSameSourceOwners:G6A_U06_P08F17_FUTURE_KP_IDS,
  q004PiCircumferenceRelationTeachingReowned:false,
  q006CircleCircumferenceFormulaTeachingReowned:false,
  q010SemicirclePerimeterTeachingReowned:false,
  q015SectorArcLengthTeachingReowned:false,
  sectorAreaAllowed:false,
  compositeCircleAreaAllowed:false,
  genericGeometryFormulaDrillAllowed:false,
  applicationContextAllowed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false,
  r04ReclassificationAllowed:false,
  frozenQueueMutationAllowed:false
});
export const G6A_U06_P08F17_PATTERN_GROUP=Object.freeze({
  patternGroupId:G6A_U06_P08F17_PATTERN_GROUP_ID,
  sourceId:G6A_U06_P08F17_SOURCE_ID,
  unitCode:G6A_U06_P08F17_UNIT_CODE,
  unitTitle:G6A_U06_P08F17_UNIT_TITLE,
  displayName:"複合弧形周長圖形題",
  primaryKnowledgePointId:G6A_U06_P08F17_KP_ID,
  knowledgePointIds:Object.freeze([G6A_U06_P08F17_KP_ID]),
  supportClass:"A",
  mode:"diagram",
  publicQuestionMode:"diagram",
  representationTag:"composite_arc_perimeter_diagram",
  representationTags:Object.freeze(["geometry","circle","arc","perimeter","external_boundary","composite"]),
  patternSpecIds:G6A_U06_P08F17_SPEC_IDS,
  allocationPolicy:"balanced_pattern_spec",
  visibilityStatus:"visible",
  holdReason:null
});
export const G6A_U06_P08F17_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G6A_U06_P08F17_KP_ID,
  sourceId:G6A_U06_P08F17_SOURCE_ID,
  unitCode:G6A_U06_P08F17_UNIT_CODE,
  unitTitle:G6A_U06_P08F17_UNIT_TITLE,
  displayName:"複合弧形周長",
  canonicalNameZh:"複合弧形周長",
  mode:"diagram",
  questionMode:"diagram",
  questionModes:Object.freeze(["diagram"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:"APPLICATION_COMPATIBLE_CONTEXT_NOT_ADMITTED",
  canonicalPatternGroupIds:Object.freeze([G6A_U06_P08F17_PATTERN_GROUP_ID]),
  canonicalPatternSpecIds:G6A_U06_P08F17_SPEC_IDS,
  patternGroupIds:Object.freeze([G6A_U06_P08F17_PATTERN_GROUP_ID]),
  patternSpecIds:G6A_U06_P08F17_SPEC_IDS,
  requiredCapabilityIds:G6A_U06_P08F17_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6A_U06_P08F17_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P08F17_G6A_U06_SOURCE_BACKED_COMPOSITE_ARC_PERIMETER",
  productionUse:"full_product_w8_slice017_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6AU06P08F17SelectorRow=id=>id===G6A_U06_P08F17_KP_ID?clone(G6A_U06_P08F17_SELECTOR_ROW):null;
export const listG6AU06P08F17PatternGroups=id=>id===G6A_U06_P08F17_KP_ID?[clone(G6A_U06_P08F17_PATTERN_GROUP)]:[];
export const resolveG6AU06P08F17PatternSpecIds=id=>id===G6A_U06_P08F17_KP_ID?clone(G6A_U06_P08F17_SPEC_IDS):[];
export function auditG6AU06P08F17Projection(){
  const e=[],m=G6A_U06_P08F17_FORMAL_MAPPING;
  if(G6A_U06_P08F17_PATTERN_SPECS.length!==4||new Set(G6A_U06_P08F17_SPEC_IDS).size!==4)e.push("P08F17_PATTERN_CARDINALITY_INVALID");
  const shapeModes=new Set(G6A_U06_P08F17_PATTERN_SPECS.map(x=>x.shapeMode));
  for(const mode of ["SECTOR","STADIUM","RECT_SEMICIRCLE","DOUBLE_BUMP"])if(!shapeModes.has(mode))e.push("P08F17_SHAPE_MODE_MISSING:"+mode);
  for(const x of G6A_U06_P08F17_PATTERN_SPECS){
    if(x.questionMode!=="diagram"||x.semanticCore!==m.semanticCore||!x.requiresDiagramRepresentation||!x.requiresFormulaEvaluation||!x.requiresPropertyReasoning||!x.externalBoundaryOnly||!x.internalSharedEdgesExcluded||!x.straightBoundarySegmentsAllowed||!x.multipleArcSegmentsAllowed||!x.eachArcOwnRadiusAndCentralAngle||!x.priorCircumferenceOwnersMayBeConsumed||!x.priorArcLengthOwnerMayBeConsumed||x.teachingReownershipAllowed||x.areaAllowed||x.applicationContextAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed)e.push("P08F17_PATTERN_SCOPE_INVALID:"+x.patternSpecId);
  }
  if(m.r04MappingId!=="r04map_g6a_u06_composite_arc_perimeter"||m.appliedRuntimeModifierIds.length!==0||!m.externalBoundaryOnlyRequired||!m.internalOrSharedEdgesExcluded||m.q004PiCircumferenceRelationTeachingReowned||m.q006CircleCircumferenceFormulaTeachingReowned||m.q010SemicirclePerimeterTeachingReowned||m.q015SectorArcLengthTeachingReowned||m.sectorAreaAllowed||m.compositeCircleAreaAllowed||m.genericGeometryFormulaDrillAllowed||m.applicationContextAllowed||m.sameUnitMixedAllowed||m.crossUnitMixedAllowed||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed)e.push("P08F17_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:4,formalMappings:1})});
}
