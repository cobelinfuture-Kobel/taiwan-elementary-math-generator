
import { pathToFileURL } from "node:url";
import { materializeP03FSlice006ProductAdmission } from "../../src/curriculum/full-product/p03f-slice006-product-admission.mjs";
export function validateP03FSlice006ProductAdmission() {
  const e = materializeP03FSlice006ProductAdmission(); const errors = [];
  const add = (code) => errors.push(code);
  if (!e.predecessorPassed) add("P03F6_PREDECESSOR_SLICE005_NOT_D0");
  if (e.slice?.queuePosition !== 6 || e.slice?.sliceId !== "p03e_q006_r6_g3a_u08_3a08_profile_fraction_c1") add("P03F6_QUEUE_IDENTITY_INVALID");
  if (JSON.stringify(e.slice?.requiredW3CapabilityIds) !== JSON.stringify(["cap_fraction_domain_validator", "cap_fraction_number_system"])) add("P03F6_CAPABILITY_IDENTITY_INVALID");
  if (!e.selectorProjectionAudit.ok || !e.selectorCompositionAudit.ok || !e.patternAudit.ok || !e.controlAudit.ok) add("P03F6_REGISTRY_AUDIT_FAILED");
  for (const mode of ["numeric", "application"]) {
    const m = e.modes[mode];
    if (!m.planValidation.ok || !m.generation.ok || !m.questionValidation.ok || !m.worksheet.ok || !m.document || !m.html) add(`P03F6_${mode.toUpperCase()}_PIPELINE_FAILED`);
    if (m.generation.questions?.length !== 6 || m.document?.answerKeyItems?.length !== 6) add(`P03F6_${mode.toUpperCase()}_WITNESS_COUNT_INVALID`);
    if (new Set(m.generation.questions?.map((q) => q.blankedDisplayText)).size !== 6) add(`P03F6_${mode.toUpperCase()}_DUPLICATE_PROMPT`);
    const relationSet = new Set(m.generation.questions?.map((q) => q.comparison)); const targetSet = new Set(m.generation.questions?.map((q) => q.comparisonTarget));
    if (!["<", "=", ">"].every((v) => relationSet.has(v)) || !["pair", "one"].every((v) => targetSet.has(v))) add(`P03F6_${mode.toUpperCase()}_COVERAGE_INVALID`);
    if (!m.capabilityWitnesses.every((w) => w.leftNumberSystemOk && w.rightNumberSystemOk && w.leftDomainValidatorOk && w.rightDomainValidatorOk && w.samePositiveDenominator)) add(`P03F6_${mode.toUpperCase()}_CAPABILITY_WITNESS_INVALID`);
  }
  if (e.metrics.patternGroupCount !== 2 || e.metrics.patternSpecCount !== 2 || e.metrics.questionWitnessCount !== 12 || e.metrics.answerKeyWitnessCount !== 12) add("P03F6_AGGREGATE_COUNTS_INVALID");
  if (e.metrics.publicSourceCountAfterAdmission !== 23 || e.metrics.publicVisibleKnowledgePointCountForSource !== 4 || e.availability?.hiddenPendingCount !== 3) add("P03F6_PUBLIC_SURFACE_INVALID");
  if (e.d0Complete && !e.artifactIntegrity.ok) add("P03F6_D0_ARTIFACT_INTEGRITY_INVALID");
  if (!e.d0Complete && e.productAdmissionState !== "PRODUCT_ACCEPTANCE_PENDING") add("P03F6_PENDING_STATE_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), d0Complete: e.d0Complete, productAdmissionState: e.productAdmissionState, metrics: e.metrics, evidence: e });
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = validateP03FSlice006ProductAdmission(); console.log(`P03F6_VALIDATION=${JSON.stringify({ ok: result.ok, errors: result.errors, d0Complete: result.d0Complete, productAdmissionState: result.productAdmissionState, metrics: result.metrics })}`); if (!result.ok) process.exitCode = 1;
}
