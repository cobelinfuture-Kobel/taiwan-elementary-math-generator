import {
  getVisiblePatternGroupsForKnowledgePoint,
} from "../registry/batch-a-selector-extension.js";
import {
  G5A_U08_PROMOTION_LIFECYCLE,
  G5A_U08_PROMOTION_REGISTRY_ID,
  G5A_U08_PUBLIC_CONTROLS,
  G5A_U08_SOURCE_ID,
  isS60IPromotedG5AU08KnowledgePointId,
  isS60IPromotedG5AU08PatternGroupId,
  isS60IPromotedG5AU08PatternSpecId,
} from "../registry/g5a-u08-promotion.js";
import {
  G5A_U08_S60G_PATTERN_SPEC_IDS,
  generateG5AU08HiddenBatch,
} from "./g5a-u08-numeric-generator.js";
import {
  validateG5AU08HiddenBatch,
} from "./g5a-u08-numeric-validator.js";
import {
  G5A_U08_S60H_PATTERN_SPEC_IDS,
  SPEC_POLICY,
  generateG5AU08ApplicationBatch,
} from "./g5a-u08-application-generator.js";
import {
  validateG5AU08ApplicationBatch,
} from "./g5a-u08-application-validator.js";

export const G5A_U08_CANONICAL_ROUTE_KINDS = Object.freeze({
  LEGACY: "legacy",
  CANONICAL: "g5a_u08_integer_four_operations",
  INVALID_SCOPE: "g5a_u08_invalid_public_scope",
});

export const G5A_U08_CANONICAL_ROUTER_INTEGRATION = Object.freeze({
  task: "S60I_G5A_U08_PromotionResolverAndPublicSelectorIntegration",
  sourceId: G5A_U08_SOURCE_ID,
  status: "canonical_runtime_integrated_worksheet_gate_pending",
  allocationStrategy: "balanced_by_group_then_runtime_family",
  supportedSelectionModes: Object.freeze(["singleKnowledgePoint", "mixedKnowledgePointsSameUnit"]),
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
  resolverDerivedOnly: true,
  blockingValidatorRequired: true,
  genericFallbackAllowed: false,
  publicNPlus2Allowed: false,
  publicFormalEquationAllowed: false,
  productionEligibilityChanged: false,
  worksheetRendererChanged: false,
  requiredNextGate: "S60J_G5A_U08_WorksheetAnswerKeyAndRendererIntegration",
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

function normalize(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function normalizeControls(plan = {}) {
  return {
    questionMode: normalize(plan.questionMode, G5A_U08_PUBLIC_CONTROLS.questionModes, G5A_U08_PUBLIC_CONTROLS.defaults.questionMode),
    depthMode: normalize(plan.depthMode, G5A_U08_PUBLIC_CONTROLS.depthModes, G5A_U08_PUBLIC_CONTROLS.defaults.depthMode),
    contextMode: normalize(plan.contextMode, G5A_U08_PUBLIC_CONTROLS.contextModes, G5A_U08_PUBLIC_CONTROLS.defaults.contextMode),
  };
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

function runtimeKindForSpec(patternSpecId) {
  if (G5A_U08_S60G_PATTERN_SPEC_IDS.includes(patternSpecId)) return "numeric_or_noncontext_reasoning";
  if (G5A_U08_S60H_PATTERN_SPEC_IDS.includes(patternSpecId)) return "contextual_application_or_reasoning";
  return null;
}

function specCompatible(patternSpecId, controls) {
  const runtimeKind = runtimeKindForSpec(patternSpecId);
  if (runtimeKind === "numeric_or_noncontext_reasoning") {
    return controls.depthMode !== "N_PLUS_1";
  }
  if (runtimeKind === "contextual_application_or_reasoning") {
    const policy = SPEC_POLICY[patternSpecId];
    if (!policy) return false;
    const depthOk = controls.depthMode === "mixed" || policy.depths.includes(controls.depthMode);
    const contextOk = controls.contextMode === "mixed" || policy.contexts.includes(controls.contextMode);
    return depthOk && contextOk;
  }
  return false;
}

function selectedVisibleGroups(plan, controls) {
  const requestedGroupIds = new Set(plan.selectedPatternGroupIds ?? []);
  const groups = [];
  for (const knowledgePointId of plan.selectedKnowledgePointIds ?? []) {
    for (const group of getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)) {
      if (group.sourceId !== G5A_U08_SOURCE_ID) continue;
      if (requestedGroupIds.size > 0 && !requestedGroupIds.has(group.patternGroupId)) continue;
      if (controls.questionMode !== "mixed" && group.mode !== controls.questionMode) continue;
      const compatiblePatternSpecIds = (group.patternSpecIds ?? []).filter((id) => specCompatible(id, controls));
      if (compatiblePatternSpecIds.length === 0) continue;
      groups.push({ ...group, patternSpecIds: compatiblePatternSpecIds });
    }
  }
  return [...new Map(groups.map((group) => [group.patternGroupId, group])).values()];
}

function buildAllocation(groups, questionCount) {
  const allocation = [];
  for (const { item: group, questionCount: groupCount } of allocateItems(groups, questionCount)) {
    if (groupCount <= 0) continue;
    const runtimeKinds = [...new Set(group.patternSpecIds.map(runtimeKindForSpec))];
    if (runtimeKinds.length !== 1 || !runtimeKinds[0]) continue;
    allocation.push({
      patternGroupId: group.patternGroupId,
      knowledgePointId: group.primaryKnowledgePointId,
      mode: group.mode,
      runtimeKind: runtimeKinds[0],
      selectedPatternSpecIds: [...group.patternSpecIds],
      questionCount: groupCount,
    });
  }
  return allocation;
}

export function normalizeG5AU08ResolverPlan(plan = {}) {
  if (plan.sourceId !== G5A_U08_SOURCE_ID) return cloneValue(plan);
  const normalized = cloneValue(plan);
  const controls = normalizeControls(normalized);
  const groups = selectedVisibleGroups(normalized, controls);
  const allocation = buildAllocation(groups, normalized.questionCount);
  normalized.questionMode = controls.questionMode;
  normalized.depthMode = controls.depthMode;
  normalized.contextMode = controls.contextMode;
  normalized.publicControls = { ...controls };
  normalized.publicNPlus2 = false;
  normalized.publicFormalEquation = false;
  normalized.selectedPatternGroupIds = groups.map((group) => group.patternGroupId);
  normalized.patternSpecIds = [...new Set(allocation.flatMap((entry) => entry.selectedPatternSpecIds))];
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
      sourceId: G5A_U08_SOURCE_ID,
      allocationStrategy: "balanced_by_group_then_runtime_family",
      publicHiddenModeFlagUsed: false,
      s60iAdapterApplied: true,
    },
  };
  return normalized;
}

export function classifyG5AU08CanonicalRouterPlan(plan = {}) {
  if (plan.sourceId !== G5A_U08_SOURCE_ID) return G5A_U08_CANONICAL_ROUTE_KINDS.LEGACY;
  if (plan.selectionMode === "sourceUnit" || plan.worksheetMode === "batchASource") return G5A_U08_CANONICAL_ROUTE_KINDS.LEGACY;
  const normalized = normalizeG5AU08ResolverPlan(plan);
  if (normalized.resolverResult?.ok !== true || normalized.allocation.length === 0) {
    return G5A_U08_CANONICAL_ROUTE_KINDS.INVALID_SCOPE;
  }
  return normalized.patternSpecIds.every(isS60IPromotedG5AU08PatternSpecId)
    ? G5A_U08_CANONICAL_ROUTE_KINDS.CANONICAL
    : G5A_U08_CANONICAL_ROUTE_KINDS.INVALID_SCOPE;
}

export function validateG5AU08CanonicalPlan(plan = {}) {
  const normalized = normalizeG5AU08ResolverPlan(plan);
  const errors = [];
  if (normalized.sourceId !== G5A_U08_SOURCE_ID) errors.push(issue("G5A_U08_CANONICAL_SOURCE_INVALID", "sourceId", "公開路由來源不是 G5A-U08。"));
  if (normalized.resolverResult?.ok !== true || normalized.resolverResult?.provenance?.resolver !== "visiblePatternGroupResolver") {
    errors.push(issue("G5A_U08_CANONICAL_RESOLVER_REQUIRED", "resolverResult", "必須使用成功的 visible PatternGroup resolver。"));
  }
  if (!["singleKnowledgePoint", "mixedKnowledgePointsSameUnit"].includes(normalized.selectionMode)) {
    errors.push(issue("G5A_U08_CANONICAL_SELECTION_MODE_INVALID", "selectionMode", "G5A-U08 只允許單一或同單元混合 KnowledgePoint。"));
  }
  if (!Number.isInteger(normalized.questionCount) || normalized.questionCount < 1 || normalized.questionCount > 1000) {
    errors.push(issue("G5A_U08_CANONICAL_COUNT_INVALID", "questionCount", "公開 runtime 題數必須介於 1 到 1000。"));
  }
  if (!G5A_U08_PUBLIC_CONTROLS.questionModes.includes(normalized.questionMode)) errors.push(issue("G5A_U08_CANONICAL_QUESTION_MODE_INVALID", "questionMode", "題目模式無效。"));
  if (!G5A_U08_PUBLIC_CONTROLS.depthModes.includes(normalized.depthMode)) errors.push(issue("G5A_U08_CANONICAL_DEPTH_MODE_INVALID", "depthMode", "深度模式無效。"));
  if (!G5A_U08_PUBLIC_CONTROLS.contextModes.includes(normalized.contextMode)) errors.push(issue("G5A_U08_CANONICAL_CONTEXT_MODE_INVALID", "contextMode", "情境模式無效。"));
  if (normalized.publicNPlus2 !== false || normalized.publicFormalEquation !== false || normalized.depthMode === "N_PLUS_2") {
    errors.push(issue("G5A_U08_CANONICAL_FUTURE_MODE_FORBIDDEN", "publicControls", "N+2 與正式方程式尚未公開。"));
  }

  const kpIds = normalized.selectedKnowledgePointIds ?? [];
  if (kpIds.length === 0 || kpIds.some((id) => !isS60IPromotedG5AU08KnowledgePointId(id))) {
    errors.push(issue("G5A_U08_CANONICAL_KP_NOT_PROMOTED", "selectedKnowledgePointIds", "選取的 KnowledgePoint 尚未核准。"));
  }
  const groupIds = new Set(normalized.selectedPatternGroupIds ?? []);
  if (groupIds.size === 0 || [...groupIds].some((id) => !isS60IPromotedG5AU08PatternGroupId(id))) {
    errors.push(issue("G5A_U08_CANONICAL_GROUP_NOT_PROMOTED", "selectedPatternGroupIds", "選取的 PatternGroup 尚未核准。"));
  }

  let allocatedCount = 0;
  for (const [index, entry] of (normalized.allocation ?? []).entries()) {
    const path = `allocation[${index}]`;
    if (!Number.isInteger(entry.questionCount) || entry.questionCount <= 0) {
      errors.push(issue("G5A_U08_CANONICAL_ALLOCATION_COUNT_INVALID", `${path}.questionCount`, "配置題數必須為正整數。"));
      continue;
    }
    allocatedCount += entry.questionCount;
    if (!groupIds.has(entry.patternGroupId) || !isS60IPromotedG5AU08PatternGroupId(entry.patternGroupId)) {
      errors.push(issue("G5A_U08_CANONICAL_GROUP_NOT_RESOLVED", `${path}.patternGroupId`, "配置群組不是 resolver 衍生的公開群組。"));
    }
    if (!Array.isArray(entry.selectedPatternSpecIds) || entry.selectedPatternSpecIds.length === 0 || entry.selectedPatternSpecIds.some((id) => !isS60IPromotedG5AU08PatternSpecId(id))) {
      errors.push(issue("G5A_U08_CANONICAL_PATTERN_NOT_PROMOTED", `${path}.selectedPatternSpecIds`, "配置含未核准 PatternSpec。"));
    }
  }
  if (allocatedCount !== normalized.questionCount) {
    errors.push(issue("G5A_U08_CANONICAL_ALLOCATION_MISMATCH", "allocation", "配置總題數與請求題數不一致。", { expected: normalized.questionCount, actual: allocatedCount }));
  }
  if (
    G5A_U08_PROMOTION_LIFECYCLE.selectorStatus !== "visible" ||
    G5A_U08_PROMOTION_LIFECYCLE.validatorStatus !== "blocking_validator_accepted" ||
    G5A_U08_PROMOTION_LIFECYCLE.worksheetStatus !== "not_eligible"
  ) {
    errors.push(issue("G5A_U08_CANONICAL_LIFECYCLE_INVALID", "promotionLifecycle", "S60I lifecycle gate 不一致。"));
  }
  return { ok: errors.length === 0, errors, warnings: [], plan: normalized };
}

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "s60i")) {
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

function deterministicShuffle(values, seedText) {
  const output = [...values];
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
    id: `${question.patternSpecId}-${sequenceNumber}`,
    phase: "S60I",
    selectorStatus: "visible",
    visibilityStatus: "visible",
    productionUse: "canonical_runtime_only",
    generatorRouting: "canonical_resolver_allocation",
    resolvedPatternGroupId: allocationEntry.patternGroupId,
    promotionRegistryId: G5A_U08_PROMOTION_REGISTRY_ID,
    validationStatus: "accepted",
    canonicalRoute: {
      kind: G5A_U08_CANONICAL_ROUTE_KINDS.CANONICAL,
      runtimeKind: allocationEntry.runtimeKind,
      resolver: plan.resolverResult?.provenance?.resolver ?? null,
      allocationStrategy: plan.resolverResult?.provenance?.allocationStrategy ?? null,
      questionMode: plan.questionMode,
      depthMode: plan.depthMode,
      contextMode: plan.contextMode,
      publicNPlus2Used: false,
      publicFormalEquationUsed: false,
    },
    metadata: {
      ...cloneValue(question.metadata ?? {}),
      resolvedPatternGroupId: allocationEntry.patternGroupId,
      promotionRegistryId: G5A_U08_PROMOTION_REGISTRY_ID,
      publicControls: cloneValue(plan.publicControls),
    },
  };
}

export function validateG5AU08CanonicalQuestion(question = {}) {
  const errors = [];
  if (question.sourceId !== G5A_U08_SOURCE_ID || question.unitCode !== "5A-U08") errors.push(issue("G5A_U08_CANONICAL_SOURCE_INVALID", "sourceId", "題目來源錯誤。"));
  if (!isS60IPromotedG5AU08KnowledgePointId(question.knowledgePointId)) errors.push(issue("G5A_U08_CANONICAL_KP_NOT_PROMOTED", "knowledgePointId", "KnowledgePoint 未核准。"));
  if (!isS60IPromotedG5AU08PatternGroupId(question.resolvedPatternGroupId ?? question.patternGroupId)) errors.push(issue("G5A_U08_CANONICAL_GROUP_NOT_PROMOTED", "resolvedPatternGroupId", "PatternGroup 未核准。"));
  if (!isS60IPromotedG5AU08PatternSpecId(question.patternSpecId)) errors.push(issue("G5A_U08_CANONICAL_PATTERN_NOT_PROMOTED", "patternSpecId", "PatternSpec 未核准。"));
  if (
    question.phase !== "S60I" ||
    question.selectorStatus !== "visible" ||
    question.visibilityStatus !== "visible" ||
    question.productionUse !== "canonical_runtime_only" ||
    question.generatorRouting !== "canonical_resolver_allocation" ||
    question.promotionRegistryId !== G5A_U08_PROMOTION_REGISTRY_ID
  ) {
    errors.push(issue("G5A_U08_CANONICAL_LIFECYCLE_INVALID", "phase", "Canonical lifecycle metadata 不一致。"));
  }
  if (question.canonicalRoute?.kind !== G5A_U08_CANONICAL_ROUTE_KINDS.CANONICAL || question.canonicalRoute?.publicNPlus2Used !== false || question.canonicalRoute?.publicFormalEquationUsed !== false) {
    errors.push(issue("G5A_U08_CANONICAL_ROUTE_INVALID", "canonicalRoute", "Canonical route metadata 不一致。"));
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function generateG5AU08CanonicalQuestions(plan = {}, options = {}) {
  const checked = validateG5AU08CanonicalPlan(plan);
  const normalized = checked.plan;
  if (!checked.ok) return { ok: false, plan: normalized, questions: [], allocation: cloneValue(normalized.allocation ?? []), errors: checked.errors, warnings: checked.warnings };

  const numericValidator = options.numericValidator ?? validateG5AU08HiddenBatch;
  const applicationValidator = options.applicationValidator ?? validateG5AU08ApplicationBatch;
  const generatedRows = [];
  const errors = [];
  const warnings = [];
  let sequenceNumber = 0;

  for (const entry of normalized.allocation) {
    const seed = `${normalized.generationSeed}:${entry.patternGroupId}:${entry.questionCount}`;
    let batch;
    let validation;
    if (entry.runtimeKind === "numeric_or_noncontext_reasoning") {
      batch = generateG5AU08HiddenBatch({
        questionCount: entry.questionCount,
        seed,
        selectedPatternSpecIds: entry.selectedPatternSpecIds,
        ordering: "grouped",
      });
      validation = numericValidator(batch);
    } else {
      batch = generateG5AU08ApplicationBatch({
        questionCount: entry.questionCount,
        seed,
        selectedPatternSpecIds: entry.selectedPatternSpecIds,
        depthMode: normalized.depthMode,
        contextMode: normalized.contextMode,
        ordering: "grouped",
      });
      validation = applicationValidator(batch);
    }
    warnings.push(...(validation?.warnings ?? []));
    if (validation?.valid !== true) {
      errors.push(...(validation?.errors ?? [issue("G5A_U08_CANONICAL_VALIDATION_FAILED", "validation", "Blocking validator rejected the generated batch.")]));
      continue;
    }
    for (const question of validation.acceptedQuestions ?? []) {
      sequenceNumber += 1;
      const promoted = promoteQuestion(question, normalized, entry, sequenceNumber);
      const lifecycle = validateG5AU08CanonicalQuestion(promoted);
      if (!lifecycle.ok) errors.push(...lifecycle.errors);
      generatedRows.push(promoted);
    }
  }

  if (generatedRows.length !== normalized.questionCount) {
    errors.push(issue("G5A_U08_CANONICAL_OUTPUT_COUNT_MISMATCH", "questions", "Canonical output 題數不一致。", { expected: normalized.questionCount, actual: generatedRows.length }));
  }
  if (errors.length > 0) {
    return { ok: false, plan: normalized, questions: [], allocation: cloneValue(normalized.allocation), errors, warnings };
  }
  const questions = normalized.ordering === "shuffleAcrossPatterns"
    ? deterministicShuffle(generatedRows, `${normalized.generationSeed}:s60i:${normalized.questionCount}`)
    : generatedRows;
  return {
    ok: true,
    plan: { ...normalized, routeKind: G5A_U08_CANONICAL_ROUTE_KINDS.CANONICAL },
    questions,
    allocation: cloneValue(normalized.allocation),
    errors: [],
    warnings,
  };
}
