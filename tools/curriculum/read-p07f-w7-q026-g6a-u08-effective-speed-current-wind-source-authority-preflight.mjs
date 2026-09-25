import fs from "node:fs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";

const KP="kp_effective_speed_current_wind";
const pre=JSON.parse(fs.readFileSync("data/curriculum/full-product/p07f/q026-g6a-u08-effective-speed-current-wind-source-authority-preflight.json","utf8"));
const row=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[25];
const r03=getR03DirectPrerequisites(KP),r04=getR04KnowledgePointCapabilityMapping(KP),r05=getR05DeliveryWaveAssignment(KP);
if(pre.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P07F_W7_Q026_PREFLIGHT_NOT_PASS");
if(row.queuePosition!==26||row.sliceId!=="p07e_q026_r15_g6a_u08_6a08_profile_speed_rate_c1"||row.primarySourceNodeId!=="g6a_u08_6a08"||
 row.primaryRuntimeProfileId!=="profile_speed_rate"||row.intraWavePrerequisiteRank!==15||row.knowledgePointCount!==1||row.knowledgePointIds[0]!==KP)
 throw new Error("P07F_W7_Q026_QUEUE_IDENTITY_INVALID");
if(r03.map(x=>x.edgeId).join("|")!=="kpe_r03_0020"||
 r04?.mappingId!=="r04map_effective_speed_current_wind"||r05?.assignmentId!=="r05wave_effective_speed_current_wind")
 throw new Error("P07F_W7_Q026_EXECUTABLE_AUTHORITY_INVALID");
console.log("P07F_W7_Q026_EXECUTABLE_AUTHORITY_READBACK="+JSON.stringify({status:pre.status,queueRow:row,r03DirectPrerequisites:r03,r04Mapping:r04,r05Assignment:r05,decision:pre.preflightDecision},null,2));
