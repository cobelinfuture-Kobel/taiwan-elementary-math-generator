import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as selector from "../../site/modules/curriculum/registry/batch-a-selector-p07f01-extension.js";
import * as preSelector from "../../site/modules/curriculum/registry/batch-a-selector-p06f20-extension.js";
import {auditG6AU05P07F01Projection,G6A_U05_P07F01_KP_ID as KP,G6A_U05_P07F01_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G6A_U05_P07F01_PATTERN_SPECS as SPECS,G6A_U05_P07F01_PROTECTED_FUTURE_KP_IDS as PROTECTED,G6A_U05_P07F01_REQUIRED_CAPABILITY_IDS as REQUIRED,G6A_U05_P07F01_SOURCE_ID as SRC,G6A_U05_P07F01_SPEC_IDS as SPEC_IDS} from "../../site/modules/curriculum/registry/g6a-u05-ratio-notation-order-selector-projection-p07f01.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p07f01.js";
import {buildG6AU05P07F01Question,generateG6AU05P07F01Questions,validateG6AU05P07F01Answer,validateG6AU05P07F01Question} from "../../site/modules/curriculum/batch-a/g6a-u05-ratio-notation-order-runtime-p07f01.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {getBatchASourceUnit,listBatchASourceUnits} from "../../site/modules/curriculum/batch-a/source-units.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p07f/q001-g6a-u05-ratio-notation-order-implementation.json");
const preflight=read("data/curriculum/full-product/p07f/q001-g6a-u05-ratio-notation-order-source-authority-preflight.json");
const impact=read("data/project/change-impact/P07F_W7_Q001.impact.json");
const validation=read("data/project/validation-plans/P07F_W7_Q001.validation.json");
const request=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"numeric",questionCount:20,generationSeed:"p07f01-ratio-notation",...extra});

test("W7 Q001 implementation preserves exact frozen queue and source evidence boundary",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(impl.preflight.prNumber,1015);
  assert.equal(impl.preflight.mergeSha,"d85155a33f9bad0357082aaff6d642e66e6f412c");
  assert.equal(impl.queueAuthority.queuePosition,1);
  assert.equal(impl.queueAuthority.queueSliceCount,26);
  assert.equal(impl.queueAuthority.sliceId,"p07e_q001_r5_g6a_u05_6a05_profile_ratio_percent_c1");
  assert.deepEqual(impl.queueAuthority.knowledgePointIds,[KP]);
  assert.deepEqual(impl.queueAuthority.requiredW7CapabilityIds,["cap_ratio_percent_reasoning","cap_ratio_rate_validator"]);
  assert.equal(impl.sourceAuthority.reviewMethod,"CURRENT_FULL_PAGE_VISUAL_READBACK_200_DPI");
  assert.equal(impl.sourceAuthority.sourcePdfSha256,"282b7ee25093afdd3b50c1077c168c30da0118bac4010f98aed09471e1ae5e4c");
  assert.deepEqual(impl.sourceAuthority.targetEvidencePages,[1]);
});

test("W7 Q001 FormalMapping and three PatternSpecs lock ordered ratio roles only",()=>{
  const a=auditG6AU05P07F01Projection();assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1});
  assert.deepEqual(REQUIRED,["cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly","cap_answer_key_projection","cap_html_print_renderer","cap_ratio_percent_reasoning","cap_ratio_rate_validator","cap_text_application_representation"]);
  assert.deepEqual(OPTIONAL,[]);
  assert.ok(SPECS.every(x=>x.semanticCore==="ORDERED_RATIO_NOTATION_WITH_FIXED_ANTECEDENT_CONSEQUENT_ROLES"&&x.orderedRatioRequired&&x.antecedentFirstRequired&&x.consequentSecondRequired&&x.swappingTermsChangesRelation&&x.roleOrderPreservationRequired&&!x.ratioValueComputationAllowed&&!x.equivalentRatioTransformationAllowed&&!x.simplestIntegerRatioTransformationAllowed&&!x.ratioPartitionApplicationAllowed&&!x.proportionCrossMultiplicationAllowed&&!x.percentConversionAllowed&&!x.applicationContextAllowed&&!x.sameUnitMixedAllowed&&!x.crossUnitMixedAllowed));
});

test("W7 Q001 adds G6A-U05 source and promotes only ratio-notation KP while later same-source KPs stay hidden",()=>{
  const before=preSelector.listBatchAKnowledgePointAvailabilityBySource(SRC);
  if(before){const beforeVisible=before.visibleKnowledgePointIds??[];assert.equal(beforeVisible.includes(KP),false);assert.ok(PROTECTED.every(id=>!beforeVisible.includes(id)));}
  assert.equal(getBatchASourceUnit(SRC)?.title,"比和比值");
  assert.ok(listBatchASourceUnits({includeW7Slice001:true}).some(x=>x.sourceId===SRC));
  const a=selector.auditP07F01PublicSelectorComposition();assert.equal(a.ok,true,a.errors.join(","));
  const after=selector.listBatchAKnowledgePointAvailabilityBySource(SRC),ids=selector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  assert.deepEqual(ids,[KP]);assert.equal(after.visibleKnowledgePointIds.includes(KP),true);assert.equal(after.hiddenPendingKnowledgePointIds.includes(KP),false);assert.equal(after.notSelectableKnowledgePointIds.includes(KP),false);
  assert.ok(PROTECTED.every(id=>after.hiddenPendingKnowledgePointIds.includes(id)&&after.notSelectableKnowledgePointIds.includes(id)&&!ids.includes(id)));
  assert.equal(after.sameSourceCandidateSetComplete,false);assert.equal(after.sameUnitMixedAllowed,false);assert.equal(after.w7FrozenQueueComplete,false);
  assert.equal(selector.resolveVisiblePatternSpecIdsForKnowledgePoint(KP,"numeric").length,3);
});

test("W7 Q001 capability binding matches exact ratio-percent runtime without application modifier",()=>{
  const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join(","));
  const b=resolvePublicUiCapabilityBinding(request());
  assert.equal(b.blocked,false);assert.equal(b.questionType,"numeric");assert.equal(b.questionCount.max,240);
  assert.deepEqual(b.requiredCapabilityIds,REQUIRED);assert.deepEqual(b.optionalCapabilityIds,OPTIONAL);assert.deepEqual(b.appliedRuntimeModifierIds,[]);
  assert.equal(b.orderedRatioNotationRequired,true);assert.equal(b.antecedentFirstRequired,true);assert.equal(b.consequentSecondRequired,true);assert.equal(b.swappedTermsChangeRelation,true);
  assert.equal(b.ratioValueReownershipAllowed,false);assert.equal(b.equivalentRatioReownershipAllowed,false);assert.equal(b.simplestIntegerRatioReownershipAllowed,false);assert.equal(b.ratioPartitionApplicationReownershipAllowed,false);assert.equal(b.proportionCrossMultiplicationReownershipAllowed,false);assert.equal(b.percentConversionReownershipAllowed,false);assert.equal(b.applicationContextAllowed,false);
  assert.equal(b.sameUnitMixedAdmission,false);assert.equal(b.crossUnitMixedAdmission,false);assert.equal(b.frozenRuntimeProfile,"profile_ratio_percent");
});

for(const patternSpecId of SPEC_IDS)test("W7 Q001 "+patternSpecId+" has 240 deterministic unique validated variants",()=>{
  const a=generateG6AU05P07F01Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
  const b=generateG6AU05P07F01Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){const p=q.patternRepresentation;assert.equal(validateG6AU05P07F01Question(q).ok,true);assert.equal(validateG6AU05P07F01Answer(q,q.answerValue).ok,true);assert.equal(p.notation,p.antecedent+":"+p.consequent);assert.notEqual(p.swappedNotation,p.notation);assert.equal(p.roleOrderPreserved,true);assert.equal(p.swappedChangesRelation,true);}
});

test("W7 Q001 validator fails closed on swapped order wrong role answer or later-skill leakage",()=>{
  const notation=buildG6AU05P07F01Question({variant:17,patternSpecId:SPEC_IDS[0]});
  assert.equal(validateG6AU05P07F01Answer(notation,notation.patternRepresentation.swappedNotation).ok,false);
  assert.equal(validateG6AU05P07F01Question({...notation,patternRepresentation:{...notation.patternRepresentation,notation:notation.patternRepresentation.swappedNotation}}).ok,false);
  const ant=buildG6AU05P07F01Question({variant:31,patternSpecId:SPEC_IDS[1]});
  assert.equal(validateG6AU05P07F01Answer(ant,ant.patternRepresentation.consequent).ok,false);
  const con=buildG6AU05P07F01Question({variant:61,patternSpecId:SPEC_IDS[2]});
  assert.equal(validateG6AU05P07F01Question({...con,metadata:{...con.metadata,ratioValueReowned:true}}).ok,false);
  assert.equal(validateG6AU05P07F01Question({...con,metadata:{...con.metadata,applicationContextUsed:true}}).ok,false);
});

test("W7 Q001 aggregate generator worksheet renderer expose all three ordered-ratio families and preserve W6 Q020",()=>{
  const plan=buildBatchABrowserPlan(request({questionCount:12}));assert.equal(plan.sourceId,SRC);assert.equal(plan.questionCountMax,240);assert.deepEqual(plan.patternSpecIds,SPEC_IDS);
  const g=generateBatchABrowserQuestions(request({questionCount:12}));assert.equal(g.ok,true,g.errors.join(","));assert.equal(g.questions.length,12);assert.equal(new Set(g.questions.map(q=>q.questionSignature)).size,12);
  assert.deepEqual([...new Set(g.questions.map(q=>q.patternRepresentation.targetKind))].sort(),["ANTECEDENT","CONSEQUENT","RATIO_NOTATION"]);
  const w=buildBatchABrowserWorksheetDocument(request({questionCount:9,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:5}}));assert.equal(w.ok,true,w.errors.join(","));assert.equal(w.worksheetDocument.questionCount,9);assert.equal(w.worksheetDocument.answerKeyItems.length,9);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""}),visible=html.replace(/<[^>]*>/g," ");
  assert.match(visible,/寫成比的記號/);assert.match(visible,/前項是多少/);assert.match(visible,/後項是多少/);
  assert.equal(visible.includes("kp_g6a_u05_"),false);assert.equal(visible.includes("ps_g6a_u05_"),false);assert.equal(visible.includes("P07F01"),false);
  const q20=generateBatchABrowserQuestions({sourceId:"g6b_u05_6b05",selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:["kp_g6b_u05_age_or_repeated_relation_problem"],questionMode:"numeric",questionCount:4,generationSeed:"p07f01-preserve-q020"});assert.equal(q20.ok,true,q20.errors.join(","));assert.ok(q20.questions.every(q=>q.knowledgePointId==="kp_g6b_u05_age_or_repeated_relation_problem"));
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[KP,PROTECTED[0]],questionMode:"numeric",questionCount:4,generationSeed:"mixed-not-admitted"});assert.equal(mixed.ok,false);
});

test("W7 Q001 remains reachable after current browser pointers advance to P07F07",()=>{
  const selectorText=readFileSync(new URL("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",import.meta.url),"utf8");
  const bindingText=readFileSync(new URL("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",import.meta.url),"utf8");
  const generatorText=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",import.meta.url),"utf8");
  const worksheetText=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",import.meta.url),"utf8");
  assert.match(selectorText,/batch-a-selector-p07f07-extension/);assert.match(bindingText,/public-ui-capability-binding-p07f07/);
  assert.match(generatorText,/requestsP07F07/);assert.match(generatorText,/requestsP07F06/);assert.match(generatorText,/requestsP07F05/);assert.match(generatorText,/requestsP07F04/);assert.match(generatorText,/requestsP07F03/);assert.match(generatorText,/requestsP07F02/);assert.match(generatorText,/requestsP07F01/);assert.match(generatorText,/requestsP06F20/);assert.match(worksheetText,/buildP07F07Worksheet/);assert.match(worksheetText,/buildP07F06Worksheet/);assert.match(worksheetText,/buildP07F05Worksheet/);assert.match(worksheetText,/buildP07F04Worksheet/);assert.match(worksheetText,/buildP07F03Worksheet/);assert.match(worksheetText,/buildP07F02Worksheet/);assert.match(worksheetText,/buildP07F01Worksheet/);assert.match(worksheetText,/buildP06F20Worksheet/);
});

test("W7 Q001 validation contract stays SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.equal(validation.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
  assert.equal(impact.scopeGuards.q020CompatibilityTestOnlyMutation,true);assert.equal(impact.scopeGuards.q002OrLaterProductMutation,false);
});
