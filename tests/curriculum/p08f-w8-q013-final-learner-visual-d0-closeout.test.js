import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const C="data/curriculum/full-product/p08f/q013-final-learner-visual-d0-closeout.json";
const I="data/project/change-impact/P08F_W8_Q013_FINAL_LEARNER_VISUAL_D0_CLOSEOUT.impact.json";
const V="data/project/validation-plans/P08F_W8_Q013_FINAL_LEARNER_VISUAL_D0_CLOSEOUT.validation.json";
const Q13I="data/curriculum/full-product/p08f/q013-g5a-u05-polygon-angle-sum-reasoning-implementation.json";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const c=read(C),impact=read(I),plan=read(V),implementation=read(Q13I);

test("Q013 final learner-visual D0 is granted after exact operator visual acceptance",()=>{
  assert.equal(c.status,"Q013_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(c.operatorAcceptance.required,true);
  assert.equal(c.operatorAcceptance.actualPrintAccepted,true);
  assert.equal(c.operatorAcceptance.learnerFacingAccepted,true);
  assert.equal(c.operatorAcceptance.finalCloseoutResumeAuthorized,true);
  assert.equal(c.operatorAcceptance.d0Granted,true);
  assert.equal(c.operatorAcceptance.decisionTextZh,"圖形 OK");
  assert.equal(c.operatorAcceptance.finalCloseoutResumeTask,"P08F_W8_Q013_FinalLearnerVisualD0Closeout_Then_Q014_SourceAuthorityPreflight");
  assert.equal(c.operatorAcceptance.exactArtifactId,11006378131);
  assert.equal(c.operatorAcceptance.exactArtifactZipSha256,"e1d75b76458e4069c7026d049f163e51e77f9798b1dbb27d110e285c7e311e1e");
  assert.equal(c.finalProductAuthority.preflightPr,1130);
  assert.equal(c.finalProductAuthority.implementationPr,1131);
  assert.equal(c.finalProductAuthority.learnerVisualEvidenceRepairPr,1132);
  assert.equal(c.finalProductAuthority.implementationPrGateRunId,36503688619);
  assert.equal(c.finalProductAuthority.learnerVisualEvidenceRepairPrGateRunId,36504681238);
  assert.equal(c.finalProductAuthority.learnerVisualEvidenceRepairMergeSha,"46309aa93b4341637ad1de14ae8b0eac07f70f5a");
  assert.equal(c.finalProductAuthority.deployPagesRunId,36504809842);
  assert.equal(c.finalProductAuthority.pagesE2ERunId,36504809811);
  assert.equal(c.finalProductAuthority.pagesE2ERunNumber,2);
  assert.equal(c.finalProductAuthority.pagesE2EConclusion,"success");
  assert.equal(c.finalProductAuthority.exactDeployedHeadSha,"46309aa93b4341637ad1de14ae8b0eac07f70f5a");
});

test("Q013 final learner-facing polygon-angle-sum evidence is explicit and print-safe",()=>{
  const e=c.finalLearnerFacingEvidence.polygonAngleSumReasoning;
  assert.equal(e.questionCount,18);
  assert.equal(e.answerCount,18);
  assert.equal(e.diagramCount,36);
  assert.equal(e.questionPageCount,3);
  assert.equal(e.answerPageCount,3);
  assert.equal(e.allPageCount,6);
  assert.equal(e.worksheetColumns,2);
  assert.equal(e.rowsPerPage,3);
  assert.deepEqual(e.patternCounts,[6,6,6]);
  assert.equal(e.overflowPageCount,0);
  assert.ok(e.minDiagramWidthPx>=200);
  assert.ok(e.minDiagramHeightPx>=100);
  assert.equal(e.nonEmptyAnswerCount,18);
  assert.equal(e.printCount,1);
  for(const key of ["browserConsoleErrorCount","browserPageErrorCount","browserRequestFailureCount","browserAssetHttpFailureCount"])assert.equal(c.finalLearnerFacingEvidence[key],0,key);
});

test("Q013 learner-visual contract stays polygon interior-angle-sum only",()=>{
  const v=c.learnerVisualContract;
  assert.equal(v.polygonSideCountRequired,true);
  assert.equal(v.triangleCountFormula,"n-2");
  assert.equal(v.triangleInteriorAngleSumDeg,180);
  assert.equal(v.polygonInteriorAngleSumFormula,"(n-2)*180");
  assert.equal(v.priorTriangulationConsumedAsPrerequisite,true);
  assert.equal(v.standaloneTriangulationReowned,false);
  assert.equal(v.regularPolygonSingleInteriorAngleIncluded,false);
  assert.equal(v.polygonExteriorAngleIncluded,false);
  assert.equal(v.interactiveOrFreeFormConstructionIncluded,false);
  assert.equal(v.applicationContextIncluded,false);
  assert.equal(v.twoColumnPrintLayout,true);
  assert.equal(v.printSafePagination,true);
  assert.equal(v.noInternalIds,true);
  assert.equal(v.priorSameSourceOwnersPreserved,true);
  assert.equal(v.sameUnitMixedModeFailClosed,true);
  assert.equal(v.crossUnitMixedModeFailClosed,true);
});

test("Q013 D0 closeout is governance-only and preserves Q014 boundary",()=>{
  for(const key of ["productRuntimeChanged","publicBindingChanged","selectorRuntimeChanged","generatorChanged","validatorChanged","rendererChanged","worksheetRuntimeChanged","sourceAuthorityChanged","formalMappingIdentityChanged","patternSpecIdentityChanged","frozenQueueChanged","q014OrLaterProductChanged"])assert.equal(c.scope[key],false,key);
  assert.equal(c.antiScopeCreep.implementQ014,false);
  assert.deepEqual(c.distance.remainingQ013Blockers,[]);
  assert.equal(c.distance.goalDistanceAfter,"D0_Q013_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(c.q014SuccessorReadiness.nextPreflightTaskId,"P08F_W8_Q014_SourceAuthorityPreflight");
  assert.equal(c.q014SuccessorReadiness.nextImplementationTaskId,"P08F_W8DirectProductVerticalSlice014Implementation");
  assert.equal(c.q014SuccessorReadiness.implementationRequiresSeparateOperatorApproval,true);
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
});

test("current-main movement after exact Q013 product head does not mutate Q013 runtime or identity",()=>{
  const m=c.currentMainReadbackAtMaterialization;
  assert.equal(m.exactProductHeadSha,"46309aa93b4341637ad1de14ae8b0eac07f70f5a");
  assert.equal(m.commitsAfterExactProductHead,5);
  assert.equal(m.q013RuntimeFilesChanged,false);
  assert.equal(m.q013CurriculumIdentityFilesChanged,false);
  assert.equal(m.interveningUnrelatedCiReadbackOnlyChanges,true);
  assert.ok(m.changedFilesAfterExactProductHead.every(p=>p.startsWith("docs/ci/")));
});

test("Q013 repository-wide failures remain outside D0-required lane and add no named Q013 regression",()=>{
  const r=c.postMergeFullRegressionReadback;
  assert.equal(r.nodeTestRunId,36504809948);
  assert.equal(r.nodeTestRunNumber,6003);
  assert.equal(r.nodeTestConclusion,"failure");
  assert.equal(r.ciReadbackRunId,36504809776);
  assert.equal(r.ciReadbackRunNumber,3745);
  assert.equal(r.ciReadbackConclusion,"failure");
  assert.equal(r.d0Required,false);
  assert.equal(r.q013FocusedContractsObservedPassing,true);
  assert.equal(r.unrelatedRepositoryBaselineFailuresPresent,true);
  assert.equal(r.namedFailureCount,173);
  assert.equal(r.previousNamedFailureCount,173);
  assert.equal(r.newNamedFailures,0);
  assert.equal(r.resolvedNamedFailures,0);
});

test("UNIT_INCREMENTAL_VALIDATION_V1 keeps Q013 final D0 closeout KP-focused",()=>{
  assert.equal(impact.currentScope,"KP_LEAF");
  assert.equal(impact.currentKnowledgePointId,"kp_g5a_u05a_polygon_angle_sum_reasoning");
  assert.equal(impact.expectedDerivedGate,"KP_FOCUSED");
  assert.deepEqual(impact.currentKnowledgePointIds,["kp_g5a_u05a_polygon_angle_sum_reasoning"]);
  assert.deepEqual(plan.lanes.KP_FOCUSED.map(x=>x.gateId),["FOCUSED_TEST","TARGETED_BROWSER_E2E","DIRECT_DEPENDENCY_CONTRACTS"]);
  assert.deepEqual(plan.forbidden,["FULL_NODE_REGRESSION","GLOBAL_BROWSER_REPLAY"]);
});
