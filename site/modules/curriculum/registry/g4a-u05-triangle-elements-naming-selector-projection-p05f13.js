export const P05F13_TASK_ID="P05F_W5DirectProductVerticalSlice013Implementation";
export const G4A_U05_P05F13_SOURCE_ID="g4a_u05_4a05";
export const G4A_U05_P05F13_UNIT_CODE="4A-U05";
export const G4A_U05_P05F13_UNIT_TITLE="三角形與全等";
export const G4A_U05_P05F13_KP_ID="kp_g4a_u05_triangle_elements_naming";
export const G4A_U05_P05F13_PATTERN_GROUP_ID="pg_g4a_u05_triangle_elements_naming";
export const G4A_U05_P05F13_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
]);
export const G4A_U05_P05F13_INCLUDED_RELATIONS=Object.freeze([
  "IDENTIFY_TRIANGLE_SIDES",
  "IDENTIFY_TRIANGLE_ANGLES",
  "IDENTIFY_TRIANGLE_VERTICES",
  "NAME_TRIANGLE_ELEMENTS_CONSISTENTLY",
  "PRESERVE_CLOSED_THREE_SEGMENT_TRIANGLE_STRUCTURE",
]);
export const G4A_U05_P05F13_EXCLUDED_RELATIONS=Object.freeze([
  "CLASSIFY_TRIANGLE_BY_EQUAL_SIDE_COUNT",
  "CLASSIFY_TRIANGLE_BY_ANGLE_TYPE",
  "APPLY_TRIANGLE_INEQUALITY",
  "MATCH_CONGRUENT_TRIANGLE_CORRESPONDING_SIDES",
  "MATCH_CONGRUENT_TRIANGLE_CORRESPONDING_ANGLES",
  "GEOMETRY_CONSTRUCTION",
  "APPLICATION_CONTEXT",
]);
export const G4A_U05_P05F13_FUTURE_KP_IDS=Object.freeze([
  "kp_g4a_u05_triangle_side_classification",
  "kp_g4a_u05_triangle_angle_classification",
  "kp_g4a_u05_triangle_inequality",
  "kp_g4a_u05_congruent_triangle_correspondence",
]);
const slug=relation=>relation.toLowerCase();
export const G4A_U05_P05F13_PATTERN_SPECS=Object.freeze(G4A_U05_P05F13_INCLUDED_RELATIONS.map(relation=>Object.freeze({
  patternSpecId:`ps_g4a_u05_${slug(relation)}`,
  knowledgePointId:G4A_U05_P05F13_KP_ID,
  patternGroupId:G4A_U05_P05F13_PATTERN_GROUP_ID,
  patternFamilyId:"TRIANGLE_ELEMENTS_NAMING",
  relation,
  questionMode:"diagram",
  requiresDiagramRepresentation:true,
  applicationAllowed:false,
  sideClassificationAllowed:false,
  angleClassificationAllowed:false,
  triangleInequalityAllowed:false,
  congruenceCorrespondenceAllowed:false,
  constructionAllowed:false,
})));
export const G4A_U05_P05F13_SPEC_IDS=Object.freeze(G4A_U05_P05F13_PATTERN_SPECS.map(row=>row.patternSpecId));
export const G4A_U05_P05F13_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g4a_u05_triangle_elements_naming_p05f13",
  sourceId:G4A_U05_P05F13_SOURCE_ID,
  knowledgePointId:G4A_U05_P05F13_KP_ID,
  canonicalNameZh:"三角形構成要素",
  capabilityStatement:"學生能辨認並命名三角形的邊、角與頂點。",
  reasoningInvariant:"三條線段首尾相接形成封閉圖形，對應邊角名稱必須一致。",
  relationFamily:"TRIANGLE_ELEMENTS_NAMING",
  includedRelations:G4A_U05_P05F13_INCLUDED_RELATIONS,
  excludedRelations:G4A_U05_P05F13_EXCLUDED_RELATIONS,
  questionMode:"diagram",
  applicationImplementationAllowed:false,
  requiredCapabilityIds:G4A_U05_P05F13_REQUIRED_CAPABILITY_IDS,
  patternSpecIds:G4A_U05_P05F13_SPEC_IDS,
});
export const G4A_U05_P05F13_PATTERN_GROUP=Object.freeze({
  patternGroupId:G4A_U05_P05F13_PATTERN_GROUP_ID,
  sourceId:G4A_U05_P05F13_SOURCE_ID,
  unitCode:G4A_U05_P05F13_UNIT_CODE,
  unitTitle:G4A_U05_P05F13_UNIT_TITLE,
  displayName:"三角形構成要素",
  primaryKnowledgePointId:G4A_U05_P05F13_KP_ID,
  knowledgePointIds:Object.freeze([G4A_U05_P05F13_KP_ID]),
  supportClass:"A",
  mode:"diagram",
  publicQuestionMode:"diagram",
  representationTag:"triangle_elements_naming_diagram",
  representationTags:Object.freeze(["geometry","triangle","elements","naming","diagram"]),
  patternSpecIds:G4A_U05_P05F13_SPEC_IDS,
  allocationPolicy:"balanced_relation",
  visibilityStatus:"visible",
  holdReason:null,
});
export const G4A_U05_P05F13_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G4A_U05_P05F13_KP_ID,
  sourceId:G4A_U05_P05F13_SOURCE_ID,
  unitCode:G4A_U05_P05F13_UNIT_CODE,
  unitTitle:G4A_U05_P05F13_UNIT_TITLE,
  displayName:"三角形構成要素",
  canonicalNameZh:"三角形構成要素",
  mode:"diagram",
  questionMode:"diagram",
  questionModes:Object.freeze(["diagram"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:"DIAGRAM_ONLY_APPLICATION_NOT_ADMITTED",
  canonicalPatternGroupIds:Object.freeze([G4A_U05_P05F13_PATTERN_GROUP_ID]),
  canonicalPatternSpecIds:G4A_U05_P05F13_SPEC_IDS,
  patternGroupIds:Object.freeze([G4A_U05_P05F13_PATTERN_GROUP_ID]),
  patternSpecIds:G4A_U05_P05F13_SPEC_IDS,
  requiredCapabilityIds:G4A_U05_P05F13_REQUIRED_CAPABILITY_IDS,
  qaStatusLabel:"P05F13_G4A_U05_SOURCE_BACKED_TRIANGLE_ELEMENTS_DIAGRAM",
  productionUse:"full_product_w5_slice013_candidate",
});
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
export function getG4AU05P05F13SelectorRow(id){return id===G4A_U05_P05F13_KP_ID?clone(G4A_U05_P05F13_SELECTOR_ROW):null;}
export function listG4AU05P05F13PatternGroups(id){return id===G4A_U05_P05F13_KP_ID?[clone(G4A_U05_P05F13_PATTERN_GROUP)]:[];}
export function resolveG4AU05P05F13PatternSpecIds(id){return id===G4A_U05_P05F13_KP_ID?clone(G4A_U05_P05F13_SPEC_IDS):[];}
export function auditG4AU05P05F13SelectorProjection(){
  const errors=[];
  if(G4A_U05_P05F13_PATTERN_SPECS.length!==5)errors.push("P05F13_PATTERN_CARDINALITY_INVALID");
  if(new Set(G4A_U05_P05F13_SPEC_IDS).size!==5)errors.push("P05F13_DUPLICATE_SPEC_ID");
  if(G4A_U05_P05F13_PATTERN_SPECS.some(row=>row.questionMode!=="diagram"||!row.requiresDiagramRepresentation||row.applicationAllowed||row.sideClassificationAllowed||row.angleClassificationAllowed||row.triangleInequalityAllowed||row.congruenceCorrespondenceAllowed||row.constructionAllowed))errors.push("P05F13_PATTERN_INVARIANT_INVALID");
  if(G4A_U05_P05F13_FORMAL_MAPPING.includedRelations.some(relation=>!G4A_U05_P05F13_PATTERN_SPECS.some(row=>row.relation===relation)))errors.push("P05F13_RELATION_MISSING");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:5,diagram:5,application:0})});
}
