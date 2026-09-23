import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as selector from "../../site/modules/curriculum/registry/batch-a-selector-p07f05-extension.js";
import * as preSelector from "../../site/modules/curriculum/registry/batch-a-selector-p07f04-extension.js";
import {auditG6AU05P07F05Projection,G6A_U05_P07F05_APPLIED_MODIFIER_IDS as MODIFIERS,G6A_U05_P07F05_INCLUDED_RELATIONS as RELATIONS,G6A_U05_P07F05_KP_ID as KP,G6A_U05_P07F05_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G6A_U05_P07F05_PATTERN_SPECS as SPECS,G6A_U05_P07F05_PREDECESSOR_KP_IDS as PREDECESSORS,G6A_U05_P07F05_PROTECTED_FUTURE_KP_IDS as PROTECTED,G6A_U05_P07F05_REQUIRED_CAPABILITY_IDS as REQUIRED,G6A_U05_P07F05_SOURCE_ID as SRC,G6A_U05_P07F05_SPEC_IDS as SPEC_IDS} from "../../site/modules/curriculum/registry/g6a-u05-simplify-ratio-selector-projection-p07f05.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p07f05.js";
import {buildG6AU05P07F05Question,generateG6AU05P07F05Questions,validateG6AU05P07F05Answer,validateG6AU05P07F05Question} from "../../site/modules/curriculum/batch-a/g6a-u05-simplify-ratio-runtime-p07f05.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p07f/q005-g6a-u05-simplify-ratio-implementation.json");
const preflight=read("data/curriculum/full-product/p07f/q005-g6a-u05-simplify-ratio-source-authority-preflight.json");
const impact=read("data/project/change-impact/P07F_W7_Q005.impact.json");
const validation=read("data/project/validation-plans/P07F_W7_Q005.validation.json");
const request=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"numeric",questionCount:20,generationSeed:"p07f05-simplify-ratio",...extra});

test("W7 Q005 implementation preserves frozen queue, Q004 D0, source-evidence mismatch transparency, and exact prerequisites",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(impl.preflight.prNumber,1023);
  assert.equal(impl.preflight.mergeSha,"9cd645c18f434bc1f6765eb4ae082623e41f380c");
  assert.equal(impl.predecessorD0.q004Status,"PASS_E6_D0_COMPLETE");
  assert.equal(impl.queueAuthority.queuePosition,5);
  assert.equal(impl.queueAuthority.queueSliceCount,26);
  assert.equal(impl.queueAuthority.sliceId,"p07e_q005_r8_g6a_u05_6a05_profile_factor_multiple_c1");
  assert.equal(impl.queueAuthority.previousSliceId,"p07e_q004_r7_g6a_u06_6a06_profile_geometry_formula_c1");
  assert.deepEqual(impl.queueAuthority.knowledgePointIds,[KP]);
  assert.equal(impl.queueAuthority.runtimeProfileId,"profile_factor_multiple");
  assert.deepEqual(impl.queueAuthority.appliedModifierIds,MODIFIERS);
  assert.deepEqual(impl.queueAuthority.requiredW7CapabilityIds,[]);
  assert.equal(impl.sourceAuthority.semanticAuthority,"R02_PAGE4_PRIMARY_CURRENT_VISUAL_PAGE1_SIMPLIFICATION_CONTEXT_WITHOUT_SILENT_RECONCILIATION");
  assert.equal(impl.sourceAuthority.evidenceLocalizationMismatchPreserved,true);
  assert.deepEqual(impl.prerequisiteContract.requiredKnowledgePointIds,["kp_g5a_u02_greatest_common_factor","kp_g6a_u05_equivalent_ratio"]);
});

test("W7 Q005 FormalMapping and three PatternSpecs own positive-integer coprime simplification only",()=>{
  const a=auditG6AU05P07F05Projection();assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1});
  assert.deepEqual(REQUIRED,preflight.runtimeCapabilityAuthority.executableR04Mapping.requiredRuntimeCapabilityIds);
  assert.deepEqual(MODIFIERS,preflight.runtimeCapabilityAuthority.executableR04Mapping.appliedModifierIds);
  assert.deepEqual(OPTIONAL,[]);
  assert.deepEqual(impl.productContract.includedRelations,RELATIONS);
  assert.ok(SPECS.every(x=>x.semanticCore==="SIMPLIFY_RATIO_TO_COPRIME_POSITIVE_INTEGER_TERMS"&&x.positiveIntegerInputRatioOnly&&x.greatestCommonFactorPrerequisiteRequired&&x.equivalentRatioPrerequisiteRequired&&x.commonDivisorMustDivideBothTermsExactly&&x.directGcdDivisionAllowed&&x.repeatedCommonFactorDivisionAllowed&&x.outputTermsMustBePositiveIntegers&&x.outputTermsMustBeCoprime&&x.finalGcdMustEqualOne&&x.ratioValueInvariantRequired&&x.antecedentConsequentOrderRequired&&!x.q001RatioNotationReownershipAllowed&&!x.q002RatioValueReownershipAllowed&&!x.q003EquivalentRatioReownershipAllowed&&!x.decimalRatioInputNormalizationAllowed&&!x.fractionRatioInputNormalizationAllowed&&!x.ratioPartitionApplicationAllowed&&!x.proportionCrossMultiplicationInternalAllowed&&!x.proportionCrossMultiplicationTeachingAllowed&&!x.percentConversionAllowed&&!x.applicationContextAllowed&&!x.sameUnitMixedAllowed&&!x.crossUnitMixedAllowed));
});

test("W7 Q005 promotes only simplest-integer-ratio KP while preserving Q001-Q003 and hiding Q009",()=>{
  const before=preSelector.listBatchAKnowledgePointAvailabilityBySource(SRC);assert.ok(before);
  assert.ok(PREDECESSORS.every(id=>(before.visibleKnowledgePointIds??[]).includes(id)));
  assert.equal((before.visibleKnowledgePointIds??[]).includes(KP),false);
  assert.ok((before.hiddenPendingKnowledgePointIds??[]).includes(KP));assert.ok((before.notSelectableKnowledgePointIds??[]).includes(KP));
  const a=selector.auditP07F05PublicSelectorComposition();assert.equal(a.ok,true,a.errors.join(","));
  const after=selector.listBatchAKnowledgePointAvailabilityBySource(SRC),ids=selector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  assert.ok(PREDECESSORS.every(id=>ids.includes(id)));assert.ok(ids.includes(KP));assert.ok(selector.getVisibleBatchAKnowledgePoint(KP));
  assert.equal(after.hiddenPendingKnowledgePointIds.includes(KP),false);assert.equal(after.notSelectableKnowledgePointIds.includes(KP),false);
  assert.ok(PROTECTED.every(id=>after.hiddenPendingKnowledgePointIds.includes(id)&&after.notSelectableKnowledgePointIds.includes(id)&&!ids.includes(id)));
  assert.equal(after.sameSourceCandidateSetComplete,false);assert.equal(after.sameUnitMixedAllowed,false);assert.equal(after.w7FrozenQueueComplete,false);
  assert.deepEqual(selector.resolveVisiblePatternSpecIdsForKnowledgePoint(KP,"numeric"),SPEC_IDS);
});

test("W7 Q005 capability binding preserves factor-multiple execution envelope and strict ownership",()=>{
  const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join(","));
  const b=resolvePublicUiCapabilityBinding(request());
  assert.equal(b.blocked,false);assert.equal(b.questionType,"numeric");assert.equal(b.questionCount.max,240);
  assert.deepEqual(b.requiredCapabilityIds,REQUIRED);assert.deepEqual(b.optionalCapabilityIds,OPTIONAL);assert.deepEqual(b.appliedRuntimeModifierIds,MODIFIERS);
  assert.equal(b.frozenRuntimeProfile,"profile_factor_multiple");
  assert.equal(b.greatestCommonFactorPrerequisiteRequired,true);assert.equal(b.q003EquivalentRatioPrerequisiteRequired,true);assert.equal(b.simplifyRatioOwned,true);
  assert.equal(b.positiveIntegerInputRatioOnly,true);assert.equal(b.commonDivisorExactOnBothTermsRequired,true);assert.equal(b.directGcdDivisionAllowed,true);assert.equal(b.repeatedCommonFactorDivisionAllowed,true);assert.equal(b.finalGcdOneRequired,true);assert.equal(b.outputCoprimeRequired,true);assert.equal(b.ratioValueInvariantRequired,true);
  assert.equal(b.q001RatioNotationReownershipAllowed,false);assert.equal(b.q002RatioValueReownershipAllowed,false);assert.equal(b.q003EquivalentRatioReownershipAllowed,false);assert.equal(b.decimalRatioInputNormalizationAllowed,false);assert.equal(b.fractionRatioInputNormalizationAllowed,false);assert.equal(b.ratioPartitionApplicationReownershipAllowed,false);assert.equal(b.proportionCrossMultiplicationInternalAllowed,false);assert.equal(b.proportionCrossMultiplicationTeachingAllowed,false);assert.equal(b.percentConversionReownershipAllowed,false);assert.equal(b.applicationContextAllowed,false);assert.equal(b.sameUnitMixedAdmission,false);assert.equal(b.crossUnitMixedAdmission,false);
});

for(const patternSpecId of SPEC_IDS)test("W7 Q005 "+patternSpecId+" has 240 deterministic unique validated variants",()=>{
  const a=generateG6AU05P07F05Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
  const b=generateG6AU05P07F05Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){const p=q.patternRepresentation;assert.equal(validateG6AU05P07F05Question(q).ok,true);assert.equal(validateG6AU05P07F05Answer(q,q.answerValue).ok,true);assert.equal(p.inputGcd,p.commonDivisor);assert.equal(p.finalGcd,1);assert.equal(p.outputTermsCoprime,true);assert.equal(p.ratioValueInvariant,true);assert.equal(p.inputA,p.outputA*p.commonDivisor);assert.equal(p.inputB,p.outputB*p.commonDivisor);}
});

test("W7 Q005 validator fails closed on non-coprime output, wrong ratio answer, reversed terms, and forbidden semantic leakage",()=>{
  const q=buildG6AU05P07F05Question({variant:17,patternSpecId:SPEC_IDS[0]});const p=q.patternRepresentation;
  assert.equal(validateG6AU05P07F05Answer(q,q.answerText).ok,true);
  assert.equal(validateG6AU05P07F05Answer(q,p.outputB+":"+p.outputA).ok,false);
  assert.equal(validateG6AU05P07F05Question({...q,patternRepresentation:{...p,outputA:p.outputA*2,outputB:p.outputB*2,finalGcd:2,outputTermsCoprime:false}}).ok,false);
  assert.equal(validateG6AU05P07F05Question({...q,metadata:{...q.metadata,decimalRatioInputNormalizationUsed:true}}).ok,false);
  assert.equal(validateG6AU05P07F05Question({...q,metadata:{...q.metadata,ratioPartitionApplicationReowned:true}}).ok,false);
  assert.equal(validateG6AU05P07F05Question({...q,metadata:{...q.metadata,proportionCrossMultiplicationInternalUsed:true}}).ok,false);
});

test("W7 Q005 aggregate generator worksheet renderer expose all three simplification families and preserve predecessors",()=>{
  const plan=buildBatchABrowserPlan(request({questionCount:12}));assert.equal(plan.sourceId,SRC);assert.equal(plan.questionCountMax,240);assert.deepEqual(plan.patternSpecIds,SPEC_IDS);assert.equal(plan.frozenRuntimeProfile,"profile_factor_multiple");
  const g=generateBatchABrowserQuestions(request({questionCount:12}));assert.equal(g.ok,true,g.errors.join(","));assert.equal(g.questions.length,12);assert.equal(new Set(g.questions.map(q=>q.questionSignature)).size,12);
  assert.deepEqual([...new Set(g.questions.map(q=>q.patternRepresentation.targetKind))].sort(),["DIRECT_GCD_REDUCTION","GIVEN_GCD_REDUCTION","REPEATED_COMMON_FACTOR_REDUCTION"]);
  const w=buildBatchABrowserWorksheetDocument(request({questionCount:9,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:5}}));assert.equal(w.ok,true,w.errors.join(","));assert.equal(w.worksheetDocument.questionCount,9);assert.equal(w.worksheetDocument.answerKeyItems.length,9);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""}),visible=html.replace(/<[^>]*>/g," ");
  assert.match(visible,/化成最簡整數比/);assert.match(visible,/最大公因數/);assert.match(visible,/先同除以/);
  assert.equal(visible.includes("kp_g6a_u05_"),false);assert.equal(visible.includes("ps_g6a_u05_"),false);assert.equal(visible.includes("P07F05"),false);
  for(const id of PREDECESSORS){const predecessor=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[id],questionMode:"numeric",questionCount:6,generationSeed:"p07f05-preserve-"+id});assert.equal(predecessor.ok,true,predecessor.errors.join(","));assert.ok(predecessor.questions.every(q=>q.knowledgePointId===id));}
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[PREDECESSORS[2],KP],questionMode:"numeric",questionCount:4,generationSeed:"mixed-not-admitted"});assert.equal(mixed.ok,false);
});

test("W7 Q005 current browser pointers advance to P07F10 while Q004 Q003 Q002 Q001 and W6 Q020 stay reachable",()=>{
  const selectorText=readFileSync(new URL("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",import.meta.url),"utf8");
  const bindingText=readFileSync(new URL("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",import.meta.url),"utf8");
  const generatorText=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",import.meta.url),"utf8");
  const worksheetText=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",import.meta.url),"utf8");
  assert.match(selectorText,/batch-a-selector-p07f14-extension/);assert.match(bindingText,/public-ui-capability-binding-p07f14/);
  assert.match(generatorText,/requestsP07F10/);assert.match(generatorText,/requestsP07F08/);assert.match(generatorText,/requestsP07F07/);assert.match(generatorText,/requestsP07F06/);assert.match(generatorText,/requestsP07F05/);assert.match(generatorText,/requestsP07F04/);assert.match(generatorText,/requestsP07F03/);assert.match(generatorText,/requestsP07F02/);assert.match(generatorText,/requestsP07F01/);assert.match(generatorText,/requestsP06F20/);
  assert.match(worksheetText,/buildP07F10Worksheet/);assert.match(worksheetText,/buildP07F08Worksheet/);assert.match(worksheetText,/buildP07F07Worksheet/);assert.match(worksheetText,/buildP07F06Worksheet/);assert.match(worksheetText,/buildP07F05Worksheet/);assert.match(worksheetText,/buildP07F04Worksheet/);assert.match(worksheetText,/buildP07F03Worksheet/);assert.match(worksheetText,/buildP07F02Worksheet/);assert.match(worksheetText,/buildP07F01Worksheet/);assert.match(worksheetText,/buildP06F20Worksheet/);
});

test("W7 Q005 validation contract stays SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.equal(validation.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
  assert.equal(impact.scopeGuards.q001Q002Q003ProductMutation,false);assert.equal(impact.scopeGuards.q004ProductMutation,false);assert.equal(impact.scopeGuards.q001Q002Q003Q004CompatibilityTestAndAcceptanceOnlyMutation,true);assert.equal(impact.scopeGuards.q020CurrentPointerCompatibilityTestOnlyMutation,true);assert.equal(impact.scopeGuards.q006OrLaterProductMutation,false);assert.equal(impact.scopeGuards.decimalRatioInputNormalization,false);assert.equal(impact.scopeGuards.fractionRatioInputNormalization,false);
});
