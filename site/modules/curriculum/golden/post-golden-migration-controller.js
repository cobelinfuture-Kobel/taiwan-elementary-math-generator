import { listBatchASourceUnits } from "../batch-a/source-units.js";

const PROGRAM_ID = "POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1";
const TASK_BUDGET = 14;
const ANCHOR_SOURCE_IDS = Object.freeze([
  "g3b_u04_3b04",
  "g5a_u08_5a08",
  "g5a_u02_5a02",
]);

function issue(code, details = {}) {
  return Object.freeze({ code, ...details });
}

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function publicUnits() {
  return listBatchASourceUnits({ includePublicCandidates: true });
}

function validProgramProgress(program, taskOrder) {
  const completed = program.completedCount;
  const remaining = program.remainingCount;
  if (!Number.isInteger(completed) || completed < 0 || completed > TASK_BUDGET) return false;
  if (remaining !== TASK_BUDGET - completed) return false;
  if (typeof program.programStatus !== "string" || program.programStatus.length < 3) return false;
  if (typeof program.activeTaskStatus !== "string" || program.activeTaskStatus.length < 3) return false;

  if (completed === 0) {
    return program.activeTask === taskOrder[0]
      && program.lastCompletedTask == null
      && program.nextAllowedTask === taskOrder[0]
      && String(program.goalDistance ?? "").startsWith("D14_");
  }
  if (completed === TASK_BUDGET) {
    return program.lastCompletedTask === taskOrder.at(-1)
      && program.nextAllowedTask == null
      && [taskOrder.at(-1), null].includes(program.activeTask)
      && String(program.goalDistance ?? "").startsWith("D0_");
  }

  const lastCompleted = taskOrder[completed - 1];
  const nextTask = taskOrder[completed];
  const activeAllowed = program.activeTask === lastCompleted || program.activeTask === nextTask;
  return program.lastCompletedTask === lastCompleted
    && program.nextAllowedTask === nextTask
    && activeAllowed
    && String(program.goalDistance ?? "").startsWith(`D${TASK_BUDGET - completed}_`);
}

export function validatePostGoldenMigrationProgram(program = {}) {
  const errors = [];
  const taskOrder = Array.isArray(program.taskOrder) ? program.taskOrder : [];

  if (program.programId !== PROGRAM_ID) {
    errors.push(issue("POSTG_PROGRAM_ID_INVALID", { actual: program.programId }));
  }
  if (program.taskBudget !== TASK_BUDGET || taskOrder.length !== TASK_BUDGET) {
    errors.push(issue("POSTG_TASK_BUDGET_INVALID", {
      taskBudget: program.taskBudget,
      taskOrderLength: taskOrder.length,
    }));
  }
  if (taskOrder[0] !== "POSTG-MIG-A00_ProgramContractFleetBaselineAndKnowledgeRegistryFoundation"
    || taskOrder.at(-1) !== "POSTG-MIG-A13_ProgramControllerAndKnowledgeRegistryCloseout") {
    errors.push(issue("POSTG_TASK_BOUNDARY_INVALID"));
  }
  if (new Set(taskOrder).size !== taskOrder.length) {
    errors.push(issue("POSTG_DUPLICATE_TASK_ID"));
  }
  if (!validProgramProgress(program, taskOrder)) {
    errors.push(issue("POSTG_PROGRAM_PROGRESS_INVALID", {
      completedCount: program.completedCount,
      remainingCount: program.remainingCount,
      activeTask: program.activeTask,
      lastCompletedTask: program.lastCompletedTask,
      nextAllowedTask: program.nextAllowedTask,
      goalDistance: program.goalDistance,
    }));
  }
  const continuation = program.continuation ?? {};
  if (program.programLock !== "ACTIVE_ONE_UNIT_ONLY"
    || continuation.autoContinueWithinApprovedProgram !== true
    || continuation.ciPassIsStopPoint !== false
    || continuation.prAcceptanceIsStopPoint !== false
    || continuation.mergeIsStopPoint !== false
    || continuation.closeoutIsStopPoint !== false
    || continuation.readbackIsStopPoint !== false) {
    errors.push(issue("POSTG_CONTINUATION_POLICY_INVALID"));
  }
  if (program.authority?.manualDualMaintenanceForbidden !== true
    || program.authority?.excelAndCsvAreGeneratedViews !== true) {
    errors.push(issue("POSTG_KNOWLEDGE_AUTHORITY_POLICY_INVALID"));
  }
  const excluded = new Set(program.scope?.excludes ?? []);
  for (const boundary of [
    "application-question coverage expansion",
    "public question-type or layout changes",
    "new per-unit generator, validator, renderer or workflow",
  ]) {
    if (!excluded.has(boundary)) {
      errors.push(issue("POSTG_SCOPE_BOUNDARY_MISSING", { boundary }));
    }
  }

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    taskOrder: Object.freeze([...taskOrder]),
    completedCount: program.completedCount,
    remainingCount: program.remainingCount,
  });
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
    errors.push(issue("POSTG_CONTROLLER_IDENTITY_INVALID"));
  }
  if (controller.programId !== program.programId) {
    errors.push(issue("POSTG_CONTROLLER_PROGRAM_DRIFT"));
  }
  if (controller.status !== program.programStatus
    || controller.programCompletion?.taskBudget !== program.taskBudget
    || controller.programCompletion?.completedCount !== program.completedCount
    || controller.programCompletion?.remainingCount !== program.remainingCount
    || controller.programCompletion?.goalDistance !== program.goalDistance) {
    errors.push(issue("POSTG_CONTROLLER_COMPLETION_DRIFT"));
  }
  if (controller.scopeBoundary?.postGoldenMigrationProgramApproved !== true
    || controller.scopeBoundary?.applicationCapabilityExpansionApproved !== false) {
    errors.push(issue("POSTG_SCOPE_APPROVAL_INVALID"));
  }
  if (controller.queue?.oneActiveUnitMaximum !== 1) {
    errors.push(issue("POSTG_ONE_ACTIVE_POLICY_INVALID"));
  }

  const rows = goldenRegistry.rows ?? [];
  const complete = rows.filter((row) => row.queueState === "COMPLETE").map((row) => row.sourceId);
  const active = rows.find((row) => row.queueState === "ACTIVE")?.sourceId ?? null;
  const pending = rows
    .filter((row) => row.queueState === "PENDING")
    .sort((a, b) => a.queueOrdinal - b.queueOrdinal)
    .map((row) => row.sourceId);
  const blocked = rows.filter((row) => row.queueState === "BLOCKED").map((row) => row.sourceId);
  const exceptions = rows.filter((row) => row.queueState === "EXCEPTION").map((row) => row.sourceId);

  if (!same(controller.queue?.completeSourceIds, complete)) {
    errors.push(issue("POSTG_COMPLETE_QUEUE_DRIFT"));
  }
  if (controller.queue?.activeSourceId !== active
    || controller.queue?.nextResumeSourceId !== active) {
    errors.push(issue("POSTG_ACTIVE_QUEUE_DRIFT"));
  }
  if (!same(controller.queue?.pendingSourceIds, pending)) {
    errors.push(issue("POSTG_PENDING_QUEUE_DRIFT"));
  }
  if (!same(controller.queue?.blockedSourceIds ?? [], blocked)
    || !same(controller.queue?.exceptionSourceIds ?? [], exceptions)) {
    errors.push(issue("POSTG_NONSTANDARD_QUEUE_DRIFT"));
  }
  if (goldenController.queue?.activeSourceId !== active
    || !same(goldenController.queue?.pendingSourceIds, pending)
    || !same(goldenController.queue?.completeSourceIds, complete)) {
    errors.push(issue("POSTG_UPSTREAM_CONTROLLER_QUEUE_DRIFT"));
  }

  const assignments = controller.taskAssignment?.unitMigrationBySourceId ?? {};
  const assignedSourceIds = Object.keys(assignments);
  const assignedTasks = Object.values(assignments);
  const expectedMigrationTasks = program.taskOrder.slice(1, 13);
  const expectedMigrationSourceSet = new Set(
    publicUnits().map((unit) => unit.sourceId).filter((sourceId) => !ANCHOR_SOURCE_IDS.includes(sourceId)),
  );
  if (assignedSourceIds.length !== 12
    || new Set(assignedSourceIds).size !== 12
    || assignedSourceIds.some((sourceId) => !expectedMigrationSourceSet.has(sourceId))) {
    errors.push(issue("POSTG_TASK_ASSIGNMENT_SOURCE_DRIFT", { assignedSourceIds }));
  }
  if (!same(assignedTasks, expectedMigrationTasks)) {
    errors.push(issue("POSTG_TASK_ASSIGNMENT_ORDER_DRIFT"));
  }
  for (const sourceId of [...pending, ...(active ? [active] : []), ...complete.filter((id) => !ANCHOR_SOURCE_IDS.includes(id))]) {
    if (!Object.hasOwn(assignments, sourceId)) {
      errors.push(issue("POSTG_QUEUE_SOURCE_WITHOUT_TASK", { sourceId }));
    }
  }

  const anchorBackfill = controller.knowledgeRegistry?.anchorKnowledgeBackfill;
  if (anchorBackfill?.required !== true
    || anchorBackfill?.assignedTaskId !== program.taskOrder[1]
    || !same(anchorBackfill?.sourceIds, ANCHOR_SOURCE_IDS)
    || anchorBackfill?.changesAnchorConformanceState !== false) {
    errors.push(issue("POSTG_ANCHOR_KNOWLEDGE_BACKFILL_POLICY_INVALID"));
  }

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    queue: Object.freeze({
      completeCount: complete.length,
      activeCount: active ? 1 : 0,
      pendingCount: pending.length,
      blockedCount: blocked.length,
      exceptionCount: exceptions.length,
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
    errors.push(issue("POSTG_MASTER_PROGRAM_DRIFT"));
  }
  if (rows.length !== 15 || rows.length !== units.length || new Set(rowIds).size !== rows.length) {
    errors.push(issue("POSTG_MASTER_FLEET_COUNT_INVALID", {
      rowCount: rows.length,
      sourceUnitCount: units.length,
    }));
  }
  for (const unit of units) {
    if (!rowIds.includes(unit.sourceId)) {
      errors.push(issue("POSTG_MASTER_SOURCE_MISSING", { sourceId: unit.sourceId }));
    }
  }

  const migrationTaskIds = new Set(program.taskOrder.slice(1, 13));
  for (const row of rows) {
    const unit = expectedById.get(row.sourceId);
    const registryRow = registryById.get(row.sourceId);
    if (!unit || !registryRow) {
      errors.push(issue("POSTG_MASTER_UNKNOWN_SOURCE", { sourceId: row.sourceId }));
      continue;
    }
    if (row.unitCode !== unit.unitCode
      || row.title !== unit.title
      || row.grade !== unit.grade
      || row.semester !== unit.semester
      || row.domain !== unit.domain) {
      errors.push(issue("POSTG_MASTER_SOURCE_METADATA_DRIFT", { sourceId: row.sourceId }));
    }
    if (row.conformanceStatus !== registryRow.conformanceStatus
      || row.queueState !== registryRow.queueState
      || row.queueOrdinal !== registryRow.queueOrdinal) {
      errors.push(issue("POSTG_MASTER_CONFORMANCE_DRIFT", { sourceId: row.sourceId }));
    }
    const expectedPath = `data/curriculum/knowledge/units/${row.sourceId}.knowledge-operation.json`;
    if (row.unitJsonPath !== expectedPath || typeof row.unitJsonExists !== "boolean") {
      errors.push(issue("POSTG_MASTER_UNIT_JSON_REFERENCE_INVALID", { sourceId: row.sourceId }));
    }
    if (row.unitJsonExists) {
      for (const field of ["knowledgePointCount", "operationModelCount", "existingQuestionBindingCount"]) {
        if (!Number.isInteger(row[field]) || row[field] < 0) {
          errors.push(issue("POSTG_MASTER_KNOWLEDGE_COUNT_INVALID", { sourceId: row.sourceId, field, actual: row[field] }));
        }
      }
      if (row.schemaValidationStatus === "NOT_RUN") {
        errors.push(issue("POSTG_MASTER_SCHEMA_VALIDATION_NOT_RUN", { sourceId: row.sourceId }));
      }
    }
    if (ANCHOR_SOURCE_IDS.includes(row.sourceId)) {
      if (row.assignedKnowledgeRegistryTaskId !== program.taskOrder[1]
        || row.programRole !== "GOLDEN_REGRESSION_ANCHOR") {
        errors.push(issue("POSTG_MASTER_ANCHOR_ASSIGNMENT_INVALID", { sourceId: row.sourceId }));
      }
    } else if (!migrationTaskIds.has(row.assignedKnowledgeRegistryTaskId)) {
      errors.push(issue("POSTG_MASTER_MIGRATION_TASK_INVALID", { sourceId: row.sourceId }));
    }
  }

  const registryRows = goldenRegistry.rows ?? [];
  const summaryExpected = {
    totalUnitCount: 15,
    goldenConformantCount: registryRows.filter((row) => row.conformanceStatus === "GOLDEN_CONFORMANT").length,
    activeMigrationUnitCount: registryRows.filter((row) => row.queueState === "ACTIVE").length,
    pendingMigrationUnitCount: registryRows.filter((row) => row.queueState === "PENDING").length,
    unitJsonExistsCount: rows.filter((row) => row.unitJsonExists === true).length,
    knowledgeRegistryCompleteCount: rows.filter((row) => row.knowledgeRegistryState === "VALIDATED_COMPLETE").length,
  };
  for (const [field, expected] of Object.entries(summaryExpected)) {
    if (masterIndex.statusSummary?.[field] !== expected) {
      errors.push(issue("POSTG_MASTER_SUMMARY_INVALID", {
        field,
        expected,
        actual: masterIndex.statusSummary?.[field],
      }));
    }
  }

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    rowCount: rows.length,
    sourceIds: Object.freeze([...rowIds]),
    summary: Object.freeze(summaryExpected),
  });
}
