import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as selector from "../../site/modules/curriculum/registry/batch-a-selector-p08f18-extension.js";
import {
  auditG6BU06P08F18Projection,
  G6B_U06_P08F18_CONTRACT_ONLY_CAPABILITY_IDS as CONTRACT_ONLY,
  G6B_U06_P08F18_FORMAL_MAPPING as MAP,
  G6B_U06_P08F18_KP_ID as KP,
  G6B_U06_P08F18_PATTERN_GROUP as GROUP,
  G6B_U06_P08F18_PATTERN_SPECS as SPECS,
  G6B_U06_P08F18_PRIOR_KP_IDS as PRIOR,
  G6B_U06_P08F18_FUTURE_KP_IDS as FUTURE,
  G6B_U06_P08F18_REQUIRED_CAPABILITY_IDS as REQUIRED,
  G6B_U06_P08F18_SOURCE_ID as SRC,
  G6B_U06_P08F18_SPEC_IDS as SPEC_IDS
} from "../../site/modules/curriculum/registry/g6b-u06-pie-chart-percent-angle-conversion-selector-projection-p08f18.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p08f18.js";
import {buildG6BU06P08F18Question,generateG6BU06P08F18Questions,validateG6BU06P08F18Answer,validateG6BU06P08F18Question} from "../../site/modules/curriculum/batch-a/g6b-u06-pie-chart-percent-angle-conversion-runtime-p08f18.js";
import {requestsP08F18,buildBatchABrowserPlan,generateBatchABrowserQuestions as generateQ018} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p08f18.js";
import {buildBatchABrowserWorksheetDocument as buildQ018} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p08f18-extension.js";
import {buildBatchABrowserWorksheetDocument as buildCurrent} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p08f/q018-g6b-u06-pie-chart-percent-angle-conversion-implementation.json");
const pre=read("data/curriculum/full-product/p08f/q018-g6b-u06-pie-chart-percent-angle-conversion-source-authority-preflight.json");
const q017=read("data/curriculum/full-product/p08f/q017-final-learner-visual-d0-closeout.json");
const impact=read("data/project/change-impact/P08F_W8_Q018.impact.json");
const plan=read("data/project/validation-plans/P08F_W8_Q018.validation.json");
const req=(count=16)=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],selectedPatternGroupIds:[GROUP.patternGroupId],patternSpecIds:SPEC_IDS,questionMode:"numeric",requestedQuestionType:"numeric",questionCount:count,generationSeed:"p08f18-test",includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:4,showAnswerKeyPage:true}});

test("Q018 materializes exact frozen identity and bidirectional FormalMapping",()=>{
  assert.equal(pre.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(q017.status,"Q017_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(q017.operatorAcceptance.d0Granted,true);
  assert.equal(impl.preflight.prNumber,1148);
  assert.equal(impl.preflight.mergeSha,"19c2639e02ec61b59a69ae004b4fbb5e63e8f8a6");
  assert.equal(impl.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
  assert.equal(impl.queueAuthority.queuePosition,18);
  assert.equal(impl.queueAuthority.sliceId,"p08e_q018_r10_g6b_u06_6b06_profile_ratio_percent_c1");
  assert.deepEqual(impl.queueAuthority.knowledgePointIds,[KP]);
  assert.equal(MAP.r04MappingId,"r04map_g6b_u06_pie_chart_percent_angle_conversion");
  assert.equal(MAP.semanticCore,"BIDIRECTIONAL_PERCENT_AND_CENTRAL_ANGLE_CONVERSION_WITH_FULL_CIRCLE_360_DEGREES");
  assert.equal(MAP.percentToCentralAngleIsCore,true);
  assert.equal(MAP.centralAngleToPercentIsCore,true);
  assert.deepEqual(MAP.appliedRuntimeModifierIds,[]);
  assert.deepEqual(MAP.requiredCapabilityIds,REQUIRED);
  assert.deepEqual(MAP.contractOnlyRequiredCapabilityIds,CONTRACT_ONLY);
  const a=auditG6BU06P08F18Projection();
  assert.equal(a.ok,true,a.errors.join("\n"));
  assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:2,formalMappings:1});
  assert.equal(requestsP08F18(req()),true);
  assert.equal(requestsP08F18({...req(),selectionMode:"sourceUnit"}),false);
  assert.equal(requestsP08F18({...req(),selectedKnowledgePointIds:[KP,PRIOR[0]]}),false);
});

for(const id of SPEC_IDS)test(id+" yields 240 deterministic distinct valid percent-angle variants",()=>{
  const a=generateG6BU06P08F18Questions({knowledgePointId:KP,patternSpecIds:[id],questionCount:240,generationSeed:"stable-"+id});
  const b=generateG6BU06P08F18Questions({knowledgePointId:KP,patternSpecIds:[id],questionCount:240,generationSeed:"stable-"+id});
  assert.equal(a.ok,true,a.errors.join("\n"));
  assert.deepEqual(a.questions,b.questions);
  assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  assert.equal(new Set(a.questions.map(q=>q.promptText)).size,240);
  for(const q of a.questions){
    assert.equal(validateG6BU06P08F18Question(q).ok,true);
    assert.equal(q.patternRepresentation.angleDegrees,q.patternRepresentation.percent*3.6);
    assert.equal(q.patternRepresentation.wholePercent,100);
    assert.equal(q.patternRepresentation.wholeAngleDegrees,360);
    assert.equal(validateG6BU06P08F18Answer(q,q.answerText).ok,true);
  }
});

test("Q018 validator enforces both conversion directions and rejects ownership leakage",()=>{
  const p2a=buildG6BU06P08F18Question({patternSpecId:"ps_g6b_u06_pie_percent_to_central_angle",variant:4});
  assert.equal(p2a.patternRepresentation.percent,25);
  assert.equal(p2a.patternRepresentation.angleDegrees,90);
  assert.equal(p2a.answerText,"90°");
  assert.equal(validateG6BU06P08F18Answer(p2a,"90度").ok,true);
  assert.equal(validateG6BU06P08F18Answer(p2a,91).ok,false);
  const a2p=buildG6BU06P08F18Question({patternSpecId:"ps_g6b_u06_pie_central_angle_to_percent",variant:4});
  assert.equal(a2p.answerText,"25%");
  assert.equal(validateG6BU06P08F18Answer(a2p,"25％").ok,true);
  for(const patch of [
    {q014PartWholeTeachingReowned:true},
    {q016ComparePieChartsTeachingReowned:true},
    {q021QuantityFromRateTeachingReowned:true},
    {pieChartConstructionUsed:true},
    {genericSectorGeometryTeachingUsed:true},
    {applicationContextUsed:true}
  ]) assert.equal(validateG6BU06P08F18Question({...p2a,metadata:{...p2a.metadata,...patch}}).ok,false);
});

test("Q018 promotes fourth G6B-U06 KP while construction remains protected",()=>{
  const ids=selector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  const av=selector.listBatchAKnowledgePointAvailabilityBySource(SRC),a=selector.auditP08F18PublicSelectorComposition();
  assert.equal(a.ok,true,a.errors.join("\n"));
  for(const id of [...PRIOR,KP])assert.ok(ids.includes(id),id);
  assert.equal(av.visibleCount,4);
  assert.equal(av.hiddenPendingCount,1);
  assert.equal(av.notSelectableCount,1);
  assert.deepEqual([...av.remainingProtectedKnowledgePointIds],FUTURE);
  assert.equal(av.sameSourceCandidateSetComplete,false);
  assert.equal(av.sameUnitMixedAllowed,false);
  assert.equal(selector.getVisibleBatchAKnowledgePoint(FUTURE[0]),null);
});

test("Q018 public binding and browser generator stay single-KP numeric",()=>{
  const b=auditPublicUiCapabilityBinding();assert.equal(b.ok,true,b.errors.join("\n"));
  const bind=resolvePublicUiCapabilityBinding(req());
  assert.equal(bind.blocked,false);
  assert.equal(bind.questionType,"numeric");
  assert.equal(bind.questionCount.max,240);
  assert.equal(bind.percentAngleConversionOwned,true);
  assert.equal(bind.percentToCentralAngleRequired,true);
  assert.equal(bind.centralAngleToPercentRequired,true);
  assert.equal(bind.pieChartGraphicRequired,false);
  assert.deepEqual(bind.requiredCapabilityIds,REQUIRED);
  assert.deepEqual(bind.contractOnlyRequiredCapabilityIds,CONTRACT_ONLY);
  const p=buildBatchABrowserPlan(req(20));
  assert.deepEqual(p.selectedKnowledgePointIds,[KP]);
  assert.equal(p.questionCountMax,240);
  assert.equal(p.genericFallback,false);
  const g=generateQ018(req(20));
  assert.equal(g.ok,true,g.errors.join("\n"));
  assert.equal(g.questions.length,20);
});

test("Q018 worksheet and current bridge produce print-safe learner-facing output",async()=>{
  const w=buildQ018(req(16));
  assert.equal(w.ok,true,w.errors.join("\n"));
  assert.equal(w.worksheetDocument.questionCount,16);
  assert.equal(w.worksheetDocument.answerKeyItems.length,16);
  assert.equal(w.worksheetDocument.questionPages.length,2);
  assert.equal(w.worksheetDocument.answerKeyPages.length,2);
  assert.equal(w.worksheetDocument.title,"圓形圖｜百分率與圓心角換算");
  assert.equal(w.learnerVisualReviewRequired,false);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:"",debugDataAttributes:false});
  const visible=html.replace(/<[^>]*>/g," ");
  assert.match(visible,/圓心角/);
  assert.match(visible,/360°/);
  assert.match(visible,/%/);
  for(const x of ["P08F18","kp_g6b_u06_","ps_g6b_u06_","求數量","支出金額","比較兩個圓形圖","畫出圓形圖","繪製圓形圖","扇形面積"])assert.equal(visible.includes(x),false,x);
  const current=buildCurrent(req(8));
  assert.equal(current.ok,true,current.errors.join("\n"));
  assert.equal(current.p08f18Implemented,true);
  assert.equal(current.worksheetDocument.metadata.knowledgePointId,KP);
  globalThis.document={};
  try{
    const s=await import("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js?p08f18="+Date.now());
    const binding=await import("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js?p08f18="+Date.now());
    for(const id of [...PRIOR,KP])assert.equal(s.getVisibleBatchAKnowledgePoint(id)?.sourceId,SRC,id);
    assert.equal(s.getVisibleBatchAKnowledgePoint(FUTURE[0])?.sourceId,SRC);
    const pb=binding.resolvePublicUiCapabilityBinding(req());
    assert.equal(pb.percentAngleConversionOwned,true);
    assert.equal(pb.frozenRuntimeProfile,"profile_ratio_percent");
  }finally{delete globalThis.document;}
});

test("Q018 mixed modes and future construction remain fail-closed",()=>{
  const mixed=generateQ018({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[PRIOR[0],KP],questionMode:"numeric",questionCount:8});
  assert.equal(mixed.ok,false);
  const future=generateQ018({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[FUTURE[0]],questionMode:"numeric",questionCount:8});
  assert.equal(future.ok,false);
});

test("Q018 bounded validation and ownership guards remain closed",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");
  assert.equal(impact.changeImpact.legalRouteSemanticsChanged,false);
  assert.equal(plan.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(plan.lanes.SHARED_RUNTIME_BOUNDED[0].kind,"NODE_TEST");
  assert.equal(plan.lanes.SHARED_RUNTIME_BOUNDED[1].runtime,"PLAYWRIGHT_CHROMIUM");
  assert.deepEqual(plan.forbidden,["FULL_NODE_REGRESSION","GLOBAL_BROWSER_REPLAY"]);
  for(const v of Object.values(impl.ownershipGuard))assert.equal(v,false);
});
