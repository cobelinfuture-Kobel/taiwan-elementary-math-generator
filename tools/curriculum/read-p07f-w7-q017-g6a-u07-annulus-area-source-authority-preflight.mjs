import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
const KP="kp_g6a_u07_annulus_area";
const row=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[16];
const r03=getR03DirectPrerequisites(KP),r04=getR04KnowledgePointCapabilityMapping(KP),r05=getR05DeliveryWaveAssignment(KP);
if(!r04||!r05||!Array.isArray(r03))throw new Error("P07F_W7_Q017_EXECUTABLE_AUTHORITY_MISSING");
if(row.sliceId!=="p07e_q017_r11_g6a_u07_6a07_profile_geometry_formula_c1"||row.primaryRuntimeProfileId!=="profile_geometry_formula"||row.intraWavePrerequisiteRank!==11)throw new Error("P07F_W7_Q017_QUEUE_IDENTITY_INVALID");
console.log("P07F_W7_Q017_EXECUTABLE_AUTHORITY_READBACK="+JSON.stringify({
  queueRow:row,
  r03DirectPrerequisites:r03,
  r04Mapping:r04,
  r05Assignment:r05
},null,2));
