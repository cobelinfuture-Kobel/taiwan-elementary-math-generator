import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  validateKnowledgeOperationMasterIndex,
  validatePostGoldenMigrationController,
  validatePostGoldenMigrationProgram,
} from "../../site/modules/curriculum/golden/post-golden-migration-controller.js";

const PROGRAM_PATH = new URL(
  "../../data/project/programs/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.json",
  import.meta.url,
);
const CONTROLLER_PATH = new URL(
  "../../data/curriculum/golden/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.controller.json",
  import.meta.url,
);
const GOLDEN_REGISTRY_PATH = new URL(
  "../../data/curriculum/golden/G5AU08_GOLDEN_V1.unit-conformance.json",
  import.meta.url,
);
const GOLDEN_CONTROLLER_PATH = new URL(
  "../../data/curriculum/golden/G5AU08_GOLDEN_V1.batch-controller.json",
  import.meta.url,
);
const MASTER_INDEX_PATH = new URL(
  "../../data/curriculum/knowledge/master/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.master-index.json",
  import.meta.url,
);
const KNOWLEDGE_SCHEMA_PATH = new URL(
  "../../data/curriculum/knowledge/schema/knowledge-operation-unit.schema.json",
  import.meta.url,
);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function clone(value) {
  return structuredClone(value);
}

test("A00 foundation preserves the exact 14-task post-Golden program through D0 closeout", async () => {
  const program = await readJson(PROGRAM_PATH);
  const audit = validatePostGoldenMigrationProgram(program);
  assert.equal(audit.ok, true, JSON.stringify(audit.errors, null, 2));
  assert.equal(program.taskBudget, 14);
  assert.equal(program.taskOrder.length, 14);
  assert.equal(
    program.taskOrder[0],
    "POSTG-MIG-A00_ProgramContractFleetBaselineAndKnowledgeRegistryFoundation",
  );
  assert.equal(
    program.taskOrder.at(-1),
    "POSTG-MIG-A13_ProgramControllerAndKnowledgeRegistryCloseout",
  );
  assert.ok(program.completedCount >= 1);
  assert.equal(program.remainingCount, 14 - program.completedCount);
  assert.equal(
    program.taskOrder.slice(0, program.completedCount).includes(
      "POSTG-MIG-A00_ProgramContractFleetBaselineAndKnowledgeRegistryFoundation",
    ),
    true,
  );
  const closed = program.programStatus === "PASS_D0_CLOSED";
  assert.equal(program.continuation.autoContinueWithinApprovedProgram, !closed);
  if (closed) {
    assert.equal(program.completedCount, 14);
    assert.equal(program.activeTask, null);
    assert.equal(program.nextAllowedTask, null);
    assert.equal(program.programLock, "CLOSED");
    assert.equal(program.continuation.stopReason, "NEXT_STEP_OUTSIDE_APPROVED_PROGRAM_SCOPE");
    assert.equal(program.continuation.nextResumeTask, null);
  }
  assert.equal(program.continuation.nextSourceIdAfterA00, "g3a_u01_3a01");
});

test("A00 controller continues to mirror the authoritative Golden fleet queue", async () => {
  const [program, controller, registry, goldenController] = await Promise.all([
    readJson(PROGRAM_PATH),
    readJson(CONTROLLER_PATH),
    readJson(GOLDEN_REGISTRY_PATH),
    readJson(GOLDEN_CONTROLLER_PATH),
  ]);
  const audit = validatePostGoldenMigrationController(
    controller,
    registry,
    goldenController,
    program,
  );
  assert.equal(audit.ok, true, JSON.stringify(audit.errors, null, 2));
  assert.equal(controller.programCompletion.taskBudget, 14);
  assert.equal(controller.programCompletion.completedCount, program.completedCount);
  assert.equal(controller.programCompletion.remainingCount, program.remainingCount);
  assert.equal(controller.queue.oneActiveUnitMaximum, 1);
  assert.equal(audit.queue.activeCount <= 1, true);
  assert.equal(
    audit.queue.completeCount
      + audit.queue.activeCount
      + audit.queue.pendingCount
      + audit.queue.blockedCount
      + audit.queue.exceptionCount,
    15,
  );
  assert.equal(controller.scopeBoundary.postGoldenMigrationProgramApproved, true);
  assert.equal(controller.scopeBoundary.applicationCapabilityExpansionApproved, false);
});

test("A00 master index remains a complete 15-unit generated-view authority", async () => {
  const [program, registry, masterIndex] = await Promise.all([
    readJson(PROGRAM_PATH),
    readJson(GOLDEN_REGISTRY_PATH),
    readJson(MASTER_INDEX_PATH),
  ]);
  const audit = validateKnowledgeOperationMasterIndex(masterIndex, registry, program);
  assert.equal(audit.ok, true, JSON.stringify(audit.errors, null, 2));
  assert.equal(audit.rowCount, 15);
  assert.equal(new Set(audit.sourceIds).size, 15);
  assert.equal(masterIndex.statusSummary.totalUnitCount, 15);
  assert.equal(
    masterIndex.statusSummary.unitJsonExistsCount,
    masterIndex.rows.filter((row) => row.unitJsonExists === true).length,
  );

  const anchors = masterIndex.rows.filter((row) =>
    row.programRole === "GOLDEN_REGRESSION_ANCHOR"
  );
  assert.equal(anchors.length, 3);
  assert.equal(anchors.every((row) =>
    row.assignedKnowledgeRegistryTaskId
      === "POSTG-MIG-A01_G3A_U01_GoldenConformanceAndKnowledgeOperationMigration"
  ), true);
});

test("A00 knowledge schema keeps operation models and existing-question bindings explicit", async () => {
  const schema = await readJson(KNOWLEDGE_SCHEMA_PATH);
  assert.equal(schema.type, "object");
  assert.equal(schema.additionalProperties, false);
  assert.ok(schema.required.includes("knowledgePoints"));
  assert.ok(schema.required.includes("existingQuestionBindings"));

  const kp = schema.$defs.knowledgePoint;
  assert.ok(kp.required.includes("operationModels"));
  assert.ok(kp.required.includes("applicationCapability"));

  const model = schema.$defs.operationModel;
  for (const field of [
    "canonicalExpressions",
    "operandRoles",
    "unknownRoles",
    "numberConstraints",
    "equivalentForms",
    "answerType",
    "validationInvariants",
  ]) {
    assert.ok(model.required.includes(field), field);
  }
});

test("A00 validators fail closed on queue, fleet, completion and authority drift", async () => {
  const [program, controller, registry, goldenController, masterIndex] = await Promise.all([
    readJson(PROGRAM_PATH),
    readJson(CONTROLLER_PATH),
    readJson(GOLDEN_REGISTRY_PATH),
    readJson(GOLDEN_CONTROLLER_PATH),
    readJson(MASTER_INDEX_PATH),
  ]);

  const badController = clone(controller);
  badController.queue.pendingSourceIds = [...badController.queue.pendingSourceIds];
  if (badController.queue.pendingSourceIds.length > 1) {
    badController.queue.pendingSourceIds.reverse();
  } else {
    badController.queue.pendingSourceIds.push("g4a_u08_4a08");
  }
  let audit = validatePostGoldenMigrationController(
    badController,
    registry,
    goldenController,
    program,
  );
  assert.equal(audit.ok, false);
  assert.equal(audit.errors.some(({ code }) => code === "POSTG_A00_PENDING_QUEUE_DRIFT"), true);

  const badCompletion = clone(controller);
  badCompletion.programCompletion.remainingCount += 1;
  audit = validatePostGoldenMigrationController(
    badCompletion,
    registry,
    goldenController,
    program,
  );
  assert.equal(audit.ok, false);
  assert.equal(
    audit.errors.some(({ code }) => code === "POSTG_A00_CONTROLLER_COMPLETION_DRIFT"),
    true,
  );

  const badMaster = clone(masterIndex);
  badMaster.rows.pop();
  audit = validateKnowledgeOperationMasterIndex(badMaster, registry, program);
  assert.equal(audit.ok, false);
  assert.equal(
    audit.errors.some(({ code }) => code === "POSTG_A00_MASTER_FLEET_COUNT_INVALID"),
    true,
  );

  const badProgram = clone(program);
  badProgram.authority.manualDualMaintenanceForbidden = false;
  audit = validatePostGoldenMigrationProgram(badProgram);
  assert.equal(audit.ok, false);
  assert.equal(
    audit.errors.some(({ code }) => code === "POSTG_A00_KNOWLEDGE_AUTHORITY_POLICY_INVALID"),
    true,
  );
});

test("A00 exporter continues to create deterministic six-sheet XLSX and 15-row audit CSV", async () => {
  const directory = await mkdtemp(join(tmpdir(), "postg-a00-"));
  const xlsx = join(directory, "master.xlsx");
  const csv = join(directory, "master.csv");
  const root = fileURLToPath(new URL("../../", import.meta.url));
  try {
    const run = spawnSync("python3", [
      "tools/curriculum/export-postg-knowledge-master.py",
      "--xlsx", xlsx,
      "--csv", csv,
    ], { cwd: root, encoding: "utf8" });
    assert.equal(run.status, 0, `${run.stdout}\n${run.stderr}`);
    const readback = JSON.parse(run.stdout.trim());
    assert.equal(readback.unitCount, 15);
    assert.deepEqual(Object.keys(readback.sheetRowCounts), [
      "Knowledge_Point_Map",
      "Migration_Review",
      "Number_Constraints",
      "Operation_Models",
      "Question_Coverage",
      "Unit_Index",
    ]);

    const xlsxBytes = await readFile(xlsx);
    assert.equal(xlsxBytes.subarray(0, 4).toString("binary"), "PK\u0003\u0004");
    const csvText = await readFile(csv, "utf8");
    assert.equal(csvText.trim().split(/\r?\n/).length, 16);

    const secondXlsx = join(directory, "master-2.xlsx");
    const secondCsv = join(directory, "master-2.csv");
    const second = spawnSync("python3", [
      "tools/curriculum/export-postg-knowledge-master.py",
      "--xlsx", secondXlsx,
      "--csv", secondCsv,
    ], { cwd: root, encoding: "utf8" });
    assert.equal(second.status, 0, `${second.stdout}\n${second.stderr}`);
    const secondReadback = JSON.parse(second.stdout.trim());
    assert.equal(secondReadback.xlsxSha256, readback.xlsxSha256);
    assert.equal(secondReadback.csvSha256, readback.csvSha256);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
