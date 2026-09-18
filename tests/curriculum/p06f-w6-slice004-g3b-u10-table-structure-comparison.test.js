import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditG3BU10P06F04Projection,G3B_U10_P06F04_COMPARISON_KP_ID as CMP_KP,G3B_U10_P06F04_INCLUDED_RELATIONS as RELATIONS,G3B_U10_P06F04_PATTERN_SPECS as SPECS,G3B_U10_P06F04_PROTECTED_FUTURE_KP_IDS as FUTURE,G3B_U10_P06F04_QUEUE_REQUIRED_CAPABILITY_IDS as QUEUE_CAPS,G3B_U10_P06F04_SOURCE_ID as SRC,G3B_U10_P06F04_TARGET_KP_IDS as KPS,G3B_U10_P06F04_TWO_WAY_KP_ID as TW_KP} from "../../site/modules/curriculum/registry/g3b-u10-table-structure-comparison-selector-projection-p06f04.js";
import * as preQ004Selector from "../../site/modules/curriculum/registry/batch-a-selector-p06f03-extension.js";
import {auditP06F04PublicSelectorComposition,getVisibleBatchAKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource,listVisibleBatchAKnowledgePoints,resolveVisiblePatternSpecIdsForKnowledgePoint} from "../../site/modules/curriculum/registry/batch-a-selector-p06f04-extension.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p06f04.js";
import {buildG3BU10P06F04Question,generateG3BU10P06F04Questions,validateG3BU10P06F04Answer,validateG3BU10P06F04Question} from "../../site/modules/curriculum/batch-a/g3b-u10-table-structure-comparison-runtime-p06f04.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {G3B_U10_P06F03_KP_ID as Q003_KP} from "../../site/modules/curriculum/registry/g3b-u10-one-way-table-selector-projection-p06f03.js";

const read=p=>JSON.parse(readFileSync(new URL(`../../${p}`,import.meta.url),"utf8"));
const implementation=read("data/curriculum/full-product/p06f/q004-g3b-u10-table-structure-comparison-implementation.json");
const impact=read("data/project/change-impact/P06F_W6_Q004.impact.json");
const validation=read("data/project/validation-plans/P06F_W6_Q004.validation.json");
const request=(kp,extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[kp],questionMode:"numeric",questionCount:20,generationSeed:`p06f04-${kp}`,...extra});

test("W6 Q004 materializes exactly two source-backed table KPs without chart semantics",()=>{
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
  assert.equal(implementation.queueAuthority.queuePosition,4);
  assert.deepEqual(implementation.queueAuthority.knowledgePointIds,KPS);
  assert.deepEqual(implementation.queueAuthority.requiredW6CapabilityIds,QUEUE_CAPS);
  assert.deepEqual(implementation.productContract.includedRelations,RELATIONS);
  assert.deepEqual(implementation.productContract.patternSpecIds,SPECS.map(x=>x.patternSpecId));
  assert.deepEqual(auditG3BU10P06F04Projection(),{ok:true,errors:[],counts:{knowledgePoints:2,patternGroups:2,patternSpecs:2,formalMappings:2}});
  assert.equal(implementation.semanticProfileLock.chartRepresentationRendered,false);
});

test("W6 Q004 promotes both target KPs, preserves Q003 and protects future same-source KPs",()=>{
  const before=preQ004Selector.listBatchAKnowledgePointAvailabilityBySource(SRC);
  assert.ok(preQ004Selector.getVisibleBatchAKnowledgePoint(Q003_KP));
  assert.ok(KPS.every(id=>preQ004Selector.getVisibleBatchAKnowledgePoint(id)==null&&before.hiddenPendingKnowledgePointIds.includes(id)&&before.notSelectableKnowledgePointIds.includes(id)));
  const a=auditP06F04PublicSelectorComposition();
  assert.equal(a.ok,true,a.errors.join("\n"));
  const after=listBatchAKnowledgePointAvailabilityBySource(SRC);
  const visible=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  assert.ok(visible.includes(Q003_KP));
  assert.ok(KPS.every(id=>visible.includes(id)&&getVisibleBatchAKnowledgePoint(id)&&!after.hiddenPendingKnowledgePointIds.includes(id)&&!after.notSelectableKnowledgePointIds.includes(id)));
  assert.ok(FUTURE.every(id=>!visible.includes(id)&&getVisibleBatchAKnowledgePoint(id)==null&&after.hiddenPendingKnowledgePointIds.includes(id)&&after.notSelectableKnowledgePointIds.includes(id)));
  assert.equal(after.sameUnitMixedAllowed,false);
  for(const kp of KPS)assert.equal(resolveVisiblePatternSpecIdsForKnowledgePoint(kp,"numeric").length,1);
});

test("W6 Q004 bindings keep table semantics inside the frozen chart envelope",()=>{
  const a=auditPublicUiCapabilityBinding();
  assert.equal(a.ok,true,a.errors.join("\n"));
  const cmp=resolvePublicUiCapabilityBinding(request(CMP_KP)),tw=resolvePublicUiCapabilityBinding(request(TW_KP));
  for(const b of [cmp,tw]){
    assert.equal(b.blocked,false);
    assert.equal(b.questionType,"numeric");
    assert.equal(b.questionCount.max,240);
    assert.deepEqual(b.requiredCapabilityIds,QUEUE_CAPS);
    assert.equal(b.frozenRuntimeProfile,"profile_chart_data");
    assert.equal(b.chartRepresentationRendered,false);
    assert.equal(b.sameUnitMixedAdmission,false);
    assert.equal(b.q005OrLaterTouched,false);
  }
  assert.equal(cmp.sourceSemanticCore,"TABLE_DATA_COMPARISON");
  assert.equal(cmp.comparisonReasoningUsed,true);
  assert.equal(cmp.oneWayTableRepresentationRequired,true);
  assert.equal(cmp.twoWayTableUsed,false);
  assert.equal(tw.sourceSemanticCore,"TWO_WAY_TABLE_STRUCTURE");
  assert.equal(tw.comparisonReasoningUsed,false);
  assert.equal(tw.twoWayTableRepresentationRequired,true);
  assert.equal(tw.twoWayTableUsed,true);
});

for(const spec of SPECS)test(`W6 Q004 ${spec.patternSpecId} has 240 deterministic unique validated variants`,()=>{
  const a=generateG3BU10P06F04Questions({knowledgePointId:spec.knowledgePointId,questionCount:240,patternSpecIds:[spec.patternSpecId],generationSeed:"stable"});
  const b=generateG3BU10P06F04Questions({knowledgePointId:spec.knowledgePointId,questionCount:240,patternSpecIds:[spec.patternSpecId],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join("\n"));
  assert.deepEqual(a.questions,b.questions);
  assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){
    assert.equal(validateG3BU10P06F04Question(q).ok,true);
    assert.equal(validateG3BU10P06F04Answer(q,q.answerValue).ok,true);
    assert.equal(q.metadata.chartRepresentationRendered,false);
    assert.equal(q.metadata.q005OrLaterTouched,false);
    if(q.knowledgePointId===CMP_KP)assert.equal(q.tableData.kind,"one_way_statistics_table");
    else assert.equal(q.tableData.kind,"two_way_statistics_table");
  }
});

test("W6 Q004 validator fails closed on table mutation, wrong answer, chart rendering and future-KP reownership",()=>{
  const cmp=buildG3BU10P06F04Question({knowledgePointId:CMP_KP,variant:17,patternSpecId:SPECS.find(x=>x.knowledgePointId===CMP_KP).patternSpecId});
  assert.equal(validateG3BU10P06F04Answer(cmp,cmp.answerValue+1).ok,false);
  const cmpRows=cmp.tableData.rows.map((r,i)=>i===0?{...r,value:r.value+1,displayValue:String(r.value+1)}:r);
  assert.equal(validateG3BU10P06F04Question({...cmp,tableData:{...cmp.tableData,rows:cmpRows}}).ok,false);
  const tw=buildG3BU10P06F04Question({knowledgePointId:TW_KP,variant:29,patternSpecId:SPECS.find(x=>x.knowledgePointId===TW_KP).patternSpecId});
  const twRows=tw.tableData.rows.map((r,ri)=>ri===0?{...r,cells:r.cells.map((c,ci)=>ci===0?{...c,value:c.value+1,displayValue:String(c.value+1)}:c)}:r);
  assert.equal(validateG3BU10P06F04Question({...tw,tableData:{...tw.tableData,rows:twRows}}).ok,false);
  assert.equal(validateG3BU10P06F04Question({...tw,metadata:{...tw.metadata,chartRepresentationRendered:true}}).ok,false);
  assert.equal(validateG3BU10P06F04Question({...tw,metadata:{...tw.metadata,futureKnowledgePointReowned:true}}).ok,false);
});

test("W6 Q004 shared browser path renders both table representations and preserves Q003 reachability",()=>{
  for(const kp of KPS){
    const p=buildBatchABrowserPlan(request(kp,{questionCount:8}));
    assert.deepEqual(p.selectedKnowledgePointIds,[kp]);
    assert.equal(p.questionCountMax,240);
    const g=generateBatchABrowserQuestions(request(kp,{questionCount:8}));
    assert.equal(g.ok,true,g.errors.join("\n"));
    assert.equal(g.questions.length,8);
    const expected=kp===CMP_KP?"one_way_statistics_table":"two_way_statistics_table";
    assert.ok(g.questions.every(q=>q.knowledgePointId===kp&&q.tableData?.kind===expected));
    const w=buildBatchABrowserWorksheetDocument(request(kp,{questionCount:8,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:4,showAnswerKeyPage:true}}));
    assert.equal(w.ok,true,w.errors.join("\n"));
    assert.equal(w.worksheetDocument.questionCount,8);
    assert.equal(w.worksheetDocument.answerKeyItems.length,8);
    assert.equal(w.worksheetDocument.metadata.chartRepresentationRendered,false);
    const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""});
    const cls=kp===CMP_KP?"worksheet-one-way-statistics-table":"worksheet-two-way-statistics-table";
    assert.equal((html.match(new RegExp(`class="${cls}"`,"g"))??[]).length,16);
    assert.equal(html.includes("worksheet-chart"),false);
  }
  const q3=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[Q003_KP],questionMode:"numeric",questionCount:4,generationSeed:"q3-preserve"});
  assert.equal(q3.ok,true,q3.errors.join("\n"));
  assert.ok(q3.questions.every(x=>x.knowledgePointId===Q003_KP&&x.tableData?.kind==="one_way_statistics_table"));
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[CMP_KP,TW_KP],questionMode:"numeric",questionCount:4,generationSeed:"mixed-not-admitted"});
  assert.equal(mixed.ok,false);
});

test("W6 Q004 validation contract stays SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");
  assert.equal(impact.scopeGuards.sameUnitMixedImplementation,false);
  assert.equal(validation.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);
  assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
