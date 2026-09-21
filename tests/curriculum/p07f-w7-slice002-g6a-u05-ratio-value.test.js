import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as selector from "../../site/modules/curriculum/registry/batch-a-selector-p07f02-extension.js";
import * as preSelector from "../../site/modules/curriculum/registry/batch-a-selector-p07f01-extension.js";
import {auditG6AU05P07F02Projection,G6A_U05_P07F02_INCLUDED_RELATIONS as RELATIONS,G6A_U05_P07F02_KP_ID as KP,G6A_U05_P07F02_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G6A_U05_P07F02_PATTERN_SPECS as SPECS,G6A_U05_P07F02_PREDECESSOR_KP_IDS as Q001,G6A_U05_P07F02_PROTECTED_FUTURE_KP_IDS as PROTECTED,G6A_U05_P07F02_REQUIRED_CAPABILITY_IDS as REQUIRED,G6A_U05_P07F02_SOURCE_ID as SRC,G6A_U05_P07F02_SPEC_IDS as SPEC_IDS} from "../../site/modules/curriculum/registry/g6a-u05-ratio-value-selector-projection-p07f02.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p07f02.js";
import {buildG6AU05P07F02Question,generateG6AU05P07F02Questions,validateG6AU05P07F02Answer,validateG6AU05P07F02Question} from "../../site/modules/curriculum/batch-a/g6a-u05-ratio-value-runtime-p07f02.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p07f/q002-g6a-u05-ratio-value-implementation.json");
const preflight=read("data/curriculum/full-product/p07f/q002-g6a-u05-ratio-value-source-authority-preflight.json");
const impact=read("data/project/change-impact/P07F_W7_Q002.impact.json");
const validation=read("data/project/validation-plans/P07F_W7_Q002.validation.json");
const request=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"numeric",questionCount:20,generationSeed:"p07f02-ratio-value",...extra});

test("W7 Q002 implementation preserves frozen queue, predecessor D0, and page-2 source boundary",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(impl.preflight.prNumber,1017);
  assert.equal(impl.preflight.mergeSha,"ef36d150e8e7a70cb9cf75c91233906760c4b01e");
  assert.equal(impl.predecessorD0.q001Status,"PASS_E6_D0_COMPLETE");
  assert.equal(impl.queueAuthority.queuePosition,2);
  assert.equal(impl.queueAuthority.queueSliceCount,26);
  assert.equal(impl.queueAuthority.sliceId,"p07e_q002_r6_g6a_u05_6a05_profile_ratio_percent_c1");
  assert.equal(impl.queueAuthority.previousSliceId,"p07e_q001_r5_g6a_u05_6a05_profile_ratio_percent_c1");
  assert.deepEqual(impl.queueAuthority.knowledgePointIds,[KP]);
  assert.deepEqual(impl.queueAuthority.requiredW7CapabilityIds,["cap_ratio_percent_reasoning","cap_ratio_rate_validator"]);
  assert.equal(impl.sourceAuthority.sourcePdfSha256,"282b7ee25093afdd3b50c1077c168c30da0118bac4010f98aed09471e1ae5e4c");
  assert.deepEqual(impl.sourceAuthority.targetEvidencePages,[2]);
});

test("W7 Q002 FormalMapping and three PatternSpecs own ratio value only",()=>{
  const a=auditG6AU05P07F02Projection();assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1});
  assert.deepEqual(REQUIRED,["cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly","cap_answer_key_projection","cap_html_print_renderer","cap_ratio_percent_reasoning","cap_ratio_rate_validator","cap_text_application_representation"]);
  assert.deepEqual(OPTIONAL,[]);
  assert.deepEqual(impl.productContract.includedRelations,RELATIONS);
  assert.ok(SPECS.every(x=>x.semanticCore==="RATIO_VALUE_EQUALS_ANTECEDENT_DIVIDED_BY_NONZERO_CONSEQUENT"&&x.antecedentConsequentOrderRequired&&x.consequentNonzeroRequired&&x.quotientDirectionRequired==="ANTECEDENT_DIVIDED_BY_CONSEQUENT"&&x.fractionEquivalenceRequired&&!x.q001RatioNotationReownershipAllowed&&!x.equivalentRatioTransformationAllowed&&!x.simplestIntegerRatioTransformationAllowed&&!x.ratioPartitionApplicationAllowed&&!x.proportionCrossMultiplicationAllowed&&!x.directProportionTableOrGraphAllowed&&!x.percentConversionAllowed&&!x.applicationContextAllowed&&!x.sameUnitMixedAllowed&&!x.crossUnitMixedAllowed));
});

test("W7 Q002 promotes only ratio-value KP, preserves Q001, and keeps later same-source KPs hidden",()=>{
  const before=preSelector.listBatchAKnowledgePointAvailabilityBySource(SRC);assert.ok(before);
  assert.ok(Q001.every(id=>(before.visibleKnowledgePointIds??[]).includes(id)));
  assert.equal((before.visibleKnowledgePointIds??[]).includes(KP),false);
  assert.ok((before.hiddenPendingKnowledgePointIds??[]).includes(KP));assert.ok((before.notSelectableKnowledgePointIds??[]).includes(KP));
  const a=selector.auditP07F02PublicSelectorComposition();assert.equal(a.ok,true,a.errors.join(","));
  const after=selector.listBatchAKnowledgePointAvailabilityBySource(SRC),ids=selector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  assert.ok(Q001.every(id=>ids.includes(id)));assert.ok(ids.includes(KP));assert.ok(selector.getVisibleBatchAKnowledgePoint(KP));
  assert.equal(after.hiddenPendingKnowledgePointIds.includes(KP),false);assert.equal(after.notSelectableKnowledgePointIds.includes(KP),false);
  assert.ok(PROTECTED.every(id=>after.hiddenPendingKnowledgePointIds.includes(id)&&after.notSelectableKnowledgePointIds.includes(id)&&!ids.includes(id)));
  assert.equal(after.sameSourceCandidateSetComplete,false);assert.equal(after.sameUnitMixedAllowed,false);assert.equal(after.w7FrozenQueueComplete,false);
  assert.deepEqual(selector.resolveVisiblePatternSpecIdsForKnowledgePoint(KP,"numeric"),SPEC_IDS);
});

test("W7 Q002 capability binding uses exact ratio-percent runtime and protects Q001 ownership",()=>{
  const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join(","));
  const b=resolvePublicUiCapabilityBinding(request());
  assert.equal(b.blocked,false);assert.equal(b.questionType,"numeric");assert.equal(b.questionCount.max,240);
  assert.deepEqual(b.requiredCapabilityIds,REQUIRED);assert.deepEqual(b.optionalCapabilityIds,OPTIONAL);assert.deepEqual(b.appliedRuntimeModifierIds,[]);
  assert.equal(b.q001OrderedRolePrerequisiteRequired,true);assert.equal(b.ratioValueComputationOwned,true);assert.equal(b.consequentNonzeroRequired,true);assert.equal(b.fractionEquivalenceRequired,true);
  assert.equal(b.q001RatioNotationReownershipAllowed,false);assert.equal(b.equivalentRatioReownershipAllowed,false);assert.equal(b.simplestIntegerRatioReownershipAllowed,false);assert.equal(b.ratioPartitionApplicationReownershipAllowed,false);assert.equal(b.proportionCrossMultiplicationReownershipAllowed,false);assert.equal(b.directProportionTableOrGraphAllowed,false);assert.equal(b.percentConversionReownershipAllowed,false);assert.equal(b.applicationContextAllowed,false);
  assert.equal(b.sameUnitMixedAdmission,false);assert.equal(b.crossUnitMixedAdmission,false);assert.equal(b.frozenRuntimeProfile,"profile_ratio_percent");
});

for(const patternSpecId of SPEC_IDS)test("W7 Q002 "+patternSpecId+" has 240 deterministic unique validated variants",()=>{
  const a=generateG6AU05P07F02Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
  const b=generateG6AU05P07F02Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){const p=q.patternRepresentation;assert.equal(validateG6AU05P07F02Question(q).ok,true);assert.equal(validateG6AU05P07F02Answer(q,q.answerValue).ok,true);assert.equal(p.notation,p.a+":"+p.b);assert.equal(p.fractionExpression,p.a+"/"+p.b);assert.equal(p.b>0,true);assert.equal(p.quotientDirection,"ANTECEDENT_DIVIDED_BY_CONSEQUENT");}
});

test("W7 Q002 validator accepts equivalent fraction value and fails closed on reversed quotient or later-skill leakage",()=>{
  const f=buildG6AU05P07F02Question({variant:17,patternSpecId:SPEC_IDS[0]});const p=f.patternRepresentation;
  assert.equal(validateG6AU05P07F02Answer(f,(p.a*2)+"/"+(p.b*2)).ok,true);
  assert.equal(validateG6AU05P07F02Answer(f,p.b+"/"+p.a).ok,false);
  assert.equal(validateG6AU05P07F02Question({...f,patternRepresentation:{...p,b:0,consequentNonzero:false}}).ok,false);
  const q=buildG6AU05P07F02Question({variant:31,patternSpecId:SPEC_IDS[1]});
  assert.equal(validateG6AU05P07F02Answer(q,q.answerValue+1).ok,false);
  assert.equal(validateG6AU05P07F02Question({...q,metadata:{...q.metadata,q001RatioNotationReowned:true}}).ok,false);
  assert.equal(validateG6AU05P07F02Question({...q,metadata:{...q.metadata,equivalentRatioReowned:true}}).ok,false);
  assert.equal(validateG6AU05P07F02Question({...q,metadata:{...q.metadata,applicationContextUsed:true}}).ok,false);
});

test("W7 Q002 aggregate generator worksheet renderer expose all three ratio-value families and preserve Q001",()=>{
  const plan=buildBatchABrowserPlan(request({questionCount:12}));assert.equal(plan.sourceId,SRC);assert.equal(plan.questionCountMax,240);assert.deepEqual(plan.patternSpecIds,SPEC_IDS);
  const g=generateBatchABrowserQuestions(request({questionCount:12}));assert.equal(g.ok,true,g.errors.join(","));assert.equal(g.questions.length,12);assert.equal(new Set(g.questions.map(q=>q.questionSignature)).size,12);
  assert.deepEqual([...new Set(g.questions.map(q=>q.patternRepresentation.targetKind))].sort(),["DECIMAL","FRACTION","INTEGER"]);
  const w=buildBatchABrowserWorksheetDocument(request({questionCount:9,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:5}}));assert.equal(w.ok,true,w.errors.join(","));assert.equal(w.worksheetDocument.questionCount,9);assert.equal(w.worksheetDocument.answerKeyItems.length,9);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""}),visible=html.replace(/<[^>]*>/g," ");
  assert.match(visible,/比值是多少/);assert.match(visible,/用分數/);assert.match(visible,/用小數表示/);
  assert.equal(visible.includes("kp_g6a_u05_"),false);assert.equal(visible.includes("ps_g6a_u05_"),false);assert.equal(visible.includes("P07F02"),false);
  const q1=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[Q001[0]],questionMode:"numeric",questionCount:6,generationSeed:"p07f02-preserve-q001"});assert.equal(q1.ok,true,q1.errors.join(","));assert.ok(q1.questions.every(q=>q.knowledgePointId===Q001[0]));
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[Q001[0],KP],questionMode:"numeric",questionCount:4,generationSeed:"mixed-not-admitted"});assert.equal(mixed.ok,false);
});

test("W7 Q002 current browser pointers advance to P07F02 while Q001 and W6 Q020 stay reachable",()=>{
  const selectorText=readFileSync(new URL("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",import.meta.url),"utf8");
  const bindingText=readFileSync(new URL("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",import.meta.url),"utf8");
  const generatorText=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",import.meta.url),"utf8");
  const worksheetText=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",import.meta.url),"utf8");
  assert.match(selectorText,/batch-a-selector-p07f02-extension/);assert.match(bindingText,/public-ui-capability-binding-p07f02/);
  assert.match(generatorText,/requestsP07F02/);assert.match(generatorText,/requestsP07F01/);assert.match(generatorText,/requestsP06F20/);
  assert.match(worksheetText,/buildP07F02Worksheet/);assert.match(worksheetText,/buildP07F01Worksheet/);assert.match(worksheetText,/buildP06F20Worksheet/);
});

test("W7 Q002 validation contract stays SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.equal(validation.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
  assert.equal(impact.scopeGuards.q001ProductMutation,false);assert.equal(impact.scopeGuards.q001CompatibilityTestAndAcceptanceOnlyMutation,true);assert.equal(impact.scopeGuards.q020CurrentPointerCompatibilityTestOnlyMutation,true);assert.equal(impact.scopeGuards.q003OrLaterProductMutation,false);
});
