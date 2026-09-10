import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import { buildPath1ManualWorksheet } from "../../site/assets/browser/pipeline/build-path1-manual-worksheet.js";
import { getPath1PublicWorksheetBlock } from "../../site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";

const CONTRACT_PATH = "data/curriculum/application/contracts/PATH1_P1_09_LARGER_DIVIDEND_TWO_DIGIT_DIVISOR_EXISTING_ROUTE_ACCEPTANCE_V1.json";
const PREFLIGHT_PATH = "data/curriculum/application/contracts/PATH1_P1_09_LARGER_DIVIDEND_TWO_DIGIT_DIVISOR_SOURCE_AUTHORITY_PREFLIGHT_V1.json";
const IMPACT_PATH = "data/project/change-impact/PATH1_P1_09_LARGER_DIVIDEND_TWO_DIGIT_DIVISOR_EXISTING_ROUTE_ACCEPTANCE_V1.impact.json";
const PLAN_PATH = "data/project/validation-plans/PATH1_P1_09_LARGER_DIVIDEND_TWO_DIGIT_DIVISOR_EXISTING_ROUTE_ACCEPTANCE_V1.validation.json";
const MATRIX_PATH = "data/curriculum/learning-paths/path1-integer-foundations.curriculum-matrix.json";
const BUILDER_PATH = "site/assets/browser/pipeline/build-path1-manual-worksheet.js";
const RUNNER_PATH = "tools/curriculum/run-path1-p1-09-larger-dividend-two-digit-divisor-existing-route-acceptance-v1.mjs";

const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));
const preflight = JSON.parse(fs.readFileSync(PREFLIGHT_PATH, "utf8"));
const impact = JSON.parse(fs.readFileSync(IMPACT_PATH, "utf8"));
const plan = JSON.parse(fs.readFileSync(PLAN_PATH, "utf8"));
const matrix = JSON.parse(fs.readFileSync(MATRIX_PATH, "utf8"));
const builderSource = fs.readFileSync(BUILDER_PATH, "utf8");

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

function firstTwoDividendDigits(dividend) {
  return Math.floor(dividend / 100);
}

function buildAndAssertCurrentRoute(questionCount, generationSeed) {
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
    assert.ok(divisor >= 21 && divisor <= 89);
    assert.ok(quotient >= 20 && quotient <= 99);
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

test("P1-09 acceptance is diagnostic-only and preserves the source-authority preflight boundary", () => {
  assert.equal(contract.taskId, "PATH1_P1_09_LARGER_DIVIDEND_TWO_DIGIT_DIVISOR_EXISTING_ROUTE_ACCEPTANCE_V1");
  assert.equal(contract.status, "P1_09_EXISTING_ROUTE_ACCEPTANCE_GAPS_ISOLATED");
  assert.equal(contract.operatorScope, "APPROVED_DIAGNOSTIC_ACCEPTANCE_ONLY");
  assert.deepEqual(contract.acceptanceScope.requiredQuestionCounts, [1, 20, 120]);
  assert.equal(contract.acceptanceScope.implementationAllowed, false);
  assert.equal(contract.acceptanceScope.runtimeChanged, false);
  assert.equal(preflight.status, "P1_09_SOURCE_AUTHORITY_PREFLIGHT_LOCKED_EXISTING_ROUTE_ACCEPTANCE_PENDING");
  assert.equal(preflight.futureAcceptanceContract.taskId, contract.taskId);
});

test("P1-09 public binding remains a no-KP difficulty expansion on the existing runtime id", () => {
  const block = getPath1PublicWorksheetBlock("P1-09");
  assert.ok(block);
  assert.equal(block.title, "多位數÷二位數");
  assert.equal(block.generationKind, "DIFFICULTY_EXPANSION");
  assert.equal(block.difficultyExpansionId, "path1_four_digit_by_two_digit_division");
  assert.deepEqual(block.knowledgePointIds, []);
});

test("P1-09 existing route materializes one printable quotient-remainder item deterministically", () => {
  const first = buildAndAssertCurrentRoute(1, "p109-existing-route-acceptance-1");
  const repeat = buildAndAssertCurrentRoute(1, "p109-existing-route-acceptance-1");
  assert.deepEqual(
    first.questions.map((question) => ({ prompt: question.prompt, answerText: question.answerText, metadata: question.metadata })),
    repeat.questions.map((question) => ({ prompt: question.prompt, answerText: question.answerText, metadata: question.metadata })),
  );
});

test("P1-09 existing route materializes 20 printable valid items", () => {
  buildAndAssertCurrentRoute(20, "p109-existing-route-acceptance-20");
});

test("P1-09 existing route materializes 120 distinct printable valid items", () => {
  const { questions } = buildAndAssertCurrentRoute(120, "p109-existing-route-acceptance-120");
  assert.equal(new Set(questions.map((question) => question.prompt)).size, 120);
  assert.equal(new Set(questions.map((question) => `${question.metadata.dividend}/${question.metadata.divisor}`)).size, 120);
});

test("P1-09 dynamic acceptance isolates the divisor-envelope gap and three-digit-quotient gap", () => {
  assert.match(builderSource, /const divisor = 21 \+ \(cursor % 69\)/);
  assert.match(builderSource, /const quotient = 20 \+ \(cursor % 80\)/);

  const { questions } = buildAndAssertCurrentRoute(120, "p109-source-parity-diagnostic-120");
  assert.equal(questions.every((question) => question.metadata.divisor >= 21 && question.metadata.divisor <= 89), true);
  assert.equal(questions.some((question) => question.metadata.divisor <= 20 || question.metadata.divisor >= 90), false);
  assert.equal(questions.every((question) => question.metadata.quotient >= 20 && question.metadata.quotient <= 99), true);
  assert.equal(questions.some((question) => question.metadata.quotient >= 100), false);
  assert.equal(
    questions.some((question) => firstTwoDividendDigits(question.metadata.dividend) >= question.metadata.divisor),
    false,
  );

  assert.equal(contract.sourceParityDiagnosis.runtimeDivisorEnvelope, "21..89");
  assert.equal(contract.sourceParityDiagnosis.sourceBackedDivisorEnvelope, "10..99");
  assert.equal(contract.sourceParityDiagnosis.divisorEnvelopeClassification, "P109_DIVISOR_ENVELOPE_NARROWER_THAN_SOURCE");
  assert.equal(contract.sourceParityDiagnosis.runtimeQuotientEnvelope, "20..99");
  assert.equal(contract.sourceParityDiagnosis.threeDigitQuotientClassification, "P109_THREE_DIGIT_QUOTIENT_CASE_UNREACHABLE");
  assert.equal(contract.sourceParityDiagnosis.directSourceWitness.expression, "4024÷23");
  assert.equal(contract.sourceParityDiagnosis.directSourceWitness.quotient, 174);
  assert.equal(contract.sourceParityDiagnosis.directSourceWitness.runtimeEquivalentCapabilityReachable, false);
  assert.equal(contract.sourceParityDiagnosis.formalCaseCoverage.P109_4DIGIT_HUNDREDS_SUFFICIENT, "MISSING_IN_CURRENT_ROUTE");
  assert.equal(contract.sourceParityDiagnosis.formalCaseCoverage.P109_4DIGIT_HUNDREDS_INSUFFICIENT, "PRESENT_IN_CURRENT_ROUTE");
});

test("P1-09 acceptance binds the matrix/runtime expansion ids as one bounded alias without matrix mutation", () => {
  const p109 = matrix.blocks.find((entry) => entry.blockId === "P1-09");
  assert.ok(p109);
  assert.equal(p109.patternExpansion[0].id, "larger_dividend_two_digit_divisor");
  assert.equal(contract.difficultyExpansionIdentity.matrixDifficultyExpansionId, p109.patternExpansion[0].id);
  assert.equal(contract.difficultyExpansionIdentity.runtimeDifficultyExpansionId, "path1_four_digit_by_two_digit_division");
  assert.equal(contract.difficultyExpansionIdentity.equivalenceStatus, "ACCEPTED_P109_BOUNDED_ALIAS");
  assert.equal(contract.difficultyExpansionIdentity.matrixMutationRequiredForAlias, false);
});

test("P1-09 acceptance keeps P1-10 and P1-11 boundaries closed and routes only to remediation preflight", () => {
  const { questions } = buildAndAssertCurrentRoute(20, "p109-boundary-acceptance-20");
  assert.equal(questions.every((question) => question.metadata.divisor <= 99), true);
  assert.equal(questions.every((question) => !String(question.prompt).includes("驗算")), true);
  assert.equal(contract.runtimeRemediation.authorizedByThisAcceptance, false);
  assert.equal(contract.runtimeRemediation.requiredBecauseSourceParityIsIncomplete, true);
  assert.equal(
    contract.runtimeRemediation.nextTask,
    "PATH1_P1_09_LARGER_DIVIDEND_TWO_DIGIT_DIVISOR_SOURCE_PARITY_REMEDIATION_PREFLIGHT_V1",
  );
});

test("UNIT_INCREMENTAL_VALIDATION_V1 keeps P1-09 existing-route acceptance KP-focused", () => {
  assert.equal(impact.policyId, "UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(impact.currentScope, "KP_LEAF");
  assert.equal(impact.expectedDerivedGate, "KP_FOCUSED");
  assert.deepEqual(impact.unitKnowledgePointGateStatus, {
    kp_g4a_u04_3digit_by_2digit_tens_sufficient: "PENDING",
    kp_g4a_u04_3digit_by_2digit_tens_insufficient: "PENDING",
  });
  assert.deepEqual(
    plan.lanes.KP_FOCUSED.map((entry) => entry.gateId),
    ["FOCUSED_TEST", "TARGETED_BROWSER_E2E", "DIRECT_DEPENDENCY_CONTRACTS"],
  );
  assert.equal(plan.lanes.KP_FOCUSED[1].path, RUNNER_PATH);
  assert.equal(fs.existsSync(RUNNER_PATH), true);
  assert.equal(contract.validation.fullRepositoryRegressionRequired, false);
  assert.equal(contract.validation.globalBrowserReplayRequired, false);
  assert.equal(
    contract.distance.nextShortestStep,
    "PATH1_P1_09_LARGER_DIVIDEND_TWO_DIGIT_DIVISOR_SOURCE_PARITY_REMEDIATION_PREFLIGHT_V1",
  );
});
