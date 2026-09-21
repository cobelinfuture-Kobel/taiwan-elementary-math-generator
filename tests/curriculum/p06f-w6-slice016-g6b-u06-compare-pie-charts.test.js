import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditG6BU06P06F16Projection,G6B_U06_P06F16_KP_ID as KP,G6B_U06_P06F16_PATTERN_SPECS as SPECS,G6B_U06_P06F16_PREDECESSOR_KP_IDS as PREV,G6B_U06_P06F16_REMAINING_KP_IDS as REMAIN,G6B_U06_P06F16_REQUIRED_CAPABILITY_IDS as REQUIRED,G6B_U06_P06F16_SOURCE_ID as SRC,G6B_U06_P06F16_SPEC_IDS as SPEC_IDS} from "../../site/modules/curriculum/registry/g6b-u06-compare-pie-charts-selector-projection-p06f16.js";
import {buildG6BU06P06F16Question,generateG6BU06P06F16Questions,validateG6BU06P06F16Question} from "../../site/modules/curriculum/batch-a/g6b-u06-compare-pie-charts-runtime-p06f16.js";
import {auditP06F16PublicSelectorComposition,BATCH_A_SELECTOR_AVAILABILITY,getVisibleBatchAKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource} from "../../site/modules/curriculum/registry/batch-a-selector-p06f16-extension.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p06f16.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p06f16.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p06f16-extension.js";
import {getBatchASourceUnit} from "../../site/modules/curriculum/batch-a/source-units.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {renderPieChartComparisonData,validatePieChartComparisonData} from "../../site/modules/renderer/pie-chart-comparison-data.js";
const impl=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p06f/q016-g6b-u06-compare-pie-charts-implementation.json",import.meta.url),"utf8"));
const preflight=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p06f/q016-g6b-u06-compare-pie-charts-source-authority-preflight.json",import.meta.url),"utf8"));

test("Q016 implementation preserves exact preflight queue source and semantic boundary",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(impl.preflight.prNumber,1003);
  assert.equal(impl.queueAuthority.sliceId,"p06e_q016_r6_g6b_u06_6b06_profile_chart_data_c1");
  assert.deepEqual(impl.queueAuthority.knowledgePointIds,[KP]);
  assert.equal(impl.sourceAuthority.reviewMethod,"FULL_PAGE_VISUAL_READBACK");
  assert.equal(impl.semanticProfileLock.crossChartComparisonIsCore,true);
  assert.equal(impl.semanticProfileLock.standaloneQuantityFromRateCandidateReownershipAllowed,false);
  assert.equal(impl.semanticProfileLock.q014PartWholePredecessorReownershipAllowed,false);
});
test("Q016 FormalMapping and two PatternSpecs stay inside profile_chart_data",()=>{
  const a=auditG6BU06P06F16Projection();assert.equal(a.ok,true,a.errors.join(","));
  assert.equal(a.counts.formalMappings,1);assert.equal(a.counts.patternSpecs,2);
  assert.deepEqual(REQUIRED,["cap_chart_data_model","cap_chart_representation","cap_data_domain_validator","cap_table_data_model"]);
  assert.ok(SPECS.every(x=>x.semanticCore==="PIE_CHART_CROSS_CHART_COMPARISON"&&x.crossChartComparisonRequired&&x.eachChartTotalBoundToOwnChart&&x.equalSectorRateDoesNotImplyEqualQuantity&&x.totalTimesSectorRateSupportingCalculationAllowed&&!x.standaloneQuantityFromRateAllowed&&!x.q014PartWholeReownershipAllowed&&!x.explicitPercentAngleConversionAllowed&&!x.pieChartConstructionAllowed&&!x.probabilityAllowed&&!x.applicationAllowed&&!x.sameUnitMixedAllowed&&!x.crossUnitMixedAllowed));
});
test("Q016 each PatternSpec supports 240 deterministic unique validated variants",()=>{
  for(const patternSpecId of SPEC_IDS){
    const qs=Array.from({length:240},(_,variant)=>buildG6BU06P06F16Question({patternSpecId,variant,generationSeed:"capacity"}));
    assert.equal(new Set(qs.map(q=>q.questionSignature)).size,240,patternSpecId);
    for(const q of qs){
      const v=validateG6BU06P06F16Question(q);assert.equal(v.ok,true,v.errors.join(","));
      assert.equal(validatePieChartComparisonData(q.chartData),true);
      assert.equal(q.chartData.charts.length,2);
      assert.notEqual(q.chartData.charts[0].totalQuantity,q.chartData.charts[1].totalQuantity);
    }
  }
});
test("Q016 actual-quantity spec proves equal rate does not imply equal quantity",()=>{
  const q=buildG6BU06P06F16Question({patternSpecId:"ps_g6b_u06_compare_pie_chart_actual_quantity_difference",variant:37});
  const p=q.patternRepresentation;
  assert.equal(p.rateA,p.rateB);
  assert.notEqual(p.totalA,p.totalB);
  assert.notEqual(p.quantityA,p.quantityB);
  assert.equal(q.answerValue,Math.abs(p.quantityB-p.quantityA));
  assert.equal(validateG6BU06P06F16Question(q).ok,true);
});
test("Q016 validator and renderer reject cross-chart tampering",()=>{
  const q=JSON.parse(JSON.stringify(buildG6BU06P06F16Question({patternSpecId:SPEC_IDS[1],variant:18})));
  q.chartData.charts[0].totalQuantity+=20;
  let v=validateG6BU06P06F16Question(q);assert.equal(v.ok,false);assert.ok(v.errors.includes("P06F16_RELATION_PAYLOAD_INVALID")||v.errors.includes("P06F16_CHART_MODEL_INVALID"));
  const valid=buildG6BU06P06F16Question({patternSpecId:SPEC_IDS[0],variant:19});
  assert.equal(validatePieChartComparisonData(valid.chartData),true);
  const html=renderPieChartComparisonData(valid.chartData);assert.match(html,/pie-chart-comparison/);assert.match(html,/A圖/);assert.match(html,/B圖/);
});
test("Q016 public selector preserves Q014, promotes Q016, protects three remaining candidates",()=>{
  const a=auditP06F16PublicSelectorComposition();assert.equal(a.ok,true,a.errors.join(","));
  const s=listBatchAKnowledgePointAvailabilityBySource(SRC);
  for(const id of PREV)assert.equal(s.visibleKnowledgePointIds.includes(id),true);
  assert.equal(getVisibleBatchAKnowledgePoint(KP)?.knowledgePointId,KP);
  assert.equal(s.visibleKnowledgePointIds.includes(KP),true);
  for(const id of REMAIN){assert.equal(s.visibleKnowledgePointIds.includes(id),false);assert.equal(s.hiddenPendingKnowledgePointIds.includes(id),true);assert.equal(s.notSelectableKnowledgePointIds.includes(id),true);}
  assert.equal(s.sameUnitMixedAllowed,false);assert.ok(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[SRC]);
});
test("Q016 capability binding and source unit expose single-KP numeric comparison only",()=>{
  const unit=getBatchASourceUnit(SRC);assert.equal(unit.unitCode,"6B-U06");assert.equal(unit.title,"圓形圖");
  const b=resolvePublicUiCapabilityBinding({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP]});
  assert.equal(b.blocked,false);assert.equal(b.questionType,"numeric");assert.equal(b.questionCount.max,240);
  assert.deepEqual(b.requiredCapabilityIds,REQUIRED);assert.equal(b.crossChartComparisonCore,true);assert.equal(b.eachChartTotalBoundToOwnChart,true);assert.equal(b.equalSectorRateDoesNotImplyEqualActualQuantity,true);assert.equal(b.standaloneQuantityFromRateReownershipAllowed,false);assert.equal(b.q014PartWholeReownershipAllowed,false);assert.equal(b.sameUnitMixedAdmission,false);
  const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join(","));
});
test("Q016 browser generator produces 240 unique valid questions and rejects mixed mode",()=>{
  const opts={sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionCount:240,generationSeed:"q016-240"};
  const plan=buildBatchABrowserPlan(opts);assert.equal(plan.sourceId,SRC);assert.equal(plan.questionCountMax,240);assert.deepEqual(plan.patternSpecIds,SPEC_IDS);
  const g=generateBatchABrowserQuestions(opts);assert.equal(g.ok,true,g.errors.join(","));assert.equal(g.questions.length,240);assert.equal(new Set(g.questions.map(q=>q.questionSignature)).size,240);
  const bad=generateBatchABrowserQuestions({...opts,selectionMode:"mixedKnowledgePointsSameUnit"});assert.equal(bad.ok,false);
});
test("Q016 worksheet answer print HTML renders paired pie charts without internal-id leakage",()=>{
  const w=buildBatchABrowserWorksheetDocument({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionCount:8,generationSeed:"q016-render",includeAnswerKey:true,printLayout:{columns:1,rowsPerPage:2}});
  assert.equal(w.ok,true,w.errors.join(","));assert.equal(w.worksheetDocument.questionCount,8);assert.equal(w.worksheetDocument.answerKeyItems.length,8);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""});
  const visibleText=html.replace(/<[^>]*>/g," ");
  assert.match(html,/data-representation="pie-chart-comparison"/);assert.match(visibleText,/A圖/);assert.match(visibleText,/B圖/);assert.match(visibleText,/總量/);
  assert.equal(visibleText.includes("kp_g6b_u06_"),false);assert.equal(visibleText.includes("ps_g6b_u06_"),false);assert.equal(visibleText.includes("P06F16"),false);
});
test("Q016 current browser pointers advance to Q016 while Q014 and Q015 remain routed",()=>{
  const selector=readFileSync(new URL("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",import.meta.url),"utf8");
  const binding=readFileSync(new URL("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",import.meta.url),"utf8");
  const generator=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",import.meta.url),"utf8");
  const worksheet=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",import.meta.url),"utf8");
  assert.match(selector,/batch-a-selector-p06f16-extension/);assert.match(binding,/public-ui-capability-binding-p06f16/);assert.match(generator,/requestsP06F16/);assert.match(generator,/requestsP06F15/);assert.match(generator,/requestsP06F14/);assert.match(worksheet,/buildP06F16Worksheet/);assert.match(worksheet,/buildP06F15Worksheet/);assert.match(worksheet,/buildP06F14Worksheet/);
});
