import {
  getVisiblePatternGroupsForKnowledgePoint,
} from "../registry/batch-a-selector-extension.js";
import {
  G4B_U01_HORIZONTAL_PROMOTION_LIFECYCLE,
  G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID,
  isS59FPromotedG4BU01KnowledgePointId,
  isS59FPromotedG4BU01PatternGroupId,
  isS59FPromotedG4BU01PatternSpecId,
} from "../registry/g4b-u01-horizontal-promotion.js";
import {
  generateG4BU01HiddenQuestion,
} from "./g4b-u01-horizontal-generator.js";
import {
  validateG4BU01Question,
} from "./g4b-u01-horizontal-validator.js";

export const G4B_U01_SOURCE_ID = "g4b_u01_4b01";

export const G4B_U01_CANONICAL_ROUTE_KINDS = Object.freeze({
  LEGACY: "legacy",
  PURE_HORIZONTAL: "g4b_u01_pure_horizontal",
  INVALID_HORIZONTAL_SCOPE: "g4b_u01_invalid_horizontal_scope",
});

export const G4B_U01_RESOLVER_BROWSER_STATE_INTEGRATION = Object.freeze({
  task: "S59G_G4B_U01_ResolverBrowserStateAndCanonicalRouterIntegration",
  sourceId: G4B_U01_SOURCE_ID,
  status: "resolver_browser_state_and_canonical_router_integrated_worksheet_gate_pending",
  allocationStrategy: "balanced_by_group_then_family",
  supportedSelectionModes: Object.freeze([
    "singleKnowledgePoint",
    "mixedKnowledgePointsSameUnit",
  ]),
  browserStateFields: Object.freeze([
    "selectionMode",
    "selectedKnowledgePointIds",
    "selectedPatternGroupIds",
    "questionCount",
    "ordering",
    "includeAnswerKey",
  ]),
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
  requiredNextGate: "S59H_G4B_U01_WorksheetAnswerKeyAndHorizontalRendererIntegration",
});

export const G4B_U01_CANONICAL_ROUTER_INTEGRATION = Object.freeze({
  ...G4B_U01_RESOLVER_BROWSER_STATE_INTEGRATION,
  routeKinds: Object.freeze([
    G4B_U01_CANONICAL_ROUTE_KINDS.PURE_HORIZONTAL,
    G4B_U01_CANONICAL_ROUTE_KINDS.INVALID_HORIZONTAL_SCOPE,
  ]),
});

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

function issue(code, path, message, details = {}) {
  return { code, severity: "error", path, message, ...details };
}

function unique(values) {
  return [...new Set(values)];
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

function selectedVisibleGroups(plan) {
  const requestedGroupIds = new Set(plan.selectedPatternGroupIds ?? []);
  const groups = [];
  for (const knowledgePointId of plan.selectedKnowledgePointIds ?? []) {
    const visible = getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)
      .filter((group) => group.sourceId === G4B_U01_SOURCE_ID)
      .filter((group) => requestedGroupIds.size === 0 || requestedGroupIds.has(group.patternGroupId));
    groups.push(...visible);
  }
  const seen = new Set();
  return groups.filter((group) => {
    if (seen.has(group.patternGroupId)) return false;
    seen.add(group.patternGroupId);
    return true;
  });
}

function hierarchicalAllocation(plan) {
  const groups = selectedVisibleGroups(plan);
  const allocation = [];
  for (const { item: group, questionCount: groupCount } of allocateItems(groups, plan.questionCount)) {
    if (groupCount <= 0) continue;
    for (const { item: patternSpecId, questionCount } of allocateItems(group.patternSpecIds ?? [], groupCount)) {
      if (questionCount <= 0) continue;
      allocation.push({
        patternGroupId: group.patternGroupId,
        patternSpecId,
        questionCount,
      });
    }
  }
  return { groups, allocation };
}

export function normalizeG4BU01ResolverPlan(plan = {}) {
  if (plan.sourceId !== G4B_U01_SOURCE_ID) return cloneValue(plan);
  const normalized = cloneValue(plan);
  const { groups, allocation } = hierarchicalAllocation(normalized);
  normalized.selectedPatternGroupIds = groups.map((group) => group.patternGroupId);
  normalized.patternSpecIds = allocation.map((entry) => entry.patternSpecId);
  normalized.allocation = allocation;
  normalized.resolverResult = {
    ...(normalized.resolverResult ?? {}),
    knowledgePointIds: cloneValue(normalized.selectedKnowledgePointIds ?? []),
    patternGroupIds: cloneValue(normalized.selectedPatternGroupIds),
    patternSpecIds: cloneValue(normalized.patternSpecIds),
    allocation: cloneValue(normalized.allocation),
    provenance: {
      ...(normalized.resolverResult?.provenance ?? {}),
      resolver: "visiblePatternGroupResolver",
      sourceId: G4B_U01_SOURCE_ID,
      allocationStrategy: "balanced_by_group_then_family",
      publicHiddenModeFlagUsed: false,
      s59gAdapterApplied: true,
    },
  };
  return normalized;
}

export function classifyG4BU01CanonicalRouterPlan(plan = {}) {
  if (plan.sourceId !== G4B_U01_SOURCE_ID) return G4B_U01_CANONICAL_ROUTE_KINDS.LEGACY;
  if (plan.selectionMode === "sourceUnit" || plan.worksheetMode === "batchASource") {
    return G4B_U01_CANONICAL_ROUTE_KINDS.LEGACY;
  }
  const normalized = normalizeG4BU01ResolverPlan(plan);
  if (
    normalized.resolverResult?.ok !== true
    || !Array.isArray(normalized.allocation)
    || normalized.allocation.length === 0
  ) {
    return G4B_U01_CANONICAL_ROUTE_KINDS.INVALID_HORIZONTAL_SCOPE;
  }
  return normalized.allocation.every((entry) => isS59FPromotedG4BU01PatternSpecId(entry?.patternSpecId))
    ? G4B_U01_CANONICAL_ROUTE_KINDS.PURE_HORIZONTAL
    : G4B_U01_CANONICAL_ROUTE_KINDS.INVALID_HORIZONTAL_SCOPE;
}

export function validateG4BU01CanonicalPlan(plan = {}) {
  const normalized = normalizeG4BU01ResolverPlan(plan);
  const errors = [];
  const allocation = Array.isArray(normalized.allocation) ? normalized.allocation : [];
  const selectedKpIds = new Set(normalized.selectedKnowledgePointIds ?? []);
  const selectedGroupIds = new Set(normalized.selectedPatternGroupIds ?? []);
  const resolverGroupIds = new Set(normalized.resolverResult?.patternGroupIds ?? []);
  const resolverSpecIds = new Set(normalized.resolverResult?.patternSpecIds ?? []);

  if (normalized.sourceId !== G4B_U01_SOURCE_ID) {
    errors.push(issue("G4B_U01_CANONICAL_SOURCE_INVALID", "sourceId", "Canonical horizontal plan has the wrong source."));
  }
  if (normalized.resolverResult?.ok !== true || normalized.resolverResult?.provenance?.resolver !== "visiblePatternGroupResolver") {
    errors.push(issue("G4B_U01_CANONICAL_RESOLVER_REQUIRED", "resolverResult", "A successful visible PatternGroup resolver result is required."));
  }
  if (!new Set(["singleKnowledgePoint", "mixedKnowledgePointsSameUnit"]).has(normalized.selectionMode)) {
    errors.push(issue("G4B_U01_CANONICAL_SELECTION_MODE_INVALID", "selectionMode", "G4B-U01 requires visible same-unit KnowledgePoint selection."));
  }
  if (
    normalized.hiddenMode !== undefined
    || normalized.g4bU01Mode !== undefined
    || normalized.representationMode !== undefined
  ) {
    errors.push(issue("G4B_U01_CANONICAL_PUBLIC_MODE_FLAG_FORBIDDEN", "selectionMode", "No hidden or representation mode flag is allowed."));
  }
  if (!Number.isInteger(normalized.questionCount) || normalized.questionCount <= 0 || normalized.questionCount > 1000) {
    errors.push(issue("G4B_U01_CANONICAL_COUNT_INVALID", "questionCount", "Canonical question count must be between 1 and 1000."));
  }
  if (selectedKpIds.size === 0 || [...selectedKpIds].some((id) => !isS59FPromotedG4BU01KnowledgePointId(id))) {
    errors.push(issue("G4B_U01_CANONICAL_KP_NOT_PROMOTED", "selectedKnowledgePointIds", "All selected KnowledgePoints must be promoted G4B-U01 rows."));
  }
  if (selectedGroupIds.size === 0 || [...selectedGroupIds].some((id) => !isS59FPromotedG4BU01PatternGroupId(id))) {
    errors.push(issue("G4B_U01_CANONICAL_GROUP_NOT_PROMOTED", "selectedPatternGroupIds", "All selected PatternGroups must be visible promoted G4B-U01 rows."));
  }
  if (allocation.length === 0) {
    errors.push(issue("G4B_U01_CANONICAL_ALLOCATION_EMPTY", "allocation", "Canonical allocation is empty."));
  }

  let allocatedCount = 0;
  for (const [index, entry] of allocation.entries()) {
    const path = `allocation[${index}]`;
    if (!Number.isInteger(entry.questionCount) || entry.questionCount <= 0) {
      errors.push(issue("G4B_U01_CANONICAL_ALLOCATION_COUNT_INVALID", `${path}.questionCount`, "Allocation count must be a positive integer."));
      continue;
    }
    allocatedCount += entry.questionCount;
    if (!isS59FPromotedG4BU01PatternSpecId(entry.patternSpecId)) {
      errors.push(issue("G4B_U01_CANONICAL_PATTERN_NOT_PROMOTED", `${path}.patternSpecId`, "Allocation contains an unpromoted PatternSpec."));
    }
    if (!selectedGroupIds.has(entry.patternGroupId) || !resolverGroupIds.has(entry.patternGroupId)) {
      errors.push(issue("G4B_U01_CANONICAL_GROUP_NOT_RESOLVED", `${path}.patternGroupId`, "Allocation group was not selected and resolved visibly."));
    }
    if (!resolverSpecIds.has(entry.patternSpecId)) {
      errors.push(issue("G4B_U01_CANONICAL_PATTERN_NOT_RESOLVED", `${path}.patternSpecId`, "Allocation PatternSpec was not derived from the visible resolver."));
    }
  }
  if (allocatedCount !== normalized.questionCount) {
    errors.push(issue("G4B_U01_CANONICAL_ALLOCATION_MISMATCH", "allocation", "Allocation does not equal the requested count.", {
      expected: normalized.questionCount,
      actual: allocatedCount,
    }));
  }
  if (
    G4B_U01_HORIZONTAL_PROMOTION_LIFECYCLE.selectorStatus !== "visible"
    || G4B_U01_HORIZONTAL_PROMOTION_LIFECYCLE.validatorStatus !== "blocking_validator_accepted"
    || G4B_U01_HORIZONTAL_PROMOTION_LIFECYCLE.productionUse !== "forbidden"
  ) {
    errors.push(issue("G4B_U01_CANONICAL_LIFECYCLE_INVALID", "promotionLifecycle", "S59F visible promotion and S59E blocking validation are required."));
  }
  return { ok: errors.length === 0, errors, warnings: [], plan: normalized };
}

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "s59g")) {
    acc ^= char.charCodeAt(0);
    acc = Math.imul(acc, 16777619);
  }
  return acc >>> 0 || 1;
}

function mix32(value) {
  let mixed = value >>> 0;
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x7feb352d);
  mixed = Math.imul(mixed ^ (mixed >>> 15), 0x846ca68b);
  return (mixed ^ (mixed >>> 16)) >>> 0;
}

function deterministicShuffle(items, seedText) {
  const output = [...items];
  let seed = hashSeed(seedText);
  for (let index = output.length - 1; index > 0; index -= 1) {
    seed = mix32(seed + index * 7919);
    const swapIndex = seed % (index + 1);
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }
  return output;
}

function promoteQuestion(question, plan, allocationEntry, sequenceNumber) {
  return {
    ...question,
    id: `${allocationEntry.patternSpecId}-${sequenceNumber}`,
    phase: "S59G",
    selectorStatus: "visible",
    visibilityStatus: "visible",
    productionUse: "canonical_runtime_only",
    generatorRouting: "canonical_resolver_allocation",
    resolvedPatternGroupId: allocationEntry.patternGroupId,
    promotionRegistryId: G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID,
    validationStatus: "accepted",
    canonicalRoute: {
      kind: G4B_U01_CANONICAL_ROUTE_KINDS.PURE_HORIZONTAL,
      resolver: plan.resolverResult?.provenance?.resolver ?? null,
      allocationStrategy: plan.resolverResult?.provenance?.allocationStrategy ?? null,
      publicHiddenModeFlagUsed: false,
      applicationModeUsed: false,
      verticalRepresentationUsed: false,
    },
    metadata: {
      ...cloneValue(question.metadata ?? {}),
      resolvedPatternGroupId: allocationEntry.patternGroupId,
      promotionRegistryId: G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID,
      patternTags: unique([...(question.metadata?.patternTags ?? []), "s59g_canonical_resolver_route"]),
      difficultyTags: unique([...(question.metadata?.difficultyTags ?? []), "s59g_canonical_public_route"]),
    },
  };
}

export function validateG4BU01CanonicalQuestion(question = {}) {
  const canonicalErrors = [];
  if (question.canonicalRoute?.kind !== G4B_U01_CANONICAL_ROUTE_KINDS.PURE_HORIZONTAL) {
    canonicalErrors.push(issue("G4B_U01_CANONICAL_ROUTE_METADATA_INVALID", "canonicalRoute.kind", "Canonical route metadata is invalid."));
  }
  if (
    question.selectorStatus !== "visible"
    || question.visibilityStatus !== "visible"
    || question.productionUse !== "canonical_runtime_only"
    || question.generatorRouting !== "canonical_resolver_allocation"
    || question.promotionRegistryId !== G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID
  ) {
    canonicalErrors.push(issue("G4B_U01_CANONICAL_LIFECYCLE_INVALID", "productionUse", "Canonical question lifecycle metadata is invalid."));
  }
  const arithmetic = validateG4BU01Question({
    ...question,
    selectorStatus: "hidden",
    productionUse: "forbidden",
    generatorRouting: "hidden_only_not_canonical",
  });
  return {
    ok: canonicalErrors.length === 0 && arithmetic.ok,
    errors: [...canonicalErrors, ...arithmetic.errors],
    warnings: arithmetic.warnings,
    blockingCodes: [...canonicalErrors.map((entry) => entry.code), ...arithmetic.blockingCodes],
  };
}

export function generateG4BU01CanonicalHorizontalQuestions(plan = {}, options = {}) {
  const planValidation = validateG4BU01CanonicalPlan(plan);
  const normalized = planValidation.plan;
  if (!planValidation.ok) {
    return {
      ok: false,
      plan: normalized,
      questions: [],
      allocation: cloneValue(normalized.allocation ?? []),
      validation: planValidation,
      errors: planValidation.errors,
      warnings: [],
    };
  }

  const validator = typeof options.validator === "function" ? options.validator : validateG4BU01Question;
  const questions = [];
  const errors = [];
  const warnings = [];
  let sequenceNumber = 0;

  for (const allocationEntry of normalized.allocation) {
    for (let occurrenceIndex = 0; occurrenceIndex < allocationEntry.questionCount; occurrenceIndex += 1) {
      sequenceNumber += 1;
      const hidden = generateG4BU01HiddenQuestion(allocationEntry.patternSpecId, {
        seed: `${normalized.generationSeed}:canonical:${allocationEntry.patternSpecId}`,
        sequenceNumber: occurrenceIndex + 1,
      });
      const checked = validator(hidden);
      warnings.push(...(checked.warnings ?? []).map((entry) => ({ ...entry, path: `questions[${sequenceNumber - 1}].${entry.path ?? "validation"}` })));
      if (checked.ok !== true) {
        errors.push(...(checked.errors ?? []).map((entry) => ({ ...entry, path: `questions[${sequenceNumber - 1}].${entry.path ?? "validation"}` })));
        continue;
      }
      const promoted = promoteQuestion(hidden, normalized, allocationEntry, sequenceNumber);
      const canonicalChecked = validateG4BU01CanonicalQuestion(promoted);
      if (!canonicalChecked.ok) {
        errors.push(...canonicalChecked.errors.map((entry) => ({ ...entry, path: `questions[${sequenceNumber - 1}].${entry.path ?? "canonical"}` })));
        continue;
      }
      questions.push(promoted);
    }
  }

  if (questions.length !== normalized.questionCount) {
    errors.push(issue("G4B_U01_CANONICAL_OUTPUT_COUNT_MISMATCH", "questions", "Canonical output count does not match resolver allocation.", {
      expected: normalized.questionCount,
      actual: questions.length,
    }));
  }
  const ok = errors.length === 0;
  const orderedQuestions = ok && normalized.ordering === "shuffleAcrossPatterns"
    ? deterministicShuffle(questions, `${normalized.generationSeed}:s59g-canonical-shuffle:${normalized.questionCount}`)
    : questions;
  return {
    ok,
    plan: { ...normalized, routeKind: G4B_U01_CANONICAL_ROUTE_KINDS.PURE_HORIZONTAL },
    questions: ok ? orderedQuestions : [],
    allocation: cloneValue(normalized.allocation),
    errors,
    warnings,
  };
}
