import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import zlib from "node:zlib";

function readBrotliJson(file) {
  return JSON.parse(zlib.brotliDecompressSync(fs.readFileSync(file)).toString("utf8"));
}

const HISTORICAL_S01_COMMIT = "364900d8cc151b13aada07c135e5275c3e31546b";
const HISTORICAL_S01_SUMMARY = {
  workflowFileCount: 110,
  pullRequestWorkflowCount: 66,
  prBranchWriterCount: 20,
  prFullRegressionWorkflowCount: 24,
  lateSkipCandidateCount: 27,
  sharedExactPathPatternCount: 79
};

test("GCI-S01 committed inventory remains immutable historical evidence", () => {
  const inventory = readBrotliJson(".github/ci/gci-s01/workflow-inventory.json.br");
  const fanout = readBrotliJson(".github/ci/gci-s01/workflow-fanout-matrix.json.br");
  const ownership = readBrotliJson(".github/ci/gci-s01/workflow-ownership-readback.json.br");
  const manifest = JSON.parse(fs.readFileSync(".github/ci/gci-s01/evidence-manifest.json", "utf8"));

  assert.equal(inventory.inventoryAsOfCommit, HISTORICAL_S01_COMMIT);
  assert.equal(fanout.inventoryAsOfCommit, HISTORICAL_S01_COMMIT);
  assert.equal(ownership.inventoryAsOfCommit, HISTORICAL_S01_COMMIT);
  assert.equal(manifest.inventoryAsOfCommit, HISTORICAL_S01_COMMIT);

  for (const [key, value] of Object.entries(HISTORICAL_S01_SUMMARY)) {
    assert.equal(inventory.summary[key], value, `historical inventory ${key}`);
    assert.equal(fanout.summary[key], value, `historical fanout ${key}`);
    assert.equal(ownership.summary[key], value, `historical ownership ${key}`);
  }

  assert.equal(manifest.artifacts.length, 3);
});

test("GCI-S01 historical closeout stays historical while current PR regression authority moves to PR Gate", () => {
  const closeout = fs.readFileSync(
    "docs/governance/GCI_S01_MATH_REPOSITORY_WORKFLOW_INVENTORY_AND_FANOUT_CLOSEOUT.md",
    "utf8"
  );
  assert.match(closeout, /WORKFLOW_FILE_COUNT\s*= 110/);
  assert.match(closeout, /NEXT_SHORTEST_STEP\s*= GCI-S02_SinglePrGateOrchestratorPilot/);

  const registry = JSON.parse(fs.readFileSync(".github/ci/workflow-registry.json", "utf8"));
  const authorities = registry.workflows.filter((row) => row.fullRegressionRole === "PR_AUTHORITY");
  assert.equal(authorities.length, 1);
  assert.equal(authorities[0].workflowId, "pr-gate");
  assert.equal(registry.workflows.find((row) => row.workflowId === "node-test")?.fullRegressionRole, "POST_MERGE_GUARD");

  const prGate = fs.readFileSync(".github/workflows/pr-gate.yml", "utf8");
  const nodeTest = fs.readFileSync(".github/workflows/node-test.yml", "utf8");
  assert.match(prGate, /^name: PR Gate$/m);
  assert.match(prGate, /\bpull_request:/);
  assert.match(nodeTest, /^name: Node Test Post-Merge$/m);
  assert.doesNotMatch(nodeTest, /\bpull_request:/);
});
