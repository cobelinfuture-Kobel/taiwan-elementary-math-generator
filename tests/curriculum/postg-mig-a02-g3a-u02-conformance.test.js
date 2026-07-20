import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  adaptGlobalPublicSourceUnitPlan,
  validateGlobalPublicSourceUnitAdapters,
} from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter.js";
import {
  G3A_U02_POSTG_TASK_ID,
  resolvePostGoldenSourceUnitAdapterDescriptor,
  validatePostGoldenSourceUnitAdapterRegistry,
} from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter-registry.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { validateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const SOURCE_ID = "g3a_u02_3a02";
const EXPECTED_KP_IDS = new Set([
  "kp_g3a_u02_add_multi_carry",
  "kp_g3a_u02_sub_multi_borrow",
  "kp_g3a_u02_estimate_nearest_thousand",
  "kp_g3a_u02_word_problem_estimation_add_sub",
  "kp_g3a_u02_add_missing_digit_operand",
  "kp_g3a_u02_sub_missing_digit_operand",
  "kp_g3a_u02_add_missing_digit_equation",
  "kp_g3a_u02_sub_missing_digit_equation",
  "kp_g3a_u02_sub_middle_missing_digit",
  "kp_g3a_u02_continuous_borrow_zero",
]);
const EXPECTED_SPEC_IDS = new Set([
  "ps_g3a_u02_4digit_add_multi_carry",
  "ps_g3a_u02_4digit_sub_multi_borrow",
  "ps_g3a_u02_estimate_nearest_thousand",
  "ps_g3a_u02_word_problem_estimation_add_sub",
  "ps_g3a_u02_add_missing_digit_operand",
  "ps_g3a_u02_sub_missing_digit_operand",
  "ps_g3a_u02_add_missing_digit_equation",
  "ps_g3a_u02_sub_missing_digit_equation",
  "ps_g3a_u02_sub_middle_missing_digit",
  "ps_g3a_u02_continuous_borrow_zero",
]);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));

function candidatePlan(overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: "sourceUnit",
    questionCount: 40,
    ordering: "shuffleAcrossPatterns",
    includeAnswerKey: true,
    generationSeed: "postg-mig-a02-g3a-u02",
    goldenContractId: "G5AU08_GOLDEN_V1",
    goldenContractVersion: "1.0.0",
    goldenRuntimeMode: "shadow",
    postGoldenMigrationTaskId: G3A_U02_POSTG_TASK_ID,
    ...overrides,
  };
}

function adaptedPlan(overrides = {}) {
  const adapted = adaptGlobalPublicSourceUnitPlan(candidatePlan(overrides));
  assert.equal(adapted.blocked, false, JSON.stringify(adapted.errors));
  assert.equal(adapted.applied, true);
  return adapted.plan;
}

test("A02 authoritative candidate registers the complete effective selector projection", async () => {
  const registry = await readJson("../../data/curriculum/knowledge/units/g3a_u02_3a02.knowledge-operation.json");
  assert.equal(registry.conformanceState, "IN_PROGRESS_GOLDEN_NATIVE");
  assert.equal(registry.knowledgeRegistryState, "QUESTION_BINDINGS_COMPLETE");
  assert.equal(registry.review.status, "PENDING");
  assert.equal(registry.knowledgePoints.length, 10);
  assert.equal(registry.existingQuestionBindings.length, 10);
  assert.deepEqual(new Set(registry.knowledgePoints.map((row) => row.knowledgePointId)), EXPECTED_KP_IDS);
  assert.deepEqual(new Set(registry.existingQuestionBindings.map((row) => row.questionId)), EXPECTED_SPEC_IDS);
  assert.equal(registry.coverage.numeric, "COMPLETE");
  assert.equal(registry.coverage.application, "COMPLETE");
});

test("A02 shared descriptor resolves ten KP, ten groups and ten PatternSpecs", () => {
  const descriptor = resolvePostGoldenSourceUnitAdapterDescriptor(SOURCE_ID);
  assert.ok(descriptor);
  assert.deepEqual(descriptor.expectedCounts, { knowledgePoints: 10, patternGroups: 10, patternSpecs: 10 });
  assert.deepEqual(new Set(descriptor.knowledgePointIds), EXPECTED_KP_IDS);
  assert.equal(descriptor.patternGroupIds.length, 10);
  assert.deepEqual(new Set(descriptor.patternSpecIds), EXPECTED_SPEC_IDS);
  assert.equal(validatePostGoldenSourceUnitAdapterRegistry().ok, true);
  const aggregate = validateGlobalPublicSourceUnitAdapters();
  assert.equal(aggregate.ok, true, JSON.stringify(aggregate.errors));
});

test("A02 existing shared runtime generates and validates all ten PatternSpecs", () => {
  const generated = generateBatchABrowserQuestions(adaptedPlan());
  assert.equal(generated.ok, true, JSON.stringify(generated.errors));
  assert.equal(generated.questions.length, 40);
  assert.deepEqual(new Set(generated.questions.map((row) => row.patternSpecId)), EXPECTED_SPEC_IDS);
  const validation = validateBatchABrowserQuestions(generated.questions);
  assert.equal(validation.ok, true, JSON.stringify(validation.errors));
});

test("A02 adapter fails closed without the exact task authorization", () => {
  const missingTask = adaptGlobalPublicSourceUnitPlan(candidatePlan({ postGoldenMigrationTaskId: undefined }));
  assert.equal(missingTask.applied, false);
  assert.equal(missingTask.blocked, true);
  assert.ok(missingTask.errors.includes("GS05_GOLDEN_UNIT_NOT_REGISTERED"));

  const wrongTask = adaptGlobalPublicSourceUnitPlan(candidatePlan({ postGoldenMigrationTaskId: "POSTG-MIG-A03_WRONG_TASK" }));
  assert.equal(wrongTask.applied, false);
  assert.equal(wrongTask.blocked, true);
  assert.ok(wrongTask.errors.includes("GS05_GOLDEN_UNIT_NOT_REGISTERED"));
});

test("A02 effective selector uses the formal source path and contains no bridge source", () => {
  const visible = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SOURCE_ID);
  assert.deepEqual(new Set(visible.map((row) => row.knowledgePointId)), EXPECTED_KP_IDS);
  const specIds = new Set(visible.flatMap((row) => (
    getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId).flatMap((group) => group.patternSpecIds ?? [])
  )));
  assert.deepEqual(specIds, EXPECTED_SPEC_IDS);
  assert.equal(visible.some((row) => row.sourceId === "g3a_u02_3a02_context_estimate_runtime"), false);
});

test("A02 program state is bound to PR 294 without advancing the queue", async () => {
  const program = await readJson("../../data/project/programs/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.json");
  assert.equal(program.activeTask, G3A_U02_POSTG_TASK_ID);
  assert.equal(program.activeTaskStatus, "ACTIVE_A02_G3AU02_KNOWLEDGE_OPERATION_CANDIDATE");
  assert.equal(program.activePR, 294);
  assert.equal(program.completedCount, 2);
  assert.equal(program.remainingCount, 12);
  assert.equal(program.goalDistance, "D12_POST_GOLDEN_MIGRATION_G3AU01_CONFORMANT_G3AU02_ACTIVE");
});
