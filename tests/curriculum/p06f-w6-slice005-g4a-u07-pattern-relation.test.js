import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditG4AU07P06F05Projection,G4A_U07_P06F05_ADDITIVE_KP_ID as ADD_KP,G4A_U07_P06F05_GEOMETRIC_KP_ID as GEO_KP,G4A_U07_P06F05_INCLUDED_RELATIONS as RELATIONS,G4A_U07_P06F05_PATTERN_SPECS as SPECS,G4A_U07_P06F05_PROTECTED_FUTURE_KP_IDS as FUTURE,G4A_U07_P06F05_QUEUE_REQUIRED_CAPABILITY_IDS as QUEUE_CAPS,G4A_U07_P06F05_SOURCE_ID as SRC,G4A_U07_P06F05_TARGET_KP_IDS as KPS} from "../../site/modules/curriculum/registry/g4a-u07-pattern-relation-selector-projection-p06f05.js";
import * as preQ005Selector from "../../site/modules/curriculum/registry/batch-a-selector-p06f04-extension.js";
import {auditP06F05PublicSelectorComposition,getVisibleBatchAKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource,listVisibleBatchAKnowledgePoints,resolveVisiblePatternSpecIdsForKnowledgePoint} from "../../site/modules/curriculum/registry/batch-a-selector-p06f05-extension.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p06f05.js";
import {buildG4AU07P06F05Question,generateG4AU07P06F05Questions,validateG4AU07P06F05Answer,validateG4AU07P06F05Question} from "../../site/modules/curriculum/batch-a/g4a-u07-pattern-relation-runtime-p06f05.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {getBatchASourceUnit,isBatchASourceId,listBatchASourceUnits} from "../../site/modules/curriculum/batch-a/source-units.js";

const read=p=>JSON.parse(readFileSync(new URL(`../../${p}`,import.meta.url),"utf8"));
const implementation=read("data/curriculum/full-product/p06f/q005-g4a-u07-pattern-implementation.json");
const impact=read("data/project/change-impact/P06F_W6_Q005.impact.json");
const validation=read("data/project/validation-plans/P06F_W6_Q005.validation.json");
const request=(kp,extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[kp],questionMode:"numeric",questionCount:20,generationSeed:`p06f05-${kp}`,...extra});

test("W6 Q005 materializes exactly two source-backed G4A-U07 pattern KPs",()=>{
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
  assert.equal(implementation.queueAuthority.queuePosition,5);
  assert.deepEqual(implementation.queueAuthority.knowledgePointIds,KPS);
  assert.deepEqual(implementation.queueAuthority.requiredW6CapabilityIds,QUEUE_CAPS);
  assert.deepEqual(implementation.productContract.includedRelations,RELATIONS);
  assert.deepEqual(implementation.productContract.patternSpecIds,SPECS.map(x=>x.patternSpecId));
  assert.deepEqual(auditG4AU07P06F05Projection(),{ok:true,errors:[],counts:{knowledgePoints:2,patternGroups:2,patternSpecs:2,formalMappings:2}});
  assert.equal(implementation.semanticProfileLock.geometricArrangementIsGeometryPropertyCore,false);
});

test("W6 Q005 adds the source and promotes only Q005 targets while future same-source KPs remain hidden",()=>{
  assert.equal(preQ005Selector.getVisibleBatchAKnowledgePoint(GEO_KP),null);
  assert.equal(preQ005Selector.getVisibleBatchAKnowledgePoint(ADD_KP),null);
  const a=auditP06F05PublicSelectorComposition();
  assert.equal(a.ok,true,a.errors.join("\n"));
  const after=listBatchAKnowledgePointAvailabilityBySource(SRC);
  const visible=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  assert.deepEqual(visible,KPS);
  assert.ok(KPS.every(id=>getVisibleBatchAKnowledgePoint(id)&&!after.hiddenPendingKnowledgePointIds.includes(id)&&!after.notSelectableKnowledgePointIds.includes(id)));
  assert.ok(FUTURE.every(id=>!visible.includes(id)&&getVisibleBatchAKnowledgePoint(id)==null&&after.hiddenPendingKnowledgePointIds.includes(id)&&after.notSelectableKnowledgePointIds.includes(id)));
  assert.equal(after.sameUnitMixedAllowed,false);
  assert.ok(KPS.every(kp=>resolveVisiblePatternSpecIdsForKnowledgePoint(kp,"numeric").length===1));
  assert.equal(isBatchASourceId(SRC),true);
  assert.equal(getBatchASourceUnit(SRC)?.title,"數量關係與規律");
  assert.ok(listBatchASourceUnits({includeW6Slice005:true}).some(x=>x.sourceId===SRC));
});

test("W6 Q005 public bindings are pattern-only and fail closed for future semantics",()=>{
  const a=auditPublicUiCapabilityBinding();
  assert.equal(a.ok,true,a.errors.join("\n"));
  for(const kp of KPS){
    const b=resolvePublicUiCapabilityBinding(request(kp));
    assert.equal(b.blocked,false);
    assert.equal(b.questionType,"numeric");
    assert.equal(b.questionCount.max,240);
    assert.equal(b.applicationImplementationAllowed,false);
    assert.equal(b.patternSequenceReasoningRequired,true);
    assert.equal(b.patternRelationValidationRequired,true);
    assert.equal(b.textNumericRepresentationRequired,true);
    assert.equal(b.symbolicRelationReasoningUsed,false);
    assert.equal(b.geometryPropertyReasoningUsed,false);
    assert.equal(b.inputOutputTableRuleReowned,false);
    assert.equal(b.multiplicativePatternReowned,false);
    assert.equal(b.missingTermReasoningReowned,false);
    assert.equal(b.q006OrLaterTouched,false);
    assert.equal(b.sameUnitMixedAdmission,false);
    assert.equal(b.crossUnitMixedAdmission,false);
    assert.equal(b.frozenRuntimeProfile,"profile_pattern_relation");
  }
});

for(const spec of SPECS)test(`W6 Q005 ${spec.patternSpecId} has 240 deterministic unique validated variants`,()=>{
  const a=generateG4AU07P06F05Questions({knowledgePointId:spec.knowledgePointId,questionCount:240,patternSpecIds:[spec.patternSpecId],generationSeed:"stable"});
  const b=generateG4AU07P06F05Questions({knowledgePointId:spec.knowledgePointId,questionCount:240,patternSpecIds:[spec.patternSpecId],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join("\n"));
  assert.deepEqual(a.questions,b.questions);
  assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){
    assert.equal(validateG4AU07P06F05Question(q).ok,true);
    assert.equal(validateG4AU07P06F05Answer(q,q.answerValue).ok,true);
    assert.equal(q.metadata.geometryPropertyReasoningUsed,false);
    assert.equal(q.metadata.q006OrLaterTouched,false);
    if(q.knowledgePointId===GEO_KP)assert.equal(q.patternRepresentation.kind,"GEOMETRIC_ARRANGEMENT_STAGE_COUNT");
    else assert.equal(q.patternRepresentation.kind,"FIXED_ADDITIVE_QUANTITY_PATTERN");
  }
});

test("W6 Q005 validator fails closed on pattern mutation, wrong answers and future-KP leakage",()=>{
  const geo=buildG4AU07P06F05Question({variant:17,patternSpecId:SPECS.find(x=>x.knowledgePointId===GEO_KP).patternSpecId});
  assert.equal(validateG4AU07P06F05Answer(geo,geo.answerValue+1).ok,false);
  assert.equal(validateG4AU07P06F05Question({...geo,patternRepresentation:{...geo.patternRepresentation,targetStage:geo.patternRepresentation.targetStage+1}}).ok,false);
  const add=buildG4AU07P06F05Question({variant:29,patternSpecId:SPECS.find(x=>x.knowledgePointId===ADD_KP).patternSpecId});
  assert.equal(validateG4AU07P06F05Question({...add,patternRepresentation:{...add.patternRepresentation,difference:add.patternRepresentation.difference+1}}).ok,false);
  assert.equal(validateG4AU07P06F05Question({...add,metadata:{...add.metadata,inputOutputTableRuleReowned:true}}).ok,false);
  assert.equal(validateG4AU07P06F05Question({...add,metadata:{...add.metadata,geometryPropertyReasoningUsed:true}}).ok,false);
});

test("W6 Q005 shared browser path generates worksheet and print-safe HTML for both KPs",()=>{
  for(const kp of KPS){
    const p=buildBatchABrowserPlan(request(kp,{questionCount:8}));
    assert.deepEqual(p.selectedKnowledgePointIds,[kp]);
    assert.equal(p.questionCountMax,240);
    assert.equal(p.sourceUnit.grade,4);
    const g=generateBatchABrowserQuestions(request(kp,{questionCount:8}));
    assert.equal(g.ok,true,g.errors.join("\n"));
    assert.equal(g.questions.length,8);
    assert.ok(g.questions.every(q=>q.knowledgePointId===kp));
    const w=buildBatchABrowserWorksheetDocument(request(kp,{questionCount:8,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:4,showAnswerKeyPage:true}}));
    assert.equal(w.ok,true,w.errors.join("\n"));
    assert.equal(w.worksheetDocument.questionCount,8);
    assert.equal(w.worksheetDocument.answerKeyItems.length,8);
    assert.equal(w.worksheetDocument.metadata.geometryPropertyReasoningUsed,false);
    assert.equal(w.worksheetDocument.metadata.q006OrLaterTouched,false);
    const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""});
    assert.ok(html.includes("worksheet-document"));
    assert.equal(html.includes("kp_g4a_u07_"),false);
    assert.equal(html.includes("ps_g4a_u07_"),false);
  }
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:KPS,questionMode:"numeric",questionCount:4,generationSeed:"mixed-not-admitted"});
  assert.equal(mixed.ok,false);
});

test("W6 Q005 validation contract stays SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");
  assert.equal(impact.scopeGuards.sameUnitMixedImplementation,false);
  assert.equal(validation.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);
  assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
