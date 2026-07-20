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

const REGISTRY_PATH = new URL(
  "../../data/curriculum/golden/G5AU08_GOLDEN_V1.unit-conformance.json",
  import.meta.url,
);
const CONTROLLER_PATH = new URL(
  "../../data/curriculum/golden/G5AU08_GOLDEN_V1.batch-controller.json",
  import.meta.url,
);
const PROGRAM_PATH = new URL(
  "../../data/project/programs/G5AU08_GOLDEN_SAMPLE_V1.json",
  import.meta.url,
);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function clone(value) {
  return structuredClone(value);
}

function finalState(controller, program) {
  const finalController = clone(controller);
  finalController.status = "ACTIVE_GOLDEN_D0_CONTROLLER";
  finalController.programCompletion = {
    taskBudget: 6,
    completedCount: 6,
    remainingCount: 0,
    goalDistance: "D0_G5AU08_GOLDEN_V1_CONTROLLER_ACTIVE_AND_CLOSED",
  };
  const finalProgram = clone(program);
  finalProgram.programStatus = "PASS_GOLDEN_D0_CLOSED";
  finalProgram.activeTaskStatus = "PASS_GOLDEN_D0_CLOSED_PENDING_MERGE";
  finalProgram.lastCompletedTask = "GS06_G5AU08_BatchControllerAntiDriftAndGoldenD0Closeout";
  finalProgram.nextAllowedTask = null;
  finalProgram.completedCount = 6;
  finalProgram.remainingCount = 0;
  finalProgram.goalDistance = "D0_G5AU08_GOLDEN_V1_CONTROLLER_ACTIVE_AND_CLOSED";
  finalProgram.programLock = "CLOSED";
  finalProgram.stopReason = "NEXT_STEP_OUTSIDE_APPROVED_SCOPE";
  return { finalController, finalProgram };
}

test("GS06 registry covers the exact 15 public source-unit authority rows", async () => {
  const registry = await readJson(REGISTRY_PATH);
  const publicUnits = listBatchASourceUnits({ includePublicCandidates: true });
  const audit = validateGoldenUnitConformanceRegistry(registry);
  assert.equal(audit.ok, true, audit.errors.map(({ code }) => code).join("\n"));
  assert.equal(publicUnits.length, 15);
  assert.equal(audit.sourceUnitCount, 15);
  assert.equal(audit.rowCount, 15);
  assert.deepEqual(
    new Set(registry.rows.map((row) => row.sourceId)),
    new Set(publicUnits.map((unit) => unit.sourceId)),
  );
  assert.deepEqual(audit.counts, {
    LEGACY_COMPLETED_PENDING_GOLDEN_VALIDATION: 11,
    GOLDEN_CONFORMANT: 3,
    IN_PROGRESS_GOLDEN_NATIVE: 1,
    BLOCKED_SOURCE_EVIDENCE: 0,
    SHARED_CAPABILITY_EXCEPTION: 0,
    NOT_STARTED: 0,
  });
});

test("GS06 controller candidate has one deterministic queue and can close to a valid D0 state", async () => {
  const registry = await readJson(REGISTRY_PATH);
  const controller = await readJson(CONTROLLER_PATH);
  const program = await readJson(PROGRAM_PATH);
  assert.ok([
    "CANDIDATE_GOLDEN_D0_CONTROLLER_PENDING_CI",
    "ACTIVE_GOLDEN_D0_CONTROLLER",
  ].includes(controller.status));
  assert.deepEqual(controller.queue.completeSourceIds, [
    "g3b_u04_3b04",
    "g5a_u08_5a08",
    "g5a_u02_5a02",
  ]);
  assert.equal(controller.queue.activeSourceId, "g3a_u01_3a01");
  assert.equal(controller.queue.pendingSourceIds.length, 11);

  const { finalController, finalProgram } = finalState(controller, program);
  const audit = validateGoldenBatchController(finalController, registry, finalProgram);
  assert.equal(audit.ok, true, audit.errors.map(({ code }) => code).join("\n"));
  assert.deepEqual(audit.queue, {
    completeCount: 3,
    activeCount: 1,
    pendingCount: 11,
    blockedCount: 0,
    exceptionCount: 0,
    nextResumeSourceId: "g3a_u01_3a01",
  });
});

test("GS06 production gate allows only GOLDEN_CONFORMANT units", async () => {
  const registry = await readJson(REGISTRY_PATH);
  const allowed = registry.rows.filter((row) =>
    evaluateGoldenProductionGate(registry, row.sourceId).allowed
  );
  assert.deepEqual(
    new Set(allowed.map((row) => row.sourceId)),
    new Set(["g3b_u04_3b04", "g5a_u08_5a08", "g5a_u02_5a02"]),
  );
  const active = evaluateGoldenProductionGate(registry, "g3a_u01_3a01");
  assert.equal(active.allowed, false);
  assert.equal(active.code, "GS06_PRODUCTION_GATE_REQUIRES_GOLDEN_CONFORMANT");
  const pending = evaluateGoldenProductionGate(registry, "g4a_u08_4a08");
  assert.equal(pending.allowed, false);
  const unknown = evaluateGoldenProductionGate(registry, "unknown_unit");
  assert.equal(unknown.code, "GS06_PRODUCTION_GATE_UNKNOWN_SOURCE_UNIT");
});

test("GS06 registry validator blocks coverage, version, bypass, duplication, production and queue drift", async () => {
  const registry = await readJson(REGISTRY_PATH);
  const mutations = [
    ["GS06_CONFORMANCE_ROW_COUNT_INVALID", (draft) => draft.rows.pop()],
    ["GS06_UNIT_GOLDEN_VERSION_MISSING_OR_DRIFTED", (draft) => {
      draft.rows[0].goldenContractVersion = null;
    }],
    ["GS06_SHARED_RUNTIME_BYPASS_DETECTED", (draft) => {
      draft.rows[1].sharedRuntimeBypassed = true;
    }],
    ["GS06_PER_UNIT_RUNTIME_DUPLICATION_DETECTED", (draft) => {
      draft.rows[2].perUnitRuntimeAdditions.generator = 1;
    }],
    ["GS06_PRODUCTION_GATE_STATUS_MISMATCH", (draft) => {
      draft.rows[1].goldenProductionEligible = true;
      draft.rows[1].productionGate = "allowed_golden_conformant";
    }],
    ["GS06_QUEUE_STATE_STATUS_MISMATCH", (draft) => {
      draft.rows[1].queueState = "COMPLETE";
      draft.rows[1].queueOrdinal = null;
    }],
    ["GS06_MULTIPLE_ACTIVE_UNITS", (draft) => {
      draft.rows[1].conformanceStatus = "IN_PROGRESS_GOLDEN_NATIVE";
      draft.rows[1].queueState = "ACTIVE";
      draft.rows[1].queueOrdinal = 0;
      draft.rows[1].productionGate = "blocked_in_progress";
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
