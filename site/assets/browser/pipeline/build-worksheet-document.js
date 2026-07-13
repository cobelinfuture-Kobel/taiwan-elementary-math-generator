// S76J entry preserves the existing fallback chain rooted at
// "../../../modules/curriculum/batch-a/batch-a-browser-worksheet-s73-extension.js".
import { buildBatchABrowserWorksheetDocument } from "../../../modules/curriculum/batch-a/batch-a-browser-worksheet-s76j-entry.js";
import { buildG5AU02PublicCandidateWorksheet } from "../../../modules/curriculum/batch-a/g5a-u02-public-candidate.js";
import { getBatchAWorksheetPlan, storeWorksheetResult } from "../state/config-state.js";

export function buildWorksheetDocumentFromState(state) {
  const plan = getBatchAWorksheetPlan(state);
  const publicCandidate = buildG5AU02PublicCandidateWorksheet(plan);
  const result = publicCandidate ?? buildBatchABrowserWorksheetDocument(plan);
  storeWorksheetResult(state, result);
  return result;
}
