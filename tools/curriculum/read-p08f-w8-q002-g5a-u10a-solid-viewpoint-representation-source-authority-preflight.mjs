import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p08f/q002-g5a-u10a-solid-viewpoint-representation-source-authority-preflight.json");
const q001=read("data/curriculum/full-product/p08f/q001-g4a-u03-protractor-angle-measurement-final-d0-closeout.json");
const result=materializeP08EW8DirectProductVerticalSliceQueue();
const row=result.queueEntries[1];
const mapping=getR04KnowledgePointCapabilityMapping("kp_g5a_u10a_solid_viewpoint_representation");
console.log("P08F_W8_Q002_PREFLIGHT="+JSON.stringify({
  status:p.status,
  predecessorQ001Status:q001.status,
  queueFrozen:result.queueFrozen,
  queuePosition:row.queuePosition,
  sliceId:row.sliceId,
  previousSliceId:row.previousSliceId,
  knowledgePointIds:row.knowledgePointIds,
  sourceId:row.primarySourceNodeId,
  profile:row.primaryRuntimeProfileId,
  blockingCapabilityIds:row.blockingCapabilityIds,
  requiredRuntimeCapabilityIds:mapping.requiredRuntimeCapabilityIds,
  optionalRuntimeCapabilityIds:mapping.optionalRuntimeCapabilityIds,
  nextTask:p.preflightDecision.nextTask
}));
