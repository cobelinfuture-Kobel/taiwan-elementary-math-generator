import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import { buildPath1ManualWorksheet } from "../../site/assets/browser/pipeline/build-path1-manual-worksheet.js";
import { getPath1PublicWorksheetBlock } from "../../site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";

const CONTRACT_PATH = "data/curriculum/application/contracts/PATH1_P1_09_LARGER_DIVIDEND_TWO_DIGIT_DIVISOR_SOURCE_PARITY_REMEDIATION_IMPLEMENTATION_V1.json";
const PREFLIGHT_PATH = "data/curriculum/application/contracts/PATH1_P1_09_LARGER_DIVIDEND_TWO_DIGIT_DIVISOR_SOURCE_PARITY_REMEDIATION_PREFLIGHT_V1.json";
const IMPACT_PATH = "data/project/change-impact/PATH1_P1_09_LARGER_DIVIDEND_TWO_DIGIT_DIVISOR_SOURCE_PARITY_REMEDIATION_IMPLEMENTATION_V1.impact.json";
const PLAN_PATH = "data/project/validation-plans/PATH1_P1_09_LARGER_DIVIDEND_TWO_DIGIT_DIVISOR_SOURCE_PARITY_REMEDIATION_IMPLEMENTATION_V1.validation.json";
const BUILDER_PATH = "site/assets/browser/pipeline/build-path1-manual-worksheet.js";
const RUNNER_PATH = "tools/curriculum/run-path1-p1-09-larger-dividend-two-digit-divisor-source-parity-remediation-implementation-v1.mjs";

const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));
const preflight = JSON.parse(fs.readFileSync(PREFLIGHT_PATH, "utf8"));
const impact = JSON.parse(fs.readFileSync(IMPACT_PATH, "utf8"));
const plan = JSON.parse(fs.readFileSync(PLAN_PATH, "utf8"));

function generatedQuestions(result) {
  return result?.worksheetDocument?.generatedQuestions
    ?? result?.worksheetDocument?.questions
    ?? result?.worksheetDocument?.questionItems
    ?? [];
}

function renderedQuestionCount(worksheetDocument) {
  return (worksheetDocument?.questionPages ?? [])
    .flatMap((page) => page.cells ?? [])
    .filter((cell) => cell.cellType === "question").length;
}

function renderedAnswerCount(worksheetDocument) {
  return (worksheetDocument?.answerKeyPages ?? [])
    .flatMap((page) => page.cells ?? [])
    .filter((cell) => cell.cellType === "answerKey").length;
}

function quotientStartPlace(question) {
  return Math.floor(question.metadata.dividend / 100) >= question.metadata.divisor
    ? "HUNDREDS"
    : "TENS";
}

function buildAndAssert(questionCount, generationSeed) {
  const result = buildPath1ManualWorksheet({
    blockId: "P1-09",
    practiceMode: "arithmetic",
    questionCount,
    generationSeed,
    includeAnswerKey: true,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors ?? []));
  assert.equal(result.block?.blockId, "P1-09");
  assert.equal(result.block?.generationKind, "DIFFICULTY_EXPANSION");
  assert.deepEqual(result.block?.knowledgePointIds, []);

  const questions = generatedQuestions(result);
  assert.equal(questions.length, questionCount);
  assert.equal(renderedQuestionCount(result.worksheetDocument), questionCount);
  assert.equal(renderedAnswerCount(result.worksheetDocument), questionCount);

  for (const question of questions) {
    const metadata = question.metadata ?? {};
    const { dividend, divisor, quotient, remainder } = metadata;
    assert.ok(Number.isInteger(dividend));
    assert.ok(Number.isInteger(divisor));
    assert.ok(Number.isInteger(quotient));
    assert.ok(Number.isInteger(remainder));
    assert.ok(dividend >= 1000 && dividend <= 9999);
    assert.ok(divisor >= 10 && divisor <= 99);
    assert.ok(quotient >= 10 && quotient <= 999);
    assert.ok(remainder >= 0 && remainder < divisor);
    assert.equal(dividend, divisor * quotient + remainder);
    assert.equal(metadata.invariantPassed, true);
    assert.equal(metadata.pathDifficultyExpansionId, "path1_four_digit_by_two_digit_division");
    assert.equal(metadata.canonicalKnowledgePointMinted, false);
    assert.equal(question.knowledgePointId, null);
    assert.equal(question.operationFamilyId, "INTEGER_LONG_DIVISION_DIFFICULTY_EXPANSION");
    assert.equal(question.sourceNodeId, "path1_four_digit_by_two_digit_division");
    assert.ok(String(question.prompt ?? "").trim().length > 0);
    assert.ok(String(question.answerText ?? "").trim().length > 0);
    assert.equal(String(question.prompt).includes("驗算"), false);
  }

  return { result, questions };
}

test("P1-09 implementation consumes the approved preflight and mutates only the bounded dedicated generator", () => {
  assert.equal(contract.taskId, "PATH1_P1_09_LARGER_DIVIDEND_TWO_DIGIT_DIVISOR_SOURCE_PARITY_REMEDIATION_IMPLEMENTATION_V1");
  assert.equal(contract.operatorScope, "APPROVED_IMPLEMENTATION");
  assert.equal(contract.authority.runtimeFile, BUILDER_PATH);
  assert.equal(contract.authority.runtimeFunction, "buildFourDigitByTwoDigitItems");
  assert.equal(preflight.plannedImplementationBoundary.allowedProductFiles.length, 1);
  assert.equal(preflight.plannedImplementationBoundary.allowedProductFiles[0], BUILDER_PATH);
  assert.equal(preflight.plannedImplementationBoundary.allowedProductFunction, "buildFourDigitByTwoDigitItems");
  assert.equal(contract.scope.publicBindingChanged, false);
  assert.equal(contract.scope.path1MatrixChanged, false);
  assert.equal(contract.scope.canonicalKnowledgePointMinted, false);
  assert.equal(contract.scope.canonicalPatternSpecMinted, false);
});

test("P1-09 public authority identity remains the existing no-KP difficulty expansion", () => {
  const block = getPath1PublicWorksheetBlock("P1-09");
  assert.ok(block);
  assert.equal(block.title, "多位數÷二位數");
  assert.equal(block.generationKind, "DIFFICULTY_EXPANSION");
  assert.equal(block.difficultyExpansionId, "path1_four_digit_by_two_digit_division");
  assert.deepEqual(block.knowledgePointIds, []);
});

test("P1-09 count=1 remains printable and same-seed deterministic", () => {
  const first = buildAndAssert(1, "p109-source-parity-implementation-1");
  const repeat = buildAndAssert(1, "p109-source-parity-implementation-1");
  assert.deepEqual(
    first.questions.map((question) => ({ prompt: question.prompt, answerText: question.answerText, metadata: question.metadata })),
    repeat.questions.map((question) => ({ prompt: question.prompt, answerText: question.answerText, metadata: question.metadata })),
  );
});

test("P1-09 count=2 guarantees both formal quotient-start cases and both divisor boundaries", () => {
  const { questions } = buildAndAssert(2, "p109-source-parity-implementation-2");
  assert.deepEqual(new Set(questions.map((question) => quotientStartPlace(question))), new Set(["HUNDREDS", "TENS"]));
  assert.ok(questions.some((question) => question.metadata.quotient >= 100));
  assert.ok(questions.some((question) => question.metadata.quotient >= 10 && question.metadata.quotient <= 99));
  assert.ok(questions.some((question) => question.metadata.divisor === 10));
  assert.ok(questions.some((question) => question.metadata.divisor === 99));
});

test("P1-09 count=20 closes the divisor-envelope and three-digit-quotient source-parity gaps", () => {
  const { questions } = buildAndAssert(20, "p109-source-parity-implementation-20");
  const divisors = questions.map((question) => question.metadata.divisor);
  const startPlaces = new Set(questions.map(quotientStartPlace));
  assert.equal(Math.min(...divisors), 10);
  assert.equal(Math.max(...divisors), 99);
  assert.deepEqual(startPlaces, new Set(["HUNDREDS", "TENS"]));
  assert.ok(questions.some((question) => question.metadata.quotient >= 100));
  assert.ok(questions.some((question) => question.metadata.quotient <= 99));
});

test("P1-09 count=120 preserves 120 distinct printable prompts across both formal cases", () => {
  const { questions } = buildAndAssert(120, "p109-source-parity-implementation-120");
  assert.equal(new Set(questions.map((question) => question.prompt)).size, 120);
  assert.equal(new Set(questions.map((question) => `${question.metadata.dividend}/${question.metadata.divisor}`)).size, 120);
  assert.equal(Math.min(...questions.map((question) => question.metadata.divisor)), 10);
  assert.equal(Math.max(...questions.map((question) => question.metadata.divisor)), 99);
  assert.ok(questions.some((question) => question.metadata.quotient >= 100));
  assert.ok(questions.some((question) => question.metadata.quotient <= 99));
  assert.ok(questions.some((question) => quotientStartPlace(question) === "HUNDREDS"));
  assert.ok(questions.some((question) => quotientStartPlace(question) === "TENS"));
});

test("P1-09 source-equivalent three-digit-quotient capability is reachable without reproducing the exact exam item", () => {
  const { questions } = buildAndAssert(20, "p109-source-equivalent-capability");
  const witness = questions.find((question) => question.metadata.quotient >= 100);
  assert.ok(witness);
  assert.equal(quotientStartPlace(witness), "HUNDREDS");
  assert.ok(witness.metadata.divisor >= 10 && witness.metadata.divisor <= 99);
  assert.equal(witness.metadata.dividend, witness.metadata.divisor * witness.metadata.quotient + witness.metadata.remainder);
});

test("P1-09 remediation does not leak P1-10 three-digit divisors or P1-11 checking semantics", () => {
  const { questions } = buildAndAssert(120, "p109-adjacent-boundary-implementation-120");
  assert.equal(questions.every((question) => question.metadata.divisor <= 99), true);
  assert.equal(questions.every((question) => !String(question.prompt).includes("驗算")), true);
});

test("UNIT_INCREMENTAL_VALIDATION_V1 classifies implementation as SHARED_RUNTIME_BOUNDED", () => {
  assert.equal(impact.policyId, "UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(impact.currentScope, "SHARED_RUNTIME");
  assert.equal(impact.expectedDerivedGate, "SHARED_RUNTIME_BOUNDED");
  assert.deepEqual(impact.changeImpact, {
    sharedExecutableChange: true,
    publicAuthorityCutover: false,
    legalRouteSemanticsChanged: false,
    affectedRoutes: "BOUNDED",
    globalReleaseCheckpoint: false,
    currentAuthorityChanged: false,
  });
  assert.deepEqual(
    plan.lanes.SHARED_RUNTIME_BOUNDED.map((entry) => entry.gateId),
    ["GLOBAL_CONTRACTS", "TARGETED_ROUTE_REPLAY"],
  );
  assert.equal(plan.lanes.SHARED_RUNTIME_BOUNDED[1].path, RUNNER_PATH);
  assert.equal(fs.existsSync(RUNNER_PATH), true);
  assert.deepEqual(plan.forbidden, ["FULL_NODE_REGRESSION", "GLOBAL_BROWSER_REPLAY"]);
  assert.equal(contract.validation.fullRepositoryRegressionRequired, false);
  assert.equal(contract.validation.globalBrowserReplayRequired, false);
  assert.equal(contract.distance.targetGoalDistanceAfter, "D1_P109_SOURCE_PARITY_GENERATOR_VALIDATOR_WORKSHEET_USABLE_NON_FINAL");
});
