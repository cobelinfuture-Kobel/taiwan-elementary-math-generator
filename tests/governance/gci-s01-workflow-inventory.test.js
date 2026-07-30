import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  materializeGciS01WorkflowInventory
} from "../../tools/governance/materialize-gci-s01-workflow-inventory.mjs";
import {
  buildGciS01Evidence
} from "../../tools/governance/materialize-gci-s01-workflow-evidence.mjs";

const EXPECTED_SUMMARY = {
  workflowFileCount: 109,
  pullRequestWorkflowCount: 65,
  prBranchWriterCount: 19,
  prFullRegressionWorkflowCount: 23,
  lateSkipCandidateCount: 26,
  sharedExactPathPatternCount: 73
};

test("GCI-S01 exhaustively inventories workflows and locks deterministic fan-out evidence", () => {
  const report = materializeGciS01WorkflowInventory();
  assert.equal(report.inventoryCompleteness, "COMPLETE_FROM_CHECKED_OUT_MAIN_TREE");
  assert.deepEqual(report.summary, EXPECTED_SUMMARY);

  const evidence = buildGciS01Evidence(report);
  assert.equal(evidence.manifest.authority.mode, "DETERMINISTIC_ON_DEMAND");
  assert.match(evidence.manifest.authority.sha256, /^[0-9a-f]{64}$/);
  assert.ok(evidence.manifest.authority.bytes > 200000);
  assert.equal(evidence.manifest.matrixRowCounts.workflows, 109);
  assert.equal(evidence.manifest.matrixRowCounts.triggerMatrix, 109);
  assert.equal(evidence.manifest.matrixRowCounts.ownershipMatrix, 109);
  assert.equal(evidence.manifest.matrixRowCounts.sharedPathOverlapMatrix, 73);
  assert.equal(evidence.manifest.bootstrapRegistry.preserved, true);
  assert.equal(evidence.manifest.nextTaskId, "GCI-S02_SinglePrGateOrchestratorPilot");

  for (const [relativePath, expected] of Object.entries(evidence.outputs)) {
    assert.equal(fs.readFileSync(relativePath, "utf8"), expected, `stale GCI-S01 evidence: ${relativePath}`);
  }
});
