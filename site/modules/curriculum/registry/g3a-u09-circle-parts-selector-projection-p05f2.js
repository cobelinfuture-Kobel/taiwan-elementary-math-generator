export const P05F2_TASK_ID = "P05F_W5DirectProductVerticalSlice002Implementation";
export const G3A_U09_P05F2_SOURCE_ID = "g3a_u09_3a09";
export const G3A_U09_P05F2_UNIT_CODE = "3A-U09";
export const G3A_U09_P05F2_UNIT_TITLE = "圓";
export const G3A_U09_P05F2_KP_ID = "kp_circle_center_radius_diameter";
export const G3A_U09_P05F2_GROUP_ID = "pg_g3a_u09_circle_parts_identification";
export const G3A_U09_P05F2_FUTURE_KP_IDS = Object.freeze([
  "kp_circle_compass_construction",
  "kp_circle_radius_diameter_measure_compare",
  "kp_circle_point_position_and_intersection",
]);
export const G3A_U09_P05F2_REQUIRED_CAPABILITY_IDS = Object.freeze([
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
]);
export const G3A_U09_P05F2_SPEC_IDS = Object.freeze([
  "ps_g3a_u09_identify_circle_center",
  "ps_g3a_u09_identify_radius",
  "ps_g3a_u09_identify_diameter",
  "ps_g3a_u09_match_circle_part_label_to_diagram",
  "ps_g3a_u09_distinguish_diameter_from_noncenter_segment",
]);

const spec = (patternSpecId, relation, targetPart, markerMode, answerDomain, sourceEvidenceTopic) => Object.freeze({
  patternSpecId,
  knowledgePointId: G3A_U09_P05F2_KP_ID,
  patternFamilyId: "CIRCLE_PART_IDENTIFICATION",
  relation,
  targetPart,
  markerMode,
  questionMode: "diagram",
  answerDomain,
  requiresDiagramRepresentation: true,
  applicationAllowed: false,
  numericSolveAllowed: false,
  constructionAllowed: false,
  circumferenceTargetAllowed: false,
  sourceEvidenceTopic,
});

export const G3A_U09_P05F2_PATTERN_SPECS = Object.freeze([
  spec(G3A_U09_P05F2_SPEC_IDS[0], "IDENTIFY_CIRCLE_CENTER", "CENTER", "DOT", "CIRCLE_PART_LABEL_ZH", "圓的各部位名稱－圓心"),
  spec(G3A_U09_P05F2_SPEC_IDS[1], "IDENTIFY_RADIUS", "RADIUS", "HIGHLIGHT_RADIUS", "CIRCLE_PART_LABEL_ZH", "圓的各部位名稱－半徑"),
  spec(G3A_U09_P05F2_SPEC_IDS[2], "IDENTIFY_DIAMETER", "DIAMETER", "HIGHLIGHT_DIAMETER", "CIRCLE_PART_LABEL_ZH", "圓的各部位名稱－直徑"),
  spec(G3A_U09_P05F2_SPEC_IDS[3], "MATCH_CIRCLE_PART_LABEL_TO_DIAGRAM", "VARIABLE", "LABEL", "CIRCLE_PART_LABEL_ZH", "圓的各部位名稱－標記與部位配對"),
  spec(G3A_U09_P05F2_SPEC_IDS[4], "DISTINGUISH_DIAMETER_FROM_NONCENTER_CHORD", "DIAMETER_TEST", "HIGHLIGHT_SEGMENT", "DIAMETER_DECISION_ZH", "圓的半徑與直徑－這條不是直徑"),
]);

export const G3A_U09_P05F2_FORMAL_MAPPING = Object.freeze({
  mappingId: "fm_g3a_u09_circle_center_radius_diameter_p05f2",
  sourceId: G3A_U09_P05F2_SOURCE_ID,
  sourcePage: 1,
  knowledgePointId: G3A_U09_P05F2_KP_ID,
  canonicalNameZh: "圓心、半徑與直徑",
  relationFamily: "CIRCLE_PART_IDENTIFICATION",
  inputRepresentation: "CIRCLE_DIAGRAM_WITH_TARGET_MARKER",
  partAnswerDomain: Object.freeze(["圓心", "半徑", "直徑"]),
  diameterDecisionAnswerDomain: Object.freeze(["是直徑", "不是直徑"]),
  reasoningInvariant: "半徑由圓心連到圓周；直徑通過圓心，且直徑長度等於兩個半徑。",
  directSourceStatements: Object.freeze(["直徑=半徑×2", "這條不是直徑"]),
  learnerFacingVocabulary: Object.freeze(["圓", "圓心", "半徑", "直徑"]),
  learnerFacingForbiddenVocabulary: Object.freeze(["圓周", "圓規", "弦", "相切", "外切", "內切"]),
  includedRelations: Object.freeze([
    "IDENTIFY_CIRCLE_CENTER",
    "IDENTIFY_RADIUS",
    "IDENTIFY_DIAMETER",
    "MATCH_CIRCLE_PART_LABEL_TO_DIAGRAM",
    "DISTINGUISH_DIAMETER_FROM_NONCENTER_CHORD",
  ]),
  excludedRelations: Object.freeze([
    "IDENTIFY_CIRCUMFERENCE_AS_TARGET_KP",
    "COMPASS_CONSTRUCTION",
    "CONCENTRIC_CIRCLE_CONSTRUCTION",
    "RADIUS_DIAMETER_MEASUREMENT",
    "COMPUTE_RADIUS_FROM_DIAMETER",
    "COMPUTE_DIAMETER_FROM_RADIUS",
    "COMPARE_RADIUS_DIAMETER_MEASUREMENTS",
    "CIRCLE_POINT_POSITION",
    "TWO_CIRCLE_INTERSECTION",
    "TWO_CIRCLE_TANGENCY",
    "COMPASS_LENGTH_COMPARISON",
    "APPLICATION_CONTEXT",
  ]),
  applicationSuitability: "APPLICATION_COMPATIBLE",
  applicationContextSupportedByDirectPdf: false,
  applicationImplementationAllowed: false,
  requiredCapabilityIds: G3A_U09_P05F2_REQUIRED_CAPABILITY_IDS,
  patternSpecIds: G3A_U09_P05F2_SPEC_IDS,
});

export const G3A_U09_P05F2_PATTERN_GROUPS = Object.freeze([
  Object.freeze({
    patternGroupId: G3A_U09_P05F2_GROUP_ID,
    sourceId: G3A_U09_P05F2_SOURCE_ID,
    unitCode: G3A_U09_P05F2_UNIT_CODE,
    unitTitle: G3A_U09_P05F2_UNIT_TITLE,
    displayName: "圓心、半徑與直徑圖形辨識",
    primaryKnowledgePointId: G3A_U09_P05F2_KP_ID,
    knowledgePointIds: Object.freeze([G3A_U09_P05F2_KP_ID]),
    supportClass: "A",
    mode: "diagram",
    publicQuestionMode: "diagram",
    representationTag: "circle_parts_diagram",
    representationTags: Object.freeze(["geometry", "circle", "center", "radius", "diameter", "diagram_identification"]),
    patternSpecIds: G3A_U09_P05F2_SPEC_IDS,
    allocationPolicy: "balanced_circle_part_relation",
    visibilityStatus: "visible",
    holdReason: null,
  }),
]);

export const G3A_U09_P05F2_SELECTOR_ROWS = Object.freeze([
  Object.freeze({
    knowledgePointId: G3A_U09_P05F2_KP_ID,
    sourceId: G3A_U09_P05F2_SOURCE_ID,
    unitCode: G3A_U09_P05F2_UNIT_CODE,
    unitTitle: G3A_U09_P05F2_UNIT_TITLE,
    displayName: "圓心、半徑與直徑",
    canonicalNameZh: "圓心、半徑與直徑",
    mode: "diagram",
    questionMode: "diagram",
    questionModes: Object.freeze(["diagram"]),
    supportClass: "A",
    visibilityStatus: "visible",
    selectorStatus: "visible",
    holdReason: null,
    applicationClassification: "DIAGRAM_ONLY_APPLICATION_COMPATIBLE_CONTEXT_NOT_ADMITTED",
    canonicalPatternGroupIds: Object.freeze([G3A_U09_P05F2_GROUP_ID]),
    canonicalPatternSpecIds: G3A_U09_P05F2_SPEC_IDS,
    patternGroupIds: Object.freeze([G3A_U09_P05F2_GROUP_ID]),
    patternSpecIds: G3A_U09_P05F2_SPEC_IDS,
    requiredCapabilityIds: G3A_U09_P05F2_REQUIRED_CAPABILITY_IDS,
    qaStatusLabel: "P05F2_G3A_U09_SOURCE_BACKED_DIAGRAM",
    productionUse: "full_product_w5_slice002_candidate",
  }),
]);

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
export function listG3AU09P05F2SelectorRows() { return clone(G3A_U09_P05F2_SELECTOR_ROWS); }
export function getG3AU09P05F2SelectorRow(id) { return clone(id === G3A_U09_P05F2_KP_ID ? G3A_U09_P05F2_SELECTOR_ROWS[0] : null); }
export function listG3AU09P05F2PatternGroups(id) { return clone(id === G3A_U09_P05F2_KP_ID ? G3A_U09_P05F2_PATTERN_GROUPS : []); }
export function resolveG3AU09P05F2PatternSpecIds(id) { return clone(id === G3A_U09_P05F2_KP_ID ? G3A_U09_P05F2_SPEC_IDS : []); }
export function auditG3AU09P05F2SelectorProjection() {
  const errors = [];
  if (G3A_U09_P05F2_SELECTOR_ROWS.length !== 1 || G3A_U09_P05F2_PATTERN_GROUPS.length !== 1 || G3A_U09_P05F2_PATTERN_SPECS.length !== 5) errors.push("P05F2_CARDINALITY_INVALID");
  const relations = new Set(G3A_U09_P05F2_PATTERN_SPECS.map((row) => row.relation));
  for (const relation of G3A_U09_P05F2_FORMAL_MAPPING.includedRelations) if (!relations.has(relation)) errors.push(`P05F2_RELATION_MISSING:${relation}`);
  if (G3A_U09_P05F2_PATTERN_SPECS.some((row) => row.questionMode !== "diagram" || row.requiresDiagramRepresentation !== true || row.applicationAllowed !== false || row.numericSolveAllowed !== false || row.constructionAllowed !== false || row.circumferenceTargetAllowed !== false)) errors.push("P05F2_PATTERN_INVARIANT_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 1, patternGroups: 1, patternSpecs: 5, diagram: 5, application: 0 }) });
}
