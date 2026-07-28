import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { materializeP03FSlice013ProductAdmission } from "../../src/curriculum/full-product/p03f-slice013-product-admission.mjs";
import {
  getCurrentPixelRegistrySnapshot,
  listCurrentPixelSourceOptions,
  listPixelKnowledgePointsForSource,
} from "../../site/pixel/pixel-registry-bridge.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SOURCE = "g5a_u04_5a04";
const KP = "kp_g5a_u04_expand_reduce_simplest";
const SPECS = [
  "ps_g5a_u04_expand_reduce_simplest_common_factor_numeric",
  "ps_g5a_u04_expand_reduce_simplest_simplest_numerator_numeric",
  "ps_g5a_u04_expand_reduce_simplest_simplest_denominator_numeric",
];
const CAPS = [
  "cap_fraction_arithmetic",
  "cap_fraction_domain_validator",
  "cap_fraction_number_system",
];
const readJson = (repoPath) => JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));

function hiddenSpecs() {
  const hidden = readJson("data/curriculum/application/pattern-specs/w02/g5a_u04_5a04.hidden-pattern-spec.json");
  return hidden.knowledgePoints.find((entry) => entry.knowledgePointId === KP)?.patternSpecs ?? [];
}

export function validateP03FSlice013ProductAdmission() {
  const evidence = materializeP03FSlice013ProductAdmission();
  const errors = [];
  const expected = evidence.manifest.expectedCounts;
  const metrics = evidence.metrics;
  const slice = evidence.slice;
  if (slice?.queuePosition !== 13
    || slice?.sliceId !== "p03e_q013_r6_g5a_u04_5a04_profile_fraction_c1"
    || slice?.previousSliceId !== "p03e_q012_r6_g4b_u08_4b08_profile_fraction_c1") {
    errors.push("P03F13_QUEUE_IDENTITY_INVALID");
  }
  if (slice?.knowledgePointCount !== 1
    || slice?.knowledgePointIds?.[0] !== KP
    || JSON.stringify(slice?.requiredW3CapabilityIds) !== JSON.stringify(CAPS)) {
    errors.push("P03F13_QUEUE_KP_CAPABILITY_SET_INVALID");
  }
  if (!evidence.predecessorPassed) errors.push("P03F13_PREDECESSOR_SLICE012_NOT_D0");
  for (const [key, value] of Object.entries(expected)) {
    if (metrics[key] !== value) errors.push(`P03F13_METRIC_INVALID:${key}:${metrics[key]}:${value}`);
  }
  const hidden = hiddenSpecs();
  const byId = new Map(hidden.map((row) => [row.patternSpecId, row]));
  const expectedRoles = ["commonFactor", "simplestNumerator", "simplestDenominator"];
  for (const [index, specId] of SPECS.entries()) {
    const row = byId.get(specId);
    if (!row
      || row.operationModelId !== "op_g5a_u04_expand_reduce_simplest"
      || row.operationFamilyId !== "simplify_fraction"
      || row.requestedUnknownRole !== expectedRoles[index]
      || row.mode !== "NUMERIC") {
      errors.push(`P03F13_HIDDEN_PATTERNSPEC_PARITY_INVALID:${specId}`);
    }
  }
  if (!evidence.selectorProjectionAudit.ok) errors.push(...evidence.selectorProjectionAudit.errors.map((code) => `P03F13_SELECTOR_PROJECTION:${code}`));
  if (!evidence.selectorCompositionAudit.ok) errors.push(...evidence.selectorCompositionAudit.errors.map((code) => `P03F13_SELECTOR_COMPOSITION:${code}`));
  if (!evidence.patternAudit.ok) errors.push(...evidence.patternAudit.errors.map((code) => `P03F13_PATTERN:${code}`));
  if (!evidence.controlAudit.ok) errors.push(...evidence.controlAudit.errors.map((code) => `P03F13_CONTROL:${code}`));
  if (!evidence.publicSource
    || evidence.selectorRow?.knowledgePointId !== KP
    || evidence.visibleGroups.length !== 1
    || evidence.availability?.visibleCount !== 1
    || evidence.availability?.hiddenPendingCount !== 4) {
    errors.push("P03F13_PUBLIC_SELECTOR_SURFACE_INVALID");
  }
  const controlModes = evidence.controlProfile?.questionTypeControl?.options?.map((row) => row.value) ?? [];
  if (JSON.stringify(controlModes) !== JSON.stringify(["numeric"])
    || evidence.controlProfile?.contextControl?.supported === true) {
    errors.push("P03F13_PUBLIC_CONTROL_INVALID");
  }
  const pixelSources = listCurrentPixelSourceOptions();
  const pixelRows = listPixelKnowledgePointsForSource(SOURCE);
  const pixelSnapshot = getCurrentPixelRegistrySnapshot();
  if (pixelSources.length !== 26
    || pixelRows.length !== 1
    || pixelRows[0]?.knowledgePointId !== KP
    || pixelSnapshot.sourceCount !== 26) {
    errors.push("P03F13_PIXEL_SURFACE_INVALID");
  }
  if (!evidence.planValidation.ok) errors.push(...evidence.planValidation.errors.map((row) => `P03F13_PLAN:${row.code}`));
  if (!evidence.generation.ok
    || evidence.generation.questions.length !== 9
    || evidence.generation.allocation.length !== 3
    || evidence.generation.allocation.some((row) => row.questionCount !== 3)) {
    errors.push("P03F13_GENERATION_INVALID");
  }
  if (!evidence.questionValidation.ok) errors.push(...evidence.questionValidation.errors.map((row) => `P03F13_BROWSER_VALIDATOR:${row.code}`));
  const questions = evidence.generation.questions ?? [];
  if (new Set(questions.map((row) => row.blankedDisplayText)).size !== questions.length) errors.push("P03F13_DUPLICATE_PROMPT");
  if (questions.some((row) => row.metadata?.knowledgePointId !== KP
    || JSON.stringify(row.metadata?.requiredCapabilityIds) !== JSON.stringify(CAPS)
    || row.answerText !== String(row[row.requestedUnknownRole])
    || row.finalAnswer?.value !== row[row.requestedUnknownRole]
    || row.finalAnswer?.exact !== true
    || row.questionMode !== "numeric"
    || row.metadata?.applicationClassification !== "APPLICATION_NOT_APPLICABLE")) {
    errors.push("P03F13_PRODUCT_OR_CAPABILITY_SCOPE_INVALID");
  }
  if (questions.some((row) => row.numerator * row.simplestDenominator !== row.simplestNumerator * row.denominator)) {
    errors.push("P03F13_VALUE_PRESERVATION_INVALID");
  }
  if (questions.some((row) => /(?:算式|_{2,}|答\s*[:：]|\{\{)/.test(String(row.blankedDisplayText ?? "")))) {
    errors.push("P03F13_FORBIDDEN_SURFACE_PRESENT");
  }
  for (const witness of evidence.capabilityWitnesses) {
    if (!witness.originalNumberSystemOk
      || !witness.simplestNumberSystemOk
      || !witness.originalDomainValidatorOk
      || !witness.simplestDomainValidatorOk
      || !witness.fractionArithmeticOk
      || JSON.stringify(witness.originalCanonicalValue) !== JSON.stringify(witness.simplestCanonicalValue)
      || witness.originalCanonicalIdentity !== witness.simplestCanonicalIdentity
      || JSON.stringify(witness.arithmeticCanonicalValue) !== JSON.stringify(witness.originalCanonicalValue)) {
      errors.push("P03F13_FRACTION_CAPABILITY_WITNESS_INVALID");
      break;
    }
  }
  if (!evidence.worksheet.ok
    || evidence.document?.generatedQuestions?.length !== 9
    || evidence.document?.answerKeyItems?.length !== 9
    || evidence.document?.questionPages?.length !== 1
    || evidence.document?.answerKeyPages?.length !== 1) {
    errors.push("P03F13_WORKSHEET_ANSWER_KEY_INVALID");
  }
  if (!evidence.html.includes("<!doctype html>")) errors.push("P03F13_HTML_INVALID");
  if (evidence.authority.knowledgePoint.applicationClassification !== "APPLICATION_NOT_APPLICABLE"
    || evidence.authority.productBoundary.applicationModeAllowed
    || !evidence.authority.productBoundary.globalContextBindingNotApplicable) {
    errors.push("P03F13_APPLICATION_BOUNDARY_INVALID");
  }
  const boundary = evidence.manifest.mainlineBoundary;
  if (boundary.queuePositionConsumed !== (evidence.d0Complete ? 13 : 12)
    || boundary.nextQueuePositionStarted
    || boundary.otherG5AU04KnowledgePointsAdmitted
    || boundary.applicationStoryGenerationAdded
    || boundary.globalContextExpanded
    || boundary.parallelRuntimePipelineAdded
    || boundary.sharedWorksheetRendererBehaviorChanged
    || boundary.slice013KnowledgePointAdmitted !== evidence.d0Complete) {
    errors.push("P03F13_SCOPE_BOUNDARY_INVALID");
  }
  const pending = String(evidence.manifest.status).includes("PENDING_CHROMIUM_ACCEPTANCE")
    || String(evidence.manifest.status).includes("PENDING_VISUAL_REVIEW");
  if (pending) {
    if (evidence.artifactIntegrity.ok
      || evidence.d0Complete
      || evidence.productAdmissionState !== "RUNTIME_CONNECTED_PENDING_CHROMIUM_ACCEPTANCE") {
      errors.push("P03F13_PRE_D0_FAIL_CLOSE_INVALID");
    }
  } else if (!evidence.artifactIntegrity.ok
    || !evidence.d0Complete
    || evidence.productAdmissionState !== "PRODUCTION_ADMITTED_D0") {
    errors.push("P03F13_D0_ARTIFACT_STATE_INVALID");
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
  const result = validateP03FSlice013ProductAdmission();
  console.log(`P03F_SLICE013_READBACK=${JSON.stringify(result)}`);
  if (!result.ok) console.error(`P03F_SLICE013_ERRORS=${JSON.stringify(result.errors)}`);
  process.exitCode = result.ok ? 0 : 1;
}
