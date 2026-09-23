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

function statusCounts(registry) {
  return Object.fromEntries(registry.allowedStatuses.map((status) => [
    status,
    registry.rows.filter((row) => row.conformanceStatus === status).length,
  ]));
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
  assert.deepEqual(audit.counts, statusCounts(registry));
  assert.deepEqual(registry.statusSummary, statusCounts(registry));
  assert.equal(Object.values(audit.counts).reduce((sum, value) => sum + value, 0), 15);
  assert.equal(audit.counts.IN_PROGRESS_GOLDEN_NATIVE <= 1, true);
});

test("GS06 controller mirrors the authoritative deterministic queue through zero-active completion", async () => {
  const registry = await readJson(REGISTRY_PATH);
  const controller = await readJson(CONTROLLER_PATH);
  const program = await readJson(PROGRAM_PATH);
  const expected = queueFromRegistry(registry);
  const expectedActiveCount = expected.activeSourceId ? 1 : 0;
  assert.deepEqual(controller.queue.completeSourceIds, expected.completeSourceIds);
  assert.equal(controller.queue.activeSourceId, expected.activeSourceId);
  assert.deepEqual(controller.queue.pendingSourceIds, expected.pendingSourceIds);
  assert.equal(expected.completeSourceIds.includes("g3a_u01_3a01"), true);
  assert.equal(expected.completeSourceIds.includes("g3a_u02_3a02"), true);
  assert.equal(expected.completeSourceIds.length + expectedActiveCount + expected.pendingSourceIds.length, 15);
  if (expectedActiveCount === 0) {
    assert.equal(expected.completeSourceIds.length, 15);
    assert.deepEqual(expected.pendingSourceIds, []);
    assert.equal(controller.queue.nextResumeSourceId, null);
  }
  const { finalController, finalProgram } = finalState(controller, program);
  const audit = validateGoldenBatchController(finalController, registry, finalProgram);
  assert.equal(audit.ok, true, audit.errors.map(({ code }) => code).join("\n"));
  assert.deepEqual(audit.queue, {
    completeCount: expected.completeSourceIds.length,
    activeCount: expectedActiveCount,
    pendingCount: expected.pendingSourceIds.length,
    blockedCount: 0,
    exceptionCount: 0,
    nextResumeSourceId: expected.activeSourceId,
  });
});

test("GS06 production gate allows exactly current GOLDEN_CONFORMANT units", async () => {
  const registry = await readJson(REGISTRY_PATH);
  const expectedAllowed = registry.rows.filter((row) => row.conformanceStatus === "GOLDEN_CONFORMANT").map((row) => row.sourceId);
  const actualAllowed = registry.rows.filter((row) => evaluateGoldenProductionGate(registry, row.sourceId).allowed).map((row) => row.sourceId);
  assert.deepEqual(new Set(actualAllowed), new Set(expectedAllowed));
  assert.equal(actualAllowed.includes("g3a_u01_3a01"), true);
  assert.equal(actualAllowed.includes("g3a_u02_3a02"), true);
  const activeSourceId = registry.rows.find((row) => row.queueState === "ACTIVE")?.sourceId ?? null;
  if (activeSourceId) {
    const active = evaluateGoldenProductionGate(registry, activeSourceId);
    assert.equal(active.allowed, false);
    assert.equal(active.code, "GS06_PRODUCTION_GATE_REQUIRES_GOLDEN_CONFORMANT");
  } else {
    assert.equal(expectedAllowed.length, 15);
    assert.equal(actualAllowed.length, 15);
  }
  assert.equal(evaluateGoldenProductionGate(registry, "unknown_unit").code, "GS06_PRODUCTION_GATE_UNKNOWN_SOURCE_UNIT");
});

test("GS06 registry validator blocks coverage, version, bypass, duplication, production and queue drift", async () => {
  const registry = await readJson(REGISTRY_PATH);
  const conformantIndices = registry.rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => row.conformanceStatus === "GOLDEN_CONFORMANT")
    .map(({ index }) => index);
  const conformantIndex = conformantIndices[0];
  const activeIndex = registry.rows.findIndex((row) => row.queueState === "ACTIVE");
  const mutableIndex = activeIndex >= 0 ? activeIndex : conformantIndex;
  const secondActiveIndex = registry.rows.findIndex((row, index) => (
    index !== mutableIndex && row.conformanceStatus === "GOLDEN_CONFORMANT"
  ));
  const mutations = [
    ["GS06_CONFORMANCE_ROW_COUNT_INVALID", (draft) => draft.rows.pop()],
    ["GS06_UNIT_GOLDEN_VERSION_MISSING_OR_DRIFTED", (draft) => { draft.rows[conformantIndex].goldenContractVersion = null; }],
    ["GS06_SHARED_RUNTIME_BYPASS_DETECTED", (draft) => { draft.rows[conformantIndex].sharedRuntimeBypassed = true; }],
    ["GS06_PER_UNIT_RUNTIME_DUPLICATION_DETECTED", (draft) => { draft.rows[mutableIndex].perUnitRuntimeAdditions.generator = 1; }],
    ["GS06_PRODUCTION_GATE_STATUS_MISMATCH", (draft) => {
      const row = draft.rows[mutableIndex];
      if (row.conformanceStatus === "GOLDEN_CONFORMANT") {
        row.goldenProductionEligible = false;
        row.productionGate = "blocked_test";
      } else {
        row.goldenProductionEligible = true;
        row.productionGate = "allowed_golden_conformant";
      }
    }],
    ["GS06_QUEUE_STATE_STATUS_MISMATCH", (draft) => {
      const row = draft.rows[mutableIndex];
      row.queueState = row.conformanceStatus === "GOLDEN_CONFORMANT" ? "ACTIVE" : "COMPLETE";
      row.queueOrdinal = row.queueState === "ACTIVE" ? 0 : null;
    }],
    ["GS06_MULTIPLE_ACTIVE_UNITS", (draft) => {
      const indices = activeIndex >= 0 ? [activeIndex, secondActiveIndex] : [conformantIndices[0], conformantIndices[1]];
      for (const index of indices) {
        const row = draft.rows[index];
        const previousStatus = row.conformanceStatus;
        row.conformanceStatus = "IN_PROGRESS_GOLDEN_NATIVE";
        row.queueState = "ACTIVE";
        row.queueOrdinal = 0;
        row.productionGate = "blocked_in_progress";
        row.goldenProductionEligible = false;
        if (previousStatus !== "IN_PROGRESS_GOLDEN_NATIVE") {
          draft.statusSummary[previousStatus] -= 1;
          draft.statusSummary.IN_PROGRESS_GOLDEN_NATIVE += 1;
        }
      }
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
  badQueue.queue.pendingSourceIds = [...badQueue.queue.pendingSourceIds];
  if (badQueue.queue.pendingSourceIds.length > 1) {
    badQueue.queue.pendingSourceIds.reverse();
  } else {
    badQueue.queue.pendingSourceIds.push("g4a_u08_4a08");
  }
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
