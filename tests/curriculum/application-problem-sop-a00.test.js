import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const contractPath = 'data/curriculum/contracts/APPLICATION_PROBLEM_SOP_V1.json';
const documentPath = 'docs/curriculum/contracts/Application_Problem_SOP_V1.md';
const claimPath = 'data/project/milestones/APP-SOP-A00.claim.json';

const contract = JSON.parse(readFileSync(contractPath, 'utf8'));
const document = readFileSync(documentPath, 'utf8');
const claim = JSON.parse(readFileSync(claimPath, 'utf8'));

test('APP-SOP A00 locks three mutually exclusive application product modes', () => {
  assert.equal(contract.contractId, 'APPLICATION_PROBLEM_SOP_V1');
  assert.equal(contract.taskId, 'APP-SOP-A00_ScopeDefinitionsAndAdmissionBoundary');

  const modes = contract.productModes.map((entry) => entry.mode);
  assert.deepEqual(modes, ['SINGLE_DIRECT', 'SINGLE_N_PLUS_1', 'PBL_TASK_SET']);
  assert.equal(new Set(modes).size, 3);

  const direct = contract.productModes.find((entry) => entry.mode === 'SINGLE_DIRECT');
  const nPlusOne = contract.productModes.find((entry) => entry.mode === 'SINGLE_N_PLUS_1');
  const pbl = contract.productModes.find((entry) => entry.mode === 'PBL_TASK_SET');

  assert.equal(direct.taskCount, 1);
  assert.equal(direct.requiresDependencyGraph, false);
  assert.equal(nPlusOne.taskCount, 1);
  assert.equal(nPlusOne.requiresNewInterpretiveAct, true);
  assert.equal(pbl.taskCountMin, 3);
  assert.equal(pbl.taskCountMax, 5);
  assert.equal(pbl.requiresDependencyGraph, true);
  assert.equal(pbl.requiresFinalProduct, true);
});

test('APP-SOP A00 defines interpretation-based N+1 evidence', () => {
  const required = new Set(contract.nPlusOneRequiredFields);
  for (const field of [
    'baseCapabilityId',
    'candidateCapabilityId',
    'sharedNumericPrerequisites',
    'newInterpretiveAct',
    'intermediateSemanticNodeRequired',
    'pairedControlItem',
    'interpretationWitness',
    'misconceptionModels',
    'counterfactualVariant',
    'answerMeaningValidation'
  ]) {
    assert.equal(required.has(field), true, `missing N+1 field: ${field}`);
  }

  assert.equal(contract.publicAdmission.nPlus2ProductionAdmitted, false);
  assert.equal(contract.publicAdmission.contextMayOwnMathematics, false);
  assert.equal(contract.publicAdmission.contextMayChangeCanonicalAnswer, false);
});

test('APP-SOP A00 defines complete PBL admission boundaries', () => {
  const required = new Set(contract.pblRequiredFields);
  for (const field of [
    'drivingProblem',
    'dependencyGraph',
    'milestones',
    'finalProductType',
    'decisionWitness',
    'approvedProjection'
  ]) {
    assert.equal(required.has(field), true, `missing PBL field: ${field}`);
  }

  assert.deepEqual(contract.allowedPBLGraphTypes, [
    'PBL3_LINEAR',
    'PBL4_BRANCH_MERGE',
    'PBL5_BOUNDED_DECISION'
  ]);
  assert.equal(contract.validationLayers.pblTaskSet.includes('DEPENDENCY'), true);
  assert.equal(contract.validationLayers.pblTaskSet.includes('AUTHENTICITY'), true);
});

test('APP-SOP A00 remains contract-only and does not mutate runtime scope', () => {
  const scope = contract.scope;
  for (const [key, value] of Object.entries(scope)) {
    if (key === 'primaryPRLimit') {
      assert.equal(value, 1);
      continue;
    }
    assert.equal(value, false, `${key} must remain false in A00`);
  }

  assert.equal(claim.actualEvidenceLevel, 'E1_DATA_STRUCTURE_READY');
  assert.equal(claim.claims.runtimeIntegrated, false);
  assert.equal(claim.claims.visibleOutputChanged, false);
  assert.equal(claim.claims.productionAdmitted, false);
  assert.equal(claim.nextStep.taskId, 'APP-SOP-A01_SingleApplicationItemDetailedSOPAndSchemaContract');
});

test('APP-SOP A00 fixes the bounded A00-A06 roadmap and G3B-U01 pilot boundary', () => {
  assert.equal(contract.taskOrder.length, 7);
  assert.equal(contract.taskOrder[0], 'APP-SOP-A00_ScopeDefinitionsAndAdmissionBoundary');
  assert.equal(contract.taskOrder.at(-1), 'APP-SOP-A06_SharedRuntimeWorksheetQAAndCloseout');
  assert.equal(contract.firstPilot.sourceId, 'g3b_u01_3b01');
  assert.equal(contract.firstPilot.implementedAtA00, false);
  assert.equal(contract.firstPilot.scheduledTask, 'APP-SOP-A05_ValidatorCIGatesAndG3BU01PilotFixtures');
});

test('normative document contains the required product, authority, and fail-closed sections', () => {
  for (const requiredText of [
    '# Application Problem SOP V1',
    '## 2. Authority separation',
    '### 3.1 `SINGLE_DIRECT`',
    '### 3.2 `SINGLE_N_PLUS_1`',
    '### 3.3 `PBL_TASK_SET`',
    '## 8. Global-context integration',
    '## 9. Admission lifecycle',
    '## 10. Production fail-closed rules',
    '## 11. Bounded implementation roadmap',
    '## 12. A00 scope boundary'
  ]) {
    assert.equal(document.includes(requiredText), true, `missing document section: ${requiredText}`);
  }
});
