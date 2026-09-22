export const P07F06_TASK_ID="P07F_W7DirectProductVerticalSlice006Implementation";
export const G6A_U06_P07F06_SOURCE_ID="g6a_u06_6a06";
export const G6A_U06_P07F06_UNIT_CODE="6A-U06";
export const G6A_U06_P07F06_UNIT_TITLE="圓周長與扇形周長";
export const G6A_U06_P07F06_KP_ID="kp_g6a_u06_circle_circumference_formula";
export const G6A_U06_P07F06_PREDECESSOR_KP_IDS=Object.freeze(["kp_g6a_u06_pi_circumference_relation"]);
export const G6A_U06_P07F06_PROTECTED_FUTURE_KP_IDS=Object.freeze([
  "kp_g6a_u06_semicircle_perimeter",
  "kp_g6a_u06_sector_arc_length",
  "kp_g6a_u06_composite_arc_perimeter"
]);
export const G6A_U06_P07F06_QUEUE_REQUIRED_CAPABILITY_IDS=Object.freeze([]);
export const G6A_U06_P07F06_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution",
  "cap_deterministic_answer_model",
  "cap_worksheet_document_assembly",
  "cap_answer_key_projection",
  "cap_html_print_renderer",
  "cap_geometry_formula_evaluation",
  "cap_geometry_domain_validator",
  "cap_geometry_diagram_representation"
]);
export const G6A_U06_P07F06_OPTIONAL_CAPABILITY_IDS=Object.freeze([]);
export const G6A_U06_P07F06_APPLIED_MODIFIER_IDS=Object.freeze([]);
export const G6A_U06_P07F06_INCLUDED_RELATIONS=Object.freeze([
  "COMPUTE_CIRCUMFERENCE_FROM_DIAMETER_USING_PI_D",
  "COMPUTE_CIRCUMFERENCE_FROM_RADIUS_USING_TWO_PI_R",
  "VERIFY_DIAMETER_RADIUS_FORMULA_EQUIVALENCE",
  "PRESERVE_DIAMETER_EQUALS_TWO_RADIUS_INVARIANT"
]);
export const G6A_U06_P07F06_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g6a_u06_circle_circumference_formula",
  sourceId:G6A_U06_P07F06_SOURCE_ID,
  unitCode:G6A_U06_P07F06_UNIT_CODE,
  unitTitle:G6A_U06_P07F06_UNIT_TITLE,
  displayName:"圓周長公式",
  primaryKnowledgePointId:G6A_U06_P07F06_KP_ID,
  knowledgePointIds:Object.freeze([G6A_U06_P07F06_KP_ID]),
  supportClass:"A",
  mode:"diagram",
  publicQuestionMode:"diagram",
  representationTag:"circle_circumference_formula_diagram",
  representationTags:Object.freeze(["geometry","circle","circumference","diameter","radius","pi","formula","diagram"]),
  patternSpecIds:Object.freeze([
    "ps_g6a_u06_circumference_from_diameter",
    "ps_g6a_u06_circumference_from_radius",
    "ps_g6a_u06_circumference_formula_equivalence"
  ]),
  allocationPolicy:"balanced_pattern_spec",
  visibilityStatus:"visible",
  holdReason:null
});
function spec(id,family,targetKind){
  return Object.freeze({
    patternSpecId:id,
    knowledgePointId:G6A_U06_P07F06_KP_ID,
    patternGroupId:G6A_U06_P07F06_PATTERN_GROUP.patternGroupId,
    patternFamilyId:family,
    relation:targetKind==="FROM_DIAMETER"?G6A_U06_P07F06_INCLUDED_RELATIONS[0]:targetKind==="FROM_RADIUS"?G6A_U06_P07F06_INCLUDED_RELATIONS[1]:G6A_U06_P07F06_INCLUDED_RELATIONS[2],
    semanticCore:"CIRCLE_CIRCUMFERENCE_FROM_DIAMETER_OR_RADIUS_FORMULA",
    targetKind,
    questionMode:"diagram",
    answerDomain:"POSITIVE_DECIMAL_CIRCUMFERENCE",
    representation:"circle_parts_diagram_with_circumference_formula",
    requiresDiagramRepresentation:true,
    q004PiCircumferenceRelationPrerequisiteRequired:true,
    multiplicationPrerequisiteRequired:true,
    circumferenceRoleRequired:true,
    diameterOrRadiusInputRoleRequired:true,
    diameterEqualsTwoRadiusRequired:true,
    diameterFormulaRequired:"C = π × d",
    radiusFormulaRequired:"C = 2 × π × r",
    twoFormulaEquivalenceRequired:true,
    positiveDiameterOrRadiusRequired:true,
    approximatePiValue:3.14,
    solveCircumferenceFromDiameterAllowed:true,
    solveCircumferenceFromRadiusAllowed:true,
    solveDiameterFromCircumferenceAllowed:false,
    solveRadiusFromCircumferenceAllowed:false,
    q004PiRelationTeachingReownershipAllowed:false,
    semicirclePerimeterAllowed:false,
    sectorArcLengthAllowed:false,
    compositeArcPerimeterAllowed:false,
    rollingWheelDistanceApplicationAllowed:false,
    applicationContextAllowed:false,
    sameUnitMixedAllowed:false,
    crossUnitMixedAllowed:false
  });
}
export const G6A_U06_P07F06_PATTERN_SPECS=Object.freeze([
  spec("ps_g6a_u06_circumference_from_diameter","CIRCUMFERENCE_FROM_DIAMETER","FROM_DIAMETER"),
  spec("ps_g6a_u06_circumference_from_radius","CIRCUMFERENCE_FROM_RADIUS","FROM_RADIUS"),
  spec("ps_g6a_u06_circumference_formula_equivalence","CIRCUMFERENCE_FORMULA_EQUIVALENCE","FORMULA_EQUIVALENCE")
]);
export const G6A_U06_P07F06_SPEC_IDS=Object.freeze(G6A_U06_P07F06_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G6A_U06_P07F06_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g6a_u06_circle_circumference_formula_p07f06",
  r04MappingId:"r04map_g6a_u06_circle_circumference_formula",
  sourceId:G6A_U06_P07F06_SOURCE_ID,
  r02EvidencePages:Object.freeze([1,2]),
  currentVisualSupportingPages:Object.freeze([1,2]),
  knowledgePointId:G6A_U06_P07F06_KP_ID,
  canonicalNameZh:"圓周長公式",
  capabilityStatement:"學生能用直徑乘圓周率或半徑乘2乘圓周率求圓周長。",
  reasoningInvariant:"直徑等於兩倍半徑，兩種公式必須等值。",
  sourceSemanticCore:"CIRCLE_CIRCUMFERENCE_FROM_DIAMETER_OR_RADIUS_FORMULA",
  semanticAuthority:"R02_REVIEWED_CANDIDATE_PRIMARY_CURRENT_VISUAL_CIRCUMFERENCE_CONTEXT_SECONDARY",
  currentVisualSupportLevel:"CIRCUMFERENCE_APPLICATION_CONTEXT_VISIBLE_FORMULA_LITERAL_NOT_ASSERTED",
  primaryRuntimeProfileId:"profile_geometry_formula",
  classificationRuleId:"rule_geometry_formula",
  appliedRuntimeModifierIds:G6A_U06_P07F06_APPLIED_MODIFIER_IDS,
  requiredCapabilityIds:G6A_U06_P07F06_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6A_U06_P07F06_OPTIONAL_CAPABILITY_IDS,
  queueRequiredW7CapabilityIds:G6A_U06_P07F06_QUEUE_REQUIRED_CAPABILITY_IDS,
  patternSpecIds:G6A_U06_P07F06_SPEC_IDS,
  q004PiCircumferenceRelationPrerequisiteRequired:true,
  multiplicationPrerequisiteRequired:true,
  diameterFormulaRequired:"C = π × d",
  radiusFormulaRequired:"C = 2 × π × r",
  twoFormulaEquivalenceRequired:true,
  solveDiameterFromCircumferenceAllowed:false,
  solveRadiusFromCircumferenceAllowed:false,
  q004PiRelationTeachingReownershipAllowed:false,
  semicirclePerimeterAllowed:false,
  sectorArcLengthAllowed:false,
  compositeArcPerimeterAllowed:false,
  rollingWheelDistanceApplicationAllowed:false,
  applicationContextAllowed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false,
  r04ReclassificationAllowed:false,
  frozenQueueMutationAllowed:false
});
export const G6A_U06_P07F06_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G6A_U06_P07F06_KP_ID,
  sourceId:G6A_U06_P07F06_SOURCE_ID,
  unitCode:G6A_U06_P07F06_UNIT_CODE,
  unitTitle:G6A_U06_P07F06_UNIT_TITLE,
  displayName:"圓周長公式",
  canonicalNameZh:"圓周長公式",
  mode:"diagram",
  questionMode:"diagram",
  questionModes:Object.freeze(["diagram"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:"DIAGRAM_FORMULA_ONLY_APPLICATION_NOT_ADMITTED",
  canonicalPatternGroupIds:Object.freeze([G6A_U06_P07F06_PATTERN_GROUP.patternGroupId]),
  canonicalPatternSpecIds:G6A_U06_P07F06_SPEC_IDS,
  patternGroupIds:Object.freeze([G6A_U06_P07F06_PATTERN_GROUP.patternGroupId]),
  patternSpecIds:G6A_U06_P07F06_SPEC_IDS,
  requiredCapabilityIds:G6A_U06_P07F06_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6A_U06_P07F06_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P07F06_G6A_U06_SOURCE_BACKED_CIRCLE_CIRCUMFERENCE_FORMULA",
  productionUse:"full_product_w7_slice006_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6AU06P07F06SelectorRow=id=>id===G6A_U06_P07F06_KP_ID?clone(G6A_U06_P07F06_SELECTOR_ROW):null;
export const listG6AU06P07F06PatternGroups=id=>id===G6A_U06_P07F06_KP_ID?[clone(G6A_U06_P07F06_PATTERN_GROUP)]:[];
export const resolveG6AU06P07F06PatternSpecIds=id=>id===G6A_U06_P07F06_KP_ID?clone(G6A_U06_P07F06_SPEC_IDS):[];
export function auditG6AU06P07F06Projection(){
  const e=[];
  if(G6A_U06_P07F06_PATTERN_SPECS.length!==3||G6A_U06_P07F06_FORMAL_MAPPING.patternSpecIds.length!==3)e.push("P07F06_PATTERN_CARDINALITY_INVALID");
  if(new Set(G6A_U06_P07F06_SPEC_IDS).size!==3)e.push("P07F06_PATTERN_SPEC_DUPLICATE");
  if(G6A_U06_P07F06_PATTERN_SPECS.some(x=>x.questionMode!=="diagram"||x.semanticCore!=="CIRCLE_CIRCUMFERENCE_FROM_DIAMETER_OR_RADIUS_FORMULA"||!x.requiresDiagramRepresentation||!x.q004PiCircumferenceRelationPrerequisiteRequired||!x.multiplicationPrerequisiteRequired||!x.circumferenceRoleRequired||!x.diameterOrRadiusInputRoleRequired||!x.diameterEqualsTwoRadiusRequired||x.diameterFormulaRequired!=="C = π × d"||x.radiusFormulaRequired!=="C = 2 × π × r"||!x.twoFormulaEquivalenceRequired||!x.positiveDiameterOrRadiusRequired||x.approximatePiValue!==3.14||!x.solveCircumferenceFromDiameterAllowed||!x.solveCircumferenceFromRadiusAllowed||x.solveDiameterFromCircumferenceAllowed||x.solveRadiusFromCircumferenceAllowed||x.q004PiRelationTeachingReownershipAllowed||x.semicirclePerimeterAllowed||x.sectorArcLengthAllowed||x.compositeArcPerimeterAllowed||x.rollingWheelDistanceApplicationAllowed||x.applicationContextAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed))e.push("P07F06_PATTERN_SCOPE_INVALID");
  const m=G6A_U06_P07F06_FORMAL_MAPPING;
  if(m.primaryRuntimeProfileId!=="profile_geometry_formula"||m.classificationRuleId!=="rule_geometry_formula"||m.appliedRuntimeModifierIds.length!==0||m.semanticAuthority!=="R02_REVIEWED_CANDIDATE_PRIMARY_CURRENT_VISUAL_CIRCUMFERENCE_CONTEXT_SECONDARY"||m.currentVisualSupportLevel!=="CIRCUMFERENCE_APPLICATION_CONTEXT_VISIBLE_FORMULA_LITERAL_NOT_ASSERTED"||m.diameterFormulaRequired!=="C = π × d"||m.radiusFormulaRequired!=="C = 2 × π × r"||!m.twoFormulaEquivalenceRequired||m.solveDiameterFromCircumferenceAllowed||m.solveRadiusFromCircumferenceAllowed||m.q004PiRelationTeachingReownershipAllowed||m.semicirclePerimeterAllowed||m.sectorArcLengthAllowed||m.compositeArcPerimeterAllowed||m.rollingWheelDistanceApplicationAllowed||m.applicationContextAllowed||m.sameUnitMixedAllowed||m.crossUnitMixedAllowed||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed)e.push("P07F06_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1})});
}
