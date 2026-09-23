import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { materializeR07AuthoritativeConsumerCutover } from "../../src/curriculum/global/r07-authoritative-consumer-cutover.mjs";
import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { auditFifteenUnitPublicWorksheetCloseout } from "./audit-15-unit-public-worksheet-closeout-v2.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../..");
const CONTRACT_PATH = path.join(ROOT, "data/curriculum/public/15-unit-public-worksheet-closeout.json");
const POLICY_PATH = path.join(ROOT, "data/curriculum/global/closeout/r08/15-unit-global-migration-closeout-policy.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function freezeArray(values) {
  return Object.freeze([...values]);
}

function issue(code, details = {}) {
  return Object.freeze({ code, ...details });
}

function cases(contract) {
  return contract.units.flatMap((unit) => [
    { ...unit, questionMode: "numeric" },
    { ...unit, questionMode: "application" },
    ...(unit.pblRequired ? [{ ...unit, questionMode: "pbl" }] : []),
  ]);
}

function plan(testCase) {
  return {
    sourceId: testCase.sourceId,
    questionCount: testCase.questionMode === "pbl" ? 2 : 4,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: `r08-${testCase.sourceId}-${testCase.questionMode}`,
    selectionMode: "sourceUnit",
    selectedKnowledgePointIds: [],
    selectedPatternGroupIds: [],
    questionMode: testCase.questionMode,
    depthMode: "mixed",
    contextMode: "mixed",
    printLayout: {
      paperSize: "A4",
      columns: testCase.questionMode === "pbl" ? 1 : 2,
      rowsPerPage: testCase.questionMode === "pbl" ? 1 : 4,
      showAnswerKeyPage: true,
      showQuestionNumbers: true,
    },
  };
}

function questionCount(document) {
  return document?.summary?.questionCount
    ?? document?.report?.summary?.questionCount
    ?? document?.questionCount
    ?? document?.questions?.length
    ?? document?.generatedQuestions?.length
    ?? 0;
}

function answerKeyCount(document) {
  return document?.answerKeyItems?.length
    ?? document?.answerKeyPages?.reduce((sum, page) => sum + (page?.cells ?? []).filter((cell) => cell?.cellType !== "filler").length, 0)
    ?? 0;
}

function authorityEvidence(document) {
  const metadata = document?.metadata?.r07AuthoritativeConsumerCutover;
  const config = document?.configSnapshot?.globalAuthorityCutover;
  const publicMode = document?.publicControls?.authorityMode;
  const authorityMode = metadata?.authorityMode ?? config?.authorityMode ?? null;
  const legacyAuthorityRole = metadata?.legacyAuthorityRole ?? config?.legacyAuthorityRole ?? null;
  return Object.freeze({
    authorityMode,
    legacyAuthorityRole,
    metadataPresent: Boolean(metadata),
    configSnapshotPresent: Boolean(config),
    publicControlsAuthorityMode: publicMode ?? null,
    valid: authorityMode === "GLOBAL_PRIMARY"
      && legacyAuthorityRole === "COMPATIBILITY_ALIAS_READ_ONLY"
      && metadata?.authorityMode === "GLOBAL_PRIMARY"
      && config?.authorityMode === "GLOBAL_PRIMARY"
      && publicMode === "GLOBAL_PRIMARY",
  });
}

export function validateR08FifteenUnitGlobalMigrationCloseout() {
  const contract = readJson(CONTRACT_PATH);
  const policy = readJson(POLICY_PATH);
  const r07 = materializeR07AuthoritativeConsumerCutover();
  const productAudit = auditFifteenUnitPublicWorksheetCloseout();
  const errors = [];
  const rows = [];

  if (r07.mainlineBoundary.globalAuthorityPrimary !== true) errors.push(issue("R08_R07_GLOBAL_AUTHORITY_NOT_PRIMARY"));
  if (r07.mainlineBoundary.legacyAuthorityRole !== "COMPATIBILITY_ALIAS_READ_ONLY") errors.push(issue("R08_LEGACY_AUTHORITY_ROLE_INVALID"));
  if (r07.metrics.productUnitCount !== 15 || r07.metrics.identityParityFailureCount !== 0) {
    errors.push(issue("R08_R07_IDENTITY_PARITY_INVALID", { metrics: r07.metrics }));
  }
  if (!productAudit.closeoutComplete) errors.push(issue("R08_15_UNIT_PRODUCT_AUDIT_FAILED", { metrics: productAudit.metrics }));

  for (const testCase of cases(contract)) {
    let result;
    try {
      result = buildWorksheetDocumentFromPlan(plan(testCase));
    } catch (error) {
      errors.push(issue("R08_WORKSHEET_BUILD_THROW", {
        sourceId: testCase.sourceId,
        questionMode: testCase.questionMode,
        message: String(error?.stack ?? error),
      }));
      continue;
    }
    const document = result?.worksheetDocument;
    const authority = authorityEvidence(document);
    const row = Object.freeze({
      sourceId: testCase.sourceId,
      unitCode: testCase.unitCode,
      questionMode: testCase.questionMode,
      resultOk: result?.ok === true,
      questionCount: questionCount(document),
      answerKeyCount: answerKeyCount(document),
      authority,
    });
    rows.push(row);
    if (!result?.ok || !document) errors.push(issue("R08_WORKSHEET_BUILD_FAILED", row));
    if (row.questionCount <= 0) errors.push(issue("R08_QUESTION_COUNT_EMPTY", row));
    if (row.answerKeyCount <= 0) errors.push(issue("R08_ANSWER_KEY_EMPTY", row));
    if (!authority.valid) errors.push(issue("R08_GLOBAL_AUTHORITY_METADATA_INVALID", row));
  }

  const summary = Object.freeze({
    unitCount: contract.units.length,
    expectedCaseCount: policy.scope.totalChromiumCaseCount,
    actualCaseCount: rows.length,
    numericCasePass: rows.filter((row) => row.questionMode === "numeric" && row.resultOk && row.authority.valid).length,
    applicationCasePass: rows.filter((row) => row.questionMode === "application" && row.resultOk && row.authority.valid).length,
    pblCasePass: rows.filter((row) => row.questionMode === "pbl" && row.resultOk && row.authority.valid).length,
    answerKeyCasePass: rows.filter((row) => row.answerKeyCount > 0).length,
    globalAuthorityMetadataPass: rows.filter((row) => row.authority.valid).length,
    productAuditCloseoutComplete: productAudit.closeoutComplete,
    productAuditBlockingFindingCount: productAudit.metrics.blockingFindingCount,
  });

  if (summary.unitCount !== 15) errors.push(issue("R08_UNIT_COUNT_INVALID", { actual: summary.unitCount }));
  if (summary.actualCaseCount !== 35) errors.push(issue("R08_CASE_COUNT_INVALID", { actual: summary.actualCaseCount }));
  if (summary.numericCasePass !== 15) errors.push(issue("R08_NUMERIC_CASE_PASS_INVALID", { actual: summary.numericCasePass }));
  if (summary.applicationCasePass !== 15) errors.push(issue("R08_APPLICATION_CASE_PASS_INVALID", { actual: summary.applicationCasePass }));
  if (summary.pblCasePass !== 5) errors.push(issue("R08_PBL_CASE_PASS_INVALID", { actual: summary.pblCasePass }));
  if (summary.answerKeyCasePass !== 35) errors.push(issue("R08_ANSWER_KEY_CASE_PASS_INVALID", { actual: summary.answerKeyCasePass }));
  if (summary.globalAuthorityMetadataPass !== 35) errors.push(issue("R08_GLOBAL_AUTHORITY_CASE_PASS_INVALID", { actual: summary.globalAuthorityMetadataPass }));
  if (policy.closeoutSemantics.closesFullProductLine !== false
    || policy.closeoutSemantics.recursiveImprovementAdminStartAllowedAfter !== "P10_FullUIHTMLPDFPrintProductCloseout") {
    errors.push(issue("R08_FULL_PRODUCT_SEQUENCE_INVALID"));
  }

  return Object.freeze({
    ok: errors.length === 0,
    errors: freezeArray(errors),
    summary,
    rows: freezeArray(rows),
    productAudit,
  });
}

export function runR08FifteenUnitGlobalMigrationCloseoutCli() {
  const report = validateR08FifteenUnitGlobalMigrationCloseout();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.ok) process.exitCode = 1;
  return report;
}

const isCli = process.argv[1]
  && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) runR08FifteenUnitGlobalMigrationCloseoutCli();
