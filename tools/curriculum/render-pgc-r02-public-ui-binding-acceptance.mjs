import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const siteRoot = path.join(root, "site");
const outputDir = path.join(root, "tmp/pgc-r02-public-ui-binding-acceptance");
fs.mkdirSync(outputDir, { recursive: true });

const mime = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
]);

function staticPath(urlPath) {
  const pathname = decodeURIComponent(new URL(urlPath, "http://localhost").pathname);
  const relative = pathname === "/"
    ? "index.html"
    : pathname === "/pixel/"
      ? "pixel/index.html"
      : pathname.replace(/^\/+/, "");
  const resolved = path.resolve(siteRoot, relative);
  if (!resolved.startsWith(`${siteRoot}${path.sep}`) && resolved !== siteRoot) return null;
  return resolved;
}

const server = http.createServer((request, response) => {
  const filePath = staticPath(request.url ?? "/");
  if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("not found");
    return;
  }
  response.writeHead(200, { "content-type": mime.get(path.extname(filePath)) ?? "application/octet-stream" });
  fs.createReadStream(filePath).pipe(response);
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
const baseUrl = `http://127.0.0.1:${address.port}`;

const browser = await chromium.launch({ headless: true });
const findings = [];
const APPLICATION_SOURCE_ID = "g4b_u01_4b01";
const APPLICATION_KP_ID = "kp_g4b_u01_multiplicative_comparison_word_problem";

async function collectPageErrors(page) {
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  return { consoleErrors, pageErrors };
}

async function waitClassicReady(page) {
  await page.waitForFunction(() => document.querySelectorAll("#batch-a-source-select option").length >= 26);
  await page.selectOption("#batch-a-source-select", APPLICATION_SOURCE_ID);
  await page.selectOption("#batch-a-selection-mode-select", "singleKnowledgePoint");
  await page.waitForSelector(`[data-knowledge-point-id="${APPLICATION_KP_ID}"]`);
  await page.click(`[data-knowledge-point-id="${APPLICATION_KP_ID}"]`);
  await page.waitForFunction((kpId) => {
    const selected = document.querySelector(`[data-knowledge-point-id="${kpId}"]`);
    const section = document.getElementById("g5a-u08-public-controls");
    return selected?.dataset.selected === "true"
      && section?.dataset.visible === "true"
      && section?.dataset.blocked === "false";
  }, APPLICATION_KP_ID);
  await page.waitForFunction(() => document.querySelectorAll("#g5a-u08-question-mode option").length > 0);
}

async function inspectClassicSurface({ surfaceId, route, screenshotName }) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const errors = await collectPageErrors(page);
  await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
  await waitClassicReady(page);
  const finding = await page.evaluate(() => {
    const questionTypeOptions = [...document.querySelectorAll("#g5a-u08-question-mode option")].map((option) => option.value);
    const visibleGroups = [...document.querySelectorAll("#batch-a-pattern-group-panel [data-pattern-group-id]")]
      .filter((button) => !button.hidden && !button.disabled)
      .map((button) => button.dataset.patternGroupId);
    const incompatibleVisible = [...document.querySelectorAll("#batch-a-pattern-group-panel [data-pattern-group-id]")]
      .filter((button) => !button.hidden && button.dataset.compatible !== "true")
      .map((button) => button.dataset.patternGroupId);
    const countInput = document.getElementById("batch-a-question-count-input");
    const section = document.getElementById("g5a-u08-public-controls");
    return {
      questionTypeOptions,
      selectedQuestionType: document.getElementById("g5a-u08-question-mode")?.value,
      visibleGroups,
      incompatibleVisible,
      questionCountMax: Number(countInput?.max),
      questionCountValue: Number(countInput?.value),
      capacityStatus: countInput?.dataset.capacityStatus,
      bindingSurfaceId: section?.dataset.surfaceId,
      blocked: section?.dataset.blocked,
      selectedKnowledgePoint: document.querySelector(`[data-knowledge-point-id="${"kp_g4b_u01_multiplicative_comparison_word_problem"}"]`)?.dataset.selected,
    };
  });
  await page.screenshot({ path: path.join(outputDir, screenshotName), fullPage: true });
  await page.close();
  findings.push({ surfaceId, route, ...finding, ...errors });
}

async function inspectPixel() {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } });
  const errors = await collectPageErrors(page);
  await page.goto(`${baseUrl}/pixel/`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.querySelectorAll("#pixel-source-select option").length >= 26);
  await page.selectOption("#pixel-source-select", APPLICATION_SOURCE_ID);
  await page.selectOption("#pixel-selection-mode-select", "singleKnowledgePoint");
  await page.waitForSelector(`[data-knowledge-point-id="${APPLICATION_KP_ID}"]`);
  await page.click(`[data-knowledge-point-id="${APPLICATION_KP_ID}"]`);
  await page.waitForFunction((kpId) => document.body.dataset.pixelSelectedKnowledgePointIds?.split(",").includes(kpId), APPLICATION_KP_ID);
  await page.waitForFunction(() => document.body.dataset.pixelCapabilityBindingStatus === "ready");
  const finding = await page.evaluate(() => {
    const questionTypeOptions = [...document.querySelectorAll("#pixel-g5a-question-mode option")].map((option) => option.value);
    const visibleGroups = [...document.querySelectorAll("#pixel-pattern-group-panel [data-pattern-group-id]")]
      .filter((button) => !button.hidden && !button.disabled)
      .map((button) => button.dataset.patternGroupId);
    const incompatibleVisible = [...document.querySelectorAll("#pixel-pattern-group-panel [data-pattern-group-id]")]
      .filter((button) => !button.hidden && button.dataset.compatible !== "true")
      .map((button) => button.dataset.patternGroupId);
    const countInput = document.getElementById("pixel-question-count");
    return {
      questionTypeOptions,
      selectedQuestionType: document.getElementById("pixel-g5a-question-mode")?.value,
      visibleGroups,
      incompatibleVisible,
      questionCountMax: Number(countInput?.max),
      questionCountValue: Number(countInput?.value),
      capacityStatus: countInput?.dataset.capacityStatus,
      bindingSurfaceId: "PIXEL",
      blocked: document.body.dataset.pixelCapabilityBindingStatus === "blocked" ? "true" : "false",
      selectedKnowledgePoint: document.body.dataset.pixelSelectedKnowledgePointIds,
    };
  });
  await page.screenshot({ path: path.join(outputDir, "pixel-application-kp.png"), fullPage: true });
  await page.close();
  findings.push({ surfaceId: "PIXEL", route: "/pixel/", ...finding, ...errors });
}

try {
  await inspectClassicSurface({ surfaceId: "CLASSIC", route: "/", screenshotName: "classic-application-kp.png" });
  await inspectClassicSurface({ surfaceId: "FALLBACK_404", route: "/404.html", screenshotName: "fallback-application-kp.png" });
  await inspectPixel();
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

const optionSignatures = findings.map((finding) => JSON.stringify(finding.questionTypeOptions));
const failures = [];
for (const finding of findings) {
  if (finding.blocked !== "false") failures.push(`${finding.surfaceId}:binding_blocked`);
  if (!finding.questionTypeOptions.includes("application")) failures.push(`${finding.surfaceId}:application_option_missing`);
  if (finding.questionTypeOptions.includes("numeric")) failures.push(`${finding.surfaceId}:numeric_exposed_for_application_only_kp`);
  if (finding.visibleGroups.length === 0) failures.push(`${finding.surfaceId}:compatible_form_missing`);
  if (finding.incompatibleVisible.length > 0) failures.push(`${finding.surfaceId}:incompatible_form_visible`);
  if (finding.questionCountMax !== 20 || finding.questionCountValue > 20) failures.push(`${finding.surfaceId}:unsafe_question_count`);
  if (finding.capacityStatus !== "fail-closed-pending-pgc-r03") failures.push(`${finding.surfaceId}:capacity_status_missing`);
  if (finding.consoleErrors.length > 0) failures.push(`${finding.surfaceId}:console_errors`);
  if (finding.pageErrors.length > 0) failures.push(`${finding.surfaceId}:page_errors`);
}
if (new Set(optionSignatures).size !== 1) failures.push("surface_option_parity_mismatch");

const report = {
  schemaName: "PgcR02PublicUiBindingChromiumAcceptanceV1",
  programId: "PUBLIC_KP_GENERATION_CONFORMANCE_V1",
  taskId: "PGC-R02_KnowledgePointDrivenUICapabilityBinding",
  status: failures.length === 0 ? "PASS" : "FAIL",
  sourceId: APPLICATION_SOURCE_ID,
  knowledgePointId: APPLICATION_KP_ID,
  surfaceCount: findings.length,
  findings,
  failures,
};
fs.writeFileSync(path.join(outputDir, "pgc-r02-public-ui-binding-acceptance-report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`PGC_R02_CHROMIUM_ACCEPTANCE=${JSON.stringify(report)}`);
if (failures.length > 0) throw new Error(`PGC_R02_CHROMIUM_ACCEPTANCE_FAILED:${JSON.stringify(failures)}`);
