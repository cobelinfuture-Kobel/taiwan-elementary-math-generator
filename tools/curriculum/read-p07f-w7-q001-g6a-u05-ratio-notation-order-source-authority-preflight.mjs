import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p07f/q001-g6a-u05-ratio-notation-order-source-authority-preflight.json",import.meta.url),"utf8"));
const slice=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[0];
const kp="kp_g6a_u05_ratio_notation_order";
if(p.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P07F_W7_Q001_PREFLIGHT_STATUS");
if(slice?.sliceId!=="p07e_q001_r5_g6a_u05_6a05_profile_ratio_percent_c1")throw new Error("P07F_W7_Q001_QUEUE_IDENTITY");
if(JSON.stringify(slice.knowledgePointIds)!==JSON.stringify([kp]))throw new Error("P07F_W7_Q001_KP_IDENTITY");
if(JSON.stringify(slice.requiredW7CapabilityIds)!==JSON.stringify(["cap_ratio_percent_reasoning","cap_ratio_rate_validator"]))throw new Error("P07F_W7_Q001_W7_CAPABILITY_IDENTITY");
const mapping=getR04KnowledgePointCapabilityMapping(kp);
if(mapping?.primaryRuntimeProfileId!=="profile_ratio_percent")throw new Error("P07F_W7_Q001_PROFILE");
if(mapping?.classificationRuleId!=="rule_ratio_percent")throw new Error("P07F_W7_Q001_CLASSIFICATION_RULE");
if((mapping?.appliedModifierIds??[]).length!==0)throw new Error("P07F_W7_Q001_MODIFIER");
if(p.semanticProfileLock.targetSemanticCore!=="ORDERED_RATIO_NOTATION_WITH_FIXED_ANTECEDENT_CONSEQUENT_ROLES")throw new Error("P07F_W7_Q001_SEMANTIC_CORE");
if(p.q001ScopeLock.implementationAllowedByThisPreflight!==false||p.q001ScopeLock.publicProductAdmissionAllowedByThisPreflight!==false)throw new Error("P07F_W7_Q001_SCOPE");
console.log(JSON.stringify({
  schemaName:"P07FW7Q001SourceAuthorityPreflightReadbackV1",
  status:"PASS_P07F_W7_Q001_SOURCE_AUTHORITY_PREFLIGHT",
  queuePosition:slice.queuePosition,
  sliceId:slice.sliceId,
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
  sourceReviewMethod:p.sourceAuthority.reviewMethod,
  sourcePdfDriveFileId:p.sourceAuthority.sourcePdfDriveFileId,
  sourcePdfSha256:p.sourceAuthority.sourcePdfSha256,
  targetEvidencePages:p.sourceAuthority.evidenceResolution.exactQ001DirectVisualAnchorPages,
  r02CandidateEvidencePages:p.r02ReviewedCandidateAuthority.targetCandidate.evidencePages,
  semanticCore:p.semanticProfileLock.targetSemanticCore,
  protectedFutureSameSourceKnowledgePointIds:p.r02ReviewedCandidateAuthority.futureOwnedKnowledgePointRows.map(x=>x.knowledgePointId),
  nextTask:p.preflightDecision.nextTask
},null,2));
