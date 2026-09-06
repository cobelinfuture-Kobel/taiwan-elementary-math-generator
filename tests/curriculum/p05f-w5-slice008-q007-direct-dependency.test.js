import test from "node:test";
import assert from "node:assert/strict";

import {generateG5AU10AP05F7Questions,validateG5AU10AP05F7Question} from "../../site/modules/curriculum/batch-a/g5a-u10a-solid-shape-classification-runtime-p05f7.js";
import {G5A_U10A_P05F7_KP_ID,G5A_U10A_P05F7_SOURCE_ID,G5A_U10A_P05F7_SPEC_IDS} from "../../site/modules/curriculum/registry/g5a-u10a-solid-shape-classification-selector-projection-p05f7.js";
import {getVisibleBatchAKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource} from "../../site/modules/curriculum/registry/batch-a-selector-p05f8-extension.js";
import {resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p05f8.js";

test("P05F W5 Q008 keeps Q007 solid-classification runtime and public leaf unchanged",()=>{
  const generated=generateG5AU10AP05F7Questions({questionCount:9,patternSpecIds:[...G5A_U10A_P05F7_SPEC_IDS],generationSeed:"p05f8-q007-direct-dependency"});
  assert.equal(generated.ok,true,generated.errors.join("\n"));
  assert.equal(generated.questions.length,9);
  assert.equal(generated.questions.every((question)=>validateG5AU10AP05F7Question(question).ok),true);
  assert.equal(new Set(generated.questions.map((question)=>question.questionSignature)).size,9);
  const row=getVisibleBatchAKnowledgePoint(G5A_U10A_P05F7_KP_ID);
  assert.equal(row?.sourceId,G5A_U10A_P05F7_SOURCE_ID);
  const source=listBatchAKnowledgePointAvailabilityBySource(G5A_U10A_P05F7_SOURCE_ID);
  assert.deepEqual({visible:source.visibleCount,hidden:source.hiddenPendingCount,notSelectable:source.notSelectableCount},{visible:1,hidden:4,notSelectable:4});
  const binding=resolvePublicUiCapabilityBinding({sourceId:G5A_U10A_P05F7_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G5A_U10A_P05F7_KP_ID],questionMode:"diagram"});
  assert.equal(binding.blocked,false);
  assert.equal(binding.questionType,"diagram");
  assert.equal(binding.questionCount.max,240);
});
