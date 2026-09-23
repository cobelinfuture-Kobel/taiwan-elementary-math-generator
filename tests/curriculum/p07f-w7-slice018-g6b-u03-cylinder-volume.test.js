import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as selector from "../../site/modules/curriculum/registry/batch-a-selector-p07f18-extension.js";
import * as preSelector from "../../site/modules/curriculum/registry/batch-a-selector-p07f17-extension.js";
import {
  auditG6BU03P07F18Projection,
  G6B_U03_P07F18_KP_ID as KP,
  G6B_U03_P07F18_PRIOR_VISIBLE_KP_IDS as PRIOR,
  G6B_U03_P07F18_REQUIRED_CAPABILITY_IDS as REQUIRED,
  G6B_U03_P07F18_OPTIONAL_CAPABILITY_IDS as OPTIONAL,
  G6B_U03_P07F18_SOURCE_ID as SRC,
  G6B_U03_P07F18_SPEC_IDS as SPEC_IDS
} from "../../site/modules/curriculum/registry/g6b-u03-cylinder-volume-selector-projection-p07f18.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p07f18.js";
import {buildG6BU03P07F18Question,generateG6BU03P07F18Questions,validateG6BU03P07F18Answer,validateG6BU03P07F18Question} from "../../site/modules/curriculum/batch-a/g6b-u03-cylinder-volume-runtime-p07f18.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p07f/q018-g6b-u03-cylinder-volume-implementation.json");
const pre=read("data/curriculum/full-product/p07f/q018-g6b-u03-cylinder-volume-source-authority-preflight.json");
const impact=read("data/project/change-impact/P07F_W7_Q018.impact.json");
const plan=read("data/project/validation-plans/P07F_W7_Q018.validation.json");
const req=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"diagram",questionCount:20,generationSeed:"p07f18",...extra});

test("Q018 exact identity consumes merged preflight and Q017 D0",()=>{
  assert.equal(impl.preflight.prNumber,1057);
  assert.equal(impl.preflight.mergeSha,"a3a89bbcd90d35e44830bb93048eac2c31e96684");
  assert.equal(impl.predecessorD0.q017Status,"PASS_E6_D0_COMPLETE");
  assert.equal(impl.queueAuthority.queuePosition,18);
  assert.equal(impl.queueAuthority.sliceId,"p07e_q018_r11_g6b_u03_6b03_profile_spatial_solid_c1");
  assert.deepEqual(impl.queueAuthority.knowledgePointIds,[KP]);
  assert.equal(pre.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(pre.preflightDecision.exactRuntimeMappingBound,true);
});

test("Q018 projection and binding preserve exact spatial-solid capability contract",()=>{
  const a=auditG6BU03P07F18Projection();assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1});
  const b=auditPublicUiCapabilityBinding();assert.equal(b.ok,true,b.errors.join(","));
  const bind=resolvePublicUiCapabilityBinding(req());assert.equal(bind.blocked,false);assert.equal(bind.questionType,"diagram");assert.equal(bind.questionCount.max,240);
  assert.deepEqual(bind.requiredCapabilityIds,REQUIRED);assert.deepEqual(bind.optionalCapabilityIds,OPTIONAL);assert.equal(bind.cylinderVolumeOwned,true);assert.equal(bind.q055GenericPrismVolumeReownershipAllowed,false);
});

test("Q018 selector completes same-source candidate set without reowning prior KPs",()=>{
  const before=preSelector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  const after=selector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  const av=selector.listBatchAKnowledgePointAvailabilityBySource(SRC),a=selector.auditP07F18PublicSelectorComposition();
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(before,PRIOR);assert.deepEqual(after,[...PRIOR,KP]);
  assert.equal(av.visibleCount,5);assert.equal(av.hiddenPendingCount,0);assert.equal(av.notSelectableCount,0);assert.equal(av.sameSourceCandidateSetComplete,true);assert.equal(av.sameUnitMixedAllowed,false);
});

for(const id of SPEC_IDS)test(id+" has 240 deterministic unique valid variants",()=>{
  const a=generateG6BU03P07F18Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[id],generationSeed:"stable"});
  const b=generateG6BU03P07F18Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[id],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){const v=validateG6BU03P07F18Question(q);assert.equal(v.ok,true,JSON.stringify(v.errors));assert.equal(validateG6BU03P07F18Answer(q,q.answerText).ok,true);}
});

test("Q018 exact source numeric carrier and cylinder validator",()=>{
  const q=buildG6BU03P07F18Question({patternSpecId:"ps_g6b_u03_cylinder_source_horizontal_diameter_height",variant:0});
  assert.deepEqual([q.patternRepresentation.diameter,q.patternRepresentation.radius,q.patternRepresentation.height,q.patternRepresentation.circularBaseArea,q.answerText],[20,10,25,314,"7850"]);
  assert.equal(q.patternRepresentation.sourceParameterCarrier,"SOURCE_PAGE1_DIAMETER20_LENGTH25_GEOMETRY");
  assert.equal(q.patternRepresentation.sourceVisualExactNumericCarrier,true);
  assert.equal(validateG6BU03P07F18Answer(q,"7850").ok,true);assert.equal(validateG6BU03P07F18Answer(q,"7800").ok,false);
  assert.equal(validateG6BU03P07F18Question({...q,metadata:{...q.metadata,q055GenericPrismVolumeReowned:true}}).ok,false);
});

test("Q018 aggregate worksheet HTML uses cylinder renderer",()=>{
  const p=buildBatchABrowserPlan(req({questionCount:18}));assert.deepEqual(p.selectedKnowledgePointIds,[KP]);assert.equal(p.questionCountMax,240);
  const g=generateBatchABrowserQuestions(req({questionCount:18}));assert.equal(g.ok,true,g.errors.join(","));
  const w=buildBatchABrowserWorksheetDocument(req({questionCount:12,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:3}}));
  assert.equal(w.ok,true,w.errors.join(","));assert.equal(w.worksheetDocument.questionCount,12);assert.equal(w.worksheetDocument.answerKeyItems.length,12);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""}),visible=html.replace(/<[^>]*>/g," ");
  assert.equal((html.match(/worksheet-cylinder-volume-diagram/g)||[]).length,24);assert.match(visible,/圓柱體積/);
  for(const x of ["P07F18","kp_g6b_u03_","ps_g6b_u03_","表面積","半圓柱","複合柱體"])assert.equal(visible.includes(x),false,x);
});

test("Q018 same-unit mixed remains fail-closed and prior same-source routes remain reachable",()=>{
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:["kp_g6b_u03_prism_base_area_height_volume",KP],questionMode:"diagram",questionCount:8});
  assert.equal(mixed.ok,false);
  for(const prior of PRIOR){
    const g=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[prior],questionMode:"diagram",questionCount:4,generationSeed:"prior-history"});
    assert.equal(g.ok,true,g.errors.join(","));
  }
});

test("Q018 current pointers and bounded validation",()=>{
  const s=readFileSync(new URL("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",import.meta.url),"utf8");
  const b=readFileSync(new URL("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",import.meta.url),"utf8");
  const g=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",import.meta.url),"utf8");
  const w=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",import.meta.url),"utf8");
  const h=readFileSync(new URL("../../site/modules/renderer/html-renderer.js",import.meta.url),"utf8");
  assert.match(s,/batch-a-selector-p07f18-extension/);assert.match(b,/public-ui-capability-binding-p07f18/);
  for(const id of ["18","17","16","15","14","13","12","11","10","09","08","07","06","05","04","03","02","01"])assert.match(g,new RegExp("requestsP07F"+id));
  for(const id of ["18","17","16","15","14","13","12","11","10","09","08","07","06","05","04","03","02","01"])assert.match(w,new RegExp("buildP07F"+id+"Worksheet"));
  assert.match(h,/cylinder-volume-diagram-p07f18/);
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.deepEqual(plan.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);assert.equal(JSON.stringify(plan).includes("FULL_REPOSITORY"),false);
});
