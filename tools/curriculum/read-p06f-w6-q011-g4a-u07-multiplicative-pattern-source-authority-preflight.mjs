import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p06f/q011-g4a-u07-multiplicative-pattern-source-authority-preflight.json",import.meta.url),"utf8"));
const slice=materializeP06EW6DirectProductVerticalSliceQueue().queueEntries[10];
const target="kp_g4a_u07_quantity_multiplicative_pattern";

if(p.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P06F_W6_Q011_PREFLIGHT_STATUS");
if(slice?.sliceId!=="p06e_q011_r3_g4a_u07_4a07_profile_pattern_relation_c1")throw new Error("P06F_W6_Q011_QUEUE_IDENTITY");
if(JSON.stringify(slice.knowledgePointIds)!==JSON.stringify([target]))throw new Error("P06F_W6_Q011_KP_IDENTITY");
if(p.predecessorD0Evidence.immediatePredecessor.liveReportStatus!=="PASS_E6_D0_COMPLETE")throw new Error("P06F_W6_Q011_Q010_PREDECESSOR_D0");
const mapping=getR04KnowledgePointCapabilityMapping(target);
if(mapping?.primaryRuntimeProfileId!=="profile_pattern_relation")throw new Error("P06F_W6_Q011_PROFILE");
if(p.q011ScopeLock.implementationAllowedByThisPreflight!==false||p.q011ScopeLock.publicProductAdmissionAllowedByThisPreflight!==false)throw new Error("P06F_W6_Q011_SCOPE");

console.log(JSON.stringify({
  schemaName:"P06FW6Q011SourceAuthorityPreflightReadbackV1",
  status:"PASS_P06F_W6_Q011_SOURCE_AUTHORITY_PREFLIGHT",
  queuePosition:slice.queuePosition,
  sliceId:slice.sliceId,
  sourceNodeId:slice.primarySourceNodeId,
  knowledgePointIds:[...slice.knowledgePointIds],
  runtimeProfileId:slice.primaryRuntimeProfileId,
  predecessorD0:p.predecessorD0Evidence.immediatePredecessor.liveReportStatus,
  sourceReviewMethod:p.sourceAuthority.reviewMethod,
  protectedPredecessorKnowledgePointIds:p.r02ReviewedCandidateAuthority.protectedPredecessorKnowledgePointIds,
  protectedFutureKnowledgePointIds:p.r02ReviewedCandidateAuthority.protectedSameSourceFutureCandidates.map(x=>x.knowledgePointId),
  nextTask:p.preflightDecision.nextTask
},null,2));
