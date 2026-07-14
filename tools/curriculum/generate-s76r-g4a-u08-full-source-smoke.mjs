import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s76j-entry.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s73-extension.js";
import {
  G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  G4A_U08_FULL_SOURCE_PROMOTION_OVERLAY_ID,
  G4A_U08_FULL_SOURCE_STRESS_ACCEPTANCE,
  validateG4AU08FullSourceProductionProjection,
} from "../../site/modules/curriculum/registry/g4a-u08-full-source-production-promotion.js";

const outputDirectory = resolve("artifacts/s76r-g4a-u08");
const htmlPath = resolve(outputDirectory, "S76R_G4A_U08_FullSourceWorksheet.html");
const manifestPath = resolve(outputDirectory, "S76R_G4A_U08_FullSourceWorksheet.manifest.json");
const groups = G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS;
const knowledgePointIds = [...new Set(groups.map((row) => row.primaryKnowledgePointId))];
const patternGroupIds = groups.map((row) => row.patternGroupId);
const expectedPatternSpecIds = [...new Set(groups.flatMap((row) => row.patternSpecIds))];
const questionCount = G4A_U08_FULL_SOURCE_STRESS_ACCEPTANCE.smokeQuestionCount;

const projection = validateG4AU08FullSourceProductionProjection();
if (!projection.ok) {
  throw new Error(`S76R_PROMOTION_PROJECTION_INVALID:${projection.errors.join(",")}`);
}

const options = {
  sourceId: "g4a_u08_4a08",
  selectionMode: "mixedKnowledgePointsSameUnit",
  selectedKnowledgePointIds: knowledgePointIds,
  selectedPatternGroupIds: patternGroupIds,
  questionMode: "mixed",
  questionCount,
  ordering: "groupedByPattern",
  includeAnswerKey: true,
  generationSeed: "s76r-g4a-u08-full-source",
  title: "四上整數四則全知識點綜合練習",
};

const result = buildBatchABrowserWorksheetDocument(options);
if (!result.ok || !result.worksheetDocument) {
  throw new Error(`S76R_WORKSHEET_BUILD_FAILED:${JSON.stringify(result.errors ?? [])}`);
}

const document = result.worksheetDocument;
if (document.generatedQuestions.length !== questionCount) {
  throw new Error(`S76R_QUESTION_COUNT_MISMATCH:${document.generatedQuestions.length}/${questionCount}`);
}
if (document.answerKeyItems.length !== questionCount) {
  throw new Error(`S76R_ANSWER_COUNT_MISMATCH:${document.answerKeyItems.length}/${questionCount}`);
}

const actualKnowledgePointIds = [...new Set(document.generatedQuestions.map((question) => question.knowledgePointId))];
const actualPatternGroupIds = [...new Set(document.generatedQuestions.map((question) => question.resolvedPatternGroupId ?? question.patternGroupId))];
const actualPatternSpecIds = [...new Set(document.generatedQuestions.map((question) => question.patternSpecId))];
if (actualKnowledgePointIds.length !== 15 || actualPatternGroupIds.length !== 28 || actualPatternSpecIds.length !== 33) {
  throw new Error(`S76R_COVERAGE_MISMATCH:${actualKnowledgePointIds.length}/${actualPatternGroupIds.length}/${actualPatternSpecIds.length}`);
}
if (new Set(actualPatternGroupIds).size !== new Set(patternGroupIds).size || patternGroupIds.some((id) => !actualPatternGroupIds.includes(id))) {
  throw new Error("S76R_PATTERN_GROUP_SET_MISMATCH");
}
if (expectedPatternSpecIds.some((id) => !actualPatternSpecIds.includes(id))) {
  throw new Error("S76R_PATTERN_SPEC_SET_MISMATCH");
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
if (internalIdPattern.test(publicText)) throw new Error("S76R_INTERNAL_ID_LEAK");
if (placeholderPattern.test(publicText)) throw new Error("S76R_UNRESOLVED_PLACEHOLDER");

const manifest = {
  schemaName: "G4AU08S76RFullSourceHtmlPdfStressManifest",
  schemaVersion: 1,
  task: "S76R_G4A_U08_FullSourceStressHTMLPDFAndD0Reevaluation",
  status: "html_generated_pending_chromium_pdf_verification",
  sourceId: "g4a_u08_4a08",
  unitCode: "4A-U08",
  productionPromotionOverlayId: G4A_U08_FULL_SOURCE_PROMOTION_OVERLAY_ID,
  questionCount,
  answerKeyItemCount: document.answerKeyItems.length,
  knowledgePointCount: actualKnowledgePointIds.length,
  patternGroupCount: actualPatternGroupIds.length,
  patternSpecCount: actualPatternSpecIds.length,
  knowledgePointIds: actualKnowledgePointIds,
  patternGroupIds: actualPatternGroupIds,
  patternSpecIds: actualPatternSpecIds,
  expectedKnowledgePointIds: knowledgePointIds,
  expectedPatternGroupIds: patternGroupIds,
  expectedPatternSpecIds,
  questionPageCount: document.questionPages.length,
  answerKeyPageCount: document.answerKeyPages.length,
  expectedPdfPageCount: document.questionPages.length + document.answerKeyPages.length,
  expectedDomCellCount: G4A_U08_FULL_SOURCE_STRESS_ACCEPTANCE.expectedDomCellCount,
  rendererProfileId: document.rendererProfile?.profileId ?? null,
  rendererBehaviorChanged: document.rendererBehaviorChanged,
  selectorVisibleKnowledgePointCount: 15,
  genericFallback: false,
  publicPatternSpecInjection: false,
  internalIdLeakCount: 0,
  unresolvedPlaceholderCount: 0,
  htmlPath: "artifacts/s76r-g4a-u08/S76R_G4A_U08_FullSourceWorksheet.html",
  pdfPath: "artifacts/s76r-g4a-u08/S76R_G4A_U08_FullSourceWorksheet.pdf",
};

await mkdir(outputDirectory, { recursive: true });
await writeFile(htmlPath, html, "utf8");
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify(manifest, null, 2));
