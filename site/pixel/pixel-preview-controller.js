import { renderPreviewFrame } from "../assets/browser/pipeline/render-preview-frame.js";

export const PIXEL_PREVIEW_STYLESHEET_HREF = "../assets/styles/print-styles.css";

export function renderPixelWorksheetPreview(previewFrame, worksheetDocument) {
  if (!worksheetDocument) {
    throw new Error("Pixel worksheet preview requires a worksheetDocument.");
  }

  const rendered = renderPreviewFrame(previewFrame, worksheetDocument, {
    title: worksheetDocument.title,
    outputMode: "studentPrint",
    stylesheetHref: PIXEL_PREVIEW_STYLESHEET_HREF,
    debugDataAttributes: true
  });

  return Object.freeze({
    html: rendered.html,
    worksheetId: worksheetDocument.worksheetId ?? null,
    title: worksheetDocument.title ?? null,
    questionCount: worksheetDocument.summary?.questionCount ?? worksheetDocument.generatedQuestions?.length ?? 0,
    answerKeyItemCount: worksheetDocument.answerKeyItems?.length ?? 0,
    questionPageCount: worksheetDocument.summary?.questionPageCount ?? worksheetDocument.questionPages?.length ?? 0,
    answerKeyPageCount: worksheetDocument.summary?.answerKeyPageCount ?? worksheetDocument.answerKeyPages?.length ?? 0
  });
}

export function clearPixelWorksheetPreview(previewFrame) {
  if (!previewFrame) return;
  previewFrame.removeAttribute?.("srcdoc");
  if ("srcdoc" in previewFrame) previewFrame.srcdoc = "";
}
