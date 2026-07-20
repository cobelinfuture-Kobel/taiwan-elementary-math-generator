import { consumeGoldenRuntimeContract } from "../golden/shared-golden-runtime-consumer.js";
import {
  GLOBAL_PUBLIC_SOURCE_UNIT_ADAPTER_REGISTRY_VERSION,
  resolveGlobalPublicSourceUnitAdapterDescriptor,
  validateGlobalPublicSourceUnitAdapterRegistry,
} from "./global-public-source-unit-adapter-registry.js";

// Preserve the public adapter version used by existing G4B-U04 and G5A-U02
// readbacks. GS04 adds a registry/consumer layer without rewriting their
// established adapter identity.
export const GLOBAL_PUBLIC_SOURCE_UNIT_ADAPTER_VERSION = "glm-s05-source-unit-adapter-v1";

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, clone(nested)]));
  }
  return value;
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

function canonicalSourceUnitPlan(plan, descriptor, goldenRuntimeConsumer) {
  const knowledgePointIds = descriptor.knowledgePointIds;
  const patternGroupIds = descriptor.patternGroupIds;
  const goldenMetadata = goldenRuntimeConsumer ? {
    goldenContractId: goldenRuntimeConsumer.goldenContractId,
    goldenContractVersion: goldenRuntimeConsumer.goldenContractVersion,
    goldenConnectionStatus: goldenRuntimeConsumer.connectionStatus,
  } : {};
  return {
    ...plan,
    ...clone(descriptor.planOverrides ?? {}),
    publicSelectionMode: "sourceUnit",
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [...knowledgePointIds],
    knowledgePointIds: [...knowledgePointIds],
    selectedPatternGroupIds: [...patternGroupIds],
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
      ...goldenMetadata,
    },
  };
}

export function adaptGlobalPublicSourceUnitPlan(plan = {}) {
  if (plan.selectionMode !== "sourceUnit") {
    return {
      plan: { ...plan },
      applied: false,
      blocked: false,
      errors: [],
      adapter: null,
    };
  }

  const descriptor = resolveGlobalPublicSourceUnitAdapterDescriptor(plan.sourceId);
  if (!descriptor) {
    return {
      plan: { ...plan },
      applied: false,
      blocked: false,
      errors: [],
      adapter: null,
    };
  }

  const registryValidation = validateGlobalPublicSourceUnitAdapterRegistry();
  if (!registryValidation.ok) {
    return blockedAdaptation(plan, descriptor, registryValidation.errors);
  }
  if (descriptor.knowledgePointIds.length !== descriptor.expectedCounts.knowledgePoints
    || descriptor.patternGroupIds.length !== descriptor.expectedCounts.patternGroups) {
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

export function validateGlobalPublicSourceUnitAdapters() {
  const registry = validateGlobalPublicSourceUnitAdapterRegistry();
  const errors = [...registry.errors];
  for (const descriptor of [
    resolveGlobalPublicSourceUnitAdapterDescriptor("g4b_u04_4b04"),
    resolveGlobalPublicSourceUnitAdapterDescriptor("g5a_u02_5a02"),
    resolveGlobalPublicSourceUnitAdapterDescriptor("g5a_u08_5a08"),
  ]) {
    if (!descriptor) {
      errors.push("GS04_SOURCE_UNIT_DESCRIPTOR_MISSING");
      continue;
    }
    const result = adaptGlobalPublicSourceUnitPlan({
      sourceId: descriptor.sourceId,
      selectionMode: "sourceUnit",
    });
    if (!result.applied || result.blocked
      || result.plan.selectedKnowledgePointIds.length !== descriptor.expectedCounts.knowledgePoints
      || result.plan.selectedPatternGroupIds.length !== descriptor.expectedCounts.patternGroups) {
      errors.push(`GS04_SOURCE_UNIT_ADAPTER_INVALID:${descriptor.sourceId}`);
    }
  }
  const g5aU08 = adaptGlobalPublicSourceUnitPlan({
    sourceId: "g5a_u08_5a08",
    selectionMode: "sourceUnit",
  });
  if (!g5aU08.plan?.goldenRuntimeConsumer
    || g5aU08.plan.goldenRuntimeConsumer.connectionStatus !== "FROZEN_AND_CONNECTED_TO_EXISTING_SHARED_RUNTIME") {
    errors.push("GS04_G5AU08_GOLDEN_RUNTIME_NOT_CONNECTED");
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    affectedUnitCount: registry.affectedUnitCount,
  });
}
