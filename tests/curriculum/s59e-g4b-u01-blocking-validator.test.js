import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  generateG4BU01HiddenBatch,
  generateG4BU01HiddenQuestion,
  listG4BU01HiddenGeneratorPatternSpecIds,
} from '../../site/modules/curriculum/batch-a/g4b-u01-horizontal-generator.js';
import {
  G4B_U01_BLOCKING_CODES,
  G4B_U01_WARNING_CODES,
  generateValidatedG4BU01HiddenBatch,
  generateValidatedG4BU01HiddenQuestion,
  validateG4BU01Question,
} from '../../site/modules/curriculum/batch-a/g4b-u01-horizontal-validator.js';

const formalContract = JSON.parse(
  readFileSync(
    new URL(
      '../../data/curriculum/contracts/S59B_G4B_U01_TagRegistryFormalMappingAndBoundaryDesign.json',
      import.meta.url,
    ),
    'utf8',
  ),
);

const IDS = listG4BU01HiddenGeneratorPatternSpecIds();
const clone = (value) => structuredClone(value);

function base(patternSpecId, seed = 's59e-negative') {
  return generateG4BU01HiddenQuestion(patternSpecId, { seed, sequenceNumber: 1 });
}

function withQuantity(question, changes) {
  return {
    ...clone(question),
    quantities: { ...clone(question.quantities), ...changes },
  };
}

function recalcMultiplication(question) {
  const mutated = clone(question);
  const answer = mutated.quantities.a * mutated.quantities.b;
  mutated.quantities.answer = answer;
  mutated.finalAnswer = answer;
  mutated.answerText = String(answer);
  return mutated;
}

test('S59E blocking and warning code registries exactly match S59B', () => {
  assert.deepEqual(G4B_U01_BLOCKING_CODES, formalContract.plannedBlockingCodes);
  assert.deepEqual(G4B_U01_WARNING_CODES, formalContract.warnings);
  assert.equal(G4B_U01_BLOCKING_CODES.length, 24);
  assert.equal(G4B_U01_WARNING_CODES.length, 2);
  assert.equal(new Set(G4B_U01_BLOCKING_CODES).size, 24);
});

test('S59E positively validates every PatternSpec over repeated seeds', () => {
  assert.equal(IDS.length, 12);
  for (const patternSpecId of IDS) {
    for (let sequenceNumber = 1; sequenceNumber <= 30; sequenceNumber += 1) {
      const question = generateG4BU01HiddenQuestion(patternSpecId, {
        seed: `positive-${patternSpecId}`,
        sequenceNumber,
      });
      const result = validateG4BU01Question(question);
      assert.equal(result.ok, true, `${patternSpecId}:${sequenceNumber}:${JSON.stringify(result.errors)}`);
      assert.deepEqual(result.errors, []);
      assert.ok(result.warnings.every((entry) => G4B_U01_WARNING_CODES.includes(entry.code)));
    }
  }
});

test('S59E validated wrappers return only accepted questions', () => {
  const single = generateValidatedG4BU01HiddenQuestion(IDS[0], { seed: 'validated-single' });
  assert.equal(single.validation.ok, true);
  const batch = generateValidatedG4BU01HiddenBatch({ count: 240, seed: 'validated-batch', ordering: 'shuffled' });
  assert.equal(batch.length, 240);
  assert.ok(batch.every((question) => question.validation.ok));
});

test('S59E validates a 1000-question hidden stress batch with zero blocking errors', () => {
  const questions = generateG4BU01HiddenBatch({ count: 1000, seed: 's59e-stress', ordering: 'shuffled' });
  assert.equal(questions.length, 1000);
  const failures = questions
    .map((question) => validateG4BU01Question(question))
    .filter((result) => !result.ok);
  assert.deepEqual(failures, []);
});

test('S59E negative mutation matrix reaches all 24 blocking codes', () => {
  const multiply = base('ps_g4b_u01_3digit_by_3digit');
  const internal = base('ps_g4b_u01_multiplier_internal_zero');
  const trailing = base('ps_g4b_u01_multiplier_trailing_zero');
  const power10 = base('ps_g4b_u01_power10_multiplication');
  const division = base('ps_g4b_u01_3digit_div_3digit');
  const exact = base('ps_g4b_u01_trailing_zero_division_exact');
  const restored = base('ps_g4b_u01_trailing_zero_division_remainder_restore');

  const wrongResult = clone(multiply);
  wrongResult.finalAnswer += 1;

  const outOfRangeResult = clone(multiply);
  outOfRangeResult.finalAnswer = 10_000_000;
  outOfRangeResult.quantities.answer = 10_000_000;
  outOfRangeResult.answerText = '10000000';

  const invalidInternal = recalcMultiplication(withQuantity(internal, { b: 345 }));
  const invalidTrailing = recalcMultiplication(withQuantity(trailing, { b: trailing.quantities.b / 10 }));
  const invalidPower = withQuantity(power10, { totalExponent: power10.quantities.totalExponent + 1 });

  const divisorZero = withQuantity(division, { divisor: 0 });
  const brokenIdentity = withQuantity(division, { dividend: division.quantities.dividend + 1 });
  const quotientTen = withQuantity(division, { quotient: 10, answer: 10 });
  quotientTen.quotient = 10;
  quotientTen.finalAnswer = 10;
  const negativeRemainder = withQuantity(division, { remainder: -1 });
  negativeRemainder.remainder = -1;
  const largeRemainder = withQuantity(division, { remainder: division.quantities.divisor });
  largeRemainder.remainder = division.quantities.divisor;

  const exactHasRemainder = withQuantity(exact, { remainder: 1, reducedRemainder: 1 });
  exactHasRemainder.remainder = 1;
  const restoredZero = withQuantity(restored, { remainder: 0, reducedRemainder: 0 });
  restoredZero.remainder = 0;
  const invalidCommon = withQuantity(exact, { commonTrailingZeroCount: 0, remainderScale: 1 });
  const invalidReduced = withQuantity(restored, { reducedDividend: restored.quantities.reducedDividend + 1 });
  const invalidRestoration = withQuantity(restored, { remainder: restored.quantities.remainder * 10 });
  invalidRestoration.remainder = restored.remainder * 10;

  const mutations = new Map([
    ['G4B_U01_IDENTITY_MISMATCH', { ...clone(multiply), sourceId: 'wrong_source' }],
    ['G4B_U01_NON_HORIZONTAL_REPRESENTATION', { ...clone(multiply), representation: 'vertical_algorithm' }],
    ['G4B_U01_APPLICATION_TEXT_FORBIDDEN', { ...clone(multiply), applicationText: true }],
    ['G4B_U01_PATTERN_SPEC_SCOPE_MISMATCH', { ...clone(multiply), knowledgePointId: 'wrong_kp' }],
    ['G4B_U01_OPERAND_RANGE_INVALID', withQuantity(multiply, { a: 1 })],
    ['G4B_U01_DIGIT_COUNT_INVALID', withQuantity(multiply, { a: 99 })],
    ['G4B_U01_MULTIPLICATION_RESULT_INVALID', wrongResult],
    ['G4B_U01_RESULT_RANGE_INVALID', outOfRangeResult],
    ['G4B_U01_INTERNAL_ZERO_POSITION_INVALID', invalidInternal],
    ['G4B_U01_TRAILING_ZERO_ROLE_INVALID', invalidTrailing],
    ['G4B_U01_POWER10_SCALING_INVALID', invalidPower],
    ['G4B_U01_DIVISOR_ZERO', divisorZero],
    ['G4B_U01_DIVISION_IDENTITY_INVALID', brokenIdentity],
    ['G4B_U01_QUOTIENT_RANGE_INVALID', quotientTen],
    ['G4B_U01_QUOTIENT_DIGIT_COUNT_INVALID', quotientTen],
    ['G4B_U01_REMAINDER_NEGATIVE', negativeRemainder],
    ['G4B_U01_REMAINDER_NOT_LESS_THAN_DIVISOR', largeRemainder],
    ['G4B_U01_EXACT_DIVISION_HAS_REMAINDER', exactHasRemainder],
    ['G4B_U01_REMAINDER_REQUIRED_BUT_ZERO', restoredZero],
    ['G4B_U01_COMMON_TRAILING_ZERO_INVALID', invalidCommon],
    ['G4B_U01_REDUCED_DIVISION_INVALID', invalidReduced],
    ['G4B_U01_REMAINDER_SCALE_NOT_RESTORED', invalidRestoration],
    ['G4B_U01_ANSWER_MODEL_INVALID', { ...clone(multiply), answerModelShape: 'quotientRemainderAnswer' }],
    ['G4B_U01_GENERIC_FALLBACK_FORBIDDEN', { ...clone(multiply), fallbackUsed: true }],
  ]);

  assert.deepEqual(new Set(mutations.keys()), new Set(G4B_U01_BLOCKING_CODES));
  for (const [expectedCode, question] of mutations) {
    const result = validateG4BU01Question(question);
    assert.equal(result.ok, false, expectedCode);
    assert.ok(
      result.blockingCodes.includes(expectedCode),
      `${expectedCode} not found in ${JSON.stringify(result.blockingCodes)}`,
    );
  }
});

test('S59E unknown PatternSpec is blocked without fallback', () => {
  const question = { ...base(IDS[0]), patternSpecId: 'unknown' };
  const result = validateG4BU01Question(question);
  assert.equal(result.ok, false);
  assert.deepEqual(result.blockingCodes, ['G4B_U01_PATTERN_SPEC_SCOPE_MISMATCH']);
});

test('S59E warnings remain nonblocking', () => {
  let question;
  for (let sequenceNumber = 1; sequenceNumber <= 100; sequenceNumber += 1) {
    const candidate = base('ps_g4b_u01_3digit_by_3digit', `warning-${sequenceNumber}`);
    if ((candidate.quantities.a % 10) * (candidate.quantities.b % 10) < 10) {
      question = candidate;
      break;
    }
  }
  assert.ok(question);
  const signature = `${question.patternSpecId}:${question.operands.join(':')}`;
  const result = validateG4BU01Question(question, { seenSignatures: new Set([signature]) });
  assert.equal(result.ok, true);
  assert.ok(result.warningCodes.includes('G4B_U01_REPEATED_SIGNATURE_WARNING'));
  assert.ok(result.warningCodes.includes('G4B_U01_LOW_CARRY_COMPLEXITY_WARNING'));
  assert.deepEqual(result.errors, []);
});
