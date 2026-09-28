import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const C="data/curriculum/full-product/p08f/q010-final-learner-visual-d0-closeout.json";
const I="data/project/change-impact/P08F_W8_Q010_FINAL_LEARNER_VISUAL_D0_CLOSEOUT.impact.json";
const V="data/project/validation-plans/P08F_W8_Q010_FINAL_LEARNER_VISUAL_D0_CLOSEOUT.validation.json";
const Q10I="data/curriculum/full-product/p08f/q010-g5a-u05a1-sector-fraction-of-circle-implementation.json";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const c=read(C),impact=read(I),plan=read(V),implementation=read(Q10I);

test("Q010 final learner-visual D0 is granted only after exact operator acceptance",()=>{
 assert.equal(c.status,"Q010_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
 assert.equal(c.operatorAcceptance.required,true);
 assert.equal(c.operatorAcceptance.actualPrintAccepted,true);
 assert.equal(c.operatorAcceptance.learnerFacingAccepted,true);
 assert.equal(c.operatorAcceptance.d0Granted,true);
 assert.equal(c.operatorAcceptance.decisionTextZh,"核准 Q010 D0");
 assert.equal(c.operatorAcceptance.exactArtifactId,10970473252);
 assert.equal(c.finalProductAuthority.preflightPr,1120);
 assert.equal(c.finalProductAuthority.preflightMergeSha,"cecff9311ef5a0ca49aa099455fb29ae2bfb8e45");
 assert.equal(c.finalProductAuthority.implementationPr,1121);
 assert.equal(c.finalProductAuthority.implementationPrGateRunId,36423162791);
 assert.equal(c.finalProductAuthority.implementationPrGateRunNumber,1018);
 assert.equal(c.finalProductAuthority.implementationPrGateConclusion,"success");
 assert.equal(c.finalProductAuthority.implementationMergeSha,"f7accf4b8157eb3300450f5ae3c7ea5f92dbfc57");
 assert.equal(c.finalProductAuthority.deployPagesRunId,36423328015);
 assert.equal(c.finalProductAuthority.deployPagesRunNumber,2403);
 assert.equal(c.finalProductAuthority.deployPagesConclusion,"success");
 assert.equal(c.finalProductAuthority.pagesE2ERunId,36423328210);
 assert.equal(c.finalProductAuthority.pagesE2ERunNumber,1);
 assert.equal(c.finalProductAuthority.pagesE2EConclusion,"success");
 assert.equal(c.finalProductAuthority.exactDeployedHeadSha,"f7accf4b8157eb3300450f5ae3c7ea5f92dbfc57");
});

test("Q010 final learner-facing sector-fraction evidence is explicit, print-safe, and ruler-independent",()=>{
 const e=c.finalLearnerFacingEvidence.sectorFractionOfCircle;
 assert.equal(e.questionCount,15);
 assert.equal(e.answerCount,15);
 assert.equal(e.diagramCount,30);
 assert.equal(e.questionPageCount,3);
 assert.equal(e.answerPageCount,3);
 assert.equal(e.allPageCount,6);
 assert.equal(e.worksheetColumns,2);
 assert.equal(e.rowsPerPage,3);
 assert.equal(e.clippedCellCount,0);
 assert.equal(e.overflowPageCount,0);
 assert.equal(e.internalDiagramClippingCount,0);
 assert.equal(e.minDiagramHeightPx,165);
 assert.deepEqual(e.diagramModes,["ANGLE_TO_FRACTION","REDUCE_ANGLE_OVER_360","ROTATED_SECTOR_FRACTION"]);
 assert.equal(e.fractionAnswerCount,15);
 assert.equal(e.responseLineCount,15);
 assert.equal(e.printInvocationCount,1);
 for(const key of ["browserConsoleErrorCount","browserPageErrorCount","browserRequestFailureCount","browserAssetHttpFailureCount"])assert.equal(c.finalLearnerFacingEvidence[key],0,key);
 for(const key of ["fullCircleDegrees360","sectorFractionEqualsCentralAngleOver360","reducedFractionRequired","fractionRepresentsSameFullCircle","targetIsFractionNotAreaOrArcLength","twoColumnPrintLayout","printSafePagination","responseLineVisible","priorSameSourceOwnersPreserved","laterSameSourceSemanticsHidden","sameUnitMixedModeFailClosed"])assert.equal(c.learnerVisualContract[key],true,key);
 assert.equal(c.learnerVisualContract.rulerMeasurementRequired,false);
 assert.equal(c.learnerVisualContract.printScaleIsAnswerAuthority,false);
});

test("Q010 D0 closeout is governance-only and preserves Q011 boundary",()=>{
 for(const key of ["productRuntimeChanged","publicBindingChanged","selectorRuntimeChanged","generatorChanged","validatorChanged","rendererChanged","worksheetRuntimeChanged","sourceAuthorityChanged","formalMappingIdentityChanged","patternSpecIdentityChanged","frozenQueueChanged","q011OrLaterProductChanged"])assert.equal(c.scope[key],false,key);
 assert.equal(c.antiScopeCreep.implementQ011,false);
 assert.deepEqual(c.distance.remainingQ010Blockers,[]);
 assert.equal(c.distance.goalDistanceAfter,"D0_Q010_LEARNER_VISUAL_HUMAN_ACCEPTED");
 assert.equal(c.q011SuccessorReadiness.nextPreflightTaskId,"P08F_W8_Q011_SourceAuthorityPreflight");
 assert.equal(c.q011SuccessorReadiness.nextImplementationTaskId,"P08F_W8DirectProductVerticalSlice011Implementation");
 assert.equal(c.q011SuccessorReadiness.implementationRequiresSeparateOperatorApproval,true);
 assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI_LIVE_E6_AND_ACTUAL_PRINT_REVIEW");
});

test("current-main movement after exact Q010 product head does not mutate Q010 runtime or identity",()=>{
 const m=c.currentMainReadbackAtMaterialization;
 assert.equal(m.exactProductHeadSha,"f7accf4b8157eb3300450f5ae3c7ea5f92dbfc57");
 assert.equal(m.commitsAfterExactProductHead,8);
 assert.equal(m.q010RuntimeFilesChanged,false);
 assert.equal(m.q010CurriculumIdentityFilesChanged,false);
 assert.equal(m.interveningUnrelatedEvidenceOnlyChanges,true);
 assert.ok(m.changedFilesAfterExactProductHead.every(p=>p.startsWith("docs/ci/")));
});

test("Q010 full-repository failure remains outside the D0-required lane while Q010 contracts pass inside it",()=>{
 const r=c.postMergeFullRegressionReadback;
 assert.equal(r.runId,36423328399);
 assert.equal(r.runNumber,5992);
 assert.equal(r.conclusion,"failure");
 assert.equal(r.d0Required,false);
 assert.equal(r.q010FocusedContractsObservedPassing,true);
 assert.equal(r.unrelatedRepositoryBaselineFailuresPresent,true);
});

test("UNIT_INCREMENTAL_VALIDATION_V1 keeps Q010 final D0 closeout KP-focused",()=>{
 assert.equal(impact.currentScope,"KP_LEAF");
 assert.equal(impact.currentKnowledgePointId,"kp_g5a_u05a1_sector_fraction_of_circle");
 assert.equal(impact.expectedDerivedGate,"KP_FOCUSED");
 assert.deepEqual(impact.currentKnowledgePointIds,["kp_g5a_u05a1_sector_fraction_of_circle"]);
 assert.deepEqual(plan.lanes.KP_FOCUSED.map(x=>x.gateId),["FOCUSED_TEST","TARGETED_BROWSER_E2E","DIRECT_DEPENDENCY_CONTRACTS"]);
 assert.deepEqual(plan.forbidden,["FULL_NODE_REGRESSION","GLOBAL_BROWSER_REPLAY"]);
});
