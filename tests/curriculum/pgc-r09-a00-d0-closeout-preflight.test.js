import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readJson = (relativePath) => JSON.parse(readFileSync(new URL(relativePath, import.meta.url), "utf8"));

const scope = readJson("../../data/curriculum/public-generation/public_generation_scope.json");
const capacity = readJson("../../data/curriculum/public-generation/generator_capacity_contract.json");
const r07 = readJson("../../data/curriculum/public-generation/PGC-R07-A05.final-surface-parity-closeout.json");
const r08Scope = readJson("../../data/curriculum/public-generation/PGC-R08-A00.public-generate-button-e2e-scope.json");
const r08Final = readJson("../../data/curriculum/public-generation/PGC-R08-A04-A07.final-global-reconciliation.json");
const r09 = readJson("../../data/curriculum/public-generation/PGC-R09-A00.d0-closeout-preflight-and-canonical-acceptance-matrix.json");

const expectedGateIds = [
  "AUTHORITY_IDENTITY",
  "R08_ROUTE_CONFORMANCE",
  "PUBLIC_UI_CAPABILITY_PARITY",
  "SINGLE_GENERATION_PATH",
  "QUESTION_COUNT_CAPACITY",
  "SEMANTIC_VALIDATION",
  "ANSWER_KEY_COVERAGE",
  "HTML_DOCUMENT_FIDELITY",
  "PDF_PRINT_FIDELITY",
  "LINEAGE_PERSISTENCE",
  "DETERMINISM_AND_REGENERATE",
  "FULL_REPOSITORY_REGRESSION",
  "REAL_ARTIFACT_ARCHIVE",
  "PRODUCT_STATUS_REDETERMINATION",
  "SLICE014_RELEASE",
];

test("PGC-R09 A00 starts from the merged R07 and R08 terminal authorities", () => {
  assert.equal(r07.status, "PASS_R07_A05_SURFACE_RENDERER_PRINT_PARITY_RECONCILED_AND_D0_CLOSED");
  assert.equal(r07.summary.surfaceProjectionPassCount, 12);
  assert.equal(r07.summary.rendererBranchPassCount, 4);
  assert.equal(r07.summary.totalRealChromiumPdfCount, 14);
  assert.equal(r07.summary.repairQueueCount, 0);

  assert.equal(r08Final.status, "PASS_ALL_793_LEGAL_ROUTES_RECONCILED");
  assert.equal(r08Final.terminal, true);
  assert.equal(r08Final.routeReconciliation.legalRouteCount, 793);
  assert.equal(r08Final.routeReconciliation.finalPassRouteCount, 793);
  assert.equal(r08Final.routeReconciliation.finalFailedRouteCount, 0);
  assert.equal(r08Final.routeReconciliation.closedOriginalFailureRouteCount, 327);
  assert.equal(r08Final.failureFamilyReconciliation.pendingFamilyCount, 0);
  assert.equal(r08Final.d0Gate.status, "PASS_R08_D0");
});

test("PGC-R09 A00 preserves the frozen public authority and capacity boundary", () => {
  assert.equal(scope.scopePolicy.slice014Started, false);
  assert.equal(scope.scopePolicy.slice014FreezeRequiredThrough, "PGC-R09_PublicGenerationD0Closeout");
  assert.equal(scope.currentAuthority.publicSourceCount, 26);
  assert.equal(scope.currentAuthority.publicGenerationEntry, "site/assets/browser/pipeline/build-worksheet-document.js#buildWorksheetDocumentFromState");

  assert.equal(capacity.status, "PASS");
  assert.equal(capacity.hardCeiling, 20);
  assert.equal(capacity.summary.routeCount, 1155);
  assert.equal(capacity.summary.legalRouteCount, 793);
  assert.equal(capacity.summary.illegalRouteCount, 362);
  assert.equal(capacity.summary.zeroCapacityRouteCount, 0);
  assert.equal(capacity.summary.diversityGapRouteCount, 0);
  assert.equal(capacity.summary.hardBlockerCount, 0);

  assert.equal(r09.preflightSnapshot.publicSourceRegistryCount, scope.currentAuthority.publicSourceCount);
  assert.equal(r09.preflightSnapshot.capacityRouteCount, capacity.summary.routeCount);
  assert.equal(r09.preflightSnapshot.legalRouteCount, capacity.summary.legalRouteCount);
  assert.equal(r09.preflightSnapshot.illegalRouteCount, capacity.summary.illegalRouteCount);
});

test("PGC-R09 A00 keeps the R08 end-to-end acceptance semantics intact", () => {
  assert.equal(r08Scope.productLineScope.publicGenerateButton, true);
  assert.equal(r08Scope.productLineScope.questionCountInputMax, 20);
  assert.equal(r08Scope.acceptanceContract.requestedQuestionQuantityMustBeRespected, true);
  assert.equal(r08Scope.acceptanceContract.capacityUnderfillOrDowngradeAllowed, false);
  assert.equal(r08Scope.acceptanceContract.answerKeyCoverageRequired, "100_PERCENT");
  assert.equal(r08Scope.acceptanceContract.fullRepositoryRegressionRequired, true);
  assert.equal(r08Scope.acceptanceContract.preExistingErrorExemptionAllowed, false);
  assert.equal(r08Scope.hold.resumeCondition, "PGC-R09_PublicGenerationD0Closeout");
});

test("PGC-R09 A00 materializes one bounded canonical terminal acceptance matrix", () => {
  assert.equal(r09.status, "PASS_R09_A00_CANONICAL_D0_ACCEPTANCE_MATRIX_FROZEN");
  assert.equal(r09.epicId, "PGC-R09_PublicGenerationD0Closeout");
  assert.deepEqual(r09.canonicalAcceptanceMatrix.map((row) => row.gateId), expectedGateIds);
  assert.equal(new Set(r09.canonicalAcceptanceMatrix.map((row) => row.gateId)).size, expectedGateIds.length);
  assert.equal(r09.preflightSnapshot.r08FinalConformantLegalRouteCount, 793);
  assert.equal(r09.preflightSnapshot.r08FinalFailedLegalRouteCount, 0);
  assert.equal(r09.preflightSnapshot.r08PendingFailureFamilyCount, 0);
  assert.equal(r09.preflightSnapshot.r07SurfaceProjectionPassCount, 12);
  assert.equal(r09.preflightSnapshot.r07RendererBranchPassCount, 4);
  assert.equal(r09.preflightSnapshot.r07RealChromiumPdfCount, 14);
});

test("PGC-R09 A00 is authority-only and cannot silently expand product scope", () => {
  assert.equal(Object.values(r09.a00Gate).every(Boolean), true);
  assert.deepEqual(r09.a00Boundary, {
    browserMatrixExecutionAllowed: false,
    newRealArtifactGenerationAllowed: false,
    productRuntimeMutationAllowed: false,
    capacityAuthorityMutationAllowed: false,
    knowledgePointMutationAllowed: false,
    patternGroupMutationAllowed: false,
    patternSpecMutationAllowed: false,
    generatorMutationAllowed: false,
    validatorMutationAllowed: false,
    rendererMutationAllowed: false,
    slice014Allowed: false,
    batchExpansionAllowed: false,
  });
  assert.equal(r09.canonicalAcceptanceMatrix.find((row) => row.gateId === "SLICE014_RELEASE").statusAtA00, "FROZEN");
  assert.equal(r09.nextTask, "PGC-R09-A01_CanonicalPublicProductAndArtifactAcceptanceExecution");
});
