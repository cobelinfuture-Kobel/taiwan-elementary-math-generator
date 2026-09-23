import {readFileSync} from "node:fs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
const pre=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p07f/q013-g5b-u08-rate-and-percentage-quantity-source-authority-preflight.json",import.meta.url),"utf8"));
const kps=["kp_g5b_u08_find_percentage_rate","kp_g5b_u08_percentage_of_quantity"];
const strip=e=>({edgeId:e.edgeId,fromKnowledgePointId:e.fromKnowledgePointId,toKnowledgePointId:e.toKnowledgePointId,dependencyStrength:e.dependencyStrength,dependencyRole:e.dependencyRole,alternativeGroupId:e.alternativeGroupId,distanceBearing:e.distanceBearing,rationale:e.rationale,evidenceRefs:e.evidenceRefs});
const queue=materializeP07EW7DirectProductVerticalSliceQueue(),row=queue.queueEntries[12];
if(row.sliceId!=="p07e_q013_r10_g5b_u08_5b08_profile_ratio_percent_c1"||JSON.stringify([...row.knowledgePointIds])!==JSON.stringify(kps))throw new Error("P07F_W7_Q013_QUEUE_IDENTITY");
if(pre.sourceAuthority.currentVisualReadbackAuthority.findPercentageRateDirectVisualEvidence.directEvidencePresent!==true||pre.sourceAuthority.currentVisualReadbackAuthority.percentageOfQuantityDirectVisualEvidence.directEvidencePresent!==true)throw new Error("P07F_W7_Q013_SOURCE_VISUAL");
const rows={};
for(const kp of kps){
  const r03=getR03DirectPrerequisites(kp).map(strip).sort((a,b)=>a.edgeId.localeCompare(b.edgeId));
  const r04=getR04KnowledgePointCapabilityMapping(kp),r05=getR05DeliveryWaveAssignment(kp);
  if(!r04||!r05)throw new Error("P07F_W7_Q013_EXECUTABLE_AUTHORITY_MISSING:"+kp);
  rows[kp]={
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
  };
}
console.log("P07F_W7_Q013_EXECUTABLE_DISCOVERY_READBACK="+JSON.stringify({
  status:"EXECUTABLE_READBACK_DISCOVERED",
  queuePosition:row.queuePosition,
  sliceId:row.sliceId,
  knowledgePointIds:kps,
  requiredW7CapabilityIds:[...row.requiredW7CapabilityIds],
  rows
},null,2));
