export * from "./batch-a-browser-question-router-core.js";

import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import { generateBatchABrowserQuestions as generateCoreBatchABrowserQuestions } from "./batch-a-browser-question-router-core.js";
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
} from "../batch-b/g4b-u04-canonical-router.js";

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

function invalidCanonicalResult(plan, prefix, fallbackMessage) {
  const resolverErrors = Array.isArray(plan.resolverResult?.errors) ? plan.resolverResult.errors : [];
  const errors = resolverErrors.length > 0
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

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);

  const g4bU04Plan = normalizeG4BU04ResolverPlan(plan);
  const g4bU04RouteKind = classifyG4BU04CanonicalRouterPlan(g4bU04Plan);
  if (g4bU04RouteKind === G4B_U04_CANONICAL_ROUTE_KINDS.INVALID_SCOPE) {
    return invalidCanonicalResult(g4bU04Plan, "G4B_U04", "G4B-U04 公開選擇沒有可用的 KnowledgePoint、PatternGroup 或題目模式。");
  }
  if (g4bU04RouteKind === G4B_U04_CANONICAL_ROUTE_KINDS.CANONICAL) {
    return generateG4BU04CanonicalQuestions(g4bU04Plan);
  }

  const g5aU08Plan = normalizeG5AU08ResolverPlan(plan);
  const g5aU08RouteKind = classifyG5AU08CanonicalRouterPlan(g5aU08Plan);
  if (g5aU08RouteKind === G5A_U08_CANONICAL_ROUTE_KINDS.INVALID_SCOPE) {
    return invalidCanonicalResult(g5aU08Plan, "G5A_U08", "G5A-U08 公開選擇沒有可用的 mode、depth 與 context 組合。");
  }
  if (g5aU08RouteKind === G5A_U08_CANONICAL_ROUTE_KINDS.CANONICAL) {
    return generateG5AU08CanonicalQuestions(g5aU08Plan);
  }
  return generateCoreBatchABrowserQuestions(options);
}
