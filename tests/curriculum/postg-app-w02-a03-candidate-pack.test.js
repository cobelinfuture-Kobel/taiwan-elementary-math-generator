import assert from 'node:assert/strict';
import test from 'node:test';

import {
  materializeW02NPlusOneAndPBLCandidatePack,
  validateW02NPlusOneAndPBLCandidatePack
} from '../../src/curriculum/application/w02-nplusone-pbl-candidate-pack.mjs';
import { runPOSTGAPPW02A03Validation } from '../../tools/curriculum/validate-postg-app-w02-a03-candidate-pack.mjs';

const materialized = materializeW02NPlusOneAndPBLCandidatePack();
const codes = (result) => result.issues.map((row) => row.code);

test('W02-A03 creates one N+1 proof blueprint for each A02 application candidate', () => {
  const result = runPOSTGAPPW02A03Validation();
  assert.equal(result.validationStatus, 'PASS_POSTG_APP_W02_A03_N_PLUS_ONE_AND_PBL_CANDIDATE_PACK', JSON.stringify(result.issues, null, 2));
  assert.equal(result.status, 'W02_N_PLUS_ONE_AND_PBL_CANDIDATE_PACK_READY');
  assert.equal(result.consumerGate, true);
  assert.equal(result.deterministicSecondPassEqual, true);
  assert.equal(result.counts.a02SingleApplicationCandidateCount, 61);
  assert.equal(result.counts.nPlusOneProofCandidateCount, 61);
  assert.equal(result.counts.misconceptionCandidateCount, 183);
  assert.equal(result.counts.crossContextPairCount, 61);
  assert.equal(result.counts.productionAdmittedCount, 0);
});

test('every proof adds exactly one interpretive act and exactly three misconception candidates', () => {
  const allowed = new Set(materialized.policy.interpretiveActRules.map((row) => row.act));
  for (const proof of materialized.nPlusOneProofCandidates) {
    assert.equal(allowed.has(proof.newInterpretiveAct), true, proof.proofCandidateId);
    assert.equal(proof.capabilityEdge.shortestSemanticDistance, 1);
    assert.equal(proof.capabilityEdge.intermediateSemanticNodeRequired, false);
    assert.equal(proof.pairedControlBlueprint.semanticDeltaOnly, true);
    assert.equal(proof.misconceptionCandidates.length, 3);
    assert.equal(proof.misconceptionCandidates.some((row) => row.misconceptionType === 'OPERATION_KEYWORD_MATCHING'), true);
    assert.equal(proof.misconceptionCandidates.some((row) => row.misconceptionType === 'COMPUTED_NOT_INTERPRETED'), true);
    assert.equal(proof.misconceptionCandidates.some((row) => row.diagnosticClassification === 'CALCULATION_PASS_INTERPRETATION_FAIL'), true);
  }
});

test('every proof has a different-macro cross-context candidate and preserves A02 lineage', () => {
  for (const proof of materialized.nPlusOneProofCandidates) {
    const candidate = materialized.candidateByPatternSpecId.get(proof.patternSpecId);
    assert.equal(Boolean(candidate), true);
    assert.equal(proof.bindingCandidateId, candidate.bindingCandidateId);
    assert.equal(proof.requestedUnknownRole, candidate.requestedUnknownRole);
    assert.equal(proof.crossContextProofCandidate.primaryMacroContextId, candidate.contextSelection.macroContextId);
    assert.equal(proof.crossContextProofCandidate.primaryAtomicEpisodeId, candidate.contextSelection.atomicEpisodeId);
    assert.notEqual(proof.crossContextProofCandidate.alternateMacroContextId, candidate.contextSelection.macroContextId);
    assert.equal(materialized.a02.contextIndexes.episodeChains.has(proof.crossContextProofCandidate.alternateAtomicEpisodeId), true);
  }
});

test('PBL is materialized only for APPLICATION_REQUIRED candidates', () => {
  assert.equal(materialized.pblEligibleCandidates.length > 0, true);
  assert.equal(materialized.pblTaskSetCandidates.length, materialized.pblEligibleCandidates.length);
  for (const pbl of materialized.pblTaskSetCandidates) {
    const candidate = materialized.candidateByPatternSpecId.get(pbl.patternSpecId);
    assert.equal(candidate.classification, 'APPLICATION_REQUIRED');
    assert.equal(pbl.bindingCandidateId, candidate.bindingCandidateId);
    assert.equal(pbl.macroContextId, candidate.contextSelection.macroContextId);
    assert.equal(pbl.atomicEpisodeId, candidate.contextSelection.atomicEpisodeId);
  }
  assert.equal(materialized.pblTaskSetCandidates.some((pbl) => (
    materialized.candidateByPatternSpecId.get(pbl.patternSpecId).classification === 'APPLICATION_COMPATIBLE'
  )), false);
});

test('every PBL blueprint has a valid 3-task or 5-task dependency graph', () => {
  for (const pbl of materialized.pblTaskSetCandidates) {
    const expectedTaskCount = pbl.graphType === 'PBL5_BOUNDED_DECISION' ? 5 : 3;
    assert.equal(pbl.taskBlueprints.length, expectedTaskCount, pbl.pblCandidateId);
    assert.equal(pbl.milestoneBlueprints.length, expectedTaskCount, pbl.pblCandidateId);
    assert.deepEqual(pbl.taskBlueprints.map((row) => row.sequenceIndex), Array.from({ length: expectedTaskCount }, (_, index) => index + 1));
    for (const [index, task] of pbl.taskBlueprints.entries()) {
      if (index === 0) assert.deepEqual(task.inputRefs, []);
      else assert.equal(task.inputRefs.length > 0, true, `${pbl.pblCandidateId}:${task.taskId}`);
      assert.equal(task.fullyInstantiated, false);
    }
    assert.equal(pbl.taskBlueprints.filter((row) => row.isFinalTask).length, 1);
    assert.equal(pbl.finalProductCandidate.requiredMilestoneIds.length >= 2, true);
    assert.equal(pbl.productionAdmissionAllowed, false);
  }
});

test('duplicate PDF content preserves normalized N+1 and PBL projection parity', () => {
  const validation = validateW02NPlusOneAndPBLCandidatePack(materialized);
  assert.equal(validation.proofDuplicateComparisons.length, 1);
  assert.equal(validation.proofDuplicateComparisons[0].contentIdentityGroup, 'pdf_5ba57aff6a97');
  assert.equal(validation.proofDuplicateComparisons[0].equal, true);
  assert.equal(validation.pblDuplicateComparisons.every((row) => row.equal), true);
});

test('A03 remains blueprint-only with no executed proof or production admission', () => {
  assert.equal(materialized.nPlusOneProofCandidates.every((row) => row.prerequisiteClosureCandidate.executionVerified === false), true);
  assert.equal(materialized.nPlusOneProofCandidates.every((row) => row.pairedControlBlueprint.numericFixtureInstantiated === false), true);
  assert.equal(materialized.nPlusOneProofCandidates.every((row) => row.interpretationWitnessBlueprint.executed === false), true);
  assert.equal(materialized.pblTaskSetCandidates.every((row) => row.drivingProblemCandidate.authenticityExecutionVerified === false), true);
  assert.equal(materialized.pblTaskSetCandidates.every((row) => row.finalProductCandidate.executed === false), true);
  assert.equal(materialized.pblTaskSetCandidates.every((row) => row.productionAdmissionAllowed === false), true);
});

test('missing misconception, same macro and premature production admission fail closed', () => {
  const misconceptionCase = structuredClone(materialized);
  misconceptionCase.nPlusOneProofCandidates[0].misconceptionCandidates.pop();
  assert.equal(codes(validateW02NPlusOneAndPBLCandidatePack(misconceptionCase)).includes('POSTG_APP_W02_A03_MISCONCEPTION_COUNT_INVALID'), true);

  const crossCase = structuredClone(materialized);
  crossCase.nPlusOneProofCandidates[0].crossContextProofCandidate.alternateMacroContextId = crossCase.nPlusOneProofCandidates[0].crossContextProofCandidate.primaryMacroContextId;
  assert.equal(codes(validateW02NPlusOneAndPBLCandidatePack(crossCase)).includes('POSTG_APP_W02_A03_CROSS_CONTEXT_INVALID'), true);

  const admissionCase = structuredClone(materialized);
  admissionCase.nPlusOneProofCandidates[0].productionAdmissionAllowed = true;
  assert.equal(codes(validateW02NPlusOneAndPBLCandidatePack(admissionCase)).includes('POSTG_APP_W02_A03_N1_BOUNDARY_INVALID'), true);
});

test('broken PBL dependency and forced compatible PBL fail closed', () => {
  const dependencyCase = structuredClone(materialized);
  dependencyCase.pblTaskSetCandidates[0].taskBlueprints[1].inputRefs = [];
  assert.equal(codes(validateW02NPlusOneAndPBLCandidatePack(dependencyCase)).includes('POSTG_APP_W02_A03_PBL_DEPENDENCY_INVALID'), true);

  const compatible = materialized.a02.candidates.find((row) => row.classification === 'APPLICATION_COMPATIBLE');
  assert.equal(Boolean(compatible), true);
  const forcedCase = structuredClone(materialized);
  forcedCase.pblTaskSetCandidates.push({
    ...structuredClone(forcedCase.pblTaskSetCandidates[0]),
    pblCandidateId: 'w02_pbl_forced_compatible',
    sourceId: compatible.sourceId,
    sourceContentIdentityGroup: compatible.sourceContentIdentityGroup,
    patternSpecId: compatible.patternSpecId,
    primaryKnowledgePointId: compatible.knowledgePointId,
    canonicalOperationModelId: compatible.canonicalOperationModelId,
    bindingCandidateId: compatible.bindingCandidateId,
    proofCandidateId: forcedCase.proofByPatternSpecId.get(compatible.patternSpecId).proofCandidateId
  });
  const forcedCodes = codes(validateW02NPlusOneAndPBLCandidatePack(forcedCase));
  assert.equal(forcedCodes.includes('POSTG_APP_W02_A03_PBL_COUNT_MISMATCH'), true);
  assert.equal(forcedCodes.includes('POSTG_APP_W02_A03_COMPATIBLE_PBL_FORCED'), true);
});
