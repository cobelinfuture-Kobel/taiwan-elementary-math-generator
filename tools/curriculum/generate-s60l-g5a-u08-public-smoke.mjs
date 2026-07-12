import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  G5A_U08_PROMOTED_PATTERN_GROUP_IDS,
  G5A_U08_PROMOTED_PATTERN_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g5a-u08-promotion.js";
import {
  G5A_U08_PRODUCTION_PROMOTION_OVERLAY_ID,
  G5A_U08_PRODUCTION_ACTIVATION,
} from "../../site/modules/curriculum/registry/g5a-u08-production-promotion.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s60l-extension.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s60j-extension.js";

const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../docs/curriculum/output/smoke");
const HTML_PATH = resolve(OUT_DIR, "S60L_G5A_U08_PublicMixedWorksheet.html");
const MANIFEST_PATH = resolve(OUT_DIR, "S60L_G5A_U08_PublicMixedWorksheet.manifest.json");

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function count(text, token) {
  return text.split(token).length - 1;
}

const options = {
  sourceId: "g5a_u08_5a08",
  selectionMode: "mixedKnowledgePointsSameUnit",
  selectedKnowledgePointIds: [...G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS],
  selectedPatternGroupIds: [...G5A_U08_PROMOTED_PATTERN_GROUP_IDS],
  questionMode: "mixed",
  depthMode: "mixed",
  contextMode: "mixed",
  questionCount: 120,
  ordering: "groupedByPattern",
  includeAnswerKey: true,
  generationSeed: "s60l-g5a-u08-public-html-pdf-smoke",
  printLayout: { columns: 2, rowsPerPage: 4, showAnswerKeyPage: true },
};

const result = buildBatchABrowserWorksheetDocument(options);
if (!result.ok || !result.worksheetDocument) {
  throw new Error(`S60L G5A-U08 worksheet failed: ${JSON.stringify(result.errors)}`);
}
const document = result.worksheetDocument;
if (document.productionUse !== "allowed") throw new Error("Production worksheet was not promoted to allowed.");
const questions = document.generatedQuestions;
const reachedKps = [...new Set(questions.map((row) => row.knowledgePointId))];
const reachedGroups = [...new Set(questions.map((row) => row.resolvedPatternGroupId ?? row.patternGroupId))];
const reachedSpecs = [...new Set(questions.map((row) => row.patternSpecId))];
const reachedFamilies = [...new Set(questions.map((row) => row.templateFamilyId).filter(Boolean))];
const reachedSdgs = [...new Set(questions.map((row) => row.context?.sdgGoalId).filter(Boolean))];
const answerShapes = [...new Set(questions.map((row) => row.answerModelShape))];
if (reachedKps.length !== 11 || reachedGroups.length !== 17 || reachedSpecs.length !== 30) {
  throw new Error(`Coverage mismatch: kp=${reachedKps.length}, group=${reachedGroups.length}, spec=${reachedSpecs.length}`);
}
if (reachedFamilies.length !== 10 || reachedSdgs.length !== 8 || answerShapes.length !== 6) {
  throw new Error(`Semantic/answer coverage mismatch: families=${reachedFamilies.length}, sdgs=${reachedSdgs.length}, shapes=${answerShapes.length}`);
}

let html = renderWorksheetDocumentToHtml(document, {
  title: "5A-U08 整數四則｜N+1 與 SDG 公開驗證",
  stylesheetHref: "../../../../site/assets/styles/print-styles.css",
});
html = html
  .replace("<head>", '<head><meta name="robots" content="noindex,nofollow"><meta name="generator" content="S60L G5A-U08 canonical public smoke">')
  .replace('<body class="worksheet-renderer worksheet-renderer--g5a-u08"', '<body class="worksheet-renderer worksheet-renderer--g5a-u08" data-s60l-public-smoke="true"');
const htmlContents = `${html}\n`;
const forbidden = [
  "kp_g5a_u08_",
  "pg_g5a_u08_",
  "ps_g5a_u08_",
  "tf_g5a_u08_",
  "cv_sdg",
  "N_PLUS_2",
  "formal_equation",
  "{{",
  "}}",
];
const leaks = forbidden.filter((token) => htmlContents.includes(token));
if (leaks.length > 0) throw new Error(`Forbidden public tokens: ${leaks.join(", ")}`);
const questionCells = count(htmlContents, "g5a-u08-cell--question");
const answerCells = count(htmlContents, "g5a-u08-cell--answer");
if (questionCells !== 120 || answerCells !== 120) {
  throw new Error(`HTML cell mismatch: questions=${questionCells}, answers=${answerCells}`);
}

const manifest = {
  schemaName: "G5AU08PublicMixedWorksheetSmokeManifest",
  schemaVersion: 1,
  task: "S60L_G5A_U08_ProductionStressHTMLPDFAndD0Closeout",
  status: "html_generated_pdf_pending",
  productionPromotionOverlayId: G5A_U08_PRODUCTION_PROMOTION_OVERLAY_ID,
  productionPromotionActivationStatus: G5A_U08_PRODUCTION_ACTIVATION.status,
  productionUse: document.productionUse,
  canonicalPublicPath: true,
  questionCount: document.summary.questionCount,
  answerKeyItemCount: document.answerKeyItems.length,
  questionPageCount: document.questionPages.length,
  answerKeyPageCount: document.answerKeyPages.length,
  expectedPdfPageCount: document.questionPages.length + document.answerKeyPages.length,
  actualPdfPageCount: null,
  visibleKnowledgePointCount: 11,
  visiblePatternGroupCount: 17,
  promotedPatternSpecCount: 30,
  reachedKnowledgePointCount: reachedKps.length,
  reachedPatternGroupCount: reachedGroups.length,
  reachedPatternSpecCount: reachedSpecs.length,
  reachedTemplateFamilyCount: reachedFamilies.length,
  reachedSdgGoalCount: reachedSdgs.length,
  reachedAnswerModelCount: answerShapes.length,
  modes: [...new Set(questions.map((row) => row.mode))].sort(),
  depths: [...new Set(questions.map((row) => row.depth))].sort(),
  contexts: [...new Set(questions.map((row) => row.context?.contextType).filter(Boolean))].sort(),
  validationErrorCount: result.validation?.errors?.length ?? 0,
  internalIdLeakCount: leaks.length,
  unresolvedPlaceholderCount: 0,
  rendererProfileId: document.rendererProfile.profileId,
  questionLayout: { columns: document.printOptions.columns, rowsPerPage: document.printOptions.rowsPerPage },
  answerKeyLayout: { columns: document.printOptions.answerKeyColumns, rowsPerPage: document.printOptions.answerKeyRowsPerPage },
  generationSeed: options.generationSeed,
  htmlQuestionCellCount: questionCells,
  htmlAnswerCellCount: answerCells,
  htmlSha256: sha256(htmlContents),
  pdfSha256: null,
  pdfBytes: null,
  renderedPageImageCount: null,
  nonblankRenderedPageCount: null,
  cjkGlyphRendering: "pending",
  visualRenderVerification: "pending",
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(HTML_PATH, htmlContents, "utf8");
writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ htmlPath: HTML_PATH, manifestPath: MANIFEST_PATH, ...manifest }, null, 2));
