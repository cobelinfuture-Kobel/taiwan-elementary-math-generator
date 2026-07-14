import "../g4b-u04-public-controls.js";
import { renderWorksheetDocumentToHtml } from "../../../modules/renderer/html-renderer-s73-extension.js";

function suppressAnswerKey(html) {
  return String(html).replace(/<section class="g5a-u02-section g5a-u02-section--answer-key">[\s\S]*?<\/section><\/main>/, "</main>");
}

function escapeAttribute(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function stampPublicControls(html, worksheetDocument) {
  const controls = worksheetDocument?.publicControls;
  if (!controls) return String(html);
  const attributes = [
    `data-public-question-mode="${escapeAttribute(controls.questionMode)}"`,
    `data-public-depth-mode="${escapeAttribute(controls.depthMode)}"`,
    `data-public-context-mode="${escapeAttribute(controls.contextMode)}"`,
    `data-public-layout-mode="${escapeAttribute(controls.layoutMode)}"`,
    `data-public-generic-fallback="${controls.genericFallback ? "true" : "false"}"`,
  ].join(" ");
  const meta = `<meta name="worksheet-public-controls" content="${escapeAttribute(`${controls.questionMode}|${controls.depthMode}|${controls.contextMode}|${controls.layoutMode ?? ""}`)}">`;
  return String(html)
    .replace("</head>", `${meta}</head>`)
    .replace(/<body([^>]*)>/, `<body$1 ${attributes}>`);
}

function stampG4BU04LayoutReadback(html, worksheetDocument) {
  const layout = worksheetDocument?.layoutResolution;
  if (!layout) return String(html);
  const attributes = [
    `data-g4b-u04-layout-mode="${escapeAttribute(layout.layoutMode)}"`,
    `data-g4b-u04-layout-profile="${escapeAttribute(layout.profileId)}"`,
    `data-g4b-u04-layout-capped="${layout.capped ? "true" : "false"}"`,
    `data-g4b-u04-requested-columns="${escapeAttribute(layout.requestedQuestionLayout?.columns)}"`,
    `data-g4b-u04-requested-rows="${escapeAttribute(layout.requestedQuestionLayout?.rowsPerPage)}"`,
    `data-g4b-u04-resolved-columns="${escapeAttribute(layout.resolvedQuestionLayout?.columns)}"`,
    `data-g4b-u04-resolved-rows="${escapeAttribute(layout.resolvedQuestionLayout?.rowsPerPage)}"`,
    `data-g4b-u04-answer-columns="${escapeAttribute(layout.resolvedAnswerLayout?.columns)}"`,
    `data-g4b-u04-answer-rows="${escapeAttribute(layout.resolvedAnswerLayout?.rowsPerPage)}"`,
  ].join(" ");
  const meta = `<meta name="g4b-u04-applied-layout" content="${escapeAttribute(layout.appliedLayoutText)}">`;
  const style = "<style>.g4b-u04-layout-readback{margin:8px auto;padding:8px 12px;max-width:980px;border:1px solid #64748b;border-radius:6px;font:14px/1.5 system-ui,sans-serif;background:#f8fafc;color:#0f172a}.g4b-u04-layout-readback__notice{margin-left:8px;font-weight:700}@media print{.g4b-u04-layout-readback{display:none!important}}</style>";
  const notice = layout.noticeText
    ? `<span class="g4b-u04-layout-readback__notice">${escapeHtml(layout.noticeText)}</span>`
    : "";
  const readback = `<aside class="g4b-u04-layout-readback" role="status" aria-label="實際套用版面"><strong>${escapeHtml(layout.appliedLayoutText)}</strong>${notice}</aside>`;
  return String(html)
    .replace("</head>", `${meta}${style}</head>`)
    .replace(/<body([^>]*)>/, `<body$1 ${attributes}>${readback}`);
}

function stampPreviewMetadata(html, worksheetDocument) {
  return stampG4BU04LayoutReadback(stampPublicControls(html, worksheetDocument), worksheetDocument);
}

function scheduleClassicLayoutReadback(worksheetDocument) {
  if (typeof document === "undefined" || !worksheetDocument?.appliedLayoutText) return;
  const run = () => {
    const previewMeta = document.getElementById("preview-meta");
    if (!previewMeta) return;
    const additions = [worksheetDocument.appliedLayoutText, worksheetDocument.layoutNoticeText].filter(Boolean);
    const current = String(previewMeta.textContent ?? "");
    previewMeta.textContent = [current, ...additions.filter((text) => !current.includes(text))].filter(Boolean).join("｜");
    previewMeta.dataset.layoutMode = worksheetDocument.layoutResolution?.layoutMode ?? "";
    previewMeta.dataset.layoutCapped = String(worksheetDocument.layoutResolution?.capped ?? false);
  };
  if (typeof queueMicrotask === "function") queueMicrotask(run);
  else Promise.resolve().then(run);
}

export function renderPreviewFrame(previewFrame, worksheetDocument, options = {}) {
  if (!previewFrame) throw new Error("Preview frame element is required.");
  scheduleClassicLayoutReadback(worksheetDocument);

  if (worksheetDocument?.dynamicHtml) {
    previewFrame.srcdoc = stampPreviewMetadata(String(worksheetDocument.dynamicHtml)
      .replace('data-s93-hidden-browser-pipeline="true"', 'data-s96d-public-dynamic-browser="true"')
      .replace('content="S93 G5A-U02 hidden browser pipeline"', 'content="S96D G5A-U02 public dynamic browser"'), worksheetDocument);
    previewFrame.dataset.dynamicWorksheetStatus = "ready";
    return { html: previewFrame.srcdoc, dynamic: true };
  }

  if (worksheetDocument?.staticHtmlUrl) {
    previewFrame.dataset.staticCandidateStatus = "loading";
    fetch(worksheetDocument.staticHtmlUrl, { cache: "force-cache" })
      .then((response) => {
        if (!response.ok) throw new Error(`Static candidate fetch failed: ${response.status}`);
        return response.text();
      })
      .then((sourceHtml) => {
        const html = worksheetDocument.staticHtmlTransform?.suppressAnswerKey ? suppressAnswerKey(sourceHtml) : sourceHtml;
        previewFrame.srcdoc = stampPreviewMetadata(html
          .replace('content="S93 G5A-U02 hidden browser pipeline"', 'content="S94 G5A-U02 public preview candidate"')
          .replace('data-s93-hidden-browser-pipeline="true"', 'data-s94-public-preview-candidate="true"'), worksheetDocument);
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
  previewFrame.srcdoc = stampPreviewMetadata(html, worksheetDocument);
  return { html: previewFrame.srcdoc };
}

export function printPreviewFrame(previewFrame) {
  const previewWindow = previewFrame?.contentWindow;
  if (!previewWindow) throw new Error("Preview frame window is not available.");
  previewWindow.focus();
  previewWindow.print();
}
