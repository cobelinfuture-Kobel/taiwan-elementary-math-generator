import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../.."),read=p=>JSON.parse(readFileSync(path.join(ROOT,p),"utf8"));
const p=read("data/curriculum/full-product/p06f/q006-g4a-u07-input-output-table-source-authority-preflight.json");
const q=materializeP06EW6DirectProductVerticalSliceQueue(),slice=q.queueEntries[5],KP="kp_g4a_u07_input_output_table_rule",CAPS=["cap_data_domain_validator","cap_table_data_model","cap_table_representation"];
assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
assert.equal(slice.sliceId,p.queueAuthority.sliceId);
assert.deepEqual(slice.knowledgePointIds,[KP]);
assert.deepEqual(slice.requiredW6CapabilityIds,CAPS);
assert.deepEqual(p.queueAuthority.requiredW6CapabilityIds,slice.requiredW6CapabilityIds);
assert.deepEqual(p.runtimeCapabilityAuthority.exactFrozenQueueRequiredW6CapabilityIds,slice.requiredW6CapabilityIds);
const mapping=getR04KnowledgePointCapabilityMapping(KP);assert.equal(mapping.primaryRuntimeProfileId,"profile_table_data");assert.equal(mapping.classificationRuleId,"rule_table_data");
assert.equal(p.predecessorD0Evidence.liveReportStatus,"PASS_E6_D0_COMPLETE");
assert.equal(p.sourceAuthority.reviewMethod,"FULL_PAGE_VISUAL_READBACK");
assert.deepEqual(p.sourceAuthority.reviewedPages,[1,2]);
assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.embeddedHeaderUrlMismatch.sourceRefAmbiguity,false);
assert.equal(p.semanticProfileLock.targetSemanticCore,"INPUT_OUTPUT_TABLE_RULE");
assert.equal(p.q006ScopeLock.implementationAllowedByThisPreflight,false);
assert.equal(p.preflightDecision.separateImplementationApprovalRequired,true);
console.log(JSON.stringify({
  schemaName:"P06FW6Q006G4AU07InputOutputTableSourceAuthorityPreflightReadbackV1",
  status:p.status,
  predecessorD0:p.predecessorD0Evidence,
  queue:{position:p.queueAuthority.queuePosition,sliceId:p.queueAuthority.sliceId,previousSliceId:p.queueAuthority.previousSliceId,sourceId:p.queueAuthority.primarySourceNodeId,runtimeProfileId:p.queueAuthority.primaryRuntimeProfileId,knowledgePointIds:p.queueAuthority.knowledgePointIds,requiredW6CapabilityIds:p.queueAuthority.requiredW6CapabilityIds},
  source:{pdfTitle:p.sourceAuthority.sourcePdfTitle,driveFileId:p.sourceAuthority.sourcePdfDriveFileId,reviewedPages:p.sourceAuthority.reviewedPages,targetCandidate:p.r02ReviewedCandidateAuthority.targetCandidate},
  semanticProfileLock:p.semanticProfileLock,
  protectedPredecessors:p.r02ReviewedCandidateAuthority.protectedPredecessorKnowledgePointIds,
  protectedSuccessors:p.r02ReviewedCandidateAuthority.protectedSameSourceFutureCandidates,
  nextTask:p.preflightDecision.nextTask,
  implementationApprovalRequired:p.preflightDecision.separateImplementationApprovalRequired
},null,2));
