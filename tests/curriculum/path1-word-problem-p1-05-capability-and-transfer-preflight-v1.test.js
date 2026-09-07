import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const CONTRACT_PATH = "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_P1_05_CAPABILITY_AND_TRANSFER_PREFLIGHT_V1.json";
const MATRIX_PATH = "data/curriculum/learning-paths/path1-integer-foundations.curriculum-matrix.json";
const G3A_PATH = "data/curriculum/knowledge/units/g3a_u03_3a03.knowledge-operation.json";
const G4B_PATH = "data/curriculum/knowledge/units/g4b_u01_4b01.knowledge-operation.json";
const PUBLIC_BINDING_PATH = "site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";

const readJson = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const contract = readJson(CONTRACT_PATH);
const matrix = readJson(MATRIX_PATH);
const g3a = readJson(G3A_PATH);
const g4b = readJson(G4B_PATH);
const publicBindingText = fs.readFileSync(PUBLIC_BINDING_PATH, "utf8");

const p105Matrix = matrix.blocks.find((entry) => entry.blockId === "P1-05");
const p105Kp = g3a.knowledgePoints.find((entry) => entry.knowledgePointId === "kp_g3a_u03_3digit_zero_middle_by_1digit");

function sorted(values) {
  return [...values].sort();
}

test("P1-05 preflight is planning-only and bounded", () => {
  assert.equal(contract.taskId, "PATH1_WORD_PROBLEM_P1_05_CAPABILITY_AND_TRANSFER_PREFLIGHT_V1");
  assert.equal(contract.status, "P1_05_CAPABILITY_AND_TRANSFER_PREFLIGHT_LOCKED_NO_RUNTIME");
  assert.equal(contract.scope.includedPathBlock, "P1-05");
  assert.equal(contract.implementationAllowed, false);
  assert.equal(contract.runtimeChanged, false);
  assert.equal(contract.publicCutoverAllowed, false);
  assert.equal(contract.publicBindingMutationAllowed, false);
  assert.equal(contract.path1MatrixChanged, false);
  assert.equal(contract.newCanonicalKnowledgePointMinted, false);
  assert.equal(contract.newRelationMinted, false);
  assert.equal(contract.newPatternSpecMaterialized, false);
  assert.ok(contract.scope.excluded.includes("P1-12 public cutover"));
  assert.ok(contract.scope.excluded.includes("full repository regression"));
});

test("P1-05 matrix authority is exactly the zero-middle G3A-U03 KP", () => {
  assert.ok(p105Matrix);
  assert.equal(p105Matrix.blockType, "DIRECT_KP");
  assert.deepEqual(p105Matrix.primaryKnowledgePointIds, ["kp_g3a_u03_3digit_zero_middle_by_1digit"]);
  assert.deepEqual(p105Matrix.requiredPrerequisites.blockIds, ["P1-04"]);
  assert.deepEqual(p105Matrix.requiredPrerequisites.knowledgePointIds, ["kp_g3a_u03_3digit_by_1digit"]);
  assert.deepEqual(p105Matrix.optionalSupportingKnowledgePointIds, ["kp_g4a_u02_3digit_by_1digit_review"]);
  assert.equal(contract.currentMatrixAuthority.primaryKnowledgePointIds[0], p105Matrix.primaryKnowledgePointIds[0]);
});

test("canonical P1-05 arithmetic operation is zero-middle multiplication and not an existing application KP", () => {
  assert.ok(p105Kp);
  assert.equal(p105Kp.knowledgePointName, "三位數中間為0乘一位數");
  assert.equal(p105Kp.applicationCapability, "NOT_APPLICABLE");
  assert.equal(p105Kp.operationModels.length, 1);
  const operation = p105Kp.operationModels[0];
  assert.equal(operation.modelId, "op_g3a_u03_zero_middle_by_1digit");
  assert.ok(operation.canonicalExpressions.includes("a = 100*h + u"));
  assert.ok(operation.canonicalExpressions.includes("product = a * b"));
  assert.ok(operation.numberConstraints.includes("tens digit of a is 0"));
  assert.ok(operation.validationInvariants.includes("tens digit of first operand is zero"));
  assert.equal(contract.canonicalArithmeticAuthority.knowledgePointId, p105Kp.knowledgePointId);
  assert.equal(contract.canonicalArithmeticAuthority.operationModelId, operation.modelId);
});

test("full P1-05 arithmetic operand envelope has 648 role-bound pairs", () => {
  const rows = [];
  for (let hundreds = 1; hundreds <= 9; hundreds += 1) {
    for (let ones = 1; ones <= 9; ones += 1) {
      const amountPerGroup = hundreds * 100 + ones;
      for (let groupCount = 2; groupCount <= 9; groupCount += 1) {
        rows.push({ amountPerGroup, groupCount, totalAmount: amountPerGroup * groupCount });
      }
    }
  }
  assert.equal(rows.length, 648);
  assert.ok(rows.every(({ amountPerGroup }) => Math.floor(amountPerGroup / 10) % 10 === 0));
  assert.equal(Math.min(...rows.map((entry) => entry.totalAmount)), 202);
  assert.equal(Math.max(...rows.map((entry) => entry.totalAmount)), 8181);
  assert.equal(contract.numericAuthorityDecision.operandPairCapacityBeforeContextProjection, 648);
  assert.equal(contract.numericAuthorityDecision.selectedCoverage, "FULL_CURRENT_P1_05_ARITHMETIC_DOMAIN");
  assert.equal(contract.numericAuthorityDecision.directReuseOfG3BU08NumericEnvelopeAllowed, false);
});

test("P1-05 transfer keeps R03 relation semantics but requires Path1-local numeric projection", () => {
  assert.equal(contract.capabilityDecision.relationId, "R03_EQUAL_GROUPS");
  assert.equal(contract.capabilityDecision.canonicalInvariant, "totalAmount = amountPerGroup * groupCount");
  assert.equal(contract.capabilityDecision.unknownRole, "totalAmount");
  assert.equal(contract.capabilityDecision.leftFactorRole, "amountPerGroup");
  assert.equal(contract.capabilityDecision.rightFactorRole, "groupCount");
  assert.equal(contract.capabilityDecision.semanticCommutativeRoleSwapAllowed, false);
  assert.equal(contract.semanticSurfaceDecision.strategy, "PATH1_LOCAL_R03_PATTERN_PROJECTION_WITH_EXISTING_PROMOTED_PARENT_LINEAGE");
  assert.equal(contract.semanticSurfaceDecision.candidateLocalPatternSpecIds.length, 4);
  assert.equal(contract.semanticSurfaceDecision.parentPatternSpecIds.length, 4);
  assert.equal(contract.semanticSurfaceDecision.newContextFamilyPlanned, false);
});

test("current P1-05 public arithmetic binding drift is observed but excluded from modeling authority", () => {
  const matrixIds = contract.observedPublicBindingScopeDrift.matrixPrimaryKnowledgePointIds;
  const publicIds = contract.observedPublicBindingScopeDrift.currentPublicArithmeticBindingKnowledgePointIds;
  assert.deepEqual(matrixIds, ["kp_g3a_u03_3digit_zero_middle_by_1digit"]);
  assert.deepEqual(sorted(contract.observedPublicBindingScopeDrift.extraPublicBindingKnowledgePointIds), sorted([
    "kp_g4b_u01_multiplier_internal_zero",
    "kp_g4b_u01_trailing_zero_multiplication",
  ]));
  assert.ok(publicIds.includes("kp_g3a_u03_3digit_zero_middle_by_1digit"));
  assert.ok(publicIds.includes("kp_g4b_u01_multiplier_internal_zero"));
  assert.ok(publicIds.includes("kp_g4b_u01_trailing_zero_multiplication"));
  assert.match(publicBindingText, /block\("P1-05"/);
  for (const kpId of publicIds) assert.match(publicBindingText, new RegExp(kpId));
  assert.equal(contract.observedPublicBindingScopeDrift.status, "OBSERVED_NOT_ADOPTED_FOR_P105_MODELING_TRANSFER");
  assert.equal(contract.observedPublicBindingScopeDrift.futureModelingMustUseMatrixPrimaryKnowledgePointOnly, true);

  for (const kpId of contract.observedPublicBindingScopeDrift.extraPublicBindingKnowledgePointIds) {
    const kp = g4b.knowledgePoints.find((entry) => entry.knowledgePointId === kpId);
    assert.ok(kp, kpId);
    assert.equal(kp.applicationCapability, "NOT_APPLICABLE", kpId);
  }
});

test("source evidence is additive only and does not widen P1-05 authority", () => {
  assert.equal(contract.sourceEvidence.arithmeticCurriculum.sourceId, "g3a_u03_3a03");
  assert.equal(contract.sourceEvidence.arithmeticCurriculum.driveFileId, "1cUa8Oi1VE2My9ZtCJwGvpBpfDAbhPOp2");
  assert.equal(contract.sourceEvidence.schoolExam.sourceFileId, "1fgRK7y1SehP7Ztro2Z3XKCnV-kuwedqw");
  assert.equal(contract.sourceEvidence.schoolExam.observedWitness, "304 × 6");
  assert.equal(contract.sourceEvidence.schoolExam.modelingAuthority, false);
  assert.equal(contract.sourceEvidence.schoolExam.numericEnvelopeAuthority, false);
  assert.equal(contract.sourceEvidence.wordProblemRepresentation.authority.includes("no P1-05-specific contextual witness is fabricated"), true);
  assert.equal(contract.sourceEvidence.liTeacher.p105SpecificRuntimeAuthority, false);
  assert.equal(contract.sourceEvidence.policy.sourcePresenceDoesNotExpandRuntime, true);
});

test("future implementation remains non-public and has an explicit approval boundary", () => {
  assert.equal(contract.futureImplementationContract.implementationTaskId, "PATH1_WORD_PROBLEM_P1_05_MULTIPLICATIVE_MODELING_IMPLEMENTATION_V1");
  assert.equal(contract.futureImplementationContract.practiceModeCandidate, "multiplicativeModelingTransfer");
  assert.equal(contract.futureImplementationContract.publicCutoverInImplementation, false);
  assert.ok(contract.futureImplementationContract.mustNotModify.includes("site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js"));
  assert.ok(contract.futureImplementationContract.mustNotModify.includes("P1-01/P1-02 equal-groups transfer runtime"));
  assert.ok(contract.futureImplementationContract.mustNotModify.includes("P1-03/P1-04 modeling runtime"));
  assert.equal(contract.futureGeneratorContract.capacityTarget, 120);
  assert.equal(contract.futureGeneratorContract.fullArithmeticEnvelopeRequired, true);
  assert.equal(contract.futureValidatorContract.failClosed, true);
  assert.equal(contract.distance.nextShortestStep, "PATH1_WORD_PROBLEM_P1_05_MULTIPLICATIVE_MODELING_IMPLEMENTATION_V1");
});
