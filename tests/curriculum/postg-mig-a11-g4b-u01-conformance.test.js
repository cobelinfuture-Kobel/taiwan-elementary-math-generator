import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  adaptGlobalPublicSourceUnitPlan,
  validateGlobalPublicSourceUnitAdapters,
} from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter.js";
import {
  G4B_U01_POSTG_TASK_ID,
  resolvePostGoldenSourceUnitAdapterDescriptor,
  validatePostGoldenSourceUnitAdapterRegistry,
} from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter-registry.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { validateG4BU01CanonicalQuestion } from "../../site/modules/curriculum/batch-a/g4b-u01-canonical-horizontal-router.js";
import {
  G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U01_PROMOTED_PATTERN_GROUP_IDS,
  G4B_U01_PROMOTED_PATTERN_SPEC_IDS,
  validateG4BU01HorizontalPromotionProjection,
} from "../../site/modules/curriculum/registry/g4b-u01-horizontal-promotion.js";

const SOURCE_ID = "g4b_u01_4b01";
const TASK_ID = "POSTG-MIG-A11_G4B_U01_GoldenConformanceAndKnowledgeOperationMigration";
const NEXT_SOURCE_ID = "g4b_u04_4b04";
const NEXT_TASK_ID = "POSTG-MIG-A12_G4B_U04_GoldenConformanceAndKnowledgeOperationMigration";
const KP = new Set(G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS);
const PG = new Set(G4B_U01_PROMOTED_PATTERN_GROUP_IDS);
const PS = new Set(G4B_U01_PROMOTED_PATTERN_SPEC_IDS);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));

function plan(overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: "sourceUnit",
    questionCount: 72,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "postg-mig-a11-runtime",
    goldenContractId: "G5AU08_GOLDEN_V1",
    goldenContractVersion: "1.0.0",
    goldenRuntimeMode: "shadow",
    postGoldenMigrationTaskId: G4B_U01_POSTG_TASK_ID,
    ...overrides,
  };
}

function adapted() {
  const result = adaptGlobalPublicSourceUnitPlan(plan());
  assert.equal(result.blocked, false, JSON.stringify(result.errors));
  assert.equal(result.applied, true);
  return result.plan;
}

test("A11 authority registers nine KnowledgePoints nine models and twelve numeric bindings", async () => {
  const registry = await readJson("../../data/curriculum/knowledge/units/g4b_u01_4b01.knowledge-operation.json");
  assert.equal(registry.sourceId, SOURCE_ID);
  assert.ok(["IN_PROGRESS_GOLDEN_NATIVE", "GOLDEN_CONFORMANT"].includes(registry.conformanceState));
  assert.equal(registry.knowledgeRegistryState, "VALIDATED_COMPLETE");
  assert.equal(registry.review.status, "PASS");
  assert.equal(registry.knowledgePoints.length, 9);
  assert.equal(registry.knowledgePoints.flatMap((row) => row.operationModels).length, 9);
  assert.equal(registry.existingQuestionBindings.length, 12);
  assert.deepEqual(new Set(registry.knowledgePoints.map((row) => row.knowledgePointId)), KP);
  assert.deepEqual(new Set(registry.existingQuestionBindings.map((row) => row.questionId)), PS);
  assert.equal(new Set(registry.existingQuestionBindings.map((row) => row.operationModelId)).size, 9);
  assert.equal(registry.knowledgePoints.reduce((sum, row) => sum + row.existingNumericQuestionCount, 0), 12);
  assert.equal(registry.knowledgePoints.reduce((sum, row) => sum + row.existingApplicationQuestionCount, 0), 0);
  assert.deepEqual(registry.coverage, { numeric: "COMPLETE", application: "NOT_APPLICABLE" });
  assert.ok(registry.knowledgePoints.every((row) => row.applicationCapability === "NOT_APPLICABLE"));
});

test("A11 descriptor resolves the exact 9 by 9 by 12 production authority", () => {
  const descriptor = resolvePostGoldenSourceUnitAdapterDescriptor(SOURCE_ID);
  assert.ok(descriptor);
  assert.equal(descriptor.taskId, TASK_ID);
  assert.deepEqual(descriptor.expectedCounts, { knowledgePoints: 9, patternGroups: 9, patternSpecs: 12 });
  assert.deepEqual(new Set(descriptor.knowledgePointIds), KP);
  assert.deepEqual(new Set(descriptor.patternGroupIds), PG);
  assert.deepEqual(new Set(descriptor.patternSpecIds), PS);
  assert.equal(validateG4BU01HorizontalPromotionProjection().ok, true);
  assert.equal(validatePostGoldenSourceUnitAdapterRegistry().ok, true);
  assert.equal(validateGlobalPublicSourceUnitAdapters().ok, true);
});

test("A11 descriptor reuses S59 generator validator worksheet and horizontal renderer", () => {
  const descriptor = resolvePostGoldenSourceUnitAdapterDescriptor(SOURCE_ID);
  assert.deepEqual(descriptor.goldenContractDescriptor.perUnitRuntimeLimits, {
    generator: 0, validator: 0, renderer: 0, workflow: 0,
  });
  const modules = descriptor.goldenContractDescriptor.runtimeModules;
  assert.ok(modules.generator.includes("site/modules/curriculum/batch-a/g4b-u01-canonical-horizontal-router.js"));
  assert.ok(modules.validator.includes("site/modules/curriculum/batch-a/g4b-u01-horizontal-validator.js"));
  assert.equal(modules.renderer, "site/modules/renderer/html-renderer-s59h-extension.js");
});

test("A11 source-unit route generates and validates all twelve PatternSpecs", () => {
  const generated = generateBatchABrowserQuestions(adapted());
  assert.equal(generated.ok, true, JSON.stringify(generated.errors));
  assert.equal(generated.questions.length, 72);
  assert.deepEqual(new Set(generated.questions.map((row) => row.knowledgePointId)), KP);
  assert.deepEqual(new Set(generated.questions.map((row) => row.resolvedPatternGroupId ?? row.patternGroupId)), PG);
  assert.deepEqual(new Set(generated.questions.map((row) => row.patternSpecId)), PS);
  assert.ok(generated.questions.every((row) => row.sourceId === SOURCE_ID && row.metadata?.sourceId === SOURCE_ID));
  assert.ok(generated.questions.every((row) => row.representation === "horizontal_only" && row.applicationText === false));
  const errors = generated.questions.flatMap((question, index) => (
    validateG4BU01CanonicalQuestion(question).errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` }))
  ));
  assert.deepEqual(errors, []);
});

test("A11 adapter remains fail-closed without exact task authorization", () => {
  for (const taskId of [undefined, "POSTG-MIG-A12_WRONG_TASK"]) {
    const result = adaptGlobalPublicSourceUnitPlan(plan({ postGoldenMigrationTaskId: taskId }));
    assert.equal(result.applied, false);
    assert.equal(result.blocked, true);
    assert.ok(result.errors.includes("GS05_GOLDEN_UNIT_NOT_REGISTERED"));
  }
});

test("A11 candidate or closeout state remains exactly one authorized queue transition", async () => {
  const [program, conformance, master, contract, claim] = await Promise.all([
    readJson("../../data/project/programs/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.json"),
    readJson("../../data/curriculum/golden/G5AU08_GOLDEN_V1.unit-conformance.json"),
    readJson("../../data/curriculum/knowledge/master/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.master-index.json"),
    readJson("../../data/curriculum/contracts/POSTG_MIG_A11_G4BU01_GoldenConformanceAndKnowledgeOperationMigration.json"),
    readJson("../../data/project/milestones/POSTG-MIG-A11.claim.json"),
  ]);
  const row = conformance.rows.find((entry) => entry.sourceId === SOURCE_ID);
  const masterRow = master.rows.find((entry) => entry.sourceId === SOURCE_ID);
  const candidate = program.activeTask === TASK_ID && row.queueState === "ACTIVE";
  const closeout = program.lastCompletedTask === TASK_ID && row.queueState === "COMPLETE";
  assert.equal(candidate || closeout, true);
  assert.equal(masterRow.assignedKnowledgeRegistryTaskId, TASK_ID);
  assert.equal(masterRow.unitJsonExists, true);
  assert.equal(masterRow.knowledgePointCount, 9);
  assert.equal(masterRow.operationModelCount, 9);
  assert.equal(masterRow.existingQuestionBindingCount, 12);
  assert.equal(contract.taskId, TASK_ID);
  assert.equal(claim.taskId, TASK_ID);
  if (candidate) {
    assert.equal(row.conformanceStatus, "IN_PROGRESS_GOLDEN_NATIVE");
    assert.equal(row.goldenProductionEligible, false);
    assert.equal(contract.candidate.evidenceLevel, "E3_SHADOW_RUNTIME_INTEGRATED");
    assert.equal(claim.actualEvidenceLevel, "E3_SHADOW_RUNTIME_INTEGRATED");
  } else {
    const nextRow = conformance.rows.find((entry) => entry.sourceId === NEXT_SOURCE_ID);
    const nextMasterRow = master.rows.find((entry) => entry.sourceId === NEXT_SOURCE_ID);
    assert.equal(row.conformanceStatus, "GOLDEN_CONFORMANT");
    assert.equal(row.goldenProductionEligible, true);
    assert.equal(masterRow.conformanceStatus, "GOLDEN_CONFORMANT");
    assert.equal(masterRow.programRole, "COMPLETED_MIGRATION_UNIT");
    assert.equal(contract.candidate.evidenceLevel, "E5_PRODUCTION_ADMITTED");
    assert.equal(claim.actualEvidenceLevel, "E5_PRODUCTION_ADMITTED");
    assert.equal(program.activeTask, NEXT_TASK_ID);
    assert.equal(program.nextAllowedTask, NEXT_TASK_ID);
    assert.equal(nextRow.conformanceStatus, "IN_PROGRESS_GOLDEN_NATIVE");
    assert.equal(nextRow.queueState, "ACTIVE");
    assert.equal(nextRow.queueOrdinal, 0);
    assert.equal(nextMasterRow.programRole, "ACTIVE_MIGRATION_UNIT");
    assert.equal(nextMasterRow.queueState, "ACTIVE");
  }
});
