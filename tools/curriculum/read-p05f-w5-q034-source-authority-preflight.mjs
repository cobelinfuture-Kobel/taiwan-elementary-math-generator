import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {materializeP05EW5DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import {materializeR04SharedRuntimeCapabilityMatrix} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {materializeR05DeliveryWaveRebase} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),"utf8"));
const queue=materializeP05EW5DirectProductVerticalSliceQueue();
if(queue.status!=="W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN"||!queue.queueFrozen||!queue.queueRegistryParity) throw new Error("Q034_QUEUE_NOT_FROZEN");
const row=queue.queueEntries.find(x=>x.queuePosition===34);
if(!row) throw new Error("Q034_FROZEN_ROW_MISSING");
if(row.implementationTaskId!=="P05F_W5DirectProductVerticalSlice034Implementation") throw new Error(`Q034_TASK:${row.implementationTaskId}`);
if(row.previousSliceId!=="p05e_q033_r3_g4b_u02_4b02_profile_geometry_property_c1") throw new Error(`Q034_PREDECESSOR:${row.previousSliceId}`);
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-02.json");
const source=r02.sourceRecords.find(x=>x.sourceNodeId===row.primarySourceNodeId);
if(!source) throw new Error(`Q034_R02_SOURCE_MISSING:${row.primarySourceNodeId}`);
const candidates=row.knowledgePointIds.map(id=>{
  const candidate=source.candidates.find(x=>x.knowledgePointId===id);
  if(!candidate) throw new Error(`Q034_R02_KP_MISSING:${id}`);
  return candidate;
});
const r04=materializeR04SharedRuntimeCapabilityMatrix();
const r05=materializeR05DeliveryWaveRebase();
const mappings=row.knowledgePointIds.map(id=>{
  const mapping=r04.getMapping(id);
  if(!mapping) throw new Error(`Q034_R04_MAPPING_MISSING:${id}`);
  if(mapping.primaryRuntimeProfileId!==row.primaryRuntimeProfileId) throw new Error(`Q034_PROFILE_MISMATCH:${id}`);
  return mapping;
});
const assignments=row.knowledgePointIds.map(id=>{
  const assignment=r05.getAssignment(id);
  if(!assignment) throw new Error(`Q034_R05_ASSIGNMENT_MISSING:${id}`);
  if(assignment.deliveryWaveId!=="R05-W5") throw new Error(`Q034_WAVE_MISMATCH:${id}:${assignment.deliveryWaveId}`);
  if(assignment.intraWavePrerequisiteRank!==3) throw new Error(`Q034_RANK_MISMATCH:${id}:${assignment.intraWavePrerequisiteRank}`);
  return assignment;
});
const contractOnlyRequired=[...new Set(assignments.flatMap(x=>x.contractOnlyRequiredCapabilityIds))].sort();
const frozenRequired=[...row.requiredW5CapabilityIds].sort();
if(JSON.stringify(contractOnlyRequired)!==JSON.stringify(frozenRequired)) throw new Error(`Q034_W5_CAPABILITY_MISMATCH:${JSON.stringify({contractOnlyRequired,frozenRequired})}`);
const report={
  schemaName:"P05FW5Q034SourceAuthorityReadbackV1",
  status:"PASS_Q034_EXACT_AUTHORITY_READBACK",
  queue:row,
  queueRegistry:{queueVersion:queue.derivedRegistrySnapshot.queueVersion,queueDigest:queue.derivedRegistrySnapshot.queueDigest,queueFrozen:queue.queueFrozen,queueRegistryParity:queue.queueRegistryParity},
  r02:{sourceNodeId:source.sourceNodeId,sourceTitle:source.sourceTitle,sourcePdfTitle:source.sourcePdfTitle,pageCount:source.pageCount,reviewedPages:source.reviewedPages,candidates,sameSourceCandidateIds:source.candidates.map(x=>x.knowledgePointId)},
  r04:mappings.map(x=>({knowledgePointId:x.knowledgePointId,mappingId:x.mappingId,primaryRuntimeProfileId:x.primaryRuntimeProfileId,classificationRuleId:x.classificationRuleId,appliedModifierIds:x.appliedModifierIds,requiredRuntimeCapabilityIds:x.requiredRuntimeCapabilityIds,optionalRuntimeCapabilityIds:x.optionalRuntimeCapabilityIds,forbiddenRuntimeCapabilityIds:x.forbiddenRuntimeCapabilityIds,runtimeCapabilityDeliveryState:x.runtimeCapabilityDeliveryState,undeliveredRequiredCapabilityIds:x.undeliveredRequiredCapabilityIds})),
  r05:assignments.map(x=>({knowledgePointId:x.knowledgePointId,deliveryWaveId:x.deliveryWaveId,intraWavePrerequisiteRank:x.intraWavePrerequisiteRank,primaryRuntimeProfileId:x.primaryRuntimeProfileId,effectiveRequiredRuntimeCapabilityIds:x.effectiveRequiredRuntimeCapabilityIds,contractOnlyRequiredCapabilityIds:x.contractOnlyRequiredCapabilityIds})),
  contractOnlyRequiredCapabilityIds:contractOnlyRequired,
};
process.stdout.write(`P05F34_PREFLIGHT_READBACK=${JSON.stringify(report)}\n`);
