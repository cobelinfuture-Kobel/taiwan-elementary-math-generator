export * from "./batch-a-browser-generator-p04f26.js";
import { buildBatchABrowserPlan as baseBuild } from "./batch-a-browser-generator-p04f26.js";
import {
  G4A_U06_P04F27_SOURCE_ID,
  G4A_U06_P04F27_KP_ID,
  G4A_U06_P04F27_GROUP_ID,
  G4A_U06_P04F27_SPEC_ID,
} from "../registry/g4a-u06-fraction-times-integer-quantity-selector-projection-p04f27.js";
export function requestsP04F27(options = {}) {
  if (options.sourceId !== G4A_U06_P04F27_SOURCE_ID) return false;
  const mode = options.selectionMode ?? "sourceUnit";
  if (mode === "sourceUnit") return false;
  return (options.selectedKnowledgePointIds ?? []).includes(G4A_U06_P04F27_KP_ID)
    || (options.selectedPatternGroupIds ?? []).includes(G4A_U06_P04F27_GROUP_ID)
    || (options.patternSpecIds ?? []).includes(G4A_U06_P04F27_SPEC_ID);
}
export function buildBatchABrowserPlan(options = {}) {
  const plan = baseBuild(options);
  if (!requestsP04F27(options)) return plan;
  return Object.freeze({
    ...plan,
    sourceId: G4A_U06_P04F27_SOURCE_ID,
    sourceUnit: Object.freeze({ sourceId: G4A_U06_P04F27_SOURCE_ID, grade: 4, semester: "upper", unitCode: "4A-U06", title: "假分數與帶分數", domain: "fractional_quantity" }),
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: Object.freeze([G4A_U06_P04F27_KP_ID]),
    patternSpecIds: Object.freeze([G4A_U06_P04F27_SPEC_ID]),
    allocation: null,
    questionMode: "application",
    requestedQuestionType: "application",
    requestedKnowledgePointIds: Object.freeze([G4A_U06_P04F27_KP_ID]),
    requestedPatternGroupIds: Object.freeze([G4A_U06_P04F27_GROUP_ID]),
    questionCount: Number(options.questionCount ?? 8),
    generationSeed: String(options.generationSeed ?? "p04f27-fraction-quantity"),
    publicControls: Object.freeze({ sourceId: G4A_U06_P04F27_SOURCE_ID, questionMode: "application", requestedQuestionType: "application", productWave: "R06-W4", productAdmissionTask: "P04F_W4DirectProductVerticalSlice027Implementation", globalContextAuthority: "NOT_REQUIRED_DIRECT_SOURCE_QUANTITY_SEMANTICS" }),
    publicPatternSpecInjectionUsed: false,
    genericFallbackAllowed: false,
  });
}
