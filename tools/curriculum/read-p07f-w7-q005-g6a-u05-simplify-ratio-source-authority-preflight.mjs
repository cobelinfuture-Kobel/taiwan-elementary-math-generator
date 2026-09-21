import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
import {materializeR04SharedRuntimeCapabilityMatrix,getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const p=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p07f/q005-g6a-u05-simplify-ratio-source-authority-preflight.json",import.meta.url),"utf8"));
const kp="kp_g6a_u05_simplify_ratio";
const slice=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[4];
const r04=getR04KnowledgePointCapabilityMapping(kp);
const r05=getR05DeliveryWaveAssignment(kp);
const graph=materializeR04SharedRuntimeCapabilityMatrix().prerequisiteGraph;
const incoming=(graph.incomingByTarget.get(kp)??[]).map(edge=>({
  fromKnowledgePointId:edge.fromKnowledgePointId,
  dependencyStrength:edge.dependencyStrength,
  distanceBearing:edge.distanceBearing,
  alternativeGroupId:edge.alternativeGroupId??null
}));
if(p.status!=="PASS_SOURCE_AUTHORITY_PREFLIGHT")throw new Error("P07F_W7_Q005_PREFLIGHT_STATUS");
if(slice?.sliceId!=="p07e_q005_r8_g6a_u05_6a05_profile_factor_multiple_c1")throw new Error("P07F_W7_Q005_QUEUE_IDENTITY");
if(slice?.previousSliceId!=="p07e_q004_r7_g6a_u06_6a06_profile_geometry_formula_c1")throw new Error("P07F_W7_Q005_PREDECESSOR_IDENTITY");
if(r04?.primaryRuntimeProfileId!=="profile_factor_multiple"||r05?.primaryRuntimeProfileId!=="profile_factor_multiple")throw new Error("P07F_W7_Q005_PROFILE");
if(JSON.stringify(r04?.requiredRuntimeCapabilityIds)!==JSON.stringify(p.runtimeCapabilityAuthority.requiredRuntimeCapabilityIds))throw new Error("P07F_W7_Q005_RUNTIME_CAPABILITY_PARITY");
if(r05?.baseDeliveryWaveId!==p.r05AssignmentAuthority.expectedBaseDeliveryWaveId||r05?.deliveryWaveId!==p.r05AssignmentAuthority.expectedDeliveryWaveId||r05?.prerequisiteWaveLowerBound!==p.r05AssignmentAuthority.expectedPrerequisiteWaveLowerBound||r05?.intraWavePrerequisiteRank!==p.r05AssignmentAuthority.expectedIntraWavePrerequisiteRank)throw new Error("P07F_W7_Q005_R05_PARITY");
if(!incoming.some(edge=>edge.fromKnowledgePointId==="kp_g6a_u05_equivalent_ratio"&&edge.distanceBearing))throw new Error("P07F_W7_Q005_Q003_PREREQUISITE_MISSING");
if(p.semanticProfileLock.targetSemanticCore!=="SIMPLIFY_RATIO_TO_COPRIME_POSITIVE_INTEGER_TERMS")throw new Error("P07F_W7_Q005_SEMANTIC_CORE");
if(p.q005ScopeLock.implementationAllowedByThisPreflight!==false||p.q005ScopeLock.publicProductAdmissionAllowedByThisPreflight!==false)throw new Error("P07F_W7_Q005_SCOPE");
console.log(JSON.stringify({
  schemaName:"P07FW7Q005SourceAuthorityPreflightReadbackV1",
  status:"PASS_P07F_W7_Q005_SOURCE_AUTHORITY_PREFLIGHT",
  predecessorQ004D0Status:p.predecessorD0Evidence.q004Status,
  predecessorQ004ExactHeadSha:p.predecessorD0Evidence.q004MergeSha,
  queuePosition:slice.queuePosition,
  sliceId:slice.sliceId,
  previousSliceId:slice.previousSliceId,
  sourceNodeId:slice.primarySourceNodeId,
  knowledgePointIds:[...slice.knowledgePointIds],
  frozenQueueRuntimeProfileId:slice.primaryRuntimeProfileId,
  requiredW7CapabilityIds:[...slice.requiredW7CapabilityIds],
  executableR04Mapping:{
    primaryRuntimeProfileId:r04.primaryRuntimeProfileId,
    classificationRuleId:r04.classificationRuleId,
    appliedModifierIds:[...r04.appliedModifierIds],
    requiredRuntimeCapabilityIds:[...r04.requiredRuntimeCapabilityIds],
    optionalRuntimeCapabilityIds:[...r04.optionalRuntimeCapabilityIds],
    forbiddenRuntimeCapabilityIds:[...r04.forbiddenRuntimeCapabilityIds]
  },
  r05Assignment:{
    baseDeliveryWaveId:r05.baseDeliveryWaveId,
    deliveryWaveId:r05.deliveryWaveId,
    waveEscalatedByPrerequisite:r05.waveEscalatedByPrerequisite,
    prerequisiteWaveLowerBound:r05.prerequisiteWaveLowerBound,
    intraWavePrerequisiteRank:r05.intraWavePrerequisiteRank
  },
  incomingPrerequisiteEdges:incoming,
  sourcePdfDriveFileId:p.sourceAuthority.sourcePdfDriveFileId,
  sourcePdfSha256:p.sourceAuthority.sourcePdfSha256,
  r02TargetEvidencePages:p.sourceAuthority.evidenceResolution.exactQ005ReviewedEvidencePages,
  currentVisualSupportingPages:p.sourceAuthority.evidenceResolution.currentVisualSupportingPagesRemain,
  evidenceLocalizationStatus:p.sourceAuthority.currentVisualReadbackAuthority.evidenceLocalizationStatus,
  semanticCore:p.semanticProfileLock.targetSemanticCore,
  nextTask:p.preflightDecision.nextTask
},null,2));
