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
});

test("PGC-R08 A02 canary set covers all question types, selection modes and capacity statuses", () => {
  assert.equal(contract.canaryRoutes.length, 7);
  assert.equal(contract.canaryPolicy.positiveRouteCount, 6);
  assert.equal(contract.canaryPolicy.diagnosticRouteCount, 1);
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

test("PGC-R08 A02 keeps the limited route and requires exact diagnostic capture", () => {
  const diagnostic = contract.canaryRoutes.find((row) => row.capacityStatus === "VERIFIED_LIMITED");
  assert.ok(diagnostic);
  assert.equal(diagnostic.requestedQuestionCount, 20);
  assert.equal(diagnostic.verifiedMaxQuestionCount, 6);
  assert.equal(diagnostic.expectedDisposition, "CAPTURE_EXPECTED_20_QUESTION_CAPACITY_GAP");
  assert.equal(contract.canaryPolicy.diagnosticGapMustEnterProductRepairQueue, true);
  assert.match(runner, /FAIL_EXPECTED_CAPACITY_GAP/);
  assert.match(runner, /PUBLIC_UI_20_QUESTION_CAPACITY_GAP/);
  assert.match(runner, /PGC-R08-A04_FailedCombinationFullFixAndReplay/);
});

test("PGC-R08 A02 runner exercises the real public browser journey", () => {
  assert.match(runner, /import \{ chromium \} from "playwright"/);
  assert.match(runner, /#batch-a-source-select/);
  assert.match(runner, /#batch-a-selection-mode-select/);
  assert.match(runner, /#batch-a-knowledge-point-panel/);
  assert.match(runner, /#g5a-u08-question-mode/);
  assert.match(runner, /#g5a-u08-depth-mode/);
  assert.match(runner, /#g5a-u08-context-mode/);
  assert.match(runner, /data-capacity-route-ids/);
  assert.match(runner, /#batch-a-question-count-input/);
  assert.match(runner, /#regenerate-button/);
  assert.match(runner, /#preview-frame/);
  assert.match(runner, /#print-button/);
  assert.match(runner, /await printPage\.pdf\(/);
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
  assert.equal(contract.harnessQualificationGate.realChromiumPdfRequiredForPositiveCanaries, true);
  assert.equal(contract.harnessQualificationGate.regenerateIdentityChangeRequiredForPositiveCanaries, true);
  assert.equal(contract.goalDistance.nextShortestStep, "PGC-R08-A02_ExactHeadCanaryBrowserExecution");
});
