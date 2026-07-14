import {
  G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS,
  G4A_U08_SOURCE_ID,
} from "../registry/g4a-u08-phase2b-promotion.js";
import {
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
import {
  validateG4AU08S76RProductionQuestions,
} from "./g4a-u08-s76r-production-validator.js";

const promotedGroupIds = new Set(G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS);

function isKnowledgePointSelection(options = {}) {
  return ["singleKnowledgePoint", "mixedKnowledgePointsSameUnit"].includes(options.selectionMode);
}

export function requestsS76JG4AU08Phase2B(options = {}) {
  return options.sourceId === G4A_U08_SOURCE_ID
    && Array.isArray(options.selectedPatternGroupIds)
    && options.selectedPatternGroupIds.some((id) => promotedGroupIds.has(id));
}

export function requestsS76QAllCanonicalWorksheet(options = {}) {
  return options.sourceId === G4A_U08_SOURCE_ID
    && isKnowledgePointSelection(options)
    && Array.isArray(options.selectedPatternGroupIds)
    && options.selectedPatternGroupIds.some((id) => isS76QPublicG4AU08PatternGroupId(id) && !promotedGroupIds.has(id));
}

export function isS76JG4AU08WorksheetEntryOptions(options = {}) {
  return !requestsS76QAllCanonicalWorksheet(options)
    && requestsS76JG4AU08Phase2B(options)
    && isS76JG4AU08WorksheetOptions(options);
}

function enforceS76RProductionValidation(options, result) {
  if (options.sourceId !== G4A_U08_SOURCE_ID || !result?.ok || !result.worksheetDocument) return result;
  const checked = validateG4AU08S76RProductionQuestions(result.worksheetDocument.generatedQuestions ?? []);
  if (checked.ok) {
    return {
      ...result,
      validation: checked,
      worksheetDocument: {
        ...result.worksheetDocument,
        validationSummary: checked,
      },
    };
  }
  return {
    ...result,
    ok: false,
    worksheetDocument: null,
    validation: checked,
    errors: checked.errors,
    warnings: checked.warnings,
  };
}

export function buildBatchABrowserWorksheetDocument(options = {}) {
  let result;
  if (requestsS76QAllCanonicalWorksheet(options) && isS76QG4AU08WorksheetOptions(options)) {
    result = buildS76QG4AU08WorksheetDocument(options);
  } else if (requestsS76JG4AU08Phase2B(options)) {
    result = buildS76JG4AU08WorksheetDocument(options);
  } else {
    result = buildBaseBatchABrowserWorksheetDocument(options);
  }
  return enforceS76RProductionValidation(options, result);
}
