import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  G3B_U04_GLOBAL_CONTEXT_PILOT_MODE,
  G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME,
  buildG3BU04GlobalContextPilotWorksheetDocuments
} from "../../site/modules/curriculum/batch-a/g3b-u04-global-context-pilot-runtime.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s57f5-extension.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(HERE, "../../docs/curriculum/output/gctx");
const BEFORE_HTML_PATH = resolve(OUT_DIR, "GCTX_P12R_G3BU04_BEFORE.html");
const AFTER_HTML_PATH = resolve(OUT_DIR, "GCTX_P12R_G3BU04_AFTER.html");
const DIFF_PATH = resolve(OUT_DIR, "GCTX_P12R_G3BU04_VISIBLE_DIFF.json");
const MANIFEST_PATH = resolve(OUT_DIR, "GCTX_P12R_G3BU04_RENDERED_ARTIFACTS.manifest.json");
const PDF_PATH = resolve(OUT_DIR, "GCTX_P12R_G3BU04_AFTER.pdf");

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function render(document, label) {
  let html = renderWorksheetDocumentToHtml(document, {
    title: document.title,
    stylesheetHref: "../../../../site/assets/styles/print-styles.css",
    debugDataAttributes: false
  });
  html = html
    .replace("<head>", `<head><meta name="robots" content="noindex,nofollow"><meta name="generator" content="GCTX-P12R ${label}">`)
    .replace(
      '<body class="worksheet-renderer worksheet-renderer--g3b-u04-semantic"',
      `<body class="worksheet-renderer worksheet-renderer--g3b-u04-semantic" data-gctx-p12r-artifact="${label}"`
    );
  return `${html}\n`;
}

const generationSeed = process.env.GCTX_P12R_SEED ?? "gctx-p12r-runtime-renderer-pdf";
const result = buildG3BU04GlobalContextPilotWorksheetDocuments({
  pilotMode: G3B_U04_GLOBAL_CONTEXT_PILOT_MODE,
  generationSeed,
  includeAnswerKey: true
});
if (!result.ok) throw new Error(`GCTX-P12R generation failed: ${JSON.stringify(result.errors)}`);

const beforeDocument = result.beforeWorksheetDocument;
const afterDocument = result.afterWorksheetDocument;
const beforeHtml = render(beforeDocument, "before");
const afterHtml = render(afterDocument, "after");

const beforeQuestions = beforeDocument.generatedQuestions;
const afterQuestions = afterDocument.generatedQuestions;
if (beforeQuestions.length !== afterQuestions.length || afterQuestions.length !== 5) {
  throw new Error(`GCTX-P12R expected five paired questions, got ${beforeQuestions.length}/${afterQuestions.length}.`);
}

const pairs = afterQuestions.map((question, index) => {
  const before = beforeQuestions[index];
  const changed = before.promptText !== question.promptText;
  const mathPreserved = before.equationModel === question.equationModel
    && before.finalAnswer === question.finalAnswer
    && before.answerText === question.answerText
    && JSON.stringify(before.quantities) === JSON.stringify(question.quantities);
  return {
    questionNumber: index + 1,
    patternSpecId: question.patternSpecId,
    knowledgePointId: question.knowledgePointId,
    beforePromptText: before.promptText,
    afterPromptText: question.promptText,
    semanticVariantId: question.globalContextPilot.semanticVariantId,
    contextDomainId: question.globalContextPilot.contextDomainId,
    semanticFingerprint: question.globalContextPilot.semanticFingerprint,
    equationModel: question.equationModel,
    answerText: question.answerText,
    promptChanged: changed,
    mathematicalWitnessPreserved: mathPreserved
  };
});

const visibleDiff = {
  schemaName: "GCTXG3BU04ProductionEquivalentVisibleDifferenceEvidence",
  schemaVersion: 1,
  task: G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME.task,
  status: "before_after_html_generated_pdf_pending",
  generationSeed,
  canonicalResolverUsed: true,
  canonicalGeneratorUsed: true,
  productionRendererUsed: true,
  productionSelectable: false,
  publicRouteChanged: false,
  pairCount: pairs.length,
  changedPromptCount: pairs.filter((row) => row.promptChanged).length,
  preservedMathematicalWitnessCount: pairs.filter((row) => row.mathematicalWitnessPreserved).length,
  uniqueAfterPromptCount: new Set(pairs.map((row) => row.afterPromptText)).size,
  uniqueSemanticVariantCount: new Set(pairs.map((row) => row.semanticVariantId)).size,
  legacyPromptCountInAfter: pairs.filter((row) => /三明治費用|果汁費用|筆記本費用|彩色筆費用|門票費用|帳篷租金/.test(row.afterPromptText)).length,
  pairs
};

if (visibleDiff.changedPromptCount !== 5
  || visibleDiff.preservedMathematicalWitnessCount !== 5
  || visibleDiff.uniqueAfterPromptCount !== 5
  || visibleDiff.uniqueSemanticVariantCount !== 5
  || visibleDiff.legacyPromptCountInAfter !== 0) {
  throw new Error(`GCTX-P12R visible difference gate failed: ${JSON.stringify(visibleDiff)}`);
}

const diffText = `${JSON.stringify(visibleDiff, null, 2)}\n`;
const manifest = {
  schemaName: "GCTXG3BU04RuntimeRendererPDFArtifactManifest",
  schemaVersion: 1,
  task: G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME.task,
  status: "html_and_diff_pass_pdf_pending",
  evidenceLevel: "E3_SHADOW_RUNTIME_INTEGRATED",
  generationSeed,
  pilotMode: G3B_U04_GLOBAL_CONTEXT_PILOT_MODE,
  sourceId: G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME.sourceId,
  knowledgePointId: G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME.knowledgePointId,
  patternSpecId: G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME.patternSpecId,
  canonicalResolverUsed: true,
  canonicalGeneratorUsed: true,
  productionRendererUsed: true,
  productionSelectable: false,
  publicQuerySelectable: false,
  publicRouterChanged: false,
  questionCount: afterDocument.summary.questionCount,
  globalContextVariantCount: afterDocument.summary.globalContextVariantCount,
  questionPageCount: afterDocument.questionPages.length,
  answerKeyPageCount: afterDocument.answerKeyPages.length,
  expectedPdfPageCount: afterDocument.questionPages.length + afterDocument.answerKeyPages.length,
  actualPdfPageCount: null,
  changedPromptCount: visibleDiff.changedPromptCount,
  preservedMathematicalWitnessCount: visibleDiff.preservedMathematicalWitnessCount,
  uniqueAfterPromptCount: visibleDiff.uniqueAfterPromptCount,
  uniqueSemanticVariantCount: visibleDiff.uniqueSemanticVariantCount,
  legacyPromptCountInAfter: visibleDiff.legacyPromptCountInAfter,
  beforeHtmlPath: "docs/curriculum/output/gctx/GCTX_P12R_G3BU04_BEFORE.html",
  afterHtmlPath: "docs/curriculum/output/gctx/GCTX_P12R_G3BU04_AFTER.html",
  visibleDiffPath: "docs/curriculum/output/gctx/GCTX_P12R_G3BU04_VISIBLE_DIFF.json",
  pdfPath: "docs/curriculum/output/gctx/GCTX_P12R_G3BU04_AFTER.pdf",
  beforeHtmlSha256: sha256(beforeHtml),
  afterHtmlSha256: sha256(afterHtml),
  visibleDiffSha256: sha256(diffText),
  pdfSha256: null,
  pdfBytes: null,
  extractedPromptCount: null,
  extractedAnswerCount: null,
  humanReviewReady: false
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(BEFORE_HTML_PATH, beforeHtml, "utf8");
writeFileSync(AFTER_HTML_PATH, afterHtml, "utf8");
writeFileSync(DIFF_PATH, diffText, "utf8");
writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(JSON.stringify({
  beforeHtmlPath: BEFORE_HTML_PATH,
  afterHtmlPath: AFTER_HTML_PATH,
  diffPath: DIFF_PATH,
  manifestPath: MANIFEST_PATH,
  pdfPath: PDF_PATH,
  questionCount: manifest.questionCount,
  changedPromptCount: manifest.changedPromptCount,
  expectedPdfPageCount: manifest.expectedPdfPageCount
}, null, 2));
