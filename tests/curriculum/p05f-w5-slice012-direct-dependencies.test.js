import test from "node:test";
import assert from "node:assert/strict";

import {buildBatchABrowserWorksheetDocument as buildStableWorksheet} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import {buildBatchABrowserPlan as buildP05F12Plan,requestsP05F12} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f12.js";
import {buildBatchABrowserPlan as buildP05F3Plan,requestsP05F3} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f3.js";
import {generateG3BU05P05F3Questions,validateG3BU05P05F3Question} from "../../site/modules/curriculum/batch-a/g3b-u05-square-centimeter-unit-runtime-p05f3.js";
import {G3B_U05_P05F3_KP_ID} from "../../site/modules/curriculum/registry/g3b-u05-square-centimeter-unit-selector-projection-p05f3.js";
import {G3B_U05_P05F12_KP_ID,G3B_U05_P05F12_SOURCE_ID} from "../../site/modules/curriculum/registry/g3b-u05-area-grid-counting-selector-projection-p05f12.js";
import {listBatchAKnowledgePointAvailabilityBySource} from "../../site/modules/curriculum/registry/batch-a-selector-p05f12-extension.js";

const sourceUnitOptions=Object.freeze({
  sourceId:G3B_U05_P05F12_SOURCE_ID,
  selectionMode:"sourceUnit",
  questionCount:8,
  generationSeed:"q012-q003-source-unit-protection",
  includeAnswerKey:true,
  printLayout:{columns:2,rowsPerPage:4,showAnswerKeyPage:true},
});

test("P05F W5 Q012 does not steal the G3B-U05 sourceUnit route from shipped Q003",()=>{
  assert.equal(requestsP05F12(sourceUnitOptions),false);
  assert.equal(requestsP05F3(sourceUnitOptions),true);
  const q003Plan=buildP05F3Plan(sourceUnitOptions);
  const throughQ012=buildP05F12Plan(sourceUnitOptions);
  assert.equal(q003Plan.selectionMode,"sourceUnit");
  assert.deepEqual(q003Plan.selectedKnowledgePointIds,[G3B_U05_P05F3_KP_ID]);
  assert.deepEqual(throughQ012.selectedKnowledgePointIds,[G3B_U05_P05F3_KP_ID]);
  assert.equal(throughQ012.selectionMode,"sourceUnit");
  assert.equal(throughQ012.publicControls.productAdmissionTask,"P05F_W5DirectProductVerticalSlice003Implementation");
});

test("P05F W5 Q012 stable worksheet entry still resolves G3B-U05 sourceUnit through Q003",()=>{
  const result=buildStableWorksheet(sourceUnitOptions);
  assert.equal(result.ok,true,result.errors?.join(","));
  assert.equal(result.p05f3Implemented,true);
  assert.notEqual(result.p05f12Implemented,true);
  assert.equal(result.worksheetDocument.metadata.taskId,"P05F_W5DirectProductVerticalSlice003Implementation");
  assert.equal(result.worksheetDocument.metadata.knowledgePointId,G3B_U05_P05F3_KP_ID);
  assert.equal(result.worksheetDocument.metadata.gridCountingUsed,false);
  assert.equal(result.worksheetDocument.questionCount,8);
  for(const question of result.worksheetDocument.generatedQuestions){
    assert.equal(question.knowledgePointId,G3B_U05_P05F3_KP_ID);
    assert.equal(validateG3BU05P05F3Question(question).ok,true);
    assert.equal(question.metadata.gridCountingUsed,false);
  }
});

test("P05F W5 Q012 leaves the original Q003 generator and validator semantics intact",()=>{
  const generated=generateG3BU05P05F3Questions({questionCount:24,generationSeed:"q012-q003-direct-proof"});
  assert.equal(generated.ok,true);
  assert.equal(generated.questions.length,24);
  assert.equal(new Set(generated.questions.map(q=>q.questionSignature)).size,24);
  for(const question of generated.questions){
    assert.equal(question.knowledgePointId,G3B_U05_P05F3_KP_ID);
    assert.equal(validateG3BU05P05F3Question(question).ok,true);
    assert.equal(question.metadata.gridCountingUsed,false);
    assert.equal(question.metadata.applicationContextUsed,false);
  }
});

test("P05F W5 Q012 explicit single-KP selection is admitted without exposing later area siblings",()=>{
  const q012Options={sourceId:G3B_U05_P05F12_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G3B_U05_P05F12_KP_ID],questionCount:8};
  assert.equal(requestsP05F12(q012Options),true);
  const plan=buildP05F12Plan(q012Options);
  assert.deepEqual(plan.selectedKnowledgePointIds,[G3B_U05_P05F12_KP_ID]);
  assert.equal(plan.questionMode,"diagram");
  const source=listBatchAKnowledgePointAvailabilityBySource(G3B_U05_P05F12_SOURCE_ID);
  assert.deepEqual(source.visibleKnowledgePointIds.sort(),[G3B_U05_P05F3_KP_ID,G3B_U05_P05F12_KP_ID].sort());
  for(const sibling of ["kp_area_conservation_cut_rearrange","kp_irregular_grid_area","kp_area_compare_same_perimeter"]){
    assert.equal(source.visibleKnowledgePointIds.includes(sibling),false);
    assert.ok(source.hiddenPendingKnowledgePointIds.includes(sibling));
    assert.ok(source.notSelectableKnowledgePointIds.includes(sibling));
  }
});
