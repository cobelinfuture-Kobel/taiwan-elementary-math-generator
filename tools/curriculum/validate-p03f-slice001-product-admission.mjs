import { materializeP03FSlice001ProductAdmission } from "../../src/curriculum/full-product/p03f-slice001-product-admission.mjs";

export function validateP03FSlice001ProductAdmission() {
  const evidence = materializeP03FSlice001ProductAdmission();
  const errors = [];
  const expected = evidence.manifest.expectedCounts;
  const metrics = evidence.metrics;
  const first = evidence.firstSlice;

  if (first?.queuePosition !== 1
    || first?.sliceId !== "p03e_q001_r4_g3a_u08_3a08_profile_fraction_c1"
    || first?.implementationTaskId !== "P03F_W3DirectProductVerticalSlice001Implementation") {
    errors.push("P03F_QUEUE_IDENTITY_INVALID");
  }
  if (first?.knowledgePointIds?.length !== 1
    || first.knowledgePointIds[0] !== "kp_g3a_u08_part_whole_fraction") {
    errors.push("P03F_QUEUE_KP_INVALID");
  }
  for (const key of [
    "sourceNodeCount",
    "knowledgePointCount",
    "tagBindingCount",
    "formalMappingCount",
    "patternGroupCount",
    "patternSpecCount",
    "representationModeCount",
    "requiredCapabilityCount",
    "publicSourceCountAfterAdmission",
    "publicVisibleKnowledgePointCountForSource",
    "questionWitnessCount",
    "answerKeyWitnessCount",
    "htmlWitnessCount",
    "newProductAdmissionCount",
    "remainingDirectSliceCount",
    "remainingDirectKnowledgePointCount",
    "laterWaveDependentCount"
  ]) {
    if (metrics[key] !== expected[key]) errors.push(`P03F_METRIC_INVALID:${key}:${metrics[key]}:${expected[key]}`);
  }
  if (!evidence.selectorProjectionAudit.ok) errors.push(...evidence.selectorProjectionAudit.errors.map((code) => `P03F_SELECTOR_PROJECTION:${code}`));
  if (!evidence.selectorCompositionAudit.ok) errors.push(...evidence.selectorCompositionAudit.errors.map((code) => `P03F_SELECTOR_COMPOSITION:${code}`));
  if (!evidence.patternAudit.ok) errors.push(...evidence.patternAudit.errors.map((code) => `P03F_PATTERN:${code}`));
  if (!evidence.controlAudit.ok) errors.push(...evidence.controlAudit.errors.map((code) => `P03F_CONTROL:${code}`));
  if (!evidence.publicSource || evidence.publicSource.lifecycle !== "public_full_product_w3_slice001_release") errors.push("P03F_PUBLIC_SOURCE_ADAPTER_INVALID");
  if (!evidence.selectorRow || evidence.selectorRow.applicationClassification !== "APPLICATION_NOT_APPLICABLE") errors.push("P03F_PUBLIC_KP_INVALID");
  if (evidence.visibleGroups.length !== 1 || evidence.visibleGroups[0].publicQuestionMode !== "numeric") errors.push("P03F_PUBLIC_GROUP_INVALID");
  if (evidence.controlProfile?.questionTypeControl?.options?.length !== 1
    || evidence.controlProfile.questionTypeControl.options[0].value !== "numeric") errors.push("P03F_NUMERIC_ONLY_CONTROL_INVALID");
  if (!evidence.planValidation.ok) errors.push(...evidence.planValidation.errors.map((error) => `P03F_PLAN:${error.code}`));
  if (!evidence.generation.ok || evidence.generation.questions.length !== expected.questionWitnessCount) errors.push("P03F_GENERATION_INVALID");
  if (!evidence.questionValidation.ok) errors.push(...evidence.questionValidation.errors.map((error) => `P03F_BROWSER_VALIDATOR:${error.code}`));
  if (evidence.representationModes.join(",") !== "CONTINUOUS_EQUAL_PARTITION,DISCRETE_SET_PARTITION") errors.push(`P03F_REPRESENTATION_COVERAGE_INVALID:${evidence.representationModes.join(",")}`);
  if (evidence.capabilityWitnesses.some((row) => !row.numberSystemOk || !row.domainValidatorOk)) errors.push("P03F_W3_CAPABILITY_BINDING_INVALID");
  if (!evidence.worksheet.ok || !evidence.worksheet.worksheetDocument) errors.push("P03F_WORKSHEET_INVALID");
  if (evidence.worksheet.worksheetDocument?.generatedQuestions?.length !== expected.questionWitnessCount) errors.push("P03F_WORKSHEET_QUESTION_COUNT_INVALID");
  if (evidence.worksheet.worksheetDocument?.answerKeyItems?.length !== expected.answerKeyWitnessCount) errors.push("P03F_ANSWER_KEY_COUNT_INVALID");
  if (!evidence.html.includes("<!doctype html>") || !evidence.html.includes("worksheet-page--questions") || !evidence.html.includes("worksheet-page--answer-key")) errors.push("P03F_HTML_INVALID");
  if (/(?:算式|_{2,}|答\s*[:：])/.test(evidence.generation.questions.map((row) => row.blankedDisplayText).join("\n"))) errors.push("P03F_FORBIDDEN_LABEL_PRESENT");
  if (evidence.generation.questions.some((row) => row.questionMode !== "numeric" || row.metadata?.applicationClassification !== "APPLICATION_NOT_APPLICABLE")) errors.push("P03F_APPLICATION_SCOPE_VIOLATION");
  if (evidence.authority.patternSpec.successorOfHiddenAuthorityPath !== "data/curriculum/application/pattern-specs/w02/g3a_u08_3a08.hidden-pattern-spec.json") errors.push("P03F_HIDDEN_SUCCESSOR_AUTHORITY_INVALID");
  if (evidence.productAdmissionState !== "PRODUCTION_ADMITTED_D0" || evidence.d0Complete !== true) errors.push("P03F_D0_STATE_INVALID");
  if (evidence.manifest.mainlineBoundary.nextQueuePositionStarted
    || evidence.manifest.mainlineBoundary.otherG3AU08KnowledgePointsAdmitted
    || evidence.manifest.mainlineBoundary.applicationStoryGenerationAdded
    || evidence.manifest.mainlineBoundary.parallelRuntimePipelineAdded) errors.push("P03F_SCOPE_BOUNDARY_INVALID");

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    status: evidence.status,
    productAdmissionState: evidence.productAdmissionState,
    d0Complete: evidence.d0Complete,
    metrics,
    firstSlice,
    representationModes: evidence.representationModes,
  });
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const result = validateP03FSlice001ProductAdmission();
  console.log(`P03F_SLICE001_READBACK=${JSON.stringify(result)}`);
  if (!result.ok) console.error(`P03F_SLICE001_ERRORS=${JSON.stringify(result.errors)}`);
  process.exitCode = result.ok ? 0 : 1;
}
