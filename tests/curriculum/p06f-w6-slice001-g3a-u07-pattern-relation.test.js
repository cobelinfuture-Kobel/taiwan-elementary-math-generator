import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditG3AU07P06F01Projection,G3A_U07_P06F01_ARITH_KP_ID as ARITH,G3A_U07_P06F01_INCLUDED_RELATIONS as RELATIONS,G3A_U07_P06F01_PROTECTED_Q002_KP_ID as Q002,G3A_U07_P06F01_QUEUE_REQUIRED_CAPABILITY_IDS as QUEUE_CAPS,G3A_U07_P06F01_REPEAT_KP_ID as REPEAT,G3A_U07_P06F01_SOURCE_ID as SRC,G3A_U07_P06F01_SPATIAL_KP_ID as SPATIAL,G3A_U07_P06F01_SPEC_IDS as SPECS,G3A_U07_P06F01_TARGET_KP_IDS as TARGETS} from "../../site/modules/curriculum/registry/g3a-u07-pattern-relation-selector-projection-p06f01.js";
import * as preQ001Selector from "../../site/modules/curriculum/registry/batch-a-selector-p05f63-extension.js";
import {auditP06F01PublicSelectorComposition,getVisibleBatchAKnowledgePoint,getVisiblePatternGroupsForKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource,listVisibleBatchAKnowledgePoints,resolveVisiblePatternSpecIdsForKnowledgePoint} from "../../site/modules/curriculum/registry/batch-a-selector-p06f01-extension.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p06f01.js";
import {buildG3AU07P06F01Question,generateG3AU07P06F01Questions,validateG3AU07P06F01Answer,validateG3AU07P06F01Question} from "../../site/modules/curriculum/batch-a/g3a-u07-pattern-relation-runtime-p06f01.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {getBatchASourceUnit,listBatchASourceUnits} from "../../site/modules/curriculum/batch-a/source-units.js";
const read=p=>JSON.parse(readFileSync(new URL(`../../${p}`,import.meta.url),"utf8"));
const implementation=read("data/curriculum/full-product/p06f/q001-g3a-u07-pattern-implementation.json");
const impact=read("data/project/change-impact/P06F_W6_Q001.impact.json");
const validation=read("data/project/validation-plans/P06F_W6_Q001.validation.json");
const request=(kp,extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[kp],questionMode:"numeric",questionCount:20,generationSeed:`p06f01-${kp}`,...extra});

test("W6 Q001 materializes exactly three source-backed pattern KPs and five PatternSpecs",()=>{
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
  assert.equal(implementation.queueAuthority.queuePosition,1);
  assert.equal(implementation.queueAuthority.queueSliceCount,20);
  assert.deepEqual(implementation.queueAuthority.knowledgePointIds,TARGETS);
  assert.deepEqual(implementation.queueAuthority.requiredW6CapabilityIds,QUEUE_CAPS);
  assert.deepEqual(implementation.productContract.includedRelations,RELATIONS);
  assert.deepEqual(implementation.productContract.patternSpecIds,SPECS);
  assert.deepEqual(auditG3AU07P06F01Projection(),{ok:true,errors:[],counts:{knowledgePoints:3,patternGroups:3,patternSpecs:5,formalMappings:3}});
});

test("W6 Q001 promotes only the three Q001 pattern KPs and keeps Q002 tabular semantics hidden",()=>{
  const before=preQ001Selector.listBatchAKnowledgePointAvailabilityBySource(SRC);
  assert.equal(before,null);
  for(const id of TARGETS)assert.equal(preQ001Selector.getVisibleBatchAKnowledgePoint(id),null);
  assert.equal(preQ001Selector.getVisibleBatchAKnowledgePoint(Q002),null);
  assert.equal(getBatchASourceUnit(SRC)?.title,"尋找規律");
  assert.ok(listBatchASourceUnits({includeW6Slice001:true}).some(x=>x.sourceId===SRC));
  const a=auditP06F01PublicSelectorComposition();
  assert.equal(a.ok,true,a.errors.join("\n"));
  const after=listBatchAKnowledgePointAvailabilityBySource(SRC);
  const visible=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  for(const id of TARGETS){
    assert.ok(visible.includes(id),id);
    assert.ok(getVisibleBatchAKnowledgePoint(id));
    assert.equal(getVisiblePatternGroupsForKnowledgePoint(id).length,1);
    assert.ok(resolveVisiblePatternSpecIdsForKnowledgePoint(id,"numeric").length>=1);
    assert.equal(after.hiddenPendingKnowledgePointIds.includes(id),false);
    assert.equal(after.notSelectableKnowledgePointIds.includes(id),false);
  }
  assert.equal(visible.includes(Q002),false);
  assert.equal(getVisibleBatchAKnowledgePoint(Q002),null);
  assert.ok(after.hiddenPendingKnowledgePointIds.includes(Q002));
  assert.ok(after.notSelectableKnowledgePointIds.includes(Q002));
});

test("W6 Q001 public binding is numeric pattern-only and preserves the Q002 boundary",()=>{
  const a=auditPublicUiCapabilityBinding();
  assert.equal(a.ok,true,a.errors.join("\n"));
  for(const kp of TARGETS){
    const b=resolvePublicUiCapabilityBinding(request(kp));
    assert.equal(b.blocked,false);
    assert.equal(b.questionType,"numeric");
    assert.equal(b.applicationImplementationAllowed,false);
    assert.equal(b.sameUnitMixedAdmission,false);
    assert.equal(b.crossUnitMixedAdmission,false);
    assert.equal(b.patternSequenceReasoningRequired,true);
    assert.equal(b.patternRelationValidationRequired,true);
    assert.equal(b.textNumericRepresentationRequired,true);
    assert.equal(b.symbolicRelationReasoningUsed,false);
    assert.equal(b.tabularPatternRuleReowned,false);
    assert.equal(b.frozenRuntimeProfile,"profile_pattern_relation");
  }
});

for(const patternSpecId of SPECS)test(`W6 Q001 ${patternSpecId} has 240 deterministic unique validated variants`,()=>{
  const a=generateG3AU07P06F01Questions({questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
  const b=generateG3AU07P06F01Questions({questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join("\n"));
  assert.deepEqual(a.questions,b.questions);
  assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){
    assert.equal(validateG3AU07P06F01Question(q).ok,true);
    assert.equal(validateG3AU07P06F01Answer(q,q.answerValue).ok,true);
    assert.equal(q.metadata.tabularPatternRuleReowned,false);
    assert.equal(q.metadata.q002OrLaterTouched,false);
  }
});

test("W6 Q001 validator fails closed for wrong answers, mutated relation payloads and Q002 leakage",()=>{
  const q=buildG3AU07P06F01Question({variant:17,patternSpecId:SPECS[0]});
  assert.equal(validateG3AU07P06F01Question(q).ok,true);
  assert.equal(validateG3AU07P06F01Answer(q,q.answerValue+1).ok,false);
  assert.equal(validateG3AU07P06F01Question({...q,patternRepresentation:{...q.patternRepresentation,difference:q.patternRepresentation.difference+1}}).ok,false);
  assert.equal(validateG3AU07P06F01Question({...q,metadata:{...q.metadata,tabularPatternRuleReowned:true}}).ok,false);
});

test("W6 Q001 browser generator and worksheet route all three KPs through the shared public path",()=>{
  for(const kp of [ARITH,REPEAT,SPATIAL]){
    const p=buildBatchABrowserPlan(request(kp,{questionCount:8}));
    assert.deepEqual(p.selectedKnowledgePointIds,[kp]);
    assert.equal(p.questionCountMax,240);
    assert.equal(p.questionMode,"numeric");
    const g=generateBatchABrowserQuestions(request(kp,{questionCount:8}));
    assert.equal(g.ok,true,g.errors.join("\n"));
    assert.equal(g.questions.length,8);
    assert.ok(g.questions.every(q=>q.knowledgePointId===kp));
    const w=buildBatchABrowserWorksheetDocument(request(kp,{questionCount:8,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:4,showAnswerKeyPage:true}}));
    assert.equal(w.ok,true,w.errors.join("\n"));
    assert.equal(w.worksheetDocument.questionCount,8);
    assert.equal(w.worksheetDocument.answerKeyItems.length,8);
    assert.equal(w.worksheetDocument.metadata.tabularPatternRuleReowned,false);
    assert.equal(w.worksheetDocument.metadata.q002OrLaterTouched,false);
  }
});

test("W6 Q001 validation contract stays SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");
  assert.equal(validation.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);
  assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
