export const P05F33_TASK_ID="P05F_W5DirectProductVerticalSlice033Implementation";
export const G4B_U02_P05F33_SOURCE_ID="g4b_u02_4b02";
export const G4B_U02_P05F33_UNIT_CODE="4B-U02";
export const G4B_U02_P05F33_UNIT_TITLE="垂直平行與四邊形";
export const G4B_U02_P05F33_DISTANCE_KP_ID="kp_g4b_u02_parallel_distance_construction";
export const G4B_U02_P05F33_CLASSIFICATION_KP_ID="kp_g4b_u02_quadrilateral_classification";
export const G4B_U02_P05F33_KP_IDS=Object.freeze([G4B_U02_P05F33_DISTANCE_KP_ID,G4B_U02_P05F33_CLASSIFICATION_KP_ID]);
export const G4B_U02_P05F33_PRIOR_VISIBLE_KP_IDS=Object.freeze(["kp_g4b_u02_parallel_lines_recognition","kp_g4b_u02_perpendicular_lines_recognition"]);
export const G4B_U02_P05F33_PROTECTED_FUTURE_KP_IDS=Object.freeze(["kp_g4b_u02_quadrilateral_inclusion_relation"]);
export const G4B_U02_P05F33_DISTANCE_GROUP_ID="pg_g4b_u02_parallel_distance_construction";
export const G4B_U02_P05F33_CLASSIFICATION_GROUP_ID="pg_g4b_u02_quadrilateral_classification";
export const G4B_U02_P05F33_DISTANCE_REQUIRED_CAPABILITY_IDS=Object.freeze(["cap_geometry_construction","cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_property_reasoning"]);
export const G4B_U02_P05F33_CLASSIFICATION_REQUIRED_CAPABILITY_IDS=Object.freeze(["cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_property_reasoning"]);
export const G4B_U02_P05F33_INCLUDED_RELATIONS=Object.freeze(["MEASURE_PARALLEL_LINE_DISTANCE_BY_PERPENDICULAR_SEGMENT","CONSTRUCT_PARALLEL_LINE_AT_SPECIFIED_PERPENDICULAR_DISTANCE","PRESERVE_CONSTANT_PERPENDICULAR_DISTANCE_BETWEEN_PARALLEL_LINES","CLASSIFY_QUADRILATERAL_BY_PARALLEL_EQUAL_SIDE_AND_RIGHT_ANGLE_PROPERTIES","DISTINGUISH_TRAPEZOID_PARALLELOGRAM_RECTANGLE_RHOMBUS_AND_SQUARE"]);
const distanceSpec=(id,relation,diagramMode,answerDomain)=>Object.freeze({patternSpecId:id,knowledgePointId:G4B_U02_P05F33_DISTANCE_KP_ID,patternGroupId:G4B_U02_P05F33_DISTANCE_GROUP_ID,patternFamilyId:"PARALLEL_DISTANCE_AND_CONSTRUCTION",relation,diagramMode,questionMode:"diagram",answerDomain,requiresDiagramRepresentation:true,requiresGeometryConstruction:true,applicationAllowed:false,quadrilateralClassificationAllowed:false,quadrilateralInclusionAllowed:false});
const classSpec=(id,shapeType)=>Object.freeze({patternSpecId:id,knowledgePointId:G4B_U02_P05F33_CLASSIFICATION_KP_ID,patternGroupId:G4B_U02_P05F33_CLASSIFICATION_GROUP_ID,patternFamilyId:"QUADRILATERAL_PROPERTY_CLASSIFICATION",relation:"CLASSIFY_QUADRILATERAL_BY_PARALLEL_EQUAL_SIDE_AND_RIGHT_ANGLE_PROPERTIES",shapeType,questionMode:"diagram",answerDomain:"QUADRILATERAL_CLASS_ZH",requiresDiagramRepresentation:true,requiresGeometryConstruction:false,applicationAllowed:false,quadrilateralInclusionAllowed:false});
export const G4B_U02_P05F33_DISTANCE_PATTERN_SPECS=Object.freeze([
 distanceSpec("ps_g4b_u02_parallel_distance_measure","MEASURE_PARALLEL_LINE_DISTANCE_BY_PERPENDICULAR_SEGMENT","MEASURE_DISTANCE","DISTANCE_CM"),
 distanceSpec("ps_g4b_u02_parallel_distance_construct_check","CONSTRUCT_PARALLEL_LINE_AT_SPECIFIED_PERPENDICULAR_DISTANCE","CONSTRUCTION_CHECK","CONSTRUCTION_VALIDITY_ZH"),
 distanceSpec("ps_g4b_u02_parallel_distance_invariant","PRESERVE_CONSTANT_PERPENDICULAR_DISTANCE_BETWEEN_PARALLEL_LINES","CONSTANT_DISTANCE","DISTANCE_CM")
]);
export const G4B_U02_P05F33_CLASSIFICATION_PATTERN_SPECS=Object.freeze([
 classSpec("ps_g4b_u02_classify_trapezoid","TRAPEZOID"),
 classSpec("ps_g4b_u02_classify_parallelogram","PARALLELOGRAM"),
 classSpec("ps_g4b_u02_classify_rectangle","RECTANGLE"),
 classSpec("ps_g4b_u02_classify_rhombus","RHOMBUS"),
 classSpec("ps_g4b_u02_classify_square","SQUARE")
]);
export const G4B_U02_P05F33_PATTERN_SPECS=Object.freeze([...G4B_U02_P05F33_DISTANCE_PATTERN_SPECS,...G4B_U02_P05F33_CLASSIFICATION_PATTERN_SPECS]);
export const G4B_U02_P05F33_DISTANCE_SPEC_IDS=Object.freeze(G4B_U02_P05F33_DISTANCE_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G4B_U02_P05F33_CLASSIFICATION_SPEC_IDS=Object.freeze(G4B_U02_P05F33_CLASSIFICATION_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G4B_U02_P05F33_SPEC_IDS=Object.freeze(G4B_U02_P05F33_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G4B_U02_P05F33_FORMAL_MAPPINGS=Object.freeze([
 Object.freeze({mappingId:"fm_g4b_u02_parallel_distance_construction_p05f33",sourceId:G4B_U02_P05F33_SOURCE_ID,sourcePages:Object.freeze([1,2]),knowledgePointId:G4B_U02_P05F33_DISTANCE_KP_ID,canonicalNameZh:"平行線距離與作圖",capabilityStatement:"學生能量測或畫出指定距離的平行線。",reasoningInvariant:"兩平行線間的垂直距離處處相等。",includedRelations:Object.freeze(G4B_U02_P05F33_INCLUDED_RELATIONS.slice(0,3)),excludedRelations:Object.freeze(["PARALLEL_LINE_RECOGNITION_AS_TARGET_KP","PERPENDICULAR_LINE_RECOGNITION_AS_TARGET_KP","QUADRILATERAL_CLASSIFICATION","QUADRILATERAL_INCLUSION_RELATION","NUMERIC_ANGLE_MEASUREMENT","APPLICATION_CONTEXT_IMPLEMENTATION"]),applicationSuitability:"APPLICATION_COMPATIBLE",applicationImplementationAllowed:false,requiredCapabilityIds:G4B_U02_P05F33_DISTANCE_REQUIRED_CAPABILITY_IDS,patternSpecIds:G4B_U02_P05F33_DISTANCE_SPEC_IDS}),
 Object.freeze({mappingId:"fm_g4b_u02_quadrilateral_classification_p05f33",sourceId:G4B_U02_P05F33_SOURCE_ID,sourcePages:Object.freeze([1,2]),knowledgePointId:G4B_U02_P05F33_CLASSIFICATION_KP_ID,canonicalNameZh:"四邊形分類",capabilityStatement:"學生能依邊與角性質分類梯形、平行四邊形、長方形、菱形與正方形。",reasoningInvariant:"分類必須同時檢查平行邊、等長邊與直角條件。",includedRelations:Object.freeze(G4B_U02_P05F33_INCLUDED_RELATIONS.slice(3)),excludedRelations:Object.freeze(["PARALLEL_LINE_RECOGNITION_AS_TARGET_KP","PERPENDICULAR_LINE_RECOGNITION_AS_TARGET_KP","PARALLEL_DISTANCE_CONSTRUCTION_AS_TARGET_KP","QUADRILATERAL_INCLUSION_RELATION","AREA_OR_PERIMETER_FORMULA","APPLICATION_CONTEXT_IMPLEMENTATION"]),applicationSuitability:"APPLICATION_COMPATIBLE",applicationImplementationAllowed:false,requiredCapabilityIds:G4B_U02_P05F33_CLASSIFICATION_REQUIRED_CAPABILITY_IDS,patternSpecIds:G4B_U02_P05F33_CLASSIFICATION_SPEC_IDS})
]);
export const G4B_U02_P05F33_PATTERN_GROUPS=Object.freeze([
 Object.freeze({patternGroupId:G4B_U02_P05F33_DISTANCE_GROUP_ID,sourceId:G4B_U02_P05F33_SOURCE_ID,unitCode:G4B_U02_P05F33_UNIT_CODE,unitTitle:G4B_U02_P05F33_UNIT_TITLE,displayName:"平行線距離與作圖",primaryKnowledgePointId:G4B_U02_P05F33_DISTANCE_KP_ID,knowledgePointIds:Object.freeze([G4B_U02_P05F33_DISTANCE_KP_ID]),supportClass:"A",mode:"diagram",publicQuestionMode:"diagram",representationTag:"parallel_distance_construction_diagram",patternSpecIds:G4B_U02_P05F33_DISTANCE_SPEC_IDS,allocationPolicy:"balanced_parallel_distance_relation",visibilityStatus:"visible",holdReason:null}),
 Object.freeze({patternGroupId:G4B_U02_P05F33_CLASSIFICATION_GROUP_ID,sourceId:G4B_U02_P05F33_SOURCE_ID,unitCode:G4B_U02_P05F33_UNIT_CODE,unitTitle:G4B_U02_P05F33_UNIT_TITLE,displayName:"四邊形分類",primaryKnowledgePointId:G4B_U02_P05F33_CLASSIFICATION_KP_ID,knowledgePointIds:Object.freeze([G4B_U02_P05F33_CLASSIFICATION_KP_ID]),supportClass:"A",mode:"diagram",publicQuestionMode:"diagram",representationTag:"quadrilateral_classification_diagram",patternSpecIds:G4B_U02_P05F33_CLASSIFICATION_SPEC_IDS,allocationPolicy:"balanced_quadrilateral_class",visibilityStatus:"visible",holdReason:null})
]);
const selector=(knowledgePointId,displayName,groupId,specIds,requiredCapabilityIds,qa)=>Object.freeze({knowledgePointId,sourceId:G4B_U02_P05F33_SOURCE_ID,unitCode:G4B_U02_P05F33_UNIT_CODE,unitTitle:G4B_U02_P05F33_UNIT_TITLE,displayName,canonicalNameZh:displayName,mode:"diagram",questionMode:"diagram",questionModes:Object.freeze(["diagram"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:"DIAGRAM_ONLY_APPLICATION_COMPATIBLE_CONTEXT_NOT_ADMITTED",canonicalPatternGroupIds:Object.freeze([groupId]),canonicalPatternSpecIds:specIds,patternGroupIds:Object.freeze([groupId]),patternSpecIds:specIds,requiredCapabilityIds,qaStatusLabel:qa,productionUse:"full_product_w5_slice033_candidate"});
export const G4B_U02_P05F33_SELECTOR_ROWS=Object.freeze([
 selector(G4B_U02_P05F33_DISTANCE_KP_ID,"平行線距離與作圖",G4B_U02_P05F33_DISTANCE_GROUP_ID,G4B_U02_P05F33_DISTANCE_SPEC_IDS,G4B_U02_P05F33_DISTANCE_REQUIRED_CAPABILITY_IDS,"P05F33_G4B_U02_PARALLEL_DISTANCE_CONSTRUCTION"),
 selector(G4B_U02_P05F33_CLASSIFICATION_KP_ID,"四邊形分類",G4B_U02_P05F33_CLASSIFICATION_GROUP_ID,G4B_U02_P05F33_CLASSIFICATION_SPEC_IDS,G4B_U02_P05F33_CLASSIFICATION_REQUIRED_CAPABILITY_IDS,"P05F33_G4B_U02_QUADRILATERAL_CLASSIFICATION")
]);
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export function getG4BU02P05F33SelectorRow(id){return clone(G4B_U02_P05F33_SELECTOR_ROWS.find(x=>x.knowledgePointId===id)??null);}
export function listG4BU02P05F33PatternGroups(id){return clone(G4B_U02_P05F33_PATTERN_GROUPS.filter(x=>x.primaryKnowledgePointId===id));}
export function resolveG4BU02P05F33PatternSpecIds(id){if(id===G4B_U02_P05F33_DISTANCE_KP_ID)return clone(G4B_U02_P05F33_DISTANCE_SPEC_IDS);if(id===G4B_U02_P05F33_CLASSIFICATION_KP_ID)return clone(G4B_U02_P05F33_CLASSIFICATION_SPEC_IDS);return[];}
export function auditG4BU02P05F33Projection(){const errors=[];if(G4B_U02_P05F33_SELECTOR_ROWS.length!==2||G4B_U02_P05F33_PATTERN_GROUPS.length!==2||G4B_U02_P05F33_PATTERN_SPECS.length!==8)errors.push("P05F33_CARDINALITY_INVALID");if(new Set(G4B_U02_P05F33_SPEC_IDS).size!==8)errors.push("P05F33_DUPLICATE_SPEC_ID");if(G4B_U02_P05F33_DISTANCE_PATTERN_SPECS.some(x=>!x.requiresGeometryConstruction||x.quadrilateralClassificationAllowed||x.quadrilateralInclusionAllowed))errors.push("P05F33_DISTANCE_PATTERN_INVALID");if(G4B_U02_P05F33_CLASSIFICATION_PATTERN_SPECS.some(x=>x.requiresGeometryConstruction||x.quadrilateralInclusionAllowed))errors.push("P05F33_CLASSIFICATION_PATTERN_INVALID");return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:2,patternGroups:2,patternSpecs:8,distanceSpecs:3,classificationSpecs:5})});}
