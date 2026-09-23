import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p07f/q001-g6a-u05-ratio-notation-order-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-06.json");
const profiles=read("data/curriculum/global/runtime/r04/runtime-capability-profiles.json");
const KP="kp_g6a_u05_ratio_notation_order";

test("W7 Q001 preflight binds the exact first frozen queue slice",()=>{
  const result=materializeP07EW7DirectProductVerticalSliceQueue();
  const slice=result.queueEntries[0];
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(result.queueEntries.length,26);
  assert.equal(result.queueRegistryParity,true);
  assert.equal(slice.queuePosition,1);
  assert.equal(slice.sliceId,"p07e_q001_r5_g6a_u05_6a05_profile_ratio_percent_c1");
  assert.equal(slice.implementationTaskId,"P07F_W7DirectProductVerticalSlice001Implementation");
  assert.equal(slice.previousSliceId,null);
  assert.equal(slice.previousSliceMustBeD0Complete,false);
  assert.equal(slice.primarySourceNodeId,"g6a_u05_6a05");
  assert.deepEqual(slice.supportingSourceNodeIds,["g6a_u05_6a05"]);
  assert.equal(slice.intraWavePrerequisiteRank,5);
  assert.equal(slice.primaryRuntimeProfileId,"profile_ratio_percent");
  assert.equal(slice.chunkIndex,1);
  assert.deepEqual(slice.knowledgePointIds,[KP]);
  assert.deepEqual(slice.requiredW7CapabilityIds,["cap_ratio_percent_reasoning","cap_ratio_rate_validator"]);
  assert.equal(p.queueAuthority.queueDigest,"ad37a23f07b3de22a088f5bf9f59e2b45f13cc3c350bb84def21860d21135843");
});

test("W7 Q001 binds the R02 reviewed candidate and the current four-page PDF visual readback",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g6a_u05_6a05");assert.ok(source);
  const target=source.candidates.find(row=>row.knowledgePointId===KP);assert.ok(target);
  assert.equal(source.sourceTitle,"比和比值");
  assert.equal(source.sourcePdfTitle,"meow911_6a05_source.pdf");
  assert.equal(source.pageCount,4);
  assert.deepEqual(source.reviewedPages,[1,2,3,4]);
  assert.equal(target.canonicalNameZh,"比的記法與順序");
  assert.equal(target.capabilityStatement,"學生能以a比b表示兩量順序關係。");
  assert.equal(target.reasoningInvariant,"前項與後項角色固定，交換會改變比。");
  assert.deepEqual(target.evidencePages,[1]);
  assert.equal(target.category,"ratio");
  assert.equal(target.applicationSuitability,"APPLICATION_COMPATIBLE");
  assert.equal(p.sourceAuthority.sourcePdfDriveFileId,"1f2VouY0XucxQ_jjVHzi1CbHklyQhpnAF");
  assert.equal(p.sourceAuthority.sourcePdfSizeBytes,1463604);
  assert.equal(p.sourceAuthority.sourcePdfSha256,"282b7ee25093afdd3b50c1077c168c30da0118bac4010f98aed09471e1ae5e4c");
  assert.equal(p.sourceAuthority.pageCount,4);
  assert.deepEqual(p.sourceAuthority.reviewedPages,[1,2,3,4]);
  assert.equal(p.sourceAuthority.reviewMethod,"CURRENT_FULL_PAGE_VISUAL_READBACK_200_DPI");
  assert.equal(p.sourceAuthority.ocrUsedAsAuthority,false);
  assert.deepEqual(p.sourceAuthority.evidenceResolution.exactQ001DirectVisualAnchorPages,[1]);
  assert.equal(p.sourceAuthority.directPageEvidence.page1.q001DirectVisualAnchor.semanticIdentity,"ORDERED_RATIO_NOTATION_WITH_FIXED_ANTECEDENT_CONSEQUENT_ROLES");
  assert.equal(p.sourceAuthority.driveMetadataReadback.reviewStatusUse,"STALE_PRE_R02_METADATA_NOT_USED_AS_CURRENT_REVIEW_PROOF");
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.sourceRefAmbiguity,false);
});

test("W7 Q001 protects all later G6A-U05 same-source KPs",()=>{
  const rows=p.r02ReviewedCandidateAuthority.futureOwnedKnowledgePointRows;
  assert.deepEqual(rows.map(x=>x.knowledgePointId),[
    "kp_g6a_u05_ratio_value",
    "kp_g6a_u05_equivalent_ratio",
    "kp_g6a_u05_simplify_ratio",
    "kp_g6a_u05_ratio_partition_application"
  ]);
  assert.deepEqual(rows.map(x=>x.queuePosition),[2,3,5,9]);
  const excluded=p.q001ScopeLock.excludedRelations;
  assert.ok(excluded.includes("COMPUTE_RATIO_VALUE"));
  assert.ok(excluded.includes("EQUIVALENT_RATIO_TRANSFORMATION"));
  assert.ok(excluded.includes("SIMPLIFY_TO_COPRIME_INTEGER_RATIO"));
  assert.ok(excluded.includes("RATIO_PARTITION_APPLICATION"));
  assert.ok(excluded.includes("Q002_OR_LATER_IMPLEMENTATION"));
});

test("W7 Q001 profile_ratio_percent mapping is exact and unmodified",()=>{
  const profile=profiles.profiles.find(row=>row.profileId==="profile_ratio_percent");assert.ok(profile);
  assert.deepEqual(profile.requiredCapabilityIds,[
    "cap_ratio_percent_reasoning",
    "cap_ratio_rate_validator",
    "cap_text_application_representation"
  ]);
  assert.deepEqual(profile.optionalCapabilityIds,[]);
  const mapping=getR04KnowledgePointCapabilityMapping(KP);assert.ok(mapping);
  assert.equal(mapping.primaryRuntimeProfileId,"profile_ratio_percent");
  assert.equal(mapping.classificationRuleId,"rule_ratio_percent");
  assert.deepEqual(mapping.appliedModifierIds,[]);
  assert.deepEqual(mapping.requiredRuntimeCapabilityIds,p.runtimeCapabilityAuthority.exactMappingRequiredRuntimeCapabilityIds);
  assert.deepEqual(mapping.optionalRuntimeCapabilityIds,[]);
  assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds,[]);
  assert.equal(p.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed,false);
});

test("W7 Q001 semantic lock preserves ordered antecedent/consequent roles without importing later ratio skills",()=>{
  const s=p.semanticProfileLock.implementationSemanticLock;
  assert.equal(p.semanticProfileLock.targetSemanticCore,"ORDERED_RATIO_NOTATION_WITH_FIXED_ANTECEDENT_CONSEQUENT_ROLES");
  assert.equal(s.ratioNotationIsOrdered,true);
  assert.equal(s.antecedentRoleMustRemainFirst,true);
  assert.equal(s.consequentRoleMustRemainSecond,true);
  assert.equal(s.swappingTermsChangesTheRatioRelation,true);
  assert.equal(s.colonNotationAndVerbalReadingMustPreserveRoleOrder,true);
  assert.equal(s.ratioValueComputationReownershipAllowed,false);
  assert.equal(s.equivalentRatioReownershipAllowed,false);
  assert.equal(s.simplestIntegerRatioReownershipAllowed,false);
  assert.equal(s.ratioPartitionApplicationReownershipAllowed,false);
  assert.equal(s.proportionCrossMultiplicationReownershipAllowed,false);
  assert.equal(s.percentConversionReownershipAllowed,false);
});

test("W7 Q001 preflight stays planning-only SHARED_RUNTIME_BOUNDED",()=>{
  const impact=read("data/project/change-impact/P07F_W7_Q001_PREFLIGHT.impact.json");
  const validation=read("data/project/validation-plans/P07F_W7_Q001_PREFLIGHT.validation.json");
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.equal(impact.scopeGuards.publicAdmission,false);
  assert.equal(impact.scopeGuards.q002OrLater,false);
  assert.equal(p.q001ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q001ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(p.q001ScopeLock.frozenQueueTouched,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(validation.lanes.SHARED_RUNTIME_BOUNDED[1].runtime,"NODE_ONLY");
  assert.equal(p.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(p.preflightValidationBoundary.globalBrowserReplayAllowed,false);
  assert.equal(p.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(p.preflightDecision.nextTask,"P07F_W7DirectProductVerticalSlice001Implementation");
});
