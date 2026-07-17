import { P05_FIXTURE_FLAGS } from "./gctx-p05-fixture-helpers.js";
import { GCTX_P05_POSITIVE_CHAINS } from "./gctx-p05-positive-chains.js";

export const GCTX_P05_BASE_BREADTH_METRICS = Object.freeze({
  pblArchetypeCount: new Set(
    GCTX_P05_POSITIVE_CHAINS.map((chain) => chain.identity.projectArchetype),
  ).size,
  pblSemanticFamilyCount: new Set(
    GCTX_P05_POSITIVE_CHAINS.map((chain) => chain.semanticFamilyId),
  ).size,
  pblApprovedChainCount: GCTX_P05_POSITIVE_CHAINS.length,
  surfaceVariantCount: GCTX_P05_POSITIVE_CHAINS.reduce(
    (sum, chain) => sum + chain.surface.surfaceVariantCount,
    0,
  ),
  numericInstanceCapacity: GCTX_P05_POSITIVE_CHAINS.reduce(
    (sum, chain) => sum + chain.surface.numericInstanceCapacity,
    0,
  ),
  contextDomainCount: new Set(
    GCTX_P05_POSITIVE_CHAINS.map((chain) => chain.contextDomain),
  ).size,
  eventFlowSignatureCount: new Set(
    GCTX_P05_POSITIVE_CHAINS.map((chain) => chain.identity.eventFlow.join(">")),
  ).size,
  decisionModelCount: new Set(
    GCTX_P05_POSITIVE_CHAINS.map((chain) => chain.identity.decisionModel),
  ).size,
  totalProposedChainCount: 22,
  nearDuplicateCandidateCount: 2,
  rejectedDuplicateCount: 2,
  nearDuplicateRate: Number((2 / 22).toFixed(6)),
  allApprovedFingerprintsUnique: true,
});

function makeBreadthFixture({
  id,
  description,
  metricOverrides = {},
  attemptedSubstitution = "none",
  eligible = false,
  blockingCodes = [],
}) {
  return Object.freeze({
    profileFixtureId: id,
    description,
    metrics: {...GCTX_P05_BASE_BREADTH_METRICS, ...metricOverrides},
    attemptedSubstitution,
    expectedProductionEligible: eligible,
    expectedBlockingCodes: blockingCodes,
    flags: P05_FIXTURE_FLAGS,
  });
}

export const GCTX_P05_BREADTH_PROFILE_FIXTURES = Object.freeze([
  makeBreadthFixture({
    id: "p05_breadth_positive_floor_pass",
    description: "Twenty distinct chains across five archetypes and sixteen families pass every blocking floor.",
    eligible: true,
  }),
  makeBreadthFixture({
    id: "p05_breadth_archetype_floor_fail",
    description: "Only three approved archetypes are represented.",
    metricOverrides: {pblArchetypeCount: 3},
    blockingCodes: ["PBL_ARCHETYPE_BREADTH_INSUFFICIENT"],
  }),
  makeBreadthFixture({
    id: "p05_breadth_family_floor_fail",
    description: "Only eleven approved semantic families are represented.",
    metricOverrides: {pblSemanticFamilyCount: 11},
    blockingCodes: ["PBL_SEMANTIC_FAMILY_BREADTH_INSUFFICIENT"],
  }),
  makeBreadthFixture({
    id: "p05_breadth_chain_floor_fail",
    description: "Only nineteen genuinely distinct approved chains are represented.",
    metricOverrides: {pblApprovedChainCount: 19},
    blockingCodes: ["PBL_APPROVED_CHAIN_BREADTH_INSUFFICIENT"],
  }),
  makeBreadthFixture({
    id: "p05_breadth_domain_floor_fail",
    description: "Only two context domains are covered.",
    metricOverrides: {contextDomainCount: 2},
    blockingCodes: ["PBL_CONTEXT_DOMAIN_COVERAGE_INSUFFICIENT"],
  }),
  makeBreadthFixture({
    id: "p05_breadth_event_flow_floor_fail",
    description: "Only three event-flow signatures are represented.",
    metricOverrides: {eventFlowSignatureCount: 3},
    blockingCodes: ["PBL_EVENT_FLOW_BREADTH_INSUFFICIENT"],
  }),
  makeBreadthFixture({
    id: "p05_breadth_decision_model_floor_fail",
    description: "Only two decision models are represented.",
    metricOverrides: {decisionModelCount: 2},
    blockingCodes: ["PBL_DECISION_MODEL_BREADTH_INSUFFICIENT"],
  }),
  makeBreadthFixture({
    id: "p05_breadth_near_duplicate_rate_fail",
    description: "Five of twenty proposed chains are near duplicates.",
    metricOverrides: {
      totalProposedChainCount: 20,
      nearDuplicateCandidateCount: 5,
      rejectedDuplicateCount: 5,
      nearDuplicateRate: 0.25,
    },
    blockingCodes: ["PBL_NEAR_DUPLICATE_RATE_EXCEEDED"],
  }),
  makeBreadthFixture({
    id: "p05_breadth_fingerprint_collision_fail",
    description: "Two approved chains share one canonical fingerprint.",
    metricOverrides: {allApprovedFingerprintsUnique: false},
    blockingCodes: ["PBL_APPROVED_CHAIN_FINGERPRINT_COLLISION"],
  }),
  makeBreadthFixture({
    id: "p05_breadth_numeric_substitution_forbidden",
    description: "Nineteen distinct chains plus one million numeric instances cannot satisfy the chain floor.",
    metricOverrides: {
      pblApprovedChainCount: 19,
      numericInstanceCapacity: 1000000,
    },
    attemptedSubstitution: "numeric_capacity",
    blockingCodes: [
      "PBL_APPROVED_CHAIN_BREADTH_INSUFFICIENT",
      "PBL_NUMERIC_CAPACITY_COUNTING_FORBIDDEN",
    ],
  }),
]);
