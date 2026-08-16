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
  ".github/workflows/p03f25-exact-head-product-acceptance.yml",
  ".github/workflows/p03f-slice029-product-acceptance.yml",
  ".github/workflows/p03f-slice030-product-acceptance.yml",
  ".github/workflows/p03f-slice031-product-acceptance.yml",
  ".github/workflows/p03f-slice032-product-acceptance.yml",
  ".github/workflows/p03f-slice032-post-merge-authority-reconciliation.yml",
  ".github/workflows/p03f-slice033-product-acceptance.yml",
  ".github/workflows/p03f-slice034-product-acceptance.yml",
  ".github/workflows/p03f-slice035-core-acceptance.yml",
  ".github/workflows/p03f-slice036-core-acceptance.yml",
  ".github/workflows/p03f-slice036-live-pages-e2e.yml",
  ".github/workflows/p03f-slice037-product-acceptance.yml",
  ".github/workflows/p03f-slice037-live-pages-e2e.yml",
  ".github/workflows/p03f-slice038-product-acceptance.yml",
  ".github/workflows/p03f-slice038-live-pages-e2e.yml",
  ".github/workflows/p03f-slice039-product-acceptance.yml",
  ".github/workflows/p03f-slice039-live-pages-e2e.yml",
  ".github/workflows/p03f-slice040-product-acceptance.yml",
];

const POST_S01_PGC_R00_PATHS = new Set([
  "tests/curriculum/pgc-r09-a03-public-site-smoke.test.js",
  "tools/curriculum/run-pgc-r09-a03-public-site-smoke.mjs",
]);

function withoutHistoricalBlobSha(row) {
  const { blobSha: _historicalContentIdentity, ...structuralRow } = row;
  return structuralRow;
}

function hasApprovedPostS01PgcR00Evolution(report) {
  const row = report.workflows.find(
    (entry) => entry.workflowId === "pgc-r00-public-generation-scope",
  );
  return Boolean(row && [...POST_S01_PGC_R00_PATHS]
    .every((path) => row.pullRequestPaths.includes(path)));
}

function normalizeApprovedPostS01WorkflowEvolution(row) {
  const structuralRow = withoutHistoricalBlobSha(row);
  if (structuralRow.workflowId !== "pgc-r00-public-generation-scope") return structuralRow;

  const hasApprovedA03Paths = [...POST_S01_PGC_R00_PATHS]
    .every((path) => structuralRow.pullRequestPaths.includes(path));
  if (!hasApprovedA03Paths) return structuralRow;

  return {
    ...structuralRow,
    pullRequestPaths: structuralRow.pullRequestPaths
      .filter((path) => !POST_S01_PGC_R00_PATHS.has(path)),
    hasJobLevelIf: false,
  };
}

function canonicalizeTriggerMatrix(rows, stripApprovedA03Paths = false) {
  return rows
    .map((row) => stripApprovedA03Paths
      && row.workflowId === "pgc-r00-public-generation-scope"
      ? { ...row, pullRequestPathCount: row.pullRequestPathCount - POST_S01_PGC_R00_PATHS.size }
      : row)
    .sort((a, b) => compareCodePoint(a.workflowId, b.workflowId));
}

function canonicalizeReport(report) {
  const stripApprovedA03Paths = hasApprovedPostS01PgcR00Evolution(report);
  return {
    ...report,
    workflows: report.workflows
      .map(normalizeApprovedPostS01WorkflowEvolution)
      .sort((a, b) => compareCodePoint(a.file, b.file)),
    triggerMatrix: canonicalizeTriggerMatrix(report.triggerMatrix, stripApprovedA03Paths),
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

  const committedInventory = readBrotliJson(".github/ci/gci-s01/workflow-inventory.json.br");
  const { inventoryAsOfCommit, ...committedScannerOutput } = committedInventory;
  assert.equal(inventoryAsOfCommit, "364900d8cc151b13aada07c135e5275c3e31546b");
  assert.deepEqual(canonicalizeReport(committedScannerOutput), canonicalizeReport(report));

  const fanout = readBrotliJson(".github/ci/gci-s01/workflow-fanout-matrix.json.br");
  assert.equal(fanout.inventoryAsOfCommit, inventoryAsOfCommit);
  assert.deepEqual(fanout.summary, report.summary);
  assert.deepEqual(
    canonicalizeTriggerMatrix(fanout.triggerMatrix),
    canonicalizeTriggerMatrix(report.triggerMatrix, hasApprovedPostS01PgcR00Evolution(report))
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

// PGC-R06 A03 historical authority and workflow governance compatibility
