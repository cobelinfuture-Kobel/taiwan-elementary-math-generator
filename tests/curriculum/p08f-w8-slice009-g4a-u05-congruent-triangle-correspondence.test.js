import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {G4A_U05_P08F09_KP_ID as KP,G4A_U05_P08F09_PRIOR_KP_IDS as PRIOR,G4A_U05_P08F09_PROTECTED_FUTURE_KP_IDS as FUTURE,G4A_U05_P08F09_SOURCE_ID as SRC,G4A_U05_P08F09_SPEC_IDS as SPEC_IDS,G4A_U05_P08F09_FORMAL_MAPPING as FM,auditG4AU05P08F09Projection} from "../../site/modules/curriculum/registry/g4a-u05-congruent-triangle-correspondence-selector-projection-p08f09.js";
import {BATCH_A_SELECTOR_AVAILABILITY,listVisibleBatchAKnowledgePoints,getVisibleBatchAKnowledgePoint,auditP08F09PublicSelectorComposition} from "../../site/modules/curriculum/registry/batch-a-selector-p08f09-extension.js";
import * as preSelector from "../../site/modules/curriculum/registry/batch-a-selector-p08f08-extension.js";
import {resolvePublicUiCapabilityBinding,auditPublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p08f09.js";
import {generateG4AU05P08F09Questions,validateG4AU05P08F09Question,validateG4AU05P08F09Answer} from "../../site/modules/curriculum/batch-a/g4a-u05-congruent-triangle-correspondence-runtime-p08f09.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderCongruentTriangleCorrespondenceDiagram} from "../../site/modules/renderer/congruent-triangle-correspondence-diagram-p08f09.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
const impact=JSON.parse(fs.readFileSync("data/project/change-impact/P08F_W8_Q009.impact.json","utf8"));
const validation=JSON.parse(fs.readFileSync("data/project/validation-plans/P08F_W8_Q009.validation.json","utf8"));
const req=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"diagram",questionCount:20,generationSeed:"p08f09-test",...extra});
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

test("W8 Q009 projection materializes exactly one FormalMapping, one group and three specs",()=>{
 const a=auditG4AU05P08F09Projection();assert.equal(a.ok,true,a.errors.join("\n"));assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1});
 assert.equal(FM.knowledgePointId,KP);assert.equal(FM.primaryRuntimeProfileId,"profile_geometry_property");assert.deepEqual(FM.appliedRuntimeModifierIds,[]);assert.deepEqual(FM.patternSpecIds,SPEC_IDS);
});

test("W8 Q009 public selector promotes final G4A-U05 target and preserves all prior owners",()=>{
 const a=auditP08F09PublicSelectorComposition();assert.equal(a.ok,true,a.errors.join("\n"));
 const s=BATCH_A_SELECTOR_AVAILABILITY.bySourceId[SRC],ids=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId),before=preSelector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
 assert.equal(before.includes(KP),false);assert.ok(ids.includes(KP));assert.ok(PRIOR.every(id=>ids.includes(id)&&before.includes(id)));assert.deepEqual(FUTURE,[]);
 assert.equal(getVisibleBatchAKnowledgePoint(KP).displayName,"全等三角形對應關係");assert.equal(s.sameSourceCandidateSetComplete,true);assert.equal(s.sameUnitMixedAllowed,false);assert.equal(s.hiddenPendingKnowledgePointIds.includes(KP),false);assert.equal(s.notSelectableKnowledgePointIds.includes(KP),false);
});

test("W8 Q009 public binding exposes bounded congruent-correspondence route",()=>{
 const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join("\n"));
 const b=resolvePublicUiCapabilityBinding(req());assert.equal(b.blocked,false);assert.equal(b.questionType,"diagram");assert.equal(b.questionCount.max,240);
 assert.equal(b.congruentTriangleCorrespondenceRequired,true);assert.deepEqual(b.allowedRigidMotions,["TRANSLATION","ROTATION","REFLECTION"]);assert.equal(b.sameShapeRequired,true);assert.equal(b.sameSizeRequired,true);assert.equal(b.correspondingSidesEqualRequired,true);assert.equal(b.correspondingAnglesEqualRequired,true);assert.equal(b.vertexCorrespondenceConsistencyRequired,true);
 assert.equal(b.triangleElementsNamingReownershipAllowed,false);assert.equal(b.triangleSideClassificationReownershipAllowed,false);assert.equal(b.triangleInequalityReownershipAllowed,false);assert.equal(b.triangleAngleClassificationReownershipAllowed,false);assert.equal(b.sameUnitMixedAdmission,false);
});

for(const patternSpecId of SPEC_IDS)test("W8 Q009 "+patternSpecId+" has 240 deterministic unique validated variants",()=>{
 const o={selectedKnowledgePointIds:[KP],questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable-"+patternSpecId};
 const a=generateG4AU05P08F09Questions(o),b=generateG4AU05P08F09Questions(o);
 assert.equal(a.ok,true,a.errors.join("\n"));assert.deepEqual(a.questions,b.questions);assert.equal(a.questions.length,240);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
 assert.deepEqual([...new Set(a.questions.map(q=>q.geometryDiagram.transformMode))].sort(),["REFLECTION","ROTATION","TRANSLATION"]);
 for(const q of a.questions){assert.equal(validateG4AU05P08F09Question(q).ok,true);assert.equal(validateG4AU05P08F09Answer(q,q.answerText).ok,true);assert.equal(q.metadata.q010OrLaterTouched,false);}
});

for(const count of [1,20,120,121,240])test("W8 Q009 generates "+count+" validated questions",()=>{
 const g=generateG4AU05P08F09Questions({selectedKnowledgePointIds:[KP],questionCount:count,generationSeed:"matrix-"+count});
 assert.equal(g.ok,true,g.errors.join("\n"));assert.equal(g.questions.length,count);assert.equal(new Set(g.questions.map(q=>q.questionSignature)).size,count);assert.ok(g.questions.every(q=>q.knowledgePointId===KP&&validateG4AU05P08F09Question(q).ok));
});

test("W8 Q009 preserves congruence under translation rotation and reflection",()=>{
 const qs=generateG4AU05P08F09Questions({selectedKnowledgePointIds:[KP],questionCount:240,generationSeed:"semantic-coverage"}).questions;
 assert.deepEqual([...new Set(qs.map(q=>q.geometryDiagram.transformMode))].sort(),["REFLECTION","ROTATION","TRANSLATION"]);
 for(const q of qs){const d=q.geometryDiagram;for(const [a,b] of [[0,1],[1,2],[2,0]])assert.ok(Math.abs(distance(d.leftVertices[a],d.leftVertices[b])-distance(d.rightVertices[a],d.rightVertices[b]))<0.15);assert.equal(d.vertexCorrespondence.A,"D");assert.equal(d.vertexCorrespondence.B,"E");assert.equal(d.vertexCorrespondence.C,"F");assert.equal(d.sideCorrespondence.AB,"DE");assert.equal(d.sideCorrespondence.BC,"EF");assert.equal(d.sideCorrespondence.CA,"FD");assert.deepEqual(d.sideTickCounts,{AB:1,BC:2,CA:3,DE:1,EF:2,FD:3});assert.equal(d.sideMeasurementEvidence,"EXPLICIT_NUMERIC_LABELS_PLUS_MATCHED_TICK_MARKS");assert.equal(d.rulerMeasurementRequired,false);assert.equal(d.printScaleIsAnswerAuthority,false);}
});

test("W8 Q009 correspondence task covers vertices sides and angles consistently",()=>{
 const qs=generateG4AU05P08F09Questions({selectedKnowledgePointIds:[KP],questionCount:90,patternSpecIds:[SPEC_IDS[1]],generationSeed:"correspondence"}).questions;
 assert.deepEqual([...new Set(qs.map(q=>q.geometryDiagram.targetKind))].sort(),["ANGLE","SIDE","VERTEX"]);
 for(const q of qs){const d=q.geometryDiagram;if(d.targetKind==="VERTEX")assert.equal(q.answerText,d.vertexCorrespondence[d.sourceToken]);if(d.targetKind==="SIDE")assert.equal(q.answerText,d.sideCorrespondence[d.sourceToken]);if(d.targetKind==="ANGLE")assert.equal(q.answerText,d.angleCorrespondence[d.sourceToken]);}
});

test("W8 Q009 measure transfer uses equal corresponding side lengths",()=>{
 const qs=generateG4AU05P08F09Questions({selectedKnowledgePointIds:[KP],questionCount:60,patternSpecIds:[SPEC_IDS[2]],generationSeed:"measure-transfer"}).questions;
 for(const q of qs){const d=q.geometryDiagram;assert.equal(q.answerValue,d.knownMeasureCm);assert.equal(q.answerText,`${d.knownMeasureCm} 公分`);assert.equal(d.sideCorrespondence[d.sourceToken],d.targetToken);}
});

test("W8 Q009 learner diagrams expose numeric side evidence and matching tick marks without ruler dependency",()=>{
 const identify=generateG4AU05P08F09Questions({selectedKnowledgePointIds:[KP],questionCount:1,patternSpecIds:[SPEC_IDS[0]],generationSeed:"explicit-evidence-identify"}).questions[0];
 const identifyHtml=renderCongruentTriangleCorrespondenceDiagram(identify.geometryDiagram);
 assert.equal((identifyHtml.match(/class="p08f09-side-tick"/g)||[]).length,12);
 assert.equal((identifyHtml.match(/class="p08f09-side-length-label"/g)||[]).length,6);
 assert.match(identifyHtml,/data-side-evidence="numeric-plus-ticks"/);assert.match(identifyHtml,/data-ruler-required="false"/);assert.match(identifyHtml,/相同刻痕表示等長；邊長單位：公分/);
 for(const token of ["AB","BC","CA","DE","EF","FD"])assert.match(identifyHtml,new RegExp(`data-side-token="${token}"`));
 const transfer=generateG4AU05P08F09Questions({selectedKnowledgePointIds:[KP],questionCount:1,patternSpecIds:[SPEC_IDS[2]],generationSeed:"explicit-evidence-transfer"}).questions[0];
 const transferHtml=renderCongruentTriangleCorrespondenceDiagram(transfer.geometryDiagram);
 assert.equal((transferHtml.match(/class="p08f09-side-tick"/g)||[]).length,12);assert.equal((transferHtml.match(/class="p08f09-side-length-label"/g)||[]).length,6);assert.match(transferHtml,/>\?<\/text>/);
 assert.equal(transfer.geometryDiagram.rulerMeasurementRequired,false);assert.equal(transfer.geometryDiagram.printScaleIsAnswerAuthority,false);
});

test("W8 Q009 validator fails closed for wrong answer altered geometry and ownership leakage",()=>{
 const q=generateG4AU05P08F09Questions({selectedKnowledgePointIds:[KP],questionCount:1,patternSpecIds:[SPEC_IDS[1]],generationSeed:"wrong"}).questions[0];
 assert.equal(validateG4AU05P08F09Answer(q,"錯誤").ok,false);
 assert.equal(validateG4AU05P08F09Question({...q,metadata:{...q.metadata,triangleAngleClassificationReowned:true}}).ok,false);
 const rv=q.geometryDiagram.rightVertices.map((v,i)=>i===0?{...v,x:v.x+8}:v);
 assert.equal(validateG4AU05P08F09Question({...q,geometryDiagram:{...q.geometryDiagram,rightVertices:rv}}).ok,false);
});

test("W8 Q009 aggregate generator worksheet and dedicated renderer are wired",()=>{
 const p=buildBatchABrowserPlan(req({questionCount:15}));assert.deepEqual(p.selectedKnowledgePointIds,[KP]);assert.equal(p.questionCountMax,240);assert.equal(p.questionMode,"diagram");
 const g=generateBatchABrowserQuestions(req({questionCount:15}));assert.equal(g.ok,true,g.errors.join("\n"));assert.equal(g.questions.length,15);assert.ok(g.questions.every(q=>q.knowledgePointId===KP));
 const direct=renderCongruentTriangleCorrespondenceDiagram(g.questions[0].geometryDiagram);assert.match(direct,/worksheet-congruent-triangle-correspondence-diagram/);assert.match(direct,/data-representation="congruent-triangle-correspondence-diagram"/);assert.match(direct,/p08f09-side-tick/);assert.match(direct,/p08f09-side-length-label/);assert.match(direct,/data-ruler-required="false"/);
 const w=buildBatchABrowserWorksheetDocument(req({questionCount:15,includeAnswerKey:true,printLayout:{columns:3,rowsPerPage:5,showAnswerKeyPage:true}}));assert.equal(w.ok,true,w.errors.join("\n"));
 assert.equal(w.worksheetDocument.printOptions.columns,2);assert.equal(w.worksheetDocument.printOptions.rowsPerPage,3);assert.equal(w.worksheetDocument.questionPages.length,3);assert.equal(w.worksheetDocument.answerKeyPages.length,3);
 const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""});assert.match(html,/worksheet-congruent-triangle-correspondence-diagram/);assert.match(html,/data-representation="congruent-triangle-correspondence-diagram"/);
 const learner=html.replace(/<[^>]*>/g," ");for(const x of ["kp_","P08F09","三角形不等式","依邊長分類","依角度分類","作圖"])assert.equal(learner.includes(x),false,x);
});

test("W8 Q009 prior G4A-U05 owners remain selector-reachable while same-unit mixed stays fail-closed",()=>{
 for(const prior of PRIOR)assert.ok(getVisibleBatchAKnowledgePoint(prior),prior);
 const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[PRIOR[3],KP],questionMode:"diagram",questionCount:8});assert.equal(mixed.ok,false);
 assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
 assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
