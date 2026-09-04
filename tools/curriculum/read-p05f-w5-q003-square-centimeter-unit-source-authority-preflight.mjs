import { readFileSync } from "node:fs";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";

const readJson = (relativePath) => JSON.parse(readFileSync(new URL(`../../${relativePath}`, import.meta.url), "utf8"));

const preflight = readJson("data/curriculum/full-product/p05f/q003-g3b-u05-square-centimeter-unit-source-authority-preflight.json");
const r02 = readJson("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-01.json");
const queue = materializeP05EW5DirectProductVerticalSliceQueue();
const slice = queue.queueEntries[2];
const source = r02.sourceRecords.find((row) => row.sourceNodeId === "g3b_u05_3b05");
const candidate = source?.candidates.find((row) => row.knowledgePointId === "kp_area_square_centimeter_unit");

const fail = (code, detail = "") => {
  throw new Error(`${code}${detail ? `:${detail}` : ""}`);
};

if (!queue.queueFrozen) fail("P05F3_QUEUE_NOT_FROZEN");
if (slice?.sliceId !== preflight.queueAuthority.sliceId) fail("P05F3_SLICE_ID_MISMATCH", slice?.sliceId);
if (slice?.previousSliceId !== preflight.queueAuthority.previousSliceId) fail("P05F3_PREVIOUS_SLICE_MISMATCH", slice?.previousSliceId);
if (slice?.primarySourceNodeId !== "g3b_u05_3b05") fail("P05F3_SOURCE_NODE_MISMATCH", slice?.primarySourceNodeId);
if (slice?.primaryRuntimeProfileId !== "profile_geometry_formula") fail("P05F3_PROFILE_MISMATCH", slice?.primaryRuntimeProfileId);
if (JSON.stringify(slice?.knowledgePointIds) !== JSON.stringify(["kp_area_square_centimeter_unit"])) {
  fail("P05F3_KP_ALLOCATION_MISMATCH", JSON.stringify(slice?.knowledgePointIds));
}
if (!source) fail("P05F3_R02_SOURCE_MISSING");
if (!candidate) fail("P05F3_R02_TARGET_KP_MISSING");
if (candidate.canonicalNameZh !== "平方公分面積單位") fail("P05F3_R02_NAME_MISMATCH", candidate.canonicalNameZh);
if (candidate.capabilityStatement !== preflight.r02ReviewedCandidateAuthority.capabilityStatement) {
  fail("P05F3_CAPABILITY_STATEMENT_MISMATCH");
}
if (candidate.reasoningInvariant !== preflight.r02ReviewedCandidateAuthority.reasoningInvariant) {
  fail("P05F3_REASONING_INVARIANT_MISMATCH");
}
if (preflight.previousSliceD0Evidence.status !== "PASS_E6_D0_COMPLETE") fail("P05F3_Q002_NOT_D0");
if (preflight.sourceAuthority.sourceIdentityAnomaly.sourceRefAmbiguity !== false) fail("P05F3_SOURCE_REF_AMBIGUITY");
if (preflight.q003ScopeLock.implementationAllowedByThisPreflight !== false) fail("P05F3_IMPLEMENTATION_SCOPE_LEAK");
if (preflight.postMergeEvidenceTriggerPolicy.prStageOrchestrator !== "PR_GATE_ONLY") fail("P05F3_PR_ORCHESTRATOR_DRIFT");
if (!preflight.postMergeEvidenceTriggerPolicy.forbiddenTriggerEvents.includes("pull_request")) fail("P05F3_SECOND_PR_WORKFLOW_NOT_FORBIDDEN");
if (!preflight.postMergeEvidenceTriggerPolicy.allowedTriggerEvents.includes("push_to_main_with_q_specific_paths")) fail("P05F3_MAIN_PUSH_TRIGGER_NOT_LOCKED");

const readback = {
  taskId: preflight.taskId,
  status: preflight.status,
  queue: {
    frozen: queue.queueFrozen,
    position: slice.queuePosition,
    sliceId: slice.sliceId,
    previousSliceId: slice.previousSliceId,
    sourceNodeId: slice.primarySourceNodeId,
    runtimeProfileId: slice.primaryRuntimeProfileId,
    knowledgePointIds: [...slice.knowledgePointIds],
    requiredW5CapabilityIds: [...slice.requiredW5CapabilityIds],
  },
  previousSliceD0Evidence: preflight.previousSliceD0Evidence,
  sourceAuthority: {
    sourceTitle: source.sourceTitle,
    sourcePdfTitle: source.sourcePdfTitle,
    pageCount: source.pageCount,
    driveFileId: preflight.sourceAuthority.sourcePdfDriveFileId,
    embeddedSourceUrl: preflight.sourceAuthority.embeddedSourceUrl,
    sourceIdentityDisposition: preflight.sourceAuthority.sourceIdentityAnomaly.disposition,
  },
  targetKnowledgePoint: candidate,
  excludedSiblingKnowledgePoints: preflight.sourceSiblingKnowledgePointsExcludedFromQ003,
  q003ScopeLock: preflight.q003ScopeLock,
  postMergeEvidenceTriggerPolicy: preflight.postMergeEvidenceTriggerPolicy,
  nextTask: preflight.preflightDecision.nextTask,
  nextTaskRequiresSeparateImplementationApproval: preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval,
};

console.log(JSON.stringify(readback, null, 2));
