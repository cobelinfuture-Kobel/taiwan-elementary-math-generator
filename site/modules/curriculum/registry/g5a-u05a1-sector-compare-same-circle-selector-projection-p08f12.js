export const P08F12_TASK_ID="P08F_W8DirectProductVerticalSlice012Implementation";
export const G5A_U05A1_P08F12_SOURCE_ID="g5a_u05_5a05a1";
export const G5A_U05A1_P08F12_UNIT_CODE="5A-U05A1";
export const G5A_U05A1_P08F12_UNIT_TITLE="扇形與圓心角";
export const G5A_U05A1_P08F12_KP_ID="kp_g5a_u05a1_sector_compare_same_circle";
export const G5A_U05A1_P08F12_PRIOR_KP_IDS=Object.freeze([
  "kp_g5a_u05a1_sector_center_radius_arc",
  "kp_g5a_u05a1_central_angle_measurement",
  "kp_g5a_u05a1_combined_sector_angle",
  "kp_g5a_u05a1_sector_fraction_of_circle"
]);
export const G5A_U05A1_P08F12_BLOCKING_CAPABILITY_IDS=Object.freeze([
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning"
]);
export const G5A_U05A1_P08F12_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution",
  "cap_deterministic_answer_model",
  "cap_worksheet_document_assembly",
  "cap_answer_key_projection",
  "cap_html_print_renderer",
  "cap_geometry_property_reasoning",
  "cap_geometry_domain_validator",
  "cap_geometry_diagram_representation"
]);
export const G5A_U05A1_P08F12_OPTIONAL_CAPABILITY_IDS=Object.freeze(["cap_geometry_construction"]);
export const G5A_U05A1_P08F12_APPLIED_MODIFIER_IDS=Object.freeze([]);
export const G5A_U05A1_P08F12_INCLUDED_RELATIONS=Object.freeze([
  "COMPARE_SECTOR_SIZE_BY_CENTRAL_ANGLE_SAME_CIRCLE",
  "ORDER_SECTORS_BY_CENTRAL_ANGLE_SAME_RADIUS",
  "IDENTIFY_EQUAL_SECTOR_SIZE_FROM_EQUAL_CENTRAL_ANGLES"
]);
export const G5A_U05A1_P08F12_SPEC_IDS=Object.freeze([
  "ps_g5a_u05a1_sector_compare_two_same_radius",
  "ps_g5a_u05a1_sector_order_three_same_radius",
  "ps_g5a_u05a1_sector_equal_angle_equal_size"
]);
export const G5A_U05A1_P08F12_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g5a_u05a1_sector_compare_same_circle",
  sourceId:G5A_U05A1_P08F12_SOURCE_ID,
  unitCode:G5A_U05A1_P08F12_UNIT_CODE,
  unitTitle:G5A_U05A1_P08F12_UNIT_TITLE,
  displayName:"同圓扇形大小比較",
  primaryKnowledgePointId:G5A_U05A1_P08F12_KP_ID,
  knowledgePointIds:Object.freeze([G5A_U05A1_P08F12_KP_ID]),
  supportClass:"A",
  mode:"diagram",
  publicQuestionMode:"diagram",
  representationTag:"same_radius_sector_comparison_diagram",
  representationTags:Object.freeze(["geometry","sector","central-angle","same-radius","comparison","diagram"]),
  patternSpecIds:G5A_U05A1_P08F12_SPEC_IDS,
  allocationPolicy:"balanced_pattern_spec",
  visibilityStatus:"visible",
  holdReason:null
});
function spec(patternSpecId,relation,diagramMode,answerDomain,sectorCount){
  return Object.freeze({
    patternSpecId,
    knowledgePointId:G5A_U05A1_P08F12_KP_ID,
    patternGroupId:G5A_U05A1_P08F12_PATTERN_GROUP.patternGroupId,
    patternFamilyId:"SAME_RADIUS_SECTOR_SIZE_COMPARISON",
    semanticCore:"COMPARE_SECTORS_IN_SAME_CIRCLE_BY_CENTRAL_ANGLE",
    relation,
    questionMode:"diagram",
    answerDomain,
    representation:"same_radius_sector_comparison_diagram",
    diagramMode,
    sectorCount,
    sameCircleOrEqualRadiusRequired:true,
    comparedSectorCentralAnglesRequired:true,
    largerCentralAngleImpliesLargerArc:true,
    largerCentralAngleImpliesLargerSector:true,
    equalCentralAnglesImplyEqualSectorSize:true,
    noAreaFormulaRequired:true,
    noArcLengthFormulaRequired:true,
    noRulerMeasurementRequired:true,
    centralAngleMeasurementReownershipAllowed:false,
    combinedSectorUnknownAngleAllowed:false,
    sectorFractionOfCircleAllowed:false,
    sectorElementNamingAllowed:false,
    sectorAreaAllowed:false,
    arcLengthAllowed:false,
    geometryConstructionAllowed:false,
    sameUnitMixedAllowed:false,
    crossUnitMixedAllowed:false
  });
}
export const G5A_U05A1_P08F12_PATTERN_SPECS=Object.freeze([
  spec(G5A_U05A1_P08F12_SPEC_IDS[0],G5A_U05A1_P08F12_INCLUDED_RELATIONS[0],"TWO_SECTORS_COMPARE","SECTOR_LABEL",2),
  spec(G5A_U05A1_P08F12_SPEC_IDS[1],G5A_U05A1_P08F12_INCLUDED_RELATIONS[1],"THREE_SECTORS_ORDER","LABEL_ORDER",3),
  spec(G5A_U05A1_P08F12_SPEC_IDS[2],G5A_U05A1_P08F12_INCLUDED_RELATIONS[2],"EQUAL_ANGLE_EQUAL_SIZE","EQUALITY_TEXT",2)
]);
export const G5A_U05A1_P08F12_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g5a_u05a1_sector_compare_same_circle_p08f12",
  sourceId:G5A_U05A1_P08F12_SOURCE_ID,
  sourcePages:Object.freeze([1,2]),
  r02EvidencePages:Object.freeze([1,2]),
  knowledgePointId:G5A_U05A1_P08F12_KP_ID,
  canonicalNameZh:"同圓扇形大小比較",
  capabilityStatement:"學生能在同半徑下比較扇形大小。",
  reasoningInvariant:"同一圓中圓心角越大，弧與扇形越大。",
  sourceSemanticCore:"COMPARE_SECTORS_IN_SAME_CIRCLE_BY_CENTRAL_ANGLE",
  primaryRuntimeProfileId:"profile_geometry_property",
  classificationRuleId:"rule_geometry_property",
  appliedRuntimeModifierIds:G5A_U05A1_P08F12_APPLIED_MODIFIER_IDS,
  requiredCapabilityIds:G5A_U05A1_P08F12_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G5A_U05A1_P08F12_OPTIONAL_CAPABILITY_IDS,
  blockingCapabilityIds:G5A_U05A1_P08F12_BLOCKING_CAPABILITY_IDS,
  patternSpecIds:G5A_U05A1_P08F12_SPEC_IDS,
  controlledRepresentationCarrier:"DEDICATED_SAME_RADIUS_SECTOR_COMPARISON_DIAGRAM",
  priorCentralAngleMeasurementReowned:false,
  priorCombinedSectorAngleReowned:false,
  priorSectorFractionReowned:false,
  priorSectorElementProductReowned:false,
  sourceLearnerFigureCopied:false,
  r04ReclassificationAllowed:false,
  frozenQueueMutationAllowed:false
});
export const G5A_U05A1_P08F12_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G5A_U05A1_P08F12_KP_ID,
  sourceId:G5A_U05A1_P08F12_SOURCE_ID,
  unitCode:G5A_U05A1_P08F12_UNIT_CODE,
  unitTitle:G5A_U05A1_P08F12_UNIT_TITLE,
  displayName:"同圓扇形大小比較",
  canonicalNameZh:"同圓扇形大小比較",
  mode:"diagram",
  questionMode:"diagram",
  questionModes:Object.freeze(["diagram"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:"APPLICATION_COMPATIBLE_DIAGRAM_CORE_ONLY",
  canonicalPatternGroupIds:Object.freeze([G5A_U05A1_P08F12_PATTERN_GROUP.patternGroupId]),
  canonicalPatternSpecIds:G5A_U05A1_P08F12_SPEC_IDS,
  patternGroupIds:Object.freeze([G5A_U05A1_P08F12_PATTERN_GROUP.patternGroupId]),
  patternSpecIds:G5A_U05A1_P08F12_SPEC_IDS,
  requiredCapabilityIds:G5A_U05A1_P08F12_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G5A_U05A1_P08F12_OPTIONAL_CAPABILITY_IDS,
  appliedRuntimeModifierIds:G5A_U05A1_P08F12_APPLIED_MODIFIER_IDS,
  qaStatusLabel:"P08F12_G5A_U05A1_SOURCE_BACKED_SAME_RADIUS_SECTOR_COMPARISON",
  productionUse:"full_product_w8_slice012_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG5AU05A1P08F12SelectorRow=id=>id===G5A_U05A1_P08F12_KP_ID?clone(G5A_U05A1_P08F12_SELECTOR_ROW):null;
export const listG5AU05A1P08F12PatternGroups=id=>id===G5A_U05A1_P08F12_KP_ID?[clone(G5A_U05A1_P08F12_PATTERN_GROUP)]:[];
export const resolveG5AU05A1P08F12PatternSpecIds=id=>id===G5A_U05A1_P08F12_KP_ID?clone(G5A_U05A1_P08F12_SPEC_IDS):[];
export function auditG5AU05A1P08F12Projection(){
  const e=[],m=G5A_U05A1_P08F12_FORMAL_MAPPING;
  if(G5A_U05A1_P08F12_PATTERN_SPECS.length!==3||new Set(G5A_U05A1_P08F12_SPEC_IDS).size!==3)e.push("P08F12_PATTERN_CARDINALITY_INVALID");
  if(G5A_U05A1_P08F12_PATTERN_SPECS.some(x=>x.semanticCore!=="COMPARE_SECTORS_IN_SAME_CIRCLE_BY_CENTRAL_ANGLE"||x.questionMode!=="diagram"||x.representation!=="same_radius_sector_comparison_diagram"||!x.sameCircleOrEqualRadiusRequired||!x.comparedSectorCentralAnglesRequired||!x.largerCentralAngleImpliesLargerArc||!x.largerCentralAngleImpliesLargerSector||!x.equalCentralAnglesImplyEqualSectorSize||!x.noAreaFormulaRequired||!x.noArcLengthFormulaRequired||!x.noRulerMeasurementRequired||x.centralAngleMeasurementReownershipAllowed||x.combinedSectorUnknownAngleAllowed||x.sectorFractionOfCircleAllowed||x.sectorElementNamingAllowed||x.sectorAreaAllowed||x.arcLengthAllowed||x.geometryConstructionAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed))e.push("P08F12_PATTERN_SCOPE_INVALID");
  if(m.primaryRuntimeProfileId!=="profile_geometry_property"||m.classificationRuleId!=="rule_geometry_property"||m.appliedRuntimeModifierIds.length!==0||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed||m.sourceLearnerFigureCopied||m.priorCentralAngleMeasurementReowned||m.priorCombinedSectorAngleReowned||m.priorSectorFractionReowned||m.priorSectorElementProductReowned)e.push("P08F12_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1})});
}
