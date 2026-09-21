import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p06f/q019-g6b-u05-sum-difference-source-authority-preflight.json",import.meta.url),"utf8"));
const slice=materializeP06EW6DirectProductVerticalSliceQueue().queueEntries[18];
const kp="kp_g6b_u05_sum_difference_problem";
if(p.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P06F_W6_Q019_PREFLIGHT_STATUS");
if(slice?.sliceId!=="p06e_q019_r10_g6b_u05_6b05_profile_decimal_c1")throw new Error("P06F_W6_Q019_QUEUE_IDENTITY");
if(JSON.stringify(slice.knowledgePointIds)!==JSON.stringify([kp]))throw new Error("P06F_W6_Q019_KP_IDENTITY");
if(p.predecessorD0Evidence.immediatePredecessor.liveReportStatus!=="PASS_E6_D0_COMPLETE")throw new Error("P06F_W6_Q019_Q018_PREDECESSOR_D0");
if(p.predecessorD0Evidence.postMergeFullRegressionAttribution.addedFailureCount!==0)throw new Error("P06F_W6_Q019_Q018_CAUSAL_REGRESSION");
const mapping=getR04KnowledgePointCapabilityMapping(kp);
if(mapping?.primaryRuntimeProfileId!=="profile_decimal")throw new Error("P06F_W6_Q019_PROFILE");
if(p.semanticProfileLock.targetSemanticCore!=="SUM_DIFFERENCE_TWO_QUANTITY_DECOMPOSITION")throw new Error("P06F_W6_Q019_SEMANTIC_CORE");
if(p.q019ScopeLock.implementationAllowedByThisPreflight!==false||p.q019ScopeLock.publicProductAdmissionAllowedByThisPreflight!==false)throw new Error("P06F_W6_Q019_SCOPE");
console.log(JSON.stringify({
  schemaName:"P06FW6Q019SourceAuthorityPreflightReadbackV1",
  status:"PASS_P06F_W6_Q019_SOURCE_AUTHORITY_PREFLIGHT",
  queuePosition:slice.queuePosition,
  sliceId:slice.sliceId,
  sourceNodeId:slice.primarySourceNodeId,
  knowledgePointIds:[...slice.knowledgePointIds],
  runtimeProfileId:slice.primaryRuntimeProfileId,
  requiredW6CapabilityIds:[...slice.requiredW6CapabilityIds],
  executableR04Mapping:{
    primaryRuntimeProfileId:mapping.primaryRuntimeProfileId,
    classificationRuleId:mapping.classificationRuleId,
    appliedModifierIds:[...mapping.appliedModifierIds],
    requiredRuntimeCapabilityIds:[...mapping.requiredRuntimeCapabilityIds],
    optionalRuntimeCapabilityIds:[...mapping.optionalRuntimeCapabilityIds],
    forbiddenRuntimeCapabilityIds:[...mapping.forbiddenRuntimeCapabilityIds]
  },
  predecessorD0:p.predecessorD0Evidence.immediatePredecessor.liveReportStatus,
  q018PostMergeAttribution:p.predecessorD0Evidence.postMergeFullRegressionAttribution.classification,
  sourceReviewMethod:p.sourceAuthority.reviewMethod,
  sourcePdfSha256:p.sourceAuthority.sourcePdfSha256,
  targetEvidencePages:p.sourceAuthority.visualReadback.targetEvidencePages,
  semanticCore:p.semanticProfileLock.targetSemanticCore,
  profileSemanticMismatch:p.runtimeCapabilityAuthority.profileSemanticMismatch.classification,
  q020ReservedKnowledgePointIds:p.r02ReviewedCandidateAuthority.q020ReservedKnowledgePointIds,
  nextTask:p.preflightDecision.nextTask
},null,2));
