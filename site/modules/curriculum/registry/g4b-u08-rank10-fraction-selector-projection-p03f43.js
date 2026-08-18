import { G4B_U08_SOURCE_ID, G4B_U08_UNIT_CODE, G4B_U08_UNIT_TITLE } from "./g4b-u08-equivalent-fraction-selector-projection.js";

export const P03F43_TASK_ID = "P03F_W3DirectProductVerticalSlice043Implementation";
export const G4B_U08_P03F43_SOURCE_ID = G4B_U08_SOURCE_ID;
export const G4B_U08_P03F43_UNIT_CODE = G4B_U08_UNIT_CODE;
export const G4B_U08_P03F43_UNIT_TITLE = G4B_U08_UNIT_TITLE;

export const G4B_U08_P03F43_NUMBER_LINE_KP_ID = "kp_g4b_u08_fraction_number_line_distance";
export const G4B_U08_P03F43_BOUNDS_KP_ID = "kp_g4b_u08_mixed_fraction_order_constraints";
export const G4B_U08_P03F43_NUMBER_LINE_GROUP_ID = "pg_g4b_u08_fraction_number_line_distance_numeric";
export const G4B_U08_P03F43_BOUNDS_GROUP_ID = "pg_g4b_u08_mixed_fraction_order_constraints_numeric";
export const G4B_U08_P03F43_COORDINATE_SPEC_ID = "ps_g4b_u08_fraction_number_line_distance_coordinate_numeric";
export const G4B_U08_P03F43_DISTANCE_SPEC_ID = "ps_g4b_u08_fraction_number_line_distance_distance_numeric";
export const G4B_U08_P03F43_BOUNDS_SPEC_ID = "ps_g4b_u08_mixed_fraction_order_constraints_possible_values_numeric";
export const G4B_U08_P03F43_HIDDEN_APPLICATION_SPEC_ID = "ps_g4b_u08_mixed_fraction_order_constraints_possible_values_application";

export const P03F43_KP_IDS = Object.freeze([
  G4B_U08_P03F43_NUMBER_LINE_KP_ID,
  G4B_U08_P03F43_BOUNDS_KP_ID,
]);
export const P03F43_GROUP_IDS = Object.freeze([
  G4B_U08_P03F43_NUMBER_LINE_GROUP_ID,
  G4B_U08_P03F43_BOUNDS_GROUP_ID,
]);
export const P03F43_SPEC_IDS = Object.freeze([
  G4B_U08_P03F43_COORDINATE_SPEC_ID,
  G4B_U08_P03F43_DISTANCE_SPEC_ID,
  G4B_U08_P03F43_BOUNDS_SPEC_ID,
]);
export const P03F43_HIDDEN_APPLICATION_SPEC_IDS = Object.freeze([
  G4B_U08_P03F43_HIDDEN_APPLICATION_SPEC_ID,
]);
export const P03F43_HIDDEN_SIBLING_KP_IDS = Object.freeze([]);
export const P03F43_W3_CAPABILITY_IDS = Object.freeze([
  "cap_fraction_domain_validator",
  "cap_fraction_number_system",
]);
export const P03F43_NUMBER_LINE_REQUIRED_CAPABILITY_IDS = Object.freeze([
  ...P03F43_W3_CAPABILITY_IDS,
  "cap_number_line_representation",
]);
export const P03F43_BOUNDS_REQUIRED_CAPABILITY_IDS = P03F43_W3_CAPABILITY_IDS;

const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
};
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

export const G4B_U08_P03F43_PATTERN_GROUPS = freeze([
  {
    patternGroupId: G4B_U08_P03F43_NUMBER_LINE_GROUP_ID,
    sourceId: G4B_U08_P03F43_SOURCE_ID,
    unitCode: G4B_U08_P03F43_UNIT_CODE,
    unitTitle: G4B_U08_P03F43_UNIT_TITLE,
    displayName: "分數數線座標、移動與距離",
    primaryKnowledgePointId: G4B_U08_P03F43_NUMBER_LINE_KP_ID,
    knowledgePointIds: [G4B_U08_P03F43_NUMBER_LINE_KP_ID],
    supportClass: "A",
    mode: "numeric",
    publicQuestionMode: "numeric",
    representationTag: "fraction_number_line",
    representationTags: ["fraction", "number_line", "coordinate", "distance", "exact_rational"],
    patternSpecIds: [G4B_U08_P03F43_COORDINATE_SPEC_ID, G4B_U08_P03F43_DISTANCE_SPEC_ID],
    allocationPolicy: "round_robin",
    visibilityStatus: "visible",
    holdReason: null,
  },
  {
    patternGroupId: G4B_U08_P03F43_BOUNDS_GROUP_ID,
    sourceId: G4B_U08_P03F43_SOURCE_ID,
    unitCode: G4B_U08_P03F43_UNIT_CODE,
    unitTitle: G4B_U08_P03F43_UNIT_TITLE,
    displayName: "等值帶分數排序與界限",
    primaryKnowledgePointId: G4B_U08_P03F43_BOUNDS_KP_ID,
    knowledgePointIds: [G4B_U08_P03F43_BOUNDS_KP_ID],
    supportClass: "A",
    mode: "numeric",
    publicQuestionMode: "numeric",
    representationTag: "fraction_bounds",
    representationTags: ["fraction", "mixed_fraction", "bounds", "possible_values", "exact_rational"],
    patternSpecIds: [G4B_U08_P03F43_BOUNDS_SPEC_ID],
    allocationPolicy: "single_pattern_spec",
    visibilityStatus: "visible",
    holdReason: null,
  },
]);

export const G4B_U08_P03F43_SELECTOR_ROWS = freeze([
  {
    knowledgePointId: G4B_U08_P03F43_NUMBER_LINE_KP_ID,
    sourceId: G4B_U08_P03F43_SOURCE_ID,
    unitCode: G4B_U08_P03F43_UNIT_CODE,
    unitTitle: G4B_U08_P03F43_UNIT_TITLE,
    displayName: "分數數線座標、移動與距離",
    canonicalNameZh: "分數數線座標、移動與距離",
    mode: "numeric",
    questionMode: "numeric",
    questionModes: ["numeric"],
    supportClass: "A",
    visibilityStatus: "visible",
    selectorStatus: "visible",
    holdReason: null,
    applicationClassification: "APPLICATION_NOT_APPLICABLE",
    canonicalPatternGroupIds: [G4B_U08_P03F43_NUMBER_LINE_GROUP_ID],
    canonicalPatternSpecIds: [G4B_U08_P03F43_COORDINATE_SPEC_ID, G4B_U08_P03F43_DISTANCE_SPEC_ID],
    patternGroupIds: [G4B_U08_P03F43_NUMBER_LINE_GROUP_ID],
    patternSpecIds: [G4B_U08_P03F43_COORDINATE_SPEC_ID, G4B_U08_P03F43_DISTANCE_SPEC_ID],
    requiredCapabilityIds: P03F43_NUMBER_LINE_REQUIRED_CAPABILITY_IDS,
    hiddenApplicationPatternSpecIds: [],
    qaStatusLabel: "P03F43_Q043_FRACTION_NUMBER_LINE_AUTHORITY_FROZEN",
    productionUse: "full_product_w3_slice043_candidate",
  },
  {
    knowledgePointId: G4B_U08_P03F43_BOUNDS_KP_ID,
    sourceId: G4B_U08_P03F43_SOURCE_ID,
    unitCode: G4B_U08_P03F43_UNIT_CODE,
    unitTitle: G4B_U08_P03F43_UNIT_TITLE,
    displayName: "等值帶分數排序與界限",
    canonicalNameZh: "等值帶分數排序與界限",
    mode: "numeric",
    questionMode: "numeric",
    questionModes: ["numeric"],
    supportClass: "A",
    visibilityStatus: "visible",
    selectorStatus: "visible",
    holdReason: null,
    applicationClassification: "APPLICATION_COMPATIBLE",
    canonicalPatternGroupIds: [G4B_U08_P03F43_BOUNDS_GROUP_ID],
    canonicalPatternSpecIds: [G4B_U08_P03F43_BOUNDS_SPEC_ID],
    patternGroupIds: [G4B_U08_P03F43_BOUNDS_GROUP_ID],
    patternSpecIds: [G4B_U08_P03F43_BOUNDS_SPEC_ID],
    requiredCapabilityIds: P03F43_BOUNDS_REQUIRED_CAPABILITY_IDS,
    hiddenApplicationPatternSpecIds: P03F43_HIDDEN_APPLICATION_SPEC_IDS,
    qaStatusLabel: "P03F43_Q043_FRACTION_BOUNDS_NUMERIC_ONLY_AUTHORITY_FROZEN",
    productionUse: "full_product_w3_slice043_candidate",
  },
]);

export const G4B_U08_P03F43_SELECTOR_PROJECTION = freeze({
  taskId: P03F43_TASK_ID,
  sourceId: G4B_U08_P03F43_SOURCE_ID,
  status: "Q043_TWO_KP_RANK10_FRACTION_ALLOCATION_FROZEN_ON_EXISTING_PUBLIC_SOURCE",
  knowledgePointCount: 2,
  hiddenSiblingKnowledgePointCount: 0,
  patternGroupCount: 2,
  patternSpecCount: 3,
  numericPatternSpecCount: 3,
  applicationPatternSpecCount: 0,
  hiddenApplicationPatternSpecIds: P03F43_HIDDEN_APPLICATION_SPEC_IDS,
  publicSelectionEnabled: true,
  sharedPipelineRequired: true,
  sharedRendererRequired: true,
  numberLineRepresentationRequired: true,
  applicationModeAllowed: false,
  fractionArithmeticRequired: false,
  expectedSourceVisibleCountAfterAdmission: 7,
  expectedSourceHiddenCountAfterAdmission: 0,
  expectedSourceNotSelectableCountAfterAdmission: 0,
  expectedPublicSourceCountAfterAdmission: 33,
  expectedPublicKnowledgePointCountAfterAdmission: 243,
});

export function listG4BU08P03F43SelectorRows() { return clone(G4B_U08_P03F43_SELECTOR_ROWS); }
export function getG4BU08P03F43SelectorRow(id) { return clone(G4B_U08_P03F43_SELECTOR_ROWS.find((row) => row.knowledgePointId === id) ?? null); }
export function listG4BU08P03F43PatternGroups(id) { return clone(G4B_U08_P03F43_PATTERN_GROUPS.filter((group) => group.primaryKnowledgePointId === id)); }
export function resolveG4BU08P03F43PatternSpecIds(id) {
  return clone(G4B_U08_P03F43_PATTERN_GROUPS.find((group) => group.primaryKnowledgePointId === id)?.patternSpecIds ?? []);
}
export function auditG4BU08P03F43SelectorProjection() {
  const errors = [];
  if (G4B_U08_P03F43_SELECTOR_ROWS.length !== 2) errors.push("P03F43_KP_COUNT_INVALID");
  if (G4B_U08_P03F43_PATTERN_GROUPS.length !== 2) errors.push("P03F43_GROUP_COUNT_INVALID");
  if (P03F43_SPEC_IDS.length !== 3 || new Set(P03F43_SPEC_IDS).size !== 3) errors.push("P03F43_SPEC_COUNT_INVALID");
  if (G4B_U08_P03F43_PATTERN_GROUPS.some((group) => group.publicQuestionMode !== "numeric")) errors.push("P03F43_APPLICATION_MODE_LEAK");
  if (G4B_U08_P03F43_SELECTOR_ROWS.some((row) => row.patternSpecIds.some((id) => P03F43_HIDDEN_APPLICATION_SPEC_IDS.includes(id)))) errors.push("P03F43_HIDDEN_APPLICATION_SPEC_LEAK");
  if (!P03F43_NUMBER_LINE_REQUIRED_CAPABILITY_IDS.includes("cap_number_line_representation")) errors.push("P03F43_NUMBER_LINE_CAPABILITY_MISSING");
  if ([...P03F43_NUMBER_LINE_REQUIRED_CAPABILITY_IDS, ...P03F43_BOUNDS_REQUIRED_CAPABILITY_IDS].includes("cap_fraction_arithmetic")) errors.push("P03F43_FRACTION_ARITHMETIC_LEAK");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 2, hiddenSiblings: 0, patternGroups: 2, patternSpecs: 3, numeric: 3, application: 0 }) });
}
