import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditG4AU03P08F03Projection,G4A_U03_P08F03_ANGLE_KP_ID as ANGLE,G4A_U03_P08F03_CLOCK_KP_ID as CLOCK,G4A_U03_P08F03_KP_IDS as TARGETS,G4A_U03_P08F03_PROTECTED_FUTURE_KP_IDS as FUTURE,G4A_U03_P08F03_PROTECTED_PRIOR_KP_IDS as PRIOR,G4A_U03_P08F03_SOURCE_ID as SRC,G4A_U03_P08F03_SPEC_IDS_BY_KP as SPEC_IDS} from "../../site/modules/curriculum/registry/g4a-u03-angle-composition-rotation-clock-selector-projection-p08f03.js";
import {auditP08F03PublicSelectorComposition,getVisibleBatchAKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource,listVisibleBatchAKnowledgePoints,resolveVisiblePatternSpecIdsForKnowledgePoint} from "../../site/modules/curriculum/registry/batch-a-selector-p08f03-extension.js";
import * as preSelector from "../../site/modules/curriculum/registry/batch-a-selector-p08f02-extension.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p08f03.js";
import {generateG4AU03P08F03Questions,validateG4AU03P08F03Answer,validateG4AU03P08F03Question} from "../../site/modules/curriculum/batch-a/g4a-u03-angle-composition-rotation-clock-runtime-p08f03.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderAngleCompositionRotationClockDiagram,renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const implementation=read("data/curriculum/full-product/p08f/q003-g4a-u03-angle-composition-rotation-clock-implementation.json");
const preflight=read("data/curriculum/full-product/p08f/q003-g4a-u03-angle-composition-decomposition-source-authority-preflight.json");
const impact=read("data/project/change-impact/P08F_W8_Q003.impact.json");
const validation=read("data/project/validation-plans/P08F_W8_Q003.validation.json");
const req=(kp,extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[kp],questionMode:"diagram",questionCount:20,generationSeed:"p08f03-focused-"+kp,...extra});

test("W8 Q003 consumes human-accepted Q002 D0 and exact two-KP frozen queue identity",()=>{
 assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI_LIVE_E6_AND_ACTUAL_PRINT_REVIEW");
 assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
 assert.equal(preflight.predecessorAuthority.q002FinalCloseoutStatus,"Q002_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
 assert.equal(preflight.preflightDecision.predecessorQ002D0Satisfied,true);
 assert.equal(implementation.queueAuthority.queuePosition,3);
 assert.equal(implementation.queueAuthority.sliceId,"p08e_q003_r2_g4a_u03_4a03_profile_geometry_property_c1");
 assert.deepEqual(implementation.queueAuthority.knowledgePointIds,TARGETS);
});

test("W8 Q003 materializes two source-bounded KPs with six PatternSpecs and two FormalMappings",()=>{
 const a=auditG4AU03P08F03Projection();assert.equal(a.ok,true,a.errors.join("\n"));
 assert.deepEqual(a.counts,{knowledgePoints:2,patternGroups:2,patternSpecs:6,formalMappings:2});
 assert.equal(implementation.productContract.formalMappingCount,2);assert.equal(implementation.productContract.patternGroupCount,2);assert.equal(implementation.productContract.patternSpecCount,6);
 assert.deepEqual(implementation.productContract.patternSpecIds,[...SPEC_IDS[ANGLE],...SPEC_IDS[CLOCK]]);
 assert.equal(implementation.sourceAuthority.sourceLearnerFigureCopied,false);
 assert.equal(implementation.productContract.humanVisualReviewRequiredBeforeD0,true);
});

test("W8 Q003 selector promotes both targets while preserving Q001 and protecting later same-source KPs",()=>{
 const a=auditP08F03PublicSelectorComposition();assert.equal(a.ok,true,a.errors.join("\n"));
 const before=preSelector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
 const s=listBatchAKnowledgePointAvailabilityBySource(SRC),visible=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
 for(const id of PRIOR){assert.ok(before.includes(id));assert.ok(visible.includes(id));assert.ok(getVisibleBatchAKnowledgePoint(id));}
 for(const id of TARGETS){assert.equal(before.includes(id),false);assert.ok(visible.includes(id));assert.ok(getVisibleBatchAKnowledgePoint(id));assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(id,"diagram"),SPEC_IDS[id]);assert.equal(s.hiddenPendingKnowledgePointIds.includes(id),false);assert.equal(s.notSelectableKnowledgePointIds.includes(id),false);}
 for(const id of FUTURE){assert.equal(visible.includes(id),false);assert.ok(s.hiddenPendingKnowledgePointIds.includes(id));assert.ok(s.notSelectableKnowledgePointIds.includes(id));}
 assert.equal(s.sameUnitMixedAllowed,false);assert.equal(s.w8FrozenQueueComplete,false);
});

test("W8 Q003 public bindings keep the two KP contracts separate and fail closed on mixed mode",()=>{
 const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join("\n"));
 const angle=resolvePublicUiCapabilityBinding(req(ANGLE)),clock=resolvePublicUiCapabilityBinding(req(CLOCK));
 assert.equal(angle.blocked,false);assert.equal(clock.blocked,false);assert.equal(angle.questionType,"diagram");assert.equal(clock.questionType,"diagram");assert.equal(angle.questionCount.max,240);assert.equal(clock.questionCount.max,240);
 assert.equal(angle.adjacentAngleCompositionRequired,true);assert.equal(angle.wholePartAngleInvariantRequired,true);assert.deepEqual(angle.appliedRuntimeModifierIds,[]);
 assert.equal(clock.rotationDirectionAndMagnitudeRequired,true);assert.equal(clock.fullTurnDegrees,360);assert.equal(clock.clockDivisionCount,12);assert.equal(clock.clockDegreesPerDivision,30);assert.deepEqual(clock.appliedRuntimeModifierIds,["mod_scale_instrument"]);
 for(const b of [angle,clock]){assert.equal(b.protractorMeasurementReownershipAllowed,false);assert.equal(b.estimationClassificationReownershipAllowed,false);assert.equal(b.linearFullVerticalAngleReownershipAllowed,false);assert.equal(b.sameUnitMixedAdmission,false);assert.equal(b.crossUnitMixedAdmission,false);assert.equal(b.frozenRuntimeProfile,"profile_geometry_property");}
});

for(const kp of TARGETS)for(const patternSpecId of SPEC_IDS[kp])test("W8 Q003 "+patternSpecId+" has 240 deterministic unique validated variants",()=>{
 const a=generateG4AU03P08F03Questions({selectedKnowledgePointIds:[kp],questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable-"+patternSpecId}),b=generateG4AU03P08F03Questions({selectedKnowledgePointIds:[kp],questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable-"+patternSpecId});
 assert.equal(a.ok,true,a.errors.join("\n"));assert.deepEqual(a.questions,b.questions);assert.equal(a.questions.length,240);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
 for(const q of a.questions){assert.equal(validateG4AU03P08F03Question(q).ok,true);assert.equal(validateG4AU03P08F03Answer(q,q.answerText).ok,true);assert.equal(q.metadata.q004OrLaterTouched,false);}
});

test("W8 Q003 angle composition/decomposition preserves whole-part arithmetic",()=>{
 const qs=generateG4AU03P08F03Questions({selectedKnowledgePointIds:[ANGLE],questionCount:90,generationSeed:"angle-semantics"}).questions;assert.equal(new Set(qs.map(q=>q.relation)).size,3);
 for(const q of qs){const d=q.geometryDiagram;assert.equal(d.totalDeg,d.partA+d.partB);assert.equal(d.adjacentNonOverlapping,true);assert.equal(d.wholeEqualsParts,true);if(q.relation==="COMPOSE_ADJACENT_NON_OVERLAPPING_ANGLES")assert.equal(q.answerValue,d.totalDeg);if(q.relation==="DECOMPOSE_WHOLE_ANGLE_INTO_PARTS")assert.equal(q.answerValue,d.knownPartIndex===0?d.partB:d.partA);if(q.relation==="SOLVE_MISSING_PART_FROM_WHOLE_AND_KNOWN_PART")assert.equal(q.answerValue,d.partB);}
});

test("W8 Q003 rotation and clock semantics preserve 360-degree / 12-division invariants",()=>{
 const qs=generateG4AU03P08F03Questions({selectedKnowledgePointIds:[CLOCK],questionCount:120,generationSeed:"clock-semantics"}).questions;assert.equal(new Set(qs.map(q=>q.relation)).size,3);
 for(const q of qs){const d=q.geometryDiagram;assert.equal(d.fullTurnDegrees,360);assert.equal(d.clockDivisionCount,12);assert.equal(d.clockDegreesPerDivision,30);if(q.relation==="ROTATION_TURN_TO_ANGLE")assert.equal(q.answerValue,d.clockSteps*30);if(q.relation==="CLOCK_FACE_STEP_TO_ANGLE")assert.equal(q.answerValue,d.clockSteps*30);if(q.relation==="CLOCK_HAND_ANGLE"){const raw=Math.abs(d.hourA-d.hourB),small=Math.min(raw,12-raw)*30;assert.equal(q.answerValue,d.angleChoice==="SMALLER"?small:360-small);}}
});

test("W8 Q003 validator fails closed for wrong answers and forbidden scope leakage",()=>{
 const q=generateG4AU03P08F03Questions({selectedKnowledgePointIds:[ANGLE],questionCount:1,patternSpecIds:[SPEC_IDS[ANGLE][0]],generationSeed:"wrong"}).questions[0];
 assert.equal(validateG4AU03P08F03Answer(q,"999").ok,false);
 assert.equal(validateG4AU03P08F03Question({...q,metadata:{...q.metadata,protractorMeasurementReowned:true}}).ok,false);
 assert.equal(validateG4AU03P08F03Question({...q,geometryDiagram:{...q.geometryDiagram,totalDeg:q.geometryDiagram.totalDeg+10}}).ok,false);
});

for(const kp of TARGETS)test("W8 Q003 aggregate browser generator worksheet and renderer work for "+kp,()=>{
 const p=buildBatchABrowserPlan(req(kp,{questionCount:15}));assert.deepEqual(p.selectedKnowledgePointIds,[kp]);assert.equal(p.questionCountMax,240);assert.equal(p.questionMode,"diagram");
 const g=generateBatchABrowserQuestions(req(kp,{questionCount:15}));assert.equal(g.ok,true,g.errors.join("\n"));assert.equal(g.questions.length,15);assert.ok(g.questions.every(q=>q.knowledgePointId===kp));
 const direct=renderAngleCompositionRotationClockDiagram(g.questions[0].geometryDiagram);assert.match(direct,/worksheet-angle-composition-rotation-clock-diagram/);
 const w=buildBatchABrowserWorksheetDocument(req(kp,{questionCount:15,includeAnswerKey:true,printLayout:{columns:3,rowsPerPage:5,showAnswerKeyPage:true}}));assert.equal(w.ok,true,w.errors.join("\n"));
 assert.equal(w.worksheetDocument.printOptions.columns,2);assert.equal(w.worksheetDocument.printOptions.rowsPerPage,3);assert.equal(w.worksheetDocument.questionPages.length,3);assert.equal(w.worksheetDocument.answerKeyPages.length,3);
 const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""});assert.match(html,/worksheet-angle-composition-rotation-clock-diagram/);assert.match(html,/data-representation="angle-composition-rotation-clock-diagram"/);
 for(const x of ["kp_angle_","kp_rotation_","P08F03","量角器","銳角","鈍角","對頂角"])assert.equal(html.replace(/<[^>]*>/g," ").includes(x),false,x);
});

test("W8 Q003 same-unit mixed stays fail-closed and validation remains bounded",()=>{
 const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[ANGLE,CLOCK],questionMode:"diagram",questionCount:8});
 assert.equal(mixed.ok,false);
 assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");
 assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
 assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
