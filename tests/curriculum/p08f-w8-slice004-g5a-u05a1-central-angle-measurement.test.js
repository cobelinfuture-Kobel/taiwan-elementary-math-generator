import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  auditG5AU05A1P08F04Projection,
  G5A_U05A1_P08F04_KP_ID as KP,
  G5A_U05A1_P08F04_PRIOR_KP_IDS as PRIOR,
  G5A_U05A1_P08F04_PROTECTED_FUTURE_KP_IDS as FUTURE,
  G5A_U05A1_P08F04_SOURCE_ID as SRC,
  G5A_U05A1_P08F04_SPEC_IDS as SPEC_IDS
} from "../../site/modules/curriculum/registry/g5a-u05a1-central-angle-measurement-selector-projection-p08f04.js";
import {auditP08F04PublicSelectorComposition,getVisibleBatchAKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource,listVisibleBatchAKnowledgePoints,resolveVisiblePatternSpecIdsForKnowledgePoint} from "../../site/modules/curriculum/registry/batch-a-selector-p08f04-extension.js";
import * as preSelector from "../../site/modules/curriculum/registry/batch-a-selector-p08f03-extension.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p08f04.js";
import {generateG5AU05A1P08F04Questions,validateG5AU05A1P08F04Answer,validateG5AU05A1P08F04Question} from "../../site/modules/curriculum/batch-a/g5a-u05a1-central-angle-measurement-runtime-p08f04.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderSectorElementsDiagram,renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const implementation=read("data/curriculum/full-product/p08f/q004-g5a-u05a1-central-angle-measurement-implementation.json");
const preflight=read("data/curriculum/full-product/p08f/q004-g5a-u05a1-central-angle-measurement-source-authority-preflight.json");
const impact=read("data/project/change-impact/P08F_W8_Q004.impact.json");
const validation=read("data/project/validation-plans/P08F_W8_Q004.validation.json");
const req=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"diagram",questionCount:20,generationSeed:"p08f04-focused",...extra});

test("W8 Q004 consumes human-accepted Q003 D0 and exact fourth frozen queue identity",()=>{
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI_LIVE_E6_AND_ACTUAL_PRINT_REVIEW");
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.predecessorAuthority.q003FinalCloseoutStatus,"Q003_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(preflight.preflightDecision.predecessorQ003D0Satisfied,true);
  assert.equal(implementation.queueAuthority.queuePosition,4);
  assert.equal(implementation.queueAuthority.sliceId,"p08e_q004_r2_g5a_u05_5a05a1_profile_geometry_property_c1");
  assert.deepEqual(implementation.queueAuthority.knowledgePointIds,[KP]);
});

test("W8 Q004 materializes one FormalMapping, one PatternGroup and three source-bounded PatternSpecs",()=>{
  const a=auditG5AU05A1P08F04Projection();assert.equal(a.ok,true,a.errors.join("\n"));
  assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1});
  assert.equal(implementation.productContract.formalMappingCount,1);
  assert.equal(implementation.productContract.patternGroupCount,1);
  assert.equal(implementation.productContract.patternSpecCount,3);
  assert.deepEqual(implementation.productContract.patternSpecIds,SPEC_IDS);
  assert.equal(implementation.productContract.rendererStrategy,"REUSE_EXISTING_P05F15_SECTOR_ELEMENTS_RENDERER_WITHOUT_RENDERER_MUTATION");
  assert.equal(implementation.scopeGuard.existingSectorRendererReused,true);
  assert.equal(implementation.scopeGuard.sharedRendererRegistryMutation,false);
  assert.equal(implementation.sourceAuthority.sourceLearnerFigureCopied,false);
});

test("W8 Q004 selector promotes only central-angle measurement and preserves P05F15 sector-elements owner",()=>{
  const a=auditP08F04PublicSelectorComposition();assert.equal(a.ok,true,a.errors.join("\n"));
  const before=preSelector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  const s=listBatchAKnowledgePointAvailabilityBySource(SRC),visible=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  for(const id of PRIOR){assert.ok(before.includes(id));assert.ok(visible.includes(id));assert.ok(getVisibleBatchAKnowledgePoint(id));}
  assert.equal(before.includes(KP),false);assert.ok(visible.includes(KP));assert.ok(getVisibleBatchAKnowledgePoint(KP));
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(KP,"diagram"),SPEC_IDS);
  assert.equal(s.hiddenPendingKnowledgePointIds.includes(KP),false);assert.equal(s.notSelectableKnowledgePointIds.includes(KP),false);
  for(const id of FUTURE){assert.equal(visible.includes(id),false);assert.ok(s.hiddenPendingKnowledgePointIds.includes(id));assert.ok(s.notSelectableKnowledgePointIds.includes(id));}
  assert.equal(s.sameUnitMixedAllowed,false);assert.equal(s.w8FrozenQueueComplete,false);
});

test("W8 Q004 public binding is central-angle-only and keeps same-unit mixing fail-closed",()=>{
  const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join("\n"));
  const b=resolvePublicUiCapabilityBinding(req());
  assert.equal(b.blocked,false);assert.equal(b.questionType,"diagram");assert.equal(b.questionCount.max,240);
  assert.equal(b.centralAngleMeasurementRequired,true);assert.equal(b.vertexMustBeCircleCenter,true);assert.equal(b.twoBoundingRaysAreRadii,true);assert.equal(b.fullCircleInvariantDegrees,360);assert.equal(b.orientationInvariantRequired,true);
  assert.equal(b.priorSectorElementsReowned,false);assert.equal(b.generalProtractorPlacementProcedureReowned,false);assert.equal(b.combinedSectorUnknownAngleReowned,false);assert.equal(b.sectorFractionOfCircleReowned,false);assert.equal(b.sameCircleSectorSizeComparisonReowned,false);assert.equal(b.sectorAreaArcLengthReowned,false);assert.equal(b.geometryConstructionReowned,false);
  assert.equal(b.sameUnitMixedAdmission,false);assert.equal(b.crossUnitMixedAdmission,false);assert.deepEqual(b.appliedRuntimeModifierIds,[]);assert.equal(b.frozenRuntimeProfile,"profile_geometry_property");
});

for(const patternSpecId of SPEC_IDS)test("W8 Q004 "+patternSpecId+" has 240 deterministic unique validated variants",()=>{
  const o={selectedKnowledgePointIds:[KP],questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable-"+patternSpecId};
  const a=generateG5AU05A1P08F04Questions(o),b=generateG5AU05A1P08F04Questions(o);
  assert.equal(a.ok,true,a.errors.join("\n"));assert.deepEqual(a.questions,b.questions);assert.equal(a.questions.length,240);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){assert.equal(validateG5AU05A1P08F04Question(q).ok,true);assert.equal(validateG5AU05A1P08F04Answer(q,q.answerText).ok,true);assert.equal(q.answerValue,q.geometryDiagram.centralAngleDeg);assert.equal(q.geometryDiagram.fullCircleInvariantDegrees,360);assert.equal(q.geometryDiagram.orientationInvariant,true);assert.equal(q.metadata.q005OrLaterTouched,false);}
});

for(const count of [1,20,120,121,240])test("W8 Q004 generates "+count+" validated questions under the exact KP",()=>{
  const g=generateG5AU05A1P08F04Questions({selectedKnowledgePointIds:[KP],questionCount:count,generationSeed:"matrix-"+count});
  assert.equal(g.ok,true,g.errors.join("\n"));assert.equal(g.questions.length,count);assert.equal(new Set(g.questions.map(q=>q.questionSignature)).size,count);assert.ok(g.questions.every(q=>q.knowledgePointId===KP&&validateG5AU05A1P08F04Question(q).ok));
});

test("W8 Q004 relation coverage stays inside central-angle measurement semantics",()=>{
  const qs=generateG5AU05A1P08F04Questions({selectedKnowledgePointIds:[KP],questionCount:90,generationSeed:"semantic-coverage"}).questions;
  assert.deepEqual([...new Set(qs.map(q=>q.relation))].sort(),["MEASURE_CENTRAL_ANGLE_BETWEEN_TWO_RADII","READ_CENTRAL_ANGLE_FROM_SECTOR_DIAGRAM","RECOGNIZE_ROTATION_INVARIANT_CENTRAL_ANGLE"].sort());
  for(const q of qs){assert.equal(q.geometryDiagram.center.label,"O");assert.equal(q.geometryDiagram.radii.length,2);assert.equal(q.geometryDiagram.closedByTwoRadiiAndArc,true);assert.equal(q.answerValue,q.geometryDiagram.centralAngleDeg);}
});

test("W8 Q004 validator fails closed for wrong answer, altered geometry and ownership leakage",()=>{
  const q=generateG5AU05A1P08F04Questions({selectedKnowledgePointIds:[KP],questionCount:1,patternSpecIds:[SPEC_IDS[0]],generationSeed:"wrong"}).questions[0];
  assert.equal(validateG5AU05A1P08F04Answer(q,"999").ok,false);
  assert.equal(validateG5AU05A1P08F04Question({...q,metadata:{...q.metadata,sectorFractionOfCircleReowned:true}}).ok,false);
  assert.equal(validateG5AU05A1P08F04Question({...q,geometryDiagram:{...q.geometryDiagram,centralAngleDeg:q.geometryDiagram.centralAngleDeg+10}}).ok,false);
});

test("W8 Q004 aggregate browser generator worksheet and existing sector renderer are wired",()=>{
  const p=buildBatchABrowserPlan(req({questionCount:15}));assert.deepEqual(p.selectedKnowledgePointIds,[KP]);assert.equal(p.questionCountMax,240);assert.equal(p.questionMode,"diagram");
  const g=generateBatchABrowserQuestions(req({questionCount:15}));assert.equal(g.ok,true,g.errors.join("\n"));assert.equal(g.questions.length,15);assert.ok(g.questions.every(q=>q.knowledgePointId===KP));
  const direct=renderSectorElementsDiagram(g.questions[0].geometryDiagram);assert.match(direct,/worksheet-sector-elements-diagram/);assert.match(direct,/data-marker-mode="CENTRAL_ANGLE_ARC"/);
  const w=buildBatchABrowserWorksheetDocument(req({questionCount:15,includeAnswerKey:true,printLayout:{columns:3,rowsPerPage:5,showAnswerKeyPage:true}}));assert.equal(w.ok,true,w.errors.join("\n"));
  assert.equal(w.worksheetDocument.printOptions.columns,2);assert.equal(w.worksheetDocument.printOptions.rowsPerPage,3);assert.equal(w.worksheetDocument.questionPages.length,3);assert.equal(w.worksheetDocument.answerKeyPages.length,3);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""});assert.match(html,/worksheet-sector-elements-diagram/);assert.match(html,/data-representation="sector-elements-diagram"/);
  const learner=html.replace(/<[^>]*>/g," ");
  for(const x of ["kp_g5a_","P08F04","占全圓","比較扇形","扇形面積","弧長","合併扇形","作圖"])assert.equal(learner.includes(x),false,x);
});

test("W8 Q004 prior P05F15 source-unit route remains available while same-unit mixed stays fail-closed",()=>{
  const priorPlan=buildBatchABrowserPlan({sourceId:SRC,selectionMode:"sourceUnit",questionMode:"diagram",questionCount:8,generationSeed:"prior-owner"});
  assert.equal(priorPlan.sourceId,SRC);assert.ok(priorPlan.selectedKnowledgePointIds.includes(PRIOR[0]));assert.equal(priorPlan.selectedKnowledgePointIds.includes(KP),false);
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[PRIOR[0],KP],questionMode:"diagram",questionCount:8});
  assert.equal(mixed.ok,false);
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
