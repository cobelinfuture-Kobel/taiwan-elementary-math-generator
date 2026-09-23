import { QUESTION_KINDS, SUPPORT_STATUSES } from "../../core/constants.js";
import { paginateAnswerKeyItems, paginateQuestionDisplayModels } from "../../core/worksheet-pagination.js";
import { renderWorksheetDocumentToHtml } from "../../renderer/html-renderer.js";
import { findBatchAPatternSpecRow } from "../generator/batch-a-generator.js";
import { validateBatchAScope, validateBatchAItem } from "../validator/batch-a-validator.js";
import { BATCH_A_WORKSHEET_OUTPUT_STATUS } from "./batch-a-worksheet-output.js";

const ITEMS = [
  { id: "ps_g3a_u01_4digit_compare", left: 4826, right: 4915, sourceId: "g3a_u01_3a01", prompt: "比較 4826 和 4915，填入 >、< 或 =。" },
  { id: "ps_g4a_u01_compare_8digit", left: 23456789, right: 23465789, sourceId: "g4a_u01_4a01", prompt: "比較 23456789 和 23465789，填入 >、< 或 =。" }
];

const PRINT_LAYOUT = { paperSize: "A4", columns: 4, rowsPerPage: 10, showQuestionNumbers: true, showAnswerKeyPage: true };
const S40C_PRODUCTION_USE = BATCH_A_WORKSHEET_OUTPUT_STATUS.PRODUCTION_USE_ALLOWED;

function compareAnswer(left, right) {
  return left > right ? ">" : left < right ? "<" : "=";
}

function selectItems(patternSpecIds) {
  if (!Array.isArray(patternSpecIds) || patternSpecIds.length === 0) return ITEMS;
  const allowed = new Set(patternSpecIds);
  return ITEMS.filter((item) => allowed.has(item.id));
}

function validateItem(item) {
  const row = findBatchAPatternSpecRow(item.id);
  const expected = compareAnswer(item.left, item.right);
  const scope = validateBatchAScope({
    sourceId: item.sourceId,
    questionKind: QUESTION_KINDS.COMPARE,
    supportStatus: [SUPPORT_STATUSES.V1_EXPRESSION_SUPPORTED]
  });
  const answer = validateBatchAItem({ questionKind: QUESTION_KINDS.COMPARE, answerModel: "comparisonAnswer", left: item.left, right: item.right, answer: expected });
  return {
    ok: Boolean(row) && row?.readiness === "ready" && scope.ok && answer.ok,
    row,
    expected,
    errors: [
      ...(row ? [] : [{ code: "S39E_ROW_NOT_FOUND", severity: "error", path: "patternSpecId", message: item.id }]),
      ...(row?.readiness === "ready" ? [] : [{ code: "S39E_ROW_NOT_READY", severity: "error", path: "readiness", message: item.id }]),
      ...scope.errors,
      ...answer.errors
    ],
    warnings: [...scope.warnings, ...answer.warnings]
  };
}

function buildModels(items) {
  const displayModels = [];
  const answerKeyItems = [];
  const generatedQuestions = [];
  const errors = [];
  const warnings = [];
  for (const [index, item] of items.entries()) {
    const result = validateItem(item);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
    if (!result.ok) continue;
    const questionNumber = index + 1;
    const questionId = `s39e-${item.id}`;
    const displayText = `${item.prompt} 答：${result.expected}`;
    const blankedDisplayText = `${item.prompt} 答：___`;
    const metadata = {
      patternId: item.id,
      patternTags: ["batch_a", "s39e", item.sourceId, item.id],
      skillTags: ["integer_comparison", "number_sense"],
      difficultyTags: ["s39e_numbersense_sourceid_coverage"],
      curriculumNodeIds: [item.sourceId],
      canonicalSkillIds: ["integer_comparison"],
      blankTarget: { type: "finalAnswer" },
      duplicateKey: `${item.left}:${item.right}`
    };
    generatedQuestions.push({ id: questionId, promptText: item.prompt, answerText: result.expected, metadata });
    displayModels.push({ questionId, questionNumber, patternId: item.id, displayText, blankedDisplayText, answerText: result.expected, questionNumberText: `${questionNumber}.`, metadataSnapshot: metadata, layoutHints: { estimatedTextLength: displayText.length, hasGrouping: false } });
    answerKeyItems.push({ questionId, questionNumber, patternId: item.id, promptText: displayText, answerText: result.expected, metadataSnapshot: metadata });
  }
  return { ok: errors.length === 0, generatedQuestions, displayModels, answerKeyItems, errors, warnings };
}

export function getS39ENumberSenseCoveragePatternSpecIds() {
  return ITEMS.map((item) => item.id);
}

export function getS39ENumberSenseCoverageSourceIds() {
  return ITEMS.map((item) => item.sourceId);
}

export function buildS39ENumberSenseCoverageWorksheetHtml(options = {}) {
  const patternSpecIds = options.patternSpecIds ?? getS39ENumberSenseCoveragePatternSpecIds();
  const models = buildModels(selectItems(patternSpecIds));
  if (!models.ok) return { ok: false, worksheetDocument: null, html: null, errors: models.errors, warnings: models.warnings };
  const worksheetDocument = {
    schemaVersion: "worksheet-document-v1",
    worksheetId: "s39e-numbersense-sourceid-coverage",
    worksheetKind: "numberSenseWorksheet",
    title: options.title ?? "S39E Batch A number-sense sourceId coverage",
    subtitle: "Batch A production-allowed scope",
    locale: "zh-Hant",
    generatedQuestions: models.generatedQuestions,
    questionDisplayModels: models.displayModels,
    answerKeyItems: models.answerKeyItems,
    questionPages: paginateQuestionDisplayModels(models.displayModels, PRINT_LAYOUT),
    answerKeyPages: paginateAnswerKeyItems(models.answerKeyItems, PRINT_LAYOUT),
    summary: { questionCount: models.generatedQuestions.length },
    studentFields: { showName: true, showDate: true, labels: { name: "姓名", date: "日期" } },
    batchA: { productionUse: S40C_PRODUCTION_USE, patternSpecIds }
  };
  const html = renderWorksheetDocumentToHtml(worksheetDocument, { title: worksheetDocument.title, outputMode: "studentPrint", stylesheetHref: "../../src/renderer/print-styles.css" });
  return { ok: true, worksheetDocument, html, errors: [], warnings: models.warnings };
}
