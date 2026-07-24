import {
  BATCH_A_SELECTOR_AVAILABILITY,
  getVisibleBatchAKnowledgePoint as getBaseVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint as getBaseVisiblePatternGroupsForKnowledgePoint
} from "../../../modules/curriculum/registry/batch-a-selector-candidates.js";
import {
  getVisibleBatchAKnowledgePoint as getLatestVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint as getLatestVisiblePatternGroupsForKnowledgePoint
} from "../../../modules/curriculum/registry/batch-a-selector-extension.js";
import {
  G4B_U04_PUBLIC_CONTROLS,
  G4B_U04_SOURCE_ID,
} from "../../../modules/curriculum/registry/g4b-u04-promotion.js";
import { G5A_U08_SOURCE_ID } from "../../../modules/curriculum/registry/g5a-u08-promotion.js";
import {
  getPublicControlProfile,
  normalizePublicControlValue,
} from "../../../modules/curriculum/registry/public-control-profiles.js";
import {
  listW01PublicApplicationGroupsForKnowledgePoint,
} from "../../../modules/curriculum/registry/w01-public-application-groups.js";

const SOURCE_UNIT_SELECTION_MODE = "sourceUnit";
const G4A_U08_SOURCE_ID = "g4a_u08_4a08";
const LATEST_QUERY_SELECTOR_SOURCE_IDS = Object.freeze(new Set([
  "g3b_u04_3b04", "g3b_u08_3b08", "g4b_u01_4b01", "g5a_u02_5a02",
  G4A_U08_SOURCE_ID, G4B_U04_SOURCE_ID, G5A_U08_SOURCE_ID,
]));
const LATEST_FIRST_QUERY_SELECTOR_SOURCE_IDS = Object.freeze(new Set([
  G4A_U08_SOURCE_ID,
  "g5a_u02_5a02",
]));
const KP_SELECTION_MODES = Object.freeze([
  "singleKnowledgePoint", "mixedKnowledgePointsSameUnit", "mixedKnowledgePointsCrossUnit"
]);
const VALID_SELECTION_MODES = Object.freeze([SOURCE_UNIT_SELECTION_MODE, ...KP_SELECTION_MODES]);

const G3A_U03_WORD_PROBLEM = Object.freeze({
  sourceId: "g3a_u03_3a03",
  knowledgePointId: "kp_g3a_u03_consecutive_multiplication_two_step_word_problem",
  patternGroupId: "pg_g3a_u03_consecutive_multiplication_two_step_word_problem",
  patternSpecId: "ps_g3a_u03_consecutive_multiplication_two_step_word_problem",
  displayName: "兩步驟連續乘法應用題"
});

function integerParam(params, key, fallback) {
  const value = params.get(key);
  if (value === null) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : fallback;
}
function normalizeIdList(values) {
  return [...new Set(values.flatMap((value) => String(value ?? "").split(",").map((item) => item.trim()).filter(Boolean)))];
}
function queryIdArray(params, key) { return normalizeIdList(params.getAll(key)); }
function warning(code, details = {}) { return { code, ...details }; }

function approvedLatestKnowledgePoint(knowledgePointId) {
  const latest = getLatestVisibleBatchAKnowledgePoint(knowledgePointId);
  return latest && LATEST_QUERY_SELECTOR_SOURCE_IDS.has(latest.sourceId) ? latest : null;
}
function getVisibleBatchAKnowledgePoint(knowledgePointId) {
  const latest = approvedLatestKnowledgePoint(knowledgePointId);
  if (latest && LATEST_FIRST_QUERY_SELECTOR_SOURCE_IDS.has(latest.sourceId)) return latest;
  const base = getBaseVisibleBatchAKnowledgePoint(knowledgePointId);
  if (base) return base;
  if (latest) return latest;
  if (knowledgePointId !== G3A_U03_WORD_PROBLEM.knowledgePointId) return null;
  return {
    knowledgePointId: G3A_U03_WORD_PROBLEM.knowledgePointId,
    sourceId: G3A_U03_WORD_PROBLEM.sourceId,
    displayName: G3A_U03_WORD_PROBLEM.displayName,
    patternGroupIds: [G3A_U03_WORD_PROBLEM.patternGroupId],
    patternSpecIds: [G3A_U03_WORD_PROBLEM.patternSpecId]
  };
}
function getVisiblePatternGroupsForKnowledgePoint(knowledgePointId) {
  const latest = approvedLatestKnowledgePoint(knowledgePointId);
  const w01Groups = listW01PublicApplicationGroupsForKnowledgePoint(knowledgePointId);
  if (latest && LATEST_FIRST_QUERY_SELECTOR_SOURCE_IDS.has(latest.sourceId)) {
    return [...getLatestVisiblePatternGroupsForKnowledgePoint(knowledgePointId), ...w01Groups];
  }
  const baseGroups = getBaseVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
  if (baseGroups.length > 0) return [...baseGroups, ...w01Groups];
  if (latest) return [...getLatestVisiblePatternGroupsForKnowledgePoint(knowledgePointId), ...w01Groups];
  if (knowledgePointId !== G3A_U03_WORD_PROBLEM.knowledgePointId) return [];
  return [{
    patternGroupId: G3A_U03_WORD_PROBLEM.patternGroupId,
    sourceId: G3A_U03_WORD_PROBLEM.sourceId,
    primaryKnowledgePointId: G3A_U03_WORD_PROBLEM.knowledgePointId,
    knowledgePointIds: [G3A_U03_WORD_PROBLEM.knowledgePointId],
    patternSpecIds: [G3A_U03_WORD_PROBLEM.patternSpecId],
    visibilityStatus: "visible"
  }];
}
function defaultSelectorAccess() {
  return {
    getSelectorAvailability: () => BATCH_A_SELECTOR_AVAILABILITY,
    getVisibleBatchAKnowledgePoint,
    getVisiblePatternGroupsForKnowledgePoint
  };
}
function resolveSelectorAccess(options = {}) {
  const defaults = defaultSelectorAccess();
  const override = options.selectorAccess ?? {};
  return {
    getSelectorAvailability: typeof override.getSelectorAvailability === "function" ? override.getSelectorAvailability : defaults.getSelectorAvailability,
    getVisibleBatchAKnowledgePoint: typeof override.getVisibleBatchAKnowledgePoint === "function" ? override.getVisibleBatchAKnowledgePoint : defaults.getVisibleBatchAKnowledgePoint,
    getVisiblePatternGroupsForKnowledgePoint: typeof override.getVisiblePatternGroupsForKnowledgePoint === "function" ? override.getVisiblePatternGroupsForKnowledgePoint : defaults.getVisiblePatternGroupsForKnowledgePoint
  };
}
function visiblePatternGroupIdsFor(selectorAccess, knowledgePointIds) {
  const ids = new Set();
  for (const knowledgePointId of knowledgePointIds) {
    for (const group of selectorAccess.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)) {
      if (group?.patternGroupId) ids.add(group.patternGroupId);
    }
  }
  return ids;
}

function normalizeSelectorQueryState(params, sourceId, selectorAccess) {
  const requestedMode = params.get("selectionMode") ?? SOURCE_UNIT_SELECTION_MODE;
  const requestedKnowledgePointIds = queryIdArray(params, "kp");
  const requestedPatternGroupIds = queryIdArray(params, "pg");
  const availability = selectorAccess.getSelectorAvailability();
  const warnings = [];
  if ((availability?.visibleCount ?? 0) <= 0) {
    if (requestedMode !== SOURCE_UNIT_SELECTION_MODE || requestedKnowledgePointIds.length > 0 || requestedPatternGroupIds.length > 0) {
      warnings.push(warning("no_visible_knowledge_points", { sourceId }));
      warnings.push(warning("selector_mode_fallback", { from: requestedMode, to: SOURCE_UNIT_SELECTION_MODE }));
      if (requestedKnowledgePointIds.length + requestedPatternGroupIds.length > 0) warnings.push(warning("selector_id_dropped", { count: requestedKnowledgePointIds.length + requestedPatternGroupIds.length }));
    }
    return { selectionMode: SOURCE_UNIT_SELECTION_MODE, selectedKnowledgePointIds: [], selectedPatternGroupIds: [], selectorWarnings: warnings };
  }
  let selectionMode = VALID_SELECTION_MODES.includes(requestedMode) ? requestedMode : SOURCE_UNIT_SELECTION_MODE;
  if (selectionMode === SOURCE_UNIT_SELECTION_MODE) {
    if (requestedKnowledgePointIds.length + requestedPatternGroupIds.length > 0) warnings.push(warning("selector_id_dropped", { count: requestedKnowledgePointIds.length + requestedPatternGroupIds.length }));
    return { selectionMode, selectedKnowledgePointIds: [], selectedPatternGroupIds: [], selectorWarnings: warnings };
  }
  const sourceScopedMode = selectionMode !== "mixedKnowledgePointsCrossUnit";
  const selectedKnowledgePointIds = requestedKnowledgePointIds.filter((id) => {
    const row = selectorAccess.getVisibleBatchAKnowledgePoint(id);
    return row && (!sourceScopedMode || !sourceId || row.sourceId === sourceId);
  });
  if (selectedKnowledgePointIds.length !== requestedKnowledgePointIds.length) warnings.push(warning("selector_id_dropped", { field: "knowledgePointIds", count: requestedKnowledgePointIds.length - selectedKnowledgePointIds.length }));
  if ((selectionMode === "singleKnowledgePoint" && selectedKnowledgePointIds.length !== 1) || (selectionMode === "mixedKnowledgePointsSameUnit" && selectedKnowledgePointIds.length < 2)) {
    warnings.push(warning("selector_mode_fallback", { from: selectionMode, to: SOURCE_UNIT_SELECTION_MODE }));
    return { selectionMode: SOURCE_UNIT_SELECTION_MODE, selectedKnowledgePointIds: [], selectedPatternGroupIds: [], selectorWarnings: warnings };
  }
  const visiblePatternGroupIds = visiblePatternGroupIdsFor(selectorAccess, selectedKnowledgePointIds);
  const selectedPatternGroupIds = requestedPatternGroupIds.filter((id) => visiblePatternGroupIds.has(id));
  if (selectedPatternGroupIds.length !== requestedPatternGroupIds.length) warnings.push(warning("selector_id_dropped", { field: "patternGroupIds", count: requestedPatternGroupIds.length - selectedPatternGroupIds.length }));
  return { selectionMode, selectedKnowledgePointIds, selectedPatternGroupIds, selectorWarnings: warnings };
}

function normalizeUnitPublicControls(params, sourceId) {
  const profile = getPublicControlProfile(sourceId);
  const output = {};
  if (profile?.questionTypeControl.supported) output.questionMode = normalizePublicControlValue(profile, "questionTypeControl", params.get("questionMode"));
  if (profile?.reasoningDepthControl.supported) output.depthMode = normalizePublicControlValue(profile, "reasoningDepthControl", params.get("depthMode"));
  if (profile?.contextControl.supported) output.contextMode = normalizePublicControlValue(profile, "contextControl", params.get("contextMode"));
  if (sourceId === G4B_U04_SOURCE_ID) {
    const requestedLayoutMode = params.get("layoutMode");
    output.layoutMode = G4B_U04_PUBLIC_CONTROLS.layoutModes.includes(requestedLayoutMode)
      ? requestedLayoutMode
      : G4B_U04_PUBLIC_CONTROLS.defaults.layoutMode;
  }
  return output;
}

export function parseQueryState(search = window.location.search, options = {}) {
  const params = new URLSearchParams(search);
  const sourceId = params.get("sourceId") ?? undefined;
  return {
    sourceId,
    questionCount: integerParam(params, "questionCount", undefined),
    ordering: params.get("ordering") ?? undefined,
    includeAnswerKey: params.get("answerKey") === null ? undefined : params.get("answerKey") === "1",
    generationSeed: params.get("generationSeed") ?? undefined,
    columns: integerParam(params, "columns", undefined),
    rowsPerPage: integerParam(params, "rowsPerPage", undefined),
    ...normalizeUnitPublicControls(params, sourceId),
    ...normalizeSelectorQueryState(params, sourceId, resolveSelectorAccess(options))
  };
}

export function writeQueryStateFromState(state) {
  const nextUrl = new URL(window.location.href);
  nextUrl.search = "";
  nextUrl.searchParams.set("sourceId", state.batchA.sourceId);
  nextUrl.searchParams.set("questionCount", String(state.batchA.questionCount));
  nextUrl.searchParams.set("ordering", state.batchA.ordering);
  nextUrl.searchParams.set("answerKey", state.batchA.includeAnswerKey ? "1" : "0");
  nextUrl.searchParams.set("generationSeed", state.batchA.generationSeed);
  nextUrl.searchParams.set("columns", String(state.batchA.columns));
  nextUrl.searchParams.set("rowsPerPage", String(state.batchA.rowsPerPage));
  const profile = getPublicControlProfile(state.batchA.sourceId);
  if (profile?.questionTypeControl.supported) nextUrl.searchParams.set("questionMode", state.batchA.questionMode ?? profile.questionTypeControl.defaultValue);
  if (profile?.reasoningDepthControl.supported) nextUrl.searchParams.set("depthMode", state.batchA.depthMode ?? profile.reasoningDepthControl.defaultValue);
  if (profile?.contextControl.supported) nextUrl.searchParams.set("contextMode", state.batchA.contextMode ?? profile.contextControl.defaultValue);
  if (state.batchA.sourceId === G4B_U04_SOURCE_ID) {
    nextUrl.searchParams.set("layoutMode", state.batchA.layoutMode ?? G4B_U04_PUBLIC_CONTROLS.defaults.layoutMode);
  }
  if (KP_SELECTION_MODES.includes(state.batchA.selectionMode)) {
    nextUrl.searchParams.set("selectionMode", state.batchA.selectionMode);
    for (const knowledgePointId of state.batchA.selectedKnowledgePointIds ?? []) nextUrl.searchParams.append("kp", knowledgePointId);
    for (const patternGroupId of state.batchA.selectedPatternGroupIds ?? []) nextUrl.searchParams.append("pg", patternGroupId);
  }
  window.history.replaceState({}, "", nextUrl);
}
