import {
  createGoldenRuntimeDescriptor,
  adaptGoldenSourceUnitPlan,
  applyGoldenRuntimeContract,
  validateGoldenRuntimeDescriptor,
} from "../golden/golden-runtime-contract.js";
import {
  G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  G5A_U08_PROMOTED_PATTERN_GROUP_IDS,
  G5A_U08_PROMOTED_PATTERN_SPEC_IDS,
  G5A_U08_SOURCE_ID,
} from "./g5a-u08-promotion.js";
import {
  G5A_U08_PRODUCTION_LIFECYCLE,
} from "./g5a-u08-production-promotion.js";

export const GOLDEN_RUNTIME_REGISTRY_VERSION = "gs04-golden-runtime-registry-v1";

export const G5A_U08_GOLDEN_RUNTIME_DESCRIPTOR = createGoldenRuntimeDescriptor({
  goldenContractId: "G5AU08_GOLDEN_V1",
  goldenContractVersion: "1.0.0",
  goldenContractStatus: "FROZEN_FOR_GS04_CONSUMPTION",
  sourceId: G5A_U08_SOURCE_ID,
  knowledgePointIds: G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  patternGroupIds: G5A_U08_PROMOTED_PATTERN_GROUP_IDS,
  patternSpecIds: G5A_U08_PROMOTED_PATTERN_SPEC_IDS,
  requiredQuestionFields: [
    "sourceId",
    "patternSpecId",
    "patternGroupId",
    "knowledgePointId",
    "answerModelShape",
    "finalAnswer",
    "fallbackUsed",
    "genericFallbackAllowed",
  ],
  supportedSelectionModes: ["singleKnowledgePoint", "mixedKnowledgePointsSameUnit"],
  sourceUnitInternalSelectionMode: "mixedKnowledgePointsSameUnit",
  productionUse: G5A_U08_PRODUCTION_LIFECYCLE.productionUse,
  productionSelectorStatus: G5A_U08_PRODUCTION_LIFECYCLE.selectorStatus,
  globalContextLifecycle: "candidate_gs02",
  globalContextProductionSelectable: false,
  globalContextRuntimeResolvable: false,
  genericFallbackAllowed: false,
  freeFormAICompositionAllowed: false,
  runtimeModules: {
    router: "site/modules/curriculum/batch-a/g5a-u08-canonical-router.js",
    numericGenerator: "site/modules/curriculum/batch-a/g5a-u08-numeric-generator.js",
    applicationGenerator: "site/modules/curriculum/batch-a/g5a-u08-application-generator.js",
    numericValidator: "site/modules/curriculum/batch-a/g5a-u08-numeric-validator.js",
    applicationValidator: "site/modules/curriculum/batch-a/g5a-u08-application-validator.js",
    worksheetAssembly: "site/modules/curriculum/batch-a/batch-a-browser-worksheet-s60j-extension.js",
    renderer: "site/modules/renderer/html-renderer-s60j-extension.js",
  },
  expectedCounts: {
    knowledgePointCount: 11,
    patternGroupCount: 17,
    patternSpecCount: 30,
  },
});

const GOLDEN_RUNTIME_DESCRIPTORS = Object.freeze([
  G5A_U08_GOLDEN_RUNTIME_DESCRIPTOR,
]);
const descriptorBySourceId = new Map(GOLDEN_RUNTIME_DESCRIPTORS.map((descriptor) => [descriptor.sourceId, descriptor]));

export function listGoldenRuntimeDescriptors() {
  return [...GOLDEN_RUNTIME_DESCRIPTORS];
}

export function getGoldenRuntimeDescriptor(sourceId) {
  return descriptorBySourceId.get(sourceId) ?? null;
}

export function adaptRegisteredGoldenSourceUnitPlan(plan = {}) {
  const descriptor = getGoldenRuntimeDescriptor(plan.sourceId);
  if (!descriptor) return Object.freeze({ plan: { ...plan }, applied: false, adapter: null });
  return adaptGoldenSourceUnitPlan(plan, descriptor);
}

export function applyRegisteredGoldenRuntimeContract(result, plan = {}) {
  return applyGoldenRuntimeContract(result, plan, getGoldenRuntimeDescriptor(plan.sourceId));
}

export function validateGoldenRuntimeRegistry() {
  const errors = [];
  if (new Set(GOLDEN_RUNTIME_DESCRIPTORS.map((row) => row.sourceId)).size !== GOLDEN_RUNTIME_DESCRIPTORS.length) {
    errors.push("golden_runtime_duplicate_source_id");
  }
  if (new Set(GOLDEN_RUNTIME_DESCRIPTORS.map((row) => row.goldenContractId)).size !== GOLDEN_RUNTIME_DESCRIPTORS.length) {
    errors.push("golden_runtime_duplicate_contract_id");
  }
  for (const descriptor of GOLDEN_RUNTIME_DESCRIPTORS) {
    const validation = validateGoldenRuntimeDescriptor(descriptor);
    errors.push(...validation.errors.map((entry) => `${descriptor.sourceId}:${entry.code}`));
  }
  if (GOLDEN_RUNTIME_DESCRIPTORS.length !== 1 || GOLDEN_RUNTIME_DESCRIPTORS[0].sourceId !== G5A_U08_SOURCE_ID) {
    errors.push("gs04_registry_scope_invalid");
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    registryVersion: GOLDEN_RUNTIME_REGISTRY_VERSION,
    descriptorCount: GOLDEN_RUNTIME_DESCRIPTORS.length,
  });
}
