import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildW02ValidatorShadowReadback,
  materializeW02ValidatorShadowFixtures,
  validateW02ValidatorShadowRuntime
} from '../../src/curriculum/application/w02-validator-fixture-shadow-runtime.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');

export function runPOSTGAPPW02A04Validation() {
  const readback = buildW02ValidatorShadowReadback({ root: ROOT });
  const secondPass = validateW02ValidatorShadowRuntime(
    materializeW02ValidatorShadowFixtures({ root: ROOT })
  );
  const consumerGate = Boolean(
    readback.counts.candidateCount === 61
    && readback.counts.nPlusOneProofCount === 61
    && readback.counts.misconceptionCandidateCount === 183
    && readback.counts.pblCandidateCount === 31
    && readback.counts.fixtureCount === 672
    && readback.counts.positiveFixtureCount === 275
    && readback.counts.negativeFixtureCount === 397
    && readback.counts.passCount === 275
    && readback.counts.expectedRejectCount === 397
    && readback.counts.unexpectedPassCount === 0
    && readback.counts.unexpectedRejectCount === 0
    && readback.counts.pairedNPlusOneExecutionCount === 61
    && readback.counts.misconceptionExecutionCount === 183
    && readback.counts.calculationPassInterpretationFailCount === 122
    && readback.counts.counterfactualExecutionCount === 61
    && readback.counts.crossContextExecutionCount === 61
    && readback.counts.uniquenessNegativeExecutionCount === 61
    && readback.counts.pblDependencyExecutionCount === 62
    && readback.counts.sourceNodeCoverageCount === 13
    && readback.counts.primaryMacroContextCoverageCount === 16
    && readback.counts.duplicateFixtureProjectionGroupCount === 1
    && readback.counts.productionAdmittedCount === 0
  );
  const deterministicSecondPassEqual = JSON.stringify(secondPass.counts) === JSON.stringify(readback.counts)
    && JSON.stringify(secondPass.fixtureTypeCounts) === JSON.stringify(readback.fixtureTypeCounts)
    && JSON.stringify(secondPass.errorCodeCounts) === JSON.stringify(readback.errorCodeCounts)
    && JSON.stringify(secondPass.operationFamilyCoverage) === JSON.stringify(readback.operationFamilyCoverage)
    && JSON.stringify(secondPass.answerShapeCoverage) === JSON.stringify(readback.answerShapeCoverage);
  return {
    ...readback,
    consumerGate,
    deterministicSecondPassEqual,
    validationStatus: readback.ok && consumerGate && deterministicSecondPassEqual
      ? 'PASS_POSTG_APP_W02_A04_VALIDATOR_FIXTURES_AND_SHARED_RUNTIME_SHADOW'
      : 'FAIL_POSTG_APP_W02_A04_VALIDATOR_FIXTURES_AND_SHARED_RUNTIME_SHADOW'
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = runPOSTGAPPW02A04Validation();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.validationStatus !== 'PASS_POSTG_APP_W02_A04_VALIDATOR_FIXTURES_AND_SHARED_RUNTIME_SHADOW') {
    process.exitCode = 1;
  }
}
