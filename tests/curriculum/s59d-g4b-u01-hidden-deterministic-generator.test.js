import test from 'node:test';
import assert from 'node:assert/strict';

import {
  generateG4BU01HiddenBatch,
  generateG4BU01HiddenQuestion,
  listG4BU01HiddenGeneratorPatternSpecIds,
  validateG4BU01HiddenGeneratedQuestion,
} from '../../site/modules/curriculum/batch-a/g4b-u01-horizontal-generator.js';

const IDS = listG4BU01HiddenGeneratorPatternSpecIds();

function countBySpec(questions) {
  const counts = new Map();
  for (const question of questions) {
    counts.set(question.patternSpecId, (counts.get(question.patternSpecId) ?? 0) + 1);
  }
  return counts;
}

function membership(questions) {
  return questions.map((row) => row.id).sort();
}

test('S59D generates one deterministic valid hidden question for all twelve PatternSpecs', () => {
  assert.equal(IDS.length, 12);
  for (const patternSpecId of IDS) {
    const first = generateG4BU01HiddenQuestion(patternSpecId, {
      seed: 'all-spec-positive',
      sequenceNumber: 1,
    });
    const replay = generateG4BU01HiddenQuestion(patternSpecId, {
      seed: 'all-spec-positive',
      sequenceNumber: 1,
    });
    assert.deepEqual(replay, first);
    assert.equal(validateG4BU01HiddenGeneratedQuestion(first).ok, true, patternSpecId);
    assert.equal(first.sourceId, 'g4b_u01_4b01');
    assert.equal(first.representation, 'horizontal_only');
    assert.equal(first.applicationText, false);
    assert.equal(first.selectorStatus, 'hidden');
    assert.equal(first.generatorRouting, 'hidden_only_not_canonical');
    assert.equal(first.productionUse, 'forbidden');
    assert.doesNotMatch(first.promptText, /[？?\n]/);
    assert.doesNotMatch(first.promptText, /\{[^}]+\}/);
  }
});

test('S59D multiplication families enforce digit and zero-position boundaries', () => {
  for (let index = 1; index <= 30; index += 1) {
    const three = generateG4BU01HiddenQuestion('ps_g4b_u01_3digit_by_3digit', { seed: 'm3', sequenceNumber: index });
    assert.match(String(three.quantities.a), /^\d{3}$/);
    assert.match(String(three.quantities.b), /^\d{3}$/);

    const four = generateG4BU01HiddenQuestion('ps_g4b_u01_4digit_by_3digit', { seed: 'm4', sequenceNumber: index });
    assert.match(String(four.quantities.a), /^\d{4}$/);
    assert.match(String(four.quantities.b), /^\d{3}$/);

    const internal = generateG4BU01HiddenQuestion('ps_g4b_u01_multiplier_internal_zero', { seed: 'mi0', sequenceNumber: index });
    const multiplier = String(internal.quantities.b);
    assert.equal(multiplier.slice(1, -1).includes('0'), true);
    assert.notEqual(multiplier.at(-1), '0');

    const multiplierZero = generateG4BU01HiddenQuestion('ps_g4b_u01_multiplier_trailing_zero', { seed: 'mt0', sequenceNumber: index });
    assert.notEqual(multiplierZero.quantities.a % 10, 0);
    assert.equal(multiplierZero.quantities.b % 10, 0);

    const multiplicandZero = generateG4BU01HiddenQuestion('ps_g4b_u01_multiplicand_trailing_zero', { seed: 'ma0', sequenceNumber: index });
    assert.equal(multiplicandZero.quantities.a % 10, 0);
    assert.notEqual(multiplicandZero.quantities.b % 10, 0);

    const both = generateG4BU01HiddenQuestion('ps_g4b_u01_both_factors_trailing_zero', { seed: 'both0', sequenceNumber: index });
    assert.equal(both.quantities.a % 10, 0);
    assert.equal(both.quantities.b % 10, 0);

    const power = generateG4BU01HiddenQuestion('ps_g4b_u01_power10_multiplication', { seed: 'p10', sequenceNumber: index });
    assert.equal(
      power.quantities.answer,
      power.quantities.baseA * power.quantities.baseB * 10 ** power.quantities.totalExponent,
    );
    assert.ok(power.quantities.totalExponent >= 1 && power.quantities.totalExponent <= 5);
  }
});

test('S59D division families enforce quotient digits, identity and remainder bounds', () => {
  const cases = [
    ['ps_g4b_u01_3digit_div_3digit', 3, 3, 1],
    ['ps_g4b_u01_4digit_div_3digit_2digit_quotient', 4, 3, 2],
    ['ps_g4b_u01_4digit_div_3digit_1digit_quotient', 4, 3, 1],
  ];
  for (const [patternSpecId, dividendDigits, divisorDigits, quotientDigits] of cases) {
    for (let index = 1; index <= 40; index += 1) {
      const question = generateG4BU01HiddenQuestion(patternSpecId, {
        seed: `division-${patternSpecId}`,
        sequenceNumber: index,
      });
      const q = question.quantities;
      assert.equal(String(q.dividend).length, dividendDigits);
      assert.equal(String(q.divisor).length, divisorDigits);
      assert.equal(String(q.quotient).length, quotientDigits);
      assert.equal(q.dividend, q.divisor * q.quotient + q.remainder);
      assert.ok(q.remainder >= 0 && q.remainder < q.divisor);
      assert.equal(question.finalAnswer, q.quotient);
    }
  }
});

test('S59D trailing-zero division restores the original remainder scale', () => {
  for (let index = 1; index <= 50; index += 1) {
    const exact = generateG4BU01HiddenQuestion('ps_g4b_u01_trailing_zero_division_exact', {
      seed: 'tz-exact',
      sequenceNumber: index,
    });
    assert.equal(exact.remainder, 0);
    assert.equal(exact.quantities.reducedRemainder, 0);
    assert.ok(exact.quantities.commonTrailingZeroCount >= 1);

    const restored = generateG4BU01HiddenQuestion(
      'ps_g4b_u01_trailing_zero_division_remainder_restore',
      { seed: 'tz-restored', sequenceNumber: index },
    );
    const q = restored.quantities;
    assert.ok(q.reducedRemainder > 0);
    assert.equal(q.remainderScale, 10 ** q.commonTrailingZeroCount);
    assert.equal(q.remainder, q.reducedRemainder * q.remainderScale);
    assert.equal(q.dividend, q.divisor * q.quotient + q.remainder);
    assert.ok(q.remainder < q.divisor);
  }
});

test('S59D exact-count batch allocation is balanced and deterministic', () => {
  const grouped = generateG4BU01HiddenBatch({ count: 240, seed: 'balanced-240', ordering: 'grouped' });
  const replay = generateG4BU01HiddenBatch({ count: 240, seed: 'balanced-240', ordering: 'grouped' });
  assert.deepEqual(replay, grouped);
  assert.equal(grouped.length, 240);
  const counts = countBySpec(grouped);
  assert.equal(counts.size, 12);
  assert.ok([...counts.values()].every((count) => count === 20));
  assert.ok(grouped.every((question) => validateG4BU01HiddenGeneratedQuestion(question).ok));
});

test('S59D supports deterministic shuffled ordering without changing membership', () => {
  const grouped = generateG4BU01HiddenBatch({ count: 257, seed: 'shuffle-membership', ordering: 'grouped' });
  const shuffled = generateG4BU01HiddenBatch({ count: 257, seed: 'shuffle-membership', ordering: 'shuffled' });
  const replay = generateG4BU01HiddenBatch({ count: 257, seed: 'shuffle-membership', ordering: 'shuffled' });
  assert.deepEqual(shuffled, replay);
  assert.deepEqual(membership(shuffled), membership(grouped));
  assert.notDeepEqual(shuffled.map((row) => row.id), grouped.map((row) => row.id));
  const spread = [...countBySpec(shuffled).values()];
  assert.ok(Math.max(...spread) - Math.min(...spread) <= 1);
});

test('S59D supports a balanced 1000-question hidden stress batch', () => {
  const questions = generateG4BU01HiddenBatch({ count: 1000, seed: 'stress-1000', ordering: 'shuffled' });
  assert.equal(questions.length, 1000);
  const counts = [...countBySpec(questions).values()];
  assert.equal(counts.length, 12);
  assert.ok(Math.max(...counts) - Math.min(...counts) <= 1);
  assert.ok(questions.every((question) => validateG4BU01HiddenGeneratedQuestion(question).ok));
});

test('S59D rejects invalid selection, count, order and sequence inputs', () => {
  assert.throws(
    () => generateG4BU01HiddenQuestion('unknown'),
    /G4B_U01_GEN_PATTERN_SPEC_UNREGISTERED/,
  );
  assert.throws(
    () => generateG4BU01HiddenQuestion(IDS[0], { sequenceNumber: 0 }),
    /G4B_U01_GEN_SEQUENCE_INVALID/,
  );
  assert.throws(
    () => generateG4BU01HiddenBatch({ count: 0 }),
    /G4B_U01_GEN_COUNT_INVALID/,
  );
  assert.throws(
    () => generateG4BU01HiddenBatch({ count: 1001 }),
    /G4B_U01_GEN_COUNT_INVALID/,
  );
  assert.throws(
    () => generateG4BU01HiddenBatch({ patternSpecIds: [IDS[0], IDS[0]] }),
    /G4B_U01_GEN_PATTERN_SPEC_SELECTION_INVALID/,
  );
  assert.throws(
    () => generateG4BU01HiddenBatch({ ordering: 'random' }),
    /G4B_U01_GEN_ORDERING_INVALID/,
  );
});

test('S59D structural self-check blocks mutated arithmetic and hidden-scope escape', () => {
  const source = generateG4BU01HiddenQuestion('ps_g4b_u01_3digit_by_3digit', {
    seed: 'negative-mutation',
  });
  const wrongAnswer = {
    ...source,
    finalAnswer: source.finalAnswer + 1,
  };
  assert.equal(validateG4BU01HiddenGeneratedQuestion(wrongAnswer).ok, false);

  const promoted = {
    ...source,
    selectorStatus: 'visible',
    productionUse: 'allowed',
  };
  const result = validateG4BU01HiddenGeneratedQuestion(promoted);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((entry) => entry.code === 'G4B_U01_GEN_SCOPE_PROMOTION'));
});
