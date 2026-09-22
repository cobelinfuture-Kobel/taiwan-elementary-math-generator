import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
import {materializeR04SharedRuntimeCapabilityMatrix,getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p07f/q006-g6a-u06-circle-circumference-formula-source-authority-preflight.json",import.meta.url),"utf8"));
const kp="kp_g6a_u06_circle_circumference_formula";
const slice=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[5];
const r04=getR04KnowledgePointCapabilityMapping(kp);
const r05=getR05DeliveryWaveAssignment(kp);
const graph=materializeR04SharedRuntimeCapabilityMatrix().prerequisiteGraph;
const incoming=(graph.incomingByTarget.get(kp)??[]).map(edge=>({
  fromKnowledgePointId:edge.fromKnowledgePointId,
  dependencyStrength:edge.dependencyStrength,
  distanceBearing:edge.distanceBearing,
  alternativeGroupId:edge.alternativeGroupId??null
}));
if(slice?.sliceId!=="p07e_q006_r8_g6a_u06_6a06_profile_geometry_formula_c1")throw new Error("P07F_W7_Q006_QUEUE_IDENTITY");
if(slice?.previousSliceId!=="p07e_q005_r8_g6a_u05_6a05_profile_factor_multiple_c1")throw new Error("P07F_W7_Q006_PREDECESSOR_IDENTITY");
if(r04?.primaryRuntimeProfileId!=="profile_geometry_formula"||r05?.primaryRuntimeProfileId!=="profile_geometry_formula")throw new Error("P07F_W7_Q006_PROFILE");
if(p.semanticProfileLock.targetSemanticCore!=="CIRCLE_CIRCUMFERENCE_FROM_DIAMETER_OR_RADIUS_FORMULA")throw new Error("P07F_W7_Q006_SEMANTIC_CORE");
if(p.q006ScopeLock.implementationAllowedByThisPreflight!==false||p.q006ScopeLock.publicProductAdmissionAllowedByThisPreflight!==false)throw new Error("P07F_W7_Q006_SCOPE");
console.log(JSON.stringify({
  schemaName:"P07FW7Q006SourceAuthorityPreflightReadbackV1",
  status:"PASS_P07F_W7_Q006_SOURCE_AUTHORITY_PREFLIGHT_READBACK",
  predecessorQ005D0Status:p.predecessorD0Evidence.q005Status,
  predecessorQ005ExactHeadSha:p.predecessorD0Evidence.q005MergeSha,
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
  incomingPrerequisiteEdges:incoming,
  sourcePdfDriveFileId:p.sourceAuthority.sourcePdfDriveFileId,
  sourcePdfSha256:p.sourceAuthority.sourcePdfSha256,
  targetEvidencePages:p.sourceAuthority.evidenceResolution.exactQ006ReviewedEvidencePages,
  currentVisualSupportLevel:p.sourceAuthority.evidenceResolution.currentVisualSupportLevel,
  semanticCore:p.semanticProfileLock.targetSemanticCore,
  nextTask:p.preflightDecision.nextTask
},null,2));
