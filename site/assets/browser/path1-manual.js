import {
  buildPath1ManualWorksheet,
  listPath1ManualWorksheetBlocks,
} from "./pipeline/build-path1-manual-worksheet-practice-mode-entry.js";
import { printPreviewFrame, renderPreviewFrame } from "./pipeline/render-preview-frame.js";
import {
  PATH1_MANUAL_DEFAULT_PRACTICE_MODE,
  PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
  normalizePath1ManualQueryState,
  parsePath1ManualQueryState,
  path1ManualBlockSupportsEqualGroupsTransfer,
  serializePath1ManualQueryState,
} from "./state/path1-manual-query-state.js";

const blockSelect = document.getElementById("path1-block-select");
const practiceModeSelect = document.getElementById("path1-practice-mode");
const questionCountInput = document.getElementById("path1-question-count");
const seedInput = document.getElementById("path1-generation-seed");
const answerKeyInput = document.getElementById("path1-answer-key");
const columnsInput = document.getElementById("path1-columns");
const rowsInput = document.getElementById("path1-rows");
const generateButton = document.getElementById("path1-generate-button");
const previousButton = document.getElementById("path1-previous-button");
const nextButton = document.getElementById("path1-next-button");
const printButton = document.getElementById("path1-print-button");
const statusPanel = document.getElementById("path1-status-panel");
const validationPanel = document.getElementById("path1-validation-panel");
const previewMeta = document.getElementById("path1-preview-meta");
const previewFrame = document.getElementById("path1-preview-frame");

const blocks = listPath1ManualWorksheetBlocks();
const validBlockIds = blocks.map((block) => block.blockId);
let hasGeneratedWorksheet = false;

function setPanel(panel, message, tone = "") {
  if (!panel) return;
  panel.textContent = message;
  panel.dataset.tone = tone;
}

function populateBlocks() {
  blockSelect.replaceChildren();
  for (const block of blocks) {
    const option = document.createElement("option");
    option.value = block.blockId;
    option.textContent = `${block.blockId}｜${block.title}`;
    blockSelect.append(option);
  }
}

function selectedIndex() {
  return Math.max(0, blocks.findIndex((block) => block.blockId === blockSelect.value));
}

function practiceModeLabel() {
  return practiceModeSelect.value === PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE
    ? "文字建模練習"
    : "算式練習";
}

function warningMessage(warnings = []) {
  const codes = new Set(warnings.map((entry) => entry.code));
  if (codes.has("PATH1_PUBLIC_TRANSFER_MODE_BLOCK_NOT_SUPPORTED")) {
    return "文字建模練習目前只開放 P1-01、P1-02；此 Block 已切回算式練習。";
  }
  if (codes.has("PATH1_PUBLIC_BLOCK_QUERY_FALLBACK")) {
    return "網址中的 Path 1 Block 無效，已切回 P1-01。";
  }
  if (codes.has("PATH1_PUBLIC_PRACTICE_MODE_QUERY_FALLBACK")) {
    return "網址中的練習類型無效，已切回算式練習。";
  }
  return "";
}

function syncPracticeModeAvailability() {
  const transferOption = practiceModeSelect.querySelector(
    `option[value="${PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE}"]`,
  );
  if (transferOption) {
    transferOption.disabled = !path1ManualBlockSupportsEqualGroupsTransfer(blockSelect.value);
  }
}

function syncNavigation(message = "") {
  const index = selectedIndex();
  previousButton.disabled = index <= 0;
  nextButton.disabled = index >= blocks.length - 1;
  syncPracticeModeAvailability();
  setPanel(
    statusPanel,
    message || `目前選擇 ${blocks[index].blockId}｜${blocks[index].title}｜${practiceModeLabel()}。完成紙本後，請手動選擇下一個 Block。`,
    "",
  );
}

function writePublicQueryState() {
  const serialized = serializePath1ManualQueryState({
    path1BlockId: blockSelect.value,
    practiceMode: practiceModeSelect.value,
  }, {
    validBlockIds,
    search: window.location.search,
  });
  const nextUrl = `${window.location.pathname}${serialized.search}${window.location.hash}`;
  window.history.replaceState({}, "", nextUrl);
  return serialized;
}

function invalidateWorksheet() {
  hasGeneratedWorksheet = false;
  printButton.disabled = true;
}

function applyPublicSelection({ path1BlockId, practiceMode }, { updateUrl = true } = {}) {
  const normalized = normalizePath1ManualQueryState(
    { path1BlockId, practiceMode },
    { validBlockIds },
  );
  blockSelect.value = normalized.path1BlockId;
  practiceModeSelect.value = normalized.practiceMode;
  syncPracticeModeAvailability();
  if (updateUrl) writePublicQueryState();
  syncNavigation(warningMessage(normalized.warnings));
  invalidateWorksheet();
  return normalized;
}

function moveSelection(delta) {
  const nextIndex = Math.max(0, Math.min(blocks.length - 1, selectedIndex() + delta));
  applyPublicSelection({
    path1BlockId: blocks[nextIndex].blockId,
    practiceMode: practiceModeSelect.value,
  });
}

function renderIssues(result) {
  const errors = result?.errors ?? [];
  const warnings = result?.warnings ?? [];
  validationPanel.replaceChildren();
  validationPanel.dataset.hasErrors = errors.length > 0 ? "true" : "false";
  if (errors.length === 0 && warnings.length === 0) {
    validationPanel.textContent = "路徑題目驗證通過。";
    return;
  }
  const list = document.createElement("ul");
  list.className = "validation-list";
  for (const issue of [...errors, ...warnings]) {
    const item = document.createElement("li");
    item.textContent = typeof issue === "string" ? issue : `${issue.code ?? "PATH1_NOTICE"}｜${JSON.stringify(issue)}`;
    list.append(item);
  }
  validationPanel.append(list);
}

function generate() {
  const blockId = blockSelect.value;
  const practiceMode = practiceModeSelect.value;
  setPanel(statusPanel, `正在產生 ${blockId}｜${practiceModeLabel()}...`, "");
  printButton.disabled = true;
  hasGeneratedWorksheet = false;

  const result = buildPath1ManualWorksheet({
    blockId,
    practiceMode,
    questionCount: Number(questionCountInput.value),
    generationSeed: seedInput.value || "path1-manual",
    includeAnswerKey: answerKeyInput.checked,
    printLayout: {
      paperSize: "A4",
      columns: Number(columnsInput.value),
      rowsPerPage: Number(rowsInput.value),
      showQuestionNumbers: true,
    },
  });

  renderIssues(result);
  if (!result.ok || !result.worksheetDocument) {
    setPanel(statusPanel, `${blockId} 目前無法產生，請查看下方驗證訊息。`, "error");
    previewMeta.textContent = "產生失敗。";
    return;
  }

  const worksheetDocument = result.worksheetDocument;
  const worksheetTitle = worksheetDocument.configSnapshot?.title ?? `Path 1｜${blockId}`;
  renderPreviewFrame(previewFrame, worksheetDocument, {
    title: worksheetTitle,
    outputMode: "studentPrint",
    stylesheetHref: "../assets/styles/print-styles.css",
  });
  const count = worksheetDocument.report?.summary?.questionCount
    ?? worksheetDocument.questionCount
    ?? worksheetDocument.questions?.length
    ?? 0;
  hasGeneratedWorksheet = true;
  printButton.disabled = false;
  setPanel(statusPanel, `${blockId}｜${practiceModeLabel()}已產生 ${count} 題。可直接列印，或在瀏覽器列印視窗選「另存為 PDF」。`, "success");
  previewMeta.textContent = `${worksheetTitle}｜${practiceModeLabel()}｜${count} 題｜${answerKeyInput.checked ? "含答案頁" : "不含答案頁"}`;
}

populateBlocks();
const initialState = parsePath1ManualQueryState(window.location.search, { validBlockIds });
blockSelect.value = initialState.path1BlockId;
practiceModeSelect.value = initialState.practiceMode;
syncPracticeModeAvailability();
writePublicQueryState();
syncNavigation(warningMessage(initialState.warnings));

blockSelect.addEventListener("change", () => {
  applyPublicSelection({
    path1BlockId: blockSelect.value,
    practiceMode: practiceModeSelect.value,
  });
});
practiceModeSelect.addEventListener("change", () => {
  applyPublicSelection({
    path1BlockId: blockSelect.value,
    practiceMode: practiceModeSelect.value,
  });
});
previousButton.addEventListener("click", () => moveSelection(-1));
nextButton.addEventListener("click", () => moveSelection(1));
generateButton.addEventListener("click", generate);
printButton.addEventListener("click", () => {
  if (!hasGeneratedWorksheet) return;
  printPreviewFrame(previewFrame);
});
