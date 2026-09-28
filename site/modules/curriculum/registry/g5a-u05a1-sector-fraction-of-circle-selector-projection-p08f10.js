export const P08F10_TASK_ID="P08F_W8DirectProductVerticalSlice010Implementation";
export const G5A_U05A1_P08F10_SOURCE_ID="g5a_u05_5a05a1";
export const G5A_U05A1_P08F10_UNIT_CODE="5A-U05A1";
export const G5A_U05A1_P08F10_UNIT_TITLE="扇形與圓心角";
export const G5A_U05A1_P08F10_KP_ID="kp_g5a_u05a1_sector_fraction_of_circle";
export const G5A_U05A1_P08F10_PRIOR_KP_IDS=Object.freeze([
  "kp_g5a_u05a1_sector_center_radius_arc",
  "kp_g5a_u05a1_central_angle_measurement",
  "kp_g5a_u05a1_combined_sector_angle"
]);
export const G5A_U05A1_P08F10_PROTECTED_FUTURE_KP_IDS=Object.freeze([
  "kp_g5a_u05a1_sector_compare_same_circle"
]);
export const G5A_U05A1_P08F10_BLOCKING_CAPABILITY_IDS=Object.freeze([
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning"
]);
export const G5A_U05A1_P08F10_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution",
  "cap_deterministic_answer_model",
  "cap_worksheet_document_assembly",
  "cap_answer_key_projection",
  "cap_html_print_renderer",
  "cap_geometry_property_reasoning",
  "cap_geometry_domain_validator",
  "cap_geometry_diagram_representation"
]);
export const G5A_U05A1_P08F10_OPTIONAL_CAPABILITY_IDS=Object.freeze(["cap_geometry_construction"]);
export const G5A_U05A1_P08F10_APPLIED_MODIFIER_IDS=Object.freeze([]);
export const G5A_U05A1_P08F10_INCLUDED_RELATIONS=Object.freeze([
  "READ_TARGET_SECTOR_CENTRAL_ANGLE",
  "EXPRESS_CENTRAL_ANGLE_AS_FRACTION_OF_FULL_TURN_360",
  "INTERPRET_SECTOR_AS_FRACTION_OF_FULL_CIRCLE"
]);
export const G5A_U05A1_P08F10_SPEC_IDS=Object.freeze([
  "ps_g5a_u05a1_sector_fraction_from_labeled_angle",
  "ps_g5a_u05a1_sector_fraction_reduce_angle_over_360",
  "ps_g5a_u05a1_sector_fraction_rotation_invariant"
]);
export const G5A_U05A1_P08F10_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g5a_u05a1_sector_fraction_of_circle",
  sourceId:G5A_U05A1_P08F10_SOURCE_ID,
  unitCode:G5A_U05A1_P08F10_UNIT_CODE,
  unitTitle:G5A_U05A1_P08F10_UNIT_TITLE,
  displayName:"扇形占全圓比例",
  primaryKnowledgePointId:G5A_U05A1_P08F10_KP_ID,
  knowledgePointIds:Object.freeze([G5A_U05A1_P08F10_KP_ID]),
  supportClass:"A",
  mode:"diagram",
  publicQuestionMode:"diagram",
  representationTag:"sector_fraction_of_circle_diagram",
  representationTags:Object.freeze(["geometry","sector","central-angle","fraction-of-circle","full-turn","diagram"]),
  patternSpecIds:G5A_U05A1_P08F10_SPEC_IDS,
  allocationPolicy:"balanced_pattern_spec",
  visibilityStatus:"visible",
  holdReason:null
});
function spec(patternSpecId,relation,diagramMode){
  return Object.freeze({
    patternSpecId,
    knowledgePointId:G5A_U05A1_P08F10_KP_ID,
    patternGroupId:G5A_U05A1_P08F10_PATTERN_GROUP.patternGroupId,
    patternFamilyId:"SECTOR_FRACTION_OF_FULL_CIRCLE",
    semanticCore:"SECTOR_FRACTION_OF_FULL_CIRCLE_FROM_CENTRAL_ANGLE",
    relation,
    questionMode:"diagram",
    answerDomain:"REDUCED_FRACTION_TEXT",
    representation:"sector_fraction_of_circle_diagram",
    diagramMode,
    fullTurnInvariantDegrees:360,
    targetSectorCentralAngleRequired:true,
    sectorFractionEqualsCentralAngleOver360:true,
    reducedFractionRequired:true,
    fractionRepresentsPartOfSameFullCircle:true,
    centralAngleAndFractionMustRemainValueConsistent:true,
    targetIsFractionOfCircleNotAreaOrArcLength:true,
    centralAngleMeasurementReownershipAllowed:false,
    combinedSectorUnknownAngleAllowed:false,
    sectorElementNamingAllowed:false,
    sameCircleSectorSizeComparisonAllowed:false,
    sectorAreaAllowed:false,
    arcLengthAllowed:false,
    geometryConstructionAllowed:false,
    sameUnitMixedAllowed:false,
    crossUnitMixedAllowed:false
  });
}
export const G5A_U05A1_P08F10_PATTERN_SPECS=Object.freeze([
  spec(G5A_U05A1_P08F10_SPEC_IDS[0],G5A_U05A1_P08F10_INCLUDED_RELATIONS[0],"ANGLE_TO_FRACTION"),
  spec(G5A_U05A1_P08F10_SPEC_IDS[1],G5A_U05A1_P08F10_INCLUDED_RELATIONS[1],"REDUCE_ANGLE_OVER_360"),
  spec(G5A_U05A1_P08F10_SPEC_IDS[2],G5A_U05A1_P08F10_INCLUDED_RELATIONS[2],"ROTATED_SECTOR_FRACTION")
]);
export const G5A_U05A1_P08F10_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g5a_u05a1_sector_fraction_of_circle_p08f10",
  sourceId:G5A_U05A1_P08F10_SOURCE_ID,
  sourcePages:Object.freeze([1,2]),
  r02EvidencePages:Object.freeze([1,2]),
  knowledgePointId:G5A_U05A1_P08F10_KP_ID,
  canonicalNameZh:"扇形占全圓比例",
  capabilityStatement:"學生能由圓心角判斷扇形占全圓的分率。",
  reasoningInvariant:"扇形占比等於圓心角除以360度。",
  sourceSemanticCore:"SECTOR_FRACTION_OF_FULL_CIRCLE_FROM_CENTRAL_ANGLE",
  primaryRuntimeProfileId:"profile_geometry_property",
  classificationRuleId:"rule_geometry_property",
  appliedRuntimeModifierIds:G5A_U05A1_P08F10_APPLIED_MODIFIER_IDS,
  requiredCapabilityIds:G5A_U05A1_P08F10_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G5A_U05A1_P08F10_OPTIONAL_CAPABILITY_IDS,
  blockingCapabilityIds:G5A_U05A1_P08F10_BLOCKING_CAPABILITY_IDS,
  patternSpecIds:G5A_U05A1_P08F10_SPEC_IDS,
  controlledRepresentationCarrier:"DEDICATED_SECTOR_FRACTION_OF_CIRCLE_DIAGRAM",
  priorCentralAngleMeasurementReowned:false,
  priorCombinedSectorAngleReowned:false,
  priorSectorElementProductReowned:false,
  sourceLearnerFigureCopied:false,
  r04ReclassificationAllowed:false,
  frozenQueueMutationAllowed:false
});
export const G5A_U05A1_P08F10_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G5A_U05A1_P08F10_KP_ID,
  sourceId:G5A_U05A1_P08F10_SOURCE_ID,
  unitCode:G5A_U05A1_P08F10_UNIT_CODE,
  unitTitle:G5A_U05A1_P08F10_UNIT_TITLE,
  displayName:"扇形占全圓比例",
  canonicalNameZh:"扇形占全圓比例",
  mode:"diagram",
  questionMode:"diagram",
  questionModes:Object.freeze(["diagram"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:"APPLICATION_COMPATIBLE_DIAGRAM_CORE_ONLY",
  canonicalPatternGroupIds:Object.freeze([G5A_U05A1_P08F10_PATTERN_GROUP.patternGroupId]),
  canonicalPatternSpecIds:G5A_U05A1_P08F10_SPEC_IDS,
  patternGroupIds:Object.freeze([G5A_U05A1_P08F10_PATTERN_GROUP.patternGroupId]),
  patternSpecIds:G5A_U05A1_P08F10_SPEC_IDS,
  requiredCapabilityIds:G5A_U05A1_P08F10_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G5A_U05A1_P08F10_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P08F10_G5A_U05A1_SOURCE_BACKED_SECTOR_FRACTION_OF_CIRCLE",
  productionUse:"full_product_w8_slice010_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG5AU05A1P08F10SelectorRow=id=>id===G5A_U05A1_P08F10_KP_ID?clone(G5A_U05A1_P08F10_SELECTOR_ROW):null;
export const listG5AU05A1P08F10PatternGroups=id=>id===G5A_U05A1_P08F10_KP_ID?[clone(G5A_U05A1_P08F10_PATTERN_GROUP)]:[];
export const resolveG5AU05A1P08F10PatternSpecIds=id=>id===G5A_U05A1_P08F10_KP_ID?clone(G5A_U05A1_P08F10_SPEC_IDS):[];
export function auditG5AU05A1P08F10Projection(){
  const e=[],m=G5A_U05A1_P08F10_FORMAL_MAPPING;
  if(G5A_U05A1_P08F10_PATTERN_SPECS.length!==3||new Set(G5A_U05A1_P08F10_SPEC_IDS).size!==3)e.push("P08F10_PATTERN_CARDINALITY_INVALID");
  if(G5A_U05A1_P08F10_PATTERN_SPECS.some(x=>x.semanticCore!=="SECTOR_FRACTION_OF_FULL_CIRCLE_FROM_CENTRAL_ANGLE"||x.questionMode!=="diagram"||x.answerDomain!=="REDUCED_FRACTION_TEXT"||x.representation!=="sector_fraction_of_circle_diagram"||x.fullTurnInvariantDegrees!==360||!x.targetSectorCentralAngleRequired||!x.sectorFractionEqualsCentralAngleOver360||!x.reducedFractionRequired||!x.fractionRepresentsPartOfSameFullCircle||!x.centralAngleAndFractionMustRemainValueConsistent||!x.targetIsFractionOfCircleNotAreaOrArcLength||x.centralAngleMeasurementReownershipAllowed||x.combinedSectorUnknownAngleAllowed||x.sectorElementNamingAllowed||x.sameCircleSectorSizeComparisonAllowed||x.sectorAreaAllowed||x.arcLengthAllowed||x.geometryConstructionAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed))e.push("P08F10_PATTERN_SCOPE_INVALID");
  if(m.primaryRuntimeProfileId!=="profile_geometry_property"||m.classificationRuleId!=="rule_geometry_property"||m.appliedRuntimeModifierIds.length!==0||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed||m.sourceLearnerFigureCopied||m.priorCentralAngleMeasurementReowned||m.priorCombinedSectorAngleReowned||m.priorSectorElementProductReowned)e.push("P08F10_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1})});
}
