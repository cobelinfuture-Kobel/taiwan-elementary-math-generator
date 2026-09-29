import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p08f/q014-g6a-u09-map-scale-distance-source-authority-preflight.json",import.meta.url),"utf8"));
const q013=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p08f/q013-final-learner-visual-d0-closeout.json",import.meta.url),"utf8"));
const result=materializeP08EW8DirectProductVerticalSliceQueue();
const row=result.queueEntries[13];
const m=getR04KnowledgePointCapabilityMapping("kp_g6a_u09_map_scale_distance");
const r05=getR05DeliveryWaveAssignment("kp_g6a_u09_map_scale_distance");

if(p.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P08F_Q014_PREFLIGHT_STATUS_INVALID");
if(q013.status!=="Q013_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED"||q013.operatorAcceptance?.d0Granted!==true)throw new Error("P08F_Q014_PREDECESSOR_NOT_D0");
if(row.sliceId!==p.queueAuthority.sliceId)throw new Error("P08F_Q014_QUEUE_IDENTITY_MISMATCH:"+row.sliceId);
if(row.knowledgePointIds.join("|")!==p.queueAuthority.knowledgePointIds.join("|"))throw new Error("P08F_Q014_KP_IDENTITY_MISMATCH:"+row.knowledgePointIds.join("|"));
if(row.blockingCapabilityIds.join("|")!==p.queueAuthority.blockingCapabilityIds.join("|"))throw new Error("P08F_Q014_BLOCKING_CAPABILITY_MISMATCH:"+row.blockingCapabilityIds.join("|"));
if(row.blockingCapabilityWaveIds.join("|")!==p.queueAuthority.blockingCapabilityWaveIds.join("|"))throw new Error("P08F_Q014_BLOCKING_WAVE_MISMATCH:"+row.blockingCapabilityWaveIds.join("|"));
if(m.primaryRuntimeProfileId!==p.runtimeCapabilityAuthority.profileId)throw new Error("P08F_Q014_RUNTIME_PROFILE_MISMATCH");
if(m.appliedModifierIds.join("|")!=="mod_coordinate_map")throw new Error("P08F_Q014_RUNTIME_MODIFIER_MISMATCH:"+m.appliedModifierIds.join("|"));
if(m.requiredRuntimeCapabilityIds.join("|")!==p.runtimeCapabilityAuthority.exactMappingRequiredRuntimeCapabilityIds.join("|"))throw new Error("P08F_Q014_RUNTIME_CAPABILITY_MISMATCH");
if(r05.baseDeliveryWaveId!=="R05-W8"||r05.deliveryWaveId!=="R05-W8")throw new Error("P08F_Q014_R05_ASSIGNMENT_MISMATCH");
if(p.q014ScopeLock.implementationAllowedByThisPreflight||p.q014ScopeLock.publicProductAdmissionAllowedByThisPreflight)throw new Error("P08F_Q014_PREFLIGHT_SCOPE_LEAK");

console.log("P08F_W8_Q014_PREFLIGHT_READBACK="+JSON.stringify({
  status:p.status,
  predecessorQ013Status:q013.status,
  predecessorQ013HumanAccepted:q013.operatorAcceptance?.d0Granted===true,
  queueFrozen:result.queueFrozen,
  queuePosition:row.queuePosition,
  sliceId:row.sliceId,
  sourceId:row.primarySourceNodeId,
  knowledgePointIds:row.knowledgePointIds,
  runtimeProfileId:m.primaryRuntimeProfileId,
  appliedModifierIds:m.appliedModifierIds,
  requiredRuntimeCapabilityIds:m.requiredRuntimeCapabilityIds,
  blockingCapabilityIds:row.blockingCapabilityIds,
  blockingCapabilityWaveIds:row.blockingCapabilityWaveIds,
  r05BaseDeliveryWaveId:r05.baseDeliveryWaveId,
  r05DeliveryWaveId:r05.deliveryWaveId,
  unitNormalizationRequired:p.semanticProfileLock.implementationSemanticLock.unitNormalizationBeforeRatioEvaluationRequired,
  exactR04IncludesCapUnitConversion:m.requiredRuntimeCapabilityIds.includes("cap_unit_conversion"),
  nextTask:p.preflightDecision.nextTask
}));
