import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  adaptGlobalPublicSourceUnitPlan,
  validateGlobalPublicSourceUnitAdapters,
} from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter.js";
import {
  G3B_U01_POSTG_TASK_ID,
  resolvePostGoldenSourceUnitAdapterDescriptor,
  validatePostGoldenSourceUnitAdapterRegistry,
} from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter-registry.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { validateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const SOURCE_ID = "g3b_u01_3b01";
const EXPECTED_KP_IDS = new Set([
  "kp_g3b_u01_2digit_division_place_value_cases",
  "kp_g3b_u01_3digit_by_1digit_regroup_hundreds",
  "kp_g3b_u01_3digit_division_place_value_cases",
  "kp_g3b_u01_quotient_zero_cases",
  "kp_g3b_u01_division_with_remainder",
  "kp_g3b_u01_wp_partitive_division",
  "kp_g3b_u01_wp_quotative_division",
  "kp_g3b_u01_wp_division_with_remainder",
  "kp_g3b_u01_wp_remainder_interpretation",
  "kp_g3b_u01_wp_two_step_division",
]);
const EXPECTED_SPEC_IDS = new Set([
  "ps_g3b_u01_2digit_by_1digit_regroup_tens",
  "ps_g3b_u01_2digit_leading_digit_insufficient",
  "ps_g3b_u01_2digit_ones_quotient_zero",
  "ps_g3b_u01_2digit_leading_digit_exact",
  "ps_g3b_u01_3digit_by_1digit_regroup_hundreds",
  "ps_g3b_u01_3digit_hundreds_insufficient",
  "ps_g3b_u01_3digit_tens_quotient_zero",
  "ps_g3b_u01_3digit_ones_quotient_zero",
  "ps_g3b_u01_3digit_hundreds_exact",
  "ps_g3b_u01_2digit_division_with_remainder",
  "ps_g3b_u01_3digit_division_with_remainder",
  "ps_g3b_u01_wp_partitive_equal_sharing",
  "ps_g3b_u01_wp_partitive_unit_rate",
  "ps_g3b_u01_wp_quotative_packaging_exact",
  "ps_g3b_u01_wp_quotative_grouping_exact",
  "ps_g3b_u01_wp_remainder_packaging_leftover",
  "ps_g3b_u01_wp_remainder_calendar_weeks_days",
  "ps_g3b_u01_wp_remainder_floor_max_groups",
  "ps_g3b_u01_wp_remainder_ceil_min_containers",
  "ps_g3b_u01_wp_two_step_divide_then_add",
  "ps_g3b_u01_wp_two_step_add_then_divide",
  "ps_g3b_u01_wp_two_step_divide_then_subtract",
  "ps_g3b_u01_wp_two_step_subtract_then_divide",
]);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));

function candidatePlan(overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: "sourceUnit",
    questionCount: 46,
    ordering: "shuffleAcrossPatterns",
    includeAnswerKey: true,
    generationSeed: "postg-mig-a05-g3b-u01",
    goldenContractId: "G5AU08_GOLDEN_V1",
    goldenContractVersion: "1.0.0",
    goldenRuntimeMode: "shadow",
    postGoldenMigrationTaskId: G3B_U01_POSTG_TASK_ID,
    ...overrides,
  };
}

function adaptedPlan(overrides = {}) {
  const adapted = adaptGlobalPublicSourceUnitPlan(candidatePlan(overrides));
  assert.equal(adapted.blocked, false, JSON.stringify(adapted.errors));
  assert.equal(adapted.applied, true);
  return adapted.plan;
}

test("A05 authoritative candidate registers ten KP and twenty-three unique bindings", async () => {
  const registry = await readJson("../../data/curriculum/knowledge/units/g3b_u01_3b01.knowledge-operation.json");
  assert.equal(registry.conformanceState, "IN_PROGRESS_GOLDEN_NATIVE");
  assert.equal(registry.knowledgeRegistryState, "QUESTION_BINDINGS_COMPLETE");
  assert.equal(registry.review.status, "PENDING");
  assert.equal(registry.knowledgePoints.length, 10);
  assert.equal(registry.existingQuestionBindings.length, 23);
  assert.equal(new Set(registry.existingQuestionBindings.map((row) => row.questionId)).size, 23);
  assert.deepEqual(new Set(registry.knowledgePoints.map((row) => row.knowledgePointId)), EXPECTED_KP_IDS);
  assert.deepEqual(new Set(registry.existingQuestionBindings.map((row) => row.questionId)), EXPECTED_SPEC_IDS);
  assert.equal(registry.coverage.numeric, "COMPLETE");
  assert.equal(registry.coverage.application, "COMPLETE");
});

test("A05 descriptor resolves ten KP, ten groups and twenty-three unique PatternSpecs", () => {
  const descriptor = resolvePostGoldenSourceUnitAdapterDescriptor(SOURCE_ID);
  assert.ok(descriptor);
  assert.deepEqual(descriptor.expectedCounts, { knowledgePoints: 10, patternGroups: 10, patternSpecs: 23 });
  assert.deepEqual(new Set(descriptor.knowledgePointIds), EXPECTED_KP_IDS);
  assert.equal(descriptor.patternGroupIds.length, 10);
  assert.deepEqual(new Set(descriptor.patternSpecIds), EXPECTED_SPEC_IDS);
  assert.equal(validatePostGoldenSourceUnitAdapterRegistry().ok, true);
  const aggregate = validateGlobalPublicSourceUnitAdapters();
  assert.equal(aggregate.ok, true, JSON.stringify(aggregate.errors));
});

test("A05 shared runtime generates and validates every unique PatternSpec", () => {
  const generated = generateBatchABrowserQuestions(adaptedPlan());
  assert.equal(generated.ok, true, JSON.stringify(generated.errors));
  assert.equal(generated.questions.length, 46);
  assert.deepEqual(new Set(generated.questions.map((row) => row.patternSpecId)), EXPECTED_SPEC_IDS);
  const validation = validateBatchABrowserQuestions(generated.questions);
  assert.equal(validation.ok, true, JSON.stringify(validation.errors));
});

test("A05 adapter fails closed without exact task authorization", () => {
  for (const taskId of [undefined, "POSTG-MIG-A06_WRONG_TASK"]) {
    const result = adaptGlobalPublicSourceUnitPlan(candidatePlan({ postGoldenMigrationTaskId: taskId }));
    assert.equal(result.applied, false);
    assert.equal(result.blocked, true);
    assert.ok(result.errors.includes("GS05_GOLDEN_UNIT_NOT_REGISTERED"));
  }
});

test("A05 selector resolves the exact twenty-three-spec projection without duplicate lineage", () => {
  const visible = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SOURCE_ID);
  assert.deepEqual(new Set(visible.map((row) => row.knowledgePointId)), EXPECTED_KP_IDS);
  const references = visible.flatMap((row) => (
    getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId)
      .flatMap((group) => group.patternSpecIds ?? [])
  ));
  assert.equal(references.length, 23);
  assert.equal(new Set(references).size, 23);
  assert.deepEqual(new Set(references), EXPECTED_SPEC_IDS);
});

test("A05 preserves division semantic distinctions", async () => {
  const registry = await readJson("../../data/curriculum/knowledge/units/g3b_u01_3b01.knowledge-operation.json");
  const bindings = Object.fromEntries(registry.existingQuestionBindings.map((row) => [row.questionId, row]));
  assert.notEqual(
    bindings.ps_g3b_u01_wp_partitive_equal_sharing.operationModelId,
    bindings.ps_g3b_u01_wp_quotative_packaging_exact.operationModelId,
  );
  assert.notEqual(
    bindings.ps_g3b_u01_wp_remainder_packaging_leftover.operationModelId,
    bindings.ps_g3b_u01_wp_remainder_floor_max_groups.operationModelId,
  );
  assert.equal(
    bindings.ps_g3b_u01_2digit_ones_quotient_zero.knowledgePointId,
    "kp_g3b_u01_quotient_zero_cases",
  );
});

test("A05 program state remains D9 and authorizes only G3B-U01", async () => {
  const program = await readJson("../../data/project/programs/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.json");
  assert.equal(program.activeTask, G3B_U01_POSTG_TASK_ID);
  assert.equal(program.activePR, 297);
  assert.equal(program.completedCount, 5);
  assert.equal(program.remainingCount, 9);
  assert.equal(program.goalDistance, "D9_POST_GOLDEN_MIGRATION_G3AU06_CONFORMANT_G3BU01_ACTIVE");
});
