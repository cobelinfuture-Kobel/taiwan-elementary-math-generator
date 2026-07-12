import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const CONTRACT_PATH = new URL(
  "../../data/curriculum/contracts/S60D_G5A_U08_ApplicationTemplateAndSDGContextContract.json",
  import.meta.url,
);

function loadContract() {
  return JSON.parse(readFileSync(CONTRACT_PATH, "utf8"));
}

test("S60D defines ten source-backed semantic families with complete role and unit contracts", () => {
  const contract = loadContract();
  assert.equal(contract.templateFamilies.length, 10);
  assert.equal(new Set(contract.templateFamilies.map((row) => row.templateFamilyId)).size, 10);

  for (const family of contract.templateFamilies) {
    assert.ok(family.sourceEvidenceIds.length > 0);
    assert.ok(family.operationSignature.length > 0);
    assert.ok(family.roleBindings.length >= 3);
    assert.ok(family.unitFlow.length > 0);
    assert.ok(family.requiredFacts.length > 0);
    assert.ok(family.forbiddenFacts.length > 0);
    assert.ok(family.naturalLanguageConstraints.length > 0);
    assert.ok(family.contextVariants.some((variant) => variant.contextType === "daily_life"));
  }
});

test("S60D accounts for all thirteen application source panels", () => {
  const contract = loadContract();
  const evidenceIds = new Set(contract.templateFamilies.flatMap((row) => row.sourceEvidenceIds));
  assert.equal(evidenceIds.size, 13);
  assert.equal(contract.coverage.sourceEvidencePanelCount, 13);
  assert.equal(contract.acceptance.allSourceApplicationPanelsAccountedFor, true);
});

test("S60D covers the eight approved SDGs with fictionalized practice data", () => {
  const contract = loadContract();
  const variants = contract.templateFamilies.flatMap((row) => row.contextVariants);
  const sdgVariants = variants.filter((variant) => variant.contextType === "sdg");
  const coveredGoals = new Set(sdgVariants.map((variant) => variant.sdgGoalId));

  assert.equal(sdgVariants.length, 12);
  assert.deepEqual([...coveredGoals].sort(), [...contract.policy.allowedSdgGoalIds].sort());
  for (const variant of sdgVariants) {
    assert.equal(variant.dataStatus, "fictionalized_for_practice");
    assert.ok(variant.semanticRelevance.length > 20);
    assert.ok(contract.policy.allowedSdgGoalIds.includes(variant.sdgGoalId));
  }
  assert.equal(contract.coverage.fakeRealStatisticCount, 0);
  assert.equal(contract.acceptance.sdgLabelOnlyVariantCount, 0);
});

test("S60D keeps SDG as context and limits every application family to allowlisted N+1 deltas", () => {
  const contract = loadContract();
  assert.equal(contract.policy.sdgLabelOnlyVariantAllowed, false);
  assert.equal(contract.policy.maxSemanticDeltaPerItem, 1);
  assert.equal(contract.policy.realStatisticsRequireSourceRef, true);

  for (const family of contract.templateFamilies) {
    assert.ok(family.allowedSemanticDeltaIds.length <= 2);
    if (family.allowedDepths.includes("N_PLUS_1")) {
      assert.ok(family.allowedSemanticDeltaIds.length >= 1);
    }
    assert.equal(family.allowedDepths.includes("N_PLUS_2"), false);
  }
});

test("S60D records semantic validation guards for impossible or misleading contexts", () => {
  const contract = loadContract();
  const forbidden = contract.semanticValidation.forbiddenPatterns.join(" ");
  assert.match(forbidden, /unchanged generic story/);
  assert.match(forbidden, /real statistic without sourceRef/);
  assert.match(forbidden, /role-swapped quantity/);
  assert.match(forbidden, /impossible allocation/);
  assert.match(forbidden, /payment below cost/);
});
