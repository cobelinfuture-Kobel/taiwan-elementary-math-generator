import test from "node:test";
import assert from "node:assert/strict";
import {
  G4A_U09_P03F34_KP_ID,
  G4A_U09_P03F34_PATTERN_SPEC_ID,
  G4A_U09_P03F34_SOURCE_ID,
  P03F34_REQUIRED_CAPABILITY_IDS,
  auditG4AU09P03F34SelectorProjection,
} from "../../site/modules/curriculum/registry/g4a-u09-rank9-missing-digit-inequality-selector-projection-p03f34.js";
import { BATCH_A_SELECTOR_AVAILABILITY, auditP03F34PublicSelectorComposition, listBatchAKnowledgePointAvailabilityBySource } from "../../site/modules/curriculum/registry/batch-a-selector-p03f34-extension.js";
import { validateP03F34PatternDefinitions } from "../../site/modules/curriculum/batch-a/source-pattern-full-product-p03f34-extension.js";
import { generateG4AU09P03F34Questions, validateG4AU09P03F34Question } from "../../site/modules/curriculum/batch-a/g4a-u09-rank9-missing-digit-inequality-runtime-p03f34.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p03f34-extension.js";
const options={sourceId:G4A_U09_P03F34_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G4A_U09_P03F34_KP_ID],questionMode:"numeric",questionCount:24,generationSeed:"p03f34-core",includeAnswerKey:true,printLayout:{paperSize:"A4",columns:2,rowsPerPage:4,showQuestionNumbers:true,showAnswerKeyPage:true}};
function recompute(question){ const left=(digit)=>question.missingPlace==="tenths"?question.whole*100+digit*10+question.fixedDigit:question.whole*100+question.fixedDigit*10+digit; return Array.from({length:10},(_,digit)=>digit).filter((digit)=>question.relation==="<"?left(digit)<question.rightHundredths:left(digit)>question.rightHundredths); }
test("P03F34 selector adds one KP to existing G4A-U09 and reaches 32/230",()=>{
  assert.equal(auditG4AU09P03F34SelectorProjection().ok,true);
  assert.equal(auditP03F34PublicSelectorComposition().ok,true);
  assert.equal(validateP03F34PatternDefinitions().ok,true);
  const availability=listBatchAKnowledgePointAvailabilityBySource(G4A_U09_P03F34_SOURCE_ID);
  assert.deepEqual([availability.visibleCount,availability.hiddenPendingCount,availability.notSelectableCount],[7,1,0]);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.sourceCount,32);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount,230);
});
test("P03F34 generates 24 unique complete digit-set witnesses without arithmetic/application leakage",()=>{
  const generation=generateG4AU09P03F34Questions(options); assert.equal(generation.ok,true,JSON.stringify(generation.errors)); assert.equal(generation.questions.length,24);
  assert.equal(new Set(generation.questions.map((row)=>row.blankedDisplayText)).size,24);
  for(const question of generation.questions){
    assert.equal(question.patternSpecId,G4A_U09_P03F34_PATTERN_SPEC_ID);
    assert.deepEqual(question.possibleDigits,recompute(question));
    assert.ok(question.possibleDigits.length>0&&question.possibleDigits.length<10);
    assert.deepEqual(question.metadata.requiredCapabilityIds,P03F34_REQUIRED_CAPABILITY_IDS);
    assert.equal(question.metadata.requiredCapabilityIds.includes("cap_decimal_arithmetic"),false);
    assert.equal(question.globalContextProduction,null);
    assert.equal(validateG4AU09P03F34Question(question).ok,true,JSON.stringify(question));
  }
});
test("P03F34 validator fails closed on incomplete digit set, answer tamper, and context leak",()=>{
  const original=generateG4AU09P03F34Questions({...options,questionCount:1}).questions[0];
  const incomplete={...original,possibleDigits:original.possibleDigits.slice(1),answerText:original.possibleDigits.slice(1).join("、"),finalAnswer:original.possibleDigits.slice(1).join("、")};
  assert.ok(validateG4AU09P03F34Question(incomplete).errors.some((row)=>row.code==="p03f34_digit_set_incomplete"));
  assert.equal(validateG4AU09P03F34Question({...original,answerText:"9",finalAnswer:"9"}).ok,false);
  assert.ok(validateG4AU09P03F34Question({...original,globalContextProduction:{id:"forbidden"}}).errors.some((row)=>row.code==="p03f34_application_scope_leak"));
});
test("P03F34 same-unit mixed delegates prior G4A-U09 spec while retaining target",()=>{
  const generation=generateG4AU09P03F34Questions({...options,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:["kp_g4a_u09_decimal_compare",G4A_U09_P03F34_KP_ID],questionCount:12,generationSeed:"p03f34-mixed"});
  assert.equal(generation.ok,true,JSON.stringify(generation.errors));
  assert.ok(generation.questions.some((row)=>row.patternSpecId==="ps_g4a_u09_decimal_compare_comparison_numeric"));
  assert.ok(generation.questions.some((row)=>row.patternSpecId===G4A_U09_P03F34_PATTERN_SPEC_ID));
  assert.ok(generation.questions.every((row)=>validateG4AU09P03F34Question(row).ok));
});
test("P03F34 shared worksheet produces 24 questions + 24 answers on 3 + 3 pages",()=>{
  const result=buildBatchABrowserWorksheetDocument(options); assert.equal(result.ok,true,JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.questionCount,24); assert.equal(result.worksheetDocument.answerKeyItems.length,24); assert.equal(result.worksheetDocument.questionPages.length,3); assert.equal(result.worksheetDocument.answerKeyPages.length,3);
  assert.equal(result.worksheetDocument.metadata.applicationExpansion,false); assert.equal(result.worksheetDocument.metadata.hiddenApplicationLineagePreserved,true); assert.equal(result.worksheetDocument.metadata.worksheetAdapter.sharedPagination,true); assert.equal(result.worksheetDocument.metadata.worksheetAdapter.sharedRenderer,true); assert.equal(result.worksheetDocument.metadata.worksheetAdapter.parallelPipeline,false);
  result.worksheetDocument.answerKeyItems.forEach((answer,index)=>{ const question=result.worksheetDocument.generatedQuestions[index]; assert.equal(answer.questionId,question.id); assert.equal(answer.answerText,question.answerText); });
});
