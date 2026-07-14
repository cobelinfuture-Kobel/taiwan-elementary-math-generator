import test from "node:test";
import assert from "node:assert/strict";

import {
  G4A_U08_APP_COST_OVERLAY_PATTERN_SPEC,
  generateG4AU08AppCostOverlayHidden,
  validateG4AU08AppCostOverlayHiddenRegistry,
} from "../../site/modules/curriculum/batch-a/g4a-u08-app-cost-overlay-hidden.js";
import {
  buildG4AU08AppCostOverlayMutationCases,
  validateG4AU08AppCostOverlayItem,
} from "../../src/curriculum/g4a-u08/app-cost-overlay-validator.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const SOURCE_ID = "g4a_u08_4a08";
const KNOWLEDGE_POINT_ID = "kp_g4a_u08_app_mul_div_before_add_sub";
const PATTERN_GROUP_ID = "pg_g4a_u08_app_cost_overlay";

test("S76P hidden registry closes exactly one app_cost_overlay PatternGroup", () => {
  const result = validateG4AU08AppCostOverlayHiddenRegistry();
  assert.equal(result.ok, true, result.errors.join(","));
  assert.deepEqual(result.counts, { patternSpecs: 1, patternGroups: 1, knowledgePoints: 1, equationShapes: 2 });
  assert.equal(G4A_U08_APP_COST_OVERLAY_PATTERN_SPEC.patternGroupId, PATTERN_GROUP_ID);
  assert.equal(G4A_U08_APP_COST_OVERLAY_PATTERN_SPEC.patternSpecId, "ps_g4a_u08_app_cost_overlay");
  assert.equal(G4A_U08_APP_COST_OVERLAY_PATTERN_SPEC.lifecycle.productionUse, "forbidden");
});

test("S76P generates both add and subtract overlay semantics with correct arithmetic", () => {
  const directions = new Set();
  for (let index = 0; index < 80; index += 1) {
    const item = generateG4AU08AppCostOverlayHidden({ seed: `s76p:${index}` });
    const result = validateG4AU08AppCostOverlayItem(item);
    assert.equal(result.valid, true, JSON.stringify(result.errors));
    assert.deepEqual(result.validatedLevels, ["L1", "L2", "L3", "L4", "L5", "L6"]);
    const overlay = item.knownQuantities.find((row) => row.role === "overlayAmount");
    directions.add(overlay.direction);
    assert.equal(item.answerModel.value >= 0, true);
    assert.equal(item.answerModel.unit, "元");
    assert.equal(item.unknownQuantityRole, "adjustedCost");
    assert.equal(item.semanticRelations.includes("payment_balance"), false);
  }
  assert.deepEqual(directions, new Set(["add", "subtract"]));
});

test("S76P rejects overlay direction, component and payment-balance mutations", () => {
  const item = generateG4AU08AppCostOverlayHidden({ seed: "s76p-mutations" });
  const cases = buildG4AU08AppCostOverlayMutationCases(item);
  assert.deepEqual(cases.map((row) => row.mutationId), [
    "overlay_direction_flipped",
    "multiplication_component_omitted",
    "payment_balance_semantics_injected",
  ]);
  for (const row of cases) {
    const result = validateG4AU08AppCostOverlayItem(row.item);
    assert.equal(result.valid, false, row.mutationId);
    assert.equal(result.errors.length > 0, true);
  }
});

test("S76R exposes app_cost_overlay publicly without rewriting the historical S76P hidden artifact", () => {
  const availability = listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);
  assert.equal(availability.visibleCount, 15);
  const visible = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SOURCE_ID);
  assert.equal(visible.length, 15);
  assert.ok(visible.some((row) => row.knowledgePointId === KNOWLEDGE_POINT_ID));
  assert.ok(getVisiblePatternGroupsForKnowledgePoint(KNOWLEDGE_POINT_ID).some((row) => row.patternGroupId === PATTERN_GROUP_ID));
  assert.equal(G4A_U08_APP_COST_OVERLAY_PATTERN_SPEC.lifecycle.productionUse, "forbidden");
});
