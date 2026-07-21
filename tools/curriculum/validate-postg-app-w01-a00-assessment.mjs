import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildW01Golden15AssessmentReadback,
  materializeW01Golden15ApplicationAssessment,
  validateW01Golden15ApplicationAssessment
} from '../../src/curriculum/application/w01-golden15-application-assessment.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');

export function runPOSTGAPPW01A00Validation() {
  const readback = buildW01Golden15AssessmentReadback({ root: ROOT });
  const materialized = materializeW01Golden15ApplicationAssessment({ root: ROOT });
  const directG3BU01 = materialized.records.find((row) => (
    row.sourceId === 'g3b_u01_3b01'
    && row.knowledgePointId === 'kp_g3b_u01_wp_quotative_division'
  ));
  const remainderG3BU01 = materialized.records.find((row) => (
    row.sourceId === 'g3b_u01_3b01'
    && row.knowledgePointId === 'kp_g3b_u01_wp_remainder_interpretation'
  ));
  const notApplicableSample = materialized.records.find((row) => row.classification === 'APPLICATION_NOT_APPLICABLE');
  const assessmentConsumerGate = Boolean(
    directG3BU01?.classification === 'APPLICATION_REQUIRED'
    && directG3BU01.applicationModes.includes('SINGLE_DIRECT')
    && directG3BU01.eligibleAtomicEpisodeIds.length > 0
    && remainderG3BU01?.applicationModes.includes('SINGLE_N_PLUS_1')
    && remainderG3BU01?.applicationModes.includes('PBL_TASK_SET')
    && notApplicableSample?.applicationModes.length === 0
  );
  const validation = validateW01Golden15ApplicationAssessment(materialized);
  return {
    ...readback,
    assessmentConsumerGate,
    deterministicSecondPassEqual: JSON.stringify(validation.counts) === JSON.stringify(readback.counts)
      && JSON.stringify(validation.classificationCounts) === JSON.stringify(readback.classificationCounts),
    sampleAssertions: {
      directG3BU01: directG3BU01 ? {
        classification: directG3BU01.classification,
        applicationModes: directG3BU01.applicationModes,
        eligibleAtomicEpisodeCount: directG3BU01.eligibleAtomicEpisodeIds.length
      } : null,
      remainderG3BU01: remainderG3BU01 ? {
        classification: remainderG3BU01.classification,
        applicationModes: remainderG3BU01.applicationModes,
        applicationDepth: remainderG3BU01.applicationDepth,
        eligibleAtomicEpisodeCount: remainderG3BU01.eligibleAtomicEpisodeIds.length
      } : null,
      notApplicable: notApplicableSample ? {
        sourceId: notApplicableSample.sourceId,
        knowledgePointId: notApplicableSample.knowledgePointId,
        classificationReason: notApplicableSample.classificationReason
      } : null
    },
    validationStatus: readback.ok && assessmentConsumerGate
      ? 'PASS_POSTG_APP_W01_A00_GOLDEN15_APPLICATION_CAPABILITY_ASSESSMENT'
      : 'FAIL_POSTG_APP_W01_A00_GOLDEN15_APPLICATION_CAPABILITY_ASSESSMENT'
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = runPOSTGAPPW01A00Validation();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.validationStatus !== 'PASS_POSTG_APP_W01_A00_GOLDEN15_APPLICATION_CAPABILITY_ASSESSMENT') {
    process.exitCode = 1;
  }
}
