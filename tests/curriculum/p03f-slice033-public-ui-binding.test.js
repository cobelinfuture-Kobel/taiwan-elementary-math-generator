import test from "node:test";
import assert from "node:assert/strict";

import {
  auditPublicUiCapabilityBinding,
  resolvePublicUiCapabilityBinding,
} from "../../site/modules/curriculum/public/public-ui-capability-binding-p03f33.js";
import { listPublicPatternGroupChoices } from "../../site/assets/browser/state/public-pattern-group-selection.js";
import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";
import {
  G4A_U06_P03F33_HIDDEN_APPLICATION_SPEC_IDS,
  G4A_U06_P03F33_KP_IDS,
  G4A_U06_P03F33_PATTERN_GROUPS,
  G4A_U06_P03F33_SOURCE_ID,
} from "../../site/modules/curriculum/registry/g4a-u06-rank9-fraction-selector-projection-p03f33.js";

const groupByKnowledgePoint = new Map(
  G4A_U06_P03F33_PATTERN_GROUPS.map((group) => [group.primaryKnowledgePointId, group.patternGroupId]),
);

test("P03F33 current Classic and Pixel bindings expose each rank9 KP only through numeric PatternGroups", () => {
  for (const surfaceId of ["classic", "fallback404", "pixel"]) {
    for (const knowledgePointId of G4A_U06_P03F33_KP_IDS) {
      const binding = resolvePublicUiCapabilityBinding({
        sourceId:G4A_U06_P03F33_SOURCE_ID,
        surfaceId,
        selectionMode:"singleKnowledgePoint",
        selectedKnowledgePointIds:[knowledgePointId],
      });
      assert.equal(binding.blocked, false);
      assert.deepEqual(binding.selectedKnowledgePointIds, [knowledgePointId]);
      assert.equal(binding.questionType, "numeric");
      assert.deepEqual(binding.compatiblePatternGroupIds, [groupByKnowledgePoint.get(knowledgePointId)]);
      assert.deepEqual(binding.depthOptions, []);
      assert.deepEqual(binding.contextOptions, []);
      const serialized = JSON.stringify(binding);
      for (const hiddenSpecId of G4A_U06_P03F33_HIDDEN_APPLICATION_SPEC_IDS) assert.equal(serialized.includes(hiddenSpecId), false);
    }
  }
});

test("P03F33 mixed-same-unit binding composes all three rank9 KPs without application leakage", () => {
  const binding = resolvePublicUiCapabilityBinding({
    sourceId:G4A_U06_P03F33_SOURCE_ID,
    surfaceId:"pixel",
    selectionMode:"mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds:[...G4A_U06_P03F33_KP_IDS],
  });
  assert.equal(binding.blocked, false);
  assert.deepEqual(binding.selectedKnowledgePointIds, [...G4A_U06_P03F33_KP_IDS]);
  assert.equal(binding.selectedKnowledgePointCount, 3);
  assert.equal(binding.compatiblePatternGroupIds.length, 3);
  assert.equal(binding.questionType, "numeric");
  const serialized = JSON.stringify(binding);
  for (const hiddenSpecId of G4A_U06_P03F33_HIDDEN_APPLICATION_SPEC_IDS) assert.equal(serialized.includes(hiddenSpecId), false);
});

test("P03F33 pattern-group state remains intact while current Pixel registry advances through Slice046 to 33 sources / 247 KPs", () => {
  for (const knowledgePointId of G4A_U06_P03F33_KP_IDS) {
    const choices = listPublicPatternGroupChoices([knowledgePointId]);
    assert.deepEqual(choices.map((row) => row.patternGroupId), [groupByKnowledgePoint.get(knowledgePointId)]);
  }
  const snapshot = getCurrentPixelRegistrySnapshot();
  assert.equal(snapshot.sourceCount, 33);
  assert.equal(snapshot.visibleKnowledgePointCount, 247);
  assert.equal(snapshot.bySourceId[G4A_U06_P03F33_SOURCE_ID].visibleKnowledgePoints.length, 5);
});

test("P03F33 public capability audit remains fail-closed and gap-free", () => {
  const audit = auditPublicUiCapabilityBinding();
  assert.equal(audit.ok, true, JSON.stringify(audit.errors));
  assert.equal(audit.errors.length, 0);
  assert.ok(audit.slice033AuditCaseCount > 0);
});
