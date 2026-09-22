import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
import {materializeR04SharedRuntimeCapabilityMatrix,getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p07f/q007-g6a-u09-scale-factor-length-source-authority-preflight.json",import.meta.url),"utf8"));
const kp="kp_g6a_u09_scale_factor_length";
const slice=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[6];
const r04=getR04KnowledgePointCapabilityMapping(kp);
const r05=getR05DeliveryWaveAssignment(kp);
const graph=materializeR04SharedRuntimeCapabilityMatrix().prerequisiteGraph;
const incoming=(graph.incomingByTarget.get(kp)??[]).map(edge=>({
  fromKnowledgePointId:edge.fromKnowledgePointId,
  dependencyStrength:edge.dependencyStrength,
  distanceBearing:edge.distanceBearing,
  alternativeGroupId:edge.alternativeGroupId??null
}));
if(slice?.sliceId!=="p07e_q007_r8_g6a_u09_6a09_profile_quantity_measurement_c1")throw new Error("P07F_W7_Q007_QUEUE_IDENTITY");
if(slice?.previousSliceId!=="p07e_q006_r8_g6a_u06_6a06_profile_geometry_formula_c1")throw new Error("P07F_W7_Q007_PREDECESSOR_IDENTITY");
if(r04?.primaryRuntimeProfileId!=="profile_quantity_measurement"||r05?.primaryRuntimeProfileId!=="profile_quantity_measurement")throw new Error("P07F_W7_Q007_PROFILE");
if(p.semanticProfileLock.targetSemanticCore!=="CORRESPONDING_LENGTHS_SHARE_ONE_POSITIVE_NONZERO_SCALE_FACTOR")throw new Error("P07F_W7_Q007_SEMANTIC_CORE");
if(p.q007ScopeLock.implementationAllowedByThisPreflight!==false||p.q007ScopeLock.publicProductAdmissionAllowedByThisPreflight!==false)throw new Error("P07F_W7_Q007_SCOPE");
console.log(JSON.stringify({
  schemaName:"P07FW7Q007SourceAuthorityPreflightReadbackV1",
  status:"PASS_P07F_W7_Q007_SOURCE_AUTHORITY_PREFLIGHT_READBACK",
  predecessorQ006D0Status:p.predecessorD0Evidence.q006Status,
  predecessorQ006ExactHeadSha:p.predecessorD0Evidence.q006MergeSha,
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
  sourcePdfSizeBytes:p.sourceAuthority.sourcePdfSizeBytes,
  sourcePdfSha256:p.sourceAuthority.sourcePdfSha256,
  targetEvidencePages:p.sourceAuthority.evidenceResolution.exactQ007ReviewedEvidencePages,
  currentVisualSupportLevel:p.sourceAuthority.evidenceResolution.currentVisualSupportLevel,
  directVisualLengthPairs:p.sourceAuthority.currentVisualReadbackAuthority.q007DirectVisualEvidence.visibleCorrespondingLengthPairs,
  auxiliaryVerificationNotesStatus:p.sourceAuthority.auxiliaryDriveMetadata.verificationNotesStatus,
  semanticCore:p.semanticProfileLock.targetSemanticCore,
  nextTask:p.preflightDecision.nextTask
},null,2));
