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
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints
} from "../../modules/curriculum/registry/batch-a-selector-extension.js";
import {
  normalizePublicPatternGroupSelection,
  togglePublicPatternGroupSelection
} from "./state/public-pattern-group-selection.js";
import {
  publicIssueMessage,
  publicSelectorWarningMessage
} from "./state/public-ui-messages.js";
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
const patternGroupSection = document.getElementById("batch-a-pattern-group-selector");
const patternGroupHelp = document.getElementById("batch-a-pattern-group-help");
const patternGroupPanel = document.getElementById("batch-a-pattern-group-panel");
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

let patternGroupUiWarnings = [];
let hasGeneratedWorksheet = false;

function setPanel(panel, message, tone = "") {
  if (!panel) return;
  panel.textContent = message;
  panel.dataset.tone = tone;
}

function visibleKnowledgePointsForSource(sourceId) {
  return listVisibleBatchAKnowledgePoints().filter((entry) => entry.sourceId === sourceId);
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

function applySelectorSelection(selectionMode, selectedKnowledgePointIds, requestedPatternGroupIds = []) {
  const normalized = normalizePublicPatternGroupSelection({
    selectionMode,
    selectedKnowledgePointIds,
    selectedPatternGroupIds: requestedPatternGroupIds
  });
  setBatchASelectorSelection(state, {
    selectionMode,
    selectedKnowledgePointIds,
    selectedPatternGroupIds: normalized.selectedPatternGroupIds
  });
  patternGroupUiWarnings = [...normalized.warnings];
  return normalized;
}

function normalizeCurrentPatternGroups() {
  return applySelectorSelection(
    state.batchA.selectionMode,
    selectedVisibleKnowledgePointIds(state.batchA.sourceId),
    state.batchA.selectedPatternGroupIds ?? []
  );
}

function updateSourceHelp() {
  const unit = sourceUnits.find((entry) => entry.sourceId === state.batchA.sourceId);
  if (!sourceHelp || !unit) return;
  sourceHelp.textContent = `${unit.unitCode}｜${unit.title}｜${unit.grade} 年級${unit.semester === "upper" ? "上學期" : "下學期"}`;
}

function populateSourceSelect() {
  if (!sourceSelect) return;
  sourceSelect.replaceChildren();
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
  const isSourceUnitMode = state.batchA.selectionMode === BATCH_A_SELECTION_MODES.SOURCE_UNIT;

  if (knowledgePointAvailabilitySummary) {
    knowledgePointAvailabilitySummary.textContent = [
      `本單元可選知識點：${sourceAvailability.visibleCount}`,
      `已建立但尚未開放：${sourceAvailability.hiddenPendingCount}`,
      `目前不可選：${sourceAvailability.notSelectableCount}`,
      `全部可選：${globalAvailability.visibleCount}`
    ].join("｜");
  }

  if (knowledgePointPanel) {
    knowledgePointPanel.replaceChildren();
    knowledgePointPanel.dataset.visibleCount = String(visibleKnowledgePoints.length);
    knowledgePointPanel.dataset.selectionMode = state.batchA.selectionMode;
    for (const knowledgePoint of visibleKnowledgePoints) {
      const selected = selectedIds.has(knowledgePoint.knowledgePointId);
      const item = document.createElement("button");
      item.type = "button";
      item.className = "knowledge-point-option";
      item.dataset.knowledgePointId = knowledgePoint.knowledgePointId;
      item.dataset.selected = selected ? "true" : "false";
      item.disabled = isSourceUnitMode;
      item.setAttribute("aria-pressed", selected ? "true" : "false");
      item.innerHTML = `<strong>${selected ? "已選｜" : ""}${knowledgePoint.displayName}</strong><span>${knowledgePoint.unitCode}｜已通過出題驗證</span>`;
      knowledgePointPanel.append(item);
    }
  }

  if (knowledgePointEmptyState) {
    knowledgePointEmptyState.dataset.visible = visibleKnowledgePoints.length === 0 ? "true" : "false";
    if (visibleKnowledgePoints.length === 0) {
      knowledgePointEmptyState.textContent = "目前此單元尚無已通過驗證的可選知識點，請先使用單元出題。";
    } else if (isSourceUnitMode) {
      knowledgePointEmptyState.textContent = `此單元有 ${visibleKnowledgePoints.length} 個可選知識點；切換出題模式後可進行加強或混合。`;
    } else {
      knowledgePointEmptyState.textContent = `目前已選 ${selectedIds.size} 個知識點。`;
    }
  }
}

function renderPatternGroupChoices() {
  if (!patternGroupSection || !patternGroupPanel || !patternGroupHelp) return;
  const normalized = normalizePublicPatternGroupSelection({
    selectionMode: state.batchA.selectionMode,
    selectedKnowledgePointIds: state.batchA.selectedKnowledgePointIds,
    selectedPatternGroupIds: state.batchA.selectedPatternGroupIds
  });
  const choiceGroups = new Map();
  for (const choice of normalized.choices) {
    if (!choice.hasRepresentationChoice) continue;
    const list = choiceGroups.get(choice.knowledgePointId) ?? [];
    list.push(choice);
    choiceGroups.set(choice.knowledgePointId, list);
  }

  patternGroupPanel.replaceChildren();
  const visible = state.batchA.selectionMode !== BATCH_A_SELECTION_MODES.SOURCE_UNIT
    && choiceGroups.size > 0;
  patternGroupSection.dataset.visible = visible ? "true" : "false";
  if (!visible) {
    patternGroupHelp.textContent = state.batchA.selectionMode === BATCH_A_SELECTION_MODES.SOURCE_UNIT
      ? "切換到知識點模式後，可選擇計算題或應用題。"
      : "目前選取的知識點只有一種題目形式，系統已自動套用。";
    return;
  }

  patternGroupHelp.textContent = "可同時選擇計算題與應用題；每個知識點至少保留一種形式。";
  for (const choices of choiceGroups.values()) {
    const group = document.createElement("section");
    group.className = "pattern-group-choice";
    const heading = document.createElement("h4");
    heading.textContent = choices[0].knowledgePointDisplayName;
    group.append(heading);
    const buttons = document.createElement("div");
    buttons.className = "pattern-group-choice__buttons";
    for (const choice of choices) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "pattern-group-option";
      button.dataset.patternGroupId = choice.patternGroupId;
      button.dataset.selected = choice.selected ? "true" : "false";
      button.setAttribute("aria-pressed", choice.selected ? "true" : "false");
      button.textContent = `${choice.selected ? "已選｜" : ""}${choice.displayLabel}`;
      buttons.append(button);
    }
    group.append(buttons);
    patternGroupPanel.append(group);
  }
}

function renderSelectorWarnings() {
  if (!knowledgePointWarningList) return;
  const warnings = [...(state.batchA.selectorWarnings ?? []), ...patternGroupUiWarnings];
  knowledgePointWarningList.replaceChildren();
  knowledgePointWarningList.dataset.visible = warnings.length > 0 ? "true" : "false";
  for (const warning of warnings) {
    const item = document.createElement("li");
    item.textContent = publicSelectorWarningMessage(warning);
    knowledgePointWarningList.append(item);
  }
}

function syncKnowledgePointSelectorFromState() {
  syncSelectionModeOptions();
  renderKnowledgePointAvailability();
  renderPatternGroupChoices();
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
    if (knowledgePointId) {
      applySelectorSelection(
        BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
        [knowledgePointId],
        state.batchA.selectedPatternGroupIds
      );
      return;
    }
  }

  if (requestedMode === BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT) {
    const knowledgePointIds = chooseSameUnitKnowledgePointIds(state.batchA.sourceId);
    if (knowledgePointIds.length >= 2) {
      applySelectorSelection(
        BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
        knowledgePointIds,
        state.batchA.selectedPatternGroupIds
      );
      return;
    }
  }

  applySelectorSelection(BATCH_A_SELECTION_MODES.SOURCE_UNIT, [], []);
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
    validationPanel.textContent = "驗證通過，沒有發現出題錯誤。";
    return;
  }
  validationPanel.dataset.hasErrors = errors.length > 0 ? "true" : "false";
  const list = document.createElement("ul");
  list.className = "validation-list";
  for (const issue of [...errors, ...warnings]) {
    const item = document.createElement("li");
    item.textContent = publicIssueMessage(issue);
    list.append(item);
  }
  validationPanel.replaceChildren(list);
}

function markOutputStale() {
  if (!hasGeneratedWorksheet) return;
  if (printButton) {
    printButton.disabled = true;
    printButton.textContent = "請重新產生後列印";
  }
  setPanel(statusPanel, "設定已變更，請重新產生考卷。", "");
}

function regenerate() {
  readControlsIntoState();
  writeQueryStateFromState(state);
  setPanel(statusPanel, "正在產生練習題...", "");
  if (printButton) {
    printButton.disabled = true;
    printButton.textContent = "列印";
  }

  const result = buildWorksheetDocumentFromState(state);
  renderIssues(result);
  if (!result.ok || !result.worksheetDocument) {
    hasGeneratedWorksheet = false;
    setPanel(statusPanel, "產生失敗，請檢查知識點、題目形式與題數設定。", "error");
    if (previewMeta) previewMeta.textContent = "產生失敗。";
    return;
  }

  renderPreviewFrame(previewFrame, result.worksheetDocument, {
    title: result.worksheetDocument.title,
    outputMode: "studentPrint",
    stylesheetHref: "./assets/styles/print-styles.css"
  });
  const count = result.worksheetDocument.summary?.questionCount ?? result.worksheetDocument.generatedQuestions?.length ?? 0;
  hasGeneratedWorksheet = true;
  setPanel(statusPanel, `已產生 ${count} 題，可預覽與列印。`, "success");
  if (previewMeta) {
    previewMeta.textContent = `${result.worksheetDocument.title}｜${count} 題｜${state.batchA.includeAnswerKey ? "含答案頁" : "不含答案頁"}`;
  }
  if (printButton) {
    printButton.disabled = false;
    printButton.textContent = "列印目前考卷";
  }
}

function bindControls() {
  for (const element of [sourceSelect, selectionModeSelect, questionCountInput, orderingSelect, answerKeyInput, generationSeedInput, columnsInput, rowsPerPageInput]) {
    element?.addEventListener("change", () => {
      readControlsIntoState();
      syncControlsFromState();
      writeQueryStateFromState(state);
      markOutputStale();
    });
  }

  knowledgePointPanel?.addEventListener("click", (event) => {
    const item = event.target.closest?.("[data-knowledge-point-id]");
    if (!item || item.disabled) return;
    const knowledgePointId = item.dataset.knowledgePointId;
    const visibleIds = new Set(visibleKnowledgePointsForSource(state.batchA.sourceId).map((entry) => entry.knowledgePointId));
    if (!visibleIds.has(knowledgePointId)) return;

    if (state.batchA.selectionMode === BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT) {
      const current = new Set(selectedVisibleKnowledgePointIds(state.batchA.sourceId));
      if (current.has(knowledgePointId)) {
        if (current.size <= 2) {
          patternGroupUiWarnings = [{ code: "public_pattern_group_minimum_one" }];
          renderSelectorWarnings();
          return;
        }
        current.delete(knowledgePointId);
      } else {
        current.add(knowledgePointId);
      }
      applySelectorSelection(
        BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
        [...current],
        state.batchA.selectedPatternGroupIds
      );
    } else {
      applySelectorSelection(
        BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
        [knowledgePointId],
        state.batchA.selectedPatternGroupIds
      );
    }
    syncControlsFromState();
    writeQueryStateFromState(state);
    markOutputStale();
  });

  patternGroupPanel?.addEventListener("click", (event) => {
    const item = event.target.closest?.("[data-pattern-group-id]");
    if (!item) return;
    const toggled = togglePublicPatternGroupSelection({
      selectionMode: state.batchA.selectionMode,
      selectedKnowledgePointIds: state.batchA.selectedKnowledgePointIds,
      selectedPatternGroupIds: state.batchA.selectedPatternGroupIds,
      patternGroupId: item.dataset.patternGroupId
    });
    setBatchASelectorSelection(state, {
      selectionMode: state.batchA.selectionMode,
      selectedKnowledgePointIds: state.batchA.selectedKnowledgePointIds,
      selectedPatternGroupIds: toggled.selectedPatternGroupIds
    });
    patternGroupUiWarnings = [...toggled.warnings];
    syncControlsFromState();
    writeQueryStateFromState(state);
    markOutputStale();
  });

  regenerateButton?.addEventListener("click", regenerate);
  printButton?.addEventListener("click", () => {
    if (!hasGeneratedWorksheet) return;
    printPreviewFrame(previewFrame);
  });
}

populateSourceSelect();
normalizeCurrentPatternGroups();
syncControlsFromState();
bindControls();
regenerate();
