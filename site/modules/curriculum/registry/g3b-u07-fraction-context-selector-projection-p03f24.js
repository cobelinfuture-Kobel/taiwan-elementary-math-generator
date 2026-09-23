import { G3B_U07_SOURCE_ID, G3B_U07_UNIT_CODE, G3B_U07_UNIT_TITLE } from "./g3b-u07-quotient-fraction-selector-projection.js";

export const P03F24_TASK_ID = "P03F_W3DirectProductVerticalSlice024Implementation";
export const P03F24_REQUIRED_CAPABILITY_IDS = Object.freeze([
  "cap_fraction_arithmetic",
  "cap_fraction_domain_validator",
  "cap_fraction_number_system",
]);

const KP = Object.freeze({
  whole: "kp_g3b_u07_whole_and_fraction_add_sub",
  combined: "kp_g3b_u07_combined_fraction_context",
  plusCount: "kp_g3b_u07_fraction_plus_count_context",
  originalDifference: "kp_g3b_u07_original_or_difference_context",
});
export const G3B_U07_P03F24_KP_IDS = Object.freeze(Object.values(KP));

const groupId = (key, mode) => `pg_g3b_u07_${key}_${mode}`;
const roles = Object.freeze(["total", "original", "difference"]);
const specs = Object.freeze({
  [KP.whole]: Object.freeze({
    numeric: Object.freeze(["ps_g3b_u07_whole_and_fraction_add_sub_result_numeric"]),
    application: Object.freeze(["ps_g3b_u07_whole_and_fraction_add_sub_result_application"]),
  }),
  [KP.combined]: Object.freeze({
    numeric: Object.freeze(roles.map((r) => `ps_g3b_u07_combined_fraction_context_${r}_numeric`)),
    application: Object.freeze(roles.map((r) => `ps_g3b_u07_combined_fraction_context_${r}_application`)),
  }),
  [KP.plusCount]: Object.freeze({
    numeric: Object.freeze(roles.map((r) => `ps_g3b_u07_fraction_plus_count_context_${r}_numeric`)),
    application: Object.freeze(roles.map((r) => `ps_g3b_u07_fraction_plus_count_context_${r}_application`)),
  }),
  [KP.originalDifference]: Object.freeze({
    numeric: Object.freeze(roles.map((r) => `ps_g3b_u07_original_or_difference_context_${r}_numeric`)),
    application: Object.freeze(roles.map((r) => `ps_g3b_u07_original_or_difference_context_${r}_application`)),
  }),
});
export const G3B_U07_P03F24_PATTERN_SPEC_IDS = Object.freeze(G3B_U07_P03F24_KP_IDS.flatMap((id) => [...specs[id].numeric, ...specs[id].application]));
export const G3B_U07_P03F24_NUMERIC_SPEC_IDS = Object.freeze(G3B_U07_P03F24_KP_IDS.flatMap((id) => specs[id].numeric));
export const G3B_U07_P03F24_APPLICATION_SPEC_IDS = Object.freeze(G3B_U07_P03F24_KP_IDS.flatMap((id) => specs[id].application));

const info = Object.freeze({
  [KP.whole]: Object.freeze({ key: "whole_and_fraction_add_sub", name: "整數與分數加減", operationFamilyId: "fraction_add_sub", operationModelId: "op_g3b_u07_whole_and_fraction_add_sub", classification: "APPLICATION_COMPATIBLE", unknownRoles: Object.freeze(["result"]) }),
  [KP.combined]: Object.freeze({ key: "combined_fraction_context", name: "同一整體的分數合併", operationFamilyId: "fraction_context_total", operationModelId: "op_g3b_u07_combined_fraction_context", classification: "APPLICATION_REQUIRED", unknownRoles: roles }),
  [KP.plusCount]: Object.freeze({ key: "fraction_plus_count_context", name: "分數量與絕對個數合併", operationFamilyId: "fraction_context_total", operationModelId: "op_g3b_u07_fraction_plus_count_context", classification: "APPLICATION_REQUIRED", unknownRoles: roles }),
  [KP.originalDifference]: Object.freeze({ key: "original_or_difference_context", name: "由已用、剩餘或差量求未知", operationFamilyId: "fraction_context_total", operationModelId: "op_g3b_u07_original_or_difference_context", classification: "APPLICATION_REQUIRED", unknownRoles: roles }),
});

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
};

export const G3B_U07_P03F24_PATTERN_GROUPS = freeze(G3B_U07_P03F24_KP_IDS.flatMap((knowledgePointId) => {
  const meta = info[knowledgePointId];
  return ["numeric", "application"].map((mode) => ({
    patternGroupId: groupId(meta.key, mode),
    sourceId: G3B_U07_SOURCE_ID,
    unitCode: G3B_U07_UNIT_CODE,
    unitTitle: G3B_U07_UNIT_TITLE,
    displayName: `${meta.name}｜${mode === "numeric" ? "數字題" : "應用題"}`,
    primaryKnowledgePointId: knowledgePointId,
    knowledgePointIds: [knowledgePointId],
    supportClass: "A",
    mode,
    publicQuestionMode: mode,
    representationTag: meta.key,
    representationTags: ["fraction", meta.operationFamilyId, meta.key, mode],
    patternSpecIds: [...specs[knowledgePointId][mode]],
    allocationPolicy: "balanced_by_pattern_spec",
    visibilityStatus: "visible",
    holdReason: null,
  }));
}));

export const G3B_U07_P03F24_KNOWLEDGE_POINT_ROWS = freeze(G3B_U07_P03F24_KP_IDS.map((knowledgePointId) => {
  const meta = info[knowledgePointId];
  const groups = G3B_U07_P03F24_PATTERN_GROUPS.filter((group) => group.primaryKnowledgePointId === knowledgePointId);
  return {
    knowledgePointId,
    sourceId: G3B_U07_SOURCE_ID,
    unitCode: G3B_U07_UNIT_CODE,
    unitTitle: G3B_U07_UNIT_TITLE,
    displayName: meta.name,
    canonicalNameZh: meta.name,
    mode: "mixed",
    questionMode: "numeric",
    questionModes: ["numeric", "application"],
    supportClass: "A",
    visibilityStatus: "visible",
    selectorStatus: "visible",
    holdReason: null,
    applicationClassification: meta.classification,
    canonicalPatternGroupIds: groups.map((group) => group.patternGroupId),
    canonicalPatternSpecIds: [...specs[knowledgePointId].numeric, ...specs[knowledgePointId].application],
    patternGroupIds: groups.map((group) => group.patternGroupId),
    patternSpecIds: [...specs[knowledgePointId].numeric, ...specs[knowledgePointId].application],
    qaStatusLabel: "P03F24_SLICE024_AUTHORITY_FROZEN",
    productionUse: "full_product_w3_slice024_candidate",
  };
}));

export const G3B_U07_P03F24_SELECTOR_PROJECTION = freeze({
  taskId: P03F24_TASK_ID,
  sourceId: G3B_U07_SOURCE_ID,
  status: "FINAL_FOUR_W3_KPS_ADDED_TO_EXISTING_PUBLIC_SOURCE",
  knowledgePointCount: 4,
  patternGroupCount: 8,
  patternSpecCount: 20,
  numericPatternSpecCount: 10,
  applicationPatternSpecCount: 10,
  publicSelectionEnabled: true,
  sharedPipelineRequired: true,
  applicationModeRequired: true,
  expectedSourceVisibleCountAfterAdmission: 8,
  expectedSourceHiddenCountAfterAdmission: 0,
  expectedPublicSourceCountAfterAdmission: 29,
});

export function listG3BU07P03F24SelectorRows() { return clone(G3B_U07_P03F24_KNOWLEDGE_POINT_ROWS); }
export function getG3BU07P03F24SelectorRow(id) { return clone(G3B_U07_P03F24_KNOWLEDGE_POINT_ROWS.find((row) => row.knowledgePointId === id) ?? null); }
export function listG3BU07P03F24PatternGroups(id) { return clone(G3B_U07_P03F24_PATTERN_GROUPS.filter((group) => group.primaryKnowledgePointId === id)); }
export function resolveG3BU07P03F24PatternSpecIds(id, mode = null) {
  const groups = G3B_U07_P03F24_PATTERN_GROUPS.filter((group) => group.primaryKnowledgePointId === id && (mode == null || group.publicQuestionMode === mode));
  return clone(groups.flatMap((group) => group.patternSpecIds));
}
export function getG3BU07P03F24DefinitionMetadata(id) { return clone(info[id] ?? null); }
export function getG3BU07P03F24SpecSet(id) { return clone(specs[id] ?? null); }

export function auditG3BU07P03F24SelectorProjection() {
  const errors = [];
  if (G3B_U07_P03F24_KNOWLEDGE_POINT_ROWS.length !== 4) errors.push("P03F24_KP_COUNT_INVALID");
  if (G3B_U07_P03F24_PATTERN_GROUPS.length !== 8) errors.push("P03F24_GROUP_COUNT_INVALID");
  if (G3B_U07_P03F24_PATTERN_SPEC_IDS.length !== 20 || new Set(G3B_U07_P03F24_PATTERN_SPEC_IDS).size !== 20) errors.push("P03F24_SPEC_COUNT_INVALID");
  if (G3B_U07_P03F24_NUMERIC_SPEC_IDS.length !== 10 || G3B_U07_P03F24_APPLICATION_SPEC_IDS.length !== 10) errors.push("P03F24_MODE_PARITY_INVALID");
  if (G3B_U07_P03F24_PATTERN_GROUPS.some((group) => group.patternSpecIds.length === 0)) errors.push("P03F24_EMPTY_GROUP");
  if (G3B_U07_P03F24_KNOWLEDGE_POINT_ROWS.some((row) => row.questionModes.join(",") !== "numeric,application")) errors.push("P03F24_QUESTION_MODES_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 4, patternGroups: 8, patternSpecs: 20, numeric: 10, application: 10 }) });
}
