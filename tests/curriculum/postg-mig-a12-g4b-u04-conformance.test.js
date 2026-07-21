import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  adaptGlobalPublicSourceUnitPlan,
  validateGlobalPublicSourceUnitAdapters,
} from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter.js";
import {
  G4B_U04_POSTG_TASK_ID,
  resolveGlobalPublicSourceUnitAdapterDescriptor,
  resolvePostGoldenSourceUnitAdapterDescriptor,
  validatePostGoldenSourceUnitAdapterRegistry,
} from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter-registry.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import {
  validateG4BU04CanonicalQuestion,
} from "../../site/modules/curriculum/batch-b/g4b-u04-canonical-router.js";
import {
  normalizeG4BU04PromptSignature,
} from "../../site/modules/curriculum/batch-b/g4b-u04-prompt-deduplication.js";
import {
  G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U04_PROMOTED_PATTERN_GROUP_IDS,
  G4B_U04_PROMOTED_PATTERN_SPEC_IDS,
  validateG4BU04PromotionProjection,
} from "../../site/modules/curriculum/registry/g4b-u04-promotion.js";
import {
  validateG4BU04ProductionPromotionProjection,
} from "../../site/modules/curriculum/registry/g4b-u04-production-promotion.js";

const SOURCE_ID = "g4b_u04_4b04";
const TASK_ID = "POSTG-MIG-A12_G4B_U04_GoldenConformanceAndKnowledgeOperationMigration";
const KP = new Set(G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS);
const PG = new Set(G4B_U04_PROMOTED_PATTERN_GROUP_IDS);
const PS = new Set(G4B_U04_PROMOTED_PATTERN_SPEC_IDS);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));

function plan(overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: "sourceUnit",
    questionCount: 68,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "postg-mig-a12-runtime",
    goldenContractId: "G5AU08_GOLDEN_V1",
    goldenContractVersion: "1.0.0",
    goldenRuntimeMode: "shadow",
    postGoldenMigrationTaskId: G4B_U04_POSTG_TASK_ID,
    ...overrides,
  };
}

function adapted() {
  const result = adaptGlobalPublicSourceUnitPlan(plan());
  assert.equal(result.blocked, false, JSON.stringify(result.errors));
  assert.equal(result.applied, true);
  assert.equal(result.adapter.adapterId, "g4b_u04_postg_golden_shared_runtime");
  return result.plan;
}

test("A12 authority registers 13 KnowledgePoints 13 models and 19 effective bindings", async () => {
  const registry = await readJson("../../data/curriculum/knowledge/units/g4b_u04_4b04.knowledge-operation.json");
  assert.equal(registry.sourceId, SOURCE_ID);
  assert.ok(["IN_PROGRESS_GOLDEN_NATIVE", "GOLDEN_CONFORMANT"].includes(registry.conformanceState));
  assert.equal(registry.knowledgeRegistryState, "VALIDATED_COMPLETE");
  assert.equal(registry.review.status, "PASS");
  assert.equal(registry.knowledgePoints.length, 13);
  assert.equal(registry.knowledgePoints.flatMap((row) => row.operationModels).length, 13);
  assert.equal(registry.existingQuestionBindings.length, 19);
  assert.deepEqual(new Set(registry.knowledgePoints.map((row) => row.knowledgePointId)), KP);
  assert.deepEqual(new Set(registry.existingQuestionBindings.map((row) => row.questionId)), PS);
  assert.equal(new Set(registry.existingQuestionBindings.map((row) => row.operationModelId)).size, 13);
  assert.equal(registry.knowledgePoints.reduce((sum, row) => sum + row.existingNumericQuestionCount, 0), 9);
  assert.equal(registry.knowledgePoints.reduce((sum, row) => sum + row.existingApplicationQuestionCount, 0), 10);
  assert.deepEqual(registry.coverage, { numeric: "COMPLETE", application: "COMPLETE" });
  assert.equal(registry.knowledgePoints.filter((row) => row.applicationCapability === "REQUIRED").length, 5);
});

test("A12 descriptor resolves the exact effective 13 by 13 by 19 authority", () => {
  const descriptor = resolvePostGoldenSourceUnitAdapterDescriptor(SOURCE_ID);
  assert.ok(descriptor);
  assert.equal(descriptor.taskId, TASK_ID);
  assert.deepEqual(descriptor.expectedCounts, { knowledgePoints: 13, patternGroups: 13, patternSpecs: 19 });
  assert.deepEqual(new Set(descriptor.knowledgePointIds), KP);
  assert.deepEqual(new Set(descriptor.patternGroupIds), PG);
  assert.deepEqual(new Set(descriptor.patternSpecIds), PS);
  assert.equal(validateG4BU04PromotionProjection().ok, true);
  assert.equal(validateG4BU04ProductionPromotionProjection().ok, true);
  assert.equal(validatePostGoldenSourceUnitAdapterRegistry().ok, true);
  assert.equal(validateGlobalPublicSourceUnitAdapters().ok, true);
});

test("A12 keeps public base behavior but selects POSTG descriptor for exact authorization", () => {
  const publicDescriptor = resolveGlobalPublicSourceUnitAdapterDescriptor(SOURCE_ID);
  assert.equal(publicDescriptor.adapterId, "g4b_u04_all_promoted_canonical");
  const publicResult = adaptGlobalPublicSourceUnitPlan({
    sourceId: SOURCE_ID,
    selectionMode: "sourceUnit",
    questionCount: 19,
  });
  assert.equal(publicResult.applied, true);
  assert.equal(publicResult.adapter.adapterId, "g4b_u04_all_promoted_canonical");
  assert.equal(publicResult.plan.goldenRuntimeConsumer, undefined);

  const goldenResult = adaptGlobalPublicSourceUnitPlan(plan());
  assert.equal(goldenResult.applied, true);
  assert.equal(goldenResult.adapter.adapterId, "g4b_u04_postg_golden_shared_runtime");
  assert.equal(goldenResult.plan.goldenRuntimeConsumer.descriptorMode, "post_golden_unit_conformance");
  assert.equal(goldenResult.plan.sourceUnitAdapter.postGoldenMigrationTaskId, TASK_ID);
});

test("A12 source-unit route generates all 19 PatternSpecs without duplicate prompts", () => {
  const generated = generateBatchABrowserQuestions(adapted());
  assert.equal(generated.ok, true, JSON.stringify(generated.errors));
  assert.equal(generated.questions.length, 68);
  assert.deepEqual(new Set(generated.questions.map((row) => row.knowledgePointId)), KP);
  assert.deepEqual(new Set(generated.questions.map((row) => row.resolvedPatternGroupId ?? row.patternGroupId)), PG);
  assert.deepEqual(new Set(generated.questions.map((row) => row.patternSpecId)), PS);
  assert.ok(generated.questions.every((row) => row.sourceId === SOURCE_ID));
  const errors = generated.questions.flatMap((question, index) => (
    validateG4BU04CanonicalQuestion(question).errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` }))
  ));
  assert.deepEqual(errors, []);
  const signatures = generated.questions.map((row) => normalizeG4BU04PromptSignature(row.promptText));
  assert.equal(new Set(signatures).size, signatures.length);
});

test("A12 adapter fails closed for missing or mismatched task authorization", () => {
  for (const taskId of [undefined, "POSTG-MIG-A13_WRONG_TASK"]) {
    const result = adaptGlobalPublicSourceUnitPlan(plan({ postGoldenMigrationTaskId: taskId }));
    assert.equal(result.applied, false);
    assert.equal(result.blocked, true);
    assert.ok(result.errors.includes("GS05_GOLDEN_UNIT_NOT_REGISTERED"));
  }
});

test("A12 candidate or closeout state remains the only active migration transition", async () => {
  const [program, conformance, master, contract, claim] = await Promise.all([
    readJson("../../data/project/programs/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.json"),
    readJson("../../data/curriculum/golden/G5AU08_GOLDEN_V1.unit-conformance.json"),
    readJson("../../data/curriculum/knowledge/master/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.master-index.json"),
    readJson("../../data/curriculum/contracts/POSTG_MIG_A12_G4BU04_GoldenConformanceAndKnowledgeOperationMigration.json"),
    readJson("../../data/project/milestones/POSTG-MIG-A12.claim.json"),
  ]);
  const row = conformance.rows.find((entry) => entry.sourceId === SOURCE_ID);
  const masterRow = master.rows.find((entry) => entry.sourceId === SOURCE_ID);
  const candidate = program.activeTask === TASK_ID && row.queueState === "ACTIVE";
  const closeout = program.lastCompletedTask === TASK_ID && row.queueState === "COMPLETE";
  assert.equal(candidate || closeout, true);
  assert.equal(masterRow.assignedKnowledgeRegistryTaskId, TASK_ID);
  assert.equal(contract.taskId, TASK_ID);
  assert.equal(claim.taskId, TASK_ID);
  if (candidate) {
    assert.equal(row.conformanceStatus, "IN_PROGRESS_GOLDEN_NATIVE");
    assert.equal(row.goldenProductionEligible, false);
    assert.equal(contract.candidate.evidenceLevel, "E3_SHADOW_RUNTIME_INTEGRATED");
    assert.equal(claim.actualEvidenceLevel, "E3_SHADOW_RUNTIME_INTEGRATED");
  } else {
    assert.equal(row.conformanceStatus, "GOLDEN_CONFORMANT");
    assert.equal(row.goldenProductionEligible, true);
    assert.equal(masterRow.queueState, "COMPLETE");
    assert.equal(masterRow.programRole, "COMPLETED_MIGRATION_UNIT");
    assert.equal(masterRow.unitJsonExists, true);
    assert.equal(masterRow.knowledgePointCount, 13);
    assert.equal(masterRow.operationModelCount, 13);
    assert.equal(masterRow.existingQuestionBindingCount, 19);
    assert.equal(contract.candidate.evidenceLevel, "E5_PRODUCTION_ADMITTED");
    assert.equal(claim.actualEvidenceLevel, "E5_PRODUCTION_ADMITTED");
  }
});
