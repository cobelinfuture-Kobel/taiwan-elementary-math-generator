import fs from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const path="data/curriculum/full-product/p08f/q016-g6a-u09-scale-drawing-similar-angle-source-authority-preflight.json";
const p=JSON.parse(fs.readFileSync(path,"utf8"));
const queue=materializeP08EW8DirectProductVerticalSliceQueue().queueEntries[15];
const rows=p.queueAuthority.knowledgePointIds.map(knowledgePointId=>({
  knowledgePointId,
  r04:getR04KnowledgePointCapabilityMapping(knowledgePointId),
  r05:getR05DeliveryWaveAssignment(knowledgePointId)
}));
console.log("P08F_W8_Q016_PREFLIGHT="+JSON.stringify({
  status:p.status,
  queuePosition:queue.queuePosition,
  sliceId:queue.sliceId,
  knowledgePointIds:queue.knowledgePointIds,
  blockingCapabilityIds:queue.blockingCapabilityIds,
  rows:rows.map(x=>({
    knowledgePointId:x.knowledgePointId,
    profileId:x.r04?.primaryRuntimeProfileId,
    modifierIds:x.r04?.appliedModifierIds,
    deliveryWaveId:x.r05?.deliveryWaveId,
    prerequisiteRank:x.r05?.intraWavePrerequisiteRank
  }))
}));
