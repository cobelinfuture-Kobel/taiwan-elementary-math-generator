import fs from "node:fs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";

const KPS=["kp_average_speed_total_distance_time","kp_relative_speed_meeting_chasing"];
const pre=JSON.parse(fs.readFileSync("data/curriculum/full-product/p07f/q025-g6a-u08-average-and-relative-speed-source-authority-preflight.json","utf8"));
const row=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[24];
if(pre.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P07F_W7_Q025_PREFLIGHT_NOT_PASS");
if(row.queuePosition!==25||row.sliceId!=="p07e_q025_r14_g6a_u08_6a08_profile_speed_rate_c1"||row.primarySourceNodeId!=="g6a_u08_6a08"||
 row.primaryRuntimeProfileId!=="profile_speed_rate"||row.intraWavePrerequisiteRank!==14||row.knowledgePointCount!==2||
 JSON.stringify([...row.knowledgePointIds])!==JSON.stringify(KPS))throw new Error("P07F_W7_Q025_QUEUE_IDENTITY_INVALID");
const targets=KPS.map(knowledgePointId=>({knowledgePointId,r03DirectPrerequisites:getR03DirectPrerequisites(knowledgePointId),
 r04Mapping:getR04KnowledgePointCapabilityMapping(knowledgePointId),r05Assignment:getR05DeliveryWaveAssignment(knowledgePointId)}));
if(targets[0].r03DirectPrerequisites.map(x=>x.edgeId).join("|")!=="kpe_r03_0009"||
 targets[1].r03DirectPrerequisites.map(x=>x.edgeId).join("|")!=="kpe_r03_0650|kpe_r03_0651"||
 targets[0].r04Mapping?.mappingId!=="r04map_average_speed_total_distance_time"||
 targets[1].r04Mapping?.mappingId!=="r04map_relative_speed_meeting_chasing"||
 targets[0].r05Assignment?.assignmentId!=="r05wave_average_speed_total_distance_time"||
 targets[1].r05Assignment?.assignmentId!=="r05wave_relative_speed_meeting_chasing")throw new Error("P07F_W7_Q025_EXECUTABLE_AUTHORITY_INVALID");
console.log("P07F_W7_Q025_EXECUTABLE_AUTHORITY_READBACK="+JSON.stringify({status:pre.status,queueRow:row,targets,decision:pre.preflightDecision},null,2));
