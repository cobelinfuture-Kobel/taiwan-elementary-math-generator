export const SHARED_GOLDEN_RUNTIME_CONSUMER_VERSION = "postg-a01-shared-golden-runtime-consumer-v2";

export const GOLDEN_RUNTIME_CONTRACT_PROFILES = Object.freeze({
  GOLDEN_SAMPLE_FREEZE: "GOLDEN_SAMPLE_FREEZE",
  POST_GOLDEN_UNIT_CONFORMANCE: "POST_GOLDEN_UNIT_CONFORMANCE",
});

const REQUIRED_RUNTIME_LIMIT_FIELDS = Object.freeze([
  "generator",
  "validator",
  "renderer",
  "workflow",
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
  return Object.freeze({ code, ...details });
}

function validateGoldenSampleFreeze(descriptor, errors) {
  if (descriptor.authorityFileCount !== 20) {
    errors.push(issue("GS04_GOLDEN_AUTHORITY_COUNT_INVALID", { actual: descriptor.authorityFileCount }));
  }
  const counts = descriptor.frozenCounts ?? {};
  const expectedCounts = {
    knowledgePointCount: 11,
    patternGroupCount: 17,
    patternSpecCount: 30,
  };
  for (const [field, expected] of Object.entries(expectedCounts)) {
    if (counts[field] !== expected) {
      errors.push(issue("GS04_GOLDEN_FROZEN_COUNT_INVALID", { field, expected, actual: counts[field] }));
    }
  }
}

function validatePostGoldenUnit(descriptor, errors) {
  if (!Number.isInteger(descriptor.authorityFileCount) || descriptor.authorityFileCount < 4) {
    errors.push(issue("POSTG_GOLDEN_AUTHORITY_COUNT_INVALID", { actual: descriptor.authorityFileCount }));
  }
  const counts = descriptor.frozenCounts ?? {};
  for (const field of ["knowledgePointCount", "patternGroupCount", "patternSpecCount"]) {
    if (!Number.isInteger(counts[field]) || counts[field] <= 0) {
      errors.push(issue("POSTG_GOLDEN_UNIT_COUNT_INVALID", { field, actual: counts[field] }));
    }
  }
  if (counts.patternSpecCount < counts.patternGroupCount || counts.patternGroupCount < counts.knowledgePointCount) {
    errors.push(issue("POSTG_GOLDEN_UNIT_COUNT_ORDER_INVALID", { counts: clone(counts) }));
  }
  if (descriptor.knowledgeAuthorityPath == null || descriptor.selectorProjectionPath == null) {
    errors.push(issue("POSTG_GOLDEN_UNIT_AUTHORITY_PATH_MISSING"));
  }
}

export function consumeGoldenRuntimeContract(descriptor = {}, expectedSourceId = descriptor.sourceId) {
  const errors = [];
  const profile = descriptor.contractProfile ?? GOLDEN_RUNTIME_CONTRACT_PROFILES.GOLDEN_SAMPLE_FREEZE;

  if (descriptor.goldenContractId !== "G5AU08_GOLDEN_V1") {
    errors.push(issue("GS04_GOLDEN_CONTRACT_ID_UNSUPPORTED", { actual: descriptor.goldenContractId }));
  }
  if (descriptor.goldenContractVersion !== "1.0.0") {
    errors.push(issue("GS04_GOLDEN_CONTRACT_VERSION_UNSUPPORTED", { actual: descriptor.goldenContractVersion }));
  }
  if (descriptor.contractStatus !== "FROZEN_FOR_GS04_CONSUMPTION") {
    errors.push(issue("GS04_GOLDEN_CONTRACT_NOT_FROZEN", { actual: descriptor.contractStatus }));
  }
  if (!expectedSourceId || descriptor.sourceId !== expectedSourceId) {
    errors.push(issue("GS04_GOLDEN_SOURCE_ID_MISMATCH", { expected: expectedSourceId, actual: descriptor.sourceId }));
  }

  if (profile === GOLDEN_RUNTIME_CONTRACT_PROFILES.GOLDEN_SAMPLE_FREEZE) {
    validateGoldenSampleFreeze(descriptor, errors);
  } else if (profile === GOLDEN_RUNTIME_CONTRACT_PROFILES.POST_GOLDEN_UNIT_CONFORMANCE) {
    validatePostGoldenUnit(descriptor, errors);
  } else {
    errors.push(issue("POSTG_GOLDEN_CONTRACT_PROFILE_UNSUPPORTED", { actual: profile }));
  }

  const runtimeLimits = descriptor.perUnitRuntimeLimits ?? {};
  for (const field of REQUIRED_RUNTIME_LIMIT_FIELDS) {
    if (runtimeLimits[field] !== 0) {
      errors.push(issue("GS04_PER_UNIT_RUNTIME_LIMIT_VIOLATED", { field, actual: runtimeLimits[field] }));
    }
  }

  if (descriptor.globalContextProductionSelectableAtFreeze !== false
    || descriptor.globalContextRuntimeResolvableAtFreeze !== false) {
    errors.push(issue("GS04_PREMATURE_GLOBAL_CONTEXT_ADMISSION"));
  }
  if (descriptor.runtimeModules?.generator == null
    || descriptor.runtimeModules?.validator == null
    || descriptor.runtimeModules?.renderer == null) {
    errors.push(issue("GS04_EXISTING_RUNTIME_MODULE_REFERENCE_MISSING"));
  }

  const ok = errors.length === 0;
  return freeze({
    ok,
    errors,
    consumer: ok ? {
      consumerVersion: SHARED_GOLDEN_RUNTIME_CONSUMER_VERSION,
      connectionStatus: "FROZEN_AND_CONNECTED_TO_EXISTING_SHARED_RUNTIME",
      goldenContractId: descriptor.goldenContractId,
      goldenContractVersion: descriptor.goldenContractVersion,
      contractStatus: descriptor.contractStatus,
      contractProfile: profile,
      sourceId: descriptor.sourceId,
      authorityFileCount: descriptor.authorityFileCount,
      frozenCounts: clone(descriptor.frozenCounts),
      perUnitRuntimeLimits: clone(descriptor.perUnitRuntimeLimits),
      runtimeModules: clone(descriptor.runtimeModules),
      knowledgeAuthorityPath: descriptor.knowledgeAuthorityPath ?? null,
      selectorProjectionPath: descriptor.selectorProjectionPath ?? null,
      runtimeReusePolicy: {
        newGeneratorAllowed: false,
        newValidatorAllowed: false,
        newRendererAllowed: false,
        newUnitWorkflowAllowed: false,
      },
      globalContextAdmission: {
        productionSelectable: false,
        runtimeResolvable: false,
        deferredTask: "POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1",
      },
    } : null,
  });
}

export function attachGoldenRuntimeConsumer(plan = {}, descriptor = {}) {
  const result = consumeGoldenRuntimeContract(descriptor, plan.sourceId);
  if (!result.ok) {
    return freeze({
      ok: false,
      errors: result.errors,
      plan: null,
      consumer: null,
    });
  }
  return freeze({
    ok: true,
    errors: [],
    consumer: result.consumer,
    plan: {
      ...clone(plan),
      goldenRuntimeConsumer: clone(result.consumer),
    },
  });
}
