import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT_DIR = path.join(ROOT, "tmp/pgc-r07-a03-chromium-print-answer-matrix");
const SITE_PORT = 4193;
const SITE_ORIGIN = `http://127.0.0.1:${SITE_PORT}`;
const SOURCE_ID = "g5a_u08_5a08";
const QUESTION_COUNT = 6;
const GENERATION_SEED = "pgc-r07-a03-g5a-u08-shared-seed";

const SURFACES = Object.freeze([
  {
    surfaceId: "CLASSIC",
    url: `${SITE_ORIGIN}/index.html`,
    adapter: "classic",
  },
  {
    surfaceId: "FALLBACK_404",
    url: `${SITE_ORIGIN}/404.html`,
    adapter: "classic",
  },
  {
    surfaceId: "PIXEL",
    url: `${SITE_ORIGIN}/pixel/index.html`,
    adapter: "pixel",
  },
]);

function normalizeText(value) {
  return String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeNumberText(value) {
  return normalizeText(value).replace(/\s+/g, "").replace(/[。．]/g, ".");
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function fail(code, details = {}) {
  const error = new Error(code);
  error.details = details;
  throw error;
}

async function waitForServer(url, attempts = 80) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) return;
    } catch {
      // Retry while the static server starts.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  fail("PGC_R07_A03_SITE_SERVER_TIMEOUT", { url });
}

async function setChecked(page, selector, checked) {
  if (checked) await page.check(selector);
  else await page.uncheck(selector);
}

async function waitForOption(page, selector, value) {
  await page.waitForFunction(
    ({ selector, value }) => [...(document.querySelector(selector)?.options ?? [])]
      .some((option) => option.value === value && !option.disabled),
    { selector, value },
    { timeout: 120000 },
  );
}

async function configureClassic(page, includeAnswerKey) {
  await waitForOption(page, "#batch-a-source-select", SOURCE_ID);
  await page.selectOption("#batch-a-source-select", SOURCE_ID);
  await waitForOption(page, "#batch-a-selection-mode-select", "sourceUnit");
  await page.selectOption("#batch-a-selection-mode-select", "sourceUnit");
  await page.waitForFunction(
    (sourceId) => document.querySelector("#g5a-u08-public-controls")?.dataset.sourceId === sourceId,
    SOURCE_ID,
    { timeout: 120000 },
  );
  for (const [selector, value] of [
    ["#g5a-u08-question-mode", "mixed"],
    ["#g5a-u08-depth-mode", "mixed"],
    ["#g5a-u08-context-mode", "mixed"],
  ]) {
    await waitForOption(page, selector, value);
    await page.selectOption(selector, value);
  }
  await page.fill("#batch-a-question-count-input", String(QUESTION_COUNT));
  await page.selectOption("#batch-a-ordering-select", "groupedByPattern");
  await page.fill("#generation-seed-input", GENERATION_SEED);
  await page.fill("#columns-input", "3");
  await page.fill("#rows-per-page-input", "5");
  await setChecked(page, "#batch-a-answer-key-input", includeAnswerKey);
  await page.click("#regenerate-button");
  await page.waitForFunction(
    () => ["success", "error"].includes(document.querySelector("#status-panel")?.dataset.tone),
    null,
    { timeout: 120000 },
  );
  const tone = await page.locator("#status-panel").getAttribute("data-tone");
  if (tone !== "success") {
    fail("PGC_R07_A03_CLASSIC_GENERATION_FAILED", {
      status: normalizeText(await page.locator("#status-panel").textContent()),
      validation: normalizeText(await page.locator("#validation-panel").textContent()),
      url: page.url(),
    });
  }
  return {
    frameSelector: "#preview-frame",
    printButtonSelector: "#print-button",
    previewMetaSelector: "#preview-meta",
  };
}

async function configurePixel(page, includeAnswerKey) {
  await waitForOption(page, "#pixel-grade-select", "5");
  await page.selectOption("#pixel-grade-select", "5");
  await waitForOption(page, "#pixel-semester-select", "upper");
  await page.selectOption("#pixel-semester-select", "upper");
  await waitForOption(page, "#pixel-source-select", SOURCE_ID);
  await page.selectOption("#pixel-source-select", SOURCE_ID);
  await waitForOption(page, "#pixel-selection-mode-select", "sourceUnit");
  await page.selectOption("#pixel-selection-mode-select", "sourceUnit");
  await page.fill("#pixel-question-count", String(QUESTION_COUNT));
  await page.selectOption("#pixel-ordering", "groupedByPattern");
  await page.fill("#pixel-generation-seed", GENERATION_SEED);
  await page.fill("#pixel-columns", "3");
  await page.fill("#pixel-rows-per-page", "5");
  await setChecked(page, "#pixel-answer-key", includeAnswerKey);
  await page.click("#pixel-generate-button");
  await page.waitForFunction(
    () => ["success", "error"].includes(document.body.dataset.pixelGenerationStatus),
    null,
    { timeout: 120000 },
  );
  if (await page.locator("body").getAttribute("data-pixel-generation-status") !== "success") {
    fail("PGC_R07_A03_PIXEL_GENERATION_FAILED", {
      status: normalizeText(await page.locator("#pixel-generation-status").textContent()),
      errors: normalizeText(await page.locator("#pixel-generation-errors").textContent()),
      url: page.url(),
    });
  }
  await page.waitForFunction(
    () => document.body.dataset.pixelPreviewStatus === "ready"
      && document.body.dataset.pixelPrintStatus === "ready",
    null,
    { timeout: 120000 },
  );
  return {
    frameSelector: "#pixel-preview-frame",
    printButtonSelector: "#pixel-print-button",
    previewMetaSelector: "#pixel-preview-meta",
  };
}

async function configureSurface(page, surface, includeAnswerKey) {
  if (surface.adapter === "pixel") return configurePixel(page, includeAnswerKey);
  return configureClassic(page, includeAnswerKey);
}

async function getPreviewFrame(page, frameSelector) {
  const iframe = page.locator(frameSelector);
  await iframe.waitFor({ state: "attached", timeout: 120000 });
  const handle = await iframe.elementHandle();
  const frame = await handle?.contentFrame();
  if (!frame) fail("PGC_R07_A03_PREVIEW_FRAME_MISSING", { frameSelector, url: page.url() });
  await frame.locator("body").waitFor({ state: "attached", timeout: 120000 });
  return frame;
}

async function readPreviewEvidence(frame) {
  const questionCells = frame.locator(".g5a-u08-cell--question");
  const answerCells = frame.locator(".g5a-u08-cell--answer");
  const questionTexts = (await questionCells.allInnerTexts()).map(normalizeText);
  const answerTexts = (await answerCells.allInnerTexts()).map(normalizeText);
  const questionNumbers = (await frame.locator(
    ".g5a-u08-cell--question .g5a-u08-cell__number",
  ).allTextContents()).map(normalizeNumberText);
  const answerNumbers = (await frame.locator(
    ".g5a-u08-cell--answer .g5a-u08-cell__number",
  ).allTextContents()).map(normalizeNumberText);
  const questionPageCount = await frame.locator(".g5a-u08-page--questions").count();
  const answerPageCount = await frame.locator(".g5a-u08-page--answers").count();
  const publicText = normalizeText(await frame.locator("body").innerText());
  const html = await frame.content();
  if (questionTexts.length !== QUESTION_COUNT || questionNumbers.length !== QUESTION_COUNT) {
    fail("PGC_R07_A03_QUESTION_IDENTITY_INCOMPLETE", {
      questionTextCount: questionTexts.length,
      questionNumberCount: questionNumbers.length,
    });
  }
  if (/\b(?:kp|pg|ps|tpl)_g5a_u08_[a-z0-9_]+\b/i.test(publicText)) {
    fail("PGC_R07_A03_INTERNAL_ID_LEAK");
  }
  if (/\{\{[^}]+\}\}|\[[A-Z_]+\]|undefined|null/.test(publicText)) {
    fail("PGC_R07_A03_PLACEHOLDER_LEAK");
  }
  return {
    questionTexts,
    answerTexts,
    questionNumbers,
    answerNumbers,
    questionPageCount,
    answerPageCount,
    questionIdentitySha256: sha256(JSON.stringify(questionTexts)),
    answerIdentitySha256: sha256(JSON.stringify(answerTexts)),
    publicTextSha256: sha256(publicText),
    html,
  };
}

async function assertPrintInvocation(page, frame, printButtonSelector) {
  if (await page.locator(printButtonSelector).isDisabled()) {
    fail("PGC_R07_A03_PRINT_BUTTON_DISABLED", { printButtonSelector, url: page.url() });
  }
  await frame.evaluate(() => {
    globalThis.__pgcR07A03PrintInvoked = false;
    globalThis.print = () => {
      globalThis.__pgcR07A03PrintInvoked = true;
    };
  });
  await page.click(printButtonSelector);
  await frame.waitForFunction(() => globalThis.__pgcR07A03PrintInvoked === true, null, {
    timeout: 30000,
  });
}

function injectBaseHref(html, baseHref) {
  const baseTag = `<base href="${baseHref}">`;
  return html.includes("<head>")
    ? html.replace("<head>", `<head>${baseTag}`)
    : `${baseTag}${html}`;
}

async function renderChromiumPdf(browser, surface, includeAnswerKey, previewHtml) {
  const stem = `${surface.surfaceId.toLowerCase()}-answer-${includeAnswerKey ? "on" : "off"}`;
  const htmlPath = path.join(OUTPUT_DIR, `${stem}.html`);
  const pdfPath = path.join(OUTPUT_DIR, `${stem}.pdf`);
  const html = injectBaseHref(previewHtml, surface.url);
  await writeFile(htmlPath, html, "utf8");
  const printPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  try {
    await printPage.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle", timeout: 120000 });
    await printPage.emulateMedia({ media: "print" });
    await printPage.evaluate(async () => document.fonts?.ready);
    const overflowFindings = await printPage.evaluate(() => [
      ...document.querySelectorAll(".g5a-u08-page, .worksheet-page, .print-page"),
    ].flatMap((element, index) => {
      const vertical = element.scrollHeight > element.clientHeight + 3;
      const horizontal = element.scrollWidth > element.clientWidth + 3;
      return vertical || horizontal
        ? [{
          index,
          vertical,
          horizontal,
          scrollHeight: element.scrollHeight,
          clientHeight: element.clientHeight,
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
        }]
        : [];
    }));
    if (overflowFindings.length > 0) {
      fail("PGC_R07_A03_PDF_PAGE_OVERFLOW", {
        surfaceId: surface.surfaceId,
        includeAnswerKey,
        overflowFindings,
      });
    }
    const pdf = await printPage.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });
    if (pdf.length < 5000 || pdf.subarray(0, 5).toString("ascii") !== "%PDF-") {
      fail("PGC_R07_A03_PDF_INVALID", {
        surfaceId: surface.surfaceId,
        includeAnswerKey,
        pdfBytes: pdf.length,
      });
    }
    await writeFile(pdfPath, pdf);
    return {
      htmlPath: path.relative(ROOT, htmlPath),
      htmlBytes: Buffer.byteLength(html),
      htmlSha256: sha256(html),
      pdfPath: path.relative(ROOT, pdfPath),
      pdfBytes: pdf.length,
      pdfSha256: sha256(pdf),
      overflowFindingCount: 0,
    };
  } finally {
    await printPage.close();
  }
}

async function runCase(browser, surface, includeAnswerKey) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  try {
    const response = await page.goto(`${surface.url}?pgcR07A03=${Date.now()}`, {
      waitUntil: "networkidle",
      timeout: 120000,
    });
    if (!response?.ok()) {
      fail("PGC_R07_A03_SURFACE_HTTP_FAILED", {
        surfaceId: surface.surfaceId,
        status: response?.status(),
      });
    }
    const adapter = await configureSurface(page, surface, includeAnswerKey);
    const frame = await getPreviewFrame(page, adapter.frameSelector);
    const preview = await readPreviewEvidence(frame);
    const expectedAnswerCount = includeAnswerKey ? QUESTION_COUNT : 0;
    if (preview.answerTexts.length !== expectedAnswerCount) {
      fail("PGC_R07_A03_ANSWER_COUNT_MISMATCH", {
        surfaceId: surface.surfaceId,
        includeAnswerKey,
        expectedAnswerCount,
        actualAnswerCount: preview.answerTexts.length,
      });
    }
    if (includeAnswerKey) {
      if (JSON.stringify(preview.questionNumbers) !== JSON.stringify(preview.answerNumbers)) {
        fail("PGC_R07_A03_QUESTION_ANSWER_BIJECTION_FAILED", {
          surfaceId: surface.surfaceId,
          questionNumbers: preview.questionNumbers,
          answerNumbers: preview.answerNumbers,
        });
      }
      if (preview.answerPageCount < 1) {
        fail("PGC_R07_A03_ANSWER_PAGE_MISSING", { surfaceId: surface.surfaceId });
      }
    } else if (preview.answerPageCount !== 0) {
      fail("PGC_R07_A03_UNREQUESTED_ANSWER_PAGE", {
        surfaceId: surface.surfaceId,
        answerPageCount: preview.answerPageCount,
      });
    }
    if (preview.questionPageCount < 1) {
      fail("PGC_R07_A03_QUESTION_PAGE_MISSING", { surfaceId: surface.surfaceId });
    }
    await assertPrintInvocation(page, frame, adapter.printButtonSelector);
    const pdf = await renderChromiumPdf(browser, surface, includeAnswerKey, preview.html);
    if (consoleErrors.length > 0 || pageErrors.length > 0) {
      fail("PGC_R07_A03_BROWSER_ERROR", {
        surfaceId: surface.surfaceId,
        includeAnswerKey,
        consoleErrors,
        pageErrors,
      });
    }
    return {
      surfaceId: surface.surfaceId,
      outputProjection: "CHROMIUM_PDF",
      includeAnswerKey,
      sourceId: SOURCE_ID,
      questionCount: preview.questionTexts.length,
      answerCount: preview.answerTexts.length,
      questionPageCount: preview.questionPageCount,
      answerPageCount: preview.answerPageCount,
      questionNumbers: preview.questionNumbers,
      answerNumbers: preview.answerNumbers,
      questionIdentitySha256: preview.questionIdentitySha256,
      answerIdentitySha256: preview.answerIdentitySha256,
      publicTextSha256: preview.publicTextSha256,
      previewMeta: normalizeText(await page.locator(adapter.previewMetaSelector).textContent()),
      printInvoked: true,
      consoleErrorCount: 0,
      pageErrorCount: 0,
      ...pdf,
      status: "PASS",
    };
  } finally {
    await page.close();
  }
}

function assertParity(rows) {
  const answerOn = rows.filter((row) => row.includeAnswerKey);
  const answerOff = rows.filter((row) => !row.includeAnswerKey);
  const questionIdentities = new Set(rows.map((row) => row.questionIdentitySha256));
  if (questionIdentities.size !== 1) {
    fail("PGC_R07_A03_CROSS_SURFACE_QUESTION_IDENTITY_DRIFT", {
      identities: rows.map((row) => ({
        surfaceId: row.surfaceId,
        includeAnswerKey: row.includeAnswerKey,
        questionIdentitySha256: row.questionIdentitySha256,
      })),
    });
  }
  const answerIdentities = new Set(answerOn.map((row) => row.answerIdentitySha256));
  if (answerIdentities.size !== 1) {
    fail("PGC_R07_A03_CROSS_SURFACE_ANSWER_IDENTITY_DRIFT", {
      identities: answerOn.map((row) => ({
        surfaceId: row.surfaceId,
        answerIdentitySha256: row.answerIdentitySha256,
      })),
    });
  }
  for (const surface of SURFACES) {
    const on = answerOn.find((row) => row.surfaceId === surface.surfaceId);
    const off = answerOff.find((row) => row.surfaceId === surface.surfaceId);
    if (!on || !off || on.questionIdentitySha256 !== off.questionIdentitySha256) {
      fail("PGC_R07_A03_ANSWER_TOGGLE_CHANGED_QUESTION_IDENTITY", {
        surfaceId: surface.surfaceId,
        on: on?.questionIdentitySha256,
        off: off?.questionIdentitySha256,
      });
    }
  }
  return {
    sameQuestionIdentityAcrossAllRows: true,
    sameAnswerIdentityAcrossAnswerKeyRows: true,
    answerTogglePreservesQuestionIdentity: true,
    questionIdentitySha256: rows[0].questionIdentitySha256,
    answerIdentitySha256: answerOn[0].answerIdentitySha256,
  };
}

await rm(OUTPUT_DIR, { recursive: true, force: true });
await mkdir(OUTPUT_DIR, { recursive: true });

const server = spawn(process.execPath, [path.join(ROOT, "tools/site/serve-site.js")], {
  cwd: ROOT,
  env: { ...process.env, SITE_PORT: String(SITE_PORT), SITE_HOST: "127.0.0.1" },
  stdio: ["ignore", "pipe", "pipe"],
});

let browser;
try {
  await waitForServer(`${SITE_ORIGIN}/index.html`);
  browser = await chromium.launch({ headless: true });
  const rows = [];
  for (const surface of SURFACES) {
    rows.push(await runCase(browser, surface, true));
    rows.push(await runCase(browser, surface, false));
  }
  const parity = assertParity(rows);
  const report = {
    schemaName: "PGCR07A03ChromiumPrintAnswerKeyMatrixV1",
    schemaVersion: 1,
    programId: "PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    taskId: "PGC-R07-A03_RealChromiumPrintAndAnswerKeyMatrix",
    status: "PASS",
    config: {
      sourceId: SOURCE_ID,
      selectionMode: "sourceUnit",
      questionMode: "mixed",
      depthMode: "mixed",
      contextMode: "mixed",
      questionCount: QUESTION_COUNT,
      ordering: "groupedByPattern",
      generationSeed: GENERATION_SEED,
      columns: 3,
      rowsPerPage: 5,
    },
    expectedRowCount: 6,
    actualRowCount: rows.length,
    surfaceCount: SURFACES.length,
    answerKeyModeCount: 2,
    pdfPassCount: rows.filter((row) => row.status === "PASS").length,
    printInvocationPassCount: rows.filter((row) => row.printInvoked).length,
    answerKeyBijectionPassCount: rows.filter((row) => row.includeAnswerKey
      && JSON.stringify(row.questionNumbers) === JSON.stringify(row.answerNumbers)).length,
    consoleErrorCount: rows.reduce((sum, row) => sum + row.consoleErrorCount, 0),
    pageErrorCount: rows.reduce((sum, row) => sum + row.pageErrorCount, 0),
    overflowFindingCount: rows.reduce((sum, row) => sum + row.overflowFindingCount, 0),
    parity,
    rows,
  };
  if (
    report.actualRowCount !== report.expectedRowCount
    || report.pdfPassCount !== 6
    || report.printInvocationPassCount !== 6
    || report.answerKeyBijectionPassCount !== 3
    || report.consoleErrorCount !== 0
    || report.pageErrorCount !== 0
    || report.overflowFindingCount !== 0
  ) {
    fail("PGC_R07_A03_MATRIX_GATE_FAILED", report);
  }
  await writeFile(path.join(OUTPUT_DIR, "report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report, null, 2));
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}
