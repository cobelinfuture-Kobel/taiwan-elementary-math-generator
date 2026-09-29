export const P08F19_TASK_ID="P08F_W8DirectProductVerticalSlice019Implementation";
export const G6A_U07_P08F19_SOURCE_ID="g6a_u07_6a07";
export const G6A_U07_P08F19_UNIT_CODE="6A-U07";
export const G6A_U07_P08F19_UNIT_TITLE="圓面積和扇形面積";
export const G6A_U07_P08F19_KP_ID="kp_g6a_u07_sector_area";
export const G6A_U07_P08F19_PRIOR_KP_IDS=Object.freeze([
  "kp_g6a_u07_circle_area_derivation",
  "kp_g6a_u07_circle_area_formula",
  "kp_g6a_u07_annulus_area"
]);
export const G6A_U07_P08F19_FUTURE_KP_IDS=Object.freeze([
  "kp_g6a_u07_composite_circle_area"
]);
export const G6A_U07_P08F19_REQUIRED_CAPABILITY_IDS=Object.freeze([
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
export const G6A_U07_P08F19_CONTRACT_ONLY_CAPABILITY_IDS=Object.freeze([
  "cap_geometry_formula_evaluation",
  "cap_geometry_property_reasoning",
  "cap_geometry_domain_validator",
  "cap_geometry_diagram_representation"
]);
export const G6A_U07_P08F19_OPTIONAL_CAPABILITY_IDS=Object.freeze([]);
export const G6A_U07_P08F19_APPLIED_MODIFIER_IDS=Object.freeze(["mod_integer_division"]);
export const G6A_U07_P08F19_PATTERN_GROUP_ID="pg_g6a_u07_sector_area";
export const G6A_U07_P08F19_INCLUDED_RELATIONS=Object.freeze([
  "COMPUTE_SECTOR_AREA_FROM_RADIUS_AND_CENTRAL_ANGLE",
  "COMPUTE_SECTOR_AREA_FROM_DIAMETER_AFTER_RADIUS_NORMALIZATION",
  "VERIFY_SECTOR_AREA_AS_CIRCLE_AREA_TIMES_ANGLE_FRACTION",
  "VERIFY_FULL_CIRCLE_360_DEGREE_CLOSURE"
]);
export const G6A_U07_P08F19_EXCLUDED_RELATIONS=Object.freeze([
  "Q011_CIRCLE_AREA_DERIVATION_TEACHING_REOWNERSHIP",
  "Q014_CIRCLE_AREA_FORMULA_TEACHING_REOWNERSHIP",
  "Q017_ANNULUS_AREA_TEACHING_REOWNERSHIP",
  "COMPOSITE_CIRCLE_AREA",
  "ARC_LENGTH_OR_PERIMETER_TEACHING",
  "GENERIC_SECTOR_FRACTION_TEACHING_REOWNERSHIP",
  "APPLICATION_CONTEXT",
  "SAME_UNIT_MIXED_MODE",
  "CROSS_UNIT_MIXED_MODE",
  "Q020_OR_LATER_IMPLEMENTATION"
]);

const spec=(id,family,targetKind,relation)=>Object.freeze({
  patternSpecId:id,
  knowledgePointId:G6A_U07_P08F19_KP_ID,
  patternGroupId:G6A_U07_P08F19_PATTERN_GROUP_ID,
  patternFamilyId:family,
  relation,
  targetKind,
  semanticCore:"SECTOR_AREA_AS_CIRCLE_AREA_TIMES_CENTRAL_ANGLE_OVER_360",
  questionMode:"diagram",
  answerDomain:"POSITIVE_DECIMAL_AREA",
  representation:"sector_area_diagram_p08f19",
  requiresDiagramRepresentation:true,
  circleAreaAsWholeReferenceRequired:true,
  centralAngleFractionOf360Required:true,
  sectorAreaEqualsCircleAreaTimesAngleFractionRequired:true,
  fullCircleDegrees:360,
  approximatePiValue:3.14,
  diameterToRadiusNormalizationRequired:targetKind==="FROM_DIAMETER_AND_ANGLE",
  q011CircleAreaDerivationTeachingReownershipAllowed:false,
  q014CircleAreaFormulaTeachingReownershipAllowed:false,
  q017AnnulusAreaTeachingReownershipAllowed:false,
  futureCompositeCircleAreaTeachingReownershipAllowed:false,
  arcLengthOrPerimeterTeachingAllowed:false,
  genericSectorFractionTeachingReownershipAllowed:false,
  applicationContextAllowed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false
});
export const G6A_U07_P08F19_PATTERN_SPECS=Object.freeze([
  spec(
    "ps_g6a_u07_sector_area_from_radius_angle",
    "SECTOR_AREA_FROM_RADIUS_AND_CENTRAL_ANGLE",
    "FROM_RADIUS_AND_ANGLE",
    G6A_U07_P08F19_INCLUDED_RELATIONS[0]
  ),
  spec(
    "ps_g6a_u07_sector_area_from_diameter_angle",
    "SECTOR_AREA_FROM_DIAMETER_AND_CENTRAL_ANGLE",
    "FROM_DIAMETER_AND_ANGLE",
    G6A_U07_P08F19_INCLUDED_RELATIONS[1]
  )
]);
export const G6A_U07_P08F19_SPEC_IDS=Object.freeze(G6A_U07_P08F19_PATTERN_SPECS.map(x=>x.patternSpecId));

export const G6A_U07_P08F19_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g6a_u07_sector_area_p08f19",
  r04MappingId:"r04map_g6a_u07_sector_area",
  sourceId:G6A_U07_P08F19_SOURCE_ID,
  sourcePages:Object.freeze([1,2]),
  directVisualWitnessPage:1,
  directVisualWitnessFamily:"SECTOR_AREA_RADIUS_18_ANGLE_30",
  knowledgePointId:G6A_U07_P08F19_KP_ID,
  canonicalNameZh:"扇形面積",
  capabilityStatement:"學生能依圓心角比例求扇形面積。",
  reasoningInvariant:"扇形面積等於圓面積乘圓心角除以360度。",
  semanticCore:"SECTOR_AREA_AS_CIRCLE_AREA_TIMES_CENTRAL_ANGLE_OVER_360",
  semanticAuthority:"R02_REVIEWED_CANDIDATE_PRIMARY_CURRENT_VISUAL_SECTOR_AREA_WITNESS_SECONDARY",
  primaryRuntimeProfileId:"profile_geometry_formula",
  classificationRuleId:"rule_geometry_formula",
  appliedRuntimeModifierIds:G6A_U07_P08F19_APPLIED_MODIFIER_IDS,
  requiredCapabilityIds:G6A_U07_P08F19_REQUIRED_CAPABILITY_IDS,
  contractOnlyRequiredCapabilityIds:G6A_U07_P08F19_CONTRACT_ONLY_CAPABILITY_IDS,
  optionalCapabilityIds:G6A_U07_P08F19_OPTIONAL_CAPABILITY_IDS,
  patternSpecIds:G6A_U07_P08F19_SPEC_IDS,
  priorSameSourceOwners:G6A_U07_P08F19_PRIOR_KP_IDS,
  futureSameSourceOwners:G6A_U07_P08F19_FUTURE_KP_IDS,
  circleAreaAsWholeReferenceRequired:true,
  centralAngleFractionOf360Required:true,
  sectorAreaEqualsCircleAreaTimesAngleFractionRequired:true,
  fullCircleDegrees:360,
  approximatePiValue:3.14,
  diameterToRadiusNormalizationAllowed:true,
  q011CircleAreaDerivationTeachingReowned:false,
  q014CircleAreaFormulaTeachingReowned:false,
  q017AnnulusAreaTeachingReowned:false,
  futureCompositeCircleAreaTeachingReowned:false,
  arcLengthOrPerimeterTeachingAllowed:false,
  genericSectorFractionTeachingReowned:false,
  applicationContextAllowed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false,
  r04ReclassificationAllowed:false,
  r05AssignmentMutationAllowed:false,
  frozenQueueMutationAllowed:false
});

export const G6A_U07_P08F19_PATTERN_GROUP=Object.freeze({
  patternGroupId:G6A_U07_P08F19_PATTERN_GROUP_ID,
  sourceId:G6A_U07_P08F19_SOURCE_ID,
  unitCode:G6A_U07_P08F19_UNIT_CODE,
  unitTitle:G6A_U07_P08F19_UNIT_TITLE,
  displayName:"扇形面積",
  primaryKnowledgePointId:G6A_U07_P08F19_KP_ID,
  knowledgePointIds:Object.freeze([G6A_U07_P08F19_KP_ID]),
  supportClass:"A",
  mode:"diagram",
  publicQuestionMode:"diagram",
  representationTag:"sector_area_diagram_p08f19",
  representationTags:Object.freeze(["geometry","circle","sector","area","radius","diameter","central_angle","pi","diagram"]),
  patternSpecIds:G6A_U07_P08F19_SPEC_IDS,
  allocationPolicy:"balanced_pattern_spec",
  visibilityStatus:"visible",
  holdReason:null
});

export const G6A_U07_P08F19_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G6A_U07_P08F19_KP_ID,
  sourceId:G6A_U07_P08F19_SOURCE_ID,
  unitCode:G6A_U07_P08F19_UNIT_CODE,
  unitTitle:G6A_U07_P08F19_UNIT_TITLE,
  displayName:"扇形面積",
  canonicalNameZh:"扇形面積",
  mode:"diagram",
  questionMode:"diagram",
  questionModes:Object.freeze(["diagram"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:"DIAGRAM_FORMULA_ONLY_APPLICATION_NOT_ADMITTED",
  canonicalPatternGroupIds:Object.freeze([G6A_U07_P08F19_PATTERN_GROUP_ID]),
  canonicalPatternSpecIds:G6A_U07_P08F19_SPEC_IDS,
  patternGroupIds:Object.freeze([G6A_U07_P08F19_PATTERN_GROUP_ID]),
  patternSpecIds:G6A_U07_P08F19_SPEC_IDS,
  requiredCapabilityIds:G6A_U07_P08F19_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G6A_U07_P08F19_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P08F19_G6A_U07_SOURCE_BACKED_SECTOR_AREA",
  productionUse:"full_product_w8_slice019_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6AU07P08F19SelectorRow=id=>id===G6A_U07_P08F19_KP_ID?clone(G6A_U07_P08F19_SELECTOR_ROW):null;
export const listG6AU07P08F19PatternGroups=id=>id===G6A_U07_P08F19_KP_ID?[clone(G6A_U07_P08F19_PATTERN_GROUP)]:[];
export const resolveG6AU07P08F19PatternSpecIds=id=>id===G6A_U07_P08F19_KP_ID?clone(G6A_U07_P08F19_SPEC_IDS):[];

export function auditG6AU07P08F19Projection(){
  const e=[],m=G6A_U07_P08F19_FORMAL_MAPPING;
  if(G6A_U07_P08F19_PATTERN_SPECS.length!==2||new Set(G6A_U07_P08F19_SPEC_IDS).size!==2)e.push("P08F19_PATTERN_CARDINALITY_INVALID");
  const kinds=new Set(G6A_U07_P08F19_PATTERN_SPECS.map(x=>x.targetKind));
  for(const k of ["FROM_RADIUS_AND_ANGLE","FROM_DIAMETER_AND_ANGLE"])if(!kinds.has(k))e.push("P08F19_TARGET_KIND_MISSING:"+k);
  for(const x of G6A_U07_P08F19_PATTERN_SPECS){
    if(x.questionMode!=="diagram"||x.semanticCore!==m.semanticCore||!x.requiresDiagramRepresentation||!x.circleAreaAsWholeReferenceRequired||
      !x.centralAngleFractionOf360Required||!x.sectorAreaEqualsCircleAreaTimesAngleFractionRequired||x.fullCircleDegrees!==360||x.approximatePiValue!==3.14||
      x.q011CircleAreaDerivationTeachingReownershipAllowed||x.q014CircleAreaFormulaTeachingReownershipAllowed||x.q017AnnulusAreaTeachingReownershipAllowed||
      x.futureCompositeCircleAreaTeachingReownershipAllowed||x.arcLengthOrPerimeterTeachingAllowed||x.genericSectorFractionTeachingReownershipAllowed||
      x.applicationContextAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed)e.push("P08F19_PATTERN_SCOPE_INVALID:"+x.patternSpecId);
  }
  if(m.primaryRuntimeProfileId!=="profile_geometry_formula"||m.classificationRuleId!=="rule_geometry_formula"||
    m.appliedRuntimeModifierIds.join("|")!=="mod_integer_division"||!m.requiredCapabilityIds.includes("cap_integer_division")||
    m.semanticAuthority!=="R02_REVIEWED_CANDIDATE_PRIMARY_CURRENT_VISUAL_SECTOR_AREA_WITNESS_SECONDARY"||
    !m.circleAreaAsWholeReferenceRequired||!m.centralAngleFractionOf360Required||!m.sectorAreaEqualsCircleAreaTimesAngleFractionRequired||
    m.fullCircleDegrees!==360||m.approximatePiValue!==3.14||m.q011CircleAreaDerivationTeachingReowned||
    m.q014CircleAreaFormulaTeachingReowned||m.q017AnnulusAreaTeachingReowned||m.futureCompositeCircleAreaTeachingReowned||
    m.arcLengthOrPerimeterTeachingAllowed||m.genericSectorFractionTeachingReowned||m.applicationContextAllowed||m.sameUnitMixedAllowed||
    m.crossUnitMixedAllowed||m.r04ReclassificationAllowed||m.r05AssignmentMutationAllowed||m.frozenQueueMutationAllowed)
    e.push("P08F19_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:2,formalMappings:1})});
}
