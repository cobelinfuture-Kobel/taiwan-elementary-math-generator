import fs from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
const p=JSON.parse(fs.readFileSync("data/curriculum/full-product/p08f/q022-g6a-u08-speed-unit-conversion-source-authority-preflight.json","utf8"));
const queue=materializeP08EW8DirectProductVerticalSliceQueue().queueEntries[21];
const kp=p.queueAuthority.knowledgePointIds[0];
const r03=getR03DirectPrerequisites(kp),r04=getR04KnowledgePointCapabilityMapping(kp),r05=getR05DeliveryWaveAssignment(kp);
console.log("P08F_W8_Q022_PREFLIGHT="+JSON.stringify({
  status:p.status,
  queuePosition:queue.queuePosition,
  sliceId:queue.sliceId,
  previousSliceId:queue.previousSliceId,
  sourceId:queue.primarySourceNodeId,
  supportingSourceNodeIds:queue.supportingSourceNodeIds,
  knowledgePointIds:queue.knowledgePointIds,
  blockingCapabilityIds:queue.blockingCapabilityIds,
  blockingCapabilityWaveIds:queue.blockingCapabilityWaveIds,
  row:{
    knowledgePointId:kp,
    r03Prerequisites:r03,
    mappingId:r04?.mappingId,
    profileId:r04?.primaryRuntimeProfileId,
    classificationRuleId:r04?.classificationRuleId,
    modifierIds:r04?.appliedModifierIds,
    requiredRuntimeCapabilityIds:r04?.requiredRuntimeCapabilityIds,
    optionalRuntimeCapabilityIds:r04?.optionalRuntimeCapabilityIds,
    forbiddenRuntimeCapabilityIds:r04?.forbiddenRuntimeCapabilityIds,
    effectiveRequiredRuntimeCapabilityIds:r05?.effectiveRequiredRuntimeCapabilityIds,
    baseDeliveryWaveId:r05?.baseDeliveryWaveId,
    deliveryWaveId:r05?.deliveryWaveId,
    prerequisiteWaveLowerBound:r05?.prerequisiteWaveLowerBound,
    waveEscalatedByPrerequisite:r05?.waveEscalatedByPrerequisite,
    prerequisiteRank:r05?.intraWavePrerequisiteRank,
    contractOnlyRequiredCapabilityIds:r05?.contractOnlyRequiredCapabilityIds,
    contractOnlyCapabilityWaveIds:r05?.contractOnlyCapabilityWaveIds,
    sourceNodeIds:r05?.sourceNodeIds
  }
}));
