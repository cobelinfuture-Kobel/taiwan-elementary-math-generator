import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {materializeP05EW5DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import {materializeR04SharedRuntimeCapabilityMatrix} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {materializeR05DeliveryWaveRebase} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),"utf8"));
const queue=materializeP05EW5DirectProductVerticalSliceQueue();
if(queue.status!=="W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN"||!queue.queueFrozen||!queue.queueRegistryParity) throw new Error("Q036_QUEUE_NOT_FROZEN");
const row=queue.queueEntries.find(x=>x.queuePosition===36);
if(!row) throw new Error("Q036_FROZEN_ROW_MISSING");
if(row.implementationTaskId!=="P05F_W5DirectProductVerticalSlice036Implementation") throw new Error(`Q036_TASK:${row.implementationTaskId}`);
if(row.previousSliceId!=="p05e_q035_r3_g4b_u10_4b10_profile_spatial_solid_c1") throw new Error(`Q036_PREDECESSOR:${row.previousSliceId}`);
if(row.primarySourceNodeId!=="g5a_u07_5a07") throw new Error(`Q036_SOURCE:${row.primarySourceNodeId}`);
if(row.primaryRuntimeProfileId!=="profile_geometry_property") throw new Error(`Q036_PROFILE:${row.primaryRuntimeProfileId}`);
if(row.intraWavePrerequisiteRank!==3) throw new Error(`Q036_RANK:${row.intraWavePrerequisiteRank}`);
if(JSON.stringify(row.knowledgePointIds)!==JSON.stringify(["kp_g5a_u07_symmetric_point_distance"])) throw new Error(`Q036_KPS:${JSON.stringify(row.knowledgePointIds)}`);

const preflight=read("data/curriculum/full-product/p05f/q036-g5a-u07-symmetric-point-distance-source-authority-preflight.json");
if(preflight.previousSliceD0Evidence.status!=="PASS_E6_D0_COMPLETE") throw new Error(`Q036_PREDECESSOR_D0:${preflight.previousSliceD0Evidence.status}`);
if(preflight.previousSliceD0Evidence.productMergeSha!=="119fd7dae77083fb4cb54868957fbe1eab84996b") throw new Error("Q036_Q035_MERGE_EVIDENCE_MISMATCH");

const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-03.json");
const source=r02.sourceRecords.find(x=>x.sourceNodeId===row.primarySourceNodeId);
if(!source) throw new Error(`Q036_R02_SOURCE_MISSING:${row.primarySourceNodeId}`);
const candidate=source.candidates.find(x=>x.knowledgePointId===row.knowledgePointIds[0]);
if(!candidate) throw new Error(`Q036_R02_KP_MISSING:${row.knowledgePointIds[0]}`);
if(candidate.reasoningInvariant!=="對應點連線垂直於對稱軸，且兩點到軸距離相等。") throw new Error("Q036_R02_INVARIANT_MISMATCH");

const q006=read("data/curriculum/full-product/p05f/q006-g5a-u07-line-symmetry-recognition-source-authority-preflight.json");
const q016=read("data/curriculum/full-product/p05f/q016-g5a-u07-symmetry-axis-count-source-authority-preflight.json");
for(const prior of [q006,q016]){
  if(prior.sourceAuthority.sourcePdfDriveFileId!==preflight.sourceAuthority.sourcePdfDriveFileId) throw new Error("Q036_PRIOR_PDF_IDENTITY_MISMATCH");
  if(prior.sourceAuthority.sourceMetadataDriveFileId!==preflight.sourceAuthority.sourceMetadataDriveFileId) throw new Error("Q036_PRIOR_METADATA_IDENTITY_MISMATCH");
  if(prior.sourceAuthority.verificationNotesDriveFileId!==preflight.sourceAuthority.verificationNotesDriveFileId) throw new Error("Q036_PRIOR_NOTES_IDENTITY_MISMATCH");
}
if(!preflight.sourceAuthority.targetEvidenceReconciliation.symmetricPointDistance.q006PriorRestrictionReleasedOnlyForExactQ036Target) throw new Error("Q036_Q006_TARGET_RELEASE_MISSING");
if(!preflight.sourceAuthority.targetEvidenceReconciliation.symmetricPointDistance.q016PriorRestrictionReleasedOnlyForExactQ036Target) throw new Error("Q036_Q016_TARGET_RELEASE_MISSING");

const r04=materializeR04SharedRuntimeCapabilityMatrix();
const mapping=r04.getMapping(candidate.knowledgePointId);
if(!mapping) throw new Error(`Q036_R04_MAPPING_MISSING:${candidate.knowledgePointId}`);
if(mapping.mappingId!=="r04map_g5a_u07_symmetric_point_distance") throw new Error(`Q036_MAPPING:${mapping.mappingId}`);
if(mapping.primaryRuntimeProfileId!==row.primaryRuntimeProfileId) throw new Error(`Q036_PROFILE_MISMATCH:${mapping.primaryRuntimeProfileId}`);
const r05=materializeR05DeliveryWaveRebase();
const assignment=r05.getAssignment(candidate.knowledgePointId);
if(!assignment) throw new Error(`Q036_R05_ASSIGNMENT_MISSING:${candidate.knowledgePointId}`);
if(assignment.deliveryWaveId!=="R05-W5") throw new Error(`Q036_WAVE_MISMATCH:${assignment.deliveryWaveId}`);
if(assignment.intraWavePrerequisiteRank!==3) throw new Error(`Q036_R05_RANK_MISMATCH:${assignment.intraWavePrerequisiteRank}`);
const contractOnlyRequired=[...assignment.contractOnlyRequiredCapabilityIds].sort();
const frozenRequired=[...row.requiredW5CapabilityIds].sort();
if(JSON.stringify(contractOnlyRequired)!==JSON.stringify(frozenRequired)) throw new Error(`Q036_W5_CAPABILITY_MISMATCH:${JSON.stringify({contractOnlyRequired,frozenRequired})}`);
if(preflight.q036ScopeLock.protectedFrozenQueueOwnership.kp_g5a_u07_line_symmetry_recognition!=="Q006") throw new Error("Q036_Q006_OWNERSHIP_NOT_PROTECTED");
if(preflight.q036ScopeLock.protectedFrozenQueueOwnership.kp_g5a_u07_symmetry_axis_count!=="Q016") throw new Error("Q036_Q016_OWNERSHIP_NOT_PROTECTED");
if(preflight.q036ScopeLock.protectedFrozenQueueOwnership.kp_g5a_u07_complete_symmetric_figure!=="Q045") throw new Error("Q036_Q045_OWNERSHIP_NOT_PROTECTED");
if(preflight.preflightDecision.nextTaskRequiresNewOperatorApproval!==true) throw new Error("Q036_IMPLEMENTATION_APPROVAL_BOUNDARY_MISSING");

const report={
  schemaName:"P05FW5Q036SourceAuthorityReadbackV1",
  status:"PASS_Q036_EXACT_AUTHORITY_READBACK",
  queue:row,
  queueRegistry:{queueVersion:queue.derivedRegistrySnapshot.queueVersion,queueDigest:queue.derivedRegistrySnapshot.queueDigest,queueFrozen:queue.queueFrozen,queueRegistryParity:queue.queueRegistryParity},
  r02:{sourceNodeId:source.sourceNodeId,sourceTitle:source.sourceTitle,sourcePdfTitle:source.sourcePdfTitle,pageCount:source.pageCount,reviewedPages:source.reviewedPages,candidate,sameSourceCandidateIds:source.candidates.map(x=>x.knowledgePointId)},
  sameSourceIdentityReuse:{q006SourcePdfDriveFileId:q006.sourceAuthority.sourcePdfDriveFileId,q016SourcePdfDriveFileId:q016.sourceAuthority.sourcePdfDriveFileId,q036SourcePdfDriveFileId:preflight.sourceAuthority.sourcePdfDriveFileId},
  r04:{knowledgePointId:mapping.knowledgePointId,mappingId:mapping.mappingId,primaryRuntimeProfileId:mapping.primaryRuntimeProfileId,classificationRuleId:mapping.classificationRuleId,appliedModifierIds:mapping.appliedModifierIds,requiredRuntimeCapabilityIds:mapping.requiredRuntimeCapabilityIds,optionalRuntimeCapabilityIds:mapping.optionalRuntimeCapabilityIds,forbiddenRuntimeCapabilityIds:mapping.forbiddenRuntimeCapabilityIds,runtimeCapabilityDeliveryState:mapping.runtimeCapabilityDeliveryState,undeliveredRequiredCapabilityIds:mapping.undeliveredRequiredCapabilityIds},
  r05:{knowledgePointId:assignment.knowledgePointId,deliveryWaveId:assignment.deliveryWaveId,intraWavePrerequisiteRank:assignment.intraWavePrerequisiteRank,primaryRuntimeProfileId:assignment.primaryRuntimeProfileId,effectiveRequiredRuntimeCapabilityIds:assignment.effectiveRequiredRuntimeCapabilityIds,contractOnlyRequiredCapabilityIds:assignment.contractOnlyRequiredCapabilityIds},
  contractOnlyRequiredCapabilityIds:contractOnlyRequired,
  implementationApprovalRequired:preflight.preflightDecision.nextTaskRequiresNewOperatorApproval,
};
process.stdout.write(`P05F36_PREFLIGHT_READBACK=${JSON.stringify(report)}\n`);
