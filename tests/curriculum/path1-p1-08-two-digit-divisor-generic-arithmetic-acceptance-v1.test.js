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
const PATTERNS = [
  "ps_g4a_u04_2digit_by_2digit_ten_multiple_divisor",
  "ps_g4a_u04_3digit_by_2digit_tens_sufficient",
  "ps_g4a_u04_3digit_by_2digit_tens_insufficient",
];

function generatedQuestions(result) {
  return result?.worksheetDocument?.generatedQuestions
    ?? result?.worksheetDocument?.questions
    ?? result?.worksheetDocument?.questionItems
    ?? [];
}

function countsByPattern(questions) {
  return PATTERNS.map((patternSpecId) => (
    questions.filter((question) => question.patternSpecId === patternSpecId).length
  ));
}

function assertSuccessfulArithmeticAcceptance(questionCount, expectedPatternCounts, generationSeed) {
  const result = buildPath1ManualWorksheet({
    blockId: "P1-08",
    practiceMode: "arithmetic",
    questionCount,
    generationSeed,
    includeAnswerKey: true,
  });

  assert.equal(result.ok, true, JSON.stringify(result.errors ?? []));
  assert.equal(result.block?.blockId, "P1-08");
  assert.deepEqual(result.block?.knowledgePointIds, PRIMARY_KPS);

  const questions = generatedQuestions(result);
  assert.equal(questions.length, questionCount);
  assert.deepEqual(countsByPattern(questions), expectedPatternCounts);

  for (const question of questions) {
    assert.equal(PATTERNS.includes(question.patternSpecId), true, `unexpected pattern ${question.patternSpecId}`);
    assert.equal(question.sourceId, "g4a_u04_4a04");
    assert.equal(question.knowledgePointId, null, `${question.patternSpecId}: current runtime KP metadata gap`);

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

    const prompt = String(question.promptText ?? question.blankedDisplayText ?? question.prompt ?? "");
    assert.equal(prompt.includes(`${dividend} ÷ ${divisor}`), true, prompt);
    assert.equal(question.answerText, `商 ${quotient}，餘 ${remainder}`);
  }

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

test("P1-08 public binding is exactly three KPs and remains on generic arithmetic", () => {
  const block = getPath1PublicWorksheetBlock("P1-08");
  assert.ok(block);
  assert.equal(block.title, "二位數除數");
  assert.equal(block.generationKind, "CANONICAL_KP");
  assert.equal(block.questionMode, null);
  assert.deepEqual(block.knowledgePointIds, PRIMARY_KPS);
  assert.equal(contract.acceptanceScope.practiceMode, "arithmetic");
});

test("P1-08 generic arithmetic count=1 is rejected by the current all-KP coverage invariant", () => {
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
  assert.equal(contract.diagnosticAcceptance.count1.classification, "P108_GENERIC_ARITHMETIC_COUNT1_KP_COVERAGE_CONFLICT");
});

test("P1-08 generic arithmetic count=20 generates exact P1-08 patterns with arithmetic parity", () => {
  assertSuccessfulArithmeticAcceptance(20, [7, 7, 6], "p108-generic-arithmetic-acceptance-20");
});

test("P1-08 generic arithmetic count=120 generates exact P1-08 patterns with arithmetic parity", () => {
  assertSuccessfulArithmeticAcceptance(120, [40, 40, 40], "p108-generic-arithmetic-acceptance-120");
});

test("runtime item KP metadata gap is explicitly isolated instead of silently treated as accepted", () => {
  assert.equal(contract.diagnosticAcceptance.runtimeKnowledgePointMetadata.expectedPerQuestionKnowledgePointId, null);
  assert.equal(contract.diagnosticAcceptance.runtimeKnowledgePointMetadata.classification, "P108_RUNTIME_KP_METADATA_NOT_EMITTED");
  assert.equal(contract.diagnosticAcceptance.runtimeKnowledgePointMetadata.routeSelectionStillMustExposeExactSelectedKnowledgePointIds, true);
  assert.equal(contract.runtimeRemediation.startsWith("NOT_AUTHORIZED"), true);
  assert.equal(contract.distance.goalDistanceAfterTarget, "D1_P108_GENERIC_ARITHMETIC_ACCEPTANCE_GAPS_ISOLATED");
  assert.equal(contract.distance.nextShortestStep, "PATH1_P1_08_GENERIC_ARITHMETIC_SMALL_COUNT_AND_KP_METADATA_REMEDIATION_PREFLIGHT_V1");
});

test("incremental validation is KP_FOCUSED with an actual targeted Chromium runner", () => {
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
  assert.equal(lane[1].kind, "NODE_RUNNER");
  assert.equal(lane[1].runtime, "PLAYWRIGHT_CHROMIUM");
  assert.equal(lane[1].path, RUNNER_PATH);
  assert.equal(fs.existsSync(RUNNER_PATH), true);
});
