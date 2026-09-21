import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p06f/q014-g6b-u06-pie-chart-part-whole-source-authority-preflight.json",import.meta.url),"utf8"));
const slice=materializeP06EW6DirectProductVerticalSliceQueue().queueEntries[13];
const target="kp_g6b_u06_pie_chart_part_whole";

if(p.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P06F_W6_Q014_PREFLIGHT_STATUS");
if(slice?.sliceId!=="p06e_q014_r5_g6b_u06_6b06_profile_chart_data_c1")throw new Error("P06F_W6_Q014_QUEUE_IDENTITY");
if(JSON.stringify(slice.knowledgePointIds)!==JSON.stringify([target]))throw new Error("P06F_W6_Q014_KP_IDENTITY");
if(p.predecessorD0Evidence.immediatePredecessor.liveReportStatus!=="PASS_E6_D0_COMPLETE")throw new Error("P06F_W6_Q014_Q013_PREDECESSOR_D0");
const mapping=getR04KnowledgePointCapabilityMapping(target);
if(mapping?.primaryRuntimeProfileId!=="profile_chart_data")throw new Error("P06F_W6_Q014_PROFILE");
if(p.q014ScopeLock.implementationAllowedByThisPreflight!==false||p.q014ScopeLock.publicProductAdmissionAllowedByThisPreflight!==false)throw new Error("P06F_W6_Q014_SCOPE");

console.log(JSON.stringify({
  schemaName:"P06FW6Q014SourceAuthorityPreflightReadbackV1",
  status:"PASS_P06F_W6_Q014_SOURCE_AUTHORITY_PREFLIGHT",
  queuePosition:slice.queuePosition,
  sliceId:slice.sliceId,
  sourceNodeId:slice.primarySourceNodeId,
  knowledgePointIds:[...slice.knowledgePointIds],
  runtimeProfileId:slice.primaryRuntimeProfileId,
  predecessorD0:p.predecessorD0Evidence.immediatePredecessor.liveReportStatus,
  sourceReviewMethod:p.sourceAuthority.reviewMethod,
  reservedW6SuccessorKnowledgePointIds:p.r02ReviewedCandidateAuthority.reservedW6SuccessorKnowledgePointIds,
  remainingCandidateCountAfterQ014:p.r02ReviewedCandidateAuthority.remainingCandidateCountAfterQ014,
  nextTask:p.preflightDecision.nextTask
},null,2));
