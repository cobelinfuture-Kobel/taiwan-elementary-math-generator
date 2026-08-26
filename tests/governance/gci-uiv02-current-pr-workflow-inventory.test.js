import assert from "node:assert/strict";
import test from "node:test";

import { inventoryCurrentPrWorkflows } from "../../tools/governance/inventory-current-pr-workflows.mjs";

test("GCI-UIV02 current PR workflow inventory is exhaustive and deterministic", () => {
  const inventory = inventoryCurrentPrWorkflows();
  assert.equal(inventory.schemaVersion, "1.0.0");
  assert.equal(inventory.taskId, "GCI-UIV02_RemainingPrFanoutInventoryAndRequiredCheckEnforcement");
  assert.ok(inventory.summary.workflowFileCount > 0);
  assert.equal(inventory.workflows.length, inventory.summary.workflowFileCount);
  assert.equal(new Set(inventory.workflows.map((row) => row.file)).size, inventory.workflows.length);
  assert.deepEqual(
    inventory.pullRequestWorkflowPaths,
    inventory.workflows
      .filter((row) => row.pullRequestTrigger || row.pullRequestTargetTrigger)
      .map((row) => row.file),
  );
  assert.deepEqual(
    inventory.prBranchWriterPaths,
    inventory.workflows
      .filter((row) => (row.pullRequestTrigger || row.pullRequestTargetTrigger) && row.writesPullRequestBranchPotentially)
      .map((row) => row.file),
  );
  assert.deepEqual(
    inventory.prFullRegressionWorkflowPaths,
    inventory.workflows
      .filter((row) => (row.pullRequestTrigger || row.pullRequestTargetTrigger) && row.hasFullRegression)
      .map((row) => row.file),
  );
});

test("retired R05 workflows no longer participate in pull-request fanout", () => {
  const inventory = inventoryCurrentPrWorkflows();
  for (const file of [
    ".github/workflows/pgc-r05-application-generation-full-fix.yml",
    ".github/workflows/pgc-r05-capacity-contract-reconciliation-d0-closeout.yml",
  ]) {
    assert.ok(!inventory.pullRequestWorkflowPaths.includes(file), file);
    assert.ok(!inventory.prBranchWriterPaths.includes(file), file);
    assert.ok(!inventory.prFullRegressionWorkflowPaths.includes(file), file);
  }
});

test("PR Gate remains present as the canonical pull-request validation orchestrator", () => {
  const inventory = inventoryCurrentPrWorkflows();
  const gate = inventory.workflows.find((row) => row.file === ".github/workflows/pr-gate.yml");
  assert.ok(gate);
  assert.equal(gate.pullRequestTrigger, true);
  assert.equal(gate.contentsPermission, "read");
  assert.equal(gate.writesPullRequestBranchPotentially, false);
});
