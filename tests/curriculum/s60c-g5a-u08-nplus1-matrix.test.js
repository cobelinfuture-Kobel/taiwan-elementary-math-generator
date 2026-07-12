import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const CONTRACT_PATH = new URL(
  "../../data/curriculum/contracts/S60C_G5A_U08_NBaselineAndNPlus1SemanticDeltaMatrix.json",
  import.meta.url,
);

function loadContract() {
  return JSON.parse(readFileSync(CONTRACT_PATH, "utf8"));
}

test("S60C gives all 11 KPs an explicit N baseline", () => {
  const contract = loadContract();
  assert.equal(contract.knowledgePointMatrix.length, 11);
  assert.equal(new Set(contract.knowledgePointMatrix.map((row) => row.knowledgePointId)).size, 11);
  for (const row of contract.knowledgePointMatrix) {
    assert.ok(row.nBaseline.length > 30, `${row.knowledgePointId} needs a concrete N baseline`);
    assert.ok(row.nRepresentations.length > 0);
  }
});

test("S60C requires exactly one allowlisted delta for N+1 and disables N+2 in core", () => {
  const contract = loadContract();
  assert.equal(contract.policy.maxSemanticDeltaPerItem, 1);
  assert.equal(contract.policy.nRequiresSemanticDeltaCount, 0);
  assert.equal(contract.policy.nPlus1RequiresSemanticDeltaCount, 1);
  assert.equal(contract.policy.nPlus2EnabledInCore, false);
  assert.equal(contract.generationPolicy.semanticDeltaCountMustMatchDepth, true);
  assert.equal(contract.acceptance.accidentalNPlus2Allowed, false);
});

test("S60C covers all eight semantic deltas and only assigns registered deltas", () => {
  const contract = loadContract();
  const deltaIds = contract.semanticDeltas.map((row) => row.semanticDeltaId);
  const used = new Set(
    contract.knowledgePointMatrix.flatMap((row) => row.allowedNPlus1SemanticDeltaIds),
  );

  assert.equal(deltaIds.length, 8);
  assert.equal(new Set(deltaIds).size, 8);
  assert.deepEqual([...used].sort(), [...deltaIds].sort());

  for (const row of contract.knowledgePointMatrix) {
    for (const deltaId of row.allowedNPlus1SemanticDeltaIds) {
      assert.equal(deltaIds.includes(deltaId), true, `${deltaId} is registered`);
    }
    if (row.applicationCapable) {
      assert.ok(row.allowedNPlus1SemanticDeltaIds.length > 0, `${row.knowledgePointId} has N+1 coverage`);
      assert.ok(row.nPlus1Definition);
    } else {
      assert.deepEqual(row.allowedNPlus1SemanticDeltaIds, []);
      assert.equal(row.nPlus1Definition, null);
    }
  }
});

test("S60C keeps formal equations optional and elementary solutions mandatory", () => {
  const contract = loadContract();
  assert.equal(contract.policy.formalXEquationRequired, false);
  assert.equal(contract.policy.elementaryArithmeticSolutionPathRequired, true);
  assert.equal(contract.acceptance.formalXEquationRequired, false);
  assert.equal(contract.acceptance.elementaryArithmeticSolutionPathRequired, true);
  assert.deepEqual(contract.generationPolicy.coreAllowedDepths, ["N", "N_PLUS_1"]);
  assert.deepEqual(contract.generationPolicy.challengeOnlyDepths, ["N_PLUS_2"]);
});
