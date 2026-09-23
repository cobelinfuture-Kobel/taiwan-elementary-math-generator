import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { chromium } from "playwright";

import { materializeP03DW3ProtectedD0CompatibilityRevalidation } from "../../src/curriculum/full-product/p03d-w3-protected-d0-compatibility-revalidation.mjs";
import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { getVisiblePatternGroupsForKnowledgePoint } from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s73-extension.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const STYLE_PATH = path.join(ROOT, "site/assets/styles/print-styles.css");
const OUT_DIR = path.join(ROOT, "tmp/p03d-protected-d0-compatibility");
const SITE_PORT = 4193;
const SITE_URL = `http://127.0.0.1:${SITE_PORT}/index.html`;

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function questionModeFor(group) {
  const corpus = JSON.stringify(group).toLowerCase();
  if (corpus.includes("pbl")) return "pbl";
  if (corpus.includes("application") || corpus.includes("word_problem") || corpus.includes("應用題")) return "application";
  return "numeric";
}

function plan(testCase) {
  return {
    sourceId: testCase.sourceId,
    questionCount: testCase.questionMode === "pbl" ? 1 : 2,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: `p03d-chromium-${testCase.knowledgePointId}-${testCase.patternGroupId}`,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [testCase.knowledgePointId],
    selectedPatternGroupIds: [testCase.patternGroupId],
    questionMode: testCase.questionMode,
    depthMode: "mixed",
    contextMode: "mixed",
    printLayout: {
      paperSize: "A4",
      columns: testCase.questionMode === "numeric" ? 2 : 1,
      rowsPerPage: testCase.questionMode === "numeric" ? 2 : 1,
      showAnswerKeyPage: true,
      showQuestionNumbers: true,
    },
  };
}

function questionCount(document) {
  return document?.summary?.questionCount
    ?? document?.report?.summary?.questionCount
    ?? document?.questionCount
    ?? document?.questions?.length
    ?? document?.generatedQuestions?.length
    ?? 0;
}

function answerKeyCount(document) {
  return document?.answerKeyItems?.length
    ?? document?.answerKeyPages?.reduce((sum, page) => sum + (page?.cells ?? []).filter((cell) => cell?.cellType !== "filler").length, 0)
    ?? 0;
}

function authorityEvidence(result, document) {
  const cutover = result?.authoritativeConsumerCutover;
  const metadata = document?.metadata?.r07AuthoritativeConsumerCutover;
  const config = document?.configSnapshot?.globalAuthorityCutover;
  const publicMode = document?.publicControls?.authorityMode;
  return {
    applied: cutover?.applied === true,
    blocked: cutover?.blocked === true,
    authorityMode: metadata?.authorityMode ?? config?.authorityMode ?? cutover?.adapter?.authorityMode ?? null,
    legacyAuthorityRole: metadata?.legacyAuthorityRole ?? config?.legacyAuthorityRole ?? cutover?.adapter?.legacyAuthorityRole ?? null,
    knowledgePointIdentityPreserved: cutover?.dualReadParity?.requestedKnowledgePointIdsPreserved === true,
    patternGroupIdentityPreserved: cutover?.dualReadParity?.requestedPatternGroupIdsPreserved === true,
    publicControlsAuthorityMode: publicMode ?? null,
    valid: cutover?.applied === true
      && cutover?.blocked === false
      && metadata?.authorityMode === "GLOBAL_PRIMARY"
      && config?.authorityMode === "GLOBAL_PRIMARY"
      && publicMode === "GLOBAL_PRIMARY"
      && (metadata?.legacyAuthorityRole ?? config?.legacyAuthorityRole) === "COMPATIBILITY_ALIAS_READ_ONLY"
      && cutover?.dualReadParity?.requestedKnowledgePointIdsPreserved === true
      && cutover?.dualReadParity?.requestedPatternGroupIdsPreserved === true,
  };
}

function compatibilityCases(runtime) {
  return runtime.rows.flatMap((row) => {
    const groups = getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId);
    return groups.map((group) => ({
      knowledgePointId: row.knowledgePointId,
      sourceId: row.sourceId,
      patternGroupId: group.patternGroupId,
      patternSpecIds: [...new Set(group.patternSpecIds ?? [])],
      questionMode: questionModeFor(group),
    }));
  });
}

async function waitForServer(url, attempts = 60) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // retry
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`SITE_SERVER_TIMEOUT:${url}`);
}

async function renderPdfCases(browser, runtime) {
  const rows = [];
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.emulateMedia({ media: "print" });

  for (const testCase of compatibilityCases(runtime)) {
    const result = buildWorksheetDocumentFromPlan(plan(testCase));
    if (!result?.ok || !result?.worksheetDocument) {
      throw new Error(`P03D_WORKSHEET_BUILD_FAILED:${testCase.knowledgePointId}:${testCase.patternGroupId}:${JSON.stringify(result?.errors ?? [])}`);
    }
    const document = result.worksheetDocument;
    const authority = authorityEvidence(result, document);
    if (!authority.valid) {
      throw new Error(`P03D_GLOBAL_AUTHORITY_INVALID:${testCase.knowledgePointId}:${testCase.patternGroupId}:${JSON.stringify(authority)}`);
    }
    if (questionCount(document) <= 0) throw new Error(`P03D_WORKSHEET_EMPTY:${testCase.knowledgePointId}:${testCase.patternGroupId}`);
    if (answerKeyCount(document) <= 0) throw new Error(`P03D_ANSWER_KEY_EMPTY:${testCase.knowledgePointId}:${testCase.patternGroupId}`);

    const html = renderWorksheetDocumentToHtml(document, {
      title: `P03D ${testCase.knowledgePointId} ${testCase.patternGroupId}`,
      stylesheetHref: pathToFileURL(STYLE_PATH).href,
      debugDataAttributes: true,
    });
    if (!html.includes("<html") || !html.includes("worksheet")) {
      throw new Error(`P03D_HTML_RENDER_INVALID:${testCase.knowledgePointId}:${testCase.patternGroupId}`);
    }

    const stem = `${testCase.knowledgePointId}-${testCase.patternGroupId}`.replaceAll(/[^a-zA-Z0-9._-]/g, "_");
    const htmlPath = path.join(OUT_DIR, `${stem}.html`);
    const pdfPath = path.join(OUT_DIR, `${stem}.pdf`);
    await writeFile(htmlPath, html);
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });

    const overflowFindings = await page.evaluate(() => {
      const elements = [...document.querySelectorAll(".worksheet-page, .print-page")];
      return elements.flatMap((element, index) => {
        const vertical = element.scrollHeight > element.clientHeight + 3;
        const horizontal = element.scrollWidth > element.clientWidth + 3;
        return vertical || horizontal
          ? [{ index, vertical, horizontal, scrollHeight: element.scrollHeight, clientHeight: element.clientHeight, scrollWidth: element.scrollWidth, clientWidth: element.clientWidth }]
          : [];
      });
    });
    if (overflowFindings.length > 0) {
      throw new Error(`P03D_PDF_PAGE_OVERFLOW:${testCase.knowledgePointId}:${testCase.patternGroupId}:${JSON.stringify(overflowFindings)}`);
    }

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });
    if (pdf.length < 5000 || pdf.subarray(0, 5).toString("ascii") !== "%PDF-") {
      throw new Error(`P03D_PDF_INVALID:${testCase.knowledgePointId}:${testCase.patternGroupId}:${pdf.length}`);
    }
    await writeFile(pdfPath, pdf);

    rows.push({
      ...testCase,
      questionCount: questionCount(document),
      answerKeyCount: answerKeyCount(document),
      authorityMode: authority.authorityMode,
      legacyAuthorityRole: authority.legacyAuthorityRole,
      globalAuthorityEvidencePass: authority.valid,
      htmlBytes: Buffer.byteLength(html),
      htmlSha256: sha256(html),
      pdfBytes: pdf.length,
      pdfSha256: sha256(pdf),
      overflowFindingCount: 0,
      status: "PASS",
    });
  }
  await page.close();
  return rows;
}

async function liveUiSmoke(browser, runtime) {
  const sourceIds = [...new Set(runtime.rows.map((row) => row.sourceId))].sort();
  const server = spawn(process.execPath, [path.join(ROOT, "tools/site/serve-site.js")], {
    cwd: ROOT,
    env: { ...process.env, SITE_PORT: String(SITE_PORT), SITE_HOST: "127.0.0.1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  try {
    await waitForServer(SITE_URL);
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto(SITE_URL, { waitUntil: "networkidle" });
    const sourceOptions = await page.locator("#batch-a-source-select option").evaluateAll((options) => options.map((option) => option.value));
    for (const sourceId of sourceIds) {
      if (!sourceOptions.includes(sourceId)) throw new Error(`P03D_UI_SOURCE_OPTION_MISSING:${sourceId}`);
      await page.selectOption("#batch-a-source-select", sourceId);
      await page.waitForFunction((expectedSourceId) => document.querySelector("#g5a-u08-public-controls")?.dataset.sourceId === expectedSourceId, sourceId);
      const modeOptions = await page.locator("#g5a-u08-question-mode option").evaluateAll((options) => options.map((option) => option.value));
      if (!modeOptions.includes("numeric")) throw new Error(`P03D_UI_NUMERIC_MODE_MISSING:${sourceId}`);
      await page.selectOption("#g5a-u08-question-mode", "numeric");
      await page.fill("#batch-a-question-count-input", "4");
      await page.click("#regenerate-button");
      await page.waitForFunction(() => document.querySelector("#status-panel")?.dataset.tone === "success", null, { timeout: 30000 });
      if (await page.locator("#print-button").isDisabled()) throw new Error(`P03D_UI_PRINT_DISABLED:${sourceId}`);
      const previewMeta = await page.locator("#preview-meta").textContent();
      if (!previewMeta?.includes("題") || !previewMeta.includes("答案頁")) throw new Error(`P03D_UI_PREVIEW_META_INVALID:${sourceId}:${previewMeta}`);
      const frame = page.frames().find((candidate) => candidate !== page.mainFrame());
      if (!frame) throw new Error(`P03D_UI_PREVIEW_FRAME_MISSING:${sourceId}`);
      const pageCount = await frame.locator(".worksheet-page, .print-page").count();
      if (pageCount <= 0) throw new Error(`P03D_UI_PREVIEW_PAGE_MISSING:${sourceId}`);
    }
    await page.close();
    return {
      sourceOptionCount: sourceOptions.length,
      testedSourceCount: sourceIds.length,
      previewAndPrintEnabledCount: sourceIds.length,
      status: "PASS",
    };
  } finally {
    server.kill("SIGTERM");
  }
}

await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });

const runtime = materializeP03DW3ProtectedD0CompatibilityRevalidation();
const browser = await chromium.launch({ headless: true });
try {
  const pdfRows = await renderPdfCases(browser, runtime);
  const ui = await liveUiSmoke(browser, runtime);
  const report = {
    schemaName: "P03DProtectedD0CompatibilityChromiumAcceptanceV1",
    programId: runtime.programId,
    taskId: runtime.taskId,
    status: "PASS",
    protectedKnowledgePointCount: runtime.metrics.protectedKnowledgePointCount,
    protectedSourceCount: runtime.metrics.protectedSourceCount,
    expectedCaseCount: runtime.metrics.compatibilityWitnessCount,
    actualCaseCount: pdfRows.length,
    pdfPassCount: pdfRows.filter((row) => row.status === "PASS").length,
    globalAuthorityPrimaryPassCount: pdfRows.filter((row) => row.globalAuthorityEvidencePass).length,
    overflowFindingCount: pdfRows.reduce((sum, row) => sum + row.overflowFindingCount, 0),
    generatedQuestionCount: pdfRows.reduce((sum, row) => sum + row.questionCount, 0),
    answerKeyItemCount: pdfRows.reduce((sum, row) => sum + row.answerKeyCount, 0),
    ui,
    rows: pdfRows,
  };
  if (report.protectedKnowledgePointCount !== 4
    || report.protectedSourceCount !== 3
    || report.actualCaseCount !== report.expectedCaseCount
    || report.pdfPassCount !== report.expectedCaseCount
    || report.globalAuthorityPrimaryPassCount !== report.expectedCaseCount
    || report.overflowFindingCount !== 0
    || report.ui.testedSourceCount !== 3
    || report.ui.status !== "PASS") {
    throw new Error(`P03D_CHROMIUM_ACCEPTANCE_COUNT_MISMATCH:${JSON.stringify(report)}`);
  }
  await writeFile(path.join(OUT_DIR, "report.json"), JSON.stringify(report, null, 2));
  console.log(`P03D_CHROMIUM_READBACK ${JSON.stringify({
    protectedKnowledgePoints: report.protectedKnowledgePointCount,
    protectedSources: report.protectedSourceCount,
    pdfCases: report.actualCaseCount,
    globalAuthorityPrimary: report.globalAuthorityPrimaryPassCount,
    overflowFindings: report.overflowFindingCount,
    generatedQuestions: report.generatedQuestionCount,
    answerKeyItems: report.answerKeyItemCount,
    uiSources: report.ui.testedSourceCount,
  })}`);
} finally {
  await browser.close();
}
