import { materializeP03FSlice014ProductAdmission } from "../../src/curriculum/full-product/p03f-slice014-product-admission.mjs";
import { getCurrentPixelRegistrySnapshot, listCurrentPixelSourceOptions, listPixelKnowledgePointsForSource } from "../../site/pixel/pixel-registry-bridge.js";

const SOURCE = "g5b_u05_5b05a";
const KP = "kp_g5b_u05a_decimal_base10_structure";
const CAPS = ["cap_decimal_domain_validator", "cap_decimal_number_system"];
const SPECS = [
  "ps_g5b_u05a_decimal_base10_adjacent_place_relation",
  "ps_g5b_u05a_decimal_base10_cross_decimal_point_relation",
];
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export function validateP03FSlice014ProductAdmission() {
  const evidence = materializeP03FSlice014ProductAdmission();
  const errors = [];
  const expected = evidence.manifest.expectedCounts;
  const metrics = evidence.metrics;
  const slice = evidence.slice;
  if (slice?.queuePosition !== 14
    || slice?.sliceId !== "p03e_q014_r6_g5b_u05_5b05a_profile_decimal_c1"
    || slice?.previousSliceId !== "p03e_q013_r6_g5a_u04_5a04_profile_fraction_c1") errors.push("P03F14_QUEUE_IDENTITY_INVALID");
  if (!equal(slice?.knowledgePointIds, [KP]) || !equal(slice?.requiredW3CapabilityIds, CAPS)) errors.push("P03F14_QUEUE_KP_CAPABILITY_SET_INVALID");
  if (!evidence.predecessorPassed) errors.push("P03F14_PREDECESSOR_SLICE013_NOT_D0");
  for (const [key, value] of Object.entries(expected)) {
    if (key === "publicSourceCountAfterAdmission") {
      if (metrics[key] < value) errors.push(`P03F14_METRIC_INVALID:${key}:${metrics[key]}:${value}`);
    } else if (metrics[key] !== value) errors.push(`P03F14_METRIC_INVALID:${key}:${metrics[key]}:${value}`);
  }

  if (evidence.authority.knowledgePoint.knowledgePointId !== KP
    || evidence.authority.knowledgePoint.capabilityStatement !== "學生能連結整數位與小數位的10倍、十分之一關係。"
    || evidence.authority.knowledgePoint.reasoningInvariant !== "小數點兩側相鄰位值均維持10倍關係。"
    || !equal(evidence.authority.knowledgePoint.requiredCapabilityIds, CAPS)) errors.push("P03F14_SOURCE_AUTHORITY_INVALID");
  if (!evidence.unblockRow?.capabilityUnblocked || !equal(evidence.unblockRow.requiredW3CapabilityIds, CAPS)) errors.push("P03F14_P03C_CAPABILITY_UNBLOCK_INVALID");
  if (!evidence.selectorProjectionAudit.ok) errors.push(...evidence.selectorProjectionAudit.errors.map((code) => `P03F14_SELECTOR_PROJECTION:${code}`));
  if (!evidence.selectorCompositionAudit.ok) errors.push(...evidence.selectorCompositionAudit.errors.map((code) => `P03F14_SELECTOR_COMPOSITION:${code}`));
  if (!evidence.patternAudit.ok) errors.push(...evidence.patternAudit.errors.map((code) => `P03F14_PATTERN:${code}`));

  if (!evidence.publicSource || evidence.sourceRows.length !== 5 || evidence.availability?.visibleCount !== 5 || evidence.availability?.hiddenPendingCount !== 0) errors.push("P03F14_EXISTING_W1_SOURCE_SURFACE_INVALID");
  const pixelSources = listCurrentPixelSourceOptions();
  const pixelRows = listPixelKnowledgePointsForSource(SOURCE);
  const pixelSnapshot = getCurrentPixelRegistrySnapshot();
  if (pixelSources.length < 26 || pixelRows.length < 5 || !pixelRows.some((row) => row.knowledgePointId === KP) || pixelSnapshot.sourceCount < 26) errors.push("P03F14_PIXEL_SURFACE_INVALID");

  if (!evidence.planValidation.ok) errors.push(...evidence.planValidation.errors.map((row) => `P03F14_PLAN:${row.code}`));
  if (!evidence.generation.ok || !evidence.questionValidation.ok || !evidence.worksheet.ok) errors.push("P03F14_SHARED_PIPELINE_INVALID");
  if (evidence.generation.questions.length !== 16
    || new Set(evidence.generation.questions.map((row) => row.blankedDisplayText)).size !== 16
    || !equal([...new Set(evidence.generation.questions.map((row) => row.patternSpecId))].sort(), [...SPECS].sort())) errors.push("P03F14_GENERATION_WITNESS_INVALID");
  if (evidence.generation.questions.some((row) => !equal(row.metadata?.requiredCapabilityIds, CAPS)
    || row.relationBase !== 10
    || row.questionMode !== "numeric"
    || row.metadata?.applicationClassification !== "APPLICATION_NOT_APPLICABLE")) errors.push("P03F14_GENERATED_CONTRACT_INVALID");
  if (evidence.document?.generatedQuestions?.length !== 16 || evidence.document?.answerKeyItems?.length !== 16 || !evidence.html.includes("<!doctype html>")) errors.push("P03F14_WORKSHEET_HTML_INVALID");

  const boundary = evidence.authority.productBoundary;
  if (boundary.publicSourceAlreadyExists !== true
    || boundary.newPublicSourceAllowed !== false
    || boundary.decimalArithmeticAdded !== false
    || boundary.applicationModeAllowed !== false
    || boundary.parallelPipelineAllowed !== false
    || boundary.nextSliceMayStartBeforeD0Closeout !== false) errors.push("P03F14_SCOPE_BOUNDARY_INVALID");
  if (evidence.manifest.mainlineBoundary.nextQueuePositionStarted !== false || evidence.manifest.mainlineBoundary.newPublicSourceAdded !== false) errors.push("P03F14_MAINLINE_BOUNDARY_INVALID");

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    status: evidence.status,
    productAdmissionState: evidence.productAdmissionState,
    d0Complete: evidence.d0Complete,
    metrics,
    slice,
  });
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const result = validateP03FSlice014ProductAdmission();
  console.log(`P03F_SLICE014_READBACK=${JSON.stringify(result)}`);
  if (!result.ok) console.error(`P03F_SLICE014_ERRORS=${JSON.stringify(result.errors)}`);
  process.exitCode = result.ok ? 0 : 1;
}
