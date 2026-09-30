import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const c=read("data/curriculum/full-product/p08f/q021-final-learner-visual-d0-closeout.json");
const live=read("docs/ci/latest-p08f-w8-q021-pages-e2e.json");

test("W8 Q021 final D0 closeout binds exact E6, operator acceptance, and zero-new-failure regression parity",()=>{
  assert.equal(c.status,"Q021_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(c.finalProductAuthority.implementationPr,1159);
  assert.equal(c.finalProductAuthority.compatibilityRepairPr,1160);
  assert.equal(c.finalProductAuthority.pagesE2ERunId,36667807557);
  assert.equal(c.finalProductAuthority.exactDeployedHeadSha,"0ef5d3c3e082db2cb1d950f5e271b749a2c62ee7");
  assert.equal(c.operatorAcceptance.decisionTextZh,"圖形OK");
  assert.equal(c.operatorAcceptance.d0Granted,true);
  assert.equal(c.finalLearnerFacingEvidence.visualContractViolations,0);
  assert.equal(c.finalLearnerFacingEvidence.overflowPageCount,0);
  assert.equal(c.postMergeFullRegressionParity.parityRerunId,36669444562);
  assert.deepEqual(c.postMergeFullRegressionParity.newFailuresVsBaseline,[]);
  assert.equal(c.postMergeFullRegressionParity.status,"PASS_NO_NEW_FAILURES_BASELINE_ONLY");
  assert.equal(c.scope.productRuntimeChanged,false);
  assert.equal(c.scope.q022OrLaterProductChanged,false);
  assert.equal(c.distance.goalDistanceAfter,"D0_Q021_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.deepEqual(c.distance.remainingQ021Blockers,[]);
  assert.equal(c.distance.nextShortestStep,"P08F_W8_Q022_SourceAuthorityPreflight");
  assert.equal(live.status,"PASS_E6_D0_COMPLETE");
  assert.equal(live.d0Granted,true);
  assert.equal(live.operatorHumanVisualReview.status,"PASS_OPERATOR_APPROVED");
  assert.equal(live.postMergeFullRegressionParity.status,"PASS_NO_NEW_FAILURES_BASELINE_ONLY");
});
