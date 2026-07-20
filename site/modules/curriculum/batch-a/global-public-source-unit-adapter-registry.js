import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../registry/batch-a-selector-extension.js";
import {
  G3A_U01_GOLDEN_SELECTOR_PROJECTION,
  G3A_U01_GOLDEN_SOURCE_ID,
} from "../registry/g3a-u01-golden-selector-projection.js";
import {
  G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U04_PROMOTED_PATTERN_GROUP_IDS,
  G4B_U04_SOURCE_ID,
} from "../registry/g4b-u04-promotion.js";
import {
  G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  G5A_U08_PROMOTED_PATTERN_GROUP_IDS,
  G5A_U08_SOURCE_ID,
} from "../registry/g5a-u08-promotion.js";
import { G5A_U02_PUBLIC_SOURCE_ID } from "../batch-b/g5a-u02-browser-resolver.js";
import {
  GOLDEN_RUNTIME_CONTRACT_PROFILES,
  consumeGoldenRuntimeContract,
} from "../golden/shared-golden-runtime-consumer.js";

export const GLOBAL_PUBLIC_SOURCE_UNIT_ADAPTER_REGISTRY_VERSION = "postg-a01-global-source-unit-adapter-registry-v2";

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function sourceKnowledgePointIds(sourceId) {
  return listVisibleBatchAKnowledgePoints()
    .filter((row) => row.sourceId === sourceId)
    .map((row) => row.knowledgePointId);
}

function patternGroupIdsForKnowledgePoints(knowledgePointIds) {
  return unique(knowledgePointIds.flatMap((knowledgePointId) => (
    getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)
      .map((group) => group.patternGroupId)
  )));
}

export const G5AU08_GOLDEN_V1_RUNTIME_DESCRIPTOR = freeze({
  goldenContractId: "G5AU08_GOLDEN_V1",
  goldenContractVersion: "1.0.0",
  contractStatus: "FROZEN_FOR_GS04_CONSUMPTION",
  contractProfile: GOLDEN_RUNTIME_CONTRACT_PROFILES.GOLDEN_SAMPLE_FREEZE,
  sourceId: G5A_U08_SOURCE_ID,
  authorityFileCount: 20,
  frozenCounts: {
    knowledgePointCount: 11,
    patternGroupCount: 17,
    patternSpecCount: 30,
  },
  perUnitRuntimeLimits: {
    generator: 0,
    validator: 0,
    renderer: 0,
    workflow: 0,
  },
  globalContextProductionSelectableAtFreeze: false,
  globalContextRuntimeResolvableAtFreeze: false,
  runtimeModules: {
    generator: [
      "site/modules/curriculum/batch-a/g5a-u08-numeric-generator.js",
      "site/modules/curriculum/batch-a/g5a-u08-application-generator.js",
    ],
    validator: [
      "site/modules/curriculum/batch-a/g5a-u08-numeric-validator.js",
      "site/modules/curriculum/batch-a/g5a-u08-application-validator.js",
    ],
    renderer: "site/modules/renderer/html-renderer-s60j-extension.js",
  },
});

export const G3AU01_GOLDEN_V1_RUNTIME_DESCRIPTOR = freeze({
  goldenContractId: "G5AU08_GOLDEN_V1",
  goldenContractVersion: "1.0.0",
  contractStatus: "FROZEN_FOR_GS04_CONSUMPTION",
  contractProfile: GOLDEN_RUNTIME_CONTRACT_PROFILES.POST_GOLDEN_UNIT_CONFORMANCE,
  sourceId: G3A_U01_GOLDEN_SOURCE_ID,
  authorityFileCount: 8,
  frozenCounts: {
    knowledgePointCount: G3A_U01_GOLDEN_SELECTOR_PROJECTION.knowledgePointCount,
    patternGroupCount: G3A_U01_GOLDEN_SELECTOR_PROJECTION.patternGroupCount,
    patternSpecCount: G3A_U01_GOLDEN_SELECTOR_PROJECTION.patternSpecCount,
  },
  knowledgeAuthorityPath: "data/curriculum/knowledge/units/g3a_u01_3a01.knowledge-operation.json",
  selectorProjectionPath: "site/modules/curriculum/registry/g3a-u01-golden-selector-projection.js",
  perUnitRuntimeLimits: {
    generator: 0,
    validator: 0,
    renderer: 0,
    workflow: 0,
  },
  globalContextProductionSelectableAtFreeze: false,
  globalContextRuntimeResolvableAtFreeze: false,
  runtimeModules: {
    generator: [
      "site/modules/curriculum/batch-a/batch-a-browser-question-router.js",
      "site/modules/curriculum/batch-a/g3a-u01-golden-number-sense-runtime.js",
    ],
    validator: [
      "site/modules/curriculum/batch-a/g3a-u01-golden-number-sense-runtime.js",
      "site/modules/curriculum/batch-a/batch-a-browser-validator.js",
    ],
    renderer: "site/modules/renderer/html-renderer-s60j-extension.js",
  },
});

const ADAPTER_DESCRIPTORS = freeze([
  {
    sourceId: G3A_U01_GOLDEN_SOURCE_ID,
    adapterId: "g3a_u01_postg_a01_golden_shared_runtime",
    conformanceMode: "golden_contract_v1_conformant",
    requiresExplicitGoldenActivation: false,
    planOverrides: {},
    expectedCounts: {
      knowledgePoints: G3A_U01_GOLDEN_SELECTOR_PROJECTION.knowledgePointCount,
      patternGroups: G3A_U01_GOLDEN_SELECTOR_PROJECTION.patternGroupCount,
    },
    resolveKnowledgePointIds: () => sourceKnowledgePointIds(G3A_U01_GOLDEN_SOURCE_ID),
    resolvePatternGroupIds: (knowledgePointIds) => patternGroupIdsForKnowledgePoints(knowledgePointIds),
    goldenContractDescriptor: G3AU01_GOLDEN_V1_RUNTIME_DESCRIPTOR,
  },
  {
    sourceId: G4B_U04_SOURCE_ID,
    adapterId: "g4b_u04_all_promoted_canonical",
    conformanceMode: "legacy_shared_adapter",
    requiresExplicitGoldenActivation: false,
    planOverrides: {
      questionMode: "mixed",
      layoutMode: "custom_with_caps",
    },
    expectedCounts: { knowledgePoints: 13, patternGroups: 13 },
    resolveKnowledgePointIds: () => [...G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS],
    resolvePatternGroupIds: () => [...G4B_U04_PROMOTED_PATTERN_GROUP_IDS],
    goldenContractDescriptor: null,
  },
  {
    sourceId: G5A_U02_PUBLIC_SOURCE_ID,
    adapterId: "g5a_u02_all_promoted_dynamic",
    conformanceMode: "legacy_shared_adapter",
    requiresExplicitGoldenActivation: false,
    planOverrides: {},
    expectedCounts: { knowledgePoints: 18, patternGroups: 18 },
    resolveKnowledgePointIds: () => sourceKnowledgePointIds(G5A_U02_PUBLIC_SOURCE_ID),
    resolvePatternGroupIds: (knowledgePointIds) => patternGroupIdsForKnowledgePoints(knowledgePointIds),
    goldenContractDescriptor: null,
  },
  {
    sourceId: G5A_U08_SOURCE_ID,
    adapterId: "g5a_u08_golden_v1_shared_runtime",
    conformanceMode: "golden_contract_v1_shadow",
    requiresExplicitGoldenActivation: true,
    planOverrides: {
      questionMode: "mixed",
      depthMode: "mixed",
      contextMode: "mixed",
    },
    expectedCounts: { knowledgePoints: 11, patternGroups: 17 },
    resolveKnowledgePointIds: () => [...G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS],
    resolvePatternGroupIds: () => [...G5A_U08_PROMOTED_PATTERN_GROUP_IDS],
    goldenContractDescriptor: G5AU08_GOLDEN_V1_RUNTIME_DESCRIPTOR,
  },
]);

export function listGlobalPublicSourceUnitAdapterDescriptors() {
  return [...ADAPTER_DESCRIPTORS];
}

export function getGlobalPublicSourceUnitAdapterDescriptor(sourceId) {
  return ADAPTER_DESCRIPTORS.find((row) => row.sourceId === sourceId) ?? null;
}

export function resolveGlobalPublicSourceUnitAdapterDescriptor(sourceId) {
  const descriptor = getGlobalPublicSourceUnitAdapterDescriptor(sourceId);
  if (!descriptor) return null;
  const knowledgePointIds = unique(descriptor.resolveKnowledgePointIds());
  const patternGroupIds = unique(descriptor.resolvePatternGroupIds(knowledgePointIds));
  return freeze({
    ...descriptor,
    knowledgePointIds,
    patternGroupIds,
  });
}

export function validateGlobalPublicSourceUnitAdapterRegistry() {
  const errors = [];
  if (ADAPTER_DESCRIPTORS.length < 3) errors.push("GS04_SHARED_ADAPTER_AFFECTED_UNIT_COUNT_TOO_SMALL");
  if (new Set(ADAPTER_DESCRIPTORS.map((row) => row.sourceId)).size !== ADAPTER_DESCRIPTORS.length) {
    errors.push("GS04_SHARED_ADAPTER_DUPLICATE_SOURCE_ID");
  }
  for (const descriptor of ADAPTER_DESCRIPTORS) {
    const resolved = resolveGlobalPublicSourceUnitAdapterDescriptor(descriptor.sourceId);
    if (!resolved) {
      errors.push(`GS04_SHARED_ADAPTER_DESCRIPTOR_MISSING:${descriptor.sourceId}`);
      continue;
    }
    if (resolved.knowledgePointIds.length !== descriptor.expectedCounts.knowledgePoints) {
      errors.push(`GS04_SHARED_ADAPTER_KP_COUNT_INVALID:${descriptor.sourceId}`);
    }
    if (resolved.patternGroupIds.length !== descriptor.expectedCounts.patternGroups) {
      errors.push(`GS04_SHARED_ADAPTER_GROUP_COUNT_INVALID:${descriptor.sourceId}`);
    }
    if (descriptor.goldenContractDescriptor) {
      if (descriptor.sourceId === G5A_U08_SOURCE_ID && descriptor.requiresExplicitGoldenActivation !== true) {
        errors.push(`GS04_GOLDEN_SHADOW_ACTIVATION_NOT_REQUIRED:${descriptor.sourceId}`);
      }
      const consumed = consumeGoldenRuntimeContract(descriptor.goldenContractDescriptor, descriptor.sourceId);
      if (!consumed.ok) errors.push(`GS04_GOLDEN_CONSUMER_INVALID:${descriptor.sourceId}`);
    }
  }
  return freeze({
    ok: errors.length === 0,
    errors,
    affectedUnitCount: ADAPTER_DESCRIPTORS.length,
    registryVersion: GLOBAL_PUBLIC_SOURCE_UNIT_ADAPTER_REGISTRY_VERSION,
  });
}
