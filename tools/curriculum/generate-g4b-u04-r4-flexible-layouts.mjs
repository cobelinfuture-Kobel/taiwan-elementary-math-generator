import { createHash } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U04_PROMOTED_PATTERN_GROUP_IDS,
} from "../../site/modules/curriculum/registry/g4b-u04-promotion.js";
import {
  buildBatchABrowserWorksheetDocument,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import {
  renderWorksheetDocumentToHtml,
} from "../../site/modules/renderer/html-renderer-s73-extension.js";
import {
  normalizeG4BU04PromptSignature,
} from "../../site/modules/curriculum/batch-b/g4b-u04-prompt-deduplication.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../docs/curriculum/output/g4b-u04-r4-flexible-layouts");
const SOURCE_ID = "g4b_u04_4b04";
const QUESTION_COUNT = 200;
const SCENARIOS = Object.freeze([
  Object.freeze({ id: "max-3x5", columns: 3, rowsPerPage: 5, expectedPages: 14 }),
  Object.freeze({ id: "max-2x6", columns: 2, rowsPerPage: 6, expectedPages: 17 }),
  Object.freeze({ id: "max-1x7", columns: 1, rowsPerPage: 7, expectedPages: 29 }),
]);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function buildScenario(scenario) {
  const result = buildBatchABrowserWorksheetDocument({
    sourceId: SOURCE_ID,
    worksheetMode: "batchAKnowledgePoint",
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [...G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS],
    selectedPatternGroupIds: [...G4B_U04_PROMOTED_PATTERN_GROUP_IDS],
    questionMode: "mixed",
    contextMode: "mixed",
    layoutMode: "custom_with_caps",
    questionCount: QUESTION_COUNT,
    ordering: "shuffleAcrossPatterns",
    generationSeed: `g4b-u04-r4-${scenario.id}`,
    includeAnswerKey: false,
    printLayout: {
      paperSize: "A4",
      columns: scenario.columns,
      rowsPerPage: scenario.rowsPerPage,
      showAnswerKeyPage: false,
    },
  });

  if (!result.ok || !result.worksheetDocument) {
    throw new Error(`R4 ${scenario.id} generation failed: ${JSON.stringify(result.errors)}`);
  }
  if ((result.validation?.errors ?? []).length !== 0) {
    throw new Error(`R4 ${scenario.id} validator errors: ${JSON.stringify(result.validation.errors)}`);
  }

  const document = result.worksheetDocument;
  const signatures = document.generatedQuestions
    .map((question) => normalizeG4BU04PromptSignature(question.promptText));
  if (signatures.length !== QUESTION_COUNT || new Set(signatures).size !== QUESTION_COUNT) {
    throw new Error(`R4 ${scenario.id} prompt uniqueness ${new Set(signatures).size}/${QUESTION_COUNT}`);
  }
  if (document.answerKeyItems.length !== 0 || document.answerKeyPages.length !== 0) {
    throw new Error(`R4 ${scenario.id} answer output was not suppressed`);
  }
  const resolved = document.layoutResolution.resolvedQuestionLayout;
  if (resolved.columns !== scenario.columns || resolved.rowsPerPage !== scenario.rowsPerPage) {
    throw new Error(`R4 ${scenario.id} layout mismatch: ${JSON.stringify(document.layoutResolution)}`);
  }
  if (document.layoutResolution.capped) {
    throw new Error(`R4 ${scenario.id} approved layout was unexpectedly capped`);
  }
  if (document.questionPages.length !== scenario.expectedPages) {
    throw new Error(`R4 ${scenario.id} page count ${document.questionPages.length}/${scenario.expectedPages}`);
  }

  const directory = resolve(ROOT, scenario.id);
  mkdirSync(directory, { recursive: true });
  const htmlFile = `${scenario.id}-200q.html`;
  const pdfFile = `${scenario.id}-200q.pdf`;
  const manifestFile = `${scenario.id}-manifest.json`;
  const html = `${renderWorksheetDocumentToHtml(document, {
    title: `4B-U04 概數｜${scenario.columns}×${scenario.rowsPerPage}｜200 題`,
    stylesheetHref: "../../../../../site/assets/styles/print-styles.css",
  })}\n`;
  if (/<div class="g4b-u04-cell__response"/.test(html)) {
    throw new Error(`R4 ${scenario.id} response prompt markup present`);
  }
  writeFileSync(resolve(directory, htmlFile), html, "utf8");

  const manifest = {
    schemaVersion: "g4b-u04-r4-flexible-layout-production-v1",
    task: "G4B_U04_R4_SourceSwitchAndFlexibleCustomLayoutRepair",
    scenarioId: scenario.id,
    status: "html_generated_pdf_pending",
    sourceId: SOURCE_ID,
    questionOnly: true,
    questionCount: QUESTION_COUNT,
    responsePromptCount: 0,
    answerKeyItemCount: 0,
    requestedLayout: { columns: scenario.columns, rowsPerPage: scenario.rowsPerPage },
    resolvedLayout: { columns: scenario.columns, rowsPerPage: scenario.rowsPerPage },
    expectedQuestionPageCount: scenario.expectedPages,
    questionPageCount: document.questionPages.length,
    answerKeyPageCount: 0,
    capped: document.layoutResolution.capped,
    validationErrorCount: result.validation.errors.length,
    duplicatePromptCount: 0,
    htmlFile,
    pdfFile,
    manifestFile,
    htmlSha256: sha256(html),
    htmlBytes: Buffer.byteLength(html),
    domOverflowCount: null,
    interCardOverlapCount: null,
    actualPdfPageCount: null,
    nonblankPdfPageCount: null,
    pdfBoundingBoxOverflowCount: null,
    pdfSha256: null,
    pdfBytes: null,
  };
  writeFileSync(resolve(directory, manifestFile), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return manifest;
}

rmSync(ROOT, { recursive: true, force: true });
mkdirSync(ROOT, { recursive: true });
const matrix = SCENARIOS.map(buildScenario);
writeFileSync(
  resolve(ROOT, "matrix-manifest.json"),
  `${JSON.stringify({
    schemaVersion: "g4b-u04-r4-flexible-layout-matrix-v1",
    status: "html_generated_pdf_pending",
    scenarioCount: matrix.length,
    approvedCustomLayoutCount: 18,
    scenarios: matrix,
  }, null, 2)}\n`,
  "utf8",
);
console.log(JSON.stringify(matrix, null, 2));
