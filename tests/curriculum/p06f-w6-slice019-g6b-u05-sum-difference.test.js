import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as selector from "../../site/modules/curriculum/registry/batch-a-selector-p06f19-extension.js";
import * as preSelector from "../../site/modules/curriculum/registry/batch-a-selector-p06f18-extension.js";
import {auditG6BU05P06F19Projection,G6B_U05_P06F19_FUTURE_KP_IDS as FUTURE,G6B_U05_P06F19_KP_ID as KP,G6B_U05_P06F19_PATTERN_SPECS as SPECS,G6B_U05_P06F19_REQUIRED_CAPABILITY_IDS as REQUIRED,G6B_U05_P06F19_SOURCE_ID as SRC,G6B_U05_P06F19_SPEC_IDS as SPEC_IDS} from "../../site/modules/curriculum/registry/g6b-u05-sum-difference-selector-projection-p06f19.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p06f19.js";
import {buildG6BU05P06F19Question,generateG6BU05P06F19Questions,validateG6BU05P06F19Answer,validateG6BU05P06F19Question} from "../../site/modules/curriculum/batch-a/g6b-u05-sum-difference-runtime-p06f19.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {listBatchASourceUnits,getBatchASourceUnit,isBatchASourceId} from "../../site/modules/curriculum/batch-a/source-units.js";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p06f/q019-g6b-u05-sum-difference-implementation.json");
const preflight=read("data/curriculum/full-product/p06f/q019-g6b-u05-sum-difference-source-authority-preflight.json");
const impact=read("data/project/change-impact/P06F_W6_Q019.impact.json");
const validation=read("data/project/validation-plans/P06F_W6_Q019.validation.json");
const request=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"numeric",questionCount:20,generationSeed:"p06f19-sum-difference",...extra});

test("Q019 implementation preserves exact preflight queue source and semantic boundary",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(impl.preflight.prNumber,1009);
  assert.equal(impl.preflight.mergeSha,"ad500ffb53546940a56ea78384289bfec3c3fb2b");
  assert.equal(impl.queueAuthority.sliceId,"p06e_q019_r10_g6b_u05_6b05_profile_decimal_c1");
  assert.deepEqual(impl.queueAuthority.knowledgePointIds,[KP]);
  assert.equal(impl.sourceAuthority.reviewMethod,"FULL_PAGE_VISUAL_READBACK_200_DPI");
  assert.equal(impl.sourceAuthority.sourcePdfSha256,"1be6a253b422a427bf4a20a09ee478400f39a11e9b817c1acee308e5f6b9403b");
  assert.deepEqual(impl.productContract.includedRelations,["SOLVE_TWO_QUANTITIES_FROM_SUM_AND_DIFFERENCE","VERIFY_SUM_AND_DIFFERENCE_RECONSTRUCTION"]);
});

test("Q019 FormalMapping and two PatternSpecs keep profile_decimal as envelope only",()=>{
  const a=auditG6BU05P06F19Projection();assert.equal(a.ok,true,a.errors.join(","));
  assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:2,formalMappings:1});
  assert.deepEqual(REQUIRED,["cap_decimal_number_system","cap_decimal_domain_validator","cap_text_numeric_representation"]);
  assert.ok(SPECS.every(x=>x.semanticCore==="SUM_DIFFERENCE_TWO_QUANTITY_DECOMPOSITION"&&x.knownSumAndDifferenceRequired&&x.sumReconstructionRequired&&x.differenceReconstructionRequired&&x.exactIntegerPartitionRequired&&x.decimalProfileEnvelopeOnly&&!x.decimalPlaceValueReasoningCore&&!x.decimalNotationCore&&x.sourceContextRepresentationOnly&&!x.sumMultipleProblemReownershipAllowed&&!x.differenceMultipleProblemReownershipAllowed&&!x.ageOrRepeatedRelationProblemReownershipAllowed&&!x.workOrDistributionStrategyReownershipAllowed&&!x.applicationImplementationAllowed&&!x.sameUnitMixedAllowed&&!x.crossUnitMixedAllowed));
});

test("Q019 public source catalog exposes G6B-U05 only through the approved W6 slice019 path",()=>{
  const units=listBatchASourceUnits({includeW6Slice019:true});
  const unit=units.find(x=>x.sourceId===SRC);
  assert.ok(unit);assert.equal(unit.grade,6);assert.equal(unit.semester,"lower");assert.equal(unit.unitCode,"6B-U05");assert.equal(unit.title,"怎樣解題");
  assert.equal(getBatchASourceUnit(SRC).sourceId,SRC);assert.equal(isBatchASourceId(SRC),true);
});

test("Q019 public selector creates G6B-U05 route while all later same-source capabilities stay hidden",()=>{
  const before=preSelector.listBatchAKnowledgePointAvailabilityBySource(SRC);
  assert.ok(before);
  assert.equal(before.sourceId,SRC);
  assert.equal(before.visibleCount,0);
  assert.equal(before.hiddenPendingCount,0);
  assert.equal(before.notSelectableCount,0);
  assert.equal(preSelector.getVisibleBatchAKnowledgePoint(KP),null);
  const a=selector.auditP06F19PublicSelectorComposition();assert.equal(a.ok,true,a.errors.join(","));
  const after=selector.listBatchAKnowledgePointAvailabilityBySource(SRC),ids=selector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  assert.deepEqual(ids,[KP]);assert.equal(after.visibleKnowledgePointIds.includes(KP),true);
  assert.ok(FUTURE.every(id=>after.hiddenPendingKnowledgePointIds.includes(id)&&after.notSelectableKnowledgePointIds.includes(id)&&!ids.includes(id)));
  assert.equal(after.sameSourceCandidateSetComplete,false);assert.equal(after.sameUnitMixedAllowed,false);
  assert.equal(selector.resolveVisiblePatternSpecIdsForKnowledgePoint(KP,"numeric").length,2);
});

test("Q019 capability binding preserves sum-difference core and profile mismatch lock",()=>{
  const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join(","));
  const b=resolvePublicUiCapabilityBinding(request());
  assert.equal(b.blocked,false);assert.equal(b.questionType,"numeric");assert.equal(b.questionCount.max,240);
  assert.deepEqual(b.requiredCapabilityIds,REQUIRED);
  assert.equal(b.knownSumAndDifferenceCore,true);assert.equal(b.sumReconstructionRequired,true);assert.equal(b.differenceReconstructionRequired,true);assert.equal(b.exactIntegerPartitionRequired,true);
  assert.equal(b.decimalProfileEnvelopeOnly,true);assert.equal(b.decimalPlaceValueSemanticCore,false);assert.equal(b.decimalNotationSemanticCore,false);
  assert.equal(b.sumMultipleProblemReownershipAllowed,false);assert.equal(b.differenceMultipleProblemReownershipAllowed,false);assert.equal(b.ageOrRepeatedRelationProblemReownershipAllowed,false);assert.equal(b.workOrDistributionStrategyReownershipAllowed,false);assert.equal(b.q020ReownershipAllowed,false);
  assert.equal(b.sameUnitMixedAdmission,false);assert.equal(b.crossUnitMixedAdmission,false);assert.equal(b.frozenRuntimeProfile,"profile_decimal");
});

for(const patternSpecId of SPEC_IDS)test("Q019 "+patternSpecId+" has 240 deterministic unique validated variants",()=>{
  const a=generateG6BU05P06F19Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
  const b=generateG6BU05P06F19Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){assert.equal(validateG6BU05P06F19Question(q).ok,true);assert.equal(validateG6BU05P06F19Answer(q,q.answerValue).ok,true);assert.equal(q.patternRepresentation.sum,q.patternRepresentation.larger+q.patternRepresentation.smaller);assert.equal(q.patternRepresentation.difference,q.patternRepresentation.larger-q.patternRepresentation.smaller);}
});

test("Q019 validator fails closed on relation, formula, answer, or scope tampering",()=>{
  const larger=buildG6BU05P06F19Question({variant:17,patternSpecId:SPEC_IDS[0]});
  assert.equal(validateG6BU05P06F19Answer(larger,larger.answerValue+1).ok,false);
  assert.equal(validateG6BU05P06F19Question({...larger,patternRepresentation:{...larger.patternRepresentation,sum:larger.patternRepresentation.sum+1}}).ok,false);
  assert.equal(validateG6BU05P06F19Question({...larger,patternRepresentation:{...larger.patternRepresentation,largerFormulaValue:larger.patternRepresentation.largerFormulaValue+1}}).ok,false);
  const smaller=buildG6BU05P06F19Question({variant:31,patternSpecId:SPEC_IDS[1]});
  assert.equal(validateG6BU05P06F19Question({...smaller,metadata:{...smaller.metadata,ageOrRepeatedRelationProblemReowned:true}}).ok,false);
  assert.equal(validateG6BU05P06F19Question({...smaller,metadata:{...smaller.metadata,decimalPlaceValueSemanticCore:true}}).ok,false);
});

test("Q019 browser generator and worksheet expose both target families and reject mixed mode",()=>{
  const plan=buildBatchABrowserPlan(request({questionCount:12}));assert.equal(plan.sourceId,SRC);assert.equal(plan.questionCountMax,240);assert.deepEqual(plan.patternSpecIds,SPEC_IDS);
  const g=generateBatchABrowserQuestions(request({questionCount:12}));assert.equal(g.ok,true,g.errors.join(","));assert.equal(g.questions.length,12);assert.equal(new Set(g.questions.map(q=>q.questionSignature)).size,12);
  assert.deepEqual([...new Set(g.questions.map(q=>q.patternRepresentation.targetQuantity))].sort(),["LARGER","SMALLER"]);
  const w=buildBatchABrowserWorksheetDocument(request({questionCount:8,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:4}}));assert.equal(w.ok,true,w.errors.join(","));assert.equal(w.worksheetDocument.questionCount,8);assert.equal(w.worksheetDocument.answerKeyItems.length,8);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""}),visible=html.replace(/<[^>]*>/g," ");
  assert.match(visible,/兩個數的和/);assert.match(visible,/較大數/);assert.match(visible,/較小數/);assert.equal(visible.includes("kp_g6b_u05_"),false);assert.equal(visible.includes("ps_g6b_u05_"),false);assert.equal(visible.includes("P06F19"),false);
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[KP,...FUTURE.slice(0,1)],questionMode:"numeric",questionCount:4,generationSeed:"mixed-not-admitted"});assert.equal(mixed.ok,false);
});

test("Q019 aggregate runtime preserves Q018 route while current browser pointers advance past Q018",()=>{
  const q18=generateBatchABrowserQuestions({sourceId:"g6a_u03_6a03",selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:["kp_g6a_u03_relation_equation_unknown"],questionMode:"numeric",questionCount:2,generationSeed:"q019-preserve-q018"});
  assert.equal(q18.ok,true,q18.errors.join(","));assert.ok(q18.questions.every(q=>q.knowledgePointId==="kp_g6a_u03_relation_equation_unknown"));
  const selectorText=readFileSync(new URL("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",import.meta.url),"utf8");
  const bindingText=readFileSync(new URL("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",import.meta.url),"utf8");
  const generatorText=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",import.meta.url),"utf8");
  const worksheetText=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",import.meta.url),"utf8");
  assert.match(selectorText,/batch-a-selector-p06f19-extension/);assert.match(bindingText,/public-ui-capability-binding-p06f19/);
  assert.match(generatorText,/requestsP06F19/);assert.match(generatorText,/requestsP06F18/);assert.match(worksheetText,/buildP06F19Worksheet/);assert.match(worksheetText,/buildP06F18Worksheet/);
});

test("Q019 validation contract stays SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.equal(validation.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
