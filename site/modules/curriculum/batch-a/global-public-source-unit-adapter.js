import { consumeGoldenRuntimeContract } from "../golden/shared-golden-runtime-consumer.js";
import {
  GLOBAL_PUBLIC_SOURCE_UNIT_ADAPTER_REGISTRY_VERSION,
  POST_GOLDEN_SOURCE_UNIT_ADAPTER_REGISTRY_VERSION,
  listGlobalPublicSourceUnitAdapterDescriptors,
  listPostGoldenSourceUnitAdapterDescriptors,
  resolveGlobalPublicSourceUnitAdapterDescriptor,
  resolvePostGoldenSourceUnitAdapterDescriptor,
  validateGlobalPublicSourceUnitAdapterRegistry,
  validatePostGoldenSourceUnitAdapterRegistry,
} from "./global-public-source-unit-adapter-registry.js";

export const GLOBAL_PUBLIC_SOURCE_UNIT_ADAPTER_VERSION = "glm-s05-source-unit-adapter-v1";

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, clone(nested)]));
  }
  return value;
}

function passthrough(plan) {
  return {
    plan: { ...plan },
    applied: false,
    blocked: false,
    errors: [],
    adapter: null,
  };
}

function blockedAdaptation(plan, descriptor, errors, registryVersion = GLOBAL_PUBLIC_SOURCE_UNIT_ADAPTER_REGISTRY_VERSION) {
  return Object.freeze({
    plan: null,
    applied: false,
    blocked: true,
    errors: Object.freeze([...errors]),
    adapter: Object.freeze({
      version: GLOBAL_PUBLIC_SOURCE_UNIT_ADAPTER_VERSION,
      registryVersion,
      adapterId: descriptor?.adapterId ?? null,
      sourceId: plan.sourceId ?? null,
      applied: false,
      blocked: true,
    }),
  });
}

function hasGoldenActivationFields(plan) {
  return plan.goldenContractId != null
    || plan.goldenContractVersion != null
    || plan.goldenRuntimeMode != null;
}

function requestsGoldenActivation(plan, descriptor) {
  if (!descriptor.requiresExplicitGoldenActivation) return true;
  if (!hasGoldenActivationFields(plan)) return false;
  return plan.goldenContractId === descriptor.goldenContractDescriptor.goldenContractId
    && plan.goldenContractVersion === descriptor.goldenContractDescriptor.goldenContractVersion
    && plan.goldenRuntimeMode === "shadow";
}

function hasPartialOrInvalidGoldenActivation(plan, descriptor) {
  if (!descriptor.requiresExplicitGoldenActivation) return false;
  return hasGoldenActivationFields(plan) && !requestsGoldenActivation(plan, descriptor);
}

function isAuthorizedPostGoldenPlan(plan, descriptor) {
  return descriptor?.taskId != null
    && plan.postGoldenMigrationTaskId === descriptor.taskId;
}

function canonicalSourceUnitPlan(plan, descriptor, goldenRuntimeConsumer, registryVersion) {
  const knowledgePointIds = descriptor.knowledgePointIds;
  const patternGroupIds = descriptor.patternGroupIds;
  const patternSpecIds = descriptor.patternSpecIds ?? [];
  const goldenMetadata = goldenRuntimeConsumer ? {
    goldenContractId: goldenRuntimeConsumer.goldenContractId,
    goldenContractVersion: goldenRuntimeConsumer.goldenContractVersion,
    goldenConnectionStatus: goldenRuntimeConsumer.connectionStatus,
    goldenDescriptorMode: goldenRuntimeConsumer.descriptorMode,
  } : {};
  const goldenResolverResult = goldenRuntimeConsumer ? {
    resolverResult: {
      ...(clone(plan.resolverResult ?? {})),
      ok: true,
      errors: [],
      knowledgePointIds: [...knowledgePointIds],
      patternGroupIds: [...patternGroupIds],
      patternSpecIds: [...patternSpecIds],
      provenance: {
        ...(clone(plan.resolverResult?.provenance ?? {})),
        resolver: "visiblePatternGroupResolver",
        sourceId: descriptor.sourceId,
        sharedGoldenAdapterApplied: true,
        postGoldenMigrationTaskId: descriptor.taskId ?? null,
        goldenRuntimeMode: descriptor.requiresExplicitGoldenActivation ? "shadow" : "production",
      },
    },
  } : {};
  return {
    ...plan,
    ...clone(descriptor.planOverrides ?? {}),
    ...goldenResolverResult,
    publicSelectionMode: "sourceUnit",
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [...knowledgePointIds],
    knowledgePointIds: [...knowledgePointIds],
    selectedPatternGroupIds: [...patternGroupIds],
    ...(patternSpecIds.length > 0 ? { patternSpecIds: [...patternSpecIds] } : {}),
    ...(goldenRuntimeConsumer ? { goldenRuntimeConsumer: clone(goldenRuntimeConsumer) } : {}),
    sourceUnitAdapter: {
      version: GLOBAL_PUBLIC_SOURCE_UNIT_ADAPTER_VERSION,
      registryVersion,
      adapterId: descriptor.adapterId,
      conformanceMode: descriptor.conformanceMode,
      applied: true,
      blocked: false,
      publicSelectionMode: "sourceUnit",
      internalSelectionMode: "mixedKnowledgePointsSameUnit",
      knowledgePointCount: knowledgePointIds.length,
      patternGroupCount: patternGroupIds.length,
      patternSpecCount: patternSpecIds.length,
      postGoldenMigrationTaskId: descriptor.taskId ?? null,
      ...goldenMetadata,
    },
  };
}

function resolveDescriptorForPlan(plan) {
  const baseDescriptor = resolveGlobalPublicSourceUnitAdapterDescriptor(plan.sourceId);
  if (baseDescriptor) {
    return {
      descriptor: baseDescriptor,
      registryVersion: GLOBAL_PUBLIC_SOURCE_UNIT_ADAPTER_REGISTRY_VERSION,
      registryValidation: validateGlobalPublicSourceUnitAdapterRegistry(),
    };
  }

  const postGoldenDescriptor = resolvePostGoldenSourceUnitAdapterDescriptor(plan.sourceId);
  if (!postGoldenDescriptor || !isAuthorizedPostGoldenPlan(plan, postGoldenDescriptor)) return null;
  return {
    descriptor: postGoldenDescriptor,
    registryVersion: POST_GOLDEN_SOURCE_UNIT_ADAPTER_REGISTRY_VERSION,
    registryValidation: validatePostGoldenSourceUnitAdapterRegistry(),
  };
}

export function adaptGlobalPublicSourceUnitPlan(plan = {}) {
  if (plan.selectionMode !== "sourceUnit") return passthrough(plan);

  const resolved = resolveDescriptorForPlan(plan);
  if (!resolved) {
    return hasGoldenActivationFields(plan)
      ? blockedAdaptation(plan, null, ["GS05_GOLDEN_UNIT_NOT_REGISTERED"])
      : passthrough(plan);
  }
  const { descriptor, registryVersion, registryValidation } = resolved;

  if (descriptor.requiresExplicitGoldenActivation && !requestsGoldenActivation(plan, descriptor)) {
    return hasPartialOrInvalidGoldenActivation(plan, descriptor)
      ? blockedAdaptation(plan, descriptor, ["GS04_GOLDEN_SHADOW_ACTIVATION_INVALID"], registryVersion)
      : passthrough(plan);
  }

  if (!registryValidation.ok) {
    return blockedAdaptation(plan, descriptor, registryValidation.errors, registryVersion);
  }
  if (descriptor.knowledgePointIds.length !== descriptor.expectedCounts.knowledgePoints
    || descriptor.patternGroupIds.length !== descriptor.expectedCounts.patternGroups
    || (Number.isInteger(descriptor.expectedCounts.patternSpecs)
      && descriptor.patternSpecIds.length !== descriptor.expectedCounts.patternSpecs)) {
    return blockedAdaptation(plan, descriptor, ["GS04_SOURCE_UNIT_DESCRIPTOR_COUNT_DRIFT"], registryVersion);
  }

  let goldenRuntimeConsumer = null;
  if (descriptor.goldenContractDescriptor) {
    const consumed = consumeGoldenRuntimeContract(descriptor.goldenContractDescriptor, plan.sourceId);
    if (!consumed.ok) {
      return blockedAdaptation(plan, descriptor, consumed.errors.map((entry) => entry.code), registryVersion);
    }
    goldenRuntimeConsumer = consumed.consumer;
  }

  const adapted = canonicalSourceUnitPlan(plan, descriptor, goldenRuntimeConsumer, registryVersion);
  return Object.freeze({
    plan: adapted,
    applied: true,
    blocked: false,
    errors: [],
    adapter: Object.freeze({ ...adapted.sourceUnitAdapter }),
  });
}

function validationPlan(descriptor) {
  const plan = {
    sourceId: descriptor.sourceId,
    selectionMode: "sourceUnit",
  };
  if (descriptor.taskId) plan.postGoldenMigrationTaskId = descriptor.taskId;
  if (descriptor.requiresExplicitGoldenActivation) {
    plan.goldenContractId = descriptor.goldenContractDescriptor.goldenContractId;
    plan.goldenContractVersion = descriptor.goldenContractDescriptor.goldenContractVersion;
    plan.goldenRuntimeMode = "shadow";
  }
  return plan;
}

function validateDescriptorAdaptations(descriptors, errors) {
  for (const row of descriptors) {
    const descriptor = row.taskId
      ? resolvePostGoldenSourceUnitAdapterDescriptor(row.sourceId)
      : resolveGlobalPublicSourceUnitAdapterDescriptor(row.sourceId);
    if (!descriptor) {
      errors.push("GS04_SOURCE_UNIT_DESCRIPTOR_MISSING");
      continue;
    }
    const result = adaptGlobalPublicSourceUnitPlan(validationPlan(descriptor));
    if (!result.applied || result.blocked
      || result.plan.selectedKnowledgePointIds.length !== descriptor.expectedCounts.knowledgePoints
      || result.plan.selectedPatternGroupIds.length !== descriptor.expectedCounts.patternGroups
      || (Number.isInteger(descriptor.expectedCounts.patternSpecs)
        && result.plan.patternSpecIds.length !== descriptor.expectedCounts.patternSpecs)) {
      errors.push(`GS04_SOURCE_UNIT_ADAPTER_INVALID:${descriptor.sourceId}`);
    }
  }
}

export function validateGlobalPublicSourceUnitAdapters() {
  const registry = validateGlobalPublicSourceUnitAdapterRegistry();
  const postGoldenRegistry = validatePostGoldenSourceUnitAdapterRegistry();
  const errors = [...registry.errors, ...postGoldenRegistry.errors];
  validateDescriptorAdaptations(listGlobalPublicSourceUnitAdapterDescriptors(), errors);
  validateDescriptorAdaptations(listPostGoldenSourceUnitAdapterDescriptors(), errors);

  const publicG5AU08 = adaptGlobalPublicSourceUnitPlan({
    sourceId: "g5a_u08_5a08",
    selectionMode: "sourceUnit",
  });
  if (publicG5AU08.applied || publicG5AU08.blocked || publicG5AU08.adapter !== null) {
    errors.push("GS04_G5AU08_PUBLIC_DEFAULT_BEHAVIOR_CHANGED");
  }

  const g5aU08 = adaptGlobalPublicSourceUnitPlan({
    sourceId: "g5a_u08_5a08",
    selectionMode: "sourceUnit",
    goldenContractId: "G5AU08_GOLDEN_V1",
    goldenContractVersion: "1.0.0",
    goldenRuntimeMode: "shadow",
  });
  if (!g5aU08.plan?.goldenRuntimeConsumer
    || g5aU08.plan.goldenRuntimeConsumer.connectionStatus !== "FROZEN_AND_CONNECTED_TO_EXISTING_SHARED_RUNTIME") {
    errors.push("GS04_G5AU08_GOLDEN_RUNTIME_NOT_CONNECTED");
  }

  const unauthorizedG3AU01 = adaptGlobalPublicSourceUnitPlan({
    sourceId: "g3a_u01_3a01",
    selectionMode: "sourceUnit",
    goldenContractId: "G5AU08_GOLDEN_V1",
    goldenContractVersion: "1.0.0",
    goldenRuntimeMode: "shadow",
  });
  if (!unauthorizedG3AU01.blocked
    || !unauthorizedG3AU01.errors.includes("GS05_GOLDEN_UNIT_NOT_REGISTERED")) {
    errors.push("GS05_UNREGISTERED_GOLDEN_UNIT_NOT_BLOCKED");
  }

  const result = { ok: errors.length === 0, errors: Object.freeze(errors) };
  Object.defineProperty(result, "affectedUnitCount", {
    value: registry.affectedUnitCount,
    enumerable: false,
    writable: false,
    configurable: false,
  });
  Object.defineProperty(result, "postGoldenAffectedUnitCount", {
    value: postGoldenRegistry.affectedUnitCount,
    enumerable: false,
    writable: false,
    configurable: false,
  });
  return Object.freeze(result);
}
