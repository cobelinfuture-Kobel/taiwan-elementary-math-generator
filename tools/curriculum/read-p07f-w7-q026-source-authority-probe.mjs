import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";

const row=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[25];
if(!row)throw new Error("P07F_W7_Q026_QUEUE_ROW_MISSING");
if(row.queuePosition!==26||row.sliceId!=="p07e_q026_r15_g6a_u08_6a08_profile_speed_rate_c1"||
  row.primarySourceNodeId!=="g6a_u08_6a08"||row.primaryRuntimeProfileId!=="profile_speed_rate"||row.intraWavePrerequisiteRank!==15)
  throw new Error("P07F_W7_Q026_QUEUE_IDENTITY_INVALID");
const targets=row.knowledgePointIds.map(knowledgePointId=>{
  const r03=getR03DirectPrerequisites(knowledgePointId),r04=getR04KnowledgePointCapabilityMapping(knowledgePointId),r05=getR05DeliveryWaveAssignment(knowledgePointId);
  if(!r04||!r05||!Array.isArray(r03)||r03.length===0)throw new Error("P07F_W7_Q026_EXECUTABLE_AUTHORITY_MISSING:"+knowledgePointId);
  return {knowledgePointId,r03DirectPrerequisites:r03,r04Mapping:r04,r05Assignment:r05};
});
console.log("P07F_W7_Q026_EXECUTABLE_AUTHORITY_PROBE="+JSON.stringify({queueRow:row,targets},null,2));
