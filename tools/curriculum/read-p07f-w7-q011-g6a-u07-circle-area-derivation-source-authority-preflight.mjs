import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
import {materializeR04SharedRuntimeCapabilityMatrix,getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p07f/q011-g6a-u07-circle-area-derivation-source-authority-preflight.json",import.meta.url),"utf8"));
const kp="kp_g6a_u07_circle_area_derivation";
const queue=materializeP07EW7DirectProductVerticalSliceQueue();
const slice=queue.queueEntries[10];
const r04=getR04KnowledgePointCapabilityMapping(kp);
const r05=getR05DeliveryWaveAssignment(kp);
const graph=materializeR04SharedRuntimeCapabilityMatrix().prerequisiteGraph;
const incoming=(graph.incomingByTarget.get(kp)??[]).map(edge=>({
  fromKnowledgePointId:edge.fromKnowledgePointId,
  dependencyStrength:edge.dependencyStrength,
  dependencyRole:edge.dependencyRole,
  distanceBearing:edge.distanceBearing,
  alternativeGroupId:edge.alternativeGroupId??null
}));
const sameSourcePriorSlices=queue.queueEntries.filter(row=>row.queuePosition<11&&row.supportingSourceNodeIds.includes("g6a_u07_6a07")).map(row=>({
  queuePosition:row.queuePosition,sliceId:row.sliceId,primaryRuntimeProfileId:row.primaryRuntimeProfileId,knowledgePointIds:[...row.knowledgePointIds]
}));
const sameSourceFutureSlices=queue.queueEntries.filter(row=>row.queuePosition>11&&row.supportingSourceNodeIds.includes("g6a_u07_6a07")).map(row=>({
  queuePosition:row.queuePosition,sliceId:row.sliceId,primaryRuntimeProfileId:row.primaryRuntimeProfileId,knowledgePointIds:[...row.knowledgePointIds]
}));
if(slice?.sliceId!=="p07e_q011_r9_g6a_u07_6a07_profile_geometry_formula_c1")throw new Error("P07F_W7_Q011_QUEUE_IDENTITY");
if(slice?.previousSliceId!=="p07e_q010_r9_g6a_u06_6a06_profile_geometry_formula_c1")throw new Error("P07F_W7_Q011_PREDECESSOR_IDENTITY");
if(!slice?.knowledgePointIds.includes(kp))throw new Error("P07F_W7_Q011_KP_MEMBERSHIP");
if(!r04||!r05)throw new Error("P07F_W7_Q011_RUNTIME_OR_WAVE_MISSING");
if(r04.primaryRuntimeProfileId!=="profile_geometry_formula"||r05.primaryRuntimeProfileId!=="profile_geometry_formula")throw new Error("P07F_W7_Q011_PROFILE");
if(p.status!=="BLOCKED_SOURCE_EVIDENCE_MISMATCH_REQUIRES_OPERATOR_SOURCE_EVIDENCE_SELECTION")throw new Error("P07F_W7_Q011_BLOCKED_STATUS");
if(p.sourceAuthority.currentVisualReadbackAuthority.targetVisualFamilyPresent!==false)throw new Error("P07F_W7_Q011_VISUAL_SUPPORT_MUST_BE_FALSE");
if(p.preflightDecision.implementationMayProceed!==false)throw new Error("P07F_W7_Q011_IMPLEMENTATION_MUST_FAIL_CLOSED");
console.log("P07F_W7_Q011_EXECUTABLE_READBACK="+JSON.stringify({
  schemaName:"P07FW7Q011SourceAuthorityPreflightExecutableReadbackV1",
  status:"BLOCKED_SOURCE_EVIDENCE_MISMATCH",
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
  currentVisualDirectSupportingPages:p.sourceAuthority.currentVisualReadbackAuthority.currentVisualDirectSupportingPages,
  targetVisualFamilyPresent:p.sourceAuthority.currentVisualReadbackAuthority.targetVisualFamilyPresent,
  blocker:p.sourceAuthority.directEvidenceAssessment.conflictType,
  nextTask:p.preflightDecision.nextTask
},null,2));
