import {
  G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS,
} from "../registry/g4a-u08-phase2b-promotion.js";
import {
  isS76QPublicG4AU08PatternGroupId,
} from "../registry/batch-a-selector-g4a-u08-all-canonical.js";
import {
  buildBatchABrowserWorksheetDocument as buildS76JG4AU08WorksheetDocument,
  isS76JG4AU08WorksheetOptions,
} from "./batch-a-browser-worksheet-s76j-extension.js";
import {
  buildBatchABrowserWorksheetDocument as buildBaseBatchABrowserWorksheetDocument,
} from "./batch-a-browser-worksheet-s73-extension.js";

const promotedGroupIds = new Set(G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS);

export function requestsS76JG4AU08Phase2B(options = {}) {
  return Array.isArray(options.selectedPatternGroupIds)
    && options.selectedPatternGroupIds.some((id) => promotedGroupIds.has(id));
}

export function requestsS76QAllCanonicalWorksheet(options = {}) {
  return Array.isArray(options.selectedPatternGroupIds)
    && options.selectedPatternGroupIds.some((id) => isS76QPublicG4AU08PatternGroupId(id) && !promotedGroupIds.has(id));
}

export function isS76JG4AU08WorksheetEntryOptions(options = {}) {
  return !requestsS76QAllCanonicalWorksheet(options)
    && requestsS76JG4AU08Phase2B(options)
    && isS76JG4AU08WorksheetOptions(options);
}

export function buildBatchABrowserWorksheetDocument(options = {}) {
  return isS76JG4AU08WorksheetEntryOptions(options)
    ? buildS76JG4AU08WorksheetDocument(options)
    : buildBaseBatchABrowserWorksheetDocument(options);
}
