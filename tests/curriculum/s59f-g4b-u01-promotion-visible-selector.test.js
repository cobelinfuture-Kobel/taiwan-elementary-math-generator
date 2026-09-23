import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import * as previousSelector from '../../site/modules/curriculum/registry/batch-a-selector-g3b-u08-semantic-extension.js';
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  G4B_U01_VISIBLE_SELECTOR_PROJECTION,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
  resolveVisiblePatternSpecIdsForKnowledgePoint,
  validateG4BU01VisibleSelectorProjection,
} from '../../site/modules/curriculum/registry/batch-a-selector-g4b-u01-horizontal-extension.js';
import {
  G4B_U01_HORIZONTAL_PROMOTION_ACTIVATION,
  G4B_U01_HORIZONTAL_PROMOTION_LIFECYCLE,
  G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID,
  G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U01_PROMOTED_PATTERN_GROUP_IDS,
  G4B_U01_PROMOTED_PATTERN_SPEC_IDS,
  getG4BU01HorizontalPromotionProjection,
  isS59FPromotedG4BU01KnowledgePointId,
  isS59FPromotedG4BU01PatternGroupId,
  isS59FPromotedG4BU01PatternSpecId,
  validateG4BU01HorizontalPromotionProjection,
} from '../../site/modules/curriculum/registry/g4b-u01-horizontal-promotion.js';
import {
  G4B_U01_HIDDEN_PATTERN_GROUPS,
  G4B_U01_HIDDEN_PATTERN_SPECS,
} from '../../site/modules/curriculum/batch-a/source-pattern-g4b-u01-horizontal-extension.js';

const authority = JSON.parse(
  readFileSync(
    new URL(
      '../../data/curriculum/registry/promotions/S59F_G4B_U01_HorizontalPromotionRegistry.json',
      import.meta.url,
    ),
    'utf8',
  ),
);

const sameMembers = (left, right) =>
  left.length === right.length && JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());

test('S59F promotion authority and runtime projection have exact identity parity', () => {
  const projection = getG4BU01HorizontalPromotionProjection();
  assert.equal(projection.promotionRegistryId, authority.promotionRegistryId);
  assert.equal(projection.sourceId, authority.sourceId);
  assert.deepEqual(projection.knowledgePointIds, authority.knowledgePointIds);
  assert.deepEqual(projection.patternGroupIds, authority.patternGroupIds);
  assert.deepEqual(projection.patternSpecIds, authority.patternSpecIds);
  assert.deepEqual(projection.lifecycle, authority.lifecycle);
  assert.deepEqual(projection.activation, authority.activation);
  assert.equal(projection.rollbackKey, authority.rollbackKey);
  assert.equal(validateG4BU01HorizontalPromotionProjection().ok, true);
});

test('S59F promotes exactly nine KPs, nine groups and twelve PatternSpecs', () => {
  assert.equal(G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS.length, 9);
  assert.equal(G4B_U01_PROMOTED_PATTERN_GROUP_IDS.length, 9);
  assert.equal(G4B_U01_PROMOTED_PATTERN_SPEC_IDS.length, 12);
  assert.equal(new Set(G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS).size, 9);
  assert.equal(new Set(G4B_U01_PROMOTED_PATTERN_GROUP_IDS).size, 9);
  assert.equal(new Set(G4B_U01_PROMOTED_PATTERN_SPEC_IDS).size, 12);
  assert.ok(sameMembers(
    G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS,
    G4B_U01_HIDDEN_PATTERN_GROUPS.map((row) => row.primaryKnowledgePointId),
  ));
  assert.ok(sameMembers(
    G4B_U01_PROMOTED_PATTERN_SPEC_IDS,
    G4B_U01_HIDDEN_PATTERN_SPECS.map((row) => row.patternSpecId),
  ));
  assert.ok(G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS.every(isS59FPromotedG4BU01KnowledgePointId));
  assert.ok(G4B_U01_PROMOTED_PATTERN_GROUP_IDS.every(isS59FPromotedG4BU01PatternGroupId));
  assert.ok(G4B_U01_PROMOTED_PATTERN_SPEC_IDS.every(isS59FPromotedG4BU01PatternSpecId));
  assert.equal(isS59FPromotedG4BU01PatternSpecId('unknown'), false);
});

test('S59F keeps hidden authority immutable and production-forbidden', () => {
  assert.ok(G4B_U01_HIDDEN_PATTERN_GROUPS.every((row) => row.visibilityStatus === 'hidden'));
  assert.ok(G4B_U01_HIDDEN_PATTERN_SPECS.every((row) => row.selectorStatus === 'hidden'));
  assert.ok(G4B_U01_HIDDEN_PATTERN_SPECS.every((row) => row.canonicalRouting === 'disabled'));
  assert.ok(G4B_U01_HIDDEN_PATTERN_SPECS.every((row) => row.productionUse === 'forbidden'));
  assert.equal(G4B_U01_HORIZONTAL_PROMOTION_LIFECYCLE.selectorStatus, 'visible');
  assert.equal(G4B_U01_HORIZONTAL_PROMOTION_LIFECYCLE.validatorStatus, 'blocking_validator_accepted');
  assert.equal(G4B_U01_HORIZONTAL_PROMOTION_LIFECYCLE.worksheetStatus, 'not_eligible');
  assert.equal(G4B_U01_HORIZONTAL_PROMOTION_LIFECYCLE.productionUse, 'forbidden');
  assert.equal(G4B_U01_HORIZONTAL_PROMOTION_ACTIVATION.resolverBehaviorChanged, false);
  assert.equal(G4B_U01_HORIZONTAL_PROMOTION_ACTIVATION.canonicalRouterChanged, false);
});

test('S59F visible selector appends exactly nine G4B-U01 KPs without global duplicates', () => {
  const previous = previousSelector.listVisibleBatchAKnowledgePoints();
  const current = listVisibleBatchAKnowledgePoints();
  assert.equal(current.length, previous.length + 9);
  assert.equal(new Set(current.map((row) => row.knowledgePointId)).size, current.length);
  const projected = current.filter((row) => row.sourceId === 'g4b_u01_4b01');
  assert.equal(projected.length, 9);
  assert.ok(sameMembers(projected.map((row) => row.knowledgePointId), G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS));
  assert.equal(validateG4BU01VisibleSelectorProjection().ok, true);
});

test('S59F exposes one horizontal numeric group per KP and no representation toggle', () => {
  for (const knowledgePointId of G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS) {
    const kp = getVisibleBatchAKnowledgePoint(knowledgePointId);
    const groups = getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
    assert.ok(kp);
    assert.equal(kp.sourceId, 'g4b_u01_4b01');
    assert.deepEqual(kp.representationTags, ['numeric_expression', 'horizontal_expression']);
    assert.equal(groups.length, 1);
    assert.equal(groups[0].representationTag, 'numeric_expression');
    assert.deepEqual(groups[0].representationTags, ['numeric_expression', 'horizontal_expression']);
    assert.equal(groups[0].visibilityStatus, 'visible');
    assert.equal(groups[0].promotionRegistryId, G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID);
    assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId), groups[0].patternSpecIds);
  }
  assert.equal(G4B_U01_VISIBLE_SELECTOR_PROJECTION.visibleApplicationGroupCount, 0);
  assert.equal(G4B_U01_VISIBLE_SELECTOR_PROJECTION.representationToggleAdded, false);
});

test('S59F updates source availability and preserves unrelated selector behavior', () => {
  assert.equal(
    BATCH_A_SELECTOR_AVAILABILITY.visibleCount,
    previousSelector.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + 9,
  );
  const availability = listBatchAKnowledgePointAvailabilityBySource('g4b_u01_4b01');
  const previousAvailability = previousSelector.listBatchAKnowledgePointAvailabilityBySource('g4b_u01_4b01');
  assert.equal(availability.visibleCount, (previousAvailability?.visibleCount ?? 0) + 9);
  const unrelated = previousSelector.listVisibleBatchAKnowledgePoints()[0];
  assert.deepEqual(
    getVisibleBatchAKnowledgePoint(unrelated.knowledgePointId),
    previousSelector.getVisibleBatchAKnowledgePoint(unrelated.knowledgePointId),
  );
});
