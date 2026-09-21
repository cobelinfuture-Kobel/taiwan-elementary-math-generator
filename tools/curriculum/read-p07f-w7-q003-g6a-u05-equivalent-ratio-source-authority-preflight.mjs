import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p07f/q003-g6a-u05-equivalent-ratio-source-authority-preflight.json",import.meta.url),"utf8"));
const kp="kp_g6a_u05_equivalent_ratio";
const slice=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[2];
const r04=getR04KnowledgePointCapabilityMapping(kp);
const r05=getR05DeliveryWaveAssignment(kp);
if(p.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P07F_W7_Q003_PREFLIGHT_STATUS");
if(slice?.sliceId!=="p07e_q003_r7_g6a_u05_6a05_profile_integer_operations_c1")throw new Error("P07F_W7_Q003_QUEUE_IDENTITY");
if(slice?.previousSliceId!=="p07e_q002_r6_g6a_u05_6a05_profile_ratio_percent_c1")throw new Error("P07F_W7_Q003_PREDECESSOR_IDENTITY");
if(r05?.primaryRuntimeProfileId!=="profile_integer_operations")throw new Error("P07F_W7_Q003_FROZEN_PROFILE");
if(r04?.primaryRuntimeProfileId!==r05?.primaryRuntimeProfileId)throw new Error("P07F_W7_Q003_R04_R05_PROFILE_DIVERGENCE");
if(p.semanticProfileLock.targetSemanticCore!=="EQUIVALENT_RATIO_PRESERVES_RATIO_VALUE_UNDER_COMMON_NONZERO_SCALE_FACTOR")throw new Error("P07F_W7_Q003_SEMANTIC_CORE");
if(p.q003ScopeLock.implementationAllowedByThisPreflight!==false||p.q003ScopeLock.publicProductAdmissionAllowedByThisPreflight!==false)throw new Error("P07F_W7_Q003_SCOPE");
console.log(JSON.stringify({
  schemaName:"P07FW7Q003SourceAuthorityPreflightReadbackV1",
  status:"PASS_P07F_W7_Q003_SOURCE_AUTHORITY_PREFLIGHT",
  predecessorQ002D0Status:p.predecessorD0Evidence.q002Status,
  predecessorQ002ExactHeadSha:p.predecessorD0Evidence.q002MergeSha,
  queuePosition:slice.queuePosition,
  sliceId:slice.sliceId,
  sourceNodeId:slice.primarySourceNodeId,
  knowledgePointIds:[...slice.knowledgePointIds],
  frozenQueueRuntimeProfileId:slice.primaryRuntimeProfileId,
  requiredW7CapabilityIds:[...slice.requiredW7CapabilityIds],
  executableR04Mapping:{
    primaryRuntimeProfileId:r04.primaryRuntimeProfileId,
    classificationRuleId:r04.classificationRuleId,
    appliedModifierIds:[...r04.appliedModifierIds],
    requiredRuntimeCapabilityIds:[...r04.requiredRuntimeCapabilityIds],
    optionalRuntimeCapabilityIds:[...r04.optionalRuntimeCapabilityIds],
    forbiddenRuntimeCapabilityIds:[...r04.forbiddenRuntimeCapabilityIds]
  },
  r05Assignment:{
    baseDeliveryWaveId:r05.baseDeliveryWaveId,
    deliveryWaveId:r05.deliveryWaveId,
    waveEscalatedByPrerequisite:r05.waveEscalatedByPrerequisite,
    prerequisiteWaveLowerBound:r05.prerequisiteWaveLowerBound,
    intraWavePrerequisiteRank:r05.intraWavePrerequisiteRank
  },
  targetEvidencePages:p.sourceAuthority.evidenceResolution.exactQ003DirectVisualAnchorPages,
  semanticCore:p.semanticProfileLock.targetSemanticCore,
  nextTask:p.preflightDecision.nextTask
},null,2));
