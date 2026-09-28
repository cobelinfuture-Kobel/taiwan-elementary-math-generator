import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p08f/q010-g5a-u05a1-sector-fraction-of-circle-source-authority-preflight.json",import.meta.url),"utf8"));
const q009=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p08f/q009-final-learner-visual-d0-closeout.json",import.meta.url),"utf8"));
const result=materializeP08EW8DirectProductVerticalSliceQueue(),row=result.queueEntries[9],m=getR04KnowledgePointCapabilityMapping("kp_g5a_u05a1_sector_fraction_of_circle");

if(p.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P08F_Q010_PREFLIGHT_STATUS_INVALID");
if(q009.status!=="Q009_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED"||q009.operatorAcceptance?.d0Granted!==true)throw new Error("P08F_Q010_PREDECESSOR_NOT_D0");
if(row.sliceId!==p.queueAuthority.sliceId)throw new Error("P08F_Q010_QUEUE_IDENTITY_MISMATCH:"+row.sliceId);
if(row.knowledgePointIds.join("|")!==p.queueAuthority.knowledgePointIds.join("|"))throw new Error("P08F_Q010_KP_IDENTITY_MISMATCH:"+row.knowledgePointIds.join("|"));
if(row.blockingCapabilityIds.join("|")!==p.queueAuthority.blockingCapabilityIds.join("|"))throw new Error("P08F_Q010_BLOCKING_CAPABILITY_MISMATCH:"+row.blockingCapabilityIds.join("|"));
if(row.blockingCapabilityWaveIds.join("|")!==p.queueAuthority.blockingCapabilityWaveIds.join("|"))throw new Error("P08F_Q010_BLOCKING_WAVE_MISMATCH:"+row.blockingCapabilityWaveIds.join("|"));
if(m.primaryRuntimeProfileId!==p.runtimeCapabilityAuthority.profileId)throw new Error("P08F_Q010_RUNTIME_PROFILE_MISMATCH");
if(m.appliedModifierIds.length!==0)throw new Error("P08F_Q010_UNEXPECTED_RUNTIME_MODIFIER:"+m.appliedModifierIds.join("|"));
if(p.q010ScopeLock.implementationAllowedByThisPreflight||p.q010ScopeLock.publicProductAdmissionAllowedByThisPreflight)throw new Error("P08F_Q010_PREFLIGHT_SCOPE_LEAK");

console.log("P08F_W8_Q010_PREFLIGHT_READBACK="+JSON.stringify({
 status:p.status,
 predecessorQ009Status:q009.status,
 predecessorQ009HumanAccepted:q009.operatorAcceptance?.d0Granted===true,
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
