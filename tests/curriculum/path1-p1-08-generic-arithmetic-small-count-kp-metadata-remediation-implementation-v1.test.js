import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import { buildPath1ManualWorksheet } from "../../site/assets/browser/pipeline/build-path1-manual-worksheet.js";
import { getPath1PublicWorksheetBlock } from "../../site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";

const CONTRACT_PATH = "data/curriculum/application/contracts/PATH1_P1_08_GENERIC_ARITHMETIC_SMALL_COUNT_AND_KP_METADATA_REMEDIATION_IMPLEMENTATION_V1.json";
const PREFLIGHT_PATH = "data/curriculum/application/contracts/PATH1_P1_08_GENERIC_ARITHMETIC_SMALL_COUNT_AND_KP_METADATA_REMEDIATION_PREFLIGHT_V1.json";
const PROVENANCE_PATH = "data/curriculum/application/reviews/PATH1_P1_08_CLOUD_SOURCE_PROVENANCE_RECONCILIATION_V1.json";
const IMPACT_PATH = "data/project/change-impact/PATH1_P1_08_GENERIC_ARITHMETIC_SMALL_COUNT_AND_KP_METADATA_REMEDIATION_IMPLEMENTATION_V1.impact.json";
const PLAN_PATH = "data/project/validation-plans/PATH1_P1_08_GENERIC_ARITHMETIC_SMALL_COUNT_AND_KP_METADATA_REMEDIATION_IMPLEMENTATION_V1.validation.json";
const RUNNER_PATH = "tools/curriculum/run-path1-p1-08-generic-arithmetic-small-count-kp-metadata-remediation-implementation-v1.mjs";

const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));
const preflight = JSON.parse(fs.readFileSync(PREFLIGHT_PATH, "utf8"));
const provenance = JSON.parse(fs.readFileSync(PROVENANCE_PATH, "utf8"));
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

function generatedQuestions(result) {
  return result?.worksheetDocument?.generatedQuestions
    ?? result?.worksheetDocument?.questions
    ?? result?.worksheetDocument?.questionItems
    ?? [];
}

function countsByField(questions, values, field) {
  return values.map((value) => questions.filter((question) => question[field] === value).length);
}

function build(questionCount, generationSeed) {
  return buildPath1ManualWorksheet({
    blockId: "P1-08",
    practiceMode: "arithmetic",
    questionCount,
    generationSeed,
    includeAnswerKey: true,
  });
}

function assertQuestionSemantics(question) {
  assert.equal(PATTERNS.includes(question.patternSpecId), true, `unexpected pattern ${question.patternSpecId}`);
  assert.equal(question.sourceId, "g4a_u04_4a04");
  assert.equal(question.knowledgePointId, PATTERN_TO_KP.get(question.patternSpecId));

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
  assert.equal(String(question.promptText ?? question.blankedDisplayText ?? question.prompt ?? "").includes(`${dividend} ÷ ${divisor}`), true);
  assert.equal(question.answerText, `商 ${quotient}，餘 ${remainder}`);
}

function assertAcceptance(questionCount, expectedAllocation, generationSeed) {
  const result = build(questionCount, generationSeed);
  assert.equal(result.ok, true, JSON.stringify(result.errors ?? []));
  assert.deepEqual(result.block?.knowledgePointIds, PRIMARY_KPS);
  const questions = generatedQuestions(result);
  assert.equal(questions.length, questionCount);
  assert.deepEqual(countsByField(questions, PATTERNS, "patternSpecId"), expectedAllocation);
  assert.deepEqual(countsByField(questions, PRIMARY_KPS, "knowledgePointId"), expectedAllocation);
  for (const question of questions) assertQuestionSemantics(question);
  return { result, questions };
}

test("implementation follows the approved preflight and already-reviewed three-lane source authority", () => {
  assert.equal(contract.taskId, "PATH1_P1_08_GENERIC_ARITHMETIC_SMALL_COUNT_AND_KP_METADATA_REMEDIATION_IMPLEMENTATION_V1");
  assert.equal(preflight.futureImplementationBoundary.taskId, contract.taskId);
  assert.equal(preflight.smallCountPolicyDecision.policyId, contract.implementation.smallCountPolicyId);
  assert.equal(preflight.knowledgePointMetadataDecision.policyId, contract.implementation.knowledgePointMetadataPolicyId);
  assert.deepEqual(contract.implementation.knowledgePointIdFallbackOrder, preflight.knowledgePointMetadataDecision.fallbackOrder);
  assert.equal(contract.authority.threeMandatoryCloudEvidenceLanesAlreadyReviewed, true);
  assert.equal(provenance.allMandatoryLanesReviewed, true);
  assert.equal(provenance.conclusion, "ALL_THREE_MANDATORY_CLOUD_LANES_REVIEWED_CANONICAL_G4A_U04_AUTHORITY_PRESERVED");
});

test("P1-08 authority is unchanged while generic arithmetic remains the selected route", () => {
  const block = getPath1PublicWorksheetBlock("P1-08");
  assert.ok(block);
  assert.equal(block.title, "二位數除數");
  assert.equal(block.generationKind, "CANONICAL_KP");
  assert.equal(block.questionMode, null);
  assert.deepEqual(block.knowledgePointIds, PRIMARY_KPS);
  assert.deepEqual(contract.scope.canonicalKnowledgePointIds, PRIMARY_KPS);
  assert.deepEqual(contract.scope.canonicalPatternSpecIds, PATTERNS);
});

test("count=1 now succeeds deterministically and emits exact top-level KP metadata", () => {
  const first = build(1, "p108-small-a");
  const repeat = build(1, "p108-small-a");
  assert.equal(first.ok, true, JSON.stringify(first.errors ?? []));
  assert.equal(repeat.ok, true, JSON.stringify(repeat.errors ?? []));

  const firstQuestions = generatedQuestions(first);
  const repeatQuestions = generatedQuestions(repeat);
  assert.equal(firstQuestions.length, 1);
  assert.equal(repeatQuestions.length, 1);
  assertQuestionSemantics(firstQuestions[0]);
  assert.deepEqual({
    kp: firstQuestions[0].knowledgePointId,
    pattern: firstQuestions[0].patternSpecId,
    prompt: firstQuestions[0].prompt,
    answer: firstQuestions[0].answerText,
  }, {
    kp: repeatQuestions[0].knowledgePointId,
    pattern: repeatQuestions[0].patternSpecId,
    prompt: repeatQuestions[0].prompt,
    answer: repeatQuestions[0].answerText,
  });
  assert.deepEqual(first.block?.knowledgePointIds, PRIMARY_KPS);
});

test("count=1 seed-derived rotation can reach all three P1-08 KPs instead of permanently selecting the first", () => {
  const seeds = ["p108-small-a", "p108-small-b", "p108-small-c"];
  const selected = seeds.map((seed) => {
    const result = build(1, seed);
    assert.equal(result.ok, true, JSON.stringify(result.errors ?? []));
    const questions = generatedQuestions(result);
    assert.equal(questions.length, 1);
    assertQuestionSemantics(questions[0]);
    return questions[0].knowledgePointId;
  });
  assert.deepEqual(new Set(selected), new Set(PRIMARY_KPS));
});

test("count=2 uses two distinct canonical KPs with one item each", () => {
  const result = build(2, "p108-small-two");
  assert.equal(result.ok, true, JSON.stringify(result.errors ?? []));
  const questions = generatedQuestions(result);
  assert.equal(questions.length, 2);
  assert.equal(new Set(questions.map((question) => question.knowledgePointId)).size, 2);
  for (const question of questions) assertQuestionSemantics(question);
});

test("count=20 preserves 7/7/6 allocation and emits exact KP metadata for every item", () => {
  assertAcceptance(20, [7, 7, 6], "p108-generic-arithmetic-acceptance-20");
});

test("count=120 preserves 40/40/40 allocation and emits exact KP metadata for every item", () => {
  assertAcceptance(120, [40, 40, 40], "p108-generic-arithmetic-acceptance-120");
});

test("implementation stays inside the approved bounded shared-runtime lane", () => {
  assert.equal(impact.policyId, "UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(impact.currentScope, "SHARED_RUNTIME");
  assert.equal(impact.expectedDerivedGate, "SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.changeImpact.sharedExecutableChange, true);
  assert.equal(impact.changeImpact.publicAuthorityCutover, false);
  assert.equal(impact.changeImpact.legalRouteSemanticsChanged, false);
  assert.equal(impact.changeImpact.affectedRoutes, "BOUNDED");
  assert.equal(impact.changeImpact.globalReleaseCheckpoint, false);
  assert.equal(impact.changeImpact.currentAuthorityChanged, false);

  const lane = plan.lanes.SHARED_RUNTIME_BOUNDED;
  assert.deepEqual(lane.map((entry) => entry.gateId), ["GLOBAL_CONTRACTS", "TARGETED_ROUTE_REPLAY"]);
  assert.equal(lane[1].kind, "NODE_RUNNER");
  assert.equal(lane[1].runtime, "PLAYWRIGHT_CHROMIUM");
  assert.equal(lane[1].path, RUNNER_PATH);
  assert.equal(fs.existsSync(RUNNER_PATH), true);
  assert.deepEqual(plan.forbidden, ["FULL_NODE_REGRESSION", "GLOBAL_BROWSER_REPLAY"]);
  assert.equal(contract.validation.fullRepositoryRegressionRequired, false);
  assert.equal(contract.validation.globalBrowserReplayRequired, false);
});

test("forbidden product authorities remain unchanged by contract", () => {
  for (const value of Object.values(contract.antiScopeCreep)) assert.equal(value, false);
});
