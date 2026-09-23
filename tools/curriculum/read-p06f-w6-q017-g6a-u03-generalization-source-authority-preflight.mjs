import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p06f/q017-g6a-u03-generalization-source-authority-preflight.json",import.meta.url),"utf8"));
const slice=materializeP06EW6DirectProductVerticalSliceQueue().queueEntries[16];
const targets=["kp_g6a_u03_geometric_count_generalization","kp_g6a_u03_input_output_general_rule","kp_g6a_u03_linear_pattern_nth_term"];

if(p.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P06F_W6_Q017_PREFLIGHT_STATUS");
if(slice?.sliceId!=="p06e_q017_r7_g6a_u03_6a03_profile_pattern_relation_c1")throw new Error("P06F_W6_Q017_QUEUE_IDENTITY");
if(JSON.stringify(slice.knowledgePointIds)!==JSON.stringify(targets))throw new Error("P06F_W6_Q017_KP_IDENTITY");
if(p.predecessorD0Evidence.immediatePredecessor.liveReportStatus!=="PASS_E6_D0_COMPLETE")throw new Error("P06F_W6_Q017_Q016_PREDECESSOR_D0");
for(const id of targets){
  const mapping=getR04KnowledgePointCapabilityMapping(id);
  if(mapping?.primaryRuntimeProfileId!=="profile_pattern_relation")throw new Error("P06F_W6_Q017_PROFILE:"+id);
}
if(p.q017ScopeLock.implementationAllowedByThisPreflight!==false||p.q017ScopeLock.publicProductAdmissionAllowedByThisPreflight!==false)throw new Error("P06F_W6_Q017_SCOPE");

console.log(JSON.stringify({
  schemaName:"P06FW6Q017SourceAuthorityPreflightReadbackV1",
  status:"PASS_P06F_W6_Q017_SOURCE_AUTHORITY_PREFLIGHT",
  queuePosition:slice.queuePosition,
  sliceId:slice.sliceId,
  sourceNodeId:slice.primarySourceNodeId,
  knowledgePointIds:[...slice.knowledgePointIds],
  runtimeProfileId:slice.primaryRuntimeProfileId,
  requiredW6CapabilityIds:[...slice.requiredW6CapabilityIds],
  predecessorD0:p.predecessorD0Evidence.immediatePredecessor.liveReportStatus,
  sourceReviewMethod:p.sourceAuthority.reviewMethod,
  targetEvidenceByKnowledgePoint:p.sourceAuthority.directPageEvidence.targetEvidenceByKnowledgePoint,
  q015PredecessorKnowledgePointIds:p.r02ReviewedCandidateAuthority.predecessorOwnedKnowledgePointIds,
  q018ReservedKnowledgePointIds:p.r02ReviewedCandidateAuthority.reservedQ018KnowledgePointIds,
  nextTask:p.preflightDecision.nextTask
},null,2));
