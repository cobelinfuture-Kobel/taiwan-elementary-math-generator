import { materializeP03FSlice008ProductAdmission } from "../../src/curriculum/full-product/p03f-slice008-product-admission.mjs";

const EXPECTED_KP_IDS = Object.freeze(["kp_g3b_u09_decimal_compose_decompose", "kp_g3b_u09_decimal_read_write"]);
const EXPECTED_W3_CAPABILITY_IDS = Object.freeze(["cap_decimal_domain_validator", "cap_decimal_number_system"]);
const METRIC_KEYS = Object.freeze(["queuePosition", "sourceNodeCount", "knowledgePointCount", "tagBindingCount", "formalMappingCount", "patternGroupCount", "patternSpecCount", "numericPatternSpecCount", "applicationPatternSpecCount", "globalContextBindingCount", "requiredCapabilityCount", "publicSourceCountAfterAdmission", "publicVisibleKnowledgePointCountForSource", "questionWitnessCount", "answerKeyWitnessCount", "htmlWitnessCount", "chromiumPdfWitnessCount", "overflowFindingCount", "duplicatePromptFindingCount", "newProductAdmissionCount", "cumulativeW3ProductAdmissionCount", "remainingDirectSliceCount", "remainingDirectKnowledgePointCount", "laterWaveDependentCount"]);

export function validateP03FSlice008ProductAdmission() {
  const evidence = materializeP03FSlice008ProductAdmission();
  const errors = [], expected = evidence.manifest.expectedCounts, metrics = evidence.metrics, slice = evidence.slice;
  if (slice?.queuePosition !== 8 || slice?.sliceId !== "p03e_q008_r6_g3b_u09_3b09_profile_decimal_c1" || slice?.implementationTaskId !== "P03F_W3DirectProductVerticalSlice008Implementation") errors.push("P03F8_QUEUE_IDENTITY_INVALID");
  if (JSON.stringify([...(slice?.knowledgePointIds ?? [])].sort()) !== JSON.stringify(EXPECTED_KP_IDS)) errors.push("P03F8_QUEUE_KP_SET_INVALID");
  if (JSON.stringify(slice?.requiredW3CapabilityIds) !== JSON.stringify(EXPECTED_W3_CAPABILITY_IDS)) errors.push("P03F8_QUEUE_CAPABILITY_SET_INVALID");
  if (evidence.authority.knowledgePoints.length !== 2 || evidence.authority.knowledgePoints.some((row) => JSON.stringify(row.requiredCapabilityIds) !== JSON.stringify(EXPECTED_W3_CAPABILITY_IDS))) errors.push("P03F8_AUTHORITY_CAPABILITY_SET_INVALID");
  if (!evidence.predecessorPassed) errors.push("P03F8_PREDECESSOR_SLICE007_NOT_D0");
  for (const key of METRIC_KEYS) if (metrics[key] !== expected[key]) errors.push(`P03F8_METRIC_INVALID:${key}:${metrics[key]}:${expected[key]}`);
  for (const audit of evidence.selectorProjectionAudits) if (!audit.ok) errors.push(...audit.errors.map((code) => `P03F8_SELECTOR_PROJECTION:${code}`));
  if (!evidence.selectorCompositionAudit.ok) errors.push(...evidence.selectorCompositionAudit.errors.map((code) => `P03F8_SELECTOR_COMPOSITION:${code}`));
  if (!evidence.patternAudit.ok) errors.push(...evidence.patternAudit.errors.map((code) => `P03F8_PATTERN:${code}`));
  if (!evidence.controlAudit.ok) errors.push(...evidence.controlAudit.errors.map((code) => `P03F8_CONTROL:${code}`));
  if (!evidence.publicSource || evidence.selectorRows.length !== 2 || evidence.visibleGroups.length !== 2) errors.push("P03F8_PUBLIC_SELECTOR_SURFACE_INVALID");
  if (evidence.availability?.visibleCount !== 3 || evidence.availability?.hiddenPendingCount !== 4) errors.push("P03F8_PUBLIC_AVAILABILITY_INVALID");
  const controlModes = evidence.controlProfile?.questionTypeControl?.options?.map((row) => row.value) ?? [];
  if (JSON.stringify(controlModes) !== JSON.stringify(["numeric"]) || evidence.controlProfile?.contextControl?.supported !== false) errors.push("P03F8_PUBLIC_CONTROL_INVALID");
  const currentPixelIds = evidence.pixelRows.map((row) => row.knowledgePointId);
  if (evidence.pixelSnapshot?.sourceCount < 23 || evidence.pixelRows.length < 3 || EXPECTED_KP_IDS.some((id) => !currentPixelIds.includes(id))) errors.push("P03F8_PIXEL_SURFACE_INVALID");
  if (!evidence.planValidation.ok) errors.push(...evidence.planValidation.errors.map((row) => `P03F8_PLAN:${row.code}`));
  if (!evidence.generation.ok || evidence.generation.questions.length !== 8 || evidence.generation.allocation.length !== 2 || evidence.generation.allocation.some((row) => row.questionCount !== 4)) errors.push("P03F8_GENERATION_INVALID");
  if (!evidence.questionValidation.ok) errors.push(...evidence.questionValidation.errors.map((row) => `P03F8_BROWSER_VALIDATOR:${row.code}`));
  const prompts = evidence.generation.questions.map((row) => row.blankedDisplayText);
  if (new Set(prompts).size !== prompts.length) errors.push("P03F8_DUPLICATE_PROMPT");
  if (evidence.generation.questions.some((row) => row.questionMode !== "numeric" || row.metadata?.applicationClassification !== "APPLICATION_NOT_APPLICABLE" || !EXPECTED_KP_IDS.includes(row.metadata?.knowledgePointId))) errors.push("P03F8_APPLICATION_OR_KP_SCOPE_VIOLATION");
  if (evidence.generation.questions.some((row) => row.finalAnswer?.scale !== 1 || row.finalAnswer?.canonicalText !== row.decimalValue || row.finalAnswer?.exact !== true)) errors.push("P03F8_DECIMAL_CANONICAL_IDENTITY_INVALID");
  if (evidence.generation.questions.some((row) => /(?:算式|_{2,}|答\s*[:：]|\{\{)/.test(row.blankedDisplayText ?? ""))) errors.push("P03F8_FORBIDDEN_SURFACE_PRESENT");
  if (evidence.capabilityWitnesses.some((row) => !row.numberSystemOk || !row.domainValidatorOk || row.canonicalValue?.coefficient !== row.expectedCoefficient || row.canonicalValue?.scale !== row.expectedScale || JSON.stringify(row.canonicalValue) !== JSON.stringify(row.domainCanonicalValue) || row.domainCanonicalIdentity !== `${row.expectedCoefficient}e-${row.expectedScale}`)) errors.push("P03F8_W3_CAPABILITY_BINDING_INVALID");
  if (!evidence.worksheet.ok || !evidence.document || evidence.document.generatedQuestions?.length !== 8 || evidence.document.answerKeyItems?.length !== 8) errors.push("P03F8_WORKSHEET_ANSWER_KEY_INVALID");
  if (!evidence.html.includes("<!doctype html>") || !evidence.html.includes("worksheet-page--questions") || !evidence.html.includes("worksheet-page--answer-key") || !evidence.html.includes("break-after: page")) errors.push("P03F8_HTML_INVALID");
  if (evidence.authority.productBoundary.applicationModeAllowed || !evidence.authority.productBoundary.globalContextBindingNotApplicable || evidence.authority.productBoundary.parallelPipelineAllowed) errors.push("P03F8_AUTHORITY_BOUNDARY_INVALID");
  const pendingExpected = evidence.manifest.status.includes("PENDING_CHROMIUM_ACCEPTANCE");
  if (pendingExpected) {
    if (evidence.artifactIntegrity.ok || evidence.productAdmissionState !== "PRODUCT_ACCEPTANCE_PENDING" || evidence.d0Complete) errors.push("P03F8_PRE_CHROMIUM_FAIL_CLOSE_INVALID");
  } else if (!evidence.artifactIntegrity.ok || evidence.productAdmissionState !== "PRODUCTION_ADMITTED_D0" || !evidence.d0Complete) errors.push("P03F8_D0_ARTIFACT_STATE_INVALID");
  const boundary = evidence.manifest.mainlineBoundary;
  if (boundary.queuePositionConsumed !== (evidence.d0Complete ? 8 : 7) || boundary.nextQueuePositionStarted || boundary.otherG3BU09KnowledgePointsAdmitted || boundary.applicationStoryGenerationAdded || boundary.parallelRuntimePipelineAdded || boundary.sharedWorksheetRendererBehaviorChanged || boundary.slice008KnowledgePointsAdmitted !== evidence.d0Complete) errors.push("P03F8_SCOPE_BOUNDARY_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), status: evidence.status, productAdmissionState: evidence.productAdmissionState, d0Complete: evidence.d0Complete, artifactIntegrity: evidence.artifactIntegrity, metrics, slice });
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const result = validateP03FSlice008ProductAdmission();
  console.log(`P03F_SLICE008_READBACK=${JSON.stringify(result)}`);
  if (!result.ok) console.error(`P03F_SLICE008_ERRORS=${JSON.stringify(result.errors)}`);
  process.exitCode = result.ok ? 0 : 1;
}
