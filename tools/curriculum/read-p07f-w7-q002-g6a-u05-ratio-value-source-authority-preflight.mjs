import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p07f/q002-g6a-u05-ratio-value-source-authority-preflight.json",import.meta.url),"utf8"));
const slice=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[1];
const kp="kp_g6a_u05_ratio_value";
if(p.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P07F_W7_Q002_PREFLIGHT_STATUS");
if(slice?.sliceId!=="p07e_q002_r6_g6a_u05_6a05_profile_ratio_percent_c1")throw new Error("P07F_W7_Q002_QUEUE_IDENTITY");
if(slice?.previousSliceId!=="p07e_q001_r5_g6a_u05_6a05_profile_ratio_percent_c1"||slice?.previousSliceMustBeD0Complete!==true)throw new Error("P07F_W7_Q002_PREDECESSOR_IDENTITY");
if(JSON.stringify(slice.knowledgePointIds)!==JSON.stringify([kp]))throw new Error("P07F_W7_Q002_KP_IDENTITY");
if(JSON.stringify(slice.requiredW7CapabilityIds)!==JSON.stringify(["cap_ratio_percent_reasoning","cap_ratio_rate_validator"]))throw new Error("P07F_W7_Q002_W7_CAPABILITY_IDENTITY");
if(p.predecessorD0Evidence.q001Status!=="PASS_E6_D0_COMPLETE"||p.predecessorD0Evidence.exactDeployedAssetDigestParity!==true)throw new Error("P07F_W7_Q002_Q001_D0");
const mapping=getR04KnowledgePointCapabilityMapping(kp);
if(mapping?.primaryRuntimeProfileId!=="profile_ratio_percent")throw new Error("P07F_W7_Q002_PROFILE");
if(mapping?.classificationRuleId!=="rule_ratio_percent")throw new Error("P07F_W7_Q002_CLASSIFICATION_RULE");
if((mapping?.appliedModifierIds??[]).length!==0)throw new Error("P07F_W7_Q002_MODIFIER");
if(p.semanticProfileLock.targetSemanticCore!=="RATIO_VALUE_EQUALS_ANTECEDENT_DIVIDED_BY_NONZERO_CONSEQUENT")throw new Error("P07F_W7_Q002_SEMANTIC_CORE");
if(p.q002ScopeLock.implementationAllowedByThisPreflight!==false||p.q002ScopeLock.publicProductAdmissionAllowedByThisPreflight!==false)throw new Error("P07F_W7_Q002_SCOPE");
console.log(JSON.stringify({
  schemaName:"P07FW7Q002SourceAuthorityPreflightReadbackV1",
  status:"PASS_P07F_W7_Q002_SOURCE_AUTHORITY_PREFLIGHT",
  predecessorQ001D0Status:p.predecessorD0Evidence.q001Status,
  predecessorQ001ExactHeadSha:p.predecessorD0Evidence.q001MergeSha,
  queuePosition:slice.queuePosition,
  sliceId:slice.sliceId,
  previousSliceId:slice.previousSliceId,
  sourceNodeId:slice.primarySourceNodeId,
  knowledgePointIds:[...slice.knowledgePointIds],
  runtimeProfileId:slice.primaryRuntimeProfileId,
  requiredW7CapabilityIds:[...slice.requiredW7CapabilityIds],
  executableR04Mapping:{
    primaryRuntimeProfileId:mapping.primaryRuntimeProfileId,
    classificationRuleId:mapping.classificationRuleId,
    appliedModifierIds:[...mapping.appliedModifierIds],
    requiredRuntimeCapabilityIds:[...mapping.requiredRuntimeCapabilityIds],
    optionalRuntimeCapabilityIds:[...mapping.optionalRuntimeCapabilityIds],
    forbiddenRuntimeCapabilityIds:[...mapping.forbiddenRuntimeCapabilityIds]
  },
  sourceReviewMethod:p.sourceAuthority.currentVisualReadbackAuthority.reviewMethod,
  sourcePdfDriveFileId:p.sourceAuthority.sourcePdfDriveFileId,
  sourcePdfSha256:p.sourceAuthority.sourcePdfSha256,
  targetEvidencePages:p.sourceAuthority.evidenceResolution.exactQ002DirectVisualAnchorPages,
  r02CandidateEvidencePages:p.r02ReviewedCandidateAuthority.targetCandidate.evidencePages,
  semanticCore:p.semanticProfileLock.targetSemanticCore,
  predecessorOwnedKnowledgePointIds:p.r02ReviewedCandidateAuthority.predecessorOwnedKnowledgePointRows.map(x=>x.knowledgePointId),
  protectedFutureSameSourceKnowledgePointIds:p.r02ReviewedCandidateAuthority.futureOwnedKnowledgePointRows.map(x=>x.knowledgePointId),
  nextTask:p.preflightDecision.nextTask
},null,2));
