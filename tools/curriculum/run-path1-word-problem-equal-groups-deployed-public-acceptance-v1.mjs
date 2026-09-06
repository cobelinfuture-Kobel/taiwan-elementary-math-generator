import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const SITE_URL = process.env.PATH1_EQUAL_GROUPS_SITE_URL
  ?? "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/path1/";
const EXPECTED_DEPLOYMENT_SHA = process.env.PATH1_EQUAL_GROUPS_DEPLOYMENT_SHA ?? null;
const OUT_DIR = "artifacts/path1-word-problem-equal-groups-deployed-public-acceptance-v1";

function assert(condition, message, details = null) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}

async function waitForPath1Ready(page) {
  await page.waitForSelector("#path1-block-select");
  await page.waitForFunction(() => {
    const block = document.querySelector("#path1-block-select");
    const mode = document.querySelector("#path1-practice-mode");
    return block?.options?.length > 0 && mode?.options?.length >= 2;
  });
}

async function openPath1(page, query = "") {
  const url = new URL(SITE_URL);
  if (query) url.search = query.startsWith("?") ? query.slice(1) : query;
  await page.goto(url.toString(), { waitUntil: "networkidle" });
  await waitForPath1Ready(page);
}

async function readState(page) {
  return page.evaluate(() => {
    const block = document.querySelector("#path1-block-select");
    const mode = document.querySelector("#path1-practice-mode");
    const transferOption = mode?.querySelector('option[value="equalGroupsTransfer"]');
    return {
      blockId: block?.value ?? null,
      practiceMode: mode?.value ?? null,
      transferDisabled: transferOption?.disabled ?? null,
      statusText: document.querySelector("#path1-status-panel")?.textContent?.trim() ?? "",
      previewMeta: document.querySelector("#path1-preview-meta")?.textContent?.trim() ?? "",
      printDisabled: document.querySelector("#path1-print-button")?.disabled ?? null,
      url: location.href,
    };
  });
}

async function setQuestionCount(page, count) {
  await page.locator("#path1-question-count").fill(String(count));
}

async function setSeed(page, seed) {
  await page.locator("#path1-generation-seed").fill(seed);
}

async function generate(page) {
  await page.locator("#path1-generate-button").click();
  await page.waitForFunction(() => {
    const iframe = document.querySelector("#path1-preview-frame");
    return iframe?.contentDocument?.body?.textContent?.trim()?.length > 0;
  });
  await page.waitForFunction(() => document.querySelector("#path1-print-button")?.disabled === false);
}

async function inspectWorksheet(page) {
  return page.locator("#path1-preview-frame").evaluate((iframe) => {
    const doc = iframe.contentDocument;
    if (!doc) return { questionCount: 0, answerCount: 0, questionText: "", answerText: "", bodyText: "" };

    const questionSelectors = [
      ".worksheet-cell--question",
      ".g5a-u08-cell--question",
      ".g4b-u04-cell--question",
    ];
    const answerSelectors = [
      ".worksheet-cell--answer-key",
      ".g5a-u08-cell--answer",
      ".g4b-u04-cell--answer",
    ];

    const countUnique = (selectors) => {
      const nodes = new Set();
      for (const selector of selectors) {
        for (const node of doc.querySelectorAll(selector)) nodes.add(node);
      }
      return nodes.size;
    };

    const questionSection = doc.querySelector(".worksheet-section--questions");
    const answerSection = doc.querySelector(".worksheet-section--answer-key");
    return {
      questionCount: countUnique(questionSelectors),
      answerCount: countUnique(answerSelectors),
      questionText: questionSection?.textContent?.trim() ?? "",
      answerText: answerSection?.textContent?.trim() ?? "",
      bodyText: doc.body?.textContent?.trim() ?? "",
      questionPages: doc.querySelectorAll('[data-page-type="questions"], [data-page-type="question"]').length,
      answerPages: doc.querySelectorAll('[data-page-type="answerKey"], [data-page-type="answer"]').length,
    };
  });
}

function extractMultiplicationEquations(text) {
  return [...String(text).matchAll(/(?:^|\s)(\d{2,3})\s*[×x*]\s*(\d)\s*=\s*(\d+)(?=\s|$)/g)]
    .map((match) => ({
      multiplicand: Number(match[1]),
      multiplier: Number(match[2]),
      product: Number(match[3]),
      raw: match[0].trim(),
    }));
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const pageErrors = [];
const consoleErrors = [];
page.on("pageerror", (error) => pageErrors.push(String(error)));
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});

const evidence = {
  schemaVersion: "path1-word-problem-equal-groups-deployed-public-acceptance-v1",
  task: "PATH1_WORD_PROBLEM_EQUAL_GROUPS_DEPLOYED_PUBLIC_ACCEPTANCE_V1",
  siteUrl: SITE_URL,
  expectedDeploymentSha: EXPECTED_DEPLOYMENT_SHA,
  checks: {},
};

try {
  // A. Default regression: /path1/ loads at P1-01 + arithmetic and can still generate arithmetic.
  await openPath1(page);
  let state = await readState(page);
  assert(state.blockId === "P1-01", "A_DEFAULT_BLOCK_NOT_P101", state);
  assert(state.practiceMode === "arithmetic", "A_DEFAULT_MODE_NOT_ARITHMETIC", state);
  await setQuestionCount(page, 12);
  await setSeed(page, "path1-deployed-a-default-arithmetic");
  await generate(page);
  state = await readState(page);
  let worksheet = await inspectWorksheet(page);
  assert(state.printDisabled === false, "A_ARITHMETIC_PRINT_DISABLED", state);
  assert(state.previewMeta.includes("12 題"), "A_ARITHMETIC_PREVIEW_COUNT_MISSING", state);
  assert(worksheet.questionCount === 12, "A_ARITHMETIC_QUESTION_COUNT_MISMATCH", worksheet);
  assert(worksheet.answerCount === 12, "A_ARITHMETIC_ANSWER_COUNT_MISMATCH", worksheet);
  evidence.checks.A_DEFAULT_REGRESSION = { status: "PASS", state, worksheet: { ...worksheet, questionText: undefined, answerText: undefined, bodyText: undefined } };

  // B. P1-01 transfer: selectable, model-first instruction, contextual answer, preview, print.
  await openPath1(page, "?path1BlockId=P1-01&practiceMode=equalGroupsTransfer");
  state = await readState(page);
  assert(state.blockId === "P1-01" && state.practiceMode === "equalGroupsTransfer", "B_P101_TRANSFER_NOT_RESTORED", state);
  assert(state.transferDisabled === false, "B_P101_TRANSFER_DISABLED", state);
  await setQuestionCount(page, 12);
  await setSeed(page, "path1-deployed-b-p101-transfer");
  await generate(page);
  state = await readState(page);
  worksheet = await inspectWorksheet(page);
  assert(worksheet.questionText.includes("請先列出乘法算式，再寫答案。"), "B_MODELING_INSTRUCTION_MISSING", worksheet.questionText);
  assert(worksheet.answerText.includes("答："), "B_CONTEXTUAL_ANSWER_MISSING", worksheet.answerText);
  assert(state.previewMeta.includes("文字建模練習"), "B_TRANSFER_PREVIEW_META_MISSING", state);
  assert(state.previewMeta.includes("12 題") && state.previewMeta.includes("含答案頁"), "B_TRANSFER_PREVIEW_COUNT_OR_ANSWER_META_MISSING", state);
  assert(state.printDisabled === false, "B_TRANSFER_PRINT_DISABLED", state);
  assert(worksheet.questionCount === 12 && worksheet.answerCount === 12, "B_TRANSFER_QUESTION_ANSWER_COUNT_MISMATCH", worksheet);
  evidence.checks.B_P101_TRANSFER = { status: "PASS", state, worksheet: { questionCount: worksheet.questionCount, answerCount: worksheet.answerCount, questionPages: worksheet.questionPages, answerPages: worksheet.answerPages } };

  // C/E. P1-02 deep-link + refresh restore, transfer generation, full two-digit domain plus bounded three-digit subset.
  await openPath1(page, "?path1BlockId=P1-02&practiceMode=equalGroupsTransfer");
  state = await readState(page);
  assert(state.blockId === "P1-02" && state.practiceMode === "equalGroupsTransfer", "C_P102_TRANSFER_DEEPLINK_NOT_RESTORED", state);
  await page.reload({ waitUntil: "networkidle" });
  await waitForPath1Ready(page);
  state = await readState(page);
  assert(state.blockId === "P1-02" && state.practiceMode === "equalGroupsTransfer", "E_P102_TRANSFER_REFRESH_NOT_RESTORED", state);
  await setQuestionCount(page, 40);
  await setSeed(page, "path1-deployed-c-p102-transfer-envelope");
  await generate(page);
  state = await readState(page);
  worksheet = await inspectWorksheet(page);
  const equations = extractMultiplicationEquations(worksheet.answerText);
  assert(worksheet.questionCount === 40 && worksheet.answerCount === 40, "C_P102_QUESTION_ANSWER_COUNT_MISMATCH", worksheet);
  assert(equations.length >= 40, "C_P102_MULTIPLICATION_EQUATION_WITNESS_MISSING", { found: equations.length, answerText: worksheet.answerText });
  const twoDigit = equations.filter((row) => row.multiplicand >= 10 && row.multiplicand <= 99);
  const threeDigit = equations.filter((row) => row.multiplicand >= 100 && row.multiplicand <= 999);
  assert(twoDigit.length > 0, "C_P102_TWO_DIGIT_DOMAIN_WITNESS_MISSING", equations);
  assert(threeDigit.length > 0, "C_P102_THREE_DIGIT_BOUNDED_WITNESS_MISSING", equations);
  assert(equations.every((row) => row.product === row.multiplicand * row.multiplier), "C_P102_RELATION_EQUATION_INVALID", equations);
  assert(threeDigit.every((row) => row.product <= 999), "C_P102_THREE_DIGIT_PRODUCT_ENVELOPE_LEAKAGE", threeDigit);
  assert(equations.every((row) => row.multiplier >= 1 && row.multiplier <= 9), "C_P102_MULTIPLIER_ENVELOPE_LEAKAGE", equations);
  assert(state.printDisabled === false, "C_P102_PRINT_DISABLED", state);
  evidence.checks.C_P102_TRANSFER_ENVELOPE = {
    status: "PASS",
    state,
    equationCount: equations.length,
    twoDigitWitnessCount: twoDigit.length,
    threeDigitWitnessCount: threeDigit.length,
    maxThreeDigitProduct: Math.max(...threeDigit.map((row) => row.product)),
    questionCount: worksheet.questionCount,
    answerCount: worksheet.answerCount,
  };
  evidence.checks.E_P102_QUERY_RESTORE = { status: "PASS", deepLink: true, refresh: true };

  // D. Unsupported blocks must fail safe to arithmetic and keep transfer disabled.
  for (const blockId of ["P1-03", "P1-04"]) {
    await openPath1(page, `?path1BlockId=${blockId}&practiceMode=equalGroupsTransfer`);
    state = await readState(page);
    assert(state.blockId === blockId, `D_${blockId}_BLOCK_NOT_RESTORED`, state);
    assert(state.practiceMode === "arithmetic", `D_${blockId}_TRANSFER_NOT_NORMALIZED`, state);
    assert(state.transferDisabled === true, `D_${blockId}_TRANSFER_OPTION_NOT_DISABLED`, state);
    assert(new URL(state.url).searchParams.get("practiceMode") === "arithmetic", `D_${blockId}_URL_NOT_NORMALIZED`, state);
    evidence.checks[`D_${blockId}_UNSUPPORTED`] = { status: "PASS", state };
  }

  // E. Invalid practiceMode must fail safe to arithmetic.
  await openPath1(page, "?path1BlockId=P1-02&practiceMode=notARealMode");
  state = await readState(page);
  assert(state.blockId === "P1-02", "E_INVALID_MODE_BLOCK_CHANGED", state);
  assert(state.practiceMode === "arithmetic", "E_INVALID_MODE_NOT_FAIL_SAFE", state);
  assert(new URL(state.url).searchParams.get("practiceMode") === "arithmetic", "E_INVALID_MODE_URL_NOT_NORMALIZED", state);
  evidence.checks.E_INVALID_MODE_FAIL_SAFE = { status: "PASS", state };

  // F. No runtime page errors; console errors are recorded as diagnostic and also fail acceptance.
  assert(pageErrors.length === 0, "F_BROWSER_PAGE_ERRORS", pageErrors);
  assert(consoleErrors.length === 0, "F_BROWSER_CONSOLE_ERRORS", consoleErrors);
  evidence.checks.F_RUNTIME = { status: "PASS", pageErrors, consoleErrors };

  evidence.status = "PASS";
  evidence.completedAt = new Date().toISOString();
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(`${OUT_DIR}/result.json`, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(evidence, null, 2));
} catch (error) {
  evidence.status = "FAIL";
  evidence.completedAt = new Date().toISOString();
  evidence.failure = {
    message: String(error?.message ?? error),
    details: error?.details ?? null,
    pageErrors,
    consoleErrors,
  };
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(`${OUT_DIR}/result.json`, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
  await page.screenshot({ path: `${OUT_DIR}/failure.png`, fullPage: true }).catch(() => {});
  console.error(JSON.stringify(evidence, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
