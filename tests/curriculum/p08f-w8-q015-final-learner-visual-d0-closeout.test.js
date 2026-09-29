import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const C="data/curriculum/full-product/p08f/q015-final-learner-visual-d0-closeout.json";
const I="data/project/change-impact/P08F_W8_Q015_FINAL_LEARNER_VISUAL_D0_CLOSEOUT.impact.json";
const V="data/project/validation-plans/P08F_W8_Q015_FINAL_LEARNER_VISUAL_D0_CLOSEOUT.validation.json";
const Q15I="data/curriculum/full-product/p08f/q015-g6a-u06-sector-arc-length-implementation.json";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const c=read(C),impact=read(I),plan=read(V),implementation=read(Q15I);

test("Q015 final learner-visual D0 is granted after exact operator visual acceptance",()=>{
  assert.equal(c.status,"Q015_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(c.operatorAcceptance.required,true);
  assert.equal(c.operatorAcceptance.actualPrintLayoutAccepted,true);
  assert.equal(c.operatorAcceptance.learnerFacingAccepted,true);
  assert.equal(c.operatorAcceptance.finalCloseoutResumeAuthorized,true);
  assert.equal(c.operatorAcceptance.d0Granted,true);
  assert.equal(c.operatorAcceptance.decisionTextZh,"圖形 OK");
  assert.equal(c.operatorAcceptance.finalCloseoutResumeTask,"P08F_W8_Q015_FinalLearnerVisualD0Closeout_Then_Q016_SourceAuthorityPreflight");
  assert.equal(c.operatorAcceptance.exactArtifactId,11016860080);
  assert.equal(c.operatorAcceptance.exactArtifactZipSha256,"0e071422a85f04745d60716cea9cc410880b788ae7afb6c0feec75d52100132a");
  assert.equal(c.finalProductAuthority.preflightPr,1137);
  assert.equal(c.finalProductAuthority.implementationPr,1138);
  assert.equal(c.finalProductAuthority.implementationPrGateRunId,36531230873);
  assert.equal(c.finalProductAuthority.implementationPrGateRunNumber,1052);
  assert.equal(c.finalProductAuthority.implementationPrGateConclusion,"success");
  assert.equal(c.finalProductAuthority.implementationMergeSha,"06db424874d0e058ef3c5809c658137a3d582d79");
  assert.equal(c.finalProductAuthority.deployPagesRunId,36531368144);
  assert.equal(c.finalProductAuthority.deployPagesRunNumber,2420);
  assert.equal(c.finalProductAuthority.pagesE2ERunId,36531368123);
  assert.equal(c.finalProductAuthority.pagesE2ERunNumber,1);
  assert.equal(c.finalProductAuthority.pagesE2EConclusion,"success");
  assert.equal(c.finalProductAuthority.exactDeployedHeadSha,"06db424874d0e058ef3c5809c658137a3d582d79");
});

test("Q015 learner-facing sector-arc evidence is explicit and print-safe",()=>{
  const e=c.finalLearnerFacingEvidence.sectorArcLength;
  assert.equal(e.questionCount,16);
  assert.equal(e.answerCount,16);
  assert.equal(e.diagramCount,32);
  assert.equal(e.questionPageCount,3);
  assert.equal(e.answerPageCount,3);
  assert.equal(e.allPageCount,6);
  assert.equal(e.worksheetColumns,2);
  assert.equal(e.rowsPerPage,3);
  assert.deepEqual(e.patternCounts,[4,4,4,4]);
  assert.equal(e.overflowPageCount,0);
  assert.equal(e.minimumDiagramWidthContractPx,200);
  assert.equal(e.minimumDiagramHeightContractPx,100);
  assert.equal(e.nonEmptyAnswerCount,16);
  assert.equal(e.printCount,1);
  for(const key of ["browserConsoleErrorCount","browserPageErrorCount","browserRequestFailureCount","browserAssetHttpFailureCount"])assert.equal(c.finalLearnerFacingEvidence[key],0,key);
});

test("Q015 learner-visual semantic ownership stays bounded",()=>{
  const v=c.learnerVisualContract;
  assert.equal(v.arcLengthFormula,"ARC_LENGTH = CIRCUMFERENCE * CENTRAL_ANGLE / 360");
  assert.equal(v.fullCircleDegrees,360);
  assert.equal(v.priorCircumferenceOwnersPreserved,true);
  assert.equal(v.priorSectorFractionOwnerPreserved,true);
  assert.equal(v.futureCompositeArcPerimeterPreserved,true);
  assert.equal(v.sectorPerimeterIncluded,false);
  assert.equal(v.sectorAreaIncluded,false);
  assert.equal(v.applicationContextIncluded,false);
  assert.equal(v.twoColumnPrintLayout,true);
  assert.equal(v.printSafePagination,true);
  assert.equal(v.noInternalIds,true);
  assert.equal(v.sameUnitMixedModeFailClosed,true);
  assert.equal(v.crossUnitMixedModeFailClosed,true);
});

test("Q015 D0 closeout is governance-only and preserves Q016 boundary",()=>{
  for(const key of ["productRuntimeChanged","publicBindingChanged","selectorRuntimeChanged","generatorChanged","validatorChanged","rendererChanged","worksheetRuntimeChanged","sourceAuthorityChanged","formalMappingIdentityChanged","patternSpecIdentityChanged","frozenQueueChanged","q016OrLaterProductChanged"])assert.equal(c.scope[key],false,key);
  assert.equal(c.antiScopeCreep.implementQ016,false);
  assert.deepEqual(c.distance.remainingQ015Blockers,[]);
  assert.equal(c.distance.goalDistanceAfter,"D0_Q015_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(c.q016SuccessorReadiness.nextPreflightTaskId,"P08F_W8_Q016_SourceAuthorityPreflight");
  assert.equal(c.q016SuccessorReadiness.nextImplementationTaskId,"P08F_W8DirectProductVerticalSlice016Implementation");
  assert.equal(c.q016SuccessorReadiness.implementationRequiresSeparateOperatorApproval,true);
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
});

test("current-main movement after exact Q015 product head does not mutate Q015 runtime or identity",()=>{
  const m=c.currentMainReadbackAtMaterialization;
  assert.equal(m.exactProductHeadSha,"06db424874d0e058ef3c5809c658137a3d582d79");
  assert.equal(m.commitsAfterExactProductHead,6);
  assert.equal(m.q015RuntimeFilesChanged,false);
  assert.equal(m.q015CurriculumIdentityFilesChanged,false);
  assert.equal(m.interveningUnrelatedCiReadbackOnlyChanges,true);
  assert.ok(m.changedFilesAfterExactProductHead.every(p=>p.startsWith("docs/ci/")));
});

test("UNIT_INCREMENTAL_VALIDATION_V1 keeps Q015 final D0 closeout KP-focused",()=>{
  assert.equal(impact.currentScope,"KP_LEAF");
  assert.equal(impact.currentKnowledgePointId,"kp_g6a_u06_sector_arc_length");
  assert.equal(impact.expectedDerivedGate,"KP_FOCUSED");
  assert.deepEqual(impact.currentKnowledgePointIds,["kp_g6a_u06_sector_arc_length"]);
  assert.deepEqual(plan.lanes.KP_FOCUSED.map(x=>x.gateId),["FOCUSED_TEST","TARGETED_BROWSER_E2E","DIRECT_DEPENDENCY_CONTRACTS"]);
  assert.deepEqual(plan.forbidden,["FULL_NODE_REGRESSION","GLOBAL_BROWSER_REPLAY"]);
});
