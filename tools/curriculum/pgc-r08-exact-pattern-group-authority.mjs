import { readFile } from "node:fs/promises";
import { PUBLIC_GENERATOR_CAPACITY_ROWS } from "../../site/modules/curriculum/public/public-generator-capacity-registry.js";
import { listPublicPatternGroupChoices } from "../../site/assets/browser/state/public-pattern-group-selection.js";

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

function isSubset(subset = [], superset = []) {
  const allowed = new Set(uniqueSorted(superset));
  return uniqueSorted(subset).every((value) => allowed.has(value));
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

const ROUTE_METADATA_BY_ROUTE_ID = new Map();
for (const route of CAPACITY_CONTRACT.routes) {
  if (ROUTE_METADATA_BY_ROUTE_ID.has(route.routeId)) {
    throw new Error(`PGC_R08_EXACT_PATTERN_GROUP_CAPACITY_ROUTE_DUPLICATE:${route.routeId}`);
  }
  ROUTE_METADATA_BY_ROUTE_ID.set(route.routeId, route);
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
      isSubset(aliasRow.patternSpecIds, route.patternSpecIds),
  );
  if (candidates.length === 0) {
    throw new Error(`PGC_R08_APPLICATION_ALIAS_UI_GROUP_MISSING:${aliasId}`);
  }
  const minimumExtraPatternSpecs = Math.min(
    ...candidates.map((route) => route.patternSpecIds.length - aliasRow.patternSpecIds.length),
  );
  const nearestCandidates = candidates.filter(
    (route) =>
      route.patternSpecIds.length - aliasRow.patternSpecIds.length === minimumExtraPatternSpecs,
  );
  if (nearestCandidates.length !== 1) {
    throw new Error(`PGC_R08_APPLICATION_ALIAS_UI_GROUP_AMBIGUOUS:${aliasId}`);
  }
  const uiPatternGroupId = nearestCandidates[0].patternGroupIds[0];
  const prior = UI_GROUP_BY_APPLICATION_ALIAS.get(aliasId);
  if (prior && prior !== uiPatternGroupId) {
    throw new Error(`PGC_R08_APPLICATION_ALIAS_UI_GROUP_DRIFT:${aliasId}`);
  }
  UI_GROUP_BY_APPLICATION_ALIAS.set(aliasId, uiPatternGroupId);
}

function routeMetadata(routeId) {
  const route = ROUTE_METADATA_BY_ROUTE_ID.get(routeId);
  if (!route) {
    throw new Error(`PGC_R08_EXACT_PATTERN_GROUP_CAPACITY_ROUTE_MISSING:${routeId}`);
  }
  return route;
}

function uiProjectionForRoute(routeId) {
  const route = routeMetadata(routeId);
  const runtimeIds = exactPublicPatternGroupIdsForRoute(routeId);
  const choices = listPublicPatternGroupChoices(route.selectedKnowledgePointIds ?? []);
  const choiceById = new Map(choices.map((choice) => [choice.patternGroupId, choice]));
  const projectedIds = [];
  const omittedRuntimeIds = [];
  const baseProjectedRuntimeIds = [];

  for (const runtimeId of runtimeIds) {
    const runtimeChoice = choiceById.get(runtimeId) ?? null;
    const projectedId = runtimeChoice?.basePatternGroupId
      ?? UI_GROUP_BY_APPLICATION_ALIAS.get(runtimeId)
      ?? runtimeId;
    const projectedChoice = choiceById.get(projectedId) ?? null;
    const hasRenderedChoice = Boolean(
      runtimeChoice?.hasRepresentationChoice ?? projectedChoice?.hasRepresentationChoice,
    );

    if (!hasRenderedChoice) {
      omittedRuntimeIds.push(runtimeId);
      continue;
    }
    if (projectedId !== runtimeId) baseProjectedRuntimeIds.push(runtimeId);
    projectedIds.push(projectedId);
  }

  return Object.freeze({
    routeId,
    runtimePatternGroupIds: Object.freeze(runtimeIds),
    uiSelectablePatternGroupIds: Object.freeze(uniqueSorted(projectedIds)),
    omittedRuntimePatternGroupIds: Object.freeze(uniqueSorted(omittedRuntimeIds)),
    baseProjectedRuntimePatternGroupIds: Object.freeze(uniqueSorted(baseProjectedRuntimeIds)),
  });
}

export function exactPublicPatternGroupIdsForRoute(routeId) {
  if (!EXACT_GROUPS_BY_ROUTE_ID.has(routeId)) {
    throw new Error(`PGC_R08_EXACT_PATTERN_GROUP_ROUTE_MISSING:${routeId}`);
  }
  return [...EXACT_GROUPS_BY_ROUTE_ID.get(routeId)];
}

export function uiSelectablePatternGroupIdsForRoute(routeId) {
  return [...uiProjectionForRoute(routeId).uiSelectablePatternGroupIds];
}

export function enrichBrowserRowWithExactPatternGroups(row) {
  const projection = uiProjectionForRoute(row.routeId);
  return Object.freeze({
    ...row,
    publicPatternGroupIds: projection.runtimePatternGroupIds,
    uiSelectablePatternGroupIds: projection.uiSelectablePatternGroupIds,
    omittedRuntimePatternGroupIds: projection.omittedRuntimePatternGroupIds,
    baseProjectedRuntimePatternGroupIds: projection.baseProjectedRuntimePatternGroupIds,
  });
}

export function exactPatternGroupAuthoritySummary() {
  const projections = [...EXACT_GROUPS_BY_ROUTE_ID.keys()].map(uiProjectionForRoute);
  return Object.freeze({
    routeCount: EXACT_GROUPS_BY_ROUTE_ID.size,
    nonEmptyRouteCount: [...EXACT_GROUPS_BY_ROUTE_ID.values()].filter((ids) => ids.length > 0).length,
    applicationAliasGroupCount: UI_GROUP_BY_APPLICATION_ALIAS.size,
    applicationAliasRouteCount: [...EXACT_GROUPS_BY_ROUTE_ID.values()].filter((ids) =>
      ids.some((id) => UI_GROUP_BY_APPLICATION_ALIAS.has(id)),
    ).length,
    basePatternGroupProjectedRouteCount: projections.filter(
      (projection) => projection.baseProjectedRuntimePatternGroupIds.length > 0,
    ).length,
    singletonRuntimeGroupOmittedRouteCount: projections.filter(
      (projection) => projection.omittedRuntimePatternGroupIds.length > 0,
    ).length,
  });
}
