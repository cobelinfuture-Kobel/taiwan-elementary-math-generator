import {
  G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS,
  G4A_U08_SOURCE_ID,
} from "../registry/g4a-u08-phase2b-promotion.js";
import {
  G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS,
  isS76QPublicG4AU08PatternGroupId,
} from "../registry/batch-a-selector-g4a-u08-all-canonical.js";
import {
  buildBatchABrowserWorksheetDocument as buildS76QG4AU08WorksheetDocument,
  isS76QG4AU08WorksheetOptions,
} from "./batch-a-browser-worksheet-s76q-extension.js";
import {
  buildBatchABrowserWorksheetDocument as buildS76JG4AU08WorksheetDocument,
  isS76JG4AU08WorksheetOptions,
} from "./batch-a-browser-worksheet-s76j-extension.js";
import {
  buildBatchABrowserWorksheetDocument as buildBaseBatchABrowserWorksheetDocument,
} from "./batch-a-browser-worksheet-s73-extension.js";

const promotedGroupIds = new Set(G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS);
const canonicalKnowledgePointIds = new Set(
  G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS.map((row) => row.primaryKnowledgePointId),
);

function isKnowledgePointSelection(options = {}) {
  return ["singleKnowledgePoint", "mixedKnowledgePointsSameUnit"].includes(options.selectionMode);
}

export function requestsS76JG4AU08Phase2B(options = {}) {
  return options.sourceId === G4A_U08_SOURCE_ID
    && Array.isArray(options.selectedPatternGroupIds)
    && options.selectedPatternGroupIds.some((id) => promotedGroupIds.has(id));
}

export function requestsS76QAllCanonicalWorksheet(options = {}) {
  const groups = Array.isArray(options.selectedPatternGroupIds)
    ? options.selectedPatternGroupIds.filter(Boolean)
    : [];
  const knowledgePoints = Array.isArray(options.selectedKnowledgePointIds)
    ? options.selectedKnowledgePointIds.filter(Boolean)
    : [];
  return options.sourceId === G4A_U08_SOURCE_ID
    && isKnowledgePointSelection(options)
    && groups.length > 0
    && groups.every((id) => isS76QPublicG4AU08PatternGroupId(id))
    && knowledgePoints.length > 0
    && knowledgePoints.every((id) => canonicalKnowledgePointIds.has(id))
    && groups.some((id) => !promotedGroupIds.has(id));
}

export function isS76JG4AU08WorksheetEntryOptions(options = {}) {
  return !requestsS76QAllCanonicalWorksheet(options)
    && requestsS76JG4AU08Phase2B(options)
    && isS76JG4AU08WorksheetOptions(options);
}

export function buildBatchABrowserWorksheetDocument(options = {}) {
  if (requestsS76QAllCanonicalWorksheet(options) && isS76QG4AU08WorksheetOptions(options)) {
    return buildS76QG4AU08WorksheetDocument(options);
  }
  if (requestsS76JG4AU08Phase2B(options)) {
    return buildS76JG4AU08WorksheetDocument(options);
  }
  return buildBaseBatchABrowserWorksheetDocument(options);
}
