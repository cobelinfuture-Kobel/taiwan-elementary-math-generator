import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import { buildPath1ManualWorksheet } from "../../site/assets/browser/pipeline/build-path1-manual-worksheet.js";
import { getPath1PublicWorksheetBlock } from "../../site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";

const CONTRACT_PATH = "data/curriculum/application/contracts/PATH1_P1_08_TWO_DIGIT_DIVISOR_GENERIC_ARITHMETIC_ACCEPTANCE_V1.json";
const IMPACT_PATH = "data/project/change-impact/PATH1_P1_08_TWO_DIGIT_DIVISOR_GENERIC_ARITHMETIC_ACCEPTANCE_V1.impact.json";
const PLAN_PATH = "data/project/validation-plans/PATH1_P1_08_TWO_DIGIT_DIVISOR_GENERIC_ARITHMETIC_ACCEPTANCE_V1.validation.json";
const RUNNER_PATH = "tools/curriculum/run-path1-p1-08-two-digit-divisor-generic-arithmetic-acceptance-v1.mjs";

const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));
const impact = JSON.parse(fs.readFileSync(IMPACT_PATH, "utf8"));
const plan = JSON.parse(fs.readFileSync(PLAN_PATH, "utf8"));

const PRIMARY_KPS = [
  "kp_g4a_u04_2digit_by_2digit_ten_multiple_divisor",
  "kp_g4a_u04_3digit_by_2digit_tens_sufficient",
  "kp_g4a_u04_3digit_by_2digit_tens_insufficient",
];

function generatedQuestions(result) {
  return result?.worksheetDocument?.generatedQuestions
    ?? result?.worksheetDocument?.questions
    ?? result?.worksheetDocument?.questionItems
    ?? [];
}

function countsByKnowledgePoint(questions) {
  return PRIMARY_KPS.map((knowledgePointId) => (
    questions.filter((question) => question.knowledgePointId === knowledgePointId).length
  ));
}

function assertArithmeticWitnesses(questions, expectedCount) {
  assert.equal(questions.length, expectedCount);
  for (const question of questions) {
    const metadata = question.metadata ?? {};
    const dividend = metadata.dividend ?? question.dividend;
    const divisor = metadata.divisor ?? question.divisor;
    const quotient = metadata.quotient ?? question.quotient;
    const remainder = metadata.remainder ?? question.remainder;
    assert.equal(Number.isInteger(dividend), true, "dividend");
    assert.equal(Number.isInteger(divisor), true, "divisor");
    assert.equal(Number.isInteger(quotient), true, "quotient");
    assert.equal(Number.isInteger(remainder), true, "remainder");
    assert.equal(dividend, divisor * quotient + remainder);
    assert.equal(remainder >= 0 && remainder < divisor, true);
  }
}

test("P1-08 public binding remains the three-KP generic arithmetic route", () => {
  const block = getPath1PublicWorksheetBlock("P1-08");
  assert.ok(block);
  assert.equal(block.title, "二位數除數");
  assert.equal(block.questionMode, "numeric");
  assert.deepEqual(block.knowledgePointIds, PRIMARY_KPS);
  assert.deepEqual(block.questionTypes, ["arithmetic"]);
  assert.equal(contract.route.practiceMode, "arithmetic");
  assert.deepEqual(contract.route.requiredQuestionCounts, [1, 20, 120]);
});

test("P1-08 generic arithmetic count=1 exposes the bounded all-KP coverage gap exactly", () => {
  const result = buildPath1ManualWorksheet({
    blockId: "P1-08",
    practiceMode: "arithmetic",
    questionCount: 1,
    generationSeed: "p108-generic-arithmetic-acceptance-1",
    includeAnswerKey: true,
  });
  assert.equal(result.ok, false);
  assert.equal(result.worksheetDocument, null);
  assert.equal(result.errors.length, 1);
  assert.equal(result.errors[0].code, "PATH1_QUESTION_COUNT_BELOW_KP_COVERAGE");
  assert.equal(result.errors[0].blockId, "P1-08");
  assert.equal(result.errors[0].questionCount, 1);
  assert.equal(result.errors[0].requiredMinimum, 3);
  assert.equal(contract.acceptanceDecision.singleQuestionAcceptancePass, false);
  assert.equal(contract.acceptanceDecision.gapId, "P108_SINGLE_QUESTION_ALL_KP_COVERAGE_CONFLICT");
});

test("P1-08 generic arithmetic count=20 passes with deterministic 7/7/6 KP allocation", () => {
  const result = buildPath1ManualWorksheet({
    blockId: "P1-08",
    practiceMode: "arithmetic",
    questionCount: 20,
    generationSeed: "p108-generic-arithmetic-acceptance-20",
    includeAnswerKey: true,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors ?? []));
  const questions = generatedQuestions(result);
  assertArithmeticWitnesses(questions, 20);
  assert.deepEqual(countsByKnowledgePoint(questions), [7, 7, 6]);
});

test("P1-08 generic arithmetic count=120 passes with balanced 40/40/40 KP allocation", () => {
  const result = buildPath1ManualWorksheet({
    blockId: "P1-08",
    practiceMode: "arithmetic",
    questionCount: 120,
    generationSeed: "p108-generic-arithmetic-acceptance-120",
    includeAnswerKey: true,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors ?? []));
  const questions = generatedQuestions(result);
  assertArithmeticWitnesses(questions, 120);
  assert.deepEqual(countsByKnowledgePoint(questions), [40, 40, 40]);
});

test("acceptance closes as evidence-only bounded gap with no runtime mutation authorization", () => {
  assert.equal(contract.status, "P1_08_GENERIC_ARITHMETIC_ACCEPTANCE_BOUNDED_SINGLE_QUESTION_GAP");
  assert.equal(contract.acceptanceDecision.fullAcceptancePass, false);
  assert.equal(contract.acceptanceDecision.twentyQuestionAcceptancePass, true);
  assert.equal(contract.acceptanceDecision.oneHundredTwentyQuestionAcceptancePass, true);
  assert.equal(contract.acceptanceDecision.runtimeMutationAuthorized, false);
  for (const value of Object.values(contract.runtimeBoundary)) assert.equal(value, false);
  assert.equal(contract.distance.nextShortestStep, "PATH1_P1_08_GENERIC_ARITHMETIC_SINGLE_QUESTION_COVERAGE_GAP_PREFLIGHT_V1");
});

test("incremental validation remains exactly KP_FOCUSED", () => {
  assert.equal(impact.policyId, "UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(impact.currentScope, "KP_LEAF");
  assert.equal(impact.expectedDerivedGate, "KP_FOCUSED");
  assert.deepEqual(impact.unitExpectedKnowledgePointIds, PRIMARY_KPS);
  assert.equal(impact.changeImpact.sharedExecutableChange, false);
  assert.equal(impact.changeImpact.publicAuthorityCutover, false);
  assert.equal(impact.changeImpact.currentAuthorityChanged, false);
  const lane = plan.lanes.KP_FOCUSED;
  assert.deepEqual(lane.map((entry) => entry.gateId), [
    "FOCUSED_TEST",
    "TARGETED_BROWSER_E2E",
    "DIRECT_DEPENDENCY_CONTRACTS",
  ]);
  assert.equal(lane[1].kind, "NODE_RUNNER");
  assert.equal(lane[1].runtime, "PLAYWRIGHT_CHROMIUM");
  assert.equal(lane[1].path, RUNNER_PATH);
  assert.equal(fs.existsSync(RUNNER_PATH), true);
});
