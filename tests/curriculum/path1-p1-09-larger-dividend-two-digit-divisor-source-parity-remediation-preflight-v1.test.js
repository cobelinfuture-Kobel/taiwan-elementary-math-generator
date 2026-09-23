import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import { listPath1PublicWorksheetBlocks } from "../../site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";

const PREFLIGHT_PATH = "data/curriculum/application/contracts/PATH1_P1_09_LARGER_DIVIDEND_TWO_DIGIT_DIVISOR_SOURCE_PARITY_REMEDIATION_PREFLIGHT_V1.json";
const SOURCE_PREFLIGHT_PATH = "data/curriculum/application/contracts/PATH1_P1_09_LARGER_DIVIDEND_TWO_DIGIT_DIVISOR_SOURCE_AUTHORITY_PREFLIGHT_V1.json";
const ACCEPTANCE_PATH = "data/curriculum/application/contracts/PATH1_P1_09_LARGER_DIVIDEND_TWO_DIGIT_DIVISOR_EXISTING_ROUTE_ACCEPTANCE_V1.json";
const IMPACT_PATH = "data/project/change-impact/PATH1_P1_09_LARGER_DIVIDEND_TWO_DIGIT_DIVISOR_SOURCE_PARITY_REMEDIATION_PREFLIGHT_V1.impact.json";
const PLAN_PATH = "data/project/validation-plans/PATH1_P1_09_LARGER_DIVIDEND_TWO_DIGIT_DIVISOR_SOURCE_PARITY_REMEDIATION_PREFLIGHT_V1.validation.json";
const BUILDER_PATH = "site/assets/browser/pipeline/build-path1-manual-worksheet.js";

const preflight = JSON.parse(fs.readFileSync(PREFLIGHT_PATH, "utf8"));
const sourcePreflight = JSON.parse(fs.readFileSync(SOURCE_PREFLIGHT_PATH, "utf8"));
const acceptance = JSON.parse(fs.readFileSync(ACCEPTANCE_PATH, "utf8"));
const impact = JSON.parse(fs.readFileSync(IMPACT_PATH, "utf8"));
const plan = JSON.parse(fs.readFileSync(PLAN_PATH, "utf8"));
const builderSource = fs.readFileSync(BUILDER_PATH, "utf8");

const P109_KPS = [
  "kp_g4a_u04_3digit_by_2digit_tens_sufficient",
  "kp_g4a_u04_3digit_by_2digit_tens_insufficient",
];

test("P1-09 remediation preflight consumes the exact accepted diagnosis and does not authorize implementation", () => {
  assert.equal(preflight.taskId, "PATH1_P1_09_LARGER_DIVIDEND_TWO_DIGIT_DIVISOR_SOURCE_PARITY_REMEDIATION_PREFLIGHT_V1");
  assert.equal(preflight.operatorScope, "APPROVED_PREFLIGHT_ONLY");
  assert.equal(preflight.implementationAllowed, false);
  assert.equal(preflight.runtimeChanged, false);
  assert.equal(preflight.acceptedDiagnosis.existingRouteStatus, acceptance.status);
  assert.deepEqual(preflight.acceptedDiagnosis.acceptedCurrentSubset.questionCounts, [1, 20, 120]);
  assert.equal(preflight.acceptedDiagnosis.acceptedCurrentSubset.distinctPromptsAt120, true);
  assert.equal(preflight.acceptedDiagnosis.acceptedCurrentSubset.matrixRuntimeAliasStatus, "ACCEPTED_P109_BOUNDED_ALIAS");
});

test("P1-09 remediation locks only the two dynamically proven source-parity blockers", () => {
  assert.equal(acceptance.sourceParityDiagnosis.divisorEnvelopeClassification, "P109_DIVISOR_ENVELOPE_NARROWER_THAN_SOURCE");
  assert.equal(acceptance.sourceParityDiagnosis.runtimeDivisorEnvelope, "21..89");
  assert.equal(acceptance.sourceParityDiagnosis.sourceBackedDivisorEnvelope, "10..99");
  assert.equal(acceptance.sourceParityDiagnosis.threeDigitQuotientClassification, "P109_THREE_DIGIT_QUOTIENT_CASE_UNREACHABLE");
  assert.equal(acceptance.sourceParityDiagnosis.formalCaseCoverage.P109_4DIGIT_HUNDREDS_SUFFICIENT, "MISSING_IN_CURRENT_ROUTE");
  assert.equal(acceptance.sourceParityDiagnosis.formalCaseCoverage.P109_4DIGIT_HUNDREDS_INSUFFICIENT, "PRESENT_IN_CURRENT_ROUTE");
  assert.deepEqual(
    preflight.acceptedDiagnosis.sourceParityBlockers.map((entry) => entry.id),
    [
      "P109_DIVISOR_ENVELOPE_NARROWER_THAN_SOURCE",
      "P109_THREE_DIGIT_QUOTIENT_CASE_UNREACHABLE",
    ],
  );
});

test("remediation target preserves no-new-KP semantics and exact four-digit by two-digit arithmetic boundary", () => {
  const target = preflight.remediationTargetContract;
  assert.equal(target.blockId, "P1-09");
  assert.equal(target.generationKind, "DIFFICULTY_EXPANSION");
  assert.equal(target.difficultyExpansionId, "path1_four_digit_by_two_digit_division");
  assert.equal(target.matrixDifficultyExpansionId, "larger_dividend_two_digit_divisor");
  assert.equal(target.dividendEnvelope, "1000..9999");
  assert.equal(target.divisorEnvelope, "10..99");
  assert.equal(target.answerType, "quotient_remainder");
  assert.match(target.arithmeticInvariant, /remainder < divisor/);
  assert.equal(target.canonicalKnowledgePointMinted, false);
  assert.equal(target.newPatternSpecMaterialized, false);
  assert.equal(target.newPracticeModeAdded, false);
  assert.deepEqual(
    target.requiredFormalCases.map((entry) => [entry.caseId, entry.quotientDigits, entry.quotientStartPlace]),
    [
      ["P109_4DIGIT_HUNDREDS_SUFFICIENT", 3, "HUNDREDS"],
      ["P109_4DIGIT_HUNDREDS_INSUFFICIENT", 2, "TENS"],
    ],
  );
});

test("planned implementation is bounded to the existing P1-09 generator function in one product file", () => {
  const boundary = preflight.plannedImplementationBoundary;
  assert.equal(boundary.separateOperatorApprovalRequired, true);
  assert.deepEqual(boundary.allowedProductFiles, [BUILDER_PATH]);
  assert.equal(boundary.allowedProductFunction, "buildFourDigitByTwoDigitItems");
  assert.deepEqual(boundary.forbiddenProductFiles, [
    "site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js",
    "data/curriculum/learning-paths/path1-integer-foundations.curriculum-matrix.json",
  ]);
  assert.match(builderSource, /function buildFourDigitByTwoDigitItems\(/);
  assert.equal(boundary.allowedBehavioralChanges.length, 4);
  assert.ok(boundary.forbiddenSemanticChanges.includes("mint canonical KP"));
  assert.ok(boundary.forbiddenSemanticChanges.includes("change P1-10 three-digit-divisor semantics"));
  assert.ok(boundary.forbiddenSemanticChanges.includes("change P1-11 checking\/remainder-context semantics"));
});

test("shared-file mutation is behaviorally bounded because current public binding has exactly one difficulty-expansion block", () => {
  const difficultyBlocks = listPath1PublicWorksheetBlocks().filter((entry) => entry.generationKind === "DIFFICULTY_EXPANSION");
  assert.deepEqual(
    difficultyBlocks.map((entry) => [entry.blockId, entry.difficultyExpansionId]),
    [["P1-09", "path1_four_digit_by_two_digit_division"]],
  );
  assert.equal(preflight.sharedRuntimeRiskClassification.classification, "SHARED_RUNTIME_BOUNDED_P109_DEDICATED_FUNCTION");
  assert.equal(preflight.sharedRuntimeRiskClassification.requiresFullRepositoryRegression, false);
  assert.equal(preflight.sharedRuntimeRiskClassification.requiresGlobalBrowserReplay, false);
});

test("future implementation acceptance requires boundary reachability, both quotient cases, 120 distinct prompts, and printable parity", () => {
  const future = preflight.implementationAcceptanceContract;
  assert.deepEqual(future.requiredQuestionCounts, [1, 20, 120]);
  for (const required of [
    "divisor 10 reachable",
    "divisor 99 reachable",
    "both two-digit and three-digit quotient cases reachable",
    "for count >= 2 both formal cases represented",
    "three-digit quotient source-equivalent capability witness present",
    "120 distinct prompts",
    "printable worksheet question/answer parity",
  ]) {
    assert.ok(future.requiredChecks.includes(required), required);
  }
  assert.equal(future.publicBindingMutationRequired, false);
  assert.equal(future.path1MatrixMutationRequired, false);
});

test("source authority remains unchanged: P1-09 extends existing G4A-U04 knowledge without minting a canonical KP", () => {
  assert.deepEqual(sourcePreflight.matrixAuthority.primaryKnowledgePointIds, P109_KPS);
  assert.equal(sourcePreflight.matrixAuthority.newCanonicalKnowledgePointRequired, false);
  assert.equal(sourcePreflight.formalExpansionContract.dividendMin, 1000);
  assert.equal(sourcePreflight.formalExpansionContract.dividendMax, 9999);
  assert.equal(sourcePreflight.formalExpansionContract.divisorMin, 10);
  assert.equal(sourcePreflight.formalExpansionContract.divisorMax, 99);
  assert.equal(sourcePreflight.sourceAuthority.assessmentWitness.expression, "4024÷23");
  assert.equal(preflight.remediationTargetContract.sourceEquivalentCapabilityRequirement.includes("exact school-exam expression reproduction is not required"), true);
});

test("UNIT_INCREMENTAL_VALIDATION_V1 keeps remediation preflight KP-focused and implementation outside the current approval", () => {
  assert.equal(impact.policyId, "UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(impact.currentScope, "KP_LEAF");
  assert.equal(impact.expectedDerivedGate, "KP_FOCUSED");
  assert.deepEqual(impact.unitExpectedKnowledgePointIds, P109_KPS);
  assert.deepEqual(Object.values(impact.unitKnowledgePointGateStatus), ["PENDING", "PENDING"]);
  assert.deepEqual(impact.changeImpact, {
    sharedExecutableChange: false,
    publicAuthorityCutover: false,
    legalRouteSemanticsChanged: false,
    affectedRoutes: "BOUNDED",
    globalReleaseCheckpoint: false,
    currentAuthorityChanged: false,
  });
  assert.deepEqual(
    plan.lanes.KP_FOCUSED.map((entry) => entry.gateId),
    ["FOCUSED_TEST", "TARGETED_BROWSER_E2E", "DIRECT_DEPENDENCY_CONTRACTS"],
  );
  assert.deepEqual(plan.forbidden, ["FULL_NODE_REGRESSION", "GLOBAL_BROWSER_REPLAY"]);
  assert.equal(preflight.distance.goalDistanceBefore, "D2_P109_EXISTING_ROUTE_ACCEPTED_FOR_CURRENT_SUBSET_SOURCE_PARITY_GAPS_EXACTLY_ISOLATED");
  assert.equal(preflight.distance.goalDistanceAfterTarget, "D2_P109_SOURCE_PARITY_REMEDIATION_SCOPE_AND_ACCEPTANCE_CONTRACT_LOCKED");
  assert.equal(preflight.distance.nextShortestStep, "PATH1_P1_09_LARGER_DIVIDEND_TWO_DIGIT_DIVISOR_SOURCE_PARITY_REMEDIATION_IMPLEMENTATION_V1");
});
