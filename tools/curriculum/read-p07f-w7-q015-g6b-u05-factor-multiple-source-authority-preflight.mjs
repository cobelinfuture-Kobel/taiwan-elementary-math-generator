import {readFileSync} from "node:fs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
const pre=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p07f/q015-g6b-u05-factor-multiple-source-authority-preflight.json",import.meta.url),"utf8"));
const row=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[14];
const strip=e=>({edgeId:e.edgeId,fromKnowledgePointId:e.fromKnowledgePointId,toKnowledgePointId:e.toKnowledgePointId,dependencyStrength:e.dependencyStrength,dependencyRole:e.dependencyRole,alternativeGroupId:e.alternativeGroupId,distanceBearing:e.distanceBearing,rationale:e.rationale,evidenceRefs:e.evidenceRefs});
if(row.sliceId!==pre.queueAuthority.sliceId||JSON.stringify([...row.knowledgePointIds])!==JSON.stringify(pre.queueAuthority.knowledgePointIds))throw new Error("P07F_W7_Q015_QUEUE_MISMATCH");
for(const expected of pre.executableAuthorityReadback.targets){
 const r03=getR03DirectPrerequisites(expected.knowledgePointId).map(strip).sort((a,b)=>a.edgeId.localeCompare(b.edgeId));
 if(JSON.stringify(r03)!==JSON.stringify([...expected.r03IncomingEdges].sort((a,b)=>a.edgeId.localeCompare(b.edgeId))))throw new Error("P07F_W7_Q015_R03_MISMATCH:"+expected.knowledgePointId);
 const r04=getR04KnowledgePointCapabilityMapping(expected.knowledgePointId),r05=getR05DeliveryWaveAssignment(expected.knowledgePointId);
 if(!r04||r04.primaryRuntimeProfileId!==expected.r04.primaryRuntimeProfileId||r04.classificationRuleId!==expected.r04.classificationRuleId)throw new Error("P07F_W7_Q015_R04_MISMATCH:"+expected.knowledgePointId);
 if(!r05||r05.deliveryWaveId!==expected.r05.deliveryWaveId||r05.intraWavePrerequisiteRank!==expected.r05.intraWavePrerequisiteRank)throw new Error("P07F_W7_Q015_R05_MISMATCH:"+expected.knowledgePointId);
}
if(pre.currentVisualEvidenceResolution.differenceMultiple.directSupport!==true)throw new Error("P07F_W7_Q015_DIFFERENCE_EVIDENCE");
if(pre.currentVisualEvidenceResolution.sumMultiple.directSupport!==false)throw new Error("P07F_W7_Q015_SUM_EVIDENCE");
if(pre.preflightDecision.manualEvidenceChoiceRequired!==true||pre.preflightDecision.implementationAllowed!==false)throw new Error("P07F_W7_Q015_BLOCKER_CONTRACT");
console.log("P07F_W7_Q015_PREFLIGHT_READBACK="+JSON.stringify({
 status:pre.status,
 queuePosition:pre.queueAuthority.queuePosition,
 sliceId:pre.queueAuthority.sliceId,
 knowledgePointIds:pre.queueAuthority.knowledgePointIds,
 differenceMultipleEvidence:pre.currentVisualEvidenceResolution.differenceMultiple,
 sumMultipleEvidence:pre.currentVisualEvidenceResolution.sumMultiple,
 exactRuntimeAuthority:pre.executableAuthorityReadback.targets,
 manualEvidenceChoiceRequired:true,
 implementationAllowed:false,
 nextTask:pre.preflightDecision.nextTask
},null,2));
