export const SHARED_GOLDEN_RUNTIME_CONSUMER_VERSION = "postg-shared-golden-runtime-consumer-v2";

const REQUIRED_RUNTIME_LIMIT_FIELDS = Object.freeze([
  "generator",
  "validator",
  "renderer",
  "workflow",
]);

const DESCRIPTOR_MODES = Object.freeze({
  GOLDEN_SAMPLE: "golden_sample_frozen",
  POST_GOLDEN: "post_golden_unit_conformance",
});

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

function descriptorMode(descriptor) {
  return descriptor.descriptorMode ?? DESCRIPTOR_MODES.GOLDEN_SAMPLE;
}

function validateGoldenSampleDescriptor(descriptor, errors) {
  if (descriptor.contractStatus !== "FROZEN_FOR_GS04_CONSUMPTION") {
    errors.push(issue("GS04_GOLDEN_CONTRACT_NOT_FROZEN", { actual: descriptor.contractStatus }));
  }
  if (!Number.isInteger(descriptor.authorityFileCount) || descriptor.authorityFileCount !== 20) {
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
      errors.push(issue("GS04_GOLDEN_FROZEN_COUNT_INVALID", {
        field,
        expected,
        actual: counts[field],
      }));
    }
  }
}

function validatePostGoldenDescriptor(descriptor, errors) {
  if (!["POST_GOLDEN_CONFORMANCE_CANDIDATE", "POST_GOLDEN_CONFORMANT_UNIT"].includes(descriptor.contractStatus)) {
    errors.push(issue("POSTG_GOLDEN_CONTRACT_STATUS_INVALID", { actual: descriptor.contractStatus }));
  }
  if (!Number.isInteger(descriptor.authorityFileCount) || descriptor.authorityFileCount < 5) {
    errors.push(issue("POSTG_GOLDEN_AUTHORITY_COUNT_INVALID", { actual: descriptor.authorityFileCount }));
  }
  const counts = descriptor.frozenCounts ?? {};
  for (const field of ["knowledgePointCount", "patternGroupCount", "patternSpecCount"]) {
    if (!Number.isInteger(counts[field]) || counts[field] < 1) {
      errors.push(issue("POSTG_GOLDEN_UNIT_COUNT_INVALID", { field, actual: counts[field] }));
    }
  }
  if (counts.patternGroupCount < counts.knowledgePointCount) {
    errors.push(issue("POSTG_GOLDEN_PATTERN_GROUP_COVERAGE_INVALID", { counts: clone(counts) }));
  }
  if (counts.patternSpecCount < counts.patternGroupCount) {
    errors.push(issue("POSTG_GOLDEN_PATTERN_SPEC_COVERAGE_INVALID", { counts: clone(counts) }));
  }
  if (descriptor.baseGoldenContractId !== "G5AU08_GOLDEN_V1"
    || descriptor.baseGoldenContractVersion !== "1.0.0") {
    errors.push(issue("POSTG_BASE_GOLDEN_CONTRACT_DRIFT"));
  }
  if (descriptor.knowledgeRegistryPath == null) {
    errors.push(issue("POSTG_KNOWLEDGE_REGISTRY_REFERENCE_MISSING"));
  }
}

export function consumeGoldenRuntimeContract(descriptor = {}, expectedSourceId = descriptor.sourceId) {
  const errors = [];
  const mode = descriptorMode(descriptor);

  if (descriptor.goldenContractId !== "G5AU08_GOLDEN_V1") {
    errors.push(issue("GS04_GOLDEN_CONTRACT_ID_UNSUPPORTED", { actual: descriptor.goldenContractId }));
  }
  if (descriptor.goldenContractVersion !== "1.0.0") {
    errors.push(issue("GS04_GOLDEN_CONTRACT_VERSION_UNSUPPORTED", { actual: descriptor.goldenContractVersion }));
  }
  if (!expectedSourceId || descriptor.sourceId !== expectedSourceId) {
    errors.push(issue("GS04_GOLDEN_SOURCE_ID_MISMATCH", {
      expected: expectedSourceId,
      actual: descriptor.sourceId,
    }));
  }

  if (mode === DESCRIPTOR_MODES.GOLDEN_SAMPLE) {
    validateGoldenSampleDescriptor(descriptor, errors);
  } else if (mode === DESCRIPTOR_MODES.POST_GOLDEN) {
    validatePostGoldenDescriptor(descriptor, errors);
  } else {
    errors.push(issue("POSTG_GOLDEN_DESCRIPTOR_MODE_UNSUPPORTED", { actual: mode }));
  }

  const runtimeLimits = descriptor.perUnitRuntimeLimits ?? {};
  for (const field of REQUIRED_RUNTIME_LIMIT_FIELDS) {
    if (runtimeLimits[field] !== 0) {
      errors.push(issue("GS04_PER_UNIT_RUNTIME_LIMIT_VIOLATED", {
        field,
        actual: runtimeLimits[field],
      }));
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
      descriptorMode: mode,
      connectionStatus: mode === DESCRIPTOR_MODES.POST_GOLDEN
        ? "POST_GOLDEN_UNIT_CONNECTED_TO_EXISTING_SHARED_RUNTIME"
        : "FROZEN_AND_CONNECTED_TO_EXISTING_SHARED_RUNTIME",
      goldenContractId: descriptor.goldenContractId,
      goldenContractVersion: descriptor.goldenContractVersion,
      contractStatus: descriptor.contractStatus,
      sourceId: descriptor.sourceId,
      authorityFileCount: descriptor.authorityFileCount,
      frozenCounts: clone(descriptor.frozenCounts),
      perUnitRuntimeLimits: clone(descriptor.perUnitRuntimeLimits),
      runtimeModules: clone(descriptor.runtimeModules),
      knowledgeRegistryPath: descriptor.knowledgeRegistryPath ?? null,
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
