import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  validateKnowledgeOperationMasterIndex,
  validatePostGoldenMigrationController,
  validatePostGoldenMigrationProgram,
} from "../../site/modules/curriculum/golden/post-golden-migration-controller.js";
import {
  validateGoldenUnitConformanceRegistry,
} from "../../site/modules/curriculum/golden/golden-batch-controller.js";

const ROOT = new URL("../../", import.meta.url);
const PROGRAM_PATH = new URL("data/project/programs/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.json", ROOT);
const CONTROLLER_PATH = new URL("data/curriculum/golden/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.controller.json", ROOT);
const GOLDEN_REGISTRY_PATH = new URL("data/curriculum/golden/G5AU08_GOLDEN_V1.unit-conformance.json", ROOT);
const GOLDEN_CONTROLLER_PATH = new URL("data/curriculum/golden/G5AU08_GOLDEN_V1.batch-controller.json", ROOT);
const MASTER_PATH = new URL("data/curriculum/knowledge/master/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.master-index.json", ROOT);
const CONTRACT_PATH = new URL("data/curriculum/contracts/POSTG_MIG_A13_ProgramControllerAndKnowledgeRegistryCloseout.json", ROOT);
const CLAIM_PATH = new URL("data/project/milestones/POSTG-MIG-A13.claim.json", ROOT);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function clone(value) {
  return structuredClone(value);
}

test("A13 closes the exact fourteen-task program with fifteen complete Golden units", async () => {
  const [program, controller, registry, goldenController, master, contract, claim] = await Promise.all([
    readJson(PROGRAM_PATH),
    readJson(CONTROLLER_PATH),
    readJson(GOLDEN_REGISTRY_PATH),
    readJson(GOLDEN_CONTROLLER_PATH),
    readJson(MASTER_PATH),
    readJson(CONTRACT_PATH),
    readJson(CLAIM_PATH),
  ]);

  const programAudit = validatePostGoldenMigrationProgram(program);
  assert.equal(programAudit.ok, true, JSON.stringify(programAudit.errors, null, 2));
  const controllerAudit = validatePostGoldenMigrationController(
    controller,
    registry,
    goldenController,
    program,
  );
  assert.equal(controllerAudit.ok, true, JSON.stringify(controllerAudit.errors, null, 2));
  const masterAudit = validateKnowledgeOperationMasterIndex(master, registry, program);
  assert.equal(masterAudit.ok, true, JSON.stringify(masterAudit.errors, null, 2));
  const goldenAudit = validateGoldenUnitConformanceRegistry(registry);
  assert.equal(goldenAudit.ok, true, JSON.stringify(goldenAudit.errors, null, 2));

  assert.equal(program.programStatus, "PASS_D0_CLOSED");
  assert.equal(program.completedCount, 14);
  assert.equal(program.remainingCount, 0);
  assert.equal(program.activeTask, null);
  assert.equal(program.nextAllowedTask, null);
  assert.equal(program.lastCompletedTask, program.taskOrder.at(-1));
  assert.equal(program.goalDistance, "D0_POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1_COMPLETE");
  assert.equal(program.programLock, "CLOSED");

  assert.equal(controller.status, "PASS_D0_CLOSED");
  assert.deepEqual(controllerAudit.queue, {
    completeCount: 15,
    activeCount: 0,
    pendingCount: 0,
    blockedCount: 0,
    exceptionCount: 0,
    nextResumeSourceId: null,
  });
  assert.equal(registry.statusSummary.GOLDEN_CONFORMANT, 15);
  assert.ok(registry.rows.every((row) => row.queueState === "COMPLETE"));
  assert.ok(registry.rows.every((row) => row.goldenProductionEligible === true));

  assert.equal(contract.status, "PASS_D0_CLOSED_PENDING_FINAL_EXACT_HEAD_CI_AND_MERGE");
  assert.equal(contract.acceptance.knowledgePointCount, 156);
  assert.equal(contract.acceptance.operationModelCount, 156);
  assert.equal(contract.acceptance.existingQuestionBindingCount, 273);
  assert.equal(claim.actualEvidenceLevel, "E6_D0_COMPLETE");
  assert.equal(claim.claims.d0Complete, true);
  assert.equal(claim.d0Closeout.mode, "program_controller_closeout");
});

test("A13 validates all fifteen authoritative unit registries and the exact 156/156/273 fleet totals", async () => {
  const master = await readJson(MASTER_PATH);
  let knowledgePointCount = 0;
  let operationModelCount = 0;
  let existingQuestionBindingCount = 0;

  for (const row of master.rows) {
    const unit = await readJson(new URL(row.unitJsonPath, ROOT));
    assert.equal(unit.sourceId, row.sourceId);
    assert.equal(unit.conformanceState, "GOLDEN_CONFORMANT");
    assert.equal(unit.knowledgeRegistryState, "VALIDATED_COMPLETE");
    assert.equal(unit.review.status, "PASS");

    const knowledgePointIds = unit.knowledgePoints.map((entry) => entry.knowledgePointId);
    const operationModels = unit.knowledgePoints.flatMap((entry) => entry.operationModels);
    const operationModelIds = operationModels.map((entry) => entry.modelId);
    assert.equal(new Set(knowledgePointIds).size, knowledgePointIds.length, row.sourceId);
    assert.equal(new Set(operationModelIds).size, operationModelIds.length, row.sourceId);
    assert.equal(unit.knowledgePoints.length, row.knowledgePointCount, row.sourceId);
    assert.equal(operationModels.length, row.operationModelCount, row.sourceId);
    assert.equal(unit.existingQuestionBindings.length, row.existingQuestionBindingCount, row.sourceId);

    const knowledgePointIdSet = new Set(knowledgePointIds);
    const operationModelIdSet = new Set(operationModelIds);
    for (const binding of unit.existingQuestionBindings) {
      assert.equal(knowledgePointIdSet.has(binding.knowledgePointId), true, binding.questionId);
      assert.equal(operationModelIdSet.has(binding.operationModelId), true, binding.questionId);
    }

    knowledgePointCount += unit.knowledgePoints.length;
    operationModelCount += operationModels.length;
    existingQuestionBindingCount += unit.existingQuestionBindings.length;
  }

  assert.equal(master.rows.length, 15);
  assert.equal(knowledgePointCount, 156);
  assert.equal(operationModelCount, 156);
  assert.equal(existingQuestionBindingCount, 273);
  assert.equal(master.rows.reduce((sum, row) => sum + row.unmappedKnowledgePointCount, 0), 0);
  assert.equal(master.rows.reduce((sum, row) => sum + row.unmappedExistingQuestionCount, 0), 0);
  assert.equal(master.rows.reduce((sum, row) => sum + row.conflictingOperationModelCount, 0), 0);
});

test("A13 closes only at the approved scope boundary and exposes no resumable task", async () => {
  const [program, controller] = await Promise.all([
    readJson(PROGRAM_PATH),
    readJson(CONTROLLER_PATH),
  ]);
  assert.equal(program.continuation.autoContinueWithinApprovedProgram, false);
  assert.equal(program.continuation.stopReason, "NEXT_STEP_OUTSIDE_APPROVED_PROGRAM_SCOPE");
  assert.equal(program.continuation.nextResumeTask, null);
  assert.match(program.continuation.requiredOperatorAction, /Approve a new program/);
  assert.equal(controller.continuation.autoContinueWithinApprovedProgram, false);
  assert.equal(controller.continuation.nextResumeSourceId, null);
  assert.equal(controller.continuation.nextResumeTaskId, null);
  assert.equal(controller.continuation.stopReason, "NEXT_STEP_OUTSIDE_APPROVED_PROGRAM_SCOPE");
});

test("A13 validators fail closed on reopened progress, continuation, master mapping and runtime bypass drift", async () => {
  const [program, controller, registry, goldenController, master] = await Promise.all([
    readJson(PROGRAM_PATH),
    readJson(CONTROLLER_PATH),
    readJson(GOLDEN_REGISTRY_PATH),
    readJson(GOLDEN_CONTROLLER_PATH),
    readJson(MASTER_PATH),
  ]);

  const reopened = clone(program);
  reopened.completedCount = 13;
  let audit = validatePostGoldenMigrationProgram(reopened);
  assert.equal(audit.ok, false);
  assert.ok(audit.errors.some(({ code }) => code === "POSTG_A00_PROGRAM_PROGRESS_INVALID"));

  const continuing = clone(program);
  continuing.continuation.autoContinueWithinApprovedProgram = true;
  audit = validatePostGoldenMigrationProgram(continuing);
  assert.equal(audit.ok, false);
  assert.ok(audit.errors.some(({ code }) => code === "POSTG_A00_CONTINUATION_POLICY_INVALID"));

  const driftedController = clone(controller);
  driftedController.programCompletion.remainingCount = 1;
  audit = validatePostGoldenMigrationController(
    driftedController,
    registry,
    goldenController,
    program,
  );
  assert.equal(audit.ok, false);
  assert.ok(audit.errors.some(({ code }) => code === "POSTG_A00_CONTROLLER_COMPLETION_DRIFT"));

  const unmappedMaster = clone(master);
  unmappedMaster.rows[0].unmappedKnowledgePointCount = 1;
  audit = validateKnowledgeOperationMasterIndex(unmappedMaster, registry, program);
  assert.equal(audit.ok, false);
  assert.ok(audit.errors.some(({ code }) => code === "POSTG_A00_MASTER_UNIT_JSON_COMPLETE_STATE_INVALID"));

  const bypassedRegistry = clone(registry);
  bypassedRegistry.rows[0].sharedRuntimeBypassed = true;
  audit = validateGoldenUnitConformanceRegistry(bypassedRegistry);
  assert.equal(audit.ok, false);
  assert.ok(audit.errors.some(({ code }) => code === "GS06_SHARED_RUNTIME_BYPASS_DETECTED"));
});

test("A13 E6 claim inherits five distinct admitted capability roles", async () => {
  const claim = await readJson(CLAIM_PATH);
  const inherited = claim.d0Closeout.inheritedMilestoneClaims;
  assert.deepEqual(Object.keys(inherited).sort(), [
    "content",
    "contract",
    "crossUnitConformance",
    "productionOutput",
    "sharedRuntime",
  ]);
  assert.equal(new Set(Object.values(inherited)).size, 5);
  assert.ok(claim.evidence.beforeAfterEvidencePaths.includes(inherited.productionOutput));
  assert.ok(claim.evidence.beforeAfterEvidencePaths.includes(inherited.content));
  assert.ok(claim.evidence.beforeAfterEvidencePaths.includes(inherited.contract));
  assert.ok(claim.evidence.beforeAfterEvidencePaths.includes(inherited.sharedRuntime));
  assert.ok(claim.evidence.beforeAfterEvidencePaths.includes(inherited.crossUnitConformance));
  assert.equal(claim.evidence.htmlArtifactPaths.length > 0, true);
  assert.equal(claim.evidence.pdfArtifactPaths.length > 0, true);
  assert.equal(claim.evidence.artifactHashes.length > 0, true);
});
