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
const { buildWorksheetDocumentFromPlan } = await import(
  "../../site/assets/browser/pipeline/build-worksheet-document.js"
);
const { createConfigState, getBatchAWorksheetPlan } = await import(
  "../../site/assets/browser/state/config-state.js"
);

const PLAN_PATH = path.join(
  ROOT,
  "data/curriculum/public-generation/PGC-R08-A04-A06.capacity-shortfall-plan.json",
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

const plan = JSON.parse(await readFile(PLAN_PATH, "utf8"));
const active = JSON.parse(await readFile(ACTIVE_PATH, "utf8"));

function materializedPlanTargets() {
  const routeIds = Array.isArray(plan.targetRouteIds) ? plan.targetRouteIds.filter(Boolean) : [];
  if (
    Number.isInteger(plan.targetRouteCount)
    && routeIds.length === plan.targetRouteCount
    && new Set(routeIds).size === plan.targetRouteCount
  ) {
    return {
      routeIds,
      origin: "a06_materialized_closeout_authority",
    };
  }
  return null;
}

function activeFamilyTargets() {
  const family = active.pendingFamilies.find(
    (entry) => entry.failureFamily === "CAPACITY_EVIDENCE_RECONCILIATION",
  );
  if (!family || family.activeShortfallOverlayCount !== 3 || family.overlayRows?.length !== 3) {
    throw new Error("PGC_R08_A06_ACTIVE_SHORTFALL_AUTHORITY_INVALID");
  }
  const routeIds = family.overlayRows.map((row) => row.routeId).filter(Boolean);
  if (routeIds.length !== 3 || new Set(routeIds).size !== 3) {
    throw new Error("PGC_R08_A06_ACTIVE_SHORTFALL_ROUTE_IDENTITY_INVALID");
  }
  return {
    routeIds,
    origin: "a06_active_pending_family_authority",
  };
}

const targetAuthority = materializedPlanTargets() ?? activeFamilyTargets();
const targetRouteIds = targetAuthority.routeIds;
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

function summarizePipeline(result = {}) {
  const document = result.worksheetDocument ?? null;
  const currentGeneration = result.currentRouterGeneration ?? null;
  return {
    ok: result.ok,
    errors: result.errors ?? result.validation?.errors ?? [],
    warnings: result.warnings ?? result.validation?.warnings ?? [],
    requestedPlan: result.requestedPlan ?? null,
    authoritativeConsumerCutover: result.authoritativeConsumerCutover ?? null,
    currentRouterGeneration: currentGeneration
      ? {
        ok: currentGeneration.ok,
        errors: currentGeneration.errors ?? [],
        warnings: currentGeneration.warnings ?? [],
        plan: currentGeneration.plan ?? null,
        allocation: currentGeneration.allocation ?? currentGeneration.plan?.allocation ?? [],
        questions: summarizeQuestions(currentGeneration.questions ?? []),
      }
      : null,
    admission: result.p01eApplicationAdmission ?? null,
    worksheet: document
      ? {
        questionCount: document.generatedQuestions?.length ?? document.questions?.length ?? 0,
        questions: summarizeQuestions(document.generatedQuestions ?? document.questions ?? []),
        questionDisplayModelCount: document.questionDisplayModels?.length ?? 0,
        answerKeyItemCount: document.answerKeyItems?.length ?? 0,
        metadata: document.metadata ?? null,
        configSnapshot: document.configSnapshot ?? null,
      }
      : null,
  };
}

function summarizeQueryStatePipeline(options) {
  const state = createConfigState({ queryState: options });
  const worksheetPlan = getBatchAWorksheetPlan(state);
  const result = buildWorksheetDocumentFromPlan(worksheetPlan);
  return {
    normalizedBatchAState: state.batchA,
    worksheetPlan,
    finalPipeline: summarizePipeline(result),
  };
}

const rows = [];
for (const routeId of targetRouteIds) {
  const matrixMatches = matrix.rows.filter((row) => row.routeId === routeId);
  const capacityMatches = capacity.routes.filter((row) => row.routeId === routeId);
  if (matrixMatches.length !== 1 || capacityMatches.length !== 1) {
    throw new Error(`PGC_R08_A06_ROUTE_IDENTITY_DRIFT:${routeId}`);
  }
  const matrixRow = matrixMatches[0];
  const capacityRoute = capacityMatches[0];
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
    columns: 3,
    rowsPerPage: 5,
  };
  const seedCases = [
    { label: "a06_a", generationSeed: `pgc-r08-a06-${routeId}-seed-a` },
    { label: "a06_b", generationSeed: `pgc-r08-a06-${routeId}-seed-b` },
    { label: "exact_browser", generationSeed: `pgc-r08-a04-a04-${matrixRow.routeIndex}` },
  ];
  const generations = [];
  for (const seedCase of seedCases) {
    const options = { ...baseOptions, generationSeed: seedCase.generationSeed };
    const result = generateBatchABrowserQuestions(options);
    const pipeline = buildWorksheetDocumentFromPlan(options);
    generations.push({
      label: seedCase.label,
      options,
      ok: result.ok,
      errors: result.errors ?? [],
      warnings: result.warnings ?? [],
      allocation: result.allocation ?? result.plan?.allocation ?? [],
      plan: result.plan ?? null,
      questions: summarizeQuestions(result.questions ?? []),
      finalPipeline: summarizePipeline(pipeline),
      queryStatePipeline: summarizeQueryStatePipeline(options),
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
  programId: plan.programId ?? active.programId,
  taskId: plan.taskId ?? "PGC-R08-A04-A06_CapacityShortfallFocusedReproductionAnd3RouteRepair",
  status: "PASS_DIAGNOSTIC_MATERIALIZED",
  targetAuthorityOrigin: targetAuthority.origin,
  targetRouteCount: rows.length,
  targetRouteIds,
  historicalReconciliationRouteCount: active.reconciliation?.capacityReconciliationRouteCount ?? null,
  activeShortfallOverlayCount: plan.targetRouteCount,
  rows,
};

await mkdir(OUTPUT_DIR, { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  status: report.status,
  targetAuthorityOrigin: report.targetAuthorityOrigin,
  targetRouteCount: report.targetRouteCount,
  routes: rows.map((row) => ({
    routeId: row.routeId,
    verifiedMaxQuestionCount: row.capacityRoute.verifiedMaxQuestionCount,
    capacityStatus: row.capacityRoute.capacityStatus,
    uiSelectablePatternGroupIds: row.exactPatternGroups.uiSelectablePatternGroupIds,
    generationLabels: row.generations.map((entry) => entry.label),
    generatedCounts: row.generations.map((entry) => entry.questions.count),
    directOk: row.generations.map((entry) => entry.ok),
    pipelineOk: row.generations.map((entry) => entry.finalPipeline.ok),
    pipelineCounts: row.generations.map((entry) => entry.finalPipeline.worksheet?.questionCount ?? 0),
    queryStateSelectionModes: row.generations.map((entry) => entry.queryStatePipeline.worksheetPlan.selectionMode),
    queryStateKnowledgePointCounts: row.generations.map((entry) => entry.queryStatePipeline.worksheetPlan.selectedKnowledgePointIds?.length ?? 0),
    queryStatePatternGroupCounts: row.generations.map((entry) => entry.queryStatePipeline.worksheetPlan.selectedPatternGroupIds?.length ?? 0),
    queryStatePipelineCounts: row.generations.map((entry) => entry.queryStatePipeline.finalPipeline.worksheet?.questionCount ?? 0),
  })),
  output: path.relative(ROOT, OUTPUT_PATH),
}, null, 2));
