import { materializeP03FSlice004ProductAdmission } from "../../src/curriculum/full-product/p03f-slice004-product-admission.mjs";

const EXPECTED_W3_CAPABILITY_IDS = Object.freeze([
  "cap_decimal_domain_validator",
  "cap_decimal_number_system",
]);

export function validateP03FSlice004ProductAdmission() {
  const evidence = materializeP03FSlice004ProductAdmission();
  const errors = [];
  const expected = evidence.manifest.expectedCounts;
  const metrics = evidence.metrics;
  const slice = evidence.slice;
  if (slice?.queuePosition !== 4 || slice?.sliceId !== "p03e_q004_r5_g3b_u09_3b09_profile_decimal_c1" || slice?.implementationTaskId !== "P03F_W3DirectProductVerticalSlice004Implementation") errors.push("P03F4_QUEUE_IDENTITY_INVALID");
  if (JSON.stringify(slice?.knowledgePointIds) !== JSON.stringify(["kp_g3b_u09_tenth_representation"])) errors.push("P03F4_QUEUE_KP_SET_INVALID");
  if (JSON.stringify(slice?.requiredW3CapabilityIds) !== JSON.stringify(EXPECTED_W3_CAPABILITY_IDS)) errors.push("P03F4_QUEUE_CAPABILITY_SET_INVALID");
  if (JSON.stringify(evidence.authority.knowledgePoint.requiredCapabilityIds) !== JSON.stringify(EXPECTED_W3_CAPABILITY_IDS)) errors.push("P03F4_AUTHORITY_CAPABILITY_SET_INVALID");
  if (!evidence.predecessorPassed) errors.push("P03F4_PREDECESSOR_SLICE003_NOT_D0");
  for (const key of ["queuePosition","sourceNodeCount","knowledgePointCount","tagBindingCount","formalMappingCount","patternGroupCount","patternSpecCount","numericPatternSpecCount","applicationPatternSpecCount","globalContextBindingCount","requiredCapabilityCount","publicSourceCountAfterAdmission","publicVisibleKnowledgePointCountForSource","questionWitnessCount","answerKeyWitnessCount","htmlWitnessCount","chromiumPdfWitnessCount","overflowFindingCount","duplicatePromptFindingCount","newProductAdmissionCount","cumulativeW3ProductAdmissionCount","remainingDirectSliceCount","remainingDirectKnowledgePointCount","laterWaveDependentCount"]) {
    if (metrics[key] !== expected[key]) errors.push(`P03F4_METRIC_INVALID:${key}:${metrics[key]}:${expected[key]}`);
  }
  if (!evidence.selectorProjectionAudit.ok) errors.push(...evidence.selectorProjectionAudit.errors.map((code) => `P03F4_SELECTOR_PROJECTION:${code}`));
  if (!evidence.selectorCompositionAudit.ok) errors.push(...evidence.selectorCompositionAudit.errors.map((code) => `P03F4_SELECTOR_COMPOSITION:${code}`));
  if (!evidence.patternAudit.ok) errors.push(...evidence.patternAudit.errors.map((code) => `P03F4_PATTERN:${code}`));
  if (!evidence.controlAudit.ok) errors.push(...evidence.controlAudit.errors.map((code) => `P03F4_CONTROL:${code}`));
  if (!evidence.publicSource || evidence.publicSource.sourceId !== "g3b_u09_3b09") errors.push("P03F4_PUBLIC_SOURCE_ADAPTER_INVALID");
  if (!evidence.selectorRow || evidence.visibleGroups.length !== 1) errors.push("P03F4_PUBLIC_SELECTOR_SURFACE_INVALID");
  const controlModes = evidence.controlProfile?.questionTypeControl?.options?.map((row) => row.value) ?? [];
  if (JSON.stringify(controlModes) !== JSON.stringify(["numeric"]) || evidence.controlProfile?.contextControl?.supported !== false) errors.push("P03F4_PUBLIC_CONTROL_INVALID");
  if (!evidence.planValidation.ok) errors.push(...evidence.planValidation.errors.map((row) => `P03F4_PLAN:${row.code}`));
  if (!evidence.generation.ok || evidence.generation.questions.length !== 8) errors.push("P03F4_GENERATION_INVALID");
  if (!evidence.questionValidation.ok) errors.push(...evidence.questionValidation.errors.map((row) => `P03F4_BROWSER_VALIDATOR:${row.code}`));
  const prompts = evidence.generation.questions.map((row) => row.blankedDisplayText);
  if (new Set(prompts).size !== prompts.length) errors.push("P03F4_DUPLICATE_PROMPT");
  if (evidence.generation.questions.some((row) => row.questionMode !== "numeric" || row.metadata?.applicationClassification !== "APPLICATION_NOT_APPLICABLE")) errors.push("P03F4_APPLICATION_SCOPE_VIOLATION");
  if (evidence.generation.questions.some((row) => row.answerText !== "0.1" || row.decimalValue !== "0.1" || row.whole !== 0 || row.fractionalUnits !== 1 || row.placeUnit !== "0.1" || row.finalAnswer?.coefficient !== "1" || row.finalAnswer?.scale !== 1)) errors.push("P03F4_TENTH_DECIMAL_IDENTITY_INVALID");
  if (evidence.generation.questions.some((row) => /(?:算式|_{2,}|答\s*[:：]|\{\{)/.test(row.blankedDisplayText ?? ""))) errors.push("P03F4_FORBIDDEN_SURFACE_PRESENT");
  if (evidence.capabilityWitnesses.some((row) => (
    !row.numberSystemOk
    || !row.domainValidatorOk
    || row.canonicalValue?.coefficient !== "1"
    || row.canonicalValue?.scale !== 1
    || row.canonicalValue?.canonicalText !== "0.1"
    || JSON.stringify(row.canonicalValue) !== JSON.stringify(row.domainCanonicalValue)
  ))) errors.push("P03F4_W3_CAPABILITY_BINDING_INVALID");
  if (!evidence.worksheet.ok || !evidence.document || evidence.document.generatedQuestions?.length !== 8 || evidence.document.answerKeyItems?.length !== 8) errors.push("P03F4_WORKSHEET_ANSWER_KEY_INVALID");
  if (!evidence.html.includes("<!doctype html>") || !evidence.html.includes("worksheet-page--questions") || !evidence.html.includes("worksheet-page--answer-key") || !evidence.html.includes("break-after: page")) errors.push("P03F4_HTML_INVALID");
  if (evidence.authority.productBoundary.applicationModeAllowed || !evidence.authority.productBoundary.globalContextBindingNotApplicable || evidence.authority.productBoundary.parallelPipelineAllowed) errors.push("P03F4_AUTHORITY_BOUNDARY_INVALID");
  const pendingExpected = evidence.manifest.status.includes("PENDING_CHROMIUM_ACCEPTANCE");
  if (pendingExpected) {
    if (evidence.artifactIntegrity.ok || evidence.productAdmissionState !== "PRODUCT_ACCEPTANCE_PENDING" || evidence.d0Complete) errors.push("P03F4_PRE_CHROMIUM_FAIL_CLOSE_INVALID");
  } else if (!evidence.artifactIntegrity.ok || evidence.productAdmissionState !== "PRODUCTION_ADMITTED_D0" || !evidence.d0Complete) errors.push("P03F4_D0_ARTIFACT_STATE_INVALID");
  const boundary = evidence.manifest.mainlineBoundary;
  if (boundary.queuePositionConsumed !== (evidence.d0Complete ? 4 : 3) || boundary.nextQueuePositionStarted || boundary.otherG3BU09KnowledgePointsAdmitted || boundary.applicationStoryGenerationAdded || boundary.parallelRuntimePipelineAdded) errors.push("P03F4_SCOPE_BOUNDARY_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), status: evidence.status, productAdmissionState: evidence.productAdmissionState, d0Complete: evidence.d0Complete, artifactIntegrity: evidence.artifactIntegrity, metrics, slice });
}
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const result = validateP03FSlice004ProductAdmission();
  console.log(`P03F_SLICE004_READBACK=${JSON.stringify(result)}`);
  if (!result.ok) console.error(`P03F_SLICE004_ERRORS=${JSON.stringify(result.errors)}`);
  process.exitCode = result.ok ? 0 : 1;
}
