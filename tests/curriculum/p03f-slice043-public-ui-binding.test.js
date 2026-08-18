import test from "node:test";
import assert from "node:assert/strict";
import { PUBLIC_UI_SURFACES, auditPublicUiCapabilityBinding, resolvePublicUiCapabilityBinding } from "../../site/modules/curriculum/public/public-ui-capability-binding-p03f43.js";
import {
  G4B_U08_P03F43_BOUNDS_GROUP_ID,
  G4B_U08_P03F43_BOUNDS_KP_ID,
  G4B_U08_P03F43_NUMBER_LINE_GROUP_ID,
  G4B_U08_P03F43_NUMBER_LINE_KP_ID,
  G4B_U08_P03F43_SOURCE_ID,
  P03F43_KP_IDS,
} from "../../site/modules/curriculum/registry/g4b-u08-rank10-fraction-selector-projection-p03f43.js";

for (const [kp, group] of [[G4B_U08_P03F43_NUMBER_LINE_KP_ID, G4B_U08_P03F43_NUMBER_LINE_GROUP_ID], [G4B_U08_P03F43_BOUNDS_KP_ID, G4B_U08_P03F43_BOUNDS_GROUP_ID]]) {
  test(`P03F43 public surfaces expose ${kp} as numeric single-KP route`, () => {
    for (const surfaceId of [PUBLIC_UI_SURFACES.CLASSIC, PUBLIC_UI_SURFACES.PIXEL, PUBLIC_UI_SURFACES.FALLBACK_404]) {
      const binding = resolvePublicUiCapabilityBinding({ sourceId: G4B_U08_P03F43_SOURCE_ID, surfaceId, selectionMode: "singleKnowledgePoint", selectedKnowledgePointIds: [kp], selectedPatternGroupIds: [group] });
      assert.equal(binding.blocked, false);
      assert.deepEqual(binding.selectedKnowledgePointIds, [kp]);
      assert.deepEqual(binding.compatiblePatternGroupIds, [group]);
      assert.equal(binding.questionType, "numeric");
      assert.equal(binding.depthOptions.length, 0);
      assert.equal(binding.contextOptions.length, 0);
    }
  });
}

test("P03F43 mixed same-unit route combines both frozen q043 KPs without application controls", () => {
  const binding = resolvePublicUiCapabilityBinding({ sourceId: G4B_U08_P03F43_SOURCE_ID, surfaceId: PUBLIC_UI_SURFACES.PIXEL, selectionMode: "mixedKnowledgePointsSameUnit", selectedKnowledgePointIds: P03F43_KP_IDS });
  assert.equal(binding.blocked, false);
  assert.equal(binding.selectedKnowledgePointCount, 2);
  assert.deepEqual(new Set(binding.compatiblePatternGroupIds), new Set([G4B_U08_P03F43_NUMBER_LINE_GROUP_ID, G4B_U08_P03F43_BOUNDS_GROUP_ID]));
  assert.deepEqual(binding.contextOptions, []);
  assert.equal(binding.questionType, "numeric");
});

test("P03F43 public binding audit remains green", () => {
  const audit = auditPublicUiCapabilityBinding();
  assert.equal(audit.ok, true, JSON.stringify(audit.errors));
  assert.ok(audit.slice043AuditCaseCount >= 7);
});
