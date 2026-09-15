import {readFileSync} from "node:fs";
import {materializeP05EW5DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import {materializeR04SharedRuntimeCapabilityMatrix} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {materializeR05DeliveryWaveRebase} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
const read=p=>JSON.parse(readFileSync(new URL(`../../${p}`,import.meta.url),"utf8"));
const KPS=["kp_g5a_u05a_polygon_diagonal","kp_g5a_u05a_regular_polygon_properties"];
const CAPS=["cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_property_reasoning"];
const sorted=v=>[...v].sort();
const q=materializeP05EW5DirectProductVerticalSliceQueue();
if(q.status!=="W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN"||!q.queueFrozen||!q.queueRegistryParity)throw new Error("Q051_QUEUE_NOT_FROZEN");
const row=q.queueEntries.find(x=>x.queuePosition===51);if(!row)throw new Error("Q051_ROW_MISSING");
if(row.sliceId!=="p05e_q051_r5_g5a_u05_5a05a_profile_geometry_property_c1")throw new Error(`Q051_SLICE:${row.sliceId}`);
if(row.implementationTaskId!=="P05F_W5DirectProductVerticalSlice051Implementation")throw new Error(`Q051_TASK:${row.implementationTaskId}`);
if(row.previousSliceId!=="p05e_q050_r5_g4b_u07_4b07_profile_geometry_formula_c1")throw new Error(`Q051_PREDECESSOR:${row.previousSliceId}`);
if(row.primarySourceNodeId!=="g5a_u05_5a05a"||row.primaryRuntimeProfileId!=="profile_geometry_property"||row.intraWavePrerequisiteRank!==5)throw new Error("Q051_QUEUE_IDENTITY_MISMATCH");
if(JSON.stringify(row.knowledgePointIds)!==JSON.stringify(KPS))throw new Error(`Q051_KPS:${JSON.stringify(row.knowledgePointIds)}`);
if(JSON.stringify(sorted(row.requiredW5CapabilityIds))!==JSON.stringify(sorted(CAPS)))throw new Error(`Q051_CAPS:${JSON.stringify(row.requiredW5CapabilityIds)}`);
const preflight=read("data/curriculum/full-product/p05f/q051-g5a-u05-polygon-diagonal-regular-properties-source-authority-preflight.json");
const p=preflight.previousSliceD0Evidence;
if(p.status!=="PASS_E6_D0_COMPLETE"||p.productPrNumber!==944||p.productMergeSha!=="79982e000f09f69f7aec20c17d6f01ab797e3125"||p.prGateRunId!=="34924060660"||p.pagesDeploymentRunId!=="34924151851"||p.exactPagesRunId!=="34924152764"||p.evidenceArtifactId!=="10379341343")throw new Error("Q051_Q050_D0_EVIDENCE_MISMATCH");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-02.json"),source=r02.sourceRecords.find(x=>x.sourceNodeId===row.primarySourceNodeId);if(!source)throw new Error("Q051_R02_SOURCE_MISSING");
const expected={
  kp_g5a_u05a_polygon_diagonal:{name:"多邊形對角線",statement:"學生能辨認並畫出不相鄰頂點間的對角線。",invariant:"對角線連接兩個不相鄰頂點且位於同一多邊形。",pages:[3]},
  kp_g5a_u05a_regular_polygon_properties:{name:"正多邊形性質",statement:"學生能辨認各邊等長且各角相等的正多邊形。",invariant:"正多邊形須同時滿足等邊與等角。",pages:[2]},
};
const r04=materializeR04SharedRuntimeCapabilityMatrix(),r05=materializeR05DeliveryWaveRebase();
const mappings=[],assignments=[];
for(const kp of KPS){const c=source.candidates.find(x=>x.knowledgePointId===kp);if(!c)throw new Error(`Q051_R02_KP_MISSING:${kp}`);const e=expected[kp];if(c.canonicalNameZh!==e.name||c.capabilityStatement!==e.statement||c.reasoningInvariant!==e.invariant||JSON.stringify(c.evidencePages)!==JSON.stringify(e.pages))throw new Error(`Q051_R02_CANDIDATE_MISMATCH:${kp}`);const m=r04.getMapping(kp),a=r05.getAssignment(kp);if(!m||!a)throw new Error(`Q051_RUNTIME_AUTHORITY_MISSING:${kp}`);if(m.primaryRuntimeProfileId!=="profile_geometry_property"||m.classificationRuleId!=="rule_geometry_property"||m.appliedModifierIds.length!==0||JSON.stringify(m.optionalRuntimeCapabilityIds)!==JSON.stringify(["cap_geometry_construction"])||m.forbiddenRuntimeCapabilityIds.length!==0)throw new Error(`Q051_R04_MAPPING_MISMATCH:${kp}`);if(a.deliveryWaveId!=="R05-W5"||a.intraWavePrerequisiteRank!==5||JSON.stringify(sorted(a.contractOnlyRequiredCapabilityIds))!==JSON.stringify(sorted(CAPS)))throw new Error(`Q051_R05_ASSIGNMENT_MISMATCH:${kp}`);mappings.push(m);assignments.push(a);}
if(preflight.sourceAuthority.ocrUsedAsAuthority!==false||preflight.sourceAuthority.manualSourceChoiceRequired!==false||preflight.sourceAuthority.sourceRefAmbiguity!==false)throw new Error("Q051_SOURCE_AUTHORITY_AMBIGUOUS");
if(preflight.runtimeCapabilityAuthority.geometryConstructionBoundary.r04ConstructionModifierApplied!==false||preflight.runtimeCapabilityAuthority.geometryConstructionBoundary.constructionRequiredByFrozenQueue!==false)throw new Error("Q051_CONSTRUCTION_BOUNDARY_MISMATCH");
if(preflight.q051ScopeLock.protectedExistingSameSourceKnowledgePointOwnership.kp_g5a_u05a_polygon_definition_classification!=="Q044"||preflight.q051ScopeLock.deferredFrozenOwnership.Q056[0]!=="kp_g5a_u05a_polygon_triangulation"||preflight.q051ScopeLock.sameSourceNonW5CandidateIds[0]!=="kp_g5a_u05a_polygon_angle_sum_reasoning")throw new Error("Q051_SIBLING_OWNERSHIP_MISMATCH");
if(preflight.preflightDecision.nextTaskRequiresNewOperatorApproval!==true)throw new Error("Q051_IMPLEMENTATION_APPROVAL_BOUNDARY_MISSING");
const report={schemaName:"P05FW5Q051SourceAuthorityReadbackV1",status:"PASS_Q051_EXACT_AUTHORITY_READBACK",queue:row,queueRegistry:{queueVersion:q.derivedRegistrySnapshot.queueVersion,queueDigest:q.derivedRegistrySnapshot.queueDigest,queueFrozen:q.queueFrozen,queueRegistryParity:q.queueRegistryParity},predecessorD0:p,sourceIdentity:{sourceNodeId:preflight.sourceAuthority.sourceNodeId,sourceTitle:preflight.sourceAuthority.sourceTitle,sourcePdfTitle:preflight.sourceAuthority.sourcePdfTitle,sourcePdfDriveFileId:preflight.sourceAuthority.sourcePdfDriveFileId,reviewedPages:preflight.sourceAuthority.reviewedPages,targetEvidencePages:preflight.sourceAuthority.targetEvidencePages},r02:{sourceNodeId:source.sourceNodeId,candidates:source.candidates.filter(x=>KPS.includes(x.knowledgePointId))},r04:mappings.map(m=>({knowledgePointId:m.knowledgePointId,mappingId:m.mappingId,primaryRuntimeProfileId:m.primaryRuntimeProfileId,classificationRuleId:m.classificationRuleId,appliedModifierIds:m.appliedModifierIds,requiredRuntimeCapabilityIds:m.requiredRuntimeCapabilityIds,optionalRuntimeCapabilityIds:m.optionalRuntimeCapabilityIds,forbiddenRuntimeCapabilityIds:m.forbiddenRuntimeCapabilityIds})),r05:assignments.map(a=>({knowledgePointId:a.knowledgePointId,deliveryWaveId:a.deliveryWaveId,intraWavePrerequisiteRank:a.intraWavePrerequisiteRank,contractOnlyRequiredCapabilityIds:a.contractOnlyRequiredCapabilityIds})),implementationApprovalRequired:true};
process.stdout.write(`P05F51_PREFLIGHT_READBACK=${JSON.stringify(report)}\n`);
