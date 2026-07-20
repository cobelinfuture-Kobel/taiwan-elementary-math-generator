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
import { validateG3BU08SemanticBatch } from "../../site/modules/curriculum/batch-a/g3b-u08-semantic-validator.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const SOURCE_ID = "g3b_u08_3b08";
const NEXT_SOURCE_ID = "g4a_u01_4a01";
const NEXT_TASK_ID = "POSTG-MIG-A07_G4A_U01_GoldenConformanceAndKnowledgeOperationMigration";
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

test("A06 knowledge authority registers six operation models and twenty-four bindings", async () => {
  const registry = await readJson("../../data/curriculum/knowledge/units/g3b_u08_3b08.knowledge-operation.json");
  assert.equal(registry.conformanceState, "GOLDEN_CONFORMANT");
  assert.equal(registry.knowledgeRegistryState, "VALIDATED_COMPLETE");
  assert.equal(registry.review.status, "PASS");
  assert.equal(registry.knowledgePoints.length, 6);
  assert.equal(registry.knowledgePoints.flatMap((row) => row.operationModels).length, 6);
  assert.equal(registry.existingQuestionBindings.length, 24);
  assert.deepEqual(new Set(registry.knowledgePoints.map((row) => row.knowledgePointId)), KP);
  assert.deepEqual(new Set(registry.existingQuestionBindings.map((row) => row.questionId)), PS);
  assert.equal(registry.coverage.numeric, "ABSENT");
  assert.equal(registry.coverage.application, "COMPLETE");
});

test("A06 descriptor resolves six KP, six groups and twenty-four semantic specs", () => {
  const descriptor = resolvePostGoldenSourceUnitAdapterDescriptor(SOURCE_ID);
  assert.deepEqual(descriptor.expectedCounts, { knowledgePoints: 6, patternGroups: 6, patternSpecs: 24 });
  assert.deepEqual(new Set(descriptor.knowledgePointIds), KP);
  assert.equal(descriptor.patternGroupIds.length, 6);
  assert.deepEqual(new Set(descriptor.patternSpecIds), PS);
  assert.equal(validatePostGoldenSourceUnitAdapterRegistry().ok, true);
  assert.equal(validateGlobalPublicSourceUnitAdapters().ok, true);
});

test("A06 route reuses the existing S58 generator validator and renderer", () => {
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

test("A06 shared route generates and semantically validates every PatternSpec", () => {
  const generated = generateBatchABrowserQuestions(adapted());
  assert.equal(generated.ok, true, JSON.stringify(generated.errors));
  assert.equal(generated.questions.length, 48);
  assert.deepEqual(new Set(generated.questions.map((question) => question.patternSpecId)), PS);
  const validation = validateG3BU08SemanticBatch(generated.questions);
  assert.equal(validation.valid, true, JSON.stringify(validation.blockingErrors));
  assert.equal(validation.blockingErrors.length, 0);
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

test("A06 preserves multiplication division and comparison semantic distinctions", async () => {
  const registry = await readJson("../../data/curriculum/knowledge/units/g3b_u08_3b08.knowledge-operation.json");
  const bindings = Object.fromEntries(registry.existingQuestionBindings.map((row) => [row.questionId, row]));
  assert.notEqual(bindings.ps_g3b_u08_total_daily_saving_accumulation.operationModelId, bindings.ps_g3b_u08_group_count_score_events.operationModelId);
  assert.notEqual(bindings.ps_g3b_u08_group_count_score_events.operationModelId, bindings.ps_g3b_u08_per_group_equal_share_people.operationModelId);
  assert.notEqual(bindings.ps_g3b_u08_estimate_near_hundred_total.operationModelId, bindings.ps_g3b_u08_same_price_compare_weight.operationModelId);
});

test("A06 historical closeout remains valid after A07 knowledge registration", async () => {
  const [program, controller, conformance, master, readback] = await Promise.all([
    readJson("../../data/project/programs/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.json"),
    readJson("../../data/curriculum/golden/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.controller.json"),
    readJson("../../data/curriculum/golden/G5AU08_GOLDEN_V1.unit-conformance.json"),
    readJson("../../data/curriculum/knowledge/master/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.master-index.json"),
    readJson("../../docs/curriculum/output/postg/a06-g3b-u08/POSTG_MIG_A06_G3BU08_RUNTIME_READBACK.json"),
  ]);
  assert.equal(program.lastCompletedTask, G3B_U08_POSTG_TASK_ID);
  assert.equal(program.activeTask, NEXT_TASK_ID);
  assert.equal(program.completedCount, 7);
  assert.equal(program.remainingCount, 7);
  assert.equal(program.goalDistance, "D7_POST_GOLDEN_MIGRATION_G3BU08_CONFORMANT_G4AU01_ACTIVE");
  assert.equal(controller.queue.activeSourceId, NEXT_SOURCE_ID);
  assert.ok(controller.queue.completeSourceIds.includes(SOURCE_ID));
  const closed = conformance.rows.find((entry) => entry.sourceId === SOURCE_ID);
  assert.equal(closed.queueState, "COMPLETE");
  assert.equal(closed.conformanceStatus, "GOLDEN_CONFORMANT");
  assert.equal(closed.goldenProductionEligible, true);
  const active = conformance.rows.find((entry) => entry.sourceId === NEXT_SOURCE_ID);
  assert.equal(active.queueState, "ACTIVE");
  assert.equal(active.conformanceStatus, "IN_PROGRESS_GOLDEN_NATIVE");
  const masterRow = master.rows.find((entry) => entry.sourceId === SOURCE_ID);
  assert.equal(masterRow.unitJsonExists, true);
  assert.equal(masterRow.knowledgePointCount, 6);
  assert.equal(masterRow.operationModelCount, 6);
  assert.equal(masterRow.existingQuestionBindingCount, 24);
  assert.ok(master.statusSummary.unitJsonExistsCount >= 9);
  assert.ok(master.statusSummary.knowledgeRegistryCompleteCount >= 9);
  assert.equal(readback.verdict, "PASS_CURRENT_RUNTIME_PRODUCTION_HTML_PDF_HASH_READBACK");
  assert.equal(readback.canonicalWorksheetIdentityParity, true);
  assert.equal(readback.validator.errorCount, 0);
});
