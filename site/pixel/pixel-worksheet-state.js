import {
  createConfigState,
  getBatchAWorksheetPlan,
  setBatchAGenerationSeed,
  setBatchAIncludeAnswerKey,
  setBatchAOrdering,
  setBatchAPrintLayout,
  setBatchAQuestionCount,
  setBatchASelectorSelection,
  setBatchASourceId
} from "../assets/browser/state/config-state.js";

function selectorPatch(selectorState = {}) {
  return {
    selectionMode: selectorState.selectionMode,
    selectedKnowledgePointIds: [...(selectorState.selectedKnowledgePointIds ?? [])],
    selectedPatternGroupIds: [...(selectorState.selectedPatternGroupIds ?? [])]
  };
}

export function createPixelWorksheetState({
  sourceId,
  selectorState,
  questionCount = 20,
  ordering = "groupedByPattern",
  includeAnswerKey = true,
  generationSeed = "pixel-ui",
  columns = 4,
  rowsPerPage = 10
} = {}) {
  const state = createConfigState();
  if (sourceId) setBatchASourceId(state, sourceId);
  setBatchAQuestionCount(state, questionCount);
  setBatchAOrdering(state, ordering);
  setBatchAIncludeAnswerKey(state, includeAnswerKey);
  setBatchAGenerationSeed(state, generationSeed);
  setBatchAPrintLayout(state, { columns, rowsPerPage });
  if (selectorState) setBatchASelectorSelection(state, selectorPatch(selectorState));
  return state;
}

export function syncPixelWorksheetSelection(state, { sourceId, selectorState } = {}) {
  if (sourceId) setBatchASourceId(state, sourceId);
  if (selectorState) setBatchASelectorSelection(state, selectorPatch(selectorState));
  return getPixelWorksheetPlan(state);
}

export function applyPixelWorksheetSettings(state, patch = {}) {
  if (patch.questionCount !== undefined) setBatchAQuestionCount(state, patch.questionCount);
  if (patch.ordering !== undefined) setBatchAOrdering(state, patch.ordering);
  if (patch.includeAnswerKey !== undefined) setBatchAIncludeAnswerKey(state, patch.includeAnswerKey);
  if (patch.generationSeed !== undefined) setBatchAGenerationSeed(state, patch.generationSeed);
  if (patch.columns !== undefined || patch.rowsPerPage !== undefined) {
    setBatchAPrintLayout(state, {
      columns: patch.columns,
      rowsPerPage: patch.rowsPerPage
    });
  }
  return getPixelWorksheetPlan(state);
}

export function getPixelWorksheetPlan(state) {
  return Object.freeze(getBatchAWorksheetPlan(state));
}
