import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditG5AU05A1P08F10Projection,G5A_U05A1_P08F10_KP_ID as KP,G5A_U05A1_P08F10_PRIOR_KP_IDS as PRIOR,G5A_U05A1_P08F10_PROTECTED_FUTURE_KP_IDS as FUTURE,G5A_U05A1_P08F10_SOURCE_ID as SRC,G5A_U05A1_P08F10_SPEC_IDS as SPEC_IDS} from "../../site/modules/curriculum/registry/g5a-u05a1-sector-fraction-of-circle-selector-projection-p08f10.js";
import {auditP08F10PublicSelectorComposition,getVisibleBatchAKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource,listVisibleBatchAKnowledgePoints,resolveVisiblePatternSpecIdsForKnowledgePoint} from "../../site/modules/curriculum/registry/batch-a-selector-p08f10-extension.js";
import * as preSelector from "../../site/modules/curriculum/registry/batch-a-selector-p08f09-extension.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p08f10.js";
import {generateG5AU05A1P08F10Questions,validateG5AU05A1P08F10Answer,validateG5AU05A1P08F10Question} from "../../site/modules/curriculum/batch-a/g5a-u05a1-sector-fraction-of-circle-runtime-p08f10.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderSectorFractionOfCircleDiagram,renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const implementation=read("data/curriculum/full-product/p08f/q010-g5a-u05a1-sector-fraction-of-circle-implementation.json");
const preflight=read("data/curriculum/full-product/p08f/q010-g5a-u05a1-sector-fraction-of-circle-source-authority-preflight.json");
const impact=read("data/project/change-impact/P08F_W8_Q010.impact.json");
const validation=read("data/project/validation-plans/P08F_W8_Q010.validation.json");
const req=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"diagram",questionCount:20,generationSeed:"p08f10-focused",...extra});

test("W8 Q010 consumes human-accepted Q009 D0 and exact tenth frozen queue identity",()=>{
 assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI_LIVE_E6_AND_ACTUAL_PRINT_REVIEW");
 assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
 assert.equal(preflight.predecessorAuthority.q009FinalCloseoutStatus,"Q009_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
 assert.equal(preflight.preflightDecision.predecessorQ009D0Satisfied,true);
 assert.equal(implementation.queueAuthority.queuePosition,10);
 assert.equal(implementation.queueAuthority.sliceId,"p08e_q010_r5_g5a_u05_5a05a1_profile_geometry_property_c1");
 assert.deepEqual(implementation.queueAuthority.knowledgePointIds,[KP]);
});

test("W8 Q010 materializes one FormalMapping, one PatternGroup and three source-bounded PatternSpecs",()=>{
 const a=auditG5AU05A1P08F10Projection();assert.equal(a.ok,true,a.errors.join("\n"));
 assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1});
 assert.equal(implementation.productContract.formalMappingCount,1);
 assert.equal(implementation.productContract.patternGroupCount,1);
 assert.equal(implementation.productContract.patternSpecCount,3);
 assert.deepEqual(implementation.productContract.patternSpecIds,SPEC_IDS);
 assert.equal(implementation.productContract.rendererStrategy,"DEDICATED_P08F10_SECTOR_FRACTION_OF_CIRCLE_RENDERER");
 assert.equal(implementation.scopeGuard.dedicatedRendererAdded,true);
 assert.equal(implementation.sourceAuthority.sourceLearnerFigureCopied,false);
});

test("W8 Q010 selector promotes only sector fraction and preserves prior same-source owners",()=>{
 const a=auditP08F10PublicSelectorComposition();assert.equal(a.ok,true,a.errors.join("\n"));
 const before=preSelector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
 const s=listBatchAKnowledgePointAvailabilityBySource(SRC),visible=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
 for(const id of PRIOR){assert.ok(before.includes(id));assert.ok(visible.includes(id));assert.ok(getVisibleBatchAKnowledgePoint(id));}
 assert.equal(before.includes(KP),false);assert.ok(visible.includes(KP));assert.ok(getVisibleBatchAKnowledgePoint(KP));
 assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(KP,"diagram"),SPEC_IDS);
 assert.equal(s.hiddenPendingKnowledgePointIds.includes(KP),false);assert.equal(s.notSelectableKnowledgePointIds.includes(KP),false);
 for(const id of FUTURE){assert.equal(visible.includes(id),false);assert.ok(s.hiddenPendingKnowledgePointIds.includes(id));assert.ok(s.notSelectableKnowledgePointIds.includes(id));}
 assert.equal(s.sameSourceCandidateSetComplete,false);assert.equal(s.sameUnitMixedAllowed,false);assert.equal(s.w8FrozenQueueComplete,false);
});

test("W8 Q010 public binding stays fraction-of-circle-only and same-unit mixing fail-closed",()=>{
 const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join("\n"));const b=resolvePublicUiCapabilityBinding(req());
 assert.equal(b.blocked,false);assert.equal(b.questionType,"diagram");assert.equal(b.questionCount.max,240);
 assert.equal(b.sectorFractionOfCircleRequired,true);assert.equal(b.fullTurnInvariantDegrees,360);assert.equal(b.centralAngleToFractionRequired,true);assert.equal(b.reducedFractionRequired,true);assert.equal(b.fractionRepresentsSameFullCircleRequired,true);assert.equal(b.targetIsFractionNotAreaOrArcLength,true);
 assert.equal(b.centralAngleMeasurementReownershipAllowed,false);assert.equal(b.combinedSectorUnknownAngleReownershipAllowed,false);assert.equal(b.sectorElementNamingReownershipAllowed,false);assert.equal(b.sameCircleSectorSizeComparisonReownershipAllowed,false);assert.equal(b.sectorAreaArcLengthReownershipAllowed,false);
 assert.equal(b.sameUnitMixedAdmission,false);assert.equal(b.crossUnitMixedAdmission,false);assert.deepEqual(b.appliedRuntimeModifierIds,[]);
});

for(const patternSpecId of SPEC_IDS)test("W8 Q010 "+patternSpecId+" has 240 deterministic unique validated variants",()=>{
 const o={selectedKnowledgePointIds:[KP],questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable-"+patternSpecId};
 const a=generateG5AU05A1P08F10Questions(o),b=generateG5AU05A1P08F10Questions(o);
 assert.equal(a.ok,true,a.errors.join("\n"));assert.deepEqual(a.questions,b.questions);assert.equal(a.questions.length,240);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
 for(const q of a.questions){assert.equal(validateG5AU05A1P08F10Question(q).ok,true);assert.equal(validateG5AU05A1P08F10Answer(q,q.answerText).ok,true);assert.equal(q.answerValue.numerator*360,q.geometryDiagram.centralAngleDeg*q.answerValue.denominator);assert.equal(q.geometryDiagram.rulerMeasurementRequired,false);assert.equal(q.geometryDiagram.printScaleIsAnswerAuthority,false);assert.equal(q.metadata.q011OrLaterTouched,false);}
});

for(const count of [1,20,120,121,240])test("W8 Q010 generates "+count+" validated questions under exact KP",()=>{
 const g=generateG5AU05A1P08F10Questions({selectedKnowledgePointIds:[KP],questionCount:count,generationSeed:"matrix-"+count});
 assert.equal(g.ok,true,g.errors.join("\n"));assert.equal(g.questions.length,count);assert.equal(new Set(g.questions.map(q=>q.questionSignature)).size,count);
 assert.ok(g.questions.every(q=>q.knowledgePointId===KP&&validateG5AU05A1P08F10Question(q).ok));
});

test("W8 Q010 relation coverage remains central-angle over full-turn fraction semantics",()=>{
 const qs=generateG5AU05A1P08F10Questions({selectedKnowledgePointIds:[KP],questionCount:90,generationSeed:"semantic-coverage"}).questions;
 assert.deepEqual([...new Set(qs.map(q=>q.relation))].sort(),["READ_TARGET_SECTOR_CENTRAL_ANGLE","EXPRESS_CENTRAL_ANGLE_AS_FRACTION_OF_FULL_TURN_360","INTERPRET_SECTOR_AS_FRACTION_OF_FULL_CIRCLE"].sort());
 for(const q of qs){const d=q.geometryDiagram;assert.equal(d.fullTurnInvariantDegrees,360);assert.equal(d.sectorFractionEqualsCentralAngleOver360,true);assert.equal(d.targetIsFractionOfCircleNotAreaOrArcLength,true);assert.equal(q.answerValue.numerator*360,d.centralAngleDeg*q.answerValue.denominator);}
});

test("W8 Q010 validator accepts equivalent fractions but fails wrong fraction, altered diagram and ownership leakage",()=>{
 const q=generateG5AU05A1P08F10Questions({selectedKnowledgePointIds:[KP],questionCount:1,patternSpecIds:[SPEC_IDS[0]],generationSeed:"wrong"}).questions[0];
 const equivalent=String(q.answerValue.numerator*2)+"/"+String(q.answerValue.denominator*2);
 assert.equal(validateG5AU05A1P08F10Answer(q,equivalent).ok,true);
 assert.equal(validateG5AU05A1P08F10Answer(q,"99/100").ok,false);
 assert.equal(validateG5AU05A1P08F10Question({...q,metadata:{...q.metadata,sameCircleSectorSizeComparisonReowned:true}}).ok,false);
 assert.equal(validateG5AU05A1P08F10Question({...q,geometryDiagram:{...q.geometryDiagram,centralAngleDeg:q.geometryDiagram.centralAngleDeg+1}}).ok,false);
});

test("W8 Q010 aggregate browser generator worksheet and dedicated renderer are wired",()=>{
 const p=buildBatchABrowserPlan(req({questionCount:15}));assert.deepEqual(p.selectedKnowledgePointIds,[KP]);assert.equal(p.questionCountMax,240);assert.equal(p.questionMode,"diagram");
 const g=generateBatchABrowserQuestions(req({questionCount:15}));assert.equal(g.ok,true,g.errors.join("\n"));assert.equal(g.questions.length,15);
 const direct=renderSectorFractionOfCircleDiagram(g.questions[0].geometryDiagram);assert.match(direct,/worksheet-sector-fraction-of-circle-diagram/);assert.match(direct,/data-representation="sector-fraction-of-circle-diagram"/);assert.match(direct,/data-ruler-required="false"/);
 const w=buildBatchABrowserWorksheetDocument(req({questionCount:15,includeAnswerKey:true,printLayout:{columns:3,rowsPerPage:5,showAnswerKeyPage:true}}));assert.equal(w.ok,true,w.errors.join("\n"));
 assert.equal(w.worksheetDocument.printOptions.columns,2);assert.equal(w.worksheetDocument.printOptions.rowsPerPage,3);assert.equal(w.worksheetDocument.questionPages.length,3);assert.equal(w.worksheetDocument.answerKeyPages.length,3);
 const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""});assert.match(html,/worksheet-sector-fraction-of-circle-diagram/);assert.match(html,/data-representation="sector-fraction-of-circle-diagram"/);
 const learner=html.replace(/<[^>]*>/g," ");for(const x of ["kp_g5a_","P08F10","扇形面積","弧長","比較扇形大小","量角器","作圖"])assert.equal(learner.includes(x),false,x);
});

test("W8 Q010 prior source-unit route remains available while same-unit mixed stays fail-closed",()=>{
 const priorPlan=buildBatchABrowserPlan({sourceId:SRC,selectionMode:"sourceUnit",questionMode:"diagram",questionCount:8,generationSeed:"prior-owner"});
 assert.equal(priorPlan.sourceId,SRC);assert.equal(priorPlan.selectedKnowledgePointIds.includes(KP),false);
 const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[PRIOR[1],KP],questionMode:"diagram",questionCount:8});
 assert.equal(mixed.ok,false);assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");
 assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
 assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
