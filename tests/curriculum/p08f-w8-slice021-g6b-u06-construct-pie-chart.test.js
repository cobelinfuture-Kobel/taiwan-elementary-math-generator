import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as selector from "../../site/modules/curriculum/registry/batch-a-selector-p08f21-extension.js";
import {
  auditG6BU06P08F21Projection,
  G6B_U06_P08F21_CONTRACT_ONLY_CAPABILITY_IDS as CONTRACT_ONLY,
  G6B_U06_P08F21_FORMAL_MAPPING as MAP,
  G6B_U06_P08F21_KP_ID as KP,
  G6B_U06_P08F21_PATTERN_GROUP as GROUP,
  G6B_U06_P08F21_PATTERN_SPECS as SPECS,
  G6B_U06_P08F21_PRIOR_KP_IDS as PRIOR,
  G6B_U06_P08F21_REQUIRED_CAPABILITY_IDS as REQUIRED,
  G6B_U06_P08F21_SOURCE_ID as SRC,
  G6B_U06_P08F21_SPEC_IDS as SPEC_IDS
} from "../../site/modules/curriculum/registry/g6b-u06-construct-pie-chart-selector-projection-p08f21.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p08f21.js";
import {buildG6BU06P08F21Question,generateG6BU06P08F21Questions,validateG6BU06P08F21Answer,validateG6BU06P08F21Question} from "../../site/modules/curriculum/batch-a/g6b-u06-construct-pie-chart-runtime-p08f21.js";
import {requestsP08F21,buildBatchABrowserPlan,generateBatchABrowserQuestions as generateQ021} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p08f21.js";
import {buildBatchABrowserWorksheetDocument as buildQ021} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p08f21-extension.js";
import {buildBatchABrowserWorksheetDocument as buildCurrent} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderPieChartConstructionDataP08F21} from "../../site/modules/renderer/pie-chart-construction-data-p08f21.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p08f/q021-g6b-u06-construct-pie-chart-implementation.json");
const pre=read("data/curriculum/full-product/p08f/q021-g6b-u06-construct-pie-chart-source-authority-preflight.json");
const q020=read("data/curriculum/full-product/p08f/q020-final-learner-visual-d0-closeout.json");
const impact=read("data/project/change-impact/P08F_W8_Q021.impact.json");
const plan=read("data/project/validation-plans/P08F_W8_Q021.validation.json");
const req=(count=12)=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],selectedPatternGroupIds:[GROUP.patternGroupId],
  patternSpecIds:SPEC_IDS,questionMode:"diagram",requestedQuestionType:"diagram",questionCount:count,generationSeed:"p08f21-test",
  includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:2,showAnswerKeyPage:true}});

test("Q021 materializes exact frozen identity and construct-pie-chart FormalMapping",()=>{
  assert.equal(pre.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(q020.status,"Q020_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(q020.operatorAcceptance.d0Granted,true);
  assert.equal(impl.preflight.prNumber,1158);
  assert.equal(impl.preflight.mergeSha,"798da04d062b223da7e9167ee4caa769914cda09");
  assert.equal(impl.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
  assert.equal(impl.queueAuthority.queuePosition,21);
  assert.equal(impl.queueAuthority.sliceId,"p08e_q021_r12_g6b_u06_6b06_profile_ratio_percent_c1");
  assert.deepEqual(impl.queueAuthority.knowledgePointIds,[KP]);
  assert.equal(MAP.r04MappingId,"r04map_g6b_u06_construct_pie_chart");
  assert.equal(MAP.semanticCore,"CONSTRUCT_PIE_CHART_FROM_CLASSIFIED_DATA_BY_PERCENT_AND_CENTRAL_ANGLE_ALLOCATION");
  assert.equal(MAP.chartConstructionIsCore,true);
  assert.equal(MAP.percentToCentralAngleMayConsumeQ018,true);
  assert.deepEqual(MAP.appliedRuntimeModifierIds,[]);
  assert.deepEqual(MAP.requiredCapabilityIds,REQUIRED);
  assert.deepEqual(MAP.contractOnlyRequiredCapabilityIds,CONTRACT_ONLY);
  const a=auditG6BU06P08F21Projection();
  assert.equal(a.ok,true,a.errors.join("\n"));
  assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:2,formalMappings:1});
  assert.equal(requestsP08F21(req()),true);
  assert.equal(requestsP08F21({...req(),selectionMode:"sourceUnit"}),false);
  assert.equal(requestsP08F21({...req(),selectedKnowledgePointIds:[KP,PRIOR[0]]}),false);
});

for(const id of SPEC_IDS)test(id+" yields 240 deterministic distinct valid construction variants",()=>{
  const a=generateG6BU06P08F21Questions({knowledgePointId:KP,patternSpecIds:[id],questionCount:240,generationSeed:"stable-"+id});
  const b=generateG6BU06P08F21Questions({knowledgePointId:KP,patternSpecIds:[id],questionCount:240,generationSeed:"stable-"+id});
  assert.equal(a.ok,true,a.errors.join("\n"));
  assert.deepEqual(a.questions,b.questions);
  assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){
    const v=validateG6BU06P08F21Question(q);assert.equal(v.ok,true,v.errors.join("\n"));
    assert.equal(q.patternRepresentation.percents.reduce((x,y)=>x+y,0),100);
    assert.equal(q.patternRepresentation.angles.reduce((x,y)=>x+y,0),360);
    assert.deepEqual(q.patternRepresentation.angles,q.patternRepresentation.percents.map(x=>x*3.6));
    assert.equal(validateG6BU06P08F21Answer(q,q.answerValue).ok,true);
    assert.equal(q.chartData.phase,"question");
    assert.equal(q.answerChartData.phase,"answer");
  }
});

test("Q021 keeps counts and percent-table construction families distinct",()=>{
  const counts=buildG6BU06P08F21Question({patternSpecId:"ps_g6b_u06_construct_pie_chart_from_counts",variant:0});
  const perc=buildG6BU06P08F21Question({patternSpecId:"ps_g6b_u06_construct_pie_chart_from_percents",variant:0});
  assert.equal(counts.patternRepresentation.inputMode,"COUNTS");
  assert.equal(perc.patternRepresentation.inputMode,"PERCENTS");
  assert.deepEqual(counts.tableData.headers,["類別","數量"]);
  assert.deepEqual(perc.tableData.headers,["類別","百分率"]);
  assert.ok(counts.tableData.rows.every(x=>!String(x.displayValue).includes("%")));
  assert.ok(perc.tableData.rows.every(x=>String(x.displayValue).endsWith("%")));
  assert.equal(validateG6BU06P08F21Answer(counts,counts.answerValue).ok,true);
  assert.equal(validateG6BU06P08F21Answer(counts,[1,2,3,354]).ok,false);
});

test("Q021 renderer has blank learner canvas and complete answer chart without leaking construction values",()=>{
  const q=buildG6BU06P08F21Question({patternSpecId:SPEC_IDS[0],variant:0});
  const questionHtml=renderPieChartConstructionDataP08F21(q.chartData),answerHtml=renderPieChartConstructionDataP08F21(q.answerChartData);
  assert.match(questionHtml,/data-phase="question"/);
  assert.match(questionHtml,/worksheet-pie-construction__blank-circle/);
  assert.match(questionHtml,/worksheet-pie-construction__start-radius/);
  assert.equal((questionHtml.match(/____%/g)??[]).length,4);
  assert.equal((questionHtml.match(/worksheet-pie-construction__sector/g)??[]).length,0);
  assert.match(answerHtml,/data-phase="answer"/);
  assert.equal((answerHtml.match(/worksheet-pie-construction__sector/g)??[]).length,4);
  assert.equal((answerHtml.match(/worksheet-pie-construction__legend-answer/g)??[]).length,4);
  assert.match(answerHtml,/100% = 360°/);
});

test("Q021 promotes fifth G6B-U06 KP and completes same-source candidate set while mixed stays closed",()=>{
  const ids=selector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  const av=selector.listBatchAKnowledgePointAvailabilityBySource(SRC),a=selector.auditP08F21PublicSelectorComposition();
  assert.equal(a.ok,true,a.errors.join("\n"));
  for(const id of [...PRIOR,KP])assert.ok(ids.includes(id),id);
  assert.equal(ids.filter(id=>id.startsWith("kp_g6b_u06_")).length,5);
  assert.equal(av.hiddenPendingKnowledgePointIds.filter(id=>id.startsWith("kp_g6b_u06_")).length,0);
  assert.equal(av.notSelectableKnowledgePointIds.filter(id=>id.startsWith("kp_g6b_u06_")).length,0);
  assert.equal(av.sameSourceCandidateSetComplete,true);
  assert.equal(av.sameUnitMixedAllowed,false);
  assert.ok(selector.getVisibleBatchAKnowledgePoint(KP));
});

test("Q021 public binding and browser generator stay single-KP diagram",()=>{
  const b=auditPublicUiCapabilityBinding();assert.equal(b.ok,true,b.errors.join("\n"));
  const bind=resolvePublicUiCapabilityBinding(req());
  assert.equal(bind.blocked,false);
  assert.equal(bind.questionType,"diagram");
  assert.equal(bind.questionCount.max,240);
  assert.equal(bind.constructPieChartOwned,true);
  assert.equal(bind.blankConstructionCanvasRequired,true);
  assert.equal(bind.answerChartRequired,true);
  assert.equal(bind.humanVisualReviewRequired,true);
  assert.deepEqual(bind.requiredCapabilityIds,REQUIRED);
  assert.deepEqual(bind.contractOnlyRequiredCapabilityIds,CONTRACT_ONLY);
  const p=buildBatchABrowserPlan(req(20));
  assert.deepEqual(p.selectedKnowledgePointIds,[KP]);
  assert.equal(p.questionCountMax,240);
  assert.equal(p.genericFallback,false);
  const g=generateQ021(req(20));
  assert.equal(g.ok,true,g.errors.join("\n"));
  assert.equal(g.questions.length,20);
  assert.deepEqual(g.allocation.map(x=>x.count),[10,10]);
});

test("Q021 worksheet and current bridge render source table, blank canvas and answer chart",async()=>{
  const w=buildQ021(req(12));
  assert.equal(w.ok,true,w.errors.join("\n"));
  assert.equal(w.worksheetDocument.questionCount,12);
  assert.equal(w.worksheetDocument.answerKeyItems.length,12);
  assert.equal(w.worksheetDocument.questionPages.length,3);
  assert.equal(w.worksheetDocument.answerKeyPages.length,3);
  assert.equal(w.worksheetDocument.title,"圓形圖｜繪製圓形圖");
  assert.equal(w.learnerVisualReviewRequired,true);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:"",debugDataAttributes:false}),visible=html.replace(/<[^>]*>/g," ");
  assert.match(html,/pie-chart-construction-p08f21/);
  assert.match(html,/one-way-statistics-table/);
  assert.match(visible,/完成圓形圖/);
  assert.match(visible,/100% = 360°/);
  for(const x of ["P08F21","kp_g6b_u06_","ps_g6b_u06_","支出金額","比較兩個圓形圖","扇形面積"])assert.equal(visible.includes(x),false,x);
  const current=buildCurrent(req(8));
  assert.equal(current.ok,true,current.errors.join("\n"));
  assert.equal(current.p08f21Implemented,true);
  assert.equal(current.worksheetDocument.metadata.knowledgePointId,KP);
  globalThis.document={};
  try{
    const s=await import("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js?p08f21="+Date.now());
    const binding=await import("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js?p08f21="+Date.now());
    for(const id of [...PRIOR,KP])assert.equal(s.getVisibleBatchAKnowledgePoint(id)?.sourceId,SRC,id);
    const pb=binding.resolvePublicUiCapabilityBinding(req());
    assert.equal(pb.constructPieChartOwned,true);
    assert.equal(pb.frozenRuntimeProfile,"profile_ratio_percent");
  }finally{delete globalThis.document;}
});

test("Q021 mixed modes and prior ownership leakage remain fail-closed",()=>{
  for(const mode of ["mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"]){
    const mixed=generateQ021({sourceId:SRC,selectionMode:mode,selectedKnowledgePointIds:[PRIOR[0],KP],questionMode:"diagram",questionCount:8});
    assert.equal(mixed.ok,false);
  }
  const q=buildG6BU06P08F21Question({patternSpecId:SPEC_IDS[0],variant:1});
  for(const patch of [
    {q014PartWholeTeachingReowned:true},{q016ComparePieChartsTeachingReowned:true},{q021W7QuantityFromRateTeachingReowned:true},
    {q018PercentAngleTeachingReowned:true},{genericSectorGeometryTeachingUsed:true},{applicationContextUsed:true},{q022OrLaterTouched:true}
  ])assert.equal(validateG6BU06P08F21Question({...q,metadata:{...q.metadata,...patch}}).ok,false);
});

test("Q021 bounded validation and ownership guards remain closed",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");
  assert.equal(impact.changeImpact.legalRouteSemanticsChanged,false);
  assert.equal(plan.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(plan.lanes.SHARED_RUNTIME_BOUNDED[0].kind,"NODE_TEST");
  assert.equal(plan.lanes.SHARED_RUNTIME_BOUNDED[1].runtime,"PLAYWRIGHT_CHROMIUM");
  assert.deepEqual(plan.forbidden,["FULL_NODE_REGRESSION","GLOBAL_BROWSER_REPLAY"]);
  for(const v of Object.values(impl.ownershipGuard))assert.equal(v,false);
});
