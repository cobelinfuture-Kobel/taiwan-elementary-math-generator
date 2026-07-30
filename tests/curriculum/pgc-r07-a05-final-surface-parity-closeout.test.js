import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const readJson = (relativePath) => JSON.parse(readFileSync(new URL(relativePath, import.meta.url), "utf8"));

const a00 = readJson("../../data/curriculum/public-generation/PGC-R07-A00.surface-renderer-print-scope.json");
const a01 = readJson("../../data/curriculum/public-generation/PGC-R07-A01.three-surface-parity-baseline.json");
const a02 = readJson("../../data/curriculum/public-generation/PGC-R07-A02.selection-mode-capacity-alignment.json");
const a03 = readJson("../../data/curriculum/public-generation/PGC-R07-A03.chromium-print-answer-key-matrix.json");
const a04 = readJson("../../data/curriculum/public-generation/PGC-R07-A04.overflow-clipping-font-pagination-matrix.json");
const closeout = readJson("../../data/curriculum/public-generation/PGC-R07-A05.final-surface-parity-closeout.json");
const markerUrl = new URL("../../docs/curriculum/output/PGC-R07_D0_CLOSEOUT_PASS.marker", import.meta.url);

const expectedSurfaces = ["CLASSIC", "FALLBACK_404", "PIXEL"];
const expectedProjections = ["PREVIEW_HTML", "PRINT_HTML", "CHROMIUM_PDF", "ANSWER_KEY"];
const expectedBranches = ["SHARED_EXACT_LAYOUT", "DYNAMIC_HTML", "STATIC_HTML_URL", "SHARED_FALLBACK"];

test("PGC-R07 A05 reconciles the complete frozen A00 milestone chain", () => {
  assert.equal(closeout.taskId, "PGC-R07-A05_FinalSurfaceParityReconciliationAndCloseout");
  assert.equal(closeout.previousTaskId, a04.taskId);
  assert.deepEqual(a00.orderedMilestones, [
    "PGC-R07-A00_SurfaceRendererPrintAuthorityAndParityMatrixFreeze",
    "PGC-R07-A01_ThreeSurfaceParityBaselineMaterialization",
    "PGC-R07-A02_SharedRendererAndLegacyBranchParityFullFix",
    "PGC-R07-A03_RealChromiumPrintAndAnswerKeyMatrix",
    "PGC-R07-A04_OverflowClippingFontPaginationFullFix",
    "PGC-R07-A05_FinalSurfaceParityReconciliationAndCloseout",
  ]);
  assert.deepEqual(closeout.lineage.map((row) => row.taskId), a00.orderedMilestones.slice(0, 5));
  assert.equal(a01.summary.repairQueueCount, 5);
  assert.equal(a02.status, "PASS_CAPACITY_AWARE_DEPLOYED_BROWSER_PARITY");
  assert.equal(a03.status, "PASS_EXACT_HEAD_CI_REAL_CHROMIUM_MATRIX");
  assert.equal(a04.status, "PASS_EXACT_HEAD_CI_OVERFLOW_FONT_PAGINATION_MATRIX");
});

test("PGC-R07 A05 closes all twelve surface projection rows", () => {
  assert.equal(closeout.surfaceProjectionRows.length, 12);
  assert.equal(closeout.summary.surfaceProjectionPassCount, 12);
  assert.equal(closeout.summary.surfaceProjectionFailCount, 0);
  const identities = new Set(closeout.surfaceProjectionRows.map((row) => `${row.surfaceId}:${row.outputProjection}`));
  assert.equal(identities.size, 12);
  for (const surfaceId of expectedSurfaces) {
    for (const outputProjection of expectedProjections) {
      const row = closeout.surfaceProjectionRows.find((candidate) => (
        candidate.surfaceId === surfaceId && candidate.outputProjection === outputProjection
      ));
      assert.ok(row, `${surfaceId}:${outputProjection} must exist`);
      assert.equal(row.status, "PASS");
      assert.ok(row.evidenceTaskIds.length >= 1);
    }
  }
});

test("PGC-R07 A05 closes every renderer branch and acceptance dimension", () => {
  assert.deepEqual(closeout.rendererBranchRows.map((row) => row.branchId), expectedBranches);
  assert.equal(closeout.rendererBranchRows.every((row) => row.status === "PASS"), true);
  assert.deepEqual(
    closeout.acceptanceDimensions.map((row) => row.dimension),
    a00.acceptanceDimensions,
  );
  assert.equal(closeout.acceptanceDimensions.every((row) => row.status === "PASS"), true);
  assert.equal(closeout.summary.rendererBranchPassCount, 4);
  assert.equal(closeout.summary.a03RealChromiumPdfCount, 6);
  assert.equal(closeout.summary.a04RealChromiumPdfCount, 8);
  assert.equal(closeout.summary.totalRealChromiumPdfCount, 14);
});

test("PGC-R07 A05 has zero parity and layout repair findings", () => {
  assert.equal(closeout.summary.repairQueueCount, 0);
  assert.deepEqual(closeout.repairQueue, []);
  for (const field of [
    "pageOverflowFindingCount",
    "clippingFindingCount",
    "overlapFindingCount",
    "blankPageFindingCount",
    "missingAnswerCount",
    "consoleErrorCount",
    "pageErrorCount",
    "questionIdentityDriftCount",
    "answerIdentityDriftCount",
  ]) {
    assert.equal(closeout.summary[field], 0, `${field} must be zero`);
  }
  assert.equal(closeout.closeoutGates.scopeFrozen, true);
  assert.equal(closeout.closeoutGates.allAcceptanceDimensionsPass, true);
  assert.equal(closeout.closeoutGates.repairQueueZero, true);
});

test("PGC-R07 A05 remains inside the frozen boundary and writes marker only after PASS", () => {
  assert.deepEqual(closeout.frozenBoundary, {
    generatorModified: false,
    validatorModified: false,
    rendererModified: false,
    productUiModified: false,
    knowledgePointModified: false,
    patternGroupModified: false,
    patternSpecModified: false,
    newWorkflowAdded: false,
    slice014Started: false,
  });
  const terminal = closeout.status === "PASS_R07_A05_SURFACE_RENDERER_PRINT_PARITY_RECONCILED_AND_D0_CLOSED";
  assert.equal(existsSync(markerUrl), terminal);
  assert.equal(closeout.closeoutGates.terminalMarkerWritten, terminal);
  if (terminal) {
    const marker = readFileSync(markerUrl, "utf8");
    assert.match(marker, /STATUS=PASS_R07_A05_SURFACE_RENDERER_PRINT_PARITY_RECONCILED_AND_D0_CLOSED/);
    assert.match(marker, /GOAL_DISTANCE=D0_R07_REAL_PRINT_AND_SURFACE_PARITY_CLOSED/);
    assert.match(marker, /REPAIR_QUEUE_COUNT=0/);
    assert.match(marker, /SURFACE_PROJECTION_GATE=12\/12/);
    assert.match(marker, /RENDERER_BRANCH_GATE=4\/4/);
  }
});
