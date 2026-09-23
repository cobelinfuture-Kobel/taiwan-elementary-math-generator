import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  PATH1_P1_01_KNOWLEDGE_POINT_ID,
} from "../../site/modules/curriculum/learning-paths/path1-p1-01-diversity.js";
import {
  PATH1_P1_02_KNOWLEDGE_POINT_IDS,
} from "../../site/modules/curriculum/learning-paths/path1-p1-02-diversity.js";

const readJson = (path) => JSON.parse(fs.readFileSync(path, "utf8"));

const CONTRACT_PATH = "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_EQUAL_GROUPS_TRANSFER_CONTRACT_V1.json";
const MATRIX_PATH = "data/curriculum/learning-paths/path1-integer-foundations.curriculum-matrix.json";
const EQUAL_GROUPS_PATH = "data/curriculum/knowledge/units/g3b_u08_3b08.knowledge-operation.json";
const CONTEXT_BINDING_PATH = "data/curriculum/application/registry/application-context-bindings.json";
const ADMISSION_PATH = "data/curriculum/application/registry/application-admission-registry.json";

const contract = readJson(CONTRACT_PATH);
const matrix = readJson(MATRIX_PATH);
const equalGroupsAuthority = readJson(EQUAL_GROUPS_PATH);
const contextBindings = readJson(CONTEXT_BINDING_PATH);
const admissions = readJson(ADMISSION_PATH);

function block(blockId) {
  return matrix.blocks.find((entry) => entry.blockId === blockId);
}

function transferBlock(blockId) {
  return contract.pathBlockContracts.find((entry) => entry.blockId === blockId);
}

test("contract is planning-only and bounded to P1-01/P1-02", () => {
  assert.equal(contract.status, "READ_ONLY_PLANNING_CONTRACT_LOCKED");
  assert.equal(contract.implementationAllowed, false);
  assert.equal(contract.publicCutoverAllowed, false);
  assert.equal(contract.generatorModificationAllowed, false);
  assert.equal(contract.validatorModificationAllowed, false);
  assert.equal(contract.publicRuntimeModificationAllowed, false);
  assert.deepEqual(contract.scope.includedPathBlocks, ["P1-01", "P1-02"]);
  assert.deepEqual(contract.scope.excludedPathBlocks, ["P1-03", "P1-04"]);
  assert.equal(contract.newCanonicalKnowledgePointMinted, false);
});

test("equal-groups authority and unknown-role boundary match G3B-U08 and P1-12", () => {
  const kp = equalGroupsAuthority.knowledgePoints.find(
    (entry) => entry.knowledgePointId === "kp_g3b_u08_total_from_groups",
  );
  assert.ok(kp);
  const operation = kp.operationModels.find(
    (entry) => entry.modelId === "op_g3b_u08_total_from_groups",
  );
  assert.ok(operation);
  assert.ok(operation.canonicalExpressions.includes("totalAmount = amountPerGroup * groupCount"));
  assert.deepEqual(operation.unknownRoles, ["totalAmount"]);
  assert.ok(operation.numberConstraints.includes("groupCount is a positive one-digit integer"));
  assert.ok(operation.numberConstraints.includes("totalAmount <= 999"));

  assert.equal(contract.relationContract.relationId, "R03_EQUAL_GROUPS");
  assert.equal(contract.relationContract.relationKnowledgePointId, kp.knowledgePointId);
  assert.equal(contract.relationContract.operationModelId, operation.modelId);
  assert.deepEqual(contract.relationContract.allowedUnknownRoles, ["totalAmount"]);
  assert.deepEqual(contract.relationContract.forbiddenUnknownRoles, ["groupCount", "amountPerGroup"]);
  assert.equal(contract.relationContract.forbiddenUnknownRoleDisposition, "DEFER_TO_P1_12");

  const p112 = block("P1-12");
  assert.ok(p112);
  assert.deepEqual(p112.primaryKnowledgePointIds, [
    "kp_g3b_u08_total_from_groups",
    "kp_g3b_u08_group_count_from_total",
    "kp_g3b_u08_per_group_from_total",
  ]);
});

test("arithmetic roles are bound semantically and are not commutatively swapped", () => {
  assert.equal(contract.arithmeticToRelationRoleBinding.multiplicand, "amountPerGroup");
  assert.equal(contract.arithmeticToRelationRoleBinding.oneDigitMultiplier, "groupCount");
  assert.equal(contract.arithmeticToRelationRoleBinding.product, "totalAmount");
  assert.equal(contract.arithmeticToRelationRoleBinding.commutativeArithmeticRoleSwapAllowed, false);
});

test("P1-01 and P1-02 arithmetic KP bindings stay exact", () => {
  assert.equal(PATH1_P1_01_KNOWLEDGE_POINT_ID, "kp_g3a_u03_10_multiple_by_1digit");
  assert.deepEqual(PATH1_P1_02_KNOWLEDGE_POINT_IDS, [
    "kp_g3a_u03_2digit_by_1digit_carry",
    "kp_g3a_u03_3digit_by_1digit",
  ]);

  assert.deepEqual(transferBlock("P1-01").arithmeticKnowledgePointIds, block("P1-01").primaryKnowledgePointIds);
  assert.deepEqual(transferBlock("P1-02").arithmeticKnowledgePointIds, block("P1-02").primaryKnowledgePointIds);
  assert.equal(transferBlock("P1-01").transferRelationKnowledgePointId, "kp_g3b_u08_total_from_groups");
  assert.equal(transferBlock("P1-02").transferRelationKnowledgePointId, "kp_g3b_u08_total_from_groups");
});

test("numeric envelope is full for P1-01 and P1-02 two-digit, bounded for P1-02 three-digit", () => {
  const p101 = transferBlock("P1-01");
  assert.equal(p101.transferCoverage, "FULL_CURRENT_ARITHMETIC_DOMAIN");
  assert.equal(90 * 9, 810);
  assert.ok(810 <= 999);

  const p102 = transferBlock("P1-02");
  const twoDigit = p102.subcontracts.find(
    (entry) => entry.arithmeticKnowledgePointId === "kp_g3a_u03_2digit_by_1digit_carry",
  );
  const threeDigit = p102.subcontracts.find(
    (entry) => entry.arithmeticKnowledgePointId === "kp_g3a_u03_3digit_by_1digit",
  );
  assert.equal(twoDigit.transferCoverage, "FULL_CURRENT_ARITHMETIC_DOMAIN");
  assert.equal(99 * 9, 891);
  assert.ok(891 <= 999);
  assert.equal(threeDigit.transferCoverage, "BOUNDED_SUBSET_ONLY");
  assert.equal(threeDigit.numericEnvelope.exactAdditionalGuard, "amountPerGroup <= floor(999 / groupCount)");

  const witness = threeDigit.exampleWitness.roleBindings;
  assert.equal(witness.amountPerGroup * witness.groupCount, witness.totalAmount);
  assert.ok(witness.totalAmount <= 999);
  const forbidden = threeDigit.forbiddenWitness;
  assert.ok(forbidden.amountPerGroup * forbidden.groupCount > 999);
});

test("LD0 transfer pipeline requires modeling before arithmetic and preserves answer units", () => {
  assert.deepEqual(contract.modelingPipeline.map((entry) => entry.stageId), [
    "WP01_QUANTITY_EXTRACTION",
    "WP02_QUANTITY_TYPING_AND_UNIT_FLOW",
    "WP03_ROLE_ASSIGNMENT",
    "WP04_RELATION_RECOGNITION",
    "WP05_UNKNOWN_ROLE_IDENTIFICATION",
    "WP06_EQUATION_CONSTRUCTION",
    "WP07_ARITHMETIC_EXECUTION",
    "WP08_CONTEXT_INTERPRETATION_AND_VALIDATION",
  ]);
  assert.equal(contract.languageDifficultyBoundary.allowedLevel, "LD0_DIRECT_ROLE_EXPLICIT");
  assert.equal(contract.answerWitnessContract.answerRole, "totalAmount");
  assert.match(contract.answerWitnessContract.unitInvariant, /total quantity unit/);
});

test("P1-01/P1-02 have no silent global context or production admission cutover", () => {
  const forbiddenKps = new Set([
    "kp_g3a_u03_10_multiple_by_1digit",
    "kp_g3a_u03_2digit_by_1digit_carry",
    "kp_g3a_u03_3digit_by_1digit",
  ]);
  assert.equal(
    contextBindings.bindings.some((entry) => forbiddenKps.has(entry.knowledgePointId)),
    false,
  );
  assert.equal(
    admissions.admissionRecords.some((entry) => entry.productionAdmissionAllowed === true),
    false,
  );
  assert.equal(contract.contextAdmissionBoundary.existingP101P102GlobalContextBinding, false);
  assert.equal(contract.contextAdmissionBoundary.existingP101P102ProductionAdmission, false);
  assert.equal(contract.path1MasteryIntegration.currentP101P102MasteryGatesChanged, false);
  assert.equal(contract.path1MasteryIntegration.transferGateActivated, false);
});
