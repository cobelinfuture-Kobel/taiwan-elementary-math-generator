import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as selector from "../../site/modules/curriculum/registry/batch-a-selector-p07f24-extension.js";
import {
  auditG6BU04P07F24Projection,
  G6B_U04_P07F24_APPLIED_MODIFIER_IDS as MODIFIERS,
  G6B_U04_P07F24_KP_ID as KP,
  G6B_U04_P07F24_OPTIONAL_CAPABILITY_IDS as OPTIONAL,
  G6B_U04_P07F24_REQUIRED_CAPABILITY_IDS as REQUIRED,
  G6B_U04_P07F24_REQUIRED_PREREQUISITE_KP_IDS as PREREQS,
  G6B_U04_P07F24_SOURCE_ID as SRC,
  G6B_U04_P07F24_SPEC_IDS as SPEC_IDS
} from "../../site/modules/curriculum/registry/g6b-u04-successive-rate-change-selector-projection-p07f24.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p07f24.js";
import {buildG6BU04P07F24Question,generateG6BU04P07F24Questions,validateG6BU04P07F24Answer,validateG6BU04P07F24Question} from "../../site/modules/curriculum/batch-a/g6b-u04-successive-rate-change-runtime-p07f24.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p07f/q024-g6b-u04-successive-rate-change-implementation.json");
const pre=read("data/curriculum/full-product/p07f/q024-g6b-u04-successive-rate-change-source-authority-preflight.json");
const q023=read("docs/ci/latest-p07f-w7-q023-pages-e2e.json");
const impact=read("data/project/change-impact/P07F_W7_Q024.impact.json");
const plan=read("data/project/validation-plans/P07F_W7_Q024.validation.json");
const req=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"numeric",questionCount:20,generationSeed:"p07f24",...extra});

test("Q024 exact identity consumes merged preflight and Q023 D0",()=>{
  assert.equal(impl.preflight.prNumber,1070);assert.equal(impl.preflight.mergeSha,"1af8c60f0334ac6f3f60cb3165dfc8fb4e877422");
  assert.equal(pre.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");assert.equal(pre.preflightDecision.exactRuntimeMappingBound,true);
  assert.equal(q023.status,"PASS_E6_D0_COMPLETE");assert.equal(q023.exactHeadSha,"65fbe2def3f6705752f8f8cf20738faaf358849f");
  assert.equal(impl.queueAuthority.queuePosition,24);assert.equal(impl.queueAuthority.sliceId,"p07e_q024_r13_g6b_u04_6b04_profile_ratio_percent_c1");
  assert.deepEqual(impl.queueAuthority.targetKnowledgePointIds,[KP]);
  assert.deepEqual(PREREQS,["kp_g5b_u08_percent_discount_increase_application","kp_g6b_u04_find_base_quantity","kp_g6b_u04_find_comparison_quantity"]);
});

test("Q024 projection and public binding preserve the exact R04 application contract",()=>{
  const a=auditG6BU04P07F24Projection();assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:4,formalMappings:1});
  const b=auditPublicUiCapabilityBinding();assert.equal(b.ok,true,b.errors.join(","));
  const bind=resolvePublicUiCapabilityBinding(req());assert.equal(bind.blocked,false);assert.equal(bind.questionType,"numeric");assert.equal(bind.questionCount.max,240);
  assert.deepEqual(bind.requiredCapabilityIds,REQUIRED);assert.deepEqual(bind.optionalCapabilityIds,OPTIONAL);assert.deepEqual(bind.appliedRuntimeModifierIds,MODIFIERS);
  assert.equal(bind.frozenRuntimeProfile,"profile_ratio_percent");assert.equal(bind.successiveRateChangeOwned,true);
  assert.equal(bind.stageFactorMultiplicationRequired,true);assert.equal(bind.stage1OutputBecomesStage2BaseRequired,true);assert.equal(bind.directPercentageAdditionAllowed,false);
});

test("Q024 completes G6B-U04 candidate visibility without admitting same-unit mixed mode",()=>{
  const ids=selector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  const av=selector.listBatchAKnowledgePointAvailabilityBySource(SRC),a=selector.auditP07F24PublicSelectorComposition();
  assert.equal(a.ok,true,a.errors.join(","));assert.equal(ids.length,5);assert.ok(ids.includes(KP));
  assert.equal(av.visibleCount,5);assert.equal(av.hiddenPendingCount,0);assert.equal(av.notSelectableCount,0);
  assert.equal(av.sameSourceCandidateSetComplete,true);assert.equal(av.sameUnitMixedAllowed,false);assert.deepEqual([...av.remainingProtectedKnowledgePointIds],[]);
});

for(const id of SPEC_IDS)test(id+" has 240 deterministic unique valid successive-rate variants",()=>{
  const a=generateG6BU04P07F24Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[id],generationSeed:"stable"});
  const b=generateG6BU04P07F24Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[id],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){
    const v=validateG6BU04P07F24Question(q);assert.equal(v.ok,true,JSON.stringify(v.errors));
    const p=q.patternRepresentation;
    assert.equal(p.stage1Quantity,p.originalQuantity*p.stage1FactorPercent/100);
    assert.equal(p.finalQuantity,p.stage1Quantity*p.stage2FactorPercent/100);
    assert.equal(p.finalQuantity*10000,p.originalQuantity*p.stage1FactorPercent*p.stage2FactorPercent);
    assert.equal(p.directPercentageAdditionRejected,true);
    assert.equal(validateG6BU04P07F24Answer(q,q.answerText).ok,true);
  }
});

test("Q024 semantic validator rejects direct-addition shortcuts and ownership damage",()=>{
  const q=buildG6BU04P07F24Question({patternSpecId:"ps_g6b_u04_successive_two_decreases",variant:0});
  const p=q.patternRepresentation;
  assert.equal(p.originalQuantity,10000);assert.equal(p.stage1RatePercent,5);assert.equal(p.stage2RatePercent,20);
  assert.equal(p.stage1Quantity,9500);assert.equal(p.finalQuantity,7600);assert.equal(p.directPercentageAdditionQuantity,7500);
  assert.notEqual(p.finalQuantity,p.directPercentageAdditionQuantity);
  assert.equal(validateG6BU04P07F24Answer(q,String(p.directPercentageAdditionQuantity)).ok,false);
  assert.equal(validateG6BU04P07F24Question({...q,metadata:{...q.metadata,directPercentageAdditionAllowed:true}}).ok,false);
  assert.equal(validateG6BU04P07F24Question({...q,metadata:{...q.metadata,predecessorKnowledgePointReowned:true}}).ok,false);
  assert.equal(validateG6BU04P07F24Question({...q,metadata:{...q.metadata,simpleSingleStageDiscountIncreaseReowned:true}}).ok,false);
});

test("Q024 all four relation directions materialize distinctly",()=>{
  const rows=[
    ["ps_g6b_u04_successive_two_decreases","DECREASE","DECREASE"],
    ["ps_g6b_u04_successive_two_increases","INCREASE","INCREASE"],
    ["ps_g6b_u04_increase_then_decrease","INCREASE","DECREASE"],
    ["ps_g6b_u04_decrease_then_increase","DECREASE","INCREASE"]
  ];
  for(const [id,a,b] of rows){
    const q=buildG6BU04P07F24Question({patternSpecId:id,variant:17});
    assert.equal(q.patternRepresentation.stage1ChangeType,a);assert.equal(q.patternRepresentation.stage2ChangeType,b);
    assert.match(q.promptText,/第一階段/);assert.match(q.promptText,/第二階段/);assert.match(q.promptText,/變化後的數量為基準/);
  }
});

test("Q024 aggregate worksheet is answer-key and print ready without authority leakage",()=>{
  const p=buildBatchABrowserPlan(req({questionCount:20}));assert.deepEqual(p.selectedKnowledgePointIds,[KP]);assert.equal(p.questionCountMax,240);
  const g=generateBatchABrowserQuestions(req({questionCount:20}));assert.equal(g.ok,true,g.errors.join(","));assert.equal(g.questions.length,20);
  const w=buildBatchABrowserWorksheetDocument(req({questionCount:12,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:4}}));
  assert.equal(w.ok,true,w.errors.join(","));assert.equal(w.worksheetDocument.questionCount,12);assert.equal(w.worksheetDocument.answerKeyItems.length,12);
  assert.equal(w.worksheetDocument.title,"基準量與比較量｜連續增減率");
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""}),visible=html.replace(/<[^>]*>/g," ");
  assert.match(visible,/第一階段/);assert.match(visible,/第二階段/);assert.match(visible,/為基準/);
  for(const x of ["P07F24","kp_g6b_u04_","ps_g6b_u04_","百分率直接相加"])assert.equal(visible.includes(x),false,x);
});

test("Q024 mixed modes remain fail-closed and Q016 single-stage application route remains reachable",()=>{
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[KP,"kp_g6b_u04_find_base_quantity"],questionMode:"numeric",questionCount:8});
  assert.equal(mixed.ok,false);
  const old=generateBatchABrowserQuestions({sourceId:"g5b_u08_5b08",selectionMode:"singleKnowledgePoint",
    selectedKnowledgePointIds:["kp_g5b_u08_percent_discount_increase_application"],questionMode:"numeric",questionCount:6,generationSeed:"q016-history"});
  assert.equal(old.ok,true,old.errors.join(","));assert.equal(old.questions.length,6);
});

test("Q024 current pointers and bounded validation are successor-safe",()=>{
  const s=readFileSync(new URL("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",import.meta.url),"utf8");
  const b=readFileSync(new URL("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",import.meta.url),"utf8");
  const g=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",import.meta.url),"utf8");
  const w=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",import.meta.url),"utf8");
  assert.match(s,/batch-a-selector-p07f24-extension/);assert.match(b,/public-ui-capability-binding-p07f24/);
  for(const id of ["24","23","22","21","20","19","18","17","16","15","14","13","12","11","10","09","08","07","06","05","04","03","02","01"])assert.match(g,new RegExp("requestsP07F"+id));
  for(const id of ["24","23","22","21","20","19","18","17","16","15","14","13","12","11","10","09","08","07","06","05","04","03","02","01"])assert.match(w,new RegExp("buildP07F"+id+"Worksheet"));
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.deepEqual(plan.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(plan).includes("FULL_REPOSITORY"),false);
});
