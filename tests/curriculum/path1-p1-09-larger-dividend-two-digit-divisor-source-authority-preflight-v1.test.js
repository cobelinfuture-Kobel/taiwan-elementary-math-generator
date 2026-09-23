import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const CONTRACT_PATH = "data/curriculum/application/contracts/PATH1_P1_09_LARGER_DIVIDEND_TWO_DIGIT_DIVISOR_SOURCE_AUTHORITY_PREFLIGHT_V1.json";
const REVIEW_PATH = "data/curriculum/application/reviews/PATH1_P1_09_CLOUD_SOURCE_PROVENANCE_RECONCILIATION_V1.json";
const IMPACT_PATH = "data/project/change-impact/PATH1_P1_09_LARGER_DIVIDEND_TWO_DIGIT_DIVISOR_SOURCE_AUTHORITY_PREFLIGHT_V1.impact.json";
const PLAN_PATH = "data/project/validation-plans/PATH1_P1_09_LARGER_DIVIDEND_TWO_DIGIT_DIVISOR_SOURCE_AUTHORITY_PREFLIGHT_V1.validation.json";
const MATRIX_PATH = "data/curriculum/learning-paths/path1-integer-foundations.curriculum-matrix.json";
const BINDING_PATH = "site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";
const BUILDER_PATH = "site/assets/browser/pipeline/build-path1-manual-worksheet.js";
const P108_CLOSEOUT_PATH = "data/curriculum/application/contracts/PATH1_P1_08_BASELINE_ONLY_FINAL_CLOSEOUT_V1.json";

const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));
const review = JSON.parse(fs.readFileSync(REVIEW_PATH, "utf8"));
const impact = JSON.parse(fs.readFileSync(IMPACT_PATH, "utf8"));
const plan = JSON.parse(fs.readFileSync(PLAN_PATH, "utf8"));
const matrix = JSON.parse(fs.readFileSync(MATRIX_PATH, "utf8"));
const bindingSource = fs.readFileSync(BINDING_PATH, "utf8");
const builderSource = fs.readFileSync(BUILDER_PATH, "utf8");
const p108Closeout = JSON.parse(fs.readFileSync(P108_CLOSEOUT_PATH, "utf8"));

const P109_KPS = [
  "kp_g4a_u04_3digit_by_2digit_tens_sufficient",
  "kp_g4a_u04_3digit_by_2digit_tens_insufficient",
];

function blockById(blockId) {
  return matrix.blocks.find((entry) => entry.blockId === blockId);
}

test("P1-09 preflight consumes the exact P1-08 D0 predecessor and advances only the next Path1 block", () => {
  assert.equal(contract.taskId, "PATH1_P1_09_LARGER_DIVIDEND_TWO_DIGIT_DIVISOR_SOURCE_AUTHORITY_PREFLIGHT_V1");
  assert.equal(contract.operatorScope, "APPROVED_PREFLIGHT_ONLY");
  assert.equal(p108Closeout.distance.goalDistanceAfter, "D0_P108_GENERIC_ARITHMETIC_ROUTE_STABLE_ACCEPTED_BASELINE_ONLY");
  assert.equal(contract.queueAuthority.previousBlockId, "P1-08");
  assert.equal(contract.queueAuthority.previousBlockStatus, p108Closeout.distance.goalDistanceAfter);
  assert.equal(contract.queueAuthority.previousBlockCloseoutPr, 860);
  assert.equal(contract.queueAuthority.previousBlockCloseoutMergeSha, "29d1c269d705086a551d53e5f352670897e63848");
  assert.equal(contract.queueAuthority.currentBlockId, "P1-09");
  assert.deepEqual(contract.queueAuthority.requiredPrerequisiteBlockIds, ["P1-08"]);
  assert.equal(contract.queueAuthority.prerequisiteSatisfied, true);
  assert.equal(contract.queueAuthority.nextBlockId, "P1-10");
});

test("Path1 matrix keeps P1-09 as a no-new-KP difficulty expansion", () => {
  const p109 = blockById("P1-09");
  assert.ok(p109);
  assert.equal(p109.title, "多位數÷二位數");
  assert.equal(p109.blockType, "DIFFICULTY_EXPANSION");
  assert.deepEqual(p109.primaryKnowledgePointIds, P109_KPS);
  assert.deepEqual(p109.requiredPrerequisites.blockIds, ["P1-08"]);
  assert.equal(p109.patternExpansion.length, 1);
  assert.equal(p109.patternExpansion[0].kind, "DESCRIPTIVE_DIFFICULTY_EXPANSION");
  assert.equal(p109.patternExpansion[0].id, "larger_dividend_two_digit_divisor");
  assert.match(p109.patternExpansion[0].description, /增加被除數位數/);
  assert.equal(p109.masteryGate.mode, "REQUIRED_PATTERN_COVERED");
  assert.deepEqual(p109.masteryGate.requiredKnowledgePointIds, []);
  assert.deepEqual(p109.masteryGate.requiredPatternIds, ["larger_dividend_two_digit_divisor"]);
  assert.equal(contract.matrixAuthority.newCanonicalKnowledgePointRequired, false);
});

test("all three mandatory cloud evidence lanes are explicitly reviewed and source authority remains repo-led", () => {
  assert.equal(review.canonicalRepositoryAuthorityWins, true);
  assert.equal(review.mandatoryLanePolicy, "PATH1_CLOUD_SOURCE_CORPUS_REGISTRY_V2");
  assert.equal(review.allMandatoryLanesReviewed, true);
  assert.deepEqual(
    review.lanes.map((lane) => [lane.sourceCorpusId, lane.evidenceStatus]),
    [
      ["TAIWAN_G3_G6_LEARNING_MAPS", "DIRECT_WITNESS"],
      ["LI_TEACHER_MATH_THINKING_G1_G6", "NO_DIRECT_WITNESS"],
      ["MULTI_SCHOOL_EXAM_CORPUS_G03_G09", "DIRECT_WITNESS"],
    ],
  );
  assert.match(review.lanes[0].observedWitnessesOrNoWitnessReason, /二到四位數÷二位數/);
  assert.match(review.lanes[2].observedWitnessesOrNoWitnessReason, /4024÷23/);
  assert.equal(review.repositoryReconciliation.newKnowledgePointFromCloudEvidence, false);
  assert.equal(review.repositoryReconciliation.newPatternSpecFromCloudEvidence, false);
  assert.equal(review.repositoryReconciliation.numericEnvelopeExpandedByCloudEvidenceAlone, false);
  assert.equal(review.repositoryReconciliation.publicRouteActivatedByCloudEvidence, false);
});

test("direct assessment witness 4024÷23 proves a source-backed three-digit quotient case", () => {
  const witness = review.sourceBackedExpansionBoundary.directExamWitness;
  assert.equal(witness.fileId, "1ZLTZRGPTIFlYe9hIZBelgb-niUc8h1jx");
  assert.equal(witness.expression, "4024÷23");
  assert.equal(witness.quotient, 174);
  assert.equal(witness.remainder, 22);
  assert.equal(23 * witness.quotient + witness.remainder, 4024);
  assert.ok(witness.remainder < 23);
  assert.match(witness.case, /3-digit quotient/);
  assert.equal(contract.sourceAuthority.assessmentWitness.expression, witness.expression);
});

test("formal P1-09 expansion locks four-digit dividend, two-digit divisor, and both quotient-digit cases", () => {
  const formal = contract.formalExpansionContract;
  assert.equal(formal.expansionKind, "DESCRIPTIVE_DIFFICULTY_EXPANSION");
  assert.equal(formal.canonicalKnowledgePointMinted, false);
  assert.equal(formal.dividendMin, 1000);
  assert.equal(formal.dividendMax, 9999);
  assert.equal(formal.divisorMin, 10);
  assert.equal(formal.divisorMax, 99);
  assert.equal(formal.answerType, "quotient_remainder");
  assert.match(formal.arithmeticInvariant, /remainder < divisor/);
  assert.deepEqual(
    formal.cases.map((entry) => [entry.caseId, entry.expectedQuotientDigits, entry.quotientStartPlace]),
    [
      ["P109_4DIGIT_HUNDREDS_SUFFICIENT", 3, "HUNDREDS"],
      ["P109_4DIGIT_HUNDREDS_INSUFFICIENT", 2, "TENS"],
    ],
  );
  assert.ok(formal.cases.every((entry) => entry.pedagogicalOwnership.includes("P1-07")));
});

test("historical source-authority preflight records the superseded runtime gaps without freezing their old source text", () => {
  assert.match(bindingSource, /block\("P1-09", "多位數÷二位數", \[\], \{/);
  assert.match(bindingSource, /difficultyExpansionId: "path1_four_digit_by_two_digit_division"/);
  assert.match(builderSource, /function buildFourDigitByTwoDigitItems\(/);
  assert.match(builderSource, /knowledgePointId: null/);
  assert.match(builderSource, /canonicalKnowledgePointMinted: false/);

  const readback = contract.existingRuntimeReadback;
  assert.equal(readback.publicBindingGenerationKind, "DIFFICULTY_EXPANSION");
  assert.deepEqual(readback.publicBindingKnowledgePointIds, []);
  assert.equal(readback.runtimeDifficultyExpansionId, "path1_four_digit_by_two_digit_division");
  assert.equal(readback.currentDivisorEnvelope, "21..89");
  assert.equal(readback.currentQuotientEnvelope, "20..99");
  assert.equal(readback.runtimeDefectDeclaredByPreflight, false);
  assert.equal(readback.staticSourceParityGaps.length, 4);
  assert.ok(readback.staticSourceParityGaps.some((gap) => gap.includes("21..89")));
  assert.ok(readback.staticSourceParityGaps.some((gap) => gap.includes("three-digit-quotient")));
});

test("P1-09 boundaries remain separated from P1-07 representation, P1-10 divisor growth, and P1-11 checking", () => {
  assert.match(contract.adjacentBoundaries["P1-07"], /quotient-start-place/);
  assert.match(contract.adjacentBoundaries["P1-08"], /required predecessor/);
  assert.match(contract.adjacentBoundaries["P1-10"], /three-digit divisors/);
  assert.match(contract.adjacentBoundaries["P1-11"], /remainder\/checking emphasis/);
  for (const value of Object.values(contract.antiScopeCreep)) assert.equal(value, false);
  assert.equal(contract.implementationAllowed, false);
  assert.equal(contract.runtimeChanged, false);
  assert.equal(contract.publicBindingMutationAllowed, false);
  assert.equal(contract.path1MatrixChanged, false);
});

test("UNIT_INCREMENTAL_VALIDATION_V1 keeps P1-09 preflight KP-focused and routes next to bounded existing-route acceptance", () => {
  assert.equal(impact.policyId, "UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(impact.currentScope, "KP_LEAF");
  assert.equal(impact.expectedDerivedGate, "KP_FOCUSED");
  assert.deepEqual(impact.unitExpectedKnowledgePointIds, P109_KPS);
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
  assert.equal(contract.validation.expectedLane, "KP_FOCUSED");
  assert.equal(contract.validation.fullRepositoryRegressionRequired, false);
  assert.equal(contract.validation.globalBrowserReplayRequired, false);
  assert.equal(contract.futureAcceptanceContract.implementationAllowedByThisPreflight, false);
  assert.deepEqual(contract.futureAcceptanceContract.requiredQuestionCounts, [1, 20, 120]);
  assert.equal(contract.distance.goalDistanceAfterTarget, "D2_P109_SOURCE_FORMAL_EXPANSION_AND_ACCEPTANCE_BOUNDARY_LOCKED");
  assert.equal(contract.distance.nextShortestStep, "PATH1_P1_09_LARGER_DIVIDEND_TWO_DIGIT_DIVISOR_EXISTING_ROUTE_ACCEPTANCE_V1");
});
