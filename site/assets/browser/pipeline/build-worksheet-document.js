// P13 entry preserves the complete R2E worksheet chain and appends the
// Human Review-approved G3B-U04 global-context production admission.
import { buildBatchABrowserWorksheetDocument } from "../../../modules/curriculum/batch-a/batch-a-browser-worksheet-gctx-p13-entry.js";
import { projectG5AU02DynamicDocumentForGlobalLayout } from "../../../modules/curriculum/batch-a/g5a-u02-global-layout-projection.js";
import { applyGlobalPublicLayoutOverlay } from "../../../modules/curriculum/batch-a/global-public-layout-overlay.js";
import { adaptGlobalPublicSourceUnitPlan } from "../../../modules/curriculum/batch-a/global-public-source-unit-adapter.js";
import { buildG5AU02PublicCandidateWorksheet } from "../../../modules/curriculum/batch-a/g5a-u02-public-candidate.js";
import { resolveG5AU02BrowserPlan } from "../../../modules/curriculum/batch-b/g5a-u02-browser-resolver.js";
import { buildG5AU02BrowserDynamicWorksheet } from "../../../modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js";
import { getBatchAWorksheetPlan, storeWorksheetResult } from "../state/config-state.js";
import { attachPublicControlOutputMetadata } from "./public-control-output-metadata.js";

function blockedKnowledgePointResult(resolution) {
  return Object.freeze({
    ok: false,
    errors: resolution.errors,
    worksheetDocument: null,
    browserResolution: resolution,
  });
}

export function buildWorksheetDocumentFromState(state) {
  const publicPlan = getBatchAWorksheetPlan(state);
  const sourceUnitAdaptation = adaptGlobalPublicSourceUnitPlan(publicPlan);
  const plan = sourceUnitAdaptation.plan;
  const resolution = resolveG5AU02BrowserPlan(plan);
  let result;
  if (resolution?.mode === "blocked") {
    result = blockedKnowledgePointResult(resolution);
  } else if (resolution?.mode === "singleKnowledgePoint" || resolution?.mode === "multiKnowledgePoint") {
    result = buildG5AU02BrowserDynamicWorksheet(resolution.plan);
  } else {
    // G5A-U02 sourceUnit is adapted to the dynamic canonical route above.
    // The fixed static candidate remains available only for legacy diagnostic
    // callers that bypass the public source-unit adapter.
    const publicCandidate = buildG5AU02PublicCandidateWorksheet(resolution?.plan ?? plan);
    result = publicCandidate ?? buildBatchABrowserWorksheetDocument(plan);
  }
  result = attachPublicControlOutputMetadata(result, resolution?.plan ?? plan);
  result = projectG5AU02DynamicDocumentForGlobalLayout(result);
  result = applyGlobalPublicLayoutOverlay(result, resolution?.plan ?? plan);
  storeWorksheetResult(state, result);
  return result;
}
