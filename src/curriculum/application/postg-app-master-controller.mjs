import fs from 'node:fs';
import path from 'node:path';

import {
  loadGlobalContextAuthority,
  validateGlobalContextAuthority
} from '../context/global-context-ontology-resolver.mjs';
import { buildW02A08R1Readback } from './w02-a08r1-student-facing-remediation.mjs';
import {
  applyW02A08R2ControllerOverlay,
  loadW02A08R2ControllerEvidence,
  validateW02A08R2ControllerEvidence,
  W02_A08R2_DECISION_PATH,
  W02_A08R2_EVIDENCE_PATH,
  W02_A08R2_STATUS,
  W02_A08R3_TASK
} from './w02-a08r2-controller-overlay.mjs';
import {
  applyW02A08R3ControllerOverlay,
  loadW02A08R3ControllerEvidence,
  validateW02A08R3ControllerEvidence,
  W02_A08R3_BLOCKER
} from './w02-a08r3-controller-overlay.mjs';
import {
  W02_A08R3_STATUS,
  W02_A08R4_TASK
} from './w02-a08r3-numeric-surface-remediation.mjs';
import {
  applyW02A08R4ControllerOverlay,
  loadW02A08R4ControllerEvidence,
  validateW02A08R4ControllerEvidence
} from './w02-a08r4-controller-overlay.mjs';
import {
  W02_A08R4_STATUS,
  W03_A00_TASK
} from './w02-a08r4-third-operator-approval.mjs';
import {
  applyW02A08R4ControllerOverlay,
  loadW02A08R4ControllerEvidence,
  validateW02A08R4ControllerEvidence
} from './w02-a08r4-controller-overlay.mjs';
import {
  W02_A08R4_CLAIM_PATH,
  W02_A08R4_DECISION_PATH,
  W02_A08R4_EVIDENCE_PATH,
  W02_A08R4_STATUS,
  W03_A00_TASK
} from './w02-a08r4-third-operator-approval.mjs';

const UNIT_REGISTRY_PATH = 'data/curriculum/application/controller/postg-app-79-unit-registry.json';
const WAVE_PLAN_PATH = 'data/curriculum/application/controller/postg-app-wave-plan.json';
const CONTROLLER_STATE_PATH = 'data/curriculum/application/controller/postg-app-master-controller-state.json';
const W01_APPROVAL_PATH = 'data/curriculum/application/reviews/POSTG-APP-W01-A06E_OperatorSecondHumanReviewDecision.json';
const W01_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W01-A06.claim.json';
const W02_A00_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A00.claim.json';
const W02_A01A_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A01A.claim.json';
const W02_A01B_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A01B.claim.json';
const W02_A01C_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A01C.claim.json';
const W02_A01D_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A01D.claim.json';
const W02_A02_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A02.claim.json';
const W02_A03_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A03.claim.json';
const W02_A04_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A04.claim.json';
const W02_A05_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A05.claim.json';
const W02_A06_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A06.claim.json';
const W02_A07_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A07.claim.json';
const W02_A08_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A08.claim.json';
const W02_A08_DECISION_PATH = 'data/curriculum/application/reviews/POSTG-APP-W02-A08_OperatorHumanReviewDecision.json';
const GOLDEN_UNIT_DIR = 'data/curriculum/knowledge/units';

const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const unique = (values) => new Set(values).size === values.length;

const REQUIRED_GATE_ORDER = [
  'SOURCE_NODE_REGISTERED',
  'KNOWLEDGE_OPERATION_AVAILABLE_OR_PLANNED',
  'KP_APPLICATION_CLASSIFICATION_COMPLETE',
  'CANONICAL_OPERATION_MODEL_COMPLETE',
  'SINGLE_APPLICATION_ADMISSION_COMPLETE',
  'GLOBAL_CONTEXT_ATOMIC_EPISODE_BINDING_COMPLETE',
  'N_PLUS_1_CONTRACT_COMPLETE',
  'VALIDATOR_CONTRACT_COMPLETE',
  'POSITIVE_NEGATIVE_FIXTURES_COMPLETE',
  'SHARED_RUNTIME_SHADOW_PASS',
  'PRODUCTION_ADMISSION_REVIEWED'
];

const WAVE_SOURCE_COUNTS = Object.freeze({ W01: 15, W02: 13, W03: 13, W04: 13, W05: 13, W06: 12 });
const WAVE_SOURCE_OFFSETS = Object.freeze({ W01: 0, W02: 15, W03: 28, W04: 41, W05: 54, W06: 67 });
const W01_REQUIRED_SOURCE_IDS = Object.freeze([
  'g3a_u01_3a01',
  'g3a_u02_3a02',
  'g3a_u03_3a03',
  'g3a_u04_3a04',
  'g3a_u05_3a05',
  'g3a_u06_3a06',
  'g3a_u07_3a07',
  'g3b_u01_3b01',
  'g3b_u02_3b02',
  'g3b_u03_3b03',
  'g3b_u04_3b04',
  'g3b_u05_3b05',
  'g3b_u06_3b06',
  'g3b_u08_3b08',
  'g4a_u01_4a01'
]);
const W02_REQUIRED_SOURCE_IDS = Object.freeze([
  'g3a_u08_3a08',
  'g3b_u07_3b07',
  'g3b_u09_3b09',
  'g4a_u06_4a06',
  'g4a_u09_4a09',
  'g4b_u03_4b03',
  'g4b_u06_4b06',
  'g4b_u08_4b08',
  'g5a_u01_5a01',
  'g5a_u03_5a03a',
  'g5a_u03_5a03a1',
  'g5a_u04_5a04',
  'g5a_u06_5a06'
]);

function readJson(root, repoPath) {
  return JSON.parse(fs.readFileSync(path.join(root, repoPath), 'utf8'));
}

function listGoldenUnitFiles(root) {
  const dir = path.join(root, GOLDEN_UNIT_DIR);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => name.replace(/\.json$/, ''))
    .sort();
}

function validateRegistry(registry, issues) {
  if (registry.schemaName !== 'POSTGAPP79UnitRegistryV1'
      || registry.schemaVersion !== 1
      || registry.programId !== 'POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1'
      || registry.totalApplicationUnitCount !== 79
      || registry.units.length !== 79) {
    issues.push(issue('POSTG_APP_UNIT_REGISTRY_SCHEMA_INVALID', UNIT_REGISTRY_PATH));
    return;
  }
  const ids = registry.units.map((row) => row.sourceNodeId);
  if (!unique(ids)) issues.push(issue('POSTG_APP_UNIT_ID_DUPLICATED', UNIT_REGISTRY_PATH));
  const actualWaveCounts = Object.fromEntries(Object.keys(WAVE_SOURCE_COUNTS).map((waveId) => [
    waveId,
    registry.units.filter((row) => row.waveId === waveId).length
  ]));
  if (JSON.stringify(actualWaveCounts) !== JSON.stringify(WAVE_SOURCE_COUNTS)) {
    issues.push(issue('POSTG_APP_UNIT_REGISTRY_WAVE_COUNT_INVALID', UNIT_REGISTRY_PATH, { actualWaveCounts }));
  }
  if (JSON.stringify(registry.units.slice(0, 15).map((row) => row.sourceNodeId)) !== JSON.stringify(W01_REQUIRED_SOURCE_IDS)) {
    issues.push(issue('POSTG_APP_W01_SOURCE_ORDER_INVALID', UNIT_REGISTRY_PATH));
  }
  if (JSON.stringify(registry.units.slice(15, 28).map((row) => row.sourceNodeId)) !== JSON.stringify(W02_REQUIRED_SOURCE_IDS)) {
    issues.push(issue('POSTG_APP_W02_SOURCE_ORDER_INVALID', UNIT_REGISTRY_PATH));
  }
  for (const [waveId, offset] of Object.entries(WAVE_SOURCE_OFFSETS)) {
    const rows = registry.units.filter((row) => row.waveId === waveId);
    for (const [index, row] of rows.entries()) {
      if (row.globalOrdinal !== offset + index + 1 || row.waveOrdinal !== index + 1) {
        issues.push(issue('POSTG_APP_UNIT_REGISTRY_ORDINAL_INVALID', `units.${row.sourceNodeId}`));
      }
      if (!['APPLICATION_REQUIRED', 'APPLICATION_COMPATIBLE', 'APPLICATION_NOT_APPLICABLE', 'ASSESSMENT_PENDING'].includes(row.kpApplicationClass)) {
        issues.push(issue('POSTG_APP_UNIT_REGISTRY_CLASS_INVALID', `units.${row.sourceNodeId}`));
      }
    }
  }
}

function validateWavePlan(wavePlan, registry, issues) {
  if (wavePlan.schemaName !== 'POSTGAPPWavePlanV1'
      || wavePlan.schemaVersion !== 1
      || wavePlan.programId !== registry.programId
      || wavePlan.waveCount !== 6
      || wavePlan.waves.length !== 6) {
    issues.push(issue('POSTG_APP_WAVE_PLAN_SCHEMA_INVALID', WAVE_PLAN_PATH));
    return;
  }
  const expectedWaveIds = ['W01', 'W02', 'W03', 'W04', 'W05', 'W06'];
  if (JSON.stringify(wavePlan.waves.map((row) => row.waveId)) !== JSON.stringify(expectedWaveIds)) {
    issues.push(issue('POSTG_APP_WAVE_PLAN_ORDER_INVALID', WAVE_PLAN_PATH));
  }
  for (const wave of wavePlan.waves) {
    if (wave.sourceNodeCount !== WAVE_SOURCE_COUNTS[wave.waveId]) {
      issues.push(issue('POSTG_APP_WAVE_PLAN_SOURCE_COUNT_INVALID', `waves.${wave.waveId}`));
    }
    if (wave.publicRouteChanged !== false || wave.publicSelectable !== false) {
      issues.push(issue('POSTG_APP_WAVE_PLAN_PUBLIC_BOUNDARY_INVALID', `waves.${wave.waveId}`));
    }
  }
  const productionAdmitted = wavePlan.waves.filter((row) => row.productionAdmissionGranted).map((row) => row.waveId);
  if (JSON.stringify(productionAdmitted) !== JSON.stringify(['W01', 'W02'])) {
    issues.push(issue('POSTG_APP_WAVE_PLAN_ADMISSION_PREFIX_INVALID', WAVE_PLAN_PATH, { productionAdmitted }));
  }
  if (wavePlan.coverage?.productionAdmittedWaveCount !== 2) {
    issues.push(issue('POSTG_APP_WAVE_PLAN_COVERAGE_INVALID', WAVE_PLAN_PATH));
  }
}

function validateW01Evidence(controller, issues) {
  const decision = controller.w01Approval;
  const claim = controller.w01Claim;
  if (decision.operatorDecision !== 'APPROVE'
      || decision.productionAdmission?.granted !== true
      || decision.productionAdmission?.evidenceLevel !== 'E5_PRODUCTION_ADMITTED') {
    issues.push(issue('POSTG_APP_W01_APPROVAL_EVIDENCE_INVALID', W01_APPROVAL_PATH));
  }
  if (claim.actualEvidenceLevel !== 'E5_PRODUCTION_ADMITTED'
      || claim.targetEvidenceLevel !== 'E5_PRODUCTION_ADMITTED'
      || claim.claims?.productionAdmitted !== true
      || claim.claims?.d0Complete !== false) {
    issues.push(issue('POSTG_APP_W01_CLAIM_INVALID', W01_CLAIM_PATH));
  }
}

function validateW02Metrics(state) {
  return state.sourceNodeCount === 13
    && state.atomicContextBindingCount === 61
    && state.singleApplicationCandidateCount === 61
    && state.nPlusOneProofCandidateCount === 61
    && state.misconceptionCandidateCount === 61
    && state.pblBlueprintCount === 61
    && state.validatorFixtureCount === 122
    && state.worksheetProjectionCount === 13;
}

function validateA08Evidence(controller, issues) {
  const a08Decision = controller.w02A08Decision;
  const a08Claim = controller.w02A08Claim;
  const a08r1 = controller.w02A08R1Readback;
  if (a08Decision?.operatorDecision !== 'REVISE'
      || a08Decision?.productionAdmission?.granted !== false
      || a08Decision?.remediation?.taskId !== 'POSTG-APP-W02-A08R1_StudentFacingSemanticSurfacePBLInstantiationAndReReview') {
    issues.push(issue('POSTG_APP_W02_A08_REVISE_DECISION_INVALID', W02_A08_DECISION_PATH));
  }
  if (a08Claim?.actualEvidenceLevel !== 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED'
      || a08Claim?.claims?.productionAdmitted !== false
      || a08Claim?.claims?.humanReviewReady !== true
      || a08Claim?.humanReview?.decision !== 'REVISE') {
    issues.push(issue('POSTG_APP_W02_A08_CLAIM_INVALID', W02_A08_CLAIM_PATH));
  }
  if (!a08r1?.ok
      || a08r1?.status !== 'W02_A08R1_PATTERN_SEMANTIC_AND_OPERATION_SPECIFIC_PBL_REVIEW_READY'
      || a08r1?.counts?.generatedItemCount !== 195
      || a08r1?.counts?.validatedItemCount !== 195
      || a08r1?.counts?.applicationReviewCount !== 61
      || a08r1?.counts?.numericBoundaryReviewCount !== 49
      || a08r1?.counts?.pblReviewCount !== 31
      || a08r1?.counts?.pbl3Count !== 19
      || a08r1?.counts?.pbl5Count !== 12
      || a08r1?.counts?.operationFamilyCount !== 49
      || a08r1?.counts?.applicationRawRoleLeakageCount !== 0
      || a08r1?.counts?.applicationInternalIdLeakageCount !== 0
      || a08r1?.counts?.applicationInternalTokenLeakageCount !== 0
      || a08r1?.counts?.applicationMalformedSurfaceCount !== 0
      || a08r1?.counts?.applicationMissingAnswerCount !== 0
      || a08r1?.counts?.applicationSameDenominatorKnowledgeMismatchCount !== 0
      || a08r1?.counts?.applicationLengthConversionSurfaceMismatchCount !== 0
      || a08r1?.counts?.applicationRateDistanceSurfaceMismatchCount !== 0
      || a08r1?.counts?.applicationFractionalCapacityDisplayMismatchCount !== 0
      || a08r1?.counts?.applicationGradeInappropriateFractionVariableCount !== 0
      || a08r1?.counts?.numericRawRoleLeakageCount !== 0
      || a08r1?.counts?.numericInternalIdLeakageCount !== 0
      || a08r1?.counts?.numericInternalTokenLeakageCount !== 0
      || a08r1?.counts?.numericMalformedSurfaceCount !== 0
      || a08r1?.counts?.pblMissingDependencyLinkageCount !== 0
      || a08r1?.counts?.pblMissingRealUseDecisionCount !== 0
      || a08r1?.counts?.pblNotInstantiatedCount !== 0
      || a08r1?.counts?.pblMissingFinalDecisionCount !== 0
      || a08r1?.counts?.pblInternalIdLeakageCount !== 0
      || a08r1?.counts?.pblInternalTokenLeakageCount !== 0
      || a08r1?.counts?.pblMalformedSurfaceCount !== 0
      || a08r1?.counts?.pblGenericTaskSurfaceCount !== 0
      || a08r1?.counts?.pblGovernancePhraseLeakageCount !== 0
      || a08r1?.counts?.pblGenericProductLabelCount !== 0
      || a08r1?.counts?.pblDuplicatedTaskSurfaceCount !== 0
      || a08r1?.studentFacingSurfaceVersion !== 'W02_A08R1_V1'
      || a08r1?.studentFacingSemanticRevision !== 3
      || a08r1?.studentFacingInstantiationVersion !== 'W02_A08R1_V1'
      || a08r1?.applicationMacroContextCount !== 16
      || a08r1?.productionAdmissionGranted !== false
      || a08r1?.publicSelectable !== false
      || a08r1?.nextShortestStep !== 'POSTG-APP-W02-A08R2_RegeneratedHTMLPDFSecondOperatorReviewDecision') {
    issues.push(issue('POSTG_APP_W02_A08R1_READBACK_INVALID', 'POSTG-APP-W02-A08R1'));
  }
}

export function loadPOSTGAPPMasterController({ root = process.cwd() } = {}) {
  const baseControllerState = readJson(root, CONTROLLER_STATE_PATH);
  const a08r2Evidence = loadW02A08R2ControllerEvidence({ root });
  const a08r2ControllerState = applyW02A08R2ControllerOverlay({ root, controllerState: baseControllerState });
  const a08r3Evidence = loadW02A08R3ControllerEvidence({ root });
  const a08r3ControllerState = applyW02A08R3ControllerOverlay({ root, controllerState: a08r2ControllerState });
  const a08r4Evidence = loadW02A08R4ControllerEvidence({ root });
  const controllerState = applyW02A08R4ControllerOverlay({ root, controllerState: a08r3ControllerState });
  return {
    root,
    unitRegistry: readJson(root, UNIT_REGISTRY_PATH),
    wavePlan: readJson(root, WAVE_PLAN_PATH),
    controllerState,
    goldenUnitFiles: listGoldenUnitFiles(root),
    globalContextAuthority: loadGlobalContextAuthority({ root }),
    w01Approval: readJson(root, W01_APPROVAL_PATH),
    w01Claim: readJson(root, W01_CLAIM_PATH),
    w02A00Claim: readJson(root, W02_A00_CLAIM_PATH),
    w02A01AClaim: readJson(root, W02_A01A_CLAIM_PATH),
    w02A01BClaim: readJson(root, W02_A01B_CLAIM_PATH),
    w02A01CClaim: readJson(root, W02_A01C_CLAIM_PATH),
    w02A01DClaim: readJson(root, W02_A01D_CLAIM_PATH),
    w02A02Claim: readJson(root, W02_A02_CLAIM_PATH),
    w02A03Claim: readJson(root, W02_A03_CLAIM_PATH),
    w02A04Claim: readJson(root, W02_A04_CLAIM_PATH),
    w02A05Claim: readJson(root, W02_A05_CLAIM_PATH),
    w02A06Claim: readJson(root, W02_A06_CLAIM_PATH),
    w02A07Claim: readJson(root, W02_A07_CLAIM_PATH),
    w02A08Decision: readJson(root, W02_A08_DECISION_PATH),
    w02A08Claim: readJson(root, W02_A08_CLAIM_PATH),
    w02A08R1Readback: buildW02A08R1Readback({ root }),
    ...a08r2Evidence,
    ...a08r3Evidence,
    ...a08r4Evidence
  };
}

export function validatePOSTGAPPMasterController(controller) {
  const issues = [];
  const { unitRegistry, wavePlan, controllerState, goldenUnitFiles, globalContextAuthority } = controller;
  validateRegistry(unitRegistry, issues);
  validateWavePlan(wavePlan, unitRegistry, issues);
  issues.push(...validateGlobalContextAuthority(globalContextAuthority));
  validateW01Evidence(controller, issues);
  if (goldenUnitFiles.length !== 15) {
    issues.push(issue('POSTG_APP_GOLDEN_UNIT_COUNT_INVALID', GOLDEN_UNIT_DIR, { actual: goldenUnitFiles.length }));
  }
  const admitted = controllerState.waveStates.reduce((acc, row) => {
    if (row.productionAdmissionGranted) acc.admitted.push(row.waveId);
    if (row.state === 'PRODUCTION_ADMITTED') acc.productionStates.push(row.waveId);
    return acc;
  }, { admitted: [], productionStates: [] });
  if (JSON.stringify(admitted.admitted) !== JSON.stringify(['W01', 'W02'])) issues.push(issue('POSTG_APP_PRODUCTION_ADMITTED_WAVE_SET_INVALID', 'waves'));
  if (JSON.stringify(admitted.productionStates) !== JSON.stringify(admitted.admitted)) issues.push(issue('POSTG_APP_PRODUCTION_STATE_MISMATCH', 'waves'));
  const expectedStates = [
    'PRODUCTION_ADMITTED',
    'PRODUCTION_ADMITTED',
    'ASSESSMENT_READY',
    'BLOCKED_BY_PREVIOUS_WAVE',
    'BLOCKED_BY_PREVIOUS_WAVE',
    'BLOCKED_BY_PREVIOUS_WAVE'
  ];
  if (JSON.stringify(controllerState.waveStates.map((row) => row.state)) !== JSON.stringify(expectedStates)) {
    issues.push(issue('POSTG_APP_WAVE_STATE_TRANSITION_INVALID', 'waves'));
  }
  const w01State = controllerState.waveStates[0];
  if (JSON.stringify(w01State.completedGates) !== JSON.stringify(REQUIRED_GATE_ORDER)
      || !w01State.admissionGateComplete
      || !w01State.productionAdmissionGranted
      || w01State.reviewDecision !== 'APPROVE') {
    issues.push(issue('POSTG_APP_W01_ADMISSION_STATE_INVALID', 'controllerState.waveStates.W01'));
  }
  const w02State = controllerState.waveStates[1];
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
  }
  validateA08Evidence(controller, issues);
  issues.push(...validateW02A08R2ControllerEvidence(controller));
  issues.push(...validateW02A08R3ControllerEvidence(controller));
  issues.push(...validateW02A08R4ControllerEvidence(controller));
  return { ok: issues.length === 0, issues };
}

export function resolvePOSTGAPPWave(controller, waveId) {
  const wave = controller.wavePlan.waves.find((row) => row.waveId === waveId);
  const state = controller.controllerState.waveStates.find((row) => row.waveId === waveId);
  if (!wave || !state) return null;
  const units = controller.unitRegistry.units.filter((row) => row.waveId === waveId);
  return {
    waveId,
    sourceNodeCount: units.length,
    sourceNodeIds: units.map((row) => row.sourceNodeId),
    sourceNodes: units,
    controllerState: state.state,
    productionAdmissionGranted: state.productionAdmissionGranted,
    reviewDecision: state.reviewDecision,
    assessmentReady: state.state === 'ASSESSMENT_READY',
    productionSelectable: Boolean(controller.controllerState.waveStates.find((row) => row.waveId === waveId)?.productionAdmissionGranted),
    publicSelectable: false
  };
}

export function buildPOSTGAPPMasterReadback({ root = process.cwd() } = {}) {
  const controller = loadPOSTGAPPMasterController({ root });
  const validation = validatePOSTGAPPMasterController(controller);
  const totalKnowledgeOperationCount = controller.unitRegistry.units.filter((row) => row.knowledgeOperationPath).length;
  const totalApplicationClassifiedCount = controller.unitRegistry.units.filter((row) => row.kpApplicationClass !== 'ASSESSMENT_PENDING').length;
  const productionAdmittedApplicationUnitCount = controller.controllerState.waveStates
    .filter((row) => row.productionAdmissionGranted)
    .reduce((total, row) => total + row.sourceNodeCount, 0);
  return {
    ok: validation.ok,
    issues: validation.issues,
    programId: controller.unitRegistry.programId,
    taskId: controller.controllerState.taskId,
    status: validation.ok
      ? W02_A08R4_STATUS
      : 'BLOCKED_BY_M00_CONTROLLER_VALIDATION',
    counts: {
      totalApplicationUnitCount: controller.unitRegistry.totalApplicationUnitCount,
      totalGoldenUnitCount: controller.goldenUnitFiles.length,
      totalWaveCount: controller.wavePlan.waveCount,
      totalKnowledgeOperationCount,
      totalApplicationClassifiedCount,
      productionAdmittedApplicationUnitCount
    },
    currentWaveId: controller.controllerState.currentWaveId,
    currentMainlineBlocker: controller.controllerState.currentMainlineBlocker,
    nextShortestStep: controller.controllerState.nextShortestStep,
    productionAdmission: controller.controllerState.productionAdmission
  };
}
