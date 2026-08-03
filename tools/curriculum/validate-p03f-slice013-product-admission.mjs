import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { materializeP03FSlice013ProductAdmission } from "../../src/curriculum/full-product/p03f-slice013-product-admission.mjs";
import { getCurrentPixelRegistrySnapshot, listCurrentPixelSourceOptions, listPixelKnowledgePointsForSource } from "../../site/pixel/pixel-registry-bridge.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SOURCE = "g5a_u04_5a04";
const KPS = ["kp_g5a_u04_expand_reduce_simplest", "kp_g5a_u04_quotient_as_fraction_context"];
const SPECS = [
  "ps_g5a_u04_expand_reduce_simplest_common_factor_numeric",
  "ps_g5a_u04_expand_reduce_simplest_simplest_numerator_numeric",
  "ps_g5a_u04_expand_reduce_simplest_simplest_denominator_numeric",
  "ps_g5a_u04_quotient_as_fraction_context_share_per_recipient_numeric",
  "ps_g5a_u04_quotient_as_fraction_context_share_per_recipient_application",
];
const CAPS = ["cap_fraction_arithmetic", "cap_fraction_domain_validator", "cap_fraction_number_system"];
const readJson = (repoPath) => JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));
function hiddenSpecs() {
  const hidden = readJson("data/curriculum/application/pattern-specs/w02/g5a_u04_5a04.hidden-pattern-spec.json");
  return hidden.knowledgePoints.flatMap((entry) => KPS.includes(entry.knowledgePointId) ? entry.patternSpecs : []);
}
function equal(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

export function validateP03FSlice013ProductAdmission() {
  const evidence = materializeP03FSlice013ProductAdmission();
  const errors = [];
  const expected = evidence.manifest.expectedCounts;
  const metrics = evidence.metrics;
  const slice = evidence.slice;
  if (slice?.queuePosition !== 13 || slice?.sliceId !== "p03e_q013_r6_g5a_u04_5a04_profile_fraction_c1" || slice?.previousSliceId !== "p03e_q012_r6_g4b_u08_4b08_profile_fraction_c1") errors.push("P03F13_QUEUE_IDENTITY_INVALID");
  if (slice?.knowledgePointCount !== 2 || !equal(slice?.knowledgePointIds, KPS) || !equal(slice?.requiredW3CapabilityIds, CAPS)) errors.push("P03F13_QUEUE_KP_CAPABILITY_SET_INVALID");
  if (!evidence.predecessorPassed) errors.push("P03F13_PREDECESSOR_SLICE012_NOT_D0");
  for (const [key, value] of Object.entries(expected)) {
    if (key === "publicSourceCountAfterAdmission") {
      if (metrics[key] < value) errors.push(`P03F13_METRIC_INVALID:${key}:${metrics[key]}:${value}`);
    } else if (metrics[key] !== value) errors.push(`P03F13_METRIC_INVALID:${key}:${metrics[key]}:${value}`);
  }

  const hidden = hiddenSpecs();
  const byId = new Map(hidden.map((row) => [row.patternSpecId, row]));
  for (const specId of SPECS) if (!byId.has(specId)) errors.push(`P03F13_HIDDEN_PATTERNSPEC_MISSING:${specId}`);
  const quotientNumeric = byId.get(SPECS[3]);
  const quotientApplication = byId.get(SPECS[4]);
  if (quotientNumeric?.mode !== "NUMERIC" || quotientApplication?.mode !== "APPLICATION"
    || quotientNumeric?.operationModelId !== "op_g5a_u04_quotient_as_fraction_context"
    || quotientApplication?.operationModelId !== "op_g5a_u04_quotient_as_fraction_context") errors.push("P03F13_QUOTIENT_HIDDEN_PARITY_INVALID");

  if (!evidence.selectorProjectionAudit.ok) errors.push(...evidence.selectorProjectionAudit.errors.map((code) => `P03F13_SELECTOR_PROJECTION:${code}`));
  if (!evidence.selectorCompositionAudit.ok) errors.push(...evidence.selectorCompositionAudit.errors.map((code) => `P03F13_SELECTOR_COMPOSITION:${code}`));
  if (!evidence.patternAudit.ok) errors.push(...evidence.patternAudit.errors.map((code) => `P03F13_PATTERN:${code}`));
  if (!evidence.controlAudit.ok) errors.push(...evidence.controlAudit.errors.map((code) => `P03F13_CONTROL:${code}`));
  if (!evidence.publicSource || evidence.selectorRows.length !== 2 || evidence.visibleGroups.length !== 3 || evidence.availability?.visibleCount !== 2 || evidence.availability?.hiddenPendingCount !== 5) errors.push("P03F13_PUBLIC_SELECTOR_SURFACE_INVALID");
  const controlModes = evidence.controlProfile?.questionTypeControl?.options?.map((row) => row.value) ?? [];
  if (!equal(controlModes, ["numeric", "application"]) || evidence.controlProfile?.contextControl?.supported !== true) errors.push("P03F13_PUBLIC_CONTROL_INVALID");

  const pixelSources = listCurrentPixelSourceOptions();
  const pixelRows = listPixelKnowledgePointsForSource(SOURCE);
  const pixelSnapshot = getCurrentPixelRegistrySnapshot();
  if (pixelSources.length < 26 || pixelRows.length !== 2 || !equal(pixelRows.map((row) => row.knowledgePointId), KPS) || pixelSnapshot.sourceCount < 26) errors.push("P03F13_PIXEL_SURFACE_INVALID");

  for (const [modeName, mode] of Object.entries(evidence.modes)) {
    if (!mode.planValidation.ok) errors.push(...mode.planValidation.errors.map((row) => `P03F13_${modeName}_PLAN:${row.code}`));
    if (!mode.generation.ok || !mode.questionValidation.ok || !mode.worksheet.ok) errors.push(`P03F13_${modeName}_PIPELINE_INVALID`);
  }
  if (evidence.modes.simplest.generation.questions.length !== 9
    || evidence.modes.quotientNumeric.generation.questions.length !== 3
    || evidence.modes.quotientApplication.generation.questions.length !== 3
    || evidence.allQuestions.length !== 9
    || new Set(evidence.allQuestions.map((row) => row.patternSpecId)).size !== 5
    || new Set(evidence.allQuestions.map((row) => row.blankedDisplayText)).size !== 9) errors.push("P03F13_GENERATION_WITNESS_INVALID");

  for (const witness of evidence.simplestCapabilityWitnesses) {
    if (!witness.originalNumberSystemOk || !witness.simplestNumberSystemOk || !witness.originalDomainValidatorOk || !witness.simplestDomainValidatorOk
      || !equal(witness.originalCanonicalValue, witness.simplestCanonicalValue) || witness.originalCanonicalIdentity !== witness.simplestCanonicalIdentity) {
      errors.push("P03F13_SIMPLEST_CAPABILITY_WITNESS_INVALID"); break;
    }
  }
  for (const witness of evidence.quotientCapabilityWitnesses) {
    if (!witness.numberSystemOk || !witness.domainValidatorOk || !witness.fractionArithmeticOk
      || !equal(witness.canonicalValue, witness.arithmeticCanonicalValue) || witness.arithmeticErrors.length !== 0) {
      errors.push(`P03F13_QUOTIENT_CAPABILITY_WITNESS_INVALID:${witness.arithmeticErrors.join("|")}`); break;
    }
  }
  const appQuestions = evidence.modes.quotientApplication.generation.questions;
  if (appQuestions.some((row) => row.metadata?.bindingCandidateId !== "w02_bind_ps_g5a_u04_quotient_as_fraction_context_share_per_recipient_application"
    || row.metadata?.contextLineage?.atomicEpisodeId !== "gctx_episode_crop_batch_plan_direct_quantity"
    || row.globalContextProduction?.status !== "GLOBAL_CONTEXT_BOUND")) errors.push("P03F13_W02_CONTEXT_LINEAGE_INVALID");

  if (!evidence.worksheet.ok || evidence.document?.generatedQuestions?.length !== 9 || evidence.document?.answerKeyItems?.length !== 9 || evidence.document?.questionPages?.length !== 1 || evidence.document?.answerKeyPages?.length !== 1) errors.push("P03F13_WORKSHEET_ANSWER_KEY_INVALID");
  if (!evidence.html.includes("<!doctype html>")) errors.push("P03F13_HTML_INVALID");
  if ((evidence.authority.knowledgePoints ?? []).length !== 2 || (evidence.authority.formalMappings ?? []).length !== 2
    || evidence.authority.applicationContext?.bindingCandidateId !== "w02_bind_ps_g5a_u04_quotient_as_fraction_context_share_per_recipient_application"
    || !evidence.authority.productBoundary.applicationModeAllowed || evidence.authority.productBoundary.globalContextExpansionAllowed) errors.push("P03F13_AUTHORITY_BOUNDARY_INVALID");

  const boundary = evidence.manifest.mainlineBoundary;
  if (boundary.queuePositionConsumed !== (evidence.d0Complete ? 13 : 12)
    || boundary.nextQueuePositionStarted
    || boundary.otherG5AU04KnowledgePointsAdmitted
    || boundary.globalContextExpanded
    || boundary.parallelRuntimePipelineAdded
    || boundary.sharedWorksheetRendererBehaviorChanged
    || boundary.slice013KnowledgePointCountAdmitted !== (evidence.d0Complete ? 2 : 0)
    || boundary.existingW02GlobalContextBindingConsumed !== true) errors.push("P03F13_SCOPE_BOUNDARY_INVALID");

  const pending = String(evidence.manifest.status).includes("PENDING_CHROMIUM_ACCEPTANCE") || String(evidence.manifest.status).includes("PENDING_VISUAL_REVIEW");
  if (pending) {
    if (evidence.artifactIntegrity.ok || evidence.d0Complete || evidence.productAdmissionState !== "RUNTIME_CONNECTED_PENDING_CHROMIUM_ACCEPTANCE") errors.push("P03F13_PRE_D0_FAIL_CLOSE_INVALID");
  } else if (!evidence.artifactIntegrity.ok || !evidence.d0Complete || evidence.productAdmissionState !== "PRODUCTION_ADMITTED_D0") errors.push("P03F13_D0_ARTIFACT_STATE_INVALID");

  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), status: evidence.status, productAdmissionState: evidence.productAdmissionState, d0Complete: evidence.d0Complete, artifactIntegrity: evidence.artifactIntegrity, metrics, slice });
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const result = validateP03FSlice013ProductAdmission();
  console.log(`P03F_SLICE013_READBACK=${JSON.stringify(result)}`);
  if (!result.ok) console.error(`P03F_SLICE013_ERRORS=${JSON.stringify(result.errors)}`);
  process.exitCode = result.ok ? 0 : 1;
}
