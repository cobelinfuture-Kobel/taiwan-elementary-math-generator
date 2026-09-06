import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import { getR04KnowledgePointCapabilityMapping } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const preflight = JSON.parse(fs.readFileSync(
  path.join(ROOT, "data/curriculum/full-product/p05f/q012-g3b-u05-area-grid-counting-source-authority-preflight.json"),
  "utf8",
));
const queue = materializeP05EW5DirectProductVerticalSliceQueue();
const slice = queue.queueEntries[11];
const mapping = getR04KnowledgePointCapabilityMapping("kp_area_grid_counting");

const report = {
  schemaName: "P05FW5Q012SourceAuthorityPreflightReadbackV1",
  status: preflight.status,
  queueFrozen: queue.queueFrozen,
  queuePosition: slice?.queuePosition ?? null,
  sliceId: slice?.sliceId ?? null,
  implementationTaskId: slice?.implementationTaskId ?? null,
  previousSliceId: slice?.previousSliceId ?? null,
  previousSliceD0Status: preflight.previousSliceD0Evidence.status,
  previousSliceCloseoutStatus: preflight.previousSliceD0Evidence.postMergeAttribution.closeoutStatus,
  previousSliceExactPagesRunId: preflight.previousSliceD0Evidence.exactPagesRunId,
  previousSlicePostMergeNewFailureCountAfterRepair: preflight.previousSliceD0Evidence.postMergeAttribution.postRepairNewFailureCountVsBaseline,
  primarySourceNodeId: slice?.primarySourceNodeId ?? null,
  runtimeProfileId: slice?.primaryRuntimeProfileId ?? null,
  knowledgePointCount: slice?.knowledgePointCount ?? null,
  knowledgePointIds: slice?.knowledgePointIds ?? [],
  r04Mapping: {
    primaryRuntimeProfileId: mapping?.primaryRuntimeProfileId ?? null,
    classificationRuleId: mapping?.classificationRuleId ?? null,
    appliedModifierIds: mapping?.appliedModifierIds ?? [],
  },
  requiredW5CapabilityIds: slice?.requiredW5CapabilityIds ?? [],
  runtimeCapabilityAuthority: preflight.runtimeCapabilityAuthority,
  sourcePdfTitle: preflight.sourceAuthority.sourcePdfTitle,
  sourcePdfDriveFileId: preflight.sourceAuthority.sourcePdfDriveFileId,
  sourceMetadataDriveFileId: preflight.sourceAuthority.sourceMetadataDriveFileId,
  verificationNotesDriveFileId: preflight.sourceAuthority.verificationNotesDriveFileId,
  sourceUrlFromMetadata: preflight.sourceAuthority.sourceUrlFromMetadata,
  sourceIdentityDisposition: preflight.sourceAuthority.sourceIdentityCrossCheck.disposition,
  reviewedPages: preflight.sourceAuthority.reviewedPages,
  sourceEvidence: preflight.sourceAuthority.page1DirectEvidence,
  r02ReviewedCandidateAuthority: preflight.r02ReviewedCandidateAuthority,
  includedRelations: preflight.q012ScopeLock.includedRelations,
  protectedExistingSameSourceKnowledgePointIds: preflight.q012ScopeLock.protectedExistingSameSourceKnowledgePointIds,
  excludedKnowledgePointIdsFromSameSource: preflight.q012ScopeLock.excludedKnowledgePointIdsFromSameSource,
  sourceRefAmbiguity: preflight.preflightDecision.sourceRefAmbiguity,
  manualSourceChoiceRequired: preflight.preflightDecision.manualSourceChoiceRequired,
  singleKnowledgePointSliceLocked: preflight.preflightDecision.singleKnowledgePointSliceLocked,
  postMergeEvidenceTriggerPolicy: preflight.postMergeEvidenceTriggerPolicy,
  nextTaskRequiresSeparateImplementationApproval: preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval,
  nextTask: preflight.preflightDecision.nextTask,
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
