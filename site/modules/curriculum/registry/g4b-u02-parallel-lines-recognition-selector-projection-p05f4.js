export const P05F4_TASK_ID = "P05F_W5DirectProductVerticalSlice004Implementation";
export const G4B_U02_P05F4_SOURCE_ID = "g4b_u02_4b02";
export const G4B_U02_P05F4_UNIT_CODE = "4B-U02";
export const G4B_U02_P05F4_UNIT_TITLE = "垂直平行與四邊形";
export const G4B_U02_P05F4_KP_ID = "kp_g4b_u02_parallel_lines_recognition";
export const G4B_U02_P05F4_GROUP_ID = "pg_g4b_u02_parallel_lines_recognition";
export const G4B_U02_P05F4_FUTURE_KP_IDS = Object.freeze([
  "kp_g4b_u02_perpendicular_lines_recognition",
  "kp_g4b_u02_parallel_distance_construction",
  "kp_g4b_u02_quadrilateral_classification",
  "kp_g4b_u02_quadrilateral_inclusion_relation",
]);
export const G4B_U02_P05F4_REQUIRED_CAPABILITY_IDS = Object.freeze([
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
]);
export const G4B_U02_P05F4_SPEC_IDS = Object.freeze([
  "ps_g4b_u02_identify_parallel_line_pair",
  "ps_g4b_u02_coplanar_nonintersection",
  "ps_g4b_u02_extension_nonintersection",
  "ps_g4b_u02_consistent_direction",
]);

const spec = (patternSpecId, relation, diagramMode, answerDomain, sourceEvidenceTopic) => Object.freeze({
  patternSpecId,
  knowledgePointId: G4B_U02_P05F4_KP_ID,
  patternFamilyId: "PARALLEL_LINE_RECOGNITION",
  relation,
  diagramMode,
  questionMode: "diagram",
  answerDomain,
  requiresDiagramRepresentation: true,
  applicationAllowed: false,
  perpendicularRecognitionAllowed: false,
  parallelDistanceMeasurementAllowed: false,
  parallelLineConstructionAllowed: false,
  quadrilateralReasoningAllowed: false,
  sourceEvidenceTopic,
});

export const G4B_U02_P05F4_PATTERN_SPECS = Object.freeze([
  spec(G4B_U02_P05F4_SPEC_IDS[0], "IDENTIFY_PARALLEL_LINE_PAIR", "PLAIN_PAIR", "PARALLEL_LINES_ZH", "辨認平行線組"),
  spec(G4B_U02_P05F4_SPEC_IDS[1], "RECOGNIZE_COPLANAR_NONINTERSECTING_LINES", "NONINTERSECTING_PAIR", "PARALLEL_LINES_ZH", "同平面內不相交的直線"),
  spec(G4B_U02_P05F4_SPEC_IDS[2], "RECOGNIZE_PARALLEL_LINES_REMAIN_NONINTERSECTING_WHEN_EXTENDED", "EXTENSION_GUIDES", "NONINTERSECTION_AFTER_EXTENSION_ZH", "平行線延伸後仍不相交"),
  spec(G4B_U02_P05F4_SPEC_IDS[3], "RECOGNIZE_CONSISTENT_DIRECTION", "DIRECTION_ARROWS", "CONSISTENT_DIRECTION_ZH", "平行線方向保持一致"),
]);

export const G4B_U02_P05F4_FORMAL_MAPPING = Object.freeze({
  mappingId: "fm_g4b_u02_parallel_lines_recognition_p05f4",
  sourceId: G4B_U02_P05F4_SOURCE_ID,
  sourcePages: Object.freeze([1, 2]),
  knowledgePointId: G4B_U02_P05F4_KP_ID,
  canonicalNameZh: "平行線辨識",
  relationFamily: "PARALLEL_LINE_RECOGNITION",
  inputRepresentation: "PAIR_OF_COPLANAR_LINES_DIAGRAM",
  answerDomain: Object.freeze(["平行線", "不會相交", "方向一致"]),
  reasoningInvariant: "平行線延伸後仍不相交，方向保持一致。",
  directSourceConcepts: Object.freeze([
    "PARALLEL_LINE_PAIR_IDENTIFICATION",
    "COPLANAR_NONINTERSECTION",
    "NONINTERSECTION_UNDER_EXTENSION",
    "CONSISTENT_DIRECTION",
  ]),
  learnerFacingVocabulary: Object.freeze(["直線", "平行線", "相交", "延伸", "方向"]),
  learnerFacingForbiddenVocabulary: Object.freeze(["垂直", "直角", "量距離", "作圖", "四邊形"]),
  includedRelations: Object.freeze([
    "IDENTIFY_PARALLEL_LINE_PAIR",
    "RECOGNIZE_COPLANAR_NONINTERSECTING_LINES",
    "RECOGNIZE_PARALLEL_LINES_REMAIN_NONINTERSECTING_WHEN_EXTENDED",
    "RECOGNIZE_CONSISTENT_DIRECTION",
  ]),
  excludedRelations: Object.freeze([
    "PERPENDICULAR_LINE_RECOGNITION",
    "PARALLEL_DISTANCE_MEASUREMENT",
    "PARALLEL_LINE_CONSTRUCTION",
    "QUADRILATERAL_CLASSIFICATION",
    "QUADRILATERAL_INCLUSION_RELATION",
    "APPLICATION_CONTEXT",
  ]),
  applicationSuitability: "APPLICATION_COMPATIBLE",
  applicationContextSupportedByDirectPdf: false,
  applicationImplementationAllowed: false,
  requiredCapabilityIds: G4B_U02_P05F4_REQUIRED_CAPABILITY_IDS,
  patternSpecIds: G4B_U02_P05F4_SPEC_IDS,
});

export const G4B_U02_P05F4_PATTERN_GROUPS = Object.freeze([
  Object.freeze({
    patternGroupId: G4B_U02_P05F4_GROUP_ID,
    sourceId: G4B_U02_P05F4_SOURCE_ID,
    unitCode: G4B_U02_P05F4_UNIT_CODE,
    unitTitle: G4B_U02_P05F4_UNIT_TITLE,
    displayName: "平行線辨識圖形題",
    primaryKnowledgePointId: G4B_U02_P05F4_KP_ID,
    knowledgePointIds: Object.freeze([G4B_U02_P05F4_KP_ID]),
    supportClass: "A",
    mode: "diagram",
    publicQuestionMode: "diagram",
    representationTag: "parallel_lines_recognition_diagram",
    representationTags: Object.freeze(["geometry", "parallel_lines", "nonintersection", "direction", "diagram_identification"]),
    patternSpecIds: G4B_U02_P05F4_SPEC_IDS,
    allocationPolicy: "balanced_parallel_line_relation",
    visibilityStatus: "visible",
    holdReason: null,
  }),
]);

export const G4B_U02_P05F4_SELECTOR_ROWS = Object.freeze([
  Object.freeze({
    knowledgePointId: G4B_U02_P05F4_KP_ID,
    sourceId: G4B_U02_P05F4_SOURCE_ID,
    unitCode: G4B_U02_P05F4_UNIT_CODE,
    unitTitle: G4B_U02_P05F4_UNIT_TITLE,
    displayName: "平行線辨識",
    canonicalNameZh: "平行線辨識",
    mode: "diagram",
    questionMode: "diagram",
    questionModes: Object.freeze(["diagram"]),
    supportClass: "A",
    visibilityStatus: "visible",
    selectorStatus: "visible",
    holdReason: null,
    applicationClassification: "DIAGRAM_ONLY_APPLICATION_COMPATIBLE_CONTEXT_NOT_ADMITTED",
    canonicalPatternGroupIds: Object.freeze([G4B_U02_P05F4_GROUP_ID]),
    canonicalPatternSpecIds: G4B_U02_P05F4_SPEC_IDS,
    patternGroupIds: Object.freeze([G4B_U02_P05F4_GROUP_ID]),
    patternSpecIds: G4B_U02_P05F4_SPEC_IDS,
    requiredCapabilityIds: G4B_U02_P05F4_REQUIRED_CAPABILITY_IDS,
    qaStatusLabel: "P05F4_G4B_U02_SOURCE_BACKED_DIAGRAM",
    productionUse: "full_product_w5_slice004_candidate",
  }),
]);

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
export function listG4BU02P05F4SelectorRows() { return clone(G4B_U02_P05F4_SELECTOR_ROWS); }
export function getG4BU02P05F4SelectorRow(id) { return clone(id === G4B_U02_P05F4_KP_ID ? G4B_U02_P05F4_SELECTOR_ROWS[0] : null); }
export function listG4BU02P05F4PatternGroups(id) { return clone(id === G4B_U02_P05F4_KP_ID ? G4B_U02_P05F4_PATTERN_GROUPS : []); }
export function resolveG4BU02P05F4PatternSpecIds(id) { return clone(id === G4B_U02_P05F4_KP_ID ? G4B_U02_P05F4_SPEC_IDS : []); }
export function auditG4BU02P05F4SelectorProjection() {
  const errors = [];
  if (G4B_U02_P05F4_SELECTOR_ROWS.length !== 1 || G4B_U02_P05F4_PATTERN_GROUPS.length !== 1 || G4B_U02_P05F4_PATTERN_SPECS.length !== 4) errors.push("P05F4_CARDINALITY_INVALID");
  const relations = new Set(G4B_U02_P05F4_PATTERN_SPECS.map((row) => row.relation));
  for (const relation of G4B_U02_P05F4_FORMAL_MAPPING.includedRelations) if (!relations.has(relation)) errors.push(`P05F4_RELATION_MISSING:${relation}`);
  if (G4B_U02_P05F4_PATTERN_SPECS.some((row) => row.questionMode !== "diagram" || row.requiresDiagramRepresentation !== true || row.applicationAllowed !== false || row.perpendicularRecognitionAllowed !== false || row.parallelDistanceMeasurementAllowed !== false || row.parallelLineConstructionAllowed !== false || row.quadrilateralReasoningAllowed !== false)) errors.push("P05F4_PATTERN_INVARIANT_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 1, patternGroups: 1, patternSpecs: 4, diagram: 4, application: 0 }) });
}
