export const P04_DIMENSION_WEIGHTS = Object.freeze({
  projectArchetype: 15,
  projectGoal: 15,
  requiredMilestones: 15,
  eventFlow: 15,
  quantityDependencyGraph: 15,
  decisionModel: 10,
  mathematicalComposition: 10,
  terminalDeliverable: 5,
});

export const P05_FIXTURE_FLAGS = Object.freeze({
  fixtureOnly: true,
  productionAdmissible: false,
  runtimeSelectable: false,
});

export const cloneFixture = (value) => JSON.parse(JSON.stringify(value));

export function calculateP04WeightedScore(componentSimilarities) {
  return Number(Object.entries(P04_DIMENSION_WEIGHTS)
    .reduce((total, [dimension, weight]) => (
      total + componentSimilarities[dimension] * weight
    ), 0)
    .toFixed(6));
}

export function buildCanonicalIdentityKey(identity) {
  return [
    identity.projectArchetype,
    identity.projectGoal,
    identity.requiredMilestones.join(">"),
    identity.eventFlow.join(">"),
    identity.quantityDependencyGraph,
    identity.decisionModel,
    [...identity.mathematicalComposition].sort().join(","),
    identity.terminalDeliverable,
  ].join("|");
}

export function makePositiveChain(row) {
  const [
    index,
    familyIndex,
    contextDomain,
    projectArchetype,
    projectGoal,
    requiredMilestones,
    eventFlow,
    quantityDependencyGraph,
    decisionModel,
    mathematicalComposition,
    terminalDeliverable,
  ] = row;

  const identity = {
    projectArchetype,
    projectGoal,
    requiredMilestones,
    eventFlow,
    quantityDependencyGraph,
    decisionModel,
    mathematicalComposition,
    terminalDeliverable,
  };

  const numericIndex = Number(index);
  return Object.freeze({
    fixtureChainId: `p05_chain_${index}`,
    semanticFamilyId: `p05_family_${familyIndex}`,
    contextDomain,
    identity,
    surface: {
      actorNames: [`actor_fixture_${index}`],
      placeNames: [`place_fixture_${index}`],
      objectNames: [`object_fixture_${index}`],
      languageVariantIds: [`p05_lang_${index}_a`, `p05_lang_${index}_b`],
      numericProfileIds: [`p05_num_${index}_a`, `p05_num_${index}_b`],
      randomSeeds: [numericIndex * 101, numericIndex * 101 + 1],
      surfaceVariantCount: 12 + numericIndex,
      numericInstanceCapacity: 1000 + numericIndex * 100,
    },
    p02ProjectionProfileIds: [
      `p05_projection_${index}_2q`,
      `p05_projection_${index}_4q`,
    ],
    p03EvidenceFixtureIds: [`p05_evidence_problem_${index}`],
    expectedCanonicalIdentityKey: buildCanonicalIdentityKey(identity),
    flags: P05_FIXTURE_FLAGS,
  });
}
