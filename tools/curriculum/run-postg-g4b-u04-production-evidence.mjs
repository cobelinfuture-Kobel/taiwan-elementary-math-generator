import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

import { adaptGlobalPublicSourceUnitPlan } from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter.js";
import { resolvePostGoldenSourceUnitAdapterDescriptor } from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter-registry.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s73-extension.js";
import { validateG4BU04CanonicalQuestion } from "../../site/modules/curriculum/batch-b/g4b-u04-canonical-router.js";
import { normalizeG4BU04PromptSignature } from "../../site/modules/curriculum/batch-b/g4b-u04-prompt-deduplication.js";
import {
  G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U04_PROMOTED_PATTERN_GROUP_IDS,
  G4B_U04_PROMOTED_PATTERN_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g4b-u04-promotion.js";
import { G4B_U04_WORKSHEET_ANSWER_SHAPES } from "../../site/modules/curriculum/registry/g4b-u04-worksheet-promotion.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s73-extension.js";

function parseArgs(argv = process.argv.slice(2)) {
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const name = token.slice(2);
    const value = argv[index + 1];
    if (value == null || value.startsWith("--")) values[name] = true;
    else {
      values[name] = value;
      index += 1;
    }
  }
  return values;
}
function fail(code, details = {}) {
  const error = new Error(code);
  error.code = code;
  error.details = details;
  throw error;
}
function integer(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
function unique(values) {
  return [...new Set(values.filter(Boolean))];
}
function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}
function pdfPageCount(bytes) {
  return (bytes.toString("latin1").match(/\/Type\s*\/Page\b/g) ?? []).length;
}
function assertExactSet(label, actual, expected) {
  if (actual.length !== expected.length || expected.some((id) => !actual.includes(id))) {
    fail("POSTG_A12_COVERAGE_MISMATCH", { label, actual, expected });
  }
}

const args = parseArgs();
const sourceId = String(args["source-id"] ?? "").trim();
const taskId = String(args["task-id"] ?? "").trim();
if (sourceId !== "g4b_u04_4b04") fail("POSTG_A12_SOURCE_ID_INVALID", { sourceId });
if (taskId !== "POSTG-MIG-A12_G4B_U04_GoldenConformanceAndKnowledgeOperationMigration") {
  fail("POSTG_A12_TASK_ID_INVALID", { taskId });
}
const descriptor = resolvePostGoldenSourceUnitAdapterDescriptor(sourceId);
if (!descriptor || descriptor.taskId !== taskId) fail("POSTG_A12_DESCRIPTOR_REQUIRED");

const questionCount = integer(args["question-count"], 68);
const outputDir = resolve(String(args["output-dir"] ?? `build/postg/${sourceId}`));
const outputPrefix = String(args["output-prefix"] ?? "POSTG_MIG_A12_G4BU04").replace(/[^A-Za-z0-9_-]+/g, "_");
const htmlPath = resolve(outputDir, `${outputPrefix}_Worksheet.html`);
const pdfPath = resolve(outputDir, `${outputPrefix}_Worksheet.pdf`);
const readbackPath = resolve(outputDir, `${outputPrefix}_RUNTIME_READBACK.json`);
const title = String(args.title ?? "4B-U04 概數｜Golden Conformance");
await mkdir(outputDir, { recursive: true });

const golden = descriptor.goldenContractDescriptor;
const request = {
  sourceId,
  selectionMode: "sourceUnit",
  questionCount,
  ordering: "groupedByPattern",
  includeAnswerKey: true,
  generationSeed: String(args.seed ?? "postg-production-evidence:g4b_u04_4b04"),
  title,
  questionMode: "mixed",
  layoutMode: "custom_with_caps",
  contextMode: "mixed",
  printLayout: {
    paperSize: "A4",
    columns: integer(args.columns, 2),
    rowsPerPage: integer(args["rows-per-page"], 4),
    showQuestionNumbers: true,
    showAnswerKeyPage: true,
  },
  goldenContractId: golden.goldenContractId,
  goldenContractVersion: golden.goldenContractVersion,
  goldenRuntimeMode: "shadow",
  postGoldenMigrationTaskId: taskId,
};
const adaptation = adaptGlobalPublicSourceUnitPlan(request);
if (!adaptation.applied || adaptation.blocked || !adaptation.plan) {
  fail("POSTG_A12_SHARED_ADAPTER_BLOCKED", { adaptation });
}
if (adaptation.adapter.adapterId !== "g4b_u04_postg_golden_shared_runtime") {
  fail("POSTG_A12_WRONG_ADAPTER_SELECTED", { adapter: adaptation.adapter });
}

const result = buildBatchABrowserWorksheetDocument({
  ...adaptation.plan,
  questionCount,
  includeAnswerKey: true,
  title,
  printLayout: request.printLayout,
});
if (!result?.ok || !result.worksheetDocument) {
  fail("POSTG_A12_WORKSHEET_BUILD_FAILED", { errors: result?.errors ?? result?.validation?.errors ?? [] });
}

const document = result.worksheetDocument;
const questions = document.generatedQuestions ?? [];
const answerKeyItems = document.answerKeyItems ?? [];
const questionDisplayModels = document.questionDisplayModels ?? [];
const questionPages = document.questionPages ?? [];
const answerKeyPages = document.answerKeyPages ?? [];
const productionErrors = result.validation?.errors ?? [];
const canonicalErrors = questions.flatMap((question, index) => (
  validateG4BU04CanonicalQuestion(question).errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` }))
));
if (productionErrors.length > 0 || canonicalErrors.length > 0) {
  fail("POSTG_A12_VALIDATOR_FAILED", { productionErrors, canonicalErrors });
}
if (questions.length !== questionCount
  || answerKeyItems.length !== questionCount
  || questionDisplayModels.length !== questionCount) {
  fail("POSTG_A12_QUESTION_ANSWER_COUNT_MISMATCH", {
    questionCount,
    questions: questions.length,
    answerKeyItems: answerKeyItems.length,
    questionDisplayModels: questionDisplayModels.length,
  });
}

const reachedKnowledgePointIds = unique(questions.map((row) => row.knowledgePointId));
const reachedPatternGroupIds = unique(questions.map((row) => row.resolvedPatternGroupId ?? row.patternGroupId));
const reachedPatternSpecIds = unique(questions.map((row) => row.patternSpecId));
const reachedModes = unique(questions.map((row) => row.mode));
const reachedAnswerShapes = unique(questions.map((row) => row.answerModelShape));
assertExactSet("KnowledgePoints", reachedKnowledgePointIds, G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS);
assertExactSet("PatternGroups", reachedPatternGroupIds, G4B_U04_PROMOTED_PATTERN_GROUP_IDS);
assertExactSet("PatternSpecs", reachedPatternSpecIds, G4B_U04_PROMOTED_PATTERN_SPEC_IDS);
assertExactSet("Modes", reachedModes, ["concept", "numeric", "application", "operation_estimation", "reasoning"]);
assertExactSet("AnswerShapes", reachedAnswerShapes, G4B_U04_WORKSHEET_ANSWER_SHAPES);
const promptSignatures = questions.map((row) => normalizeG4BU04PromptSignature(row.promptText));
if (new Set(promptSignatures).size !== promptSignatures.length) fail("POSTG_A12_DUPLICATE_PROMPT");
if (questionPages.length < 1 || answerKeyPages.length < 1) fail("POSTG_A12_PAGE_MODEL_MISSING");

const html = renderWorksheetDocumentToHtml(document, {
  title,
  stylesheetHref: "",
  debugDataAttributes: false,
});
await writeFile(htmlPath, html, "utf8");

const browser = await chromium.launch({ headless: true });
let domReadback;
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.setContent(html, { waitUntil: "load", timeout: 120000 });
  await page.emulateMedia({ media: "print" });
  domReadback = await page.evaluate(() => {
    const text = document.body.innerText;
    const cells = [...document.querySelectorAll(".g4b-u04-cell")];
    const overflow = cells.filter((element) => (
      element.scrollWidth > element.clientWidth + 1
      || element.scrollHeight > element.clientHeight + 1
    )).slice(0, 20).map((element) => ({
      className: element.className,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight,
    }));
    return {
      bodyTextLength: text.length,
      printPageCount: document.querySelectorAll(".print-page, .worksheet-page, .g4b-u04-page").length,
      questionCellCount: document.querySelectorAll(".g4b-u04-cell--question").length,
      answerCellCount: document.querySelectorAll(".g4b-u04-cell--answer").length,
      internalIdLeak: /\b(?:kp|pg|ps|fm|fmc|tpl)_g4b_u04_[a-z0-9_]+\b/i.test(text),
      placeholderLeak: /\{\{[^}]+\}\}|\[[A-Z_]+\]|undefined|null/.test(text),
      overflow,
    };
  });
  if (consoleErrors.length > 0 || pageErrors.length > 0) fail("POSTG_A12_BROWSER_ERROR", { consoleErrors, pageErrors });
  if (domReadback.bodyTextLength < 100
    || domReadback.printPageCount < 1
    || domReadback.questionCellCount !== questionCount
    || domReadback.answerCellCount !== questionCount
    || domReadback.internalIdLeak
    || domReadback.placeholderLeak
    || domReadback.overflow.length > 0) {
    fail("POSTG_A12_DOM_READBACK_INVALID", domReadback);
  }
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });
} finally {
  await browser.close();
}

const htmlBytes = await readFile(htmlPath);
const pdfBytes = await readFile(pdfPath);
const readback = {
  schemaName: "PostGoldenUnitProductionEvidenceReadback",
  schemaVersion: 1,
  programId: "POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1",
  sourceId,
  taskId,
  runtimeSha: process.env.GITHUB_SHA ?? "local",
  goldenContractId: golden.goldenContractId,
  goldenContractVersion: golden.goldenContractVersion,
  goldenConnectionStatus: adaptation.plan.goldenRuntimeConsumer?.connectionStatus ?? null,
  sourceUnitAdapter: adaptation.adapter,
  questionCount: questions.length,
  answerKeyCount: answerKeyItems.length,
  questionPageCount: questionPages.length,
  answerKeyPageCount: answerKeyPages.length,
  pdfPageCount: pdfPageCount(pdfBytes),
  knowledgePointIds: reachedKnowledgePointIds,
  patternGroupIds: reachedPatternGroupIds,
  patternSpecIds: reachedPatternSpecIds,
  modes: reachedModes,
  answerShapes: reachedAnswerShapes,
  validator: {
    ok: true,
    errorCount: 0,
    warningCount: result.validation?.warnings?.length ?? 0,
    validatorVersion: "g4b-u04-s72-s75-r2-production-v1",
  },
  promptDeduplication: {
    unique: true,
    signatureCount: promptSignatures.length,
  },
  canonicalWorksheetIdentityParity: true,
  applicationModeUsed: true,
  domReadback,
  artifacts: [
    { path: htmlPath, bytes: htmlBytes.length, sha256: sha256(htmlBytes) },
    { path: pdfPath, bytes: pdfBytes.length, sha256: sha256(pdfBytes) },
  ],
  verdict: "PASS_CURRENT_RUNTIME_PRODUCTION_HTML_PDF_HASH_READBACK",
};
if (readback.pdfPageCount < 1) fail("POSTG_A12_PDF_PAGE_COUNT_INVALID", readback);
await writeFile(readbackPath, `${JSON.stringify(readback, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify({ ...readback, readbackPath }, null, 2)}\n`);
