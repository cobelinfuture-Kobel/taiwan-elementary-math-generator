import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as selector from "../../site/modules/curriculum/registry/batch-a-selector-p07f06-extension.js";
import * as preSelector from "../../site/modules/curriculum/registry/batch-a-selector-p07f05-extension.js";
import {auditG6AU06P07F06Projection,G6A_U06_P07F06_APPLIED_MODIFIER_IDS as MODIFIERS,G6A_U06_P07F06_INCLUDED_RELATIONS as RELATIONS,G6A_U06_P07F06_KP_ID as KP,G6A_U06_P07F06_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G6A_U06_P07F06_PATTERN_SPECS as SPECS,G6A_U06_P07F06_PREDECESSOR_KP_IDS as PREDECESSORS,G6A_U06_P07F06_PROTECTED_FUTURE_KP_IDS as PROTECTED,G6A_U06_P07F06_REQUIRED_CAPABILITY_IDS as REQUIRED,G6A_U06_P07F06_SOURCE_ID as SRC,G6A_U06_P07F06_SPEC_IDS as SPEC_IDS} from "../../site/modules/curriculum/registry/g6a-u06-circle-circumference-formula-selector-projection-p07f06.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p07f06.js";
import {buildG6AU06P07F06Question,generateG6AU06P07F06Questions,validateG6AU06P07F06Answer,validateG6AU06P07F06Question} from "../../site/modules/curriculum/batch-a/g6a-u06-circle-circumference-formula-runtime-p07f06.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p07f/q006-g6a-u06-circle-circumference-formula-implementation.json");
const preflight=read("data/curriculum/full-product/p07f/q006-g6a-u06-circle-circumference-formula-source-authority-preflight.json");
const impact=read("data/project/change-impact/P07F_W7_Q006.impact.json");
const validation=read("data/project/validation-plans/P07F_W7_Q006.validation.json");
const request=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"diagram",questionCount:20,generationSeed:"p07f06-circumference-formula",...extra});

test("W7 Q006 implementation preserves frozen queue, Q005 D0, source transparency, runtime and exact prerequisites",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");assert.equal(impl.preflight.prNumber,1025);assert.equal(impl.preflight.mergeSha,"8f8cb69abc3fd0d9ae972e40f2eae2506ea5ae37");
  assert.equal(impl.predecessorD0.q005Status,"PASS_E6_D0_COMPLETE");assert.equal(impl.queueAuthority.queuePosition,6);assert.equal(impl.queueAuthority.queueSliceCount,26);
  assert.equal(impl.queueAuthority.sliceId,"p07e_q006_r8_g6a_u06_6a06_profile_geometry_formula_c1");assert.deepEqual(impl.queueAuthority.knowledgePointIds,[KP]);assert.equal(impl.queueAuthority.runtimeProfileId,"profile_geometry_formula");
  assert.deepEqual(impl.queueAuthority.appliedModifierIds,MODIFIERS);assert.deepEqual(impl.queueAuthority.requiredW7CapabilityIds,[]);
  assert.equal(impl.sourceAuthority.semanticAuthority,"R02_REVIEWED_CANDIDATE_PRIMARY_CURRENT_VISUAL_CIRCUMFERENCE_CONTEXT_SECONDARY");assert.equal(impl.sourceAuthority.currentVisualSupportLevel,"CIRCUMFERENCE_APPLICATION_CONTEXT_VISIBLE_FORMULA_LITERAL_NOT_ASSERTED");
  assert.deepEqual(impl.prerequisiteContract.requiredKnowledgePointIds,["kp_g4a_u02_2digit_by_2digit","kp_g6a_u06_pi_circumference_relation"]);
});

test("W7 Q006 FormalMapping and three PatternSpecs own circumference evaluation only",()=>{
  const a=auditG6AU06P07F06Projection();assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1});
  assert.deepEqual(REQUIRED,preflight.runtimeCapabilityAuthority.executableR04Mapping.requiredRuntimeCapabilityIds);assert.deepEqual(MODIFIERS,[]);assert.deepEqual(OPTIONAL,[]);assert.deepEqual(impl.productContract.includedRelations,RELATIONS);
  assert.ok(SPECS.every(x=>x.semanticCore==="CIRCLE_CIRCUMFERENCE_FROM_DIAMETER_OR_RADIUS_FORMULA"&&x.requiresDiagramRepresentation&&x.q004PiCircumferenceRelationPrerequisiteRequired&&x.multiplicationPrerequisiteRequired&&x.diameterEqualsTwoRadiusRequired&&x.diameterFormulaRequired==="C = π × d"&&x.radiusFormulaRequired==="C = 2 × π × r"&&x.twoFormulaEquivalenceRequired&&x.positiveDiameterOrRadiusRequired&&x.approximatePiValue===3.14&&x.solveCircumferenceFromDiameterAllowed&&x.solveCircumferenceFromRadiusAllowed&&!x.solveDiameterFromCircumferenceAllowed&&!x.solveRadiusFromCircumferenceAllowed&&!x.q004PiRelationTeachingReownershipAllowed&&!x.semicirclePerimeterAllowed&&!x.sectorArcLengthAllowed&&!x.compositeArcPerimeterAllowed&&!x.rollingWheelDistanceApplicationAllowed&&!x.applicationContextAllowed&&!x.sameUnitMixedAllowed&&!x.crossUnitMixedAllowed));
});

test("W7 Q006 promotes only circumference-formula KP while preserving Q004 and hiding Q010/source-only arc KPs",()=>{
  const before=preSelector.listBatchAKnowledgePointAvailabilityBySource(SRC);assert.ok(before);assert.ok(PREDECESSORS.every(id=>(before.visibleKnowledgePointIds??[]).includes(id)));assert.equal((before.visibleKnowledgePointIds??[]).includes(KP),false);
  const a=selector.auditP07F06PublicSelectorComposition();assert.equal(a.ok,true,a.errors.join(","));
  const after=selector.listBatchAKnowledgePointAvailabilityBySource(SRC),ids=selector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  assert.ok(PREDECESSORS.every(id=>ids.includes(id)));assert.ok(ids.includes(KP));assert.equal(after.hiddenPendingKnowledgePointIds.includes(KP),false);assert.equal(after.notSelectableKnowledgePointIds.includes(KP),false);
  assert.ok(PROTECTED.every(id=>after.hiddenPendingKnowledgePointIds.includes(id)&&after.notSelectableKnowledgePointIds.includes(id)&&!ids.includes(id)));assert.equal(after.sameUnitMixedAllowed,false);
  assert.deepEqual(selector.resolveVisiblePatternSpecIdsForKnowledgePoint(KP,"diagram"),SPEC_IDS);
});

test("W7 Q006 capability binding preserves exact geometry-formula envelope with no inferred multiplication modifier",()=>{
  const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join(","));const b=resolvePublicUiCapabilityBinding(request());
  assert.equal(b.blocked,false);assert.equal(b.questionType,"diagram");assert.equal(b.questionCount.max,240);assert.deepEqual(b.requiredCapabilityIds,REQUIRED);assert.deepEqual(b.optionalCapabilityIds,OPTIONAL);assert.deepEqual(b.appliedRuntimeModifierIds,[]);
  assert.equal(b.frozenRuntimeProfile,"profile_geometry_formula");assert.equal(b.q004PiRelationPrerequisiteRequired,true);assert.equal(b.multiplicationPrerequisiteRequired,true);assert.equal(b.circleCircumferenceFormulaOwned,true);assert.equal(b.diameterFormulaRequired,"C = π × d");assert.equal(b.radiusFormulaRequired,"C = 2 × π × r");assert.equal(b.twoFormulaEquivalenceRequired,true);
  assert.equal(b.solveDiameterFromCircumferenceAllowed,false);assert.equal(b.solveRadiusFromCircumferenceAllowed,false);assert.equal(b.q004PiRelationTeachingReownershipAllowed,false);assert.equal(b.semicirclePerimeterAllowed,false);assert.equal(b.sectorArcLengthAllowed,false);assert.equal(b.compositeArcPerimeterAllowed,false);assert.equal(b.rollingWheelDistanceApplicationAllowed,false);assert.equal(b.applicationContextAllowed,false);assert.equal(b.sameUnitMixedAdmission,false);assert.equal(b.crossUnitMixedAdmission,false);
});

for(const patternSpecId of SPEC_IDS)test("W7 Q006 "+patternSpecId+" has 240 deterministic unique validated variants",()=>{
  const a=generateG6AU06P07F06Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"}),b=generateG6AU06P07F06Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){const p=q.patternRepresentation;assert.equal(validateG6AU06P07F06Question(q).ok,true);assert.equal(validateG6AU06P07F06Answer(q,q.answerValue).ok,true);assert.equal(p.diameter,2*p.radius);assert.equal(p.diameterFormulaValue,p.radiusFormulaValue);assert.equal(p.circumference,p.diameterFormulaValue);assert.equal(p.twoFormulaEquivalent,true);}
});

test("W7 Q006 validator fails closed on formula invariant damage and forbidden ownership leakage",()=>{
  const q=buildG6AU06P07F06Question({variant:17,patternSpecId:SPEC_IDS[0]}),p=q.patternRepresentation;
  assert.equal(validateG6AU06P07F06Answer(q,q.answerValue).ok,true);assert.equal(validateG6AU06P07F06Answer(q,q.answerValue+1).ok,false);
  assert.equal(validateG6AU06P07F06Question({...q,patternRepresentation:{...p,diameter:p.diameter+1,diameterEqualsTwoRadius:false}}).ok,false);
  assert.equal(validateG6AU06P07F06Question({...q,metadata:{...q.metadata,solveDiameterFromCircumferenceUsed:true}}).ok,false);
  assert.equal(validateG6AU06P07F06Question({...q,metadata:{...q.metadata,q004PiRelationTeachingReowned:true}}).ok,false);
  assert.equal(validateG6AU06P07F06Question({...q,metadata:{...q.metadata,semicirclePerimeterReowned:true}}).ok,false);
});

test("W7 Q006 aggregate generator worksheet renderer expose diameter radius equivalence families and preserve Q004",()=>{
  const plan=buildBatchABrowserPlan(request({questionCount:12}));assert.equal(plan.sourceId,SRC);assert.equal(plan.questionCountMax,240);assert.deepEqual(plan.patternSpecIds,SPEC_IDS);assert.equal(plan.frozenRuntimeProfile,"profile_geometry_formula");
  const g=generateBatchABrowserQuestions(request({questionCount:12}));assert.equal(g.ok,true,g.errors.join(","));assert.equal(g.questions.length,12);assert.deepEqual([...new Set(g.questions.map(q=>q.patternRepresentation.targetKind))].sort(),["FORMULA_EQUIVALENCE","FROM_DIAMETER","FROM_RADIUS"]);
  const w=buildBatchABrowserWorksheetDocument(request({questionCount:9,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:4}}));assert.equal(w.ok,true,w.errors.join(","));assert.equal(w.worksheetDocument.questionCount,9);assert.equal(w.worksheetDocument.answerKeyItems.length,9);assert.equal(w.worksheetDocument.questionDisplayModels.every(x=>x.geometryDiagram?.kind==="circle_parts_diagram"),true);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""}),visible=html.replace(/<[^>]*>/g," ");assert.match(visible,/C = π × d/);assert.match(visible,/C = 2 × π × r/);assert.match(visible,/半徑/);assert.equal((html.match(/worksheet-circle-parts-diagram/g)||[]).length,18);
  for(const term of ["半圓","扇形","滾動","按比分配","百分率"])assert.equal(visible.includes(term),false,term);
  const predecessor=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:["kp_g6a_u06_pi_circumference_relation"],questionMode:"diagram",questionCount:6,generationSeed:"p07f06-preserve-q004"});assert.equal(predecessor.ok,true,predecessor.errors.join(","));assert.ok(predecessor.questions.every(q=>q.knowledgePointId==="kp_g6a_u06_pi_circumference_relation"));
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:["kp_g6a_u06_pi_circumference_relation",KP],questionMode:"diagram",questionCount:4,generationSeed:"mixed-not-admitted"});assert.equal(mixed.ok,false);
});

test("W7 Q006 current browser pointers advance to P07F07 while Q005 Q004 Q003 Q002 Q001 and W6 Q020 stay reachable",()=>{
  const selectorText=readFileSync(new URL("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",import.meta.url),"utf8"),bindingText=readFileSync(new URL("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",import.meta.url),"utf8"),generatorText=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",import.meta.url),"utf8"),worksheetText=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",import.meta.url),"utf8");
  assert.match(selectorText,/batch-a-selector-p07f07-extension/);assert.match(bindingText,/public-ui-capability-binding-p07f07/);
  for(const id of ["07","06","05","04","03","02","01"])assert.match(generatorText,new RegExp("requestsP07F"+id));
  assert.match(generatorText,/requestsP06F20/);for(const id of ["07","06","05","04","03","02","01"])assert.match(worksheetText,new RegExp("buildP07F"+id+"Worksheet"));assert.match(worksheetText,/buildP06F20Worksheet/);
});

test("W7 Q006 validation contract stays SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.equal(validation.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
  assert.equal(impact.scopeGuards.q004ProductMutation,false);assert.equal(impact.scopeGuards.q005ProductMutation,false);assert.equal(impact.scopeGuards.q001Q002Q003Q004Q005CompatibilityTestAndAcceptanceOnlyMutation,true);assert.equal(impact.scopeGuards.q007OrLaterProductMutation,false);
});
