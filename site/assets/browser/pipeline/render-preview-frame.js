import "../g4b-u04-public-controls.js";
import { renderWorksheetDocumentToHtml } from "../../../modules/renderer/html-renderer-s73-extension.js";

function suppressAnswerKey(html) {
  return String(html).replace(/<section class="g5a-u02-section g5a-u02-section--answer-key">[\s\S]*?<\/section><\/main>/, "</main>");
}

export function renderPreviewFrame(previewFrame, worksheetDocument, options = {}) {
  if (!previewFrame) {
    throw new Error("Preview frame element is required.");
  }

  if (worksheetDocument?.staticHtmlUrl) {
    previewFrame.dataset.staticCandidateStatus = "loading";
    fetch(worksheetDocument.staticHtmlUrl, { cache: "force-cache" })
      .then((response) => {
        if (!response.ok) throw new Error(`Static candidate fetch failed: ${response.status}`);
        return response.text();
      })
      .then((sourceHtml) => {
        const html = worksheetDocument.staticHtmlTransform?.suppressAnswerKey
          ? suppressAnswerKey(sourceHtml)
          : sourceHtml;
        previewFrame.srcdoc = html
          .replace('content="S93 G5A-U02 hidden browser pipeline"', 'content="S94 G5A-U02 public preview candidate"')
          .replace('data-s93-hidden-browser-pipeline="true"', 'data-s94-public-preview-candidate="true"');
        previewFrame.dataset.staticCandidateStatus = "ready";
      })
      .catch((error) => {
        previewFrame.dataset.staticCandidateStatus = "error";
        previewFrame.srcdoc = `<!doctype html><html lang="zh-Hant"><body><p>公開候選卷載入失敗：${String(error.message ?? error)}</p></body></html>`;
      });
    return { html: null, staticHtmlUrl: worksheetDocument.staticHtmlUrl };
  }

  const html = renderWorksheetDocumentToHtml(worksheetDocument, {
    title: options.title ?? "Math Worksheet Generator Preview",
    stylesheetHref: options.stylesheetHref ?? "./assets/styles/print-styles.css",
    debugDataAttributes: options.debugDataAttributes ?? true
  });

  previewFrame.srcdoc = html;

  return { html };
}

export function printPreviewFrame(previewFrame) {
  const previewWindow = previewFrame?.contentWindow;
  if (!previewWindow) {
    throw new Error("Preview frame window is not available.");
  }

  previewWindow.focus();
  previewWindow.print();
}
