import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const C="data/curriculum/full-product/p08f/q011-final-learner-visual-d0-closeout.json";
const I="data/project/change-impact/P08F_W8_Q011_FINAL_LEARNER_VISUAL_D0_CLOSEOUT.impact.json";
const V="data/project/validation-plans/P08F_W8_Q011_FINAL_LEARNER_VISUAL_D0_CLOSEOUT.validation.json";
const Q11I="data/curriculum/full-product/p08f/q011-g5a-u07-coordinate-reflection-implementation.json";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const c=read(C),impact=read(I),plan=read(V),implementation=read(Q11I);

test("Q011 final learner-visual D0 is granted only after revised exact operator acceptance",()=>{
 assert.equal(c.status,"Q011_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
 assert.equal(c.operatorAcceptance.required,true);
 assert.equal(c.operatorAcceptance.actualPrintAccepted,true);
 assert.equal(c.operatorAcceptance.learnerFacingAccepted,true);
 assert.equal(c.operatorAcceptance.axisOrientationHintAccepted,true);
 assert.equal(c.operatorAcceptance.d0Granted,true);
 assert.equal(c.operatorAcceptance.decisionTextZh,"核准 Q011 D0");
 assert.equal(c.operatorAcceptance.exactArtifactId,10975939114);
 assert.equal(c.finalProductAuthority.preflightPr,1123);
 assert.equal(c.finalProductAuthority.implementationPr,1124);
 assert.equal(c.finalProductAuthority.implementationPrGateRunId,36429434916);
 assert.equal(c.finalProductAuthority.implementationPrGateRunNumber,1025);
 assert.equal(c.finalProductAuthority.implementationMergeSha,"1e65d308163f4e905b4f0d6b3d556a448225fff6");
 assert.equal(c.finalProductAuthority.learnerHintRemediationPr,1125);
 assert.equal(c.finalProductAuthority.learnerHintRemediationPrGateRunId,36436414844);
 assert.equal(c.finalProductAuthority.learnerHintRemediationPrGateRunNumber,1027);
 assert.equal(c.finalProductAuthority.learnerHintRemediationMergeSha,"241f9d022b93b664024f8d0eae777ef38237292b");
 assert.equal(c.finalProductAuthority.deployPagesRunId,36436727047);
 assert.equal(c.finalProductAuthority.deployPagesRunNumber,2407);
 assert.equal(c.finalProductAuthority.pagesE2ERunId,36436727133);
 assert.equal(c.finalProductAuthority.pagesE2ERunAttempt,2);
 assert.equal(c.finalProductAuthority.pagesE2EConclusion,"success");
 assert.equal(c.finalProductAuthority.exactDeployedHeadSha,"241f9d022b93b664024f8d0eae777ef38237292b");
});

test("Q011 final learner-facing reflection evidence is explicit, print-safe, and orientation-clear",()=>{
 const e=c.finalLearnerFacingEvidence.coordinateReflection;
 assert.equal(e.questionCount,15);
 assert.equal(e.answerCount,15);
 assert.equal(e.diagramCount,30);
 assert.equal(e.questionPageCount,3);
 assert.equal(e.answerPageCount,3);
 assert.equal(e.allPageCount,6);
 assert.equal(e.worksheetColumns,2);
 assert.equal(e.maxRowsPerPage,3);
 assert.equal(e.clippedCellCount,0);
 assert.equal(e.overflowPageCount,0);
 assert.equal(e.internalDiagramClippingCount,0);
 assert.equal(e.minDiagramHeightPx,140);
 assert.deepEqual(e.diagramModes,["HORIZONTAL_AXIS","SHIFTED_AXIS","VERTICAL_AXIS"]);
 assert.equal(e.coordinateAnswerCount,15);
 assert.equal(e.responseLineCount,15);
 assert.equal(e.reflectedAnswerPointCount,15);
 assert.equal(e.reflectionAxisCount,30);
 assert.equal(e.axisOrientationHints.xAxis,"水平線；上下鏡射；x 座標不變");
 assert.equal(e.axisOrientationHints.yAxis,"垂直線；左右鏡射；y 座標不變");
 assert.equal(e.axisOrientationHints.shiftedVerticalAxis,"垂直線；左右鏡射；y 座標不變");
 assert.equal(e.axisOrientationHints.shiftedHorizontalAxis,"水平線；上下鏡射；x 座標不變");
 for(const key of ["browserConsoleErrorCount","browserPageErrorCount","browserRequestFailureCount","browserAssetHttpFailureCount"])assert.equal(c.finalLearnerFacingEvidence[key],0,key);
});

test("Q011 learner-visual contract locks x/y axis meaning without ruler or print-scale authority",()=>{
 const v=c.learnerVisualContract;
 for(const key of ["coordinateReflectionRequired","coordinateMapRepresentationRequired","reflectionAxisRequired","perpendicularDistanceToAxisPreserved","lengthAndAnglePreserved","pointsOnAxisRemainFixed","xAxisHorizontalUpDownReflection","xCoordinateUnchangedAcrossXAxis","yAxisVerticalLeftRightReflection","yCoordinateUnchangedAcrossYAxis","shiftedAxisOrientationHintRequired","twoColumnPrintLayout","printSafePagination","responseLineVisible","priorSameSourceOwnersPreserved","sameSourceCandidateSetComplete","sameUnitMixedModeFailClosed"])assert.equal(v[key],true,key);
 assert.equal(v.rulerMeasurementRequired,false);
 assert.equal(v.printScaleIsAnswerAuthority,false);
});

test("Q011 D0 closeout is governance-only and preserves Q012 boundary",()=>{
 for(const key of ["productRuntimeChanged","publicBindingChanged","selectorRuntimeChanged","generatorChanged","validatorChanged","rendererChanged","worksheetRuntimeChanged","sourceAuthorityChanged","formalMappingIdentityChanged","patternSpecIdentityChanged","frozenQueueChanged","q012OrLaterProductChanged"])assert.equal(c.scope[key],false,key);
 assert.equal(c.antiScopeCreep.implementQ012,false);
 assert.deepEqual(c.distance.remainingQ011Blockers,[]);
 assert.equal(c.distance.goalDistanceAfter,"D0_Q011_LEARNER_VISUAL_HUMAN_ACCEPTED");
 assert.equal(c.q012SuccessorReadiness.nextPreflightTaskId,"P08F_W8_Q012_SourceAuthorityPreflight");
 assert.equal(c.q012SuccessorReadiness.nextImplementationTaskId,"P08F_W8DirectProductVerticalSlice012Implementation");
 assert.equal(c.q012SuccessorReadiness.implementationRequiresSeparateOperatorApproval,true);
 assert.equal(implementation.status,"IMPLEMENTATION_VISUAL_REMEDIATION_MATERIALIZED_AWAITING_FOCUSED_CI_LIVE_E6_AND_ACTUAL_PRINT_REVIEW");
});

test("current-main movement after exact Q011 product head does not mutate Q011 runtime or identity",()=>{
 const m=c.currentMainReadbackAtMaterialization;
 assert.equal(m.exactProductHeadSha,"241f9d022b93b664024f8d0eae777ef38237292b");
 assert.equal(m.commitsAfterExactProductHead,6);
 assert.equal(m.q011RuntimeFilesChanged,false);
 assert.equal(m.q011CurriculumIdentityFilesChanged,false);
 assert.equal(m.interveningUnrelatedEvidenceOnlyChanges,true);
 assert.ok(m.changedFilesAfterExactProductHead.every(p=>p.startsWith("docs/ci/")));
});

test("Q011 full-repository failure remains outside the D0-required lane while Q011 contracts pass inside it",()=>{
 const r=c.postMergeFullRegressionReadback;
 assert.equal(r.runId,36436727077);
 assert.equal(r.runNumber,5996);
 assert.equal(r.conclusion,"failure");
 assert.equal(r.d0Required,false);
 assert.equal(r.q011FocusedContractsObservedPassing,true);
 assert.equal(r.unrelatedRepositoryBaselineFailuresPresent,true);
 assert.equal(r.unrelatedFailureCount,173);
 assert.deepEqual(r.q011PreflightSubtestRange,[4451,4455]);
 assert.deepEqual(r.q011ImplementationSubtestRange,[4603,4619]);
});

test("UNIT_INCREMENTAL_VALIDATION_V1 keeps Q011 final D0 closeout KP-focused",()=>{
 assert.equal(impact.currentScope,"KP_LEAF");
 assert.equal(impact.currentKnowledgePointId,"kp_g5a_u07_coordinate_reflection");
 assert.equal(impact.expectedDerivedGate,"KP_FOCUSED");
 assert.deepEqual(impact.currentKnowledgePointIds,["kp_g5a_u07_coordinate_reflection"]);
 assert.deepEqual(plan.lanes.KP_FOCUSED.map(x=>x.gateId),["FOCUSED_TEST","TARGETED_BROWSER_E2E","DIRECT_DEPENDENCY_CONTRACTS"]);
 assert.deepEqual(plan.forbidden,["FULL_NODE_REGRESSION","GLOBAL_BROWSER_REPLAY"]);
});
