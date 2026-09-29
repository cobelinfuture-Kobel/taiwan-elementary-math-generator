import fs from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const path="data/curriculum/full-product/p08f/q018-g6b-u06-pie-chart-percent-angle-conversion-source-authority-preflight.json";
const p=JSON.parse(fs.readFileSync(path,"utf8"));
const queue=materializeP08EW8DirectProductVerticalSliceQueue().queueEntries[17];
const knowledgePointId=p.queueAuthority.knowledgePointIds[0];
const r04=getR04KnowledgePointCapabilityMapping(knowledgePointId);
const r05=getR05DeliveryWaveAssignment(knowledgePointId);

console.log("P08F_W8_Q018_PREFLIGHT="+JSON.stringify({
  status:p.status,
  queuePosition:queue.queuePosition,
  sliceId:queue.sliceId,
  knowledgePointIds:queue.knowledgePointIds,
  blockingCapabilityIds:queue.blockingCapabilityIds,
  blockingCapabilityWaveIds:queue.blockingCapabilityWaveIds,
  row:{
    knowledgePointId,
    profileId:r04?.primaryRuntimeProfileId,
    modifierIds:r04?.appliedModifierIds,
    requiredRuntimeCapabilityIds:r04?.requiredRuntimeCapabilityIds,
    effectiveRequiredRuntimeCapabilityIds:r05?.effectiveRequiredRuntimeCapabilityIds,
    baseDeliveryWaveId:r05?.baseDeliveryWaveId,
    deliveryWaveId:r05?.deliveryWaveId,
    prerequisiteWaveLowerBound:r05?.prerequisiteWaveLowerBound,
    waveEscalatedByPrerequisite:r05?.waveEscalatedByPrerequisite,
    prerequisiteRank:r05?.intraWavePrerequisiteRank,
    contractOnlyRequiredCapabilityIds:r05?.contractOnlyRequiredCapabilityIds,
    contractOnlyCapabilityWaveIds:r05?.contractOnlyCapabilityWaveIds
  }
}));
