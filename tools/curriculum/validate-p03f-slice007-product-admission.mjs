import { pathToFileURL } from "node:url";
import { materializeP03FSlice007ProductAdmission } from "../../src/curriculum/full-product/p03f-slice007-product-admission.mjs";
export function validateP03FSlice007ProductAdmission() {
  const e = materializeP03FSlice007ProductAdmission(), errors = []; const add = (c) => errors.push(c);
  if (!e.predecessorPassed) add("P03F7_PREDECESSOR_SLICE006_NOT_D0");
  if (e.slice?.queuePosition !== 7 || e.slice?.sliceId !== "p03e_q007_r6_g3b_u07_3b07_profile_fraction_c1") add("P03F7_QUEUE_IDENTITY_INVALID");
  if (JSON.stringify(e.slice?.requiredW3CapabilityIds) !== JSON.stringify(["cap_fraction_domain_validator", "cap_fraction_number_system"])) add("P03F7_CAPABILITY_IDENTITY_INVALID");
  if (!e.selectorProjectionAudit.ok || !e.selectorCompositionAudit.ok || !e.patternAudit.ok || !e.controlAudit.ok) add("P03F7_REGISTRY_AUDIT_FAILED");
  for (const mode of ["numeric", "application"]) {
    const m = e.modes[mode];
    if (!m.planValidation.ok || !m.generation.ok || !m.questionValidation.ok || !m.worksheet.ok || !m.document || !m.html) add(`P03F7_${mode.toUpperCase()}_PIPELINE_FAILED`);
    if (m.generation.questions?.length !== 6 || m.document?.answerKeyItems?.length !== 6) add(`P03F7_${mode.toUpperCase()}_WITNESS_COUNT_INVALID`);
    if (new Set(m.generation.questions?.map((q) => q.blankedDisplayText)).size !== 6) add(`P03F7_${mode.toUpperCase()}_DUPLICATE_PROMPT`);
    if (new Set(m.generation.questions?.map((q) => q.patternSpecId)).size !== 2 || !["itemCount", "fractionalUnits"].every((v) => m.generation.questions.some((q) => q.requestedUnknownRole === v))) add(`P03F7_${mode.toUpperCase()}_BIDIRECTIONAL_COVERAGE_INVALID`);
    if (!m.capabilityWitnesses.every((w) => w.numberSystemOk && w.domainValidatorOk && w.quantityPreserved && w.positiveUnitSize)) add(`P03F7_${mode.toUpperCase()}_CAPABILITY_WITNESS_INVALID`);
  }
  if (e.metrics.patternGroupCount !== 2 || e.metrics.patternSpecCount !== 4 || e.metrics.numericPatternSpecCount !== 2 || e.metrics.applicationPatternSpecCount !== 2 || e.metrics.questionWitnessCount !== 12 || e.metrics.answerKeyWitnessCount !== 12) add("P03F7_AGGREGATE_COUNTS_INVALID");
  if (e.metrics.publicSourceCountAfterAdmission !== 23 || e.metrics.publicVisibleKnowledgePointCountForSource !== 2 || e.availability?.hiddenPendingCount !== 6) add("P03F7_PUBLIC_SURFACE_INVALID");
  if (e.controlProfile?.questionTypeControl?.options?.map((o) => o.value).join(",") !== "numeric,application") add("P03F7_PUBLIC_CONTROL_INVALID");
  if (e.d0Complete && !e.artifactIntegrity.ok) add("P03F7_D0_ARTIFACT_INTEGRITY_INVALID");
  if (!e.d0Complete && e.productAdmissionState !== "PRODUCT_ACCEPTANCE_PENDING") add("P03F7_PENDING_STATE_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), d0Complete: e.d0Complete, productAdmissionState: e.productAdmissionState, metrics: e.metrics, evidence: e });
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) { const r = validateP03FSlice007ProductAdmission(); console.log(`P03F7_VALIDATION=${JSON.stringify({ ok: r.ok, errors: r.errors, d0Complete: r.d0Complete, productAdmissionState: r.productAdmissionState, metrics: r.metrics })}`); if (!r.ok) process.exitCode = 1; }
