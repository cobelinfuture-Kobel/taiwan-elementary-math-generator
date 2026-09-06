import { chromium } from "playwright";

const siteUrl = process.env.PATH1_P103_SITE_URL
  ?? "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/path1/";
const expectedDeploymentSha = process.env.PATH1_P103_DEPLOYMENT_SHA
  ?? "7b44edadb519fe430e3403d248d78f8dcb03ba76";

function invariant(condition, code, details = {}) {
  if (condition) return;
  const error = new Error(code);
  error.details = details;
  throw error;
}

function occurrences(text, needle) {
  return String(text).split(needle).length - 1;
}

function path1Url(path1BlockId = null, practiceMode = null) {
  const url = new URL(siteUrl);
  if (path1BlockId) url.searchParams.set("path1BlockId", path1BlockId);
  if (practiceMode) url.searchParams.set("practiceMode", practiceMode);
  return url.href;
}

async function waitForGenerated(page, count) {
  await page.locator("#path1-generate-button").click();
  await page.locator("#path1-status-panel").filter({ hasText: `已產生 ${count} 題` }).waitFor({ timeout: 30000 });
  const frameBody = page.frameLocator("#path1-preview-frame").locator("body");
  await frameBody.waitFor({ timeout: 30000 });
  return frameBody.innerText();
}

async function optionState(page, value) {
  return page.locator(`#path1-practice-mode option[value="${value}"]`).evaluate((option) => ({
    disabled: option.disabled,
    hidden: option.hidden,
  }));
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const pageErrors = [];
const consoleErrors = [];
page.on("pageerror", (error) => pageErrors.push(String(error?.message ?? error)));
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});

try {
  await page.goto(siteUrl, { waitUntil: "networkidle", timeout: 30000 });
  invariant(await page.locator("#path1-block-select").inputValue() === "P1-01", "P103_DEPLOYED_DEFAULT_BLOCK_MISMATCH");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "arithmetic", "P103_DEPLOYED_DEFAULT_MODE_MISMATCH");

  await page.locator("#path1-block-select").selectOption("P1-03");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "arithmetic", "P103_DEPLOYED_ARITHMETIC_SELECTION_MISMATCH");
  const p103ModeState = await optionState(page, "multiplicativeModelingTransfer");
  const earlyModeOnP103 = await optionState(page, "equalGroupsTransfer");
  invariant(!p103ModeState.disabled && !p103ModeState.hidden, "P103_DEPLOYED_MODELING_OPTION_NOT_AVAILABLE", p103ModeState);
  invariant(earlyModeOnP103.disabled && earlyModeOnP103.hidden, "P103_DEPLOYED_EARLY_MODE_SHOULD_BE_HIDDEN", earlyModeOnP103);

  await page.locator("#path1-question-count").fill("8");
  const arithmeticText = await waitForGenerated(page, 8);
  invariant(arithmeticText.length > 0, "P103_DEPLOYED_ARITHMETIC_PREVIEW_EMPTY");

  await page.locator("#path1-practice-mode").selectOption("multiplicativeModelingTransfer");
  invariant(new URL(page.url()).searchParams.get("practiceMode") === "multiplicativeModelingTransfer", "P103_DEPLOYED_MODELING_QUERY_NOT_WRITTEN");
  await page.locator("#path1-question-count").fill("24");
  const modelingText = await waitForGenerated(page, 24);
  invariant(occurrences(modelingText, "答：") === 24, "P103_DEPLOYED_ANSWER_COUNT_MISMATCH", {
    actual: occurrences(modelingText, "答："),
  });
  invariant(modelingText.includes(" × "), "P103_DEPLOYED_EQUATION_NOT_RENDERED");
  invariant((await page.locator("#path1-preview-meta").innerText()).includes("文字建模練習｜24 題｜含答案頁"), "P103_DEPLOYED_PREVIEW_META_MISMATCH");
  invariant(!(await page.locator("#path1-print-button").isDisabled()), "P103_DEPLOYED_PRINT_NOT_ENABLED");

  await page.evaluate(() => {
    const frame = document.getElementById("path1-preview-frame");
    frame.contentWindow.print = () => {
      window.__path1P103DeployedPrintSnapshot = frame.contentDocument.body.innerText;
    };
  });
  await page.locator("#path1-print-button").click();
  const printSnapshot = await page.evaluate(() => window.__path1P103DeployedPrintSnapshot ?? "");
  invariant(printSnapshot === modelingText, "P103_DEPLOYED_PREVIEW_PRINT_PARITY_FAILED");
  invariant(occurrences(printSnapshot, "答：") === 24, "P103_DEPLOYED_PRINT_ANSWER_COUNT_MISMATCH");

  await page.goto(path1Url("P1-03", "multiplicativeModelingTransfer"), { waitUntil: "networkidle", timeout: 30000 });
  invariant(await page.locator("#path1-block-select").inputValue() === "P1-03", "P103_DEPLOYED_DEEPLINK_BLOCK_FAILED");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "multiplicativeModelingTransfer", "P103_DEPLOYED_DEEPLINK_MODE_FAILED");
  await page.reload({ waitUntil: "networkidle", timeout: 30000 });
  invariant(await page.locator("#path1-block-select").inputValue() === "P1-03", "P103_DEPLOYED_REFRESH_BLOCK_FAILED");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "multiplicativeModelingTransfer", "P103_DEPLOYED_REFRESH_MODE_FAILED");

  await page.locator("#path1-block-select").selectOption("P1-04");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "arithmetic", "P103_DEPLOYED_P104_NOT_NORMALIZED");
  invariant(new URL(page.url()).searchParams.get("practiceMode") === "arithmetic", "P103_DEPLOYED_P104_QUERY_NOT_NORMALIZED");
  invariant((await page.locator("#path1-status-panel").innerText()).includes("已切回算式練習"), "P103_DEPLOYED_P104_WARNING_MISSING");

  for (const blockId of ["P1-01", "P1-02"]) {
    await page.goto(path1Url(blockId, "equalGroupsTransfer"), { waitUntil: "networkidle", timeout: 30000 });
    invariant(await page.locator("#path1-practice-mode").inputValue() === "equalGroupsTransfer", "P103_DEPLOYED_EARLY_TRANSFER_RESTORE_FAILED", { blockId });
    const p103State = await optionState(page, "multiplicativeModelingTransfer");
    invariant(p103State.disabled && p103State.hidden, "P103_DEPLOYED_P103_MODE_SHOULD_BE_HIDDEN_ON_EARLY_BLOCK", { blockId, p103State });
    await page.locator("#path1-question-count").fill("6");
    const text = await waitForGenerated(page, 6);
    invariant(occurrences(text, "答：") === 6, "P103_DEPLOYED_EARLY_TRANSFER_ANSWER_COUNT_MISMATCH", { blockId });
  }

  invariant(pageErrors.length === 0, "P103_DEPLOYED_PAGE_ERROR", { pageErrors });
  invariant(consoleErrors.length === 0, "P103_DEPLOYED_CONSOLE_ERROR", { consoleErrors });

  process.stdout.write(`${JSON.stringify({
    schemaName: "Path1P103DeployedPublicAcceptanceV1",
    status: "PASS",
    siteUrl,
    deploymentSha: expectedDeploymentSha,
    defaultRoute: "P1-01/arithmetic",
    p103ArithmeticGenerated: 8,
    p103ModelingGenerated: 24,
    p103ModelingAnswers: 24,
    p103DeepLinkRefresh: true,
    p104SafeNormalization: true,
    earlyEqualGroupsTransferBlocksPreserved: ["P1-01", "P1-02"],
    previewPrintParity: true,
    pageErrors,
    consoleErrors,
  }, null, 2)}\n`);
} finally {
  await browser.close();
}
