import { listBatchASourceUnits } from "../batch-a/source-units.js";

function issue(code, details = {}) {
  return Object.freeze({ code, ...details });
}

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function publicUnits() {
  return listBatchASourceUnits({ includePublicCandidates: true });
}

export function validatePostGoldenMigrationProgram(program = {}) {
  const errors = [];
  const taskOrder = Array.isArray(program.taskOrder) ? program.taskOrder : [];

  if (program.programId !== "POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1") {
    errors.push(issue("POSTG_A00_PROGRAM_ID_INVALID", { actual: program.programId }));
  }
  if (program.taskBudget !== 14 || taskOrder.length !== 14) {
    errors.push(issue("POSTG_A00_TASK_BUDGET_INVALID", {
      taskBudget: program.taskBudget,
      taskOrderLength: taskOrder.length,
    }));
  }
  if (taskOrder[0] !== "POSTG-MIG-A00_ProgramContractFleetBaselineAndKnowledgeRegistryFoundation"
    || taskOrder.at(-1) !== "POSTG-MIG-A13_ProgramControllerAndKnowledgeRegistryCloseout") {
    errors.push(issue("POSTG_A00_TASK_BOUNDARY_INVALID"));
  }
  if (new Set(taskOrder).size !== taskOrder.length) {
    errors.push(issue("POSTG_A00_DUPLICATE_TASK_ID"));
  }
  if (program.activeTask !== taskOrder[0]
    || program.nextAllowedTask !== taskOrder[1]
    || program.completedCount !== 0
    || program.remainingCount !== 14) {
    errors.push(issue("POSTG_A00_PROGRAM_PROGRESS_INVALID"));
  }
  if (program.programLock !== "ACTIVE_ONE_UNIT_ONLY"
    || program.continuation?.autoContinueWithinApprovedProgram !== true) {
    errors.push(issue("POSTG_A00_CONTINUATION_POLICY_INVALID"));
  }
  if (program.authority?.manualDualMaintenanceForbidden !== true
    || program.authority?.excelAndCsvAreGeneratedViews !== true) {
    errors.push(issue("POSTG_A00_KNOWLEDGE_AUTHORITY_POLICY_INVALID"));
  }
  const excluded = new Set(program.scope?.excludes ?? []);
  for (const boundary of [
    "application-question coverage expansion",
    "public question-type or layout changes",
    "new per-unit generator, validator, renderer or workflow",
  ]) {
    if (!excluded.has(boundary)) {
      errors.push(issue("POSTG_A00_SCOPE_BOUNDARY_MISSING", { boundary }));
    }
  }

  return Object.freeze({ ok: errors.length === 0, errors, taskOrder });
}

export function validatePostGoldenMigrationController(
  controller = {},
  goldenRegistry = {},
  goldenController = {},
  program = {},
) {
  const errors = [];
  const programAudit = validatePostGoldenMigrationProgram(program);
  errors.push(...programAudit.errors);

  if (controller.controllerId !== "POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1_CONTROLLER"
    || controller.controllerVersion !== "1.0.0") {
    errors.push(issue("POSTG_A00_CONTROLLER_IDENTITY_INVALID"));
  }
  if (controller.programId !== program.programId) {
    errors.push(issue("POSTG_A00_CONTROLLER_PROGRAM_DRIFT"));
  }
  if (controller.scopeBoundary?.postGoldenMigrationProgramApproved !== true
    || controller.scopeBoundary?.executesUnitMigrationDuringA00 !== false
    || controller.scopeBoundary?.changesProductionAdmissionDuringA00 !== false) {
    errors.push(issue("POSTG_A00_SCOPE_APPROVAL_INVALID"));
  }
  if (controller.queue?.oneActiveUnitMaximum !== 1) {
    errors.push(issue("POSTG_A00_ONE_ACTIVE_POLICY_INVALID"));
  }

  const complete = (goldenRegistry.rows ?? [])
    .filter((row) => row.queueState === "COMPLETE")
    .map((row) => row.sourceId);
  const active = (goldenRegistry.rows ?? [])
    .find((row) => row.queueState === "ACTIVE")?.sourceId ?? null;
  const pending = (goldenRegistry.rows ?? [])
    .filter((row) => row.queueState === "PENDING")
    .sort((a, b) => a.queueOrdinal - b.queueOrdinal)
    .map((row) => row.sourceId);

  if (!same(controller.queue?.completeSourceIds, complete)) {
    errors.push(issue("POSTG_A00_COMPLETE_QUEUE_DRIFT"));
  }
  if (controller.queue?.activeSourceId !== active
    || controller.queue?.nextResumeSourceId !== active) {
    errors.push(issue("POSTG_A00_ACTIVE_QUEUE_DRIFT"));
  }
  if (!same(controller.queue?.pendingSourceIds, pending)) {
    errors.push(issue("POSTG_A00_PENDING_QUEUE_DRIFT"));
  }
  if (goldenController.queue?.activeSourceId !== active
    || !same(goldenController.queue?.pendingSourceIds, pending)) {
    errors.push(issue("POSTG_A00_UPSTREAM_CONTROLLER_QUEUE_DRIFT"));
  }

  const expectedMigrationSources = [active, ...pending].filter(Boolean);
  const assignments = controller.taskAssignment?.unitMigrationBySourceId ?? {};
  if (!same(Object.keys(assignments), expectedMigrationSources)) {
    errors.push(issue("POSTG_A00_TASK_ASSIGNMENT_SOURCE_DRIFT"));
  }
  const assignedTasks = Object.values(assignments);
  if (!same(assignedTasks, program.taskOrder.slice(1, 13))) {
    errors.push(issue("POSTG_A00_TASK_ASSIGNMENT_ORDER_DRIFT"));
  }

  const anchorBackfill = controller.knowledgeRegistry?.anchorKnowledgeBackfill;
  if (anchorBackfill?.required !== true
    || anchorBackfill?.assignedTaskId !== program.taskOrder[1]
    || !same(anchorBackfill?.sourceIds, complete)
    || anchorBackfill?.changesAnchorConformanceState !== false) {
    errors.push(issue("POSTG_A00_ANCHOR_KNOWLEDGE_BACKFILL_POLICY_INVALID"));
  }

  return Object.freeze({
    ok: errors.length === 0,
    errors,
    queue: Object.freeze({
      completeCount: complete.length,
      activeCount: active ? 1 : 0,
      pendingCount: pending.length,
      nextResumeSourceId: active,
    }),
  });
}

export function validateKnowledgeOperationMasterIndex(
  masterIndex = {},
  goldenRegistry = {},
  program = {},
) {
  const errors = [];
  const units = publicUnits();
  const expectedById = new Map(units.map((unit) => [unit.sourceId, unit]));
  const registryById = new Map((goldenRegistry.rows ?? []).map((row) => [row.sourceId, row]));
  const rows = Array.isArray(masterIndex.rows) ? masterIndex.rows : [];
  const rowIds = rows.map((row) => row.sourceId);

  if (masterIndex.programId !== program.programId) {
    errors.push(issue("POSTG_A00_MASTER_PROGRAM_DRIFT"));
  }
  if (rows.length !== 15 || rows.length !== units.length || new Set(rowIds).size !== rows.length) {
    errors.push(issue("POSTG_A00_MASTER_FLEET_COUNT_INVALID", {
      rowCount: rows.length,
      sourceUnitCount: units.length,
    }));
  }
  for (const unit of units) {
    if (!rowIds.includes(unit.sourceId)) {
      errors.push(issue("POSTG_A00_MASTER_SOURCE_MISSING", { sourceId: unit.sourceId }));
    }
  }

  const migrationTaskIds = new Set(program.taskOrder.slice(1, 13));
  const anchorIds = new Set(["g3b_u04_3b04", "g5a_u08_5a08", "g5a_u02_5a02"]);
  for (const row of rows) {
    const unit = expectedById.get(row.sourceId);
    const registryRow = registryById.get(row.sourceId);
    if (!unit || !registryRow) {
      errors.push(issue("POSTG_A00_MASTER_UNKNOWN_SOURCE", { sourceId: row.sourceId }));
      continue;
    }
    if (row.unitCode !== unit.unitCode
      || row.title !== unit.title
      || row.grade !== unit.grade
      || row.semester !== unit.semester
      || row.domain !== unit.domain) {
      errors.push(issue("POSTG_A00_MASTER_SOURCE_METADATA_DRIFT", { sourceId: row.sourceId }));
    }
    if (row.conformanceStatus !== registryRow.conformanceStatus
      || row.queueState !== registryRow.queueState
      || row.queueOrdinal !== registryRow.queueOrdinal) {
      errors.push(issue("POSTG_A00_MASTER_CONFORMANCE_DRIFT", { sourceId: row.sourceId }));
    }
    const expectedPath = `data/curriculum/knowledge/units/${row.sourceId}.knowledge-operation.json`;
    if (row.unitJsonPath !== expectedPath || row.unitJsonExists !== false) {
      errors.push(issue("POSTG_A00_MASTER_UNIT_JSON_BASELINE_INVALID", { sourceId: row.sourceId }));
    }
    if (anchorIds.has(row.sourceId)) {
      if (row.assignedKnowledgeRegistryTaskId !== program.taskOrder[1]
        || row.programRole !== "GOLDEN_REGRESSION_ANCHOR") {
        errors.push(issue("POSTG_A00_MASTER_ANCHOR_ASSIGNMENT_INVALID", { sourceId: row.sourceId }));
      }
    } else if (!migrationTaskIds.has(row.assignedKnowledgeRegistryTaskId)) {
      errors.push(issue("POSTG_A00_MASTER_MIGRATION_TASK_INVALID", { sourceId: row.sourceId }));
    }
  }

  if (masterIndex.statusSummary?.totalUnitCount !== 15
    || masterIndex.statusSummary?.goldenConformantCount !== 3
    || masterIndex.statusSummary?.activeMigrationUnitCount !== 1
    || masterIndex.statusSummary?.pendingMigrationUnitCount !== 11
    || masterIndex.statusSummary?.unitJsonExistsCount !== 0) {
    errors.push(issue("POSTG_A00_MASTER_SUMMARY_INVALID"));
  }

  return Object.freeze({
    ok: errors.length === 0,
    errors,
    rowCount: rows.length,
    sourceIds: Object.freeze([...rowIds]),
  });
}
