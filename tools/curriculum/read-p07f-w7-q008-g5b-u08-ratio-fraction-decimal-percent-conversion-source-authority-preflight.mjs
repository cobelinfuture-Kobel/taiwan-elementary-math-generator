import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
import {materializeR04SharedRuntimeCapabilityMatrix,getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p07f/q008-g5b-u08-ratio-fraction-decimal-percent-conversion-source-authority-preflight.json",import.meta.url),"utf8"));
const kp="kp_g5b_u08_ratio_fraction_decimal_percent_conversion";
const queue=materializeP07EW7DirectProductVerticalSliceQueue();
const slice=queue.queueEntries[7];
const r04=getR04KnowledgePointCapabilityMapping(kp);
const r05=getR05DeliveryWaveAssignment(kp);
const graph=materializeR04SharedRuntimeCapabilityMatrix().prerequisiteGraph;
const incoming=(graph.incomingByTarget.get(kp)??[]).map(edge=>({
  fromKnowledgePointId:edge.fromKnowledgePointId,
  dependencyStrength:edge.dependencyStrength,
  distanceBearing:edge.distanceBearing,
  alternativeGroupId:edge.alternativeGroupId??null
}));
const sameSourceFutureSlices=queue.queueEntries.filter(row=>row.queuePosition>8&&row.supportingSourceNodeIds.includes("g5b_u08_5b08")).map(row=>({
  queuePosition:row.queuePosition,
  sliceId:row.sliceId,
  primaryRuntimeProfileId:row.primaryRuntimeProfileId,
  intraWavePrerequisiteRank:row.intraWavePrerequisiteRank,
  knowledgePointIds:[...row.knowledgePointIds],
  requiredW7CapabilityIds:[...row.requiredW7CapabilityIds]
}));
if(slice?.sliceId!=="p07e_q008_r9_g5b_u08_5b08_profile_ratio_percent_c1")throw new Error("P07F_W7_Q008_QUEUE_IDENTITY");
if(slice?.previousSliceId!=="p07e_q007_r8_g6a_u09_6a09_profile_quantity_measurement_c1")throw new Error("P07F_W7_Q008_PREDECESSOR_IDENTITY");
if(!slice?.knowledgePointIds.includes(kp))throw new Error("P07F_W7_Q008_KP_MEMBERSHIP");
if(r04?.primaryRuntimeProfileId!=="profile_ratio_percent"||r05?.primaryRuntimeProfileId!=="profile_ratio_percent")throw new Error("P07F_W7_Q008_PROFILE");
if(p.semanticProfileLock.targetSemanticCore!=="FRACTION_DECIMAL_PERCENT_REPRESENT_THE_SAME_RATIO")throw new Error("P07F_W7_Q008_SEMANTIC_CORE");
if(p.q008ScopeLock.implementationAllowedByThisPreflight!==false||p.q008ScopeLock.publicProductAdmissionAllowedByThisPreflight!==false)throw new Error("P07F_W7_Q008_SCOPE");
console.log(JSON.stringify({
  schemaName:"P07FW7Q008SourceAuthorityPreflightReadbackV1",
  status:"PASS_P07F_W7_Q008_SOURCE_AUTHORITY_PREFLIGHT_READBACK",
  predecessorQ007D0Status:p.predecessorD0Evidence.q007Status,
  predecessorQ007ExactHeadSha:p.predecessorD0Evidence.q007MergeSha,
  queuePosition:slice.queuePosition,
  sliceId:slice.sliceId,
  previousSliceId:slice.previousSliceId,
  sourceNodeId:slice.primarySourceNodeId,
  supportingSourceNodeIds:[...slice.supportingSourceNodeIds],
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
  sameSourceFutureSlices,
  sourcePdfDriveFileId:p.sourceAuthority.sourcePdfDriveFileId,
  sourcePdfSizeBytes:p.sourceAuthority.sourcePdfSizeBytes,
  sourcePdfSha256:p.sourceAuthority.sourcePdfSha256,
  r02EvidencePages:p.r02ReviewedCandidateAuthority.targetCandidate.evidencePages,
  directVisualEvidencePages:p.sourceAuthority.evidenceResolution.exactQ008DirectVisualEvidencePages,
  currentVisualSupportLevel:p.sourceAuthority.evidenceResolution.currentVisualSupportLevel,
  semanticCore:p.semanticProfileLock.targetSemanticCore,
  nextTask:p.preflightDecision.nextTask
},null,2));
