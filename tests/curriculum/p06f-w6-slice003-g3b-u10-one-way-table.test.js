import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditG3BU10P06F03Projection,G3B_U10_P06F03_INCLUDED_RELATIONS as RELATIONS,G3B_U10_P06F03_KP_ID as KP,G3B_U10_P06F03_PROTECTED_FUTURE_KP_IDS as FUTURE,G3B_U10_P06F03_QUEUE_REQUIRED_CAPABILITY_IDS as QUEUE_CAPS,G3B_U10_P06F03_SOURCE_ID as SRC,G3B_U10_P06F03_SPEC_IDS as SPECS} from "../../site/modules/curriculum/registry/g3b-u10-one-way-table-selector-projection-p06f03.js";
import * as preQ003Selector from "../../site/modules/curriculum/registry/batch-a-selector-p06f02-extension.js";
import {auditP06F03PublicSelectorComposition,getVisibleBatchAKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource,listVisibleBatchAKnowledgePoints,resolveVisiblePatternSpecIdsForKnowledgePoint} from "../../site/modules/curriculum/registry/batch-a-selector-p06f03-extension.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p06f03.js";
import {buildG3BU10P06F03Question,generateG3BU10P06F03Questions,validateG3BU10P06F03Answer,validateG3BU10P06F03Question} from "../../site/modules/curriculum/batch-a/g3b-u10-one-way-table-runtime-p06f03.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {getBatchASourceUnit,listBatchASourceUnits} from "../../site/modules/curriculum/batch-a/source-units.js";

const read=p=>JSON.parse(readFileSync(new URL(`../../${p}`,import.meta.url),"utf8"));
const implementation=read("data/curriculum/full-product/p06f/q003-g3b-u10-one-way-table-implementation.json");
const impact=read("data/project/change-impact/P06F_W6_Q003.impact.json");
const validation=read("data/project/validation-plans/P06F_W6_Q003.validation.json");
const Q002_SRC="g3a_u07_3a07",Q002_KP="kp_tabular_pattern_rule";
const request=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"numeric",questionCount:20,generationSeed:"p06f03-focused",...extra});

test("W6 Q003 materializes exactly one source-backed one-way-table KP",()=>{
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
  assert.equal(implementation.queueAuthority.queuePosition,3);
  assert.deepEqual(implementation.queueAuthority.knowledgePointIds,[KP]);
  assert.deepEqual(implementation.queueAuthority.requiredW6CapabilityIds,QUEUE_CAPS);
  assert.deepEqual(implementation.productContract.includedRelations,RELATIONS);
  assert.deepEqual(implementation.productContract.patternSpecIds,SPECS);
  assert.deepEqual(auditG3BU10P06F03Projection(),{ok:true,errors:[],counts:{knowledgePoints:1,patternGroups:1,patternSpecs:2,formalMappings:1}});
  assert.equal(implementation.semanticProfileLock.sourceSemanticCore,"ONE_WAY_STATISTICAL_TABLE_READING");
  assert.equal(implementation.semanticProfileLock.chartRepresentationRendered,false);
});

test("W6 Q003 publishes the source unit through the Classic source registry",()=>{
  const unit=getBatchASourceUnit(SRC);
  assert.equal(unit?.sourceId,SRC);
  assert.equal(unit?.grade,3);
  assert.equal(unit?.semester,"lower");
  assert.equal(unit?.unitCode,"3B-U10");
  assert.ok(listBatchASourceUnits({includeW6Slice003:true}).some(x=>x.sourceId===SRC));
});

test("W6 Q003 promotes only one-way table reading and keeps Q004+ source KPs hidden",()=>{
  const beforeSource=preQ003Selector.BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[SRC]??null;
  assert.equal(preQ003Selector.getVisibleBatchAKnowledgePoint(KP),null);
  if(beforeSource){
    assert.ok((beforeSource.hiddenPendingKnowledgePointIds??[]).includes(KP));
    assert.ok((beforeSource.notSelectableKnowledgePointIds??[]).includes(KP));
  }
  const a=auditP06F03PublicSelectorComposition();
  assert.equal(a.ok,true,a.errors.join("\n"));
  const after=listBatchAKnowledgePointAvailabilityBySource(SRC);
  const visible=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  assert.ok(visible.includes(KP));
  assert.ok(getVisibleBatchAKnowledgePoint(KP));
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(KP,"numeric"),SPECS);
  assert.equal(after.hiddenPendingKnowledgePointIds.includes(KP),false);
  assert.equal(after.notSelectableKnowledgePointIds.includes(KP),false);
  assert.ok(FUTURE.every(id=>!visible.includes(id)&&getVisibleBatchAKnowledgePoint(id)==null&&after.hiddenPendingKnowledgePointIds.includes(id)&&after.notSelectableKnowledgePointIds.includes(id)));
});

test("W6 Q003 public binding preserves frozen chart envelope without turning the learner task into chart reading",()=>{
  const a=auditPublicUiCapabilityBinding();
  assert.equal(a.ok,true,a.errors.join("\n"));
  const b=resolvePublicUiCapabilityBinding(request());
  assert.equal(b.blocked,false);
  assert.equal(b.questionType,"numeric");
  assert.equal(b.questionCount.max,240);
  assert.deepEqual(b.requiredCapabilityIds,QUEUE_CAPS);
  assert.equal(b.frozenRuntimeProfile,"profile_chart_data");
  assert.equal(b.sourceSemanticCore,"ONE_WAY_STATISTICAL_TABLE_READING");
  assert.equal(b.tableDataModelRequired,true);
  assert.equal(b.dataDomainValidationRequired,true);
  assert.equal(b.frozenChartDataModelCapabilityRequired,true);
  assert.equal(b.frozenChartRepresentationCapabilityRequired,true);
  assert.equal(b.chartRepresentationRendered,false);
  assert.equal(b.oneWayTableRepresentationRequired,true);
  assert.equal(b.comparisonReasoningUsed,false);
  assert.equal(b.missingValueReasoningUsed,false);
  assert.equal(b.twoWayTableUsed,false);
  assert.equal(b.q004OrLaterTouched,false);
});

for(const patternSpecId of SPECS)test(`W6 Q003 ${patternSpecId} has 240 deterministic unique validated direct-lookup variants`,()=>{
  const a=generateG3BU10P06F03Questions({questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
  const b=generateG3BU10P06F03Questions({questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join("\n"));
  assert.deepEqual(a.questions,b.questions);
  assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){
    assert.equal(validateG3BU10P06F03Question(q).ok,true);
    assert.equal(validateG3BU10P06F03Answer(q,q.answerValue).ok,true);
    assert.equal(q.tableData.kind,"one_way_statistics_table");
    assert.equal(q.metadata.chartRepresentationRendered,false);
    assert.equal(q.metadata.q004OrLaterTouched,false);
  }
});

test("W6 Q003 validator fails closed on wrong answers, table-row mutation, chart rendering and future-KP reownership",()=>{
  const q=buildG3BU10P06F03Question({variant:17,patternSpecId:SPECS[0]});
  assert.equal(validateG3BU10P06F03Question(q).ok,true);
  assert.equal(validateG3BU10P06F03Answer(q,q.answerValue+1).ok,false);
  const rows=q.tableData.rows.map((r,i)=>i===0?{...r,value:r.value+1,displayValue:String(r.value+1)}:r);
  assert.equal(validateG3BU10P06F03Question({...q,tableData:{...q.tableData,rows}}).ok,false);
  assert.equal(validateG3BU10P06F03Question({...q,metadata:{...q.metadata,chartRepresentationRendered:true}}).ok,false);
  assert.equal(validateG3BU10P06F03Question({...q,metadata:{...q.metadata,futureKnowledgePointReowned:true}}).ok,false);
});

test("W6 Q003 shared browser path renders one-way statistical tables and keeps Q002 generator reachable",()=>{
  const p=buildBatchABrowserPlan(request({questionCount:8}));
  assert.deepEqual(p.selectedKnowledgePointIds,[KP]);
  assert.equal(p.questionCountMax,240);
  const g=generateBatchABrowserQuestions(request({questionCount:8}));
  assert.equal(g.ok,true,g.errors.join("\n"));
  assert.equal(g.questions.length,8);
  assert.ok(g.questions.every(q=>q.knowledgePointId===KP&&q.tableData?.kind==="one_way_statistics_table"));
  const w=buildBatchABrowserWorksheetDocument(request({questionCount:8,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:4,showAnswerKeyPage:true}}));
  assert.equal(w.ok,true,w.errors.join("\n"));
  assert.equal(w.worksheetDocument.questionCount,8);
  assert.equal(w.worksheetDocument.answerKeyItems.length,8);
  assert.equal(w.worksheetDocument.metadata.chartRepresentationRendered,false);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""});
  assert.equal((html.match(/class="worksheet-one-way-statistics-table"/g)??[]).length,16);
  assert.ok(html.includes('data-representation="one-way-statistics-table"'));
  assert.equal(html.includes("worksheet-chart"),false);
  const q2=generateBatchABrowserQuestions({sourceId:Q002_SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[Q002_KP],questionMode:"numeric",questionCount:4,generationSeed:"q2-preserve"});
  assert.equal(q2.ok,true,q2.errors.join("\n"));
  assert.ok(q2.questions.every(x=>x.knowledgePointId===Q002_KP&&x.tableData?.kind==="tabular_pattern_table"));
});

test("W6 Q003 validation contract stays SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");
  assert.equal(validation.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);
  assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
