import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p08f/q006-g5a-u05a1-combined-sector-angle-source-authority-preflight.json",import.meta.url),"utf8"));
const q005=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p08f/q005-final-learner-visual-d0-closeout.json",import.meta.url),"utf8"));
const result=materializeP08EW8DirectProductVerticalSliceQueue();
const row=result.queueEntries[5];
const m=getR04KnowledgePointCapabilityMapping("kp_g5a_u05a1_combined_sector_angle");
if(p.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P08F_Q006_PREFLIGHT_STATUS_INVALID");
if(q005.status!=="Q005_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED"||q005.operatorAcceptance?.d0Granted!==true)throw new Error("P08F_Q006_PREDECESSOR_NOT_D0");
if(row.sliceId!==p.queueAuthority.sliceId)throw new Error("P08F_Q006_QUEUE_IDENTITY_MISMATCH");
if(row.knowledgePointIds.join("|")!==p.queueAuthority.knowledgePointIds.join("|"))throw new Error("P08F_Q006_KP_IDENTITY_MISMATCH");
if(m.primaryRuntimeProfileId!==p.runtimeCapabilityAuthority.profileId)throw new Error("P08F_Q006_RUNTIME_PROFILE_MISMATCH");
if(m.appliedModifierIds.length!==0)throw new Error("P08F_Q006_UNEXPECTED_RUNTIME_MODIFIER");
if(p.q006ScopeLock.implementationAllowedByThisPreflight||p.q006ScopeLock.publicProductAdmissionAllowedByThisPreflight)throw new Error("P08F_Q006_PREFLIGHT_SCOPE_LEAK");
console.log("P08F_W8_Q006_PREFLIGHT_READBACK="+JSON.stringify({
  status:p.status,
  predecessorQ005Status:q005.status,
  predecessorQ005HumanAccepted:q005.operatorAcceptance?.d0Granted===true,
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
