import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as selector from "../../site/modules/curriculum/registry/batch-a-selector-p07f09-extension.js";
import * as preSelector from "../../site/modules/curriculum/registry/batch-a-selector-p07f08-extension.js";
import {auditG6AU05P07F09Projection,G6A_U05_P07F09_APPLIED_MODIFIER_IDS as MODIFIERS,G6A_U05_P07F09_INCLUDED_RELATIONS as RELATIONS,G6A_U05_P07F09_KP_ID as KP,G6A_U05_P07F09_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G6A_U05_P07F09_PATTERN_SPECS as SPECS,G6A_U05_P07F09_PREDECESSOR_KP_IDS as PREDECESSORS,G6A_U05_P07F09_REQUIRED_CAPABILITY_IDS as REQUIRED,G6A_U05_P07F09_SOURCE_ID as SRC,G6A_U05_P07F09_SPEC_IDS as SPEC_IDS} from "../../site/modules/curriculum/registry/g6a-u05-ratio-partition-application-selector-projection-p07f09.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p07f09.js";
import {buildG6AU05P07F09Question,generateG6AU05P07F09Questions,validateG6AU05P07F09Answer,validateG6AU05P07F09Question} from "../../site/modules/curriculum/batch-a/g6a-u05-ratio-partition-application-runtime-p07f09.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p07f/q009-g6a-u05-ratio-partition-application-implementation.json");
const preflight=read("data/curriculum/full-product/p07f/q009-g6a-u05-ratio-partition-application-source-authority-preflight.json");
const impact=read("data/project/change-impact/P07F_W7_Q009.impact.json");
const validation=read("data/project/validation-plans/P07F_W7_Q009.validation.json");
const request=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"numeric",questionCount:20,generationSeed:"p07f09-ratio-partition",...extra});

test("W7 Q009 implementation preserves frozen queue, Q008 D0, source evidence, runtime and exact prerequisites",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");assert.equal(impl.preflight.prNumber,1032);assert.equal(impl.preflight.mergeSha,"3899fcf62832e69d476bc87b7690713553602aa7");
  assert.equal(impl.predecessorD0.q008Status,"PASS_E6_D0_COMPLETE");assert.equal(impl.queueAuthority.queuePosition,9);assert.equal(impl.queueAuthority.queueSliceCount,26);assert.equal(impl.queueAuthority.sliceId,"p07e_q009_r9_g6a_u05_6a05_profile_ratio_percent_c1");assert.deepEqual(impl.queueAuthority.knowledgePointIds,[KP]);
  assert.equal(impl.queueAuthority.runtimeProfileId,"profile_ratio_percent");assert.equal(impl.queueAuthority.classificationRuleId,"rule_ratio_percent");assert.deepEqual(impl.queueAuthority.appliedModifierIds,MODIFIERS);
  assert.equal(impl.sourceAuthority.semanticAuthority,"R02_PAGE1_PRIMARY_CURRENT_VISUAL_PAGE3_DIRECT_RATIO_PARTITION_WITHOUT_SILENT_RELOCATION");assert.deepEqual(impl.sourceAuthority.r02EvidencePages,[1]);assert.deepEqual(impl.sourceAuthority.currentVisualDirectSupportingPages,[3]);assert.equal(impl.sourceAuthority.evidenceLocalizationMismatchPreserved,true);
  assert.deepEqual(impl.prerequisiteContract.requiredKnowledgePointIds,["kp_g5b_u02_fraction_of_quantity","kp_g6a_u05_ratio_value"]);
});

test("W7 Q009 FormalMapping and three PatternSpecs own ratio partition only",()=>{
  const a=auditG6AU05P07F09Projection();assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1});
  assert.deepEqual(REQUIRED,preflight.runtimeCapabilityAuthority.executableR04Mapping.requiredRuntimeCapabilityIds);assert.deepEqual(OPTIONAL,preflight.runtimeCapabilityAuthority.executableR04Mapping.optionalRuntimeCapabilityIds);assert.deepEqual(MODIFIERS,["mod_application_semantics"]);assert.deepEqual(impl.productContract.includedRelations,RELATIONS);
  assert.ok(SPECS.every(x=>x.semanticCore==="PARTITION_TOTAL_BY_GIVEN_RATIO_WITH_SUM_CONSERVATION"&&x.givenTotalRequired&&x.givenOrderedRatioTermsRequired&&x.positiveRatioTermsRequired&&x.totalRatioUnitsRequired&&x.oneRatioUnitRequired&&x.wholeNumberPartOutputsRequired&&x.partSumEqualsTotalRequired&&x.resultingPartRatioMatchesGivenRatioRequired&&x.ratioValuePrerequisiteRequired&&x.fractionOfQuantityPrerequisiteRequired&&!x.q001RatioNotationReownershipAllowed&&!x.q002RatioValueReownershipAllowed&&!x.q003EquivalentRatioReownershipAllowed&&!x.q005SimplifyRatioReownershipAllowed&&!x.ratioDifferenceApplicationAllowed&&!x.unitRateApplicationAllowed&&!x.mixedFractionRatioApplicationAllowed&&!x.proportionCrossMultiplicationTeachingAllowed&&!x.directProportionTableOrGraphAllowed&&!x.percentConversionAllowed&&!x.nonPartitionRateApplicationAllowed&&!x.ratioScaleApplicationAllowed&&!x.sameUnitMixedAllowed&&!x.crossUnitMixedAllowed));
});

test("W7 Q009 promotes final G6A-U05 frozen KP while preserving Q001 Q002 Q003 Q005",()=>{
  const before=preSelector.listBatchAKnowledgePointAvailabilityBySource(SRC);assert.equal((before?.visibleKnowledgePointIds??[]).includes(KP),false);
  const a=selector.auditP07F09PublicSelectorComposition();assert.equal(a.ok,true,a.errors.join(","));
  const after=selector.listBatchAKnowledgePointAvailabilityBySource(SRC),ids=selector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  assert.ok(PREDECESSORS.every(id=>ids.includes(id)));assert.ok(ids.includes(KP));assert.ok(selector.getVisibleBatchAKnowledgePoint(KP));assert.equal(after.hiddenPendingKnowledgePointIds.includes(KP),false);assert.equal(after.notSelectableKnowledgePointIds.includes(KP),false);
  assert.equal(after.sameSourceCandidateSetComplete,true);assert.equal(after.sameUnitMixedAllowed,false);assert.equal(after.w7FrozenQueueComplete,false);assert.deepEqual(selector.resolveVisiblePatternSpecIdsForKnowledgePoint(KP,"numeric"),SPEC_IDS);
});

test("W7 Q009 capability binding matches ratio-percent plus application-semantics envelope",()=>{
  const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join(","));const b=resolvePublicUiCapabilityBinding(request());
  assert.equal(b.blocked,false);assert.equal(b.questionType,"numeric");assert.equal(b.questionCount.max,240);assert.deepEqual(b.requiredCapabilityIds,REQUIRED);assert.deepEqual(b.optionalCapabilityIds,OPTIONAL);assert.deepEqual(b.appliedRuntimeModifierIds,MODIFIERS);
  assert.equal(b.frozenRuntimeProfile,"profile_ratio_percent");assert.equal(b.ratioValuePrerequisiteRequired,true);assert.equal(b.fractionOfQuantityPrerequisiteRequired,true);assert.equal(b.ratioPartitionOwned,true);assert.equal(b.partSumEqualsTotalRequired,true);assert.equal(b.resultingPartRatioMatchesGivenRatioRequired,true);assert.equal(b.applicationContextAllowed,true);
  assert.equal(b.ratioDifferenceApplicationAllowed,false);assert.equal(b.unitRateApplicationAllowed,false);assert.equal(b.mixedFractionRatioApplicationAllowed,false);assert.equal(b.proportionCrossMultiplicationTeachingAllowed,false);assert.equal(b.percentConversionAllowed,false);assert.equal(b.ratioScaleApplicationAllowed,false);assert.equal(b.sameUnitMixedAdmission,false);assert.equal(b.crossUnitMixedAdmission,false);
});

for(const patternSpecId of SPEC_IDS)test("W7 Q009 "+patternSpecId+" has 240 deterministic unique sum-conserving variants",()=>{
  const a=generateG6AU05P07F09Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"}),b=generateG6AU05P07F09Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){const p=q.patternRepresentation;assert.equal(validateG6AU05P07F09Question(q).ok,true);assert.equal(validateG6AU05P07F09Answer(q,q.answerText).ok,true);assert.equal(p.partSumEqualsTotal,true);assert.equal(p.resultingPartRatioMatchesGivenRatio,true);assert.equal(p.partA+p.partB,p.total);assert.equal(p.partA*p.ratioB,p.partB*p.ratioA);}
});

test("W7 Q009 validator fails closed on answer, conservation, ratio and scope damage",()=>{
  const q=buildG6AU05P07F09Question({variant:17,patternSpecId:"ps_g6a_u05_ratio_partition_direct_parts"});assert.equal(validateG6AU05P07F09Answer(q,q.answerText).ok,true);assert.equal(validateG6AU05P07F09Answer(q,"1，1").ok,false);
  const p=q.patternRepresentation;assert.equal(validateG6AU05P07F09Question({...q,patternRepresentation:{...p,partSumEqualsTotal:false}}).ok,false);
  assert.equal(validateG6AU05P07F09Question({...q,metadata:{...q.metadata,ratioDifferenceApplicationUsed:true}}).ok,false);assert.equal(validateG6AU05P07F09Question({...q,metadata:{...q.metadata,percentConversionReowned:true}}).ok,false);
});

test("W7 Q009 aggregate generator worksheet renderer cover partition families and preserve mixed fail-closed",()=>{
  const plan=buildBatchABrowserPlan(request({questionCount:12}));assert.equal(plan.sourceId,SRC);assert.equal(plan.questionCountMax,240);assert.deepEqual(plan.patternSpecIds,SPEC_IDS);assert.equal(plan.frozenRuntimeProfile,"profile_ratio_percent");
  const g=generateBatchABrowserQuestions(request({questionCount:12}));assert.equal(g.ok,true,g.errors.join(","));assert.equal(g.questions.length,12);assert.equal(new Set(g.questions.map(q=>q.questionSignature)).size,12);assert.deepEqual([...new Set(g.questions.map(q=>q.patternRepresentation.targetKind))].sort(),["CONTEXT_PARTS","DIRECT_PARTS","TARGET_PART"]);
  const w=buildBatchABrowserWorksheetDocument(request({questionCount:12,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:5}}));assert.equal(w.ok,true,w.errors.join(","));assert.equal(w.worksheetDocument.questionCount,12);assert.equal(w.worksheetDocument.answerKeyItems.length,12);assert.ok(w.worksheetDocument.summary.applicationQuestionCount>0);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""}),visible=html.replace(/<[^>]*>/g," ");assert.match(visible,/按比分配/);assert.match(visible,/總量/);
  for(const term of ["相差","每分鐘","交叉相乘","百分率","比例尺"])assert.equal(visible.includes(term),false,term);assert.equal(visible.includes("kp_g6a_u05_"),false);assert.equal(visible.includes("ps_g6a_u05_"),false);assert.equal(visible.includes("P07F09"),false);
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[KP,"kp_g6a_u05_ratio_value"],questionMode:"numeric",questionCount:4,generationSeed:"mixed-not-admitted"});assert.equal(mixed.ok,false);
});

test("W7 Q010 current browser pointers advance to P07F10 while Q008 through Q001 and W6 Q020 stay reachable",()=>{
  const selectorText=readFileSync(new URL("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",import.meta.url),"utf8"),bindingText=readFileSync(new URL("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",import.meta.url),"utf8"),generatorText=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",import.meta.url),"utf8"),worksheetText=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",import.meta.url),"utf8");
  assert.match(selectorText,/batch-a-selector-p07f14-extension/);assert.match(bindingText,/public-ui-capability-binding-p07f14/);
  for(const id of ["10","09","08","07","06","05","04","03","02","01"])assert.match(generatorText,new RegExp("requestsP07F"+id));assert.match(generatorText,/requestsP06F20/);
  for(const id of ["09","08","07","06","05","04","03","02","01"])assert.match(worksheetText,new RegExp("buildP07F"+id+"Worksheet"));assert.match(worksheetText,/buildP06F20Worksheet/);
});

test("W7 Q009 validation contract stays SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.equal(validation.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);assert.equal(impact.scopeGuards.q008ProductMutation,false);assert.equal(impact.scopeGuards.q010OrLaterProductMutation,false);
});
