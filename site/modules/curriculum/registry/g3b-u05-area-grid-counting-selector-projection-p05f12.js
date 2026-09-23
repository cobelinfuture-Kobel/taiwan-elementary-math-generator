export const P05F12_TASK_ID="P05F_W5DirectProductVerticalSlice012Implementation";
export const G3B_U05_P05F12_SOURCE_ID="g3b_u05_3b05";
export const G3B_U05_P05F12_UNIT_CODE="3B-U05";
export const G3B_U05_P05F12_UNIT_TITLE="面積與平方公分";
export const G3B_U05_P05F12_KP_ID="kp_area_grid_counting";
export const G3B_U05_P05F12_EXISTING_KP_ID="kp_area_square_centimeter_unit";
export const G3B_U05_P05F12_PATTERN_GROUP_ID="pg_g3b_u05_area_grid_counting";
export const G3B_U05_P05F12_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_formula_evaluation",
  "cap_geometry_property_reasoning",
]);
export const G3B_U05_P05F12_INCLUDED_RELATIONS=Object.freeze([
  "COUNT_COMPLETE_UNIT_SQUARES_FOR_AREA",
  "COUNT_PARTIAL_HALF_UNIT_SQUARES_FOR_AREA",
  "PAIR_HALF_UNIT_SQUARES_TO_EQUIVALENT_WHOLE_UNITS",
  "COMPUTE_AREA_FROM_UNIT_GRID_COUNT",
  "PRESERVE_NO_OVERLAP_NO_GAP_COVERAGE_INVARIANT",
]);
export const G3B_U05_P05F12_EXCLUDED_RELATIONS=Object.freeze([
  "IDENTIFY_ONE_SQUARE_CENTIMETER_AS_TARGET_KP",
  "DISTINGUISH_AREA_UNIT_FROM_LENGTH_OR_PERIMETER_UNIT_AS_TARGET_KP",
  "GENERAL_IRREGULAR_GRID_AREA_DECOMPOSITION_OR_COMPLETION",
  "CUT_REARRANGE_AREA_CONSERVATION",
  "COMPARE_AREA_UNDER_SAME_PERIMETER",
  "RECTANGLE_AREA_FORMULA",
  "SQUARE_AREA_FORMULA",
  "PERIMETER_COMPUTATION",
  "REAL_WORLD_AREA_ESTIMATION",
  "APPLICATION_CONTEXT",
]);
const slug=relation=>relation.toLowerCase();
export const G3B_U05_P05F12_PATTERN_SPECS=Object.freeze(G3B_U05_P05F12_INCLUDED_RELATIONS.map(relation=>Object.freeze({
  patternSpecId:`ps_g3b_u05_${slug(relation)}`,
  knowledgePointId:G3B_U05_P05F12_KP_ID,
  patternGroupId:G3B_U05_P05F12_PATTERN_GROUP_ID,
  patternFamilyId:"AREA_GRID_COUNTING",
  relation,
  questionMode:"diagram",
  requiresDiagramRepresentation:true,
  applicationAllowed:false,
  irregularGridDecompositionAllowed:false,
  cutRearrangeConservationAllowed:false,
  samePerimeterComparisonAllowed:false,
  rectangleSquareFormulaAllowed:false,
  realWorldEstimationAllowed:false,
})));
export const G3B_U05_P05F12_SPEC_IDS=Object.freeze(G3B_U05_P05F12_PATTERN_SPECS.map(row=>row.patternSpecId));
export const G3B_U05_P05F12_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g3b_u05_area_grid_counting_p05f12",
  sourceId:G3B_U05_P05F12_SOURCE_ID,
  knowledgePointId:G3B_U05_P05F12_KP_ID,
  canonicalNameZh:"方格面積計數",
  relationFamily:"AREA_GRID_COUNTING",
  includedRelations:G3B_U05_P05F12_INCLUDED_RELATIONS,
  excludedRelations:G3B_U05_P05F12_EXCLUDED_RELATIONS,
  questionMode:"diagram",
  applicationImplementationAllowed:false,
  requiredCapabilityIds:G3B_U05_P05F12_REQUIRED_CAPABILITY_IDS,
  patternSpecIds:G3B_U05_P05F12_SPEC_IDS,
});
export const G3B_U05_P05F12_PATTERN_GROUP=Object.freeze({
  patternGroupId:G3B_U05_P05F12_PATTERN_GROUP_ID,sourceId:G3B_U05_P05F12_SOURCE_ID,unitCode:G3B_U05_P05F12_UNIT_CODE,unitTitle:G3B_U05_P05F12_UNIT_TITLE,
  displayName:"方格面積計數",primaryKnowledgePointId:G3B_U05_P05F12_KP_ID,knowledgePointIds:Object.freeze([G3B_U05_P05F12_KP_ID]),supportClass:"A",mode:"diagram",publicQuestionMode:"diagram",
  representationTag:"area_grid_counting_diagram",representationTags:Object.freeze(["geometry","area","unit_grid","diagram"]),patternSpecIds:G3B_U05_P05F12_SPEC_IDS,
  allocationPolicy:"balanced_relation",visibilityStatus:"visible",holdReason:null,
});
export const G3B_U05_P05F12_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G3B_U05_P05F12_KP_ID,sourceId:G3B_U05_P05F12_SOURCE_ID,unitCode:G3B_U05_P05F12_UNIT_CODE,unitTitle:G3B_U05_P05F12_UNIT_TITLE,displayName:"方格面積計數",canonicalNameZh:"方格面積計數",
  mode:"diagram",questionMode:"diagram",questionModes:Object.freeze(["diagram"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,
  applicationClassification:"DIAGRAM_ONLY_APPLICATION_NOT_ADMITTED",canonicalPatternGroupIds:Object.freeze([G3B_U05_P05F12_PATTERN_GROUP_ID]),canonicalPatternSpecIds:G3B_U05_P05F12_SPEC_IDS,
  patternGroupIds:Object.freeze([G3B_U05_P05F12_PATTERN_GROUP_ID]),patternSpecIds:G3B_U05_P05F12_SPEC_IDS,requiredCapabilityIds:G3B_U05_P05F12_REQUIRED_CAPABILITY_IDS,
  qaStatusLabel:"P05F12_G3B_U05_SOURCE_BACKED_AREA_GRID_DIAGRAM",productionUse:"full_product_w5_slice012_candidate",
});
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
export function getG3BU05P05F12SelectorRow(id){return id===G3B_U05_P05F12_KP_ID?clone(G3B_U05_P05F12_SELECTOR_ROW):null;}
export function listG3BU05P05F12PatternGroups(id){return id===G3B_U05_P05F12_KP_ID?[clone(G3B_U05_P05F12_PATTERN_GROUP)]:[];}
export function resolveG3BU05P05F12PatternSpecIds(id){return id===G3B_U05_P05F12_KP_ID?clone(G3B_U05_P05F12_SPEC_IDS):[];}
export function auditG3BU05P05F12SelectorProjection(){const errors=[];if(G3B_U05_P05F12_PATTERN_SPECS.length!==5)errors.push("P05F12_PATTERN_CARDINALITY_INVALID");if(new Set(G3B_U05_P05F12_SPEC_IDS).size!==5)errors.push("P05F12_DUPLICATE_SPEC_ID");if(G3B_U05_P05F12_PATTERN_SPECS.some(row=>row.questionMode!=="diagram"||!row.requiresDiagramRepresentation||row.applicationAllowed||row.irregularGridDecompositionAllowed||row.cutRearrangeConservationAllowed||row.samePerimeterComparisonAllowed||row.rectangleSquareFormulaAllowed||row.realWorldEstimationAllowed))errors.push("P05F12_PATTERN_INVARIANT_INVALID");if(G3B_U05_P05F12_FORMAL_MAPPING.includedRelations.some(relation=>!G3B_U05_P05F12_PATTERN_SPECS.some(row=>row.relation===relation)))errors.push("P05F12_RELATION_MISSING");return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:5,diagram:5,application:0})});}
