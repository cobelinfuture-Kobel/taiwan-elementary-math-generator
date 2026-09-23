import {
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
} from "../registry/batch-a-selector-extension.js";
import {
  G4B_U04_PROMOTION_LIFECYCLE,
  G4B_U04_PROMOTION_REGISTRY_ID,
  G4B_U04_PROMOTED_PATTERN_GROUP_IDS,
  G4B_U04_PROMOTED_PATTERN_SPEC_IDS,
  G4B_U04_PUBLIC_CONTROLS,
  G4B_U04_SOURCE_ID,
  isS72PromotedG4BU04KnowledgePointId,
  isS72PromotedG4BU04PatternGroupId,
  isS72PromotedG4BU04PatternSpecId,
} from "../registry/g4b-u04-promotion.js";
import {
  getG4BU04HiddenPatternSpecById,
} from "./source-pattern-g4b-u04-extension.js";
import {
  generateG4BU04IntegratedBatch,
  generateG4BU04IntegratedQuestion,
  validateG4BU04IntegratedBatch,
  validateG4BU04IntegratedQuestion,
} from "./g4b-u04-class-c-d-integration-gate.js";
import {
  G4B_U04_PROMPT_DEDUPLICATION_CONTRACT,
  allocateG4BU04UniquePromptCapacity,
  generateUniqueG4BU04QuestionSet,
  normalizeG4BU04PromptSignature,
} from "./g4b-u04-prompt-deduplication.js";

export const G4B_U04_CANONICAL_ROUTE_KINDS = Object.freeze({
  LEGACY: "legacy",
  CANONICAL: "g4b_u04_rounding_approximation",
  INVALID_SCOPE: "g4b_u04_invalid_public_scope",
});

export const G4B_U04_CANONICAL_ROUTER_INTEGRATION = Object.freeze({
  task: "S72_G4B_U04_PromotionResolverAndPublicSelectorIntegration",
  promptDeduplicationTask: "G4B_U04_R2B_WorksheetPromptDeduplication",
  sourceId: G4B_U04_SOURCE_ID,
  status: "canonical_runtime_integrated_with_unique_prompt_gate",
  allocationStrategy: "capacity_aware_round_robin",
  promptDeduplicationVersion: G4B_U04_PROMPT_DEDUPLICATION_CONTRACT.version,
  supportedSelectionModes: Object.freeze(["singleKnowledgePoint", "mixedKnowledgePointsSameUnit"]),
  browserStateFields: Object.freeze([
    "selectionMode",
    "selectedKnowledgePointIds",
    "selectedPatternGroupIds",
    "questionMode",
    "questionCount",
    "ordering",
    "includeAnswerKey",
  ]),
  resolverDerivedOnly: true,
  arbitraryPatternSpecInjectionAllowed: false,
  blockingValidatorRequired: true,
  genericFallbackAllowed: false,
  productionEligibilityChanged: false,
  worksheetRendererChanged: false,
  requiredNextGate: "S73_G4B_U04_WorksheetAnswerKeyAndRendererIntegration",
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

function normalizeIds(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => String(item ?? "").trim()).filter(Boolean))];
}

function normalizeQuestionMode(value) {
  return G4B_U04_PUBLIC_CONTROLS.questionModes.includes(value)
    ? value
    : G4B_U04_PUBLIC_CONTROLS.defaults.questionMode;
}

function selectedVisibleGroups(plan, questionMode) {
  const requestedGroupIds = new Set(normalizeIds(plan.selectedPatternGroupIds));
  const groups = [];
  const errors = [];
  const linkedGroupIds = new Set();

  for (const knowledgePointId of normalizeIds(plan.selectedKnowledgePointIds)) {
    const knowledgePoint = getVisibleBatchAKnowledgePoint(knowledgePointId);
    if (!knowledgePoint || knowledgePoint.sourceId !== G4B_U04_SOURCE_ID) {
      errors.push(issue("G4B_U04_CANONICAL_KP_NOT_PROMOTED", "selectedKnowledgePointIds", "選取的 KnowledgePoint 尚未核准。", { knowledgePointId }));
      continue;
    }
    const candidates = getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)
      .filter((row) => row.sourceId === G4B_U04_SOURCE_ID);
    for (const group of candidates) linkedGroupIds.add(group.patternGroupId);
    const matched = candidates.filter((group) => {
      if (requestedGroupIds.size > 0 && !requestedGroupIds.has(group.patternGroupId)) return false;
      return questionMode === "mixed" || group.mode === questionMode;
    });
    groups.push(...matched);
  }

  for (const groupId of requestedGroupIds) {
    if (!linkedGroupIds.has(groupId)) {
      errors.push(issue("G4B_U04_CANONICAL_GROUP_NOT_PROMOTED", "selectedPatternGroupIds", "指定的 PatternGroup 未連結到所選 KnowledgePoint。", { patternGroupId: groupId }));
    }
  }

  const uniqueGroups = G4B_U04_PROMOTED_PATTERN_GROUP_IDS
    .map((id) => groups.find((group) => group.patternGroupId === id))
    .filter(Boolean);
  if (uniqueGroups.length === 0) {
    errors.push(issue("G4B_U04_CANONICAL_GROUP_NOT_RESOLVED", "selectedPatternGroupIds", "所選 KnowledgePoint 沒有符合題目模式的公開 PatternGroup。", { questionMode }));
  }
  return { groups: uniqueGroups, errors };
}

export function normalizeG4BU04ResolverPlan(plan = {}) {
  if (plan.sourceId !== G4B_U04_SOURCE_ID) return cloneValue(plan);
  const normalized = cloneValue(plan);
  const questionMode = normalizeQuestionMode(normalized.questionMode);
  const selectedKnowledgePointIds = normalizeIds(normalized.selectedKnowledgePointIds);
  const errors = [];

  if (!["singleKnowledgePoint", "mixedKnowledgePointsSameUnit"].includes(normalized.selectionMode)) {
    errors.push(issue("G4B_U04_CANONICAL_SELECTION_MODE_INVALID", "selectionMode", "G4B-U04 只允許單一或同單元混合 KnowledgePoint。"));
  }
  if (selectedKnowledgePointIds.length === 0) {
    errors.push(issue("G4B_U04_CANONICAL_KP_NOT_PROMOTED", "selectedKnowledgePointIds", "至少要選取一個公開 KnowledgePoint。"));
  }
  if (normalized.selectionMode === "singleKnowledgePoint" && selectedKnowledgePointIds.length !== 1) {
    errors.push(issue("G4B_U04_CANONICAL_SELECTION_MODE_INVALID", "selectedKnowledgePointIds", "單一 KnowledgePoint 模式只能選取一項。"));
  }
  if (selectedKnowledgePointIds.some((id) => !isS72PromotedG4BU04KnowledgePointId(id))) {
    errors.push(issue("G4B_U04_CANONICAL_KP_NOT_PROMOTED", "selectedKnowledgePointIds", "選取範圍含未核准 KnowledgePoint。"));
  }

  const selected = selectedVisibleGroups({ ...normalized, selectedKnowledgePointIds }, questionMode);
  errors.push(...selected.errors);
  const patternSpecIds = G4B_U04_PROMOTED_PATTERN_SPEC_IDS.filter((id) =>
    selected.groups.some((group) => group.patternSpecIds.includes(id))
  );
  if (patternSpecIds.length === 0) {
    errors.push(issue("G4B_U04_CANONICAL_PATTERN_NOT_PROMOTED", "patternSpecIds", "公開選擇沒有可用的 PatternSpec。"));
  }

  const questionCount = Number(normalized.questionCount);
  const capacityAllocation = Number.isSafeInteger(questionCount) && questionCount > 0 && patternSpecIds.length > 0
    ? allocateG4BU04UniquePromptCapacity(questionCount, patternSpecIds)
    : null;
  if (capacityAllocation?.ok === false) errors.push(...cloneValue(capacityAllocation.errors));
  const patternAllocation = capacityAllocation?.patternAllocation ?? {};
  const allocation = patternSpecIds
    .filter((id) => (patternAllocation[id] ?? 0) > 0)
    .map((patternSpecId) => {
      const spec = getG4BU04HiddenPatternSpecById(patternSpecId);
      return {
        patternGroupId: spec.patternGroupId,
        knowledgePointId: spec.knowledgePointId,
        mode: spec.mode,
        implementationClass: spec.implementationClass,
        patternSpecId,
        questionCount: patternAllocation[patternSpecId],
      };
    });

  normalized.questionMode = questionMode;
  normalized.publicControls = { questionMode };
  normalized.selectedKnowledgePointIds = selectedKnowledgePointIds;
  normalized.selectedPatternGroupIds = selected.groups.map((group) => group.patternGroupId);
  normalized.patternSpecIds = patternSpecIds;
  normalized.patternAllocation = cloneValue(patternAllocation);
  normalized.allocation = allocation;
  normalized.promptDeduplication = {
    version: G4B_U04_PROMPT_DEDUPLICATION_CONTRACT.version,
    allocationStrategy: G4B_U04_PROMPT_DEDUPLICATION_CONTRACT.allocationStrategy,
    exactDuplicateAllowed: false,
    capacity: capacityAllocation ? {
      allocatedQuestionCount: capacityAllocation.allocatedQuestionCount,
      requestedQuestionCount: capacityAllocation.requestedQuestionCount,
      exhaustedPatternSpecIds: cloneValue(capacityAllocation.exhaustedPatternSpecIds),
    } : null,
  };
  normalized.publicPatternSpecInjectionUsed = false;
  normalized.genericFallbackAllowed = false;
  normalized.resolverResult = {
    ok: errors.length === 0,
    errors: cloneValue(errors),
    warnings: [],
    knowledgePointIds: cloneValue(selectedKnowledgePointIds),
    patternGroupIds: cloneValue(normalized.selectedPatternGroupIds),
    patternSpecIds: cloneValue(patternSpecIds),
    allocation: cloneValue(allocation),
    promptDeduplication: cloneValue(normalized.promptDeduplication),
    provenance: {
      resolver: "g4bU04VisiblePatternGroupResolver",
      sourceId: G4B_U04_SOURCE_ID,
      allocationStrategy: "capacity_aware_round_robin",
      promptDeduplicationVersion: G4B_U04_PROMPT_DEDUPLICATION_CONTRACT.version,
      arbitraryPatternSpecInjectionIgnored: true,
      publicHiddenModeFlagUsed: false,
      s72AdapterApplied: true,
      r2bPromptDeduplicationApplied: true,
    },
  };
  return normalized;
}

export function classifyG4BU04CanonicalRouterPlan(plan = {}) {
  if (plan.sourceId !== G4B_U04_SOURCE_ID) return G4B_U04_CANONICAL_ROUTE_KINDS.LEGACY;
  if (plan.selectionMode === "sourceUnit" || plan.worksheetMode === "batchASource") return G4B_U04_CANONICAL_ROUTE_KINDS.LEGACY;
  const normalized = normalizeG4BU04ResolverPlan(plan);
  if (normalized.resolverResult?.ok !== true || normalized.patternSpecIds.length === 0) {
    return G4B_U04_CANONICAL_ROUTE_KINDS.INVALID_SCOPE;
  }
  return normalized.patternSpecIds.every(isS72PromotedG4BU04PatternSpecId)
    ? G4B_U04_CANONICAL_ROUTE_KINDS.CANONICAL
    : G4B_U04_CANONICAL_ROUTE_KINDS.INVALID_SCOPE;
}

export function validateG4BU04CanonicalPlan(plan = {}) {
  const normalized = normalizeG4BU04ResolverPlan(plan);
  const errors = [...(normalized.resolverResult?.errors ?? [])];
  if (normalized.sourceId !== G4B_U04_SOURCE_ID) errors.push(issue("G4B_U04_CANONICAL_SOURCE_INVALID", "sourceId", "公開路由來源不是 G4B-U04。"));
  if (normalized.resolverResult?.provenance?.resolver !== "g4bU04VisiblePatternGroupResolver") {
    errors.push(issue("G4B_U04_CANONICAL_RESOLVER_REQUIRED", "resolverResult", "必須使用 G4B-U04 visible resolver。"));
  }
  if (!Number.isSafeInteger(normalized.questionCount) || normalized.questionCount < 1 || normalized.questionCount > 1000) {
    errors.push(issue("G4B_U04_CANONICAL_COUNT_INVALID", "questionCount", "公開 runtime 題數必須介於 1 到 1000。"));
  }
  if (!G4B_U04_PUBLIC_CONTROLS.questionModes.includes(normalized.questionMode)) {
    errors.push(issue("G4B_U04_CANONICAL_QUESTION_MODE_INVALID", "questionMode", "題目模式無效。"));
  }
  if ((normalized.selectedKnowledgePointIds ?? []).some((id) => !isS72PromotedG4BU04KnowledgePointId(id))) {
    errors.push(issue("G4B_U04_CANONICAL_KP_NOT_PROMOTED", "selectedKnowledgePointIds", "KnowledgePoint 未核准。"));
  }
  if ((normalized.selectedPatternGroupIds ?? []).some((id) => !isS72PromotedG4BU04PatternGroupId(id))) {
    errors.push(issue("G4B_U04_CANONICAL_GROUP_NOT_PROMOTED", "selectedPatternGroupIds", "PatternGroup 未核准。"));
  }
  if ((normalized.patternSpecIds ?? []).some((id) => !isS72PromotedG4BU04PatternSpecId(id))) {
    errors.push(issue("G4B_U04_CANONICAL_PATTERN_NOT_PROMOTED", "patternSpecIds", "PatternSpec 未核准。"));
  }
  const allocated = (normalized.allocation ?? []).reduce((sum, entry) => sum + entry.questionCount, 0);
  if (allocated !== normalized.questionCount) {
    errors.push(issue("G4B_U04_CANONICAL_ALLOCATION_MISMATCH", "allocation", "配置總題數與請求題數不一致。", { expected: normalized.questionCount, actual: allocated }));
  }
  if (normalized.publicPatternSpecInjectionUsed !== false || normalized.genericFallbackAllowed !== false) {
    errors.push(issue("G4B_U04_CANONICAL_FALLBACK_FORBIDDEN", "publicControls", "禁止任意 PatternSpec 注入或 generic fallback。"));
  }
  if (
    G4B_U04_PROMOTION_LIFECYCLE.selectorStatus !== "visible"
    || G4B_U04_PROMOTION_LIFECYCLE.canonicalRouting !== "enabled"
    || G4B_U04_PROMOTION_LIFECYCLE.worksheetStatus !== "not_eligible"
    || G4B_U04_PROMOTION_LIFECYCLE.productionUse !== "forbidden"
  ) {
    errors.push(issue("G4B_U04_CANONICAL_LIFECYCLE_INVALID", "promotionLifecycle", "S72 lifecycle gate 不一致。"));
  }
  return { ok: errors.length === 0, errors, warnings: [], plan: normalized };
}

function promoteQuestion(question, plan, sequenceNumber) {
  const spec = getG4BU04HiddenPatternSpecById(question.patternSpecId);
  return {
    ...question,
    id: `${question.patternSpecId}-${sequenceNumber}`,
    phase: "S72",
    selectorStatus: "visible",
    visibilityStatus: "visible",
    canonicalRouting: "enabled",
    productionUse: "canonical_runtime_only",
    generatorRouting: "canonical_resolver_allocation",
    resolvedPatternGroupId: spec.patternGroupId,
    promotionRegistryId: G4B_U04_PROMOTION_REGISTRY_ID,
    validationStatus: "accepted",
    canonicalRoute: {
      kind: G4B_U04_CANONICAL_ROUTE_KINDS.CANONICAL,
      implementationClass: spec.implementationClass,
      resolver: plan.resolverResult?.provenance?.resolver ?? null,
      allocationStrategy: plan.resolverResult?.provenance?.allocationStrategy ?? null,
      promptDeduplicationVersion: G4B_U04_PROMPT_DEDUPLICATION_CONTRACT.version,
      questionMode: plan.questionMode,
      arbitraryPatternSpecInjectionUsed: false,
      genericFallbackUsed: false,
    },
    metadata: {
      resolvedPatternGroupId: spec.patternGroupId,
      promotionRegistryId: G4B_U04_PROMOTION_REGISTRY_ID,
      publicControls: cloneValue(plan.publicControls),
      promptSignatureVersion: G4B_U04_PROMPT_DEDUPLICATION_CONTRACT.version,
      promptSignature: normalizeG4BU04PromptSignature(question.promptText),
    },
  };
}

export function validateG4BU04CanonicalQuestion(question = {}) {
  const errors = [];
  if (question.sourceId !== G4B_U04_SOURCE_ID || question.unitCode !== "4B-U04") errors.push(issue("G4B_U04_CANONICAL_SOURCE_INVALID", "sourceId", "題目來源錯誤。"));
  if (!isS72PromotedG4BU04KnowledgePointId(question.knowledgePointId)) errors.push(issue("G4B_U04_CANONICAL_KP_NOT_PROMOTED", "knowledgePointId", "KnowledgePoint 未核准。"));
  if (!isS72PromotedG4BU04PatternGroupId(question.resolvedPatternGroupId ?? question.patternGroupId)) errors.push(issue("G4B_U04_CANONICAL_GROUP_NOT_PROMOTED", "resolvedPatternGroupId", "PatternGroup 未核准。"));
  if (!isS72PromotedG4BU04PatternSpecId(question.patternSpecId)) errors.push(issue("G4B_U04_CANONICAL_PATTERN_NOT_PROMOTED", "patternSpecId", "PatternSpec 未核准。"));
  if (
    question.phase !== "S72"
    || question.selectorStatus !== "visible"
    || question.visibilityStatus !== "visible"
    || question.canonicalRouting !== "enabled"
    || question.productionUse !== "canonical_runtime_only"
    || question.generatorRouting !== "canonical_resolver_allocation"
    || question.promotionRegistryId !== G4B_U04_PROMOTION_REGISTRY_ID
  ) {
    errors.push(issue("G4B_U04_CANONICAL_LIFECYCLE_INVALID", "phase", "Canonical lifecycle metadata 不一致。"));
  }
  if (
    question.canonicalRoute?.kind !== G4B_U04_CANONICAL_ROUTE_KINDS.CANONICAL
    || question.canonicalRoute?.arbitraryPatternSpecInjectionUsed !== false
    || question.canonicalRoute?.genericFallbackUsed !== false
  ) {
    errors.push(issue("G4B_U04_CANONICAL_ROUTE_INVALID", "canonicalRoute", "Canonical route metadata 不一致。"));
  }
  if (
    question.metadata?.promptSignatureVersion !== G4B_U04_PROMPT_DEDUPLICATION_CONTRACT.version
    || question.metadata?.promptSignature !== normalizeG4BU04PromptSignature(question.promptText)
  ) {
    errors.push(issue("G4B_U04_CANONICAL_PROMPT_SIGNATURE_INVALID", "metadata.promptSignature", "Canonical 題目的 prompt signature 不一致。"));
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function generateG4BU04CanonicalQuestions(plan = {}, options = {}) {
  const checked = validateG4BU04CanonicalPlan(plan);
  const normalized = checked.plan;
  if (!checked.ok) {
    return { ok: false, plan: normalized, questions: [], allocation: cloneValue(normalized.allocation ?? []), errors: checked.errors, warnings: [] };
  }

  const hiddenBatch = generateG4BU04IntegratedBatch({
    questionCount: normalized.questionCount,
    patternSpecIds: normalized.patternSpecIds,
    seed: normalized.generationSeed ?? "s72-public",
    ordering: normalized.ordering ?? "groupedByPattern",
    coverageMode: "selectedPatterns",
  });
  const validator = options.integratedValidator ?? validateG4BU04IntegratedBatch;
  const validation = validator(hiddenBatch);
  if (validation?.ok !== true) {
    return {
      ok: false,
      plan: normalized,
      questions: [],
      allocation: cloneValue(normalized.allocation),
      errors: cloneValue(validation?.errors ?? [issue("G4B_U04_CANONICAL_VALIDATION_FAILED", "validation", "Blocking validator 拒絕 generated batch。")]),
      warnings: cloneValue(validation?.warnings ?? []),
    };
  }

  const uniqueGeneration = generateUniqueG4BU04QuestionSet({
    patternSpecIds: normalized.patternSpecIds,
    patternAllocation: normalized.patternAllocation,
    seed: normalized.generationSeed ?? "s72-public",
    ordering: normalized.ordering ?? "groupedByPattern",
    generateQuestion: generateG4BU04IntegratedQuestion,
    validateQuestion: validateG4BU04IntegratedQuestion,
  });
  if (!uniqueGeneration.ok) {
    return {
      ok: false,
      plan: normalized,
      questions: [],
      allocation: cloneValue(normalized.allocation),
      deduplication: cloneValue(uniqueGeneration.report),
      errors: cloneValue(uniqueGeneration.errors),
      warnings: cloneValue(validation.warnings ?? []),
    };
  }

  const promoted = uniqueGeneration.questions.map((question, index) => promoteQuestion(question, normalized, index + 1));
  const lifecycleErrors = promoted.flatMap((question) => validateG4BU04CanonicalQuestion(question).errors);
  const signatures = promoted.map((question) => normalizeG4BU04PromptSignature(question.promptText));
  if (new Set(signatures).size !== signatures.length) {
    lifecycleErrors.push(issue("G4B_U04_CANONICAL_DUPLICATE_PROMPT", "questions", "Canonical output 含重複題面。"));
  }
  if (promoted.length !== normalized.questionCount) {
    lifecycleErrors.push(issue("G4B_U04_CANONICAL_OUTPUT_COUNT_MISMATCH", "questions", "Canonical output 題數不一致。", { expected: normalized.questionCount, actual: promoted.length }));
  }
  if (lifecycleErrors.length > 0) {
    return {
      ok: false,
      plan: normalized,
      questions: [],
      allocation: cloneValue(normalized.allocation),
      deduplication: cloneValue(uniqueGeneration.report),
      errors: lifecycleErrors,
      warnings: [],
    };
  }
  return {
    ok: true,
    plan: { ...normalized, routeKind: G4B_U04_CANONICAL_ROUTE_KINDS.CANONICAL },
    questions: promoted,
    allocation: cloneValue(normalized.allocation),
    deduplication: cloneValue(uniqueGeneration.report),
    errors: [],
    warnings: cloneValue(validation.warnings ?? []),
  };
}
