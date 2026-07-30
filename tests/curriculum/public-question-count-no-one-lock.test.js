import assert from "node:assert/strict";
import test from "node:test";

import {
  PUBLIC_UI_SURFACES,
  resolvePublicUiCapabilityBinding,
} from "../../site/modules/curriculum/public/public-ui-capability-binding.js";
import {
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f13-extension.js";

function visibleBySource() {
  const grouped = new Map();
  for (const kp of listVisibleBatchAKnowledgePoints()) {
    const rows = grouped.get(kp.sourceId) ?? [];
    rows.push(kp);
    grouped.set(kp.sourceId, rows);
  }
  return grouped;
}

test("global public UI never folds a same-unit subset into a one-question lock", () => {
  let checked = 0;
  for (const [sourceId, kps] of visibleBySource()) {
    if (kps.length < 3) continue;
    const selectedKnowledgePointIds = kps.slice(0, -1).map((kp) => kp.knowledgePointId);
    for (const surfaceId of Object.values(PUBLIC_UI_SURFACES)) {
      const binding = resolvePublicUiCapabilityBinding({
        sourceId,
        surfaceId,
        selectionMode: "mixedKnowledgePointsSameUnit",
        selectedKnowledgePointIds,
      });
      assert.equal(binding.blocked, false, `${sourceId}|${surfaceId}`);
      assert.equal(binding.questionCount.min, 1, `${sourceId}|${surfaceId}`);
      assert.equal(binding.questionCount.max, 240, `${sourceId}|${surfaceId}`);
      assert.notEqual(binding.questionCount.max, 1, `${sourceId}|${surfaceId}`);
      assert.ok(binding.compatiblePatternGroupIds.length > 0, `${sourceId}|${surfaceId}`);
      checked += 1;
    }
  }
  assert.ok(checked > 0, "expected same-unit subset witnesses");
});
