import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {materializeP05EW5DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import {materializeR04SharedRuntimeCapabilityMatrix} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {materializeR05DeliveryWaveRebase} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const preflight=JSON.parse(fs.readFileSync(path.join(ROOT,"data/curriculum/full-product/p05f/q046-g5a-u09-triangle-trapezoid-area-formulas-source-authority-preflight.json"),"utf8"));
const queue=materializeP05EW5DirectProductVerticalSliceQueue();
const r04=materializeR04SharedRuntimeCapabilityMatrix();
const r05=materializeR05DeliveryWaveRebase();
const row=queue.queueEntries.find(x=>x.queuePosition===46);
if(!row) throw new Error("Q046_QUEUE_ROW_NOT_FOUND");
if(row.sliceId!==preflight.queueAuthority.sliceId) throw new Error("Q046_SLICE_ID_MISMATCH");
if(JSON.stringify(row.knowledgePointIds)!==JSON.stringify(preflight.queueAuthority.knowledgePointIds)) throw new Error("Q046_KP_SET_MISMATCH");
if(preflight.previousSliceD0Evidence.status!=="PASS_E6_D0_COMPLETE") throw new Error("Q045_D0_EVIDENCE_NOT_LOCKED");
if(preflight.sourceAuthority.sourceRefAmbiguity||preflight.sourceAuthority.manualSourceChoiceRequired) throw new Error("Q046_SOURCE_AUTHORITY_AMBIGUOUS");
for(const kp of row.knowledgePointIds){
  const mapping=r04.getMapping(kp);
  const assignment=r05.getAssignment(kp);
  if(!mapping||!assignment) throw new Error(`Q046_RUNTIME_AUTHORITY_MISSING:${kp}`);
  if(mapping.primaryRuntimeProfileId!=="profile_geometry_formula") throw new Error(`Q046_RUNTIME_PROFILE_MISMATCH:${kp}`);
  if(assignment.deliveryWaveId!=="R05-W5"||assignment.intraWavePrerequisiteRank!==4) throw new Error(`Q046_R05_ASSIGNMENT_MISMATCH:${kp}`);
}
if(preflight.q046ScopeLock.implementationAllowedByThisPreflight) throw new Error("Q046_PREFLIGHT_MUST_NOT_IMPLEMENT");
if(!preflight.preflightDecision.nextTaskRequiresNewOperatorApproval) throw new Error("Q046_IMPLEMENTATION_APPROVAL_BOUNDARY_MISSING");

console.log(JSON.stringify({
  status:"Q046_SOURCE_AUTHORITY_PREFLIGHT_READBACK_PASS",
  queuePosition:row.queuePosition,
  sliceId:row.sliceId,
  sourceId:row.primarySourceNodeId,
  knowledgePointIds:row.knowledgePointIds,
  runtimeProfileId:row.primaryRuntimeProfileId,
  requiredW5CapabilityIds:row.requiredW5CapabilityIds,
  previousSliceD0Status:preflight.previousSliceD0Evidence.status,
  previousSliceExactPagesRunId:preflight.previousSliceD0Evidence.exactPagesRunId,
  sourceAuthorityMethod:preflight.sourceAuthority.authorityMethod,
  targetEvidencePages:{
    triangle:preflight.sourceAuthority.targetEvidenceReconciliation.triangleAreaFormula.r02EvidencePages,
    trapezoid:preflight.sourceAuthority.targetEvidenceReconciliation.trapezoidAreaFormula.r02EvidencePages,
  },
  validationLane:preflight.preflightValidationBoundary.derivedLane,
  implementationAllowed:false,
  nextTask:preflight.preflightDecision.nextTask,
},null,2));
