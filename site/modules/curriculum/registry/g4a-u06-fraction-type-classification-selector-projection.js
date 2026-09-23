export const G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID = "g4a_u06_4a06";
export const G4A_U06_UNIT_CODE = "4A-U06";
export const G4A_U06_UNIT_TITLE = "假分數與帶分數";
export const G4A_U06_FRACTION_CLASSIFICATION_KP_ID = "kp_fraction_true_improper_mixed_classification";
export const G4A_U06_FRACTION_CLASSIFICATION_GROUP_ID = "pg_g4a_u06_fraction_type_classification_numeric";
export const G4A_U06_FRACTION_CLASSIFICATION_PATTERN_SPEC_IDS = Object.freeze([
  "ps_g4a_u06_classify_proper_fraction",
  "ps_g4a_u06_classify_improper_fraction",
  "ps_g4a_u06_classify_mixed_number",
]);

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
};

export const G4A_U06_FRACTION_CLASSIFICATION_PATTERN_GROUPS = freeze([
  {
    patternGroupId: G4A_U06_FRACTION_CLASSIFICATION_GROUP_ID,
    sourceId: G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
    unitCode: G4A_U06_UNIT_CODE,
    unitTitle: G4A_U06_UNIT_TITLE,
    displayName: "真分數、假分數與帶分數分類",
    primaryKnowledgePointId: G4A_U06_FRACTION_CLASSIFICATION_KP_ID,
    knowledgePointIds: [G4A_U06_FRACTION_CLASSIFICATION_KP_ID],
    supportClass: "A",
    mode: "numeric",
    publicQuestionMode: "numeric",
    representationTag: "fraction_type_classification",
    representationTags: ["fraction", "proper_fraction", "improper_fraction", "mixed_number", "classification"],
    patternSpecIds: G4A_U06_FRACTION_CLASSIFICATION_PATTERN_SPEC_IDS,
    allocationPolicy: "balanced_across_three_fraction_types",
    visibilityStatus: "visible",
    holdReason: null,
  },
]);

export const G4A_U06_FRACTION_CLASSIFICATION_ROWS = freeze([
  {
    knowledgePointId: G4A_U06_FRACTION_CLASSIFICATION_KP_ID,
    sourceId: G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
    unitCode: G4A_U06_UNIT_CODE,
    unitTitle: G4A_U06_UNIT_TITLE,
    displayName: "真分數、假分數與帶分數分類",
    canonicalNameZh: "真分數、假分數與帶分數分類",
    mode: "numeric",
    questionMode: "numeric",
    questionModes: ["numeric"],
    supportClass: "A",
    visibilityStatus: "visible",
    selectorStatus: "visible",
    holdReason: null,
    applicationClassification: "APPLICATION_NOT_APPLICABLE",
    canonicalPatternGroupIds: [G4A_U06_FRACTION_CLASSIFICATION_GROUP_ID],
    canonicalPatternSpecIds: G4A_U06_FRACTION_CLASSIFICATION_PATTERN_SPEC_IDS,
    patternGroupIds: [G4A_U06_FRACTION_CLASSIFICATION_GROUP_ID],
    patternSpecIds: G4A_U06_FRACTION_CLASSIFICATION_PATTERN_SPEC_IDS,
    qaStatusLabel: "P03F_SLICE017_CANDIDATE",
    productionUse: "full_product_w3_slice017_candidate",
  },
]);

export const G4A_U06_FRACTION_CLASSIFICATION_SELECTOR_PROJECTION = freeze({
  taskId: "P03F_W3DirectProductVerticalSlice017Implementation",
  sourceId: G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
  status: "ONE_W3_KP_NUMERIC_PUBLIC_D0_CANDIDATE",
  knowledgePointCount: 1,
  patternGroupCount: 1,
  patternSpecCount: 3,
  excludedKnowledgePointIds: [
    "kp_fraction_improper_mixed_integer_conversion",
    "kp_fraction_improper_mixed_compare_order",
    "kp_fraction_improper_mixed_number_line",
    "kp_fraction_same_denominator_mixed_add_sub",
    "kp_g4a_u06_fraction_times_integer_quantity"
  ],
  publicSelectionEnabled: true,
  sharedPipelineRequired: true,
  applicationModeAllowed: false,
});

export function listG4AU06FractionClassificationSelectorRows() { return clone(G4A_U06_FRACTION_CLASSIFICATION_ROWS); }
export function getG4AU06FractionClassificationSelectorRow(id) { return clone(G4A_U06_FRACTION_CLASSIFICATION_ROWS.find((row) => row.knowledgePointId === id) ?? null); }
export function listG4AU06FractionClassificationPatternGroups(id) { return clone(G4A_U06_FRACTION_CLASSIFICATION_PATTERN_GROUPS.filter((row) => row.primaryKnowledgePointId === id)); }
export function resolveG4AU06FractionClassificationPatternSpecIds(id) {
  return listG4AU06FractionClassificationPatternGroups(id).flatMap((row) => row.patternSpecIds);
}
export function auditG4AU06FractionClassificationSelectorProjection() {
  const errors = [];
  if (G4A_U06_FRACTION_CLASSIFICATION_ROWS.length !== 1) errors.push("P03F17_KP_COUNT_INVALID");
  if (G4A_U06_FRACTION_CLASSIFICATION_PATTERN_GROUPS.length !== 1) errors.push("P03F17_GROUP_COUNT_INVALID");
  if (G4A_U06_FRACTION_CLASSIFICATION_PATTERN_SPEC_IDS.length !== 3) errors.push("P03F17_SPEC_COUNT_INVALID");
  if (G4A_U06_FRACTION_CLASSIFICATION_PATTERN_GROUPS.some((row) => row.publicQuestionMode !== "numeric")) errors.push("P03F17_APPLICATION_MODE_LEAK");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 1, patternGroups: 1, patternSpecs: 3 }) });
}
