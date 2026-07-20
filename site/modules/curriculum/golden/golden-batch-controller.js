import { listBatchASourceUnits } from "../batch-a/source-units.js";

export const GOLDEN_UNIT_CONFORMANCE_STATUSES = Object.freeze([
  "LEGACY_COMPLETED_PENDING_GOLDEN_VALIDATION",
  "GOLDEN_CONFORMANT",
  "IN_PROGRESS_GOLDEN_NATIVE",
  "BLOCKED_SOURCE_EVIDENCE",
  "SHARED_CAPABILITY_EXCEPTION",
  "NOT_STARTED",
]);

const STATUS_SET = new Set(GOLDEN_UNIT_CONFORMANCE_STATUSES);
const RUNTIME_FIELDS = Object.freeze(["generator", "validator", "renderer", "workflow"]);
const PRODUCTION_ALLOWED_STATUS = "GOLDEN_CONFORMANT";

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
}

function issue(code, details = {}) {
  return freeze({ code, ...details });
}

function sourceUnits() {
  return listBatchASourceUnits({ includePublicCandidates: true });
}

function expectedUnitMap() {
  return new Map(sourceUnits().map((unit) => [unit.sourceId, unit]));
}

function statusCounts(rows) {
  const counts = Object.fromEntries(GOLDEN_UNIT_CONFORMANCE_STATUSES.map((status) => [status, 0]));
  for (const row of rows) {
    if (counts[row.conformanceStatus] != null) counts[row.conformanceStatus] += 1;
  }
  return counts;
}

function runtimeAdditionsAreZero(row) {
  return RUNTIME_FIELDS.every((field) => row.perUnitRuntimeAdditions?.[field] === 0);
}

function isApprovedException(row) {
  return row.conformanceStatus === "SHARED_CAPABILITY_EXCEPTION"
    && row.exceptionStatus === "approved";
}

function productionGateValid(row) {
  const shouldAllow = row.conformanceStatus === PRODUCTION_ALLOWED_STATUS;
  if (row.goldenProductionEligible !== shouldAllow) return false;
  if (shouldAllow) return row.productionGate === "allowed_golden_conformant";
  return typeof row.productionGate === "string" && row.productionGate.startsWith("blocked_");
}

function queueStateValid(row) {
  if (row.conformanceStatus === "GOLDEN_CONFORMANT") {
    return row.queueState === "COMPLETE" && row.queueOrdinal == null;
  }
  if (row.conformanceStatus === "IN_PROGRESS_GOLDEN_NATIVE") {
    return row.queueState === "ACTIVE" && row.queueOrdinal === 0;
  }
  if (row.conformanceStatus === "LEGACY_COMPLETED_PENDING_GOLDEN_VALIDATION"
    || row.conformanceStatus === "NOT_STARTED") {
    return row.queueState === "PENDING"
      && Number.isInteger(row.queueOrdinal)
      && row.queueOrdinal > 0;
  }
  if (row.conformanceStatus === "BLOCKED_SOURCE_EVIDENCE") {
    return row.queueState === "BLOCKED";
  }
  if (row.conformanceStatus === "SHARED_CAPABILITY_EXCEPTION") {
    return row.queueState === "EXCEPTION";
  }
  return false;
}

export function validateGoldenUnitConformanceRegistry(registry = {}) {
  const errors = [];
  const units = sourceUnits();
  const expected = expectedUnitMap();
  const rows = Array.isArray(registry.rows) ? registry.rows : [];
  const rowIds = rows.map((row) => row.sourceId);
  const rowIdSet = new Set(rowIds);

  if (registry.programId !== "G5AU08_GOLDEN_SAMPLE_V1") {
    errors.push(issue("GS06_PROGRAM_ID_INVALID", { actual: registry.programId }));
  }
  if (registry.goldenContractId !== "G5AU08_GOLDEN_V1"
    || registry.goldenContractVersion !== "1.0.0") {
    errors.push(issue("GS06_GOLDEN_CONTRACT_IDENTITY_INVALID"));
  }
  if (registry.sourceAuthority?.expectedSourceUnitCount !== units.length) {
    errors.push(issue("GS06_SOURCE_AUTHORITY_COUNT_INVALID", {
      expected: units.length,
      actual: registry.sourceAuthority?.expectedSourceUnitCount,
    }));
  }
  if (rows.length !== units.length) {
    errors.push(issue("GS06_CONFORMANCE_ROW_COUNT_INVALID", {
      expected: units.length,
      actual: rows.length,
    }));
  }
  if (rowIdSet.size !== rowIds.length) errors.push(issue("GS06_DUPLICATE_SOURCE_ID"));

  for (const unit of units) {
    if (!rowIdSet.has(unit.sourceId)) {
      errors.push(issue("GS06_SOURCE_UNIT_MISSING", { sourceId: unit.sourceId }));
    }
  }
  for (const row of rows) {
    const unit = expected.get(row.sourceId);
    if (!unit) {
      errors.push(issue("GS06_UNKNOWN_SOURCE_UNIT", { sourceId: row.sourceId }));
      continue;
    }
    if (row.unitCode !== unit.unitCode
      || row.title !== unit.title
      || row.grade !== unit.grade
      || row.semester !== unit.semester) {
      errors.push(issue("GS06_SOURCE_METADATA_DRIFT", { sourceId: row.sourceId }));
    }
    if (!STATUS_SET.has(row.conformanceStatus)) {
      errors.push(issue("GS06_CONFORMANCE_STATUS_INVALID", {
        sourceId: row.sourceId,
        actual: row.conformanceStatus,
      }));
    }
    if (row.goldenContractVersion !== registry.goldenContractVersion) {
      errors.push(issue("GS06_UNIT_GOLDEN_VERSION_MISSING_OR_DRIFTED", { sourceId: row.sourceId }));
    }
    if (row.sharedRuntimeBypassed === true) {
      errors.push(issue("GS06_SHARED_RUNTIME_BYPASS_DETECTED", { sourceId: row.sourceId }));
    }
    if (!runtimeAdditionsAreZero(row) && !isApprovedException(row)) {
      errors.push(issue("GS06_PER_UNIT_RUNTIME_DUPLICATION_DETECTED", { sourceId: row.sourceId }));
    }
    if (row.conformanceStatus === "SHARED_CAPABILITY_EXCEPTION" && !isApprovedException(row)) {
      errors.push(issue("GS06_UNAPPROVED_SHARED_CAPABILITY_EXCEPTION", { sourceId: row.sourceId }));
    }
    if (!productionGateValid(row)) {
      errors.push(issue("GS06_PRODUCTION_GATE_STATUS_MISMATCH", { sourceId: row.sourceId }));
    }
    if (!queueStateValid(row)) {
      errors.push(issue("GS06_QUEUE_STATE_STATUS_MISMATCH", { sourceId: row.sourceId }));
    }
  }

  const counts = statusCounts(rows);
  for (const status of GOLDEN_UNIT_CONFORMANCE_STATUSES) {
    if (registry.statusSummary?.[status] !== counts[status]) {
      errors.push(issue("GS06_STATUS_SUMMARY_DRIFT", {
        status,
        expected: counts[status],
        actual: registry.statusSummary?.[status],
      }));
    }
  }
  const activeRows = rows.filter((row) => row.queueState === "ACTIVE");
  if (activeRows.length > 1) {
    errors.push(issue("GS06_MULTIPLE_ACTIVE_UNITS", { actual: activeRows.length }));
  }
  const pendingOrdinals = rows
    .filter((row) => row.queueState === "PENDING")
    .map((row) => row.queueOrdinal)
    .sort((a, b) => a - b);
  if (pendingOrdinals.some((ordinal, index) => ordinal !== index + 1)) {
    errors.push(issue("GS06_PENDING_QUEUE_ORDINAL_DRIFT", { pendingOrdinals }));
  }

  return freeze({
    ok: errors.length === 0,
    errors,
    sourceUnitCount: units.length,
    rowCount: rows.length,
    counts,
    activeSourceId: activeRows[0]?.sourceId ?? null,
    pendingSourceIds: rows
      .filter((row) => row.queueState === "PENDING")
      .sort((a, b) => a.queueOrdinal - b.queueOrdinal)
      .map((row) => row.sourceId),
  });
}

export function validateGoldenBatchController(controller = {}, registry = {}, program = {}) {
  const errors = [];
  const registryAudit = validateGoldenUnitConformanceRegistry(registry);
  errors.push(...registryAudit.errors);

  if (controller.controllerId !== "G5AU08_GOLDEN_V1_BATCH_CONTROLLER"
    || controller.controllerVersion !== "1.0.0") {
    errors.push(issue("GS06_CONTROLLER_IDENTITY_INVALID"));
  }
  if (controller.status !== "ACTIVE_GOLDEN_D0_CONTROLLER") {
    errors.push(issue("GS06_CONTROLLER_NOT_ACTIVE", { actual: controller.status }));
  }
  if (controller.goldenContractId !== registry.goldenContractId
    || controller.goldenContractVersion !== registry.goldenContractVersion) {
    errors.push(issue("GS06_CONTROLLER_CONTRACT_DRIFT"));
  }
  if (controller.programCompletion?.taskBudget !== 6
    || controller.programCompletion?.completedCount !== 6
    || controller.programCompletion?.remainingCount !== 0) {
    errors.push(issue("GS06_CONTROLLER_PROGRAM_COMPLETION_INVALID"));
  }
  if (program.programId !== "G5AU08_GOLDEN_SAMPLE_V1"
    || program.programStatus !== "PASS_GOLDEN_D0_CLOSED"
    || program.completedCount !== 6
    || program.remainingCount !== 0
    || program.goalDistance !== "D0_G5AU08_GOLDEN_V1_CONTROLLER_ACTIVE_AND_CLOSED") {
    errors.push(issue("GS06_PROGRAM_STATE_NOT_D0_CLOSED"));
  }
  if (JSON.stringify(controller.programTaskOrder) !== JSON.stringify(program.taskOrder)) {
    errors.push(issue("GS06_PROGRAM_TASK_ORDER_DRIFT"));
  }

  const expectedComplete = registry.rows
    .filter((row) => row.queueState === "COMPLETE")
    .map((row) => row.sourceId);
  const expectedActive = registry.rows.find((row) => row.queueState === "ACTIVE")?.sourceId ?? null;
  const expectedPending = registry.rows
    .filter((row) => row.queueState === "PENDING")
    .sort((a, b) => a.queueOrdinal - b.queueOrdinal)
    .map((row) => row.sourceId);
  const expectedBlocked = registry.rows.filter((row) => row.queueState === "BLOCKED").map((row) => row.sourceId);
  const expectedExceptions = registry.rows.filter((row) => row.queueState === "EXCEPTION").map((row) => row.sourceId);

  if (JSON.stringify(controller.queue?.completeSourceIds) !== JSON.stringify(expectedComplete)) {
    errors.push(issue("GS06_COMPLETE_QUEUE_DRIFT"));
  }
  if (controller.queue?.activeSourceId !== expectedActive
    || controller.queue?.nextResumeSourceId !== expectedActive) {
    errors.push(issue("GS06_ACTIVE_QUEUE_DRIFT"));
  }
  if (JSON.stringify(controller.queue?.pendingSourceIds) !== JSON.stringify(expectedPending)) {
    errors.push(issue("GS06_PENDING_QUEUE_DRIFT"));
  }
  if (JSON.stringify(controller.queue?.blockedSourceIds) !== JSON.stringify(expectedBlocked)) {
    errors.push(issue("GS06_BLOCKED_QUEUE_DRIFT"));
  }
  if (JSON.stringify(controller.queue?.exceptionSourceIds) !== JSON.stringify(expectedExceptions)) {
    errors.push(issue("GS06_EXCEPTION_QUEUE_DRIFT"));
  }
  if (controller.stateMachine?.productionAdmissionRequiresGoldenConformant !== true
    || controller.antiDrift?.blockProductionWhenStatusNotGoldenConformant !== true
    || controller.antiDrift?.forbidSharedRuntimeBypass !== true) {
    errors.push(issue("GS06_REQUIRED_ANTI_DRIFT_POLICY_MISSING"));
  }
  if (controller.scopeBoundary?.executesUnitMigration !== false
    || controller.scopeBoundary?.postGoldenMigrationProgramApproved !== false) {
    errors.push(issue("GS06_SCOPE_BOUNDARY_INVALID"));
  }

  return freeze({
    ok: errors.length === 0,
    errors,
    registryAudit,
    queue: {
      completeCount: expectedComplete.length,
      activeCount: expectedActive ? 1 : 0,
      pendingCount: expectedPending.length,
      blockedCount: expectedBlocked.length,
      exceptionCount: expectedExceptions.length,
      nextResumeSourceId: expectedActive,
    },
  });
}

export function evaluateGoldenProductionGate(registry = {}, sourceId) {
  const row = registry.rows?.find((entry) => entry.sourceId === sourceId) ?? null;
  if (!row) {
    return freeze({
      allowed: false,
      code: "GS06_PRODUCTION_GATE_UNKNOWN_SOURCE_UNIT",
      sourceId,
      conformanceStatus: null,
    });
  }
  if (row.conformanceStatus !== PRODUCTION_ALLOWED_STATUS
    || row.goldenProductionEligible !== true
    || row.productionGate !== "allowed_golden_conformant") {
    return freeze({
      allowed: false,
      code: "GS06_PRODUCTION_GATE_REQUIRES_GOLDEN_CONFORMANT",
      sourceId,
      conformanceStatus: row.conformanceStatus,
    });
  }
  return freeze({
    allowed: true,
    code: "GS06_PRODUCTION_GATE_ALLOWED",
    sourceId,
    conformanceStatus: row.conformanceStatus,
  });
}

function parseNameStatus(nameStatusText = "") {
  return String(nameStatusText)
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [status, ...parts] = line.split(/\t+/);
      return { status, path: parts.at(-1) ?? "" };
    });
}

function unitSpecificRuntimePath(path) {
  const unitToken = /(?:g[3-6][ab][-_]u\d{1,2})/i.test(path);
  const runtimeToken = /(?:generator|validator|renderer)/i.test(path);
  const curriculumModule = /^site\/modules\/curriculum\//.test(path);
  const unitWorkflow = /^\.github\/workflows\//.test(path)
    && /(?:g[3-6][ab][-_]u\d{1,2})/i.test(path);
  return (curriculumModule && unitToken && runtimeToken) || unitWorkflow;
}

export function detectGoldenDiffDrift(nameStatusText = "") {
  const errors = [];
  const entries = parseNameStatus(nameStatusText);
  for (const entry of entries) {
    if (entry.status.startsWith("A") && unitSpecificRuntimePath(entry.path)) {
      errors.push(issue("GS06_ADDED_UNIT_SPECIFIC_RUNTIME_FILE", { path: entry.path }));
    }
  }
  return freeze({
    ok: errors.length === 0,
    errors,
    changedFileCount: entries.length,
    addedUnitSpecificRuntimeCount: errors.length,
  });
}
