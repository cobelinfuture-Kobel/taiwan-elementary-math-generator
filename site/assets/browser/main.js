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
} from "../../modules/curriculum/registry/batch-a-selector-candidates.js";
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
  for (const option of selectionModeSelect.options) {
    if (option.value === BATCH_A_SELECTION_MODES.SOURCE_UNIT) {
      option.disabled = false;
    } else if (option.value === BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT) {
      option.disabled = !hasVisibleKnowledgePoint;
    } else {
      option.disabled = true;
    }
  }
  selectionModeSelect.value = state.batchA.selectionMode === BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT && hasVisibleKnowledgePoint
    ? BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT
    : BATCH_A_SELECTION_MODES.SOURCE_UNIT;
}

function renderKnowledgePointAvailability() {
  const sourceAvailability = listBatchAKnowledgePointAvailabilityBySource(state.batchA.sourceId);
  const globalAvailability = BATCH_A_SELECTOR_AVAILABILITY;
  const visibleKnowledgePoints = visibleKnowledgePointsForSource(state.batchA.sourceId);

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
    for (const knowledgePoint of visibleKnowledgePoints) {
      const item = document.createElement("p");
      item.className = "knowledge-point-option";
      item.dataset.knowledgePointId = knowledgePoint.knowledgePointId;
      item.textContent = `${knowledgePoint.displayName}｜${knowledgePoint.unitCode}｜${knowledgePoint.qaStatusLabel}`;
      knowledgePointPanel.append(item);
    }
  }

  if (knowledgePointEmptyState) {
    knowledgePointEmptyState.dataset.visible = visibleKnowledgePoints.length === 0 ? "true" : "false";
    knowledgePointEmptyState.textContent = visibleKnowledgePoints.length === 0
      ? "目前此單元尚無已通過 QA 的可選知識點。請先使用單元出題，或等待 KnowledgePoint QA 完成。"
      : "此單元已有 1 個通過 QA 的知識點；選擇單一知識點加強時會使用此知識點出題。";
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
  if (requestedMode !== BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT) {
    setBatchASelectorSelection(state, {
      selectionMode: BATCH_A_SELECTION_MODES.SOURCE_UNIT,
      selectedKnowledgePointIds: [],
      selectedPatternGroupIds: []
    });
    return;
  }

  const selectedKnowledgePoint = visibleKnowledgePointsForSource(state.batchA.sourceId)[0];
  const patternGroupId = selectedKnowledgePoint ? firstVisiblePatternGroupId(selectedKnowledgePoint.knowledgePointId) : null;
  if (!selectedKnowledgePoint || !patternGroupId) {
    setBatchASelectorSelection(state, {
      selectionMode: BATCH_A_SELECTION_MODES.SOURCE_UNIT,
      selectedKnowledgePointIds: [],
      selectedPatternGroupIds: []
    });
    return;
  }

  setBatchASelectorSelection(state, {
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [selectedKnowledgePoint.knowledgePointId],
    selectedPatternGroupIds: [patternGroupId]
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
  regenerateButton?.addEventListener("click", regenerate);
  printButton?.addEventListener("click", () => printPreviewFrame(previewFrame));
}

populateSourceSelect();
syncControlsFromState();
bindControls();
regenerate();
