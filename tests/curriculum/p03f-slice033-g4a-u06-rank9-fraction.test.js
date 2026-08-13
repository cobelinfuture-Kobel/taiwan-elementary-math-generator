import test from "node:test";
import assert from "node:assert/strict";

import {
  G4A_U06_P03F33_KP_IDS,
  G4A_U06_P03F33_NUMERIC_PATTERN_SPEC_IDS,
  G4A_U06_P03F33_SOURCE_ID,
  P03F33_REQUIRED_CAPABILITY_IDS,
  auditG4AU06P03F33SelectorProjection,
} from "../../site/modules/curriculum/registry/g4a-u06-rank9-fraction-selector-projection-p03f33.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  auditP03F33PublicSelectorComposition,
  listBatchAKnowledgePointAvailabilityBySource,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f33-extension.js";
import { validateP03F33PatternDefinitions } from "../../site/modules/curriculum/batch-a/source-pattern-full-product-p03f33-extension.js";
import {
  generateG4AU06P03F33Questions,
  validateG4AU06P03F33Question,
} from "../../site/modules/curriculum/batch-a/g4a-u06-rank9-fraction-runtime-p03f33.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p03f33-extension.js";

const options={
  sourceId:G4A_U06_P03F33_SOURCE_ID,
  selectionMode:"mixedKnowledgePointsSameUnit",
  selectedKnowledgePointIds:[...G4A_U06_P03F33_KP_IDS],
  questionMode:"numeric",
  questionCount:24,
  generationSeed:"p03f33-core",
  includeAnswerKey:true,
  printLayout:{paperSize:"A4",columns:2,rowsPerPage:4,showQuestionNumbers:true,showAnswerKeyPage:true},
};

test("P03F33 selector adds three KPs to existing G4A-U06 without adding a source",()=>{
  assert.equal(auditG4AU06P03F33SelectorProjection().ok,true);
  assert.equal(auditP03F33PublicSelectorComposition().ok,true);
  assert.equal(validateP03F33PatternDefinitions().ok,true);
  const availability=listBatchAKnowledgePointAvailabilityBySource(G4A_U06_P03F33_SOURCE_ID);
  assert.deepEqual([availability.visibleCount,availability.hiddenPendingCount,availability.notSelectableCount],[5,1,1]);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.sourceCount,32);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount,32);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount,229);
});

test("P03F33 runtime emits 24 unique validated witnesses across all four numeric specs",()=>{
  const generation=generateG4AU06P03F33Questions(options);
  assert.equal(generation.ok,true,JSON.stringify(generation.errors));
  assert.equal(generation.questions.length,24);
  assert.equal(new Set(generation.questions.map((row)=>row.blankedDisplayText)).size,24);
  assert.deepEqual(new Set(generation.questions.map((row)=>row.patternSpecId)),new Set(G4A_U06_P03F33_NUMERIC_PATTERN_SPEC_IDS));
  assert.deepEqual(new Set(generation.questions.map((row)=>row.metadata.knowledgePointId)),new Set(G4A_U06_P03F33_KP_IDS));
  assert.ok(generation.questions.some((row)=>row.operationFamilyId==="fraction_compare"&&row.answerText==="="));
  assert.ok(generation.questions.some((row)=>row.operationFamilyId==="fraction_compare"&&row.answerText==="<"));
  assert.ok(generation.questions.some((row)=>row.operationFamilyId==="fraction_compare"&&row.answerText===">"));
  assert.ok(generation.questions.some((row)=>row.numberLineTask==="coordinate"));
  assert.ok(generation.questions.some((row)=>row.numberLineTask==="distance"));
  assert.ok(generation.questions.some((row)=>row.arithmeticOperation==="add"));
  assert.ok(generation.questions.some((row)=>row.arithmeticOperation==="sub"));
  for(const question of generation.questions){
    assert.equal(validateG4AU06P03F33Question(question).ok,true,JSON.stringify(question));
    assert.deepEqual(question.metadata.requiredCapabilityIds,P03F33_REQUIRED_CAPABILITY_IDS);
    assert.equal(question.metadata.globalContextAuthorityPath,null);
    assert.equal(question.globalContextProduction,null);
  }
  assert.equal(generation.allocation.length,4);
  assert.ok(generation.allocation.every((row)=>row.questionCount===6));
});

test("P03F33 single-KP number-line selection resolves both canonical numeric surfaces",()=>{
  const kpId="kp_fraction_improper_mixed_number_line";
  const generation=generateG4AU06P03F33Questions({...options,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[kpId],questionCount:8});
  assert.equal(generation.ok,true,JSON.stringify(generation.errors));
  assert.equal(generation.questions.length,8);
  assert.deepEqual(new Set(generation.questions.map((row)=>row.patternSpecId)),new Set([
    "ps_g4a_u06_fraction_number_line_coordinate_numeric",
    "ps_g4a_u06_fraction_number_line_distance_numeric",
  ]));
  assert.ok(generation.questions.every((row)=>row.metadata.knowledgePointId===kpId));
});

test("P03F33 validator fails closed on answer tampering and application leakage",()=>{
  const original=generateG4AU06P03F33Questions({...options,selectedKnowledgePointIds:["kp_fraction_same_denominator_mixed_add_sub"],questionCount:2}).questions[0];
  const tamperedAnswer={...original,answerText:"999",finalAnswer:"999"};
  assert.equal(validateG4AU06P03F33Question(tamperedAnswer).ok,false);
  const tamperedContext={...original,globalContextProduction:{contextId:"forbidden"}};
  const validation=validateG4AU06P03F33Question(tamperedContext);
  assert.equal(validation.ok,false);
  assert.ok(validation.errors.some((error)=>error.code==="p03f33_application_scope_leak"));
});

test("P03F33 shared worksheet produces 24 questions + 24 answers on 3 + 3 pages",()=>{
  const result=buildBatchABrowserWorksheetDocument(options);
  assert.equal(result.ok,true,JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.questionCount,24);
  assert.equal(result.worksheetDocument.answerKeyItems.length,24);
  assert.equal(result.worksheetDocument.questionPages.length,3);
  assert.equal(result.worksheetDocument.answerKeyPages.length,3);
  assert.equal(result.worksheetDocument.metadata.applicationExpansion,false);
  assert.equal(result.worksheetDocument.metadata.hiddenApplicationLineagePreserved,true);
  assert.equal(result.worksheetDocument.metadata.worksheetAdapter.sharedPagination,true);
  assert.equal(result.worksheetDocument.metadata.worksheetAdapter.sharedRenderer,true);
  assert.equal(result.worksheetDocument.metadata.worksheetAdapter.parallelPipeline,false);
  result.worksheetDocument.answerKeyItems.forEach((answer,index)=>{
    const question=result.worksheetDocument.generatedQuestions[index];
    assert.equal(answer.questionId,question.id);
    assert.equal(answer.answerText,question.answerText);
    assert.equal(answer.knowledgePointId,question.metadata.knowledgePointId);
  });
});
