import { buildBatchABrowserWorksheetDocument as buildBaseBatchABrowserWorksheetDocument } from "./batch-a-browser-worksheet-s60j-extension.js";
import {
  G5A_U08_PRODUCTION_LIFECYCLE,
  G5A_U08_PRODUCTION_PROMOTION_OVERLAY_ID,
} from "../registry/g5a-u08-production-promotion.js";

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, clone(nested)]));
  return value;
}

function isG5AU08Document(document = {}) {
  return document?.batchA?.sourceId === "g5a_u08_5a08"
    && ["g5a_u08_numeric_reasoning_v1", "g5a_u08_mixed_long_text_v1"].includes(document?.rendererProfile?.profileId);
}

export function buildBatchABrowserWorksheetDocument(options = {}) {
  const result = buildBaseBatchABrowserWorksheetDocument(options);
  if (!result?.ok || !result.worksheetDocument || !isG5AU08Document(result.worksheetDocument)) return result;
  const document = clone(result.worksheetDocument);
  document.productionUse = G5A_U08_PRODUCTION_LIFECYCLE.productionUse;
  document.productionPromotionOverlayId = G5A_U08_PRODUCTION_PROMOTION_OVERLAY_ID;
  document.productionEligibility = {
    ...clone(document.productionEligibility ?? {}),
    ok: true,
    lifecycle: clone(G5A_U08_PRODUCTION_LIFECYCLE),
    productionPromotionOverlayId: G5A_U08_PRODUCTION_PROMOTION_OVERLAY_ID,
  };
  document.generatedQuestions = document.generatedQuestions.map((question) => ({
    ...question,
    productionUse: "allowed",
    productionWorksheetStatus: "production_eligible",
    productionPromotionOverlayId: G5A_U08_PRODUCTION_PROMOTION_OVERLAY_ID,
  }));
  document.provenance = {
    ...document.provenance,
    sourceTaskIds: [...new Set([...(document.provenance?.sourceTaskIds ?? []), "S60L_G5A_U08_ProductionStressHTMLPDFAndD0Closeout"])],
    productionPromotionOverlayId: G5A_U08_PRODUCTION_PROMOTION_OVERLAY_ID,
  };
  document.validationSummary = {
    ...document.validationSummary,
    ok: true,
    productionUse: "allowed",
  };
  return {
    ...result,
    worksheetDocument: document,
    generation: result.generation ? { ...result.generation, questions: document.generatedQuestions } : result.generation,
    validation: document.validationSummary,
  };
}
