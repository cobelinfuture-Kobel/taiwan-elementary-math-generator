import {readFileSync} from "node:fs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
const repair=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p07f/q015-g6b-u05-sum-multiple-supplementary-evidence-authority-repair.json",import.meta.url),"utf8"));
const ids=repair.targetIdentity.knowledgePointIds;
for(const kp of ids){
  const r03=getR03DirectPrerequisites(kp),r04=getR04KnowledgePointCapabilityMapping(kp),r05=getR05DeliveryWaveAssignment(kp);
  if(!Array.isArray(r03)||!r04||!r05)throw new Error("P07F_W7_Q015_RUNTIME_AUTHORITY_MISSING:"+kp);
  if(r04.primaryRuntimeProfileId!=="profile_factor_multiple"||r04.classificationRuleId!=="rule_factor_multiple")throw new Error("P07F_W7_Q015_R04_MISMATCH:"+kp);
  if(r05.deliveryWaveId!=="R05-W7"||r05.intraWavePrerequisiteRank!==10)throw new Error("P07F_W7_Q015_R05_MISMATCH:"+kp);
}
const s=repair.sourceAuthorityReconciliation.supplementaryEvidence;
if(s.driveFileId!=="1-m7SwI4NcyWEhyymQ9gE3mL_KeDE21Wc"||s.exactEvidencePage!==1||s.directSemanticWitness.totalQuantity!==480||s.directSemanticWitness.largerIsSmallerTimes!==5||s.directSemanticWitness.totalParts!==6||s.directSemanticWitness.onePart!==80||s.directSemanticWitness.smallerQuantity!==80||s.directSemanticWitness.largerQuantity!==400)throw new Error("P07F_W7_Q015_SUPPLEMENTARY_EVIDENCE_INVALID");
if(repair.decision.sourceEvidenceBlockerResolved!==true||repair.decision.separateImplementationApprovalRequired!==true)throw new Error("P07F_W7_Q015_DECISION_INVALID");
console.log("P07F_W7_Q015_SUPPLEMENTARY_EVIDENCE_READBACK="+JSON.stringify({
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
    sufficiency:s.sufficiency
  },
  semanticOwnershipLock:repair.semanticOwnershipLock,
  sourceEvidenceBlockerResolved:true,
  implementationPlanningReady:true,
  separateImplementationApprovalRequired:true,
  nextTask:repair.decision.nextTask
},null,2));
