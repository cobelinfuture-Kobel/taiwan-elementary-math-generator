import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {materializeP05EW5DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import {materializeR04SharedRuntimeCapabilityMatrix} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {materializeR05DeliveryWaveRebase} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),"utf8"));
const queue=materializeP05EW5DirectProductVerticalSliceQueue();
if(queue.status!=="W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN"||!queue.queueFrozen||!queue.queueRegistryParity) throw new Error("Q035_QUEUE_NOT_FROZEN");
const row=queue.queueEntries.find(x=>x.queuePosition===35);
if(!row) throw new Error("Q035_FROZEN_ROW_MISSING");
if(row.implementationTaskId!=="P05F_W5DirectProductVerticalSlice035Implementation") throw new Error(`Q035_TASK:${row.implementationTaskId}`);
if(row.previousSliceId!=="p05e_q034_r3_g4b_u07_4b07_profile_geometry_formula_c1") throw new Error(`Q035_PREDECESSOR:${row.previousSliceId}`);
if(row.primarySourceNodeId!=="g4b_u10_4b10") throw new Error(`Q035_SOURCE:${row.primarySourceNodeId}`);
if(row.primaryRuntimeProfileId!=="profile_spatial_solid") throw new Error(`Q035_PROFILE:${row.primaryRuntimeProfileId}`);
if(row.intraWavePrerequisiteRank!==3) throw new Error(`Q035_RANK:${row.intraWavePrerequisiteRank}`);
if(JSON.stringify(row.knowledgePointIds)!==JSON.stringify(["kp_g4b_u10_rectangular_prism_volume_structure"])) throw new Error(`Q035_KPS:${JSON.stringify(row.knowledgePointIds)}`);
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-02.json");
const source=r02.sourceRecords.find(x=>x.sourceNodeId===row.primarySourceNodeId);
if(!source) throw new Error(`Q035_R02_SOURCE_MISSING:${row.primarySourceNodeId}`);
const candidate=source.candidates.find(x=>x.knowledgePointId===row.knowledgePointIds[0]);
if(!candidate) throw new Error(`Q035_R02_KP_MISSING:${row.knowledgePointIds[0]}`);
const q027=read("data/curriculum/full-product/p05f/q027-g4b-u10-layered-cube-volume-conservation-source-authority-preflight.json");
if(q027.sourceAuthority.sourcePdfTitle!==source.sourcePdfTitle) throw new Error("Q035_Q027_PDF_IDENTITY_MISMATCH");
if(!q027.sourceAuthority.directVisualEvidence.page2.observedPanels.includes("長方體的體積公式")) throw new Error("Q035_Q027_FORMULA_PANEL_MISSING");
if(!q027.sourceAuthority.directVisualEvidence.page2.observedPanels.includes("用1立方公分積木堆成的形體求體積")) throw new Error("Q035_Q027_UNIT_CUBE_PANEL_MISSING");
const r04=materializeR04SharedRuntimeCapabilityMatrix();
const mapping=r04.getMapping(candidate.knowledgePointId);
if(!mapping) throw new Error(`Q035_R04_MAPPING_MISSING:${candidate.knowledgePointId}`);
if(mapping.primaryRuntimeProfileId!==row.primaryRuntimeProfileId) throw new Error(`Q035_PROFILE_MISMATCH:${mapping.primaryRuntimeProfileId}`);
const r05=materializeR05DeliveryWaveRebase();
const assignment=r05.getAssignment(candidate.knowledgePointId);
if(!assignment) throw new Error(`Q035_R05_ASSIGNMENT_MISSING:${candidate.knowledgePointId}`);
if(assignment.deliveryWaveId!=="R05-W5") throw new Error(`Q035_WAVE_MISMATCH:${assignment.deliveryWaveId}`);
if(assignment.intraWavePrerequisiteRank!==3) throw new Error(`Q035_R05_RANK_MISMATCH:${assignment.intraWavePrerequisiteRank}`);
const contractOnlyRequired=[...assignment.contractOnlyRequiredCapabilityIds].sort();
const frozenRequired=[...row.requiredW5CapabilityIds].sort();
if(JSON.stringify(contractOnlyRequired)!==JSON.stringify(frozenRequired)) throw new Error(`Q035_W5_CAPABILITY_MISMATCH:${JSON.stringify({contractOnlyRequired,frozenRequired})}`);
const report={
  schemaName:"P05FW5Q035SourceAuthorityReadbackV1",
  status:"PASS_Q035_EXACT_AUTHORITY_READBACK",
  queue:row,
  queueRegistry:{queueVersion:queue.derivedRegistrySnapshot.queueVersion,queueDigest:queue.derivedRegistrySnapshot.queueDigest,queueFrozen:queue.queueFrozen,queueRegistryParity:queue.queueRegistryParity},
  r02:{sourceNodeId:source.sourceNodeId,sourceTitle:source.sourceTitle,sourcePdfTitle:source.sourcePdfTitle,pageCount:source.pageCount,reviewedPages:source.reviewedPages,candidate,sameSourceCandidateIds:source.candidates.map(x=>x.knowledgePointId)},
  q027SourceReuse:{sourcePdfDriveFileId:q027.sourceAuthority.sourcePdfDriveFileId,sourceMetadataDriveFileId:q027.sourceAuthority.sourceMetadataDriveFileId,verificationNotesDriveFileId:q027.sourceAuthority.verificationNotesDriveFileId,page2ObservedPanels:q027.sourceAuthority.directVisualEvidence.page2.observedPanels,page2UseRestriction:q027.sourceAuthority.directVisualEvidence.page2.useRestriction},
  r04:{knowledgePointId:mapping.knowledgePointId,mappingId:mapping.mappingId,primaryRuntimeProfileId:mapping.primaryRuntimeProfileId,classificationRuleId:mapping.classificationRuleId,appliedModifierIds:mapping.appliedModifierIds,requiredRuntimeCapabilityIds:mapping.requiredRuntimeCapabilityIds,optionalRuntimeCapabilityIds:mapping.optionalRuntimeCapabilityIds,forbiddenRuntimeCapabilityIds:mapping.forbiddenRuntimeCapabilityIds,runtimeCapabilityDeliveryState:mapping.runtimeCapabilityDeliveryState,undeliveredRequiredCapabilityIds:mapping.undeliveredRequiredCapabilityIds},
  r05:{knowledgePointId:assignment.knowledgePointId,deliveryWaveId:assignment.deliveryWaveId,intraWavePrerequisiteRank:assignment.intraWavePrerequisiteRank,primaryRuntimeProfileId:assignment.primaryRuntimeProfileId,effectiveRequiredRuntimeCapabilityIds:assignment.effectiveRequiredRuntimeCapabilityIds,contractOnlyRequiredCapabilityIds:assignment.contractOnlyRequiredCapabilityIds},
  contractOnlyRequiredCapabilityIds:contractOnlyRequired,
};
process.stdout.write(`P05F35_PREFLIGHT_READBACK=${JSON.stringify(report)}\n`);
