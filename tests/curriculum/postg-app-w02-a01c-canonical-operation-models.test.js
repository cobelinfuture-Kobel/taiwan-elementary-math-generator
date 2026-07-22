import assert from 'node:assert/strict';
import test from 'node:test';

import { materializeW02CanonicalOperationModels, validateW02CanonicalOperationModels } from '../../src/curriculum/application/w02-canonical-operation-models.mjs';
import { runPOSTGAPPW02A01CValidation } from '../../tools/curriculum/validate-postg-app-w02-a01c-canonical-operation-models.mjs';

const materialized = materializeW02CanonicalOperationModels();
const codes = (result) => result.issues.map((row) => row.code);

test('A01C materializes one canonical operation model for every W02 KP', () => {
  const result = runPOSTGAPPW02A01CValidation();
  assert.equal(result.ok, true, JSON.stringify(result.issues, null, 2));
  assert.equal(result.status, 'PASS_POSTG_APP_W02_A01C_CANONICAL_OPERATION_MODELS_MATERIALIZED');
  assert.deepEqual(result.counts, {
    sourceNodeCount: 13,
    uniquePdfContentCount: 12,
    knowledgePointCount: 90,
    uniqueContentKnowledgePointCount: 84,
    canonicalOperationModelCount: 90,
    uniqueContentCanonicalOperationModelCount: 84
  });
  assert.equal(result.patternSpecsAuthored, false);
  assert.equal(result.runtimeConsumerEnabled, false);
  assert.equal(result.productionAdmissionAllowed, false);
});

test('A01C preserves A01B identity, evidence and application classification exactly', () => {
  for (const row of materialized.records) {
    const candidate = materialized.candidates.records.find((candidateRow) => candidateRow.candidate.sourceNodeId === row.actual.sourceNodeId).candidate;
    assert.deepEqual(row.actual.sourceEvidence, candidate.sourceEvidence);
    assert.deepEqual(
      row.actual.knowledgePoints.map((kp) => [kp.knowledgePointId, kp.knowledgePointName, kp.scope, kp.evidencePages, kp.applicationClassification, kp.classificationRationale]),
      candidate.knowledgePoints.map((kp) => [kp.candidateId, kp.name, kp.scope, kp.evidencePages, kp.applicationClassification, kp.classificationRationale])
    );
  }
});

test('every model has explicit semantics and an answer-bearing unknown role', () => {
  for (const { actual } of materialized.records) {
    for (const kp of actual.knowledgePoints) {
      assert.equal(kp.operationModels.length, 1);
      const model = kp.operationModels[0];
      assert.equal(model.modelId, kp.knowledgePointId.replace(/^kp_/, 'op_'));
      assert.ok(model.canonicalExpressions.length > 0);
      assert.ok(model.unknownRoles.every((role) => Object.hasOwn(model.operandRoles, role)));
      assert.ok(model.numberConstraints.length > 0);
      assert.ok(model.validationInvariants.length > 0);
    }
  }
});

test('materialization drift and premature production claims fail closed', () => {
  const drift = structuredClone(materialized);
  drift.records[0].actual.knowledgePoints[0].operationModels[0].answerType = 'anything';
  assert.equal(codes(validateW02CanonicalOperationModels(drift)).includes('POSTG_APP_W02_A01C_MATERIALIZATION_DRIFT'), true);

  const admission = structuredClone(materialized);
  admission.records[0].actual.productionBoundary.productionAdmissionAllowed = true;
  const admissionCodes = codes(validateW02CanonicalOperationModels(admission));
  assert.equal(admissionCodes.includes('POSTG_APP_W02_A01C_MATERIALIZATION_DRIFT'), true);
  assert.equal(admissionCodes.includes('POSTG_APP_W02_A01C_PREMATURE_RUNTIME_OR_PRODUCTION_CLAIM'), true);
});
