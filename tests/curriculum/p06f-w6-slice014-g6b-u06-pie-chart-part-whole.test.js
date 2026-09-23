import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditG6BU06P06F14Projection,G6B_U06_P06F14_FUTURE_KP_IDS as FUTURE,G6B_U06_P06F14_KP_ID as KP,G6B_U06_P06F14_PATTERN_SPECS as SPECS,G6B_U06_P06F14_SOURCE_ID as SRC,G6B_U06_P06F14_SPEC_IDS as SPEC_IDS} from "../../site/modules/curriculum/registry/g6b-u06-pie-chart-part-whole-selector-projection-p06f14.js";
import {buildG6BU06P06F14Question,generateG6BU06P06F14Questions,validateG6BU06P06F14Question} from "../../site/modules/curriculum/batch-a/g6b-u06-pie-chart-part-whole-runtime-p06f14.js";
import {auditP06F14PublicSelectorComposition,BATCH_A_SELECTOR_AVAILABILITY,getVisibleBatchAKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource} from "../../site/modules/curriculum/registry/batch-a-selector-p06f14-extension.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p06f14.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p06f14.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p06f14-extension.js";
import {getBatchASourceUnit,listBatchASourceUnits} from "../../site/modules/curriculum/batch-a/source-units.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {renderPieChartData,validatePieChartData} from "../../site/modules/renderer/pie-chart-data.js";
const impl=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p06f/q014-g6b-u06-pie-chart-part-whole-implementation.json",import.meta.url),"utf8"));
const preflight=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p06f/q014-g6b-u06-pie-chart-part-whole-source-authority-preflight.json",import.meta.url),"utf8"));

test("Q014 implementation preserves exact preflight and semantic boundary",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(impl.preflight.prNumber,999);
  assert.equal(impl.queueAuthority.sliceId,"p06e_q014_r5_g6b_u06_6b06_profile_chart_data_c1");
  assert.deepEqual(impl.queueAuthority.knowledgePointIds,[KP]);
  assert.equal(impl.sourceAuthority.reviewMethod,"FULL_PAGE_VISUAL_READBACK");
  assert.equal(impl.semanticProfileLock.partWholeCore,true);
  assert.equal(impl.semanticProfileLock.explicitPercentAngleConversionUsed,false);
  assert.equal(impl.semanticProfileLock.q016ComparePieChartsReowned,false);
});
test("Q014 FormalMapping PatternSpec projection is source-bound and fail-closed",()=>{
  const a=auditG6BU06P06F14Projection();assert.equal(a.ok,true,a.errors.join(","));
  assert.equal(a.counts.formalMappings,1);assert.equal(a.counts.patternSpecs,2);
  assert.equal(new Set(SPEC_IDS).size,2);
  assert.ok(SPECS.every(x=>x.semanticCore==="PIE_CHART_PART_WHOLE"&&x.wholePercentClosureRequired&&x.wholeAngleClosureEvidenceOnly&&!x.explicitPercentAngleConversionAllowed&&!x.quantityFromRateAllowed&&!x.pieChartConstructionAllowed&&!x.crossChartComparisonAllowed&&!x.probabilityAllowed));
});
test("Q014 each PatternSpec supports 240 deterministic unique validated variants",()=>{
  for(const patternSpecId of SPEC_IDS){
    const qs=Array.from({length:240},(_,variant)=>buildG6BU06P06F14Question({patternSpecId,variant,generationSeed:"capacity"}));
    assert.equal(qs.length,240);
    assert.equal(new Set(qs.map(q=>q.questionSignature)).size,240,patternSpecId);
    for(const q of qs){const v=validateG6BU06P06F14Question(q);assert.equal(v.ok,true,v.errors.join(","));assert.equal(q.chartData.sectors.reduce((n,s)=>n+s.percent,0),100);assert.ok(Math.abs(q.chartData.sectors.reduce((n,s)=>n+s.centralAngleDegrees,0)-360)<1e-9);}
  }
});
test("Q014 validator rejects chart share tampering",()=>{
  const q=JSON.parse(JSON.stringify(buildG6BU06P06F14Question({patternSpecId:SPEC_IDS[0],variant:17})));
  q.chartData.sectors[0].percent+=1;
  const v=validateG6BU06P06F14Question(q);
  assert.equal(v.ok,false);assert.ok(v.errors.includes("P06F14_CHART_MODEL_INVALID"));
});
test("Q014 public selector promotes only part-whole and protects future G6B-U06 KPs",()=>{
  const a=auditP06F14PublicSelectorComposition();assert.equal(a.ok,true,a.errors.join(","));
  const s=listBatchAKnowledgePointAvailabilityBySource(SRC);
  assert.equal(getVisibleBatchAKnowledgePoint(KP)?.knowledgePointId,KP);
  assert.equal(s.visibleKnowledgePointIds.includes(KP),true);
  for(const id of FUTURE){assert.equal(s.visibleKnowledgePointIds.includes(id),false);assert.equal(s.hiddenPendingKnowledgePointIds.includes(id),true);assert.equal(s.notSelectableKnowledgePointIds.includes(id),true);}
  assert.equal(s.sameUnitMixedAllowed,false);assert.ok(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[SRC]);
});
test("Q014 public source unit and capability binding are admitted only for single KP numeric",()=>{
  const unit=getBatchASourceUnit(SRC);assert.equal(unit.unitCode,"6B-U06");assert.equal(unit.title,"圓形圖");
  assert.ok(listBatchASourceUnits({includeW6Slice014:true}).some(x=>x.sourceId===SRC));
  const b=resolvePublicUiCapabilityBinding({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP]});
  assert.equal(b.blocked,false);assert.equal(b.questionType,"numeric");assert.equal(b.questionCount.max,240);assert.equal(b.partWholeCore,true);assert.equal(b.wholePercentClosureRequired,true);assert.equal(b.explicitPercentAngleConversionAllowed,false);assert.equal(b.q016ComparePieChartsReownershipAllowed,false);assert.equal(b.sameUnitMixedAdmission,false);
  const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join(","));
});
test("Q014 browser generator produces 240 unique questions and rejects mixed mode",()=>{
  const opts={sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionCount:240,generationSeed:"q014-240"};
  const plan=buildBatchABrowserPlan(opts);assert.equal(plan.sourceId,SRC);assert.equal(plan.questionCountMax,240);assert.deepEqual(plan.patternSpecIds,SPEC_IDS);
  const g=generateBatchABrowserQuestions(opts);assert.equal(g.ok,true,g.errors.join(","));assert.equal(g.questions.length,240);assert.equal(new Set(g.questions.map(q=>q.questionSignature)).size,240);
  const bad=generateBatchABrowserQuestions({...opts,selectionMode:"mixedKnowledgePointsSameUnit"});assert.equal(bad.ok,false);
});
test("Q014 worksheet answer renderer carries valid pie charts without internal-id leakage",()=>{
  const w=buildBatchABrowserWorksheetDocument({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionCount:8,generationSeed:"q014-render",includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:2}});
  assert.equal(w.ok,true,w.errors.join(","));assert.equal(w.worksheetDocument.questionCount,8);assert.equal(w.worksheetDocument.answerKeyItems.length,8);
  for(const q of w.generation.questions)assert.equal(validatePieChartData(q.chartData),true);
  const one=renderPieChartData(w.generation.questions[0].chartData);assert.match(one,/data-representation="pie-chart"/);assert.match(one,/全體 = 100%/);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""});
  assert.equal((html.match(/data-representation="pie-chart"/g)||[]).length,16);
  const visibleText=html.replace(/<[^>]*>/g," ");
  assert.equal(visibleText.includes("kp_g6b_u06_"),false);assert.equal(visibleText.includes("ps_g6b_u06_"),false);assert.equal(visibleText.includes("P06F14"),false);
});
test("Q014 remains reachable through the current browser successor chain",()=>{
  const readRepo=rel=>readFileSync(new URL("../../"+rel,import.meta.url),"utf8");
  const chainContains=(start,target,prefix)=>{
    const stack=[start],seen=new Set();
    while(stack.length){
      const rel=stack.pop();
      if(seen.has(rel))continue;
      seen.add(rel);
      const source=readRepo(rel);
      if(source.includes(target))return true;
      for(const match of source.matchAll(/["']\.\/([^"']+\.js)["']/g)){
        const name=match[1];
        if(name.startsWith(prefix)){
          const dir=rel.slice(0,rel.lastIndexOf("/")+1);
          stack.push(dir+name);
        }
      }
    }
    return false;
  };
  assert.equal(chainContains("site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js","batch-a-selector-p06f14-extension.js","batch-a-selector-p06f"),true);
  assert.equal(chainContains("site/modules/curriculum/public/public-ui-capability-binding-p04f33.js","public-ui-capability-binding-p06f14.js","public-ui-capability-binding-p06f"),true);
  const generator=readRepo("site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js");
  const worksheet=readRepo("site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js");
  assert.match(generator,/requestsP06F14/);assert.match(worksheet,/buildP06F14Worksheet/);
});
