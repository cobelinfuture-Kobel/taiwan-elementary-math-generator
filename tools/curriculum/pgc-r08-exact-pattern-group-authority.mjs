import { readFile } from "node:fs/promises";
import { PUBLIC_GENERATOR_CAPACITY_ROWS } from "../../site/modules/curriculum/public/public-generator-capacity-registry.js";

const ROUTE_ID_COLUMN = 10;
const PUBLIC_PATTERN_GROUP_COLUMN = 4;
const APPLICATION_ALIAS_PREFIX = "w01_app_";
const CAPACITY_CONTRACT = JSON.parse(
  await readFile(
    new URL("../../data/curriculum/public-generation/generator_capacity_contract.json", import.meta.url),
    "utf8",
  ),
);

function uniqueSorted(values = []) {
  return [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))].sort();
}

function splitKey(value) {
  return uniqueSorted(String(value ?? "").split("|"));
}

function sameValues(left = [], right = []) {
  const a = uniqueSorted(left);
  const b = uniqueSorted(right);
  return a.length === b.length && a.every((value, index) => value === b[index]);
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

const singleFormRows = CAPACITY_CONTRACT.routes
  .filter((route) => route.setKind === "single-form")
  .map((route) => ({
    sourceId: route.sourceId,
    questionType: route.questionType,
    patternGroupIds: uniqueSorted(route.publicPatternGroupIds),
    patternSpecIds: uniqueSorted(route.compatiblePatternSpecIds),
  }))
  .filter((route) => route.patternGroupIds.length === 1 && route.patternSpecIds.length > 0);

const UI_GROUP_BY_APPLICATION_ALIAS = new Map();
for (const aliasRow of singleFormRows.filter(
  (route) =>
    route.questionType === "application" &&
    route.patternGroupIds[0].startsWith(APPLICATION_ALIAS_PREFIX),
)) {
  const aliasId = aliasRow.patternGroupIds[0];
  const candidates = singleFormRows.filter(
    (route) =>
      route.sourceId === aliasRow.sourceId &&
      route.questionType === "numeric" &&
      !route.patternGroupIds[0].startsWith(APPLICATION_ALIAS_PREFIX) &&
      sameValues(route.patternSpecIds, aliasRow.patternSpecIds),
  );
  if (candidates.length !== 1) {
    throw new Error(
      `PGC_R08_APPLICATION_ALIAS_UI_GROUP_${candidates.length === 0 ? "MISSING" : "AMBIGUOUS"}:${aliasId}`,
    );
  }
  const uiPatternGroupId = candidates[0].patternGroupIds[0];
  const prior = UI_GROUP_BY_APPLICATION_ALIAS.get(aliasId);
  if (prior && prior !== uiPatternGroupId) {
    throw new Error(`PGC_R08_APPLICATION_ALIAS_UI_GROUP_DRIFT:${aliasId}`);
  }
  UI_GROUP_BY_APPLICATION_ALIAS.set(aliasId, uiPatternGroupId);
}

export function exactPublicPatternGroupIdsForRoute(routeId) {
  if (!EXACT_GROUPS_BY_ROUTE_ID.has(routeId)) {
    throw new Error(`PGC_R08_EXACT_PATTERN_GROUP_ROUTE_MISSING:${routeId}`);
  }
  return [...EXACT_GROUPS_BY_ROUTE_ID.get(routeId)];
}

export function uiSelectablePatternGroupIdsForRoute(routeId) {
  return uniqueSorted(
    exactPublicPatternGroupIdsForRoute(routeId).map(
      (patternGroupId) => UI_GROUP_BY_APPLICATION_ALIAS.get(patternGroupId) ?? patternGroupId,
    ),
  );
}

export function enrichBrowserRowWithExactPatternGroups(row) {
  return Object.freeze({
    ...row,
    publicPatternGroupIds: Object.freeze(exactPublicPatternGroupIdsForRoute(row.routeId)),
    uiSelectablePatternGroupIds: Object.freeze(uiSelectablePatternGroupIdsForRoute(row.routeId)),
  });
}

export function exactPatternGroupAuthoritySummary() {
  return Object.freeze({
    routeCount: EXACT_GROUPS_BY_ROUTE_ID.size,
    nonEmptyRouteCount: [...EXACT_GROUPS_BY_ROUTE_ID.values()].filter((ids) => ids.length > 0).length,
    applicationAliasGroupCount: UI_GROUP_BY_APPLICATION_ALIAS.size,
    applicationAliasRouteCount: [...EXACT_GROUPS_BY_ROUTE_ID.values()].filter((ids) =>
      ids.some((id) => UI_GROUP_BY_APPLICATION_ALIAS.has(id)),
    ).length,
  });
}
