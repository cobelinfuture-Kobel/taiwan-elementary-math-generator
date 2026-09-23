export const P07F17_TASK_ID="P07F_W7DirectProductVerticalSlice017Implementation";
export const G6A_U07_P07F17_SOURCE_ID="g6a_u07_6a07";
export const G6A_U07_P07F17_UNIT_CODE="6A-U07";
export const G6A_U07_P07F17_UNIT_TITLE="圓面積和扇形面積";
export const G6A_U07_P07F17_KP_ID="kp_g6a_u07_annulus_area";
export const G6A_U07_P07F17_PREDECESSOR_KP_IDS=Object.freeze(["kp_g6a_u07_circle_area_formula"]);
export const G6A_U07_P07F17_PREDECESSOR_VISIBLE_KP_IDS=Object.freeze(["kp_g6a_u07_circle_area_derivation","kp_g6a_u07_circle_area_formula"]);
export const G6A_U07_P07F17_PROTECTED_FUTURE_KP_IDS=Object.freeze(["kp_g6a_u07_sector_area","kp_g6a_u07_composite_circle_area"]);
export const G6A_U07_P07F17_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly","cap_answer_key_projection","cap_html_print_renderer",
  "cap_geometry_formula_evaluation","cap_geometry_domain_validator","cap_geometry_diagram_representation"
]);
export const G6A_U07_P07F17_OPTIONAL_CAPABILITY_IDS=Object.freeze([]);
export const G6A_U07_P07F17_APPLIED_MODIFIER_IDS=Object.freeze([]);
export const G6A_U07_P07F17_INCLUDED_RELATIONS=Object.freeze([
  "ANNULUS_AREA_OUTER_MINUS_INNER",
  "ANNULUS_FROM_INNER_DIAMETER_AND_RADIAL_THICKNESS",
  "ANNULUS_FROM_INNER_RADIUS_AND_RADIAL_THICKNESS"
]);
export const G6A_U07_P07F17_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g6a_u07_annulus_area",sourceId:G6A_U07_P07F17_SOURCE_ID,unitCode:G6A_U07_P07F17_UNIT_CODE,unitTitle:G6A_U07_P07F17_UNIT_TITLE,
  displayName:"圓環面積",primaryKnowledgePointId:G6A_U07_P07F17_KP_ID,knowledgePointIds:Object.freeze([G6A_U07_P07F17_KP_ID]),
  supportClass:"A",mode:"diagram",publicQuestionMode:"diagram",representationTag:"annulus_area_diagram",
  representationTags:Object.freeze(["geometry","circle","annulus","area","radius","diameter","radial_thickness","pi","diagram"]),
  patternSpecIds:Object.freeze([
    "ps_g6a_u07_annulus_outer_inner_radii",
    "ps_g6a_u07_annulus_inner_diameter_thickness",
    "ps_g6a_u07_annulus_inner_radius_thickness"
  ]),
  allocationPolicy:"balanced_pattern_spec",visibilityStatus:"visible",holdReason:null
});
function spec(id,family,targetKind,relation){
  return Object.freeze({
    patternSpecId:id,knowledgePointId:G6A_U07_P07F17_KP_ID,patternGroupId:G6A_U07_P07F17_PATTERN_GROUP.patternGroupId,
    patternFamilyId:family,relation,semanticCore:"ANNULUS_AREA_AS_OUTER_CIRCLE_AREA_MINUS_INNER_CIRCLE_AREA",targetKind,
    questionMode:"diagram",answerDomain:"POSITIVE_DECIMAL_AREA",representation:"annulus_area_diagram",requiresDiagramRepresentation:true,
    q014CircleAreaFormulaPrerequisiteRequired:true,outerMinusInnerRequired:true,concentricCirclesRequired:true,
    positiveRadiiRequired:true,outerRadiusGreaterThanInnerRadiusRequired:true,
    innerDiameterToRadiusNormalizationRequired:targetKind==="INNER_DIAMETER_AND_THICKNESS",
    radialThicknessToOuterRadiusRequired:["INNER_DIAMETER_AND_THICKNESS","INNER_RADIUS_AND_THICKNESS"].includes(targetKind),
    approximatePiValue:3.14,q011DerivationTeachingReownershipAllowed:false,q014CircleAreaFormulaTeachingReownershipAllowed:false,
    sectorAreaAllowed:false,compositeCircleAreaAllowed:false,circularSegmentAreaAllowed:false,cowGrazingApplicationAllowed:false,
    sameUnitMixedAllowed:false,crossUnitMixedAllowed:false
  });
}
export const G6A_U07_P07F17_PATTERN_SPECS=Object.freeze([
  spec("ps_g6a_u07_annulus_outer_inner_radii","ANNULUS_OUTER_INNER_RADII","OUTER_AND_INNER_RADII",G6A_U07_P07F17_INCLUDED_RELATIONS[0]),
  spec("ps_g6a_u07_annulus_inner_diameter_thickness","ANNULUS_INNER_DIAMETER_THICKNESS","INNER_DIAMETER_AND_THICKNESS",G6A_U07_P07F17_INCLUDED_RELATIONS[1]),
  spec("ps_g6a_u07_annulus_inner_radius_thickness","ANNULUS_INNER_RADIUS_THICKNESS","INNER_RADIUS_AND_THICKNESS",G6A_U07_P07F17_INCLUDED_RELATIONS[2])
]);
export const G6A_U07_P07F17_SPEC_IDS=Object.freeze(G6A_U07_P07F17_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G6A_U07_P07F17_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g6a_u07_annulus_area_p07f17",r04MappingId:"r04map_g6a_u07_annulus_area",
  sourceId:G6A_U07_P07F17_SOURCE_ID,r02EvidencePages:Object.freeze([1,2]),currentVisualSupportingPages:Object.freeze([1]),
  knowledgePointId:G6A_U07_P07F17_KP_ID,canonicalNameZh:"圓環面積",capabilityStatement:"學生能以大圓面積減小圓面積求圓環。",
  reasoningInvariant:"同心圓間區域等於外圓扣除內圓。",sourceSemanticCore:"ANNULUS_AREA_AS_OUTER_CIRCLE_AREA_MINUS_INNER_CIRCLE_AREA",
  semanticAuthority:"R02_REVIEWED_CANDIDATE_PLUS_CURRENT_DIRECT_LITERAL_ANNULUS_AREA_APPLICATION_EVIDENCE",
  currentVisualSupportLevel:"DIRECT_LITERAL_ANNULUS_AREA_APPLICATION_EVIDENCE",
  primaryRuntimeProfileId:"profile_geometry_formula",classificationRuleId:"rule_geometry_formula",
  appliedRuntimeModifierIds:G6A_U07_P07F17_APPLIED_MODIFIER_IDS,requiredCapabilityIds:G6A_U07_P07F17_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6A_U07_P07F17_OPTIONAL_CAPABILITY_IDS,patternSpecIds:G6A_U07_P07F17_SPEC_IDS,
  requiredPrerequisiteKnowledgePointIds:G6A_U07_P07F17_PREDECESSOR_KP_IDS,
  outerMinusInnerRequired:true,concentricCirclesRequired:true,positiveRadiiRequired:true,outerRadiusGreaterThanInnerRadiusRequired:true,
  innerDiameterToRadiusNormalizationAllowed:true,radialThicknessToOuterRadiusAllowed:true,approximatePiValue:3.14,
  q011DerivationTeachingReownershipAllowed:false,q014CircleAreaFormulaTeachingReownershipAllowed:false,sectorAreaAllowed:false,
  compositeCircleAreaAllowed:false,circularSegmentAreaAllowed:false,cowGrazingApplicationAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false,
  r04ReclassificationAllowed:false,frozenQueueMutationAllowed:false
});
export const G6A_U07_P07F17_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G6A_U07_P07F17_KP_ID,sourceId:G6A_U07_P07F17_SOURCE_ID,unitCode:G6A_U07_P07F17_UNIT_CODE,unitTitle:G6A_U07_P07F17_UNIT_TITLE,
  displayName:"圓環面積",canonicalNameZh:"圓環面積",mode:"diagram",questionMode:"diagram",questionModes:Object.freeze(["diagram"]),supportClass:"A",
  visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:"SOURCE_BACKED_ANNULUS_APPLICATION_ADMITTED",
  canonicalPatternGroupIds:Object.freeze([G6A_U07_P07F17_PATTERN_GROUP.patternGroupId]),canonicalPatternSpecIds:G6A_U07_P07F17_SPEC_IDS,
  patternGroupIds:Object.freeze([G6A_U07_P07F17_PATTERN_GROUP.patternGroupId]),patternSpecIds:G6A_U07_P07F17_SPEC_IDS,
  requiredCapabilityIds:G6A_U07_P07F17_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G6A_U07_P07F17_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P07F17_G6A_U07_SOURCE_BACKED_ANNULUS_AREA",productionUse:"full_product_w7_slice017_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6AU07P07F17SelectorRow=id=>id===G6A_U07_P07F17_KP_ID?clone(G6A_U07_P07F17_SELECTOR_ROW):null;
export const listG6AU07P07F17PatternGroups=id=>id===G6A_U07_P07F17_KP_ID?[clone(G6A_U07_P07F17_PATTERN_GROUP)]:[];
export const resolveG6AU07P07F17PatternSpecIds=id=>id===G6A_U07_P07F17_KP_ID?clone(G6A_U07_P07F17_SPEC_IDS):[];
export function auditG6AU07P07F17Projection(){
  const e=[];
  if(G6A_U07_P07F17_PATTERN_SPECS.length!==3||G6A_U07_P07F17_FORMAL_MAPPING.patternSpecIds.length!==3)e.push("P07F17_PATTERN_CARDINALITY_INVALID");
  if(new Set(G6A_U07_P07F17_SPEC_IDS).size!==3)e.push("P07F17_PATTERN_SPEC_DUPLICATE");
  for(const x of G6A_U07_P07F17_PATTERN_SPECS){
    if(x.questionMode!=="diagram"||x.semanticCore!=="ANNULUS_AREA_AS_OUTER_CIRCLE_AREA_MINUS_INNER_CIRCLE_AREA"||!x.requiresDiagramRepresentation||!x.q014CircleAreaFormulaPrerequisiteRequired||
      !x.outerMinusInnerRequired||!x.concentricCirclesRequired||!x.positiveRadiiRequired||!x.outerRadiusGreaterThanInnerRadiusRequired||x.approximatePiValue!==3.14||
      x.q011DerivationTeachingReownershipAllowed||x.q014CircleAreaFormulaTeachingReownershipAllowed||x.sectorAreaAllowed||x.compositeCircleAreaAllowed||
      x.circularSegmentAreaAllowed||x.cowGrazingApplicationAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed)e.push("P07F17_PATTERN_SCOPE_INVALID:"+x.patternSpecId);
  }
  const m=G6A_U07_P07F17_FORMAL_MAPPING;
  if(m.primaryRuntimeProfileId!=="profile_geometry_formula"||m.classificationRuleId!=="rule_geometry_formula"||m.appliedRuntimeModifierIds.length!==0||
    m.semanticAuthority!=="R02_REVIEWED_CANDIDATE_PLUS_CURRENT_DIRECT_LITERAL_ANNULUS_AREA_APPLICATION_EVIDENCE"||
    !m.outerMinusInnerRequired||!m.concentricCirclesRequired||!m.outerRadiusGreaterThanInnerRadiusRequired||!m.innerDiameterToRadiusNormalizationAllowed||
    !m.radialThicknessToOuterRadiusAllowed||m.q011DerivationTeachingReownershipAllowed||m.q014CircleAreaFormulaTeachingReownershipAllowed||m.sectorAreaAllowed||
    m.compositeCircleAreaAllowed||m.sameUnitMixedAllowed||m.crossUnitMixedAllowed||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed)e.push("P07F17_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1})});
}
