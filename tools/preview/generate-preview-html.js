import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderWorksheetDocumentToHtml } from "../../src/renderer/html-renderer.js";
import { createSampleWorksheetDocument } from "./sample-worksheet-document.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DEFAULT_PREVIEW_OUTPUT_PATH = path.join(__dirname, "preview-output.html");

function injectPreviewShell(documentHtml) {
  const toolbar = [
    '<div class="preview-shell screen-only">',
    '<div class="preview-shell__inner">',
    '<strong class="preview-shell__title">Math Worksheet Preview</strong>',
    '<button type="button" class="preview-shell__button" onclick="window.print()">Print</button>',
    '<span class="preview-shell__hint">Use Chrome or Edge print preview with A4 paper.</span>',
    "</div>",
    "</div>"
  ].join("");

  const shellStyles = [
    "<style>",
    ".preview-shell{position:sticky;top:0;z-index:10;padding:12px 24px;background:rgba(15,23,42,.92);backdrop-filter:blur(12px);color:#fff;}",
    ".preview-shell__inner{display:flex;gap:12px;align-items:center;flex-wrap:wrap;max-width:1100px;margin:0 auto;}",
    ".preview-shell__title{letter-spacing:.04em;text-transform:uppercase;font-size:.9rem;}",
    ".preview-shell__button{border:0;background:#f4b942;color:#1f2933;padding:8px 14px;font:inherit;font-weight:700;cursor:pointer;}",
    ".preview-shell__hint{font-size:.9rem;opacity:.9;}",
    "@media print{.preview-shell{display:none!important;}}",
    "</style>"
  ].join("");

  return documentHtml
    .replace("</head>", `${shellStyles}</head>`)
    .replace('<body class="worksheet-renderer">', `<body class="worksheet-renderer">${toolbar}`);
}

export function buildPreviewHtml(options = {}) {
  const worksheetDocument = options.worksheetDocument ?? createSampleWorksheetDocument();
  const documentHtml = renderWorksheetDocumentToHtml(worksheetDocument, {
    title: options.title ?? "Math Worksheet Browser Preview",
    stylesheetHref: options.stylesheetHref ?? "../../src/renderer/print-styles.css",
    debugDataAttributes: options.debugDataAttributes ?? true
  });

  return injectPreviewShell(documentHtml);
}

export function writePreviewHtmlFile(outputPath = DEFAULT_PREVIEW_OUTPUT_PATH, options = {}) {
  const html = buildPreviewHtml(options);
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, html, "utf8");
  return {
    outputPath,
    html
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const result = writePreviewHtmlFile();
  console.log(`Preview written to ${result.outputPath}`);
}
