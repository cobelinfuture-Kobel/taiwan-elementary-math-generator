import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const schema = JSON.parse(readFileSync('data/curriculum/application/schema/pbl-task-set.schema.json', 'utf8'));
const contract = JSON.parse(readFileSync('data/curriculum/application/contracts/APP-SOP-A03_PBLTaskSetDependencyMilestoneAndFinalProductContract.json', 'utf8'));
const claim = JSON.parse(readFileSync('data/project/milestones/APP-SOP-A03.claim.json', 'utf8'));
const document = readFileSync('docs/curriculum/contracts/PBL_Task_Set_SOP_V1.md', 'utf8');

const PBL3 = {
  schemaVersion: 1,
  pblTaskSetId: 'pbl_g3b_u01_packaging_transport_001',
  sourceId: 'g3b_u01_3b01',
  primaryKnowledgePointId: 'kp_g3b_u01_wp_remainder_interpretation',
  supportingKnowledgePointIds: ['kp_g3b_u01_wp_two_step_division'],
  canonicalOperationModelIds: ['op_g3b_u01_remainder_floor_ceil_decision', 'op_g3b_u01_two_step_division_order'],
  applicationCapabilityIds: ['cap_minimum_container_decision', 'cap_relation_chain'],
  globalContextFamilyId: 'gctx_family_community_resource_delivery',
  unitContextBindingId: 'ucb_g3b_u01_community_delivery_pbl',
  drivingProblem: {
    stakeholder: '學校志工',
    realWorldGoal: '規劃物資裝箱與運送',
    problemStatementZh: '學校志工要把所有可用物資裝箱並送到社區中心，箱子與車次都有容量限制。',
    constraints: ['所有可用物資都要裝箱', '每箱與每車不得超過容量'],
    successCriteria: ['所有物資完成裝箱與運送'],
    consequenceOfIncorrectDecision: '物資可能無法全部送達或發生超載',
    finalProductType: 'TRANSPORT_PLAN'
  },
  graphType: 'PBL3_LINEAR',
  tasks: [
    {
      taskId: 'Q1',
      sequenceIndex: 1,
      promptZh: '先算出所有可用物資至少需要多少箱。',
      inputRefs: [],
      outputMilestoneId: 'M1_BOX_COUNT',
      knowledgePointIds: ['kp_g3b_u01_wp_remainder_interpretation'],
      operationModelIds: ['op_g3b_u01_remainder_floor_ceil_decision'],
      numericWitnessContract: 'compute quotient, remainder, and minimum boxes',
      interpretationWitnessContract: 'explain why a nonzero remainder needs another box',
      isFinalTask: false
    },
    {
      taskId: 'Q2',
      sequenceIndex: 2,
      promptZh: '利用需要的箱數，算出至少需要幾次運送。',
      inputRefs: ['M1_BOX_COUNT'],
      outputMilestoneId: 'M2_TRIP_COUNT',
      knowledgePointIds: ['kp_g3b_u01_wp_remainder_interpretation'],
      operationModelIds: ['op_g3b_u01_remainder_floor_ceil_decision'],
      numericWitnessContract: 'compute minimum trips from box count',
      interpretationWitnessContract: 'explain why remaining boxes require another trip',
      isFinalTask: false
    },
    {
      taskId: 'Q3',
      sequenceIndex: 3,
      promptZh: '根據前面的結果，完成可執行的裝箱與運送計畫。',
      inputRefs: ['M1_BOX_COUNT', 'M2_TRIP_COUNT'],
      outputMilestoneId: 'M3_TRANSPORT_PLAN',
      knowledgePointIds: ['kp_g3b_u01_wp_two_step_division'],
      operationModelIds: ['op_g3b_u01_two_step_division_order'],
      numericWitnessContract: 'reuse box and trip milestones',
      interpretationWitnessContract: 'confirm all capacity constraints are satisfied',
      isFinalTask: true
    }
  ],
  milestones: [
    {
      milestoneId: 'M1_BOX_COUNT',
      producerTaskId: 'Q1',
      semanticRole: 'minimumBoxCount',
      valueType: 'INTEGER',
      unit: '箱',
      requiredByTaskIds: ['Q2', 'Q3'],
      canonicalReconstruction: 'ceil(usableItems / boxCapacity)'
    },
    {
      milestoneId: 'M2_TRIP_COUNT',
      producerTaskId: 'Q2',
      semanticRole: 'minimumTripCount',
      valueType: 'INTEGER',
      unit: '次',
      requiredByTaskIds: ['Q3'],
      canonicalReconstruction: 'ceil(minimumBoxCount / boxesPerTrip)'
    },
    {
      milestoneId: 'M3_TRANSPORT_PLAN',
      producerTaskId: 'Q3',
      semanticRole: 'transportPlan',
      valueType: 'PLAN',
      unit: '方案',
      requiredByTaskIds: [],
      canonicalReconstruction: 'plan(minimumBoxCount, minimumTripCount)'
    }
  ],
  finalProduct: {
    finalProductType: 'TRANSPORT_PLAN',
    finalTaskId: 'Q3',
    requiredMilestoneIds: ['M1_BOX_COUNT', 'M2_TRIP_COUNT'],
    decisionOrProductModel: { requiredFields: ['minimumBoxCount', 'minimumTripCount'] },
    decisionWitness: {
      selectedDecisionOrPlan: 'use the computed minimum boxes and trips',
      supportingMilestoneIds: ['M1_BOX_COUNT', 'M2_TRIP_COUNT'],
      constraintChecks: ['all items packed', 'box capacity respected', 'trip capacity respected'],
      shortJustification: 'The plan handles every item without exceeding capacity.'
    },
    constraintSatisfactionChecks: ['all items packed', 'all boxes transported']
  },
  authenticityEvidence: {
    contextNecessaryForDecision: true,
    removingContextDestroysTaskMeaning: true,
    finalProductUsableInContext: true,
    constraintsAreEventRealistic: true
  },
  primaryInterpretiveAct: 'REMAINDER_INTERPRETATION',
  interpretationWitnessTaskIds: ['Q1', 'Q2', 'Q3'],
  calculationPassInterpretationFailModelExists: true,
  misconceptionModels: [
    {
      misconceptionId: 'mis_box_quotient_only',
      earliestDetectedTaskId: 'Q1',
      diagnosticClassification: 'CALCULATION_PASS_INTERPRETATION_FAIL',
      diagnosticMeaning: 'uses only the quotient and leaves items unpacked'
    },
    {
      misconceptionId: 'mis_wrong_milestone',
      earliestDetectedTaskId: 'Q2',
      diagnosticClassification: 'DEPENDENCY_FAIL',
      diagnosticMeaning: 'uses the original item count instead of the box-count milestone'
    },
    {
      misconceptionId: 'mis_capacity_ignored',
      earliestDetectedTaskId: 'Q3',
      diagnosticClassification: 'CONSTRAINT_DECISION_FAIL',
      diagnosticMeaning: 'final plan exceeds a capacity constraint'
    }
  ],
  counterfactualVariant: {
    changedConstraint: 'increase the number of boxes allowed per trip',
    expectedAffectedTaskIds: ['Q2', 'Q3'],
    expectedMilestoneChanges: ['M2_TRIP_COUNT changes'],
    expectedFinalProductChange: 'transport plan uses fewer trips'
  },
  validationContract: {
    identityAndAuthority: true,
    math: true,
    semanticRole: true,
    dependency: true,
    milestoneCompleteness: true,
    decision: true,
    authenticity: true,
    projection: true,
    blockingFailureReturnsNoTaskSet: true
  },
  approvedProjection: 'APPROVED_COMPLETE_SINGLE_PAGE',
  admissionStatus: 'PBL_VALIDATED_CANDIDATE',
  lineage: {
    knowledgeOperationAuthorityPaths: ['data/curriculum/knowledge/units/g3b_u01_3b01.knowledge-operation.json'],
    globalContextAuthorityPath: 'data/curriculum/context/registry/gs02-g5a-u08-global-context-families.json',
    unitContextBindingAuthorityPath: 'data/curriculum/context/registry/gs02-g5a-u08-unit-context-bindings.json'
  }
};

function validatePbl(taskSet) {
  const errors = [];
  const expectedCount = contract.graphTypes[taskSet.graphType];
  if (!expectedCount || taskSet.tasks?.length !== expectedCount) errors.push('invalid:taskCountOrGraph');
  const taskIds = new Set(taskSet.tasks?.map((row) => row.taskId));
  const milestones = new Map(taskSet.milestones?.map((row) => [row.milestoneId, row]));
  if (taskIds.size !== (taskSet.tasks?.length ?? 0)) errors.push('invalid:duplicateTaskId');
  const finalTasks = taskSet.tasks?.filter((row) => row.isFinalTask) ?? [];
  if (finalTasks.length !== 1) errors.push('invalid:finalTaskCount');
  for (const task of taskSet.tasks ?? []) {
    if (task.sequenceIndex > 1 && task.inputRefs.length < 1) errors.push(`invalid:missingInput:${task.taskId}`);
    for (const ref of task.inputRefs) if (!milestones.has(ref)) errors.push(`invalid:unresolvedInput:${ref}`);
  }
  for (const milestone of taskSet.milestones ?? []) {
    if (!taskIds.has(milestone.producerTaskId)) errors.push(`invalid:producer:${milestone.milestoneId}`);
    for (const consumer of milestone.requiredByTaskIds) if (!taskIds.has(consumer)) errors.push(`invalid:consumer:${consumer}`);
    if (milestone.producerTaskId !== taskSet.finalProduct?.finalTaskId && milestone.requiredByTaskIds.length === 0) errors.push(`invalid:orphan:${milestone.milestoneId}`);
  }
  if (!taskSet.finalProduct || !taskIds.has(taskSet.finalProduct.finalTaskId)) errors.push('invalid:finalProduct');
  if (!['APPROVED_COMPLETE_SINGLE_PAGE', 'APPROVED_COMPLETE_TWO_PAGE'].includes(taskSet.approvedProjection)) errors.push('invalid:projection');
  if ((taskSet.misconceptionModels?.length ?? 0) < 3) errors.push('invalid:misconceptions');
  if (!taskSet.authenticityEvidence?.contextNecessaryForDecision) errors.push('invalid:authenticity');
  return errors;
}

test('A03 schema locks task counts and admitted graph types', () => {
  assert.equal(schema.properties.tasks.minItems, 3);
  assert.equal(schema.properties.tasks.maxItems, 5);
  assert.deepEqual(schema.properties.graphType.enum, ['PBL3_LINEAR', 'PBL4_BRANCH_MERGE', 'PBL5_BOUNDED_DECISION']);
  assert.deepEqual(contract.graphTypes, { PBL3_LINEAR: 3, PBL4_BRANCH_MERGE: 4, PBL5_BOUNDED_DECISION: 5 });
});

test('valid PBL3 fixture closes dependencies, milestones, and final product', () => {
  assert.deepEqual(validatePbl(PBL3), []);
});

test('PBL contract rejects independent questions, unresolved refs, and orphan milestones', () => {
  const independent = structuredClone(PBL3);
  independent.tasks[1].inputRefs = [];
  assert.equal(validatePbl(independent).includes('invalid:missingInput:Q2'), true);

  const unresolved = structuredClone(PBL3);
  unresolved.tasks[1].inputRefs = ['MISSING'];
  assert.equal(validatePbl(unresolved).includes('invalid:unresolvedInput:MISSING'), true);

  const orphan = structuredClone(PBL3);
  orphan.milestones[0].requiredByTaskIds = [];
  assert.equal(validatePbl(orphan).includes('invalid:orphan:M1_BOX_COUNT'), true);
});

test('PBL contract rejects multiple final tasks and unapproved projection', () => {
  const multipleFinal = structuredClone(PBL3);
  multipleFinal.tasks[1].isFinalTask = true;
  assert.equal(validatePbl(multipleFinal).includes('invalid:finalTaskCount'), true);

  const badProjection = structuredClone(PBL3);
  badProjection.approvedProjection = 'AUTO_SPLIT_ANYWHERE';
  assert.equal(validatePbl(badProjection).includes('invalid:projection'), true);
});

test('A03 remains E1 contract-only and points to A04', () => {
  assert.equal(contract.taskSetInvariants.everyNonInitialTaskConsumesPriorMilestone, true);
  assert.equal(contract.taskSetInvariants.finalProductRequired, true);
  assert.equal(contract.taskSetInvariants.unapprovedPageSplitAllowed, false);
  for (const [key, value] of Object.entries(contract.scope)) {
    if (key === 'primaryPRLimit') assert.equal(value, 1);
    else assert.equal(value, false, `${key} must remain false in A03`);
  }
  assert.equal(claim.actualEvidenceLevel, 'E1_DATA_STRUCTURE_READY');
  assert.equal(claim.claims.runtimeIntegrated, false);
  assert.equal(claim.claims.productionAdmitted, false);
  assert.equal(claim.nextStep.taskId, 'APP-SOP-A04_GlobalContextBindingAndAdmissionRegistries');
});

test('normative document contains dependency, final-product, authenticity, projection, and scope gates', () => {
  for (const section of [
    '# PBL Task Set SOP V1',
    '## 5. Allowed dependency graph types',
    '## 7. Milestone contract',
    '## 8. Dependency closure',
    '## 9. Final-product contract',
    '## 11. Context authenticity',
    '## 15. Validation layers',
    '## 16. Worksheet projection',
    '## 18. Production gate',
    '## 20. A03 scope boundary'
  ]) assert.equal(document.includes(section), true, `missing section: ${section}`);
});
