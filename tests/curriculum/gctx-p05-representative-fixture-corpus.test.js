import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  buildCanonicalIdentityKey,
  calculateP04WeightedScore,
} from "../fixtures/gctx-p05-fixture-helpers.js";
import { GCTX_P05_BASE_BREADTH_METRICS } from "../fixtures/gctx-p05-breadth-profile-fixtures.js";
import { GCTX_P05_REPRESENTATIVE_FIXTURE_CORPUS } from "../fixtures/gctx-p05-representative-fixture-corpus.js";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDirectory, "../..");

const readJson = (relativePath) => JSON.parse(readFileSync(
  path.join(repoRoot, relativePath),
  "utf8",
));

const schema = readJson(
  "data/curriculum/context/schemas/GCTX_P05_RepresentativeFixtureCorpus.schema.json",
);
const contract = readJson(
  "data/curriculum/contracts/GCTX_P05_RepresentativePositiveNegativeFixtureCorpusContract.json",
);
const p02 = readJson(
  "data/curriculum/contracts/GCTX_P02_ScenarioChainBoundedPBLAndCompleteProjectionContract.json",
);
const p03 = readJson(
  "data/curriculum/contracts/GCTX_P03_SourceMiningCommonKnowledgeAndEvidenceGovernanceContract.json",
);
const p04 = readJson(
  "data/curriculum/contracts/GCTX_P04_PBLSemanticBreadthFingerprintAndNearDuplicateContract.json",
);

const corpus = GCTX_P05_REPRESENTATIVE_FIXTURE_CORPUS;
const defs = schema.$defs;

const identityFields = Object.freeze([
  "projectArchetype",
  "projectGoal",
  "requiredMilestones",
  "eventFlow",
  "quantityDependencyGraph",
  "decisionModel",
  "mathematicalComposition",
  "terminalDeliverable",
]);

function assertFixtureOnly(record) {
  assert.deepEqual(record.flags, {
    fixtureOnly: true,
    productionAdmissible: false,
    runtimeSelectable: false,
  });
}

test("GCTX-P05 follows accepted P02/P03/P04 and changes no runtime authority", () => {
  assert.equal(contract.task, "GCTX-P05_RepresentativePositiveNegativeFixtureCorpus");
  assert.match(contract.status, /^fixture_corpus_materialized_/);
  assert.equal(p02.status, contract.upstreamDependencies.p02Status);
  assert.equal(p03.status, contract.upstreamDependencies.p03Status);
  assert.equal(p04.status, contract.upstreamDependencies.p04Status);
  assert.equal(p04.nextTask, contract.task);

  assert.equal(contract.scope.syntheticFixtureCorpusOnly, true);
  assert.equal(contract.scope.containsRealWorldClaims, false);
  assert.equal(contract.scope.containsProductionPblChains, false);
  assert.equal(contract.scope.productionAdmissible, false);
  assert.equal(contract.scope.runtimeSelectable, false);
  assert.equal(contract.scope.runtimeBehaviorChange, false);
  assert.equal(contract.scope.unitMigrationChange, false);
  assert.equal(contract.scope.validatorImplementationChange, false);
  assert.equal(contract.scope.rendererImplementationChange, false);
});

test("GCTX-P05 schema fixes the corpus at 20 positive, 5 pairwise and 10 breadth fixtures", () => {
  const policy = defs.corpusEnvelope.properties.fixturePolicy.properties;
  assert.equal(policy.expectedPositiveChainCount.const, 20);
  assert.equal(policy.expectedPairwiseFixtureCount.const, 5);
  assert.equal(policy.expectedBreadthProfileFixtureCount.const, 10);

  const positive = defs.corpusEnvelope.properties.positiveChains;
  const pairwise = defs.corpusEnvelope.properties.pairwiseFixtures;
  const breadth = defs.corpusEnvelope.properties.breadthProfileFixtures;
  assert.equal(positive.minItems, 20);
  assert.equal(positive.maxItems, 20);
  assert.equal(pairwise.minItems, 5);
  assert.equal(pairwise.maxItems, 5);
  assert.equal(breadth.minItems, 10);
  assert.equal(breadth.maxItems, 10);

  assert.deepEqual(contract.fixtureCounts, {
    positiveChainCount: 20,
    pairwiseFixtureCount: 5,
    breadthProfileFixtureCount: 10,
    positiveBreadthProfileCount: 1,
    negativeBreadthProfileCount: 9,
  });
});

test("GCTX-P05 resolved corpus is synthetic, fixture-only and non-runtime", () => {
  assert.equal(corpus.fixtureSchemaVersion, "gctx-p05-representative-fixtures-v1");
  assert.equal(corpus.rulesetVersion, "0.1.0");
  assert.equal(corpus.fixtureOnly, true);
  assert.equal(corpus.productionAdmissible, false);
  assert.equal(corpus.runtimeSelectable, false);
  assert.deepEqual(corpus.upstreamContracts, [
    p02.task,
    p03.task,
    p04.task,
  ]);
  assert.deepEqual(corpus.fixturePolicy, {
    syntheticOnly: true,
    containsRealWorldClaims: false,
    mayBecomeProductionContent: false,
    mayBeSelectedByRuntime: false,
    expectedPositiveChainCount: 20,
    expectedPairwiseFixtureCount: 5,
    expectedBreadthProfileFixtureCount: 10,
  });

  for (const chain of corpus.positiveChains) assertFixtureOnly(chain);
  for (const pair of corpus.pairwiseFixtures) assertFixtureOnly(pair);
  for (const profile of corpus.breadthProfileFixtures) assertFixtureOnly(profile);
});

test("GCTX-P05 has twenty unique eight-dimensional canonical identities", () => {
  assert.equal(corpus.positiveChains.length, 20);

  const chainIds = corpus.positiveChains.map((chain) => chain.fixtureChainId);
  const identityKeys = corpus.positiveChains.map((chain) => (
    chain.expectedCanonicalIdentityKey
  ));

  assert.equal(new Set(chainIds).size, 20);
  assert.equal(new Set(identityKeys).size, 20);

  for (const chain of corpus.positiveChains) {
    assert.deepEqual(Object.keys(chain.identity), identityFields);
    assert.equal(
      chain.expectedCanonicalIdentityKey,
      buildCanonicalIdentityKey(chain.identity),
    );
    assert.equal(chain.p02ProjectionProfileIds.length, 2);
    assert.match(chain.p02ProjectionProfileIds[0], /^p05_projection_[0-9]{3}_2q$/);
    assert.match(chain.p02ProjectionProfileIds[1], /^p05_projection_[0-9]{3}_4q$/);
    assert.equal(chain.p03EvidenceFixtureIds.length, 1);
    assert.match(chain.p03EvidenceFixtureIds[0], /^p05_evidence_problem_[0-9]{3}$/);
  }

  assert.equal(contract.positiveCorpusIdentityContract.eightIdentityDimensionsRequired, true);
  assert.equal(contract.positiveCorpusIdentityContract.canonicalIdentityKeysUnique, true);
});

test("GCTX-P05 positive corpus covers all archetypes, domains and breadth floors", () => {
  assert.deepEqual(GCTX_P05_BASE_BREADTH_METRICS, {
    pblArchetypeCount: 5,
    pblSemanticFamilyCount: 16,
    pblApprovedChainCount: 20,
    surfaceVariantCount: 450,
    numericInstanceCapacity: 41000,
    contextDomainCount: 5,
    eventFlowSignatureCount: 20,
    decisionModelCount: 20,
    totalProposedChainCount: 22,
    nearDuplicateCandidateCount: 2,
    rejectedDuplicateCount: 2,
    nearDuplicateRate: 0.090909,
    allApprovedFingerprintsUnique: true,
  });
  assert.deepEqual(
    contract.positiveCorpusExpectedMetrics,
    {...GCTX_P05_BASE_BREADTH_METRICS, expectedProductionEligible: true},
  );

  assert.deepEqual(
    [...new Set(corpus.positiveChains.map((chain) => chain.identity.projectArchetype))].sort(),
    [...p04.pblArchetypes].sort(),
  );
  assert.deepEqual(
    [...new Set(corpus.positiveChains.map((chain) => chain.contextDomain))].sort(),
    [...p04.crossDomainCoverageContract.availableDomains].sort(),
  );

  assert.ok(GCTX_P05_BASE_BREADTH_METRICS.pblArchetypeCount >= 4);
  assert.ok(GCTX_P05_BASE_BREADTH_METRICS.pblSemanticFamilyCount >= 12);
  assert.ok(GCTX_P05_BASE_BREADTH_METRICS.pblApprovedChainCount >= 20);
  assert.ok(GCTX_P05_BASE_BREADTH_METRICS.contextDomainCount >= 3);
  assert.ok(GCTX_P05_BASE_BREADTH_METRICS.eventFlowSignatureCount >= 4);
  assert.ok(GCTX_P05_BASE_BREADTH_METRICS.decisionModelCount >= 3);
  assert.ok(GCTX_P05_BASE_BREADTH_METRICS.nearDuplicateRate <= 0.2);
});

test("GCTX-P05 pairwise fixtures cover all five P04 classifications with exact scores", () => {
  assert.equal(corpus.pairwiseFixtures.length, 5);
  const expectedById = new Map(
    contract.pairwiseExpectedResults.map((fixture) => [fixture.pairFixtureId, fixture]),
  );

  assert.deepEqual(
    corpus.pairwiseFixtures.map((fixture) => fixture.expectedWeightedScore),
    [100, 87.25, 59.5, 18, 20.5],
  );
  assert.deepEqual(
    corpus.pairwiseFixtures.map((fixture) => fixture.expectedClassification),
    [
      "exact_semantic_duplicate",
      "near_duplicate",
      "same_family_distinct_chain",
      "distinct_family",
      "distinct_archetype",
    ],
  );

  for (const fixture of corpus.pairwiseFixtures) {
    assert.equal(
      fixture.expectedWeightedScore,
      calculateP04WeightedScore(fixture.componentSimilarities),
    );
    const expected = expectedById.get(fixture.pairFixtureId);
    assert.ok(expected, `missing contract result for ${fixture.pairFixtureId}`);
    assert.equal(fixture.expectedWeightedScore, expected.expectedWeightedScore);
    assert.equal(fixture.expectedClassification, expected.expectedClassification);
    assert.equal(fixture.expectedBlocking, expected.expectedBlocking);
    assert.equal(
      fixture.expectedCountsAsDistinctChain,
      expected.expectedCountsAsDistinctChain,
    );
    assert.equal(
      fixture.expectedCountsAsDistinctFamily,
      expected.expectedCountsAsDistinctFamily,
    );
    assert.deepEqual(fixture.expectedBlockingCodes, expected.expectedBlockingCodes);
  }
});

test("GCTX-P05 surface reskin remains the same canonical semantic identity", () => {
  const exact = corpus.pairwiseFixtures.find((fixture) => (
    fixture.pairFixtureId === "p05_pair_exact_surface_reskin"
  ));
  const original = corpus.positiveChains.find((chain) => (
    chain.fixtureChainId === exact.chainARef
  ));

  assert.equal(
    buildCanonicalIdentityKey(exact.candidateBIdentityOverride),
    original.expectedCanonicalIdentityKey,
  );
  assert.notDeepEqual(exact.candidateBSurfaceOverride, original.surface);
  assert.equal(exact.expectedSurfaceReskinDetected, true);
  assert.equal(exact.expectedCountsAsDistinctChain, false);
  assert.equal(exact.expectedCountsAsDistinctFamily, false);
  assert.equal(contract.surfaceAndNumericBoundary.surfaceReskinCountsAsDistinctChain, false);
});

test("GCTX-P05 near duplicate changes identity but remains above the blocking threshold", () => {
  const near = corpus.pairwiseFixtures.find((fixture) => (
    fixture.pairFixtureId === "p05_pair_near_duplicate"
  ));
  const original = corpus.positiveChains.find((chain) => (
    chain.fixtureChainId === near.chainARef
  ));

  assert.notEqual(
    buildCanonicalIdentityKey(near.candidateBIdentityOverride),
    original.expectedCanonicalIdentityKey,
  );
  assert.ok(near.expectedWeightedScore >= 80);
  assert.ok(near.expectedWeightedScore < 100);
  assert.equal(near.expectedClassification, "near_duplicate");
  assert.equal(near.expectedBlocking, true);
  assert.deepEqual(near.expectedBlockingCodes, ["PBL_NEAR_DUPLICATE_CHAIN"]);
});

test("GCTX-P05 breadth fixtures include one pass and nine isolated blocking profiles", () => {
  assert.equal(corpus.breadthProfileFixtures.length, 10);
  assert.equal(
    corpus.breadthProfileFixtures.filter((fixture) => fixture.expectedProductionEligible).length,
    1,
  );
  assert.equal(
    corpus.breadthProfileFixtures.filter((fixture) => !fixture.expectedProductionEligible).length,
    9,
  );

  const expectedById = new Map(
    contract.breadthProfileExpectedResults.map((fixture) => [fixture.profileFixtureId, fixture]),
  );
  for (const fixture of corpus.breadthProfileFixtures) {
    const expected = expectedById.get(fixture.profileFixtureId);
    assert.ok(expected, `missing breadth contract result for ${fixture.profileFixtureId}`);
    assert.equal(fixture.expectedProductionEligible, expected.expectedProductionEligible);
    assert.deepEqual(fixture.expectedBlockingCodes, expected.expectedBlockingCodes);
  }

  const allCodes = new Set(corpus.breadthProfileFixtures.flatMap((fixture) => (
    fixture.expectedBlockingCodes
  )));
  for (const code of [
    "PBL_ARCHETYPE_BREADTH_INSUFFICIENT",
    "PBL_SEMANTIC_FAMILY_BREADTH_INSUFFICIENT",
    "PBL_APPROVED_CHAIN_BREADTH_INSUFFICIENT",
    "PBL_CONTEXT_DOMAIN_COVERAGE_INSUFFICIENT",
    "PBL_EVENT_FLOW_BREADTH_INSUFFICIENT",
    "PBL_DECISION_MODEL_BREADTH_INSUFFICIENT",
    "PBL_NEAR_DUPLICATE_RATE_EXCEEDED",
    "PBL_APPROVED_CHAIN_FINGERPRINT_COLLISION",
    "PBL_NUMERIC_CAPACITY_COUNTING_FORBIDDEN",
  ]) {
    assert.ok(allCodes.has(code), `breadth fixture missing ${code}`);
    assert.ok(p04.blockingCodesReserved.includes(code), `P04 missing reserved ${code}`);
  }
});

test("GCTX-P05 rejects numeric capacity as a substitute for semantic chain breadth", () => {
  const fixture = corpus.breadthProfileFixtures.find((entry) => (
    entry.profileFixtureId === "p05_breadth_numeric_substitution_forbidden"
  ));

  assert.equal(fixture.metrics.pblApprovedChainCount, 19);
  assert.equal(fixture.metrics.numericInstanceCapacity, 1000000);
  assert.equal(fixture.attemptedSubstitution, "numeric_capacity");
  assert.equal(fixture.expectedProductionEligible, false);
  assert.deepEqual(fixture.expectedBlockingCodes, [
    "PBL_APPROVED_CHAIN_BREADTH_INSUFFICIENT",
    "PBL_NUMERIC_CAPACITY_COUNTING_FORBIDDEN",
  ]);
  assert.equal(
    contract.surfaceAndNumericBoundary.numericCapacityMaySubstituteForApprovedChainCount,
    false,
  );
  assert.equal(p04.metricCountingContract.numericInstanceCapacityCountsAsApprovedChain, false);
});

test("GCTX-P05 preserves P06 and runtime implementation boundaries", () => {
  assert.deepEqual(contract.deferredToP06, [
    "fingerprintCanonicalizerContract",
    "weightedSimilarityCalculatorContract",
    "nearDuplicateClassifierContract",
    "breadthGateValidatorContract",
    "blockingCodeExecutionContract",
  ]);
  assert.equal(contract.compatibilityContract.p02ClosureAuthorityUnchanged, true);
  assert.equal(contract.compatibilityContract.p03EvidenceAuthorityUnchanged, true);
  assert.equal(contract.compatibilityContract.p04FingerprintAuthorityUnchanged, true);
  assert.equal(contract.compatibilityContract.existingPatternSpecAuthorityUnchanged, true);
  assert.equal(contract.compatibilityContract.existingUnitRuntimeUnchanged, true);
  assert.equal(contract.compatibilityContract.g5aU02FilesMayBeModified, false);
  assert.equal(contract.nextTask, "GCTX-P06_ValidatorAndBlockingCodeContract");
});
