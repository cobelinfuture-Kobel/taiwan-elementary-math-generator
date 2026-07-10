import test from "node:test";
import assert from "node:assert/strict";

import {
  BATCH_A_RESOLVER_ERROR_CODES,
  BATCH_A_RESOLVER_SELECTION_MODES,
  G3B_U04_RESOLVER_BROWSER_STATE_INTEGRATION,
  resolveVisiblePatternGroupSelection
} from "../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import { buildBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";
import {
  createConfigState,
  getBatchAWorksheetPlan,
  SELECTOR_WARNING_CODES
} from "../../site/assets/browser/state/config-state.js";
import {
  getVisiblePatternGroupsForKnowledgePoint
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  G3B_U04_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS
} from "../../site/modules/curriculum/registry/g3b-u04-semantic-promotion.js";

const SOURCE_ID = "g3b_u04_3b04";
const ADD_KP = "kp_g3b_u04_add_then_divide";
const ADD_GROUP = "pg_g3b_u04_add_then_divide";
const SUBTRACT_KP = "kp_g3b_u04_subtract_then_divide";
const SUBTRACT_GROUP = "pg_g3b_u04_subtract_then_divide";
const DIVIDE_ADD_KP = "kp_g3b_u04_divide_then_add";
const DIVIDE_ADD_GROUP = "pg_g3b_u04_divide_then_add";
const CONSECUTIVE_KP = "kp_g3b_u04_consecutive_multiplication";
const NUMERIC_GROUP = "pg_g3b_u04_consecutive_multiplication_numeric";
const APPLICATION_GROUP = "pg_g3b_u04_consecutive_multiplication_application";
const NUMERIC_SPEC = "ps_g3b_u04_consecutive_multiplication";

function codes(result) {
  return result.errors.map((entry) => entry.code);
}

function groupCounts(allocation) {
  const counts = new Map();
  for (const entry of allocation) {
    counts.set(entry.patternGroupId, (counts.get(entry.patternGroupId) ?? 0) + entry.questionCount);
  }
  return counts;
}

function assertSpreadAtMostOne(values, label) {
  assert.ok(values.length > 0, label);
  assert.ok(Math.max(...values) - Math.min(...values) <= 1, `${label}: ${values.join(",")}`);
}

function assertFamilyFairness(allocation) {
  const byGroup = new Map();
  for (const entry of allocation) {
    const counts = byGroup.get(entry.patternGroupId) ?? [];
    counts.push(entry.questionCount);
    byGroup.set(entry.patternGroupId, counts);
  }
  for (const [groupId, counts] of byGroup) assertSpreadAtMostOne(counts, groupId);
}

function resolve(overrides = {}) {
  return resolveVisiblePatternGroupSelection({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    sourceId: SOURCE_ID,
    selectedKnowledgePointIds: [ADD_KP],
    selectedPatternGroupIds: [ADD_GROUP],
    questionCount: 17,
    ordering: "groupedByPattern",
    generationSeed: "s57f3-resolver",
    includeAnswerKey: true,
    ...overrides
  });
}

test("S57F3 locks generic browser-state fields and leaves router and production gates unchanged", () => {
  assert.deepEqual(G3B_U04_RESOLVER_BROWSER_STATE_INTEGRATION, {
    task: "S57F3_G3B_U04_ResolverAndBrowserStateIntegration",
    sourceId: SOURCE_ID,
    status: "resolver_and_browser_state_integrated_router_not_promoted",
    allocationStrategy: "balanced_by_group_then_family",
    supportedSelectionModes: [
      BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
      BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT
    ],
    browserStateFields: [
      "selectionMode",
      "selectedKnowledgePointIds",
      "selectedPatternGroupIds",
      "questionCount",
      "ordering",
      "includeAnswerKey"
    ],
    publicHiddenModeFlagAllowed: false,
    canonicalRouterChanged: false,
    productionEligibilityChanged: false,
    requiredNextGate: "S57F4_G3B_U04_CanonicalRouterAndHybridIntegration"
  });
});

test("S57F3 single semantic KnowledgePoint resolves every promoted family with fair allocation", () => {
  const result = resolve();
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(result.knowledgePointIds, [ADD_KP]);
  assert.deepEqual(result.patternGroupIds, [ADD_GROUP]);
  assert.equal(result.patternSpecIds.length, 5);
  assert.equal(result.patternSpecIds.every((id) => G3B_U04_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS.includes(id)), true);
  assert.equal(result.allocation.length, 5);
  assert.equal(result.allocation.reduce((sum, entry) => sum + entry.questionCount, 0), 17);
  assertFamilyFairness(result.allocation);
  assert.equal(result.provenance.allocationStrategy, "balanced_by_group_then_family");
  assert.equal(result.provenance.publicHiddenModeFlagUsed, false);
});

test("S57F3 mixed same-unit KnowledgePoints balance groups before balancing families", () => {
  const result = resolve({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: [ADD_KP, SUBTRACT_KP, DIVIDE_ADD_KP],
    selectedPatternGroupIds: [ADD_GROUP, SUBTRACT_GROUP, DIVIDE_ADD_GROUP],
    questionCount: 31
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.allocation.reduce((sum, entry) => sum + entry.questionCount, 0), 31);
  const counts = [...groupCounts(result.allocation).values()];
  assert.equal(counts.length, 3);
  assertSpreadAtMostOne(counts, "group fairness");
  assertFamilyFairness(result.allocation);
  assert.deepEqual(new Set(result.patternGroupIds), new Set([ADD_GROUP, SUBTRACT_GROUP, DIVIDE_ADD_GROUP]));
});

test("S57F3 resolves numeric, application, and explicit numeric-plus-application representation selections", () => {
  const numeric = resolve({
    selectedKnowledgePointIds: [CONSECUTIVE_KP],
    selectedPatternGroupIds: [NUMERIC_GROUP],
    questionCount: 7
  });
  assert.equal(numeric.ok, true, JSON.stringify(numeric.errors));
  assert.deepEqual(numeric.patternSpecIds, [NUMERIC_SPEC]);
  assert.deepEqual(numeric.allocation, [{ patternGroupId: NUMERIC_GROUP, patternSpecId: NUMERIC_SPEC, questionCount: 7 }]);

  const application = resolve({
    selectedKnowledgePointIds: [CONSECUTIVE_KP],
    selectedPatternGroupIds: [APPLICATION_GROUP],
    questionCount: 10
  });
  assert.equal(application.ok, true, JSON.stringify(application.errors));
  assert.equal(application.patternSpecIds.length, 4);
  assert.equal(application.patternSpecIds.includes(NUMERIC_SPEC), false);
  assert.equal(application.allocation.length, 4);
  assert.equal(application.allocation.reduce((sum, entry) => sum + entry.questionCount, 0), 10);
  assertFamilyFairness(application.allocation);

  const hybrid = resolve({
    selectedKnowledgePointIds: [CONSECUTIVE_KP],
    selectedPatternGroupIds: [NUMERIC_GROUP, APPLICATION_GROUP],
    questionCount: 9
  });
  assert.equal(hybrid.ok, true, JSON.stringify(hybrid.errors));
  assert.equal(hybrid.patternSpecIds.length, 5);
  assert.equal(hybrid.patternSpecIds.includes(NUMERIC_SPEC), true);
  assert.equal(hybrid.allocation.reduce((sum, entry) => sum + entry.questionCount, 0), 9);
  const hybridGroupCounts = groupCounts(hybrid.allocation);
  assertSpreadAtMostOne([...hybridGroupCounts.values()], "hybrid group fairness");
  assert.equal(hybridGroupCounts.get(NUMERIC_GROUP) + hybridGroupCounts.get(APPLICATION_GROUP), 9);
  assertFamilyFairness(hybrid.allocation.filter((entry) => entry.patternGroupId === APPLICATION_GROUP));
});

test("S57F3 rejects missing representation choice, stale groups, and groups linked to another KnowledgePoint", () => {
  const representationMissing = resolve({
    selectedKnowledgePointIds: [CONSECUTIVE_KP],
    selectedPatternGroupIds: [],
    questionCount: 8
  });
  assert.equal(representationMissing.ok, false);
  assert.deepEqual(codes(representationMissing), [BATCH_A_RESOLVER_ERROR_CODES.PATTERN_GROUP_SELECTION_REQUIRED]);

  const stale = resolve({ selectedPatternGroupIds: ["pg_g3b_u04_stale"] });
  assert.equal(stale.ok, false);
  assert.ok(codes(stale).includes(BATCH_A_RESOLVER_ERROR_CODES.PATTERN_GROUP_NOT_VISIBLE));

  const wrongKp = resolve({
    selectedKnowledgePointIds: [CONSECUTIVE_KP],
    selectedPatternGroupIds: [ADD_GROUP]
  });
  assert.equal(wrongKp.ok, false);
  assert.ok(codes(wrongKp).includes(BATCH_A_RESOLVER_ERROR_CODES.PATTERN_GROUP_NOT_LINKED_TO_KP));
});

test("S57F3 rejects empty, unregistered, and cross-unit selections without source-unit fallback", () => {
  const empty = resolve({ selectedKnowledgePointIds: [], selectedPatternGroupIds: [] });
  assert.equal(empty.ok, false);
  assert.deepEqual(codes(empty), [BATCH_A_RESOLVER_ERROR_CODES.NO_VISIBLE_KP]);

  const unknown = resolve({ selectedKnowledgePointIds: ["kp_g3b_u04_unregistered"], selectedPatternGroupIds: [ADD_GROUP] });
  assert.equal(unknown.ok, false);
  assert.deepEqual(codes(unknown), [BATCH_A_RESOLVER_ERROR_CODES.KP_NOT_VISIBLE]);

  const crossUnit = resolve({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: [ADD_KP, "kp_g4a_u08_parentheses_first"],
    selectedPatternGroupIds: [ADD_GROUP, "pg_g4a_u08_parentheses_first_numeric"]
  });
  assert.equal(crossUnit.ok, false);
  assert.ok(codes(crossUnit).includes(BATCH_A_RESOLVER_ERROR_CODES.MIXED_SAME_UNIT_SOURCE_MISMATCH));
});

test("S57F3 browser config state carries explicit representation selection into the generic resolver", () => {
  const state = createConfigState({
    queryState: {
      sourceId: SOURCE_ID,
      selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
      selectedKnowledgePointIds: [CONSECUTIVE_KP],
      selectedPatternGroupIds: [APPLICATION_GROUP],
      questionCount: 13,
      ordering: "shuffleAcrossPatterns",
      includeAnswerKey: false,
      generationSeed: "s57f3-browser-state"
    }
  });
  const worksheetPlan = getBatchAWorksheetPlan(state);
  assert.deepEqual(worksheetPlan.selectedKnowledgePointIds, [CONSECUTIVE_KP]);
  assert.deepEqual(worksheetPlan.selectedPatternGroupIds, [APPLICATION_GROUP]);
  assert.equal(worksheetPlan.questionCount, 13);
  assert.equal(worksheetPlan.ordering, "shuffleAcrossPatterns");
  assert.equal(worksheetPlan.includeAnswerKey, false);
  assert.equal(Object.hasOwn(worksheetPlan, "hiddenSemanticMode"), false);
  assert.equal(Object.hasOwn(worksheetPlan, "g3bU04Semantic"), false);

  const resolvedPlan = buildBatchABrowserPlan(worksheetPlan);
  assert.equal(resolvedPlan.resolverResult.ok, true, JSON.stringify(resolvedPlan.resolverResult.errors));
  assert.deepEqual(resolvedPlan.selectedKnowledgePointIds, [CONSECUTIVE_KP]);
  assert.deepEqual(resolvedPlan.selectedPatternGroupIds, [APPLICATION_GROUP]);
  assert.equal(resolvedPlan.allocation.length, 4);
  assert.equal(resolvedPlan.allocation.reduce((sum, entry) => sum + entry.questionCount, 0), 13);
  assertFamilyFairness(resolvedPlan.allocation);
});

test("S57F3 browser state drops stale PatternGroup IDs visibly and the resolver then blocks ambiguous representation", () => {
  const state = createConfigState({
    queryState: {
      sourceId: SOURCE_ID,
      selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
      selectedKnowledgePointIds: [CONSECUTIVE_KP],
      selectedPatternGroupIds: ["pg_g3b_u04_stale"],
      questionCount: 8
    }
  });
  assert.deepEqual(state.batchA.selectedKnowledgePointIds, [CONSECUTIVE_KP]);
  assert.deepEqual(state.batchA.selectedPatternGroupIds, []);
  assert.equal(state.batchA.selectorWarnings.some((warning) => (
    warning.code === SELECTOR_WARNING_CODES.SELECTOR_ID_DROPPED
      && warning.field === "patternGroupIds"
  )), true);

  const resolvedPlan = buildBatchABrowserPlan(getBatchAWorksheetPlan(state));
  assert.equal(resolvedPlan.resolverResult.ok, false);
  assert.deepEqual(codes(resolvedPlan.resolverResult), [BATCH_A_RESOLVER_ERROR_CODES.PATTERN_GROUP_SELECTION_REQUIRED]);
});

test("S57F3 ignores arbitrary PatternSpec injection and resolves only visible selected groups", () => {
  const applicationSpecs = getVisiblePatternGroupsForKnowledgePoint(CONSECUTIVE_KP)
    .find((group) => group.patternGroupId === APPLICATION_GROUP).patternSpecIds;
  const result = resolve({
    selectedKnowledgePointIds: [CONSECUTIVE_KP],
    selectedPatternGroupIds: [APPLICATION_GROUP],
    selectedPatternSpecIds: ["ps_g3b_u04_unpromoted_injection"],
    questionCount: 8
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(new Set(result.patternSpecIds), new Set(applicationSpecs));
  assert.equal(result.patternSpecIds.includes("ps_g3b_u04_unpromoted_injection"), false);
});
