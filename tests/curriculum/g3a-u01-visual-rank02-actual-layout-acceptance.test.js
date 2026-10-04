import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { buildG3AU01VisualRank02WorksheetDocument } from "../../site/modules/curriculum/batch-a/g3a-u01-visual-rank02-worksheet.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";

const CONTRACT_PATH = new URL("../../data/curriculum/pattern_specs/g3a_u01_visual_rank02_integer_number_line_read_value.v1.json", import.meta.url);
const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));

test("Rank02 actual A4 acceptance locks the 2x3 number-line layout without renderer resizing", () => {
  assert.equal(contract.layoutAcceptance.reviewDecision, "PASS_NO_SIZE_CHANGE_REQUIRED");
  assert.deepEqual(contract.layoutAcceptance.reviewedLayout, {
    paperSize:"A4",
    columns:2,
    rowsPerPage:3,
    questionCellsPerPage:6,
    answerCellsPerPage:6,
    sourceRenderer:"site/modules/renderer/fraction-number-line.js",
    representation:"integer-number-line"
  });
  assert.deepEqual(contract.layoutAcceptance.reviewedDensity.tickCounts, [7,8,9,10,11,12]);
  assert.equal(contract.layoutAcceptance.reviewedDensity.questionPage, "PASS_NO_OVERFLOW");
  assert.equal(contract.layoutAcceptance.reviewedDensity.answerPage, "PASS_NO_OVERFLOW");
  assert.equal(contract.layoutAcceptance.reviewedDensity.twelveTickWorstCase, "PASS_AT_CURRENT_RENDERER_SIZE");
  assert.equal(contract.layoutAcceptance.tuningAction, "NO_RENDERER_SIZE_CHANGE");
});

test("Rank02 60-item acceptance cohort exercises every supported tick-density band", () => {
  const result=buildG3AU01VisualRank02WorksheetDocument({
    questionCount:60,
    generationSeed:"g3a-u01-rank02-layout-density",
    includeAnswerKey:true,
    printLayout:{paperSize:"A4",columns:2,rowsPerPage:3,showQuestionNumbers:true,showAnswerKeyPage:true}
  });
  assert.equal(result.ok,true,result.errors.join("\n"));
  const doc=result.worksheetDocument;
  assert.equal(doc.questionCount,60);
  assert.equal(doc.questionPages.length,10);
  assert.equal(doc.answerKeyPages.length,10);
  assert.deepEqual(
    [...new Set(doc.questionDisplayModels.map(row=>row.numberLine.tickCount))].sort((a,b)=>a-b),
    [7,8,9,10,11,12]
  );
  assert.ok(doc.questionDisplayModels.some(row=>row.numberLine.tickCount===12));
  assert.equal(doc.printOptions.columns,2);
  assert.equal(doc.printOptions.rowsPerPage,3);
  const html=renderWorksheetDocumentToHtml(doc,{stylesheetHref:""});
  assert.equal((html.match(/data-representation="integer-number-line"/g)??[]).length,120);
});

test("Rank02 layout acceptance leaves mathematics, generator, validator, selector and Rank03+ boundaries unchanged", () => {
  assert.equal(contract.layoutAcceptance.mathematicsChanged,false);
  assert.equal(contract.layoutAcceptance.generatorChanged,false);
  assert.equal(contract.layoutAcceptance.validatorChanged,false);
  assert.equal(contract.layoutAcceptance.selectorVisible,false);
  assert.equal(contract.layoutAcceptance.productionUse,"forbidden");
  assert.equal(contract.lifecycle.selectorVisible,false);
  assert.equal(contract.lifecycle.productionUse,"forbidden");
  assert.deepEqual(contract.rendererBinding.explicitlyDeferredRank03PlusFeatures,[
    "learner_marks_given_value",
    "complete_missing_scale_labels",
    "multi_position_matching",
    "movement_segments"
  ]);
});
