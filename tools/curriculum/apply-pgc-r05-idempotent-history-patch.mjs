import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const relativePath = "tools/curriculum/reconcile-pgc-r05-capacity-contract.mjs";
const marker = "PGC-R05 idempotent first-transition history preservation V1";

function replaceRequired(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`PGC_R05_IDEMPOTENT_HISTORY_ANCHOR_MISSING:${label}`);
  return source.replace(before, after);
}

export function applyPgcR05IdempotentHistoryPatch() {
  const filePath = path.join(repoRoot, relativePath);
  const before = fs.readFileSync(filePath, "utf8");
  if (before.includes(marker)) {
    const result = Object.freeze({
      status: "PASS_PGC_R05_IDEMPOTENT_HISTORY_ALREADY_APPLIED",
      changedFiles: Object.freeze([]),
      verifiedFiles: Object.freeze([relativePath]),
    });
    console.log(`PGC_R05_IDEMPOTENT_HISTORY_PATCH=${JSON.stringify(result)}`);
    return result;
  }

  let source = before;
  source = replaceRequired(
    source,
    `function reconcile() {
  const contract = readJson(contractPath, "PGC_R05_CAPACITY_CONTRACT_MISSING");
  const diagnostics = readJson(diagnosticsPath, "PGC_R05_DIAGNOSTICS_MISSING");`,
    `function reconcile() {
  const previousReport = fs.existsSync(reportPath)
    ? JSON.parse(fs.readFileSync(reportPath, "utf8"))
    : null;
  const previousTransitionIsAuthoritative = previousReport?.taskId === TASK_ID
    && Array.isArray(previousReport.reconciledRouteIds)
    && previousReport.reconciledRouteIds.length === EXPECTED_LEGAL_APPLICATION_ROUTES;
  const contract = readJson(contractPath, "PGC_R05_CAPACITY_CONTRACT_MISSING");
  const diagnostics = readJson(diagnosticsPath, "PGC_R05_DIAGNOSTICS_MISSING");`,
    "previous-report-load",
  );

  source = replaceRequired(
    source,
    `    applicationBefore,
    applicationAfter,
    overallSummaryAfter: clone(contract.summary),
    reconciledRouteIds,
    changedBindingIds,
    boundary,`,
    `    applicationBefore: previousTransitionIsAuthoritative
      ? clone(previousReport.applicationBefore)
      : applicationBefore,
    applicationAfter,
    overallSummaryAfter: clone(contract.summary),
    reconciledRouteIds,
    changedBindingIds: previousTransitionIsAuthoritative
      ? unique([...safeArray(previousReport.changedBindingIds), ...changedBindingIds])
      : changedBindingIds,
    boundary: previousTransitionIsAuthoritative
      ? clone(previousReport.boundary)
      : boundary,
    replayValidation: {
      currentApplicationBefore: applicationBefore,
      currentChangedBindingCount: changedBindingIds.length,
      currentBoundary: boundary,
      firstTransitionHistoryPreserved: previousTransitionIsAuthoritative,
    },`,
    "stable-report-history",
  );

  source = `${source.trimEnd()}\n\n// ${marker}\n`;
  fs.writeFileSync(filePath, source);
  const result = Object.freeze({
    status: "PASS_PGC_R05_IDEMPOTENT_HISTORY_PATCH_APPLIED",
    changedFiles: Object.freeze([relativePath]),
    firstTransitionHistoryPreserved: true,
    replayValidationRecorded: true,
  });
  console.log(`PGC_R05_IDEMPOTENT_HISTORY_PATCH=${JSON.stringify(result)}`);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) applyPgcR05IdempotentHistoryPatch();
