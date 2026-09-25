import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {getBatchASourceUnit} from "../../site/modules/curriculum/batch-a/source-units.js";
import * as selector from "../../site/modules/curriculum/registry/batch-a-selector-p07f22-extension.js";
import {
  auditG6BU04P07F22Projection,
  G6B_U04_P07F22_PREDECESSOR_KP_ID as PREDECESSOR,
  G6B_U04_P07F22_PROTECTED_FUTURE_KP_IDS as PROTECTED,
  G6B_U04_P07F22_REQUIRED_CAPABILITY_IDS as REQUIRED,
  G6B_U04_P07F22_QUEUE_REQUIRED_CAPABILITY_IDS as QUEUE_REQUIRED,
  G6B_U04_P07F22_SOURCE_ID as SRC,
  G6B_U04_P07F22_SPEC_IDS as SPEC_IDS,
  G6B_U04_P07F22_TARGET_KP_IDS as KPS
} from "../../site/modules/curriculum/registry/g6b-u04-three-rate-quantity-relations-selector-projection-p07f22.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p07f22.js";
import {buildG6BU04P07F22Question,generateG6BU04P07F22Questions,validateG6BU04P07F22Answer,validateG6BU04P07F22Question} from "../../site/modules/curriculum/batch-a/g6b-u04-three-rate-quantity-relations-runtime-p07f22.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p07f/q022-g6b-u04-three-rate-quantity-relations-implementation.json");
const pre=read("data/curriculum/full-product/p07f/q022-g6b-u04-three-rate-quantity-relations-source-authority-preflight.json");
const q021=read("docs/ci/latest-p07f-w7-q021-pages-e2e.json");
const impact=read("data/project/change-impact/P07F_W7_Q022.impact.json");
const plan=read("data/project/validation-plans/P07F_W7_Q022.validation.json");
const req=(kp,extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[kp],questionMode:"numeric",questionCount:20,generationSeed:"p07f22",...extra});

test("Q022 exact identity consumes merged three-KP preflight and Q021 D0",()=>{
  assert.equal(impl.preflight.prNumber,1066);assert.equal(impl.preflight.mergeSha,"911800725a831fc73b020467749cb9c5032e2e27");
  assert.equal(pre.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");assert.equal(pre.preflightDecision.exactThreeKnowledgePointSetResolved,true);
  assert.equal(q021.status,"PASS_E6_D0_COMPLETE");assert.equal(q021.exactHeadSha,"b5c106342e20cfcdcffe5f315499289cc569e63d");
  assert.equal(impl.queueAuthority.queuePosition,22);assert.equal(impl.queueAuthority.sliceId,"p07e_q022_r12_g6b_u04_6b04_profile_ratio_percent_c1");
  assert.deepEqual(impl.queueAuthority.targetKnowledgePointIds,KPS);assert.deepEqual(impl.queueAuthority.requiredW7CapabilityIds,QUEUE_REQUIRED);
});

test("Q022 source unit, projection and public bindings are public-ready for exactly three KPs",()=>{
  const u=getBatchASourceUnit(SRC);assert.equal(u?.unitCode,"6B-U04");assert.equal(u?.title,"基準量與比較量");
  const a=auditG6BU04P07F22Projection();assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.counts,{knowledgePoints:3,patternGroups:3,patternSpecs:6,formalMappings:3});
  const b=auditPublicUiCapabilityBinding();assert.equal(b.ok,true,b.errors.join(","));
  for(const kp of KPS){const bind=resolvePublicUiCapabilityBinding(req(kp));assert.equal(bind.blocked,false);assert.equal(bind.questionType,"numeric");assert.equal(bind.questionCount.max,240);
    assert.deepEqual(bind.requiredCapabilityIds,REQUIRED);assert.equal(bind.frozenRuntimeProfile,"profile_ratio_percent");assert.equal(bind.answerBackSubstitutionRequired,true);
    assert.equal([bind.solveBaseQuantityOwned,bind.solveComparisonQuantityOwned,bind.solveRateFromQuantitiesOwned].filter(Boolean).length,1);}
});

test("Q022 promotes three G6B-U04 calculation KPs and keeps successive-rate-change protected",()=>{
  const ids=selector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  const av=selector.listBatchAKnowledgePointAvailabilityBySource(SRC),a=selector.auditP07F22PublicSelectorComposition();
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(ids,[PREDECESSOR,...KPS]);assert.equal(av.visibleCount,4);assert.equal(av.hiddenPendingCount,1);assert.equal(av.notSelectableCount,1);
  assert.deepEqual([...av.remainingProtectedKnowledgePointIds],PROTECTED);assert.equal(av.sameSourceCandidateSetComplete,false);assert.equal(av.sameUnitMixedAllowed,false);
  assert.equal(selector.getVisibleBatchAKnowledgePoint(PROTECTED[0]),null);assert.ok(av.hiddenPendingKnowledgePointIds.includes(PROTECTED[0]));
});

for(const id of SPEC_IDS)test(id+" has 240 deterministic unique valid relation variants",()=>{
  const specKp=id.includes("find_base_")?"kp_g6b_u04_find_base_quantity":id.includes("find_comparison_")?"kp_g6b_u04_find_comparison_quantity":"kp_g6b_u04_find_rate_from_quantities";
  const a=generateG6BU04P07F22Questions({knowledgePointId:specKp,questionCount:240,patternSpecIds:[id],generationSeed:"stable"});
  const b=generateG6BU04P07F22Questions({knowledgePointId:specKp,questionCount:240,patternSpecIds:[id],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){const v=validateG6BU04P07F22Question(q);assert.equal(v.ok,true,JSON.stringify(v.errors));
    assert.equal(q.patternRepresentation.comparisonQuantity*q.patternRepresentation.rateDenominator,q.patternRepresentation.baseQuantity*q.patternRepresentation.rateNumerator);
    assert.equal(validateG6BU04P07F22Answer(q,q.answerText).ok,true);}
});

test("Q022 validators preserve the shared relation while keeping three ownerships distinct",()=>{
  const base=buildG6BU04P07F22Question({patternSpecId:"ps_g6b_u04_find_base_from_percent_rate",variant:0});
  const comp=buildG6BU04P07F22Question({patternSpecId:"ps_g6b_u04_find_comparison_from_decimal_rate",variant:0});
  const rate=buildG6BU04P07F22Question({patternSpecId:"ps_g6b_u04_find_percent_rate_from_quantities",variant:0});
  assert.equal(Number(base.answerText),base.patternRepresentation.baseQuantity);assert.equal(Number(comp.answerText),comp.patternRepresentation.comparisonQuantity);
  assert.equal(rate.answerText,rate.patternRepresentation.ratePercent);
  assert.equal(validateG6BU04P07F22Answer(base,String(Number(base.answerText)+1)).ok,false);
  assert.equal(validateG6BU04P07F22Question({...base,metadata:{...base.metadata,predecessorRoleOwnershipReowned:true}}).ok,false);
  assert.equal(validateG6BU04P07F22Question({...base,metadata:{...base.metadata,successiveRateChangeOwnership:true}}).ok,false);
});

for(const kp of KPS)test("Q022 aggregate worksheet is answer-key/print ready for "+kp,()=>{
  const p=buildBatchABrowserPlan(req(kp,{questionCount:20}));assert.deepEqual(p.selectedKnowledgePointIds,[kp]);assert.equal(p.questionCountMax,240);
  const g=generateBatchABrowserQuestions(req(kp,{questionCount:20}));assert.equal(g.ok,true,g.errors.join(","));
  const w=buildBatchABrowserWorksheetDocument(req(kp,{questionCount:12,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:4}}));
  assert.equal(w.ok,true,w.errors.join(","));assert.equal(w.worksheetDocument.questionCount,12);assert.equal(w.worksheetDocument.answerKeyItems.length,12);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""}),visible=html.replace(/<[^>]*>/g," ");
  assert.match(w.worksheetDocument.title,/^基準量與比較量｜/);assert.match(visible,/已知/);assert.match(visible,/是/);
  for(const x of ["P07F22","kp_g6b_u04_","ps_g6b_u04_","連續折扣","年利率"])assert.equal(visible.includes(x),false,x);
});

test("Q022 mixed modes remain fail-closed and successive-rate-change does not route",()=>{
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[KPS[0],KPS[1]],questionMode:"numeric",questionCount:8});
  assert.equal(mixed.ok,false);
  const future=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[PROTECTED[0]],questionMode:"numeric",questionCount:4,generationSeed:"future-guard"});
  assert.equal(future.ok,false);
});

test("Q022 current pointers and bounded validation are successor-safe",()=>{
  const s=readFileSync(new URL("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",import.meta.url),"utf8");
  const b=readFileSync(new URL("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",import.meta.url),"utf8");
  const g=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",import.meta.url),"utf8");
  const w=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",import.meta.url),"utf8");
  assert.match(s,/batch-a-selector-p07f23-extension/);assert.match(b,/public-ui-capability-binding-p07f23/);
  for(const id of ["23","22","21","20","19","18","17","16","15","14","13","12","11","10","09","08","07","06","05","04","03","02","01"])assert.match(g,new RegExp("requestsP07F"+id));
  for(const id of ["23","22","21","20","19","18","17","16","15","14","13","12","11","10","09","08","07","06","05","04","03","02","01"])assert.match(w,new RegExp("buildP07F"+id+"Worksheet"));
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.deepEqual(plan.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(plan).includes("FULL_REPOSITORY"),false);
});
