import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const mappingPath = "data/curriculum/mapping/S58_G3B_U08_SourceFieldKnowledgePointMapping.json";
const familyPath = "data/curriculum/templates/S58_G3B_U08_SemanticTemplateFamilies.json";
const oldOverlayPath = "data/curriculum/registry/unit_expansions/S43E7_G3B_U08_KPExpansion.json";

const mapping = JSON.parse(readFileSync(mappingPath, "utf8"));
const families = JSON.parse(readFileSync(familyPath, "utf8"));
const oldOverlay = JSON.parse(readFileSync(oldOverlayPath, "utf8"));

test("S58A fixes the approved six-KP public application boundary", () => {
  assert.equal(mapping.sourceId, "g3b_u08_3b08");
  assert.equal(mapping.approval.approvedKnowledgePointCount, 6);
  assert.equal(mapping.knowledgePoints.length, 6);
  assert.equal(mapping.summary.publicKnowledgePointCount, 6);
  assert.equal(mapping.summary.publicPureNumericKnowledgePointCount, 0);
  assert.equal(mapping.summary.generalTwoStepKnowledgePointCount, 0);

  const ids = mapping.knowledgePoints.map((entry) => entry.knowledgePointId);
  assert.equal(new Set(ids).size, 6);
  assert.ok(mapping.knowledgePoints.every((entry) => entry.publicSelectable === true));
});

test("S58A enforces horizontal-only representation and forbids vertical algorithms", () => {
  assert.equal(mapping.presentationPolicy.representation, "horizontal_only");
  assert.equal(mapping.approval.verticalQuestionGenerationAllowed, false);
  assert.deepEqual(
    new Set(mapping.presentationPolicy.forbiddenForms),
    new Set([
      "vertical_multiplication",
      "vertical_division",
      "long_division",
      "vertical_missing_digit",
      "column_algorithm_grid"
    ])
  );
  assert.equal(families.publicScopePolicy.representation, "horizontal_only");
  assert.equal(families.publicScopePolicy.verticalAlgorithmAllowed, false);
  assert.equal(families.publicScopePolicy.longDivisionAllowed, false);
  assert.equal(families.summary.verticalFamilyCount, 0);
  assert.ok(!JSON.stringify(families.templateFamilies).includes("直式"));
});

test("S58A preserves prior Batch A multiplication and division limits", () => {
  assert.deepEqual(
    families.sharedNumericPolicy.multiplicationCalculatedShapes,
    ["1digit_x_1digit", "2digit_x_1digit", "3digit_x_1digit"]
  );
  assert.deepEqual(
    families.sharedNumericPolicy.divisionCalculatedShapes,
    ["2digit_div_1digit_exact", "3digit_div_1digit_exact"]
  );
  assert.equal(families.sharedNumericPolicy.twoDigitMultiplierComputationAllowed, false);
  assert.equal(families.sharedNumericPolicy.twoDigitDivisorComputationAllowed, false);
  assert.equal(
    families.sharedNumericPolicy.remainderGeneration,
    "support_check_only_not_public_application"
  );
});

test("S58A defines exactly 24 candidate semantic families, four per approved KP", () => {
  assert.equal(families.semanticFamilyCount, 24);
  assert.equal(families.templateFamilies.length, 24);
  assert.equal(families.minimumPlannedContextVariantCount, 72);
  assert.equal(families.summary.plannedMinimumVariantsPerFamily, 3);
  assert.equal(families.summary.plannedMinimumVariantCount, 72);

  const kpIds = new Set(mapping.knowledgePoints.map((entry) => entry.knowledgePointId));
  const familyIds = families.templateFamilies.map((entry) => entry.templateFamilyId);
  assert.equal(new Set(familyIds).size, 24);

  const counts = new Map();
  for (const family of families.templateFamilies) {
    assert.ok(kpIds.has(family.knowledgePointId), family.templateFamilyId);
    counts.set(family.knowledgePointId, (counts.get(family.knowledgePointId) ?? 0) + 1);
    assert.ok(
      ["direct_source", "source_structural_extension"].includes(family.sourceEvidenceTier),
      family.templateFamilyId
    );
    assert.ok(family.requiredConstraints.length >= 4, family.templateFamilyId);
  }

  assert.equal(counts.size, 6);
  for (const count of counts.values()) assert.equal(count, 4);
  assert.deepEqual(Object.fromEntries(counts), families.familyAllocation);
});

test("S58A keeps division applications exact and keeps same-price comparison narrow", () => {
  const divisionKps = new Set([
    "kp_g3b_u08_group_count_from_total",
    "kp_g3b_u08_per_group_from_total",
    "kp_g3b_u08_reverse_base_from_multiple"
  ]);
  for (const family of families.templateFamilies) {
    if (divisionKps.has(family.knowledgePointId)) {
      assert.ok(
        family.requiredConstraints.includes("A_DIVISIBLE_BY_B"),
        family.templateFamilyId
      );
      assert.equal(family.equationShape, "a/b");
    }
  }

  const valueFamilies = families.templateFamilies.filter(
    (family) => family.knowledgePointId === "kp_g3b_u08_same_price_value_comparison"
  );
  assert.equal(valueFamilies.length, 4);
  assert.ok(
    valueFamilies.every((family) =>
      family.requiredConstraints.includes("SAME_TOTAL_PRICE_EXPLICIT")
    )
  );
  assert.ok(
    valueFamilies.every((family) =>
      family.requiredConstraints.includes("UNEQUAL_TOTALS")
    )
  );
});

test("S58A records, but does not rewrite, the historical S43E7 overlay", () => {
  assert.equal(oldOverlay.knowledgePoints.length, 11);
  assert.equal(oldOverlay.summary.knowledgePointCount, 11);
  assert.equal(
    mapping.supersedes.artifact,
    "data/curriculum/registry/unit_expansions/S43E7_G3B_U08_KPExpansion.json"
  );
  assert.equal(mapping.supersedes.oldCandidateCount, 11);
  assert.equal(mapping.supersedes.newApprovedPublicCount, 6);
  assert.match(mapping.supersedes.policy, /historical/);
});
