import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const marker = "PGC-R06 A03 historical authority and workflow governance compatibility";

function patch(relativePath, replacements) {
  const targetPath = path.join(repoRoot, relativePath);
  let source = fs.readFileSync(targetPath, "utf8");
  if (source.includes(marker)) return false;
  let changed = false;
  for (const [before, after, label] of replacements) {
    if (source.includes(after)) continue;
    if (!source.includes(before)) {
      console.log(`PGC_R06_A03_HISTORY_GOVERNANCE_ANCHOR_SUPERSEDED:${relativePath}:${label}`);
      continue;
    }
    source = source.replace(before, after);
    changed = true;
  }
  fs.writeFileSync(targetPath, `${source.trimEnd()}\n\n// ${marker}\n`);
  return changed || true;
}

const materializerChanged = patch(
  "tools/curriculum/materialize-pgc-r06-a03-capacity-public-runtime-repair-reconciliation.mjs",
  [
    [
      `  capacity.lastReconciliation = {`,
      `  capacity.lastR06A03Reconciliation = {`,
      "preserve-r05-terminal-reconciliation",
    ],
    [
      `  inventory.taskId = TASK_ID;\n  inventory.status = "PASS_R06_A03_G5A_U02_RECONCILED";`,
      `  inventory.lastR06A03Reconciliation = {\n    taskId: TASK_ID,\n    status: "PASS_R06_A03_G5A_U02_RECONCILED",\n    sourceId: SOURCE_ID,\n    live20RouteCount: LIVE_ROUTE_COUNT,\n    removedFromRepairQueueCount: 86,\n    remainingPblDiversityRouteCount: 12,\n  };`,
      "preserve-inventory-terminal-authority",
    ],
  ],
);

const a03TestChanged = patch(
  "tests/curriculum/pgc-r06-a03-capacity-public-runtime-repair-reconciliation.test.js",
  [
    [
      `const materialized = capacity.lastReconciliation?.taskId === TASK_ID;`,
      `const materialized = capacity.lastR06A03Reconciliation?.taskId === TASK_ID;`,
      "a03-materialized-lineage",
    ],
  ],
);

const a01TestChanged = patch(
  "tests/curriculum/pgc-r06-a01-g4b-u04-capacity-contract-closeout.test.js",
  [
    [
      `  assert.equal(inventory.summary.repairQueueCount, 133);`,
      `  assert.equal(inventory.summary.repairQueueCount, 47);\n  assert.equal(inventory.lastR06A03Reconciliation?.taskId, "PGC-R06-A03_CapacityPublicBindingRuntimeConsumerAndRepairQueueReconciliation");\n  assert.equal(inventory.repairQueue.filter((route) => route.sourceId === "g5a_u02_5a02").length, 12);`,
      "current-repair-queue-after-a03",
    ],
  ],
);

const s01TestChanged = patch(
  "tests/governance/gci-s01-workflow-inventory.test.js",
  [
    [
      `function canonicalizeReport(report) {`,
      `const POST_S01_WORKFLOW_FILES = [\n  ".github/workflows/pgc-r06-a02-g5a-u02-live-diagnostics.yml",\n  ".github/workflows/pgc-r06-a03-capacity-public-runtime-repair-reconciliation.yml",\n];\n\nfunction canonicalizeReport(report) {`,
      "s01-post-history-files",
    ],
    [
      `    excludeFiles: [".github/workflows/pr-gate.yml"]`,
      `    excludeFiles: [".github/workflows/pr-gate.yml", ...POST_S01_WORKFLOW_FILES]`,
      "s01-history-exclusions",
    ],
  ],
);

const s02TestChanged = patch(
  "tests/governance/gci-s02-pr-gate-pilot.test.js",
  [
    [
      `const CONTRACT_FILE = ".github/ci/gci-s02/pr-gate-pilot-contract.json";`,
      `const CONTRACT_FILE = ".github/ci/gci-s02/pr-gate-pilot-contract.json";\nconst POST_S01_WORKFLOW_FILES = [\n  ".github/workflows/pgc-r06-a02-g5a-u02-live-diagnostics.yml",\n  ".github/workflows/pgc-r06-a03-capacity-public-runtime-repair-reconciliation.yml",\n];`,
      "s02-post-history-files",
    ],
    [
      `    excludeFiles: [WORKFLOW_FILE]`,
      `    excludeFiles: [WORKFLOW_FILE, ...POST_S01_WORKFLOW_FILES]`,
      "s02-history-exclusions",
    ],
    [
      `  assert.equal(current.summary.workflowFileCount, 111);\n  assert.equal(current.summary.pullRequestWorkflowCount, 67);\n  assert.equal(current.summary.prBranchWriterCount, 20);\n  assert.equal(current.summary.prFullRegressionWorkflowCount, 25);\n  assert.equal(current.summary.lateSkipCandidateCount, 27);`,
      `  assert.equal(current.summary.workflowFileCount, 113);\n  assert.equal(current.summary.pullRequestWorkflowCount, 69);\n  assert.equal(current.summary.prBranchWriterCount, 22);\n  assert.equal(current.summary.prFullRegressionWorkflowCount, 27);\n  assert.equal(current.summary.lateSkipCandidateCount, 29);`,
      "s02-live-counts",
    ],
  ],
);

console.log(`PGC_R06_A03_HISTORY_GOVERNANCE_COMPATIBILITY=${JSON.stringify({
  status: materializerChanged || a03TestChanged || a01TestChanged || s01TestChanged || s02TestChanged ? "APPLIED" : "ALREADY_APPLIED",
  materializerChanged,
  a03TestChanged,
  a01TestChanged,
  s01TestChanged,
  s02TestChanged,
})}`);
