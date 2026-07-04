const SOURCE_UNIT_SELECTION_MODE = "sourceUnit";
const KP_SELECTION_MODES = Object.freeze([
  "singleKnowledgePoint",
  "mixedKnowledgePointsSameUnit",
  "mixedKnowledgePointsCrossUnit"
]);

function integerParam(params, key, fallback) {
  const value = params.get(key);
  if (value === null) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : fallback;
}

function selectorWarningsForCurrentAvailability(params, sourceId) {
  const requestedMode = params.get("selectionMode");
  const requestedKp = params.get("kp");
  const requestedPg = params.get("pg");

  if (!KP_SELECTION_MODES.includes(requestedMode) && !requestedKp && !requestedPg) {
    return [];
  }

  const warnings = [];

  if (requestedMode && requestedMode !== SOURCE_UNIT_SELECTION_MODE) {
    warnings.push({
      code: "no_visible_knowledge_points",
      sourceId
    });
    warnings.push({
      code: "selector_mode_fallback",
      from: requestedMode,
      to: SOURCE_UNIT_SELECTION_MODE
    });
  }

  const droppedIdCount = [requestedKp, requestedPg]
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .length;

  if (droppedIdCount > 0) {
    warnings.push({
      code: "selector_id_dropped",
      count: droppedIdCount
    });
  }

  return warnings;
}

export function parseQueryState(search = window.location.search) {
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
    selectionMode: SOURCE_UNIT_SELECTION_MODE,
    selectedKnowledgePointIds: [],
    selectedPatternGroupIds: [],
    selectorWarnings: selectorWarningsForCurrentAvailability(params, sourceId)
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
  window.history.replaceState({}, "", nextUrl);
}
