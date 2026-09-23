import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p06f/q009-g4b-u05-chart-construction-missing-compare-source-authority-preflight.json",import.meta.url),"utf8"));
const slice=materializeP06EW6DirectProductVerticalSliceQueue().queueEntries[8];
const expected=["kp_g4b_u05_bar_chart_construction","kp_g4b_u05_chart_missing_value_total","kp_g4b_u05_multi_category_chart_compare"];

if(p.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P06F_W6_Q009_PREFLIGHT_STATUS");
if(slice?.sliceId!=="p06e_q009_r2_g4b_u05_4b05_profile_chart_data_c1")throw new Error("P06F_W6_Q009_QUEUE_IDENTITY");
if(JSON.stringify(slice.knowledgePointIds)!==JSON.stringify(expected))throw new Error("P06F_W6_Q009_KP_IDENTITY");
if(p.predecessorD0Evidence.immediatePredecessor.liveReportStatus!=="PASS_E6_D0_COMPLETE")throw new Error("P06F_W6_Q009_Q008_PREDECESSOR_D0");
if(p.predecessorD0Evidence.sameSourcePredecessor.liveReportStatus!=="PASS_E6_D0_COMPLETE")throw new Error("P06F_W6_Q009_Q007_PREDECESSOR_D0");
for(const kp of expected){
  const mapping=getR04KnowledgePointCapabilityMapping(kp);
  if(mapping?.primaryRuntimeProfileId!=="profile_chart_data")throw new Error(`P06F_W6_Q009_PROFILE:${kp}`);
}
if(p.q009ScopeLock.implementationAllowedByThisPreflight!==false||p.q009ScopeLock.publicProductAdmissionAllowedByThisPreflight!==false)throw new Error("P06F_W6_Q009_SCOPE");

console.log(JSON.stringify({
  schemaName:"P06FW6Q009SourceAuthorityPreflightReadbackV1",
  status:"PASS_P06F_W6_Q009_SOURCE_AUTHORITY_PREFLIGHT",
  queuePosition:slice.queuePosition,
  sliceId:slice.sliceId,
  sourceNodeId:slice.primarySourceNodeId,
  knowledgePointIds:[...slice.knowledgePointIds],
  runtimeProfileId:slice.primaryRuntimeProfileId,
  immediatePredecessorD0:p.predecessorD0Evidence.immediatePredecessor.liveReportStatus,
  sameSourcePredecessorD0:p.predecessorD0Evidence.sameSourcePredecessor.liveReportStatus,
  sourceReviewMethod:p.sourceAuthority.reviewMethod,
  nextTask:p.preflightDecision.nextTask
},null,2));
