import {readFileSync} from "node:fs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
const repair=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p07f/q016-g5b-u08-find-base-quantity-percent-supplementary-evidence-authority-repair.json",import.meta.url),"utf8"));
const ids=repair.targetIdentity.knowledgePointIds;
for(const kp of ids){
  const expected=repair.runtimeLock.byKnowledgePoint[kp];
  const r03=getR03DirectPrerequisites(kp),r04=getR04KnowledgePointCapabilityMapping(kp),r05=getR05DeliveryWaveAssignment(kp);
  if(!Array.isArray(r03)||!r04||!r05)throw new Error("P07F_W7_Q016_RUNTIME_AUTHORITY_MISSING:"+kp);
  if(r04.primaryRuntimeProfileId!==expected.primaryRuntimeProfileId||r04.classificationRuleId!==expected.classificationRuleId)throw new Error("P07F_W7_Q016_R04_MISMATCH:"+kp);
  if(JSON.stringify([...r04.appliedModifierIds])!==JSON.stringify(expected.appliedModifierIds))throw new Error("P07F_W7_Q016_R04_MODIFIER_MISMATCH:"+kp);
  if(r05.deliveryWaveId!=="R05-W7"||r05.intraWavePrerequisiteRank!==11)throw new Error("P07F_W7_Q016_R05_MISMATCH:"+kp);
}
const s=repair.sourceAuthorityReconciliation.supplementaryEvidence;
if(s.driveFileId!=="1grJyszUbRVBWShcWAoxqOjIeD_zQCKVj"||s.exactEvidencePage!==1||s.directSemanticWitness.comparisonQuantity!==9||s.directSemanticWitness.percentRateDecimal!==0.015||s.directSemanticWitness.baseQuantity!==600)throw new Error("P07F_W7_Q016_SUPPLEMENTARY_EVIDENCE_INVALID");
if(repair.decision.sourceEvidenceBlockerResolved!==true||repair.decision.separateImplementationApprovalRequired!==true)throw new Error("P07F_W7_Q016_DECISION_INVALID");
console.log("P07F_W7_Q016_SUPPLEMENTARY_EVIDENCE_READBACK="+JSON.stringify({
  status:repair.status,
  targetIdentity:repair.targetIdentity,
  originalSourceTruth:repair.sourceAuthorityReconciliation.originalCurriculumSource,
  supplementaryEvidence:{
    driveFileId:s.driveFileId,
    fileName:s.fileName,
    sha256:s.sha256,
    exactEvidencePage:s.exactEvidencePage,
    exactEvidenceLocation:s.exactEvidenceLocation,
    exactProblemText:s.exactProblemText,
    directSemanticWitness:s.directSemanticWitness,
    sufficiency:s.sufficiency,
    curriculumScopeInheritanceAllowed:s.curriculumScopeInheritanceAllowed
  },
  semanticOwnershipLock:repair.semanticOwnershipLock,
  sourceEvidenceBlockerResolved:true,
  implementationPlanningReady:true,
  separateImplementationApprovalRequired:true,
  nextTask:repair.decision.nextTask
},null,2));
