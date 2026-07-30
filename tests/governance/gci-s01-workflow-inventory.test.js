import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import zlib from "node:zlib";

function readBrotliJson(file) {
  return JSON.parse(zlib.brotliDecompressSync(fs.readFileSync(file)).toString("utf8"));
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function compareCodePoint(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

test("GCI-S01 committed historical evidence remains exhaustive and self-consistent", () => {
  const inventoryPath = ".github/ci/gci-s01/workflow-inventory.json.br";
  const fanoutPath = ".github/ci/gci-s01/workflow-fanout-matrix.json.br";
  const ownershipPath = ".github/ci/gci-s01/workflow-ownership-readback.json.br";

  const inventory = readBrotliJson(inventoryPath);
  const fanout = readBrotliJson(fanoutPath);
  const ownership = readBrotliJson(ownershipPath);
  const manifest = JSON.parse(fs.readFileSync(".github/ci/gci-s01/evidence-manifest.json", "utf8"));

  assert.equal(inventory.inventoryAsOfCommit, "364900d8cc151b13aada07c135e5275c3e31546b");
  assert.equal(inventory.inventoryCompleteness, "COMPLETE_FROM_CHECKED_OUT_MAIN_TREE");
  assert.deepEqual(inventory.summary, {
    workflowFileCount: 110,
    pullRequestWorkflowCount: 66,
    prBranchWriterCount: 20,
    prFullRegressionWorkflowCount: 24,
    lateSkipCandidateCount: 27,
    sharedExactPathPatternCount: 79
  });

  const workflowFiles = inventory.workflows.map((row) => row.file);
  assert.equal(new Set(workflowFiles).size, 110);
  assert.ok(workflowFiles.includes(".github/workflows/node-test.yml"));
  assert.ok(!workflowFiles.includes(".github/workflows/pr-gate.yml"));

  assert.equal(fanout.inventoryAsOfCommit, inventory.inventoryAsOfCommit);
  assert.deepEqual(fanout.summary, inventory.summary);
  assert.deepEqual(
    [...fanout.triggerMatrix].sort((a, b) => compareCodePoint(a.workflowId, b.workflowId)),
    [...inventory.triggerMatrix].sort((a, b) => compareCodePoint(a.workflowId, b.workflowId))
  );
  assert.deepEqual(
    fanout.sharedPathOverlapMatrix
      .map((row) => ({ ...row, workflowIds: [...row.workflowIds].sort(compareCodePoint) }))
      .sort((a, b) => compareCodePoint(a.pathPattern, b.pathPattern)),
    inventory.sharedPathOverlapMatrix
  );

  assert.equal(ownership.inventoryAsOfCommit, inventory.inventoryAsOfCommit);
  assert.deepEqual(ownership.summary, inventory.summary);
  assert.deepEqual(
    [...ownership.ownershipMatrix].sort((a, b) => compareCodePoint(a.workflowId, b.workflowId)),
    [...inventory.ownershipMatrix].sort((a, b) => compareCodePoint(a.workflowId, b.workflowId))
  );
  assert.deepEqual(
    Object.fromEntries(Object.entries(ownership.workflowIds).map(([key, rows]) => [key, [...rows].sort(compareCodePoint)])),
    Object.fromEntries(Object.entries(inventory.workflowIds).map(([key, rows]) => [key, [...rows].sort(compareCodePoint)]))
  );

  assert.equal(manifest.inventoryAsOfCommit, inventory.inventoryAsOfCommit);
  assert.equal(manifest.artifacts.length, 3);
  for (const artifact of manifest.artifacts) {
    assert.equal(sha256(artifact.path), artifact.sha256);
    assert.equal(fs.statSync(artifact.path).size, artifact.compressedBytes);
  }

  const closeout = fs.readFileSync(
    "docs/governance/GCI_S01_MATH_REPOSITORY_WORKFLOW_INVENTORY_AND_FANOUT_CLOSEOUT.md",
    "utf8"
  );
  assert.match(closeout, /WORKFLOW_FILE_COUNT\s*= 110/);
  assert.match(closeout, /NEXT_SHORTEST_STEP\s*= GCI-S02_SinglePrGateOrchestratorPilot/);
});
