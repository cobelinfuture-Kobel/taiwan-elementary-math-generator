import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  getG4AU08AllAdapterContracts,
} from "../../src/curriculum/g4a-u08/canonical-generated-item-adapter.js";
import {
  getG4AU08AllValidatorContracts,
} from "../../src/curriculum/g4a-u08/canonical-validator-contract.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS,
} from "../../site/modules/curriculum/registry/g4a-u08-phase2b-promotion.js";
import {
  G4A_U08_PRODUCTION_LIFECYCLE,
} from "../../site/modules/curriculum/registry/g4a-u08-production-promotion.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const readJson = (path) => JSON.parse(readFileSync(resolve(ROOT, path), "utf8"));
const readText = (path) => readFileSync(resolve(ROOT, path), "utf8");

const report = readJson("data/curriculum/contracts/S76L_G4A_U08_FullSourceD0AndBatchAMigrationReadback.json");
const registry = readJson("data/curriculum/registry/S76D_G4A_U08_KnowledgePointPatternGroupRegistry.json");
const reclassification = readJson("data/curriculum/mapping/S76E_G4A_U08_ExistingPatternSpecReclassification.json");
const extension = readJson("data/curriculum/mapping/S76I_G4A_U08_Phase2BMissingPatternGroups.json");
const mutationMatrix = readJson("data/curriculum/validation/S76H_G4A_U08_ExistingScopeMutationMatrix.json");
const standard = readText("docs/curriculum/mapping/S76B_BatchA_ValidatorOntologyRebaseStandard.md");

const kpIds = registry.knowledgePoints.map((row) => row[0]);
const groupRows = registry.patternGroups.map((row) => ({
  patternGroupId: row[0],
  knowledgePointId: row[1],
  mode: row[2],
  lifecycle: row[3],
}));
const groupIds = groupRows.map((row) => row.patternGroupId);
const groupById = new Map(groupRows.map((row) => [row.patternGroupId, row]));
const existingImplementedGroups = reclassification.rows.map((row) => row[3]);
const extensionImplementedGroups = extension.patternGroups.map((row) => row.patternGroupId);
const implementedGroupIds = [...new Set([...existingImplementedGroups, ...extensionImplementedGroups])];
const implementedKpIds = [...new Set(implementedGroupIds.map((id) => groupById.get(id)?.knowledgePointId).filter(Boolean))];
const adapterContracts = Object.values(getG4AU08AllAdapterContracts());
const validatorContracts = Object.values(getG4AU08AllValidatorContracts());
const validatorKpIds = [...new Set(validatorContracts.map((row) => row.knowledgePointId))];
const missingPatternGroupIds = groupIds.filter((id) => !implementedGroupIds.includes(id));

function ratio(numerator, denominator) {
  return numerator / denominator;
}

function assertMetric(name, numerator, denominator, threshold, pass) {
  const metric = report.coverageMetrics[name];
  assert.equal(metric.numerator, numerator, `${name} numerator`);
  assert.equal(metric.denominator, denominator, `${name} denominator`);
  assert.equal(Math.abs(metric.ratio - ratio(numerator, denominator)) < 0.000001, true, `${name} ratio`);
  assert.equal(metric.threshold, threshold, `${name} threshold`);
  assert.equal(metric.pass, pass, `${name} pass`);
}

test("S76L derives the authoritative 15-KP and 28-PatternGroup denominator", () => {
  assert.equal(registry.summary.knowledgePointCount, 15);
  assert.equal(registry.summary.numericKnowledgePointCount, 11);
  assert.equal(registry.summary.applicationKnowledgePointCount, 4);
  assert.equal(registry.summary.patternGroupCount, 28);
  assert.equal(kpIds.length, 15);
  assert.equal(groupIds.length, 28);
  assert.equal(new Set(kpIds).size, 15);
  assert.equal(new Set(groupIds).size, 28);
  assert.deepEqual(report.authorityCounts, {
    sourceKnowledgePointCount: 15,
    numericKnowledgePointCount: 11,
    applicationKnowledgePointCount: 4,
    canonicalPatternGroupCount: 28,
    numericPatternGroupCount: 11,
    applicationCorePatternGroupCount: 13,
    applicationExtensionPatternGroupCount: 4,
    implementedCanonicalPatternGroupCount: 16,
    implementedCanonicalPatternSpecCount: 16,
    publicCanonicalPatternGroupCount: 4,
    legacyExecutablePatternSpecCount: 26,
  });
});

test("S76L proves only four canonical KnowledgePoints had PatternSpec and validator closure at that milestone", () => {
  assert.equal(reclassification.rows.length, 12);
  assert.equal(extension.patternGroups.length, 4);
  assert.equal(implementedGroupIds.length, 16);
  assert.equal(implementedKpIds.length, 4);
  assert.equal(adapterContracts.length, 16);
  assert.equal(validatorContracts.length, 16);
  assert.equal(validatorKpIds.length, 4);
  assert.deepEqual(new Set(validatorKpIds), new Set(implementedKpIds));
  assert.equal(mutationMatrix.templateCount, 12);
  assert.equal(mutationMatrix.expectedTotalMutationCount, 193);
  for (const row of extension.patternGroups) {
    const contract = validatorContracts.find((candidate) => candidate.patternGroupId === row.patternGroupId);
    assert.ok(contract, row.patternGroupId);
    assert.equal(Array.isArray(contract.requiredSemanticRelations), true);
    assert.equal(contract.requiredSemanticRelations.length >= 2, true);
  }
});

test("S76L historical four-group reachability remains recorded while S76R exposes all 28 groups", () => {
  assert.equal(report.implementedCanonicalScope.publicCanonicalPatternGroupCount, 4);
  assert.deepEqual(
    new Set(G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS),
    new Set(extension.patternGroups.map((row) => row.patternGroupId)),
  );

  const registryGroupSet = new Set(groupIds);
  const visibleKps = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === report.sourceId);
  const visibleCanonicalGroups = new Set();
  for (const kp of visibleKps) {
    for (const group of getVisiblePatternGroupsForKnowledgePoint(kp.knowledgePointId)) {
      if (registryGroupSet.has(group.patternGroupId)) visibleCanonicalGroups.add(group.patternGroupId);
    }
  }
  assert.deepEqual(visibleCanonicalGroups, registryGroupSet);
  assert.equal(visibleCanonicalGroups.size, 28);
});

test("S76L computes all five S76B coverage metrics and blocks four failed gates", () => {
  assert.match(standard, /SOURCE_KP_COVERAGE >= 90%/);
  assert.match(standard, /KP_PATTERN_COVERAGE >= 90%/);
  assert.match(standard, /KP_VALIDATOR_COVERAGE >= 85%/);
  assert.match(standard, /KP_MUTATION_COVERAGE >= 80%/);
  assert.match(standard, /PUBLIC_WORKSHEET_REACHABILITY >= 85%/);

  assertMetric("SOURCE_KP_COVERAGE", 15, 15, 0.9, true);
  assertMetric("KP_PATTERN_COVERAGE", 4, 15, 0.9, false);
  assertMetric("KP_VALIDATOR_COVERAGE", 4, 15, 0.85, false);
  assertMetric("KP_MUTATION_COVERAGE", 16, 28, 0.8, false);
  assertMetric("PUBLIC_WORKSHEET_REACHABILITY", 4, 28, 0.85, false);

  assert.deepEqual(report.failedD0Metrics, [
    "KP_PATTERN_COVERAGE",
    "KP_VALIDATOR_COVERAGE",
    "KP_MUTATION_COVERAGE",
    "PUBLIC_WORKSHEET_REACHABILITY",
  ]);
  assert.equal(report.fullSourceD0Status, "BLOCKED");
  assert.equal(report.taskStatus, "PASS_MIGRATION_READBACK");
});

test("S76L identifies the exact 12 PatternGroups without PatternSpec closure", () => {
  assert.equal(missingPatternGroupIds.length, 12);
  assert.deepEqual(new Set(report.unclosedCanonicalScope.patternGroupIdsWithoutPatternSpec), new Set(missingPatternGroupIds));
  assert.equal(missingPatternGroupIds.filter((id) => id.startsWith("pg_g4a_u08_num_")).length, 11);
  assert.equal(missingPatternGroupIds.includes("pg_g4a_u08_app_cost_overlay"), true);
  assert.equal(report.unclosedCanonicalScope.patternGroupsWithoutValidatorContract, 12);
  assert.equal(report.unclosedCanonicalScope.patternGroupsWithoutMutationCoverage, 12);
  assert.equal(report.unclosedCanonicalScope.canonicalPatternGroupsNotPubliclyReachable, 24);
});

test("S76L preserves its historical D1 result and false-D0 prevention evidence", () => {
  assert.equal(G4A_U08_PRODUCTION_LIFECYCLE.distance.startsWith("D1"), true);
  assert.equal(G4A_U08_PRODUCTION_LIFECYCLE.productionUse, "allowed_after_s76k_ci");
  assert.equal(report.scopeBoundary.runtimeChanged, false);
  assert.equal(report.scopeBoundary.selectorChanged, false);
  assert.equal(report.scopeBoundary.resolverChanged, false);
  assert.equal(report.scopeBoundary.worksheetChanged, false);
  assert.equal(report.scopeBoundary.rendererChanged, false);
  assert.equal(report.scopeBoundary.falseD0DeclarationPrevented, true);
  assert.equal(report.stop.stopReason, "NEXT_STEP_OUTSIDE_APPROVED_SCOPE");
  assert.equal(report.stop.blockerType, "FULL_SOURCE_D0_GATE");
  assert.equal(report.stop.nextResumeTask, "S76M_G4A_U08_NumericCanonicalGapClosureDesignScan");
});
