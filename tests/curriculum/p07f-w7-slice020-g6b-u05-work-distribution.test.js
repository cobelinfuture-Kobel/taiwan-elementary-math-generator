import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as selector from "../../site/modules/curriculum/registry/batch-a-selector-p07f20-extension.js";
import {
  auditG6BU05P07F20Projection,
  G6B_U05_P07F20_EFFECTIVE_ADDED_CAPABILITY_IDS as EFFECTIVE_ADDED,
  G6B_U05_P07F20_KP_ID as KP,
  G6B_U05_P07F20_PREDECESSOR_VISIBLE_KP_IDS as PREDECESSORS,
  G6B_U05_P07F20_REQUIRED_CAPABILITY_IDS as REQUIRED,
  G6B_U05_P07F20_SOURCE_ID as SRC,
  G6B_U05_P07F20_SPEC_IDS as SPEC_IDS
} from "../../site/modules/curriculum/registry/g6b-u05-work-distribution-selector-projection-p07f20.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p07f20.js";
import {buildG6BU05P07F20Question,generateG6BU05P07F20Questions,validateG6BU05P07F20Answer,validateG6BU05P07F20Question} from "../../site/modules/curriculum/batch-a/g6b-u05-work-distribution-runtime-p07f20.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p07f/q020-g6b-u05-work-distribution-implementation.json");
const pre=read("data/curriculum/full-product/p07f/q020-g6b-u05-work-distribution-source-authority-preflight.json");
const impact=read("data/project/change-impact/P07F_W7_Q020.impact.json");
const plan=read("data/project/validation-plans/P07F_W7_Q020.validation.json");
const req=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"numeric",questionCount:20,generationSeed:"p07f20",...extra});

test("Q020 exact identity consumes merged preflight and Q019 D0",()=>{
  assert.equal(impl.preflight.prNumber,1061);assert.equal(impl.preflight.mergeSha,"6fb270f4ce1cc1aaca1c6efd1d2c4abab0f674ef");
  assert.equal(impl.predecessorD0.q019Status,"PASS_E6_D0_COMPLETE");assert.equal(impl.queueAuthority.queuePosition,20);
  assert.equal(impl.queueAuthority.sliceId,"p07e_q020_r11_g6b_u05_6b05_profile_factor_multiple_c1");assert.deepEqual(impl.queueAuthority.targetKnowledgePointIds,[KP]);
  assert.equal(pre.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");assert.equal(pre.preflightDecision.exactRuntimeMappingBound,true);
});

test("Q020 projection and binding preserve exact runtime envelope while explicit relation semantics win",()=>{
  const a=auditG6BU05P07F20Projection();assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1});
  const b=auditPublicUiCapabilityBinding();assert.equal(b.ok,true,b.errors.join(","));
  const bind=resolvePublicUiCapabilityBinding(req());assert.equal(bind.blocked,false);assert.equal(bind.questionType,"numeric");assert.equal(bind.questionCount.max,240);
  assert.deepEqual(bind.requiredCapabilityIds,REQUIRED);assert.deepEqual(bind.effectiveAddedCapabilityIds,EFFECTIVE_ADDED);
  assert.equal(bind.patternFactorCollisionPolicy,"EXPLICIT_PATTERN_RELATION_OVERRIDES_FACTOR_MULTIPLE");
  assert.equal(bind.factorMultipleProfileRuntimeEnvelopeOnly,true);assert.equal(bind.workDistributionStrategyOwned,true);
});

test("Q020 completes all five same-source R02 candidates without enabling same-unit mixed",()=>{
  const ids=selector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  const av=selector.listBatchAKnowledgePointAvailabilityBySource(SRC),a=selector.auditP07F20PublicSelectorComposition();
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(ids,[...PREDECESSORS,KP]);
  assert.equal(av.visibleCount,5);assert.equal(av.hiddenPendingCount,0);assert.equal(av.notSelectableCount,0);
  assert.equal(av.sameSourceCandidateSetComplete,true);assert.equal(av.sameUnitMixedAllowed,false);
});

for(const id of SPEC_IDS)test(id+" has 240 deterministic unique valid multi-condition variants",()=>{
  const a=generateG6BU05P07F20Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[id],generationSeed:"stable"});
  const b=generateG6BU05P07F20Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[id],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){const v=validateG6BU05P07F20Question(q);assert.equal(v.ok,true,JSON.stringify(v.errors));assert.equal(validateG6BU05P07F20Answer(q,q.answerValue).ok,true);}
});

test("Q020 exact page-2 numeric carriers solve and back-substitute all conditions",()=>{
  const boat=buildG6BU05P07F20Question({patternSpecId:"ps_g6b_u05_boat_capacity_distribution",variant:0});
  assert.deepEqual([boat.patternRepresentation.highCapacity,boat.patternRepresentation.lowCapacity,boat.patternRepresentation.totalUnits,boat.patternRepresentation.weightedTotal,boat.answerValue],[15,8,7,91,5]);
  assert.equal(boat.patternRepresentation.highCount,5);assert.equal(boat.patternRepresentation.lowCount,2);
  assert.equal(boat.patternRepresentation.totalCountBackSubstitution,true);assert.equal(boat.patternRepresentation.weightedTotalBackSubstitution,true);
  const train=buildG6BU05P07F20Question({patternSpecId:"ps_g6b_u05_transport_cost_distribution",variant:0});
  assert.deepEqual([train.patternRepresentation.highFare,train.patternRepresentation.lowFare,train.patternRepresentation.totalTrips,train.patternRepresentation.totalCost,train.answerValue],[1500,495,8,8985,5]);
  assert.equal(train.patternRepresentation.lowTrips,3);assert.equal(train.patternRepresentation.totalTripsBackSubstitution,true);assert.equal(train.patternRepresentation.totalCostBackSubstitution,true);
  const pen=buildG6BU05P07F20Question({patternSpecId:"ps_g6b_u05_affine_price_composite_purchase",variant:0});
  assert.deepEqual([pen.patternRepresentation.multiplier,pen.patternRepresentation.offset,pen.patternRepresentation.priceDifference,pen.patternRepresentation.basePrice,pen.patternRepresentation.highPrice,pen.answerValue],[9,5,139,18,157,368]);
  assert.equal(pen.patternRepresentation.affineRelationBackSubstitution,true);assert.equal(pen.patternRepresentation.differenceBackSubstitution,true);assert.equal(pen.patternRepresentation.purchaseTotalBackSubstitution,true);
});

test("Q020 validator rejects predecessor reownership and combinatorics/route-counting leakage",()=>{
  const q=buildG6BU05P07F20Question({patternSpecId:"ps_g6b_u05_boat_capacity_distribution",variant:4});
  assert.equal(validateG6BU05P07F20Question(q).ok,true);
  assert.equal(validateG6BU05P07F20Question({...q,metadata:{...q.metadata,sumMultipleProblemReowned:true}}).ok,false);
  assert.equal(validateG6BU05P07F20Question({...q,metadata:{...q.metadata,pureCombinatoricsUsed:true}}).ok,false);
  assert.equal(validateG6BU05P07F20Question({...q,metadata:{...q.metadata,routeCountingUsed:true}}).ok,false);
  assert.equal(validateG6BU05P07F20Answer(q,q.answerValue+1).ok,false);
});

test("Q020 aggregate worksheet HTML is multi-condition, answer-key and print ready",()=>{
  const p=buildBatchABrowserPlan(req({questionCount:18}));assert.deepEqual(p.selectedKnowledgePointIds,[KP]);assert.equal(p.questionCountMax,240);
  const g=generateBatchABrowserQuestions(req({questionCount:18}));assert.equal(g.ok,true,g.errors.join(","));
  const w=buildBatchABrowserWorksheetDocument(req({questionCount:12,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:3}}));
  assert.equal(w.ok,true,w.errors.join(","));assert.equal(w.worksheetDocument.questionCount,12);assert.equal(w.worksheetDocument.answerKeyItems.length,12);
  assert.equal(w.worksheetDocument.title,"怎樣解題｜工作分配與策略問題");
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""}),visible=html.replace(/<[^>]*>/g," ");
  assert.match(html,/<title>數學練習題預覽<\/title>/);assert.equal(visible.includes("怎樣解題"),false);
  assert.match(visible,/快艇/);assert.match(visible,/高速列車/);assert.match(visible,/麥克筆/);
  for(const x of ["P07F20","kp_g6b_u05_","ps_g6b_u05_","排列幾種","走法"])assert.equal(visible.includes(x),false,x);
});

test("Q020 mixed modes remain fail-closed while all predecessor single-KP routes remain visible",()=>{
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:["kp_g6b_u05_sum_multiple_problem",KP],questionMode:"numeric",questionCount:8});
  assert.equal(mixed.ok,false);
  for(const prior of PREDECESSORS)assert.ok(selector.getVisibleBatchAKnowledgePoint(prior),prior);
});

test("Q020 current pointers and bounded validation are successor-safe",()=>{
  const s=readFileSync(new URL("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",import.meta.url),"utf8");
  const b=readFileSync(new URL("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",import.meta.url),"utf8");
  const g=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",import.meta.url),"utf8");
  const w=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",import.meta.url),"utf8");
  assert.match(s,/batch-a-selector-p07f21-extension/);assert.match(b,/public-ui-capability-binding-p07f21/);
  for(const id of ["21","20","19","18","17","16","15","14","13","12","11","10","09","08","07","06","05","04","03","02","01"])assert.match(g,new RegExp("requestsP07F"+id));
  for(const id of ["21","20","19","18","17","16","15","14","13","12","11","10","09","08","07","06","05","04","03","02","01"])assert.match(w,new RegExp("buildP07F"+id+"Worksheet"));
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.deepEqual(plan.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);assert.equal(JSON.stringify(plan).includes("FULL_REPOSITORY"),false);
});
