import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditG6AU09P08F14Projection,G6A_U09_P08F14_FORMAL_MAPPING as MAP,G6A_U09_P08F14_KP_ID as KP,G6A_U09_P08F14_PATTERN_GROUP as GROUP,G6A_U09_P08F14_PATTERN_SPECS as SPECS,G6A_U09_P08F14_PRIOR_KP_IDS as PRIOR,G6A_U09_P08F14_FUTURE_KP_IDS as FUTURE,G6A_U09_P08F14_SOURCE_ID as SRC,G6A_U09_P08F14_SPEC_IDS as SPEC_IDS} from "../../site/modules/curriculum/registry/g6a-u09-map-scale-distance-selector-projection-p08f14.js";
import {generateG6AU09P08F14Questions,validateG6AU09P08F14Question,validateG6AU09P08F14Answer} from "../../site/modules/curriculum/batch-a/g6a-u09-map-scale-distance-runtime-p08f14.js";
import {requestsP08F14,buildBatchABrowserPlan} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p08f14.js";
import {buildBatchABrowserWorksheetDocument as buildQ014} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p08f14-extension.js";
import {buildBatchABrowserWorksheetDocument as buildCurrent} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const implementation=read("data/curriculum/full-product/p08f/q014-g6a-u09-map-scale-distance-implementation.json");
const preflight=read("data/curriculum/full-product/p08f/q014-g6a-u09-map-scale-distance-source-authority-preflight.json");
const impact=read("data/project/change-impact/P08F_W8_Q014.impact.json");
const plan=read("data/project/validation-plans/P08F_W8_Q014.validation.json");
const req=(count=16)=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],selectedPatternGroupIds:[GROUP.patternGroupId],patternSpecIds:SPEC_IDS,questionMode:"diagram",requestedQuestionType:"diagram",questionCount:count,generationSeed:"p08f14-test",includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:3,showAnswerKeyPage:true}});
const occ=(s,t)=>s.split(t).length-1;

test("Q014 materializes exact preflight mapping and four relation-exact PatternSpecs",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(implementation.preflightMergeSha,"2092fc935a17ae4a47e84e0e6c5ca4599eec4624");
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
  assert.equal(implementation.queueAuthority.queuePosition,14);
  assert.deepEqual(implementation.queueAuthority.knowledgePointIds,[KP]);
  assert.equal(MAP.r04MappingId,"r04map_g6a_u09_map_scale_distance");
  assert.equal(MAP.semanticCore,"FIXED_MAP_SCALE_RATIO_FROM_MAP_DISTANCE_TO_ACTUAL_DISTANCE_WITH_UNIT_NORMALIZATION");
  assert.equal(MAP.mapToActualDirectionOnly,true);
  assert.equal(MAP.reverseActualToMapAllowed,false);
  assert.equal(MAP.unsupportedUnitPairsFailClosed,true);
  assert.equal(auditG6AU09P08F14Projection().ok,true);
  assert.equal(SPECS.length,4);
  assert.equal(new Set(SPEC_IDS).size,4);
  assert.equal(requestsP08F14(req()),true);
  assert.equal(requestsP08F14({...req(),selectionMode:"sourceUnit"}),false);
  assert.equal(requestsP08F14({...req(),selectedKnowledgePointIds:[KP,PRIOR[0]]}),false);
  const p=buildBatchABrowserPlan(req());
  assert.equal(p.questionCountMax,240);
  assert.equal(p.genericFallback,false);
});

test("Q014 every PatternSpec yields 240 deterministic distinct learner-visible variants",()=>{
  for(const id of SPEC_IDS){
    const a=generateG6AU09P08F14Questions({knowledgePointId:KP,patternSpecIds:[id],questionCount:240,generationSeed:id});
    const b=generateG6AU09P08F14Questions({knowledgePointId:KP,patternSpecIds:[id],questionCount:240,generationSeed:id});
    assert.equal(a.ok,true,id+":"+a.errors.join("\n"));
    assert.deepEqual(a.questions,b.questions);
    assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
    assert.equal(new Set(a.questions.map(q=>q.promptText+"|"+q.answerText+"|"+q.geometryDiagram.diagramMode+"|"+q.geometryDiagram.mapDistanceCm+"|"+q.geometryDiagram.scaleDenominator)).size,240);
    assert.ok(a.questions.every(q=>validateG6AU09P08F14Question(q).ok));
    const t=JSON.parse(JSON.stringify(a.questions[0]));
    t.answerText="999 公里";
    assert.equal(validateG6AU09P08F14Question(t).ok,false);
  }
});

test("Q014 bounded unit normalization and scale-bar relations fail closed",()=>{
  const r=generateG6AU09P08F14Questions({knowledgePointId:KP,questionCount:240,generationSeed:"q014-semantics"});
  assert.equal(r.ok,true,r.errors.join("\n"));
  let bars=0;
  for(const q of r.questions){
    const p=q.patternRepresentation;
    assert.equal(p.mapDistanceUnit,"cm");
    assert.equal(p.actualCm,p.mapDistanceCm*p.scaleDenominator);
    assert.ok(["m","km"].includes(p.actualTargetUnit));
    assert.equal(p.actualValue,p.actualCm/p.normalizationDivisor);
    assert.equal(validateG6AU09P08F14Answer(q,q.answerText).ok,true);
    assert.equal(validateG6AU09P08F14Answer(q,String(q.answerValue)+" 公分").ok,false);
    if(p.sourceScaleBarUsed){bars++;assert.equal(p.actualValue,p.scaleBarValueKm*p.scaleBarSegmentCount);}
  }
  assert.ok(bars>0);
});

test("Q014 worksheet current bridge and renderer preserve prior owners and future hidden owners",async()=>{
  const r=buildQ014(req());
  assert.equal(r.ok,true,r.errors.join("\n"));
  assert.equal(r.worksheetDocument.questionCount,16);
  assert.equal(r.worksheetDocument.answerKeyItems.length,16);
  const html=renderWorksheetDocumentToHtml(r.worksheetDocument,{stylesheetHref:"",title:r.worksheetDocument.title,debugDataAttributes:false});
  assert.equal(occ(html,'data-representation="map-scale-distance-diagram"'),32);
  assert.equal(html.includes("kp_g6a_u09_"),false);
  assert.equal(html.includes("ps_g6a_u09_"),false);
  const current=buildCurrent(req(8));
  assert.equal(current.ok,true,current.errors.join("\n"));
  assert.equal(current.p08f14Implemented,true);
  globalThis.document={};
  try{
    const selector=await import("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js?p08f14="+Date.now());
    const binding=await import("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js?p08f14="+Date.now());
    for(const id of [...PRIOR,KP])assert.equal(selector.getVisibleBatchAKnowledgePoint(id)?.sourceId,SRC,id);
    const s=selector.listBatchAKnowledgePointAvailabilityBySource(SRC);
    for(const id of FUTURE){assert.ok(s.hiddenPendingKnowledgePointIds.includes(id));assert.ok(s.notSelectableKnowledgePointIds.includes(id));assert.equal(selector.getVisibleBatchAKnowledgePoint(id),null);}
    const b=binding.resolvePublicUiCapabilityBinding(req());
    assert.equal(b.mapScaleDistanceRequired,true);
    assert.equal(b.boundedUnitNormalizationRequired,true);
    assert.deepEqual(b.appliedRuntimeModifierIds,["mod_coordinate_map"]);
  }finally{delete globalThis.document;}
});

test("Q014 focused validation and ownership guards remain bounded",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");
  assert.equal(impact.changeImpact.legalRouteSemanticsChanged,false);
  assert.equal(plan.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(plan.lanes.SHARED_RUNTIME_BOUNDED[0].kind,"NODE_TEST");
  assert.equal(plan.lanes.SHARED_RUNTIME_BOUNDED[1].runtime,"PLAYWRIGHT_CHROMIUM");
  assert.equal(implementation.validation.fullRepositoryRegression,"FORBIDDEN");
  assert.equal(implementation.validation.globalBrowserReplay,"FORBIDDEN");
  for(const v of Object.values(implementation.scopeGuard))assert.equal(v,false);
});
