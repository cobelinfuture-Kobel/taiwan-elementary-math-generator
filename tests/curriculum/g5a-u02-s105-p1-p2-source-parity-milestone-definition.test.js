import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const CONTRACT_PATH = new URL(
  "../../data/curriculum/contracts/G5AU02_S105_P1P2SourceParityMilestoneDefinition.json",
  import.meta.url,
);
const AUDIT_PATH = new URL(
  "../../data/curriculum/audits/G5AU02_S98_All22SourceMethodAndRepresentationParityAudit.json",
  import.meta.url,
);
const P0_PATH = new URL(
  "../../data/curriculum/contracts/G5AU02_S99_P0SourceMethodAndRepresentationFullFixContract.json",
  import.meta.url,
);
const DISPLAY_PATH = new URL(
  "../../src/curriculum/g5a-u02/question-display-model.js",
  import.meta.url,
);
const RENDERER_PATH = new URL(
  "../../site/modules/renderer/g5a-u02-s101-public-renderer.js",
  import.meta.url,
);

async function loadJson(url) {
  return JSON.parse(await readFile(url, "utf8"));
}

function rows(contract) {
  return [...contract.patternContracts, ...contract.regressionOnlyContracts]
    .map((row) => ({
      patternOrder: row.patternOrder,
      patternSpecId: row.patternSpecId,
      priority: row.priority,
    }))
    .sort((left, right) => left.patternOrder - right.patternOrder);
}

test("S105 consumes exactly the ten remaining S98 P1/P2 patterns", async () => {
  const [contract, audit, p0] = await Promise.all([
    loadJson(CONTRACT_PATH),
    loadJson(AUDIT_PATH),
    loadJson(P0_PATH),
  ]);
  const expected = audit.patternAudits
    .filter((row) => row.priority === "P1" || row.priority === "P2")
    .map((row) => ({
      patternOrder: row.patternOrder,
      patternSpecId: row.patternSpecId,
      priority: row.priority,
    }))
    .sort((left, right) => left.patternOrder - right.patternOrder);

  assert.equal(contract.schemaName, "G5AU02P1P2SourceParityMilestoneDefinition");
  assert.equal(contract.task, "G5AU02-S105_P1P2SourceParityMilestoneDefinition");
  assert.equal(contract.inputs.remainingPatternCount, 10);
  assert.equal(contract.inputs.p1PatternCount, 6);
  assert.equal(contract.inputs.p2PatternCount, 4);
  assert.equal(contract.patternContracts.length, 7);
  assert.equal(contract.regressionOnlyContracts.length, 3);
  assert.deepEqual(rows(contract), expected);

  const p0Orders = new Set(p0.patternContracts.map((row) => row.patternOrder));
  assert.ok(rows(contract).every((row) => !p0Orders.has(row.patternOrder)));
  assert.equal(new Set([...p0Orders, ...rows(contract).map((row) => row.patternOrder)]).size, 22);
});

test("S105 records the post-S104 current display-model and renderer gaps", async () => {
  const [contract, displaySource, rendererSource] = await Promise.all([
    loadJson(CONTRACT_PATH),
    readFile(DISPLAY_PATH, "utf8"),
    readFile(RENDERER_PATH, "utf8"),
  ]);

  assert.equal(contract.currentStateSnapshot.p0Status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(contract.currentStateSnapshot.p0PatternCount, 12);
  assert.equal(contract.currentStateSnapshot.all22SemanticD0, false);
  assert.deepEqual(
    contract.currentStateSnapshot.currentStructuredDisplayModels.map((row) => [row.patternOrder, row.currentKind]),
    [
      [6, "masked_factor_sequence"],
      [7, "candidate_selection"],
      [12, "symbolic_complete_factor_sequence"],
      [15, "candidate_selection"],
    ],
  );
  assert.deepEqual(
    contract.currentStateSnapshot.currentPlainPromptPatterns.map((row) => row.patternOrder),
    [3, 5, 14],
  );
  assert.deepEqual(contract.currentStateSnapshot.p2RegressionOnlyPatterns, [10, 18, 19]);

  for (const token of [
    'kind: "masked_factor_sequence"',
    'kind: "candidate_selection"',
    'kind: "symbolic_complete_factor_sequence"',
  ]) {
    assert.ok(displaySource.includes(token), `current display token missing: ${token}`);
  }
  assert.ok(rendererSource.includes('const PUBLIC_SYMBOL_KINDS = new Set(["symbolic_complete_factor_sequence"])'));
  for (const row of contract.displayModelKinds) {
    assert.equal(displaySource.includes(`kind: "${row.kind}"`), false, `${row.kind} implemented during planning`);
    assert.equal(rendererSource.includes(`"${row.kind}"`), false, `${row.kind} renderer implemented during planning`);
  }
});

test("S105 is planning-only and freezes accepted P0 plus regression-only P2 behavior", async () => {
  const contract = await loadJson(CONTRACT_PATH);
  const invariants = contract.globalInvariants;

  assert.equal(invariants.patternSpecIdsStable, true);
  assert.equal(invariants.knowledgePointIdsStable, true);
  assert.equal(invariants.patternGroupIdsStable, true);
  assert.equal(invariants.formalMappingIdsStable, true);
  assert.equal(invariants.sourcePacketIdsStable, true);
  assert.equal(invariants.p0AcceptedBehaviorImmutable, true);
  assert.equal(invariants.p0AcceptanceMatricesRemainBlocking, true);
  assert.equal(invariants.freeFormAI, "forbidden");
  assert.equal(invariants.genericFallback, "forbidden");
  assert.equal(invariants.runtimeWebSearch, "forbidden");
  assert.equal(invariants.deterministicGenerationRequired, true);
  assert.equal(invariants.canonicalAnswerRecomputationRequired, true);
  assert.equal(invariants.learnerVisibleUniqueSolutionRequired, true);
  assert.equal(invariants.answerLeakageForbidden, true);
  assert.equal(invariants.crossUnitChangeForbidden, true);
  assert.equal(invariants.gctxFileChangeForbidden, true);
  assert.equal(invariants.runtimeImplementationAllowedInS105, false);
  assert.equal(invariants.rendererImplementationAllowedInS105, false);
  assert.equal(invariants.browserBundleChangeAllowedInS105, false);
  assert.equal(invariants.p2RegressionOnlyRuntimeMutationForbidden, true);
  assert.ok(contract.regressionOnlyContracts.every((row) => row.runtimeMutationAllowed === false));
});

test("S105 assigns seven repair patterns one exact display model and blocking validator set", async () => {
  const contract = await loadJson(CONTRACT_PATH);
  const displayKinds = new Set(contract.displayModelKinds.map((row) => row.kind));

  assert.equal(displayKinds.size, 7);
  assert.deepEqual(
    contract.patternContracts.map((row) => row.patternOrder),
    [3, 5, 6, 7, 12, 15, 14],
  );
  for (const row of contract.patternContracts) {
    assert.ok(displayKinds.has(row.requiredDisplayModelKind), `${row.patternSpecId} display kind missing`);
    assert.ok(Array.isArray(row.requiredFixes) && row.requiredFixes.length >= 3);
    assert.ok(Array.isArray(row.blockingValidatorCodes) && row.blockingValidatorCodes.length >= 2);
    const prefix = row.priority === "P1" ? "G5AU02_P1_" : "G5AU02_P2_";
    assert.ok(row.blockingValidatorCodes.every((code) => code.startsWith(prefix)));
    assert.ok(Array.isArray(row.sourceEvidence) && row.sourceEvidence.length >= 1);
  }
});

test("S105 source evidence and priorities remain traceable to S98", async () => {
  const [contract, audit] = await Promise.all([loadJson(CONTRACT_PATH), loadJson(AUDIT_PATH)]);
  const auditByOrder = new Map(audit.patternAudits.map((row) => [row.patternOrder, row]));

  for (const row of [...contract.patternContracts, ...contract.regressionOnlyContracts]) {
    const source = auditByOrder.get(row.patternOrder);
    assert.ok(source, `S98 row missing: ${row.patternOrder}`);
    assert.equal(row.patternSpecId, source.patternSpecId);
    assert.equal(row.priority, source.priority);
    const normalizedEvidence = source.sourceEvidence.map((ref) => (
      ref.startsWith("g5a_u02_") ? ref : `${source.sourcePacketId}:${ref}`
    ));
    assert.deepEqual(row.sourceEvidence, normalizedEvidence);
  }
});

test("S105 milestones partition the remaining ten patterns exactly once before all-22 acceptance", async () => {
  const contract = await loadJson(CONTRACT_PATH);
  assert.deepEqual(
    contract.implementationMilestones.map((row) => row.milestoneId),
    ["S106", "S107", "S108", "S109", "S110"],
  );

  const bounded = contract.implementationMilestones
    .filter((row) => row.milestoneId !== "S110")
    .flatMap((row) => row.patternOrders);
  assert.equal(bounded.length, 10);
  assert.equal(new Set(bounded).size, 10);
  assert.deepEqual(
    [...bounded].sort((left, right) => left - right),
    rows(contract).map((row) => row.patternOrder),
  );
  assert.deepEqual(contract.implementationMilestones.at(-1).patternOrders, Array.from({ length: 22 }, (_, index) => index + 1));
});

test("S105 locks remaining and all-22 acceptance arithmetic exactly", async () => {
  const contract = await loadJson(CONTRACT_PATH);
  assert.deepEqual(contract.acceptance.remainingFocusedGeneration, {
    seedsPerPattern: 64,
    patternCount: 10,
    scenarioCount: 640,
    requiredPassCount: 640,
    runtimeRepairPatternCount: 7,
    regressionOnlyPatternCount: 3,
  });
  assert.deepEqual(contract.acceptance.remainingLayoutMatrix, {
    layoutsPerPattern: 18,
    patternCount: 10,
    scenarioCount: 180,
    requiredPassCount: 180,
  });
  assert.deepEqual(contract.acceptance.remainingAnswerBoundaryMatrix, {
    layouts: ["3x5", "2x6", "1x7"],
    answerStates: ["off", "on"],
    patternCount: 10,
    scenarioCount: 60,
    requiredPassCount: 60,
  });
  assert.deepEqual(contract.acceptance.all22FinalItemIntegration, {
    seedsPerPattern: 64,
    patternCount: 22,
    scenarioCount: 1408,
    requiredPassCount: 1408,
  });
  assert.deepEqual(contract.acceptance.all22FinalLayoutMatrix, {
    layoutsPerPattern: 18,
    patternCount: 22,
    scenarioCount: 396,
    requiredPassCount: 396,
  });
  assert.deepEqual(contract.acceptance.all22FinalAnswerBoundaryMatrix, {
    layouts: ["3x5", "2x6", "1x7"],
    answerStates: ["off", "on"],
    patternCount: 22,
    scenarioCount: 132,
    requiredPassCount: 132,
  });
  assert.equal(contract.acceptance.all22SemanticD0AfterS105, false);
  assert.equal(contract.nextShortestStep, "G5AU02-S106_P1FactorPairSymmetryAndMaskedTableFullFix");
  assert.equal(contract.nextStepRequiresImplementationApproval, true);
});
