import assert from "node:assert/strict";
import test from "node:test";

import {
  buildGctxP07EligibilityAudit,
  loadGctxP07Contract,
} from "../../tools/curriculum/audit-gctx-p07-existing-patternspec-semantic-eligibility.mjs";

const contract = loadGctxP07Contract();
const audit = buildGctxP07EligibilityAudit();

function sorted(values) {
  return [...values].sort();
}

test("GCTX-P07 scope remains audit-only and consumes the canonical public selector", () => {
  assert.equal(contract.task, "GCTX-P07_ExistingPatternSpecSemanticEligibilityAudit");
  assert.equal(contract.scope.selectorAuthority, "site/modules/curriculum/registry/batch-a-selector-composer.js");
  assert.equal(contract.scope.publicSourceCount, 15);
  assert.equal(contract.scope.auditLevel, "every selector-reachable PatternSpec");
  assert.equal(contract.scope.runtimeBehaviorChanged, false);
  assert.equal(contract.scope.registryPopulationChanged, false);
  assert.equal(contract.scope.unitMigrationChanged, false);
  assert.equal(contract.scope.rendererChanged, false);
  assert.equal(audit.scopeBoundary.runtimeBehaviorChanged, false);
  assert.equal(audit.scopeBoundary.registryPopulationChanged, false);
  assert.equal(audit.scopeBoundary.unitMigrationChanged, false);
  assert.equal(audit.scopeBoundary.rendererChanged, false);
});

test("GCTX-P07 assigns exactly one deterministic decision to every selector-reachable PatternSpec", () => {
  assert.deepEqual(audit.errors, []);
  assert.equal(audit.status, "accepted_for_p08_binding_backfill");
  assert.equal(audit.summary.auditReadyForP08, true);
  assert.equal(audit.summary.sourceCount, 15);
  assert.ok(audit.summary.knowledgePointCount > 0);
  assert.ok(audit.summary.patternSpecCount > 0);
  assert.equal(audit.summary.patternSpecCount, audit.entries.length);

  const keys = audit.entries.map((entry) => `${entry.sourceId}::${entry.patternSpecId}`);
  assert.equal(new Set(keys).size, keys.length);
  assert.deepEqual(sorted(Object.keys(audit.bySource)), sorted(contract.expectedSourceIds));
  assert.ok(contract.expectedSourceIds.every((sourceId) => audit.bySource[sourceId].patternSpecCount > 0));

  const allowedDecisions = new Set(Object.keys(contract.eligibilityDecisions));
  for (const entry of audit.entries) {
    assert.ok(entry.patternSpecId);
    assert.ok(entry.patternGroupIds.length > 0);
    assert.ok(entry.knowledgePointIds.length > 0);
    assert.ok(allowedDecisions.has(entry.decision));
    if (entry.decision === "not_applicable_non_semantic") {
      assert.deepEqual(entry.semanticSignals, []);
    } else {
      assert.ok(entry.semanticSignals.length > 0);
    }
  }
});

test("GCTX-P07 preserves the five known unit context authorities without promoting numeric-only specs", () => {
  const authoritySet = new Set(contract.existingContextAuthoritySourceIds);
  assert.equal(authoritySet.size, 5);

  for (const entry of audit.entries) {
    if (entry.decision === "eligible_existing_authority") {
      assert.equal(authoritySet.has(entry.sourceId), true);
      assert.equal(entry.existingContextAuthority, true);
    }
    if (entry.decision === "eligible_binding_backfill") {
      assert.equal(authoritySet.has(entry.sourceId), false);
      assert.equal(entry.existingContextAuthority, false);
    }
    if (entry.decision === "not_applicable_non_semantic") {
      assert.equal(entry.semanticSignals.length, 0);
    }
  }

  for (const sourceId of authoritySet) {
    assert.equal(audit.bySource[sourceId].existingContextAuthority, true);
    assert.ok(audit.bySource[sourceId].eligiblePatternSpecCount > 0);
  }
});

test("GCTX-P07 known effective authorities retain their exact semantic eligibility counts", () => {
  for (const [sourceId, assertion] of Object.entries(contract.knownAuthorityAssertions)) {
    assert.equal(
      audit.bySource[sourceId].eligiblePatternSpecCount,
      assertion.eligiblePatternSpecCount,
      `${sourceId} semantic eligibility count drifted`,
    );
  }

  assert.equal(audit.bySource.g4b_u04_4b04.eligiblePatternSpecCount, 6);
  assert.equal(audit.bySource.g5a_u02_5a02.eligiblePatternSpecCount, 8);
  assert.equal(audit.bySource.g5a_u08_5a08.eligiblePatternSpecCount, 11);
});

test("GCTX-P07 exposes a closed P08 consumer boundary", () => {
  assert.equal(
    audit.nextShortestStep,
    "GCTX-P08_ApprovedSemanticBindingBackfillAndLegacyAuthorityNormalization",
  );
  assert.deepEqual(
    sorted(contract.consumerBoundary.allowedInputDecisions),
    sorted(["eligible_existing_authority", "eligible_binding_backfill"]),
  );
  assert.deepEqual(contract.consumerBoundary.forbiddenAsBindingInput, ["not_applicable_non_semantic"]);
  assert.equal(
    contract.consumerBoundary.productionRuntimeUse,
    "forbidden_until_binding_validator_and_resolver_gates_pass",
  );
});

test("GCTX-P07 audit readback", () => {
  console.log(`GCTX_P07_AUDIT_SUMMARY=${JSON.stringify({
    summary: audit.summary,
    bySource: audit.bySource,
  })}`);
  assert.equal(audit.summary.errorCount, 0);
});
