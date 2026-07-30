import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION,
  resolvePublicUiCapabilityBinding,
} from "../../site/modules/curriculum/public/public-ui-capability-binding.js";
import {
  PUBLIC_GENERATOR_CAPACITY_RECONCILIATION,
  PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS,
  PUBLIC_GENERATOR_CAPACITY_ROWS,
} from "../../site/modules/curriculum/public/public-generator-capacity-registry.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const TASK_ID = "PGC-R06-A07_FinalReconciliationGlobalLiveGateAndD0Closeout";
const STATUS = "PASS_R06_A07_GLOBAL_LIVE_RUNTIME_RECONCILED_AND_D0_CLOSED";
const QUESTION_COUNT = 20;
const paths = Object.freeze({
  capacity: path.join(repoRoot, "data/curriculum/public-generation/generator_capacity_contract.json"),
  ui: path.join(repoRoot, "data/curriculum/public-generation/ui_capability_binding_contract.json"),
  inventory: path.join(repoRoot, "data/curriculum/public-generation/PGC-R06.reasoning-mixed-pbl-inventory.json"),
  closeout: path.join(repoRoot, "data/curriculum/public-generation/PGC-R06-A07.final-global-live-closeout.json"),
  readback: path.join(repoRoot, "docs/curriculum/output/PGC-R06-A07_FinalReconciliationGlobalLiveGateAndD0Closeout.md"),
  marker: path.join(repoRoot, "docs/curriculum/output/PGC-R06_D0_CLOSEOUT_PASS.marker"),
  registry: path.join(repoRoot, "site/modules/curriculum/public/public-generator-capacity-registry.js"),
});

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));
const hashText = (value) => crypto.createHash("sha256").update(value).digest("hex");
const signature = (value) => crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");

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

function runRoute(route, generationSeed) {
  const result = buildWorksheetDocumentFromPlan(planFor(route, generationSeed));
  const document = result?.worksheetDocument;
  const questions = document?.questions ?? document?.generatedQuestions ?? [];
  const prompts = questions.map((question) => String(question.prompt ?? question.promptText ?? question.blankedDisplayText ?? "").trim());
  return {
    ok: result?.ok === true,
    errors: result?.errors ?? [],
    questionCount: document?.questionCount ?? questions.length,
    answerKeyItemCount: document?.answerKeyItems?.length ?? 0,
    missingPromptCount: prompts.filter((prompt) => !prompt).length,
    duplicatePromptCount: prompts.length - new Set(prompts).size,
    itemSetSignature: signature([...prompts].sort()),
    orderedWorksheetSignature: signature(prompts),
  };
}

const materialized = fs.existsSync(paths.closeout);

test("PGC-R06 A07 terminal authorities are complete and internally aligned", { skip: !materialized }, () => {
  const capacity = readJson(paths.capacity);
  const ui = readJson(paths.ui);
  const inventory = readJson(paths.inventory);
  const closeout = readJson(paths.closeout);

  assert.equal(closeout.status, STATUS);
  assert.equal(closeout.summary.capacityRouteCount, 1155);
  assert.equal(closeout.summary.runtimeRegistryRowCount, 1155);
  assert.equal(closeout.summary.r06RouteCount, 659);
  assert.equal(closeout.summary.legalR06RouteCount, 389);
  assert.equal(closeout.summary.illegalR06RouteCount, 270);
  assert.equal(closeout.summary.globalLiveTargetRouteCount, 389);
  assert.equal(closeout.summary.globalLivePassRouteCount, 389);
  assert.equal(closeout.summary.globalLiveFailRouteCount, 0);
  assert.equal(closeout.summary.repairQueueCount, 0);
  assert.equal(closeout.summary.zeroCapacityRouteCount, 0);
  assert.equal(closeout.summary.limitedCapacityRouteCount, 0);
  assert.equal(closeout.summary.diversityGapRouteCount, 0);
  assert.equal(closeout.summary.parallelGapFieldCount, 0);
  assert.equal(closeout.summary.uiUnverifiedCapacityExposureCount, 0);
  assert.equal(closeout.routes.length, 389);
  assert.equal(closeout.routes.every((route) => route.accepted === true), true);

  assert.equal(capacity.lastR06A07Closeout?.taskId, TASK_ID);
  assert.equal(capacity.lastR06A07Closeout?.status, STATUS);
  assert.equal(capacity.r06TerminalStatus, "D0_CLOSED");
  assert.equal(ui.lastR06A07Closeout?.taskId, TASK_ID);
  assert.equal(ui.lastR06A07Closeout?.status, STATUS);
  assert.equal(ui.r06TerminalStatus, "D0_CLOSED");
  assert.equal(inventory.lastR06A07Closeout?.taskId, TASK_ID);
  assert.equal(inventory.lastR06A07Closeout?.status, STATUS);
  assert.equal(inventory.r06TerminalStatus, "D0_CLOSED");
  assert.equal(inventory.repairQueue.length, 0);
  assert.equal(inventory.summary.repairQueueCount, 0);
  assert.equal(inventory.nextShortestStep, "OPERATOR_SELECT_NEXT_APPROVED_PROGRAM_AFTER_R06");
  assert.equal(capacity.routes.some((route) => Object.hasOwn(route, "gapCodes")), false);

  assert.equal(PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS, "MATERIALIZED_PGC_R03_V3");
  assert.equal(PUBLIC_GENERATOR_CAPACITY_ROWS.length, 1155);
  assert.equal(PUBLIC_GENERATOR_CAPACITY_RECONCILIATION.taskId, TASK_ID);
  assert.equal(PUBLIC_GENERATOR_CAPACITY_RECONCILIATION.status, STATUS);
  assert.equal(PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION.taskId, TASK_ID);
  assert.equal(PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION.status, STATUS);
  assert.equal(PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION.registryStatus, "MATERIALIZED_PGC_R03_V3");

  assert.equal(fs.existsSync(paths.readback), true);
  assert.equal(fs.existsSync(paths.marker), true);
  const readback = fs.readFileSync(paths.readback, "utf8");
  const marker = fs.readFileSync(paths.marker, "utf8");
  assert.match(readback, /GOAL_DISTANCE_AFTER\s+= D0_R06_REASONING_MIXED_PBL_CONFORMANCE_CLOSED/);
  assert.match(readback, /GLOBAL_LIVE_GATE = 389\/389/);
  assert.match(marker, /STATUS=PASS_R06_A07_GLOBAL_LIVE_RUNTIME_RECONCILED_AND_D0_CLOSED/);
  assert.match(marker, /REPAIR_QUEUE_COUNT=0/);
});

test("PGC-R06 A07 independently replays all 389 legal routes and matches committed evidence", { skip: !materialized }, () => {
  const capacity = readJson(paths.capacity);
  const inventory = readJson(paths.inventory);
  const closeout = readJson(paths.closeout);
  const r06Ids = new Set(inventory.routes.map((route) => route.routeId));
  const legalRoutes = capacity.routes.filter((route) => r06Ids.has(route.routeId) && route.legalRoute === true);
  const committedById = new Map(closeout.routes.map((route) => [route.routeId, route]));

  assert.equal(legalRoutes.length, 389);
  for (const route of legalRoutes) {
    const seedA = `pgc-r06-a07:${route.routeId}:A`;
    const seedB = `pgc-r06-a07:${route.routeId}:B`;
    const first = runRoute(route, seedA);
    const replay = runRoute(route, seedA);
    const second = runRoute(route, seedB);
    for (const run of [first, replay, second]) {
      assert.equal(run.ok, true, `${route.routeId}:${JSON.stringify(run.errors)}`);
      assert.equal(run.questionCount, QUESTION_COUNT, route.routeId);
      assert.equal(run.answerKeyItemCount, QUESTION_COUNT, route.routeId);
      assert.equal(run.missingPromptCount, 0, route.routeId);
      assert.equal(run.duplicatePromptCount, 0, route.routeId);
    }
    assert.equal(replay.orderedWorksheetSignature, first.orderedWorksheetSignature, `${route.routeId}:same-seed drift`);
    assert.notEqual(second.itemSetSignature, first.itemSetSignature, `${route.routeId}:cross-seed set unchanged`);

    const binding = resolvePublicUiCapabilityBinding({
      sourceId: route.sourceId,
      selectionMode: route.selectionMode,
      selectedKnowledgePointIds: route.selectedKnowledgePointIds ?? [],
      selectedPatternGroupIds: route.publicPatternGroupIds ?? [],
      requestedQuestionType: route.questionType,
      requestedDepthMode: route.depthMode ?? null,
      requestedContextMode: route.contextMode ?? null,
      surfaceId: "CLASSIC",
    });
    assert.equal(binding.blocked, false, `${route.routeId}:${binding.blockedReasons.join("|")}`);
    assert.equal(binding.questionCount.max, 240, route.routeId);
    assert.equal(binding.capacityRouteIds.includes(route.routeId), true, route.routeId);
    assert.equal(binding.capacityReconciliation.taskId, TASK_ID, route.routeId);

    const committed = committedById.get(route.routeId);
    assert.ok(committed, route.routeId);
    assert.equal(committed.first.orderedWorksheetSignature, first.orderedWorksheetSignature, route.routeId);
    assert.equal(committed.replay.orderedWorksheetSignature, replay.orderedWorksheetSignature, route.routeId);
    assert.equal(committed.second.orderedWorksheetSignature, second.orderedWorksheetSignature, route.routeId);
  }
});

test("PGC-R06 A07 illegal routes remain excluded from the runtime registry", { skip: !materialized }, () => {
  const capacity = readJson(paths.capacity);
  const inventory = readJson(paths.inventory);
  const r06Ids = new Set(inventory.routes.map((route) => route.routeId));
  const illegalIds = new Set(capacity.routes.filter((route) => r06Ids.has(route.routeId) && route.legalRoute !== true).map((route) => route.routeId));
  assert.equal(illegalIds.size, 270);
  const illegalRows = PUBLIC_GENERATOR_CAPACITY_ROWS.filter((row) => illegalIds.has(row[10]));
  assert.equal(illegalRows.length, 270);
  assert.equal(illegalRows.every((row) => row[8] === "ILLEGAL" && row[7] === 0), true);
});

test("PGC-R06 A07 acceptance is read-only", { skip: !materialized }, () => {
  const tracked = [paths.capacity, paths.ui, paths.inventory, paths.closeout, paths.registry, paths.readback, paths.marker];
  const before = Object.fromEntries(tracked.map((filePath) => [filePath, hashText(fs.readFileSync(filePath))]));
  const after = Object.fromEntries(tracked.map((filePath) => [filePath, hashText(fs.readFileSync(filePath))]));
  assert.deepEqual(after, before);
});
