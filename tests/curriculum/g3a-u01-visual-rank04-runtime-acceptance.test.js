import test from "node:test";
import assert from "node:assert/strict";

import {
  buildG3AU01VisualRank04Question,
  generateG3AU01VisualRank04Questions,
  G3A_U01_VISUAL_RANK04_MAX_QUESTION_COUNT,
  validateG3AU01VisualRank04Answer,
  validateG3AU01VisualRank04Question,
} from "../../site/modules/curriculum/batch-a/g3a-u01-visual-rank04-runtime.js";
import {
  buildG3AU01VisualRank04WorksheetDocument,
} from "../../site/modules/curriculum/batch-a/g3a-u01-visual-rank04-worksheet.js";
import {
  renderWorksheetDocumentToHtml,
} from "../../site/modules/renderer/html-renderer.js";
import {
  renderIntegerNumberLine,
  validateIntegerNumberLineModel,
} from "../../site/modules/renderer/fraction-number-line.js";

test("Rank04 generates 240 deterministic unique validated COMPLETE_MISSING_TICK_VALUES variants",()=>{
  const a=generateG3AU01VisualRank04Questions({
    questionCount:G3A_U01_VISUAL_RANK04_MAX_QUESTION_COUNT,
    generationSeed:"g3a-u01-rank04-stable",
  });
  const b=generateG3AU01VisualRank04Questions({
    questionCount:G3A_U01_VISUAL_RANK04_MAX_QUESTION_COUNT,
    generationSeed:"g3a-u01-rank04-stable",
  });
  assert.equal(a.ok,true,a.errors.join("\n"));
  assert.deepEqual(a.questions,b.questions);
  assert.equal(a.questions.length,240);
  assert.equal(new Set(a.questions.map((q)=>q.questionSignature)).size,240);

  const missingCounts=new Set();
  for(const q of a.questions){
    assert.equal(validateG3AU01VisualRank04Question(q).ok,true,q.id);
    assert.equal(validateG3AU01VisualRank04Answer(q,q.answerModel.missingValues).ok,true,q.id);
    assert.equal(validateG3AU01VisualRank04Answer(q,q.answerText).ok,true,q.id);
    assert.equal(validateG3AU01VisualRank04Answer(q,{missingValues:q.answerModel.missingValues}).ok,true,q.id);
    assert.equal(validateIntegerNumberLineModel(q.questionNumberLine),true,q.id);
    assert.equal(validateIntegerNumberLineModel(q.answerNumberLine),true,q.id);
    assert.equal(q.questionNumberLine.markerPolicy,"forbidden");
    assert.equal(q.answerNumberLine.markerPolicy,"forbidden");
    assert.equal(q.questionNumberLine.targetMarker,undefined);
    assert.equal(q.answerNumberLine.targetMarker,undefined);
    assert.equal(q.answerNumberLine.visibleAnchors.length,q.answerNumberLine.tickCount);
    assert.equal(
      q.questionNumberLine.visibleAnchors.length,
      q.questionNumberLine.tickCount-q.missingTickIndices.length,
    );
    assert.ok(q.missingTickIndices.every((index)=>!q.questionNumberLine.visibleAnchors.some((a)=>a.tickIndex===index)));
    assert.deepEqual(
      q.answerModel.missingValues,
      q.missingTickIndices.map((index)=>q.questionNumberLine.startValue+index*q.questionNumberLine.step),
    );
    assert.equal(q.metadata.selectorVisible,false);
    assert.equal(q.metadata.productionUse,"forbidden");
    missingCounts.add(q.missingTickIndices.length);
  }
  assert.deepEqual([...missingCounts].sort(),[1,2,3]);
});

test("Rank04 generator remains bounded and hidden before public cutover",()=>{
  const invalid=generateG3AU01VisualRank04Questions({questionCount:241});
  assert.equal(invalid.ok,false);
  assert.deepEqual(invalid.errors,["G3A_U01_RANK04_QUESTION_COUNT_INVALID"]);

  const one=generateG3AU01VisualRank04Questions({
    questionCount:1,
    generationSeed:"rank04-hidden-boundary",
  });
  assert.equal(one.ok,true);
  assert.deepEqual(one.lifecycle,{
    hiddenRuntime:true,
    selectorVisible:false,
    productionUse:"forbidden",
  });
});

test("Rank04 blocking validator fails closed on leaked labels, missing answer labels, wrong values and geometry mismatch",()=>{
  const q=buildG3AU01VisualRank04Question({variant:37});
  assert.equal(validateG3AU01VisualRank04Question(q).ok,true);

  const leakedIndex=q.missingTickIndices[0];
  const leakedValue=q.questionNumberLine.startValue+leakedIndex*q.questionNumberLine.step;
  const leaked={
    ...q,
    questionNumberLine:{
      ...q.questionNumberLine,
      visibleAnchors:[
        ...q.questionNumberLine.visibleAnchors,
        {tickIndex:leakedIndex,value:leakedValue},
      ].sort((a,b)=>a.tickIndex-b.tickIndex),
    },
  };
  assert.equal(validateG3AU01VisualRank04Question(leaked).ok,false);

  const missingAnswer={
    ...q,
    answerNumberLine:{
      ...q.answerNumberLine,
      visibleAnchors:q.answerNumberLine.visibleAnchors.filter((a)=>a.tickIndex!==leakedIndex),
    },
  };
  assert.equal(validateG3AU01VisualRank04Question(missingAnswer).ok,false);

  const wrongAnswer={
    ...q,
    answerModel:{
      ...q.answerModel,
      missingValues:q.answerModel.missingValues.map((value,index)=>index===0?value+1:value),
    },
  };
  assert.equal(validateG3AU01VisualRank04Question(wrongAnswer).ok,false);

  const mismatchedScale={
    ...q,
    answerNumberLine:{
      ...q.answerNumberLine,
      startValue:q.answerNumberLine.startValue+q.answerNumberLine.step,
    },
  };
  assert.equal(validateG3AU01VisualRank04Question(mismatchedScale).ok,false);

  const badSignature={...q,questionSignature:q.questionSignature+"|tampered"};
  assert.equal(validateG3AU01VisualRank04Question(badSignature).ok,false);
  assert.equal(validateG3AU01VisualRank04Answer(q,[...q.answerModel.missingValues].reverse()).ok,q.answerModel.missingValues.length===1);
});

test("Rank04 uses sparse question labels and fully restored answer labels with the existing renderer",()=>{
  const q=buildG3AU01VisualRank04Question({variant:11});
  const questionHtml=renderIntegerNumberLine(q.questionNumberLine);
  const answerHtml=renderIntegerNumberLine(q.answerNumberLine);
  assert.match(questionHtml,/data-marker-policy="forbidden"/);
  assert.match(answerHtml,/data-marker-policy="forbidden"/);
  assert.doesNotMatch(questionHtml,/data-answer-marker="true"/);
  assert.doesNotMatch(answerHtml,/data-answer-marker="true"/);
  for(const index of q.missingTickIndices){
    const value=q.questionNumberLine.startValue+index*q.questionNumberLine.step;
    assert.doesNotMatch(questionHtml,new RegExp(`>${value}<`));
    assert.match(answerHtml,new RegExp(`>${value}<`));
  }
});

test("Rank04 hidden worksheet projects sparse question scales and completed answer scales",()=>{
  const result=buildG3AU01VisualRank04WorksheetDocument({
    questionCount:12,
    generationSeed:"g3a-u01-rank04-hidden-worksheet",
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
  assert.equal(doc.metadata.answerMarkerPolicy,"forbidden");
  assert.ok(doc.questionDisplayModels.every((row)=>
    row.numberLine.visibleAnchors.length===row.numberLine.tickCount-row.layoutHints.missingLabelCount
  ));
  assert.ok(doc.answerKeyItems.every((row)=>row.numberLine.visibleAnchors.length===row.numberLine.tickCount));

  const html=renderWorksheetDocumentToHtml(doc,{stylesheetHref:""});
  const answerStart=html.indexOf("worksheet-section--answer-key");
  assert.notEqual(answerStart,-1);
  const questionHtml=html.slice(0,answerStart);
  const answerHtml=html.slice(answerStart);
  assert.equal((questionHtml.match(/data-representation="integer-number-line"/g)??[]).length,12);
  assert.equal((answerHtml.match(/data-representation="integer-number-line"/g)??[]).length,12);
  assert.equal((html.match(/data-answer-marker="true"/g)??[]).length,0);
  assert.equal((html.match(/worksheet-cell--question/g)??[]).length,12);
  assert.equal((html.match(/worksheet-cell--answer-key/g)??[]).length,12);
});

test("Rank04 leaf runtime preserves Rank02 and Rank03 number-line contracts",async()=>{
  const {buildG3AU01VisualRank02Question,validateG3AU01VisualRank02Question}=await import(
    "../../site/modules/curriculum/batch-a/g3a-u01-visual-rank02-runtime.js"
  );
  const {buildG3AU01VisualRank03Question,validateG3AU01VisualRank03Question}=await import(
    "../../site/modules/curriculum/batch-a/g3a-u01-visual-rank03-runtime.js"
  );
  const rank02=buildG3AU01VisualRank02Question({variant:19,promptVariant:"READ_SYMBOL_MARKER_VALUE"});
  const rank03=buildG3AU01VisualRank03Question({variant:19});
  assert.equal(validateG3AU01VisualRank02Question(rank02).ok,true);
  assert.equal(validateG3AU01VisualRank03Question(rank03).ok,true);
  assert.equal(validateIntegerNumberLineModel(rank02.numberLine),true);
  assert.equal(validateIntegerNumberLineModel(rank03.questionNumberLine),true);
});
