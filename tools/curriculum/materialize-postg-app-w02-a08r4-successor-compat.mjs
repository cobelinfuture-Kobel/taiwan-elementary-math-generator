#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const touched = [];
function replaceOnce(repoPath, before, after) {
  const absolute = path.join(ROOT, repoPath);
  const current = fs.readFileSync(absolute, 'utf8');
  if (current.includes(after)) return;
  if (!current.includes(before)) throw new Error(`A08R4_COMPAT_ANCHOR_MISSING:${repoPath}`);
  fs.writeFileSync(absolute, current.replace(before, after), 'utf8');
  touched.push(repoPath);
}

replaceOnce(
  'src/curriculum/application/w01-a06e-operator-approval-runtime.mjs',
  `  const w01 = controller.controllerState.waveStates.find((row) => row.waveId === 'W01');
  const w02 = controller.controllerState.waveStates.find((row) => row.waveId === 'W02');
  if (w01?.state !== 'PRODUCTION_ADMITTED'
      || w01?.productionAdmissionGranted !== true
      || w01?.reviewDecision !== 'APPROVE'
      || w02?.state === 'BLOCKED_BY_PREVIOUS_WAVE'
      || w02?.state === 'PRODUCTION_ADMITTED'
      || !w02?.completedGates?.includes('SOURCE_NODE_REGISTERED')
      || !w02?.completedGates?.includes('KNOWLEDGE_OPERATION_AVAILABLE_OR_PLANNED')
      || w02?.productionAdmissionGranted !== false
      || controller.controllerState.currentWaveId !== 'W02') {
    issues.push(issue('POSTG_APP_W01_A06E_WAVE_TRANSITION_INVALID', 'controllerState.waveStates'));
  }`,
  `  const w01 = controller.controllerState.waveStates.find((row) => row.waveId === 'W01');
  const w02 = controller.controllerState.waveStates.find((row) => row.waveId === 'W02');
  const w03 = controller.controllerState.waveStates.find((row) => row.waveId === 'W03');
  const successorAdmissionPresent = fs.existsSync(path.join(materialized.root, 'data/project/milestones/POSTG-APP-W02-A08R4.claim.json'));
  const baseInvalid = w01?.state !== 'PRODUCTION_ADMITTED'
    || w01?.productionAdmissionGranted !== true
    || w01?.reviewDecision !== 'APPROVE'
    || !w02?.completedGates?.includes('SOURCE_NODE_REGISTERED')
    || !w02?.completedGates?.includes('KNOWLEDGE_OPERATION_AVAILABLE_OR_PLANNED');
  const successorInvalid = successorAdmissionPresent
    ? w02?.state !== 'PRODUCTION_ADMITTED'
      || w02?.productionAdmissionGranted !== true
      || w02?.reviewDecision !== 'APPROVE'
      || w03?.state !== 'ASSESSMENT_READY'
      || controller.controllerState.currentWaveId !== 'W03'
    : w02?.state === 'BLOCKED_BY_PREVIOUS_WAVE'
      || w02?.state === 'PRODUCTION_ADMITTED'
      || w02?.productionAdmissionGranted !== false
      || controller.controllerState.currentWaveId !== 'W02';
  if (baseInvalid || successorInvalid) {
    issues.push(issue('POSTG_APP_W01_A06E_WAVE_TRANSITION_INVALID', 'controllerState.waveStates'));
  }`
);

replaceOnce(
  'tests/curriculum/postg-app-w01-a06e-operator-approval.test.js',
  `  assert.equal(result.currentWaveId, 'W02');
  assert.match(result.nextShortestStep, /^POSTG-APP-W02-/);`,
  `  assert.equal(result.currentWaveId, 'W03');
  assert.equal(result.nextShortestStep, 'POSTG-APP-W03-A00_13SourceNodeApplicationCapabilityAssessmentAndAdmissionBaseline');`
);
replaceOnce(
  'tests/curriculum/postg-app-w01-a06e-operator-approval.test.js',
  `    productionAdmittedWaveCount: 1`,
  `    productionAdmittedWaveCount: 2`
);
replaceOnce(
  'tests/curriculum/postg-app-w01-a06e-operator-approval.test.js',
  `test('controller preserves W01 admission while W02 advances monotonically without production admission', () => {
  const states = materialized.controller.controllerState.waveStates;
  const w02 = states[1];
  assert.equal(states[0].state, 'PRODUCTION_ADMITTED');
  assert.equal(states[0].productionAdmissionGranted, true);
  assert.notEqual(w02.state, 'BLOCKED_BY_PREVIOUS_WAVE');
  assert.notEqual(w02.state, 'PRODUCTION_ADMITTED');
  assert.equal(w02.productionAdmissionGranted, false);
  assert.equal(w02.kpApplicationClassificationComplete, true);
  assert.equal(w02.canonicalOperationModelsComplete, true);
  assert.equal(w02.hiddenPatternSpecsComplete, true);
  assert.equal(w02.atomicContextBindingsComplete, true);
  assert.equal(w02.completedGates.includes('N_PLUS_1_CONTRACT_COMPLETE'), true);
  assert.equal(w02.completedGates.includes('VALIDATOR_CONTRACT_COMPLETE'), true);
  assert.equal(w02.completedGates.includes('POSITIVE_NEGATIVE_FIXTURES_COMPLETE'), true);
  assert.equal(w02.completedGates.includes('SHARED_RUNTIME_SHADOW_PASS'), true);
  assert.equal(w02.nPlusOnePblBlueprintsComplete, true);
  assert.equal(w02.validatorFixturesComplete, true);
  assert.equal(w02.sharedRuntimeShadowPass, true);
  assert.equal(w02.sharedWorksheetProjectionComplete, true);
  assert.equal(w02.productionEquivalentOutputVerified, true);

  const reviewReadyStates = new Set([
    'W02_PRODUCTION_EQUIVALENT_HTML_PDF_HUMAN_REVIEW_READY',
    'W02_A08R1_PATTERN_SEMANTIC_AND_OPERATION_SPECIFIC_PBL_REVIEW_READY',
    'W02_A08R2_SECOND_OPERATOR_REVIEW_REVISE_REQUIRED',
    'W02_A08R3_NUMERIC_SURFACE_REMEDIATED_THIRD_REVIEW_READY'
  ]);
  const expectedW02HumanReviewReady = reviewReadyStates.has(w02.state);
  assert.equal(w02.humanReviewReady, expectedW02HumanReviewReady);
  if (w02.state === 'W02_PRODUCTION_EQUIVALENT_HTML_PDF_HUMAN_REVIEW_READY') {
    assert.equal(w02.humanReviewPackageComplete, true);
    assert.equal(w02.reviewDecision, 'NOT_STARTED');
  }
  if (w02.state === 'W02_A08R1_PATTERN_SEMANTIC_AND_OPERATION_SPECIFIC_PBL_REVIEW_READY') {
    assert.equal(w02.humanReviewPackageComplete, true);
    assert.equal(w02.reviewDecision, 'REVISE');
    assert.equal(w02.operatorDecisionState, 'REVISE_RECORDED');
    assert.equal(w02.studentFacingSemanticRevision, 3);
    assert.equal(w02.regeneratedHtmlPdfReviewReady, true);
  }
  if (w02.state === 'W02_A08R2_SECOND_OPERATOR_REVIEW_REVISE_REQUIRED') {
    assert.equal(w02.humanReviewPackageComplete, true);
    assert.equal(w02.reviewDecision, 'REVISE');
    assert.equal(w02.operatorDecisionState, 'SECOND_REVISE_RECORDED');
    assert.equal(w02.secondOperatorReviewComplete, true);
    assert.equal(w02.productionAdmissionGranted, false);
  }
  if (w02.state === 'W02_A08R3_NUMERIC_SURFACE_REMEDIATED_THIRD_REVIEW_READY') {
    assert.equal(w02.humanReviewPackageComplete, true);
    assert.equal(w02.reviewDecision, 'REVISE');
    assert.equal(w02.numericStudentFacingSemanticRevision, 4);
    assert.equal(w02.thirdOperatorReviewReady, true);
    assert.equal(w02.productionAdmissionGranted, false);
  }
  assert.deepEqual(states.slice(2).map((row) => row.state), [
    'BLOCKED_BY_PREVIOUS_WAVE',
    'BLOCKED_BY_PREVIOUS_WAVE',
    'BLOCKED_BY_PREVIOUS_WAVE',
    'BLOCKED_BY_PREVIOUS_WAVE'
  ]);
  assert.equal(materialized.controller.wavePlan.coverage.productionAdmittedWaveCount, 1);
});`,
  `test('controller preserves W01 and admits W02 while W03 remains assessment-only', () => {
  const states = materialized.controller.controllerState.waveStates;
  const w02 = states[1];
  const w03 = states[2];
  assert.equal(states[0].state, 'PRODUCTION_ADMITTED');
  assert.equal(states[0].productionAdmissionGranted, true);
  assert.equal(w02.state, 'PRODUCTION_ADMITTED');
  assert.equal(w02.productionAdmissionGranted, true);
  assert.equal(w02.reviewDecision, 'APPROVE');
  assert.equal(w02.operatorDecisionState, 'THIRD_APPROVE_RECORDED');
  assert.equal(w02.productionRuntimeAccessEnabled, true);
  assert.equal(w02.publicSelectableCandidateCount, 0);
  assert.equal(w03.state, 'ASSESSMENT_READY');
  assert.equal(w03.productionAdmissionGranted, false);
  assert.equal(w03.shadowProjectionAllowed, false);
  assert.deepEqual(states.slice(3).map((row) => row.state), [
    'BLOCKED_BY_PREVIOUS_WAVE',
    'BLOCKED_BY_PREVIOUS_WAVE',
    'BLOCKED_BY_PREVIOUS_WAVE'
  ]);
  assert.equal(materialized.controller.wavePlan.coverage.productionAdmittedWaveCount, 2);
});`
);
replaceOnce(
  'tests/curriculum/postg-app-w01-a06e-operator-approval.test.js',
  `test('premature W02 admission and fabricated D0 fail closed', () => {
  const w02Case = structuredClone(materialized);
  w02Case.controller.wavePlan.waves[1].productionAdmissionGranted = true;
  assert.equal(codes(validateW01A06EOperatorApproval(w02Case)).includes('POSTG_APP_W01_A06E_CONTROLLER_TRANSITION_INVALID'), true);`,
  `test('non-contiguous W03 admission and fabricated D0 fail closed', () => {
  const w03Case = structuredClone(materialized);
  w03Case.controller.wavePlan.waves[3].productionAdmissionGranted = true;
  assert.equal(codes(validateW01A06EOperatorApproval(w03Case)).includes('POSTG_APP_W01_A06E_CONTROLLER_TRANSITION_INVALID'), true);`
);

process.stdout.write(`${JSON.stringify({ ok: true, touched }, null, 2)}\n`);
