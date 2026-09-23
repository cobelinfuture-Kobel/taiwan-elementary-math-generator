import test from "node:test";
import assert from "node:assert/strict";

import {buildBatchABrowserWorksheetDocument as buildStableWorksheet} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import {buildBatchABrowserPlan,requestsP05F13} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f13.js";
import {G4A_U05_P05F13_FUTURE_KP_IDS,G4A_U05_P05F13_KP_ID,G4A_U05_P05F13_SOURCE_ID} from "../../site/modules/curriculum/registry/g4a-u05-triangle-elements-naming-selector-projection-p05f13.js";
import {listBatchAKnowledgePointAvailabilityBySource} from "../../site/modules/curriculum/registry/batch-a-selector-p05f13-extension.js";

const sourceUnitOptions=Object.freeze({sourceId:G4A_U05_P05F13_SOURCE_ID,selectionMode:"sourceUnit",questionCount:8,generationSeed:"q013-source-unit",includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:4,showAnswerKeyPage:true}});

test("P05F W5 Q013 owns new G4A-U05 sourceUnit route without pulling future siblings",()=>{
  assert.equal(requestsP05F13(sourceUnitOptions),true);
  const plan=buildBatchABrowserPlan(sourceUnitOptions);
  assert.equal(plan.selectionMode,"sourceUnit");
  assert.deepEqual(plan.selectedKnowledgePointIds,[G4A_U05_P05F13_KP_ID]);
  assert.equal(plan.questionMode,"diagram");
  const source=listBatchAKnowledgePointAvailabilityBySource(G4A_U05_P05F13_SOURCE_ID);
  assert.deepEqual(source.visibleKnowledgePointIds,[G4A_U05_P05F13_KP_ID]);
  for(const sibling of G4A_U05_P05F13_FUTURE_KP_IDS){
    assert.equal(source.visibleKnowledgePointIds.includes(sibling),false);
    assert.ok(source.hiddenPendingKnowledgePointIds.includes(sibling));
    assert.ok(source.notSelectableKnowledgePointIds.includes(sibling));
  }
});

test("P05F W5 Q013 stable worksheet entry resolves sourceUnit through Q013",()=>{
  const result=buildStableWorksheet(sourceUnitOptions);
  assert.equal(result.ok,true,result.errors?.join(","));
  assert.equal(result.p05f13Implemented,true);
  assert.equal(result.worksheetDocument.metadata.taskId,"P05F_W5DirectProductVerticalSlice013Implementation");
  assert.equal(result.worksheetDocument.metadata.knowledgePointId,G4A_U05_P05F13_KP_ID);
  assert.equal(result.worksheetDocument.questionCount,8);
  assert.equal(result.worksheetDocument.metadata.q014OrLaterTouched,false);
});

test("P05F W5 Q013 rejects mixed same-unit and cross-unit activation",()=>{
  assert.equal(requestsP05F13({sourceId:G4A_U05_P05F13_SOURCE_ID,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[G4A_U05_P05F13_KP_ID]}),false);
  assert.equal(requestsP05F13({sourceId:G4A_U05_P05F13_SOURCE_ID,selectionMode:"mixedKnowledgePointsCrossUnit",selectedKnowledgePointIds:[G4A_U05_P05F13_KP_ID]}),false);
});
