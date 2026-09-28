export const P08F04_TASK_ID="P08F_W8DirectProductVerticalSlice004Implementation";
export const G5A_U05A1_P08F04_SOURCE_ID="g5a_u05_5a05a1";
export const G5A_U05A1_P08F04_UNIT_CODE="5A-U05A1";
export const G5A_U05A1_P08F04_UNIT_TITLE="扇形與圓心角";
export const G5A_U05A1_P08F04_KP_ID="kp_g5a_u05a1_central_angle_measurement";
export const G5A_U05A1_P08F04_PRIOR_KP_IDS=Object.freeze(["kp_g5a_u05a1_sector_center_radius_arc"]);
export const G5A_U05A1_P08F04_PROTECTED_FUTURE_KP_IDS=Object.freeze([
  "kp_g5a_u05a1_combined_sector_angle",
  "kp_g5a_u05a1_sector_fraction_of_circle",
  "kp_g5a_u05a1_sector_compare_same_circle"
]);
export const G5A_U05A1_P08F04_BLOCKING_CAPABILITY_IDS=Object.freeze([
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning"
]);
export const G5A_U05A1_P08F04_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution",
  "cap_deterministic_answer_model",
  "cap_worksheet_document_assembly",
  "cap_answer_key_projection",
  "cap_html_print_renderer",
  "cap_geometry_property_reasoning",
  "cap_geometry_domain_validator",
  "cap_geometry_diagram_representation"
]);
export const G5A_U05A1_P08F04_OPTIONAL_CAPABILITY_IDS=Object.freeze(["cap_geometry_construction"]);
export const G5A_U05A1_P08F04_APPLIED_MODIFIER_IDS=Object.freeze([]);
export const G5A_U05A1_P08F04_INCLUDED_RELATIONS=Object.freeze([
  "MEASURE_CENTRAL_ANGLE_BETWEEN_TWO_RADII",
  "READ_CENTRAL_ANGLE_FROM_SECTOR_DIAGRAM",
  "RECOGNIZE_ROTATION_INVARIANT_CENTRAL_ANGLE"
]);
export const G5A_U05A1_P08F04_SPEC_IDS=Object.freeze([
  "ps_g5a_u05a1_measure_central_angle_between_radii",
  "ps_g5a_u05a1_read_central_angle_sector_diagram",
  "ps_g5a_u05a1_rotation_invariant_central_angle"
]);
export const G5A_U05A1_P08F04_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g5a_u05a1_central_angle_measurement",
  sourceId:G5A_U05A1_P08F04_SOURCE_ID,
  unitCode:G5A_U05A1_P08F04_UNIT_CODE,
  unitTitle:G5A_U05A1_P08F04_UNIT_TITLE,
  displayName:"圓心角量測",
  primaryKnowledgePointId:G5A_U05A1_P08F04_KP_ID,
  knowledgePointIds:Object.freeze([G5A_U05A1_P08F04_KP_ID]),
  supportClass:"A",
  mode:"diagram",
  publicQuestionMode:"diagram",
  representationTag:"sector_elements_diagram",
  representationTags:Object.freeze(["geometry","sector","central-angle","measurement","rotation-invariant","diagram"]),
  patternSpecIds:G5A_U05A1_P08F04_SPEC_IDS,
  allocationPolicy:"balanced_pattern_spec",
  visibilityStatus:"visible",
  holdReason:null
});
function spec(patternSpecId,relation,diagramMode){
  return Object.freeze({
    patternSpecId,
    knowledgePointId:G5A_U05A1_P08F04_KP_ID,
    patternGroupId:G5A_U05A1_P08F04_PATTERN_GROUP.patternGroupId,
    patternFamilyId:"CENTRAL_ANGLE_MEASUREMENT",
    semanticCore:"SINGLE_SECTOR_CENTRAL_ANGLE_MEASUREMENT",
    relation,
    questionMode:"diagram",
    answerDomain:"INTEGER_DEGREES",
    representation:"sector_elements_diagram",
    diagramMode,
    vertexMustBeCircleCenter:true,
    twoBoundingRaysAreRadii:true,
    fullCircleInvariantDegrees:360,
    diagramOrientationMayVaryWithoutChangingAngle:true,
    generalProtractorPlacementProcedureAllowed:false,
    combinedSectorUnknownAngleAllowed:false,
    sectorFractionOfCircleAllowed:false,
    sameCircleSectorSizeComparisonAllowed:false,
    sectorAreaAllowed:false,
    arcLengthAllowed:false,
    sectorElementNamingAllowed:false,
    geometryConstructionAllowed:false,
    sameUnitMixedAllowed:false,
    crossUnitMixedAllowed:false
  });
}
export const G5A_U05A1_P08F04_PATTERN_SPECS=Object.freeze([
  spec(G5A_U05A1_P08F04_SPEC_IDS[0],G5A_U05A1_P08F04_INCLUDED_RELATIONS[0],"SECTOR_MEASURE"),
  spec(G5A_U05A1_P08F04_SPEC_IDS[1],G5A_U05A1_P08F04_INCLUDED_RELATIONS[1],"SECTOR_READ"),
  spec(G5A_U05A1_P08F04_SPEC_IDS[2],G5A_U05A1_P08F04_INCLUDED_RELATIONS[2],"ROTATED_SECTOR")
]);
export const G5A_U05A1_P08F04_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g5a_u05a1_central_angle_measurement_p08f04",
  sourceId:G5A_U05A1_P08F04_SOURCE_ID,
  sourcePages:Object.freeze([1,2]),
  r02EvidencePages:Object.freeze([1,2]),
  knowledgePointId:G5A_U05A1_P08F04_KP_ID,
  canonicalNameZh:"圓心角量測",
  capabilityStatement:"學生能量測或計算扇形圓心角。",
  reasoningInvariant:"完整圓的圓心角總和為360度。",
  sourceSemanticCore:"SINGLE_SECTOR_CENTRAL_ANGLE_MEASUREMENT",
  primaryRuntimeProfileId:"profile_geometry_property",
  classificationRuleId:"rule_geometry_property",
  appliedRuntimeModifierIds:G5A_U05A1_P08F04_APPLIED_MODIFIER_IDS,
  requiredCapabilityIds:G5A_U05A1_P08F04_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G5A_U05A1_P08F04_OPTIONAL_CAPABILITY_IDS,
  blockingCapabilityIds:G5A_U05A1_P08F04_BLOCKING_CAPABILITY_IDS,
  patternSpecIds:G5A_U05A1_P08F04_SPEC_IDS,
  controlledRepresentationCarrier:"EXISTING_SECTOR_ELEMENTS_DIAGRAM_REUSED_FOR_CENTRAL_ANGLE_MEASUREMENT",
  priorSectorElementProductReowned:false,
  sourceLearnerFigureCopied:false,
  r04ReclassificationAllowed:false,
  frozenQueueMutationAllowed:false
});
export const G5A_U05A1_P08F04_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G5A_U05A1_P08F04_KP_ID,
  sourceId:G5A_U05A1_P08F04_SOURCE_ID,
  unitCode:G5A_U05A1_P08F04_UNIT_CODE,
  unitTitle:G5A_U05A1_P08F04_UNIT_TITLE,
  displayName:"圓心角量測",
  canonicalNameZh:"圓心角量測",
  mode:"diagram",
  questionMode:"diagram",
  questionModes:Object.freeze(["diagram"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:"APPLICATION_COMPATIBLE_DIAGRAM_CORE_ONLY",
  canonicalPatternGroupIds:Object.freeze([G5A_U05A1_P08F04_PATTERN_GROUP.patternGroupId]),
  canonicalPatternSpecIds:G5A_U05A1_P08F04_SPEC_IDS,
  patternGroupIds:Object.freeze([G5A_U05A1_P08F04_PATTERN_GROUP.patternGroupId]),
  patternSpecIds:G5A_U05A1_P08F04_SPEC_IDS,
  requiredCapabilityIds:G5A_U05A1_P08F04_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G5A_U05A1_P08F04_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P08F04_G5A_U05A1_SOURCE_BACKED_CENTRAL_ANGLE_MEASUREMENT",
  productionUse:"full_product_w8_slice004_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG5AU05A1P08F04SelectorRow=id=>id===G5A_U05A1_P08F04_KP_ID?clone(G5A_U05A1_P08F04_SELECTOR_ROW):null;
export const listG5AU05A1P08F04PatternGroups=id=>id===G5A_U05A1_P08F04_KP_ID?[clone(G5A_U05A1_P08F04_PATTERN_GROUP)]:[];
export const resolveG5AU05A1P08F04PatternSpecIds=id=>id===G5A_U05A1_P08F04_KP_ID?clone(G5A_U05A1_P08F04_SPEC_IDS):[];
export function auditG5AU05A1P08F04Projection(){
  const e=[],m=G5A_U05A1_P08F04_FORMAL_MAPPING;
  if(G5A_U05A1_P08F04_PATTERN_SPECS.length!==3||new Set(G5A_U05A1_P08F04_SPEC_IDS).size!==3)e.push("P08F04_PATTERN_CARDINALITY_INVALID");
  if(G5A_U05A1_P08F04_PATTERN_SPECS.some(x=>x.semanticCore!=="SINGLE_SECTOR_CENTRAL_ANGLE_MEASUREMENT"||x.questionMode!=="diagram"||x.answerDomain!=="INTEGER_DEGREES"||x.representation!=="sector_elements_diagram"||!x.vertexMustBeCircleCenter||!x.twoBoundingRaysAreRadii||x.fullCircleInvariantDegrees!==360||!x.diagramOrientationMayVaryWithoutChangingAngle||x.generalProtractorPlacementProcedureAllowed||x.combinedSectorUnknownAngleAllowed||x.sectorFractionOfCircleAllowed||x.sameCircleSectorSizeComparisonAllowed||x.sectorAreaAllowed||x.arcLengthAllowed||x.sectorElementNamingAllowed||x.geometryConstructionAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed))e.push("P08F04_PATTERN_SCOPE_INVALID");
  if(m.primaryRuntimeProfileId!=="profile_geometry_property"||m.classificationRuleId!=="rule_geometry_property"||m.appliedRuntimeModifierIds.length!==0||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed||m.sourceLearnerFigureCopied||m.priorSectorElementProductReowned)e.push("P08F04_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1})});
}
