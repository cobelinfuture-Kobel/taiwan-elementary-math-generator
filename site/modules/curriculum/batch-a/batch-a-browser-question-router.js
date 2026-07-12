export * from "./batch-a-browser-question-router-core.js";

import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import { generateBatchABrowserQuestions as generateCoreBatchABrowserQuestions } from "./batch-a-browser-question-router-core.js";
import {
  G5A_U08_CANONICAL_ROUTE_KINDS,
  classifyG5AU08CanonicalRouterPlan,
  generateG5AU08CanonicalQuestions,
  normalizeG5AU08ResolverPlan,
} from "./g5a-u08-canonical-router.js";

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

function invalidG5AU08CanonicalResult(plan) {
  const resolverErrors = Array.isArray(plan.resolverResult?.errors) ? plan.resolverResult.errors : [];
  const errors = resolverErrors.length > 0
    ? resolverErrors.map((entry) => ({
      code: entry.code ?? "G5A_U08_CANONICAL_SCOPE_INVALID",
      severity: "error",
      path: "resolverResult",
      message: `G5A-U08 公開選擇被 visible resolver 拒絕：${entry.code ?? "unknown"}。`,
    }))
    : [{
      code: "G5A_U08_CANONICAL_SCOPE_INVALID",
      severity: "error",
      path: "allocation",
      message: "G5A-U08 公開選擇沒有可用的 mode、depth 與 context 組合。",
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
  const normalized = normalizeG5AU08ResolverPlan(plan);
  const routeKind = classifyG5AU08CanonicalRouterPlan(normalized);
  if (routeKind === G5A_U08_CANONICAL_ROUTE_KINDS.INVALID_SCOPE) {
    return invalidG5AU08CanonicalResult(normalized);
  }
  if (routeKind === G5A_U08_CANONICAL_ROUTE_KINDS.CANONICAL) {
    return generateG5AU08CanonicalQuestions(normalized);
  }
  return generateCoreBatchABrowserQuestions(options);
}
