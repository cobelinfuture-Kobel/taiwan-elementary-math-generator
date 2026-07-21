import assert from 'node:assert/strict';
import test from 'node:test';

import {
  materializeW01NPlusOneAndPBLCandidatePack,
  validateW01NPlusOneAndPBLCandidatePack
} from '../../src/curriculum/application/w01-nplusone-pbl-candidate-pack.mjs';
import { runPOSTGAPPW01A02Validation } from '../../tools/curriculum/validate-postg-app-w01-a02-candidate-pack.mjs';

const materialized = materializeW01NPlusOneAndPBLCandidatePack();
const codes = (result) => result.issues.map((row) => row.code);

test('W01-A02 materializes every expected N+1 proof and PBL blueprint', () => {
  const result = runPOSTGAPPW01A02Validation();
  assert.equal(
    result.validationStatus,
    'PASS_POSTG_APP_W01_A02_N_PLUS_ONE_AND_PBL_CANDIDATE_PACK',
    JSON.stringify(result.issues, null, 2)
  );
  assert.equal(result.status, 'W01_N_PLUS_ONE_AND_PBL_CANDIDATE_PACK_READY');
  assert.equal(result.consumerGate, true);
  assert.equal(result.deterministicSecondPassEqual, true);
  assert.equal(result.counts.nPlusOneProofCandidateCount, result.counts.expectedNPlusOneCount);
  assert.equal(result.counts.pblTaskSetCandidateCount, result.counts.expectedPBLCount);
  assert.equal(result.counts.crossContextPairCount, result.counts.nPlusOneProofCandidateCount);
  assert.equal(result.counts.productionAdmittedCount, 0);
});

test('every N+1 blueprint uses one allowed interpretive act and three misconceptions', () => {
  const allowed = new Set([
    'UNKNOWN_ROLE_SHIFT',
    'REMAINDER_INTERPRETATION',
    'RELATION_CHAIN',
    'DUAL_CONSTRAINT_RESOLUTION',
    'CONSERVATION_OR_TRANSFER',
    'COMPARISON_DECISION',
    'UNIT_ROLE_INTERPRETATION',
    'IRRELEVANT_INFORMATION_FILTER'
  ]);
  assert.equal(materialized.nPlusOneProofCandidates.length > 0, true);
  for (const proof of materialized.nPlusOneProofCandidates) {
    assert.equal(allowed.has(proof.newInterpretiveAct), true, proof.proofCandidateId);
    assert.equal(proof.capabilityEdge.shortestSemanticDistance, 1);
    assert.equal(proof.capabilityEdge.intermediateSemanticNodeRequired, false);
    assert.equal(proof.misconceptionCandidates.length >= 3, true);
    assert.equal(proof.misconceptionCandidates.some((row) => (
      row.diagnosticClassification === 'CALCULATION_PASS_INTERPRETATION_FAIL'
    )), true);
    assert.equal(proof.pendingProofChecks.length > 0, true);
    assert.equal(proof.candidateStatus, 'N_PLUS_1_PROOF_BLUEPRINT_COMPLETE');
    assert.equal(proof.productionAdmissionAllowed, false);
  }
});

test('every N+1 proof has an eligible alternate Atomic Episode in a different Macro Context Domain', () => {
  for (const proof of materialized.nPlusOneProofCandidates) {
    const assessmentRecord = materialized.assessmentByKey.get(`${proof.sourceId}::${proof.knowledgePointId}`);
    const cross = proof.crossContextProofCandidate;
    assert.notEqual(cross.primaryMacroContextId, cross.alternateMacroContextId, proof.proofCandidateId);
    assert.equal(cross.macroContextsDiffer, true);
    assert.equal(assessmentRecord.eligibleAtomicEpisodeIds.includes(cross.primaryAtomicEpisodeId), true);
    assert.equal(assessmentRecord.eligibleAtomicEpisodeIds.includes(cross.alternateAtomicEpisodeId), true);
    assert.equal(cross.sameKnowledgePoint, true);
    assert.equal(cross.sameOperationModel, true);
    assert.equal(cross.sameInterpretiveAct, true);
    assert.equal(cross.sameValidatorDelta, true);
    assert.equal(cross.executed, false);
  }
});

test('G3B-U01 remainder interpretation produces the required semantic proof blueprint', () => {
  const proof = materialized.nPlusOneProofCandidates.find((row) => (
    row.sourceId === 'g3b_u01_3b01'
    && row.knowledgePointId === 'kp_g3b_u01_wp_remainder_interpretation'
  ));
  assert.equal(Boolean(proof), true);
  assert.equal(proof.newInterpretiveAct, 'REMAINDER_INTERPRETATION');
  assert.equal(proof.interpretationWitnessBlueprint.witnessType, 'DECISION_REASON_SELECTION');
  assert.equal(proof.misconceptionCandidates.some((row) => row.misconceptionType === 'QUOTIENT_ONLY'), true);
  assert.equal(proof.counterfactualBlueprint.numericPrerequisitesPreserved, true);
  assert.equal(proof.counterfactualBlueprint.fixtureInstantiated, false);
});

test('every PBL blueprint has a valid 3-task or 5-task dependency graph', () => {
  for (const pbl of materialized.pblTaskSetCandidates) {
    const expectedTaskCount = pbl.graphType === 'PBL5_BOUNDED_DECISION' ? 5 : 3;
    assert.equal(pbl.taskBlueprints.length, expectedTaskCount, pbl.pblCandidateId);
    assert.deepEqual(pbl.taskBlueprints.map((row) => row.sequenceIndex), Array.from({ length: expectedTaskCount }, (_, index) => index + 1));
    for (const [index, task] of pbl.taskBlueprints.entries()) {
      if (index === 0) assert.deepEqual(task.inputRefs, []);
      else assert.equal(task.inputRefs.length > 0, true, `${pbl.pblCandidateId}:${task.taskId}`);
      assert.equal(task.fullyInstantiated, false);
    }
    const finalTasks = pbl.taskBlueprints.filter((row) => row.isFinalTask);
    assert.equal(finalTasks.length, 1);
    assert.equal(finalTasks[0].taskId, pbl.finalProductCandidate.finalTaskId);
    assert.equal(pbl.finalProductCandidate.requiredMilestoneIds.length >= 2, true);
    assert.equal(pbl.misconceptionCandidates.length >= 3, true);
    assert.equal(pbl.counterfactualPropagationCandidate.finalDecisionMustChange, true);
    assert.equal(pbl.candidateStatus, 'PBL_TASK_SET_BLUEPRINT_COMPLETE');
    assert.equal(pbl.productionAdmissionAllowed, false);
  }
});

test('PBL context and binding lineage remains identical to A01', () => {
  for (const pbl of materialized.pblTaskSetCandidates) {
    const a01 = materialized.candidateByKey.get(`${pbl.sourceId}::${pbl.primaryKnowledgePointId}`);
    assert.equal(pbl.bindingCandidateId, a01.bindingCandidateId);
    assert.equal(pbl.macroContextId, a01.contextSelection.macroContextId);
    assert.equal(pbl.atomicEpisodeId, a01.contextSelection.atomicEpisodeId);
    assert.equal(pbl.lineage.a01BindingCandidateId, a01.bindingCandidateId);
  }
});

test('A02 remains blueprint-only and does not claim executed proof or production admission', () => {
  assert.equal(materialized.nPlusOneProofCandidates.every((row) => row.prerequisiteClosureCandidate.executionVerified === false), true);
  assert.equal(materialized.nPlusOneProofCandidates.every((row) => row.pairedControlBlueprint.numericFixtureInstantiated === false), true);
  assert.equal(materialized.nPlusOneProofCandidates.every((row) => row.interpretationWitnessBlueprint.executed === false), true);
  assert.equal(materialized.pblTaskSetCandidates.every((row) => row.drivingProblemCandidate.authenticityExecutionVerified === false), true);
  assert.equal(materialized.pblTaskSetCandidates.every((row) => row.finalProductCandidate.executed === false), true);
  assert.equal(materialized.pblTaskSetCandidates.every((row) => row.productionAdmissionAllowed === false), true);
});

test('same-macro cross-context pair and missing misconception fail closed', () => {
  const crossCase = structuredClone(materialized);
  const proof = crossCase.nPlusOneProofCandidates[0];
  proof.crossContextProofCandidate.alternateMacroContextId = proof.crossContextProofCandidate.primaryMacroContextId;
  assert.equal(codes(validateW01NPlusOneAndPBLCandidatePack(crossCase)).includes('POSTG_APP_W01_A02_CROSS_CONTEXT_MACRO_NOT_DIFFERENT'), true);

  const misconceptionCase = structuredClone(materialized);
  misconceptionCase.nPlusOneProofCandidates[0].misconceptionCandidates = misconceptionCase.nPlusOneProofCandidates[0].misconceptionCandidates.slice(0, 2);
  assert.equal(codes(validateW01NPlusOneAndPBLCandidatePack(misconceptionCase)).includes('POSTG_APP_W01_A02_MISCONCEPTION_COUNT_INSUFFICIENT'), true);
});

test('broken PBL dependency and insufficient final synthesis fail closed', () => {
  if (materialized.pblTaskSetCandidates.length === 0) return;
  const dependencyCase = structuredClone(materialized);
  dependencyCase.pblTaskSetCandidates[0].taskBlueprints[1].inputRefs = [];
  assert.equal(codes(validateW01NPlusOneAndPBLCandidatePack(dependencyCase)).includes('POSTG_APP_W01_A02_PBL_DEPENDENCY_MISSING'), true);

  const synthesisCase = structuredClone(materialized);
  synthesisCase.pblTaskSetCandidates[0].finalProductCandidate.requiredMilestoneIds = [
    synthesisCase.pblTaskSetCandidates[0].finalProductCandidate.requiredMilestoneIds[0]
  ];
  assert.equal(codes(validateW01NPlusOneAndPBLCandidatePack(synthesisCase)).includes('POSTG_APP_W01_A02_PBL_FINAL_SYNTHESIS_INSUFFICIENT'), true);
});

test('premature N+1 or PBL production admission fails closed', () => {
  const n1Case = structuredClone(materialized);
  n1Case.nPlusOneProofCandidates[0].productionAdmissionAllowed = true;
  assert.equal(codes(validateW01NPlusOneAndPBLCandidatePack(n1Case)).includes('POSTG_APP_W01_A02_N1_PRODUCTION_ADMISSION_FORBIDDEN'), true);

  if (materialized.pblTaskSetCandidates.length === 0) return;
  const pblCase = structuredClone(materialized);
  pblCase.pblTaskSetCandidates[0].productionAdmissionAllowed = true;
  assert.equal(codes(validateW01NPlusOneAndPBLCandidatePack(pblCase)).includes('POSTG_APP_W01_A02_PBL_PRODUCTION_ADMISSION_FORBIDDEN'), true);
});
