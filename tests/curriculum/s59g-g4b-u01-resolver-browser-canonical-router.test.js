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

function groupedCounts(allocation) {
  const counts = new Map();
  for (const entry of allocation) {
    counts.set(entry.patternGroupId, (counts.get(entry.patternGroupId) ?? 0) + entry.questionCount);
  }
  return [...counts.values()];
}

function assertSpreadAtMostOne(values, label) {
  assert.ok(values.length > 0, label);
  assert.ok(Math.max(...values) - Math.min(...values) <= 1, `${label}: ${values.join(',')}`);
}

test('S59G integration contract is horizontal-only and pre-worksheet', () => {
  assert.equal(G4B_U01_RESOLVER_BROWSER_STATE_INTEGRATION.sourceId, SOURCE_ID);
  assert.equal(G4B_U01_RESOLVER_BROWSER_STATE_INTEGRATION.allocationStrategy, 'balanced_by_group_then_family');
  assert.deepEqual(G4B_U01_RESOLVER_BROWSER_STATE_INTEGRATION.supportedSelectionModes, [
    'singleKnowledgePoint',
    'mixedKnowledgePointsSameUnit',
  ]);
  assert.deepEqual(G4B_U01_RESOLVER_BROWSER_STATE_INTEGRATION.browserStateFields, [
    'selectionMode',
    'selectedKnowledgePointIds',
    'selectedPatternGroupIds',
    'questionCount',
    'ordering',
    'includeAnswerKey',
  ]);
  assert.equal(G4B_U01_CANONICAL_ROUTER_INTEGRATION.horizontalOnly, true);
  assert.equal(G4B_U01_CANONICAL_ROUTER_INTEGRATION.publicApplicationModeAdded, false);
  assert.equal(G4B_U01_CANONICAL_ROUTER_INTEGRATION.representationToggleAdded, false);
  assert.equal(G4B_U01_CANONICAL_ROUTER_INTEGRATION.publicHiddenModeFlagAllowed, false);
  assert.equal(G4B_U01_CANONICAL_ROUTER_INTEGRATION.resolverDerivedOnly, true);
  assert.equal(G4B_U01_CANONICAL_ROUTER_INTEGRATION.blockingValidatorRequired, true);
  assert.equal(G4B_U01_CANONICAL_ROUTER_INTEGRATION.genericFallbackAllowed, false);
  assert.equal(G4B_U01_CANONICAL_ROUTER_INTEGRATION.productionEligibilityChanged, false);
  assert.equal(G4B_U01_CANONICAL_ROUTER_INTEGRATION.worksheetRendererChanged, false);
});

test('S59G normalizes one visible group into all four trailing-zero families', () => {
  const basePlan = buildBatchABrowserPlan(canonicalOptions());
  assert.equal(basePlan.resolverResult.ok, true, JSON.stringify(basePlan.resolverResult.errors));
  const plan = normalizeG4BU01ResolverPlan(basePlan);
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

test('S59G mixed same-unit selection balances groups before families', () => {
  const plan = normalizeG4BU01ResolverPlan(buildBatchABrowserPlan(canonicalOptions({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: [M3_KP, TRAILING_KP, D3_KP, EXACT_KP],
    selectedPatternGroupIds: [M3_GROUP, TRAILING_GROUP, D3_GROUP, EXACT_GROUP],
    questionCount: 47,
  })));
  assert.equal(plan.resolverResult.ok, true, JSON.stringify(plan.resolverResult.errors));
  assert.equal(plan.allocation.reduce((sum, entry) => sum + entry.questionCount, 0), 47);
  assertSpreadAtMostOne(groupedCounts(plan.allocation), 'group fairness');
  assert.ok(plan.allocation.every((entry) => G4B_U01_PROMOTED_PATTERN_SPEC_IDS.includes(entry.patternSpecId)));
  const trailingCounts = plan.allocation
    .filter((entry) => entry.patternGroupId === TRAILING_GROUP)
    .map((entry) => entry.questionCount);
  assert.equal(trailingCounts.length, 4);
  assertSpreadAtMostOne(trailingCounts, 'trailing family fairness');
});

test('S59G browser state carries only generic public controls', () => {
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

test('S59G canonical public route uses exact resolver allocation and mandatory validation', () => {
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
    assert.equal(validateG4BU01CanonicalQuestion(question).ok, true);
  }
});

test('S59G mixed deterministic shuffle preserves exact output and fair allocation', () => {
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
  assertSpreadAtMostOne(groupedCounts(first.allocation), 'group fairness');
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

test('S59G ignores arbitrary public PatternSpec injection and derives membership only from visible groups', () => {
  const result = generateBatchABrowserQuestions({
    ...canonicalOptions({ questionCount: 8 }),
    selectedPatternSpecIds: ['ps_g4b_u01_injected'],
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 8);
  assert.equal(result.questions.some((question) => question.patternSpecId === 'ps_g4b_u01_injected'), false);
  assert.ok(result.questions.every((question) => G4B_U01_PROMOTED_PATTERN_SPEC_IDS.includes(question.patternSpecId)));
});

test('S59G blocking validator failure returns zero questions and no fallback', () => {
  const plan = normalizeG4BU01ResolverPlan(buildBatchABrowserPlan(canonicalOptions({ questionCount: 5 })));
  assert.equal(classifyG4BU01CanonicalRouterPlan(plan), G4B_U01_CANONICAL_ROUTE_KINDS.PURE_HORIZONTAL);
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

test('S59G source-unit mode remains on the prior source-unit route', () => {
  const plan = buildBatchABrowserPlan({
    sourceId: SOURCE_ID,
    selectionMode: 'sourceUnit',
    questionCount: 6,
  });
  assert.equal(classifyG4BU01CanonicalRouterPlan(plan), G4B_U01_CANONICAL_ROUTE_KINDS.LEGACY);
});
