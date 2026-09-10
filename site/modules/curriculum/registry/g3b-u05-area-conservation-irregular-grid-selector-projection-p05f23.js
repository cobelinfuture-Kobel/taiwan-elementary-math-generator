export const P05F23_TASK_ID="P05F_W5DirectProductVerticalSlice023Implementation";
export const G3B_U05_P05F23_SOURCE_ID="g3b_u05_3b05";
export const G3B_U05_P05F23_UNIT_CODE="3B-U05";
export const G3B_U05_P05F23_UNIT_TITLE="面積與平方公分";
export const G3B_U05_P05F23_KP_IDS=Object.freeze([
  "kp_area_conservation_cut_rearrange",
  "kp_irregular_grid_area",
]);
export const G3B_U05_P05F23_PRIOR_VISIBLE_KP_IDS=Object.freeze([
  "kp_area_square_centimeter_unit",
  "kp_area_grid_counting",
]);
export const G3B_U05_P05F23_REMAINING_FUTURE_KP_IDS=Object.freeze([
  "kp_area_compare_same_perimeter",
]);
export const G3B_U05_P05F23_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_formula_evaluation",
  "cap_geometry_property_reasoning",
]);
export const G3B_U05_P05F23_GROUP_IDS=Object.freeze([
  "pg_g3b_u05_area_conservation_cut_rearrange",
  "pg_g3b_u05_irregular_grid_area",
]);
const KP_CONSERVATION=G3B_U05_P05F23_KP_IDS[0],KP_IRREGULAR=G3B_U05_P05F23_KP_IDS[1];
const GROUP_CONSERVATION=G3B_U05_P05F23_GROUP_IDS[0],GROUP_IRREGULAR=G3B_U05_P05F23_GROUP_IDS[1];
export const G3B_U05_P05F23_PATTERN_SPECS=Object.freeze([
  Object.freeze({patternSpecId:"ps_g3b_u05_area_conservation_cut_translate",knowledgePointId:KP_CONSERVATION,patternGroupId:GROUP_CONSERVATION,patternFamilyId:"AREA_CONSERVATION",relation:"PRESERVE_AREA_UNDER_CUT_TRANSLATE_OR_REARRANGE_WITHOUT_ADD_OVERLAP_OR_LOSS",transformationMode:"CUT_TRANSLATE",questionMode:"diagram",diagramKind:"area_grid_counting_diagram",requiresGeometryDiagramRepresentation:true,requiresGeometryDomainValidator:true,requiresGeometryFormulaEvaluation:true,requiresGeometryPropertyReasoning:true,applicationAllowed:false}),
  Object.freeze({patternSpecId:"ps_g3b_u05_area_conservation_rearrange",knowledgePointId:KP_CONSERVATION,patternGroupId:GROUP_CONSERVATION,patternFamilyId:"AREA_CONSERVATION",relation:"PRESERVE_AREA_UNDER_CUT_TRANSLATE_OR_REARRANGE_WITHOUT_ADD_OVERLAP_OR_LOSS",transformationMode:"CUT_REARRANGE",questionMode:"diagram",diagramKind:"area_grid_counting_diagram",requiresGeometryDiagramRepresentation:true,requiresGeometryDomainValidator:true,requiresGeometryFormulaEvaluation:true,requiresGeometryPropertyReasoning:true,applicationAllowed:false}),
  Object.freeze({patternSpecId:"ps_g3b_u05_irregular_grid_decompose",knowledgePointId:KP_IRREGULAR,patternGroupId:GROUP_IRREGULAR,patternFamilyId:"IRREGULAR_GRID_AREA",relation:"COMPUTE_IRREGULAR_GRID_AREA_BY_DECOMPOSITION_INTO_COUNTABLE_PARTS",solutionMode:"DECOMPOSE",questionMode:"diagram",diagramKind:"area_grid_counting_diagram",requiresGeometryDiagramRepresentation:true,requiresGeometryDomainValidator:true,requiresGeometryFormulaEvaluation:true,requiresGeometryPropertyReasoning:true,applicationAllowed:false}),
  Object.freeze({patternSpecId:"ps_g3b_u05_irregular_grid_complete",knowledgePointId:KP_IRREGULAR,patternGroupId:GROUP_IRREGULAR,patternFamilyId:"IRREGULAR_GRID_AREA",relation:"COMPUTE_IRREGULAR_GRID_AREA_BY_COMPLETION_TO_A_KNOWN_TOTAL",solutionMode:"COMPLETE",questionMode:"diagram",diagramKind:"area_grid_counting_diagram",requiresGeometryDiagramRepresentation:true,requiresGeometryDomainValidator:true,requiresGeometryFormulaEvaluation:true,requiresGeometryPropertyReasoning:true,applicationAllowed:false}),
  Object.freeze({patternSpecId:"ps_g3b_u05_irregular_grid_partial_cells",knowledgePointId:KP_IRREGULAR,patternGroupId:GROUP_IRREGULAR,patternFamilyId:"IRREGULAR_GRID_AREA",relation:"COMBINE_PARTIAL_GRID_CELLS_BY_ACTUAL_PROPORTION",solutionMode:"PARTIAL_CELLS",questionMode:"diagram",diagramKind:"area_grid_counting_diagram",requiresGeometryDiagramRepresentation:true,requiresGeometryDomainValidator:true,requiresGeometryFormulaEvaluation:true,requiresGeometryPropertyReasoning:true,applicationAllowed:false}),
]);
export const G3B_U05_P05F23_SPEC_IDS=Object.freeze(G3B_U05_P05F23_PATTERN_SPECS.map(row=>row.patternSpecId));
const specsFor=id=>G3B_U05_P05F23_PATTERN_SPECS.filter(row=>row.knowledgePointId===id);
export const G3B_U05_P05F23_FORMAL_MAPPINGS=Object.freeze([
  Object.freeze({mappingId:"fm_g3b_u05_area_conservation_cut_rearrange_p05f23",sourceId:G3B_U05_P05F23_SOURCE_ID,sourcePages:Object.freeze([1]),knowledgePointId:KP_CONSERVATION,canonicalNameZh:"剪拼與面積守恆",capabilityStatement:"學生能利用切割、平移或重組判斷面積不變。",reasoningInvariant:"只要沒有增減、重疊或遺失區塊，重新排列前後面積相等。",relationFamily:"AREA_CONSERVATION",includedRelations:Object.freeze(["PRESERVE_AREA_UNDER_CUT_TRANSLATE_OR_REARRANGE_WITHOUT_ADD_OVERLAP_OR_LOSS"]),excludedRelations:Object.freeze(["SQUARE_CENTIMETER_UNIT_IDENTITY_AS_TARGET_KP","BASIC_GRID_COUNTING_AS_TARGET_KP","COMPARE_AREA_UNDER_SAME_PERIMETER","RECTANGLE_AREA_FORMULA","SQUARE_AREA_FORMULA","PERIMETER_COMPUTATION","REAL_WORLD_AREA_ESTIMATION","APPLICATION_CONTEXT_IMPLEMENTATION","Q024_OR_LATER_SEMANTICS"]),requiredCapabilityIds:G3B_U05_P05F23_REQUIRED_CAPABILITY_IDS,patternSpecIds:Object.freeze(specsFor(KP_CONSERVATION).map(row=>row.patternSpecId)),applicationImplementationAllowed:false}),
  Object.freeze({mappingId:"fm_g3b_u05_irregular_grid_area_p05f23",sourceId:G3B_U05_P05F23_SOURCE_ID,sourcePages:Object.freeze([1]),knowledgePointId:KP_IRREGULAR,canonicalNameZh:"不規則方格圖形面積",capabilityStatement:"學生能分割或補合不規則方格圖形以求面積。",reasoningInvariant:"不規則圖形可分解為可計數區塊，部分方格需按實際比例合併。",relationFamily:"IRREGULAR_GRID_AREA",includedRelations:Object.freeze(["COMPUTE_IRREGULAR_GRID_AREA_BY_DECOMPOSITION_INTO_COUNTABLE_PARTS","COMPUTE_IRREGULAR_GRID_AREA_BY_COMPLETION_TO_A_KNOWN_TOTAL","COMBINE_PARTIAL_GRID_CELLS_BY_ACTUAL_PROPORTION"]),excludedRelations:Object.freeze(["SQUARE_CENTIMETER_UNIT_IDENTITY_AS_TARGET_KP","BASIC_GRID_COUNTING_AS_TARGET_KP","COMPARE_AREA_UNDER_SAME_PERIMETER","RECTANGLE_AREA_FORMULA","SQUARE_AREA_FORMULA","PERIMETER_COMPUTATION","REAL_WORLD_AREA_ESTIMATION","APPLICATION_CONTEXT_IMPLEMENTATION","Q024_OR_LATER_SEMANTICS"]),requiredCapabilityIds:G3B_U05_P05F23_REQUIRED_CAPABILITY_IDS,patternSpecIds:Object.freeze(specsFor(KP_IRREGULAR).map(row=>row.patternSpecId)),applicationImplementationAllowed:false}),
]);
export const G3B_U05_P05F23_PATTERN_GROUPS=Object.freeze([
  Object.freeze({patternGroupId:GROUP_CONSERVATION,sourceId:G3B_U05_P05F23_SOURCE_ID,unitCode:G3B_U05_P05F23_UNIT_CODE,unitTitle:G3B_U05_P05F23_UNIT_TITLE,displayName:"剪拼與面積守恆",primaryKnowledgePointId:KP_CONSERVATION,knowledgePointIds:Object.freeze([KP_CONSERVATION]),supportClass:"A",mode:"diagram",publicQuestionMode:"diagram",representationTag:"area_grid_counting_diagram",representationTags:Object.freeze(["geometry","area","conservation","cut_rearrange","diagram"]),patternSpecIds:Object.freeze(specsFor(KP_CONSERVATION).map(row=>row.patternSpecId)),allocationPolicy:"balanced_conservation_transform",visibilityStatus:"visible",holdReason:null}),
  Object.freeze({patternGroupId:GROUP_IRREGULAR,sourceId:G3B_U05_P05F23_SOURCE_ID,unitCode:G3B_U05_P05F23_UNIT_CODE,unitTitle:G3B_U05_P05F23_UNIT_TITLE,displayName:"不規則方格圖形面積",primaryKnowledgePointId:KP_IRREGULAR,knowledgePointIds:Object.freeze([KP_IRREGULAR]),supportClass:"A",mode:"diagram",publicQuestionMode:"diagram",representationTag:"area_grid_counting_diagram",representationTags:Object.freeze(["geometry","area","irregular_grid","decomposition","completion","partial_cells"]),patternSpecIds:Object.freeze(specsFor(KP_IRREGULAR).map(row=>row.patternSpecId)),allocationPolicy:"balanced_irregular_area_strategy",visibilityStatus:"visible",holdReason:null}),
]);
const selectorRow=(knowledgePointId,displayName,groupId)=>Object.freeze({knowledgePointId,sourceId:G3B_U05_P05F23_SOURCE_ID,unitCode:G3B_U05_P05F23_UNIT_CODE,unitTitle:G3B_U05_P05F23_UNIT_TITLE,displayName,canonicalNameZh:displayName,mode:"diagram",questionMode:"diagram",questionModes:Object.freeze(["diagram"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:"DIAGRAM_ONLY_APPLICATION_COMPATIBLE_CONTEXT_NOT_ADMITTED",canonicalPatternGroupIds:Object.freeze([groupId]),canonicalPatternSpecIds:Object.freeze(specsFor(knowledgePointId).map(row=>row.patternSpecId)),patternGroupIds:Object.freeze([groupId]),patternSpecIds:Object.freeze(specsFor(knowledgePointId).map(row=>row.patternSpecId)),requiredCapabilityIds:G3B_U05_P05F23_REQUIRED_CAPABILITY_IDS,qaStatusLabel:"P05F23_G3B_U05_SOURCE_BACKED_AREA_REASONING",productionUse:"full_product_w5_slice023_candidate"});
export const G3B_U05_P05F23_SELECTOR_ROWS=Object.freeze([selectorRow(KP_CONSERVATION,"剪拼與面積守恆",GROUP_CONSERVATION),selectorRow(KP_IRREGULAR,"不規則方格圖形面積",GROUP_IRREGULAR)]);
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
export function getG3BU05P05F23SelectorRow(id){return clone(G3B_U05_P05F23_SELECTOR_ROWS.find(row=>row.knowledgePointId===id)??null);}
export function listG3BU05P05F23PatternGroups(id){return clone(G3B_U05_P05F23_PATTERN_GROUPS.filter(group=>group.primaryKnowledgePointId===id));}
export function resolveG3BU05P05F23PatternSpecIds(id){return clone(specsFor(id).map(spec=>spec.patternSpecId));}
export function auditG3BU05P05F23Projection(){const errors=[];if(G3B_U05_P05F23_SELECTOR_ROWS.length!==2||G3B_U05_P05F23_PATTERN_GROUPS.length!==2||G3B_U05_P05F23_PATTERN_SPECS.length!==5||G3B_U05_P05F23_FORMAL_MAPPINGS.length!==2)errors.push("P05F23_CARDINALITY_INVALID");if(new Set(G3B_U05_P05F23_SPEC_IDS).size!==5)errors.push("P05F23_PATTERN_ID_DUPLICATE");if(G3B_U05_P05F23_PATTERN_SPECS.some(row=>row.questionMode!=="diagram"||row.diagramKind!=="area_grid_counting_diagram"||row.requiresGeometryDiagramRepresentation!==true||row.requiresGeometryDomainValidator!==true||row.requiresGeometryFormulaEvaluation!==true||row.requiresGeometryPropertyReasoning!==true||row.applicationAllowed!==false))errors.push("P05F23_PATTERN_INVARIANT_INVALID");return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:2,patternGroups:2,patternSpecs:5,diagram:5,application:0})});}
