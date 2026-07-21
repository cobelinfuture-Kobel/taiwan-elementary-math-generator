import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildW01AtomicContextCandidatePackReadback,
  materializeW01AtomicContextSingleApplicationCandidatePack,
  validateW01AtomicContextSingleApplicationCandidatePack
} from '../../src/curriculum/application/w01-atomic-context-single-application-candidate-pack.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');

export function runPOSTGAPPW01A01Validation() {
  const readback = buildW01AtomicContextCandidatePackReadback({ root: ROOT });
  const materialized = materializeW01AtomicContextSingleApplicationCandidatePack({ root: ROOT });
  const secondPass = validateW01AtomicContextSingleApplicationCandidatePack(materialized);
  const g3bDirect = materialized.candidates.find((row) => (
    row.sourceId === 'g3b_u01_3b01'
    && row.knowledgePointId === 'kp_g3b_u01_wp_quotative_division'
  ));
  const g3bRemainder = materialized.candidates.find((row) => (
    row.sourceId === 'g3b_u01_3b01'
    && row.knowledgePointId === 'kp_g3b_u01_wp_remainder_interpretation'
  ));
  const consumerGate = Boolean(
    readback.counts.globalMacroDomainCount === 16
    && readback.counts.candidateCount === readback.counts.suitableKnowledgePointCount
    && g3bDirect?.lineage.existingPilotBindingId === 'appctx_g3b_u01_direct_school_grouping_001'
    && g3bDirect?.contextSelection.legacyLineagePreserved === true
    && g3bRemainder?.lineage.existingPilotBindingId === 'appctx_g3b_u01_n1_transit_capacity_001'
    && g3bRemainder?.applicationMode === 'SINGLE_N_PLUS_1'
    && g3bRemainder?.contextSelection.atomicEpisodeId.includes('student_vehicle_allocation')
  );
  return {
    ...readback,
    consumerGate,
    deterministicSecondPassEqual: JSON.stringify(secondPass.counts) === JSON.stringify(readback.counts)
      && JSON.stringify(secondPass.macroCounts) === JSON.stringify(readback.macroCounts),
    pilotReadback: {
      direct: g3bDirect ? {
        bindingCandidateId: g3bDirect.bindingCandidateId,
        atomicEpisodeId: g3bDirect.contextSelection.atomicEpisodeId,
        surfaceTemplateId: g3bDirect.contextSelection.surfaceTemplateId,
        existingPilotBindingId: g3bDirect.lineage.existingPilotBindingId
      } : null,
      nPlusOne: g3bRemainder ? {
        bindingCandidateId: g3bRemainder.bindingCandidateId,
        atomicEpisodeId: g3bRemainder.contextSelection.atomicEpisodeId,
        surfaceTemplateId: g3bRemainder.contextSelection.surfaceTemplateId,
        existingPilotBindingId: g3bRemainder.lineage.existingPilotBindingId
      } : null
    },
    validationStatus: readback.ok && consumerGate
      ? 'PASS_POSTG_APP_W01_A01_ATOMIC_CONTEXT_SINGLE_APPLICATION_CANDIDATE_PACK'
      : 'FAIL_POSTG_APP_W01_A01_ATOMIC_CONTEXT_SINGLE_APPLICATION_CANDIDATE_PACK'
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = runPOSTGAPPW01A01Validation();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.validationStatus !== 'PASS_POSTG_APP_W01_A01_ATOMIC_CONTEXT_SINGLE_APPLICATION_CANDIDATE_PACK') {
    process.exitCode = 1;
  }
}
