import { spawn } from "node:child_process";
import { chromium } from "playwright";

const SITE_PORT = Number(process.env.PATH1_P108_REMEDIATION_PORT ?? 4199);
const SITE_ROOT = `http://127.0.0.1:${SITE_PORT}/`;
const PATH1_URL = new URL("path1/", SITE_ROOT).href;

const PRIMARY_KPS = [
  "kp_g4a_u04_2digit_by_2digit_ten_multiple_divisor",
  "kp_g4a_u04_3digit_by_2digit_tens_sufficient",
  "kp_g4a_u04_3digit_by_2digit_tens_insufficient",
];
const PATTERNS = [
  "ps_g4a_u04_2digit_by_2digit_ten_multiple_divisor",
  "ps_g4a_u04_3digit_by_2digit_tens_sufficient",
  "ps_g4a_u04_3digit_by_2digit_tens_insufficient",
];
const PATTERN_TO_KP = Object.fromEntries(PATTERNS.map((pattern, index) => [pattern, PRIMARY_KPS[index]]));

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
  throw lastError ?? new Error("PATH1_P108_REMEDIATION_LOCAL_SITE_TIMEOUT");
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
  invariant(optionExists === 1, "PATH1_P108_REMEDIATION_BROWSER_BLOCK_OPTION_MISSING", { optionExists });

  const witness = await page.evaluate(async ({ primaryKps, patterns, patternToKp }) => {
    const moduleUrl = new URL("../assets/browser/pipeline/build-path1-manual-worksheet.js", window.location.href).href;
    const mod = await import(moduleUrl);
    const summarize = (count, seed) => {
      const result = mod.buildPath1ManualWorksheet({
        blockId: "P1-08",
        practiceMode: "arithmetic",
        questionCount: count,
        generationSeed: seed,
        includeAnswerKey: true,
      });
      const questions = result?.worksheetDocument?.generatedQuestions
        ?? result?.worksheetDocument?.questions
        ?? result?.worksheetDocument?.questionItems
        ?? [];
      const patternCounts = patterns.map((patternSpecId) => (
        questions.filter((question) => question.patternSpecId === patternSpecId).length
      ));
      const kpCounts = primaryKps.map((knowledgePointId) => (
        questions.filter((question) => question.knowledgePointId === knowledgePointId).length
      ));
      const missingKnowledgePointMetadata = questions.filter((question) => question.knowledgePointId == null).length;
      const patternKpParityOk = questions.every((question) => patternToKp[question.patternSpecId] === question.knowledgePointId);
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
        seed,
        ok: result.ok,
        errors: result.errors ?? [],
        questionCount: questions.length,
        blockKnowledgePointIds: result?.block?.knowledgePointIds ?? [],
        patternCounts,
        kpCounts,
        selectedQuestionKps: questions.map((question) => question.knowledgePointId),
        selectedQuestionPatterns: questions.map((question) => question.patternSpecId),
        firstPrompt: questions[0]?.prompt ?? null,
        firstAnswer: questions[0]?.answerText ?? null,
        missingKnowledgePointMetadata,
        patternKpParityOk,
        arithmeticInvariantOk,
        noFallbackOutsideP108Patterns: questions.every((question) => patterns.includes(question.patternSpecId)),
        sourceAuthorityOk: questions.every((question) => question.sourceId === "g4a_u04_4a04"),
        routeSelectionMatchesPrimaryKps: JSON.stringify(result?.block?.knowledgePointIds ?? []) === JSON.stringify(primaryKps),
      };
    };

    return {
      oneA: summarize(1, "p108-small-a"),
      oneARepeat: summarize(1, "p108-small-a"),
      oneB: summarize(1, "p108-small-b"),
      oneC: summarize(1, "p108-small-c"),
      twenty: summarize(20, "p108-generic-arithmetic-acceptance-20"),
      oneTwenty: summarize(120, "p108-generic-arithmetic-acceptance-120"),
    };
  }, { primaryKps: PRIMARY_KPS, patterns: PATTERNS, patternToKp: PATTERN_TO_KP });

  const { oneA, oneARepeat, oneB, oneC, twenty, oneTwenty } = witness;

  for (const single of [oneA, oneARepeat, oneB, oneC]) {
    invariant(single.ok === true, "PATH1_P108_REMEDIATION_BROWSER_COUNT1_FAILED", single);
    invariant(single.questionCount === 1, "PATH1_P108_REMEDIATION_BROWSER_COUNT1_COUNT_MISMATCH", single);
    invariant(single.missingKnowledgePointMetadata === 0, "PATH1_P108_REMEDIATION_BROWSER_COUNT1_KP_METADATA_MISSING", single);
    invariant(single.patternKpParityOk === true, "PATH1_P108_REMEDIATION_BROWSER_COUNT1_PATTERN_KP_MISMATCH", single);
    invariant(single.arithmeticInvariantOk === true, "PATH1_P108_REMEDIATION_BROWSER_COUNT1_ARITHMETIC_INVARIANT_FAILED", single);
    invariant(single.noFallbackOutsideP108Patterns === true, "PATH1_P108_REMEDIATION_BROWSER_COUNT1_PATTERN_FALLBACK", single);
    invariant(single.sourceAuthorityOk === true, "PATH1_P108_REMEDIATION_BROWSER_COUNT1_SOURCE_AUTHORITY_MISMATCH", single);
    invariant(single.routeSelectionMatchesPrimaryKps === true, "PATH1_P108_REMEDIATION_BROWSER_COUNT1_ROUTE_SELECTION_MISMATCH", single);
  }

  invariant(
    JSON.stringify({ kp: oneA.selectedQuestionKps, pattern: oneA.selectedQuestionPatterns, prompt: oneA.firstPrompt, answer: oneA.firstAnswer })
      === JSON.stringify({ kp: oneARepeat.selectedQuestionKps, pattern: oneARepeat.selectedQuestionPatterns, prompt: oneARepeat.firstPrompt, answer: oneARepeat.firstAnswer }),
    "PATH1_P108_REMEDIATION_BROWSER_COUNT1_NOT_DETERMINISTIC",
    { oneA, oneARepeat },
  );
  const smallCountReachability = new Set([
    ...oneA.selectedQuestionKps,
    ...oneB.selectedQuestionKps,
    ...oneC.selectedQuestionKps,
  ]);
  invariant(smallCountReachability.size === 3, "PATH1_P108_REMEDIATION_BROWSER_SMALL_COUNT_KP_REACHABILITY_FAILED", {
    selected: [...smallCountReachability],
  });

  invariant(twenty.ok === true, "PATH1_P108_REMEDIATION_BROWSER_COUNT20_FAILED", twenty);
  invariant(twenty.questionCount === 20, "PATH1_P108_REMEDIATION_BROWSER_COUNT20_COUNT_MISMATCH", twenty);
  invariant(JSON.stringify(twenty.patternCounts) === JSON.stringify([7, 7, 6]), "PATH1_P108_REMEDIATION_BROWSER_COUNT20_PATTERN_ALLOCATION_MISMATCH", twenty);
  invariant(JSON.stringify(twenty.kpCounts) === JSON.stringify([7, 7, 6]), "PATH1_P108_REMEDIATION_BROWSER_COUNT20_KP_ALLOCATION_MISMATCH", twenty);
  invariant(twenty.missingKnowledgePointMetadata === 0, "PATH1_P108_REMEDIATION_BROWSER_COUNT20_KP_METADATA_MISSING", twenty);
  invariant(twenty.patternKpParityOk === true, "PATH1_P108_REMEDIATION_BROWSER_COUNT20_PATTERN_KP_MISMATCH", twenty);
  invariant(twenty.arithmeticInvariantOk === true, "PATH1_P108_REMEDIATION_BROWSER_COUNT20_ARITHMETIC_INVARIANT_FAILED", twenty);
  invariant(twenty.noFallbackOutsideP108Patterns === true, "PATH1_P108_REMEDIATION_BROWSER_COUNT20_PATTERN_FALLBACK", twenty);
  invariant(twenty.sourceAuthorityOk === true, "PATH1_P108_REMEDIATION_BROWSER_COUNT20_SOURCE_AUTHORITY_MISMATCH", twenty);
  invariant(twenty.routeSelectionMatchesPrimaryKps === true, "PATH1_P108_REMEDIATION_BROWSER_COUNT20_ROUTE_SELECTION_MISMATCH", twenty);

  invariant(oneTwenty.ok === true, "PATH1_P108_REMEDIATION_BROWSER_COUNT120_FAILED", oneTwenty);
  invariant(oneTwenty.questionCount === 120, "PATH1_P108_REMEDIATION_BROWSER_COUNT120_COUNT_MISMATCH", oneTwenty);
  invariant(JSON.stringify(oneTwenty.patternCounts) === JSON.stringify([40, 40, 40]), "PATH1_P108_REMEDIATION_BROWSER_COUNT120_PATTERN_ALLOCATION_MISMATCH", oneTwenty);
  invariant(JSON.stringify(oneTwenty.kpCounts) === JSON.stringify([40, 40, 40]), "PATH1_P108_REMEDIATION_BROWSER_COUNT120_KP_ALLOCATION_MISMATCH", oneTwenty);
  invariant(oneTwenty.missingKnowledgePointMetadata === 0, "PATH1_P108_REMEDIATION_BROWSER_COUNT120_KP_METADATA_MISSING", oneTwenty);
  invariant(oneTwenty.patternKpParityOk === true, "PATH1_P108_REMEDIATION_BROWSER_COUNT120_PATTERN_KP_MISMATCH", oneTwenty);
  invariant(oneTwenty.arithmeticInvariantOk === true, "PATH1_P108_REMEDIATION_BROWSER_COUNT120_ARITHMETIC_INVARIANT_FAILED", oneTwenty);
  invariant(oneTwenty.noFallbackOutsideP108Patterns === true, "PATH1_P108_REMEDIATION_BROWSER_COUNT120_PATTERN_FALLBACK", oneTwenty);
  invariant(oneTwenty.sourceAuthorityOk === true, "PATH1_P108_REMEDIATION_BROWSER_COUNT120_SOURCE_AUTHORITY_MISMATCH", oneTwenty);
  invariant(oneTwenty.routeSelectionMatchesPrimaryKps === true, "PATH1_P108_REMEDIATION_BROWSER_COUNT120_ROUTE_SELECTION_MISMATCH", oneTwenty);

  invariant(pageErrors.length === 0, "PATH1_P108_REMEDIATION_BROWSER_PAGE_ERROR", { pageErrors });
  invariant(consoleErrors.length === 0, "PATH1_P108_REMEDIATION_BROWSER_CONSOLE_ERROR", { consoleErrors });

  process.stdout.write(`${JSON.stringify({
    schemaName: "Path1P108GenericArithmeticSmallCountAndKpMetadataRemediationImplementationBrowserAcceptanceV1",
    status: "PASS",
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
