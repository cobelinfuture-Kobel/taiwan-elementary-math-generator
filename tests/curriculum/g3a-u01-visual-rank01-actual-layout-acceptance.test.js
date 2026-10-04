import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { buildG3AU01VisualRank01WorksheetDocument } from "../../site/modules/curriculum/batch-a/g3a-u01-visual-rank01-worksheet.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";

const CONTRACT_PATH = new URL("../../data/curriculum/pattern_specs/g3a_u01_visual_rank01_one_way_table_compare.v1.json", import.meta.url);
const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));

test("Rank01 actual A4 layout review accepts native size and rejects larger pilot sizing", () => {
  assert.equal(contract.lifecycle.layoutTuningStatus, "PASS_NO_SIZE_CHANGE_REQUIRED");
  assert.equal(contract.layoutAcceptance.reviewDecision, "PASS_NO_SIZE_CHANGE_REQUIRED");
  assert.deepEqual(contract.layoutAcceptance.reviewedLayout, {
    paperSize:"A4",
    columns:2,
    rowsPerPage:3,
    questionCellsPerPage:6,
    answerCellsPerPage:6,
    sourceRenderer:"site/modules/renderer/one-way-statistics-table.js"
  });
  assert.deepEqual(contract.layoutAcceptance.reviewedDensity.tableRowCounts, [3,4,5,6,7,8]);
  assert.equal(contract.layoutAcceptance.reviewedDensity.questionPage, "PASS_NO_OVERFLOW");
  assert.equal(contract.layoutAcceptance.reviewedDensity.answerPage, "PASS_NO_OVERFLOW");
  assert.equal(contract.layoutAcceptance.reviewedDensity.eightRowWorstCase, "PASS_AT_CURRENT_RENDERER_SIZE");
  assert.equal(contract.layoutAcceptance.currentRendererSize.tableFontSize, "0.9em");
  assert.equal(contract.layoutAcceptance.currentRendererSize.cellPadding, ".2rem .35rem");
  assert.equal(contract.layoutAcceptance.rejectedLargerTrial.result, "FAIL_EIGHT_ROW_BOTTOM_OVERFLOW");
  assert.equal(contract.layoutAcceptance.tuningAction, "NO_RENDERER_SIZE_CHANGE");
});

test("Rank01 default worksheet preserves accepted A4 2x3 pagination and exercises the 8-row worst case", () => {
  const result=buildG3AU01VisualRank01WorksheetDocument({
    questionCount:6,
    generationSeed:"g3a-u01-rank01-rendered-acceptance",
    includeAnswerKey:true
  });
  assert.equal(result.ok,true,result.errors.join("\n"));
  const doc=result.worksheetDocument;
  assert.equal(doc.printOptions.paperSize,"A4");
  assert.equal(doc.printOptions.columns,2);
  assert.equal(doc.printOptions.rowsPerPage,3);
  assert.equal(doc.questionPages.length,1);
  assert.equal(doc.answerKeyPages.length,1);
  assert.deepEqual(
    doc.questionDisplayModels.map(row=>row.tableData.rows.length).sort((a,b)=>a-b),
    [3,4,5,6,7,8]
  );
  assert.ok(doc.questionDisplayModels.some(row=>row.tableData.rows.length===8));
  assert.equal(doc.metadata.layoutTuningStatus,"accepted_actual_a4_2x3_no_size_change");
  assert.match(doc.metadata.layoutTuningBoundary,/renewed actual-page overflow review/);
  const html=renderWorksheetDocumentToHtml(doc,{stylesheetHref:""});
  assert.equal((html.match(/data-representation="one-way-statistics-table"/g)??[]).length,12);
});

test("Rank01 public layout safety caps dense global modes before pagination", () => {
  const cases = [
    { requested:[1,7], expected:[1,4], questionCount:4 },
    { requested:[2,6], expected:[2,3], questionCount:6 },
    { requested:[3,5], expected:[3,2], questionCount:6 },
  ];
  for (const entry of cases) {
    const result=buildG3AU01VisualRank01WorksheetDocument({
      publicAdmission:true,
      selectionMode:"singleKnowledgePoint",
      questionCount:entry.questionCount,
      generationSeed:"g3a-u01-rank01-layout-review",
      includeAnswerKey:true,
      printLayout:{
        paperSize:"A4",
        columns:entry.requested[0],
        rowsPerPage:entry.requested[1],
        showQuestionNumbers:true,
        showAnswerKeyPage:true
      }
    });
    assert.equal(result.ok,true,result.errors.join("\n"));
    assert.equal(result.worksheetDocument.printOptions.columns,entry.expected[0]);
    assert.equal(result.worksheetDocument.printOptions.rowsPerPage,entry.expected[1]);
    assert.equal(result.worksheetDocument.questionPages.length,1);
    assert.equal(result.worksheetDocument.answerKeyPages.length,1);
    assert.ok(result.worksheetDocument.questionDisplayModels.some(row=>row.tableData.rows.length===8));
    assert.equal(result.warnings.length,1);
    assert.equal(result.warnings[0].code,"G3A_U01_RANK01_LAYOUT_SAFETY_ADJUSTED");
  }
});

test("Rank01 public safe-boundary modes remain unchanged", () => {
  for (const [columns,rowsPerPage] of [[1,4],[2,3],[3,2]]) {
    const result=buildG3AU01VisualRank01WorksheetDocument({
      publicAdmission:true,
      questionCount:columns*rowsPerPage,
      generationSeed:"g3a-u01-rank01-layout-review",
      includeAnswerKey:false,
      printLayout:{paperSize:"A4",columns,rowsPerPage}
    });
    assert.equal(result.ok,true,result.errors.join("\n"));
    assert.equal(result.worksheetDocument.printOptions.columns,columns);
    assert.equal(result.worksheetDocument.printOptions.rowsPerPage,rowsPerPage);
    assert.equal(result.warnings.length,0);
    assert.equal(result.worksheetDocument.questionPages.length,1);
  }
});

test("Rank01 layout acceptance changes no mathematics, generator, validator, selector, or production status", () => {
  assert.equal(contract.layoutAcceptance.mathematicsChanged,false);
  assert.equal(contract.layoutAcceptance.generatorChanged,false);
  assert.equal(contract.layoutAcceptance.validatorChanged,false);
  assert.equal(contract.layoutAcceptance.selectorVisible,false);
  assert.equal(contract.layoutAcceptance.productionUse,"forbidden");
  assert.equal(contract.rendererBinding.noRendererCodeChangeRequired,true);
});
