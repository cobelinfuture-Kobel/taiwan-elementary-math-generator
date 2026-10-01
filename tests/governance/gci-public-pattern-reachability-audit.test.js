import test from "node:test";
import assert from "node:assert/strict";
import { auditPublicPatternReachability } from "../../tools/governance/audit-public-pattern-reachability.mjs";

test("public PatternSpec reachability audit produces a complete disjoint classification", async () => {
  const report = await auditPublicPatternReachability();
  const { counts, rows } = report;
  assert.ok(counts.authorityPatternSpecCount > 0);
  assert.equal(
    counts.publicExactCount
      + counts.publicSourceBindingOnlyCount
      + counts.nonPublicIntentionalOrLegacyCount
      + counts.unreachableCandidateCount,
    counts.authorityPatternSpecCount,
  );
  assert.equal(new Set(rows.map((row) => row.patternSpecId)).size, rows.length);
  assert.ok(counts.completedUnitCount > 0);
  assert.ok(counts.classicPublicSourceCount > 0);
  assert.ok(counts.additionalMaterializedDefinitionIdCount > 0);
  assert.equal(
    counts.nonPublicExactReachabilityCount,
    counts.publicSourceBindingOnlyCount
      + counts.nonPublicIntentionalOrLegacyCount
      + counts.unreachableCandidateCount,
  );
  console.log("PUBLIC_PATTERN_REACHABILITY_GAPS=" + JSON.stringify({
    counts,
    unreachableCandidates: report.unreachableCandidates.map((row) => ({
      patternSpecId: row.patternSpecId,
      sourceIds: row.sourceIds,
      unitCodes: row.unitCodes,
      knowledgePointIds: row.knowledgePointIds,
      authorityKinds: row.authorityKinds,
      explicitNonPublicReasons: row.explicitNonPublicReasons,
      origins: row.origins,
    })),
    nonPublicIntentionalOrLegacy: report.nonPublicIntentionalOrLegacy.map((row) => ({
      patternSpecId: row.patternSpecId,
      sourceIds: row.sourceIds,
      unitCodes: row.unitCodes,
      knowledgePointIds: row.knowledgePointIds,
      explicitNonPublicReasons: row.explicitNonPublicReasons,
    })),
  }));
  console.log("PUBLIC_PATTERN_REACHABILITY_AUDIT=" + JSON.stringify(report));
});
