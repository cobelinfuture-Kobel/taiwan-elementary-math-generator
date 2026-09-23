import {readFileSync} from "node:fs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
const pre=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p07f/q012-g6a-u09-scale-area-change-source-authority-preflight.json",import.meta.url),"utf8"));
const kp="kp_g6a_u09_scale_area_change";
const strip=e=>({edgeId:e.edgeId,fromKnowledgePointId:e.fromKnowledgePointId,toKnowledgePointId:e.toKnowledgePointId,dependencyStrength:e.dependencyStrength,dependencyRole:e.dependencyRole,alternativeGroupId:e.alternativeGroupId,distanceBearing:e.distanceBearing,rationale:e.rationale,evidenceRefs:e.evidenceRefs});
const r03=getR03DirectPrerequisites(kp).map(strip).sort((a,b)=>a.edgeId.localeCompare(b.edgeId));
const expectedR03=[...pre.prerequisiteGraphAuthority.exactIncomingRequiredDistanceBearingEdges].sort((a,b)=>a.edgeId.localeCompare(b.edgeId));
const r04=getR04KnowledgePointCapabilityMapping(kp),r05=getR05DeliveryWaveAssignment(kp),e04=pre.runtimeCapabilityAuthority.executableR04Mapping,e05=pre.r05AssignmentAuthority.exactR05Assignment;
if(pre.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P07F_W7_Q012_STATUS");
if(JSON.stringify(r03)!==JSON.stringify(expectedR03))throw new Error("P07F_W7_Q012_R03");
if(!r04||r04.primaryRuntimeProfileId!==e04.primaryRuntimeProfileId||r04.classificationRuleId!==e04.classificationRuleId||JSON.stringify([...r04.appliedModifierIds])!==JSON.stringify(e04.appliedModifierIds)||JSON.stringify([...r04.requiredRuntimeCapabilityIds])!==JSON.stringify(e04.requiredRuntimeCapabilityIds))throw new Error("P07F_W7_Q012_R04");
if(!r05||["baseDeliveryWaveId","deliveryWaveId","waveEscalatedByPrerequisite","prerequisiteWaveLowerBound","intraWavePrerequisiteRank"].some(k=>r05[k]!==e05[k]))throw new Error("P07F_W7_Q012_R05");
if(pre.sourceAuthority.currentVisualReadbackAuthority.q012DirectVisualEvidence.directScaleAreaChangeQuestionVisible!==true)throw new Error("P07F_W7_Q012_SOURCE_VISUAL");
if(pre.preflightDecision.separateImplementationApprovalRequired!==true)throw new Error("P07F_W7_Q012_APPROVAL_BOUNDARY");
console.log("P07F_W7_Q012_EXECUTABLE_READBACK="+JSON.stringify({
  schemaName:"P07FW7Q012ScaleAreaChangeSourceAuthorityExecutableReadbackV1",
  status:"READY_FOR_IMPLEMENTATION_APPROVAL",
  queuePosition:pre.queueAuthority.queuePosition,
  sliceId:pre.queueAuthority.sliceId,
  knowledgePointId:kp,
  sourceVisualSupportLevel:pre.sourceAuthority.evidenceResolution.currentVisualSupportLevel,
  r03IncomingEdges:r03,
  r04:e04,
  r05:e05,
  semanticProfileLock:pre.semanticProfileLock,
  separateImplementationApprovalRequired:true,
  nextTask:pre.preflightDecision.nextTask
},null,2));
