import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as selector from "../../site/modules/curriculum/registry/batch-a-selector-p07f04-extension.js";
import {listBatchASourceUnits} from "../../site/modules/curriculum/batch-a/source-units.js";
import {auditG6AU06P07F04Projection,G6A_U06_P07F04_APPLIED_MODIFIER_IDS as MODIFIERS,G6A_U06_P07F04_INCLUDED_RELATIONS as RELATIONS,G6A_U06_P07F04_KP_ID as KP,G6A_U06_P07F04_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G6A_U06_P07F04_PATTERN_SPECS as SPECS,G6A_U06_P07F04_PROTECTED_FUTURE_KP_IDS as PROTECTED,G6A_U06_P07F04_REQUIRED_CAPABILITY_IDS as REQUIRED,G6A_U06_P07F04_SOURCE_ID as SRC,G6A_U06_P07F04_SPEC_IDS as SPEC_IDS} from "../../site/modules/curriculum/registry/g6a-u06-pi-circumference-relation-selector-projection-p07f04.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p07f04.js";
import {buildG6AU06P07F04Question,generateG6AU06P07F04Questions,validateG6AU06P07F04Answer,validateG6AU06P07F04Question} from "../../site/modules/curriculum/batch-a/g6a-u06-pi-circumference-relation-runtime-p07f04.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p07f/q004-g6a-u06-pi-circumference-relation-implementation.json");
const preflight=read("data/curriculum/full-product/p07f/q004-g6a-u06-pi-circumference-relation-source-authority-preflight.json");
const impact=read("data/project/change-impact/P07F_W7_Q004.impact.json");
const validation=read("data/project/validation-plans/P07F_W7_Q004.validation.json");
const request=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"diagram",requestedQuestionType:"diagram",questionCount:20,generationSeed:"p07f04-pi-circumference",...extra});

test("W7 Q004 implementation preserves frozen queue, Q003 D0, and transparent source authority",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(impl.preflight.prNumber,1021);
  assert.equal(impl.preflight.mergeSha,"e8e024f5db29a6b54b9ce030fbd1d35fa34447bb");
  assert.equal(impl.predecessorD0.q003Status,"PASS_E6_D0_COMPLETE");
  assert.equal(impl.queueAuthority.queuePosition,4);
  assert.equal(impl.queueAuthority.queueSliceCount,26);
  assert.equal(impl.queueAuthority.sliceId,"p07e_q004_r7_g6a_u06_6a06_profile_geometry_formula_c1");
  assert.equal(impl.queueAuthority.previousSliceId,"p07e_q003_r7_g6a_u05_6a05_profile_integer_operations_c1");
  assert.deepEqual(impl.queueAuthority.knowledgePointIds,[KP]);
  assert.equal(impl.queueAuthority.runtimeProfileId,"profile_geometry_formula");
  assert.deepEqual(impl.queueAuthority.appliedModifierIds,MODIFIERS);
  assert.deepEqual(impl.queueAuthority.requiredW7CapabilityIds,[]);
  assert.equal(impl.sourceAuthority.semanticAuthority,"R02_REVIEWED_CANDIDATE_PRIMARY_CURRENT_VISUAL_CONTEXT_SECONDARY");
  assert.equal(impl.sourceAuthority.currentVisualSupportLevel,"INDIRECT_CONTEXTUAL_NOT_LITERAL_STATEMENT");
  assert.deepEqual(impl.sourceAuthority.targetEvidencePages,[1,2]);
});

test("W7 Q004 FormalMapping and three diagram PatternSpecs own C over d approximately pi relation only",()=>{
  const a=auditG6AU06P07F04Projection();assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1});
  assert.deepEqual(REQUIRED,preflight.runtimeCapabilityAuthority.executableR04Mapping.requiredRuntimeCapabilityIds);
  assert.deepEqual(MODIFIERS,preflight.runtimeCapabilityAuthority.executableR04Mapping.appliedModifierIds);
  assert.deepEqual(OPTIONAL,[]);
  assert.deepEqual(impl.productContract.includedRelations,RELATIONS);
  assert.ok(SPECS.every(x=>x.semanticCore==="CIRCUMFERENCE_DIVIDED_BY_DIAMETER_APPROX_PI"&&x.requiresDiagramRepresentation&&x.circumferenceRoleRequired&&x.diameterRoleRequired&&x.diameterPositiveNonzeroRequired&&x.quotientDirectionRequired==="CIRCUMFERENCE_DIVIDED_BY_DIAMETER"&&x.quotientApproximatelyPiRequired&&x.fixedRatioAcrossCirclesRequired&&!x.solveCircumferenceFromDiameterAllowed&&!x.solveDiameterFromCircumferenceAllowed&&!x.circumferenceFormulaTeachingReownershipAllowed&&!x.radiusBasedFormulaAllowed&&!x.semicirclePerimeterAllowed&&!x.sectorArcLengthAllowed&&!x.compositeArcPerimeterAllowed&&!x.rollingWheelApplicationAllowed&&!x.genericGeometryFormulaDrillAllowed&&!x.applicationContextAllowed&&!x.sameUnitMixedAllowed&&!x.crossUnitMixedAllowed));
});

test("W7 Q004 adds G6A-U06 source, promotes only pi-circumference relation, and keeps later/source-only geometry hidden",()=>{
  const a=selector.auditP07F04PublicSelectorComposition();assert.equal(a.ok,true,a.errors.join(","));
  const source=selector.listBatchAKnowledgePointAvailabilityBySource(SRC),ids=selector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  assert.deepEqual(ids,[KP]);assert.ok(selector.getVisibleBatchAKnowledgePoint(KP));
  assert.equal(source.hiddenPendingKnowledgePointIds.includes(KP),false);assert.equal(source.notSelectableKnowledgePointIds.includes(KP),false);
  assert.ok(PROTECTED.every(id=>source.hiddenPendingKnowledgePointIds.includes(id)&&source.notSelectableKnowledgePointIds.includes(id)&&!ids.includes(id)));
  assert.equal(source.sameSourceCandidateSetComplete,false);assert.equal(source.sameUnitMixedAllowed,false);assert.equal(source.w7FrozenQueueComplete,false);
  assert.deepEqual(selector.resolveVisiblePatternSpecIdsForKnowledgePoint(KP,"diagram"),SPEC_IDS);
  const unit=listBatchASourceUnits({includeW7Slice004:true,includeCurrentFullProductPublic:true}).find(x=>x.sourceId===SRC);
  assert.deepEqual(unit,{sourceId:SRC,grade:6,semester:"upper",unitCode:"6A-U06",title:"圓周長與扇形周長",domain:"geometry_formula",lifecycle:"public_full_product_w7_slice004_candidate"});
});

test("W7 Q004 capability binding preserves geometry-formula plus integer-division execution envelope",()=>{
  const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join(","));
  const b=resolvePublicUiCapabilityBinding(request());
  assert.equal(b.blocked,false);assert.equal(b.questionType,"diagram");assert.equal(b.questionCount.max,240);assert.equal(b.geometryDiagramRepresentation,true);
  assert.deepEqual(b.requiredCapabilityIds,REQUIRED);assert.deepEqual(b.optionalCapabilityIds,OPTIONAL);assert.deepEqual(b.appliedRuntimeModifierIds,MODIFIERS);
  assert.equal(b.frozenRuntimeProfile,"profile_geometry_formula");assert.equal(b.circumferenceDiameterRelationOwned,true);assert.equal(b.quotientDirectionRequired,"CIRCUMFERENCE_DIVIDED_BY_DIAMETER");
  assert.equal(b.solveCircumferenceFromDiameterAllowed,false);assert.equal(b.solveDiameterFromCircumferenceAllowed,false);assert.equal(b.circumferenceFormulaTeachingReownershipAllowed,false);assert.equal(b.semicirclePerimeterAllowed,false);assert.equal(b.sectorArcLengthAllowed,false);assert.equal(b.compositeArcPerimeterAllowed,false);assert.equal(b.rollingWheelApplicationAllowed,false);assert.equal(b.genericGeometryFormulaDrillAllowed,false);assert.equal(b.applicationContextAllowed,false);assert.equal(b.sameUnitMixedAdmission,false);assert.equal(b.crossUnitMixedAdmission,false);
});

for(const patternSpecId of SPEC_IDS)test("W7 Q004 "+patternSpecId+" has 240 deterministic unique validated diagram variants",()=>{
  const a=generateG6AU06P07F04Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
  const b=generateG6AU06P07F04Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){const p=q.patternRepresentation;assert.equal(validateG6AU06P07F04Question(q).ok,true);assert.equal(validateG6AU06P07F04Answer(q,q.answerValue).ok,true);assert.equal(q.geometryDiagram.kind,"circle_parts_diagram");assert.equal(q.geometryDiagram.targetPart,"DIAMETER");assert.equal(p.first.diameter>0,true);assert.ok(Math.abs(p.first.circumference/p.first.diameter-3.14)<1e-9);assert.equal(p.quotientDirection,"CIRCUMFERENCE_DIVIDED_BY_DIAMETER");}
});

test("W7 Q004 validator fails closed on reversed quotient semantics, bad pi value, formula reownership, and later geometry leakage",()=>{
  const q=buildG6AU06P07F04Question({variant:17,patternSpecId:SPEC_IDS[0]});const p=q.patternRepresentation;
  assert.equal(validateG6AU06P07F04Answer(q,3.14).ok,true);assert.equal(validateG6AU06P07F04Answer(q,2.9).ok,false);
  assert.equal(validateG6AU06P07F04Question({...q,patternRepresentation:{...p,quotientDirection:"DIAMETER_DIVIDED_BY_CIRCUMFERENCE"}}).ok,false);
  assert.equal(validateG6AU06P07F04Question({...q,metadata:{...q.metadata,circumferenceFormulaTeachingReowned:true}}).ok,false);
  assert.equal(validateG6AU06P07F04Question({...q,metadata:{...q.metadata,semicirclePerimeterReowned:true}}).ok,false);
  assert.equal(validateG6AU06P07F04Question({...q,metadata:{...q.metadata,rollingWheelApplicationUsed:true}}).ok,false);
  assert.equal(validateG6AU06P07F04Question({...q,metadata:{...q.metadata,genericGeometryFormulaDrillUsed:true}}).ok,false);
});

test("W7 Q004 aggregate generator worksheet renderer expose three relation families without leaking future formulas",()=>{
  const plan=buildBatchABrowserPlan(request({questionCount:12}));assert.equal(plan.sourceId,SRC);assert.equal(plan.questionCountMax,240);assert.deepEqual(plan.patternSpecIds,SPEC_IDS);assert.equal(plan.frozenRuntimeProfile,"profile_geometry_formula");
  const g=generateBatchABrowserQuestions(request({questionCount:12}));assert.equal(g.ok,true,g.errors.join(","));assert.equal(g.questions.length,12);assert.equal(new Set(g.questions.map(q=>q.questionSignature)).size,12);
  assert.deepEqual([...new Set(g.questions.map(q=>q.patternRepresentation.targetKind))].sort(),["COMPARE_TWO_CIRCLES","COMPUTE_QUOTIENT","IDENTIFY_COMMON_RATIO"]);
  const w=buildBatchABrowserWorksheetDocument(request({questionCount:9,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:4}}));assert.equal(w.ok,true,w.errors.join(","));assert.equal(w.worksheetDocument.questionCount,9);assert.equal(w.worksheetDocument.answerKeyItems.length,9);
  assert.equal(w.worksheetDocument.questionDisplayModels.every(x=>x.geometryDiagram?.kind==="circle_parts_diagram"),true);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""}),visible=html.replace(/<[^>]*>/g," ");
  assert.match(visible,/圓周長 ÷ 直徑/);assert.match(visible,/約是直徑的幾倍/);assert.match(visible,/圓 A/);
  assert.equal((html.match(/worksheet-circle-parts-diagram/g)||[]).length,18);
  for(const term of ["半徑","半圓","扇形","滾動","最簡","百分率"])assert.equal(visible.includes(term),false,term);
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[KP,"kp_g6a_u06_circle_circumference_formula"],questionMode:"diagram",questionCount:4,generationSeed:"mixed-not-admitted"});assert.equal(mixed.ok,false);
});

test("W7 Q004 remains reachable after current browser pointers advance to P07F07",()=>{
  const selectorText=readFileSync(new URL("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",import.meta.url),"utf8");
  const bindingText=readFileSync(new URL("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",import.meta.url),"utf8");
  const generatorText=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",import.meta.url),"utf8");
  const worksheetText=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",import.meta.url),"utf8");
  assert.match(selectorText,/batch-a-selector-p07f07-extension/);assert.match(bindingText,/public-ui-capability-binding-p07f07/);
  assert.match(generatorText,/requestsP07F07/);assert.match(generatorText,/requestsP07F06/);assert.match(generatorText,/requestsP07F05/);assert.match(generatorText,/requestsP07F04/);assert.match(generatorText,/requestsP07F03/);assert.match(generatorText,/requestsP07F02/);assert.match(generatorText,/requestsP07F01/);assert.match(generatorText,/requestsP06F20/);
  assert.match(worksheetText,/buildP07F07Worksheet/);assert.match(worksheetText,/buildP07F06Worksheet/);assert.match(worksheetText,/buildP07F05Worksheet/);assert.match(worksheetText,/buildP07F04Worksheet/);assert.match(worksheetText,/buildP07F03Worksheet/);assert.match(worksheetText,/buildP07F02Worksheet/);assert.match(worksheetText,/buildP07F01Worksheet/);assert.match(worksheetText,/buildP06F20Worksheet/);
});

test("W7 Q004 validation contract stays SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.equal(validation.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
  assert.equal(impact.scopeGuards.q003ProductMutation,false);assert.equal(impact.scopeGuards.q001Q002Q003CompatibilityTestOnlyMutation,true);assert.equal(impact.scopeGuards.q020CurrentPointerCompatibilityTestOnlyMutation,true);assert.equal(impact.scopeGuards.q005OrLaterProductMutation,false);assert.equal(impact.scopeGuards.genericGeometryFormulaDrill,false);
});
