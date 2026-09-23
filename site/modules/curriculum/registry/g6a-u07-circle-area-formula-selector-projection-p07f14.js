export const P07F14_TASK_ID="P07F_W7DirectProductVerticalSlice014Implementation";
export const G6A_U07_P07F14_SOURCE_ID="g6a_u07_6a07";
export const G6A_U07_P07F14_UNIT_CODE="6A-U07";
export const G6A_U07_P07F14_UNIT_TITLE="圓面積和扇形面積";
export const G6A_U07_P07F14_KP_ID="kp_g6a_u07_circle_area_formula";
export const G6A_U07_P07F14_PREDECESSOR_KP_IDS=Object.freeze(["kp_g6a_u07_circle_area_derivation"]);
export const G6A_U07_P07F14_PROTECTED_FUTURE_KP_IDS=Object.freeze([
  "kp_g6a_u07_sector_area",
  "kp_g6a_u07_annulus_area",
  "kp_g6a_u07_composite_circle_area"
]);
export const G6A_U07_P07F14_QUEUE_REQUIRED_CAPABILITY_IDS=Object.freeze([]);
export const G6A_U07_P07F14_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution",
  "cap_deterministic_answer_model",
  "cap_worksheet_document_assembly",
  "cap_answer_key_projection",
  "cap_html_print_renderer",
  "cap_geometry_formula_evaluation",
  "cap_geometry_domain_validator",
  "cap_geometry_diagram_representation"
]);
export const G6A_U07_P07F14_OPTIONAL_CAPABILITY_IDS=Object.freeze([]);
export const G6A_U07_P07F14_APPLIED_MODIFIER_IDS=Object.freeze([]);
export const G6A_U07_P07F14_INCLUDED_RELATIONS=Object.freeze([
  "COMPUTE_CIRCLE_AREA_FROM_RADIUS",
  "COMPUTE_CIRCLE_AREA_FROM_DIAMETER_AFTER_RADIUS_NORMALIZATION",
  "IDENTIFY_RADIUS_SQUARED_SCALING_IN_CIRCLE_AREA_FORMULA"
]);

export const G6A_U07_P07F14_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g6a_u07_circle_area_formula",
  sourceId:G6A_U07_P07F14_SOURCE_ID,
  unitCode:G6A_U07_P07F14_UNIT_CODE,
  unitTitle:G6A_U07_P07F14_UNIT_TITLE,
  displayName:"圓面積公式",
  primaryKnowledgePointId:G6A_U07_P07F14_KP_ID,
  knowledgePointIds:Object.freeze([G6A_U07_P07F14_KP_ID]),
  supportClass:"A",
  mode:"diagram",
  publicQuestionMode:"diagram",
  representationTag:"circle_parts_diagram",
  representationTags:Object.freeze(["geometry","circle","area","radius","diameter","pi","formula","diagram"]),
  patternSpecIds:Object.freeze([
    "ps_g6a_u07_circle_area_from_radius",
    "ps_g6a_u07_circle_area_from_diameter",
    "ps_g6a_u07_circle_area_radius_squared_scaling"
  ]),
  allocationPolicy:"balanced_pattern_spec",
  visibilityStatus:"visible",
  holdReason:null
});

function spec(id,family,targetKind,relation){
  return Object.freeze({
    patternSpecId:id,
    knowledgePointId:G6A_U07_P07F14_KP_ID,
    patternGroupId:G6A_U07_P07F14_PATTERN_GROUP.patternGroupId,
    patternFamilyId:family,
    relation,
    semanticCore:"CIRCLE_AREA_FORMULA_EVALUATION_PI_R_SQUARED_WITH_RADIUS_DIAMETER_NORMALIZATION",
    targetKind,
    questionMode:"diagram",
    answerDomain:targetKind==="RADIUS_SQUARED_SCALING"?"POSITIVE_INTEGER_AREA_FACTOR":"POSITIVE_DECIMAL_AREA",
    representation:"circle_parts_diagram_with_circle_area_formula",
    requiresDiagramRepresentation:true,
    q011CircleAreaDerivationPrerequisiteRequired:true,
    circleAreaFormulaRequired:"A = π × r²",
    radiusSquaredRequired:true,
    diameterToRadiusNormalizationRequired:targetKind==="FROM_DIAMETER",
    positiveRadiusRequired:true,
    approximatePiValue:3.14,
    computeCircleAreaFromRadiusAllowed:true,
    computeCircleAreaFromDiameterAllowed:true,
    identifyRadiusSquaredScalingAllowed:true,
    q011DerivationTeachingReownershipAllowed:false,
    sectorAreaAllowed:false,
    annulusAreaAllowed:false,
    compositeCircleAreaAllowed:false,
    circularSegmentAreaAllowed:false,
    cowGrazingApplicationAllowed:false,
    semicirclePerimeterTeachingAllowed:false,
    applicationContextAllowed:false,
    sameUnitMixedAllowed:false,
    crossUnitMixedAllowed:false
  });
}

export const G6A_U07_P07F14_PATTERN_SPECS=Object.freeze([
  spec("ps_g6a_u07_circle_area_from_radius","CIRCLE_AREA_FROM_RADIUS","FROM_RADIUS",G6A_U07_P07F14_INCLUDED_RELATIONS[0]),
  spec("ps_g6a_u07_circle_area_from_diameter","CIRCLE_AREA_FROM_DIAMETER","FROM_DIAMETER",G6A_U07_P07F14_INCLUDED_RELATIONS[1]),
  spec("ps_g6a_u07_circle_area_radius_squared_scaling","CIRCLE_AREA_RADIUS_SQUARED_SCALING","RADIUS_SQUARED_SCALING",G6A_U07_P07F14_INCLUDED_RELATIONS[2])
]);
export const G6A_U07_P07F14_SPEC_IDS=Object.freeze(G6A_U07_P07F14_PATTERN_SPECS.map(x=>x.patternSpecId));

export const G6A_U07_P07F14_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g6a_u07_circle_area_formula_p07f14",
  r04MappingId:"r04map_g6a_u07_circle_area_formula",
  sourceId:G6A_U07_P07F14_SOURCE_ID,
  r02EvidencePages:Object.freeze([1,2]),
  currentVisualSupportingPages:Object.freeze([1,2]),
  knowledgePointId:G6A_U07_P07F14_KP_ID,
  canonicalNameZh:"圓面積公式",
  capabilityStatement:"學生能以圓周率乘半徑平方求圓面積。",
  reasoningInvariant:"圓面積由半徑平方縮放，直徑須先換成半徑。",
  sourceSemanticCore:"CIRCLE_AREA_FORMULA_EVALUATION_PI_R_SQUARED_WITH_RADIUS_DIAMETER_NORMALIZATION",
  semanticAuthority:"R02_REVIEWED_CANDIDATE_PLUS_CURRENT_DIRECT_OPERATIONAL_CIRCLE_AREA_FORMULA_APPLICATION_EVIDENCE",
  currentVisualSupportLevel:"DIRECT_OPERATIONAL_FORMULA_APPLICATION_EVIDENCE",
  primaryRuntimeProfileId:"profile_geometry_formula",
  classificationRuleId:"rule_geometry_formula",
  appliedRuntimeModifierIds:G6A_U07_P07F14_APPLIED_MODIFIER_IDS,
  requiredCapabilityIds:G6A_U07_P07F14_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6A_U07_P07F14_OPTIONAL_CAPABILITY_IDS,
  queueRequiredW7CapabilityIds:G6A_U07_P07F14_QUEUE_REQUIRED_CAPABILITY_IDS,
  patternSpecIds:G6A_U07_P07F14_SPEC_IDS,
  requiredPrerequisiteKnowledgePointIds:G6A_U07_P07F14_PREDECESSOR_KP_IDS,
  q011CircleAreaDerivationPrerequisiteRequired:true,
  circleAreaFormulaRequired:"A = π × r²",
  radiusSquaredRequired:true,
  diameterToRadiusNormalizationRequired:true,
  positiveRadiusRequired:true,
  approximatePiValue:3.14,
  computeCircleAreaFromRadiusAllowed:true,
  computeCircleAreaFromDiameterAllowed:true,
  identifyRadiusSquaredScalingAllowed:true,
  q011DerivationTeachingReownershipAllowed:false,
  sectorAreaAllowed:false,
  annulusAreaAllowed:false,
  compositeCircleAreaAllowed:false,
  circularSegmentAreaAllowed:false,
  cowGrazingApplicationAllowed:false,
  semicirclePerimeterTeachingAllowed:false,
  applicationContextAllowed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false,
  r04ReclassificationAllowed:false,
  frozenQueueMutationAllowed:false
});

export const G6A_U07_P07F14_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G6A_U07_P07F14_KP_ID,
  sourceId:G6A_U07_P07F14_SOURCE_ID,
  unitCode:G6A_U07_P07F14_UNIT_CODE,
  unitTitle:G6A_U07_P07F14_UNIT_TITLE,
  displayName:"圓面積公式",
  canonicalNameZh:"圓面積公式",
  mode:"diagram",
  questionMode:"diagram",
  questionModes:Object.freeze(["diagram"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:"DIAGRAM_FORMULA_ONLY_APPLICATION_NOT_ADMITTED",
  canonicalPatternGroupIds:Object.freeze([G6A_U07_P07F14_PATTERN_GROUP.patternGroupId]),
  canonicalPatternSpecIds:G6A_U07_P07F14_SPEC_IDS,
  patternGroupIds:Object.freeze([G6A_U07_P07F14_PATTERN_GROUP.patternGroupId]),
  patternSpecIds:G6A_U07_P07F14_SPEC_IDS,
  requiredCapabilityIds:G6A_U07_P07F14_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6A_U07_P07F14_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P07F14_G6A_U07_SOURCE_BACKED_CIRCLE_AREA_FORMULA",
  productionUse:"full_product_w7_slice014_candidate"
});

const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6AU07P07F14SelectorRow=id=>id===G6A_U07_P07F14_KP_ID?clone(G6A_U07_P07F14_SELECTOR_ROW):null;
export const listG6AU07P07F14PatternGroups=id=>id===G6A_U07_P07F14_KP_ID?[clone(G6A_U07_P07F14_PATTERN_GROUP)]:[];
export const resolveG6AU07P07F14PatternSpecIds=id=>id===G6A_U07_P07F14_KP_ID?clone(G6A_U07_P07F14_SPEC_IDS):[];

export function auditG6AU07P07F14Projection(){
  const e=[];
  if(G6A_U07_P07F14_PATTERN_SPECS.length!==3||G6A_U07_P07F14_FORMAL_MAPPING.patternSpecIds.length!==3)e.push("P07F14_PATTERN_CARDINALITY_INVALID");
  if(new Set(G6A_U07_P07F14_SPEC_IDS).size!==3)e.push("P07F14_PATTERN_SPEC_DUPLICATE");
  for(const x of G6A_U07_P07F14_PATTERN_SPECS){
    if(x.questionMode!=="diagram"||x.semanticCore!=="CIRCLE_AREA_FORMULA_EVALUATION_PI_R_SQUARED_WITH_RADIUS_DIAMETER_NORMALIZATION"||!x.requiresDiagramRepresentation||!x.q011CircleAreaDerivationPrerequisiteRequired||x.circleAreaFormulaRequired!=="A = π × r²"||!x.radiusSquaredRequired||!x.positiveRadiusRequired||x.approximatePiValue!==3.14||!x.computeCircleAreaFromRadiusAllowed||!x.computeCircleAreaFromDiameterAllowed||!x.identifyRadiusSquaredScalingAllowed||x.q011DerivationTeachingReownershipAllowed||x.sectorAreaAllowed||x.annulusAreaAllowed||x.compositeCircleAreaAllowed||x.circularSegmentAreaAllowed||x.cowGrazingApplicationAllowed||x.semicirclePerimeterTeachingAllowed||x.applicationContextAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed)e.push("P07F14_PATTERN_SCOPE_INVALID:"+x.patternSpecId);
  }
  const m=G6A_U07_P07F14_FORMAL_MAPPING;
  if(m.primaryRuntimeProfileId!=="profile_geometry_formula"||m.classificationRuleId!=="rule_geometry_formula"||m.appliedRuntimeModifierIds.length!==0||m.semanticAuthority!=="R02_REVIEWED_CANDIDATE_PLUS_CURRENT_DIRECT_OPERATIONAL_CIRCLE_AREA_FORMULA_APPLICATION_EVIDENCE"||m.currentVisualSupportLevel!=="DIRECT_OPERATIONAL_FORMULA_APPLICATION_EVIDENCE"||m.circleAreaFormulaRequired!=="A = π × r²"||!m.radiusSquaredRequired||!m.diameterToRadiusNormalizationRequired||m.q011DerivationTeachingReownershipAllowed||m.sectorAreaAllowed||m.annulusAreaAllowed||m.compositeCircleAreaAllowed||m.applicationContextAllowed||m.sameUnitMixedAllowed||m.crossUnitMixedAllowed||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed)e.push("P07F14_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1})});
}
