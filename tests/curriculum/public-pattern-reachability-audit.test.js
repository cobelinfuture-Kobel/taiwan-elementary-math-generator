import test from "node:test";
import assert from "node:assert/strict";
import { auditPublicPatternReachability } from "../../tools/curriculum/audit-public-pattern-reachability.mjs";

test("public PatternSpec reachability audit produces a complete disjoint classification", async () => {
  const report = await auditPublicPatternReachability();
  const { counts, rows } = report;
  assert.ok(counts.authorityPatternSpecCount > 0);
  assert.equal(
    counts.publicExactCount
      + counts.publicSourceBindingOnlyCount
      + counts.unreachableCandidateCount,
    counts.authorityPatternSpecCount,
  );
  assert.equal(new Set(rows.map((row) => row.patternSpecId)).size, rows.length);
  assert.ok(counts.completedUnitCount > 0);
  assert.ok(counts.classicPublicSourceCount > 0);
  console.log("PUBLIC_PATTERN_REACHABILITY_AUDIT=" + JSON.stringify(report));
});
