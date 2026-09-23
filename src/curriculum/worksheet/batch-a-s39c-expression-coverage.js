import { QUESTION_KINDS, SUPPORT_STATUSES } from "../../core/constants.js";
import { createDefaultConfig } from "../../core/default-config.js";
import { generateQuestionFromPattern } from "../../core/generate-expression.js";
import { assembleWorksheetDocument } from "../../core/worksheet-assembly.js";
import { renderWorksheetDocumentToHtml } from "../../renderer/html-renderer.js";
import { findBatchAPatternSpecRow } from "../generator/batch-a-generator.js";
import { validateBatchAItem } from "../validator/batch-a-validator.js";
import { BATCH_A_WORKSHEET_OUTPUT_STATUS } from "./batch-a-worksheet-output.js";

const IDS = [
  "ps_g3b_u08_division_check_exact",
  "ps_g4a_u08_left_to_right_add_sub",
  "ps_g4b_u01_multiplier_trailing_zero",
  "ps_g5a_u08_repeated_subtraction"
];

const BLUEPRINTS = {
  ps_g3b_u08_division_check_exact: { ops: [["÷"]], ranges: [[10, 99], [2, 9]], max: 99, division: true, skill: "integer_division_exact" },
  ps_g4a_u08_left_to_right_add_sub: { ops: [["+", "-"], ["+", "-"]], ranges: [[50, 99], [1, 40], [1, 40]], max: 179, skill: "integer_add_sub_mixed" },
  ps_g4b_u01_multiplier_trailing_zero: { ops: [["×"]], ranges: [[10, 99], [10, 10]], max: 990, skill: "integer_multiplication" },
  ps_g5a_u08_repeated_subtraction: { ops: [["-"], ["-"]], ranges: [[50, 99], [1, 20], [1, 20]], max: 97, skill: "integer_add_sub_mixed" }
};

const S40C_PRODUCTION_USE = BATCH_A_WORKSHEET_OUTPUT_STATUS.PRODUCTION_USE_ALLOWED;

function makePattern(row) {
  const blueprint = BLUEPRINTS[row.patternSpecId];
  return {
    patternId: row.patternSpecId,
    enabled: true,
    questionKind: QUESTION_KINDS.EXPRESSION,
    supportStatus: [SUPPORT_STATUSES.V1_EXPRESSION_SUPPORTED],
    patternTags: ["batch_a", "s39c", row.sourceId, row.patternSpecId],
    skillTags: [blueprint.skill],
    difficultyTags: ["s39c_expression_sourceid_coverage"],
    curriculumNodeIds: [row.sourceId],
    canonicalSkillIds: [blueprint.skill],
    expressionTemplate: {
      operandCount: blueprint.ranges.length,
      allowedOperatorsBySlot: blueprint.ops,
      operandDigitConstraints: [],
      answerConstraintPatch: null,
      intermediateConstraintPatch: null,
      divisionPattern: blueprint.division ? "exact_integer_division" : null,
      algorithmicComplexityPolicy: "s39c_minimal_coverage"
    },
    generatorConfigPatch: {
      expression: { operandRanges: blueprint.ranges.map(([min, max], index) => ({ position: index + 1, min, max, allowZero: false, allowOne: index === 1 && min === 10 ? false : true })) },
      answerConstraint: { min: blueprint.division ? 1 : 0, max: blueprint.max, allowZero: !blueprint.division, allowNegative: false, requireInteger: true },
      division: blueprint.division ? { allowDivideByOne: false, allowZeroDividend: false, requireExactQuotient: true } : undefined,
      precedence: { mode: "left_to_right" },
      parentheses: { mode: "none" }
    }
  };
}

export function getS39CExpressionCoveragePatternSpecIds() {
  return [...IDS];
}

export function getS39CExpressionCoverageSourceIds() {
  return IDS.map((id) => findBatchAPatternSpecRow(id)?.sourceId).filter(Boolean);
}

function generateQuestions(patternSpecIds, seed) {
  const questions = [];
  const errors = [];
  for (const id of patternSpecIds) {
    const row = findBatchAPatternSpecRow(id);
    if (!row || row.readiness !== "ready" || !BLUEPRINTS[id]) {
      errors.push({ code: "S39C_ROW_NOT_EXECUTABLE", severity: "error", path: "patternSpecId", message: id });
      continue;
    }
    const pattern = makePattern(row);
    const generated = generateQuestionFromPattern(pattern, { seed: `${seed}:${id}` });
    if (!generated.ok || !generated.question) {
      errors.push(...(generated.errors ?? []));
      continue;
    }
    const checked = validateBatchAItem({ question: generated.question, sourceId: row.sourceId, questionKind: QUESTION_KINDS.EXPRESSION, supportStatus: [SUPPORT_STATUSES.V1_EXPRESSION_SUPPORTED] });
    errors.push(...checked.errors);
    questions.push(generated.question);
  }
  return { ok: errors.length === 0, questions, errors };
}

export function buildS39CExpressionCoverageWorksheetHtml(options = {}) {
  const patternSpecIds = options.patternSpecIds ?? IDS;
  const seed = options.generationSeed ?? "s39c-expression-coverage";
  const generated = generateQuestions(patternSpecIds, seed);
  if (!generated.ok) {
    return { ok: false, worksheetDocument: null, html: null, errors: generated.errors, warnings: [] };
  }
  const base = createDefaultConfig();
  const configSnapshot = {
    ...base,
    version: "s40c.s39c.expression.coverage.v1",
    locale: "zh-Hant",
    metadata: { ...(base.metadata ?? {}), productionUse: S40C_PRODUCTION_USE },
    generation: { ...(base.generation ?? {}), questionCount: generated.questions.length },
    printLayout: { ...(base.printLayout ?? {}), showAnswerKeyPage: true },
    studentFields: { showName: true, showDate: true, labels: { name: "姓名", date: "日期" } },
    provenance: { sourceType: "s39c_batch_a_production_allowed", sourceTaskIds: ["S39C_BatchA_ExpressionSourceIdCoverage_Implementation", "S40C_BatchA_ProductionUseUpdate"], patternSpecIds, notes: ["productionUse allowed for Batch A worksheet output only"] }
  };
  const worksheetDocument = assembleWorksheetDocument({
    configSnapshot,
    allocationResult: patternSpecIds.map((patternId) => ({ patternId, questionCount: 1 })),
    generatedQuestions: generated.questions,
    generationReport: { requestedQuestionCount: generated.questions.length, generatedQuestionCount: generated.questions.length, routeCounts: { s39cExpressionCoverage: generated.questions.length }, totalAttempts: generated.questions.length, duplicateRejectCount: 0, constraintRejectCount: 0, patternReports: [], validationWarnings: [], generationWarnings: [], errors: [] },
    validationSummary: { ok: true, errors: [], warnings: [], infos: [], validatorVersion: "s40c-s39c", validatedAt: null },
    generationSeed: seed,
    orderingSeed: options.orderingSeed ?? "s39c-order",
    title: options.title ?? "S39C Batch A expression sourceId coverage",
    subtitle: "Batch A production-allowed scope",
    locale: "zh-Hant",
    provenance: configSnapshot.provenance
  });
  worksheetDocument.batchA = { productionUse: S40C_PRODUCTION_USE, patternSpecIds };
  const html = renderWorksheetDocumentToHtml(worksheetDocument, { title: options.title ?? "S39C", outputMode: "studentPrint", stylesheetHref: "../../src/renderer/print-styles.css" });
  return { ok: true, worksheetDocument, html, errors: [], warnings: [] };
}
