import {readFileSync} from "node:fs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
const pre=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p07f/q012-g6a-u09-scale-area-change-source-authority-preflight.json",import.meta.url),"utf8"));
const kp="kp_g6a_u09_scale_area_change";
const r03=getR03DirectPrerequisites(kp).map(e=>({
  edgeId:e.edgeId,fromKnowledgePointId:e.fromKnowledgePointId,toKnowledgePointId:e.toKnowledgePointId,
  dependencyStrength:e.dependencyStrength,dependencyRole:e.dependencyRole,alternativeGroupId:e.alternativeGroupId,distanceBearing:e.distanceBearing,
  rationale:e.rationale,evidenceRefs:e.evidenceRefs
})).sort((a,b)=>a.edgeId.localeCompare(b.edgeId));
const r04=getR04KnowledgePointCapabilityMapping(kp);
const r05=getR05DeliveryWaveAssignment(kp);
if(pre.queueAuthority.queuePosition!==12||pre.queueAuthority.primaryRuntimeProfileId!=="profile_geometry_formula")throw new Error("P07F_W7_Q012_QUEUE_IDENTITY");
if(pre.sourceAuthority.currentVisualReadbackAuthority.q012DirectVisualEvidence.directScaleAreaChangeQuestionVisible!==true)throw new Error("P07F_W7_Q012_SOURCE_VISUAL");
if(!r04||!r05)throw new Error("P07F_W7_Q012_EXECUTABLE_AUTHORITY_MISSING");
console.log("P07F_W7_Q012_EXECUTABLE_DISCOVERY_READBACK="+JSON.stringify({
  status:"EXECUTABLE_READBACK_DISCOVERED",
  knowledgePointId:kp,
  r03IncomingEdges:r03,
  r04:{
    primaryRuntimeProfileId:r04.primaryRuntimeProfileId,
    classificationRuleId:r04.classificationRuleId,
    appliedModifierIds:[...(r04.appliedModifierIds??[])],
    requiredRuntimeCapabilityIds:[...(r04.requiredRuntimeCapabilityIds??[])],
    optionalRuntimeCapabilityIds:[...(r04.optionalRuntimeCapabilityIds??[])],
    forbiddenRuntimeCapabilityIds:[...(r04.forbiddenRuntimeCapabilityIds??[])]
  },
  r05:{
    baseDeliveryWaveId:r05.baseDeliveryWaveId,
    deliveryWaveId:r05.deliveryWaveId,
    waveEscalatedByPrerequisite:r05.waveEscalatedByPrerequisite,
    prerequisiteWaveLowerBound:r05.prerequisiteWaveLowerBound,
    intraWavePrerequisiteRank:r05.intraWavePrerequisiteRank
  }
},null,2));
