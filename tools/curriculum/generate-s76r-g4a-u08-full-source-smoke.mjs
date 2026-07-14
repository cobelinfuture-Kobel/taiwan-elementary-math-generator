import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s76j-entry.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s73-extension.js";
import { G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS } from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  G4A_U08_FULL_SOURCE_PRODUCTION_PROMOTION_ID,
  G4A_U08_FULL_SOURCE_STRESS_ACCEPTANCE,
} from "../../site/modules/curriculum/registry/g4a-u08-full-source-production-promotion.js";

const outputDirectory = resolve("artifacts/s76r-g4a-u08");
const htmlPath = resolve(outputDirectory, "S76R_G4A_U08_FullSourceWorksheet.html");
const manifestPath = resolve(outputDirectory, "S76R_G4A_U08_FullSourceWorksheet.manifest.json");
const groups = G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS;
const expectedKnowledgePointIds = [...new Set(groups.map((row) => row.primaryKnowledgePointId))];
const expectedPatternGroupIds = groups.map((row) => row.patternGroupId);
const expectedPatternSpecIds = [...new Set(groups.flatMap((row) => row.patternSpecIds))];
const questionCount = G4A_U08_FULL_SOURCE_STRESS_ACCEPTANCE.htmlPdfSmokeQuestionCount;

const options = {
  sourceId: "g4a_u08_4a08",
  selectionMode: "mixedKnowledgePointsSameUnit",
  selectedKnowledgePointIds: expectedKnowledgePointIds,
  selectedPatternGroupIds: expectedPatternGroupIds,
  questionMode: "mixed",
  questionCount,
  ordering: "groupedByPattern",
  includeAnswerKey: true,
  generationSeed: "s76r-g4a-u08-full-source-html-pdf",
  title: "四上整數四則全知識點練習卷",
};

const result = buildBatchABrowserWorksheetDocument(options);
if (!result.ok || !result.worksheetDocument) {
  throw new Error(`S76R_WORKSHEET_BUILD_FAILED:${JSON.stringify(result.errors ?? [])}`);
}

const document = result.worksheetDocument;
const actualKnowledgePointIds = [...new Set(document.generatedQuestions.map((row) => row.knowledgePointId))];
const actualPatternGroupIds = [...new Set(document.generatedQuestions.map((row) => row.resolvedPatternGroupId ?? row.patternGroupId))];
const actualPatternSpecIds = [...new Set(document.generatedQuestions.map((row) => row.patternSpecId))];

if (document.generatedQuestions.length !== questionCount) throw new Error(`S76R_QUESTION_COUNT_MISMATCH:${document.generatedQuestions.length}/${questionCount}`);
if (document.answerKeyItems.length !== questionCount) throw new Error(`S76R_ANSWER_COUNT_MISMATCH:${document.answerKeyItems.length}/${questionCount}`);
if (actualKnowledgePointIds.length !== 15) throw new Error(`S76R_KP_COVERAGE_MISMATCH:${actualKnowledgePointIds.length}/15`);
if (actualPatternGroupIds.length !== 28) throw new Error(`S76R_PG_COVERAGE_MISMATCH:${actualPatternGroupIds.length}/28`);
if (actualPatternSpecIds.length !== 33) throw new Error(`S76R_PS_COVERAGE_MISMATCH:${actualPatternSpecIds.length}/33`);

const html = renderWorksheetDocumentToHtml(document, {
  title: options.title,
  stylesheetHref: "../../site/assets/styles/print-styles.css",
  debugDataAttributes: false,
  renderFillerCells: false,
});

const publicText = [
  ...document.generatedQuestions.map((question) => question.promptText),
  ...document.answerKeyItems.map((item) => `${item.promptText} ${item.answerText}`),
].join("\n");
const internalIdPattern = /\b(?:kp|pg|ps|tpl)_g4a_u08_[a-z0-9_]+\b/i;
const placeholderPattern = /\{\{[^}]+\}\}|\[[A-Z_]+\]|undefined|null/;
if (internalIdPattern.test(publicText)) throw new Error("S76R_INTERNAL_ID_LEAK");
if (placeholderPattern.test(publicText)) throw new Error("S76R_UNRESOLVED_PLACEHOLDER");

const manifest = {
  schemaName: "G4AU08S76RFullSourceHtmlPdfManifest",
  schemaVersion: 1,
  task: "S76R_G4A_U08_FullSourceStressHTMLPDFAndD0Reevaluation",
  status: "html_generated_pending_chromium_pdf_verification",
  sourceId: options.sourceId,
  promotionId: G4A_U08_FULL_SOURCE_PRODUCTION_PROMOTION_ID,
  questionCount,
  answerKeyItemCount: document.answerKeyItems.length,
  questionPageCount: document.questionPages.length,
  answerKeyPageCount: document.answerKeyPages.length,
  expectedPdfPageCount: document.questionPages.length + document.answerKeyPages.length,
  expectedDomCellCount: questionCount * 2,
  knowledgePointIds: actualKnowledgePointIds,
  patternGroupIds: actualPatternGroupIds,
  patternSpecIds: actualPatternSpecIds,
  expectedKnowledgePointIds,
  expectedPatternGroupIds,
  expectedPatternSpecIds,
  rendererProfileId: document.rendererProfile?.profileId ?? null,
  rendererBehaviorChanged: document.rendererBehaviorChanged,
  productionUse: document.productionUse,
  internalIdLeakCount: 0,
  unresolvedPlaceholderCount: 0,
  htmlPath: "artifacts/s76r-g4a-u08/S76R_G4A_U08_FullSourceWorksheet.html",
  pdfPath: "artifacts/s76r-g4a-u08/S76R_G4A_U08_FullSourceWorksheet.pdf",
};

await mkdir(outputDirectory, { recursive: true });
await writeFile(htmlPath, html, "utf8");
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify(manifest, null, 2));
