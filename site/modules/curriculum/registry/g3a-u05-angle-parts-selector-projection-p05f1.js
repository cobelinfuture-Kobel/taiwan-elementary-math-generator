export const P05F1_TASK_ID = "P05F_W5DirectProductVerticalSlice001Implementation";
export const G3A_U05_P05F1_SOURCE_ID = "g3a_u05_3a05";
export const G3A_U05_P05F1_UNIT_CODE = "3A-U05";
export const G3A_U05_P05F1_UNIT_TITLE = "角與形狀";
export const G3A_U05_P05F1_KP_ID = "kp_angle_parts_identification";
export const G3A_U05_P05F1_GROUP_ID = "pg_g3a_u05_angle_parts_identification";
export const G3A_U05_P05F1_FUTURE_KP_IDS = Object.freeze([
  "kp_right_angle_recognition",
  "kp_acute_obtuse_angle_qualitative_classification",
  "kp_rectangle_square_right_angle_properties",
]);
export const G3A_U05_P05F1_REQUIRED_CAPABILITY_IDS = Object.freeze([
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
]);
export const G3A_U05_P05F1_SPEC_IDS = Object.freeze([
  "ps_g3a_u05_identify_vertex_from_marker",
  "ps_g3a_u05_identify_side_from_highlight",
  "ps_g3a_u05_identify_angle_from_arc",
  "ps_g3a_u05_match_part_label_to_diagram_marker",
]);

const spec = (patternSpecId, relation, targetPart, markerMode, sourceEvidenceTopic) => Object.freeze({
  patternSpecId,
  knowledgePointId: G3A_U05_P05F1_KP_ID,
  patternFamilyId: "ANGLE_PART_IDENTIFICATION",
  relation,
  targetPart,
  markerMode,
  questionMode: "diagram",
  answerDomain: "ANGLE_PART_LABEL_ZH",
  requiresDiagramRepresentation: true,
  applicationAllowed: false,
  numericAngleMeasureAllowed: false,
  constructionAllowed: false,
  learnerRayVocabularyAllowed: false,
  sourceEvidenceTopic,
});

export const G3A_U05_P05F1_PATTERN_SPECS = Object.freeze([
  spec(G3A_U05_P05F1_SPEC_IDS[0], "IDENTIFY_VERTEX", "VERTEX", "DOT", "角的組成－頂點"),
  spec(G3A_U05_P05F1_SPEC_IDS[1], "IDENTIFY_SIDE", "SIDE", "HIGHLIGHT", "角的組成－兩邊"),
  spec(G3A_U05_P05F1_SPEC_IDS[2], "IDENTIFY_ANGLE_MARKER", "ANGLE", "ARC", "角的組成－角的標記"),
  spec(G3A_U05_P05F1_SPEC_IDS[3], "MATCH_ANGLE_PART_LABEL_TO_DIAGRAM", "VARIABLE", "LABEL", "角的組成－標記與圖形部位配對"),
]);

export const G3A_U05_P05F1_FORMAL_MAPPING = Object.freeze({
  mappingId: "fm_g3a_u05_angle_parts_identification_p05f1",
  sourceId: G3A_U05_P05F1_SOURCE_ID,
  sourcePage: 1,
  knowledgePointId: G3A_U05_P05F1_KP_ID,
  canonicalNameZh: "角的組成與標記",
  relationFamily: "ANGLE_PART_IDENTIFICATION",
  inputRepresentation: "ANGLE_DIAGRAM_WITH_TARGET_MARKER",
  answerDomain: Object.freeze(["頂點", "邊", "角"]),
  reasoningInvariant: "角的標記、頂點與兩邊必須在同一個角圖形中保持一致的部位關係。",
  directSourceStatement: "兩條邊+1個頂點",
  learnerFacingVocabulary: Object.freeze(["角", "頂點", "邊"]),
  learnerFacingForbiddenVocabulary: Object.freeze(["射線"]),
  includedRelations: Object.freeze([
    "IDENTIFY_VERTEX",
    "IDENTIFY_SIDE",
    "IDENTIFY_ANGLE_MARKER",
    "MATCH_ANGLE_PART_LABEL_TO_DIAGRAM",
  ]),
  excludedRelations: Object.freeze([
    "COMPARE_ANGLE_SIZE",
    "RECOGNIZE_RIGHT_ANGLE",
    "CLASSIFY_ACUTE_RIGHT_OBTUSE",
    "COUNT_QUADRILATERAL_ANGLES",
    "RECTANGLE_SQUARE_PROPERTY_REASONING",
    "ANGLE_MEASURE_NUMERIC",
    "ANGLE_CONSTRUCTION",
    "APPLICATION_CONTEXT",
  ]),
  requiredCapabilityIds: G3A_U05_P05F1_REQUIRED_CAPABILITY_IDS,
  patternSpecIds: G3A_U05_P05F1_SPEC_IDS,
});

export const G3A_U05_P05F1_PATTERN_GROUPS = Object.freeze([
  Object.freeze({
    patternGroupId: G3A_U05_P05F1_GROUP_ID,
    sourceId: G3A_U05_P05F1_SOURCE_ID,
    unitCode: G3A_U05_P05F1_UNIT_CODE,
    unitTitle: G3A_U05_P05F1_UNIT_TITLE,
    displayName: "角的組成圖形辨識",
    primaryKnowledgePointId: G3A_U05_P05F1_KP_ID,
    knowledgePointIds: Object.freeze([G3A_U05_P05F1_KP_ID]),
    supportClass: "A",
    mode: "diagram",
    publicQuestionMode: "diagram",
    representationTag: "angle_parts_diagram",
    representationTags: Object.freeze(["geometry", "angle", "vertex", "side", "angle_marker", "diagram_identification"]),
    patternSpecIds: G3A_U05_P05F1_SPEC_IDS,
    allocationPolicy: "balanced_angle_part_relation",
    visibilityStatus: "visible",
    holdReason: null,
  }),
]);

export const G3A_U05_P05F1_SELECTOR_ROWS = Object.freeze([
  Object.freeze({
    knowledgePointId: G3A_U05_P05F1_KP_ID,
    sourceId: G3A_U05_P05F1_SOURCE_ID,
    unitCode: G3A_U05_P05F1_UNIT_CODE,
    unitTitle: G3A_U05_P05F1_UNIT_TITLE,
    displayName: "角的組成與標記",
    canonicalNameZh: "角的組成與標記",
    mode: "diagram",
    questionMode: "diagram",
    questionModes: Object.freeze(["diagram"]),
    supportClass: "A",
    visibilityStatus: "visible",
    selectorStatus: "visible",
    holdReason: null,
    applicationClassification: "DIAGRAM_ONLY_APPLICATION_NOT_APPLICABLE",
    canonicalPatternGroupIds: Object.freeze([G3A_U05_P05F1_GROUP_ID]),
    canonicalPatternSpecIds: G3A_U05_P05F1_SPEC_IDS,
    patternGroupIds: Object.freeze([G3A_U05_P05F1_GROUP_ID]),
    patternSpecIds: G3A_U05_P05F1_SPEC_IDS,
    requiredCapabilityIds: G3A_U05_P05F1_REQUIRED_CAPABILITY_IDS,
    qaStatusLabel: "P05F1_G3A_U05_SOURCE_BACKED_DIAGRAM",
    productionUse: "full_product_w5_slice001_candidate",
  }),
]);

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
export function listG3AU05P05F1SelectorRows() { return clone(G3A_U05_P05F1_SELECTOR_ROWS); }
export function getG3AU05P05F1SelectorRow(id) { return clone(id === G3A_U05_P05F1_KP_ID ? G3A_U05_P05F1_SELECTOR_ROWS[0] : null); }
export function listG3AU05P05F1PatternGroups(id) { return clone(id === G3A_U05_P05F1_KP_ID ? G3A_U05_P05F1_PATTERN_GROUPS : []); }
export function resolveG3AU05P05F1PatternSpecIds(id) { return clone(id === G3A_U05_P05F1_KP_ID ? G3A_U05_P05F1_SPEC_IDS : []); }
export function auditG3AU05P05F1SelectorProjection() {
  const errors = [];
  if (G3A_U05_P05F1_SELECTOR_ROWS.length !== 1 || G3A_U05_P05F1_PATTERN_GROUPS.length !== 1 || G3A_U05_P05F1_PATTERN_SPECS.length !== 4) errors.push("P05F1_CARDINALITY_INVALID");
  const relations = new Set(G3A_U05_P05F1_PATTERN_SPECS.map((row) => row.relation));
  for (const relation of G3A_U05_P05F1_FORMAL_MAPPING.includedRelations) if (!relations.has(relation)) errors.push(`P05F1_RELATION_MISSING:${relation}`);
  if (G3A_U05_P05F1_PATTERN_SPECS.some((row) => row.questionMode !== "diagram" || row.requiresDiagramRepresentation !== true || row.applicationAllowed !== false || row.numericAngleMeasureAllowed !== false || row.constructionAllowed !== false || row.learnerRayVocabularyAllowed !== false)) errors.push("P05F1_PATTERN_INVARIANT_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 1, patternGroups: 1, patternSpecs: 4, diagram: 4, application: 0 }) });
}
