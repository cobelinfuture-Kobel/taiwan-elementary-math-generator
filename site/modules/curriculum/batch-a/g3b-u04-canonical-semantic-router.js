import {
  G3B_U04_SOURCE_ID,
  getG3BU04SemanticPatternDefinition
} from "./source-pattern-g3b-u04-semantic-extension.js";
import {
  generateG3BU04StructuralSemanticQuestion,
  isG3BU04StructuralSemanticPatternSpecId
} from "./g3b-u04-semantic-generator.js";
import {
  generateG3BU04MultiplicativeSemanticQuestion,
  isG3BU04MultiplicativeSemanticPatternSpecId
} from "./g3b-u04-multiplicative-semantic-generator.js";
import { validateG3BU04SemanticQuestion } from "./g3b-u04-semantic-validator-unit-flow-fullfix.js";
import {
  applyG3BU04HumanSemanticQualityV2,
  validateG3BU04HumanSemanticQualityV2
} from "./g3b-u04-human-semantic-readback-quality-v2.js";
import {
  G3B_U04_SEMANTIC_PROMOTION_LIFECYCLE,
  G3B_U04_SEMANTIC_PROMOTION_REGISTRY_ID,
  isS57FPromotedG3BU04SemanticPatternSpecId
} from "../registry/g3b-u04-semantic-promotion.js";

export const G3B_U04_PRESERVED_NUMERIC_PATTERN_SPEC_ID = "ps_g3b_u04_consecutive_multiplication";

export const G3B_U04_CANONICAL_ROUTE_KINDS = Object.freeze({
  LEGACY: "legacy",
  NUMERIC: "g3b_u04_numeric",
  PURE_SEMANTIC: "g3b_u04_pure_semantic",
  NUMERIC_SEMANTIC_HYBRID: "g3b_u04_numeric_semantic_hybrid",
  INVALID_SEMANTIC_SCOPE: "g3b_u04_invalid_semantic_scope"
});

export const G3B_U04_CANONICAL_ROUTER_INTEGRATION = Object.freeze({
  task: "S57F4_G3B_U04_CanonicalRouterAndHybridIntegration",
  sourceId: G3B_U04_SOURCE_ID,
  status: "canonical_router_integrated_validator_worksheet_gate_pending",
  routeKinds: Object.freeze([
    G3B_U04_CANONICAL_ROUTE_KINDS.NUMERIC,
    G3B_U04_CANONICAL_ROUTE_KINDS.PURE_SEMANTIC,
    G3B_U04_CANONICAL_ROUTE_KINDS.NUMERIC_SEMANTIC_HYBRID,
    G3B_U04_CANONICAL_ROUTE_KINDS.INVALID_SEMANTIC_SCOPE
  ]),
  resolverDerivedOnly: true,
  publicHiddenModeFlagAllowed: false,
  blockingSemanticValidatorRequired: true,
  humanSemanticReadbackFullFixRequired: true,
  genericFallbackOnSemanticFailureAllowed: false,
  productionEligibilityChanged: false,
  worksheetRendererChanged: false,
  requiredNextGate: "S57F5_G3B_U04_CanonicalValidatorWorksheetAndRendererIntegration"
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
  for (const char of String(value ?? "default")) {
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

function semanticAllocation(plan = {}) {
  return (Array.isArray(plan.allocation) ? plan.allocation : [])
    .filter((entry) => isS57FPromotedG3BU04SemanticPatternSpecId(entry?.patternSpecId));
}

export function classifyG3BU04CanonicalRouterPlan(plan = {}) {
  if (plan.sourceId !== G3B_U04_SOURCE_ID) return G3B_U04_CANONICAL_ROUTE_KINDS.LEGACY;
  if (plan.selectionMode === "sourceUnit" || plan.worksheetMode === "batchASource") {
    return G3B_U04_CANONICAL_ROUTE_KINDS.LEGACY;
  }
  if (plan.resolverResult?.ok !== true || !Array.isArray(plan.allocation) || plan.allocation.length === 0) {
    return G3B_U04_CANONICAL_ROUTE_KINDS.INVALID_SEMANTIC_SCOPE;
  }

  let hasSemantic = false;
  let hasNumeric = false;
  let hasUnknown = false;
  for (const entry of plan.allocation) {
    if (isS57FPromotedG3BU04SemanticPatternSpecId(entry?.patternSpecId)) hasSemantic = true;
    else if (entry?.patternSpecId === G3B_U04_PRESERVED_NUMERIC_PATTERN_SPEC_ID) hasNumeric = true;
    else hasUnknown = true;
  }

  if (hasUnknown || (!hasSemantic && !hasNumeric)) {
    return G3B_U04_CANONICAL_ROUTE_KINDS.INVALID_SEMANTIC_SCOPE;
  }
  if (hasSemantic && hasNumeric) return G3B_U04_CANONICAL_ROUTE_KINDS.NUMERIC_SEMANTIC_HYBRID;
  if (hasSemantic) return G3B_U04_CANONICAL_ROUTE_KINDS.PURE_SEMANTIC;
  return G3B_U04_CANONICAL_ROUTE_KINDS.NUMERIC;
}

export function buildG3BU04CanonicalSemanticSubplan(plan = {}) {
  const allocation = semanticAllocation(plan).map(cloneValue);
  const patternSpecIds = unique(allocation.map((entry) => entry.patternSpecId));
  const patternGroupIds = unique(allocation.map((entry) => entry.patternGroupId));
  const semanticQuestionCount = allocation.reduce((sum, entry) => sum + (entry.questionCount ?? 0), 0);
  return {
    ...cloneValue(plan),
    questionCount: semanticQuestionCount,
    allocation,
    patternSpecIds,
    selectedPatternGroupIds: patternGroupIds,
    routeKind: G3B_U04_CANONICAL_ROUTE_KINDS.PURE_SEMANTIC,
    parentQuestionCount: plan.questionCount,
    parentRouteKind: classifyG3BU04CanonicalRouterPlan(plan)
  };
}

export function validateG3BU04CanonicalSemanticPlan(plan = {}) {
  const errors = [];
  const allocation = Array.isArray(plan.allocation) ? plan.allocation : [];
  const selectedGroupIds = new Set(Array.isArray(plan.selectedPatternGroupIds) ? plan.selectedPatternGroupIds : []);
  const resolverGroupIds = new Set(Array.isArray(plan.resolverResult?.patternGroupIds) ? plan.resolverResult.patternGroupIds : []);
  const resolverPatternSpecIds = new Set(Array.isArray(plan.resolverResult?.patternSpecIds) ? plan.resolverResult.patternSpecIds : []);

  if (plan.sourceId !== G3B_U04_SOURCE_ID) {
    errors.push(issue("G3B_U04_CANONICAL_SOURCE_INVALID", "sourceId", "Canonical semantic plan has the wrong source."));
  }
  if (plan.resolverResult?.ok !== true || plan.resolverResult?.provenance?.resolver !== "visiblePatternGroupResolver") {
    errors.push(issue("G3B_U04_CANONICAL_RESOLVER_REQUIRED", "resolverResult", "Canonical semantic routing requires a successful visible PatternGroup resolver result."));
  }
  if (plan.selectionMode === "sourceUnit" || plan.worksheetMode === "batchASource") {
    errors.push(issue("G3B_U04_CANONICAL_SELECTION_MODE_INVALID", "selectionMode", "Semantic routing requires visible KnowledgePoint selection."));
  }
  if (plan.hiddenSemanticMode !== undefined || plan.g3bU04Semantic === true) {
    errors.push(issue("G3B_U04_CANONICAL_HIDDEN_MODE_FORBIDDEN", "hiddenSemanticMode", "Public canonical routing cannot use the hidden semantic mode."));
  }
  if (!Number.isInteger(plan.questionCount) || plan.questionCount <= 0 || plan.questionCount > 1000) {
    errors.push(issue("G3B_U04_CANONICAL_COUNT_INVALID", "questionCount", "Canonical semantic question count must be between 1 and 1000."));
  }
  if (allocation.length === 0) {
    errors.push(issue("G3B_U04_CANONICAL_ALLOCATION_EMPTY", "allocation", "Canonical semantic allocation is empty."));
  }

  let allocatedCount = 0;
  for (const [index, entry] of allocation.entries()) {
    const path = `allocation[${index}]`;
    if (!Number.isInteger(entry?.questionCount) || entry.questionCount <= 0) {
      errors.push(issue("G3B_U04_CANONICAL_ALLOCATION_COUNT_INVALID", `${path}.questionCount`, "Allocation question count must be a positive integer."));
      continue;
    }
    allocatedCount += entry.questionCount;
    if (!isS57FPromotedG3BU04SemanticPatternSpecId(entry.patternSpecId)) {
      errors.push(issue("G3B_U04_CANONICAL_PATTERN_NOT_PROMOTED", `${path}.patternSpecId`, "Allocation contains an unpromoted semantic PatternSpec."));
    }
    if (!selectedGroupIds.has(entry.patternGroupId) || !resolverGroupIds.has(entry.patternGroupId)) {
      errors.push(issue("G3B_U04_CANONICAL_GROUP_NOT_RESOLVED", `${path}.patternGroupId`, "Allocation PatternGroup was not selected and resolved visibly."));
    }
    if (!resolverPatternSpecIds.has(entry.patternSpecId)) {
      errors.push(issue("G3B_U04_CANONICAL_PATTERN_NOT_RESOLVED", `${path}.patternSpecId`, "Allocation PatternSpec was not derived by the visible resolver."));
    }
  }

  if (allocatedCount !== plan.questionCount) {
    errors.push(issue("G3B_U04_CANONICAL_ALLOCATION_MISMATCH", "allocation", "Canonical semantic allocation does not equal the requested question count.", {
      expected: plan.questionCount,
      actual: allocatedCount
    }));
  }
  if (G3B_U04_SEMANTIC_PROMOTION_LIFECYCLE.productionUse !== "allowed"
    || G3B_U04_SEMANTIC_PROMOTION_LIFECYCLE.runtimeStatus !== "production_routed"
    || G3B_U04_SEMANTIC_PROMOTION_LIFECYCLE.validatorStatus !== "blocking_validator_required") {
    errors.push(issue("G3B_U04_CANONICAL_LIFECYCLE_INVALID", "promotionLifecycle", "Promotion lifecycle is not eligible for canonical semantic routing."));
  }

  return { ok: errors.length === 0, errors, warnings: [] };
}

function generateForPattern(patternSpecId, options) {
  if (isG3BU04StructuralSemanticPatternSpecId(patternSpecId)) {
    return generateG3BU04StructuralSemanticQuestion({ ...options, patternSpecId });
  }
  if (isG3BU04MultiplicativeSemanticPatternSpecId(patternSpecId)) {
    return generateG3BU04MultiplicativeSemanticQuestion({ ...options, patternSpecId });
  }
  return {
    ok: false,
    question: null,
    errors: [issue("G3B_U04_CANONICAL_PATTERN_NOT_PROMOTED", "patternSpecId", `PatternSpec '${patternSpecId}' has no canonical semantic generator.`)],
    warnings: []
  };
}

const PGC_R05_PROMPT_DIVERSITY_RETRY_LIMIT = 32;

function isPgcR05ApplicationDiversityPlan(plan = {}) {
  return String(plan.generationSeed ?? "").includes("pgc-r05");
}

function generationSeedForVariant(plan, allocationEntry, familyIndex, variantAttempt) {
  const base = `${plan.generationSeed}:canonical:${allocationEntry.patternSpecId}:${familyIndex + 1}`;
  return variantAttempt === 0 ? base : `${base}:pgc-r05-diversity:${variantAttempt}`;
}

function contextDomainForFamily(patternSpecId, familyIndex) {
  const domains = getG3BU04SemanticPatternDefinition(patternSpecId)?.contextDomains ?? [];
  return domains.length > 0 ? domains[familyIndex % domains.length] : undefined;
}

function promoteQuestionForCanonicalRoute(question, plan, allocationEntry) {
  const authorityPatternGroupId = question.patternGroupId;
  const patternTags = unique([...(question.metadata?.patternTags ?? []), "s57f4_canonical_resolver_route"]);
  const difficultyTags = unique([...(question.metadata?.difficultyTags ?? []), "s57f4_canonical_public_route"]);
  return {
    ...question,
    phase: "S57F4",
    selectorStatus: "visible",
    visibilityStatus: "visible",
    productionUse: "allowed",
    generatorRouting: "canonical_resolver_allocation",
    resolvedPatternGroupId: allocationEntry.patternGroupId,
    semanticAuthorityPatternGroupId: authorityPatternGroupId,
    promotionRegistryId: G3B_U04_SEMANTIC_PROMOTION_REGISTRY_ID,
    semanticSnapshot: {
      ...cloneValue(question.semanticSnapshot ?? {}),
      resolvedPatternGroupId: allocationEntry.patternGroupId,
      semanticAuthorityPatternGroupId: authorityPatternGroupId,
      promotionRegistryId: G3B_U04_SEMANTIC_PROMOTION_REGISTRY_ID,
      runtimeStatus: "production_routed",
      resolverDerived: true
    },
    metadata: {
      ...cloneValue(question.metadata ?? {}),
      resolvedPatternGroupId: allocationEntry.patternGroupId,
      semanticAuthorityPatternGroupId: authorityPatternGroupId,
      promotionRegistryId: G3B_U04_SEMANTIC_PROMOTION_REGISTRY_ID,
      patternTags,
      difficultyTags
    },
    canonicalRoute: {
      kind: G3B_U04_CANONICAL_ROUTE_KINDS.PURE_SEMANTIC,
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

export function generateG3BU04CanonicalSemanticQuestions(plan = {}, options = {}) {
  const planValidation = validateG3BU04CanonicalSemanticPlan(plan);
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

  const validator = typeof options.validator === "function" ? options.validator : validateG3BU04SemanticQuestion;
  const generatedQuestions = [];
  const errors = [];
  const warnings = [];
  const recentPrompts = [];
  let sequenceNumber = 0;

  const diversityRetryEnabled = isPgcR05ApplicationDiversityPlan(plan);
  const variantLimit = diversityRetryEnabled ? PGC_R05_PROMPT_DIVERSITY_RETRY_LIMIT : 1;

  for (const allocationEntry of plan.allocation) {
    for (let familyIndex = 0; familyIndex < allocationEntry.questionCount; familyIndex += 1) {
      const questionIndex = sequenceNumber;
      sequenceNumber += 1;
      let acceptedQuestion = null;
      let acceptedChecked = null;
      let acceptedReadback = null;
      let acceptedGenerationWarnings = [];
      let terminalErrors = [];
      let terminalWarnings = [];

      for (let variantAttempt = 0; variantAttempt < variantLimit; variantAttempt += 1) {
        const generated = generateForPattern(allocationEntry.patternSpecId, {
          seed: generationSeedForVariant(plan, allocationEntry, familyIndex, variantAttempt),
          sequenceNumber,
          contextDomain: contextDomainForFamily(allocationEntry.patternSpecId, familyIndex)
        });
        acceptedGenerationWarnings = generated.warnings ?? [];
        if (!generated.ok || !generated.question) {
          terminalErrors = generated.errors?.length ? generated.errors : [
            issue("G3B_U04_CANONICAL_GENERATION_FAILED", "generation", "Canonical semantic generation failed.")
          ];
          if (variantAttempt + 1 < variantLimit) continue;
          break;
        }

        const promotedQuestion = applyG3BU04HumanSemanticQualityV2(
          promoteQuestionForCanonicalRoute(generated.question, plan, allocationEntry)
        );
        if (diversityRetryEnabled && recentPrompts.includes(promotedQuestion.promptText)) {
          terminalErrors = [issue(
            "G3B_U04_CANONICAL_PROMPT_DIVERSITY_EXHAUSTED",
            "promptText",
            "Unable to produce a unique learner-visible prompt within the deterministic R05 retry budget."
          )];
          if (variantAttempt + 1 < variantLimit) continue;
          break;
        }

        const checked = validator(promotedQuestion, { recentPrompts });
        const readback = validateG3BU04HumanSemanticQualityV2(promotedQuestion);
        terminalErrors = [...(checked.errors ?? []), ...(readback.errors ?? [])];
        terminalWarnings = [...(checked.warnings ?? []), ...(readback.warnings ?? [])];
        if (!checked.ok || !readback.ok) break;

        acceptedQuestion = promotedQuestion;
        acceptedChecked = checked;
        acceptedReadback = readback;
        break;
      }

      warnings.push(...pathIssues(acceptedGenerationWarnings, questionIndex));
      warnings.push(...pathIssues(terminalWarnings, questionIndex));
      if (!acceptedQuestion || !acceptedChecked || !acceptedReadback) {
        errors.push(...pathIssues(terminalErrors, questionIndex));
        continue;
      }

      acceptedQuestion.id = `${allocationEntry.patternSpecId}-${sequenceNumber}`;
      acceptedQuestion.semanticSnapshot.validationCodes = unique([
        ...(acceptedChecked.warnings ?? []).map((warning) => warning.code),
        ...(acceptedReadback.warnings ?? []).map((warning) => warning.code)
      ]);
      generatedQuestions.push(acceptedQuestion);
      recentPrompts.push(acceptedQuestion.promptText);
    }
  }

  if (generatedQuestions.length !== plan.questionCount) {
    errors.push(issue("G3B_U04_CANONICAL_OUTPUT_COUNT_MISMATCH", "questions", "Canonical semantic output count does not match the resolver allocation.", {
      expected: plan.questionCount,
      actual: generatedQuestions.length
    }));
  }

  const ok = errors.length === 0;
  const orderedQuestions = ok && plan.ordering === "shuffleAcrossPatterns"
    ? deterministicShuffle(generatedQuestions, `${plan.generationSeed}:s57f4-canonical-shuffle:${plan.questionCount}`)
    : generatedQuestions;

  return {
    ok,
    plan: cloneValue(plan),
    questions: ok ? orderedQuestions : [],
    allocation: cloneValue(plan.allocation),
    validation: { ok, errors: cloneValue(errors), warnings: cloneValue(warnings) },
    errors,
    warnings
  };
}

// PGC-R05 G3B-U04 canonical prompt diversity FullFix V1
