import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as selector from "../../site/modules/curriculum/registry/batch-a-selector-p07f08-extension.js";
import * as preSelector from "../../site/modules/curriculum/registry/batch-a-selector-p07f07-extension.js";
import {auditG5BU08P07F08Projection,G5B_U08_P07F08_APPLIED_MODIFIER_IDS as MODIFIERS,G5B_U08_P07F08_INCLUDED_RELATIONS as RELATIONS,G5B_U08_P07F08_KP_ID as KP,G5B_U08_P07F08_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G5B_U08_P07F08_PATTERN_SPECS as SPECS,G5B_U08_P07F08_PROTECTED_FUTURE_KP_IDS as PROTECTED,G5B_U08_P07F08_QUEUE_REQUIRED_CAPABILITY_IDS as W7CAPS,G5B_U08_P07F08_REQUIRED_CAPABILITY_IDS as REQUIRED,G5B_U08_P07F08_SOURCE_ID as SRC,G5B_U08_P07F08_SPEC_IDS as SPEC_IDS} from "../../site/modules/curriculum/registry/g5b-u08-ratio-fraction-decimal-percent-conversion-selector-projection-p07f08.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p07f08.js";
import {buildG5BU08P07F08Question,generateG5BU08P07F08Questions,validateG5BU08P07F08Answer,validateG5BU08P07F08Question} from "../../site/modules/curriculum/batch-a/g5b-u08-ratio-fraction-decimal-percent-conversion-runtime-p07f08.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {listBatchASourceUnits,getBatchASourceUnit,isBatchASourceId} from "../../site/modules/curriculum/batch-a/source-units.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p07f/q008-g5b-u08-ratio-fraction-decimal-percent-conversion-implementation.json");
const preflight=read("data/curriculum/full-product/p07f/q008-g5b-u08-ratio-fraction-decimal-percent-conversion-source-authority-preflight.json");
const impact=read("data/project/change-impact/P07F_W7_Q008.impact.json");
const validation=read("data/project/validation-plans/P07F_W7_Q008.validation.json");
const request=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"numeric",questionCount:20,generationSeed:"p07f08-ratio-conversion",...extra});

test("W7 Q008 implementation preserves frozen queue, Q007 D0, direct source evidence, runtime and exact prerequisites",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");assert.equal(impl.preflight.prNumber,1030);assert.equal(impl.preflight.mergeSha,"6f306aa8f361599fc6618bec4fcab7a6c248e58c");
  assert.equal(impl.predecessorD0.q007Status,"PASS_E6_D0_COMPLETE");assert.equal(impl.queueAuthority.queuePosition,8);assert.equal(impl.queueAuthority.queueSliceCount,26);
  assert.equal(impl.queueAuthority.sliceId,"p07e_q008_r9_g5b_u08_5b08_profile_ratio_percent_c1");assert.deepEqual(impl.queueAuthority.knowledgePointIds,[KP]);
  assert.equal(impl.queueAuthority.runtimeProfileId,"profile_ratio_percent");assert.deepEqual(impl.queueAuthority.appliedModifierIds,MODIFIERS);assert.deepEqual(impl.queueAuthority.requiredW7CapabilityIds,W7CAPS);
  assert.equal(impl.sourceAuthority.semanticAuthority,"R02_REVIEWED_CANDIDATE_PLUS_CURRENT_DIRECT_VISUAL_FRACTION_DECIMAL_PERCENT_EQUIVALENCE_EVIDENCE");
  assert.equal(impl.sourceAuthority.currentVisualSupportLevel,"DIRECT_LITERAL_FRACTION_DECIMAL_PERCENT_INTERCONVERSION");
  assert.deepEqual(impl.prerequisiteContract.requiredKnowledgePointIds,["kp_g6a_u05_ratio_value","kp_g6b_u01_decimal_fraction_conversion"]);
});

test("W7 Q008 FormalMapping and six PatternSpecs own representation equivalence only",()=>{
  const a=auditG5BU08P07F08Projection();assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:6,formalMappings:1});
  assert.deepEqual(REQUIRED,preflight.runtimeCapabilityAuthority.executableR04Mapping.requiredRuntimeCapabilityIds);assert.deepEqual(OPTIONAL,[]);assert.deepEqual(MODIFIERS,[]);assert.deepEqual(impl.productContract.includedRelations,RELATIONS);
  assert.ok(SPECS.every(x=>x.semanticCore==="FRACTION_DECIMAL_PERCENT_REPRESENT_THE_SAME_RATIO"&&x.ratioValuePrerequisiteRequired&&x.decimalFractionConversionPrerequisiteRequired&&x.fractionRepresentationRequired&&x.decimalRepresentationRequired&&x.percentRepresentationRequired&&x.representationValueEquivalenceRequired&&x.percentMayExceed100&&x.percentIdentityOnePercentEqualsOneOverHundred&&x.simplifyFractionOutputWhenFractionRequested&&!x.findPercentageRateFromTwoQuantitiesAllowed&&!x.percentageOfQuantityAllowed&&!x.findBaseQuantityAllowed&&!x.discountIncreaseApplicationAllowed&&!x.roleBasedBaseComparisonQuantityTeachingAllowed&&!x.applicationContextAllowed&&!x.sameUnitMixedAllowed&&!x.crossUnitMixedAllowed));
});

test("W7 Q008 registers G5B-U08 and promotes only conversion KP while protecting Q013/Q016 siblings",()=>{
  assert.equal(isBatchASourceId(SRC),true);const sourceUnit=getBatchASourceUnit(SRC);assert.equal(sourceUnit.unitCode,"5B-U08");assert.equal(sourceUnit.domain,"ratio_percent");
  assert.ok(listBatchASourceUnits({includeW7Slice008:true}).some(x=>x.sourceId===SRC));
  const before=preSelector.listBatchAKnowledgePointAvailabilityBySource(SRC);assert.equal((before?.visibleKnowledgePointIds??[]).includes(KP),false);
  const a=selector.auditP07F08PublicSelectorComposition();assert.equal(a.ok,true,a.errors.join(","));
  const after=selector.listBatchAKnowledgePointAvailabilityBySource(SRC),ids=selector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  assert.ok(ids.includes(KP));assert.ok(selector.getVisibleBatchAKnowledgePoint(KP));assert.equal(after.hiddenPendingKnowledgePointIds.includes(KP),false);assert.equal(after.notSelectableKnowledgePointIds.includes(KP),false);
  assert.ok(PROTECTED.every(id=>after.hiddenPendingKnowledgePointIds.includes(id)&&after.notSelectableKnowledgePointIds.includes(id)&&!ids.includes(id)));
  assert.equal(after.sameSourceCandidateSetComplete,false);assert.equal(after.sameUnitMixedAllowed,false);assert.equal(after.w7FrozenQueueComplete,false);
  assert.deepEqual(selector.resolveVisiblePatternSpecIdsForKnowledgePoint(KP,"numeric"),SPEC_IDS);
});

test("W7 Q008 capability binding preserves exact ratio-percent runtime envelope without application ownership",()=>{
  const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join(","));const b=resolvePublicUiCapabilityBinding(request());
  assert.equal(b.blocked,false);assert.equal(b.questionType,"numeric");assert.equal(b.questionCount.max,240);assert.deepEqual(b.requiredCapabilityIds,REQUIRED);assert.deepEqual(b.optionalCapabilityIds,OPTIONAL);assert.deepEqual(b.appliedRuntimeModifierIds,[]);
  assert.equal(b.frozenRuntimeProfile,"profile_ratio_percent");assert.equal(b.ratioValuePrerequisiteRequired,true);assert.equal(b.decimalFractionConversionPrerequisiteRequired,true);assert.equal(b.representationEquivalenceOwned,true);assert.equal(b.percentMayExceed100,true);assert.equal(b.percentIdentityOnePercentEqualsOneOverHundred,true);assert.equal(b.simplifiedFractionOutputRequired,true);
  assert.equal(b.findPercentageRateFromTwoQuantitiesAllowed,false);assert.equal(b.percentageOfQuantityAllowed,false);assert.equal(b.findBaseQuantityAllowed,false);assert.equal(b.discountIncreaseApplicationAllowed,false);assert.equal(b.roleBasedBaseComparisonQuantityTeachingAllowed,false);assert.equal(b.applicationContextAllowed,false);assert.equal(b.sameUnitMixedAdmission,false);assert.equal(b.crossUnitMixedAdmission,false);
});

for(const patternSpecId of SPEC_IDS)test("W7 Q008 "+patternSpecId+" has 240 deterministic unique exact-equivalence variants",()=>{
  const a=generateG5BU08P07F08Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"}),b=generateG5BU08P07F08Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  assert.ok(a.questions.some(q=>q.patternRepresentation.percentAbove100));
  for(const q of a.questions){const p=q.patternRepresentation;assert.equal(validateG5BU08P07F08Question(q).ok,true);assert.equal(validateG5BU08P07F08Answer(q,q.answerText).ok,true);assert.equal(p.percentIdentityBase100Verified,true);assert.equal(p.representationValueEquivalenceVerified,true);assert.ok(Math.abs(p.fractionValue-p.decimalValue)<1e-12);assert.ok(Math.abs(p.decimalValue-p.percentValue/100)<1e-12);}
});

test("W7 Q008 validator accepts exact target representations and fails closed on equivalence damage or sibling leakage",()=>{
  const qf=buildG5BU08P07F08Question({variant:7,patternSpecId:"ps_g5b_u08_decimal_to_fraction"});assert.equal(validateG5BU08P07F08Answer(qf,qf.answerText).ok,true);assert.equal(validateG5BU08P07F08Answer(qf,"999/1000").ok,false);
  const qp=buildG5BU08P07F08Question({variant:170,patternSpecId:"ps_g5b_u08_decimal_to_percent"});assert.equal(validateG5BU08P07F08Answer(qp,qp.answerText).ok,true);assert.equal(qp.patternRepresentation.percentAbove100,true);
  const p=qf.patternRepresentation;assert.equal(validateG5BU08P07F08Question({...qf,patternRepresentation:{...p,representationValueEquivalenceVerified:false}}).ok,false);
  assert.equal(validateG5BU08P07F08Question({...qf,metadata:{...qf.metadata,percentageOfQuantityUsed:true}}).ok,false);
  assert.equal(validateG5BU08P07F08Question({...qf,metadata:{...qf.metadata,discountIncreaseApplicationUsed:true}}).ok,false);
});

test("W7 Q008 aggregate generator worksheet renderer cover all six directions and preserve fail-closed mixed modes",()=>{
  const plan=buildBatchABrowserPlan(request({questionCount:12}));assert.equal(plan.sourceId,SRC);assert.equal(plan.questionCountMax,240);assert.deepEqual(plan.patternSpecIds,SPEC_IDS);assert.equal(plan.frozenRuntimeProfile,"profile_ratio_percent");
  const g=generateBatchABrowserQuestions(request({questionCount:12}));assert.equal(g.ok,true,g.errors.join(","));assert.equal(g.questions.length,12);assert.equal(new Set(g.questions.map(q=>q.questionSignature)).size,12);
  assert.deepEqual([...new Set(g.questions.map(q=>q.patternRepresentation.targetKind))].sort(),["DECIMAL_TO_FRACTION","DECIMAL_TO_PERCENT","FRACTION_TO_DECIMAL","FRACTION_TO_PERCENT","PERCENT_TO_DECIMAL","PERCENT_TO_FRACTION"]);
  const w=buildBatchABrowserWorksheetDocument(request({questionCount:12,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:6}}));assert.equal(w.ok,true,w.errors.join(","));assert.equal(w.worksheetDocument.questionCount,12);assert.equal(w.worksheetDocument.answerKeyItems.length,12);assert.equal(w.worksheetDocument.summary.diagramQuestionCount,0);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""}),visible=html.replace(/<[^>]*>/g," ");
  assert.match(visible,/最簡分數/);assert.match(visible,/百分率/);assert.match(visible,/小數/);
  for(const term of ["折扣","漲價","投票","命中率","錯誤率","原價","售價"])assert.equal(visible.includes(term),false,term);
  assert.equal(visible.includes("kp_g5b_u08_"),false);assert.equal(visible.includes("ps_g5b_u08_"),false);assert.equal(visible.includes("P07F08"),false);
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[KP,"kp_g5b_u08_percentage_of_quantity"],questionMode:"numeric",questionCount:4,generationSeed:"mixed-not-admitted"});assert.equal(mixed.ok,false);
});

test("W7 Q008 current browser pointers advance to P07F09 while Q007 through Q001 and W6 Q020 stay reachable",()=>{
  const selectorText=readFileSync(new URL("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",import.meta.url),"utf8"),bindingText=readFileSync(new URL("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",import.meta.url),"utf8"),generatorText=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",import.meta.url),"utf8"),worksheetText=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",import.meta.url),"utf8");
  assert.match(selectorText,/batch-a-selector-p07f09-extension/);assert.match(bindingText,/public-ui-capability-binding-p07f09/);
  for(const id of ["08","07","06","05","04","03","02","01"])assert.match(generatorText,new RegExp("requestsP07F"+id));assert.match(generatorText,/requestsP06F20/);
  for(const id of ["08","07","06","05","04","03","02","01"])assert.match(worksheetText,new RegExp("buildP07F"+id+"Worksheet"));assert.match(worksheetText,/buildP06F20Worksheet/);
});

test("W7 Q008 validation contract stays SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.equal(validation.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
  assert.equal(impact.scopeGuards.q007ProductMutation,false);assert.equal(impact.scopeGuards.q001Q002Q003Q004Q005Q006Q007CompatibilityTestOnlyMutation,true);assert.equal(impact.scopeGuards.q009OrLaterProductMutation,false);
});
