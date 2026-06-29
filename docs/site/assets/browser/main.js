import {
  applyPreset,
  createConfigState,
  getEffectiveOrderingSeed,
  setLockOrderingSeedToGenerationSeed,
  setSeedField,
  setShowAnswerKeyPage
} from "./state/config-state.js";
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

// ─── Config editor ──────────────────────────────────────────────────

const configEditor = createConfigEditor({
  state,
  onApplyEdit() {
    runGeneration();
  },
  onResetPreset() {
    resetToPreset();
  }
});

// ─── Element references ─────────────────────────────────────────────

const elements = {
  presetButtons: document.querySelector("#preset-buttons"),
  questionCountInput: document.querySelector("#question-count-input"),
  columnsInput: document.querySelector("#columns-input"),
  rowsPerPageInput: document.querySelector("#rows-per-page-input"),
  orderingModeSelect: document.querySelector("#ordering-mode-select"),
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

// ─── Rendering helpers ──────────────────────────────────────────────

function formatIssue(issue) {
  const path = issue?.path ? ` (${issue.path})` : "";
  return `${issue?.code ?? "unknown"}${path}: ${issue?.message ?? "Unknown issue."}`;
}

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
  const statusLines = [];

  if (state.ui.isGenerating) {
    state.ui.lastError = null;
    elements.statusPanel.dataset.tone = "";
    statusLines.push("正在產生練習卷⋯⋯");
  } else if (state.ui.lastError) {
    elements.statusPanel.dataset.tone = "error";
    statusLines.push(state.ui.lastError);
    if (state.derived.renderedHtml) {
      statusLines.push("已保留最後一次有效的預覽。");
    }
  } else if (state.ui.hasRendered) {
    elements.statusPanel.dataset.tone = "success";
    statusLines.push(`已產生預設「${state.presetId}」，共 ${questionPages} 頁題目及 ${answerPages} 頁答案。`);
    statusLines.push(`使用中的排序種子：${effectiveOrderingSeed === null ? "使用出題種子" : effectiveOrderingSeed || "無"}`);
  } else {
    elements.statusPanel.dataset.tone = "";
    statusLines.push("就緒，可產生練習卷。");
  }

  elements.statusPanel.innerHTML = statusLines.map((line) => `<p>${line}</p>`).join("");
  elements.previewMeta.textContent = state.ui.hasRendered
    ? `題目數：${state.derived.worksheetDocument.summary.questionCount} | 題目頁數：${questionPages} | 答案頁數：${answerPages}`
    : "尚未產生練習卷。";
}

function renderValidation() {
  const validation = state.derived.validation;
  const issues = [
    ...(validation?.errors ?? []),
    ...(validation?.warnings ?? [])
  ];

  elements.validationPanel.dataset.hasErrors = validation?.ok === false ? "true" : "false";

  if (issues.length === 0) {
    elements.validationPanel.innerHTML = "<p>無驗證問題。</p>";
    return;
  }

  const listItems = issues.map((issue) => `<li>${formatIssue(issue)}</li>`).join("");
  elements.validationPanel.innerHTML = `<ol class="validation-list">${listItems}</ol>`;
}

function updatePrintButton() {
  elements.printButton.disabled = !state.ui.hasRendered || Boolean(state.ui.lastError);
}

// ─── Generation ─────────────────────────────────────────────────────

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
    state.ui.lastError = `產生失敗，階段：${result.stage}`;
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

// ─── Reset to preset ────────────────────────────────────────────────

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

// ─── Seed & answer-key event listeners ──────────────────────────────

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
});

// ─── Form control event listeners ───────────────────────────────────

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

// ─── Config editor event listeners ──────────────────────────────────

elements.applyEditButton.addEventListener("click", () => {
  configEditor.handleEdit();
});

elements.resetPresetButton.addEventListener("click", () => {
  configEditor.handleResetPreset();
});

// ─── Toolbar ────────────────────────────────────────────────────────

elements.regenerateButton.addEventListener("click", () => {
  runGeneration();
});

elements.printButton.addEventListener("click", () => {
  printPreviewFrame(elements.previewFrame);
});

// ─── Initial render ─────────────────────────────────────────────────

renderPresetButtons();
syncAllControlsFromState();
configEditor.syncEditorFromState();
renderStatus();
renderValidation();
runGeneration();