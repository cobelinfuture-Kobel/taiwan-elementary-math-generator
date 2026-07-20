import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  adaptGlobalPublicSourceUnitPlan,
  validateGlobalPublicSourceUnitAdapters,
} from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter.js";
import {
  G4A_U01_POSTG_TASK_ID,
  resolvePostGoldenSourceUnitAdapterDescriptor,
  validatePostGoldenSourceUnitAdapterRegistry,
} from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter-registry.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { validateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator.js";

const SOURCE_ID = "g4a_u01_4a01";
const TASK_ID = "POSTG-MIG-A07_G4A_U01_GoldenConformanceAndKnowledgeOperationMigration";
const PS = new Set([
  "ps_g4a_u01_compare_8digit",
  "ps_g4a_u01_within_100million_compare",
  "ps_g4a_u01_large_number_add_sub",
  "ps_g4a_u01_8digit_place_value_decomposition",
  "ps_g4a_u01_place_value_composition_to_number",
  "ps_g4a_u01_same_digit_place_value_difference",
  "ps_g4a_u01_nonstandard_place_value_composition",
  "ps_g4a_u01_place_value_card_unit_model_composition",
  "ps_g4a_u01_compare_first_different_place",
  "ps_g4a_u01_missing_digit_comparison_possible_digits",
  "ps_g4a_u01_missing_digit_comparison_extreme_digit",
  "ps_g4a_u01_large_number_reading_writing_conversion",
  "ps_g4a_u01_numeric_vs_chinese_number_compare",
  "ps_g4a_u01_wan_mixed_notation_subtraction",
  "ps_g4a_u01_boundary_number_difference",
  "ps_g4a_u01_comparison_word_problem_total",
  "ps_g4a_u01_large_number_unit_word_problem_add_subtract",
  "ps_g4a_u01_digit_arrangement_max_min",
]);
const KP = new Set([...PS].map((id) => id.replace(/^ps_/, "kp_")));
const PG = new Set([...PS].map((id) => id.replace(/^ps_/, "pg_")));
const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));

function plan(overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: "sourceUnit",
    questionCount: 36,
    ordering: "shuffleAcrossPatterns",
    includeAnswerKey: true,
    generationSeed: "postg-mig-a07-shadow",
    goldenContractId: "G5AU08_GOLDEN_V1",
    goldenContractVersion: "1.0.0",
    goldenRuntimeMode: "shadow",
    postGoldenMigrationTaskId: G4A_U01_POSTG_TASK_ID,
    ...overrides,
  };
}

function adapted() {
  const result = adaptGlobalPublicSourceUnitPlan(plan());
  assert.equal(result.blocked, false, JSON.stringify(result.errors));
  assert.equal(result.applied, true);
  return result.plan;
}

test("A07 authority contains eighteen unique KP operation models and bindings", async () => {
  const registry = await readJson("../../data/curriculum/knowledge/units/g4a_u01_4a01.knowledge-operation.json");
  assert.equal(registry.sourceId, SOURCE_ID);
  assert.equal(registry.conformanceState, "IN_PROGRESS_GOLDEN_NATIVE");
  assert.equal(registry.knowledgeRegistryState, "VALIDATED_COMPLETE");
  assert.equal(registry.review.status, "PASS");
  assert.equal(registry.knowledgePoints.length, 18);
  assert.equal(registry.knowledgePoints.flatMap((row) => row.operationModels).length, 18);
  assert.equal(registry.existingQuestionBindings.length, 18);
  assert.deepEqual(new Set(registry.knowledgePoints.map((row) => row.knowledgePointId)), KP);
  assert.deepEqual(new Set(registry.existingQuestionBindings.map((row) => row.questionId)), PS);
  assert.equal(new Set(registry.existingQuestionBindings.map((row) => row.knowledgePointId)).size, 18);
  assert.equal(new Set(registry.existingQuestionBindings.map((row) => row.operationModelId)).size, 18);
  assert.equal(registry.coverage.numeric, "COMPLETE");
  assert.equal(registry.coverage.application, "COMPLETE");
});

test("A07 descriptor resolves eighteen KP groups and PatternSpecs", () => {
  const descriptor = resolvePostGoldenSourceUnitAdapterDescriptor(SOURCE_ID);
  assert.deepEqual(descriptor.expectedCounts, {
    knowledgePoints: 18,
    patternGroups: 18,
    patternSpecs: 18,
  });
  assert.deepEqual(new Set(descriptor.knowledgePointIds), KP);
  assert.deepEqual(new Set(descriptor.patternGroupIds), PG);
  assert.deepEqual(new Set(descriptor.patternSpecIds), PS);
  assert.equal(validatePostGoldenSourceUnitAdapterRegistry().ok, true);
  assert.equal(validateGlobalPublicSourceUnitAdapters().ok, true);
});

test("A07 descriptor reuses Phase 1 Phase 3 shared validator and S60J renderer", () => {
  const descriptor = resolvePostGoldenSourceUnitAdapterDescriptor(SOURCE_ID);
  assert.deepEqual(descriptor.goldenContractDescriptor.perUnitRuntimeLimits, {
    generator: 0,
    validator: 0,
    renderer: 0,
    workflow: 0,
  });
  assert.deepEqual(descriptor.goldenContractDescriptor.runtimeModules, {
    generator: [
      "site/modules/curriculum/batch-a/g4a-u01-phase1-generator.js",
      "site/modules/curriculum/batch-a/g4a-u01-phase3-runtime-fix-generator.js",
    ],
    validator: "site/modules/curriculum/batch-a/batch-a-browser-validator.js",
    renderer: "site/modules/renderer/html-renderer-s60j-extension.js",
  });
});

test("A07 shared route generates and validates every PatternSpec", () => {
  const generated = generateBatchABrowserQuestions(adapted());
  assert.equal(generated.ok, true, JSON.stringify(generated.errors));
  assert.equal(generated.questions.length, 36);
  assert.deepEqual(new Set(generated.questions.map((question) => question.patternSpecId)), PS);
  const validation = validateBatchABrowserQuestions(generated.questions, { plan: generated.plan });
  assert.equal(validation.ok, true, JSON.stringify(validation.errors));
  assert.equal(validation.errors.length, 0);
});

test("A07 adapter remains fail-closed without exact task authorization", () => {
  for (const taskId of [undefined, "POSTG-MIG-A08_WRONG_TASK"]) {
    const result = adaptGlobalPublicSourceUnitPlan(plan({ postGoldenMigrationTaskId: taskId }));
    assert.equal(result.applied, false);
    assert.equal(result.blocked, true);
    assert.ok(result.errors.includes("GS05_GOLDEN_UNIT_NOT_REGISTERED"));
  }
});

test("A07 preserves distinct comparison place-value reasoning arithmetic and application models", async () => {
  const registry = await readJson("../../data/curriculum/knowledge/units/g4a_u01_4a01.knowledge-operation.json");
  const bindings = Object.fromEntries(registry.existingQuestionBindings.map((row) => [row.questionId, row]));
  assert.notEqual(bindings.ps_g4a_u01_compare_8digit.operationModelId, bindings.ps_g4a_u01_compare_first_different_place.operationModelId);
  assert.notEqual(bindings.ps_g4a_u01_8digit_place_value_decomposition.operationModelId, bindings.ps_g4a_u01_place_value_composition_to_number.operationModelId);
  assert.notEqual(bindings.ps_g4a_u01_large_number_add_sub.operationModelId, bindings.ps_g4a_u01_large_number_unit_word_problem_add_subtract.operationModelId);
  assert.notEqual(bindings.ps_g4a_u01_comparison_word_problem_total.operationModelId, bindings.ps_g4a_u01_digit_arrangement_max_min.operationModelId);
});

test("A07 application capability does not force stories onto direct number-structure KP", async () => {
  const registry = await readJson("../../data/curriculum/knowledge/units/g4a_u01_4a01.knowledge-operation.json");
  const byId = Object.fromEntries(registry.knowledgePoints.map((row) => [row.knowledgePointId, row]));
  assert.equal(byId.kp_g4a_u01_comparison_word_problem_total.applicationCapability, "REQUIRED");
  assert.equal(byId.kp_g4a_u01_large_number_unit_word_problem_add_subtract.applicationCapability, "REQUIRED");
  assert.equal(byId.kp_g4a_u01_digit_arrangement_max_min.applicationCapability, "OPTIONAL");
  assert.equal(byId.kp_g4a_u01_8digit_place_value_decomposition.applicationCapability, "NOT_APPLICABLE");
});

test("A07 E3 remains active and production-blocked", async () => {
  const [program, controller, conformance, master, contract, claim] = await Promise.all([
    readJson("../../data/project/programs/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.json"),
    readJson("../../data/curriculum/golden/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.controller.json"),
    readJson("../../data/curriculum/golden/G5AU08_GOLDEN_V1.unit-conformance.json"),
    readJson("../../data/curriculum/knowledge/master/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.master-index.json"),
    readJson("../../data/curriculum/contracts/POSTG_MIG_A07_G4AU01_GoldenConformanceAndKnowledgeOperationMigration.json"),
    readJson("../../data/project/milestones/POSTG-MIG-A07.claim.json"),
  ]);
  assert.equal(program.activeTask, TASK_ID);
  assert.equal(program.goalDistance, "D7_POST_GOLDEN_MIGRATION_G3BU08_CONFORMANT_G4AU01_ACTIVE");
  assert.equal(controller.queue.activeSourceId, SOURCE_ID);
  const conformanceRow = conformance.rows.find((row) => row.sourceId === SOURCE_ID);
  assert.equal(conformanceRow.conformanceStatus, "IN_PROGRESS_GOLDEN_NATIVE");
  assert.equal(conformanceRow.goldenProductionEligible, false);
  const row = master.rows.find((entry) => entry.sourceId === SOURCE_ID);
  assert.equal(row.unitJsonExists, true);
  assert.equal(row.knowledgeRegistryState, "VALIDATED_COMPLETE");
  assert.equal(row.knowledgePointCount, 18);
  assert.equal(row.operationModelCount, 18);
  assert.equal(row.existingQuestionBindingCount, 18);
  assert.equal(contract.candidate.evidenceLevel, "E3_SHADOW_RUNTIME_INTEGRATED");
  assert.equal(contract.candidate.productionEligibility, false);
  assert.equal(claim.actualEvidenceLevel, "E3_SHADOW_RUNTIME_INTEGRATED");
  assert.equal(claim.claims.runtimeIntegrated, true);
  assert.equal(claim.claims.productionAdmitted, false);
});
