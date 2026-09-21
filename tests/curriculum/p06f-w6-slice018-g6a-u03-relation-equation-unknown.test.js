import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditG6AU03P06F18Projection,G6A_U03_P06F18_INCLUDED_RELATIONS as RELATIONS,G6A_U03_P06F18_KP_ID as KP,G6A_U03_P06F18_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G6A_U03_P06F18_PATTERN_SPECS as SPECS,G6A_U03_P06F18_PREDECESSOR_KP_IDS as PREV,G6A_U03_P06F18_REQUIRED_CAPABILITY_IDS as REQUIRED,G6A_U03_P06F18_SOURCE_ID as SRC,G6A_U03_P06F18_SPEC_IDS as SPEC_IDS} from "../../site/modules/curriculum/registry/g6a-u03-relation-equation-unknown-selector-projection-p06f18.js";
import * as preSelector from "../../site/modules/curriculum/registry/batch-a-selector-p06f17-extension.js";
import {auditP06F18PublicSelectorComposition,getVisibleBatchAKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource,listVisibleBatchAKnowledgePoints,resolveVisiblePatternSpecIdsForKnowledgePoint} from "../../site/modules/curriculum/registry/batch-a-selector-p06f18-extension.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p06f18.js";
import {buildG6AU03P06F18Question,generateG6AU03P06F18Questions,validateG6AU03P06F18Answer,validateG6AU03P06F18Question} from "../../site/modules/curriculum/batch-a/g6a-u03-relation-equation-unknown-runtime-p06f18.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p06f/q018-g6a-u03-relation-equation-unknown-implementation.json");
const preflight=read("data/curriculum/full-product/p06f/q018-g6a-u03-relation-equation-unknown-source-authority-preflight.json");
const impact=read("data/project/change-impact/P06F_W6_Q018.impact.json");
const validation=read("data/project/validation-plans/P06F_W6_Q018.validation.json");
const request=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"numeric",questionCount:20,generationSeed:"p06f18-relation-equation",...extra});

test("Q018 implementation preserves exact preflight queue source and semantic boundary",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(impl.preflight.prNumber,1007);
  assert.equal(impl.preflight.mergeSha,"5ad4e74ed6d613eb6fbc27eab64155b6bcae5ae7");
  assert.equal(impl.queueAuthority.sliceId,"p06e_q018_r9_g6a_u03_6a03_profile_pattern_relation_c1");
  assert.deepEqual(impl.queueAuthority.knowledgePointIds,[KP]);
  assert.equal(impl.sourceAuthority.reviewMethod,"FULL_PAGE_VISUAL_READBACK");
  assert.deepEqual(impl.productContract.includedRelations,RELATIONS);
  assert.equal(impl.semanticProfileLock.reverseOperationFromRelationIsCore,true);
  assert.equal(impl.semanticProfileLock.substitutionBackValidationRequired,true);
});

test("Q018 FormalMapping and two PatternSpecs stay inside profile_pattern_relation",()=>{
  const a=auditG6AU03P06F18Projection();assert.equal(a.ok,true,a.errors.join(","));
  assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:2,formalMappings:1});
  assert.deepEqual(REQUIRED,["cap_pattern_sequence_reasoning","cap_pattern_relation_validator","cap_text_numeric_representation"]);
  assert.deepEqual(OPTIONAL,["cap_symbolic_relation_reasoning"]);
  assert.ok(SPECS.every(x=>x.semanticCore==="RELATION_EQUATION_UNKNOWN_SOLVING"&&x.reverseOperationRequired&&x.substitutionBackValidationRequired&&x.solvedUnknownMustSatisfyOriginalRelation&&!x.symbolicRelationReasoningRequired&&x.symbolicRelationReasoningOptional&&!x.genericSymbolicQuantityRelationReownershipAllowed&&!x.geometricCountGeneralizationReownershipAllowed&&!x.inputOutputGeneralRuleReownershipAllowed&&!x.linearPatternNthTermReownershipAllowed&&!x.applicationAllowed&&!x.sameUnitMixedAllowed&&!x.crossUnitMixedAllowed));
});

test("Q018 public selector promotes last same-source candidate and preserves all predecessors",()=>{
  const before=preSelector.listBatchAKnowledgePointAvailabilityBySource(SRC);assert.ok(before);
  assert.ok(PREV.every(id=>before.visibleKnowledgePointIds.includes(id)));
  assert.equal(preSelector.getVisibleBatchAKnowledgePoint(KP),null);
  assert.equal(before.hiddenPendingKnowledgePointIds.includes(KP),true);assert.equal(before.notSelectableKnowledgePointIds.includes(KP),true);
  const a=auditP06F18PublicSelectorComposition();assert.equal(a.ok,true,a.errors.join(","));
  const after=listBatchAKnowledgePointAvailabilityBySource(SRC),ids=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  assert.ok(PREV.every(id=>ids.includes(id)));assert.equal(ids.includes(KP),true);
  assert.equal(after.hiddenPendingKnowledgePointIds.some(id=>id.startsWith("kp_g6a_u03_")),false);
  assert.equal(after.notSelectableKnowledgePointIds.some(id=>id.startsWith("kp_g6a_u03_")),false);
  assert.equal(resolveVisiblePatternSpecIdsForKnowledgePoint(KP,"numeric").length,2);
  assert.equal(after.sameSourceCandidateSetComplete,true);assert.equal(after.sameUnitMixedAllowed,false);
});

test("Q018 capability binding locks reverse-operation and substitution-back semantics",()=>{
  const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join(","));
  const b=resolvePublicUiCapabilityBinding(request());
  assert.equal(b.blocked,false);assert.equal(b.questionType,"numeric");assert.equal(b.questionCount.max,240);
  assert.deepEqual(b.requiredCapabilityIds,REQUIRED);assert.deepEqual(b.optionalCapabilityIds,OPTIONAL);
  assert.equal(b.reverseOperationRequired,true);assert.equal(b.substitutionBackValidationRequired,true);assert.equal(b.solvedUnknownMustSatisfyOriginalRelation,true);
  assert.equal(b.symbolicRelationReasoningPromotedToRequired,false);assert.equal(b.symbolicRelationReasoningOptional,true);
  assert.equal(b.genericSymbolicQuantityRelationReownershipAllowed,false);assert.equal(b.geometricCountGeneralizationReownershipAllowed,false);assert.equal(b.inputOutputGeneralRuleReownershipAllowed,false);assert.equal(b.linearPatternNthTermReownershipAllowed,false);
  assert.equal(b.sameUnitMixedAdmission,false);assert.equal(b.crossUnitMixedAdmission,false);assert.equal(b.frozenRuntimeProfile,"profile_pattern_relation");
});

for(const patternSpecId of SPEC_IDS)test("Q018 "+patternSpecId+" has 240 deterministic unique validated variants",()=>{
  const a=generateG6AU03P06F18Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
  const b=generateG6AU03P06F18Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){assert.equal(validateG6AU03P06F18Question(q).ok,true);assert.equal(validateG6AU03P06F18Answer(q,q.answerValue).ok,true);assert.equal(q.patternRepresentation.substitutionCheck,true);assert.equal(q.metadata.reverseOperationUsed,true);assert.equal(q.metadata.substitutionBackValidated,true);}
});

test("Q018 validator fails closed on equation, substitution, answer, or scope tampering",()=>{
  const add=buildG6AU03P06F18Question({variant:17,patternSpecId:SPEC_IDS[0]});
  assert.equal(validateG6AU03P06F18Answer(add,add.answerValue+1).ok,false);
  assert.equal(validateG6AU03P06F18Question({...add,patternRepresentation:{...add.patternRepresentation,total:add.patternRepresentation.total+1}}).ok,false);
  assert.equal(validateG6AU03P06F18Question({...add,patternRepresentation:{...add.patternRepresentation,substitutionCheck:false}}).ok,false);
  const mult=buildG6AU03P06F18Question({variant:31,patternSpecId:SPEC_IDS[1]});
  assert.equal(validateG6AU03P06F18Question({...mult,patternRepresentation:{...mult.patternRepresentation,factor:mult.patternRepresentation.factor+1}}).ok,false);
  assert.equal(validateG6AU03P06F18Question({...mult,metadata:{...mult.metadata,linearPatternNthTermReowned:true}}).ok,false);
});

test("Q018 browser generator and worksheet preserve all predecessor routes and reject mixed mode",()=>{
  const plan=buildBatchABrowserPlan(request({questionCount:12}));assert.equal(plan.sourceId,SRC);assert.equal(plan.questionCountMax,240);assert.deepEqual(plan.patternSpecIds,SPEC_IDS);
  const g=generateBatchABrowserQuestions(request({questionCount:12}));assert.equal(g.ok,true,g.errors.join(","));assert.equal(g.questions.length,12);assert.equal(new Set(g.questions.map(q=>q.questionSignature)).size,12);
  const w=buildBatchABrowserWorksheetDocument(request({questionCount:8,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:4}}));assert.equal(w.ok,true,w.errors.join(","));assert.equal(w.worksheetDocument.questionCount,8);assert.equal(w.worksheetDocument.answerKeyItems.length,8);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""}),visible=html.replace(/<[^>]*>/g," ");
  assert.match(visible,/反向運算/);assert.match(visible,/代回原式/);assert.equal(visible.includes("kp_g6a_u03_"),false);assert.equal(visible.includes("ps_g6a_u03_"),false);assert.equal(visible.includes("P06F18"),false);
  for(const id of PREV){const p=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[id],questionMode:"numeric",questionCount:2,generationSeed:"p06f18-prev-"+id});assert.equal(p.ok,true,p.errors.join(","));assert.ok(p.questions.every(q=>q.knowledgePointId===id));}
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[...PREV,KP],questionMode:"numeric",questionCount:4,generationSeed:"mixed-not-admitted"});assert.equal(mixed.ok,false);
});

test("Q018 current browser pointers advance to Q018 while Q015-Q017 routes remain present",()=>{
  const selector=readFileSync(new URL("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",import.meta.url),"utf8");
  const binding=readFileSync(new URL("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",import.meta.url),"utf8");
  const generator=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",import.meta.url),"utf8");
  const worksheet=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",import.meta.url),"utf8");
  assert.match(selector,/batch-a-selector-p06f18-extension/);assert.match(binding,/public-ui-capability-binding-p06f18/);
  assert.match(generator,/requestsP06F18/);assert.match(generator,/requestsP06F17/);assert.match(generator,/requestsP06F16/);assert.match(generator,/requestsP06F15/);
  assert.match(worksheet,/buildP06F18Worksheet/);assert.match(worksheet,/buildP06F17Worksheet/);assert.match(worksheet,/buildP06F16Worksheet/);assert.match(worksheet,/buildP06F15Worksheet/);
});

test("Q018 validation contract stays SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.equal(validation.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
