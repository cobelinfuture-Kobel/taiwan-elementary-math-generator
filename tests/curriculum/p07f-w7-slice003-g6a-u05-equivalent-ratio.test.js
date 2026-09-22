import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as selector from "../../site/modules/curriculum/registry/batch-a-selector-p07f03-extension.js";
import * as preSelector from "../../site/modules/curriculum/registry/batch-a-selector-p07f02-extension.js";
import {auditG6AU05P07F03Projection,G6A_U05_P07F03_APPLIED_MODIFIER_IDS as MODIFIERS,G6A_U05_P07F03_INCLUDED_RELATIONS as RELATIONS,G6A_U05_P07F03_KP_ID as KP,G6A_U05_P07F03_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G6A_U05_P07F03_PATTERN_SPECS as SPECS,G6A_U05_P07F03_PREDECESSOR_KP_IDS as PREDECESSORS,G6A_U05_P07F03_PROTECTED_FUTURE_KP_IDS as PROTECTED,G6A_U05_P07F03_REQUIRED_CAPABILITY_IDS as REQUIRED,G6A_U05_P07F03_SOURCE_ID as SRC,G6A_U05_P07F03_SPEC_IDS as SPEC_IDS} from "../../site/modules/curriculum/registry/g6a-u05-equivalent-ratio-selector-projection-p07f03.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p07f03.js";
import {buildG6AU05P07F03Question,generateG6AU05P07F03Questions,validateG6AU05P07F03Answer,validateG6AU05P07F03Question} from "../../site/modules/curriculum/batch-a/g6a-u05-equivalent-ratio-runtime-p07f03.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p07f/q003-g6a-u05-equivalent-ratio-implementation.json");
const preflight=read("data/curriculum/full-product/p07f/q003-g6a-u05-equivalent-ratio-source-authority-preflight.json");
const impact=read("data/project/change-impact/P07F_W7_Q003.impact.json");
const validation=read("data/project/validation-plans/P07F_W7_Q003.validation.json");
const request=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"numeric",questionCount:20,generationSeed:"p07f03-equivalent-ratio",...extra});

test("W7 Q003 implementation preserves frozen queue, predecessor D0, and page-3 source boundary",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(impl.preflight.prNumber,1019);
  assert.equal(impl.preflight.mergeSha,"1c27eb3bde10f65f785f00d9eddc47ed936b9c08");
  assert.equal(impl.predecessorD0.q002Status,"PASS_E6_D0_COMPLETE");
  assert.equal(impl.queueAuthority.queuePosition,3);
  assert.equal(impl.queueAuthority.queueSliceCount,26);
  assert.equal(impl.queueAuthority.sliceId,"p07e_q003_r7_g6a_u05_6a05_profile_integer_operations_c1");
  assert.equal(impl.queueAuthority.previousSliceId,"p07e_q002_r6_g6a_u05_6a05_profile_ratio_percent_c1");
  assert.deepEqual(impl.queueAuthority.knowledgePointIds,[KP]);
  assert.equal(impl.queueAuthority.runtimeProfileId,"profile_integer_operations");
  assert.deepEqual(impl.queueAuthority.appliedModifierIds,MODIFIERS);
  assert.deepEqual(impl.queueAuthority.requiredW7CapabilityIds,[]);
  assert.deepEqual(impl.sourceAuthority.targetEvidencePages,[3]);
});

test("W7 Q003 FormalMapping and three PatternSpecs own equivalent-ratio common-scale semantics only",()=>{
  const a=auditG6AU05P07F03Projection();assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1});
  assert.deepEqual(REQUIRED,preflight.runtimeCapabilityAuthority.executableR04Mapping.requiredRuntimeCapabilityIds);
  assert.deepEqual(MODIFIERS,preflight.runtimeCapabilityAuthority.executableR04Mapping.appliedModifierIds);
  assert.deepEqual(OPTIONAL,[]);
  assert.deepEqual(impl.productContract.includedRelations,RELATIONS);
  assert.ok(SPECS.every(x=>x.semanticCore==="EQUIVALENT_RATIO_PRESERVES_RATIO_VALUE_UNDER_COMMON_NONZERO_SCALE_FACTOR"&&x.commonScaleFactorBothTermsRequired&&x.commonScaleFactorNonzeroRequired&&x.ratioValueInvariantRequired&&x.antecedentConsequentOrderRequired&&x.crossProductValidatorInternalAllowed&&!x.crossMultiplicationTeachingAllowed&&!x.q001RatioNotationReownershipAllowed&&!x.q002RatioValueReownershipAllowed&&!x.simplestIntegerRatioRequired&&!x.simplifyToCoprimeAllowed&&!x.ratioPartitionApplicationAllowed&&!x.percentConversionAllowed&&!x.applicationContextAllowed&&!x.genericIntegerOperationsDrillAllowed&&!x.sameUnitMixedAllowed&&!x.crossUnitMixedAllowed));
});

test("W7 Q003 promotes only equivalent-ratio KP and keeps Q005 Q009 hidden",()=>{
  const before=preSelector.listBatchAKnowledgePointAvailabilityBySource(SRC);assert.ok(before);
  assert.ok(PREDECESSORS.every(id=>(before.visibleKnowledgePointIds??[]).includes(id)));
  assert.equal((before.visibleKnowledgePointIds??[]).includes(KP),false);
  assert.ok((before.hiddenPendingKnowledgePointIds??[]).includes(KP));assert.ok((before.notSelectableKnowledgePointIds??[]).includes(KP));
  const a=selector.auditP07F03PublicSelectorComposition();assert.equal(a.ok,true,a.errors.join(","));
  const after=selector.listBatchAKnowledgePointAvailabilityBySource(SRC),ids=selector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  assert.ok(PREDECESSORS.every(id=>ids.includes(id)));assert.ok(ids.includes(KP));assert.ok(selector.getVisibleBatchAKnowledgePoint(KP));
  assert.equal(after.hiddenPendingKnowledgePointIds.includes(KP),false);assert.equal(after.notSelectableKnowledgePointIds.includes(KP),false);
  assert.ok(PROTECTED.every(id=>after.hiddenPendingKnowledgePointIds.includes(id)&&after.notSelectableKnowledgePointIds.includes(id)&&!ids.includes(id)));
  assert.equal(after.sameSourceCandidateSetComplete,false);assert.equal(after.sameUnitMixedAllowed,false);assert.equal(after.w7FrozenQueueComplete,false);
  assert.deepEqual(selector.resolveVisiblePatternSpecIdsForKnowledgePoint(KP,"numeric"),SPEC_IDS);
});

test("W7 Q003 capability binding preserves integer-operations execution envelope without semantic takeover",()=>{
  const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join(","));
  const b=resolvePublicUiCapabilityBinding(request());
  assert.equal(b.blocked,false);assert.equal(b.questionType,"numeric");assert.equal(b.questionCount.max,240);
  assert.deepEqual(b.requiredCapabilityIds,REQUIRED);assert.deepEqual(b.optionalCapabilityIds,OPTIONAL);assert.deepEqual(b.appliedRuntimeModifierIds,MODIFIERS);
  assert.equal(b.frozenRuntimeProfile,"profile_integer_operations");assert.equal(b.semanticProfileInterpretation,"EXECUTION_ENVELOPE_ONLY_NOT_KNOWLEDGE_POINT_SEMANTIC_OWNER");
  assert.equal(b.q001OrderedRolePrerequisiteRequired,true);assert.equal(b.q002RatioValuePrerequisiteRequired,true);assert.equal(b.equivalentRatioOwned,true);assert.equal(b.commonScaleFactorBothTermsRequired,true);assert.equal(b.commonScaleFactorNonzeroRequired,true);assert.equal(b.ratioValueInvariantRequired,true);assert.equal(b.reverseExactDivisionAllowed,true);
  assert.equal(b.crossProductValidatorInternalAllowed,true);assert.equal(b.crossMultiplicationTeachingAllowed,false);assert.equal(b.q001RatioNotationReownershipAllowed,false);assert.equal(b.q002RatioValueReownershipAllowed,false);assert.equal(b.simplestIntegerRatioReownershipAllowed,false);assert.equal(b.ratioPartitionApplicationReownershipAllowed,false);assert.equal(b.percentConversionReownershipAllowed,false);assert.equal(b.applicationContextAllowed,false);assert.equal(b.genericIntegerOperationsDrillAllowed,false);assert.equal(b.sameUnitMixedAdmission,false);assert.equal(b.crossUnitMixedAdmission,false);
});

for(const patternSpecId of SPEC_IDS)test("W7 Q003 "+patternSpecId+" has 240 deterministic unique validated variants",()=>{
  const a=generateG6AU05P07F03Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
  const b=generateG6AU05P07F03Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){const p=q.patternRepresentation;assert.equal(validateG6AU05P07F03Question(q).ok,true);assert.equal(validateG6AU05P07F03Answer(q,q.answerValue).ok,true);assert.equal(p.scaledA,p.a*p.k);assert.equal(p.scaledB,p.b*p.k);assert.equal(p.commonScaleFactorNonzero,true);assert.equal(p.reverseDivisionExact,true);assert.equal(p.ratioValueInvariant,true);assert.equal(p.crossProductEqualityInternal,true);}
});

test("W7 Q003 validator fails closed on unequal scale, wrong reverse answer, cross-multiplication teaching, or later-skill leakage",()=>{
  const forward=buildG6AU05P07F03Question({variant:17,patternSpecId:SPEC_IDS[0]});const p=forward.patternRepresentation;
  assert.equal(validateG6AU05P07F03Answer(forward,p.scaledA+":"+p.scaledB).ok,true);
  assert.equal(validateG6AU05P07F03Answer(forward,(p.scaledA+1)+":"+p.scaledB).ok,false);
  assert.equal(validateG6AU05P07F03Question({...forward,patternRepresentation:{...p,scaledA:p.scaledA+1,commonScaleFactorAppliedToBothTerms:false,ratioValueInvariant:false,crossProductEqualityInternal:false}}).ok,false);
  const reverse=buildG6AU05P07F03Question({variant:31,patternSpecId:SPEC_IDS[1]});assert.equal(validateG6AU05P07F03Answer(reverse,reverse.patternRepresentation.baseRatio).ok,true);
  assert.equal(validateG6AU05P07F03Question({...reverse,metadata:{...reverse.metadata,crossMultiplicationTaught:true}}).ok,false);
  assert.equal(validateG6AU05P07F03Question({...reverse,metadata:{...reverse.metadata,simplestIntegerRatioReowned:true}}).ok,false);
  assert.equal(validateG6AU05P07F03Question({...reverse,metadata:{...reverse.metadata,genericIntegerOperationsDrillUsed:true}}).ok,false);
});

test("W7 Q003 aggregate generator worksheet renderer expose forward reverse missing-term families and preserve Q001 Q002",()=>{
  const plan=buildBatchABrowserPlan(request({questionCount:12}));assert.equal(plan.sourceId,SRC);assert.equal(plan.questionCountMax,240);assert.deepEqual(plan.patternSpecIds,SPEC_IDS);assert.equal(plan.frozenRuntimeProfile,"profile_integer_operations");
  const g=generateBatchABrowserQuestions(request({questionCount:12}));assert.equal(g.ok,true,g.errors.join(","));assert.equal(g.questions.length,12);assert.equal(new Set(g.questions.map(q=>q.questionSignature)).size,12);
  assert.deepEqual([...new Set(g.questions.map(q=>q.patternRepresentation.targetKind))].sort(),["FORWARD_SCALE","MISSING_TERM","REVERSE_SCALE"]);
  const w=buildBatchABrowserWorksheetDocument(request({questionCount:9,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:5}}));assert.equal(w.ok,true,w.errors.join(","));assert.equal(w.worksheetDocument.questionCount,9);assert.equal(w.worksheetDocument.answerKeyItems.length,9);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""}),visible=html.replace(/<[^>]*>/g," ");
  assert.match(visible,/同乘/);assert.match(visible,/同除以/);assert.match(visible,/□/);
  assert.equal(visible.includes("kp_g6a_u05_"),false);assert.equal(visible.includes("ps_g6a_u05_"),false);assert.equal(visible.includes("P07F03"),false);
  for(const id of PREDECESSORS){const predecessor=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[id],questionMode:"numeric",questionCount:6,generationSeed:"p07f03-preserve-"+id});assert.equal(predecessor.ok,true,predecessor.errors.join(","));assert.ok(predecessor.questions.every(q=>q.knowledgePointId===id));}
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[PREDECESSORS[1],KP],questionMode:"numeric",questionCount:4,generationSeed:"mixed-not-admitted"});assert.equal(mixed.ok,false);
});

test("W7 Q003 remains reachable after current browser pointers advance to P07F09",()=>{
  const selectorText=readFileSync(new URL("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",import.meta.url),"utf8");
  const bindingText=readFileSync(new URL("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",import.meta.url),"utf8");
  const generatorText=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",import.meta.url),"utf8");
  const worksheetText=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",import.meta.url),"utf8");
  assert.match(selectorText,/batch-a-selector-p07f09-extension/);assert.match(bindingText,/public-ui-capability-binding-p07f09/);
  assert.match(generatorText,/requestsP07F09/);assert.match(generatorText,/requestsP07F08/);assert.match(generatorText,/requestsP07F07/);assert.match(generatorText,/requestsP07F06/);assert.match(generatorText,/requestsP07F05/);assert.match(generatorText,/requestsP07F04/);assert.match(generatorText,/requestsP07F03/);assert.match(generatorText,/requestsP07F02/);assert.match(generatorText,/requestsP07F01/);assert.match(generatorText,/requestsP06F20/);
  assert.match(worksheetText,/buildP07F09Worksheet/);assert.match(worksheetText,/buildP07F08Worksheet/);assert.match(worksheetText,/buildP07F07Worksheet/);assert.match(worksheetText,/buildP07F06Worksheet/);assert.match(worksheetText,/buildP07F05Worksheet/);assert.match(worksheetText,/buildP07F04Worksheet/);assert.match(worksheetText,/buildP07F03Worksheet/);assert.match(worksheetText,/buildP07F02Worksheet/);assert.match(worksheetText,/buildP07F01Worksheet/);assert.match(worksheetText,/buildP06F20Worksheet/);
});

test("W7 Q003 validation contract stays SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.equal(validation.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
  assert.equal(impact.scopeGuards.q001ProductMutation,false);assert.equal(impact.scopeGuards.q002ProductMutation,false);assert.equal(impact.scopeGuards.q001Q002CompatibilityTestAndAcceptanceOnlyMutation,true);assert.equal(impact.scopeGuards.q020CurrentPointerCompatibilityTestOnlyMutation,true);assert.equal(impact.scopeGuards.q004OrLaterProductMutation,false);assert.equal(impact.scopeGuards.genericIntegerOperationsDrill,false);
});
