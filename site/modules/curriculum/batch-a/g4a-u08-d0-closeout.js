import {
  BATCH_A_ALL_UNITS_PRODUCTION_CLOSEOUT,
  BATCH_A_PRODUCTION_SOURCE_IDS,
  validateBatchAAllUnitsProductionCloseoutContract,
} from "./batch-a-production-closeout.js";
import { BATCH_A_SOURCE_UNITS } from "./source-units.js";
import {
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
} from "../registry/batch-a-selector-extension.js";
import {
  G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS,
  G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS,
  G4A_U08_SOURCE_ID,
} from "../registry/g4a-u08-phase2b-promotion.js";
import {
  G4A_U08_D0_PRODUCTION_LIFECYCLE,
  getG4AU08D0ProductionCloseoutProjection,
  validateG4AU08D0ProductionCloseoutProjection,
} from "../registry/g4a-u08-d0-production-closeout.js";

const promotedGroupSet = new Set(G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS);

export const G4A_U08_BATCH_A_MIGRATION_READBACK = Object.freeze({
  task: "S76L_G4A_U08_FullSourceD0CloseoutAndBatchAMigrationReadback",
  status: "fresh_main_d0_and_batch_a_migration_readback_integrated",
  sourceId: G4A_U08_SOURCE_ID,
  batch: "A",
  batchASourceUnitCount: 13,
  batchAPublicSurfaces: Object.freeze(["classic", "fallback404", "pixel"]),
  legacyVisibleKnowledgePointCount: 8,
  authoritativeKnowledgePointCount: 15,
  authoritativePatternGroupCount: 28,
  numericLegacyPatternSpecCount: 10,
  phase2AApplicationPatternSpecCount: 12,
  phase2BCanonicalPatternSpecCount: 4,
  totalExecutablePatternSpecCount: 26,
  phase2BReusedKnowledgePointCount: 3,
  phase2BPromotedPatternGroupCount: 4,
  phase2BPromotedPatternSpecCount: 4,
  sourceUnitRoutePreserved: true,
  legacyKnowledgePointRoutesPreserved: true,
  phase2BExplicitGroupRouteAdded: true,
  aggregateBatchASourceCountChanged: false,
  publicSurfaceCountChanged: false,
  rendererVisualChanged: false,
  productionUse: "allowed",
  goalDistance: "D0_G4A_U08",
  nextGate: "S77_BatchA_NextUnitSourcePriorityLock",
});

function sameMembers(left, right) {
  return left.length === right.length
    && JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
}

export function validateG4AU08BatchAMigrationReadback() {
  const errors = [];
  const aggregate = validateBatchAAllUnitsProductionCloseoutContract();
  const production = validateG4AU08D0ProductionCloseoutProjection();
  const productionProjection = getG4AU08D0ProductionCloseoutProjection();
  const sourceUnit = BATCH_A_SOURCE_UNITS.find((unit) => unit.sourceId === G4A_U08_SOURCE_ID);
  const availability = listBatchAKnowledgePointAvailabilityBySource(G4A_U08_SOURCE_ID);
  const reachedGroups = [];
  const reachedSpecs = [];

  if (!aggregate.ok) errors.push(...aggregate.errors.map((code) => `aggregate:${code}`));
  if (!production.ok) errors.push(...production.errors.map((code) => `production:${code}`));
  if (!BATCH_A_PRODUCTION_SOURCE_IDS.includes(G4A_U08_SOURCE_ID)) errors.push("source_missing_from_batch_a_production_ids");
  if (!sourceUnit) errors.push("source_missing_from_batch_a_source_units");
  if (BATCH_A_SOURCE_UNITS.length !== G4A_U08_BATCH_A_MIGRATION_READBACK.batchASourceUnitCount) errors.push("batch_a_source_count_changed");
  if (BATCH_A_ALL_UNITS_PRODUCTION_CLOSEOUT.publicSurfaces.length !== 3) errors.push("batch_a_public_surface_count_changed");
  if (availability?.visibleCount !== G4A_U08_BATCH_A_MIGRATION_READBACK.legacyVisibleKnowledgePointCount) errors.push("legacy_visible_kp_count_changed");

  for (const knowledgePointId of G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS) {
    const row = getVisibleBatchAKnowledgePoint(knowledgePointId);
    if (!row || row.sourceId !== G4A_U08_SOURCE_ID) errors.push(`promoted_kp_missing:${knowledgePointId}`);
    const groups = getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)
      .filter((group) => promotedGroupSet.has(group.patternGroupId));
    reachedGroups.push(...groups.map((group) => group.patternGroupId));
    reachedSpecs.push(...groups.flatMap((group) => group.patternSpecIds ?? []));
  }

  if (!sameMembers([...new Set(reachedGroups)], G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS)) errors.push("phase2b_pattern_group_reachability_mismatch");
  if (!sameMembers([...new Set(reachedSpecs)], G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS)) errors.push("phase2b_pattern_spec_reachability_mismatch");
  if (productionProjection.stressAcceptance.totalExecutablePatternSpecCount !== 26) errors.push("executable_pattern_spec_count_mismatch");
  if (G4A_U08_D0_PRODUCTION_LIFECYCLE.productionUse !== "allowed") errors.push("production_use_not_allowed");
  if (G4A_U08_D0_PRODUCTION_LIFECYCLE.distance !== "D0_G4A_U08") errors.push("distance_not_d0");
  if (G4A_U08_BATCH_A_MIGRATION_READBACK.aggregateBatchASourceCountChanged !== false) errors.push("aggregate_source_count_change_declared");
  if (G4A_U08_BATCH_A_MIGRATION_READBACK.rendererVisualChanged !== false) errors.push("renderer_visual_change_declared");

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      batchASourceUnits: BATCH_A_SOURCE_UNITS.length,
      legacyVisibleKnowledgePoints: availability?.visibleCount ?? null,
      authoritativeKnowledgePoints: G4A_U08_BATCH_A_MIGRATION_READBACK.authoritativeKnowledgePointCount,
      authoritativePatternGroups: G4A_U08_BATCH_A_MIGRATION_READBACK.authoritativePatternGroupCount,
      executablePatternSpecs: productionProjection.stressAcceptance.totalExecutablePatternSpecCount,
      phase2BPatternGroups: new Set(reachedGroups).size,
      phase2BPatternSpecs: new Set(reachedSpecs).size,
    }),
  });
}
