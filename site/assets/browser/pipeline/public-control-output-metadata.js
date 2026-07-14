import { getPublicControlProfile } from "../../../modules/curriculum/registry/public-control-profiles.js";
import { resolveWorksheetQuestionCount } from "./worksheet-output-count.js";
import { resolveWorksheetTitle } from "./worksheet-output-title.js";

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
}

export function buildPublicControlOutputMetadata(plan = {}) {
  const profile = getPublicControlProfile(plan.sourceId);
  if (!profile) return null;
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
  if (!result?.worksheetDocument) return result;
  const publicControls = buildPublicControlOutputMetadata(plan);
  if (!publicControls) return result;
  const questionCount = resolveWorksheetQuestionCount(result.worksheetDocument);
  const title = resolveWorksheetTitle(result.worksheetDocument, plan);
  const worksheetDocument = {
    ...result.worksheetDocument,
    title,
    summary: {
      ...(result.worksheetDocument.summary ?? {}),
      questionCount,
    },
    publicControls,
    metadata: {
      ...(result.worksheetDocument.metadata ?? {}),
      title,
      questionCount,
      publicControls,
    },
  };
  return freeze({ ...result, worksheetDocument });
}

export function publicControlPreviewLabel(metadata) {
  if (!metadata) return "";
  return `題型 ${metadata.questionMode}｜深度 ${metadata.depthMode}｜情境 ${metadata.contextMode}`;
}
