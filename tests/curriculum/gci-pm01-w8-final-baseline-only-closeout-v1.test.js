import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const CONTRACT_PATH="data/curriculum/application/contracts/GCI_PM01_W8_FINAL_BASELINE_ONLY_CLOSEOUT_V1.json";
const IMPACT_PATH="data/project/change-impact/GCI_PM01_W8_FINAL_BASELINE_ONLY_CLOSEOUT_V1.impact.json";
const PLAN_PATH="data/project/validation-plans/GCI_PM01_W8_FINAL_BASELINE_ONLY_CLOSEOUT_V1.validation.json";
const contract=JSON.parse(fs.readFileSync(CONTRACT_PATH,"utf8"));
const impact=JSON.parse(fs.readFileSync(IMPACT_PATH,"utf8"));
const plan=JSON.parse(fs.readFileSync(PLAN_PATH,"utf8"));
const q022Live=JSON.parse(fs.readFileSync("docs/ci/latest-p08f-w8-q022-pages-e2e.json","utf8"));
const q021Live=JSON.parse(fs.readFileSync("docs/ci/latest-p08f-w8-q021-pages-e2e.json","utf8"));

test("W8 final closeout preserves the frozen 22-slice / 24-KP authority and Q022 final owner",()=>{
  assert.equal(contract.taskId,"GCI_PM01_W8_FINAL_BASELINE_ONLY_CLOSEOUT_V1");
  assert.equal(contract.scope.waveId,"W8");
  assert.equal(contract.scope.queueSliceCount,22);
  assert.equal(contract.scope.directW8KnowledgePointCount,24);
  assert.equal(contract.w8FinalAuthority.queueDigest,"597a6fa497c8ac7738247847ef321d0c753e79800f5c38097b7a7a160be2f484");
  assert.equal(contract.w8FinalAuthority.finalSliceId,"p08e_q022_r14_g6a_u08_6a08_profile_speed_rate_c1");
  assert.equal(contract.w8FinalAuthority.finalSourceId,"g6a_u08_6a08");
  assert.equal(contract.w8FinalAuthority.finalKnowledgePointId,"kp_speed_unit_conversion");
  assert.equal(contract.w8FinalAuthority.preflightPr,1162);
  assert.equal(contract.w8FinalAuthority.implementationPr,1163);
  assert.equal(contract.w8FinalAuthority.pagesE2ERunId,36678795853);
  assert.equal(contract.w8FinalAuthority.pagesE2EConclusion,"success");
  assert.equal(contract.w8FinalAuthority.q022D0Status,"PASS_E6_D0_COMPLETE");
});

test("Q022 exact deployed durable E6/D0 evidence remains accepted",()=>{
  assert.equal(q022Live.status,"PASS_E6_D0_COMPLETE");
  assert.equal(q022Live.exactHeadSha,"e0075bedfa6d41046c09166d44c9f9c9a6db0a88");
  assert.equal(q022Live.run.id,"36678795853");
  assert.equal(q022Live.classicUiAcceptance.status,"PASS_P08F_W8_Q022_CLASSIC_UI_ACCEPTANCE");
  assert.equal(q022Live.classicUiAcceptance.target.worksheet.questions,12);
  assert.equal(q022Live.classicUiAcceptance.target.worksheet.answers,12);
  assert.equal(q022Live.classicUiAcceptance.target.worksheet.overflow,0);
  assert.equal(q022Live.semanticInvariants.w8FrozenQueueComplete,true);
  assert.equal(q022Live.semanticInvariants.finalFrozenW8Slice,true);
});

test("historical Q021 accepted D0 evidence is restored and remains authoritative",()=>{
  assert.equal(contract.compatibilityAndEvidenceRepair.historicalQ021DurableRestorationPr,1165);
  assert.equal(contract.compatibilityAndEvidenceRepair.q021HistoricalD0Restored,true);
  assert.equal(q021Live.status,"PASS_E6_D0_COMPLETE");
  assert.equal(q021Live.d0Granted,true);
  assert.equal(q021Live.operatorHumanVisualReview.status,"PASS_OPERATOR_APPROVED");
  assert.equal(q021Live.postMergeFullRegressionParity.status,"PASS_NO_NEW_FAILURES_BASELINE_ONLY");
});

test("Node Test final parity contains zero failures added by Q022",()=>{
  const node=contract.postMergeRegressionAttribution.nodeTest;
  assert.deepEqual({tests:node.baseline.tests,pass:node.baseline.pass,fail:node.baseline.fail},{tests:6608,pass:6441,fail:167});
  assert.deepEqual({tests:node.afterRestoration.tests,pass:node.afterRestoration.pass,fail:node.afterRestoration.fail},{tests:6628,pass:6462,fail:166});
  assert.equal(node.exactSetDelta.overlapFailures,166);
  assert.equal(node.exactSetDelta.removedFailures,1);
  assert.equal(node.exactSetDelta.addedFailures,0);
  assert.deepEqual(node.exactSetDelta.addedFailureTitles,[]);
  assert.deepEqual(node.exactSetDelta.removedFailureTitles,["Q026 historical W7 route remains reachable after the approved W8 current-pointer advance"]);
});

test("Math CI Readback independently proves zero failures added by Q022",()=>{
  const m=contract.postMergeRegressionAttribution.mathCiReadback;
  assert.deepEqual({tests:m.baseline.tests,pass:m.baseline.pass,fail:m.baseline.fail},{tests:6608,pass:6440,fail:168});
  assert.deepEqual({tests:m.afterRestoration.tests,pass:m.afterRestoration.pass,fail:m.afterRestoration.fail},{tests:6628,pass:6461,fail:167});
  assert.equal(m.exactSetDelta.overlapFailures,167);
  assert.equal(m.exactSetDelta.removedFailures,1);
  assert.equal(m.exactSetDelta.addedFailures,0);
  assert.deepEqual(m.exactSetDelta.addedFailureTitles,[]);
  assert.equal(contract.postMergeRegressionAttribution.finalRepairCausalNewFailures,0);
  assert.equal(contract.postMergeRegressionAttribution.disposition,"BASELINE_ONLY_RELATIVE_TO_PRE_Q022_BASELINE");
});

test("current main advanced after the Q021 restoration only through CI evidence files",()=>{
  const r=contract.currentMainReadbackAtMaterialization;
  assert.equal(r.mainSha,"4cf8fcfba93d99e9efc782589a09f63dd17519b1");
  assert.equal(r.q021RestorationMergeSha,"2458eec345e9f7bf40f17c6d036847bd3a82c4b9");
  assert.equal(r.commitsAfterRestoration,5);
  assert.equal(r.siteFilesChangedAfterRestoration,false);
  assert.equal(r.curriculumRuntimeFilesChangedAfterRestoration,false);
  assert.equal(r.onlyCiEvidenceFilesChangedAfterRestoration,true);
  assert.ok(r.changedFilesAfterRestoration.every(path=>path.startsWith("docs/ci/")));
});

test("W8 final closeout does not absorb repository debt or invent a post-W8 wave",()=>{
  for(const value of Object.values(contract.antiScopeCreep))assert.equal(value,false);
  for(const key of ["productRuntimeChanged","publicBindingChanged","selectorRuntimeChanged","generatorChanged","validatorChanged","rendererChanged","worksheetRuntimeChanged","sourceAuthorityChanged","patternSpecsChanged","frozenQueueChanged","postW8ImplementationStarted"])assert.equal(contract.scope[key],false,key);
});

test("W8 final distance closes D1 to D0 and hands off to source-authority gap discovery",()=>{
  assert.equal(contract.distance.goalDistanceBefore,"D1_W8_22_OF_22_PRODUCT_D0_WAITING_FINAL_FAILURE_SET_ATTRIBUTION");
  assert.equal(contract.distance.goalDistanceAfter,"D0_W8_22_OF_22_FINAL_PARITY_BASELINE_ONLY_CLOSED");
  assert.deepEqual(contract.distance.remainingW8Blockers,[]);
  assert.equal(contract.distance.scopeExternalDebt.length,2);
  assert.equal(contract.distance.nextShortestStep,"SOURCE_AUTHORITY_REMAINING_GAP_DISCOVERY");
  assert.equal(contract.distance.nextTaskRequiresSeparateOperatorApproval,false);
});

test("UNIT_INCREMENTAL_VALIDATION_V1 classifies W8 final closeout as KP_FOCUSED without global escalation",()=>{
  assert.equal(impact.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(impact.currentScope,"KP_LEAF");
  assert.equal(impact.currentKnowledgePointId,"kp_speed_unit_conversion");
  assert.equal(impact.expectedDerivedGate,"KP_FOCUSED");
  assert.deepEqual(Object.values(impact.unitKnowledgePointGateStatus),["FOCUSED_PASS"]);
  assert.deepEqual(impact.changeImpact,{sharedExecutableChange:false,publicAuthorityCutover:false,legalRouteSemanticsChanged:false,affectedRoutes:"BOUNDED",globalReleaseCheckpoint:false,currentAuthorityChanged:false});
  assert.deepEqual(plan.lanes.KP_FOCUSED.map(entry=>entry.gateId),["FOCUSED_TEST","TARGETED_BROWSER_E2E","DIRECT_DEPENDENCY_CONTRACTS"]);
  assert.deepEqual(plan.forbidden,["FULL_NODE_REGRESSION","GLOBAL_BROWSER_REPLAY"]);
});
