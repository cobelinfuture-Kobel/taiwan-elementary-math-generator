import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const read=p=>JSON.parse(readFileSync(path.join(ROOT,p),"utf8"));
const p=read("data/curriculum/full-product/p06f/q002-g3a-u07-tabular-pattern-source-authority-preflight.json");
const q=read("data/curriculum/full-product/p06e/w6-direct-product-vertical-slice-queue.json");
assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
assert.equal(p.queueAuthority.queueDigest,q.queueDigest);
assert.equal(p.queueAuthority.queuePosition,2);
assert.equal(p.queueAuthority.sliceId,q.orderedSliceIds[1]);
assert.equal(p.queueAuthority.previousSliceId,q.orderedSliceIds[0]);
assert.equal(p.queueAuthority.previousSliceMustBeD0Complete,true);
assert.equal(p.predecessorD0Evidence.liveReportStatus,"PASS_E6_D0_COMPLETE");
assert.equal(p.predecessorD0Evidence.exactDeployedHeadSha,"cd0c4ee98994f1efd1a5dbbbd234286efc8fef62");
assert.equal(p.queueAuthority.primarySourceNodeId,"g3a_u07_3a07");
assert.deepEqual(p.queueAuthority.knowledgePointIds,["kp_tabular_pattern_rule"]);
assert.deepEqual(p.queueAuthority.requiredW6CapabilityIds,["cap_data_domain_validator","cap_table_data_model","cap_table_representation"]);
assert.equal(p.sourceAuthority.reviewMethod,"FULL_PAGE_VISUAL_READBACK");
assert.deepEqual(p.r02ReviewedCandidateAuthority.targetCandidate.evidencePages,[1]);
assert.equal(p.runtimeCapabilityAuthority.profileId,"profile_table_data");
assert.equal(p.q002ScopeLock.implementationAllowedByThisPreflight,false);
assert.equal(p.preflightDecision.separateImplementationApprovalRequired,true);
console.log(JSON.stringify({
  schemaName:"P06FW6Q002TabularPatternSourceAuthorityPreflightReadbackV1",
  status:p.status,
  predecessorD0:p.predecessorD0Evidence,
  queue:{
    position:p.queueAuthority.queuePosition,
    sliceId:p.queueAuthority.sliceId,
    previousSliceId:p.queueAuthority.previousSliceId,
    sourceId:p.queueAuthority.primarySourceNodeId,
    runtimeProfileId:p.queueAuthority.primaryRuntimeProfileId,
    knowledgePointIds:p.queueAuthority.knowledgePointIds,
    requiredW6CapabilityIds:p.queueAuthority.requiredW6CapabilityIds
  },
  source:{
    pdfTitle:p.sourceAuthority.sourcePdfTitle,
    driveFileId:p.sourceAuthority.sourcePdfDriveFileId,
    sha256:p.sourceAuthority.sourcePdfSha256,
    reviewedPages:p.sourceAuthority.reviewedPages,
    evidencePages:p.r02ReviewedCandidateAuthority.targetCandidate.evidencePages,
    embeddedHeaderMismatch:p.sourceAuthority.embeddedHeaderMismatch
  },
  nextTask:p.preflightDecision.nextTask,
  implementationApprovalRequired:p.preflightDecision.separateImplementationApprovalRequired
},null,2));
