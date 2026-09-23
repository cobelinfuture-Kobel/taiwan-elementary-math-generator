import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as selector from "../../site/modules/curriculum/registry/batch-a-selector-p07f10-extension.js";
import * as preSelector from "../../site/modules/curriculum/registry/batch-a-selector-p07f09-extension.js";
import {auditG6AU06P07F10Projection,G6A_U06_P07F10_APPLIED_MODIFIER_IDS as MODIFIERS,G6A_U06_P07F10_INCLUDED_RELATIONS as RELATIONS,G6A_U06_P07F10_KP_ID as KP,G6A_U06_P07F10_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G6A_U06_P07F10_PATTERN_SPECS as SPECS,G6A_U06_P07F10_PREDECESSOR_KP_IDS as PREDECESSORS,G6A_U06_P07F10_PROTECTED_FUTURE_KP_IDS as PROTECTED,G6A_U06_P07F10_REQUIRED_CAPABILITY_IDS as REQUIRED,G6A_U06_P07F10_SOURCE_ID as SRC,G6A_U06_P07F10_SPEC_IDS as SPEC_IDS} from "../../site/modules/curriculum/registry/g6a-u06-semicircle-perimeter-selector-projection-p07f10.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p07f10.js";
import {buildG6AU06P07F10Question,generateG6AU06P07F10Questions,validateG6AU06P07F10Answer,validateG6AU06P07F10Question} from "../../site/modules/curriculum/batch-a/g6a-u06-semicircle-perimeter-runtime-p07f10.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {validateSectorElementsDiagramModel} from "../../site/modules/renderer/sector-elements-diagram.js";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p07f/q010-g6a-u06-semicircle-perimeter-implementation.json");
const preflight=read("data/curriculum/full-product/p07f/q010-g6a-u06-semicircle-perimeter-source-authority-preflight.json");
const impact=read("data/project/change-impact/P07F_W7_Q010.impact.json");
const validation=read("data/project/validation-plans/P07F_W7_Q010.validation.json");
const request=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"diagram",questionCount:20,generationSeed:"p07f10-semicircle-perimeter",...extra});

test("W7 Q010 implementation preserves frozen queue, Q009 D0, source evidence, runtime and exact prerequisite",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");assert.equal(impl.preflight.prNumber,1036);assert.equal(impl.preflight.mergeSha,"b49577842af094370e6b796f39845385b68c9e80");
  assert.equal(impl.predecessorD0.q009Status,"PASS_E6_D0_COMPLETE");assert.equal(impl.predecessorD0.q009PostMergeWorkflowRunId,35740000242);assert.equal(impl.queueAuthority.queuePosition,10);assert.equal(impl.queueAuthority.queueSliceCount,26);assert.equal(impl.queueAuthority.sliceId,"p07e_q010_r9_g6a_u06_6a06_profile_geometry_formula_c1");assert.deepEqual(impl.queueAuthority.knowledgePointIds,[KP]);
  assert.equal(impl.queueAuthority.runtimeProfileId,"profile_geometry_formula");assert.equal(impl.queueAuthority.classificationRuleId,"rule_geometry_formula");assert.deepEqual(impl.queueAuthority.appliedModifierIds,[]);
  assert.deepEqual(impl.sourceAuthority.r02EvidencePages,[1,2]);assert.deepEqual(impl.sourceAuthority.currentVisualDirectSupportingPages,[1,2]);assert.equal(impl.sourceAuthority.currentVisualSupportLevel,"DIRECT_SEMICIRCLE_PERIMETER_AND_ARC_COMPOSITION_VISIBLE");
  assert.deepEqual(impl.prerequisiteContract.requiredKnowledgePointIds,["kp_g6a_u06_circle_circumference_formula"]);assert.equal(impl.prerequisiteContract.q006CircleCircumferenceFormulaPrerequisiteRequired,true);assert.equal(impl.prerequisiteContract.q004PiCircumferenceRelationPrerequisiteRequired,false);
});

test("W7 Q010 FormalMapping and three PatternSpecs own semicircle perimeter only",()=>{
  const a=auditG6AU06P07F10Projection();assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1});
  assert.deepEqual(REQUIRED,preflight.runtimeCapabilityAuthority.executableR04Mapping.requiredRuntimeCapabilityIds);assert.deepEqual(OPTIONAL,[]);assert.deepEqual(MODIFIERS,[]);assert.deepEqual(impl.productContract.includedRelations,RELATIONS);
  assert.ok(SPECS.every(x=>x.semanticCore==="SEMICIRCLE_PERIMETER_EQUALS_HALF_CIRCUMFERENCE_PLUS_DIAMETER"&&x.requiresDiagramRepresentation&&x.q006CircleCircumferenceFormulaPrerequisiteRequired&&!x.q004PiCircumferenceRelationPrerequisiteRequired&&x.semicircleBoundaryMustIncludeArcAndDiameter&&x.halfCircumferenceArcRequired&&x.diameterStraightEdgeRequired&&x.approximatePiValue===3.14&&!x.q004PiRelationTeachingReownershipAllowed&&!x.q006CircleCircumferenceFormulaTeachingReownershipAllowed&&!x.sectorArcLengthAllowed&&!x.compositeArcPerimeterAllowed&&!x.applicationContextAllowed&&!x.sameUnitMixedAllowed&&!x.crossUnitMixedAllowed));
});

test("W7 Q010 promotes final frozen G6A-U06 KP while keeping source-only arc candidates hidden",()=>{
  const before=preSelector.listBatchAKnowledgePointAvailabilityBySource(SRC);assert.equal((before?.visibleKnowledgePointIds??[]).includes(KP),false);
  const a=selector.auditP07F10PublicSelectorComposition();assert.equal(a.ok,true,a.errors.join(","));
  const after=selector.listBatchAKnowledgePointAvailabilityBySource(SRC),ids=selector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  assert.ok(PREDECESSORS.every(id=>ids.includes(id)));assert.ok(ids.includes(KP));assert.ok(selector.getVisibleBatchAKnowledgePoint(KP));assert.equal(after.hiddenPendingKnowledgePointIds.includes(KP),false);assert.equal(after.notSelectableKnowledgePointIds.includes(KP),false);
  assert.ok(PROTECTED.every(id=>!ids.includes(id)&&after.hiddenPendingKnowledgePointIds.includes(id)&&after.notSelectableKnowledgePointIds.includes(id)));
  assert.equal(after.sameSourceCandidateSetComplete,true);assert.equal(after.sameUnitMixedAllowed,false);assert.equal(after.w7FrozenQueueComplete,false);assert.deepEqual(selector.resolveVisiblePatternSpecIdsForKnowledgePoint(KP,"diagram"),SPEC_IDS);
});

test("W7 Q010 capability binding matches geometry-formula envelope",()=>{
  const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join(","));const b=resolvePublicUiCapabilityBinding(request());
  assert.equal(b.blocked,false);assert.equal(b.questionType,"diagram");assert.equal(b.questionCount.max,240);assert.deepEqual(b.requiredCapabilityIds,REQUIRED);assert.deepEqual(b.optionalCapabilityIds,OPTIONAL);assert.deepEqual(b.appliedRuntimeModifierIds,MODIFIERS);
  assert.equal(b.frozenRuntimeProfile,"profile_geometry_formula");assert.equal(b.q006CircleCircumferenceFormulaPrerequisiteRequired,true);assert.equal(b.q004PiCircumferenceRelationPrerequisiteRequired,false);assert.equal(b.semicirclePerimeterOwned,true);assert.equal(b.boundaryArcPlusDiameterRequired,true);assert.equal(b.halfCircumferenceArcRequired,true);assert.equal(b.diameterStraightEdgeRequired,true);
  assert.equal(b.sectorArcLengthAllowed,false);assert.equal(b.compositeArcPerimeterAllowed,false);assert.equal(b.applicationContextAllowed,false);assert.equal(b.sameUnitMixedAdmission,false);assert.equal(b.crossUnitMixedAdmission,false);
});

for(const patternSpecId of SPEC_IDS)test("W7 Q010 "+patternSpecId+" has 240 deterministic unique semicircle variants",()=>{
  const a=generateG6AU06P07F10Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"}),b=generateG6AU06P07F10Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){const p=q.patternRepresentation;assert.equal(validateG6AU06P07F10Question(q).ok,true);assert.equal(validateG6AU06P07F10Answer(q,q.answerText).ok,true);assert.equal(validateSectorElementsDiagramModel(q.geometryDiagram).ok,true);assert.equal(q.geometryDiagram.centralAngleDeg,180);assert.equal(p.boundaryIncludesArc,true);assert.equal(p.boundaryIncludesDiameter,true);assert.equal(p.arcIsHalfCircumference,true);assert.equal(p.perimeterEqualsArcPlusDiameter,true);assert.equal(p.diameter,2*p.radius);}
});

test("W7 Q010 validator fails closed on answer, boundary and scope damage",()=>{
  const q=buildG6AU06P07F10Question({variant:17,patternSpecId:"ps_g6a_u06_semicircle_perimeter_from_diameter"});assert.equal(validateG6AU06P07F10Answer(q,q.answerText).ok,true);assert.equal(validateG6AU06P07F10Answer(q,"1").ok,false);
  const p=q.patternRepresentation;assert.equal(validateG6AU06P07F10Question({...q,patternRepresentation:{...p,boundaryIncludesDiameter:false}}).ok,false);
  assert.equal(validateG6AU06P07F10Question({...q,metadata:{...q.metadata,sectorArcLengthReowned:true}}).ok,false);assert.equal(validateG6AU06P07F10Question({...q,geometryDiagram:{...q.geometryDiagram,centralAngleDeg:150}}).ok,false);
});

test("W7 Q010 aggregate generator worksheet renderer cover all families and preserve mixed fail-closed",()=>{
  const plan=buildBatchABrowserPlan(request({questionCount:12}));assert.equal(plan.sourceId,SRC);assert.equal(plan.questionCountMax,240);assert.deepEqual(plan.patternSpecIds,SPEC_IDS);assert.equal(plan.frozenRuntimeProfile,"profile_geometry_formula");
  const g=generateBatchABrowserQuestions(request({questionCount:12}));assert.equal(g.ok,true,g.errors.join(","));assert.equal(g.questions.length,12);assert.equal(new Set(g.questions.map(q=>q.questionSignature)).size,12);assert.deepEqual([...new Set(g.questions.map(q=>q.patternRepresentation.targetKind))].sort(),["ARC_PLUS_DIAMETER","FROM_DIAMETER","FROM_RADIUS"]);
  const w=buildBatchABrowserWorksheetDocument(request({questionCount:9,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:4}}));assert.equal(w.ok,true,w.errors.join(","));assert.equal(w.worksheetDocument.questionCount,9);assert.equal(w.worksheetDocument.answerKeyItems.length,9);assert.equal(w.worksheetDocument.questionDisplayModels.every(x=>x.geometryDiagram?.kind==="sector_elements_diagram"&&x.geometryDiagram.centralAngleDeg===180),true);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""}),visible=html.replace(/<[^>]*>/g," ");assert.match(visible,/半圓/);assert.match(visible,/直徑/);assert.match(visible,/3.14/);assert.equal((html.match(/worksheet-sector-elements-diagram/g)||[]).length,18);
  for(const term of ["複合弧","跑道","滾動距離","百分率"])assert.equal(visible.includes(term),false,term);assert.equal(visible.includes("kp_g6a_u06_"),false);assert.equal(visible.includes("ps_g6a_u06_"),false);assert.equal(visible.includes("P07F10"),false);
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[KP,"kp_g6a_u06_circle_circumference_formula"],questionMode:"diagram",questionCount:4,generationSeed:"mixed-not-admitted"});assert.equal(mixed.ok,false);
});

test("W7 Q010 current browser pointers advance to P07F10 while Q009 through Q001 and W6 Q020 stay reachable",()=>{
  const selectorText=readFileSync(new URL("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",import.meta.url),"utf8"),bindingText=readFileSync(new URL("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",import.meta.url),"utf8"),generatorText=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",import.meta.url),"utf8"),worksheetText=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",import.meta.url),"utf8");
  assert.match(selectorText,/batch-a-selector-p07f11-extension/);assert.match(bindingText,/public-ui-capability-binding-p07f11/);
  for(const id of ["10","09","08","07","06","05","04","03","02","01"])assert.match(generatorText,new RegExp("requestsP07F"+id));assert.match(generatorText,/requestsP06F20/);
  for(const id of ["10","09","08","07","06","05","04","03","02","01"])assert.match(worksheetText,new RegExp("buildP07F"+id+"Worksheet"));assert.match(worksheetText,/buildP06F20Worksheet/);
});

test("W7 Q010 validation contract stays SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.equal(validation.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);assert.equal(impact.scopeGuards.q009ProductMutation,false);assert.equal(impact.scopeGuards.q011OrLaterProductMutation,false);assert.equal(impact.scopeGuards.sectorElementsRenderer180DegreeOnly,true);
});
