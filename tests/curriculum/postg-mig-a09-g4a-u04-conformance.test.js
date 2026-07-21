import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  adaptGlobalPublicSourceUnitPlan,
  validateGlobalPublicSourceUnitAdapters,
} from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter.js";
import {
  G4A_U04_POSTG_TASK_ID,
  resolvePostGoldenSourceUnitAdapterDescriptor,
  validatePostGoldenSourceUnitAdapterRegistry,
} from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter-registry.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { validateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-extension.js";
import { G4A_U04_PATTERN_SPEC_IDS } from "../../site/modules/curriculum/batch-a/source-pattern-g4a-u04-extension.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const SOURCE_ID = "g4a_u04_4a04";
const TASK_ID = "POSTG-MIG-A09_G4A_U04_GoldenConformanceAndKnowledgeOperationMigration";
const KP = new Set([
  "kp_g4a_u04_4digit_by_1digit_thousands_sufficient",
  "kp_g4a_u04_4digit_by_1digit_thousands_insufficient",
  "kp_g4a_u04_4digit_by_1digit_thousands_exact",
  "kp_g4a_u04_2digit_by_2digit_ten_multiple_divisor",
  "kp_g4a_u04_3digit_by_2digit_tens_sufficient",
  "kp_g4a_u04_3digit_by_2digit_tens_insufficient",
  "kp_g4a_u04_division_check_with_remainder",
]);
const PS = new Set(G4A_U04_PATTERN_SPEC_IDS);
const PG = new Set([...KP].map((id) => id.replace(/^kp_/, "pg_")));
const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));

function plan(overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: "sourceUnit",
    questionCount: 35,
    ordering: "shuffleAcrossPatterns",
    includeAnswerKey: true,
    generationSeed: "postg-mig-a09-runtime",
    goldenContractId: "G5AU08_GOLDEN_V1",
    goldenContractVersion: "1.0.0",
    goldenRuntimeMode: "shadow",
    postGoldenMigrationTaskId: G4A_U04_POSTG_TASK_ID,
    ...overrides,
  };
}

function adapted() {
  const result = adaptGlobalPublicSourceUnitPlan(plan());
  assert.equal(result.blocked, false, JSON.stringify(result.errors));
  assert.equal(result.applied, true);
  return result.plan;
}

test("A09 authority contains seven unique KP operation models and bindings", async () => {
  const registry = await readJson("../../data/curriculum/knowledge/units/g4a_u04_4a04.knowledge-operation.json");
  assert.equal(registry.sourceId, SOURCE_ID);
  assert.equal(registry.conformanceState, "IN_PROGRESS_GOLDEN_NATIVE");
  assert.equal(registry.knowledgeRegistryState, "VALIDATED_COMPLETE");
  assert.equal(registry.review.status, "PASS");
  assert.equal(registry.knowledgePoints.length, 7);
  assert.equal(registry.knowledgePoints.flatMap((row) => row.operationModels).length, 7);
  assert.equal(registry.existingQuestionBindings.length, 7);
  assert.deepEqual(new Set(registry.knowledgePoints.map((row) => row.knowledgePointId)), KP);
  assert.deepEqual(new Set(registry.existingQuestionBindings.map((row) => row.questionId)), PS);
  assert.equal(new Set(registry.existingQuestionBindings.map((row) => row.operationModelId)).size, 7);
  assert.equal(registry.coverage.numeric, "COMPLETE");
  assert.equal(registry.coverage.application, "ABSENT");
});

test("A09 descriptor resolves seven KP PatternGroups and PatternSpecs", () => {
  const descriptor = resolvePostGoldenSourceUnitAdapterDescriptor(SOURCE_ID);
  assert.ok(descriptor);
  assert.deepEqual(descriptor.expectedCounts, { knowledgePoints: 7, patternGroups: 7, patternSpecs: 7 });
  assert.deepEqual(new Set(descriptor.knowledgePointIds), KP);
  assert.deepEqual(new Set(descriptor.patternGroupIds), PG);
  assert.deepEqual(new Set(descriptor.patternSpecIds), PS);
  assert.equal(validatePostGoldenSourceUnitAdapterRegistry().ok, true);
  assert.equal(validateGlobalPublicSourceUnitAdapters().ok, true);
});

test("A09 descriptor reuses the existing division generator G4A validator extension and S60J renderer", () => {
  const descriptor = resolvePostGoldenSourceUnitAdapterDescriptor(SOURCE_ID);
  assert.deepEqual(descriptor.goldenContractDescriptor.perUnitRuntimeLimits, {
    generator: 0, validator: 0, renderer: 0, workflow: 0,
  });
  assert.deepEqual(descriptor.goldenContractDescriptor.runtimeModules, {
    generator: "site/modules/curriculum/batch-a/g4a-u04-division-generator.js",
    validator: "site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-extension.js",
    renderer: "site/modules/renderer/html-renderer-s60j-extension.js",
  });
});

test("A09 shared route generates and validates all seven PatternSpecs", () => {
  const generated = generateBatchABrowserQuestions(adapted());
  assert.equal(generated.ok, true, JSON.stringify(generated.errors));
  assert.equal(generated.questions.length, 35);
  assert.deepEqual(new Set(generated.questions.map((question) => question.patternSpecId)), PS);
  const validation = validateBatchABrowserQuestions(generated.questions, { plan: generated.plan });
  assert.equal(validation.ok, true, JSON.stringify(validation.errors));
  assert.equal(validation.errors.length, 0);
});

test("A09 generated division witnesses preserve quotient remainder and verification invariants", () => {
  const generated = generateBatchABrowserQuestions(adapted());
  for (const question of generated.questions) {
    assert.equal(question.divisor * question.quotient + question.remainder, question.dividend);
    assert.ok(question.remainder >= 0 && question.remainder < question.divisor);
    if (question.patternSpecId === "ps_g4a_u04_division_check_with_remainder") {
      assert.ok(question.remainder > 0);
      assert.equal(question.checkValue, question.dividend);
      assert.equal(question.answerText, `${question.divisor} × ${question.quotient} + ${question.remainder} = ${question.dividend}`);
    } else {
      assert.equal(question.answerText, `商 ${question.quotient}，餘 ${question.remainder}`);
    }
  }
});

test("A09 adapter remains fail-closed without exact task authorization", () => {
  for (const taskId of [undefined, "POSTG-MIG-A10_WRONG_TASK"]) {
    const result = adaptGlobalPublicSourceUnitPlan(plan({ postGoldenMigrationTaskId: taskId }));
    assert.equal(result.applied, false);
    assert.equal(result.blocked, true);
    assert.ok(result.errors.includes("GS05_GOLDEN_UNIT_NOT_REGISTERED"));
  }
});

test("A09 selector retains seven one-to-one canonical lineages", () => {
  const visible = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SOURCE_ID);
  assert.equal(visible.length, 7);
  assert.deepEqual(new Set(visible.map((row) => row.knowledgePointId)), KP);
  const groups = visible.flatMap((row) => getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId));
  assert.equal(groups.length, 7);
  assert.deepEqual(new Set(groups.map((group) => group.patternGroupId)), PG);
  assert.deepEqual(new Set(groups.flatMap((group) => group.patternSpecIds ?? [])), PS);
});

test("A09 E3 keeps the queue active and production closed pending exact-head artifacts", async () => {
  const [program, controller, conformance, master, contract, claim] = await Promise.all([
    readJson("../../data/project/programs/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.json"),
    readJson("../../data/curriculum/golden/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.controller.json"),
    readJson("../../data/curriculum/golden/G5AU08_GOLDEN_V1.unit-conformance.json"),
    readJson("../../data/curriculum/knowledge/master/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.master-index.json"),
    readJson("../../data/curriculum/contracts/POSTG_MIG_A09_G4AU04_GoldenConformanceAndKnowledgeOperationMigration.json"),
    readJson("../../data/project/milestones/POSTG-MIG-A09.claim.json"),
  ]);
  assert.equal(program.activeTask, TASK_ID);
  assert.equal(program.goalDistance, "D5_POST_GOLDEN_MIGRATION_G4AU02_CONFORMANT_G4AU04_ACTIVE");
  assert.equal(controller.queue.activeSourceId, SOURCE_ID);
  const conformanceRow = conformance.rows.find((row) => row.sourceId === SOURCE_ID);
  assert.equal(conformanceRow.conformanceStatus, "IN_PROGRESS_GOLDEN_NATIVE");
  assert.equal(conformanceRow.goldenProductionEligible, false);
  assert.equal(conformanceRow.queueState, "ACTIVE");
  const row = master.rows.find((entry) => entry.sourceId === SOURCE_ID);
  assert.equal(row.unitJsonExists, true);
  assert.equal(row.knowledgeRegistryState, "VALIDATED_COMPLETE");
  assert.equal(row.knowledgePointCount, 7);
  assert.equal(row.operationModelCount, 7);
  assert.equal(row.existingQuestionBindingCount, 7);
  assert.equal(master.statusSummary.unitJsonExistsCount, 12);
  assert.equal(master.statusSummary.knowledgeRegistryCompleteCount, 12);
  assert.equal(contract.candidate.evidenceLevel, "E3_SHADOW_RUNTIME_INTEGRATED");
  assert.equal(contract.candidate.productionEligibility, false);
  assert.equal(contract.candidate.runtimeIntegration, "PASS_CONNECTED_TO_EXISTING_G4A_U04_SHARED_RUNTIME");
  assert.equal(claim.actualEvidenceLevel, "E3_SHADOW_RUNTIME_INTEGRATED");
  assert.equal(claim.claims.runtimeIntegrated, true);
  assert.equal(claim.claims.productionAdmitted, false);
});
