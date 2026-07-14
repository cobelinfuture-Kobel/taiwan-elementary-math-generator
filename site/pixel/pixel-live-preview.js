import { subscribePixelGeneration } from "./pixel-generation-controller.js";
import {
  clearPixelWorksheetPreview,
  renderPixelWorksheetPreview
} from "./pixel-preview-controller.js";

const representationStylesheet = document.createElement("link");
representationStylesheet.rel = "stylesheet";
representationStylesheet.href = "./pixel-s57f6.css";
representationStylesheet.dataset.publicSelectorStyles = "s57f6";
document.head.append(representationStylesheet);

const previewFrame = document.getElementById("pixel-preview-frame");
const previewFrameWrap = document.getElementById("pixel-preview-frame-wrap");
const previewEmpty = document.getElementById("pixel-preview-empty");
const previewMeta = document.getElementById("pixel-preview-meta");

function setPreviewStatus(status) {
  if (previewFrameWrap) previewFrameWrap.dataset.status = status;
  document.body.dataset.pixelPreviewStatus = status;
}

subscribePixelGeneration((execution) => {
  const worksheetDocument = execution?.result?.worksheetDocument ?? null;
  if (!execution?.summary?.ok || !worksheetDocument) {
    clearPixelWorksheetPreview(previewFrame);
    if (previewEmpty) previewEmpty.hidden = false;
    if (previewMeta) previewMeta.textContent = execution?.summary?.statusText ?? "題目預覽建立失敗。";
    setPreviewStatus("error");
    return;
  }

  const preview = renderPixelWorksheetPreview(previewFrame, worksheetDocument);
  if (previewEmpty) previewEmpty.hidden = true;
  if (previewMeta) {
    const details = [
      `${preview.title ?? "考卷"}`,
      `${preview.questionCount} 題`,
      `題目頁 ${preview.questionPageCount}`,
      `答案 ${preview.answerKeyItemCount} 題`,
      `答案頁 ${preview.answerKeyPageCount}`,
    ];
    if (worksheetDocument.appliedLayoutText) details.push(worksheetDocument.appliedLayoutText);
    if (worksheetDocument.layoutNoticeText) details.push(worksheetDocument.layoutNoticeText);
    previewMeta.textContent = details.join("｜");
  }
  if (previewFrame) previewFrame.title = `${preview.title ?? "數學題目卷"}預覽`;
  document.body.dataset.pixelPreviewWorksheetId = preview.worksheetId ?? "";
  document.body.dataset.pixelPreviewQuestionCount = String(preview.questionCount);
  document.body.dataset.pixelPreviewAnswerKeyItemCount = String(preview.answerKeyItemCount);
  document.body.dataset.pixelLayoutMode = worksheetDocument.layoutResolution?.layoutMode ?? "";
  document.body.dataset.pixelLayoutCapped = String(worksheetDocument.layoutResolution?.capped ?? false);
  setPreviewStatus("ready");
});

setPreviewStatus("empty");
