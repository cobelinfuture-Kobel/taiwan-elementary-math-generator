import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { materializeP03FSlice011ProductAdmission } from "../../src/curriculum/full-product/p03f-slice011-product-admission.mjs";
import { getCurrentPixelRegistrySnapshot, listCurrentPixelSourceOptions, listPixelKnowledgePointsForSource } from "../../site/pixel/pixel-registry-bridge.js";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const KP = "kp_g4b_u06_one_decimal_times_integer";
const NUMERIC_SPEC = "ps_g4b_u06_one_decimal_times_integer_product_numeric";
const APPLICATION_SPEC = "ps_g4b_u06_one_decimal_times_integer_product_application";
const CAPS = ["cap_decimal_arithmetic", "cap_decimal_domain_validator", "cap_decimal_number_system"];
const readJson = (repoPath) => JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));
function hiddenSpecs() { const hidden = readJson("data/curriculum/application/pattern-specs/w02/g4b_u06_4b06.hidden-pattern-spec.json"); const row = hidden.knowledgePoints.find((entry) => entry.knowledgePointId === KP); return row?.patternSpecs ?? []; }
export function validateP03FSlice011ProductAdmission() {
  const evidence = materializeP03FSlice011ProductAdmission(); const errors = []; const expected = evidence.manifest.expectedCounts; const metrics = evidence.metrics; const slice = evidence.slice;
  if (slice?.queuePosition !== 11 || slice?.sliceId !== "p03e_q011_r6_g4b_u06_4b06_profile_decimal_c1" || slice?.previousSliceId !== "p03e_q010_r6_g4a_u09_4a09_profile_decimal_c1") errors.push("P03F11_QUEUE_IDENTITY_INVALID");
  if (slice?.knowledgePointCount !== 1 || slice?.knowledgePointIds?.[0] !== KP || JSON.stringify(slice?.requiredW3CapabilityIds) !== JSON.stringify(CAPS)) errors.push("P03F11_QUEUE_KP_CAPABILITY_SET_INVALID");
  if (!evidence.predecessorPassed) errors.push("P03F11_PREDECESSOR_SLICE010_NOT_D0");
  for (const [key, value] of Object.entries(expected)) {
    if (key === "publicSourceCountAfterAdmission") {
      if (metrics[key] < value) errors.push(`P03F11_METRIC_INVALID:${key}:${metrics[key]}:${value}`);
    } else if (metrics[key] !== value) errors.push(`P03F11_METRIC_INVALID:${key}:${metrics[key]}:${value}`);
  }
  const hidden = hiddenSpecs(); const numeric = hidden.find((row) => row.patternSpecId === NUMERIC_SPEC); const application = hidden.find((row) => row.patternSpecId === APPLICATION_SPEC);
  for (const row of [numeric, application]) if (!row || row.operationModelId !== "op_g4b_u06_one_decimal_times_integer" || row.requestedUnknownRole !== "product" || JSON.stringify(row.givenRoles) !== JSON.stringify(["decimalFactor", "integerFactor"])) errors.push("P03F11_HIDDEN_PATTERNSPEC_PARITY_INVALID");
  if (!evidence.selectorProjectionAudit.ok) errors.push(...evidence.selectorProjectionAudit.errors.map((code) => `P03F11_SELECTOR_PROJECTION:${code}`));
  if (!evidence.selectorCompositionAudit.ok) errors.push(...evidence.selectorCompositionAudit.errors.map((code) => `P03F11_SELECTOR_COMPOSITION:${code}`));
  if (!evidence.patternAudit.ok) errors.push(...evidence.patternAudit.errors.map((code) => `P03F11_PATTERN:${code}`));
  if (!evidence.controlAudit.ok) errors.push(...evidence.controlAudit.errors.map((code) => `P03F11_CONTROL:${code}`));
  if (!evidence.publicSource || evidence.selectorRow?.knowledgePointId !== KP || evidence.visibleGroups.length !== 2 || evidence.availability?.visibleCount !== 1 || evidence.availability?.hiddenPendingCount !== 5) errors.push("P03F11_PUBLIC_SELECTOR_SURFACE_INVALID");
  const controlModes = evidence.controlProfile?.questionTypeControl?.options?.map((row) => row.value) ?? [];
  if (JSON.stringify(controlModes) !== JSON.stringify(["numeric", "application"]) || evidence.controlProfile?.contextControl?.defaultValue !== "global_primary") errors.push("P03F11_PUBLIC_CONTROL_INVALID");
  const pixelSources = listCurrentPixelSourceOptions(); const pixelRows = listPixelKnowledgePointsForSource("g4b_u06_4b06"); const pixelSnapshot = getCurrentPixelRegistrySnapshot();
  if (pixelSources.length < 26 || pixelRows.length !== 1 || pixelRows[0].knowledgePointId !== KP || pixelSnapshot.sourceCount < 26) errors.push("P03F11_PIXEL_SURFACE_INVALID");
  for (const result of [evidence.numericPlanValidation, evidence.applicationPlanValidation]) if (!result.ok) errors.push(...result.errors.map((row) => `P03F11_PLAN:${row.code}`));
  for (const result of [evidence.numericGeneration, evidence.applicationGeneration]) if (!result.ok || result.questions.length !== 8 || result.allocation.length !== 1 || result.allocation[0].questionCount !== 8) errors.push("P03F11_GENERATION_INVALID");
  for (const result of [evidence.numericValidation, evidence.applicationValidation]) if (!result.ok) errors.push(...result.errors.map((row) => `P03F11_BROWSER_VALIDATOR:${row.code}`));
  const all = [...evidence.numericGeneration.questions, ...evidence.applicationGeneration.questions];
  if (new Set(all.map((row) => row.blankedDisplayText)).size !== all.length) errors.push("P03F11_DUPLICATE_PROMPT");
  if (all.some((row) => row.metadata?.knowledgePointId !== KP || JSON.stringify(row.metadata?.requiredCapabilityIds) !== JSON.stringify(CAPS) || row.product !== row.finalAnswer?.canonicalText || !row.finalAnswer?.exact)) errors.push("P03F11_PRODUCT_OR_CAPABILITY_SCOPE_INVALID");
  if (evidence.applicationGeneration.questions.some((row) => row.metadata?.contextAuthority?.bindingCandidateId !== "w02_bind_ps_g4b_u06_one_decimal_times_integer_product_application" || !String(row.promptText).includes("物資"))) errors.push("P03F11_APPLICATION_CONTEXT_INVALID");
  if (evidence.capabilityWitnesses.some((row) => !row.arithmeticOk || row.arithmeticModel !== "COEFFICIENT_PRODUCT_SCALE_SUM" || row.resultCanonicalValue?.coefficient !== row.expectedCoefficient || row.resultCanonicalValue?.scale !== row.expectedScale)) errors.push("P03F11_DECIMAL_ARITHMETIC_WITNESS_INVALID");
  if (!evidence.numericWorksheet.ok || !evidence.applicationWorksheet.ok || evidence.numericDocument?.generatedQuestions?.length !== 8 || evidence.applicationDocument?.generatedQuestions?.length !== 8 || evidence.numericDocument?.answerKeyItems?.length !== 8 || evidence.applicationDocument?.answerKeyItems?.length !== 8) errors.push("P03F11_WORKSHEET_ANSWER_KEY_INVALID");
  if (!evidence.numericHtml.includes("<!doctype html>") || !evidence.applicationHtml.includes("<!doctype html>")) errors.push("P03F11_HTML_INVALID");
  const boundary = evidence.manifest.mainlineBoundary; if (boundary.queuePositionConsumed !== (evidence.d0Complete ? 11 : 10) || boundary.nextQueuePositionStarted || boundary.otherG4BU06KnowledgePointsAdmitted || boundary.globalContextExpanded || boundary.parallelRuntimePipelineAdded || boundary.sharedWorksheetRendererBehaviorChanged || boundary.slice011KnowledgePointAdmitted !== evidence.d0Complete) errors.push("P03F11_SCOPE_BOUNDARY_INVALID");
  const pending = String(evidence.manifest.status).includes("PENDING_CHROMIUM_ACCEPTANCE") || String(evidence.manifest.status).includes("PENDING_VISUAL_REVIEW");
  if (pending) { if (evidence.artifactIntegrity.ok || evidence.d0Complete || evidence.productAdmissionState !== "RUNTIME_CONNECTED_PENDING_CHROMIUM_ACCEPTANCE") errors.push("P03F11_PRE_D0_FAIL_CLOSE_INVALID"); }
  else if (!evidence.artifactIntegrity.ok || !evidence.d0Complete || evidence.productAdmissionState !== "PRODUCTION_ADMITTED_D0") errors.push("P03F11_D0_ARTIFACT_STATE_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), status: evidence.status, productAdmissionState: evidence.productAdmissionState, d0Complete: evidence.d0Complete, artifactIntegrity: evidence.artifactIntegrity, metrics, slice });
}
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) { const result = validateP03FSlice011ProductAdmission(); console.log(`P03F_SLICE011_READBACK=${JSON.stringify(result)}`); if (!result.ok) console.error(`P03F_SLICE011_ERRORS=${JSON.stringify(result.errors)}`); process.exitCode = result.ok ? 0 : 1; }
