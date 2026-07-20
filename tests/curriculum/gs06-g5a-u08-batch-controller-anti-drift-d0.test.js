import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  detectGoldenDiffDrift,
  evaluateGoldenProductionGate,
  validateGoldenBatchController,
  validateGoldenUnitConformanceRegistry,
} from "../../site/modules/curriculum/golden/golden-batch-controller.js";
import { listBatchASourceUnits } from "../../site/modules/curriculum/batch-a/source-units.js";

const REGISTRY_PATH = new URL("../../data/curriculum/golden/G5AU08_GOLDEN_V1.unit-conformance.json", import.meta.url);
const CONTROLLER_PATH = new URL("../../data/curriculum/golden/G5AU08_GOLDEN_V1.batch-controller.json", import.meta.url);
const PROGRAM_PATH = new URL("../../data/project/programs/G5AU08_GOLDEN_SAMPLE_V1.json", import.meta.url);
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const clone = (value) => structuredClone(value);

function finalState(controller, program) {
  const finalController = clone(controller);
  finalController.status = "ACTIVE_GOLDEN_D0_CONTROLLER";
  finalController.programCompletion = { taskBudget: 6, completedCount: 6, remainingCount: 0, goalDistance: "D0_G5AU08_GOLDEN_V1_CONTROLLER_ACTIVE_AND_CLOSED" };
  const finalProgram = clone(program);
  Object.assign(finalProgram, {
    programStatus: "PASS_GOLDEN_D0_CLOSED",
    activeTaskStatus: "PASS_GOLDEN_D0_CLOSED_PENDING_MERGE",
    lastCompletedTask: "GS06_G5AU08_BatchControllerAntiDriftAndGoldenD0Closeout",
    nextAllowedTask: null,
    completedCount: 6,
    remainingCount: 0,
    goalDistance: "D0_G5AU08_GOLDEN_V1_CONTROLLER_ACTIVE_AND_CLOSED",
    programLock: "CLOSED",
    stopReason: "NEXT_STEP_OUTSIDE_APPROVED_SCOPE",
  });
  return { finalController, finalProgram };
}

function queueFromRegistry(registry) {
  const completeSourceIds = registry.rows.filter((row) => row.queueState === "COMPLETE").map((row) => row.sourceId);
  const activeSourceId = registry.rows.find((row) => row.queueState === "ACTIVE")?.sourceId ?? null;
  const pendingSourceIds = registry.rows.filter((row) => row.queueState === "PENDING")
    .sort((a, b) => a.queueOrdinal - b.queueOrdinal).map((row) => row.sourceId);
  return { completeSourceIds, activeSourceId, pendingSourceIds };
}

test("GS06 registry covers the exact 15-unit authority after deterministic queue advancement", async () => {
  const registry = await readJson(REGISTRY_PATH);
  const publicUnits = listBatchASourceUnits({ includePublicCandidates: true });
  const audit = validateGoldenUnitConformanceRegistry(registry);
  assert.equal(audit.ok, true, audit.errors.map(({ code }) => code).join("\n"));
  assert.equal(publicUnits.length, 15);
  assert.equal(audit.sourceUnitCount, 15);
  assert.equal(audit.rowCount, 15);
  assert.deepEqual(new Set(registry.rows.map((row) => row.sourceId)), new Set(publicUnits.map((unit) => unit.sourceId)));
  assert.deepEqual(audit.counts, {
    LEGACY_COMPLETED_PENDING_GOLDEN_VALIDATION: 10,
    GOLDEN_CONFORMANT: 4,
    IN_PROGRESS_GOLDEN_NATIVE: 1,
    BLOCKED_SOURCE_EVIDENCE: 0,
    SHARED_CAPABILITY_EXCEPTION: 0,
    NOT_STARTED: 0,
  });
});

test("GS06 controller mirrors the authoritative one-active deterministic queue", async () => {
  const registry = await readJson(REGISTRY_PATH);
  const controller = await readJson(CONTROLLER_PATH);
  const program = await readJson(PROGRAM_PATH);
  const expected = queueFromRegistry(registry);
  assert.deepEqual(controller.queue.completeSourceIds, expected.completeSourceIds);
  assert.equal(controller.queue.activeSourceId, expected.activeSourceId);
  assert.deepEqual(controller.queue.pendingSourceIds, expected.pendingSourceIds);
  assert.equal(expected.activeSourceId, "g3a_u02_3a02");
  assert.equal(expected.completeSourceIds.includes("g3a_u01_3a01"), true);
  assert.equal(expected.completeSourceIds.length, 4);
  assert.equal(expected.pendingSourceIds.length, 10);
  const { finalController, finalProgram } = finalState(controller, program);
  const audit = validateGoldenBatchController(finalController, registry, finalProgram);
  assert.equal(audit.ok, true, audit.errors.map(({ code }) => code).join("\n"));
  assert.deepEqual(audit.queue, {
    completeCount: 4,
    activeCount: 1,
    pendingCount: 10,
    blockedCount: 0,
    exceptionCount: 0,
    nextResumeSourceId: "g3a_u02_3a02",
  });
});

test("GS06 production gate allows exactly current GOLDEN_CONFORMANT units", async () => {
  const registry = await readJson(REGISTRY_PATH);
  const expectedAllowed = registry.rows.filter((row) => row.conformanceStatus === "GOLDEN_CONFORMANT").map((row) => row.sourceId);
  const actualAllowed = registry.rows.filter((row) => evaluateGoldenProductionGate(registry, row.sourceId).allowed).map((row) => row.sourceId);
  assert.deepEqual(new Set(actualAllowed), new Set(expectedAllowed));
  assert.equal(actualAllowed.includes("g3a_u01_3a01"), true);
  const active = evaluateGoldenProductionGate(registry, "g3a_u02_3a02");
  assert.equal(active.allowed, false);
  assert.equal(active.code, "GS06_PRODUCTION_GATE_REQUIRES_GOLDEN_CONFORMANT");
  assert.equal(evaluateGoldenProductionGate(registry, "unknown_unit").code, "GS06_PRODUCTION_GATE_UNKNOWN_SOURCE_UNIT");
});

test("GS06 registry validator blocks coverage, version, bypass, duplication, production and queue drift", async () => {
  const registry = await readJson(REGISTRY_PATH);
  const mutations = [
    ["GS06_CONFORMANCE_ROW_COUNT_INVALID", (draft) => draft.rows.pop()],
    ["GS06_UNIT_GOLDEN_VERSION_MISSING_OR_DRIFTED", (draft) => { draft.rows[0].goldenContractVersion = null; }],
    ["GS06_SHARED_RUNTIME_BYPASS_DETECTED", (draft) => { draft.rows[1].sharedRuntimeBypassed = true; }],
    ["GS06_PER_UNIT_RUNTIME_DUPLICATION_DETECTED", (draft) => { draft.rows[2].perUnitRuntimeAdditions.generator = 1; }],
    ["GS06_PRODUCTION_GATE_STATUS_MISMATCH", (draft) => { draft.rows[1].goldenProductionEligible = true; draft.rows[1].productionGate = "allowed_golden_conformant"; }],
    ["GS06_QUEUE_STATE_STATUS_MISMATCH", (draft) => { draft.rows[1].queueState = "COMPLETE"; draft.rows[1].queueOrdinal = null; }],
    ["GS06_MULTIPLE_ACTIVE_UNITS", (draft) => {
      draft.rows[2].conformanceStatus = "IN_PROGRESS_GOLDEN_NATIVE";
      draft.rows[2].queueState = "ACTIVE";
      draft.rows[2].queueOrdinal = 0;
      draft.rows[2].productionGate = "blocked_in_progress";
      draft.statusSummary.LEGACY_COMPLETED_PENDING_GOLDEN_VALIDATION -= 1;
      draft.statusSummary.IN_PROGRESS_GOLDEN_NATIVE += 1;
    }],
  ];
  for (const [expectedCode, mutate] of mutations) {
    const draft = clone(registry);
    mutate(draft);
    const audit = validateGoldenUnitConformanceRegistry(draft);
    assert.equal(audit.ok, false, expectedCode);
    assert.equal(audit.errors.some(({ code }) => code === expectedCode), true, JSON.stringify(audit.errors));
  }
});

test("GS06 controller validator blocks queue and D0 program-state drift", async () => {
  const registry = await readJson(REGISTRY_PATH);
  const controller = await readJson(CONTROLLER_PATH);
  const program = await readJson(PROGRAM_PATH);
  const { finalController, finalProgram } = finalState(controller, program);
  const badQueue = clone(finalController);
  badQueue.queue.pendingSourceIds.reverse();
  let audit = validateGoldenBatchController(badQueue, registry, finalProgram);
  assert.equal(audit.errors.some(({ code }) => code === "GS06_PENDING_QUEUE_DRIFT"), true);
  const badProgram = clone(finalProgram);
  badProgram.completedCount = 5;
  badProgram.remainingCount = 1;
  badProgram.programStatus = "ACTIVE";
  audit = validateGoldenBatchController(finalController, registry, badProgram);
  assert.equal(audit.errors.some(({ code }) => code === "GS06_PROGRAM_STATE_NOT_D0_CLOSED"), true);
});

test("GS06 diff anti-drift blocks newly added unit-specific runtime but permits data and existing-file fixes", () => {
  const safe = detectGoldenDiffDrift([
    "A\tdata/curriculum/units/g3a_u02.json",
    "M\tsite/modules/curriculum/batch-a/g3a-u02-validator.js",
    "A\tsite/modules/curriculum/golden/shared-constraint-translator.js",
  ].join("\n"));
  assert.equal(safe.ok, true, JSON.stringify(safe.errors));
  const unsafe = detectGoldenDiffDrift([
    "A\tsite/modules/curriculum/batch-a/g3a-u02-special-generator.js",
    "A\t.github/workflows/g4a-u02-production.yml",
  ].join("\n"));
  assert.equal(unsafe.ok, false);
  assert.equal(unsafe.addedUnitSpecificRuntimeCount, 2);
  assert.equal(unsafe.errors.every(({ code }) => code === "GS06_ADDED_UNIT_SPECIFIC_RUNTIME_FILE"), true);
});
