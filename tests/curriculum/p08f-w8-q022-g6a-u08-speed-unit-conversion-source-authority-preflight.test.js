import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p08f/q022-g6a-u08-speed-unit-conversion-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-07.json");
const index=read("data/curriculum/full-product/p08e/w8-source-authority-index.json");
const q021=read("data/curriculum/full-product/p08f/q021-final-learner-visual-d0-closeout.json");
const KP="kp_speed_unit_conversion",SRC="g6a_u08_6a08";

test("W8 Q022 is the exact final frozen queue slice after Q021 D0",()=>{
  const result=materializeP08EW8DirectProductVerticalSliceQueue(),slice=result.queueEntries[21];
  assert.equal(q021.status,"Q021_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(q021.operatorAcceptance.d0Granted,true);
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(result.queueFrozen,true);
  assert.equal(result.queueEntries.length,22);
  assert.equal(slice.queuePosition,22);
  assert.equal(slice.sliceId,"p08e_q022_r14_g6a_u08_6a08_profile_speed_rate_c1");
  assert.equal(slice.implementationTaskId,"P08F_W8DirectProductVerticalSlice022Implementation");
  assert.equal(slice.previousSliceId,"p08e_q021_r12_g6b_u06_6b06_profile_ratio_percent_c1");
  assert.equal(slice.assignedDeliveryWaveId,"R05-W8");
  assert.equal(slice.primarySourceNodeId,SRC);
  assert.equal(slice.intraWavePrerequisiteRank,14);
  assert.equal(slice.primaryRuntimeProfileId,"profile_speed_rate");
  assert.deepEqual(slice.knowledgePointIds,[KP]);
  assert.equal(p.queueAuthority.finalFrozenW8Slice,true);
});

test("W8 Q022 binds reviewed speed-unit-conversion source authority without source ambiguity",()=>{
  const source=r02.sourceRecords.find(x=>x.sourceNodeId===SRC);assert.ok(source);
  const target=source.candidates.find(x=>x.knowledgePointId===KP);assert.ok(target);
  const indexed=index.sources.find(x=>x.sourceNodeId===SRC);assert.ok(indexed);
  assert.equal(target.canonicalNameZh,"速率單位換算");
  assert.equal(target.capabilityStatement,"學生能在公里每時、公尺每分、公尺每秒間換算。");
  assert.equal(target.reasoningInvariant,"距離與時間單位須同時按等值比例換算。");
  assert.deepEqual(target.evidencePages,[1,2]);
  assert.deepEqual(indexed.primaryW8KnowledgePointIds,[KP]);
  assert.equal(p.sourceAuthority.primary.sourcePdfDriveFileId,"1mI0hgM7Nknw01PFUCPf-IwgZTtUi3zP-");
  assert.equal(p.sourceAuthority.primary.sourcePdfSizeBytes,666779);
  assert.equal(p.sourceAuthority.sourceRefAmbiguity,false);
  assert.equal(p.sourceAuthority.manualSourceChoiceRequired,false);
  assert.equal(p.sourceAuthority.manualEvidenceChoiceRequired,false);
});

test("W8 Q022 reads exact R03/R04/R05 executable authority without reclassification",()=>{
  const prerequisites=getR03DirectPrerequisites(KP);
  const mapping=getR04KnowledgePointCapabilityMapping(KP);assert.ok(mapping);
  const row=getR05DeliveryWaveAssignment(KP);assert.ok(row);
  assert.ok(Array.isArray(prerequisites));
  assert.equal(mapping.primaryRuntimeProfileId,"profile_speed_rate");
  assert.equal(mapping.classificationRuleId,"rule_speed_rate");
  assert.equal(row.deliveryWaveId,"R05-W8");
  assert.equal(row.intraWavePrerequisiteRank,14);
  assert.equal(row.primaryRuntimeProfileId,"profile_speed_rate");
  assert.ok(row.sourceNodeIds.includes(SRC));
  assert.equal(p.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed,false);
});

test("W8 Q022 semantic lock is equivalent speed-unit conversion only",()=>{
  const c=p.semanticProfileLock.implementationSemanticLock;
  assert.equal(c.kmPerHourToMeterPerMinuteAllowed,true);
  assert.equal(c.meterPerMinuteToKmPerHourAllowed,true);
  assert.equal(c.kmPerHourToMeterPerSecondAllowed,true);
  assert.equal(c.meterPerSecondToKmPerHourAllowed,true);
  assert.equal(c.meterPerMinuteToMeterPerSecondAllowed,true);
  assert.equal(c.meterPerSecondToMeterPerMinuteAllowed,true);
  assert.equal(c.coupledDistanceTimeScalingRequired,true);
  assert.equal(c.equivalentRateInvariantRequired,true);
  assert.equal(c.speedDistanceTimeRelationTeachingReownershipAllowed,false);
  assert.equal(c.averageSpeedReownershipAllowed,false);
  assert.equal(c.relativeSpeedMeetingChasingReownershipAllowed,false);
  assert.equal(c.effectiveSpeedCurrentWindReownershipAllowed,false);
  assert.equal(c.applicationContextAllowed,false);
  assert.equal(c.sameUnitMixedModeAllowed,false);
  assert.equal(c.crossUnitMixedModeAllowed,false);
});

test("W8 Q022 preserves predecessor speed owners and completes frozen W8",()=>{
  assert.deepEqual(p.ownershipBoundary.currentQ022KnowledgePointIds,[KP]);
  assert.deepEqual(p.ownershipBoundary.futureSameSourceW8KnowledgePointIds,[]);
  assert.equal(p.ownershipBoundary.q022CompletesRemainingFrozenW8G6AU08KnowledgePoints,true);
  assert.equal(p.ownershipBoundary.q022IsFinalFrozenW8Slice,true);
  assert.equal(p.q022ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q022ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(p.q022ScopeLock.q023OrLaterQueueSliceExists,false);
  assert.equal(p.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(p.preflightDecision.nextTask,"P08F_W8DirectProductVerticalSlice022Implementation");
});
