import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

const r07 = readJson("data/curriculum/public-generation/PGC-R07-A00.surface-renderer-print-scope.json");
const r06 = readJson("data/curriculum/public-generation/PGC-R06-A07.final-global-live-closeout.json");
const publicScope = readJson("data/curriculum/public-generation/public_generation_scope.json");
const capabilityMatrix = readJson("data/curriculum/public-generation/public_generation_capability_matrix.json");

const expectedIdentityFields = [
  "knowledgePointIdentity",
  "patternSpecIdentity",
  "questionIdentity",
  "answerIdentity",
  "contextIdentity",
  "questionCount",
  "questionOrder",
];

const expectedOutputProjections = [
  "PREVIEW_HTML",
  "PRINT_HTML",
  "CHROMIUM_PDF",
  "ANSWER_KEY",
];

test("PGC-R07 A00 is selected only after the accepted R06 D0 closeout", () => {
  assert.equal(r06.status, "PASS_R06_A07_GLOBAL_LIVE_RUNTIME_RECONCILED_AND_D0_CLOSED");
  assert.equal(r06.summary.repairQueueCount, 0);
  assert.equal(r06.summary.globalLivePassRouteCount, 389);
  assert.equal(r06.summary.globalLiveFailRouteCount, 0);

  assert.equal(r07.programId, "PUBLIC_KP_GENERATION_CONFORMANCE_V1");
  assert.equal(r07.selectionTaskId, "PGC-R06-A07_D0Closed_SelectNextApprovedProgram");
  assert.equal(r07.selectedNextProgramId, "PGC-R07_RealPrintAndSurfaceParityConformance");
  assert.equal(r07.taskId, "PGC-R07-A00_SurfaceRendererPrintAuthorityAndParityMatrixFreeze");
});

test("PGC-R07 A00 preserves its historical freeze while current public authority advances monotonically", () => {
  assert.equal(r07.summary.publicSourceCount, 26);
  assert.ok(capabilityMatrix.summary.publicSourceCount >= r07.summary.publicSourceCount);
  assert.ok(capabilityMatrix.summary.publicVisibleKnowledgePointCount >= r07.summary.publicVisibleKnowledgePointCount);
  assert.ok(capabilityMatrix.summary.capabilityRowCount >= r07.summary.capabilitySurfaceRowCount);
  assert.equal(r07.summary.surfaceCount, capabilityMatrix.summary.surfaceCount);
  assert.equal(r07.summary.capacityRouteCount, r06.summary.capacityRouteCount);

  assert.deepEqual(
    r07.surfaces.map((surface) => surface.surfaceId),
    capabilityMatrix.surfaces.map((surface) => surface.surfaceId),
  );
  assert.deepEqual(
    r07.surfaces.map((surface) => surface.routeId),
    capabilityMatrix.surfaces.map((surface) => surface.routeId),
  );
});

test("PGC-R07 A00 preserves the R00 public route authority and Slice014 freeze", () => {
  const scopeRouteIds = new Set(publicScope.routes.map((route) => route.routeId));
  for (const surface of r07.surfaces) assert.ok(scopeRouteIds.has(surface.routeId));

  assert.equal(publicScope.scopePolicy.slice014Started, false);
  assert.equal(publicScope.scopePolicy.slice014FreezeRequiredThrough, "PGC-R09_PublicGenerationD0Closeout");
  assert.equal(r07.preconditions.slice014Started, false);
  assert.equal(r07.preconditions.slice014FreezeRequiredThrough, "PGC-R09_PublicGenerationD0Closeout");
  assert.equal(r07.frozenBoundary.slice014Allowed, false);
});

test("PGC-R07 A00 locks identity parity across preview, print, PDF and answer key", () => {
  assert.deepEqual(r07.parityContract.identityFields, expectedIdentityFields);
  assert.deepEqual(r07.outputProjections, expectedOutputProjections);
  assert.equal(r07.parityContract.sameConfigAndSeedRequired, true);
  assert.equal(r07.parityContract.layoutOnlyMayDiffer, true);
  assert.equal(r07.parityContract.answerKeyMustMatchQuestionOrder, true);
  assert.equal(r07.parityContract.previewAndPrintMustConsumeSameWorksheetDocument, true);
});

test("PGC-R07 A00 inventories every current renderer branch without creating a second renderer", () => {
  assert.deepEqual(
    r07.rendererBranchesToAudit.map((branch) => branch.branchId),
    ["SHARED_EXACT_LAYOUT", "DYNAMIC_HTML", "STATIC_HTML_URL", "SHARED_FALLBACK"],
  );
  assert.equal(r07.frozenBoundary.secondRendererAllowed, false);
  assert.equal(r07.frozenBoundary.newGeneratorAllowed, false);
  assert.equal(r07.frozenBoundary.secondValidatorAllowed, false);
});

test("PGC-R07 A00 selects exactly one next shortest milestone", () => {
  assert.equal(r07.goalDistance.nextShortestStep, "PGC-R07-A01_ThreeSurfaceParityBaselineMaterialization");
  assert.equal(r07.orderedMilestones[0], r07.taskId);
  assert.equal(r07.orderedMilestones[1], r07.goalDistance.nextShortestStep);
  assert.equal(new Set(r07.orderedMilestones).size, r07.orderedMilestones.length);
});
