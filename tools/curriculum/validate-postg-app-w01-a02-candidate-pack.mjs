import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildW01NPlusOneAndPBLCandidateReadback,
  materializeW01NPlusOneAndPBLCandidatePack,
  validateW01NPlusOneAndPBLCandidatePack
} from '../../src/curriculum/application/w01-nplusone-pbl-candidate-pack.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');

export function runPOSTGAPPW01A02Validation() {
  const readback = buildW01NPlusOneAndPBLCandidateReadback({ root: ROOT });
  const materialized = materializeW01NPlusOneAndPBLCandidatePack({ root: ROOT });
  const secondPass = validateW01NPlusOneAndPBLCandidatePack(materialized);

  const remainderProof = materialized.nPlusOneProofCandidates.find((row) => (
    row.sourceId === 'g3b_u01_3b01'
    && row.knowledgePointId === 'kp_g3b_u01_wp_remainder_interpretation'
  ));
  const pbl3 = materialized.pblTaskSetCandidates.find((row) => row.graphType === 'PBL3_LINEAR');
  const pbl5 = materialized.pblTaskSetCandidates.find((row) => row.graphType === 'PBL5_BOUNDED_DECISION');
  const allCrossContextPairsDiffer = materialized.nPlusOneProofCandidates.every((row) => (
    row.crossContextProofCandidate.primaryMacroContextId
    !== row.crossContextProofCandidate.alternateMacroContextId
  ));
  const allPBLFinalTasksUseTwoMilestones = materialized.pblTaskSetCandidates.every((row) => (
    row.finalProductCandidate.requiredMilestoneIds.length >= 2
  ));
  const graphCoverageGate = materialized.pblTaskSetCandidates.length === 0
    || Boolean(pbl3 || pbl5);
  const consumerGate = Boolean(
    readback.counts.nPlusOneProofCandidateCount === readback.counts.expectedNPlusOneCount
    && readback.counts.pblTaskSetCandidateCount === readback.counts.expectedPBLCount
    && readback.counts.productionAdmittedCount === 0
    && remainderProof?.newInterpretiveAct === 'REMAINDER_INTERPRETATION'
    && remainderProof?.misconceptionCandidates.some((row) => (
      row.diagnosticClassification === 'CALCULATION_PASS_INTERPRETATION_FAIL'
    ))
    && allCrossContextPairsDiffer
    && allPBLFinalTasksUseTwoMilestones
    && graphCoverageGate
  );

  return {
    ...readback,
    consumerGate,
    deterministicSecondPassEqual: JSON.stringify(secondPass.counts) === JSON.stringify(readback.counts)
      && JSON.stringify(secondPass.actCounts) === JSON.stringify(readback.actCounts)
      && JSON.stringify(secondPass.graphCounts) === JSON.stringify(readback.graphCounts),
    sampleAssertions: {
      remainderProof: remainderProof ? {
        proofCandidateId: remainderProof.proofCandidateId,
        newInterpretiveAct: remainderProof.newInterpretiveAct,
        misconceptionCount: remainderProof.misconceptionCandidates.length,
        primaryMacroContextId: remainderProof.crossContextProofCandidate.primaryMacroContextId,
        alternateMacroContextId: remainderProof.crossContextProofCandidate.alternateMacroContextId
      } : null,
      pbl3: pbl3 ? {
        pblCandidateId: pbl3.pblCandidateId,
        taskCount: pbl3.taskBlueprints.length,
        finalMilestoneCount: pbl3.finalProductCandidate.requiredMilestoneIds.length
      } : null,
      pbl5: pbl5 ? {
        pblCandidateId: pbl5.pblCandidateId,
        taskCount: pbl5.taskBlueprints.length,
        finalMilestoneCount: pbl5.finalProductCandidate.requiredMilestoneIds.length
      } : null
    },
    validationStatus: readback.ok && consumerGate
      ? 'PASS_POSTG_APP_W01_A02_N_PLUS_ONE_AND_PBL_CANDIDATE_PACK'
      : 'FAIL_POSTG_APP_W01_A02_N_PLUS_ONE_AND_PBL_CANDIDATE_PACK'
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = runPOSTGAPPW01A02Validation();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.validationStatus !== 'PASS_POSTG_APP_W01_A02_N_PLUS_ONE_AND_PBL_CANDIDATE_PACK') {
    process.exitCode = 1;
  }
}
