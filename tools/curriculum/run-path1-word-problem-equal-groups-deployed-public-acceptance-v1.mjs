import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const SITE_URL = process.env.PATH1_EQUAL_GROUPS_SITE_URL
  ?? "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/path1/";
const EXPECTED_DEPLOYMENT_SHA = process.env.PATH1_EQUAL_GROUPS_DEPLOYMENT_SHA ?? null;
const OUT_DIR = "artifacts/path1-word-problem-equal-groups-deployed-public-acceptance-v1";

function check(condition, message, details = null) {
  if (condition) return;
  const error = new Error(message);
  error.details = details;
  throw error;
}

async function ready(page) {
  await page.waitForSelector("#path1-block-select");
  await page.waitForFunction(() => {
    const block = document.querySelector("#path1-block-select");
    const mode = document.querySelector("#path1-practice-mode");
    return block?.options?.length > 0 && mode?.options?.length >= 2;
  });
}

async function open(page, query = "") {
  const url = new URL(SITE_URL);
  if (query) url.search = query.startsWith("?") ? query.slice(1) : query;
  await page.goto(url.toString(), { waitUntil: "networkidle" });
  await ready(page);
}

async function state(page) {
  return page.evaluate(() => {
    const block = document.querySelector("#path1-block-select");
    const mode = document.querySelector("#path1-practice-mode");
    return {
      blockId: block?.value ?? null,
      practiceMode: mode?.value ?? null,
      transferDisabled: mode?.querySelector('option[value="equalGroupsTransfer"]')?.disabled ?? null,
      statusText: document.querySelector("#path1-status-panel")?.textContent?.trim() ?? "",
      previewMeta: document.querySelector("#path1-preview-meta")?.textContent?.trim() ?? "",
      printDisabled: document.querySelector("#path1-print-button")?.disabled ?? null,
      url: location.href,
    };
  });
}

async function generate(page, count, seed) {
  await page.locator("#path1-question-count").fill(String(count));
  await page.locator("#path1-generation-seed").fill(seed);
  await page.locator("#path1-generate-button").click();
  await page.waitForFunction(() => {
    const frame = document.querySelector("#path1-preview-frame");
    return frame?.contentDocument?.body?.textContent?.trim()?.length > 0;
  });
  await page.waitForFunction(() => document.querySelector("#path1-print-button")?.disabled === false);
}

async function worksheet(page) {
  return page.locator("#path1-preview-frame").evaluate((iframe) => {
    const doc = iframe.contentDocument;
    const countUnique = (selectors) => {
      const nodes = new Set();
      for (const selector of selectors) {
        for (const node of doc?.querySelectorAll(selector) ?? []) nodes.add(node);
      }
      return nodes.size;
    };
    const questions = doc?.querySelector(".worksheet-section--questions");
    const answers = doc?.querySelector(".worksheet-section--answer-key");
    return {
      questionCount: countUnique([".worksheet-cell--question", ".g5a-u08-cell--question", ".g4b-u04-cell--question"]),
      answerCount: countUnique([".worksheet-cell--answer-key", ".g5a-u08-cell--answer", ".g4b-u04-cell--answer"]),
      questionText: questions?.textContent?.trim() ?? "",
      answerText: answers?.textContent?.trim() ?? "",
      questionPages: doc?.querySelectorAll('[data-page-type="questions"], [data-page-type="question"]').length ?? 0,
      answerPages: doc?.querySelectorAll('[data-page-type="answerKey"], [data-page-type="answer"]').length ?? 0,
    };
  });
}

function equations(text) {
  // Answer-key cards are concatenated without whitespace, so punctuation rather than whitespace
  // can precede an equation. Digit boundaries avoid accidentally matching a suffix of a 4-digit value.
  return [...String(text).matchAll(/(?<!\d)(\d{2,3})\s*[×x*]\s*(\d)\s*=\s*(\d+)(?!\d)/g)].map((match) => ({
    multiplicand: Number(match[1]),
    multiplier: Number(match[2]),
    product: Number(match[3]),
    raw: match[0],
  }));
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const pageErrors = [];
const consoleErrors = [];
page.on("pageerror", (error) => pageErrors.push(String(error)));
page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });

const evidence = {
  schemaVersion: "path1-word-problem-equal-groups-deployed-public-acceptance-v1",
  task: "PATH1_WORD_PROBLEM_EQUAL_GROUPS_DEPLOYED_PUBLIC_ACCEPTANCE_V1",
  siteUrl: SITE_URL,
  expectedDeploymentSha: EXPECTED_DEPLOYMENT_SHA,
  checks: {},
};

try {
  // A — default P1-01 arithmetic remains healthy.
  await open(page);
  let s = await state(page);
  check(s.blockId === "P1-01", "A_DEFAULT_BLOCK_NOT_P101", s);
  check(s.practiceMode === "arithmetic", "A_DEFAULT_MODE_NOT_ARITHMETIC", s);
  await generate(page, 12, "path1-deployed-a-default-arithmetic");
  s = await state(page);
  let w = await worksheet(page);
  check(!s.printDisabled, "A_ARITHMETIC_PRINT_DISABLED", s);
  check(s.previewMeta.includes("12 題"), "A_ARITHMETIC_PREVIEW_COUNT_MISSING", s);
  check(w.questionCount === 12 && w.answerCount === 12, "A_ARITHMETIC_COUNT_MISMATCH", w);
  evidence.checks.A_DEFAULT_REGRESSION = { status: "PASS", state: s, counts: [w.questionCount, w.answerCount], pages: [w.questionPages, w.answerPages] };

  // B — P1-01 equal-groups transfer is public and printable.
  await open(page, "?path1BlockId=P1-01&practiceMode=equalGroupsTransfer");
  s = await state(page);
  check(s.blockId === "P1-01" && s.practiceMode === "equalGroupsTransfer", "B_P101_TRANSFER_NOT_RESTORED", s);
  check(!s.transferDisabled, "B_P101_TRANSFER_DISABLED", s);
  await generate(page, 12, "path1-deployed-b-p101-transfer");
  s = await state(page);
  w = await worksheet(page);
  check(w.questionText.includes("請先列出乘法算式，再寫答案。"), "B_MODELING_INSTRUCTION_MISSING", w.questionText);
  check(w.answerText.includes("答："), "B_CONTEXTUAL_ANSWER_MISSING", w.answerText);
  check(s.previewMeta.includes("文字建模練習") && s.previewMeta.includes("12 題") && s.previewMeta.includes("含答案頁"), "B_PREVIEW_META_INVALID", s);
  check(!s.printDisabled, "B_TRANSFER_PRINT_DISABLED", s);
  check(w.questionCount === 12 && w.answerCount === 12, "B_TRANSFER_COUNT_MISMATCH", w);
  evidence.checks.B_P101_TRANSFER = { status: "PASS", state: s, counts: [w.questionCount, w.answerCount], pages: [w.questionPages, w.answerPages] };

  // C/E — P1-02 deep-link/refresh plus numeric-envelope witnesses.
  await open(page, "?path1BlockId=P1-02&practiceMode=equalGroupsTransfer");
  s = await state(page);
  check(s.blockId === "P1-02" && s.practiceMode === "equalGroupsTransfer", "C_P102_DEEPLINK_NOT_RESTORED", s);
  await page.reload({ waitUntil: "networkidle" });
  await ready(page);
  s = await state(page);
  check(s.blockId === "P1-02" && s.practiceMode === "equalGroupsTransfer", "E_P102_REFRESH_NOT_RESTORED", s);
  await generate(page, 40, "path1-deployed-c-p102-transfer-envelope");
  s = await state(page);
  w = await worksheet(page);
  const eq = equations(w.answerText);
  check(w.questionCount === 40 && w.answerCount === 40, "C_P102_COUNT_MISMATCH", w);
  check(eq.length >= 40, "C_P102_EQUATION_WITNESS_MISSING", { found: eq.length, answerText: w.answerText });
  const two = eq.filter((row) => row.multiplicand >= 10 && row.multiplicand <= 99);
  const three = eq.filter((row) => row.multiplicand >= 100 && row.multiplicand <= 999);
  check(two.length > 0, "C_P102_TWO_DIGIT_WITNESS_MISSING", eq);
  check(three.length > 0, "C_P102_THREE_DIGIT_WITNESS_MISSING", eq);
  check(eq.every((row) => row.product === row.multiplicand * row.multiplier), "C_P102_RELATION_EQUATION_INVALID", eq);
  check(eq.every((row) => row.multiplier >= 1 && row.multiplier <= 9), "C_P102_MULTIPLIER_ENVELOPE_LEAKAGE", eq);
  check(three.every((row) => row.product <= 999), "C_P102_THREE_DIGIT_PRODUCT_ENVELOPE_LEAKAGE", three);
  check(!s.printDisabled, "C_P102_PRINT_DISABLED", s);
  evidence.checks.C_P102_TRANSFER_ENVELOPE = {
    status: "PASS",
    state: s,
    equationCount: eq.length,
    twoDigitWitnessCount: two.length,
    threeDigitWitnessCount: three.length,
    maxThreeDigitProduct: Math.max(...three.map((row) => row.product)),
    questionCount: w.questionCount,
    answerCount: w.answerCount,
  };
  evidence.checks.E_P102_QUERY_RESTORE = { status: "PASS", deepLink: true, refresh: true };

  // D — unsupported P1-03/P1-04 transfer requests normalize to arithmetic.
  for (const blockId of ["P1-03", "P1-04"]) {
    await open(page, `?path1BlockId=${blockId}&practiceMode=equalGroupsTransfer`);
    s = await state(page);
    check(s.blockId === blockId, `D_${blockId}_BLOCK_NOT_RESTORED`, s);
    check(s.practiceMode === "arithmetic", `D_${blockId}_TRANSFER_NOT_NORMALIZED`, s);
    check(s.transferDisabled === true, `D_${blockId}_TRANSFER_NOT_DISABLED`, s);
    check(new URL(s.url).searchParams.get("practiceMode") === "arithmetic", `D_${blockId}_URL_NOT_NORMALIZED`, s);
    evidence.checks[`D_${blockId}_UNSUPPORTED`] = { status: "PASS", state: s };
  }

  // E — invalid mode is fail-safe.
  await open(page, "?path1BlockId=P1-02&practiceMode=notARealMode");
  s = await state(page);
  check(s.blockId === "P1-02", "E_INVALID_MODE_BLOCK_CHANGED", s);
  check(s.practiceMode === "arithmetic", "E_INVALID_MODE_NOT_ARITHMETIC", s);
  check(new URL(s.url).searchParams.get("practiceMode") === "arithmetic", "E_INVALID_MODE_URL_NOT_NORMALIZED", s);
  evidence.checks.E_INVALID_MODE_FAIL_SAFE = { status: "PASS", state: s };

  // F — browser runtime and worksheet parity.
  check(pageErrors.length === 0, "F_BROWSER_PAGE_ERRORS", pageErrors);
  check(consoleErrors.length === 0, "F_BROWSER_CONSOLE_ERRORS", consoleErrors);
  evidence.checks.F_RUNTIME = { status: "PASS", pageErrors, consoleErrors };

  evidence.status = "PASS";
  evidence.completedAt = new Date().toISOString();
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(`${OUT_DIR}/result.json`, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(evidence, null, 2));
} catch (error) {
  evidence.status = "FAIL";
  evidence.completedAt = new Date().toISOString();
  evidence.failure = { message: String(error?.message ?? error), details: error?.details ?? null, pageErrors, consoleErrors };
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(`${OUT_DIR}/result.json`, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
  await page.screenshot({ path: `${OUT_DIR}/failure.png`, fullPage: true }).catch(() => {});
  console.error(JSON.stringify(evidence, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
