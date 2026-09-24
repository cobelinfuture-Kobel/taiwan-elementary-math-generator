import fs from "node:fs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";

const PREFLIGHT_PATH="data/curriculum/full-product/p07f/q022-g6b-u04-three-rate-quantity-relations-source-authority-preflight.json";
const pre=JSON.parse(fs.readFileSync(PREFLIGHT_PATH,"utf8"));
const expected=[
  "kp_g6b_u04_find_base_quantity",
  "kp_g6b_u04_find_comparison_quantity",
  "kp_g6b_u04_find_rate_from_quantities"
];
const row=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[21];
if(pre.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P07F_W7_Q022_PREFLIGHT_NOT_PASS");
if(row.queuePosition!==22||row.sliceId!=="p07e_q022_r12_g6b_u04_6b04_profile_ratio_percent_c1"||row.primarySourceNodeId!=="g6b_u04_6b04"||row.primaryRuntimeProfileId!=="profile_ratio_percent"||row.intraWavePrerequisiteRank!==12||row.knowledgePointCount!==3||JSON.stringify([...row.knowledgePointIds])!==JSON.stringify(expected))throw new Error("P07F_W7_Q022_QUEUE_IDENTITY_INVALID");
const targets=expected.map(knowledgePointId=>{
  const r03=getR03DirectPrerequisites(knowledgePointId),r04=getR04KnowledgePointCapabilityMapping(knowledgePointId),r05=getR05DeliveryWaveAssignment(knowledgePointId);
  if(!r04||!r05||r03.length!==1)throw new Error("P07F_W7_Q022_EXECUTABLE_AUTHORITY_MISSING:"+knowledgePointId);
  return {knowledgePointId,r03DirectPrerequisites:r03,r04Mapping:r04,r05Assignment:r05};
});
console.log("P07F_W7_Q022_EXECUTABLE_AUTHORITY_READBACK="+JSON.stringify({status:pre.status,queueRow:row,targets,decision:pre.preflightDecision},null,2));
