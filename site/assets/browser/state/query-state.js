import {
  BATCH_A_SELECTOR_AVAILABILITY,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint
} from "../../../modules/curriculum/registry/batch-a-selector-extension.js";

const SOURCE_UNIT_SELECTION_MODE = "sourceUnit";
const KP_SELECTION_MODES = Object.freeze([
  "singleKnowledgePoint",
  "mixedKnowledgePointsSameUnit",
  "mixedKnowledgePointsCrossUnit"
]);
const VALID_SELECTION_MODES = Object.freeze([SOURCE_UNIT_SELECTION_MODE, ...KP_SELECTION_MODES]);

function integerParam(params, key, fallback) {
  const value = params.get(key);
  if (value === null) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : fallback;
}

function normalizeIdList(values) {
  return [...new Set(values.flatMap((value) => String(value ?? "").split(",").map((item) => item.trim()).filter(Boolean)))];
}

function queryIdArray(params, key) {
  return normalizeIdList(params.getAll(key));
}

function warning(code, details = {}) {
  return { code, ...details };
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
      if (requestedKnowledgePointIds.length + requestedPatternGroupIds.length > 0) {
        warnings.push(warning("selector_id_dropped", { count: requestedKnowledgePointIds.length + requestedPatternGroupIds.length }));
      }
    }
    return { selectionMode: SOURCE_UNIT_SELECTION_MODE, selectedKnowledgePointIds: [], selectedPatternGroupIds: [], selectorWarnings: warnings };
  }

  let selectionMode = VALID_SELECTION_MODES.includes(requestedMode) ? requestedMode : SOURCE_UNIT_SELECTION_MODE;
  if (selectionMode === SOURCE_UNIT_SELECTION_MODE) {
    if (requestedKnowledgePointIds.length + requestedPatternGroupIds.length > 0) {
      warnings.push(warning("selector_id_dropped", { count: requestedKnowledgePointIds.length + requestedPatternGroupIds.length }));
    }
    return { selectionMode, selectedKnowledgePointIds: [], selectedPatternGroupIds: [], selectorWarnings: warnings };
  }

  const selectedKnowledgePointIds = requestedKnowledgePointIds.filter((id) => selectorAccess.getVisibleBatchAKnowledgePoint(id));
  if (selectedKnowledgePointIds.length !== requestedKnowledgePointIds.length) {
    warnings.push(warning("selector_id_dropped", { field: "knowledgePointIds", count: requestedKnowledgePointIds.length - selectedKnowledgePointIds.length }));
  }

  if ((selectionMode === "singleKnowledgePoint" && selectedKnowledgePointIds.length !== 1) || (selectionMode === "mixedKnowledgePointsSameUnit" && selectedKnowledgePointIds.length < 2)) {
    warnings.push(warning("selector_mode_fallback", { from: selectionMode, to: SOURCE_UNIT_SELECTION_MODE }));
    return { selectionMode: SOURCE_UNIT_SELECTION_MODE, selectedKnowledgePointIds: [], selectedPatternGroupIds: [], selectorWarnings: warnings };
  }

  const visiblePatternGroupIds = visiblePatternGroupIdsFor(selectorAccess, selectedKnowledgePointIds);
  const selectedPatternGroupIds = requestedPatternGroupIds.filter((id) => visiblePatternGroupIds.has(id));
  if (selectedPatternGroupIds.length !== requestedPatternGroupIds.length) {
    warnings.push(warning("selector_id_dropped", { field: "patternGroupIds", count: requestedPatternGroupIds.length - selectedPatternGroupIds.length }));
  }

  return { selectionMode, selectedKnowledgePointIds, selectedPatternGroupIds, selectorWarnings: warnings };
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
  if (KP_SELECTION_MODES.includes(state.batchA.selectionMode)) {
    nextUrl.searchParams.set("selectionMode", state.batchA.selectionMode);
    for (const knowledgePointId of state.batchA.selectedKnowledgePointIds ?? []) nextUrl.searchParams.append("kp", knowledgePointId);
    for (const patternGroupId of state.batchA.selectedPatternGroupIds ?? []) nextUrl.searchParams.append("pg", patternGroupId);
  }
  window.history.replaceState({}, "", nextUrl);
}
