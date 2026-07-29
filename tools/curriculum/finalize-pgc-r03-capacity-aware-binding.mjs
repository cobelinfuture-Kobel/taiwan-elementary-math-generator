import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const contractPath = path.join(repoRoot, "data/curriculum/public-generation/generator_capacity_contract.json");
const reportPath = path.join(repoRoot, "docs/curriculum/output/PGC-R03_capacity_mismatch_report.md");

function writeFinalReport(contract) {
  const summary = contract.summary;
  const lines = [
    "# PGC-R03 Capacity-aware Legal Route Reconciliation",
    "",
    "```text",
    "PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    "TASK_ID    = PGC-R03_CapacityAwareLegalRouteAndPerCapabilityUiLimitReconciliation",
    `STATUS     = ${contract.status}`,
    "```",
    "",
    "## Reconciled capacity",
    "",
    "```text",
    `HISTORICAL_R02_BINDINGS        = ${summary.historicalBindingCount}`,
    `CURRENT_LEGAL_BINDINGS         = ${summary.currentLegalBindingCount}`,
    `ROUTES                         = ${summary.routeCount}`,
    `LEGAL_ROUTES                   = ${summary.legalRouteCount}`,
    `ILLEGAL_ROUTES_REMOVED         = ${summary.illegalRouteCount}`,
    `VERIFIED_20_ROUTES             = ${summary.verified20RouteCount}`,
    `VERIFIED_LIMITED_ROUTES        = ${summary.verifiedLimitedRouteCount}`,
    `ZERO_CAPACITY_ROUTES_HIDDEN    = ${summary.zeroCapacityRouteCount}`,
    `DIVERSITY_GAP_ROUTES           = ${summary.diversityGapRouteCount}`,
    `CURRENT_UNVERIFIED_EXPOSURES   = ${summary.currentUnverifiedCapacityExposureCount}`,
    `HARD_BLOCKERS                  = ${summary.hardBlockerCount}`,
    "```",
    "",
    "Illegal control intersections are not treated as weak generators. They are removed from the public route set. Legal routes retain their measured maximum; fixed fixture routes may remain usable while their diversity debt is transferred to PGC-R04 or PGC-R05.",
    "",
    "## Downstream gaps",
    "",
    ...(contract.downstreamGaps ?? []).map((gap) => `- \`${gap.code}\`: ${gap.count}`),
    "",
    "## Distance update",
    "",
    "```text",
    "GOAL_DISTANCE_BEFORE = D1_GENERATOR_CAPACITY_FAIL_CLOSED",
    `GOAL_DISTANCE_AFTER  = ${summary.hardBlockerCount === 0 ? "D1_CAPACITY_AWARE_PUBLIC_ROUTES_CONFORMANT" : "D1_CAPACITY_RECONCILIATION_BLOCKED"}`,
    "DISTANCE_REDUCED     = illegal routes are removed and every exposed route is clamped to its verified safe question count",
    "REMAINING_BLOCKERS   = [PGC-R04_NUMERIC_QUALITY, PGC-R05_APPLICATION_QUALITY, PGC-R06_TO_R08_PRODUCT_ACCEPTANCE]",
    "NEXT_SHORTEST_STEP   = PGC-R04_NumericGenerationFullFix",
    "```",
    "",
  ];
  fs.writeFileSync(reportPath, `${lines.join("\n")}\n`);
}

export async function finalizePgcR03CapacityAwareBinding() {
  if (!fs.existsSync(contractPath)) throw new Error("PGC_R03_CONTRACT_MISSING");
  const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
  if (contract.schemaName !== "PublicGeneratorCapacityContractV3") {
    throw new Error(`PGC_R03_V3_REQUIRED:${contract.schemaName ?? "unknown"}`);
  }

  const r02Module = await import(`./materialize-pgc-r02-ui-capability-binding-r03.mjs?finalize=${Date.now()}`);
  const currentR02 = r02Module.materializePgcR02UiCapabilityBinding();
  const hardBlockers = (contract.hardBlockers ?? []).filter((code) => ![
    "CURRENT_R02_CAPACITY_AWARE_BINDING_FAILED",
    "CURRENT_UI_UNVERIFIED_CAPACITY_EXPOSED",
  ].includes(code));
  if (currentR02.status !== "PASS") hardBlockers.push("CURRENT_R02_CAPACITY_AWARE_BINDING_FAILED");
  if (currentR02.summary.unverifiedCapacityExposureCount !== 0) hardBlockers.push("CURRENT_UI_UNVERIFIED_CAPACITY_EXPOSED");

  const summary = {
    ...contract.summary,
    currentLegalBindingCount: currentR02.bindings.length,
    currentVerified20BindingCount: currentR02.summary.verified20BindingCount,
    currentLimitedBindingCount: currentR02.summary.limitedCapacityBindingCount,
    currentUnverifiedCapacityExposureCount: currentR02.summary.unverifiedCapacityExposureCount,
    hardBlockerCount: hardBlockers.length,
  };
  const hasDownstreamGaps = (contract.downstreamGaps ?? []).some((gap) => Number(gap.count) > 0);
  const finalized = {
    ...contract,
    status: hardBlockers.length > 0 ? "FAIL_CLOSED" : hasDownstreamGaps ? "PASS_WITH_DOWNSTREAM_GAPS" : "PASS",
    summary,
    hardBlockers,
    currentUiBindingContract: {
      schemaName: currentR02.schemaName,
      status: currentR02.status,
      summary: currentR02.summary,
    },
    finalizedAtRuntimeStage: "PGC_R03_CAPACITY_AWARE_BINDING_FINALIZED",
  };
  fs.writeFileSync(contractPath, `${JSON.stringify(finalized, null, 2)}\n`);
  writeFinalReport(finalized);
  console.log(`PGC_R03_FINALIZE_SUMMARY=${JSON.stringify(summary)}`);
  if (finalized.status === "FAIL_CLOSED") process.exitCode = 2;
  return finalized;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await finalizePgcR03CapacityAwareBinding();
}
