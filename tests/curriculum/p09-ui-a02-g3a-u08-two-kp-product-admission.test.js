import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  G3A_U08_P09_A02_SOURCE_ID as SRC,
  G3A_U08_P09_A02_TARGET_KP_IDS as TARGETS,
  G3A_U08_P09_A02_WHOLE_KP_ID as WHOLE,
  G3A_U08_P09_A02_UNLIKE_KP_ID as UNLIKE,
  auditG3AU08P09A02SelectorProjection
} from "../../site/modules/curriculum/registry/g3a-u08-two-kp-selector-projection-p09-a02.js";
import {
  generateBatchABrowserQuestions,
  buildBatchABrowserPlan
} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p09-a02.js";
import {
  validateG3AU08P09A02Question,
  G3A_U08_P09_A02_INVALID_METHOD_ANSWER
} from "../../site/modules/curriculum/batch-a/g3a-u08-two-kp-runtime-p09-a02.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p09-a02-extension.js";
import {resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p09-a02.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";

const readJson=path=>JSON.parse(fs.readFileSync(path,"utf8"));
const options=(kp,count=20)=>({
  sourceId:SRC,
  selectionMode:"singleKnowledgePoint",
  selectedKnowledgePointIds:[kp],
  questionMode:"numeric",
  questionCount:count,
  ordering:"groupedByPattern",
  generationSeed:"p09-a02-focused-"+kp+"-"+count,
  includeAnswerKey:true,
  printLayout:{paperSize:"A4",columns:2,rowsPerPage:4,showQuestionNumbers:true,showAnswerKeyPage:true}
});

test("P09 A02 authority is source-backed and does not mutate R02-R05",()=>{
  const admission=readJson("data/curriculum/full-product/p09/p09-ui-a02-g3a-u08-two-kp-product-admission.json");
  const source=readJson("data/curriculum/knowledge/units/g3a_u08_3a08.knowledge-operation.json");
  assert.equal(admission.sourceAuthority.sourceNodeId,SRC);
  assert.equal(admission.sourceAuthority.semanticAuthorityMutation,false);
  assert.equal(admission.knowledgePoints.length,2);
  assert.deepEqual(admission.knowledgePoints.map(x=>x.knowledgePointId),[WHOLE,UNLIKE]);
  const wholeSource=source.knowledgePoints.find(x=>x.candidateId===WHOLE);
  const unlikeSource=source.knowledgePoints.find(x=>x.candidateId===UNLIKE);
  assert.equal(wholeSource.scope,"辨認一個完整整體可寫成 d/d。");
  assert.deepEqual(wholeSource.evidencePages,[1]);
  assert.equal(unlikeSource.scope,"辨識異分母時不可只比較分子。");
  assert.deepEqual(unlikeSource.evidencePages,[2]);
  assert.equal(source.productionBoundary.productionAdmissionAllowed,false);
  assert.equal(admission.productAdmission.p09AdmissionTarget,"PUBLIC_SINGLE_KP_PRODUCT_ADMITTED");
});

test("P09 A02 projection has exactly two KPs, two groups and four PatternSpecs",()=>{
  const audit=auditG3AU08P09A02SelectorProjection();
  assert.equal(audit.ok,true,JSON.stringify(audit.errors));
  assert.deepEqual(audit.counts,{knowledgePoints:2,patternGroups:2,patternSpecs:4});
});

for(const kp of TARGETS){
  for(const count of [1,20,120]){
    test(`P09 A02 ${kp} generates ${count} unique valid questions`,()=>{
      const result=generateBatchABrowserQuestions(options(kp,count));
      assert.equal(result.ok,true,JSON.stringify(result.errors));
      assert.equal(result.questions.length,count);
      assert.equal(new Set(result.questions.map(q=>q.blankedDisplayText)).size,count);
      assert.deepEqual([...new Set(result.questions.map(q=>q.knowledgePointId))],[kp]);
      for(const q of result.questions){
        const v=validateG3AU08P09A02Question(q);
        assert.equal(v.ok,true,JSON.stringify(v.errors));
      }
    });
  }
  test(`P09 A02 ${kp} fails closed at 121 questions`,()=>{
    const result=generateBatchABrowserQuestions(options(kp,121));
    assert.equal(result.ok,false);
    assert.ok(result.errors.some(e=>e.code==="p09_a02_question_count_invalid"));
  });
}

test("P09 A02 whole-as-fraction preserves d/d = 1 invariant",()=>{
  const result=generateBatchABrowserQuestions(options(WHOLE,120));
  assert.equal(result.ok,true,JSON.stringify(result.errors));
  assert.ok(result.questions.some(q=>q.answerRole==="WHOLE_VALUE"));
  assert.ok(result.questions.some(q=>q.answerRole!=="WHOLE_VALUE"));
  for(const q of result.questions){
    assert.equal(q.numerator,q.denominator);
    assert.equal(q.wholeValue,1);
    assert.equal(q.finalAnswer,q.answerRole==="WHOLE_VALUE"?1:q.denominator);
  }
});

test("P09 A02 unlike-denominator limit teaches method invalidity without teaching an actual comparison algorithm",()=>{
  const result=generateBatchABrowserQuestions(options(UNLIKE,120));
  assert.equal(result.ok,true,JSON.stringify(result.errors));
  for(const q of result.questions){
    assert.notEqual(q.leftDenominator,q.rightDenominator);
    assert.equal(q.proposedMethod,"COMPARE_NUMERATORS_ONLY");
    assert.equal(q.methodValid,false);
    assert.equal(q.actualFractionRelationRequested,false);
    assert.equal(q.answerText,G3A_U08_P09_A02_INVALID_METHOD_ANSWER);
    assert.equal(q.finalAnswer,"METHOD_INVALID");
  }
});

test("P09 A02 current browser selector reaches 482/482 and G3A-U08 reaches 7/7",async()=>{
  globalThis.document=Object.create(null);
  try{
    const selector=await import("../../site/modules/curriculum/registry/batch-a-selector-extension.js");
    const all=selector.listVisibleBatchAKnowledgePoints();
    const ids=all.map(x=>x.knowledgePointId);
    assert.equal(all.length,482);
    assert.equal(new Set(ids).size,482);
    for(const kp of TARGETS)assert.ok(ids.includes(kp),kp);
    const row=selector.listBatchAKnowledgePointAvailabilityBySource(SRC);
    assert.equal(row.visibleCount,7);
    assert.equal(row.hiddenPendingKnowledgePointIds.some(id=>TARGETS.includes(id)),false);
    assert.equal(row.notSelectableKnowledgePointIds.some(id=>TARGETS.includes(id)),false);
  }finally{delete globalThis.document;}
});

test("P09 A02 binding admits only bounded single-KP numeric routes",()=>{
  for(const kp of TARGETS){
    const b=resolvePublicUiCapabilityBinding({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[kp]});
    assert.equal(b.blocked,false);
    assert.equal(b.questionType,"numeric");
    assert.equal(b.questionCount.max,120);
    assert.equal(b.patternSpecIds.length,2);
    assert.equal(b.sameUnitMixedAdmission,false);
    assert.equal(b.crossUnitMixedAdmission,false);
  }
  const mixed=resolvePublicUiCapabilityBinding({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[WHOLE,UNLIKE]});
  assert.equal(mixed.blocked,true);
  assert.ok(mixed.errors.some(e=>e.code==="P09_A02_MIXED_NOT_ADMITTED"));
});

for(const kp of TARGETS){
  test(`P09 A02 ${kp} worksheet/answer/HTML contract`,()=>{
    const result=buildBatchABrowserWorksheetDocument(options(kp,20));
    assert.equal(result.ok,true,JSON.stringify(result.errors));
    const doc=result.worksheetDocument;
    assert.equal(doc.generatedQuestions.length,20);
    assert.equal(doc.answerKeyItems.length,20);
    assert.equal(doc.questionCount,20);
    assert.equal(doc.metadata.knowledgePointId,kp);
    assert.equal(doc.metadata.applicationContextUsed,false);
    assert.equal(doc.metadata.sameUnitMixedUsed,false);
    const html=renderWorksheetDocumentToHtml(doc,{stylesheetHref:"./assets/styles/print-styles.css"});
    assert.match(html,/worksheet-document/);
    assert.equal(html.includes("<script>"),false);
    if(kp===WHOLE)assert.match(html,/math-fraction/);
    if(kp===UNLIKE)assert.match(html,/只比較分子/);
  });
}

test("P09 A02 browser plan remains bounded and does not admit mixed modes",()=>{
  const plan=buildBatchABrowserPlan(options(WHOLE,20));
  assert.equal(plan.questionCountMax,120);
  assert.equal(plan.genericFallback,false);
  assert.equal(plan.freeFormAI,false);
  assert.equal(plan.sameUnitMixedMode,"NOT_ADMITTED");
  assert.equal(plan.crossUnitMixedMode,"NOT_ADMITTED");
  assert.equal(plan.sharedRuntimeScope,"SHARED_RUNTIME_BOUNDED");
});
