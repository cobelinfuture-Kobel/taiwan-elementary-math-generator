import assert from "node:assert/strict";
import test from "node:test";

import {
  buildGctxP08BindingAdmissionManifest,
  loadApprovedSemanticBindingRegistry,
  loadGctxP08Contract,
} from "../../tools/curriculum/build-gctx-p08-binding-admission-manifest.mjs";

const contract = loadGctxP08Contract();
const approvedRegistry = loadApprovedSemanticBindingRegistry();
const manifest = buildGctxP08BindingAdmissionManifest();

const sorted = (values) => [...values].sort();

test("GCTX-P08 scope remains admission and normalization only", () => {
  assert.equal(contract.task, "GCTX-P08_ApprovedSemanticBindingBackfillAndLegacyAuthorityNormalization");
  assert.equal(contract.scope.runtimeBehaviorChanged, false);
  assert.equal(contract.scope.approvedProductionBindingCreated, false);
  assert.equal(contract.scope.unitAuthorityDeletedOrRewritten, false);
  assert.equal(contract.scope.unitMigrationPerformed, false);
  assert.equal(contract.scope.rendererChanged, false);
  assert.equal(contract.scope.publicControlsChanged, false);
  assert.deepEqual(manifest.scopeBoundary, {
    runtimeBehaviorChanged: false,
    approvedProductionBindingCreated: false,
    unitAuthorityDeletedOrRewritten: false,
    unitMigrationPerformed: false,
    rendererChanged: false,
    publicControlsChanged: false,
  });
});

test("GCTX-P08 materializes an empty fail-closed approved binding registry", () => {
  assert.equal(approvedRegistry.registryId, "gctx_registry_approved_semantic_bindings_v1");
  assert.equal(approvedRegistry.schemaVersion, 1);
  assert.equal(approvedRegistry.rulesetVersion, "0.1.0");
  assert.equal(approvedRegistry.registryKind, "approved_semantic_binding_registry");
  assert.equal(approvedRegistry.generatedAt, null);
  assert.deepEqual(approvedRegistry.entries, []);
  assert.equal(manifest.approvedRegistry.entryCount, 0);
  assert.equal(manifest.approvedRegistry.productionSelectionAllowed, false);
});

test("GCTX-P08 covers all and only the 98 P07 eligible PatternSpecs", () => {
  assert.deepEqual(manifest.errors, []);
  assert.equal(manifest.status, "accepted_for_p09_exact_extraction");
  assert.equal(manifest.summary.readyForP09ExactExtraction, true);
  assert.equal(manifest.summary.candidateCount, 98);
  assert.equal(manifest.summary.legacyAuthorityNormalizationCount, 81);
  assert.equal(manifest.summary.newBindingBackfillCount, 17);
  assert.equal(manifest.summary.sourceCount, 6);
  assert.equal(manifest.summary.excludedNotApplicablePatternSpecCount, 175);
  assert.equal(manifest.summary.errorCount, 0);

  const candidateKeys = manifest.candidates.map((row) => row.candidateKey);
  const bindingIds = manifest.candidates.map((row) => row.candidateBindingId);
  assert.equal(new Set(candidateKeys).size, candidateKeys.length);
  assert.equal(new Set(bindingIds).size, bindingIds.length);
  assert.ok(manifest.candidates.every((row) => row.p07Decision !== "not_applicable_non_semantic"));
});

test("GCTX-P08 locks exact source counts and admission classes", () => {
  assert.deepEqual(
    sorted(Object.keys(manifest.bySource)),
    sorted(Object.keys(contract.expectedCandidatesBySource)),
  );

  for (const [sourceId, expected] of Object.entries(contract.expectedCandidatesBySource)) {
    const actual = manifest.bySource[sourceId];
    assert.equal(actual.candidateCount, expected.candidateCount, `${sourceId} count drifted`);
    if (expected.admissionClass === "legacy_authority_normalization") {
      assert.equal(actual.legacyAuthorityNormalizationCount, expected.candidateCount);
      assert.equal(actual.newBindingBackfillCount, 0);
    } else {
      assert.equal(actual.newBindingBackfillCount, expected.candidateCount);
      assert.equal(actual.legacyAuthorityNormalizationCount, 0);
    }
  }

  assert.equal(manifest.bySource.g3b_u04_3b04.candidateCount, 32);
  assert.equal(manifest.bySource.g3b_u08_3b08.candidateCount, 24);
  assert.equal(manifest.bySource.g4a_u08_4a08.candidateCount, 17);
  assert.equal(manifest.bySource.g4b_u04_4b04.candidateCount, 6);
  assert.equal(manifest.bySource.g5a_u02_5a02.candidateCount, 8);
  assert.equal(manifest.bySource.g5a_u08_5a08.candidateCount, 11);
});

test("GCTX-P08 preserves legacy authority evidence for all 81 normalization candidates", () => {
  for (const [sourceId, expectedAuthorityIds] of Object.entries(contract.expectedLegacyAuthoritiesBySource)) {
    assert.deepEqual(manifest.bySource[sourceId].authorityIds, sorted(expectedAuthorityIds));
  }

  const legacyRows = manifest.candidates.filter(
    (row) => row.admissionClass === "legacy_authority_normalization",
  );
  assert.equal(legacyRows.length, 81);
  for (const row of legacyRows) {
    assert.equal(row.p07Decision, "eligible_existing_authority");
    assert.ok(row.legacyNormalization.authorityIds.length > 0);
    assert.ok(row.legacyNormalization.authorityPaths.length > 0);
    assert.ok(row.legacyNormalization.migrationTargets.length > 0);
    assert.ok(row.legacyNormalization.preservationRules.length > 0);
    assert.equal(row.recommendedNextAction, "extract_exact_p01_binding_from_legacy_authority");
  }
});

test("GCTX-P08 isolates the 17 G4A-U08 backfill candidates", () => {
  const backfillRows = manifest.candidates.filter(
    (row) => row.admissionClass === "new_binding_backfill",
  );
  assert.equal(backfillRows.length, 17);
  assert.deepEqual([...new Set(backfillRows.map((row) => row.sourceId))], ["g4a_u08_4a08"]);
  for (const row of backfillRows) {
    assert.equal(row.p07Decision, "eligible_binding_backfill");
    assert.deepEqual(row.legacyNormalization.authorityIds, []);
    assert.deepEqual(row.legacyNormalization.authorityPaths, []);
    assert.equal(row.recommendedNextAction, "author_source_backed_exact_p01_binding");
  }
});

test("GCTX-P08 candidates cannot masquerade as approved P01 bindings", () => {
  for (const row of manifest.candidates) {
    assert.match(row.candidateBindingId, /^gctx_bind_[a-z0-9_]+$/);
    assert.equal(row.bindingReadiness.lifecycleStatus, "candidate");
    assert.equal(row.bindingReadiness.approvalState, "candidate");
    assert.equal(row.bindingReadiness.exactP01BindingMaterialized, false);
    assert.equal(row.bindingReadiness.p01SchemaValid, false);
    assert.equal(row.bindingReadiness.productionSelectable, false);
    assert.equal(row.bindingReadiness.runtimeResolvable, false);
    assert.deepEqual(
      row.bindingReadiness.requiredExactMaterializationFields,
      contract.p01FieldsRequiringExactMaterialization,
    );
    assert.equal("contextFamilyId" in row, false);
    assert.equal("eventFlow" in row, false);
    assert.equal("quantityRoles" in row, false);
    assert.equal("reviewEvidence" in row, false);
  }
});

test("GCTX-P08 exposes one closed next step", () => {
  assert.equal(
    manifest.nextShortestStep,
    "GCTX-P09_G3BU04ExactSemanticBindingExtractionPilot",
  );
});

test("GCTX-P08 readback", () => {
  console.log(`GCTX_P08_ADMISSION_SUMMARY=${JSON.stringify({
    summary: manifest.summary,
    bySource: manifest.bySource,
  })}`);
  assert.equal(manifest.summary.errorCount, 0);
});
