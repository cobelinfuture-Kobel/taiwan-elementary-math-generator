import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildG3BU04HiddenSemanticWorksheet
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-g3b-u04-extension.js";
import {
  renderG3BU04HiddenSemanticWorksheetHtml
} from "../../site/modules/curriculum/batch-a/g3b-u04-hidden-semantic-html.js";
import {
  G3B_U04_HIDDEN_SEMANTIC_MODE
} from "../../site/modules/curriculum/batch-a/g3b-u04-semantic-question-generator.js";

const toolDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(toolDir, "../..");
const outputDir = resolve(repoRoot, "docs/curriculum/output/smoke");
const htmlPath = resolve(outputDir, "S57E8_G3B_U04_HiddenSemanticWorksheet.html");
const manifestPath = resolve(outputDir, "S57E8_G3B_U04_HiddenSemanticWorksheet.manifest.json");

await mkdir(outputDir, { recursive: true });

const generated = buildG3BU04HiddenSemanticWorksheet({
  sourceId: "g3b_u04_3b04",
  hiddenSemanticMode: G3B_U04_HIDDEN_SEMANTIC_MODE,
  questionCount: 64,
  generationSeed: "s57e8-hidden-html-pdf-smoke-v1",
  ordering: "shuffleAcrossPatterns",
  includeAnswerKey: true,
  printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true },
  answerKeyLayout: { paperSize: "A4", columns: 1, rowsPerPage: 8, showQuestionNumbers: true }
});

if (!generated.ok || !generated.worksheetDocument) {
  throw new Error(`S57E8 worksheet generation failed: ${JSON.stringify(generated.errors)}`);
}

const document = generated.worksheetDocument;
const html = renderG3BU04HiddenSemanticWorksheetHtml(document, {
  documentTitle: "3B-U04 兩步驟計算｜隱藏語意題型 HTML/PDF Smoke",
  generatedAt: "S57E8_DETERMINISTIC_BUILD"
});

const manifest = {
  schemaName: "S57E8G3BU04HiddenSemanticSmokeManifest",
  schemaVersion: 1,
  task: "S57E8_G3B_U04_HiddenWorksheetHtmlPdfSmokeCloseout",
  sourceId: document.sourceId,
  unitCode: document.unitCode,
  worksheetMode: document.worksheetMode,
  visibilityStatus: document.visibilityStatus,
  selectorStatus: document.selectorStatus,
  productionUse: document.productionUse,
  generationSeed: document.plan.generationSeed,
  questionCount: document.summary.questionCount,
  answerKeyItemCount: document.summary.answerKeyItemCount,
  knowledgePointCount: document.summary.knowledgePointCount,
  templateFamilyCount: document.summary.templateFamilyCount,
  questionPageCount: document.summary.questionPageCount,
  answerKeyPageCount: document.summary.answerKeyPageCount,
  expectedPdfPageCount: document.summary.questionPageCount + document.summary.answerKeyPageCount,
  actualPdfPageCount: null,
  pdfBytes: null,
  pdfSha256: null,
  htmlBytes: Buffer.byteLength(html, "utf8"),
  htmlArtifact: "docs/curriculum/output/smoke/S57E8_G3B_U04_HiddenSemanticWorksheet.html",
  pdfArtifact: "docs/curriculum/output/smoke/S57E8_G3B_U04_HiddenSemanticWorksheet.pdf",
  validation: {
    semanticValidatorVersion: document.validation.validatorVersion,
    semanticErrors: document.validation.errors.length,
    semanticWarnings: document.validation.warnings.length,
    unresolvedPlaceholders: document.generatedQuestions.filter((question) => /\{[^}]+\}/.test(question.promptText)).length,
    nonPositiveAnswers: document.generatedQuestions.filter((question) => !Number.isInteger(question.finalAnswer) || question.finalAnswer <= 0).length,
    publicProjectionChanged: document.publicProjectionChanged
  },
  status: "html_generated_pdf_pending"
};

await writeFile(htmlPath, html, "utf8");
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(JSON.stringify({ htmlPath, manifestPath, summary: document.summary }, null, 2));
