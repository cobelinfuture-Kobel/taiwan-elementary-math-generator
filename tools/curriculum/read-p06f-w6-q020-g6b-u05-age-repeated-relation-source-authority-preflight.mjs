import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p06f/q020-g6b-u05-age-repeated-relation-source-authority-preflight.json",import.meta.url),"utf8"));
const slice=materializeP06EW6DirectProductVerticalSliceQueue().queueEntries[19];
const kp="kp_g6b_u05_age_or_repeated_relation_problem";
if(p.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P06F_W6_Q020_PREFLIGHT_STATUS");
if(slice?.sliceId!=="p06e_q020_r11_g6b_u05_6b05_profile_word_problem_c1")throw new Error("P06F_W6_Q020_QUEUE_IDENTITY");
if(JSON.stringify(slice.knowledgePointIds)!==JSON.stringify([kp]))throw new Error("P06F_W6_Q020_KP_IDENTITY");
if(JSON.stringify(slice.requiredW6CapabilityIds)!==JSON.stringify(["cap_symbolic_relation_reasoning"]))throw new Error("P06F_W6_Q020_W6_CAPABILITY_IDENTITY");
if(p.predecessorD0Evidence.immediatePredecessor.liveReportStatus!=="PASS_E6_D0_COMPLETE")throw new Error("P06F_W6_Q020_Q019_PREDECESSOR_D0");
if(p.predecessorD0Evidence.postMergeFullRegressionAttribution.addedFailureCount!==0)throw new Error("P06F_W6_Q020_Q019_CAUSAL_REGRESSION");
const mapping=getR04KnowledgePointCapabilityMapping(kp);
if(mapping?.primaryRuntimeProfileId!=="profile_word_problem")throw new Error("P06F_W6_Q020_PROFILE");
if(mapping?.classificationRuleId!=="rule_word_problem")throw new Error("P06F_W6_Q020_CLASSIFICATION_RULE");
if(p.semanticProfileLock.targetSemanticCore!=="AGE_DIFFERENCE_INVARIANT_UNDER_EQUAL_TIME_SHIFT")throw new Error("P06F_W6_Q020_SEMANTIC_CORE");
if(p.q020ScopeLock.implementationAllowedByThisPreflight!==false||p.q020ScopeLock.publicProductAdmissionAllowedByThisPreflight!==false)throw new Error("P06F_W6_Q020_SCOPE");
console.log(JSON.stringify({
  schemaName:"P06FW6Q020SourceAuthorityPreflightReadbackV1",
  status:"PASS_P06F_W6_Q020_SOURCE_AUTHORITY_PREFLIGHT",
  queuePosition:slice.queuePosition,
  isFinalFrozenW6Slice:p.queueAuthority.isFinalFrozenW6Slice,
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
  q019PostMergeAttribution:p.predecessorD0Evidence.postMergeFullRegressionAttribution.classification,
  sourceReviewMethod:p.sourceAuthority.reviewMethod,
  sourcePdfSha256:p.sourceAuthority.sourcePdfSha256,
  targetEvidencePages:p.sourceAuthority.visualReadback.targetEvidencePages,
  r02CandidateEvidencePages:p.r02ReviewedCandidateAuthority.targetCandidate.evidencePages,
  semanticCore:p.semanticProfileLock.targetSemanticCore,
  profileSemanticAlignment:p.runtimeCapabilityAuthority.profileSemanticAlignment.classification,
  protectedSameSourceKnowledgePointIds:p.r02ReviewedCandidateAuthority.nonQ020SameSourceKnowledgePointIds,
  nextTask:p.preflightDecision.nextTask
},null,2));
