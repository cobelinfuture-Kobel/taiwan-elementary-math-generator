import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as selector from "../../site/modules/curriculum/registry/batch-a-selector-p07f12-extension.js";
import * as preSelector from "../../site/modules/curriculum/registry/batch-a-selector-p07f11-extension.js";
import {auditG6AU09P07F12Projection,G6A_U09_P07F12_APPLIED_MODIFIER_IDS as MODIFIERS,G6A_U09_P07F12_INCLUDED_RELATIONS as RELATIONS,G6A_U09_P07F12_KP_ID as KP,G6A_U09_P07F12_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G6A_U09_P07F12_PATTERN_SPECS as SPECS,G6A_U09_P07F12_PREDECESSOR_KP_IDS as PREDECESSORS,G6A_U09_P07F12_PROTECTED_FUTURE_KP_IDS as PROTECTED,G6A_U09_P07F12_REQUIRED_CAPABILITY_IDS as REQUIRED,G6A_U09_P07F12_SOURCE_ID as SRC,G6A_U09_P07F12_SPEC_IDS as SPEC_IDS} from "../../site/modules/curriculum/registry/g6a-u09-scale-area-change-selector-projection-p07f12.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p07f12.js";
import {buildG6AU09P07F12Question,generateG6AU09P07F12Questions,validateG6AU09P07F12Answer,validateG6AU09P07F12Question} from "../../site/modules/curriculum/batch-a/g6a-u09-scale-area-change-runtime-p07f12.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {getBatchASourceUnit,isBatchASourceId,listBatchASourceUnits} from "../../site/modules/curriculum/batch-a/source-units.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {validateScaleAreaChangeDiagramModel} from "../../site/modules/renderer/scale-area-change-diagram-p07f12.js";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p07f/q012-g6a-u09-scale-area-change-implementation.json");
const pre=read("data/curriculum/full-product/p07f/q012-g6a-u09-scale-area-change-source-authority-preflight.json");
const impact=read("data/project/change-impact/P07F_W7_Q012.impact.json");
const validation=read("data/project/validation-plans/P07F_W7_Q012.validation.json");
const request=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"diagram",questionCount:20,generationSeed:"p07f12-scale-area-change",...extra});

test("W7 Q012 implementation consumes exact preflight, source evidence and frozen queue identity",()=>{
  assert.equal(pre.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(impl.preflight.prNumber,1043);assert.equal(impl.preflight.mergeSha,"5dd9de7da2b962d33c563d5cadbe9040eb408ca5");
  assert.equal(impl.predecessorD0.q011Status,"PASS_E6_D0_COMPLETE");assert.equal(impl.predecessorD0.q011PostMergeWorkflowRunId,35801582574);
  assert.equal(impl.queueAuthority.queuePosition,12);assert.equal(impl.queueAuthority.queueSliceCount,26);assert.equal(impl.queueAuthority.sliceId,"p07e_q012_r9_g6a_u09_6a09_profile_geometry_formula_c1");assert.deepEqual(impl.queueAuthority.knowledgePointIds,[KP]);
  assert.equal(impl.sourceAuthority.sourcePdfDriveFileId,"1qnZyEDcmOgb94BYU350cmjvUN4kESlEZ");assert.equal(impl.sourceAuthority.sourcePdfSha256,"80ec4d8df9a4d5bf98392cf846fac7df68c49781ba60eefa78e70e9109cbbe2c");
  assert.equal(impl.sourceAuthority.currentVisualSupportLevel,"DIRECT_LITERAL_SCALE_AREA_CHANGE_APPLICATION");assert.equal(impl.sourceAuthority.supplementaryEvidenceRequired,false);
  assert.deepEqual(impl.prerequisiteContract.requiredKnowledgePointIds,PREDECESSORS);
});

test("W7 Q012 keeps existing G6A-U09 source identity and Q007 visibility",()=>{
  const unit=getBatchASourceUnit(SRC);assert.ok(unit);assert.equal(unit.unitCode,"6A-U09");assert.equal(unit.title,"放大圖縮圖與比例尺");assert.equal(unit.domain,"quantity_measurement");assert.equal(isBatchASourceId(SRC),true);
  const units=listBatchASourceUnits({includeW7Slice007:true});assert.equal(units.filter(x=>x.sourceId===SRC).length,1);
  const before=preSelector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  assert.ok(before.includes("kp_g6a_u09_scale_factor_length"));assert.equal(before.includes(KP),false);
});

test("W7 Q012 FormalMapping and four PatternSpecs own k-squared area scaling only",()=>{
  const a=auditG6AU09P07F12Projection();assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:4,formalMappings:1});
  assert.deepEqual(REQUIRED,impl.runtimeContract.exactRequiredRuntimeCapabilityIds);assert.deepEqual(OPTIONAL,[]);assert.deepEqual(MODIFIERS,[]);assert.deepEqual(impl.productContract.includedRelations,RELATIONS);
  assert.ok(SPECS.every(x=>x.semanticCore==="LENGTH_SCALE_FACTOR_K_IMPLIES_AREA_SCALE_FACTOR_K_SQUARED"&&x.requiresDiagramRepresentation&&x.rectangleAreaFormulaPrerequisiteRequired&&x.scaleFactorLengthPrerequisiteRequired&&x.correspondingLinearScaleFactorRequired&&x.areaScaleFactorEqualsSquareOfLinearScaleFactorRequired&&x.scaleFactorMustBePositive&&x.scaleFactorMustBeNonzero&&x.enlargementAndReductionAllowed&&x.deriveScaledRectangleAreaFromScaledDimensionsAllowed&&x.inferAreaMultiplierFromLinearMultiplierAllowed&&x.compareOriginalAndScaledAreaAllowed&&!x.q007LengthScaleFactorPrerequisiteTeachingReownershipAllowed&&!x.similarShapeAngleTeachingAllowed&&!x.scaleDrawingConstructionAllowed&&!x.mapScaleDistanceAllowed&&!x.mapScaleBarInterpretationAllowed&&!x.genericGeometryAreaFormulaReownershipAllowed&&!x.sameUnitMixedAllowed&&!x.crossUnitMixedAllowed));
});

test("W7 Q012 promotes target beside Q007 while source-only siblings remain hidden",()=>{
  const a=selector.auditP07F12PublicSelectorComposition();assert.equal(a.ok,true,a.errors.join(","));
  const after=selector.listBatchAKnowledgePointAvailabilityBySource(SRC),ids=selector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  assert.ok(ids.includes("kp_g6a_u09_scale_factor_length"));assert.ok(ids.includes(KP));assert.equal(ids.length,2);
  assert.equal(after.hiddenPendingKnowledgePointIds.includes(KP),false);assert.equal(after.notSelectableKnowledgePointIds.includes(KP),false);
  assert.ok(PROTECTED.every(id=>!ids.includes(id)&&after.hiddenPendingKnowledgePointIds.includes(id)&&after.notSelectableKnowledgePointIds.includes(id)));
  assert.equal(after.sameSourceCandidateSetComplete,false);assert.equal(after.sameUnitMixedAllowed,false);assert.equal(after.w7FrozenQueueComplete,false);assert.deepEqual(selector.resolveVisiblePatternSpecIdsForKnowledgePoint(KP,"diagram"),SPEC_IDS);
});

test("W7 Q012 capability binding matches frozen geometry-formula k-squared envelope",()=>{
  const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join(","));const b=resolvePublicUiCapabilityBinding(request());
  assert.equal(b.blocked,false);assert.equal(b.questionType,"diagram");assert.equal(b.questionCount.max,240);assert.deepEqual(b.requiredCapabilityIds,REQUIRED);assert.deepEqual(b.optionalCapabilityIds,OPTIONAL);assert.deepEqual(b.appliedRuntimeModifierIds,MODIFIERS);assert.equal(b.frozenRuntimeProfile,"profile_geometry_formula");
  assert.equal(b.rectangleAreaFormulaPrerequisiteRequired,true);assert.equal(b.scaleFactorLengthPrerequisiteRequired,true);assert.equal(b.scaleAreaChangeOwned,true);assert.equal(b.areaScaleFactorEqualsSquareOfLinearScaleFactorRequired,true);assert.equal(b.sourceBackedRectangleApplicationAllowed,true);
  assert.equal(b.q007LengthScaleFactorPrerequisiteTeachingReownershipAllowed,false);assert.equal(b.similarShapeAngleTeachingAllowed,false);assert.equal(b.scaleDrawingConstructionAllowed,false);assert.equal(b.mapScaleDistanceAllowed,false);assert.equal(b.mapScaleBarInterpretationAllowed,false);assert.equal(b.sameUnitMixedAdmission,false);assert.equal(b.crossUnitMixedAdmission,false);
});

for(const patternSpecId of SPEC_IDS)test("W7 Q012 "+patternSpecId+" has 240 deterministic unique valid variants",()=>{
  const a=generateG6AU09P07F12Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"}),b=generateG6AU09P07F12Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){const p=q.patternRepresentation;assert.equal(validateG6AU09P07F12Question(q).ok,true);assert.equal(validateG6AU09P07F12Answer(q,q.answerText).ok,true);assert.equal(validateScaleAreaChangeDiagramModel(q.geometryDiagram).ok,true);assert.ok(p.scaleFactorValue>0);assert.ok(p.areaFactorValue>0);assert.ok(Math.abs(p.areaFactorValue-p.scaleFactorValue*p.scaleFactorValue)<1e-12);}
});

test("W7 Q012 includes exact source-backed 18m by 9m at 1:300 family without making one source number mandatory",()=>{
  const q=buildG6AU09P07F12Question({variant:26,patternSpecId:"ps_g6a_u09_source_rectangle_scale_area_application"});
  const p=q.patternRepresentation;assert.equal(p.sourceExemplarMatch,true);assert.equal(p.actualLengthMeters,18);assert.equal(p.actualWidthMeters,9);assert.equal(p.scaleFactorDenominator,300);assert.equal(p.paperLengthCm,6);assert.equal(p.paperWidthCm,3);assert.equal(p.paperAreaCm2,18);assert.equal(q.answerText,"18");assert.equal(validateG6AU09P07F12Answer(q,"18").ok,true);
});

test("W7 Q012 validator fails closed on wrong k squared answer, damaged invariant and ownership leakage",()=>{
  const q=buildG6AU09P07F12Question({variant:7,patternSpecId:"ps_g6a_u09_area_factor_from_linear_factor"});
  assert.equal(validateG6AU09P07F12Answer(q,q.answerText).ok,true);assert.equal(validateG6AU09P07F12Answer(q,"2").ok,false);
  assert.equal(validateG6AU09P07F12Question({...q,patternRepresentation:{...q.patternRepresentation,areaFactorValue:q.patternRepresentation.scaleFactorValue}}).ok,false);
  assert.equal(validateG6AU09P07F12Question({...q,metadata:{...q.metadata,mapScaleDistanceReowned:true}}).ok,false);
  assert.equal(validateG6AU09P07F12Question({...q,geometryDiagram:{...q.geometryDiagram,semanticCore:"WRONG"}}).ok,false);
});

test("W7 Q012 aggregate generator worksheet renderer cover all four families and preserve mixed fail-closed",()=>{
  const plan=buildBatchABrowserPlan(request({questionCount:16}));assert.equal(plan.sourceId,SRC);assert.equal(plan.questionCountMax,240);assert.deepEqual(plan.patternSpecIds,SPEC_IDS);assert.equal(plan.frozenRuntimeProfile,"profile_geometry_formula");
  const g=generateBatchABrowserQuestions(request({questionCount:16}));assert.equal(g.ok,true,g.errors.join(","));assert.equal(g.questions.length,16);assert.equal(new Set(g.questions.map(q=>q.questionSignature)).size,16);assert.deepEqual([...new Set(g.questions.map(q=>q.patternRepresentation.targetKind))].sort(),["AREA_COMPARISON","AREA_FACTOR","SCALED_AREA","SOURCE_RECTANGLE_APPLICATION"]);
  const w=buildBatchABrowserWorksheetDocument(request({questionCount:12,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:3}}));assert.equal(w.ok,true,w.errors.join(","));assert.equal(w.worksheetDocument.questionCount,12);assert.equal(w.worksheetDocument.answerKeyItems.length,12);assert.equal(w.worksheetDocument.questionDisplayModels.every(x=>x.geometryDiagram?.kind==="scale_area_change_diagram"),true);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""}),visible=html.replace(/<[^>]*>/g," ");assert.match(visible,/面積/);assert.match(visible,/倍/);assert.match(visible,/比例尺/);assert.equal((html.match(/worksheet-scale-area-change-diagram/g)||[]).length,24);
  for(const term of ["相似圖形角度","畫出放大圖","畫出縮圖","地圖上距離"])assert.equal(visible.includes(term),false,term);assert.equal(visible.includes("kp_g6a_u09_"),false);assert.equal(visible.includes("ps_g6a_u09_"),false);assert.equal(visible.includes("P07F12"),false);
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[KP,"kp_g6a_u09_scale_factor_length"],questionMode:"diagram",questionCount:4,generationSeed:"mixed-not-admitted"});assert.equal(mixed.ok,false);
});

test("W7 Q012 current browser pointers advance to P07F12 while Q011 through Q001 and W6 Q020 stay reachable",()=>{
  const selectorText=readFileSync(new URL("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",import.meta.url),"utf8"),bindingText=readFileSync(new URL("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",import.meta.url),"utf8"),generatorText=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",import.meta.url),"utf8"),worksheetText=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",import.meta.url),"utf8");
  assert.match(selectorText,/batch-a-selector-p07f14-extension/);assert.match(bindingText,/public-ui-capability-binding-p07f14/);
  for(const id of ["12","11","10","09","08","07","06","05","04","03","02","01"])assert.match(generatorText,new RegExp("requestsP07F"+id));assert.match(generatorText,/requestsP06F20/);
  for(const id of ["12","11","10","09","08","07","06","05","04","03","02","01"])assert.match(worksheetText,new RegExp("buildP07F"+id+"Worksheet"));assert.match(worksheetText,/buildP06F20Worksheet/);
});

test("W7 Q012 validation contract stays SHARED_RUNTIME_BOUNDED and transfers GCI-PM01 current ownership only",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.equal(validation.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);assert.equal(impact.scopeGuards.q011ProductMutation,false);assert.equal(impact.scopeGuards.q013OrLaterProductMutation,false);assert.equal(impact.scopeGuards.scaleAreaChangeRendererOnly,true);assert.equal(impact.scopeGuards.gciPm01SuccessorRuleOnly,true);
});
