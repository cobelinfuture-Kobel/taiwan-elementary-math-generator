#!/usr/bin/env node
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const BASE_SHA = '4f352e5e57027ea9271682a7af0055140a2d6471';
const TARGET = 'src/curriculum/application/postg-app-master-controller.mjs';
const show = `${BASE_SHA}:${TARGET}`;
let source = execFileSync('git', ['show', show], { encoding: 'utf8' });

function replaceExact(before, after, label) {
  if (!source.includes(before)) throw new Error(`Missing ${label}`);
  source = source.replace(before, after);
}

const a08r3Import = `import {
  W02_A08R3_STATUS,
  W02_A08R4_TASK
} from './w02-a08r3-numeric-surface-remediation.mjs';
`;
const successorImports = `${a08r3Import}import {
  applyW02A08R4ControllerOverlay,
  loadW02A08R4ControllerEvidence,
  validateW02A08R4ControllerEvidence
} from './w02-a08r4-controller-overlay.mjs';
import {
  W02_A08R4_CLAIM_PATH,
  W02_A08R4_DECISION_PATH,
  W02_A08R4_EVIDENCE_PATH
} from './w02-a08r4-third-operator-approval.mjs';
import {
  W02_A09A_NEXT_TASK,
  W02_A09A_POLICY_PATH,
  W02_A09A_STATUS,
  W02_A09A_TASK
} from './w02-a09a-authority-reconciliation-freeze.mjs';
`;
replaceExact(a08r3Import, successorImports, 'successor import anchor');

replaceExact(
  `  const a08r3Evidence = loadW02A08R3ControllerEvidence({ root });
  const controllerState = applyW02A08R3ControllerOverlay({ root, controllerState: a08r2ControllerState });
  const contextAuthority = loadGlobalContextAuthority({ root });`,
  `  const a08r3Evidence = loadW02A08R3ControllerEvidence({ root });
  const a08r3ControllerState = applyW02A08R3ControllerOverlay({ root, controllerState: a08r2ControllerState });
  const a08r4Evidence = loadW02A08R4ControllerEvidence({ root });
  const controllerState = applyW02A08R4ControllerOverlay({ root, controllerState: a08r3ControllerState });
  const contextAuthority = loadGlobalContextAuthority({ root });`,
  'controller overlay chain'
);
replaceExact(
  `    ...a08r2Evidence,
    ...a08r3Evidence
  };`,
  `    ...a08r2Evidence,
    ...a08r3Evidence,
    ...a08r4Evidence
  };`,
  'controller evidence return'
);

replaceExact(
  `  if (JSON.stringify(admitted.admitted) !== JSON.stringify(['W01'])) issues.push(issue('POSTG_APP_PRODUCTION_ADMITTED_WAVE_SET_INVALID', 'waves'));`,
  `  if (JSON.stringify(admitted.admitted) !== JSON.stringify(['W01', 'W02'])) issues.push(issue('POSTG_APP_PRODUCTION_ADMITTED_WAVE_SET_INVALID', 'waves'));`,
  'admission prefix'
);

replaceExact(
  `  const expectedStates = [
    'PRODUCTION_ADMITTED',
    W02_A08R3_STATUS,
    'BLOCKED_BY_PREVIOUS_WAVE',
    'BLOCKED_BY_PREVIOUS_WAVE',
    'BLOCKED_BY_PREVIOUS_WAVE',
    'BLOCKED_BY_PREVIOUS_WAVE'
  ];`,
  `  const expectedStates = [
    'PRODUCTION_ADMITTED',
    'PRODUCTION_ADMITTED',
    'ASSESSMENT_READY',
    'BLOCKED_BY_PREVIOUS_WAVE',
    'BLOCKED_BY_PREVIOUS_WAVE',
    'BLOCKED_BY_PREVIOUS_WAVE'
  ];`,
  'wave states'
);

replaceExact(
  `  const w02State = controllerState.waveStates[1];
  if (!Array.isArray(w02State.completedGates)
      || JSON.stringify(w02State.completedGates) !== JSON.stringify(REQUIRED_GATE_ORDER.slice(0, 10))
      || w02State.productionAdmissionGranted !== false
      || w02State.admissionGateComplete !== false
      || w02State.reviewDecision !== 'REVISE'
      || w02State.reviewEvidence !== W02_A08R2_EVIDENCE_PATH
      || w02State.decisionEvidence !== W02_A08R2_DECISION_PATH
      || !validateW02Metrics(w02State)) {
    issues.push(issue('POSTG_APP_W02_ASSESSMENT_READY_STATE_INVALID', 'controllerState.waveStates.W02'));
  }
  if (controllerState.currentWaveId !== 'W02'
      || controllerState.currentCapability !== W02_A08R3_STATUS
      || controllerState.currentMainlineBlocker !== W02_A08R3_BLOCKER
      || controllerState.nextShortestStep !== W02_A08R4_TASK) {
    issues.push(issue('POSTG_APP_CONTROLLER_TRANSITION_INVALID', 'controllerState'));
  }
  if (controllerState.productionAdmission.applicationUnitCount !== 12
      || controllerState.productionAdmission.waveCount !== 1
      || controllerState.productionAdmission.allowed !== true
      || controllerState.productionAdmission.lastReviewDecision !== 'APPROVE'
      || JSON.stringify(controllerState.productionAdmission.admittedWaveIds ?? []) !== JSON.stringify(['W01'])
      || controllerState.productionAdmission.publicRouteChanged !== false) {
    issues.push(issue('POSTG_APP_PRODUCTION_ADMISSION_STATE_INVALID', 'controllerState.productionAdmission'));
  }`,
  `  const w02State = controllerState.waveStates[1];
  if (!Array.isArray(w02State.completedGates)
      || JSON.stringify(w02State.completedGates) !== JSON.stringify(REQUIRED_GATE_ORDER)
      || w02State.productionAdmissionGranted !== true
      || w02State.admissionGateComplete !== true
      || w02State.reviewDecision !== 'APPROVE'
      || w02State.reviewEvidence !== W02_A08R4_EVIDENCE_PATH
      || w02State.decisionEvidence !== W02_A08R4_DECISION_PATH
      || w02State.operatorDecisionState !== 'THIRD_APPROVE_RECORDED'
      || w02State.generatedItemCount !== 195
      || w02State.numericGeneratedItemCount !== 134
      || w02State.applicationGeneratedItemCount !== 61
      || w02State.pblReviewCount !== 31
      || w02State.numericStudentFacingSemanticRevision !== 4
      || w02State.unresolvedRequestedRoleSurfaceCount !== 0
      || w02State.answerEquivalentGivenLeakageCount !== 0
      || w02State.malformedOrIncoherentNumericSurfaceCount !== 0
      || w02State.gradeUnsafeNotationCount !== 0
      || w02State.productionRuntimeAccessEnabled !== true
      || w02State.publicSelectableCandidateCount !== 0
      || w02State.canonicalCurriculumAuthorityReconciliationRequired !== true
      || w02State.canonicalCurriculumAuthorityReconciled !== false
      || w02State.globalContextSingleApplicationAuthorityRequired !== true
      || w02State.legacyApplicationRoutesFrozen !== true
      || !validateW02Metrics(w02State)) {
    issues.push(issue('POSTG_APP_W02_PRODUCTION_ADMISSION_STATE_INVALID', 'controllerState.waveStates.W02'));
  }
  const w03State = controllerState.waveStates[2];
  if (w03State.state !== 'ASSESSMENT_READY'
      || w03State.productionAdmissionGranted !== false
      || w03State.shadowProjectionAllowed !== false
      || w03State.executionFrozen !== true
      || w03State.implementationAllowed !== false
      || w03State.freezeStatus !== W02_A09A_STATUS) {
    issues.push(issue('POSTG_APP_W03_EXECUTION_FREEZE_INVALID', 'controllerState.waveStates.W03'));
  }
  if (controllerState.currentWaveId !== 'W02'
      || controllerState.currentCapability !== W02_A09A_STATUS
      || controllerState.currentMainlineBlocker !== 'BATCH_B_CANONICAL_KNOWLEDGE_POINT_AUTHORITY_AND_SHARED_PUBLIC_APPLICATION_CONSUMER_PENDING'
      || controllerState.nextShortestStep !== W02_A09A_NEXT_TASK
      || controllerState.mainlineExecutionFreeze?.active !== true
      || controllerState.mainlineExecutionFreeze?.authorityPath !== W02_A09A_POLICY_PATH) {
    issues.push(issue('POSTG_APP_CONTROLLER_TRANSITION_INVALID', 'controllerState'));
  }
  if (controllerState.productionAdmission.applicationUnitCount !== 25
      || controllerState.productionAdmission.waveCount !== 2
      || controllerState.productionAdmission.allowed !== true
      || controllerState.productionAdmission.lastReviewDecision !== 'APPROVE'
      || JSON.stringify(controllerState.productionAdmission.admittedWaveIds ?? []) !== JSON.stringify(['W01', 'W02'])
      || controllerState.productionAdmission.publicRouteChanged !== false) {
    issues.push(issue('POSTG_APP_PRODUCTION_ADMISSION_STATE_INVALID', 'controllerState.productionAdmission'));
  }`,
  'W02/W03/current-state validation'
);

replaceExact(
  `  issues.push(...validateW02A08R2ControllerEvidence(controller));
  issues.push(...validateW02A08R3ControllerEvidence(controller));`,
  `  issues.push(...validateW02A08R2ControllerEvidence(controller));
  issues.push(...validateW02A08R3ControllerEvidence(controller));
  issues.push(...validateW02A08R4ControllerEvidence(controller));`,
  'A08R4 evidence validation'
);

replaceExact(
  `    status: issues.length === 0
      ? W02_A08R3_STATUS
      : 'BLOCKED_BY_M00_CONTROLLER_VALIDATION'`,
  `    status: issues.length === 0
      ? W02_A09A_STATUS
      : 'BLOCKED_BY_M00_CONTROLLER_VALIDATION'`,
  'readback status'
);

const waveFreezeAnchor = `  const expectedWaveCounts = [16, 13, 13, 13, 12, 12];
  wavePlan.waves.forEach((wave, index) => {
    if (wave.sourceNodeIds.length !== expectedWaveCounts[index]) issues.push(issue('POSTG_APP_WAVE_SIZE_MISMATCH', \`waves.\${wave.waveId}\`));
  });`;
const waveFreezeReplacement = `${waveFreezeAnchor}
  const w03Plan = wavePlan.waves.find((row) => row.waveId === 'W03');
  if (w03Plan?.executionFrozen !== true
      || w03Plan?.implementationAllowed !== false
      || w03Plan?.freezeAuthorityPath !== W02_A09A_POLICY_PATH
      || wavePlan.lastTransition?.taskId !== W02_A09A_TASK
      || wavePlan.lastTransition?.frozenWaveId !== 'W03'
      || wavePlan.lastTransition?.nextTaskId !== W02_A09A_NEXT_TASK) {
    issues.push(issue('POSTG_APP_W03_WAVE_PLAN_FREEZE_INVALID', 'waves.W03'));
  }`;
replaceExact(waveFreezeAnchor, waveFreezeReplacement, 'wave-plan freeze');

fs.writeFileSync(TARGET, source);
console.log(JSON.stringify({ restoredFrom: BASE_SHA, target: TARGET, bytes: Buffer.byteLength(source) }));
