import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as selector from "../../site/modules/curriculum/registry/batch-a-selector-p06f20-extension.js";
import * as preSelector from "../../site/modules/curriculum/registry/batch-a-selector-p06f19-extension.js";
import {auditG6BU05P06F20Projection,G6B_U05_P06F20_KP_ID as KP,G6B_U05_P06F20_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G6B_U05_P06F20_PATTERN_SPECS as SPECS,G6B_U05_P06F20_PREDECESSOR_KP_ID as PREDECESSOR,G6B_U05_P06F20_PROTECTED_KP_IDS as PROTECTED,G6B_U05_P06F20_REQUIRED_CAPABILITY_IDS as REQUIRED,G6B_U05_P06F20_SOURCE_ID as SRC,G6B_U05_P06F20_SPEC_IDS as SPEC_IDS} from "../../site/modules/curriculum/registry/g6b-u05-age-repeated-relation-selector-projection-p06f20.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p06f20.js";
import {buildG6BU05P06F20Question,generateG6BU05P06F20Questions,validateG6BU05P06F20Answer,validateG6BU05P06F20Question} from "../../site/modules/curriculum/batch-a/g6b-u05-age-repeated-relation-runtime-p06f20.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p06f/q020-g6b-u05-age-relation-implementation.json");
const preflight=read("data/curriculum/full-product/p06f/q020-g6b-u05-age-repeated-relation-source-authority-preflight.json");
const impact=read("data/project/change-impact/P06F_W6_Q020.impact.json");
const validation=read("data/project/validation-plans/P06F_W6_Q020.validation.json");
const request=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"numeric",questionCount:20,generationSeed:"p06f20-age-relation",...extra});

test("Q020 implementation preserves exact final frozen queue source and semantic boundary",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(impl.preflight.prNumber,1012);
  assert.equal(impl.preflight.mergeSha,"cb2784901cd3b7c67883c5317e4a676d3db786b9");
  assert.equal(impl.queueAuthority.queuePosition,20);assert.equal(impl.queueAuthority.queueSliceCount,20);assert.equal(impl.queueAuthority.isFinalFrozenW6Slice,true);
  assert.equal(impl.queueAuthority.sliceId,"p06e_q020_r11_g6b_u05_6b05_profile_word_problem_c1");
  assert.deepEqual(impl.queueAuthority.knowledgePointIds,[KP]);
  assert.equal(impl.sourceAuthority.reviewMethod,"REUSED_CURRENT_FULL_PAGE_VISUAL_READBACK_200_DPI_FROM_Q019");
  assert.equal(impl.sourceAuthority.sourcePdfSha256,"1be6a253b422a427bf4a20a09ee478400f39a11e9b817c1acee308e5f6b9403b");
  assert.deepEqual(impl.sourceAuthority.targetEvidencePages,[1]);
});

test("Q020 FormalMapping and two PatternSpecs lock equal-time-shift age-difference reasoning",()=>{
  const a=auditG6BU05P06F20Projection();assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:2,formalMappings:1});
  assert.deepEqual(REQUIRED,["cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly","cap_answer_key_projection","cap_html_print_renderer","cap_symbolic_relation_reasoning","cap_relation_model_binding","cap_word_problem_semantic_validation","cap_text_application_representation"]);
  assert.deepEqual(OPTIONAL,["cap_global_context_binding","cap_pbl_task_set_projection"]);
  assert.ok(SPECS.every(x=>x.semanticCore==="AGE_DIFFERENCE_INVARIANT_UNDER_EQUAL_TIME_SHIFT"&&x.ageContextSemanticCore&&x.sameTimeShiftRequired&&x.ageDifferenceInvariantRequired&&x.shiftedMultiplicativeRelationRequired&&x.currentAndShiftedBackSubstitutionRequired&&x.positiveAgeStateRequired&&!x.q019SumDifferenceCoreReownershipAllowed&&!x.generalSumMultipleProblemReownershipAllowed&&!x.generalDifferenceMultipleProblemReownershipAllowed&&!x.workOrDistributionStrategyReownershipAllowed&&!x.genericSequenceOrRecurrenceReownershipAllowed&&!x.genericApplicationOverlayAllowed&&!x.globalContextBindingUsed&&!x.pblProjectionUsed&&!x.sameUnitMixedAllowed&&!x.crossUnitMixedAllowed));
});

test("Q020 public selector promotes age relation beside Q019 while remaining same-source candidates stay hidden",()=>{
  const before=preSelector.listBatchAKnowledgePointAvailabilityBySource(SRC);assert.ok(before);assert.ok(before.visibleKnowledgePointIds.includes(PREDECESSOR));assert.ok(before.hiddenPendingKnowledgePointIds.includes(KP));assert.ok(before.notSelectableKnowledgePointIds.includes(KP));
  const a=selector.auditP06F20PublicSelectorComposition();assert.equal(a.ok,true,a.errors.join(","));
  const after=selector.listBatchAKnowledgePointAvailabilityBySource(SRC),ids=selector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  assert.deepEqual(ids,[PREDECESSOR,KP]);assert.equal(after.visibleKnowledgePointIds.includes(KP),true);assert.equal(after.hiddenPendingKnowledgePointIds.includes(KP),false);assert.equal(after.notSelectableKnowledgePointIds.includes(KP),false);
  assert.ok(PROTECTED.every(id=>after.hiddenPendingKnowledgePointIds.includes(id)&&after.notSelectableKnowledgePointIds.includes(id)&&!ids.includes(id)));
  assert.equal(after.sameSourceCandidateSetComplete,false);assert.equal(after.sameUnitMixedAllowed,false);assert.equal(after.w6FrozenQueueComplete,true);
  assert.equal(selector.resolveVisiblePatternSpecIdsForKnowledgePoint(KP,"numeric").length,2);
});

test("Q020 capability binding uses exact word-problem mapping while optional global/PBL overlays remain unused",()=>{
  const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join(","));
  const b=resolvePublicUiCapabilityBinding(request());
  assert.equal(b.blocked,false);assert.equal(b.questionType,"numeric");assert.equal(b.questionCount.max,240);
  assert.deepEqual(b.requiredCapabilityIds,REQUIRED);assert.deepEqual(b.optionalCapabilityIds,OPTIONAL);
  assert.equal(b.sourceWordProblemContextIsCore,true);assert.equal(b.ageDifferenceInvariantCore,true);assert.equal(b.bothAgesUseSameTimeShift,true);assert.equal(b.shiftedMultiplicativeRelationRequired,true);assert.equal(b.currentAndShiftedBackSubstitutionRequired,true);assert.equal(b.positiveAgeStateRequired,true);
  assert.equal(b.genericApplicationOverlayAllowed,false);assert.equal(b.globalContextBindingUsed,false);assert.equal(b.pblProjectionUsed,false);
  assert.equal(b.q019SumDifferenceCoreReownershipAllowed,false);assert.equal(b.generalSumMultipleProblemReownershipAllowed,false);assert.equal(b.generalDifferenceMultipleProblemReownershipAllowed,false);assert.equal(b.workOrDistributionStrategyReownershipAllowed,false);assert.equal(b.genericSequenceOrRecurrenceReownershipAllowed,false);
  assert.equal(b.sameUnitMixedAdmission,false);assert.equal(b.crossUnitMixedAdmission,false);assert.equal(b.frozenRuntimeProfile,"profile_word_problem");
});

for(const patternSpecId of SPEC_IDS)test("Q020 "+patternSpecId+" has 240 deterministic unique validated variants",()=>{
  const a=generateG6BU05P06F20Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
  const b=generateG6BU05P06F20Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){const p=q.patternRepresentation;assert.equal(validateG6BU05P06F20Question(q).ok,true);assert.equal(validateG6BU05P06F20Answer(q,q.answerValue).ok,true);assert.equal(p.currentOlder-p.currentYounger,p.difference);assert.equal(p.shiftedOlder-p.shiftedYounger,p.difference);assert.equal(p.shiftedOlder,p.multiplier*p.shiftedYounger);assert.ok([p.currentYounger,p.currentOlder,p.shiftedYounger,p.shiftedOlder].every(n=>n>0));}
});

test("Q020 validator fails closed on time-shift relation answer or scope tampering",()=>{
  const future=buildG6BU05P06F20Question({variant:17,patternSpecId:SPEC_IDS[0]});
  assert.equal(validateG6BU05P06F20Answer(future,future.answerValue+1).ok,false);
  assert.equal(validateG6BU05P06F20Question({...future,patternRepresentation:{...future.patternRepresentation,shiftedYounger:future.patternRepresentation.shiftedYounger+1}}).ok,false);
  assert.equal(validateG6BU05P06F20Question({...future,patternRepresentation:{...future.patternRepresentation,difference:future.patternRepresentation.difference+1}}).ok,false);
  const past=buildG6BU05P06F20Question({variant:31,patternSpecId:SPEC_IDS[1]});
  assert.equal(validateG6BU05P06F20Question({...past,metadata:{...past.metadata,q019SumDifferenceCoreReowned:true}}).ok,false);
  assert.equal(validateG6BU05P06F20Question({...past,metadata:{...past.metadata,genericApplicationOverlayUsed:true}}).ok,false);
  assert.equal(validateG6BU05P06F20Question({...past,metadata:{...past.metadata,globalContextBindingUsed:true}}).ok,false);
});

test("Q020 aggregate generator worksheet and renderer expose future/past source-backed age families and preserve Q019",()=>{
  const plan=buildBatchABrowserPlan(request({questionCount:12}));assert.equal(plan.sourceId,SRC);assert.equal(plan.questionCountMax,240);assert.deepEqual(plan.patternSpecIds,SPEC_IDS);
  const g=generateBatchABrowserQuestions(request({questionCount:12}));assert.equal(g.ok,true,g.errors.join(","));assert.equal(g.questions.length,12);assert.equal(new Set(g.questions.map(q=>q.questionSignature)).size,12);
  assert.deepEqual([...new Set(g.questions.map(q=>q.patternRepresentation.timeDirection))].sort(),["FUTURE","PAST"]);
  const w=buildBatchABrowserWorksheetDocument(request({questionCount:8,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:4}}));assert.equal(w.ok,true,w.errors.join(","));assert.equal(w.worksheetDocument.questionCount,8);assert.equal(w.worksheetDocument.answerKeyItems.length,8);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""}),visible=html.replace(/<[^>]*>/g," ");
  assert.match(visible,/年後/);assert.match(visible,/年前/);assert.match(visible,/比乙大/);assert.match(visible,/倍/);assert.match(visible,/現在幾歲/);assert.equal(visible.includes("kp_g6b_u05_"),false);assert.equal(visible.includes("ps_g6b_u05_"),false);assert.equal(visible.includes("P06F20"),false);
  const q19=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[PREDECESSOR],questionMode:"numeric",questionCount:4,generationSeed:"q020-preserve-q019"});assert.equal(q19.ok,true,q19.errors.join(","));assert.ok(q19.questions.every(q=>q.knowledgePointId===PREDECESSOR));
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[PREDECESSOR,KP],questionMode:"numeric",questionCount:4,generationSeed:"mixed-not-admitted"});assert.equal(mixed.ok,false);
});

test("Q020 remains reachable after the current browser pointers advance into W7 Q010",()=>{
  const selectorText=readFileSync(new URL("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",import.meta.url),"utf8");
  const bindingText=readFileSync(new URL("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",import.meta.url),"utf8");
  const generatorText=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",import.meta.url),"utf8");
  const worksheetText=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",import.meta.url),"utf8");
  assert.match(selectorText,/batch-a-selector-p07f13-extension/);assert.match(bindingText,/public-ui-capability-binding-p07f13/);
  assert.match(generatorText,/requestsP06F20/);assert.match(generatorText,/requestsP06F19/);assert.match(worksheetText,/buildP06F20Worksheet/);assert.match(worksheetText,/buildP06F19Worksheet/);
});

test("Q020 validation contract stays SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.equal(validation.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
  assert.equal(impact.scopeGuards.q019CompatibilityTestAndAcceptanceOnlyMutation,true);assert.equal(impact.scopeGuards.laterW6Slice,false);
});
