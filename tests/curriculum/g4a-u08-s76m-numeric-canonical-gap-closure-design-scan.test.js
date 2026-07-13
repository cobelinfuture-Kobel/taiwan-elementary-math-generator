import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  G4A_U08_PATTERN_SPEC_IDS,
} from "../../site/modules/curriculum/batch-a/source-pattern-g4a-u08-extension.js";
import {
  generateG4AU08ExpressionQuestions,
} from "../../site/modules/curriculum/batch-a/g4a-u08-expression-generator.js";

const design = JSON.parse(fs.readFileSync(
  "data/curriculum/contracts/S76M_G4A_U08_NumericCanonicalGapClosureDesignScan.json",
  "utf8",
));
const registry = JSON.parse(fs.readFileSync(
  "data/curriculum/registry/S76D_G4A_U08_KnowledgePointPatternGroupRegistry.json",
  "utf8",
));
const s76l = JSON.parse(fs.readFileSync(
  "data/curriculum/contracts/S76L_G4A_U08_FullSourceD0AndBatchAMigrationReadback.json",
  "utf8",
));

function sorted(values) {
  return [...values].sort();
}

function duplicates(values) {
  const seen = new Set();
  const repeated = new Set();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated];
}

function numericRegistryRows() {
  return registry.patternGroups
    .map((row) => ({
      patternGroupId: row[0],
      knowledgePointId: row[1],
      mode: row[2],
      lifecycle: row[3],
    }))
    .filter((row) => row.mode === "numeric");
}

test("S76M is a planning-only design freeze over the exact S76L gap", () => {
  assert.equal(design.task, "S76M_G4A_U08_NumericCanonicalGapClosureDesignScan");
  assert.equal(design.mode, "planning_only");
  assert.equal(design.status, "PASS_DESIGN_FROZEN_PENDING_IMPLEMENTATION_APPROVAL");
  assert.equal(s76l.fullSourceD0Status, "BLOCKED");
  assert.equal(design.currentGap.numericKnowledgePointCount, 11);
  assert.equal(design.currentGap.numericPatternGroupCount, 11);
  assert.equal(design.currentGap.legacyNumericPatternSpecCount, 10);
  assert.equal(design.currentGap.legacyNumericShapeVariantCount, 39);
  assert.equal(design.currentGap.patternGroupsWithoutPatternSpecValidatorMutationClosure, 12);
  assert.equal(design.currentGap.canonicalPatternGroupsNotPubliclyReachable, 24);
  assert.equal(design.scopeBoundary.runtimeChanged, false);
  assert.equal(design.scopeBoundary.d0Declared, false);
});

test("S76M inventory accounts for all ten legacy numeric PatternSpecs and 39 emitted shape variants", () => {
  const inventoryIds = design.legacyNumericInventory.map((row) => row.legacyPatternSpecId);
  assert.deepEqual(inventoryIds, G4A_U08_PATTERN_SPEC_IDS);
  assert.deepEqual(duplicates(inventoryIds), []);
  const declaredVariants = design.legacyNumericInventory.flatMap((row) => row.shapeVariants);
  assert.equal(declaredVariants.length, 39);
  assert.deepEqual(duplicates(declaredVariants), []);

  const generated = generateG4AU08ExpressionQuestions({
    sourceId: "g4a_u08_4a08",
    questionCount: 100,
    ordering: "groupedByPattern",
    generationSeed: "s76m-shape-inventory",
  });
  assert.equal(generated.ok, true, JSON.stringify(generated.errors));
  assert.equal(generated.questions.length, 100);

  const actualBySpec = new Map();
  for (const question of generated.questions) {
    const variants = actualBySpec.get(question.patternSpecId) ?? new Set();
    variants.add(question.shapeVariant);
    actualBySpec.set(question.patternSpecId, variants);
  }
  for (const row of design.legacyNumericInventory) {
    assert.deepEqual(
      sorted(actualBySpec.get(row.legacyPatternSpecId) ?? []),
      sorted(row.shapeVariants),
      row.legacyPatternSpecId,
    );
  }
});

test("S76M preserves every legacy numeric PatternSpec exactly once as a primary reclassification", () => {
  assert.equal(design.primaryReclassifications.length, 10);
  const legacyIds = design.primaryReclassifications.map((row) => row.legacyPatternSpecId);
  const canonicalIds = design.primaryReclassifications.map((row) => row.canonicalPatternSpecId);
  assert.deepEqual(sorted(legacyIds), sorted(G4A_U08_PATTERN_SPEC_IDS));
  assert.deepEqual(sorted(canonicalIds), sorted(G4A_U08_PATTERN_SPEC_IDS));
  assert.deepEqual(duplicates(legacyIds), []);
  assert.equal(design.primaryReclassifications.every((row) => row.strategy === "preserve_id_reclassify"), true);
});

test("S76M primary plus supplemental plan covers all eleven authoritative numeric PatternGroups", () => {
  const authorityRows = numericRegistryRows();
  assert.equal(authorityRows.length, 11);
  const authorityGroupIds = authorityRows.map((row) => row.patternGroupId);
  const authorityKnowledgePointIds = authorityRows.map((row) => row.knowledgePointId);
  const plannedRows = [...design.primaryReclassifications, ...design.supplementalCanonicalPatternSpecs];
  const plannedGroupIds = [...new Set(plannedRows.map((row) => row.patternGroupId))];
  const plannedKnowledgePointIds = [...new Set(plannedRows.map((row) => row.knowledgePointId))];
  assert.deepEqual(sorted(plannedGroupIds), sorted(authorityGroupIds));
  assert.deepEqual(sorted(plannedKnowledgePointIds), sorted(authorityKnowledgePointIds));
  assert.equal(design.numericClosureSummary.coveredNumericKnowledgePointCount, 11);
  assert.equal(design.numericClosureSummary.coveredNumericPatternGroupCount, 11);
});

test("S76M resolves the semantic gap with six supplemental specs, not the cardinality-only minimum of one", () => {
  assert.equal(design.supplementalCanonicalPatternSpecs.length, 6);
  assert.equal(design.numericClosureSummary.primaryReclassificationCount, 10);
  assert.equal(design.numericClosureSummary.supplementalPatternSpecCount, 6);
  assert.equal(design.numericClosureSummary.plannedNumericCanonicalPatternSpecCount, 16);
  assert.equal(design.numericClosureSummary.newExpressionFamilyCount, 1);
  assert.equal(design.numericClosureSummary.legacyGeneratorRewriteRequired, false);

  const newFamilies = design.supplementalCanonicalPatternSpecs.filter((row) => row.newExpressionFamilyRequired === true);
  assert.deepEqual(newFamilies.map((row) => row.canonicalPatternSpecId), ["ps_g4a_u08_num_compound_parentheses"]);
  assert.equal(newFamilies[0].minimumParenthesisGroupCount, 2);
  assert.deepEqual(newFamilies[0].requiredOperatorSet, ["+", "-", "×", "÷"]);
  assert.equal(newFamilies[0].exactIntegerDivisionRequired, true);
});

test("S76M supplemental legacy bindings reference only real PatternSpecs and emitted variants", () => {
  const inventoryById = new Map(design.legacyNumericInventory.map((row) => [row.legacyPatternSpecId, new Set(row.shapeVariants)]));
  for (const supplemental of design.supplementalCanonicalPatternSpecs) {
    for (const binding of supplemental.legacyBindings ?? []) {
      assert.equal(inventoryById.has(binding.legacyPatternSpecId), true, binding.legacyPatternSpecId);
      for (const variant of binding.allowedShapeVariants) {
        assert.equal(inventoryById.get(binding.legacyPatternSpecId).has(variant), true, variant);
      }
    }
  }
});

test("S76M locks one validator design for each numeric PatternGroup with semantic mutations", () => {
  const authorityGroupIds = numericRegistryRows().map((row) => row.patternGroupId);
  const validatorGroupIds = design.numericValidatorDesign.map((row) => row.patternGroupId);
  assert.equal(design.numericValidatorDesign.length, 11);
  assert.deepEqual(sorted(validatorGroupIds), sorted(authorityGroupIds));
  assert.deepEqual(duplicates(validatorGroupIds), []);
  for (const row of design.numericValidatorDesign) {
    assert.ok(row.requiredEvidence.length >= 2, row.patternGroupId);
    assert.ok(row.blockingMutations.length >= 2, row.patternGroupId);
  }
});

test("S76M defines the single missing app_cost_overlay closure without conflating payment balance", () => {
  const overlay = design.appCostOverlayClosure;
  assert.equal(overlay.patternGroupId, "pg_g4a_u08_app_cost_overlay");
  assert.equal(overlay.canonicalPatternSpecId, "ps_g4a_u08_app_cost_overlay");
  assert.equal(overlay.templateFamilyId, "tpl_app_cost_component_plus_minus_overlay");
  assert.deepEqual(overlay.equationShapes, [
    "unitCost×quantity+overlayAmount",
    "unitCost×quantity-overlayAmount",
  ]);
  assert.equal(overlay.semanticRelations.includes("overlay_direction_preserved"), true);
  assert.equal(overlay.blockingMutations.includes("payment_balance_semantics_injected"), true);
  assert.equal(overlay.publicRoutingIncludedInS76M, false);
});

test("S76M post-closure counts and bounded implementation sequence are internally consistent", () => {
  assert.deepEqual(design.plannedPostClosureCounts, {
    canonicalKnowledgePointCount: 15,
    canonicalPatternGroupCount: 28,
    existingCanonicalPatternSpecCount: 16,
    plannedNumericCanonicalPatternSpecCount: 16,
    plannedAppCostOverlayPatternSpecCount: 1,
    plannedTotalCanonicalPatternSpecCount: 33,
    plannedValidatorCoveredPatternGroupCount: 28,
    plannedMutationCoveredPatternGroupCount: 28,
    plannedPublicPatternGroupCountAfterRoutingMilestone: 28,
  });
  assert.deepEqual(design.implementationSequence.map((row) => row.task), [
    "S76N_G4A_U08_NumericCanonicalPatternSpecAndSamplerBindingImplementation",
    "S76O_G4A_U08_NumericCanonicalAdapterValidatorAndMutationClosure",
    "S76P_G4A_U08_AppCostOverlayClosure",
    "S76Q_G4A_U08_AllCanonicalGroupsPublicRoutingAndWorksheetReachability",
    "S76R_G4A_U08_FullSourceStressHTMLPDFAndD0Reevaluation",
  ]);
  assert.equal(design.stop.stopReason, "IMPLEMENTATION_APPROVAL_GATE");
  assert.equal(design.stop.nextResumeTask, design.implementationSequence[0].task);
});
