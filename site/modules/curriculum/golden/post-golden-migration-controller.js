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

const GOLDEN_ANCHOR_SOURCE_IDS = Object.freeze([
  "g3b_u04_3b04",
  "g5a_u08_5a08",
  "g5a_u02_5a02",
]);
const GOLDEN_ANCHOR_SOURCE_ID_SET = new Set(GOLDEN_ANCHOR_SOURCE_IDS);

function validFoundationCandidate(program, taskOrder) {
  return program.programStatus === "ACTIVE_A00_FOUNDATION_PENDING_EXACT_HEAD_CI_AND_MERGE"
    && program.activeTaskStatus === "E1_FOUNDATION_CANDIDATE_PENDING_EXACT_HEAD_CI_AND_MERGE"
    && program.activeTask === taskOrder[0]
    && program.nextAllowedTask === taskOrder[0]
    && program.completedCount === 0
    && program.remainingCount === 14
    && program.lastCompletedTask == null
    && program.goalDistance === "D14_POST_GOLDEN_MIGRATION_PROGRAM_FOUNDATION_NOT_MERGED";
}

function validFoundationAccepted(program, taskOrder) {
  return program.programStatus === "A00_PASS_ACCEPTED_PENDING_MERGE"
    && program.activeTaskStatus === "A00_PASS_ACCEPTED_PENDING_MERGE"
    && program.activeTask === taskOrder[0]
    && program.nextAllowedTask === taskOrder[1]
    && program.completedCount === 1
    && program.remainingCount === 13
    && program.lastCompletedTask === taskOrder[0]
    && program.goalDistance === "D13_POST_GOLDEN_MIGRATION_PROGRAM_APPROVED_A01_READY";
}

function validActiveUnitProgress(program, taskOrder) {
  const completedCount = program.completedCount;
  const remainingCount = program.remainingCount;
  if (!Number.isInteger(completedCount) || completedCount < 1 || completedCount > 12) return false;
  if (remainingCount !== 14 - completedCount) return false;

  const expectedActiveTask = taskOrder[completedCount];
  const expectedLastCompleted = taskOrder[completedCount - 1];
  const status = String(program.programStatus ?? "");
  const activeTaskStatus = String(program.activeTaskStatus ?? "");
  const distance = String(program.goalDistance ?? "");

  return program.activeTask === expectedActiveTask
    && program.nextAllowedTask === expectedActiveTask
    && program.lastCompletedTask === expectedLastCompleted
    && status === activeTaskStatus
    && /^ACTIVE_A\d{2}_[A-Z0-9_]+$/.test(status)
    && distance.startsWith(`D${remainingCount}_POST_GOLDEN_MIGRATION_`)
    && distance.endsWith("_ACTIVE");
}

function validProgramCloseoutActive(program, taskOrder) {
  return program.programStatus === "ACTIVE_A13_PROGRAM_CONTROLLER_AND_KNOWLEDGE_REGISTRY_CLOSEOUT"
    && program.activeTaskStatus === "ACTIVE_A13_PROGRAM_CONTROLLER_AND_KNOWLEDGE_REGISTRY_CLOSEOUT"
    && program.activeTask === taskOrder[13]
    && program.nextAllowedTask === taskOrder[13]
    && program.lastCompletedTask === taskOrder[12]
    && program.completedCount === 13
    && program.remainingCount === 1
    && program.goalDistance === "D1_POST_GOLDEN_ALL_UNITS_CONFORMANT_A13_ACTIVE";
}

function validProgramCloseoutComplete(program, taskOrder) {
  return program.programStatus === "PASS_D0_CLOSED"
    && program.activeTaskStatus === "PASS_D0_CLOSED"
    && program.activeTask == null
    && program.nextAllowedTask == null
    && program.lastCompletedTask === taskOrder[13]
    && program.completedCount === 14
    && program.remainingCount === 0
    && program.goalDistance === "D0_POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1_COMPLETE";
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

  const programClosed = validProgramCloseoutComplete(program, taskOrder);
  const programCloseoutActive = validProgramCloseoutActive(program, taskOrder);
  const progressValid = validFoundationCandidate(program, taskOrder)
    || validFoundationAccepted(program, taskOrder)
    || validActiveUnitProgress(program, taskOrder)
    || programCloseoutActive
    || programClosed;
  if (!progressValid) errors.push(issue("POSTG_A00_PROGRAM_PROGRESS_INVALID"));

  const continuation = program.continuation ?? {};
  const validProgramLock = programClosed
    ? program.programLock === "CLOSED"
    : programCloseoutActive
      ? program.programLock === "ACTIVE_PROGRAM_CLOSEOUT_ONLY"
      : program.programLock === "ACTIVE_ONE_UNIT_ONLY";
  const checkpointsAreNotStopPoints = continuation.ciPassIsStopPoint === false
    && continuation.prAcceptanceIsStopPoint === false
    && continuation.mergeIsStopPoint === false
    && continuation.closeoutIsStopPoint === false
    && continuation.readbackIsStopPoint === false;
  const continuationPolicyValid = programClosed
    ? continuation.autoContinueWithinApprovedProgram === false
      && continuation.stopReason === "NEXT_STEP_OUTSIDE_APPROVED_PROGRAM_SCOPE"
      && typeof continuation.requiredOperatorAction === "string"
      && continuation.requiredOperatorAction.length > 0
      && continuation.nextResumeTask == null
    : continuation.autoContinueWithinApprovedProgram === true;
  if (!validProgramLock || !checkpointsAreNotStopPoints || !continuationPolicyValid) {
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
  if (controller.status !== program.programStatus
    || controller.programCompletion?.taskBudget !== program.taskBudget
    || controller.programCompletion?.completedCount !== program.completedCount
    || controller.programCompletion?.remainingCount !== program.remainingCount
    || controller.programCompletion?.goalDistance !== program.goalDistance) {
    errors.push(issue("POSTG_A00_CONTROLLER_COMPLETION_DRIFT"));
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

  const completedMigrationSources = complete.filter((sourceId) => !GOLDEN_ANCHOR_SOURCE_ID_SET.has(sourceId));
  const expectedMigrationSources = [...completedMigrationSources, active, ...pending].filter(Boolean);
  const assignments = controller.taskAssignment?.unitMigrationBySourceId ?? {};
  if (!same(Object.keys(assignments), expectedMigrationSources)) {
    errors.push(issue("POSTG_A00_TASK_ASSIGNMENT_SOURCE_DRIFT"));
  }
  const assignedTasks = Object.values(assignments);
  if (!same(assignedTasks, program.taskOrder.slice(1, 13))) {
    errors.push(issue("POSTG_A00_TASK_ASSIGNMENT_ORDER_DRIFT"));
  }

  const anchorBackfill = controller.knowledgeRegistry?.anchorKnowledgeBackfill;
  const anchorBackfillComplete = program.completedCount >= 2;
  if (anchorBackfill?.assignedTaskId !== program.taskOrder[1]
    || !same(anchorBackfill?.sourceIds, GOLDEN_ANCHOR_SOURCE_IDS)
    || anchorBackfill?.changesAnchorConformanceState !== false
    || anchorBackfill?.required !== !anchorBackfillComplete
    || (anchorBackfillComplete && anchorBackfill?.status !== "COMPLETE")) {
    errors.push(issue("POSTG_A00_ANCHOR_KNOWLEDGE_BACKFILL_POLICY_INVALID"));
  }

  return Object.freeze({
    ok: errors.length === 0,
    errors,
    queue: Object.freeze({
      completeCount: complete.length,
      activeCount: active ? 1 : 0,
      pendingCount: pending.length,
      blockedCount: (controller.queue?.blockedSourceIds ?? []).length,
      exceptionCount: (controller.queue?.exceptionSourceIds ?? []).length,
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
    if (row.unitJsonPath !== expectedPath || typeof row.unitJsonExists !== "boolean") {
      errors.push(issue("POSTG_A00_MASTER_UNIT_JSON_STATE_INVALID", { sourceId: row.sourceId }));
    }
    if (row.unitJsonExists === true) {
      if (!Number.isInteger(row.knowledgePointCount) || row.knowledgePointCount < 1
        || !Number.isInteger(row.operationModelCount) || row.operationModelCount < 1
        || !Number.isInteger(row.existingQuestionBindingCount) || row.existingQuestionBindingCount < 1
        || row.unmappedKnowledgePointCount !== 0
        || row.unmappedExistingQuestionCount !== 0
        || row.conflictingOperationModelCount !== 0
        || row.schemaValidationStatus !== "PASS"
        || row.knowledgeRegistryState !== "VALIDATED_COMPLETE") {
        errors.push(issue("POSTG_A00_MASTER_UNIT_JSON_COMPLETE_STATE_INVALID", { sourceId: row.sourceId }));
      }
    } else if (row.knowledgePointCount != null
      || row.operationModelCount != null
      || row.existingQuestionBindingCount != null
      || row.schemaValidationStatus !== "NOT_RUN") {
      errors.push(issue("POSTG_A00_MASTER_UNIT_JSON_ABSENT_STATE_INVALID", { sourceId: row.sourceId }));
    }

    if (GOLDEN_ANCHOR_SOURCE_ID_SET.has(row.sourceId)) {
      if (row.assignedKnowledgeRegistryTaskId !== program.taskOrder[1]
        || row.programRole !== "GOLDEN_REGRESSION_ANCHOR") {
        errors.push(issue("POSTG_A00_MASTER_ANCHOR_ASSIGNMENT_INVALID", { sourceId: row.sourceId }));
      }
    } else if (!migrationTaskIds.has(row.assignedKnowledgeRegistryTaskId)) {
      errors.push(issue("POSTG_A00_MASTER_MIGRATION_TASK_INVALID", { sourceId: row.sourceId }));
    } else {
      const expectedRole = registryRow.queueState === "COMPLETE"
        ? "COMPLETED_MIGRATION_UNIT"
        : registryRow.queueState === "ACTIVE"
          ? "ACTIVE_MIGRATION_UNIT"
          : "PENDING_MIGRATION_UNIT";
      if (row.programRole !== expectedRole) {
        errors.push(issue("POSTG_A00_MASTER_PROGRAM_ROLE_DRIFT", { sourceId: row.sourceId }));
      }
    }
  }

  const goldenConformantCount = (goldenRegistry.rows ?? [])
    .filter((row) => row.conformanceStatus === "GOLDEN_CONFORMANT").length;
  const activeMigrationUnitCount = (goldenRegistry.rows ?? [])
    .filter((row) => row.queueState === "ACTIVE").length;
  const pendingMigrationUnitCount = (goldenRegistry.rows ?? [])
    .filter((row) => row.queueState === "PENDING").length;
  const unitJsonExistsCount = rows.filter((row) => row.unitJsonExists === true).length;
  const knowledgeRegistryCompleteCount = rows
    .filter((row) => row.knowledgeRegistryState === "VALIDATED_COMPLETE").length;
  if (masterIndex.statusSummary?.totalUnitCount !== 15
    || masterIndex.statusSummary?.goldenConformantCount !== goldenConformantCount
    || masterIndex.statusSummary?.activeMigrationUnitCount !== activeMigrationUnitCount
    || masterIndex.statusSummary?.pendingMigrationUnitCount !== pendingMigrationUnitCount
    || masterIndex.statusSummary?.unitJsonExistsCount !== unitJsonExistsCount
    || masterIndex.statusSummary?.knowledgeRegistryCompleteCount !== knowledgeRegistryCompleteCount) {
    errors.push(issue("POSTG_A00_MASTER_SUMMARY_INVALID"));
  }

  return Object.freeze({
    ok: errors.length === 0,
    errors,
    rowCount: rows.length,
    sourceIds: Object.freeze([...rowIds]),
  });
}
