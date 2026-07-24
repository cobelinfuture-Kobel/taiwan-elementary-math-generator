import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { listBatchASourceUnits } from "../../site/modules/curriculum/batch-a/source-units.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s73-extension.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CONTRACT_PATH = path.join(ROOT, "data/curriculum/public/15-unit-public-worksheet-closeout.json");

function readContract() {
  return JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));
}

function basePlan(sourceId, questionMode = "numeric") {
  return {
    sourceId,
    questionCount: 6,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: `closeout-${sourceId}-${questionMode}`,
    selectionMode: "sourceUnit",
    selectedKnowledgePointIds: [],
    selectedPatternGroupIds: [],
    questionMode,
    depthMode: "mixed",
    contextMode: "mixed",
    printLayout: {
      paperSize: "A4",
      columns: 2,
      rowsPerPage: 3,
      showAnswerKeyPage: true,
      showQuestionNumbers: true,
    },
  };
}

function safeBuild(plan) {
  try {
    return buildWorksheetDocumentFromPlan(plan);
  } catch (error) {
    return {
      ok: false,
      errors: [{ code: "CLOSEOUT_BUILD_THROW", message: String(error?.stack ?? error) }],
      worksheetDocument: null,
    };
  }
}

function questionsOf(document) {
  const candidates = [document?.generatedQuestions, document?.questions, document?.items];
  return candidates.find(Array.isArray) ?? [];
}

function questionCountOf(document) {
  return document?.summary?.questionCount
    ?? document?.report?.summary?.questionCount
    ?? document?.questionCount
    ?? questionsOf(document).length
    ?? 0;
}

function answerKeyPass(document) {
  if (Array.isArray(document?.answerKeyPages) && document.answerKeyPages.length > 0) return true;
  if (Array.isArray(document?.answerKeyItems) && document.answerKeyItems.length > 0) return true;
  if (typeof document?.dynamicHtml === "string" && /answer[-_ ]?key|答案/i.test(document.dynamicHtml)) return true;
  return false;
}

function renderHtml(document) {
  if (!document) return "";
  if (typeof document.dynamicHtml === "string" && document.dynamicHtml.includes("<html")) return document.dynamicHtml;
  try {
    return renderWorksheetDocumentToHtml(document, {
      title: document.title ?? "15-unit public worksheet closeout",
      stylesheetHref: "./assets/styles/print-styles.css",
      debugDataAttributes: true,
    });
  } catch {
    return "";
  }
}

function groupMode(group) {
  return [group?.mode, group?.publicQuestionMode, group?.questionMode, group?.representationTag, ...(group?.representationTags ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function isApplicationGroup(group) {
  const corpus = groupMode(group);
  return corpus.includes("application") || corpus.includes("word_problem") || corpus.includes("semantic");
}

function isPblGroup(group) {
  return JSON.stringify(group).toLowerCase().includes("pbl");
}

function buildModePlan(sourceId, groups, mode) {
  if (groups.length === 0) return basePlan(sourceId, mode);
  const knowledgePointIds = [...new Set(groups.flatMap((group) => [group.primaryKnowledgePointId, ...(group.knowledgePointIds ?? [])]).filter(Boolean))];
  return {
    ...basePlan(sourceId, mode),
    selectionMode: knowledgePointIds.length > 1 ? "mixedKnowledgePointsSameUnit" : "singleKnowledgePoint",
    selectedKnowledgePointIds: knowledgePointIds,
    selectedPatternGroupIds: groups.map((group) => group.patternGroupId).filter(Boolean),
  };
}

function modeEvidence(document, mode) {
  const normalized = mode.toUpperCase();
  const questionCorpus = questionsOf(document).map((question) => JSON.stringify(question)).join("\n").toUpperCase();
  const documentCorpus = JSON.stringify({
    publicControls: document?.publicControls,
    semanticSummary: document?.semanticSummary,
    metadata: document?.metadata,
    pblTaskSetRecords: document?.pblTaskSetRecords,
    sections: document?.sections,
  }).toUpperCase();
  if (normalized === "APPLICATION") {
    return questionCorpus.includes("APPLICATION")
      || questionCorpus.includes("WORD_PROBLEM")
      || documentCorpus.includes("APPLICATION");
  }
  if (normalized === "PBL") {
    return questionCorpus.includes("PBL")
      || documentCorpus.includes("PBL")
      || documentCorpus.includes("DRIVINGPROBLEM");
  }
  return false;
}

function globalContextEvidence(document) {
  const corpus = JSON.stringify(document ?? {}).toLowerCase();
  return corpus.includes("globalcontext")
    || corpus.includes("contextlineage")
    || corpus.includes("atomiccontext")
    || corpus.includes("sdgtags")
    || corpus.includes("global_context");
}

function issuesOf(result) {
  return [...(result?.errors ?? []), ...(result?.validation?.errors ?? [])].map((issue) => (
    typeof issue === "string" ? issue : issue?.code ?? issue?.message ?? JSON.stringify(issue)
  ));
}

export function auditFifteenUnitPublicWorksheetCloseout() {
  const contract = readContract();
  const sourceUnits = listBatchASourceUnits({ includePublicCandidates: true });
  const sourceById = new Map(sourceUnits.map((unit) => [unit.sourceId, unit]));
  const visibleKnowledgePoints = listVisibleBatchAKnowledgePoints();
  const rows = [];

  for (const expected of contract.units) {
    const unit = sourceById.get(expected.sourceId) ?? null;
    const knowledgePoints = visibleKnowledgePoints.filter((row) => row.sourceId === expected.sourceId);
    const groups = knowledgePoints.flatMap((knowledgePoint) => getVisiblePatternGroupsForKnowledgePoint(knowledgePoint.knowledgePointId));
    const uniqueGroups = [...new Map(groups.map((group) => [group.patternGroupId, group])).values()];
    const applicationGroups = uniqueGroups.filter(isApplicationGroup);
    const pblGroups = uniqueGroups.filter(isPblGroup);

    const numeric = safeBuild(basePlan(expected.sourceId, "numeric"));
    const numericDocument = numeric.worksheetDocument;
    const numericHtml = renderHtml(numericDocument);

    const application = expected.applicationRequired
      ? safeBuild(buildModePlan(expected.sourceId, applicationGroups, "application"))
      : { ok: true, worksheetDocument: null, errors: [] };
    const applicationDocument = application.worksheetDocument;

    const pbl = expected.pblRequired
      ? safeBuild(buildModePlan(expected.sourceId, pblGroups, "reasoning"))
      : { ok: true, worksheetDocument: null, errors: [] };
    const pblDocument = pbl.worksheetDocument;

    const checks = {
      publicSelectable: Boolean(unit),
      numericWorksheet: Boolean(numeric.ok && numericDocument && questionCountOf(numericDocument) > 0),
      validatorPass: Boolean(numeric.ok && issuesOf(numeric).length === 0),
      answerKey: Boolean(numericDocument && answerKeyPass(numericDocument)),
      htmlPreview: Boolean(numericHtml.includes("<html") && numericHtml.includes("worksheet")),
      browserPrintData: Boolean(numericHtml.length > 0 && numericDocument?.configSnapshot?.printLayout),
      applicationWorksheet: expected.applicationRequired
        ? Boolean(application.ok && applicationDocument && modeEvidence(applicationDocument, "APPLICATION"))
        : true,
      globalContextRuntime: expected.applicationRequired
        ? Boolean(applicationDocument && globalContextEvidence(applicationDocument))
        : true,
      pblWorksheet: expected.pblRequired
        ? Boolean(pbl.ok && pblDocument && modeEvidence(pblDocument, "PBL"))
        : true,
    };

    const blockers = Object.entries(checks).filter(([, pass]) => !pass).map(([name]) => name);
    rows.push({
      ...expected,
      visibleKnowledgePointCount: knowledgePoints.length,
      visiblePatternGroupCount: uniqueGroups.length,
      applicationPatternGroupCount: applicationGroups.length,
      pblPatternGroupCount: pblGroups.length,
      numericQuestionCount: questionCountOf(numericDocument),
      applicationQuestionCount: questionCountOf(applicationDocument),
      pblQuestionCount: questionCountOf(pblDocument),
      checks,
      blockers,
      errors: {
        numeric: issuesOf(numeric),
        application: issuesOf(application),
        pbl: issuesOf(pbl),
      },
    });
  }

  const metrics = {
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

  const closeoutComplete = metrics.unitCount === contract.scopePolicy.unitCount
    && metrics.publicSelectable === metrics.unitCount
    && metrics.numericWorksheetPass === metrics.unitCount
    && metrics.validatorPass === metrics.unitCount
    && metrics.answerKeyPass === metrics.unitCount
    && metrics.htmlPreviewPass === metrics.unitCount
    && metrics.browserPrintDataPass === metrics.unitCount
    && metrics.applicationPass === metrics.applicationRequired
    && metrics.globalContextPass === metrics.applicationRequired
    && metrics.pblPass === metrics.pblRequired
    && metrics.blockingFindingCount === 0;

  return Object.freeze({
    schemaName: "FifteenUnitPublicWorksheetCloseoutAuditV1",
    programId: contract.programId,
    status: closeoutComplete ? "D0_PUBLIC_WORKSHEET_CLOSEOUT_PASS" : "BLOCKED_BY_PRODUCT_GAPS",
    closeoutComplete,
    metrics: Object.freeze(metrics),
    rows: Object.freeze(rows),
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = auditFifteenUnitPublicWorksheetCloseout();
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.closeoutComplete ? 0 : 1;
}
