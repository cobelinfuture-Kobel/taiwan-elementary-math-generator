import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import zlib from "node:zlib";

import {
  materializeGciS01WorkflowInventory
} from "../../tools/governance/materialize-gci-s01-workflow-inventory.mjs";

function readBrotliJson(file) {
  return JSON.parse(zlib.brotliDecompressSync(fs.readFileSync(file)).toString("utf8"));
}

function compareCodePoint(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function canonicalizeReport(report) {
  return {
    ...report,
    workflows: [...report.workflows].sort((a, b) => compareCodePoint(a.file, b.file)),
    triggerMatrix: [...report.triggerMatrix].sort((a, b) => compareCodePoint(a.workflowId, b.workflowId)),
    sharedPathOverlapMatrix: report.sharedPathOverlapMatrix
      .map((row) => ({ ...row, workflowIds: [...row.workflowIds].sort(compareCodePoint) }))
      .sort((a, b) => compareCodePoint(a.pathPattern, b.pathPattern)),
    ownershipMatrix: [...report.ownershipMatrix].sort((a, b) => compareCodePoint(a.workflowId, b.workflowId)),
    workflowIds: {
      prBranchWriters: [...report.workflowIds.prBranchWriters].sort(compareCodePoint),
      prFullRegressionOwners: [...report.workflowIds.prFullRegressionOwners].sort(compareCodePoint),
      lateSkipCandidates: [...report.workflowIds.lateSkipCandidates].sort(compareCodePoint)
    }
  };
}

test("GCI-S01 committed evidence is exhaustive and deterministic", () => {
  const report = materializeGciS01WorkflowInventory();

  assert.equal(report.inventoryCompleteness, "COMPLETE_FROM_CHECKED_OUT_MAIN_TREE");
  assert.equal(report.summary.workflowFileCount, 110);
  assert.equal(report.summary.pullRequestWorkflowCount, 66);
  assert.equal(report.summary.prBranchWriterCount, 20);
  assert.equal(report.summary.prFullRegressionWorkflowCount, 24);
  assert.equal(report.summary.lateSkipCandidateCount, 27);
  assert.equal(report.summary.sharedExactPathPatternCount, 79);

  const files = report.workflows.map((row) => row.file);
  assert.equal(new Set(files).size, files.length, "workflow file paths must be unique");
  assert.ok(report.workflows.some((row) => row.file === ".github/workflows/node-test.yml"));
  assert.ok(report.workflows.some((row) => row.file === ".github/workflows/pgc-r06-a01-g4b-u04-bounded-capacity-full-fix.yml"));

  const committedInventory = readBrotliJson(".github/ci/gci-s01/workflow-inventory.json.br");
  const { inventoryAsOfCommit, ...committedScannerOutput } = committedInventory;
  assert.equal(inventoryAsOfCommit, "364900d8cc151b13aada07c135e5275c3e31546b");
  assert.deepEqual(canonicalizeReport(committedScannerOutput), canonicalizeReport(report));

  const fanout = readBrotliJson(".github/ci/gci-s01/workflow-fanout-matrix.json.br");
  assert.equal(fanout.inventoryAsOfCommit, inventoryAsOfCommit);
  assert.deepEqual(fanout.summary, report.summary);
  assert.deepEqual(
    [...fanout.triggerMatrix].sort((a, b) => compareCodePoint(a.workflowId, b.workflowId)),
    [...report.triggerMatrix].sort((a, b) => compareCodePoint(a.workflowId, b.workflowId))
  );
  assert.deepEqual(
    fanout.sharedPathOverlapMatrix
      .map((row) => ({ ...row, workflowIds: [...row.workflowIds].sort(compareCodePoint) }))
      .sort((a, b) => compareCodePoint(a.pathPattern, b.pathPattern)),
    report.sharedPathOverlapMatrix
  );

  const ownership = readBrotliJson(".github/ci/gci-s01/workflow-ownership-readback.json.br");
  assert.equal(ownership.inventoryAsOfCommit, inventoryAsOfCommit);
  assert.deepEqual(ownership.summary, report.summary);
  assert.deepEqual(
    Object.fromEntries(Object.entries(ownership.workflowIds).map(([key, rows]) => [key, [...rows].sort(compareCodePoint)])),
    Object.fromEntries(Object.entries(report.workflowIds).map(([key, rows]) => [key, [...rows].sort(compareCodePoint)]))
  );
  assert.deepEqual(
    [...ownership.ownershipMatrix].sort((a, b) => compareCodePoint(a.workflowId, b.workflowId)),
    report.ownershipMatrix
  );

  const registry = JSON.parse(fs.readFileSync(".github/ci/workflow-registry.json", "utf8"));
  assert.equal(registry.inventoryCompleteness, "BOOTSTRAP_PARTIAL");
  assert.equal(registry.workflows.filter((row) => row.fullRegressionRole === "PR_AUTHORITY").length, 1);
  assert.equal(registry.workflows.find((row) => row.workflowId === "node-test")?.fullRegressionRole, "PR_AUTHORITY");

  const manifest = JSON.parse(fs.readFileSync(".github/ci/gci-s01/evidence-manifest.json", "utf8"));
  assert.equal(manifest.inventoryAsOfCommit, inventoryAsOfCommit);
  assert.equal(manifest.artifacts.length, 3);

  const closeout = fs.readFileSync(
    "docs/governance/GCI_S01_MATH_REPOSITORY_WORKFLOW_INVENTORY_AND_FANOUT_CLOSEOUT.md",
    "utf8"
  );
  assert.match(closeout, /WORKFLOW_FILE_COUNT\s*= 110/);
  assert.match(closeout, /NEXT_SHORTEST_STEP\s*= GCI-S02_SinglePrGateOrchestratorPilot/);
});
