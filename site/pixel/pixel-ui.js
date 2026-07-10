import {
  getPixelRegistrySnapshot,
  getPixelSourceSummary,
  listPixelGrades,
  listPixelSemestersForGrade,
  listPixelSourceOptionsByFilter
} from "./pixel-registry-bridge.js";
import {
  BATCH_A_SELECTION_MODES,
  createPixelKnowledgePointSelectorState,
  getPixelSelectionModeLabel,
  listPixelKnowledgePointModeOptions,
  PIXEL_SELECTOR_WARNING_CODES,
  togglePixelKnowledgePointSelection,
  togglePixelPatternGroupSelection
} from "./pixel-selector-state.js";
import { publicSelectorWarningMessage } from "../assets/browser/state/public-ui-messages.js";
import {
  applyPixelWorksheetSettings,
  createPixelWorksheetState,
  getPixelWorksheetPlan,
  syncPixelWorksheetSelection
} from "./pixel-worksheet-state.js";
import { runPixelWorksheetGeneration } from "./pixel-generation-controller.js";

const gradeSelect = document.getElementById("pixel-grade-select");
const semesterSelect = document.getElementById("pixel-semester-select");
const sourceSelect = document.getElementById("pixel-source-select");
const sourceSummary = document.getElementById("pixel-source-summary");
const kpCount = document.getElementById("pixel-kp-count");
const unitMeta = document.getElementById("pixel-unit-meta");
const selectionModeSelect = document.getElementById("pixel-selection-mode-select");
const knowledgePointEmptyState = document.getElementById("pixel-kp-empty-state");
const knowledgePointAvailabilitySummary = document.getElementById("pixel-kp-availability-summary");
const knowledgePointPanel = document.getElementById("pixel-kp-panel");
const patternGroupSection = document.getElementById("pixel-pattern-group-selector");
const patternGroupHelp = document.getElementById("pixel-pattern-group-help");
const patternGroupPanel = document.getElementById("pixel-pattern-group-panel");
const knowledgePointWarningList = document.getElementById("pixel-kp-warning-list");
const questionCountInput = document.getElementById("pixel-question-count");
const orderingSelect = document.getElementById("pixel-ordering");
const generationSeedInput = document.getElementById("pixel-generation-seed");
const columnsInput = document.getElementById("pixel-columns");
const rowsPerPageInput = document.getElementById("pixel-rows-per-page");
const answerKeyInput = document.getElementById("pixel-answer-key");
const planSummary = document.getElementById("pixel-plan-summary");
const generateButton = document.getElementById("pixel-generate-button");
const generationStatus = document.getElementById("pixel-generation-status");
const generationErrors = document.getElementById("pixel-generation-errors");
const previewMeta = document.getElementById("pixel-preview-meta");

const registrySnapshot = getPixelRegistrySnapshot();
let activeSourceSummary = null;
let knowledgePointState = null;
let generationInProgress = false;
let lastGenerationSummary = null;
const worksheetState = createPixelWorksheetState();

function selectedGrade() {
  const value = Number(gradeSelect?.value);
  return Number.isInteger(value) ? value : listPixelGrades()[0] ?? null;
}

function selectedSemester() {
  return semesterSelect?.value || listPixelSemestersForGrade(selectedGrade())[0] || null;
}

function currentSourceOptions() {
  return listPixelSourceOptionsByFilter({
    grade: selectedGrade(),
    semester: selectedSemester()
  });
}

function selectedSourceSummary() {
  return getPixelSourceSummary(sourceSelect?.value) ?? getPixelSourceSummary(currentSourceOptions()[0]?.sourceId) ?? null;
}

function renderGradeOptions() {
  if (!gradeSelect) return;
  const previous = Number(gradeSelect.value);
  gradeSelect.replaceChildren();
  for (const grade of listPixelGrades()) {
    const option = document.createElement("option");
    option.value = String(grade);
    option.textContent = `${grade} 年級`;
    gradeSelect.append(option);
  }
  if (listPixelGrades().includes(previous)) gradeSelect.value = String(previous);
}

function renderSemesterOptions() {
  if (!semesterSelect) return;
  const previous = semesterSelect.value;
  const semesters = listPixelSemestersForGrade(selectedGrade());
  semesterSelect.replaceChildren();
  for (const semester of semesters) {
    const option = document.createElement("option");
    option.value = semester;
    option.textContent = semester === "upper" ? "上學期" : "下學期";
    semesterSelect.append(option);
  }
  if (semesters.includes(previous)) semesterSelect.value = previous;
}

function renderSourceOptions() {
  if (!sourceSelect) return;
  const previous = sourceSelect.value;
  const sourceOptions = currentSourceOptions();
  sourceSelect.replaceChildren();
  for (const unit of sourceOptions) {
    const option = document.createElement("option");
    option.value = unit.sourceId;
    option.textContent = unit.label;
    option.dataset.visibleKnowledgePointCount = String(unit.visibleKnowledgePointCount);
    sourceSelect.append(option);
  }
  if (sourceOptions.some((entry) => entry.sourceId === previous)) sourceSelect.value = previous;
}

function warningMessage(warning) {
  if (warning.code === PIXEL_SELECTOR_WARNING_CODES.MODE_FALLBACK) {
    return `出題模式已從「${getPixelSelectionModeLabel(warning.from)}」改回「${getPixelSelectionModeLabel(warning.to)}」。`;
  }
  if (warning.code === PIXEL_SELECTOR_WARNING_CODES.KNOWLEDGE_POINT_DROPPED) {
    return `已移除 ${warning.count} 個不屬於目前單元或不可見的知識點。`;
  }
  if (warning.code === PIXEL_SELECTOR_WARNING_CODES.MIXED_MINIMUM_TWO) {
    return "同單元知識點混合至少需要保留 2 個知識點。";
  }
  return publicSelectorWarningMessage(warning);
}

function renderSelectionModeOptions() {
  if (!selectionModeSelect || !knowledgePointState) return;
  selectionModeSelect.replaceChildren();
  for (const mode of listPixelKnowledgePointModeOptions(knowledgePointState.sourceId)) {
    const option = document.createElement("option");
    option.value = mode.value;
    option.textContent = mode.label;
    option.disabled = mode.disabled;
    selectionModeSelect.append(option);
  }
  selectionModeSelect.value = knowledgePointState.selectionMode;
}

function readWorksheetSettings() {
  return {
    questionCount: Number(questionCountInput?.value ?? 20),
    ordering: orderingSelect?.value ?? "groupedByPattern",
    includeAnswerKey: Boolean(answerKeyInput?.checked),
    generationSeed: generationSeedInput?.value ?? "pixel-ui",
    columns: Number(columnsInput?.value ?? 4),
    rowsPerPage: Number(rowsPerPageInput?.value ?? 10)
  };
}

function renderWorksheetPlan(plan = getPixelWorksheetPlan(worksheetState)) {
  if (planSummary) {
    planSummary.textContent = [
      `單元：${activeSourceSummary?.label ?? "尚未選擇"}`,
      `模式：${getPixelSelectionModeLabel(plan.selectionMode)}`,
      `題數：${plan.questionCount}`,
      `排序：${plan.ordering === "groupedByPattern" ? "依題型分組" : "跨題型隨機"}`,
      `知識點：${plan.selectedKnowledgePointIds.length}`,
      `題目形式：${plan.selectedPatternGroupIds.length}`,
      `答案頁：${plan.includeAnswerKey ? "是" : "否"}`,
      `版面：${plan.printLayout.columns} 欄 × 每頁 ${plan.printLayout.rowsPerPage} 列`
    ].join("｜");
  }
  document.body.dataset.pixelQuestionCount = String(plan.questionCount);
  document.body.dataset.pixelOrdering = plan.ordering;
  document.body.dataset.pixelIncludeAnswerKey = String(plan.includeAnswerKey);
  document.body.dataset.pixelGenerationSeed = plan.generationSeed;
  document.body.dataset.pixelColumns = String(plan.printLayout.columns);
  document.body.dataset.pixelRowsPerPage = String(plan.printLayout.rowsPerPage);
}

function renderGenerateButtonState() {
  if (!generateButton) return;
  generateButton.disabled = generationInProgress || !activeSourceSummary || !knowledgePointState;
  generateButton.textContent = generationInProgress ? "正在產生考卷..." : "產生考卷";
}

function clearGenerationMessages() {
  generationErrors?.replaceChildren();
  if (generationErrors) generationErrors.dataset.visible = "false";
}

function markGenerationStale() {
  if (!lastGenerationSummary || generationInProgress || !generationStatus) return;
  generationStatus.dataset.status = "stale";
  generationStatus.textContent = "設定已變更，請重新產生考卷。";
  document.body.dataset.pixelGenerationStatus = "stale";
}

function renderGenerationExecution(execution) {
  const summary = execution.summary;
  lastGenerationSummary = summary;
  if (generationStatus) {
    generationStatus.dataset.status = summary.ok ? "success" : "error";
    generationStatus.textContent = summary.statusText;
  }
  clearGenerationMessages();
  const messages = [
    ...summary.errors.map((message) => `錯誤：${message}`),
    ...summary.warnings.map((message) => `提醒：${message}`)
  ];
  if (generationErrors && messages.length > 0) {
    for (const message of messages) {
      const item = document.createElement("li");
      item.textContent = message;
      generationErrors.append(item);
    }
    generationErrors.dataset.visible = "true";
  }
  if (previewMeta) {
    previewMeta.textContent = summary.ok
      ? `${summary.title ?? "考卷"}｜${summary.questionCount} 題｜題目頁 ${summary.questionPageCount}｜答案頁 ${summary.answerKeyPageCount}`
      : summary.statusText;
  }
  document.body.dataset.pixelGenerationStatus = summary.ok ? "success" : "error";
  document.body.dataset.pixelGeneratedWorksheetId = summary.worksheetId ?? "";
  document.body.dataset.pixelGeneratedQuestionCount = String(summary.questionCount);
  document.body.dataset.pixelGeneratedAnswerKeyItemCount = String(summary.answerKeyItemCount);
}

function syncWorksheetPlan() {
  if (activeSourceSummary && knowledgePointState) {
    syncPixelWorksheetSelection(worksheetState, {
      sourceId: activeSourceSummary.sourceId,
      selectorState: knowledgePointState
    });
  }
  const plan = applyPixelWorksheetSettings(worksheetState, readWorksheetSettings());
  renderWorksheetPlan(plan);
  markGenerationStale();
  renderGenerateButtonState();
  return plan;
}

async function generateWorksheet() {
  syncWorksheetPlan();
  generationInProgress = true;
  renderGenerateButtonState();
  clearGenerationMessages();
  if (generationStatus) {
    generationStatus.dataset.status = "generating";
    generationStatus.textContent = "正在產生並驗證考卷...";
  }
  document.body.dataset.pixelGenerationStatus = "generating";
  await Promise.resolve();
  const execution = runPixelWorksheetGeneration(worksheetState);
  generationInProgress = false;
  renderGenerationExecution(execution);
  renderGenerateButtonState();
}

function renderPatternGroupSelector() {
  if (!patternGroupSection || !patternGroupPanel || !patternGroupHelp || !knowledgePointState) return;
  const groupsByKnowledgePoint = new Map();
  for (const choice of knowledgePointState.patternGroupChoices ?? []) {
    if (!choice.hasRepresentationChoice) continue;
    const choices = groupsByKnowledgePoint.get(choice.knowledgePointId) ?? [];
    choices.push(choice);
    groupsByKnowledgePoint.set(choice.knowledgePointId, choices);
  }

  patternGroupPanel.replaceChildren();
  const visible = knowledgePointState.selectionMode !== BATCH_A_SELECTION_MODES.SOURCE_UNIT
    && groupsByKnowledgePoint.size > 0;
  patternGroupSection.dataset.visible = visible ? "true" : "false";
  if (!visible) {
    patternGroupHelp.textContent = knowledgePointState.selectionMode === BATCH_A_SELECTION_MODES.SOURCE_UNIT
      ? "切換到知識點模式後，可選擇計算題或應用題。"
      : "目前選取的知識點只有一種題目形式，系統已自動套用。";
    return;
  }

  patternGroupHelp.textContent = "可同時選擇計算題與應用題；每個知識點至少保留一種形式。";
  for (const choices of groupsByKnowledgePoint.values()) {
    const section = document.createElement("section");
    section.className = "pixel-pattern-group-choice";
    const heading = document.createElement("h4");
    heading.textContent = choices[0].knowledgePointDisplayName;
    section.append(heading);
    const buttons = document.createElement("div");
    buttons.className = "pixel-pattern-group-choice__buttons";
    for (const choice of choices) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "pixel-pattern-group-option";
      button.dataset.patternGroupId = choice.patternGroupId;
      button.dataset.selected = choice.selected ? "true" : "false";
      button.setAttribute("aria-pressed", choice.selected ? "true" : "false");
      button.textContent = `${choice.selected ? "已選｜" : ""}${choice.displayLabel}`;
      button.addEventListener("click", () => {
        knowledgePointState = togglePixelPatternGroupSelection(knowledgePointState, choice.patternGroupId);
        renderKnowledgePointSelector();
      });
      buttons.append(button);
    }
    section.append(buttons);
    patternGroupPanel.append(section);
  }
}

function renderKnowledgePointSelector() {
  if (!knowledgePointState) return;
  const selectedIds = new Set(knowledgePointState.selectedKnowledgePointIds);
  const isSourceUnitMode = knowledgePointState.selectionMode === BATCH_A_SELECTION_MODES.SOURCE_UNIT;

  if (knowledgePointAvailabilitySummary) {
    knowledgePointAvailabilitySummary.textContent = [
      `本單元可選：${knowledgePointState.visibleCount}`,
      `尚未開放：${activeSourceSummary?.hiddenPendingCount ?? 0}`,
      `目前不可選：${activeSourceSummary?.notSelectableCount ?? 0}`,
      `全部可選：${registrySnapshot.visibleKnowledgePointCount}`
    ].join("｜");
  }

  if (knowledgePointEmptyState) {
    if (knowledgePointState.visibleCount === 0) {
      knowledgePointEmptyState.textContent = "目前此單元尚無已通過驗證的可選知識點，請使用單元出題。";
    } else if (knowledgePointState.visibleCount === 1) {
      knowledgePointEmptyState.textContent = "此單元已有 1 個可選知識點，可使用單一知識點加強。";
    } else if (isSourceUnitMode) {
      knowledgePointEmptyState.textContent = `此單元已有 ${knowledgePointState.visibleCount} 個可選知識點；切換出題模式後可進行加強或混合。`;
    } else {
      knowledgePointEmptyState.textContent = `${getPixelSelectionModeLabel(knowledgePointState.selectionMode)}｜已選 ${knowledgePointState.selectedKnowledgePointIds.length} 個。`;
    }
  }

  if (knowledgePointPanel) {
    knowledgePointPanel.replaceChildren();
    knowledgePointPanel.dataset.selectionMode = knowledgePointState.selectionMode;
    knowledgePointPanel.dataset.visibleCount = String(knowledgePointState.visibleCount);
    for (const knowledgePoint of knowledgePointState.availableKnowledgePoints) {
      const button = document.createElement("button");
      const selected = selectedIds.has(knowledgePoint.knowledgePointId);
      button.type = "button";
      button.className = "pixel-kp-option";
      button.dataset.knowledgePointId = knowledgePoint.knowledgePointId;
      button.dataset.selected = selected ? "true" : "false";
      button.disabled = isSourceUnitMode;
      button.setAttribute("aria-pressed", selected ? "true" : "false");
      button.innerHTML = `<strong>${selected ? "已選｜" : ""}${knowledgePoint.displayName}</strong><span>${knowledgePoint.unitCode}｜已通過出題驗證</span>`;
      button.addEventListener("click", () => {
        knowledgePointState = togglePixelKnowledgePointSelection(knowledgePointState, knowledgePoint.knowledgePointId);
        renderKnowledgePointSelector();
      });
      knowledgePointPanel.append(button);
    }
  }

  renderPatternGroupSelector();

  if (knowledgePointWarningList) {
    knowledgePointWarningList.replaceChildren();
    for (const warning of knowledgePointState.warnings) {
      const item = document.createElement("li");
      item.textContent = warningMessage(warning);
      knowledgePointWarningList.append(item);
    }
    knowledgePointWarningList.dataset.visible = knowledgePointState.warnings.length > 0 ? "true" : "false";
  }

  const modeLabel = getPixelSelectionModeLabel(knowledgePointState.selectionMode);
  if (previewMeta && activeSourceSummary && !lastGenerationSummary) {
    previewMeta.textContent = `${activeSourceSummary.previewText}｜模式：${modeLabel}｜已選知識點：${knowledgePointState.selectedKnowledgePointIds.length}｜題目形式：${knowledgePointState.selectedPatternGroupIds.length}`;
  }
  document.body.dataset.pixelSelectionMode = knowledgePointState.selectionMode;
  document.body.dataset.pixelSelectedKnowledgePointIds = knowledgePointState.selectedKnowledgePointIds.join(",");
  document.body.dataset.pixelSelectedPatternGroupIds = knowledgePointState.selectedPatternGroupIds.join(",");
  syncWorksheetPlan();
}

function syncKnowledgePointSelector(sourceId, preserveSelection = true) {
  knowledgePointState = createPixelKnowledgePointSelectorState({
    sourceId,
    selectionMode: preserveSelection
      ? knowledgePointState?.selectionMode ?? BATCH_A_SELECTION_MODES.SOURCE_UNIT
      : BATCH_A_SELECTION_MODES.SOURCE_UNIT,
    selectedKnowledgePointIds: preserveSelection ? knowledgePointState?.selectedKnowledgePointIds ?? [] : [],
    selectedPatternGroupIds: preserveSelection ? knowledgePointState?.selectedPatternGroupIds ?? [] : []
  });
  renderSelectionModeOptions();
  renderKnowledgePointSelector();
}

function renderSummary() {
  const summary = selectedSourceSummary();
  activeSourceSummary = summary;
  if (!summary) {
    if (sourceSummary) sourceSummary.textContent = "目前篩選條件沒有可用單元。";
    if (kpCount) kpCount.textContent = "0";
    if (unitMeta) unitMeta.textContent = "請改選年級或學期。";
    if (previewMeta) previewMeta.textContent = "目前沒有可用單元。";
    syncKnowledgePointSelector(null, false);
    renderGenerateButtonState();
    return;
  }

  if (sourceSummary) sourceSummary.textContent = summary.summaryText;
  if (kpCount) kpCount.textContent = String(summary.visibleKnowledgePoints.length);
  if (unitMeta) unitMeta.textContent = `${summary.grade} 年級｜${summary.semesterLabel}｜${summary.domain}`;
  document.body.dataset.pixelSelectedSourceId = summary.sourceId;
  syncKnowledgePointSelector(summary.sourceId, true);
}

function syncFilteredSelectors() {
  renderSemesterOptions();
  renderSourceOptions();
  renderSummary();
}

renderGradeOptions();
syncFilteredSelectors();
gradeSelect?.addEventListener("change", syncFilteredSelectors);
semesterSelect?.addEventListener("change", () => {
  renderSourceOptions();
  renderSummary();
});
sourceSelect?.addEventListener("change", renderSummary);
selectionModeSelect?.addEventListener("change", () => {
  knowledgePointState = createPixelKnowledgePointSelectorState({
    sourceId: activeSourceSummary?.sourceId,
    selectionMode: selectionModeSelect.value,
    selectedKnowledgePointIds: knowledgePointState?.selectedKnowledgePointIds ?? [],
    selectedPatternGroupIds: knowledgePointState?.selectedPatternGroupIds ?? []
  });
  renderSelectionModeOptions();
  renderKnowledgePointSelector();
});
for (const control of [questionCountInput, orderingSelect, generationSeedInput, columnsInput, rowsPerPageInput, answerKeyInput]) {
  control?.addEventListener("change", syncWorksheetPlan);
  if (control?.tagName === "INPUT" && control.type !== "checkbox") control.addEventListener("input", syncWorksheetPlan);
}
generateButton?.addEventListener("click", generateWorksheet);
document.body.dataset.pixelRegistrySourceCount = String(registrySnapshot.sourceCount);
document.body.dataset.pixelRegistryVisibleKnowledgePointCount = String(registrySnapshot.visibleKnowledgePointCount);
document.body.dataset.pixelGenerationStatus = "idle";
renderGenerateButtonState();
