import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditG4AU07P06F06Projection,G4A_U07_P06F06_INCLUDED_RELATIONS as RELATIONS,G4A_U07_P06F06_KP_ID as KP,G4A_U07_P06F06_PREDECESSOR_KP_IDS as PREV,G4A_U07_P06F06_PROTECTED_FUTURE_KP_IDS as FUTURE,G4A_U07_P06F06_QUEUE_REQUIRED_CAPABILITY_IDS as QUEUE_CAPS,G4A_U07_P06F06_SOURCE_ID as SRC,G4A_U07_P06F06_SPEC_IDS as SPECS} from "../../site/modules/curriculum/registry/g4a-u07-input-output-table-selector-projection-p06f06.js";
import * as preQ006Selector from "../../site/modules/curriculum/registry/batch-a-selector-p06f05-extension.js";
import {auditP06F06PublicSelectorComposition,getVisibleBatchAKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource,listVisibleBatchAKnowledgePoints,resolveVisiblePatternSpecIdsForKnowledgePoint} from "../../site/modules/curriculum/registry/batch-a-selector-p06f06-extension.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p06f06.js";
import {buildG4AU07P06F06Question,generateG4AU07P06F06Questions,validateG4AU07P06F06Answer,validateG4AU07P06F06Question} from "../../site/modules/curriculum/batch-a/g4a-u07-input-output-table-runtime-p06f06.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
const read=p=>JSON.parse(readFileSync(new URL(`../../${p}`,import.meta.url),"utf8"));
const implementation=read("data/curriculum/full-product/p06f/q006-g4a-u07-input-output-table-implementation.json");
const impact=read("data/project/change-impact/P06F_W6_Q006.impact.json");
const validation=read("data/project/validation-plans/P06F_W6_Q006.validation.json");
const request=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"numeric",questionCount:20,generationSeed:"p06f06-focused",...extra});

test("W6 Q006 materializes one input-output table KP with one FormalMapping and three PatternSpecs",()=>{
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
  assert.equal(implementation.queueAuthority.queuePosition,6);
  assert.deepEqual(implementation.queueAuthority.knowledgePointIds,[KP]);
  assert.deepEqual(implementation.queueAuthority.requiredW6CapabilityIds,QUEUE_CAPS);
  assert.deepEqual(implementation.productContract.includedRelations,RELATIONS);
  assert.deepEqual(implementation.productContract.patternSpecIds,SPECS);
  assert.deepEqual(auditG4AU07P06F06Projection(),{ok:true,errors:[],counts:{knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1}});
  assert.equal(implementation.semanticProfileLock.tablePairsArePrimaryRepresentation,true);
  assert.equal(implementation.semanticProfileLock.oneConsistentOperationRuleRequired,true);
});

test("W6 Q006 promotes only input-output table while preserving Q005 and hiding later same-source KPs",()=>{
  const before=preQ006Selector.listBatchAKnowledgePointAvailabilityBySource(SRC);
  assert.ok(before);
  assert.ok(PREV.every(id=>before.visibleKnowledgePointIds.includes(id)));
  assert.equal(preQ006Selector.getVisibleBatchAKnowledgePoint(KP),null);
  assert.ok(before.hiddenPendingKnowledgePointIds.includes(KP));
  assert.ok(before.notSelectableKnowledgePointIds.includes(KP));
  const a=auditP06F06PublicSelectorComposition();assert.equal(a.ok,true,a.errors.join("\n"));
  const after=listBatchAKnowledgePointAvailabilityBySource(SRC),visible=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  assert.ok(PREV.every(id=>visible.includes(id)));
  assert.ok(visible.includes(KP));
  assert.ok(getVisibleBatchAKnowledgePoint(KP));
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(KP,"numeric"),SPECS);
  assert.equal(after.hiddenPendingKnowledgePointIds.includes(KP),false);
  assert.equal(after.notSelectableKnowledgePointIds.includes(KP),false);
  assert.ok(FUTURE.every(id=>!visible.includes(id)&&getVisibleBatchAKnowledgePoint(id)==null&&after.hiddenPendingKnowledgePointIds.includes(id)&&after.notSelectableKnowledgePointIds.includes(id)));
  assert.equal(after.sameUnitMixedAllowed,false);
});

test("W6 Q006 public binding requires exact table-data capabilities and keeps later semantics fail-closed",()=>{
  const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join("\n"));
  const b=resolvePublicUiCapabilityBinding(request());
  assert.equal(b.blocked,false);assert.equal(b.questionType,"numeric");assert.equal(b.questionCount.max,240);
  assert.equal(b.tableDataModelRequired,true);assert.equal(b.dataDomainValidationRequired,true);assert.equal(b.tableRepresentationRequired,true);assert.equal(b.oneConsistentOperationRuleRequired,true);
  assert.equal(b.genericStatisticalTableReadingUsed,false);assert.equal(b.chartInterpretationUsed,false);assert.equal(b.symbolicNthTermFormulaUsed,false);
  assert.equal(b.q005PatternReowned,false);assert.equal(b.multiplicativePatternReowned,false);assert.equal(b.missingTermReasoningReowned,false);assert.equal(b.q007OrLaterTouched,false);
  assert.equal(b.sameUnitMixedAdmission,false);assert.equal(b.crossUnitMixedAdmission,false);
  assert.deepEqual(b.requiredCapabilityIds,QUEUE_CAPS);assert.equal(b.frozenRuntimeProfile,"profile_table_data");
});

for(const patternSpecId of SPECS)test(`W6 Q006 ${patternSpecId} has 240 deterministic unique validated variants`,()=>{
  const a=generateG4AU07P06F06Questions({questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"}),b=generateG4AU07P06F06Questions({questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join("\n"));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){assert.equal(validateG4AU07P06F06Question(q).ok,true);assert.equal(validateG4AU07P06F06Answer(q,q.answerValue).ok,true);assert.equal(q.tableData.kind,"tabular_pattern_table");assert.equal(q.metadata.q005PatternReowned,false);assert.equal(q.metadata.multiplicativePatternReowned,false);assert.equal(q.metadata.missingTermReasoningReowned,false);assert.equal(q.metadata.q007OrLaterTouched,false);}
});

test("W6 Q006 validator fails closed on wrong answers, row mutation and future-KP leakage",()=>{
  const q=buildG4AU07P06F06Question({variant:17,patternSpecId:SPECS[0]});
  assert.equal(validateG4AU07P06F06Question(q).ok,true);assert.equal(validateG4AU07P06F06Answer(q,q.answerValue+1).ok,false);
  const rows=q.tableData.rows.map((r,i)=>i===0?{...r,output:r.output+1}:r);
  assert.equal(validateG4AU07P06F06Question({...q,tableData:{...q.tableData,rows}}).ok,false);
  assert.equal(validateG4AU07P06F06Question({...q,metadata:{...q.metadata,q005PatternReowned:true}}).ok,false);
  assert.equal(validateG4AU07P06F06Question({...q,metadata:{...q.metadata,multiplicativePatternReowned:true}}).ok,false);
  assert.equal(validateG4AU07P06F06Question({...q,metadata:{...q.metadata,missingTermReasoningReowned:true}}).ok,false);
});

test("W6 Q006 shared browser path renders input-output tables and preserves Q005 generator reachability",()=>{
  const p=buildBatchABrowserPlan(request({questionCount:8}));assert.deepEqual(p.selectedKnowledgePointIds,[KP]);assert.equal(p.questionCountMax,240);assert.equal(p.sourceUnit.grade,4);
  const g=generateBatchABrowserQuestions(request({questionCount:8}));assert.equal(g.ok,true,g.errors.join("\n"));assert.equal(g.questions.length,8);assert.ok(g.questions.every(q=>q.knowledgePointId===KP&&q.tableData?.kind==="tabular_pattern_table"));
  const w=buildBatchABrowserWorksheetDocument(request({questionCount:8,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:4,showAnswerKeyPage:true}}));
  assert.equal(w.ok,true,w.errors.join("\n"));assert.equal(w.worksheetDocument.questionCount,8);assert.equal(w.worksheetDocument.answerKeyItems.length,8);assert.equal(w.worksheetDocument.metadata.q005PatternReowned,false);assert.equal(w.worksheetDocument.metadata.q007OrLaterTouched,false);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:"",debugDataAttributes:false});
  assert.equal((html.match(/class="worksheet-tabular-pattern-table"/g)??[]).length,16);assert.ok(html.includes("data-representation=\"tabular-pattern-table\""));assert.ok(html.includes("輸入"));assert.ok(html.includes("輸出"));assert.equal(html.includes("kp_g4a_u07_"),false);assert.equal(html.includes("ps_g4a_u07_"),false);
  const q5=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[PREV[0]],questionMode:"numeric",questionCount:4,generationSeed:"q5-preserve"});
  assert.equal(q5.ok,true,q5.errors.join("\n"));assert.ok(q5.questions.every(x=>x.knowledgePointId===PREV[0]&&x.metadata?.q006OrLaterTouched===false));
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[...PREV,KP],questionMode:"numeric",questionCount:4,generationSeed:"mixed-not-admitted"});
  assert.equal(mixed.ok,false);
});

test("W6 Q006 validation contract stays SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");assert.equal(impact.scopeGuards.sameUnitMixedImplementation,false);assert.equal(validation.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
