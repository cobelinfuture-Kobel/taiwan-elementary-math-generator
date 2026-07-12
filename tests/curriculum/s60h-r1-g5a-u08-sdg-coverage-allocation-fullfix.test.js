import assert from "node:assert/strict";
import test from "node:test";

import {
  ALLOWED_SDG_IDS,
  generateG5AU08ApplicationBatch,
} from "../../site/modules/curriculum/batch-a/g5a-u08-application-generator.js";
import {
  validateG5AU08ApplicationBatch,
} from "../../site/modules/curriculum/batch-a/g5a-u08-application-validator.js";

function clone(value) {
  return structuredClone(value);
}

function actualCellAllocation(questions) {
  const counts = {};
  for (const question of questions) {
    const key = `${question.patternSpecId}|${question.depth}|${question.context.contextType}`;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}

test("S60H-R1 default 1000-question allocation reaches all eight SDG goals", () => {
  const batch = generateG5AU08ApplicationBatch({
    questionCount: 1000,
    seed: "s60h-r1-all-goals",
    ordering: "shuffled",
  });

  assert.deepEqual(batch.depthAllocation, { N: 300, N_PLUS_1: 700 });
  assert.deepEqual(batch.contextAllocation, { daily_life: 500, sdg: 500 });
  assert.deepEqual(batch.coveredSdgGoalIds, [...ALLOWED_SDG_IDS].sort());
  assert.equal(new Set(batch.questions.map((row) => row.patternSpecId)).size, 11);
  assert.equal(new Set(batch.questions.map((row) => row.templateFamilyId)).size, 10);
  assert.equal(batch.allocationPolicy, "pattern_spec_x_depth_x_context_with_feasible_coverage_seeding");
  assert.equal(validateG5AU08ApplicationBatch(batch).valid, true);
});

test("S60H-R1 cellAllocation exactly matches generated PatternSpec-depth-context cells", () => {
  const batch = generateG5AU08ApplicationBatch({
    questionCount: 317,
    seed: "s60h-r1-cell-counts",
    ordering: "grouped",
  });

  assert.deepEqual(batch.cellAllocation, actualCellAllocation(batch.questions));
  assert.equal(Object.values(batch.cellAllocation).reduce((sum, count) => sum + count, 0), 317);
  assert.equal(Object.values(batch.specAllocation).reduce((sum, count) => sum + count, 0), 317);
  assert.equal(validateG5AU08ApplicationBatch(batch).valid, true);
});

test("S60H-R1 single SDG-only PatternSpec uses only its feasible depth and context", () => {
  const patternSpecId = "ps_g5a_u08_app_average_update";
  const batch = generateG5AU08ApplicationBatch({
    questionCount: 25,
    seed: "s60h-r1-single-update",
    selectedPatternSpecIds: [patternSpecId],
  });

  assert.deepEqual(batch.depthAllocation, { N: 0, N_PLUS_1: 25 });
  assert.deepEqual(batch.contextAllocation, { daily_life: 0, sdg: 25 });
  assert.deepEqual(batch.coveredSdgGoalIds, ["SDG_6"]);
  assert.deepEqual(new Set(batch.questions.map((row) => row.patternSpecId)), new Set([patternSpecId]));
  assert.equal(validateG5AU08ApplicationBatch(batch).valid, true);
});

test("S60H-R1 single flexible PatternSpec preserves the 30/70 and 50/50 targets", () => {
  const patternSpecId = "ps_g5a_u08_app_two_same_rate_groups_sum";
  const batch = generateG5AU08ApplicationBatch({
    questionCount: 20,
    seed: "s60h-r1-single-flexible",
    selectedPatternSpecIds: [patternSpecId],
  });

  assert.deepEqual(batch.depthAllocation, { N: 6, N_PLUS_1: 14 });
  assert.deepEqual(batch.contextAllocation, { daily_life: 10, sdg: 10 });
  assert.deepEqual(batch.coveredSdgGoalIds, ["SDG_4"]);
  assert.equal(validateG5AU08ApplicationBatch(batch).valid, true);
});

test("S60H-R1 daily-life selection does not demand unreachable SDG coverage", () => {
  const batch = generateG5AU08ApplicationBatch({
    questionCount: 37,
    seed: "s60h-r1-daily-only",
    contextMode: "daily_life",
  });

  assert.deepEqual(batch.contextAllocation, { daily_life: 37, sdg: 0 });
  assert.deepEqual(batch.coveredSdgGoalIds, []);
  assert.equal(batch.questions.every((row) => row.context.contextType === "daily_life"), true);
  assert.equal(validateG5AU08ApplicationBatch(batch).valid, true);
});

test("S60H-R1 small question counts remain feasible and deterministic", () => {
  for (const questionCount of [1, 2, 3, 7]) {
    const first = generateG5AU08ApplicationBatch({
      questionCount,
      seed: `s60h-r1-small-${questionCount}`,
      ordering: "shuffled",
    });
    const second = generateG5AU08ApplicationBatch({
      questionCount,
      seed: `s60h-r1-small-${questionCount}`,
      ordering: "shuffled",
    });
    assert.deepEqual(first, second);
    assert.equal(first.questions.length, questionCount);
    assert.equal(validateG5AU08ApplicationBatch(first).valid, true);
  }
});

test("S60H-R1 validator blocks stale or forged cell allocation", () => {
  const batch = clone(generateG5AU08ApplicationBatch({
    questionCount: 43,
    seed: "s60h-r1-cell-mutation",
  }));
  const firstKey = Object.keys(batch.cellAllocation)[0];
  batch.cellAllocation[firstKey] += 1;

  const result = validateG5AU08ApplicationBatch(batch);
  assert.equal(result.valid, false);
  assert.equal(result.output, null);
  assert.deepEqual(result.acceptedQuestions, []);
  assert.equal(result.errors.some((entry) => entry.path === "batch.cellAllocation"), true);
});
