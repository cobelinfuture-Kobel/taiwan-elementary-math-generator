import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p06f/q010-g5b-u11-bar-line-read-broken-axis-source-authority-preflight.json",import.meta.url),"utf8"));
const slice=materializeP06EW6DirectProductVerticalSliceQueue().queueEntries[9];
const expected=["kp_g5b_u11_bar_line_chart_reading","kp_g5b_u11_chart_scale_broken_axis"];

if(p.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P06F_W6_Q010_PREFLIGHT_STATUS");
if(slice?.sliceId!=="p06e_q010_r2_g5b_u11_5b11_profile_chart_data_c1")throw new Error("P06F_W6_Q010_QUEUE_IDENTITY");
if(JSON.stringify(slice.knowledgePointIds)!==JSON.stringify(expected))throw new Error("P06F_W6_Q010_KP_IDENTITY");
if(p.predecessorD0Evidence.liveReportStatus!=="PASS_E6_D0_COMPLETE")throw new Error("P06F_W6_Q010_Q009_PREDECESSOR_D0");
for(const kp of expected){
  const mapping=getR04KnowledgePointCapabilityMapping(kp);
  if(mapping?.primaryRuntimeProfileId!=="profile_chart_data")throw new Error(`P06F_W6_Q010_PROFILE:${kp}`);
}
if(p.q010ScopeLock.implementationAllowedByThisPreflight!==false||p.q010ScopeLock.publicProductAdmissionAllowedByThisPreflight!==false)throw new Error("P06F_W6_Q010_SCOPE");

console.log(JSON.stringify({
  schemaName:"P06FW6Q010SourceAuthorityPreflightReadbackV1",
  status:"PASS_P06F_W6_Q010_SOURCE_AUTHORITY_PREFLIGHT",
  queuePosition:slice.queuePosition,
  sliceId:slice.sliceId,
  sourceNodeId:slice.primarySourceNodeId,
  knowledgePointIds:[...slice.knowledgePointIds],
  runtimeProfileId:slice.primaryRuntimeProfileId,
  predecessorD0:p.predecessorD0Evidence.liveReportStatus,
  sourceReviewMethod:p.sourceAuthority.reviewMethod,
  protectedFutureKnowledgePointIds:p.r02ReviewedCandidateAuthority.protectedSameSourceFutureCandidates.map(x=>x.knowledgePointId),
  nextTask:p.preflightDecision.nextTask
},null,2));
