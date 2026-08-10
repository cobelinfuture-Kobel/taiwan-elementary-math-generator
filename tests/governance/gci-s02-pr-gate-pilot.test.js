import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  materializeGciS01WorkflowInventory
} from "../../tools/governance/materialize-gci-s01-workflow-inventory.mjs";

const WORKFLOW_FILE = ".github/workflows/pr-gate.yml";
const CONTRACT_FILE = ".github/ci/gci-s02/pr-gate-pilot-contract.json";
const TEMPORARY_WORKFLOW_FILES = [
  ".github/workflows/pgc-r06-a07-final-global-live-d0-closeout.yml",
];
const POST_S01_WORKFLOW_FILES = [
  ".github/workflows/pgc-r06-a02-g5a-u02-live-diagnostics.yml",
  ".github/workflows/pgc-r06-a03-capacity-public-runtime-repair-reconciliation.yml",
  ".github/workflows/p03f25-exact-head-product-acceptance.yml",
  ".github/workflows/p03f-slice029-product-acceptance.yml",
  ".github/workflows/p03f-slice030-product-acceptance.yml",
  ".github/workflows/p03f-slice031-product-acceptance.yml",
  ...TEMPORARY_WORKFLOW_FILES,
];

const compareCodePoint = (left, right) => left < right ? -1 : left > right ? 1 : 0;

test("GCI-S02 PR gate pilot is read-only and structurally complete", () => {
  const workflow = fs.readFileSync(WORKFLOW_FILE, "utf8");
  const contract = JSON.parse(fs.readFileSync(CONTRACT_FILE, "utf8"));

  assert.match(workflow, /^name: PR Gate Pilot$/m);
  assert.match(workflow, /^\s{2}contents: read$/m);
  assert.match(workflow, /group: pr-gate-\$\{\{ github\.event\.pull_request\.number \|\| github\.ref \}\}/);
  assert.match(workflow, /cancel-in-progress: true/);

  assert.match(workflow, /^\s{2}detect_changes:$/m);
  assert.match(workflow, /^\s{2}focused_governance:$/m);
  assert.match(workflow, /^\s{2}full_regression:$/m);
  assert.match(workflow, /^\s{2}aggregate:$/m);
  assert.match(workflow, /name: PR Gate \/ aggregate/);

  assert.equal((workflow.match(/(?:^|\s)npm\s+test(?:\s|$)/gm) ?? []).length, 1);
  assert.doesNotMatch(workflow, /\bgit\s+(?:commit|push|rebase)\b/);
  assert.match(workflow, /uses: actions\/upload-artifact@v4/);

  assert.equal(contract.mode, "PILOT_GOVERNANCE_PATHS_ONLY");
  assert.equal(contract.permissions.contents, "read");
  assert.equal(contract.fullRegressionOccurrenceCount, 1);
  assert.equal(contract.writesPullRequestBranch, false);
  assert.equal(contract.legacyPullRequestWorkflowsModified, false);
  assert.equal(contract.branchProtectionModified, false);
  assert.equal(contract.aggregateCheckName, "PR Gate / aggregate");
  assert.equal(contract.legacyWorkflowRetirementStatus, "DEFERRED_TO_GCI_S03");
  assert.equal(contract.requiredCheckMigrationStatus, "DEFERRED_TO_GCI_S04");
});

test("GCI-S02 PR gate is visible in the live workflow inventory without mutating S01 history", () => {
  const current = materializeGciS01WorkflowInventory({
    excludeFiles: TEMPORARY_WORKFLOW_FILES
  });
  const historical = materializeGciS01WorkflowInventory({
    excludeFiles: [WORKFLOW_FILE, ...POST_S01_WORKFLOW_FILES]
  });

  // S01 owns the absolute historical inventory. S02 owns the exact approved
  // live delta, which must stay stable whether CI checks out the PR head or
  // GitHub's synthetic merge ref with inherited non-PR workflows.
  const historicalFiles = new Set(historical.workflows.map((row) => row.file));
  const approvedLiveDelta = [WORKFLOW_FILE, ...POST_S01_WORKFLOW_FILES]
    .filter((file) => !TEMPORARY_WORKFLOW_FILES.includes(file) && fs.existsSync(file))
    .sort(compareCodePoint);
  const observedLiveDelta = current.workflows
    .map((row) => row.file)
    .filter((file) => !historicalFiles.has(file))
    .sort(compareCodePoint);

  assert.deepEqual(observedLiveDelta, approvedLiveDelta);
  assert.equal(current.summary.workflowFileCount, historical.summary.workflowFileCount + approvedLiveDelta.length);
  assert.equal(current.summary.pullRequestWorkflowCount, 73);
  assert.equal(current.summary.prBranchWriterCount, 22);
  assert.equal(current.summary.prFullRegressionWorkflowCount, 27);
  assert.equal(current.summary.lateSkipCandidateCount, 32);
  assert.ok(current.summary.sharedExactPathPatternCount >= 79);

  const prGate = current.workflows.find((row) => row.file === WORKFLOW_FILE);
  assert.ok(prGate, "PR gate must be present in the live workflow inventory");
  assert.deepEqual(prGate.triggerClasses, ["PULL_REQUEST", "WORKFLOW_DISPATCH"]);
  assert.equal(prGate.contentsPermission, "read");
  assert.equal(prGate.writesPullRequestBranch, false);
  assert.equal(prGate.runsFullRegression, true);
  assert.equal(prGate.npmTestOccurrenceCount, 1);
  assert.equal(prGate.proposedDisposition, "PILOT_ORCHESTRATOR");

  assert.equal(historical.summary.pullRequestWorkflowCount, 66);
  assert.equal(historical.summary.prFullRegressionWorkflowCount, 24);
  assert.ok(!historical.workflows.some((row) => row.file === WORKFLOW_FILE));
  assert.ok(!historical.workflows.some((row) => row.file === ".github/workflows/p03f-slice029-product-acceptance.yml"));
  assert.ok(!historical.workflows.some((row) => row.file === ".github/workflows/p03f-slice030-product-acceptance.yml"));
  assert.ok(!historical.workflows.some((row) => row.file === ".github/workflows/p03f-slice031-product-acceptance.yml"));
});

// PGC-R06 A03 historical authority and workflow governance compatibility
