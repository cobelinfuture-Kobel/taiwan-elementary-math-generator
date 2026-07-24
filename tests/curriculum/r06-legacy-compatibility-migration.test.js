import test from "node:test";
import assert from "node:assert/strict";

import {
  getR06LegacyCompatibilityUnit,
  listR06GlobalModelReconciliations,
  materializeR06LegacyCompatibilityMigration,
} from "../../src/curriculum/global/r06-legacy-compatibility-migration.mjs";
import { validateR06LegacyCompatibilityMigration } from "../../tools/curriculum/validate-r06-legacy-compatibility-migration.mjs";

test("R06 materializes compatibility for exactly 15 product units and 16 source nodes", () => {
  const migration = materializeR06LegacyCompatibilityMigration();
  assert.equal(migration.metrics.productUnitCount, 15);
  assert.equal(migration.metrics.sourceNodeCount, 16);
  assert.equal(migration.metrics.canonicalKnowledgePointCount, 156);
  assert.equal(new Set(migration.compatibilityUnits.map((row) => row.productUnitId)).size, 15);
});

test("R06 preserves all production-authority KnowledgePoint and question identities", () => {
  const migration = materializeR06LegacyCompatibilityMigration();
  assert.equal(migration.metrics.productionAuthorityExactMappingCount, 156);
  assert.ok(migration.metrics.legacyQuestionBindingCount > 0);
  for (const unit of migration.compatibilityUnits) {
    assert.equal(unit.productionParityContract.knowledgePointIdsPreserved, true);
    assert.equal(unit.productionParityContract.patternSpecIdsPreserved, true);
    assert.ok(unit.legacyKnowledgePointMappings.every((row) => (
      row.legacyKnowledgePointId === row.canonicalKnowledgePointId
      && row.migrationType === "PRODUCTION_AUTHORITY_EXACT_ID"
    )));
  }
});

test("R06 aggregates the two G5A-U02 source nodes into one protected product unit", () => {
  const unit = getR06LegacyCompatibilityUnit("g5a_u02_5a02");
  assert.ok(unit);
  assert.deepEqual(unit.legacySourceNodeIds, ["g5a_u02_5a02a", "g5a_u02_5a02a1"]);
  assert.equal(unit.legacyAuthorityPaths.length, 1);
  assert.ok(unit.canonicalKnowledgePointIds.length > 0);
});

test("R06 resolves supported S43 aliases and defers only non-production legacy rows", () => {
  const migration = materializeR06LegacyCompatibilityMigration();
  const aliases = migration.compatibilityUnits.flatMap((row) => row.legacyS43AliasMappings);
  assert.ok(aliases.some((row) => row.migrationType === "SPLIT_ALIAS_PATTERN_LEVEL_ROUTING_REQUIRED" && row.compatibilityStatus === "RESOLVED"));
  assert.ok(aliases.some((row) => row.migrationType === "RENAMED_ALIAS" && row.compatibilityStatus === "RESOLVED"));
  assert.ok(aliases.filter((row) => row.compatibilityStatus === "DEFERRED_NON_PRODUCTION").every((row) => row.supportClass !== "A"));
  assert.equal(aliases.some((row) => row.compatibilityStatus.startsWith("BLOCKING_")), false);
});

test("R06 resolves all nine protected Global-model differences with a scope fence", () => {
  const rows = listR06GlobalModelReconciliations();
  assert.equal(rows.length, 9);
  assert.ok(rows.every((row) => row.resolutionState === "RESOLVED_BY_LEGACY_SCOPE_FENCE"));
  assert.ok(rows.every((row) => row.existingLegacyPatternsRemainProductionAllowed === true));
  assert.ok(rows.every((row) => row.newGlobalPatternAdmissionRequiresCapabilities === true));
  assert.ok(rows.every((row) => row.r07DualReadParityRequired === true));
});

test("R06 preserves the production consumer and defers authoritative cutover to R07", () => {
  const migration = materializeR06LegacyCompatibilityMigration();
  assert.deepEqual(migration.mainlineBoundary, {
    currentProductionConsumer: "site/assets/browser/pipeline/build-worksheet-document.js",
    productionConsumerChanged: false,
    deliveryWaveRebased: true,
    legacyCompatibilityMigrated: true,
    productionCutoverAllowed: false,
    parallelRuntimePipelineAllowed: false,
    existing15UnitProductionUsePreserved: true,
    nextTask: "R07_AuthoritativeConsumerCutover",
  });
});

test("R06 validator passes the authoritative migration", () => {
  const report = validateR06LegacyCompatibilityMigration();
  assert.equal(report.ok, true, JSON.stringify(report.errors, null, 2));
  assert.equal(report.summary.productUnitCount, 15);
  assert.equal(report.summary.globalModelReconciliationCount, 9);
  assert.equal(report.summary.unresolvedBlockingCount, 0);
});

test("R06 validator fails closed on identity loss and premature cutover", () => {
  const migration = materializeR06LegacyCompatibilityMigration();
  const changedUnits = migration.compatibilityUnits.map((unit, index) => index === 0 ? {
    ...unit,
    productionParityContract: { ...unit.productionParityContract, knowledgePointIdsPreserved: false },
  } : unit);
  const tampered = {
    ...migration,
    compatibilityUnits: changedUnits,
    mainlineBoundary: { ...migration.mainlineBoundary, productionCutoverAllowed: true },
  };
  const report = validateR06LegacyCompatibilityMigration(tampered);
  assert.equal(report.ok, false);
  assert.ok(report.errors.some((row) => row.code === "R06_KP_ID_NOT_PRESERVED"));
  assert.ok(report.errors.some((row) => row.code === "R06_PRODUCTION_CUTOVER_PREMATURE"));
});
