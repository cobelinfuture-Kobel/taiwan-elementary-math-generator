import test from "node:test";
import assert from "node:assert/strict";
import { auditPublicPatternReachability, auditPublicPatternRuntimeReplay } from "../../tools/governance/audit-public-pattern-reachability.mjs";

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
  assert.equal(counts.authoritySupersededCount, 6);
  assert.equal(counts.authorityStaleOutsideCurrentSourceCount, 4);
  assert.deepEqual(
    report.authoritySuperseded.map((row) => row.patternSpecId).sort(),
    [
      "ps_g4a_u01_large_number_vertical_calculation",
      "ps_g4a_u02_multiplier_10_or_100",
      "ps_g4a_u04_3digit_by_2digit_exact",
      "ps_g4a_u08_add_sub_three_terms",
      "ps_g4b_u01_multi_digit_by_3digit",
      "ps_g5a_u08_left_to_right_add_sub",
    ],
  );
  assert.deepEqual(
    report.authorityStaleOutsideCurrentSource.map((row) => row.patternSpecId).sort(),
    [
      "ps_g4a_u02_4digit_by_2digit",
      "ps_g4a_u04_4digit_by_2digit_exact",
      "ps_g4b_u01_multi_digit_by_2digit",
      "ps_g4b_u01_multi_digit_division_exact",
    ],
  );
  assert.deepEqual(
    report.unreachableCandidates.map((row) => row.patternSpecId).sort(),
    [
      "ps_g3b_u08_division_check_by_multiplication",
      "ps_g3b_u08_multiplication_check_by_division",
    ],
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


test("focused public PatternSpec runtime replay classifies every current reachability candidate", async () => {
  const report = await auditPublicPatternRuntimeReplay();
  const { counts, candidateRows, routeReplayFailures } = report;

  assert.equal(report.schemaName, "PublicPatternRuntimeReplayAuditV1");
  assert.equal(report.authority.capacityStatus, "PASS");
  assert.equal(report.authority.legalRouteCount, 793);
  assert.equal(report.authority.priorAcceptedBrowserReplay.passRouteCount, 793);
  assert.equal(report.authority.priorAcceptedBrowserReplay.failRouteCount, 0);
  assert.equal(counts.reachabilityCandidateCount, 2);
  assert.equal(counts.candidateSourceCount, 1);
  assert.ok(counts.focusedLegalRouteCount > 0);
  assert.equal(counts.focusedRuntimeReplayCount, counts.focusedLegalRouteCount);
  assert.equal(counts.focusedRuntimeReplayFailureCount, 0, JSON.stringify(routeReplayFailures));
  assert.equal(candidateRows.length, counts.reachabilityCandidateCount);
  assert.equal(
    counts.confirmedUnreachableCount + counts.exactRuntimeReachableCount,
    counts.reachabilityCandidateCount,
  );
  assert.equal(counts.confirmedUnreachableCount, 0);
  assert.equal(counts.exactRuntimeReachableCount, 2);
  assert.deepEqual(report.confirmedUnreachable, []);
  assert.deepEqual(
    report.exactRuntimeReachable.map((row) => row.patternSpecId).sort(),
    [
      "ps_g3b_u08_division_check_by_multiplication",
      "ps_g3b_u08_multiplication_check_by_division",
    ],
  );

  console.log("PUBLIC_PATTERN_RUNTIME_REPLAY_SUMMARY=" + JSON.stringify({
    counts,
    confirmedUnreachable: report.confirmedUnreachable,
    exactRuntimeReachable: report.exactRuntimeReachable,
  }));
});
