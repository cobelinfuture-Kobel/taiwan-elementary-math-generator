#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const touched = [];

function replaceOnce(repoPath, before, after) {
  const absolute = path.join(ROOT, repoPath);
  const current = fs.readFileSync(absolute, 'utf8');
  if (current.includes(after)) return;
  if (!current.includes(before)) throw new Error(`A08R3_CONTROLLER_PATCH_ANCHOR_MISSING:${repoPath}`);
  fs.writeFileSync(absolute, current.replace(before, after), 'utf8');
  touched.push(repoPath);
}

replaceOnce(
  'src/curriculum/application/postg-app-master-controller.mjs',
  `} from './w02-a08r2-controller-overlay.mjs';`,
  `} from './w02-a08r2-controller-overlay.mjs';
import {
  applyW02A08R3ControllerOverlay,
  loadW02A08R3ControllerEvidence,
  validateW02A08R3ControllerEvidence,
  W02_A08R3_BLOCKER
} from './w02-a08r3-controller-overlay.mjs';
import {
  W02_A08R3_STATUS,
  W02_A08R4_TASK
} from './w02-a08r3-numeric-surface-remediation.mjs';`
);

replaceOnce(
  'src/curriculum/application/postg-app-master-controller.mjs',
  `  const a08r2Evidence = loadW02A08R2ControllerEvidence({ root });
  const controllerState = applyW02A08R2ControllerOverlay({ root, controllerState: baseControllerState });`,
  `  const a08r2Evidence = loadW02A08R2ControllerEvidence({ root });
  const a08r2ControllerState = applyW02A08R2ControllerOverlay({ root, controllerState: baseControllerState });
  const a08r3Evidence = loadW02A08R3ControllerEvidence({ root });
  const controllerState = applyW02A08R3ControllerOverlay({ root, controllerState: a08r2ControllerState });`
);

replaceOnce(
  'src/curriculum/application/postg-app-master-controller.mjs',
  `    w02A08R1Readback: buildW02A08R1Readback({ root }),
    ...a08r2Evidence`,
  `    w02A08R1Readback: buildW02A08R1Readback({ root }),
    ...a08r2Evidence,
    ...a08r3Evidence`
);

replaceOnce(
  'src/curriculum/application/postg-app-master-controller.mjs',
  `    'PRODUCTION_ADMITTED',
    W02_A08R2_STATUS,`,
  `    'PRODUCTION_ADMITTED',
    W02_A08R3_STATUS,`
);

replaceOnce(
  'src/curriculum/application/postg-app-master-controller.mjs',
  `  if (controllerState.currentWaveId !== 'W02'
      || controllerState.currentCapability !== W02_A08R2_STATUS
      || controllerState.currentMainlineBlocker !== 'W02_NUMERIC_STUDENT_FACING_SURFACE_REMEDIATION_REQUIRED'
      || controllerState.nextShortestStep !== W02_A08R3_TASK) {`,
  `  if (controllerState.currentWaveId !== 'W02'
      || controllerState.currentCapability !== W02_A08R3_STATUS
      || controllerState.currentMainlineBlocker !== W02_A08R3_BLOCKER
      || controllerState.nextShortestStep !== W02_A08R4_TASK) {`
);

replaceOnce(
  'src/curriculum/application/postg-app-master-controller.mjs',
  `  issues.push(...validateA08Evidence(controller));
  issues.push(...validateW02A08R2ControllerEvidence(controller));`,
  `  issues.push(...validateA08Evidence(controller));
  issues.push(...validateW02A08R2ControllerEvidence(controller));
  issues.push(...validateW02A08R3ControllerEvidence(controller));`
);

replaceOnce(
  'src/curriculum/application/postg-app-master-controller.mjs',
  `    status: issues.length === 0
      ? W02_A08R2_STATUS
      : 'BLOCKED_BY_M00_CONTROLLER_VALIDATION'`,
  `    status: issues.length === 0
      ? W02_A08R3_STATUS
      : 'BLOCKED_BY_M00_CONTROLLER_VALIDATION'`
);

replaceOnce(
  'tests/curriculum/postg-app-m00-master-controller.test.js',
  `const A08R3_TASK = 'POSTG-APP-W02-A08R3_NumericStudentFacingUnknownRoleGivenSetAndNotationRemediation';`,
  `const A08R3_TASK = 'POSTG-APP-W02-A08R3_NumericStudentFacingUnknownRoleGivenSetAndNotationRemediation';
const A08R3_STATUS = 'W02_A08R3_NUMERIC_SURFACE_REMEDIATED_THIRD_REVIEW_READY';
const A08R4_TASK = 'POSTG-APP-W02-A08R4_RegeneratedHTMLPDFThirdOperatorReviewDecision';`
);

replaceOnce(
  'tests/curriculum/postg-app-m00-master-controller.test.js',
  `test('M00 validates the exact 79-node scope with W01 admitted and W02 A08R2 second REVISE recorded', () => {`,
  `test('M00 validates the exact 79-node scope with W01 admitted and W02 A08R3 third-review ready', () => {`
);

replaceOnce(
  'tests/curriculum/postg-app-m00-master-controller.test.js',
  `  assert.equal(result.status, A08R2_STATUS);`,
  `  assert.equal(result.status, A08R3_STATUS);`
);

replaceOnce(
  'tests/curriculum/postg-app-m00-master-controller.test.js',
  `  assert.equal(result.nextShortestStep, A08R3_TASK);`,
  `  assert.equal(result.nextShortestStep, A08R4_TASK);`
);

replaceOnce(
  'tests/curriculum/postg-app-m00-master-controller.test.js',
  `test('Wave 02 records A08R2 second REVISE without admission', () => {`,
  `test('Wave 02 records A08R3 numeric remediation without admission', () => {`
);

replaceOnce(
  'tests/curriculum/postg-app-m00-master-controller.test.js',
  `  assert.equal(state.state, A08R2_STATUS);`,
  `  assert.equal(state.state, A08R3_STATUS);`
);

replaceOnce(
  'tests/curriculum/postg-app-m00-master-controller.test.js',
  `  assert.equal(state.unresolvedRequestedRoleSurfaceCount, 13);
  assert.equal(state.answerEquivalentGivenLeakageCount, 19);
  assert.equal(state.malformedOrIncoherentNumericSurfaceCount, 12);
  assert.equal(state.gradeUnsafeNotationCount, 2);`,
  `  assert.equal(state.unresolvedRequestedRoleSurfaceCount, 0);
  assert.equal(state.answerEquivalentGivenLeakageCount, 0);
  assert.equal(state.malformedOrIncoherentNumericSurfaceCount, 0);
  assert.equal(state.gradeUnsafeNotationCount, 0);
  assert.equal(state.numericStudentFacingSurfaceVersion, 'W02_A08R3_V1');
  assert.equal(state.numericStudentFacingSemanticRevision, 4);
  assert.equal(state.historicalAffectedItemCount, 45);
  assert.equal(state.thirdOperatorReviewReady, true);`
);

replaceOnce(
  'tests/curriculum/postg-app-m00-master-controller.test.js',
  `  for (const claim of [controller.w02A06Claim, controller.w02A07Claim, controller.w02A08Claim, controller.w02A08R2Claim]) {`,
  `  for (const claim of [controller.w02A06Claim, controller.w02A07Claim, controller.w02A08Claim, controller.w02A08R2Claim, controller.w02A08R3Claim]) {`
);

replaceOnce(
  'tests/curriculum/postg-app-w01-a06e-operator-approval.test.js',
  `    'W02_A08R2_SECOND_OPERATOR_REVIEW_REVISE_REQUIRED'`,
  `    'W02_A08R2_SECOND_OPERATOR_REVIEW_REVISE_REQUIRED',
    'W02_A08R3_NUMERIC_SURFACE_REMEDIATED_THIRD_REVIEW_READY'`
);

replaceOnce(
  'tests/curriculum/postg-app-w01-a06e-operator-approval.test.js',
  `  if (w02.state === 'W02_A08R2_SECOND_OPERATOR_REVIEW_REVISE_REQUIRED') {
    assert.equal(w02.humanReviewPackageComplete, true);
    assert.equal(w02.reviewDecision, 'REVISE');
    assert.equal(w02.operatorDecisionState, 'SECOND_REVISE_RECORDED');
    assert.equal(w02.secondOperatorReviewComplete, true);
    assert.equal(w02.productionAdmissionGranted, false);
  }`,
  `  if (w02.state === 'W02_A08R2_SECOND_OPERATOR_REVIEW_REVISE_REQUIRED') {
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
  }`
);

const statePath = 'data/curriculum/application/controller/postg-app-master-controller-state.json';
const stateAbsolute = path.join(ROOT, statePath);
const overlayModule = await import(`${pathToFileURL(path.join(ROOT, 'src/curriculum/application/w02-a08r3-controller-overlay.mjs')).href}?t=${Date.now()}`);
const currentState = JSON.parse(fs.readFileSync(stateAbsolute, 'utf8'));
const revisedState = overlayModule.applyW02A08R3ControllerOverlay({ root: ROOT, controllerState: currentState });
if (JSON.stringify(currentState) !== JSON.stringify(revisedState)) {
  fs.writeFileSync(stateAbsolute, `${JSON.stringify(revisedState)}\n`, 'utf8');
  touched.push(statePath);
}

process.stdout.write(`${JSON.stringify({ ok: true, touched }, null, 2)}\n`);
