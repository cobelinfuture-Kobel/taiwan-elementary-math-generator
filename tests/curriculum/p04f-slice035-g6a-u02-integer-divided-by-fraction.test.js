import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {renderInlineMathModel,serializeInlineMathModel} from "../../site/modules/renderer/inline-math.js";
import {buildBatchABrowserPlan,requestsP04F35} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p04f35.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import {P04F35_DISTINCT_CASE_CAPACITY,P04F35_EXACT_RATIONAL_REUSE_DECISION,generateG6AU02P04F35Questions,validateG6AU02P04F35Question} from "../../site/modules/curriculum/batch-a/g6a-u02-integer-divided-by-fraction-runtime-p04f35.js";
import {auditP04F35PublicSelectorComposition,listBatchAKnowledgePointAvailabilityBySource,resolveVisiblePatternSpecIdsForKnowledgePoint} from "../../site/modules/curriculum/registry/batch-a-selector-p04f35-extension.js";
import {G6A_U02_P04F35_SOURCE_ID,G6A_U02_P04F35_KP_ID,G6A_U02_P04F35_GROUP_ID,G6A_U02_P04F35_SPEC_ID,G6A_U02_P04F35_FUTURE_KP_IDS,auditG6AU02P04F35SelectorProjection} from "../../site/modules/curriculum/registry/g6a-u02-integer-divided-by-fraction-selector-projection-p04f35.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding,PUBLIC_UI_SURFACES} from "../../site/modules/curriculum/public/public-ui-capability-binding-p04f35.js";

const read=path=>JSON.parse(fs.readFileSync(new URL(`../../${path}`,import.meta.url),"utf8"));
const authority=read("data/curriculum/full-product/p04f/slice035-g6a-u02-integer-divided-by-fraction-authority.json"),preflight=read("data/curriculum/full-product/p04f/slice035-g6a-u02-integer-divided-by-fraction-preflight-authority.json");
const options={sourceId:G6A_U02_P04F35_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G6A_U02_P04F35_KP_ID],selectedPatternGroupIds:[G6A_U02_P04F35_GROUP_ID],questionMode:"numeric",requestedQuestionType:"numeric",questionCount:24,generationSeed:"p04f35-focused",includeAnswerKey:true,printLayout:{paperSize:"A4",columns:2,rowsPerPage:4,showQuestionNumbers:true,showAnswerKeyPage:true}};

test("q035 authority materializes the locked source-backed numeric relation only",()=>{
  assert.deepEqual(authority.source.reviewedPages,preflight.sourceAuthority.reviewedPages);
  assert.equal(authority.knowledgePoint.knowledgePointId,G6A_U02_P04F35_KP_ID);
  assert.equal(authority.formalMapping.relationFamilyId,"INTEGER_DIVIDED_BY_FRACTION_QUOTIENT");
  assert.deepEqual(authority.formalMapping.knownRoleIds,["DIVIDEND_INTEGER","DIVISOR_FRACTION"]);
  assert.equal(authority.formalMapping.targetRoleId,"QUOTIENT_FRACTION");
  assert.deepEqual(authority.publicNumericPatternSpecIds,[G6A_U02_P04F35_SPEC_ID]);
  assert.equal(authority.implementationBoundary.singleKnowledgePointNumericOnly,true);
  assert.equal(authority.implementationBoundary.structuredFractionDisplay,true);
  assert.equal(authority.implementationBoundary.q033RuntimeTouched,false);
  assert.equal(authority.implementationBoundary.q034Touched,false);
  assert.equal(authority.implementationBoundary.q036Touched,false);
  assert.equal(authority.implementationBoundary.q037Touched,false);
});

test("q035 selector promotes exactly one G6A-U02 KP and keeps q036/q037 frozen",()=>{
  assert.deepEqual(auditG6AU02P04F35SelectorProjection().errors,[]);
  const audit=auditP04F35PublicSelectorComposition();assert.equal(audit.ok,true,JSON.stringify(audit.errors));
  assert.deepEqual(audit.counts,{sources:43,knowledgePoints:308,g6aU02Visible:3,g6aU02Hidden:2,g6aU02NotSelectable:2});
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(G6A_U02_P04F35_KP_ID,"numeric"),[G6A_U02_P04F35_SPEC_ID]);
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(G6A_U02_P04F35_KP_ID,"application"),[]);
  const availability=listBatchAKnowledgePointAvailabilityBySource(G6A_U02_P04F35_SOURCE_ID);assert.ok(availability.visibleKnowledgePointIds.includes(G6A_U02_P04F35_KP_ID));
  for(const id of G6A_U02_P04F35_FUTURE_KP_IDS){assert.ok(availability.hiddenPendingKnowledgePointIds.includes(id));assert.ok(availability.notSelectableKnowledgePointIds.includes(id));}
});

test("q035 public binding is single-KP numeric-only at max 240",()=>{
  const audit=auditPublicUiCapabilityBinding();assert.equal(audit.ok,true,JSON.stringify(audit.errors));
  for(const surfaceId of Object.values(PUBLIC_UI_SURFACES)){const binding=resolvePublicUiCapabilityBinding({...options,surfaceId});assert.equal(binding.blocked,false);assert.equal(binding.selectionMode,"singleKnowledgePoint");assert.equal(binding.questionType,"numeric");assert.equal(binding.questionCount.max,240);assert.deepEqual(binding.selectedKnowledgePointIds,[G6A_U02_P04F35_KP_ID]);assert.deepEqual(binding.compatiblePatternGroupIds,[G6A_U02_P04F35_GROUP_ID]);assert.equal(binding.structuredFractionDisplay,true);}
  assert.equal(resolvePublicUiCapabilityBinding({...options,selectionMode:"mixedKnowledgePointsSameUnit"}).selectedKnowledgePointIds.includes(G6A_U02_P04F35_KP_ID),false);
});

test("q035 generator and validator implement exact integer-divided-by-fraction semantics",()=>{
  assert.equal(P04F35_EXACT_RATIONAL_REUSE_DECISION.q033RuntimeTouched,false);assert.ok(P04F35_DISTINCT_CASE_CAPACITY>=240);assert.equal(requestsP04F35(options),true);
  const plan=buildBatchABrowserPlan(options);assert.equal(plan.selectionMode,"singleKnowledgePoint");assert.equal(plan.questionMode,"numeric");assert.deepEqual(plan.patternSpecIds,[G6A_U02_P04F35_SPEC_ID]);
  const generated=generateG6AU02P04F35Questions({...options,plan});assert.equal(generated.ok,true,JSON.stringify(generated.errors));assert.equal(generated.questions.length,24);assert.equal(new Set(generated.questions.map(question=>question.blankedDisplayText)).size,24);
  for(const question of generated.questions){const result=validateG6AU02P04F35Question(question);assert.equal(result.ok,true,JSON.stringify(result.errors));const metadata=question.metadata;assert.equal(metadata.reciprocalNumerator,metadata.divisorDenominator);assert.equal(metadata.reciprocalDenominator,metadata.divisorNumerator);assert.equal(metadata.q033RuntimeTouched,false);assert.equal(metadata.q034Touched,false);assert.equal(metadata.q036Touched,false);assert.equal(metadata.q037Touched,false);}
});

test("q035 proves 240 distinct questions and validator fails closed on tampering",()=>{
  const generated=generateG6AU02P04F35Questions({sourceId:G6A_U02_P04F35_SOURCE_ID,selectionMode:"singleKnowledgePoint",patternSpecIds:[G6A_U02_P04F35_SPEC_ID],questionCount:240,generationSeed:"p04f35-capacity"});
  assert.equal(generated.ok,true,JSON.stringify(generated.errors));assert.equal(generated.questions.length,240);assert.equal(new Set(generated.questions.map(question=>question.blankedDisplayText)).size,240);assert.equal(new Set(generated.questions.map(question=>question.id)).size,240);
  const question=generated.questions[0];assert.equal(validateG6AU02P04F35Question({...question,answerText:"999/998",answer:"999/998",finalAnswer:{canonicalText:"999/998",numerator:999,denominator:998,exact:true}}).ok,false);assert.equal(validateG6AU02P04F35Question({...question,metadata:{...question.metadata,q033RuntimeTouched:true}}).ok,false);
  const mixedPlan=buildBatchABrowserPlan({...options,selectionMode:"mixedKnowledgePointsSameUnit"}),mixed=generateG6AU02P04F35Questions({plan:mixedPlan});assert.equal(mixed.ok,false);assert.ok(mixed.errors.some(error=>error.code==="p04f35_selection_mode_invalid"));
});

test("q035 worksheet produces aligned 24Q/24A with stacked prompt and answer fractions",()=>{
  const result=buildBatchABrowserWorksheetDocument(options);assert.equal(result.ok,true,JSON.stringify(result.errors));const document=result.worksheetDocument;
  assert.equal(document.questionCount,24);assert.equal(document.generatedQuestions.length,24);assert.equal(document.answerKeyItems.length,24);assert.equal(document.questionPages.length,3);assert.equal(document.answerKeyPages.length,3);assert.equal(document.summary.numericQuestionCount,24);assert.equal(document.summary.applicationQuestionCount,0);assert.equal(document.metadata.structuredFractionDisplay,true);
  for(let index=0;index<24;index+=1){const question=document.generatedQuestions[index],model=document.questionDisplayModels[index],answer=document.answerKeyItems[index];assert.equal(model.promptText,question.blankedDisplayText);assert.equal(answer.answerText,question.answerText);assert.equal(serializeInlineMathModel(model.promptInlineMath),question.blankedDisplayText);assert.equal(serializeInlineMathModel(answer.answerInlineMath),question.answerText);const markup=renderInlineMathModel(answer.answerInlineMath,question.answerText);assert.match(markup,/math-fraction__numerator/);assert.match(markup,/math-fraction__denominator/);}
});

test("browser current compatibility pointers expose q035 without changing Node historical snapshots",async()=>{
  const originalDocument=globalThis.document;globalThis.document={};
  try{const selector=await import(`../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js?browser-q035=${Date.now()}`),binding=await import(`../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js?browser-q035=${Date.now()}`);assert.equal(selector.getVisibleBatchAKnowledgePoint(G6A_U02_P04F35_KP_ID)?.knowledgePointId,G6A_U02_P04F35_KP_ID);assert.equal(binding.resolvePublicUiCapabilityBinding(options).blocked,false);}finally{if(originalDocument===undefined)delete globalThis.document;else globalThis.document=originalDocument;}
});
