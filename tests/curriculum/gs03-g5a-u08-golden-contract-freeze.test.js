import assert from "node:assert/strict";
import test from "node:test";

import { buildGS03GoldenContract } from "../../tools/curriculum/build-gs03-g5a-u08-golden-contract.mjs";
import { validateGS03GoldenContract } from "../../tools/curriculum/validate-gs03-g5a-u08-golden-contract.mjs";

const clone = (value) => structuredClone(value);
const codes = (result) => new Set(result.errors.map((row) => row.code));

test("GS03 freezes the complete G5A-U08 Golden V1 authority snapshot", async () => {
  const contract = await buildGS03GoldenContract();
  const result = await validateGS03GoldenContract(contract);
  assert.equal(result.ok, true, JSON.stringify(result.errors, null, 2));
  assert.equal(contract.goldenContractId, "G5AU08_GOLDEN_V1");
  assert.equal(contract.goldenContractVersion, "1.0.0");
  assert.equal(contract.status, "FROZEN_FOR_GS04_CONSUMPTION");
  assert.equal(contract.authoritySnapshot.length, 20);
  assert.deepEqual(contract.frozenCounts, {
    knowledgePointCount: 11,
    patternGroupCount: 17,
    patternSpecCount: 30,
    numericPatternSpecCount: 19,
    applicationPatternSpecCount: 11,
    generatorPatternSpecUnionCount: 30,
    templateFamilyCount: 10,
    globalContextFamilyCount: 18,
    unitContextBindingCount: 18,
    surfaceTemplateCount: 54,
    seedQACount: 90,
  });
});

test("GS03 rejects a contract version mutation without a new Golden version", async () => {
  const contract = clone(await buildGS03GoldenContract());
  contract.goldenContractVersion = "1.0.1";
  const result = await validateGS03GoldenContract(contract);
  assert.equal(result.ok, false);
  assert.ok(codes(result).has("GS03_GOLDEN_CONTRACT_VERSION_INVALID"));
  assert.ok(codes(result).has("GS03_GOLDEN_SNAPSHOT_DRIFT"));
});

test("GS03 rejects authority hash drift", async () => {
  const contract = clone(await buildGS03GoldenContract());
  contract.authoritySnapshot[0].sha256 = "0".repeat(64);
  const result = await validateGS03GoldenContract(contract);
  assert.equal(result.ok, false);
  assert.ok(codes(result).has("GS03_GOLDEN_SNAPSHOT_DRIFT"));
});

test("GS03 rejects frozen count drift", async () => {
  const contract = clone(await buildGS03GoldenContract());
  contract.frozenCounts.patternSpecCount += 1;
  const result = await validateGS03GoldenContract(contract);
  assert.equal(result.ok, false);
  assert.ok(codes(result).has("GS03_FROZEN_COUNT_DRIFT"));
});

test("GS03 rejects premature GS02 context production or runtime admission", async () => {
  const contract = clone(await buildGS03GoldenContract());
  contract.bindingContract.globalContextProductionSelectableAtFreeze = true;
  contract.bindingContract.globalContextRuntimeResolvableAtFreeze = true;
  const result = await validateGS03GoldenContract(contract);
  assert.equal(result.ok, false);
  assert.ok(codes(result).has("GS03_PREMATURE_GLOBAL_CONTEXT_ADMISSION"));
});

test("GS03 rejects context ownership of unit mathematics", async () => {
  const contract = clone(await buildGS03GoldenContract());
  contract.bindingContract.contextMayChangeMath = true;
  const result = await validateGS03GoldenContract(contract);
  assert.equal(result.ok, false);
  assert.ok(codes(result).has("GS03_CONTEXT_MATH_OWNERSHIP_INVALID"));
});

test("GS03 rejects a new per-unit generator validator renderer or workflow allowance", async () => {
  const contract = clone(await buildGS03GoldenContract());
  contract.extensionPolicy.perUnitNewGeneratorMax = 1;
  contract.extensionPolicy.perUnitNewValidatorMax = 1;
  contract.extensionPolicy.perUnitNewRendererMax = 1;
  contract.extensionPolicy.perUnitNewWorkflowMax = 1;
  const result = await validateGS03GoldenContract(contract);
  assert.equal(result.ok, false);
  assert.ok(codes(result).has("GS03_PER_UNIT_RUNTIME_LIMIT_INVALID"));
});

test("GS03 rejects premature GS04 or GS05 implementation claims", async () => {
  const contract = clone(await buildGS03GoldenContract());
  contract.consumerBoundary.runtimeConsumerImplementedByGS03 = true;
  contract.consumerBoundary.batchAdapterImplementedByGS03 = true;
  contract.consumerBoundary.crossUnitPilotImplementedByGS03 = true;
  const result = await validateGS03GoldenContract(contract);
  assert.equal(result.ok, false);
  assert.ok(codes(result).has("GS03_CONSUMER_BOUNDARY_VIOLATED"));
});

test("GS03 rejects generic fallback or non-blocking validator relaxation", async () => {
  const contract = clone(await buildGS03GoldenContract());
  contract.generatorContract.genericFallbackAllowed = true;
  contract.validatorContract.blockingFailureReturnsOutput = true;
  const result = await validateGS03GoldenContract(contract);
  assert.equal(result.ok, false);
  assert.ok(codes(result).has("GS03_GENERATOR_SAFETY_CONTRACT_INVALID"));
  assert.ok(codes(result).has("GS03_VALIDATOR_FAIL_CLOSED_CONTRACT_INVALID"));
});
