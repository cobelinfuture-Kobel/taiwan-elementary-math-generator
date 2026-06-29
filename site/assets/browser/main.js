import {
  applyPreset,
  createConfigState,
  getEffectiveOrderingSeed,
  setLockOrderingSeedToGenerationSeed,
  setSeedField,
  setShowAnswerKeyPage
} from "./state/config-state.js";
import { OPERATORS } from "../../modules/core/constants.js";
import { listPresetDefinitions, getPresetDefinition } from "./state/presets.js";
import { parseQueryState, writeQueryStateFromState } from "./state/query-state.js";
import { buildWorksheetDocumentFromState } from "./pipeline/build-worksheet-document.js";
import { printPreviewFrame, renderPreviewFrame } from "./pipeline/render-preview-frame.js";
import { createConfigEditor } from "./ui/config-editor.js";

const presetDefinitions = listPresetDefinitions();
const queryState = parseQueryState();
const state = createConfigState({ presetId: queryState.presetId });

if (queryState.presetId && queryState.presetId !== state.presetId) {
  applyPreset(state, queryState.presetId);
}

if (queryState.generationSeed !== undefined) {
  setSeedField(state, "generationSeed", queryState.generationSeed);
}

if (queryState.orderingSeed !== undefined) {
  setSeedField(state, "orderingSeed", queryState.orderingSeed);
}

if (queryState.lockOrderingSeedToGenerationSeed) {
  setLockOrderingSeedToGenerationSeed(state, true);
}

if (queryState.showAnswerKeyPage) {
  setShowAnswerKeyPage(state, true);
}

const configEditor = createConfigEditor({
  state,
  onApplyEdit() {
    runGeneration();
  },
  onResetPreset() {
    resetToPreset();
  }
});

const elements = {
  presetButtons: document.querySelector("#preset-buttons"),
  questionCountInput: document.querySelector("#question-count-input"),
  columnsInput: document.querySelector("#columns-input"),
  rowsPerPageInput: document.querySelector("#rows-per-page-input"),
  orderingModeSelect: document.querySelector("#ordering-mode-select"),
  operatorAddInput: document.querySelector("#operator-add-input"),
  operatorSubtractInput: document.querySelector("#operator-subtract-input"),
  operatorMultiplyInput: document.querySelector("#operator-multiply-input"),
  operatorDivideInput: document.querySelector("#operator-divide-input"),
  operand1MinInput: document.querySelector("#operand-1-min-input"),
  operand1MaxInput: document.querySelector("#operand-1-max-input"),
  operand2MinInput: document.querySelector("#operand-2-min-input"),
  operand2MaxInput: document.querySelector("#operand-2-max-input"),
  answerMaxInput: document.querySelector("#answer-max-input"),
  generationSeedInput: document.querySelector("#generation-seed-input"),
  orderingSeedInput: document.querySelector("#ordering-seed-input"),
  lockOrderingSeedInput: document.querySelector("#lock-ordering-seed-input"),
  showAnswerKeyInput: document.querySelector("#show-answer-key-input"),
  applyEditButton: document.querySelector("#apply-edit-button"),
  resetPresetButton: document.querySelector("#reset-preset-button"),
  regenerateButton: document.querySelector("#regenerate-button"),
  printButton: document.querySelector("#print-button"),
  statusPanel: document.querySelector("#status-panel"),
  validationPanel: document.querySelector("#validation-panel"),
  previewFrame: document.querySelector("#preview-frame"),
  previewMeta: document.querySelector("#preview-meta")
};

function renderPresetButtons() {
  elements.presetButtons.innerHTML = presetDefinitions.map((preset) => [
    `<button type="button" class="preset-button" data-preset-id="${preset.id}" aria-pressed="${preset.id === state.presetId ? "true" : "false"}">`,
    `${preset.label}`,
    "</button>"
  ].join("")).join("");

  elements.presetButtons.querySelectorAll("[data-preset-id]").forEach((button) => {
    button.addEventListener("click", () => {
      applyPreset(state, button.getAttribute("data-preset-id"));
      syncAllControlsFromState();
      renderPresetButtons();
      configEditor.syncEditorFromState();
      writeQueryStateFromState(state);
      runGeneration();
    });
  });
}

function syncAllControlsFromState() {
  elements.generationSeedInput.value = state.seeds.generationSeed;
  elements.orderingSeedInput.value = state.seeds.orderingSeed;
  elements.lockOrderingSeedInput.checked = state.seeds.lockOrderingSeedToGenerationSeed;
  elements.showAnswerKeyInput.checked = state.draftConfig.printLayout.showAnswerKeyPage;
  elements.orderingSeedInput.disabled = state.seeds.lockOrderingSeedToGenerationSeed && !state.seeds.orderingSeed;
  configEditor.syncFormControlsFromState();
}

function renderStatus() {
  const questionPages = state.derived.worksheetDocument?.summary?.questionPageCount ?? 0;
  const answerPages = state.derived.worksheetDocument?.summary?.answerKeyPageCount ?? 0;
  const effectiveOrderingSeed = getEffectiveOrderingSeed(state);
  const lines = [];

  if (state.ui.isGenerating) {
    elements.statusPanel.dataset.tone = "";
    lines.push("正在產生練習題…");
  } else if (state.ui.lastError) {
    elements.statusPanel.dataset.tone = "error";
    lines.push(state.ui.lastError);
    if (state.derived.renderedHtml) {
      lines.push("目前保留上一份成功產生的預覽。");
    }
  } else if (state.ui.hasRendered) {
    elements.statusPanel.dataset.tone = "success";
    lines.push(`已完成「${state.presetId}」題組，共 ${questionPages} 頁題目、${answerPages} 頁答案。`);
    lines.push(`目前排序種子：${effectiveOrderingSeed === null ? "沿用產生種子" : effectiveOrderingSeed || "未指定"}`);
  } else {
    elements.statusPanel.dataset.tone = "";
    lines.push("尚未產生新的練習題。");
  }

  elements.statusPanel.innerHTML = lines.map((line) => `<p>${line}</p>`).join("");
  elements.previewMeta.textContent = state.ui.hasRendered
    ? `題目數量：${state.derived.worksheetDocument.summary.questionCount}｜題目頁：${questionPages}｜答案頁：${answerPages}`
    : "尚未產生新的練習題。";
}

function renderValidation() {
  const validation = state.derived.validation;
  const issues = [
    ...(validation?.errors ?? []),
    ...(validation?.warnings ?? [])
  ];

  elements.validationPanel.dataset.hasErrors = validation?.ok === false ? "true" : "false";

  if (issues.length === 0) {
    elements.validationPanel.innerHTML = "<p>目前沒有驗證訊息。</p>";
    return;
  }

  const listItems = issues.map((issue) => {
    const level = issue?.level ?? issue?.severity ?? "info";
    return `<li><strong>${level}</strong> ${issue.message}</li>`;
  }).join("");

  elements.validationPanel.innerHTML = `<ol class="validation-list">${listItems}</ol>`;
}

function updatePrintButton() {
  elements.printButton.disabled = !state.ui.hasRendered || Boolean(state.ui.lastError);
}

function runGeneration() {
  state.ui.isGenerating = true;
  renderStatus();
  renderValidation();
  updatePrintButton();

  const result = buildWorksheetDocumentFromState(state);
  state.ui.isGenerating = false;
  state.derived.validation = result.validation ?? {
    ok: false,
    errors: result.errors ?? [],
    warnings: result.warnings ?? []
  };

  if (!result.ok) {
    state.ui.lastError = result.errors?.[0]?.message ?? `產生失敗：${result.stage}`;
    renderStatus();
    renderValidation();
    updatePrintButton();
    return;
  }

  const rendered = renderPreviewFrame(elements.previewFrame, result.worksheetDocument, {
    stylesheetHref: "./assets/styles/print-styles.css"
  });

  state.ui.lastError = null;
  state.ui.isDirty = false;
  state.ui.hasRendered = true;
  state.ui.lastGeneratedAt = new Date().toISOString();
  state.derived.allocation = result.allocation;
  state.derived.worksheetDocument = result.worksheetDocument;
  state.derived.renderedHtml = rendered.html;

  renderStatus();
  renderValidation();
  updatePrintButton();
  writeQueryStateFromState(state);
}

function resetToPreset() {
  const preset = getPresetDefinition(state.presetId);

  state.draftConfig = preset.draftConfig;
  state.seeds = preset.seeds;
  state.ui.isDirty = true;
  state.derived.validation = null;

  syncAllControlsFromState();
  configEditor.syncEditorFromState();
  writeQueryStateFromState(state);
  runGeneration();
}

elements.generationSeedInput.addEventListener("input", (event) => {
  setSeedField(state, "generationSeed", event.currentTarget.value);
  writeQueryStateFromState(state);
});

elements.orderingSeedInput.addEventListener("input", (event) => {
  setSeedField(state, "orderingSeed", event.currentTarget.value);
  writeQueryStateFromState(state);
});

elements.lockOrderingSeedInput.addEventListener("change", (event) => {
  setLockOrderingSeedToGenerationSeed(state, event.currentTarget.checked);
  syncAllControlsFromState();
  writeQueryStateFromState(state);
});

elements.showAnswerKeyInput.addEventListener("change", (event) => {
  setShowAnswerKeyPage(state, event.currentTarget.checked);
  writeQueryStateFromState(state);
  runGeneration();
});

elements.questionCountInput.addEventListener("input", (event) => {
  configEditor.handleQuestionCountChange(event.currentTarget.value);
  writeQueryStateFromState(state);
});

elements.columnsInput.addEventListener("input", (event) => {
  configEditor.handleColumnsChange(event.currentTarget.value);
  writeQueryStateFromState(state);
});

elements.rowsPerPageInput.addEventListener("input", (event) => {
  configEditor.handleRowsPerPageChange(event.currentTarget.value);
  writeQueryStateFromState(state);
});

elements.orderingModeSelect.addEventListener("change", (event) => {
  configEditor.handleOrderingModeChange(event.currentTarget.value);
  writeQueryStateFromState(state);
});

elements.applyEditButton.addEventListener("click", () => {
  configEditor.handleEdit();
});

elements.resetPresetButton.addEventListener("click", () => {
  configEditor.handleResetPreset();
});

elements.operatorAddInput.addEventListener("change", (event) => {
  configEditor.handleOperatorToggle(OPERATORS.ADD, event.currentTarget.checked);
  writeQueryStateFromState(state);
});

elements.operatorSubtractInput.addEventListener("change", (event) => {
  configEditor.handleOperatorToggle(OPERATORS.SUBTRACT, event.currentTarget.checked);
  writeQueryStateFromState(state);
});

elements.operatorMultiplyInput.addEventListener("change", (event) => {
  configEditor.handleOperatorToggle(OPERATORS.MULTIPLY, event.currentTarget.checked);
  writeQueryStateFromState(state);
});

elements.operatorDivideInput.addEventListener("change", (event) => {
  configEditor.handleOperatorToggle(OPERATORS.DIVIDE, event.currentTarget.checked);
  writeQueryStateFromState(state);
});

elements.operand1MinInput.addEventListener("input", (event) => {
  configEditor.handleOperandRangeChange(1, "min", event.currentTarget.value);
  writeQueryStateFromState(state);
});

elements.operand1MaxInput.addEventListener("input", (event) => {
  configEditor.handleOperandRangeChange(1, "max", event.currentTarget.value);
  writeQueryStateFromState(state);
});

elements.operand2MinInput.addEventListener("input", (event) => {
  configEditor.handleOperandRangeChange(2, "min", event.currentTarget.value);
  writeQueryStateFromState(state);
});

elements.operand2MaxInput.addEventListener("input", (event) => {
  configEditor.handleOperandRangeChange(2, "max", event.currentTarget.value);
  writeQueryStateFromState(state);
});

elements.answerMaxInput.addEventListener("input", (event) => {
  configEditor.handleAnswerMaxChange(event.currentTarget.value);
  writeQueryStateFromState(state);
});

elements.regenerateButton.addEventListener("click", () => {
  runGeneration();
});

elements.printButton.addEventListener("click", () => {
  printPreviewFrame(elements.previewFrame);
});

renderPresetButtons();
syncAllControlsFromState();
configEditor.syncEditorFromState();
renderStatus();
renderValidation();
runGeneration();
