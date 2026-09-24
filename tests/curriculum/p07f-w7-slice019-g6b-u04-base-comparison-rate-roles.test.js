import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {getBatchASourceUnit} from "../../site/modules/curriculum/batch-a/source-units.js";
import * as selector from "../../site/modules/curriculum/registry/batch-a-selector-p07f19-extension.js";
import {
  auditG6BU04P07F19Projection,
  G6B_U04_P07F19_KP_ID as KP,
  G6B_U04_P07F19_PROTECTED_FUTURE_KP_IDS as PROTECTED,
  G6B_U04_P07F19_REQUIRED_CAPABILITY_IDS as REQUIRED,
  G6B_U04_P07F19_QUEUE_REQUIRED_CAPABILITY_IDS as QUEUE_REQUIRED,
  G6B_U04_P07F19_SOURCE_ID as SRC,
  G6B_U04_P07F19_SPEC_IDS as SPEC_IDS
} from "../../site/modules/curriculum/registry/g6b-u04-base-comparison-rate-roles-selector-projection-p07f19.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p07f19.js";
import {buildG6BU04P07F19Question,generateG6BU04P07F19Questions,validateG6BU04P07F19Answer,validateG6BU04P07F19Question} from "../../site/modules/curriculum/batch-a/g6b-u04-base-comparison-rate-roles-runtime-p07f19.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p07f/q019-g6b-u04-base-comparison-rate-roles-implementation.json");
const pre=read("data/curriculum/full-product/p07f/q019-g6b-u04-base-comparison-rate-roles-source-authority-preflight.json");
const impact=read("data/project/change-impact/P07F_W7_Q019.impact.json");
const plan=read("data/project/validation-plans/P07F_W7_Q019.validation.json");
const req=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"numeric",questionCount:20,generationSeed:"p07f19",...extra});

test("Q019 exact identity consumes merged preflight and Q018 D0",()=>{
  assert.equal(impl.preflight.prNumber,1059);assert.equal(impl.preflight.mergeSha,"684d60b7d00b8d6764cbb7204636192ee0f27e75");
  assert.equal(impl.predecessorD0.q018Status,"PASS_E6_D0_COMPLETE");assert.equal(impl.queueAuthority.queuePosition,19);
  assert.equal(impl.queueAuthority.sliceId,"p07e_q019_r11_g6b_u04_6b04_profile_ratio_percent_c1");assert.deepEqual(impl.queueAuthority.targetKnowledgePointIds,[KP]);
  assert.equal(pre.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");assert.equal(pre.preflightDecision.exactRuntimeMappingBound,true);
});

test("Q019 source unit, projection, binding and exact runtime contract are public-ready",()=>{
  const u=getBatchASourceUnit(SRC);assert.equal(u?.unitCode,"6B-U04");assert.equal(u?.title,"基準量與比較量");
  const a=auditG6BU04P07F19Projection();assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:4,formalMappings:1});
  const b=auditPublicUiCapabilityBinding();assert.equal(b.ok,true,b.errors.join(","));
  const bind=resolvePublicUiCapabilityBinding(req());assert.equal(bind.blocked,false);assert.equal(bind.questionType,"numeric");assert.equal(bind.questionCount.max,240);
  assert.deepEqual(bind.requiredCapabilityIds,REQUIRED);assert.deepEqual(pre.queueAuthority.requiredW7CapabilityIds,QUEUE_REQUIRED);
  assert.equal(bind.baseComparisonRateRoleOwned,true);assert.equal(bind.solveForBaseQuantityAllowed,false);assert.equal(bind.solveForRateAllowed,false);
});

test("Q019 selector exposes only role-identification KP and protects four future same-source KPs",()=>{
  const ids=selector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  const av=selector.listBatchAKnowledgePointAvailabilityBySource(SRC),a=selector.auditP07F19PublicSelectorComposition();
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(ids,[KP]);assert.equal(av.visibleCount,1);assert.equal(av.hiddenPendingCount,4);assert.equal(av.notSelectableCount,4);
  assert.deepEqual([...av.remainingProtectedKnowledgePointIds],PROTECTED);assert.equal(av.sameSourceCandidateSetComplete,false);assert.equal(av.sameUnitMixedAllowed,false);
  for(const id of PROTECTED){assert.equal(selector.getVisibleBatchAKnowledgePoint(id),null);assert.ok(av.hiddenPendingKnowledgePointIds.includes(id));}
});

for(const id of SPEC_IDS)test(id+" has 240 deterministic unique valid role variants",()=>{
  const a=generateG6BU04P07F19Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[id],generationSeed:"stable"});
  const b=generateG6BU04P07F19Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[id],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){const v=validateG6BU04P07F19Question(q);assert.equal(v.ok,true,JSON.stringify(v.errors));assert.equal(validateG6BU04P07F19Answer(q,q.answerText).ok,true);}
});

test("Q019 role validator preserves denominator direction and does not solve protected future KPs",()=>{
  const base=buildG6BU04P07F19Question({patternSpecId:"ps_g6b_u04_identify_base_quantity_role",variant:0});
  const comp=buildG6BU04P07F19Question({patternSpecId:"ps_g6b_u04_identify_comparison_quantity_role",variant:0});
  const rate=buildG6BU04P07F19Question({patternSpecId:"ps_g6b_u04_identify_rate_role",variant:0});
  const rel=buildG6BU04P07F19Question({patternSpecId:"ps_g6b_u04_orient_comparison_base_rate_relation",variant:0});
  assert.equal(base.answerText,base.patternRepresentation.baseQuantityLabel);assert.equal(comp.answerText,comp.patternRepresentation.comparisonQuantityLabel);
  assert.equal(rate.answerText,rate.patternRepresentation.rateLiteral);
  assert.equal(rel.answerText,rel.patternRepresentation.comparisonQuantityLabel+"＝"+rel.patternRepresentation.baseQuantityLabel+"×"+rel.patternRepresentation.rateLiteral);
  assert.equal(validateG6BU04P07F19Answer(base,comp.answerText).ok,false);
  assert.equal(validateG6BU04P07F19Question({...base,metadata:{...base.metadata,findBaseQuantityOwnership:true}}).ok,false);
});

test("Q019 aggregate worksheet HTML is role-focused and answer-key capable",()=>{
  const p=buildBatchABrowserPlan(req({questionCount:20}));assert.deepEqual(p.selectedKnowledgePointIds,[KP]);assert.equal(p.questionCountMax,240);
  const g=generateBatchABrowserQuestions(req({questionCount:20}));assert.equal(g.ok,true,g.errors.join(","));
  const w=buildBatchABrowserWorksheetDocument(req({questionCount:12,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:4}}));
  assert.equal(w.ok,true,w.errors.join(","));assert.equal(w.worksheetDocument.questionCount,12);assert.equal(w.worksheetDocument.answerKeyItems.length,12);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""}),visible=html.replace(/<[^>]*>/g," ");
  assert.match(visible,/基準量/);assert.match(visible,/比較量/);assert.match(visible,/比率/);
  for(const x of ["P07F19","kp_g6b_u04_","ps_g6b_u04_","折扣後","連續折扣","利息"])assert.equal(visible.includes(x),false,x);
});

test("Q019 mixed modes remain fail-closed and future same-source KPs do not route",()=>{
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[KP,"kp_g6b_u04_find_base_quantity"],questionMode:"numeric",questionCount:8});
  assert.equal(mixed.ok,false);
  for(const future of PROTECTED){
    const g=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[future],questionMode:"numeric",questionCount:4,generationSeed:"future-guard"});
    assert.equal(g.ok,false);
  }
});

test("Q019 current pointers and bounded validation are successor-safe",()=>{
  const s=readFileSync(new URL("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",import.meta.url),"utf8");
  const b=readFileSync(new URL("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",import.meta.url),"utf8");
  const g=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",import.meta.url),"utf8");
  const w=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",import.meta.url),"utf8");
  assert.match(s,/batch-a-selector-p07f19-extension/);assert.match(b,/public-ui-capability-binding-p07f19/);
  for(const id of ["19","18","17","16","15","14","13","12","11","10","09","08","07","06","05","04","03","02","01"])assert.match(g,new RegExp("requestsP07F"+id));
  for(const id of ["19","18","17","16","15","14","13","12","11","10","09","08","07","06","05","04","03","02","01"])assert.match(w,new RegExp("buildP07F"+id+"Worksheet"));
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.deepEqual(plan.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);assert.equal(JSON.stringify(plan).includes("FULL_REPOSITORY"),false);
});
