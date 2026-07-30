import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { resolvePublicUiCapabilityBinding } from "../../site/modules/curriculum/public/public-ui-capability-binding.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PROGRAM_ID = "PUBLIC_KP_GENERATION_CONFORMANCE_V1";
const TASK_ID = "PGC-R06-A07_FinalReconciliationGlobalLiveGateAndD0Closeout";
const A06_TASK_ID = "PGC-R06-A06_5ResidualPBLFixtureDiversityFullFix";
const QUESTION_COUNT = 20;
const R06_TYPES = new Set(["reasoning", "mixed", "pbl"]);

const paths = Object.freeze({
  capacity: "data/curriculum/public-generation/generator_capacity_contract.json",
  ui: "data/curriculum/public-generation/ui_capability_binding_contract.json",
  inventory: "data/curriculum/public-generation/PGC-R06.reasoning-mixed-pbl-inventory.json",
  registry: "site/modules/curriculum/public/public-generator-capacity-registry.js",
  closeout: "data/curriculum/public-generation/PGC-R06-A07.final-global-live-closeout.json",
  readback: "docs/curriculum/output/PGC-R06-A07_FinalReconciliationGlobalLiveGateAndD0Closeout.md",
  marker: "docs/curriculum/output/PGC-R06_D0_CLOSEOUT_PASS.marker",
});

const absolute = (relativePath) => path.join(repoRoot, relativePath);
const readJson = (relativePath) => JSON.parse(fs.readFileSync(absolute(relativePath), "utf8"));
const writeJson = (relativePath, value) => fs.writeFileSync(absolute(relativePath), `${JSON.stringify(value, null, 2)}\n`);
const unique = (values = []) => [...new Set(values.filter((value) => value !== null && value !== undefined && value !== ""))];
const digest = (value) => crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");

function gaps(route = {}) {
  return Array.isArray(route.downstreamGapCodes) ? [...route.downstreamGapCodes] : [];
}

function planFor(route, generationSeed) {
  return {
    sourceId: route.sourceId,
    questionCount: QUESTION_COUNT,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed,
    selectionMode: route.selectionMode,
    selectedKnowledgePointIds: [...(route.selectedKnowledgePointIds ?? [])],
    selectedPatternGroupIds: [...(route.publicPatternGroupIds ?? [])],
    questionMode: route.questionType,
    depthMode: route.depthMode ?? "mixed",
    contextMode: route.contextMode ?? "mixed",
    printLayout: {
      paperSize: "A4",
      columns: route.questionType === "pbl" ? 1 : 2,
      rowsPerPage: route.questionType === "pbl" ? 1 : 10,
      showAnswerKeyPage: true,
      showQuestionNumbers: true,
    },
  };
}

function runRoute(route, generationSeed) {
  const result = buildWorksheetDocumentFromPlan(planFor(route, generationSeed));
  const document = result?.worksheetDocument;
  const questions = document?.questions ?? document?.generatedQuestions ?? [];
  const prompts = questions.map((question) => String(question.prompt ?? question.promptText ?? question.blankedDisplayText ?? "").trim());
  return {
    seed: generationSeed,
    ok: result?.ok === true,
    errorCodes: unique((result?.errors ?? []).map((error) => error?.code ?? String(error))),
    questionCount: document?.questionCount ?? questions.length,
    answerKeyItemCount: document?.answerKeyItems?.length ?? 0,
    missingPromptCount: prompts.filter((prompt) => !prompt).length,
    duplicatePromptCount: prompts.length - new Set(prompts).size,
    uniquePromptCount: new Set(prompts).size,
    itemSetSignature: digest([...prompts].sort()),
    orderedWorksheetSignature: digest(prompts),
  };
}

function resolveRouteBinding(route) {
  const binding = resolvePublicUiCapabilityBinding({
    sourceId: route.sourceId,
    selectionMode: route.selectionMode,
    selectedKnowledgePointIds: route.selectedKnowledgePointIds ?? [],
    selectedPatternGroupIds: route.publicPatternGroupIds ?? [],
    requestedQuestionType: route.questionType,
    requestedDepthMode: route.depthMode ?? null,
    requestedContextMode: route.contextMode ?? null,
    surfaceId: "CLASSIC",
  });
  return {
    blocked: binding.blocked,
    blockedReasons: [...(binding.blockedReasons ?? [])],
    resolvedQuestionType: binding.questionType,
    questionCountMax: binding.questionCount?.max ?? null,
    capacityRouteMatched: (binding.capacityRouteIds ?? []).includes(route.routeId),
    capacityTaskId: binding.capacityReconciliation?.taskId ?? null,
  };
}

function diagnoseRoute(route) {
  const seedA = `pgc-r06-a07:${route.routeId}:A`;
  const seedB = `pgc-r06-a07:${route.routeId}:B`;
  const first = runRoute(route, seedA);
  const replay = runRoute(route, seedA);
  const second = runRoute(route, seedB);
  const binding = resolveRouteBinding(route);
  const accepted = [first, replay, second].every((run) => run.ok
      && run.questionCount === QUESTION_COUNT
      && run.answerKeyItemCount === QUESTION_COUNT
      && run.missingPromptCount === 0
      && run.duplicatePromptCount === 0
      && run.uniquePromptCount === QUESTION_COUNT)
    && replay.orderedWorksheetSignature === first.orderedWorksheetSignature
    && second.itemSetSignature !== first.itemSetSignature
    && binding.blocked === false
    && binding.questionCountMax === 240
    && binding.capacityRouteMatched === true
    && binding.capacityTaskId === A06_TASK_ID;
  return {
    routeId: route.routeId,
    caseId: route.caseId,
    sourceId: route.sourceId,
    selectionMode: route.selectionMode,
    questionType: route.questionType,
    depthMode: route.depthMode ?? null,
    contextMode: route.contextMode ?? null,
    accepted,
    first,
    replay,
    second,
    binding,
  };
}

function assertPreconditions(capacity, ui, inventory) {
  if (capacity.programId !== PROGRAM_ID || inventory.programId !== PROGRAM_ID || ui.programId !== PROGRAM_ID) {
    throw new Error("PGC_R06_A07_PROGRAM_ID_MISMATCH");
  }
  if (capacity.lastR06A06Reconciliation?.taskId !== A06_TASK_ID) {
    throw new Error("PGC_R06_A07_A06_CAPACITY_AUTHORITY_MISSING");
  }
  if (inventory.lastR06A06Reconciliation?.taskId !== A06_TASK_ID) {
    throw new Error("PGC_R06_A07_A06_INVENTORY_AUTHORITY_MISSING");
  }
  if (ui.lastR06A06Reconciliation?.taskId !== A06_TASK_ID) {
    throw new Error("PGC_R06_A07_A06_UI_AUTHORITY_MISSING");
  }
  if (inventory.summary.r06RouteCount !== 659
    || inventory.summary.legalR06RouteCount !== 389
    || inventory.summary.illegalR06RouteCount !== 270
    || inventory.summary.conformantRouteCount !== 389
    || inventory.summary.repairQueueCount !== 0
    || inventory.repairQueue.length !== 0
    || inventory.summary.zeroCapacityRouteCount !== 0
    || inventory.summary.limitedCapacityRouteCount !== 0
    || inventory.summary.diversityGapRouteCount !== 0) {
    throw new Error(`PGC_R06_A07_INVENTORY_PRECONDITION_FAILED:${JSON.stringify(inventory.summary)}`);
  }
  if (capacity.routes.length !== 1155 || capacity.runtimeRegistry?.rowCount !== 1155) {
    throw new Error("PGC_R06_A07_CAPACITY_ROUTE_COUNT_MISMATCH");
  }
  if (capacity.routes.some((route) => Object.hasOwn(route, "gapCodes"))) {
    throw new Error("PGC_R06_A07_PARALLEL_GAP_FIELD_PRESENT");
  }
  if (ui.safeQuestionCount?.max !== 240 || ui.summary?.unverifiedCapacityExposureCount !== 0) {
    throw new Error("PGC_R06_A07_UI_PRECONDITION_FAILED");
  }
}

function reconcileRegistry(capacity) {
  const rows = capacity.routes.map((route) => [
    route.sourceId,
    route.selectionMode,
    route.selectionMode === "sourceUnit" ? "" : unique(route.selectedKnowledgePointIds ?? []).sort().join("|"),
    route.questionType,
    unique(route.publicPatternGroupIds ?? []).sort().join("|"),
    route.depthMode ?? "",
    route.contextMode ?? "",
    Number(route.verifiedMaxQuestionCount ?? 0),
    route.legalRoute === true ? "LEGAL" : "ILLEGAL",
    route.qualityStatus ?? "UNKNOWN",
    route.routeId,
  ]);
  const metadata = {
    programId: PROGRAM_ID,
    taskId: TASK_ID,
    routeCount: capacity.routes.length,
    r06RouteCount: 659,
    legalR06RouteCount: 389,
    illegalR06RouteCount: 270,
    livePassRouteCount: 389,
    repairQueueCount: 0,
    status: "PASS_R06_A07_GLOBAL_LIVE_RUNTIME_RECONCILED_AND_D0_CLOSED",
  };
  fs.writeFileSync(absolute(paths.registry), `export const PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS = "MATERIALIZED_PGC_R03_V3";\nexport const PUBLIC_GENERATOR_CAPACITY_RECONCILIATION = Object.freeze(${JSON.stringify(metadata)});\nexport const PUBLIC_GENERATOR_CAPACITY_ROWS = Object.freeze(${JSON.stringify(rows)});\n`);
  return rows.length;
}

const capacity = readJson(paths.capacity);
const ui = readJson(paths.ui);
const inventory = readJson(paths.inventory);
assertPreconditions(capacity, ui, inventory);

const inventoryRouteIds = new Set(inventory.routes.map((route) => route.routeId));
const r06Routes = capacity.routes.filter((route) => inventoryRouteIds.has(route.routeId));
const legalRoutes = r06Routes.filter((route) => route.legalRoute === true);
const illegalRoutes = r06Routes.filter((route) => route.legalRoute !== true);

if (r06Routes.length !== 659 || legalRoutes.length !== 389 || illegalRoutes.length !== 270) {
  throw new Error(`PGC_R06_A07_ROUTE_RECONCILIATION_MISMATCH:${JSON.stringify({ all: r06Routes.length, legal: legalRoutes.length, illegal: illegalRoutes.length })}`);
}
if (legalRoutes.some((route) => !R06_TYPES.has(route.questionType)
    || route.verifiedMaxQuestionCount !== QUESTION_COUNT
    || route.capacityStatus !== "VERIFIED_20"
    || route.qualityStatus !== "DIVERSE_PARAMETER_GENERATOR"
    || gaps(route).length !== 0)) {
  throw new Error("PGC_R06_A07_LEGAL_ROUTE_CONFORMANCE_MISMATCH");
}
if (illegalRoutes.some((route) => !R06_TYPES.has(route.questionType)
    || route.verifiedMaxQuestionCount !== 0
    || route.legalRouteStatus !== "ILLEGAL")) {
  throw new Error("PGC_R06_A07_ILLEGAL_ROUTE_CLASSIFICATION_MISMATCH");
}

const diagnostics = legalRoutes.map(diagnoseRoute);
const failed = diagnostics.filter((route) => !route.accepted);
if (failed.length > 0) {
  throw new Error(`PGC_R06_A07_GLOBAL_LIVE_GATE_FAILED:${JSON.stringify(failed.slice(0, 10).map((route) => ({ routeId: route.routeId, first: route.first, second: route.second, binding: route.binding })))}`);
}

const closeout = {
  schemaName: "PGCR06A07FinalGlobalLiveCloseoutV1",
  schemaVersion: 1,
  programId: PROGRAM_ID,
  taskId: TASK_ID,
  status: "PASS_R06_A07_GLOBAL_LIVE_RUNTIME_RECONCILED_AND_D0_CLOSED",
  summary: {
    capacityRouteCount: capacity.routes.length,
    runtimeRegistryRowCount: capacity.routes.length,
    r06RouteCount: r06Routes.length,
    legalR06RouteCount: legalRoutes.length,
    illegalR06RouteCount: illegalRoutes.length,
    globalLiveTargetRouteCount: legalRoutes.length,
    globalLivePassRouteCount: diagnostics.length - failed.length,
    globalLiveFailRouteCount: failed.length,
    questionCountPerRoute: QUESTION_COUNT,
    repairQueueCount: inventory.repairQueue.length,
    zeroCapacityRouteCount: inventory.summary.zeroCapacityRouteCount,
    limitedCapacityRouteCount: inventory.summary.limitedCapacityRouteCount,
    diversityGapRouteCount: inventory.summary.diversityGapRouteCount,
    parallelGapFieldCount: capacity.routes.filter((route) => Object.hasOwn(route, "gapCodes")).length,
    uiUnverifiedCapacityExposureCount: ui.summary.unverifiedCapacityExposureCount,
  },
  lineage: {
    previousTaskId: A06_TASK_ID,
    capacityContract: paths.capacity,
    uiCapabilityBindingContract: paths.ui,
    repairInventory: paths.inventory,
    runtimeRegistry: paths.registry,
  },
  routes: diagnostics,
  boundary: {
    generatorModified: false,
    validatorModified: false,
    rendererModified: false,
    uiControlModified: false,
    knowledgePointAdded: false,
    patternGroupAdded: false,
    patternSpecAdded: false,
    contextFamilyAdded: false,
    secondPipelineAdded: false,
  },
  nextShortestStep: "OPERATOR_SELECT_NEXT_APPROVED_PROGRAM_AFTER_R06",
};

capacity.lastR06A07Closeout = {
  taskId: TASK_ID,
  r06RouteCount: 659,
  legalR06RouteCount: 389,
  illegalR06RouteCount: 270,
  globalLivePassRouteCount: 389,
  repairQueueCount: 0,
  status: closeout.status,
};
capacity.r06TerminalStatus = "D0_CLOSED";
ui.lastR06A07Closeout = {
  taskId: TASK_ID,
  globalLivePassRouteCount: 389,
  repairQueueCount: 0,
  status: closeout.status,
};
ui.r06TerminalStatus = "D0_CLOSED";
inventory.lastR06A07Closeout = {
  taskId: TASK_ID,
  r06RouteCount: 659,
  legalR06RouteCount: 389,
  illegalR06RouteCount: 270,
  globalLivePassRouteCount: 389,
  repairQueueCount: 0,
  status: closeout.status,
};
inventory.r06TerminalStatus = "D0_CLOSED";
inventory.nextShortestStep = closeout.nextShortestStep;

const registryRowCount = reconcileRegistry(capacity);
closeout.summary.runtimeRegistryRowCount = registryRowCount;
writeJson(paths.capacity, capacity);
writeJson(paths.ui, ui);
writeJson(paths.inventory, inventory);
writeJson(paths.closeout, closeout);

const readback = [
  "# PGC-R06 A07 Final Reconciliation, Global Live Gate, and D0 Closeout",
  "",
  "```text",
  `PROGRAM_ID = ${PROGRAM_ID}`,
  `TASK_ID = ${TASK_ID}`,
  `R06_ROUTE_COUNT = ${closeout.summary.r06RouteCount}`,
  `LEGAL_R06_ROUTE_COUNT = ${closeout.summary.legalR06RouteCount}`,
  `ILLEGAL_R06_ROUTE_COUNT = ${closeout.summary.illegalR06RouteCount}`,
  `GLOBAL_LIVE_GATE = ${closeout.summary.globalLivePassRouteCount}/${closeout.summary.globalLiveTargetRouteCount}`,
  `QUESTION_COUNT_PER_ROUTE = ${QUESTION_COUNT}`,
  `RUNTIME_REGISTRY_ROW_COUNT = ${registryRowCount}`,
  `REPAIR_QUEUE_COUNT = ${closeout.summary.repairQueueCount}`,
  `ZERO_CAPACITY_ROUTE_COUNT = ${closeout.summary.zeroCapacityRouteCount}`,
  `LIMITED_CAPACITY_ROUTE_COUNT = ${closeout.summary.limitedCapacityRouteCount}`,
  `DIVERSITY_GAP_ROUTE_COUNT = ${closeout.summary.diversityGapRouteCount}`,
  `PARALLEL_GAP_FIELD_COUNT = ${closeout.summary.parallelGapFieldCount}`,
  `UI_UNVERIFIED_CAPACITY_EXPOSURE_COUNT = ${closeout.summary.uiUnverifiedCapacityExposureCount}`,
  `STATUS = ${closeout.status}`,
  "```",
  "",
  "## Distance closeout",
  "",
  "```text",
  "GOAL_DISTANCE_BEFORE = D1_R06_ZERO_ROUTE_QUEUE_FINAL_CLOSEOUT_PENDING",
  "GOAL_DISTANCE_AFTER  = D0_R06_REASONING_MIXED_PBL_CONFORMANCE_CLOSED",
  "DISTANCE_REDUCED     = all 389 legal R06 routes independently replayed through the live generator/validator/worksheet consumer with 20 unique questions and deterministic two-seed evidence",
  "REMAINING_BLOCKERS   = []",
  "NEXT_SHORTEST_STEP   = OPERATOR_SELECT_NEXT_APPROVED_PROGRAM_AFTER_R06",
  "```",
  "",
  "## Task closeout",
  "",
  "```text",
  "1. Distance segment shortened = R06 zero-queue authority to independently replayed global live D0 evidence",
  "2. System nodes advanced = generator consumer / validator / worksheet / public capacity lineage",
  "3. Blocker removed = R06 final global live proof and terminal reconciliation",
  "4. New blocker added = none",
  "5. Next shortest effective step = operator selects the next approved post-R06 program",
  "```",
];
fs.writeFileSync(absolute(paths.readback), `${readback.join("\n")}\n`);
fs.writeFileSync(absolute(paths.marker), [
  `PROGRAM_ID=${PROGRAM_ID}`,
  `TASK_ID=${TASK_ID}`,
  `STATUS=${closeout.status}`,
  "GOAL_DISTANCE=D0_R06_REASONING_MIXED_PBL_CONFORMANCE_CLOSED",
  "REPAIR_QUEUE_COUNT=0",
  "GLOBAL_LIVE_GATE=389/389",
  "NEXT_SHORTEST_STEP=OPERATOR_SELECT_NEXT_APPROVED_PROGRAM_AFTER_R06",
  "",
].join("\n"));

console.log(`PGC_R06_A07_CLOSEOUT=${JSON.stringify({
  status: closeout.status,
  r06RouteCount: closeout.summary.r06RouteCount,
  legalR06RouteCount: closeout.summary.legalR06RouteCount,
  illegalR06RouteCount: closeout.summary.illegalR06RouteCount,
  globalLiveGate: `${closeout.summary.globalLivePassRouteCount}/${closeout.summary.globalLiveTargetRouteCount}`,
  repairQueueCount: closeout.summary.repairQueueCount,
  registryRowCount,
})}`);
