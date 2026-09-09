import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import { buildPath1ManualWorksheet } from "../../site/assets/browser/pipeline/build-path1-manual-worksheet.js";
import { getPath1PublicWorksheetBlock } from "../../site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";

const CONTRACT_PATH = "data/curriculum/application/contracts/PATH1_P1_08_TWO_DIGIT_DIVISOR_GENERIC_ARITHMETIC_ACCEPTANCE_V1.json";
const PREFLIGHT_PATH = "data/curriculum/application/contracts/PATH1_P1_08_GENERIC_ARITHMETIC_SMALL_COUNT_AND_KP_METADATA_REMEDIATION_PREFLIGHT_V1.json";
const IMPACT_PATH = "data/project/change-impact/PATH1_P1_08_TWO_DIGIT_DIVISOR_GENERIC_ARITHMETIC_ACCEPTANCE_V1.impact.json";
const PLAN_PATH = "data/project/validation-plans/PATH1_P1_08_TWO_DIGIT_DIVISOR_GENERIC_ARITHMETIC_ACCEPTANCE_V1.validation.json";
const RUNNER_PATH = "tools/curriculum/run-path1-p1-08-two-digit-divisor-generic-arithmetic-acceptance-v1.mjs";

const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));
const preflight = JSON.parse(fs.readFileSync(PREFLIGHT_PATH, "utf8"));
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
const PATTERN_TO_KP = new Map(PATTERNS.map((pattern, index) => [pattern, PRIMARY_KPS[index]]));

function generatedQuestions(result) {
  return result?.worksheetDocument?.generatedQuestions
    ?? result?.worksheetDocument?.questions
    ?? result?.worksheetDocument?.questionItems
    ?? [];
}

function countsByPattern(questions) {
  return PATTERNS.map((patternSpecId) => questions.filter((question) => question.patternSpecId === patternSpecId).length);
}

function assertCurrentArithmeticAcceptance(questionCount, expectedPatternCounts, generationSeed) {
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
    assert.equal(question.knowledgePointId, PATTERN_TO_KP.get(question.patternSpecId));

    const metadata = question.metadata ?? {};
    const dividend = metadata.dividend ?? question.dividend;
    const divisor = metadata.divisor ?? question.divisor;
    const quotient = metadata.quotient ?? question.quotient;
    const remainder = metadata.remainder ?? question.remainder;
    assert.equal(dividend, divisor * quotient + remainder);
    assert.equal(remainder >= 0 && remainder < divisor, true);
  }

  return result;
}

test("diagnostic contract remains immutable historical evidence for the isolated pre-remediation gaps", () => {
  assert.equal(contract.taskId, "PATH1_P1_08_TWO_DIGIT_DIVISOR_GENERIC_ARITHMETIC_ACCEPTANCE_V1");
  assert.equal(contract.status, "P1_08_GENERIC_ARITHMETIC_ACCEPTANCE_GAPS_ISOLATED");
  assert.equal(contract.operatorScope, "APPROVED_DIAGNOSTIC_ACCEPTANCE_ONLY");
  assert.deepEqual(contract.acceptanceScope.requiredQuestionCounts, [1, 20, 120]);
  assert.deepEqual(contract.canonicalAuthority.primaryKnowledgePointIds, PRIMARY_KPS);
  assert.deepEqual(contract.canonicalAuthority.patternSpecIds, PATTERNS);
  assert.equal(contract.diagnosticAcceptance.count1.classification, "P108_GENERIC_ARITHMETIC_COUNT1_KP_COVERAGE_CONFLICT");
  assert.equal(contract.diagnosticAcceptance.runtimeKnowledgePointMetadata.classification, "P108_RUNTIME_KP_METADATA_NOT_EMITTED");
  assert.equal(preflight.status, "P1_08_REMEDIATION_PREFLIGHT_LOCKED_NO_RUNTIME");
});

test("P1-08 public binding remains exactly three KPs and generic arithmetic", () => {
  const block = getPath1PublicWorksheetBlock("P1-08");
  assert.ok(block);
  assert.equal(block.title, "二位數除數");
  assert.equal(block.generationKind, "CANONICAL_KP");
  assert.equal(block.questionMode, null);
  assert.deepEqual(block.knowledgePointIds, PRIMARY_KPS);
});

test("historical count=1 conflict is now remediated without changing P1-08 authority", () => {
  const result = buildPath1ManualWorksheet({
    blockId: "P1-08",
    practiceMode: "arithmetic",
    questionCount: 1,
    generationSeed: "p108-generic-arithmetic-acceptance-1",
    includeAnswerKey: true,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors ?? []));
  assert.deepEqual(result.block?.knowledgePointIds, PRIMARY_KPS);
  const questions = generatedQuestions(result);
  assert.equal(questions.length, 1);
  assert.equal(PRIMARY_KPS.includes(questions[0].knowledgePointId), true);
  assert.equal(PATTERNS.includes(questions[0].patternSpecId), true);
  assert.equal(questions[0].knowledgePointId, PATTERN_TO_KP.get(questions[0].patternSpecId));
});

test("current P1-08 count=20 preserves exact pattern allocation with repaired KP metadata", () => {
  assertCurrentArithmeticAcceptance(20, [7, 7, 6], "p108-generic-arithmetic-acceptance-20");
});

test("current P1-08 count=120 preserves exact pattern allocation with repaired KP metadata", () => {
  assertCurrentArithmeticAcceptance(120, [40, 40, 40], "p108-generic-arithmetic-acceptance-120");
});

test("historical metadata gap remains recorded while current runtime emits non-null exact KP IDs", () => {
  assert.equal(contract.diagnosticAcceptance.runtimeKnowledgePointMetadata.expectedPerQuestionKnowledgePointId, null);
  assert.equal(preflight.knowledgePointMetadataDecision.topLevelKnowledgePointIdRequired, true);
  const result = buildPath1ManualWorksheet({
    blockId: "P1-08",
    practiceMode: "arithmetic",
    questionCount: 20,
    generationSeed: "p108-current-kp-metadata-repair",
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors ?? []));
  assert.equal(generatedQuestions(result).every((question) => PRIMARY_KPS.includes(question.knowledgePointId)), true);
});

test("historical diagnostic validation metadata remains intact and its runner path is retained as a compatibility alias", () => {
  assert.equal(impact.policyId, "UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(impact.currentScope, "KP_LEAF");
  assert.equal(impact.expectedDerivedGate, "KP_FOCUSED");
  assert.deepEqual(impact.unitExpectedKnowledgePointIds, PRIMARY_KPS);
  const lane = plan.lanes.KP_FOCUSED;
  assert.equal(lane[1].path, RUNNER_PATH);
  assert.equal(fs.existsSync(RUNNER_PATH), true);
});
