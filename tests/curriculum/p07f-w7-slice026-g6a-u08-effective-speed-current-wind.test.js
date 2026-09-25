import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as selector from "../../site/modules/curriculum/registry/batch-a-selector-p07f26-extension.js";
import {
  auditG6AU08P07F26Projection,
  G6A_U08_P07F26_KP_ID as KP,
  G6A_U08_P07F26_OPTIONAL_CAPABILITY_IDS as OPTIONAL,
  G6A_U08_P07F26_PROTECTED_NON_W7_KP_IDS as PROTECTED,
  G6A_U08_P07F26_REQUIRED_CAPABILITY_IDS as REQUIRED,
  G6A_U08_P07F26_SOURCE_ID as SRC,
  G6A_U08_P07F26_SPEC_IDS as SPEC_IDS
} from "../../site/modules/curriculum/registry/g6a-u08-effective-speed-current-wind-selector-projection-p07f26.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p07f26.js";
import {buildG6AU08P07F26Question,generateG6AU08P07F26Questions,validateG6AU08P07F26Answer,validateG6AU08P07F26Question} from "../../site/modules/curriculum/batch-a/g6a-u08-effective-speed-current-wind-runtime-p07f26.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p07f/q026-g6a-u08-effective-speed-current-wind-implementation.json");
const pre=read("data/curriculum/full-product/p07f/q026-g6a-u08-effective-speed-current-wind-source-authority-preflight.json");
const q025=read("docs/ci/latest-p07f-w7-q025-pages-e2e.json");
const impact=read("data/project/change-impact/P07F_W7_Q026.impact.json");
const plan=read("data/project/validation-plans/P07F_W7_Q026.validation.json");
const req=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"numeric",questionCount:20,generationSeed:"p07f26",...extra});

test("Q026 exact final identity consumes merged preflight and Q025 D0",()=>{
  assert.equal(impl.preflight.prNumber,1074);assert.equal(impl.preflight.mergeSha,"d758c04e33cfebae004ef64a747dddbf892478ea");
  assert.equal(pre.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");assert.equal(pre.preflightDecision.finalFrozenW7SliceResolved,true);
  assert.equal(q025.status,"PASS_E6_D0_COMPLETE");assert.equal(q025.exactHeadSha,"2f5a50b6284df48e16bcb6f23c8919fad7ed808d");
  assert.equal(impl.queueAuthority.queuePosition,26);assert.equal(impl.queueAuthority.queueSliceCount,26);
  assert.equal(impl.queueAuthority.sliceId,"p07e_q026_r15_g6a_u08_6a08_profile_speed_rate_c1");
  assert.deepEqual(impl.queueAuthority.targetKnowledgePointIds,[KP]);assert.equal(impl.queueAuthority.finalFrozenW7Slice,true);
});

test("Q026 projection and public binding preserve exact effective-speed application contract",()=>{
  const a=auditG6AU08P07F26Projection();assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:4,formalMappings:1});
  const b=auditPublicUiCapabilityBinding();assert.equal(b.ok,true,b.errors.join(","));
  const bind=resolvePublicUiCapabilityBinding(req());assert.equal(bind.blocked,false);assert.equal(bind.questionType,"numeric");assert.equal(bind.questionCount.max,240);
  assert.deepEqual(bind.requiredCapabilityIds,REQUIRED);assert.deepEqual(bind.optionalCapabilityIds,OPTIONAL);
  assert.deepEqual(bind.appliedRuntimeModifierIds,["mod_quantity_relation_semantics","mod_application_semantics"]);
  assert.equal(bind.frozenRuntimeProfile,"profile_speed_rate");assert.equal(bind.effectiveSpeedCurrentWindOwned,true);assert.equal(bind.finalFrozenW7Slice,true);
  assert.equal(bind.computeEffectiveSpeedFromOwnAndCurrentWindRequired,true);assert.equal(bind.sameDirectionAdditionRequired,true);
  assert.equal(bind.oppositeDirectionSubtractionRequired,true);assert.equal(bind.positiveOpposingEffectiveSpeedRequired,true);
  assert.equal(bind.reverseSolveOwnSpeedAllowed,false);assert.equal(bind.reverseSolveCurrentWindSpeedAllowed,false);
});

test("Q026 promotes only effective-speed and preserves non-W7 speed-unit conversion boundary",()=>{
  const ids=selector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  const av=selector.listBatchAKnowledgePointAvailabilityBySource(SRC),a=selector.auditP07F26PublicSelectorComposition();
  assert.equal(a.ok,true,a.errors.join(","));
  assert.deepEqual(ids,["kp_speed_distance_time_relation","kp_average_speed_total_distance_time","kp_relative_speed_meeting_chasing",KP]);
  assert.equal(av.visibleCount,4);assert.equal(av.hiddenPendingCount,1);assert.equal(av.notSelectableCount,1);
  assert.equal(av.sameSourceCandidateSetComplete,false);assert.equal(av.sameUnitMixedAllowed,false);assert.equal(av.w7FrozenQueueComplete,true);
  assert.deepEqual([...av.remainingProtectedKnowledgePointIds],PROTECTED);
  assert.equal(selector.getVisibleBatchAKnowledgePoint(PROTECTED[0]),null);assert.ok(av.hiddenPendingKnowledgePointIds.includes(PROTECTED[0]));
});

for(const id of SPEC_IDS)test(id+" has 240 deterministic unique valid effective-speed variants",()=>{
  const a=generateG6AU08P07F26Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[id],generationSeed:"stable"});
  const b=generateG6AU08P07F26Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[id],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){
    const v=validateG6AU08P07F26Question(q);assert.equal(v.ok,true,JSON.stringify(v.errors));
    const p=q.patternRepresentation;
    if(p.direction==="SAME")assert.equal(p.effectiveSpeed,p.ownSpeed+p.externalSpeed);
    else{assert.equal(p.effectiveSpeed,p.ownSpeed-p.externalSpeed);assert.ok(p.ownSpeed>p.externalSpeed);assert.ok(p.effectiveSpeed>0);}
    assert.equal(validateG6AU08P07F26Answer(q,q.answerText).ok,true);
  }
});

test("Q026 downstream/tailwind add and upstream/headwind subtract",()=>{
  const rows=[
    ["ps_g6a_u08_downstream_effective_speed","CURRENT","SAME","ADD"],
    ["ps_g6a_u08_upstream_effective_speed","CURRENT","OPPOSITE","SUBTRACT"],
    ["ps_g6a_u08_tailwind_effective_speed","WIND","SAME","ADD"],
    ["ps_g6a_u08_headwind_effective_speed","WIND","OPPOSITE","SUBTRACT"]
  ];
  for(const [id,medium,direction,operation] of rows){
    const q=buildG6AU08P07F26Question({patternSpecId:id,variant:17}),p=q.patternRepresentation;
    assert.equal(p.medium,medium);assert.equal(p.direction,direction);assert.equal(p.operation,operation);
    assert.equal(Number(q.answerText),direction==="SAME"?p.ownSpeed+p.externalSpeed:p.ownSpeed-p.externalSpeed);
    assert.match(q.promptText,/本身的速率/);assert.match(q.promptText,/有效速率/);
  }
});

test("Q026 validator rejects reverse-solve and protected ownership damage",()=>{
  const q=buildG6AU08P07F26Question({patternSpecId:"ps_g6a_u08_upstream_effective_speed",variant:0});
  assert.equal(validateG6AU08P07F26Answer(q,String(Number(q.answerText)+1)).ok,false);
  assert.equal(validateG6AU08P07F26Question({...q,metadata:{...q.metadata,reverseSolveOwnSpeedAllowed:true}}).ok,false);
  assert.equal(validateG6AU08P07F26Question({...q,metadata:{...q.metadata,reverseSolveCurrentWindSpeedAllowed:true}}).ok,false);
  assert.equal(validateG6AU08P07F26Question({...q,metadata:{...q.metadata,speedUnitConversionOwnership:true}}).ok,false);
  assert.equal(validateG6AU08P07F26Question({...q,metadata:{...q.metadata,averageSpeedReowned:true}}).ok,false);
  assert.equal(validateG6AU08P07F26Question({...q,metadata:{...q.metadata,relativeSpeedMeetingChasingReowned:true}}).ok,false);
});

test("Q026 aggregate worksheet is answer-key and print ready without authority leakage",()=>{
  const p=buildBatchABrowserPlan(req({questionCount:20}));assert.deepEqual(p.selectedKnowledgePointIds,[KP]);assert.equal(p.questionCountMax,240);assert.equal(p.finalFrozenW7Slice,true);
  const g=generateBatchABrowserQuestions(req({questionCount:20}));assert.equal(g.ok,true,g.errors.join(","));assert.equal(g.questions.length,20);
  const w=buildBatchABrowserWorksheetDocument(req({questionCount:12,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:4}}));
  assert.equal(w.ok,true,w.errors.join(","));assert.equal(w.worksheetDocument.questionCount,12);assert.equal(w.worksheetDocument.answerKeyItems.length,12);
  assert.equal(w.worksheetDocument.title,"認識速率｜順逆流與有效速率");assert.equal(w.w7FrozenQueueComplete,true);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""}),visible=html.replace(/<[^>]*>/g," ");
  assert.match(visible,/順流|逆流|順風|逆風/);assert.match(visible,/有效速率/);
  for(const x of ["P07F26","kp_effective_speed_","ps_g6a_u08_"])assert.equal(visible.includes(x),false,x);
});

test("Q026 preserves Q023/Q025 routes and keeps mixed/unit-conversion scopes fail-closed",()=>{
  const old1=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:["kp_speed_distance_time_relation"],questionMode:"numeric",questionCount:4,generationSeed:"q023-history"});
  const old2=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:["kp_average_speed_total_distance_time"],questionMode:"numeric",questionCount:4,generationSeed:"q025-history"});
  const old3=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:["kp_relative_speed_meeting_chasing"],questionMode:"numeric",questionCount:4,generationSeed:"q025-relative-history"});
  assert.equal(old1.ok,true,old1.errors.join(","));assert.equal(old2.ok,true,old2.errors.join(","));assert.equal(old3.ok,true,old3.errors.join(","));
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[KP,"kp_relative_speed_meeting_chasing"],questionMode:"numeric",questionCount:8});
  assert.equal(mixed.ok,false);
  const unit=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:["kp_speed_unit_conversion"],questionMode:"numeric",questionCount:4,generationSeed:"unit-conversion-guard"});
  assert.equal(unit.ok,false);
});

test("Q026 current pointers, full W7 aggregate and bounded validation are final-slice safe",()=>{
  const s=readFileSync(new URL("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",import.meta.url),"utf8");
  const b=readFileSync(new URL("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",import.meta.url),"utf8");
  const g=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",import.meta.url),"utf8");
  const w=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",import.meta.url),"utf8");
  assert.match(s,/batch-a-selector-p07f26-extension/);assert.match(b,/public-ui-capability-binding-p07f26/);
  for(const id of ["26","25","24","23","22","21","20","19","18","17","16","15","14","13","12","11","10","09","08","07","06","05","04","03","02","01"])assert.match(g,new RegExp("requestsP07F"+id));
  for(const id of ["26","25","24","23","22","21","20","19","18","17","16","15","14","13","12","11","10","09","08","07","06","05","04","03","02","01"])assert.match(w,new RegExp("buildP07F"+id+"Worksheet"));
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.deepEqual(plan.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(plan).includes("FULL_REPOSITORY"),false);
});
