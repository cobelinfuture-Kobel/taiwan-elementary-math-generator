import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (p) => JSON.parse(readFileSync(path.join(ROOT, p), "utf8"));
const p = read("data/curriculum/full-product/p06f/q001-g3a-u07-pattern-source-authority-preflight.json");
const q = read("data/curriculum/full-product/p06e/w6-direct-product-vertical-slice-queue.json");
assert.equal(p.status, "PASS_SOURCE_AUTHORITY_PREFLIGHT");
assert.equal(p.queueAuthority.queueDigest, q.queueDigest);
assert.equal(p.queueAuthority.sliceId, q.firstExecutableSlice.sliceId);
assert.equal(p.queueAuthority.primarySourceNodeId, "g3a_u07_3a07");
assert.deepEqual(p.queueAuthority.knowledgePointIds, ["kp_arithmetic_sequence_extension","kp_repeating_visual_pattern","kp_spatial_growth_pattern_count"]);
assert.deepEqual(p.queueAuthority.requiredW6CapabilityIds, ["cap_pattern_relation_validator","cap_pattern_sequence_reasoning"]);
assert.equal(p.sourceAuthority.reviewMethod, "FULL_PAGE_VISUAL_READBACK");
assert.deepEqual(p.sourceAuthority.reviewedPages, [1,2,3]);
assert.equal(p.sourceAuthority.embeddedHeaderMismatch.classification, "NON_BLOCKING_SOURCE_DOCUMENT_HEADER_URL_MISMATCH");
assert.equal(p.sourceAuthority.embeddedHeaderMismatch.sourceRefAmbiguity, false);
assert.equal(p.r02ReviewedCandidateAuthority.protectedSameSourceCandidate.knowledgePointId, "kp_tabular_pattern_rule");
assert.equal(p.q001ScopeLock.implementationAllowedByThisPreflight, false);
assert.equal(p.preflightDecision.separateImplementationApprovalRequired, true);
console.log(JSON.stringify({
  schemaName: "P06FW6Q001PatternSourceAuthorityPreflightReadbackV1",
  status: "PASS_SOURCE_AUTHORITY_PREFLIGHT",
  queue: {
    position: p.queueAuthority.queuePosition,
    sliceId: p.queueAuthority.sliceId,
    sourceId: p.queueAuthority.primarySourceNodeId,
    runtimeProfileId: p.queueAuthority.primaryRuntimeProfileId,
    knowledgePointIds: p.queueAuthority.knowledgePointIds,
    requiredW6CapabilityIds: p.queueAuthority.requiredW6CapabilityIds
  },
  source: {
    pdfTitle: p.sourceAuthority.sourcePdfTitle,
    driveFileId: p.sourceAuthority.sourcePdfDriveFileId,
    sha256: p.sourceAuthority.sourcePdfSha256,
    reviewedPages: p.sourceAuthority.reviewedPages,
    embeddedHeaderMismatch: p.sourceAuthority.embeddedHeaderMismatch
  },
  protectedSuccessor: p.r02ReviewedCandidateAuthority.protectedSameSourceCandidate,
  nextTask: p.preflightDecision.nextTask,
  implementationApprovalRequired: p.preflightDecision.separateImplementationApprovalRequired
}, null, 2));
