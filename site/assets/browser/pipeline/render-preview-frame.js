import { renderWorksheetDocumentToHtml } from "../../../modules/renderer/html-renderer-s59j-r1-extension.js";

export function renderPreviewFrame(previewFrame, worksheetDocument, options = {}) {
  if (!previewFrame) {
    throw new Error("Preview frame element is required.");
  }

  const html = renderWorksheetDocumentToHtml(worksheetDocument, {
    title: options.title ?? "Math Worksheet Generator Preview",
    stylesheetHref: options.stylesheetHref ?? "./assets/styles/print-styles.css",
    debugDataAttributes: options.debugDataAttributes ?? true
  });

  previewFrame.srcdoc = html;

  return {
    html
  };
}

export function printPreviewFrame(previewFrame) {
  const previewWindow = previewFrame?.contentWindow;
  if (!previewWindow) {
    throw new Error("Preview frame window is not available.");
  }

  previewWindow.focus();
  previewWindow.print();
}
