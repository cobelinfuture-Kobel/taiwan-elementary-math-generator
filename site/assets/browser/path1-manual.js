import {
  buildPath1ManualWorksheet,
  listPath1ManualWorksheetBlocks,
} from "./pipeline/build-path1-manual-worksheet.js";
import { printPreviewFrame, renderPreviewFrame } from "./pipeline/render-preview-frame.js";

const blockSelect = document.getElementById("path1-block-select");
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

function syncNavigation() {
  const index = selectedIndex();
  previousButton.disabled = index <= 0;
  nextButton.disabled = index >= blocks.length - 1;
  setPanel(
    statusPanel,
    `目前選擇 ${blocks[index].blockId}｜${blocks[index].title}。完成紙本後，請手動選擇下一個 Block。`,
    "",
  );
}

function moveSelection(delta) {
  const nextIndex = Math.max(0, Math.min(blocks.length - 1, selectedIndex() + delta));
  blockSelect.value = blocks[nextIndex].blockId;
  syncNavigation();
  hasGeneratedWorksheet = false;
  printButton.disabled = true;
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
  setPanel(statusPanel, `正在產生 ${blockId} 練習題...`, "");
  printButton.disabled = true;
  hasGeneratedWorksheet = false;

  const result = buildPath1ManualWorksheet({
    blockId,
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
  setPanel(statusPanel, `${blockId} 已產生 ${count} 題。可直接列印，或在瀏覽器列印視窗選「另存為 PDF」。`, "success");
  previewMeta.textContent = `${worksheetTitle}｜${count} 題｜${answerKeyInput.checked ? "含答案頁" : "不含答案頁"}`;
}

populateBlocks();
syncNavigation();

blockSelect.addEventListener("change", () => {
  syncNavigation();
  hasGeneratedWorksheet = false;
  printButton.disabled = true;
});
previousButton.addEventListener("click", () => moveSelection(-1));
nextButton.addEventListener("click", () => moveSelection(1));
generateButton.addEventListener("click", generate);
printButton.addEventListener("click", () => {
  if (!hasGeneratedWorksheet) return;
  printPreviewFrame(previewFrame);
});