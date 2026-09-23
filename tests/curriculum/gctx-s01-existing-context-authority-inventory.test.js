import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  BATCH_A_SOURCE_UNITS,
  PUBLIC_CANDIDATE_SOURCE_UNITS,
} from "../../site/modules/curriculum/batch-a/source-units.js";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDirectory, "../..");
const contractPath = path.join(
  repoRoot,
  "data/curriculum/contracts/GCTX_S01_ExistingContextAuthorityInventoryAndMigrationMap.json",
);
const contract = JSON.parse(readFileSync(contractPath, "utf8"));

function sorted(values) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

test("GCTX-S01 inventory covers the exact 15-unit public source registry", () => {
  const publicUnits = [...BATCH_A_SOURCE_UNITS, ...PUBLIC_CANDIDATE_SOURCE_UNITS];
  const publicIds = publicUnits.map((unit) => unit.sourceId);
  const inventoryIds = contract.publicUnits.map((unit) => unit.sourceId);

  assert.equal(contract.scope.publicUnitCount, 15);
  assert.equal(publicUnits.length, 15);
  assert.equal(contract.publicUnits.length, 15);
  assert.equal(new Set(inventoryIds).size, inventoryIds.length);
  assert.deepEqual(sorted(inventoryIds), sorted(publicIds));

  const publicById = new Map(publicUnits.map((unit) => [unit.sourceId, unit]));
  for (const unit of contract.publicUnits) {
    const publicUnit = publicById.get(unit.sourceId);
    assert.ok(publicUnit, `missing public unit ${unit.sourceId}`);
    assert.equal(unit.unitCode, publicUnit.unitCode);
    assert.equal(unit.title, publicUnit.title);
  }
});

test("GCTX-S01 distinguishes five existing authority units from ten S07 audit units", () => {
  const existingStatuses = new Set([
    "production_structured_context_authority",
    "production_taxonomy_and_partial_semantic_authority",
  ]);
  const existing = contract.publicUnits.filter((unit) => existingStatuses.has(unit.inventoryStatus));
  const deferred = contract.publicUnits.filter(
    (unit) => unit.inventoryStatus === "requires_s07_application_prompt_audit",
  );

  assert.equal(contract.scope.structuredOrPartialAuthorityUnitCount, 5);
  assert.equal(contract.scope.remainingS07AuditUnitCount, 10);
  assert.equal(existing.length, 5);
  assert.equal(deferred.length, 10);
  assert.deepEqual(sorted(existing.map((unit) => unit.sourceId)), sorted([
    "g3b_u04_3b04",
    "g3b_u08_3b08",
    "g4b_u04_4b04",
    "g5a_u02_5a02",
    "g5a_u08_5a08",
  ]));
});

test("GCTX-S01 authority and consumer paths exist without duplicate authority IDs", () => {
  const authorityIds = contract.authorityFamilies.map((authority) => authority.authorityId);
  const primaryAuthorityPaths = contract.authorityFamilies.map(
    (authority) => authority.authorityPaths[0],
  );

  assert.equal(new Set(authorityIds).size, authorityIds.length);
  assert.equal(new Set(primaryAuthorityPaths).size, primaryAuthorityPaths.length);

  for (const authority of contract.authorityFamilies) {
    assert.ok(authority.authorityPaths.length > 0, `${authority.authorityId} has no authority path`);
    assert.ok(authority.migrationTarget, `${authority.authorityId} has no migration target`);
    assert.match(authority.migrationPriority, /^P[0-3]$/);
    for (const relativePath of [...authority.authorityPaths, ...authority.consumerPaths]) {
      assert.equal(
        existsSync(path.join(repoRoot, relativePath)),
        true,
        `missing inventoried path ${relativePath}`,
      );
    }
  }
});

test("GCTX-S01 migration order is closed from ownership blockers through S07 audit", () => {
  assert.deepEqual(contract.migrationOrder.map((row) => row.priority), ["P0", "P1", "P2", "P3"]);
  const knownAuthorityIds = new Set(contract.authorityFamilies.map((row) => row.authorityId));
  const orderedIds = contract.migrationOrder.flatMap((row) => row.authorityIds);

  assert.equal(new Set(orderedIds).size, orderedIds.length);
  assert.deepEqual(sorted(orderedIds), sorted([...knownAuthorityIds]));
  assert.deepEqual(contract.migrationOrder[0].authorityIds, [
    "g4b_u04_sdg_context_bank",
    "g4b_u04_current_affairs_source_governance",
  ]);
  assert.equal(contract.migrationOrder.at(-1).priority, "P3");
});

test("GCTX-S01 preserves runtime and math authority while advancing to S02", () => {
  const rules = contract.migrationRules;

  assert.equal(contract.scope.runtimeBehaviorChange, false);
  assert.equal(contract.scope.fileMigrationPerformed, false);
  assert.equal(rules.deleteOrRewriteExistingAuthoritiesInS01, false);
  assert.equal(rules.productionBehaviorChangeInS01, false);
  assert.equal(rules.globalRegistryBecomesSharedOwnerAfterMigration, true);
  assert.equal(rules.unitAdaptersRetainPatternSpecBindings, true);
  assert.equal(rules.existingIdsMustRemainReplayCompatible, true);
  assert.equal(rules.mathAuthorityChangesAllowed, false);
  assert.equal(rules.validatorWeakeningAllowed, false);
  assert.equal(rules.freeFormAIAllowed, false);
  assert.equal(rules.genericFallbackAllowed, false);
  assert.equal(rules.runtimeWebSearchAllowed, false);
  assert.equal(contract.nextTask, "GCTX-S02_GlobalContextSchemaAndRegistryContract");
});
