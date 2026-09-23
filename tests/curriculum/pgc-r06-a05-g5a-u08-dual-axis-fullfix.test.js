import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SOURCE_ID = "g5a_u08_5a08";
const QUESTION_COUNT = 20;
const DIVERSITY_GAP = "CROSS_SEED_ITEM_DIVERSITY_DEFICIENT";
const CAPACITY_GAP = "CAPACITY_BELOW_20";
const diagnosticsPath = path.join(repoRoot, "data/curriculum/public-generation/PGC-R06-A05.g5a-u08-dual-axis-diagnostics.json");
const inventoryPath = path.join(repoRoot, "data/curriculum/public-generation/PGC-R06.reasoning-mixed-pbl-inventory.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function targetRoutes() {
  if (fs.existsSync(diagnosticsPath)) {
    const diagnostics = readJson(diagnosticsPath);
    if (diagnostics.summary?.targetRouteCount === 30) return diagnostics.routes.map((row) => row.route);
  }
  return readJson(inventoryPath).repairQueue.filter((route) => route.sourceId === SOURCE_ID);
}

function planFor(route, seed) {
  return {
    sourceId: route.sourceId,
    questionCount: QUESTION_COUNT,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: seed,
    selectionMode: route.selectionMode,
    selectedKnowledgePointIds: [...(route.selectedKnowledgePointIds ?? [])],
    selectedPatternGroupIds: [...(route.publicPatternGroupIds ?? [])],
    questionMode: route.questionType,
    depthMode: route.depthMode ?? "mixed",
    contextMode: route.contextMode ?? "mixed",
    printLayout: {
      paperSize: "A4",
      columns: route.questionType === "pbl" ? 1 : 2,
      rowsPerPage: route.questionType === "pbl" ? 1 : 10,
      showAnswerKeyPage: true,
      showQuestionNumbers: true,
    },
  };
}

function runRoute(route, seed) {
  const result = buildWorksheetDocumentFromPlan(planFor(route, seed));
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
    orderedSignature: JSON.stringify(prompts),
    setSignature: JSON.stringify([...prompts].sort()),
  };
}

test("PGC-R06 A05 classifies exactly 9 PBL diversity and 21 mixed capacity residual routes", () => {
  const routes = targetRoutes();
  assert.equal(routes.length, 30);
  assert.equal(routes.filter((route) => route.questionType === "pbl" && route.gapCodes.includes(DIVERSITY_GAP)).length, 9);
  assert.equal(routes.filter((route) => route.questionType === "mixed" && route.gapCodes.includes(CAPACITY_GAP)).length, 21);
  assert.ok(routes.every((route) => route.sourceId === SOURCE_ID && route.legalRoute === true));
});

test("PGC-R06 A05 produces deterministic, unique and cross-seed-distinct 20-item worksheets for all 30 routes", () => {
  const routes = targetRoutes();
  for (const route of routes) {
    const seedA = `pgc-r06-a05:${route.routeId}:A`;
    const seedB = `pgc-r06-a05:${route.routeId}:B`;
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
