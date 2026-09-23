export const P05F6_TASK_ID = "P05F_W5DirectProductVerticalSlice006Implementation";
export const G5A_U07_P05F6_SOURCE_ID = "g5a_u07_5a07";
export const G5A_U07_P05F6_UNIT_CODE = "5A-U07";
export const G5A_U07_P05F6_UNIT_TITLE = "線對稱圖形";
export const G5A_U07_P05F6_KP_ID = "kp_g5a_u07_line_symmetry_recognition";
export const G5A_U07_P05F6_GROUP_ID = "pg_g5a_u07_line_symmetry_recognition";
export const G5A_U07_P05F6_FUTURE_KP_IDS = Object.freeze([
  "kp_g5a_u07_symmetry_axis_count",
  "kp_g5a_u07_symmetric_point_distance",
  "kp_g5a_u07_complete_symmetric_figure",
  "kp_g5a_u07_coordinate_reflection",
]);
export const G5A_U07_P05F6_REQUIRED_CAPABILITY_IDS = Object.freeze([
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
]);
export const G5A_U07_P05F6_SPEC_IDS = Object.freeze([
  "ps_g5a_u07_identify_line_symmetric_figure",
  "ps_g5a_u07_distinguish_non_symmetric_figure",
  "ps_g5a_u07_fold_overlap_criterion",
]);

const spec = (patternSpecId, relation, diagramMode, answerDomain, sourceEvidenceTopic) => Object.freeze({
  patternSpecId,
  knowledgePointId: G5A_U07_P05F6_KP_ID,
  patternFamilyId: "LINE_SYMMETRY_RECOGNITION",
  relation,
  diagramMode,
  questionMode: "diagram",
  answerDomain,
  requiresDiagramRepresentation: true,
  applicationAllowed: false,
  symmetryAxisCountAllowed: false,
  symmetryAxisLocationOrConstructionAllowed: false,
  symmetricPointDistanceAllowed: false,
  completeSymmetricFigureAllowed: false,
  coordinateReflectionAllowed: false,
  sourceEvidenceTopic,
});

export const G5A_U07_P05F6_PATTERN_SPECS = Object.freeze([
  spec(G5A_U07_P05F6_SPEC_IDS[0], "IDENTIFY_LINE_SYMMETRIC_FIGURE", "SYMMETRIC_CLASSIFICATION", "YES_ZH", "辨認能沿一直線摺合重疊的圖形"),
  spec(G5A_U07_P05F6_SPEC_IDS[1], "DISTINGUISH_LINE_SYMMETRIC_FROM_NON_SYMMETRIC_FIGURE", "NON_SYMMETRIC_CLASSIFICATION", "NO_ZH", "區分線對稱與非線對稱圖形"),
  spec(G5A_U07_P05F6_SPEC_IDS[2], "RECOGNIZE_FOLD_OVERLAP_AS_LINE_SYMMETRY_CRITERION", "FOLD_OVERLAP_CUE", "CAN_OVERLAP_ZH", "以摺合後完全重疊判斷線對稱"),
]);

export const G5A_U07_P05F6_FORMAL_MAPPING = Object.freeze({
  mappingId: "fm_g5a_u07_line_symmetry_recognition_p05f6",
  sourceId: G5A_U07_P05F6_SOURCE_ID,
  sourcePages: Object.freeze([1]),
  knowledgePointId: G5A_U07_P05F6_KP_ID,
  canonicalNameZh: "線對稱圖形辨識",
  relationFamily: "LINE_SYMMETRY_RECOGNITION",
  inputRepresentation: "BOUNDED_GEOMETRY_SHAPE_DIAGRAM",
  answerDomain: Object.freeze(["是", "不是", "可以"]),
  reasoningInvariant: "對稱線兩側對應部分形狀大小相同且方向相反。",
  directSourceConcepts: Object.freeze([
    "LINE_SYMMETRIC_FIGURE_RECOGNITION",
    "FOLD_OVERLAP_CRITERION",
    "LINE_SYMMETRIC_VS_NON_SYMMETRIC_CLASSIFICATION",
  ]),
  learnerFacingVocabulary: Object.freeze(["圖形", "線對稱圖形", "摺疊", "重疊", "兩側"]),
  learnerFacingForbiddenVocabulary: Object.freeze(["幾條對稱軸", "對稱軸位置", "對稱點距離", "補完圖形", "完成圖形", "座標", "反射", "作圖"]),
  includedRelations: Object.freeze([
    "IDENTIFY_LINE_SYMMETRIC_FIGURE",
    "DISTINGUISH_LINE_SYMMETRIC_FROM_NON_SYMMETRIC_FIGURE",
    "RECOGNIZE_FOLD_OVERLAP_AS_LINE_SYMMETRY_CRITERION",
  ]),
  excludedRelations: Object.freeze([
    "SYMMETRY_AXIS_COUNT",
    "SYMMETRY_AXIS_LOCATION_OR_CONSTRUCTION",
    "SYMMETRIC_POINT_DISTANCE",
    "SYMMETRIC_CORRESPONDING_PARTS_QUANTITATIVE_REASONING",
    "COMPLETE_SYMMETRIC_FIGURE",
    "COORDINATE_REFLECTION",
    "DRAW_OR_CONSTRUCT_SYMMETRIC_FIGURE",
    "APPLICATION_CONTEXT",
    "GEOMETRY_FORMULA_OR_MEASUREMENT",
  ]),
  applicationSuitability: "APPLICATION_COMPATIBLE",
  applicationContextSupportedByDirectPdf: false,
  applicationImplementationAllowed: false,
  requiredCapabilityIds: G5A_U07_P05F6_REQUIRED_CAPABILITY_IDS,
  patternSpecIds: G5A_U07_P05F6_SPEC_IDS,
});

export const G5A_U07_P05F6_PATTERN_GROUPS = Object.freeze([
  Object.freeze({
    patternGroupId: G5A_U07_P05F6_GROUP_ID,
    sourceId: G5A_U07_P05F6_SOURCE_ID,
    unitCode: G5A_U07_P05F6_UNIT_CODE,
    unitTitle: G5A_U07_P05F6_UNIT_TITLE,
    displayName: "線對稱圖形辨識圖形題",
    primaryKnowledgePointId: G5A_U07_P05F6_KP_ID,
    knowledgePointIds: Object.freeze([G5A_U07_P05F6_KP_ID]),
    supportClass: "A",
    mode: "diagram",
    publicQuestionMode: "diagram",
    representationTag: "line_symmetry_recognition_diagram",
    representationTags: Object.freeze(["geometry", "line_symmetry", "fold_overlap", "classification", "diagram_identification"]),
    patternSpecIds: G5A_U07_P05F6_SPEC_IDS,
    allocationPolicy: "balanced_line_symmetry_recognition_relation",
    visibilityStatus: "visible",
    holdReason: null,
  }),
]);

export const G5A_U07_P05F6_SELECTOR_ROWS = Object.freeze([
  Object.freeze({
    knowledgePointId: G5A_U07_P05F6_KP_ID,
    sourceId: G5A_U07_P05F6_SOURCE_ID,
    unitCode: G5A_U07_P05F6_UNIT_CODE,
    unitTitle: G5A_U07_P05F6_UNIT_TITLE,
    displayName: "線對稱圖形辨識",
    canonicalNameZh: "線對稱圖形辨識",
    mode: "diagram",
    questionMode: "diagram",
    questionModes: Object.freeze(["diagram"]),
    supportClass: "A",
    visibilityStatus: "visible",
    selectorStatus: "visible",
    holdReason: null,
    applicationClassification: "DIAGRAM_ONLY_APPLICATION_COMPATIBLE_CONTEXT_NOT_ADMITTED",
    canonicalPatternGroupIds: Object.freeze([G5A_U07_P05F6_GROUP_ID]),
    canonicalPatternSpecIds: G5A_U07_P05F6_SPEC_IDS,
    patternGroupIds: Object.freeze([G5A_U07_P05F6_GROUP_ID]),
    patternSpecIds: G5A_U07_P05F6_SPEC_IDS,
    requiredCapabilityIds: G5A_U07_P05F6_REQUIRED_CAPABILITY_IDS,
    qaStatusLabel: "P05F6_G5A_U07_SOURCE_BACKED_DIAGRAM",
    productionUse: "full_product_w5_slice006_candidate",
  }),
]);

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
export function listG5AU07P05F6SelectorRows() { return clone(G5A_U07_P05F6_SELECTOR_ROWS); }
export function getG5AU07P05F6SelectorRow(id) { return clone(id === G5A_U07_P05F6_KP_ID ? G5A_U07_P05F6_SELECTOR_ROWS[0] : null); }
export function listG5AU07P05F6PatternGroups(id) { return clone(id === G5A_U07_P05F6_KP_ID ? G5A_U07_P05F6_PATTERN_GROUPS : []); }
export function resolveG5AU07P05F6PatternSpecIds(id) { return clone(id === G5A_U07_P05F6_KP_ID ? G5A_U07_P05F6_SPEC_IDS : []); }
export function auditG5AU07P05F6SelectorProjection() {
  const errors = [];
  if (G5A_U07_P05F6_SELECTOR_ROWS.length !== 1 || G5A_U07_P05F6_PATTERN_GROUPS.length !== 1 || G5A_U07_P05F6_PATTERN_SPECS.length !== 3) errors.push("P05F6_CARDINALITY_INVALID");
  const relations = new Set(G5A_U07_P05F6_PATTERN_SPECS.map((row) => row.relation));
  for (const relation of G5A_U07_P05F6_FORMAL_MAPPING.includedRelations) if (!relations.has(relation)) errors.push(`P05F6_RELATION_MISSING:${relation}`);
  if (G5A_U07_P05F6_PATTERN_SPECS.some((row) => row.questionMode !== "diagram" || row.requiresDiagramRepresentation !== true || row.applicationAllowed !== false || row.symmetryAxisCountAllowed !== false || row.symmetryAxisLocationOrConstructionAllowed !== false || row.symmetricPointDistanceAllowed !== false || row.completeSymmetricFigureAllowed !== false || row.coordinateReflectionAllowed !== false)) errors.push("P05F6_PATTERN_INVARIANT_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 1, patternGroups: 1, patternSpecs: 3, diagram: 3, application: 0 }) });
}
