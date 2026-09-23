import {
  G4B_U04_CANONICAL_ROUTE_KINDS,
  classifyG4BU04CanonicalRouterPlan as classifyBasePlan,
  generateG4BU04CanonicalQuestions as generateBaseQuestions,
  normalizeG4BU04ResolverPlan as normalizeBasePlan,
  validateG4BU04CanonicalPlan as validateBasePlan,
  validateG4BU04CanonicalQuestion as validateBaseQuestion,
} from "./g4b-u04-canonical-router.js";
import {
  G4B_U04_CONTEXT_CONTRACT_VERSION,
  applyG4BU04ControlledContextVariant,
  isG4BU04SDGEligiblePatternSpecId,
  normalizeG4BU04ContextMode,
  summarizeG4BU04ContextAllocation,
  validateG4BU04ControlledContextQuestion,
} from "./g4b-u04-controlled-context-variants.js";
import {
  normalizeG4BU04PromptSignature,
} from "./g4b-u04-prompt-deduplication.js";

export { G4B_U04_CANONICAL_ROUTE_KINDS };

function cloneValue(value) {
  if (Array.isArray(value)) return value.map(cloneValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

function issue(code, path, message, details = {}) {
  return { code, severity: "error", path, message, ...details };
}

export function normalizeG4BU04ResolverPlan(plan = {}) {
  const contextMode = normalizeG4BU04ContextMode(plan.contextMode);
  const normalized = normalizeBasePlan({ ...plan, contextMode });
  if (normalized.sourceId !== "g4b_u04_4b04") return normalized;
  return {
    ...normalized,
    contextMode,
    publicControls: {
      ...(normalized.publicControls ?? {}),
      contextMode,
    },
    resolverResult: normalized.resolverResult ? {
      ...normalized.resolverResult,
      contextMode,
      provenance: {
        ...(normalized.resolverResult.provenance ?? {}),
        contextResolver: "g4bU04ControlledContextResolver",
        contextContractVersion: G4B_U04_CONTEXT_CONTRACT_VERSION,
        contextMode,
        genericContextFallbackAllowed: false,
        freeFormAIAllowed: false,
      },
    } : normalized.resolverResult,
  };
}

export function classifyG4BU04CanonicalRouterPlan(plan = {}) {
  return classifyBasePlan(normalizeG4BU04ResolverPlan(plan));
}

export function validateG4BU04CanonicalPlan(plan = {}) {
  const normalized = normalizeG4BU04ResolverPlan(plan);
  const base = validateBasePlan(normalized);
  return {
    ...base,
    plan: {
      ...base.plan,
      contextMode: normalized.contextMode,
      publicControls: cloneValue(normalized.publicControls),
    },
  };
}

function enrichQuestion(question, normalized, contextQuestion) {
  const contextMode = normalized.contextMode;
  const publicControls = {
    ...(question.metadata?.publicControls ?? {}),
    ...(normalized.publicControls ?? {}),
    contextMode,
  };
  const promptSignature = normalizeG4BU04PromptSignature(contextQuestion.promptText);
  return Object.freeze({
    ...contextQuestion,
    canonicalRoute: {
      ...(contextQuestion.canonicalRoute ?? {}),
      contextMode,
      controlledContextVersion: G4B_U04_CONTEXT_CONTRACT_VERSION,
      genericContextFallbackUsed: false,
      freeFormAIUsed: false,
    },
    metadata: Object.freeze({
      ...(contextQuestion.metadata ?? {}),
      publicControls: Object.freeze(cloneValue(publicControls)),
      contextContractVersion: G4B_U04_CONTEXT_CONTRACT_VERSION,
      contextModeRequested: contextQuestion.contextModeRequested ?? contextMode,
      contextModeApplied: contextQuestion.contextModeApplied ?? "not_applicable",
      contextApplicability: contextQuestion.contextApplicability ?? "not_applicable",
      contextVariantId: contextQuestion.contextVariantId ?? null,
      sdgGoal: contextQuestion.sdgGoal ?? null,
      fictionalExerciseData: contextQuestion.implementationClass === "D" ? true : null,
      promptSignature,
    }),
  });
}

export function validateG4BU04CanonicalQuestion(question = {}) {
  const errors = [...validateBaseQuestion(question).errors];
  const contextValidation = validateG4BU04ControlledContextQuestion(question);
  errors.push(...contextValidation.errors);
  if (question.canonicalRoute?.controlledContextVersion !== G4B_U04_CONTEXT_CONTRACT_VERSION) {
    errors.push(issue("G4B_U04_CANONICAL_CONTEXT_CONTRACT_INVALID", "canonicalRoute.controlledContextVersion", "Canonical 題目缺少 R2E context contract。"));
  }
  if (question.metadata?.publicControls?.contextMode !== question.canonicalRoute?.contextMode) {
    errors.push(issue("G4B_U04_CANONICAL_CONTEXT_MODE_MISMATCH", "metadata.publicControls.contextMode", "Canonical contextMode metadata 不一致。"));
  }
  if (question.metadata?.promptSignature !== normalizeG4BU04PromptSignature(question.promptText)) {
    errors.push(issue("G4B_U04_CANONICAL_PROMPT_SIGNATURE_INVALID", "metadata.promptSignature", "情境變體後的 prompt signature 未重新計算。"));
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function generateG4BU04CanonicalQuestions(plan = {}, options = {}) {
  const normalized = normalizeG4BU04ResolverPlan(plan);
  const baseResult = generateBaseQuestions(normalized, options);
  if (!baseResult.ok) {
    return {
      ...baseResult,
      plan: {
        ...(baseResult.plan ?? normalized),
        contextMode: normalized.contextMode,
        publicControls: cloneValue(normalized.publicControls),
      },
    };
  }

  let eligibleOccurrence = 0;
  const questions = baseResult.questions.map((question) => {
    const eligible = question.implementationClass === "D"
      && isG4BU04SDGEligiblePatternSpecId(question.patternSpecId);
    const contextQuestion = applyG4BU04ControlledContextVariant(question, {
      contextMode: normalized.contextMode,
      seed: normalized.generationSeed ?? "g4b-u04-r2e",
      eligibleOccurrence,
    });
    if (eligible) eligibleOccurrence += 1;
    return enrichQuestion(question, normalized, contextQuestion);
  });

  const errors = questions.flatMap((question) => validateG4BU04CanonicalQuestion(question).errors);
  const signatures = questions.map((question) => normalizeG4BU04PromptSignature(question.promptText));
  if (new Set(signatures).size !== signatures.length) {
    errors.push(issue("G4B_U04_CANONICAL_DUPLICATE_PROMPT", "questions", "受控情境套用後產生重複題面。"));
  }
  const contextAllocation = summarizeG4BU04ContextAllocation(questions, normalized.contextMode);
  if (normalized.contextMode === "sdg"
    && contextAllocation.eligibleQuestionCount > 0
    && contextAllocation.counts.sdg !== contextAllocation.eligibleQuestionCount) {
    errors.push(issue("G4B_U04_CONTEXT_SDG_ALLOCATION_MISMATCH", "contextAllocation", "sdg 模式未將所有 eligible 題套用 SDG 變體。"));
  }
  if (normalized.contextMode === "daily_life" && contextAllocation.counts.sdg !== 0) {
    errors.push(issue("G4B_U04_CONTEXT_DAILY_ALLOCATION_MISMATCH", "contextAllocation", "daily_life 模式不得含 SDG 變體。"));
  }

  if (errors.length > 0) {
    return {
      ...baseResult,
      ok: false,
      plan: {
        ...baseResult.plan,
        contextMode: normalized.contextMode,
        publicControls: cloneValue(normalized.publicControls),
      },
      questions: [],
      contextAllocation,
      errors,
      warnings: [],
    };
  }

  return {
    ...baseResult,
    plan: {
      ...baseResult.plan,
      contextMode: normalized.contextMode,
      publicControls: cloneValue(normalized.publicControls),
      routeKind: G4B_U04_CANONICAL_ROUTE_KINDS.CANONICAL,
    },
    questions,
    contextAllocation,
    errors: [],
    warnings: cloneValue(baseResult.warnings ?? []),
  };
}
