import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import { getR04KnowledgePointCapabilityMapping } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const preflight = JSON.parse(fs.readFileSync(
  path.join(ROOT, "data/curriculum/full-product/p05f/q013-g4a-u05-triangle-elements-naming-source-authority-preflight.json"),
  "utf8",
));
const queue = materializeP05EW5DirectProductVerticalSliceQueue();
const slice = queue.queueEntries[12];
const mapping = getR04KnowledgePointCapabilityMapping("kp_g4a_u05_triangle_elements_naming");

const report = {
  schemaName: "P05FW5Q013SourceAuthorityPreflightReadbackV1",
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
  requiredW5CapabilityIds: slice?.requiredW5CapabilityIds ?? [],
  r04Mapping: {
    primaryRuntimeProfileId: mapping?.primaryRuntimeProfileId ?? null,
    classificationRuleId: mapping?.classificationRuleId ?? null,
    appliedModifierIds: mapping?.appliedModifierIds ?? [],
  },
  sourceAuthority: {
    sourcePdfTitle: preflight.sourceAuthority.sourcePdfTitle,
    sourcePdfDriveFileId: preflight.sourceAuthority.sourcePdfDriveFileId,
    sourceMetadataDriveFileId: preflight.sourceAuthority.sourceMetadataDriveFileId,
    verificationNotesDriveFileId: preflight.sourceAuthority.verificationNotesDriveFileId,
    sourceUrlFromMetadata: preflight.sourceAuthority.sourceUrlFromMetadata,
    embeddedHeaderUrlFromPdf: preflight.sourceAuthority.embeddedHeaderUrlFromPdf,
    sourceIdentityDisposition: preflight.sourceAuthority.sourceIdentityCrossCheck.disposition,
  },
  r02ReviewedCandidateAuthority: preflight.r02ReviewedCandidateAuthority,
  includedRelations: preflight.q013ScopeLock.includedRelations,
  excludedKnowledgePointIdsFromSameSource: preflight.q013ScopeLock.excludedKnowledgePointIdsFromSameSource,
  laterFrozenQueueSameSourceKnowledgePointIds: preflight.q013ScopeLock.laterFrozenQueueSameSourceKnowledgePointIds,
  siblingProtection: preflight.siblingProtection,
  validationBoundary: preflight.validationBoundary,
  sourceRefAmbiguity: preflight.preflightDecision.sourceRefAmbiguity,
  manualSourceChoiceRequired: preflight.preflightDecision.manualSourceChoiceRequired,
  singleKnowledgePointSliceLocked: preflight.preflightDecision.singleKnowledgePointSliceLocked,
  nextTaskRequiresSeparateImplementationApproval: preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval,
  nextTask: preflight.preflightDecision.nextTask,
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
