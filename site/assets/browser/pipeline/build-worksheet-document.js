import { buildBatchABrowserWorksheetDocument } from "../../../modules/curriculum/batch-a/batch-a-browser-worksheet-s76j-entry.js";
import { getBatchAWorksheetPlan, storeWorksheetResult } from "../state/config-state.js";

export function buildWorksheetDocumentFromState(state) {
  const plan = getBatchAWorksheetPlan(state);
  const result = buildBatchABrowserWorksheetDocument(plan);
  storeWorksheetResult(state, result);
  return result;
}
