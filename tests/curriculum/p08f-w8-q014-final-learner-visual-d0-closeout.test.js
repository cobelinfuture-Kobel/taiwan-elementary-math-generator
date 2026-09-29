import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const C="data/curriculum/full-product/p08f/q014-final-learner-visual-d0-closeout.json";
const I="data/project/change-impact/P08F_W8_Q014_FINAL_LEARNER_VISUAL_D0_CLOSEOUT.impact.json";
const V="data/project/validation-plans/P08F_W8_Q014_FINAL_LEARNER_VISUAL_D0_CLOSEOUT.validation.json";
const Q14I="data/curriculum/full-product/p08f/q014-g6a-u09-map-scale-distance-implementation.json";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const c=read(C),impact=read(I),plan=read(V),implementation=read(Q14I);

test("Q014 final learner-visual D0 is granted after exact operator visual acceptance",()=>{
  assert.equal(c.status,"Q014_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(c.operatorAcceptance.required,true);
  assert.equal(c.operatorAcceptance.actualPrintAccepted,true);
  assert.equal(c.operatorAcceptance.learnerFacingAccepted,true);
  assert.equal(c.operatorAcceptance.finalCloseoutResumeAuthorized,true);
  assert.equal(c.operatorAcceptance.d0Granted,true);
  assert.equal(c.operatorAcceptance.decisionTextZh,"圖形 OK");
  assert.equal(c.operatorAcceptance.finalCloseoutResumeTask,"P08F_W8_Q014_FinalLearnerVisualD0Closeout_Then_Q015_SourceAuthorityPreflight");
  assert.equal(c.operatorAcceptance.exactArtifactId,11012685398);
  assert.equal(c.operatorAcceptance.exactArtifactZipSha256,"692b220046318e2b139219a8de9b6fe9c9c4af30a8fc2fa52a1da3eade6c0cd6");
  assert.equal(c.finalProductAuthority.preflightPr,1134);
  assert.equal(c.finalProductAuthority.implementationPr,1135);
  assert.equal(c.finalProductAuthority.implementationPrGateRunId,36518499306);
  assert.equal(c.finalProductAuthority.implementationPrGateRunNumber,1045);
  assert.equal(c.finalProductAuthority.implementationPrGateConclusion,"success");
  assert.equal(c.finalProductAuthority.implementationMergeSha,"8438cde4e566c7adb334cc3b73b5b412bf941904");
  assert.equal(c.finalProductAuthority.deployPagesRunId,36518993132);
  assert.equal(c.finalProductAuthority.pagesE2ERunId,36518993069);
  assert.equal(c.finalProductAuthority.pagesE2ERunNumber,1);
  assert.equal(c.finalProductAuthority.pagesE2EConclusion,"success");
  assert.equal(c.finalProductAuthority.exactDeployedHeadSha,"8438cde4e566c7adb334cc3b73b5b412bf941904");
});

test("Q014 final learner-facing map-scale evidence is explicit and print-safe",()=>{
  const e=c.finalLearnerFacingEvidence.mapScaleDistance;
  assert.equal(e.questionCount,16);assert.equal(e.answerCount,16);assert.equal(e.diagramCount,32);
  assert.equal(e.questionPageCount,3);assert.equal(e.answerPageCount,3);assert.equal(e.allPageCount,6);
  assert.equal(e.worksheetColumns,2);assert.equal(e.rowsPerPage,3);assert.deepEqual(e.patternCounts,[4,4,4,4]);
  assert.equal(e.overflowPageCount,0);assert.ok(e.minDiagramWidthPx>=200);assert.ok(e.minDiagramHeightPx>=100);
  assert.equal(e.nonEmptyAnswerCount,16);assert.equal(e.printCount,1);
  for(const key of ["browserConsoleErrorCount","browserPageErrorCount","browserRequestFailureCount","browserAssetHttpFailureCount"])assert.equal(c.finalLearnerFacingEvidence[key],0,key);
});

test("Q014 learner-visual contract stays bounded map-distance to actual-distance only",()=>{
  const v=c.learnerVisualContract;
  assert.equal(v.mapToActualDirectionOnly,true);
  assert.deepEqual(v.boundedUnitNormalizationPairs,["cm_to_m","cm_to_km"]);
  assert.equal(v.unsupportedUnitPairsFailClosed,true);assert.equal(v.sourceBackedScaleBarAllowed,true);
  assert.equal(v.reverseActualToMapAllowed,false);assert.equal(v.scaleFactorLengthTeachingReowned,false);
  assert.equal(v.scaleAreaChangeTeachingReowned,false);assert.equal(v.scaleDrawingConstructionIncluded,false);
  assert.equal(v.similarShapeAngleIncluded,false);assert.equal(v.twoColumnPrintLayout,true);
  assert.equal(v.printSafePagination,true);assert.equal(v.noInternalIds,true);
  assert.equal(v.priorSameSourceOwnersPreserved,true);assert.equal(v.sameUnitMixedModeFailClosed,true);assert.equal(v.crossUnitMixedModeFailClosed,true);
});

test("Q014 D0 closeout is governance-only and preserves Q015 boundary",()=>{
  for(const key of ["productRuntimeChanged","publicBindingChanged","selectorRuntimeChanged","generatorChanged","validatorChanged","rendererChanged","worksheetRuntimeChanged","sourceAuthorityChanged","formalMappingIdentityChanged","patternSpecIdentityChanged","frozenQueueChanged","q015OrLaterProductChanged"])assert.equal(c.scope[key],false,key);
  assert.equal(c.antiScopeCreep.implementQ015,false);
  assert.deepEqual(c.distance.remainingQ014Blockers,[]);
  assert.equal(c.distance.goalDistanceAfter,"D0_Q014_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(c.q015SuccessorReadiness.nextPreflightTaskId,"P08F_W8_Q015_SourceAuthorityPreflight");
  assert.equal(c.q015SuccessorReadiness.nextImplementationTaskId,"P08F_W8DirectProductVerticalSlice015Implementation");
  assert.equal(c.q015SuccessorReadiness.implementationRequiresSeparateOperatorApproval,true);
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
});

test("current-main movement after exact Q014 product head does not mutate Q014 runtime or identity",()=>{
  const m=c.currentMainReadbackAtMaterialization;
  assert.equal(m.exactProductHeadSha,"8438cde4e566c7adb334cc3b73b5b412bf941904");
  assert.equal(m.commitsAfterExactProductHead,10);
  assert.equal(m.q014RuntimeFilesChanged,false);assert.equal(m.q014CurriculumIdentityFilesChanged,false);
  assert.equal(m.interveningUnrelatedCiReadbackOnlyChanges,true);
  assert.ok(m.changedFilesAfterExactProductHead.every(p=>p.startsWith("docs/ci/")));
});

test("Q014 repository-wide failures remain outside D0-required lane and add no named Q014 regression",()=>{
  const r=c.postMergeFullRegressionReadback;
  assert.equal(r.nodeTestRunId,36518993155);assert.equal(r.nodeTestRunNumber,6006);assert.equal(r.nodeTestConclusion,"failure");
  assert.equal(r.ciReadbackRunId,36518993052);assert.equal(r.ciReadbackRunNumber,3748);assert.equal(r.ciReadbackConclusion,"failure");
  assert.equal(r.d0Required,false);assert.equal(r.q014FocusedContractsObservedPassing,true);assert.equal(r.unrelatedRepositoryBaselineFailuresPresent,true);
  assert.equal(r.namedFailureCount,173);assert.equal(r.previousNamedFailureCount,173);assert.equal(r.newNamedFailures,0);assert.equal(r.resolvedNamedFailures,0);
});

test("UNIT_INCREMENTAL_VALIDATION_V1 keeps Q014 final D0 closeout KP-focused",()=>{
  assert.equal(impact.currentScope,"KP_LEAF");assert.equal(impact.currentKnowledgePointId,"kp_g6a_u09_map_scale_distance");
  assert.equal(impact.expectedDerivedGate,"KP_FOCUSED");assert.deepEqual(impact.currentKnowledgePointIds,["kp_g6a_u09_map_scale_distance"]);
  assert.deepEqual(plan.lanes.KP_FOCUSED.map(x=>x.gateId),["FOCUSED_TEST","TARGETED_BROWSER_E2E","DIRECT_DEPENDENCY_CONTRACTS"]);
  assert.deepEqual(plan.forbidden,["FULL_NODE_REGRESSION","GLOBAL_BROWSER_REPLAY"]);
});
