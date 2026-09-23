import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const capacityPath = path.join(repoRoot, "data/curriculum/public-generation/generator_capacity_contract.json");
const diagnosticsPath = path.join(repoRoot, "data/curriculum/public-generation/PGC-R06-A06.five-pbl-residual-diagnostics.json");
const QUESTION_COUNT = 20;
const TARGET_ROUTE_IDS = Object.freeze([
  "pgc_r03_g3b_u04_3b04_pbl_e1916a90faec",
  "pgc_r03_g4a_u08_4a08_pbl_cf1460671cf4",
  "pgc_r03_g4b_u04_4b04_pbl_1b228f57b05b",
  "pgc_r03_g4b_u04_4b04_pbl_4e99e7e8fb6e",
  "pgc_r03_g4b_u04_4b04_pbl_9e62e1aef141",
]);

const hash = (value) => crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));

function targetRoutes() {
  const capacity = readJson(capacityPath);
  const byId = new Map(capacity.routes.map((route) => [route.routeId, route]));
  return TARGET_ROUTE_IDS.map((routeId) => {
    const route = byId.get(routeId);
    assert.ok(route, routeId);
    return route;
  });
}

function planFor(route, generationSeed) {
  return {
    sourceId: route.sourceId,
    questionCount: QUESTION_COUNT,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed,
    selectionMode: route.selectionMode,
    selectedKnowledgePointIds: [...(route.selectedKnowledgePointIds ?? [])],
    selectedPatternGroupIds: [...(route.publicPatternGroupIds ?? [])],
    questionMode: "pbl",
    depthMode: route.depthMode ?? "mixed",
    contextMode: route.contextMode ?? "mixed",
    printLayout: {
      paperSize: "A4",
      columns: 1,
      rowsPerPage: 1,
      showAnswerKeyPage: true,
      showQuestionNumbers: true,
    },
  };
}

function runRoute(route, generationSeed) {
  const result = buildWorksheetDocumentFromPlan(planFor(route, generationSeed));
  const document = result?.worksheetDocument;
  const questions = document?.questions ?? document?.generatedQuestions ?? [];
  const prompts = questions.map((row) => String(row.prompt ?? row.promptText ?? row.blankedDisplayText ?? "").trim());
  return {
    ok: result?.ok === true,
    errors: result?.errors ?? [],
    questionCount: document?.questionCount ?? questions.length,
    answerKeyItemCount: document?.answerKeyItems?.length ?? 0,
    prompts,
    uniquePromptCount: new Set(prompts).size,
    orderedSignature: hash(prompts),
    setSignature: hash([...prompts].sort()),
  };
}

test("PGC-R06 A06 targets exactly the final five PBL fixture routes", () => {
  const routes = targetRoutes();
  assert.equal(routes.length, 5);
  assert.deepEqual(
    Object.fromEntries([...new Set(routes.map((route) => route.sourceId))].sort().map((sourceId) => [sourceId, routes.filter((route) => route.sourceId === sourceId).length])),
    {
      g3b_u04_3b04: 1,
      g4a_u08_4a08: 1,
      g4b_u04_4b04: 3,
    },
  );
  assert.ok(routes.every((route) => route.questionType === "pbl" && route.legalRoute === true));
});

test("PGC-R06 A06 gives all five routes deterministic unique 20-item cross-seed diversity", () => {
  for (const route of targetRoutes()) {
    const seedA = `pgc-r06-a06:${route.routeId}:A`;
    const seedB = `pgc-r06-a06:${route.routeId}:B`;
    const first = runRoute(route, seedA);
    const replay = runRoute(route, seedA);
    const second = runRoute(route, seedB);
    for (const run of [first, replay, second]) {
      assert.equal(run.ok, true, `${route.routeId}:${JSON.stringify(run.errors)}`);
      assert.equal(run.questionCount, QUESTION_COUNT, route.routeId);
      assert.equal(run.answerKeyItemCount, QUESTION_COUNT, route.routeId);
      assert.equal(run.prompts.every(Boolean), true, route.routeId);
      assert.equal(run.uniquePromptCount, QUESTION_COUNT, route.routeId);
    }
    assert.equal(replay.orderedSignature, first.orderedSignature, `${route.routeId}:same-seed replay drift`);
    assert.notEqual(second.setSignature, first.setSignature, `${route.routeId}:cross-seed set did not change`);
  }
});

test("PGC-R06 A06 materialized diagnostics, when present, remain aligned", () => {
  if (!fs.existsSync(diagnosticsPath)) return;
  const diagnostics = readJson(diagnosticsPath);
  assert.equal(diagnostics.summary.targetRouteCount, 5);
  assert.equal(diagnostics.summary.acceptedRouteCount, 5);
  assert.equal(diagnostics.summary.failedRouteCount, 0);
  assert.deepEqual(diagnostics.routes.map((route) => route.routeId).sort(), [...TARGET_ROUTE_IDS].sort());
});
