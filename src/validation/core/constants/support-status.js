export const SUPPORT_STATUSES = Object.freeze({
  V1_NUMBER_SENSE_SUPPORTED: "v1NumberSenseSupported",
  V1_TEXT_FALLBACK_SUPPORTED: "v1TextFallbackSupported",
  V1_EXPRESSION_SUPPORTED: "v1ExpressionSupported",
  REQUIRES_HUMAN_REVIEW: "requiresHumanReview",
  UNSUPPORTED_VISUAL_ONLY: "unsupportedVisualOnly",
  FUTURE_DOMAIN_ONLY: "futureDomainOnly",
  PLANNED_ONLY: "plannedOnly",
  FUTURE_DECIMAL_DOMAIN: "futureDecimalDomain",
  FUTURE_FRACTION_DOMAIN: "futureFractionDomain",
  FUTURE_MEASUREMENT_ENGINE: "futureMeasurementEngine",
  FUTURE_GEOMETRY_FORMULA_ENGINE: "futureGeometryFormulaEngine",
  REQUIRES_VISUAL_GENERATOR: "requiresVisualGenerator",
  REQUIRES_CHART_DATA_ENGINE: "requiresChartDataEngine",
  REQUIRES_WORD_PROBLEM_TEMPLATE: "requiresWordProblemTemplate"
});

export const SUPPORT_STATUS_VALUES = Object.freeze(Object.values(SUPPORT_STATUSES));
