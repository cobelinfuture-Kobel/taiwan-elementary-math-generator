import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const DEFAULT_SCHEMA_PATH = ".github/ci/workflow-registry.schema.json";
export const DEFAULT_REGISTRY_PATH = ".github/ci/workflow-registry.json";

const LIFECYCLES = new Set([
  "ACTIVE_REQUIRED",
  "ACTIVE_OPTIONAL",
  "WORKFLOW_DISPATCH_ONLY",
  "POST_MERGE_ONLY",
  "DEPRECATED",
  "RETIRED"
]);

const REQUIRED_CHECK_STATUSES = new Set([
  "REQUIRED",
  "OPTIONAL",
  "UNVERIFIED",
  "NOT_APPLICABLE"
]);

const FULL_REGRESSION_ROLES = new Set([
  "PR_AUTHORITY",
  "PR_DUPLICATE",
  "FOCUSED_ONLY",
  "POST_MERGE_GUARD",
  "NONE",
  "UNVERIFIED"
]);

const POLICY_DISPOSITIONS = new Set([
  "CONFORMANT",
  "NONCONFORMANT_PENDING_S02",
  "NONCONFORMANT_PENDING_S03",
  "REQUIRES_S01_INVENTORY",
  "NOT_APPLICABLE"
]);

const EXPECTED_POLICY = Object.freeze({
  maxTopLevelPrWorkflows: 1,
  maxRequiredPrChecks: 3,
  fullRegressionAuthorityCount: 1,
  prBranchWriterCount: 0,
  normalPushWaves: 1,
  remediationPushWavesPerCycle: 1,
  statusOnlyCommits: "FORBIDDEN",
  readbackOnlyCommits: "FORBIDDEN",
  hashOnlyCommits: "FORBIDDEN",
  ciSelfMutatingCommits: "FORBIDDEN",
  terminalBarrierRequired: true
});

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function addError(errors, code, detail) {
  errors.push({ code, detail });
}

export function validateGlobalCiHandshakeRegistry({
  schemaPath = DEFAULT_SCHEMA_PATH,
  registryPath = DEFAULT_REGISTRY_PATH
} = {}) {
  const schema = readJson(schemaPath);
  const registry = readJson(registryPath);
  const errors = [];
  const warnings = [];

  if (schema.$schema !== "https://json-schema.org/draft/2020-12/schema") {
    addError(errors, "GCI_SCHEMA_DRAFT_INVALID", schema.$schema);
  }
  if (schema.properties?.schemaVersion?.const !== "1.0.0") {
    addError(errors, "GCI_SCHEMA_VERSION_NOT_LOCKED", schema.properties?.schemaVersion);
  }
  if (registry.schemaVersion !== "1.0.0") {
    addError(errors, "GCI_REGISTRY_VERSION_INVALID", registry.schemaVersion);
  }
  if (registry.programId !== "GLOBAL_GITHUB_CI_HANDSHAKE_STANDARD_V1") {
    addError(errors, "GCI_PROGRAM_ID_INVALID", registry.programId);
  }
  if (!["BOOTSTRAP_PARTIAL", "COMPLETE"].includes(registry.inventoryCompleteness)) {
    addError(errors, "GCI_INVENTORY_COMPLETENESS_INVALID", registry.inventoryCompleteness);
  }
  if (!/^[0-9a-f]{40}$/.test(registry.inventoryAsOfCommit ?? "")) {
    addError(errors, "GCI_INVENTORY_COMMIT_INVALID", registry.inventoryAsOfCommit);
  }

  for (const [key, value] of Object.entries(EXPECTED_POLICY)) {
    if (registry.policyLock?.[key] !== value) {
      addError(errors, "GCI_POLICY_LOCK_MISMATCH", { key, expected: value, actual: registry.policyLock?.[key] });
    }
  }

  if (!Array.isArray(registry.workflows) || registry.workflows.length === 0) {
    addError(errors, "GCI_WORKFLOW_REGISTRY_EMPTY", registry.workflows);
  }

  const workflowIds = new Set();
  const workflowFiles = new Set();
  let prAuthorityCount = 0;

  for (const workflow of registry.workflows ?? []) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(workflow.workflowId ?? "")) {
      addError(errors, "GCI_WORKFLOW_ID_INVALID", workflow.workflowId);
    }
    if (workflowIds.has(workflow.workflowId)) {
      addError(errors, "GCI_WORKFLOW_ID_DUPLICATE", workflow.workflowId);
    }
    workflowIds.add(workflow.workflowId);

    if (!/^\.github\/workflows\/.+\.ya?ml$/.test(workflow.file ?? "")) {
      addError(errors, "GCI_WORKFLOW_FILE_INVALID", workflow.file);
    }
    if (workflowFiles.has(workflow.file)) {
      addError(errors, "GCI_WORKFLOW_FILE_DUPLICATE", workflow.file);
    }
    workflowFiles.add(workflow.file);

    if (!LIFECYCLES.has(workflow.lifecycle)) {
      addError(errors, "GCI_WORKFLOW_LIFECYCLE_INVALID", { workflowId: workflow.workflowId, lifecycle: workflow.lifecycle });
    }
    if (!REQUIRED_CHECK_STATUSES.has(workflow.requiredCheckStatus)) {
      addError(errors, "GCI_REQUIRED_CHECK_STATUS_INVALID", { workflowId: workflow.workflowId, value: workflow.requiredCheckStatus });
    }
    if (!FULL_REGRESSION_ROLES.has(workflow.fullRegressionRole)) {
      addError(errors, "GCI_FULL_REGRESSION_ROLE_INVALID", { workflowId: workflow.workflowId, value: workflow.fullRegressionRole });
    }
    if (!POLICY_DISPOSITIONS.has(workflow.policyDisposition)) {
      addError(errors, "GCI_POLICY_DISPOSITION_INVALID", { workflowId: workflow.workflowId, value: workflow.policyDisposition });
    }
    if (!Array.isArray(workflow.triggerClasses) || workflow.triggerClasses.length === 0) {
      addError(errors, "GCI_TRIGGER_CLASSES_EMPTY", workflow.workflowId);
    }
    if (!/^[0-9a-f]{40}$/.test(workflow.evidence?.blobSha ?? "")) {
      addError(errors, "GCI_EVIDENCE_BLOB_SHA_INVALID", workflow.workflowId);
    }
    if (!Array.isArray(workflow.evidence?.observations) || workflow.evidence.observations.length === 0) {
      addError(errors, "GCI_EVIDENCE_OBSERVATIONS_EMPTY", workflow.workflowId);
    }

    if (workflow.fullRegressionRole === "PR_AUTHORITY") prAuthorityCount += 1;

    if (workflow.writesPullRequestBranch === true) {
      if (!workflow.triggerClasses.includes("PULL_REQUEST")) {
        addError(errors, "GCI_BRANCH_WRITER_WITHOUT_PR_TRIGGER", workflow.workflowId);
      }
      if (workflow.policyDisposition !== "NONCONFORMANT_PENDING_S03") {
        addError(errors, "GCI_BRANCH_WRITER_NOT_FAIL_CLOSED", workflow.workflowId);
      }
      if (!workflow.successorWorkflowId || !workflow.retirementTaskId) {
        addError(errors, "GCI_BRANCH_WRITER_MISSING_RETIREMENT_LINEAGE", workflow.workflowId);
      }
    }

    if (workflow.fullRegressionRole === "PR_DUPLICATE"
      && !["NONCONFORMANT_PENDING_S02", "NONCONFORMANT_PENDING_S03"].includes(workflow.policyDisposition)) {
      addError(errors, "GCI_DUPLICATE_REGRESSION_NOT_RECONCILED", workflow.workflowId);
    }

    if (workflow.lifecycle === "POST_MERGE_ONLY" && workflow.triggerClasses.includes("PULL_REQUEST")) {
      addError(errors, "GCI_POST_MERGE_WORKFLOW_HAS_PR_TRIGGER", workflow.workflowId);
    }
  }

  if (prAuthorityCount !== registry.policyLock?.fullRegressionAuthorityCount) {
    addError(errors, "GCI_PR_AUTHORITY_COUNT_INVALID", {
      expected: registry.policyLock?.fullRegressionAuthorityCount,
      actual: prAuthorityCount
    });
  }

  const nonconformityIds = new Set();
  for (const item of registry.observedNonconformities ?? []) {
    if (!/^GCI-NC-[0-9]{3}$/.test(item.nonconformityId ?? "")) {
      addError(errors, "GCI_NONCONFORMITY_ID_INVALID", item.nonconformityId);
    }
    if (nonconformityIds.has(item.nonconformityId)) {
      addError(errors, "GCI_NONCONFORMITY_ID_DUPLICATE", item.nonconformityId);
    }
    nonconformityIds.add(item.nonconformityId);
    for (const workflowId of item.workflowIds ?? []) {
      if (!workflowIds.has(workflowId)) {
        addError(errors, "GCI_NONCONFORMITY_UNKNOWN_WORKFLOW", { nonconformityId: item.nonconformityId, workflowId });
      }
    }
  }

  if (registry.inventoryCompleteness === "BOOTSTRAP_PARTIAL") {
    warnings.push({
      code: "GCI_BOOTSTRAP_PARTIAL_INVENTORY",
      detail: "GCI-S01 must enumerate every workflow and replace bootstrap counts with exhaustive fan-out evidence."
    });
  }

  return {
    ok: errors.length === 0,
    schemaVersion: registry.schemaVersion,
    inventoryCompleteness: registry.inventoryCompleteness,
    workflowCount: registry.workflows?.length ?? 0,
    prFullRegressionAuthorityCount: prAuthorityCount,
    openNonconformityCount: (registry.observedNonconformities ?? []).filter((item) => item.status === "OPEN").length,
    errors,
    warnings
  };
}

export function runCli(args = process.argv.slice(2)) {
  const output = validateGlobalCiHandshakeRegistry({
    schemaPath: args[0] ?? DEFAULT_SCHEMA_PATH,
    registryPath: args[1] ?? DEFAULT_REGISTRY_PATH
  });
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
  if (!output.ok) process.exitCode = 1;
  return output;
}

const isCli = process.argv[1]
  && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isCli) runCli();
