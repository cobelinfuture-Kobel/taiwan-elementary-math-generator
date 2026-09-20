import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditG4AU07P06F13Projection,G4A_U07_P06F13_INCLUDED_RELATIONS as RELATIONS,G4A_U07_P06F13_KP_ID as KP,G4A_U07_P06F13_PATTERN_SPECS as SPECS,G4A_U07_P06F13_PREDECESSOR_KP_IDS as PREV,G4A_U07_P06F13_REQUIRED_CAPABILITY_IDS as REQUIRED,G4A_U07_P06F13_SOURCE_ID as SRC} from "../../site/modules/curriculum/registry/g4a-u07-missing-term-selector-projection-p06f13.js";
import * as preSelector from "../../site/modules/curriculum/registry/batch-a-selector-p06f12-extension.js";
import {auditP06F13PublicSelectorComposition,getVisibleBatchAKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource,listVisibleBatchAKnowledgePoints,resolveVisiblePatternSpecIdsForKnowledgePoint} from "../../site/modules/curriculum/registry/batch-a-selector-p06f13-extension.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p06f13.js";
import {buildG4AU07P06F13Question,generateG4AU07P06F13Questions,validateG4AU07P06F13Answer,validateG4AU07P06F13Question} from "../../site/modules/curriculum/batch-a/g4a-u07-missing-term-runtime-p06f13.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const implementation=read("data/curriculum/full-product/p06f/q013-g4a-u07-missing-term-implementation.json");
const impact=read("data/project/change-impact/P06F_W6_Q013.impact.json");
const plan=read("data/project/validation-plans/P06F_W6_Q013.validation.json");
const request=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"numeric",questionCount:20,generationSeed:"p06f13-focused",...extra});

test("W6 Q013 materializes one missing-term KP with one FormalMapping and two PatternSpecs",()=>{
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
  assert.equal(implementation.queueAuthority.queuePosition,13);
  assert.deepEqual(implementation.queueAuthority.knowledgePointIds,[KP]);
  assert.deepEqual(implementation.productContract.includedRelations,RELATIONS);
  assert.deepEqual(implementation.productContract.patternSpecIds,SPECS.map(x=>x.patternSpecId));
  assert.deepEqual(auditG4AU07P06F13Projection(),{ok:true,errors:[],counts:{knowledgePoints:1,patternGroups:1,patternSpecs:2,formalMappings:1}});
});

test("W6 Q013 promotes the final G4A-U07 candidate and preserves all four predecessors",()=>{
  const before=preSelector.listBatchAKnowledgePointAvailabilityBySource(SRC);
  assert.ok(before);assert.ok(PREV.every(id=>before.visibleKnowledgePointIds.includes(id)));
  assert.equal(preSelector.getVisibleBatchAKnowledgePoint(KP),null);
  assert.ok(before.hiddenPendingKnowledgePointIds.includes(KP));assert.ok(before.notSelectableKnowledgePointIds.includes(KP));
  const a=auditP06F13PublicSelectorComposition();assert.equal(a.ok,true,a.errors.join("\n"));
  const after=listBatchAKnowledgePointAvailabilityBySource(SRC),visible=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  assert.ok(PREV.every(id=>visible.includes(id)));assert.ok(visible.includes(KP));assert.ok(getVisibleBatchAKnowledgePoint(KP));
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(KP,"numeric"),SPECS.map(x=>x.patternSpecId));
  assert.equal(after.hiddenPendingCount,0);assert.equal(after.notSelectableCount,0);assert.equal(after.sameUnitMixedAllowed,false);
  assert.equal(visible.length,5);
});

test("W6 Q013 binding locks bidirectional missing-term semantics",()=>{
  const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join("\n"));
  const b=resolvePublicUiCapabilityBinding(request());
  assert.equal(b.blocked,false);assert.equal(b.questionType,"numeric");assert.equal(b.questionCount.max,240);
  assert.deepEqual(b.requiredCapabilityIds,REQUIRED);assert.equal(b.frozenRuntimeProfile,"profile_pattern_relation");
  assert.equal(b.missingTermReasoningIsCore,true);assert.equal(b.previousAdjacencyRequired,true);assert.equal(b.nextAdjacencyRequired,true);assert.equal(b.bothNeighborConstraintsMustAgree,true);
  assert.equal(b.symbolicRelationReasoningUsed,false);assert.equal(b.q005GeometricPatternReowned,false);assert.equal(b.q005AdditivePatternReowned,false);assert.equal(b.q006InputOutputTableReowned,false);assert.equal(b.q011MultiplicativePatternReowned,false);
  assert.equal(b.sameUnitMixedAdmission,false);assert.equal(b.crossUnitMixedAdmission,false);
});

for(const spec of SPECS)test("W6 Q013 "+spec.patternSpecId+" has 240 deterministic unique validated variants",()=>{
  const a=generateG4AU07P06F13Questions({questionCount:240,patternSpecIds:[spec.patternSpecId],generationSeed:"stable"});
  const b=generateG4AU07P06F13Questions({questionCount:240,patternSpecIds:[spec.patternSpecId],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join("\n"));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){
    assert.equal(validateG4AU07P06F13Question(q).ok,true);assert.equal(validateG4AU07P06F13Answer(q,q.answerValue).ok,true);
    const p=q.patternRepresentation,left=p.terms[p.missingIndex-1],right=p.terms[p.missingIndex+1];
    if(p.ruleFamily==="ADDITIVE"){assert.equal(left+p.step,q.answerValue);assert.equal(q.answerValue+p.step,right);}
    else{assert.equal(left*p.factor,q.answerValue);assert.equal(q.answerValue*p.factor,right);}
  }
});

test("W6 Q013 validator fails closed on either neighbor, answer and predecessor-reownership mutations",()=>{
  const q=buildG4AU07P06F13Question({variant:37,patternSpecId:SPECS[0].patternSpecId});
  assert.equal(validateG4AU07P06F13Question(q).ok,true);assert.equal(validateG4AU07P06F13Answer(q,q.answerValue+1).ok,false);
  const p=q.patternRepresentation,terms=p.terms.map((x,i)=>i===p.missingIndex-1?x+1:x);
  assert.equal(validateG4AU07P06F13Question({...q,patternRepresentation:{...p,terms}}).ok,false);
  assert.equal(validateG4AU07P06F13Question({...q,metadata:{...q.metadata,q005AdditivePatternReowned:true}}).ok,false);
  assert.equal(validateG4AU07P06F13Question({...q,metadata:{...q.metadata,q006InputOutputTableReowned:true}}).ok,false);
  assert.equal(validateG4AU07P06F13Question({...q,metadata:{...q.metadata,q011MultiplicativePatternReowned:true}}).ok,false);
});

test("W6 Q013 shared browser path generates print-safe missing-term worksheets and keeps predecessors reachable",()=>{
  const p=buildBatchABrowserPlan(request({questionCount:8}));assert.deepEqual(p.selectedKnowledgePointIds,[KP]);assert.equal(p.questionCountMax,240);assert.equal(p.sourceUnit.grade,4);
  const g=generateBatchABrowserQuestions(request({questionCount:8}));assert.equal(g.ok,true,g.errors.join("\n"));assert.equal(g.questions.length,8);assert.ok(g.questions.every(q=>q.knowledgePointId===KP&&q.promptText.includes("□")));
  assert.ok(g.questions.some(q=>q.patternRepresentation.ruleFamily==="ADDITIVE"));assert.ok(g.questions.some(q=>q.patternRepresentation.ruleFamily==="MULTIPLICATIVE"));
  const w=buildBatchABrowserWorksheetDocument(request({questionCount:8,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:4,showAnswerKeyPage:true}}));
  assert.equal(w.ok,true,w.errors.join("\n"));assert.equal(w.worksheetDocument.questionCount,8);assert.equal(w.worksheetDocument.answerKeyItems.length,8);
  assert.equal(w.worksheetDocument.metadata.q005AdditivePatternReowned,false);assert.equal(w.worksheetDocument.metadata.q006InputOutputTableReowned,false);assert.equal(w.worksheetDocument.metadata.q011MultiplicativePatternReowned,false);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:"",debugDataAttributes:false});
  assert.ok(html.includes("worksheet-document"));assert.equal(html.includes("kp_g4a_u07_"),false);assert.equal(html.includes("ps_g4a_u07_"),false);
  for(const predecessor of [PREV[1],PREV[2],PREV[3]]){const pg=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[predecessor],questionMode:"numeric",questionCount:4,generationSeed:"q13-preserve-"+predecessor});assert.equal(pg.ok,true,pg.errors.join("\n"));assert.ok(pg.questions.every(x=>x.knowledgePointId===predecessor));}
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[...PREV,KP],questionMode:"numeric",questionCount:4,generationSeed:"mixed-not-admitted"});assert.equal(mixed.ok,false);
});

test("W6 Q013 validation contract stays SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");
  assert.equal(plan.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");assert.deepEqual(plan.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(plan).includes("FULL_REPOSITORY"),false);assert.equal(JSON.stringify(plan).includes("GLOBAL_BROWSER_REPLAY"),false);
});
