import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const CONTRACT_PATH = new URL(
  "../../data/curriculum/contracts/G5AU02_S99_P0SourceMethodAndRepresentationFullFixContract.json",
  import.meta.url,
);
const AUDIT_PATH = new URL(
  "../../data/curriculum/audits/G5AU02_S98_All22SourceMethodAndRepresentationParityAudit.json",
  import.meta.url,
);

async function loadJson(url) {
  return JSON.parse(await readFile(url, "utf8"));
}

test("S99 consumes exactly the twelve S98 P0 patterns", async () => {
  const [contract, audit] = await Promise.all([loadJson(CONTRACT_PATH), loadJson(AUDIT_PATH)]);
  const expected = audit.patternAudits
    .filter((row) => row.priority === "P0")
    .map((row) => ({ patternOrder: row.patternOrder, patternSpecId: row.patternSpecId }));
  const actual = contract.patternContracts
    .map((row) => ({ patternOrder: row.patternOrder, patternSpecId: row.patternSpecId }));

  assert.equal(contract.schemaName, "G5AU02P0SourceMethodAndRepresentationFullFixContract");
  assert.equal(contract.task, "G5AU02-S99_P0SourceMethodAndRepresentationFullFixContract");
  assert.equal(contract.inputs.requiredPriority, "P0");
  assert.equal(contract.inputs.requiredPatternCount, 12);
  assert.equal(contract.patternContracts.length, 12);
  assert.deepEqual(actual, expected);
});

test("S99 freezes identity, deterministic validation and no-implementation boundary", async () => {
  const contract = await loadJson(CONTRACT_PATH);
  const invariants = contract.globalInvariants;
  assert.equal(invariants.patternSpecIdsStable, true);
  assert.equal(invariants.knowledgePointIdsStable, true);
  assert.equal(invariants.sourcePacketIdsStable, true);
  assert.equal(invariants.freeFormAI, "forbidden");
  assert.equal(invariants.genericFallback, "forbidden");
  assert.equal(invariants.deterministicGenerationRequired, true);
  assert.equal(invariants.canonicalAnswerRecomputationRequired, true);
  assert.equal(invariants.learnerVisibleUniqueSolutionRequired, true);
  assert.equal(invariants.answerLeakageForbidden, true);
  assert.equal(invariants.currentP1P2BehaviorFrozen, true);
  assert.equal(invariants.crossUnitChangeForbidden, true);
  assert.equal(invariants.runtimeImplementationAllowedInS99, false);
});

test("S99 gives every P0 pattern one display model, fixes and blocking validators", async () => {
  const contract = await loadJson(CONTRACT_PATH);
  const displayKinds = new Set(contract.displayModelKinds.map((row) => row.kind));
  assert.equal(displayKinds.size, 12);

  for (const row of contract.patternContracts) {
    assert.ok(displayKinds.has(row.requiredDisplayModelKind), `${row.patternSpecId} display model missing`);
    assert.ok(Array.isArray(row.requiredFixes) && row.requiredFixes.length >= 2);
    assert.ok(Array.isArray(row.blockingValidatorCodes) && row.blockingValidatorCodes.length >= 2);
    assert.ok(row.blockingValidatorCodes.every((code) => code.startsWith("G5AU02_P0_")));
    assert.match(row.implementationMilestone, /^S10[0-3]$/);
  }
});

test("S99 additive answer models are bounded to three source-parity changes", async () => {
  const contract = await loadJson(CONTRACT_PATH);
  assert.deepEqual(
    contract.answerModelChanges.map((row) => row.answerModelId),
    ["partitionPairListAnswer", "commonFactorAndGcfAnswer", "tileSideAreaPairListAnswer"],
  );
  assert.ok(contract.answerModelChanges.every((row) => row.changeType === "additive"));
  assert.deepEqual(
    contract.answerModelChanges.flatMap((row) => row.usedBy),
    [
      "ps_g5a_u02_equal_partition_all_segment_counts",
      "ps_g5a_u02_greatest_common_factor",
      "ps_g5a_u02_square_tile_area_possibilities",
    ],
  );
});

test("S99 locks nontrivial common-factor sampling and source-code separation", async () => {
  const contract = await loadJson(CONTRACT_PATH);
  const sampling = contract.samplingContracts;
  assert.deepEqual(sampling.nontrivialCommonFactorPair.appliesTo, [
    "ps_g5a_u02_common_factor_enumeration",
    "ps_g5a_u02_greatest_common_factor",
  ]);
  assert.deepEqual(sampling.nontrivialCommonFactorPair.constraints, [
    "a != b",
    "gcd(a,b) >= 2",
    "gcd(a,b) < min(a,b)",
    "factorSet(a) != factorSet(b)",
  ]);

  const profiles = sampling.sourceDigitCodeSeparation.profiles;
  assert.deepEqual(profiles.map((row) => row.profileId), [
    "source_1725_reference",
    "generated_unique_code_v1",
  ]);
  assert.equal(profiles[0].productionAllocation, "reference_only");
  assert.equal(profiles[0].expectedSolution, 1725);
  assert.equal(profiles[1].productionAllocation, "default_regeneration");
  assert.equal(profiles[1].solverRequirement, "exactly_one_solution");
  assert.equal(profiles[1].conditionGrammar, "finite_controlled_only");
});

test("S99 implementation milestones partition P0 exactly once before integrated acceptance", async () => {
  const contract = await loadJson(CONTRACT_PATH);
  assert.deepEqual(contract.implementationMilestones.map((row) => row.milestoneId), [
    "S100", "S101", "S102", "S103", "S104",
  ]);

  const implementationRows = contract.implementationMilestones
    .filter((row) => row.milestoneId !== "S104")
    .flatMap((row) => row.patternOrders);
  assert.equal(implementationRows.length, 12);
  assert.equal(new Set(implementationRows).size, 12);
  assert.deepEqual(
    [...implementationRows].sort((left, right) => left - right),
    contract.patternContracts.map((row) => row.patternOrder).sort((left, right) => left - right),
  );
  assert.deepEqual(
    contract.implementationMilestones.at(-1).patternOrders,
    contract.patternContracts.map((row) => row.patternOrder),
  );
});

test("S99 acceptance dimensions and next step are exact", async () => {
  const contract = await loadJson(CONTRACT_PATH);
  assert.deepEqual(contract.acceptance.focusedGeneration, {
    seedsPerPattern: 64,
    patternCount: 12,
    scenarioCount: 768,
    requiredPassCount: 768,
  });
  assert.deepEqual(contract.acceptance.layoutMatrix, {
    layoutsPerPattern: 18,
    patternCount: 12,
    scenarioCount: 216,
    requiredPassCount: 216,
  });
  assert.deepEqual(contract.acceptance.answerBoundaryMatrix, {
    layouts: ["3x5", "2x6", "1x7"],
    answerStates: ["off", "on"],
    patternCount: 12,
    scenarioCount: 72,
    requiredPassCount: 72,
  });
  assert.equal(contract.acceptance.all22SemanticD0AfterP0, false);
  assert.equal(contract.nextShortestStep, "G5AU02-S100_P0MethodWitnessLanguageAndReasoningFullFix");
});
