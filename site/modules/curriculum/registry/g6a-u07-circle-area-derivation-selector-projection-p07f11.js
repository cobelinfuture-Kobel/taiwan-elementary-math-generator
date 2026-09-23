export const P07F11_TASK_ID="P07F_W7DirectProductVerticalSlice011Implementation";
export const G6A_U07_P07F11_SOURCE_ID="g6a_u07_6a07";
export const G6A_U07_P07F11_UNIT_CODE="6A-U07";
export const G6A_U07_P07F11_UNIT_TITLE="圓面積和扇形面積";
export const G6A_U07_P07F11_KP_ID="kp_g6a_u07_circle_area_derivation";
export const G6A_U07_P07F11_PREDECESSOR_KP_IDS=Object.freeze(["kp_area_conservation_cut_rearrange","kp_g6a_u06_circle_circumference_formula"]);
export const G6A_U07_P07F11_PROTECTED_FUTURE_KP_IDS=Object.freeze(["kp_g6a_u07_circle_area_formula","kp_g6a_u07_sector_area","kp_g6a_u07_annulus_area","kp_g6a_u07_composite_circle_area"]);
export const G6A_U07_P07F11_QUEUE_REQUIRED_CAPABILITY_IDS=Object.freeze([]);
export const G6A_U07_P07F11_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly","cap_answer_key_projection","cap_html_print_renderer",
  "cap_geometry_formula_evaluation","cap_geometry_domain_validator","cap_geometry_diagram_representation"
]);
export const G6A_U07_P07F11_OPTIONAL_CAPABILITY_IDS=Object.freeze([]);
export const G6A_U07_P07F11_APPLIED_MODIFIER_IDS=Object.freeze([]);
export const G6A_U07_P07F11_INCLUDED_RELATIONS=Object.freeze([
  "IDENTIFY_REARRANGED_LENGTH_AS_HALF_CIRCUMFERENCE",
  "IDENTIFY_REARRANGED_WIDTH_AS_RADIUS",
  "VERIFY_AREA_CONSERVATION_UNDER_REARRANGEMENT",
  "COMPARE_FINER_SECTOR_REARRANGEMENT_TO_RECTANGLE",
  "COMPLETE_CIRCLE_AREA_DERIVATION_PI_R_SQUARED"
]);
export const G6A_U07_P07F11_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g6a_u07_circle_area_derivation",sourceId:G6A_U07_P07F11_SOURCE_ID,unitCode:G6A_U07_P07F11_UNIT_CODE,unitTitle:G6A_U07_P07F11_UNIT_TITLE,
  displayName:"圓面積剪拼推導",primaryKnowledgePointId:G6A_U07_P07F11_KP_ID,knowledgePointIds:Object.freeze([G6A_U07_P07F11_KP_ID]),supportClass:"A",
  mode:"diagram",publicQuestionMode:"diagram",representationTag:"circle_area_derivation_diagram",
  representationTags:Object.freeze(["geometry","circle","area","sector","rearrangement","half-circumference","radius","diagram"]),
  patternSpecIds:Object.freeze([
    "ps_g6a_u07_circle_derivation_half_circumference_length",
    "ps_g6a_u07_circle_derivation_radius_width",
    "ps_g6a_u07_circle_derivation_area_conservation",
    "ps_g6a_u07_circle_derivation_finer_sector_approximation",
    "ps_g6a_u07_circle_derivation_pi_r_squared_conclusion"
  ]),
  allocationPolicy:"balanced_pattern_spec",visibilityStatus:"visible",holdReason:null
});
function spec(id,family,targetKind,relation,answerDomain){
  return Object.freeze({
    patternSpecId:id,knowledgePointId:G6A_U07_P07F11_KP_ID,patternGroupId:G6A_U07_P07F11_PATTERN_GROUP.patternGroupId,patternFamilyId:family,relation,
    semanticCore:"CIRCLE_AREA_DERIVATION_BY_SECTOR_REARRANGEMENT_TO_APPROX_RECTANGLE",targetKind,questionMode:"diagram",answerDomain,
    representation:"circle_area_derivation_diagram",requiresDiagramRepresentation:true,
    areaConservationPrerequisiteRequired:true,circleCircumferenceFormulaPrerequisiteRequired:true,
    circleCutIntoSectorsRequired:true,alternatingSectorRearrangementRequired:true,halfCircumferenceAsLengthRequired:true,radiusAsWidthRequired:true,
    finerSectorCountApproachesRectangleRequired:true,formulaConclusionPiRSquaredRequired:true,
    circleAreaFormulaProductionAllowed:false,sectorAreaAllowed:false,annulusAreaAllowed:false,compositeCircleAreaAllowed:false,
    applicationContextAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false
  });
}
export const G6A_U07_P07F11_PATTERN_SPECS=Object.freeze([
  spec("ps_g6a_u07_circle_derivation_half_circumference_length","CIRCLE_DERIVATION_HALF_CIRCUMFERENCE_LENGTH","HALF_CIRCUMFERENCE_LENGTH",G6A_U07_P07F11_INCLUDED_RELATIONS[0],"SYMBOLIC_PI_R"),
  spec("ps_g6a_u07_circle_derivation_radius_width","CIRCLE_DERIVATION_RADIUS_WIDTH","RADIUS_WIDTH",G6A_U07_P07F11_INCLUDED_RELATIONS[1],"SYMBOLIC_R"),
  spec("ps_g6a_u07_circle_derivation_area_conservation","CIRCLE_DERIVATION_AREA_CONSERVATION","AREA_CONSERVATION",G6A_U07_P07F11_INCLUDED_RELATIONS[2],"CATEGORICAL_AREA_UNCHANGED"),
  spec("ps_g6a_u07_circle_derivation_finer_sector_approximation","CIRCLE_DERIVATION_FINER_SECTOR_APPROXIMATION","FINER_SECTOR_APPROXIMATION",G6A_U07_P07F11_INCLUDED_RELATIONS[3],"CHOICE_A_OR_B"),
  spec("ps_g6a_u07_circle_derivation_pi_r_squared_conclusion","CIRCLE_DERIVATION_PI_R_SQUARED_CONCLUSION","PI_R_SQUARED_CONCLUSION",G6A_U07_P07F11_INCLUDED_RELATIONS[4],"SYMBOLIC_PI_R_SQUARED")
]);
export const G6A_U07_P07F11_SPEC_IDS=Object.freeze(G6A_U07_P07F11_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G6A_U07_P07F11_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g6a_u07_circle_area_derivation_p07f11",r04MappingId:"r04map_g6a_u07_circle_area_derivation",sourceId:G6A_U07_P07F11_SOURCE_ID,
  r02HistoricalEvidencePages:Object.freeze([1,2]),originalPdfDirectDerivationSupport:false,
  supplementaryEvidenceAuthorityType:"OPERATOR_PROVIDED_SUPPLEMENTARY_VISUAL_EVIDENCE",
  supplementaryEvidenceDriveFolderId:"1j9IL4gBUKRm-PoTf_4O45uFluALDAlW_",
  supplementaryEvidenceDriveFileIds:Object.freeze(["1ENnQeJzHafoGtU4_JzFvhfNGCPO9y4-j","1bh1Jt09sz2CMAj2IT84vf86xMSOXK7Zh","1E1UTujUoXt_AwZAzK7B1Ezn2e1ocdNab"]),
  knowledgePointId:G6A_U07_P07F11_KP_ID,canonicalNameZh:"圓面積剪拼推導",
  capabilityStatement:"學生能由扇形剪拼近似長方形理解公式。",
  reasoningInvariant:"剪拼保持面積；將圓等分為愈多扇形並交錯重組，圖形愈接近長方形；長為半圓周 πr、寬為半徑 r，因此圓面積為 πr²。",
  sourceSemanticCore:"CIRCLE_AREA_DERIVATION_BY_SECTOR_REARRANGEMENT_TO_APPROX_RECTANGLE",
  semanticAuthority:"ORIGINAL_6A07_CURRICULUM_CONTEXT_PLUS_OPERATOR_PROVIDED_DIRECT_DERIVATION_VISUAL_EVIDENCE",
  primaryRuntimeProfileId:"profile_geometry_formula",classificationRuleId:"rule_geometry_formula",appliedRuntimeModifierIds:G6A_U07_P07F11_APPLIED_MODIFIER_IDS,
  requiredCapabilityIds:G6A_U07_P07F11_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G6A_U07_P07F11_OPTIONAL_CAPABILITY_IDS,queueRequiredW7CapabilityIds:G6A_U07_P07F11_QUEUE_REQUIRED_CAPABILITY_IDS,
  patternSpecIds:G6A_U07_P07F11_SPEC_IDS,
  requiredPrerequisiteKnowledgePointIds:G6A_U07_P07F11_PREDECESSOR_KP_IDS,
  circleAreaFormulaProductionAllowed:false,sectorAreaAllowed:false,annulusAreaAllowed:false,compositeCircleAreaAllowed:false,
  applicationContextAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false,r04ReclassificationAllowed:false,frozenQueueMutationAllowed:false
});
export const G6A_U07_P07F11_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G6A_U07_P07F11_KP_ID,sourceId:G6A_U07_P07F11_SOURCE_ID,unitCode:G6A_U07_P07F11_UNIT_CODE,unitTitle:G6A_U07_P07F11_UNIT_TITLE,
  displayName:"圓面積剪拼推導",canonicalNameZh:"圓面積剪拼推導",mode:"diagram",questionMode:"diagram",questionModes:Object.freeze(["diagram"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,
  applicationClassification:"DERIVATION_DIAGRAM_ONLY_APPLICATION_NOT_ADMITTED",canonicalPatternGroupIds:Object.freeze([G6A_U07_P07F11_PATTERN_GROUP.patternGroupId]),
  canonicalPatternSpecIds:G6A_U07_P07F11_SPEC_IDS,patternGroupIds:Object.freeze([G6A_U07_P07F11_PATTERN_GROUP.patternGroupId]),patternSpecIds:G6A_U07_P07F11_SPEC_IDS,
  requiredCapabilityIds:G6A_U07_P07F11_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G6A_U07_P07F11_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P07F11_G6A_U07_SOURCE_BACKED_CIRCLE_AREA_DERIVATION",productionUse:"full_product_w7_slice011_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6AU07P07F11SelectorRow=id=>id===G6A_U07_P07F11_KP_ID?clone(G6A_U07_P07F11_SELECTOR_ROW):null;
export const listG6AU07P07F11PatternGroups=id=>id===G6A_U07_P07F11_KP_ID?[clone(G6A_U07_P07F11_PATTERN_GROUP)]:[];
export const resolveG6AU07P07F11PatternSpecIds=id=>id===G6A_U07_P07F11_KP_ID?clone(G6A_U07_P07F11_SPEC_IDS):[];
export function auditG6AU07P07F11Projection(){
  const e=[],m=G6A_U07_P07F11_FORMAL_MAPPING;
  if(G6A_U07_P07F11_PATTERN_SPECS.length!==5||m.patternSpecIds.length!==5||new Set(G6A_U07_P07F11_SPEC_IDS).size!==5)e.push("P07F11_PATTERN_CARDINALITY_INVALID");
  if(G6A_U07_P07F11_PATTERN_SPECS.some(x=>x.questionMode!=="diagram"||x.semanticCore!=="CIRCLE_AREA_DERIVATION_BY_SECTOR_REARRANGEMENT_TO_APPROX_RECTANGLE"||!x.requiresDiagramRepresentation||!x.areaConservationPrerequisiteRequired||!x.circleCircumferenceFormulaPrerequisiteRequired||!x.circleCutIntoSectorsRequired||!x.alternatingSectorRearrangementRequired||!x.halfCircumferenceAsLengthRequired||!x.radiusAsWidthRequired||!x.finerSectorCountApproachesRectangleRequired||!x.formulaConclusionPiRSquaredRequired||x.circleAreaFormulaProductionAllowed||x.sectorAreaAllowed||x.annulusAreaAllowed||x.compositeCircleAreaAllowed||x.applicationContextAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed))e.push("P07F11_PATTERN_SCOPE_INVALID");
  if(m.originalPdfDirectDerivationSupport||m.supplementaryEvidenceAuthorityType!=="OPERATOR_PROVIDED_SUPPLEMENTARY_VISUAL_EVIDENCE"||m.supplementaryEvidenceDriveFileIds.length!==3||m.primaryRuntimeProfileId!=="profile_geometry_formula"||m.classificationRuleId!=="rule_geometry_formula"||m.appliedRuntimeModifierIds.length!==0||m.circleAreaFormulaProductionAllowed||m.sectorAreaAllowed||m.annulusAreaAllowed||m.compositeCircleAreaAllowed||m.applicationContextAllowed||m.sameUnitMixedAllowed||m.crossUnitMixedAllowed||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed)e.push("P07F11_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:5,formalMappings:1})});
}
