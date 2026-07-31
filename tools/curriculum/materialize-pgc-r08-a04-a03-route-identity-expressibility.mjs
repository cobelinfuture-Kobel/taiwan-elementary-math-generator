import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PUBLIC_GENERATOR_CAPACITY_ROWS } from "../../site/modules/curriculum/public/public-generator-capacity-registry.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CAPACITY_PATH = path.join(ROOT, "data/curriculum/public-generation/generator_capacity_contract.json");
const ACTIVE_STATE_PATH = path.join(ROOT, "data/curriculum/public-generation/PGC-R08-A04.active-repair-state.json");
const OUTPUT_DIR = path.join(ROOT, "tmp/pgc-r08-a04-a03-a00-route-identity-expressibility");
const REPORT_PATH = path.join(OUTPUT_DIR, "route-identity-expressibility-report.json");

const C = Object.freeze({
  sourceId: 0,
  selectionMode: 1,
  selectedKnowledgePointKey: 2,
  questionType: 3,
  publicPatternGroupKey: 4,
  depthMode: 5,
  contextMode: 6,
  verifiedMaxQuestionCount: 7,
  legalStatus: 8,
  qualityStatus: 9,
  routeId: 10,
});

function fail(code, details = {}) {
  const error = new Error(code);
  error.details = details;
  throw error;
}

function uniqueSorted(values) {
  return [...new Set((values ?? []).filter(Boolean).map(String))].sort();
}

function splitKey(value) {
  return String(value ?? "").split("|").map((item) => item.trim()).filter(Boolean).sort();
}

function key(values) {
  return uniqueSorted(values).join("|");
}

function hash(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function publicProjection(row, includePatternGroups) {
  const values = [
    row.sourceId,
    row.selectionMode,
    key(row.selectedKnowledgePointIds),
    row.questionType,
    row.depthMode ?? "",
    row.contextMode ?? "",
  ];
  if (includePatternGroups) values.push(key(row.publicPatternGroupIds));
  return JSON.stringify(values);
}

function groupRows(rows, selector) {
  const grouped = new Map();
  for (const row of rows) {
    const groupKey = selector(row);
    const group = grouped.get(groupKey) ?? [];
    group.push(row);
    grouped.set(groupKey, group);
  }
  return grouped;
}

const capacityRaw = await readFile(CAPACITY_PATH, "utf8");
const capacity = JSON.parse(capacityRaw);
const activeState = JSON.parse(await readFile(ACTIVE_STATE_PATH, "utf8"));
const bindingFamily = activeState.pendingFamilies.find((family) => family.failureFamily === "ROUTE_BINDING_NOT_CONVERGED");
if (!bindingFamily) fail("PGC_R08_A04_A03_A00_BINDING_FAMILY_MISSING");
const queue = JSON.parse(await readFile(path.join(ROOT, bindingFamily.sourceQueuePath), "utf8"));
const queueColumns = Object.fromEntries(queue.rowColumns.map((column, index) => [column, index]));
const failedRouteIds = queue.rows.map((row) => row[queueColumns.routeId]);

const legalRoutes = capacity.routes
  .filter((route) => route.legalRoute === true)
  .sort((left, right) => left.routeId.localeCompare(right.routeId));
if (legalRoutes.length !== 793) fail("PGC_R08_A04_A03_A00_LEGAL_ROUTE_COUNT_DRIFT", { actual: legalRoutes.length });
if (failedRouteIds.length !== 136) fail("PGC_R08_A04_A03_A00_FAILED_ROUTE_COUNT_DRIFT", { actual: failedRouteIds.length });

const registryByRouteId = new Map();
for (const registryRow of PUBLIC_GENERATOR_CAPACITY_ROWS) {
  const routeId = registryRow[C.routeId];
  if (registryByRouteId.has(routeId)) fail("PGC_R08_A04_A03_A00_RUNTIME_ROUTE_DUPLICATE", { routeId });
  registryByRouteId.set(routeId, registryRow);
}

const enriched = legalRoutes.map((route) => {
  const registryRow = registryByRouteId.get(route.routeId);
  if (!registryRow) fail("PGC_R08_A04_A03_A00_RUNTIME_ROUTE_MISSING", { routeId: route.routeId });
  const publicPatternGroupIds = splitKey(registryRow[C.publicPatternGroupKey]);
  const selectedKnowledgePointIds = uniqueSorted(route.selectedKnowledgePointIds);
  const metadataMismatches = [];
  if (registryRow[C.sourceId] !== route.sourceId) metadataMismatches.push("sourceId");
  if (registryRow[C.selectionMode] !== route.selectionMode) metadataMismatches.push("selectionMode");
  if (registryRow[C.selectedKnowledgePointKey] !== key(selectedKnowledgePointIds)) metadataMismatches.push("selectedKnowledgePointIds");
  if (registryRow[C.questionType] !== route.questionType) metadataMismatches.push("questionType");
  if (String(registryRow[C.depthMode] ?? "") !== String(route.depthMode ?? "")) metadataMismatches.push("depthMode");
  if (String(registryRow[C.contextMode] ?? "") !== String(route.contextMode ?? "")) metadataMismatches.push("contextMode");
  if (registryRow[C.legalStatus] !== "LEGAL") metadataMismatches.push("legalStatus");
  const capacityPublicPatternGroupIds = uniqueSorted(route.publicPatternGroupIds);
  const capacityGenerationPatternGroupIds = uniqueSorted(route.generationPatternGroupIds);
  return {
    routeId: route.routeId,
    sourceId: route.sourceId,
    selectionMode: route.selectionMode,
    selectedKnowledgePointIds,
    questionType: route.questionType,
    depthMode: route.depthMode ?? null,
    contextMode: route.contextMode ?? null,
    publicPatternGroupIds,
    capacityPublicPatternGroupIds,
    capacityGenerationPatternGroupIds,
    publicPatternGroupAuthorityStatus: publicPatternGroupIds.length > 0 ? "EXPLICIT" : "EMPTY_BY_ROUTE_CONTRACT",
    capacityPublicPatternGroupAgreement: JSON.stringify(publicPatternGroupIds) === JSON.stringify(capacityPublicPatternGroupIds),
    metadataMismatches,
  };
});

const metadataMismatchRows = enriched.filter((row) => row.metadataMismatches.length > 0);
if (metadataMismatchRows.length > 0) fail("PGC_R08_A04_A03_A00_RUNTIME_METADATA_MISMATCH", { count: metadataMismatchRows.length, rows: metadataMismatchRows.slice(0, 10) });

const noPatternGroups = groupRows(enriched, (row) => publicProjection(row, false));
const withPatternGroups = groupRows(enriched, (row) => publicProjection(row, true));
const enrichedByRouteId = new Map(enriched.map((row) => [row.routeId, row]));
const failedRows = failedRouteIds.map((routeId) => {
  const row = enrichedByRouteId.get(routeId);
  if (!row) fail("PGC_R08_A04_A03_A00_FAILED_ROUTE_NOT_LEGAL", { routeId });
  const publicFieldClass = noPatternGroups.get(publicProjection(row, false)) ?? [];
  const exactSelectionClass = withPatternGroups.get(publicProjection(row, true)) ?? [];
  const repairClassification = exactSelectionClass.length === 1
    ? "EXACT_PUBLIC_PATTERN_GROUP_SELECTION_REQUIRED"
    : "PUBLIC_EQUIVALENCE_CLASS_REQUIRED";
  return {
    ...row,
    publicFieldClassSize: publicFieldClass.length,
    exactSelectionClassSize: exactSelectionClass.length,
    publicFieldEquivalentRouteIds: publicFieldClass.map((candidate) => candidate.routeId),
    exactSelectionEquivalentRouteIds: exactSelectionClass.map((candidate) => candidate.routeId),
    repairClassification,
  };
});

const report = {
  schemaName: "PGCR08A04A03RouteIdentityExpressibilityReportV1",
  schemaVersion: 1,
  programId: "PUBLIC_KP_GENERATION_CONFORMANCE_V1",
  taskId: "PGC-R08-A04-A03-A00_RouteIdentityExpressibilityAuthorityFreeze",
  status: "PASS_ROUTE_IDENTITY_EXPRESSIBILITY_CLASSIFIED",
  sourceAuthority: {
    capacityPath: "data/curriculum/public-generation/generator_capacity_contract.json",
    capacitySha256: createHash("sha256").update(capacityRaw).digest("hex"),
    runtimeRegistryPath: "site/modules/curriculum/public/public-generator-capacity-registry.js",
    activeRepairStatePath: "data/curriculum/public-generation/PGC-R08-A04.active-repair-state.json",
    routeBindingQueuePath: bindingFamily.sourceQueuePath,
  },
  summary: {
    legalRouteCount: enriched.length,
    runtimeRegistryRouteMatchCount: enriched.filter((row) => registryByRouteId.has(row.routeId)).length,
    runtimeMetadataMismatchCount: metadataMismatchRows.length,
    capacityPublicPatternGroupDimensionPresentCount: enriched.filter((row) => row.capacityPublicPatternGroupIds.length > 0).length,
    capacityGenerationPatternGroupDimensionPresentCount: enriched.filter((row) => row.capacityGenerationPatternGroupIds.length > 0).length,
    runtimePublicPatternGroupAgreementCount: enriched.filter((row) => row.capacityPublicPatternGroupAgreement).length,
    publicFieldProjectionClassCount: noPatternGroups.size,
    exactPatternGroupProjectionClassCount: withPatternGroups.size,
    failedRouteCount: failedRows.length,
    failedPublicFieldAmbiguousRouteCount: failedRows.filter((row) => row.publicFieldClassSize > 1).length,
    failedPublicFieldUniqueRouteCount: failedRows.filter((row) => row.publicFieldClassSize === 1).length,
    failedExactPatternGroupSelectableRouteCount: failedRows.filter((row) => row.exactSelectionClassSize === 1).length,
    failedPublicEquivalenceClassRouteCount: failedRows.filter((row) => row.exactSelectionClassSize > 1).length,
    failedRoutesDisambiguatedByPatternGroupsCount: failedRows.filter((row) => row.publicFieldClassSize > 1 && row.exactSelectionClassSize === 1).length,
  },
  policyDecision: {
    r08A01MatrixRouteIdentityComplete: false,
    reason: "R08 A01 stripped the public PatternGroup dimension from browser rows",
    exactPatternGroupSelectionRepairAllowed: true,
    publicEquivalenceAcceptanceRequired: failedRows.some((row) => row.exactSelectionClassSize > 1),
    productMutationAuthorized: false,
    perRoutePatchAuthorized: false,
  },
  failedRoutes: failedRows,
  hashes: {
    legalRouteIdsSha256: hash(enriched.map((row) => row.routeId)),
    failedRouteIdsSha256: hash(failedRows.map((row) => row.routeId)),
    failedRouteExpressibilitySha256: hash(failedRows.map((row) => ({
      routeId: row.routeId,
      publicPatternGroupIds: row.publicPatternGroupIds,
      publicFieldClassSize: row.publicFieldClassSize,
      exactSelectionClassSize: row.exactSelectionClassSize,
      repairClassification: row.repairClassification,
    }))),
  },
};

await mkdir(OUTPUT_DIR, { recursive: true });
await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ status: report.status, summary: report.summary, policyDecision: report.policyDecision }, null, 2));
