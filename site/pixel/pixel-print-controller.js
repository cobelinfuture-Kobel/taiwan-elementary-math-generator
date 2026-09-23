import { printPreviewFrame } from "../assets/browser/pipeline/render-preview-frame.js";

export function summarizePixelPrintAvailability(execution = {}) {
  const summary = execution?.summary ?? {};
  const ready = summary.ok === true && Boolean(execution?.result?.worksheetDocument);
  const answerKeyItemCount = Number(summary.answerKeyItemCount ?? 0);
  const answerKeyPageCount = Number(summary.answerKeyPageCount ?? 0);
  const includesAnswerKey = answerKeyItemCount > 0 || answerKeyPageCount > 0;
  const questionCount = Number(summary.questionCount ?? 0);
  const questionPageCount = Number(summary.questionPageCount ?? 0);

  return Object.freeze({
    ready,
    worksheetId: summary.worksheetId ?? null,
    questionCount,
    questionPageCount,
    answerKeyItemCount,
    answerKeyPageCount,
    includesAnswerKey,
    outputLabel: includesAnswerKey ? "題目卷＋答案頁" : "僅題目卷",
    buttonLabel: includesAnswerKey ? "列印題目卷＋答案頁" : "列印題目卷",
    statusText: ready
      ? `可列印｜${questionCount} 題｜題目頁 ${questionPageCount}｜${includesAnswerKey ? `答案 ${answerKeyItemCount} 題／${answerKeyPageCount} 頁` : "不含答案頁"}`
      : "尚無可列印的考卷，請先產生並確認預覽。"
  });
}

export function printPixelWorksheet(previewFrame, execution) {
  const availability = summarizePixelPrintAvailability(execution);
  if (!availability.ready) {
    throw new Error("Pixel print requires a successful worksheet generation result.");
  }
  printPreviewFrame(previewFrame);
  return availability;
}
