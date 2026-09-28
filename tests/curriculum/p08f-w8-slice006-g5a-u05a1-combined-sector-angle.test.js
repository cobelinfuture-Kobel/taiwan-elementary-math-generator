import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditG5AU05A1P08F06Projection,G5A_U05A1_P08F06_KP_ID as KP,G5A_U05A1_P08F06_PRIOR_KP_IDS as PRIOR,G5A_U05A1_P08F06_PROTECTED_FUTURE_KP_IDS as FUTURE,G5A_U05A1_P08F06_SOURCE_ID as SRC,G5A_U05A1_P08F06_SPEC_IDS as SPEC_IDS} from "../../site/modules/curriculum/registry/g5a-u05a1-combined-sector-angle-selector-projection-p08f06.js";
import {auditP08F06PublicSelectorComposition,getVisibleBatchAKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource,listVisibleBatchAKnowledgePoints,resolveVisiblePatternSpecIdsForKnowledgePoint} from "../../site/modules/curriculum/registry/batch-a-selector-p08f06-extension.js";
import * as preSelector from "../../site/modules/curriculum/registry/batch-a-selector-p08f05-extension.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p08f06.js";
import {generateG5AU05A1P08F06Questions,validateG5AU05A1P08F06Answer,validateG5AU05A1P08F06Question} from "../../site/modules/curriculum/batch-a/g5a-u05a1-combined-sector-angle-runtime-p08f06.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderCombinedSectorAngleDiagram,renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const implementation=read("data/curriculum/full-product/p08f/q006-g5a-u05a1-combined-sector-angle-implementation.json");
const preflight=read("data/curriculum/full-product/p08f/q006-g5a-u05a1-combined-sector-angle-source-authority-preflight.json");
const impact=read("data/project/change-impact/P08F_W8_Q006.impact.json");
const validation=read("data/project/validation-plans/P08F_W8_Q006.validation.json");
const req=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"diagram",questionCount:20,generationSeed:"p08f06-focused",...extra});

test("W8 Q006 consumes human-accepted Q005 D0 and exact sixth frozen queue identity",()=>{
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI_LIVE_E6_AND_ACTUAL_PRINT_REVIEW");
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.predecessorAuthority.q005FinalCloseoutStatus,"Q005_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(preflight.preflightDecision.predecessorQ005D0Satisfied,true);
  assert.equal(implementation.queueAuthority.queuePosition,6);
  assert.equal(implementation.queueAuthority.sliceId,"p08e_q006_r3_g5a_u05_5a05a1_profile_geometry_property_c1");
  assert.deepEqual(implementation.queueAuthority.knowledgePointIds,[KP]);
});

test("W8 Q006 materializes one FormalMapping, one PatternGroup and three source-bounded PatternSpecs",()=>{
  const a=auditG5AU05A1P08F06Projection();assert.equal(a.ok,true,a.errors.join("\n"));
  assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1});
  assert.equal(implementation.productContract.formalMappingCount,1);
  assert.equal(implementation.productContract.patternGroupCount,1);
  assert.equal(implementation.productContract.patternSpecCount,3);
  assert.deepEqual(implementation.productContract.patternSpecIds,SPEC_IDS);
  assert.equal(implementation.productContract.rendererStrategy,"DEDICATED_P08F06_COMBINED_SECTOR_ANGLE_RENDERER");
  assert.equal(implementation.scopeGuard.dedicatedRendererAdded,true);
  assert.equal(implementation.sourceAuthority.sourceLearnerFigureCopied,false);
});

test("W8 Q006 selector promotes only combined-sector angle and preserves earlier same-source owners",()=>{
  const a=auditP08F06PublicSelectorComposition();assert.equal(a.ok,true,a.errors.join("\n"));
  const before=preSelector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  const s=listBatchAKnowledgePointAvailabilityBySource(SRC),visible=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  for(const id of PRIOR){assert.ok(before.includes(id));assert.ok(visible.includes(id));assert.ok(getVisibleBatchAKnowledgePoint(id));}
  assert.equal(before.includes(KP),false);assert.ok(visible.includes(KP));assert.ok(getVisibleBatchAKnowledgePoint(KP));
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(KP,"diagram"),SPEC_IDS);
  assert.equal(s.hiddenPendingKnowledgePointIds.includes(KP),false);assert.equal(s.notSelectableKnowledgePointIds.includes(KP),false);
  for(const id of FUTURE){assert.equal(visible.includes(id),false);assert.ok(s.hiddenPendingKnowledgePointIds.includes(id));assert.ok(s.notSelectableKnowledgePointIds.includes(id));}
  assert.equal(s.sameUnitMixedAllowed,false);assert.equal(s.w8FrozenQueueComplete,false);
});

test("W8 Q006 public binding stays combined-sector-only and same-unit mixing fail-closed",()=>{
  const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join("\n"));const b=resolvePublicUiCapabilityBinding(req());
  assert.equal(b.blocked,false);assert.equal(b.questionType,"diagram");assert.equal(b.questionCount.max,240);
  assert.equal(b.combinedSectorUnknownAngleRequired,true);assert.equal(b.sameCircleCenterRequired,true);assert.equal(b.nonOverlappingCentralAnglesRequired,true);
  assert.equal(b.fullTurnInvariantDegrees,360);assert.equal(b.knownAngleSumRequired,true);assert.equal(b.unknownByFullTurnSubtractionRequired,true);
  assert.equal(b.centralAngleMeasurementReownershipAllowed,false);assert.equal(b.sectorFractionOfCircleReownershipAllowed,false);assert.equal(b.sameCircleSectorSizeComparisonReownershipAllowed,false);
  assert.equal(b.sameUnitMixedAdmission,false);assert.equal(b.crossUnitMixedAdmission,false);assert.deepEqual(b.appliedRuntimeModifierIds,[]);
});

for(const patternSpecId of SPEC_IDS)test("W8 Q006 "+patternSpecId+" has 240 deterministic unique validated variants",()=>{
  const o={selectedKnowledgePointIds:[KP],questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable-"+patternSpecId};
  const a=generateG5AU05A1P08F06Questions(o),b=generateG5AU05A1P08F06Questions(o);
  assert.equal(a.ok,true,a.errors.join("\n"));assert.deepEqual(a.questions,b.questions);assert.equal(a.questions.length,240);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){assert.equal(validateG5AU05A1P08F06Question(q).ok,true);assert.equal(validateG5AU05A1P08F06Answer(q,q.answerText).ok,true);assert.equal(q.answerValue,q.geometryDiagram.unknownAngleDeg);assert.equal(q.geometryDiagram.knownAngles.reduce((x,y)=>x+y,0)+q.answerValue,360);assert.equal(q.metadata.q007OrLaterTouched,false);}
});

for(const count of [1,20,120,121,240])test("W8 Q006 generates "+count+" validated questions under exact KP",()=>{
  const g=generateG5AU05A1P08F06Questions({selectedKnowledgePointIds:[KP],questionCount:count,generationSeed:"matrix-"+count});
  assert.equal(g.ok,true,g.errors.join("\n"));assert.equal(g.questions.length,count);assert.equal(new Set(g.questions.map(q=>q.questionSignature)).size,count);
  assert.ok(g.questions.every(q=>q.knowledgePointId===KP&&validateG5AU05A1P08F06Question(q).ok));
});

test("W8 Q006 relation coverage stays inside full-turn unknown-sector semantics",()=>{
  const qs=generateG5AU05A1P08F06Questions({selectedKnowledgePointIds:[KP],questionCount:90,generationSeed:"semantic-coverage"}).questions;
  assert.deepEqual([...new Set(qs.map(q=>q.relation))].sort(),["SUM_KNOWN_CENTRAL_ANGLES_AROUND_SAME_CENTER","SUBTRACT_KNOWN_ANGLE_SUM_FROM_FULL_TURN_360","SOLVE_UNKNOWN_COMBINED_SECTOR_ANGLE"].sort());
  for(const q of qs){assert.equal(q.geometryDiagram.sameCircleCenter,true);assert.equal(q.geometryDiagram.nonOverlappingCentralAngles,true);assert.equal(q.geometryDiagram.fullTurnInvariantDegrees,360);assert.equal(q.answerValue,360-q.geometryDiagram.knownAngles.reduce((a,b)=>a+b,0));}
});

test("W8 Q006 validator fails closed for wrong answer, altered geometry and ownership leakage",()=>{
  const q=generateG5AU05A1P08F06Questions({selectedKnowledgePointIds:[KP],questionCount:1,patternSpecIds:[SPEC_IDS[0]],generationSeed:"wrong"}).questions[0];
  assert.equal(validateG5AU05A1P08F06Answer(q,"999").ok,false);
  assert.equal(validateG5AU05A1P08F06Question({...q,metadata:{...q.metadata,sectorFractionOfCircleReowned:true}}).ok,false);
  assert.equal(validateG5AU05A1P08F06Question({...q,geometryDiagram:{...q.geometryDiagram,unknownAngleDeg:q.geometryDiagram.unknownAngleDeg+10}}).ok,false);
});

test("W8 Q006 aggregate browser generator worksheet and dedicated renderer are wired",()=>{
  const p=buildBatchABrowserPlan(req({questionCount:15}));assert.deepEqual(p.selectedKnowledgePointIds,[KP]);assert.equal(p.questionCountMax,240);assert.equal(p.questionMode,"diagram");
  const g=generateBatchABrowserQuestions(req({questionCount:15}));assert.equal(g.ok,true,g.errors.join("\n"));assert.equal(g.questions.length,15);
  const direct=renderCombinedSectorAngleDiagram(g.questions[0].geometryDiagram);assert.match(direct,/worksheet-combined-sector-angle-diagram/);assert.match(direct,/data-representation="combined-sector-angle-diagram"/);
  const w=buildBatchABrowserWorksheetDocument(req({questionCount:15,includeAnswerKey:true,printLayout:{columns:3,rowsPerPage:5,showAnswerKeyPage:true}}));assert.equal(w.ok,true,w.errors.join("\n"));
  assert.equal(w.worksheetDocument.printOptions.columns,2);assert.equal(w.worksheetDocument.printOptions.rowsPerPage,3);assert.equal(w.worksheetDocument.questionPages.length,3);assert.equal(w.worksheetDocument.answerKeyPages.length,3);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""});assert.match(html,/worksheet-combined-sector-angle-diagram/);assert.match(html,/data-representation="combined-sector-angle-diagram"/);
  const learner=html.replace(/<[^>]*>/g," ");for(const x of ["kp_g5a_","P08F06","扇形面積","弧長","占全圓幾分之幾","比較扇形大小","量角器","作圖"])assert.equal(learner.includes(x),false,x);
});

test("W8 Q006 prior source-unit route remains available while same-unit mixed stays fail-closed",()=>{
  const priorPlan=buildBatchABrowserPlan({sourceId:SRC,selectionMode:"sourceUnit",questionMode:"diagram",questionCount:8,generationSeed:"prior-owner"});
  assert.equal(priorPlan.sourceId,SRC);assert.ok(priorPlan.selectedKnowledgePointIds.includes(PRIOR[0]));assert.equal(priorPlan.selectedKnowledgePointIds.includes(KP),false);
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[PRIOR[1],KP],questionMode:"diagram",questionCount:8});
  assert.equal(mixed.ok,false);assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
