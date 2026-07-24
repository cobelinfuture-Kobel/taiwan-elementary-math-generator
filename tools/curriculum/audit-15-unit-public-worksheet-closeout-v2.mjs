import { auditFifteenUnitPublicWorksheetCloseout as auditBase } from "./audit-15-unit-public-worksheet-closeout.mjs";
import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";

function pblPlan(sourceId) {
  return {
    sourceId,
    questionCount: 3,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: `closeout-pbl-${sourceId}`,
    selectionMode: "sourceUnit",
    selectedKnowledgePointIds: [],
    selectedPatternGroupIds: [],
    questionMode: "pbl",
    depthMode: "mixed",
    contextMode: "mixed",
    printLayout: {
      paperSize: "A4",
      columns: 1,
      rowsPerPage: 1,
      showAnswerKeyPage: true,
      showQuestionNumbers: true,
    },
  };
}

function pblEvidence(document) {
  const taskSets = document?.pblTaskSetRecords ?? [];
  const questions = document?.questions ?? document?.generatedQuestions ?? [];
  const corpus = JSON.stringify({ taskSets, questions, metadata: document?.metadata }).toUpperCase();
  return Array.isArray(taskSets)
    && taskSets.length > 0
    && taskSets.every((row) => row?.completeProjection === true)
    && corpus.includes("PBL")
    && corpus.includes("GLOBALCONTEXT");
}

function pblQuestionCount(document) {
  return document?.questionCount
    ?? document?.report?.summary?.questionCount
    ?? document?.summary?.questionCount
    ?? document?.questions?.length
    ?? 0;
}

function issueCodes(result) {
  return [...(result?.errors ?? []), ...(result?.validation?.errors ?? [])].map((issue) => (
    typeof issue === "string" ? issue : issue?.code ?? issue?.message ?? JSON.stringify(issue)
  ));
}

function recomputeMetrics(rows) {
  return {
    unitCount: rows.length,
    publicSelectable: rows.filter((row) => row.checks.publicSelectable).length,
    numericWorksheetPass: rows.filter((row) => row.checks.numericWorksheet).length,
    validatorPass: rows.filter((row) => row.checks.validatorPass).length,
    answerKeyPass: rows.filter((row) => row.checks.answerKey).length,
    htmlPreviewPass: rows.filter((row) => row.checks.htmlPreview).length,
    browserPrintDataPass: rows.filter((row) => row.checks.browserPrintData).length,
    applicationRequired: rows.filter((row) => row.applicationRequired).length,
    applicationPass: rows.filter((row) => row.applicationRequired && row.checks.applicationWorksheet).length,
    globalContextPass: rows.filter((row) => row.applicationRequired && row.checks.globalContextRuntime).length,
    pblRequired: rows.filter((row) => row.pblRequired).length,
    pblPass: rows.filter((row) => row.pblRequired && row.checks.pblWorksheet).length,
    blockingFindingCount: rows.reduce((sum, row) => sum + row.blockers.length, 0),
  };
}

function isComplete(metrics) {
  return metrics.unitCount === 15
    && metrics.publicSelectable === 15
    && metrics.numericWorksheetPass === 15
    && metrics.validatorPass === 15
    && metrics.answerKeyPass === 15
    && metrics.htmlPreviewPass === 15
    && metrics.browserPrintDataPass === 15
    && metrics.applicationPass === metrics.applicationRequired
    && metrics.globalContextPass === metrics.applicationRequired
    && metrics.pblPass === metrics.pblRequired
    && metrics.blockingFindingCount === 0;
}

function looksApplication(group) {
  return JSON.stringify(group).toLowerCase().includes("application")
    || JSON.stringify(group).toLowerCase().includes("word_problem");
}

function compactRecord(record) {
  if (!record) return null;
  return {
    keys: Object.keys(record),
    record,
  };
}

function applicationShape(sourceId) {
  const knowledgePoints = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === sourceId);
  const groups = knowledgePoints.flatMap((knowledgePoint) => getVisiblePatternGroupsForKnowledgePoint(knowledgePoint.knowledgePointId).filter(looksApplication));
  const group = groups[0];
  if (!group) return { sourceId, error: "application_group_missing" };
  const selectedKnowledgePointIds = [...new Set([group.primaryKnowledgePointId, ...(group.knowledgePointIds ?? [])].filter(Boolean))];
  let result;
  try {
    result = buildWorksheetDocumentFromPlan({
      sourceId,
      questionCount: 1,
      ordering: "groupedByPattern",
      includeAnswerKey: true,
      generationSeed: `shape-${sourceId}`,
      selectionMode: "singleKnowledgePoint",
      selectedKnowledgePointIds,
      selectedPatternGroupIds: [group.patternGroupId],
      questionMode: "numeric",
      printLayout: { paperSize: "A4", columns: 1, rowsPerPage: 1, showAnswerKeyPage: true },
    });
  } catch (error) {
    return { sourceId, group, error: String(error?.stack ?? error) };
  }
  const document = result?.worksheetDocument;
  const first = document?.generatedQuestions?.[0]
    ?? document?.questions?.[0]
    ?? document?.questionItems?.[0]
    ?? document?.questionRecords?.[0]
    ?? null;
  return {
    sourceId,
    group,
    resultOk: result?.ok,
    resultErrors: issueCodes(result),
    documentKeys: document ? Object.keys(document) : [],
    firstQuestion: compactRecord(first),
    firstDisplayModel: compactRecord(document?.questionDisplayModels?.[0]),
    firstAnswerKeyItem: compactRecord(document?.answerKeyItems?.[0]),
  };
}

export function auditFifteenUnitPublicWorksheetCloseout() {
  const base = auditBase();
  const rows = base.rows.map((row) => {
    if (!row.pblRequired) return row;
    let result;
    try {
      result = buildWorksheetDocumentFromPlan(pblPlan(row.sourceId));
    } catch (error) {
      result = { ok: false, errors: [{ code: "PBL_BUILD_THROW", message: String(error?.stack ?? error) }], worksheetDocument: null };
    }
    const pblPass = Boolean(result?.ok && result?.worksheetDocument && pblEvidence(result.worksheetDocument));
    const checks = { ...row.checks, pblWorksheet: pblPass };
    const blockers = Object.entries(checks).filter(([, pass]) => !pass).map(([name]) => name);
    return {
      ...row,
      pblQuestionCount: pblQuestionCount(result?.worksheetDocument),
      checks,
      blockers,
      errors: { ...row.errors, pbl: issueCodes(result) },
    };
  });
  const metrics = recomputeMetrics(rows);
  const closeoutComplete = isComplete(metrics);
  const debugApplicationShapes = rows
    .filter((row) => row.applicationRequired && !row.checks.applicationWorksheet)
    .map((row) => applicationShape(row.sourceId));
  return Object.freeze({
    schemaName: "FifteenUnitPublicWorksheetCloseoutAuditV2",
    programId: base.programId,
    status: closeoutComplete ? "D0_PUBLIC_WORKSHEET_CLOSEOUT_PASS" : "BLOCKED_BY_PRODUCT_GAPS",
    closeoutComplete,
    metrics: Object.freeze(metrics),
    rows: Object.freeze(rows),
    debugApplicationShapes: Object.freeze(debugApplicationShapes),
  });
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const report = auditFifteenUnitPublicWorksheetCloseout();
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.closeoutComplete ? 0 : 1;
}
