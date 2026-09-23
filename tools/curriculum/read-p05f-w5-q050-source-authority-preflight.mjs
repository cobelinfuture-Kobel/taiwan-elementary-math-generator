import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {materializeP05EW5DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import {materializeR04SharedRuntimeCapabilityMatrix} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {materializeR05DeliveryWaveRebase} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),"utf8"));
const KP="kp_g4b_u07_composite_perimeter";
const queue=materializeP05EW5DirectProductVerticalSliceQueue();
if(queue.status!=="W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN"||!queue.queueFrozen||!queue.queueRegistryParity) throw new Error("Q050_QUEUE_NOT_FROZEN");
const row=queue.queueEntries.find(x=>x.queuePosition===50);
if(!row) throw new Error("Q050_FROZEN_ROW_MISSING");
if(row.implementationTaskId!=="P05F_W5DirectProductVerticalSlice050Implementation") throw new Error(`Q050_TASK:${row.implementationTaskId}`);
if(row.previousSliceId!=="p05e_q049_r4_g6b_u03_6b03_profile_spatial_solid_c1") throw new Error(`Q050_PREDECESSOR:${row.previousSliceId}`);
if(row.primarySourceNodeId!=="g4b_u07_4b07") throw new Error(`Q050_SOURCE:${row.primarySourceNodeId}`);
if(row.primaryRuntimeProfileId!=="profile_geometry_formula") throw new Error(`Q050_PROFILE:${row.primaryRuntimeProfileId}`);
if(row.intraWavePrerequisiteRank!==5) throw new Error(`Q050_RANK:${row.intraWavePrerequisiteRank}`);
if(JSON.stringify(row.knowledgePointIds)!==JSON.stringify([KP])) throw new Error(`Q050_KPS:${JSON.stringify(row.knowledgePointIds)}`);

const preflight=read("data/curriculum/full-product/p05f/q050-g4b-u07-composite-perimeter-source-authority-preflight.json");
if(preflight.previousSliceD0Evidence.status!=="PASS_E6_D0_COMPLETE") throw new Error(`Q050_PREDECESSOR_D0:${preflight.previousSliceD0Evidence.status}`);
if(preflight.previousSliceD0Evidence.productMergeSha!=="59d913da8c2e954a080d3f0ff6464145402ef662") throw new Error("Q050_Q049_MERGE_EVIDENCE_MISMATCH");
if(preflight.previousSliceD0Evidence.prGateRunId!=="34920521923") throw new Error("Q050_Q049_PR_GATE_EVIDENCE_MISMATCH");
if(preflight.previousSliceD0Evidence.pagesDeploymentRunId!=="34920618442") throw new Error("Q050_Q049_PAGES_DEPLOY_EVIDENCE_MISMATCH");
if(preflight.previousSliceD0Evidence.exactPagesRunId!=="34920618367") throw new Error("Q050_Q049_EXACT_PAGES_EVIDENCE_MISMATCH");

const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-02.json");
const source=r02.sourceRecords.find(x=>x.sourceNodeId===row.primarySourceNodeId);
if(!source) throw new Error(`Q050_R02_SOURCE_MISSING:${row.primarySourceNodeId}`);
const candidate=source.candidates.find(x=>x.knowledgePointId===KP);
if(!candidate) throw new Error(`Q050_R02_KP_MISSING:${KP}`);
if(candidate.capabilityStatement!=="學生能辨認複合圖形外框並求周長。") throw new Error("Q050_R02_CAPABILITY_MISMATCH");
if(candidate.reasoningInvariant!=="共用內部邊不計入周長，缺邊可由對應長度關係補出。") throw new Error("Q050_R02_INVARIANT_MISMATCH");
if(preflight.sourceAuthority.ocrUsedAsAuthority!==false) throw new Error("Q050_OCR_AUTHORITY_FORBIDDEN");
if(preflight.sourceAuthority.sourceRefAmbiguity!==false||preflight.sourceAuthority.manualSourceChoiceRequired!==false) throw new Error("Q050_SOURCE_AMBIGUITY");

const r04=materializeR04SharedRuntimeCapabilityMatrix();
const r05=materializeR05DeliveryWaveRebase();
const mapping=r04.getMapping(KP);
if(!mapping) throw new Error(`Q050_R04_MAPPING_MISSING:${KP}`);
if(mapping.mappingId!=="r04map_g4b_u07_composite_perimeter") throw new Error(`Q050_MAPPING:${mapping.mappingId}`);
if(mapping.primaryRuntimeProfileId!==row.primaryRuntimeProfileId) throw new Error(`Q050_PROFILE_MISMATCH:${mapping.primaryRuntimeProfileId}`);
if(mapping.classificationRuleId!=="rule_geometry_formula") throw new Error(`Q050_RULE_MISMATCH:${mapping.classificationRuleId}`);
if(mapping.appliedModifierIds.length!==0) throw new Error(`Q050_MODIFIERS:${JSON.stringify(mapping.appliedModifierIds)}`);
if(mapping.optionalRuntimeCapabilityIds.length!==0) throw new Error(`Q050_MAPPING_OPTIONAL:${JSON.stringify(mapping.optionalRuntimeCapabilityIds)}`);
if(mapping.forbiddenRuntimeCapabilityIds.length!==0) throw new Error(`Q050_MAPPING_FORBIDDEN:${JSON.stringify(mapping.forbiddenRuntimeCapabilityIds)}`);
if(JSON.stringify(preflight.runtimeCapabilityAuthority.mapping.requiredRuntimeCapabilityIds)!==JSON.stringify(mapping.requiredRuntimeCapabilityIds)) throw new Error("Q050_BOUND_MAPPING_REQUIRED");
const assignment=r05.getAssignment(KP);
if(!assignment) throw new Error(`Q050_R05_ASSIGNMENT_MISSING:${KP}`);
if(assignment.deliveryWaveId!=="R05-W5") throw new Error(`Q050_WAVE_MISMATCH:${assignment.deliveryWaveId}`);
if(assignment.intraWavePrerequisiteRank!==5) throw new Error(`Q050_R05_RANK_MISMATCH:${assignment.intraWavePrerequisiteRank}`);
if(assignment.primaryRuntimeProfileId!=="profile_geometry_formula") throw new Error(`Q050_R05_PROFILE_MISMATCH:${assignment.primaryRuntimeProfileId}`);
if(JSON.stringify([...assignment.contractOnlyRequiredCapabilityIds].sort())!==JSON.stringify([...row.requiredW5CapabilityIds].sort())) throw new Error("Q050_W5_CAPABILITY_MISMATCH");

const protectedOwnership={
  kp_g4b_u07_rectangle_square_area_formula:26,
  kp_g4b_u07_composite_rectilinear_area:34,
  kp_g4b_u07_perimeter_path_sum:34,
  kp_g4b_u07_rectangle_square_perimeter_formula:43,
};
for(const [kp,position] of Object.entries(protectedOwnership)){
  const protectedRow=queue.queueEntries.find(x=>x.knowledgePointIds.includes(kp));
  if(!protectedRow||protectedRow.queuePosition!==position) throw new Error(`Q050_PROTECTED_OWNERSHIP:${kp}:${protectedRow?.queuePosition}`);
  if(preflight.q050ScopeLock.protectedExistingSameSourceKnowledgePointOwnership[kp]!==`Q${String(position).padStart(3,"0")}`) throw new Error(`Q050_PROTECTED_SCOPE_LOCK:${kp}`);
}
if(preflight.preflightDecision.nextTaskRequiresNewOperatorApproval!==true) throw new Error("Q050_IMPLEMENTATION_APPROVAL_BOUNDARY_MISSING");

const report={
  schemaName:"P05FW5Q050SourceAuthorityReadbackV1",
  status:"PASS_Q050_EXACT_AUTHORITY_READBACK",
  queue:row,
  queueRegistry:{queueVersion:queue.derivedRegistrySnapshot.queueVersion,queueDigest:queue.derivedRegistrySnapshot.queueDigest,queueFrozen:queue.queueFrozen,queueRegistryParity:queue.queueRegistryParity},
  predecessorD0:preflight.previousSliceD0Evidence,
  sourceIdentity:{sourceNodeId:preflight.sourceAuthority.sourceNodeId,sourceTitle:preflight.sourceAuthority.sourceTitle,sourcePdfTitle:preflight.sourceAuthority.sourcePdfTitle,sourcePdfDriveFileId:preflight.sourceAuthority.sourcePdfDriveFileId,sourceMetadataDriveFileId:preflight.sourceAuthority.sourceMetadataDriveFileId,verificationNotesDriveFileId:preflight.sourceAuthority.verificationNotesDriveFileId,pageCount:preflight.sourceAuthority.pageCount,reviewedPages:preflight.sourceAuthority.reviewedPages,targetEvidencePages:preflight.sourceAuthority.targetEvidencePages,ocrUsedAsAuthority:preflight.sourceAuthority.ocrUsedAsAuthority},
  r02:{sourceNodeId:source.sourceNodeId,sourceTitle:source.sourceTitle,sourcePdfTitle:source.sourcePdfTitle,pageCount:source.pageCount,reviewedPages:source.reviewedPages,candidate,sameSourceCandidateIds:source.candidates.map(x=>x.knowledgePointId)},
  r04:{knowledgePointId:mapping.knowledgePointId,mappingId:mapping.mappingId,primaryRuntimeProfileId:mapping.primaryRuntimeProfileId,classificationRuleId:mapping.classificationRuleId,appliedModifierIds:mapping.appliedModifierIds,requiredRuntimeCapabilityIds:mapping.requiredRuntimeCapabilityIds,optionalRuntimeCapabilityIds:mapping.optionalRuntimeCapabilityIds,forbiddenRuntimeCapabilityIds:mapping.forbiddenRuntimeCapabilityIds},
  r05:{knowledgePointId:assignment.knowledgePointId,deliveryWaveId:assignment.deliveryWaveId,intraWavePrerequisiteRank:assignment.intraWavePrerequisiteRank,primaryRuntimeProfileId:assignment.primaryRuntimeProfileId,effectiveRequiredRuntimeCapabilityIds:assignment.effectiveRequiredRuntimeCapabilityIds,contractOnlyRequiredCapabilityIds:assignment.contractOnlyRequiredCapabilityIds},
  protectedExistingSameSourceKnowledgePointOwnership:preflight.q050ScopeLock.protectedExistingSameSourceKnowledgePointOwnership,
  implementationApprovalRequired:preflight.preflightDecision.nextTaskRequiresNewOperatorApproval,
};
process.stdout.write(`P05F50_PREFLIGHT_READBACK=${JSON.stringify(report)}\n`);
