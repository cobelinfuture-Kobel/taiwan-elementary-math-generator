import "./g4b-u04-public-controls.js";
import { subscribePixelGeneration } from "./pixel-generation-controller.js";
import {
  printPixelWorksheet,
  summarizePixelPrintAvailability
} from "./pixel-print-controller.js";

const previewFrame = document.getElementById("pixel-preview-frame");
const printButton = document.getElementById("pixel-print-button");
const outputSummary = document.getElementById("pixel-output-summary");
const answerKeyInput = document.getElementById("pixel-answer-key");
const watchedControlIds = [
  "pixel-grade-select",
  "pixel-semester-select",
  "pixel-source-select",
  "pixel-selection-mode-select",
  "pixel-question-count",
  "pixel-ordering",
  "pixel-g4b-u04-question-mode",
  "pixel-g4b-u04-context-mode",
  "pixel-g4b-u04-layout-mode",
  "pixel-g5a-question-mode",
  "pixel-g5a-depth-mode",
  "pixel-g5a-context-mode",
  "pixel-generation-seed",
  "pixel-columns",
  "pixel-rows-per-page",
  "pixel-answer-key"
];

let printableExecution = null;
let printIsStale = false;

function setPrintStatus(status) {
  document.body.dataset.pixelPrintStatus = status;
  if (outputSummary) outputSummary.dataset.status = status;
}

function renderPrintSurface() {
  const availability = summarizePixelPrintAvailability(printableExecution ?? {});
  const ready = availability.ready && !printIsStale;
  if (printButton) {
    printButton.disabled = !ready;
    printButton.textContent = ready ? availability.buttonLabel : "請先產生考卷";
  }
  if (outputSummary) {
    outputSummary.textContent = printIsStale
      ? "設定已變更；目前預覽仍是上一版，請重新產生後再列印。"
      : availability.statusText;
  }
  document.body.dataset.pixelOutputIncludesAnswerKey = String(availability.includesAnswerKey);
  document.body.dataset.pixelOutputAnswerKeyPageCount = String(availability.answerKeyPageCount);
  setPrintStatus(printIsStale ? "stale" : ready ? "ready" : "empty");
}

function markPrintStale() {
  if (!printableExecution) return;
  printIsStale = true;
  renderPrintSurface();
}

subscribePixelGeneration((execution) => {
  printableExecution = execution?.summary?.ok ? execution : null;
  printIsStale = false;
  renderPrintSurface();
});

document.addEventListener("pixel:worksheet-stale", markPrintStale);

for (const id of watchedControlIds) {
  const control = document.getElementById(id);
  control?.addEventListener("change", markPrintStale);
  if (control?.tagName === "INPUT" && control.type !== "checkbox") {
    control.addEventListener("input", markPrintStale);
  }
}

for (const panelId of ["pixel-kp-panel", "pixel-pattern-group-panel"]) {
  document.getElementById(panelId)?.addEventListener("click", (event) => {
    if (event.target.closest?.("[data-knowledge-point-id], [data-pattern-group-id]")) markPrintStale();
  });
}

printButton?.addEventListener("click", () => {
  try {
    const availability = printPixelWorksheet(previewFrame, printableExecution);
    if (outputSummary) outputSummary.textContent = `已開啟列印視窗｜${availability.outputLabel}`;
    setPrintStatus("printing");
  } catch (error) {
    if (outputSummary) outputSummary.textContent = error instanceof Error ? error.message : String(error);
    setPrintStatus("error");
  }
});

if (answerKeyInput && outputSummary) {
  outputSummary.setAttribute("aria-describedby", answerKeyInput.id);
}

renderPrintSurface();
