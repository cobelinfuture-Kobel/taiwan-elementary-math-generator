import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p06f/q012-g5b-u11-two-series-line-chart-source-authority-preflight.json",import.meta.url),"utf8"));
const slice=materializeP06EW6DirectProductVerticalSliceQueue().queueEntries[11];
const targets=["kp_g5b_u11_compare_two_data_series","kp_g5b_u11_construct_line_chart","kp_g5b_u11_line_chart_trend"];

if(p.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P06F_W6_Q012_PREFLIGHT_STATUS");
if(slice?.sliceId!=="p06e_q012_r3_g5b_u11_5b11_profile_chart_data_c1")throw new Error("P06F_W6_Q012_QUEUE_IDENTITY");
if(JSON.stringify(slice.knowledgePointIds)!==JSON.stringify(targets))throw new Error("P06F_W6_Q012_KP_IDENTITY");
if(p.predecessorD0Evidence.immediatePredecessor.liveReportStatus!=="PASS_E6_D0_COMPLETE")throw new Error("P06F_W6_Q012_Q011_PREDECESSOR_D0");
for(const id of targets){
  const mapping=getR04KnowledgePointCapabilityMapping(id);
  if(mapping?.primaryRuntimeProfileId!=="profile_chart_data")throw new Error(`P06F_W6_Q012_PROFILE:${id}`);
}
if(p.q012ScopeLock.implementationAllowedByThisPreflight!==false||p.q012ScopeLock.publicProductAdmissionAllowedByThisPreflight!==false)throw new Error("P06F_W6_Q012_SCOPE");

console.log(JSON.stringify({
  schemaName:"P06FW6Q012SourceAuthorityPreflightReadbackV1",
  status:"PASS_P06F_W6_Q012_SOURCE_AUTHORITY_PREFLIGHT",
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
