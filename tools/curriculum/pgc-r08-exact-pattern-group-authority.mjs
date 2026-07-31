import { PUBLIC_GENERATOR_CAPACITY_ROWS } from "../../site/modules/curriculum/public/public-generator-capacity-registry.js";

const ROUTE_ID_COLUMN = 10;
const PUBLIC_PATTERN_GROUP_COLUMN = 4;

function uniqueSorted(values = []) {
  return [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))].sort();
}

function splitKey(value) {
  return uniqueSorted(String(value ?? "").split("|"));
}

const EXACT_GROUPS_BY_ROUTE_ID = new Map();
for (const row of PUBLIC_GENERATOR_CAPACITY_ROWS) {
  const routeId = row[ROUTE_ID_COLUMN];
  if (!routeId) continue;
  if (EXACT_GROUPS_BY_ROUTE_ID.has(routeId)) {
    throw new Error(`PGC_R08_EXACT_PATTERN_GROUP_ROUTE_DUPLICATE:${routeId}`);
  }
  EXACT_GROUPS_BY_ROUTE_ID.set(routeId, Object.freeze(splitKey(row[PUBLIC_PATTERN_GROUP_COLUMN])));
}

export function exactPublicPatternGroupIdsForRoute(routeId) {
  if (!EXACT_GROUPS_BY_ROUTE_ID.has(routeId)) {
    throw new Error(`PGC_R08_EXACT_PATTERN_GROUP_ROUTE_MISSING:${routeId}`);
  }
  return [...EXACT_GROUPS_BY_ROUTE_ID.get(routeId)];
}

export function enrichBrowserRowWithExactPatternGroups(row) {
  return Object.freeze({
    ...row,
    publicPatternGroupIds: Object.freeze(exactPublicPatternGroupIdsForRoute(row.routeId)),
  });
}

export function exactPatternGroupAuthoritySummary() {
  return Object.freeze({
    routeCount: EXACT_GROUPS_BY_ROUTE_ID.size,
    nonEmptyRouteCount: [...EXACT_GROUPS_BY_ROUTE_ID.values()].filter((ids) => ids.length > 0).length,
  });
}
