import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p08f/q013-g5a-u05-polygon-angle-sum-reasoning-source-authority-preflight.json",import.meta.url),"utf8"));
const q012=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p08f/q012-final-learner-visual-d0-closeout.json",import.meta.url),"utf8"));
const result=materializeP08EW8DirectProductVerticalSliceQueue(),row=result.queueEntries[12],m=getR04KnowledgePointCapabilityMapping("kp_g5a_u05a_polygon_angle_sum_reasoning");

if(p.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P08F_Q013_PREFLIGHT_STATUS_INVALID");
if(q012.status!=="Q012_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED"||q012.operatorAcceptance?.d0Granted!==true)throw new Error("P08F_Q013_PREDECESSOR_NOT_D0");
if(row.sliceId!==p.queueAuthority.sliceId)throw new Error("P08F_Q013_QUEUE_IDENTITY_MISMATCH:"+row.sliceId);
if(row.knowledgePointIds.join("|")!==p.queueAuthority.knowledgePointIds.join("|"))throw new Error("P08F_Q013_KP_IDENTITY_MISMATCH:"+row.knowledgePointIds.join("|"));
if(row.blockingCapabilityIds.join("|")!==p.queueAuthority.blockingCapabilityIds.join("|"))throw new Error("P08F_Q013_BLOCKING_CAPABILITY_MISMATCH:"+row.blockingCapabilityIds.join("|"));
if(row.blockingCapabilityWaveIds.join("|")!==p.queueAuthority.blockingCapabilityWaveIds.join("|"))throw new Error("P08F_Q013_BLOCKING_WAVE_MISMATCH:"+row.blockingCapabilityWaveIds.join("|"));
if(m.primaryRuntimeProfileId!==p.runtimeCapabilityAuthority.profileId)throw new Error("P08F_Q013_RUNTIME_PROFILE_MISMATCH");
if(m.appliedModifierIds.length!==0)throw new Error("P08F_Q013_UNEXPECTED_RUNTIME_MODIFIER:"+m.appliedModifierIds.join("|"));
if(p.q013ScopeLock.implementationAllowedByThisPreflight||p.q013ScopeLock.publicProductAdmissionAllowedByThisPreflight)throw new Error("P08F_Q013_PREFLIGHT_SCOPE_LEAK");

console.log("P08F_W8_Q013_PREFLIGHT_READBACK="+JSON.stringify({
  status:p.status,
  predecessorQ012Status:q012.status,
  predecessorQ012HumanAccepted:q012.operatorAcceptance?.d0Granted===true,
  queueFrozen:result.queueFrozen,
  queuePosition:row.queuePosition,
  sliceId:row.sliceId,
  sourceId:row.primarySourceNodeId,
  knowledgePointIds:row.knowledgePointIds,
  runtimeProfileId:m.primaryRuntimeProfileId,
  appliedModifierIds:m.appliedModifierIds,
  blockingCapabilityIds:row.blockingCapabilityIds,
  blockingCapabilityWaveIds:row.blockingCapabilityWaveIds,
  nextTask:p.preflightDecision.nextTask
}));
