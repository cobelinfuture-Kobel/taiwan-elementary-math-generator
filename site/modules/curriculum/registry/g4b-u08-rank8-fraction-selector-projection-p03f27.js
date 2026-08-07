import { G4B_U08_SOURCE_ID, G4B_U08_UNIT_CODE, G4B_U08_UNIT_TITLE } from "./g4b-u08-equivalent-fraction-selector-projection.js";

export const P03F27_TASK_ID = "P03F_W3DirectProductVerticalSlice027Implementation";
export const G4B_U08_P03F27_SOURCE_ID = G4B_U08_SOURCE_ID;
export const G4B_U08_P03F27_KP_IDS = Object.freeze([
  "kp_g4b_u08_fraction_compare_cross_product",
  "kp_g4b_u08_unlike_denominator_add_sub",
]);
export const G4B_U08_P03F27_NUMERIC_PATTERN_SPEC_IDS = Object.freeze([
  "ps_g4b_u08_fraction_compare_cross_product_comparison_numeric",
  "ps_g4b_u08_unlike_denominator_add_sub_result_numeric",
]);
export const G4B_U08_P03F27_HIDDEN_APPLICATION_SPEC_IDS = Object.freeze([
  "ps_g4b_u08_fraction_compare_cross_product_comparison_application",
  "ps_g4b_u08_unlike_denominator_add_sub_result_application",
]);

const SPEC_BY_KP = Object.freeze({
  kp_g4b_u08_fraction_compare_cross_product: Object.freeze(["ps_g4b_u08_fraction_compare_cross_product_comparison_numeric"]),
  kp_g4b_u08_unlike_denominator_add_sub: Object.freeze(["ps_g4b_u08_unlike_denominator_add_sub_result_numeric"]),
});
const GROUP_BY_KP = Object.freeze({
  kp_g4b_u08_fraction_compare_cross_product: "pg_g4b_u08_fraction_compare_cross_product_numeric",
  kp_g4b_u08_unlike_denominator_add_sub: "pg_g4b_u08_unlike_denominator_add_sub_numeric",
});
const NAME_BY_KP = Object.freeze({
  kp_g4b_u08_fraction_compare_cross_product: "異分母分數比較",
  kp_g4b_u08_unlike_denominator_add_sub: "異分母分數加減",
});
const TAG_BY_KP = Object.freeze({
  kp_g4b_u08_fraction_compare_cross_product: "unlike_fraction_compare",
  kp_g4b_u08_unlike_denominator_add_sub: "unlike_fraction_add_sub",
});
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const freeze = (value) => { if (!value || typeof value !== "object" || Object.isFrozen(value)) return value; for (const nested of Object.values(value)) freeze(nested); return Object.freeze(value); };

export const G4B_U08_P03F27_PATTERN_GROUPS = freeze(G4B_U08_P03F27_KP_IDS.map((knowledgePointId) => ({
  patternGroupId: GROUP_BY_KP[knowledgePointId],
  sourceId: G4B_U08_P03F27_SOURCE_ID,
  unitCode: G4B_U08_UNIT_CODE,
  unitTitle: G4B_U08_UNIT_TITLE,
  displayName: NAME_BY_KP[knowledgePointId],
  primaryKnowledgePointId: knowledgePointId,
  knowledgePointIds: [knowledgePointId],
  supportClass: "A",
  mode: "numeric",
  publicQuestionMode: "numeric",
  representationTags: ["fraction", TAG_BY_KP[knowledgePointId], "exact_rational"],
  patternSpecIds: SPEC_BY_KP[knowledgePointId],
  allocationPolicy: "single_pattern_spec",
  visibilityStatus: "visible",
  holdReason: null,
})));

export const G4B_U08_P03F27_SELECTOR_ROWS = freeze(G4B_U08_P03F27_KP_IDS.map((knowledgePointId) => ({
  knowledgePointId,
  sourceId: G4B_U08_P03F27_SOURCE_ID,
  unitCode: G4B_U08_UNIT_CODE,
  unitTitle: G4B_U08_UNIT_TITLE,
  displayName: NAME_BY_KP[knowledgePointId],
  canonicalNameZh: NAME_BY_KP[knowledgePointId],
  mode: "numeric",
  questionMode: "numeric",
  questionModes: ["numeric"],
  supportClass: "A",
  visibilityStatus: "visible",
  selectorStatus: "visible",
  holdReason: null,
  applicationClassification: "APPLICATION_COMPATIBLE",
  canonicalPatternGroupIds: [GROUP_BY_KP[knowledgePointId]],
  canonicalPatternSpecIds: SPEC_BY_KP[knowledgePointId],
  patternGroupIds: [GROUP_BY_KP[knowledgePointId]],
  patternSpecIds: SPEC_BY_KP[knowledgePointId],
  qaStatusLabel: "P03F27_SLICE027_AUTHORITY_FROZEN",
  productionUse: "full_product_w3_slice027_candidate",
})));

export const G4B_U08_P03F27_SELECTOR_PROJECTION = freeze({
  taskId: P03F27_TASK_ID,
  sourceId: G4B_U08_P03F27_SOURCE_ID,
  status: "TWO_RANK8_FRACTION_KPS_ADDED_TO_EXISTING_PUBLIC_SOURCE",
  knowledgePointCount: 2,
  patternGroupCount: 2,
  patternSpecCount: 2,
  numericPatternSpecCount: 2,
  applicationPatternSpecCount: 0,
  hiddenApplicationPatternSpecIds: G4B_U08_P03F27_HIDDEN_APPLICATION_SPEC_IDS,
  publicSelectionEnabled: true,
  sharedPipelineRequired: true,
  applicationModeAllowed: false,
  expectedSourceVisibleCountAfterAdmission: 5,
  expectedSourceHiddenCountAfterAdmission: 2,
  expectedPublicSourceCountAfterAdmission: 29,
  expectedPublicKnowledgePointCountAfterAdmission: 218,
});

export function listG4BU08P03F27SelectorRows(){ return clone(G4B_U08_P03F27_SELECTOR_ROWS); }
export function getG4BU08P03F27SelectorRow(id){ return clone(G4B_U08_P03F27_SELECTOR_ROWS.find((row) => row.knowledgePointId === id) ?? null); }
export function listG4BU08P03F27PatternGroups(id){ return clone(G4B_U08_P03F27_PATTERN_GROUPS.filter((group) => group.primaryKnowledgePointId === id)); }
export function resolveG4BU08P03F27PatternSpecIds(id){ return clone(SPEC_BY_KP[id] ?? []); }
export function auditG4BU08P03F27SelectorProjection(){
  const errors=[];
  if(G4B_U08_P03F27_SELECTOR_ROWS.length!==2) errors.push("P03F27_KP_COUNT_INVALID");
  if(G4B_U08_P03F27_PATTERN_GROUPS.length!==2) errors.push("P03F27_GROUP_COUNT_INVALID");
  if(G4B_U08_P03F27_NUMERIC_PATTERN_SPEC_IDS.length!==2 || new Set(G4B_U08_P03F27_NUMERIC_PATTERN_SPEC_IDS).size!==2) errors.push("P03F27_SPEC_COUNT_INVALID");
  if(G4B_U08_P03F27_PATTERN_GROUPS.some((group)=>group.publicQuestionMode!=="numeric")) errors.push("P03F27_APPLICATION_MODE_LEAK");
  if(G4B_U08_P03F27_SELECTOR_ROWS.some((row)=>row.patternSpecIds.some((id)=>G4B_U08_P03F27_HIDDEN_APPLICATION_SPEC_IDS.includes(id)))) errors.push("P03F27_HIDDEN_APPLICATION_SPEC_LEAK");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:2,patternGroups:2,patternSpecs:2,numeric:2,application:0})});
}
