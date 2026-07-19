import {
  buildBatchABrowserWorksheetDocument as buildR2EWorksheetDocument
} from "./batch-a-browser-worksheet-r2e-entry.js";
import {
  G3B_U04_GLOBAL_CONTEXT_PRODUCTION_ADMISSION,
  G3B_U04_GLOBAL_CONTEXT_PRODUCTION_PATTERN_SPEC_ID,
  G3B_U04_GLOBAL_CONTEXT_PRODUCTION_SOURCE_ID,
  validateG3BU04GlobalContextProductionQuestion
} from "./g3b-u04-global-context-production-admission.js";
import {
  G3B_U04_GLOBAL_CONTEXT_PRODUCTION_REGISTRY_ID,
  G3B_U04_GLOBAL_CONTEXT_REVIEW_ARTIFACT_SHA256,
  G3B_U04_GLOBAL_CONTEXT_REVIEW_DECISION_ID
} from "./g3b-u04-global-context-production-registry.js";

export const G3B_U04_GLOBAL_CONTEXT_PUBLIC_WORKSHEET_INTEGRATION = Object.freeze({
  task: "GCTX-P13_G3BU04GlobalContextPilotHumanReviewAndProductionAdmission",
  status: "public_worksheet_production_admission_active",
  sourceId: G3B_U04_GLOBAL_CONTEXT_PRODUCTION_SOURCE_ID,
  patternSpecId: G3B_U04_GLOBAL_CONTEXT_PRODUCTION_PATTERN_SPEC_ID,
  registryId: G3B_U04_GLOBAL_CONTEXT_PRODUCTION_REGISTRY_ID,
  reviewDecisionId: G3B_U04_GLOBAL_CONTEXT_REVIEW_DECISION_ID,
  reviewArtifactSha256: G3B_U04_GLOBAL_CONTEXT_REVIEW_ARTIFACT_SHA256,
  productionAdmitted: true,
  publicGeneratorChanged: true,
  publicWorksheetChanged: true,
  rendererProfileChanged: false
});

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

function applyP13WorksheetAdmission(result) {
  const document = result?.worksheetDocument;
  if (!result?.ok || !document || document.batchA?.sourceId !== G3B_U04_GLOBAL_CONTEXT_PRODUCTION_SOURCE_ID) {
    return result;
  }

  const questions = document.generatedQuestions ?? [];
  const targetQuestions = questions.filter(
    (question) => question.patternSpecId === G3B_U04_GLOBAL_CONTEXT_PRODUCTION_PATTERN_SPEC_ID
  );
  if (targetQuestions.length === 0) return result;

  const validationErrors = targetQuestions.flatMap((question, index) => {
    const validation = validateG3BU04GlobalContextProductionQuestion(question);
    return validation.errors.map((entry) => ({
      ...entry,
      path: `worksheetDocument.generatedQuestions[${index}].${entry.path}`
    }));
  });
  if (validationErrors.length > 0) {
    return {
      ...result,
      ok: false,
      worksheetDocument: null,
      errors: [...(result.errors ?? []), ...validationErrors],
      warnings: result.warnings ?? []
    };
  }

  const variantIds = [...new Set(
    targetQuestions.map((question) => question.globalContextProduction?.semanticVariantId).filter(Boolean)
  )];
  const sourceTaskIds = [...new Set([
    ...(document.provenance?.sourceTaskIds ?? []),
    G3B_U04_GLOBAL_CONTEXT_PUBLIC_WORKSHEET_INTEGRATION.task
  ])];
  const admission = {
    ...cloneValue(G3B_U04_GLOBAL_CONTEXT_PRODUCTION_ADMISSION),
    projectedQuestionCount: targetQuestions.length,
    uniqueVariantCount: variantIds.length,
    projectedVariantIds: variantIds
  };

  return {
    ...result,
    worksheetDocument: {
      ...document,
      globalContextProductionAdmission: cloneValue(admission),
      metadata: {
        ...(document.metadata ?? {}),
        globalContextProductionAdmission: cloneValue(admission)
      },
      batchA: {
        ...(document.batchA ?? {}),
        globalContextProductionAdmission: cloneValue(admission)
      },
      semanticSummary: {
        ...(document.semanticSummary ?? {}),
        globalContextProductionQuestionCount: targetQuestions.length,
        globalContextVariantCount: variantIds.length,
        globalContextVariantIds: variantIds
      },
      provenance: {
        ...(document.provenance ?? {}),
        sourceTaskIds,
        globalContextProductionRegistryId: G3B_U04_GLOBAL_CONTEXT_PRODUCTION_REGISTRY_ID,
        humanReviewDecisionId: G3B_U04_GLOBAL_CONTEXT_REVIEW_DECISION_ID,
        humanReviewArtifactSha256: G3B_U04_GLOBAL_CONTEXT_REVIEW_ARTIFACT_SHA256,
        productionAdmissionStatus: "approved_and_public_routed"
      },
      configSnapshot: {
        ...(document.configSnapshot ?? {}),
        globalContextProductionAdmission: cloneValue(admission)
      },
      summary: {
        ...(document.summary ?? {}),
        globalContextProductionQuestionCount: targetQuestions.length,
        globalContextVariantCount: variantIds.length
      }
    },
    globalContextProductionAdmission: cloneValue(admission)
  };
}

export function buildBatchABrowserWorksheetDocument(options = {}) {
  return applyP13WorksheetAdmission(buildR2EWorksheetDocument(options));
}
