import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..", "site");
const MIME = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
]);

function createStaticServer() {
  return http.createServer((request, response) => {
    try {
      const url = new URL(request.url ?? "/", "http://127.0.0.1");
      let pathname = decodeURIComponent(url.pathname);
      if (pathname.endsWith("/")) pathname += "index.html";
      const target = path.resolve(ROOT, `.${pathname}`);
      if (!target.startsWith(`${ROOT}${path.sep}`) && target !== ROOT) {
        response.writeHead(403).end("Forbidden");
        return;
      }
      if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
        response.writeHead(404).end("Not found");
        return;
      }
      response.writeHead(200, {
        "content-type": MIME.get(path.extname(target)) ?? "application/octet-stream",
        "cache-control": "no-store",
      });
      fs.createReadStream(target).pipe(response);
    } catch (error) {
      response.writeHead(500).end(String(error?.message ?? error));
    }
  });
}

function invariant(condition, code, details = {}) {
  if (condition) return;
  const error = new Error(code);
  error.details = details;
  throw error;
}

async function waitForGenerated(page, count) {
  await page.locator("#path1-generate-button").click();
  await page.locator("#path1-status-panel").filter({ hasText: `已產生 ${count} 題` }).waitFor({ timeout: 15000 });
  const frameBody = page.frameLocator("#path1-preview-frame").locator("body");
  await frameBody.waitFor({ timeout: 15000 });
  return frameBody.innerText();
}

const server = createStaticServer();
await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});
const address = server.address();
const port = typeof address === "object" && address ? address.port : null;
if (!port) throw new Error("PATH1_BROWSER_SERVER_PORT_UNAVAILABLE");
const baseUrl = `http://127.0.0.1:${port}`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(String(error?.message ?? error)));

try {
  await page.goto(`${baseUrl}/path1/`, { waitUntil: "networkidle" });
  invariant(await page.locator("#path1-block-select").inputValue() === "P1-01", "PATH1_BROWSER_DEFAULT_BLOCK_MISMATCH");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "arithmetic", "PATH1_BROWSER_DEFAULT_PRACTICE_MODE_MISMATCH");
  invariant(!(await page.locator('#path1-practice-mode option[value="equalGroupsTransfer"]').isDisabled()), "PATH1_BROWSER_P101_TRANSFER_SHOULD_BE_ENABLED");

  await page.locator("#path1-question-count").fill("8");
  await page.locator("#path1-practice-mode").selectOption("equalGroupsTransfer");
  invariant(new URL(page.url()).searchParams.get("practiceMode") === "equalGroupsTransfer", "PATH1_BROWSER_TRANSFER_QUERY_NOT_WRITTEN");
  const p101Text = await waitForGenerated(page, 8);
  invariant(p101Text.includes("請先列出乘法算式，再寫答案。"), "PATH1_BROWSER_TRANSFER_PROMPT_NOT_RENDERED");
  invariant(p101Text.includes("答："), "PATH1_BROWSER_TRANSFER_ANSWER_NOT_RENDERED");
  invariant((await page.locator("#path1-preview-meta").innerText()).includes("文字建模練習｜8 題｜含答案頁"), "PATH1_BROWSER_TRANSFER_PREVIEW_META_MISMATCH");

  await page.locator("#path1-block-select").selectOption("P1-03");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "arithmetic", "PATH1_BROWSER_UNSUPPORTED_BLOCK_NOT_NORMALIZED");
  invariant(await page.locator('#path1-practice-mode option[value="equalGroupsTransfer"]').isDisabled(), "PATH1_BROWSER_P103_TRANSFER_NOT_DISABLED");
  const p103Url = new URL(page.url());
  invariant(p103Url.searchParams.get("path1BlockId") === "P1-03", "PATH1_BROWSER_P103_QUERY_BLOCK_MISMATCH");
  invariant(p103Url.searchParams.get("practiceMode") === "arithmetic", "PATH1_BROWSER_P103_QUERY_MODE_NOT_NORMALIZED");
  invariant((await page.locator("#path1-status-panel").innerText()).includes("已切回算式練習"), "PATH1_BROWSER_NORMALIZATION_STATUS_MISSING");

  await page.locator("#path1-block-select").selectOption("P1-04");
  invariant(await page.locator('#path1-practice-mode option[value="equalGroupsTransfer"]').isDisabled(), "PATH1_BROWSER_P104_TRANSFER_NOT_DISABLED");

  await page.goto(`${baseUrl}/path1/?path1BlockId=P1-02&practiceMode=equalGroupsTransfer`, { waitUntil: "networkidle" });
  invariant(await page.locator("#path1-block-select").inputValue() === "P1-02", "PATH1_BROWSER_QUERY_BLOCK_RESTORE_FAILED");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "equalGroupsTransfer", "PATH1_BROWSER_QUERY_MODE_RESTORE_FAILED");
  await page.reload({ waitUntil: "networkidle" });
  invariant(await page.locator("#path1-block-select").inputValue() === "P1-02", "PATH1_BROWSER_REFRESH_BLOCK_RESTORE_FAILED");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "equalGroupsTransfer", "PATH1_BROWSER_REFRESH_MODE_RESTORE_FAILED");

  await page.locator("#path1-question-count").fill("8");
  const p102Text = await waitForGenerated(page, 8);
  invariant(p102Text.includes("請先列出乘法算式，再寫答案。"), "PATH1_BROWSER_P102_TRANSFER_PROMPT_NOT_RENDERED");
  invariant(p102Text.includes("答："), "PATH1_BROWSER_P102_TRANSFER_ANSWER_NOT_RENDERED");
  invariant(!(await page.locator("#path1-print-button").isDisabled()), "PATH1_BROWSER_PRINT_NOT_ENABLED_AFTER_VALID_GENERATION");

  invariant(pageErrors.length === 0, "PATH1_BROWSER_RUNTIME_ERROR", { pageErrors });

  process.stdout.write(`${JSON.stringify({
    schemaName: "Path1WordProblemEqualGroupsPublicCutoverBrowserV1",
    status: "PASS",
    page: "/path1/",
    defaultPracticeMode: "arithmetic",
    transferBlocks: ["P1-01", "P1-02"],
    unsupportedBlocksChecked: ["P1-03", "P1-04"],
    queryStateRoundTrip: true,
    refreshRestore: true,
    transferPromptRendered: true,
    answerKeyRendered: true,
    printEnabled: true,
    runtimeErrors: pageErrors,
  }, null, 2)}\n`);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
