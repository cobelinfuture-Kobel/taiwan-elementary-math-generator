import {readFileSync} from "node:fs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
const pre=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p07f/q014-g6a-u07-circle-area-formula-source-authority-preflight.json",import.meta.url),"utf8"));
const kp="kp_g6a_u07_circle_area_formula";
const strip=e=>({edgeId:e.edgeId,fromKnowledgePointId:e.fromKnowledgePointId,toKnowledgePointId:e.toKnowledgePointId,dependencyStrength:e.dependencyStrength,dependencyRole:e.dependencyRole,alternativeGroupId:e.alternativeGroupId,distanceBearing:e.distanceBearing,rationale:e.rationale,evidenceRefs:e.evidenceRefs});
const row=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[13];
if(row.sliceId!=="p07e_q014_r10_g6a_u07_6a07_profile_geometry_formula_c1"||JSON.stringify([...row.knowledgePointIds])!==JSON.stringify([kp]))throw new Error("P07F_W7_Q014_QUEUE_IDENTITY");
if(pre.sourceAuthority.currentVisualReadbackAuthority.q014DirectVisualEvidence.circleAreaFormulaApplicationPresent!==true)throw new Error("P07F_W7_Q014_SOURCE_VISUAL");
const r03=getR03DirectPrerequisites(kp).map(strip).sort((a,b)=>a.edgeId.localeCompare(b.edgeId));
const r04=getR04KnowledgePointCapabilityMapping(kp),r05=getR05DeliveryWaveAssignment(kp);
if(!r04||!r05)throw new Error("P07F_W7_Q014_EXECUTABLE_AUTHORITY_MISSING");
console.log("P07F_W7_Q014_EXECUTABLE_DISCOVERY_READBACK="+JSON.stringify({
  status:"EXECUTABLE_READBACK_DISCOVERED",
  queuePosition:row.queuePosition,
  sliceId:row.sliceId,
  knowledgePointId:kp,
  requiredW7CapabilityIds:[...row.requiredW7CapabilityIds],
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
