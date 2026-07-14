// S76J entry preserves the existing fallback chain rooted at
// "../../../modules/curriculum/batch-a/batch-a-browser-worksheet-s73-extension.js".
import { buildBatchABrowserWorksheetDocument } from "../../../modules/curriculum/batch-a/batch-a-browser-worksheet-s76j-entry.js";
import { buildG5AU02PublicCandidateWorksheet } from "../../../modules/curriculum/batch-a/g5a-u02-public-candidate.js";
import { resolveG5AU02BrowserPlan } from "../../../modules/curriculum/batch-b/g5a-u02-browser-resolver.js";
import { buildG5AU02BrowserDynamicWorksheet } from "../../../modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js";
import { getBatchAWorksheetPlan, storeWorksheetResult } from "../state/config-state.js";

function blockedKnowledgePointResult(resolution) {
  return Object.freeze({
    ok: false,
    errors: resolution.errors,
    worksheetDocument: null,
    browserResolution: resolution,
  });
}

export function buildWorksheetDocumentFromState(state) {
  const plan = getBatchAWorksheetPlan(state);
  const resolution = resolveG5AU02BrowserPlan(plan);
  let result;
  if (resolution?.mode === "blocked") {
    result = blockedKnowledgePointResult(resolution);
  } else if (resolution?.mode === "singleKnowledgePoint" || resolution?.mode === "multiKnowledgePoint") {
    result = buildG5AU02BrowserDynamicWorksheet(resolution.plan);
  } else {
    const publicCandidate = buildG5AU02PublicCandidateWorksheet(resolution?.plan ?? plan);
    result = publicCandidate ?? buildBatchABrowserWorksheetDocument(plan);
  }
  storeWorksheetResult(state, result);
  return result;
}
