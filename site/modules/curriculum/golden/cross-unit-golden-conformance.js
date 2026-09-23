export const G5AU08_GOLDEN_CROSS_UNIT_CONFORMANCE_VERSION = "gs05-cross-unit-conformance-v1";

export const GOLDEN_CONFORMANCE_STATUSES = Object.freeze({
  GOLDEN_CONFORMANT: "GOLDEN_CONFORMANT",
  IN_PROGRESS_GOLDEN_NATIVE: "IN_PROGRESS_GOLDEN_NATIVE",
  BLOCKED_CONFORMANCE: "BLOCKED_CONFORMANCE",
});

const PILOT_CLASSES = Object.freeze([
  "legacy_numeric_completed",
  "legacy_application_completed",
  "golden_native_in_progress",
]);

const LEGACY_REQUIRED_EVIDENCE = Object.freeze([
  "runtimeExecuted",
  "generatorOk",
  "validatorOk",
  "rendererOk",
  "answerKeyOk",
  "productionUseAllowed",
  "authoritativeProductionEvidencePresent",
]);

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, clone(nested)]));
  }
  return value;
}

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
}

function issue(code, details = {}) {
  return freeze({ code, ...details });
}

function runtimeAdditionsAreZero(pilot) {
  const additions = pilot.perUnitRuntimeAdditions ?? {};
  return ["generator", "validator", "renderer", "workflow"]
    .every((field) => additions[field] === 0);
}

export function evaluateGoldenCrossUnitPilot(pilot = {}, evidence = {}) {
  const errors = [];

  if (pilot.goldenContractId !== "G5AU08_GOLDEN_V1") {
    errors.push(issue("GS05_GOLDEN_CONTRACT_ID_INVALID", { actual: pilot.goldenContractId }));
  }
  if (pilot.goldenContractVersion !== "1.0.0") {
    errors.push(issue("GS05_GOLDEN_CONTRACT_VERSION_INVALID", { actual: pilot.goldenContractVersion }));
  }
  if (!pilot.sourceId) errors.push(issue("GS05_SOURCE_ID_MISSING"));
  if (!PILOT_CLASSES.includes(pilot.pilotClass)) {
    errors.push(issue("GS05_PILOT_CLASS_INVALID", { actual: pilot.pilotClass }));
  }
  if (!runtimeAdditionsAreZero(pilot)) {
    errors.push(issue("GS05_PER_UNIT_RUNTIME_DUPLICATION_DETECTED"));
  }

  let expectedStatus = pilot.expectedConformanceStatus;
  if (pilot.pilotClass === "legacy_numeric_completed"
    || pilot.pilotClass === "legacy_application_completed") {
    if (expectedStatus !== GOLDEN_CONFORMANCE_STATUSES.GOLDEN_CONFORMANT) {
      errors.push(issue("GS05_LEGACY_EXPECTED_STATUS_INVALID", { actual: expectedStatus }));
    }
    for (const field of LEGACY_REQUIRED_EVIDENCE) {
      if (evidence[field] !== true) {
        errors.push(issue("GS05_LEGACY_RUNTIME_EVIDENCE_MISSING", { field }));
      }
    }
    if (!Number.isInteger(evidence.questionCount) || evidence.questionCount <= 0) {
      errors.push(issue("GS05_QUESTION_COUNT_INVALID", { actual: evidence.questionCount }));
    }
    if (evidence.answerKeyCount !== evidence.questionCount) {
      errors.push(issue("GS05_ANSWER_KEY_COUNT_MISMATCH", {
        questionCount: evidence.questionCount,
        answerKeyCount: evidence.answerKeyCount,
      }));
    }
    if (pilot.pilotClass === "legacy_application_completed") {
      if (evidence.contextBindingValidated !== true) {
        errors.push(issue("GS05_APPLICATION_CONTEXT_BINDING_NOT_VALIDATED"));
      }
      if (!Number.isInteger(evidence.approvedContextCount) || evidence.approvedContextCount < 5) {
        errors.push(issue("GS05_APPLICATION_CONTEXT_COVERAGE_TOO_SMALL", {
          actual: evidence.approvedContextCount,
        }));
      }
    }
  } else if (pilot.pilotClass === "golden_native_in_progress") {
    if (expectedStatus !== GOLDEN_CONFORMANCE_STATUSES.IN_PROGRESS_GOLDEN_NATIVE) {
      errors.push(issue("GS05_NATIVE_EXPECTED_STATUS_INVALID", { actual: expectedStatus }));
    }
    if (evidence.dataRegistryPresent !== true) {
      errors.push(issue("GS05_NATIVE_DATA_REGISTRY_MISSING"));
    }
    if (!Number.isInteger(evidence.dataNodeCount) || evidence.dataNodeCount <= 0) {
      errors.push(issue("GS05_NATIVE_DATA_NODE_COUNT_INVALID", { actual: evidence.dataNodeCount }));
    }
    if (evidence.productionActivationBlocked !== true) {
      errors.push(issue("GS05_NATIVE_PRODUCTION_ACTIVATION_NOT_BLOCKED"));
    }
    if (evidence.unsupportedRowsHaveHoldReason !== true) {
      errors.push(issue("GS05_NATIVE_HOLD_REASON_MISSING"));
    }
    if (evidence.productionUseAllowed === true) {
      errors.push(issue("GS05_NATIVE_PREMATURE_PRODUCTION_ADMISSION"));
    }
  }

  const ok = errors.length === 0;
  return freeze({
    ok,
    errors,
    pilotId: pilot.pilotId ?? null,
    sourceId: pilot.sourceId ?? null,
    pilotClass: pilot.pilotClass ?? null,
    conformanceStatus: ok ? expectedStatus : GOLDEN_CONFORMANCE_STATUSES.BLOCKED_CONFORMANCE,
    evidence: clone(evidence),
  });
}

export function evaluateGoldenCrossUnitProgram(pilots = [], evidenceBySource = {}) {
  const errors = [];
  if (!Array.isArray(pilots) || pilots.length !== 3) {
    errors.push(issue("GS05_PILOT_COUNT_INVALID", { actual: Array.isArray(pilots) ? pilots.length : null }));
  }
  const classSet = new Set(pilots.map((pilot) => pilot.pilotClass));
  for (const pilotClass of PILOT_CLASSES) {
    if (!classSet.has(pilotClass)) errors.push(issue("GS05_REQUIRED_PILOT_CLASS_MISSING", { pilotClass }));
  }
  if (new Set(pilots.map((pilot) => pilot.sourceId)).size !== pilots.length) {
    errors.push(issue("GS05_DUPLICATE_PILOT_SOURCE_ID"));
  }

  const results = pilots.map((pilot) => evaluateGoldenCrossUnitPilot(
    pilot,
    evidenceBySource[pilot.sourceId] ?? {},
  ));
  for (const result of results) errors.push(...result.errors);

  return freeze({
    ok: errors.length === 0,
    errors,
    evaluatorVersion: G5AU08_GOLDEN_CROSS_UNIT_CONFORMANCE_VERSION,
    pilotCount: pilots.length,
    conformantCompletedUnitCount: results.filter(
      (result) => result.conformanceStatus === GOLDEN_CONFORMANCE_STATUSES.GOLDEN_CONFORMANT,
    ).length,
    goldenNativeInProgressCount: results.filter(
      (result) => result.conformanceStatus === GOLDEN_CONFORMANCE_STATUSES.IN_PROGRESS_GOLDEN_NATIVE,
    ).length,
    results,
  });
}
