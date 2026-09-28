import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
const C="data/curriculum/full-product/p08f/q008-final-learner-visual-d0-closeout.json";
const I="data/project/change-impact/P08F_W8_Q008_FINAL_LEARNER_VISUAL_D0_CLOSEOUT.impact.json";
const V="data/project/validation-plans/P08F_W8_Q008_FINAL_LEARNER_VISUAL_D0_CLOSEOUT.validation.json";
const Q8I="data/curriculum/full-product/p08f/q008-g4a-u05-triangle-angle-classification-implementation.json";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const c=read(C),impact=read(I),plan=read(V),implementation=read(Q8I);

test("Q008 final learner-visual D0 is granted only after exact actual-print operator acceptance",()=>{
 assert.equal(c.status,"Q008_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
 assert.equal(c.operatorAcceptance.required,true);assert.equal(c.operatorAcceptance.actualPrintAccepted,true);assert.equal(c.operatorAcceptance.learnerFacingAccepted,true);assert.equal(c.operatorAcceptance.d0Granted,true);assert.equal(c.operatorAcceptance.decisionTextZh,"圖形OK");
 assert.equal(c.operatorAcceptance.exactArtifactId,10961293739);
 assert.equal(c.finalProductAuthority.implementationPr,1111);assert.equal(c.finalProductAuthority.implementationPrGateRunId,36403162058);assert.equal(c.finalProductAuthority.implementationPrGateRunNumber,1004);
 assert.equal(c.finalProductAuthority.deployPagesRunNumber,2393);assert.equal(c.finalProductAuthority.pagesE2ERunId,36403346781);assert.equal(c.finalProductAuthority.pagesE2EJobId,108866164449);assert.equal(c.finalProductAuthority.pagesE2EConclusion,"success");
 assert.equal(c.finalProductAuthority.implementationMergeSha,"89badfe30bea34c94901d6dfdcf9ddeb67df08df");assert.equal(c.finalProductAuthority.exactDeployedHeadSha,"89badfe30bea34c94901d6dfdcf9ddeb67df08df");
});

test("Q008 final learner-facing triangle-angle evidence is print-safe and semantically bounded",()=>{
 const e=c.finalLearnerFacingEvidence.triangleAngleClassification;
 assert.equal(e.questionCount,15);assert.equal(e.answerCount,15);assert.equal(e.diagramCount,30);assert.equal(e.questionPageCount,3);assert.equal(e.answerPageCount,3);assert.equal(e.allPageCount,6);
 assert.equal(e.worksheetColumns,2);assert.equal(e.rowsPerPage,3);assert.equal(e.clippedCellCount,0);assert.equal(e.overflowPageCount,0);assert.equal(e.internalDiagramClippingCount,0);assert.equal(e.classAnswerCount,15);assert.equal(e.responseLineCount,15);assert.equal(e.printInvocationCount,1);
 assert.deepEqual(e.diagramModes,["ACUTE_TRIANGLE","OBTUSE_TRIANGLE","RIGHT_TRIANGLE"]);
 for(const key of ["browserConsoleErrorCount","browserPageErrorCount","browserRequestFailureCount","browserAssetHttpFailureCount"])assert.equal(c.finalLearnerFacingEvidence[key],0,key);
 for(const key of ["angleSum180","maximumInteriorAngleClassification","acuteRightObtuseExclusive","rotationInvariant","twoColumnPrintLayout","printSafePagination","responseLineVisible","priorG4AU05OwnersPreserved","futureCongruenceHidden","sameUnitMixedModeFailClosed"])assert.equal(c.learnerVisualContract[key],true,key);
});

test("Q008 D0 closeout is governance-only and preserves Q009 boundary",()=>{
 for(const key of ["productRuntimeChanged","publicBindingChanged","selectorRuntimeChanged","generatorChanged","validatorChanged","rendererChanged","worksheetRuntimeChanged","sourceAuthorityChanged","formalMappingIdentityChanged","patternSpecIdentityChanged","frozenQueueChanged","q009OrLaterProductChanged"])assert.equal(c.scope[key],false,key);
 assert.equal(c.antiScopeCreep.implementQ009,false);assert.deepEqual(c.distance.remainingQ008Blockers,[]);assert.equal(c.distance.goalDistanceAfter,"D0_Q008_LEARNER_VISUAL_HUMAN_ACCEPTED");
 assert.equal(c.q009SuccessorReadiness.nextPreflightTaskId,"P08F_W8_Q009_SourceAuthorityPreflight");assert.equal(c.q009SuccessorReadiness.nextImplementationTaskId,"P08F_W8DirectProductVerticalSlice009Implementation");
 assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI_LIVE_E6_AND_ACTUAL_PRINT_REVIEW");
});

test("current-main movement after exact Q008 product merge does not mutate Q008 runtime or identity",()=>{
 const m=c.currentMainReadbackAtMaterialization;assert.equal(m.exactProductMergeSha,"89badfe30bea34c94901d6dfdcf9ddeb67df08df");assert.equal(m.commitsAfterExactProductMerge,10);assert.equal(m.q008RuntimeFilesChanged,false);assert.equal(m.q008CurriculumIdentityFilesChanged,false);assert.ok(m.changedFilesAfterExactProductMerge.every(p=>p.startsWith("docs/ci/")));
});

test("UNIT_INCREMENTAL_VALIDATION_V1 keeps Q008 final D0 closeout KP-focused",()=>{
 assert.equal(impact.currentScope,"KP_LEAF");assert.equal(impact.currentKnowledgePointId,"kp_g4a_u05_triangle_angle_classification");assert.equal(impact.expectedDerivedGate,"KP_FOCUSED");assert.deepEqual(impact.currentKnowledgePointIds,["kp_g4a_u05_triangle_angle_classification"]);
 assert.deepEqual(plan.lanes.KP_FOCUSED.map(x=>x.gateId),["FOCUSED_TEST","TARGETED_BROWSER_E2E","DIRECT_DEPENDENCY_CONTRACTS"]);assert.deepEqual(plan.forbidden,["FULL_NODE_REGRESSION","GLOBAL_BROWSER_REPLAY"]);
});
