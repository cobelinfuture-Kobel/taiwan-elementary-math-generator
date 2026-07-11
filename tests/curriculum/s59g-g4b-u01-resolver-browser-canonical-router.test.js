import test from 'node:test';
import assert from 'node:assert/strict';

import {
  BATCH_A_RESOLVER_SELECTION_MODES,
  resolveVisiblePatternGroupSelection,
} from '../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js';
import { buildBatchABrowserPlan } from '../../site/modules/curriculum/batch-a/batch-a-browser-generator.js';
import { generateBatchABrowserQuestions } from '../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js';
import {
  G4B_U01_CANONICAL_ROUTE_KINDS,
  G4B_U01_CANONICAL_ROUTER_INTEGRATION,
  G4B_U01_RESOLVER_BROWSER_STATE_INTEGRATION,
  classifyG4BU01CanonicalRouterPlan,
  generateG4BU01CanonicalHorizontalQuestions,
  normalizeG4BU01ResolverPlan,
  validateG4BU01CanonicalPlan,
  validateG4BU01CanonicalQuestion,
} from '../../site/modules/curriculum/batch-a/g4b-u01-canonical-horizontal-router.js';
import {
  createConfigState,
  getBatchAWorksheetPlan,
} from '../../site/assets/browser/state/config-state.js';
import {
  G4B_U01_PROMOTED_PATTERN_SPEC_IDS,
} from '../../site/modules/curriculum/registry/g4b-u01-horizontal-promotion.js';

const SOURCE_ID = 'g4b_u01_4b01';
const TRAILING_KP = 'kp_g4b_u01_trailing_zero_multiplication';
const TRAILING_GROUP = 'pg_g4b_u01_trailing_zero_multiplication';
const M3_KP = 'kp_g4b_u01_3digit_by_3digit';
const M3_GROUP = 'pg_g4b_u01_3digit_by_3digit';
const D3_KP = 'kp_g4b_u01_3digit_div_3digit';
const D3_GROUP = 'pg_g4b_u01_3digit_div_3digit';
const EXACT_KP = 'kp_g4b_u01_trailing_zero_division_exact';
const EXACT_GROUP = 'pg_g4b_u01_trailing_zero_division_exact';

function canonicalOptions(overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [TRAILING_KP],
    selectedPatternGroupIds: [TRAILING_GROUP],
    questionCount: 17,
    ordering: 'groupedByPattern',
    generationSeed: 's59g-g4b-u01',
    includeAnswerKey: true,
    ...overrides,
  };
}

function groupCounts(allocation) {
  const counts = new Map();
  for (const entry of allocation) {
    counts.set(entry.patternGroupId, (counts.get(entry.patternGroupId) ?? 0) + entry.questionCount);
  }
  return [...counts.values()];
}

function familyCountsByGroup(allocation) {
  const result = new Map();
  for (const entry of allocation) {
    const values = result.get(entry.patternGroupId) ?? [];
    values.push(entry.questionCount);
    result.set(entry.patternGroupId, values);
  }
  return result;
}

function assertSpreadAtMostOne(values, label) {
  assert.ok(values.length > 0, label);
  assert.ok(Math.max(...values) - Math.min(...values) <= 1, `${label}: ${values.join(',')}`);
}

test('S59G integration contract remains horizontal-only and pre-worksheet', () => {
  assert.deepEqual(G4B_U01_RESOLVER_BROWSER_STATE_INTEGRATION, {
    task: 'S59G_G4B_U01_ResolverBrowserStateAndCanonicalRouterIntegration',
    sourceId: SOURCE_ID,
    status: 'resolver_browser_state_and_canonical_router_integrated_worksheet_gate_pending',
    allocationStrategy: 'balanced_by_group_then_family',
    supportedSelectionModes: ['singleKnowledgePoint', 'mixedKnowledgePointsSameUnit'],
    browserStateFields: [
      'selectionMode',
      'selectedKnowledgePointIds',
      'selectedPatternGroupIds',
      'questionCount',
      'ordering',
      'includeAnswerKey',
    ],
    horizontalOnly: true,
    publicApplicationModeAdded: false,
    representationToggleAdded: false,
    publicHiddenModeFlagAllowed: false,
    resolverDerivedOnly: true,
    blockingValidatorRequired: true,
    genericFallbackAllowed: false,
    canonicalRouterChanged: true,
    productionEligibilityChanged: false,
    worksheetRendererChanged: false,
    requiredNextGate: 'S59H_G4B_U01_WorksheetAnswerKeyAndHorizontalRendererIntegration',
  });
  assert.equal(G4B_U01_CANONICAL_ROUTER_INTEGRATION.horizontalOnly, true);
  assert.equal(G4B_U01_CANONICAL_ROUTER_INTEGRATION.productionEligibilityChanged, false);
  assert.equal(G4B_U01_CANONICAL_ROUTER_INTEGRATION.worksheetRendererChanged, false);
});

test('S59G adapts the generic visible resolver to group-then-family allocation', () => {
  const base = buildBatchABrowserPlan(canonicalOptions());
  assert.equal(base.resolverResult.ok, true, JSON.stringify(base.resolverResult.errors));
  const plan = normalizeG4BU01ResolverPlan(base);
  assert.deepEqual(plan.selectedKnowledgePointIds, [TRAILING_KP]);
  assert.deepEqual(plan.selectedPatternGroupIds, [TRAILING_GROUP]);
  assert.equal(plan.patternSpecIds.length, 4);
  assert.equal(plan.allocation.length, 4);
  assert.equal(plan.allocation.reduce((sum, entry) => sum + entry.questionCount, 0), 17);
  assertSpreadAtMostOne(plan.allocation.map((entry) => entry.questionCount), 'family fairness');
  assert.equal(plan.resolverResult.provenance.allocationStrategy, 'balanced_by_group_then_family');
  assert.equal(plan.resolverResult.provenance.publicHiddenModeFlagUsed, false);
  assert.equal(plan.resolverResult.provenance.s59gAdapterApplied, true);
});

test('S59G mixed selection balances groups before families', () => {
  const plan = normalizeG4BU01ResolverPlan(buildBatchABrowserPlan(canonicalOptions({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: [M3_KP, TRAILING_KP, D3_KP, EXACT_KP],
    selectedPatternGroupIds: [M3_GROUP, TRAILING_GROUP, D3_GROUP, EXACT_GROUP],
    questionCount: 47,
  })));
  assert.equal(plan.resolverResult.ok, true, JSON.stringify(plan.resolverResult.errors));
  assert.equal(plan.allocation.reduce((sum, entry) => sum + entry.questionCount, 0), 47);
  assertSpreadAtMostOne(groupCounts(plan.allocation), 'group fairness');
  for (const [groupId, counts] of familyCountsByGroup(plan.allocation)) {
    assertSpreadAtMostOne(counts, groupId);
  }
  assert.ok(plan.allocation.every((entry) => G4B_U01_PROMOTED_PATTERN_SPEC_IDS.includes(entry.patternSpecId)));
});

test('S59G browser state carries public controls without hidden or representation modes', () => {
  const state = createConfigState({ queryState: canonicalOptions({
    questionCount: 19,
    ordering: 'shuffleAcrossPatterns',
    includeAnswerKey: false,
  }) });
  const worksheetPlan = getBatchAWorksheetPlan(state);
  assert.deepEqual(worksheetPlan.selectedKnowledgePointIds, [TRAILING_KP]);
  assert.deepEqual(worksheetPlan.selectedPatternGroupIds, [TRAILING_GROUP]);
  assert.equal(worksheetPlan.questionCount, 19);
  assert.equal(worksheetPlan.ordering, 'shuffleAcrossPatterns');
  assert.equal(worksheetPlan.includeAnswerKey, false);
  assert.equal(Object.hasOwn(worksheetPlan, 'hiddenMode'), false);
  assert.equal(Object.hasOwn(worksheetPlan, 'g4bU01Mode'), false);
  assert.equal(Object.hasOwn(worksheetPlan, 'representationMode'), false);
  const plan = normalizeG4BU01ResolverPlan(buildBatchABrowserPlan(worksheetPlan));
  assert.equal(validateG4BU01CanonicalPlan(plan).ok, true);
});

test('S59G canonical route consumes exact resolver allocation and validates every output', () => {
  const result = generateBatchABrowserQuestions(canonicalOptions({ questionCount: 25 }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 25);
  assert.equal(result.allocation.reduce((sum, entry) => sum + entry.questionCount, 0), 25);
  assert.equal(result.plan.routeKind, G4B_U01_CANONICAL_ROUTE_KINDS.PURE_HORIZONTAL);
  assert.deepEqual(result.allocation, result.plan.allocation);
  for (const question of result.questions) {
    assert.equal(question.phase, 'S59G');
    assert.equal(question.kind, 'g4bU01HorizontalCalculation');
    assert.equal(question.selectorStatus, 'visible');
    assert.equal(question.visibilityStatus, 'visible');
    assert.equal(question.productionUse, 'canonical_runtime_only');
    assert.equal(question.generatorRouting, 'canonical_resolver_allocation');
    assert.equal(question.representation, 'horizontal_only');
    assert.equal(question.applicationText, false);
    assert.equal(question.canonicalRoute.kind, G4B_U01_CANONICAL_ROUTE_KINDS.PURE_HORIZONTAL);
    assert.equal(question.canonicalRoute.publicHiddenModeFlagUsed, false);
    assert.equal(question.fallback, undefined);
    assert.equal(validateG4BU01CanonicalQuestion(question).ok, true);
  }
});

test('S59G deterministic shuffle preserves exact membership and allocation', () => {
  const options = canonicalOptions({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: [M3_KP, TRAILING_KP, D3_KP, EXACT_KP],
    selectedPatternGroupIds: [M3_GROUP, TRAILING_GROUP, D3_GROUP, EXACT_GROUP],
    questionCount: 72,
    ordering: 'shuffleAcrossPatterns',
    generationSeed: 's59g-mixed-shuffle',
  });
  const first = generateBatchABrowserQuestions(options);
  const second = generateBatchABrowserQuestions(options);
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.deepEqual(first, second);
  assert.equal(first.questions.length, 72);
  assertSpreadAtMostOne(groupCounts(first.allocation), 'group fairness');
  for (const [groupId, counts] of familyCountsByGroup(first.allocation)) assertSpreadAtMostOne(counts, groupId);
});

test('S59G resolver rejects stale and cross-unit public selections', () => {
  const stale = resolveVisiblePatternGroupSelection({
    ...canonicalOptions(),
    selectedPatternGroupIds: ['pg_g4b_u01_stale'],
  });
  assert.equal(stale.ok, false);

  const crossUnit = resolveVisiblePatternGroupSelection({
    ...canonicalOptions(),
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: [TRAILING_KP, 'kp_g3b_u08_total_from_groups'],
    selectedPatternGroupIds: [TRAILING_GROUP, 'pg_g3b_u08_total_from_groups'],
  });
  assert.equal(crossUnit.ok, false);
});

test('S59G classifier rejects direct allocation injection and never routes it', () => {
  const plan = normalizeG4BU01ResolverPlan(buildBatchABrowserPlan(canonicalOptions({ questionCount: 8 })));
  const injected = structuredClone(plan);
  injected.allocation[0].patternSpecId = 'ps_g4b_u01_injected';
  injected.resolverResult.patternSpecIds[0] = 'ps_g4b_u01_injected';
  assert.equal(classifyG4BU01CanonicalRouterPlan(injected), G4B_U01_CANONICAL_ROUTE_KINDS.INVALID_HORIZONTAL_SCOPE);
  const validation = validateG4BU01CanonicalPlan(injected);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((entry) => entry.code === 'G4B_U01_CANONICAL_PATTERN_NOT_PROMOTED'));
});

test('S59G blocking validator failure returns zero questions and no fallback', () => {
  const plan = normalizeG4BU01ResolverPlan(buildBatchABrowserPlan(canonicalOptions({ questionCount: 5 })));
  const result = generateG4BU01CanonicalHorizontalQuestions(plan, {
    validator: () => ({
      ok: false,
      errors: [{ code: 'G4B_U01_TEST_BLOCK', severity: 'error', path: 'test', message: 'blocked' }],
      warnings: [],
    }),
  });
  assert.equal(result.ok, false);
  assert.deepEqual(result.questions, []);
  assert.ok(result.errors.some((entry) => entry.code === 'G4B_U01_TEST_BLOCK'));
  assert.ok(result.errors.some((entry) => entry.code === 'G4B_U01_CANONICAL_OUTPUT_COUNT_MISMATCH'));
});

test('S59G source-unit mode remains on the prior source route', () => {
  const plan = buildBatchABrowserPlan({ sourceId: SOURCE_ID, selectionMode: 'sourceUnit', questionCount: 6 });
  assert.equal(classifyG4BU01CanonicalRouterPlan(plan), G4B_U01_CANONICAL_ROUTE_KINDS.LEGACY);
});
