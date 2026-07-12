import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  G4B_U04_S69_CLASS_C_PATTERN_SPEC_IDS,
  generateG4BU04ClassCBatch,
  generateG4BU04ClassCQuestion,
  g4bU04RoundDown,
  g4bU04RoundHalfUp,
  g4bU04RoundUp,
} from "../../site/modules/curriculum/batch-b/g4b-u04-class-c-generator.js";
import {
  G4B_U04_BLOCKING_CODES,
  G4B_U04_VALIDATOR_STAGES,
  validateG4BU04ClassCBatch,
  validateG4BU04ClassCQuestion,
} from "../../site/modules/curriculum/batch-b/g4b-u04-class-c-validator.js";
import {
  getG4BU04HiddenPatternSpecById,
} from "../../site/modules/curriculum/batch-b/source-pattern-g4b-u04-extension.js";

const CONTRACT_PATH = new URL(
  "../../data/curriculum/runtime/S69_G4B_U04_ClassCRuntimeContract.json",
  import.meta.url,
);

function clone(value) {
  return structuredClone(value);
}

function codes(result) {
  return new Set(result.errors.map((row) => row.code));
}

function generate(id, sequence = 0) {
  return generateG4BU04ClassCQuestion({ patternSpecId: id, seed: "s69-test", sequence });
}

test("S69 freezes exactly the nine S68 Class C PatternSpecs", () => {
  const contract = JSON.parse(readFileSync(CONTRACT_PATH, "utf8"));
  assert.equal(contract.status, "implemented_pending_ci");
  assert.equal(G4B_U04_S69_CLASS_C_PATTERN_SPEC_IDS.length, 9);
  assert.deepEqual(contract.patternSpecIds, [...G4B_U04_S69_CLASS_C_PATTERN_SPEC_IDS]);
  for (const id of G4B_U04_S69_CLASS_C_PATTERN_SPEC_IDS) {
    const spec = getG4BU04HiddenPatternSpecById(id);
    assert.ok(spec, `${id} must exist in S68 authority`);
    assert.equal(spec.implementationClass, "C");
    assert.equal(spec.selectorStatus, "hidden");
    assert.equal(spec.canonicalRouting, "disabled");
    assert.equal(spec.productionUse, "forbidden");
  }
});

test("S69 generates and validates every Class C PatternSpec", () => {
  const answerShapes = new Set();
  const modes = new Set();
  for (const [index, id] of G4B_U04_S69_CLASS_C_PATTERN_SPEC_IDS.entries()) {
    const question = generate(id, index);
    const result = validateG4BU04ClassCQuestion(question);
    assert.equal(result.ok, true, `${id}: ${JSON.stringify(result.errors)}`);
    assert.equal(Object.isFrozen(question), true);
    assert.equal(Object.isFrozen(question.structuredAnswer), true);
    assert.equal(question.fallbackUsed, false);
    answerShapes.add(question.answerModelShape);
    modes.add(question.mode);
  }
  assert.deepEqual([...modes].sort(), ["concept", "numeric", "reasoning"]);
  assert.deepEqual([...answerShapes].sort(), [
    "classificationAnswer",
    "digitSetAnswer",
    "methodChoiceAnswer",
    "methodComparisonAnswer",
    "numericAnswer",
    "possibleValuesAnswer",
    "symbolReadingAnswer",
  ]);
});

test("S69 direct rounding formulas preserve source examples and threshold behavior", () => {
  assert.equal(g4bU04RoundDown(753, 100), 700);
  assert.equal(g4bU04RoundUp(753, 100), 800);
  assert.equal(g4bU04RoundHalfUp(753, 100), 800);
  assert.equal(g4bU04RoundHalfUp(647, 10), 650);
  assert.equal(g4bU04RoundHalfUp(647, 100), 600);
  assert.equal(g4bU04RoundHalfUp(649, 100), 600);
  assert.equal(g4bU04RoundHalfUp(650, 100), 700);
  assert.equal(g4bU04RoundHalfUp(2768, 100), 2800);
  assert.equal(g4bU04RoundHalfUp(2768, 1000), 3000);
});

test("S69 method-choice generation always has one answer not shared with half-up", () => {
  for (let index = 0; index < 200; index += 1) {
    const question = generate("ps_g4b_u04_method_identify_from_result", index);
    const { value, targetUnit, shownResult } = question.input;
    const outputs = [
      ["unconditional_down", g4bU04RoundDown(value, targetUnit)],
      ["unconditional_up", g4bU04RoundUp(value, targetUnit)],
      ["round_half_up", g4bU04RoundHalfUp(value, targetUnit)],
    ];
    const matches = outputs.filter(([, result]) => result === shownResult);
    assert.equal(value % targetUnit === 0, false);
    assert.equal(matches.length, 1);
    assert.equal(shownResult === g4bU04RoundHalfUp(value, targetUnit), false);
    assert.equal(question.structuredAnswer.method, matches[0][0]);
    assert.equal(validateG4BU04ClassCQuestion(question).ok, true);
  }
});

test("S69 inverse generators return complete sorted source-grammar solution sets", () => {
  for (let index = 0; index < 40; index += 1) {
    const digitQuestion = generate("ps_g4b_u04_inverse_digit_set", index);
    const valueQuestion = generate("ps_g4b_u04_inverse_original_values", index);
    assert.match(digitQuestion.input.mask, /^[1-9][0-9]*□[0-9]+$/);
    assert.match(valueQuestion.input.mask, /^[1-9][0-9]*□□[0-9]+$/);
    assert.ok(digitQuestion.structuredAnswer.digits.length > 0);
    assert.ok(valueQuestion.structuredAnswer.values.length > 0);
    assert.equal(new Set(digitQuestion.structuredAnswer.digits).size, digitQuestion.structuredAnswer.digits.length);
    assert.equal(new Set(valueQuestion.structuredAnswer.values).size, valueQuestion.structuredAnswer.values.length);
    assert.equal(validateG4BU04ClassCQuestion(digitQuestion).ok, true);
    assert.equal(validateG4BU04ClassCQuestion(valueQuestion).ok, true);
  }
});

test("S69 batch generation is exact, balanced and deterministic through 1000 questions", () => {
  const first = generateG4BU04ClassCBatch({ questionCount: 1000, seed: "s69-stress", ordering: "groupedByPattern" });
  const second = generateG4BU04ClassCBatch({ questionCount: 1000, seed: "s69-stress", ordering: "groupedByPattern" });
  assert.deepEqual(first, second);
  assert.equal(first.questions.length, 1000);
  assert.equal(validateG4BU04ClassCBatch(first).ok, true);
  const counts = Object.values(first.allocation);
  assert.equal(Math.max(...counts) - Math.min(...counts) <= 1, true);
  assert.equal(Object.keys(first.allocation).length, 9);

  const shuffledA = generateG4BU04ClassCBatch({ questionCount: 1000, seed: "s69-stress", ordering: "shuffleAcrossPatterns" });
  const shuffledB = generateG4BU04ClassCBatch({ questionCount: 1000, seed: "s69-stress", ordering: "shuffleAcrossPatterns" });
  assert.deepEqual(shuffledA, shuffledB);
  assert.notDeepEqual(
    shuffledA.questions.map((row) => row.patternSpecId),
    first.questions.map((row) => row.patternSpecId),
  );
  assert.equal(validateG4BU04ClassCBatch(shuffledA).ok, true);
});

test("S69 exposes the exact 44-code, eight-stage blocking contract", () => {
  assert.equal(G4B_U04_BLOCKING_CODES.length, 44);
  assert.equal(new Set(G4B_U04_BLOCKING_CODES).size, 44);
  assert.equal(G4B_U04_VALIDATOR_STAGES.length, 8);
  assert.equal(G4B_U04_VALIDATOR_STAGES.reduce((sum, row) => sum + row.codeCount, 0), 44);
  assert.deepEqual(G4B_U04_VALIDATOR_STAGES.map((row) => row.codeCount), [8, 3, 7, 14, 2, 3, 5, 2]);
});

test("S69 rejects identity, boundary, formula, ambiguity, inverse and surface mutations", () => {
  const mutations = [];

  const source = clone(generate("ps_g4b_u04_round_half_up"));
  source.sourceId = "g4b_u04_wrong";
  mutations.push([source, "G4BU04_SOURCE_ID_MISMATCH"]);

  const classD = clone(generate("ps_g4b_u04_round_half_up"));
  classD.patternSpecId = "ps_g4b_u04_floor_complete_groups";
  mutations.push([classD, "G4BU04_PATTERN_SPEC_NOT_LOCKED"]);

  const unit = clone(generate("ps_g4b_u04_round_half_up"));
  unit.input.targetUnit = 1;
  mutations.push([unit, "G4BU04_TARGET_UNIT_NOT_ALLOWED"]);

  const formula = clone(generate("ps_g4b_u04_unconditional_round_down"));
  formula.finalAnswer += formula.input.targetUnit;
  formula.structuredAnswer.value = formula.finalAnswer;
  mutations.push([formula, "G4BU04_FORMULA_MISMATCH"]);

  const answerExtra = clone(generate("ps_g4b_u04_approx_symbol_reading"));
  answerExtra.structuredAnswer.extra = true;
  mutations.push([answerExtra, "G4BU04_ANSWER_MODEL_MISMATCH"]);

  const ambiguous = clone(generate("ps_g4b_u04_method_identify_from_result"));
  ambiguous.input.shownResult = ambiguous.derived.roundHalfUp;
  ambiguous.structuredAnswer.shownResult = ambiguous.input.shownResult;
  mutations.push([ambiguous, "G4BU04_METHOD_CHOICE_AMBIGUOUS"]);
  mutations.push([ambiguous, "G4BU04_METHOD_SHARED_HALF_UP_RESULT"]);

  const inverseMask = clone(generate("ps_g4b_u04_inverse_digit_set"));
  inverseMask.input.mask = `□${inverseMask.input.mask.replace("□", "")}`;
  mutations.push([inverseMask, "G4BU04_INVERSE_VISIBLE_DIGIT_MISMATCH"]);

  const inverseSet = clone(generate("ps_g4b_u04_inverse_original_values"));
  inverseSet.structuredAnswer.values = inverseSet.structuredAnswer.values.slice(1);
  inverseSet.finalAnswer = inverseSet.structuredAnswer.values;
  mutations.push([inverseSet, "G4BU04_INVERSE_SOLUTION_SET_INCOMPLETE"]);

  const placeholder = clone(generate("ps_g4b_u04_round_half_up"));
  placeholder.promptText += " {{value}}";
  mutations.push([placeholder, "G4BU04_UNRESOLVED_PLACEHOLDER"]);

  const internalId = clone(generate("ps_g4b_u04_round_half_up"));
  internalId.promptText += " ps_g4b_u04_round_half_up";
  mutations.push([internalId, "G4BU04_INTERNAL_ID_LEAKAGE"]);

  const fallback = clone(generate("ps_g4b_u04_round_half_up"));
  fallback.fallbackUsed = true;
  mutations.push([fallback, "G4BU04_GENERIC_FALLBACK_FORBIDDEN"]);

  for (const [question, expectedCode] of mutations) {
    const result = validateG4BU04ClassCQuestion(question);
    assert.equal(result.ok, false, expectedCode);
    assert.equal(codes(result).has(expectedCode), true, `${expectedCode}: ${JSON.stringify(result.errors)}`);
  }
});

test("S69 batch gate returns zero accepted questions on any blocking error", () => {
  const batch = generateG4BU04ClassCBatch({ questionCount: 18, seed: "s69-zero-output" });
  const mutated = clone(batch);
  mutated.questions[7].finalAnswer = -1;
  const result = validateG4BU04ClassCBatch(mutated);
  assert.equal(result.ok, false);
  assert.deepEqual(result.acceptedQuestions, []);
  assert.ok(result.errors.length > 0);
});

test("S69 keeps Class D, routing, selector, worksheet and production outside scope", () => {
  const contract = JSON.parse(readFileSync(CONTRACT_PATH, "utf8"));
  assert.equal(contract.scopeBoundary.classDGeneratorImplemented, false);
  assert.equal(contract.scopeBoundary.classDSemanticValidatorImplemented, false);
  assert.equal(contract.scopeBoundary.publicSelectorEnabled, false);
  assert.equal(contract.scopeBoundary.canonicalResolverConnected, false);
  assert.equal(contract.scopeBoundary.worksheetPathConnected, false);
  assert.equal(contract.scopeBoundary.productionUse, "forbidden");
  assert.throws(
    () => generateG4BU04ClassCQuestion({ patternSpecId: "ps_g4b_u04_floor_complete_groups" }),
    /G4BU04_GEN_PATTERN_SPEC_UNSUPPORTED/,
  );
});
