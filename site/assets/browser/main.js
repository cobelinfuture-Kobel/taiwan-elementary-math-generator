import { listBatchASourceUnits } from "../../modules/curriculum/batch-a/source-units.js";
import {
  BATCH_A_SELECTION_MODES,
  createConfigState,
  setBatchAIncludeAnswerKey,
  setBatchAGenerationSeed,
  setBatchAOrdering,
  setBatchAPrintLayout,
  setBatchAQuestionCount,
  setBatchASelectorSelection,
  setBatchASourceId
} from "./state/config-state.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  getVisiblePatternGroupsForKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints
} from "../../modules/curriculum/registry/batch-a-selector-extension.js";
import { parseQueryState, writeQueryStateFromState } from "./state/query-state.js";
import { buildWorksheetDocumentFromState } from "./pipeline/build-worksheet-document.js";
import { printPreviewFrame, renderPreviewFrame } from "./pipeline/render-preview-frame.js";

const queryState = parseQueryState();
const state = createConfigState({ queryState });
const sourceUnits = listBatchASourceUnits();

const sourceSelect = document.getElementById("batch-a-source-select");
const sourceHelp = document.getElementById("batch-a-source-help");
const selectionModeSelect = document.getElementById("batch-a-selection-mode-select");
const knowledgePointEmptyState = document.getElementById("batch-a-knowledge-point-empty-state");
const knowledgePointAvailabilitySummary = document.getElementById("batch-a-knowledge-point-availability-summary");
const knowledgePointPanel = document.getElementById("batch-a-knowledge-point-panel");
const knowledgePointWarningList = document.getElementById("batch-a-knowledge-point-warning-list");
const questionCountInput = document.getElementById("batch-a-question-count-input");
const orderingSelect = document.getElementById("batch-a-ordering-select");
const answerKeyInput = document.getElementById("batch-a-answer-key-input");
const generationSeedInput = document.getElementById("generation-seed-input");
const columnsInput = document.getElementById("columns-input");
const rowsPerPageInput = document.getElementById("rows-per-page-input");
const regenerateButton = document.getElementById("regenerate-button");
const printButton = document.getElementById("print-button");
const statusPanel = document.getElementById("status-panel");
const validationPanel = document.getElementById("validation-panel");
const previewMeta = document.getElementById("preview-meta");
const previewFrame = document.getElementById("preview-frame");

function setPanel(panel, message, tone = "") {
  if (!panel) return;
  panel.textContent = message;
  if (tone) panel.dataset.tone = tone;
}

function visibleKnowledgePointsForSource(sourceId) {
  return listVisibleBatchAKnowledgePoints().filter((entry) => entry.sourceId === sourceId);
}

function firstVisiblePatternGroupId(knowledgePointId) {
  return getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)[0]?.patternGroupId ?? null;
}

function selectedVisibleKnowledgePointIds(sourceId) {
  const visibleIds = new Set(visibleKnowledgePointsForSource(sourceId).map((entry) => entry.knowledgePointId));
  return (state.batchA.selectedKnowledgePointIds ?? []).filter((knowledgePointId) => visibleIds.has(knowledgePointId));
}

function chooseSingleKnowledgePointId(sourceId) {
  const visibleKnowledgePoints = visibleKnowledgePointsForSource(sourceId);
  return selectedVisibleKnowledgePointIds(sourceId)[0] ?? visibleKnowledgePoints[0]?.knowledgePointId ?? null;
}

function chooseSameUnitKnowledgePointIds(sourceId) {
  const currentIds = selectedVisibleKnowledgePointIds(sourceId);
  if (currentIds.length >= 2) return currentIds;
  return visibleKnowledgePointsForSource(sourceId).map((entry) => entry.knowledgePointId);
}

function patternGroupIdsForKnowledgePoints(knowledgePointIds) {
  return knowledgePointIds.map((knowledgePointId) => firstVisiblePatternGroupId(knowledgePointId)).filter(Boolean);
}

function updateSourceHelp() {
  const unit = sourceUnits.find((entry) => entry.sourceId === state.batchA.sourceId);
  if (!sourceHelp || !unit) return;
  sourceHelp.textContent = `${unit.unitCode}｜${unit.title}｜sourceId: ${unit.sourceId}`;
}

function populateSourceSelect() {
  if (!sourceSelect) return;
  sourceSelect.innerHTML = "";
  for (const unit of sourceUnits) {
    const option = document.createElement("option");
    option.value = unit.sourceId;
    option.textContent = `${unit.unitCode} ${unit.title}`;
    sourceSelect.append(option);
  }
}

function syncSelectionModeOptions() {
  if (!selectionModeSelect) return;
  const sourceAvailability = listBatchAKnowledgePointAvailabilityBySource(state.batchA.sourceId);
  const hasVisibleKnowledgePoint = sourceAvailability.visibleCount > 0;
  const hasSameUnitKnowledgePointMix = sourceAvailability.visibleCount >= 2;
  for (const option of selectionModeSelect.options) {
    if (option.value === BATCH_A_SELECTION_MODES.SOURCE_UNIT) {
      option.disabled = false;
    } else if (option.value === BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT) {
      option.disabled = !hasVisibleKnowledgePoint;
    } else if (option.value === BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT) {
      option.disabled = !hasSameUnitKnowledgePointMix;
    } else {
      option.disabled = true;
    }
  }
  const allowedModes = new Set([BATCH_A_SELECTION_MODES.SOURCE_UNIT]);
  if (hasVisibleKnowledgePoint) allowedModes.add(BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT);
  if (hasSameUnitKnowledgePointMix) allowedModes.add(BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT);
  selectionModeSelect.value = allowedModes.has(state.batchA.selectionMode)
    ? state.batchA.selectionMode
    : BATCH_A_SELECTION_MODES.SOURCE_UNIT;
}

function renderKnowledgePointAvailability() {
  const sourceAvailability = listBatchAKnowledgePointAvailabilityBySource(state.batchA.sourceId);
  const globalAvailability = BATCH_A_SELECTOR_AVAILABILITY;
  const visibleKnowledgePoints = visibleKnowledgePointsForSource(state.batchA.sourceId);
  const selectedIds = new Set(state.batchA.selectedKnowledgePointIds ?? []);

  if (knowledgePointAvailabilitySummary) {
    knowledgePointAvailabilitySummary.textContent = [
      `本單元可選知識點：${sourceAvailability.visibleCount}`,
      `已建立但尚未開放：${sourceAvailability.hiddenPendingCount}`,
      `不可在 S43 使用：${sourceAvailability.notSelectableCount}`,
      `全 Batch A 可選：${globalAvailability.visibleCount}`
    ].join("｜");
  }

  if (knowledgePointPanel) {
    knowledgePointPanel.replaceChildren();
    knowledgePointPanel.dataset.visibleCount = String(visibleKnowledgePoints.length);
    knowledgePointPanel.dataset.selectionMode = state.batchA.selectionMode;
    for (const knowledgePoint of visibleKnowledgePoints) {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "knowledge-point-option";
      item.dataset.knowledgePointId = knowledgePoint.knowledgePointId;
      item.dataset.selected = selectedIds.has(knowledgePoint.knowledgePointId) ? "true" : "false";
      item.textContent = `${selectedIds.has(knowledgePoint.knowledgePointId) ? "已選｜" : ""}${knowledgePoint.displayName}｜${knowledgePoint.unitCode}｜${knowledgePoint.qaStatusLabel}`;
      knowledgePointPanel.append(item);
    }
  }

  if (knowledgePointEmptyState) {
    knowledgePointEmptyState.dataset.visible = visibleKnowledgePoints.length === 0 ? "true" : "false";
    if (visibleKnowledgePoints.length === 0) {
      knowledgePointEmptyState.textContent = "目前此單元尚無已通過 QA 的可選知識點。請先使用單元出題，或等待 KnowledgePoint QA 完成。";
    } else if (visibleKnowledgePoints.length === 1) {
      knowledgePointEmptyState.textContent = "此單元已有 1 個通過 QA 的知識點；可使用單一知識點加強。";
    } else {
      knowledgePointEmptyState.textContent = `此單元已有 ${visibleKnowledgePoints.length} 個通過 QA 的知識點；可使用單一知識點加強或同單元知識點混合。`;
    }
  }
}

function renderSelectorWarnings() {
  if (!knowledgePointWarningList) return;
  const warnings = state.batchA.selectorWarnings ?? [];
  knowledgePointWarningList.replaceChildren();
  knowledgePointWarningList.dataset.visible = warnings.length > 0 ? "true" : "false";
  for (const warning of warnings) {
    const item = document.createElement("li");
    item.textContent = warning.code;
    knowledgePointWarningList.append(item);
  }
}

function syncKnowledgePointSelectorFromState() {
  syncSelectionModeOptions();
  renderKnowledgePointAvailability();
  renderSelectorWarnings();
}

function syncControlsFromState() {
  if (sourceSelect) sourceSelect.value = state.batchA.sourceId;
  if (questionCountInput) questionCountInput.value = String(state.batchA.questionCount);
  if (orderingSelect) orderingSelect.value = state.batchA.ordering;
  if (answerKeyInput) answerKeyInput.checked = state.batchA.includeAnswerKey;
  if (generationSeedInput) generationSeedInput.value = state.batchA.generationSeed;
  if (columnsInput) columnsInput.value = String(state.batchA.columns);
  if (rowsPerPageInput) rowsPerPageInput.value = String(state.batchA.rowsPerPage);
  updateSourceHelp();
  syncKnowledgePointSelectorFromState();
}

function readSelectorControlsIntoState() {
  const requestedMode = selectionModeSelect?.value ?? BATCH_A_SELECTION_MODES.SOURCE_UNIT;

  if (requestedMode === BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT) {
    const knowledgePointId = chooseSingleKnowledgePointId(state.batchA.sourceId);
    const patternGroupId = knowledgePointId ? firstVisiblePatternGroupId(knowledgePointId) : null;
    if (knowledgePointId && patternGroupId) {
      setBatchASelectorSelection(state, {
        selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
        selectedKnowledgePointIds: [knowledgePointId],
        selectedPatternGroupIds: [patternGroupId]
      });
      return;
    }
  }

  if (requestedMode === BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT) {
    const knowledgePointIds = chooseSameUnitKnowledgePointIds(state.batchA.sourceId);
    if (knowledgePointIds.length >= 2) {
      setBatchASelectorSelection(state, {
        selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
        selectedKnowledgePointIds: knowledgePointIds,
        selectedPatternGroupIds: patternGroupIdsForKnowledgePoints(knowledgePointIds)
      });
      return;
    }
  }

  setBatchASelectorSelection(state, {
    selectionMode: BATCH_A_SELECTION_MODES.SOURCE_UNIT,
    selectedKnowledgePointIds: [],
    selectedPatternGroupIds: []
  });
}

function readControlsIntoState() {
  setBatchASourceId(state, sourceSelect?.value ?? state.batchA.sourceId);
  setBatchAQuestionCount(state, Number(questionCountInput?.value ?? state.batchA.questionCount));
  setBatchAOrdering(state, orderingSelect?.value ?? state.batchA.ordering);
  setBatchAIncludeAnswerKey(state, Boolean(answerKeyInput?.checked));
  setBatchAGenerationSeed(state, generationSeedInput?.value ?? state.batchA.generationSeed);
  setBatchAPrintLayout(state, {
    columns: Number(columnsInput?.value ?? state.batchA.columns),
    rowsPerPage: Number(rowsPerPageInput?.value ?? state.batchA.rowsPerPage)
  });
  readSelectorControlsIntoState();
}

function renderIssues(result) {
  const errors = result?.errors ?? result?.validation?.errors ?? [];
  const warnings = result?.warnings ?? result?.validation?.warnings ?? [];
  if (!validationPanel) return;
  if (errors.length === 0 && warnings.length === 0) {
    validationPanel.dataset.hasErrors = "false";
    validationPanel.textContent = "驗證通過：沒有 validator error。";
    return;
  }
  validationPanel.dataset.hasErrors = errors.length > 0 ? "true" : "false";
  const list = document.createElement("ul");
  list.className = "validation-list";
  for (const issue of [...errors, ...warnings]) {
    const item = document.createElement("li");
    item.textContent = `${issue.code}: ${issue.message}`;
    list.append(item);
  }
  validationPanel.replaceChildren(list);
}

function regenerate() {
  readControlsIntoState();
  writeQueryStateFromState(state);
  setPanel(statusPanel, "正在產生 Batch A worksheet...", "");
  printButton.disabled = true;

  const result = buildWorksheetDocumentFromState(state);
  renderIssues(result);
  if (!result.ok || !result.worksheetDocument) {
    setPanel(statusPanel, "產生失敗，請檢查設定或 validator 訊息。", "error");
    if (previewMeta) previewMeta.textContent = "產生失敗。";
    return;
  }

  renderPreviewFrame(previewFrame, result.worksheetDocument, {
    title: result.worksheetDocument.title,
    outputMode: "studentPrint",
    stylesheetHref: "./assets/styles/print-styles.css"
  });
  const count = result.worksheetDocument.summary?.questionCount ?? result.worksheetDocument.generatedQuestions?.length ?? 0;
  setPanel(statusPanel, `已產生 ${count} 題，可預覽與列印。`, "success");
  if (previewMeta) {
    previewMeta.textContent = `${result.worksheetDocument.title}｜${count} 題｜${state.batchA.includeAnswerKey ? "含答案頁" : "不含答案頁"}`;
  }
  printButton.disabled = false;
}

function bindControls() {
  for (const element of [sourceSelect, selectionModeSelect, questionCountInput, orderingSelect, answerKeyInput, generationSeedInput, columnsInput, rowsPerPageInput]) {
    element?.addEventListener("change", () => {
      readControlsIntoState();
      syncControlsFromState();
      writeQueryStateFromState(state);
    });
  }
  knowledgePointPanel?.addEventListener("click", (event) => {
    const item = event.target.closest?.("[data-knowledge-point-id]");
    if (!item) return;
    const knowledgePointId = item.dataset.knowledgePointId;
    const visibleIds = new Set(visibleKnowledgePointsForSource(state.batchA.sourceId).map((entry) => entry.knowledgePointId));
    if (!visibleIds.has(knowledgePointId)) return;

    if (state.batchA.selectionMode === BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT) {
      const current = new Set(selectedVisibleKnowledgePointIds(state.batchA.sourceId));
      if (current.has(knowledgePointId) && current.size > 2) {
        current.delete(knowledgePointId);
      } else {
        current.add(knowledgePointId);
      }
      setBatchASelectorSelection(state, {
        selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
        selectedKnowledgePointIds: [...current],
        selectedPatternGroupIds: patternGroupIdsForKnowledgePoints([...current])
      });
    } else {
      const patternGroupId = firstVisiblePatternGroupId(knowledgePointId);
      if (!patternGroupId) return;
      setBatchASelectorSelection(state, {
        selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
        selectedKnowledgePointIds: [knowledgePointId],
        selectedPatternGroupIds: [patternGroupId]
      });
    }
    syncControlsFromState();
    writeQueryStateFromState(state);
  });
  regenerateButton?.addEventListener("click", regenerate);
  printButton?.addEventListener("click", () => printPreviewFrame(previewFrame));
}

populateSourceSelect();
syncControlsFromState();
bindControls();
regenerate();
