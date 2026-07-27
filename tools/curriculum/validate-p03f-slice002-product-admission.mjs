import { materializeP03FSlice002ProductAdmission } from "../../src/curriculum/full-product/p03f-slice002-product-admission.mjs";

export function validateP03FSlice002ProductAdmission() {
  const evidence = materializeP03FSlice002ProductAdmission();
  const errors = [];
  const expected = evidence.manifest.expectedCounts;
  const metrics = evidence.metrics;
  const slice = evidence.slice;
  if (slice?.queuePosition !== 2 || slice?.sliceId !== "p03e_q002_r5_g3a_u08_3a08_profile_fraction_c1" || slice?.implementationTaskId !== "P03F_W3DirectProductVerticalSlice002Implementation") errors.push("P03F2_QUEUE_IDENTITY_INVALID");
  if (JSON.stringify(slice?.knowledgePointIds) !== JSON.stringify(["kp_g3a_u08_discrete_set_fraction", "kp_g3a_u08_unit_fraction_accumulation"])) errors.push("P03F2_QUEUE_KP_SET_INVALID");
  if (!evidence.predecessorPassed) errors.push("P03F2_PREDECESSOR_SLICE001_NOT_D0");
  for (const key of ["queuePosition","sourceNodeCount","knowledgePointCount","tagBindingCount","formalMappingCount","patternGroupCount","patternSpecCount","numericPatternSpecCount","applicationPatternSpecCount","globalContextBindingCount","requiredCapabilityCount","publicSourceCountAfterAdmission","publicVisibleKnowledgePointCountForSource","numericQuestionWitnessCount","applicationQuestionWitnessCount","questionWitnessCount","answerKeyWitnessCount","htmlWitnessCount","chromiumPdfWitnessCount","overflowFindingCount","newProductAdmissionCount","cumulativeW3ProductAdmissionCount","remainingDirectSliceCount","remainingDirectKnowledgePointCount","laterWaveDependentCount"]) {
    if (metrics[key] !== expected[key]) errors.push(`P03F2_METRIC_INVALID:${key}:${metrics[key]}:${expected[key]}`);
  }
  if (!evidence.selectorProjectionAudit.ok) errors.push(...evidence.selectorProjectionAudit.errors.map((code) => `P03F2_SELECTOR_PROJECTION:${code}`));
  if (!evidence.selectorCompositionAudit.ok) errors.push(...evidence.selectorCompositionAudit.errors.map((code) => `P03F2_SELECTOR_COMPOSITION:${code}`));
  if (!evidence.patternAudit.ok) errors.push(...evidence.patternAudit.errors.map((code) => `P03F2_PATTERN:${code}`));
  if (!evidence.controlAudit.ok) errors.push(...evidence.controlAudit.errors.map((code) => `P03F2_CONTROL:${code}`));
  if (!evidence.publicSource || evidence.publicSource.sourceId !== "g3a_u08_3a08") errors.push("P03F2_PUBLIC_SOURCE_ADAPTER_INVALID");
  if (evidence.selectorRows.filter(Boolean).length !== 2 || evidence.visibleGroups.length !== 4) errors.push("P03F2_PUBLIC_SELECTOR_SURFACE_INVALID");
  const controlModes = evidence.controlProfile?.questionTypeControl?.options?.map((row) => row.value) ?? [];
  if (!controlModes.includes("numeric") || !controlModes.includes("application") || evidence.controlProfile?.contextControl?.defaultValue !== "global_primary") errors.push("P03F2_PUBLIC_CONTROL_INVALID");
  for (const mode of ["numeric", "application"]) {
    if (!evidence.planValidations[mode].ok) errors.push(...evidence.planValidations[mode].errors.map((row) => `P03F2_${mode.toUpperCase()}_PLAN:${row.code}`));
    if (!evidence.generations[mode].ok || evidence.generations[mode].questions.length !== 6) errors.push(`P03F2_${mode.toUpperCase()}_GENERATION_INVALID`);
    if (!evidence.questionValidations[mode].ok) errors.push(...evidence.questionValidations[mode].errors.map((row) => `P03F2_${mode.toUpperCase()}_VALIDATOR:${row.code}`));
    if (!evidence.worksheets[mode].ok || !evidence.documents[mode]) errors.push(`P03F2_${mode.toUpperCase()}_WORKSHEET_INVALID`);
    if (!evidence.html[mode].includes("<!doctype html>") || !evidence.html[mode].includes("worksheet-page--questions") || !evidence.html[mode].includes("worksheet-page--answer-key")) errors.push(`P03F2_${mode.toUpperCase()}_HTML_INVALID`);
  }
  const applicationIds = new Set(evidence.applicationRecords.map((row) => row.patternSpecId));
  if (applicationIds.size !== 3 || evidence.applicationRecords.some((row) => !row.contextLineage?.macroContextId || !row.bindingCandidateId || row.productionSelectable !== false)) errors.push("P03F2_GLOBAL_CONTEXT_AUTHORITY_INVALID");
  if (evidence.questions.filter((row) => row.questionMode === "application").some((row) => row.globalContextProduction?.status !== "GLOBAL_CONTEXT_BOUND" || !row.metadata?.applicationQuestionRecordId)) errors.push("P03F2_APPLICATION_BINDING_MISSING");
  if (evidence.questions.filter((row) => row.questionMode === "numeric").some((row) => row.metadata?.contextLineage != null)) errors.push("P03F2_NUMERIC_CONTEXT_LEAKAGE");
  if (evidence.questions.some((row) => /(?:算式|_{2,}|答\s*[:：]|\{\{)/.test(row.blankedDisplayText ?? ""))) errors.push("P03F2_FORBIDDEN_SURFACE_PRESENT");
  if (evidence.questions.some((row) => row.numerator <= 0 || row.numerator >= row.denominator)) errors.push("P03F2_PROPER_FRACTION_COMPONENT_INVALID");
  if (evidence.questions.filter((row) => row.operationFamilyId === "discrete_fraction_conversion").some((row) => (row.numerator * row.itemsPerWhole) % row.denominator !== 0 || row.itemCount !== row.wholeUnits * row.itemsPerWhole + row.numerator * row.itemsPerWhole / row.denominator)) errors.push("P03F2_DISCRETE_TOTAL_PRESERVATION_INVALID");
  if (evidence.capabilityWitnesses.some((row) => !row.numberSystemOk || !row.domainValidatorOk)) errors.push("P03F2_W3_CAPABILITY_BINDING_INVALID");
  if (evidence.authority.globalContextBindings.length !== 3 || evidence.authority.productBoundary.unitSpecificStoryEngineAllowed || evidence.authority.productBoundary.parallelPipelineAllowed) errors.push("P03F2_AUTHORITY_BOUNDARY_INVALID");
  const pendingExpected = evidence.manifest.status.includes("PENDING_CHROMIUM_ACCEPTANCE");
  if (pendingExpected) {
    if (evidence.artifactIntegrity.ok || evidence.productAdmissionState !== "PRODUCT_ACCEPTANCE_PENDING" || evidence.d0Complete) errors.push("P03F2_PRE_CHROMIUM_FAIL_CLOSE_INVALID");
  } else if (!evidence.artifactIntegrity.ok || evidence.productAdmissionState !== "PRODUCTION_ADMITTED_D0" || !evidence.d0Complete) errors.push("P03F2_D0_ARTIFACT_STATE_INVALID");
  const boundary = evidence.manifest.mainlineBoundary;
  if (boundary.queuePositionConsumed !== (evidence.d0Complete ? 2 : 1) || boundary.nextQueuePositionStarted || boundary.otherG3AU08KnowledgePointsAdmitted || boundary.unitSpecificStoryEngineAdded || boundary.parallelRuntimePipelineAdded) errors.push("P03F2_SCOPE_BOUNDARY_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), status: evidence.status, productAdmissionState: evidence.productAdmissionState, d0Complete: evidence.d0Complete, artifactIntegrity: evidence.artifactIntegrity, metrics, slice });
}
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const result = validateP03FSlice002ProductAdmission();
  console.log(`P03F_SLICE002_READBACK=${JSON.stringify(result)}`);
  if (!result.ok) console.error(`P03F_SLICE002_ERRORS=${JSON.stringify(result.errors)}`);
  process.exitCode = result.ok ? 0 : 1;
}
