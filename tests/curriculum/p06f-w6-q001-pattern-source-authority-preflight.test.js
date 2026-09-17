import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => JSON.parse(readFileSync(new URL(`../../${path}`, import.meta.url), "utf8"));
const preflight = read("data/curriculum/full-product/p06f/q001-g3a-u07-pattern-source-authority-preflight.json");
const queue = read("data/curriculum/full-product/p06e/w6-direct-product-vertical-slice-queue.json");
const r02 = read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-01.json");
const profiles = read("data/curriculum/global/runtime/r04/runtime-capability-profiles.json");
const impact = read("data/project/change-impact/P06F_W6_Q001_PREFLIGHT.impact.json");
const validation = read("data/project/validation-plans/P06F_W6_Q001_PREFLIGHT.validation.json");

const Q001_KPS = [
  "kp_arithmetic_sequence_extension",
  "kp_repeating_visual_pattern",
  "kp_spatial_growth_pattern_count",
];
const W6_CAPS = ["cap_pattern_relation_validator", "cap_pattern_sequence_reasoning"];

test("W6 Q001 preflight binds the exact first frozen queue slice", () => {
  assert.equal(preflight.status, "PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.queueAuthority.queueDigest, queue.queueDigest);
  assert.equal(queue.queueDigest, "9e22094dee0d66e459848741894a3347df1c985ec8720cdabb3efc2e5a68e1be");
  assert.equal(preflight.queueAuthority.queuePosition, 1);
  assert.equal(preflight.queueAuthority.queueSliceCount, 20);
  assert.equal(preflight.queueAuthority.sliceId, queue.firstExecutableSlice.sliceId);
  assert.equal(preflight.queueAuthority.implementationTaskId, queue.firstExecutableSlice.implementationTaskId);
  assert.equal(preflight.queueAuthority.primarySourceNodeId, "g3a_u07_3a07");
  assert.equal(preflight.queueAuthority.primaryRuntimeProfileId, "profile_pattern_relation");
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds, Q001_KPS);
  assert.deepEqual(preflight.queueAuthority.requiredW6CapabilityIds, W6_CAPS);
  assert.equal(preflight.queueAuthority.previousSliceId, null);
  assert.equal(preflight.queueAuthority.previousSliceMustBeD0Complete, false);
});

test("W6 Q001 source evidence matches the R02 full-page reviewed pattern candidates", () => {
  const source = r02.sourceRecords.find((row) => row.sourceNodeId === "g3a_u07_3a07");
  assert.ok(source);
  assert.equal(source.sourceTitle, "尋找規律");
  assert.equal(source.sourcePdfTitle, "meow911_3a07_patterns.pdf");
  assert.equal(source.pageCount, 3);
  assert.deepEqual(source.reviewedPages, [1, 2, 3]);
  assert.equal(preflight.sourceAuthority.sourcePdfDriveFileId, "1HzOOsMf5y7R5nXWMnlulfdQlu7KG-1iv");
  assert.equal(preflight.sourceAuthority.sourcePdfSha256, "ef0a25e91ef3ef92117497ecc52ea074a5f940380b61c01f17bbbfc8401d097d");
  assert.equal(preflight.sourceAuthority.reviewMethod, "FULL_PAGE_VISUAL_READBACK");
  assert.deepEqual(preflight.sourceAuthority.reviewedPages, [1, 2, 3]);
  assert.equal(preflight.sourceAuthority.ocrUsedAsAuthority, false);
  const candidates = new Map(source.candidates.map((row) => [row.knowledgePointId, row]));
  for (const expected of preflight.r02ReviewedCandidateAuthority.targetCandidates) {
    const actual = candidates.get(expected.knowledgePointId);
    assert.ok(actual, expected.knowledgePointId);
    assert.equal(actual.canonicalNameZh, expected.canonicalNameZh);
    assert.equal(actual.capabilityStatement, expected.capabilityStatement);
    assert.equal(actual.reasoningInvariant, expected.reasoningInvariant);
    assert.deepEqual(actual.evidencePages, expected.evidencePages);
    assert.equal(actual.applicationSuitability, "APPLICATION_COMPATIBLE");
  }
  assert.equal(preflight.sourceAuthority.embeddedHeaderMismatch.present, true);
  assert.match(preflight.sourceAuthority.embeddedHeaderMismatch.pdfVisibleHeader, /3b03/);
  assert.equal(preflight.sourceAuthority.embeddedHeaderMismatch.sourceRefAmbiguity, false);
  assert.equal(preflight.sourceAuthority.embeddedHeaderMismatch.manualSourceChoiceRequired, false);
  assert.equal(preflight.sourceAuthority.driveMetadataReadback.reviewStatusUse, "STALE_METADATA_NOT_USED_AS_CURRENT_REVIEW_PROOF");
});

test("W6 Q001 protects Q002 tabular semantics and locks the pattern runtime contract", () => {
  const source = r02.sourceRecords.find((row) => row.sourceNodeId === "g3a_u07_3a07");
  const tableCandidate = source.candidates.find((row) => row.knowledgePointId === "kp_tabular_pattern_rule");
  assert.ok(tableCandidate);
  assert.equal(preflight.r02ReviewedCandidateAuthority.protectedSameSourceCandidate.knowledgePointId, "kp_tabular_pattern_rule");
  assert.equal(preflight.r02ReviewedCandidateAuthority.protectedSameSourceCandidate.futureQueuePosition, 2);
  assert.equal(preflight.r02ReviewedCandidateAuthority.protectedSameSourceCandidate.q001MayNotReown, true);
  assert.ok(preflight.q001ScopeLock.excludedRelations.includes("REOWN_KP_TABULAR_PATTERN_RULE"));
  const profile = profiles.profiles.find((row) => row.profileId === "profile_pattern_relation");
  assert.ok(profile);
  assert.deepEqual(profile.requiredCapabilityIds, [
    "cap_pattern_sequence_reasoning",
    "cap_pattern_relation_validator",
    "cap_text_numeric_representation",
  ]);
  assert.deepEqual(preflight.runtimeCapabilityAuthority.exactFrozenQueueRequiredW6CapabilityIds, W6_CAPS);
  assert.equal(preflight.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed, false);
  assert.equal(preflight.runtimeCapabilityAuthority.symbolicRelationReasoningRequiredForQ001, false);
  assert.equal(preflight.q001ScopeLock.implementationAllowedByThisPreflight, false);
  assert.equal(preflight.q001ScopeLock.publicProductAdmissionAllowedByThisPreflight, false);
  assert.equal(preflight.preflightDecision.separateImplementationApprovalRequired, true);
  assert.equal(preflight.preflightDecision.nextTask, "P06F_W6DirectProductVerticalSlice001Implementation");
});

test("W6 Q001 preflight remains SHARED_RUNTIME_BOUNDED and planning-only", () => {
  assert.equal(impact.expectedDerivedGate, "SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.changeImpact.planningAuthorityAdded, true);
  assert.equal(impact.scopeGuards.productImplementation, false);
  assert.equal(impact.scopeGuards.publicAdmission, false);
  assert.equal(validation.policyId, "UNIT_INCREMENTAL_VALIDATION_V1");
  const lane = validation.lanes.SHARED_RUNTIME_BOUNDED;
  assert.deepEqual(lane.map((row) => row.gateId), ["GLOBAL_CONTRACTS", "TARGETED_ROUTE_REPLAY"]);
  assert.equal(lane[1].runtime, "NODE_ONLY");
  assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"), false);
  assert.equal(JSON.stringify(validation).includes("PLAYWRIGHT_CHROMIUM"), false);
});
