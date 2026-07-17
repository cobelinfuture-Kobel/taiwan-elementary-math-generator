import { GCTX_P05_BREADTH_PROFILE_FIXTURES } from "./gctx-p05-breadth-profile-fixtures.js";
import { GCTX_P05_PAIRWISE_FIXTURES } from "./gctx-p05-pairwise-fixtures.js";
import { GCTX_P05_POSITIVE_CHAINS } from "./gctx-p05-positive-chains.js";

export const GCTX_P05_REPRESENTATIVE_FIXTURE_CORPUS = Object.freeze({
  fixtureSchemaVersion: "gctx-p05-representative-fixtures-v1",
  rulesetVersion: "0.1.0",
  fixtureOnly: true,
  productionAdmissible: false,
  runtimeSelectable: false,
  upstreamContracts: [
    "GCTX-P02_ScenarioChainBoundedPBLAndCompleteProjectionContract",
    "GCTX-P03_SourceMiningCommonKnowledgeAndEvidenceGovernance",
    "GCTX-P04_PBLSemanticBreadthFingerprintAndNearDuplicateContract",
  ],
  fixturePolicy: {
    syntheticOnly: true,
    containsRealWorldClaims: false,
    mayBecomeProductionContent: false,
    mayBeSelectedByRuntime: false,
    expectedPositiveChainCount: 20,
    expectedPairwiseFixtureCount: 5,
    expectedBreadthProfileFixtureCount: 10,
  },
  positiveChains: GCTX_P05_POSITIVE_CHAINS,
  pairwiseFixtures: GCTX_P05_PAIRWISE_FIXTURES,
  breadthProfileFixtures: GCTX_P05_BREADTH_PROFILE_FIXTURES,
});
