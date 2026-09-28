import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const C="data/curriculum/full-product/p08f/q009-final-learner-visual-d0-closeout.json";
const I="data/project/change-impact/P08F_W8_Q009_FINAL_LEARNER_VISUAL_D0_CLOSEOUT.impact.json";
const V="data/project/validation-plans/P08F_W8_Q009_FINAL_LEARNER_VISUAL_D0_CLOSEOUT.validation.json";
const Q9I="data/curriculum/full-product/p08f/q009-g4a-u05-congruent-triangle-correspondence-implementation.json";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const c=read(C),impact=read(I),plan=read(V),implementation=read(Q9I);

test("Q009 final learner-visual D0 is granted only after exact operator acceptance",()=>{
 assert.equal(c.status,"Q009_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
 assert.equal(c.operatorAcceptance.required,true);
 assert.equal(c.operatorAcceptance.actualPrintAccepted,true);
 assert.equal(c.operatorAcceptance.learnerFacingAccepted,true);
 assert.equal(c.operatorAcceptance.d0Granted,true);
 assert.equal(c.operatorAcceptance.decisionTextZh,"核准 Q009 D0");
 assert.equal(c.operatorAcceptance.exactArtifactId,10968062067);
 assert.equal(c.finalProductAuthority.originalImplementationPr,1114);
 assert.equal(c.finalProductAuthority.originalImplementationPrGateRunId,36407913973);
 assert.equal(c.finalProductAuthority.originalImplementationPrGateRunNumber,1007);
 assert.equal(c.finalProductAuthority.originalImplementationMergeSha,"b05a2aca6701d29554f3a81985d87d985ad3107c");
 assert.equal(c.finalProductAuthority.learnerVisualRemediationPr,1115);
 assert.equal(c.finalProductAuthority.learnerVisualRemediationPrGateRunId,36411893709);
 assert.equal(c.finalProductAuthority.learnerVisualRemediationPrGateRunNumber,1010);
 assert.equal(c.finalProductAuthority.learnerVisualRemediationMergeSha,"0290e85f72d8abed33529c263147630decfbe0cd");
 assert.deepEqual(c.finalProductAuthority.readbackRepairChain.map(x=>x.pr),[1116,1117,1118]);
 assert.deepEqual(c.finalProductAuthority.readbackRepairChain.map(x=>x.mergeSha),[
  "d191b0b40029864a3e47fbb4a4a7ebfcf8a54da2",
  "e3fd804d1f374e885051823ed8966cb9f15321c1",
  "31c02e49600011f1851b7666935487a4e062b9e2"
 ]);
 assert.equal(c.finalProductAuthority.deployPagesRunId,36416884281);
 assert.equal(c.finalProductAuthority.deployPagesRunNumber,2400);
 assert.equal(c.finalProductAuthority.deployPagesConclusion,"success");
 assert.equal(c.finalProductAuthority.pagesE2ERunId,36416884356);
 assert.equal(c.finalProductAuthority.pagesE2ERunNumber,8);
 assert.equal(c.finalProductAuthority.pagesE2EConclusion,"success");
 assert.equal(c.finalProductAuthority.exactDeployedHeadSha,"31c02e49600011f1851b7666935487a4e062b9e2");
});

test("Q009 final learner-facing congruence evidence is explicit, print-safe, and ruler-independent",()=>{
 const e=c.finalLearnerFacingEvidence.congruentTriangleCorrespondence;
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
 assert.deepEqual(e.diagramModes,["IDENTIFY_PAIR","MATCH_VERTEX_SIDE_OR_ANGLE","TRANSFER_CORRESPONDING_SIDE_MEASURE"]);
 assert.deepEqual(e.allowedRigidMotions,["TRANSLATION","ROTATION","REFLECTION"]);
 assert.equal(e.sideTickCount,360);
 assert.equal(e.sideLengthLabelCount,180);
 assert.equal(e.sideEvidenceLegendCount,30);
 assert.deepEqual(e.sideEvidenceModes,["numeric-plus-ticks"]);
 assert.deepEqual(e.rulerRequiredFlags,["false"]);
 assert.equal(e.nonEmptyAnswerCount,15);
 assert.equal(e.responseLineCount,15);
 assert.equal(e.printInvocationCount,1);
 for(const key of ["browserConsoleErrorCount","browserPageErrorCount","browserRequestFailureCount","browserAssetHttpFailureCount"])assert.equal(c.finalLearnerFacingEvidence[key],0,key);
 for(const key of ["sameShapeAndSize","correspondingSidesEqual","correspondingAnglesEqual","vertexCorrespondenceConsistent","rigidMotionsAllowed","explicitNumericSideLengthsVisible","matchingSideTickMarksVisible","twoColumnPrintLayout","printSafePagination","responseLineVisible","priorG4AU05OwnersPreserved","sameSourceW8CandidateSetComplete","sameUnitMixedModeFailClosed"])assert.equal(c.learnerVisualContract[key],true,key);
 assert.equal(c.learnerVisualContract.sideEvidenceMode,"EXPLICIT_NUMERIC_LABELS_PLUS_MATCHED_TICK_MARKS");
 assert.equal(c.learnerVisualContract.rulerMeasurementRequired,false);
 assert.equal(c.learnerVisualContract.printScaleIsAnswerAuthority,false);
});

test("Q009 D0 closeout is governance-only and preserves Q010 boundary",()=>{
 for(const key of ["productRuntimeChanged","publicBindingChanged","selectorRuntimeChanged","generatorChanged","validatorChanged","rendererChanged","worksheetRuntimeChanged","sourceAuthorityChanged","formalMappingIdentityChanged","patternSpecIdentityChanged","frozenQueueChanged","q010OrLaterProductChanged"])assert.equal(c.scope[key],false,key);
 assert.equal(c.antiScopeCreep.implementQ010,false);
 assert.deepEqual(c.distance.remainingQ009Blockers,[]);
 assert.equal(c.distance.goalDistanceAfter,"D0_Q009_LEARNER_VISUAL_HUMAN_ACCEPTED");
 assert.equal(c.q010SuccessorReadiness.nextPreflightTaskId,"P08F_W8_Q010_SourceAuthorityPreflight");
 assert.equal(c.q010SuccessorReadiness.nextImplementationTaskId,"P08F_W8DirectProductVerticalSlice010Implementation");
 assert.equal(c.q010SuccessorReadiness.implementationRequiresSeparateOperatorApproval,true);
 assert.equal(implementation.status,"IMPLEMENTATION_VISUAL_REMEDIATION_MATERIALIZED_AWAITING_FOCUSED_CI_LIVE_E6_AND_ACTUAL_PRINT_REVIEW");
});

test("current-main movement after exact Q009 product head does not mutate Q009 runtime or identity",()=>{
 const m=c.currentMainReadbackAtMaterialization;
 assert.equal(m.exactProductHeadSha,"31c02e49600011f1851b7666935487a4e062b9e2");
 assert.equal(m.commitsAfterExactProductHead,6);
 assert.equal(m.q009RuntimeFilesChanged,false);
 assert.equal(m.q009CurriculumIdentityFilesChanged,false);
 assert.equal(m.interveningUnrelatedEvidenceOnlyChanges,true);
 assert.ok(m.changedFilesAfterExactProductHead.every(p=>p.startsWith("docs/ci/")));
});

test("Q009 full-repository failure remains outside the D0-required lane while Q009 contracts pass inside it",()=>{
 const r=c.postMergeFullRegressionReadback;
 assert.equal(r.runId,36416884322);
 assert.equal(r.runNumber,5989);
 assert.equal(r.conclusion,"failure");
 assert.equal(r.d0Required,false);
 assert.equal(r.q009FocusedContractsObservedPassing,true);
 assert.equal(r.unrelatedRepositoryBaselineFailuresPresent,true);
});

test("UNIT_INCREMENTAL_VALIDATION_V1 keeps Q009 final D0 closeout KP-focused",()=>{
 assert.equal(impact.currentScope,"KP_LEAF");
 assert.equal(impact.currentKnowledgePointId,"kp_g4a_u05_congruent_triangle_correspondence");
 assert.equal(impact.expectedDerivedGate,"KP_FOCUSED");
 assert.deepEqual(impact.currentKnowledgePointIds,["kp_g4a_u05_congruent_triangle_correspondence"]);
 assert.deepEqual(plan.lanes.KP_FOCUSED.map(x=>x.gateId),["FOCUSED_TEST","TARGETED_BROWSER_E2E","DIRECT_DEPENDENCY_CONTRACTS"]);
 assert.deepEqual(plan.forbidden,["FULL_NODE_REGRESSION","GLOBAL_BROWSER_REPLAY"]);
});
