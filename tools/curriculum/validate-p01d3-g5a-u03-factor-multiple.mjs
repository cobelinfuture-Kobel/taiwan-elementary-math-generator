import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  auditP01D3BatchASelectorComposition,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  G5A_U03_PATTERN_SPEC_IDS,
  G5A_U03_SOURCE_ID,
  G5A_U03A1_SOURCE_ID,
  G5A_U03_SOURCE_IDS,
  getP01D3PatternSpecIdsForSource,
  validateP01D3PatternDefinitions,
} from "../../site/modules/curriculum/batch-a/source-pattern-full-product-p01d3-extension.js";
import { listBatchASourceUnits } from "../../site/modules/curriculum/batch-a/source-units.js";
import { listFullProductSourceUnits } from "../../site/modules/curriculum/batch-a/full-product-source-units-p01d3.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { validateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-u08-extension.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import { materializeP01AW1ProductAdmissionInventory } from "../../src/curriculum/full-product/p01-w1-product-admission-inventory.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const AUTHORITY_PATH = "data/curriculum/full-product/p01d3/g5a-u03-factor-multiple-pattern-authority.json";
const EXPECTED_KP_IDS = Object.freeze([
  "kp_g5a_u03a_factor_multiple_relation",
  "kp_g5a_u03a_divisibility_rules",
  "kp_g5a_u03a_exact_grouping_feasibility",
  "kp_g5a_u03a_multiple_identify_enumerate",
  "kp_g5a_u03a_bounded_or_nearest_multiple",
  "kp_g5a_u03a_count_multiples_interval",
  "kp_g5a_u03a_divisor_multiple_classification",
  "kp_g5a_u03a1_common_multiple_lcm",
  "kp_g5a_u03a1_bounded_common_multiples",
  "kp_g5a_u03a1_factor_multiple_language",
  "kp_g5a_u03a1_grouping_constraints",
  "kp_g5a_u03a1_number_constraint_construction",
]);

const issue = (code, details = {}) => Object.freeze({ code, ...details });
function options(sourceId) {
  return {
    sourceId,
    selectionMode: "sourceUnit",
    questionCount: getP01D3PatternSpecIdsForSource(sourceId).length * 2,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: `p01d3-validator-${sourceId}`,
    printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 5, showQuestionNumbers: true, showAnswerKeyPage: true },
  };
}

export function validateP01D3G5AU03FactorMultiple() {
  const errors = [];
  const authority = JSON.parse(fs.readFileSync(path.join(ROOT, AUTHORITY_PATH), "utf8"));
  const selector = auditP01D3BatchASelectorComposition();
  const definitions = validateP01D3PatternDefinitions();
  errors.push(...selector.errors.map((code) => issue(code)));
  errors.push(...definitions.errors.map((code) => issue(code)));

  if (authority.counts?.knowledgePoints !== 12 || authority.counts?.formalMappings !== 12
    || authority.counts?.patternGroups !== 12 || authority.counts?.patternSpecs !== 24) errors.push(issue("P01D3_AUTHORITY_COUNTS_INVALID"));
  if (JSON.stringify(authority.knowledgePoints.map((row) => row.knowledgePointId).sort()) !== JSON.stringify([...EXPECTED_KP_IDS].sort())) errors.push(issue("P01D3_AUTHORITY_KP_SET_INVALID"));
  if (authority.scope?.applicationStoryGenerationAllowed !== false) errors.push(issue("P01D3_APPLICATION_SCOPE_NOT_FROZEN"));

  for (const knowledgePointId of EXPECTED_KP_IDS) {
    const row = getVisibleBatchAKnowledgePoint(knowledgePointId);
    const groups = getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
    if (!row || !G5A_U03_SOURCE_IDS.includes(row.sourceId)) errors.push(issue("P01D3_VISIBLE_KP_MISSING", { knowledgePointId }));
    if (groups.length !== 1 || groups[0].patternSpecIds.length !== 2) errors.push(issue("P01D3_KP_PATTERN_BINDING_INVALID", { knowledgePointId }));
  }

  const protectedFleet = listBatchASourceUnits({ includePublicCandidates: true });
  const fullProductFleet = listFullProductSourceUnits();
  if (protectedFleet.length !== 15 || G5A_U03_SOURCE_IDS.some((sourceId) => protectedFleet.some((row) => row.sourceId === sourceId))) errors.push(issue("P01D3_PROTECTED_SOURCE_FLEET_CHANGED"));
  if (fullProductFleet.length !== 19 || G5A_U03_SOURCE_IDS.some((sourceId) => !fullProductFleet.some((row) => row.sourceId === sourceId))) errors.push(issue("P01D3_FULL_PRODUCT_SOURCE_AUTHORITY_INVALID"));

  let generatedQuestionCount = 0;
  let worksheetQuestionCount = 0;
  let answerKeyItemCount = 0;
  for (const sourceId of [G5A_U03_SOURCE_ID, G5A_U03A1_SOURCE_ID]) {
    const expectedSpecIds = getP01D3PatternSpecIdsForSource(sourceId);
    const generated = generateBatchABrowserQuestions(options(sourceId));
    generatedQuestionCount += generated.questions.length;
    if (!generated.ok || generated.questions.length !== expectedSpecIds.length * 2) errors.push(issue("P01D3_GENERATION_INVALID", { sourceId, generationErrors: generated.errors }));
    if (JSON.stringify([...new Set(generated.questions.map((row) => row.patternSpecId))].sort()) !== JSON.stringify([...expectedSpecIds].sort())) errors.push(issue("P01D3_PATTERN_COVERAGE_INVALID", { sourceId }));
    const validation = validateBatchABrowserQuestions(generated.questions);
    if (!validation.ok || validation.validatorVersion !== "p01d3-g5a-u03-factor-multiple-v1") errors.push(issue("P01D3_QUESTION_VALIDATION_FAILED", { sourceId, validationErrors: validation.errors }));

    const worksheet = buildBatchABrowserWorksheetDocument(options(sourceId));
    worksheetQuestionCount += worksheet.worksheetDocument?.generatedQuestions?.length ?? 0;
    answerKeyItemCount += worksheet.worksheetDocument?.answerKeyItems?.length ?? 0;
    if (!worksheet.ok || worksheet.worksheetDocument?.questionPages?.length < 1 || worksheet.worksheetDocument?.answerKeyPages?.length < 1) errors.push(issue("P01D3_WORKSHEET_VERTICAL_SLICE_INVALID", { sourceId, worksheetErrors: worksheet.errors }));
    const html = worksheet.worksheetDocument ? renderWorksheetDocumentToHtml(worksheet.worksheetDocument, { stylesheetHref: "" }) : "";
    if (!html.includes("worksheet-page--questions") || !html.includes("worksheet-page--answer-key")) errors.push(issue("P01D3_HTML_RENDER_INVALID", { sourceId }));
  }

  const inventory = materializeP01AW1ProductAdmissionInventory();
  if (inventory.metrics.knowledgePointCount !== 21
    || inventory.metrics.admissionReadyExistingPublicPatternCount !== 21
    || inventory.metrics.publicProductVerticalSliceRequiredCount !== 0
    || inventory.metrics.publicSourceSelectableCount !== 4) errors.push(issue("P01D3_W1_INVENTORY_DELTA_INVALID", { metrics: inventory.metrics }));

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    summary: Object.freeze({
      sourceIds: G5A_U03_SOURCE_IDS,
      knowledgePointCount: EXPECTED_KP_IDS.length,
      patternGroupCount: 12,
      patternSpecCount: G5A_U03_PATTERN_SPEC_IDS.length,
      generatedQuestionCount,
      worksheetQuestionCount,
      answerKeyItemCount,
      protectedPublicSourceCount: protectedFleet.length,
      fullProductSourceCount: fullProductFleet.length,
      w1AdmittedCount: inventory.metrics.admissionReadyExistingPublicPatternCount,
      w1RemainingCount: inventory.metrics.publicProductVerticalSliceRequiredCount,
    }),
  });
}

export function runP01D3G5AU03FactorMultipleCli() {
  const report = validateP01D3G5AU03FactorMultiple();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.ok) process.exitCode = 1;
  return report;
}

const isCli = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) runP01D3G5AU03FactorMultipleCli();
