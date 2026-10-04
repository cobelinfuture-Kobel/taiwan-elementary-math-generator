import test from "node:test";
import assert from "node:assert/strict";

import {
  buildG3AU01VisualRank02Question,
  generateG3AU01VisualRank02Questions,
  G3A_U01_VISUAL_RANK02_MAX_QUESTION_COUNT,
  G3A_U01_VISUAL_RANK02_PROMPT_VARIANTS,
  validateG3AU01VisualRank02Answer,
  validateG3AU01VisualRank02Question,
} from "../../site/modules/curriculum/batch-a/g3a-u01-visual-rank02-runtime.js";
import {
  buildG3AU01VisualRank02WorksheetDocument,
} from "../../site/modules/curriculum/batch-a/g3a-u01-visual-rank02-worksheet.js";
import {
  renderWorksheetDocumentToHtml,
} from "../../site/modules/renderer/html-renderer.js";
import {
  renderIntegerNumberLine,
  validateIntegerNumberLineModel,
} from "../../site/modules/renderer/fraction-number-line.js";

test("Rank02 generates 240 deterministic unique validated number-line read variants", () => {
  const a=generateG3AU01VisualRank02Questions({
    questionCount:G3A_U01_VISUAL_RANK02_MAX_QUESTION_COUNT,
    generationSeed:"g3a-u01-rank02-stable",
  });
  const b=generateG3AU01VisualRank02Questions({
    questionCount:G3A_U01_VISUAL_RANK02_MAX_QUESTION_COUNT,
    generationSeed:"g3a-u01-rank02-stable",
  });
  assert.equal(a.ok,true,a.errors.join("\n"));
  assert.deepEqual(a.questions,b.questions);
  assert.equal(a.questions.length,240);
  assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  const counts=Object.fromEntries(G3A_U01_VISUAL_RANK02_PROMPT_VARIANTS.map(v=>[
    v,a.questions.filter(q=>q.promptVariant===v).length
  ]));
  assert.deepEqual(counts,{
    READ_SYMBOL_MARKER_VALUE:120,
    READ_ORDERED_MARKER_VALUE:120,
  });
  for(const q of a.questions){
    assert.equal(validateG3AU01VisualRank02Question(q).ok,true,q.id);
    assert.equal(validateG3AU01VisualRank02Answer(q,q.answerValue).ok,true,q.id);
    assert.equal(validateIntegerNumberLineModel(q.numberLine),true,q.id);
    assert.ok(q.numberLine.step>0);
    assert.ok(q.numberLine.tickCount>=7&&q.numberLine.tickCount<=12);
    assert.ok(q.numberLine.ticks.every((tick,index)=>
      tick.value===q.numberLine.startValue+index*q.numberLine.step
    ));
    assert.equal(q.answerValue,q.numberLine.startValue+q.numberLine.targetMarker.tickIndex*q.numberLine.step);
    assert.equal(q.metadata.selectorVisible,false);
    assert.equal(q.metadata.productionUse,"forbidden");
  }
});

test("Rank02 generator bounds question count and keeps runtime hidden", () => {
  const invalid=generateG3AU01VisualRank02Questions({questionCount:241});
  assert.equal(invalid.ok,false);
  assert.deepEqual(invalid.errors,["G3A_U01_RANK02_QUESTION_COUNT_INVALID"]);
  const one=generateG3AU01VisualRank02Questions({questionCount:1,generationSeed:"hidden-boundary"});
  assert.equal(one.ok,true);
  assert.deepEqual(one.lifecycle,{hiddenRuntime:true,selectorVisible:false,productionUse:"forbidden"});
});

test("Rank02 blocking validator fails closed on model, answer, scope, and deterministic mutation", () => {
  const q=buildG3AU01VisualRank02Question({variant:37,promptVariant:"READ_SYMBOL_MARKER_VALUE"});
  assert.equal(validateG3AU01VisualRank02Question(q).ok,true);
  assert.equal(validateG3AU01VisualRank02Answer(q,q.answerValue+1).ok,false);

  const badStep={...q,numberLine:{...q.numberLine,step:0}};
  assert.equal(validateG3AU01VisualRank02Question(badStep).ok,false);

  const badMarker={...q,numberLine:{...q.numberLine,targetMarker:{...q.numberLine.targetMarker,tickIndex:q.numberLine.tickCount}}};
  assert.equal(validateG3AU01VisualRank02Question(badMarker).ok,false);

  const badAnswer={...q,answerModel:{...q.answerModel,answerValue:q.answerValue+1}};
  assert.equal(validateG3AU01VisualRank02Question(badAnswer).ok,false);

  const badScope={...q,metadata:{...q.metadata,selectorVisible:true}};
  assert.equal(validateG3AU01VisualRank02Question(badScope).ok,false);

  const badSignature={...q,questionSignature:q.questionSignature+"|tampered"};
  assert.equal(validateG3AU01VisualRank02Question(badSignature).ok,false);
});

test("Rank02 integer renderer emits sparse anchors and a visible source-style marker", () => {
  const q=buildG3AU01VisualRank02Question({variant:11,promptVariant:"READ_ORDERED_MARKER_VALUE"});
  const html=renderIntegerNumberLine(q.numberLine);
  assert.match(html,/data-representation="integer-number-line"/);
  assert.match(html,/worksheet-number-line/);
  assert.match(html,/▼/);
  for(const anchor of q.numberLine.visibleAnchors){
    assert.match(html,new RegExp(`>${anchor.value}<`));
  }
});

test("Rank02 worksheet renders question and answer number lines through the shared HTML renderer", () => {
  const result=buildG3AU01VisualRank02WorksheetDocument({
    questionCount:12,
    generationSeed:"g3a-u01-rank02-rendered-acceptance",
    includeAnswerKey:true,
    printLayout:{paperSize:"A4",columns:2,rowsPerPage:3,showQuestionNumbers:true,showAnswerKeyPage:true},
  });
  assert.equal(result.ok,true,result.errors.join("\n"));
  const doc=result.worksheetDocument;
  assert.equal(doc.questionCount,12);
  assert.equal(doc.questionPages.length,2);
  assert.equal(doc.answerKeyPages.length,2);
  assert.equal(doc.answerKeyItems.length,12);
  assert.equal(doc.metadata.rendererPath,"site/modules/renderer/fraction-number-line.js");
  assert.equal(doc.metadata.layoutTuningStatus,"PENDING_ACTUAL_A4_REVIEW");
  const html=renderWorksheetDocumentToHtml(doc,{stylesheetHref:""});
  assert.equal((html.match(/data-representation="integer-number-line"/g)??[]).length,24);
  assert.equal((html.match(/worksheet-cell--question/g)??[]).length,12);
  assert.equal((html.match(/worksheet-cell--answer-key/g)??[]).length,12);
  assert.doesNotMatch(html,/\{[a-zA-Z][^}]*\}/);
});

test("Rank02 renderer extension does not change fraction-number-line validation semantics", async () => {
  const {validateFractionNumberLineModel}=await import("../../site/modules/renderer/fraction-number-line.js");
  const validFraction={
    kind:"fraction_number_line",
    tickCount:3,
    ticks:[
      {index:0,numerator:0,denominator:1,label:"0"},
      {index:1,numerator:1,denominator:2,label:"1/2"},
      {index:2,numerator:1,denominator:1,label:"1"},
    ],
    points:[
      {label:"A",tickIndex:1,numerator:1,denominator:2},
    ],
  };
  assert.equal(validateFractionNumberLineModel(validFraction),true);
});
