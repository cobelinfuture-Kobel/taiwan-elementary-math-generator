import {
  BATCH_A_SELECTOR_AVAILABILITY,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint
} from "../../../modules/curriculum/registry/batch-a-selector-candidates.js";

const SOURCE_UNIT_SELECTION_MODE = "sourceUnit";
const KP_SELECTION_MODES = Object.freeze([
  "singleKnowledgePoint",
  "mixedKnowledgePointsSameUnit",
  "mixedKnowledgePointsCrossUnit"
]);
const VALID_SELECTION_MODES = Object.freeze([SOURCE_UNIT_SELECTION_MODE, ...KP_SELECTION_MODES]);

const DEFAULT_SELECTOR_ACCESS = Object.freeze({
  getSelectorAvailability: () => BATCH_A_SELECTOR_AVAILABILITY,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint
});

function resolveSelectorAccess(options = {}) {
  const override = options.selectorAccess ?? {};
  return {
    getSelectorAvailability: typeof override.getSelectorAvailability === "function"
      ? override.getSelectorAvailability
      : DEFAULT_SELECTOR_ACCESS.getSelectorAvailability,
    getVisibleBatchAKnowledgePoint: typeof override.getVisibleBatchAKnowledgePoint === "function"
      ? override.getVisibleBatchAKnowledgePoint
      : DEFAULT_SELECTOR_ACCESS.getVisibleBatchAKnowledgePoint,
    getVisiblePatternGroupsForKnowledgePoint: typeof override.getVisiblePatternGroupsForKnowledgePoint === "function"
      ? override.getVisiblePatternGroupsForKnowledgePoint
      : DEFAULT_SELECTOR_ACCESS.getVisiblePatternGroupsForKnowledgePoint
  };
}

function integerParam(params, key, fallback) {
  const value = params.get(key);
  if (value === null) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : fallback;
}

function normalizeIdList(values) {
  return [...new Set(values.flatMap((value) => String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)))];
}

function queryIdArray(params, key) {
  return normalizeIdList(params.getAll(key));
}

function createWarning(code, details = {}) {
  return { code, ...details };
}

function getVisiblePatternGroupIdSet(selectorAccess, knowledgePointIds) {
  const ids = new Set();
  for (const knowledgePointId of knowledgePointIds) {
    for (const group of selectorAccess.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)) {
      if (group?.patternGroupId) ids.add(group.patternGroupId);
    }
  }
  return ids;
}

function selectorWarningsForZeroVisible(params, sourceId) {
  const requestedMode = params.get("selectionMode");
  const requestedKpIds = queryIdArray(params, "kp");
  const requestedPgIds = queryIdArray(params, "pg");

  if (!KP_SELECTION_MODES.includes(requestedMode) && requestedKpIds.length === 0 && requestedPgIds.length === 0) {
    return [];
  }

  const warnings = [];

  if (requestedMode && requestedMode !== SOURCE_UNIT_SELECTION_MODE) {
    warnings.push(createWarning("no_visible_knowledge_points", { sourceId }));
    warnings.push(createWarning("selector_mode_fallback", {
      from: requestedMode,
      to: SOURCE_UNIT_SELECTION_MODE
    }));
  }

  const droppedIdCount = requestedKpIds.length + requestedPgIds.length;
  if (droppedIdCount > 0) {
    warnings.push(createWarning("selector_id_dropped", { count: droppedIdCount }));
  }

  return warnings;
}

function normalizeSelectorQueryState(params, sourceId, selectorAccess) {
  const requestedMode = params.get("selectionMode") ?? SOURCE_UNIT_SELECTION_MODE;
  const requestedKnowledgePointIds = queryIdArray(params, "kp");
  const requestedPatternGroupIds = queryIdArray(params, "pg");
  const availability = selectorAccess.getSelectorAvailability();

  if ((availability?.visibleCount ?? 0) <= 0) {
    return {
      selectionMode: SOURCE_UNIT_SELECTION_MODE,
      selectedKnowledgePointIds: [],
      selectedPatternGroupIds: [],
      selectorWarnings: selectorWarningsForZeroVisible(params, sourceId)
    };
  }

  const warnings = [];
  let selectionMode = VALID_SELECTION_MODES.includes(requestedMode)
    ? requestedMode
    : SOURCE_UNIT_SELECTION_MODE;

  if (requestedMode && !VALID_SELECTION_MODES.includes(requestedMode)) {
    warnings.push(createWarning("selector_mode_fallback", {
      from: requestedMode,
      to: SOURCE_UNIT_SELECTION_MODE
    }));
  }

  if (selectionMode === SOURCE_UNIT_SELECTION_MODE) {
    const droppedIdCount = requestedKnowledgePointIds.length + requestedPatternGroupIds.length;
    if (droppedIdCount > 0) {
      warnings.push(createWarning("selector_id_dropped", { count: droppedIdCount }));
    }
    return {
      selectionMode,
      selectedKnowledgePointIds: [],
      selectedPatternGroupIds: [],
      selectorWarnings: warnings
    };
  }

  const selectedKnowledgePointIds = requestedKnowledgePointIds
    .filter((knowledgePointId) => selectorAccess.getVisibleBatchAKnowledgePoint(knowledgePointId));
  const droppedKnowledgePointCount = requestedKnowledgePointIds.length - selectedKnowledgePointIds.length;
  if (droppedKnowledgePointCount > 0) {
    warnings.push(createWarning("selector_id_dropped", {
      field: "knowledgePointIds",
      count: droppedKnowledgePointCount
    }));
  }

  if (
    (selectionMode === "singleKnowledgePoint" && selectedKnowledgePointIds.length !== 1) ||
    (selectionMode === "mixedKnowledgePointsSameUnit" && selectedKnowledgePointIds.length < 2)
  ) {
    warnings.push(createWarning("selector_mode_fallback", {
      from: selectionMode,
      to: SOURCE_UNIT_SELECTION_MODE
    }));
    return {
      selectionMode: SOURCE_UNIT_SELECTION_MODE,
      selectedKnowledgePointIds: [],
      selectedPatternGroupIds: [],
      selectorWarnings: warnings
    };
  }

  const visiblePatternGroupIds = getVisiblePatternGroupIdSet(selectorAccess, selectedKnowledgePointIds);
  const selectedPatternGroupIds = requestedPatternGroupIds.filter((patternGroupId) => visiblePatternGroupIds.has(patternGroupId));
  const droppedPatternGroupCount = requestedPatternGroupIds.length - selectedPatternGroupIds.length;
  if (droppedPatternGroupCount > 0) {
    warnings.push(createWarning("selector_id_dropped", {
      field: "patternGroupIds",
      count: droppedPatternGroupCount
    }));
  }

  return {
    selectionMode,
    selectedKnowledgePointIds,
    selectedPatternGroupIds,
    selectorWarnings: warnings
  };
}

export function parseQueryState(search = window.location.search, options = {}) {
  const params = new URLSearchParams(search);
  const sourceId = params.get("sourceId") ?? undefined;
  const selectorAccess = resolveSelectorAccess(options);
  const selectorState = normalizeSelectorQueryState(params, sourceId, selectorAccess);

  return {
    sourceId,
    questionCount: integerParam(params, "questionCount", undefined),
    ordering: params.get("ordering") ?? undefined,
    includeAnswerKey: params.get("answerKey") === null ? undefined : params.get("answerKey") === "1",
    generationSeed: params.get("generationSeed") ?? undefined,
    columns: integerParam(params, "columns", undefined),
    rowsPerPage: integerParam(params, "rowsPerPage", undefined),
    ...selectorState
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
    for (const knowledgePointId of state.batchA.selectedKnowledgePointIds ?? []) {
      nextUrl.searchParams.append("kp", knowledgePointId);
    }
    for (const patternGroupId of state.batchA.selectedPatternGroupIds ?? []) {
      nextUrl.searchParams.append("pg", patternGroupId);
    }
  }

  window.history.replaceState({}, "", nextUrl);
}
