export const P08F20_TASK_ID="P08F_W8DirectProductVerticalSlice020Implementation";
export const G6A_U07_P08F20_SOURCE_ID="g6a_u07_6a07";
export const G6A_U07_P08F20_UNIT_CODE="6A-U07";
export const G6A_U07_P08F20_UNIT_TITLE="圓面積和扇形面積";
export const G6A_U07_P08F20_KP_ID="kp_g6a_u07_composite_circle_area";
export const G6A_U07_P08F20_PRIOR_KP_IDS=Object.freeze([
  "kp_g6a_u07_circle_area_derivation",
  "kp_g6a_u07_circle_area_formula",
  "kp_g6a_u07_annulus_area",
  "kp_g6a_u07_sector_area"
]);
export const G6A_U07_P08F20_FUTURE_KP_IDS=Object.freeze([]);
export const G6A_U07_P08F20_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution",
  "cap_deterministic_answer_model",
  "cap_worksheet_document_assembly",
  "cap_answer_key_projection",
  "cap_html_print_renderer",
  "cap_geometry_formula_evaluation",
  "cap_geometry_domain_validator",
  "cap_geometry_diagram_representation"
]);
export const G6A_U07_P08F20_CONTRACT_ONLY_CAPABILITY_IDS=Object.freeze([
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_formula_evaluation",
  "cap_geometry_property_reasoning"
]);
export const G6A_U07_P08F20_OPTIONAL_CAPABILITY_IDS=Object.freeze([]);
export const G6A_U07_P08F20_APPLIED_MODIFIER_IDS=Object.freeze([]);
export const G6A_U07_P08F20_PATTERN_GROUP_ID="pg_g6a_u07_composite_circle_area";
export const G6A_U07_P08F20_INCLUDED_RELATIONS=Object.freeze([
  "COMBINE_SEMICIRCLE_AND_SECTOR_AREAS",
  "SUBTRACT_CIRCLE_FROM_SQUARE_AREA",
  "VERIFY_NON_OVERLAPPING_PARTITION",
  "VERIFY_NO_OMISSION_OR_DOUBLE_COUNT"
]);
export const G6A_U07_P08F20_EXCLUDED_RELATIONS=Object.freeze([
  "Q011_CIRCLE_AREA_DERIVATION_TEACHING_REOWNERSHIP",
  "Q014_CIRCLE_AREA_FORMULA_TEACHING_REOWNERSHIP",
  "Q017_ANNULUS_AREA_TEACHING_REOWNERSHIP",
  "Q019_SECTOR_AREA_TEACHING_REOWNERSHIP",
  "ARC_LENGTH_OR_PERIMETER_TEACHING",
  "APPLICATION_CONTEXT",
  "SAME_UNIT_MIXED_MODE",
  "CROSS_UNIT_MIXED_MODE",
  "Q021_OR_LATER_IMPLEMENTATION"
]);

const spec=(id,family,targetKind,relation,visualFamily)=>Object.freeze({
  patternSpecId:id,
  knowledgePointId:G6A_U07_P08F20_KP_ID,
  patternGroupId:G6A_U07_P08F20_PATTERN_GROUP_ID,
  patternFamilyId:family,
  relation,
  targetKind,
  sourceVisualFamily:visualFamily,
  semanticCore:"COMPOSITE_CIRCLE_AREA_BY_PARTITION_AND_SUBTRACTION",
  questionMode:"diagram",
  answerDomain:"POSITIVE_DECIMAL_AREA",
  representation:"composite_circle_area_diagram_p08f20",
  requiresDiagramRepresentation:true,
  decompositionIntoNonOverlappingRegionsRequired:true,
  noOmissionOrDoubleCountRequired:true,
  circleAreaFormulaPrerequisiteAllowed:true,
  sectorAreaPrerequisiteAllowed:targetKind==="SEMICIRCLE_PLUS_SECTOR",
  annulusAreaPrerequisiteAllowed:false,
  q011CircleAreaDerivationTeachingReownershipAllowed:false,
  q014CircleAreaFormulaTeachingReownershipAllowed:false,
  q017AnnulusAreaTeachingReownershipAllowed:false,
  q019SectorAreaTeachingReownershipAllowed:false,
  arcLengthOrPerimeterTeachingAllowed:false,
  applicationContextAllowed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false
});
export const G6A_U07_P08F20_PATTERN_SPECS=Object.freeze([
  spec(
    "ps_g6a_u07_composite_circle_area_semicircle_plus_sector",
    "COMPOSITE_SEMICIRCLE_PLUS_SECTOR",
    "SEMICIRCLE_PLUS_SECTOR",
    G6A_U07_P08F20_INCLUDED_RELATIONS[0],
    "QUARTER_CIRCLE_AND_SEMICIRCLE_COMPOSITE_AREA"
  ),
  spec(
    "ps_g6a_u07_composite_circle_area_square_minus_circle",
    "COMPOSITE_SQUARE_MINUS_CIRCLE",
    "SQUARE_MINUS_CIRCLE",
    G6A_U07_P08F20_INCLUDED_RELATIONS[1],
    "SQUARE_CIRCLE_COMPOSITE_AREA"
  )
]);
export const G6A_U07_P08F20_SPEC_IDS=Object.freeze(G6A_U07_P08F20_PATTERN_SPECS.map(x=>x.patternSpecId));

export const G6A_U07_P08F20_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g6a_u07_composite_circle_area_p08f20",
  r04MappingId:"r04map_g6a_u07_composite_circle_area",
  sourceId:G6A_U07_P08F20_SOURCE_ID,
  sourcePages:Object.freeze([1,2]),
  directVisualWitnessPage:1,
  directVisualWitnessFamilies:Object.freeze([
    "QUARTER_CIRCLE_AND_SEMICIRCLE_COMPOSITE_AREA",
    "CIRCULAR_SEGMENT_AREA",
    "SQUARE_CIRCLE_COMPOSITE_AREA",
    "INSCRIBED_RECTANGLE_IN_CIRCLE_AREA",
    "CONCENTRIC_CIRCLE_COMPOSITE_AREA"
  ]),
  knowledgePointId:G6A_U07_P08F20_KP_ID,
  canonicalNameZh:"複合圓形面積",
  capabilityStatement:"學生能分割或扣除求含半圓、扇形的複合面積。",
  reasoningInvariant:"各部分不可重疊漏算，弧形部分按對應圓比例計算。",
  semanticCore:"COMPOSITE_CIRCLE_AREA_BY_PARTITION_AND_SUBTRACTION",
  semanticAuthority:"R02_REVIEWED_CANDIDATE_PRIMARY_CURRENT_VISUAL_COMPOSITE_AREA_WITNESS_SECONDARY",
  primaryRuntimeProfileId:"profile_geometry_formula",
  classificationRuleId:"rule_geometry_formula",
  appliedRuntimeModifierIds:G6A_U07_P08F20_APPLIED_MODIFIER_IDS,
  requiredCapabilityIds:G6A_U07_P08F20_REQUIRED_CAPABILITY_IDS,
  contractOnlyRequiredCapabilityIds:G6A_U07_P08F20_CONTRACT_ONLY_CAPABILITY_IDS,
  optionalCapabilityIds:G6A_U07_P08F20_OPTIONAL_CAPABILITY_IDS,
  patternSpecIds:G6A_U07_P08F20_SPEC_IDS,
  priorSameSourceOwners:G6A_U07_P08F20_PRIOR_KP_IDS,
  futureSameSourceOwners:G6A_U07_P08F20_FUTURE_KP_IDS,
  decompositionIntoNonOverlappingRegionsRequired:true,
  subtractionOfExcludedRegionAllowed:true,
  semicircleAndSectorComponentsAllowed:true,
  circleAreaFormulaPrerequisiteAllowed:true,
  sectorAreaPrerequisiteAllowed:true,
  q011CircleAreaDerivationTeachingReowned:false,
  q014CircleAreaFormulaTeachingReowned:false,
  q017AnnulusAreaTeachingReowned:false,
  q019SectorAreaTeachingReowned:false,
  arcLengthOrPerimeterTeachingAllowed:false,
  applicationContextAllowed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false,
  r04ReclassificationAllowed:false,
  r05AssignmentMutationAllowed:false,
  frozenQueueMutationAllowed:false
});

export const G6A_U07_P08F20_PATTERN_GROUP=Object.freeze({
  patternGroupId:G6A_U07_P08F20_PATTERN_GROUP_ID,
  sourceId:G6A_U07_P08F20_SOURCE_ID,
  unitCode:G6A_U07_P08F20_UNIT_CODE,
  unitTitle:G6A_U07_P08F20_UNIT_TITLE,
  displayName:"複合圓形面積",
  primaryKnowledgePointId:G6A_U07_P08F20_KP_ID,
  knowledgePointIds:Object.freeze([G6A_U07_P08F20_KP_ID]),
  supportClass:"A",
  mode:"diagram",
  publicQuestionMode:"diagram",
  representationTag:"composite_circle_area_diagram_p08f20",
  representationTags:Object.freeze(["geometry","circle","sector","semicircle","square","area","composite","subtraction","diagram"]),
  patternSpecIds:G6A_U07_P08F20_SPEC_IDS,
  allocationPolicy:"balanced_pattern_spec",
  visibilityStatus:"visible",
  holdReason:null
});

export const G6A_U07_P08F20_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G6A_U07_P08F20_KP_ID,
  sourceId:G6A_U07_P08F20_SOURCE_ID,
  unitCode:G6A_U07_P08F20_UNIT_CODE,
  unitTitle:G6A_U07_P08F20_UNIT_TITLE,
  displayName:"複合圓形面積",
  canonicalNameZh:"複合圓形面積",
  mode:"diagram",
  questionMode:"diagram",
  questionModes:Object.freeze(["diagram"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:"DIAGRAM_FORMULA_ONLY_APPLICATION_NOT_ADMITTED",
  canonicalPatternGroupIds:Object.freeze([G6A_U07_P08F20_PATTERN_GROUP_ID]),
  canonicalPatternSpecIds:G6A_U07_P08F20_SPEC_IDS,
  patternGroupIds:Object.freeze([G6A_U07_P08F20_PATTERN_GROUP_ID]),
  patternSpecIds:G6A_U07_P08F20_SPEC_IDS,
  requiredCapabilityIds:G6A_U07_P08F20_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6A_U07_P08F20_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P08F20_G6A_U07_SOURCE_BACKED_COMPOSITE_CIRCLE_AREA",
  productionUse:"full_product_w8_slice020_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6AU07P08F20SelectorRow=id=>id===G6A_U07_P08F20_KP_ID?clone(G6A_U07_P08F20_SELECTOR_ROW):null;
export const listG6AU07P08F20PatternGroups=id=>id===G6A_U07_P08F20_KP_ID?[clone(G6A_U07_P08F20_PATTERN_GROUP)]:[];
export const resolveG6AU07P08F20PatternSpecIds=id=>id===G6A_U07_P08F20_KP_ID?clone(G6A_U07_P08F20_SPEC_IDS):[];

export function auditG6AU07P08F20Projection(){
  const e=[],m=G6A_U07_P08F20_FORMAL_MAPPING;
  if(G6A_U07_P08F20_PATTERN_SPECS.length!==2||new Set(G6A_U07_P08F20_SPEC_IDS).size!==2)e.push("P08F20_PATTERN_CARDINALITY_INVALID");
  const kinds=new Set(G6A_U07_P08F20_PATTERN_SPECS.map(x=>x.targetKind));
  for(const k of ["SEMICIRCLE_PLUS_SECTOR","SQUARE_MINUS_CIRCLE"])if(!kinds.has(k))e.push("P08F20_TARGET_KIND_MISSING:"+k);
  for(const x of G6A_U07_P08F20_PATTERN_SPECS){
    if(x.questionMode!=="diagram"||x.semanticCore!==m.semanticCore||!x.requiresDiagramRepresentation||
      !x.decompositionIntoNonOverlappingRegionsRequired||!x.noOmissionOrDoubleCountRequired||
      !x.circleAreaFormulaPrerequisiteAllowed||x.annulusAreaPrerequisiteAllowed||
      x.q011CircleAreaDerivationTeachingReownershipAllowed||x.q014CircleAreaFormulaTeachingReownershipAllowed||
      x.q017AnnulusAreaTeachingReownershipAllowed||x.q019SectorAreaTeachingReownershipAllowed||
      x.arcLengthOrPerimeterTeachingAllowed||x.applicationContextAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed)
      e.push("P08F20_PATTERN_SCOPE_INVALID:"+x.patternSpecId);
  }
  if(m.primaryRuntimeProfileId!=="profile_geometry_formula"||m.classificationRuleId!=="rule_geometry_formula"||
    m.appliedRuntimeModifierIds.length!==0||m.optionalCapabilityIds.length!==0||
    m.semanticAuthority!=="R02_REVIEWED_CANDIDATE_PRIMARY_CURRENT_VISUAL_COMPOSITE_AREA_WITNESS_SECONDARY"||
    !m.decompositionIntoNonOverlappingRegionsRequired||!m.subtractionOfExcludedRegionAllowed||!m.semicircleAndSectorComponentsAllowed||
    m.q011CircleAreaDerivationTeachingReowned||m.q014CircleAreaFormulaTeachingReowned||m.q017AnnulusAreaTeachingReowned||
    m.q019SectorAreaTeachingReowned||m.arcLengthOrPerimeterTeachingAllowed||m.applicationContextAllowed||
    m.sameUnitMixedAllowed||m.crossUnitMixedAllowed||m.r04ReclassificationAllowed||m.r05AssignmentMutationAllowed||m.frozenQueueMutationAllowed)
    e.push("P08F20_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:2,formalMappings:1})});
}
