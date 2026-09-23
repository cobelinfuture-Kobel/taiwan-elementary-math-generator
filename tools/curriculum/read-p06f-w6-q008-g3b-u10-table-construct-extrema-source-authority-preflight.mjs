import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p06f/q008-g3b-u10-table-construct-extrema-source-authority-preflight.json",import.meta.url),"utf8"));
const slice=materializeP06EW6DirectProductVerticalSliceQueue().queueEntries[7];
const expected=["kp_construct_two_way_table","kp_table_extrema_and_missing_value"];
if(p.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P06F_W6_Q008_PREFLIGHT_STATUS");
if(slice?.sliceId!=="p06e_q008_r2_g3b_u10_3b10_profile_chart_data_c1")throw new Error("P06F_W6_Q008_QUEUE_IDENTITY");
if(JSON.stringify(slice.knowledgePointIds)!==JSON.stringify(expected))throw new Error("P06F_W6_Q008_KP_IDENTITY");
if(p.predecessorD0Evidence.liveReportStatus!=="PASS_E6_D0_COMPLETE")throw new Error("P06F_W6_Q008_PREDECESSOR_D0");
for(const kp of expected){
  const mapping=getR04KnowledgePointCapabilityMapping(kp);
  if(mapping?.primaryRuntimeProfileId!=="profile_chart_data")throw new Error(`P06F_W6_Q008_PROFILE:${kp}`);
}
if(p.semanticProfileArtifactLock.implementationSemanticLock.barLinePieChartReadingIsCore!==false)throw new Error("P06F_W6_Q008_TABLE_SEMANTIC_LOCK");
if(p.q008ScopeLock.implementationAllowedByThisPreflight!==false||p.q008ScopeLock.publicProductAdmissionAllowedByThisPreflight!==false)throw new Error("P06F_W6_Q008_SCOPE");
console.log(JSON.stringify({
  schemaName:"P06FW6Q008SourceAuthorityPreflightReadbackV1",
  status:"PASS_P06F_W6_Q008_SOURCE_AUTHORITY_PREFLIGHT",
  queuePosition:slice.queuePosition,
  sliceId:slice.sliceId,
  sourceNodeId:slice.primarySourceNodeId,
  knowledgePointIds:[...slice.knowledgePointIds],
  runtimeProfileId:slice.primaryRuntimeProfileId,
  predecessorD0:p.predecessorD0Evidence.liveReportStatus,
  sourceReviewMethod:p.sourceAuthority.reviewMethod,
  nextTask:p.preflightDecision.nextTask
},null,2));
