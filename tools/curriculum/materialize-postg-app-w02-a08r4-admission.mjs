#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const touched = [];
const DECISION_PATH = 'data/curriculum/application/reviews/POSTG-APP-W02-A08R4_RegeneratedHTMLPDFThirdOperatorReviewDecision.json';
const EVIDENCE_PATH = 'docs/curriculum/output/postg-app/w02-a08r4/POSTG_APP_W02_A08R4_THIRD_OPERATOR_REVIEW_EVIDENCE.json';
const CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A08R4.claim.json';
const NEXT_TASK = 'POSTG-APP-W03-A00_13SourceNodeApplicationCapabilityAssessmentAndAdmissionBaseline';

function writeJson(repoPath, value) {
  const absolute = path.join(ROOT, repoPath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  const content = `${JSON.stringify(value, null, 2)}\n`;
  if (fs.existsSync(absolute) && fs.readFileSync(absolute, 'utf8') === content) return;
  fs.writeFileSync(absolute, content, 'utf8');
  touched.push(repoPath);
}
function sha256(repoPath) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, repoPath))).digest('hex');
}
function replaceOnce(repoPath, before, after) {
  const absolute = path.join(ROOT, repoPath);
  const current = fs.readFileSync(absolute, 'utf8');
  if (current.includes(after)) return;
  if (!current.includes(before)) throw new Error(`A08R4_PATCH_ANCHOR_MISSING:${repoPath}`);
  fs.writeFileSync(absolute, current.replace(before, after), 'utf8');
  touched.push(repoPath);
}

const capabilityPath = 'data/curriculum/application/registry/application-capability-registry.json';
const capability = JSON.parse(fs.readFileSync(path.join(ROOT, capabilityPath), 'utf8'));
const w02Provider = capability.waveProviders.find((row) => row.waveId === 'W02');
Object.assign(w02Provider, {
  lifecycleState: 'PRODUCTION_ADMITTED',
  productionAdmitted: true,
  publicSelectable: false,
  admissionDecisionPath: DECISION_PATH,
  productionEvidencePath: EVIDENCE_PATH
});
const w03Provider = capability.waveProviders.find((row) => row.waveId === 'W03');
Object.assign(w03Provider, {
  lifecycleState: 'ASSESSMENT_READY',
  shadowProjectionAllowed: false,
  productionAdmitted: false,
  publicSelectable: false
});
writeJson(capabilityPath, capability);

const admissionPath = 'data/curriculum/application/registry/wave-application-admission-registry.json';
const admission = JSON.parse(fs.readFileSync(path.join(ROOT, admissionPath), 'utf8'));
admission.admittedWaveIds = ['W01', 'W02'];
Object.assign(admission.waves.find((row) => row.waveId === 'W02'), {
  admissionState: 'PRODUCTION_ADMITTED',
  shadowProjectionAllowed: true,
  productionAdmitted: true,
  publicSelectable: false
});
Object.assign(admission.waves.find((row) => row.waveId === 'W03'), {
  admissionState: 'ASSESSMENT_READY',
  shadowProjectionAllowed: false,
  productionAdmitted: false,
  publicSelectable: false
});
writeJson(admissionPath, admission);

const wavePlanPath = 'data/curriculum/application/controller/postg-app-wave-plan.json';
const wavePlan = JSON.parse(fs.readFileSync(path.join(ROOT, wavePlanPath), 'utf8'));
wavePlan.status = 'FIXED_SIX_WAVE_QUEUE_W01_W02_ADMITTED_W03_ASSESSMENT_READY';
Object.assign(wavePlan.waves.find((row) => row.waveId === 'W02'), {
  controllerState: 'PRODUCTION_ADMITTED',
  productionAdmissionGranted: true
});
Object.assign(wavePlan.waves.find((row) => row.waveId === 'W03'), {
  controllerState: 'ASSESSMENT_READY',
  productionAdmissionGranted: false
});
wavePlan.coverage.productionAdmittedWaveCount = 2;
wavePlan.lastTransition = {
  taskId: 'POSTG-APP-W02-A08R4_RegeneratedHTMLPDFThirdOperatorReviewDecision',
  decision: 'APPROVE',
  completedWaveId: 'W02',
  activatedWaveId: 'W03',
  transitionDate: '2026-07-24'
};
writeJson(wavePlanPath, wavePlan);

const claim = {
  schemaVersion: 1,
  taskId: 'POSTG-APP-W02-A08R4_RegeneratedHTMLPDFThirdOperatorReviewDecision',
  taskClass: 'operator_review',
  targetEvidenceLevel: 'E5_PRODUCTION_ADMITTED',
  actualEvidenceLevel: 'E5_PRODUCTION_ADMITTED',
  claimedStatus: 'W02_PRODUCTION_ADMITTED_W03_ASSESSMENT_READY',
  claims: {
    dataStructureReady: true,
    contentAuthored: true,
    runtimeIntegrated: true,
    productionEquivalentGeneratorUsed: true,
    productionRendererUsed: true,
    htmlOutputVerified: true,
    pdfOutputVerified: true,
    visibleOutputChanged: true,
    humanReviewReady: true,
    productionAdmitted: true,
    d0Complete: false
  },
  evidence: {
    runtimeTestPaths: [
      'src/curriculum/application/w02-a08r4-third-operator-approval.mjs',
      'src/curriculum/application/shared/application-capability-resolver.mjs',
      'tests/curriculum/postg-app-w02-a08r4-third-operator-approval.test.js',
      'tools/curriculum/validate-postg-app-w02-a08r4-third-operator-approval.mjs'
    ],
    rendererTestPaths: [
      'src/curriculum/application/shared/production-equivalent-html-pdf-runtime.mjs',
      'tools/curriculum/verify-postg-app-w02-a06-pdf.py'
    ],
    htmlArtifactPaths: [
      'docs/curriculum/output/postg-app/w02-a06/POSTG_APP_W02_A06_NUMERIC_WORKSHEET.html',
      'docs/curriculum/output/postg-app/w02-a06/POSTG_APP_W02_A06_APPLICATION_WORKSHEET.html'
    ],
    pdfArtifactPaths: [
      'docs/curriculum/output/postg-app/w02-a06/POSTG_APP_W02_A06_NUMERIC_WORKSHEET.pdf',
      'docs/curriculum/output/postg-app/w02-a06/POSTG_APP_W02_A06_APPLICATION_WORKSHEET.pdf'
    ],
    beforeAfterEvidencePaths: [
      'docs/curriculum/output/postg-app/w02-a08r3/POSTG_APP_W02_A08R3_NUMERIC_SURFACE_REMEDIATION_EVIDENCE.json',
      EVIDENCE_PATH
    ],
    reviewArtifactPaths: [EVIDENCE_PATH, DECISION_PATH],
    artifactHashes: [
      { path: EVIDENCE_PATH, sha256: sha256(EVIDENCE_PATH) },
      { path: DECISION_PATH, sha256: sha256(DECISION_PATH) }
    ]
  },
  humanReview: {
    type: 'production_equivalent_output_review',
    canUnlockProduction: true,
    reviewArtifactRequired: true,
    decision: 'APPROVE'
  },
  distance: {
    before: 'D1',
    after: 'D1',
    distanceReduced: 'W02 has passed the third complete-cohort operator review and is connected to the shared production runtime at E5; W03 is now the next assessment-ready wave.'
  },
  nextStep: {
    taskId: NEXT_TASK,
    requiredEvidenceLevelBeforeStart: 'E5_PRODUCTION_ADMITTED'
  }
};
writeJson(CLAIM_PATH, claim);

replaceOnce(
  'src/curriculum/application/shared/application-capability-resolver.mjs',
  `  const w01 = providers[0];
  const w02 = providers[1];
  if (w01.lifecycleState !== 'PRODUCTION_ADMITTED'
      || w01.productionAdmitted !== true
      || w01.publicSelectable !== true) {
    issues.push(issue('POSTG_APP_SHARED_W01_PROVIDER_STATE_INVALID', 'W01'));
  }
  if (w02.providerType !== 'DYNAMIC_WAVE_PROVIDER'
      || w02.lifecycleState !== 'SHARED_SHADOW_VALIDATED'
      || w02.shadowProjectionAllowed !== true
      || w02.productionAdmitted !== false
      || w02.publicSelectable !== false) {
    issues.push(issue('POSTG_APP_SHARED_W02_PROVIDER_STATE_INVALID', 'W02'));
  }
  for (const provider of providers.slice(2)) {
    if (provider.providerType !== 'RESERVED_FUTURE_WAVE_SLOT'
        || provider.lifecycleState !== 'BLOCKED_BY_PREVIOUS_WAVE'
        || provider.entryMaterialization !== null
        || provider.shadowProjectionAllowed !== false
        || provider.productionAdmitted !== false
        || provider.publicSelectable !== false) {
      issues.push(issue('POSTG_APP_SHARED_FUTURE_WAVE_SLOT_INVALID', provider.waveId));
    }
  }
  if (JSON.stringify(registries.admissionRegistry.admittedWaveIds) !== JSON.stringify(['W01'])) {
    issues.push(issue('POSTG_APP_SHARED_ADMISSION_PREFIX_INVALID', 'admissionRegistry.admittedWaveIds'));
  }`,
  `  const admittedWaveIds = registries.admissionRegistry.admittedWaveIds ?? [];
  const expectedPrefix = WAVE_ORDER.slice(0, admittedWaveIds.length);
  if (admittedWaveIds.length === 0
      || JSON.stringify(admittedWaveIds) !== JSON.stringify(expectedPrefix)) {
    issues.push(issue('POSTG_APP_SHARED_ADMISSION_PREFIX_INVALID', 'admissionRegistry.admittedWaveIds'));
  }
  const nextWaveId = WAVE_ORDER[admittedWaveIds.length] ?? null;
  for (const provider of providers) {
    const admitted = admittedWaveIds.includes(provider.waveId);
    if (admitted) {
      const providerTypeValid = provider.waveId === 'W01'
        ? provider.providerType === 'EXISTING_RUNTIME_PROVIDER'
        : provider.providerType === 'DYNAMIC_WAVE_PROVIDER';
      if (!providerTypeValid
          || provider.lifecycleState !== 'PRODUCTION_ADMITTED'
          || provider.shadowProjectionAllowed !== true
          || provider.productionAdmitted !== true) {
        issues.push(issue('POSTG_APP_SHARED_ADMITTED_PROVIDER_STATE_INVALID', provider.waveId));
      }
      continue;
    }
    const expectedState = provider.waveId === nextWaveId ? 'ASSESSMENT_READY' : 'BLOCKED_BY_PREVIOUS_WAVE';
    if (provider.providerType !== 'RESERVED_FUTURE_WAVE_SLOT'
        || provider.lifecycleState !== expectedState
        || provider.entryMaterialization !== null
        || provider.shadowProjectionAllowed !== false
        || provider.productionAdmitted !== false
        || provider.publicSelectable !== false) {
      issues.push(issue('POSTG_APP_SHARED_FUTURE_WAVE_SLOT_INVALID', provider.waveId));
    }
  }`
);

replaceOnce(
  'src/curriculum/application/w02-a08r3-numeric-surface-remediation.mjs',
  `  if (a06Package.generatedItems.some((item) => item.productionSelectable || item.publicSelectable)
      || a06Package.projection.access.w02.provider.productionAdmitted
      || a06Package.projection.access.w02.provider.publicSelectable) {
    issues.push(issue('POSTG_APP_W02_A08R3_PREMATURE_ADMISSION', 'boundaries'));
  }`,
  `  const successorAdmissionPresent = fs.existsSync(path.join(materialized.root, 'data/project/milestones/POSTG-APP-W02-A08R4.claim.json'));
  const itemAdmissionLeak = a06Package.generatedItems.some((item) => item.productionSelectable || item.publicSelectable);
  const registryAdmissionLeak = a06Package.projection.access.w02.provider.productionAdmitted
    || a06Package.projection.access.w02.provider.publicSelectable;
  if (itemAdmissionLeak || (!successorAdmissionPresent && registryAdmissionLeak)) {
    issues.push(issue('POSTG_APP_W02_A08R3_PREMATURE_ADMISSION', 'boundaries'));
  }`
);

replaceOnce(
  'src/curriculum/application/postg-app-master-controller.mjs',
  `} from './w02-a08r3-numeric-surface-remediation.mjs';`,
  `} from './w02-a08r3-numeric-surface-remediation.mjs';
import {
  applyW02A08R4ControllerOverlay,
  loadW02A08R4ControllerEvidence,
  validateW02A08R4ControllerEvidence
} from './w02-a08r4-controller-overlay.mjs';
import {
  W02_A08R4_STATUS,
  W03_A00_TASK
} from './w02-a08r4-third-operator-approval.mjs';`
);
replaceOnce(
  'src/curriculum/application/postg-app-master-controller.mjs',
  `  const a08r3Evidence = loadW02A08R3ControllerEvidence({ root });
  const controllerState = applyW02A08R3ControllerOverlay({ root, controllerState: a08r2ControllerState });`,
  `  const a08r3Evidence = loadW02A08R3ControllerEvidence({ root });
  const a08r3ControllerState = applyW02A08R3ControllerOverlay({ root, controllerState: a08r2ControllerState });
  const a08r4Evidence = loadW02A08R4ControllerEvidence({ root });
  const controllerState = applyW02A08R4ControllerOverlay({ root, controllerState: a08r3ControllerState });`
);
replaceOnce(
  'src/curriculum/application/postg-app-master-controller.mjs',
  `    ...a08r2Evidence,
    ...a08r3Evidence`,
  `    ...a08r2Evidence,
    ...a08r3Evidence,
    ...a08r4Evidence`
);
replaceOnce(
  'src/curriculum/application/postg-app-master-controller.mjs',
  `  if (JSON.stringify(admitted.admitted) !== JSON.stringify(['W01'])) issues.push(issue('POSTG_APP_PRODUCTION_ADMITTED_WAVE_SET_INVALID', 'waves'));`,
  `  if (JSON.stringify(admitted.admitted) !== JSON.stringify(['W01', 'W02'])) issues.push(issue('POSTG_APP_PRODUCTION_ADMITTED_WAVE_SET_INVALID', 'waves'));`
);
replaceOnce(
  'src/curriculum/application/postg-app-master-controller.mjs',
  `  const expectedStates = [
    'PRODUCTION_ADMITTED',
    W02_A08R3_STATUS,
    'BLOCKED_BY_PREVIOUS_WAVE',`,
  `  const expectedStates = [
    'PRODUCTION_ADMITTED',
    'PRODUCTION_ADMITTED',
    'ASSESSMENT_READY',`
);
replaceOnce(
  'src/curriculum/application/postg-app-master-controller.mjs',
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
      || w02State.publicSelectableCandidateCount !== 0) {
    issues.push(issue('POSTG_APP_W02_PRODUCTION_ADMISSION_STATE_INVALID', 'controllerState.waveStates.W02'));
  }
  const w03State = controllerState.waveStates[2];
  if (w03State.state !== 'ASSESSMENT_READY'
      || w03State.productionAdmissionGranted !== false
      || w03State.shadowProjectionAllowed !== false) {
    issues.push(issue('POSTG_APP_W03_ASSESSMENT_READY_STATE_INVALID', 'controllerState.waveStates.W03'));
  }
  if (controllerState.currentWaveId !== 'W03'
      || controllerState.currentCapability !== 'W03_ASSESSMENT_READY'
      || controllerState.currentMainlineBlocker !== 'W03_SOURCE_ASSESSMENT_PENDING'
      || controllerState.nextShortestStep !== W03_A00_TASK) {
    issues.push(issue('POSTG_APP_CONTROLLER_TRANSITION_INVALID', 'controllerState'));
  }
  if (controllerState.productionAdmission.applicationUnitCount !== 25
      || controllerState.productionAdmission.waveCount !== 2
      || controllerState.productionAdmission.allowed !== true
      || controllerState.productionAdmission.lastReviewDecision !== 'APPROVE'
      || JSON.stringify(controllerState.productionAdmission.admittedWaveIds ?? []) !== JSON.stringify(['W01', 'W02'])
      || controllerState.productionAdmission.publicRouteChanged !== false) {
    issues.push(issue('POSTG_APP_PRODUCTION_ADMISSION_STATE_INVALID', 'controllerState.productionAdmission'));
  }`
);
replaceOnce(
  'src/curriculum/application/postg-app-master-controller.mjs',
  `  issues.push(...validateW02A08R3ControllerEvidence(controller));`,
  `  issues.push(...validateW02A08R3ControllerEvidence(controller));
  issues.push(...validateW02A08R4ControllerEvidence(controller));`
);
replaceOnce(
  'src/curriculum/application/postg-app-master-controller.mjs',
  `      ? W02_A08R3_STATUS
      : 'BLOCKED_BY_M00_CONTROLLER_VALIDATION'`,
  `      ? W02_A08R4_STATUS
      : 'BLOCKED_BY_M00_CONTROLLER_VALIDATION'`
);
replaceOnce(
  'src/curriculum/application/postg-app-master-controller.mjs',
  `    productionSelectable: false`,
  `    productionSelectable: Boolean(controller.controllerState.waveStates.find((row) => row.waveId === waveId)?.productionAdmissionGranted),
    publicSelectable: false`
);

replaceOnce(
  'tests/curriculum/postg-app-m00-master-controller.test.js',
  `const A08R4_TASK = 'POSTG-APP-W02-A08R4_RegeneratedHTMLPDFThirdOperatorReviewDecision';`,
  `const A08R4_TASK = 'POSTG-APP-W02-A08R4_RegeneratedHTMLPDFThirdOperatorReviewDecision';
const A08R4_STATUS = 'W02_PRODUCTION_ADMITTED_W03_ASSESSMENT_READY';
const W03_A00_TASK = 'POSTG-APP-W03-A00_13SourceNodeApplicationCapabilityAssessmentAndAdmissionBaseline';
const A08R4_DECISION_PATH = 'data/curriculum/application/reviews/POSTG-APP-W02-A08R4_RegeneratedHTMLPDFThirdOperatorReviewDecision.json';`
);
replaceOnce(
  'tests/curriculum/postg-app-m00-master-controller.test.js',
  `test('M00 validates the exact 79-node scope with W01 admitted and W02 A08R3 third-review ready', () => {`,
  `test('M00 validates W01 and W02 admitted with W03 assessment-ready', () => {`
);
replaceOnce('tests/curriculum/postg-app-m00-master-controller.test.js', `  assert.equal(result.status, A08R3_STATUS);`, `  assert.equal(result.status, A08R4_STATUS);`);
replaceOnce('tests/curriculum/postg-app-m00-master-controller.test.js', `    productionAdmittedApplicationUnitCount: 12`, `    productionAdmittedApplicationUnitCount: 25`);
replaceOnce('tests/curriculum/postg-app-m00-master-controller.test.js', `  assert.equal(result.currentWaveId, 'W02');`, `  assert.equal(result.currentWaveId, 'W03');`);
replaceOnce('tests/curriculum/postg-app-m00-master-controller.test.js', `  assert.equal(result.nextShortestStep, A08R4_TASK);`, `  assert.equal(result.nextShortestStep, W03_A00_TASK);`);
replaceOnce(
  'tests/curriculum/postg-app-m00-master-controller.test.js',
  `test('Wave 01 remains the only production-admitted wave', () => {`,
  `test('W01 and W02 form the contiguous production-admitted prefix', () => {`
);
replaceOnce('tests/curriculum/postg-app-m00-master-controller.test.js', `  assert.equal(w01.productionSelectable, false);`, `  assert.equal(w01.productionSelectable, true);`);
replaceOnce('tests/curriculum/postg-app-m00-master-controller.test.js', `  assert.deepEqual(controller.controllerState.productionAdmission.admittedWaveIds, ['W01']);`, `  assert.deepEqual(controller.controllerState.productionAdmission.admittedWaveIds, ['W01', 'W02']);`);
replaceOnce('tests/curriculum/postg-app-m00-master-controller.test.js', `  assert.equal(controller.controllerState.productionAdmission.applicationUnitCount, 12);`, `  assert.equal(controller.controllerState.productionAdmission.applicationUnitCount, 25);`);
replaceOnce('tests/curriculum/postg-app-m00-master-controller.test.js', `  assert.equal(controller.controllerState.productionAdmission.waveCount, 1);`, `  assert.equal(controller.controllerState.productionAdmission.waveCount, 2);`);
replaceOnce(
  'tests/curriculum/postg-app-m00-master-controller.test.js',
  `test('Wave 02 records A08R3 numeric remediation without admission', () => {`,
  `test('Wave 02 records A08R4 approval and production admission', () => {`
);
replaceOnce('tests/curriculum/postg-app-m00-master-controller.test.js', `  assert.equal(w02.productionAdmissionGranted, false);`, `  assert.equal(w02.productionAdmissionGranted, true);`);
replaceOnce('tests/curriculum/postg-app-m00-master-controller.test.js', `  assert.equal(w02.productionSelectable, false);`, `  assert.equal(w02.productionSelectable, true);`);
replaceOnce('tests/curriculum/postg-app-m00-master-controller.test.js', `  assert.equal(state.state, A08R3_STATUS);`, `  assert.equal(state.state, 'PRODUCTION_ADMITTED');`);
replaceOnce('tests/curriculum/postg-app-m00-master-controller.test.js', `  assert.deepEqual(state.completedGates, REQUIRED_GATES.slice(0, 10));`, `  assert.deepEqual(state.completedGates, REQUIRED_GATES);`);
replaceOnce('tests/curriculum/postg-app-m00-master-controller.test.js', `  assert.equal(state.admissionGateComplete, false);`, `  assert.equal(state.admissionGateComplete, true);`);
replaceOnce('tests/curriculum/postg-app-m00-master-controller.test.js', `  assert.equal(state.productionAdmissionGranted, false);`, `  assert.equal(state.productionAdmissionGranted, true);`);
replaceOnce('tests/curriculum/postg-app-m00-master-controller.test.js', `  assert.equal(state.reviewDecision, 'REVISE');`, `  assert.equal(state.reviewDecision, 'APPROVE');`);
replaceOnce('tests/curriculum/postg-app-m00-master-controller.test.js', `  assert.equal(state.decisionEvidence, A08R2_DECISION_PATH);`, `  assert.equal(state.decisionEvidence, A08R4_DECISION_PATH);`);
replaceOnce('tests/curriculum/postg-app-m00-master-controller.test.js', `  assert.equal(state.operatorDecisionState, 'SECOND_REVISE_RECORDED');`, `  assert.equal(state.operatorDecisionState, 'THIRD_APPROVE_RECORDED');`);
replaceOnce('tests/curriculum/postg-app-m00-master-controller.test.js', `  assert.equal(state.productionAdmittedCandidateCount, 0);`, `  assert.equal(state.productionAdmittedCandidateCount, 195);`);
replaceOnce(
  'tests/curriculum/postg-app-m00-master-controller.test.js',
  `  assert.deepEqual(controller.controllerState.waveStates.slice(2).map((row) => row.state), [
    'BLOCKED_BY_PREVIOUS_WAVE',`,
  `  assert.deepEqual(controller.controllerState.waveStates.slice(2).map((row) => row.state), [
    'ASSESSMENT_READY',`
);
replaceOnce(
  'tests/curriculum/postg-app-m00-master-controller.test.js',
  `test('prior evidence levels remain unchanged while A08 stays non-production E4', () => {`,
  `test('prior evidence remains immutable while A08R4 adds the E5 admission claim', () => {`
);
replaceOnce(
  'tests/curriculum/postg-app-m00-master-controller.test.js',
  `  for (const claim of [controller.w02A06Claim, controller.w02A07Claim, controller.w02A08Claim, controller.w02A08R2Claim, controller.w02A08R3Claim]) {
    assert.equal(claim.actualEvidenceLevel, 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED');
    assert.equal(claim.claims.productionAdmitted, false);
    assert.equal(claim.claims.d0Complete, false);
  }`,
  `  for (const claim of [controller.w02A06Claim, controller.w02A07Claim, controller.w02A08Claim, controller.w02A08R2Claim, controller.w02A08R3Claim]) {
    assert.equal(claim.actualEvidenceLevel, 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED');
    assert.equal(claim.claims.productionAdmitted, false);
    assert.equal(claim.claims.d0Complete, false);
  }
  assert.equal(controller.w02A08R4Claim.actualEvidenceLevel, 'E5_PRODUCTION_ADMITTED');
  assert.equal(controller.w02A08R4Claim.claims.productionAdmitted, true);`
);
replaceOnce('tests/curriculum/postg-app-m00-master-controller.test.js', `  productionCase.wavePlan.waves[2].productionAdmissionGranted = true;
  productionCase.wavePlan.coverage.productionAdmittedWaveCount = 2;`, `  productionCase.wavePlan.waves[3].productionAdmissionGranted = true;
  productionCase.wavePlan.coverage.productionAdmittedWaveCount = 3;`);
replaceOnce('tests/curriculum/postg-app-m00-master-controller.test.js', `  stateCase.controllerState.waveStates[1].productionAdmissionGranted = true;
  assert.equal(codes(validatePOSTGAPPMasterController(stateCase)).includes('POSTG_APP_W02_ASSESSMENT_READY_STATE_INVALID'), true);`, `  stateCase.controllerState.waveStates[1].productionAdmissionGranted = false;
  assert.equal(codes(validatePOSTGAPPMasterController(stateCase)).includes('POSTG_APP_W02_PRODUCTION_ADMISSION_STATE_INVALID'), true);`);
replaceOnce('tests/curriculum/postg-app-m00-master-controller.test.js', `  transitionCase.controllerState.nextShortestStep = 'POSTG-APP-W03-A00';`, `  transitionCase.controllerState.nextShortestStep = 'POSTG-APP-W04-A00';`);

const w01TestPath = 'tests/curriculum/postg-app-w01-a06e-operator-approval.test.js';
replaceOnce(w01TestPath, `    'W02_A08R3_NUMERIC_SURFACE_REMEDIATED_THIRD_REVIEW_READY'`, `    'W02_A08R3_NUMERIC_SURFACE_REMEDIATED_THIRD_REVIEW_READY',
    'PRODUCTION_ADMITTED'`);

const overlayModule = await import(`${pathToFileURL(path.join(ROOT, 'src/curriculum/application/w02-a08r4-controller-overlay.mjs')).href}?t=${Date.now()}`);
const statePath = 'data/curriculum/application/controller/postg-app-master-controller-state.json';
const currentState = JSON.parse(fs.readFileSync(path.join(ROOT, statePath), 'utf8'));
const revisedState = overlayModule.applyW02A08R4ControllerOverlay({ root: ROOT, controllerState: currentState });
writeJson(statePath, revisedState);

process.stdout.write(`${JSON.stringify({ ok: true, touched }, null, 2)}\n`);
