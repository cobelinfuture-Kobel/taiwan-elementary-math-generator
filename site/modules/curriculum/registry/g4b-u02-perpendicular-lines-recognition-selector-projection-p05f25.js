export const P05F25_TASK_ID="P05F_W5DirectProductVerticalSlice025Implementation";
export const G4B_U02_P05F25_SOURCE_ID="g4b_u02_4b02";
export const G4B_U02_P05F25_UNIT_CODE="4B-U02";
export const G4B_U02_P05F25_UNIT_TITLE="垂直平行與四邊形";
export const G4B_U02_P05F25_KP_ID="kp_g4b_u02_perpendicular_lines_recognition";
export const G4B_U02_P05F25_PATTERN_GROUP_ID="pg_g4b_u02_perpendicular_lines_recognition";
export const G4B_U02_P05F25_PRIOR_VISIBLE_KP_IDS=Object.freeze(["kp_g4b_u02_parallel_lines_recognition"]);
export const G4B_U02_P05F25_REMAINING_FUTURE_KP_IDS=Object.freeze([
  "kp_g4b_u02_parallel_distance_construction",
  "kp_g4b_u02_quadrilateral_classification",
  "kp_g4b_u02_quadrilateral_inclusion_relation",
]);
export const G4B_U02_P05F25_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
]);
export const G4B_U02_P05F25_INCLUDED_RELATIONS=Object.freeze([
  "RECOGNIZE_INTERSECTING_LINES_FORMING_A_RIGHT_ANGLE_AS_PERPENDICULAR",
  "USE_90_DEGREE_INTERSECTION_AS_PERPENDICULARITY_INVARIANT",
  "PRESERVE_PERPENDICULAR_CLASSIFICATION_INDEPENDENT_OF_SEGMENT_LENGTH",
]);
export const G4B_U02_P05F25_EXCLUDED_RELATIONS=Object.freeze([
  "PARALLEL_LINES_RECOGNITION_AS_TARGET_KP",
  "PARALLEL_DISTANCE_MEASUREMENT",
  "PARALLEL_LINE_CONSTRUCTION",
  "QUADRILATERAL_CLASSIFICATION",
  "QUADRILATERAL_INCLUSION_RELATION",
  "NUMERIC_ANGLE_MEASUREMENT",
  "GEOMETRY_CONSTRUCTION",
  "APPLICATION_CONTEXT_IMPLEMENTATION",
  "Q026_OR_LATER_SEMANTICS",
]);
const spec=(patternSpecId,relation,diagramMode,answerDomain)=>Object.freeze({patternSpecId,knowledgePointId:G4B_U02_P05F25_KP_ID,patternGroupId:G4B_U02_P05F25_PATTERN_GROUP_ID,patternFamilyId:"PERPENDICULAR_LINE_RECOGNITION",relation,diagramMode,questionMode:"diagram",answerDomain,requiresDiagramRepresentation:true,applicationAllowed:false,parallelLineTargetAllowed:false,parallelDistanceMeasurementAllowed:false,parallelLineConstructionAllowed:false,quadrilateralReasoningAllowed:false,numericAngleMeasurementAllowed:false,constructionAllowed:false});
export const G4B_U02_P05F25_PATTERN_SPECS=Object.freeze([
  spec("ps_g4b_u02_perpendicular_right_angle_intersection",G4B_U02_P05F25_INCLUDED_RELATIONS[0],"RIGHT_ANGLE_INTERSECTION","PERPENDICULAR_RELATION_ZH"),
  spec("ps_g4b_u02_perpendicular_90_degree_invariant",G4B_U02_P05F25_INCLUDED_RELATIONS[1],"NINETY_DEGREE_INVARIANT","PERPENDICULAR_CRITERION_ZH"),
  spec("ps_g4b_u02_perpendicular_segment_length_invariant",G4B_U02_P05F25_INCLUDED_RELATIONS[2],"SEGMENT_LENGTH_INVARIANT","PERPENDICULAR_INVARIANCE_ZH"),
]);
export const G4B_U02_P05F25_SPEC_IDS=Object.freeze(G4B_U02_P05F25_PATTERN_SPECS.map(row=>row.patternSpecId));
export const G4B_U02_P05F25_FORMAL_MAPPING=Object.freeze({mappingId:"fm_g4b_u02_perpendicular_lines_recognition_p05f25",sourceId:G4B_U02_P05F25_SOURCE_ID,sourcePages:Object.freeze([1,2]),knowledgePointId:G4B_U02_P05F25_KP_ID,canonicalNameZh:"垂直線辨識",capabilityStatement:"學生能辨認相交成直角的兩條直線。",reasoningInvariant:"垂直關係由交角為90度決定，與線段長度無關。",relationFamily:"PERPENDICULAR_LINE_RECOGNITION",inputRepresentation:"PAIR_OF_INTERSECTING_LINES_DIAGRAM",answerDomain:Object.freeze(["垂直","是，互相垂直","不變，仍然垂直"]),includedRelations:G4B_U02_P05F25_INCLUDED_RELATIONS,excludedRelations:G4B_U02_P05F25_EXCLUDED_RELATIONS,applicationSuitability:"APPLICATION_COMPATIBLE",applicationImplementationAllowed:false,requiredCapabilityIds:G4B_U02_P05F25_REQUIRED_CAPABILITY_IDS,patternSpecIds:G4B_U02_P05F25_SPEC_IDS});
export const G4B_U02_P05F25_PATTERN_GROUP=Object.freeze({patternGroupId:G4B_U02_P05F25_PATTERN_GROUP_ID,sourceId:G4B_U02_P05F25_SOURCE_ID,unitCode:G4B_U02_P05F25_UNIT_CODE,unitTitle:G4B_U02_P05F25_UNIT_TITLE,displayName:"垂直線辨識圖形題",primaryKnowledgePointId:G4B_U02_P05F25_KP_ID,knowledgePointIds:Object.freeze([G4B_U02_P05F25_KP_ID]),supportClass:"A",mode:"diagram",publicQuestionMode:"diagram",representationTag:"perpendicular_lines_recognition_diagram",representationTags:Object.freeze(["geometry","perpendicular_lines","right_angle","intersection","segment_length_invariant","diagram_identification"]),patternSpecIds:G4B_U02_P05F25_SPEC_IDS,allocationPolicy:"balanced_perpendicular_relation",visibilityStatus:"visible",holdReason:null});
export const G4B_U02_P05F25_SELECTOR_ROW=Object.freeze({knowledgePointId:G4B_U02_P05F25_KP_ID,sourceId:G4B_U02_P05F25_SOURCE_ID,unitCode:G4B_U02_P05F25_UNIT_CODE,unitTitle:G4B_U02_P05F25_UNIT_TITLE,displayName:"垂直線辨識",canonicalNameZh:"垂直線辨識",mode:"diagram",questionMode:"diagram",questionModes:Object.freeze(["diagram"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:"DIAGRAM_ONLY_APPLICATION_COMPATIBLE_CONTEXT_NOT_ADMITTED",canonicalPatternGroupIds:Object.freeze([G4B_U02_P05F25_PATTERN_GROUP_ID]),canonicalPatternSpecIds:G4B_U02_P05F25_SPEC_IDS,patternGroupIds:Object.freeze([G4B_U02_P05F25_PATTERN_GROUP_ID]),patternSpecIds:G4B_U02_P05F25_SPEC_IDS,requiredCapabilityIds:G4B_U02_P05F25_REQUIRED_CAPABILITY_IDS,qaStatusLabel:"P05F25_G4B_U02_SOURCE_BACKED_PERPENDICULAR_RECOGNITION",productionUse:"full_product_w5_slice025_candidate"});
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
export function getG4BU02P05F25SelectorRow(id){return id===G4B_U02_P05F25_KP_ID?clone(G4B_U02_P05F25_SELECTOR_ROW):null;}
export function listG4BU02P05F25PatternGroups(id){return id===G4B_U02_P05F25_KP_ID?[clone(G4B_U02_P05F25_PATTERN_GROUP)]:[];}
export function resolveG4BU02P05F25PatternSpecIds(id){return id===G4B_U02_P05F25_KP_ID?clone(G4B_U02_P05F25_SPEC_IDS):[];}
export function auditG4BU02P05F25Projection(){const errors=[];if(G4B_U02_P05F25_PATTERN_SPECS.length!==3)errors.push("P05F25_PATTERN_CARDINALITY_INVALID");if(new Set(G4B_U02_P05F25_SPEC_IDS).size!==3)errors.push("P05F25_DUPLICATE_SPEC_ID");if(G4B_U02_P05F25_PATTERN_SPECS.some(row=>row.questionMode!=="diagram"||!row.requiresDiagramRepresentation||row.applicationAllowed||row.parallelLineTargetAllowed||row.parallelDistanceMeasurementAllowed||row.parallelLineConstructionAllowed||row.quadrilateralReasoningAllowed||row.numericAngleMeasurementAllowed||row.constructionAllowed))errors.push("P05F25_PATTERN_INVARIANT_INVALID");if(G4B_U02_P05F25_FORMAL_MAPPING.includedRelations.some(relation=>!G4B_U02_P05F25_PATTERN_SPECS.some(row=>row.relation===relation)))errors.push("P05F25_RELATION_MISSING");return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,diagram:3,application:0})});}
