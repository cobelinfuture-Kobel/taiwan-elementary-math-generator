export const P05F37_TASK_ID="P05F_W5DirectProductVerticalSlice037Implementation";
export const G5A_U09_P05F37_SOURCE_ID="g5a_u09_5a09";
export const G5A_U09_P05F37_UNIT_CODE="5A-U09";
export const G5A_U09_P05F37_UNIT_TITLE="平行四邊形三角形梯形面積";
export const G5A_U09_P05F37_KP_ID="kp_g5a_u09_parallelogram_area_formula";
export const G5A_U09_P05F37_PATTERN_GROUP_ID="pg_g5a_u09_parallelogram_area_formula";
export const G5A_U09_P05F37_REMAINING_FUTURE_KP_IDS=Object.freeze([
  "kp_g5a_u09_triangle_area_formula",
  "kp_g5a_u09_trapezoid_area_formula",
  "kp_g5a_u09_area_unknown_dimension",
  "kp_g5a_u09_composite_polygon_area",
]);
export const G5A_U09_P05F37_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_formula_evaluation",
  "cap_geometry_property_reasoning",
]);
export const G5A_U09_P05F37_INCLUDED_RELATIONS=Object.freeze([
  "COMPUTE_PARALLELOGRAM_AREA_AS_BASE_TIMES_PERPENDICULAR_HEIGHT",
  "REQUIRE_HEIGHT_PERPENDICULAR_TO_SELECTED_BASE_OR_BASE_EXTENSION",
  "PRESERVE_AREA_UNDER_CUT_REARRANGEMENT_TO_EQUIVALENT_BASE_HEIGHT_RECTANGLE",
]);
export const G5A_U09_P05F37_EXCLUDED_RELATIONS=Object.freeze([
  "TRIANGLE_AREA_FORMULA",
  "TRAPEZOID_AREA_FORMULA",
  "AREA_UNKNOWN_BASE_OR_HEIGHT",
  "COMPOSITE_POLYGON_AREA",
  "RHOMBUS_SPECIFIC_AREA_FORMULA",
  "APPLICATION_CONTEXT_IMPLEMENTATION",
  "SAME_UNIT_MIXED_MODE",
  "CROSS_UNIT_MIXED_MODE",
  "Q038_OR_LATER_SEMANTICS",
]);
const spec=(patternSpecId,relation,diagramMode)=>Object.freeze({patternSpecId,knowledgePointId:G5A_U09_P05F37_KP_ID,patternGroupId:G5A_U09_P05F37_PATTERN_GROUP_ID,patternFamilyId:"PARALLELOGRAM_AREA_FORMULA",relation,diagramMode,questionMode:"diagram",answerDomain:"AREA_SQUARE_CENTIMETER",requiresDiagramRepresentation:true,requiresFormulaEvaluation:true,requiresPerpendicularHeight:true,applicationAllowed:false,triangleFormulaAllowed:false,trapezoidFormulaAllowed:false,unknownDimensionAllowed:false,compositePolygonAreaAllowed:false,rhombusSpecificFormulaAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false});
export const G5A_U09_P05F37_PATTERN_SPECS=Object.freeze([
  spec("ps_g5a_u09_parallelogram_area_base_height",G5A_U09_P05F37_INCLUDED_RELATIONS[0],"BASE_HEIGHT_AREA"),
  spec("ps_g5a_u09_parallelogram_height_perpendicular",G5A_U09_P05F37_INCLUDED_RELATIONS[1],"PERPENDICULAR_HEIGHT"),
  spec("ps_g5a_u09_parallelogram_cut_rearrangement",G5A_U09_P05F37_INCLUDED_RELATIONS[2],"CUT_REARRANGEMENT_EQUIVALENCE"),
]);
export const G5A_U09_P05F37_SPEC_IDS=Object.freeze(G5A_U09_P05F37_PATTERN_SPECS.map(row=>row.patternSpecId));
export const G5A_U09_P05F37_FORMAL_MAPPING=Object.freeze({mappingId:"fm_g5a_u09_parallelogram_area_formula_p05f37",sourceId:G5A_U09_P05F37_SOURCE_ID,sourcePages:Object.freeze([1,2]),knowledgePointId:G5A_U09_P05F37_KP_ID,canonicalNameZh:"平行四邊形面積",capabilityStatement:"學生能以底乘高求平行四邊形面積。",reasoningInvariant:"剪拼為等底等高長方形後面積不變。",relationFamily:"PARALLELOGRAM_AREA_FORMULA",inputRepresentation:"PARALLELOGRAM_BASE_HEIGHT_DIAGRAM",answerDomain:"AREA_SQUARE_CENTIMETER",includedRelations:G5A_U09_P05F37_INCLUDED_RELATIONS,excludedRelations:G5A_U09_P05F37_EXCLUDED_RELATIONS,applicationSuitability:"APPLICATION_COMPATIBLE",applicationImplementationAllowed:false,requiredCapabilityIds:G5A_U09_P05F37_REQUIRED_CAPABILITY_IDS,patternSpecIds:G5A_U09_P05F37_SPEC_IDS,r02EvidencePages:Object.freeze([1]),directVisualCorroborationPages:Object.freeze([1,2]),baseHeightRolesMustRemainPaired:true,selectedHeightMustBePerpendicularToSelectedBaseOrExtension:true,cutRearrangementMustPreserveArea:true});
export const G5A_U09_P05F37_PATTERN_GROUP=Object.freeze({patternGroupId:G5A_U09_P05F37_PATTERN_GROUP_ID,sourceId:G5A_U09_P05F37_SOURCE_ID,unitCode:G5A_U09_P05F37_UNIT_CODE,unitTitle:G5A_U09_P05F37_UNIT_TITLE,displayName:"平行四邊形底高面積圖形題",primaryKnowledgePointId:G5A_U09_P05F37_KP_ID,knowledgePointIds:Object.freeze([G5A_U09_P05F37_KP_ID]),supportClass:"A",mode:"diagram",publicQuestionMode:"diagram",representationTag:"parallelogram_area_formula_diagram",representationTags:Object.freeze(["geometry","area","parallelogram","base_height","perpendicular_height","cut_rearrangement"]),patternSpecIds:G5A_U09_P05F37_SPEC_IDS,allocationPolicy:"balanced_parallelogram_area_relation",visibilityStatus:"visible",holdReason:null});
export const G5A_U09_P05F37_SELECTOR_ROW=Object.freeze({knowledgePointId:G5A_U09_P05F37_KP_ID,sourceId:G5A_U09_P05F37_SOURCE_ID,unitCode:G5A_U09_P05F37_UNIT_CODE,unitTitle:G5A_U09_P05F37_UNIT_TITLE,displayName:"平行四邊形面積",canonicalNameZh:"平行四邊形面積",mode:"diagram",questionMode:"diagram",questionModes:Object.freeze(["diagram"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:"DIAGRAM_ONLY_APPLICATION_COMPATIBLE_CONTEXT_NOT_ADMITTED",canonicalPatternGroupIds:Object.freeze([G5A_U09_P05F37_PATTERN_GROUP_ID]),canonicalPatternSpecIds:G5A_U09_P05F37_SPEC_IDS,patternGroupIds:Object.freeze([G5A_U09_P05F37_PATTERN_GROUP_ID]),patternSpecIds:G5A_U09_P05F37_SPEC_IDS,requiredCapabilityIds:G5A_U09_P05F37_REQUIRED_CAPABILITY_IDS,qaStatusLabel:"P05F37_G5A_U09_SOURCE_BACKED_PARALLELOGRAM_AREA_FORMULA",productionUse:"full_product_w5_slice037_candidate"});
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
export function getG5AU09P05F37SelectorRow(id){return id===G5A_U09_P05F37_KP_ID?clone(G5A_U09_P05F37_SELECTOR_ROW):null;}
export function listG5AU09P05F37PatternGroups(id){return id===G5A_U09_P05F37_KP_ID?[clone(G5A_U09_P05F37_PATTERN_GROUP)]:[];}
export function resolveG5AU09P05F37PatternSpecIds(id){return id===G5A_U09_P05F37_KP_ID?clone(G5A_U09_P05F37_SPEC_IDS):[];}
export function auditG5AU09P05F37Projection(){const errors=[];if(G5A_U09_P05F37_PATTERN_SPECS.length!==3)errors.push("P05F37_PATTERN_CARDINALITY_INVALID");if(new Set(G5A_U09_P05F37_SPEC_IDS).size!==3)errors.push("P05F37_DUPLICATE_SPEC_ID");if(G5A_U09_P05F37_PATTERN_SPECS.some(row=>row.questionMode!=="diagram"||!row.requiresDiagramRepresentation||!row.requiresFormulaEvaluation||!row.requiresPerpendicularHeight||row.applicationAllowed||row.triangleFormulaAllowed||row.trapezoidFormulaAllowed||row.unknownDimensionAllowed||row.compositePolygonAreaAllowed||row.rhombusSpecificFormulaAllowed||row.sameUnitMixedAllowed||row.crossUnitMixedAllowed))errors.push("P05F37_PATTERN_INVARIANT_INVALID");if(G5A_U09_P05F37_FORMAL_MAPPING.includedRelations.some(relation=>!G5A_U09_P05F37_PATTERN_SPECS.some(row=>row.relation===relation)))errors.push("P05F37_RELATION_MISSING");return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,diagram:3,application:0})});}
