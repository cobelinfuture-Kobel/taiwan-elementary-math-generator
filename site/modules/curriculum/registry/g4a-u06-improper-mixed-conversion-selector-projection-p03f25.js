import {
  G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
  G4A_U06_UNIT_CODE,
  G4A_U06_UNIT_TITLE,
} from "./g4a-u06-fraction-type-classification-selector-projection.js";

export const P03F25_TASK_ID = "P03F_W3DirectProductVerticalSlice025Implementation";
export const G4A_U06_P03F25_KP_ID = "kp_fraction_improper_mixed_integer_conversion";
export const G4A_U06_P03F25_GROUP_ID = "pg_g4a_u06_improper_mixed_integer_conversion_numeric";
export const G4A_U06_P03F25_PATTERN_SPEC_IDS = Object.freeze([
  "ps_g4a_u06_improper_to_mixed_or_integer",
  "ps_g4a_u06_mixed_to_improper_fraction",
  "ps_g4a_u06_integer_to_improper_fraction",
]);

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
};

export const G4A_U06_P03F25_PATTERN_GROUPS = freeze([
  {
    patternGroupId: G4A_U06_P03F25_GROUP_ID,
    sourceId: G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
    unitCode: G4A_U06_UNIT_CODE,
    unitTitle: G4A_U06_UNIT_TITLE,
    displayName: "假分數、帶分數與整數互換",
    primaryKnowledgePointId: G4A_U06_P03F25_KP_ID,
    knowledgePointIds: [G4A_U06_P03F25_KP_ID],
    supportClass: "A",
    mode: "numeric",
    publicQuestionMode: "numeric",
    representationTag: "improper_mixed_integer_conversion",
    representationTags: ["fraction", "improper_fraction", "mixed_number", "integer", "equivalent_representation"],
    patternSpecIds: G4A_U06_P03F25_PATTERN_SPEC_IDS,
    allocationPolicy: "balanced_across_three_conversion_directions",
    visibilityStatus: "visible",
    holdReason: null,
  },
]);

export const G4A_U06_P03F25_SELECTOR_ROWS = freeze([
  {
    knowledgePointId: G4A_U06_P03F25_KP_ID,
    sourceId: G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
    unitCode: G4A_U06_UNIT_CODE,
    unitTitle: G4A_U06_UNIT_TITLE,
    displayName: "假分數、帶分數與整數互換",
    canonicalNameZh: "假分數、帶分數與整數互換",
    mode: "numeric",
    questionMode: "numeric",
    questionModes: ["numeric"],
    supportClass: "A",
    visibilityStatus: "visible",
    selectorStatus: "visible",
    holdReason: null,
    applicationClassification: "APPLICATION_NOT_APPLICABLE",
    canonicalPatternGroupIds: [G4A_U06_P03F25_GROUP_ID],
    canonicalPatternSpecIds: G4A_U06_P03F25_PATTERN_SPEC_IDS,
    patternGroupIds: [G4A_U06_P03F25_GROUP_ID],
    patternSpecIds: G4A_U06_P03F25_PATTERN_SPEC_IDS,
    qaStatusLabel: "P03F25_SLICE025_AUTHORITY_FROZEN",
    productionUse: "full_product_w3_slice025_candidate",
  },
]);

export const G4A_U06_P03F25_SELECTOR_PROJECTION = freeze({
  taskId: P03F25_TASK_ID,
  sourceId: G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
  status: "SECOND_W3_KP_CONVERSION_ADDED_TO_EXISTING_PUBLIC_SOURCE",
  knowledgePointCount: 1,
  patternGroupCount: 1,
  patternSpecCount: 3,
  publicSelectionEnabled: true,
  sharedPipelineRequired: true,
  applicationModeAllowed: false,
  expectedSourceVisibleCountAfterAdmission: 2,
  expectedSourceHiddenCountAfterAdmission: 4,
  expectedPublicSourceCountAfterAdmission: 29,
});

export function listG4AU06P03F25SelectorRows() { return clone(G4A_U06_P03F25_SELECTOR_ROWS); }
export function getG4AU06P03F25SelectorRow(id) { return clone(G4A_U06_P03F25_SELECTOR_ROWS.find((row) => row.knowledgePointId === id) ?? null); }
export function listG4AU06P03F25PatternGroups(id) { return clone(G4A_U06_P03F25_PATTERN_GROUPS.filter((row) => row.primaryKnowledgePointId === id)); }
export function resolveG4AU06P03F25PatternSpecIds(id) { return id === G4A_U06_P03F25_KP_ID ? [...G4A_U06_P03F25_PATTERN_SPEC_IDS] : []; }
export function auditG4AU06P03F25SelectorProjection() {
  const errors = [];
  if (G4A_U06_P03F25_SELECTOR_ROWS.length !== 1) errors.push("P03F25_KP_COUNT_INVALID");
  if (G4A_U06_P03F25_PATTERN_GROUPS.length !== 1) errors.push("P03F25_GROUP_COUNT_INVALID");
  if (G4A_U06_P03F25_PATTERN_SPEC_IDS.length !== 3 || new Set(G4A_U06_P03F25_PATTERN_SPEC_IDS).size !== 3) errors.push("P03F25_SPEC_COUNT_INVALID");
  if (G4A_U06_P03F25_PATTERN_GROUPS.some((row) => row.publicQuestionMode !== "numeric")) errors.push("P03F25_APPLICATION_MODE_LEAK");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 1, patternGroups: 1, patternSpecs: 3 }) });
}
