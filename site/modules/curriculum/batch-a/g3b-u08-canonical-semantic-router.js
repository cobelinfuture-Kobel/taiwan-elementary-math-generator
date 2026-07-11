import {
  G3B_U08_SOURCE_ID,
  getG3BU08SemanticPatternDefinition
} from "./source-pattern-g3b-u08-semantic-extension.js";
import {
  listG3BU08SemanticContextVariantsForPatternSpec
} from "./g3b-u08-semantic-context-registry.js";
import {
  generateG3BU08HiddenSemanticQuestion
} from "./g3b-u08-semantic-generator.js";
import {
  G3B_U08_SEMANTIC_VALIDATOR_VERSION,
  validateG3BU08SemanticQuestion
} from "./g3b-u08-semantic-validator.js";
import {
  G3B_U08_SEMANTIC_PROMOTION_ACTIVATION,
  G3B_U08_SEMANTIC_PROMOTION_LIFECYCLE,
  G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID,
  isS58FPromotedG3BU08SemanticPatternSpecId
} from "../registry/g3b-u08-semantic-promotion.js";

export const G3B_U08_CANONICAL_ROUTE_KINDS = Object.freeze({
  LEGACY: "legacy",
  PURE_SEMANTIC: "g3b_u08_pure_semantic",
  INVALID_SEMANTIC_SCOPE: "g3b_u08_invalid_semantic_scope"
});

export const G3B_U08_CANONICAL_ROUTER_INTEGRATION = Object.freeze({
  task: "S58G_G3B_U08_ResolverBrowserStateAndCanonicalRouterIntegration",
  sourceId: G3B_U08_SOURCE_ID,
  status: "resolver_browser_state_and_canonical_router_integrated_worksheet_gate_pending",
  routeKinds: Object.freeze([
    G3B_U08_CANONICAL_ROUTE_KINDS.PURE_SEMANTIC,
    G3B_U08_CANONICAL_ROUTE_KINDS.INVALID_SEMANTIC_SCOPE
  ]),
  resolverDerivedOnly: true,
  applicationOnly: true,
  publicNumericModeAdded: false,
  representationToggleAdded: false,
  publicHiddenModeFlagAllowed: false,
  blockingSemanticValidatorRequired: true,
  humanSemanticReadbackRequired: true,
  genericFallbackOnSemanticFailureAllowed: false,
  productionEligibilityChanged: false,
  worksheetRendererChanged: false,
  requiredNextGate: "S58H_G3B_U08_CanonicalValidatorWorksheetAndRendererIntegration"
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

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "s58g")) {
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

export function classifyG3BU08CanonicalRouterPlan(plan = {}) {
  if (plan.sourceId !== G3B_U08_SOURCE_ID) return G3B_U08_CANONICAL_ROUTE_KINDS.LEGACY;
  if (plan.selectionMode === "sourceUnit" || plan.worksheetMode === "batchASource") {
    return G3B_U08_CANONICAL_ROUTE_KINDS.LEGACY;
  }
  if (plan.resolverResult?.ok !== true || !Array.isArray(plan.allocation) || plan.allocation.length === 0) {
    return G3B_U08_CANONICAL_ROUTE_KINDS.INVALID_SEMANTIC_SCOPE;
  }
  return plan.allocation.every((entry) => isS58FPromotedG3BU08SemanticPatternSpecId(entry?.patternSpecId))
    ? G3B_U08_CANONICAL_ROUTE_KINDS.PURE_SEMANTIC
    : G3B_U08_CANONICAL_ROUTE_KINDS.INVALID_SEMANTIC_SCOPE;
}

export function validateG3BU08CanonicalSemanticPlan(plan = {}) {
  const errors = [];
  const allocation = Array.isArray(plan.allocation) ? plan.allocation : [];
  const selectedGroupIds = new Set(Array.isArray(plan.selectedPatternGroupIds) ? plan.selectedPatternGroupIds : []);
  const resolverGroupIds = new Set(Array.isArray(plan.resolverResult?.patternGroupIds) ? plan.resolverResult.patternGroupIds : []);
  const resolverPatternSpecIds = new Set(Array.isArray(plan.resolverResult?.patternSpecIds) ? plan.resolverResult.patternSpecIds : []);

  if (plan.sourceId !== G3B_U08_SOURCE_ID) {
    errors.push(issue("G3B_U08_CANONICAL_SOURCE_INVALID", "sourceId", "Canonical semantic plan has the wrong source."));
  }
  if (plan.resolverResult?.ok !== true || plan.resolverResult?.provenance?.resolver !== "visiblePatternGroupResolver") {
    errors.push(issue("G3B_U08_CANONICAL_RESOLVER_REQUIRED", "resolverResult", "Canonical semantic routing requires a successful visible PatternGroup resolver result."));
  }
  if (plan.selectionMode === "sourceUnit" || plan.worksheetMode === "batchASource") {
    errors.push(issue("G3B_U08_CANONICAL_SELECTION_MODE_INVALID", "selectionMode", "Semantic routing requires visible KnowledgePoint selection."));
  }
  if (plan.hiddenSemanticMode !== undefined || plan.g3bU08Semantic === true) {
    errors.push(issue("G3B_U08_CANONICAL_HIDDEN_MODE_FORBIDDEN", "hiddenSemanticMode", "Public canonical routing cannot use a hidden semantic mode flag."));
  }
  if (!Number.isInteger(plan.questionCount) || plan.questionCount <= 0 || plan.questionCount > 1000) {
    errors.push(issue("G3B_U08_CANONICAL_COUNT_INVALID", "questionCount", "Canonical semantic question count must be between 1 and 1000."));
  }
  if (allocation.length === 0) {
    errors.push(issue("G3B_U08_CANONICAL_ALLOCATION_EMPTY", "allocation", "Canonical semantic allocation is empty."));
  }

  let allocatedCount = 0;
  for (const [index, entry] of allocation.entries()) {
    const path = `allocation[${index}]`;
    if (!Number.isInteger(entry?.questionCount) || entry.questionCount <= 0) {
      errors.push(issue("G3B_U08_CANONICAL_ALLOCATION_COUNT_INVALID", `${path}.questionCount`, "Allocation question count must be a positive integer."));
      continue;
    }
    allocatedCount += entry.questionCount;
    if (!isS58FPromotedG3BU08SemanticPatternSpecId(entry.patternSpecId)) {
      errors.push(issue("G3B_U08_CANONICAL_PATTERN_NOT_PROMOTED", `${path}.patternSpecId`, "Allocation contains an unpromoted semantic PatternSpec."));
    }
    if (!selectedGroupIds.has(entry.patternGroupId) || !resolverGroupIds.has(entry.patternGroupId)) {
      errors.push(issue("G3B_U08_CANONICAL_GROUP_NOT_RESOLVED", `${path}.patternGroupId`, "Allocation PatternGroup was not selected and resolved visibly."));
    }
    if (!resolverPatternSpecIds.has(entry.patternSpecId)) {
      errors.push(issue("G3B_U08_CANONICAL_PATTERN_NOT_RESOLVED", `${path}.patternSpecId`, "Allocation PatternSpec was not derived by the visible resolver."));
    }
  }

  if (allocatedCount !== plan.questionCount) {
    errors.push(issue("G3B_U08_CANONICAL_ALLOCATION_MISMATCH", "allocation", "Canonical semantic allocation does not equal the requested question count.", {
      expected: plan.questionCount,
      actual: allocatedCount
    }));
  }
  if (G3B_U08_SEMANTIC_PROMOTION_LIFECYCLE.selectorStatus !== "visible"
    || !["blocking_validator_accepted", "blocking_validator_required"].includes(G3B_U08_SEMANTIC_PROMOTION_LIFECYCLE.validatorStatus)
    || G3B_U08_SEMANTIC_PROMOTION_ACTIVATION.humanSemanticReadbackAccepted !== true) {
    errors.push(issue("G3B_U08_CANONICAL_LIFECYCLE_INVALID", "promotionLifecycle", "S58F selector promotion and S58E human semantic readback are required before canonical routing."));
  }

  return { ok: errors.length === 0, errors, warnings: [] };
}

function contextVariantForPattern(patternSpecId, occurrenceIndex) {
  const variants = listG3BU08SemanticContextVariantsForPatternSpec(patternSpecId);
  return variants.length > 0 ? variants[occurrenceIndex % variants.length] : null;
}

function promoteQuestionForCanonicalRoute(question, plan, allocationEntry) {
  const semanticAuthorityPatternGroupId = question.patternGroupId;
  const patternTags = unique([...(question.metadata?.patternTags ?? []), "s58g_canonical_resolver_route"]);
  const difficultyTags = unique([...(question.metadata?.difficultyTags ?? []), "s58g_canonical_public_route"]);
  return {
    ...question,
    phase: "S58G",
    selectorStatus: "visible",
    visibilityStatus: "visible",
    productionUse: "canonical_runtime_only",
    generatorRouting: "canonical_resolver_allocation",
    resolvedPatternGroupId: allocationEntry.patternGroupId,
    semanticAuthorityPatternGroupId,
    promotionRegistryId: G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID,
    semanticSnapshot: {
      ...cloneValue(question.semanticSnapshot ?? {}),
      resolvedPatternGroupId: allocationEntry.patternGroupId,
      semanticAuthorityPatternGroupId,
      promotionRegistryId: G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID,
      runtimeStatus: "canonical_routed_pre_worksheet",
      resolverDerived: true
    },
    metadata: {
      ...cloneValue(question.metadata ?? {}),
      resolvedPatternGroupId: allocationEntry.patternGroupId,
      semanticAuthorityPatternGroupId,
      promotionRegistryId: G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID,
      patternTags,
      difficultyTags
    },
    canonicalRoute: {
      kind: G3B_U08_CANONICAL_ROUTE_KINDS.PURE_SEMANTIC,
      resolver: plan.resolverResult?.provenance?.resolver ?? null,
      allocationStrategy: plan.resolverResult?.provenance?.allocationStrategy ?? null,
      publicHiddenModeFlagUsed: false
    }
  };
}

function pathIssues(issues, questionIndex) {
  return (issues ?? []).map((entry) => ({
    ...entry,
    path: `questions[${questionIndex}].${entry.path ?? "generation"}`
  }));
}

export function generateG3BU08CanonicalSemanticQuestions(plan = {}, options = {}) {
  const planValidation = validateG3BU08CanonicalSemanticPlan(plan);
  if (!planValidation.ok) {
    return {
      ok: false,
      plan: cloneValue(plan),
      questions: [],
      allocation: cloneValue(plan.allocation ?? []),
      validation: planValidation,
      errors: planValidation.errors,
      warnings: []
    };
  }

  const validator = typeof options.validator === "function" ? options.validator : validateG3BU08SemanticQuestion;
  const generatedQuestions = [];
  const errors = [];
  const warnings = [];
  let sequenceNumber = 0;

  for (const allocationEntry of plan.allocation) {
    for (let occurrenceIndex = 0; occurrenceIndex < allocationEntry.questionCount; occurrenceIndex += 1) {
      const questionIndex = sequenceNumber;
      sequenceNumber += 1;
      const contextVariant = contextVariantForPattern(allocationEntry.patternSpecId, occurrenceIndex);
      const generated = generateG3BU08HiddenSemanticQuestion({
        patternSpecId: allocationEntry.patternSpecId,
        contextVariantId: contextVariant?.contextVariantId,
        seed: `${plan.generationSeed}:canonical:${allocationEntry.patternSpecId}:${occurrenceIndex + 1}`,
        sequenceNumber
      });
      warnings.push(...pathIssues(generated.warnings, questionIndex));
      if (!generated.ok || !generated.question) {
        errors.push(...pathIssues(generated.errors?.length ? generated.errors : [
          issue("G3B_U08_CANONICAL_GENERATION_FAILED", "generation", "Canonical semantic generation failed.")
        ], questionIndex));
        continue;
      }

      const promotedQuestion = promoteQuestionForCanonicalRoute(generated.question, plan, allocationEntry);
      const checked = validator(promotedQuestion);
      const blockingErrors = checked.blockingErrors ?? checked.errors ?? [];
      warnings.push(...pathIssues(checked.warnings, questionIndex));
      errors.push(...pathIssues(blockingErrors, questionIndex));
      if (checked.valid !== true && checked.ok !== true) continue;

      promotedQuestion.id = `${allocationEntry.patternSpecId}-${sequenceNumber}`;
      promotedQuestion.validatorVersion = checked.validatorVersion ?? G3B_U08_SEMANTIC_VALIDATOR_VERSION;
      promotedQuestion.validationStatus = "accepted";
      promotedQuestion.semanticSnapshot.validationCodes = unique((checked.warnings ?? []).map((entry) => entry.code));
      promotedQuestion.semanticSnapshot.validatorVersion = promotedQuestion.validatorVersion;
      generatedQuestions.push(promotedQuestion);
    }
  }

  if (generatedQuestions.length !== plan.questionCount) {
    errors.push(issue("G3B_U08_CANONICAL_OUTPUT_COUNT_MISMATCH", "questions", "Canonical semantic output count does not match the resolver allocation.", {
      expected: plan.questionCount,
      actual: generatedQuestions.length
    }));
  }

  const ok = errors.length === 0;
  const orderedQuestions = ok && plan.ordering === "shuffleAcrossPatterns"
    ? deterministicShuffle(generatedQuestions, `${plan.generationSeed}:s58g-canonical-shuffle:${plan.questionCount}`)
    : generatedQuestions;

  return {
    ok,
    plan: { ...cloneValue(plan), routeKind: G3B_U08_CANONICAL_ROUTE_KINDS.PURE_SEMANTIC },
    questions: ok ? orderedQuestions : [],
    allocation: cloneValue(plan.allocation),
    validation: { ok, errors: cloneValue(errors), warnings: cloneValue(warnings) },
    errors,
    warnings
  };
}

export function getG3BU08CanonicalPatternDefinition(patternSpecId) {
  return getG3BU08SemanticPatternDefinition(patternSpecId);
}
