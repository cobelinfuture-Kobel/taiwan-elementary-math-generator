import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {materializeP05EW5DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import {materializeR04SharedRuntimeCapabilityMatrix} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {materializeR05DeliveryWaveRebase} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),"utf8"));
const queue=materializeP05EW5DirectProductVerticalSliceQueue();
if(queue.status!=="W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN"||!queue.queueFrozen||!queue.queueRegistryParity) throw new Error("Q037_QUEUE_NOT_FROZEN");
const row=queue.queueEntries.find(x=>x.queuePosition===37);
if(!row) throw new Error("Q037_FROZEN_ROW_MISSING");
if(row.implementationTaskId!=="P05F_W5DirectProductVerticalSlice037Implementation") throw new Error(`Q037_TASK:${row.implementationTaskId}`);
if(row.previousSliceId!=="p05e_q036_r3_g5a_u07_5a07_profile_geometry_property_c1") throw new Error(`Q037_PREDECESSOR:${row.previousSliceId}`);
if(row.primarySourceNodeId!=="g5a_u09_5a09") throw new Error(`Q037_SOURCE:${row.primarySourceNodeId}`);
if(row.primaryRuntimeProfileId!=="profile_geometry_formula") throw new Error(`Q037_PROFILE:${row.primaryRuntimeProfileId}`);
if(row.intraWavePrerequisiteRank!==3) throw new Error(`Q037_RANK:${row.intraWavePrerequisiteRank}`);
if(JSON.stringify(row.knowledgePointIds)!==JSON.stringify(["kp_g5a_u09_parallelogram_area_formula"])) throw new Error(`Q037_KPS:${JSON.stringify(row.knowledgePointIds)}`);

const preflight=read("data/curriculum/full-product/p05f/q037-g5a-u09-parallelogram-area-formula-source-authority-preflight.json");
if(preflight.previousSliceD0Evidence.status!=="PASS_E6_D0_COMPLETE") throw new Error(`Q037_PREDECESSOR_D0:${preflight.previousSliceD0Evidence.status}`);
if(preflight.previousSliceD0Evidence.productMergeSha!=="f4fa2905df9bd3e99d1772e6f71d724ce4221815") throw new Error("Q037_Q036_MERGE_EVIDENCE_MISMATCH");

const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-03.json");
const source=r02.sourceRecords.find(x=>x.sourceNodeId===row.primarySourceNodeId);
if(!source) throw new Error(`Q037_R02_SOURCE_MISSING:${row.primarySourceNodeId}`);
const candidate=source.candidates.find(x=>x.knowledgePointId===row.knowledgePointIds[0]);
if(!candidate) throw new Error(`Q037_R02_KP_MISSING:${row.knowledgePointIds[0]}`);
if(candidate.capabilityStatement!=="學生能以底乘高求平行四邊形面積。") throw new Error("Q037_R02_CAPABILITY_MISMATCH");
if(candidate.reasoningInvariant!=="剪拼為等底等高長方形後面積不變。") throw new Error("Q037_R02_INVARIANT_MISMATCH");
if(!preflight.sourceAuthority.verificationStateReconciliation.currentDirectPdfVisualVerificationCompleted) throw new Error("Q037_DIRECT_VISUAL_VERIFICATION_MISSING");
if(JSON.stringify(preflight.sourceAuthority.targetEvidenceReconciliation.parallelogramAreaFormula.directVisualCorroborationPages)!==JSON.stringify([1,2])) throw new Error("Q037_DIRECT_VISUAL_PAGE_BINDING_MISMATCH");

const r04=materializeR04SharedRuntimeCapabilityMatrix();
const mapping=r04.getMapping(candidate.knowledgePointId);
if(!mapping) throw new Error(`Q037_R04_MAPPING_MISSING:${candidate.knowledgePointId}`);
if(mapping.mappingId!=="r04map_g5a_u09_parallelogram_area_formula") throw new Error(`Q037_MAPPING:${mapping.mappingId}`);
if(mapping.primaryRuntimeProfileId!==row.primaryRuntimeProfileId) throw new Error(`Q037_PROFILE_MISMATCH:${mapping.primaryRuntimeProfileId}`);
if(mapping.classificationRuleId!=="rule_geometry_formula") throw new Error(`Q037_RULE_MISMATCH:${mapping.classificationRuleId}`);
if(mapping.appliedModifierIds.length!==0) throw new Error(`Q037_MODIFIERS:${JSON.stringify(mapping.appliedModifierIds)}`);

const r05=materializeR05DeliveryWaveRebase();
const assignment=r05.getAssignment(candidate.knowledgePointId);
if(!assignment) throw new Error(`Q037_R05_ASSIGNMENT_MISSING:${candidate.knowledgePointId}`);
if(assignment.deliveryWaveId!=="R05-W5") throw new Error(`Q037_WAVE_MISMATCH:${assignment.deliveryWaveId}`);
if(assignment.intraWavePrerequisiteRank!==3) throw new Error(`Q037_R05_RANK_MISMATCH:${assignment.intraWavePrerequisiteRank}`);
const contractOnlyRequired=[...assignment.contractOnlyRequiredCapabilityIds].sort();
const frozenRequired=[...row.requiredW5CapabilityIds].sort();
if(JSON.stringify(contractOnlyRequired)!==JSON.stringify(frozenRequired)) throw new Error(`Q037_W5_CAPABILITY_MISMATCH:${JSON.stringify({contractOnlyRequired,frozenRequired})}`);

const futureOwnership={
  kp_g5a_u09_triangle_area_formula:46,
  kp_g5a_u09_trapezoid_area_formula:46,
  kp_g5a_u09_area_unknown_dimension:57,
  kp_g5a_u09_composite_polygon_area:62,
};
for(const [kp,position] of Object.entries(futureOwnership)){
  const futureRow=queue.queueEntries.find(x=>x.knowledgePointIds.includes(kp));
  if(!futureRow||futureRow.queuePosition!==position) throw new Error(`Q037_FUTURE_OWNERSHIP:${kp}:${futureRow?.queuePosition}`);
  if(preflight.q037ScopeLock.deferredFrozenQueueOwnership[kp]!==`Q${String(position).padStart(3,"0")}`) throw new Error(`Q037_FUTURE_SCOPE_LOCK:${kp}`);
}
if(preflight.preflightDecision.nextTaskRequiresNewOperatorApproval!==true) throw new Error("Q037_IMPLEMENTATION_APPROVAL_BOUNDARY_MISSING");

const report={
  schemaName:"P05FW5Q037SourceAuthorityReadbackV1",
  status:"PASS_Q037_EXACT_AUTHORITY_READBACK",
  queue:row,
  queueRegistry:{queueVersion:queue.derivedRegistrySnapshot.queueVersion,queueDigest:queue.derivedRegistrySnapshot.queueDigest,queueFrozen:queue.queueFrozen,queueRegistryParity:queue.queueRegistryParity},
  predecessorD0:preflight.previousSliceD0Evidence,
  r02:{sourceNodeId:source.sourceNodeId,sourceTitle:source.sourceTitle,sourcePdfTitle:source.sourcePdfTitle,pageCount:source.pageCount,reviewedPages:source.reviewedPages,candidate,sameSourceCandidateIds:source.candidates.map(x=>x.knowledgePointId)},
  directPdfVisualEvidence:preflight.sourceAuthority.targetEvidenceReconciliation.parallelogramAreaFormula,
  r04:{knowledgePointId:mapping.knowledgePointId,mappingId:mapping.mappingId,primaryRuntimeProfileId:mapping.primaryRuntimeProfileId,classificationRuleId:mapping.classificationRuleId,appliedModifierIds:mapping.appliedModifierIds,requiredRuntimeCapabilityIds:mapping.requiredRuntimeCapabilityIds,optionalRuntimeCapabilityIds:mapping.optionalRuntimeCapabilityIds,forbiddenRuntimeCapabilityIds:mapping.forbiddenRuntimeCapabilityIds,runtimeCapabilityDeliveryState:mapping.runtimeCapabilityDeliveryState,undeliveredRequiredCapabilityIds:mapping.undeliveredRequiredCapabilityIds},
  r05:{knowledgePointId:assignment.knowledgePointId,deliveryWaveId:assignment.deliveryWaveId,intraWavePrerequisiteRank:assignment.intraWavePrerequisiteRank,primaryRuntimeProfileId:assignment.primaryRuntimeProfileId,effectiveRequiredRuntimeCapabilityIds:assignment.effectiveRequiredRuntimeCapabilityIds,contractOnlyRequiredCapabilityIds:assignment.contractOnlyRequiredCapabilityIds},
  contractOnlyRequiredCapabilityIds:contractOnlyRequired,
  deferredFrozenQueueOwnership:preflight.q037ScopeLock.deferredFrozenQueueOwnership,
  implementationApprovalRequired:preflight.preflightDecision.nextTaskRequiresNewOperatorApproval,
};
process.stdout.write(`P05F37_PREFLIGHT_READBACK=${JSON.stringify(report)}\n`);
