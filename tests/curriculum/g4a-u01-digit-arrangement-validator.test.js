import assert from "node:assert/strict";
import test from "node:test";

import { adaptGlobalPublicSourceUnitPlan } from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter.js";
import { G4A_U01_POSTG_TASK_ID } from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter-registry.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { validateBatchABrowserQuestion } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator.js";

const SOURCE_ID = "g4a_u01_4a01";
const PATTERN_SPEC_ID = "ps_g4a_u01_digit_arrangement_max_min";

function generateArrangementQuestions() {
  const adaptation = adaptGlobalPublicSourceUnitPlan({
    sourceId: SOURCE_ID,
    selectionMode: "sourceUnit",
    questionCount: 36,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "postg-a07-digit-arrangement-validator",
    goldenContractId: "G5AU08_GOLDEN_V1",
    goldenContractVersion: "1.0.0",
    goldenRuntimeMode: "shadow",
    postGoldenMigrationTaskId: G4A_U01_POSTG_TASK_ID,
  });
  assert.equal(adaptation.applied, true, JSON.stringify(adaptation.errors));
  assert.equal(adaptation.blocked, false, JSON.stringify(adaptation.errors));
  const generated = generateBatchABrowserQuestions(adaptation.plan);
  assert.equal(generated.ok, true, JSON.stringify(generated.errors));
  return generated.questions.filter((question) => question.patternSpecId === PATTERN_SPEC_ID);
}

function errorCodes(question) {
  return validateBatchABrowserQuestion(question).errors.map((error) => error.code);
}

test("G4A-U01 digit arrangement accepts numeric and word-problem witnesses", () => {
  const questions = generateArrangementQuestions();
  assert.equal(questions.length, 2);
  assert.deepEqual(new Set(questions.map((question) => question.arrangementMode)), new Set(["numeric", "wordProblem"]));
  for (const question of questions) {
    const validation = validateBatchABrowserQuestion(question);
    assert.equal(validation.ok, true, JSON.stringify(validation.errors));
    assert.equal(validation.errors.length, 0);
  }
});

test("G4A-U01 digit arrangement rejects forged max and min witnesses", () => {
  const [question] = generateArrangementQuestions();
  assert.ok(errorCodes({ ...question, maxNumber: question.maxNumber - 1 })
    .includes("batch_a_g4a_u01_arrangement_max_invalid"));
  assert.ok(errorCodes({ ...question, minNumber: question.minNumber + 1 })
    .includes("batch_a_g4a_u01_arrangement_min_invalid"));
});

test("G4A-U01 digit arrangement rejects invalid digit sets", () => {
  const [question] = generateArrangementQuestions();
  const duplicateDigits = [...question.digits];
  duplicateDigits[4] = duplicateDigits[0];
  assert.ok(errorCodes({ ...question, digits: duplicateDigits })
    .includes("batch_a_g4a_u01_arrangement_digits_not_unique"));
  assert.ok(errorCodes({ ...question, digits: [1, 2, 3, 4] })
    .includes("batch_a_g4a_u01_arrangement_digits_invalid"));
});

test("G4A-U01 digit arrangement enforces mode-specific unit contracts", () => {
  const questions = generateArrangementQuestions();
  const numeric = questions.find((question) => question.arrangementMode === "numeric");
  const wordProblem = questions.find((question) => question.arrangementMode === "wordProblem");
  assert.ok(numeric);
  assert.ok(wordProblem);
  assert.ok(errorCodes({ ...numeric, unit: "公分" })
    .includes("batch_a_g4a_u01_arrangement_unit_invalid"));
  assert.ok(errorCodes({ ...wordProblem, unit: "" })
    .includes("batch_a_g4a_u01_arrangement_unit_invalid"));
  assert.ok(errorCodes({ ...numeric, arrangementMode: "unsupported" })
    .includes("batch_a_g4a_u01_arrangement_mode_invalid"));
});

test("G4A-U01 digit arrangement answer text is reconstructed from witnesses", () => {
  const [question] = generateArrangementQuestions();
  assert.ok(errorCodes({ ...question, answerText: "最大：0；最小：0" })
    .includes("batch_a_answer_incorrect"));
  assert.ok(errorCodes({ ...question, finalAnswer: "最大：0；最小：0" })
    .includes("batch_a_answer_incorrect"));
});
