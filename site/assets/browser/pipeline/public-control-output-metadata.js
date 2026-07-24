import { getPublicControlProfile } from "../../../modules/curriculum/registry/public-control-profiles.js";
import { buildFifteenUnitPublicPblWorksheetResult } from "../../../modules/curriculum/public/fifteen-unit-public-pbl-worksheet.js";
import { resolveWorksheetQuestionCount } from "./worksheet-output-count.js";
import { resolveWorksheetTitle } from "./worksheet-output-title.js";

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
}

function pblPublicControls(plan = {}) {
  if (plan.questionMode !== "pbl") return null;
  return freeze({
    sourceId: plan.sourceId,
    questionMode: "pbl",
    depthMode: plan.depthMode ?? "mixed",
    contextMode: plan.contextMode ?? "mixed",
    genericFallback: false,
    freeFormAI: false,
    globalContextRegistry: "GCTX_15_UNIT_PUBLIC_WORKSHEET_V1",
    printScope: "student_and_answer_key_same_control_scope",
  });
}

export function buildPublicControlOutputMetadata(plan = {}) {
  const profile = getPublicControlProfile(plan.sourceId);
  if (!profile) return pblPublicControls(plan);
  return freeze({
    sourceId: plan.sourceId,
    questionMode: plan.questionMode ?? profile.questionTypeControl.defaultValue,
    depthMode: plan.depthMode ?? profile.reasoningDepthControl.defaultValue,
    contextMode: plan.contextMode ?? profile.contextControl.defaultValue,
    genericFallback: profile.genericFallback ?? false,
    freeFormAI: profile.freeFormAI ?? false,
    printScope: "student_and_answer_key_same_control_scope",
  });
}

export function attachPublicControlOutputMetadata(result, plan = {}) {
  if (plan.questionMode === "pbl") {
    result = buildFifteenUnitPublicPblWorksheetResult(plan);
  }
  if (!result?.worksheetDocument) return result;
  const publicControls = buildPublicControlOutputMetadata(plan);
  if (!publicControls) return result;
  const questionCount = resolveWorksheetQuestionCount(result.worksheetDocument);
  const title = resolveWorksheetTitle(result.worksheetDocument, plan);
  const mergedPublicControls = freeze({
    ...(result.worksheetDocument.publicControls ?? {}),
    ...publicControls,
  });
  const worksheetDocument = {
    ...result.worksheetDocument,
    title,
    summary: {
      ...(result.worksheetDocument.summary ?? {}),
      questionCount,
    },
    publicControls: mergedPublicControls,
    metadata: {
      ...(result.worksheetDocument.metadata ?? {}),
      title,
      questionCount,
      publicControls: mergedPublicControls,
    },
  };
  return freeze({ ...result, worksheetDocument });
}

export function publicControlPreviewLabel(metadata) {
  if (!metadata) return "";
  return `題型 ${metadata.questionMode}｜深度 ${metadata.depthMode}｜情境 ${metadata.contextMode}`;
}
