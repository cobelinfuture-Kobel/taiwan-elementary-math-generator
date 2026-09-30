export * from "./batch-a-selector-p09-a02-extension.js";
import * as base from "./batch-a-selector-p09-a02-extension.js";
import {
  P09_A03B_SOURCE_ROUTE_ALIASES,
  getP09A03BSourceRouteAlias,
} from "./public-curriculum-source-route-aliases-p09-a03b.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

function ownerRows(alias) {
  const byId = new Map(
    base.listVisibleBatchAKnowledgePoints()
      .filter((row) => row.sourceId === alias.semanticOwnerSourceId)
      .map((row) => [row.knowledgePointId, row]),
  );
  return alias.knowledgePointIds.map((knowledgePointId) => {
    const owner = byId.get(knowledgePointId);
    if (!owner) throw new Error(`P09_A03B_OWNER_KP_MISSING:${alias.sourceId}:${knowledgePointId}`);
    return Object.freeze({
      ...clone(owner),
      sourceId: alias.sourceId,
      unitCode: alias.unitCode,
      unitTitle: alias.title,
      semanticOwnerSourceId: alias.semanticOwnerSourceId,
      sourceRouteAlias: true,
      sourceAuthorityPolicy: alias.sourceAuthorityPolicy,
      qaStatusLabel: "P09_A03B_PUBLIC_CURRICULUM_SOURCE_ROUTE_ALIAS",
      productionUse: "p09_ui_a03b_public_curriculum_source_route",
    });
  });
}

export const P09_A03B_SOURCE_ROUTE_SELECTOR_ROWS = Object.freeze(
  P09_A03B_SOURCE_ROUTE_ALIASES.flatMap(ownerRows),
);

const baseAvailability = base.BATCH_A_SELECTOR_AVAILABILITY;
const g3aU08Rows = base.listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === "g3a_u08_3a08");
const g3aU08Availability = Object.freeze({
  ...(baseAvailability.bySourceId?.["g3a_u08_3a08"] ?? {}),
  sourceId: "g3a_u08_3a08",
  visibleCount: g3aU08Rows.length,
  hiddenPendingCount: 0,
  notSelectableCount: 0,
  visibleKnowledgePointIds: Object.freeze(g3aU08Rows.map((row) => row.knowledgePointId)),
  hiddenPendingKnowledgePointIds: Object.freeze([]),
  notSelectableKnowledgePointIds: Object.freeze([]),
  publicSelectorStatus: "p09_a03b_g3a_u08_7_of_7_current",
});
const aliasAvailabilityEntries = Object.fromEntries(P09_A03B_SOURCE_ROUTE_ALIASES.map((alias) => [
  alias.sourceId,
  Object.freeze({
    sourceId: alias.sourceId,
    visibleCount: alias.knowledgePointIds.length,
    hiddenPendingCount: 0,
    notSelectableCount: 0,
    visibleKnowledgePointIds: Object.freeze([...alias.knowledgePointIds]),
    hiddenPendingKnowledgePointIds: Object.freeze([]),
    notSelectableKnowledgePointIds: Object.freeze([]),
    publicSelectorStatus: "p09_a03b_distinct_curriculum_source_route",
    semanticOwnerSourceId: alias.semanticOwnerSourceId,
    sourceAuthorityPolicy: alias.sourceAuthorityPolicy,
    sourceRouteAlias: true,
  }),
]));

export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...baseAvailability,
  visibleCount: 482,
  canonicalUniqueKnowledgePointCount: 482,
  publicSourceKnowledgePointRouteProjectionCount: 493,
  publicCurriculumUnitCount: 78,
  bySourceId: Object.freeze({
    ...baseAvailability.bySourceId,
    ["g3a_u08_3a08"]: g3aU08Availability,
    ...aliasAvailabilityEntries,
  }),
});

export function listVisibleBatchAKnowledgePoints() {
  return [
    ...base.listVisibleBatchAKnowledgePoints().map(clone),
    ...P09_A03B_SOURCE_ROUTE_SELECTOR_ROWS.map(clone),
  ];
}

export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  const alias = getP09A03BSourceRouteAlias(sourceId);
  return clone(alias
    ? BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId]
    : base.listBatchAKnowledgePointAvailabilityBySource(sourceId));
}

export function getVisibleBatchAKnowledgePoint(knowledgePointId) {
  return base.getVisibleBatchAKnowledgePoint(knowledgePointId);
}

export function getVisiblePatternGroupsForKnowledgePoint(knowledgePointId) {
  return base.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
}

export function resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId, mode = null) {
  return base.resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId, mode);
}

export function auditP09A03BPublicSelectorComposition() {
  const errors = [];
  const rows = listVisibleBatchAKnowledgePoints();
  const uniqueIds = new Set(rows.map((row) => row.knowledgePointId));
  if (rows.length !== 493) errors.push("P09_A03B_ROUTE_PROJECTION_COUNT_INVALID");
  if (uniqueIds.size !== 482) errors.push("P09_A03B_CANONICAL_UNIQUE_KP_COUNT_INVALID");
  for (const alias of P09_A03B_SOURCE_ROUTE_ALIASES) {
    const sourceRows = rows.filter((row) => row.sourceId === alias.sourceId);
    if (sourceRows.length !== alias.knowledgePointIds.length) {
      errors.push(`P09_A03B_ALIAS_ROUTE_COUNT_INVALID:${alias.sourceId}`);
    }
    const ids = sourceRows.map((row) => row.knowledgePointId);
    if (alias.knowledgePointIds.some((id) => !ids.includes(id))) {
      errors.push(`P09_A03B_ALIAS_ROUTE_ID_MISSING:${alias.sourceId}`);
    }
  }
  const g3a = listBatchAKnowledgePointAvailabilityBySource("g3a_u08_3a08");
  const g3aRows = rows.filter((row) => row.sourceId === "g3a_u08_3a08");
  if (g3a.visibleCount !== 7 || g3aRows.length !== 7 || g3a.hiddenPendingCount !== 0 || g3a.notSelectableCount !== 0) {
    errors.push("P09_A03B_G3A_U08_7_OF_7_VISIBILITY_INVALID");
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      canonicalUniqueKnowledgePoints: uniqueIds.size,
      sourceKnowledgePointRouteProjections: rows.length,
      publicCurriculumUnits: 78,
      g3aU08Visible: g3a.visibleCount,
    }),
  });
}
