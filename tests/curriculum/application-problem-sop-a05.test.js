import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  buildApplicationAuthority,
  validateAdmissionRecord,
  validateApplicationContextBinding,
  validateApplicationPilotBundle,
  validateNPlusOneProof,
  validatePblTaskSet,
  validateSingleApplicationItem
} from '../../src/curriculum/application/application-sop-validator.mjs';
import { runApplicationSopPilotValidation } from '../../tools/curriculum/validate-application-sop-pilot.mjs';

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const pilot = readJson('data/curriculum/application/pilots/g3b_u01/g3b-u01-application-sop-pilot.json');
const unitRegistry = readJson('data/curriculum/knowledge/units/g3b_u01_3b01.knowledge-operation.json');
const contextRegistry = readJson('data/curriculum/context/registry/gs02-g5a-u08-global-context-families.json');
const bindingRegistry = readJson('data/curriculum/application/registry/application-context-bindings.json');
const admissionRegistry = readJson('data/curriculum/application/registry/application-admission-registry.json');

function selectedBundle() {
  const bindingIds = new Set(pilot.contextBindingIds);
  const candidateIds = new Set(pilot.admissionCandidateIds);
  return {
    ...structuredClone(pilot),
    contextBindings: structuredClone(bindingRegistry.bindings.filter((row) => bindingIds.has(row.bindingId))),
    admissionRecords: structuredClone(admissionRegistry.admissionRecords.filter((row) => candidateIds.has(row.candidateId)))
  };
}

function authorityFor(bundle) {
  return buildApplicationAuthority({
    unitRegistry,
    contextRegistry,
    bindings: bundle.contextBindings,
    proofs: bundle.nPlusOneProofs,
    pblTaskSets: bundle.pblTaskSets
  });
}

test('A05 CLI validates the exact G3B-U01 shadow pilot with zero production admissions', () => {
  const result = runApplicationSopPilotValidation();
  assert.equal(result.ok, true, JSON.stringify(result.issues, null, 2));
  assert.equal(result.countParity, true);
  assert.equal(result.status, 'PASS_A05_SHADOW_PILOT');
  assert.deepEqual(result.counts, {
    proofs: 1,
    contextBindings: 3,
    singleItems: 2,
    pblTaskSets: 1,
    admissionRecords: 4,
    productionAdmissions: 0
  });
  assert.deepEqual(result.registrySelection, {
    requestedBindingCount: 3,
    resolvedBindingCount: 3,
    requestedAdmissionRecordCount: 4,
    resolvedAdmissionRecordCount: 4
  });
});

test('pilot lineage resolves to real G3B-U01 KnowledgePoints, operation models, and existing global contexts', () => {
  const bundle = selectedBundle();
  const authority = authorityFor(bundle);
  assert.equal(authority.knowledgePoints.has('kp_g3b_u01_wp_quotative_division'), true);
  assert.equal(authority.knowledgePoints.has('kp_g3b_u01_wp_remainder_interpretation'), true);
  assert.equal(authority.operationModels.has('op_g3b_u01_quotative_division'), true);
  assert.equal(authority.operationModels.has('op_g3b_u01_remainder_floor_ceil_decision'), true);
  assert.equal(authority.families.has('gctx_family_school_class_activity'), true);
  assert.equal(authority.families.has('gctx_family_transit_trip_capacity'), true);
  assert.equal(authority.templates.has('tpl_school_class_activity_01'), true);
  assert.equal(authority.templates.has('tpl_transit_trip_capacity_03'), true);
});

test('SINGLE_DIRECT and SINGLE_N_PLUS_1 fixtures validate different capability and answer-meaning gates', () => {
  const bundle = selectedBundle();
  const authority = authorityFor(bundle);
  const direct = validateSingleApplicationItem(bundle.singleItems[0], authority);
  const n1 = validateSingleApplicationItem(bundle.singleItems[1], authority);
  assert.equal(direct.ok, true, JSON.stringify(direct.issues, null, 2));
  assert.equal(n1.ok, true, JSON.stringify(n1.issues, null, 2));
  assert.equal(bundle.singleItems[0].applicationCapabilityLevel, 'N');
  assert.equal(bundle.singleItems[1].applicationCapabilityLevel, 'N_PLUS_1');
  assert.equal(bundle.singleItems[1].answerModel.numericAnswer, 9);
  assert.equal(bundle.singleItems[1].answerModel.answerRole, 'minimumResourceCount');
});

test('single-item validator rejects wrong arithmetic, missing witness, and unadmitted surface template', () => {
  const bundle = selectedBundle();
  const authority = authorityFor(bundle);

  const wrongAnswer = structuredClone(bundle.singleItems[1]);
  wrongAnswer.answerModel.numericAnswer = 8;
  const wrongAnswerResult = validateSingleApplicationItem(wrongAnswer, authority);
  assert.equal(wrongAnswerResult.issues.some((row) => row.code === 'APP_NUMERIC_ANSWER_INVALID'), true);

  const noWitness = structuredClone(bundle.singleItems[1]);
  delete noWitness.interpretationWitness;
  const noWitnessResult = validateSingleApplicationItem(noWitness, authority);
  assert.equal(noWitnessResult.issues.some((row) => row.code === 'APP_N_PLUS_ONE_WITNESS_MISSING'), true);

  const badTemplate = structuredClone(bundle.singleItems[0]);
  badTemplate.surfaceTemplateId = 'tpl_not_admitted';
  const badTemplateResult = validateSingleApplicationItem(badTemplate, authority);
  assert.equal(badTemplateResult.issues.some((row) => row.code === 'APP_SURFACE_TEMPLATE_NOT_ADMITTED'), true);
});

test('N+1 proof validator rejects missing adjacency, diagnostic coverage, counterfactual, and validator delta', () => {
  const proof = pilot.nPlusOneProofs[0];
  assert.equal(validateNPlusOneProof(proof).ok, true);

  const nonAdjacent = structuredClone(proof);
  nonAdjacent.capabilityEdge.shortestSemanticDistance = 2;
  assert.equal(validateNPlusOneProof(nonAdjacent).issues.some((row) => row.code === 'APP_N_PLUS_ONE_DISTANCE_NOT_ONE'), true);

  const noDiagnostic = structuredClone(proof);
  noDiagnostic.misconceptionModels = noDiagnostic.misconceptionModels.filter((row) => row.diagnosticClassification !== 'CALCULATION_PASS_INTERPRETATION_FAIL');
  assert.equal(validateNPlusOneProof(noDiagnostic).issues.some((row) => row.code === 'APP_N_PLUS_ONE_DIAGNOSTIC_MODEL_MISSING'), true);

  const noCounterfactual = structuredClone(proof);
  noCounterfactual.counterfactualEvidence.expectedAnswerOrDecisionChanged = false;
  assert.equal(validateNPlusOneProof(noCounterfactual).issues.some((row) => row.code === 'APP_N_PLUS_ONE_COUNTERFACTUAL_FAILED'), true);

  const noDelta = structuredClone(proof);
  noDelta.validatorDelta.candidateAdditionalValidatorChecks = [];
  assert.equal(validateNPlusOneProof(noDelta).issues.some((row) => row.code === 'APP_N_PLUS_ONE_VALIDATOR_DELTA_MISSING'), true);
});

test('context binding validator fails closed on missing affordance, invalid unit flow, missing proof, and production status', () => {
  const bundle = selectedBundle();
  const authority = authorityFor(bundle);
  const binding = bundle.contextBindings[1];
  assert.equal(validateApplicationContextBinding(binding, authority).ok, true);

  const missingAffordance = structuredClone(binding);
  missingAffordance.providedContextAffordances = missingAffordance.providedContextAffordances.slice(0, 1);
  assert.equal(validateApplicationContextBinding(missingAffordance, authority).issues.some((row) => row.code === 'APP_CONTEXT_AFFORDANCE_MISSING'), true);

  const badUnitFlow = structuredClone(binding);
  badUnitFlow.unitFlow.answerUnit = '人';
  assert.equal(validateApplicationContextBinding(badUnitFlow, authority).issues.some((row) => row.code === 'APP_CONTEXT_ANSWER_UNIT_FLOW_MISMATCH'), true);

  const missingProof = structuredClone(binding);
  delete missingProof.nPlusOneProofRef;
  assert.equal(validateApplicationContextBinding(missingProof, authority).issues.some((row) => row.code === 'APP_CONTEXT_N_PLUS_ONE_PROOF_MISSING'), true);

  const production = structuredClone(binding);
  production.admissionStatus = 'PRODUCTION_ADMITTED';
  assert.equal(validateApplicationContextBinding(production, authority).issues.some((row) => row.code === 'APP_A05_PRODUCTION_BINDING_FORBIDDEN'), true);
});

test('PBL validator requires dependency closure, milestone reuse, one final task, and approved projection', () => {
  const bundle = selectedBundle();
  const authority = authorityFor(bundle);
  const taskSet = bundle.pblTaskSets[0];
  assert.equal(validatePblTaskSet(taskSet, authority).ok, true);

  const independentQ2 = structuredClone(taskSet);
  independentQ2.tasks[1].inputRefs = [];
  assert.equal(validatePblTaskSet(independentQ2, authority).issues.some((row) => row.code === 'PBL_NON_INITIAL_TASK_WITHOUT_INPUT'), true);

  const unresolved = structuredClone(taskSet);
  unresolved.tasks[1].inputRefs = ['MISSING'];
  assert.equal(validatePblTaskSet(unresolved, authority).issues.some((row) => row.code === 'PBL_INPUT_REF_UNRESOLVED'), true);

  const orphan = structuredClone(taskSet);
  orphan.milestones[0].requiredByTaskIds = [];
  assert.equal(validatePblTaskSet(orphan, authority).issues.some((row) => row.code === 'PBL_ORPHAN_MILESTONE'), true);

  const multipleFinal = structuredClone(taskSet);
  multipleFinal.tasks[1].isFinalTask = true;
  assert.equal(validatePblTaskSet(multipleFinal, authority).issues.some((row) => row.code === 'PBL_FINAL_TASK_NOT_UNIQUE'), true);

  const unapprovedProjection = structuredClone(taskSet);
  unapprovedProjection.approvedProjection = 'AUTO_SPLIT_ANYWHERE';
  assert.equal(validatePblTaskSet(unapprovedProjection, authority).issues.some((row) => row.code === 'PBL_PROJECTION_UNAPPROVED'), true);
});

test('admission records and aggregate bundle remain candidate-only and production fail-closed', () => {
  const bundle = selectedBundle();
  const aggregate = validateApplicationPilotBundle(bundle, { unitRegistry, contextRegistry });
  assert.equal(aggregate.ok, true, JSON.stringify(aggregate.issues, null, 2));
  assert.equal(aggregate.counts.productionAdmissions, 0);
  assert.equal(bundle.admissionRecords.every((row) => row.productionAdmissionAllowed === false), true);

  const invalid = structuredClone(bundle.admissionRecords[0]);
  invalid.productionAdmissionAllowed = true;
  assert.equal(validateAdmissionRecord(invalid).issues.some((row) => row.code === 'APP_NON_PRODUCTION_RECORD_MUST_FAIL_CLOSED'), true);
});
