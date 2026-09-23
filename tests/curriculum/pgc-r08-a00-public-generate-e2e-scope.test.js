import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const readJson = (relativePath) => JSON.parse(readFileSync(new URL(relativePath, import.meta.url), "utf8"));

const publicScope = readJson("../../data/curriculum/public-generation/public_generation_scope.json");
const capacity = readJson("../../data/curriculum/public-generation/generator_capacity_contract.json");
const r07 = readJson("../../data/curriculum/public-generation/PGC-R07-A05.final-surface-parity-closeout.json");
const r08 = readJson("../../data/curriculum/public-generation/PGC-R08-A00.public-generate-button-e2e-scope.json");
const r07MarkerUrl = new URL("../../docs/curriculum/output/PGC-R07_D0_CLOSEOUT_PASS.marker", import.meta.url);

const expectedUserJourney = [
  "OPEN_PUBLIC_UI",
  "SELECT_KNOWLEDGE_POINT",
  "SELECT_QUESTION_TYPE",
  "SELECT_QUESTION_FORM",
  "SELECT_DEPTH",
  "SELECT_CONTEXT",
  "INPUT_20_QUESTIONS",
  "PRESS_GENERATE",
  "CHECK_GENERATED_RESULT",
  "PRESS_REGENERATE",
  "OPEN_PREVIEW",
  "EXECUTE_PRINT",
  "VERIFY_ANSWER_KEY",
];

const expectedGateCodes = [
  "UI_OPTIONS_PASS",
  "GENERATE_BUTTON_PASS",
  "QUESTION_COUNT_PASS",
  "QUESTION_IDENTITY_PASS",
  "ANSWER_VALIDATION_PASS",
  "REGENERATE_PASS",
  "HTML_PASS",
  "PDF_PASS",
  "ANSWER_KEY_PASS",
];

const expectedMilestones = [
  "PGC-R08-A00_PublicGenerateButtonEndToEndAuthorityAndMatrixFreeze",
  "PGC-R08-A01_LegalRouteBrowserAcceptanceMatrixMaterialization",
  "PGC-R08-A02_PublicGenerateButtonCanaryAndHarnessQualification",
  "PGC-R08-A03_AllLegalRoutesBrowserAcceptanceExecution",
  "PGC-R08-A04_FailedCombinationFullFixAndReplay",
  "PGC-R08-A05_FinalEndToEndReconciliationAndCloseout",
];

test("PGC-R08 A00 starts only after the R07 D0 terminal authority", () => {
  assert.equal(r07.status, "PASS_R07_A05_SURFACE_RENDERER_PRINT_PARITY_RECONCILED_AND_D0_CLOSED");
  assert.equal(r07.goalDistance.after, "D0_R07_REAL_PRINT_AND_SURFACE_PARITY_CLOSED");
  assert.equal(r07.summary.surfaceProjectionPassCount, 12);
  assert.equal(r07.summary.rendererBranchPassCount, 4);
  assert.equal(r07.summary.totalRealChromiumPdfCount, 14);
  assert.equal(r07.summary.repairQueueCount, 0);
  assert.equal(existsSync(r07MarkerUrl), true);
  assert.equal(r08.selectionTaskId, "PGC-R07-A05_D0Closed_SelectNextApprovedProgram");
  assert.equal(r08.selectedNextProgramId, "PGC-R08_PublicGenerateButtonEndToEndAcceptance");
});

test("PGC-R08 A00 freezes the exact current legal route authority", () => {
  assert.equal(publicScope.currentAuthority.publicSourceCount, 26);
  assert.equal(capacity.status, "PASS");
  assert.equal(capacity.hardCeiling, 20);
  assert.equal(capacity.summary.routeCount, 1155);
  assert.equal(capacity.summary.legalRouteCount, 793);
  assert.equal(capacity.summary.illegalRouteCount, 362);
  assert.equal(capacity.summary.verified20RouteCount, 724);
  assert.equal(capacity.summary.verifiedLimitedRouteCount, 69);
  assert.equal(capacity.summary.zeroCapacityRouteCount, 0);
  assert.equal(capacity.summary.diversityGapRouteCount, 0);
  assert.equal(capacity.summary.hardBlockerCount, 0);
  assert.equal(r08.matrixAuthority.routeCount, capacity.summary.routeCount);
  assert.equal(r08.matrixAuthority.legalRouteCount, capacity.summary.legalRouteCount);
  assert.equal(r08.matrixAuthority.illegalRouteCount, capacity.summary.illegalRouteCount);
  assert.equal(r08.matrixAuthority.verified20RouteCount, capacity.summary.verified20RouteCount);
  assert.equal(r08.matrixAuthority.verifiedLimitedRouteCount, capacity.summary.verifiedLimitedRouteCount);
  assert.equal(r08.matrixAuthority.questionCountPerRoute, 20);
});

test("PGC-R08 A00 freezes one canonical Classic browser execution per legal route", () => {
  assert.equal(r08.matrixAuthority.executionSurface, "CLASSIC");
  assert.equal(r08.matrixAuthority.executionEntryPath, "site/index.html");
  assert.equal(
    r08.matrixAuthority.surfaceMultiplicationPolicy,
    "DO_NOT_MULTIPLY_BY_SURFACE_AFTER_R07_D0_PARITY",
  );
  assert.deepEqual(r08.matrixAuthority.routeIdentityFields, [
    "routeId",
    "sourceId",
    "selectionMode",
    "selectedKnowledgePointIds",
    "questionType",
    "depthMode",
    "contextMode",
  ]);
});

test("PGC-R08 A00 freezes the complete public user journey and nine per-route gates", () => {
  assert.deepEqual(r08.userJourney, expectedUserJourney);
  assert.deepEqual(r08.perRouteGateCodes, expectedGateCodes);
  assert.equal(r08.perRouteAcceptance.questionCountExpected, 20);
  assert.equal(r08.perRouteAcceptance.answerKeyItemCountExpected, 20);
  assert.equal(r08.perRouteAcceptance.regenerateMustChangeQuestionIdentity, true);
  assert.equal(r08.perRouteAcceptance.realChromiumPdfRequired, true);
  assert.equal(r08.perRouteAcceptance.browserConsoleErrorsAllowed, 0);
  assert.equal(r08.perRouteAcceptance.browserPageErrorsAllowed, 0);
});

test("PGC-R08 A00 rejects substitute evidence and locks required outputs", () => {
  assert.deepEqual(r08.forbiddenSubstituteEvidence, [
    "DIRECT_NODE_FUNCTION_EXECUTION",
    "UNIT_TEST_PASS_ONLY",
    "COMMITTED_PDF_EXISTS",
    "METADATA_DECLARES_SUPPORT",
    "PATTERN_SPEC_EXISTS",
  ]);
  assert.deepEqual(r08.requiredOutputs, {
    acceptanceJson: "data/curriculum/public-generation/public_generate_button_acceptance.json",
    matrixCsv: "docs/curriculum/output/public_capability_e2e_matrix.csv",
    failedCombinationReport: "docs/curriculum/output/failed_combination_report.md",
    browserArtifactDirectory: "tmp/browser_acceptance_artifacts",
  });
});

test("PGC-R08 A00 freezes milestone order and protects product scope", () => {
  assert.deepEqual(r08.orderedMilestones, expectedMilestones);
  assert.equal(Object.values(r08.a00Gate).every(Boolean), true);
  assert.deepEqual(r08.frozenBoundary, {
    newKnowledgePointAllowed: false,
    newPatternGroupAllowed: false,
    newPatternSpecAllowed: false,
    newGeneratorAllowed: false,
    secondValidatorAllowed: false,
    secondRendererAllowed: false,
    uiVisualRedesignAllowed: false,
    routeCountMutationAllowedInA00: false,
    browserExecutionAllowedInA00: false,
    slice014Allowed: false,
    batchExpansionAllowed: false,
    newWorkflowAllowed: false,
  });
  assert.equal(r08.preconditions.slice014Started, false);
  assert.equal(r08.preconditions.slice014FreezeRequiredThrough, "PGC-R09_PublicGenerationD0Closeout");
  assert.equal(
    r08.goalDistance.nextShortestStep,
    "PGC-R08-A01_LegalRouteBrowserAcceptanceMatrixMaterialization",
  );
});
