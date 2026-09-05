import test from "node:test";
import assert from "node:assert/strict";

import {generateG3BU05P05F3Questions,validateG3BU05P05F3Question} from "../../site/modules/curriculum/batch-a/g3b-u05-square-centimeter-unit-runtime-p05f3.js";
import {buildBatchABrowserWorksheetDocument as buildQ003Worksheet} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f3-extension.js";
import {G3B_U05_P05F3_GROUP_ID,G3B_U05_P05F3_KP_ID,G3B_U05_P05F3_SOURCE_ID,G3B_U05_P05F3_SPEC_IDS} from "../../site/modules/curriculum/registry/g3b-u05-square-centimeter-unit-selector-projection-p05f3.js";

const options={sourceId:G3B_U05_P05F3_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G3B_U05_P05F3_KP_ID],selectedPatternGroupIds:[G3B_U05_P05F3_GROUP_ID],patternSpecIds:[...G3B_U05_P05F3_SPEC_IDS],questionMode:"diagram",requestedQuestionType:"diagram",questionCount:10,generationSeed:"p05f4-q003-direct-dependency",includeAnswerKey:true,printLayout:{paperSize:"A4",columns:2,rowsPerPage:4,showQuestionNumbers:true,showAnswerKeyPage:true}};

test("P05F W5 Q004 direct dependency keeps Q003 generator validator and worksheet semantics intact",()=>{
  const generated=generateG3BU05P05F3Questions(options);
  assert.equal(generated.ok,true,generated.errors.join("\n"));
  assert.equal(generated.questions.length,10);
  assert.equal(generated.questions.every((q)=>q.sourceId===G3B_U05_P05F3_SOURCE_ID&&q.knowledgePointId===G3B_U05_P05F3_KP_ID&&q.questionMode==="diagram"&&validateG3BU05P05F3Question(q).ok),true);
  const worksheet=buildQ003Worksheet(options);
  assert.equal(worksheet.ok,true,worksheet.errors.join("\n"));
  assert.equal(worksheet.worksheetDocument.questionCount,10);
  assert.equal(worksheet.worksheetDocument.answerKeyItems.length,10);
  assert.equal(worksheet.worksheetDocument.metadata.q002SemanticsTouched,false);
});

test("P05F W5 Q004 current browser cutover still resolves Q003 under the additive Q004 public totals",async()=>{
  globalThis.document={};
  try{
    const selector=await import(`../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js?p05f4q003=${Date.now()}`);
    const binding=await import(`../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js?p05f4q003=${Date.now()}`);
    assert.equal(selector.BATCH_A_SELECTOR_AVAILABILITY.sourceCount,47);
    assert.equal(selector.BATCH_A_SELECTOR_AVAILABILITY.visibleCount,316);
    assert.equal(selector.getVisibleBatchAKnowledgePoint(G3B_U05_P05F3_KP_ID)?.sourceId,G3B_U05_P05F3_SOURCE_ID);
    const resolved=binding.resolvePublicUiCapabilityBinding(options);
    assert.equal(resolved.blocked,false);
    assert.equal(resolved.sourceId,G3B_U05_P05F3_SOURCE_ID);
    assert.equal(resolved.questionType,"diagram");
    assert.equal(resolved.questionCount.max,240);
    assert.deepEqual(resolved.patternSpecIds,[...G3B_U05_P05F3_SPEC_IDS]);
  }finally{delete globalThis.document;}
});
