export const P05F3_TASK_ID = "P05F_W5DirectProductVerticalSlice003Implementation";
export const G3B_U05_P05F3_SOURCE_ID = "g3b_u05_3b05";
export const G3B_U05_P05F3_UNIT_CODE = "3B-U05";
export const G3B_U05_P05F3_UNIT_TITLE = "面積與平方公分";
export const G3B_U05_P05F3_KP_ID = "kp_area_square_centimeter_unit";
export const G3B_U05_P05F3_GROUP_ID = "pg_g3b_u05_square_centimeter_area_unit";
export const G3B_U05_P05F3_FUTURE_KP_IDS = Object.freeze([
  "kp_area_grid_counting",
  "kp_area_conservation_cut_rearrange",
  "kp_irregular_grid_area",
  "kp_area_compare_same_perimeter",
]);
export const G3B_U05_P05F3_REQUIRED_CAPABILITY_IDS = Object.freeze([
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_formula_evaluation",
  "cap_geometry_property_reasoning",
]);
export const G3B_U05_P05F3_SPEC_IDS = Object.freeze([
  "ps_g3b_u05_identify_one_square_centimeter",
  "ps_g3b_u05_match_unit_square_to_one_square_centimeter",
  "ps_g3b_u05_distinguish_area_unit_from_length_unit",
  "ps_g3b_u05_recognize_cm2_as_square_centimeter_unit",
]);

const spec = (patternSpecId, relation, markerMode, answerDomain, sourceEvidenceTopic) => Object.freeze({
  patternSpecId,
  knowledgePointId: G3B_U05_P05F3_KP_ID,
  patternFamilyId: "SQUARE_CENTIMETER_AREA_UNIT_IDENTIFICATION",
  relation,
  markerMode,
  questionMode: "diagram",
  answerDomain,
  requiresDiagramRepresentation: true,
  applicationAllowed: false,
  gridCountingAllowed: false,
  areaFormulaAllowed: false,
  perimeterComputationAllowed: false,
  sourceEvidenceTopic,
});

export const G3B_U05_P05F3_PATTERN_SPECS = Object.freeze([
  spec(G3B_U05_P05F3_SPEC_IDS[0], "IDENTIFY_ONE_SQUARE_CENTIMETER", "UNIT_SQUARE", "ONE_SQUARE_CENTIMETER_VALUE_ZH", "邊長1公分正方形的面積是1平方公分"),
  spec(G3B_U05_P05F3_SPEC_IDS[1], "MATCH_ONE_CM_BY_ONE_CM_SQUARE_TO_ONE_CM2", "SHADED_UNIT_SQUARE", "ONE_SQUARE_CENTIMETER_UNIT_ZH", "1公分×1公分正方形與1平方公分面積單位"),
  spec(G3B_U05_P05F3_SPEC_IDS[2], "DISTINGUISH_AREA_UNIT_FROM_LENGTH_OR_PERIMETER_UNIT", "AREA_UNIT_BADGE", "AREA_UNIT_CLASS_ZH", "面積單位是二維覆蓋單位，不等同長度或周長單位"),
  spec(G3B_U05_P05F3_SPEC_IDS[3], "RECOGNIZE_CM2_AS_AREA_UNIT", "CM2_SYMBOL", "SQUARE_CENTIMETER_NAME_ZH", "平方公分面積單位符號辨識"),
]);

export const G3B_U05_P05F3_FORMAL_MAPPING = Object.freeze({
  mappingId: "fm_g3b_u05_square_centimeter_area_unit_p05f3",
  sourceId: G3B_U05_P05F3_SOURCE_ID,
  sourcePage: 1,
  knowledgePointId: G3B_U05_P05F3_KP_ID,
  canonicalNameZh: "平方公分面積單位",
  relationFamily: "SQUARE_CENTIMETER_AREA_UNIT_IDENTIFICATION",
  inputRepresentation: "ONE_CM_BY_ONE_CM_UNIT_SQUARE_DIAGRAM",
  answerDomain: Object.freeze(["1 平方公分", "面積單位", "平方公分"]),
  reasoningInvariant: "邊長1公分正方形的面積是1平方公分；面積單位由二維覆蓋形成，不等同長度或周長單位。",
  directSourceConcepts: Object.freeze([
    "ONE_CENTIMETER_BY_ONE_CENTIMETER_SQUARE",
    "ONE_SQUARE_CENTIMETER_AREA_UNIT",
    "AREA_AS_TWO_DIMENSIONAL_COVERAGE",
    "AREA_UNIT_DISTINCT_FROM_PERIMETER_UNIT",
  ]),
  learnerFacingVocabulary: Object.freeze(["公分", "平方公分", "面積", "面積單位"]),
  learnerFacingForbiddenVocabulary: Object.freeze(["長×寬", "周長公式", "數格子", "剪拼", "不規則圖形"]),
  includedRelations: Object.freeze([
    "IDENTIFY_ONE_SQUARE_CENTIMETER",
    "MATCH_ONE_CM_BY_ONE_CM_SQUARE_TO_ONE_CM2",
    "DISTINGUISH_AREA_UNIT_FROM_LENGTH_OR_PERIMETER_UNIT",
    "RECOGNIZE_CM2_AS_AREA_UNIT",
  ]),
  excludedRelations: Object.freeze([
    "COUNT_AREA_GRID_SQUARES",
    "COMPUTE_IRREGULAR_GRID_AREA",
    "CUT_REARRANGE_AREA_CONSERVATION",
    "COMPARE_AREA_UNDER_SAME_PERIMETER",
    "RECTANGLE_AREA_FORMULA",
    "SQUARE_AREA_FORMULA",
    "PERIMETER_COMPUTATION",
    "APPLICATION_CONTEXT",
  ]),
  applicationSuitability: "APPLICATION_COMPATIBLE",
  applicationContextSupportedByDirectPdf: false,
  applicationImplementationAllowed: false,
  requiredCapabilityIds: G3B_U05_P05F3_REQUIRED_CAPABILITY_IDS,
  patternSpecIds: G3B_U05_P05F3_SPEC_IDS,
});

export const G3B_U05_P05F3_PATTERN_GROUPS = Object.freeze([
  Object.freeze({
    patternGroupId: G3B_U05_P05F3_GROUP_ID,
    sourceId: G3B_U05_P05F3_SOURCE_ID,
    unitCode: G3B_U05_P05F3_UNIT_CODE,
    unitTitle: G3B_U05_P05F3_UNIT_TITLE,
    displayName: "平方公分面積單位圖形辨識",
    primaryKnowledgePointId: G3B_U05_P05F3_KP_ID,
    knowledgePointIds: Object.freeze([G3B_U05_P05F3_KP_ID]),
    supportClass: "A",
    mode: "diagram",
    publicQuestionMode: "diagram",
    representationTag: "square_centimeter_unit_diagram",
    representationTags: Object.freeze(["geometry", "area", "square_centimeter", "unit_square", "diagram_identification"]),
    patternSpecIds: G3B_U05_P05F3_SPEC_IDS,
    allocationPolicy: "balanced_square_centimeter_unit_relation",
    visibilityStatus: "visible",
    holdReason: null,
  }),
]);

export const G3B_U05_P05F3_SELECTOR_ROWS = Object.freeze([
  Object.freeze({
    knowledgePointId: G3B_U05_P05F3_KP_ID,
    sourceId: G3B_U05_P05F3_SOURCE_ID,
    unitCode: G3B_U05_P05F3_UNIT_CODE,
    unitTitle: G3B_U05_P05F3_UNIT_TITLE,
    displayName: "平方公分面積單位",
    canonicalNameZh: "平方公分面積單位",
    mode: "diagram",
    questionMode: "diagram",
    questionModes: Object.freeze(["diagram"]),
    supportClass: "A",
    visibilityStatus: "visible",
    selectorStatus: "visible",
    holdReason: null,
    applicationClassification: "DIAGRAM_ONLY_APPLICATION_COMPATIBLE_CONTEXT_NOT_ADMITTED",
    canonicalPatternGroupIds: Object.freeze([G3B_U05_P05F3_GROUP_ID]),
    canonicalPatternSpecIds: G3B_U05_P05F3_SPEC_IDS,
    patternGroupIds: Object.freeze([G3B_U05_P05F3_GROUP_ID]),
    patternSpecIds: G3B_U05_P05F3_SPEC_IDS,
    requiredCapabilityIds: G3B_U05_P05F3_REQUIRED_CAPABILITY_IDS,
    qaStatusLabel: "P05F3_G3B_U05_SOURCE_BACKED_DIAGRAM",
    productionUse: "full_product_w5_slice003_candidate",
  }),
]);

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
export function listG3BU05P05F3SelectorRows() { return clone(G3B_U05_P05F3_SELECTOR_ROWS); }
export function getG3BU05P05F3SelectorRow(id) { return clone(id === G3B_U05_P05F3_KP_ID ? G3B_U05_P05F3_SELECTOR_ROWS[0] : null); }
export function listG3BU05P05F3PatternGroups(id) { return clone(id === G3B_U05_P05F3_KP_ID ? G3B_U05_P05F3_PATTERN_GROUPS : []); }
export function resolveG3BU05P05F3PatternSpecIds(id) { return clone(id === G3B_U05_P05F3_KP_ID ? G3B_U05_P05F3_SPEC_IDS : []); }
export function auditG3BU05P05F3SelectorProjection() {
  const errors = [];
  if (G3B_U05_P05F3_SELECTOR_ROWS.length !== 1 || G3B_U05_P05F3_PATTERN_GROUPS.length !== 1 || G3B_U05_P05F3_PATTERN_SPECS.length !== 4) errors.push("P05F3_CARDINALITY_INVALID");
  const relations = new Set(G3B_U05_P05F3_PATTERN_SPECS.map((row) => row.relation));
  for (const relation of G3B_U05_P05F3_FORMAL_MAPPING.includedRelations) if (!relations.has(relation)) errors.push(`P05F3_RELATION_MISSING:${relation}`);
  if (G3B_U05_P05F3_PATTERN_SPECS.some((row) => row.questionMode !== "diagram" || row.requiresDiagramRepresentation !== true || row.applicationAllowed !== false || row.gridCountingAllowed !== false || row.areaFormulaAllowed !== false || row.perimeterComputationAllowed !== false)) errors.push("P05F3_PATTERN_INVARIANT_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 1, patternGroups: 1, patternSpecs: 4, diagram: 4, application: 0 }) });
}
