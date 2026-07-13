import {
  getVisiblePatternGroupsForKnowledgePoint,
} from "../registry/batch-a-selector-extension.js";
import {
  G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS,
  G4A_U08_PHASE2B_PROMOTION_LIFECYCLE,
  G4A_U08_PHASE2B_PROMOTION_REGISTRY_ID,
  G4A_U08_PHASE2B_PUBLIC_CONTROLS,
  G4A_U08_SOURCE_ID,
  isS76JPromotedG4AU08KnowledgePointId,
  isS76JPromotedG4AU08PatternGroupId,
  isS76JPromotedG4AU08PatternSpecId,
} from "../registry/g4a-u08-phase2b-promotion.js";
import {
  generateG4AU08Phase2BBrowserItem,
  resolveG4AU08Phase2BTemplateId,
  validateG4AU08Phase2BBrowserItem,
} from "./g4a-u08-phase2b-browser-runtime.js";

export const G4A_U08_CANONICAL_ROUTE_KINDS = Object.freeze({
  LEGACY: "legacy",
  CANONICAL: "g4a_u08_phase2b_application",
  INVALID_SCOPE: "g4a_u08_invalid_public_scope",
});

export const G4A_U08_CANONICAL_ROUTER_INTEGRATION = Object.freeze({
  task: "S76J_G4A_U08_ResolverSelectorAndWorksheetIntegration",
  sourceId: G4A_U08_SOURCE_ID,
  status: "canonical_runtime_and_worksheet_integrated_pending_stress_qa",
  allocationStrategy: "balanced_by_authoritative_pattern_spec",
  supportedSelectionModes: Object.freeze(["singleKnowledgePoint", "mixedKnowledgePointsSameUnit"]),
  resolverDerivedOnly: true,
  blockingValidatorRequired: true,
  genericFallbackAllowed: false,
  arbitraryPatternSpecInjectionAllowed: false,
  worksheetEligible: true,
  rendererBehaviorChanged: false,
  productionEligibilityChanged: false,
  requiredNextGate: "S76K_G4A_U08_FullSourceStressAndSemanticQA",
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

function normalizeQuestionMode(value) {
  return G4A_U08_PHASE2B_PUBLIC_CONTROLS.questionModes.includes(value)
    ? value
    : G4A_U08_PHASE2B_PUBLIC_CONTROLS.defaults.questionMode;
}

function linkedVisibleGroups(knowledgePointIds = [], requestedGroupIds = []) {
  const requested = new Set(requestedGroupIds);
  const groups = [];
  for (const knowledgePointId of knowledgePointIds) {
    for (const group of getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)) {
      if (group.sourceId !== G4A_U08_SOURCE_ID) continue;
      if (!isS76JPromotedG4AU08PatternGroupId(group.patternGroupId)) continue;
      if (requested.size > 0 && !requested.has(group.patternGroupId)) continue;
      groups.push(group);
    }
  }
  return [...new Map(groups.map((group) => [group.patternGroupId, group])).values()];
}

function allocateGroups(groups, questionCount) {
  if (groups.length === 0) return [];
  const base = Math.floor(questionCount / groups.length);
  let remainder = questionCount % groups.length;
  return groups.map((group) => {
    const count = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    return {
      patternGroupId: group.patternGroupId,
      knowledgePointId: group.primaryKnowledgePointId,
      patternSpecId: group.patternSpecIds[0],
      questionCount: count,
      runtimeKind: "phase2b_application",
      mode: "application",
    };
  }).filter((entry) => entry.questionCount > 0);
}

export function normalizeG4AU08ResolverPlan(plan = {}) {
  if (plan.sourceId !== G4A_U08_SOURCE_ID) return cloneValue(plan);
  const normalized = cloneValue(plan);
  const questionMode = normalizeQuestionMode(normalized.questionMode);
  const knowledgePointIds = normalized.selectedKnowledgePointIds ?? normalized.resolverResult?.knowledgePointIds ?? [];
  const requestedGroupIds = normalized.selectedPatternGroupIds ?? normalized.resolverResult?.patternGroupIds ?? [];
  const groups = linkedVisibleGroups(knowledgePointIds, requestedGroupIds);
  const allocation = allocateGroups(groups, normalized.questionCount);
  normalized.questionMode = questionMode;
  normalized.publicControls = { questionMode };
  normalized.publicPatternSpecInjectionUsed = false;
  normalized.genericFallbackAllowed = false;
  normalized.selectedKnowledgePointIds = [...knowledgePointIds];
  normalized.selectedPatternGroupIds = groups.map((group) => group.patternGroupId);
  normalized.patternSpecIds = allocation.map((entry) => entry.patternSpecId);
  normalized.allocation = allocation;
  normalized.resolverResult = {
    ...(normalized.resolverResult ?? {}),
    ok: normalized.resolverResult?.ok === true && allocation.length > 0,
    knowledgePointIds: cloneValue(normalized.selectedKnowledgePointIds),
    patternGroupIds: cloneValue(normalized.selectedPatternGroupIds),
    patternSpecIds: cloneValue(normalized.patternSpecIds),
    allocation: cloneValue(allocation),
    provenance: {
      ...(normalized.resolverResult?.provenance ?? {}),
      resolver: "visiblePatternGroupResolver",
      sourceId: G4A_U08_SOURCE_ID,
      allocationStrategy: "balanced_by_authoritative_pattern_spec",
      s76jAdapterApplied: true,
      publicPatternSpecInjectionUsed: false,
    },
  };
  return normalized;
}

export function classifyG4AU08CanonicalRouterPlan(plan = {}) {
  if (plan.sourceId !== G4A_U08_SOURCE_ID) return G4A_U08_CANONICAL_ROUTE_KINDS.LEGACY;
  if (plan.selectionMode === "sourceUnit" || plan.worksheetMode === "batchASource") return G4A_U08_CANONICAL_ROUTE_KINDS.LEGACY;
  const normalized = normalizeG4AU08ResolverPlan(plan);
  if (normalized.resolverResult?.ok !== true || normalized.allocation.length === 0) {
    return G4A_U08_CANONICAL_ROUTE_KINDS.INVALID_SCOPE;
  }
  return normalized.patternSpecIds.every(isS76JPromotedG4AU08PatternSpecId)
    ? G4A_U08_CANONICAL_ROUTE_KINDS.CANONICAL
    : G4A_U08_CANONICAL_ROUTE_KINDS.INVALID_SCOPE;
}

export function validateG4AU08CanonicalPlan(plan = {}) {
  const normalized = normalizeG4AU08ResolverPlan(plan);
  const errors = [];
  if (normalized.sourceId !== G4A_U08_SOURCE_ID) errors.push(issue("G4A_U08_CANONICAL_SOURCE_INVALID", "sourceId", "公開路由來源不是 G4A-U08。"));
  if (normalized.resolverResult?.ok !== true || normalized.resolverResult?.provenance?.resolver !== "visiblePatternGroupResolver") {
    errors.push(issue("G4A_U08_CANONICAL_RESOLVER_REQUIRED", "resolverResult", "必須使用成功的 visible PatternGroup resolver。"));
  }
  if (!["singleKnowledgePoint", "mixedKnowledgePointsSameUnit"].includes(normalized.selectionMode)) {
    errors.push(issue("G4A_U08_CANONICAL_SELECTION_MODE_INVALID", "selectionMode", "G4A-U08 只允許單一或同單元混合 KnowledgePoint。"));
  }
  if (!Number.isInteger(normalized.questionCount) || normalized.questionCount < 1 || normalized.questionCount > 1000) {
    errors.push(issue("G4A_U08_CANONICAL_COUNT_INVALID", "questionCount", "公開 runtime 題數必須介於 1 到 1000。"));
  }
  if (!G4A_U08_PHASE2B_PUBLIC_CONTROLS.questionModes.includes(normalized.questionMode)) {
    errors.push(issue("G4A_U08_CANONICAL_QUESTION_MODE_INVALID", "questionMode", "題目模式無效。"));
  }
  if (normalized.publicPatternSpecInjectionUsed !== false || normalized.genericFallbackAllowed !== false) {
    errors.push(issue("G4A_U08_CANONICAL_PUBLIC_INJECTION_FORBIDDEN", "publicControls", "公開端不得注入 PatternSpec 或啟用 generic fallback。"));
  }
  const kpIds = normalized.selectedKnowledgePointIds ?? [];
  if (kpIds.length === 0 || kpIds.some((id) => !isS76JPromotedG4AU08KnowledgePointId(id))) {
    errors.push(issue("G4A_U08_CANONICAL_KP_NOT_PROMOTED", "selectedKnowledgePointIds", "選取的 KnowledgePoint 尚未核准。"));
  }
  const groupIds = new Set(normalized.selectedPatternGroupIds ?? []);
  if (groupIds.size === 0 || [...groupIds].some((id) => !isS76JPromotedG4AU08PatternGroupId(id))) {
    errors.push(issue("G4A_U08_CANONICAL_GROUP_NOT_PROMOTED", "selectedPatternGroupIds", "選取的 PatternGroup 尚未核准。"));
  }
  let allocatedCount = 0;
  for (const [index, entry] of (normalized.allocation ?? []).entries()) {
    const path = `allocation[${index}]`;
    if (!Number.isInteger(entry.questionCount) || entry.questionCount <= 0) {
      errors.push(issue("G4A_U08_CANONICAL_ALLOCATION_COUNT_INVALID", `${path}.questionCount`, "配置題數必須為正整數。"));
      continue;
    }
    allocatedCount += entry.questionCount;
    if (!groupIds.has(entry.patternGroupId) || !isS76JPromotedG4AU08PatternGroupId(entry.patternGroupId)) {
      errors.push(issue("G4A_U08_CANONICAL_GROUP_NOT_RESOLVED", `${path}.patternGroupId`, "配置群組不是 resolver 衍生的公開群組。"));
    }
    if (!isS76JPromotedG4AU08PatternSpecId(entry.patternSpecId)) {
      errors.push(issue("G4A_U08_CANONICAL_PATTERN_NOT_PROMOTED", `${path}.patternSpecId`, "配置含未核准 PatternSpec。"));
    }
  }
  if (allocatedCount !== normalized.questionCount) {
    errors.push(issue("G4A_U08_CANONICAL_ALLOCATION_MISMATCH", "allocation", "配置總題數與請求題數不一致。", { expected: normalized.questionCount, actual: allocatedCount }));
  }
  if (
    G4A_U08_PHASE2B_PROMOTION_LIFECYCLE.selectorStatus !== "visible"
    || G4A_U08_PHASE2B_PROMOTION_LIFECYCLE.validatorStatus !== "blocking_validator_required"
    || G4A_U08_PHASE2B_PROMOTION_LIFECYCLE.worksheetStatus !== "worksheet_eligible"
    || G4A_U08_PHASE2B_PROMOTION_LIFECYCLE.productionUse !== "preview_only_pending_s76k"
  ) {
    errors.push(issue("G4A_U08_CANONICAL_LIFECYCLE_INVALID", "promotionLifecycle", "S76J lifecycle gate 不一致。"));
  }
  return { ok: errors.length === 0, errors, warnings: [], plan: normalized };
}

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "s76j")) {
    acc ^= char.charCodeAt(0);
    acc = Math.imul(acc, 16777619);
  }
  return acc >>> 0 || 1;
}

function promoteQuestion(item, plan, allocationEntry, sequenceNumber) {
  const answerValue = item.answerModel.value;
  const answerUnit = item.answerModel.unit ?? null;
  const answerText = `${answerValue}${answerUnit ?? ""}`;
  return {
    id: `${item.patternSpecId}-${sequenceNumber}`,
    sourceId: item.sourceId,
    unitCode: item.unitCode,
    knowledgePointId: item.knowledgePointId,
    patternGroupId: item.patternGroupId,
    resolvedPatternGroupId: allocationEntry.patternGroupId,
    patternSpecId: item.patternSpecId,
    legacyTemplateId: item.legacyTemplateId,
    mode: "application",
    applicationText: true,
    promptText: item.prompt,
    displayText: item.prompt,
    blankedDisplayText: item.prompt,
    answerText,
    finalAnswer: answerValue,
    answerModelShape: "numericAnswer",
    canonicalExpression: item.expression,
    structuredAnswer: {
      expression: item.expression,
      value: answerValue,
      unit: answerUnit,
      semanticRelations: cloneValue(item.semanticRelations),
      intermediateValues: cloneValue(item.intermediateValues),
    },
    operands: cloneValue(item.operands),
    operations: cloneValue(item.operations),
    reasoningRole: item.reasoningRole,
    semanticRelations: cloneValue(item.semanticRelations),
    context: { contextType: item.context?.domain ?? null, ...cloneValue(item.context ?? {}) },
    seed: item.seed,
    phase: "S76J",
    selectorStatus: "visible",
    visibilityStatus: "visible",
    canonicalRouting: "enabled",
    productionUse: "preview_only_pending_s76k",
    generatorRouting: "canonical_resolver_allocation",
    promotionRegistryId: G4A_U08_PHASE2B_PROMOTION_REGISTRY_ID,
    validationStatus: "accepted",
    canonicalRoute: {
      kind: G4A_U08_CANONICAL_ROUTE_KINDS.CANONICAL,
      runtimeKind: allocationEntry.runtimeKind,
      resolver: plan.resolverResult?.provenance?.resolver ?? null,
      allocationStrategy: plan.resolverResult?.provenance?.allocationStrategy ?? null,
      questionMode: plan.questionMode,
      publicPatternSpecInjectionUsed: false,
      genericFallbackAllowed: false,
    },
    metadata: {
      sourceId: item.sourceId,
      resolvedPatternGroupId: allocationEntry.patternGroupId,
      promotionRegistryId: G4A_U08_PHASE2B_PROMOTION_REGISTRY_ID,
      publicControls: cloneValue(plan.publicControls),
      hiddenCanonicalSnapshot: {
        lifecycle: cloneValue(item.lifecycle),
        semanticRelations: cloneValue(item.semanticRelations),
      },
    },
  };
}

export function validateG4AU08CanonicalQuestion(question = {}) {
  const errors = [];
  if (question.sourceId !== G4A_U08_SOURCE_ID || question.unitCode !== "4A-U08") errors.push(issue("G4A_U08_CANONICAL_SOURCE_INVALID", "sourceId", "題目來源錯誤。"));
  if (!isS76JPromotedG4AU08KnowledgePointId(question.knowledgePointId)) errors.push(issue("G4A_U08_CANONICAL_KP_NOT_PROMOTED", "knowledgePointId", "KnowledgePoint 未核准。"));
  if (!isS76JPromotedG4AU08PatternGroupId(question.resolvedPatternGroupId ?? question.patternGroupId)) errors.push(issue("G4A_U08_CANONICAL_GROUP_NOT_PROMOTED", "resolvedPatternGroupId", "PatternGroup 未核准。"));
  if (!isS76JPromotedG4AU08PatternSpecId(question.patternSpecId)) errors.push(issue("G4A_U08_CANONICAL_PATTERN_NOT_PROMOTED", "patternSpecId", "PatternSpec 未核准。"));
  if (!Number.isInteger(question.finalAnswer) || question.answerModelShape !== "numericAnswer") errors.push(issue("G4A_U08_CANONICAL_ANSWER_INVALID", "finalAnswer", "答案必須是整數 numericAnswer。"));
  if (
    question.phase !== "S76J"
    || question.selectorStatus !== "visible"
    || question.visibilityStatus !== "visible"
    || question.canonicalRouting !== "enabled"
    || question.productionUse !== "preview_only_pending_s76k"
    || question.generatorRouting !== "canonical_resolver_allocation"
    || question.promotionRegistryId !== G4A_U08_PHASE2B_PROMOTION_REGISTRY_ID
  ) {
    errors.push(issue("G4A_U08_CANONICAL_LIFECYCLE_INVALID", "phase", "Canonical lifecycle metadata 不一致。"));
  }
  if (
    question.canonicalRoute?.kind !== G4A_U08_CANONICAL_ROUTE_KINDS.CANONICAL
    || question.canonicalRoute?.publicPatternSpecInjectionUsed !== false
    || question.canonicalRoute?.genericFallbackAllowed !== false
  ) {
    errors.push(issue("G4A_U08_CANONICAL_ROUTE_INVALID", "canonicalRoute", "Canonical route metadata 不一致。"));
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function generateG4AU08CanonicalQuestions(plan = {}) {
  const checked = validateG4AU08CanonicalPlan(plan);
  const normalized = checked.plan;
  if (!checked.ok) {
    return { ok: false, plan: normalized, questions: [], allocation: cloneValue(normalized.allocation ?? []), errors: checked.errors, warnings: checked.warnings };
  }
  const questions = [];
  const errors = [];
  let sequenceNumber = 0;
  for (const entry of normalized.allocation) {
    const templateId = resolveG4AU08Phase2BTemplateId(entry.patternSpecId);
    if (!templateId) {
      errors.push(issue("G4A_U08_CANONICAL_TEMPLATE_UNMAPPED", "patternSpecId", "PatternSpec 沒有對應 Phase2B template。"));
      continue;
    }
    for (let index = 0; index < entry.questionCount; index += 1) {
      const seed = hashSeed(`${normalized.generationSeed}:${entry.patternSpecId}:${index + 1}`);
      const hiddenItem = generateG4AU08Phase2BBrowserItem({ templateId, seed });
      const hiddenValidation = validateG4AU08Phase2BBrowserItem(hiddenItem);
      if (!hiddenValidation.valid) {
        errors.push(issue("G4A_U08_CANONICAL_HIDDEN_VALIDATION_FAILED", "validation", "Hidden blocking validator rejected the generated item.", { validationErrors: hiddenValidation.errors }));
        continue;
      }
      sequenceNumber += 1;
      const promoted = promoteQuestion(hiddenItem, normalized, entry, sequenceNumber);
      const publicValidation = validateG4AU08CanonicalQuestion(promoted);
      if (!publicValidation.ok) errors.push(...publicValidation.errors);
      questions.push(promoted);
    }
  }
  if (questions.length !== normalized.questionCount) {
    errors.push(issue("G4A_U08_CANONICAL_OUTPUT_COUNT_MISMATCH", "questions", "Canonical output 題數不一致。", { expected: normalized.questionCount, actual: questions.length }));
  }
  if (errors.length > 0) {
    return { ok: false, plan: normalized, questions: [], allocation: cloneValue(normalized.allocation), errors, warnings: [] };
  }
  return {
    ok: true,
    plan: { ...normalized, routeKind: G4A_U08_CANONICAL_ROUTE_KINDS.CANONICAL },
    questions,
    allocation: cloneValue(normalized.allocation),
    errors: [],
    warnings: [],
  };
}

export function getG4AU08PromotedPatternSpecIds() {
  return [...G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS];
}
