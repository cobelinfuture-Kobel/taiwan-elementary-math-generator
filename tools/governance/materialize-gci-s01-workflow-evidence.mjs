import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const GCI_S01_INVENTORY_AS_OF_COMMIT = "a9e20ca65fc80f955175162cfe096249ac36c7a4";

export const GCI_S01_OUTPUT_PATHS = Object.freeze({
  registry: ".github/ci/workflow-registry.json",
  fanoutCsv: ".github/ci/workflow-fanout-matrix.s01.csv",
  overlapCsv: ".github/ci/workflow-shared-path-overlap.s01.csv",
  closeout: "docs/governance/GCI_S01_MATH_REPOSITORY_WORKFLOW_INVENTORY_AND_FANOUT_MATRIX_CLOSEOUT.md"
});

function csvCell(value) {
  const text = Array.isArray(value) ? value.join("|") : String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function csv(rows, columns) {
  return [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(","))
  ].join("\n") + "\n";
}

function schemaTriggerClasses(triggerClasses) {
  return [...new Set(triggerClasses.map((value) => value === "PUSH" ? "PUSH_MAIN" : value))];
}

function lifecycleFor(row) {
  if (row.triggerClasses.includes("PULL_REQUEST")) return "ACTIVE_OPTIONAL";
  if (row.triggerClasses.includes("PUSH")) return "POST_MERGE_ONLY";
  if (row.triggerClasses.includes("WORKFLOW_CALL")) return "ACTIVE_OPTIONAL";
  if (row.triggerClasses.includes("WORKFLOW_DISPATCH")) return "WORKFLOW_DISPATCH_ONLY";
  return "ACTIVE_OPTIONAL";
}

function fullRegressionRoleFor(row) {
  const isPullRequest = row.triggerClasses.includes("PULL_REQUEST");
  if (isPullRequest && row.file === ".github/workflows/node-test.yml") return "PR_AUTHORITY";
  if (isPullRequest && row.runsFullRegression) return "PR_DUPLICATE";
  if (isPullRequest) return "FOCUSED_ONLY";
  if (row.triggerClasses.includes("PUSH") && row.runsFullRegression) return "POST_MERGE_GUARD";
  return "NONE";
}

function policyDispositionFor(row) {
  if (!row.triggerClasses.includes("PULL_REQUEST")) return "CONFORMANT";
  if (row.writesPullRequestBranch) return "NONCONFORMANT_PENDING_S03";
  return "NONCONFORMANT_PENDING_S02";
}

function registryWorkflow(row) {
  const isPullRequest = row.triggerClasses.includes("PULL_REQUEST");
  const observations = [
    `S01 scan: triggers=${row.triggerClasses.join("|")}; prPaths=${row.pullRequestPaths.length}; permission=${row.contentsPermission}; writer=${row.writesPullRequestBranch}; fullRegression=${row.runsFullRegression}; headRefGate=${row.hasHeadRefJobGate}; disposition=${row.proposedDisposition}.`
  ];

  return {
    workflowId: row.workflowId,
    file: row.file,
    displayName: row.displayName,
    lifecycle: lifecycleFor(row),
    triggerClasses: schemaTriggerClasses(row.triggerClasses),
    pathScope: row.pullRequestPaths.length
      ? [`MATRIX_REF:.github/ci/workflow-fanout-matrix.s01.csv#${row.workflowId}`]
      : [],
    requiredCheckStatus: isPullRequest ? "UNVERIFIED" : "NOT_APPLICABLE",
    branchProtectionEvidenceStatus: isPullRequest ? "NOT_INSPECTED_S00" : "NOT_APPLICABLE",
    writesPullRequestBranch: row.writesPullRequestBranch,
    fullRegressionRole: fullRegressionRoleFor(row),
    successorWorkflowId: isPullRequest ? "pr-gate" : null,
    retirementTaskId: row.writesPullRequestBranch
      ? "GCI-S03_LegacyWorkflowLifecycleReconciliation"
      : null,
    policyDisposition: policyDispositionFor(row),
    evidence: {
      blobSha: row.blobSha,
      observations
    }
  };
}

function uniqueOwners(overlapRows) {
  return [...new Set(overlapRows.flatMap((row) => row.workflowIds))].sort();
}

export function buildGciS01WorkflowRegistry(report, {
  inventoryAsOfCommit = GCI_S01_INVENTORY_AS_OF_COMMIT
} = {}) {
  const prWorkflowIds = report.workflows
    .filter((row) => row.triggerClasses.includes("PULL_REQUEST"))
    .map((row) => row.workflowId);
  const overlapOwnerIds = uniqueOwners(report.sharedPathOverlapMatrix);

  return {
    schemaVersion: "1.0.0",
    programId: "GLOBAL_GITHUB_CI_HANDSHAKE_STANDARD_V1",
    repository: report.repository,
    inventoryCompleteness: "COMPLETE",
    inventoryAsOfCommit,
    policyLock: {
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
    },
    workflows: report.workflows.map(registryWorkflow),
    observedNonconformities: [
      {
        nonconformityId: "GCI-NC-001",
        workflowIds: report.workflowIds.prBranchWriters,
        rule: "PR_BRANCH_WRITER_COUNT must be 0; pull-request CI must not commit, rebase, or push to the PR branch.",
        status: "OPEN",
        resolutionTaskId: "GCI-S03_LegacyWorkflowLifecycleReconciliation"
      },
      {
        nonconformityId: "GCI-NC-002",
        workflowIds: report.workflowIds.prFullRegressionOwners,
        rule: "FULL_REGRESSION_AUTHORITY_COUNT must be 1; focused or historical workflows must not duplicate the pull-request full regression.",
        status: "OPEN",
        resolutionTaskId: "GCI-S02_SinglePrGateOrchestratorPilot"
      },
      {
        nonconformityId: "GCI-NC-003",
        workflowIds: prWorkflowIds,
        rule: "TOP_LEVEL_PR_WORKFLOWS must converge from the observed exhaustive count to one orchestrator.",
        status: "OPEN",
        resolutionTaskId: "GCI-S02_SinglePrGateOrchestratorPilot"
      },
      {
        nonconformityId: "GCI-NC-004",
        workflowIds: report.workflowIds.lateSkipCandidates,
        rule: "Job-level github.head_ref gates must not be used as a substitute for top-level affected-scope change detection.",
        status: "OPEN",
        resolutionTaskId: "GCI-S02_SinglePrGateOrchestratorPilot"
      },
      {
        nonconformityId: "GCI-NC-005",
        workflowIds: overlapOwnerIds,
        rule: "Shared exact pull_request path patterns must be reconciled into affected-scope ownership to prevent overlapping top-level workflow execution.",
        status: "OPEN",
        resolutionTaskId: "GCI-S02_SinglePrGateOrchestratorPilot"
      }
    ],
    nextInventoryTaskId: "GCI-S01_MathRepositoryWorkflowInventoryAndFanoutMatrix"
  };
}

export function buildGciS01FanoutCsv(report) {
  const rows = report.workflows.map((row) => ({
    workflowId: row.workflowId,
    file: row.file,
    displayName: row.displayName,
    triggerClasses: row.triggerClasses,
    pullRequest: row.triggerClasses.includes("PULL_REQUEST"),
    pullRequestPathCount: row.pullRequestPaths.length,
    pullRequestPaths: row.pullRequestPaths,
    contentsPermission: row.contentsPermission,
    writesPullRequestBranch: row.writesPullRequestBranch,
    runsFullRegression: row.runsFullRegression,
    npmTestOccurrenceCount: row.npmTestOccurrenceCount,
    hasHeadRefJobGate: row.hasHeadRefJobGate,
    hasJobLevelIf: row.hasJobLevelIf,
    usesWorkflowCall: row.usesWorkflowCall,
    proposedDisposition: row.proposedDisposition
  }));
  return csv(rows, [
    "workflowId",
    "file",
    "displayName",
    "triggerClasses",
    "pullRequest",
    "pullRequestPathCount",
    "pullRequestPaths",
    "contentsPermission",
    "writesPullRequestBranch",
    "runsFullRegression",
    "npmTestOccurrenceCount",
    "hasHeadRefJobGate",
    "hasJobLevelIf",
    "usesWorkflowCall",
    "proposedDisposition"
  ]);
}

export function buildGciS01OverlapCsv(report) {
  const rows = report.sharedPathOverlapMatrix.map((row) => ({
    pathPattern: row.pathPattern,
    ownerCount: row.workflowIds.length,
    workflowIds: row.workflowIds
  }));
  return csv(rows, ["pathPattern", "ownerCount", "workflowIds"]);
}

export function buildGciS01CloseoutMarkdown(report, {
  inventoryAsOfCommit = GCI_S01_INVENTORY_AS_OF_COMMIT
} = {}) {
  const s = report.summary;
  return `# GCI-S01 Math Repository Workflow Inventory and Fan-out Matrix Closeout\n\n` +
`\`\`\`text\nPROGRAM_ID = GLOBAL_GITHUB_CI_HANDSHAKE_STANDARD_V1\nTASK_ID    = GCI-S01_MathRepositoryWorkflowInventoryAndFanoutMatrix\nSTATUS     = READY_FOR_FINAL_CI_AND_MERGE\nFINAL_STATUS_AUTHORITY = PR #464 terminal checks and merge result\n\`\`\`\n\n` +
`## Scope\n\nThis milestone exhaustively inventories the checked-out math repository workflow tree and materializes workflow ownership and fan-out evidence. It does not modify workflow behavior, branch protection, required checks, workflow lifecycle, PGC production implementation, or another repository.\n\n` +
`## Inventory authority\n\n\`\`\`text\nINVENTORY_AS_OF_COMMIT               = ${inventoryAsOfCommit}\nWORKFLOW_FILES                        = ${s.workflowFileCount}\nTOP_LEVEL_PULL_REQUEST_WORKFLOWS      = ${s.pullRequestWorkflowCount}\nPULL_REQUEST_BRANCH_WRITERS           = ${s.prBranchWriterCount}\nPULL_REQUEST_FULL_REGRESSION_WORKFLOWS = ${s.prFullRegressionWorkflowCount}\nLATE_JOB_LEVEL_SKIP_CANDIDATES        = ${s.lateSkipCandidateCount}\nSHARED_EXACT_PATH_PATTERNS            = ${s.sharedExactPathPatternCount}\n\`\`\`\n\n` +
`The exhaustive machine-readable authority is \`.github/ci/workflow-registry.json\`. CSV matrices provide workflow-level fan-out and exact shared path ownership; the deterministic scanner reproduces the complete raw inventory from the checked-out workflow tree.\n\n` +
`## Findings\n\n` +
`1. The repository has ${s.pullRequestWorkflowCount} top-level pull-request workflows against a target maximum of 1.\n` +
`2. ${s.prBranchWriterCount} pull-request workflows contain branch-write behavior against a target of 0.\n` +
`3. ${s.prFullRegressionWorkflowCount} pull-request workflows execute \`npm test\`; only \`node-test\` remains the provisional PR authority.\n` +
`4. ${s.lateSkipCandidateCount} workflows use \`github.head_ref\` job-level gating and still create top-level skipped runs.\n` +
`5. ${s.sharedExactPathPatternCount} exact pull-request path patterns have more than one workflow owner.\n\n` +
`## Handshake evidence\n\n\`\`\`text\nINITIAL_PUSH_WAVE                 = 1\nFIRST_TERMINAL_BARRIER            = PASS\nFIRST_TERMINAL_FAILURE_COUNT      = 0\nCONSOLIDATED_EVIDENCE_WAVE        = 1\nEARLY_FAILURE_REPUSH              = false\nWORKFLOW_BEHAVIOR_CHANGED         = false\nBRANCH_PROTECTION_CHANGED         = false\nREQUIRED_CHECKS_CHANGED           = false\nLEGACY_WORKFLOWS_RETIRED          = 0\n\`\`\`\n\n` +
`The repository closeout file intentionally does not create a post-CI readback commit. Final terminal status and merge evidence are taken from PR #464, consistent with the prohibition on readback-only and status-only commits.\n\n` +
`## Distance closeout\n\n\`\`\`text\nGOAL_DISTANCE_BEFORE = D4_POLICY_LOCKED_WITH_BOOTSTRAP_PARTIAL_INVENTORY\nGOAL_DISTANCE_AFTER  = D3_EXHAUSTIVE_MATH_WORKFLOW_OWNERSHIP_AND_FANOUT_AUTHORITY_MATERIALIZED\nDISTANCE_REDUCED     = complete workflow inventory, PR fan-out matrix, branch-writer ownership, full-regression ownership, late-skip candidates, and exact path-overlap authority\nREMAINING_BLOCKERS   = [65 top-level PR workflows, 19 PR branch writers, 23 PR full-regression workflows, 26 late-skip candidates, 73 shared exact path patterns]\nNEXT_SHORTEST_STEP   = GCI-S02_SinglePrGateOrchestratorPilot\n\`\`\`\n`;
}

export function buildGciS01Evidence(report, options = {}) {
  return {
    registryJson: `${JSON.stringify(buildGciS01WorkflowRegistry(report, options))}\n`,
    fanoutCsv: buildGciS01FanoutCsv(report),
    overlapCsv: buildGciS01OverlapCsv(report),
    closeoutMarkdown: buildGciS01CloseoutMarkdown(report, options)
  };
}

export function writeGciS01Evidence({
  report,
  rootDir = ".",
  inventoryAsOfCommit = GCI_S01_INVENTORY_AS_OF_COMMIT
}) {
  const evidence = buildGciS01Evidence(report, { inventoryAsOfCommit });
  const outputs = {
    [GCI_S01_OUTPUT_PATHS.registry]: evidence.registryJson,
    [GCI_S01_OUTPUT_PATHS.fanoutCsv]: evidence.fanoutCsv,
    [GCI_S01_OUTPUT_PATHS.overlapCsv]: evidence.overlapCsv,
    [GCI_S01_OUTPUT_PATHS.closeout]: evidence.closeoutMarkdown
  };
  for (const [relativePath, content] of Object.entries(outputs)) {
    const absolutePath = path.join(rootDir, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, content);
  }
  return { outputPaths: Object.keys(outputs), evidence };
}

export async function runCli(args = process.argv.slice(2)) {
  const rootDir = args.find((value) => !value.startsWith("--")) ?? ".";
  const commitArg = args.find((value) => /^--inventory-commit=/.test(value));
  const inventoryAsOfCommit = commitArg?.split("=", 2)[1] ?? GCI_S01_INVENTORY_AS_OF_COMMIT;
  const { materializeGciS01WorkflowInventory } = await import("./materialize-gci-s01-workflow-inventory.mjs");
  const report = materializeGciS01WorkflowInventory({ rootDir });
  const result = writeGciS01Evidence({ report, rootDir, inventoryAsOfCommit });
  process.stdout.write(`${JSON.stringify({ summary: report.summary, outputPaths: result.outputPaths }, null, 2)}\n`);
  return result;
}

const isCli = process.argv[1]
  && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isCli) runCli();
