import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p06f/q015-g6a-u03-symbolic-quantity-relation-source-authority-preflight.json",import.meta.url),"utf8"));
const slice=materializeP06EW6DirectProductVerticalSliceQueue().queueEntries[14];
const target="kp_g6a_u03_symbolic_quantity_relation";

if(p.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P06F_W6_Q015_PREFLIGHT_STATUS");
if(slice?.sliceId!=="p06e_q015_r6_g6a_u03_6a03_profile_pattern_relation_c1")throw new Error("P06F_W6_Q015_QUEUE_IDENTITY");
if(JSON.stringify(slice.knowledgePointIds)!==JSON.stringify([target]))throw new Error("P06F_W6_Q015_KP_IDENTITY");
if(p.predecessorD0Evidence.immediatePredecessor.liveReportStatus!=="PASS_E6_D0_COMPLETE")throw new Error("P06F_W6_Q015_Q014_PREDECESSOR_D0");
const mapping=getR04KnowledgePointCapabilityMapping(target);
if(mapping?.primaryRuntimeProfileId!=="profile_pattern_relation")throw new Error("P06F_W6_Q015_PROFILE");
if(p.q015ScopeLock.implementationAllowedByThisPreflight!==false||p.q015ScopeLock.publicProductAdmissionAllowedByThisPreflight!==false)throw new Error("P06F_W6_Q015_SCOPE");

console.log(JSON.stringify({
  schemaName:"P06FW6Q015SourceAuthorityPreflightReadbackV1",
  status:"PASS_P06F_W6_Q015_SOURCE_AUTHORITY_PREFLIGHT",
  queuePosition:slice.queuePosition,
  sliceId:slice.sliceId,
  sourceNodeId:slice.primarySourceNodeId,
  knowledgePointIds:[...slice.knowledgePointIds],
  runtimeProfileId:slice.primaryRuntimeProfileId,
  requiredW6CapabilityIds:[...slice.requiredW6CapabilityIds],
  optionalSymbolicRuntimeCapability:p.runtimeCapabilityAuthority.profileOptionalCapabilityIds,
  predecessorD0:p.predecessorD0Evidence.immediatePredecessor.liveReportStatus,
  sourceReviewMethod:p.sourceAuthority.reviewMethod,
  targetEvidencePages:p.r02ReviewedCandidateAuthority.targetCandidate.evidencePages,
  futureSameSourceKnowledgePointIds:p.r02ReviewedCandidateAuthority.reservedW6SuccessorKnowledgePointIds,
  nextTask:p.preflightDecision.nextTask
},null,2));
