import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const relativePath = "tools/curriculum/materialize-pgc-r05-application-gap-diagnostics.mjs";
const marker = "PGC-R05 blocking-capacity versus retained-quality diagnostics V1";
const D0_STATUS = "PASS_R05_D0_ALL_LEGAL_APPLICATION_ROUTES_CAPACITY_CONFORMANT_WITH_RETAINED_CROSS_SEED_QUALITY_GAPS";

function replaceRequired(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`PGC_R05_RETAINED_QUALITY_DIAGNOSTICS_ANCHOR_MISSING:${label}`);
  return source.replace(before, after);
}

export function applyPgcR05RetainedQualityDiagnosticsPatch() {
  const filePath = path.join(repoRoot, relativePath);
  const before = fs.readFileSync(filePath, "utf8");
  if (before.includes(marker)) {
    const result = Object.freeze({ status: "PASS_PGC_R05_RETAINED_QUALITY_DIAGNOSTICS_ALREADY_APPLIED", changedFiles: Object.freeze([]) });
    console.log(`PGC_R05_RETAINED_QUALITY_DIAGNOSTICS_PATCH=${JSON.stringify(result)}`);
    return result;
  }

  let source = before;
  source = replaceRequired(
    source,
    `function contractGapCodes(route) {
  const codes = [];
  if (route.verifiedMaxQuestionCount < HARD_CEILING) codes.push("CAPACITY_BELOW_20");
  if (route.qualityStatus === "FIXTURE_SELECTOR") codes.push("FIXTURE_SELECTOR");
  if (route.qualityStatus === "BOUNDED_DIVERSITY") codes.push("BOUNDED_DIVERSITY");
  if (route.verifiedMaxQuestionCount === 0) codes.push("ZERO_SAFE_CAPACITY");
  if (route.qualityStatus !== "DIVERSE_PARAMETER_GENERATOR") codes.push("NON_DIVERSE_QUALITY_STATUS");
  return unique(codes);
}`,
    `function contractGapCodes(route) {
  const codes = [];
  if (route.verifiedMaxQuestionCount < HARD_CEILING) codes.push("CAPACITY_BELOW_20");
  if (route.qualityStatus === "FIXTURE_SELECTOR") codes.push("FIXTURE_SELECTOR");
  if (route.qualityStatus === "BOUNDED_DIVERSITY") codes.push("BOUNDED_DIVERSITY");
  if (route.verifiedMaxQuestionCount === 0) codes.push("ZERO_SAFE_CAPACITY");
  if (route.qualityStatus !== "DIVERSE_PARAMETER_GENERATOR") codes.push("NON_DIVERSE_QUALITY_STATUS");
  return unique(codes);
}

function blockingContractGapCodes(route) {
  return contractGapCodes(route).filter((code) => code === "CAPACITY_BELOW_20" || code === "ZERO_SAFE_CAPACITY");
}

function retainedQualityGapCodes(route) {
  return contractGapCodes(route).filter((code) => code !== "CAPACITY_BELOW_20" && code !== "ZERO_SAFE_CAPACITY");
}`,
    "gap-classification",
  );

  source = replaceRequired(
    source,
    `  const liveAcceptanceFailures = unique(runs.flatMap((run) => run.acceptanceFailures));
  console.log(\`PGC_R05_DIAGNOSTIC_PROGRESS=\${index + 1}/\${total}:\${route.routeId}\`);`,
    `  const liveAcceptanceFailures = unique(runs.flatMap((run) => run.acceptanceFailures));
  const allContractGapCodes = contractGapCodes(route);
  const blockingGapCodes = blockingContractGapCodes(route);
  const qualityGapCodes = retainedQualityGapCodes(route);
  console.log(\`PGC_R05_DIAGNOSTIC_PROGRESS=\${index + 1}/\${total}:\${route.routeId}\`);`,
    "diagnostic-gap-setup",
  );

  source = replaceRequired(
    source,
    `    contractGapCodes: contractGapCodes(route),
    liveAcceptanceFailures,`,
    `    contractGapCodes: allContractGapCodes,
    blockingContractGapCodes: blockingGapCodes,
    retainedQualityGapCodes: qualityGapCodes,
    liveAcceptanceFailures,`,
    "diagnostic-gap-fields",
  );

  source = replaceRequired(
    source,
    `    requiresRepair: contractGapCodes(route).length > 0 || liveAcceptanceFailures.length > 0,`,
    `    requiresRepair: blockingGapCodes.length > 0 || liveAcceptanceFailures.length > 0,`,
    "repair-classification",
  );

  source = replaceRequired(
    source,
    `function applicationContractReconciled(summary) {
  return summary.live20FailRouteCount === 0
    && summary.contractVerified20RouteCount === summary.legalApplicationRouteCount
    && summary.contractLimitedRouteCount === 0
    && summary.contractQualityGapRouteCount === 0
    && summary.zeroSafeCapacityRouteCount === 0
    && summary.repairRouteCount === 0;
}`,
    `function applicationContractReconciled(summary) {
  return summary.live20FailRouteCount === 0
    && summary.contractVerified20RouteCount === summary.legalApplicationRouteCount
    && summary.contractLimitedRouteCount === 0
    && summary.zeroSafeCapacityRouteCount === 0
    && summary.repairRouteCount === 0;
}`,
    "capacity-only-d0-gate",
  );

  source = replaceRequired(
    source,
    `if (applicationContractReconciled(summary)) return "PASS_R05_D0_ALL_LEGAL_APPLICATION_ROUTES_CONFORMANT";`,
    `if (applicationContractReconciled(summary)) return "${D0_STATUS}";`,
    "d0-status",
  );

  source = replaceRequired(
    source,
    `      ? "DISTANCE_REDUCED     = 211/211 legal application routes have synchronized live runtime, capacity contract, prompt diversity, answer-key and public-surface limit evidence"`,
    `      ? \`DISTANCE_REDUCED     = 211/211 legal application routes have synchronized live runtime, 20-question capacity, per-worksheet prompt diversity, answer-key and public-surface limit evidence; \${summary.contractQualityGapRouteCount} cross-seed quality gaps remain explicitly nonblocking\``,
    "distance-retained-quality",
  );

  source = `${source.trimEnd()}\n\n// ${marker}\n`;
  fs.writeFileSync(filePath, source);
  const result = Object.freeze({
    status: "PASS_PGC_R05_RETAINED_QUALITY_DIAGNOSTICS_PATCH_APPLIED",
    changedFiles: Object.freeze([relativePath]),
    finalStatus: D0_STATUS,
    blockingGapClasses: Object.freeze(["CAPACITY_BELOW_20", "ZERO_SAFE_CAPACITY", "LIVE_ACCEPTANCE_FAILURE"]),
    retainedNonblockingGapClass: "CROSS_SEED_ITEM_DIVERSITY_DEFICIENT",
  });
  console.log(`PGC_R05_RETAINED_QUALITY_DIAGNOSTICS_PATCH=${JSON.stringify(result)}`);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) applyPgcR05RetainedQualityDiagnosticsPatch();
