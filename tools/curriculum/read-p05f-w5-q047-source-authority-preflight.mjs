import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {materializeP05EW5DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import {materializeR04SharedRuntimeCapabilityMatrix} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {materializeR05DeliveryWaveRebase} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),"utf8"));
const KP="kp_g5b_u01_rectangular_prism_volume_formula";
const queue=materializeP05EW5DirectProductVerticalSliceQueue();
if(queue.status!=="W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN"||!queue.queueFrozen||!queue.queueRegistryParity) throw new Error("Q047_QUEUE_NOT_FROZEN");
const row=queue.queueEntries.find(x=>x.queuePosition===47);
if(!row) throw new Error("Q047_FROZEN_ROW_MISSING");
if(row.implementationTaskId!=="P05F_W5DirectProductVerticalSlice047Implementation") throw new Error(`Q047_TASK:${row.implementationTaskId}`);
if(row.previousSliceId!=="p05e_q046_r4_g5a_u09_5a09_profile_geometry_formula_c1") throw new Error(`Q047_PREDECESSOR:${row.previousSliceId}`);
if(row.primarySourceNodeId!=="g5b_u01_5b01") throw new Error(`Q047_SOURCE:${row.primarySourceNodeId}`);
if(row.primaryRuntimeProfileId!=="profile_spatial_solid") throw new Error(`Q047_PROFILE:${row.primaryRuntimeProfileId}`);
if(row.intraWavePrerequisiteRank!==4) throw new Error(`Q047_RANK:${row.intraWavePrerequisiteRank}`);
if(JSON.stringify(row.knowledgePointIds)!==JSON.stringify([KP])) throw new Error(`Q047_KPS:${JSON.stringify(row.knowledgePointIds)}`);

const preflight=read("data/curriculum/full-product/p05f/q047-g5b-u01-rectangular-prism-volume-formula-source-authority-preflight.json");
if(preflight.previousSliceD0Evidence.status!=="PASS_E6_D0_COMPLETE") throw new Error(`Q047_PREDECESSOR_D0:${preflight.previousSliceD0Evidence.status}`);
if(preflight.previousSliceD0Evidence.productMergeSha!=="525f698242e4c9f7014723693b6818c72c4593ed") throw new Error("Q047_Q046_MERGE_EVIDENCE_MISMATCH");
if(preflight.previousSliceD0Evidence.exactPagesRunId!=="34849444628") throw new Error("Q047_Q046_EXACT_PAGES_EVIDENCE_MISMATCH");

const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-03.json");
const source=r02.sourceRecords.find(x=>x.sourceNodeId===row.primarySourceNodeId);
if(!source) throw new Error(`Q047_R02_SOURCE_MISSING:${row.primarySourceNodeId}`);
const candidate=source.candidates.find(x=>x.knowledgePointId===KP);
if(!candidate) throw new Error(`Q047_R02_KP_MISSING:${KP}`);
if(candidate.capabilityStatement!=="學生能以長乘寬乘高求長方體體積。") throw new Error("Q047_R02_CAPABILITY_MISMATCH");
if(candidate.reasoningInvariant!=="每層單位方塊數為長乘寬，總層數為高。") throw new Error("Q047_R02_INVARIANT_MISMATCH");

const q019=read("data/curriculum/full-product/p05f/q019-g5b-u01-volume-unit-conversion-source-authority-preflight.json");
if(q019.sourceAuthority.sourceNodeId!==preflight.sourceAuthority.sourceNodeId) throw new Error("Q047_Q019_SOURCE_NODE_MISMATCH");
if(q019.sourceAuthority.sourcePdfTitle!==preflight.sourceAuthority.sourcePdfTitle) throw new Error("Q047_Q019_PDF_TITLE_MISMATCH");
if(q019.sourceAuthority.sourcePdfDriveFileId!==preflight.sourceAuthority.sourcePdfDriveFileId) throw new Error("Q047_Q019_DRIVE_ID_MISMATCH");
if(q019.sourceAuthority.sourceUrl!==preflight.sourceAuthority.sourceUrl) throw new Error("Q047_Q019_SOURCE_URL_MISMATCH");
if(preflight.sourceAuthority.sourceRefAmbiguity!==false||preflight.sourceAuthority.manualSourceChoiceRequired!==false) throw new Error("Q047_SOURCE_AMBIGUITY");

const r04=materializeR04SharedRuntimeCapabilityMatrix();
const mapping=r04.getMapping(KP);
if(!mapping) throw new Error(`Q047_R04_MAPPING_MISSING:${KP}`);
if(mapping.mappingId!=="r04map_g5b_u01_rectangular_prism_volume_formula") throw new Error(`Q047_MAPPING:${mapping.mappingId}`);
if(mapping.primaryRuntimeProfileId!==row.primaryRuntimeProfileId) throw new Error(`Q047_PROFILE_MISMATCH:${mapping.primaryRuntimeProfileId}`);
if(mapping.classificationRuleId!=="rule_spatial_solid") throw new Error(`Q047_RULE_MISMATCH:${mapping.classificationRuleId}`);
if(mapping.appliedModifierIds.length!==0) throw new Error(`Q047_MODIFIERS:${JSON.stringify(mapping.appliedModifierIds)}`);
const profile=r04.profiles.find(x=>x.profileId==="profile_spatial_solid");
if(!profile) throw new Error("Q047_PROFILE_AUTHORITY_MISSING");
if(JSON.stringify(profile.optionalCapabilityIds)!==JSON.stringify(["cap_geometry_construction"])) throw new Error(`Q047_PROFILE_OPTIONAL:${JSON.stringify(profile.optionalCapabilityIds)}`);
if(JSON.stringify(mapping.optionalRuntimeCapabilityIds)!==JSON.stringify(["cap_geometry_construction"])) throw new Error(`Q047_MAPPING_OPTIONAL:${JSON.stringify(mapping.optionalRuntimeCapabilityIds)}`);
if(mapping.forbiddenRuntimeCapabilityIds.length!==0) throw new Error(`Q047_MAPPING_FORBIDDEN:${JSON.stringify(mapping.forbiddenRuntimeCapabilityIds)}`);

const r05=materializeR05DeliveryWaveRebase();
const assignment=r05.getAssignment(KP);
if(!assignment) throw new Error(`Q047_R05_ASSIGNMENT_MISSING:${KP}`);
if(assignment.deliveryWaveId!=="R05-W5") throw new Error(`Q047_WAVE_MISMATCH:${assignment.deliveryWaveId}`);
if(assignment.intraWavePrerequisiteRank!==4) throw new Error(`Q047_R05_RANK_MISMATCH:${assignment.intraWavePrerequisiteRank}`);
const contractOnlyRequired=[...assignment.contractOnlyRequiredCapabilityIds].sort();
const frozenRequired=[...row.requiredW5CapabilityIds].sort();
if(JSON.stringify(contractOnlyRequired)!==JSON.stringify(frozenRequired)) throw new Error(`Q047_W5_CAPABILITY_MISMATCH:${JSON.stringify({contractOnlyRequired,frozenRequired})}`);
if(frozenRequired.includes("cap_geometry_construction")) throw new Error("Q047_OPTIONAL_CONSTRUCTION_PROMOTED_TO_W5_REQUIRED");

const protectedOwnership={
  kp_g5b_u01_volume_unit_conversion:19,
  kp_g5b_u01_cube_volume_formula:52,
  kp_g5b_u01_composite_rectangular_volume:52,
  kp_g5b_u01_volume_unknown_dimension:58,
};
for(const [kp,position] of Object.entries(protectedOwnership)){
  const protectedRow=queue.queueEntries.find(x=>x.knowledgePointIds.includes(kp));
  if(!protectedRow||protectedRow.queuePosition!==position) throw new Error(`Q047_PROTECTED_OWNERSHIP:${kp}:${protectedRow?.queuePosition}`);
  if(preflight.q047ScopeLock.protectedFrozenQueueOwnership[kp]!==`Q${String(position).padStart(3,"0")}`) throw new Error(`Q047_PROTECTED_SCOPE_LOCK:${kp}`);
}
if(preflight.preflightDecision.nextTaskRequiresNewOperatorApproval!==true) throw new Error("Q047_IMPLEMENTATION_APPROVAL_BOUNDARY_MISSING");

const report={
  schemaName:"P05FW5Q047SourceAuthorityReadbackV1",
  status:"PASS_Q047_EXACT_AUTHORITY_READBACK",
  queue:row,
  queueRegistry:{queueVersion:queue.derivedRegistrySnapshot.queueVersion,queueDigest:queue.derivedRegistrySnapshot.queueDigest,queueFrozen:queue.queueFrozen,queueRegistryParity:queue.queueRegistryParity},
  predecessorD0:preflight.previousSliceD0Evidence,
  sourceIdentity:{sourceNodeId:preflight.sourceAuthority.sourceNodeId,sourceTitle:preflight.sourceAuthority.sourceTitle,sourcePdfTitle:preflight.sourceAuthority.sourcePdfTitle,sourcePdfDriveFileId:preflight.sourceAuthority.sourcePdfDriveFileId,sourceUrl:preflight.sourceAuthority.sourceUrl,pageCount:preflight.sourceAuthority.pageCount,reviewedPages:preflight.sourceAuthority.reviewedPages},
  r02:{sourceNodeId:source.sourceNodeId,sourceTitle:source.sourceTitle,sourcePdfTitle:source.sourcePdfTitle,pageCount:source.pageCount,reviewedPages:source.reviewedPages,candidate,sameSourceCandidateIds:source.candidates.map(x=>x.knowledgePointId)},
  r04:{knowledgePointId:mapping.knowledgePointId,mappingId:mapping.mappingId,primaryRuntimeProfileId:mapping.primaryRuntimeProfileId,classificationRuleId:mapping.classificationRuleId,appliedModifierIds:mapping.appliedModifierIds,requiredRuntimeCapabilityIds:mapping.requiredRuntimeCapabilityIds,optionalRuntimeCapabilityIds:mapping.optionalRuntimeCapabilityIds,forbiddenRuntimeCapabilityIds:mapping.forbiddenRuntimeCapabilityIds},
  r05:{knowledgePointId:assignment.knowledgePointId,deliveryWaveId:assignment.deliveryWaveId,intraWavePrerequisiteRank:assignment.intraWavePrerequisiteRank,primaryRuntimeProfileId:assignment.primaryRuntimeProfileId,effectiveRequiredRuntimeCapabilityIds:assignment.effectiveRequiredRuntimeCapabilityIds,contractOnlyRequiredCapabilityIds:assignment.contractOnlyRequiredCapabilityIds},
  contractOnlyRequiredCapabilityIds:contractOnlyRequired,
  protectedFrozenQueueOwnership:preflight.q047ScopeLock.protectedFrozenQueueOwnership,
  implementationApprovalRequired:preflight.preflightDecision.nextTaskRequiresNewOperatorApproval,
};
process.stdout.write(`P05F47_PREFLIGHT_READBACK=${JSON.stringify(report)}\n`);
