import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditG5AU10AP08F02Projection,G5A_U10A_P08F02_KP_ID as KP,G5A_U10A_P08F02_PROTECTED_FUTURE_KP_IDS as PROTECTED,G5A_U10A_P08F02_SOURCE_ID as SRC,G5A_U10A_P08F02_SPEC_IDS as SPECS} from "../../site/modules/curriculum/registry/g5a-u10a-solid-viewpoint-selector-projection-p08f02.js";
import {auditP08F02PublicSelectorComposition,getVisibleBatchAKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource,listVisibleBatchAKnowledgePoints,resolveVisiblePatternSpecIdsForKnowledgePoint} from "../../site/modules/curriculum/registry/batch-a-selector-p08f02-extension.js";
import * as preSelector from "../../site/modules/curriculum/registry/batch-a-selector-p08f01-extension.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p08f02.js";
import {generateG5AU10AP08F02Questions,validateG5AU10AP08F02Answer,validateG5AU10AP08F02Question} from "../../site/modules/curriculum/batch-a/g5a-u10a-solid-viewpoint-runtime-p08f02.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {getBatchASourceUnit,listBatchASourceUnits} from "../../site/modules/curriculum/batch-a/source-units.js";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const implementation=read("data/curriculum/full-product/p08f/q002-g5a-u10a-solid-viewpoint-representation-implementation.json");
const preflight=read("data/curriculum/full-product/p08f/q002-g5a-u10a-solid-viewpoint-representation-source-authority-preflight.json");
const impact=read("data/project/change-impact/P08F_W8_Q002.impact.json");
const validation=read("data/project/validation-plans/P08F_W8_Q002.validation.json");
const request=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"diagram",questionCount:20,generationSeed:"p08f02-focused",...extra});

test("W8 Q002 consumes human-accepted Q001 D0 and exact frozen queue identity",()=>{
 assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI_AND_ACTUAL_PRINT_REVIEW");
 assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
 assert.equal(preflight.predecessorAuthority.q001FinalCloseoutStatus,"Q001_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
 assert.equal(preflight.predecessorAuthority.previousSliceD0Satisfied,true);
 assert.equal(implementation.queueAuthority.queuePosition,2);
 assert.equal(implementation.queueAuthority.sliceId,"p08e_q002_r1_g5a_u10_5a10a_profile_spatial_solid_c1");
 assert.deepEqual(implementation.queueAuthority.knowledgePointIds,[KP]);
});

test("W8 Q002 materializes one viewpoint KP with three source-bounded PatternSpecs",()=>{
 const a=auditG5AU10AP08F02Projection();assert.equal(a.ok,true,a.errors.join("\n"));
 assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1});
 assert.deepEqual(implementation.productContract.patternSpecIds,SPECS);
 assert.equal(implementation.sourceAuthority.sourceLearnerFigureCopied,false);
 assert.equal(implementation.productContract.humanVisualReviewRequiredBeforeD0,true);
});

test("W8 Q002 selector adds viewpoint while preserving four prior same-source product owners",()=>{
 const a=auditP08F02PublicSelectorComposition();assert.equal(a.ok,true,a.errors.join("\n"));
 const before=preSelector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
 const s=listBatchAKnowledgePointAvailabilityBySource(SRC),visible=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
 assert.deepEqual(visible,[...before,KP]);assert.ok(getVisibleBatchAKnowledgePoint(KP));assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(KP,"diagram"),SPECS);
 for(const id of PROTECTED){assert.ok(before.includes(id));assert.ok(visible.includes(id));assert.ok(getVisibleBatchAKnowledgePoint(id));}
 assert.equal(s.hiddenPendingKnowledgePointIds.includes(KP),false);assert.equal(s.notSelectableKnowledgePointIds.includes(KP),false);
 assert.equal(s.sameUnitMixedAllowed,false);assert.equal(s.w8FrozenQueueComplete,false);
});

test("W8 Q002 binding locks spatial-solid plus coordinate-map semantics",()=>{
 const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join("\n"));
 const b=resolvePublicUiCapabilityBinding(request());assert.equal(b.blocked,false);assert.equal(b.questionType,"diagram");assert.equal(b.questionCount.max,240);
 assert.equal(b.differentViewpointRecognitionRequired,true);assert.equal(b.rotationCompositionInvariantRequired,true);assert.equal(b.rotationAdjacencyInvariantRequired,true);
 assert.equal(b.appliedRuntimeModifierIds.join("|"),"mod_coordinate_map");assert.equal(b.frozenRuntimeProfile,"profile_spatial_solid");
 assert.equal(b.solidShapeClassificationReownershipAllowed,false);assert.equal(b.solidNetCorrespondenceReownershipAllowed,false);assert.equal(b.solidCrossSectionReownershipAllowed,false);
});

for(const patternSpecId of SPECS)test("W8 Q002 "+patternSpecId+" has 240 deterministic unique validated variants",()=>{
 const a=generateG5AU10AP08F02Questions({questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"}),b=generateG5AU10AP08F02Questions({questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
 assert.equal(a.ok,true,a.errors.join("\n"));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
 for(const q of a.questions){assert.equal(validateG5AU10AP08F02Question(q).ok,true);assert.equal(validateG5AU10AP08F02Answer(q,q.answerText).ok,true);assert.equal(q.metadata.q003OrLaterTouched,false);}
});

test("W8 Q002 quarter-turn semantics preserve composition and map visible faces correctly",()=>{
 const qs=generateG5AU10AP08F02Questions({questionCount:30,generationSeed:"semantics"}).questions;
 for(const q of qs){
  const d=q.geometryDiagram;assert.equal(d.quarterTurns,1);assert.equal(d.rotationAxis,"VERTICAL");assert.equal(d.compositionInvariant,true);assert.equal(d.adjacencyInvariant,true);
  if(q.relation==="TURN_VISIBLE_SIDE_TO_FRONT"||q.relation==="COMPLETE_ROTATED_VIEW_FACE_LABEL")assert.equal(q.answerText,d.sideLabel);
  if(q.relation==="TRACK_FRONT_FACE_AFTER_QUARTER_TURN")assert.equal(q.answerText,d.turnDirection==="CLOCKWISE"?"左面":"右面");
 }
});

test("W8 Q002 validator fails closed for wrong answers and future-scope leakage",()=>{
 const q=generateG5AU10AP08F02Questions({questionCount:1,patternSpecIds:[SPECS[0]],generationSeed:"wrong"}).questions[0];
 assert.equal(validateG5AU10AP08F02Answer(q,"錯").ok,false);
 assert.equal(validateG5AU10AP08F02Question({...q,metadata:{...q.metadata,solidShapeClassificationReowned:true}}).ok,false);
 assert.equal(validateG5AU10AP08F02Question({...q,geometryDiagram:{...q.geometryDiagram,quarterTurns:2}}).ok,false);
});

test("W8 Q002 aggregate browser generator worksheet and renderer are learner-facing",()=>{
 assert.equal(getBatchASourceUnit(SRC)?.title,"柱體錐體和球");assert.ok(listBatchASourceUnits({includeW8Slice002:true}).some(x=>x.sourceId===SRC));
 const p=buildBatchABrowserPlan(request({questionCount:12}));assert.deepEqual(p.selectedKnowledgePointIds,[KP]);assert.equal(p.questionCountMax,240);assert.equal(p.questionMode,"diagram");
 const g=generateBatchABrowserQuestions(request({questionCount:12}));assert.equal(g.ok,true,g.errors.join("\n"));assert.equal(g.questions.length,12);
 const w=buildBatchABrowserWorksheetDocument(request({questionCount:12,includeAnswerKey:true,printLayout:{columns:3,rowsPerPage:5,showAnswerKeyPage:true}}));assert.equal(w.ok,true,w.errors.join("\n"));
 assert.equal(w.worksheetDocument.printOptions.columns,2);assert.equal(w.worksheetDocument.printOptions.rowsPerPage,3);assert.equal(w.worksheetDocument.questionPages.length,2);assert.equal(w.worksheetDocument.answerKeyPages.length,2);
 const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""});assert.match(html,/worksheet-solid-viewpoint-representation-diagram/);assert.match(html,/data-representation="solid-viewpoint-representation-diagram"/);
 for(const x of ["kp_g5a_u10a_","P08F02","展開圖","截面","構成要素"])assert.equal(html.replace(/<[^>]*>/g," ").includes(x),false,x);
});

test("W8 Q002 same-unit mixed is fail-closed and validation stays bounded",()=>{
 const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[KP,PROTECTED[0]],questionMode:"diagram",questionCount:8});
 assert.equal(mixed.ok,false);
 assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");
 assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
 assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
