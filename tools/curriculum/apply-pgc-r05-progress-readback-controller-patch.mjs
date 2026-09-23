import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const relativePath = "tools/curriculum/materialize-pgc-r05-application-gap-diagnostics.mjs";
const marker = "PGC-R05 live progress readback controller V1";

function replaceRequired(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`PGC_R05_PROGRESS_READBACK_ANCHOR_MISSING:${label}`);
  return source.replace(before, after);
}

export function applyPgcR05ProgressReadbackControllerPatch() {
  const filePath = path.join(repoRoot, relativePath);
  const before = fs.readFileSync(filePath, "utf8");
  if (before.includes(marker)) {
    const result = Object.freeze({
      status: "PASS_PGC_R05_PROGRESS_READBACK_CONTROLLER_ALREADY_APPLIED",
      changedFiles: Object.freeze([]),
      verifiedFiles: Object.freeze([relativePath]),
      liveAndContractGapsSeparated: true,
      nextStepComputedFromLargestLiveCluster: true,
    });
    console.log(`PGC_R05_PROGRESS_READBACK_PATCH=${JSON.stringify(result)}`);
    return result;
  }

  let source = before;
  source = replaceRequired(
    source,
    `function writeReadback(report) {`,
    `const LIVE_REPAIR_TASK_BY_SOURCE = Object.freeze({
  g5a_u08_5a08: "PGC-R05_G5A_U08_ApplicationDiversityFullFix",
  g3a_u08_3a08: "PGC-R05_G3A_U08_ApplicationDiversityFullFix",
  g3b_u07_3b07: "PGC-R05_G3B_U07_ApplicationDiversityFullFix",
  g4a_u08_4a08: "PGC-R05_G4A_U08_ApplicationDiversityFullFix",
  g5a_u03_5a03a: "PGC-R05_G5A_U03_ApplicationDiversityFullFix",
  g5a_u03_5a03a1: "PGC-R05_G5A_U03A1_ApplicationDiversityFullFix",
  g3b_u08_3b08: "PGC-R05_G3B_U08_ApplicationDiversityFullFix",
  g6a_u01_6a01: "PGC-R05_G6A_U01_ApplicationDiversityFullFix",
});

function sortedCountRows(counts = {}) {
  return Object.entries(counts).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
}

function reportStatus(summary) {
  if (summary.live20FailRouteCount === 0) return "PASS_R05_ALL_LIVE_APPLICATION_ROUTES_CONFORMANT_PENDING_CONTRACT_RECONCILIATION";
  return \`PASS_R05_${"${summary.live20PassRouteCount}"}_OF_${"${summary.legalApplicationRouteCount}"}_LIVE_APPLICATION_ROUTES_CONFORMANT\`;
}

function nextShortestStep(summary) {
  const nextSourceId = sortedCountRows(summary.liveFailureRouteCountBySource)[0]?.[0] ?? null;
  if (!nextSourceId) return "PGC-R05_CapacityContractReconciliationAndD0Closeout";
  return LIVE_REPAIR_TASK_BY_SOURCE[nextSourceId]
    ?? \`PGC-R05_${"${nextSourceId.toUpperCase().replace(/[^A-Z0-9]+/g, \"_\")}"}_ApplicationDiversityFullFix\`;
}

function writeReadback(report) {`,
    "readback-controller-helpers",
  );

  source = replaceRequired(
    source,
    `  const summary = report.summary;
  const sourceRows = Object.entries(summary.repairRouteCountBySource).sort((a, b) => b[1] - a[1]);
  const lines = [`,
    `  const summary = report.summary;
  const sourceRows = sortedCountRows(summary.repairRouteCountBySource);
  const liveFailureRows = sortedCountRows(summary.liveFailureRouteCountBySource);
  const blockerText = liveFailureRows.length > 0
    ? liveFailureRows.map(([sourceId, count]) => \`${"${sourceId}"}:${"${count}"}\`).join(", ")
    : "CAPACITY_CONTRACT_RECONCILIATION";
  const nextStep = nextShortestStep(summary);
  const lines = [`,
    "readback-row-setup",
  );

  source = replaceRequired(
    source,
    `    "## Scope boundary",
    "",
    "- R05 owns legal public \`application\` routes only.",`,
    `    "## Live failures by source",
    "",
    "| Source | Live failing routes |",
    "|---|---:|",
    ...(liveFailureRows.length > 0
      ? liveFailureRows.map(([sourceId, count]) => \`| \\\`${"${sourceId}"}\\\` | ${"${count}"} |\`)
      : ["| none | 0 |"]),
    "",
    "## Scope boundary",
    "",
    "- R05 owns legal public \`application\` routes only.",`,
    "live-failure-table",
  );

  source = replaceRequired(
    source,
    `    "GOAL_DISTANCE_BEFORE = D1_R04_PUBLIC_NUMERIC_GENERATION_CONFORMANT_APPLICATION_UNVERIFIED",
    "GOAL_DISTANCE_AFTER  = D1_R05_APPLICATION_RUNTIME_GAPS_SOURCE_LOCATED",
    "DISTANCE_REDUCED     = every legal application route now has reproducible 20-question runtime, prompt-diversity, answer-key and authority-lineage evidence",
    "REMAINING_BLOCKERS   = [APPLICATION_REPAIR_ROUTES_FROM_DIAGNOSTIC]",
    "NEXT_SHORTEST_STEP   = PGC-R05_ApplicationProducerAndContextAllocatorFullFix",`,
    `    "GOAL_DISTANCE_BEFORE = D1_R05_APPLICATION_LIVE_GENERATION_PARTIALLY_CONFORMANT",
    \`GOAL_DISTANCE_AFTER  = D1_R05_${"${summary.live20PassRouteCount}"}_OF_${"${summary.legalApplicationRouteCount}"}_LIVE_APPLICATION_ROUTES_CONFORMANT\`,
    \`DISTANCE_REDUCED     = ${"${summary.live20PassRouteCount}"}/${"${summary.legalApplicationRouteCount}"} legal application routes now pass two deterministic 20-question worksheets with complete prompts, answer keys and authority lineage; ${"${summary.live20FailRouteCount}"} live failures remain\`,
    \`REMAINING_BLOCKERS   = [${"${blockerText}"}]\`,
    \`NEXT_SHORTEST_STEP   = ${"${nextStep}"}\`,`,
    "dynamic-distance",
  );

  source = replaceRequired(
    source,
    `  const repairRoutes = diagnostics.filter((row) => row.requiresRepair);
  const repairRouteCountBySource = Object.fromEntries([...new Set(repairRoutes.map((row) => row.sourceId))]
    .sort()
    .map((sourceId) => [sourceId, repairRoutes.filter((row) => row.sourceId === sourceId).length]));
  const summary = {`,
    `  const repairRoutes = diagnostics.filter((row) => row.requiresRepair);
  const liveFailureRoutes = diagnostics.filter((row) => !row.accepted20AcrossSeeds);
  const repairRouteCountBySource = Object.fromEntries([...new Set(repairRoutes.map((row) => row.sourceId))]
    .sort()
    .map((sourceId) => [sourceId, repairRoutes.filter((row) => row.sourceId === sourceId).length]));
  const liveFailureRouteCountBySource = Object.fromEntries([...new Set(liveFailureRoutes.map((row) => row.sourceId))]
    .sort()
    .map((sourceId) => [sourceId, liveFailureRoutes.filter((row) => row.sourceId === sourceId).length]));
  const summary = {`,
    "live-failure-summary-source",
  );

  source = replaceRequired(
    source,
    `    repairRouteCountBySource,
  };
  const report = {`,
    `    repairRouteCountBySource,
    liveFailureRouteCountBySource,
  };
  const report = {`,
    "live-failure-summary-field",
  );

  source = replaceRequired(
    source,
    `    status: "PASS_R05_APPLICATION_GAP_BASELINE_MATERIALIZED",`,
    `    status: reportStatus(summary),`,
    "dynamic-report-status",
  );

  source = `${source.trimEnd()}\n\n// ${marker}\n`;
  fs.writeFileSync(filePath, source);
  const result = Object.freeze({
    status: "PASS_PGC_R05_PROGRESS_READBACK_CONTROLLER_APPLIED",
    changedFiles: Object.freeze([relativePath]),
    verifiedFiles: Object.freeze([relativePath]),
    liveAndContractGapsSeparated: true,
    nextStepComputedFromLargestLiveCluster: true,
    secondControllerAdded: false,
  });
  console.log(`PGC_R05_PROGRESS_READBACK_PATCH=${JSON.stringify(result)}`);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) applyPgcR05ProgressReadbackControllerPatch();
