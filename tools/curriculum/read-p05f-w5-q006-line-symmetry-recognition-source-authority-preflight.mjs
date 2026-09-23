import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const preflight = JSON.parse(fs.readFileSync(
  path.join(ROOT, "data/curriculum/full-product/p05f/q006-g5a-u07-line-symmetry-recognition-source-authority-preflight.json"),
  "utf8",
));
const queue = materializeP05EW5DirectProductVerticalSliceQueue();
const slice = queue.queueEntries[5];

const report = {
  schemaName: "P05FW5Q006SourceAuthorityPreflightReadbackV1",
  status: preflight.status,
  queueFrozen: queue.queueFrozen,
  queuePosition: slice?.queuePosition ?? null,
  sliceId: slice?.sliceId ?? null,
  previousSliceId: slice?.previousSliceId ?? null,
  previousSliceD0Status: preflight.previousSliceD0Evidence.status,
  previousSliceExactPagesRunId: preflight.previousSliceD0Evidence.exactPagesRunId,
  primarySourceNodeId: slice?.primarySourceNodeId ?? null,
  runtimeProfileId: slice?.primaryRuntimeProfileId ?? null,
  knowledgePointIds: slice?.knowledgePointIds ?? [],
  requiredW5CapabilityIds: slice?.requiredW5CapabilityIds ?? [],
  runtimeCapabilityAuthority: preflight.runtimeCapabilityAuthority,
  sourcePdfTitle: preflight.sourceAuthority.sourcePdfTitle,
  sourcePdfDriveFileId: preflight.sourceAuthority.sourcePdfDriveFileId,
  sourceUrlFromMetadata: preflight.sourceAuthority.sourceUrlFromMetadata,
  sourceIdentityDisposition: preflight.sourceAuthority.sourceIdentityAnomaly.disposition,
  reviewedPages: preflight.sourceAuthority.reviewedPages,
  canonicalNameZh: preflight.r02ReviewedCandidateAuthority.canonicalNameZh,
  capabilityStatement: preflight.r02ReviewedCandidateAuthority.capabilityStatement,
  reasoningInvariant: preflight.r02ReviewedCandidateAuthority.reasoningInvariant,
  includedRelations: preflight.q006ScopeLock.includedRelations,
  excludedKnowledgePointIdsFromSameSource: preflight.q006ScopeLock.excludedKnowledgePointIdsFromSameSource,
  sourceRefAmbiguity: preflight.preflightDecision.sourceRefAmbiguity,
  manualSourceChoiceRequired: preflight.preflightDecision.manualSourceChoiceRequired,
  postMergeEvidenceTriggerPolicy: preflight.postMergeEvidenceTriggerPolicy,
  nextTaskRequiresSeparateImplementationApproval: preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval,
  nextTask: preflight.preflightDecision.nextTask,
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
