export * from "./batch-a-browser-question-router-core.js";

import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import { generateBatchABrowserQuestions as generateCoreBatchABrowserQuestions } from "./batch-a-browser-question-router-core.js";
import { applyG4AU01FirstDifferenceFullFix } from "./g4a-u01-first-difference-fullfix.js";
import { applyG4AU08GeneratorValidatorDomainFullFix } from "./g4a-u08-generator-validator-domain-fullfix.js";
import {
  applyG3BU04GlobalContextProductionAdmission
} from "./g3b-u04-global-context-production-admission.js";
import {
  generateG4AU08AllCanonicalPublicQuestions,
  normalizeG4AU08AllCanonicalPublicPlan,
  requestsG4AU08AllCanonicalPublicRoute,
} from "./g4a-u08-all-canonical-public-router.js";
import {
  G4A_U08_CANONICAL_ROUTE_KINDS,
  classifyG4AU08CanonicalRouterPlan,
  generateG4AU08CanonicalQuestions,
  normalizeG4AU08ResolverPlan,
} from "./g4a-u08-canonical-router.js";
import {
  G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS,
} from "../registry/g4a-u08-phase2b-promotion.js";
import {
  G5A_U08_CANONICAL_ROUTE_KINDS,
  classifyG5AU08CanonicalRouterPlan,
  generateG5AU08CanonicalQuestions,
  normalizeG5AU08ResolverPlan,
} from "./g5a-u08-canonical-router.js";
import {
  G4B_U04_CANONICAL_ROUTE_KINDS,
  classifyG4BU04CanonicalRouterPlan,
  generateG4BU04CanonicalQuestions,
  normalizeG4BU04ResolverPlan,
} from "../batch-b/g4b-u04-canonical-router-r2e.js";
import {
  attachPostGoldenQuestionLineage,
} from "../golden/post-golden-question-lineage.js";

const G4A_U08_PHASE2B_GROUP_SET = new Set(G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS);

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

function hashSeed(value) {
  let acc = 0;
  for (const char of String(value ?? "default")) acc = ((acc * 31) + char.charCodeAt(0)) >>> 0;
  return acc || 1;
}

function mix32(value) {
  let mixed = value >>> 0;
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x7feb352d);
  mixed = Math.imul(mixed ^ (mixed >>> 15), 0x846ca68b);
  return (mixed ^ (mixed >>> 16)) >>> 0;
}

function shuffleQuestions(questions, seed) {
  const shuffled = [...questions];
  let seedValue = hashSeed(seed);
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    seedValue = mix32(seedValue + index);
    const swapIndex = seedValue % (index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function applyRequestedOrdering(result, plan, routeId) {
  if (result?.ok !== true || plan?.ordering !== "shuffleAcrossPatterns") return result;
  return {
    ...result,
    questions: shuffleQuestions(
      result.questions ?? [],
      `${plan.generationSeed}:${routeId}:${plan.questionCount}`,
    ),
  };
}

function normalizeExplicitErrors(explicitErrors = []) {
  return explicitErrors.map((entry) => ({
    code: entry.code ?? "CANONICAL_ROUTE_INVALID",
    severity: entry.severity ?? "error",
    path: entry.path ?? "canonicalRoute",
    message: entry.message ?? "Canonical route rejected the public request.",
    ...cloneValue(entry),
  }));
}

function invalidCanonicalResult(plan, prefix, fallbackMessage, explicitErrors = []) {
  const directErrors = Array.isArray(explicitErrors) ? normalizeExplicitErrors(explicitErrors) : [];
  const resolverErrors = Array.isArray(plan.resolverResult?.errors) ? plan.resolverResult.errors : [];
  const errors = directErrors.length > 0
    ? directErrors
    : resolverErrors.length > 0
      ? resolverErrors.map((entry) => ({
        code: entry.code ?? `${prefix}_CANONICAL_SCOPE_INVALID`,
        severity: "error",
        path: entry.path ?? "resolverResult",
        message: entry.message ?? `${prefix} 公開選擇被 resolver 拒絕。`,
      }))
      : [{
        code: `${prefix}_CANONICAL_SCOPE_INVALID`,
        severity: "error",
        path: "allocation",
        message: fallbackMessage,
      }];
  return {
    ok: false,
    plan,
    questions: [],
    allocation: cloneValue(plan.allocation ?? []),
    errors,
    warnings: cloneValue(plan.resolverResult?.warnings ?? []),
  };
}

function requestsG4AU08Phase2B(plan = {}) {
  return Array.isArray(plan.requestedPatternGroupIds)
    && plan.requestedPatternGroupIds.some((id) => G4A_U08_PHASE2B_GROUP_SET.has(id));
}

function finalizePostGoldenResult(result, options) {
  return attachPostGoldenQuestionLineage(result, options);
}

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);

  if (requestsG4AU08AllCanonicalPublicRoute(plan)) {
    const g4aU08Plan = normalizeG4AU08AllCanonicalPublicPlan(plan);
    const result = generateG4AU08AllCanonicalPublicQuestions(g4aU08Plan);
    if (!result.ok) {
      return finalizePostGoldenResult(invalidCanonicalResult(
        result.plan,
        "G4A_U08_S76Q",
        "G4A-U08 公開選擇沒有可用的 canonical KnowledgePoint 或 PatternGroup。",
        result.errors,
      ), options);
    }
    return finalizePostGoldenResult(
      applyRequestedOrdering(result, g4aU08Plan, "g4a-u08-all-canonical"),
      options,
    );
  }

  if (requestsG4AU08Phase2B(plan)) {
    const g4aU08Plan = normalizeG4AU08ResolverPlan(plan);
    const g4aU08RouteKind = classifyG4AU08CanonicalRouterPlan(g4aU08Plan);
    if (g4aU08RouteKind === G4A_U08_CANONICAL_ROUTE_KINDS.INVALID_SCOPE) {
      return finalizePostGoldenResult(
        invalidCanonicalResult(g4aU08Plan, "G4A_U08", "G4A-U08 公開選擇沒有可用的 Phase2B KnowledgePoint 或 PatternGroup。"),
        options,
      );
    }
    if (g4aU08RouteKind === G4A_U08_CANONICAL_ROUTE_KINDS.CANONICAL) {
      return finalizePostGoldenResult(generateG4AU08CanonicalQuestions(g4aU08Plan), options);
    }
  }

  const g4bU04Plan = normalizeG4BU04ResolverPlan(plan);
  const g4bU04RouteKind = classifyG4BU04CanonicalRouterPlan(g4bU04Plan);
  if (g4bU04RouteKind === G4B_U04_CANONICAL_ROUTE_KINDS.INVALID_SCOPE) {
    return finalizePostGoldenResult(
      invalidCanonicalResult(g4bU04Plan, "G4B_U04", "G4B-U04 公開選擇沒有可用的 KnowledgePoint、PatternGroup 或題目模式。"),
      options,
    );
  }
  if (g4bU04RouteKind === G4B_U04_CANONICAL_ROUTE_KINDS.CANONICAL) {
    return finalizePostGoldenResult(generateG4BU04CanonicalQuestions(g4bU04Plan), options);
  }

  const g5aU08Plan = normalizeG5AU08ResolverPlan(plan);
  const g5aU08RouteKind = classifyG5AU08CanonicalRouterPlan(g5aU08Plan);
  if (g5aU08RouteKind === G5A_U08_CANONICAL_ROUTE_KINDS.INVALID_SCOPE) {
    return finalizePostGoldenResult(
      invalidCanonicalResult(g5aU08Plan, "G5A_U08", "G5A-U08 公開選擇沒有可用的 mode、depth 與 context 組合。"),
      options,
    );
  }
  if (g5aU08RouteKind === G5A_U08_CANONICAL_ROUTE_KINDS.CANONICAL) {
    return finalizePostGoldenResult(generateG5AU08CanonicalQuestions(g5aU08Plan), options);
  }
  const coreResult = generateCoreBatchABrowserQuestions(options);
  const g3bU04ProductionResult = applyG3BU04GlobalContextProductionAdmission(coreResult, plan);
  const g4aU08DomainResult = applyG4AU08GeneratorValidatorDomainFullFix(g3bU04ProductionResult, plan);
  const finalResult = applyG4AU01FirstDifferenceFullFix(g4aU08DomainResult, plan);
  return finalizePostGoldenResult(finalResult, options);
}
