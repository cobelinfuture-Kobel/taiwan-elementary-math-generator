import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { materializeR07AuthoritativeConsumerCutover } from "../../src/curriculum/global/r07-authoritative-consumer-cutover.mjs";
import { validateR07BrowserAuthorityRegistry } from "../../site/modules/curriculum/global/r07-authoritative-consumer-cutover.js";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../..");

function error(code, details = {}) {
  return Object.freeze({ code, ...details });
}

function sameSet(left, right) {
  if (left.length !== right.length) return false;
  const rightSet = new Set(right);
  return left.every((value) => rightSet.has(value));
}

export function validateR07AuthoritativeConsumerCutover(candidate = materializeR07AuthoritativeConsumerCutover()) {
  const errors = [];
  const metrics = candidate.metrics ?? {};
  const expectedUnitIds = candidate.policy?.publicBaseline?.productUnitIds ?? [];
  const actualUnitIds = (candidate.authorityUnits ?? []).map((row) => row.productUnitId);

  if (metrics.productUnitCount !== 15) errors.push(error("R07_PRODUCT_UNIT_COUNT_INVALID", { actual: metrics.productUnitCount }));
  if (metrics.sourceNodeCount !== 16) errors.push(error("R07_SOURCE_NODE_COUNT_INVALID", { actual: metrics.sourceNodeCount }));
  if (metrics.globalKnowledgePointCount !== 156) errors.push(error("R07_GLOBAL_KP_COUNT_INVALID", { actual: metrics.globalKnowledgePointCount }));
  if (metrics.globalModelReconciliationCount !== 9) errors.push(error("R07_RECONCILIATION_COUNT_INVALID", { actual: metrics.globalModelReconciliationCount }));
  if (metrics.globalPrimaryUnitCount !== 15) errors.push(error("R07_GLOBAL_PRIMARY_UNIT_COUNT_INVALID", { actual: metrics.globalPrimaryUnitCount }));
  if (metrics.identityParityFailureCount !== 0) errors.push(error("R07_IDENTITY_PARITY_FAILED", { actual: metrics.identityParityFailureCount }));
  if (!sameSet(actualUnitIds, expectedUnitIds)) errors.push(error("R07_BASELINE_UNIT_SET_INVALID"));

  for (const unit of candidate.authorityUnits ?? []) {
    if (unit.authorityMode !== "GLOBAL_PRIMARY") errors.push(error("R07_GLOBAL_AUTHORITY_NOT_PRIMARY", { productUnitId: unit.productUnitId }));
    if (unit.legacyAuthorityRole !== "COMPATIBILITY_ALIAS_READ_ONLY") errors.push(error("R07_LEGACY_AUTHORITY_ROLE_INVALID", { productUnitId: unit.productUnitId }));
    if (unit.cutoverState !== "PRODUCTION_AUTHORITY_CUTOVER_ADMITTED") errors.push(error("R07_UNIT_CUTOVER_NOT_ADMITTED", { productUnitId: unit.productUnitId }));
    if (!unit.identityParity?.sourceIdsPreserved
      || !unit.identityParity?.knowledgePointIdsPreserved
      || !unit.identityParity?.patternSpecAndQuestionIdsPreserved
      || !unit.identityParity?.currentProductionUsePreserved) {
      errors.push(error("R07_UNIT_IDENTITY_PARITY_INVALID", { productUnitId: unit.productUnitId }));
    }
    if (!unit.compatibilityScopeFence?.existingLegacyPatternsRemainProductionAllowed
      || !unit.compatibilityScopeFence?.newGlobalPatternsRequireCompleteCapabilities) {
      errors.push(error("R07_SCOPE_FENCE_INVALID", { productUnitId: unit.productUnitId }));
    }
  }

  const boundary = candidate.mainlineBoundary ?? {};
  if (boundary.productionConsumerPathChanged !== false) errors.push(error("R07_PUBLIC_ENTRY_POINT_CHANGED"));
  if (boundary.productionAuthorityChanged !== true || boundary.globalAuthorityPrimary !== true) {
    errors.push(error("R07_PRODUCTION_AUTHORITY_NOT_CUT_OVER"));
  }
  if (boundary.legacyAuthorityRole !== "COMPATIBILITY_ALIAS_READ_ONLY") errors.push(error("R07_LEGACY_ROLE_NOT_READ_ONLY_ALIAS"));
  if (boundary.dualReadIdentityParityVerified !== true) errors.push(error("R07_DUAL_READ_PARITY_NOT_VERIFIED"));
  if (boundary.existing15UnitProductionUsePreserved !== true) errors.push(error("R07_EXISTING_PRODUCT_USE_NOT_PRESERVED"));
  if (boundary.visibleOutputChangeExpected !== false) errors.push(error("R07_VISIBLE_OUTPUT_CHANGE_DECLARED"));
  if (boundary.parallelRuntimePipelineAllowed !== false) errors.push(error("R07_PARALLEL_RUNTIME_ALLOWED"));
  if (boundary.uiHtmlPdfParityDeferredTo !== "R08_15UnitGlobalMigrationUIHTMLPDFCloseout") {
    errors.push(error("R07_R08_HANDOFF_INVALID"));
  }
  if (boundary.fullProductLineCloseTask !== "P10_FullUIHTMLPDFPrintProductCloseout"
    || boundary.recursiveImprovementAdminDeferredUntil !== "P10_FullUIHTMLPDFPrintProductCloseout") {
    errors.push(error("R07_FULL_PRODUCT_BEFORE_ADMIN_SEQUENCE_INVALID"));
  }

  const browser = validateR07BrowserAuthorityRegistry();
  if (!browser.ok) {
    errors.push(...browser.errors.map((code) => error(code)));
  }

  const consumerPath = boundary.currentProductionConsumer;
  const consumerSource = typeof consumerPath === "string"
    ? fs.readFileSync(path.join(ROOT, consumerPath), "utf8")
    : "";
  const cutoverCall = consumerSource.indexOf("const cutover = applyR07AuthoritativeConsumerCutover(requestedPlan)");
  const productionCall = consumerSource.indexOf("buildCoreWorksheetDocumentFromPlan(plan)");
  if (!consumerSource.includes("r07-authoritative-consumer-cutover.js")) errors.push(error("R07_CONSUMER_IMPORT_MISSING"));
  if (cutoverCall < 0 || productionCall < 0 || cutoverCall > productionCall) errors.push(error("R07_CONSUMER_ORDER_INVALID"));
  if (!consumerSource.includes("authorityMode: \"GLOBAL_PRIMARY\"")) errors.push(error("R07_OUTPUT_METADATA_MISSING"));

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    summary: Object.freeze({
      productUnitCount: metrics.productUnitCount ?? 0,
      sourceNodeCount: metrics.sourceNodeCount ?? 0,
      globalKnowledgePointCount: metrics.globalKnowledgePointCount ?? 0,
      legacyQuestionBindingCount: metrics.legacyQuestionBindingCount ?? 0,
      globalModelReconciliationCount: metrics.globalModelReconciliationCount ?? 0,
      browserAuthorityUnitCount: browser.affectedUnitCount ?? 0,
      identityParityFailureCount: metrics.identityParityFailureCount ?? 0,
    }),
  });
}

export function runR07AuthoritativeConsumerCutoverCli() {
  const report = validateR07AuthoritativeConsumerCutover();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.ok) process.exitCode = 1;
  return report;
}

const isCli = process.argv[1]
  && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) runR07AuthoritativeConsumerCutoverCli();
