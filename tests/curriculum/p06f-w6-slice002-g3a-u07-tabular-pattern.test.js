import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditG3AU07P06F02Projection,G3A_U07_P06F02_INCLUDED_RELATIONS as RELATIONS,G3A_U07_P06F02_KP_ID as KP,G3A_U07_P06F02_PREDECESSOR_KP_IDS as Q001,G3A_U07_P06F02_QUEUE_REQUIRED_CAPABILITY_IDS as QUEUE_CAPS,G3A_U07_P06F02_SOURCE_ID as SRC,G3A_U07_P06F02_SPEC_IDS as SPECS} from "../../site/modules/curriculum/registry/g3a-u07-tabular-pattern-selector-projection-p06f02.js";
import * as preQ002Selector from "../../site/modules/curriculum/registry/batch-a-selector-p06f01-extension.js";
import {auditP06F02PublicSelectorComposition,getVisibleBatchAKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource,listVisibleBatchAKnowledgePoints,resolveVisiblePatternSpecIdsForKnowledgePoint} from "../../site/modules/curriculum/registry/batch-a-selector-p06f02-extension.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p06f02.js";
import {buildG3AU07P06F02Question,generateG3AU07P06F02Questions,validateG3AU07P06F02Answer,validateG3AU07P06F02Question} from "../../site/modules/curriculum/batch-a/g3a-u07-tabular-pattern-runtime-p06f02.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
const read=p=>JSON.parse(readFileSync(new URL(`../../${p}`,import.meta.url),"utf8"));
const implementation=read("data/curriculum/full-product/p06f/q002-g3a-u07-tabular-pattern-implementation.json");
const impact=read("data/project/change-impact/P06F_W6_Q002.impact.json");
const validation=read("data/project/validation-plans/P06F_W6_Q002.validation.json");
const request=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"numeric",questionCount:20,generationSeed:"p06f02-focused",...extra});

test("W6 Q002 materializes exactly one table-data KP with one FormalMapping and three PatternSpecs",()=>{
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
  assert.equal(implementation.queueAuthority.queuePosition,2);
  assert.deepEqual(implementation.queueAuthority.knowledgePointIds,[KP]);
  assert.deepEqual(implementation.queueAuthority.requiredW6CapabilityIds,QUEUE_CAPS);
  assert.deepEqual(implementation.productContract.includedRelations,RELATIONS);
  assert.deepEqual(implementation.productContract.patternSpecIds,SPECS);
  assert.deepEqual(auditG3AU07P06F02Projection(),{ok:true,errors:[],counts:{knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1}});
});

test("W6 Q002 promotes only kp_tabular_pattern_rule and preserves all Q001 visible predecessors",()=>{
  const before=preQ002Selector.listBatchAKnowledgePointAvailabilityBySource(SRC);
  assert.ok(before);
  assert.ok(Q001.every(id=>before.visibleKnowledgePointIds.includes(id)));
  assert.equal(preQ002Selector.getVisibleBatchAKnowledgePoint(KP),null);
  assert.ok(before.hiddenPendingKnowledgePointIds.includes(KP));
  assert.ok(before.notSelectableKnowledgePointIds.includes(KP));
  const a=auditP06F02PublicSelectorComposition();
  assert.equal(a.ok,true,a.errors.join("\n"));
  const after=listBatchAKnowledgePointAvailabilityBySource(SRC),visible=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  assert.ok(Q001.every(id=>visible.includes(id)));
  assert.ok(visible.includes(KP));
  assert.ok(getVisibleBatchAKnowledgePoint(KP));
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(KP,"numeric"),SPECS);
  assert.equal(after.hiddenPendingKnowledgePointIds.includes(KP),false);
  assert.equal(after.notSelectableKnowledgePointIds.includes(KP),false);
});

test("W6 Q002 public binding requires exact table-data capabilities and forbids Q001 reownership",()=>{
  const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join("\n"));
  const b=resolvePublicUiCapabilityBinding(request());
  assert.equal(b.blocked,false);assert.equal(b.questionType,"numeric");assert.equal(b.questionCount.max,240);
  assert.equal(b.tableDataModelRequired,true);assert.equal(b.dataDomainValidationRequired,true);assert.equal(b.tableRepresentationRequired,true);
  assert.equal(b.chartDataModelUsed,false);assert.equal(b.patternRelationReowned,false);assert.equal(b.symbolicNthTermFormulaUsed,false);
  assert.equal(b.q001ProductMutationAllowed,false);assert.equal(b.sameUnitMixedAdmission,false);assert.equal(b.crossUnitMixedAdmission,false);
  assert.deepEqual(b.requiredCapabilityIds,QUEUE_CAPS);assert.equal(b.frozenRuntimeProfile,"profile_table_data");
});

for(const patternSpecId of SPECS)test(`W6 Q002 ${patternSpecId} has 240 deterministic unique validated variants`,()=>{
  const a=generateG3AU07P06F02Questions({questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"}),b=generateG3AU07P06F02Questions({questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join("\n"));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){assert.equal(validateG3AU07P06F02Question(q).ok,true);assert.equal(validateG3AU07P06F02Answer(q,q.answerValue).ok,true);assert.equal(q.metadata.q001PatternRelationReowned,false);assert.equal(q.metadata.q003OrLaterTouched,false);}
});

test("W6 Q002 validator fails closed on wrong answers, row mutation and Q001 reownership",()=>{
  const q=buildG3AU07P06F02Question({variant:17,patternSpecId:SPECS[0]});
  assert.equal(validateG3AU07P06F02Question(q).ok,true);assert.equal(validateG3AU07P06F02Answer(q,q.answerValue+1).ok,false);
  const rows=q.tableData.rows.map((r,i)=>i===0?{...r,output:r.output+1}:r);
  assert.equal(validateG3AU07P06F02Question({...q,tableData:{...q.tableData,rows}}).ok,false);
  assert.equal(validateG3AU07P06F02Question({...q,metadata:{...q.metadata,q001PatternRelationReowned:true}}).ok,false);
});

test("W6 Q002 shared browser path renders actual HTML tables and keeps Q001 generator reachable",()=>{
  const p=buildBatchABrowserPlan(request({questionCount:8}));assert.deepEqual(p.selectedKnowledgePointIds,[KP]);assert.equal(p.questionCountMax,240);
  const g=generateBatchABrowserQuestions(request({questionCount:8}));assert.equal(g.ok,true,g.errors.join("\n"));assert.equal(g.questions.length,8);assert.ok(g.questions.every(q=>q.knowledgePointId===KP&&q.tableData?.kind==="tabular_pattern_table"));
  const w=buildBatchABrowserWorksheetDocument(request({questionCount:8,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:4,showAnswerKeyPage:true}}));
  assert.equal(w.ok,true,w.errors.join("\n"));assert.equal(w.worksheetDocument.questionCount,8);assert.equal(w.worksheetDocument.answerKeyItems.length,8);assert.equal(w.worksheetDocument.metadata.q001PatternRelationReowned,false);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""});
  assert.equal((html.match(/class="worksheet-tabular-pattern-table"/g)??[]).length,16);assert.ok(html.includes("data-representation=\"tabular-pattern-table\""));assert.ok(html.includes("□"));
  const q1=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[Q001[0]],questionMode:"numeric",questionCount:4,generationSeed:"q1-preserve"});
  assert.equal(q1.ok,true,q1.errors.join("\n"));assert.ok(q1.questions.every(x=>x.knowledgePointId===Q001[0]));assert.ok(q1.questions.every(x=>x.metadata?.q002OrLaterTouched===false));
});

test("W6 Q002 validation contract stays SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");assert.equal(validation.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
