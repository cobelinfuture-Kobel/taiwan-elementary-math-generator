import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as selector from "../../site/modules/curriculum/registry/batch-a-selector-p07f21-extension.js";
import {
  auditG6BU06P07F21Projection,
  G6B_U06_P07F21_KP_ID as KP,
  G6B_U06_P07F21_PREDECESSOR_VISIBLE_KP_IDS as PREDECESSORS,
  G6B_U06_P07F21_PROTECTED_FUTURE_KP_IDS as PROTECTED,
  G6B_U06_P07F21_REQUIRED_CAPABILITY_IDS as REQUIRED,
  G6B_U06_P07F21_QUEUE_REQUIRED_CAPABILITY_IDS as QUEUE_REQUIRED,
  G6B_U06_P07F21_SOURCE_ID as SRC,
  G6B_U06_P07F21_SPEC_IDS as SPEC_IDS
} from "../../site/modules/curriculum/registry/g6b-u06-pie-chart-quantity-from-rate-selector-projection-p07f21.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p07f21.js";
import {buildG6BU06P07F21Question,generateG6BU06P07F21Questions,validateG6BU06P07F21Answer,validateG6BU06P07F21Question} from "../../site/modules/curriculum/batch-a/g6b-u06-pie-chart-quantity-from-rate-runtime-p07f21.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p07f/q021-g6b-u06-pie-chart-quantity-from-rate-implementation.json");
const pre=read("data/curriculum/full-product/p07f/q021-g6b-u06-pie-chart-quantity-from-rate-source-authority-preflight.json");
const q020=read("docs/ci/latest-p07f-w7-q020-pages-e2e.json");
const impact=read("data/project/change-impact/P07F_W7_Q021.impact.json");
const plan=read("data/project/validation-plans/P07F_W7_Q021.validation.json");
const req=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"numeric",questionCount:20,generationSeed:"p07f21",...extra});

test("Q021 exact identity consumes merged preflight and Q020 D0",()=>{
  assert.equal(impl.preflight.prNumber,1064);assert.equal(impl.preflight.mergeSha,"1d4423eb953fcb846746eb699f5cae6585717d53");
  assert.equal(pre.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");assert.equal(pre.preflightDecision.exactRuntimeMappingBound,true);
  assert.equal(q020.status,"PASS_E6_D0_COMPLETE");assert.equal(q020.exactHeadSha,"ace3ae699a96d24be43bdfeeb15cb57be6e279ad");
  assert.equal(impl.queueAuthority.queuePosition,21);assert.equal(impl.queueAuthority.sliceId,"p07e_q021_r11_g6b_u06_6b06_profile_ratio_percent_c1");
  assert.deepEqual(impl.queueAuthority.targetKnowledgePointIds,[KP]);assert.deepEqual(impl.queueAuthority.requiredW7CapabilityIds,QUEUE_REQUIRED);
});

test("Q021 projection, public binding and exact runtime contract are public-ready",()=>{
  const a=auditG6BU06P07F21Projection();assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1});
  const b=auditPublicUiCapabilityBinding();assert.equal(b.ok,true,b.errors.join(","));
  const bind=resolvePublicUiCapabilityBinding(req());assert.equal(bind.blocked,false);assert.equal(bind.questionType,"numeric");assert.equal(bind.questionCount.max,240);
  assert.deepEqual(bind.requiredCapabilityIds,REQUIRED);assert.equal(bind.frozenRuntimeProfile,"profile_ratio_percent");
  assert.equal(bind.pieChartQuantityFromRateOwned,true);assert.equal(bind.answerMustEqualTotalTimesRate,true);assert.equal(bind.backSubstitutionRequired,true);
});

test("Q021 promotes third G6B-U06 KP and protects two remaining candidates",()=>{
  const ids=selector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  const av=selector.listBatchAKnowledgePointAvailabilityBySource(SRC),a=selector.auditP07F21PublicSelectorComposition();
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(ids,[...PREDECESSORS,KP]);assert.equal(av.visibleCount,3);assert.equal(av.hiddenPendingCount,2);assert.equal(av.notSelectableCount,2);
  assert.deepEqual([...av.remainingProtectedKnowledgePointIds],PROTECTED);assert.equal(av.sameSourceCandidateSetComplete,false);assert.equal(av.sameUnitMixedAllowed,false);
  for(const id of PROTECTED){assert.equal(selector.getVisibleBatchAKnowledgePoint(id),null);assert.ok(av.hiddenPendingKnowledgePointIds.includes(id));}
});

for(const id of SPEC_IDS)test(id+" has 240 deterministic unique valid quantity-from-rate variants",()=>{
  const a=generateG6BU06P07F21Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[id],generationSeed:"stable"});
  const b=generateG6BU06P07F21Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[id],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){const v=validateG6BU06P07F21Question(q);assert.equal(v.ok,true,JSON.stringify(v.errors));
    assert.equal(q.answerValue*100,q.patternRepresentation.totalQuantity*q.patternRepresentation.sectorPercent);
    assert.equal(validateG6BU06P07F21Answer(q,q.answerValue).ok,true);}
});

test("Q021 validator rejects prior/future ownership leakage and wrong answers",()=>{
  const q=buildG6BU06P07F21Question({patternSpecId:"ps_g6b_u06_household_expense_pie_rate_to_amount",variant:0});
  assert.equal(q.patternRepresentation.totalQuantity,80000);assert.equal(validateG6BU06P07F21Question(q).ok,true);
  assert.equal(validateG6BU06P07F21Answer(q,q.answerValue+1).ok,false);
  assert.equal(validateG6BU06P07F21Question({...q,metadata:{...q.metadata,piePartWholeReowned:true}}).ok,false);
  assert.equal(validateG6BU06P07F21Question({...q,metadata:{...q.metadata,comparePieChartsReowned:true}}).ok,false);
  assert.equal(validateG6BU06P07F21Question({...q,metadata:{...q.metadata,explicitPercentAngleConversionUsed:true}}).ok,false);
  assert.equal(validateG6BU06P07F21Question({...q,metadata:{...q.metadata,pieChartConstructionUsed:true}}).ok,false);
});

test("Q021 aggregate worksheet HTML is answer-key and print ready without forbidden semantic leakage",()=>{
  const p=buildBatchABrowserPlan(req({questionCount:20}));assert.deepEqual(p.selectedKnowledgePointIds,[KP]);assert.equal(p.questionCountMax,240);
  const g=generateBatchABrowserQuestions(req({questionCount:20}));assert.equal(g.ok,true,g.errors.join(","));
  const w=buildBatchABrowserWorksheetDocument(req({questionCount:12,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:4}}));
  assert.equal(w.ok,true,w.errors.join(","));assert.equal(w.worksheetDocument.questionCount,12);assert.equal(w.worksheetDocument.answerKeyItems.length,12);
  assert.equal(w.worksheetDocument.title,"圓形圖｜由圓形圖比率求數量");
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""}),visible=html.replace(/<[^>]*>/g," ");
  assert.match(visible,/圓形圖/);assert.match(visible,/占/);
  for(const x of ["P07F21","kp_g6b_u06_","ps_g6b_u06_","圓心角","畫出圓形圖","比較兩個圓形圖"])assert.equal(visible.includes(x),false,x);
});

test("Q021 mixed modes remain fail-closed and protected future KPs do not route",()=>{
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[PREDECESSORS[0],KP],questionMode:"numeric",questionCount:8});
  assert.equal(mixed.ok,false);
  for(const future of PROTECTED){
    const g=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[future],questionMode:"numeric",questionCount:4,generationSeed:"future-guard"});
    assert.equal(g.ok,false);
  }
});

test("Q021 current pointers and bounded validation are successor-safe",()=>{
  const s=readFileSync(new URL("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",import.meta.url),"utf8");
  const b=readFileSync(new URL("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",import.meta.url),"utf8");
  const g=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",import.meta.url),"utf8");
  const w=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",import.meta.url),"utf8");
  assert.match(s,/batch-a-selector-p07f21-extension/);assert.match(b,/public-ui-capability-binding-p07f21/);
  for(const id of ["21","20","19","18","17","16","15","14","13","12","11","10","09","08","07","06","05","04","03","02","01"])assert.match(g,new RegExp("requestsP07F"+id));
  for(const id of ["21","20","19","18","17","16","15","14","13","12","11","10","09","08","07","06","05","04","03","02","01"])assert.match(w,new RegExp("buildP07F"+id+"Worksheet"));
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.deepEqual(plan.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(plan).includes("FULL_REPOSITORY"),false);
});
