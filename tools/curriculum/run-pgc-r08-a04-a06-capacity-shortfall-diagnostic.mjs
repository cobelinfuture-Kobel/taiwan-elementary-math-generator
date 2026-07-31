import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
globalThis.document = Object.freeze({ getElementById() { return null; } });

const { materializeMatrix } = await import("./build-pgc-r08-a01-legal-route-browser-matrix.mjs");
const { enrichBrowserRowWithExactPatternGroups } = await import("./pgc-r08-exact-pattern-group-authority.mjs");
const { generateBatchABrowserQuestions } = await import(
  "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js"
);

const ACTIVE_PATH = path.join(
  ROOT,
  "data/curriculum/public-generation/PGC-R08-A04.active-repair-state.json",
);
const CAPACITY_PATH = path.join(
  ROOT,
  "data/curriculum/public-generation/generator_capacity_contract.json",
);
const A00_PATH = path.join(
  ROOT,
  "data/curriculum/public-generation/PGC-R08-A00.public-generate-button-e2e-scope.json",
);
const OUTPUT_DIR = path.join(ROOT, "tmp/pgc-r08-a04-a06-capacity-shortfall");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "diagnostic.json");

const active = JSON.parse(await readFile(ACTIVE_PATH, "utf8"));
const family = active.pendingFamilies.find(
  (entry) => entry.failureFamily === "CAPACITY_EVIDENCE_RECONCILIATION",
);
if (!family || family.activeShortfallOverlayCount !== 3) {
  throw new Error("PGC_R08_A06_ACTIVE_SHORTFALL_AUTHORITY_INVALID");
}
const targetRouteIds = family.overlayRows.map((row) => row.routeId);
const capacityRaw = await readFile(CAPACITY_PATH, "utf8");
const capacity = JSON.parse(capacityRaw);
const a00 = JSON.parse(await readFile(A00_PATH, "utf8"));
const matrix = materializeMatrix(capacity, a00, capacityRaw);

function summarizeQuestions(questions = []) {
  return {
    count: questions.length,
    distinctQuestionIdCount: new Set(questions.map((question) => question.id)).size,
    distinctPromptCount: new Set(questions.map((question) => question.promptText)).size,
    patternSpecCounts: Object.fromEntries(
      [...questions.reduce((map, question) => {
        const id = question.patternSpecId ?? question.metadata?.patternId ?? "UNKNOWN";
        map.set(id, (map.get(id) ?? 0) + 1);
        return map;
      }, new Map()).entries()].sort(([left], [right]) => left.localeCompare(right)),
    ),
    resolvedPatternGroupCounts: Object.fromEntries(
      [...questions.reduce((map, question) => {
        const id = question.resolvedPatternGroupId
          ?? question.patternGroupId
          ?? question.metadata?.resolvedPatternGroupId
          ?? "UNKNOWN";
        map.set(id, (map.get(id) ?? 0) + 1);
        return map;
      }, new Map()).entries()].sort(([left], [right]) => left.localeCompare(right)),
    ),
    sample: questions.slice(0, 5).map((question) => ({
      id: question.id,
      patternSpecId: question.patternSpecId ?? question.metadata?.patternId ?? null,
      resolvedPatternGroupId: question.resolvedPatternGroupId
        ?? question.patternGroupId
        ?? question.metadata?.resolvedPatternGroupId
        ?? null,
      promptText: question.promptText ?? null,
      answerText: question.answerText ?? null,
    })),
  };
}

const rows = [];
for (const routeId of targetRouteIds) {
  const matrixRow = matrix.rows.find((row) => row.routeId === routeId);
  const capacityRoute = capacity.routes.find((row) => row.routeId === routeId);
  if (!matrixRow || !capacityRoute) {
    throw new Error(`PGC_R08_A06_ROUTE_NOT_FOUND:${routeId}`);
  }
  const exact = enrichBrowserRowWithExactPatternGroups(matrixRow);
  const baseOptions = {
    sourceId: exact.sourceId,
    questionMode: exact.questionType,
    selectionMode: exact.selectionMode,
    selectedKnowledgePointIds: exact.selectedKnowledgePointIds,
    selectedPatternGroupIds: exact.uiSelectablePatternGroupIds,
    questionCount: 20,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    depthMode: exact.depthMode,
    contextMode: exact.contextMode,
  };
  const generations = [];
  for (const suffix of ["a", "b"]) {
    const options = {
      ...baseOptions,
      generationSeed: `pgc-r08-a06-${routeId}-seed-${suffix}`,
    };
    const result = generateBatchABrowserQuestions(options);
    generations.push({
      suffix,
      options,
      ok: result.ok,
      errors: result.errors ?? [],
      warnings: result.warnings ?? [],
      allocation: result.allocation ?? result.plan?.allocation ?? [],
      plan: result.plan ?? null,
      questions: summarizeQuestions(result.questions ?? []),
    });
  }
  rows.push({
    routeId,
    matrixRow,
    capacityRoute,
    exactPatternGroups: {
      publicPatternGroupIds: exact.publicPatternGroupIds,
      uiSelectablePatternGroupIds: exact.uiSelectablePatternGroupIds,
      omittedRuntimePatternGroupIds: exact.omittedRuntimePatternGroupIds,
      baseProjectedRuntimePatternGroupIds: exact.baseProjectedRuntimePatternGroupIds,
    },
    generations,
  });
}

const report = {
  schemaName: "PGCR08A04A06CapacityShortfallDiagnosticV1",
  schemaVersion: 1,
  programId: active.programId,
  taskId: "PGC-R08-A04-A06_CapacityShortfallFocusedReproductionAnd3RouteRepair",
  status: "PASS_DIAGNOSTIC_MATERIALIZED",
  targetRouteCount: rows.length,
  targetRouteIds,
  historicalReconciliationRouteCount: family.historicalReconciliationRouteCount,
  activeShortfallOverlayCount: family.activeShortfallOverlayCount,
  rows,
};

await mkdir(OUTPUT_DIR, { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  status: report.status,
  targetRouteCount: report.targetRouteCount,
  routes: rows.map((row) => ({
    routeId: row.routeId,
    verifiedMaxQuestionCount: row.capacityRoute.verifiedMaxQuestionCount,
    capacityStatus: row.capacityRoute.capacityStatus,
    uiSelectablePatternGroupIds: row.exactPatternGroups.uiSelectablePatternGroupIds,
    generatedCounts: row.generations.map((entry) => entry.questions.count),
    ok: row.generations.map((entry) => entry.ok),
  })),
  output: path.relative(ROOT, OUTPUT_PATH),
}, null, 2));
