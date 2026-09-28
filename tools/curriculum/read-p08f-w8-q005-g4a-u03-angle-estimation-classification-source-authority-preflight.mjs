import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p08f/q005-g4a-u03-angle-estimation-classification-source-authority-preflight.json",import.meta.url),"utf8"));
const q004=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p08f/q004-final-learner-visual-d0-closeout.json",import.meta.url),"utf8"));
const result=materializeP08EW8DirectProductVerticalSliceQueue();
const row=result.queueEntries[4];
const m=getR04KnowledgePointCapabilityMapping("kp_angle_estimation_and_classification");
if(p.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P08F_Q005_PREFLIGHT_STATUS_INVALID");
if(q004.status!=="Q004_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED"||q004.operatorAcceptance?.d0Granted!==true)throw new Error("P08F_Q005_PREDECESSOR_NOT_D0");
if(row.sliceId!==p.queueAuthority.sliceId)throw new Error("P08F_Q005_QUEUE_IDENTITY_MISMATCH");
if(row.knowledgePointIds.join("|")!==p.queueAuthority.knowledgePointIds.join("|"))throw new Error("P08F_Q005_KP_IDENTITY_MISMATCH");
if(m.primaryRuntimeProfileId!==p.runtimeCapabilityAuthority.profileId)throw new Error("P08F_Q005_RUNTIME_PROFILE_MISMATCH");
if(m.appliedModifierIds.length!==0)throw new Error("P08F_Q005_UNEXPECTED_RUNTIME_MODIFIER");
if(p.q005ScopeLock.implementationAllowedByThisPreflight||p.q005ScopeLock.publicProductAdmissionAllowedByThisPreflight)throw new Error("P08F_Q005_PREFLIGHT_SCOPE_LEAK");
console.log("P08F_W8_Q005_PREFLIGHT_READBACK="+JSON.stringify({
  status:p.status,
  predecessorQ004Status:q004.status,
  predecessorQ004HumanAccepted:q004.operatorAcceptance?.d0Granted===true,
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
