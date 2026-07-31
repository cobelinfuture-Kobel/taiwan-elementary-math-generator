import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { materializeMatrix } from "./build-pgc-r08-a01-legal-route-browser-matrix.mjs";
import { executeRoute, GATE_CODES } from "./pgc-r08-a03-browser-harness-core.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PLAN_PATH = path.join(
  ROOT,
  "data/curriculum/public-generation/PGC-R08-A03.all-legal-route-browser-execution-plan.json",
);
const CAPACITY_PATH = path.join(
  ROOT,
  "data/curriculum/public-generation/generator_capacity_contract.json",
);
const A00_PATH = path.join(
  ROOT,
  "data/curriculum/public-generation/PGC-R08-A00.public-generate-button-e2e-scope.json",
);
const OUT = path.join(ROOT, "tmp/pgc-r08-a03-all-legal-routes");
const SAMPLE = path.join(OUT, "samples");
const FAILURE = path.join(OUT, "failures");
const CHECKPOINT_PATH = path.join(OUT, "checkpoint.json");
const ORIGIN = "http://127.0.0.1:4196";

function fail(code, details = {}) {
  const error = new Error(code);
  error.details = details;
  throw error;
}

function csvEscape(value) {
  const text = Array.isArray(value)
    ? value.join("|")
    : value == null
      ? ""
      : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

async function waitForServer() {
  for (let i = 0; i < 120; i += 1) {
    try {
      if ((await fetch(`${ORIGIN}/index.html`, { cache: "no-store" })).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  fail("PGC_R08_A03_SITE_SERVER_TIMEOUT");
}

function buildCsv(rows) {
  const headers = [
    "routeIndex",
    "shardId",
    "routeId",
    "sourceId",
    "selectionMode",
    "questionType",
    "capacityStatus",
    "verifiedMaxQuestionCount",
    ...GATE_CODES,
    "overallStatus",
    "errorCode",
    "pdfSha256",
  ];
  const lines = [headers.join(",")];
  for (const row of rows) {
    const values = [
      row.routeIndex,
      row.shardId,
      row.routeId,
      row.sourceId,
      row.selectionMode,
      row.questionType,
      row.capacityStatus,
      row.verifiedMaxQuestionCount,
      ...GATE_CODES.map((gate) => row.gateStatus[gate]),
      row.overallStatus,
      row.browserEvidence?.errorCode ?? "",
      row.browserEvidence?.firstGeneration?.pdfSha256 ?? "",
    ];
    lines.push(values.map(csvEscape).join(","));
  }
  return `${lines.join("\n")}\n`;
}

function buildFailureMarkdown(report) {
  const lines = [
    "# PGC-R08 A03 Failed Combination Report",
    "",
    "```text",
    `STATUS = ${report.status}`,
    `EXECUTED = ${report.summary.executedRouteCount}`,
    `PASS = ${report.summary.passRouteCount}`,
    `FAIL = ${report.summary.failRouteCount}`,
    `CAPACITY_EVIDENCE_REQUALIFICATION = ${report.summary.capacityEvidenceReconciliationQueueCount}`,
    "```",
    "",
  ];
  for (const row of report.repairQueue) {
    lines.push(
      `- ${row.routeId} | ${row.errorCode} | shard=${row.shardId} | index=${row.routeIndex}`,
    );
  }
  if (!report.repairQueue.length) lines.push("No failed legal route.");
  return `${lines.join("\n")}\n`;
}

function makeCheckpoint(rows, { authoritativeFinal = false } = {}) {
  const terminal = rows.filter(Boolean);
  const shardCounts = Object.fromEntries(
    [...new Set(terminal.map((row) => row.shardId))]
      .sort()
      .map((shardId) => [
        shardId,
        terminal.filter((row) => row.shardId === shardId).length,
      ]),
  );
  return {
    schemaName: "PGCR08A03ExecutionCheckpointV1",
    authoritativeFinal,
    executedRouteCount: terminal.length,
    terminalRouteCount: terminal.length,
    passRouteCount: terminal.filter((row) => row.overallStatus === "PASS").length,
    failRouteCount: terminal.filter((row) => row.overallStatus === "FAIL").length,
    maxCompletedRouteIndex: terminal.reduce(
      (maximum, row) => Math.max(maximum, row.routeIndex),
      0,
    ),
    shardCounts,
  };
}

async function writeCheckpoint(rows, options = {}) {
  const checkpoint = makeCheckpoint(rows, options);
  await writeFile(CHECKPOINT_PATH, `${JSON.stringify(checkpoint, null, 2)}\n`);
  return checkpoint;
}

function selectShardSampleRepresentatives(shards, passedRows) {
  return shards.map((shard) => {
    const representative = passedRows
      .filter((row) => row.shardId === shard.shardId)
      .sort((left, right) => left.routeIndex - right.routeIndex)[0];
    if (!representative) {
      fail("PGC_R08_A03_SHARD_SAMPLE_REPRESENTATIVE_MISSING", {
        shardId: shard.shardId,
      });
    }
    return {
      shardId: shard.shardId,
      firstRouteIndex: shard.firstRouteIndex,
      routeId: representative.routeId,
    };
  });
}

async function captureShardSamples(browser, matrix, representatives) {
  const sampleEvidence = [];
  for (const representative of representatives) {
    const authorityRow = matrix.rows.find(
      (row) => row.routeId === representative.routeId,
    );
    if (!authorityRow) {
      fail("PGC_R08_A03_SHARD_SAMPLE_AUTHORITY_ROW_MISSING", representative);
    }

    // executeRoute writes a binary sample only for the first index in a shard.
    // Replaying a known-PASS route with that shard's first index is evidence-only;
    // it does not mutate the authoritative 793-route classifications.
    const replayRow = {
      ...authorityRow,
      routeIndex: representative.firstRouteIndex,
    };
    const replayResult = await executeRoute(browser, replayRow);
    if (replayResult.overallStatus !== "PASS") {
      fail("PGC_R08_A03_SHARD_SAMPLE_REPLAY_FAILED", {
        shardId: representative.shardId,
        routeId: representative.routeId,
        errorCode: replayResult.browserEvidence?.errorCode ?? "UNKNOWN",
      });
    }

    const firstGeneration = replayResult.browserEvidence?.firstGeneration;
    if (!firstGeneration?.sampleHtmlPath || !firstGeneration?.samplePdfPath) {
      fail("PGC_R08_A03_SHARD_SAMPLE_BINARY_MISSING", {
        shardId: representative.shardId,
        routeId: representative.routeId,
        sampleHtmlPath: firstGeneration?.sampleHtmlPath ?? null,
        samplePdfPath: firstGeneration?.samplePdfPath ?? null,
      });
    }

    sampleEvidence.push({
      shardId: representative.shardId,
      routeId: representative.routeId,
      authoritativeRouteIndex: authorityRow.routeIndex,
      replayRouteIndex: representative.firstRouteIndex,
      sampleHtmlPath: firstGeneration.sampleHtmlPath,
      samplePdfPath: firstGeneration.samplePdfPath,
      htmlSha256: firstGeneration.htmlSha256,
      pdfSha256: firstGeneration.pdfSha256,
      evidenceOnlyReplay: true,
      authoritativeRouteClassificationMutated: false,
    });
  }
  return sampleEvidence;
}

const plan = JSON.parse(await readFile(PLAN_PATH, "utf8"));
const capacityRaw = await readFile(CAPACITY_PATH, "utf8");
const capacity = JSON.parse(capacityRaw);
const a00 = JSON.parse(await readFile(A00_PATH, "utf8"));
const matrix = materializeMatrix(capacity, a00, capacityRaw);

if (matrix.rows.length !== plan.executionPolicy.routeCount) {
  fail("PGC_R08_A03_ROUTE_COUNT_DRIFT", {
    expected: plan.executionPolicy.routeCount,
    actual: matrix.rows.length,
  });
}
for (const shard of plan.shards) {
  const actual = matrix.shards.find((row) => row.shardId === shard.shardId);
  if (!actual || actual.routeIdsSha256 !== shard.routeIdsSha256) {
    fail("PGC_R08_A03_SHARD_HASH_DRIFT", { shardId: shard.shardId });
  }
}

await rm(OUT, { recursive: true, force: true });
await Promise.all([
  mkdir(SAMPLE, { recursive: true }),
  mkdir(FAILURE, { recursive: true }),
]);
const server = spawn(process.execPath, [path.join(ROOT, "tools/site/serve-site.js")], {
  cwd: ROOT,
  env: { ...process.env, SITE_PORT: "4196", SITE_HOST: "127.0.0.1" },
  stdio: ["ignore", "pipe", "pipe"],
});

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });

  const results = Array(matrix.rows.length);
  let cursor = 0;
  let completedCount = 0;
  let checkpointChain = Promise.resolve();

  const enqueueCheckpoint = () => {
    checkpointChain = checkpointChain.then(() => writeCheckpoint(results));
    return checkpointChain;
  };

  const worker = async () => {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= matrix.rows.length) return;

      results[index] = await executeRoute(browser, matrix.rows[index]);
      completedCount += 1;
      if (completedCount % 10 === 0 || completedCount === matrix.rows.length) {
        await enqueueCheckpoint();
      }
    }
  };

  await Promise.all(
    Array.from(
      { length: plan.executionPolicy.workerConcurrency },
      () => worker(),
    ),
  );
  await checkpointChain;

  if (results.some((row) => !row)) {
    fail("PGC_R08_A03_TERMINAL_CLASSIFICATION_INCOMPLETE");
  }

  const finalCheckpoint = await writeCheckpoint(results, {
    authoritativeFinal: true,
  });
  if (
    finalCheckpoint.executedRouteCount !== matrix.rows.length ||
    finalCheckpoint.terminalRouteCount !== matrix.rows.length
  ) {
    fail("PGC_R08_A03_FINAL_CHECKPOINT_INCOMPLETE", finalCheckpoint);
  }

  const passed = results.filter((row) => row.overallStatus === "PASS");
  const failed = results.filter((row) => row.overallStatus === "FAIL");
  const requalified = passed.filter(
    (row) =>
      row.capacityStatus === "VERIFIED_LIMITED" &&
      row.verifiedMaxQuestionCount < 20,
  );

  const sampleRepresentatives = selectShardSampleRepresentatives(
    matrix.shards,
    passed,
  );
  const sampleEvidence = await captureShardSamples(
    browser,
    matrix,
    sampleRepresentatives,
  );
  if (
    sampleEvidence.length !== matrix.shards.length ||
    new Set(sampleEvidence.map((row) => row.shardId)).size !== matrix.shards.length
  ) {
    fail("PGC_R08_A03_SHARD_SAMPLE_COVERAGE_INCOMPLETE", {
      expected: matrix.shards.length,
      actual: sampleEvidence.length,
    });
  }

  const report = {
    schemaName: "PGCR08A03AllLegalRouteBrowserExecutionReportV1",
    schemaVersion: 1,
    programId: plan.programId,
    taskId: plan.taskId,
    status: failed.length
      ? "PASS_EXECUTION_COMPLETE_WITH_REPAIR_QUEUE"
      : "PASS_ALL_793_LEGAL_ROUTES",
    summary: {
      legalRouteCount: matrix.rows.length,
      executedRouteCount: results.length,
      terminalRouteCount: results.length,
      passRouteCount: passed.length,
      failRouteCount: failed.length,
      verified20PassCount: passed.filter(
        (row) => row.capacityStatus === "VERIFIED_20",
      ).length,
      verifiedLimitedPassCount: passed.filter(
        (row) => row.capacityStatus === "VERIFIED_LIMITED",
      ).length,
      capacityEvidenceReconciliationQueueCount: requalified.length,
      shardCount: matrix.shards.length,
      sampleHtmlCount: sampleEvidence.filter((row) => row.sampleHtmlPath).length,
      samplePdfCount: sampleEvidence.filter((row) => row.samplePdfPath).length,
      finalCheckpointExecutedRouteCount: finalCheckpoint.executedRouteCount,
      finalCheckpointAuthoritative: finalCheckpoint.authoritativeFinal,
      browserConsoleErrorCount: results.reduce(
        (sum, row) =>
          sum +
          (row.browserEvidence?.consoleErrorCount ??
            row.browserEvidence?.consoleErrors?.length ??
            0),
        0,
      ),
      browserPageErrorCount: results.reduce(
        (sum, row) =>
          sum +
          (row.browserEvidence?.pageErrorCount ??
            row.browserEvidence?.pageErrors?.length ??
            0),
        0,
      ),
    },
    shards: matrix.shards.map((shard) => {
      const rows = results.filter((row) => row.shardId === shard.shardId);
      return {
        ...shard,
        status: rows.some((row) => row.overallStatus === "FAIL")
          ? "EXECUTED_WITH_FAILURES"
          : "PASS",
        executedRouteCount: rows.length,
        passRouteCount: rows.filter((row) => row.overallStatus === "PASS").length,
        failRouteCount: rows.filter((row) => row.overallStatus === "FAIL").length,
      };
    }),
    sampleEvidence,
    mandatoryHandoffs: plan.mandatoryHandoffs.map((handoff) => {
      const row = results.find(
        (candidate) => candidate.routeId === handoff.routeId,
      );
      return {
        ...handoff,
        actualStatus: row?.overallStatus ?? "MISSING",
        errorCode: row?.browserEvidence?.errorCode ?? null,
      };
    }),
    repairQueue: failed.map((row) => ({
      routeIndex: row.routeIndex,
      shardId: row.shardId,
      routeId: row.routeId,
      sourceId: row.sourceId,
      selectionMode: row.selectionMode,
      questionType: row.questionType,
      capacityStatus: row.capacityStatus,
      errorCode: row.browserEvidence?.errorCode ?? "UNKNOWN",
      details: row.browserEvidence?.details ?? null,
    })),
    capacityEvidenceReconciliationQueue: requalified.map((row) => ({
      routeIndex: row.routeIndex,
      shardId: row.shardId,
      routeId: row.routeId,
      priorCapacityStatus: row.capacityStatus,
      priorVerifiedMaxQuestionCount: row.verifiedMaxQuestionCount,
      observedQuestionCount: 20,
      evidenceCode: "LIVE_20_REQUALIFICATION_PASS",
      authorityMutationPerformedByA03: false,
    })),
    rows: results,
    goalDistance: {
      before: "D1_R08_PUBLIC_GENERATE_BUTTON_HARNESS_QUALIFIED",
      after: failed.length
        ? "D1_R08_ALL_LEGAL_ROUTES_EXECUTED_REPAIR_QUEUE_MATERIALIZED"
        : "D1_R08_ALL_LEGAL_ROUTES_BROWSER_PASS",
      distanceReduced:
        "executed and terminally classified every legal public Generate-button route through real browser controls, HTML, PDF, print, answer key and regeneration",
      remainingBlockers: failed.length
        ? [
            "A03_REPAIR_QUEUE_NONZERO",
            "CAPACITY_EVIDENCE_RECONCILIATION_PENDING",
          ]
        : ["CAPACITY_EVIDENCE_RECONCILIATION_PENDING"],
      nextShortestStep: failed.length
        ? "PGC-R08-A04_FailedCombinationRepairAndReconciliation"
        : "PGC-R08-A04_CapacityEvidenceReconciliation",
    },
  };

  await writeFile(
    path.join(OUT, "report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  await writeFile(path.join(OUT, "route_results.csv"), buildCsv(results));
  await writeFile(
    path.join(OUT, "failed_combination_report.md"),
    buildFailureMarkdown(report),
  );

  console.log(
    JSON.stringify(
      {
        status: report.status,
        summary: report.summary,
        mandatoryHandoffs: report.mandatoryHandoffs,
      },
      null,
      2,
    ),
  );

  if (
    report.summary.executedRouteCount !== 793 ||
    report.summary.terminalRouteCount !== 793 ||
    report.summary.sampleHtmlCount !== 16 ||
    report.summary.samplePdfCount !== 16 ||
    report.summary.finalCheckpointExecutedRouteCount !== 793 ||
    report.summary.finalCheckpointAuthoritative !== true
  ) {
    fail("PGC_R08_A03_EVIDENCE_INTEGRITY_INCOMPLETE", report.summary);
  }
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}
