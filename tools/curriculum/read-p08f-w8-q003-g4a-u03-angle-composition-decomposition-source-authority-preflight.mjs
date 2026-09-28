import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p08f/q003-g4a-u03-angle-composition-decomposition-source-authority-preflight.json");
const q002=read("data/curriculum/full-product/p08f/q002-final-learner-visual-d0-closeout.json");
const result=materializeP08EW8DirectProductVerticalSliceQueue();
const row=result.queueEntries[2];
const mappings=row.knowledgePointIds.map(id=>getR04KnowledgePointCapabilityMapping(id));
console.log("P08F_W8_Q003_PREFLIGHT="+JSON.stringify({
  status:p.status,
  predecessorQ002Status:q002.status,
  predecessorQ002HumanAccepted:q002.operatorAcceptance?.d0Granted===true,
  predecessorAuthorityPath:p.predecessorAuthority.q002FinalCloseoutPath,
  queueFrozen:result.queueFrozen,
  queuePosition:row.queuePosition,
  sliceId:row.sliceId,
  previousSliceId:row.previousSliceId,
  knowledgePointIds:row.knowledgePointIds,
  sourceId:row.primarySourceNodeId,
  profile:row.primaryRuntimeProfileId,
  blockingCapabilityIds:row.blockingCapabilityIds,
  blockingCapabilityWaveIds:row.blockingCapabilityWaveIds,
  runtimeMappings:mappings.map(m=>({
    knowledgePointId:m.knowledgePointId,
    profile:m.primaryRuntimeProfileId,
    appliedModifierIds:m.appliedModifierIds,
    requiredRuntimeCapabilityIds:m.requiredRuntimeCapabilityIds,
    optionalRuntimeCapabilityIds:m.optionalRuntimeCapabilityIds
  })),
  nextTask:p.preflightDecision.nextTask
}));
