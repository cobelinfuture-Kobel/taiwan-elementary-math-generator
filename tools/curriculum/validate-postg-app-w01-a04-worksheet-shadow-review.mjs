import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildW01WorksheetShadowReviewReadback,
  materializeW01WorksheetShadowReview,
  validateW01WorksheetShadowReview
} from '../../src/curriculum/application/w01-worksheet-shadow-review.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');

export function runPOSTGAPPW01A04Validation() {
  const readback = buildW01WorksheetShadowReviewReadback({ root: ROOT });
  const materialized = materializeW01WorksheetShadowReview({ root: ROOT });
  const secondPass = validateW01WorksheetShadowReview(materialized);
  const pbl3 = materialized.projections.flatMap((row) => row.pblSections).find((row) => row.graphType === 'PBL3_LINEAR');
  const pbl5 = materialized.projections.flatMap((row) => row.pblSections).find((row) => row.graphType === 'PBL5_BOUNDED_DECISION');
  const consumerGate = Boolean(
    readback.counts.goldenAssessmentUnitCount === 15
    && readback.counts.eligibleProjectionUnitCount === readback.projectedSources.length
    && readback.counts.excludedUnitCount === readback.excludedSources.length
    && readback.counts.candidateQuestionCount === readback.counts.answerKeyCount
    && readback.counts.productionAdmittedUnitCount === 0
    && readback.review.reviewDecision === 'DEFERRED_PENDING_PRODUCTION_EVIDENCE'
    && readback.review.productionAdmissionGranted === false
    && (!pbl3 || pbl3.projectionCandidate === 'APPROVED_COMPLETE_SINGLE_PAGE_CANDIDATE')
    && (!pbl5 || pbl5.projectionCandidate === 'APPROVED_COMPLETE_TWO_PAGE_CANDIDATE')
  );
  return {
    ...readback,
    consumerGate,
    deterministicSecondPassEqual: JSON.stringify(secondPass.counts) === JSON.stringify(readback.counts)
      && JSON.stringify(secondPass.projectedSources) === JSON.stringify(readback.projectedSources)
      && JSON.stringify(secondPass.excludedSources) === JSON.stringify(readback.excludedSources),
    focusedProjectionReadback: {
      pbl3: pbl3 ?? null,
      pbl5: pbl5 ?? null,
      reviewDecision: readback.review.reviewDecision,
      blockers: readback.review.blockers
    },
    validationStatus: readback.ok && consumerGate
      ? 'PASS_POSTG_APP_W01_A04_WORKSHEET_SHADOW_PROJECTION_REVIEW_DEFERRED'
      : 'FAIL_POSTG_APP_W01_A04_WORKSHEET_SHADOW_PROJECTION_REVIEW'
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = runPOSTGAPPW01A04Validation();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.validationStatus !== 'PASS_POSTG_APP_W01_A04_WORKSHEET_SHADOW_PROJECTION_REVIEW_DEFERRED') {
    process.exitCode = 1;
  }
}
