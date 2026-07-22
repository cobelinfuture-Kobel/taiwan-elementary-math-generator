import assert from 'node:assert/strict';
import test from 'node:test';

import {
  materializeW01A06EOperatorApproval,
  validateW01A06EOperatorApproval
} from '../../src/curriculum/application/w01-a06e-operator-approval-runtime.mjs';
import { runPOSTGAPPW01A06EValidation } from '../../tools/curriculum/validate-postg-app-w01-a06e-operator-approval.mjs';

const materialized = materializeW01A06EOperatorApproval();
const codes = (result) => result.issues.map((row) => row.code);

test('A06E records explicit APPROVE and production admits W01 at E5', () => {
  const result = runPOSTGAPPW01A06EValidation();
  assert.equal(result.ok, true, JSON.stringify(result.issues, null, 2));
  assert.equal(result.status, 'PASS_POSTG_APP_W01_A06E_OPERATOR_APPROVED_PRODUCTION_ADMITTED');
  assert.equal(result.decision, 'APPROVE');
  assert.equal(result.productionAdmissionGranted, true);
  assert.equal(result.publicRouteChanged, false);
  assert.equal(result.currentWaveId, 'W02');
  assert.match(result.nextShortestStep, /^POSTG-APP-W02-/);
  assert.deepEqual(result.counts, {
    reviewedQuestionCount: 16,
    applicationSourceUnitCount: 12,
    macroContextMetadataCount: 16,
    artifactHashCount: 5,
    productionAdmittedWaveCount: 1
  });
});

test('approval is bound to the exact hash-locked A06D review package', () => {
  assert.equal(materialized.actualArtifactHashes.length, 5);
  assert.equal(materialized.actualArtifactHashes.every((row) => row.expectedSha256 === row.actualSha256), true);
  assert.equal(materialized.a06dManifest.actualPdfPageCount, 14);
  assert.equal(materialized.a06dManifest.reviewCohortQuestionCount, 16);
  assert.equal(materialized.a06dManifest.mathPreservedCount, 16);
  assert.equal(materialized.a06dManifest.numberFactsPreservedCount, 16);
  assert.equal(materialized.a06dManifest.visibleTitleCount, 0);
  assert.equal(materialized.a06dManifest.genericVisibleUnitCount, 0);
});

test('all eight operator acceptance dimensions are explicit', () => {
  assert.deepEqual(Object.keys(materialized.decision.operatorAcceptance).sort(), [
    'macroTitleSuppressionAccepted',
    'mathematicalWitnessPreservationAccepted',
    'numericOnlyBoundaryAccepted',
    'productionEquivalentHtmlPdfAccepted',
    'quantityRoleBindingAccepted',
    'relationSpecificWordingAccepted',
    'semanticNaturalnessAccepted',
    'unitBindingAccepted'
  ].sort());
  assert.equal(Object.values(materialized.decision.operatorAcceptance).every(Boolean), true);
});

test('E5 admission does not imply public route activation or program D0', () => {
  assert.equal(materialized.decision.productionAdmission.publicRouteChanged, false);
  assert.equal(materialized.decision.productionAdmission.publicSelectionEnabled, false);
  assert.equal(materialized.decision.failClosedBoundaries.programD0Complete, false);
  assert.equal(materialized.claim.claims.productionAdmitted, true);
  assert.equal(materialized.claim.claims.d0Complete, false);
  assert.equal(materialized.controller.controllerState.productionAdmission.publicRouteChanged, false);
});

test('controller closes W01 admission blocker and activates only W02 assessment', () => {
  const states = materialized.controller.controllerState.waveStates;
  assert.deepEqual(states.map((row) => row.state), [
    'PRODUCTION_ADMITTED',
    'ASSESSMENT_READY',
    'BLOCKED_BY_PREVIOUS_WAVE',
    'BLOCKED_BY_PREVIOUS_WAVE',
    'BLOCKED_BY_PREVIOUS_WAVE',
    'BLOCKED_BY_PREVIOUS_WAVE'
  ]);
  assert.equal(states[0].productionAdmissionGranted, true);
  assert.equal(states[1].productionAdmissionGranted, false);
  assert.equal(materialized.controller.wavePlan.coverage.productionAdmittedWaveCount, 1);
});

test('forged decision, partial acceptance and changed hash fail closed', () => {
  const rejectCase = structuredClone(materialized);
  rejectCase.decision.operatorDecision = 'REJECT';
  assert.equal(codes(validateW01A06EOperatorApproval(rejectCase)).includes('POSTG_APP_W01_A06E_OPERATOR_DECISION_INVALID'), true);

  const partialCase = structuredClone(materialized);
  partialCase.decision.operatorAcceptance.semanticNaturalnessAccepted = false;
  assert.equal(codes(validateW01A06EOperatorApproval(partialCase)).includes('POSTG_APP_W01_A06E_OPERATOR_ACCEPTANCE_INCOMPLETE'), true);

  const hashCase = structuredClone(materialized);
  hashCase.actualArtifactHashes[0].actualSha256 = '0'.repeat(64);
  assert.equal(codes(validateW01A06EOperatorApproval(hashCase)).includes('POSTG_APP_W01_A06E_REVIEW_ARTIFACT_HASH_MISMATCH'), true);
});

test('premature W02 admission and fabricated D0 fail closed', () => {
  const w02Case = structuredClone(materialized);
  w02Case.controller.wavePlan.waves[1].productionAdmissionGranted = true;
  assert.equal(codes(validateW01A06EOperatorApproval(w02Case)).includes('POSTG_APP_W01_A06E_CONTROLLER_TRANSITION_INVALID'), true);

  const d0Case = structuredClone(materialized);
  d0Case.claim.claims.d0Complete = true;
  assert.equal(codes(validateW01A06EOperatorApproval(d0Case)).includes('POSTG_APP_W01_A06E_E5_CLAIM_INVALID'), true);
});
