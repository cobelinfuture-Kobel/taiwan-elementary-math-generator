import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";

const queue=materializeP07EW7DirectProductVerticalSliceQueue();
const row=queue.queueEntries[14];
if(!row) throw new Error("P07F_W7_Q015_ROW_MISSING");
if(row.queuePosition!==15) throw new Error("P07F_W7_Q015_POSITION_INVALID:"+row.queuePosition);
if(row.sliceId!=="p07e_q015_r10_g6b_u05_6b05_profile_factor_multiple_c1") throw new Error("P07F_W7_Q015_SLICE_INVALID:"+row.sliceId);

const stripEdge=e=>({
  edgeId:e.edgeId,
  fromKnowledgePointId:e.fromKnowledgePointId,
  toKnowledgePointId:e.toKnowledgePointId,
  dependencyStrength:e.dependencyStrength,
  dependencyRole:e.dependencyRole,
  alternativeGroupId:e.alternativeGroupId,
  distanceBearing:e.distanceBearing,
  rationale:e.rationale,
  evidenceRefs:e.evidenceRefs
});
const kps=[...row.knowledgePointIds];
const authority=kps.map(kp=>{
  const r03=getR03DirectPrerequisites(kp).map(stripEdge).sort((a,b)=>a.edgeId.localeCompare(b.edgeId));
  const r04=getR04KnowledgePointCapabilityMapping(kp);
  const r05=getR05DeliveryWaveAssignment(kp);
  return {
    knowledgePointId:kp,
    r03IncomingEdges:r03,
    r04:r04?{
      primaryRuntimeProfileId:r04.primaryRuntimeProfileId,
      classificationRuleId:r04.classificationRuleId,
      appliedModifierIds:[...(r04.appliedModifierIds??[])],
      requiredRuntimeCapabilityIds:[...(r04.requiredRuntimeCapabilityIds??[])],
      optionalRuntimeCapabilityIds:[...(r04.optionalRuntimeCapabilityIds??[])],
      forbiddenRuntimeCapabilityIds:[...(r04.forbiddenRuntimeCapabilityIds??[])]
    }:null,
    r05:r05?{
      baseDeliveryWaveId:r05.baseDeliveryWaveId,
      deliveryWaveId:r05.deliveryWaveId,
      waveEscalatedByPrerequisite:r05.waveEscalatedByPrerequisite,
      prerequisiteWaveLowerBound:r05.prerequisiteWaveLowerBound,
      intraWavePrerequisiteRank:r05.intraWavePrerequisiteRank
    }:null
  };
});
console.log("P07F_W7_Q015_EXECUTABLE_DISCOVERY="+JSON.stringify({
  status:"EXECUTABLE_DISCOVERY_COMPLETE",
  queueVersion:queue.version,
  queueDigest:queue.derivedRegistrySnapshot.queueDigest,
  queueSliceCount:queue.queueEntries.length,
  row:{
    queuePosition:row.queuePosition,
    sliceId:row.sliceId,
    implementationTaskId:row.implementationTaskId,
    previousSliceId:row.previousSliceId,
    assignedDeliveryWaveId:row.assignedDeliveryWaveId,
    primarySourceNodeId:row.primarySourceNodeId,
    supportingSourceNodeIds:[...row.supportingSourceNodeIds],
    intraWavePrerequisiteRank:row.intraWavePrerequisiteRank,
    primaryRuntimeProfileId:row.primaryRuntimeProfileId,
    chunkIndex:row.chunkIndex,
    knowledgePointCount:row.knowledgePointCount,
    knowledgePointIds:kps,
    requiredW7CapabilityIds:[...row.requiredW7CapabilityIds],
    targetEvidenceLevel:row.targetEvidenceLevel
  },
  authority
},null,2));
