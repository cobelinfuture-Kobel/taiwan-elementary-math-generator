import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  adaptGlobalPublicSourceUnitPlan,
  validateGlobalPublicSourceUnitAdapters,
} from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter.js";
import {
  G4A_U08_POSTG_TASK_ID,
  resolvePostGoldenSourceUnitAdapterDescriptor,
  validatePostGoldenSourceUnitAdapterRegistry,
} from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter-registry.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { validateG4AU08AllCanonicalPublicQuestion } from "../../site/modules/curriculum/batch-a/g4a-u08-all-canonical-public-router.js";
import {
  G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS,
  getVisiblePatternGroupsForKnowledgePoint,
} from "../../site/modules/curriculum/registry/batch-a-selector-g4a-u08-all-canonical.js";

const SOURCE_ID = "g4a_u08_4a08";
const TASK_ID = "POSTG-MIG-A10_G4A_U08_GoldenConformanceAndKnowledgeOperationMigration";
const KP = new Set(G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS.map((row) => row.primaryKnowledgePointId));
const PG = new Set(G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS.map((row) => row.patternGroupId));
const PS = new Set(G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS.flatMap((row) => row.patternSpecIds));
const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));

function plan(overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: "sourceUnit",
    questionCount: 112,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "postg-mig-a10-runtime",
    goldenContractId: "G5AU08_GOLDEN_V1",
    goldenContractVersion: "1.0.0",
    goldenRuntimeMode: "shadow",
    postGoldenMigrationTaskId: G4A_U08_POSTG_TASK_ID,
    ...overrides,
  };
}

function adapted() {
  const result = adaptGlobalPublicSourceUnitPlan(plan());
  assert.equal(result.blocked, false, JSON.stringify(result.errors));
  assert.equal(result.applied, true);
  return result.plan;
}

test("A10 authority registers all 15 KnowledgePoints 15 models and 33 bindings", async () => {
  const registry = await readJson("../../data/curriculum/knowledge/units/g4a_u08_4a08.knowledge-operation.json");
  assert.equal(registry.sourceId, SOURCE_ID);
  assert.ok(["IN_PROGRESS_GOLDEN_NATIVE", "GOLDEN_CONFORMANT"].includes(registry.conformanceState));
  assert.equal(registry.knowledgeRegistryState, "VALIDATED_COMPLETE");
  assert.equal(registry.knowledgePoints.length, 15);
  assert.equal(registry.knowledgePoints.flatMap((row) => row.operationModels).length, 15);
  assert.equal(registry.existingQuestionBindings.length, 33);
  assert.deepEqual(new Set(registry.knowledgePoints.map((row) => row.knowledgePointId)), KP);
  assert.deepEqual(new Set(registry.existingQuestionBindings.map((row) => row.questionId)), PS);
  assert.equal(new Set(registry.existingQuestionBindings.map((row) => row.operationModelId)).size, 15);
  assert.equal(registry.knowledgePoints.reduce((sum, row) => sum + row.existingNumericQuestionCount, 0), 16);
  assert.equal(registry.knowledgePoints.reduce((sum, row) => sum + row.existingApplicationQuestionCount, 0), 17);
  assert.deepEqual(registry.coverage, { numeric: "COMPLETE", application: "COMPLETE" });
});

test("A10 descriptor resolves the exact 15 by 28 by 33 shared authority", () => {
  const descriptor = resolvePostGoldenSourceUnitAdapterDescriptor(SOURCE_ID);
  assert.ok(descriptor);
  assert.equal(descriptor.taskId, TASK_ID);
  assert.deepEqual(descriptor.expectedCounts, { knowledgePoints: 15, patternGroups: 28, patternSpecs: 33 });
  assert.deepEqual(new Set(descriptor.knowledgePointIds), KP);
  assert.deepEqual(new Set(descriptor.patternGroupIds), PG);
  assert.deepEqual(new Set(descriptor.patternSpecIds), PS);
  assert.equal(validatePostGoldenSourceUnitAdapterRegistry().ok, true);
  assert.equal(validateGlobalPublicSourceUnitAdapters().ok, true);
});

test("A10 descriptor reuses existing G4A-U08 runtime and the shared S60J renderer", () => {
  const descriptor = resolvePostGoldenSourceUnitAdapterDescriptor(SOURCE_ID);
  assert.deepEqual(descriptor.goldenContractDescriptor.perUnitRuntimeLimits, {
    generator: 0, validator: 0, renderer: 0, workflow: 0,
  });
  const modules = descriptor.goldenContractDescriptor.runtimeModules;
  assert.ok(Array.isArray(modules.generator));
  assert.ok(modules.generator.includes("site/modules/curriculum/batch-a/g4a-u08-all-canonical-public-router.js"));
  assert.ok(Array.isArray(modules.validator));
  assert.ok(modules.validator.includes("site/modules/curriculum/batch-a/g4a-u08-numeric-canonical-browser-validator.js"));
  assert.equal(modules.renderer, "site/modules/renderer/html-renderer-s60j-extension.js");
});

test("A10 source-unit route generates and validates all 33 PatternSpecs", () => {
  const generated = generateBatchABrowserQuestions(adapted());
  assert.equal(generated.ok, true, JSON.stringify(generated.errors));
  assert.equal(generated.questions.length, 112);
  assert.deepEqual(new Set(generated.questions.map((row) => row.knowledgePointId)), KP);
  assert.deepEqual(new Set(generated.questions.map((row) => row.resolvedPatternGroupId ?? row.patternGroupId)), PG);
  assert.deepEqual(new Set(generated.questions.map((row) => row.patternSpecId)), PS);
  assert.ok(generated.questions.every((row) => row.sourceId === SOURCE_ID && row.metadata?.sourceId === SOURCE_ID));
  const validationErrors = generated.questions.flatMap((question, index) => (
    validateG4AU08AllCanonicalPublicQuestion(question).errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` }))
  ));
  assert.deepEqual(validationErrors, []);
});

test("A10 canonical authority retains all KP to PatternGroup to PatternSpec lineages", () => {
  const groups = [...KP].flatMap((knowledgePointId) => getVisiblePatternGroupsForKnowledgePoint(knowledgePointId));
  assert.equal(groups.length, 28);
  assert.deepEqual(new Set(groups.map((row) => row.patternGroupId)), PG);
  assert.deepEqual(new Set(groups.flatMap((row) => row.patternSpecIds ?? [])), PS);
});

test("A10 adapter remains fail-closed without exact task authorization", () => {
  for (const taskId of [undefined, "POSTG-MIG-A11_WRONG_TASK"]) {
    const result = adaptGlobalPublicSourceUnitPlan(plan({ postGoldenMigrationTaskId: taskId }));
    assert.equal(result.applied, false);
    assert.equal(result.blocked, true);
    assert.ok(result.errors.includes("GS05_GOLDEN_UNIT_NOT_REGISTERED"));
  }
});

test("A10 candidate or permanently closed state remains authorized as the queue advances", async () => {
  const [program, conformance, master, contract, claim] = await Promise.all([
    readJson("../../data/project/programs/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.json"),
    readJson("../../data/curriculum/golden/G5AU08_GOLDEN_V1.unit-conformance.json"),
    readJson("../../data/curriculum/knowledge/master/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.master-index.json"),
    readJson("../../data/curriculum/contracts/POSTG_MIG_A10_G4AU08_GoldenConformanceAndKnowledgeOperationMigration.json"),
    readJson("../../data/project/milestones/POSTG-MIG-A10.claim.json"),
  ]);
  const row = conformance.rows.find((entry) => entry.sourceId === SOURCE_ID);
  const masterRow = master.rows.find((entry) => entry.sourceId === SOURCE_ID);
  const taskIndex = program.taskOrder.indexOf(TASK_ID);
  const lastCompletedIndex = program.taskOrder.indexOf(program.lastCompletedTask);
  const candidate = program.activeTask === TASK_ID && row.queueState === "ACTIVE";
  const permanentlyClosed = row.queueState === "COMPLETE"
    && row.conformanceStatus === "GOLDEN_CONFORMANT"
    && lastCompletedIndex >= taskIndex;
  assert.equal(candidate || permanentlyClosed, true);
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
    assert.equal(masterRow.knowledgePointCount, 15);
    assert.equal(masterRow.operationModelCount, 15);
    assert.equal(masterRow.existingQuestionBindingCount, 33);
    assert.equal(contract.candidate.evidenceLevel, "E5_PRODUCTION_ADMITTED");
    assert.equal(claim.actualEvidenceLevel, "E5_PRODUCTION_ADMITTED");
  }
});
