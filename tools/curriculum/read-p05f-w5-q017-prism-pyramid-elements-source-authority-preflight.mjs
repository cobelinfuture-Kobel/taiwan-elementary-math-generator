import {readFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {
  materializeP05EW5DirectProductVerticalSliceQueue,
} from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  getVisibleBatchAKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
} from "../../site/modules/curriculum/registry/batch-a-selector-p05f17-extension.js";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const readJson=relative=>JSON.parse(readFileSync(path.resolve(ROOT,relative),"utf8"));
const remediation=readJson("data/curriculum/full-product/p05f/q017-frozen-queue-parity-remediation-preflight.json");
const historical=readJson("data/curriculum/full-product/p05f/q017-g5a-u10a-prism-pyramid-elements-source-authority-preflight.json");
const r02=readJson("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-03.json");
const SOURCE="g5a_u10_5a10a";
const PRISM="kp_g5a_u10a_prism_pyramid_elements";
const CROSS="kp_g5a_u10a_solid_cross_section";
const Q17_KPS=[PRISM,CROSS];
const Q18_KPS=["kp_g5a_u10a1_cube_cuboid_edge_length","kp_g5a_u10a1_cube_cuboid_face_relationship"];
const errors=[];

const queue=materializeP05EW5DirectProductVerticalSliceQueue();
const q17=queue.queueEntries[16];
const q18=queue.queueEntries[17];

if(remediation.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")errors.push("Q017_REMEDIATION_PREFLIGHT_STATUS_INVALID");
if(!queue.queueFrozen)errors.push("Q017_FROZEN_QUEUE_NOT_FROZEN");
if(queue.derivedRegistrySnapshot.queueDigest!==remediation.queueAuthority.queueDigest)errors.push("Q017_QUEUE_DIGEST_MISMATCH");
if(q17?.queuePosition!==17||q17?.sliceId!==remediation.queueAuthority.sliceId)errors.push("Q017_EXACT_ROW_IDENTITY_INVALID");
if(JSON.stringify(q17?.knowledgePointIds??[])!==JSON.stringify(Q17_KPS))errors.push("Q017_EXACT_ROW_KP_SET_INVALID");
if(q17?.knowledgePointCount!==2)errors.push("Q017_EXACT_ROW_KP_COUNT_INVALID");
if(historical.queueAuthority.knowledgePointCount!==1||JSON.stringify(historical.queueAuthority.knowledgePointIds)!==JSON.stringify([PRISM]))errors.push("Q017_HISTORICAL_MISMATCH_NOT_REPRODUCED");
if(remediation.supersedesExactRowAuthorityFrom!=="data/curriculum/full-product/p05f/q017-g5a-u10a-prism-pyramid-elements-source-authority-preflight.json")errors.push("Q017_SUPERSESSION_POINTER_INVALID");
if(q18?.queuePosition!==18||q18?.sliceId!==remediation.nextSliceBoundaryIdentityOnly.sliceId||JSON.stringify(q18?.knowledgePointIds??[])!==JSON.stringify(Q18_KPS))errors.push("Q017_Q018_BOUNDARY_INVALID");

const source=r02.sourceRecords.find(row=>row.sourceNodeId===SOURCE);
for(const id of Q17_KPS){
  const candidate=source?.candidates?.find(row=>row.knowledgePointId===id);
  const locked=remediation.r02ReviewedCandidateAuthorities.find(row=>row.knowledgePointId===id);
  if(!candidate||!locked)errors.push(`Q017_R02_CANDIDATE_MISSING:${id}`);
  else if(candidate.canonicalNameZh!==locked.canonicalNameZh||candidate.capabilityStatement!==locked.capabilityStatement||candidate.reasoningInvariant!==locked.reasoningInvariant)errors.push(`Q017_R02_SEMANTIC_MISMATCH:${id}`);
}

const publicSource=listBatchAKnowledgePointAvailabilityBySource(SOURCE);
if(BATCH_A_SELECTOR_AVAILABILITY.sourceCount!==53||BATCH_A_SELECTOR_AVAILABILITY.visibleCount!==331)errors.push("Q017_PREFLIGHT_PUBLIC_BASELINE_INVALID");
if(publicSource.visibleCount!==2||publicSource.hiddenPendingCount!==3||publicSource.notSelectableCount!==3)errors.push("Q017_PREFLIGHT_SOURCE_BASELINE_INVALID");
if(getVisibleBatchAKnowledgePoint(CROSS)!==null)errors.push("Q017_CROSS_SECTION_PREMATURELY_VISIBLE");
if(remediation.q017ScopeLock.frozenQueueAuthorityTouched||remediation.q017ScopeLock.q018OrLaterTouched)errors.push("Q017_REMEDIATION_SCOPE_EXPANDED");
if(remediation.preflightDecision.nextTaskRequiresSeparateImplementationApproval)errors.push("Q017_OPERATOR_APPROVAL_NOT_CARRIED_FORWARD");
if(remediation.preflightDecision.nextTask!=="P05F_W5_Q017_FrozenQueueParityRemediation_Implementation")errors.push("Q017_NEXT_TASK_INVALID");
if(!remediation.preflightDecision.q018PreflightBlockedUntilTrueQ017D0)errors.push("Q017_Q018_BLOCKER_NOT_PRESERVED");

const report={
  schemaName:"P05FW5Q017FrozenQueueParityRemediationPreflightReadbackV1",
  taskId:remediation.taskId,
  status:errors.length?"FAIL_Q017_FROZEN_QUEUE_PARITY_REMEDIATION_PREFLIGHT":"PASS_Q017_FROZEN_QUEUE_PARITY_REMEDIATION_PREFLIGHT",
  errors,
  exactRow:{
    queuePosition:q17?.queuePosition,
    sliceId:q17?.sliceId,
    sourceId:q17?.primarySourceNodeId,
    runtimeProfileId:q17?.primaryRuntimeProfileId,
    knowledgePointIds:q17?.knowledgePointIds,
    requiredW5CapabilityIds:q17?.requiredW5CapabilityIds,
  },
  historicalMismatch:{
    declaredKnowledgePointCount:historical.queueAuthority.knowledgePointCount,
    declaredKnowledgePointIds:historical.queueAuthority.knowledgePointIds,
    supersededBy:remediation.taskId,
  },
  nextSliceIdentityOnly:{
    queuePosition:q18?.queuePosition,
    sliceId:q18?.sliceId,
    knowledgePointIds:q18?.knowledgePointIds,
  },
  source:{
    title:source?.sourceTitle,
    reviewedPages:source?.reviewedPages,
    sourceRefAmbiguity:remediation.sourceAuthority.sourceRefAmbiguity,
  },
  publicBaseline:{
    sourceCount:BATCH_A_SELECTOR_AVAILABILITY.sourceCount,
    visibleKnowledgePointCount:BATCH_A_SELECTOR_AVAILABILITY.visibleCount,
    sameSourceVisibleCount:publicSource.visibleCount,
    remediationTargetVisible:Boolean(getVisibleBatchAKnowledgePoint(CROSS)),
  },
  scope:{
    remediationTargetKnowledgePointIds:remediation.q017ScopeLock.remediationTargetKnowledgePointIds,
    excludedKnowledgePointIds:remediation.q017ScopeLock.excludedKnowledgePointIdsFromSameSource,
    frozenQueueAuthorityTouched:remediation.q017ScopeLock.frozenQueueAuthorityTouched,
    q018OrLaterTouched:remediation.q017ScopeLock.q018OrLaterTouched,
  },
  next:{
    operatorApprovalAlreadyPresent:remediation.preflightDecision.remediationImplementationApprovedByOperator,
    separateApprovalRequired:remediation.preflightDecision.nextTaskRequiresSeparateImplementationApproval,
    nextTask:remediation.preflightDecision.nextTask,
    q018PreflightBlockedUntilTrueQ017D0:remediation.preflightDecision.q018PreflightBlockedUntilTrueQ017D0,
  },
};
console.log(`P05F_W5_Q017_FROZEN_QUEUE_PARITY_REMEDIATION_PREFLIGHT=${JSON.stringify(report)}`);
if(errors.length)process.exitCode=1;
