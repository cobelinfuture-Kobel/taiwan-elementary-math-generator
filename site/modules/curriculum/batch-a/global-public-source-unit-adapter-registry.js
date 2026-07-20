import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../registry/batch-a-selector-extension.js";
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
import { consumeGoldenRuntimeContract } from "../golden/shared-golden-runtime-consumer.js";

export const GLOBAL_PUBLIC_SOURCE_UNIT_ADAPTER_REGISTRY_VERSION = "gs04-global-source-unit-adapter-registry-v1";
export const POST_GOLDEN_SOURCE_UNIT_ADAPTER_REGISTRY_VERSION = "postg-source-unit-adapter-registry-v1";

export const G3A_U01_POSTG_SOURCE_ID = "g3a_u01_3a01";
export const G3A_U01_POSTG_TASK_ID = "POSTG-MIG-A01_G3A_U01_GoldenConformanceAndKnowledgeOperationMigration";
export const G3A_U02_POSTG_SOURCE_ID = "g3a_u02_3a02";
export const G3A_U02_POSTG_TASK_ID = "POSTG-MIG-A02_G3A_U02_GoldenConformanceAndKnowledgeOperationMigration";
export const G3A_U03_POSTG_SOURCE_ID = "g3a_u03_3a03";
export const G3A_U03_POSTG_TASK_ID = "POSTG-MIG-A03_G3A_U03_GoldenConformanceAndKnowledgeOperationMigration";
export const G3A_U06_POSTG_SOURCE_ID = "g3a_u06_3a06";
export const G3A_U06_POSTG_TASK_ID = "POSTG-MIG-A04_G3A_U06_GoldenConformanceAndKnowledgeOperationMigration";
export const G3B_U01_POSTG_SOURCE_ID = "g3b_u01_3b01";
export const G3B_U01_POSTG_TASK_ID = "POSTG-MIG-A05_G3B_U01_GoldenConformanceAndKnowledgeOperationMigration";

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

function patternSpecIdsForKnowledgePoints(knowledgePointIds) {
  return unique(knowledgePointIds.flatMap((knowledgePointId) => (
    getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)
      .flatMap((group) => group.patternSpecIds ?? [])
  )));
}

export const G5AU08_GOLDEN_V1_RUNTIME_DESCRIPTOR = freeze({
  descriptorMode: "golden_sample_frozen",
  goldenContractId: "G5AU08_GOLDEN_V1",
  goldenContractVersion: "1.0.0",
  contractStatus: "FROZEN_FOR_GS04_CONSUMPTION",
  sourceId: G5A_U08_SOURCE_ID,
  authorityFileCount: 20,
  frozenCounts: {
    knowledgePointCount: 11,
    patternGroupCount: 17,
    patternSpecCount: 30,
  },
  perUnitRuntimeLimits: { generator: 0, validator: 0, renderer: 0, workflow: 0 },
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

function postGoldenRuntimeDescriptor({ sourceId, knowledgeRegistryPath, counts, authorityFileCount, generator }) {
  return freeze({
    descriptorMode: "post_golden_unit_conformance",
    baseGoldenContractId: "G5AU08_GOLDEN_V1",
    baseGoldenContractVersion: "1.0.0",
    goldenContractId: "G5AU08_GOLDEN_V1",
    goldenContractVersion: "1.0.0",
    contractStatus: "POST_GOLDEN_CONFORMANCE_CANDIDATE",
    sourceId,
    authorityFileCount,
    frozenCounts: {
      knowledgePointCount: counts.knowledgePoints,
      patternGroupCount: counts.patternGroups,
      patternSpecCount: counts.patternSpecs,
    },
    expectedCounts: {
      knowledgePointCount: counts.knowledgePoints,
      patternGroupCount: counts.patternGroups,
      patternSpecCount: counts.patternSpecs,
    },
    knowledgeRegistryPath,
    perUnitRuntimeLimits: { generator: 0, validator: 0, renderer: 0, workflow: 0 },
    globalContextProductionSelectableAtFreeze: false,
    globalContextRuntimeResolvableAtFreeze: false,
    runtimeModules: {
      generator,
      validator: "site/modules/curriculum/batch-a/batch-a-browser-validator.js",
      renderer: "site/modules/renderer/html-renderer-s60j-extension.js",
    },
  });
}

export const G3AU01_POSTG_GOLDEN_RUNTIME_DESCRIPTOR = postGoldenRuntimeDescriptor({
  sourceId: G3A_U01_POSTG_SOURCE_ID,
  knowledgeRegistryPath: "data/curriculum/knowledge/units/g3a_u01_3a01.knowledge-operation.json",
  counts: { knowledgePoints: 8, patternGroups: 8, patternSpecs: 20 },
  authorityFileCount: 8,
  generator: [
    "site/modules/curriculum/batch-a/g3a-u01-number-structure-generator.js",
    "site/modules/curriculum/batch-a/g3a-u06-division-ordering-generator.js",
  ],
});

export const G3AU02_POSTG_GOLDEN_RUNTIME_DESCRIPTOR = postGoldenRuntimeDescriptor({
  sourceId: G3A_U02_POSTG_SOURCE_ID,
  knowledgeRegistryPath: "data/curriculum/knowledge/units/g3a_u02_3a02.knowledge-operation.json",
  counts: { knowledgePoints: 10, patternGroups: 10, patternSpecs: 10 },
  authorityFileCount: 6,
  generator: "site/modules/curriculum/batch-a/batch-a-browser-generator-core.js",
});

export const G3AU03_POSTG_GOLDEN_RUNTIME_DESCRIPTOR = postGoldenRuntimeDescriptor({
  sourceId: G3A_U03_POSTG_SOURCE_ID,
  knowledgeRegistryPath: "data/curriculum/knowledge/units/g3a_u03_3a03.knowledge-operation.json",
  counts: { knowledgePoints: 7, patternGroups: 7, patternSpecs: 7 },
  authorityFileCount: 5,
  generator: "site/modules/curriculum/batch-a/batch-a-browser-generator-core.js",
});

export const G3AU06_POSTG_GOLDEN_RUNTIME_DESCRIPTOR = postGoldenRuntimeDescriptor({
  sourceId: G3A_U06_POSTG_SOURCE_ID,
  knowledgeRegistryPath: "data/curriculum/knowledge/units/g3a_u06_3a06.knowledge-operation.json",
  counts: { knowledgePoints: 6, patternGroups: 6, patternSpecs: 6 },
  authorityFileCount: 5,
  generator: "site/modules/curriculum/batch-a/batch-a-browser-generator-core.js",
});

export const G3BU01_POSTG_GOLDEN_RUNTIME_DESCRIPTOR = postGoldenRuntimeDescriptor({
  sourceId: G3B_U01_POSTG_SOURCE_ID,
  knowledgeRegistryPath: "data/curriculum/knowledge/units/g3b_u01_3b01.knowledge-operation.json",
  counts: { knowledgePoints: 10, patternGroups: 10, patternSpecs: 23 },
  authorityFileCount: 6,
  generator: "site/modules/curriculum/batch-a/batch-a-browser-generator-core.js",
});

const BASE_ADAPTER_DESCRIPTORS = freeze([
  {
    sourceId: G4B_U04_SOURCE_ID,
    adapterId: "g4b_u04_all_promoted_canonical",
    conformanceMode: "legacy_shared_adapter",
    requiresExplicitGoldenActivation: false,
    planOverrides: { questionMode: "mixed", layoutMode: "custom_with_caps" },
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
    planOverrides: { questionMode: "mixed", depthMode: "mixed", contextMode: "mixed" },
    expectedCounts: { knowledgePoints: 11, patternGroups: 17 },
    resolveKnowledgePointIds: () => [...G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS],
    resolvePatternGroupIds: () => [...G5A_U08_PROMOTED_PATTERN_GROUP_IDS],
    goldenContractDescriptor: G5AU08_GOLDEN_V1_RUNTIME_DESCRIPTOR,
  },
]);

function postGoldenAdapterDescriptor({ sourceId, taskId, adapterId, descriptor }) {
  return {
    sourceId,
    taskId,
    adapterId,
    conformanceMode: "post_golden_candidate_shadow",
    requiresExplicitGoldenActivation: true,
    planOverrides: { questionMode: "mixed" },
    expectedCounts: {
      knowledgePoints: descriptor.expectedCounts.knowledgePointCount,
      patternGroups: descriptor.expectedCounts.patternGroupCount,
      patternSpecs: descriptor.expectedCounts.patternSpecCount,
    },
    resolveKnowledgePointIds: () => sourceKnowledgePointIds(sourceId),
    resolvePatternGroupIds: (knowledgePointIds) => patternGroupIdsForKnowledgePoints(knowledgePointIds),
    resolvePatternSpecIds: (knowledgePointIds) => patternSpecIdsForKnowledgePoints(knowledgePointIds),
    goldenContractDescriptor: descriptor,
  };
}

const POST_GOLDEN_ADAPTER_DESCRIPTORS = freeze([
  postGoldenAdapterDescriptor({
    sourceId: G3A_U01_POSTG_SOURCE_ID,
    taskId: G3A_U01_POSTG_TASK_ID,
    adapterId: "g3a_u01_postg_golden_shared_runtime",
    descriptor: G3AU01_POSTG_GOLDEN_RUNTIME_DESCRIPTOR,
  }),
  postGoldenAdapterDescriptor({
    sourceId: G3A_U02_POSTG_SOURCE_ID,
    taskId: G3A_U02_POSTG_TASK_ID,
    adapterId: "g3a_u02_postg_golden_shared_runtime",
    descriptor: G3AU02_POSTG_GOLDEN_RUNTIME_DESCRIPTOR,
  }),
  postGoldenAdapterDescriptor({
    sourceId: G3A_U03_POSTG_SOURCE_ID,
    taskId: G3A_U03_POSTG_TASK_ID,
    adapterId: "g3a_u03_postg_golden_shared_runtime",
    descriptor: G3AU03_POSTG_GOLDEN_RUNTIME_DESCRIPTOR,
  }),
  postGoldenAdapterDescriptor({
    sourceId: G3A_U06_POSTG_SOURCE_ID,
    taskId: G3A_U06_POSTG_TASK_ID,
    adapterId: "g3a_u06_postg_golden_shared_runtime",
    descriptor: G3AU06_POSTG_GOLDEN_RUNTIME_DESCRIPTOR,
  }),
  postGoldenAdapterDescriptor({
    sourceId: G3B_U01_POSTG_SOURCE_ID,
    taskId: G3B_U01_POSTG_TASK_ID,
    adapterId: "g3b_u01_postg_golden_shared_runtime",
    descriptor: G3BU01_POSTG_GOLDEN_RUNTIME_DESCRIPTOR,
  }),
]);

function resolveDescriptor(descriptor) {
  if (!descriptor) return null;
  const knowledgePointIds = unique(descriptor.resolveKnowledgePointIds());
  const patternGroupIds = unique(descriptor.resolvePatternGroupIds(knowledgePointIds));
  const patternSpecIds = descriptor.resolvePatternSpecIds
    ? unique(descriptor.resolvePatternSpecIds(knowledgePointIds))
    : patternSpecIdsForKnowledgePoints(knowledgePointIds);
  return freeze({ ...descriptor, knowledgePointIds, patternGroupIds, patternSpecIds });
}

function validateDescriptorCollection(descriptors, { minimumCount, tooSmallCode }) {
  const errors = [];
  if (descriptors.length < minimumCount) errors.push(tooSmallCode);
  if (new Set(descriptors.map((row) => row.sourceId)).size !== descriptors.length) {
    errors.push("GS04_SHARED_ADAPTER_DUPLICATE_SOURCE_ID");
  }
  for (const descriptor of descriptors) {
    const resolved = resolveDescriptor(descriptor);
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
    if (Number.isInteger(descriptor.expectedCounts.patternSpecs)
      && resolved.patternSpecIds.length !== descriptor.expectedCounts.patternSpecs) {
      errors.push(`POSTG_SHARED_ADAPTER_PATTERN_SPEC_COUNT_INVALID:${descriptor.sourceId}`);
    }
    if (descriptor.goldenContractDescriptor) {
      if (descriptor.requiresExplicitGoldenActivation !== true
        && descriptor.goldenContractDescriptor.contractStatus !== "POST_GOLDEN_CONFORMANT_UNIT") {
        errors.push(`GS04_GOLDEN_SHADOW_ACTIVATION_NOT_REQUIRED:${descriptor.sourceId}`);
      }
      const consumed = consumeGoldenRuntimeContract(descriptor.goldenContractDescriptor, descriptor.sourceId);
      if (!consumed.ok) errors.push(`GS04_GOLDEN_CONSUMER_INVALID:${descriptor.sourceId}`);
    }
  }
  return errors;
}

export function listGlobalPublicSourceUnitAdapterDescriptors() {
  return [...BASE_ADAPTER_DESCRIPTORS];
}

export function getGlobalPublicSourceUnitAdapterDescriptor(sourceId) {
  return BASE_ADAPTER_DESCRIPTORS.find((row) => row.sourceId === sourceId) ?? null;
}

export function resolveGlobalPublicSourceUnitAdapterDescriptor(sourceId) {
  return resolveDescriptor(getGlobalPublicSourceUnitAdapterDescriptor(sourceId));
}

export function listPostGoldenSourceUnitAdapterDescriptors() {
  return [...POST_GOLDEN_ADAPTER_DESCRIPTORS];
}

export function getPostGoldenSourceUnitAdapterDescriptor(sourceId) {
  return POST_GOLDEN_ADAPTER_DESCRIPTORS.find((row) => row.sourceId === sourceId) ?? null;
}

export function resolvePostGoldenSourceUnitAdapterDescriptor(sourceId) {
  return resolveDescriptor(getPostGoldenSourceUnitAdapterDescriptor(sourceId));
}

export function validateGlobalPublicSourceUnitAdapterRegistry() {
  const errors = validateDescriptorCollection(BASE_ADAPTER_DESCRIPTORS, {
    minimumCount: 3,
    tooSmallCode: "GS04_SHARED_ADAPTER_AFFECTED_UNIT_COUNT_TOO_SMALL",
  });
  return freeze({
    ok: errors.length === 0,
    errors,
    affectedUnitCount: BASE_ADAPTER_DESCRIPTORS.length,
    registryVersion: GLOBAL_PUBLIC_SOURCE_UNIT_ADAPTER_REGISTRY_VERSION,
  });
}

export function validatePostGoldenSourceUnitAdapterRegistry() {
  const errors = validateDescriptorCollection(POST_GOLDEN_ADAPTER_DESCRIPTORS, {
    minimumCount: 1,
    tooSmallCode: "POSTG_SHARED_ADAPTER_AFFECTED_UNIT_COUNT_TOO_SMALL",
  });
  return freeze({
    ok: errors.length === 0,
    errors,
    affectedUnitCount: POST_GOLDEN_ADAPTER_DESCRIPTORS.length,
    registryVersion: POST_GOLDEN_SOURCE_UNIT_ADAPTER_REGISTRY_VERSION,
  });
}
