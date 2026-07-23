import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildW02NPlusOneAndPBLCandidateReadback,
  materializeW02NPlusOneAndPBLCandidatePack,
  validateW02NPlusOneAndPBLCandidatePack
} from '../../src/curriculum/application/w02-nplusone-pbl-candidate-pack.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');

export function runPOSTGAPPW02A03Validation() {
  const readback = buildW02NPlusOneAndPBLCandidateReadback({ root: ROOT });
  const secondPass = validateW02NPlusOneAndPBLCandidatePack(
    materializeW02NPlusOneAndPBLCandidatePack({ root: ROOT })
  );
  const consumerGate = Boolean(
    readback.counts.a02SingleApplicationCandidateCount === 61
    && readback.counts.nPlusOneProofCandidateCount === 61
    && readback.counts.misconceptionCandidateCount === 183
    && readback.counts.pblTaskSetCandidateCount === readback.counts.pblEligibleCandidateCount
    && readback.counts.pblTaskSetCandidateCount > 0
    && readback.counts.crossContextPairCount === 61
    && readback.counts.compatiblePblCandidateCount === 0
    && readback.counts.productionAdmittedCount === 0
  );
  const deterministicSecondPassEqual = JSON.stringify(secondPass.counts) === JSON.stringify(readback.counts)
    && JSON.stringify(secondPass.actCounts) === JSON.stringify(readback.actCounts)
    && JSON.stringify(secondPass.graphCounts) === JSON.stringify(readback.graphCounts)
    && JSON.stringify(secondPass.productCounts) === JSON.stringify(readback.productCounts);
  return {
    ...readback,
    consumerGate,
    deterministicSecondPassEqual,
    validationStatus: readback.ok && consumerGate && deterministicSecondPassEqual
      ? 'PASS_POSTG_APP_W02_A03_N_PLUS_ONE_AND_PBL_CANDIDATE_PACK'
      : 'FAIL_POSTG_APP_W02_A03_N_PLUS_ONE_AND_PBL_CANDIDATE_PACK'
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = runPOSTGAPPW02A03Validation();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.validationStatus !== 'PASS_POSTG_APP_W02_A03_N_PLUS_ONE_AND_PBL_CANDIDATE_PACK') {
    process.exitCode = 1;
  }
}
