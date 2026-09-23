import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildW02AtomicContextCandidatePackReadback,
  materializeW02AtomicContextSingleApplicationCandidatePack,
  validateW02AtomicContextSingleApplicationCandidatePack
} from '../../src/curriculum/application/w02-atomic-context-single-application-candidate-pack.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');

function deterministicSignature(candidate) {
  return {
    bindingCandidateId: candidate.bindingCandidateId,
    patternSpecId: candidate.patternSpecId,
    requestedUnknownRole: candidate.requestedUnknownRole,
    contextSelection: candidate.contextSelection,
    roleBindingCandidates: candidate.roleBindingCandidates,
    targetRoleCandidate: candidate.targetRoleCandidate,
    answerModelCandidate: candidate.answerModelCandidate
  };
}

export function runPOSTGAPPW02A02Validation() {
  const readback = buildW02AtomicContextCandidatePackReadback({ root: ROOT });
  const firstPass = materializeW02AtomicContextSingleApplicationCandidatePack({ root: ROOT });
  const secondPass = materializeW02AtomicContextSingleApplicationCandidatePack({ root: ROOT });
  const secondValidation = validateW02AtomicContextSingleApplicationCandidatePack(secondPass);
  const deterministicSecondPassEqual = JSON.stringify(firstPass.candidates.map(deterministicSignature))
    === JSON.stringify(secondPass.candidates.map(deterministicSignature));
  const consumerGate = Boolean(
    readback.counts.applicationPatternSpecCount === 61
    && readback.counts.atomicContextBindingCount === 61
    && readback.counts.singleApplicationCandidateCount === 61
    && readback.counts.uniqueCandidateIdentityCount === 61
    && readback.counts.globalMacroDomainCount === 16
    && readback.counts.duplicateContentProjectionGroupCount === 1
    && readback.duplicateComparisons.every((row) => row.equal)
    && readback.counts.productionAdmittedCandidateCount === 0
    && secondValidation.ok
  );
  return {
    ...readback,
    consumerGate,
    deterministicSecondPassEqual,
    validationStatus: readback.ok && consumerGate && deterministicSecondPassEqual
      ? 'PASS_POSTG_APP_W02_A02_ATOMIC_CONTEXT_SINGLE_APPLICATION_CANDIDATE_PACK'
      : 'FAIL_POSTG_APP_W02_A02_ATOMIC_CONTEXT_SINGLE_APPLICATION_CANDIDATE_PACK'
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = runPOSTGAPPW02A02Validation();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.validationStatus !== 'PASS_POSTG_APP_W02_A02_ATOMIC_CONTEXT_SINGLE_APPLICATION_CANDIDATE_PACK') {
    process.exitCode = 1;
  }
}
