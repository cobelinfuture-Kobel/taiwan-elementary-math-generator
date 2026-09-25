import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as selector from "../../site/modules/curriculum/registry/batch-a-selector-p07f25-extension.js";
import {
  auditG6AU08P07F25Projection,
  G6A_U08_P07F25_AVERAGE_KP_ID as AVG_KP,
  G6A_U08_P07F25_AVERAGE_REQUIRED_CAPABILITY_IDS as AVG_REQUIRED,
  G6A_U08_P07F25_AVERAGE_SPEC_IDS as AVG_SPECS,
  G6A_U08_P07F25_KP_IDS as KPS,
  G6A_U08_P07F25_PROTECTED_FUTURE_KP_IDS as PROTECTED,
  G6A_U08_P07F25_RELATIVE_KP_ID as REL_KP,
  G6A_U08_P07F25_RELATIVE_REQUIRED_CAPABILITY_IDS as REL_REQUIRED,
  G6A_U08_P07F25_RELATIVE_SPEC_IDS as REL_SPECS,
  G6A_U08_P07F25_SOURCE_ID as SRC
} from "../../site/modules/curriculum/registry/g6a-u08-average-relative-speed-selector-projection-p07f25.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p07f25.js";
import {buildG6AU08P07F25Question,generateG6AU08P07F25Questions,validateG6AU08P07F25Answer,validateG6AU08P07F25Question} from "../../site/modules/curriculum/batch-a/g6a-u08-average-relative-speed-runtime-p07f25.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p07f/q025-g6a-u08-average-relative-speed-implementation.json");
const pre=read("data/curriculum/full-product/p07f/q025-g6a-u08-average-and-relative-speed-source-authority-preflight.json");
const q024=read("docs/ci/latest-p07f-w7-q024-pages-e2e.json");
const impact=read("data/project/change-impact/P07F_W7_Q025.impact.json");
const plan=read("data/project/validation-plans/P07F_W7_Q025.validation.json");
const req=(kp,extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[kp],questionMode:"numeric",questionCount:20,generationSeed:"p07f25",...extra});

test("Q025 exact composite identity consumes merged preflight and Q024 D0",()=>{
  assert.equal(impl.preflight.prNumber,1072);assert.equal(impl.preflight.mergeSha,"d3f1816e73c6ff1d165ec9916a11045bf695ab3a");
  assert.equal(pre.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");assert.equal(pre.preflightDecision.exactTwoKnowledgePointSetResolved,true);
  assert.equal(q024.status,"PASS_E6_D0_COMPLETE");assert.equal(q024.exactHeadSha,"23654f2af6f638a52ea0ed0b3a934e0f874e9194");
  assert.equal(impl.queueAuthority.queuePosition,25);assert.equal(impl.queueAuthority.sliceId,"p07e_q025_r14_g6a_u08_6a08_profile_speed_rate_c1");
  assert.deepEqual(impl.queueAuthority.targetKnowledgePointIds,KPS);
});

test("Q025 projection and public bindings preserve separate average and relative semantics",()=>{
  const a=auditG6AU08P07F25Projection();assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.counts,{knowledgePoints:2,patternGroups:2,patternSpecs:3,formalMappings:2});
  const b=auditPublicUiCapabilityBinding();assert.equal(b.ok,true,b.errors.join(","));
  const avg=resolvePublicUiCapabilityBinding(req(AVG_KP)),rel=resolvePublicUiCapabilityBinding(req(REL_KP));
  assert.equal(avg.blocked,false);assert.equal(rel.blocked,false);assert.equal(avg.questionCount.max,240);assert.equal(rel.questionCount.max,240);
  assert.deepEqual(avg.requiredCapabilityIds,AVG_REQUIRED);assert.deepEqual(rel.requiredCapabilityIds,REL_REQUIRED);
  assert.equal(avg.averageSpeedOwned,true);assert.equal(avg.relativeSpeedMeetingChasingOwned,false);assert.equal(avg.totalDistanceOverTotalTimeRequired,true);assert.equal(avg.directSegmentSpeedArithmeticMeanAllowed,false);
  assert.equal(rel.averageSpeedOwned,false);assert.equal(rel.relativeSpeedMeetingChasingOwned,true);assert.equal(rel.meetingUsesSpeedSumRequired,true);assert.equal(rel.chasingUsesPositiveSpeedDifferenceRequired,true);
});

test("Q025 promotes exactly two G6A-U08 KPs and leaves unit-conversion/effective-speed protected",()=>{
  const ids=selector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  const av=selector.listBatchAKnowledgePointAvailabilityBySource(SRC),a=selector.auditP07F25PublicSelectorComposition();
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(ids,["kp_speed_distance_time_relation",AVG_KP,REL_KP]);
  assert.equal(av.visibleCount,3);assert.equal(av.hiddenPendingCount,2);assert.equal(av.notSelectableCount,2);
  assert.equal(av.sameSourceCandidateSetComplete,false);assert.equal(av.sameUnitMixedAllowed,false);assert.deepEqual([...av.remainingProtectedKnowledgePointIds],PROTECTED);
  for(const id of PROTECTED){assert.equal(selector.getVisibleBatchAKnowledgePoint(id),null);assert.ok(av.hiddenPendingKnowledgePointIds.includes(id));}
});

for(const id of [...AVG_SPECS,...REL_SPECS])test(id+" has 240 deterministic unique valid variants",()=>{
  const kp=AVG_SPECS.includes(id)?AVG_KP:REL_KP;
  const a=generateG6AU08P07F25Questions({knowledgePointId:kp,questionCount:240,patternSpecIds:[id],generationSeed:"stable"});
  const b=generateG6AU08P07F25Questions({knowledgePointId:kp,questionCount:240,patternSpecIds:[id],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){const v=validateG6AU08P07F25Question(q);assert.equal(v.ok,true,JSON.stringify(v.errors));assert.equal(validateG6AU08P07F25Answer(q,q.answerText).ok,true);}
});

test("Q025 average speed uses total distance over total time and rejects arithmetic-mean shortcut",()=>{
  const q=buildG6AU08P07F25Question({patternSpecId:AVG_SPECS[0],variant:0}),p=q.patternRepresentation;
  assert.equal(p.totalDistance,p.distance1+p.distance2);assert.equal(p.totalTime,p.time1+p.time2);assert.equal(p.totalDistance,p.averageSpeed*p.totalTime);
  assert.notEqual(p.directSegmentSpeedArithmeticMean,p.averageSpeed);assert.equal(p.directSegmentSpeedArithmeticMeanRejected,true);
  assert.equal(validateG6AU08P07F25Answer(q,String(p.directSegmentSpeedArithmeticMean)).ok,false);
  assert.equal(validateG6AU08P07F25Question({...q,metadata:{...q.metadata,directSegmentSpeedArithmeticMeanAllowed:true}}).ok,false);
});

test("Q025 meeting uses speed sum and chasing uses positive speed difference",()=>{
  const m=buildG6AU08P07F25Question({patternSpecId:"ps_g6a_u08_meeting_relative_speed_sum",variant:17}),mp=m.patternRepresentation;
  assert.equal(mp.relativeSpeed,mp.speed1+mp.speed2);assert.equal(mp.initialDistance,mp.relativeSpeed*mp.time);assert.equal(Number(m.answerText),mp.time);
  const c=buildG6AU08P07F25Question({patternSpecId:"ps_g6a_u08_chasing_relative_speed_difference",variant:17}),cp=c.patternRepresentation;
  assert.equal(cp.relativeSpeed,cp.fastSpeed-cp.slowSpeed);assert.ok(cp.relativeSpeed>0);assert.equal(cp.leadDistance,cp.relativeSpeed*cp.time);assert.equal(Number(c.answerText),cp.time);
  assert.equal(validateG6AU08P07F25Question({...m,metadata:{...m.metadata,effectiveSpeedCurrentWindOwnership:true}}).ok,false);
  assert.equal(validateG6AU08P07F25Question({...c,metadata:{...c.metadata,speedUnitConversionOwnership:true}}).ok,false);
});

for(const kp of KPS)test("Q025 aggregate worksheet materializes "+kp+" with answer key and print model",()=>{
  const p=buildBatchABrowserPlan(req(kp,{questionCount:20}));assert.deepEqual(p.selectedKnowledgePointIds,[kp]);assert.equal(p.questionCountMax,240);
  const g=generateBatchABrowserQuestions(req(kp,{questionCount:20}));assert.equal(g.ok,true,g.errors.join(","));assert.equal(g.questions.length,20);
  const w=buildBatchABrowserWorksheetDocument(req(kp,{questionCount:12,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:4}}));
  assert.equal(w.ok,true,w.errors.join(","));assert.equal(w.worksheetDocument.questionCount,12);assert.equal(w.worksheetDocument.answerKeyItems.length,12);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""}),visible=html.replace(/<[^>]*>/g," ");
  if(kp===AVG_KP)assert.match(visible,/全程平均速率/);else{assert.match(visible,/相遇|追上/);}
  for(const x of ["P07F25","kp_average_speed_","kp_relative_speed_","ps_g6a_u08_","順流","逆流","風速","換算成"])assert.equal(visible.includes(x),false,x);
});

test("Q025 preserves Q023 route and keeps mixed/Q026 scopes fail-closed",()=>{
  const old=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:["kp_speed_distance_time_relation"],questionMode:"numeric",questionCount:6,generationSeed:"q023-history"});
  assert.equal(old.ok,true,old.errors.join(","));assert.equal(old.questions.length,6);
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[AVG_KP,REL_KP],questionMode:"numeric",questionCount:8});
  assert.equal(mixed.ok,false);
  for(const future of PROTECTED){
    const g=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[future],questionMode:"numeric",questionCount:4,generationSeed:"future-guard"});
    assert.equal(g.ok,false);
  }
});

test("Q025 current pointers and bounded validation are successor-safe",()=>{
  const s=readFileSync(new URL("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",import.meta.url),"utf8");
  const b=readFileSync(new URL("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",import.meta.url),"utf8");
  const g=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",import.meta.url),"utf8");
  const w=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",import.meta.url),"utf8");
  assert.match(s,/batch-a-selector-p07f25-extension/);assert.match(b,/public-ui-capability-binding-p07f25/);
  for(const id of ["25","24","23","22","21","20","19","18","17","16","15","14","13","12","11","10","09","08","07","06","05","04","03","02","01"])assert.match(g,new RegExp("requestsP07F"+id));
  for(const id of ["25","24","23","22","21","20","19","18","17","16","15","14","13","12","11","10","09","08","07","06","05","04","03","02","01"])assert.match(w,new RegExp("buildP07F"+id+"Worksheet"));
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.deepEqual(plan.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(plan).includes("FULL_REPOSITORY"),false);
});
