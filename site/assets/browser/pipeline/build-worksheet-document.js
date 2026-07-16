// R2E entry preserves the complete worksheet chain, including R2D layout
// resolution, and appends controlled G4B-U04 context metadata.
import { buildBatchABrowserWorksheetDocument } from "../../../modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
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

function arrayLengths(value = {}) {
  return Object.fromEntries(Object.entries(value)
    .filter(([, nested]) => Array.isArray(nested))
    .map(([key, nested]) => [key, nested.length]));
}

function objectKeys(value = {}) {
  return Object.fromEntries(Object.entries(value)
    .filter(([, nested]) => nested && typeof nested === "object" && !Array.isArray(nested))
    .map(([key, nested]) => [key, Object.keys(nested)]));
}

function attachG5AU02PreProjectionDiagnostic(result, plan, resolution) {
  if (plan?.sourceId !== "g5a_u02_5a02") return result;
  const document = result?.worksheetDocument ?? null;
  return {
    ...result,
    g5aU02PreProjectionDiagnostic: {
      resolutionMode: resolution?.mode ?? null,
      resultKeys: Object.keys(result ?? {}),
      resultArrayLengths: arrayLengths(result ?? {}),
      resultObjectKeys: objectKeys(result ?? {}),
      documentKeys: Object.keys(document ?? {}),
      documentArrayLengths: arrayLengths(document ?? {}),
      documentObjectKeys: objectKeys(document ?? {}),
      schemaName: document?.schemaName ?? null,
      schemaVersion: document?.schemaVersion ?? null,
      unitId: document?.unitId ?? null,
      sourceId: document?.sourceId ?? null,
      questionRecordSampleKeys: Object.keys(document?.questionRecords?.[0] ?? {}),
      selectedKnowledgePointCount: plan?.selectedKnowledgePointIds?.length ?? plan?.knowledgePointIds?.length ?? 0,
      patternSpecCount: resolution?.plan?.patternSpecIds?.length ?? 0,
    },
  };
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
  result = attachG5AU02PreProjectionDiagnostic(result, resolution?.plan ?? plan, resolution);
  result = attachPublicControlOutputMetadata(result, resolution?.plan ?? plan);
  result = projectG5AU02DynamicDocumentForGlobalLayout(result);
  result = applyGlobalPublicLayoutOverlay(result, resolution?.plan ?? plan);
  storeWorksheetResult(state, result);
  return result;
}
