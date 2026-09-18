import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../.."),read=p=>JSON.parse(readFileSync(path.join(ROOT,p),"utf8"));
const p=read("data/curriculum/full-product/p06f/q005-g4a-u07-pattern-relation-source-authority-preflight.json");
const q=materializeP06EW6DirectProductVerticalSliceQueue(),slice=q.queueEntries[4];
const KPS=["kp_g4a_u07_geometric_arrangement_count","kp_g4a_u07_quantity_additive_pattern"],CAPS=["cap_pattern_relation_validator","cap_pattern_sequence_reasoning"];
assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
assert.equal(slice.sliceId,p.queueAuthority.sliceId);
assert.deepEqual(slice.knowledgePointIds,KPS);
assert.deepEqual(slice.requiredW6CapabilityIds,CAPS);
assert.deepEqual(p.queueAuthority.requiredW6CapabilityIds,slice.requiredW6CapabilityIds);
assert.deepEqual(p.runtimeCapabilityAuthority.exactFrozenQueueRequiredW6CapabilityIds,slice.requiredW6CapabilityIds);
for(const id of KPS){const mapping=getR04KnowledgePointCapabilityMapping(id);assert.equal(mapping.primaryRuntimeProfileId,"profile_pattern_relation");assert.equal(mapping.classificationRuleId,"rule_pattern_relation");}
assert.equal(p.predecessorD0Evidence.liveReportStatus,"PASS_E6_D0_COMPLETE");
assert.equal(p.sourceAuthority.reviewMethod,"FULL_PAGE_VISUAL_READBACK");
assert.deepEqual(p.sourceAuthority.reviewedPages,[1,2]);
assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.embeddedHeaderUrlMismatch.sourceRefAmbiguity,false);
assert.equal(p.semanticProfileLock.implementationSemanticLock.geometricArrangementIsPatternRelationCore,true);
assert.equal(p.q005ScopeLock.implementationAllowedByThisPreflight,false);
assert.equal(p.preflightDecision.separateImplementationApprovalRequired,true);
console.log(JSON.stringify({
  schemaName:"P06FW6Q005G4AU07PatternRelationSourceAuthorityPreflightReadbackV1",
  status:p.status,
  predecessorD0:p.predecessorD0Evidence,
  queue:{position:p.queueAuthority.queuePosition,sliceId:p.queueAuthority.sliceId,previousSliceId:p.queueAuthority.previousSliceId,sourceId:p.queueAuthority.primarySourceNodeId,runtimeProfileId:p.queueAuthority.primaryRuntimeProfileId,knowledgePointIds:p.queueAuthority.knowledgePointIds,requiredW6CapabilityIds:p.queueAuthority.requiredW6CapabilityIds},
  source:{pdfTitle:p.sourceAuthority.sourcePdfTitle,driveFileId:p.sourceAuthority.sourcePdfDriveFileId,reviewedPages:p.sourceAuthority.reviewedPages,identityArtifactLock:p.sourceAuthority.sourceIdentityArtifactLock,targetCandidates:p.r02ReviewedCandidateAuthority.targetCandidates.map(x=>({knowledgePointId:x.knowledgePointId,evidencePages:x.evidencePages}))},
  semanticProfileLock:p.semanticProfileLock,
  protectedSuccessors:p.r02ReviewedCandidateAuthority.protectedSameSourceFutureCandidates,
  nextTask:p.preflightDecision.nextTask,
  implementationApprovalRequired:p.preflightDecision.separateImplementationApprovalRequired
},null,2));
