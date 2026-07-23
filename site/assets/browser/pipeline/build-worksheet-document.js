import { buildBatchABrowserWorksheetDocument } from "../../../modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { applyG3BU04GlobalContextPublicWorksheetAdmission } from "../../../modules/curriculum/batch-a/batch-a-browser-worksheet-gctx-p13-entry.js";
import { projectG5AU02DynamicDocumentForGlobalLayout } from "../../../modules/curriculum/batch-a/g5a-u02-global-layout-projection.js";
import { applyGlobalPublicLayoutOverlay } from "../../../modules/curriculum/batch-a/global-public-layout-overlay.js";
import { adaptGlobalPublicSourceUnitPlan } from "../../../modules/curriculum/batch-a/global-public-source-unit-adapter.js";
import { buildG5AU02PublicCandidateWorksheet } from "../../../modules/curriculum/batch-a/g5a-u02-public-candidate.js";
import { resolveG5AU02BrowserPlan } from "../../../modules/curriculum/batch-b/g5a-u02-browser-resolver.js";
import { buildG5AU02BrowserDynamicWorksheet } from "../../../modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js";
import { paginateAnswerKeyItems, paginateQuestionDisplayModels } from "../../../modules/core/worksheet-pagination.js";
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

function blockedSourceUnitAdapterResult(adaptation, publicPlan) {
  return Object.freeze({
    ok: false,
    errors: adaptation.errors ?? ["GS04_SOURCE_UNIT_ADAPTER_BLOCKED"],
    worksheetDocument: null,
    sourceUnitAdaptation: adaptation,
    browserResolution: null,
    requestedPlan: publicPlan,
  });
}

export function buildWorksheetDocumentFromPlan(publicPlan) {
  const sourceUnitAdaptation = adaptGlobalPublicSourceUnitPlan(publicPlan);
  const plan = sourceUnitAdaptation.plan ?? publicPlan;
  let resolution = null;
  let result;
  if (sourceUnitAdaptation.blocked) {
    result = blockedSourceUnitAdapterResult(sourceUnitAdaptation, publicPlan);
  } else {
    resolution = resolveG5AU02BrowserPlan(plan);
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
  }
  result = applyG3BU04GlobalContextPublicWorksheetAdmission(result);
  result = attachPublicControlOutputMetadata(result, resolution?.plan ?? plan);
  result = projectG5AU02DynamicDocumentForGlobalLayout(result);
  return applyGlobalPublicLayoutOverlay(result, resolution?.plan ?? plan);
}

export function buildWorksheetDocumentFromGeneratedItems({
  worksheetId,
  generatedItems,
  title = "數學練習卷",
  subtitle = "",
  orderingMode = "sharedGeneratorOrder",
  printLayout = {},
  report = {},
  metadata = {}
} = {}) {
  if (!Array.isArray(generatedItems) || generatedItems.length === 0) {
    throw new Error("generated_items_required");
  }
  const resolvedLayout = Object.freeze({
    paperSize: printLayout.paperSize ?? "A4",
    columns: Number.isInteger(printLayout.columns) ? printLayout.columns : 1,
    rowsPerPage: Number.isInteger(printLayout.rowsPerPage) ? printLayout.rowsPerPage : 4,
    showAnswerKeyPage: printLayout.showAnswerKeyPage !== false,
    showQuestionNumbers: printLayout.showQuestionNumbers !== false,
    worksheetTitle: printLayout.worksheetTitle ?? title
  });
  const displayModels = generatedItems.map((item, index) => Object.freeze({
    questionId: item.generatedItemId ?? item.id,
    questionNumber: index + 1,
    patternId: item.patternSpecId ?? null,
    displayText: `${item.prompt} ${item.answerText}`,
    blankedDisplayText: item.prompt,
    answerText: item.answerText,
    questionNumberText: resolvedLayout.showQuestionNumbers ? `${index + 1}.` : null,
    metadataSnapshot: Object.freeze({
      patternId: item.patternSpecId ?? null,
      patternTags: Object.freeze([item.mode ?? "UNKNOWN", item.operationFamilyId ?? "UNKNOWN"]),
      skillTags: Object.freeze([]),
      difficultyTags: Object.freeze([]),
      curriculumNodeIds: Object.freeze([item.sourceNodeId].filter(Boolean)),
      canonicalSkillIds: Object.freeze([item.knowledgePointId].filter(Boolean)),
      precedenceMode: null,
      parenthesesMode: null,
      blankTarget: null,
      duplicateKey: item.generatedItemId ?? item.id
    }),
    layoutHints: Object.freeze({
      operandCount: Object.keys(item.givenRoleValues ?? {}).length,
      operatorCount: 0,
      estimatedTextLength: item.prompt.length,
      hasGrouping: false,
      questionMode: item.mode ?? "UNKNOWN"
    })
  }));
  const answerKeyItems = generatedItems.map((item, index) => Object.freeze({
    questionId: item.generatedItemId ?? item.id,
    questionNumber: index + 1,
    patternId: item.patternSpecId ?? null,
    promptText: item.prompt,
    answerText: item.answerText,
    metadataSnapshot: displayModels[index].metadataSnapshot
  }));
  const questionPages = paginateQuestionDisplayModels(displayModels, resolvedLayout);
  const answerKeyPages = paginateAnswerKeyItems(answerKeyItems, resolvedLayout);
  const warnings = Array.isArray(report.warnings) ? report.warnings : [];
  const errors = Array.isArray(report.errors) ? report.errors : [];
  const worksheetDocument = Object.freeze({
    schemaVersion: 1,
    worksheetId: worksheetId ?? `shared-worksheet-${generatedItems.length}`,
    generatedAt: "DETERMINISTIC",
    configSnapshot: Object.freeze({
      generation: Object.freeze({ questionCount: generatedItems.length }),
      printLayout: resolvedLayout,
      title,
      subtitle,
      metadata: Object.freeze({ ...metadata })
    }),
    orderingMode,
    questionCount: generatedItems.length,
    questionPages: Object.freeze(questionPages),
    answerKeyPages: Object.freeze(answerKeyPages),
    sections: Object.freeze([]),
    questions: Object.freeze(generatedItems.map((item) => Object.freeze({ ...item }))),
    report: Object.freeze({
      ok: errors.length === 0,
      errors: Object.freeze([...errors]),
      warnings: Object.freeze([...warnings]),
      summary: Object.freeze({
        questionCount: generatedItems.length,
        questionPageCount: questionPages.length,
        answerKeyPageCount: answerKeyPages.length,
        ...(report.summary ?? {})
      })
    })
  });
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze([...errors]),
    warnings: Object.freeze([...warnings]),
    worksheetDocument
  });
}

export function buildWorksheetDocumentFromState(state) {
  const publicPlan = getBatchAWorksheetPlan(state);
  const result = buildWorksheetDocumentFromPlan(publicPlan);
  storeWorksheetResult(state, result);
  return result;
}
