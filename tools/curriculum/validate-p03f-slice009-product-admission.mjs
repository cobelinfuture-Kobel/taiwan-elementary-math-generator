import { materializeP03FSlice009ProductAdmission } from "../../src/curriculum/full-product/p03f-slice009-product-admission.mjs";

const EXPECTED_KP_ID = "kp_g3b_u09_tenths_fraction_decimal";
const EXPECTED_W3_CAPABILITY_IDS = Object.freeze(["cap_fraction_domain_validator", "cap_fraction_number_system"]);
const METRIC_KEYS = Object.freeze(["queuePosition", "sourceNodeCount", "knowledgePointCount", "tagBindingCount", "formalMappingCount", "patternGroupCount", "patternSpecCount", "numericPatternSpecCount", "applicationPatternSpecCount", "globalContextBindingCount", "requiredCapabilityCount", "publicSourceCountAfterAdmission", "publicVisibleKnowledgePointCountForSource", "questionWitnessCount", "answerKeyWitnessCount", "fractionToDecimalWitnessCount", "decimalToFractionWitnessCount", "htmlWitnessCount", "chromiumPdfWitnessCount", "overflowFindingCount", "duplicatePromptFindingCount", "newProductAdmissionCount", "cumulativeW3ProductAdmissionCount", "remainingDirectSliceCount", "remainingDirectKnowledgePointCount", "laterWaveDependentCount"]);

export function validateP03FSlice009ProductAdmission() {
  const evidence = materializeP03FSlice009ProductAdmission();
  const errors = [], expected = evidence.manifest.expectedCounts, metrics = evidence.metrics, slice = evidence.slice;
  if (slice?.queuePosition !== 9 || slice?.sliceId !== "p03e_q009_r6_g3b_u09_3b09_profile_fraction_c1" || slice?.implementationTaskId !== "P03F_W3DirectProductVerticalSlice009Implementation") errors.push("P03F9_QUEUE_IDENTITY_INVALID");
  if (slice?.knowledgePointCount !== 1 || slice?.knowledgePointIds?.[0] !== EXPECTED_KP_ID) errors.push("P03F9_QUEUE_KP_SET_INVALID");
  if (JSON.stringify(slice?.requiredW3CapabilityIds) !== JSON.stringify(EXPECTED_W3_CAPABILITY_IDS)) errors.push("P03F9_QUEUE_CAPABILITY_SET_INVALID");
  const authorityKp = evidence.authority.knowledgePoints?.[0];
  if (evidence.authority.knowledgePoints.length !== 1 || authorityKp.knowledgePointId !== EXPECTED_KP_ID || JSON.stringify(authorityKp.requiredW3CapabilityIds) !== JSON.stringify(EXPECTED_W3_CAPABILITY_IDS)) errors.push("P03F9_AUTHORITY_CAPABILITY_SET_INVALID");
  if (!evidence.predecessorPassed) errors.push("P03F9_PREDECESSOR_SLICE008_NOT_D0");
  for (const key of METRIC_KEYS) if (metrics[key] !== expected[key]) errors.push(`P03F9_METRIC_INVALID:${key}:${metrics[key]}:${expected[key]}`);
  if (!evidence.selectorProjectionAudit.ok) errors.push(...evidence.selectorProjectionAudit.errors.map((code) => `P03F9_SELECTOR_PROJECTION:${code}`));
  if (!evidence.selectorCompositionAudit.ok) errors.push(...evidence.selectorCompositionAudit.errors.map((code) => `P03F9_SELECTOR_COMPOSITION:${code}`));
  if (!evidence.patternAudit.ok) errors.push(...evidence.patternAudit.errors.map((code) => `P03F9_PATTERN:${code}`));
  if (!evidence.controlAudit.ok) errors.push(...evidence.controlAudit.errors.map((code) => `P03F9_CONTROL:${code}`));
  if (!evidence.publicSource || evidence.selectorRows.length !== 1 || evidence.visibleGroups.length !== 1) errors.push("P03F9_PUBLIC_SELECTOR_SURFACE_INVALID");
  if (evidence.availability?.visibleCount !== 4 || evidence.availability?.hiddenPendingCount !== 3) errors.push("P03F9_PUBLIC_AVAILABILITY_INVALID");
  const controlModes = evidence.controlProfile?.questionTypeControl?.options?.map((row) => row.value) ?? [];
  if (JSON.stringify(controlModes) !== JSON.stringify(["numeric"]) || evidence.controlProfile?.contextControl?.supported !== false) errors.push("P03F9_PUBLIC_CONTROL_INVALID");
  if (evidence.pixelSnapshot?.sourceCount !== 23 || evidence.pixelRows.length !== 4) errors.push("P03F9_PIXEL_SURFACE_INVALID");
  if (!evidence.planValidation.ok) errors.push(...evidence.planValidation.errors.map((row) => `P03F9_PLAN:${row.code}`));
  if (!evidence.generation.ok || evidence.generation.questions.length !== 8 || evidence.generation.allocation.length !== 1 || evidence.generation.allocation[0].questionCount !== 8) errors.push("P03F9_GENERATION_INVALID");
  if (evidence.generation.directionCounts?.fraction_to_decimal !== 4 || evidence.generation.directionCounts?.decimal_to_fraction !== 4) errors.push("P03F9_DIRECTION_ALLOCATION_INVALID");
  if (!evidence.questionValidation.ok) errors.push(...evidence.questionValidation.errors.map((row) => `P03F9_BROWSER_VALIDATOR:${row.code}`));
  const prompts = evidence.generation.questions.map((row) => row.blankedDisplayText);
  if (new Set(prompts).size !== prompts.length) errors.push("P03F9_DUPLICATE_PROMPT");
  if (evidence.generation.questions.some((row) => row.questionMode !== "numeric" || row.metadata?.applicationClassification !== "APPLICATION_NOT_APPLICABLE" || row.metadata?.knowledgePointId !== EXPECTED_KP_ID)) errors.push("P03F9_APPLICATION_OR_KP_SCOPE_VIOLATION");
  if (evidence.generation.questions.some((row) => row.denominator !== 10 || row.decimalScale !== 1 || row.decimalValue !== `0.${row.numerator}` || row.fractionText !== `${row.numerator}/10` || row.finalAnswer?.exact !== true)) errors.push("P03F9_CANONICAL_CONVERSION_IDENTITY_INVALID");
  if (evidence.generation.questions.some((row) => /(?:算式|_{2,}|答\s*[:：]|\{\{)/.test(row.blankedDisplayText ?? ""))) errors.push("P03F9_FORBIDDEN_SURFACE_PRESENT");
  if (evidence.capabilityWitnesses.some((row) => !row.numberSystemOk || !row.domainValidatorOk || !row.sourceDenominatorPreserved || JSON.stringify(row.canonicalValue) !== JSON.stringify(row.domainCanonicalValue))) errors.push("P03F9_W3_CAPABILITY_BINDING_INVALID");
  if (!evidence.worksheet.ok || !evidence.document || evidence.document.generatedQuestions?.length !== 8 || evidence.document.answerKeyItems?.length !== 8 || evidence.document.questionPages?.length !== 1 || evidence.document.answerKeyPages?.length !== 1) errors.push("P03F9_WORKSHEET_ANSWER_KEY_INVALID");
  if (!evidence.html.includes("<!doctype html>") || !evidence.html.includes("worksheet-page--questions") || !evidence.html.includes("worksheet-page--answer-key") || !evidence.html.includes("break-after: page")) errors.push("P03F9_HTML_INVALID");
  if (evidence.authority.acceptancePolicy.applicationRouteAllowed || evidence.authority.acceptancePolicy.parallelPipelineAllowed || evidence.authority.mainlineBoundary.decimalArithmeticAdded) errors.push("P03F9_AUTHORITY_BOUNDARY_INVALID");
  const pendingExpected = evidence.manifest.status.includes("PENDING_CHROMIUM_ACCEPTANCE");
  if (pendingExpected) {
    if (evidence.artifactIntegrity.ok || evidence.productAdmissionState !== "PRODUCT_ACCEPTANCE_PENDING" || evidence.d0Complete) errors.push("P03F9_PRE_CHROMIUM_FAIL_CLOSE_INVALID");
  } else if (!evidence.artifactIntegrity.ok || evidence.productAdmissionState !== "PRODUCTION_ADMITTED_D0" || !evidence.d0Complete) errors.push("P03F9_D0_ARTIFACT_STATE_INVALID");
  const boundary = evidence.manifest.mainlineBoundary;
  if (boundary.queuePositionConsumed !== (evidence.d0Complete ? 9 : 8) || boundary.nextQueuePositionStarted || boundary.otherG3BU09KnowledgePointsAdmitted || boundary.decimalArithmeticAdded || boundary.applicationStoryGenerationAdded || boundary.parallelRuntimePipelineAdded || boundary.sharedWorksheetRendererBehaviorChanged || boundary.slice009KnowledgePointAdmitted !== evidence.d0Complete) errors.push("P03F9_SCOPE_BOUNDARY_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), status: evidence.status, productAdmissionState: evidence.productAdmissionState, d0Complete: evidence.d0Complete, artifactIntegrity: evidence.artifactIntegrity, metrics, slice });
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const result = validateP03FSlice009ProductAdmission();
  console.log(`P03F_SLICE009_READBACK=${JSON.stringify(result)}`);
  if (!result.ok) console.error(`P03F_SLICE009_ERRORS=${JSON.stringify(result.errors)}`);
  process.exitCode = result.ok ? 0 : 1;
}
