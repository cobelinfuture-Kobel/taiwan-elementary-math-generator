import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  G6A_U09_P08F16_FORMAL_MAPPINGS as MAPS,
  G6A_U09_P08F16_PATTERN_GROUPS as GROUPS,
  G6A_U09_P08F16_PATTERN_SPECS as SPECS,
  G6A_U09_P08F16_SCALE_DRAWING_KP_ID as DRAW_KP,
  G6A_U09_P08F16_SIMILAR_ANGLE_KP_ID as ANGLE_KP,
  G6A_U09_P08F16_SOURCE_ID as SRC,
  G6A_U09_P08F16_TARGET_KP_IDS as TARGETS,
  auditG6AU09P08F16Projection
} from "../../site/modules/curriculum/registry/g6a-u09-scale-drawing-similarity-selector-projection-p08f16.js";
import {generateG6AU09P08F16Questions,validateG6AU09P08F16Question,validateG6AU09P08F16Answer} from "../../site/modules/curriculum/batch-a/g6a-u09-scale-drawing-similarity-runtime-p08f16.js";
import {requestsP08F16,buildBatchABrowserPlan} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p08f16.js";
import {buildBatchABrowserWorksheetDocument as buildQ016} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p08f16-extension.js";
import {buildBatchABrowserWorksheetDocument as buildCurrent} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const implementation=read("data/curriculum/full-product/p08f/q016-g6a-u09-scale-drawing-similarity-implementation.json");
const preflight=read("data/curriculum/full-product/p08f/q016-g6a-u09-scale-drawing-similar-angle-source-authority-preflight.json");
const impact=read("data/project/change-impact/P08F_W8_Q016.impact.json");
const plan=read("data/project/validation-plans/P08F_W8_Q016.validation.json");
const specById=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const specsFor=kp=>SPECS.filter(x=>x.knowledgePointId===kp).map(x=>x.patternSpecId);
const req=(kp,count=8)=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[kp],selectedPatternGroupIds:[GROUPS.find(x=>x.primaryKnowledgePointId===kp).patternGroupId],patternSpecIds:specsFor(kp),questionMode:"diagram",requestedQuestionType:"diagram",questionCount:count,generationSeed:"p08f16-test-"+kp,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:3,showAnswerKeyPage:true}});
const occ=(s,t)=>s.split(t).length-1;
const same=(a,b)=>Math.abs(Number(a)-Number(b))<1e-9;

test("Q016 materializes exact two-KP preflight with eight bounded PatternSpecs",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(implementation.preflight.mergeSha,"4853edb26aee5f0ae0b87d291f8422b3981f9c6f");
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
  assert.equal(implementation.queueAuthority.queuePosition,16);
  assert.deepEqual(implementation.queueAuthority.knowledgePointIds,TARGETS);
  assert.equal(MAPS.length,2);assert.equal(GROUPS.length,2);assert.equal(SPECS.length,8);
  assert.equal(new Set(SPECS.map(x=>x.patternSpecId)).size,8);
  assert.equal(auditG6AU09P08F16Projection().ok,true);
  for(const kp of TARGETS){
    assert.equal(specsFor(kp).length,4);
    assert.equal(requestsP08F16(req(kp)),true);
    assert.equal(requestsP08F16({...req(kp),selectionMode:"sourceUnit"}),false);
    assert.equal(requestsP08F16({...req(kp),selectedKnowledgePointIds:TARGETS}),false);
    const p=buildBatchABrowserPlan(req(kp));
    assert.equal(p.questionCountMax,240);assert.equal(p.genericFallback,false);assert.deepEqual(p.selectedKnowledgePointIds,[kp]);
  }
});

test("Q016 every PatternSpec yields 240 deterministic distinct learner-visible variants",()=>{
  for(const spec of SPECS){
    const options={knowledgePointId:spec.knowledgePointId,patternSpecIds:[spec.patternSpecId],questionCount:240,generationSeed:"p08f16-"+spec.patternSpecId};
    const a=generateG6AU09P08F16Questions(options),b=generateG6AU09P08F16Questions(options);
    assert.equal(a.ok,true,spec.patternSpecId+":"+a.errors.join("\n"));
    assert.deepEqual(a.questions,b.questions);
    assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
    assert.equal(new Set(a.questions.map(q=>q.promptText+"|"+q.answerText+"|"+JSON.stringify(q.geometryDiagram))).size,240);
    assert.ok(a.questions.every(q=>validateG6AU09P08F16Question(q).ok));
    const tampered=JSON.parse(JSON.stringify(a.questions[0]));tampered.answerText="錯誤答案";
    assert.equal(validateG6AU09P08F16Question(tampered).ok,false);
  }
});

test("Q016 scale drawing applies one positive nonzero factor to every corresponding offset",()=>{
  const r=generateG6AU09P08F16Questions({knowledgePointId:DRAW_KP,questionCount:240,generationSeed:"q016-drawing-semantics"});
  assert.equal(r.ok,true,r.errors.join("\n"));
  let construction=0,missing=0,verify=0;
  for(const q of r.questions){
    const p=q.patternRepresentation,a=p.anchor;
    assert.ok(p.factor>0);
    for(let i=0;i<p.sourcePoints.length;i++){
      const s=p.sourcePoints[i],t=p.targetPoints[i];
      assert.ok(same(t.x,a.x+(s.x-a.x)*p.factor));
      assert.ok(same(t.y,a.y+(s.y-a.y)*p.factor));
    }
    const mode=specById.get(q.patternSpecId).representationMode;
    if(mode==="CONSTRUCT"){construction++;assert.equal(q.answerText,"作圖如圖");assert.equal(validateG6AU09P08F16Answer(q,"作圖如圖").ok,true);}
    if(mode==="MISSING_VERTEX"){missing++;assert.equal(validateG6AU09P08F16Answer(q,q.answerText).ok,true);}
    if(mode==="VERIFY_SCALE"){verify++;assert.equal(validateG6AU09P08F16Answer(q,q.answerText).ok,true);}
  }
  assert.ok(construction>0&&missing>0&&verify>0);
});

test("Q016 similar-shape routes preserve corresponding angles and parallel relations",()=>{
  const r=generateG6AU09P08F16Questions({knowledgePointId:ANGLE_KP,questionCount:240,generationSeed:"q016-angle-semantics"});
  assert.equal(r.ok,true,r.errors.join("\n"));
  let numeric=0,label=0,parallel=0,verify=0;
  for(const q of r.questions){
    const mode=specById.get(q.patternSpecId).representationMode;
    if(mode==="ANGLE_VALUE"){numeric++;assert.equal(q.answerUnit,"degree");assert.equal(validateG6AU09P08F16Answer(q,q.answerText).ok,true);}
    if(mode==="ANGLE_LABEL"){label++;assert.equal(q.answerUnit,"angle_label");assert.equal(validateG6AU09P08F16Answer(q,q.answerText).ok,true);}
    if(mode==="PARALLEL"){parallel++;assert.equal(q.answerUnit,"boolean");assert.equal(validateG6AU09P08F16Answer(q,q.answerText).ok,true);}
    if(mode==="SIMILAR_VERIFY"){verify++;assert.equal(q.answerUnit,"boolean");assert.equal(validateG6AU09P08F16Answer(q,q.answerText).ok,true);}
    assert.equal(q.geometryDiagram.sourceBackedScaleTransformation,true);
  }
  assert.ok(numeric>0&&label>0&&parallel>0&&verify>0);
});

test("Q016 worksheets render both learner-facing routes with answer-key solution diagrams",()=>{
  for(const kp of TARGETS){
    const r=buildQ016(req(kp,8));
    assert.equal(r.ok,true,r.errors.join("\n"));
    assert.equal(r.worksheetDocument.questionCount,8);
    assert.equal(r.worksheetDocument.answerKeyItems.length,8);
    assert.equal(r.worksheetDocument.questionPages.length,2);
    assert.equal(r.worksheetDocument.answerKeyPages.length,2);
    const html=renderWorksheetDocumentToHtml(r.worksheetDocument,{stylesheetHref:"",title:r.worksheetDocument.title,debugDataAttributes:false});
    assert.equal(occ(html,'data-representation="scale-drawing-similarity-diagram"'),16);
    assert.equal(html.includes("kp_g6a_u09_"),false);
    assert.equal(html.includes("ps_g6a_u09_"),false);
    const current=buildCurrent(req(kp,8));
    assert.equal(current.ok,true,current.errors.join("\n"));
    assert.equal(current.p08f16Implemented,true);
  }
});

test("Q016 current selector and binding promote both remaining G6A-U09 KPs without losing prior owners",async()=>{
  globalThis.document={};
  try{
    const selector=await import("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js?p08f16="+Date.now());
    const binding=await import("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js?p08f16="+Date.now());
    const prior=["kp_g6a_u09_scale_factor_length","kp_g6a_u09_scale_area_change","kp_g6a_u09_map_scale_distance"];
    for(const id of [...prior,...TARGETS])assert.equal(selector.getVisibleBatchAKnowledgePoint(id)?.sourceId,SRC,id);
    const s=selector.listBatchAKnowledgePointAvailabilityBySource(SRC);
    for(const id of TARGETS){assert.equal(s.hiddenPendingKnowledgePointIds.includes(id),false);assert.equal(s.notSelectableKnowledgePointIds.includes(id),false);}
    assert.equal(s.sameSourceCandidateSetComplete,true);assert.equal(s.sameUnitMixedAllowed,false);
    const draw=binding.resolvePublicUiCapabilityBinding(req(DRAW_KP));
    assert.equal(draw.scaleDrawingConstructionRequired,true);assert.equal(draw.boundedGridConstructionRequired,true);assert.deepEqual(draw.appliedRuntimeModifierIds,["mod_geometry_construction"]);
    const angle=binding.resolvePublicUiCapabilityBinding(req(ANGLE_KP));
    assert.equal(angle.similarShapeAngleReasoningRequired,true);assert.equal(angle.correspondingAnglePreservationRequired,true);assert.equal(angle.parallelRelationPreservationRequired,true);assert.deepEqual(angle.appliedRuntimeModifierIds,[]);
  }finally{delete globalThis.document;}
});

test("Q016 focused validation and ownership guards remain bounded",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");
  assert.equal(impact.changeImpact.legalRouteSemanticsChanged,false);
  assert.equal(plan.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.deepEqual(plan.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.deepEqual(plan.forbidden,["FULL_NODE_REGRESSION","GLOBAL_BROWSER_REPLAY"]);
  assert.equal(implementation.validation.fullRepositoryRegression,"FORBIDDEN");
  assert.equal(implementation.validation.globalBrowserReplay,"FORBIDDEN");
  for(const v of Object.values(implementation.ownershipGuard))assert.equal(v,false);
});
