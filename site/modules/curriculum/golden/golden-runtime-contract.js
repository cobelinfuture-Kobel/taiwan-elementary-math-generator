export const GOLDEN_RUNTIME_CONSUMER_VERSION = "gs04-golden-runtime-consumer-v1";
export const GOLDEN_BATCH_ADAPTER_VERSION = "gs04-golden-batch-adapter-v1";

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, clone(nested)]));
  }
  return value;
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const nested of Object.values(value)) deepFreeze(nested);
  return value;
}

function unique(values = []) {
  return [...new Set((Array.isArray(values) ? values : []).filter(Boolean))];
}

function issue(code, path, message, details = {}) {
  return Object.freeze({ code, severity: "error", path, message, ...details });
}

export function createGoldenRuntimeDescriptor(input = {}) {
  const descriptor = {
    goldenContractId: input.goldenContractId,
    goldenContractVersion: input.goldenContractVersion,
    goldenContractStatus: input.goldenContractStatus,
    sourceId: input.sourceId,
    knowledgePointIds: unique(input.knowledgePointIds),
    patternGroupIds: unique(input.patternGroupIds),
    patternSpecIds: unique(input.patternSpecIds),
    requiredQuestionFields: unique(input.requiredQuestionFields),
    supportedSelectionModes: unique(input.supportedSelectionModes),
    sourceUnitInternalSelectionMode: input.sourceUnitInternalSelectionMode ?? "mixedKnowledgePointsSameUnit",
    productionUse: input.productionUse,
    productionSelectorStatus: input.productionSelectorStatus,
    globalContextLifecycle: input.globalContextLifecycle,
    globalContextProductionSelectable: input.globalContextProductionSelectable === true,
    globalContextRuntimeResolvable: input.globalContextRuntimeResolvable === true,
    genericFallbackAllowed: input.genericFallbackAllowed === true,
    freeFormAICompositionAllowed: input.freeFormAICompositionAllowed === true,
    runtimeModules: clone(input.runtimeModules ?? {}),
    expectedCounts: {
      knowledgePointCount: input.expectedCounts?.knowledgePointCount,
      patternGroupCount: input.expectedCounts?.patternGroupCount,
      patternSpecCount: input.expectedCounts?.patternSpecCount,
    },
  };
  return deepFreeze(descriptor);
}

export function validateGoldenRuntimeDescriptor(descriptor = {}) {
  const errors = [];
  if (!descriptor.goldenContractId) errors.push(issue("GOLDEN_RUNTIME_CONTRACT_ID_MISSING", "goldenContractId", "Golden contract ID is required."));
  if (!descriptor.goldenContractVersion) errors.push(issue("GOLDEN_RUNTIME_CONTRACT_VERSION_MISSING", "goldenContractVersion", "Golden contract version is required."));
  if (descriptor.goldenContractStatus !== "FROZEN_FOR_GS04_CONSUMPTION") {
    errors.push(issue("GOLDEN_RUNTIME_CONTRACT_NOT_FROZEN", "goldenContractStatus", "Only a GS04-consumable frozen contract may register."));
  }
  if (!descriptor.sourceId) errors.push(issue("GOLDEN_RUNTIME_SOURCE_ID_MISSING", "sourceId", "Golden runtime sourceId is required."));

  const identitySets = [
    ["knowledgePointIds", descriptor.knowledgePointIds, descriptor.expectedCounts?.knowledgePointCount],
    ["patternGroupIds", descriptor.patternGroupIds, descriptor.expectedCounts?.patternGroupCount],
    ["patternSpecIds", descriptor.patternSpecIds, descriptor.expectedCounts?.patternSpecCount],
  ];
  for (const [field, values, expectedCount] of identitySets) {
    if (!Array.isArray(values) || values.length === 0) {
      errors.push(issue("GOLDEN_RUNTIME_IDENTITY_SET_EMPTY", field, `${field} must contain frozen authority IDs.`));
      continue;
    }
    if (new Set(values).size !== values.length) {
      errors.push(issue("GOLDEN_RUNTIME_IDENTITY_SET_DUPLICATE", field, `${field} must be unique.`));
    }
    if (!Number.isInteger(expectedCount) || expectedCount !== values.length) {
      errors.push(issue("GOLDEN_RUNTIME_FROZEN_COUNT_MISMATCH", field, `${field} does not match the frozen count.`, {
        expected: expectedCount,
        actual: values.length,
      }));
    }
  }

  if (!descriptor.supportedSelectionModes?.includes("singleKnowledgePoint")
    || !descriptor.supportedSelectionModes?.includes("mixedKnowledgePointsSameUnit")) {
    errors.push(issue("GOLDEN_RUNTIME_SELECTION_MODES_INCOMPLETE", "supportedSelectionModes", "Golden runtime must support single and same-unit mixed KP modes."));
  }
  if (descriptor.sourceUnitInternalSelectionMode !== "mixedKnowledgePointsSameUnit") {
    errors.push(issue("GOLDEN_RUNTIME_SOURCE_UNIT_MODE_INVALID", "sourceUnitInternalSelectionMode", "Source-unit adaptation must resolve through same-unit mixed KP mode."));
  }
  if (descriptor.productionUse !== "allowed" || descriptor.productionSelectorStatus !== "visible") {
    errors.push(issue("GOLDEN_RUNTIME_PRODUCTION_BASELINE_INVALID", "productionUse", "The registered Golden unit must already have an admitted visible production baseline."));
  }
  if (descriptor.globalContextProductionSelectable || descriptor.globalContextRuntimeResolvable) {
    errors.push(issue("GOLDEN_RUNTIME_CONTEXT_PREMATURELY_ADMITTED", "globalContextLifecycle", "GS02 contexts remain candidate-only during GS04."));
  }
  if (descriptor.genericFallbackAllowed || descriptor.freeFormAICompositionAllowed) {
    errors.push(issue("GOLDEN_RUNTIME_UNSAFE_FALLBACK_ENABLED", "genericFallbackAllowed", "Generic fallback and free-form AI are forbidden."));
  }
  if (!Array.isArray(descriptor.requiredQuestionFields) || descriptor.requiredQuestionFields.length === 0) {
    errors.push(issue("GOLDEN_RUNTIME_REQUIRED_QUESTION_FIELDS_MISSING", "requiredQuestionFields", "Frozen question fields are required."));
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

export function adaptGoldenSourceUnitPlan(plan = {}, descriptor = {}) {
  if (plan.sourceId !== descriptor.sourceId || plan.selectionMode !== "sourceUnit") {
    return Object.freeze({ plan: clone(plan), applied: false, adapter: null });
  }
  const validation = validateGoldenRuntimeDescriptor(descriptor);
  if (!validation.ok) {
    return Object.freeze({ plan: clone(plan), applied: false, adapter: null, errors: validation.errors });
  }
  const adapter = deepFreeze({
    version: GOLDEN_BATCH_ADAPTER_VERSION,
    applied: true,
    adapterId: `${descriptor.goldenContractId}:${descriptor.sourceId}:sourceUnit`,
    publicSelectionMode: "sourceUnit",
    internalSelectionMode: descriptor.sourceUnitInternalSelectionMode,
    goldenContractId: descriptor.goldenContractId,
    goldenContractVersion: descriptor.goldenContractVersion,
    knowledgePointCount: descriptor.knowledgePointIds.length,
    patternGroupCount: descriptor.patternGroupIds.length,
    patternSpecCount: descriptor.patternSpecIds.length,
  });
  const adapted = {
    ...clone(plan),
    publicSelectionMode: "sourceUnit",
    selectionMode: descriptor.sourceUnitInternalSelectionMode,
    selectedKnowledgePointIds: [...descriptor.knowledgePointIds],
    knowledgePointIds: [...descriptor.knowledgePointIds],
    selectedPatternGroupIds: [...descriptor.patternGroupIds],
    publicNPlus2: false,
    publicFormalEquation: false,
    genericFallback: false,
    freeFormAI: false,
    sourceUnitAdapter: adapter,
    goldenRuntimeRequest: {
      consumerVersion: GOLDEN_RUNTIME_CONSUMER_VERSION,
      goldenContractId: descriptor.goldenContractId,
      goldenContractVersion: descriptor.goldenContractVersion,
      sourceId: descriptor.sourceId,
      adapterVersion: GOLDEN_BATCH_ADAPTER_VERSION,
    },
  };
  return Object.freeze({ plan: adapted, applied: true, adapter });
}

function documentSourceId(document = {}) {
  return document.batchA?.sourceId
    ?? document.publicControls?.sourceId
    ?? document.configSnapshot?.sourceId
    ?? null;
}

function questionIdentityErrors(document, descriptor) {
  const errors = [];
  const questions = document.generatedQuestions ?? [];
  const allowedKnowledgePoints = new Set(descriptor.knowledgePointIds);
  const allowedPatternGroups = new Set(descriptor.patternGroupIds);
  const allowedPatternSpecs = new Set(descriptor.patternSpecIds);
  for (const [index, question] of questions.entries()) {
    const path = `worksheetDocument.generatedQuestions[${index}]`;
    for (const field of descriptor.requiredQuestionFields) {
      if (question[field] === undefined || question[field] === null) {
        errors.push(issue("GOLDEN_RUNTIME_QUESTION_FIELD_MISSING", `${path}.${field}`, `Frozen question field '${field}' is missing.`));
      }
    }
    if (!allowedKnowledgePoints.has(question.knowledgePointId)) {
      errors.push(issue("GOLDEN_RUNTIME_KP_OUTSIDE_CONTRACT", `${path}.knowledgePointId`, "Generated KP is outside the Golden contract."));
    }
    const patternGroupId = question.resolvedPatternGroupId ?? question.patternGroupId;
    if (!allowedPatternGroups.has(patternGroupId)) {
      errors.push(issue("GOLDEN_RUNTIME_GROUP_OUTSIDE_CONTRACT", `${path}.patternGroupId`, "Generated PatternGroup is outside the Golden contract."));
    }
    if (!allowedPatternSpecs.has(question.patternSpecId)) {
      errors.push(issue("GOLDEN_RUNTIME_PATTERN_OUTSIDE_CONTRACT", `${path}.patternSpecId`, "Generated PatternSpec is outside the Golden contract."));
    }
    if (question.fallbackUsed !== false || question.genericFallbackAllowed !== false) {
      errors.push(issue("GOLDEN_RUNTIME_FALLBACK_OUTPUT_BLOCKED", path, "Golden output may not use generic fallback."));
    }
  }
  return errors;
}

function blockedGoldenResult(result, errors, descriptor) {
  return {
    ...result,
    ok: false,
    worksheetDocument: null,
    errors: [...(result?.errors ?? []), ...errors],
    validation: {
      ok: false,
      errors: [...(result?.validation?.errors ?? []), ...errors],
      warnings: [...(result?.validation?.warnings ?? [])],
      infos: [],
      validatorVersion: GOLDEN_RUNTIME_CONSUMER_VERSION,
      validatedAt: null,
    },
    goldenRuntime: {
      applied: true,
      accepted: false,
      goldenContractId: descriptor.goldenContractId,
      goldenContractVersion: descriptor.goldenContractVersion,
      errors,
    },
  };
}

export function applyGoldenRuntimeContract(result, plan = {}, descriptor = null) {
  if (!descriptor || plan.sourceId !== descriptor.sourceId) return result;
  const descriptorValidation = validateGoldenRuntimeDescriptor(descriptor);
  if (!descriptorValidation.ok) return blockedGoldenResult(result, descriptorValidation.errors, descriptor);
  if (!result?.ok || !result.worksheetDocument) {
    return {
      ...result,
      goldenRuntime: {
        applied: true,
        accepted: false,
        goldenContractId: descriptor.goldenContractId,
        goldenContractVersion: descriptor.goldenContractVersion,
        upstreamBlocked: true,
      },
    };
  }

  const document = result.worksheetDocument;
  const errors = [];
  if (documentSourceId(document) !== descriptor.sourceId) {
    errors.push(issue("GOLDEN_RUNTIME_DOCUMENT_SOURCE_MISMATCH", "worksheetDocument.batchA.sourceId", "Worksheet source does not match the Golden contract."));
  }
  errors.push(...questionIdentityErrors(document, descriptor));
  if (errors.length > 0) return blockedGoldenResult(result, errors, descriptor);

  const readback = deepFreeze({
    consumerVersion: GOLDEN_RUNTIME_CONSUMER_VERSION,
    adapterVersion: plan.sourceUnitAdapter?.version ?? null,
    adapterApplied: plan.sourceUnitAdapter?.applied === true,
    goldenContractId: descriptor.goldenContractId,
    goldenContractVersion: descriptor.goldenContractVersion,
    sourceId: descriptor.sourceId,
    accepted: true,
    generatedQuestionCount: document.generatedQuestions?.length ?? 0,
    globalContextLifecycle: descriptor.globalContextLifecycle,
    globalContextProductionSelectable: false,
    globalContextRuntimeResolvable: false,
    genericFallbackUsed: false,
    freeFormAIUsed: false,
  });
  const worksheetDocument = {
    ...document,
    goldenRuntime: readback,
    metadata: { ...(document.metadata ?? {}), goldenRuntime: clone(readback) },
    publicControls: {
      ...(document.publicControls ?? {}),
      goldenContractId: descriptor.goldenContractId,
      goldenContractVersion: descriptor.goldenContractVersion,
      genericFallback: false,
      freeFormAI: false,
    },
    provenance: {
      ...(document.provenance ?? {}),
      goldenContractId: descriptor.goldenContractId,
      goldenContractVersion: descriptor.goldenContractVersion,
      goldenRuntimeConsumerVersion: GOLDEN_RUNTIME_CONSUMER_VERSION,
      goldenBatchAdapterVersion: plan.sourceUnitAdapter?.version ?? null,
      genericFallbackUsed: false,
      freeFormAIUsed: false,
    },
    configSnapshot: {
      ...(document.configSnapshot ?? {}),
      goldenRuntime: clone(readback),
    },
    summary: {
      ...(document.summary ?? {}),
      goldenRuntimeAccepted: true,
      goldenContractId: descriptor.goldenContractId,
      goldenContractVersion: descriptor.goldenContractVersion,
    },
  };
  return {
    ...result,
    worksheetDocument,
    goldenRuntime: readback,
  };
}
