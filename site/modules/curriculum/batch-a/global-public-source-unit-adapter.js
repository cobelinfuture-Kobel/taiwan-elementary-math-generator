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
  adaptRegisteredGoldenSourceUnitPlan,
  getGoldenRuntimeDescriptor,
  validateGoldenRuntimeRegistry,
} from "../registry/golden-runtime-units.js";
import { G5A_U02_PUBLIC_SOURCE_ID } from "../batch-b/g5a-u02-browser-resolver.js";

export const GLOBAL_PUBLIC_SOURCE_UNIT_ADAPTER_VERSION = "glm-s05-source-unit-adapter-v2-golden";

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

function canonicalSourceUnitPlan(plan, knowledgePointIds, patternGroupIds, adapterId) {
  return {
    ...plan,
    publicSelectionMode: "sourceUnit",
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [...knowledgePointIds],
    knowledgePointIds: [...knowledgePointIds],
    selectedPatternGroupIds: [...patternGroupIds],
    sourceUnitAdapter: {
      version: GLOBAL_PUBLIC_SOURCE_UNIT_ADAPTER_VERSION,
      adapterId,
      applied: true,
      publicSelectionMode: "sourceUnit",
      internalSelectionMode: "mixedKnowledgePointsSameUnit",
      knowledgePointCount: knowledgePointIds.length,
      patternGroupCount: patternGroupIds.length,
    },
  };
}

export function adaptGlobalPublicSourceUnitPlan(plan = {}) {
  if (plan.selectionMode !== "sourceUnit") {
    return {
      plan: { ...plan },
      applied: false,
      adapter: null,
    };
  }

  const goldenDescriptor = getGoldenRuntimeDescriptor(plan.sourceId);
  if (goldenDescriptor) {
    return adaptRegisteredGoldenSourceUnitPlan(plan);
  }

  if (plan.sourceId === G4B_U04_SOURCE_ID) {
    const adapted = canonicalSourceUnitPlan(
      {
        ...plan,
        questionMode: "mixed",
        layoutMode: "custom_with_caps",
      },
      G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
      G4B_U04_PROMOTED_PATTERN_GROUP_IDS,
      "g4b_u04_all_promoted_canonical",
    );
    return { plan: adapted, applied: true, adapter: adapted.sourceUnitAdapter };
  }

  if (plan.sourceId === G5A_U02_PUBLIC_SOURCE_ID) {
    const knowledgePointIds = sourceKnowledgePointIds(plan.sourceId);
    const patternGroupIds = patternGroupIdsForKnowledgePoints(knowledgePointIds);
    const adapted = canonicalSourceUnitPlan(
      plan,
      knowledgePointIds,
      patternGroupIds,
      "g5a_u02_all_promoted_dynamic",
    );
    return { plan: adapted, applied: true, adapter: adapted.sourceUnitAdapter };
  }

  return {
    plan: { ...plan },
    applied: false,
    adapter: null,
  };
}

export function validateGlobalPublicSourceUnitAdapters() {
  const errors = [];
  const golden = validateGoldenRuntimeRegistry();
  const g4b = adaptGlobalPublicSourceUnitPlan({
    sourceId: G4B_U04_SOURCE_ID,
    selectionMode: "sourceUnit",
  });
  const g5a = adaptGlobalPublicSourceUnitPlan({
    sourceId: G5A_U02_PUBLIC_SOURCE_ID,
    selectionMode: "sourceUnit",
  });
  const g5aU08Descriptor = getGoldenRuntimeDescriptor("g5a_u08_5a08");
  const g5aU08 = adaptGlobalPublicSourceUnitPlan({
    sourceId: "g5a_u08_5a08",
    selectionMode: "sourceUnit",
    questionCount: 30,
  });
  if (!golden.ok) errors.push(...golden.errors);
  if (!g4b.applied || g4b.plan.selectedKnowledgePointIds.length !== 13 || g4b.plan.selectedPatternGroupIds.length !== 13) {
    errors.push("g4b_source_unit_adapter_invalid");
  }
  if (!g5a.applied || g5a.plan.selectedKnowledgePointIds.length !== 18 || g5a.plan.selectedPatternGroupIds.length !== 18) {
    errors.push("g5a_source_unit_adapter_invalid");
  }
  if (!g5aU08Descriptor
    || !g5aU08.applied
    || g5aU08.plan.selectedKnowledgePointIds.length !== 11
    || g5aU08.plan.selectedPatternGroupIds.length !== 17
    || g5aU08.adapter?.patternSpecCount !== 30
    || g5aU08.adapter?.goldenContractId !== "G5AU08_GOLDEN_V1"
    || g5aU08.adapter?.goldenContractVersion !== "1.0.0") {
    errors.push("g5a_u08_golden_source_unit_adapter_invalid");
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}
