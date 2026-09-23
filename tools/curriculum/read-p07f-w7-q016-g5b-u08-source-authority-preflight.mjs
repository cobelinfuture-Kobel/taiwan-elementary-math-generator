import {readFileSync} from "node:fs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
const pre=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p07f/q016-g5b-u08-find-base-and-percent-application-source-authority-preflight.json",import.meta.url),"utf8"));
const row=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[15];
const strip=e=>({edgeId:e.edgeId,fromKnowledgePointId:e.fromKnowledgePointId,toKnowledgePointId:e.toKnowledgePointId,dependencyStrength:e.dependencyStrength,dependencyRole:e.dependencyRole,alternativeGroupId:e.alternativeGroupId,distanceBearing:e.distanceBearing,rationale:e.rationale,evidenceRefs:e.evidenceRefs});
if(row.sliceId!==pre.queueAuthority.sliceId||JSON.stringify([...row.knowledgePointIds])!==JSON.stringify(pre.queueAuthority.knowledgePointIds))throw new Error("P07F_W7_Q016_QUEUE_MISMATCH");
const targets=pre.queueAuthority.knowledgePointIds.map(kp=>{
 const r03=getR03DirectPrerequisites(kp).map(strip).sort((a,b)=>a.edgeId.localeCompare(b.edgeId));
 const m=getR04KnowledgePointCapabilityMapping(kp);
 const a=getR05DeliveryWaveAssignment(kp);
 return {knowledgePointId:kp,r03IncomingEdges:r03,r04:{primaryRuntimeProfileId:m.primaryRuntimeProfileId,classificationRuleId:m.classificationRuleId,appliedModifierIds:[...m.appliedModifierIds],requiredRuntimeCapabilityIds:[...m.requiredRuntimeCapabilityIds],optionalRuntimeCapabilityIds:[...m.optionalRuntimeCapabilityIds],forbiddenRuntimeCapabilityIds:[...m.forbiddenRuntimeCapabilityIds]},r05:{baseDeliveryWaveId:a.baseDeliveryWaveId,deliveryWaveId:a.deliveryWaveId,waveEscalatedByPrerequisite:a.waveEscalatedByPrerequisite,prerequisiteWaveLowerBound:a.prerequisiteWaveLowerBound,intraWavePrerequisiteRank:a.intraWavePrerequisiteRank}};
});
if(pre.executableAuthorityReadback.pending!==false)throw new Error("P07F_W7_Q016_EXECUTABLE_AUTHORITY_STILL_PENDING");
if(JSON.stringify(targets)!==JSON.stringify(pre.executableAuthorityReadback.targets))throw new Error("P07F_W7_Q016_EXECUTABLE_AUTHORITY_MISMATCH");
console.log("P07F_W7_Q016_PREFLIGHT_READBACK="+JSON.stringify({status:pre.status,queuePosition:row.queuePosition,sliceId:row.sliceId,knowledgePointIds:[...row.knowledgePointIds],sourceEvidence:pre.currentVisualEvidenceResolution,exactRuntimeAuthority:targets,manualEvidenceChoiceRequired:pre.currentVisualEvidenceResolution.manualEvidenceChoiceRequired,implementationAllowed:pre.preflightDecision.implementationAllowed,nextTask:pre.preflightDecision.nextTask},null,2));
