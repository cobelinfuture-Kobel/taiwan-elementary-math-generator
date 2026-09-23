import { fileURLToPath } from "node:url";

import { materializeR06LegacyCompatibilityMigration } from "../../src/curriculum/global/r06-legacy-compatibility-migration.mjs";

function finding(code, details = {}) {
  return { code, ...details };
}

export function validateR06LegacyCompatibilityMigration(migration = materializeR06LegacyCompatibilityMigration()) {
  const errors = [];
  const warnings = [];
  const unitIds = migration.compatibilityUnits.map((row) => row.productUnitId);
  const expectedUnitIds = migration.deliveryWaveAuthority.policy.publicBaseline.productUnitIds;

  if (migration.metrics.productUnitCount !== 15) errors.push(finding("R06_PRODUCT_UNIT_COUNT_INVALID", { actual: migration.metrics.productUnitCount }));
  if (migration.metrics.sourceNodeCount !== 16) errors.push(finding("R06_SOURCE_NODE_COUNT_INVALID", { actual: migration.metrics.sourceNodeCount }));
  if (migration.metrics.canonicalKnowledgePointCount !== 156) errors.push(finding("R06_CANONICAL_KP_COUNT_INVALID", { actual: migration.metrics.canonicalKnowledgePointCount }));
  if (JSON.stringify(unitIds) !== JSON.stringify([...expectedUnitIds].sort())) errors.push(finding("R06_PRODUCT_UNIT_IDENTITY_MISMATCH"));
  if (migration.metrics.globalModelReconciliationCount !== 9) errors.push(finding("R06_RECONCILIATION_COUNT_INVALID", { actual: migration.metrics.globalModelReconciliationCount }));
  if (migration.metrics.unresolvedBlockingCount !== 0) errors.push(finding("R06_BLOCKING_COMPATIBILITY_UNRESOLVED", { actual: migration.metrics.unresolvedBlockingCount }));

  for (const unit of migration.compatibilityUnits) {
    if (unit.compatibilityState !== "SHADOW_COMPATIBILITY_READY_R07_CUTOVER_DEFERRED") {
      errors.push(finding("R06_COMPATIBILITY_STATE_INVALID", { productUnitId: unit.productUnitId }));
    }
    if (unit.canonicalKnowledgePointIds.length === 0) errors.push(finding("R06_UNIT_CANONICAL_KP_EMPTY", { productUnitId: unit.productUnitId }));
    if (!unit.productionParityContract.sourceIdsPreserved) errors.push(finding("R06_SOURCE_ID_NOT_PRESERVED", { productUnitId: unit.productUnitId }));
    if (!unit.productionParityContract.knowledgePointIdsPreserved) errors.push(finding("R06_KP_ID_NOT_PRESERVED", { productUnitId: unit.productUnitId }));
    if (!unit.productionParityContract.patternSpecIdsPreserved) errors.push(finding("R06_PATTERN_ID_NOT_PRESERVED", { productUnitId: unit.productUnitId }));
    if (unit.productionParityContract.visibleOutputChangeExpected) errors.push(finding("R06_VISIBLE_OUTPUT_CHANGE_PREMATURE", { productUnitId: unit.productUnitId }));

    const canonicalSet = new Set(unit.canonicalKnowledgePointIds);
    for (const mapping of unit.legacyKnowledgePointMappings) {
      if (mapping.migrationType !== "PRODUCTION_AUTHORITY_EXACT_ID") errors.push(finding("R06_PRODUCTION_AUTHORITY_NOT_EXACT", { productUnitId: unit.productUnitId, legacyKnowledgePointId: mapping.legacyKnowledgePointId }));
      if (mapping.legacyKnowledgePointId !== mapping.canonicalKnowledgePointId) errors.push(finding("R06_PRODUCTION_AUTHORITY_ID_CHANGED", { productUnitId: unit.productUnitId, legacyKnowledgePointId: mapping.legacyKnowledgePointId }));
      if (!canonicalSet.has(mapping.canonicalKnowledgePointId)) errors.push(finding("R06_CANONICAL_TARGET_MISSING", { productUnitId: unit.productUnitId, canonicalKnowledgePointId: mapping.canonicalKnowledgePointId }));
    }
    for (const binding of unit.legacyQuestionBindings) {
      if (!canonicalSet.has(binding.canonicalKnowledgePointId)) errors.push(finding("R06_QUESTION_BINDING_TARGET_MISSING", { productUnitId: unit.productUnitId, legacyQuestionId: binding.legacyQuestionId }));
      if (!binding.identityPreserved) errors.push(finding("R06_QUESTION_IDENTITY_NOT_PRESERVED", { productUnitId: unit.productUnitId, legacyQuestionId: binding.legacyQuestionId }));
    }
    for (const alias of unit.legacyS43AliasMappings) {
      if (alias.compatibilityStatus.startsWith("BLOCKING_")) errors.push(finding(alias.compatibilityStatus, { productUnitId: unit.productUnitId, legacyKnowledgePointId: alias.legacyKnowledgePointId }));
      if (alias.compatibilityStatus === "DEFERRED_NON_PRODUCTION") warnings.push(finding("R06_S43_NON_PRODUCTION_ALIAS_DEFERRED", { productUnitId: unit.productUnitId, legacyKnowledgePointId: alias.legacyKnowledgePointId }));
    }
    for (const row of unit.globalModelReconciliations) {
      if (row.resolutionState !== "RESOLVED_BY_LEGACY_SCOPE_FENCE") errors.push(finding("R06_RECONCILIATION_STATE_INVALID", { knowledgePointId: row.knowledgePointId }));
      if (!row.existingLegacyPatternsRemainProductionAllowed) errors.push(finding("R06_LEGACY_D0_NOT_PRESERVED", { knowledgePointId: row.knowledgePointId }));
      if (!row.newGlobalPatternAdmissionRequiresCapabilities) errors.push(finding("R06_GLOBAL_CAPABILITY_FENCE_MISSING", { knowledgePointId: row.knowledgePointId }));
      if (!row.r07DualReadParityRequired) errors.push(finding("R06_R07_DUAL_READ_NOT_REQUIRED", { knowledgePointId: row.knowledgePointId }));
    }
  }

  const boundary = migration.mainlineBoundary;
  if (boundary.productionConsumerChanged) errors.push(finding("R06_PRODUCTION_CONSUMER_CHANGED"));
  if (!boundary.legacyCompatibilityMigrated) errors.push(finding("R06_MIGRATION_FLAG_NOT_SET"));
  if (boundary.productionCutoverAllowed) errors.push(finding("R06_PRODUCTION_CUTOVER_PREMATURE"));
  if (boundary.parallelRuntimePipelineAllowed) errors.push(finding("R06_PARALLEL_RUNTIME_ALLOWED"));
  if (!boundary.existing15UnitProductionUsePreserved) errors.push(finding("R06_EXISTING_PRODUCT_USE_NOT_PRESERVED"));

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    summary: {
      productUnitCount: migration.metrics.productUnitCount,
      sourceNodeCount: migration.metrics.sourceNodeCount,
      canonicalKnowledgePointCount: migration.metrics.canonicalKnowledgePointCount,
      productionAuthorityExactMappingCount: migration.metrics.productionAuthorityExactMappingCount,
      legacyQuestionBindingCount: migration.metrics.legacyQuestionBindingCount,
      s43LegacyAliasRowCount: migration.metrics.s43LegacyAliasRowCount,
      globalModelReconciliationCount: migration.metrics.globalModelReconciliationCount,
      unresolvedBlockingCount: migration.metrics.unresolvedBlockingCount,
    },
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const report = validateR06LegacyCompatibilityMigration();
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exitCode = 1;
}
