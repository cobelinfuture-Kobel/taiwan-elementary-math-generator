import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CAPACITY_PATH = path.join(
  ROOT,
  "data/curriculum/public-generation/generator_capacity_contract.json",
);
const A00_PATH = path.join(
  ROOT,
  "data/curriculum/public-generation/PGC-R08-A00.public-generate-button-e2e-scope.json",
);
const OUTPUT_DIR = path.join(ROOT, "tmp/pgc-r08-a01-legal-route-browser-matrix");
const JSON_OUTPUT = path.join(OUTPUT_DIR, "public_generate_button_acceptance.json");
const CSV_OUTPUT = path.join(OUTPUT_DIR, "public_capability_e2e_matrix.csv");
const REPORT_OUTPUT = path.join(OUTPUT_DIR, "failed_combination_report.md");
const SHARD_SIZE = 50;

const GATE_CODES = Object.freeze([
  "UI_OPTIONS_PASS",
  "GENERATE_BUTTON_PASS",
  "QUESTION_COUNT_PASS",
  "QUESTION_IDENTITY_PASS",
  "ANSWER_VALIDATION_PASS",
  "REGENERATE_PASS",
  "HTML_PASS",
  "PDF_PASS",
  "ANSWER_KEY_PASS",
]);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function fail(code, details = {}) {
  const error = new Error(code);
  error.details = details;
  throw error;
}

function csvEscape(value) {
  const text = Array.isArray(value)
    ? value.join("|")
    : value === null || value === undefined
      ? ""
      : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function makeGateStatus() {
  return Object.fromEntries(GATE_CODES.map((gateCode) => [gateCode, "PENDING"]));
}

function makeMatrixRow(route, index) {
  const verifiedMaxQuestionCount = Number(route.verifiedMaxQuestionCount ?? 0);
  const preExecutionRiskCodes = [];
  if (verifiedMaxQuestionCount < 20) {
    preExecutionRiskCodes.push("VERIFIED_MAX_BELOW_REQUESTED_20");
  }
  if (route.capacityStatus === "VERIFIED_LIMITED") {
    preExecutionRiskCodes.push("CAPACITY_STATUS_VERIFIED_LIMITED");
  }
  return {
    matrixRowId: `pgc_r08_${String(index + 1).padStart(4, "0")}`,
    routeIndex: index + 1,
    shardId: `PGC_R08_SHARD_${String(Math.floor(index / SHARD_SIZE) + 1).padStart(2, "0")}`,
    routeId: route.routeId,
    sourceId: route.sourceId,
    selectionMode: route.selectionMode,
    selectedKnowledgePointIds: [...(route.selectedKnowledgePointIds ?? [])],
    questionType: route.questionType,
    questionTypeLabel: route.questionTypeLabel ?? null,
    depthMode: route.depthMode ?? null,
    contextMode: route.contextMode ?? null,
    capacityStatus: route.capacityStatus,
    verifiedMaxQuestionCount,
    requestedQuestionCount: 20,
    expectedAnswerKeyItemCount: 20,
    legalRoute: true,
    publicUiSurface: "CLASSIC",
    publicUiEntryPath: "site/index.html",
    preExecutionRiskCodes: [...new Set(preExecutionRiskCodes)],
    gateStatus: makeGateStatus(),
    overallStatus: "PENDING_BROWSER_EXECUTION",
    browserEvidence: null,
  };
}

function buildShards(rows) {
  const shardMap = new Map();
  for (const row of rows) {
    if (!shardMap.has(row.shardId)) shardMap.set(row.shardId, []);
    shardMap.get(row.shardId).push(row);
  }
  return [...shardMap.entries()].map(([shardId, shardRows]) => ({
    shardId,
    firstRouteIndex: shardRows[0].routeIndex,
    lastRouteIndex: shardRows.at(-1).routeIndex,
    routeCount: shardRows.length,
    routeIdsSha256: sha256(JSON.stringify(shardRows.map((row) => row.routeId))),
    status: "PENDING_BROWSER_EXECUTION",
  }));
}

function buildCsv(rows) {
  const headers = [
    "matrixRowId",
    "routeIndex",
    "shardId",
    "routeId",
    "sourceId",
    "selectionMode",
    "selectedKnowledgePointIds",
    "questionType",
    "depthMode",
    "contextMode",
    "capacityStatus",
    "verifiedMaxQuestionCount",
    "requestedQuestionCount",
    "preExecutionRiskCodes",
    ...GATE_CODES,
    "overallStatus",
  ];
  const lines = [headers.join(",")];
  for (const row of rows) {
    const values = [
      row.matrixRowId,
      row.routeIndex,
      row.shardId,
      row.routeId,
      row.sourceId,
      row.selectionMode,
      row.selectedKnowledgePointIds,
      row.questionType,
      row.depthMode,
      row.contextMode,
      row.capacityStatus,
      row.verifiedMaxQuestionCount,
      row.requestedQuestionCount,
      row.preExecutionRiskCodes,
      ...GATE_CODES.map((gateCode) => row.gateStatus[gateCode]),
      row.overallStatus,
    ];
    lines.push(values.map(csvEscape).join(","));
  }
  return `${lines.join("\n")}\n`;
}

function buildFailedReport(matrix) {
  return `# PGC-R08 Failed Combination Report\n\n` +
    `\`\`\`text\n` +
    `TASK_ID = PGC-R08-A01_LegalRouteBrowserAcceptanceMatrixMaterialization\n` +
    `STATUS = PENDING_BROWSER_EXECUTION\n` +
    `LEGAL_ROUTE_COUNT = ${matrix.summary.legalRouteCount}\n` +
    `EXECUTED_ROUTE_COUNT = 0\n` +
    `FAILED_ROUTE_COUNT = 0\n` +
    `PREKNOWN_LIMITED_CAPACITY_RISK_COUNT = ${matrix.summary.preknownLimitedCapacityRiskCount}\n` +
    `\`\`\`\n\n` +
    `No route has been executed in A01. Failure rows will be populated by A03 and reconciled by A04.\n`;
}

export function materializeMatrix(capacity, a00, capacityRaw) {
  if (capacity.status !== "PASS") fail("PGC_R08_A01_CAPACITY_AUTHORITY_NOT_PASS");
  if (a00.status !== "PASS_R08_A00_PUBLIC_GENERATE_BUTTON_E2E_SCOPE_FROZEN") {
    fail("PGC_R08_A01_A00_NOT_CLOSED", { status: a00.status });
  }
  const legalRoutes = capacity.routes
    .filter((route) => route.legalRoute === true)
    .sort((left, right) => left.routeId.localeCompare(right.routeId));
  if (legalRoutes.length !== a00.matrixAuthority.legalRouteCount) {
    fail("PGC_R08_A01_LEGAL_ROUTE_COUNT_DRIFT", {
      expected: a00.matrixAuthority.legalRouteCount,
      actual: legalRoutes.length,
    });
  }
  if (new Set(legalRoutes.map((route) => route.routeId)).size !== legalRoutes.length) {
    fail("PGC_R08_A01_ROUTE_ID_DUPLICATE");
  }

  const rows = legalRoutes.map(makeMatrixRow);
  const shards = buildShards(rows);
  const verified20Count = rows.filter((row) => row.capacityStatus === "VERIFIED_20").length;
  const verifiedLimitedCount = rows.filter((row) => row.capacityStatus === "VERIFIED_LIMITED").length;
  const preknownLimitedCapacityRiskCount = rows.filter((row) => (
    row.preExecutionRiskCodes.includes("VERIFIED_MAX_BELOW_REQUESTED_20")
  )).length;
  const matrix = {
    schemaName: "PublicGenerateButtonAcceptanceMatrixV1",
    schemaVersion: 1,
    programId: "PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    taskId: "PGC-R08-A01_LegalRouteBrowserAcceptanceMatrixMaterialization",
    status: "PENDING_BROWSER_EXECUTION",
    sourceAuthority: {
      capacityPath: "data/curriculum/public-generation/generator_capacity_contract.json",
      capacitySchemaName: capacity.schemaName,
      capacitySchemaVersion: capacity.schemaVersion,
      capacitySha256: sha256(capacityRaw),
      a00Path: "data/curriculum/public-generation/PGC-R08-A00.public-generate-button-e2e-scope.json",
      legalRouteSelector: "routes.filter(route => route.legalRoute === true).sort(routeId)",
    },
    executionContract: {
      surface: "CLASSIC",
      entryPath: "site/index.html",
      requestedQuestionCountPerRoute: 20,
      expectedAnswerKeyItemCountPerRoute: 20,
      gateCodes: [...GATE_CODES],
      browserExecutionStarted: false,
    },
    summary: {
      routeCount: capacity.summary.routeCount,
      legalRouteCount: rows.length,
      illegalRouteCount: capacity.summary.illegalRouteCount,
      verified20RouteCount: verified20Count,
      verifiedLimitedRouteCount: verifiedLimitedCount,
      preknownLimitedCapacityRiskCount,
      matrixRowCount: rows.length,
      shardSize: SHARD_SIZE,
      shardCount: shards.length,
      pendingRouteCount: rows.length,
      executedRouteCount: 0,
      passRouteCount: 0,
      failRouteCount: 0,
    },
    shards,
    rows,
    goalDistance: {
      before: "D1_R08_PUBLIC_GENERATE_BUTTON_E2E_SCOPE_AND_MATRIX_CONTRACT_FROZEN",
      after: "D1_R08_LEGAL_ROUTE_BROWSER_ACCEPTANCE_MATRIX_MATERIALIZED",
      distanceReduced: "materialized all legal public capacity routes into deterministic browser acceptance rows and shards",
      remainingBlockers: [
        "PUBLIC_GENERATE_BUTTON_CANARY_NOT_QUALIFIED",
        "ALL_793_LEGAL_ROUTES_NOT_EXECUTED",
        "FAILED_COMBINATION_QUEUE_NOT_RECONCILED",
      ],
      nextShortestStep: "PGC-R08-A02_PublicGenerateButtonCanaryAndHarnessQualification",
    },
  };
  return matrix;
}

const capacityRaw = await readFile(CAPACITY_PATH, "utf8");
const capacity = JSON.parse(capacityRaw);
const a00 = JSON.parse(await readFile(A00_PATH, "utf8"));
const matrix = materializeMatrix(capacity, a00, capacityRaw);
const csv = buildCsv(matrix.rows);
const failedReport = buildFailedReport(matrix);

await mkdir(OUTPUT_DIR, { recursive: true });
await writeFile(JSON_OUTPUT, `${JSON.stringify(matrix, null, 2)}\n`, "utf8");
await writeFile(CSV_OUTPUT, csv, "utf8");
await writeFile(REPORT_OUTPUT, failedReport, "utf8");

console.log(JSON.stringify({
  status: "PASS",
  jsonOutput: path.relative(ROOT, JSON_OUTPUT),
  csvOutput: path.relative(ROOT, CSV_OUTPUT),
  reportOutput: path.relative(ROOT, REPORT_OUTPUT),
  ...matrix.summary,
}, null, 2));
