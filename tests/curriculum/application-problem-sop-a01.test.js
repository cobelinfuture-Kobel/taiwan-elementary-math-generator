import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const schemaPath = 'data/curriculum/application/schema/single-application-item.schema.json';
const contractPath = 'data/curriculum/application/contracts/APP-SOP-A01_SingleApplicationItemDetailedSOPAndSchemaContract.json';
const documentPath = 'docs/curriculum/contracts/Single_Application_Item_SOP_V1.md';
const claimPath = 'data/project/milestones/APP-SOP-A01.claim.json';

const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
const contract = JSON.parse(readFileSync(contractPath, 'utf8'));
const document = readFileSync(documentPath, 'utf8');
const claim = JSON.parse(readFileSync(claimPath, 'utf8'));

const BASE_ITEM = {
  schemaVersion: 1,
  itemId: 'item_g3b_u01_quotative_direct_001',
  applicationMode: 'SINGLE_DIRECT',
  sourceId: 'g3b_u01_3b01',
  knowledgePointId: 'kp_g3b_u01_wp_quotative_division',
  canonicalOperationModelId: 'op_g3b_u01_quotative_division',
  patternSpecId: 'ps_g3b_u01_wp_quotative_packaging_exact',
  admissionStatus: 'PATTERN_CANDIDATE',
  promptZh: '有24顆橘子，每盤放6顆，可以放成幾盤？',
  primaryTargetCount: 1,
  givenRoles: [
    { roleId: 'totalAmount', semanticMeaning: '橘子總數', value: 24, unit: '顆' },
    { roleId: 'amountPerGroup', semanticMeaning: '每盤橘子數', value: 6, unit: '顆/盤' }
  ],
  targetRole: { roleId: 'groupCount', semanticMeaning: '盤數', answerUnit: '盤' },
  relationGraph: {
    nodes: [
      { nodeId: 'totalAmount', kind: 'GIVEN' },
      { nodeId: 'amountPerGroup', kind: 'GIVEN' },
      { nodeId: 'groupCount', kind: 'ANSWER' }
    ],
    edges: [
      { from: ['totalAmount', 'amountPerGroup'], to: 'groupCount', relation: 'groupCount = totalAmount / amountPerGroup' }
    ],
    terminalNodeId: 'groupCount'
  },
  operationOrder: ['divide totalAmount by amountPerGroup'],
  contextConstraints: ['all groups use the same amount per group'],
  globalContextFamilyId: 'gctx_family_food_distribution',
  unitContextBindingId: 'ucb_g3b_u01_food_distribution_quotative',
  surfaceTemplateId: 'tpl_food_distribution_quotative_01',
  numericDifficultyLevel: 'STANDARD',
  applicationCapabilityLevel: 'N',
  answerModel: {
    answerShape: 'QUANTITY_WITH_UNIT',
    numericAnswer: 4,
    answerRole: 'groupCount',
    answerUnits: ['盤'],
    canonicalReconstruction: '24 / 6 = 4',
    interpretationStatement: '可以放成4盤。'
  },
  validationContract: {
    identityAndAuthority: true,
    numeric: true,
    semanticRole: true,
    operationRelation: true,
    contextBinding: true,
    interpretation: false,
    answerMeaning: true,
    blockingFailureReturnsNoItem: true
  },
  lineage: {
    knowledgeOperationAuthorityPath: 'data/curriculum/knowledge/units/g3b_u01_3b01.knowledge-operation.json',
    globalContextAuthorityPath: 'data/curriculum/context/registry/gs02-g5a-u08-global-context-families.json',
    unitContextBindingAuthorityPath: 'data/curriculum/context/registry/gs02-g5a-u08-unit-context-bindings.json'
  }
};

const N_PLUS_ONE_ITEM = {
  ...structuredClone(BASE_ITEM),
  itemId: 'item_g3b_u01_min_container_n1_001',
  applicationMode: 'SINGLE_N_PLUS_1',
  knowledgePointId: 'kp_g3b_u01_wp_remainder_interpretation',
  canonicalOperationModelId: 'op_g3b_u01_remainder_floor_ceil_decision',
  patternSpecId: 'ps_g3b_u01_wp_remainder_minimum_containers',
  promptZh: '有50位學生，每輛車最多坐6人。至少需要幾輛車，才能讓所有學生都有座位？',
  givenRoles: [
    { roleId: 'totalPeople', semanticMeaning: '學生總數', value: 50, unit: '人' },
    { roleId: 'capacity', semanticMeaning: '每輛車最多座位數', value: 6, unit: '人/輛' }
  ],
  targetRole: { roleId: 'minimumVehicleCount', semanticMeaning: '最少車輛數', answerUnit: '輛' },
  relationGraph: {
    nodes: [
      { nodeId: 'totalPeople', kind: 'GIVEN' },
      { nodeId: 'capacity', kind: 'GIVEN' },
      { nodeId: 'quotient', kind: 'DERIVED' },
      { nodeId: 'remainder', kind: 'DERIVED' },
      { nodeId: 'minimumVehicleCount', kind: 'ANSWER' }
    ],
    edges: [
      { from: ['totalPeople', 'capacity'], to: 'quotient', relation: 'quotient = floor(totalPeople / capacity)' },
      { from: ['totalPeople', 'capacity'], to: 'remainder', relation: 'remainder = totalPeople % capacity' },
      { from: ['quotient', 'remainder'], to: 'minimumVehicleCount', relation: 'minimumVehicleCount = quotient + indicator(remainder > 0)' }
    ],
    terminalNodeId: 'minimumVehicleCount'
  },
  operationOrder: ['compute quotient and remainder', 'add one vehicle when remainder is nonzero'],
  contextConstraints: ['every student must receive a seat', 'vehicle capacity may not be exceeded'],
  requiredContextAffordances: ['fixed maximum capacity', 'all people must be handled', 'nonzero remainder requires another resource'],
  globalContextFamilyId: 'gctx_family_transit_trip',
  unitContextBindingId: 'ucb_g3b_u01_transit_minimum_vehicle',
  surfaceTemplateId: 'tpl_transit_trip_minimum_vehicle_01',
  applicationCapabilityLevel: 'N_PLUS_1',
  answerModel: {
    answerShape: 'DECISION_WITH_REASON',
    numericAnswer: 9,
    answerRole: 'minimumVehicleCount',
    answerUnits: ['輛'],
    canonicalReconstruction: '50 = 6 * 8 + 2; 8 + 1 = 9',
    interpretationStatement: '剩下2位學生仍需要另一輛車。',
    decisionRule: 'remainder > 0 means add one vehicle',
    decisionWitness: '所有學生都必須有座位。'
  },
  interpretationWitness: {
    witnessType: 'DECISION_REASON_SELECTION',
    promptZh: '為什麼不能只安排8輛車？',
    expectedEvidence: '剩下2位學生仍需要另一輛車。'
  },
  nPlusOneEvidence: {
    baseCapabilityId: 'cap_g3b_u01_report_quotient_remainder',
    candidateCapabilityId: 'cap_g3b_u01_minimum_container_decision',
    sharedNumericPrerequisites: ['division_with_remainder'],
    newInterpretiveAct: 'REMAINDER_INTERPRETATION',
    intermediateSemanticNodeRequired: false,
    pairedControlItem: {
      baseItemId: 'item_g3b_u01_report_quotient_remainder_001',
      sameNumericPrerequisites: true,
      sameOrEquivalentNumbers: true,
      semanticDeltaOnly: true,
      baseExpectedAnswer: { quotient: 8, remainder: 2 },
      candidateExpectedAnswer: 9
    },
    misconceptionModels: [
      {
        misconceptionId: 'mis_quotient_only',
        misconceptionType: 'QUOTIENT_ONLY',
        expectedWrongAnswer: 8,
        diagnosticMeaning: '忽略餘下學生仍需要座位。'
      },
      {
        misconceptionId: 'mis_remainder_as_answer',
        misconceptionType: 'REMAINDER_AS_TARGET',
        expectedWrongAnswer: 2,
        diagnosticMeaning: '把餘數誤當成車輛數。'
      }
    ],
    counterfactualVariant: {
      changedCondition: '只計算可以坐滿的車輛數',
      numericPrerequisitesPreserved: true,
      expectedInterpretationChanged: true,
      expectedAnswerOrDecision: 8
    },
    answerMeaningValidation: {
      answerRoleValidated: true,
      answerUnitValidated: true,
      contextDecisionValidated: true
    }
  },
  validationContract: {
    identityAndAuthority: true,
    numeric: true,
    semanticRole: true,
    operationRelation: true,
    contextBinding: true,
    interpretation: true,
    answerMeaning: true,
    blockingFailureReturnsNoItem: true
  }
};

function structuralValidateSingleItem(item) {
  const errors = [];
  const required = schema.required;
  for (const field of required) {
    if (!(field in item)) errors.push(`missing:${field}`);
  }
  if (!['SINGLE_DIRECT', 'SINGLE_N_PLUS_1'].includes(item.applicationMode)) errors.push('invalid:applicationMode');
  if (item.primaryTargetCount !== 1) errors.push('invalid:primaryTargetCount');
  for (const forbidden of ['dependencyGraph', 'milestones', 'finalProductType', 'decisionWitnessesByTask']) {
    if (forbidden in item) errors.push(`forbidden:${forbidden}`);
  }
  if (item.applicationMode === 'SINGLE_DIRECT') {
    if (item.applicationCapabilityLevel !== 'N') errors.push('invalid:directCapability');
    if ('nPlusOneEvidence' in item) errors.push('forbidden:nPlusOneEvidence');
  }
  if (item.applicationMode === 'SINGLE_N_PLUS_1') {
    if (item.applicationCapabilityLevel !== 'N_PLUS_1') errors.push('invalid:nPlusOneCapability');
    if (!item.nPlusOneEvidence) errors.push('missing:nPlusOneEvidence');
    if (!item.interpretationWitness) errors.push('missing:interpretationWitness');
    if (!Array.isArray(item.requiredContextAffordances)) errors.push('missing:requiredContextAffordances');
    if (item.nPlusOneEvidence?.intermediateSemanticNodeRequired !== false) errors.push('invalid:intermediateSemanticNodeRequired');
    if ((item.nPlusOneEvidence?.misconceptionModels?.length ?? 0) < 2) errors.push('invalid:misconceptionModels');
    if (item.nPlusOneEvidence?.pairedControlItem?.sameNumericPrerequisites !== true) errors.push('invalid:pairedControlNumericPrerequisites');
    if (item.nPlusOneEvidence?.pairedControlItem?.semanticDeltaOnly !== true) errors.push('invalid:pairedControlSemanticDelta');
    if (item.nPlusOneEvidence?.counterfactualVariant?.expectedInterpretationChanged !== true) errors.push('invalid:counterfactual');
  }
  return errors;
}

test('A01 schema is Draft 2020-12 and forbids unspecified fields', () => {
  assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.equal(schema.additionalProperties, false);
  assert.equal(schema.properties.primaryTargetCount.const, 1);
  assert.deepEqual(schema.properties.applicationMode.enum, ['SINGLE_DIRECT', 'SINGLE_N_PLUS_1']);
});

test('valid SINGLE_DIRECT fixture satisfies structural contract', () => {
  assert.deepEqual(structuralValidateSingleItem(BASE_ITEM), []);
});

test('valid SINGLE_N_PLUS_1 fixture satisfies interpretation evidence contract', () => {
  assert.deepEqual(structuralValidateSingleItem(N_PLUS_ONE_ITEM), []);
  assert.equal(N_PLUS_ONE_ITEM.nPlusOneEvidence.newInterpretiveAct, 'REMAINDER_INTERPRETATION');
  assert.equal(N_PLUS_ONE_ITEM.nPlusOneEvidence.misconceptionModels.length, 2);
});

test('schema and validator reject invalid single-item boundaries', () => {
  const invalidDirect = { ...structuredClone(BASE_ITEM), nPlusOneEvidence: structuredClone(N_PLUS_ONE_ITEM.nPlusOneEvidence) };
  assert.equal(structuralValidateSingleItem(invalidDirect).includes('forbidden:nPlusOneEvidence'), true);

  const missingWitness = structuredClone(N_PLUS_ONE_ITEM);
  delete missingWitness.interpretationWitness;
  assert.equal(structuralValidateSingleItem(missingWitness).includes('missing:interpretationWitness'), true);

  const multipleTargets = { ...structuredClone(BASE_ITEM), primaryTargetCount: 2 };
  assert.equal(structuralValidateSingleItem(multipleTargets).includes('invalid:primaryTargetCount'), true);

  const pblLeak = { ...structuredClone(BASE_ITEM), dependencyGraph: { nodes: [], edges: [] } };
  assert.equal(structuralValidateSingleItem(pblLeak).includes('forbidden:dependencyGraph'), true);

  const missingIntermediate = structuredClone(N_PLUS_ONE_ITEM);
  missingIntermediate.nPlusOneEvidence.intermediateSemanticNodeRequired = true;
  assert.equal(structuralValidateSingleItem(missingIntermediate).includes('invalid:intermediateSemanticNodeRequired'), true);
});

test('A01 machine contract remains schema-only and points to A02', () => {
  assert.deepEqual(contract.supportedModes, ['SINGLE_DIRECT', 'SINGLE_N_PLUS_1']);
  assert.equal(contract.singleItemInvariants.primaryTargetCount, 1);
  assert.equal(contract.singleItemInvariants.crossQuestionDependencyGraphAllowed, false);
  assert.equal(contract.nPlusOneInvariants.numericLoadDefinesNPlusOne, false);
  assert.equal(contract.nPlusOneInvariants.minimumMisconceptionModels, 2);

  for (const [key, value] of Object.entries(contract.scope)) {
    if (key === 'primaryPRLimit') {
      assert.equal(value, 1);
    } else {
      assert.equal(value, false, `${key} must remain false in A01`);
    }
  }

  assert.equal(claim.actualEvidenceLevel, 'E1_DATA_STRUCTURE_READY');
  assert.equal(claim.claims.runtimeIntegrated, false);
  assert.equal(claim.claims.visibleOutputChanged, false);
  assert.equal(claim.claims.productionAdmitted, false);
  assert.equal(claim.nextStep.taskId, 'APP-SOP-A02_NPlusOneInterpretationProofAndMisconceptionContract');
});

test('normative SOP contains single-item, N+1, context, validation, and scope gates', () => {
  for (const section of [
    '# Single Application Item SOP V1',
    '## 4. One-primary-target rule',
    '## 5. Semantic model',
    '## 8. `SINGLE_N_PLUS_1` contract',
    '## 9. Context-affordance matching',
    '## 13. Interpretation witness',
    '## 14. Misconception models',
    '## 15. Counterfactual variant',
    '## 16. Validation order',
    '## 20. Production gate',
    '## 21. A01 scope boundary'
  ]) {
    assert.equal(document.includes(section), true, `missing SOP section: ${section}`);
  }
});
