import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { materializeR05DeliveryWaveRebase } from "../global/r05-delivery-wave-rebase.mjs";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../../..");
const P07E_DIR=path.join(ROOT,"data/curriculum/full-product/p07e");
const QUEUE_REGISTRY_PATH=path.join(P07E_DIR,"w7-direct-product-vertical-slice-queue.json");
export const P07E_W7_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_VERSION="p07e-w7-direct-product-vertical-slice-queue-v1";
const readJson=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const readP07EJson=name=>readJson(path.join(P07E_DIR,name));
const unique=values=>[...new Set((values??[]).filter(Boolean))];
const freezeArray=values=>Object.freeze([...(values??[])]);
const pad=(value,width=3)=>String(value).padStart(width,"0");
const stableToken=value=>String(value??"none").toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")||"none";
const sha256Json=value=>crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
function countBy(rows,selector){const m=new Map();for(const row of rows){const k=selector(row);m.set(k,(m.get(k)??0)+1);}return Object.freeze(Object.fromEntries([...m.entries()].sort(([a],[b])=>String(a).localeCompare(String(b)))));}
function comparableQueue(entries){return entries.map(e=>({queuePosition:e.queuePosition,sliceId:e.sliceId,implementationTaskId:e.implementationTaskId,previousSliceId:e.previousSliceId,primarySourceNodeId:e.primarySourceNodeId,intraWavePrerequisiteRank:e.intraWavePrerequisiteRank,primaryRuntimeProfileId:e.primaryRuntimeProfileId,chunkIndex:e.chunkIndex,knowledgePointIds:[...e.knowledgePointIds],supportingSourceNodeIds:[...e.supportingSourceNodeIds],requiredW7CapabilityIds:[...e.requiredW7CapabilityIds]}));}
function buildRegistrySnapshot({programId,taskId,policy,queueEntries,metrics}){const comparable=comparableQueue(queueEntries);return{schemaName:"P07EW7DirectProductVerticalSliceQueueRegistryV1",schemaVersion:1,programId,taskId,status:"W7_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN",queueVersion:P07E_W7_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_VERSION,executionMode:policy.sliceRules.executionMode,targetEvidenceLevelPerSlice:policy.verticalSliceD0Gate.targetEvidenceLevel,maxKnowledgePointsPerSlice:policy.sliceRules.maxKnowledgePointsPerSlice,directW7KnowledgePointCount:metrics.directW7KnowledgePointCount,directW7SourceNodeCount:metrics.directW7SourceNodeCount,directW7RuntimeProfileCount:metrics.directW7RuntimeProfileCount,directW7PrerequisiteRankCount:metrics.directW7PrerequisiteRankCount,queueSliceCount:metrics.queueSliceCount,queueDigest:sha256Json(comparable),orderedSliceIds:comparable.map(e=>e.sliceId),orderedImplementationTaskIds:comparable.map(e=>e.implementationTaskId),orderedKnowledgePointIds:comparable.flatMap(e=>e.knowledgePointIds),firstExecutableSlice:comparable[0]??null,lastSliceId:comparable.at(-1)?.sliceId??null};}

export function materializeP07EW7DirectProductVerticalSliceQueue(){
  const policy=readP07EJson("w7-direct-product-vertical-slice-queue-policy.json");
  const manifest=readP07EJson("w7-direct-product-vertical-slice-queue.manifest.json");
  const r05=materializeR05DeliveryWaveRebase();
  const w7CapabilityIds=new Set(policy.w7CapabilityIds);
  const capabilityPlan=r05.capabilityDeliveryPlan.filter(row=>row.deliveryWaveId===policy.cohortRules.assignedDeliveryWaveId);
  if(capabilityPlan.length!==manifest.expectedCapabilityPlanCount)throw new Error("P07E_W7_CAPABILITY_PLAN_COUNT_MISMATCH:"+capabilityPlan.length);
  const directRows=r05.knowledgePointAssignments.filter(row=>row.deliveryWaveId===policy.cohortRules.assignedDeliveryWaveId).map(row=>{
    if(row.productionAdmissionState!==policy.cohortRules.requiredProductionAdmissionState)throw new Error("P07E_W7_ADMISSION_STATE_INVALID:"+row.knowledgePointId+":"+row.productionAdmissionState);
    const supportingSourceNodeIds=[...row.sourceNodeIds].sort();
    if(!supportingSourceNodeIds.length)throw new Error("P07E_SOURCE_NODE_MISSING:"+row.knowledgePointId);
    return Object.freeze({...row,primarySourceNodeId:supportingSourceNodeIds[0],supportingSourceNodeIds:freezeArray(supportingSourceNodeIds),requiredW7CapabilityIds:freezeArray(row.contractOnlyRequiredCapabilityIds.filter(id=>w7CapabilityIds.has(id)).sort())});
  }).sort((a,b)=>a.intraWavePrerequisiteRank-b.intraWavePrerequisiteRank||a.primarySourceNodeId.localeCompare(b.primarySourceNodeId)||a.primaryRuntimeProfileId.localeCompare(b.primaryRuntimeProfileId)||a.knowledgePointId.localeCompare(b.knowledgePointId));
  if(directRows.length!==policy.cohortRules.expectedKnowledgePointCount)throw new Error("P07E_W7_KP_COUNT_MISMATCH:"+directRows.length);
  const grouped=new Map();
  for(const row of directRows){const key=row.intraWavePrerequisiteRank+"|"+row.primarySourceNodeId+"|"+row.primaryRuntimeProfileId;if(!grouped.has(key))grouped.set(key,{intraWavePrerequisiteRank:row.intraWavePrerequisiteRank,primarySourceNodeId:row.primarySourceNodeId,primaryRuntimeProfileId:row.primaryRuntimeProfileId,rows:[]});grouped.get(key).rows.push(row);}
  const orderedGroups=[...grouped.values()].sort((a,b)=>a.intraWavePrerequisiteRank-b.intraWavePrerequisiteRank||a.primarySourceNodeId.localeCompare(b.primarySourceNodeId)||a.primaryRuntimeProfileId.localeCompare(b.primaryRuntimeProfileId));
  const provisional=[];const max=policy.sliceRules.maxKnowledgePointsPerSlice;
  for(const group of orderedGroups){const rows=[...group.rows].sort((a,b)=>a.knowledgePointId.localeCompare(b.knowledgePointId));for(let offset=0,chunkIndex=1;offset<rows.length;offset+=max,chunkIndex++)provisional.push({...group,rows:rows.slice(offset,offset+max),chunkIndex});}
  const sliceIdFor=(slice,pos)=>["p07e","q"+pad(pos),"r"+slice.intraWavePrerequisiteRank,stableToken(slice.primarySourceNodeId),stableToken(slice.primaryRuntimeProfileId),"c"+slice.chunkIndex].join("_");
  const queueEntries=provisional.map((slice,index)=>{const queuePosition=index+1,previousSliceId=index===0?null:sliceIdFor(provisional[index-1],index),knowledgePointIds=slice.rows.map(r=>r.knowledgePointId);return Object.freeze({queuePosition,sliceId:sliceIdFor(slice,queuePosition),implementationTaskId:"P07F_W7DirectProductVerticalSlice"+pad(queuePosition)+"Implementation",previousSliceId,previousSliceMustBeD0Complete:previousSliceId!==null,assignedDeliveryWaveId:"R05-W7",primarySourceNodeId:slice.primarySourceNodeId,supportingSourceNodeIds:freezeArray(unique(slice.rows.flatMap(r=>r.supportingSourceNodeIds)).sort()),intraWavePrerequisiteRank:slice.intraWavePrerequisiteRank,primaryRuntimeProfileId:slice.primaryRuntimeProfileId,chunkIndex:slice.chunkIndex,knowledgePointCount:knowledgePointIds.length,knowledgePointIds:freezeArray(knowledgePointIds),requiredW7CapabilityIds:freezeArray(unique(slice.rows.flatMap(r=>r.requiredW7CapabilityIds)).sort()),targetEvidenceLevel:policy.verticalSliceD0Gate.targetEvidenceLevel,requiredProductNodes:freezeArray(policy.verticalSliceD0Gate.requiredNodes),admissionState:"QUEUE_FROZEN_IMPLEMENTATION_NOT_STARTED",productProductionAdmitted:false,implementationAllowedByP07E:false});});
  const allocated=queueEntries.flatMap(e=>e.knowledgePointIds);
  const metrics=Object.freeze({directW7KnowledgePointCount:directRows.length,directW7CapabilityPlanCount:capabilityPlan.length,directW7SourceNodeCount:new Set(directRows.map(r=>r.primarySourceNodeId)).size,directW7RuntimeProfileCount:new Set(directRows.map(r=>r.primaryRuntimeProfileId)).size,directW7PrerequisiteRankCount:new Set(directRows.map(r=>r.intraWavePrerequisiteRank)).size,queueSliceCount:queueEntries.length,allocatedKnowledgePointCount:allocated.length,uniqueAllocatedKnowledgePointCount:new Set(allocated).size,maximumSliceKnowledgePointCount:Math.max(0,...queueEntries.map(e=>e.knowledgePointCount)),queueSlicesByPrerequisiteRank:countBy(queueEntries,e=>e.intraWavePrerequisiteRank),directKnowledgePointsByPrerequisiteRank:countBy(directRows,r=>r.intraWavePrerequisiteRank),queueSlicesByRuntimeProfile:countBy(queueEntries,e=>e.primaryRuntimeProfileId),directKnowledgePointsByRuntimeProfile:countBy(directRows,r=>r.primaryRuntimeProfileId),directKnowledgePointsByPrimarySource:countBy(directRows,r=>r.primarySourceNodeId)});
  const derivedRegistrySnapshot=buildRegistrySnapshot({programId:manifest.programId,taskId:manifest.taskId,policy,queueEntries,metrics});
  const queueRegistry=fs.existsSync(QUEUE_REGISTRY_PATH)?readJson(QUEUE_REGISTRY_PATH):null;
  const queueRegistryPresent=Boolean(queueRegistry),queueRegistryParity=queueRegistryPresent?JSON.stringify(queueRegistry)===JSON.stringify(derivedRegistrySnapshot):false;
  return Object.freeze({schemaName:manifest.schemaName,schemaVersion:manifest.schemaVersion,programId:manifest.programId,taskId:manifest.taskId,status:queueRegistryPresent&&queueRegistryParity?"W7_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN":"W7_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_DERIVED_PENDING_SNAPSHOT_FREEZE",version:P07E_W7_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_VERSION,policy:Object.freeze(policy),manifest:Object.freeze(manifest),predecessorR05:r05,capabilityPlan:freezeArray(capabilityPlan),directRows:freezeArray(directRows),queueEntries:freezeArray(queueEntries),rows:freezeArray(queueEntries),queueRegistry:queueRegistry?Object.freeze(queueRegistry):null,derivedRegistrySnapshot:Object.freeze(derivedRegistrySnapshot),queueRegistryPresent,queueRegistryParity,queueFrozen:queueRegistryPresent&&queueRegistryParity,metrics,nextExecutableSlice:queueEntries[0]??null});
}
export const buildP07EW7DirectProductVerticalSliceQueueRegistrySnapshot=()=>materializeP07EW7DirectProductVerticalSliceQueue().derivedRegistrySnapshot;
export const listP07EW7DirectProductVerticalSlices=()=>materializeP07EW7DirectProductVerticalSliceQueue().queueEntries;
