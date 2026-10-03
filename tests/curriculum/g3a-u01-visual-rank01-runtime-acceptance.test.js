import test from "node:test";
import assert from "node:assert/strict";

import {
  buildG3AU01VisualRank01Question,
  generateG3AU01VisualRank01Questions,
  G3A_U01_VISUAL_RANK01_MAX_QUESTION_COUNT,
  G3A_U01_VISUAL_RANK01_PROMPT_VARIANTS,
  validateG3AU01VisualRank01Answer,
  validateG3AU01VisualRank01Question,
} from "../../site/modules/curriculum/batch-a/g3a-u01-visual-rank01-runtime.js";
import {
  buildG3AU01VisualRank01WorksheetDocument,
} from "../../site/modules/curriculum/batch-a/g3a-u01-visual-rank01-worksheet.js";
import {
  renderWorksheetDocumentToHtml,
} from "../../site/modules/renderer/html-renderer.js";

test("Rank01 generates 240 deterministic unique validated variants across all four prompt variants", () => {
  const a=generateG3AU01VisualRank01Questions({
    questionCount:G3A_U01_VISUAL_RANK01_MAX_QUESTION_COUNT,
    generationSeed:"g3a-u01-rank01-stable",
  });
  const b=generateG3AU01VisualRank01Questions({
    questionCount:G3A_U01_VISUAL_RANK01_MAX_QUESTION_COUNT,
    generationSeed:"g3a-u01-rank01-stable",
  });
  assert.equal(a.ok,true,a.errors.join("\n"));
  assert.deepEqual(a.questions,b.questions);
  assert.equal(a.questions.length,240);
  assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  const counts=Object.fromEntries(G3A_U01_VISUAL_RANK01_PROMPT_VARIANTS.map(v=>[
    v,a.questions.filter(q=>q.promptVariant===v).length
  ]));
  assert.deepEqual(counts,{
    MAXIMUM_CATEGORY:60,
    MINIMUM_CATEGORY:60,
    COMPARE_TWO_ROWS:60,
    UNIQUE_THRESHOLD_MATCH:60,
  });
  for(const q of a.questions){
    assert.equal(validateG3AU01VisualRank01Question(q).ok,true,q.id);
    assert.equal(validateG3AU01VisualRank01Answer(q,q.answerModel.selectedCategory).ok,true,q.id);
    assert.equal(q.tableData.kind,"one_way_statistics_table");
    assert.equal(q.tableData.semanticCore,"TABLE_DATA_COMPARISON");
    assert.equal(q.tableData.chartRepresentationRendered,false);
    assert.ok(q.tableData.rows.length>=3&&q.tableData.rows.length<=8);
    assert.ok(q.tableData.rows.every(r=>Number.isInteger(r.value)&&r.value>=1000&&r.value<=9999));
    assert.equal(q.metadata.selectorVisible,false);
    assert.equal(q.metadata.productionUse,"forbidden");
  }
});

test("Rank01 generator bounds question count and keeps runtime hidden", () => {
  const invalid=generateG3AU01VisualRank01Questions({questionCount:241});
  assert.equal(invalid.ok,false);
  assert.deepEqual(invalid.errors,["G3A_U01_RANK01_QUESTION_COUNT_INVALID"]);
  const one=generateG3AU01VisualRank01Questions({questionCount:1,generationSeed:"hidden-boundary"});
  assert.equal(one.ok,true);
  assert.deepEqual(one.lifecycle,{hiddenRuntime:true,selectorVisible:false,productionUse:"forbidden"});
});

test("Rank01 blocking validator fails closed on answer, table, scope, and deterministic mutations", () => {
  const q=buildG3AU01VisualRank01Question({variant:37,promptVariant:"MAXIMUM_CATEGORY"});
  assert.equal(validateG3AU01VisualRank01Question(q).ok,true);
  assert.equal(validateG3AU01VisualRank01Answer(q,"不存在的學校").ok,false);

  const badAnswer={...q,answerModel:{...q.answerModel,selectedValue:q.answerModel.selectedValue+1}};
  assert.equal(validateG3AU01VisualRank01Question(badAnswer).ok,false);

  const rows=q.tableData.rows.map((row,i)=>i===0?{...row,value:999,displayValue:"999"}:row);
  const badTable={...q,tableData:{...q.tableData,rows}};
  assert.equal(validateG3AU01VisualRank01Question(badTable).ok,false);

  const badScope={...q,metadata:{...q.metadata,selectorVisible:true}};
  assert.equal(validateG3AU01VisualRank01Question(badScope).ok,false);

  const badSignature={...q,questionSignature:q.questionSignature+"|tampered"};
  assert.equal(validateG3AU01VisualRank01Question(badSignature).ok,false);
});

test("Rank01 comparison and threshold answers independently recompute", () => {
  const compare=buildG3AU01VisualRank01Question({variant:62,promptVariant:"COMPARE_TWO_ROWS"});
  const [aName,bName]=compare.answerModel.comparedCategories;
  const a=compare.tableData.rows.find(r=>r.category===aName);
  const b=compare.tableData.rows.find(r=>r.category===bName);
  assert.ok(a&&b&&a.value!==b.value);
  assert.equal(compare.answerModel.selectedCategory,a.value>b.value?a.category:b.category);
  assert.equal(compare.answerModel.comparisonSymbol,a.value>b.value?">":"<");

  const threshold=buildG3AU01VisualRank01Question({variant:79,promptVariant:"UNIQUE_THRESHOLD_MATCH"});
  const matches=threshold.tableData.rows.filter(r=>
    threshold.threshold.relation===">"?r.value>threshold.threshold.value:r.value<threshold.threshold.value
  );
  assert.equal(matches.length,1);
  assert.equal(threshold.answerModel.selectedCategory,matches[0].category);
  assert.equal(threshold.answerModel.selectedValue,matches[0].value);
});

test("Rank01 shared worksheet renderer emits question and answer tables with actual pagination", () => {
  const result=buildG3AU01VisualRank01WorksheetDocument({
    questionCount:12,
    generationSeed:"g3a-u01-rank01-rendered-acceptance",
    includeAnswerKey:true,
    printLayout:{paperSize:"A4",columns:2,rowsPerPage:3,showQuestionNumbers:true,showAnswerKeyPage:true},
  });
  assert.equal(result.ok,true,result.errors.join("\n"));
  const doc=result.worksheetDocument;
  assert.equal(doc.questionCount,12);
  assert.equal(doc.questionPages.length,2);
  assert.equal(doc.answerKeyPages.length,2);
  assert.equal(doc.answerKeyItems.length,12);
  assert.equal(doc.metadata.nativeRendererPath,"site/modules/renderer/one-way-statistics-table.js");
  assert.equal(doc.metadata.layoutTuningStatus,"accepted_actual_a4_2x3_no_size_change");
  const html=renderWorksheetDocumentToHtml(doc,{stylesheetHref:""});
  assert.equal((html.match(/class="worksheet-one-way-statistics-table"/g)??[]).length,24);
  assert.equal((html.match(/data-representation="one-way-statistics-table"/g)??[]).length,24);
  assert.match(html,/worksheet-page--questions/);
  assert.match(html,/worksheet-page--answer-key/);
  assert.doesNotMatch(html,/worksheet-chart/);
  assert.doesNotMatch(html,/\{[a-zA-Z][^}]*\}/);
});

test("Rank01 actual-layout sizing is accepted at A4 2x3 without renderer size change", () => {
  const result=buildG3AU01VisualRank01WorksheetDocument({
    questionCount:6,
    generationSeed:"layout-boundary",
    includeAnswerKey:true,
  });
  assert.equal(result.ok,true);
  const doc=result.worksheetDocument;
  assert.equal(doc.printOptions.columns,2);
  assert.equal(doc.printOptions.rowsPerPage,3);
  assert.equal(doc.metadata.layoutTuningStatus,"accepted_actual_a4_2x3_no_size_change");
  assert.match(doc.metadata.layoutTuningBoundary,/renewed actual-page overflow review/);
  assert.equal(doc.metadata.selectorVisible,false);
  assert.equal(doc.metadata.productionUse,"forbidden");
});
