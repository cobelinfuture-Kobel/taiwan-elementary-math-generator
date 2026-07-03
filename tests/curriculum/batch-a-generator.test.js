import test from "node:test";
import assert from "node:assert/strict";

import {
  BATCH_A_GENERATOR_STATUSES,
  findBatchAPatternSpecRow,
  flattenBatchAPatternSpecs,
  generateBatchAQuestionSet,
  generateBatchAQuestionsFromPatternSpec,
  getBatchAExecutablePatternSpecIds,
  getBatchAPatternSpecRuntimePlan
} from "../../src/curriculum/generator/batch-a-generator.js";
import { validateBatchAItem } from "../../src/curriculum/validator/batch-a-validator.js";
import { QUESTION_KINDS, SUPPORT_STATUSES } from "../../src/core/constants.js";

test("flatten Batch A PatternSpec registry rows", () => {
  const rows = flattenBatchAPatternSpecs();
  assert.equal(rows.length, 82);
  assert.equal(rows.filter((row) => row.readiness === "ready").length, 58);
  assert.equal(rows.filter((row) => row.readiness === "partial").length, 24);
  assert.equal(new Set(rows.map((row) => row.sourceId)).size, 13);
});

test("find Batch A row with normalized validator contract convention", () => {
  const row = findBatchAPatternSpecRow("ps_g4a_u02_2digit_by_2digit");
  assert.equal(row.sourceId, "g4a_u02_4a02");
  assert.equal(row.readiness, "ready");
  assert.equal(row.validatorContractRef, "vc_g4a_u02_2digit_by_2digit");
});

test("build executable runtime plan for safe Batch A expression row", () => {
  const plan = getBatchAPatternSpecRuntimePlan("ps_g3a_u02_4digit_add_multi_carry");
  assert.equal(plan.ok, true);
  assert.equal(plan.status, BATCH_A_GENERATOR_STATUSES.EXECUTABLE);
  assert.equal(plan.pattern.questionKind, QUESTION_KINDS.EXPRESSION);
  assert.deepEqual(plan.pattern.supportStatus, [SUPPORT_STATUSES.V1_EXPRESSION_SUPPORTED]);
  assert.deepEqual(plan.pattern.curriculumNodeIds, ["g3a_u02_3a02"]);
});

test("generate and validate questions from executable Batch A PatternSpec", () => {
  const result = generateBatchAQuestionsFromPatternSpec("ps_g3a_u03_2digit_by_1digit_carry", 3, { seed: "s36-multiply" });
  assert.equal(result.ok, true);
  assert.equal(result.questions.length, 3);

  for (const question of result.questions) {
    assert.equal(question.metadata.patternId, "ps_g3a_u03_2digit_by_1digit_carry");
    assert.deepEqual(question.metadata.curriculumNodeIds, ["g3a_u03_3a03"]);
    const validation = validateBatchAItem({
      question,
      sourceId: "g3a_u03_3a03",
      questionKind: QUESTION_KINDS.EXPRESSION,
      supportStatus: [SUPPORT_STATUSES.V1_EXPRESSION_SUPPORTED]
    });
    assert.equal(validation.ok, true);
  }
});

test("gate partial Batch A rows from generator execution", () => {
  const result = generateBatchAQuestionsFromPatternSpec("ps_g3a_u02_4digit_add_sub_missing_digit", 1, { seed: "s36-partial" });
  assert.equal(result.ok, false);
  assert.equal(result.questions.length, 0);
  assert.match(result.errors.map((error) => error.code).join(","), /BATCH_A_PATTERN_NOT_EXECUTABLE/);
  assert.match(result.warnings.map((warning) => warning.code).join(","), /BATCH_A_GENERATOR_GATE/);
});

test("gate ready number-sense rows without safe expression blueprint", () => {
  const plan = getBatchAPatternSpecRuntimePlan("ps_g3a_u01_4digit_compare");
  assert.equal(plan.ok, false);
  assert.equal(plan.status, BATCH_A_GENERATOR_STATUSES.CONTRACT_ONLY);
  assert.match(plan.warnings.map((warning) => warning.message).join(","), /no_safe_v1_expression_generator_blueprint/);
});

test("reject unknown Batch A PatternSpec id", () => {
  const plan = getBatchAPatternSpecRuntimePlan("ps_not_in_batch_a");
  assert.equal(plan.ok, false);
  assert.equal(plan.status, BATCH_A_GENERATOR_STATUSES.NOT_FOUND);
  assert.match(plan.errors.map((error) => error.code).join(","), /BATCH_A_PATTERN_SPEC_NOT_FOUND/);
});

test("generate default executable Batch A question set", () => {
  const executableIds = getBatchAExecutablePatternSpecIds();
  assert.equal(executableIds.length, 23);

  const result = generateBatchAQuestionSet({ countPerPattern: 1, seed: "s36-set" });
  assert.equal(result.ok, true);
  assert.equal(result.questions.length, 23);
  assert.equal(new Set(result.questions.map((question) => question.metadata.patternId)).size, 23);
});
