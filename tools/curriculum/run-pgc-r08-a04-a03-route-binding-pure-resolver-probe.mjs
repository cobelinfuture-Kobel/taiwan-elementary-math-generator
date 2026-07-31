import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { materializeMatrix } from "./build-pgc-r08-a01-legal-route-browser-matrix.mjs";
import {
  PUBLIC_UI_SURFACES,
  resolvePublicUiCapabilityBinding,
} from "../../site/modules/curriculum/public/public-ui-capability-binding.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const FOCUSED_PLAN_PATH = path.join(ROOT, "data/curriculum/public-generation/PGC-R08-A04-A03.route-binding-focused-reproduction-plan.json");
const CAPACITY_PATH = path.join(ROOT, "data/curriculum/public-generation/generator_capacity_contract.json");
const SCOPE_PATH = path.join(ROOT, "data/curriculum/public-generation/PGC-R08-A00.public-generate-button-e2e-scope.json");
const OUT = path.join(ROOT, "tmp/pgc-r08-a04-a03-route-binding-pure-resolver-probe");

function fail(code, details = {}) {
  const error = new Error(code);
  error.details = details;
  throw error;
}

function authorityPatternGroupIds(route) {
  if (Array.isArray(route.publicPatternGroupIds) && route.publicPatternGroupIds.length > 0) {
    return [...new Set(route.publicPatternGroupIds.map(String).filter(Boolean))].sort();
  }
  const key = String(route.publicPatternGroupKey ?? route.patternGroupKey ?? "");
  const ids = key.split("|").map((value) => value.trim()).filter(Boolean);
  if (ids.length === 0) fail("PGC_R08_A04_A03_PURE_PATTERN_GROUP_AUTHORITY_MISSING", { routeId: route.routeId });
  return [...new Set(ids)].sort();
}

const focusedPlan = JSON.parse(await readFile(FOCUSED_PLAN_PATH, "utf8"));
const capacityRaw = await readFile(CAPACITY_PATH, "utf8");
const capacity = JSON.parse(capacityRaw);
const scope = JSON.parse(await readFile(SCOPE_PATH, "utf8"));
const matrix = materializeMatrix(capacity, scope, capacityRaw);
const matrixById = new Map(matrix.rows.map((row) => [row.routeId, row]));
const capacityById = new Map(capacity.routes.map((row) => [row.routeId, row]));

const results = focusedPlan.canaries.map((canary) => {
  const row = matrixById.get(canary.routeId);
  const route = capacityById.get(canary.routeId);
  if (!row || !route || row.routeIndex !== canary.routeIndex) {
    fail("PGC_R08_A04_A03_PURE_CANARY_AUTHORITY_DRIFT", { canary, matrixIndex: row?.routeIndex ?? null });
  }
  const authorityIds = authorityPatternGroupIds(route);
  const binding = resolvePublicUiCapabilityBinding({
    sourceId: row.sourceId,
    surfaceId: PUBLIC_UI_SURFACES.CLASSIC,
    selectionMode: row.selectionMode,
    selectedKnowledgePointIds: row.selectedKnowledgePointIds,
    selectedPatternGroupIds: authorityIds,
    requestedQuestionType: row.questionType,
    requestedDepthMode: row.depthMode,
    requestedContextMode: row.contextMode,
  });
  const missingCompatibleAuthorityIds = authorityIds.filter((id) => !binding.compatiblePatternGroupIds.includes(id));
  const classificationCode = binding.capacityRouteIds.includes(row.routeId)
    ? "PURE_RESOLVER_BINDS_TARGET"
    : missingCompatibleAuthorityIds.length > 0
      ? "PURE_RESOLVER_AUTHORITY_GROUP_INCOMPATIBLE"
      : "PURE_RESOLVER_TARGET_ROUTE_NOT_PROJECTED";
  return {
    ...canary,
    sourceId: row.sourceId,
    selectionMode: row.selectionMode,
    selectedKnowledgePointIds: row.selectedKnowledgePointIds,
    requestedQuestionType: row.questionType,
    requestedDepthMode: row.depthMode,
    requestedContextMode: row.contextMode,
    authorityPatternGroupIds: authorityIds,
    classificationCode,
    binding: {
      questionType: binding.questionType,
      availableQuestionTypeValues: binding.availableQuestionTypeOptions.map((option) => option.value),
      compatiblePatternGroupIds: [...binding.compatiblePatternGroupIds],
      selectedCompatiblePatternGroupIds: [...binding.selectedCompatiblePatternGroupIds],
      depthMode: binding.depthMode,
      depthValues: binding.depthOptions.map((option) => option.value),
      contextMode: binding.contextMode,
      contextValues: binding.contextOptions.map((option) => option.value),
      capacityRouteIds: [...binding.capacityRouteIds],
      capacityStatus: binding.capacityStatus,
      blocked: binding.blocked,
      blockedReasons: [...binding.blockedReasons],
    },
    missingCompatibleAuthorityIds,
  };
});

const classificationCodes = [
  "PURE_RESOLVER_BINDS_TARGET",
  "PURE_RESOLVER_AUTHORITY_GROUP_INCOMPATIBLE",
  "PURE_RESOLVER_TARGET_ROUTE_NOT_PROJECTED",
];
const classificationCounts = Object.fromEntries(classificationCodes.map((code) => [
  code,
  results.filter((row) => row.classificationCode === code).length,
]));
const report = {
  schemaName: "PGCR08A04A03RouteBindingPureResolverProbeReportV1",
  schemaVersion: 1,
  programId: focusedPlan.programId,
  taskId: focusedPlan.taskId,
  status: results.length === focusedPlan.acceptance.canaryCount
    ? "PASS_FOUR_PURE_RESOLVER_CANARIES_CLASSIFIED"
    : "FAIL_PURE_RESOLVER_PROBE",
  summary: {
    canaryCount: results.length,
    terminalCanaryCount: results.length,
    ...classificationCounts,
    productMutationCount: 0,
    browserInteractionCount: 0,
    generationInvoked: false,
  },
  results,
};
await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
await writeFile(path.join(OUT, "report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ status: report.status, summary: report.summary }, null, 2));
