export const P05F26_TASK_ID="P05F_W5DirectProductVerticalSlice026Implementation";
export const G4B_U07_P05F26_SOURCE_ID="g4b_u07_4b07";
export const G4B_U07_P05F26_UNIT_CODE="4B-U07";
export const G4B_U07_P05F26_UNIT_TITLE="周長與面積";
export const G4B_U07_P05F26_KP_ID="kp_g4b_u07_rectangle_square_area_formula";
export const G4B_U07_P05F26_PATTERN_GROUP_ID="pg_g4b_u07_rectangle_square_area_formula";
export const G4B_U07_P05F26_REMAINING_FUTURE_KP_IDS=Object.freeze([
  "kp_g4b_u07_perimeter_path_sum",
  "kp_g4b_u07_rectangle_square_perimeter_formula",
  "kp_g4b_u07_composite_perimeter",
  "kp_g4b_u07_composite_rectilinear_area",
]);
export const G4B_U07_P05F26_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_formula_evaluation",
  "cap_geometry_property_reasoning",
]);
export const G4B_U07_P05F26_INCLUDED_RELATIONS=Object.freeze([
  "COMPUTE_RECTANGLE_AREA_AS_LENGTH_TIMES_WIDTH",
  "COMPUTE_SQUARE_AREA_AS_SIDE_TIMES_SIDE",
  "PRESERVE_AREA_AS_ROW_COUNT_TIMES_COLUMN_COUNT",
]);
export const G4B_U07_P05F26_EXCLUDED_RELATIONS=Object.freeze([
  "PERIMETER_PATH_SUM_AS_TARGET_KP",
  "RECTANGLE_SQUARE_PERIMETER_FORMULA_AS_TARGET_KP",
  "COMPOSITE_PERIMETER_AS_TARGET_KP",
  "COMPOSITE_RECTILINEAR_AREA_AS_TARGET_KP",
  "AREA_UNIT_CONVERSION",
  "SAME_PERIMETER_AREA_COMPARISON",
  "EQUAL_AREA_PERIMETER_COMPARISON",
  "APPLICATION_CONTEXT_IMPLEMENTATION",
  "Q027_OR_LATER_SEMANTICS",
]);
const spec=(patternSpecId,relation,diagramMode)=>Object.freeze({patternSpecId,knowledgePointId:G4B_U07_P05F26_KP_ID,patternGroupId:G4B_U07_P05F26_PATTERN_GROUP_ID,patternFamilyId:"RECTANGLE_SQUARE_AREA_FORMULA",relation,diagramMode,questionMode:"diagram",answerDomain:"AREA_SQUARE_CENTIMETER",requiresDiagramRepresentation:true,requiresFormulaEvaluation:true,applicationAllowed:false,perimeterAllowed:false,compositeAreaAllowed:false,areaUnitConversionAllowed:false,areaPerimeterComparisonAllowed:false});
export const G4B_U07_P05F26_PATTERN_SPECS=Object.freeze([
  spec("ps_g4b_u07_rectangle_area_length_width",G4B_U07_P05F26_INCLUDED_RELATIONS[0],"RECTANGLE_DIMENSIONS"),
  spec("ps_g4b_u07_square_area_side_squared",G4B_U07_P05F26_INCLUDED_RELATIONS[1],"SQUARE_DIMENSIONS"),
  spec("ps_g4b_u07_area_row_column_product",G4B_U07_P05F26_INCLUDED_RELATIONS[2],"UNIT_GRID_ROW_COLUMN_PRODUCT"),
]);
export const G4B_U07_P05F26_SPEC_IDS=Object.freeze(G4B_U07_P05F26_PATTERN_SPECS.map(row=>row.patternSpecId));
export const G4B_U07_P05F26_FORMAL_MAPPING=Object.freeze({mappingId:"fm_g4b_u07_rectangle_square_area_formula_p05f26",sourceId:G4B_U07_P05F26_SOURCE_ID,sourcePages:Object.freeze([1]),knowledgePointId:G4B_U07_P05F26_KP_ID,canonicalNameZh:"長方形正方形面積公式",capabilityStatement:"學生能以長乘寬或邊長平方求面積。",reasoningInvariant:"面積等於橫向單位數與縱向單位數的乘積。",relationFamily:"RECTANGLE_SQUARE_AREA_FORMULA",inputRepresentation:"RECTANGLE_OR_SQUARE_DIMENSION_DIAGRAM",answerDomain:"AREA_SQUARE_CENTIMETER",includedRelations:G4B_U07_P05F26_INCLUDED_RELATIONS,excludedRelations:G4B_U07_P05F26_EXCLUDED_RELATIONS,applicationSuitability:"APPLICATION_COMPATIBLE",applicationImplementationAllowed:false,requiredCapabilityIds:G4B_U07_P05F26_REQUIRED_CAPABILITY_IDS,patternSpecIds:G4B_U07_P05F26_SPEC_IDS,r02EvidencePointerPage:3,directVisualEvidencePage:1,evidencePointerMismatchReconciled:true});
export const G4B_U07_P05F26_PATTERN_GROUP=Object.freeze({patternGroupId:G4B_U07_P05F26_PATTERN_GROUP_ID,sourceId:G4B_U07_P05F26_SOURCE_ID,unitCode:G4B_U07_P05F26_UNIT_CODE,unitTitle:G4B_U07_P05F26_UNIT_TITLE,displayName:"長方形正方形面積公式圖形題",primaryKnowledgePointId:G4B_U07_P05F26_KP_ID,knowledgePointIds:Object.freeze([G4B_U07_P05F26_KP_ID]),supportClass:"A",mode:"diagram",publicQuestionMode:"diagram",representationTag:"rectangle_square_area_formula_diagram",representationTags:Object.freeze(["geometry","area","rectangle","square","length_width_product","side_squared","unit_grid"]),patternSpecIds:G4B_U07_P05F26_SPEC_IDS,allocationPolicy:"balanced_area_formula_relation",visibilityStatus:"visible",holdReason:null});
export const G4B_U07_P05F26_SELECTOR_ROW=Object.freeze({knowledgePointId:G4B_U07_P05F26_KP_ID,sourceId:G4B_U07_P05F26_SOURCE_ID,unitCode:G4B_U07_P05F26_UNIT_CODE,unitTitle:G4B_U07_P05F26_UNIT_TITLE,displayName:"長方形正方形面積公式",canonicalNameZh:"長方形正方形面積公式",mode:"diagram",questionMode:"diagram",questionModes:Object.freeze(["diagram"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:"DIAGRAM_ONLY_APPLICATION_COMPATIBLE_CONTEXT_NOT_ADMITTED",canonicalPatternGroupIds:Object.freeze([G4B_U07_P05F26_PATTERN_GROUP_ID]),canonicalPatternSpecIds:G4B_U07_P05F26_SPEC_IDS,patternGroupIds:Object.freeze([G4B_U07_P05F26_PATTERN_GROUP_ID]),patternSpecIds:G4B_U07_P05F26_SPEC_IDS,requiredCapabilityIds:G4B_U07_P05F26_REQUIRED_CAPABILITY_IDS,qaStatusLabel:"P05F26_G4B_U07_SOURCE_BACKED_RECTANGLE_SQUARE_AREA_FORMULA",productionUse:"full_product_w5_slice026_candidate"});
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
export function getG4BU07P05F26SelectorRow(id){return id===G4B_U07_P05F26_KP_ID?clone(G4B_U07_P05F26_SELECTOR_ROW):null;}
export function listG4BU07P05F26PatternGroups(id){return id===G4B_U07_P05F26_KP_ID?[clone(G4B_U07_P05F26_PATTERN_GROUP)]:[];}
export function resolveG4BU07P05F26PatternSpecIds(id){return id===G4B_U07_P05F26_KP_ID?clone(G4B_U07_P05F26_SPEC_IDS):[];}
export function auditG4BU07P05F26Projection(){const errors=[];if(G4B_U07_P05F26_PATTERN_SPECS.length!==3)errors.push("P05F26_PATTERN_CARDINALITY_INVALID");if(new Set(G4B_U07_P05F26_SPEC_IDS).size!==3)errors.push("P05F26_DUPLICATE_SPEC_ID");if(G4B_U07_P05F26_PATTERN_SPECS.some(row=>row.questionMode!=="diagram"||!row.requiresDiagramRepresentation||!row.requiresFormulaEvaluation||row.applicationAllowed||row.perimeterAllowed||row.compositeAreaAllowed||row.areaUnitConversionAllowed||row.areaPerimeterComparisonAllowed))errors.push("P05F26_PATTERN_INVARIANT_INVALID");if(G4B_U07_P05F26_FORMAL_MAPPING.includedRelations.some(relation=>!G4B_U07_P05F26_PATTERN_SPECS.some(row=>row.relation===relation)))errors.push("P05F26_RELATION_MISSING");return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,diagram:3,application:0})});}
