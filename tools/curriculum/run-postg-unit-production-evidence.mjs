import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

import {
  adaptGlobalPublicSourceUnitPlan,
} from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter.js";
import {
  resolveGlobalPublicSourceUnitAdapterDescriptor,
} from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter-registry.js";
import {
  validateBatchABrowserQuestions,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-validator.js";
import {
  buildBatchABrowserWorksheetDocument,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import {
  renderWorksheetDocumentToHtml,
} from "../../site/modules/renderer/html-renderer-s60j-extension.js";

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
  const text = bytes.toString("latin1");
  return (text.match(/\/Type\s*\/Page\b/g) ?? []).length;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

const args = parseArgs();
const sourceId = String(args["source-id"] ?? "").trim();
if (!sourceId) fail("POSTG_EVIDENCE_SOURCE_ID_REQUIRED");
const descriptor = resolveGlobalPublicSourceUnitAdapterDescriptor(sourceId);
if (!descriptor?.goldenContractDescriptor
  || descriptor.goldenContractDescriptor.descriptorMode !== "post_golden_unit_conformance") {
  fail("POSTG_EVIDENCE_POST_GOLDEN_DESCRIPTOR_REQUIRED", { sourceId });
}

const questionCount = integer(args["question-count"], 40);
const outputDir = resolve(String(args["output-dir"] ?? `build/postg/${sourceId}`));
const outputPrefix = String(args["output-prefix"] ?? sourceId.toUpperCase()).replace(/[^A-Za-z0-9_-]+/g, "_");
const htmlPath = resolve(outputDir, `${outputPrefix}_Worksheet.html`);
const pdfPath = resolve(outputDir, `${outputPrefix}_Worksheet.pdf`);
const readbackPath = resolve(outputDir, `${outputPrefix}_RUNTIME_READBACK.json`);
const title = String(args.title ?? `${sourceId} Golden Conformance`);

await mkdir(outputDir, { recursive: true });

const golden = descriptor.goldenContractDescriptor;
const request = {
  sourceId,
  selectionMode: "sourceUnit",
  questionCount,
  ordering: "groupedByPattern",
  includeAnswerKey: true,
  generationSeed: String(args.seed ?? `postg-production-evidence:${sourceId}`),
  title,
  printLayout: {
    paperSize: "A4",
    columns: integer(args.columns, 2),
    rowsPerPage: integer(args["rows-per-page"], 5),
    showQuestionNumbers: true,
    showAnswerKeyPage: true,
  },
  goldenContractId: golden.goldenContractId,
  goldenContractVersion: golden.goldenContractVersion,
  goldenRuntimeMode: descriptor.requiresExplicitGoldenActivation ? "shadow" : "production",
};
const adaptation = adaptGlobalPublicSourceUnitPlan(request);
if (!adaptation.applied || adaptation.blocked || !adaptation.plan) {
  fail("POSTG_EVIDENCE_SHARED_ADAPTER_BLOCKED", { sourceId, adaptation });
}

const result = buildBatchABrowserWorksheetDocument({
  ...adaptation.plan,
  questionCount,
  includeAnswerKey: true,
  title,
  printLayout: request.printLayout,
});
if (!result?.ok || !result.worksheetDocument) {
  fail("POSTG_EVIDENCE_WORKSHEET_BUILD_FAILED", {
    sourceId,
    errors: result?.errors ?? result?.validation?.errors ?? [],
    warnings: result?.warnings ?? [],
  });
}

const document = result.worksheetDocument;
const questions = document.generatedQuestions ?? result.generation?.questions ?? [];
const questionDisplayModels = document.questionDisplayModels ?? [];
const answerKeyItems = document.answerKeyItems ?? [];
const questionPages = document.questionPages ?? [];
const answerKeyPages = document.answerKeyPages ?? [];
const validation = validateBatchABrowserQuestions(questions, { plan: result.generation?.plan ?? adaptation.plan });
const emittedPatternSpecIds = unique(questions.map((row) => row.patternSpecId));
const emittedKnowledgePointIds = unique(questions.map((row) => row.knowledgePointId));
const emittedPatternGroupIds = unique(questions.map((row) => row.resolvedPatternGroupId ?? row.patternGroupId));

if (questions.length !== questionCount
  || questionDisplayModels.length !== questionCount
  || answerKeyItems.length !== questionCount) {
  fail("POSTG_EVIDENCE_QUESTION_ANSWER_COUNT_MISMATCH", {
    questionCount,
    questions: questions.length,
    questionDisplayModels: questionDisplayModels.length,
    answerKeyItems: answerKeyItems.length,
  });
}
if (!validation.ok || validation.errors.length > 0) {
  fail("POSTG_EVIDENCE_VALIDATOR_FAILED", { errors: validation.errors, warnings: validation.warnings });
}
if (emittedPatternSpecIds.length !== descriptor.expectedCounts.patternSpecs
  || emittedKnowledgePointIds.length !== descriptor.expectedCounts.knowledgePoints
  || emittedPatternGroupIds.length !== descriptor.expectedCounts.patternGroups) {
  fail("POSTG_EVIDENCE_COVERAGE_MISMATCH", {
    expected: descriptor.expectedCounts,
    actual: {
      knowledgePoints: emittedKnowledgePointIds.length,
      patternGroups: emittedPatternGroupIds.length,
      patternSpecs: emittedPatternSpecIds.length,
    },
  });
}
if (questionPages.length < 1 || answerKeyPages.length < 1) {
  fail("POSTG_EVIDENCE_PAGE_MODEL_MISSING", {
    questionPages: questionPages.length,
    answerKeyPages: answerKeyPages.length,
  });
}

const html = renderWorksheetDocumentToHtml(document, {
  title,
  stylesheetHref: "",
  debugDataAttributes: true,
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
      bodyTextLength: document.body.innerText.length,
      printPageCount: document.querySelectorAll(".print-page, .worksheet-page").length,
      internalIdLeak: /\b(?:kp|pg|ps)_g3a_u01_[a-z0-9_]+\b/i.test(document.body.innerText),
      placeholderLeak: /\{\{[^}]+\}\}|\[[A-Z_]+\]|undefined|null/.test(document.body.innerText),
      overflow,
    };
  });
  if (consoleErrors.length > 0 || pageErrors.length > 0) {
    fail("POSTG_EVIDENCE_BROWSER_ERROR", { consoleErrors, pageErrors });
  }
  if (domReadback.bodyTextLength < 100 || domReadback.printPageCount < 1
    || domReadback.internalIdLeak || domReadback.placeholderLeak) {
    fail("POSTG_EVIDENCE_DOM_READBACK_INVALID", domReadback);
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
  taskId: String(args["task-id"] ?? "POSTG_UNIT_CONFORMANCE_MIGRATION"),
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
    ok: validation.ok,
    errorCount: validation.errors.length,
    warningCount: validation.warnings.length,
  },
  domReadback,
  artifacts: [
    { path: htmlPath, bytes: htmlBytes.length, sha256: sha256(htmlBytes) },
    { path: pdfPath, bytes: pdfBytes.length, sha256: sha256(pdfBytes) },
  ],
  verdict: "PASS_CURRENT_RUNTIME_PRODUCTION_HTML_PDF_HASH_READBACK",
};
if (readback.pdfPageCount < 1) fail("POSTG_EVIDENCE_PDF_PAGE_COUNT_INVALID", readback);
await writeFile(readbackPath, `${JSON.stringify(readback, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify({ ...readback, readbackPath }, null, 2)}\n`);
