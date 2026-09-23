import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { createDefaultConfig } from "../../core/default-config.js";
import { assembleWorksheetDocument } from "../../core/worksheet-assembly.js";
import { renderWorksheetDocumentToHtml } from "../../renderer/html-renderer.js";
import {
  generateBatchADefaultQuestionSet
} from "../generator/batch-a-default-generator.js";
import {
  getBatchAExecutablePatternSpecIds,
  getBatchAPatternSpecRuntimePlan
} from "../generator/batch-a-generator.js";

export const BATCH_A_WORKSHEET_OUTPUT_STATUS = Object.freeze({
  NON_PRODUCTION: "non_production",
  PRODUCTION_USE_FORBIDDEN: "production_use_forbidden",
  PRODUCTION_USE_ALLOWED: "allowed"
});

const DEFAULT_TITLE = "Batch A 台灣小學數學練習卷";
const DEFAULT_SUBTITLE = "正式輸出：Batch A QA-passed worksheet output";
const DEFAULT_GENERATION_SEED = "batch-a-worksheet";
const DEFAULT_ORDERING_SEED = "batch-a-worksheet-order";
const BATCH_A_PRODUCTION_USE = BATCH_A_WORKSHEET_OUTPUT_STATUS.PRODUCTION_USE_ALLOWED;

function cloneValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

function createIssue(code, path, message) {
  return { code, severity: "error", path, message };
}

function getExecutableRuntimePatterns(patternSpecIds, options = {}) {
  const patterns = [];
  const errors = [];

  for (const patternSpecId of patternSpecIds) {
    const plan = getBatchAPatternSpecRuntimePlan(patternSpecId, options);
    if (!plan.ok || !plan.pattern) {
      errors.push(...(plan.errors ?? []));
      continue;
    }
    patterns.push(plan.pattern);
  }

  return { patterns, errors };
}

export function buildBatchAWorksheetConfigSnapshot(options = {}) {
  const patternSpecIds = options.patternSpecIds ?? getBatchAExecutablePatternSpecIds();
  const countPerPattern = options.countPerPattern ?? 1;
  const runtimePatterns = getExecutableRuntimePatterns(patternSpecIds, options);
  if (runtimePatterns.errors.length > 0) {
    return {
      ok: false,
      configSnapshot: null,
      errors: runtimePatterns.errors,
      warnings: []
    };
  }

  const baseConfig = cloneValue(options.baseConfig ?? createDefaultConfig());
  const totalQuestionCount = patternSpecIds.length * countPerPattern;
  const fixedCounts = patternSpecIds.map((patternId) => ({ patternId, questionCount: countPerPattern }));

  const configSnapshot = {
    ...baseConfig,
    version: "s40c.batch_a.worksheet_config.v1",
    locale: "zh-Hant",
    questionKind: "expression",
    generationMode: "batch_a_default_semantic_routing",
    worksheet: {
      title: options.title ?? DEFAULT_TITLE,
      subtitle: options.subtitle ?? DEFAULT_SUBTITLE
    },
    metadata: {
      ...(baseConfig.metadata ?? {}),
      sourceTaskIds: [
        "S34F_BatchA_PatternSpecValidatorContractMaterializationExecution",
        "S35_BatchA_ValidatorImplementation",
        "S36_BatchA_GeneratorConsumption",
        "S36B_BatchA_AlgorithmicComplexitySamplerImplementation",
        "S36C_BatchA_DefaultGeneratorSemanticRoutingPatch",
        "S38_BatchA_WorksheetOutputImplementation",
        "S39ER_BatchA_NumberSenseSourceIdCoverage_CIReadback",
        "S40A_BatchA_ProductionGate_Preflight",
        "S40B_BatchA_ProductionEligibilityMatrix",
        "S40C_BatchA_ProductionUseUpdate"
      ],
      productionUse: BATCH_A_PRODUCTION_USE
    },
    curriculumInfo: {
      publisher: "Batch A",
      grade: "G3-G5",
      semester: null,
      unitNumber: "Batch A",
      unitTitle: "台灣小學數學 Batch A executable expression rows",
      curriculumNodeIds: patternSpecIds,
      canonicalSkillIds: []
    },
    patternPlan: {
      ...(baseConfig.patternPlan ?? {}),
      patternPool: {
        poolId: "batch-a-default-semantic-pool",
        selectionMode: "fixedCounts",
        patterns: runtimePatterns.patterns
      },
      allocation: {
        mode: "fixedCounts",
        totalQuestionCount,
        fixedCounts,
        weights: []
      },
      worksheetOrdering: {
        mode: "groupedByPattern",
        stablePatternOrder: [...patternSpecIds]
      }
    },
    generation: {
      ...(baseConfig.generation ?? {}),
      questionCount: totalQuestionCount
    },
    printLayout: {
      ...(baseConfig.printLayout ?? {}),
      paperSize: "A4",
      columns: options.columns ?? 4,
      rowsPerPage: options.rowsPerPage ?? 10,
      showQuestionNumbers: true,
      showAnswerKeyPage: true,
      debugDataAttributes: Boolean(options.debugDataAttributes)
    },
    studentFields: {
      showName: true,
      showDate: true,
      showClass: options.showClass ?? false,
      showScore: options.showScore ?? false,
      labels: {
        name: "姓名",
        date: "日期",
        className: "班級",
        score: "分數"
      }
    },
    provenance: {
      sourceType: "rule_based_batch_a_production_allowed",
      sourceTaskIds: ["S38_BatchA_WorksheetOutputImplementation", "S40C_BatchA_ProductionUseUpdate"],
      patternSpecIds,
      curriculumNodeIds: patternSpecIds,
      notes: [
        "productionUse allowed for Batch A worksheet output only",
        "Batch B/C/D/E not allowed",
        "AI literacy fusion not allowed",
        "unsupported visual generator not allowed"
      ]
    }
  };

  return {
    ok: true,
    configSnapshot,
    errors: [],
    warnings: []
  };
}

function createAllocationResult(patternSpecIds, countPerPattern) {
  return patternSpecIds.map((patternId) => ({ patternId, questionCount: countPerPattern }));
}

function createValidationSummary(errors = [], warnings = []) {
  return {
    ok: errors.length === 0,
    errors,
    warnings,
    infos: [],
    validatorVersion: "s40c-batch-a-worksheet-output-v1",
    validatedAt: null
  };
}

function createGenerationReport({ configSnapshot, questions, routeCounts, patternSpecIds, countPerPattern, errors, warnings }) {
  return {
    requestedQuestionCount: configSnapshot.generation.questionCount,
    generatedQuestionCount: questions.length,
    routeCounts: cloneValue(routeCounts),
    totalAttempts: questions.length,
    duplicateRejectCount: 0,
    constraintRejectCount: 0,
    patternReports: patternSpecIds.map((patternId) => ({
      patternId,
      requestedQuestionCount: countPerPattern,
      generatedQuestionCount: questions.filter((question) => question?.metadata?.patternId === patternId).length,
      failureCount: 0,
      warnings: []
    })),
    validationWarnings: warnings,
    generationWarnings: warnings,
    errors
  };
}

export function buildBatchAWorksheetDocument(options = {}) {
  const patternSpecIds = options.patternSpecIds ?? getBatchAExecutablePatternSpecIds();
  const countPerPattern = options.countPerPattern ?? 1;
  const configResult = buildBatchAWorksheetConfigSnapshot({ ...options, patternSpecIds, countPerPattern });
  if (!configResult.ok) {
    return { ok: false, worksheetDocument: null, errors: configResult.errors, warnings: configResult.warnings };
  }

  const generation = generateBatchADefaultQuestionSet({
    patternSpecIds,
    countPerPattern,
    seed: options.generationSeed ?? DEFAULT_GENERATION_SEED
  });

  const errors = [...(generation.errors ?? [])];
  const warnings = [...(generation.warnings ?? [])];
  if (!generation.ok) {
    return { ok: false, worksheetDocument: null, errors, warnings };
  }

  const configSnapshot = configResult.configSnapshot;
  const allocationResult = createAllocationResult(patternSpecIds, countPerPattern);
  const generationReport = createGenerationReport({
    configSnapshot,
    questions: generation.questions,
    routeCounts: generation.routeCounts,
    patternSpecIds,
    countPerPattern,
    errors,
    warnings
  });

  const worksheetDocument = assembleWorksheetDocument({
    worksheetId: options.worksheetId,
    configSnapshot,
    allocationResult,
    generatedQuestions: generation.questions,
    generationReport,
    validationSummary: createValidationSummary(errors, warnings),
    generationSeed: options.generationSeed ?? DEFAULT_GENERATION_SEED,
    orderingSeed: options.orderingSeed ?? DEFAULT_ORDERING_SEED,
    title: options.title ?? DEFAULT_TITLE,
    subtitle: options.subtitle ?? DEFAULT_SUBTITLE,
    locale: "zh-Hant",
    provenance: configSnapshot.provenance
  });

  worksheetDocument.batchA = {
    productionUse: BATCH_A_PRODUCTION_USE,
    routeCounts: cloneValue(generation.routeCounts),
    patternSpecIds: [...patternSpecIds]
  };

  return {
    ok: true,
    worksheetDocument,
    routeCounts: cloneValue(generation.routeCounts),
    errors,
    warnings
  };
}

export function buildBatchAWorksheetHtml(options = {}) {
  const documentResult = buildBatchAWorksheetDocument(options);
  if (!documentResult.ok) {
    return { ok: false, worksheetDocument: null, html: null, errors: documentResult.errors, warnings: documentResult.warnings };
  }

  const html = renderWorksheetDocumentToHtml(documentResult.worksheetDocument, {
    title: options.title ?? DEFAULT_TITLE,
    outputMode: options.outputMode ?? "studentPrint",
    stylesheetHref: options.stylesheetHref ?? "../../src/renderer/print-styles.css",
    debugDataAttributes: Boolean(options.debugDataAttributes)
  });

  return {
    ok: true,
    worksheetDocument: documentResult.worksheetDocument,
    html,
    routeCounts: documentResult.routeCounts,
    errors: [],
    warnings: documentResult.warnings
  };
}

export function writeBatchAWorksheetHtml(options = {}) {
  const outputPath = options.outputPath;
  if (!outputPath) {
    return {
      ok: false,
      outputPath: null,
      html: null,
      worksheetDocument: null,
      errors: [createIssue("batch_a_worksheet_output_path_missing", "outputPath", "outputPath is required.")],
      warnings: []
    };
  }

  const htmlResult = buildBatchAWorksheetHtml(options);
  if (!htmlResult.ok) {
    return { ...htmlResult, outputPath };
  }

  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, htmlResult.html, "utf8");

  return {
    ...htmlResult,
    outputPath
  };
}
