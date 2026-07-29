import assert from "node:assert/strict";
import test from "node:test";

import { applyPgcR04NumericUniqueAllocation } from "../../site/modules/curriculum/batch-a/numeric-unique-allocation-fullfix.js";

function mockGenerator(options = {}) {
  const max = 4;
  if (options.questionCount > max) {
    return {
      ok: false,
      plan: { ...options },
      questions: [],
      allocation: [],
      errors: [{ code: "mock_question_count_invalid" }],
      warnings: [],
    };
  }
  const seed = String(options.generationSeed ?? "default");
  const window = Number(seed.match(/window:(\d+)/)?.[1] ?? seed.match(/probe:(\d+)/)?.[1] ?? 0);
  const questions = Array.from({ length: options.questionCount }, (_, index) => {
    const value = window * 10 + index + 1;
    return {
      id: `ps_mock-${index + 1}`,
      patternSpecId: "ps_mock",
      questionMode: "numeric",
      blankedDisplayText: `${value} + 1 = ___`,
      answerText: String(value + 1),
      metadata: { patternId: "ps_mock" },
    };
  });
  return {
    ok: true,
    plan: { ...options, questionMode: "numeric" },
    questions,
    allocation: [{ patternSpecId: "ps_mock", questionCount: questions.length }],
    errors: [],
    warnings: [],
  };
}

test("PGC-R04 allocator fills a 20-question request from existing bounded generator windows", () => {
  const result = applyPgcR04NumericUniqueAllocation(mockGenerator, {
    sourceId: "mock",
    questionMode: "numeric",
    questionCount: 20,
    generationSeed: "stable-seed",
  });
  assert.equal(result.ok, true);
  assert.equal(result.questions.length, 20);
  assert.equal(new Set(result.questions.map((question) => question.blankedDisplayText)).size, 20);
  assert.equal(result.allocation.reduce((sum, row) => sum + row.questionCount, 0), 20);
  assert.equal(result.pgcR04NumericFullFix.status, "PASS_SHARED_DETERMINISTIC_UNIQUE_ALLOCATION");
  assert.equal(result.pgcR04NumericFullFix.secondGeneratorAdded, false);
  assert.equal(result.pgcR04NumericFullFix.existingGeneratorConsumerOnly, true);
});

test("PGC-R04 allocator is deterministic for the same seed and differs across seeds", () => {
  const input = { sourceId: "mock", questionMode: "numeric", questionCount: 20 };
  const first = applyPgcR04NumericUniqueAllocation(mockGenerator, { ...input, generationSeed: "seed-a" });
  const replay = applyPgcR04NumericUniqueAllocation(mockGenerator, { ...input, generationSeed: "seed-a" });
  const different = applyPgcR04NumericUniqueAllocation(mockGenerator, { ...input, generationSeed: "seed-b" });
  assert.deepEqual(first.questions, replay.questions);
  assert.notDeepEqual(
    first.questions.map((question) => question.id),
    different.questions.map((question) => question.id),
  );
});

test("PGC-R04 allocator does not intercept application routes", () => {
  const result = applyPgcR04NumericUniqueAllocation(mockGenerator, {
    sourceId: "mock",
    questionMode: "application",
    questionCount: 20,
    generationSeed: "seed",
  });
  assert.equal(result.ok, false);
  assert.equal(result.pgcR04NumericFullFix, undefined);
  assert.deepEqual(result.errors, [{ code: "mock_question_count_invalid" }]);
});

test("PGC-R04 allocator fails closed when existing generators cannot provide enough unique prompts", () => {
  const fixtureGenerator = (options = {}) => ({
    ok: true,
    plan: { ...options, questionMode: "numeric" },
    questions: Array.from({ length: options.questionCount }, (_, index) => ({
      id: `fixture-${index}`,
      patternSpecId: "ps_fixture",
      questionMode: "numeric",
      blankedDisplayText: `固定題 ${index % 2}`,
      answerText: String(index % 2),
    })),
    allocation: [{ patternSpecId: "ps_fixture", questionCount: options.questionCount }],
    errors: [],
    warnings: [],
  });
  const result = applyPgcR04NumericUniqueAllocation(fixtureGenerator, {
    sourceId: "mock",
    questionMode: "numeric",
    questionCount: 20,
    generationSeed: "seed",
  });
  assert.equal(result.ok, false);
  assert.equal(result.questions.length, 0);
  assert.ok(result.errors.some((error) => error.code === "PGC_R04_NUMERIC_UNIQUE_CAPACITY_EXHAUSTED"));
  assert.equal(result.pgcR04NumericFullFix.status, "FAIL_CLOSED_UNIQUE_CAPACITY_EXHAUSTED");
});
