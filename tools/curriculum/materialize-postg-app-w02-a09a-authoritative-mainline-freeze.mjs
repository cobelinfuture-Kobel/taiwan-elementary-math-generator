#!/usr/bin/env node
import fs from 'node:fs';

const TASK = 'POSTG-APP-W02-A09A_CanonicalCurriculumAuthorityReconciliationAndLegacyApplicationRouteFreeze';
const STATUS = 'W02_CANONICAL_AUTHORITY_GAP_MATERIALIZED_W03_EXECUTION_FROZEN';
const NEXT = 'POSTG-APP-W02-A09A1_BatchBCanonicalKnowledgePointRegistryMaterializationAnd90CandidateReconciliation';
const POLICY = 'data/curriculum/application/governance/postg-app-w02-a09a-authority-freeze.json';
const CLAIM = 'data/project/milestones/POSTG-APP-W02-A09A.claim.json';
const BLOCKER = 'BATCH_B_CANONICAL_KNOWLEDGE_POINT_AUTHORITY_AND_SHARED_PUBLIC_APPLICATION_CONSUMER_PENDING';

const changed = [];
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => {
  const next = `${JSON.stringify(value, null, 2)}\n`;
  const current = fs.readFileSync(file, 'utf8');
  if (current !== next) {
    fs.writeFileSync(file, next);
    changed.push(file);
  }
};
const replaceExact = (file, before, after) => {
  const current = fs.readFileSync(file, 'utf8');
  if (current.includes(after)) return;
  if (!current.includes(before)) {
    throw new Error(`Unexpected patch anchor in ${file}: ${before.slice(0, 120)}`);
  }
  fs.writeFileSync(file, current.replace(before, after));
  changed.push(file);
};
const insertAfterExact = (file, anchor, insertion) => {
  const current = fs.readFileSync(file, 'utf8');
  if (current.includes(insertion.trim())) return;
  if (!current.includes(anchor)) throw new Error(`Missing insertion anchor in ${file}`);
  fs.writeFileSync(file, current.replace(anchor, `${anchor}${insertion}`));
  changed.push(file);
};

const controllerPath = 'src/curriculum/application/postg-app-master-controller.mjs';
insertAfterExact(
  controllerPath,
  `} from './w02-a08r4-third-operator-approval.mjs';\n`,
  `import {\n  W02_A09A_NEXT_TASK,\n  W02_A09A_STATUS,\n  W02_A09A_TASK\n} from './w02-a09a-authority-reconciliation-freeze.mjs';\n`
);
insertAfterExact(
  controllerPath,
  `  if (wavePlan.coverage?.productionAdmittedWaveCount !== 2) {\n    issues.push(issue('POSTG_APP_WAVE_PLAN_COVERAGE_INVALID', WAVE_PLAN_PATH));\n  }\n`,
  `  const w03 = wavePlan.waves.find((row) => row.waveId === 'W03');\n  if (w03?.executionFrozen !== true\n      || w03?.implementationAllowed !== false\n      || w03?.freezeAuthorityPath !== W02_A09A_POLICY_PATH) {\n    issues.push(issue('POSTG_APP_WAVE_PLAN_W03_FREEZE_INVALID', 'waves.W03'));\n  }\n  if (wavePlan.lastTransition?.taskId !== W02_A09A_TASK\n      || wavePlan.lastTransition?.decision !== 'FREEZE'\n      || wavePlan.lastTransition?.frozenWaveId !== 'W03'\n      || wavePlan.lastTransition?.nextTaskId !== W02_A09A_NEXT_TASK) {\n    issues.push(issue('POSTG_APP_WAVE_PLAN_A09A_TRANSITION_INVALID', 'lastTransition'));\n  }\n`
);
replaceExact(
  controllerPath,
  `      || w02State.productionRuntimeAccessEnabled !== true\n      || w02State.publicSelectableCandidateCount !== 0) {`,
  `      || w02State.productionRuntimeAccessEnabled !== true\n      || w02State.publicSelectableCandidateCount !== 0\n      || w02State.canonicalCurriculumAuthorityReconciliationRequired !== true\n      || w02State.canonicalCurriculumAuthorityReconciled !== false\n      || w02State.globalContextSingleApplicationAuthorityRequired !== true\n      || w02State.legacyApplicationRoutesFrozen !== true) {`
);
replaceExact(
  controllerPath,
  `  const w03State = controllerState.waveStates[2];\n  if (w03State.state !== 'ASSESSMENT_READY'\n      || w03State.productionAdmissionGranted !== false\n      || w03State.shadowProjectionAllowed !== false) {\n    issues.push(issue('POSTG_APP_W03_ASSESSMENT_READY_STATE_INVALID', 'controllerState.waveStates.W03'));\n  }\n  if (controllerState.currentWaveId !== 'W03'\n      || controllerState.currentCapability !== 'W03_ASSESSMENT_READY'\n      || controllerState.currentMainlineBlocker !== 'W03_SOURCE_ASSESSMENT_PENDING'\n      || controllerState.nextShortestStep !== W03_A00_TASK) {\n    issues.push(issue('POSTG_APP_CONTROLLER_TRANSITION_INVALID', 'controllerState'));\n  }`,
  `  const w03State = controllerState.waveStates[2];\n  if (w03State.state !== 'ASSESSMENT_READY'\n      || w03State.productionAdmissionGranted !== false\n      || w03State.shadowProjectionAllowed !== false\n      || w03State.executionFrozen !== true\n      || w03State.implementationAllowed !== false\n      || w03State.freezeStatus !== W02_A09A_STATUS) {\n    issues.push(issue('POSTG_APP_W03_ASSESSMENT_READY_FREEZE_INVALID', 'controllerState.waveStates.W03'));\n  }\n  if (controllerState.currentWaveId !== 'W02'\n      || controllerState.currentCapability !== W02_A09A_STATUS\n      || controllerState.currentMainlineBlocker !== '${BLOCKER}'\n      || controllerState.nextShortestStep !== W02_A09A_NEXT_TASK\n      || controllerState.mainlineExecutionFreeze?.active !== true\n      || controllerState.mainlineExecutionFreeze?.authorityPath !== W02_A09A_POLICY_PATH) {\n    issues.push(issue('POSTG_APP_CONTROLLER_TRANSITION_INVALID', 'controllerState'));\n  }`
);
replaceExact(
  controllerPath,
  `    status: validation.ok\n      ? W02_A08R4_STATUS\n      : 'BLOCKED_BY_M00_CONTROLLER_VALIDATION',`,
  `    status: validation.ok\n      ? W02_A09A_STATUS\n      : 'BLOCKED_BY_M00_CONTROLLER_VALIDATION',`
);

const wavePlanPath = 'data/curriculum/application/controller/postg-app-wave-plan.json';
const wavePlan = readJson(wavePlanPath);
wavePlan.status = 'FIXED_SIX_WAVE_QUEUE_W01_W02_ADMITTED_W03_EXECUTION_FROZEN';
const w03Plan = wavePlan.waves.find((row) => row.waveId === 'W03');
Object.assign(w03Plan, {
  controllerState: 'ASSESSMENT_READY',
  executionFrozen: true,
  implementationAllowed: false,
  freezeReason: 'BATCH_B_CANONICAL_KNOWLEDGE_POINT_AUTHORITY_MISSING',
  freezeAuthorityPath: POLICY,
  nextAllowedTaskId: NEXT
});
wavePlan.lastTransition = {
  taskId: TASK,
  decision: 'FREEZE',
  completedWaveId: 'W02',
  activatedWaveId: null,
  frozenWaveId: 'W03',
  transitionDate: '2026-07-24',
  nextTaskId: NEXT
};
writeJson(wavePlanPath, wavePlan);

const controllerStatePath = 'data/curriculum/application/controller/postg-app-master-controller-state.json';
const controllerState = readJson(controllerStatePath);
controllerState.taskId = TASK;
controllerState.status = STATUS;
controllerState.currentWaveId = 'W02';
controllerState.currentCapability = STATUS;
controllerState.currentMainlineBlocker = BLOCKER;
controllerState.nextShortestStep = NEXT;
controllerState.dependencies = {
  ...(controllerState.dependencies ?? {}),
  w02CanonicalAuthorityFreezeTaskId: TASK
};
controllerState.authoritativeState = {
  ...(controllerState.authoritativeState ?? {}),
  w02CanonicalAuthorityFreezePolicy: POLICY,
  w02CanonicalAuthorityFreezeClaim: CLAIM,
  w02CanonicalAuthorityFreezeRuntime: 'src/curriculum/application/w02-a09a-authority-reconciliation-freeze.mjs',
  w02CanonicalAuthorityFreezeValidationCli: 'tools/curriculum/validate-postg-app-w02-a09a-authority-reconciliation-freeze.mjs'
};
controllerState.mainlineExecutionFreeze = {
  active: true,
  status: STATUS,
  authorityPath: POLICY,
  claimPath: CLAIM,
  blockedWaveIds: ['W03', 'W04', 'W05', 'W06'],
  nextShortestStep: NEXT
};
const w02State = controllerState.waveStates.find((row) => row.waveId === 'W02');
Object.assign(w02State, {
  canonicalCurriculumAuthorityReconciliationRequired: true,
  canonicalCurriculumAuthorityReconciled: false,
  canonicalCurriculumAuthorityPath: POLICY,
  globalContextSingleApplicationAuthorityRequired: true,
  legacyApplicationRoutesFrozen: true,
  publicSelectableCandidateCount: 0,
  publicRouteChanged: false
});
const w03State = controllerState.waveStates.find((row) => row.waveId === 'W03');
Object.assign(w03State, {
  state: 'ASSESSMENT_READY',
  executionFrozen: true,
  implementationAllowed: false,
  freezeStatus: STATUS,
  freezeAuthorityPath: POLICY,
  nextAllowedTaskId: NEXT,
  shadowProjectionAllowed: false,
  productionAdmissionGranted: false,
  publicSelectable: false
});
controllerState.producerStateConsumerReadback = {
  producerTaskId: TASK,
  authoritativeState: POLICY,
  runtimeConsumer: controllerPath,
  readbackStatus: STATUS,
  productionEvidence: 'docs/curriculum/output/postg-app/w02-a08r4/POSTG_APP_W02_A08R4_THIRD_OPERATOR_REVIEW_EVIDENCE.json',
  mainlineExecutionFreezeAuthority: POLICY
};
writeJson(controllerStatePath, controllerState);

for (const registryPath of [
  'data/curriculum/application/registry/application-capability-registry.json',
  'data/curriculum/application/registry/wave-application-admission-registry.json'
]) {
  const registry = readJson(registryPath);
  const rows = registry.waveProviders ?? registry.waves;
  const w02 = rows.find((row) => row.waveId === 'W02');
  Object.assign(w02, {
    canonicalCurriculumAuthorityReconciliationRequired: true,
    publicSelectable: false
  });
  const w03 = rows.find((row) => row.waveId === 'W03');
  Object.assign(w03, {
    executionFrozen: true,
    implementationAllowed: false,
    freezeAuthorityPath: POLICY,
    nextAllowedTaskId: NEXT,
    shadowProjectionAllowed: false,
    productionAdmitted: false,
    publicSelectable: false
  });
  registry.status = `${registry.status}_W03_EXECUTION_FROZEN`.replace(/(_W03_EXECUTION_FROZEN)+$/, '_W03_EXECUTION_FROZEN');
  writeJson(registryPath, registry);
}

const m00TestPath = 'tests/curriculum/postg-app-m00-master-controller.test.js';
insertAfterExact(
  m00TestPath,
  `const W03_A00_TASK = 'POSTG-APP-W03-A00_13SourceNodeApplicationCapabilityAssessmentAndAdmissionBaseline';\n`,
  `const A09A_STATUS = '${STATUS}';\nconst A09A_TASK = '${NEXT}';\n`
);
replaceExact(
  m00TestPath,
  `test('M00 validates W01 and W02 admitted with W03 assessment-ready', () => {`,
  `test('M00 validates W01 and W02 admitted while W03 execution is frozen by A09A', () => {`
);
replaceExact(m00TestPath, `  assert.equal(result.status, A08R4_STATUS);`, `  assert.equal(result.status, A09A_STATUS);`);
replaceExact(m00TestPath, `  assert.equal(result.currentWaveId, 'W03');\n  assert.equal(result.nextShortestStep, W03_A00_TASK);`, `  assert.equal(result.currentWaveId, 'W02');\n  assert.equal(result.nextShortestStep, A09A_TASK);`);
insertAfterExact(
  m00TestPath,
  `  assert.equal(state.publicSelectableCandidateCount, 0);\n`,
  `  assert.equal(state.canonicalCurriculumAuthorityReconciliationRequired, true);\n  assert.equal(state.canonicalCurriculumAuthorityReconciled, false);\n  assert.equal(state.globalContextSingleApplicationAuthorityRequired, true);\n  assert.equal(state.legacyApplicationRoutesFrozen, true);\n`
);
insertAfterExact(
  m00TestPath,
  `  assert.equal(state.thirdOperatorReviewReady, true);\n});\n`,
  `\ntest('A09A is the authoritative current state and W03 cannot start implementation', () => {\n  const w03 = controller.controllerState.waveStates.find((row) => row.waveId === 'W03');\n  assert.equal(controller.controllerState.taskId, '${TASK}');\n  assert.equal(controller.controllerState.status, A09A_STATUS);\n  assert.equal(controller.controllerState.currentWaveId, 'W02');\n  assert.equal(controller.controllerState.nextShortestStep, A09A_TASK);\n  assert.equal(controller.controllerState.mainlineExecutionFreeze.active, true);\n  assert.equal(w03.state, 'ASSESSMENT_READY');\n  assert.equal(w03.executionFrozen, true);\n  assert.equal(w03.implementationAllowed, false);\n  assert.equal(w03.shadowProjectionAllowed, false);\n  assert.equal(w03.productionAdmissionGranted, false);\n  assert.equal(w03.publicSelectable, false);\n});\n`
);
insertAfterExact(
  m00TestPath,
  `  assert.equal(controller.w02A08R4Claim.claims.productionAdmitted, true);\n`,
  `  assert.equal(controller.w02A09AClaim.actualEvidenceLevel, 'E3_SHADOW_RUNTIME_INTEGRATED');\n  assert.equal(controller.w02A09AClaim.claimedStatus, A09A_STATUS);\n  assert.equal(controller.w02A09AClaim.authorityFinding.w03ExecutionAllowed, false);\n`
);

const a09aTestPath = 'tests/curriculum/postg-app-w02-a09a-authority-reconciliation-freeze.test.js';
insertAfterExact(
  a09aTestPath,
  `} from '../../src/curriculum/application/w02-a09a-authority-reconciliation-freeze.mjs';\n`,
  `import { loadPOSTGAPPMasterController } from '../../src/curriculum/application/postg-app-master-controller.mjs';\n`
);
insertAfterExact(
  a09aTestPath,
  `  assert.equal(readback.nextShortestStep, W02_A09A_NEXT_TASK);\n`,
  `  const controller = loadPOSTGAPPMasterController();\n  const w03 = controller.controllerState.waveStates.find((row) => row.waveId === 'W03');\n  assert.equal(controller.controllerState.taskId, 'POSTG-APP-W02-A09A_CanonicalCurriculumAuthorityReconciliationAndLegacyApplicationRouteFreeze');\n  assert.equal(controller.controllerState.status, W02_A09A_STATUS);\n  assert.equal(controller.controllerState.currentWaveId, 'W02');\n  assert.equal(controller.controllerState.nextShortestStep, W02_A09A_NEXT_TASK);\n  assert.equal(controller.controllerState.mainlineExecutionFreeze.active, true);\n  assert.equal(w03.executionFrozen, true);\n  assert.equal(w03.implementationAllowed, false);\n`
);

console.log(JSON.stringify({ changed, changedCount: changed.length, status: STATUS, nextShortestStep: NEXT }, null, 2));
