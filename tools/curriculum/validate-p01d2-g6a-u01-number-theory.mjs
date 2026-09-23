import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  auditP01D2BatchASelectorComposition,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  G6A_U01_PATTERN_SPEC_IDS,
  G6A_U01_SOURCE_ID,
  validateP01D2PatternDefinitions,
} from "../../site/modules/curriculum/batch-a/source-pattern-full-product-p01d2-extension.js";
import { listBatchASourceUnits } from "../../site/modules/curriculum/batch-a/source-units.js";
import { listFullProductSourceUnits } from "../../site/modules/curriculum/batch-a/full-product-source-units-p01d2.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { validateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-u08-extension.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import { materializeP01AW1ProductAdmissionInventory } from "../../src/curriculum/full-product/p01-w1-product-admission-inventory.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const AUTHORITY_PATH = "data/curriculum/full-product/p01d2/g6a-u01-number-theory-pattern-authority.json";
const EXPECTED_KP_IDS = Object.freeze([
  "kp_g6a_u01_prime_composite_classification",
  "kp_g6a_u01_prime_factorization",
  "kp_g6a_u01_short_division_common_factors",
  "kp_g6a_u01_greatest_common_factor",
  "kp_g6a_u01_least_common_multiple",
]);

function issue(code, details = {}) { return Object.freeze({ code, ...details }); }

function sourceOptions(overrides = {}) {
  return {
    sourceId: G6A_U01_SOURCE_ID,
    selectionMode: "sourceUnit",
    questionCount: 20,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "p01d2-validator",
    printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true },
    ...overrides,
  };
}

export function validateP01D2G6AU01NumberTheory() {
  const errors = [];
  const authority = JSON.parse(fs.readFileSync(path.join(ROOT, AUTHORITY_PATH), "utf8"));
  const selector = auditP01D2BatchASelectorComposition();
  const definitions = validateP01D2PatternDefinitions();
  errors.push(...selector.errors.map((code) => issue(code)));
  errors.push(...definitions.errors.map((code) => issue(code)));

  if (authority.counts?.knowledgePoints !== 5 || authority.counts?.formalMappings !== 5
    || authority.counts?.patternGroups !== 5 || authority.counts?.patternSpecs !== 10) {
    errors.push(issue("P01D2_AUTHORITY_COUNTS_INVALID", { counts: authority.counts }));
  }
  const authorityKpIds = authority.knowledgePoints.map((row) => row.knowledgePointId).sort();
  if (JSON.stringify(authorityKpIds) !== JSON.stringify([...EXPECTED_KP_IDS].sort())) errors.push(issue("P01D2_AUTHORITY_KP_SET_INVALID"));
  if (authority.scope?.applicationStoryGenerationAllowed !== false) errors.push(issue("P01D2_APPLICATION_SCOPE_NOT_FROZEN"));

  for (const knowledgePointId of EXPECTED_KP_IDS) {
    const row = getVisibleBatchAKnowledgePoint(knowledgePointId);
    const groups = getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
    if (!row || row.sourceId !== G6A_U01_SOURCE_ID) errors.push(issue("P01D2_VISIBLE_KP_MISSING", { knowledgePointId }));
    if (groups.length !== 1 || groups[0].patternSpecIds.length !== 2) errors.push(issue("P01D2_KP_PATTERN_BINDING_INVALID", { knowledgePointId }));
  }

  const protectedFleet = listBatchASourceUnits({ includePublicCandidates: true });
  const fullProductFleet = listFullProductSourceUnits();
  if (protectedFleet.length !== 15 || protectedFleet.some((row) => row.sourceId === G6A_U01_SOURCE_ID)) errors.push(issue("P01D2_PROTECTED_SOURCE_FLEET_CHANGED"));
  if (fullProductFleet.length !== 17 || !fullProductFleet.some((row) => row.sourceId === G6A_U01_SOURCE_ID)) errors.push(issue("P01D2_FULL_PRODUCT_SOURCE_AUTHORITY_INVALID"));

  const generated = generateBatchABrowserQuestions(sourceOptions());
  if (!generated.ok || generated.questions.length !== 20) errors.push(issue("P01D2_GENERATION_INVALID", { generationErrors: generated.errors }));
  const generatedSpecIds = [...new Set(generated.questions.map((question) => question.patternSpecId))].sort();
  if (JSON.stringify(generatedSpecIds) !== JSON.stringify([...G6A_U01_PATTERN_SPEC_IDS].sort())) errors.push(issue("P01D2_PATTERN_COVERAGE_INVALID"));
  const questionValidation = validateBatchABrowserQuestions(generated.questions);
  if (!questionValidation.ok) errors.push(issue("P01D2_QUESTION_VALIDATION_FAILED", { validationErrors: questionValidation.errors }));

  const worksheet = buildBatchABrowserWorksheetDocument(sourceOptions());
  if (!worksheet.ok || worksheet.worksheetDocument?.generatedQuestions?.length !== 20
    || worksheet.worksheetDocument?.answerKeyItems?.length !== 20
    || worksheet.worksheetDocument?.questionPages?.length < 1
    || worksheet.worksheetDocument?.answerKeyPages?.length < 1) {
    errors.push(issue("P01D2_WORKSHEET_VERTICAL_SLICE_INVALID", { worksheetErrors: worksheet.errors }));
  }
  let html = "";
  if (worksheet.worksheetDocument) html = renderWorksheetDocumentToHtml(worksheet.worksheetDocument, { stylesheetHref: "" });
  if (!html.includes("worksheet-page--questions") || !html.includes("worksheet-page--answer-key")) errors.push(issue("P01D2_HTML_RENDER_INVALID"));

  const inventory = materializeP01AW1ProductAdmissionInventory();
  if (inventory.metrics.knowledgePointCount !== 21
    || inventory.metrics.admissionReadyExistingPublicPatternCount !== 9
    || inventory.metrics.publicProductVerticalSliceRequiredCount !== 12
    || inventory.metrics.publicSourceSelectableCount !== 2) {
    errors.push(issue("P01D2_W1_INVENTORY_DELTA_INVALID", { metrics: inventory.metrics }));
  }

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    summary: Object.freeze({
      sourceId: G6A_U01_SOURCE_ID,
      knowledgePointCount: EXPECTED_KP_IDS.length,
      patternGroupCount: 5,
      patternSpecCount: G6A_U01_PATTERN_SPEC_IDS.length,
      generatedQuestionCount: generated.questions.length,
      worksheetQuestionCount: worksheet.worksheetDocument?.generatedQuestions?.length ?? 0,
      answerKeyItemCount: worksheet.worksheetDocument?.answerKeyItems?.length ?? 0,
      questionPageCount: worksheet.worksheetDocument?.questionPages?.length ?? 0,
      answerKeyPageCount: worksheet.worksheetDocument?.answerKeyPages?.length ?? 0,
      protectedPublicSourceCount: protectedFleet.length,
      fullProductSourceCount: fullProductFleet.length,
      w1AdmittedCount: inventory.metrics.admissionReadyExistingPublicPatternCount,
      w1RemainingCount: inventory.metrics.publicProductVerticalSliceRequiredCount,
    }),
  });
}

export function runP01D2G6AU01NumberTheoryCli() {
  const report = validateP01D2G6AU01NumberTheory();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.ok) process.exitCode = 1;
  return report;
}

const isCli = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) runP01D2G6AU01NumberTheoryCli();
