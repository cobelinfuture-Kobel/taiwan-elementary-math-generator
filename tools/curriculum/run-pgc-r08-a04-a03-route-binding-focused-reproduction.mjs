import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { materializeMatrix } from "./build-pgc-r08-a01-legal-route-browser-matrix.mjs";
import { installDisabledCurrentValueSelectionPolicy } from "./pgc-r08-browser-control-selection-policy.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PLAN_PATH = path.join(ROOT, "data/curriculum/public-generation/PGC-R08-A04-A03.route-binding-focused-reproduction-plan.json");
const CAPACITY_PATH = path.join(ROOT, "data/curriculum/public-generation/generator_capacity_contract.json");
const A00_PATH = path.join(ROOT, "data/curriculum/public-generation/PGC-R08-A00.public-generate-button-e2e-scope.json");
const OUT = path.join(ROOT, "tmp/pgc-r08-a04-a03-route-binding-focused-reproduction");
const ORIGIN = "http://127.0.0.1:4198";
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
  fail("PGC_R08_A04_A03_SITE_SERVER_TIMEOUT");
}

async function selectedKnowledgePoints(page) {
  return page.locator(`${S.kp} [data-knowledge-point-id][data-selected="true"]`).evaluateAll(
    (nodes) => nodes.map((node) => node.dataset.knowledgePointId).filter(Boolean).sort(),
  );
}

async function captureSnapshot(page, label, targetRouteId) {
  return page.evaluate(({ selectors, label, targetRouteId }) => {
    const value = (selector) => document.querySelector(selector)?.value ?? null;
    const routeIds = String(document.querySelector(selectors.count)?.dataset.capacityRouteIds ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const knowledgePoints = [...document.querySelectorAll(`${selectors.kp} [data-knowledge-point-id]`)].map((node) => ({
      id: node.dataset.knowledgePointId ?? null,
      selected: node.dataset.selected === "true",
      disabled: Boolean(node.disabled) || node.getAttribute("aria-disabled") === "true",
      hidden: Boolean(node.hidden) || getComputedStyle(node).display === "none",
      dataset: { ...node.dataset },
    }));
    const patternGroups = [...document.querySelectorAll(`${selectors.pg} [data-pattern-group-id]`)].map((node) => ({
      id: node.dataset.patternGroupId ?? null,
      selected: node.dataset.selected === "true",
      compatible: node.dataset.compatible === "true",
      disabled: Boolean(node.disabled) || node.getAttribute("aria-disabled") === "true",
      hidden: Boolean(node.hidden) || getComputedStyle(node).display === "none",
      dataset: { ...node.dataset },
    }));
    return {
      label,
      sourceId: value(selectors.source),
      selectionMode: value(selectors.mode),
      questionType: value(selectors.type),
      depthMode: value(selectors.depth),
      contextMode: value(selectors.context),
      publicControlSourceId: document.querySelector(selectors.cap)?.dataset.sourceId ?? null,
      capacityStatus: document.querySelector(selectors.count)?.dataset.capacityStatus ?? null,
      capacityRouteIds: routeIds,
      targetRouteBound: routeIds.includes(targetRouteId),
      selectedKnowledgePointIds: knowledgePoints.filter((row) => row.selected).map((row) => row.id).sort(),
      knowledgePoints,
      patternGroups,
    };
  }, { selectors: S, label, targetRouteId });
}

async function selectOption(page, selector, requestedValue, snapshots, label, routeId) {
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
  snapshots.push(await captureSnapshot(page, label, routeId));
}

async function setKnowledgePoints(page, row, snapshots) {
  if (row.selectionMode === "sourceUnit") {
    snapshots.push(await captureSnapshot(page, "knowledge-points-source-unit-noop", row.routeId));
    return;
  }
  const wanted = [...new Set(row.selectedKnowledgePointIds)].sort();
  await page.locator(`${S.kp} [data-knowledge-point-id]`).first().waitFor({ state: "visible", timeout: 120000 });
  for (const id of wanted) {
    const button = page.locator(`${S.kp} [data-knowledge-point-id="${id}"]`);
    await button.waitFor({ state: "visible", timeout: 120000 });
    if (await button.isDisabled()) fail("PGC_R08_A04_A03_KP_NOT_SELECTABLE", { routeId: row.routeId, id });
    if (await button.getAttribute("data-selected") !== "true") await button.click();
  }
  for (let index = 0; index < 80; index += 1) {
    const extra = (await selectedKnowledgePoints(page)).find((id) => !wanted.includes(id));
    if (!extra) break;
    await page.locator(`${S.kp} [data-knowledge-point-id="${extra}"]`).click();
  }
  const actual = await selectedKnowledgePoints(page);
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
    fail("PGC_R08_A04_A03_KP_SELECTION_MISMATCH", { routeId: row.routeId, wanted, actual });
  }
  snapshots.push(await captureSnapshot(page, "knowledge-points-settled", row.routeId));
}

async function reproduceBinding(page, row) {
  const snapshots = [];
  const policyDispositions = [];
  installDisabledCurrentValueSelectionPolicy(page, {
    onDisposition: (event) => policyDispositions.push(event),
  });
  await page.goto(`${ORIGIN}/index.html?pgcR08A04A03=${row.routeIndex}-${Date.now()}`, {
    waitUntil: "networkidle",
    timeout: 120000,
  });
  snapshots.push(await captureSnapshot(page, "initial", row.routeId));
  await selectOption(page, S.source, row.sourceId, snapshots, "source-settled", row.routeId);
  await selectOption(page, S.mode, row.selectionMode, snapshots, "selection-mode-settled", row.routeId);
  await setKnowledgePoints(page, row, snapshots);
  await page.waitForFunction(
    ({ selector, sourceId }) => document.querySelector(selector)?.dataset.sourceId === sourceId,
    { selector: S.cap, sourceId: row.sourceId },
    { timeout: 120000 },
  );
  snapshots.push(await captureSnapshot(page, "public-controls-source-settled", row.routeId));
  await selectOption(page, S.type, row.questionType, snapshots, "question-type-settled", row.routeId);
  await page.waitForTimeout(40);
  await setKnowledgePoints(page, row, snapshots);
  if (row.depthMode !== null) await selectOption(page, S.depth, row.depthMode, snapshots, "depth-settled", row.routeId);
  if (row.contextMode !== null) await selectOption(page, S.context, row.contextMode, snapshots, "context-settled", row.routeId);

  for (let index = 0; index < 80; index += 1) {
    const incompatible = page.locator(`${S.pg} [data-pattern-group-id][data-selected="true"]:not([data-compatible="true"]):not([hidden])`).first();
    if (await incompatible.count() === 0) break;
    if (await incompatible.isDisabled()) {
      fail("PGC_R08_A04_A03_INCOMPATIBLE_PATTERN_GROUP_LOCKED", {
        routeId: row.routeId,
        patternGroupId: await incompatible.getAttribute("data-pattern-group-id"),
      });
    }
    await incompatible.click();
    await page.waitForTimeout(20);
    snapshots.push(await captureSnapshot(page, `incompatible-drained-${index + 1}`, row.routeId));
  }

  let targetFirstSeenAt = snapshots.findIndex((snapshot) => snapshot.targetRouteBound);
  let targetLostAt = -1;
  for (let index = 0; index < 120; index += 1) {
    const current = await captureSnapshot(page, `binding-loop-${index}`, row.routeId);
    snapshots.push(current);
    if (current.targetRouteBound) {
      if (targetFirstSeenAt < 0) targetFirstSeenAt = snapshots.length - 1;
      break;
    }
    const button = page.locator(`${S.pg} [data-pattern-group-id][data-compatible="true"][data-selected="false"]:not([hidden]):not([disabled])`).first();
    if (await button.count() === 0) break;
    const patternGroupId = await button.getAttribute("data-pattern-group-id");
    await button.click();
    await page.waitForTimeout(30);
    const after = await captureSnapshot(page, `compatible-selected-${patternGroupId}`, row.routeId);
    snapshots.push(after);
    if (targetFirstSeenAt >= 0 && !after.targetRouteBound && targetLostAt < 0) targetLostAt = snapshots.length - 1;
    if (after.targetRouteBound && targetFirstSeenAt < 0) targetFirstSeenAt = snapshots.length - 1;
  }

  const finalSnapshot = snapshots.at(-1);
  const anyRouteIds = snapshots.some((snapshot) => snapshot.capacityRouteIds.length > 0);
  let classificationCode;
  if (finalSnapshot.targetRouteBound) classificationCode = "TARGET_ROUTE_ALREADY_BOUND";
  else if (targetFirstSeenAt >= 0 || targetLostAt >= 0) classificationCode = "GREEDY_PATTERN_GROUP_OVERSHOOT";
  else if (!anyRouteIds) classificationCode = "PUBLIC_CAPACITY_BINDING_EMPTY";
  else classificationCode = "TARGET_ROUTE_NOT_PROJECTED_BY_PUBLIC_BINDING";

  return {
    routeIndex: row.routeIndex,
    routeId: row.routeId,
    sourceId: row.sourceId,
    selectionMode: row.selectionMode,
    selectedKnowledgePointIds: row.selectedKnowledgePointIds,
    questionType: row.questionType,
    depthMode: row.depthMode,
    contextMode: row.contextMode,
    classificationCode,
    targetFirstSeenAt,
    targetLostAt,
    finalCapacityRouteIds: finalSnapshot.capacityRouteIds,
    finalSelectedPatternGroupIds: finalSnapshot.patternGroups.filter((item) => item.selected).map((item) => item.id),
    compatiblePatternGroupIds: finalSnapshot.patternGroups.filter((item) => item.compatible && !item.hidden).map((item) => item.id),
    policyDispositions,
    snapshots,
  };
}

const plan = JSON.parse(await readFile(PLAN_PATH, "utf8"));
const capacityRaw = await readFile(CAPACITY_PATH, "utf8");
const matrix = materializeMatrix(
  JSON.parse(capacityRaw),
  JSON.parse(await readFile(A00_PATH, "utf8")),
  capacityRaw,
);
const rows = plan.canaries.map((canary) => {
  const row = matrix.rows.find((candidate) => candidate.routeIndex === canary.routeIndex && candidate.routeId === canary.routeId);
  if (!row) fail("PGC_R08_A04_A03_CANARY_NOT_IN_MATRIX", canary);
  return row;
});

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
const server = spawn(process.execPath, [path.join(ROOT, "tools/site/serve-site.js")], {
  cwd: ROOT,
  env: { ...process.env, SITE_PORT: "4198", SITE_HOST: "127.0.0.1" },
  stdio: ["ignore", "pipe", "pipe"],
});

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const results = [];
  for (const row of rows) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    try {
      const result = await reproduceBinding(page, row);
      results.push({ ...result, terminalStatus: "PASS_DIAGNOSTIC_TERMINAL" });
      await writeFile(path.join(OUT, `${String(row.routeIndex).padStart(4, "0")}-${row.routeId}.json`), `${JSON.stringify(result, null, 2)}\n`);
      await page.screenshot({ path: path.join(OUT, `${String(row.routeIndex).padStart(4, "0")}-${row.routeId}.png`), fullPage: true });
    } catch (error) {
      const result = {
        routeIndex: row.routeIndex,
        routeId: row.routeId,
        terminalStatus: "SYSTEM_FAILURE",
        errorCode: error.message,
        details: error.details ?? null,
      };
      results.push(result);
      await writeFile(path.join(OUT, `${String(row.routeIndex).padStart(4, "0")}-${row.routeId}.json`), `${JSON.stringify(result, null, 2)}\n`);
      try {
        await page.screenshot({ path: path.join(OUT, `${String(row.routeIndex).padStart(4, "0")}-${row.routeId}.png`), fullPage: true });
      } catch {}
    } finally {
      await page.close();
    }
  }

  const classificationCounts = Object.fromEntries(
    plan.classificationCodes.map((code) => [code, results.filter((row) => row.classificationCode === code || row.terminalStatus === code).length]),
  );
  const report = {
    schemaName: "PGCR08A04A03RouteBindingFocusedReproductionReportV1",
    schemaVersion: 1,
    programId: plan.programId,
    taskId: plan.taskId,
    status: results.every((row) => row.terminalStatus === "PASS_DIAGNOSTIC_TERMINAL")
      ? "PASS_FOUR_ROUTE_BINDING_CANARIES_CLASSIFIED"
      : "FAIL_ROUTE_BINDING_DIAGNOSTIC_SYSTEM_FAILURE",
    summary: {
      canaryCount: rows.length,
      terminalCanaryCount: results.filter((row) => row.terminalStatus === "PASS_DIAGNOSTIC_TERMINAL").length,
      systemFailureCount: results.filter((row) => row.terminalStatus === "SYSTEM_FAILURE").length,
      ...classificationCounts,
    },
    results,
  };
  await writeFile(path.join(OUT, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ status: report.status, summary: report.summary }, null, 2));
  if (report.summary.terminalCanaryCount !== plan.acceptance.terminalCanaryCount || report.summary.systemFailureCount !== 0) {
    fail("PGC_R08_A04_A03_FOCUSED_REPRODUCTION_NOT_TERMINAL", report.summary);
  }
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}
