import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p08f/q001-g4a-u03-protractor-angle-measurement-source-authority-preflight.json");
const result=materializeP08EW8DirectProductVerticalSliceQueue();
const row=result.queueEntries[0];
const mapping=getR04KnowledgePointCapabilityMapping("kp_protractor_angle_measurement");
console.log("P08F_W8_Q001_PREFLIGHT="+JSON.stringify({
  status:p.status,queueFrozen:result.queueFrozen,queuePosition:row.queuePosition,sliceId:row.sliceId,
  knowledgePointIds:row.knowledgePointIds,sourceId:row.primarySourceNodeId,profile:row.primaryRuntimeProfileId,
  requiredRuntimeCapabilityIds:mapping.requiredRuntimeCapabilityIds,optionalRuntimeCapabilityIds:mapping.optionalRuntimeCapabilityIds,
  nextTask:p.preflightDecision.nextTask
}));
