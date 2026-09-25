import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";

const KP="kp_g6b_u04_successive_rate_change";
const row=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[23];
if(!row)throw new Error("P07F_W7_Q024_QUEUE_ROW_MISSING");
if(row.queuePosition!==24||row.sliceId!=="p07e_q024_r13_g6b_u04_6b04_profile_ratio_percent_c1"||row.primarySourceNodeId!=="g6b_u04_6b04"||
  row.primaryRuntimeProfileId!=="profile_ratio_percent"||row.intraWavePrerequisiteRank!==13||row.knowledgePointCount!==1||row.knowledgePointIds[0]!==KP)
  throw new Error("P07F_W7_Q024_QUEUE_IDENTITY_INVALID");
const r03=getR03DirectPrerequisites(KP),r04=getR04KnowledgePointCapabilityMapping(KP),r05=getR05DeliveryWaveAssignment(KP);
if(!r04||!r05||!Array.isArray(r03)||r03.length===0)throw new Error("P07F_W7_Q024_EXECUTABLE_AUTHORITY_MISSING");
console.log("P07F_W7_Q024_EXECUTABLE_AUTHORITY_PROBE="+JSON.stringify({queueRow:row,r03DirectPrerequisites:r03,r04Mapping:r04,r05Assignment:r05},null,2));
