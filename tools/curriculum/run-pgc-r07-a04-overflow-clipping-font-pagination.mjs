import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { chromium } from "playwright";

import {
  BATCH_A_SELECTION_MODES,
  createConfigState,
  setBatchAContextMode,
  setBatchADepthMode,
  setBatchAGenerationSeed,
  setBatchAIncludeAnswerKey,
  setBatchAOrdering,
  setBatchAPrintLayout,
  setBatchAQuestionCount,
  setBatchAQuestionMode,
  setBatchASelectorSelection,
  setBatchASourceId,
} from "../../site/assets/browser/state/config-state.js";
import { buildWorksheetDocumentFromState } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT_DIR = path.join(ROOT, "tmp/pgc-r07-a04-overflow-clipping-font-pagination");
const SITE_PORT = 4194;
const SITE_ORIGIN = `http://127.0.0.1:${SITE_PORT}`;
const BRANCH_IDS = Object.freeze([
  "SHARED_EXACT_LAYOUT",
  "DYNAMIC_HTML",
  "STATIC_HTML_URL",
  "SHARED_FALLBACK",
]);
const ANSWER_MODES = Object.freeze([true, false]);
const CJK_SAMPLE = "繁體中文數學題目與答案";

const SELECTORS = Object.freeze({
  questionPage: [
    '[data-page-type="question"]',
    '[data-page-type="questions"]',
    ".worksheet-page--questions",
    ".g4b-u04-page--questions",
    ".g5a-u08-page--questions",
    ".g5a-u02-page--questions",
  ],
  answerPage: [
    '[data-page-type="answerKey"]',
    '[data-page-type="answer"]',
    '[data-page-type="answers"]',
    ".worksheet-page--answer-key",
    ".g4b-u04-page--answers",
    ".g5a-u08-page--answers",
    ".g5a-u02-page--answers",
  ],
  questionCard: [
    '[data-cell-type="question"]',
    ".worksheet-cell--question",
    ".g4b-u04-cell--question",
    ".g5a-u08-cell--question",
    ".g5a-u02-card--question",
  ],
  answerCard: [
    '[data-cell-type="answerKey"]',
    ".worksheet-cell--answer-key",
    ".g4b-u04-cell--answer",
    ".g5a-u08-cell--answer",
    ".g5a-u02-card--answer",
  ],
  questionNumber: [
    ".worksheet-cell--question .worksheet-cell__number",
    ".g4b-u04-cell--question .g4b-u04-cell__number",
    ".g5a-u08-cell--question .g5a-u08-cell__number",
    ".g5a-u02-card--question .g5a-u02-card__number",
  ],
  answerNumber: [
    ".worksheet-cell--answer-key .worksheet-cell__number",
    ".g4b-u04-cell--answer .g4b-u04-cell__number",
    ".g5a-u08-cell--answer .g5a-u08-cell__number",
    ".g5a-u02-card--answer .g5a-u02-card__number",
  ],
  prompt: [
    ".worksheet-cell--question .worksheet-cell__prompt",
    ".g4b-u04-cell--question .g4b-u04-cell__prompt",
    ".g5a-u08-cell--question .g5a-u08-cell__prompt",
    ".g5a-u02-card--question .g5a-u02-card__prompt",
  ],
  response: [
    ".worksheet-cell--question .worksheet-cell__response",
    ".g4b-u04-cell--question .g4b-u04-cell__response",
    ".g5a-u08-cell--question .g5a-u08-cell__response",
    ".g5a-u02-card--question .g5a-u02-card__response",
  ],
  answerText: [
    ".worksheet-cell--answer-key .worksheet-cell__answer",
    ".g4b-u04-cell--answer .g4b-u04-cell__answer",
    ".g5a-u08-cell--answer .g5a-u08-cell__answer",
    ".g5a-u02-card--answer .g5a-u02-card__answer",
  ],
});

function fail(code, details = {}) {
  const error = new Error(code);
  error.details = details;
  throw error;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function normalizeText(value) {
  return String(value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeNumber(value) {
  return normalizeText(value).replace(/\s+/g, "").replace(/[。．]/g, ".");
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function waitForServer(url, attempts = 80) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) return;
    } catch {
      // The static server may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  fail("PGC_R07_A04_SITE_SERVER_TIMEOUT", { url });
}

function createState({
  sourceId,
  includeAnswerKey,
  questionCount,
  columns,
  rowsPerPage,
  selectionMode = BATCH_A_SELECTION_MODES.SOURCE_UNIT,
  selectedKnowledgePointIds = [],
  selectedPatternGroupIds = [],
  questionMode,
  depthMode,
  contextMode,
  seed,
}) {
  const state = createConfigState();
  setBatchASourceId(state, sourceId);
  setBatchASelectorSelection(state, {
    selectionMode,
    selectedKnowledgePointIds,
    selectedPatternGroupIds,
  });
  setBatchAQuestionCount(state, questionCount);
  setBatchAOrdering(state, "groupedByPattern");
  setBatchAIncludeAnswerKey(state, includeAnswerKey);
  setBatchAGenerationSeed(state, seed);
  setBatchAPrintLayout(state, { columns, rowsPerPage });
  if (questionMode) setBatchAQuestionMode(state, questionMode);
  if (depthMode) setBatchADepthMode(state, depthMode);
  if (contextMode) setBatchAContextMode(state, contextMode);
  return state;
}

function buildDocument(options) {
  const result = buildWorksheetDocumentFromState(createState(options));
  if (!result?.ok || !result?.worksheetDocument) {
    fail("PGC_R07_A04_WORKSHEET_BUILD_FAILED", {
      sourceId: options.sourceId,
      selectionMode: options.selectionMode,
      errors: result?.errors ?? [],
      warnings: result?.warnings ?? [],
    });
  }
  return clone(result.worksheetDocument);
}

function withoutExactAuthority(document) {
  const projected = clone(document);
  projected.layoutResolution = {
    ...(projected.layoutResolution ?? {}),
    layoutMode: "compatibility_renderer_branch",
    layoutExact: false,
  };
  return projected;
}

function discoverG5AU02DynamicDocument(includeAnswerKey) {
  const sourceId = "g5a_u02_5a02";
  const knowledgePoints = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === sourceId);
  for (const knowledgePoint of knowledgePoints) {
    const groups = getVisiblePatternGroupsForKnowledgePoint(knowledgePoint.knowledgePointId);
    const groupIds = groups.map((group) => group.patternGroupId).filter(Boolean);
    for (const questionMode of ["mixed", "numeric", "application"]) {
      try {
        const document = buildDocument({
          sourceId,
          includeAnswerKey,
          questionCount: 10,
          columns: 1,
          rowsPerPage: 5,
          selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
          selectedKnowledgePointIds: [knowledgePoint.knowledgePointId],
          selectedPatternGroupIds: groupIds,
          questionMode,
          depthMode: "mixed",
          contextMode: "mixed",
          seed: `pgc-r07-a04-dynamic-${includeAnswerKey}-${knowledgePoint.knowledgePointId}-${questionMode}`,
        });
        if (typeof document.dynamicHtml === "string" && document.dynamicHtml.length > 0) {
          return {
            document: withoutExactAuthority(document),
            witness: {
              sourceId,
              knowledgePointId: knowledgePoint.knowledgePointId,
              patternGroupIds: groupIds,
              questionMode,
            },
          };
        }
      } catch {
        // Continue deterministic discovery until an actual dynamic document is found.
      }
    }
  }
  fail("PGC_R07_A04_DYNAMIC_HTML_WITNESS_MISSING", {
    sourceId,
    visibleKnowledgePointCount: knowledgePoints.length,
  });
}

function buildBranchWitness(branchId, includeAnswerKey) {
  if (branchId === "SHARED_EXACT_LAYOUT") {
    const document = buildDocument({
      sourceId: "g5a_u08_5a08",
      includeAnswerKey,
      questionCount: 15,
      columns: 3,
      rowsPerPage: 5,
      questionMode: "mixed",
      depthMode: "mixed",
      contextMode: "mixed",
      seed: `pgc-r07-a04-exact-${includeAnswerKey}`,
    });
    if (document.layoutResolution?.layoutMode !== "exact_approved_matrix" || document.layoutResolution?.layoutExact !== true) {
      fail("PGC_R07_A04_EXACT_LAYOUT_WITNESS_INVALID", { layoutResolution: document.layoutResolution });
    }
    return { document, witness: { sourceId: "g5a_u08_5a08", projection: "unmodified" } };
  }

  if (branchId === "DYNAMIC_HTML") {
    return discoverG5AU02DynamicDocument(includeAnswerKey);
  }

  if (branchId === "STATIC_HTML_URL") {
    const actual = buildDocument({
      sourceId: "g5a_u02_5a02",
      includeAnswerKey,
      questionCount: 22,
      columns: 1,
      rowsPerPage: 5,
      questionMode: "mixed",
      depthMode: "mixed",
      contextMode: "mixed",
      seed: `pgc-r07-a04-static-${includeAnswerKey}`,
    });
    if (typeof actual.staticHtmlUrl !== "string" || actual.staticHtmlUrl.length === 0) {
      fail("PGC_R07_A04_STATIC_HTML_WITNESS_MISSING", {
        sourceId: "g5a_u02_5a02",
        hasDynamicHtml: typeof actual.dynamicHtml === "string",
        keys: Object.keys(actual),
      });
    }
    const document = withoutExactAuthority(actual);
    delete document.dynamicHtml;
    return {
      document,
      witness: { sourceId: "g5a_u02_5a02", projection: "remove_exact_and_dynamic_authority" },
    };
  }

  if (branchId === "SHARED_FALLBACK") {
    const actual = buildDocument({
      sourceId: "g3a_u02_3a02",
      includeAnswerKey,
      questionCount: 14,
      columns: 1,
      rowsPerPage: 7,
      questionMode: "mixed",
      depthMode: "mixed",
      contextMode: "mixed",
      seed: `pgc-r07-a04-fallback-${includeAnswerKey}`,
    });
    const document = withoutExactAuthority(actual);
    delete document.dynamicHtml;
    delete document.staticHtmlUrl;
    delete document.staticHtmlTransform;
    return {
      document,
      witness: { sourceId: "g3a_u02_3a02", projection: "remove_higher_priority_renderer_authority" },
    };
  }

  fail("PGC_R07_A04_UNKNOWN_BRANCH", { branchId });
}

function expectedBranchConditions(branchId, document) {
  const exact = document.layoutResolution?.layoutMode === "exact_approved_matrix"
    && document.layoutResolution?.layoutExact === true
    && Array.isArray(document.questionPages)
    && document.questionPages.length > 0;
  const dynamic = !exact && typeof document.dynamicHtml === "string" && document.dynamicHtml.length > 0;
  const staticUrl = !exact && !dynamic && typeof document.staticHtmlUrl === "string" && document.staticHtmlUrl.length > 0;
  const fallback = !exact && !dynamic && !staticUrl;
  const observed = exact
    ? "SHARED_EXACT_LAYOUT"
    : dynamic
      ? "DYNAMIC_HTML"
      : staticUrl
        ? "STATIC_HTML_URL"
        : "SHARED_FALLBACK";
  if (observed !== branchId) {
    fail("PGC_R07_A04_BRANCH_CLASSIFICATION_MISMATCH", { expected: branchId, observed });
  }
  return { exact, dynamic, staticUrl, fallback, observed };
}

async function renderThroughActualPreviewBranch(page, branchId, document) {
  const branchConditions = expectedBranchConditions(branchId, document);
  const result = await page.evaluate(async ({ worksheetDocument }) => {
    const { renderPreviewFrame } = await import("./assets/browser/pipeline/render-preview-frame.js");
    document.querySelector("#pgc-r07-a04-frame")?.remove();
    const iframe = document.createElement("iframe");
    iframe.id = "pgc-r07-a04-frame";
    iframe.style.width = "1200px";
    iframe.style.height = "900px";
    document.body.append(iframe);
    const renderResult = renderPreviewFrame(iframe, worksheetDocument, {
      title: "PGC-R07 A04 Renderer Quality Matrix",
      stylesheetHref: "./assets/styles/print-styles.css",
      debugDataAttributes: true,
    });
    return {
      renderResult,
      frameDataset: { ...iframe.dataset },
    };
  }, { worksheetDocument: document });

  const iframe = page.locator("#pgc-r07-a04-frame");
  if (branchId === "STATIC_HTML_URL") {
    await page.waitForFunction(
      () => document.querySelector("#pgc-r07-a04-frame")?.dataset.staticCandidateStatus === "ready",
      null,
      { timeout: 120000 },
    );
  }
  const handle = await iframe.elementHandle();
  const frame = await handle?.contentFrame();
  if (!frame) fail("PGC_R07_A04_PREVIEW_FRAME_MISSING", { branchId });
  await frame.locator("body").waitFor({ state: "attached", timeout: 120000 });
  await frame.waitForFunction((selectors) => selectors.some((selector) => document.querySelector(selector)), SELECTORS.questionCard, {
    timeout: 120000,
  });
  return { frame, renderResult: result.renderResult, frameDataset: result.frameDataset, branchConditions };
}

async function inspectFrame(frame, includeAnswerKey) {
  await frame.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });

  return frame.evaluate(({ selectors, includeAnswers, cjkSample }) => {
    function uniqueElements(keys) {
      return [...new Set(keys.flatMap((selector) => [...document.querySelectorAll(selector)]))]
        .filter((node) => getComputedStyle(node).display !== "none");
    }
    function text(node) {
      return String(node?.textContent ?? "").replace(/\s+/g, " ").trim();
    }
    function overflow(node, tolerance = 1) {
      return node.scrollHeight > node.clientHeight + tolerance || node.scrollWidth > node.clientWidth + tolerance;
    }
    function clipping(nodes, pages) {
      const findings = [];
      for (const node of nodes) {
        const page = pages.find((candidate) => candidate.contains(node));
        if (!page) continue;
        const a = node.getBoundingClientRect();
        const b = page.getBoundingClientRect();
        if (a.left < b.left - 1.5 || a.right > b.right + 1.5 || a.top < b.top - 1.5 || a.bottom > b.bottom + 1.5) {
          findings.push({
            node: text(node).slice(0, 100),
            nodeRect: { left: a.left, right: a.right, top: a.top, bottom: a.bottom },
            pageRect: { left: b.left, right: b.right, top: b.top, bottom: b.bottom },
          });
        }
      }
      return findings;
    }
    function overlaps(cards, pages) {
      const findings = [];
      for (const page of pages) {
        const rows = cards.filter((card) => page.contains(card)).map((card) => ({
          card,
          rect: card.getBoundingClientRect(),
          label: text(card).slice(0, 80),
        }));
        for (let left = 0; left < rows.length; left += 1) {
          for (let right = left + 1; right < rows.length; right += 1) {
            const a = rows[left].rect;
            const b = rows[right].rect;
            const width = Math.min(a.right, b.right) - Math.max(a.left, b.left);
            const height = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
            if (width > 0.5 && height > 0.5) findings.push({
              left: rows[left].label,
              right: rows[right].label,
              overlapWidth: width,
              overlapHeight: height,
            });
          }
        }
      }
      return findings;
    }

    const questionPages = uniqueElements(selectors.questionPage);
    const answerPages = uniqueElements(selectors.answerPage);
    const questionCards = uniqueElements(selectors.questionCard);
    const answerCards = uniqueElements(selectors.answerCard);
    const prompts = uniqueElements(selectors.prompt);
    const responses = uniqueElements(selectors.response);
    const answerTexts = uniqueElements(selectors.answerText);
    const questionNumbers = uniqueElements(selectors.questionNumber).map((node) => text(node));
    const answerNumbers = uniqueElements(selectors.answerNumber).map((node) => text(node));
    const allPages = [...questionPages, ...answerPages];
    const allCards = [...questionCards, ...answerCards];
    const allTextNodes = [...prompts, ...responses, ...answerTexts];
    const blankPages = allPages.filter((page) => text(page).length < 2 && !allCards.some((card) => page.contains(card)));
    const missingPrompts = prompts.filter((node) => !text(node));
    const missingAnswers = includeAnswers ? answerCards.filter((card) => {
      const answerNode = selectors.answerText.map((selector) => card.querySelector(selector.split(" ").at(-1))).find(Boolean);
      return !text(answerNode ?? card);
    }) : [];
    const cardOverflow = allCards.filter((node) => overflow(node));
    const textOverflow = allTextNodes.filter((node) => overflow(node));
    const pageOverflow = allPages.filter((node) => overflow(node));
    const clippingFindings = clipping(allCards, allPages);
    const overlapFindings = overlaps(allCards, allPages);
    const bodyText = text(document.body);
    const fontStatus = document.fonts?.status ?? "unsupported";
    const fontSampleReady = document.fonts?.check ? document.fonts.check("16px sans-serif", cjkSample) : true;
    const computedFontFamilies = [...new Set(allTextNodes.map((node) => getComputedStyle(node).fontFamily).filter(Boolean))];
    const replacementCharacterCount = (bodyText.match(/�/g) ?? []).length;
    return {
      questionPageCount: questionPages.length,
      answerPageCount: answerPages.length,
      questionCardCount: questionCards.length,
      answerCardCount: answerCards.length,
      questionNumbers,
      answerNumbers,
      cardOverflowCount: cardOverflow.length,
      textOverflowCount: textOverflow.length,
      pageOverflowCount: pageOverflow.length,
      clippingFindingCount: clippingFindings.length,
      interCardOverlapCount: overlapFindings.length,
      missingPromptCount: missingPrompts.length,
      missingAnswerCount: missingAnswers.length,
      blankPageCount: blankPages.length,
      fontStatus,
      fontSampleReady,
      computedFontFamilies,
      replacementCharacterCount,
      bodyTextLength: bodyText.length,
      firstCardOverflow: cardOverflow[0]?.outerHTML.slice(0, 800) ?? null,
      firstTextOverflow: textOverflow[0]?.outerHTML.slice(0, 800) ?? null,
      firstPageOverflow: pageOverflow[0]?.outerHTML.slice(0, 800) ?? null,
      firstClipping: clippingFindings[0] ?? null,
      firstOverlap: overlapFindings[0] ?? null,
    };
  }, { selectors: SELECTORS, includeAnswers: includeAnswerKey, cjkSample: CJK_SAMPLE });
}

function injectBaseHref(html) {
  const base = `<base href="${SITE_ORIGIN}/">`;
  return html.includes("<head>") ? html.replace("<head>", `<head>${base}`) : `${base}${html}`;
}

function pdfPageCount(pdf) {
  return (pdf.toString("latin1").match(/\/Type\s*\/Page\b/g) ?? []).length;
}

async function createPdf(browser, branchId, includeAnswerKey, html) {
  const stem = `${branchId.toLowerCase()}-answer-${includeAnswerKey ? "on" : "off"}`;
  const htmlPath = path.join(OUTPUT_DIR, `${stem}.html`);
  const pdfPath = path.join(OUTPUT_DIR, `${stem}.pdf`);
  const source = injectBaseHref(html);
  await writeFile(htmlPath, source, "utf8");
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  try {
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle", timeout: 120000 });
    await page.emulateMedia({ media: "print" });
    await page.evaluate(async () => {
      if (document.fonts?.ready) await document.fonts.ready;
    });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });
    if (pdf.length < 5000 || pdf.subarray(0, 5).toString("ascii") !== "%PDF-") {
      fail("PGC_R07_A04_PDF_INVALID", { branchId, includeAnswerKey, pdfBytes: pdf.length });
    }
    await writeFile(pdfPath, pdf);
    return {
      htmlPath: path.relative(ROOT, htmlPath),
      htmlBytes: Buffer.byteLength(source),
      htmlSha256: sha256(source),
      pdfPath: path.relative(ROOT, pdfPath),
      pdfBytes: pdf.length,
      pdfSha256: sha256(pdf),
      pdfPageCount: pdfPageCount(pdf),
    };
  } finally {
    await page.close();
  }
}

async function assertPrintInvocation(page, frame) {
  await frame.evaluate(() => {
    globalThis.__pgcR07A04PrintInvoked = false;
    globalThis.print = () => {
      globalThis.__pgcR07A04PrintInvoked = true;
    };
  });
  await page.evaluate(async () => {
    const { printPreviewFrame } = await import("./assets/browser/pipeline/render-preview-frame.js");
    printPreviewFrame(document.querySelector("#pgc-r07-a04-frame"));
  });
  await frame.waitForFunction(() => globalThis.__pgcR07A04PrintInvoked === true, null, { timeout: 30000 });
}

async function runRow(browser, branchId, includeAnswerKey) {
  const { document, witness } = buildBranchWitness(branchId, includeAnswerKey);
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(String(error?.message ?? error)));
  try {
    await page.goto(`${SITE_ORIGIN}/index.html?pgcR07A04=${branchId}-${includeAnswerKey}-${Date.now()}`, {
      waitUntil: "networkidle",
      timeout: 120000,
    });
    const rendered = await renderThroughActualPreviewBranch(page, branchId, document);
    const dom = await inspectFrame(rendered.frame, includeAnswerKey);
    await assertPrintInvocation(page, rendered.frame);
    const html = await rendered.frame.content();
    const pdf = await createPdf(browser, branchId, includeAnswerKey, html);
    const expectedDomPages = dom.questionPageCount + dom.answerPageCount;
    const fontFailureCount = dom.fontStatus !== "loaded"
      || !dom.fontSampleReady
      || dom.computedFontFamilies.length === 0
      || dom.replacementCharacterCount > 0
      ? 1
      : 0;
    const questionAnswerBijectionFailureCount = includeAnswerKey && (
      dom.questionCardCount !== dom.answerCardCount
      || JSON.stringify(dom.questionNumbers.map(normalizeNumber)) !== JSON.stringify(dom.answerNumbers.map(normalizeNumber))
    ) ? 1 : 0;
    const pdfPageCountMismatchCount = pdf.pdfPageCount !== expectedDomPages ? 1 : 0;
    const findingCount = dom.cardOverflowCount
      + dom.textOverflowCount
      + dom.pageOverflowCount
      + dom.clippingFindingCount
      + dom.interCardOverlapCount
      + dom.missingPromptCount
      + dom.missingAnswerCount
      + dom.blankPageCount
      + fontFailureCount
      + questionAnswerBijectionFailureCount
      + pdfPageCountMismatchCount
      + consoleErrors.length
      + pageErrors.length;
    if (findingCount > 0) {
      const screenshotPath = path.join(
        OUTPUT_DIR,
        `${branchId.toLowerCase()}-answer-${includeAnswerKey ? "on" : "off"}-failure.png`,
      );
      await page.screenshot({ path: screenshotPath, fullPage: true });
    }
    return {
      rowId: `${branchId}_ANSWER_${includeAnswerKey ? "ON" : "OFF"}`,
      branchId,
      includeAnswerKey,
      witness,
      branchConditions: rendered.branchConditions,
      renderResult: rendered.renderResult,
      frameDataset: rendered.frameDataset,
      questionPageCount: dom.questionPageCount,
      answerPageCount: dom.answerPageCount,
      questionCardCount: dom.questionCardCount,
      answerCardCount: dom.answerCardCount,
      questionIdentitySha256: sha256(JSON.stringify({ numbers: dom.questionNumbers, html })),
      answerIdentitySha256: includeAnswerKey ? sha256(JSON.stringify(dom.answerNumbers)) : null,
      cardOverflowCount: dom.cardOverflowCount,
      textOverflowCount: dom.textOverflowCount,
      pageOverflowCount: dom.pageOverflowCount,
      clippingFindingCount: dom.clippingFindingCount,
      interCardOverlapCount: dom.interCardOverlapCount,
      missingPromptCount: dom.missingPromptCount,
      missingAnswerCount: dom.missingAnswerCount,
      blankPageCount: dom.blankPageCount,
      fontFailureCount,
      fontStatus: dom.fontStatus,
      fontSampleReady: dom.fontSampleReady,
      computedFontFamilies: dom.computedFontFamilies,
      replacementCharacterCount: dom.replacementCharacterCount,
      questionAnswerBijectionFailureCount,
      pdfPageCountMismatchCount,
      consoleErrorCount: consoleErrors.length,
      pageErrorCount: pageErrors.length,
      firstFindings: {
        cardOverflow: dom.firstCardOverflow,
        textOverflow: dom.firstTextOverflow,
        pageOverflow: dom.firstPageOverflow,
        clipping: dom.firstClipping,
        overlap: dom.firstOverlap,
      },
      findingCount,
      printInvoked: true,
      ...pdf,
      status: findingCount === 0 ? "PASS" : "DEFECTS_DETECTED",
    };
  } finally {
    await page.close();
  }
}

function sum(rows, field) {
  return rows.reduce((total, row) => total + Number(row[field] ?? 0), 0);
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
  for (const branchId of BRANCH_IDS) {
    for (const includeAnswerKey of ANSWER_MODES) {
      rows.push(await runRow(browser, branchId, includeAnswerKey));
    }
  }
  const report = {
    schemaName: "PGCR07A04OverflowClippingFontPaginationReportV1",
    schemaVersion: 1,
    programId: "PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    taskId: "PGC-R07-A04_OverflowClippingFontPaginationFullFix",
    status: rows.every((row) => row.status === "PASS") ? "PASS" : "DEFECTS_DETECTED",
    expectedRowCount: 8,
    actualRowCount: rows.length,
    branchCount: new Set(rows.map((row) => row.branchId)).size,
    answerKeyModeCount: new Set(rows.map((row) => row.includeAnswerKey)).size,
    pdfPassCount: rows.filter((row) => row.pdfBytes >= 5000).length,
    printInvocationPassCount: rows.filter((row) => row.printInvoked).length,
    cardOverflowCount: sum(rows, "cardOverflowCount"),
    textOverflowCount: sum(rows, "textOverflowCount"),
    pageOverflowCount: sum(rows, "pageOverflowCount"),
    clippingFindingCount: sum(rows, "clippingFindingCount"),
    interCardOverlapCount: sum(rows, "interCardOverlapCount"),
    missingPromptCount: sum(rows, "missingPromptCount"),
    missingAnswerCount: sum(rows, "missingAnswerCount"),
    blankPageCount: sum(rows, "blankPageCount"),
    fontFailureCount: sum(rows, "fontFailureCount"),
    questionAnswerBijectionFailureCount: sum(rows, "questionAnswerBijectionFailureCount"),
    pdfPageCountMismatchCount: sum(rows, "pdfPageCountMismatchCount"),
    consoleErrorCount: sum(rows, "consoleErrorCount"),
    pageErrorCount: sum(rows, "pageErrorCount"),
    rows,
  };
  await writeFile(path.join(OUTPUT_DIR, "report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({
    status: report.status,
    actualRowCount: report.actualRowCount,
    branchCount: report.branchCount,
    pdfPassCount: report.pdfPassCount,
    printInvocationPassCount: report.printInvocationPassCount,
    findingCounts: {
      cardOverflowCount: report.cardOverflowCount,
      textOverflowCount: report.textOverflowCount,
      pageOverflowCount: report.pageOverflowCount,
      clippingFindingCount: report.clippingFindingCount,
      interCardOverlapCount: report.interCardOverlapCount,
      missingPromptCount: report.missingPromptCount,
      missingAnswerCount: report.missingAnswerCount,
      blankPageCount: report.blankPageCount,
      fontFailureCount: report.fontFailureCount,
      questionAnswerBijectionFailureCount: report.questionAnswerBijectionFailureCount,
      pdfPageCountMismatchCount: report.pdfPageCountMismatchCount,
      consoleErrorCount: report.consoleErrorCount,
      pageErrorCount: report.pageErrorCount,
    },
  }, null, 2));
  if (report.status !== "PASS") fail("PGC_R07_A04_MATRIX_DEFECTS_DETECTED", report);
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}
