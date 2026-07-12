export * from "./visible-pattern-group-resolver-core.js";

import * as core from "./visible-pattern-group-resolver-core.js";
import {
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
} from "../registry/batch-a-selector-extension.js";

const SOURCE_ID = "g5a_u08_5a08";

export const G5A_U08_RESOLVER_BROWSER_STATE_INTEGRATION = Object.freeze({
  task: "S60I_G5A_U08_PromotionResolverAndPublicSelectorIntegration",
  sourceId: SOURCE_ID,
  status: "resolver_browser_state_and_canonical_runtime_integrated_worksheet_gate_pending",
  allocationStrategy: "balanced_by_group_then_runtime_family",
  supportedSelectionModes: Object.freeze([
    core.BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    core.BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
  ]),
  browserStateFields: Object.freeze([
    "selectionMode",
    "selectedKnowledgePointIds",
    "selectedPatternGroupIds",
    "questionMode",
    "depthMode",
    "contextMode",
    "questionCount",
    "ordering",
    "includeAnswerKey",
  ]),
  publicHiddenModeFlagAllowed: false,
  publicNPlus2Allowed: false,
  publicFormalEquationAllowed: false,
  canonicalRouterChanged: true,
  productionEligibilityChanged: false,
  worksheetRendererChanged: false,
  requiredNextGate: "S60J_G5A_U08_WorksheetAnswerKeyAndRendererIntegration",
});

function normalizeIds(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => String(item ?? "").trim()).filter(Boolean))];
}

function positiveInteger(value, fallback = 1) {
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

function fail(plan, codes, rejectedCount = 0) {
  const uniqueCodes = [...new Set(codes)];
  plan.ok = false;
  plan.errors = uniqueCodes.map((code) => ({ code }));
  plan.visibilityValidation.rejectedCount = rejectedCount;
  plan.visibilityValidation.rejectionCodes = uniqueCodes;
  return plan;
}

function allocateItems(items, totalCount) {
  if (items.length === 0) return [];
  const base = Math.floor(totalCount / items.length);
  let remainder = totalCount % items.length;
  return items.map((item) => {
    const questionCount = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    return { item, questionCount };
  });
}

function allocateByGroupThenFamily(groups, totalCount) {
  const allocation = [];
  for (const { item: group, questionCount: groupCount } of allocateItems(groups, totalCount)) {
    if (groupCount <= 0) continue;
    for (const { item: patternSpecId, questionCount } of allocateItems(group.patternSpecIds ?? [], groupCount)) {
      if (questionCount <= 0) continue;
      allocation.push({ patternGroupId: group.patternGroupId, patternSpecId, questionCount });
    }
  }
  return allocation;
}

function resolveG5AU08Selection(input = {}) {
  const selectionMode = input.selectionMode ?? core.BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT;
  const plan = {
    schemaVersion: "batch-a-kp-resolver-plan-v1",
    worksheetMode: selectionMode === core.BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT ? "batchASource" : "batchAKnowledgePoint",
    selectionMode,
    sourceIds: [SOURCE_ID],
    knowledgePointIds: [],
    patternGroupIds: [],
    patternSpecIds: [],
    allocation: [],
    questionCount: positiveInteger(input.questionCount, 1),
    ordering: input.ordering ?? "groupedByPattern",
    generationSeed: String(input.generationSeed ?? "batch-a-browser"),
    includeAnswerKey: input.includeAnswerKey !== false,
    visibilityValidation: { visibleAcceptedCount: 0, rejectedCount: 0, rejectionCodes: [] },
    provenance: {
      resolver: "visiblePatternGroupResolver",
      sourceId: SOURCE_ID,
      allocationStrategy: "balanced_by_group_then_runtime_family",
      publicHiddenModeFlagUsed: false,
      s60iAdapterApplied: true,
    },
    errors: [],
    warnings: [],
  };

  if (selectionMode === core.BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT) {
    plan.ok = true;
    return plan;
  }
  if (![core.BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT, core.BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT].includes(selectionMode)) {
    return fail(plan, [core.BATCH_A_RESOLVER_ERROR_CODES.SELECTION_MODE_INVALID]);
  }

  const requestedKpIds = normalizeIds(input.selectedKnowledgePointIds);
  if (requestedKpIds.length === 0) return fail(plan, [core.BATCH_A_RESOLVER_ERROR_CODES.NO_VISIBLE_KP]);
  if (selectionMode === core.BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT && requestedKpIds.length !== 1) {
    return fail(plan, [core.BATCH_A_RESOLVER_ERROR_CODES.SELECTION_MODE_INVALID], requestedKpIds.length);
  }

  const knowledgePoints = requestedKpIds.map((id) => getVisibleBatchAKnowledgePoint(id));
  if (knowledgePoints.some((row) => !row || row.sourceId !== SOURCE_ID)) {
    return fail(plan, [core.BATCH_A_RESOLVER_ERROR_CODES.KP_NOT_VISIBLE], knowledgePoints.filter((row) => !row || row.sourceId !== SOURCE_ID).length);
  }
  if (input.sourceId && input.sourceId !== SOURCE_ID) {
    return fail(plan, [core.BATCH_A_RESOLVER_ERROR_CODES.MIXED_SAME_UNIT_SOURCE_MISMATCH]);
  }

  const requestedGroupIds = new Set(normalizeIds(input.selectedPatternGroupIds));
  const linkedGroupIds = new Set();
  const selectedGroups = [];
  const rejected = [];
  for (const knowledgePointId of requestedKpIds) {
    const groups = getVisiblePatternGroupsForKnowledgePoint(knowledgePointId).filter((row) => row.sourceId === SOURCE_ID);
    for (const group of groups) linkedGroupIds.add(group.patternGroupId);
    if (requestedGroupIds.size === 0) {
      if (groups.length !== 1) {
        rejected.push(core.BATCH_A_RESOLVER_ERROR_CODES.PATTERN_GROUP_SELECTION_REQUIRED);
      } else {
        selectedGroups.push(groups[0]);
      }
      continue;
    }
    const matched = groups.filter((group) => requestedGroupIds.has(group.patternGroupId));
    if (matched.length === 0) rejected.push(core.BATCH_A_RESOLVER_ERROR_CODES.PATTERN_GROUP_NOT_LINKED_TO_KP);
    selectedGroups.push(...matched);
  }
  for (const groupId of requestedGroupIds) {
    if (!linkedGroupIds.has(groupId)) rejected.push(core.BATCH_A_RESOLVER_ERROR_CODES.PATTERN_GROUP_NOT_VISIBLE);
  }
  if (rejected.length > 0) return fail(plan, rejected, rejected.length);

  const uniqueGroups = [...new Map(selectedGroups.map((row) => [row.patternGroupId, row])).values()];
  if (uniqueGroups.length === 0) return fail(plan, [core.BATCH_A_RESOLVER_ERROR_CODES.ALL_CANDIDATES_REJECTED]);
  const patternSpecIds = [...new Set(uniqueGroups.flatMap((row) => row.patternSpecIds ?? []))];
  if (patternSpecIds.length === 0) return fail(plan, [core.BATCH_A_RESOLVER_ERROR_CODES.PATTERN_SPEC_MISSING]);

  plan.ok = true;
  plan.knowledgePointIds = [...requestedKpIds].sort();
  plan.patternGroupIds = uniqueGroups.map((row) => row.patternGroupId).sort();
  plan.patternSpecIds = patternSpecIds.sort();
  plan.allocation = allocateByGroupThenFamily(uniqueGroups, plan.questionCount);
  plan.visibilityValidation.visibleAcceptedCount = uniqueGroups.length;
  return plan;
}

export function resolveVisiblePatternGroupSelection(input = {}, options = {}) {
  if (input?.sourceId !== SOURCE_ID) return core.resolveVisiblePatternGroupSelection(input, options);
  return cloneValue(resolveG5AU08Selection(input));
}
