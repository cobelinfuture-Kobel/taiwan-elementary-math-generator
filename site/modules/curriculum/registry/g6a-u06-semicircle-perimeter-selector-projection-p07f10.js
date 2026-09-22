export const P07F10_TASK_ID="P07F_W7DirectProductVerticalSlice010Implementation";
export const G6A_U06_P07F10_SOURCE_ID="g6a_u06_6a06";
export const G6A_U06_P07F10_UNIT_CODE="6A-U06";
export const G6A_U06_P07F10_UNIT_TITLE="圓周長與扇形周長";
export const G6A_U06_P07F10_KP_ID="kp_g6a_u06_semicircle_perimeter";
export const G6A_U06_P07F10_PREDECESSOR_KP_IDS=Object.freeze(["kp_g6a_u06_pi_circumference_relation","kp_g6a_u06_circle_circumference_formula"]);
export const G6A_U06_P07F10_PROTECTED_FUTURE_KP_IDS=Object.freeze(["kp_g6a_u06_sector_arc_length","kp_g6a_u06_composite_arc_perimeter"]);
export const G6A_U06_P07F10_QUEUE_REQUIRED_CAPABILITY_IDS=Object.freeze([]);
export const G6A_U06_P07F10_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly","cap_answer_key_projection","cap_html_print_renderer",
  "cap_geometry_formula_evaluation","cap_geometry_domain_validator","cap_geometry_diagram_representation"
]);
export const G6A_U06_P07F10_OPTIONAL_CAPABILITY_IDS=Object.freeze([]);
export const G6A_U06_P07F10_APPLIED_MODIFIER_IDS=Object.freeze([]);
export const G6A_U06_P07F10_INCLUDED_RELATIONS=Object.freeze([
  "IDENTIFY_SEMICIRCLE_BOUNDARY_AS_ARC_PLUS_DIAMETER",
  "COMPUTE_SEMICIRCLE_ARC_AS_HALF_CIRCUMFERENCE",
  "ADD_DIAMETER_TO_SEMICIRCLE_ARC",
  "VERIFY_SEMICIRCLE_PERIMETER_BOUNDARY_COMPONENTS"
]);
export const G6A_U06_P07F10_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g6a_u06_semicircle_perimeter",sourceId:G6A_U06_P07F10_SOURCE_ID,unitCode:G6A_U06_P07F10_UNIT_CODE,unitTitle:G6A_U06_P07F10_UNIT_TITLE,
  displayName:"半圓周長",primaryKnowledgePointId:G6A_U06_P07F10_KP_ID,knowledgePointIds:Object.freeze([G6A_U06_P07F10_KP_ID]),supportClass:"A",
  mode:"diagram",publicQuestionMode:"diagram",representationTag:"semicircle_perimeter_diagram",
  representationTags:Object.freeze(["geometry","circle","semicircle","perimeter","diameter","radius","pi","diagram"]),
  patternSpecIds:Object.freeze(["ps_g6a_u06_semicircle_perimeter_from_diameter","ps_g6a_u06_semicircle_perimeter_from_radius","ps_g6a_u06_semicircle_arc_plus_diameter"]),
  allocationPolicy:"balanced_pattern_spec",visibilityStatus:"visible",holdReason:null
});
function spec(id,family,targetKind,relation){
  return Object.freeze({
    patternSpecId:id,knowledgePointId:G6A_U06_P07F10_KP_ID,patternGroupId:G6A_U06_P07F10_PATTERN_GROUP.patternGroupId,patternFamilyId:family,relation,
    semanticCore:"SEMICIRCLE_PERIMETER_EQUALS_HALF_CIRCUMFERENCE_PLUS_DIAMETER",targetKind,questionMode:"diagram",answerDomain:"POSITIVE_DECIMAL_PERIMETER",
    representation:"semicircle_sector_180_diagram",requiresDiagramRepresentation:true,q006CircleCircumferenceFormulaPrerequisiteRequired:true,
    q004PiCircumferenceRelationPrerequisiteRequired:false,q004PiCircumferenceRelationMayBeConsumedTransitively:true,
    semicircleBoundaryMustIncludeArcAndDiameter:true,halfCircumferenceArcRequired:true,diameterStraightEdgeRequired:true,positiveDiameterOrRadiusRequired:true,
    approximatePiValue:3.14,computeFullCircumferenceAsIntermediateAllowed:true,computeHalfCircumferenceArcAllowed:true,addDiameterToArcRequired:true,
    q004PiRelationTeachingReownershipAllowed:false,q006CircleCircumferenceFormulaTeachingReownershipAllowed:false,sectorArcLengthAllowed:false,
    compositeArcPerimeterAllowed:false,stadiumCapsulePerimeterAllowed:false,rollingWheelDistanceApplicationAllowed:false,squareInscribedCircleBoundaryAllowed:false,
    genericGeometryFormulaDrillAllowed:false,applicationContextAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false
  });
}
export const G6A_U06_P07F10_PATTERN_SPECS=Object.freeze([
  spec("ps_g6a_u06_semicircle_perimeter_from_diameter","SEMICIRCLE_PERIMETER_FROM_DIAMETER","FROM_DIAMETER",G6A_U06_P07F10_INCLUDED_RELATIONS[2]),
  spec("ps_g6a_u06_semicircle_perimeter_from_radius","SEMICIRCLE_PERIMETER_FROM_RADIUS","FROM_RADIUS",G6A_U06_P07F10_INCLUDED_RELATIONS[2]),
  spec("ps_g6a_u06_semicircle_arc_plus_diameter","SEMICIRCLE_ARC_PLUS_DIAMETER","ARC_PLUS_DIAMETER",G6A_U06_P07F10_INCLUDED_RELATIONS[3])
]);
export const G6A_U06_P07F10_SPEC_IDS=Object.freeze(G6A_U06_P07F10_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G6A_U06_P07F10_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g6a_u06_semicircle_perimeter_p07f10",r04MappingId:"r04map_g6a_u06_semicircle_perimeter",sourceId:G6A_U06_P07F10_SOURCE_ID,
  r02EvidencePages:Object.freeze([1,2]),currentVisualSupportingPages:Object.freeze([1,2]),knowledgePointId:G6A_U06_P07F10_KP_ID,canonicalNameZh:"半圓周長",
  capabilityStatement:"學生能將半圓弧長與直徑相加求周長。",reasoningInvariant:"半圓周長包含半個圓周與一條直徑。",
  sourceSemanticCore:"SEMICIRCLE_PERIMETER_EQUALS_HALF_CIRCUMFERENCE_PLUS_DIAMETER",
  semanticAuthority:"R02_REVIEWED_CANDIDATE_AND_CURRENT_VISUAL_DIRECT_SEMICIRCLE_SUPPORT",currentVisualSupportLevel:"DIRECT_SEMICIRCLE_PERIMETER_AND_ARC_COMPOSITION_VISIBLE",
  primaryRuntimeProfileId:"profile_geometry_formula",classificationRuleId:"rule_geometry_formula",appliedRuntimeModifierIds:G6A_U06_P07F10_APPLIED_MODIFIER_IDS,
  requiredCapabilityIds:G6A_U06_P07F10_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G6A_U06_P07F10_OPTIONAL_CAPABILITY_IDS,queueRequiredW7CapabilityIds:G6A_U06_P07F10_QUEUE_REQUIRED_CAPABILITY_IDS,
  patternSpecIds:G6A_U06_P07F10_SPEC_IDS,q006CircleCircumferenceFormulaPrerequisiteRequired:true,q004PiCircumferenceRelationPrerequisiteRequired:false,
  semicircleBoundaryMustIncludeArcAndDiameter:true,halfCircumferenceArcRequired:true,diameterStraightEdgeRequired:true,approximatePiValue:3.14,
  q004PiRelationTeachingReownershipAllowed:false,q006CircleCircumferenceFormulaTeachingReownershipAllowed:false,sectorArcLengthAllowed:false,compositeArcPerimeterAllowed:false,
  stadiumCapsulePerimeterAllowed:false,rollingWheelDistanceApplicationAllowed:false,squareInscribedCircleBoundaryAllowed:false,applicationContextAllowed:false,
  sameUnitMixedAllowed:false,crossUnitMixedAllowed:false,r04ReclassificationAllowed:false,frozenQueueMutationAllowed:false
});
export const G6A_U06_P07F10_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G6A_U06_P07F10_KP_ID,sourceId:G6A_U06_P07F10_SOURCE_ID,unitCode:G6A_U06_P07F10_UNIT_CODE,unitTitle:G6A_U06_P07F10_UNIT_TITLE,
  displayName:"半圓周長",canonicalNameZh:"半圓周長",mode:"diagram",questionMode:"diagram",questionModes:Object.freeze(["diagram"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,
  applicationClassification:"DIAGRAM_FORMULA_ONLY_APPLICATION_NOT_ADMITTED",canonicalPatternGroupIds:Object.freeze([G6A_U06_P07F10_PATTERN_GROUP.patternGroupId]),
  canonicalPatternSpecIds:G6A_U06_P07F10_SPEC_IDS,patternGroupIds:Object.freeze([G6A_U06_P07F10_PATTERN_GROUP.patternGroupId]),patternSpecIds:G6A_U06_P07F10_SPEC_IDS,
  requiredCapabilityIds:G6A_U06_P07F10_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G6A_U06_P07F10_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P07F10_G6A_U06_SOURCE_BACKED_SEMICIRCLE_PERIMETER",productionUse:"full_product_w7_slice010_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6AU06P07F10SelectorRow=id=>id===G6A_U06_P07F10_KP_ID?clone(G6A_U06_P07F10_SELECTOR_ROW):null;
export const listG6AU06P07F10PatternGroups=id=>id===G6A_U06_P07F10_KP_ID?[clone(G6A_U06_P07F10_PATTERN_GROUP)]:[];
export const resolveG6AU06P07F10PatternSpecIds=id=>id===G6A_U06_P07F10_KP_ID?clone(G6A_U06_P07F10_SPEC_IDS):[];
export function auditG6AU06P07F10Projection(){
  const e=[],m=G6A_U06_P07F10_FORMAL_MAPPING;
  if(G6A_U06_P07F10_PATTERN_SPECS.length!==3||m.patternSpecIds.length!==3||new Set(G6A_U06_P07F10_SPEC_IDS).size!==3)e.push("P07F10_PATTERN_CARDINALITY_INVALID");
  if(G6A_U06_P07F10_PATTERN_SPECS.some(x=>x.questionMode!=="diagram"||x.semanticCore!=="SEMICIRCLE_PERIMETER_EQUALS_HALF_CIRCUMFERENCE_PLUS_DIAMETER"||!x.requiresDiagramRepresentation||!x.q006CircleCircumferenceFormulaPrerequisiteRequired||x.q004PiCircumferenceRelationPrerequisiteRequired||!x.semicircleBoundaryMustIncludeArcAndDiameter||!x.halfCircumferenceArcRequired||!x.diameterStraightEdgeRequired||x.approximatePiValue!==3.14||x.q004PiRelationTeachingReownershipAllowed||x.q006CircleCircumferenceFormulaTeachingReownershipAllowed||x.sectorArcLengthAllowed||x.compositeArcPerimeterAllowed||x.stadiumCapsulePerimeterAllowed||x.rollingWheelDistanceApplicationAllowed||x.squareInscribedCircleBoundaryAllowed||x.applicationContextAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed))e.push("P07F10_PATTERN_SCOPE_INVALID");
  if(m.primaryRuntimeProfileId!=="profile_geometry_formula"||m.classificationRuleId!=="rule_geometry_formula"||m.appliedRuntimeModifierIds.length!==0||m.semanticAuthority!=="R02_REVIEWED_CANDIDATE_AND_CURRENT_VISUAL_DIRECT_SEMICIRCLE_SUPPORT"||!m.q006CircleCircumferenceFormulaPrerequisiteRequired||m.q004PiCircumferenceRelationPrerequisiteRequired||m.q004PiRelationTeachingReownershipAllowed||m.q006CircleCircumferenceFormulaTeachingReownershipAllowed||m.sectorArcLengthAllowed||m.compositeArcPerimeterAllowed||m.applicationContextAllowed||m.sameUnitMixedAllowed||m.crossUnitMixedAllowed||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed)e.push("P07F10_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1})});
}
