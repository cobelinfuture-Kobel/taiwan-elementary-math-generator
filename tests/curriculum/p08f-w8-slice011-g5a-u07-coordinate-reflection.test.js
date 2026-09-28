import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

import {
 G5A_U07_P08F11_APPLIED_MODIFIER_IDS,
 G5A_U07_P08F11_BLOCKING_CAPABILITY_IDS,
 G5A_U07_P08F11_FORMAL_MAPPING,
 G5A_U07_P08F11_KP_ID as KP,
 G5A_U07_P08F11_PATTERN_GROUP as GROUP,
 G5A_U07_P08F11_PATTERN_SPECS as SPECS,
 G5A_U07_P08F11_PRIOR_KP_IDS as PRIOR,
 G5A_U07_P08F11_REQUIRED_CAPABILITY_IDS,
 G5A_U07_P08F11_SOURCE_ID as SRC,
 G5A_U07_P08F11_SPEC_IDS as SPEC_IDS,
 auditG5AU07P08F11Projection
} from "../../site/modules/curriculum/registry/g5a-u07-coordinate-reflection-selector-projection-p08f11.js";
import {
 BATCH_A_SELECTOR_AVAILABILITY,
 auditP08F11PublicSelectorComposition,
 getVisibleBatchAKnowledgePoint,
 listBatchAKnowledgePointAvailabilityBySource
} from "../../site/modules/curriculum/registry/batch-a-selector-p08f11-extension.js";
import {resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p08f11.js";
import {
 generateG5AU07P08F11Questions,
 validateG5AU07P08F11Answer,
 validateG5AU07P08F11Question
} from "../../site/modules/curriculum/batch-a/g5a-u07-coordinate-reflection-runtime-p08f11.js";
import {
 buildBatchABrowserPlan,
 generateBatchABrowserQuestions
} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderCoordinateReflectionDiagramP08F11} from "../../site/modules/renderer/coordinate-reflection-diagram-p08f11.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";

const read=p=>JSON.parse(readFileSync(p,"utf8"));
const impl=read("data/curriculum/full-product/p08f/q011-g5a-u07-coordinate-reflection-implementation.json");
const impact=read("data/project/change-impact/P08F_W8_Q011.impact.json");
const validation=read("data/project/validation-plans/P08F_W8_Q011.validation.json");
const preflight=read("data/curriculum/full-product/p08f/q011-g5a-u07-coordinate-reflection-source-authority-preflight.json");
const q010=read("data/curriculum/full-product/p08f/q010-final-learner-visual-d0-closeout.json");
const req=(o={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"diagram",...o});

test("W8 Q011 consumes human-accepted Q010 D0 and exact eleventh frozen queue identity",()=>{
 assert.equal(q010.status,"Q010_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");assert.equal(q010.operatorAcceptance.d0Granted,true);
 assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");assert.equal(impl.preflight.mergeSha,"86507c860c754103a5f8eabc9554629c0a37f90a");
 assert.equal(impl.queueAuthority.queuePosition,11);assert.equal(impl.queueAuthority.sliceId,"p08e_q011_r5_g5a_u07_5a07_profile_geometry_property_c1");
 assert.deepEqual(impl.queueAuthority.knowledgePointIds,[KP]);assert.equal(impl.queueAuthority.runtimeProfileId,"profile_geometry_property");assert.deepEqual(impl.queueAuthority.appliedRuntimeModifierIds,["mod_coordinate_map"]);
});

test("W8 Q011 materializes one FormalMapping, one PatternGroup and three source-bounded PatternSpecs",()=>{
 assert.equal(auditG5AU07P08F11Projection().ok,true);
 assert.equal(G5A_U07_P08F11_FORMAL_MAPPING.knowledgePointId,KP);assert.equal(G5A_U07_P08F11_FORMAL_MAPPING.sourceId,SRC);assert.deepEqual(G5A_U07_P08F11_FORMAL_MAPPING.sourcePages,[1]);
 assert.equal(GROUP.primaryKnowledgePointId,KP);assert.equal(SPECS.length,3);assert.deepEqual(SPECS.map(x=>x.patternSpecId),[...SPEC_IDS]);
 assert.deepEqual(G5A_U07_P08F11_APPLIED_MODIFIER_IDS,["mod_coordinate_map"]);
 assert.deepEqual(G5A_U07_P08F11_BLOCKING_CAPABILITY_IDS,["cap_coordinate_map_representation","cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_property_reasoning"]);
 assert.ok(G5A_U07_P08F11_REQUIRED_CAPABILITY_IDS.includes("cap_coordinate_map_representation"));
 for(const s of SPECS){assert.equal(s.questionMode,"diagram");assert.equal(s.answerDomain,"COORDINATE_PAIR_TEXT");assert.equal(s.coordinateOrGridRepresentationRequired,true);assert.equal(s.geometryConstructionAllowed,false);}
});

test("W8 Q011 selector promotes only coordinate reflection and preserves prior same-source owners",()=>{
 const audit=auditP08F11PublicSelectorComposition();assert.equal(audit.ok,true,audit.errors.join("\n"));
 const s=listBatchAKnowledgePointAvailabilityBySource(SRC);assert.ok(s.visibleKnowledgePointIds.includes(KP));assert.equal(s.hiddenPendingKnowledgePointIds.includes(KP),false);assert.equal(s.notSelectableKnowledgePointIds.includes(KP),false);
 assert.equal(s.sameSourceCandidateSetComplete,true);assert.equal(s.sameUnitMixedAllowed,false);
 assert.ok(getVisibleBatchAKnowledgePoint(KP));for(const id of PRIOR){assert.ok(s.visibleKnowledgePointIds.includes(id),id);assert.ok(getVisibleBatchAKnowledgePoint(id),id);}
 assert.equal(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[SRC].q011AddedKnowledgePointIds[0],KP);
});

test("W8 Q011 public binding stays coordinate-reflection-only and same-unit mixing fail-closed",()=>{
 const b=resolvePublicUiCapabilityBinding(req());
 assert.equal(b.blocked,false);assert.equal(b.questionType,"diagram");assert.equal(b.questionCount.max,240);
 assert.equal(b.coordinateReflectionRequired,true);assert.equal(b.coordinateMapRepresentationRequired,true);assert.equal(b.reflectionAxisRequired,true);assert.equal(b.perpendicularDistancePreserved,true);assert.equal(b.lengthAndAnglePreserved,true);assert.equal(b.pointsOnAxisRemainFixed,true);
 assert.equal(b.lineSymmetryRecognitionReownershipAllowed,false);assert.equal(b.symmetryAxisCountReownershipAllowed,false);assert.equal(b.symmetricPointDistanceStandaloneReownershipAllowed,false);assert.equal(b.completeSymmetricFigureReownershipAllowed,false);assert.equal(b.geometryConstructionReownershipAllowed,false);
 assert.equal(b.sameUnitMixedAdmission,false);assert.equal(b.crossUnitMixedAdmission,false);assert.deepEqual(b.appliedRuntimeModifierIds,["mod_coordinate_map"]);
});

for(const patternSpecId of SPEC_IDS)test("W8 Q011 "+patternSpecId+" has 240 deterministic unique validated variants",()=>{
 const o={selectedKnowledgePointIds:[KP],questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable-"+patternSpecId};
 const a=generateG5AU07P08F11Questions(o),b=generateG5AU07P08F11Questions(o);
 assert.equal(a.ok,true,a.errors.join("\n"));assert.deepEqual(a.questions,b.questions);assert.equal(a.questions.length,240);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
 for(const q of a.questions){
  assert.equal(validateG5AU07P08F11Question(q).ok,true);assert.equal(validateG5AU07P08F11Answer(q,q.answerText).ok,true);
  const d=q.geometryDiagram;
  if(d.axis.orientation==="VERTICAL"){assert.equal(d.sourcePoint.y,d.reflectedPoint.y);assert.equal(d.sourcePoint.x+d.reflectedPoint.x,2*d.axis.value);}
  else{assert.equal(d.sourcePoint.x,d.reflectedPoint.x);assert.equal(d.sourcePoint.y+d.reflectedPoint.y,2*d.axis.value);}
  assert.equal(d.reflectedPointVisible,false);assert.equal(q.answerGeometryDiagram.reflectedPointVisible,true);assert.equal(q.metadata.q012OrLaterTouched,false);assert.equal(q.metadata.rulerMeasurementRequired,false);assert.equal(q.metadata.printScaleIsAnswerAuthority,false);
 }
});

for(const count of [1,20,120,121,240])test("W8 Q011 generates "+count+" validated questions under exact KP",()=>{
 const g=generateG5AU07P08F11Questions({selectedKnowledgePointIds:[KP],questionCount:count,generationSeed:"matrix-"+count});
 assert.equal(g.ok,true,g.errors.join("\n"));assert.equal(g.questions.length,count);assert.equal(new Set(g.questions.map(q=>q.questionSignature)).size,count);assert.ok(g.questions.every(q=>q.knowledgePointId===KP&&validateG5AU07P08F11Question(q).ok));
});

test("W8 Q011 relation coverage remains coordinate reflection semantics",()=>{
 const qs=generateG5AU07P08F11Questions({selectedKnowledgePointIds:[KP],questionCount:90,generationSeed:"semantic-coverage"}).questions;
 assert.deepEqual([...new Set(qs.map(q=>q.relation))].sort(),["REFLECT_POINT_ACROSS_VERTICAL_AXIS","REFLECT_POINT_ACROSS_HORIZONTAL_AXIS","REFLECT_POINT_ACROSS_SHIFTED_GRID_AXIS"].sort());
 for(const q of qs){const d=q.geometryDiagram;assert.equal(d.coordinateOrGridRepresentationRequired,true);assert.equal(d.perpendicularDistanceToAxisPreserved,true);assert.equal(d.segmentLengthsPreserved,true);assert.equal(d.angleMeasuresPreserved,true);assert.equal(d.reflectionAxisRequired,true);assert.equal(q.metadata.axisOrientationHintRequired,true);}
});

test("W8 Q011 learner hints make x/y axis orientation and reflection direction explicit",()=>{
 const vertical=generateG5AU07P08F11Questions({selectedKnowledgePointIds:[KP],questionCount:1,patternSpecIds:[SPEC_IDS[0]],generationSeed:"axis-hint-v"}).questions[0];
 const horizontal=generateG5AU07P08F11Questions({selectedKnowledgePointIds:[KP],questionCount:1,patternSpecIds:[SPEC_IDS[1]],generationSeed:"axis-hint-h"}).questions[0];
 const shifted=generateG5AU07P08F11Questions({selectedKnowledgePointIds:[KP],questionCount:40,patternSpecIds:[SPEC_IDS[2]],generationSeed:"axis-hint-shifted"}).questions;
 assert.match(vertical.promptText,/y 軸是垂直線，做左右鏡射；y 座標不變/);
 assert.match(horizontal.promptText,/x 軸是水平線，做上下鏡射；x 座標不變/);
 const vShift=shifted.find(q=>q.geometryDiagram.axis.orientation==="VERTICAL"),hShift=shifted.find(q=>q.geometryDiagram.axis.orientation==="HORIZONTAL");
 assert.ok(vShift);assert.ok(hShift);
 assert.match(vShift.promptText,/是垂直線，做左右鏡射；y 座標不變/);
 assert.match(hShift.promptText,/是水平線，做上下鏡射；x 座標不變/);
 const verticalHtml=renderCoordinateReflectionDiagramP08F11(vertical.geometryDiagram),horizontalHtml=renderCoordinateReflectionDiagramP08F11(horizontal.geometryDiagram);
 assert.match(verticalHtml,/y 軸（x = 0，垂直線，左右鏡射）/);
 assert.match(horizontalHtml,/x 軸（y = 0，水平線，上下鏡射）/);
});

test("W8 Q011 validator accepts normalized coordinate punctuation but fails wrong coordinate, altered diagram and ownership leakage",()=>{
 const q=generateG5AU07P08F11Questions({selectedKnowledgePointIds:[KP],questionCount:1,patternSpecIds:[SPEC_IDS[0]],generationSeed:"wrong"}).questions[0];
 assert.equal(validateG5AU07P08F11Answer(q,q.answerText.replace("(","（").replace(")", "）").replace(",", "，")).ok,true);
 assert.equal(validateG5AU07P08F11Answer(q,"(99, 99)").ok,false);
 assert.equal(validateG5AU07P08F11Question({...q,metadata:{...q.metadata,completeSymmetricFigureReowned:true}}).ok,false);
 assert.equal(validateG5AU07P08F11Question({...q,geometryDiagram:{...q.geometryDiagram,reflectedPoint:{...q.geometryDiagram.reflectedPoint,x:q.geometryDiagram.reflectedPoint.x+1}}}).ok,false);
});

test("W8 Q011 aggregate browser generator worksheet and dedicated renderer are wired",()=>{
 const p=buildBatchABrowserPlan(req({questionCount:15}));assert.deepEqual(p.selectedKnowledgePointIds,[KP]);assert.equal(p.questionCountMax,240);assert.equal(p.questionMode,"diagram");
 const g=generateBatchABrowserQuestions(req({questionCount:15}));assert.equal(g.ok,true,g.errors.join("\n"));assert.equal(g.questions.length,15);
 const q=g.questions[0],direct=renderCoordinateReflectionDiagramP08F11(q.geometryDiagram),answer=renderCoordinateReflectionDiagramP08F11(q.answerGeometryDiagram);
 assert.match(direct,/worksheet-coordinate-reflection-diagram/);assert.match(direct,/data-representation="coordinate-reflection-diagram"/);assert.match(direct,/data-ruler-required="false"/);assert.equal(direct.includes("p08f11-reflected-point"),false);assert.match(answer,/p08f11-reflected-point/);
 const w=buildBatchABrowserWorksheetDocument(req({questionCount:15,includeAnswerKey:true,printLayout:{columns:3,rowsPerPage:5,showAnswerKeyPage:true}}));assert.equal(w.ok,true,w.errors.join("\n"));
 assert.equal(w.worksheetDocument.printOptions.columns,2);assert.equal(w.worksheetDocument.printOptions.rowsPerPage,3);assert.equal(w.worksheetDocument.questionPages.length,3);assert.equal(w.worksheetDocument.answerKeyPages.length,3);
 const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""});assert.match(html,/worksheet-coordinate-reflection-diagram/);assert.match(html,/data-representation="coordinate-reflection-diagram"/);
 const learner=html.replace(/<[^>]*>/g," ");for(const x of ["kp_g5a_","P08F11","找出所有對稱軸","補全圖形","量角器","尺量"])assert.equal(learner.includes(x),false,x);
});

test("W8 Q011 prior source-unit route remains available while same-unit mixed stays fail-closed",()=>{
 const priorPlan=buildBatchABrowserPlan({sourceId:SRC,selectionMode:"sourceUnit",questionMode:"diagram",questionCount:8,generationSeed:"prior-owner"});
 assert.equal(priorPlan.sourceId,SRC);assert.equal(priorPlan.selectedKnowledgePointIds.includes(KP),false);
 const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[PRIOR[2],KP],questionMode:"diagram",questionCount:8});
 assert.equal(mixed.ok,false);assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");
 assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
 assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
