import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { G4A_U02_PRINTABLE_PATTERN_SPEC_IDS } from "../../site/modules/curriculum/batch-a/source-pattern-g4a-u02-extension.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const SOURCE_ID = "g4a_u02_4a02";
const TASK_ID = "POSTG-MIG-A08_G4A_U02_GoldenConformanceAndKnowledgeOperationMigration";
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
const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));

test("A08 E2 authority contains nine unique KP operation models and bindings", async () => {
  const registry = await readJson("../../data/curriculum/knowledge/units/g4a_u02_4a02.knowledge-operation.json");
  assert.equal(registry.sourceId, SOURCE_ID);
  assert.equal(registry.conformanceState, "IN_PROGRESS_GOLDEN_NATIVE");
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

test("A08 selector authority exposes nine one-to-one KP PatternGroup PatternSpec lineages", () => {
  const visible = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SOURCE_ID);
  assert.equal(visible.length, 9);
  assert.deepEqual(new Set(visible.map((row) => row.knowledgePointId)), KP);
  const groups = visible.flatMap((row) => getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId));
  assert.equal(groups.length, 9);
  const refs = groups.flatMap((group) => group.patternSpecIds ?? []);
  assert.equal(refs.length, 9);
  assert.deepEqual(new Set(refs), PS);
});

test("A08 keeps numeric missing-digit partial-product digit-card and strategy semantics distinct", async () => {
  const registry = await readJson("../../data/curriculum/knowledge/units/g4a_u02_4a02.knowledge-operation.json");
  const bindings = Object.fromEntries(registry.existingQuestionBindings.map((row) => [row.questionId, row]));
  assert.notEqual(bindings.ps_g4a_u02_3digit_by_1digit_review.operationModelId, bindings.ps_g4a_u02_4digit_by_1digit_missing_digit.operationModelId);
  assert.notEqual(bindings.ps_g4a_u02_2digit_by_2digit.operationModelId, bindings.ps_g4a_u02_digit_card_arrangement_product_max_min.operationModelId);
  assert.notEqual(bindings.ps_g4a_u02_digit_card_arrangement_product_max_min.operationModelId, bindings.ps_g4a_u02_near_hundred_multiplication_strategy.operationModelId);
});

test("A08 does not force life stories onto direct multiplication and reasoning KP", async () => {
  const registry = await readJson("../../data/curriculum/knowledge/units/g4a_u02_4a02.knowledge-operation.json");
  assert.equal(registry.knowledgePoints.every((row) => row.applicationCapability === "NOT_APPLICABLE"), true);
  assert.equal(registry.knowledgePoints.reduce((sum, row) => sum + row.existingApplicationQuestionCount, 0), 0);
  assert.equal(registry.existingQuestionBindings.filter((row) => row.questionType === "numeric").length, 7);
  assert.equal(registry.existingQuestionBindings.filter((row) => row.questionType === "reasoning").length, 2);
});

test("A08 E2 updates the Master Index without promoting production or advancing queue", async () => {
  const [program, controller, conformance, master, contract, claim] = await Promise.all([
    readJson("../../data/project/programs/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.json"),
    readJson("../../data/curriculum/golden/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.controller.json"),
    readJson("../../data/curriculum/golden/G5AU08_GOLDEN_V1.unit-conformance.json"),
    readJson("../../data/curriculum/knowledge/master/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.master-index.json"),
    readJson("../../data/curriculum/contracts/POSTG_MIG_A08_G4AU02_GoldenConformanceAndKnowledgeOperationMigration.json"),
    readJson("../../data/project/milestones/POSTG-MIG-A08.claim.json"),
  ]);
  assert.equal(program.activeTask, TASK_ID);
  assert.equal(program.goalDistance, "D6_POST_GOLDEN_MIGRATION_G4AU01_CONFORMANT_G4AU02_ACTIVE");
  assert.equal(controller.queue.activeSourceId, SOURCE_ID);
  const conformanceRow = conformance.rows.find((row) => row.sourceId === SOURCE_ID);
  assert.equal(conformanceRow.conformanceStatus, "IN_PROGRESS_GOLDEN_NATIVE");
  assert.equal(conformanceRow.goldenProductionEligible, false);
  assert.equal(conformanceRow.queueState, "ACTIVE");
  const row = master.rows.find((entry) => entry.sourceId === SOURCE_ID);
  assert.equal(row.unitJsonExists, true);
  assert.equal(row.knowledgeRegistryState, "VALIDATED_COMPLETE");
  assert.equal(row.knowledgePointCount, 9);
  assert.equal(row.operationModelCount, 9);
  assert.equal(row.existingQuestionBindingCount, 9);
  assert.equal(master.statusSummary.unitJsonExistsCount, 11);
  assert.equal(master.statusSummary.knowledgeRegistryCompleteCount, 11);
  assert.equal(contract.candidate.evidenceLevel, "E2_CONTENT_AUTHORED");
  assert.equal(contract.candidate.productionEligibility, false);
  assert.equal(claim.actualEvidenceLevel, "E2_CONTENT_AUTHORED");
  assert.equal(claim.claims.runtimeIntegrated, false);
  assert.equal(claim.claims.productionAdmitted, false);
});
