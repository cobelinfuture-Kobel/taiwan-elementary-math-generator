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

test("GCI-S01 exhaustively inventories workflows and keeps committed fan-out evidence deterministic", () => {
  const report = materializeGciS01WorkflowInventory();
  assert.equal(report.inventoryCompleteness, "COMPLETE_FROM_CHECKED_OUT_MAIN_TREE");
  assert.deepEqual(report.summary, EXPECTED_SUMMARY);

  const evidence = buildGciS01Evidence(report);
  assert.equal(evidence.manifest.shards.filter((row) => row.kind === "FANOUT").length, 4);
  assert.equal(evidence.manifest.shards.filter((row) => row.kind === "SHARED_PATH_OVERLAP").length, 2);
  assert.equal(
    evidence.manifest.shards.filter((row) => row.kind === "FANOUT").reduce((sum, row) => sum + row.rowCount, 0),
    109
  );
  assert.equal(
    evidence.manifest.shards.filter((row) => row.kind === "SHARED_PATH_OVERLAP").reduce((sum, row) => sum + row.rowCount, 0),
    73
  );
  assert.equal(evidence.manifest.bootstrapRegistry.preserved, true);
  assert.equal(evidence.manifest.nextTaskId, "GCI-S02_SinglePrGateOrchestratorPilot");

  for (const [relativePath, expected] of Object.entries(evidence.outputs)) {
    assert.equal(fs.readFileSync(relativePath, "utf8"), expected, `stale GCI-S01 evidence: ${relativePath}`);
  }
});
