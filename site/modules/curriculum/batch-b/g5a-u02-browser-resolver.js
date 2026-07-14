import {
  G5A_U02_PUBLIC_KP_LIFECYCLE,
  resolveG5AU02PublicPatternSpecIds,
} from "./g5a-u02-public-knowledge-points.js";

export const G5A_U02_PUBLIC_SOURCE_ID = "g5a_u02_5a02";

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
}

function selectedKnowledgePointIds(plan = {}) {
  const ids = plan.knowledgePointIds ?? plan.selectedKnowledgePointIds ?? [];
  return Array.isArray(ids) ? [...ids] : [];
}

export function isG5AU02KnowledgePointPlan(plan = {}) {
  return plan?.sourceId === G5A_U02_PUBLIC_SOURCE_ID && selectedKnowledgePointIds(plan).length > 0;
}

export function resolveG5AU02BrowserPlan(plan = {}) {
  if (plan?.sourceId !== G5A_U02_PUBLIC_SOURCE_ID) return null;
  const knowledgePointIds = selectedKnowledgePointIds(plan);
  if (knowledgePointIds.length === 0) {
    return freeze({
      ok: true,
      errors: [],
      mode: "sourceUnit",
      plan: { ...plan },
      knowledgePointIds: [],
      patternSpecIds: [],
      lifecycle: {
        ...G5A_U02_PUBLIC_KP_LIFECYCLE,
        browserResolverStatus: "source_unit_passthrough",
      },
    });
  }

  try {
    const patternSpecIds = resolveG5AU02PublicPatternSpecIds(knowledgePointIds);
    return freeze({
      ok: true,
      errors: [],
      mode: knowledgePointIds.length === 1 ? "singleKnowledgePoint" : "multiKnowledgePoint",
      knowledgePointIds,
      patternSpecIds,
      plan: {
        ...plan,
        knowledgePointIds,
        patternSpecIds,
      },
      lifecycle: {
        ...G5A_U02_PUBLIC_KP_LIFECYCLE,
        browserResolverStatus: "integrated",
        browserRegenerationStatus: "pending_s96d",
        productionUse: "forbidden_until_s96_stress_pass",
      },
    });
  } catch (error) {
    return freeze({
      ok: false,
      errors: [error.message],
      mode: "blocked",
      plan: null,
      knowledgePointIds,
      patternSpecIds: [],
      lifecycle: {
        ...G5A_U02_PUBLIC_KP_LIFECYCLE,
        browserResolverStatus: "blocked",
      },
    });
  }
}

export function auditG5AU02BrowserResolver() {
  const errors = [];
  const sourceUnit = resolveG5AU02BrowserPlan({ sourceId: G5A_U02_PUBLIC_SOURCE_ID });
  if (!sourceUnit?.ok || sourceUnit.mode !== "sourceUnit") errors.push("G5AU02_BROWSER_RESOLVER_SOURCE_UNIT_FAILED");
  return freeze({ ok: errors.length === 0, errors });
}
