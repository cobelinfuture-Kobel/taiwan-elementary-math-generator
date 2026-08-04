import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { materializeP03FSlice012ProductAdmission } from "../../src/curriculum/full-product/p03f-slice012-product-admission.mjs";
import { getCurrentPixelRegistrySnapshot, listCurrentPixelSourceOptions, listPixelKnowledgePointsForSource } from "../../site/pixel/pixel-registry-bridge.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SOURCE = "g4b_u08_4b08";
const KP = "kp_g4b_u08_equivalence_cross_product";
const SPEC = "ps_g4b_u08_equivalence_cross_product_equivalent_numeric";
const CAPS = ["cap_fraction_arithmetic", "cap_fraction_domain_validator", "cap_fraction_number_system"];
const readJson = (repoPath) => JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));
function hiddenSpecs() {
  const hidden = readJson("data/curriculum/application/pattern-specs/w02/g4b_u08_4b08.hidden-pattern-spec.json");
  return hidden.knowledgePoints.find((entry) => entry.knowledgePointId === KP)?.patternSpecs ?? [];
}

export function validateP03FSlice012ProductAdmission() {
  const evidence = materializeP03FSlice012ProductAdmission();
  const errors = [];
  const expected = evidence.manifest.expectedCounts;
  const metrics = evidence.metrics;
  const slice = evidence.slice;
  if (slice?.queuePosition !== 12
    || slice?.sliceId !== "p03e_q012_r6_g4b_u08_4b08_profile_fraction_c1"
    || slice?.previousSliceId !== "p03e_q011_r6_g4b_u06_4b06_profile_decimal_c1") {
    errors.push("P03F12_QUEUE_IDENTITY_INVALID");
  }
  if (slice?.knowledgePointCount !== 1
    || slice?.knowledgePointIds?.[0] !== KP
    || JSON.stringify(slice?.requiredW3CapabilityIds) !== JSON.stringify(CAPS)) {
    errors.push("P03F12_QUEUE_KP_CAPABILITY_SET_INVALID");
  }
  if (!evidence.predecessorPassed) errors.push("P03F12_PREDECESSOR_SLICE011_NOT_D0");
  for (const [key, value] of Object.entries(expected)) {
    if (metrics[key] !== value) errors.push(`P03F12_METRIC_INVALID:${key}:${metrics[key]}:${value}`);
  }
  const hidden = hiddenSpecs();
  const numeric = hidden.find((row) => row.patternSpecId === SPEC);
  if (!numeric
    || numeric.operationModelId !== "op_g4b_u08_equivalence_cross_product"
    || numeric.operationFamilyId !== "cross_product_equivalence"
    || numeric.requestedUnknownRole !== "equivalent"
    || JSON.stringify(numeric.givenRoles) !== JSON.stringify([
      "leftNumerator",
      "leftDenominator",
      "rightNumerator",
      "rightDenominator",
    ])) {
    errors.push("P03F12_HIDDEN_PATTERNSPEC_PARITY_INVALID");
  }
  if (!evidence.selectorProjectionAudit.ok) errors.push(...evidence.selectorProjectionAudit.errors.map((code) => `P03F12_SELECTOR_PROJECTION:${code}`));
  if (!evidence.selectorCompositionAudit.ok) errors.push(...evidence.selectorCompositionAudit.errors.map((code) => `P03F12_SELECTOR_COMPOSITION:${code}`));
  if (!evidence.patternAudit.ok) errors.push(...evidence.patternAudit.errors.map((code) => `P03F12_PATTERN:${code}`));
  if (!evidence.controlAudit.ok) errors.push(...evidence.controlAudit.errors.map((code) => `P03F12_CONTROL:${code}`));
  if (!evidence.publicSource
    || evidence.selectorRow?.knowledgePointId !== KP
    || evidence.visibleGroups.length !== 1
    || evidence.availability?.visibleCount !== 2
    || evidence.availability?.hiddenPendingCount !== 5) {
    errors.push("P03F12_PUBLIC_SELECTOR_SURFACE_INVALID");
  }
  const controlModes = evidence.controlProfile?.questionTypeControl?.options?.map((row) => row.value) ?? [];
  if (JSON.stringify(controlModes) !== JSON.stringify(["numeric"])
    || evidence.controlProfile?.contextControl?.supported === true) {
    errors.push("P03F12_PUBLIC_CONTROL_INVALID");
  }
  const pixelSources = listCurrentPixelSourceOptions();
  const pixelRows = listPixelKnowledgePointsForSource(SOURCE);
  const pixelSnapshot = getCurrentPixelRegistrySnapshot();
  if (pixelSources.length < 26
    || pixelRows.length < 2
    || !pixelRows.some((row) => row.knowledgePointId === KP)
    || pixelSnapshot.sourceCount < 26) {
    errors.push("P03F12_PIXEL_SURFACE_INVALID");
  }
  if (!evidence.planValidation.ok) errors.push(...evidence.planValidation.errors.map((row) => `P03F12_PLAN:${row.code}`));
  if (!evidence.generation.ok
    || evidence.generation.questions.length !== 8
    || evidence.generation.allocation.length !== 1
    || evidence.generation.allocation[0].questionCount !== 8) {
    errors.push("P03F12_GENERATION_INVALID");
  }
  if (!evidence.questionValidation.ok) errors.push(...evidence.questionValidation.errors.map((row) => `P03F12_BROWSER_VALIDATOR:${row.code}`));
  const questions = evidence.generation.questions ?? [];
  if (new Set(questions.map((row) => row.blankedDisplayText)).size !== questions.length) errors.push("P03F12_DUPLICATE_PROMPT");
  if (!questions.some((row) => row.equivalent) || !questions.some((row) => !row.equivalent)) errors.push("P03F12_BOOLEAN_BALANCE_INVALID");
  if (questions.some((row) => row.metadata?.knowledgePointId !== KP
    || JSON.stringify(row.metadata?.requiredCapabilityIds) !== JSON.stringify(CAPS)
    || row.answerText !== (row.equivalent ? "是" : "否")
    || row.finalAnswer?.value !== row.equivalent
    || row.finalAnswer?.exact !== true
    || row.questionMode !== "numeric"
    || row.metadata?.applicationClassification !== "APPLICATION_NOT_APPLICABLE")) {
    errors.push("P03F12_PRODUCT_OR_CAPABILITY_SCOPE_INVALID");
  }
  if (questions.some((row) => /(?:算式|_{2,}|答\s*[:：]|\{\{)/.test(String(row.blankedDisplayText ?? "")))) {
    errors.push("P03F12_FORBIDDEN_SURFACE_PRESENT");
  }
  for (const witness of evidence.capabilityWitnesses) {
    const left = witness.leftArithmeticCanonicalValue;
    const right = witness.rightArithmeticCanonicalValue;
    if (!witness.leftNumberSystemOk
      || !witness.rightNumberSystemOk
      || !witness.leftDomainValidatorOk
      || !witness.rightDomainValidatorOk
      || !witness.leftArithmeticOk
      || !witness.rightArithmeticOk
      || Number(left?.numerator) !== witness.expectedLeftCrossProduct
      || Number(left?.denominator) !== 1
      || Number(right?.numerator) !== witness.expectedRightCrossProduct
      || Number(right?.denominator) !== 1
      || witness.expectedEquivalent !== (witness.expectedLeftCrossProduct === witness.expectedRightCrossProduct)) {
      errors.push("P03F12_FRACTION_CAPABILITY_WITNESS_INVALID");
      break;
    }
  }
  if (!evidence.worksheet.ok
    || evidence.document?.generatedQuestions?.length !== 8
    || evidence.document?.answerKeyItems?.length !== 8
    || evidence.document?.questionPages?.length !== 1
    || evidence.document?.answerKeyPages?.length !== 1) {
    errors.push("P03F12_WORKSHEET_ANSWER_KEY_INVALID");
  }
  if (!evidence.html.includes("<!doctype html>")) errors.push("P03F12_HTML_INVALID");
  if (evidence.authority.knowledgePoint.applicationClassification !== "APPLICATION_NOT_APPLICABLE"
    || evidence.authority.productBoundary.applicationModeAllowed
    || !evidence.authority.productBoundary.globalContextBindingNotApplicable) {
    errors.push("P03F12_APPLICATION_BOUNDARY_INVALID");
  }
  const boundary = evidence.manifest.mainlineBoundary;
  if (boundary.queuePositionConsumed !== (evidence.d0Complete ? 12 : 11)
    || boundary.nextQueuePositionStarted
    || boundary.otherG4BU08KnowledgePointsAdmitted
    || boundary.applicationStoryGenerationAdded
    || boundary.globalContextExpanded
    || boundary.parallelRuntimePipelineAdded
    || boundary.sharedWorksheetRendererBehaviorChanged
    || boundary.sourceUnitDefaultChanged
    || boundary.slice012KnowledgePointAdmitted !== evidence.d0Complete) {
    errors.push("P03F12_SCOPE_BOUNDARY_INVALID");
  }
  const pending = String(evidence.manifest.status).includes("PENDING_CHROMIUM_ACCEPTANCE")
    || String(evidence.manifest.status).includes("PENDING_VISUAL_REVIEW");
  if (pending) {
    if (evidence.artifactIntegrity.ok
      || evidence.d0Complete
      || evidence.productAdmissionState !== "RUNTIME_CONNECTED_PENDING_CHROMIUM_ACCEPTANCE") {
      errors.push("P03F12_PRE_D0_FAIL_CLOSE_INVALID");
    }
  } else if (!evidence.artifactIntegrity.ok
    || !evidence.d0Complete
    || evidence.productAdmissionState !== "PRODUCTION_ADMITTED_D0") {
    errors.push("P03F12_D0_ARTIFACT_STATE_INVALID");
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    status: evidence.status,
    productAdmissionState: evidence.productAdmissionState,
    d0Complete: evidence.d0Complete,
    artifactIntegrity: evidence.artifactIntegrity,
    metrics,
    slice,
  });
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const result = validateP03FSlice012ProductAdmission();
  console.log(`P03F_SLICE012_READBACK=${JSON.stringify(result)}`);
  if (!result.ok) console.error(`P03F_SLICE012_ERRORS=${JSON.stringify(result.errors)}`);
  process.exitCode = result.ok ? 0 : 1;
}
