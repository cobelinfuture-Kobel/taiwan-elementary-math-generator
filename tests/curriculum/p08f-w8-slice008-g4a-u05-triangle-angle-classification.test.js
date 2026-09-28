import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {G4A_U05_P08F08_KP_ID as KP,G4A_U05_P08F08_PRIOR_KP_IDS as PRIOR,G4A_U05_P08F08_PROTECTED_FUTURE_KP_IDS as FUTURE,G4A_U05_P08F08_SOURCE_ID as SRC,G4A_U05_P08F08_SPEC_IDS as SPEC_IDS,G4A_U05_P08F08_FORMAL_MAPPING as FM,auditG4AU05P08F08Projection} from "../../site/modules/curriculum/registry/g4a-u05-triangle-angle-classification-selector-projection-p08f08.js";
import {BATCH_A_SELECTOR_AVAILABILITY,listVisibleBatchAKnowledgePoints,getVisibleBatchAKnowledgePoint,auditP08F08PublicSelectorComposition} from "../../site/modules/curriculum/registry/batch-a-selector-p08f08-extension.js";
import * as preSelector from "../../site/modules/curriculum/registry/batch-a-selector-p08f07-extension.js";
import {resolvePublicUiCapabilityBinding,auditPublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p08f08.js";
import {generateG4AU05P08F08Questions,validateG4AU05P08F08Question,validateG4AU05P08F08Answer} from "../../site/modules/curriculum/batch-a/g4a-u05-triangle-angle-classification-runtime-p08f08.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderTriangleAngleClassificationDiagram} from "../../site/modules/renderer/triangle-angle-classification-diagram-p08f08.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
const impact=JSON.parse(fs.readFileSync("data/project/change-impact/P08F_W8_Q008.impact.json","utf8"));
const validation=JSON.parse(fs.readFileSync("data/project/validation-plans/P08F_W8_Q008.validation.json","utf8"));
const req=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"diagram",questionCount:20,generationSeed:"p08f08-test",...extra});

test("W8 Q008 projection materializes exactly one FormalMapping, one group and three specs",()=>{
 const a=auditG4AU05P08F08Projection();assert.equal(a.ok,true,a.errors.join("\n"));assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1});
 assert.equal(FM.knowledgePointId,KP);assert.equal(FM.primaryRuntimeProfileId,"profile_geometry_property");assert.deepEqual(FM.appliedRuntimeModifierIds,[]);assert.deepEqual(FM.patternSpecIds,SPEC_IDS);
});

test("W8 Q008 public selector promotes angle classification and preserves prior/future G4A-U05 owners",()=>{
 const a=auditP08F08PublicSelectorComposition();assert.equal(a.ok,true,a.errors.join("\n"));
 const s=BATCH_A_SELECTOR_AVAILABILITY.bySourceId[SRC],ids=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId),before=preSelector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
 assert.equal(before.includes(KP),false);assert.ok(ids.includes(KP));assert.ok(PRIOR.every(id=>ids.includes(id)&&before.includes(id)));
 assert.equal(getVisibleBatchAKnowledgePoint(KP).displayName,"依角度分類三角形");
 for(const id of FUTURE){assert.equal(ids.includes(id),false);assert.ok(s.hiddenPendingKnowledgePointIds.includes(id));assert.ok(s.notSelectableKnowledgePointIds.includes(id));}
 assert.equal(s.sameSourceCandidateSetComplete,false);assert.equal(s.sameUnitMixedAllowed,false);
});

test("W8 Q008 public binding exposes bounded 240-question triangle-angle classification route",()=>{
 const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join("\n"));
 const b=resolvePublicUiCapabilityBinding(req());assert.equal(b.blocked,false);assert.equal(b.questionType,"diagram");assert.equal(b.questionCount.max,240);
 assert.equal(b.triangleAngleClassificationRequired,true);assert.equal(b.classificationBasis,"MAXIMUM_INTERIOR_ANGLE");assert.deepEqual(b.categorySet,["ACUTE_TRIANGLE","RIGHT_TRIANGLE","OBTUSE_TRIANGLE"]);assert.equal(b.rotationInvariantRequired,true);
 assert.equal(b.triangleElementsNamingReownershipAllowed,false);assert.equal(b.triangleSideClassificationReownershipAllowed,false);assert.equal(b.triangleInequalityReownershipAllowed,false);assert.equal(b.congruentTriangleCorrespondenceReownershipAllowed,false);assert.equal(b.sameUnitMixedAdmission,false);
});

for(const patternSpecId of SPEC_IDS)test("W8 Q008 "+patternSpecId+" has 240 deterministic unique validated variants",()=>{
 const o={selectedKnowledgePointIds:[KP],questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable-"+patternSpecId};
 const a=generateG4AU05P08F08Questions(o),b=generateG4AU05P08F08Questions(o);
 assert.equal(a.ok,true,a.errors.join("\n"));assert.deepEqual(a.questions,b.questions);assert.equal(a.questions.length,240);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
 assert.deepEqual([...new Set(a.questions.map(q=>q.geometryDiagram.rotationDeg))].sort((x,y)=>x-y),Array.from({length:24},(_,i)=>i*15));
 for(const q of a.questions){assert.equal(validateG4AU05P08F08Question(q).ok,true);assert.equal(validateG4AU05P08F08Answer(q,q.answerText).ok,true);assert.equal(q.metadata.q009OrLaterTouched,false);}
});

for(const count of [1,20,120,121,240])test("W8 Q008 generates "+count+" validated questions",()=>{
 const g=generateG4AU05P08F08Questions({selectedKnowledgePointIds:[KP],questionCount:count,generationSeed:"matrix-"+count});
 assert.equal(g.ok,true,g.errors.join("\n"));assert.equal(g.questions.length,count);assert.equal(new Set(g.questions.map(q=>q.questionSignature)).size,count);assert.ok(g.questions.every(q=>q.knowledgePointId===KP&&validateG4AU05P08F08Question(q).ok));
});

test("W8 Q008 classification is determined only by interior-angle structure and survives rotation",()=>{
 const qs=generateG4AU05P08F08Questions({selectedKnowledgePointIds:[KP],questionCount:240,generationSeed:"semantic-coverage"}).questions;
 assert.deepEqual([...new Set(qs.map(q=>q.answerText))].sort(),["銳角三角形","直角三角形","鈍角三角形"].sort());
 for(const q of qs){const d=q.geometryDiagram,angles=Object.values(d.interiorAnglesDeg),max=Math.max(...angles);assert.equal(angles.reduce((a,b)=>a+b,0),180);assert.equal(q.answerText,max<90?"銳角三角形":max===90?"直角三角形":"鈍角三角形");assert.equal(d.classificationBasis,"MAXIMUM_INTERIOR_ANGLE");assert.equal(d.rotationInvariant,true);}
});

test("W8 Q008 validator fails closed for wrong answer altered angles and ownership leakage",()=>{
 const q=generateG4AU05P08F08Questions({selectedKnowledgePointIds:[KP],questionCount:1,patternSpecIds:[SPEC_IDS[0]],generationSeed:"wrong"}).questions[0];
 assert.equal(validateG4AU05P08F08Answer(q,"直角三角形").ok,false);
 assert.equal(validateG4AU05P08F08Question({...q,metadata:{...q.metadata,triangleSideClassificationReowned:true}}).ok,false);
 assert.equal(validateG4AU05P08F08Question({...q,geometryDiagram:{...q.geometryDiagram,interiorAnglesDeg:{...q.geometryDiagram.interiorAnglesDeg,A:q.geometryDiagram.interiorAnglesDeg.A+5}}}).ok,false);
});

test("W8 Q008 aggregate generator worksheet and dedicated renderer are wired",()=>{
 const p=buildBatchABrowserPlan(req({questionCount:15}));assert.deepEqual(p.selectedKnowledgePointIds,[KP]);assert.equal(p.questionCountMax,240);assert.equal(p.questionMode,"diagram");
 const g=generateBatchABrowserQuestions(req({questionCount:15}));assert.equal(g.ok,true,g.errors.join("\n"));assert.equal(g.questions.length,15);assert.ok(g.questions.every(q=>q.knowledgePointId===KP));
 const direct=renderTriangleAngleClassificationDiagram(g.questions[0].geometryDiagram);assert.match(direct,/worksheet-triangle-angle-classification-diagram/);assert.match(direct,/data-representation="triangle-angle-classification-diagram"/);
 const w=buildBatchABrowserWorksheetDocument(req({questionCount:15,includeAnswerKey:true,printLayout:{columns:3,rowsPerPage:5,showAnswerKeyPage:true}}));assert.equal(w.ok,true,w.errors.join("\n"));
 assert.equal(w.worksheetDocument.printOptions.columns,2);assert.equal(w.worksheetDocument.printOptions.rowsPerPage,3);assert.equal(w.worksheetDocument.questionPages.length,3);assert.equal(w.worksheetDocument.answerKeyPages.length,3);
 const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""});assert.match(html,/worksheet-triangle-angle-classification-diagram/);assert.match(html,/data-representation="triangle-angle-classification-diagram"/);
 const learner=html.replace(/<[^>]*>/g," ");for(const x of ["kp_","P08F08","邊長分類","三角形不等式","全等","作圖"])assert.equal(learner.includes(x),false,x);
});

test("W8 Q008 prior G4A-U05 owners remain selector-reachable while same-unit mixed stays fail-closed",()=>{
 for(const prior of PRIOR)assert.ok(getVisibleBatchAKnowledgePoint(prior),prior);
 const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[PRIOR[1],KP],questionMode:"diagram",questionCount:8});assert.equal(mixed.ok,false);
 assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
 assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
