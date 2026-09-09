import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import { buildPath1ManualWorksheet } from "../../site/assets/browser/pipeline/build-path1-manual-worksheet.js";

const CONTRACT_PATH = "data/curriculum/application/contracts/PATH1_P1_08_TWO_DIGIT_DIVISOR_GENERIC_ARITHMETIC_ACCEPTANCE_V1.json";
const IMPACT_PATH = "data/project/change-impact/PATH1_P1_08_TWO_DIGIT_DIVISOR_GENERIC_ARITHMETIC_ACCEPTANCE_V1.impact.json";
const PLAN_PATH = "data/project/validation-plans/PATH1_P1_08_TWO_DIGIT_DIVISOR_GENERIC_ARITHMETIC_ACCEPTANCE_V1.validation.json";

const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));
const impact = JSON.parse(fs.readFileSync(IMPACT_PATH, "utf8"));
const plan = JSON.parse(fs.readFileSync(PLAN_PATH, "utf8"));

const PRIMARY_KPS = [
  "kp_g4a_u04_2digit_by_2digit_ten_multiple_divisor",
  "kp_g4a_u04_3digit_by_2digit_tens_sufficient",
  "kp_g4a_u04_3digit_by_2digit_tens_insufficient",
];
const PATTERNS = [
  "ps_g4a_u04_2digit_by_2digit_ten_multiple_divisor",
  "ps_g4a_u04_3digit_by_2digit_tens_sufficient",
  "ps_g4a_u04_3digit_by_2digit_tens_insufficient",
];
const PATTERN_TO_KP = new Map([
  [PATTERNS[0], PRIMARY_KPS[0]],
  [PATTERNS[1], PRIMARY_KPS[1]],
  [PATTERNS[2], PRIMARY_KPS[2]],
]);

function sorted(values) {
  return [...values].sort();
}

function assertSuccessfulArithmeticAcceptance(questionCount, seed) {
  const result = buildPath1ManualWorksheet({
    blockId: "P1-08",
    questionCount,
    seed,
    form: "A",
  });
  assert.equal(result.ok, true, JSON.stringify(result.error ?? result.errors ?? result));
  assert.equal(result.stage, "complete");
  assert.equal(result.requestedBlockId, "P1-08");
  assert.equal(result.questionCount, questionCount);
  assert.equal(result.generatedCount, questionCount);
  assert.deepEqual(sorted(result.selectedKnowledgePointIds), sorted(PRIMARY_KPS));
  assert.deepEqual(sorted(result.availableKnowledgePointIds), sorted(PRIMARY_KPS));

  const questions = result.worksheetDocument?.questions ?? [];
  assert.equal(questions.length, questionCount);
  const observedPatterns = new Set();
  let missingKnowledgePointMetadata = 0;

  for (const question of questions) {
    assert.equal(PATTERNS.includes(question.patternSpecId), true, `unexpected pattern ${question.patternSpecId}`);
    observedPatterns.add(question.patternSpecId);
    const expectedKp = PATTERN_TO_KP.get(question.patternSpecId);
    if (question.knowledgePointId == null) {
      missingKnowledgePointMetadata += 1;
    } else {
      assert.equal(question.knowledgePointId, expectedKp, `${question.patternSpecId}:knowledgePointId`);
    }
    assert.equal(question.sourceId, "g4a_u04_4a04");
    assert.equal(Number.isInteger(question.dividend), true);
    assert.equal(Number.isInteger(question.divisor), true);
    assert.equal(Number.isInteger(question.quotient), true);
    assert.equal(Number.isInteger(question.remainder), true);
    assert.equal(question.dividend, question.divisor * question.quotient + question.remainder);
    assert.equal(question.remainder >= 0, true);
    assert.equal(question.remainder < question.divisor, true);
    assert.equal(String(question.promptText ?? question.blankedDisplayText ?? "").includes(`${question.dividend} ÷ ${question.divisor}`), true);
    assert.equal(question.answerText, `商 ${question.quotient}，餘 ${question.remainder}`);
  }

  assert.deepEqual(sorted(observedPatterns), sorted(PATTERNS));
  assert.equal(missingKnowledgePointMetadata, questionCount);
  return result;
}

test("acceptance task remains diagnostic-only and locks exact P1-08 authority", () => {
  assert.equal(contract.taskId, "PATH1_P1_08_TWO_DIGIT_DIVISOR_GENERIC_ARITHMETIC_ACCEPTANCE_V1");
  assert.equal(contract.status, "P1_08_GENERIC_ARITHMETIC_ACCEPTANCE_GAPS_ISOLATED");
  assert.equal(contract.operatorScope, "APPROVED_DIAGNOSTIC_ACCEPTANCE_ONLY");
  assert.equal(contract.acceptanceScope.blockId, "P1-08");
  assert.equal(contract.acceptanceScope.practiceMode, "arithmetic");
  assert.deepEqual(contract.acceptanceScope.requiredQuestionCounts, [1, 20, 120]);
  assert.deepEqual(contract.canonicalAuthority.primaryKnowledgePointIds, PRIMARY_KPS);
  assert.deepEqual(contract.canonicalAuthority.patternSpecIds, PATTERNS);
  for (const key of [
    "implementationAllowed",
    "runtimeChanged",
    "publicBindingMutationAllowed",
    "generatorMutationAllowed",
    "patternSpecMutationAllowed",
    "path1MatrixChanged",
    "canonicalKnowledgeAuthorityChanged",
    "publicUiChanged",
  ]) assert.equal(contract.acceptanceScope[key], false, key);
  for (const value of Object.values(contract.antiScopeCreep)) assert.equal(value, false);
});

test("P1-08 generic arithmetic count=1 is rejected by the current all-KP coverage invariant", () => {
  const result = buildPath1ManualWorksheet({ blockId: "P1-08", questionCount: 1, seed: 108001, form: "A" });
  assert.equal(result.ok, false);
  assert.equal(result.stage, "pipeline");
  assert.equal(result.error?.code, "PATH1_QUESTION_COUNT_BELOW_KP_COVERAGE");
  assert.equal(contract.diagnosticAcceptance.count1.classification, "P108_GENERIC_ARITHMETIC_COUNT1_KP_COVERAGE_CONFLICT");
});

test("P1-08 generic arithmetic count=20 generates exact P1-08 patterns with arithmetic parity", () => {
  assertSuccessfulArithmeticAcceptance(20, 108020);
});

test("P1-08 generic arithmetic count=120 generates exact P1-08 patterns with arithmetic parity", () => {
  assertSuccessfulArithmeticAcceptance(120, 108120);
});

test("runtime item KP metadata gap is explicitly isolated instead of silently treated as accepted", () => {
  assert.equal(contract.diagnosticAcceptance.runtimeKnowledgePointMetadata.expectedPerQuestionKnowledgePointId, null);
  assert.equal(contract.diagnosticAcceptance.runtimeKnowledgePointMetadata.classification, "P108_RUNTIME_KP_METADATA_NOT_EMITTED");
  assert.equal(contract.runtimeRemediation.startsWith("NOT_AUTHORIZED"), true);
  assert.equal(contract.distance.goalDistanceAfterTarget, "D1_P108_GENERIC_ARITHMETIC_ACCEPTANCE_GAPS_ISOLATED");
  assert.equal(contract.distance.nextShortestStep, "PATH1_P1_08_GENERIC_ARITHMETIC_SMALL_COUNT_AND_KP_METADATA_REMEDIATION_PREFLIGHT_V1");
});

test("incremental validation is KP_FOCUSED only and does not request full/global replay", () => {
  assert.equal(impact.policyId, "UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(impact.currentScope, "KP_LEAF");
  assert.equal(impact.expectedDerivedGate, "KP_FOCUSED");
  assert.deepEqual(impact.unitExpectedKnowledgePointIds, PRIMARY_KPS);
  assert.equal(impact.changeImpact.sharedExecutableChange, false);
  assert.equal(impact.changeImpact.publicAuthorityCutover, false);
  assert.equal(impact.changeImpact.currentAuthorityChanged, false);
  assert.equal(contract.validation.fullRepositoryRegressionRequired, false);
  assert.equal(contract.validation.globalBrowserReplayRequired, false);
  const lane = plan.lanes.KP_FOCUSED;
  assert.deepEqual(lane.map((entry) => entry.gateId), [
    "FOCUSED_TEST",
    "TARGETED_BROWSER_E2E",
    "DIRECT_DEPENDENCY_CONTRACTS",
  ]);
});
