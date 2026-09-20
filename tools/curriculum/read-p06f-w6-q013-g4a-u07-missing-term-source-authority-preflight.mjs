import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p06f/q013-g4a-u07-missing-term-source-authority-preflight.json",import.meta.url),"utf8"));
const slice=materializeP06EW6DirectProductVerticalSliceQueue().queueEntries[12];
const target="kp_g4a_u07_pattern_missing_term_reasoning";

if(p.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P06F_W6_Q013_PREFLIGHT_STATUS");
if(slice?.sliceId!=="p06e_q013_r4_g4a_u07_4a07_profile_pattern_relation_c1")throw new Error("P06F_W6_Q013_QUEUE_IDENTITY");
if(JSON.stringify(slice.knowledgePointIds)!==JSON.stringify([target]))throw new Error("P06F_W6_Q013_KP_IDENTITY");
if(p.predecessorD0Evidence.immediatePredecessor.liveReportStatus!=="PASS_E6_D0_COMPLETE")throw new Error("P06F_W6_Q013_Q012_PREDECESSOR_D0");
const mapping=getR04KnowledgePointCapabilityMapping(target);
if(mapping?.primaryRuntimeProfileId!=="profile_pattern_relation")throw new Error("P06F_W6_Q013_PROFILE");
if(p.q013ScopeLock.implementationAllowedByThisPreflight!==false||p.q013ScopeLock.publicProductAdmissionAllowedByThisPreflight!==false)throw new Error("P06F_W6_Q013_SCOPE");

console.log(JSON.stringify({
  schemaName:"P06FW6Q013SourceAuthorityPreflightReadbackV1",
  status:"PASS_P06F_W6_Q013_SOURCE_AUTHORITY_PREFLIGHT",
  queuePosition:slice.queuePosition,
  sliceId:slice.sliceId,
  sourceNodeId:slice.primarySourceNodeId,
  knowledgePointIds:[...slice.knowledgePointIds],
  runtimeProfileId:slice.primaryRuntimeProfileId,
  predecessorD0:p.predecessorD0Evidence.immediatePredecessor.liveReportStatus,
  sourceReviewMethod:p.sourceAuthority.reviewMethod,
  protectedPredecessorKnowledgePointIds:p.r02ReviewedCandidateAuthority.protectedPredecessorKnowledgePointIds,
  sameSourceCandidateSetCompleteAfterQ013:p.r02ReviewedCandidateAuthority.sameSourceCandidateSetCompleteAfterQ013,
  nextTask:p.preflightDecision.nextTask
},null,2));
