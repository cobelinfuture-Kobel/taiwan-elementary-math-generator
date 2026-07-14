import {
  G5A_U02_HIDDEN_PATTERN_GROUPS,
  getG5AU02HiddenPatternSpecs,
} from "./source-pattern-g5a-u02-extension.js";

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

const SPEC_BY_ID = new Map(
  getG5AU02HiddenPatternSpecs().map((spec) => [spec.patternSpecId, spec]),
);

const PUBLIC_KP_LIFECYCLE = deepFreeze({
  task: "S96_G5A_U02_BrowserArbitraryRegenerationAndKnowledgePointSelection",
  projectionStatus: "public_projection_materialized",
  selectorStatus: "pending_browser_selector_integration",
  browserRegenerationStatus: "pending_runtime_integration",
  productionUse: "forbidden_until_s96_stress_pass",
  genericFallback: false,
  freeFormAI: false,
});

export const G5A_U02_PUBLIC_KNOWLEDGE_POINTS = deepFreeze(
  G5A_U02_HIDDEN_PATTERN_GROUPS.map((group, index) => {
    const patternSpecs = group.patternSpecIds.map((patternSpecId) => {
      const spec = SPEC_BY_ID.get(patternSpecId);
      if (!spec) throw new Error(`G5AU02_PUBLIC_KP_PATTERN_MISSING:${patternSpecId}`);
      return spec;
    });
    return {
      knowledgePointId: group.primaryKnowledgePointId,
      sourceId: "g5a_u02_5a02",
      unitId: "g5a_u02",
      unitCode: "5A-U02",
      unitTitle: "因數與公因數",
      displayOrder: index + 1,
      displayName: group.displayName,
      patternGroupId: group.patternGroupId,
      patternSpecIds: group.patternSpecIds,
      implementationClasses: [...new Set(patternSpecs.map((spec) => spec.implementationClass))],
      modes: group.modes,
      answerModelIds: group.answerModelIds,
      selectable: true,
      arbitraryRegenerationEligible: true,
      blockedReason: null,
      lifecycle: PUBLIC_KP_LIFECYCLE,
    };
  }),
);

const KP_BY_ID = new Map(
  G5A_U02_PUBLIC_KNOWLEDGE_POINTS.map((row) => [row.knowledgePointId, row]),
);

export function listG5AU02PublicKnowledgePoints() {
  return G5A_U02_PUBLIC_KNOWLEDGE_POINTS;
}

export function getG5AU02PublicKnowledgePoint(knowledgePointId) {
  return KP_BY_ID.get(knowledgePointId) ?? null;
}

export function resolveG5AU02PublicPatternSpecIds(knowledgePointIds = []) {
  if (!Array.isArray(knowledgePointIds) || knowledgePointIds.length === 0) {
    throw new Error("G5AU02_PUBLIC_KP_SELECTION_REQUIRED");
  }
  const uniqueIds = [...new Set(knowledgePointIds)];
  if (uniqueIds.length !== knowledgePointIds.length) {
    throw new Error("G5AU02_PUBLIC_KP_SELECTION_DUPLICATE");
  }
  const rows = uniqueIds.map((knowledgePointId) => {
    const row = getG5AU02PublicKnowledgePoint(knowledgePointId);
    if (!row) throw new Error(`G5AU02_PUBLIC_KP_UNKNOWN:${knowledgePointId}`);
    if (!row.selectable) throw new Error(`G5AU02_PUBLIC_KP_NOT_SELECTABLE:${knowledgePointId}`);
    return row;
  });
  return deepFreeze([...new Set(rows.flatMap((row) => row.patternSpecIds))]);
}

export function auditG5AU02PublicKnowledgePointProjection() {
  const errors = [];
  const patternIds = new Set();
  if (G5A_U02_PUBLIC_KNOWLEDGE_POINTS.length !== 18) {
    errors.push("G5AU02_PUBLIC_KP_COUNT_MISMATCH");
  }
  for (const row of G5A_U02_PUBLIC_KNOWLEDGE_POINTS) {
    if (!row.knowledgePointId || !row.patternGroupId || !row.displayName) {
      errors.push("G5AU02_PUBLIC_KP_REQUIRED_FIELD_MISSING");
    }
    for (const patternSpecId of row.patternSpecIds) patternIds.add(patternSpecId);
  }
  if (patternIds.size !== 22) errors.push("G5AU02_PUBLIC_KP_PATTERN_COVERAGE_MISMATCH");
  return deepFreeze({
    ok: errors.length === 0,
    errors: [...new Set(errors)],
    knowledgePointCount: G5A_U02_PUBLIC_KNOWLEDGE_POINTS.length,
    patternGroupCount: G5A_U02_PUBLIC_KNOWLEDGE_POINTS.length,
    patternSpecCount: patternIds.size,
    selectableCount: G5A_U02_PUBLIC_KNOWLEDGE_POINTS.filter((row) => row.selectable).length,
  });
}

export const G5A_U02_PUBLIC_KP_LIFECYCLE = PUBLIC_KP_LIFECYCLE;
