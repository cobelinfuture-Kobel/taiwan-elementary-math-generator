import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
import {materializeR04SharedRuntimeCapabilityMatrix,getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const repair=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p07f/q011-g6a-u07-circle-area-derivation-supplementary-evidence-authority-repair.json",import.meta.url),"utf8"));
const prior=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p07f/q011-g6a-u07-circle-area-derivation-source-authority-preflight.json",import.meta.url),"utf8"));
const kp="kp_g6a_u07_circle_area_derivation";
const queue=materializeP07EW7DirectProductVerticalSliceQueue();
const slice=queue.queueEntries[10];
const r04=getR04KnowledgePointCapabilityMapping(kp);
const r05=getR05DeliveryWaveAssignment(kp);
const graph=materializeR04SharedRuntimeCapabilityMatrix().prerequisiteGraph;
const incoming=(graph.incomingByTarget.get(kp)??[]).map(edge=>({
  knowledgePointId:edge.fromKnowledgePointId,
  dependencyStrength:edge.dependencyStrength,
  dependencyRole:edge.dependencyRole,
  distanceBearing:edge.distanceBearing
})).sort((a,b)=>a.knowledgePointId.localeCompare(b.knowledgePointId));
const expected=[...repair.prerequisiteLock.requiredIncomingPrerequisites].sort((a,b)=>a.knowledgePointId.localeCompare(b.knowledgePointId));

if(slice?.sliceId!=="p07e_q011_r9_g6a_u07_6a07_profile_geometry_formula_c1")throw new Error("P07F_W7_Q011_QUEUE_IDENTITY");
if(prior.sourceAuthority.currentVisualReadbackAuthority.targetVisualFamilyPresent!==false)throw new Error("P07F_W7_Q011_ORIGINAL_PDF_TRUTH");
if(repair.sourceAuthorityReconciliation.originalCurriculumSource.directDerivationEvidencePresent!==false)throw new Error("P07F_W7_Q011_ORIGINAL_PDF_MUST_REMAIN_CONTEXT_ONLY");
if(repair.sourceAuthorityReconciliation.supplementaryVisualEvidence.evidenceItems.length!==3)throw new Error("P07F_W7_Q011_SUPPLEMENT_COUNT");
if(!Object.values(repair.sourceAuthorityReconciliation.supplementaryVisualEvidence.directSemanticCoverage).every(Boolean))throw new Error("P07F_W7_Q011_SUPPLEMENT_COVERAGE");
if(JSON.stringify(incoming)!==JSON.stringify(expected))throw new Error("P07F_W7_Q011_R03_PREREQUISITES");
if(!r04||r04.primaryRuntimeProfileId!=="profile_geometry_formula"||r04.classificationRuleId!=="rule_geometry_formula")throw new Error("P07F_W7_Q011_R04");
if(!r05||r05.deliveryWaveId!=="R05-W7"||r05.intraWavePrerequisiteRank!==9)throw new Error("P07F_W7_Q011_R05");
if(repair.semanticOwnershipLock.present!==true||repair.semanticOwnershipLock.implementationSemanticLockAllowed!==true)throw new Error("P07F_W7_Q011_SEMANTIC_LOCK");
if(repair.decision.sourceEvidenceBlockerResolved!==true)throw new Error("P07F_W7_Q011_BLOCKER_NOT_RESOLVED");
if(repair.decision.implementationMayProceedWithoutSeparateApproval!==false)throw new Error("P07F_W7_Q011_APPROVAL_BOUNDARY");

console.log("P07F_W7_Q011_SUPPLEMENTARY_EVIDENCE_REPAIR_READBACK="+JSON.stringify({
  schemaName:"P07FW7Q011SupplementaryEvidenceAuthorityRepairExecutableReadbackV1",
  status:"READY_FOR_IMPLEMENTATION_APPROVAL",
  queuePosition:slice.queuePosition,
  sliceId:slice.sliceId,
  knowledgePointIds:[...slice.knowledgePointIds],
  originalPdfDirectDerivationSupport:repair.sourceAuthorityReconciliation.originalCurriculumSource.directDerivationEvidencePresent,
  supplementaryEvidenceAuthorityType:repair.sourceAuthorityReconciliation.supplementaryVisualEvidence.authorityType,
  supplementaryEvidenceDriveFolderId:repair.sourceAuthorityReconciliation.supplementaryVisualEvidence.driveFolderId,
  supplementaryEvidenceFileIds:repair.sourceAuthorityReconciliation.supplementaryVisualEvidence.evidenceItems.map(x=>x.driveFileId),
  supplementaryEvidenceSha256:repair.sourceAuthorityReconciliation.supplementaryVisualEvidence.evidenceItems.map(x=>x.sha256),
  directSemanticCoverage:repair.sourceAuthorityReconciliation.supplementaryVisualEvidence.directSemanticCoverage,
  r03IncomingPrerequisites:incoming,
  r04:{
    primaryRuntimeProfileId:r04.primaryRuntimeProfileId,
    classificationRuleId:r04.classificationRuleId,
    appliedModifierIds:[...r04.appliedModifierIds]
  },
  r05:{
    baseDeliveryWaveId:r05.baseDeliveryWaveId,
    deliveryWaveId:r05.deliveryWaveId,
    waveEscalatedByPrerequisite:r05.waveEscalatedByPrerequisite,
    prerequisiteWaveLowerBound:r05.prerequisiteWaveLowerBound,
    intraWavePrerequisiteRank:r05.intraWavePrerequisiteRank
  },
  semanticOwnershipLock:repair.semanticOwnershipLock,
  implementationPlanningReady:repair.decision.implementationPlanningReady,
  separateImplementationApprovalRequired:repair.decision.separateImplementationApprovalRequired,
  nextTask:repair.decision.nextTask
},null,2));
