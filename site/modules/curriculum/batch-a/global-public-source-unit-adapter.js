import { consumeGoldenRuntimeContract } from "../golden/shared-golden-runtime-consumer.js";
import {
  GLOBAL_PUBLIC_SOURCE_UNIT_ADAPTER_REGISTRY_VERSION,
  listGlobalPublicSourceUnitAdapterDescriptors,
  resolveGlobalPublicSourceUnitAdapterDescriptor,
  validateGlobalPublicSourceUnitAdapterRegistry,
} from "./global-public-source-unit-adapter-registry.js";

// Preserve the public adapter version used by existing G4B-U04 and G5A-U02
// readbacks. Post-Golden migration extends the shared registry/consumer without
// creating a unit-specific public adapter.
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

function blockedAdaptation(plan, descriptor, errors) {
  return Object.freeze({
    plan: null,
    applied: false,
    blocked: true,
    errors: Object.freeze([...errors]),
    adapter: Object.freeze({
      version: GLOBAL_PUBLIC_SOURCE_UNIT_ADAPTER_VERSION,
      registryVersion: GLOBAL_PUBLIC_SOURCE_UNIT_ADAPTER_REGISTRY_VERSION,
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

function canonicalSourceUnitPlan(plan, descriptor, goldenRuntimeConsumer) {
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
      registryVersion: GLOBAL_PUBLIC_SOURCE_UNIT_ADAPTER_REGISTRY_VERSION,
      adapterId: descriptor.adapterId,
      conformanceMode: descriptor.conformanceMode,
      applied: true,
      blocked: false,
      publicSelectionMode: "sourceUnit",
      internalSelectionMode: "mixedKnowledgePointsSameUnit",
      knowledgePointCount: knowledgePointIds.length,
      patternGroupCount: patternGroupIds.length,
      patternSpecCount: patternSpecIds.length,
      ...goldenMetadata,
    },
  };
}

export function adaptGlobalPublicSourceUnitPlan(plan = {}) {
  if (plan.selectionMode !== "sourceUnit") return passthrough(plan);

  const descriptor = resolveGlobalPublicSourceUnitAdapterDescriptor(plan.sourceId);
  if (!descriptor) {
    return hasGoldenActivationFields(plan)
      ? blockedAdaptation(plan, null, ["GS05_GOLDEN_UNIT_NOT_REGISTERED"])
      : passthrough(plan);
  }
  if (descriptor.requiresExplicitGoldenActivation && !requestsGoldenActivation(plan, descriptor)) {
    return hasPartialOrInvalidGoldenActivation(plan, descriptor)
      ? blockedAdaptation(plan, descriptor, ["GS04_GOLDEN_SHADOW_ACTIVATION_INVALID"])
      : passthrough(plan);
  }

  const registryValidation = validateGlobalPublicSourceUnitAdapterRegistry();
  if (!registryValidation.ok) {
    return blockedAdaptation(plan, descriptor, registryValidation.errors);
  }
  if (descriptor.knowledgePointIds.length !== descriptor.expectedCounts.knowledgePoints
    || descriptor.patternGroupIds.length !== descriptor.expectedCounts.patternGroups
    || (Number.isInteger(descriptor.expectedCounts.patternSpecs)
      && descriptor.patternSpecIds.length !== descriptor.expectedCounts.patternSpecs)) {
    return blockedAdaptation(plan, descriptor, ["GS04_SOURCE_UNIT_DESCRIPTOR_COUNT_DRIFT"]);
  }

  let goldenRuntimeConsumer = null;
  if (descriptor.goldenContractDescriptor) {
    const consumed = consumeGoldenRuntimeContract(descriptor.goldenContractDescriptor, plan.sourceId);
    if (!consumed.ok) {
      return blockedAdaptation(plan, descriptor, consumed.errors.map((entry) => entry.code));
    }
    goldenRuntimeConsumer = consumed.consumer;
  }

  const adapted = canonicalSourceUnitPlan(plan, descriptor, goldenRuntimeConsumer);
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
  if (descriptor.requiresExplicitGoldenActivation) {
    plan.goldenContractId = descriptor.goldenContractDescriptor.goldenContractId;
    plan.goldenContractVersion = descriptor.goldenContractDescriptor.goldenContractVersion;
    plan.goldenRuntimeMode = "shadow";
  }
  return plan;
}

export function validateGlobalPublicSourceUnitAdapters() {
  const registry = validateGlobalPublicSourceUnitAdapterRegistry();
  const errors = [...registry.errors];
  const descriptors = listGlobalPublicSourceUnitAdapterDescriptors()
    .map((descriptor) => resolveGlobalPublicSourceUnitAdapterDescriptor(descriptor.sourceId));

  for (const descriptor of descriptors) {
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

  for (const sourceId of ["g5a_u08_5a08", "g3a_u01_3a01"]) {
    const publicDefault = adaptGlobalPublicSourceUnitPlan({
      sourceId,
      selectionMode: "sourceUnit",
    });
    const descriptor = resolveGlobalPublicSourceUnitAdapterDescriptor(sourceId);
    if (descriptor?.requiresExplicitGoldenActivation
      && (publicDefault.applied || publicDefault.blocked || publicDefault.adapter !== null)) {
      errors.push(`GS04_PUBLIC_DEFAULT_BEHAVIOR_CHANGED:${sourceId}`);
    }
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

  const g3aU01 = adaptGlobalPublicSourceUnitPlan({
    sourceId: "g3a_u01_3a01",
    selectionMode: "sourceUnit",
    goldenContractId: "G5AU08_GOLDEN_V1",
    goldenContractVersion: "1.0.0",
    goldenRuntimeMode: "shadow",
  });
  if (!g3aU01.plan?.goldenRuntimeConsumer
    || g3aU01.plan.goldenRuntimeConsumer.connectionStatus !== "POST_GOLDEN_UNIT_CONNECTED_TO_EXISTING_SHARED_RUNTIME"
    || g3aU01.plan.selectedKnowledgePointIds.length !== 8
    || g3aU01.plan.selectedPatternGroupIds.length !== 8
    || g3aU01.plan.patternSpecIds.length !== 20) {
    errors.push("POSTG_G3AU01_GOLDEN_RUNTIME_NOT_CONNECTED");
  }

  const unregisteredGolden = adaptGlobalPublicSourceUnitPlan({
    sourceId: "g3a_u02_3a02",
    selectionMode: "sourceUnit",
    goldenContractId: "G5AU08_GOLDEN_V1",
    goldenContractVersion: "1.0.0",
    goldenRuntimeMode: "shadow",
  });
  if (!unregisteredGolden.blocked || !unregisteredGolden.errors.includes("GS05_GOLDEN_UNIT_NOT_REGISTERED")) {
    errors.push("GS05_UNREGISTERED_GOLDEN_UNIT_NOT_BLOCKED");
  }
  const result = {
    ok: errors.length === 0,
    errors: Object.freeze(errors),
  };
  Object.defineProperty(result, "affectedUnitCount", {
    value: registry.affectedUnitCount,
    enumerable: false,
    writable: false,
    configurable: false,
  });
  return Object.freeze(result);
}
