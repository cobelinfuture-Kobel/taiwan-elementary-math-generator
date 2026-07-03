export const WORKSHEET_MODES = Object.freeze({
  BATCH_A_SOURCE: "batchASource"
});

function positiveInteger(value, fallback, min = 1, max = 200) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export function createConfigState(options = {}) {
  const queryState = options.queryState ?? {};
  return {
    worksheetMode: WORKSHEET_MODES.BATCH_A_SOURCE,
    batchA: {
      sourceId: queryState.sourceId ?? "g3a_u02_3a02",
      questionCount: positiveInteger(queryState.questionCount, 20),
      ordering: queryState.ordering ?? "groupedByPattern",
      includeAnswerKey: queryState.includeAnswerKey !== false,
      generationSeed: queryState.generationSeed ?? "batch-a-browser",
      columns: positiveInteger(queryState.columns, 4, 1, 6),
      rowsPerPage: positiveInteger(queryState.rowsPerPage, 10, 1, 20)
    },
    lastWorksheetDocument: null,
    lastValidation: null
  };
}

export function setBatchASourceId(state, sourceId) {
  state.batchA.sourceId = sourceId;
  return state;
}

export function setBatchAQuestionCount(state, questionCount) {
  state.batchA.questionCount = positiveInteger(questionCount, state.batchA.questionCount);
  return state;
}

export function setBatchAOrdering(state, ordering) {
  state.batchA.ordering = ["groupedByPattern", "shuffleAcrossPatterns"].includes(ordering) ? ordering : "groupedByPattern";
  return state;
}

export function setBatchAIncludeAnswerKey(state, includeAnswerKey) {
  state.batchA.includeAnswerKey = Boolean(includeAnswerKey);
  return state;
}

export function setBatchAGenerationSeed(state, generationSeed) {
  state.batchA.generationSeed = String(generationSeed ?? "batch-a-browser");
  return state;
}

export function setBatchAPrintLayout(state, patch = {}) {
  if (patch.columns !== undefined) {
    state.batchA.columns = positiveInteger(patch.columns, state.batchA.columns, 1, 6);
  }
  if (patch.rowsPerPage !== undefined) {
    state.batchA.rowsPerPage = positiveInteger(patch.rowsPerPage, state.batchA.rowsPerPage, 1, 20);
  }
  return state;
}

export function getBatchAWorksheetPlan(state) {
  return {
    sourceId: state.batchA.sourceId,
    questionCount: state.batchA.questionCount,
    ordering: state.batchA.ordering,
    includeAnswerKey: state.batchA.includeAnswerKey,
    generationSeed: state.batchA.generationSeed,
    printLayout: {
      columns: state.batchA.columns,
      rowsPerPage: state.batchA.rowsPerPage,
      showAnswerKeyPage: state.batchA.includeAnswerKey
    }
  };
}

export function storeWorksheetResult(state, result) {
  state.lastWorksheetDocument = result?.worksheetDocument ?? null;
  state.lastValidation = result?.validation ?? null;
  return state;
}
