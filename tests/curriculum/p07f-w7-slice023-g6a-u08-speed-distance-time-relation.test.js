import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {getBatchASourceUnit} from "../../site/modules/curriculum/batch-a/source-units.js";
import * as selector from "../../site/modules/curriculum/registry/batch-a-selector-p07f23-extension.js";
import {
  auditG6AU08P07F23Projection,
  G6A_U08_P07F23_KP_ID as KP,
  G6A_U08_P07F23_PROTECTED_FUTURE_KP_IDS as PROTECTED,
  G6A_U08_P07F23_REQUIRED_CAPABILITY_IDS as REQUIRED,
  G6A_U08_P07F23_OPTIONAL_CAPABILITY_IDS as OPTIONAL,
  G6A_U08_P07F23_QUEUE_REQUIRED_CAPABILITY_IDS as QUEUE_REQUIRED,
  G6A_U08_P07F23_SOURCE_ID as SRC,
  G6A_U08_P07F23_SPEC_IDS as SPEC_IDS
} from "../../site/modules/curriculum/registry/g6a-u08-speed-distance-time-selector-projection-p07f23.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p07f23.js";
import {buildG6AU08P07F23Question,generateG6AU08P07F23Questions,validateG6AU08P07F23Answer,validateG6AU08P07F23Question} from "../../site/modules/curriculum/batch-a/g6a-u08-speed-distance-time-runtime-p07f23.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p07f/q023-g6a-u08-speed-distance-time-relation-implementation.json");
const pre=read("data/curriculum/full-product/p07f/q023-speed-distance-time-relation-source-authority-preflight.json");
const q022=read("docs/ci/latest-p07f-w7-q022-pages-e2e.json");
const impact=read("data/project/change-impact/P07F_W7_Q023.impact.json");
const plan=read("data/project/validation-plans/P07F_W7_Q023.validation.json");
const req=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"numeric",questionCount:20,generationSeed:"p07f23",...extra});

test("Q023 exact identity consumes merged preflight and Q022 D0",()=>{
  assert.equal(impl.preflight.prNumber,1068);assert.equal(impl.preflight.mergeSha,"303478a009198b58edc3bf1ceeef2abe1a15ea27");
  assert.equal(pre.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");assert.equal(pre.preflightDecision.exactRuntimeMappingBound,true);
  assert.equal(q022.status,"PASS_E6_D0_COMPLETE");assert.equal(q022.exactHeadSha,"db1b1ab9f11bb160dcc6f07981946a8385921d6b");
  assert.equal(impl.queueAuthority.queuePosition,23);assert.equal(impl.queueAuthority.sliceId,"p07e_q023_r13_g6a_u08_6a08_profile_speed_rate_c1");
  assert.deepEqual(impl.queueAuthority.targetKnowledgePointIds,[KP]);assert.deepEqual(impl.queueAuthority.requiredW7CapabilityIds,QUEUE_REQUIRED);
});

test("Q023 primary public source, projection and binding are ready",()=>{
  const u=getBatchASourceUnit(SRC);assert.equal(u?.unitCode,"6A-U08");assert.equal(u?.title,"認識速率");assert.equal(u?.domain,"speed_rate");
  const a=auditG6AU08P07F23Projection();assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1});
  const b=auditPublicUiCapabilityBinding();assert.equal(b.ok,true,b.errors.join(","));
  const bind=resolvePublicUiCapabilityBinding(req());assert.equal(bind.blocked,false);assert.equal(bind.questionType,"numeric");assert.equal(bind.questionCount.max,240);
  assert.deepEqual(bind.requiredCapabilityIds,REQUIRED);assert.deepEqual(bind.optionalCapabilityIds,OPTIONAL);assert.equal(bind.frozenRuntimeProfile,"profile_speed_rate");
  assert.equal(bind.speedDistanceTimeRelationOwned,true);assert.equal(bind.answerBackSubstitutionRequired,true);
});

test("Q023 promotes only the speed-distance-time KP and protects four same-source candidates",()=>{
  const ids=selector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  const av=selector.listBatchAKnowledgePointAvailabilityBySource(SRC),a=selector.auditP07F23PublicSelectorComposition();
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(ids,[KP]);assert.equal(av.visibleCount,1);assert.equal(av.hiddenPendingCount,4);assert.equal(av.notSelectableCount,4);
  assert.deepEqual([...av.remainingProtectedKnowledgePointIds],PROTECTED);assert.equal(av.sameSourceCandidateSetComplete,false);assert.equal(av.sameUnitMixedAllowed,false);
  for(const id of PROTECTED){assert.equal(selector.getVisibleBatchAKnowledgePoint(id),null);assert.ok(av.hiddenPendingKnowledgePointIds.includes(id));}
});

for(const id of SPEC_IDS)test(id+" has 240 deterministic unique valid speed-relation variants",()=>{
  const a=generateG6AU08P07F23Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[id],generationSeed:"stable"});
  const b=generateG6AU08P07F23Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[id],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){const v=validateG6AU08P07F23Question(q);assert.equal(v.ok,true,JSON.stringify(v.errors));
    assert.equal(q.patternRepresentation.distance,q.patternRepresentation.speed*q.patternRepresentation.time);
    assert.equal(validateG6AU08P07F23Answer(q,q.answerText).ok,true);}
});

test("Q023 validators solve exactly distance, speed or time and reject protected ownership",()=>{
  const d=buildG6AU08P07F23Question({patternSpecId:"ps_g6a_u08_solve_distance_from_speed_time",variant:0});
  const s=buildG6AU08P07F23Question({patternSpecId:"ps_g6a_u08_solve_speed_from_distance_time",variant:0});
  const t=buildG6AU08P07F23Question({patternSpecId:"ps_g6a_u08_solve_time_from_distance_speed",variant:0});
  assert.equal(Number(d.answerText),d.patternRepresentation.distance);assert.equal(Number(s.answerText),s.patternRepresentation.speed);assert.equal(Number(t.answerText),t.patternRepresentation.time);
  assert.equal(validateG6AU08P07F23Answer(d,String(Number(d.answerText)+1)).ok,false);
  assert.equal(validateG6AU08P07F23Question({...d,metadata:{...d.metadata,speedUnitConversionOwnership:true}}).ok,false);
  assert.equal(validateG6AU08P07F23Question({...d,metadata:{...d.metadata,averageSpeedOwnership:true}}).ok,false);
  assert.equal(validateG6AU08P07F23Question({...d,metadata:{...d.metadata,relativeSpeedMeetingChasingOwnership:true}}).ok,false);
  assert.equal(validateG6AU08P07F23Question({...d,metadata:{...d.metadata,effectiveSpeedCurrentWindOwnership:true}}).ok,false);
});

test("Q023 aggregate worksheet is answer-key and print ready without future-speed leakage",()=>{
  const p=buildBatchABrowserPlan(req({questionCount:20}));assert.deepEqual(p.selectedKnowledgePointIds,[KP]);assert.equal(p.questionCountMax,240);
  const g=generateBatchABrowserQuestions(req({questionCount:20}));assert.equal(g.ok,true,g.errors.join(","));
  const w=buildBatchABrowserWorksheetDocument(req({questionCount:12,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:4}}));
  assert.equal(w.ok,true,w.errors.join(","));assert.equal(w.worksheetDocument.questionCount,12);assert.equal(w.worksheetDocument.answerKeyItems.length,12);
  assert.equal(w.worksheetDocument.title,"認識速率｜速率、距離與時間互求");
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""}),visible=html.replace(/<[^>]*>/g," ");
  assert.match(visible,/固定速率/);
  for(const x of ["P07F23","kp_speed_","ps_g6a_u08_","平均速率","追趕","相遇","順流","逆流","風速","換算成"])assert.equal(visible.includes(x),false,x);
});

test("Q023 mixed modes remain fail-closed and protected future speed KPs do not route",()=>{
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[KP,PROTECTED[0]],questionMode:"numeric",questionCount:8});
  assert.equal(mixed.ok,false);
  for(const future of PROTECTED){
    const g=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[future],questionMode:"numeric",questionCount:4,generationSeed:"future-guard"});
    assert.equal(g.ok,false);
  }
});

test("Q023 current pointers and bounded validation are successor-safe",()=>{
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
