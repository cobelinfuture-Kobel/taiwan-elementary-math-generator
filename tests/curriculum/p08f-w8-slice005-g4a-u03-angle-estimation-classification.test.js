import test from "node:test";
import assert from "node:assert/strict";
import {G4A_U03_P08F05_KP_ID as KP,G4A_U03_P08F05_PRIOR_KP_IDS as PRIOR,G4A_U03_P08F05_PROTECTED_FUTURE_KP_IDS as FUTURE,G4A_U03_P08F05_SOURCE_ID as SRC,G4A_U03_P08F05_SPEC_IDS as SPEC_IDS,G4A_U03_P08F05_FORMAL_MAPPING as FM,auditG4AU03P08F05Projection} from "../../site/modules/curriculum/registry/g4a-u03-angle-estimation-classification-selector-projection-p08f05.js";
import {BATCH_A_SELECTOR_AVAILABILITY,listVisibleBatchAKnowledgePoints,getVisibleBatchAKnowledgePoint,auditP08F05PublicSelectorComposition} from "../../site/modules/curriculum/registry/batch-a-selector-p08f05-extension.js";
import {resolvePublicUiCapabilityBinding,auditPublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p08f05.js";
import {generateG4AU03P08F05Questions,validateG4AU03P08F05Question,validateG4AU03P08F05Answer} from "../../site/modules/curriculum/batch-a/g4a-u03-angle-estimation-classification-runtime-p08f05.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderAngleEstimationClassificationDiagram} from "../../site/modules/renderer/angle-estimation-classification-diagram-p08f05.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import fs from "node:fs";
const impact=JSON.parse(fs.readFileSync("data/project/change-impact/P08F_W8_Q005.impact.json","utf8"));
const validation=JSON.parse(fs.readFileSync("data/project/validation-plans/P08F_W8_Q005.validation.json","utf8"));
const req=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"diagram",questionCount:20,generationSeed:"p08f05-test",...extra});

test("W8 Q005 projection materializes exactly one FormalMapping, one group and three specs",()=>{
 const a=auditG4AU03P08F05Projection();assert.equal(a.ok,true,a.errors.join("\n"));assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1});
 assert.equal(FM.knowledgePointId,KP);assert.equal(FM.primaryRuntimeProfileId,"profile_geometry_property");assert.deepEqual(FM.appliedRuntimeModifierIds,[]);assert.deepEqual(FM.patternSpecIds,SPEC_IDS);
});

test("W8 Q005 public selector promotes only target and preserves prior/future ownership",()=>{
 const a=auditP08F05PublicSelectorComposition();assert.equal(a.ok,true,a.errors.join("\n"));
 const s=BATCH_A_SELECTOR_AVAILABILITY.bySourceId[SRC],ids=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
 assert.ok(ids.includes(KP));assert.ok(PRIOR.every(id=>ids.includes(id)));assert.ok(FUTURE.every(id=>!ids.includes(id)&&s.hiddenPendingKnowledgePointIds.includes(id)&&s.notSelectableKnowledgePointIds.includes(id)));
 assert.equal(getVisibleBatchAKnowledgePoint(KP).displayName,"角度估測與分類");assert.equal(s.sameUnitMixedAllowed,false);
});

test("W8 Q005 public binding exposes bounded 240-question diagram route",()=>{
 const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join("\n"));
 const b=resolvePublicUiCapabilityBinding(req());assert.equal(b.blocked,false);assert.equal(b.questionType,"diagram");assert.equal(b.questionCount.max,240);
 assert.equal(b.angleEstimationClassificationRequired,true);assert.equal(b.referenceAngleEstimateRequired,true);assert.equal(b.classificationByMagnitudeRangeRequired,true);assert.equal(b.classificationIndependentOfArmLengthRequired,true);
 assert.equal(b.protractorMeasurementReownershipAllowed,false);assert.equal(b.angleCompositionDecompositionReownershipAllowed,false);assert.equal(b.rotationClockAngleReownershipAllowed,false);assert.equal(b.linearFullVerticalUnknownAngleReownershipAllowed,false);assert.equal(b.sameUnitMixedAdmission,false);
});

for(const patternSpecId of SPEC_IDS)test("W8 Q005 "+patternSpecId+" has 240 deterministic unique validated variants",()=>{
 const o={selectedKnowledgePointIds:[KP],questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable-"+patternSpecId};
 const a=generateG4AU03P08F05Questions(o),b=generateG4AU03P08F05Questions(o);
 assert.equal(a.ok,true,a.errors.join("\n"));assert.deepEqual(a.questions,b.questions);assert.equal(a.questions.length,240);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
 for(const q of a.questions){assert.equal(validateG4AU03P08F05Question(q).ok,true);assert.equal(validateG4AU03P08F05Answer(q,q.answerText).ok,true);assert.equal(q.metadata.q006OrLaterTouched,false);}
});

for(const count of [1,20,120,121,240])test("W8 Q005 generates "+count+" validated questions",()=>{
 const g=generateG4AU03P08F05Questions({selectedKnowledgePointIds:[KP],questionCount:count,generationSeed:"matrix-"+count});
 assert.equal(g.ok,true,g.errors.join("\n"));assert.equal(g.questions.length,count);assert.equal(new Set(g.questions.map(q=>q.questionSignature)).size,count);assert.ok(g.questions.every(q=>q.knowledgePointId===KP&&validateG4AU03P08F05Question(q).ok));
});

test("W8 Q005 relation coverage stays inside estimation classification semantics",()=>{
 const qs=generateG4AU03P08F05Questions({selectedKnowledgePointIds:[KP],questionCount:90,generationSeed:"semantic-coverage"}).questions;
 assert.deepEqual([...new Set(qs.map(q=>q.relation))].sort(),["ESTIMATE_ANGLE_USING_REFERENCE_ANGLE","CLASSIFY_ANGLE_BY_MAGNITUDE_RANGE","RECOGNIZE_CLASSIFICATION_INVARIANT_UNDER_ARM_LENGTH_CHANGE"].sort());
 for(const q of qs){assert.equal(q.geometryDiagram.protractorShown,false);assert.equal(q.geometryDiagram.exactDegreeLabelShown,false);if(q.relation==="ESTIMATE_ANGLE_USING_REFERENCE_ANGLE")assert.equal(q.geometryDiagram.referenceAngleDeg,90);if(q.relation==="RECOGNIZE_CLASSIFICATION_INVARIANT_UNDER_ARM_LENGTH_CHANGE")assert.equal(q.geometryDiagram.classificationIndependentOfArmLength,true);}
});

test("W8 Q005 validator fails closed for wrong answer, altered geometry and ownership leakage",()=>{
 const q=generateG4AU03P08F05Questions({selectedKnowledgePointIds:[KP],questionCount:1,patternSpecIds:[SPEC_IDS[0]],generationSeed:"wrong"}).questions[0];
 assert.equal(validateG4AU03P08F05Answer(q,"999").ok,false);
 assert.equal(validateG4AU03P08F05Question({...q,metadata:{...q.metadata,protractorMeasurementReowned:true}}).ok,false);
 assert.equal(validateG4AU03P08F05Question({...q,geometryDiagram:{...q.geometryDiagram,referenceAngleDeg:45}}).ok,false);
});

test("W8 Q005 aggregate generator worksheet and dedicated renderer are wired",()=>{
 const p=buildBatchABrowserPlan(req({questionCount:15}));assert.deepEqual(p.selectedKnowledgePointIds,[KP]);assert.equal(p.questionCountMax,240);assert.equal(p.questionMode,"diagram");
 const g=generateBatchABrowserQuestions(req({questionCount:15}));assert.equal(g.ok,true,g.errors.join("\n"));assert.equal(g.questions.length,15);assert.ok(g.questions.every(q=>q.knowledgePointId===KP));
 const direct=renderAngleEstimationClassificationDiagram(g.questions[0].geometryDiagram);assert.match(direct,/worksheet-angle-estimation-classification-diagram/);assert.match(direct,/data-representation="angle-estimation-classification-diagram"/);
 const w=buildBatchABrowserWorksheetDocument(req({questionCount:15,includeAnswerKey:true,printLayout:{columns:3,rowsPerPage:5,showAnswerKeyPage:true}}));assert.equal(w.ok,true,w.errors.join("\n"));
 assert.equal(w.worksheetDocument.printOptions.columns,2);assert.equal(w.worksheetDocument.printOptions.rowsPerPage,3);assert.equal(w.worksheetDocument.questionPages.length,3);assert.equal(w.worksheetDocument.answerKeyPages.length,3);
 const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""});assert.match(html,/worksheet-angle-estimation-classification-diagram/);assert.match(html,/data-representation="angle-estimation-classification-diagram"/);
 const learner=html.replace(/<[^>]*>/g," ");for(const x of ["kp_","P08F05","量角器","角的合成與分解","旋轉角與鐘面角","對頂角"])assert.equal(learner.includes(x),false,x);
});

test("W8 Q005 prior G4A-U03 owners remain reachable while same-unit mixed stays fail-closed",()=>{
 for(const prior of PRIOR){const g=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[prior],questionMode:"diagram",questionCount:3,generationSeed:"prior-"+prior});assert.equal(g.ok,true,g.errors?.join("\n"));assert.ok(g.questions.every(q=>q.knowledgePointId===prior));}
 const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[PRIOR[0],KP],questionMode:"diagram",questionCount:8});assert.equal(mixed.ok,false);
 assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
 assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
