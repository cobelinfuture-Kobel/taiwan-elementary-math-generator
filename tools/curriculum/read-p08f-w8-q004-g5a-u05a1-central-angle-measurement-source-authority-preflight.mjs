import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p08f/q004-g5a-u05a1-central-angle-measurement-source-authority-preflight.json",import.meta.url),"utf8"));
const q=materializeP08EW8DirectProductVerticalSliceQueue().queueEntries[3];
const m=getR04KnowledgePointCapabilityMapping("kp_g5a_u05a1_central_angle_measurement");
if(p.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P08F_Q004_PREFLIGHT_STATUS_INVALID");
if(q.sliceId!==p.queueAuthority.sliceId)throw new Error("P08F_Q004_QUEUE_IDENTITY_MISMATCH");
if(q.knowledgePointIds.join("|")!==p.queueAuthority.knowledgePointIds.join("|"))throw new Error("P08F_Q004_KP_IDENTITY_MISMATCH");
if(m.primaryRuntimeProfileId!==p.runtimeCapabilityAuthority.profileId)throw new Error("P08F_Q004_RUNTIME_PROFILE_MISMATCH");
if(m.appliedModifierIds.length!==0)throw new Error("P08F_Q004_UNEXPECTED_RUNTIME_MODIFIER");
if(p.q004ScopeLock.implementationAllowedByThisPreflight||p.q004ScopeLock.publicProductAdmissionAllowedByThisPreflight)throw new Error("P08F_Q004_PREFLIGHT_SCOPE_LEAK");
console.log("P08F_W8_Q004_PREFLIGHT_READBACK="+JSON.stringify({
  status:p.status,
  queuePosition:q.queuePosition,
  sliceId:q.sliceId,
  sourceId:q.primarySourceNodeId,
  knowledgePointIds:q.knowledgePointIds,
  runtimeProfileId:m.primaryRuntimeProfileId,
  appliedModifierIds:m.appliedModifierIds,
  blockingCapabilityIds:q.blockingCapabilityIds,
  blockingCapabilityWaveIds:q.blockingCapabilityWaveIds,
  nextTask:p.preflightDecision.nextTask
}));
