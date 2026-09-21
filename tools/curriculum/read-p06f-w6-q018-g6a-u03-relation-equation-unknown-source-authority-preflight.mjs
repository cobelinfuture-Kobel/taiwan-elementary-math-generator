import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p06f/q018-g6a-u03-relation-equation-unknown-source-authority-preflight.json",import.meta.url),"utf8"));
const slice=materializeP06EW6DirectProductVerticalSliceQueue().queueEntries[17];
const kp="kp_g6a_u03_relation_equation_unknown";
if(p.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P06F_W6_Q018_PREFLIGHT_STATUS");
if(slice?.sliceId!=="p06e_q018_r9_g6a_u03_6a03_profile_pattern_relation_c1")throw new Error("P06F_W6_Q018_QUEUE_IDENTITY");
if(JSON.stringify(slice.knowledgePointIds)!==JSON.stringify([kp]))throw new Error("P06F_W6_Q018_KP_IDENTITY");
if(p.predecessorD0Evidence.immediatePredecessor.liveReportStatus!=="PASS_E6_D0_COMPLETE")throw new Error("P06F_W6_Q018_Q017_PREDECESSOR_D0");
const mapping=getR04KnowledgePointCapabilityMapping(kp);
if(mapping?.primaryRuntimeProfileId!=="profile_pattern_relation")throw new Error("P06F_W6_Q018_PROFILE");
if(p.q018ScopeLock.implementationAllowedByThisPreflight!==false||p.q018ScopeLock.publicProductAdmissionAllowedByThisPreflight!==false)throw new Error("P06F_W6_Q018_SCOPE");
console.log(JSON.stringify({
  schemaName:"P06FW6Q018SourceAuthorityPreflightReadbackV1",
  status:"PASS_P06F_W6_Q018_SOURCE_AUTHORITY_PREFLIGHT",
  queuePosition:slice.queuePosition,
  sliceId:slice.sliceId,
  sourceNodeId:slice.primarySourceNodeId,
  knowledgePointIds:[...slice.knowledgePointIds],
  runtimeProfileId:slice.primaryRuntimeProfileId,
  requiredW6CapabilityIds:[...slice.requiredW6CapabilityIds],
  predecessorD0:p.predecessorD0Evidence.immediatePredecessor.liveReportStatus,
  sourceReviewMethod:p.sourceAuthority.reviewMethod,
  targetEvidencePages:p.sourceAuthority.directPageEvidence.targetEvidencePages,
  predecessorOwnedKnowledgePointIds:p.r02ReviewedCandidateAuthority.predecessorOwnedKnowledgePointIds,
  sameSourceCandidateSetCompleteAfterQ018:p.r02ReviewedCandidateAuthority.sameSourceCandidateSetCompleteAfterQ018,
  nextTask:p.preflightDecision.nextTask
},null,2));
