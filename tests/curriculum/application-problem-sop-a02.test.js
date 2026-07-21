import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const schema = JSON.parse(readFileSync('data/curriculum/application/schema/n-plus-one-interpretation-proof.schema.json', 'utf8'));
const contract = JSON.parse(readFileSync('data/curriculum/application/contracts/APP-SOP-A02_NPlusOneInterpretationProofAndMisconceptionContract.json', 'utf8'));
const claim = JSON.parse(readFileSync('data/project/milestones/APP-SOP-A02.claim.json', 'utf8'));
const document = readFileSync('docs/curriculum/contracts/NPlusOne_Application_Interpretation_Proof_SOP_V1.md', 'utf8');

const PROOF = {
  schemaVersion: 1,
  proofId: 'n1proof_g3b_u01_remainder_min_container_001',
  sourceId: 'g3b_u01_3b01',
  knowledgePointId: 'kp_g3b_u01_wp_remainder_interpretation',
  baseCapabilityId: 'cap_report_quotient_remainder',
  candidateCapabilityId: 'cap_minimum_container_decision',
  capabilityEdge: {
    from: 'cap_report_quotient_remainder',
    to: 'cap_minimum_container_decision',
    shortestSemanticDistance: 1,
    intermediateSemanticNodeRequired: false
  },
  prerequisiteClosure: {
    requiredPrerequisiteCapabilityIds: ['division_with_remainder'],
    availablePrerequisiteCapabilityIds: ['division_with_remainder'],
    missingPrerequisiteCapabilityIds: []
  },
  newInterpretiveAct: 'REMAINDER_INTERPRETATION',
  pairedControl: {
    basePrompt: '50個物品，每箱裝6個，可以裝滿幾箱，還剩幾個？',
    candidatePrompt: '50個物品，每箱最多裝6個，全部裝完至少需要幾箱？',
    baseTargetRole: 'fullGroupCountAndRemainder',
    candidateTargetRole: 'minimumContainerCount',
    baseExpectedAnswer: { quotient: 8, remainder: 2 },
    candidateExpectedAnswer: 9,
    sameNumericPrerequisites: true,
    sameOrEquivalentNumbers: true,
    sameNumberDomain: true,
    sameOrEquivalentSurfaceLoad: true,
    semanticDeltaOnly: true
  },
  interpretationFork: {
    forkPoint: '50 / 6 gives quotient 8 and remainder 2',
    validInterpretationPath: 'use 9 containers because all items must be handled',
    plausibleMisinterpretationPath: 'report only the quotient 8',
    contextConditionThatResolvesFork: 'all items must be contained'
  },
  interpretationWitness: {
    witnessType: 'DECISION_REASON_SELECTION',
    promptZh: '為什麼不能只準備8個箱子？',
    expectedEvidence: '剩下2個物品仍需要另一個箱子。',
    witnessTargetsNewInterpretiveAct: true,
    witnessCanDistinguishCorrectArithmeticFromCorrectInterpretation: true,
    witnessDoesNotRevealAnswer: true
  },
  misconceptionModels: [
    {
      misconceptionId: 'mis_quotient_only',
      misconceptionType: 'QUOTIENT_ONLY',
      triggerCondition: 'learner stops after computing quotient',
      expectedWrongAnswerOrDecision: 8,
      diagnosticMeaning: 'correct division but ignores remaining items',
      diagnosticClassification: 'CALCULATION_PASS_INTERPRETATION_FAIL',
      severity: 'BLOCKING'
    },
    {
      misconceptionId: 'mis_remainder_as_target',
      misconceptionType: 'REMAINDER_AS_TARGET',
      triggerCondition: 'learner treats remainder as container count',
      expectedWrongAnswerOrDecision: 2,
      diagnosticMeaning: 'confuses remainder with target role',
      diagnosticClassification: 'ANSWER_ROLE_OR_UNIT_FAIL',
      severity: 'DIAGNOSTIC'
    }
  ],
  counterfactualEvidence: {
    changedContextCondition: 'count only completely filled containers',
    numericPrerequisitesPreserved: true,
    expectedInterpretationChanged: true,
    expectedAnswerOrDecisionChanged: true,
    expectedAnswerOrDecision: 8
  },
  crossContextEvidence: {
    contextFamilyA: 'gctx_family_transport_capacity',
    contextFamilyB: 'gctx_family_packaging_capacity',
    sharedRoleGraph: true,
    sharedNewInterpretiveAct: true,
    contextSpecificUnits: ['輛', '箱'],
    sameValidatorDelta: true
  },
  keywordRobustnessEvidence: {
    originalSurfaceTemplate: '至少需要幾輛車，才能讓所有學生都有座位？',
    paraphrasedSurfaceTemplate: '要準備多少輛車才不會有人沒有座位？',
    roleGraphEquivalent: true,
    expectedAnswerEquivalent: true
  },
  validatorDelta: {
    baseValidatorChecks: ['quotient and remainder reconstruction'],
    candidateAdditionalValidatorChecks: ['remainder decision', 'minimum-resource answer role']
  },
  answerMeaningValidation: {
    answerRoleValidated: true,
    answerUnitValidated: true,
    contextDecisionValidated: true,
    interpretationStatementValidated: true
  },
  evidenceLifecycleState: 'PROVEN_N_PLUS_1_CANDIDATE',
  verdict: 'PROVEN_N_PLUS_1_CANDIDATE'
};

function validateProof(proof) {
  const errors = [];
  for (const field of schema.required) if (!(field in proof)) errors.push(`missing:${field}`);
  if (proof.capabilityEdge?.shortestSemanticDistance !== 1) errors.push('invalid:distance');
  if (proof.capabilityEdge?.intermediateSemanticNodeRequired !== false) errors.push('invalid:intermediate');
  if ((proof.prerequisiteClosure?.missingPrerequisiteCapabilityIds?.length ?? 1) !== 0) errors.push('invalid:prerequisites');
  if (proof.pairedControl?.sameNumericPrerequisites !== true || proof.pairedControl?.semanticDeltaOnly !== true) errors.push('invalid:pairedControl');
  if (!proof.interpretationFork?.contextConditionThatResolvesFork) errors.push('invalid:fork');
  if (proof.interpretationWitness?.witnessTargetsNewInterpretiveAct !== true) errors.push('invalid:witness');
  if ((proof.misconceptionModels?.length ?? 0) < 2) errors.push('invalid:misconceptionCount');
  if (!proof.misconceptionModels?.some((row) => row.diagnosticClassification === 'CALCULATION_PASS_INTERPRETATION_FAIL')) errors.push('invalid:diagnosticCoverage');
  if (proof.counterfactualEvidence?.expectedAnswerOrDecisionChanged !== true) errors.push('invalid:counterfactual');
  if (proof.crossContextEvidence?.sameValidatorDelta !== true) errors.push('invalid:crossContext');
  if (proof.keywordRobustnessEvidence?.roleGraphEquivalent !== true) errors.push('invalid:keywordRobustness');
  if ((proof.validatorDelta?.candidateAdditionalValidatorChecks?.length ?? 0) < 1) errors.push('invalid:validatorDelta');
  return errors;
}

test('A02 proof schema locks semantic adjacency and prerequisite closure', () => {
  assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.equal(schema.properties.capabilityEdge.properties.shortestSemanticDistance.const, 1);
  assert.equal(schema.properties.capabilityEdge.properties.intermediateSemanticNodeRequired.const, false);
  assert.equal(schema.properties.prerequisiteClosure.properties.missingPrerequisiteCapabilityIds.maxItems, 0);
});

test('valid N+1 proof package passes structural evidence checks', () => {
  assert.deepEqual(validateProof(PROOF), []);
});

test('proof rejects non-adjacent, missing-prerequisite, and numeric-only evidence', () => {
  const nonAdjacent = structuredClone(PROOF);
  nonAdjacent.capabilityEdge.shortestSemanticDistance = 2;
  assert.equal(validateProof(nonAdjacent).includes('invalid:distance'), true);

  const missingPrerequisite = structuredClone(PROOF);
  missingPrerequisite.prerequisiteClosure.missingPrerequisiteCapabilityIds = ['parts_model'];
  assert.equal(validateProof(missingPrerequisite).includes('invalid:prerequisites'), true);

  const numericOnly = structuredClone(PROOF);
  numericOnly.pairedControl.semanticDeltaOnly = false;
  assert.equal(validateProof(numericOnly).includes('invalid:pairedControl'), true);
});

test('proof requires diagnostic, counterfactual, cross-context, and validator-delta evidence', () => {
  const noDiagnostic = structuredClone(PROOF);
  noDiagnostic.misconceptionModels = noDiagnostic.misconceptionModels.filter((row) => row.diagnosticClassification !== 'CALCULATION_PASS_INTERPRETATION_FAIL');
  assert.equal(validateProof(noDiagnostic).includes('invalid:diagnosticCoverage'), true);

  const noCounterfactual = structuredClone(PROOF);
  noCounterfactual.counterfactualEvidence.expectedAnswerOrDecisionChanged = false;
  assert.equal(validateProof(noCounterfactual).includes('invalid:counterfactual'), true);

  const noCrossContext = structuredClone(PROOF);
  noCrossContext.crossContextEvidence.sameValidatorDelta = false;
  assert.equal(validateProof(noCrossContext).includes('invalid:crossContext'), true);

  const noValidatorDelta = structuredClone(PROOF);
  noValidatorDelta.validatorDelta.candidateAdditionalValidatorChecks = [];
  assert.equal(validateProof(noValidatorDelta).includes('invalid:validatorDelta'), true);
});

test('A02 contract is proof-only, E1, and points to A03', () => {
  assert.equal(contract.proofInvariants.shortestSemanticDistance, 1);
  assert.equal(contract.proofInvariants.minimumMisconceptionModels, 2);
  assert.equal(contract.proofInvariants.crossContextInvarianceRequired, true);
  assert.equal(contract.proofInvariants.validatorDeltaRequired, true);
  for (const [key, value] of Object.entries(contract.scope)) {
    if (key === 'primaryPRLimit') assert.equal(value, 1);
    else assert.equal(value, false, `${key} must remain false in A02`);
  }
  assert.equal(claim.actualEvidenceLevel, 'E1_DATA_STRUCTURE_READY');
  assert.equal(claim.claims.runtimeIntegrated, false);
  assert.equal(claim.claims.productionAdmitted, false);
  assert.equal(claim.nextStep.taskId, 'APP-SOP-A03_PBLTaskSetDependencyMilestoneAndFinalProductContract');
});

test('normative document includes all proof gates and scope boundary', () => {
  for (const section of [
    '# N+1 Application Interpretation Proof SOP V1',
    '## 4. Prerequisite closure',
    '## 6. Paired-control evidence',
    '## 7. Interpretation fork',
    '## 9. Misconception taxonomy',
    '## 11. Counterfactual evidence',
    '## 12. Cross-context invariance',
    '## 14. Validator delta',
    '## 17. Minimum proof gate',
    '## 19. A02 scope boundary'
  ]) assert.equal(document.includes(section), true, `missing section: ${section}`);
});
