import test from "node:test";
import assert from "node:assert/strict";

import {generateG5AU07P05F6Questions,validateG5AU07P05F6Question} from "../../site/modules/curriculum/batch-a/g5a-u07-line-symmetry-recognition-runtime-p05f6.js";
import {G5A_U07_P05F6_KP_ID,G5A_U07_P05F6_SOURCE_ID,G5A_U07_P05F6_SPEC_IDS} from "../../site/modules/curriculum/registry/g5a-u07-line-symmetry-recognition-selector-projection-p05f6.js";
import {getVisibleBatchAKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource} from "../../site/modules/curriculum/registry/batch-a-selector-p05f7-extension.js";
import {resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p05f7.js";

test("P05F W5 Q007 keeps Q006 line-symmetry runtime and public leaf unchanged",()=>{
  const generated=generateG5AU07P05F6Questions({questionCount:9,patternSpecIds:[...G5A_U07_P05F6_SPEC_IDS],generationSeed:"p05f7-q006-direct-dependency"});
  assert.equal(generated.ok,true,generated.errors.join("\n"));
  assert.equal(generated.questions.length,9);
  assert.equal(generated.questions.every((question)=>validateG5AU07P05F6Question(question).ok),true);
  assert.equal(new Set(generated.questions.map((question)=>question.questionSignature)).size,9);
  const row=getVisibleBatchAKnowledgePoint(G5A_U07_P05F6_KP_ID);
  assert.equal(row?.sourceId,G5A_U07_P05F6_SOURCE_ID);
  const source=listBatchAKnowledgePointAvailabilityBySource(G5A_U07_P05F6_SOURCE_ID);
  assert.deepEqual({visible:source.visibleCount,hidden:source.hiddenPendingCount,notSelectable:source.notSelectableCount},{visible:1,hidden:4,notSelectable:4});
  const binding=resolvePublicUiCapabilityBinding({sourceId:G5A_U07_P05F6_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G5A_U07_P05F6_KP_ID],questionMode:"diagram"});
  assert.equal(binding.blocked,false);
  assert.equal(binding.questionType,"diagram");
  assert.equal(binding.questionCount.max,240);
});
