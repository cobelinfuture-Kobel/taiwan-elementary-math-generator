export const P07F04_TASK_ID="P07F_W7DirectProductVerticalSlice004Implementation";
export const G6A_U06_P07F04_SOURCE_ID="g6a_u06_6a06";
export const G6A_U06_P07F04_UNIT_CODE="6A-U06";
export const G6A_U06_P07F04_UNIT_TITLE="圓周長與扇形周長";
export const G6A_U06_P07F04_KP_ID="kp_g6a_u06_pi_circumference_relation";
export const G6A_U06_P07F04_PROTECTED_FUTURE_KP_IDS=Object.freeze([
  "kp_g6a_u06_circle_circumference_formula",
  "kp_g6a_u06_semicircle_perimeter",
  "kp_g6a_u06_sector_arc_length",
  "kp_g6a_u06_composite_arc_perimeter"
]);
export const G6A_U06_P07F04_QUEUE_REQUIRED_CAPABILITY_IDS=Object.freeze([]);
export const G6A_U06_P07F04_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution",
  "cap_deterministic_answer_model",
  "cap_worksheet_document_assembly",
  "cap_answer_key_projection",
  "cap_html_print_renderer",
  "cap_geometry_formula_evaluation",
  "cap_geometry_domain_validator",
  "cap_geometry_diagram_representation",
  "cap_integer_division"
]);
export const G6A_U06_P07F04_OPTIONAL_CAPABILITY_IDS=Object.freeze([]);
export const G6A_U06_P07F04_APPLIED_MODIFIER_IDS=Object.freeze(["mod_integer_division"]);
export const G6A_U06_P07F04_INCLUDED_RELATIONS=Object.freeze([
  "COMPUTE_OR_RECOGNIZE_CIRCUMFERENCE_DIVIDED_BY_DIAMETER",
  "IDENTIFY_APPROXIMATE_PI_AS_COMMON_RATIO",
  "COMPARE_MULTIPLE_CIRCLE_C_OVER_D_QUOTIENTS",
  "PRESERVE_CIRCUMFERENCE_DIAMETER_ROLES"
]);
export const G6A_U06_P07F04_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g6a_u06_pi_circumference_relation",
  sourceId:G6A_U06_P07F04_SOURCE_ID,
  unitCode:G6A_U06_P07F04_UNIT_CODE,
  unitTitle:G6A_U06_P07F04_UNIT_TITLE,
  displayName:"圓周率與圓周長關係",
  primaryKnowledgePointId:G6A_U06_P07F04_KP_ID,
  knowledgePointIds:Object.freeze([G6A_U06_P07F04_KP_ID]),
  supportClass:"A",
  mode:"diagram",
  publicQuestionMode:"diagram",
  representationTag:"circle_diameter_ratio_diagram",
  representationTags:Object.freeze(["geometry","circle","circumference","diameter","pi","ratio","diagram"]),
  patternSpecIds:Object.freeze([
    "ps_g6a_u06_pi_relation_compute_quotient",
    "ps_g6a_u06_pi_relation_identify_common_ratio",
    "ps_g6a_u06_pi_relation_compare_two_circles"
  ]),
  allocationPolicy:"balanced_pattern_spec",
  visibilityStatus:"visible",
  holdReason:null
});
function spec(id,family,targetKind){
  return Object.freeze({
    patternSpecId:id,
    knowledgePointId:G6A_U06_P07F04_KP_ID,
    patternGroupId:G6A_U06_P07F04_PATTERN_GROUP.patternGroupId,
    patternFamilyId:family,
    relation:G6A_U06_P07F04_INCLUDED_RELATIONS[targetKind==="COMPUTE_QUOTIENT"?0:targetKind==="IDENTIFY_COMMON_RATIO"?1:2],
    semanticCore:"CIRCUMFERENCE_DIVIDED_BY_DIAMETER_APPROX_PI",
    targetKind,
    questionMode:"diagram",
    answerDomain:"APPROXIMATE_PI_DECIMAL",
    representation:"circle_parts_diagram_with_measured_circumference_diameter",
    requiresDiagramRepresentation:true,
    circumferenceRoleRequired:true,
    diameterRoleRequired:true,
    diameterPositiveNonzeroRequired:true,
    quotientDirectionRequired:"CIRCUMFERENCE_DIVIDED_BY_DIAMETER",
    quotientApproximatelyPiRequired:true,
    fixedRatioAcrossCirclesRequired:true,
    solveCircumferenceFromDiameterAllowed:false,
    solveDiameterFromCircumferenceAllowed:false,
    circumferenceFormulaTeachingReownershipAllowed:false,
    radiusBasedFormulaAllowed:false,
    semicirclePerimeterAllowed:false,
    sectorArcLengthAllowed:false,
    compositeArcPerimeterAllowed:false,
    rollingWheelApplicationAllowed:false,
    genericGeometryFormulaDrillAllowed:false,
    applicationContextAllowed:false,
    sameUnitMixedAllowed:false,
    crossUnitMixedAllowed:false
  });
}
export const G6A_U06_P07F04_PATTERN_SPECS=Object.freeze([
  spec("ps_g6a_u06_pi_relation_compute_quotient","PI_RELATION_SINGLE_CIRCLE_QUOTIENT","COMPUTE_QUOTIENT"),
  spec("ps_g6a_u06_pi_relation_identify_common_ratio","PI_RELATION_COMMON_RATIO_RECOGNITION","IDENTIFY_COMMON_RATIO"),
  spec("ps_g6a_u06_pi_relation_compare_two_circles","PI_RELATION_TWO_CIRCLE_COMPARISON","COMPARE_TWO_CIRCLES")
]);
export const G6A_U06_P07F04_SPEC_IDS=Object.freeze(G6A_U06_P07F04_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G6A_U06_P07F04_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g6a_u06_pi_circumference_relation_p07f04",
  r04MappingId:"r04map_g6a_u06_pi_circumference_relation",
  sourceId:G6A_U06_P07F04_SOURCE_ID,
  sourcePages:Object.freeze([1,2]),
  r02EvidencePages:Object.freeze([1,2]),
  knowledgePointId:G6A_U06_P07F04_KP_ID,
  canonicalNameZh:"圓周率與圓周長關係",
  capabilityStatement:"學生能理解圓周長除以直徑約為圓周率。",
  reasoningInvariant:"同類圓的圓周長與直徑成固定比。",
  sourceSemanticCore:"CIRCUMFERENCE_DIVIDED_BY_DIAMETER_APPROX_PI",
  semanticAuthority:"R02_REVIEWED_CANDIDATE_PRIMARY_CURRENT_VISUAL_CONTEXT_SECONDARY",
  currentVisualSupportLevel:"INDIRECT_CONTEXTUAL_NOT_LITERAL_STATEMENT",
  primaryRuntimeProfileId:"profile_geometry_formula",
  classificationRuleId:"rule_geometry_formula",
  appliedRuntimeModifierIds:G6A_U06_P07F04_APPLIED_MODIFIER_IDS,
  requiredCapabilityIds:G6A_U06_P07F04_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6A_U06_P07F04_OPTIONAL_CAPABILITY_IDS,
  queueRequiredW7CapabilityIds:G6A_U06_P07F04_QUEUE_REQUIRED_CAPABILITY_IDS,
  patternSpecIds:G6A_U06_P07F04_SPEC_IDS,
  circumferenceRoleRequired:true,
  diameterRoleRequired:true,
  diameterMustBePositiveNonzero:true,
  quotientDirectionRequired:"CIRCUMFERENCE_DIVIDED_BY_DIAMETER",
  quotientApproximatelyPiRequired:true,
  fixedRatioAcrossCirclesRequired:true,
  approximatePiValue:3.14,
  solveCircumferenceFromDiameterAllowed:false,
  solveDiameterFromCircumferenceAllowed:false,
  circumferenceFormulaTeachingReownershipAllowed:false,
  radiusBasedFormulaAllowed:false,
  semicirclePerimeterAllowed:false,
  sectorArcLengthAllowed:false,
  compositeArcPerimeterAllowed:false,
  rollingWheelApplicationAllowed:false,
  genericGeometryFormulaDrillAllowed:false,
  applicationContextAllowed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false,
  r04ReclassificationAllowed:false,
  frozenQueueMutationAllowed:false
});
export const G6A_U06_P07F04_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G6A_U06_P07F04_KP_ID,
  sourceId:G6A_U06_P07F04_SOURCE_ID,
  unitCode:G6A_U06_P07F04_UNIT_CODE,
  unitTitle:G6A_U06_P07F04_UNIT_TITLE,
  displayName:"圓周率與圓周長關係",
  canonicalNameZh:"圓周率與圓周長關係",
  mode:"diagram",
  questionMode:"diagram",
  questionModes:Object.freeze(["diagram"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:"DIAGRAM_RELATION_ONLY_APPLICATION_NOT_ADMITTED",
  canonicalPatternGroupIds:Object.freeze([G6A_U06_P07F04_PATTERN_GROUP.patternGroupId]),
  canonicalPatternSpecIds:G6A_U06_P07F04_SPEC_IDS,
  patternGroupIds:Object.freeze([G6A_U06_P07F04_PATTERN_GROUP.patternGroupId]),
  patternSpecIds:G6A_U06_P07F04_SPEC_IDS,
  requiredCapabilityIds:G6A_U06_P07F04_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6A_U06_P07F04_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P07F04_G6A_U06_SOURCE_BACKED_PI_CIRCUMFERENCE_RELATION",
  productionUse:"full_product_w7_slice004_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6AU06P07F04SelectorRow=id=>id===G6A_U06_P07F04_KP_ID?clone(G6A_U06_P07F04_SELECTOR_ROW):null;
export const listG6AU06P07F04PatternGroups=id=>id===G6A_U06_P07F04_KP_ID?[clone(G6A_U06_P07F04_PATTERN_GROUP)]:[];
export const resolveG6AU06P07F04PatternSpecIds=id=>id===G6A_U06_P07F04_KP_ID?clone(G6A_U06_P07F04_SPEC_IDS):[];
export function auditG6AU06P07F04Projection(){
  const e=[];
  if(G6A_U06_P07F04_PATTERN_SPECS.length!==3||G6A_U06_P07F04_FORMAL_MAPPING.patternSpecIds.length!==3)e.push("P07F04_PATTERN_CARDINALITY_INVALID");
  if(new Set(G6A_U06_P07F04_SPEC_IDS).size!==3)e.push("P07F04_PATTERN_SPEC_DUPLICATE");
  if(G6A_U06_P07F04_PATTERN_SPECS.some(x=>x.questionMode!=="diagram"||x.semanticCore!=="CIRCUMFERENCE_DIVIDED_BY_DIAMETER_APPROX_PI"||!x.requiresDiagramRepresentation||!x.circumferenceRoleRequired||!x.diameterRoleRequired||!x.diameterPositiveNonzeroRequired||x.quotientDirectionRequired!=="CIRCUMFERENCE_DIVIDED_BY_DIAMETER"||!x.quotientApproximatelyPiRequired||!x.fixedRatioAcrossCirclesRequired||x.solveCircumferenceFromDiameterAllowed||x.solveDiameterFromCircumferenceAllowed||x.circumferenceFormulaTeachingReownershipAllowed||x.radiusBasedFormulaAllowed||x.semicirclePerimeterAllowed||x.sectorArcLengthAllowed||x.compositeArcPerimeterAllowed||x.rollingWheelApplicationAllowed||x.genericGeometryFormulaDrillAllowed||x.applicationContextAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed))e.push("P07F04_PATTERN_SCOPE_INVALID");
  const m=G6A_U06_P07F04_FORMAL_MAPPING;
  if(m.primaryRuntimeProfileId!=="profile_geometry_formula"||m.classificationRuleId!=="rule_geometry_formula"||m.appliedRuntimeModifierIds.join("|")!==G6A_U06_P07F04_APPLIED_MODIFIER_IDS.join("|")||m.semanticAuthority!=="R02_REVIEWED_CANDIDATE_PRIMARY_CURRENT_VISUAL_CONTEXT_SECONDARY"||m.currentVisualSupportLevel!=="INDIRECT_CONTEXTUAL_NOT_LITERAL_STATEMENT"||m.quotientDirectionRequired!=="CIRCUMFERENCE_DIVIDED_BY_DIAMETER"||m.approximatePiValue!==3.14||m.solveCircumferenceFromDiameterAllowed||m.solveDiameterFromCircumferenceAllowed||m.circumferenceFormulaTeachingReownershipAllowed||m.radiusBasedFormulaAllowed||m.semicirclePerimeterAllowed||m.sectorArcLengthAllowed||m.compositeArcPerimeterAllowed||m.rollingWheelApplicationAllowed||m.genericGeometryFormulaDrillAllowed||m.applicationContextAllowed||m.sameUnitMixedAllowed||m.crossUnitMixedAllowed||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed)e.push("P07F04_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1})});
}
