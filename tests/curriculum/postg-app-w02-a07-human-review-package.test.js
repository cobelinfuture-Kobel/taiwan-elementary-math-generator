import assert from 'node:assert/strict';
import test from 'node:test';

import {
  materializeW02A07HumanReviewPackage,
  validateW02A07HumanReviewPackage
} from '../../src/curriculum/application/w02-a07-human-review-package.mjs';

const root = process.cwd();

test('W02 A07 materializes the full production-equivalent human review package', () => {
  const model = materializeW02A07HumanReviewPackage({ root });
  const result = validateW02A07HumanReviewPackage(model);
  assert.equal(result.ok, true, JSON.stringify(result.issues));
  assert.equal(result.status, 'W02_PRODUCTION_EQUIVALENT_HTML_PDF_HUMAN_REVIEW_READY');
  assert.equal(model.summary.sourceNodeCount, 13);
  assert.equal(model.summary.macroContextCount, 16);
  assert.equal(model.summary.totalGeneratedItemCount, 195);
  assert.equal(model.summary.numericGeneratedItemCount, 134);
  assert.equal(model.summary.applicationReviewCount, 61);
  assert.equal(model.summary.pblReviewCount, 31);
  assert.equal(model.summary.pbl3ReviewCount, 19);
  assert.equal(model.summary.pbl5ReviewCount, 12);
  assert.equal(model.summary.operationFamilyCount, 49);
});

test('W02 A07 exposes 61 application rows with complete context lineage and all approved PBL task sets', () => {
  const model = materializeW02A07HumanReviewPackage({ root });
  assert.equal(model.applicationReviewRows.length, 61);
  assert.equal(model.pblReviewRows.length, 31);
  assert.equal(model.applicationReviewRows.every((row) => row.promptText && row.answerText != null), true);
  assert.equal(model.applicationReviewRows.every((row) => (
    row.contextLineage?.macroContextId
    && row.contextLineage?.mesoSituationId
    && row.contextLineage?.microScenarioId
    && row.contextLineage?.atomicEpisodeId
    && row.contextLineage?.surfaceTemplateId
    && row.contextMacroId === row.contextLineage.macroContextId
  )), true);
  assert.equal(new Set(model.applicationReviewRows.map((row) => row.contextMacroId)).size, 16);
  assert.equal(model.applicationReviewRows.every((row) => !row.productionSelectable && !row.publicSelectable), true);
  assert.deepEqual([...new Set(model.pblReviewRows.map((row) => row.graphType))].sort(), [
    'PBL3_LINEAR',
    'PBL5_BOUNDED_DECISION'
  ]);
});

test('W02 A07 review index links the exact A06 production-equivalent HTML and PDF artifacts', () => {
  const model = materializeW02A07HumanReviewPackage({ root });
  assert.match(model.reviewIndexHtml, /data-postg-app-w02-a07="true"/);
  assert.match(model.reviewIndexHtml, /POSTG_APP_W02_A06_NUMERIC_WORKSHEET\.html/);
  assert.match(model.reviewIndexHtml, /POSTG_APP_W02_A06_NUMERIC_WORKSHEET\.pdf/);
  assert.match(model.reviewIndexHtml, /POSTG_APP_W02_A06_APPLICATION_WORKSHEET\.html/);
  assert.match(model.reviewIndexHtml, /POSTG_APP_W02_A06_APPLICATION_WORKSHEET\.pdf/);
  assert.match(model.reviewIndexHtml, /gctx_macro_/);
  assert.doesNotMatch(model.reviewIndexHtml, /\{\{/);
});

test('W02 A07 remains fail-closed before an explicit operator decision', () => {
  const model = materializeW02A07HumanReviewPackage({ root });
  assert.equal(model.boundaries.humanReviewReady, true);
  assert.equal(model.boundaries.operatorDecisionRecorded, false);
  assert.equal(model.boundaries.reviewDecision, 'NOT_STARTED');
  assert.equal(model.boundaries.automaticApprovalAllowed, false);
  assert.equal(model.boundaries.productionAdmissionGranted, false);
  assert.equal(model.boundaries.publicSelectable, false);
  assert.equal(model.boundaries.publicUIChanged, false);
  assert.equal(model.boundaries.futureWaveContentAuthored, false);
});

test('W02 A07 validator rejects premature admission or automatic approval', () => {
  const model = materializeW02A07HumanReviewPackage({ root });
  model.boundaries.productionAdmissionGranted = true;
  model.boundaries.automaticApprovalAllowed = true;
  const result = validateW02A07HumanReviewPackage(model);
  assert.equal(result.ok, false);
  assert.equal(result.issues.some((row) => row.code === 'POSTG_APP_W02_A07_FAIL_CLOSED_BOUNDARY_INVALID'), true);
});
