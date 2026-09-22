import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
import {materializeR04SharedRuntimeCapabilityMatrix,getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p07f/q010-g6a-u06-semicircle-perimeter-source-authority-preflight.json",import.meta.url),"utf8"));
const kp="kp_g6a_u06_semicircle_perimeter";
const queue=materializeP07EW7DirectProductVerticalSliceQueue();
const slice=queue.queueEntries[9];
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
const sameSourcePriorSlices=queue.queueEntries.filter(row=>row.queuePosition<10&&row.supportingSourceNodeIds.includes("g6a_u06_6a06")).map(row=>({
  queuePosition:row.queuePosition,
  sliceId:row.sliceId,
  primaryRuntimeProfileId:row.primaryRuntimeProfileId,
  knowledgePointIds:[...row.knowledgePointIds]
}));
if(JSON.stringify(p.runtimeCapabilityAuthority.executableR04Mapping)!==JSON.stringify({primaryRuntimeProfileId:r04.primaryRuntimeProfileId,classificationRuleId:r04.classificationRuleId,appliedModifierIds:[...r04.appliedModifierIds],requiredRuntimeCapabilityIds:[...r04.requiredRuntimeCapabilityIds],optionalRuntimeCapabilityIds:[...r04.optionalRuntimeCapabilityIds],forbiddenRuntimeCapabilityIds:[...r04.forbiddenRuntimeCapabilityIds]}))throw new Error("P07F_W7_Q010_R04_MAPPING_PARITY");
if(JSON.stringify(p.prerequisiteGraphAuthority.exactIncomingRequiredDistanceBearingEdges)!==JSON.stringify(incoming))throw new Error("P07F_W7_Q010_PREREQUISITE_PARITY");
const sameSourceFutureSlices=queue.queueEntries.filter(row=>row.queuePosition>10&&row.supportingSourceNodeIds.includes("g6a_u06_6a06")).map(row=>({
  queuePosition:row.queuePosition,
  sliceId:row.sliceId,
  primaryRuntimeProfileId:row.primaryRuntimeProfileId,
  knowledgePointIds:[...row.knowledgePointIds]
}));
if(slice?.sliceId!=="p07e_q010_r9_g6a_u06_6a06_profile_geometry_formula_c1")throw new Error("P07F_W7_Q010_QUEUE_IDENTITY");
if(slice?.previousSliceId!=="p07e_q009_r9_g6a_u05_6a05_profile_ratio_percent_c1")throw new Error("P07F_W7_Q010_PREDECESSOR_IDENTITY");
if(!slice?.knowledgePointIds.includes(kp))throw new Error("P07F_W7_Q010_KP_MEMBERSHIP");
if(!r04||!r05)throw new Error("P07F_W7_Q010_RUNTIME_OR_WAVE_MISSING");
if(r04?.primaryRuntimeProfileId!=="profile_geometry_formula"||r05?.primaryRuntimeProfileId!=="profile_geometry_formula")throw new Error("P07F_W7_Q010_PROFILE");
if(p.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P07F_W7_Q010_PREFLIGHT_STATUS");
if(p.semanticProfileLock.targetSemanticCore!=="SEMICIRCLE_PERIMETER_EQUALS_HALF_CIRCUMFERENCE_PLUS_DIAMETER")throw new Error("P07F_W7_Q010_SEMANTIC_CORE");
if(p.q010ScopeLock.implementationAllowedByThisPreflight!==false||p.q010ScopeLock.publicProductAdmissionAllowedByThisPreflight!==false)throw new Error("P07F_W7_Q010_SCOPE");
console.log("P07F_W7_Q010_EXECUTABLE_READBACK="+JSON.stringify({
  schemaName:"P07FW7Q010SourceAuthorityPreflightExecutableReadbackV1",
  status:"PASS_P07F_W7_Q010_EXECUTABLE_READBACK",
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
  semanticCore:p.semanticProfileLock.targetSemanticCore,
  nextTask:p.preflightDecision.nextTask
},null,2));
