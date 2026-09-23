import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  materializeP05EW5DirectProductVerticalSliceQueue,
} from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  getVisibleBatchAKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
} from "../../site/modules/curriculum/registry/batch-a-selector-p05f17-extension.js";

const readJson=relative=>JSON.parse(readFileSync(new URL(`../../${relative}`,import.meta.url),"utf8"));
const remediation=readJson("data/curriculum/full-product/p05f/q017-frozen-queue-parity-remediation-preflight.json");
const historical=readJson("data/curriculum/full-product/p05f/q017-g5a-u10a-prism-pyramid-elements-source-authority-preflight.json");
const r02=readJson("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-03.json");
const profiles=readJson("data/curriculum/global/runtime/r04/runtime-capability-profiles.json");
const capabilities=readJson("data/curriculum/global/runtime/r04/shared-runtime-capabilities.json");
const q007=readJson("data/curriculum/full-product/p05f/q007-g5a-u10a-solid-shape-classification-source-authority-preflight.json");

const SOURCE="g5a_u10_5a10a";
const Q007="kp_g5a_u10a_solid_shape_classification";
const PRISM="kp_g5a_u10a_prism_pyramid_elements";
const CROSS="kp_g5a_u10a_solid_cross_section";
const Q17_KPS=[PRISM,CROSS];
const FUTURE=["kp_g5a_u10a_solid_net_correspondence","kp_g5a_u10a_solid_viewpoint_representation"];
const Q18_KPS=["kp_g5a_u10a1_cube_cuboid_edge_length","kp_g5a_u10a1_cube_cuboid_face_relationship"];
const EXACT_CAPS=["cap_geometry_domain_validator","cap_geometry_property_reasoning","cap_solid_geometry_representation","cap_spatial_solid_reasoning"];

function dependencyClosure(required){
  const byId=new Map(capabilities.capabilities.map(row=>[row.capabilityId,row]));
  const out=new Set(required),stack=[...required];
  while(stack.length){
    const id=stack.pop(),row=byId.get(id);
    assert.ok(row,`missing capability ${id}`);
    for(const dep of row.dependsOn??[]){
      if(!out.has(dep)){out.add(dep);stack.push(dep);}
    }
  }
  return [...out].sort();
}

test("P05F W5 Q017 exact frozen queue row contains both rank-1 g5a_u10 KPs and ends before Q018",()=>{
  const queue=materializeP05EW5DirectProductVerticalSliceQueue();
  assert.equal(queue.queueFrozen,true);
  assert.equal(queue.derivedRegistrySnapshot.queueDigest,remediation.queueAuthority.queueDigest);

  const q17=queue.queueEntries[16];
  assert.equal(q17.queuePosition,17);
  assert.equal(q17.sliceId,"p05e_q017_r1_g5a_u10_5a10a_profile_spatial_solid_c1");
  assert.equal(q17.previousSliceId,"p05e_q016_r1_g5a_u07_5a07_profile_geometry_property_c1");
  assert.equal(q17.primarySourceNodeId,SOURCE);
  assert.equal(q17.intraWavePrerequisiteRank,1);
  assert.equal(q17.primaryRuntimeProfileId,"profile_spatial_solid");
  assert.equal(q17.knowledgePointCount,2);
  assert.deepEqual([...q17.knowledgePointIds],Q17_KPS);
  assert.deepEqual([...q17.requiredW5CapabilityIds],EXACT_CAPS);

  assert.equal(historical.queueAuthority.knowledgePointCount,1);
  assert.deepEqual(historical.queueAuthority.knowledgePointIds,[PRISM]);
  assert.equal(remediation.supersedesExactRowAuthorityFrom,"data/curriculum/full-product/p05f/q017-g5a-u10a-prism-pyramid-elements-source-authority-preflight.json");
  assert.equal(remediation.queueAuthority.knowledgePointCount,2);
  assert.deepEqual(remediation.queueAuthority.knowledgePointIds,Q17_KPS);

  const q18=queue.queueEntries[17];
  assert.equal(q18.queuePosition,18);
  assert.equal(q18.sliceId,remediation.nextSliceBoundaryIdentityOnly.sliceId);
  assert.equal(q18.primarySourceNodeId,"g5a_u10_5a10a1");
  assert.equal(q18.intraWavePrerequisiteRank,1);
  assert.equal(q18.primaryRuntimeProfileId,"profile_spatial_solid");
  assert.deepEqual([...q18.knowledgePointIds],Q18_KPS);
  assert.deepEqual(remediation.nextSliceBoundaryIdentityOnly.knowledgePointIds,Q18_KPS);
  assert.equal(remediation.nextSliceBoundaryIdentityOnly.implementationAllowedByThisPreflight,false);
});

test("P05F W5 Q017 remediation reuses Q007-reviewed source identity without source-ref ambiguity",()=>{
  assert.equal(q007.sourceAuthority.sourceNodeId,SOURCE);
  assert.equal(remediation.sourceAuthority.sourcePdfDriveFileId,q007.sourceAuthority.sourcePdfDriveFileId);
  assert.equal(remediation.sourceAuthority.sourcePdfTitle,q007.sourceAuthority.sourcePdfTitle);
  assert.deepEqual(remediation.sourceAuthority.reviewedPages,[1,2]);
  assert.equal(remediation.sourceAuthority.reviewMethod,"R02_FULL_PAGE_VISUAL_READBACK_REUSE");
  assert.equal(remediation.sourceAuthority.sourceRefAmbiguity,false);
  assert.equal(remediation.sourceAuthority.manualSourceChoiceRequired,false);
});

test("P05F W5 Q017 remediation locks exact R02 semantics for prism/pyramid elements and solid cross-section",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId===SOURCE);
  assert.ok(source);
  assert.equal(source.sourceTitle,"柱體錐體和球");
  assert.deepEqual(source.reviewedPages,[1,2]);

  const byId=new Map(source.candidates.map(row=>[row.knowledgePointId,row]));
  const expected=[
    [PRISM,"柱體錐體構成要素","學生能辨認立體的底面、側面、稜與頂點。","構成要素的數量與位置由底面多邊形決定。"],
    [CROSS,"立體截面辨識","學生能判斷平面切割柱體、錐體或球可能形成的截面。","截面形狀由切割方向與立體表面交線決定。"],
  ];
  for(const [id,name,capability,invariant] of expected){
    const candidate=byId.get(id);
    assert.ok(candidate,`missing ${id}`);
    assert.equal(candidate.canonicalNameZh,name);
    assert.equal(candidate.capabilityStatement,capability);
    assert.equal(candidate.reasoningInvariant,invariant);
    assert.deepEqual(candidate.evidencePages,[1,2]);
    assert.equal(candidate.applicationSuitability,"APPLICATION_COMPATIBLE");
    const locked=remediation.r02ReviewedCandidateAuthorities.find(row=>row.knowledgePointId===id);
    assert.ok(locked);
    assert.equal(locked.canonicalNameZh,candidate.canonicalNameZh);
    assert.equal(locked.capabilityStatement,candidate.capabilityStatement);
    assert.equal(locked.reasoningInvariant,candidate.reasoningInvariant);
  }
});

test("P05F W5 Q017 remediation spatial-solid profile closure exactly matches frozen W5 capabilities",()=>{
  const profile=profiles.profiles.find(row=>row.profileId==="profile_spatial_solid");
  assert.ok(profile);
  assert.deepEqual(profile.requiredCapabilityIds,["cap_spatial_solid_reasoning","cap_geometry_domain_validator","cap_solid_geometry_representation"]);
  assert.deepEqual(remediation.runtimeCapabilityAuthority.profileRequiredCapabilityIds,profile.requiredCapabilityIds);
  assert.deepEqual(dependencyClosure(profile.requiredCapabilityIds),EXACT_CAPS);
  assert.deepEqual(remediation.runtimeCapabilityAuthority.exactFrozenQueueRequiredW5CapabilityIds,EXACT_CAPS);
  assert.deepEqual(remediation.runtimeCapabilityAuthority.dependencyClosureAddedCapabilityIds,["cap_geometry_property_reasoning"]);
});

test("P05F W5 Q017 remediation preflight leaves current P05F17 public selector unchanged",()=>{
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.sourceCount,53);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount,53);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount,331);
  const source=listBatchAKnowledgePointAvailabilityBySource(SOURCE);
  assert.equal(source.visibleCount,2);
  assert.equal(source.hiddenPendingCount,3);
  assert.equal(source.notSelectableCount,3);
  assert.ok(source.visibleKnowledgePointIds.includes(Q007));
  assert.ok(source.visibleKnowledgePointIds.includes(PRISM));
  assert.ok(getVisibleBatchAKnowledgePoint(Q007));
  assert.ok(getVisibleBatchAKnowledgePoint(PRISM));
  assert.equal(getVisibleBatchAKnowledgePoint(CROSS),null);
  assert.ok(source.hiddenPendingKnowledgePointIds.includes(CROSS));
  assert.ok(source.notSelectableKnowledgePointIds.includes(CROSS));
  for(const id of FUTURE){
    assert.equal(getVisibleBatchAKnowledgePoint(id),null);
    assert.ok(source.hiddenPendingKnowledgePointIds.includes(id));
    assert.ok(source.notSelectableKnowledgePointIds.includes(id));
  }
  assert.equal(remediation.publicPreflightBaseline.publicCutoverPerformedByThisPreflight,false);
});

test("P05F W5 Q017 remediation scope restores only cross-section and keeps net/viewpoint/Q018 excluded",()=>{
  assert.deepEqual(remediation.q017ScopeLock.includedKnowledgePointIds,Q17_KPS);
  assert.deepEqual(remediation.q017ScopeLock.alreadyImplementedSubsetKnowledgePointIds,[PRISM]);
  assert.deepEqual(remediation.q017ScopeLock.remediationTargetKnowledgePointIds,[CROSS]);
  assert.deepEqual(remediation.q017ScopeLock.excludedKnowledgePointIdsFromSameSource,FUTURE);
  assert.deepEqual(
    remediation.q017ScopeLock.includedRelationsByKnowledgePointId[PRISM],
    ["IDENTIFY_BASE_SIDE_FACE_EDGE_VERTEX","RELATE_ELEMENT_COUNT_POSITION_TO_BASE_POLYGON"],
  );
  assert.deepEqual(
    remediation.q017ScopeLock.includedRelationsByKnowledgePointId[CROSS],
    ["RECOGNIZE_POSSIBLE_CROSS_SECTION_FROM_SOLID_AND_CUT_DIRECTION","PRESERVE_CUT_SURFACE_INTERSECTION_INVARIANT"],
  );
  assert.equal(remediation.q017ScopeLock.excludedRelations.includes("SOLID_CROSS_SECTION"),false);
  for(const relation of ["SOLID_SHAPE_CLASSIFICATION","SOLID_NET_CORRESPONDENCE","SOLID_VIEWPOINT_REPRESENTATION","APPLICATION_CONTEXT","GEOMETRY_FORMULA_OR_MEASUREMENT"]){
    assert.ok(remediation.q017ScopeLock.excludedRelations.includes(relation));
  }
  assert.equal(remediation.q017ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(remediation.q017ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(remediation.q017ScopeLock.q018OrLaterTouched,false);
  assert.equal(remediation.q017ScopeLock.frozenQueueAuthorityTouched,false);
});

test("P05F W5 Q017 remediation implementation contract is bounded and operator-approved for automatic continuation",()=>{
  assert.equal(remediation.implementationContractLock.maxQuestionCount,240);
  assert.equal(remediation.implementationContractLock.sharedRuntimeScope,"SHARED_RUNTIME_BOUNDED");
  assert.equal(remediation.implementationContractLock.genericFallbackAllowed,false);
  assert.equal(remediation.implementationContractLock.freeFormAIAllowed,false);
  assert.equal(remediation.implementationContractLock.sourceUnitActivationAllowed,false);
  assert.equal(remediation.implementationContractLock.mixedKnowledgePointActivationAllowed,false);
  assert.equal(remediation.implementationContractLock.mustProvideDeterministicCrossSectionGenerator,true);
  assert.equal(remediation.implementationContractLock.mustProvideFailClosedCrossSectionValidator,true);
  assert.equal(remediation.implementationContractLock.mustProvideSolidCrossSectionRenderer,true);
  assert.equal(remediation.implementationContractLock.mustPreserveExistingPrismPyramidElementsSemantics,true);
  assert.equal(remediation.implementationContractLock.mustPreserveQ007SourceUnitOwnership,true);
  assert.equal(remediation.implementationContractLock.mustPromoteOnlyRemediationTarget,true);
  assert.equal(remediation.implementationContractLock.expectedGlobalVisibleKnowledgePointCountAfterRemediation,332);
  assert.equal(remediation.validationBoundary.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(remediation.validationBoundary.fullRepositoryRegression,"FORBIDDEN_FOR_THIS_PREFLIGHT");
  assert.equal(remediation.validationBoundary.globalBrowserReplay,"FORBIDDEN_FOR_THIS_PREFLIGHT");
  assert.equal(remediation.preflightDecision.priorQ017D0ClaimCoversCompleteFrozenRow,false);
  assert.equal(remediation.preflightDecision.remediationImplementationApprovedByOperator,true);
  assert.equal(remediation.preflightDecision.nextTaskRequiresSeparateImplementationApproval,false);
  assert.equal(remediation.preflightDecision.nextTask,"P05F_W5_Q017_FrozenQueueParityRemediation_Implementation");
  assert.equal(remediation.preflightDecision.q018PreflightBlockedUntilTrueQ017D0,true);
  assert.equal(remediation.policyBoundary.stopReasonAfterSuccessfulPreflightMerge,"NONE");
  assert.equal(remediation.policyBoundary.requiredOperatorAction,"NONE");
});
