import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const sourceIndex=read("data/curriculum/full-product/p08e/w8-source-authority-index.json");

test("P08E freezes the exact R05-W8 cohort with registry parity",()=>{
  const result=materializeP08EW8DirectProductVerticalSliceQueue();
  assert.equal(result.status,"W8_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN");
  assert.equal(result.queueRegistryPresent,true);
  assert.equal(result.queueRegistryParity,true);
  assert.equal(result.queueFrozen,true);
  assert.equal(result.metrics.directW8KnowledgePointCount,24);
  assert.equal(result.metrics.directW8CapabilityPlanCount,0);
  assert.equal(result.metrics.directW8SourceNodeCount,11);
  assert.equal(result.metrics.directW8SupportingSourceNodeCount,12);
  assert.equal(result.metrics.directW8RuntimeProfileCount,5);
  assert.equal(result.metrics.directW8PrerequisiteRankCount,12);
  assert.equal(result.metrics.baseW8KnowledgePointCount,6);
  assert.equal(result.metrics.prerequisiteEscalatedKnowledgePointCount,18);
  assert.equal(result.metrics.queueSliceCount,22);
  assert.equal(result.metrics.allocatedKnowledgePointCount,24);
  assert.equal(result.metrics.uniqueAllocatedKnowledgePointCount,24);
  assert.equal(result.derivedRegistrySnapshot.queueDigest,"597a6fa497c8ac7738247847ef321d0c753e79800f5c38097b7a7a160be2f484");
  assert.equal(result.nextExecutableSlice.sliceId,"p08e_q001_r1_g4a_u03_4a03_profile_geometry_property_c1");
  assert.deepEqual(result.nextExecutableSlice.knowledgePointIds,["kp_protractor_angle_measurement"]);
  assert.equal(result.derivedRegistrySnapshot.lastSliceId,"p08e_q022_r14_g6a_u08_6a08_profile_speed_rate_c1");
});

test("P08E W8 frozen queue is source/profile/rank partitioned and strictly serial",()=>{
  const result=materializeP08EW8DirectProductVerticalSliceQueue();
  for(let i=0;i<result.queueEntries.length;i++){
    const row=result.queueEntries[i];
    assert.equal(row.queuePosition,i+1);
    assert.equal(row.previousSliceId,i===0?null:result.queueEntries[i-1].sliceId);
    assert.equal(row.previousSliceMustBeD0Complete,i>0);
    assert.ok(row.primarySourceNodeId);
    assert.ok(row.supportingSourceNodeIds.includes(row.primarySourceNodeId));
    assert.ok(row.knowledgePointIds.length>0&&row.knowledgePointIds.length<=8);
    assert.equal(row.assignedDeliveryWaveId,"R05-W8");
    assert.equal(row.productProductionAdmitted,false);
    assert.equal(row.implementationAllowedByP08E,false);
  }
});

test("P08E W8 is multi-domain completion with no direct W8 capability-plan row",()=>{
  const result=materializeP08EW8DirectProductVerticalSliceQueue();
  assert.deepEqual(result.capabilityPlan,[]);
  assert.equal(result.directRows.length,24);
  const directBase=result.directRows.filter(row=>row.baseDeliveryWaveId==="R05-W8");
  const escalated=result.directRows.filter(row=>row.waveEscalatedByPrerequisite);
  assert.equal(directBase.length,6);
  assert.equal(escalated.length,18);
  assert.ok(directBase.every(row=>row.blockingCapabilityWaveIds.length>=2));
  assert.ok(result.directRows.every(row=>row.mappingBasis.legacyBatchUsedForAssignment===false));
});

test("P08E W8 source authority index covers all 24 W8 KPs and all primary/supporting R02 sources",()=>{
  const result=materializeP08EW8DirectProductVerticalSliceQueue();
  const primaryIds=[...new Set(result.directRows.map(row=>row.primarySourceNodeId))].sort();
  const supportingIds=[...new Set(result.directRows.flatMap(row=>row.supportingSourceNodeIds))].sort();
  const indexedPrimary=sourceIndex.sources.filter(x=>x.role==="PRIMARY").map(x=>x.sourceNodeId).sort();
  const indexedAll=sourceIndex.sources.map(x=>x.sourceNodeId).sort();
  assert.deepEqual(indexedPrimary,primaryIds);
  assert.deepEqual(indexedAll,supportingIds);
  assert.equal(sourceIndex.primarySourceNodeCount,11);
  assert.equal(sourceIndex.supportingAuthoritySourceNodeCount,12);
  assert.equal(sourceIndex.directW8KnowledgePointCount,24);
  const indexedKps=[...new Set(sourceIndex.sources.filter(x=>x.role==="PRIMARY").flatMap(x=>x.primaryW8KnowledgePointIds))].sort();
  assert.deepEqual(indexedKps,[...result.directRows.map(x=>x.knowledgePointId)].sort());

  const r02Sources=[];
  for(let i=1;i<=8;i++){
    const chunk=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-"+String(i).padStart(2,"0")+".json");
    r02Sources.push(...(chunk.sourceRecords??[]));
  }
  for(const source of sourceIndex.sources){
    const r02=r02Sources.find(x=>x.sourceNodeId===source.sourceNodeId);
    assert.ok(r02,source.sourceNodeId);
    assert.equal(r02.sourceTitle,source.sourceTitle);
    assert.equal(r02.sourcePdfTitle,source.sourcePdfTitle);
    assert.deepEqual(r02.reviewedPages,source.reviewedPages);
    for(const kp of source.w8KnowledgePointIds){
      const candidate=r02.candidates.find(x=>x.knowledgePointId===kp);
      assert.ok(candidate,source.sourceNodeId+":"+kp);
      assert.ok(candidate.evidencePages.length>0);
    }
  }
});

test("P08E W8 preserves R05 assignment semantics without mutating predecessor authority",()=>{
  const result=materializeP08EW8DirectProductVerticalSliceQueue();
  assert.ok(result.directRows.some(row=>row.baseDeliveryWaveId==="R05-W8"));
  assert.ok(result.directRows.some(row=>row.waveEscalatedByPrerequisite));
  assert.ok(result.directRows.some(row=>row.primaryRuntimeProfileId==="profile_geometry_property"));
  assert.ok(result.directRows.some(row=>row.primaryRuntimeProfileId==="profile_geometry_formula"));
  assert.ok(result.directRows.some(row=>row.primaryRuntimeProfileId==="profile_ratio_percent"));
  assert.ok(result.directRows.some(row=>row.primaryRuntimeProfileId==="profile_spatial_solid"));
  assert.ok(result.directRows.some(row=>row.primaryRuntimeProfileId==="profile_speed_rate"));
  assert.ok(result.directRows.every(row=>row.deliveryWaveId==="R05-W8"));
});

test("P08E is queue-freeze only and does not open W8 implementation",()=>{
  const policy=read("data/curriculum/full-product/p08e/w8-direct-product-vertical-slice-queue-policy.json");
  const manifest=read("data/curriculum/full-product/p08e/w8-direct-product-vertical-slice-queue.manifest.json");
  assert.equal(policy.scopeBoundary.queueDiscoveryAndFreezeOnly,true);
  assert.equal(policy.scopeBoundary.productImplementationAllowed,false);
  assert.equal(policy.scopeBoundary.generatorImplementationAllowed,false);
  assert.equal(policy.scopeBoundary.validatorImplementationAllowed,false);
  assert.equal(policy.scopeBoundary.newProductAdmissionAllowed,false);
  assert.equal(manifest.status,"W8_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN");
  assert.equal(manifest.scope.w8ImplementationStarted,false);
  assert.equal(manifest.scope.productionAdmissionChanged,false);
  assert.equal(manifest.mainlineBoundary.nextTaskAfterFreeze,"P08F_W8DirectProductVerticalSlice001Implementation");
});

test("P08E W8 final readback materializes exact source and escalation identities",()=>{
  const result=materializeP08EW8DirectProductVerticalSliceQueue();
  console.log("P08E_W8_FINAL="+JSON.stringify({
    status:result.status,
    metrics:result.metrics,
    queueDigest:result.derivedRegistrySnapshot.queueDigest,
    sourceNodes:sourceIndex.sources.map(x=>({
      sourceNodeId:x.sourceNodeId,
      role:x.role,
      sourceTitle:x.sourceTitle,
      sourcePdfTitle:x.sourcePdfTitle,
      reviewedPages:x.reviewedPages,
      w8KnowledgePointCount:x.w8KnowledgePointIds.length
    })),
    baseVsEscalated:{
      directBaseCount:result.directRows.filter(x=>x.baseDeliveryWaveId==="R05-W8").length,
      prerequisiteEscalatedCount:result.directRows.filter(x=>x.waveEscalatedByPrerequisite).length
    },
    rows:result.directRows.map(row=>({
      knowledgePointId:row.knowledgePointId,
      baseDeliveryWaveId:row.baseDeliveryWaveId,
      deliveryWaveId:row.deliveryWaveId,
      waveEscalatedByPrerequisite:row.waveEscalatedByPrerequisite,
      prerequisiteWaveLowerBound:row.prerequisiteWaveLowerBound,
      primarySourceNodeId:row.primarySourceNodeId,
      supportingSourceNodeIds:[...row.supportingSourceNodeIds],
      intraWavePrerequisiteRank:row.intraWavePrerequisiteRank,
      primaryRuntimeProfileId:row.primaryRuntimeProfileId,
      blockingCapabilityIds:[...row.blockingCapabilityIds],
      blockingCapabilityWaveIds:[...row.blockingCapabilityWaveIds]
    })),
    firstExecutableSlice:result.nextExecutableSlice,
    lastSliceId:result.derivedRegistrySnapshot.lastSliceId
  }));
});
