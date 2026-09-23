import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {materializeP05EW5DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import {materializeR04SharedRuntimeCapabilityMatrix} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {materializeR05DeliveryWaveRebase} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),"utf8"));
const queue=materializeP05EW5DirectProductVerticalSliceQueue();
if(queue.status!=="W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN"||!queue.queueFrozen||!queue.queueRegistryParity) throw new Error("Q038_QUEUE_NOT_FROZEN");
const row=queue.queueEntries.find(x=>x.queuePosition===38);
if(!row) throw new Error("Q038_FROZEN_ROW_MISSING");
if(row.implementationTaskId!=="P05F_W5DirectProductVerticalSlice038Implementation") throw new Error(`Q038_TASK:${row.implementationTaskId}`);
if(row.previousSliceId!=="p05e_q037_r3_g5a_u09_5a09_profile_geometry_formula_c1") throw new Error(`Q038_PREDECESSOR:${row.previousSliceId}`);
if(row.primarySourceNodeId!=="g5a_u10_5a10a1") throw new Error(`Q038_SOURCE:${row.primarySourceNodeId}`);
if(row.primaryRuntimeProfileId!=="profile_spatial_solid") throw new Error(`Q038_PROFILE:${row.primaryRuntimeProfileId}`);
if(row.intraWavePrerequisiteRank!==3) throw new Error(`Q038_RANK:${row.intraWavePrerequisiteRank}`);
if(JSON.stringify(row.knowledgePointIds)!==JSON.stringify(["kp_g5a_u10a1_cube_cuboid_spatial_reasoning"])) throw new Error(`Q038_KPS:${JSON.stringify(row.knowledgePointIds)}`);

const preflight=read("data/curriculum/full-product/p05f/q038-g5a-u10a1-cube-cuboid-spatial-reasoning-source-authority-preflight.json");
if(preflight.previousSliceD0Evidence.status!=="PASS_E6_D0_COMPLETE") throw new Error(`Q038_PREDECESSOR_D0:${preflight.previousSliceD0Evidence.status}`);
if(preflight.previousSliceD0Evidence.productMergeSha!=="750071e39f7dd59b87c7dd75f93427a4cc489a19") throw new Error("Q038_Q037_MERGE_EVIDENCE_MISMATCH");

const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-03.json");
const source=r02.sourceRecords.find(x=>x.sourceNodeId===row.primarySourceNodeId);
if(!source) throw new Error(`Q038_R02_SOURCE_MISSING:${row.primarySourceNodeId}`);
const candidate=source.candidates.find(x=>x.knowledgePointId===row.knowledgePointIds[0]);
if(!candidate) throw new Error(`Q038_R02_KP_MISSING:${row.knowledgePointIds[0]}`);
if(candidate.capabilityStatement!=="學生能由缺面、塗色或切割條件推論立體關係。") throw new Error("Q038_R02_CAPABILITY_MISMATCH");
if(candidate.reasoningInvariant!=="推論必須保持面、稜、頂點的固定鄰接結構。") throw new Error("Q038_R02_INVARIANT_MISMATCH");

const q029Visual=read("data/curriculum/full-product/p05f/q029-g5a-u10a1-cube-cuboid-net-source-visual-pattern-contract.json");
if(q029Visual.sourceAuthority.sourcePdfDriveFileId!==preflight.sourceAuthority.sourcePdfDriveFileId) throw new Error("Q038_Q029_SOURCE_IDENTITY_MISMATCH");
if(!q029Visual.sourceAuthority.directVisualEvidence.page1.observedPanels.includes("正方體切割後表面積變化")) throw new Error("Q038_Q029_CUTTING_EVIDENCE_MISSING");
if(!q029Visual.sourceAuthority.directVisualEvidence.page2.observedPanels.includes("由正方體三個視圖在展開圖標色")) throw new Error("Q038_Q029_COLOR_VIEW_EVIDENCE_MISSING");
if(q029Visual.scopeGuard.q038CubeCuboidSpatialReasoningTouched!==false) throw new Error("Q038_Q029_PRIOR_SCOPE_GUARD_MISMATCH");

const r04=materializeR04SharedRuntimeCapabilityMatrix();
const mapping=r04.getMapping(candidate.knowledgePointId);
if(!mapping) throw new Error(`Q038_R04_MAPPING_MISSING:${candidate.knowledgePointId}`);
if(mapping.mappingId!=="r04map_g5a_u10a1_cube_cuboid_spatial_reasoning") throw new Error(`Q038_MAPPING:${mapping.mappingId}`);
if(mapping.primaryRuntimeProfileId!==row.primaryRuntimeProfileId) throw new Error(`Q038_PROFILE_MISMATCH:${mapping.primaryRuntimeProfileId}`);
if(mapping.classificationRuleId!=="rule_spatial_solid") throw new Error(`Q038_RULE_MISMATCH:${mapping.classificationRuleId}`);
if(mapping.appliedModifierIds.length!==0) throw new Error(`Q038_MODIFIERS:${JSON.stringify(mapping.appliedModifierIds)}`);
const profile=r04.profiles.find(x=>x.profileId==="profile_spatial_solid");
if(!profile) throw new Error("Q038_PROFILE_AUTHORITY_MISSING");
if(JSON.stringify(profile.optionalCapabilityIds)!==JSON.stringify(["cap_geometry_construction"])) throw new Error(`Q038_PROFILE_OPTIONAL:${JSON.stringify(profile.optionalCapabilityIds)}`);
if(JSON.stringify(mapping.optionalRuntimeCapabilityIds)!==JSON.stringify(["cap_geometry_construction"])) throw new Error(`Q038_MAPPING_OPTIONAL:${JSON.stringify(mapping.optionalRuntimeCapabilityIds)}`);
if(mapping.forbiddenRuntimeCapabilityIds.length!==0) throw new Error(`Q038_MAPPING_FORBIDDEN:${JSON.stringify(mapping.forbiddenRuntimeCapabilityIds)}`);

const r05=materializeR05DeliveryWaveRebase();
const assignment=r05.getAssignment(candidate.knowledgePointId);
if(!assignment) throw new Error(`Q038_R05_ASSIGNMENT_MISSING:${candidate.knowledgePointId}`);
if(assignment.deliveryWaveId!=="R05-W5") throw new Error(`Q038_WAVE_MISMATCH:${assignment.deliveryWaveId}`);
if(assignment.intraWavePrerequisiteRank!==3) throw new Error(`Q038_R05_RANK_MISMATCH:${assignment.intraWavePrerequisiteRank}`);
const contractOnlyRequired=[...assignment.contractOnlyRequiredCapabilityIds].sort();
const frozenRequired=[...row.requiredW5CapabilityIds].sort();
if(JSON.stringify(contractOnlyRequired)!==JSON.stringify(frozenRequired)) throw new Error(`Q038_W5_CAPABILITY_MISMATCH:${JSON.stringify({contractOnlyRequired,frozenRequired})}`);
if(frozenRequired.includes("cap_geometry_construction")) throw new Error("Q038_OPTIONAL_CONSTRUCTION_PROMOTED_TO_W5_REQUIRED");

const protectedOwnership={
  kp_g5a_u10a1_cube_cuboid_faces_edges_vertices:8,
  kp_g5a_u10a1_cube_cuboid_edge_length:18,
  kp_g5a_u10a1_cube_cuboid_face_relationship:18,
  kp_g5a_u10a1_cube_cuboid_net:29,
};
for(const [kp,position] of Object.entries(protectedOwnership)){
  const protectedRow=queue.queueEntries.find(x=>x.knowledgePointIds.includes(kp));
  if(!protectedRow||protectedRow.queuePosition!==position) throw new Error(`Q038_PROTECTED_OWNERSHIP:${kp}:${protectedRow?.queuePosition}`);
  if(preflight.q038ScopeLock.protectedFrozenQueueOwnership[kp]!==`Q${String(position).padStart(3,"0")}`) throw new Error(`Q038_PROTECTED_SCOPE_LOCK:${kp}`);
}
if(preflight.preflightDecision.nextTaskRequiresNewOperatorApproval!==true) throw new Error("Q038_IMPLEMENTATION_APPROVAL_BOUNDARY_MISSING");

const report={
  schemaName:"P05FW5Q038SourceAuthorityReadbackV1",
  status:"PASS_Q038_EXACT_AUTHORITY_READBACK",
  queue:row,
  queueRegistry:{queueVersion:queue.derivedRegistrySnapshot.queueVersion,queueDigest:queue.derivedRegistrySnapshot.queueDigest,queueFrozen:queue.queueFrozen,queueRegistryParity:queue.queueRegistryParity},
  predecessorD0:preflight.previousSliceD0Evidence,
  r02:{sourceNodeId:source.sourceNodeId,sourceTitle:source.sourceTitle,sourcePdfTitle:source.sourcePdfTitle,pageCount:source.pageCount,reviewedPages:source.reviewedPages,candidate,sameSourceCandidateIds:source.candidates.map(x=>x.knowledgePointId)},
  q029VisualReuse:preflight.sourceAuthority.targetEvidenceReconciliation.cubeCuboidSpatialReasoning,
  r04:{knowledgePointId:mapping.knowledgePointId,mappingId:mapping.mappingId,primaryRuntimeProfileId:mapping.primaryRuntimeProfileId,classificationRuleId:mapping.classificationRuleId,appliedModifierIds:mapping.appliedModifierIds,requiredRuntimeCapabilityIds:mapping.requiredRuntimeCapabilityIds,optionalRuntimeCapabilityIds:mapping.optionalRuntimeCapabilityIds,forbiddenRuntimeCapabilityIds:mapping.forbiddenRuntimeCapabilityIds},
  r05:{knowledgePointId:assignment.knowledgePointId,deliveryWaveId:assignment.deliveryWaveId,intraWavePrerequisiteRank:assignment.intraWavePrerequisiteRank,primaryRuntimeProfileId:assignment.primaryRuntimeProfileId,effectiveRequiredRuntimeCapabilityIds:assignment.effectiveRequiredRuntimeCapabilityIds,contractOnlyRequiredCapabilityIds:assignment.contractOnlyRequiredCapabilityIds},
  contractOnlyRequiredCapabilityIds:contractOnlyRequired,
  protectedFrozenQueueOwnership:preflight.q038ScopeLock.protectedFrozenQueueOwnership,
  implementationApprovalRequired:preflight.preflightDecision.nextTaskRequiresNewOperatorApproval,
};
process.stdout.write(`P05F38_PREFLIGHT_READBACK=${JSON.stringify(report)}\n`);
