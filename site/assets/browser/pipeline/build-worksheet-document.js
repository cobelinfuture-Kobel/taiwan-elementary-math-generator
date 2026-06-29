import {
  allocatePatternCounts,
  assembleWorksheetDocument,
  generateQuestionsForPattern,
  validateConfig
} from "../../../modules/core/index.js";
import {
  translateGenerationFailure,
  validateBrowserConfig
} from "../state/config-validation.js";

function cloneValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, cloneValue(nestedValue)])
    );
  }

  return value;
}

function createIssue(code, severity, path, message) {
  return { code, severity, level: severity, path, message };
}

function combineValidationResults(browserValidation, coreValidation) {
  const errors = [
    ...(browserValidation?.errors ?? []),
    ...(coreValidation?.errors ?? [])
  ];
  const warnings = [
    ...(browserValidation?.warnings ?? []),
    ...(coreValidation?.warnings ?? []),
    ...(browserValidation?.infos ?? [])
  ];

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    infos: browserValidation?.infos ?? []
  };
}

function createPatternMap(config) {
  return new Map(
    (config?.patternPlan?.patternPool?.patterns ?? []).map((pattern) => [pattern.patternId, pattern])
  );
}

function createGenerationReport(config, allocationResult, generatedQuestions, warnings = []) {
  const countsByPattern = new Map();
  for (const question of generatedQuestions) {
    const patternId = question?.metadata?.patternId ?? null;
    countsByPattern.set(patternId, (countsByPattern.get(patternId) ?? 0) + 1);
  }

  return {
    requestedQuestionCount: config?.generation?.questionCount ?? 0,
    generatedQuestionCount: generatedQuestions.length,
    totalAttempts: generatedQuestions.length,
    duplicateRejectCount: 0,
    constraintRejectCount: 0,
    patternReports: allocationResult.map((allocation) => ({
      patternId: allocation.patternId,
      requestedQuestionCount: allocation.questionCount,
      generatedQuestionCount: countsByPattern.get(allocation.patternId) ?? 0,
      totalAttempts: countsByPattern.get(allocation.patternId) ?? 0,
      failureCount: 0,
      warnings: [],
      failureReasonCodes: []
    })),
    validationWarnings: warnings,
    generationWarnings: []
  };
}

function resolveOrderingSeed(state) {
  const explicitOrderingSeed = String(state?.seeds?.orderingSeed ?? "").trim();
  if (explicitOrderingSeed) {
    return explicitOrderingSeed;
  }

  if (state?.seeds?.lockOrderingSeedToGenerationSeed) {
    return null;
  }

  return explicitOrderingSeed;
}

function generateQuestionsFromAllocations(configSnapshot, allocationResult, generationSeed) {
  const duplicateKeys = new Set();
  const patternMap = createPatternMap(configSnapshot);
  const generatedQuestions = [];
  const rawErrors = [];

  allocationResult.forEach((allocation, allocationIndex) => {
    const pattern = patternMap.get(allocation.patternId);
    if (!pattern) {
      rawErrors.push(createIssue("pattern_missing", "error", "patternPlan.patternPool.patterns", `Missing pattern '${allocation.patternId}' in config pattern pool.`));
      return;
    }

    const result = generateQuestionsForPattern(pattern, allocation.questionCount, {
      config: configSnapshot,
      seed: `${generationSeed ?? "site-generation-seed"}:${allocation.patternId}:${allocationIndex}`,
      existingDuplicateKeys: duplicateKeys
    });

    if (!result.ok) {
      rawErrors.push(...(result.errors ?? []));
      return;
    }

    generatedQuestions.push(...result.questions);
  });

  if (rawErrors.length > 0) {
    return {
      ok: false,
      generatedQuestions: [],
      rawErrors,
      errors: [translateGenerationFailure(rawErrors)],
      warnings: []
    };
  }

  return {
    ok: true,
    generatedQuestions,
    rawErrors: [],
    errors: [],
    warnings: []
  };
}

export function buildWorksheetDocumentFromState(state) {
  const configSnapshot = cloneValue(state?.draftConfig ?? {});
  const browserValidation = validateBrowserConfig(configSnapshot);
  const coreValidation = validateConfig(configSnapshot);
  const validation = combineValidationResults(browserValidation, coreValidation);

  if (!validation.ok) {
    return {
      ok: false,
      stage: "validate",
      validation,
      errors: validation.errors,
      warnings: validation.warnings,
      worksheetDocument: null,
      rawErrors: []
    };
  }

  const allocation = allocatePatternCounts(configSnapshot);
  if (!allocation.ok) {
    return {
      ok: false,
      stage: "allocate",
      validation,
      allocation,
      errors: allocation.errors,
      warnings: [...validation.warnings, ...(allocation.warnings ?? [])],
      worksheetDocument: null,
      rawErrors: []
    };
  }

  const generationSeed = String(state?.seeds?.generationSeed ?? "");
  const generation = generateQuestionsFromAllocations(configSnapshot, allocation.allocations, generationSeed);
  if (!generation.ok) {
    return {
      ok: false,
      stage: "generate",
      validation,
      allocation,
      errors: generation.errors,
      warnings: [...validation.warnings, ...(allocation.warnings ?? [])],
      worksheetDocument: null,
      rawErrors: generation.rawErrors
    };
  }

  const generationReport = createGenerationReport(
    configSnapshot,
    allocation.allocations,
    generation.generatedQuestions,
    validation.warnings
  );

  const worksheetDocument = assembleWorksheetDocument({
    configSnapshot,
    allocationResult: allocation.allocations,
    generatedQuestions: generation.generatedQuestions,
    generationReport,
    generationSeed,
    orderingSeed: resolveOrderingSeed(state)
  });

  return {
    ok: true,
    stage: "render-ready",
    validation,
    allocation,
    generationReport,
    worksheetDocument,
    errors: [],
    warnings: [...validation.warnings, ...(allocation.warnings ?? [])],
    rawErrors: []
  };
}
