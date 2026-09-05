export const P05F8_TASK_ID = "P05F_W5DirectProductVerticalSlice008Implementation";
export const G5A_U10A1_P05F8_SOURCE_ID = "g5a_u10_5a10a1";
export const G5A_U10A1_P05F8_UNIT_CODE = "5A-U10A1";
export const G5A_U10A1_P05F8_UNIT_TITLE = "正方體和長方體";
export const G5A_U10A1_P05F8_KP_ID = "kp_g5a_u10a1_cube_cuboid_faces_edges_vertices";
export const G5A_U10A1_P05F8_GROUP_ID = "pg_g5a_u10a1_cube_cuboid_elements";
export const G5A_U10A1_P05F8_FUTURE_KP_IDS = Object.freeze([
  "kp_g5a_u10a1_cube_cuboid_face_relationship",
  "kp_g5a_u10a1_cube_cuboid_net",
  "kp_g5a_u10a1_cube_cuboid_edge_length",
  "kp_g5a_u10a1_cube_cuboid_spatial_reasoning",
]);
export const G5A_U10A1_P05F8_REQUIRED_CAPABILITY_IDS = Object.freeze([
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
  "cap_solid_geometry_representation",
  "cap_spatial_solid_reasoning",
]);
export const G5A_U10A1_P05F8_SPEC_IDS = Object.freeze([
  "ps_g5a_u10a1_identify_faces_edges_vertices",
  "ps_g5a_u10a1_recognize_fixed_element_counts",
  "ps_g5a_u10a1_distinguish_cube_cuboid_structure",
]);

const spec = (patternSpecId, relation, diagramMode, sourceEvidenceTopic) => Object.freeze({
  patternSpecId,
  knowledgePointId: G5A_U10A1_P05F8_KP_ID,
  patternFamilyId: "CUBE_CUBOID_ELEMENT_STRUCTURE",
  relation,
  diagramMode,
  questionMode: "diagram",
  answerDomain: "CUBE_CUBOID_ELEMENT_OR_COUNT_ZH",
  requiresSolidGeometryRepresentation: true,
  applicationAllowed: false,
  faceRelationshipAllowed: false,
  netAllowed: false,
  edgeLengthRelationAllowed: false,
  broaderSpatialReasoningAllowed: false,
  solidMeasurementOrFormulaAllowed: false,
  sourceEvidenceTopic,
});

export const G5A_U10A1_P05F8_PATTERN_SPECS = Object.freeze([
  spec(G5A_U10A1_P05F8_SPEC_IDS[0], "IDENTIFY_CUBE_CUBOID_FACES_EDGES_VERTICES", "IDENTIFY_ELEMENT", "辨認正方體、長方體的面、稜與頂點"),
  spec(G5A_U10A1_P05F8_SPEC_IDS[1], "RECOGNIZE_CUBE_CUBOID_FIXED_ELEMENT_COUNTS", "FIXED_ELEMENT_COUNTS", "正方體與長方體均有6面、12稜、8頂點"),
  spec(G5A_U10A1_P05F8_SPEC_IDS[2], "DISTINGUISH_CUBE_CUBOID_ELEMENT_STRUCTURE", "DISTINGUISH_CUBE_CUBOID", "依面與稜的形狀、長度條件區分正方體與長方體"),
]);

export const G5A_U10A1_P05F8_FORMAL_MAPPING = Object.freeze({
  mappingId: "fm_g5a_u10a1_cube_cuboid_faces_edges_vertices_p05f8",
  sourceId: G5A_U10A1_P05F8_SOURCE_ID,
  sourcePages: Object.freeze([1, 2]),
  knowledgePointId: G5A_U10A1_P05F8_KP_ID,
  canonicalNameZh: "正方體長方體構成要素",
  relationFamily: "CUBE_CUBOID_ELEMENT_STRUCTURE",
  inputRepresentation: "BOUNDED_CUBE_CUBOID_DIAGRAM",
  answerDomain: Object.freeze(["面", "稜", "頂點", "6個面", "12條稜", "8個頂點", "正方體", "長方體"]),
  reasoningInvariant: "兩者均有6面、12稜、8頂點，面與稜的形狀長度條件不同。",
  directSourceConcepts: Object.freeze([
    "CUBE_CUBOID_FACES_EDGES_VERTICES_IDENTIFICATION",
    "CUBE_CUBOID_FIXED_ELEMENT_COUNTS_6_12_8",
    "CUBE_CUBOID_ELEMENT_STRUCTURE_CONDITIONS",
  ]),
  learnerFacingVocabulary: Object.freeze(["正方體", "長方體", "面", "稜", "頂點", "6個面", "12條稜", "8個頂點", "形狀", "長度條件"]),
  learnerFacingForbiddenVocabulary: Object.freeze(["相對面", "相鄰面", "垂直關係", "展開圖", "稜長關係", "長寬高", "缺面", "塗色", "切割", "體積", "表面積", "公式", "應用題"]),
  includedRelations: Object.freeze([
    "IDENTIFY_CUBE_CUBOID_FACES_EDGES_VERTICES",
    "RECOGNIZE_CUBE_CUBOID_FIXED_ELEMENT_COUNTS",
    "DISTINGUISH_CUBE_CUBOID_ELEMENT_STRUCTURE",
  ]),
  excludedRelations: Object.freeze([
    "CUBE_CUBOID_FACE_RELATIONSHIP",
    "CUBE_CUBOID_NET",
    "CUBE_CUBOID_EDGE_LENGTH_RELATION",
    "CUBE_CUBOID_SPATIAL_REASONING",
    "SOLID_MEASUREMENT_OR_FORMULA",
    "APPLICATION_CONTEXT",
  ]),
  applicationSuitability: "APPLICATION_COMPATIBLE",
  applicationContextSupportedByDirectPdf: false,
  applicationImplementationAllowed: false,
  requiredCapabilityIds: G5A_U10A1_P05F8_REQUIRED_CAPABILITY_IDS,
  patternSpecIds: G5A_U10A1_P05F8_SPEC_IDS,
});

export const G5A_U10A1_P05F8_PATTERN_GROUPS = Object.freeze([
  Object.freeze({
    patternGroupId: G5A_U10A1_P05F8_GROUP_ID,
    sourceId: G5A_U10A1_P05F8_SOURCE_ID,
    unitCode: G5A_U10A1_P05F8_UNIT_CODE,
    unitTitle: G5A_U10A1_P05F8_UNIT_TITLE,
    displayName: "正方體長方體構成要素圖形題",
    primaryKnowledgePointId: G5A_U10A1_P05F8_KP_ID,
    knowledgePointIds: Object.freeze([G5A_U10A1_P05F8_KP_ID]),
    supportClass: "A",
    mode: "diagram",
    publicQuestionMode: "diagram",
    representationTag: "cube_cuboid_elements_diagram",
    representationTags: Object.freeze(["geometry", "spatial_solid", "cube", "cuboid", "face", "edge", "vertex", "diagram_identification"]),
    patternSpecIds: G5A_U10A1_P05F8_SPEC_IDS,
    allocationPolicy: "balanced_cube_cuboid_element_relation",
    visibilityStatus: "visible",
    holdReason: null,
  }),
]);

export const G5A_U10A1_P05F8_SELECTOR_ROWS = Object.freeze([
  Object.freeze({
    knowledgePointId: G5A_U10A1_P05F8_KP_ID,
    sourceId: G5A_U10A1_P05F8_SOURCE_ID,
    unitCode: G5A_U10A1_P05F8_UNIT_CODE,
    unitTitle: G5A_U10A1_P05F8_UNIT_TITLE,
    displayName: "正方體長方體構成要素",
    canonicalNameZh: "正方體長方體構成要素",
    mode: "diagram",
    questionMode: "diagram",
    questionModes: Object.freeze(["diagram"]),
    supportClass: "A",
    visibilityStatus: "visible",
    selectorStatus: "visible",
    holdReason: null,
    applicationClassification: "DIAGRAM_ONLY_APPLICATION_COMPATIBLE_CONTEXT_NOT_ADMITTED",
    canonicalPatternGroupIds: Object.freeze([G5A_U10A1_P05F8_GROUP_ID]),
    canonicalPatternSpecIds: G5A_U10A1_P05F8_SPEC_IDS,
    patternGroupIds: Object.freeze([G5A_U10A1_P05F8_GROUP_ID]),
    patternSpecIds: G5A_U10A1_P05F8_SPEC_IDS,
    requiredCapabilityIds: G5A_U10A1_P05F8_REQUIRED_CAPABILITY_IDS,
    qaStatusLabel: "P05F8_G5A_U10A1_SOURCE_BACKED_CUBE_CUBOID_ELEMENTS_DIAGRAM",
    productionUse: "full_product_w5_slice008_candidate",
  }),
]);

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
export function listG5AU10A1P05F8SelectorRows() { return clone(G5A_U10A1_P05F8_SELECTOR_ROWS); }
export function getG5AU10A1P05F8SelectorRow(id) { return clone(id === G5A_U10A1_P05F8_KP_ID ? G5A_U10A1_P05F8_SELECTOR_ROWS[0] : null); }
export function listG5AU10A1P05F8PatternGroups(id) { return clone(id === G5A_U10A1_P05F8_KP_ID ? G5A_U10A1_P05F8_PATTERN_GROUPS : []); }
export function resolveG5AU10A1P05F8PatternSpecIds(id) { return clone(id === G5A_U10A1_P05F8_KP_ID ? G5A_U10A1_P05F8_SPEC_IDS : []); }
export function auditG5AU10A1P05F8SelectorProjection() {
  const errors = [];
  if (G5A_U10A1_P05F8_SELECTOR_ROWS.length !== 1 || G5A_U10A1_P05F8_PATTERN_GROUPS.length !== 1 || G5A_U10A1_P05F8_PATTERN_SPECS.length !== 3) errors.push("P05F8_CARDINALITY_INVALID");
  const relations = new Set(G5A_U10A1_P05F8_PATTERN_SPECS.map((row) => row.relation));
  for (const relation of G5A_U10A1_P05F8_FORMAL_MAPPING.includedRelations) if (!relations.has(relation)) errors.push(`P05F8_RELATION_MISSING:${relation}`);
  if (G5A_U10A1_P05F8_PATTERN_SPECS.some((row) => row.questionMode !== "diagram" || row.requiresSolidGeometryRepresentation !== true || row.applicationAllowed !== false || row.faceRelationshipAllowed !== false || row.netAllowed !== false || row.edgeLengthRelationAllowed !== false || row.broaderSpatialReasoningAllowed !== false || row.solidMeasurementOrFormulaAllowed !== false)) errors.push("P05F8_PATTERN_INVARIANT_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 1, patternGroups: 1, patternSpecs: 3, diagram: 3, application: 0 }) });
}
