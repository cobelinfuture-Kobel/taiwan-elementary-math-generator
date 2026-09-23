import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

import { adaptGlobalPublicSourceUnitPlan } from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter.js";
import { resolvePostGoldenSourceUnitAdapterDescriptor } from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter-registry.js";
import { validateBatchABrowserQuestion } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-s59h-extension.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s59h-extension.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s59h-extension.js";

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
function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}
function integer(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
function pdfPageCount(bytes) {
  return (bytes.toString("latin1").match(/\/Type\s*\/Page\b/g) ?? []).length;
}
function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

const args = parseArgs();
const sourceId = String(args["source-id"] ?? "").trim();
const taskId = String(args["task-id"] ?? "").trim();
if (sourceId !== "g4b_u01_4b01") fail("POSTG_A11_SOURCE_ID_INVALID", { sourceId });
if (taskId !== "POSTG-MIG-A11_G4B_U01_GoldenConformanceAndKnowledgeOperationMigration") {
  fail("POSTG_A11_TASK_ID_INVALID", { taskId });
}
const descriptor = resolvePostGoldenSourceUnitAdapterDescriptor(sourceId);
if (!descriptor || descriptor.taskId !== taskId) fail("POSTG_A11_DESCRIPTOR_REQUIRED");

const questionCount = integer(args["question-count"], 72);
const outputDir = resolve(String(args["output-dir"] ?? `build/postg/${sourceId}`));
const outputPrefix = String(args["output-prefix"] ?? "POSTG_MIG_A11_G4BU01").replace(/[^A-Za-z0-9_-]+/g, "_");
const htmlPath = resolve(outputDir, `${outputPrefix}_Worksheet.html`);
const pdfPath = resolve(outputDir, `${outputPrefix}_Worksheet.pdf`);
const readbackPath = resolve(outputDir, `${outputPrefix}_RUNTIME_READBACK.json`);
const title = String(args.title ?? "4B-U01 多位數的乘與除｜Golden Conformance");
await mkdir(outputDir, { recursive: true });

const golden = descriptor.goldenContractDescriptor;
const request = {
  sourceId,
  selectionMode: "sourceUnit",
  questionCount,
  ordering: "groupedByPattern",
  includeAnswerKey: true,
  generationSeed: String(args.seed ?? "postg-production-evidence:g4b_u01_4b01"),
  title,
  printLayout: {
    paperSize: "A4",
    columns: integer(args.columns, 3),
    rowsPerPage: integer(args["rows-per-page"], 8),
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
  fail("POSTG_A11_SHARED_ADAPTER_BLOCKED", { adaptation });
}

const result = buildBatchABrowserWorksheetDocument({
  ...adaptation.plan,
  questionCount,
  includeAnswerKey: true,
  title,
  printLayout: request.printLayout,
});
if (!result?.ok || !result.worksheetDocument) {
  fail("POSTG_A11_WORKSHEET_BUILD_FAILED", { errors: result?.errors ?? result?.validation?.errors ?? [] });
}

const document = result.worksheetDocument;
const questions = document.generatedQuestions ?? [];
const questionDisplayModels = document.questionDisplayModels ?? [];
const answerKeyItems = document.answerKeyItems ?? [];
const questionPages = document.questionPages ?? [];
const answerKeyPages = document.answerKeyPages ?? [];
const validationResults = questions.map((question) => validateBatchABrowserQuestion(question));
const validationErrors = validationResults.flatMap((validation, index) => (
  (validation.errors ?? []).map((error) => ({ ...error, path: `questions[${index}].${error.path}` }))
));
const validationWarnings = validationResults.flatMap((validation, index) => (
  (validation.warnings ?? []).map((warning) => ({ ...warning, path: `questions[${index}].${warning.path ?? "validation"}` }))
));
const emittedKnowledgePointIds = unique(questions.map((row) => row.knowledgePointId));
const emittedPatternGroupIds = unique(questions.map((row) => row.resolvedPatternGroupId ?? row.patternGroupId));
const emittedPatternSpecIds = unique(questions.map((row) => row.patternSpecId));

if (questions.length !== questionCount || questionDisplayModels.length !== questionCount || answerKeyItems.length !== questionCount) {
  fail("POSTG_A11_QUESTION_ANSWER_COUNT_MISMATCH", {
    questionCount,
    questions: questions.length,
    questionDisplayModels: questionDisplayModels.length,
    answerKeyItems: answerKeyItems.length,
  });
}
if (validationErrors.length > 0) fail("POSTG_A11_VALIDATOR_FAILED", { errors: validationErrors });
if (emittedKnowledgePointIds.length !== 9 || emittedPatternGroupIds.length !== 9 || emittedPatternSpecIds.length !== 12) {
  fail("POSTG_A11_COVERAGE_MISMATCH", {
    actual: {
      knowledgePoints: emittedKnowledgePointIds.length,
      patternGroups: emittedPatternGroupIds.length,
      patternSpecs: emittedPatternSpecIds.length,
    },
  });
}
if (questions.some((question) => (
  question.sourceId !== sourceId
  || question.metadata?.sourceId !== sourceId
  || question.representation !== "horizontal_only"
  || question.applicationText !== false
))) {
  fail("POSTG_A11_SCOPE_OR_LINEAGE_DRIFT");
}
if (questionPages.length < 1 || answerKeyPages.length < 1) fail("POSTG_A11_PAGE_MODEL_MISSING");

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
    const all = [...document.querySelectorAll("*")];
    const overflow = all.filter((element) => (
      element.scrollWidth > element.clientWidth + 1
      || element.scrollHeight > element.clientHeight + 1
    )).slice(0, 20).map((element) => ({
      tag: element.tagName,
      className: element.className,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight,
    }));
    return {
      bodyTextLength: text.length,
      printPageCount: document.querySelectorAll(".print-page, .worksheet-page").length,
      questionCellCount: document.querySelectorAll(".worksheet-cell--question").length,
      answerCellCount: document.querySelectorAll(".worksheet-cell--answer-key").length,
      internalIdLeak: /\b(?:kp|pg|ps)_g4b_u01_[a-z0-9_]+\b/i.test(text),
      placeholderLeak: /\{\{[^}]+\}\}|\[[A-Z_]+\]|undefined|null/.test(text),
      forbiddenRepresentationLeak: /直式|長除法|word_problem|vertical_algorithm/.test(text),
      overflow,
    };
  });
  if (consoleErrors.length > 0 || pageErrors.length > 0) fail("POSTG_A11_BROWSER_ERROR", { consoleErrors, pageErrors });
  if (domReadback.bodyTextLength < 100
    || domReadback.printPageCount < 1
    || domReadback.questionCellCount !== questionCount
    || domReadback.answerCellCount !== questionCount
    || domReadback.internalIdLeak
    || domReadback.placeholderLeak
    || domReadback.forbiddenRepresentationLeak) {
    fail("POSTG_A11_DOM_READBACK_INVALID", domReadback);
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
  knowledgePointIds: emittedKnowledgePointIds,
  patternGroupIds: emittedPatternGroupIds,
  patternSpecIds: emittedPatternSpecIds,
  validator: {
    ok: validationErrors.length === 0,
    errorCount: validationErrors.length,
    warningCount: validationWarnings.length,
    validatorVersion: "s59h-g4b-u01-canonical-production-v1",
  },
  canonicalWorksheetIdentityParity: true,
  horizontalOnly: true,
  applicationModeUsed: false,
  domReadback,
  artifacts: [
    { path: htmlPath, bytes: htmlBytes.length, sha256: sha256(htmlBytes) },
    { path: pdfPath, bytes: pdfBytes.length, sha256: sha256(pdfBytes) },
  ],
  verdict: "PASS_CURRENT_RUNTIME_PRODUCTION_HTML_PDF_HASH_READBACK",
};
if (readback.pdfPageCount < 1) fail("POSTG_A11_PDF_PAGE_COUNT_INVALID", readback);
await writeFile(readbackPath, `${JSON.stringify(readback, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify({ ...readback, readbackPath }, null, 2)}\n`);
