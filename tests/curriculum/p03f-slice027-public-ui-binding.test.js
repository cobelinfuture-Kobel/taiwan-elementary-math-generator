import test from "node:test";
import assert from "node:assert/strict";

import { resolvePublicUiCapabilityBinding } from "../../site/modules/curriculum/public/public-ui-capability-binding.js";
import { listPublicPatternGroupChoices } from "../../site/assets/browser/state/public-pattern-group-selection.js";
import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";
import {
  G4B_U08_P03F27_KP_IDS,
  G4B_U08_P03F27_PATTERN_GROUPS,
  G4B_U08_P03F27_SOURCE_ID,
  G4B_U08_P03F27_HIDDEN_APPLICATION_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g4b-u08-rank8-fraction-selector-projection-p03f27.js";

const groupByKnowledgePoint = new Map(
  G4B_U08_P03F27_PATTERN_GROUPS.map((group) => [group.primaryKnowledgePointId, group.patternGroupId]),
);

test("P03F27 current public UI binds each new G4B-U08 KP to its own numeric PatternGroup", () => {
  for (const knowledgePointId of G4B_U08_P03F27_KP_IDS) {
    const expectedPatternGroupId = groupByKnowledgePoint.get(knowledgePointId);
    const binding = resolvePublicUiCapabilityBinding({
      sourceId: G4B_U08_P03F27_SOURCE_ID,
      surfaceId: "CLASSIC",
      selectionMode: "singleKnowledgePoint",
      selectedKnowledgePointIds: [knowledgePointId],
    });
    assert.equal(binding.blocked, false);
    assert.deepEqual(binding.selectedKnowledgePointIds, [knowledgePointId]);
    assert.equal(binding.questionType, "numeric");
    assert.deepEqual(binding.compatiblePatternGroupIds, [expectedPatternGroupId]);

    const selectorGroupIds = listPublicPatternGroupChoices([knowledgePointId]).map((row) => row.patternGroupId);
    assert.deepEqual(selectorGroupIds, [expectedPatternGroupId]);
    const serialized = JSON.stringify(binding);
    for (const hiddenSpecId of G4B_U08_P03F27_HIDDEN_APPLICATION_SPEC_IDS) {
      assert.equal(serialized.includes(hiddenSpecId), false);
    }
  }
});

test("P03F27 current G4B-U08 source-unit binding exposes all five visible KPs and keeps application hidden", () => {
  const binding = resolvePublicUiCapabilityBinding({
    sourceId: G4B_U08_P03F27_SOURCE_ID,
    surfaceId: "PIXEL",
    selectionMode: "sourceUnit",
  });
  assert.equal(binding.blocked, false);
  assert.equal(binding.selectedKnowledgePointCount, 5);
  assert.equal(binding.selectedKnowledgePointIds.length, 5);
  for (const knowledgePointId of G4B_U08_P03F27_KP_IDS) {
    assert.equal(binding.selectedKnowledgePointIds.includes(knowledgePointId), true);
    assert.equal(binding.compatiblePatternGroupIds.includes(groupByKnowledgePoint.get(knowledgePointId)), true);
  }
  const serialized = JSON.stringify(binding);
  for (const hiddenSpecId of G4B_U08_P03F27_HIDDEN_APPLICATION_SPEC_IDS) {
    assert.equal(serialized.includes(hiddenSpecId), false);
  }
});

test("P03F27 current registry advances through Slice033 to exactly 32 public sources and 229 visible KPs", () => {
  const snapshot = getCurrentPixelRegistrySnapshot();
  assert.equal(snapshot.sourceCount, 32);
  assert.equal(snapshot.visibleKnowledgePointCount, 229);
  assert.equal(snapshot.bySourceId[G4B_U08_P03F27_SOURCE_ID].visibleKnowledgePoints.length, 5);
});
