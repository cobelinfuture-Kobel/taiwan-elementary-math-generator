export function createPatternLevelReport(patternId, requestedQuestionCount) {
  return {
    patternId,
    requestedQuestionCount,
    generatedQuestionCount: 0,
    totalAttempts: 0,
    failureCount: 0,
    warnings: [],
    failureReasonCodes: []
  };
}

export function createEmptyGenerationReport(config) {
  const patternReports = [];
  const patterns = config?.patternPlan?.patternPool?.patterns ?? [];
  const fixedCounts = new Map(
    (config?.patternPlan?.allocation?.fixedCounts ?? []).map((item) => [item.patternId, item.questionCount])
  );

  for (const pattern of patterns) {
    const requestedQuestionCount = fixedCounts.get(pattern.patternId) ?? 0;
    patternReports.push(createPatternLevelReport(pattern.patternId, requestedQuestionCount));
  }

  return {
    requestedQuestionCount: config?.generation?.questionCount ?? 0,
    generatedQuestionCount: 0,
    totalAttempts: 0,
    duplicateRejectCount: 0,
    constraintRejectCount: 0,
    patternReports,
    validationWarnings: [],
    generationWarnings: []
  };
}

export function createExpressionGenerationReport(patternId, requestedQuestionCount) {
  return createPatternLevelReport(patternId, requestedQuestionCount);
}

export function addPatternReportWarning(report, warning) {
  report.warnings.push(warning);
  return report;
}

export function addPatternReportFailure(report, failureCode) {
  report.failureCount += 1;
  report.failureReasonCodes.push(failureCode);
  return report;
}
