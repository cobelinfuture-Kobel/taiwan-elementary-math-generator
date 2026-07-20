import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  adaptGlobalPublicSourceUnitPlan,
  validateGlobalPublicSourceUnitAdapters,
} from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter.js";
import {
  G3B_U08_POSTG_TASK_ID,
  resolvePostGoldenSourceUnitAdapterDescriptor,
  validatePostGoldenSourceUnitAdapterRegistry,
} from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter-registry.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { validateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const SOURCE_ID = "g3b_u08_3b08";
const KP = new Set([
  "kp_g3b_u08_total_from_groups",
  "kp_g3b_u08_group_count_from_total",
  "kp_g3b_u08_per_group_from_total",
  "kp_g3b_u08_reverse_base_from_multiple",
  "kp_g3b_u08_shopping_estimation",
  "kp_g3b_u08_same_price_value_comparison",
]);
const PS = new Set([
  "ps_g3b_u08_total_daily_saving_accumulation",
  "ps_g3b_u08_total_score_per_success",
  "ps_g3b_u08_total_material_per_product",
  "ps_g3b_u08_total_items_per_package",
  "ps_g3b_u08_group_count_score_events",
  "ps_g3b_u08_group_count_craft_products",
  "ps_g3b_u08_group_count_equal_segments",
  "ps_g3b_u08_group_count_packaging",
  "ps_g3b_u08_per_group_daily_saving",
  "ps_g3b_u08_per_group_equal_share_people",
  "ps_g3b_u08_per_group_equal_container_capacity",
  "ps_g3b_u08_per_group_equal_segment_length",
  "ps_g3b_u08_reverse_base_price_multiple",
  "ps_g3b_u08_reverse_base_quantity_multiple",
  "ps_g3b_u08_reverse_base_length_multiple",
  "ps_g3b_u08_reverse_base_capacity_multiple",
  "ps_g3b_u08_estimate_near_hundred_total",
  "ps_g3b_u08_estimate_budget_sufficiency_upper",
  "ps_g3b_u08_estimate_exact_over_benchmark",
  "ps_g3b_u08_estimate_exact_under_benchmark",
  "ps_g3b_u08_same_price_compare_weight",
  "ps_g3b_u08_same_price_compare_capacity",
  "ps_g3b_u08_same_price_compare_item_count",
  "ps_g3b_u08_same_price_compare_total_length",
]);

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));

function plan(overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: "sourceUnit",
    questionCount: 48,
    ordering: "shuffleAcrossPatterns",
    includeAnswerKey: true,
    generationSeed: "postg-mig-a06-shadow",
    goldenContractId: "G5AU08_GOLDEN_V1",
    goldenContractVersion: "1.0.0",
    goldenRuntimeMode: "shadow",
    postGoldenMigrationTaskId: G3B_U08_POSTG_TASK_ID,
    ...overrides,
  };
}

function adapted() {
  const result = adaptGlobalPublicSourceUnitPlan(plan());
  assert.equal(result.blocked, false, JSON.stringify(result.errors));
  assert.equal(result.applied, true);
  return result.plan;
}

test("A06 descriptor resolves six KP, six groups and twenty-four semantic specs", () => {
  const descriptor = resolvePostGoldenSourceUnitAdapterDescriptor(SOURCE_ID);
  assert.deepEqual(descriptor.expectedCounts, {
    knowledgePoints: 6,
    patternGroups: 6,
    patternSpecs: 24,
  });
  assert.deepEqual(new Set(descriptor.knowledgePointIds), KP);
  assert.equal(descriptor.patternGroupIds.length, 6);
  assert.deepEqual(new Set(descriptor.patternSpecIds), PS);
  assert.equal(validatePostGoldenSourceUnitAdapterRegistry().ok, true);
  assert.equal(validateGlobalPublicSourceUnitAdapters().ok, true);
});

test("A06 shadow route reuses the existing S58 generator, validator and renderer", () => {
  const descriptor = resolvePostGoldenSourceUnitAdapterDescriptor(SOURCE_ID);
  assert.deepEqual(descriptor.goldenContractDescriptor.perUnitRuntimeLimits, {
    generator: 0,
    validator: 0,
    renderer: 0,
    workflow: 0,
  });
  assert.deepEqual(descriptor.goldenContractDescriptor.runtimeModules, {
    generator: [
      "site/modules/curriculum/batch-a/g3b-u08-semantic-generator.js",
      "site/modules/curriculum/batch-a/g3b-u08-canonical-semantic-router.js",
    ],
    validator: "site/modules/curriculum/batch-a/g3b-u08-semantic-validator.js",
    renderer: "site/modules/renderer/html-renderer-s58h-extension.js",
  });
});

test("A06 shared route generates and validates every semantic PatternSpec", () => {
  const generated = generateBatchABrowserQuestions(adapted());
  assert.equal(generated.ok, true, JSON.stringify(generated.errors));
  assert.equal(generated.questions.length, 48);
  assert.deepEqual(new Set(generated.questions.map((question) => question.patternSpecId)), PS);
  const validation = validateBatchABrowserQuestions(generated.questions);
  assert.equal(validation.ok, true, JSON.stringify(validation.errors));
});

test("A06 adapter remains fail-closed without exact task authorization", () => {
  for (const taskId of [undefined, "POSTG-MIG-A07_WRONG_TASK"]) {
    const result = adaptGlobalPublicSourceUnitPlan(plan({ postGoldenMigrationTaskId: taskId }));
    assert.equal(result.applied, false);
    assert.equal(result.blocked, true);
    assert.ok(result.errors.includes("GS05_GOLDEN_UNIT_NOT_REGISTERED"));
  }
});

test("A06 selector retains one canonical lineage per semantic identity", () => {
  const visible = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SOURCE_ID);
  assert.deepEqual(new Set(visible.map((row) => row.knowledgePointId)), KP);
  const refs = visible.flatMap((row) => getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId)
    .flatMap((group) => group.patternSpecIds ?? []));
  assert.equal(refs.length, 24);
  assert.deepEqual(new Set(refs), PS);
});

test("A06 E3 candidate preserves D8 and the single active queue item", async () => {
  const [program, controller, registry] = await Promise.all([
    readJson("../../data/project/programs/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.json"),
    readJson("../../data/curriculum/golden/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.controller.json"),
    readJson("../../data/curriculum/golden/G5AU08_GOLDEN_V1.unit-conformance.json"),
  ]);
  assert.equal(program.activeTask, G3B_U08_POSTG_TASK_ID);
  assert.equal(program.completedCount, 6);
  assert.equal(program.remainingCount, 8);
  assert.equal(program.goalDistance, "D8_POST_GOLDEN_MIGRATION_G3BU01_CONFORMANT_G3BU08_ACTIVE");
  assert.equal(controller.queue.activeSourceId, SOURCE_ID);
  const row = registry.rows.find((entry) => entry.sourceId === SOURCE_ID);
  assert.equal(row.queueState, "ACTIVE");
  assert.equal(row.conformanceStatus, "IN_PROGRESS_GOLDEN_NATIVE");
  assert.equal(row.goldenProductionEligible, false);
});
