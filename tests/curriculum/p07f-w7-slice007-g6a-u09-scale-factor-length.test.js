import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as selector from "../../site/modules/curriculum/registry/batch-a-selector-p07f07-extension.js";
import * as preSelector from "../../site/modules/curriculum/registry/batch-a-selector-p07f06-extension.js";
import {auditG6AU09P07F07Projection,G6A_U09_P07F07_APPLIED_MODIFIER_IDS as MODIFIERS,G6A_U09_P07F07_INCLUDED_RELATIONS as RELATIONS,G6A_U09_P07F07_KP_ID as KP,G6A_U09_P07F07_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G6A_U09_P07F07_PATTERN_SPECS as SPECS,G6A_U09_P07F07_PROTECTED_FUTURE_KP_IDS as PROTECTED,G6A_U09_P07F07_REQUIRED_CAPABILITY_IDS as REQUIRED,G6A_U09_P07F07_SOURCE_ID as SRC,G6A_U09_P07F07_SPEC_IDS as SPEC_IDS} from "../../site/modules/curriculum/registry/g6a-u09-scale-factor-length-selector-projection-p07f07.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p07f07.js";
import {buildG6AU09P07F07Question,generateG6AU09P07F07Questions,validateG6AU09P07F07Answer,validateG6AU09P07F07Question} from "../../site/modules/curriculum/batch-a/g6a-u09-scale-factor-length-runtime-p07f07.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {listBatchASourceUnits,getBatchASourceUnit,isBatchASourceId} from "../../site/modules/curriculum/batch-a/source-units.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p07f/q007-g6a-u09-scale-factor-length-implementation.json");
const preflight=read("data/curriculum/full-product/p07f/q007-g6a-u09-scale-factor-length-source-authority-preflight.json");
const impact=read("data/project/change-impact/P07F_W7_Q007.impact.json");
const validation=read("data/project/validation-plans/P07F_W7_Q007.validation.json");
const request=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"numeric",questionCount:20,generationSeed:"p07f07-scale-factor-length",...extra});

test("W7 Q007 implementation preserves frozen queue, Q006 D0, direct source evidence, runtime and exact prerequisite",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(impl.preflight.prNumber,1028);
  assert.equal(impl.preflight.mergeSha,"c6b2f60481e59cd8205146a17404310a09044e55");
  assert.equal(impl.predecessorD0.q006Status,"PASS_E6_D0_COMPLETE");
  assert.equal(impl.queueAuthority.queuePosition,7);assert.equal(impl.queueAuthority.queueSliceCount,26);
  assert.equal(impl.queueAuthority.sliceId,"p07e_q007_r8_g6a_u09_6a09_profile_quantity_measurement_c1");
  assert.deepEqual(impl.queueAuthority.knowledgePointIds,[KP]);assert.equal(impl.queueAuthority.runtimeProfileId,"profile_quantity_measurement");
  assert.deepEqual(impl.queueAuthority.appliedModifierIds,MODIFIERS);assert.deepEqual(impl.queueAuthority.requiredW7CapabilityIds,[]);
  assert.equal(impl.sourceAuthority.semanticAuthority,"R02_REVIEWED_CANDIDATE_PLUS_CURRENT_DIRECT_VISUAL_LENGTH_SCALE_FACTOR_EVIDENCE");
  assert.equal(impl.sourceAuthority.currentVisualSupportLevel,"DIRECT_LITERAL_SCALE_FACTOR_LENGTH_RELATION");
  assert.deepEqual(impl.sourceAuthority.directVisualCorrespondingLengthPairs,[{redLength:12,blueLength:8},{redLength:6,blueLength:4}]);
  assert.deepEqual(impl.prerequisiteContract.requiredKnowledgePointIds,["kp_g6a_u05_equivalent_ratio"]);
});

test("W7 Q007 FormalMapping and three PatternSpecs own positive nonzero common scale-factor length reasoning only",()=>{
  const a=auditG6AU09P07F07Projection();assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1});
  assert.deepEqual(REQUIRED,preflight.runtimeCapabilityAuthority.executableR04Mapping.requiredRuntimeCapabilityIds);
  assert.deepEqual(OPTIONAL,preflight.runtimeCapabilityAuthority.executableR04Mapping.optionalRuntimeCapabilityIds);
  assert.deepEqual(MODIFIERS,[]);assert.deepEqual(impl.productContract.includedRelations,RELATIONS);
  assert.ok(SPECS.every(x=>x.semanticCore==="CORRESPONDING_LENGTHS_SHARE_ONE_POSITIVE_NONZERO_SCALE_FACTOR"&&x.equivalentRatioPrerequisiteRequired&&x.correspondingLengthRolesRequired&&x.oneCommonScaleFactorAcrossAllCorrespondingLengthsRequired&&x.scaleFactorMustBePositive&&x.scaleFactorMustBeNonzero&&x.enlargementFactorGreaterThanOneAllowed&&x.reductionFactorBetweenZeroAndOneAllowed&&x.scaleFactorMayBeFractionOrDecimal&&x.computeTargetLengthFromKnownCorrespondingLengthAndScaleFactorAllowed&&x.inferScaleFactorFromOneCorrespondingLengthPairAllowed&&x.verifySameScaleFactorAcrossMultipleCorrespondingLengthPairsAllowed&&x.sameUnitLengthPairOnlyForInitialGenerator&&!x.unitConversionAllowed&&!x.anglePreservationTeachingAllowed&&!x.scaleDrawingConstructionAllowed&&!x.mapScaleDistanceAllowed&&!x.scaleAreaChangeAllowed&&!x.mapScaleBarInterpretationAllowed&&!x.applicationContextAllowed&&!x.sameUnitMixedAllowed&&!x.crossUnitMixedAllowed));
});

test("W7 Q007 registers G6A-U09 source and promotes only scale-factor-length KP while protecting siblings",()=>{
  assert.equal(isBatchASourceId(SRC),true);
  const sourceUnit=getBatchASourceUnit(SRC);assert.equal(sourceUnit.unitCode,"6A-U09");assert.equal(sourceUnit.domain,"quantity_measurement");
  assert.ok(listBatchASourceUnits({includeW7Slice007:true}).some(x=>x.sourceId===SRC));
  const before=preSelector.listBatchAKnowledgePointAvailabilityBySource(SRC);
  assert.equal((before?.visibleKnowledgePointIds??[]).includes(KP),false);
  const a=selector.auditP07F07PublicSelectorComposition();assert.equal(a.ok,true,a.errors.join(","));
  const after=selector.listBatchAKnowledgePointAvailabilityBySource(SRC),ids=selector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  assert.ok(ids.includes(KP));assert.ok(selector.getVisibleBatchAKnowledgePoint(KP));
  assert.equal(after.hiddenPendingKnowledgePointIds.includes(KP),false);assert.equal(after.notSelectableKnowledgePointIds.includes(KP),false);
  assert.ok(PROTECTED.every(id=>after.hiddenPendingKnowledgePointIds.includes(id)&&after.notSelectableKnowledgePointIds.includes(id)&&!ids.includes(id)));
  assert.equal(after.sameSourceCandidateSetComplete,false);assert.equal(after.sameUnitMixedAllowed,false);assert.equal(after.w7FrozenQueueComplete,false);
  assert.deepEqual(selector.resolveVisiblePatternSpecIdsForKnowledgePoint(KP,"numeric"),SPEC_IDS);
});

test("W7 Q007 capability binding preserves exact quantity-measurement envelope with scale instrument optional only",()=>{
  const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join(","));
  const b=resolvePublicUiCapabilityBinding(request());
  assert.equal(b.blocked,false);assert.equal(b.questionType,"numeric");assert.equal(b.questionCount.max,240);
  assert.deepEqual(b.requiredCapabilityIds,REQUIRED);assert.deepEqual(b.optionalCapabilityIds,OPTIONAL);assert.deepEqual(b.appliedRuntimeModifierIds,[]);
  assert.equal(b.frozenRuntimeProfile,"profile_quantity_measurement");
  assert.equal(b.equivalentRatioPrerequisiteRequired,true);assert.equal(b.scaleFactorLengthOwned,true);assert.equal(b.oneCommonScaleFactorRequired,true);assert.equal(b.positiveNonzeroScaleFactorRequired,true);assert.equal(b.fractionOrDecimalScaleFactorAllowed,true);assert.equal(b.sameUnitLengthPairOnly,true);
  assert.equal(b.unitConversionAllowed,false);assert.equal(b.anglePreservationTeachingAllowed,false);assert.equal(b.scaleDrawingConstructionAllowed,false);assert.equal(b.mapScaleDistanceAllowed,false);assert.equal(b.scaleAreaChangeAllowed,false);assert.equal(b.mapScaleBarInterpretationAllowed,false);assert.equal(b.applicationContextAllowed,false);assert.equal(b.sameUnitMixedAdmission,false);assert.equal(b.crossUnitMixedAdmission,false);
});

for(const patternSpecId of SPEC_IDS)test("W7 Q007 "+patternSpecId+" has 240 deterministic unique validated variants",()=>{
  const a=generateG6AU09P07F07Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
  const b=generateG6AU09P07F07Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){const p=q.patternRepresentation;assert.equal(validateG6AU09P07F07Question(q).ok,true);assert.equal(validateG6AU09P07F07Answer(q,q.answerValue).ok,true);assert.equal(p.positiveScaleFactor,true);assert.equal(p.nonzeroScaleFactor,true);assert.equal(p.commonScaleFactorVerified,true);assert.ok(Math.abs(p.targetLengthA/p.sourceLengthA-p.scaleFactorValue)<1e-12);assert.ok(Math.abs(p.targetLengthB/p.sourceLengthB-p.scaleFactorValue)<1e-12);}
});

test("W7 Q007 validator accepts fraction answers and fails closed on inconsistent scale factor or forbidden ownership leakage",()=>{
  const q=buildG6AU09P07F07Question({variant:1,patternSpecId:SPEC_IDS[0]});
  assert.equal(validateG6AU09P07F07Answer(q,q.answerText).ok,true);
  assert.equal(validateG6AU09P07F07Answer(q,q.answerValue).ok,true);
  assert.equal(validateG6AU09P07F07Answer(q,q.answerValue+0.5).ok,false);
  const p=q.patternRepresentation;
  assert.equal(validateG6AU09P07F07Question({...q,patternRepresentation:{...p,targetLengthB:p.targetLengthB+1,commonScaleFactorVerified:false}}).ok,false);
  assert.equal(validateG6AU09P07F07Question({...q,metadata:{...q.metadata,unitConversionUsed:true}}).ok,false);
  assert.equal(validateG6AU09P07F07Question({...q,metadata:{...q.metadata,mapScaleDistanceReowned:true}}).ok,false);
  assert.equal(validateG6AU09P07F07Question({...q,metadata:{...q.metadata,scaleAreaChangeReowned:true}}).ok,false);
});

test("W7 Q007 aggregate generator worksheet renderer expose factor inference target length and common-factor families",()=>{
  const plan=buildBatchABrowserPlan(request({questionCount:12}));assert.equal(plan.sourceId,SRC);assert.equal(plan.questionCountMax,240);assert.deepEqual(plan.patternSpecIds,SPEC_IDS);assert.equal(plan.frozenRuntimeProfile,"profile_quantity_measurement");
  const g=generateBatchABrowserQuestions(request({questionCount:12}));assert.equal(g.ok,true,g.errors.join(","));assert.equal(g.questions.length,12);assert.equal(new Set(g.questions.map(q=>q.questionSignature)).size,12);
  assert.deepEqual([...new Set(g.questions.map(q=>q.patternRepresentation.targetKind))].sort(),["COMMON_FACTOR","INFER_FACTOR","TARGET_LENGTH"]);
  const w=buildBatchABrowserWorksheetDocument(request({questionCount:9,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:6}}));assert.equal(w.ok,true,w.errors.join(","));assert.equal(w.worksheetDocument.questionCount,9);assert.equal(w.worksheetDocument.answerKeyItems.length,9);assert.equal(w.worksheetDocument.summary.diagramQuestionCount,0);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""}),visible=html.replace(/<[^>]*>/g," ");
  assert.match(visible,/對應/);assert.match(visible,/幾倍/);assert.match(visible,/同一比例倍數/);
  for(const term of ["角度","方格","實際距離","地圖","面積"])assert.equal(visible.includes(term),false,term);
  assert.equal(visible.includes("kp_g6a_u09_"),false);assert.equal(visible.includes("ps_g6a_u09_"),false);assert.equal(visible.includes("P07F07"),false);
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[KP,"kp_g6a_u09_scale_area_change"],questionMode:"numeric",questionCount:4,generationSeed:"mixed-not-admitted"});assert.equal(mixed.ok,false);
});

test("W7 Q007 current browser pointers advance to P07F08 while Q006 Q005 Q004 Q003 Q002 Q001 and W6 Q020 stay reachable",()=>{
  const selectorText=readFileSync(new URL("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",import.meta.url),"utf8");
  const bindingText=readFileSync(new URL("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",import.meta.url),"utf8");
  const generatorText=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",import.meta.url),"utf8");
  const worksheetText=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",import.meta.url),"utf8");
  assert.match(selectorText,/batch-a-selector-p07f08-extension/);assert.match(bindingText,/public-ui-capability-binding-p07f08/);
  for(const id of ["08","07","06","05","04","03","02","01"])assert.match(generatorText,new RegExp("requestsP07F"+id));
  assert.match(generatorText,/requestsP06F20/);
  for(const id of ["08","07","06","05","04","03","02","01"])assert.match(worksheetText,new RegExp("buildP07F"+id+"Worksheet"));
  assert.match(worksheetText,/buildP06F20Worksheet/);
});

test("W7 Q007 validation contract stays SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.equal(validation.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
  assert.equal(impact.scopeGuards.q006ProductMutation,false);assert.equal(impact.scopeGuards.q001Q002Q003Q004Q005Q006CompatibilityTestOnlyMutation,true);assert.equal(impact.scopeGuards.q008OrLaterProductMutation,false);assert.equal(impact.scopeGuards.unitConversion,false);
});
