import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import { getR04KnowledgePointCapabilityMapping } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const preflight = JSON.parse(fs.readFileSync(
  path.join(ROOT, "data/curriculum/full-product/p05f/q019-g5b-u01-volume-unit-conversion-source-authority-preflight.json"),
  "utf8",
));
const queue = materializeP05EW5DirectProductVerticalSliceQueue();
const slice = queue.queueEntries[18];
const mapping = getR04KnowledgePointCapabilityMapping("kp_g5b_u01_volume_unit_conversion");

const report = {
  schemaName: "P05FW5Q019SourceAuthorityPreflightReadbackV1",
  status: preflight.status,
  queueFrozen: queue.queueFrozen,
  queuePosition: slice?.queuePosition ?? null,
  sliceId: slice?.sliceId ?? null,
  implementationTaskId: slice?.implementationTaskId ?? null,
  previousSliceId: slice?.previousSliceId ?? null,
  previousSliceD0Status: preflight.previousSliceD0Evidence.status,
  previousSliceMergeSha: preflight.previousSliceD0Evidence.productMergeSha,
  previousSliceExactPagesRunId: preflight.previousSliceD0Evidence.exactPagesRunId,
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
  sourceUrl: preflight.sourceAuthority.sourceUrl,
  sourceIdentityDisposition: preflight.sourceAuthority.sourceIdentityCrossCheck.disposition,
  reviewedPages: preflight.sourceAuthority.reviewedPages,
  r02ReviewedCandidateAuthority: preflight.r02ReviewedCandidateAuthority,
  includedRelations: preflight.q019ScopeLock.includedRelations,
  excludedKnowledgePointIdsFromSameSource: preflight.q019ScopeLock.excludedKnowledgePointIdsFromSameSource,
  sourceRefAmbiguity: preflight.preflightDecision.sourceRefAmbiguity,
  manualSourceChoiceRequired: preflight.preflightDecision.manualSourceChoiceRequired,
  singleKnowledgePointSliceLocked: preflight.preflightDecision.singleKnowledgePointSliceLocked,
  validationBoundary: preflight.preflightValidationBoundary,
  nextTaskRequiresSeparateImplementationApproval: preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval,
  nextTask: preflight.preflightDecision.nextTask,
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
