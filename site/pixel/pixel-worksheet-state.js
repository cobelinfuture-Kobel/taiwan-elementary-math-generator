import {
  createConfigState,
  getBatchAWorksheetPlan,
  setBatchAContextMode,
  setBatchADepthMode,
  setBatchAGenerationSeed,
  setBatchAIncludeAnswerKey,
  setBatchALayoutMode,
  setBatchAOrdering,
  setBatchAPrintLayout,
  setBatchAQuestionCount,
  setBatchAQuestionMode,
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
  rowsPerPage = 10,
  questionMode = "mixed",
  layoutMode = "auto_safe",
  depthMode = "mixed",
  contextMode = "mixed",
} = {}) {
  const state = createConfigState();
  if (sourceId) setBatchASourceId(state, sourceId);
  setBatchAQuestionCount(state, questionCount);
  setBatchAOrdering(state, ordering);
  setBatchAIncludeAnswerKey(state, includeAnswerKey);
  setBatchAGenerationSeed(state, generationSeed);
  setBatchAPrintLayout(state, { columns, rowsPerPage, layoutMode });
  if (selectorState) setBatchASelectorSelection(state, selectorPatch(selectorState));
  setBatchAQuestionMode(state, questionMode);
  setBatchALayoutMode(state, layoutMode);
  setBatchADepthMode(state, depthMode);
  setBatchAContextMode(state, contextMode);
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
  if (patch.questionMode !== undefined) setBatchAQuestionMode(state, patch.questionMode);
  if (patch.layoutMode !== undefined) setBatchALayoutMode(state, patch.layoutMode);
  if (patch.depthMode !== undefined) setBatchADepthMode(state, patch.depthMode);
  if (patch.contextMode !== undefined) setBatchAContextMode(state, patch.contextMode);
  if (patch.columns !== undefined || patch.rowsPerPage !== undefined || patch.layoutMode !== undefined) {
    setBatchAPrintLayout(state, {
      columns: patch.columns,
      rowsPerPage: patch.rowsPerPage,
      layoutMode: patch.layoutMode,
    });
  }
  return getPixelWorksheetPlan(state);
}

export function getPixelWorksheetPlan(state) {
  return Object.freeze(getBatchAWorksheetPlan(state));
}
