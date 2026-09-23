import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as selector from "../../site/modules/curriculum/registry/batch-a-selector-p07f11-extension.js";
import * as preSelector from "../../site/modules/curriculum/registry/batch-a-selector-p07f10-extension.js";
import {auditG6AU07P07F11Projection,G6A_U07_P07F11_APPLIED_MODIFIER_IDS as MODIFIERS,G6A_U07_P07F11_INCLUDED_RELATIONS as RELATIONS,G6A_U07_P07F11_KP_ID as KP,G6A_U07_P07F11_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G6A_U07_P07F11_PATTERN_SPECS as SPECS,G6A_U07_P07F11_PREDECESSOR_KP_IDS as PREDECESSORS,G6A_U07_P07F11_PROTECTED_FUTURE_KP_IDS as PROTECTED,G6A_U07_P07F11_REQUIRED_CAPABILITY_IDS as REQUIRED,G6A_U07_P07F11_SOURCE_ID as SRC,G6A_U07_P07F11_SPEC_IDS as SPEC_IDS} from "../../site/modules/curriculum/registry/g6a-u07-circle-area-derivation-selector-projection-p07f11.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p07f11.js";
import {buildG6AU07P07F11Question,generateG6AU07P07F11Questions,validateG6AU07P07F11Answer,validateG6AU07P07F11Question} from "../../site/modules/curriculum/batch-a/g6a-u07-circle-area-derivation-runtime-p07f11.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {getBatchASourceUnit,isBatchASourceId,listBatchASourceUnits} from "../../site/modules/curriculum/batch-a/source-units.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {validateCircleAreaDerivationDiagramModel} from "../../site/modules/renderer/circle-area-derivation-diagram-p07f11.js";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p07f/q011-g6a-u07-circle-area-derivation-implementation.json");
const repair=read("data/curriculum/full-product/p07f/q011-g6a-u07-circle-area-derivation-supplementary-evidence-authority-repair.json");
const impact=read("data/project/change-impact/P07F_W7_Q011.impact.json");
const validation=read("data/project/validation-plans/P07F_W7_Q011.validation.json");
const request=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"diagram",questionCount:20,generationSeed:"p07f11-circle-area-derivation",...extra});

test("W7 Q011 implementation consumes approved supplementary authority and exact frozen identity",()=>{
  assert.equal(repair.status,"PASS_SUPPLEMENTARY_EVIDENCE_RECONCILED_SEMANTIC_OWNERSHIP_LOCKED_IMPLEMENTATION_APPROVAL_REQUIRED");
  assert.equal(impl.preflight.repairPrNumber,1041);assert.equal(impl.preflight.repairMergeSha,"472ab0cc55270af3948976a0861ff1e2f25ffb61");
  assert.equal(impl.predecessorD0.q010Status,"PASS_E6_D0_COMPLETE");assert.equal(impl.predecessorD0.q010PostMergeWorkflowRunId,35744406174);
  assert.equal(impl.queueAuthority.queuePosition,11);assert.equal(impl.queueAuthority.queueSliceCount,26);assert.equal(impl.queueAuthority.sliceId,"p07e_q011_r9_g6a_u07_6a07_profile_geometry_formula_c1");assert.deepEqual(impl.queueAuthority.knowledgePointIds,[KP]);
  assert.equal(impl.sourceAuthority.originalPdfDirectDerivationSupport,false);assert.equal(impl.sourceAuthority.supplementaryEvidenceAuthorityType,"OPERATOR_PROVIDED_SUPPLEMENTARY_VISUAL_EVIDENCE");assert.equal(impl.sourceAuthority.supplementaryEvidenceDriveFileIds.length,3);
  assert.deepEqual(impl.prerequisiteContract.requiredKnowledgePointIds,PREDECESSORS);
});

test("W7 Q011 registers first public G6A-U07 source without source identity drift",()=>{
  const unit=getBatchASourceUnit(SRC);assert.ok(unit);assert.equal(unit.unitCode,"6A-U07");assert.equal(unit.title,"圓面積和扇形面積");assert.equal(unit.domain,"geometry_formula");assert.equal(isBatchASourceId(SRC),true);
  const units=listBatchASourceUnits({includeW7Slice011:true});assert.ok(units.some(x=>x.sourceId===SRC));
});

test("W7 Q011 FormalMapping and five PatternSpecs own derivation only",()=>{
  const a=auditG6AU07P07F11Projection();assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:5,formalMappings:1});
  assert.deepEqual(REQUIRED,impl.runtimeContract.exactRequiredRuntimeCapabilityIds);assert.deepEqual(OPTIONAL,[]);assert.deepEqual(MODIFIERS,[]);assert.deepEqual(impl.productContract.includedRelations,RELATIONS);
  assert.ok(SPECS.every(x=>x.semanticCore==="CIRCLE_AREA_DERIVATION_BY_SECTOR_REARRANGEMENT_TO_APPROX_RECTANGLE"&&x.requiresDiagramRepresentation&&x.areaConservationPrerequisiteRequired&&x.circleCircumferenceFormulaPrerequisiteRequired&&x.circleCutIntoSectorsRequired&&x.alternatingSectorRearrangementRequired&&x.halfCircumferenceAsLengthRequired&&x.radiusAsWidthRequired&&x.finerSectorCountApproachesRectangleRequired&&x.formulaConclusionPiRSquaredRequired&&!x.circleAreaFormulaProductionAllowed&&!x.sectorAreaAllowed&&!x.annulusAreaAllowed&&!x.compositeCircleAreaAllowed&&!x.applicationContextAllowed&&!x.sameUnitMixedAllowed&&!x.crossUnitMixedAllowed));
});

test("W7 Q011 promotes only derivation while formula sector annulus and composite area remain hidden",()=>{
  const before=preSelector.listBatchAKnowledgePointAvailabilityBySource(SRC);assert.equal((before?.visibleKnowledgePointIds??[]).includes(KP),false);
  const a=selector.auditP07F11PublicSelectorComposition();assert.equal(a.ok,true,a.errors.join(","));
  const after=selector.listBatchAKnowledgePointAvailabilityBySource(SRC),ids=selector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  assert.deepEqual(ids,[KP]);assert.ok(selector.getVisibleBatchAKnowledgePoint(KP));assert.equal(after.hiddenPendingKnowledgePointIds.includes(KP),false);assert.equal(after.notSelectableKnowledgePointIds.includes(KP),false);
  assert.ok(PROTECTED.every(id=>!ids.includes(id)&&after.hiddenPendingKnowledgePointIds.includes(id)&&after.notSelectableKnowledgePointIds.includes(id)));
  assert.equal(after.sameSourceCandidateSetComplete,false);assert.equal(after.sameUnitMixedAllowed,false);assert.equal(after.w7FrozenQueueComplete,false);assert.deepEqual(selector.resolveVisiblePatternSpecIdsForKnowledgePoint(KP,"diagram"),SPEC_IDS);
});

test("W7 Q011 capability binding matches geometry-formula derivation envelope",()=>{
  const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join(","));const b=resolvePublicUiCapabilityBinding(request());
  assert.equal(b.blocked,false);assert.equal(b.questionType,"diagram");assert.equal(b.questionCount.max,240);assert.deepEqual(b.requiredCapabilityIds,REQUIRED);assert.deepEqual(b.optionalCapabilityIds,OPTIONAL);assert.deepEqual(b.appliedRuntimeModifierIds,MODIFIERS);assert.equal(b.frozenRuntimeProfile,"profile_geometry_formula");
  assert.equal(b.originalPdfDirectDerivationSupport,false);assert.equal(b.supplementaryVisualEvidenceRequired,true);assert.equal(b.areaConservationPrerequisiteRequired,true);assert.equal(b.circleCircumferenceFormulaPrerequisiteRequired,true);assert.equal(b.circleAreaDerivationOwned,true);
  assert.equal(b.circleAreaFormulaProductionAllowed,false);assert.equal(b.sectorAreaAllowed,false);assert.equal(b.annulusAreaAllowed,false);assert.equal(b.compositeCircleAreaAllowed,false);assert.equal(b.sameUnitMixedAdmission,false);assert.equal(b.crossUnitMixedAdmission,false);
});

for(const patternSpecId of SPEC_IDS)test("W7 Q011 "+patternSpecId+" has 240 deterministic unique derivation variants",()=>{
  const a=generateG6AU07P07F11Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"}),b=generateG6AU07P07F11Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){const p=q.patternRepresentation;assert.equal(validateG6AU07P07F11Question(q).ok,true);assert.equal(validateG6AU07P07F11Answer(q,q.answerText).ok,true);assert.equal(validateCircleAreaDerivationDiagramModel(q.geometryDiagram).ok,true);assert.equal(p.areaConserved,true);assert.equal(p.halfCircumferenceLengthSymbol,"πr");assert.equal(p.radiusWidthSymbol,"r");assert.equal(p.formulaConclusion,"πr²");assert.equal(p.finerSectorsApproachRectangle,true);}
});

test("W7 Q011 validator fails closed on symbolic answer, derivation invariant and scope damage",()=>{
  const q=buildG6AU07P07F11Question({variant:17,patternSpecId:"ps_g6a_u07_circle_derivation_pi_r_squared_conclusion"});assert.equal(validateG6AU07P07F11Answer(q,"πr²").ok,true);assert.equal(validateG6AU07P07F11Answer(q,"2πr").ok,false);
  assert.equal(validateG6AU07P07F11Question({...q,patternRepresentation:{...q.patternRepresentation,areaConserved:false}}).ok,false);
  assert.equal(validateG6AU07P07F11Question({...q,metadata:{...q.metadata,annulusAreaReowned:true}}).ok,false);
  assert.equal(validateG6AU07P07F11Question({...q,geometryDiagram:{...q.geometryDiagram,finerSectorsApproachRectangle:false}}).ok,false);
});

test("W7 Q011 aggregate generator worksheet renderer cover all derivation families and preserve mixed fail-closed",()=>{
  const plan=buildBatchABrowserPlan(request({questionCount:15}));assert.equal(plan.sourceId,SRC);assert.equal(plan.questionCountMax,240);assert.deepEqual(plan.patternSpecIds,SPEC_IDS);assert.equal(plan.frozenRuntimeProfile,"profile_geometry_formula");
  const g=generateBatchABrowserQuestions(request({questionCount:15}));assert.equal(g.ok,true,g.errors.join(","));assert.equal(g.questions.length,15);assert.equal(new Set(g.questions.map(q=>q.questionSignature)).size,15);assert.deepEqual([...new Set(g.questions.map(q=>q.patternRepresentation.targetKind))].sort(),["AREA_CONSERVATION","FINER_SECTOR_APPROXIMATION","HALF_CIRCUMFERENCE_LENGTH","PI_R_SQUARED_CONCLUSION","RADIUS_WIDTH"]);
  const w=buildBatchABrowserWorksheetDocument(request({questionCount:10,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:3}}));assert.equal(w.ok,true,w.errors.join(","));assert.equal(w.worksheetDocument.questionCount,10);assert.equal(w.worksheetDocument.answerKeyItems.length,10);assert.equal(w.worksheetDocument.questionDisplayModels.every(x=>x.geometryDiagram?.kind==="circle_area_derivation_diagram"),true);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""}),visible=html.replace(/<[^>]*>/g," ");assert.match(visible,/剪拼|重組/);assert.match(visible,/πr/);assert.match(visible,/半徑|短邊/);assert.equal((html.match(/worksheet-circle-area-derivation-diagram/g)||[]).length,20);
  for(const term of ["圓環面積","扇形面積","牛吃草","百分率"])assert.equal(visible.includes(term),false,term);assert.equal(visible.includes("kp_g6a_u07_"),false);assert.equal(visible.includes("ps_g6a_u07_"),false);assert.equal(visible.includes("P07F11"),false);
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[KP,"kp_g6a_u07_circle_area_formula"],questionMode:"diagram",questionCount:4,generationSeed:"mixed-not-admitted"});assert.equal(mixed.ok,false);
});

test("W7 Q011 current browser pointers advance to P07F11 while Q010 through Q001 and W6 Q020 stay reachable",()=>{
  const selectorText=readFileSync(new URL("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",import.meta.url),"utf8"),bindingText=readFileSync(new URL("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",import.meta.url),"utf8"),generatorText=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",import.meta.url),"utf8"),worksheetText=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",import.meta.url),"utf8");
  assert.match(selectorText,/batch-a-selector-p07f11-extension/);assert.match(bindingText,/public-ui-capability-binding-p07f11/);
  for(const id of ["11","10","09","08","07","06","05","04","03","02","01"])assert.match(generatorText,new RegExp("requestsP07F"+id));assert.match(generatorText,/requestsP06F20/);
  for(const id of ["11","10","09","08","07","06","05","04","03","02","01"])assert.match(worksheetText,new RegExp("buildP07F"+id+"Worksheet"));assert.match(worksheetText,/buildP06F20Worksheet/);
});

test("W7 Q011 validation contract stays SHARED_RUNTIME_BOUNDED and transfers GCI-PM01 current ownership only",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.equal(validation.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);assert.equal(impact.scopeGuards.q010ProductMutation,false);assert.equal(impact.scopeGuards.q012OrLaterProductMutation,false);assert.equal(impact.scopeGuards.circleAreaDerivationRendererOnly,true);assert.equal(impact.scopeGuards.gciPm01SuccessorRuleOnly,true);
});
