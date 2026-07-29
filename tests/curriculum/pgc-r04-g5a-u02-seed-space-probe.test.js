import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  materializePgcR04G5aU02SeedSpaceProbe,
} from "../../tools/curriculum/materialize-pgc-r04-g5a-u02-seed-space-probe.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const jsonPath = path.join(root, "data/curriculum/public-generation/r04_g5a_u02_seed_space_probe.json");
const reportPath = path.join(root, "docs/curriculum/output/PGC-R04-A04_G5A_U02_seed_space_probe.md");

function loadContract() {
  assert.equal(fs.existsSync(jsonPath), true, "G5A-U02 seed-space probe must be materialized before acceptance");
  return JSON.parse(fs.readFileSync(jsonPath, "utf8"));
}

test("PGC-R04-A04A probes every numeric and concept G5A-U02 PatternSpec", () => {
  const contract = loadContract();
  assert.equal(contract.schemaName, "PgcR04G5aU02SeedSpaceProbeV1");
  assert.equal(contract.programId, "PUBLIC_KP_GENERATION_CONFORMANCE_V1");
  assert.equal(contract.taskId, "PGC-R04-A04_G5A_U02_NumericCapacityExpansionFullFix");
  assert.equal(contract.status, "PASS", JSON.stringify(contract.blockingGaps, null, 2));
  assert.equal(contract.sourceId, "g5a_u02_5a02");
  assert.equal(contract.summary.targetPatternSpecCount, 11);
  assert.equal(contract.summary.scannedSeedsPerSpec, 4096);
  assert.equal(contract.summary.totalFailureCount, 0);
  assert.equal(contract.summary.blockingProbeGapCount, 0);
  assert.equal(contract.patternSpecs.length, 11);
  assert.equal(new Set(contract.patternSpecs.map((row) => row.patternSpecId)).size, 11);
  assert.equal(new Set(contract.patternSpecs.map((row) => row.patternGroupId)).size, 9);
  for (const row of contract.patternSpecs) {
    assert.equal(row.scannedSeedCount, 4096, row.patternSpecId);
    assert.equal(row.successfulSeedCount, 4096, row.patternSpecId);
    assert.equal(row.failureCount, 0, row.patternSpecId);
    assert.ok(row.uniquePromptCount > 0, row.patternSpecId);
    assert.equal(row.samplePromptSignatures.length > 0, true, row.patternSpecId);
  }
});

test("PGC-R04-A04A selects exactly one evidence-based repair strategy", () => {
  const contract = loadContract();
  const strategy = contract.repairStrategy;
  assert.ok(["SEED_ALLOCATION_AND_DEDUP_COLLISION", "GENERATOR_POOL_EXPANSION_REQUIRED"].includes(strategy.classification));
  assert.match(strategy.nextTaskId, /^PGC-R04-A04B_G5A_U02_/);
  assert.ok(strategy.rationale.length > 40);
  assert.equal(contract.summary.specsWith20UniquePrompts + contract.summary.specsBelow20UniquePrompts, 11);
  if (strategy.classification === "SEED_ALLOCATION_AND_DEDUP_COLLISION") {
    assert.equal(contract.summary.specsBelow20UniquePrompts, 0);
    assert.deepEqual(strategy.affectedPatternSpecIds, []);
    assert.equal(strategy.nextTaskId, "PGC-R04-A04B_G5A_U02_SharedSeedAllocationAndPromptDedupFullFix");
  } else {
    assert.ok(contract.summary.specsBelow20UniquePrompts > 0);
    assert.equal(strategy.affectedPatternSpecIds.length, contract.summary.specsBelow20UniquePrompts);
    assert.equal(strategy.nextTaskId, "PGC-R04-A04B_G5A_U02_TargetedGeneratorPoolExpansionFullFix");
  }
});

test("PGC-R04-A04A probe artifacts are deterministic", () => {
  const committed = loadContract();
  const rebuilt = materializePgcR04G5aU02SeedSpaceProbe();
  assert.deepEqual(rebuilt.summary, committed.summary);
  assert.deepEqual(rebuilt.blockingGaps, committed.blockingGaps);
  assert.deepEqual(rebuilt.repairStrategy, committed.repairStrategy);
  assert.deepEqual(rebuilt.patternSpecs.map((row) => ({
    patternSpecId: row.patternSpecId,
    uniquePromptCount: row.uniquePromptCount,
    supports20UniquePrompts: row.supports20UniquePrompts,
  })), committed.patternSpecs.map((row) => ({
    patternSpecId: row.patternSpecId,
    uniquePromptCount: row.uniquePromptCount,
    supports20UniquePrompts: row.supports20UniquePrompts,
  })));
  assert.equal(fs.existsSync(reportPath), true);
  const report = fs.readFileSync(reportPath, "utf8");
  assert.match(report, /TARGET_PATTERN_SPECS\s+= 11/);
  assert.match(report, /SCANNED_SEEDS_PER_SPEC\s+= 4096/);
  assert.match(report, new RegExp(`NEXT_SHORTEST_STEP\\s+= ${committed.repairStrategy.nextTaskId}`));
});
