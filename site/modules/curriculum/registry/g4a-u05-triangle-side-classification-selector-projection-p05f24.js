export const P05F24_TASK_ID="P05F_W5DirectProductVerticalSlice024Implementation";
export const G4A_U05_P05F24_SOURCE_ID="g4a_u05_4a05";
export const G4A_U05_P05F24_UNIT_CODE="4A-U05";
export const G4A_U05_P05F24_UNIT_TITLE="三角形與全等";
export const G4A_U05_P05F24_KP_ID="kp_g4a_u05_triangle_side_classification";
export const G4A_U05_P05F24_PATTERN_GROUP_ID="pg_g4a_u05_triangle_side_classification";
export const G4A_U05_P05F24_PRIOR_VISIBLE_KP_IDS=Object.freeze(["kp_g4a_u05_triangle_elements_naming"]);
export const G4A_U05_P05F24_REMAINING_FUTURE_KP_IDS=Object.freeze([
  "kp_g4a_u05_triangle_angle_classification",
  "kp_g4a_u05_triangle_inequality",
  "kp_g4a_u05_congruent_triangle_correspondence",
]);
export const G4A_U05_P05F24_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
]);
export const G4A_U05_P05F24_INCLUDED_RELATIONS=Object.freeze([
  "CLASSIFY_TRIANGLE_BY_EQUAL_SIDE_COUNT",
  "PRESERVE_TRIANGLE_SIDE_CLASSIFICATION_UNDER_ROTATION",
]);
export const G4A_U05_P05F24_EXCLUDED_RELATIONS=Object.freeze([
  "TRIANGLE_ELEMENTS_NAMING_AS_TARGET_KP",
  "CLASSIFY_TRIANGLE_BY_ANGLE_TYPE",
  "APPLY_TRIANGLE_INEQUALITY",
  "MATCH_CONGRUENT_TRIANGLE_CORRESPONDING_SIDES",
  "MATCH_CONGRUENT_TRIANGLE_CORRESPONDING_ANGLES",
  "GEOMETRY_CONSTRUCTION",
  "APPLICATION_CONTEXT_IMPLEMENTATION",
  "Q025_OR_LATER_SEMANTICS",
]);
export const G4A_U05_P05F24_PATTERN_SPECS=Object.freeze([
  Object.freeze({patternSpecId:"ps_g4a_u05_triangle_side_classify_equal_side_count",knowledgePointId:G4A_U05_P05F24_KP_ID,patternGroupId:G4A_U05_P05F24_PATTERN_GROUP_ID,patternFamilyId:"TRIANGLE_SIDE_CLASSIFICATION",relation:G4A_U05_P05F24_INCLUDED_RELATIONS[0],questionMode:"diagram",requiresDiagramRepresentation:true,applicationAllowed:false,angleClassificationAllowed:false,triangleInequalityAllowed:false,congruenceCorrespondenceAllowed:false,constructionAllowed:false}),
  Object.freeze({patternSpecId:"ps_g4a_u05_triangle_side_classify_rotation_invariant",knowledgePointId:G4A_U05_P05F24_KP_ID,patternGroupId:G4A_U05_P05F24_PATTERN_GROUP_ID,patternFamilyId:"TRIANGLE_SIDE_CLASSIFICATION",relation:G4A_U05_P05F24_INCLUDED_RELATIONS[1],questionMode:"diagram",requiresDiagramRepresentation:true,applicationAllowed:false,angleClassificationAllowed:false,triangleInequalityAllowed:false,congruenceCorrespondenceAllowed:false,constructionAllowed:false}),
]);
export const G4A_U05_P05F24_SPEC_IDS=Object.freeze(G4A_U05_P05F24_PATTERN_SPECS.map(row=>row.patternSpecId));
export const G4A_U05_P05F24_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g4a_u05_triangle_side_classification_p05f24",
  sourceId:G4A_U05_P05F24_SOURCE_ID,
  knowledgePointId:G4A_U05_P05F24_KP_ID,
  canonicalNameZh:"依邊長分類三角形",
  capabilityStatement:"學生能依三邊關係分類等邊、等腰與不等邊三角形。",
  reasoningInvariant:"分類由相等邊的數量決定，旋轉不改變類別。",
  relationFamily:"TRIANGLE_SIDE_CLASSIFICATION",
  includedRelations:G4A_U05_P05F24_INCLUDED_RELATIONS,
  excludedRelations:G4A_U05_P05F24_EXCLUDED_RELATIONS,
  questionMode:"diagram",
  applicationImplementationAllowed:false,
  requiredCapabilityIds:G4A_U05_P05F24_REQUIRED_CAPABILITY_IDS,
  patternSpecIds:G4A_U05_P05F24_SPEC_IDS,
});
export const G4A_U05_P05F24_PATTERN_GROUP=Object.freeze({
  patternGroupId:G4A_U05_P05F24_PATTERN_GROUP_ID,
  sourceId:G4A_U05_P05F24_SOURCE_ID,
  unitCode:G4A_U05_P05F24_UNIT_CODE,
  unitTitle:G4A_U05_P05F24_UNIT_TITLE,
  displayName:"依邊長分類三角形",
  primaryKnowledgePointId:G4A_U05_P05F24_KP_ID,
  knowledgePointIds:Object.freeze([G4A_U05_P05F24_KP_ID]),
  supportClass:"A",
  mode:"diagram",
  publicQuestionMode:"diagram",
  representationTag:"triangle_elements_naming_diagram",
  representationTags:Object.freeze(["geometry","triangle","side-length","classification","rotation","diagram"]),
  patternSpecIds:G4A_U05_P05F24_SPEC_IDS,
  allocationPolicy:"balanced_relation",
  visibilityStatus:"visible",
  holdReason:null,
});
export const G4A_U05_P05F24_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G4A_U05_P05F24_KP_ID,
  sourceId:G4A_U05_P05F24_SOURCE_ID,
  unitCode:G4A_U05_P05F24_UNIT_CODE,
  unitTitle:G4A_U05_P05F24_UNIT_TITLE,
  displayName:"依邊長分類三角形",
  canonicalNameZh:"依邊長分類三角形",
  mode:"diagram",
  questionMode:"diagram",
  questionModes:Object.freeze(["diagram"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:"DIAGRAM_ONLY_APPLICATION_NOT_ADMITTED",
  canonicalPatternGroupIds:Object.freeze([G4A_U05_P05F24_PATTERN_GROUP_ID]),
  canonicalPatternSpecIds:G4A_U05_P05F24_SPEC_IDS,
  patternGroupIds:Object.freeze([G4A_U05_P05F24_PATTERN_GROUP_ID]),
  patternSpecIds:G4A_U05_P05F24_SPEC_IDS,
  requiredCapabilityIds:G4A_U05_P05F24_REQUIRED_CAPABILITY_IDS,
  qaStatusLabel:"P05F24_G4A_U05_SOURCE_BACKED_TRIANGLE_SIDE_CLASSIFICATION",
  productionUse:"full_product_w5_slice024_candidate",
});
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
export function getG4AU05P05F24SelectorRow(id){return id===G4A_U05_P05F24_KP_ID?clone(G4A_U05_P05F24_SELECTOR_ROW):null;}
export function listG4AU05P05F24PatternGroups(id){return id===G4A_U05_P05F24_KP_ID?[clone(G4A_U05_P05F24_PATTERN_GROUP)]:[];}
export function resolveG4AU05P05F24PatternSpecIds(id){return id===G4A_U05_P05F24_KP_ID?clone(G4A_U05_P05F24_SPEC_IDS):[];}
export function auditG4AU05P05F24Projection(){const errors=[];if(G4A_U05_P05F24_PATTERN_SPECS.length!==2)errors.push("P05F24_PATTERN_CARDINALITY_INVALID");if(new Set(G4A_U05_P05F24_SPEC_IDS).size!==2)errors.push("P05F24_DUPLICATE_SPEC_ID");if(G4A_U05_P05F24_PATTERN_SPECS.some(row=>row.questionMode!=="diagram"||!row.requiresDiagramRepresentation||row.applicationAllowed||row.angleClassificationAllowed||row.triangleInequalityAllowed||row.congruenceCorrespondenceAllowed||row.constructionAllowed))errors.push("P05F24_PATTERN_INVARIANT_INVALID");if(G4A_U05_P05F24_FORMAL_MAPPING.includedRelations.some(relation=>!G4A_U05_P05F24_PATTERN_SPECS.some(row=>row.relation===relation)))errors.push("P05F24_RELATION_MISSING");return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:2,diagram:2,application:0})});}
