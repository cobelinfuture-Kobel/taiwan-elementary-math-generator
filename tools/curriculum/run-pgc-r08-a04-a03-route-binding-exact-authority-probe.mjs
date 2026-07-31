import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { materializeMatrix } from "./build-pgc-r08-a01-legal-route-browser-matrix.mjs";
import { installDisabledCurrentValueSelectionPolicy } from "./pgc-r08-browser-control-selection-policy.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PLAN_PATH = path.join(ROOT, "data/curriculum/public-generation/PGC-R08-A04-A03.route-binding-exact-authority-probe-plan.json");
const FOCUSED_PLAN_PATH = path.join(ROOT, "data/curriculum/public-generation/PGC-R08-A04-A03.route-binding-focused-reproduction-plan.json");
const CAPACITY_PATH = path.join(ROOT, "data/curriculum/public-generation/generator_capacity_contract.json");
const SCOPE_PATH = path.join(ROOT, "data/curriculum/public-generation/PGC-R08-A00.public-generate-button-e2e-scope.json");
const OUT = path.join(ROOT, "tmp/pgc-r08-a04-a03-route-binding-exact-authority-probe");
const ORIGIN = "http://127.0.0.1:4199";
const S = Object.freeze({
  source: "#batch-a-source-select",
  mode: "#batch-a-selection-mode-select",
  kp: "#batch-a-knowledge-point-panel",
  pg: "#batch-a-pattern-group-panel",
  type: "#g5a-u08-question-mode",
  depth: "#g5a-u08-depth-mode",
  context: "#g5a-u08-context-mode",
  cap: "#g5a-u08-public-controls",
  count: "#batch-a-question-count-input",
});

function fail(code, details = {}) {
  const error = new Error(code);
  error.details = details;
  throw error;
}

async function waitForServer() {
  for (let index = 0; index < 160; index += 1) {
    try {
      if ((await fetch(`${ORIGIN}/index.html`, { cache: "no-store" })).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  fail("PGC_R08_A04_A03_EXACT_SITE_SERVER_TIMEOUT");
}

async function selectOption(page, selector, requestedValue) {
  if (requestedValue == null) return;
  await page.waitForFunction(
    ({ selector, requestedValue }) => [...(document.querySelector(selector)?.options ?? [])].some((option) => option.value === requestedValue),
    { selector, requestedValue },
    { timeout: 120000 },
  );
  await page.selectOption(selector, requestedValue);
  await page.waitForFunction(
    ({ selector, requestedValue }) => document.querySelector(selector)?.value === requestedValue,
    { selector, requestedValue },
    { timeout: 120000 },
  );
}

async function selectedKnowledgePoints(page) {
  return page.locator(`${S.kp} [data-knowledge-point-id][data-selected="true"]`).evaluateAll(
    (nodes) => nodes.map((node) => node.dataset.knowledgePointId).filter(Boolean).sort(),
  );
}

async function setKnowledgePoints(page, row) {
  if (row.selectionMode === "sourceUnit") return;
  const wanted = [...new Set(row.selectedKnowledgePointIds ?? [])].sort();
  await page.locator(`${S.kp} [data-knowledge-point-id]`).first().waitFor({ state: "visible", timeout: 120000 });
  for (const id of wanted) {
    const button = page.locator(`${S.kp} [data-knowledge-point-id="${id}"]`);
    await button.waitFor({ state: "visible", timeout: 120000 });
    if (await button.isDisabled()) fail("PGC_R08_A04_A03_EXACT_KP_NOT_SELECTABLE", { routeId: row.routeId, id });
    if (await button.getAttribute("data-selected") !== "true") await button.click();
  }
  for (let index = 0; index < 80; index += 1) {
    const extra = (await selectedKnowledgePoints(page)).find((id) => !wanted.includes(id));
    if (!extra) break;
    await page.locator(`${S.kp} [data-knowledge-point-id="${extra}"]`).click();
  }
  const actual = await selectedKnowledgePoints(page);
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
    fail("PGC_R08_A04_A03_EXACT_KP_SELECTION_MISMATCH", { routeId: row.routeId, wanted, actual });
  }
}

function authorityPatternGroupIds(capacityRoute) {
  if (Array.isArray(capacityRoute.publicPatternGroupIds) && capacityRoute.publicPatternGroupIds.length > 0) {
    return [...new Set(capacityRoute.publicPatternGroupIds.map(String).filter(Boolean))].sort();
  }
  const key = String(capacityRoute.publicPatternGroupKey ?? capacityRoute.patternGroupKey ?? "");
  const ids = key.split("|").map((value) => value.trim()).filter(Boolean);
  if (ids.length === 0) {
    fail("CAPACITY_ROUTE_PATTERN_GROUP_AUTHORITY_MISSING", {
      routeId: capacityRoute.routeId,
      availableKeys: Object.keys(capacityRoute).sort(),
    });
  }
  return [...new Set(ids)].sort();
}

async function snapshot(page, label, routeId, authorityIds) {
  return page.evaluate(({ selectors, label, routeId, authorityIds }) => {
    const routeIds = String(document.querySelector(selectors.count)?.dataset.capacityRouteIds ?? "")
      .split(",").map((value) => value.trim()).filter(Boolean);
    const groups = [...document.querySelectorAll(`${selectors.pg} [data-pattern-group-id]`)].map((node) => ({
      id: node.dataset.patternGroupId ?? null,
      selected: node.dataset.selected === "true" || node.getAttribute("aria-pressed") === "true",
      compatible: node.dataset.compatible === "true",
      disabled: Boolean(node.disabled) || node.getAttribute("aria-disabled") === "true",
      hidden: Boolean(node.hidden) || getComputedStyle(node).display === "none",
      dataset: { ...node.dataset },
    }));
    return {
      label,
      routeIds,
      targetRouteBound: routeIds.includes(routeId),
      sourceId: document.querySelector(selectors.source)?.value ?? null,
      selectionMode: document.querySelector(selectors.mode)?.value ?? null,
      questionType: document.querySelector(selectors.type)?.value ?? null,
      depthMode: document.querySelector(selectors.depth)?.value ?? null,
      contextMode: document.querySelector(selectors.context)?.value ?? null,
      capacityStatus: document.querySelector(selectors.count)?.dataset.capacityStatus ?? null,
      selectedPatternGroupIds: groups.filter((group) => group.selected).map((group) => group.id).filter(Boolean).sort(),
      authorityPatternGroupStates: authorityIds.map((id) => groups.find((group) => group.id === id) ?? ({ id, missing: true })),
      groups,
    };
  }, { selectors: S, label, routeId, authorityIds });
}

async function configure(page, row) {
  await selectOption(page, S.source, row.sourceId);
  await selectOption(page, S.mode, row.selectionMode);
  await setKnowledgePoints(page, row);
  await page.waitForFunction(
    ({ selector, sourceId }) => document.querySelector(selector)?.dataset.sourceId === sourceId,
    { selector: S.cap, sourceId: row.sourceId },
    { timeout: 120000 },
  );
  await selectOption(page, S.type, row.questionType);
  await setKnowledgePoints(page, row);
  await selectOption(page, S.depth, row.depthMode);
  await selectOption(page, S.context, row.contextMode);
  await page.waitForTimeout(80);
}

async function clickGroup(page, id) {
  const locator = page.locator(`${S.pg} [data-pattern-group-id="${id}"]`);
  if (await locator.count() === 0) fail("PGC_R08_A04_A03_EXACT_AUTHORITY_GROUP_MISSING", { id });
  if (await locator.isHidden()) fail("PGC_R08_A04_A03_EXACT_AUTHORITY_GROUP_HIDDEN", { id });
  if (await locator.isDisabled()) fail("PGC_R08_A04_A03_EXACT_AUTHORITY_GROUP_DISABLED", { id });
  await locator.click();
  await page.waitForTimeout(50);
}

async function probe(browser, row, capacityRoute, canary) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  const dispositions = [];
  const consoleErrors = [];
  const pageErrors = [];
  installDisabledCurrentValueSelectionPolicy(page, { onDisposition: (event) => dispositions.push(event) });
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  const screenshotPath = path.join(OUT, `${String(row.routeIndex).padStart(4, "0")}-${row.routeId}.png`);
  try {
    const authorityIds = authorityPatternGroupIds(capacityRoute);
    const response = await page.goto(`${ORIGIN}/index.html?pgcR08A04A03Exact=${row.routeIndex}-${Date.now()}`, {
      waitUntil: "networkidle",
      timeout: 120000,
    });
    if (!response?.ok()) fail("PGC_R08_A04_A03_EXACT_PUBLIC_UI_HTTP_FAILED", { status: response?.status() });
    await configure(page, row);
    const before = await snapshot(page, "before-exact-authority-set", row.routeId, authorityIds);
    const trace = [];
    const blockedAuthorityGroups = before.authorityPatternGroupStates.filter((group) =>
      group.missing === true || group.hidden === true || group.disabled === true || group.compatible !== true,
    );
    let classificationCode;
    let after = before;
    if (blockedAuthorityGroups.length > 0) {
      classificationCode = "EXACT_AUTHORITY_GROUP_NOT_SELECTABLE";
    } else {
      for (const id of before.selectedPatternGroupIds.filter((id) => !authorityIds.includes(id))) {
        await clickGroup(page, id);
        trace.push({ action: "DESELECT_EXTRA", patternGroupId: id, snapshot: await snapshot(page, "after-deselect-extra", row.routeId, authorityIds) });
      }
      let current = await snapshot(page, "after-extra-drain", row.routeId, authorityIds);
      for (const id of authorityIds.filter((id) => !current.selectedPatternGroupIds.includes(id))) {
        await clickGroup(page, id);
        trace.push({ action: "SELECT_AUTHORITY_GROUP", patternGroupId: id, snapshot: await snapshot(page, "after-select-authority-group", row.routeId, authorityIds) });
        current = trace.at(-1).snapshot;
      }
      await selectOption(page, S.type, row.questionType);
      await selectOption(page, S.depth, row.depthMode);
      await selectOption(page, S.context, row.contextMode);
      await page.waitForTimeout(100);
      after = await snapshot(page, "after-exact-authority-set", row.routeId, authorityIds);
      classificationCode = after.targetRouteBound
        ? "EXACT_AUTHORITY_SET_BINDS_TARGET"
        : "EXACT_AUTHORITY_SET_NOT_PROJECTED";
    }
    await page.screenshot({ path: screenshotPath, fullPage: true });
    return {
      ...canary,
      sourceId: row.sourceId,
      selectionMode: row.selectionMode,
      selectedKnowledgePointIds: row.selectedKnowledgePointIds,
      questionType: row.questionType,
      depthMode: row.depthMode,
      contextMode: row.contextMode,
      authorityPatternGroupIds: authorityIds,
      capacityRouteAuthority: {
        publicPatternGroupKey: capacityRoute.publicPatternGroupKey ?? null,
        patternGroupKey: capacityRoute.patternGroupKey ?? null,
        publicPatternGroupIds: capacityRoute.publicPatternGroupIds ?? null,
      },
      classificationCode,
      blockedAuthorityGroups,
      before,
      trace,
      after,
      policyDispositions: dispositions,
      consoleErrors,
      pageErrors,
      screenshotPath: path.relative(ROOT, screenshotPath),
      terminalStatus: "PASS_DIAGNOSTIC_TERMINAL",
    };
  } catch (error) {
    try { await page.screenshot({ path: screenshotPath, fullPage: true }); } catch {}
    return {
      ...canary,
      routeIndex: row.routeIndex,
      routeId: row.routeId,
      classificationCode: error.message === "CAPACITY_ROUTE_PATTERN_GROUP_AUTHORITY_MISSING"
        ? "CAPACITY_ROUTE_PATTERN_GROUP_AUTHORITY_MISSING"
        : "SYSTEM_FAILURE",
      errorCode: error.message,
      details: error.details ?? null,
      consoleErrors,
      pageErrors,
      screenshotPath: path.relative(ROOT, screenshotPath),
      terminalStatus: error.message === "CAPACITY_ROUTE_PATTERN_GROUP_AUTHORITY_MISSING"
        ? "PASS_DIAGNOSTIC_TERMINAL"
        : "SYSTEM_FAILURE",
    };
  } finally {
    await page.close();
  }
}

const plan = JSON.parse(await readFile(PLAN_PATH, "utf8"));
const focusedPlan = JSON.parse(await readFile(FOCUSED_PLAN_PATH, "utf8"));
const capacityRaw = await readFile(CAPACITY_PATH, "utf8");
const capacity = JSON.parse(capacityRaw);
const scope = JSON.parse(await readFile(SCOPE_PATH, "utf8"));
const matrix = materializeMatrix(capacity, scope, capacityRaw);
const matrixById = new Map(matrix.rows.map((row) => [row.routeId, row]));
const capacityById = new Map(capacity.routes.map((row) => [row.routeId, row]));
const entries = focusedPlan.canaries.map((canary) => {
  const row = matrixById.get(canary.routeId);
  const capacityRoute = capacityById.get(canary.routeId);
  if (!row || !capacityRoute || row.routeIndex !== canary.routeIndex) {
    fail("PGC_R08_A04_A03_EXACT_CANARY_AUTHORITY_DRIFT", { canary, rowIndex: row?.routeIndex ?? null });
  }
  return { canary, row, capacityRoute };
});

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
const server = spawn(process.execPath, [path.join(ROOT, "tools/site/serve-site.js")], {
  cwd: ROOT,
  env: { ...process.env, SITE_PORT: "4199", SITE_HOST: "127.0.0.1" },
  stdio: ["ignore", "pipe", "pipe"],
});
let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const results = [];
  for (const entry of entries) results.push(await probe(browser, entry.row, entry.capacityRoute, entry.canary));
  const classificationCounts = Object.fromEntries(plan.classificationCodes.map((code) => [
    code,
    results.filter((row) => row.classificationCode === code).length,
  ]));
  const report = {
    schemaName: "PGCR08A04A03RouteBindingExactAuthorityProbeReportV1",
    schemaVersion: 1,
    programId: plan.programId,
    taskId: plan.taskId,
    status: results.every((row) => row.terminalStatus === "PASS_DIAGNOSTIC_TERMINAL")
      ? "PASS_FOUR_EXACT_AUTHORITY_CANARIES_CLASSIFIED"
      : "FAIL_EXACT_AUTHORITY_PROBE",
    summary: {
      canaryCount: results.length,
      terminalCanaryCount: results.filter((row) => row.terminalStatus === "PASS_DIAGNOSTIC_TERMINAL").length,
      systemFailureCount: results.filter((row) => row.terminalStatus === "SYSTEM_FAILURE").length,
      screenshotCount: results.filter((row) => row.screenshotPath).length,
      ...classificationCounts,
      generationInvoked: false,
      productMutationCount: 0,
    },
    results,
  };
  await writeFile(path.join(OUT, "report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ status: report.status, summary: report.summary }, null, 2));
  if (report.status !== "PASS_FOUR_EXACT_AUTHORITY_CANARIES_CLASSIFIED") {
    fail("PGC_R08_A04_A03_EXACT_AUTHORITY_PROBE_NOT_TERMINAL", report.summary);
  }
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}
