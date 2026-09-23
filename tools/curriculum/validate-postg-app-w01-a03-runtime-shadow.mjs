import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildW01ValidatorShadowReadback,
  materializeW01ValidatorShadowFixtures,
  validateW01ShadowFixture,
  validateW01ValidatorShadowRuntime
} from '../../src/curriculum/application/w01-validator-fixture-shadow-runtime.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');

export function runPOSTGAPPW01A03Validation() {
  const readback = buildW01ValidatorShadowReadback({ root: ROOT });
  const materialized = materializeW01ValidatorShadowFixtures({ root: ROOT });
  const secondPass = validateW01ValidatorShadowRuntime(materialized);

  const interpretationFixture = materialized.fixtures.find((row) => (
    row.fixtureType === 'NEGATIVE_CALCULATION_PASS_INTERPRETATION_FAIL'
  ));
  const pblBrokenFixture = materialized.fixtures.find((row) => (
    row.fixtureType === 'NEGATIVE_PBL_DEPENDENCY_BROKEN'
  ));
  const interpretationResult = interpretationFixture
    ? validateW01ShadowFixture(materialized, interpretationFixture)
    : null;
  const pblBrokenResult = pblBrokenFixture
    ? validateW01ShadowFixture(materialized, pblBrokenFixture)
    : null;

  const consumerGate = Boolean(
    readback.counts.fixtureCount > 0
    && readback.counts.positiveFixtureCount > 0
    && readback.counts.negativeFixtureCount > 0
    && readback.counts.unexpectedPassCount === 0
    && readback.counts.unexpectedRejectCount === 0
    && readback.counts.goldenAssessmentUnitCoverageCount === 15
    && readback.counts.applicationRuntimeUnitCoverageCount === readback.eligibleSourceCoverage.length
    && readback.counts.applicationExcludedUnitCount === readback.excludedSourceCoverage.length
    && readback.counts.macroContextCoverageCount === 16
    && readback.counts.productionAdmittedCount === 0
    && interpretationResult?.errorCode === 'INTERPRETATION_WITNESS_MISSING'
    && interpretationResult?.calculationPass === true
    && interpretationResult?.interpretationPass === false
    && pblBrokenResult?.errorCode === 'PBL_DEPENDENCY_INVALID'
    && pblBrokenResult?.pblPass === false
  );

  return {
    ...readback,
    runtimeResults: undefined,
    consumerGate,
    deterministicSecondPassEqual: JSON.stringify(secondPass.counts) === JSON.stringify(readback.counts)
      && JSON.stringify(secondPass.errorCodeCounts) === JSON.stringify(readback.errorCodeCounts)
      && JSON.stringify(secondPass.operationFamilyCoverage) === JSON.stringify(readback.operationFamilyCoverage),
    focusedDiagnostics: {
      calculationPassInterpretationFail: interpretationResult,
      pblDependencyBroken: pblBrokenResult
    },
    validationStatus: readback.ok && consumerGate
      ? 'PASS_POSTG_APP_W01_A03_VALIDATOR_FIXTURES_AND_SHARED_RUNTIME_SHADOW'
      : 'FAIL_POSTG_APP_W01_A03_VALIDATOR_FIXTURES_AND_SHARED_RUNTIME_SHADOW'
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = runPOSTGAPPW01A03Validation();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.validationStatus !== 'PASS_POSTG_APP_W01_A03_VALIDATOR_FIXTURES_AND_SHARED_RUNTIME_SHADOW') {
    process.exitCode = 1;
  }
}
