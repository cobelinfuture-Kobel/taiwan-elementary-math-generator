import test from "node:test";
import assert from "node:assert/strict";

import {generateG4BU10P05F5Questions,validateG4BU10P05F5Question} from "../../site/modules/curriculum/batch-a/g4b-u10-cubic-centimeter-unit-runtime-p05f5.js";
import {G4B_U10_P05F5_KP_ID,G4B_U10_P05F5_SOURCE_ID,G4B_U10_P05F5_SPEC_IDS} from "../../site/modules/curriculum/registry/g4b-u10-cubic-centimeter-unit-selector-projection-p05f5.js";
import {getVisibleBatchAKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource} from "../../site/modules/curriculum/registry/batch-a-selector-p05f6-extension.js";
import {resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p05f6.js";

test("P05F W5 Q006 keeps Q005 cubic-centimeter runtime and public leaf unchanged",()=>{
  const generated=generateG4BU10P05F5Questions({questionCount:8,patternSpecIds:[...G4B_U10_P05F5_SPEC_IDS],generationSeed:"p05f6-q005-direct-dependency"});
  assert.equal(generated.ok,true,generated.errors.join("\n"));
  assert.equal(generated.questions.length,8);
  assert.equal(generated.questions.every((question)=>validateG4BU10P05F5Question(question).ok),true);
  assert.equal(new Set(generated.questions.map((question)=>question.questionSignature)).size,8);
  const row=getVisibleBatchAKnowledgePoint(G4B_U10_P05F5_KP_ID);
  assert.equal(row?.sourceId,G4B_U10_P05F5_SOURCE_ID);
  const source=listBatchAKnowledgePointAvailabilityBySource(G4B_U10_P05F5_SOURCE_ID);
  assert.deepEqual({visible:source.visibleCount,hidden:source.hiddenPendingCount,notSelectable:source.notSelectableCount},{visible:1,hidden:4,notSelectable:4});
  const binding=resolvePublicUiCapabilityBinding({sourceId:G4B_U10_P05F5_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G4B_U10_P05F5_KP_ID],questionMode:"diagram"});
  assert.equal(binding.blocked,false);
  assert.equal(binding.questionType,"diagram");
  assert.equal(binding.questionCount.max,240);
});
