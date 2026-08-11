import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const claimPath = 'data/curriculum/final-milestone-claims/p03f-w3-slice031-e6-d0-v1.json';
const manifestPath = 'data/curriculum/full-product/p03f/slice031-product-admission.manifest.json';
const authorityPath = 'data/curriculum/full-product/p03f/slice031-g5b-u04-rank8-decimal-multiplication-authority.json';
const readbackPath = 'docs/curriculum/output/P03F_W3_DIRECT_PRODUCT_VERTICAL_SLICE031_READBACK.md';
const runtimePath = 'site/modules/curriculum/batch-a/g5b-u04-rank8-decimal-times-integer-runtime-p03f31.js';

const claim = JSON.parse(readFileSync(claimPath, 'utf8'));
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const authority = JSON.parse(readFileSync(authorityPath, 'utf8'));
const readback = readFileSync(readbackPath, 'utf8');

test('Slice031 D0 claim has exact frozen identity and candidate/final status only', () => {
  assert.equal(claim.claimId, 'P03F-W3-SLICE031-E6-D0-V1');
  assert.equal(claim.programId, 'FULL_PRODUCT_LINE_D0_V1');
  assert.equal(claim.taskId, 'P03F_W3DirectProductVerticalSlice031Implementation');
  assert.equal(claim.e6MilestoneId, 'P03F_W3DirectProductVerticalSlice031_E6_D0Closeout');
  assert.ok(['D0_CLOSEOUT_CANDIDATE', 'PASS_D0_CLOSED'].includes(claim.status));
  assert.equal(claim.authority.queuePosition, 31);
  assert.equal(claim.authority.queueEntryId, 'p03e_q031_r8_g5b_u04_5b04_profile_decimal_c1');
  assert.equal(claim.authority.sourceRef, 'g5b_u04_5b04');
  assert.deepEqual(claim.authority.knowledgePointIds, ['kp_g5b_u04_decimal_times_integer']);
  assert.deepEqual(claim.authority.patternGroupIds, ['pg_g5b_u04_decimal_times_integer_numeric']);
  assert.deepEqual(claim.authority.patternSpecIds, ['ps_g5b_u04_decimal_times_integer_product_numeric']);
});

test('Slice031 authority preserves numeric-only boundary and blocks Slice032 before D0', () => {
  assert.equal(authority.queueAuthority.queuePosition, 31);
  assert.equal(authority.sourceAuthority.sourceNodeId, 'g5b_u04_5b04');
  assert.equal(authority.knowledgePoints.length, 1);
  assert.equal(authority.patternSurfaces.length, 1);
  assert.equal(authority.formalMappingBoundary.decimalTimesIntegerRequired, true);
  assert.equal(authority.formalMappingBoundary.integerTimesDecimalRequired, false);
  assert.equal(authority.formalMappingBoundary.decimalTimesDecimalRequired, false);
  assert.equal(authority.formalMappingBoundary.applicationRequired, false);
  assert.equal(authority.formalMappingBoundary.estimationRequired, false);
  assert.equal(authority.formalMappingBoundary.globalContextRequired, false);
  assert.equal(authority.productBoundary.nextSliceMayStartBeforeD0Closeout, false);
  assert.equal(authority.productBoundary.nextTask, 'P03F_W3DirectProductVerticalSlice032Implementation');
});

test('Slice031 implementation evidence is exact-head, merged, and runtime-identical on main', () => {
  assert.equal(claim.implementationEvidence.prNumber, 575);
  assert.equal(claim.implementationEvidence.headSha, '15c43769fb6fe44f26efa0d50cd2427bfd49bb30');
  assert.equal(claim.implementationEvidence.mergeSha, '7f0a49902cfbd5d9946118f2644c5e64de31513d');
  assert.equal(claim.implementationEvidence.runtimeBlobShaOnMain, '8254571659c9983823f79f90e1e0524ec9882d09');
  const localBlob = execFileSync('git', ['hash-object', runtimePath], { encoding: 'utf8' }).trim();
  assert.equal(localBlob, claim.implementationEvidence.runtimeBlobShaOnMain);
});

test('Slice031 exact-head Node and product acceptance evidence is fully green', () => {
  const node = claim.implementationEvidence.node;
  assert.equal(node.status, 'SUCCESS');
  assert.equal(node.tests, 3014);
  assert.equal(node.pass, 3014);
  assert.equal(node.fail, 0);
  assert.equal(node.skipped, 0);
  const product = claim.implementationEvidence.productAcceptance;
  assert.equal(product.status, 'SUCCESS');
  assert.equal(product.questionCount, 24);
  assert.equal(product.answerKeyItemCount, 24);
  assert.equal(product.uniqueQuestionCount, 24);
  assert.equal(product.questionPageCount, 3);
  assert.equal(product.answerPageCount, 3);
  assert.equal(product.physicalPdfPageCount, 6);
  assert.equal(product.screenshotCount, 6);
  assert.equal(product.arithmeticFindingCount, 0);
  assert.equal(product.crossLayerMismatchCount, 0);
  assert.equal(product.duplicatePromptFindingCount, 0);
  assert.equal(product.overflowFindingCount, 0);
  assert.equal(product.consoleErrorCount, 0);
  assert.equal(product.pageErrorCount, 0);
  assert.equal(product.semanticScopeFindingCount, 0);
  assert.equal(product.applicationLeakFindingCount, 0);
  assert.equal(product.manualVisualReview.status, 'PASS');
  assert.equal(product.manualVisualReview.pagesReviewed, 6);
});

test('Slice031 frozen R00 exact replay remains 793/793 with zero browser errors', () => {
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
});

test('Slice031 R01/R02 main readback is 31 sources / 225 KPs with no gaps', () => {
  assert.deepEqual(claim.mainReadback.r01, { publicSources: 31, visibleKnowledgePoints: 225, capabilityRows: 1413, gaps: 0 });
  assert.deepEqual(claim.mainReadback.r02, { publicSources: 31, visibleKnowledgePoints: 225, bindingRows: 1218, verifiedLimitedBindings: 1062, structuralFallbackBindings: 156, gaps: 0, bindingRevision: 'pgc-r02-r04-p03f31' });
});

test('Slice031 claim, manifest, and readback remain mutually consistent', () => {
  assert.equal(manifest.claimPath, claimPath);
  assert.equal(manifest.readbackPath, readbackPath);
  assert.equal(manifest.authorityPath, authorityPath);
  assert.equal(manifest.queuePosition, claim.authority.queuePosition);
  assert.equal(manifest.sourceId, claim.authority.sourceRef);
  assert.deepEqual(manifest.knowledgePointIds, claim.authority.knowledgePointIds);
  assert.deepEqual(manifest.patternGroupIds, claim.authority.patternGroupIds);
  assert.deepEqual(manifest.patternSpecIds, claim.authority.patternSpecIds);
  assert.match(readback, /QUEUE_POSITION = 31/);
  assert.match(readback, /SOURCE = g5b_u04_5b04/);
  assert.match(readback, /R02_BINDING_ROWS = 1218/);
  assert.match(readback, /EXECUTED = 793/);
});

test('Slice031 candidate cannot admit Slice032; final state requires merged closeout evidence', () => {
  if (claim.status === 'D0_CLOSEOUT_CANDIDATE') {
    assert.equal(claim.goalDistance, 'D1');
    assert.equal(manifest.status, 'D0_CLOSEOUT_CANDIDATE');
    assert.equal(manifest.admissionState, 'PENDING_D0_RECONCILIATION');
    assert.equal(claim.closeoutEvidence.candidatePrNumber, null);
    assert.equal(claim.closeoutEvidence.candidateMergeSha, null);
    assert.equal(manifest.productionAdmission.slice031Admitted, false);
    assert.equal(manifest.productionAdmission.slice032MayStart, false);
    assert.equal(claim.progression.nextResumeTask, 'P03F_W3DirectProductVerticalSlice031_D0PostMergeReconciliation');
    return;
  }
  assert.equal(claim.goalDistance, 'D0');
  assert.equal(manifest.status, 'PASS_D0_CLOSED');
  assert.equal(manifest.admissionState, 'ADMITTED_D0');
  assert.ok(Number.isInteger(claim.closeoutEvidence.candidatePrNumber));
  assert.match(claim.closeoutEvidence.candidateHeadSha, /^[0-9a-f]{40}$/);
  assert.match(claim.closeoutEvidence.candidateMergeSha, /^[0-9a-f]{40}$/);
  assert.equal(claim.closeoutEvidence.status, 'PASS_CANDIDATE_CI_MERGED');
  assert.equal(manifest.productionAdmission.slice031Admitted, true);
  assert.equal(manifest.productionAdmission.slice032MayStart, true);
  assert.equal(claim.progression.nextResumeTask, 'P03F_W3DirectProductVerticalSlice032Implementation');
});
