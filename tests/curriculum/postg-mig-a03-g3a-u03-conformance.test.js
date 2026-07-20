import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  adaptGlobalPublicSourceUnitPlan,
  validateGlobalPublicSourceUnitAdapters,
} from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter.js";
import {
  G3A_U03_POSTG_TASK_ID,
  resolvePostGoldenSourceUnitAdapterDescriptor,
  validatePostGoldenSourceUnitAdapterRegistry,
} from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter-registry.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { validateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const SOURCE_ID = "g3a_u03_3a03";
const EXPECTED_KP_IDS = new Set([
  "kp_g3a_u03_2digit_by_1digit_carry",
  "kp_g3a_u03_10_multiple_by_1digit",
  "kp_g3a_u03_3digit_by_1digit",
  "kp_g3a_u03_consecutive_multiplication_two_step",
  "kp_g3a_u03_consecutive_multiplication_two_step_word_problem",
  "kp_g3a_u03_3digit_zero_middle_by_1digit",
  "kp_g3a_u03_multiplication_missing_digit_inference",
]);
const EXPECTED_SPEC_IDS = new Set([
  "ps_g3a_u03_2digit_by_1digit_carry",
  "ps_g3a_u03_10_multiple_by_1digit",
  "ps_g3a_u03_3digit_by_1digit",
  "ps_g3a_u03_consecutive_multiplication_two_step",
  "ps_g3a_u03_consecutive_multiplication_two_step_word_problem",
  "ps_g3a_u03_3digit_zero_middle_by_1digit",
  "ps_g3a_u03_multiplication_missing_digit_inference",
]);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));

function candidatePlan(overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: "sourceUnit",
    questionCount: 42,
    ordering: "shuffleAcrossPatterns",
    includeAnswerKey: true,
    generationSeed: "postg-mig-a03-g3a-u03",
    goldenContractId: "G5AU08_GOLDEN_V1",
    goldenContractVersion: "1.0.0",
    goldenRuntimeMode: "shadow",
    postGoldenMigrationTaskId: G3A_U03_POSTG_TASK_ID,
    ...overrides,
  };
}

function adaptedPlan(overrides = {}) {
  const adapted = adaptGlobalPublicSourceUnitPlan(candidatePlan(overrides));
  assert.equal(adapted.blocked, false, JSON.stringify(adapted.errors));
  assert.equal(adapted.applied, true);
  return adapted.plan;
}

test("A03 authoritative candidate registers all seven effective capabilities", async () => {
  const registry = await readJson("../../data/curriculum/knowledge/units/g3a_u03_3a03.knowledge-operation.json");
  assert.equal(registry.conformanceState, "IN_PROGRESS_GOLDEN_NATIVE");
  assert.equal(registry.knowledgeRegistryState, "QUESTION_BINDINGS_COMPLETE");
  assert.equal(registry.review.status, "PENDING");
  assert.equal(registry.knowledgePoints.length, 7);
  assert.equal(registry.existingQuestionBindings.length, 7);
  assert.deepEqual(new Set(registry.knowledgePoints.map((row) => row.knowledgePointId)), EXPECTED_KP_IDS);
  assert.deepEqual(new Set(registry.existingQuestionBindings.map((row) => row.questionId)), EXPECTED_SPEC_IDS);
  assert.equal(registry.coverage.numeric, "COMPLETE");
  assert.equal(registry.coverage.application, "COMPLETE");
});

test("A03 descriptor resolves seven KP, groups and PatternSpecs", () => {
  const descriptor = resolvePostGoldenSourceUnitAdapterDescriptor(SOURCE_ID);
  assert.ok(descriptor);
  assert.deepEqual(descriptor.expectedCounts, { knowledgePoints: 7, patternGroups: 7, patternSpecs: 7 });
  assert.deepEqual(new Set(descriptor.knowledgePointIds), EXPECTED_KP_IDS);
  assert.equal(descriptor.patternGroupIds.length, 7);
  assert.deepEqual(new Set(descriptor.patternSpecIds), EXPECTED_SPEC_IDS);
  assert.equal(validatePostGoldenSourceUnitAdapterRegistry().ok, true);
  const aggregate = validateGlobalPublicSourceUnitAdapters();
  assert.equal(aggregate.ok, true, JSON.stringify(aggregate.errors));
});

test("A03 existing shared runtime generates and validates all seven PatternSpecs", () => {
  const generated = generateBatchABrowserQuestions(adaptedPlan());
  assert.equal(generated.ok, true, JSON.stringify(generated.errors));
  assert.equal(generated.questions.length, 42);
  assert.deepEqual(new Set(generated.questions.map((row) => row.patternSpecId)), EXPECTED_SPEC_IDS);
  const validation = validateBatchABrowserQuestions(generated.questions);
  assert.equal(validation.ok, true, JSON.stringify(validation.errors));
});

test("A03 adapter fails closed without exact task authorization", () => {
  for (const taskId of [undefined, "POSTG-MIG-A04_WRONG_TASK"]) {
    const result = adaptGlobalPublicSourceUnitPlan(candidatePlan({ postGoldenMigrationTaskId: taskId }));
    assert.equal(result.applied, false);
    assert.equal(result.blocked, true);
    assert.ok(result.errors.includes("GS05_GOLDEN_UNIT_NOT_REGISTERED"));
  }
});

test("A03 effective selector uses exactly the formal source projection", () => {
  const visible = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SOURCE_ID);
  assert.deepEqual(new Set(visible.map((row) => row.knowledgePointId)), EXPECTED_KP_IDS);
  const specIds = new Set(visible.flatMap((row) => (
    getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId).flatMap((group) => group.patternSpecIds ?? [])
  )));
  assert.deepEqual(specIds, EXPECTED_SPEC_IDS);
});

test("A03 program state remains D11 and authorizes only G3A-U03", async () => {
  const program = await readJson("../../data/project/programs/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.json");
  assert.equal(program.activeTask, G3A_U03_POSTG_TASK_ID);
  assert.equal(program.completedCount, 3);
  assert.equal(program.remainingCount, 11);
  assert.equal(program.goalDistance, "D11_POST_GOLDEN_MIGRATION_G3AU02_CONFORMANT_G3AU03_ACTIVE");
});
