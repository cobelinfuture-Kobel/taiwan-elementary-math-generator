import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p06f/q016-g6b-u06-compare-pie-charts-source-authority-preflight.json",import.meta.url),"utf8"));
const slice=materializeP06EW6DirectProductVerticalSliceQueue().queueEntries[15];
const target="kp_g6b_u06_compare_pie_charts";

if(p.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P06F_W6_Q016_PREFLIGHT_STATUS");
if(slice?.sliceId!=="p06e_q016_r6_g6b_u06_6b06_profile_chart_data_c1")throw new Error("P06F_W6_Q016_QUEUE_IDENTITY");
if(JSON.stringify(slice.knowledgePointIds)!==JSON.stringify([target]))throw new Error("P06F_W6_Q016_KP_IDENTITY");
if(p.predecessorD0Evidence.immediatePredecessor.liveReportStatus!=="PASS_E6_D0_COMPLETE")throw new Error("P06F_W6_Q016_Q015_PREDECESSOR_D0");
const mapping=getR04KnowledgePointCapabilityMapping(target);
if(mapping?.primaryRuntimeProfileId!=="profile_chart_data")throw new Error("P06F_W6_Q016_PROFILE");
if(p.q016ScopeLock.implementationAllowedByThisPreflight!==false||p.q016ScopeLock.publicProductAdmissionAllowedByThisPreflight!==false)throw new Error("P06F_W6_Q016_SCOPE");

console.log(JSON.stringify({
  schemaName:"P06FW6Q016SourceAuthorityPreflightReadbackV1",
  status:"PASS_P06F_W6_Q016_SOURCE_AUTHORITY_PREFLIGHT",
  queuePosition:slice.queuePosition,
  sliceId:slice.sliceId,
  sourceNodeId:slice.primarySourceNodeId,
  knowledgePointIds:[...slice.knowledgePointIds],
  runtimeProfileId:slice.primaryRuntimeProfileId,
  requiredW6CapabilityIds:[...slice.requiredW6CapabilityIds],
  predecessorD0:p.predecessorD0Evidence.immediatePredecessor.liveReportStatus,
  sourceReviewMethod:p.sourceAuthority.reviewMethod,
  targetEvidencePages:p.r02ReviewedCandidateAuthority.targetCandidate.evidencePages,
  q014PredecessorKnowledgePointIds:p.r02ReviewedCandidateAuthority.predecessorOwnedKnowledgePointIds,
  sameSourceNonQ016KnowledgePointIds:p.r02ReviewedCandidateAuthority.sameSourceNonQ016KnowledgePointIds,
  nextTask:p.preflightDecision.nextTask
},null,2));
