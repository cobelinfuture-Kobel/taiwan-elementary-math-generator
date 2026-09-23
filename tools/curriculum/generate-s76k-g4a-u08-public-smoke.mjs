import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s76j-entry.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s73-extension.js";
import {
  G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS,
  G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g4a-u08-phase2b-promotion.js";
import {
  G4A_U08_PRODUCTION_PROMOTION_OVERLAY_ID,
  G4A_U08_STRESS_ACCEPTANCE,
} from "../../site/modules/curriculum/registry/g4a-u08-production-promotion.js";

const outputDirectory = resolve("artifacts/s76k-g4a-u08");
const htmlPath = resolve(outputDirectory, "S76K_G4A_U08_PublicWorksheet.html");
const manifestPath = resolve(outputDirectory, "S76K_G4A_U08_PublicWorksheet.manifest.json");
const questionCount = G4A_U08_STRESS_ACCEPTANCE.smokeQuestionCount;

const options = {
  sourceId: "g4a_u08_4a08",
  selectionMode: "mixedKnowledgePointsSameUnit",
  selectedKnowledgePointIds: [...G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS],
  selectedPatternGroupIds: [...G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS],
  questionMode: "application",
  questionCount,
  ordering: "groupedByPattern",
  includeAnswerKey: true,
  generationSeed: "s76k-g4a-u08-html-pdf-smoke",
  title: "四上整數四則 Phase2B 應用題",
};

const result = buildBatchABrowserWorksheetDocument(options);
if (!result.ok || !result.worksheetDocument) {
  throw new Error(`S76K_WORKSHEET_BUILD_FAILED:${JSON.stringify(result.errors ?? [])}`);
}

const document = result.worksheetDocument;
if (document.generatedQuestions.length !== questionCount) {
  throw new Error(`S76K_QUESTION_COUNT_MISMATCH:${document.generatedQuestions.length}/${questionCount}`);
}
if (document.answerKeyItems.length !== questionCount) {
  throw new Error(`S76K_ANSWER_COUNT_MISMATCH:${document.answerKeyItems.length}/${questionCount}`);
}

const patternGroupIds = [...new Set(document.generatedQuestions.map((question) => question.patternGroupId))];
const patternSpecIds = [...new Set(document.generatedQuestions.map((question) => question.patternSpecId))];
if (patternGroupIds.length !== 4 || patternSpecIds.length !== 4) {
  throw new Error(`S76K_COVERAGE_MISMATCH:${patternGroupIds.length}/${patternSpecIds.length}`);
}

const html = renderWorksheetDocumentToHtml(document, {
  title: options.title,
  stylesheetHref: "../../site/assets/styles/print-styles.css",
  debugDataAttributes: false,
  renderFillerCells: false,
});

const internalIdPattern = /\b(?:kp|pg|ps|tpl)_g4a_u08_[a-z0-9_]+\b/i;
const placeholderPattern = /\{\{[^}]+\}\}|\[[A-Z_]+\]|undefined|null/;
const publicText = [
  ...document.generatedQuestions.map((question) => question.promptText),
  ...document.answerKeyItems.map((item) => `${item.promptText} ${item.answerText}`),
].join("\n");
if (internalIdPattern.test(publicText)) throw new Error("S76K_INTERNAL_ID_LEAK");
if (placeholderPattern.test(publicText)) throw new Error("S76K_UNRESOLVED_PLACEHOLDER");

const manifest = {
  schemaName: "G4AU08S76KPublicHtmlPdfSmokeManifest",
  schemaVersion: 1,
  task: "S76K_G4A_U08_FullSourceStressAndSemanticQA",
  status: "html_generated_pending_chromium_pdf_verification",
  sourceId: "g4a_u08_4a08",
  productionPromotionOverlayId: G4A_U08_PRODUCTION_PROMOTION_OVERLAY_ID,
  questionCount,
  answerKeyItemCount: document.answerKeyItems.length,
  questionPageCount: document.questionPages.length,
  answerKeyPageCount: document.answerKeyPages.length,
  expectedPdfPageCount: document.questionPages.length + document.answerKeyPages.length,
  patternGroupIds,
  patternSpecIds,
  expectedPatternGroupIds: [...G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS],
  expectedPatternSpecIds: [...G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS],
  rendererProfileId: document.rendererProfile?.profileId ?? null,
  rendererBehaviorChanged: document.rendererBehaviorChanged,
  internalIdLeakCount: 0,
  unresolvedPlaceholderCount: 0,
  htmlPath: "artifacts/s76k-g4a-u08/S76K_G4A_U08_PublicWorksheet.html",
  pdfPath: "artifacts/s76k-g4a-u08/S76K_G4A_U08_PublicWorksheet.pdf",
};

await mkdir(outputDirectory, { recursive: true });
await writeFile(htmlPath, html, "utf8");
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify(manifest, null, 2));
