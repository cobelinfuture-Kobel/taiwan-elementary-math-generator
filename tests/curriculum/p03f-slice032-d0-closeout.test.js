import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const claimPath = 'data/curriculum/final-milestone-claims/p03f-w3-slice032-e6-d0-v1.json';
const manifestPath = 'data/curriculum/full-product/p03f/slice032-product-admission.manifest.json';
const authorityPath = 'data/curriculum/full-product/p03f/slice032-g6b-u01-rank8-mixed-domain-authority.json';
const readbackPath = 'docs/curriculum/output/P03F_W3_DIRECT_PRODUCT_VERTICAL_SLICE032_READBACK.md';
const runtimePath = 'site/modules/curriculum/batch-a/g6b-u01-rank8-decimal-fraction-conversion-runtime-p03f32.js';

const claim = JSON.parse(readFileSync(claimPath, 'utf8'));
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const authority = JSON.parse(readFileSync(authorityPath, 'utf8'));
const readback = readFileSync(readbackPath, 'utf8');

test('Slice032 D0 claim has exact frozen identity and candidate/final status only', () => {
  assert.equal(claim.claimId, 'P03F-W3-SLICE032-E6-D0-V1');
  assert.equal(claim.programId, 'FULL_PRODUCT_LINE_D0_V1');
  assert.equal(claim.taskId, 'P03F_W3DirectProductVerticalSlice032Implementation');
  assert.equal(claim.e6MilestoneId, 'P03F_W3DirectProductVerticalSlice032_E6_D0Closeout');
  assert.ok(['D0_CLOSEOUT_CANDIDATE', 'PASS_D0_CLOSED'].includes(claim.status));
  assert.equal(claim.authority.queuePosition, 32);
  assert.equal(claim.authority.queueEntryId, 'p03e_q032_r8_g6b_u01_6b01_profile_mixed_number_domain_c1');
  assert.equal(claim.authority.sourceRef, 'g6b_u01_6b01');
  assert.deepEqual(claim.authority.knowledgePointIds, ['kp_g6b_u01_decimal_fraction_conversion']);
  assert.deepEqual(claim.authority.patternGroupIds, ['pg_g6b_u01_decimal_fraction_conversion_numeric']);
  assert.deepEqual(claim.authority.patternSpecIds, [
    'ps_g6b_u01_decimal_fraction_conversion_fraction_numeric',
    'ps_g6b_u01_decimal_fraction_conversion_decimal_numeric',
  ]);
});

test('Slice032 authority preserves exact conversion-only boundary and blocks Slice033 before D0', () => {
  assert.equal(authority.queueAuthority.queuePosition, 32);
  assert.equal(authority.sourceAuthority.sourceNodeId, 'g6b_u01_6b01');
  assert.equal(authority.knowledgePoints.length, 1);
  assert.equal(authority.patternSurfaces.length, 2);
  assert.deepEqual(authority.formalMappingBoundary.learnerFacingActions, ['TO_FRACTION', 'TO_DECIMAL']);
  assert.equal(authority.formalMappingBoundary.exactRationalIdentityRequired, true);
  assert.equal(authority.formalMappingBoundary.reducedFractionAnswerRequired, true);
  assert.equal(authority.formalMappingBoundary.floatingPointApproximationAllowed, false);
  assert.equal(authority.formalMappingBoundary.recurringDecimalApproximationAllowed, false);
  assert.equal(authority.formalMappingBoundary.compareLearnerSurfaceAllowed, false);
  assert.equal(authority.formalMappingBoundary.arithmeticMutationAllowed, false);
  assert.equal(authority.formalMappingBoundary.applicationRequired, false);
  assert.equal(authority.formalMappingBoundary.globalContextRequired, false);
  assert.equal(authority.productBoundary.parallelPipelineAllowed, false);
  assert.equal(authority.productBoundary.slice041LeakAllowed, false);
  assert.equal(authority.productBoundary.slice047LeakAllowed, false);
  assert.equal(authority.productBoundary.laterWaveLeakAllowed, false);
  assert.equal(authority.productBoundary.nextSliceMayStartBeforeD0Closeout, false);
  assert.equal(authority.productBoundary.nextTask, 'P03F_W3DirectProductVerticalSlice033Implementation');
});

test('Slice032 implementation evidence is exact-head, merged, and runtime-identical on main', () => {
  assert.equal(claim.implementationEvidence.prNumber, 578);
  assert.equal(claim.implementationEvidence.headSha, 'dc85107da64c718ee3654a8115959b1f8c49170b');
  assert.equal(claim.implementationEvidence.mergeSha, '0849b65c7755deb031c33b007ab375858f784221');
  assert.equal(claim.implementationEvidence.runtimeBlobShaOnMain, 'e9bd4381888af66e9a7931a7813debc41429be3b');
  const localBlob = execFileSync('git', ['hash-object', runtimePath], { encoding: 'utf8' }).trim();
  assert.equal(localBlob, claim.implementationEvidence.runtimeBlobShaOnMain);
});

test('Slice032 exact-head Node and product acceptance evidence is fully green', () => {
  const node = claim.implementationEvidence.node;
  assert.equal(node.status, 'SUCCESS');
  assert.equal(node.tests, 3043);
  assert.equal(node.pass, 3043);
  assert.equal(node.fail, 0);
  assert.equal(node.skipped, 0);

  const product = claim.implementationEvidence.productAcceptance;
  assert.equal(product.status, 'SUCCESS');
  assert.equal(product.questionCount, 24);
  assert.equal(product.answerKeyItemCount, 24);
  assert.equal(product.uniqueQuestionCount, 24);
  assert.equal(product.toFractionQuestionCount, 12);
  assert.equal(product.toDecimalQuestionCount, 12);
  assert.equal(product.questionPageCount, 3);
  assert.equal(product.answerPageCount, 3);
  assert.equal(product.physicalPdfPageCount, 6);
  assert.equal(product.screenshotCount, 6);
  assert.equal(product.conversionFindingCount, 0);
  assert.equal(product.crossLayerMismatchCount, 0);
  assert.equal(product.duplicatePromptFindingCount, 0);
  assert.equal(product.overflowFindingCount, 0);
  assert.equal(product.consoleErrorCount, 0);
  assert.equal(product.pageErrorCount, 0);
  assert.equal(product.semanticScopeFindingCount, 0);
  assert.equal(product.applicationLeakFindingCount, 0);
  assert.equal(product.compareLeakFindingCount, 0);
  assert.equal(product.arithmeticLeakFindingCount, 0);
  assert.equal(product.manualVisualReview.status, 'PASS');
  assert.equal(product.manualVisualReview.pagesReviewed, 6);
  assert.equal(product.manualVisualReview.clippedTextFindingCount, 0);
  assert.equal(product.manualVisualReview.overlapFindingCount, 0);
  assert.equal(product.manualVisualReview.brokenGlyphFindingCount, 0);
  assert.equal(product.manualVisualReview.sourceWitnessVisibleAndAnswerAligned, true);
});

test('Slice032 accepted frozen R00 replay is exact-head 793/793 with zero browser errors', () => {
  const replay = claim.implementationEvidence.r00FrozenReplay;
  assert.equal(replay.status, 'SUCCESS');
  assert.equal(replay.replayStatus, 'PASS_ALL_793_LEGAL_ROUTES');
  assert.equal(replay.legalRouteCount, 793);
  assert.equal(replay.executedRouteCount, 793);
  assert.equal(replay.passRouteCount, 793);
  assert.equal(replay.failRouteCount, 0);
  assert.equal(replay.fullNineGatePassCount, 793);
  assert.equal(replay.browserConsoleErrorCount, 0);
  assert.equal(replay.browserPageErrorCount, 0);
  assert.equal(replay.exitCode, 0);
  assert.equal(replay.retryProvenance.acceptedAttempt, 2);
  assert.equal(replay.retryProvenance.productionCodeChangedForRetry, false);
});

test('Slice032 authority reconciliation is merged, fully green, and main readback is 32 sources / 226 KPs', () => {
  const reconciliation = claim.authorityReconciliation;
  assert.equal(reconciliation.prNumber, 579);
  assert.equal(reconciliation.headSha, '8abed0e9879198409580bb284979b5712bbd872b');
  assert.equal(reconciliation.mergeSha, 'e16c1273e842117fab2482a4b102b6454fa2807b');
  assert.equal(reconciliation.changedArtifactCount, 6);
  assert.equal(reconciliation.node.status, 'SUCCESS');
  assert.equal(reconciliation.node.tests, 3043);
  assert.equal(reconciliation.node.pass, 3043);
  assert.equal(reconciliation.node.fail, 0);
  assert.equal(reconciliation.r00.status, 'SUCCESS');

  assert.deepEqual(claim.mainReadback.r01, {
    publicSources: 32,
    visibleKnowledgePoints: 226,
    capabilityRows: 1419,
    gaps: 0,
  });
  assert.deepEqual(claim.mainReadback.r02, {
    publicSources: 32,
    visibleKnowledgePoints: 226,
    bindingRows: 1224,
    verifiedLimitedBindings: 1062,
    structuralFallbackBindings: 162,
    gaps: 0,
    bindingRevision: 'pgc-r02-r05-p03f32',
  });
  assert.equal(claim.mainReadback.runtimeBlobMatchesImplementation, true);
});

test('Slice032 claim, manifest, and readback remain mutually consistent', () => {
  assert.equal(manifest.claimPath, claimPath);
  assert.equal(manifest.readbackPath, readbackPath);
  assert.equal(manifest.authorityPath, authorityPath);
  assert.equal(manifest.queuePosition, claim.authority.queuePosition);
  assert.equal(manifest.sourceId, claim.authority.sourceRef);
  assert.deepEqual(manifest.knowledgePointIds, claim.authority.knowledgePointIds);
  assert.deepEqual(manifest.patternGroupIds, claim.authority.patternGroupIds);
  assert.deepEqual(manifest.patternSpecIds, claim.authority.patternSpecIds);
  assert.equal(manifest.authorityReconciliation.prNumber, claim.authorityReconciliation.prNumber);
  assert.match(readback, /QUEUE_POSITION = 32/);
  assert.match(readback, /SOURCE = g6b_u01_6b01/);
  assert.match(readback, /R02_BINDING_ROWS = 1224/);
  assert.match(readback, /EXECUTED = 793/);
  assert.match(readback, /SLICE032_E2E_CANDIDATE = PASS/);
});

test('Slice032 candidate cannot admit Slice033; final state requires merged closeout evidence', () => {
  if (claim.status === 'D0_CLOSEOUT_CANDIDATE') {
    assert.equal(claim.goalDistance, 'D1');
    assert.equal(manifest.status, 'D0_CLOSEOUT_CANDIDATE');
    assert.equal(manifest.admissionState, 'PENDING_D0_RECONCILIATION');
    assert.equal(claim.closeoutEvidence.candidatePrNumber, null);
    assert.equal(claim.closeoutEvidence.candidateMergeSha, null);
    assert.equal(manifest.productionAdmission.slice032Admitted, false);
    assert.equal(manifest.productionAdmission.slice033MayStart, false);
    assert.equal(claim.progression.nextResumeTask, 'P03F_W3DirectProductVerticalSlice032_D0PostMergeReconciliation');
    return;
  }

  assert.equal(claim.goalDistance, 'D0');
  assert.equal(manifest.status, 'PASS_D0_CLOSED');
  assert.equal(manifest.admissionState, 'ADMITTED_D0');
  assert.ok(Number.isInteger(claim.closeoutEvidence.candidatePrNumber));
  assert.match(claim.closeoutEvidence.candidateHeadSha, /^[0-9a-f]{40}$/);
  assert.match(claim.closeoutEvidence.candidateMergeSha, /^[0-9a-f]{40}$/);
  assert.equal(claim.closeoutEvidence.status, 'PASS_CANDIDATE_CI_MERGED');
  assert.equal(manifest.productionAdmission.slice032Admitted, true);
  assert.equal(manifest.productionAdmission.slice033MayStart, true);
  assert.equal(claim.progression.nextResumeTask, 'P03F_W3DirectProductVerticalSlice033Implementation');
});
