import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDirectory, "../..");
const contractPath = path.join(
  repoRoot,
  "data/curriculum/contracts/GCTX_S00_GlobalContextScopeContract.json",
);
const sequencePath = path.join(
  repoRoot,
  "docs/curriculum/architecture/GCTX_GlobalCrossCurricularContextTaskSequence.md",
);
const contract = JSON.parse(readFileSync(contractPath, "utf8"));

const expectedDomains = Object.freeze([
  "daily_life",
  "sdg",
  "natural_science",
  "social_studies",
  "history",
]);

const expectedEraModes = Object.freeze([
  "modern",
  "ancient",
  "mixed_eras",
]);

const expectedMigrationPaths = Object.freeze([
  "docs/curriculum/context/G4B_U04_SDG_LifeAndCurrentAffairsContextBank.md",
  "docs/curriculum/context/G4B_U04_SDG_CurrentAffairsSourceRegistry.md",
  "data/curriculum/contracts/S60D_G5A_U08_ApplicationTemplateAndSDGContextContract.json",
]);

test("GCTX-S00 locks the five global elementary common-knowledge context domains", () => {
  assert.equal(contract.schemaName, "GlobalCrossCurricularContextScopeContract");
  assert.equal(contract.goal.knowledgeLevel, "elementary_common_knowledge");
  assert.deepEqual(contract.contextDomains, expectedDomains);
  assert.equal(new Set(contract.contextDomains).size, expectedDomains.length);
  assert.deepEqual(contract.eraModes, expectedEraModes);
  assert.equal(contract.historicalPolicy.ancientContextsAllowed, true);
  assert.equal(contract.historicalPolicy.anachronismAllowed, false);
  assert.equal(
    contract.historicalPolicy.studentFacingClaimThatAncientActorsPracticedModernSDGsAllowed,
    false,
  );
});

test("GCTX-S00 keeps web verification at admission and generation deterministic", () => {
  const verification = contract.verificationPolicy;
  const generation = contract.generationPolicy;

  assert.equal(verification.webVerificationAtAdmissionRequired, true);
  assert.equal(verification.runtimeWebSearchAllowed, false);
  assert.equal(verification.generalCommonKnowledgeMinimumReliableSources, 1);
  assert.equal(verification.specificSpeciesRegionEraOrInstitutionMinimumReliableSources, 2);
  assert.equal(verification.exactFactOrStatisticRequiresExactSource, true);
  assert.equal(verification.exerciseNumbersDefault, "fictionalized_for_practice");
  assert.equal(verification.professionalSubjectKnowledgeBaseRequired, false);
  assert.equal(verification.approvedRegistryRequiredAtGeneration, true);

  assert.equal(generation.freeFormAIAllowed, false);
  assert.equal(generation.genericFallbackAllowed, false);
  assert.equal(generation.unapprovedContextFamilyAllowed, false);
  assert.equal(generation.unapprovedUnitBindingAllowed, false);
  assert.equal(generation.deterministicSeedReplayRequired, true);
  assert.equal(generation.semanticValidatorRequired, true);
  assert.equal(generation.mathValidatorMustRun, true);
});

test("GCTX-S00 separates global registry ownership from unit binding ownership", () => {
  const ownership = contract.ownership;

  assert.equal(ownership.globalRegistryOwnsSharedContextKnowledge, true);
  assert.equal(ownership.unitFilesMayOwnOnlyBindingsAndAdapters, true);
  assert.equal(ownership.unitLocalGlobalContextAuthorityForbiddenAfterMigration, true);
  assert.equal(ownership.knowledgePointAuthorityUnchanged, true);
  assert.equal(ownership.patternSpecAuthorityUnchanged, true);
  assert.equal(ownership.mathGeneratorAuthorityUnchanged, true);
  assert.equal(ownership.mathValidatorAuthorityUnchanged, true);
});

test("GCTX-S00 migration inputs exist and are not silently replaced", () => {
  const migrationPaths = contract.migrationInputs.map((entry) => entry.path);
  assert.deepEqual(migrationPaths, expectedMigrationPaths);

  for (const relativePath of expectedMigrationPaths) {
    assert.equal(existsSync(path.join(repoRoot, relativePath)), true, `missing ${relativePath}`);
  }
});

test("GCTX-S00 locks the complete S00 through S14 auto-continuation chain", () => {
  assert.equal(existsSync(sequencePath), true);
  assert.equal(contract.taskSequence.length, 15);
  assert.equal(
    contract.taskSequence[0],
    "GCTX-S00_GlobalContextScopeArchitectureAndTaskSequenceLock",
  );
  assert.equal(
    contract.taskSequence.at(-1),
    "GCTX-S14_DeployedGlobalContextD0Closeout",
  );
  assert.equal(
    contract.nextTask,
    "GCTX-S01_ExistingContextAuthorityInventoryAndMigrationMap",
  );
  assert.equal(contract.autoContinuation.enabled, true);
  assert.equal(contract.autoContinuation.mergeIsStopPoint, false);
  assert.equal(contract.autoContinuation.closeoutIsStopPoint, false);
  assert.equal(contract.autoContinuation.readbackIsStopPoint, false);
  assert.deepEqual(contract.autoContinuation.allowedStopReasons, [
    "CI_FAILURE",
    "GITHUB_OR_TOOL_SAFETY_BLOCKER",
    "PR_MERGE_BLOCKED",
    "NEXT_STEP_OUTSIDE_APPROVED_GCTX_SCOPE",
    "FORBIDDEN_FILE_BOUNDARY",
    "HUMAN_SOURCE_OR_EVIDENCE_SELECTION_REQUIRED",
  ]);
});
