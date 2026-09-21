import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p07f/q004-g6a-u06-pi-circumference-relation-source-authority-preflight.json",import.meta.url),"utf8"));
const kp="kp_g6a_u06_pi_circumference_relation";
const slice=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[3];
const r04=getR04KnowledgePointCapabilityMapping(kp);
const r05=getR05DeliveryWaveAssignment(kp);
if(p.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P07F_W7_Q004_PREFLIGHT_STATUS");
if(slice?.sliceId!=="p07e_q004_r7_g6a_u06_6a06_profile_geometry_formula_c1")throw new Error("P07F_W7_Q004_QUEUE_IDENTITY");
if(slice?.previousSliceId!=="p07e_q003_r7_g6a_u05_6a05_profile_integer_operations_c1")throw new Error("P07F_W7_Q004_PREDECESSOR_IDENTITY");
if(r04?.primaryRuntimeProfileId!=="profile_geometry_formula"||r05?.primaryRuntimeProfileId!=="profile_geometry_formula")throw new Error("P07F_W7_Q004_PROFILE");
if(JSON.stringify(r04?.appliedModifierIds)!==JSON.stringify(p.runtimeCapabilityAuthority.executableR04Mapping.appliedModifierIds))throw new Error("P07F_W7_Q004_MODIFIER_PARITY");
if(JSON.stringify(r04?.requiredRuntimeCapabilityIds)!==JSON.stringify(p.runtimeCapabilityAuthority.executableR04Mapping.requiredRuntimeCapabilityIds))throw new Error("P07F_W7_Q004_RUNTIME_CAPABILITY_PARITY");
if(p.semanticProfileLock.targetSemanticCore!=="CIRCUMFERENCE_DIVIDED_BY_DIAMETER_APPROX_PI")throw new Error("P07F_W7_Q004_SEMANTIC_CORE");
if(p.q004ScopeLock.implementationAllowedByThisPreflight!==false||p.q004ScopeLock.publicProductAdmissionAllowedByThisPreflight!==false)throw new Error("P07F_W7_Q004_SCOPE");
console.log(JSON.stringify({
  schemaName:"P07FW7Q004SourceAuthorityPreflightReadbackV1",
  status:"PASS_P07F_W7_Q004_SOURCE_AUTHORITY_PREFLIGHT",
  predecessorQ003D0Status:p.predecessorD0Evidence.q003Status,
  predecessorQ003ExactHeadSha:p.predecessorD0Evidence.q003MergeSha,
  queuePosition:slice.queuePosition,
  sliceId:slice.sliceId,
  previousSliceId:slice.previousSliceId,
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
  sourcePdfDriveFileId:p.sourceAuthority.sourcePdfDriveFileId,
  sourcePdfSha256:p.sourceAuthority.sourcePdfSha256,
  targetEvidencePages:p.sourceAuthority.evidenceResolution.exactQ004ReviewedEvidencePages,
  currentVisualSupportLevel:p.sourceAuthority.directPageEvidence.pages1To2.currentVisualSupportLevel,
  semanticCore:p.semanticProfileLock.targetSemanticCore,
  nextTask:p.preflightDecision.nextTask
},null,2));
