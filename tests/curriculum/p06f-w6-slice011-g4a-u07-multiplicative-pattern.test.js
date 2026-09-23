import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditG4AU07P06F11Projection,G4A_U07_P06F11_INCLUDED_RELATIONS as RELATIONS,G4A_U07_P06F11_KP_ID as KP,G4A_U07_P06F11_PATTERN_SPECS as SPECS,G4A_U07_P06F11_PREDECESSOR_KP_IDS as PREV,G4A_U07_P06F11_PROTECTED_FUTURE_KP_IDS as FUTURE,G4A_U07_P06F11_QUEUE_REQUIRED_CAPABILITY_IDS as CAPS,G4A_U07_P06F11_SOURCE_ID as SRC} from "../../site/modules/curriculum/registry/g4a-u07-multiplicative-pattern-selector-projection-p06f11.js";
import * as preSelector from "../../site/modules/curriculum/registry/batch-a-selector-p06f10-extension.js";
import {auditP06F11PublicSelectorComposition,getVisibleBatchAKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource,listVisibleBatchAKnowledgePoints,resolveVisiblePatternSpecIdsForKnowledgePoint} from "../../site/modules/curriculum/registry/batch-a-selector-p06f11-extension.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p06f11.js";
import {buildG4AU07P06F11Question,generateG4AU07P06F11Questions,validateG4AU07P06F11Answer,validateG4AU07P06F11Question} from "../../site/modules/curriculum/batch-a/g4a-u07-multiplicative-pattern-runtime-p06f11.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
const read=p=>JSON.parse(readFileSync(new URL(`../../${p}`,import.meta.url),"utf8"));
const implementation=read("data/curriculum/full-product/p06f/q011-g4a-u07-multiplicative-pattern-implementation.json");
const impact=read("data/project/change-impact/P06F_W6_Q011.impact.json");
const validation=read("data/project/validation-plans/P06F_W6_Q011.validation.json");
const request=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"numeric",questionCount:20,generationSeed:"p06f11-focused",...extra});

test("W6 Q011 materializes one multiplicative-pattern KP with one FormalMapping and two PatternSpecs",()=>{
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
  assert.equal(implementation.queueAuthority.queuePosition,11);
  assert.deepEqual(implementation.queueAuthority.knowledgePointIds,[KP]);
  assert.deepEqual(implementation.queueAuthority.requiredW6CapabilityIds,CAPS);
  assert.deepEqual(implementation.productContract.includedRelations,RELATIONS);
  assert.deepEqual(implementation.productContract.patternSpecIds,SPECS.map(x=>x.patternSpecId));
  assert.deepEqual(auditG4AU07P06F11Projection(),{ok:true,errors:[],counts:{knowledgePoints:1,patternGroups:1,patternSpecs:2,formalMappings:1}});
});

test("W6 Q011 promotes only multiplicative pattern while preserving Q005/Q006 and hiding Q013",()=>{
  const before=preSelector.listBatchAKnowledgePointAvailabilityBySource(SRC);
  assert.ok(before);
  assert.ok(PREV.every(id=>before.visibleKnowledgePointIds.includes(id)));
  assert.equal(preSelector.getVisibleBatchAKnowledgePoint(KP),null);
  assert.ok(before.hiddenPendingKnowledgePointIds.includes(KP));
  assert.ok(before.notSelectableKnowledgePointIds.includes(KP));
  assert.ok(FUTURE.every(id=>before.hiddenPendingKnowledgePointIds.includes(id)&&before.notSelectableKnowledgePointIds.includes(id)));
  const a=auditP06F11PublicSelectorComposition();assert.equal(a.ok,true,a.errors.join("\n"));
  const after=listBatchAKnowledgePointAvailabilityBySource(SRC),visible=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  assert.ok(PREV.every(id=>visible.includes(id)));
  assert.ok(visible.includes(KP));
  assert.ok(getVisibleBatchAKnowledgePoint(KP));
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(KP,"numeric"),SPECS.map(x=>x.patternSpecId));
  assert.equal(after.hiddenPendingKnowledgePointIds.includes(KP),false);
  assert.equal(after.notSelectableKnowledgePointIds.includes(KP),false);
  assert.ok(FUTURE.every(id=>!visible.includes(id)&&getVisibleBatchAKnowledgePoint(id)==null&&after.hiddenPendingKnowledgePointIds.includes(id)&&after.notSelectableKnowledgePointIds.includes(id)));
  assert.equal(after.sameUnitMixedAllowed,false);
});

test("W6 Q011 binding locks exact multiplicative-pattern capability and scope",()=>{
  const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join("\n"));
  const b=resolvePublicUiCapabilityBinding(request());
  assert.equal(b.blocked,false);assert.equal(b.questionType,"numeric");assert.equal(b.questionCount.max,240);
  assert.deepEqual(b.requiredCapabilityIds,CAPS);assert.equal(b.frozenRuntimeProfile,"profile_pattern_relation");
  assert.equal(b.patternSequenceReasoningRequired,true);assert.equal(b.patternRelationValidationRequired,true);assert.equal(b.textNumericRepresentationRequired,true);
  assert.equal(b.fixedMultiplicativeFactorRequired,true);assert.equal(b.constantAdjacentRatioRequired,true);assert.equal(b.multiplicativeGrowthOrShrinkAllowed,true);
  assert.equal(b.symbolicRelationReasoningUsed,false);assert.equal(b.q005GeometricPatternReowned,false);assert.equal(b.q005AdditivePatternReowned,false);assert.equal(b.q006InputOutputTableReowned,false);assert.equal(b.q013MissingTermReasoningReowned,false);assert.equal(b.q012OrLaterTouched,false);
  assert.equal(b.sameUnitMixedAdmission,false);assert.equal(b.crossUnitMixedAdmission,false);
});

for(const spec of SPECS)test(`W6 Q011 ${spec.patternSpecId} has 240 deterministic unique validated variants`,()=>{
  const a=generateG4AU07P06F11Questions({questionCount:240,patternSpecIds:[spec.patternSpecId],generationSeed:"stable"});
  const b=generateG4AU07P06F11Questions({questionCount:240,patternSpecIds:[spec.patternSpecId],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join("\n"));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){
    assert.equal(validateG4AU07P06F11Question(q).ok,true);assert.equal(validateG4AU07P06F11Answer(q,q.answerValue).ok,true);
    assert.equal(q.patternRepresentation.factor>=2&&q.patternRepresentation.factor<=5,true);
    assert.equal(["GROW","SHRINK"].includes(q.patternRepresentation.direction),true);
    assert.equal(q.metadata.q005GeometricPatternReowned,false);assert.equal(q.metadata.q005AdditivePatternReowned,false);assert.equal(q.metadata.q006InputOutputTableReowned,false);assert.equal(q.metadata.q013MissingTermReasoningReowned,false);
  }
});

test("W6 Q011 validator fails closed on ratio mutation, wrong answer and future/predecessor leakage",()=>{
  const q=buildG4AU07P06F11Question({variant:17,patternSpecId:SPECS[1].patternSpecId});
  assert.equal(validateG4AU07P06F11Question(q).ok,true);assert.equal(validateG4AU07P06F11Answer(q,q.answerValue+1).ok,false);
  const terms=q.patternRepresentation.terms.map((x,i)=>i===1?x+1:x);
  assert.equal(validateG4AU07P06F11Question({...q,patternRepresentation:{...q.patternRepresentation,terms}}).ok,false);
  assert.equal(validateG4AU07P06F11Question({...q,metadata:{...q.metadata,q005AdditivePatternReowned:true}}).ok,false);
  assert.equal(validateG4AU07P06F11Question({...q,metadata:{...q.metadata,q006InputOutputTableReowned:true}}).ok,false);
  assert.equal(validateG4AU07P06F11Question({...q,metadata:{...q.metadata,q013MissingTermReasoningReowned:true}}).ok,false);
});

test("W6 Q011 shared browser path generates print-safe multiplicative worksheets and preserves predecessors",()=>{
  const p=buildBatchABrowserPlan(request({questionCount:8}));assert.deepEqual(p.selectedKnowledgePointIds,[KP]);assert.equal(p.questionCountMax,240);assert.equal(p.sourceUnit.grade,4);
  const g=generateBatchABrowserQuestions(request({questionCount:8}));assert.equal(g.ok,true,g.errors.join("\n"));assert.equal(g.questions.length,8);assert.ok(g.questions.every(q=>q.knowledgePointId===KP&&q.patternRepresentation?.factor>=2));
  assert.ok(g.questions.some(q=>q.patternRepresentation.direction==="GROW"));assert.ok(g.questions.some(q=>q.patternRepresentation.direction==="SHRINK"));
  const w=buildBatchABrowserWorksheetDocument(request({questionCount:8,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:4,showAnswerKeyPage:true}}));
  assert.equal(w.ok,true,w.errors.join("\n"));assert.equal(w.worksheetDocument.questionCount,8);assert.equal(w.worksheetDocument.answerKeyItems.length,8);
  assert.equal(w.worksheetDocument.metadata.q005AdditivePatternReowned,false);assert.equal(w.worksheetDocument.metadata.q006InputOutputTableReowned,false);assert.equal(w.worksheetDocument.metadata.q013MissingTermReasoningReowned,false);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:"",debugDataAttributes:false});
  assert.ok(html.includes("worksheet-document"));assert.equal(html.includes("kp_g4a_u07_"),false);assert.equal(html.includes("ps_g4a_u07_"),false);
  const q5=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[PREV[1]],questionMode:"numeric",questionCount:4,generationSeed:"q5-preserve"});
  assert.equal(q5.ok,true,q5.errors.join("\n"));assert.ok(q5.questions.every(x=>x.knowledgePointId===PREV[1]));
  const q6=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[PREV[2]],questionMode:"numeric",questionCount:4,generationSeed:"q6-preserve"});
  assert.equal(q6.ok,true,q6.errors.join("\n"));assert.ok(q6.questions.every(x=>x.knowledgePointId===PREV[2]));
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[...PREV,KP],questionMode:"numeric",questionCount:4,generationSeed:"mixed-not-admitted"});
  assert.equal(mixed.ok,false);
});

test("W6 Q011 validation contract stays SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");
  assert.equal(validation.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
