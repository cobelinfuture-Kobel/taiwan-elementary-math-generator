import { PUBLIC_GENERATOR_CAPACITY_ROWS } from "../../site/modules/curriculum/public/public-generator-capacity-registry.js";

const C = Object.freeze({
  sourceId: 0,
  selectionMode: 1,
  selectedKnowledgePointKey: 2,
  questionType: 3,
  publicPatternGroupKey: 4,
  depthMode: 5,
  contextMode: 6,
  routeId: 10,
});

function fail(code, details = {}) {
  const error = new Error(code);
  error.details = details;
  throw error;
}

function uniqueSorted(values) {
  return [...new Set((values ?? []).map((value) => String(value ?? "").trim()).filter(Boolean))].sort();
}

function splitKey(value) {
  return uniqueSorted(String(value ?? "").split("|"));
}

function sameStrings(left, right) {
  return JSON.stringify(uniqueSorted(left)) === JSON.stringify(uniqueSorted(right));
}

export function enrichBrowserRowsWithExactPatternGroups(
  rows,
  registryRows = PUBLIC_GENERATOR_CAPACITY_ROWS,
) {
  const registryByRouteId = new Map();
  for (const registryRow of registryRows) {
    const routeId = registryRow[C.routeId];
    if (!routeId) fail("PGC_R08_EXACT_BINDING_RUNTIME_ROUTE_ID_MISSING");
    if (registryByRouteId.has(routeId)) {
      fail("PGC_R08_EXACT_BINDING_RUNTIME_ROUTE_DUPLICATE", { routeId });
    }
    registryByRouteId.set(routeId, registryRow);
  }

  return rows.map((row) => {
    const registryRow = registryByRouteId.get(row.routeId);
    if (!registryRow) {
      fail("PGC_R08_EXACT_BINDING_RUNTIME_ROUTE_MISSING", { routeId: row.routeId });
    }
    const mismatches = [];
    if (registryRow[C.sourceId] !== row.sourceId) mismatches.push("sourceId");
    if (registryRow[C.selectionMode] !== row.selectionMode) mismatches.push("selectionMode");
    if (!sameStrings(splitKey(registryRow[C.selectedKnowledgePointKey]), row.selectedKnowledgePointIds)) {
      mismatches.push("selectedKnowledgePointIds");
    }
    if (registryRow[C.questionType] !== row.questionType) mismatches.push("questionType");
    if ((registryRow[C.depthMode] ?? null) !== (row.depthMode ?? null)) mismatches.push("depthMode");
    if ((registryRow[C.contextMode] ?? null) !== (row.contextMode ?? null)) mismatches.push("contextMode");
    if (mismatches.length > 0) {
      fail("PGC_R08_EXACT_BINDING_RUNTIME_METADATA_MISMATCH", {
        routeId: row.routeId,
        mismatches,
      });
    }
    const publicPatternGroupIds = splitKey(registryRow[C.publicPatternGroupKey]);
    return {
      ...row,
      publicPatternGroupIds,
      publicPatternGroupKey: publicPatternGroupIds.join("|"),
      routeIdentityBindingMode: publicPatternGroupIds.length > 0
        ? "EXACT_PUBLIC_PATTERN_GROUP_QUERY_STATE"
        : "PUBLIC_FIELDS_ONLY",
    };
  });
}

export function buildExactPatternGroupRouteUrl(row, origin) {
  const url = new URL("/index.html", origin);
  url.searchParams.set("sourceId", row.sourceId);
  url.searchParams.set("questionCount", String(row.requestedQuestionCount ?? 20));
  url.searchParams.set("answerKey", "1");
  url.searchParams.set("generationSeed", `pgc-r08-exact-${row.routeId}`);
  if (row.selectionMode && row.selectionMode !== "sourceUnit") {
    url.searchParams.set("selectionMode", row.selectionMode);
    for (const knowledgePointId of uniqueSorted(row.selectedKnowledgePointIds)) {
      url.searchParams.append("kp", knowledgePointId);
    }
    for (const patternGroupId of uniqueSorted(row.publicPatternGroupIds)) {
      url.searchParams.append("pg", patternGroupId);
    }
  }
  if (row.questionType != null) url.searchParams.set("questionMode", row.questionType);
  if (row.depthMode != null) url.searchParams.set("depthMode", row.depthMode);
  if (row.contextMode != null) url.searchParams.set("contextMode", row.contextMode);
  return url.toString();
}

function requestedScalar(values) {
  if (typeof values === "string") return values;
  if (Array.isArray(values) && values.length === 1 && typeof values[0] === "string") {
    return values[0];
  }
  return null;
}

function wrapPageForExactRouteEntry(page, row, origin) {
  const originalGoto = page.goto.bind(page);
  const originalSelectOption = page.selectOption.bind(page);
  return new Proxy(page, {
    get(target, property, receiver) {
      if (property === "goto") {
        return async (_url, options) => originalGoto(buildExactPatternGroupRouteUrl(row, origin), options);
      }
      if (property === "selectOption") {
        return async (selector, values, options) => {
          const requestedValue = requestedScalar(values);
          if (requestedValue !== null) {
            const locator = target.locator(selector);
            await locator.waitFor({ state: "attached", timeout: options?.timeout ?? 120000 });
            const currentValue = await locator.inputValue();
            if (currentValue === requestedValue) return [currentValue];
          }
          return originalSelectOption(selector, values, options);
        };
      }
      const value = Reflect.get(target, property, receiver);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

export function wrapBrowserWithExactPatternGroupRouteEntry(browser, row, origin) {
  return new Proxy(browser, {
    get(target, property, receiver) {
      if (property === "newPage") {
        return async (...args) => wrapPageForExactRouteEntry(
          await target.newPage(...args),
          row,
          origin,
        );
      }
      const value = Reflect.get(target, property, receiver);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}
