import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  G4B_U01_HIDDEN_PATTERN_GROUPS,
  G4B_U01_HIDDEN_PATTERN_SPECS,
  getG4BU01HiddenPatternGroups,
  getG4BU01HiddenPatternSpecById,
  getG4BU01HiddenPatternSpecs,
} from '../../site/modules/curriculum/batch-a/source-pattern-g4b-u01-horizontal-extension.js';

const registry = JSON.parse(
  readFileSync(
    new URL(
      '../../data/curriculum/pattern_specs/S59C_G4B_U01_HorizontalPatternSpecRegistry.json',
      import.meta.url,
    ),
    'utf8',
  ),
);
const formalContract = JSON.parse(
  readFileSync(
    new URL(
      '../../data/curriculum/contracts/S59B_G4B_U01_TagRegistryFormalMappingAndBoundaryDesign.json',
      import.meta.url,
    ),
    'utf8',
  ),
);

const unique = (values) => new Set(values).size === values.length;

function normalizeGroup(row) {
  return {
    patternGroupId: row.patternGroupId,
    displayName: row.displayName,
    knowledgePointId: row.knowledgePointId ?? row.primaryKnowledgePointId,
    answerModel: row.answerModel ?? row.answerModelShape,
    patternSpecIds: row.patternSpecIds,
  };
}

function normalizeSpec(row) {
  return {
    patternSpecId: row.patternSpecId,
    patternGroupId: row.patternGroupId,
    knowledgePointId: row.knowledgePointId,
    operation: row.operation,
    equationShape: row.equationShape,
    answerModel: typeof row.answerModel === 'string' ? row.answerModel : row.answerModel.shape,
    patternOrder: row.patternOrder,
    legacyRuntimeIdPreserved: row.legacyRuntimeIdPreserved === true,
  };
}

test('S59C materializes exactly nine hidden PatternGroups and twelve hidden PatternSpecs', () => {
  assert.equal(registry.patternGroups.length, 9);
  assert.equal(registry.patternSpecs.length, 12);
  assert.equal(G4B_U01_HIDDEN_PATTERN_GROUPS.length, 9);
  assert.equal(G4B_U01_HIDDEN_PATTERN_SPECS.length, 12);
  assert.ok(unique(registry.patternGroups.map((row) => row.patternGroupId)));
  assert.ok(unique(registry.patternSpecs.map((row) => row.patternSpecId)));
  assert.equal(registry.summary.visiblePatternSpecCount, 0);
  assert.equal(registry.summary.routedPatternSpecCount, 0);
  assert.equal(registry.summary.productionPatternSpecCount, 0);
});

test('S59C browser-neutral projection is an exact normalized projection of the authority', () => {
  assert.deepEqual(
    G4B_U01_HIDDEN_PATTERN_GROUPS.map(normalizeGroup),
    registry.patternGroups.map(normalizeGroup),
  );
  assert.deepEqual(
    G4B_U01_HIDDEN_PATTERN_SPECS.map(normalizeSpec),
    registry.patternSpecs.map(normalizeSpec),
  );
  assert.equal(getG4BU01HiddenPatternGroups(), G4B_U01_HIDDEN_PATTERN_GROUPS);
  assert.equal(getG4BU01HiddenPatternSpecs(), G4B_U01_HIDDEN_PATTERN_SPECS);
});

test('S59C PatternSpecs remain hidden, unrouted, unvalidated and forbidden for production', () => {
  for (const spec of G4B_U01_HIDDEN_PATTERN_SPECS) {
    assert.equal(spec.sourceId, 'g4b_u01_4b01');
    assert.equal(spec.kind, 'g4bU01HorizontalCalculation');
    assert.equal(spec.representation, 'horizontal_only');
    assert.equal(spec.applicationTextAllowed, false);
    assert.equal(spec.generatorStatus, 'hidden_not_implemented');
    assert.equal(spec.validatorStatus, 'contract_only_not_runtime');
    assert.equal(spec.runtimeProjectionStatus, 'materialized_not_routed');
    assert.equal(spec.selectorStatus, 'hidden');
    assert.equal(spec.canonicalRouting, 'disabled');
    assert.equal(spec.productionUse, 'forbidden');
    assert.ok(Object.isFrozen(spec));
  }
  assert.ok(Object.isFrozen(G4B_U01_HIDDEN_PATTERN_SPECS));
  assert.ok(Object.isFrozen(G4B_U01_HIDDEN_PATTERN_GROUPS));
});

test('S59C PatternSpec identities and answer models exactly match S59B FormalMappings', () => {
  const formalById = new Map(
    formalContract.formalMappings.map((row) => [row.patternSpecId, row]),
  );
  assert.deepEqual(
    new Set(G4B_U01_HIDDEN_PATTERN_SPECS.map((row) => row.patternSpecId)),
    new Set(formalById.keys()),
  );

  for (const spec of G4B_U01_HIDDEN_PATTERN_SPECS) {
    const mapping = formalById.get(spec.patternSpecId);
    assert.ok(mapping);
    assert.equal(spec.knowledgePointId, mapping.knowledgePointId);
    assert.equal(spec.operation, mapping.operation);
    assert.equal(spec.equationShape, mapping.equationShape);
    assert.equal(spec.answerModel.shape, mapping.answerModel);
  }
});

test('S59C preserves the historical runtime id without exposing or routing it', () => {
  const legacy = getG4BU01HiddenPatternSpecById('ps_g4b_u01_multiplier_trailing_zero');
  assert.ok(legacy);
  assert.equal(legacy.legacyRuntimeIdPreserved, true);
  assert.equal(legacy.selectorStatus, 'hidden');
  assert.equal(legacy.canonicalRouting, 'disabled');
  assert.equal(legacy.productionUse, 'forbidden');
  assert.equal(getG4BU01HiddenPatternSpecById('unknown'), null);
  assert.equal(
    registry.goalDistance.nextShortestStep,
    'S59D_G4B_U01_HiddenDeterministicHorizontalGenerator',
  );
});
