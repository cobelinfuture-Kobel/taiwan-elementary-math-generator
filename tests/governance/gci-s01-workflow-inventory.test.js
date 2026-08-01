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

const POST_S01_WORKFLOW_FILES = [
  ".github/workflows/pgc-r06-a02-g5a-u02-live-diagnostics.yml",
  ".github/workflows/pgc-r06-a03-capacity-public-runtime-repair-reconciliation.yml",
  ".github/workflows/pgc-r06-a07-final-global-live-d0-closeout.yml",
];

const POST_S01_WORKFLOW_PATH_EXTENSIONS = Object.freeze({
  "pgc-r00-public-generation-scope": Object.freeze([
    "site/assets/browser/pipeline/build-worksheet-document-p01e-closeout.js",
    "tests/curriculum/pgc-r08-a04-a06-capacity-shortfall.test.js",
    "tools/curriculum/run-pgc-r08-a04-a06-capacity-shortfall-diagnostic.mjs",
    "tools/curriculum/run-pgc-r08-a04-a06-capacity-shortfall-replay.mjs",
  ]),
});

function withoutHistoricalBlobSha(row) {
  const { blobSha: _historicalContentIdentity, ...structuralRow } = row;
  return structuralRow;
}

function withoutPostS01WorkflowPathExtensions(report) {
  const workflows = report.workflows.map((row) => {
    const extensions = new Set(POST_S01_WORKFLOW_PATH_EXTENSIONS[row.workflowId] ?? []);
    if (extensions.size === 0) return row;
    return {
      ...row,
      pullRequestPaths: row.pullRequestPaths.filter((path) => !extensions.has(path)),
    };
  });
  const pathCountByWorkflowId = new Map(
    workflows.map((row) => [row.workflowId, row.pullRequestPaths.length]),
  );
  return {
    ...report,
    workflows,
    triggerMatrix: report.triggerMatrix.map((row) => ({
      ...row,
      pullRequestPathCount: pathCountByWorkflowId.get(row.workflowId) ?? row.pullRequestPathCount,
    })),
  };
}

function canonicalizeReport(report) {
  return {
    ...report,
    workflows: report.workflows
      .map(withoutHistoricalBlobSha)
      .sort((a, b) => compareCodePoint(a.file, b.file)),
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
  const report = materializeGciS01WorkflowInventory({
    excludeFiles: [".github/workflows/pr-gate.yml", ...POST_S01_WORKFLOW_FILES]
  });
  const historicalReport = withoutPostS01WorkflowPathExtensions(report);

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
  assert.ok(!report.workflows.some((row) => row.file === ".github/workflows/pr-gate.yml"));

  const pgcR00 = report.workflows.find((row) => row.workflowId === "pgc-r00-public-generation-scope");
  assert.ok(pgcR00);
  assert.equal(
    POST_S01_WORKFLOW_PATH_EXTENSIONS[pgcR00.workflowId].every((path) => pgcR00.pullRequestPaths.includes(path)),
    true,
  );
  assert.equal(
    historicalReport.workflows.find((row) => row.workflowId === pgcR00.workflowId)?.pullRequestPaths.length,
    4,
  );

  const committedInventory = readBrotliJson(".github/ci/gci-s01/workflow-inventory.json.br");
  const { inventoryAsOfCommit, ...committedScannerOutput } = committedInventory;
  assert.equal(inventoryAsOfCommit, "364900d8cc151b13aada07c135e5275c3e31546b");
  assert.deepEqual(canonicalizeReport(committedScannerOutput), canonicalizeReport(historicalReport));

  const fanout = readBrotliJson(".github/ci/gci-s01/workflow-fanout-matrix.json.br");
  assert.equal(fanout.inventoryAsOfCommit, inventoryAsOfCommit);
  assert.deepEqual(fanout.summary, historicalReport.summary);
  assert.deepEqual(
    [...fanout.triggerMatrix].sort((a, b) => compareCodePoint(a.workflowId, b.workflowId)),
    [...historicalReport.triggerMatrix].sort((a, b) => compareCodePoint(a.workflowId, b.workflowId))
  );
  assert.deepEqual(
    fanout.sharedPathOverlapMatrix
      .map((row) => ({ ...row, workflowIds: [...row.workflowIds].sort(compareCodePoint) }))
      .sort((a, b) => compareCodePoint(a.pathPattern, b.pathPattern)),
    historicalReport.sharedPathOverlapMatrix
  );

  const ownership = readBrotliJson(".github/ci/gci-s01/workflow-ownership-readback.json.br");
  assert.equal(ownership.inventoryAsOfCommit, inventoryAsOfCommit);
  assert.deepEqual(ownership.summary, historicalReport.summary);
  assert.deepEqual(
    Object.fromEntries(Object.entries(ownership.workflowIds).map(([key, rows]) => [key, [...rows].sort(compareCodePoint)])),
    Object.fromEntries(Object.entries(historicalReport.workflowIds).map(([key, rows]) => [key, [...rows].sort(compareCodePoint)]))
  );
  assert.deepEqual(
    [...ownership.ownershipMatrix].sort((a, b) => compareCodePoint(a.workflowId, b.workflowId)),
    historicalReport.ownershipMatrix
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

// PGC-R06 A03 historical authority and workflow governance compatibility
