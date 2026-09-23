import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP03FSlice010ProductAdmission } from "../../src/curriculum/full-product/p03f-slice010-product-admission.mjs";
import { getCurrentPixelRegistrySnapshot, listCurrentPixelSourceOptions, listPixelKnowledgePointsForSource } from "../../site/pixel/pixel-registry-bridge.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const EXPECTED_KP_ID = "kp_g4a_u09_hundredth_representation";
const EXPECTED_PATTERN_GROUP_ID = "pg_g4a_u09_hundredth_representation_numeric";
const EXPECTED_PATTERN_SPEC_ID = "ps_g4a_u09_hundredth_representation_decimal_numeric";
const EXPECTED_W3_CAPABILITY_IDS = Object.freeze(["cap_decimal_domain_validator", "cap_decimal_number_system"]);
const METRIC_KEYS = Object.freeze(["queuePosition", "sourceNodeCount", "knowledgePointCount", "tagBindingCount", "formalMappingCount", "patternGroupCount", "patternSpecCount", "numericPatternSpecCount", "applicationPatternSpecCount", "globalContextBindingCount", "requiredCapabilityCount", "publicSourceCountAfterAdmission", "publicVisibleKnowledgePointCountForSource", "questionWitnessCount", "answerKeyWitnessCount", "htmlWitnessCount", "chromiumPdfWitnessCount", "overflowFindingCount", "duplicatePromptFindingCount", "newProductAdmissionCount", "cumulativeW3ProductAdmissionCount", "remainingDirectSliceCount", "remainingDirectKnowledgePointCount", "laterWaveDependentCount"]);

function readJson(repoPath) { return JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8")); }
function hiddenPatternSpec() {
  const hidden = readJson("data/curriculum/application/pattern-specs/w02/g4a_u09_4a09.hidden-pattern-spec.json");
  return hidden.knowledgePoints
    .find((row) => row.knowledgePointId === EXPECTED_KP_ID)
    ?.patternSpecs?.find((row) => row.patternSpecId === EXPECTED_PATTERN_SPEC_ID) ?? null;
}

export function validateP03FSlice010ProductAdmission() {
  const evidence = materializeP03FSlice010ProductAdmission();
  const errors = [], expected = evidence.manifest.expectedCounts, metrics = evidence.metrics, slice = evidence.slice;
  if (slice?.queuePosition !== 10 || slice?.sliceId !== "p03e_q010_r6_g4a_u09_4a09_profile_decimal_c1" || slice?.implementationTaskId !== "P03F_W3DirectProductVerticalSlice010Implementation") errors.push("P03F10_QUEUE_IDENTITY_INVALID");
  if (slice?.previousSliceId !== "p03e_q009_r6_g3b_u09_3b09_profile_fraction_c1") errors.push("P03F10_PREDECESSOR_IDENTITY_INVALID");
  if (slice?.knowledgePointCount !== 1 || slice?.knowledgePointIds?.[0] !== EXPECTED_KP_ID) errors.push("P03F10_QUEUE_KP_SET_INVALID");
  if (JSON.stringify(slice?.requiredW3CapabilityIds) !== JSON.stringify(EXPECTED_W3_CAPABILITY_IDS)) errors.push("P03F10_QUEUE_CAPABILITY_SET_INVALID");
  if (evidence.authority.knowledgePoint.knowledgePointId !== EXPECTED_KP_ID || JSON.stringify(evidence.authority.knowledgePoint.requiredCapabilityIds) !== JSON.stringify(EXPECTED_W3_CAPABILITY_IDS)) errors.push("P03F10_AUTHORITY_CAPABILITY_SET_INVALID");
  if (!evidence.predecessorPassed) errors.push("P03F10_PREDECESSOR_SLICE009_NOT_D0");
  for (const key of METRIC_KEYS) if (metrics[key] !== expected[key]) errors.push(`P03F10_METRIC_INVALID:${key}:${metrics[key]}:${expected[key]}`);
  const hidden = hiddenPatternSpec();
  if (!hidden || hidden.patternGroupId !== EXPECTED_PATTERN_GROUP_ID || hidden.operationModelId !== "op_g4a_u09_hundredth_representation" || hidden.requestedUnknownRole !== "decimal" || JSON.stringify(hidden.givenRoles) !== JSON.stringify(["whole", "fractionalUnits", "placeUnit"])) errors.push("P03F10_HIDDEN_PATTERNSPEC_PARITY_INVALID");
  if (!evidence.selectorProjectionAudit.ok) errors.push(...evidence.selectorProjectionAudit.errors.map((code) => `P03F10_SELECTOR_PROJECTION:${code}`));
  if (!evidence.selectorCompositionAudit.ok) errors.push(...evidence.selectorCompositionAudit.errors.map((code) => `P03F10_SELECTOR_COMPOSITION:${code}`));
  if (!evidence.patternAudit.ok) errors.push(...evidence.patternAudit.errors.map((code) => `P03F10_PATTERN:${code}`));
  if (!evidence.controlAudit.ok) errors.push(...evidence.controlAudit.errors.map((code) => `P03F10_CONTROL:${code}`));
  if (!evidence.publicSource || evidence.selectorRow?.knowledgePointId !== EXPECTED_KP_ID || evidence.visibleGroups.length !== 1 || evidence.visibleGroups[0].patternGroupId !== EXPECTED_PATTERN_GROUP_ID) errors.push("P03F10_PUBLIC_SELECTOR_SURFACE_INVALID");
  if (evidence.availability?.visibleCount !== 1 || evidence.availability?.hiddenPendingCount !== 6) errors.push("P03F10_PUBLIC_AVAILABILITY_INVALID");
  const controlModes = evidence.controlProfile?.questionTypeControl?.options?.map((row) => row.value) ?? [];
  if (JSON.stringify(controlModes) !== JSON.stringify(["numeric"]) || evidence.controlProfile?.contextControl?.supported !== false) errors.push("P03F10_PUBLIC_CONTROL_INVALID");
  const pixelSources = listCurrentPixelSourceOptions();
  const pixelRows = listPixelKnowledgePointsForSource("g4a_u09_4a09");
  const pixelSnapshot = getCurrentPixelRegistrySnapshot();
  const historicalPixelRow = pixelRows.find((row) => row.knowledgePointId === EXPECTED_KP_ID);
  if (pixelSources.length < 24 || !historicalPixelRow || pixelSnapshot.sourceCount < 24) errors.push("P03F10_PIXEL_SURFACE_INVALID");
  if (!evidence.planValidation.ok) errors.push(...evidence.planValidation.errors.map((row) => `P03F10_PLAN:${row.code}`));
  if (!evidence.generation.ok || evidence.generation.questions.length !== 8 || evidence.generation.allocation.length !== 1 || evidence.generation.allocation[0].questionCount !== 8) errors.push("P03F10_GENERATION_INVALID");
  if (!evidence.questionValidation.ok) errors.push(...evidence.questionValidation.errors.map((row) => `P03F10_BROWSER_VALIDATOR:${row.code}`));
  const prompts = evidence.generation.questions.map((row) => row.blankedDisplayText);
  if (new Set(prompts).size !== prompts.length) errors.push("P03F10_DUPLICATE_PROMPT");
  if (evidence.generation.questions.some((row) => row.questionMode !== "numeric" || row.metadata?.applicationClassification !== "APPLICATION_NOT_APPLICABLE" || row.metadata?.knowledgePointId !== EXPECTED_KP_ID)) errors.push("P03F10_APPLICATION_OR_KP_SCOPE_VIOLATION");
  if (evidence.generation.questions.some((row) => row.whole !== 0 || row.fractionalUnits !== 1 || row.placeUnit !== "0.01" || row.decimalValue !== "0.01" || row.answerText !== "0.01" || row.finalAnswer?.scale !== 2 || row.finalAnswer?.exact !== true)) errors.push("P03F10_CANONICAL_DECIMAL_IDENTITY_INVALID");
  if (evidence.generation.questions.some((row) => /(?:算式|_{2,}|答\s*[:：]|\{\{)/.test(row.blankedDisplayText ?? ""))) errors.push("P03F10_FORBIDDEN_SURFACE_PRESENT");
  if (evidence.capabilityWitnesses.some((row) => !row.numberSystemOk || !row.domainValidatorOk || row.domainCanonicalIdentity !== "1e-2" || JSON.stringify(row.canonicalValue) !== JSON.stringify(row.domainCanonicalValue))) errors.push("P03F10_W3_CAPABILITY_BINDING_INVALID");
  if (!evidence.worksheet.ok || !evidence.document || evidence.document.generatedQuestions?.length !== 8 || evidence.document.answerKeyItems?.length !== 8 || evidence.document.questionPages?.length !== 1 || evidence.document.answerKeyPages?.length !== 1) errors.push("P03F10_WORKSHEET_ANSWER_KEY_INVALID");
  if (!evidence.html.includes("<!doctype html>") || !evidence.html.includes("worksheet-page--questions") || !evidence.html.includes("worksheet-page--answer-key") || !evidence.html.includes("break-after: page")) errors.push("P03F10_HTML_INVALID");
  const boundaryPolicy = evidence.authority.productBoundary;
  if (boundaryPolicy.applicationModeAllowed || boundaryPolicy.parallelPipelineAllowed || !boundaryPolicy.otherG4AU09KnowledgePointsExcluded) errors.push("P03F10_AUTHORITY_BOUNDARY_INVALID");
  const status = String(evidence.manifest.status);
  const preReviewPending = status.includes("PENDING_CHROMIUM_ACCEPTANCE") || status.includes("PENDING_VISUAL_REVIEW");
  if (preReviewPending) {
    if (evidence.artifactIntegrity.ok || evidence.productAdmissionState !== "RUNTIME_CONNECTED_PENDING_CHROMIUM_ACCEPTANCE" || evidence.d0Complete) errors.push("P03F10_PRE_D0_FAIL_CLOSE_INVALID");
  } else if (!evidence.artifactIntegrity.ok || evidence.productAdmissionState !== "PRODUCTION_ADMITTED_D0" || !evidence.d0Complete) errors.push("P03F10_D0_ARTIFACT_STATE_INVALID");
  const boundary = evidence.manifest.mainlineBoundary;
  if (boundary.queuePositionConsumed !== (evidence.d0Complete ? 10 : 9) || boundary.nextQueuePositionStarted || boundary.otherG4AU09KnowledgePointsAdmitted || boundary.decimalArithmeticAdded || boundary.applicationStoryGenerationAdded || boundary.parallelRuntimePipelineAdded || boundary.sharedWorksheetRendererBehaviorChanged || boundary.slice010KnowledgePointAdmitted !== evidence.d0Complete) errors.push("P03F10_SCOPE_BOUNDARY_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), status: evidence.status, productAdmissionState: evidence.productAdmissionState, d0Complete: evidence.d0Complete, artifactIntegrity: evidence.artifactIntegrity, metrics, slice });
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const result = validateP03FSlice010ProductAdmission();
  console.log(`P03F_SLICE010_READBACK=${JSON.stringify(result)}`);
  if (!result.ok) console.error(`P03F_SLICE010_ERRORS=${JSON.stringify(result.errors)}`);
  process.exitCode = result.ok ? 0 : 1;
}
