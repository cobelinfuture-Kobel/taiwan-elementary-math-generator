import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const C="data/curriculum/full-product/p08f/q016-final-learner-visual-d0-closeout.json";
const I="data/project/change-impact/P08F_W8_Q016_FINAL_LEARNER_VISUAL_D0_CLOSEOUT.impact.json";
const V="data/project/validation-plans/P08F_W8_Q016_FINAL_LEARNER_VISUAL_D0_CLOSEOUT.validation.json";
const Q16I="data/curriculum/full-product/p08f/q016-g6a-u09-scale-drawing-similarity-implementation.json";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const c=read(C),impact=read(I),plan=read(V),implementation=read(Q16I);

test("Q016 final learner-visual D0 is granted after exact operator visual acceptance",()=>{
  assert.equal(c.status,"Q016_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(c.operatorAcceptance.required,true);
  assert.equal(c.operatorAcceptance.actualPrintLayoutAccepted,true);
  assert.equal(c.operatorAcceptance.learnerFacingAccepted,true);
  assert.equal(c.operatorAcceptance.scaleDrawingAccepted,true);
  assert.equal(c.operatorAcceptance.similarAngleAccepted,true);
  assert.equal(c.operatorAcceptance.finalCloseoutResumeAuthorized,true);
  assert.equal(c.operatorAcceptance.d0Granted,true);
  assert.equal(c.operatorAcceptance.decisionTextZh,"圖形ok");
  assert.equal(c.operatorAcceptance.exactArtifactId,11019349672);
  assert.equal(c.operatorAcceptance.exactArtifactZipSha256,"dbd4c3043df1ae8de71510142f80a1bc1eb0eb12ee1b886b2510571c3b22bbf9");
  assert.equal(c.finalProductAuthority.preflightPr,1140);
  assert.equal(c.finalProductAuthority.implementationPr,1141);
  assert.equal(c.finalProductAuthority.implementationPrGateRunId,36538328926);
  assert.equal(c.finalProductAuthority.implementationPrGateRunNumber,1059);
  assert.equal(c.finalProductAuthority.implementationPrGateConclusion,"success");
  assert.equal(c.finalProductAuthority.implementationMergeSha,"4b5c3bd3e20f21b4d33fd8431c1c6c5263821d18");
  assert.equal(c.finalProductAuthority.deployPagesRunId,36538513204);
  assert.equal(c.finalProductAuthority.deployPagesRunNumber,2423);
  assert.equal(c.finalProductAuthority.pagesE2ERunId,36538512750);
  assert.equal(c.finalProductAuthority.pagesE2ERunNumber,1);
  assert.equal(c.finalProductAuthority.pagesE2EConclusion,"success");
  assert.equal(c.finalProductAuthority.exactDeployedHeadSha,"4b5c3bd3e20f21b4d33fd8431c1c6c5263821d18");
});

test("Q016 both learner-facing routes are explicit and print-safe",()=>{
  for(const key of ["scaleDrawing","similarAngle"]){
    const e=c.finalLearnerFacingEvidence[key];
    assert.equal(e.questionCount,8);
    assert.equal(e.answerCount,8);
    assert.equal(e.diagramCount,16);
    assert.equal(e.questionPageCount,2);
    assert.equal(e.answerPageCount,2);
    assert.equal(e.allPageCount,4);
    assert.equal(e.worksheetColumns,2);
    assert.equal(e.rowsPerPage,3);
    assert.deepEqual(e.patternCounts,[2,2,2,2]);
    assert.equal(e.overflowPageCount,0);
    assert.ok(e.minimumDiagramWidthObservedPx>=200);
    assert.ok(e.minimumDiagramHeightObservedPx>=100);
    assert.equal(e.nonEmptyAnswerCount,8);
    assert.equal(e.printCount,1);
  }
  for(const key of ["browserConsoleErrorCount","browserPageErrorCount","browserRequestFailureCount","browserAssetHttpFailureCount"])assert.equal(c.finalLearnerFacingEvidence[key],0,key);
});

test("Q016 learner-visual semantic ownership stays bounded",()=>{
  const v=c.learnerVisualContract;
  assert.equal(v.oneCommonPositiveScaleFactor,true);
  assert.equal(v.boundedGridConstruction,true);
  assert.equal(v.answerKeyCompletedDrawing,true);
  assert.equal(v.correspondingAnglesPreserved,true);
  assert.equal(v.parallelRelationsPreserved,true);
  assert.equal(v.shapePreservationRequired,true);
  assert.equal(v.q007ScaleFactorLengthOwnerPreserved,true);
  assert.equal(v.q012ScaleAreaChangeOwnerPreserved,true);
  assert.equal(v.q014MapScaleDistanceOwnerPreserved,true);
  assert.equal(v.genericCoordinateGeometryReowned,false);
  assert.equal(v.genericAngleMeasurementReowned,false);
  assert.equal(v.applicationContextIncluded,false);
  assert.equal(v.sameUnitMixedModeFailClosed,true);
  assert.equal(v.crossUnitMixedModeFailClosed,true);
  assert.equal(v.twoColumnPrintLayout,true);
  assert.equal(v.printSafePagination,true);
  assert.equal(v.noInternalIds,true);
});

test("Q016 D0 closeout is governance-only and preserves Q017 boundary",()=>{
  for(const key of ["productRuntimeChanged","publicBindingChanged","selectorRuntimeChanged","generatorChanged","validatorChanged","rendererChanged","worksheetRuntimeChanged","sourceAuthorityChanged","formalMappingIdentityChanged","patternSpecIdentityChanged","frozenQueueChanged","q017OrLaterProductChanged"])assert.equal(c.scope[key],false,key);
  assert.equal(c.antiScopeCreep.implementQ017,false);
  assert.deepEqual(c.distance.remainingQ016Blockers,[]);
  assert.equal(c.distance.goalDistanceAfter,"D0_Q016_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(c.q017SuccessorReadiness.nextPreflightTaskId,"P08F_W8_Q017_SourceAuthorityPreflight");
  assert.equal(c.q017SuccessorReadiness.nextImplementationTaskId,"P08F_W8DirectProductVerticalSlice017Implementation");
  assert.equal(c.q017SuccessorReadiness.implementationRequiresSeparateOperatorApproval,true);
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
});

test("current-main movement after exact Q016 product head does not mutate Q016 runtime or identity",()=>{
  const m=c.currentMainReadbackAtMaterialization;
  assert.equal(m.exactProductHeadSha,"4b5c3bd3e20f21b4d33fd8431c1c6c5263821d18");
  assert.equal(m.commitsAfterExactProductHead,10);
  assert.equal(m.q016RuntimeFilesChanged,false);
  assert.equal(m.q016CurriculumIdentityFilesChanged,false);
  assert.equal(m.interveningUnrelatedCiReadbackOnlyChanges,true);
  assert.ok(m.changedFilesAfterExactProductHead.every(p=>p.startsWith("docs/ci/")));
});

test("UNIT_INCREMENTAL_VALIDATION_V1 keeps Q016 final D0 closeout focused",()=>{
  assert.equal(impact.currentScope,"KP_LEAF");
  assert.equal(impact.currentKnowledgePointId,"kp_g6a_u09_scale_drawing_construction");
  assert.equal(impact.expectedDerivedGate,"KP_FOCUSED");
  assert.deepEqual(impact.currentKnowledgePointIds,["kp_g6a_u09_scale_drawing_construction","kp_g6a_u09_similar_shape_angle"]);
  assert.deepEqual(plan.lanes.KP_FOCUSED.map(x=>x.gateId),["FOCUSED_TEST","TARGETED_BROWSER_E2E","DIRECT_DEPENDENCY_CONTRACTS"]);
  assert.deepEqual(plan.forbidden,["FULL_NODE_REGRESSION","GLOBAL_BROWSER_REPLAY"]);
});
