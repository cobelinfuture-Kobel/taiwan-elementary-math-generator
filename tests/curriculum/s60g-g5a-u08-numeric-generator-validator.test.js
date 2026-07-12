import assert from "node:assert/strict";
import test from "node:test";

import {
  G5A_U08_S60G_PATTERN_SPEC_IDS,
  generateG5AU08HiddenBatch,
  generateG5AU08HiddenQuestion,
} from "../../site/modules/curriculum/batch-a/g5a-u08-numeric-generator.js";
import {
  G5A_U08_BLOCKING_CODES,
  G5A_U08_WARNING_CODES,
  validateG5AU08HiddenBatch,
  validateG5AU08HiddenQuestion,
} from "../../site/modules/curriculum/batch-a/g5a-u08-numeric-validator.js";

function clone(value) {
  return structuredClone(value);
}

function hasCode(result, code) {
  return result.errors.some((entry) => entry.code === code);
}

test("S60G scope contains 16 numeric and 3 non-context reasoning PatternSpecs", () => {
  assert.equal(G5A_U08_S60G_PATTERN_SPEC_IDS.length, 19);
  assert.equal(new Set(G5A_U08_S60G_PATTERN_SPEC_IDS).size, 19);
  assert.equal(G5A_U08_S60G_PATTERN_SPEC_IDS.filter((id) => id.includes("average")).length, 0);
  assert.equal(G5A_U08_BLOCKING_CODES.length, 36);
  assert.equal(new Set(G5A_U08_BLOCKING_CODES).size, 36);
  assert.equal(G5A_U08_WARNING_CODES.length, 3);
});

test("S60G generates and validates every approved PatternSpec", () => {
  for (const patternSpecId of G5A_U08_S60G_PATTERN_SPEC_IDS) {
    const question = generateG5AU08HiddenQuestion(patternSpecId, `positive:${patternSpecId}`);
    const result = validateG5AU08HiddenQuestion(question);
    assert.equal(result.valid, true, `${patternSpecId}: ${JSON.stringify(result.errors)}`);
    assert.equal(result.output, question);
    assert.equal(question.applicationText, false);
    assert.equal(question.depth, "N");
    assert.deepEqual(question.semanticDeltaIds, []);
    assert.equal(question.fallbackUsed, false);
  }
});

test("S60G deterministic replay is byte-for-byte stable", () => {
  const first = generateG5AU08HiddenBatch({ questionCount: 133, seed: "deterministic", ordering: "shuffled" });
  const second = generateG5AU08HiddenBatch({ questionCount: 133, seed: "deterministic", ordering: "shuffled" });
  assert.deepEqual(first, second);
  assert.equal(validateG5AU08HiddenBatch(first).valid, true);
});

test("S60G exact-count balanced 1000-question stress passes", () => {
  const batch = generateG5AU08HiddenBatch({ questionCount: 1000, seed: "stress-1000", ordering: "grouped" });
  const counts = Object.values(batch.allocation);
  assert.equal(batch.questions.length, 1000);
  assert.equal(Math.max(...counts) - Math.min(...counts) <= 1, true);
  assert.equal(new Set(batch.questions.map((row) => row.patternSpecId)).size, 19);
  const result = validateG5AU08HiddenBatch(batch);
  assert.equal(result.valid, true, JSON.stringify(result.errors.slice(0, 5)));
  assert.equal(result.acceptedQuestions.length, 1000);
  assert.equal(result.output, batch);
});

test("S60G grouped ordering is contiguous and shuffled ordering preserves allocation", () => {
  const selected = G5A_U08_S60G_PATTERN_SPEC_IDS.slice(0, 5);
  const grouped = generateG5AU08HiddenBatch({
    questionCount: 47,
    seed: "ordering",
    selectedPatternSpecIds: selected,
    ordering: "grouped",
  });
  const shuffled = generateG5AU08HiddenBatch({
    questionCount: 47,
    seed: "ordering",
    selectedPatternSpecIds: selected,
    ordering: "shuffled",
  });
  assert.deepEqual(grouped.allocation, shuffled.allocation);
  assert.notDeepEqual(
    grouped.questions.map((row) => row.patternSpecId),
    shuffled.questions.map((row) => row.patternSpecId),
  );
  const runs = [];
  for (const row of grouped.questions) {
    if (runs.at(-1) !== row.patternSpecId) runs.push(row.patternSpecId);
  }
  assert.deepEqual(runs, selected);
});

test("S60G preserves legal noninteger intermediate regrouping", () => {
  const question = generateG5AU08HiddenQuestion("ps_g5a_u08_mul_div_factor_regroup", "factor-regroup");
  assert.equal(Number.isInteger(question.strategyProof.nonIntegerLeftToRightIntermediate), false);
  assert.equal(question.quantities.multiplier % question.quantities.divisor, 0);
  assert.equal(Number.isInteger(question.finalAnswer), true);
  assert.equal(validateG5AU08HiddenQuestion(question).valid, true);
});

test("S60G continuous division preserves direction and combines divisors", () => {
  const question = generateG5AU08HiddenQuestion("ps_g5a_u08_continuous_division", "continuous-division");
  const [first, second] = question.quantities.divisors;
  assert.equal(question.strategyProof.combinedDivisor, first * second);
  assert.equal(question.quantities.dividend / first / second, question.finalAnswer);
  assert.equal(validateG5AU08HiddenQuestion(question).valid, true);
});

test("S60G missing-operator item has exactly one solution", () => {
  const question = generateG5AU08HiddenQuestion("ps_g5a_u08_missing_operator_sequence", "operator-unique");
  assert.equal(question.strategyProof.solutionCount, 1);
  assert.equal(question.structuredAnswer.operators.length, 2);
  assert.equal(validateG5AU08HiddenQuestion(question).valid, true);
});

test("S60G equality patterns distinguish valid distribution and duplicated factor error", () => {
  const valid = generateG5AU08HiddenQuestion("ps_g5a_u08_equivalence_valid", "eq-valid");
  const invalid = generateG5AU08HiddenQuestion("ps_g5a_u08_equivalence_invalid_duplicate_factor", "eq-invalid");
  assert.equal(valid.structuredAnswer.isEqual, true);
  assert.equal(valid.structuredAnswer.errorType, null);
  assert.equal(invalid.structuredAnswer.isEqual, false);
  assert.equal(invalid.structuredAnswer.errorType, "duplicated_common_factor");
  assert.equal(validateG5AU08HiddenQuestion(valid).valid, true);
  assert.equal(validateG5AU08HiddenQuestion(invalid).valid, true);
});

test("S60G identity, scope, mode and fallback mutations are blocking", () => {
  const base = generateG5AU08HiddenQuestion("ps_g5a_u08_mixed_precedence_3op", "identity-mutations");

  const wrongSource = clone(base);
  wrongSource.sourceId = "g4b_u01_4b01";
  assert.equal(hasCode(validateG5AU08HiddenQuestion(wrongSource), "G5A_U08_SOURCE_ID_MISMATCH"), true);

  const wrongGroup = clone(base);
  wrongGroup.patternGroupId = "pg_other";
  assert.equal(hasCode(validateG5AU08HiddenQuestion(wrongGroup), "G5A_U08_PATTERN_GROUP_MISMATCH"), true);

  const wrongKp = clone(base);
  wrongKp.knowledgePointId = "kp_other";
  assert.equal(hasCode(validateG5AU08HiddenQuestion(wrongKp), "G5A_U08_KNOWLEDGE_POINT_MISMATCH"), true);

  const wrongMode = clone(base);
  wrongMode.mode = "application";
  assert.equal(hasCode(validateG5AU08HiddenQuestion(wrongMode), "G5A_U08_MODE_MISMATCH"), true);

  const fallback = clone(base);
  fallback.fallbackUsed = true;
  assert.equal(hasCode(validateG5AU08HiddenQuestion(fallback), "G5A_U08_GENERIC_FALLBACK_FORBIDDEN"), true);
});

test("S60G depth, semantic delta and numeric-answer mutations are blocking", () => {
  const base = generateG5AU08HiddenQuestion("ps_g5a_u08_mixed_precedence_4op", "depth-mutations");

  const nPlusOne = clone(base);
  nPlusOne.depth = "N_PLUS_1";
  nPlusOne.semanticDeltaIds = ["combine_groups"];
  const nPlusOneResult = validateG5AU08HiddenQuestion(nPlusOne);
  assert.equal(hasCode(nPlusOneResult, "G5A_U08_DEPTH_NOT_ALLOWED"), true);
  assert.equal(hasCode(nPlusOneResult, "G5A_U08_SEMANTIC_DELTA_COUNT_INVALID"), true);

  const wrongAnswer = clone(base);
  wrongAnswer.finalAnswer += 1;
  wrongAnswer.answerText = String(wrongAnswer.finalAnswer);
  assert.equal(hasCode(validateG5AU08HiddenQuestion(wrongAnswer), "G5A_U08_NUMERIC_ANSWER_INCORRECT"), true);
});

test("S60G rejects illegal subtraction and division transformation proofs", () => {
  const subtraction = clone(generateG5AU08HiddenQuestion("ps_g5a_u08_consecutive_subtraction", "sub-proof"));
  subtraction.strategyProof.combinedSubtrahend += 1;
  assert.equal(hasCode(validateG5AU08HiddenQuestion(subtraction), "G5A_U08_ILLEGAL_SUBTRACTION_REGROUP"), true);

  const division = clone(generateG5AU08HiddenQuestion("ps_g5a_u08_continuous_division", "div-proof"));
  division.strategyProof.combinedDivisor += 1;
  assert.equal(hasCode(validateG5AU08HiddenQuestion(division), "G5A_U08_ILLEGAL_DIVISION_REGROUP"), true);
});

test("S60G rejects operator and equality structured-answer mutations", () => {
  const operator = clone(generateG5AU08HiddenQuestion("ps_g5a_u08_missing_operator_sequence", "operator-mutation"));
  operator.structuredAnswer.operators = ["+", "+"];
  operator.answerText = "+、+";
  assert.equal(hasCode(validateG5AU08HiddenQuestion(operator), "G5A_U08_OPERATOR_SEQUENCE_INCORRECT"), true);

  const equality = clone(generateG5AU08HiddenQuestion("ps_g5a_u08_equivalence_invalid_duplicate_factor", "equality-mutation"));
  equality.structuredAnswer.errorType = "wrong_type";
  assert.equal(hasCode(validateG5AU08HiddenQuestion(equality), "G5A_U08_ERROR_TYPE_INCORRECT"), true);
});

test("S60G batch validator returns zero output when one item is blocking-invalid", () => {
  const batch = clone(generateG5AU08HiddenBatch({ questionCount: 57, seed: "zero-output", ordering: "shuffled" }));
  batch.questions[13].finalAnswer += 1;
  const result = validateG5AU08HiddenBatch(batch);
  assert.equal(result.valid, false);
  assert.equal(result.output, null);
  assert.deepEqual(result.acceptedQuestions, []);
  assert.equal(result.errors.length > 0, true);
});

test("S60G rejects empty, unknown, application and contextual-reasoning selections", () => {
  assert.throws(
    () => generateG5AU08HiddenBatch({ questionCount: 10, selectedPatternSpecIds: [] }),
    /G5A_U08_GEN_EMPTY_PATTERN_SELECTION/,
  );
  assert.throws(
    () => generateG5AU08HiddenQuestion("ps_unknown", "unknown"),
    /G5A_U08_GEN_PATTERN_SPEC_UNSUPPORTED/,
  );
  assert.throws(
    () => generateG5AU08HiddenQuestion("ps_g5a_u08_app_discount_change", "application"),
    /G5A_U08_GEN_PATTERN_SPEC_UNSUPPORTED/,
  );
  assert.throws(
    () => generateG5AU08HiddenQuestion("ps_g5a_u08_app_average_inverse", "contextual-reasoning"),
    /G5A_U08_GEN_PATTERN_SPEC_UNSUPPORTED/,
  );
});

test("S60G enforces hidden batch bounds and ordering contract", () => {
  assert.throws(() => generateG5AU08HiddenBatch({ questionCount: 0 }), /QUESTION_COUNT_INVALID/);
  assert.throws(() => generateG5AU08HiddenBatch({ questionCount: 1001 }), /QUESTION_COUNT_INVALID/);
  assert.throws(() => generateG5AU08HiddenBatch({ questionCount: 10, ordering: "random" }), /ORDERING_INVALID/);
});
