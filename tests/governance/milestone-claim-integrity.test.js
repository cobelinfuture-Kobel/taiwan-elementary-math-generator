import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  ROOT,
  parsePrBodyFields,
  validateAllManifests,
  validateManifest,
  validatePullRequestManifest
} from "../../tools/governance/milestone-claim-integrity-core.mjs";

const fixturePath = path.join(ROOT, "tests/fixtures/governance/p12-false-human-review-ready.claim.json");
const p12FalseReviewFixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));

function baseManifest() {
  return {
    schemaVersion: 1,
    taskId: "TEST_E2_CONTENT",
    taskClass: "content",
    targetEvidenceLevel: "E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED",
    actualEvidenceLevel: "E2_CONTENT_AUTHORED",
    claimedStatus: "CANDIDATE_CONTENT_AUTHORED",
    claims: {
      dataStructureReady: true,
      contentAuthored: true,
      runtimeIntegrated: false,
      productionEquivalentGeneratorUsed: false,
      productionRendererUsed: false,
      htmlOutputVerified: false,
      pdfOutputVerified: false,
      visibleOutputChanged: false,
      humanReviewReady: false,
      productionAdmitted: false,
      d0Complete: false
    },
    evidence: {
      runtimeTestPaths: [],
      rendererTestPaths: [],
      htmlArtifactPaths: [],
      pdfArtifactPaths: [],
      beforeAfterEvidencePaths: [],
      reviewArtifactPaths: [],
      artifactHashes: []
    },
    humanReview: {
      type: "none",
      canUnlockProduction: false,
      reviewArtifactRequired: false
    },
    distance: {
      before: "D2",
      after: "D2",
      distanceReduced: "content exists but runtime and output are not integrated"
    },
    nextStep: {
      taskId: "TEST_E3_RUNTIME",
      requiredEvidenceLevelBeforeStart: "E2_CONTENT_AUTHORED"
    }
  };
}

function errorCodes(result) {
  return new Set(result.errors.map((entry) => entry.code));
}

test("GOV-S01 accepts an honest E2 content-only claim", () => {
  const result = validateManifest(baseManifest(), { checkPaths: false });
  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});

test("GOV-S01 permanently blocks the P12 false production-review precedent", () => {
  const result = validateManifest(p12FalseReviewFixture, { checkPaths: false });
  const codes = errorCodes(result);
  assert.equal(result.ok, false);
  assert.ok(codes.has("MCI_PRODUCTION_REVIEW_BEFORE_E4"));
  assert.ok(codes.has("MCI_HUMAN_REVIEW_ARTIFACT_MISSING"));
  assert.ok(codes.has("MCI_LEGACY_OUTPUT_UNCHANGED"));
  assert.ok(codes.has("MCI_DISTANCE_REDUCTION_UNSUPPORTED"));
  assert.ok(codes.has("MCI_NEXT_STEP_SKIPS_REQUIRED_LEVEL"));
});

test("GOV-S01 blocks output claims when runtime is not integrated", () => {
  const manifest = baseManifest();
  manifest.claims.pdfOutputVerified = true;
  manifest.claims.visibleOutputChanged = true;
  manifest.evidence.htmlArtifactPaths = ["output.html"];
  manifest.evidence.pdfArtifactPaths = ["output.pdf"];
  manifest.evidence.beforeAfterEvidencePaths = ["diff.json"];
  const codes = errorCodes(validateManifest(manifest, { checkPaths: false }));
  assert.ok(codes.has("MCI_CLAIM_EXCEEDS_EVIDENCE"));
  assert.ok(codes.has("MCI_RUNTIME_FALSE_BUT_OUTPUT_CLAIMED"));
  assert.ok(codes.has("MCI_RENDERER_FALSE_BUT_PDF_CLAIMED"));
});

test("GOV-S01 blocks D0 without the complete pipeline", () => {
  const manifest = baseManifest();
  manifest.actualEvidenceLevel = "E6_D0_COMPLETE";
  manifest.targetEvidenceLevel = "E6_D0_COMPLETE";
  manifest.claims.d0Complete = true;
  manifest.distance.after = "D0";
  const result = validateManifest(manifest, { checkPaths: false });
  assert.equal(result.ok, false);
  assert.ok(errorCodes(result).has("MCI_D0_WITHOUT_FULL_PIPELINE"));
});

test("GOV-S01 distinguishes draft review from production-equivalent review", () => {
  const draft = baseManifest();
  draft.claims.humanReviewReady = true;
  draft.humanReview.type = "draft_content_review";
  draft.humanReview.reviewArtifactRequired = true;
  draft.evidence.reviewArtifactPaths = ["draft-review.md"];
  assert.equal(validateManifest(draft, { checkPaths: false }).ok, true);

  draft.humanReview.canUnlockProduction = true;
  const codes = errorCodes(validateManifest(draft, { checkPaths: false }));
  assert.ok(codes.has("MCI_DRAFT_REVIEW_CANNOT_UNLOCK_PRODUCTION"));
});

test("GOV-S01 parses required PR body fields deterministically", () => {
  const fields = parsePrBodyFields([
    "Milestone Claim Manifest: `data/project/milestones/GOV-S01.claim.json`",
    "Actual Evidence Level: `E3_SHADOW_RUNTIME_INTEGRATED`",
    "Maximum Claim: `E3_SHADOW_RUNTIME_INTEGRATED`",
    "Visible Output Changed: `false`",
    "Human Review Type: `none`",
    "Human Review Ready: `false`"
  ].join("\n"));
  assert.deepEqual(fields, {
    manifestPath: "data/project/milestones/GOV-S01.claim.json",
    actualEvidenceLevel: "E3_SHADOW_RUNTIME_INTEGRATED",
    maximumClaim: "E3_SHADOW_RUNTIME_INTEGRATED",
    visibleOutputChanged: "false",
    humanReviewType: "none",
    humanReviewReady: "false"
  });
});

test("GOV-S01 blocks a PR that changes files without a claim manifest", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "gov-s01-event-"));
  const eventPath = path.join(directory, "event.json");
  fs.writeFileSync(eventPath, JSON.stringify({
    pull_request: {
      base: { ref: "main" },
      body: ""
    }
  }));
  const result = validatePullRequestManifest({
    eventPath,
    changedFiles: ["site/modules/example.js"]
  });
  assert.equal(result.ok, false);
  assert.ok(errorCodes(result).has("MCI_CLAIM_MANIFEST_MISSING"));
});

test("GOV-S01 validates every committed project claim manifest", () => {
  const result = validateAllManifests();
  console.log(`MILESTONE_CLAIM_INTEGRITY_SUMMARY=${JSON.stringify({ manifestCount: result.manifestCount, errorCount: result.errors.length })}`);
  assert.ok(result.manifestCount >= 2);
  assert.deepEqual(result.errors, []);
  assert.equal(result.ok, true);
});
