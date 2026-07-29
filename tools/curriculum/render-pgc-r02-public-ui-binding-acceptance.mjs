import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

import { CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS } from "../../site/modules/curriculum/batch-a/source-units.js";
import { listVisibleBatchAKnowledgePoints } from "../../site/modules/curriculum/registry/batch-a-selector-p03f13-extension.js";
import { resolvePublicUiCapabilityBinding } from "../../site/modules/curriculum/public/public-ui-capability-binding.js";

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

function uniqueSorted(values) {
  return [...new Set(values)].sort();
}

function findApplicationWitness() {
  const sourceById = new Map(CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.map((source) => [source.sourceId, source]));
  for (const knowledgePoint of listVisibleBatchAKnowledgePoints()) {
    const source = sourceById.get(knowledgePoint.sourceId);
    if (!source) continue;
    const base = resolvePublicUiCapabilityBinding({
      sourceId: knowledgePoint.sourceId,
      selectionMode: "singleKnowledgePoint",
      selectedKnowledgePointIds: [knowledgePoint.knowledgePointId],
    });
    if (base.blocked || !base.availableQuestionTypeOptions.some((option) => option.value === "application")) continue;
    const application = resolvePublicUiCapabilityBinding({
      sourceId: knowledgePoint.sourceId,
      selectionMode: "singleKnowledgePoint",
      selectedKnowledgePointIds: [knowledgePoint.knowledgePointId],
      requestedQuestionType: "application",
    });
    const allGroupIds = uniqueSorted(base.availableQuestionTypeOptions
      .filter((option) => option.value !== "pbl")
      .flatMap((option) => resolvePublicUiCapabilityBinding({
        sourceId: knowledgePoint.sourceId,
        selectionMode: "singleKnowledgePoint",
        selectedKnowledgePointIds: [knowledgePoint.knowledgePointId],
        requestedQuestionType: option.value,
      }).compatiblePatternGroupIds));
    const applicationGroupIds = uniqueSorted(application.compatiblePatternGroups
      .filter((group) => group.effectiveQuestionType === "application")
      .map((group) => group.patternGroupId));
    if (application.blocked || applicationGroupIds.length === 0 || allGroupIds.length < 2) continue;
    return Object.freeze({
      source,
      knowledgePoint,
      expectedQuestionTypeOptions: Object.freeze(base.availableQuestionTypeOptions.map((option) => option.value)),
      expectedApplicationPatternGroupIds: Object.freeze(applicationGroupIds),
      allPatternGroupIds: Object.freeze(allGroupIds),
    });
  }
  throw new Error("PGC_R02_APPLICATION_BROWSER_WITNESS_MISSING");
}

const witness = findApplicationWitness();
const APPLICATION_SOURCE_ID = witness.source.sourceId;
const APPLICATION_KP_ID = witness.knowledgePoint.knowledgePointId;
const EXPECTED_QUESTION_TYPES = [...witness.expectedQuestionTypeOptions];
const EXPECTED_APPLICATION_GROUP_IDS = [...witness.expectedApplicationPatternGroupIds];

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

function collectPageErrors(page) {
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  return { consoleErrors, pageErrors };
}

async function waitForExpectedGroups(page, panelSelector) {
  await page.waitForFunction(({ panelSelector: selector, expected }) => {
    const actual = [...document.querySelectorAll(`${selector} [data-pattern-group-id]`)]
      .filter((button) => !button.hidden && !button.disabled)
      .map((button) => button.dataset.patternGroupId)
      .sort();
    return JSON.stringify(actual) === JSON.stringify([...expected].sort());
  }, { panelSelector, expected: EXPECTED_APPLICATION_GROUP_IDS });
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
  await page.waitForFunction(() => [...document.querySelectorAll("#g5a-u08-question-mode option")].some((option) => option.value === "application"));
  await page.selectOption("#g5a-u08-question-mode", "application");
  await page.waitForFunction(() => document.getElementById("g5a-u08-question-mode")?.value === "application"
    && document.getElementById("g5a-u08-public-controls")?.dataset.blocked === "false");
  await waitForExpectedGroups(page, "#batch-a-pattern-group-panel");
}

async function inspectClassicSurface({ surfaceId, route, screenshotName }) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const errors = collectPageErrors(page);
  let finding = { surfaceId, route, runtimeError: null };
  try {
    await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
    await waitClassicReady(page);
    finding = {
      ...finding,
      ...(await page.evaluate((kpId) => {
        const questionTypeOptions = [...document.querySelectorAll("#g5a-u08-question-mode option")].map((option) => option.value);
        const visibleGroups = [...document.querySelectorAll("#batch-a-pattern-group-panel [data-pattern-group-id]")]
          .filter((button) => !button.hidden && !button.disabled)
          .map((button) => button.dataset.patternGroupId)
          .sort();
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
          selectedKnowledgePoint: document.querySelector(`[data-knowledge-point-id="${kpId}"]`)?.dataset.selected,
        };
      }, APPLICATION_KP_ID)),
    };
  } catch (error) {
    finding.runtimeError = String(error?.stack ?? error);
  } finally {
    await page.screenshot({ path: path.join(outputDir, screenshotName), fullPage: true }).catch(() => {});
    await page.close();
  }
  findings.push({ ...finding, ...errors });
}

async function inspectPixel() {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } });
  const errors = collectPageErrors(page);
  let finding = { surfaceId: "PIXEL", route: "/pixel/", runtimeError: null };
  try {
    await page.goto(`${baseUrl}/pixel/`, { waitUntil: "networkidle" });
    await page.waitForSelector(`#pixel-grade-select option[value="${witness.source.grade}"]`);
    await page.selectOption("#pixel-grade-select", String(witness.source.grade));
    await page.waitForSelector(`#pixel-semester-select option[value="${witness.source.semester}"]`);
    await page.selectOption("#pixel-semester-select", witness.source.semester);
    await page.waitForSelector(`#pixel-source-select option[value="${APPLICATION_SOURCE_ID}"]`);
    await page.selectOption("#pixel-source-select", APPLICATION_SOURCE_ID);
    await page.selectOption("#pixel-selection-mode-select", "singleKnowledgePoint");
    await page.waitForSelector(`[data-knowledge-point-id="${APPLICATION_KP_ID}"]`);
    await page.click(`[data-knowledge-point-id="${APPLICATION_KP_ID}"]`);
    await page.waitForFunction((kpId) => document.body.dataset.pixelSelectedKnowledgePointIds?.split(",").includes(kpId), APPLICATION_KP_ID);
    await page.waitForFunction(() => document.body.dataset.pixelCapabilityBindingStatus === "ready");
    await page.waitForFunction(() => [...document.querySelectorAll("#pixel-g5a-question-mode option")].some((option) => option.value === "application"));
    await page.selectOption("#pixel-g5a-question-mode", "application");
    await page.waitForFunction(() => document.getElementById("pixel-g5a-question-mode")?.value === "application"
      && document.body.dataset.pixelCapabilityBindingStatus === "ready");
    await waitForExpectedGroups(page, "#pixel-pattern-group-panel");
    finding = {
      ...finding,
      ...(await page.evaluate(() => {
        const questionTypeOptions = [...document.querySelectorAll("#pixel-g5a-question-mode option")].map((option) => option.value);
        const visibleGroups = [...document.querySelectorAll("#pixel-pattern-group-panel [data-pattern-group-id]")]
          .filter((button) => !button.hidden && !button.disabled)
          .map((button) => button.dataset.patternGroupId)
          .sort();
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
      })),
    };
  } catch (error) {
    finding.runtimeError = String(error?.stack ?? error);
  } finally {
    await page.screenshot({ path: path.join(outputDir, "pixel-application-kp.png"), fullPage: true }).catch(() => {});
    await page.close();
  }
  findings.push({ ...finding, ...errors });
}

try {
  await inspectClassicSurface({ surfaceId: "CLASSIC", route: "/", screenshotName: "classic-application-kp.png" });
  await inspectClassicSurface({ surfaceId: "FALLBACK_404", route: "/404.html", screenshotName: "fallback-application-kp.png" });
  await inspectPixel();
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

const optionSignatures = findings.map((finding) => JSON.stringify(finding.questionTypeOptions ?? []));
const failures = [];
for (const finding of findings) {
  if (finding.runtimeError) failures.push(`${finding.surfaceId}:runtime_error`);
  if (finding.blocked !== "false") failures.push(`${finding.surfaceId}:binding_blocked`);
  if (JSON.stringify(finding.questionTypeOptions ?? []) !== JSON.stringify(EXPECTED_QUESTION_TYPES)) failures.push(`${finding.surfaceId}:question_type_options_mismatch`);
  if (finding.selectedQuestionType !== "application") failures.push(`${finding.surfaceId}:application_not_selected`);
  if (JSON.stringify(finding.visibleGroups ?? []) !== JSON.stringify(EXPECTED_APPLICATION_GROUP_IDS)) failures.push(`${finding.surfaceId}:application_form_filter_mismatch`);
  if ((finding.incompatibleVisible ?? []).length > 0) failures.push(`${finding.surfaceId}:incompatible_form_visible`);
  if (finding.questionCountMax !== 20 || finding.questionCountValue > 20) failures.push(`${finding.surfaceId}:unsafe_question_count`);
  if (finding.capacityStatus !== "fail-closed-pending-pgc-r03") failures.push(`${finding.surfaceId}:capacity_status_missing`);
  if (finding.consoleErrors.length > 0) failures.push(`${finding.surfaceId}:console_errors`);
  if (finding.pageErrors.length > 0) failures.push(`${finding.surfaceId}:page_errors`);
}
if (new Set(optionSignatures).size !== 1) failures.push("surface_option_parity_mismatch");

const report = {
  schemaName: "PgcR02PublicUiBindingChromiumAcceptanceV2",
  programId: "PUBLIC_KP_GENERATION_CONFORMANCE_V1",
  taskId: "PGC-R02_KnowledgePointDrivenUICapabilityBinding",
  status: failures.length === 0 ? "PASS" : "FAIL",
  sourceId: APPLICATION_SOURCE_ID,
  knowledgePointId: APPLICATION_KP_ID,
  expectedQuestionTypeOptions: EXPECTED_QUESTION_TYPES,
  expectedApplicationPatternGroupIds: EXPECTED_APPLICATION_GROUP_IDS,
  witnessAllPatternGroupIds: witness.allPatternGroupIds,
  surfaceCount: findings.length,
  findings,
  failures,
};
fs.writeFileSync(path.join(outputDir, "pgc-r02-public-ui-binding-acceptance-report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`PGC_R02_CHROMIUM_ACCEPTANCE=${JSON.stringify(report)}`);
if (failures.length > 0) throw new Error(`PGC_R02_CHROMIUM_ACCEPTANCE_FAILED:${JSON.stringify(failures)}`);
