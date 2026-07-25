import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  auditP01D1BatchASelectorComposition,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  G5B_U05_PATTERN_SPEC_IDS,
  G5B_U05_SOURCE_ID,
  validateP01D1PatternDefinitions,
} from "../../site/modules/curriculum/batch-a/source-pattern-full-product-p01d1-extension.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { validateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-u08-extension.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import { materializeP01AW1ProductAdmissionInventory } from "../../src/curriculum/full-product/p01-w1-product-admission-inventory.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const AUTHORITY_PATH = "data/curriculum/full-product/p01d1/g5b-u05-large-number-pattern-authority.json";
const EXPECTED_KP_IDS = Object.freeze([
  "kp_g5b_u05a_large_number_place_value_extension",
  "kp_g5b_u05a_large_number_read_write",
  "kp_g5b_u05a_power_of_ten_scaling",
  "kp_g5b_u05a_large_number_decompose_compare",
]);
const EXCLUDED_KP_ID = "kp_g5b_u05a_decimal_base10_structure";

function issue(code, details = {}) {
  return Object.freeze({ code, ...details });
}

function sourceOptions(overrides = {}) {
  return {
    sourceId: G5B_U05_SOURCE_ID,
    selectionMode: "sourceUnit",
    questionCount: 16,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "p01d1-validator",
    printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true },
    ...overrides,
  };
}

export function validateP01D1G5BU05LargeNumber() {
  const errors = [];
  const authority = JSON.parse(fs.readFileSync(path.join(ROOT, AUTHORITY_PATH), "utf8"));
  const selector = auditP01D1BatchASelectorComposition();
  const definitions = validateP01D1PatternDefinitions();
  errors.push(...selector.errors.map((code) => issue(code)));
  errors.push(...definitions.errors.map((code) => issue(code)));

  if (authority.counts?.knowledgePoints !== 4 || authority.counts?.formalMappings !== 4
    || authority.counts?.patternGroups !== 4 || authority.counts?.patternSpecs !== 8) {
    errors.push(issue("P01D1_AUTHORITY_COUNTS_INVALID", { counts: authority.counts }));
  }
  const authorityKpIds = authority.knowledgePoints.map((row) => row.knowledgePointId).sort();
  if (JSON.stringify(authorityKpIds) !== JSON.stringify([...EXPECTED_KP_IDS].sort())) errors.push(issue("P01D1_AUTHORITY_KP_SET_INVALID"));
  if (!authority.scope?.excludedKnowledgePointIds?.includes(EXCLUDED_KP_ID)) errors.push(issue("P01D1_DECIMAL_SCOPE_EXCLUSION_MISSING"));
  if (getVisibleBatchAKnowledgePoint(EXCLUDED_KP_ID) !== null) errors.push(issue("P01D1_DECIMAL_KP_VISIBLE"));

  for (const knowledgePointId of EXPECTED_KP_IDS) {
    const row = getVisibleBatchAKnowledgePoint(knowledgePointId);
    const groups = getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
    if (!row || row.sourceId !== G5B_U05_SOURCE_ID) errors.push(issue("P01D1_VISIBLE_KP_MISSING", { knowledgePointId }));
    if (groups.length !== 1 || groups[0].patternSpecIds.length !== 2) errors.push(issue("P01D1_KP_PATTERN_BINDING_INVALID", { knowledgePointId }));
  }

  const generated = generateBatchABrowserQuestions(sourceOptions());
  if (!generated.ok || generated.questions.length !== 16) errors.push(issue("P01D1_GENERATION_INVALID", { generationErrors: generated.errors }));
  const generatedSpecIds = [...new Set(generated.questions.map((question) => question.patternSpecId))].sort();
  if (JSON.stringify(generatedSpecIds) !== JSON.stringify([...G5B_U05_PATTERN_SPEC_IDS].sort())) errors.push(issue("P01D1_PATTERN_COVERAGE_INVALID"));
  const questionValidation = validateBatchABrowserQuestions(generated.questions);
  if (!questionValidation.ok) errors.push(issue("P01D1_QUESTION_VALIDATION_FAILED", { validationErrors: questionValidation.errors }));

  const worksheet = buildBatchABrowserWorksheetDocument(sourceOptions());
  if (!worksheet.ok || worksheet.worksheetDocument?.generatedQuestions?.length !== 16
    || worksheet.worksheetDocument?.answerKeyItems?.length !== 16
    || worksheet.worksheetDocument?.questionPages?.length < 1
    || worksheet.worksheetDocument?.answerKeyPages?.length < 1) {
    errors.push(issue("P01D1_WORKSHEET_VERTICAL_SLICE_INVALID", { worksheetErrors: worksheet.errors }));
  }
  let html = "";
  if (worksheet.worksheetDocument) html = renderWorksheetDocumentToHtml(worksheet.worksheetDocument, { stylesheetHref: "" });
  if (!html.includes("worksheet-page--questions") || !html.includes("worksheet-page--answer-key")) errors.push(issue("P01D1_HTML_RENDER_INVALID"));

  const inventory = materializeP01AW1ProductAdmissionInventory();
  if (inventory.metrics.knowledgePointCount !== 21
    || inventory.metrics.admissionReadyExistingPublicPatternCount !== 4
    || inventory.metrics.publicProductVerticalSliceRequiredCount !== 17
    || inventory.metrics.publicSourceSelectableCount !== 1) {
    errors.push(issue("P01D1_W1_INVENTORY_DELTA_INVALID", { metrics: inventory.metrics }));
  }

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    summary: Object.freeze({
      sourceId: G5B_U05_SOURCE_ID,
      knowledgePointCount: EXPECTED_KP_IDS.length,
      patternGroupCount: 4,
      patternSpecCount: G5B_U05_PATTERN_SPEC_IDS.length,
      generatedQuestionCount: generated.questions.length,
      worksheetQuestionCount: worksheet.worksheetDocument?.generatedQuestions?.length ?? 0,
      answerKeyItemCount: worksheet.worksheetDocument?.answerKeyItems?.length ?? 0,
      questionPageCount: worksheet.worksheetDocument?.questionPages?.length ?? 0,
      answerKeyPageCount: worksheet.worksheetDocument?.answerKeyPages?.length ?? 0,
      w1AdmittedCount: inventory.metrics.admissionReadyExistingPublicPatternCount,
      w1RemainingCount: inventory.metrics.publicProductVerticalSliceRequiredCount,
      excludedKnowledgePointId: EXCLUDED_KP_ID,
    }),
  });
}

export function runP01D1G5BU05LargeNumberCli() {
  const report = validateP01D1G5BU05LargeNumber();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.ok) process.exitCode = 1;
  return report;
}

const isCli = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) runP01D1G5BU05LargeNumberCli();
