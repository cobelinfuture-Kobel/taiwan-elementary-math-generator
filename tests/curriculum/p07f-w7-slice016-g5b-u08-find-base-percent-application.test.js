import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as selector from "../../site/modules/curriculum/registry/batch-a-selector-p07f16-extension.js";
import * as preSelector from "../../site/modules/curriculum/registry/batch-a-selector-p07f15-extension.js";
import {
  auditG5BU08P07F16Projection,
  G5B_U08_P07F16_APPLICATION_KP_ID as APP,
  G5B_U08_P07F16_APPLIED_MODIFIER_IDS_BY_KP as MODS,
  G5B_U08_P07F16_FIND_BASE_KP_ID as FIND,
  G5B_U08_P07F16_OPTIONAL_CAPABILITY_IDS_BY_KP as OPTIONAL,
  G5B_U08_P07F16_PREDECESSOR_VISIBLE_KP_IDS as PREDECESSORS,
  G5B_U08_P07F16_REQUIRED_CAPABILITY_IDS_BY_KP as REQUIRED,
  G5B_U08_P07F16_SOURCE_ID as SRC,
  G5B_U08_P07F16_SPEC_IDS as SPEC_IDS,
  G5B_U08_P07F16_SPEC_IDS_BY_KP as SPEC_IDS_BY_KP,
  G5B_U08_P07F16_TARGET_KP_IDS as TARGETS
} from "../../site/modules/curriculum/registry/g5b-u08-find-base-percent-application-selector-projection-p07f16.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p07f16.js";
import {buildG5BU08P07F16Question,generateG5BU08P07F16Questions,validateG5BU08P07F16Answer,validateG5BU08P07F16Question} from "../../site/modules/curriculum/batch-a/g5b-u08-find-base-percent-application-runtime-p07f16.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p07f/q016-g5b-u08-find-base-percent-application-implementation.json");
const repair=read("data/curriculum/full-product/p07f/q016-g5b-u08-find-base-quantity-percent-supplementary-evidence-authority-repair.json");
const impact=read("data/project/change-impact/P07F_W7_Q016.impact.json");
const plan=read("data/project/validation-plans/P07F_W7_Q016.validation.json");
const req=(kp,extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[kp],questionMode:"numeric",questionCount:20,generationSeed:"p07f16",...extra});

test("Q016 exact identity consumes repaired authority and Q015 D0",()=>{
  assert.equal(impl.supplementaryEvidenceRepair.prNumber,1053);assert.equal(impl.supplementaryEvidenceRepair.mergeSha,"cd6a6c982c19b6ecb146009d42d6122596c45d77");
  assert.equal(impl.predecessorD0.q015Status,"PASS_E6_D0_COMPLETE");assert.equal(impl.predecessorD0.q015MergeSha,"bd9e65f1493c76d05f85fd39a4194f482a6cf195");
  assert.equal(impl.queueAuthority.queuePosition,16);assert.equal(impl.queueAuthority.sliceId,"p07e_q016_r11_g5b_u08_5b08_profile_ratio_percent_c1");assert.deepEqual(impl.queueAuthority.knowledgePointIds,TARGETS);
  assert.equal(repair.decision.sourceEvidenceBlockerResolved,true);assert.equal(repair.decision.twoKnowledgePointSemanticOwnershipLockBound,true);
  assert.equal(impl.sourceAuthority.supplementaryFindBaseEvidence.driveFileId,"1grJyszUbRVBWShcWAoxqOjIeD_zQCKVj");
});

test("Q016 projection and bindings preserve per-KP R04 capabilities",()=>{
  const a=auditG5BU08P07F16Projection();assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.counts,{knowledgePoints:2,patternGroups:2,patternSpecs:5,formalMappings:2});
  const b=auditPublicUiCapabilityBinding();assert.equal(b.ok,true,b.errors.join(","));
  for(const kp of TARGETS){const bind=resolvePublicUiCapabilityBinding(req(kp));assert.equal(bind.blocked,false);assert.equal(bind.questionType,"numeric");assert.equal(bind.questionCount.max,240);
    assert.deepEqual(bind.requiredCapabilityIds,REQUIRED[kp]);assert.deepEqual(bind.optionalCapabilityIds,OPTIONAL[kp]);assert.deepEqual(bind.appliedRuntimeModifierIds,MODS[kp]);}
  assert.equal(resolvePublicUiCapabilityBinding(req(FIND)).findBaseOwned,true);assert.equal(resolvePublicUiCapabilityBinding(req(APP)).discountIncreaseApplicationOwned,true);
});

test("Q016 selector promotes exact two targets after Q008 and Q013 and completes same-source candidate visibility",()=>{
  const before=preSelector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId),after=selector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId),av=selector.listBatchAKnowledgePointAvailabilityBySource(SRC),a=selector.auditP07F16PublicSelectorComposition();
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(before,PREDECESSORS);for(const kp of TARGETS)assert.ok(after.includes(kp)&&!av.hiddenPendingKnowledgePointIds.includes(kp)&&!av.notSelectableKnowledgePointIds.includes(kp));
  assert.equal(after.length,5);assert.equal(av.sameSourceCandidateSetComplete,true);assert.equal(av.sameUnitMixedAllowed,false);
});

for(const id of SPEC_IDS)test(id+" has 240 deterministic unique valid variants",()=>{
  const kp=SPEC_IDS_BY_KP[FIND].includes(id)?FIND:APP;
  const a=generateG5BU08P07F16Questions({knowledgePointId:kp,questionCount:240,patternSpecIds:[id],generationSeed:"stable"}),b=generateG5BU08P07F16Questions({knowledgePointId:kp,questionCount:240,patternSpecIds:[id],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){const v=validateG5BU08P07F16Question(q);assert.equal(v.ok,true,JSON.stringify(v.errors));assert.equal(validateG5BU08P07F16Answer(q,q.answerText).ok,true);}
});

test("Q016 exact supplementary reverse-base and primary application carriers materialize",()=>{
  const f=buildG5BU08P07F16Question({knowledgePointId:FIND,patternSpecId:"ps_g5b_u08_find_base_source_broken_eggs",variant:0});
  assert.deepEqual([f.patternRepresentation.comparisonQuantity,f.patternRepresentation.ratePercent,f.patternRepresentation.baseQuantity,f.answerText],[9,1.5,600,"600"]);
  assert.equal(f.patternRepresentation.sourceParameterCarrier,"SUPPLEMENTARY_EXAM_PAGE1_ITEM15_EXACT");
  assert.equal(f.patternRepresentation.baseQuantity*f.patternRepresentation.ratePercent/100,f.patternRepresentation.comparisonQuantity);
  const d=buildG5BU08P07F16Question({knowledgePointId:APP,patternSpecId:"ps_g5b_u08_discount_sale_price",variant:0});
  assert.deepEqual([d.patternRepresentation.originalQuantity,d.patternRepresentation.retentionRatePercent,d.answerText],[15800,85,"13430"]);
  const m=buildG5BU08P07F16Question({knowledgePointId:APP,patternSpecId:"ps_g5b_u08_markup_then_discount",variant:0});
  assert.deepEqual([m.patternRepresentation.originalQuantity,m.patternRepresentation.markupRatePercent,m.patternRepresentation.intermediateQuantity,m.patternRepresentation.retentionRatePercent,m.answerText],[1200,30,1560,85,"1326"]);
});

test("Q016 validator fails closed on semantic ownership damage",()=>{
  const f=buildG5BU08P07F16Question({knowledgePointId:FIND,patternSpecId:"ps_g5b_u08_find_base_source_broken_eggs",variant:0});
  assert.equal(validateG5BU08P07F16Answer(f,"599").ok,false);assert.equal(validateG5BU08P07F16Question({...f,patternRepresentation:{...f.patternRepresentation,baseQuantity:500}}).ok,false);
  assert.equal(validateG5BU08P07F16Question({...f,metadata:{...f.metadata,q013PercentageQuantityReowned:true}}).ok,false);
  const d=buildG5BU08P07F16Question({knowledgePointId:APP,patternSpecId:"ps_g5b_u08_discount_sale_price",variant:3});
  assert.equal(validateG5BU08P07F16Question({...d,patternRepresentation:{...d.patternRepresentation,retentionRatePercent:d.patternRepresentation.retentionRatePercent+5}}).ok,false);
});

for(const kp of TARGETS)test("Q016 aggregate worksheet HTML "+kp,()=>{
  const p=buildBatchABrowserPlan(req(kp,{questionCount:18}));assert.deepEqual(p.selectedKnowledgePointIds,[kp]);assert.equal(p.questionCountMax,240);
  const g=generateBatchABrowserQuestions(req(kp,{questionCount:18}));assert.equal(g.ok,true,g.errors.join(","));assert.equal(g.questions.length,18);
  const w=buildBatchABrowserWorksheetDocument(req(kp,{questionCount:12,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:4}}));assert.equal(w.ok,true,w.errors.join(","));assert.equal(w.worksheetDocument.questionCount,12);assert.equal(w.worksheetDocument.answerKeyItems.length,12);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""}),visible=html.replace(/<[^>]*>/g," ");assert.equal(visible.includes("P07F16"),false);assert.equal(visible.includes("kp_g5b_u08_"),false);assert.equal(visible.includes("ps_g5b_u08_"),false);
  if(kp===FIND){assert.match(visible,/占全部/);assert.match(visible,/原有多少/);for(const x of ["加成","售價"])assert.equal(visible.includes(x),false,x);}
  else{assert.match(visible,/定價/);assert.match(visible,/售價/);}
});

test("Q016 same-unit mixed remains fail-closed and Q013 historical routes remain reachable",()=>{
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:TARGETS,questionMode:"numeric",questionCount:8});assert.equal(mixed.ok,false);
  for(const kp of PREDECESSORS.slice(1)){const g=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[kp],questionMode:"numeric",questionCount:4,generationSeed:"q013-history"});assert.equal(g.ok,true,g.errors.join(","));}
});

test("Q016 current pointers and bounded validation",()=>{
  const s=readFileSync(new URL("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",import.meta.url),"utf8"),b=readFileSync(new URL("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",import.meta.url),"utf8"),g=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",import.meta.url),"utf8"),w=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",import.meta.url),"utf8");
  assert.match(s,/batch-a-selector-p07f16-extension/);assert.match(b,/public-ui-capability-binding-p07f16/);for(const id of ["16","15","14","13","12","11","10","09","08","07","06","05","04","03","02","01"])assert.match(g,new RegExp("requestsP07F"+id));for(const id of ["16","15","14","13","12","11","10","09","08","07","06","05","04","03","02","01"])assert.match(w,new RegExp("buildP07F"+id+"Worksheet"));
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.deepEqual(plan.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);assert.equal(JSON.stringify(plan).includes("FULL_REPOSITORY"),false);
});
