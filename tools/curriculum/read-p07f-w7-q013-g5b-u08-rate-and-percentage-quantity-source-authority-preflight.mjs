import {readFileSync} from "node:fs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
const pre=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p07f/q013-g5b-u08-rate-and-percentage-quantity-source-authority-preflight.json",import.meta.url),"utf8"));
const kps=["kp_g5b_u08_find_percentage_rate","kp_g5b_u08_percentage_of_quantity"];
const strip=e=>({edgeId:e.edgeId,fromKnowledgePointId:e.fromKnowledgePointId,toKnowledgePointId:e.toKnowledgePointId,dependencyStrength:e.dependencyStrength,dependencyRole:e.dependencyRole,alternativeGroupId:e.alternativeGroupId,distanceBearing:e.distanceBearing,rationale:e.rationale,evidenceRefs:e.evidenceRefs});
const row=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[12];
if(pre.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P07F_W7_Q013_STATUS");
if(row.sliceId!==pre.queueAuthority.sliceId||JSON.stringify([...row.knowledgePointIds])!==JSON.stringify(kps))throw new Error("P07F_W7_Q013_QUEUE");
for(const kp of kps){
  const actualR03=getR03DirectPrerequisites(kp).map(strip).sort((a,b)=>a.edgeId.localeCompare(b.edgeId));
  const expectedR03=[...pre.prerequisiteGraphAuthority.byKnowledgePoint[kp].exactIncomingRequiredDistanceBearingEdges].sort((a,b)=>a.edgeId.localeCompare(b.edgeId));
  if(JSON.stringify(actualR03)!==JSON.stringify(expectedR03))throw new Error("P07F_W7_Q013_R03:"+kp);
  const r04=getR04KnowledgePointCapabilityMapping(kp),e04=pre.runtimeCapabilityAuthority.executableR04MappingsByKnowledgePoint[kp];
  if(!r04||r04.primaryRuntimeProfileId!==e04.primaryRuntimeProfileId||r04.classificationRuleId!==e04.classificationRuleId||JSON.stringify([...r04.appliedModifierIds])!==JSON.stringify(e04.appliedModifierIds)||JSON.stringify([...r04.requiredRuntimeCapabilityIds])!==JSON.stringify(e04.requiredRuntimeCapabilityIds))throw new Error("P07F_W7_Q013_R04:"+kp);
  const r05=getR05DeliveryWaveAssignment(kp),e05=pre.r05AssignmentAuthority.exactR05AssignmentsByKnowledgePoint[kp];
  if(!r05||["baseDeliveryWaveId","deliveryWaveId","waveEscalatedByPrerequisite","prerequisiteWaveLowerBound","intraWavePrerequisiteRank"].some(key=>r05[key]!==e05[key]))throw new Error("P07F_W7_Q013_R05:"+kp);
}
if(pre.sourceAuthority.currentVisualReadbackAuthority.findPercentageRateDirectVisualEvidence.directEvidencePresent!==true||pre.sourceAuthority.currentVisualReadbackAuthority.percentageOfQuantityDirectVisualEvidence.directEvidencePresent!==true)throw new Error("P07F_W7_Q013_SOURCE_VISUAL");
if(pre.preflightDecision.separateImplementationApprovalRequired!==true)throw new Error("P07F_W7_Q013_APPROVAL_BOUNDARY");
console.log("P07F_W7_Q013_EXECUTABLE_READBACK="+JSON.stringify({
  schemaName:"P07FW7Q013RateAndPercentageQuantitySourceAuthorityExecutableReadbackV1",
  status:"READY_FOR_IMPLEMENTATION_APPROVAL",
  queuePosition:pre.queueAuthority.queuePosition,
  sliceId:pre.queueAuthority.sliceId,
  knowledgePointIds:kps,
  sourceDirectEvidencePages:pre.sourceAuthority.currentQ013DirectEvidencePages,
  r03:pre.prerequisiteGraphAuthority.byKnowledgePoint,
  r04:pre.runtimeCapabilityAuthority.executableR04MappingsByKnowledgePoint,
  r05:pre.r05AssignmentAuthority.exactR05AssignmentsByKnowledgePoint,
  semanticProfileLocks:pre.semanticProfileLocks,
  separateImplementationApprovalRequired:true,
  nextTask:pre.preflightDecision.nextTask
},null,2));
