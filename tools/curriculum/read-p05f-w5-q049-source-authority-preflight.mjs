import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {materializeP05EW5DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import {materializeR04SharedRuntimeCapabilityMatrix} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {materializeR05DeliveryWaveRebase} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),"utf8"));
const KP="kp_g6b_u03_prism_surface_area";
const queue=materializeP05EW5DirectProductVerticalSliceQueue();
if(queue.status!=="W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN"||!queue.queueFrozen||!queue.queueRegistryParity) throw new Error("Q049_QUEUE_NOT_FROZEN");
const row=queue.queueEntries.find(x=>x.queuePosition===49);
if(!row) throw new Error("Q049_FROZEN_ROW_MISSING");
if(row.implementationTaskId!=="P05F_W5DirectProductVerticalSlice049Implementation") throw new Error(`Q049_TASK:${row.implementationTaskId}`);
if(row.previousSliceId!=="p05e_q048_r4_g5b_u07_5b07_profile_spatial_solid_c1") throw new Error(`Q049_PREDECESSOR:${row.previousSliceId}`);
if(row.primarySourceNodeId!=="g6b_u03_6b03") throw new Error(`Q049_SOURCE:${row.primarySourceNodeId}`);
if(row.primaryRuntimeProfileId!=="profile_spatial_solid") throw new Error(`Q049_PROFILE:${row.primaryRuntimeProfileId}`);
if(row.intraWavePrerequisiteRank!==4) throw new Error(`Q049_RANK:${row.intraWavePrerequisiteRank}`);
if(JSON.stringify(row.knowledgePointIds)!==JSON.stringify([KP])) throw new Error(`Q049_KPS:${JSON.stringify(row.knowledgePointIds)}`);

const preflight=read("data/curriculum/full-product/p05f/q049-g6b-u03-prism-surface-area-source-authority-preflight.json");
if(preflight.previousSliceD0Evidence.status!=="PASS_E6_D0_COMPLETE") throw new Error(`Q049_PREDECESSOR_D0:${preflight.previousSliceD0Evidence.status}`);
if(preflight.previousSliceD0Evidence.productMergeSha!=="7de4019ff3957e77aa035fc03d01f38f750271ad") throw new Error("Q049_Q048_MERGE_EVIDENCE_MISMATCH");
if(preflight.previousSliceD0Evidence.prGateRunId!=="34913966250") throw new Error("Q049_Q048_PR_GATE_EVIDENCE_MISMATCH");
if(preflight.previousSliceD0Evidence.pagesDeploymentRunId!=="34914077928") throw new Error("Q049_Q048_PAGES_DEPLOY_EVIDENCE_MISMATCH");
if(preflight.previousSliceD0Evidence.exactPagesRunId!=="34914077936") throw new Error("Q049_Q048_EXACT_PAGES_EVIDENCE_MISMATCH");

const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-08.json");
const source=r02.sourceRecords.find(x=>x.sourceNodeId===row.primarySourceNodeId);
if(!source) throw new Error(`Q049_R02_SOURCE_MISSING:${row.primarySourceNodeId}`);
const candidate=source.candidates.find(x=>x.knowledgePointId===KP);
if(!candidate) throw new Error(`Q049_R02_KP_MISSING:${KP}`);
if(candidate.capabilityStatement!=="學生能加總兩個底面與各側面求表面積。") throw new Error("Q049_R02_CAPABILITY_MISMATCH");
if(candidate.reasoningInvariant!=="所有外露面恰計一次，側面展開總寬等於底面周長。") throw new Error("Q049_R02_INVARIANT_MISMATCH");
if(preflight.sourceAuthority.currentDirectVisualVerification.completed!==true) throw new Error("Q049_DIRECT_VISUAL_VERIFICATION_MISSING");
if(preflight.sourceAuthority.currentDirectVisualVerification.r02SemanticAuthorityPreserved!==true) throw new Error("Q049_R02_SEMANTIC_AUTHORITY_NOT_PRESERVED");
if(preflight.sourceAuthority.ocrUsedAsAuthority!==false) throw new Error("Q049_OCR_AUTHORITY_FORBIDDEN");
if(preflight.sourceAuthority.sourceRefAmbiguity!==false||preflight.sourceAuthority.manualSourceChoiceRequired!==false) throw new Error("Q049_SOURCE_AMBIGUITY");

const r04=materializeR04SharedRuntimeCapabilityMatrix();
const r05=materializeR05DeliveryWaveRebase();
const mapping=r04.getMapping(KP);
if(!mapping) throw new Error(`Q049_R04_MAPPING_MISSING:${KP}`);
if(mapping.mappingId!=="r04map_g6b_u03_prism_surface_area") throw new Error(`Q049_MAPPING:${mapping.mappingId}`);
if(mapping.primaryRuntimeProfileId!==row.primaryRuntimeProfileId) throw new Error(`Q049_PROFILE_MISMATCH:${mapping.primaryRuntimeProfileId}`);
if(mapping.classificationRuleId!=="rule_spatial_solid") throw new Error(`Q049_RULE_MISMATCH:${mapping.classificationRuleId}`);
if(mapping.appliedModifierIds.length!==0) throw new Error(`Q049_MODIFIERS:${JSON.stringify(mapping.appliedModifierIds)}`);
if(JSON.stringify(mapping.optionalRuntimeCapabilityIds)!==JSON.stringify(["cap_geometry_construction"])) throw new Error(`Q049_MAPPING_OPTIONAL:${JSON.stringify(mapping.optionalRuntimeCapabilityIds)}`);
if(mapping.forbiddenRuntimeCapabilityIds.length!==0) throw new Error(`Q049_MAPPING_FORBIDDEN:${JSON.stringify(mapping.forbiddenRuntimeCapabilityIds)}`);
const bound=preflight.runtimeCapabilityAuthority.mappings.find(x=>x.knowledgePointId===KP);
if(!bound||JSON.stringify(bound.requiredRuntimeCapabilityIds)!==JSON.stringify(mapping.requiredRuntimeCapabilityIds)) throw new Error("Q049_BOUND_MAPPING_REQUIRED");
const assignment=r05.getAssignment(KP);
if(!assignment) throw new Error(`Q049_R05_ASSIGNMENT_MISSING:${KP}`);
if(assignment.deliveryWaveId!=="R05-W5") throw new Error(`Q049_WAVE_MISMATCH:${assignment.deliveryWaveId}`);
if(assignment.intraWavePrerequisiteRank!==4) throw new Error(`Q049_R05_RANK_MISMATCH:${assignment.intraWavePrerequisiteRank}`);
if(assignment.primaryRuntimeProfileId!=="profile_spatial_solid") throw new Error(`Q049_R05_PROFILE_MISMATCH:${assignment.primaryRuntimeProfileId}`);
if(JSON.stringify([...assignment.contractOnlyRequiredCapabilityIds].sort())!==JSON.stringify([...row.requiredW5CapabilityIds].sort())) throw new Error("Q049_W5_CAPABILITY_MISMATCH");

const protectedOwnership={
  kp_g6b_u03_prism_base_area_height_volume:55,
  kp_g6b_u03_triangular_prism_volume:60,
  kp_g6b_u03_composite_prism_volume_surface:60,
};
for(const [kp,position] of Object.entries(protectedOwnership)){
  const protectedRow=queue.queueEntries.find(x=>x.knowledgePointIds.includes(kp));
  if(!protectedRow||protectedRow.queuePosition!==position) throw new Error(`Q049_PROTECTED_OWNERSHIP:${kp}:${protectedRow?.queuePosition}`);
  if(preflight.q049ScopeLock.protectedFrozenQueueOwnership[kp]!==`Q${String(position).padStart(3,"0")}`) throw new Error(`Q049_PROTECTED_SCOPE_LOCK:${kp}`);
}
if(queue.queueEntries.some(x=>x.knowledgePointIds.includes("kp_g6b_u03_cylinder_volume"))) throw new Error("Q049_CYLINDER_VOLUME_UNEXPECTED_W5_OWNER");
if(preflight.preflightDecision.nextTaskRequiresNewOperatorApproval!==true) throw new Error("Q049_IMPLEMENTATION_APPROVAL_BOUNDARY_MISSING");

const report={
  schemaName:"P05FW5Q049SourceAuthorityReadbackV1",
  status:"PASS_Q049_EXACT_AUTHORITY_READBACK",
  queue:row,
  queueRegistry:{queueVersion:queue.derivedRegistrySnapshot.queueVersion,queueDigest:queue.derivedRegistrySnapshot.queueDigest,queueFrozen:queue.queueFrozen,queueRegistryParity:queue.queueRegistryParity},
  predecessorD0:preflight.previousSliceD0Evidence,
  sourceIdentity:{
    sourceNodeId:preflight.sourceAuthority.sourceNodeId,
    sourceTitle:preflight.sourceAuthority.sourceTitle,
    sourcePdfTitle:preflight.sourceAuthority.sourcePdfTitle,
    sourcePdfDriveFileId:preflight.sourceAuthority.sourcePdfDriveFileId,
    sourceMetadataDriveFileId:preflight.sourceAuthority.sourceMetadataDriveFileId,
    verificationNotesDriveFileId:preflight.sourceAuthority.verificationNotesDriveFileId,
    sourceUrl:preflight.sourceAuthority.sourceUrl,
    pageCount:preflight.sourceAuthority.pageCount,
    reviewedPages:preflight.sourceAuthority.reviewedPages,
    legacyVerificationStatus:preflight.sourceAuthority.legacyVerificationNotesState.status,
    currentDirectVisualVerification:preflight.sourceAuthority.currentDirectVisualVerification.completed,
    ocrUsedAsAuthority:preflight.sourceAuthority.ocrUsedAsAuthority
  },
  r02:{sourceNodeId:source.sourceNodeId,sourceTitle:source.sourceTitle,sourcePdfTitle:source.sourcePdfTitle,pageCount:source.pageCount,reviewedPages:source.reviewedPages,candidate,sameSourceCandidateIds:source.candidates.map(x=>x.knowledgePointId)},
  r04:{knowledgePointId:mapping.knowledgePointId,mappingId:mapping.mappingId,primaryRuntimeProfileId:mapping.primaryRuntimeProfileId,classificationRuleId:mapping.classificationRuleId,appliedModifierIds:mapping.appliedModifierIds,requiredRuntimeCapabilityIds:mapping.requiredRuntimeCapabilityIds,optionalRuntimeCapabilityIds:mapping.optionalRuntimeCapabilityIds,forbiddenRuntimeCapabilityIds:mapping.forbiddenRuntimeCapabilityIds},
  r05:{knowledgePointId:assignment.knowledgePointId,deliveryWaveId:assignment.deliveryWaveId,intraWavePrerequisiteRank:assignment.intraWavePrerequisiteRank,primaryRuntimeProfileId:assignment.primaryRuntimeProfileId,effectiveRequiredRuntimeCapabilityIds:assignment.effectiveRequiredRuntimeCapabilityIds,contractOnlyRequiredCapabilityIds:assignment.contractOnlyRequiredCapabilityIds},
  protectedFrozenQueueOwnership:preflight.q049ScopeLock.protectedFrozenQueueOwnership,
  protectedNonW5SiblingCandidateIds:preflight.q049ScopeLock.protectedNonW5SiblingCandidateIds,
  implementationApprovalRequired:preflight.preflightDecision.nextTaskRequiresNewOperatorApproval,
};
process.stdout.write(`P05F49_PREFLIGHT_READBACK=${JSON.stringify(report)}\n`);
