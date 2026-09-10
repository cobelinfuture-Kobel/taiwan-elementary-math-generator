import { spawn } from "node:child_process";
import { chromium } from "playwright";

const SITE_PORT = Number(process.env.PATH1_P109_REMEDIATION_PORT ?? 4210);
const SITE_ROOT = `http://127.0.0.1:${SITE_PORT}/`;
const PATH1_URL = new URL("path1/", SITE_ROOT).href;

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
  throw lastError ?? new Error("PATH1_P109_REMEDIATION_LOCAL_SITE_TIMEOUT");
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
  const optionExists = await page.locator('#path1-block-select option[value="P1-09"]').count();
  invariant(optionExists === 1, "PATH1_P109_REMEDIATION_BROWSER_BLOCK_OPTION_MISSING", { optionExists });

  const witness = await page.evaluate(async () => {
    const moduleUrl = new URL("../assets/browser/pipeline/build-path1-manual-worksheet.js", window.location.href).href;
    const mod = await import(moduleUrl);

    const summarize = (count, seed) => {
      const result = mod.buildPath1ManualWorksheet({
        blockId: "P1-09",
        practiceMode: "arithmetic",
        questionCount: count,
        generationSeed: seed,
        includeAnswerKey: true,
      });
      const questions = result?.worksheetDocument?.generatedQuestions
        ?? result?.worksheetDocument?.questions
        ?? result?.worksheetDocument?.questionItems
        ?? [];
      const questionPageCellCount = (result?.worksheetDocument?.questionPages ?? [])
        .flatMap((page) => page.cells ?? [])
        .filter((cell) => cell.cellType === "question").length;
      const answerPageCellCount = (result?.worksheetDocument?.answerKeyPages ?? [])
        .flatMap((page) => page.cells ?? [])
        .filter((cell) => cell.cellType === "answerKey").length;
      const divisors = questions.map((question) => question?.metadata?.divisor).filter(Number.isInteger);
      const quotients = questions.map((question) => question?.metadata?.quotient).filter(Number.isInteger);
      const arithmeticInvariantOk = questions.every((question) => {
        const metadata = question.metadata ?? {};
        return Number.isInteger(metadata.dividend)
          && metadata.dividend >= 1000
          && metadata.dividend <= 9999
          && Number.isInteger(metadata.divisor)
          && metadata.divisor >= 10
          && metadata.divisor <= 99
          && Number.isInteger(metadata.quotient)
          && metadata.quotient >= 10
          && metadata.quotient <= 999
          && Number.isInteger(metadata.remainder)
          && metadata.dividend === metadata.divisor * metadata.quotient + metadata.remainder
          && metadata.remainder >= 0
          && metadata.remainder < metadata.divisor;
      });
      const metadataIdentityOk = questions.every((question) => (
        question.knowledgePointId === null
        && question.operationFamilyId === "INTEGER_LONG_DIVISION_DIFFICULTY_EXPANSION"
        && question.sourceNodeId === "path1_four_digit_by_two_digit_division"
        && question?.metadata?.pathDifficultyExpansionId === "path1_four_digit_by_two_digit_division"
        && question?.metadata?.canonicalKnowledgePointMinted === false
      ));
      const threeDigitQuotientCount = questions.filter((question) => question.metadata.quotient >= 100).length;
      const twoDigitQuotientCount = questions.filter((question) => question.metadata.quotient >= 10 && question.metadata.quotient <= 99).length;
      const hundredsStartCount = questions.filter((question) => (
        Math.floor(question.metadata.dividend / 100) >= question.metadata.divisor
      )).length;
      const tensStartCount = questions.length - hundredsStartCount;
      const checkingPromotionCount = questions.filter((question) => String(question.prompt ?? "").includes("驗算")).length;
      const p110LeakCount = questions.filter((question) => question.metadata.divisor >= 100).length;

      return {
        count,
        seed,
        ok: result.ok,
        errors: result.errors ?? [],
        questionCount: questions.length,
        questionPageCellCount,
        answerPageCellCount,
        distinctPromptCount: new Set(questions.map((question) => question.prompt)).size,
        distinctArithmeticKeyCount: new Set(questions.map((question) => `${question.metadata.dividend}/${question.metadata.divisor}`)).size,
        divisorMin: divisors.length > 0 ? Math.min(...divisors) : null,
        divisorMax: divisors.length > 0 ? Math.max(...divisors) : null,
        quotientMin: quotients.length > 0 ? Math.min(...quotients) : null,
        quotientMax: quotients.length > 0 ? Math.max(...quotients) : null,
        divisor10Count: questions.filter((question) => question.metadata.divisor === 10).length,
        divisor99Count: questions.filter((question) => question.metadata.divisor === 99).length,
        threeDigitQuotientCount,
        twoDigitQuotientCount,
        hundredsStartCount,
        tensStartCount,
        checkingPromotionCount,
        p110LeakCount,
        arithmeticInvariantOk,
        metadataIdentityOk,
        deterministicSignature: questions.map((question) => ({
          prompt: question.prompt,
          answerText: question.answerText,
          dividend: question?.metadata?.dividend,
          divisor: question?.metadata?.divisor,
          quotient: question?.metadata?.quotient,
          remainder: question?.metadata?.remainder,
        })),
      };
    };

    return {
      one: summarize(1, "p109-source-parity-implementation-1"),
      oneRepeat: summarize(1, "p109-source-parity-implementation-1"),
      two: summarize(2, "p109-source-parity-implementation-2"),
      twenty: summarize(20, "p109-source-parity-implementation-20"),
      oneTwenty: summarize(120, "p109-source-parity-implementation-120"),
    };
  });

  const { one, oneRepeat, two, twenty, oneTwenty } = witness;
  for (const sample of [one, oneRepeat, two, twenty, oneTwenty]) {
    invariant(sample.ok === true, "PATH1_P109_REMEDIATION_BROWSER_GENERATION_FAILED", sample);
    invariant(sample.questionCount === sample.count, "PATH1_P109_REMEDIATION_BROWSER_COUNT_MISMATCH", sample);
    invariant(sample.questionPageCellCount === sample.count, "PATH1_P109_REMEDIATION_BROWSER_QUESTION_RENDER_PARITY_FAILED", sample);
    invariant(sample.answerPageCellCount === sample.count, "PATH1_P109_REMEDIATION_BROWSER_ANSWER_RENDER_PARITY_FAILED", sample);
    invariant(sample.arithmeticInvariantOk === true, "PATH1_P109_REMEDIATION_BROWSER_ARITHMETIC_INVARIANT_FAILED", sample);
    invariant(sample.metadataIdentityOk === true, "PATH1_P109_REMEDIATION_BROWSER_METADATA_IDENTITY_FAILED", sample);
    invariant(sample.p110LeakCount === 0, "PATH1_P109_REMEDIATION_BROWSER_P110_DIVISOR_LEAK", sample);
    invariant(sample.checkingPromotionCount === 0, "PATH1_P109_REMEDIATION_BROWSER_P111_CHECKING_PROMOTION_LEAK", sample);
  }

  invariant(
    JSON.stringify(one.deterministicSignature) === JSON.stringify(oneRepeat.deterministicSignature),
    "PATH1_P109_REMEDIATION_BROWSER_SAME_SEED_NOT_DETERMINISTIC",
    { one, oneRepeat },
  );
  for (const sample of [two, twenty, oneTwenty]) {
    invariant(sample.divisor10Count > 0, "PATH1_P109_REMEDIATION_BROWSER_DIVISOR_10_NOT_REACHABLE", sample);
    invariant(sample.divisor99Count > 0, "PATH1_P109_REMEDIATION_BROWSER_DIVISOR_99_NOT_REACHABLE", sample);
    invariant(sample.threeDigitQuotientCount > 0, "PATH1_P109_REMEDIATION_BROWSER_THREE_DIGIT_QUOTIENT_NOT_REACHABLE", sample);
    invariant(sample.twoDigitQuotientCount > 0, "PATH1_P109_REMEDIATION_BROWSER_TWO_DIGIT_QUOTIENT_NOT_REACHABLE", sample);
    invariant(sample.hundredsStartCount > 0, "PATH1_P109_REMEDIATION_BROWSER_HUNDREDS_START_NOT_REACHABLE", sample);
    invariant(sample.tensStartCount > 0, "PATH1_P109_REMEDIATION_BROWSER_TENS_START_NOT_REACHABLE", sample);
  }
  invariant(oneTwenty.distinctPromptCount === 120, "PATH1_P109_REMEDIATION_BROWSER_120_DISTINCT_PROMPTS_FAILED", oneTwenty);
  invariant(oneTwenty.distinctArithmeticKeyCount === 120, "PATH1_P109_REMEDIATION_BROWSER_120_DISTINCT_ARITHMETIC_KEYS_FAILED", oneTwenty);
  invariant(oneTwenty.divisorMin === 10 && oneTwenty.divisorMax === 99, "PATH1_P109_REMEDIATION_BROWSER_DIVISOR_BOUNDARY_REACHABILITY_FAILED", oneTwenty);
  invariant(pageErrors.length === 0, "PATH1_P109_REMEDIATION_BROWSER_PAGE_ERROR", { pageErrors });
  invariant(consoleErrors.length === 0, "PATH1_P109_REMEDIATION_BROWSER_CONSOLE_ERROR", { consoleErrors });

  process.stdout.write(`${JSON.stringify({
    schemaName: "Path1P109LargerDividendTwoDigitDivisorSourceParityRemediationImplementationBrowserAcceptanceV1",
    status: "PASS_SOURCE_PARITY_REMEDIATED",
    path1Url: PATH1_URL,
    sourceParity: {
      divisorEnvelope: "10..99_REACHABLE",
      twoDigitQuotientCase: "REACHABLE",
      threeDigitQuotientCase: "REACHABLE",
      hundredsStartCase: "REACHABLE",
      tensStartCase: "REACHABLE",
      matrixRuntimeAlias: "larger_dividend_two_digit_divisor -> path1_four_digit_by_two_digit_division",
    },
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
