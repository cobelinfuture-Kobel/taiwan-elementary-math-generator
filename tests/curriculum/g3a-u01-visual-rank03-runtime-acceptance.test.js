import test from "node:test";
import assert from "node:assert/strict";

import {
  buildG3AU01VisualRank03Question,
  generateG3AU01VisualRank03Questions,
  G3A_U01_VISUAL_RANK03_MAX_QUESTION_COUNT,
  validateG3AU01VisualRank03Answer,
  validateG3AU01VisualRank03Question,
} from "../../site/modules/curriculum/batch-a/g3a-u01-visual-rank03-runtime.js";
import {
  buildG3AU01VisualRank03WorksheetDocument,
} from "../../site/modules/curriculum/batch-a/g3a-u01-visual-rank03-worksheet.js";
import {
  renderWorksheetDocumentToHtml,
} from "../../site/modules/renderer/html-renderer.js";
import {
  renderIntegerNumberLine,
  validateFractionNumberLineModel,
  validateIntegerNumberLineModel,
} from "../../site/modules/renderer/fraction-number-line.js";

test("Rank03 generates 240 deterministic unique validated MARK_GIVEN_VALUE variants",()=>{
  const a=generateG3AU01VisualRank03Questions({
    questionCount:G3A_U01_VISUAL_RANK03_MAX_QUESTION_COUNT,
    generationSeed:"g3a-u01-rank03-stable",
  });
  const b=generateG3AU01VisualRank03Questions({
    questionCount:G3A_U01_VISUAL_RANK03_MAX_QUESTION_COUNT,
    generationSeed:"g3a-u01-rank03-stable",
  });
  assert.equal(a.ok,true,a.errors.join("\n"));
  assert.deepEqual(a.questions,b.questions);
  assert.equal(a.questions.length,240);
  assert.equal(new Set(a.questions.map((q)=>q.questionSignature)).size,240);

  for(const q of a.questions){
    assert.equal(validateG3AU01VisualRank03Question(q).ok,true,q.id);
    assert.equal(validateG3AU01VisualRank03Answer(q,q.answerModel.targetTickIndex).ok,true,q.id);
    assert.equal(validateG3AU01VisualRank03Answer(q,{targetTickIndex:q.answerModel.targetTickIndex}).ok,true,q.id);
    assert.equal(validateIntegerNumberLineModel(q.questionNumberLine),true,q.id);
    assert.equal(validateIntegerNumberLineModel(q.answerNumberLine),true,q.id);
    assert.equal(q.questionNumberLine.markerPolicy,"forbidden");
    assert.equal(q.questionNumberLine.targetMarker,undefined);
    assert.equal(q.answerNumberLine.markerPolicy,"required");
    assert.ok(q.answerNumberLine.targetMarker);
    assert.equal(q.answerNumberLine.targetMarker.tickIndex,q.answerModel.targetTickIndex);
    assert.equal(q.targetValue,q.questionNumberLine.startValue+q.answerModel.targetTickIndex*q.questionNumberLine.step);
    assert.equal((q.targetValue-q.questionNumberLine.startValue)%q.questionNumberLine.step,0);
    assert.equal(q.metadata.selectorVisible,false);
    assert.equal(q.metadata.productionUse,"forbidden");
  }
});

test("Rank03 generator remains bounded and hidden before public cutover",()=>{
  const invalid=generateG3AU01VisualRank03Questions({questionCount:241});
  assert.equal(invalid.ok,false);
  assert.deepEqual(invalid.errors,["G3A_U01_RANK03_QUESTION_COUNT_INVALID"]);

  const one=generateG3AU01VisualRank03Questions({
    questionCount:1,
    generationSeed:"rank03-hidden-boundary",
  });
  assert.equal(one.ok,true);
  assert.deepEqual(one.lifecycle,{
    hiddenRuntime:true,
    selectorVisible:false,
    productionUse:"forbidden",
  });
});

test("Rank03 blocking validator fails closed on answer leakage, wrong overlay, illegal target and scale mismatch",()=>{
  const q=buildG3AU01VisualRank03Question({variant:37});
  assert.equal(validateG3AU01VisualRank03Question(q).ok,true);

  const leaked={
    ...q,
    questionNumberLine:{
      ...q.questionNumberLine,
      markerPolicy:"required",
      targetMarker:{...q.answerNumberLine.targetMarker},
    },
  };
  assert.equal(validateG3AU01VisualRank03Question(leaked).ok,false);

  const missingAnswerMarker={
    ...q,
    answerNumberLine:{
      ...q.answerNumberLine,
      markerPolicy:"forbidden",
      targetMarker:undefined,
    },
  };
  assert.equal(validateG3AU01VisualRank03Question(missingAnswerMarker).ok,false);

  const wrongOverlay={
    ...q,
    answerNumberLine:{
      ...q.answerNumberLine,
      targetMarker:{
        ...q.answerNumberLine.targetMarker,
        tickIndex:(q.answerModel.targetTickIndex+1)%q.answerNumberLine.tickCount,
      },
    },
  };
  assert.equal(validateG3AU01VisualRank03Question(wrongOverlay).ok,false);

  const illegalTarget={...q,targetValue:q.targetValue+1};
  if(q.questionNumberLine.step!==1){
    assert.equal(validateG3AU01VisualRank03Question(illegalTarget).ok,false);
  }

  const mismatchedScale={
    ...q,
    answerNumberLine:{
      ...q.answerNumberLine,
      startValue:q.answerNumberLine.startValue+q.answerNumberLine.step,
    },
  };
  assert.equal(validateG3AU01VisualRank03Question(mismatchedScale).ok,false);

  const badSignature={...q,questionSignature:q.questionSignature+"|tampered"};
  assert.equal(validateG3AU01VisualRank03Question(badSignature).ok,false);

  assert.equal(validateG3AU01VisualRank03Answer(q,q.answerModel.targetTickIndex+1).ok,false);
});

test("integer number-line renderer supports marker-free questions while preserving Rank02 required-marker default",()=>{
  const q=buildG3AU01VisualRank03Question({variant:11});
  const questionHtml=renderIntegerNumberLine(q.questionNumberLine);
  const answerHtml=renderIntegerNumberLine(q.answerNumberLine);
  assert.match(questionHtml,/data-marker-policy="forbidden"/);
  assert.doesNotMatch(questionHtml,/data-answer-marker="true"/);
  assert.doesNotMatch(questionHtml,/▼/);
  assert.match(answerHtml,/data-marker-policy="required"/);
  assert.match(answerHtml,/data-answer-marker="true"/);
  assert.match(answerHtml,/▼/);

  const rank02Compatible={
    ...q.answerNumberLine,
    markerPolicy:undefined,
  };
  assert.equal(validateIntegerNumberLineModel(rank02Compatible),true);
  assert.match(renderIntegerNumberLine(rank02Compatible),/data-marker-policy="required"/);
});

test("Rank03 hidden worksheet keeps question scale marker-free and answer scale marked",()=>{
  const result=buildG3AU01VisualRank03WorksheetDocument({
    questionCount:12,
    generationSeed:"g3a-u01-rank03-hidden-worksheet",
    includeAnswerKey:true,
    printLayout:{
      paperSize:"A4",
      columns:2,
      rowsPerPage:3,
      showQuestionNumbers:true,
      showAnswerKeyPage:true,
    },
  });
  assert.equal(result.ok,true,result.errors.join("\n"));
  const doc=result.worksheetDocument;
  assert.equal(doc.questionCount,12);
  assert.equal(doc.questionPages.length,2);
  assert.equal(doc.answerKeyPages.length,2);
  assert.equal(doc.answerKeyItems.length,12);
  assert.equal(doc.metadata.hiddenRuntime,true);
  assert.equal(doc.metadata.selectorVisible,false);
  assert.equal(doc.metadata.productionUse,"forbidden");
  assert.equal(doc.metadata.questionMarkerPolicy,"forbidden");
  assert.equal(doc.metadata.answerMarkerPolicy,"required");
  assert.ok(doc.questionDisplayModels.every((row)=>row.numberLine.markerPolicy==="forbidden"&&!row.numberLine.targetMarker));
  assert.ok(doc.answerKeyItems.every((row)=>row.numberLine.markerPolicy==="required"&&row.numberLine.targetMarker));

  const html=renderWorksheetDocumentToHtml(doc,{stylesheetHref:""});
  const answerStart=html.indexOf("worksheet-section--answer-key");
  assert.notEqual(answerStart,-1);
  const questionHtml=html.slice(0,answerStart);
  const answerHtml=html.slice(answerStart);
  assert.equal((questionHtml.match(/data-representation="integer-number-line"/g)??[]).length,12);
  assert.equal((answerHtml.match(/data-representation="integer-number-line"/g)??[]).length,12);
  assert.equal((questionHtml.match(/data-answer-marker="true"/g)??[]).length,0);
  assert.equal((answerHtml.match(/data-answer-marker="true"/g)??[]).length,12);
  assert.equal((html.match(/worksheet-cell--question/g)??[]).length,12);
  assert.equal((html.match(/worksheet-cell--answer-key/g)??[]).length,12);
});

test("Rank03 renderer extension preserves fraction and Rank02 number-line contracts",async()=>{
  const validFraction={
    kind:"fraction_number_line",
    tickCount:3,
    ticks:[
      {index:0,numerator:0,denominator:1,label:"0"},
      {index:1,numerator:1,denominator:2,label:"1/2"},
      {index:2,numerator:1,denominator:1,label:"1"},
    ],
    points:[{label:"A",tickIndex:1,numerator:1,denominator:2}],
  };
  assert.equal(validateFractionNumberLineModel(validFraction),true);

  const {buildG3AU01VisualRank02Question,validateG3AU01VisualRank02Question}=await import(
    "../../site/modules/curriculum/batch-a/g3a-u01-visual-rank02-runtime.js"
  );
  const rank02=buildG3AU01VisualRank02Question({variant:19,promptVariant:"READ_SYMBOL_MARKER_VALUE"});
  assert.equal(validateG3AU01VisualRank02Question(rank02).ok,true);
  assert.equal(validateIntegerNumberLineModel(rank02.numberLine),true);
  assert.match(renderIntegerNumberLine(rank02.numberLine),/data-answer-marker="true"/);
});
