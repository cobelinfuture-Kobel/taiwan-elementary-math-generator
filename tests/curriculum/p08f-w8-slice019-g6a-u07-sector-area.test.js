import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as selector from "../../site/modules/curriculum/registry/batch-a-selector-p08f19-extension.js";
import {
  auditG6AU07P08F19Projection,
  G6A_U07_P08F19_APPLIED_MODIFIER_IDS as MODIFIERS,
  G6A_U07_P08F19_CONTRACT_ONLY_CAPABILITY_IDS as CONTRACT_ONLY,
  G6A_U07_P08F19_FORMAL_MAPPING as MAP,
  G6A_U07_P08F19_KP_ID as KP,
  G6A_U07_P08F19_PATTERN_GROUP as GROUP,
  G6A_U07_P08F19_PATTERN_SPECS as SPECS,
  G6A_U07_P08F19_PRIOR_KP_IDS as PRIOR,
  G6A_U07_P08F19_FUTURE_KP_IDS as FUTURE,
  G6A_U07_P08F19_REQUIRED_CAPABILITY_IDS as REQUIRED,
  G6A_U07_P08F19_SOURCE_ID as SRC,
  G6A_U07_P08F19_SPEC_IDS as SPEC_IDS
} from "../../site/modules/curriculum/registry/g6a-u07-sector-area-selector-projection-p08f19.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p08f19.js";
import {buildG6AU07P08F19Question,generateG6AU07P08F19Questions,validateG6AU07P08F19Answer,validateG6AU07P08F19Question} from "../../site/modules/curriculum/batch-a/g6a-u07-sector-area-runtime-p08f19.js";
import {requestsP08F19,buildBatchABrowserPlan,generateBatchABrowserQuestions as generateQ019} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p08f19.js";
import {buildBatchABrowserWorksheetDocument as buildQ019} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p08f19-extension.js";
import {buildBatchABrowserWorksheetDocument as buildCurrent} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderSectorAreaDiagramP08F19,renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p08f/q019-g6a-u07-sector-area-implementation.json");
const pre=read("data/curriculum/full-product/p08f/q019-g6a-u07-sector-area-source-authority-preflight.json");
const impact=read("data/project/change-impact/P08F_W8_Q019.impact.json");
const plan=read("data/project/validation-plans/P08F_W8_Q019.validation.json");

const req=(count=16)=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],selectedPatternGroupIds:[GROUP.patternGroupId],patternSpecIds:SPEC_IDS,questionMode:"diagram",requestedQuestionType:"diagram",questionCount:count,generationSeed:"p08f19-test",includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:2,showAnswerKeyPage:true}});

test("Q019 materializes exact frozen sector-area FormalMapping and two PatternSpecs",()=>{
  assert.equal(pre.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(impl.preflight.prNumber,1150);
  assert.equal(impl.preflight.mergeSha,"644b500153a7457673d8850262ac364cf5fd374d");
  assert.equal(impl.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
  assert.equal(impl.queueAuthority.queuePosition,19);
  assert.equal(impl.queueAuthority.sliceId,"p08e_q019_r11_g6a_u07_6a07_profile_geometry_formula_c1");
  assert.deepEqual(impl.queueAuthority.knowledgePointIds,[KP]);
  assert.equal(MAP.r04MappingId,"r04map_g6a_u07_sector_area");
  assert.equal(MAP.semanticCore,"SECTOR_AREA_AS_CIRCLE_AREA_TIMES_CENTRAL_ANGLE_OVER_360");
  assert.equal(MAP.directVisualWitnessFamily,"SECTOR_AREA_RADIUS_18_ANGLE_30");
  assert.deepEqual(MODIFIERS,["mod_integer_division"]);
  assert.deepEqual(MAP.requiredCapabilityIds,REQUIRED);
  assert.deepEqual(MAP.contractOnlyRequiredCapabilityIds,CONTRACT_ONLY);
  const a=auditG6AU07P08F19Projection();
  assert.equal(a.ok,true,a.errors.join("\n"));
  assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:2,formalMappings:1});
  assert.equal(requestsP08F19(req()),true);
  assert.equal(requestsP08F19({...req(),selectionMode:"sourceUnit"}),false);
  assert.equal(requestsP08F19({...req(),selectedKnowledgePointIds:[KP,PRIOR[0]]}),false);
});

for(const id of SPEC_IDS)test(id+" yields 240 deterministic distinct valid sector-area variants",()=>{
  const a=generateG6AU07P08F19Questions({knowledgePointId:KP,patternSpecIds:[id],questionCount:240,generationSeed:"stable-"+id});
  const b=generateG6AU07P08F19Questions({knowledgePointId:KP,patternSpecIds:[id],questionCount:240,generationSeed:"stable-"+id});
  assert.equal(a.ok,true,a.errors.join("\n"));
  assert.deepEqual(a.questions,b.questions);
  assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  assert.equal(new Set(a.questions.map(q=>q.promptText)).size,240);
  for(const q of a.questions){
    assert.equal(validateG6AU07P08F19Question(q).ok,true);
    assert.equal(q.patternRepresentation.fullCircleDegrees,360);
    assert.equal(q.patternRepresentation.circleAreaWholeReferenceVerified,true);
    assert.equal(q.patternRepresentation.centralAngleFractionVerified,true);
    assert.equal(q.patternRepresentation.sectorAreaFormulaVerified,true);
    assert.equal(q.patternRepresentation.fullCircleClosureVerified,true);
    assert.equal(validateG6AU07P08F19Answer(q,q.answerText).ok,true);
  }
});

test("Q019 exact source witness radius 18 angle 30 is materialized and formula-correct",()=>{
  for(const id of SPEC_IDS){
    const q=buildG6AU07P08F19Question({patternSpecId:id,variant:0});
    assert.equal(q.patternRepresentation.radius,18);
    assert.equal(q.patternRepresentation.diameter,36);
    assert.equal(q.patternRepresentation.centralAngleDeg,30);
    assert.equal(q.patternRepresentation.circleArea,1017.36);
    assert.equal(q.patternRepresentation.sectorArea,84.78);
    assert.equal(q.patternRepresentation.sourceParameterCarrier,"SOURCE_PAGE1_RADIUS_18_ANGLE_30_EXACT");
    assert.equal(q.answerText,"84.78 平方公分");
  }
});

test("Q019 validator enforces radius/diameter normalization, sector formula, and ownership guards",()=>{
  const r=buildG6AU07P08F19Question({patternSpecId:"ps_g6a_u07_sector_area_from_radius_angle",variant:0});
  const d=buildG6AU07P08F19Question({patternSpecId:"ps_g6a_u07_sector_area_from_diameter_angle",variant:0});
  assert.equal(r.geometryDiagram.measurementMode,"RADIUS");
  assert.equal(d.geometryDiagram.measurementMode,"DIAMETER");
  assert.equal(d.patternRepresentation.diameterNormalizedToRadius,true);
  assert.equal(validateG6AU07P08F19Answer(r,"84.78 平方公分").ok,true);
  assert.equal(validateG6AU07P08F19Answer(r,84.79).ok,false);
  for(const patch of [
    {q011CircleAreaDerivationTeachingReowned:true},
    {q014CircleAreaFormulaTeachingReowned:true},
    {q017AnnulusAreaTeachingReowned:true},
    {compositeCircleAreaReowned:true},
    {arcLengthOrPerimeterTeachingUsed:true},
    {genericSectorFractionTeachingReowned:true},
    {applicationContextUsed:true}
  ]) assert.equal(validateG6AU07P08F19Question({...r,metadata:{...r.metadata,...patch}}).ok,false);
});

test("Q019 renderer keeps highlighted sector, whole-circle reference, angle and dimension semantics explicit",()=>{
  const r=buildG6AU07P08F19Question({patternSpecId:"ps_g6a_u07_sector_area_from_radius_angle",variant:0});
  const d=buildG6AU07P08F19Question({patternSpecId:"ps_g6a_u07_sector_area_from_diameter_angle",variant:0});
  const rh=renderSectorAreaDiagramP08F19(r.geometryDiagram),dh=renderSectorAreaDiagramP08F19(d.geometryDiagram);
  assert.match(rh,/data-visual-contract-version="P08F19_R1"/);
  assert.match(rh,/sector-area-diagram__sector-fill/);
  assert.match(rh,/sector-area-diagram__whole-circle/);
  assert.match(rh,/sector-area-diagram__angle-marker/);
  assert.match(rh,/半徑 18 公分/);
  assert.match(rh,/30°/);
  assert.match(rh,/>A<\/text>/);
  assert.match(rh,/>B<\/text>/);
  assert.match(rh,/>O<\/text>/);
  assert.match(dh,/直徑 36 公分/);
  assert.equal((rh.match(/sector-area-diagram__diameter/g)??[]).length,0);
  assert.ok((dh.match(/sector-area-diagram__diameter/g)??[]).length>=1);
});

test("Q019 promotes fourth G6A-U07 KP while composite-circle-area remains protected",()=>{
  const ids=selector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  const av=selector.listBatchAKnowledgePointAvailabilityBySource(SRC),a=selector.auditP08F19PublicSelectorComposition();
  assert.equal(a.ok,true,a.errors.join("\n"));
  for(const id of [...PRIOR,KP])assert.ok(ids.includes(id),id);
  assert.equal(ids.filter(id=>id.startsWith("kp_g6a_u07_")).length,4);
  assert.deepEqual([...av.remainingProtectedKnowledgePointIds],FUTURE);
  assert.equal(av.sameSourceCandidateSetComplete,false);
  assert.equal(av.sameUnitMixedAllowed,false);
  assert.equal(selector.getVisibleBatchAKnowledgePoint(FUTURE[0]),null);
});

test("Q019 public binding and browser generator stay single-KP diagram-only",()=>{
  const b=auditPublicUiCapabilityBinding();assert.equal(b.ok,true,b.errors.join("\n"));
  const bind=resolvePublicUiCapabilityBinding(req());
  assert.equal(bind.blocked,false);
  assert.equal(bind.questionType,"diagram");
  assert.equal(bind.questionCount.max,240);
  assert.equal(bind.sectorAreaOwned,true);
  assert.equal(bind.centralAngleFractionOf360Required,true);
  assert.equal(bind.fullCircle360ClosureRequired,true);
  assert.deepEqual(bind.requiredCapabilityIds,REQUIRED);
  assert.deepEqual(bind.contractOnlyRequiredCapabilityIds,CONTRACT_ONLY);
  assert.deepEqual(bind.appliedRuntimeModifierIds,["mod_integer_division"]);
  assert.equal(bind.humanVisualReviewRequired,true);
  const p=buildBatchABrowserPlan(req(20));
  assert.deepEqual(p.selectedKnowledgePointIds,[KP]);
  assert.equal(p.questionCountMax,240);
  assert.equal(p.genericFallback,false);
  const g=generateQ019(req(20));
  assert.equal(g.ok,true,g.errors.join("\n"));
  assert.equal(g.questions.length,20);
});

test("Q019 worksheet and current bridge produce learner-facing diagrams and print-safe structure",async()=>{
  const w=buildQ019(req(16));
  assert.equal(w.ok,true,w.errors.join("\n"));
  assert.equal(w.worksheetDocument.questionCount,16);
  assert.equal(w.worksheetDocument.answerKeyItems.length,16);
  assert.equal(w.worksheetDocument.questionPages.length,4);
  assert.equal(w.worksheetDocument.answerKeyPages.length,4);
  assert.equal(w.worksheetDocument.title,"圓面積和扇形面積｜扇形面積");
  assert.equal(w.learnerVisualReviewRequired,true);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:"",debugDataAttributes:false});
  const visible=html.replace(/<[^>]*>/g," ");
  assert.match(visible,/陰影扇形/);
  assert.match(visible,/圓心角/);
  assert.match(visible,/360/);
  assert.match(html,/sector-area-diagram-p08f19/);
  for(const x of ["P08F19","kp_g6a_u07_","ps_g6a_u07_","圓環","複合圖形","弧長","牛吃草"])assert.equal(visible.includes(x),false,x);
  const current=buildCurrent(req(8));
  assert.equal(current.ok,true,current.errors.join("\n"));
  assert.equal(current.p08f19Implemented,true);
  assert.equal(current.worksheetDocument.metadata.knowledgePointId,KP);
  globalThis.document={};
  try{
    const s=await import("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js?p08f19="+Date.now());
    const binding=await import("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js?p08f19="+Date.now());
    for(const id of [...PRIOR,KP])assert.equal(s.getVisibleBatchAKnowledgePoint(id)?.sourceId,SRC,id);
    assert.equal(s.getVisibleBatchAKnowledgePoint(FUTURE[0])?.sourceId,SRC);
    const pb=binding.resolvePublicUiCapabilityBinding(req());
    assert.equal(pb.sectorAreaOwned,true);
    assert.equal(pb.frozenRuntimeProfile,"profile_geometry_formula");
  }finally{delete globalThis.document;}
});

test("Q019 mixed modes and future composite circle area remain fail-closed",()=>{
  const mixed=generateQ019({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[PRIOR[0],KP],questionMode:"diagram",questionCount:8});
  assert.equal(mixed.ok,false);
  const future=generateQ019({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[FUTURE[0]],questionMode:"diagram",questionCount:8});
  assert.equal(future.ok,false);
});

test("Q019 bounded validation and ownership guards remain closed",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.changeImpact.publicAuthorityCutover,true);
  assert.equal(impact.changeImpact.sharedRendererChanged,true);
  assert.equal(plan.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(plan.lanes.SHARED_RUNTIME_BOUNDED[0].kind,"NODE_TEST");
  assert.equal(plan.lanes.SHARED_RUNTIME_BOUNDED[1].runtime,"PLAYWRIGHT_CHROMIUM");
  assert.deepEqual(plan.forbidden,["FULL_NODE_REGRESSION","GLOBAL_BROWSER_REPLAY"]);
  for(const v of Object.values(impl.ownershipGuard))assert.equal(v,false);
});
