import test from "node:test";
import assert from "node:assert/strict";

import {generateG3AU09P05F2Questions,validateG3AU09P05F2Question} from "../../site/modules/curriculum/batch-a/g3a-u09-circle-parts-runtime-p05f2.js";
import {buildBatchABrowserWorksheetDocument as buildQ002Worksheet} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f2-extension.js";
import {G3A_U09_P05F2_GROUP_ID,G3A_U09_P05F2_KP_ID,G3A_U09_P05F2_SOURCE_ID,G3A_U09_P05F2_SPEC_IDS} from "../../site/modules/curriculum/registry/g3a-u09-circle-parts-selector-projection-p05f2.js";

const options={sourceId:G3A_U09_P05F2_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G3A_U09_P05F2_KP_ID],selectedPatternGroupIds:[G3A_U09_P05F2_GROUP_ID],patternSpecIds:[...G3A_U09_P05F2_SPEC_IDS],questionMode:"diagram",requestedQuestionType:"diagram",questionCount:10,generationSeed:"p05f3-q002-direct-dependency",includeAnswerKey:true,printLayout:{paperSize:"A4",columns:2,rowsPerPage:4,showQuestionNumbers:true,showAnswerKeyPage:true}};

test("P05F W5 Q003 direct dependency keeps Q002 generator validator and worksheet semantics intact",()=>{
  const generated=generateG3AU09P05F2Questions(options);
  assert.equal(generated.ok,true,generated.errors.join("\n"));
  assert.equal(generated.questions.length,10);
  assert.equal(generated.questions.every((q)=>q.sourceId===G3A_U09_P05F2_SOURCE_ID&&q.knowledgePointId===G3A_U09_P05F2_KP_ID&&q.questionMode==="diagram"&&validateG3AU09P05F2Question(q).ok),true);
  const worksheet=buildQ002Worksheet(options);
  assert.equal(worksheet.ok,true,worksheet.errors.join("\n"));
  assert.equal(worksheet.worksheetDocument.questionCount,10);
  assert.equal(worksheet.worksheetDocument.answerKeyItems.length,10);
  assert.equal(worksheet.worksheetDocument.metadata.q001SemanticsTouched,false);
});

test("P05F W5 Q003 current browser cutover still resolves Q002 under the additive Q003 public totals",async()=>{
  globalThis.document={};
  try{
    const selector=await import(`../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js?p05f3q002=${Date.now()}`);
    const binding=await import(`../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js?p05f3q002=${Date.now()}`);
    assert.equal(selector.BATCH_A_SELECTOR_AVAILABILITY.sourceCount,46);
    assert.equal(selector.BATCH_A_SELECTOR_AVAILABILITY.visibleCount,315);
    assert.equal(selector.getVisibleBatchAKnowledgePoint(G3A_U09_P05F2_KP_ID)?.sourceId,G3A_U09_P05F2_SOURCE_ID);
    const resolved=binding.resolvePublicUiCapabilityBinding(options);
    assert.equal(resolved.blocked,false);
    assert.equal(resolved.sourceId,G3A_U09_P05F2_SOURCE_ID);
    assert.equal(resolved.questionType,"diagram");
    assert.equal(resolved.questionCount.max,240);
    assert.deepEqual(resolved.patternSpecIds,[...G3A_U09_P05F2_SPEC_IDS]);
  }finally{delete globalThis.document;}
});
