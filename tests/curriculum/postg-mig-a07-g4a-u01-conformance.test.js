import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

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
const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));

test("A07 E2 authority contains eighteen unique KP operation models and bindings", async () => {
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

test("A07 preserves distinct comparison place-value reasoning arithmetic and application models", async () => {
  const registry = await readJson("../../data/curriculum/knowledge/units/g4a_u01_4a01.knowledge-operation.json");
  const bindings = Object.fromEntries(registry.existingQuestionBindings.map((row) => [row.questionId, row]));
  assert.notEqual(bindings.ps_g4a_u01_compare_8digit.operationModelId, bindings.ps_g4a_u01_compare_first_different_place.operationModelId);
  assert.notEqual(bindings.ps_g4a_u01_8digit_place_value_decomposition.operationModelId, bindings.ps_g4a_u01_place_value_composition_to_number.operationModelId);
  assert.notEqual(bindings.ps_g4a_u01_large_number_add_sub.operationModelId, bindings.ps_g4a_u01_large_number_unit_word_problem_add_subtract.operationModelId);
  assert.notEqual(bindings.ps_g4a_u01_comparison_word_problem_total.operationModelId, bindings.ps_g4a_u01_digit_arrangement_max_min.operationModelId);
});

test("A07 application capability is explicit and does not force stories onto all large-number KP", async () => {
  const registry = await readJson("../../data/curriculum/knowledge/units/g4a_u01_4a01.knowledge-operation.json");
  const byId = Object.fromEntries(registry.knowledgePoints.map((row) => [row.knowledgePointId, row]));
  assert.equal(byId.kp_g4a_u01_comparison_word_problem_total.applicationCapability, "REQUIRED");
  assert.equal(byId.kp_g4a_u01_large_number_unit_word_problem_add_subtract.applicationCapability, "REQUIRED");
  assert.equal(byId.kp_g4a_u01_digit_arrangement_max_min.applicationCapability, "OPTIONAL");
  assert.equal(byId.kp_g4a_u01_8digit_place_value_decomposition.applicationCapability, "NOT_APPLICABLE");
});

test("A07 E2 updates the Master Index without promoting production", async () => {
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
  assert.equal(master.statusSummary.unitJsonExistsCount, 10);
  assert.equal(master.statusSummary.knowledgeRegistryCompleteCount, 10);
  assert.equal(contract.candidate.evidenceLevel, "E2_CONTENT_AUTHORED");
  assert.equal(contract.candidate.productionEligibility, false);
  assert.equal(claim.actualEvidenceLevel, "E2_CONTENT_AUTHORED");
  assert.equal(claim.claims.runtimeIntegrated, false);
  assert.equal(claim.claims.productionAdmitted, false);
});
