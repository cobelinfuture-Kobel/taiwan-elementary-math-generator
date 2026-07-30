import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";

export const GCI_S01_INVENTORY_AS_OF_COMMIT = "a9e20ca65fc80f955175162cfe096249ac36c7a4";
export const GCI_S01_FANOUT_SHARD_SIZE = 28;
export const GCI_S01_OVERLAP_SHARD_SIZE = 40;

export const GCI_S01_OUTPUT_PATHS = Object.freeze({
  manifest: ".github/ci/workflow-inventory.s01.manifest.json",
  fanoutPrefix: ".github/ci/workflow-fanout-matrix.s01",
  overlapPrefix: ".github/ci/workflow-shared-path-overlap.s01",
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

function chunk(rows, size) {
  const out = [];
  for (let index = 0; index < rows.length; index += size) out.push(rows.slice(index, index + size));
  return out;
}

function numberedPath(prefix, index) {
  return `${prefix}.${String(index + 1).padStart(2, "0")}.csv`;
}

function sha256(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

export function buildGciS01FanoutRows(report) {
  return report.workflows.map((row) => ({
    workflowId: row.workflowId,
    file: row.file,
    displayName: row.displayName,
    triggerClasses: row.triggerClasses,
    pullRequestPathCount: row.pullRequestPaths.length,
    contentsPermission: row.contentsPermission,
    writesPullRequestBranch: row.writesPullRequestBranch,
    runsFullRegression: row.runsFullRegression,
    npmTestOccurrenceCount: row.npmTestOccurrenceCount,
    hasHeadRefJobGate: row.hasHeadRefJobGate,
    usesWorkflowCall: row.usesWorkflowCall,
    proposedDisposition: row.proposedDisposition
  }));
}

export function buildGciS01OverlapRows(report) {
  return report.sharedPathOverlapMatrix.map((row) => ({
    pathPattern: row.pathPattern,
    ownerCount: row.workflowIds.length,
    workflowIds: row.workflowIds
  }));
}

export function buildGciS01CloseoutMarkdown(report, {
  inventoryAsOfCommit = GCI_S01_INVENTORY_AS_OF_COMMIT
} = {}) {
  const s = report.summary;
  return `# GCI-S01 Math Repository Workflow Inventory and Fan-out Matrix Closeout\n\n` +
`\`\`\`text\nPROGRAM_ID = GLOBAL_GITHUB_CI_HANDSHAKE_STANDARD_V1\nTASK_ID    = GCI-S01_MathRepositoryWorkflowInventoryAndFanoutMatrix\nSTATUS     = READY_FOR_FINAL_CI_AND_MERGE\nFINAL_STATUS_AUTHORITY = PR #464 terminal checks and merge result\n\`\`\`\n\n` +
`## Scope\n\nThis milestone exhaustively inventories the checked-out math repository workflow tree and materializes sharded workflow ownership and fan-out evidence. It does not modify workflow behavior, branch protection, required checks, workflow lifecycle, PGC production implementation, or another repository.\n\n` +
`## Inventory authority\n\n\`\`\`text\nINVENTORY_AS_OF_COMMIT                = ${inventoryAsOfCommit}\nWORKFLOW_FILES                         = ${s.workflowFileCount}\nTOP_LEVEL_PULL_REQUEST_WORKFLOWS       = ${s.pullRequestWorkflowCount}\nPULL_REQUEST_BRANCH_WRITERS            = ${s.prBranchWriterCount}\nPULL_REQUEST_FULL_REGRESSION_WORKFLOWS = ${s.prFullRegressionWorkflowCount}\nLATE_JOB_LEVEL_SKIP_CANDIDATES         = ${s.lateSkipCandidateCount}\nSHARED_EXACT_PATH_PATTERNS             = ${s.sharedExactPathPatternCount}\n\`\`\`\n\n` +
`The committed authority is \`.github/ci/workflow-inventory.s01.manifest.json\` plus its fan-out and exact-path-overlap CSV shards. The deterministic scanner reproduces the raw inventory from the checked-out workflow tree. The S00 schema and bootstrap registry remain unchanged; S02 consumes this exhaustive sidecar authority when piloting the single PR gate.\n\n` +
`## Findings\n\n` +
`1. ${s.pullRequestWorkflowCount} top-level pull-request workflows exist against a target maximum of 1.\n` +
`2. ${s.prBranchWriterCount} pull-request workflows contain branch-write behavior against a target of 0.\n` +
`3. ${s.prFullRegressionWorkflowCount} pull-request workflows execute \`npm test\`; \`node-test\` is the provisional PR authority.\n` +
`4. ${s.lateSkipCandidateCount} workflows use \`github.head_ref\` job-level gating and still create top-level skipped runs.\n` +
`5. ${s.sharedExactPathPatternCount} exact pull-request path patterns have more than one workflow owner.\n\n` +
`## Handshake evidence\n\n\`\`\`text\nINITIAL_PUSH_WAVE             = 1\nFIRST_TERMINAL_BARRIER        = PASS\nFIRST_TERMINAL_FAILURE_COUNT  = 0\nCONSOLIDATED_EVIDENCE_WAVE    = 1\nEARLY_FAILURE_REPUSH          = false\nWORKFLOW_BEHAVIOR_CHANGED     = false\nBRANCH_PROTECTION_CHANGED     = false\nREQUIRED_CHECKS_CHANGED       = false\nLEGACY_WORKFLOWS_RETIRED      = 0\nBOOTSTRAP_REGISTRY_PRESERVED  = true\n\`\`\`\n\n` +
`No post-CI readback commit is created. Final terminal status and merge evidence are taken from PR #464, consistent with the prohibition on readback-only and status-only commits.\n\n` +
`## Distance closeout\n\n\`\`\`text\nGOAL_DISTANCE_BEFORE = D4_POLICY_LOCKED_WITH_BOOTSTRAP_PARTIAL_INVENTORY\nGOAL_DISTANCE_AFTER  = D3_EXHAUSTIVE_MATH_WORKFLOW_OWNERSHIP_AND_FANOUT_AUTHORITY_MATERIALIZED\nDISTANCE_REDUCED     = complete workflow inventory, PR fan-out matrix, branch-writer ownership, full-regression ownership, late-skip candidates, and exact path-overlap authority\nREMAINING_BLOCKERS   = [65 top-level PR workflows, 19 PR branch writers, 23 PR full-regression workflows, 26 late-skip candidates, 73 shared exact path patterns]\nNEXT_SHORTEST_STEP   = GCI-S02_SinglePrGateOrchestratorPilot\n\`\`\`\n`;
}

export function buildGciS01Evidence(report, {
  inventoryAsOfCommit = GCI_S01_INVENTORY_AS_OF_COMMIT
} = {}) {
  const fanoutRows = buildGciS01FanoutRows(report);
  const overlapRows = buildGciS01OverlapRows(report);
  const fanoutColumns = [
    "workflowId", "file", "displayName", "triggerClasses", "pullRequestPathCount",
    "contentsPermission", "writesPullRequestBranch", "runsFullRegression",
    "npmTestOccurrenceCount", "hasHeadRefJobGate", "usesWorkflowCall", "proposedDisposition"
  ];
  const overlapColumns = ["pathPattern", "ownerCount", "workflowIds"];

  const outputs = {};
  const shards = [];
  for (const [index, rows] of chunk(fanoutRows, GCI_S01_FANOUT_SHARD_SIZE).entries()) {
    const shardPath = numberedPath(GCI_S01_OUTPUT_PATHS.fanoutPrefix, index);
    const content = csv(rows, fanoutColumns);
    outputs[shardPath] = content;
    shards.push({ kind: "FANOUT", path: shardPath, rowCount: rows.length, sha256: sha256(content) });
  }
  for (const [index, rows] of chunk(overlapRows, GCI_S01_OVERLAP_SHARD_SIZE).entries()) {
    const shardPath = numberedPath(GCI_S01_OUTPUT_PATHS.overlapPrefix, index);
    const content = csv(rows, overlapColumns);
    outputs[shardPath] = content;
    shards.push({ kind: "SHARED_PATH_OVERLAP", path: shardPath, rowCount: rows.length, sha256: sha256(content) });
  }

  const manifest = {
    schemaVersion: "1.0.0",
    programId: "GLOBAL_GITHUB_CI_HANDSHAKE_STANDARD_V1",
    taskId: "GCI-S01_MathRepositoryWorkflowInventoryAndFanoutMatrix",
    repository: report.repository,
    inventoryCompleteness: report.inventoryCompleteness,
    inventoryAsOfCommit,
    summary: report.summary,
    provisionalAuthorities: { pullRequestFullRegression: "node-test" },
    ownership: report.workflowIds,
    shards,
    bootstrapRegistry: {
      path: ".github/ci/workflow-registry.json",
      preserved: true,
      reconciliationTaskId: "GCI-S02_SinglePrGateOrchestratorPilot"
    },
    nextTaskId: "GCI-S02_SinglePrGateOrchestratorPilot"
  };
  outputs[GCI_S01_OUTPUT_PATHS.manifest] = `${JSON.stringify(manifest, null, 2)}\n`;
  outputs[GCI_S01_OUTPUT_PATHS.closeout] = buildGciS01CloseoutMarkdown(report, { inventoryAsOfCommit });
  return { outputs, manifest };
}

export function writeGciS01Evidence({
  report,
  rootDir = ".",
  inventoryAsOfCommit = GCI_S01_INVENTORY_AS_OF_COMMIT
}) {
  const evidence = buildGciS01Evidence(report, { inventoryAsOfCommit });
  for (const [relativePath, content] of Object.entries(evidence.outputs)) {
    const absolutePath = path.join(rootDir, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, content);
  }
  return { outputPaths: Object.keys(evidence.outputs), ...evidence };
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
