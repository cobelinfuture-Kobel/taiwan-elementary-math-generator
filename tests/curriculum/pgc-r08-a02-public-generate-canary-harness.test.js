import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readJson = (relativePath) => JSON.parse(readFileSync(new URL(relativePath, import.meta.url), "utf8"));

const a00 = readJson("../../data/curriculum/public-generation/PGC-R08-A00.public-generate-button-e2e-scope.json");
const a01 = readJson("../../data/curriculum/public-generation/public_generate_button_acceptance.json");
const capacity = readJson("../../data/curriculum/public-generation/generator_capacity_contract.json");
const contract = readJson("../../data/curriculum/public-generation/PGC-R08-A02.public-generate-canary-harness.json");
const runner = readFileSync(
  new URL("../../tools/curriculum/run-pgc-r08-a02-public-generate-canary.mjs", import.meta.url),
  "utf8",
);

const expectedQuestionTypes = [
  "application",
  "mixed",
  "numeric",
  "pbl",
  "concept",
  "operation_estimation",
  "reasoning",
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

test("PGC-R08 A02 starts after A01 matrix materialization", () => {
  assert.equal(a00.status, "PASS_R08_A00_PUBLIC_GENERATE_BUTTON_E2E_SCOPE_FROZEN");
  assert.equal(a01.status, "PASS_MATRIX_MATERIALIZED_PENDING_BROWSER_EXECUTION");
  assert.equal(a01.summary.legalRouteCount, 793);
  assert.equal(contract.previousTaskId, "PGC-R08-A01_LegalRouteBrowserAcceptanceMatrixMaterialization");
  assert.equal(contract.taskId, "PGC-R08-A02_PublicGenerateButtonCanaryAndHarnessQualification");
  assert.equal(contract.schemaVersion, 2);
});

test("PGC-R08 A02 canary set covers all question types, selection modes and capacity statuses", () => {
  assert.equal(contract.canaryRoutes.length, 7);
  assert.equal(contract.canaryPolicy.baselinePositiveRouteCount, 6);
  assert.equal(contract.canaryPolicy.live20RequalificationRouteCount, 1);
  assert.equal(contract.canaryPolicy.positiveRouteCount, 7);
  assert.equal(contract.canaryPolicy.diagnosticRouteCount, 0);
  assert.deepEqual([...new Set(contract.canaryRoutes.map((row) => row.questionType))].sort(), [...expectedQuestionTypes].sort());
  assert.deepEqual([...new Set(contract.canaryRoutes.map((row) => row.selectionMode))].sort(), [
    "mixedKnowledgePointsSameUnit",
    "singleKnowledgePoint",
    "sourceUnit",
  ]);
  assert.deepEqual([...new Set(contract.canaryRoutes.map((row) => row.capacityStatus))].sort(), [
    "VERIFIED_20",
    "VERIFIED_LIMITED",
  ]);
  assert.deepEqual(contract.nineGateCodes, expectedGateCodes);
});

test("PGC-R08 A02 canary route identities match current capacity authority", () => {
  const byRouteId = new Map(capacity.routes.map((row) => [row.routeId, row]));
  for (const canary of contract.canaryRoutes) {
    const authority = byRouteId.get(canary.routeId);
    assert.ok(authority, `${canary.routeId} must exist`);
    assert.equal(authority.legalRoute, true);
    for (const field of [
      "sourceId",
      "selectionMode",
      "questionType",
      "depthMode",
      "contextMode",
      "capacityStatus",
      "verifiedMaxQuestionCount",
    ]) {
      assert.equal(authority[field] ?? null, canary[field] ?? null, `${canary.routeId}:${field}`);
    }
    assert.deepEqual(
      [...(authority.selectedKnowledgePointIds ?? [])].sort(),
      [...canary.selectedKnowledgePointIds].sort(),
    );
  }
});

test("PGC-R08 A02 preserves the first-wave mixed application route as an A03 sentinel", () => {
  const finding = contract.firstWaveEvidence.findings.find((row) => (
    row.routeId === "pgc_r03_g3a_u01_3a01_application_078745248eea"
  ));
  assert.ok(finding);
  assert.equal(finding.classification, "A03_EARLY_SENTINEL");
  assert.match(finding.disposition, /retain_in_793_route_matrix/);
  const applicationCanary = contract.canaryRoutes.find((row) => row.questionType === "application");
  assert.equal(applicationCanary.routeId, "pgc_r03_g3a_u01_3a01_application_235abe098270");
  assert.equal(applicationCanary.selectionMode, "sourceUnit");
});

test("PGC-R08 A02 treats VERIFIED_LIMITED as an evidence floor and requires live-20 requalification", () => {
  const requalification = contract.canaryRoutes.find((row) => row.capacityStatus === "VERIFIED_LIMITED");
  assert.ok(requalification);
  assert.equal(requalification.requestedQuestionCount, 20);
  assert.equal(requalification.verifiedMaxQuestionCount, 6);
  assert.equal(requalification.expectedDisposition, "PASS_ALL_NINE_GATES_WITH_LIVE_20_REQUALIFICATION");
  assert.equal(contract.canaryPolicy.productRepairQueueExpected, false);
  assert.equal(contract.canaryPolicy.requalificationMustEnterCapacityEvidenceQueue, true);
  assert.match(runner, /LIVE_20_REQUALIFICATION_PASS/);
  assert.match(runner, /capacityEvidenceReconciliationQueue/);
  assert.doesNotMatch(runner, /PUBLIC_UI_20_QUESTION_CAPACITY_GAP/);
});

test("PGC-R08 A02 runner exercises the real public browser journey and convergence protocol", () => {
  assert.match(runner, /import \{ chromium \} from "playwright"/);
  assert.match(runner, /#batch-a-source-select/);
  assert.match(runner, /#batch-a-selection-mode-select/);
  assert.match(runner, /#batch-a-knowledge-point-panel/);
  assert.match(runner, /#g5a-u08-question-mode/);
  assert.match(runner, /#g5a-u08-depth-mode/);
  assert.match(runner, /#g5a-u08-context-mode/);
  assert.match(runner, /data-capacity-route-ids/);
  assert.match(runner, /deselectIncompatiblePatternGroups/);
  assert.match(runner, /await setKps\(p,r\);[\s\S]*await pick\(p,S\.type/);
  assert.match(runner, /#batch-a-question-count-input/);
  assert.match(runner, /#regenerate-button/);
  assert.match(runner, /#preview-frame/);
  assert.match(runner, /#print-button/);
  assert.match(runner, /await p\.pdf\(/);
  assert.match(runner, /REGENERATE_IDENTITY_UNCHANGED/);
  assert.match(runner, /ANSWER_BIJECTION_FAILED/);
});

test("PGC-R08 A02 remains inside the canary-only frozen boundary", () => {
  assert.deepEqual(contract.frozenBoundary, {
    capacityRouteMutationAllowed: false,
    productUiModificationAllowed: false,
    generatorModificationAllowed: false,
    validatorModificationAllowed: false,
    rendererModificationAllowed: false,
    all793RouteExecutionAllowed: false,
    newWorkflowAllowed: false,
    slice014Allowed: false,
  });
  assert.equal(contract.harnessQualificationGate.realChromiumPdfRequiredForAllCanaries, true);
  assert.equal(contract.harnessQualificationGate.regenerateIdentityChangeRequiredForAllCanaries, true);
  assert.equal(contract.goalDistance.nextShortestStep, "PGC-R08-A02_ConsolidatedCanaryRemediationExactHeadCI");
});
