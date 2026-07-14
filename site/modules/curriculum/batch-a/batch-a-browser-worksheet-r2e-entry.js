import {
  buildBatchABrowserWorksheetDocument as buildR2DWorksheetDocument,
} from "./batch-a-browser-worksheet-r2d-entry.js";
import {
  G4B_U04_SOURCE_ID,
} from "../registry/g4b-u04-promotion.js";
import {
  G4B_U04_CONTEXT_CONTRACT_VERSION,
  normalizeG4BU04ContextMode,
  summarizeG4BU04ContextAllocation,
} from "../batch-b/g4b-u04-controlled-context-variants.js";

export const G4B_U04_R2E_WORKSHEET_CONTEXT_INTEGRATION = Object.freeze({
  task: "G4B_U04_R2E_ControlledSDGTemplateVariantsAndContextMode",
  status: "controlled_context_integrated_pending_ci",
  contextModes: Object.freeze(["mixed", "daily_life", "sdg"]),
  defaultContextMode: "mixed",
  genericContextFallbackAllowed: false,
  freeFormAIAllowed: false,
  requiredNextGate: "G4B_U04_R2F_FullWorksheetHTMLPDFAndDeployedUIRecloseout",
});

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, clone(nested)]));
  }
  return value;
}

function applyR2EContextMetadata(result, options = {}) {
  const document = result?.worksheetDocument;
  if (!result?.ok || !document || document.batchA?.sourceId !== G4B_U04_SOURCE_ID) return result;
  const questions = document.generatedQuestions ?? [];
  const contextMode = normalizeG4BU04ContextMode(
    options.contextMode
      ?? result.generation?.plan?.contextMode
      ?? questions.find((question) => question.contextModeRequested)?.contextModeRequested,
  );
  const contextAllocation = result.generation?.contextAllocation
    ?? summarizeG4BU04ContextAllocation(questions, contextMode);
  const publicControls = {
    ...(document.publicControls ?? {}),
    sourceId: G4B_U04_SOURCE_ID,
    questionMode: options.questionMode ?? document.batchA?.questionMode ?? "mixed",
    contextMode,
    layoutMode: document.layoutResolution?.layoutMode ?? options.layoutMode ?? "auto_safe",
    genericFallback: false,
    freeFormAI: false,
    printScope: "controlled_context_and_resolved_layout",
  };
  const sourceTaskIds = [...new Set([
    ...(document.provenance?.sourceTaskIds ?? []),
    G4B_U04_R2E_WORKSHEET_CONTEXT_INTEGRATION.task,
  ])];
  const worksheetDocument = {
    ...document,
    publicControls,
    contextAllocation: clone(contextAllocation),
    metadata: {
      ...(document.metadata ?? {}),
      publicControls: clone(publicControls),
      contextContractVersion: G4B_U04_CONTEXT_CONTRACT_VERSION,
      contextMode,
      contextAllocation: clone(contextAllocation),
    },
    validationSummary: {
      ...(document.validationSummary ?? {}),
      contextValidatorVersion: G4B_U04_CONTEXT_CONTRACT_VERSION,
    },
    batchA: {
      ...(document.batchA ?? {}),
      contextMode,
    },
    g4bU04Summary: {
      ...(document.g4bU04Summary ?? {}),
      contextMode,
      contextAllocation: clone(contextAllocation),
    },
    provenance: {
      ...(document.provenance ?? {}),
      sourceTaskIds,
      contextContractVersion: G4B_U04_CONTEXT_CONTRACT_VERSION,
      genericContextFallbackUsed: false,
      freeFormAIUsed: false,
    },
    configSnapshot: {
      ...(document.configSnapshot ?? {}),
      schemaVersion: "r2e.batch_b.g4b_u04.worksheet_plan.v1",
      contextMode,
    },
    summary: {
      ...(document.summary ?? {}),
      contextMode,
      dailyLifeContextCount: contextAllocation.counts.daily_life,
      sdgContextCount: contextAllocation.counts.sdg,
      contextNotApplicableCount: contextAllocation.counts.not_applicable,
    },
  };
  return {
    ...result,
    worksheetDocument,
    contextAllocation: clone(contextAllocation),
  };
}

export function buildBatchABrowserWorksheetDocument(options = {}) {
  return applyR2EContextMetadata(buildR2DWorksheetDocument(options), options);
}
