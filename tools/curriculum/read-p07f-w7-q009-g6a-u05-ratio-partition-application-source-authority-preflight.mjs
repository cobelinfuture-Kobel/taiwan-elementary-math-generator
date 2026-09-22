import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
import {materializeR04SharedRuntimeCapabilityMatrix,getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p07f/q009-g6a-u05-ratio-partition-application-source-authority-preflight.json",import.meta.url),"utf8"));
const kp="kp_g6a_u05_ratio_partition_application";
const queue=materializeP07EW7DirectProductVerticalSliceQueue();
const slice=queue.queueEntries[8];
const r04=getR04KnowledgePointCapabilityMapping(kp);
const r05=getR05DeliveryWaveAssignment(kp);
const graph=materializeR04SharedRuntimeCapabilityMatrix().prerequisiteGraph;
const incoming=(graph.incomingByTarget.get(kp)??[]).map(edge=>({
  fromKnowledgePointId:edge.fromKnowledgePointId,
  dependencyStrength:edge.dependencyStrength,
  distanceBearing:edge.distanceBearing,
  alternativeGroupId:edge.alternativeGroupId??null
}));
const sameSourcePriorSlices=queue.queueEntries.filter(row=>row.queuePosition<9&&row.supportingSourceNodeIds.includes("g6a_u05_6a05")).map(row=>({
  queuePosition:row.queuePosition,
  sliceId:row.sliceId,
  primaryRuntimeProfileId:row.primaryRuntimeProfileId,
  knowledgePointIds:[...row.knowledgePointIds]
}));
const sameSourceFutureSlices=queue.queueEntries.filter(row=>row.queuePosition>9&&row.supportingSourceNodeIds.includes("g6a_u05_6a05")).map(row=>({
  queuePosition:row.queuePosition,
  sliceId:row.sliceId,
  primaryRuntimeProfileId:row.primaryRuntimeProfileId,
  knowledgePointIds:[...row.knowledgePointIds]
}));
if(slice?.sliceId!=="p07e_q009_r9_g6a_u05_6a05_profile_ratio_percent_c1")throw new Error("P07F_W7_Q009_QUEUE_IDENTITY");
if(slice?.previousSliceId!=="p07e_q008_r9_g5b_u08_5b08_profile_ratio_percent_c1")throw new Error("P07F_W7_Q009_PREDECESSOR_IDENTITY");
if(!slice?.knowledgePointIds.includes(kp))throw new Error("P07F_W7_Q009_KP_MEMBERSHIP");
if(r04?.primaryRuntimeProfileId!=="profile_ratio_percent"||r05?.primaryRuntimeProfileId!=="profile_ratio_percent")throw new Error("P07F_W7_Q009_PROFILE");
if(p.semanticProfileLock.targetSemanticCore!=="PARTITION_TOTAL_BY_GIVEN_RATIO_WITH_SUM_CONSERVATION")throw new Error("P07F_W7_Q009_SEMANTIC_CORE");
if(p.q009ScopeLock.implementationAllowedByThisPreflight!==false||p.q009ScopeLock.publicProductAdmissionAllowedByThisPreflight!==false)throw new Error("P07F_W7_Q009_SCOPE");
console.log(JSON.stringify({
  schemaName:"P07FW7Q009SourceAuthorityPreflightReadbackV1",
  status:"PASS_P07F_W7_Q009_SOURCE_AUTHORITY_PREFLIGHT_READBACK",
  predecessorQ008D0Status:p.predecessorD0Evidence.q008Status,
  predecessorQ008ExactHeadSha:p.predecessorD0Evidence.q008MergeSha,
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
  sameSourcePriorSlices,
  sameSourceFutureSlices,
  sourcePdfDriveFileId:p.sourceAuthority.sourcePdfDriveFileId,
  sourcePdfSizeBytes:p.sourceAuthority.sourcePdfSizeBytes,
  sourcePdfSha256:p.sourceAuthority.sourcePdfSha256,
  r02EvidencePages:p.r02ReviewedCandidateAuthority.targetCandidate.evidencePages,
  currentVisualDirectSupportingPages:p.sourceAuthority.directEvidence.currentVisualDirectSupportingPages,
  currentVisualSupportLevel:p.sourceAuthority.directEvidence.currentVisualSupportLevel,
  evidenceLocalizationMismatchPreservedExplicitly:p.sourceAuthority.directEvidence.evidenceLocalizationMismatchPreservedExplicitly,
  semanticCore:p.semanticProfileLock.targetSemanticCore,
  nextTask:p.preflightDecision.nextTask
},null,2));
