import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p08f/q015-g6a-u06-sector-arc-length-source-authority-preflight.json",import.meta.url),"utf8"));
const q014=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p08f/q014-final-learner-visual-d0-closeout.json",import.meta.url),"utf8"));
const result=materializeP08EW8DirectProductVerticalSliceQueue();
const row=result.queueEntries[14];
const m=getR04KnowledgePointCapabilityMapping("kp_g6a_u06_sector_arc_length");
const r05=getR05DeliveryWaveAssignment("kp_g6a_u06_sector_arc_length");

if(p.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P08F_Q015_PREFLIGHT_STATUS_INVALID");
if(q014.status!=="Q014_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED"||q014.operatorAcceptance?.d0Granted!==true)throw new Error("P08F_Q015_PREDECESSOR_NOT_D0");
if(row.sliceId!==p.queueAuthority.sliceId)throw new Error("P08F_Q015_QUEUE_IDENTITY_MISMATCH:"+row.sliceId);
if(row.knowledgePointIds.join("|")!==p.queueAuthority.knowledgePointIds.join("|"))throw new Error("P08F_Q015_KP_IDENTITY_MISMATCH:"+row.knowledgePointIds.join("|"));
if(row.blockingCapabilityIds.join("|")!==p.queueAuthority.blockingCapabilityIds.join("|"))throw new Error("P08F_Q015_BLOCKING_CAPABILITY_MISMATCH:"+row.blockingCapabilityIds.join("|"));
if(row.blockingCapabilityWaveIds.join("|")!==p.queueAuthority.blockingCapabilityWaveIds.join("|"))throw new Error("P08F_Q015_BLOCKING_WAVE_MISMATCH:"+row.blockingCapabilityWaveIds.join("|"));
if(m.primaryRuntimeProfileId!==p.runtimeCapabilityAuthority.profileId)throw new Error("P08F_Q015_RUNTIME_PROFILE_MISMATCH");
if(m.appliedModifierIds.join("|")!==p.runtimeCapabilityAuthority.appliedModifierIds.join("|"))throw new Error("P08F_Q015_RUNTIME_MODIFIER_MISMATCH:"+m.appliedModifierIds.join("|"));
if(m.requiredRuntimeCapabilityIds.join("|")!==p.runtimeCapabilityAuthority.exactMappingRequiredRuntimeCapabilityIds.join("|"))throw new Error("P08F_Q015_RUNTIME_CAPABILITY_MISMATCH");
if(r05.baseDeliveryWaveId!=="R05-W5"||r05.deliveryWaveId!=="R05-W8"||r05.waveEscalatedByPrerequisite!==true)throw new Error("P08F_Q015_R05_ASSIGNMENT_MISMATCH");
if(p.q015ScopeLock.implementationAllowedByThisPreflight||p.q015ScopeLock.publicProductAdmissionAllowedByThisPreflight)throw new Error("P08F_Q015_PREFLIGHT_SCOPE_LEAK");

console.log("P08F_W8_Q015_PREFLIGHT_READBACK="+JSON.stringify({
  status:p.status,predecessorQ014Status:q014.status,predecessorQ014HumanAccepted:q014.operatorAcceptance?.d0Granted===true,
  queueFrozen:result.queueFrozen,queuePosition:row.queuePosition,sliceId:row.sliceId,sourceId:row.primarySourceNodeId,
  knowledgePointIds:row.knowledgePointIds,runtimeProfileId:m.primaryRuntimeProfileId,appliedModifierIds:m.appliedModifierIds,
  requiredRuntimeCapabilityIds:m.requiredRuntimeCapabilityIds,blockingCapabilityIds:row.blockingCapabilityIds,
  blockingCapabilityWaveIds:row.blockingCapabilityWaveIds,r05BaseDeliveryWaveId:r05.baseDeliveryWaveId,
  r05DeliveryWaveId:r05.deliveryWaveId,waveEscalatedByPrerequisite:r05.waveEscalatedByPrerequisite,
  nextTask:p.preflightDecision.nextTask
}));
