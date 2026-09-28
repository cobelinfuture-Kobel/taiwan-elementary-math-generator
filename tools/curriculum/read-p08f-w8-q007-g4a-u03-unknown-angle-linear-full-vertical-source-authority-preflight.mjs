import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p08f/q007-g4a-u03-unknown-angle-linear-full-vertical-source-authority-preflight.json",import.meta.url),"utf8"));
const q006=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p08f/q006-final-learner-visual-d0-closeout.json",import.meta.url),"utf8"));
const result=materializeP08EW8DirectProductVerticalSliceQueue();
const row=result.queueEntries[6];
const m=getR04KnowledgePointCapabilityMapping("kp_unknown_angle_linear_full_vertical");
if(p.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P08F_Q007_PREFLIGHT_STATUS_INVALID");
if(q006.status!=="Q006_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED"||q006.operatorAcceptance?.d0Granted!==true)throw new Error("P08F_Q007_PREDECESSOR_NOT_D0");
if(row.sliceId!==p.queueAuthority.sliceId)throw new Error("P08F_Q007_QUEUE_IDENTITY_MISMATCH");
if(row.knowledgePointIds.join("|")!==p.queueAuthority.knowledgePointIds.join("|"))throw new Error("P08F_Q007_KP_IDENTITY_MISMATCH");
if(row.blockingCapabilityIds.join("|")!==p.queueAuthority.blockingCapabilityIds.join("|"))throw new Error("P08F_Q007_BLOCKING_CAPABILITY_MISMATCH:"+row.blockingCapabilityIds.join("|"));
if(row.blockingCapabilityWaveIds.join("|")!==p.queueAuthority.blockingCapabilityWaveIds.join("|"))throw new Error("P08F_Q007_BLOCKING_WAVE_MISMATCH:"+row.blockingCapabilityWaveIds.join("|"));
if(m.primaryRuntimeProfileId!==p.runtimeCapabilityAuthority.profileId)throw new Error("P08F_Q007_RUNTIME_PROFILE_MISMATCH");
if(m.appliedModifierIds.length!==0)throw new Error("P08F_Q007_UNEXPECTED_RUNTIME_MODIFIER:"+m.appliedModifierIds.join("|"));
if(p.q007ScopeLock.implementationAllowedByThisPreflight||p.q007ScopeLock.publicProductAdmissionAllowedByThisPreflight)throw new Error("P08F_Q007_PREFLIGHT_SCOPE_LEAK");
console.log("P08F_W8_Q007_PREFLIGHT_READBACK="+JSON.stringify({
  status:p.status,
  predecessorQ006Status:q006.status,
  predecessorQ006HumanAccepted:q006.operatorAcceptance?.d0Granted===true,
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
