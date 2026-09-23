import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT_DIR = path.join(ROOT, "tmp/pgc-r07-a04-overflow-font-pagination-matrix");
const SITE_PORT = 4194;
const SITE_ORIGIN = `http://127.0.0.1:${SITE_PORT}`;

const BRANCHES = Object.freeze([
  "SHARED_EXACT_LAYOUT",
  "DYNAMIC_HTML",
  "STATIC_HTML_URL",
  "SHARED_FALLBACK",
]);

const PROFILES = Object.freeze([
  {
    profileId: "LONG_TEXT",
    questionCount: 8,
    columns: 2,
    rowsPerPage: 2,
    prompt(index) {
      return `${index}. 校園環境行動紀錄：五年級學生先整理回收物，再比較兩種分配方案的總量與差異，請依題意完成整數四則計算並檢查答案是否合理。`;
    },
    answer(index) {
      return `${index * 125 + 37}，並以原題條件重新代入確認。`;
    },
  },
  {
    profileId: "DENSE_NUMERIC",
    questionCount: 24,
    columns: 3,
    rowsPerPage: 4,
    prompt(index) {
      return `${index}. 計算：（${index * 37 + 1200}＋${index * 19 + 86}）×2－${index + 14}＝________`;
    },
    answer(index) {
      return String((index * 37 + 1200 + index * 19 + 86) * 2 - (index + 14));
    },
  },
]);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function fail(code, details = {}) {
  const error = new Error(code);
  error.details = details;
  throw error;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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
  fail("PGC_R07_A04_SITE_SERVER_TIMEOUT", { url });
}

function makeCell(profile, index, answerKey) {
  const questionNumber = index + 1;
  const questionId = `${profile.profileId.toLowerCase()}-${questionNumber}`;
  if (answerKey) {
    return {
      cellType: "answerKey",
      cellIndex: index,
      rowIndex: Math.floor(index / profile.columns),
      columnIndex: index % profile.columns,
      questionId,
      questionNumber,
      answerKeyItem: {
        questionId,
        questionNumber,
        patternId: `pgc-r07-a04-${profile.profileId.toLowerCase()}`,
        promptText: profile.prompt(questionNumber),
        answerText: profile.answer(questionNumber),
      },
    };
  }
  return {
    cellType: "question",
    cellIndex: index,
    rowIndex: Math.floor(index / profile.columns),
    columnIndex: index % profile.columns,
    questionId,
    questionNumber,
    displayModel: {
      questionId,
      questionNumber,
      patternId: `pgc-r07-a04-${profile.profileId.toLowerCase()}`,
      blankedDisplayText: profile.prompt(questionNumber),
      questionNumberText: `${questionNumber}.`,
    },
  };
}

function makePages(profile, answerKey) {
  const capacity = profile.columns * profile.rowsPerPage;
  const pages = [];
  for (let offset = 0; offset < profile.questionCount; offset += capacity) {
    const cells = [];
    const end = Math.min(profile.questionCount, offset + capacity);
    for (let index = offset; index < end; index += 1) {
      cells.push(makeCell(profile, index, answerKey));
    }
    pages.push({
      pageNumber: pages.length + 1,
      pageType: answerKey ? "answerKey" : "questions",
      columns: profile.columns,
      rowsPerPage: profile.rowsPerPage,
      cells,
    });
  }
  return pages;
}

function legacyHtml(profile, branchId) {
  const questionPages = makePages(profile, false);
  const answerPages = makePages(profile, true);
  const renderCell = (cell) => cell.cellType === "question"
    ? `<article class="worksheet-cell worksheet-cell--question" data-question-number="${cell.questionNumber}"><div class="worksheet-cell__number">${cell.questionNumber}.</div><div class="worksheet-cell__prompt">${escapeHtml(cell.displayModel.blankedDisplayText)}</div></article>`
    : `<article class="worksheet-cell worksheet-cell--answer-key" data-question-number="${cell.questionNumber}"><div class="worksheet-cell__number">${cell.questionNumber}.</div><div class="worksheet-cell__prompt">${escapeHtml(cell.answerKeyItem.promptText)}</div><div class="worksheet-cell__answer">${escapeHtml(cell.answerKeyItem.answerText)}</div></article>`;
  const renderPage = (page, answerKey) => `<section class="worksheet-page print-page ${answerKey ? "worksheet-page--answer-key" : "worksheet-page--questions"}" data-page-type="${answerKey ? "answerKey" : "questions"}"><header>${answerKey ? "答案頁" : "題目頁"} ${page.pageNumber}</header><div class="worksheet-page__grid" style="--worksheet-columns:${page.columns}">${page.cells.map(renderCell).join("")}</div></section>`;
  return `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><style>
    *{box-sizing:border-box}body{margin:0;font-family:"Noto Sans CJK TC","Noto Sans TC","Microsoft JhengHei",Arial,sans-serif;color:#17202a}.worksheet-document{display:block}.worksheet-page{width:210mm;height:296mm;min-height:296mm;max-height:296mm;padding:12mm;margin:0;overflow:hidden;break-after:page;page-break-after:always;background:#fff}.worksheet-page:last-child{break-after:auto;page-break-after:auto}.worksheet-page>header{height:10mm;border-bottom:1px solid #999;margin-bottom:4mm;font-weight:700}.worksheet-page__grid{height:258mm;display:grid;grid-template-columns:repeat(var(--worksheet-columns),minmax(0,1fr));grid-auto-rows:minmax(0,1fr);gap:7px}.worksheet-cell{min-width:0;min-height:0;border:1px solid #aab3bd;border-radius:3px;padding:7px 8px;overflow:hidden;display:flex;flex-direction:column;gap:4px}.worksheet-cell__prompt,.worksheet-cell__answer{font-size:11px;line-height:1.35;overflow-wrap:anywhere;white-space:pre-wrap}.worksheet-cell__number{font-size:11px;font-weight:700}.worksheet-cell__answer{font-weight:700}@page{size:A4;margin:0}@media print{body{background:#fff}}
  </style></head><body data-pgc-r07-a04-legacy-branch="${branchId}"><main class="worksheet-document">${questionPages.map((page) => renderPage(page, false)).join("")}${answerPages.map((page) => renderPage(page, true)).join("")}</main></body></html>`;
}

function makeDocument(profile, branchId) {
  const questionPages = makePages(profile, false);
  const answerKeyPages = makePages(profile, true);
  const base = {
    worksheetKind: "batchAWorksheet",
    title: `PGC-R07 A04 ${profile.profileId}`,
    subtitle: "繁體中文壓力測試",
    questionPages,
    answerKeyPages,
    printOptions: {
      paperSize: "A4",
      columns: profile.columns,
      rowsPerPage: profile.rowsPerPage,
      showAnswerKey: true,
    },
  };
  if (branchId === "SHARED_EXACT_LAYOUT") {
    return {
      ...base,
      layoutResolution: {
        layoutMode: "exact_approved_matrix",
        layoutExact: true,
      },
    };
  }
  if (branchId === "DYNAMIC_HTML") {
    return {
      worksheetKind: "batchAWorksheet",
      dynamicHtml: legacyHtml(profile, branchId),
    };
  }
  if (branchId === "STATIC_HTML_URL") {
    return {
      worksheetKind: "batchAWorksheet",
      staticHtmlUrl: `data:text/html;charset=utf-8,${encodeURIComponent(legacyHtml(profile, branchId))}`,
    };
  }
  return base;
}

async function routeRendererBranch(page, branchId, profile) {
  await page.goto(`${SITE_ORIGIN}/index.html?pgcR07A04=${Date.now()}`, {
    waitUntil: "networkidle",
    timeout: 120000,
  });
  const worksheetDocument = makeDocument(profile, branchId);
  const routeEvidence = await page.evaluate(async ({ branchId: expectedBranch, worksheetDocument: input }) => {
    const module = await import(`/assets/browser/pipeline/render-preview-frame.js?pgcR07A04=${Date.now()}`);
    const iframe = document.createElement("iframe");
    iframe.id = "pgc-r07-a04-frame";
    iframe.style.width = "100%";
    iframe.style.height = "900px";
    document.body.replaceChildren(iframe);
    const exactEligible = module.shouldUseSharedExactLayoutRenderer(input);
    const result = module.renderPreviewFrame(iframe, input, {
      stylesheetHref: `${location.origin}/assets/styles/print-styles.css`,
      title: `PGC-R07 A04 ${expectedBranch}`,
    });
    iframe.dataset.pgcR07A04ExpectedBranch = expectedBranch;
    return {
      exactEligible,
      dynamic: result?.dynamic === true,
      staticHtmlUrl: typeof result?.staticHtmlUrl === "string",
      sharedExactLayout: result?.sharedExactLayout === true,
    };
  }, { branchId, worksheetDocument });

  if (branchId === "STATIC_HTML_URL") {
    await page.waitForFunction(
      () => document.querySelector("#pgc-r07-a04-frame")?.dataset.staticCandidateStatus === "ready",
      null,
      { timeout: 120000 },
    );
  }
  const iframe = page.locator("#pgc-r07-a04-frame");
  await iframe.waitFor({ state: "attached", timeout: 120000 });
  const handle = await iframe.elementHandle();
  const frame = await handle?.contentFrame();
  if (!frame) fail("PGC_R07_A04_PREVIEW_FRAME_MISSING", { branchId, profileId: profile.profileId });
  await frame.locator(".worksheet-page, .print-page").first().waitFor({ state: "visible", timeout: 120000 });

  const routePass = branchId === "SHARED_EXACT_LAYOUT"
    ? routeEvidence.exactEligible && routeEvidence.sharedExactLayout
    : branchId === "DYNAMIC_HTML"
      ? !routeEvidence.exactEligible && routeEvidence.dynamic
      : branchId === "STATIC_HTML_URL"
        ? !routeEvidence.exactEligible && routeEvidence.staticHtmlUrl
        : !routeEvidence.exactEligible && routeEvidence.sharedExactLayout;
  if (!routePass) {
    fail("PGC_R07_A04_RENDERER_BRANCH_ROUTE_FAILED", { branchId, profileId: profile.profileId, routeEvidence });
  }
  return { frame, routeEvidence, html: await frame.content() };
}

function injectBaseHref(html) {
  const baseTag = `<base href="${SITE_ORIGIN}/index.html">`;
  return html.includes("<head>") ? html.replace("<head>", `<head>${baseTag}`) : `${baseTag}${html}`;
}

async function inspectPrintGeometry(printPage, profile) {
  await printPage.emulateMedia({ media: "print" });
  await printPage.evaluate(async () => document.fonts?.ready);
  return printPage.evaluate(({ expectedQuestions }) => {
    const normalizeNumber = (value) => String(value ?? "").replace(/[^0-9]/g, "");
    const pageElements = [...document.querySelectorAll(".worksheet-page, .print-page")]
      .filter((element, index, array) => array.indexOf(element) === index);
    const pageFindings = [];
    const clippingFindings = [];
    const overlapFindings = [];
    const blankPageFindings = [];
    const pageRows = [];

    for (let pageIndex = 0; pageIndex < pageElements.length; pageIndex += 1) {
      const page = pageElements[pageIndex];
      const pageRect = page.getBoundingClientRect();
      const cells = [...page.querySelectorAll(".worksheet-cell--question, .worksheet-cell--answer-key, .g5a-u08-cell--question, .g5a-u08-cell--answer, .g4b-u04-cell--question, .g4b-u04-cell--answer")];
      const pageType = page.dataset.pageType
        ?? (page.className.includes("answer") ? "answerKey" : "questions");
      if (page.scrollHeight > page.clientHeight + 3 || page.scrollWidth > page.clientWidth + 3) {
        pageFindings.push({ pageIndex, pageType, scrollHeight: page.scrollHeight, clientHeight: page.clientHeight, scrollWidth: page.scrollWidth, clientWidth: page.clientWidth });
      }
      if (cells.length === 0 || String(page.textContent ?? "").trim().length < 5) {
        blankPageFindings.push({ pageIndex, pageType, cellCount: cells.length });
      }
      const rects = cells.map((cell, cellIndex) => {
        const rect = cell.getBoundingClientRect();
        if (
          cell.scrollHeight > cell.clientHeight + 3
          || cell.scrollWidth > cell.clientWidth + 3
          || rect.left < pageRect.left - 1
          || rect.right > pageRect.right + 1
          || rect.top < pageRect.top - 1
          || rect.bottom > pageRect.bottom + 1
        ) {
          clippingFindings.push({ pageIndex, cellIndex, pageType, scrollHeight: cell.scrollHeight, clientHeight: cell.clientHeight, scrollWidth: cell.scrollWidth, clientWidth: cell.clientWidth });
        }
        return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
      });
      for (let leftIndex = 0; leftIndex < rects.length; leftIndex += 1) {
        for (let rightIndex = leftIndex + 1; rightIndex < rects.length; rightIndex += 1) {
          const left = rects[leftIndex];
          const right = rects[rightIndex];
          const overlapX = Math.min(left.right, right.right) - Math.max(left.left, right.left);
          const overlapY = Math.min(left.bottom, right.bottom) - Math.max(left.top, right.top);
          if (overlapX > 1 && overlapY > 1) {
            overlapFindings.push({ pageIndex, pageType, leftIndex, rightIndex, overlapX, overlapY });
          }
        }
      }
      pageRows.push({ pageIndex, pageType, cellCount: cells.length });
    }

    const questionCells = [...document.querySelectorAll(".worksheet-cell--question, .g5a-u08-cell--question, .g4b-u04-cell--question")];
    const answerCells = [...document.querySelectorAll(".worksheet-cell--answer-key, .g5a-u08-cell--answer, .g4b-u04-cell--answer")];
    const numberFromCell = (cell) => normalizeNumber(
      cell.dataset.questionNumber
      ?? cell.querySelector(".worksheet-cell__number, .g5a-u08-cell__number, .g4b-u04-cell__number")?.textContent,
    );
    const questionNumbers = questionCells.map(numberFromCell).filter(Boolean);
    const answerNumbers = answerCells.map(numberFromCell).filter(Boolean);
    const bodyText = String(document.body.textContent ?? "");
    const sample = questionCells[0] ?? document.body;
    const fontFamily = getComputedStyle(sample).fontFamily;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = `16px ${fontFamily}`;
    const chineseGlyphWidth = context.measureText("繁體中文數學練習題").width;
    const fontStatus = document.fonts?.status ?? "unsupported";
    const fontOk = fontStatus === "loaded"
      && chineseGlyphWidth > 20
      && /[\u3400-\u9fff]/.test(bodyText)
      && !bodyText.includes("�");

    return {
      pageCount: pageElements.length,
      questionPageCount: pageRows.filter((row) => !String(row.pageType).toLowerCase().includes("answer")).length,
      answerPageCount: pageRows.filter((row) => String(row.pageType).toLowerCase().includes("answer")).length,
      questionCount: questionCells.length,
      answerCount: answerCells.length,
      questionNumbers,
      answerNumbers,
      questionAnswerBijection: JSON.stringify(questionNumbers) === JSON.stringify(answerNumbers),
      expectedQuestions,
      pageOverflowFindings: pageFindings,
      clippingFindings,
      overlapFindings,
      blankPageFindings,
      fontFamily,
      fontStatus,
      chineseGlyphWidth,
      fontOk,
    };
  }, { expectedQuestions: profile.questionCount });
}

async function runCase(browser, branchId, profile) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  try {
    const routed = await routeRendererBranch(page, branchId, profile);
    const html = injectBaseHref(routed.html);
    const stem = `${branchId.toLowerCase()}-${profile.profileId.toLowerCase()}`;
    const htmlPath = path.join(OUTPUT_DIR, `${stem}.html`);
    const pdfPath = path.join(OUTPUT_DIR, `${stem}.pdf`);
    await writeFile(htmlPath, html, "utf8");

    const printPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    let geometry;
    let pdf;
    try {
      await printPage.setContent(html, { waitUntil: "networkidle", timeout: 120000 });
      geometry = await inspectPrintGeometry(printPage, profile);
      pdf = await printPage.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
      });
    } finally {
      await printPage.close();
    }

    const expectedPageCountPerKind = Math.ceil(profile.questionCount / (profile.columns * profile.rowsPerPage));
    const failures = {
      pageOverflow: geometry.pageOverflowFindings,
      clipping: geometry.clippingFindings,
      overlap: geometry.overlapFindings,
      blankPages: geometry.blankPageFindings,
      questionCount: geometry.questionCount === profile.questionCount,
      answerCount: geometry.answerCount === profile.questionCount,
      questionAnswerBijection: geometry.questionAnswerBijection,
      questionPageCount: geometry.questionPageCount === expectedPageCountPerKind,
      answerPageCount: geometry.answerPageCount === expectedPageCountPerKind,
      fontOk: geometry.fontOk,
      pdfValid: pdf.length >= 5000 && pdf.subarray(0, 5).toString("ascii") === "%PDF-",
      consoleErrorCount: consoleErrors.length,
      pageErrorCount: pageErrors.length,
    };
    if (
      failures.pageOverflow.length > 0
      || failures.clipping.length > 0
      || failures.overlap.length > 0
      || failures.blankPages.length > 0
      || !failures.questionCount
      || !failures.answerCount
      || !failures.questionAnswerBijection
      || !failures.questionPageCount
      || !failures.answerPageCount
      || !failures.fontOk
      || !failures.pdfValid
      || failures.consoleErrorCount > 0
      || failures.pageErrorCount > 0
    ) {
      fail("PGC_R07_A04_CASE_FAILED", { branchId, profileId: profile.profileId, geometry, failures, consoleErrors, pageErrors });
    }
    await writeFile(pdfPath, pdf);
    return {
      rowId: `${branchId}_${profile.profileId}`,
      branchId,
      profileId: profile.profileId,
      questionCount: geometry.questionCount,
      answerCount: geometry.answerCount,
      questionPageCount: geometry.questionPageCount,
      answerPageCount: geometry.answerPageCount,
      questionIdentitySha256: sha256(JSON.stringify(geometry.questionNumbers)),
      answerIdentitySha256: sha256(JSON.stringify(geometry.answerNumbers)),
      routeEvidence: routed.routeEvidence,
      pageOverflowFindingCount: 0,
      clippingFindingCount: 0,
      overlapFindingCount: 0,
      blankPageFindingCount: 0,
      missingAnswerCount: 0,
      questionAnswerBijection: true,
      fontStatus: geometry.fontStatus,
      fontFamily: geometry.fontFamily,
      chineseGlyphWidth: geometry.chineseGlyphWidth,
      traditionalChineseFontOk: true,
      consoleErrorCount: 0,
      pageErrorCount: 0,
      htmlPath: path.relative(ROOT, htmlPath),
      htmlBytes: Buffer.byteLength(html),
      htmlSha256: sha256(html),
      pdfPath: path.relative(ROOT, pdfPath),
      pdfBytes: pdf.length,
      pdfSha256: sha256(pdf),
      status: "PASS",
    };
  } finally {
    await page.close();
  }
}

function assertCrossBranchIdentity(rows) {
  for (const profile of PROFILES) {
    const profileRows = rows.filter((row) => row.profileId === profile.profileId);
    if (new Set(profileRows.map((row) => row.questionIdentitySha256)).size !== 1) {
      fail("PGC_R07_A04_CROSS_BRANCH_QUESTION_IDENTITY_DRIFT", { profileId: profile.profileId, rows: profileRows });
    }
    if (new Set(profileRows.map((row) => row.answerIdentitySha256)).size !== 1) {
      fail("PGC_R07_A04_CROSS_BRANCH_ANSWER_IDENTITY_DRIFT", { profileId: profile.profileId, rows: profileRows });
    }
  }
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
  for (const branchId of BRANCHES) {
    for (const profile of PROFILES) {
      rows.push(await runCase(browser, branchId, profile));
    }
  }
  assertCrossBranchIdentity(rows);
  const report = {
    schemaName: "PGCR07A04OverflowClippingFontPaginationMatrixV1",
    schemaVersion: 1,
    programId: "PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    taskId: "PGC-R07-A04_OverflowClippingFontPaginationFullFix",
    status: "PASS",
    branchCount: BRANCHES.length,
    stressProfileCount: PROFILES.length,
    expectedRowCount: BRANCHES.length * PROFILES.length,
    actualRowCount: rows.length,
    pdfPassCount: rows.filter((row) => row.status === "PASS").length,
    pageOverflowFindingCount: rows.reduce((sum, row) => sum + row.pageOverflowFindingCount, 0),
    clippingFindingCount: rows.reduce((sum, row) => sum + row.clippingFindingCount, 0),
    overlapFindingCount: rows.reduce((sum, row) => sum + row.overlapFindingCount, 0),
    blankPageFindingCount: rows.reduce((sum, row) => sum + row.blankPageFindingCount, 0),
    missingAnswerCount: rows.reduce((sum, row) => sum + row.missingAnswerCount, 0),
    traditionalChineseFontPassCount: rows.filter((row) => row.traditionalChineseFontOk).length,
    questionAnswerBijectionPassCount: rows.filter((row) => row.questionAnswerBijection).length,
    consoleErrorCount: rows.reduce((sum, row) => sum + row.consoleErrorCount, 0),
    pageErrorCount: rows.reduce((sum, row) => sum + row.pageErrorCount, 0),
    crossBranchQuestionIdentity: "EXACT_MATCH_PER_PROFILE",
    crossBranchAnswerIdentity: "EXACT_MATCH_PER_PROFILE",
    rows,
  };
  if (
    report.actualRowCount !== report.expectedRowCount
    || report.pdfPassCount !== report.expectedRowCount
    || report.pageOverflowFindingCount !== 0
    || report.clippingFindingCount !== 0
    || report.overlapFindingCount !== 0
    || report.blankPageFindingCount !== 0
    || report.missingAnswerCount !== 0
    || report.traditionalChineseFontPassCount !== report.expectedRowCount
    || report.questionAnswerBijectionPassCount !== report.expectedRowCount
    || report.consoleErrorCount !== 0
    || report.pageErrorCount !== 0
  ) {
    fail("PGC_R07_A04_MATRIX_GATE_FAILED", report);
  }
  await writeFile(path.join(OUTPUT_DIR, "report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report, null, 2));
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}
