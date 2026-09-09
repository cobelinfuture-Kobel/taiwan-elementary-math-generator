import { spawn } from "node:child_process";
import { chromium } from "playwright";

const SITE_PORT = Number(process.env.PATH1_P108_ACCEPTANCE_PORT ?? 4198);
const SITE_ROOT = `http://127.0.0.1:${SITE_PORT}/`;
const PATH1_URL = new URL("path1/", SITE_ROOT).href;
const PRIMARY_KPS = [
  "kp_g4a_u04_2digit_by_2digit_ten_multiple_divisor",
  "kp_g4a_u04_3digit_by_2digit_tens_sufficient",
  "kp_g4a_u04_3digit_by_2digit_tens_insufficient",
];

function invariant(condition, code, details = {}) {
  if (condition) return;
  const error = new Error(code);
  error.details = details;
  throw error;
}

async function waitForSite(url, timeoutMs = 30000) {
  const started = Date.now();
  let lastError = null;
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) return;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw lastError ?? new Error("PATH1_P108_LOCAL_SITE_TIMEOUT");
}

const server = spawn(process.execPath, ["tools/site/serve-site.js"], {
  env: {
    ...process.env,
    SITE_HOST: "127.0.0.1",
    SITE_PORT: String(SITE_PORT),
  },
  stdio: ["ignore", "pipe", "pipe"],
});
let serverStdout = "";
let serverStderr = "";
server.stdout.on("data", (chunk) => { serverStdout += chunk.toString(); });
server.stderr.on("data", (chunk) => { serverStderr += chunk.toString(); });

let browser = null;
try {
  await waitForSite(PATH1_URL);
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const pageErrors = [];
  const consoleErrors = [];
  page.on("pageerror", (error) => pageErrors.push(String(error?.message ?? error)));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto(PATH1_URL, { waitUntil: "networkidle", timeout: 60000 });
  const optionExists = await page.locator('#path1-block-select option[value="P1-08"]').count();
  invariant(optionExists === 1, "PATH1_P108_BROWSER_BLOCK_OPTION_MISSING", { optionExists });

  const witness = await page.evaluate(async (primaryKps) => {
    const moduleUrl = new URL("../assets/browser/pipeline/build-path1-manual-worksheet.js", window.location.href).href;
    const mod = await import(moduleUrl);
    const summarize = (count) => {
      const result = mod.buildPath1ManualWorksheet({
        blockId: "P1-08",
        practiceMode: "arithmetic",
        questionCount: count,
        generationSeed: `p108-browser-acceptance-${count}`,
        includeAnswerKey: true,
      });
      const questions = result?.worksheetDocument?.generatedQuestions
        ?? result?.worksheetDocument?.questions
        ?? result?.worksheetDocument?.questionItems
        ?? [];
      const kpCounts = primaryKps.map((knowledgePointId) => (
        questions.filter((question) => question.knowledgePointId === knowledgePointId).length
      ));
      const arithmeticInvariantOk = questions.every((question) => {
        const metadata = question.metadata ?? {};
        const dividend = metadata.dividend ?? question.dividend;
        const divisor = metadata.divisor ?? question.divisor;
        const quotient = metadata.quotient ?? question.quotient;
        const remainder = metadata.remainder ?? question.remainder;
        return Number.isInteger(dividend)
          && Number.isInteger(divisor)
          && Number.isInteger(quotient)
          && Number.isInteger(remainder)
          && dividend === divisor * quotient + remainder
          && remainder >= 0
          && remainder < divisor;
      });
      return {
        count,
        ok: result.ok,
        errors: result.errors ?? [],
        questionCount: questions.length,
        kpCounts,
        arithmeticInvariantOk,
      };
    };
    return [summarize(1), summarize(20), summarize(120)];
  }, PRIMARY_KPS);

  const [one, twenty, oneTwenty] = witness;
  invariant(one.ok === false, "PATH1_P108_BROWSER_COUNT1_UNEXPECTED_PASS", one);
  invariant(one.errors.length === 1, "PATH1_P108_BROWSER_COUNT1_ERROR_COUNT_MISMATCH", one);
  invariant(one.errors[0].code === "PATH1_QUESTION_COUNT_BELOW_KP_COVERAGE", "PATH1_P108_BROWSER_COUNT1_ERROR_CODE_MISMATCH", one);
  invariant(one.errors[0].requiredMinimum === 3, "PATH1_P108_BROWSER_COUNT1_MINIMUM_MISMATCH", one);

  invariant(twenty.ok === true, "PATH1_P108_BROWSER_COUNT20_FAILED", twenty);
  invariant(twenty.questionCount === 20, "PATH1_P108_BROWSER_COUNT20_COUNT_MISMATCH", twenty);
  invariant(JSON.stringify(twenty.kpCounts) === JSON.stringify([7, 7, 6]), "PATH1_P108_BROWSER_COUNT20_KP_ALLOCATION_MISMATCH", twenty);
  invariant(twenty.arithmeticInvariantOk === true, "PATH1_P108_BROWSER_COUNT20_ARITHMETIC_INVARIANT_FAILED", twenty);

  invariant(oneTwenty.ok === true, "PATH1_P108_BROWSER_COUNT120_FAILED", oneTwenty);
  invariant(oneTwenty.questionCount === 120, "PATH1_P108_BROWSER_COUNT120_COUNT_MISMATCH", oneTwenty);
  invariant(JSON.stringify(oneTwenty.kpCounts) === JSON.stringify([40, 40, 40]), "PATH1_P108_BROWSER_COUNT120_KP_ALLOCATION_MISMATCH", oneTwenty);
  invariant(oneTwenty.arithmeticInvariantOk === true, "PATH1_P108_BROWSER_COUNT120_ARITHMETIC_INVARIANT_FAILED", oneTwenty);

  invariant(pageErrors.length === 0, "PATH1_P108_BROWSER_PAGE_ERROR", { pageErrors });
  invariant(consoleErrors.length === 0, "PATH1_P108_BROWSER_CONSOLE_ERROR", { consoleErrors });

  process.stdout.write(`${JSON.stringify({
    schemaName: "Path1P108TwoDigitDivisorGenericArithmeticBrowserAcceptanceV1",
    status: "PASS_WITH_BOUNDED_SINGLE_QUESTION_GAP",
    path1Url: PATH1_URL,
    witness,
    pageErrors,
    consoleErrors,
  }, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`${JSON.stringify({
    code: error.message,
    details: error.details ?? null,
    serverStdout,
    serverStderr,
  }, null, 2)}\n`);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  if (!server.killed) server.kill("SIGTERM");
}
