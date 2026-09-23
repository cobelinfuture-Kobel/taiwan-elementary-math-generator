import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  adaptGlobalPublicSourceUnitPlan,
  validateGlobalPublicSourceUnitAdapters,
} from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter.js";
import {
  G4A_U02_POSTG_TASK_ID,
  resolvePostGoldenSourceUnitAdapterDescriptor,
  validatePostGoldenSourceUnitAdapterRegistry,
} from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter-registry.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { validateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-extension.js";
import { G4A_U02_PRINTABLE_PATTERN_SPEC_IDS } from "../../site/modules/curriculum/batch-a/source-pattern-g4a-u02-extension.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const SOURCE_ID = "g4a_u02_4a02";
const TASK_ID = "POSTG-MIG-A08_G4A_U02_GoldenConformanceAndKnowledgeOperationMigration";
const NEXT_SOURCE_ID = "g4a_u04_4a04";
const NEXT_TASK_ID = "POSTG-MIG-A09_G4A_U04_GoldenConformanceAndKnowledgeOperationMigration";
const KP = new Set([
  "kp_g4a_u02_3digit_by_1digit_review",
  "kp_g4a_u02_4digit_by_1digit_missing_digit",
  "kp_g4a_u02_1digit_by_2digit",
  "kp_g4a_u02_1digit_by_3digit",
  "kp_g4a_u02_2digit_by_2digit",
  "kp_g4a_u02_2digit_by_3digit",
  "kp_g4a_u02_3digit_by_2digit",
  "kp_g4a_u02_digit_card_arrangement_product_max_min",
  "kp_g4a_u02_near_hundred_multiplication_strategy",
]);
const PS = new Set(G4A_U02_PRINTABLE_PATTERN_SPEC_IDS);
const PG = new Set([...KP].map((id) => id.replace(/^kp_/, "pg_")));
const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));

function plan(overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: "sourceUnit",
    questionCount: 36,
    ordering: "shuffleAcrossPatterns",
    includeAnswerKey: true,
    generationSeed: "postg-mig-a08-closeout",
    goldenContractId: "G5AU08_GOLDEN_V1",
    goldenContractVersion: "1.0.0",
    goldenRuntimeMode: "shadow",
    postGoldenMigrationTaskId: G4A_U02_POSTG_TASK_ID,
    ...overrides,
  };
}

function adapted() {
  const result = adaptGlobalPublicSourceUnitPlan(plan());
  assert.equal(result.blocked, false, JSON.stringify(result.errors));
  assert.equal(result.applied, true);
  return result.plan;
}

test("A08 authority contains nine unique KP operation models and bindings", async () => {
  const registry = await readJson("../../data/curriculum/knowledge/units/g4a_u02_4a02.knowledge-operation.json");
  assert.equal(registry.sourceId, SOURCE_ID);
  assert.equal(registry.knowledgeRegistryState, "VALIDATED_COMPLETE");
  assert.equal(registry.review.status, "PASS");
  assert.equal(registry.knowledgePoints.length, 9);
  assert.equal(registry.knowledgePoints.flatMap((row) => row.operationModels).length, 9);
  assert.equal(registry.existingQuestionBindings.length, 9);
  assert.deepEqual(new Set(registry.knowledgePoints.map((row) => row.knowledgePointId)), KP);
  assert.deepEqual(new Set(registry.existingQuestionBindings.map((row) => row.questionId)), PS);
  assert.equal(new Set(registry.existingQuestionBindings.map((row) => row.operationModelId)).size, 9);
  assert.equal(registry.coverage.numeric, "COMPLETE");
  assert.equal(registry.coverage.application, "ABSENT");
});

test("A08 descriptor resolves nine KP PatternGroups and PatternSpecs", () => {
  const descriptor = resolvePostGoldenSourceUnitAdapterDescriptor(SOURCE_ID);
  assert.deepEqual(descriptor.expectedCounts, { knowledgePoints: 9, patternGroups: 9, patternSpecs: 9 });
  assert.deepEqual(new Set(descriptor.knowledgePointIds), KP);
  assert.deepEqual(new Set(descriptor.patternGroupIds), PG);
  assert.deepEqual(new Set(descriptor.patternSpecIds), PS);
  assert.equal(validatePostGoldenSourceUnitAdapterRegistry().ok, true);
  assert.equal(validateGlobalPublicSourceUnitAdapters().ok, true);
});

test("A08 descriptor reuses existing generator G4A validator extension and S60J renderer", () => {
  const descriptor = resolvePostGoldenSourceUnitAdapterDescriptor(SOURCE_ID);
  assert.deepEqual(descriptor.goldenContractDescriptor.perUnitRuntimeLimits, {
    generator: 0, validator: 0, renderer: 0, workflow: 0,
  });
  assert.deepEqual(descriptor.goldenContractDescriptor.runtimeModules, {
    generator: "site/modules/curriculum/batch-a/g4a-u02-numeric-generator.js",
    validator: "site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-extension.js",
    renderer: "site/modules/renderer/html-renderer-s60j-extension.js",
  });
});

test("A08 shared route generates and validates all nine PatternSpecs", () => {
  const generated = generateBatchABrowserQuestions(adapted());
  assert.equal(generated.ok, true, JSON.stringify(generated.errors));
  assert.equal(generated.questions.length, 36);
  assert.deepEqual(new Set(generated.questions.map((question) => question.patternSpecId)), PS);
  const validation = validateBatchABrowserQuestions(generated.questions, { plan: generated.plan });
  assert.equal(validation.ok, true, JSON.stringify(validation.errors));
  assert.equal(validation.errors.length, 0);
});

test("A08 adapter remains fail-closed without exact task authorization", () => {
  for (const taskId of [undefined, "POSTG-MIG-A09_WRONG_TASK"]) {
    const result = adaptGlobalPublicSourceUnitPlan(plan({ postGoldenMigrationTaskId: taskId }));
    assert.equal(result.applied, false);
    assert.equal(result.blocked, true);
    assert.ok(result.errors.includes("GS05_GOLDEN_UNIT_NOT_REGISTERED"));
  }
});

test("A08 selector retains nine one-to-one canonical lineages", () => {
  const visible = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SOURCE_ID);
  assert.equal(visible.length, 9);
  assert.deepEqual(new Set(visible.map((row) => row.knowledgePointId)), KP);
  const groups = visible.flatMap((row) => getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId));
  assert.equal(groups.length, 9);
  assert.deepEqual(new Set(groups.map((group) => group.patternGroupId)), PG);
  assert.deepEqual(new Set(groups.flatMap((group) => group.patternSpecIds ?? [])), PS);
});

test("A08 E5 remains closed while the global queue advances beyond A09", async () => {
  const [program, controller, conformance, master, contract, claim, readback] = await Promise.all([
    readJson("../../data/project/programs/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.json"),
    readJson("../../data/curriculum/golden/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.controller.json"),
    readJson("../../data/curriculum/golden/G5AU08_GOLDEN_V1.unit-conformance.json"),
    readJson("../../data/curriculum/knowledge/master/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.master-index.json"),
    readJson("../../data/curriculum/contracts/POSTG_MIG_A08_G4AU02_GoldenConformanceAndKnowledgeOperationMigration.json"),
    readJson("../../data/project/milestones/POSTG-MIG-A08.claim.json"),
    readJson("../../docs/curriculum/output/postg/a08-g4a-u02/POSTG_MIG_A08_G4AU02_RUNTIME_READBACK.json"),
  ]);
  const a08Index = program.taskOrder.indexOf(TASK_ID);
  const completedIndex = program.taskOrder.indexOf(program.lastCompletedTask);
  assert.ok(completedIndex >= a08Index);
  assert.ok(program.completedCount >= 9);
  assert.equal(program.remainingCount, program.taskBudget - program.completedCount);
  assert.ok(String(program.goalDistance).startsWith(`D${program.remainingCount}_`));
  assert.ok(controller.queue.completeSourceIds.includes(SOURCE_ID));
  const closed = conformance.rows.find((row) => row.sourceId === SOURCE_ID);
  assert.equal(closed.conformanceStatus, "GOLDEN_CONFORMANT");
  assert.equal(closed.queueState, "COMPLETE");
  assert.equal(closed.goldenProductionEligible, true);
  const successor = conformance.rows.find((row) => row.sourceId === NEXT_SOURCE_ID);
  assert.ok(["ACTIVE", "COMPLETE"].includes(successor.queueState));
  assert.ok(["IN_PROGRESS_GOLDEN_NATIVE", "GOLDEN_CONFORMANT"].includes(successor.conformanceStatus));
  const masterRow = master.rows.find((row) => row.sourceId === SOURCE_ID);
  assert.equal(masterRow.conformanceStatus, "GOLDEN_CONFORMANT");
  assert.equal(masterRow.programRole, "COMPLETED_MIGRATION_UNIT");
  assert.equal(masterRow.knowledgePointCount, 9);
  assert.equal(masterRow.operationModelCount, 9);
  assert.equal(masterRow.existingQuestionBindingCount, 9);
  assert.ok(master.statusSummary.goldenConformantCount >= 11);
  assert.equal(contract.candidate.evidenceLevel, "E5_PRODUCTION_ADMITTED");
  assert.equal(contract.candidate.productionEligibility, true);
  assert.equal(claim.actualEvidenceLevel, "E5_PRODUCTION_ADMITTED");
  assert.equal(claim.claims.productionAdmitted, true);
  assert.equal(readback.verdict, "PASS_CURRENT_RUNTIME_PRODUCTION_HTML_PDF_HASH_READBACK");
  assert.equal(readback.canonicalWorksheetIdentityParity, true);
  assert.equal(readback.validator.errorCount, 0);
  assert.equal(readback.patternSpecCount, 9);
  assert.equal(program.taskOrder[a08Index + 1], NEXT_TASK_ID);
});
