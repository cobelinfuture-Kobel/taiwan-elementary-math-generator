import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {materializeP05EW5DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import {materializeR04SharedRuntimeCapabilityMatrix} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {materializeR05DeliveryWaveRebase} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),"utf8"));
const KP="kp_g5b_u03_capacity_volume_conversion";
const EXPECTED_CAPS=["cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_formula_evaluation","cap_geometry_property_reasoning"];

const queue=materializeP05EW5DirectProductVerticalSliceQueue();
if(queue.status!=="W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN"||!queue.queueFrozen||!queue.queueRegistryParity) throw new Error("Q039_QUEUE_NOT_FROZEN");
const row=queue.queueEntries.find(x=>x.queuePosition===39);
if(!row) throw new Error("Q039_FROZEN_ROW_MISSING");
if(row.sliceId!=="p05e_q039_r3_g5b_u03_5b03_profile_geometry_formula_c1") throw new Error(`Q039_SLICE:${row.sliceId}`);
if(row.implementationTaskId!=="P05F_W5DirectProductVerticalSlice039Implementation") throw new Error(`Q039_TASK:${row.implementationTaskId}`);
if(row.previousSliceId!=="p05e_q038_r3_g5a_u10_5a10a1_profile_spatial_solid_c1") throw new Error(`Q039_PREDECESSOR:${row.previousSliceId}`);
if(row.primarySourceNodeId!=="g5b_u03_5b03") throw new Error(`Q039_SOURCE:${row.primarySourceNodeId}`);
if(row.primaryRuntimeProfileId!=="profile_geometry_formula") throw new Error(`Q039_PROFILE:${row.primaryRuntimeProfileId}`);
if(row.intraWavePrerequisiteRank!==3) throw new Error(`Q039_RANK:${row.intraWavePrerequisiteRank}`);
if(JSON.stringify(row.knowledgePointIds)!==JSON.stringify([KP])) throw new Error(`Q039_KPS:${JSON.stringify(row.knowledgePointIds)}`);
if(JSON.stringify(row.requiredW5CapabilityIds)!==JSON.stringify(EXPECTED_CAPS)) throw new Error(`Q039_W5_CAPS:${JSON.stringify(row.requiredW5CapabilityIds)}`);

const preflight=read("data/curriculum/full-product/p05f/q039-g5b-u03-capacity-volume-conversion-source-authority-preflight.json");
if(preflight.previousSliceD0Evidence.status!=="PASS_E6_D0_COMPLETE") throw new Error(`Q039_PREDECESSOR_D0:${preflight.previousSliceD0Evidence.status}`);
if(preflight.previousSliceD0Evidence.productMergeSha!=="1cf6fd5f1e566d252903c8df9e04e16752a156cf") throw new Error("Q039_Q038_MERGE_EVIDENCE_MISMATCH");
if(preflight.previousSliceD0Evidence.exactPagesRunId!=="34792339256") throw new Error("Q039_Q038_E6_RUN_MISMATCH");
if(preflight.previousSliceD0Evidence.evidenceArtifactDigest!=="sha256:b959c4d2af74f53679baf14c03923639ff708adac76d31395a70625393c9f3ce") throw new Error("Q039_Q038_EVIDENCE_DIGEST_MISMATCH");

const q020=read("data/curriculum/full-product/p05f/q020-g5b-u03-container-volume-capacity-distinction-source-authority-preflight.json");
const q030=read("data/curriculum/full-product/p05f/q030-g5b-u03-capacity-volume-equivalence-source-authority-preflight.json");
for(const prior of [q020.sourceAuthority,q030.sourceAuthority]){
  if(prior.sourceNodeId!==preflight.sourceAuthority.sourceNodeId) throw new Error("Q039_SOURCE_NODE_REUSE_MISMATCH");
  if(prior.sourcePdfDriveFileId!==preflight.sourceAuthority.sourcePdfDriveFileId) throw new Error("Q039_SOURCE_PDF_REUSE_MISMATCH");
  if(prior.sourceUrl!==preflight.sourceAuthority.sourceUrl) throw new Error("Q039_SOURCE_URL_REUSE_MISMATCH");
}

const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-04.json");
const source=r02.sourceRecords.find(x=>x.sourceNodeId===row.primarySourceNodeId);
if(!source) throw new Error(`Q039_R02_SOURCE_MISSING:${row.primarySourceNodeId}`);
const candidate=source.candidates.find(x=>x.knowledgePointId===KP);
if(!candidate) throw new Error(`Q039_R02_KP_MISSING:${KP}`);
if(candidate.canonicalNameZh!=="容積容量複合換算") throw new Error("Q039_R02_NAME_MISMATCH");
if(candidate.capabilityStatement!=="學生能在公升、毫升、立方公分與立方公寸間換算。") throw new Error("Q039_R02_CAPABILITY_MISMATCH");
if(candidate.reasoningInvariant!=="換算須同時符合1000倍與等價單位關係。") throw new Error("Q039_R02_INVARIANT_MISMATCH");
if(candidate.category!=="measurement") throw new Error(`Q039_R02_CATEGORY:${candidate.category}`);
if(JSON.stringify(candidate.evidencePages)!==JSON.stringify([1,2])) throw new Error(`Q039_R02_PAGES:${JSON.stringify(candidate.evidencePages)}`);

const r04=materializeR04SharedRuntimeCapabilityMatrix();
const mapping=r04.getMapping(KP);
if(!mapping) throw new Error(`Q039_R04_MAPPING_MISSING:${KP}`);
if(mapping.mappingId!=="r04map_g5b_u03_capacity_volume_conversion") throw new Error(`Q039_MAPPING:${mapping.mappingId}`);
if(mapping.primaryRuntimeProfileId!==row.primaryRuntimeProfileId) throw new Error(`Q039_PROFILE_MISMATCH:${mapping.primaryRuntimeProfileId}`);
if(mapping.classificationRuleId!=="rule_geometry_formula") throw new Error(`Q039_RULE_MISMATCH:${mapping.classificationRuleId}`);
if(mapping.appliedModifierIds.length!==0) throw new Error(`Q039_MODIFIERS:${JSON.stringify(mapping.appliedModifierIds)}`);
const conversionModifier=r04.modifiers.find(x=>x.modifierId==="mod_unit_conversion");
if(!conversionModifier) throw new Error("Q039_CONVERSION_MODIFIER_MISSING");
if(conversionModifier.profileIds.includes("profile_geometry_formula")) throw new Error("Q039_CONVERSION_MODIFIER_UNEXPECTEDLY_ELIGIBLE");

const r05=materializeR05DeliveryWaveRebase();
const assignment=r05.getAssignment(KP);
if(!assignment) throw new Error(`Q039_R05_ASSIGNMENT_MISSING:${KP}`);
if(assignment.deliveryWaveId!=="R05-W5") throw new Error(`Q039_WAVE:${assignment.deliveryWaveId}`);
if(assignment.intraWavePrerequisiteRank!==3) throw new Error(`Q039_R05_RANK:${assignment.intraWavePrerequisiteRank}`);
if(assignment.primaryRuntimeProfileId!=="profile_geometry_formula") throw new Error(`Q039_R05_PROFILE:${assignment.primaryRuntimeProfileId}`);
const contractOnly=[...assignment.contractOnlyRequiredCapabilityIds].sort();
const frozen=[...row.requiredW5CapabilityIds].sort();
if(JSON.stringify(contractOnly)!==JSON.stringify(frozen)) throw new Error(`Q039_CAPABILITY_CLOSURE:${JSON.stringify({contractOnly,frozen})}`);
if(contractOnly.includes("cap_unit_conversion")||contractOnly.includes("cap_mixed_unit_normalization")) throw new Error("Q039_SILENT_UNIT_CONVERSION_CAPABILITY_PROMOTION");

const protectedOwnership={
  kp_g5b_u03_container_volume_capacity_distinction:20,
  kp_g5b_u03_l_dm3_equivalence:30,
  kp_g5b_u03_ml_cm3_equivalence:30,
  kp_g5b_u03_container_fill_displacement:53,
};
for(const [kp,position] of Object.entries(protectedOwnership)){
  const owner=queue.queueEntries.find(x=>x.knowledgePointIds.includes(kp));
  if(!owner||owner.queuePosition!==position) throw new Error(`Q039_PROTECTED_OWNERSHIP:${kp}:${owner?.queuePosition}`);
  if(preflight.q039ScopeLock.protectedFrozenQueueOwnership[kp]!==`Q${String(position).padStart(3,"0")}`) throw new Error(`Q039_SCOPE_LOCK_OWNERSHIP:${kp}`);
}
if(preflight.q039ScopeLock.factor1000AndEquivalentUnitRelationsMustBothHold!==true) throw new Error("Q039_INVARIANT_LOCK_MISSING");
if(preflight.q039ScopeLock.unitConversionModifierPolicyRewriteAllowed!==false) throw new Error("Q039_R04_POLICY_REWRITE_NOT_BLOCKED");
if(preflight.preflightDecision.nextTaskRequiresNewOperatorApproval!==true) throw new Error("Q039_IMPLEMENTATION_APPROVAL_BOUNDARY_MISSING");
if(preflight.preflightDecision.separateImplementationApprovalSatisfiedByCurrentOperatorInstruction!==false) throw new Error("Q039_IMPLEMENTATION_PREAPPROVED_UNEXPECTEDLY");

const report={
  schemaName:"P05FW5Q039SourceAuthorityReadbackV1",
  status:"PASS_Q039_EXACT_AUTHORITY_READBACK",
  queue:row,
  queueRegistry:{queueVersion:queue.derivedRegistrySnapshot.queueVersion,queueDigest:queue.derivedRegistrySnapshot.queueDigest,queueFrozen:queue.queueFrozen,queueRegistryParity:queue.queueRegistryParity},
  predecessorD0:preflight.previousSliceD0Evidence,
  sourceIdentity:{sourceNodeId:preflight.sourceAuthority.sourceNodeId,sourceTitle:preflight.sourceAuthority.sourceTitle,sourcePdfTitle:preflight.sourceAuthority.sourcePdfTitle,sourcePdfDriveFileId:preflight.sourceAuthority.sourcePdfDriveFileId,sourceUrl:preflight.sourceAuthority.sourceUrl,reviewedPages:preflight.sourceAuthority.reviewedPages},
  r02:{candidate,sameSourceCandidateIds:source.candidates.map(x=>x.knowledgePointId)},
  r04:{knowledgePointId:mapping.knowledgePointId,mappingId:mapping.mappingId,primaryRuntimeProfileId:mapping.primaryRuntimeProfileId,classificationRuleId:mapping.classificationRuleId,appliedModifierIds:mapping.appliedModifierIds,requiredRuntimeCapabilityIds:mapping.requiredRuntimeCapabilityIds,optionalRuntimeCapabilityIds:mapping.optionalRuntimeCapabilityIds,forbiddenRuntimeCapabilityIds:mapping.forbiddenRuntimeCapabilityIds,conversionModifierEligible:conversionModifier.profileIds.includes(mapping.primaryRuntimeProfileId)},
  r05:{knowledgePointId:assignment.knowledgePointId,deliveryWaveId:assignment.deliveryWaveId,intraWavePrerequisiteRank:assignment.intraWavePrerequisiteRank,primaryRuntimeProfileId:assignment.primaryRuntimeProfileId,effectiveRequiredRuntimeCapabilityIds:assignment.effectiveRequiredRuntimeCapabilityIds,contractOnlyRequiredCapabilityIds:assignment.contractOnlyRequiredCapabilityIds},
  protectedFrozenQueueOwnership:preflight.q039ScopeLock.protectedFrozenQueueOwnership,
  implementationApprovalRequired:preflight.preflightDecision.nextTaskRequiresNewOperatorApproval,
};
process.stdout.write(`P05F39_PREFLIGHT_READBACK=${JSON.stringify(report)}\n`);
