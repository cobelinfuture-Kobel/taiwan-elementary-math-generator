export const P05F9_TASK_ID = "P05F_W5DirectProductVerticalSlice009Implementation";
export const G5B_U10A_P05F9_SOURCE_ID = "g5b_u10_5b10a";
export const G5B_U10A_P05F9_UNIT_CODE = "5B-U10A";
export const G5B_U10A_P05F9_UNIT_TITLE = "生活中的大單位";
export const G5B_U10A_P05F9_KP_ID = "kp_g5b_u10a_large_area_unit_identity";
export const G5B_U10A_P05F9_GROUP_ID = "pg_g5b_u10a_large_area_unit_identity";
export const G5B_U10A_P05F9_EXISTING_VISIBLE_KP_IDS = Object.freeze([
  "kp_g5b_u10a_metric_ton_kilogram_conversion",
]);
export const G5B_U10A_P05F9_FUTURE_KP_IDS = Object.freeze([
  "kp_g5b_u10a_hectare_square_meter_conversion",
  "kp_g5b_u10a_square_kilometer_hectare_conversion",
  "kp_g5b_u10a_large_unit_estimation_application",
]);
export const G5B_U10A_P05F9_REQUIRED_CAPABILITY_IDS = Object.freeze([
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_formula_evaluation",
  "cap_geometry_property_reasoning",
]);
export const G5B_U10A_P05F9_SPEC_IDS = Object.freeze([
  "ps_g5b_u10a_recognize_large_area_units",
  "ps_g5b_u10a_select_large_area_unit_by_scale",
  "ps_g5b_u10a_distinguish_area_unit_from_length_unit",
]);

const spec = (patternSpecId, relation, diagramMode, sourceEvidenceTopic) => Object.freeze({
  patternSpecId,
  knowledgePointId: G5B_U10A_P05F9_KP_ID,
  patternFamilyId: "LARGE_AREA_UNIT_IDENTITY",
  relation,
  diagramMode,
  questionMode: "diagram",
  answerDomain: "LARGE_AREA_UNIT_ZH",
  requiresGeometryDiagramRepresentation: true,
  conversionArithmeticAllowed: false,
  formulaArithmeticAllowed: false,
  metricTonAllowed: false,
  estimationApplicationAllowed: false,
  applicationAllowed: false,
  sourceEvidenceTopic,
});

export const G5B_U10A_P05F9_PATTERN_SPECS = Object.freeze([
  spec(G5B_U10A_P05F9_SPEC_IDS[0], "RECOGNIZE_ARE_HECTARE_SQUARE_KILOMETER_AS_AREA_UNITS", "RECOGNIZE_AREA_UNIT", "辨認公畝、公頃、平方公里為土地或地區面積的大單位"),
  spec(G5B_U10A_P05F9_SPEC_IDS[1], "SELECT_LARGE_AREA_UNIT_BY_LAND_OR_REGION_SCALE", "SELECT_UNIT_BY_SCALE", "依土地或地區面積尺度選擇適合的大面積單位"),
  spec(G5B_U10A_P05F9_SPEC_IDS[2], "DISTINGUISH_LARGE_AREA_UNIT_FROM_LENGTH_UNIT", "DISTINGUISH_AREA_LENGTH_UNIT", "辨認面積單位並避免與長度單位混用"),
]);

export const G5B_U10A_P05F9_FORMAL_MAPPING = Object.freeze({
  mappingId: "fm_g5b_u10a_large_area_unit_identity_p05f9",
  sourceId: G5B_U10A_P05F9_SOURCE_ID,
  sourcePages: Object.freeze([1]),
  knowledgePointId: G5B_U10A_P05F9_KP_ID,
  canonicalNameZh: "公畝公頃平方公里辨識",
  relationFamily: "LARGE_AREA_UNIT_IDENTITY",
  inputRepresentation: "BOUNDED_LARGE_AREA_UNIT_SCALE_DIAGRAM",
  answerDomain: Object.freeze(["公畝", "公頃", "平方公里"]),
  reasoningInvariant: "單位選擇須符合面積尺度，不能與長度單位混用。",
  directSourceConcepts: Object.freeze([
    "ARE_HECTARE_SQUARE_KILOMETER_AS_LARGE_AREA_UNITS",
    "LAND_OR_REGION_AREA_UNIT_SCALE_FIT",
    "AREA_UNIT_DISTINCT_FROM_LENGTH_UNIT",
  ]),
  learnerFacingVocabulary: Object.freeze(["公畝", "公頃", "平方公里", "面積單位", "長度單位", "土地尺度", "地區範圍"]),
  learnerFacingForbiddenVocabulary: Object.freeze(["平方公尺換算", "公頃換算", "平方公里換算", "公噸", "公斤", "估測應用", "面積公式"]),
  includedRelations: Object.freeze([
    "RECOGNIZE_ARE_HECTARE_SQUARE_KILOMETER_AS_AREA_UNITS",
    "SELECT_LARGE_AREA_UNIT_BY_LAND_OR_REGION_SCALE",
    "DISTINGUISH_LARGE_AREA_UNIT_FROM_LENGTH_UNIT",
  ]),
  excludedRelations: Object.freeze([
    "HECTARE_SQUARE_METER_CONVERSION",
    "SQUARE_KILOMETER_HECTARE_CONVERSION",
    "METRIC_TON_KILOGRAM_CONVERSION",
    "LARGE_UNIT_ESTIMATION_APPLICATION",
    "AREA_UNIT_CONVERSION_ARITHMETIC",
    "AREA_FORMULA_CALCULATION",
    "APPLICATION_CONTEXT",
  ]),
  applicationSuitability: "APPLICATION_COMPATIBLE",
  applicationContextSupportedByDirectPdf: false,
  applicationImplementationAllowed: false,
  frozenProfileId: "profile_geometry_formula",
  frozenProfileCategoryMismatchAcknowledged: true,
  requiredCapabilityIds: G5B_U10A_P05F9_REQUIRED_CAPABILITY_IDS,
  patternSpecIds: G5B_U10A_P05F9_SPEC_IDS,
});

export const G5B_U10A_P05F9_PATTERN_GROUPS = Object.freeze([
  Object.freeze({
    patternGroupId: G5B_U10A_P05F9_GROUP_ID,
    sourceId: G5B_U10A_P05F9_SOURCE_ID,
    unitCode: G5B_U10A_P05F9_UNIT_CODE,
    unitTitle: G5B_U10A_P05F9_UNIT_TITLE,
    displayName: "大面積單位辨識圖形題",
    primaryKnowledgePointId: G5B_U10A_P05F9_KP_ID,
    knowledgePointIds: Object.freeze([G5B_U10A_P05F9_KP_ID]),
    supportClass: "A",
    mode: "diagram",
    publicQuestionMode: "diagram",
    representationTag: "large_area_unit_scale_diagram",
    representationTags: Object.freeze(["measurement", "area_unit", "large_area", "scale_fit", "diagram_identification"]),
    patternSpecIds: G5B_U10A_P05F9_SPEC_IDS,
    allocationPolicy: "balanced_large_area_unit_relation",
    visibilityStatus: "visible",
    holdReason: null,
  }),
]);

export const G5B_U10A_P05F9_SELECTOR_ROWS = Object.freeze([
  Object.freeze({
    knowledgePointId: G5B_U10A_P05F9_KP_ID,
    sourceId: G5B_U10A_P05F9_SOURCE_ID,
    unitCode: G5B_U10A_P05F9_UNIT_CODE,
    unitTitle: G5B_U10A_P05F9_UNIT_TITLE,
    displayName: "公畝公頃平方公里辨識",
    canonicalNameZh: "公畝公頃平方公里辨識",
    mode: "diagram",
    questionMode: "diagram",
    questionModes: Object.freeze(["diagram"]),
    supportClass: "A",
    visibilityStatus: "visible",
    selectorStatus: "visible",
    holdReason: null,
    applicationClassification: "DIAGRAM_ONLY_APPLICATION_COMPATIBLE_CONTEXT_NOT_ADMITTED",
    canonicalPatternGroupIds: Object.freeze([G5B_U10A_P05F9_GROUP_ID]),
    canonicalPatternSpecIds: G5B_U10A_P05F9_SPEC_IDS,
    patternGroupIds: Object.freeze([G5B_U10A_P05F9_GROUP_ID]),
    patternSpecIds: G5B_U10A_P05F9_SPEC_IDS,
    requiredCapabilityIds: G5B_U10A_P05F9_REQUIRED_CAPABILITY_IDS,
    qaStatusLabel: "P05F9_G5B_U10A_SOURCE_BACKED_LARGE_AREA_UNIT_IDENTITY_DIAGRAM",
    productionUse: "full_product_w5_slice009_candidate",
  }),
]);

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
export function listG5BU10AP05F9SelectorRows() { return clone(G5B_U10A_P05F9_SELECTOR_ROWS); }
export function getG5BU10AP05F9SelectorRow(id) { return clone(id === G5B_U10A_P05F9_KP_ID ? G5B_U10A_P05F9_SELECTOR_ROWS[0] : null); }
export function listG5BU10AP05F9PatternGroups(id) { return clone(id === G5B_U10A_P05F9_KP_ID ? G5B_U10A_P05F9_PATTERN_GROUPS : []); }
export function resolveG5BU10AP05F9PatternSpecIds(id) { return clone(id === G5B_U10A_P05F9_KP_ID ? G5B_U10A_P05F9_SPEC_IDS : []); }
export function auditG5BU10AP05F9SelectorProjection() {
  const errors = [];
  if (G5B_U10A_P05F9_SELECTOR_ROWS.length !== 1 || G5B_U10A_P05F9_PATTERN_GROUPS.length !== 1 || G5B_U10A_P05F9_PATTERN_SPECS.length !== 3) errors.push("P05F9_CARDINALITY_INVALID");
  const relations = new Set(G5B_U10A_P05F9_PATTERN_SPECS.map((row) => row.relation));
  for (const relation of G5B_U10A_P05F9_FORMAL_MAPPING.includedRelations) if (!relations.has(relation)) errors.push(`P05F9_RELATION_MISSING:${relation}`);
  if (G5B_U10A_P05F9_PATTERN_SPECS.some((row) => row.questionMode !== "diagram" || row.requiresGeometryDiagramRepresentation !== true || row.conversionArithmeticAllowed !== false || row.formulaArithmeticAllowed !== false || row.metricTonAllowed !== false || row.estimationApplicationAllowed !== false || row.applicationAllowed !== false)) errors.push("P05F9_PATTERN_INVARIANT_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 1, patternGroups: 1, patternSpecs: 3, diagram: 3, application: 0 }) });
}
