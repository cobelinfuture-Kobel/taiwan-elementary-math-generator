import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {materializeP05EW5DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import {materializeR04SharedRuntimeCapabilityMatrix} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {materializeR05DeliveryWaveRebase} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),"utf8"));
const KPS=["kp_g5b_u07_cube_surface_area","kp_g5b_u07_cuboid_surface_area"];
const queue=materializeP05EW5DirectProductVerticalSliceQueue();
if(queue.status!=="W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN"||!queue.queueFrozen||!queue.queueRegistryParity) throw new Error("Q048_QUEUE_NOT_FROZEN");
const row=queue.queueEntries.find(x=>x.queuePosition===48);
if(!row) throw new Error("Q048_FROZEN_ROW_MISSING");
if(row.implementationTaskId!=="P05F_W5DirectProductVerticalSlice048Implementation") throw new Error(`Q048_TASK:${row.implementationTaskId}`);
if(row.previousSliceId!=="p05e_q047_r4_g5b_u01_5b01_profile_spatial_solid_c1") throw new Error(`Q048_PREDECESSOR:${row.previousSliceId}`);
if(row.primarySourceNodeId!=="g5b_u07_5b07") throw new Error(`Q048_SOURCE:${row.primarySourceNodeId}`);
if(row.primaryRuntimeProfileId!=="profile_spatial_solid") throw new Error(`Q048_PROFILE:${row.primaryRuntimeProfileId}`);
if(row.intraWavePrerequisiteRank!==4) throw new Error(`Q048_RANK:${row.intraWavePrerequisiteRank}`);
if(JSON.stringify(row.knowledgePointIds)!==JSON.stringify(KPS)) throw new Error(`Q048_KPS:${JSON.stringify(row.knowledgePointIds)}`);

const preflight=read("data/curriculum/full-product/p05f/q048-g5b-u07-cube-cuboid-surface-area-source-authority-preflight.json");
if(preflight.previousSliceD0Evidence.status!=="PASS_E6_D0_COMPLETE") throw new Error(`Q048_PREDECESSOR_D0:${preflight.previousSliceD0Evidence.status}`);
if(preflight.previousSliceD0Evidence.productMergeSha!=="6eb9026051fb8da0245040b54699f8f1671d7240") throw new Error("Q048_Q047_MERGE_EVIDENCE_MISMATCH");
if(preflight.previousSliceD0Evidence.exactPagesRunId!=="34865796936") throw new Error("Q048_Q047_EXACT_PAGES_EVIDENCE_MISMATCH");

const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-05.json");
const source=r02.sourceRecords.find(x=>x.sourceNodeId===row.primarySourceNodeId);
if(!source) throw new Error(`Q048_R02_SOURCE_MISSING:${row.primarySourceNodeId}`);
for(const kp of KPS){
  const candidate=source.candidates.find(x=>x.knowledgePointId===kp);
  if(!candidate) throw new Error(`Q048_R02_KP_MISSING:${kp}`);
}
const cube=source.candidates.find(x=>x.knowledgePointId===KPS[0]);
const cuboid=source.candidates.find(x=>x.knowledgePointId===KPS[1]);
if(cube.capabilityStatement!=="學生能以一面面積乘6求正方體表面積。") throw new Error("Q048_CUBE_R02_CAPABILITY_MISMATCH");
if(cube.reasoningInvariant!=="六個全等正方形面共同構成外表面。") throw new Error("Q048_CUBE_R02_INVARIANT_MISMATCH");
if(cuboid.capabilityStatement!=="學生能計算長方體三組相對面的總面積。") throw new Error("Q048_CUBOID_R02_CAPABILITY_MISMATCH");
if(cuboid.reasoningInvariant!=="表面積等於長寬、長高、寬高三種面積各兩個。") throw new Error("Q048_CUBOID_R02_INVARIANT_MISMATCH");

const q040=read("data/curriculum/full-product/p05f/q040-g5b-u07-surface-area-from-net-source-authority-preflight.json");
if(q040.sourceAuthority.sourceNodeId!==preflight.sourceAuthority.sourceNodeId) throw new Error("Q048_Q040_SOURCE_NODE_MISMATCH");
if(q040.sourceAuthority.sourcePdfTitle!==preflight.sourceAuthority.sourcePdfTitle) throw new Error("Q048_Q040_PDF_TITLE_MISMATCH");
if(q040.sourceAuthority.sourcePdfDriveFileId!==preflight.sourceAuthority.sourcePdfDriveFileId) throw new Error("Q048_Q040_DRIVE_ID_MISMATCH");
if(q040.sourceAuthority.sourceUrlFromMetadata!==preflight.sourceAuthority.sourceUrl) throw new Error("Q048_Q040_SOURCE_URL_MISMATCH");
if(preflight.sourceAuthority.sourceRefAmbiguity!==false||preflight.sourceAuthority.manualSourceChoiceRequired!==false) throw new Error("Q048_SOURCE_AMBIGUITY");

const r04=materializeR04SharedRuntimeCapabilityMatrix();
const r05=materializeR05DeliveryWaveRebase();
const mappings=[];
const assignments=[];
for(const kp of KPS){
  const mapping=r04.getMapping(kp);
  if(!mapping) throw new Error(`Q048_R04_MAPPING_MISSING:${kp}`);
  if(mapping.mappingId!==`r04map_${kp.replace(/^kp_/,"")}`) throw new Error(`Q048_MAPPING:${kp}:${mapping.mappingId}`);
  if(mapping.primaryRuntimeProfileId!==row.primaryRuntimeProfileId) throw new Error(`Q048_PROFILE_MISMATCH:${kp}:${mapping.primaryRuntimeProfileId}`);
  if(mapping.classificationRuleId!=="rule_spatial_solid") throw new Error(`Q048_RULE_MISMATCH:${kp}:${mapping.classificationRuleId}`);
  if(mapping.appliedModifierIds.length!==0) throw new Error(`Q048_MODIFIERS:${kp}:${JSON.stringify(mapping.appliedModifierIds)}`);
  if(JSON.stringify(mapping.optionalRuntimeCapabilityIds)!==JSON.stringify(["cap_geometry_construction"])) throw new Error(`Q048_MAPPING_OPTIONAL:${kp}:${JSON.stringify(mapping.optionalRuntimeCapabilityIds)}`);
  if(mapping.forbiddenRuntimeCapabilityIds.length!==0) throw new Error(`Q048_MAPPING_FORBIDDEN:${kp}:${JSON.stringify(mapping.forbiddenRuntimeCapabilityIds)}`);
  const bound=preflight.runtimeCapabilityAuthority.mappings.find(x=>x.knowledgePointId===kp);
  if(!bound||JSON.stringify(bound.requiredRuntimeCapabilityIds)!==JSON.stringify(mapping.requiredRuntimeCapabilityIds)) throw new Error(`Q048_BOUND_MAPPING_REQUIRED:${kp}`);
  const assignment=r05.getAssignment(kp);
  if(!assignment) throw new Error(`Q048_R05_ASSIGNMENT_MISSING:${kp}`);
  if(assignment.deliveryWaveId!=="R05-W5") throw new Error(`Q048_WAVE_MISMATCH:${kp}:${assignment.deliveryWaveId}`);
  if(assignment.intraWavePrerequisiteRank!==4) throw new Error(`Q048_R05_RANK_MISMATCH:${kp}:${assignment.intraWavePrerequisiteRank}`);
  if(assignment.primaryRuntimeProfileId!=="profile_spatial_solid") throw new Error(`Q048_R05_PROFILE_MISMATCH:${kp}:${assignment.primaryRuntimeProfileId}`);
  const contractOnlyRequired=[...assignment.contractOnlyRequiredCapabilityIds].sort();
  const frozenRequired=[...row.requiredW5CapabilityIds].sort();
  if(JSON.stringify(contractOnlyRequired)!==JSON.stringify(frozenRequired)) throw new Error(`Q048_W5_CAPABILITY_MISMATCH:${kp}:${JSON.stringify({contractOnlyRequired,frozenRequired})}`);
  mappings.push(mapping);
  assignments.push(assignment);
}
if(row.requiredW5CapabilityIds.includes("cap_geometry_construction")) throw new Error("Q048_OPTIONAL_CONSTRUCTION_PROMOTED_TO_W5_REQUIRED");

const protectedOwnership={
  kp_g5b_u07_surface_area_from_net:40,
  kp_g5b_u07_composite_surface_area_hidden_faces:54,
  kp_g5b_u07_surface_area_unknown_dimension:59,
};
for(const [kp,position] of Object.entries(protectedOwnership)){
  const protectedRow=queue.queueEntries.find(x=>x.knowledgePointIds.includes(kp));
  if(!protectedRow||protectedRow.queuePosition!==position) throw new Error(`Q048_PROTECTED_OWNERSHIP:${kp}:${protectedRow?.queuePosition}`);
  if(preflight.q048ScopeLock.protectedFrozenQueueOwnership[kp]!==`Q${String(position).padStart(3,"0")}`) throw new Error(`Q048_PROTECTED_SCOPE_LOCK:${kp}`);
}
if(preflight.preflightDecision.nextTaskRequiresNewOperatorApproval!==true) throw new Error("Q048_IMPLEMENTATION_APPROVAL_BOUNDARY_MISSING");

const report={
  schemaName:"P05FW5Q048SourceAuthorityReadbackV1",
  status:"PASS_Q048_EXACT_AUTHORITY_READBACK",
  queue:row,
  queueRegistry:{queueVersion:queue.derivedRegistrySnapshot.queueVersion,queueDigest:queue.derivedRegistrySnapshot.queueDigest,queueFrozen:queue.queueFrozen,queueRegistryParity:queue.queueRegistryParity},
  predecessorD0:preflight.previousSliceD0Evidence,
  sourceIdentity:{sourceNodeId:preflight.sourceAuthority.sourceNodeId,sourceTitle:preflight.sourceAuthority.sourceTitle,sourcePdfTitle:preflight.sourceAuthority.sourcePdfTitle,sourcePdfDriveFileId:preflight.sourceAuthority.sourcePdfDriveFileId,sourceUrl:preflight.sourceAuthority.sourceUrl,pageCount:preflight.sourceAuthority.pageCount,reviewedPages:preflight.sourceAuthority.reviewedPages},
  r02:{sourceNodeId:source.sourceNodeId,sourceTitle:source.sourceTitle,sourcePdfTitle:source.sourcePdfTitle,pageCount:source.pageCount,reviewedPages:source.reviewedPages,candidates:KPS.map(kp=>source.candidates.find(x=>x.knowledgePointId===kp)),sameSourceCandidateIds:source.candidates.map(x=>x.knowledgePointId)},
  r04:mappings.map(mapping=>({knowledgePointId:mapping.knowledgePointId,mappingId:mapping.mappingId,primaryRuntimeProfileId:mapping.primaryRuntimeProfileId,classificationRuleId:mapping.classificationRuleId,appliedModifierIds:mapping.appliedModifierIds,requiredRuntimeCapabilityIds:mapping.requiredRuntimeCapabilityIds,optionalRuntimeCapabilityIds:mapping.optionalRuntimeCapabilityIds,forbiddenRuntimeCapabilityIds:mapping.forbiddenRuntimeCapabilityIds})),
  r05:assignments.map(assignment=>({knowledgePointId:assignment.knowledgePointId,deliveryWaveId:assignment.deliveryWaveId,intraWavePrerequisiteRank:assignment.intraWavePrerequisiteRank,primaryRuntimeProfileId:assignment.primaryRuntimeProfileId,effectiveRequiredRuntimeCapabilityIds:assignment.effectiveRequiredRuntimeCapabilityIds,contractOnlyRequiredCapabilityIds:assignment.contractOnlyRequiredCapabilityIds})),
  protectedFrozenQueueOwnership:preflight.q048ScopeLock.protectedFrozenQueueOwnership,
  implementationApprovalRequired:preflight.preflightDecision.nextTaskRequiresNewOperatorApproval,
};
process.stdout.write(`P05F48_PREFLIGHT_READBACK=${JSON.stringify(report)}\n`);
