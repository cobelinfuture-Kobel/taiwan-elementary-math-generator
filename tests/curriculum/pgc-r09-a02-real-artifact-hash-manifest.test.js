import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const manifest = JSON.parse(fs.readFileSync(
  "data/curriculum/public-generation/PGC-R09-A02.real-artifact-hash-manifest.json",
  "utf8",
));

test("R09 A02 archives the accepted A01R exact-head execution identity", () => {
  assert.equal(manifest.taskId, "PGC-R09-A02_RealArtifactArchiveAndHashManifest");
  assert.equal(manifest.status, "PASS_ARTIFACT_MANIFEST_MATERIALIZED");
  assert.equal(manifest.sourceExecution.pullRequest, 504);
  assert.equal(manifest.sourceExecution.commitSha, "e3d52833780bd99c882ee882cef04d8359580470");
  assert.equal(manifest.sourceExecution.mergeSha, "94f3661052cdcfc1760f1a2fffcde29160535e93");
  assert.deepEqual(manifest.sourceExecution.workflowRunIds, [30703298263, 30703298264]);
  assert.deepEqual(manifest.sourceExecution.artifactIds, [8819673561, 8819545648, 8819547308]);
  assert.equal(manifest.sourceExecution.primaryArtifactId, 8819673561);
  assert.match(manifest.sourceExecution.primaryArtifactDigest, /^sha256:[0-9a-f]{64}$/);
});

test("R09 A02 preserves the 793-route terminal acceptance without repair queue", () => {
  assert.equal(manifest.terminalExecution.legalRouteCount, 793);
  assert.equal(manifest.terminalExecution.executedRouteCount, 793);
  assert.equal(manifest.terminalExecution.terminalRouteCount, 793);
  assert.equal(manifest.terminalExecution.passRouteCount, 793);
  assert.equal(manifest.terminalExecution.failRouteCount, 0);
  assert.equal(manifest.terminalExecution.fullNineGatePassCount, 793);
  assert.equal(manifest.terminalExecution.repairQueueCount, 0);
  assert.equal(manifest.terminalExecution.browserConsoleErrorCount, 0);
  assert.equal(manifest.terminalExecution.browserPageErrorCount, 0);
  assert.equal(manifest.terminalExecution.finalCheckpointAuthoritative, true);
});

test("R09 A02 materializes all A00 required archive fields with explicit provenance", () => {
  const required = manifest.requiredArchiveFields;
  for (const field of [
    "pullRequest", "commitSha", "mergeSha", "workflowRunIds", "artifactIds",
    "htmlSha256", "pdfSha256", "questionCount", "answerCount", "uniqueQuestionCount",
    "seedCount", "pageCount", "overflowMetrics", "semanticReviewResult",
  ]) assert.ok(Object.hasOwn(required, field), `missing required archive field: ${field}`);

  assert.equal(required.htmlSha256.sampleCount, 16);
  assert.equal(required.htmlSha256.values.length, 16);
  assert.equal(required.pdfSha256.sampleCount, 16);
  assert.equal(required.pdfSha256.values.length, 16);
  for (const digest of [...required.htmlSha256.values, ...required.pdfSha256.values]) {
    assert.match(digest, /^[0-9a-f]{64}$/);
  }

  assert.equal(required.questionCount.firstGenerationTotal, 15860);
  assert.equal(required.answerCount.firstGenerationTotal, 15860);
  assert.equal(required.seedCount.generationSeedApplications, 1586);
  assert.equal(required.pageCount.questionPages, 2075);
  assert.equal(required.pageCount.answerPages, 2835);
  assert.equal(required.pageCount.totalPages, 4910);

  assert.equal(
    required.uniqueQuestionCount.status,
    "IDENTITY_GATE_PASS_COUNT_MATERIALIZATION_NOT_AVAILABLE_IN_A01R_REPORT",
  );
  assert.equal(manifest.provenancePolicy.unsupportedMetricInvented, false);
  assert.equal(manifest.provenancePolicy.a01rPrimaryArtifactReadDirectly, true);
  assert.equal(manifest.provenancePolicy.r07OverflowAuthorityReferenced, true);
  assert.equal(manifest.provenancePolicy.r08SemanticConformanceAuthorityReferenced, true);
});

test("R09 A02 remains archive-only and keeps Slice014 frozen", () => {
  assert.equal(manifest.frozenBoundary.productMutation, false);
  assert.equal(manifest.frozenBoundary.capacityAuthorityMutation, false);
  assert.equal(manifest.frozenBoundary.generatorMutation, false);
  assert.equal(manifest.frozenBoundary.validatorMutation, false);
  assert.equal(manifest.frozenBoundary.rendererMutation, false);
  assert.equal(manifest.frozenBoundary.newCapability, false);
  assert.equal(manifest.frozenBoundary.slice014Started, false);
  assert.equal(
    manifest.goalDistance.nextShortestStep,
    "PGC-R09-A03_PublicSiteSmokeAndReleaseCandidateReadback",
  );
});
