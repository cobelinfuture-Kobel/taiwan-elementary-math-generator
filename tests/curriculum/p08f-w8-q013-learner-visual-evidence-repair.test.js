import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
const IMPLEMENTATION="data/curriculum/full-product/p08f/q013-g5a-u05-polygon-angle-sum-reasoning-implementation.json";
const EVIDENCE="data/curriculum/full-product/p08f/q013-technical-e6-learner-visual-review-pending.json";
const IMPACT="data/project/change-impact/P08F_W8_Q013_LEARNER_VISUAL_EVIDENCE_REPAIR.impact.json";
const PLAN="data/project/validation-plans/P08F_W8_Q013_LEARNER_VISUAL_EVIDENCE_REPAIR.validation.json";
const CLASSIC="tools/curriculum/run-p08f-w8-slice013-classic-ui-acceptance.mjs";
const LIVE="tools/curriculum/run-p08f-w8-q013-live-pages-e2e.mjs";
const WORKFLOW=".github/workflows/p08f-w8-q013-live-pages-e2e.yml";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const implementation=read(IMPLEMENTATION),evidence=read(EVIDENCE),impact=read(IMPACT),plan=read(PLAN),classic=fs.readFileSync(CLASSIC,"utf8"),live=fs.readFileSync(LIVE,"utf8"),workflow=fs.readFileSync(WORKFLOW,"utf8");

test("Q013 implementation artifact stays immutable while separate evidence records the W8 visual gate",()=>{
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
  assert.equal(evidence.status,"Q013_TECHNICAL_E6_CONFIRMED_VISUAL_ARTIFACT_PACKAGING_REPAIR_IN_PROGRESS");
  assert.equal(evidence.scope.mutationClass,"EVIDENCE_PATH_ONLY");
  for(const key of ["productRuntimeChanged","sourceAuthorityChanged","formalMappingIdentityChanged","patternSpecIdentityChanged","selectorSemanticsChanged","q014OrLaterProductChanged"])assert.equal(evidence.scope[key],false,key);
  assert.equal(evidence.technicalE6Authority.implementationPr,1131);
  assert.equal(evidence.technicalE6Authority.implementationPrGateConclusion,"success");
  assert.equal(evidence.technicalE6Authority.implementationMergeSha,"576ac17ee6ba5a0096783f2fd5054e51de5f4a9a");
  assert.equal(evidence.technicalE6Authority.pagesE2EConclusion,"success");
  assert.equal(evidence.correction.correctW8Status,"PASS_E6_TECHNICAL_AWAITING_HUMAN_VISUAL_REVIEW");
  assert.equal(evidence.correction.d0Granted,false);
  assert.equal(evidence.learnerVisualReviewGate.required,true);
  assert.equal(evidence.learnerVisualReviewGate.status,"PENDING_OPERATOR");
  assert.equal(evidence.learnerVisualReviewGate.finalD0RequiresExplicitOperatorAcceptance,true);
});

test("Q013 classic runner materializes exact human-review PDF PNG worksheet and UI artifacts",()=>{
  for(const name of evidence.learnerVisualReviewGate.requiredArtifacts)assert.equal(classic.includes(name),true,name);
  assert.equal(classic.includes("PASS_P08F_W8_Q013_TECHNICAL_VISUAL_PRECHECK"),true);
  assert.equal(classic.includes("PENDING_OPERATOR_ACTUAL_PRINT_HUMAN_REVIEW"),true);
  assert.equal(classic.includes("d0Granted:false"),true);
  assert.equal(classic.includes('reviewPage.pdf({path:path.join(OUT,"q013-polygon-angle-sum-human-review.pdf")'),true);
});

test("Q013 live Pages runner packages review artifacts and fails closed before D0",()=>{
  for(const name of evidence.learnerVisualReviewGate.requiredArtifacts)assert.equal(live.includes(name),true,name);
  assert.equal(live.includes("PASS_E6_TECHNICAL_AWAITING_HUMAN_VISUAL_REVIEW"),true);
  assert.equal(live.includes("d0Granted:false"),true);
  assert.equal(live.includes("P08F13_HUMAN_REVIEW_ARTIFACT_MISSING"),true);
  assert.equal(live.includes('acceptance.report.status!=="PASS_P08F_W8_Q013_TECHNICAL_VISUAL_PRECHECK"'),true);
});

test("Q013 workflow uploads exact Pages review evidence and retriggers on evidence-path repairs",()=>{
  assert.equal(workflow.includes("p08f-w8-q013-pages-e2e"),true);
  assert.equal(workflow.includes("tmp/p08f-w8-q013-live-pages-e2e"),true);
  assert.equal(workflow.includes("q013-technical-e6-learner-visual-review-pending.json"),true);
  assert.equal(workflow.includes("run-p08f-w8-slice013-classic-ui-acceptance.mjs"),true);
  assert.equal(workflow.includes("run-p08f-w8-q013-live-pages-e2e.mjs"),true);
});

test("Q013 evidence-path repair remains KP-focused and forbids full/global gates",()=>{
  assert.equal(impact.currentScope,"KP_LEAF");
  assert.equal(impact.expectedDerivedGate,"KP_FOCUSED");
  assert.equal(impact.unitKnowledgePointGateStatus["kp_g5a_u05a_polygon_angle_sum_reasoning"],"FOCUSED_PASS");
  assert.deepEqual(plan.forbidden,["FULL_NODE_REGRESSION","GLOBAL_BROWSER_REPLAY"]);
  assert.deepEqual(plan.lanes.KP_FOCUSED.map(x=>x.gateId),["FOCUSED_TEST","TARGETED_BROWSER_E2E","DIRECT_DEPENDENCY_CONTRACTS"]);
});
