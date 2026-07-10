import * as base from "./batch-a-browser-validator-g3b-u04-extension.js";
import {
  G3B_U04_CANONICAL_ROUTE_KINDS,
  classifyG3BU04CanonicalRouterPlan
} from "./g3b-u04-canonical-semantic-router.js";
import {
  G3B_U04_PRODUCTION_WORKSHEET_ELIGIBILITY,
  isG3BU04ProductionWorksheetPlan,
  validateG3BU04ProductionWorksheetEligibility
} from "./g3b-u04-production-eligibility.js";
import {
  G3B_U04_SEMANTIC_PROMOTION_REGISTRY_ID
} from "../registry/g3b-u04-semantic-promotion.js";
import {
  G3B_U04_HUMAN_SEMANTIC_READBACK_FULLFIX,
  validateG3BU04HumanSemanticReadback
} from "./g3b-u04-human-semantic-readback-fullfix.js";

export const G3B_U04_CANONICAL_VALIDATOR_INTEGRATION = Object.freeze({
  task: "S57F5_G3B_U04_CanonicalValidatorWorksheetAndRendererIntegration",
  status: "canonical_validator_integrated",
  semanticValidatorFirst: true,
  lifecycleValidationRequired: true,
  humanSemanticReadbackRequired: true,
  humanSemanticReadbackVersion: G3B_U04_HUMAN_SEMANTIC_READBACK_FULLFIX.version,
  productionEligibilityRequired: true,
  validatorVersion: "s57f5-g3b-u04-canonical-production-v1",
  requiredNextGate: "S57F6_G3B_U04_PublicSelectorAndPrintControlsQA"
});

function issue(code, path, message) {
  return { code, severity: "error", stage: "production_lifecycle", path, message };
}

function isG3BU04SemanticQuestion(question = {}) {
  return question?.sourceId === "g3b_u04_3b04"
    && question?.kind === "g3bU04SemanticWordProblem";
}

function validateCanonicalLifecycle(question = {}) {
  const errors = [];
  const allowedRouteKinds = new Set([
    G3B_U04_CANONICAL_ROUTE_KINDS.PURE_SEMANTIC,
    G3B_U04_CANONICAL_ROUTE_KINDS.NUMERIC_SEMANTIC_HYBRID
  ]);

  if (question.selectorStatus !== "visible" || question.visibilityStatus !== "visible") {
    errors.push(issue(
      "G3B_U04_CANONICAL_QUESTION_VISIBILITY_INVALID",
      "selectorStatus",
      "Canonical production semantic questions must be visible through the selector lifecycle."
    ));
  }
  if (question.productionUse !== "allowed") {
    errors.push(issue(
      "G3B_U04_CANONICAL_QUESTION_PRODUCTION_USE_INVALID",
      "productionUse",
      "Canonical production semantic questions must have productionUse=allowed."
    ));
  }
  if (question.promotionRegistryId !== G3B_U04_SEMANTIC_PROMOTION_REGISTRY_ID
    || question.semanticSnapshot?.promotionRegistryId !== G3B_U04_SEMANTIC_PROMOTION_REGISTRY_ID) {
    errors.push(issue(
      "G3B_U04_CANONICAL_QUESTION_PROMOTION_INVALID",
      "promotionRegistryId",
      "Canonical semantic question promotion metadata does not match the S57F registry."
    ));
  }
  if (question.generatorRouting !== "canonical_resolver_allocation"
    || question.semanticSnapshot?.resolverDerived !== true) {
    errors.push(issue(
      "G3B_U04_CANONICAL_QUESTION_RESOLVER_PROVENANCE_INVALID",
      "generatorRouting",
      "Canonical semantic questions must retain resolver-derived generator provenance."
    ));
  }
  if (!allowedRouteKinds.has(question.canonicalRoute?.kind)
    || question.canonicalRoute?.publicHiddenModeFlagUsed !== false) {
    errors.push(issue(
      "G3B_U04_CANONICAL_QUESTION_ROUTE_INVALID",
      "canonicalRoute",
      "Canonical semantic question route metadata is missing, invalid, or uses a hidden public flag."
    ));
  }
  if (typeof question.resolvedPatternGroupId !== "string"
    || question.resolvedPatternGroupId.length === 0
    || question.semanticSnapshot?.resolvedPatternGroupId !== question.resolvedPatternGroupId) {
    errors.push(issue(
      "G3B_U04_CANONICAL_QUESTION_GROUP_INVALID",
      "resolvedPatternGroupId",
      "Canonical semantic question must preserve its visible resolved PatternGroup."
    ));
  }
  if (!question.answerText || !question.answerUnit || !String(question.answerText).endsWith(question.answerUnit)) {
    errors.push(issue(
      "G3B_U04_CANONICAL_QUESTION_ANSWER_UNIT_INVALID",
      "answerText",
      "Canonical semantic question answer text must preserve the answer unit."
    ));
  }

  return errors;
}

export function validateBatchABrowserPlan(plan = {}) {
  if (isG3BU04ProductionWorksheetPlan(plan)) {
    return validateG3BU04ProductionWorksheetEligibility(plan);
  }
  return base.validateBatchABrowserPlan(plan);
}

export function validateBatchABrowserQuestion(question = {}, options = {}) {
  const semanticResult = base.validateBatchABrowserQuestion(question, options);
  if (!isG3BU04SemanticQuestion(question)) return semanticResult;

  const lifecycleErrors = validateCanonicalLifecycle(question);
  const readbackResult = validateG3BU04HumanSemanticReadback(question);
  const lifecycleStage = {
    stage: "production_lifecycle",
    ok: lifecycleErrors.length === 0,
    errorCodes: lifecycleErrors.map((entry) => entry.code),
    warningCodes: []
  };
  const humanReadbackStage = {
    stage: "human_semantic_readback",
    ok: readbackResult.ok,
    errorCodes: (readbackResult.errors ?? []).map((entry) => entry.code),
    warningCodes: (readbackResult.warnings ?? []).map((entry) => entry.code),
    validatorVersion: readbackResult.validatorVersion
  };
  return {
    ...semanticResult,
    ok: semanticResult.ok === true && lifecycleErrors.length === 0 && readbackResult.ok === true,
    errors: [
      ...(semanticResult.errors ?? []),
      ...lifecycleErrors,
      ...(readbackResult.errors ?? [])
    ],
    warnings: [
      ...(semanticResult.warnings ?? []),
      ...(readbackResult.warnings ?? [])
    ],
    stages: [...(semanticResult.stages ?? []), lifecycleStage, humanReadbackStage]
  };
}

export function validateBatchABrowserQuestions(questions = [], options = {}) {
  const errors = [];
  const warnings = [];
  const stages = [];
  for (const [index, question] of questions.entries()) {
    const result = validateBatchABrowserQuestion(question, {
      ...options,
      worksheetQuestions: questions
    });
    errors.push(...(result.errors ?? []).map((error) => ({
      ...error,
      path: `questions[${index}].${error.path}`
    })));
    warnings.push(...(result.warnings ?? []).map((warning) => ({
      ...warning,
      path: `questions[${index}].${warning.path}`
    })));
    if (Array.isArray(result.stages)) stages.push({ questionIndex: index, stages: result.stages });
  }
  return {
    ok: errors.length === 0,
    errors,
    warnings,
    infos: [],
    stages,
    validatorVersion: G3B_U04_CANONICAL_VALIDATOR_INTEGRATION.validatorVersion,
    humanSemanticReadbackVersion: G3B_U04_HUMAN_SEMANTIC_READBACK_FULLFIX.version,
    eligibilityVersion: G3B_U04_PRODUCTION_WORKSHEET_ELIGIBILITY.status,
    validatedAt: null
  };
}

export function classifyBatchAPlanForCanonicalValidation(plan = {}) {
  return classifyG3BU04CanonicalRouterPlan(plan);
}
