import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { consumeGoldenRuntimeContract } from "../../site/modules/curriculum/golden/shared-golden-runtime-consumer.js";
import {
  G5AU08_GOLDEN_V1_RUNTIME_DESCRIPTOR,
  listGlobalPublicSourceUnitAdapterDescriptors,
  validateGlobalPublicSourceUnitAdapterRegistry,
} from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter-registry.js";
import {
  adaptGlobalPublicSourceUnitPlan,
  validateGlobalPublicSourceUnitAdapters,
} from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s60j-extension.js";

const CONTRACT_PATH = new URL("../../data/curriculum/golden/G5AU08_GOLDEN_V1.contract.json", import.meta.url);

test("GS04 descriptor exactly reflects the frozen GS03 contract", async () => {
  const contract = JSON.parse(await readFile(CONTRACT_PATH, "utf8"));
  const row = G5AU08_GOLDEN_V1_RUNTIME_DESCRIPTOR;
  assert.deepEqual({
    id: row.goldenContractId,
    version: row.goldenContractVersion,
    status: row.contractStatus,
    sourceId: row.sourceId,
    authorityFileCount: row.authorityFileCount,
    counts: row.frozenCounts,
    limits: row.perUnitRuntimeLimits,
    generator: row.runtimeModules.generator,
    validator: row.runtimeModules.validator,
    renderer: row.runtimeModules.renderer,
  }, {
    id: contract.goldenContractId,
    version: contract.goldenContractVersion,
    status: contract.status,
    sourceId: contract.sourceId,
    authorityFileCount: contract.authoritySnapshot.length,
    counts: {
      knowledgePointCount: contract.frozenCounts.knowledgePointCount,
      patternGroupCount: contract.frozenCounts.patternGroupCount,
      patternSpecCount: contract.frozenCounts.patternSpecCount,
    },
    limits: {
      generator: contract.extensionPolicy.perUnitNewGeneratorMax,
      validator: contract.extensionPolicy.perUnitNewValidatorMax,
      renderer: contract.extensionPolicy.perUnitNewRendererMax,
      workflow: contract.extensionPolicy.perUnitNewWorkflowMax,
    },
    generator: [contract.generatorContract.numericModule, contract.generatorContract.applicationModule],
    validator: [contract.validatorContract.numericModule, contract.validatorContract.applicationModule],
    renderer: contract.rendererContract.module,
  });
});

test("GS04 Golden consumer accepts v1 and fails closed on drift", () => {
  const accepted = consumeGoldenRuntimeContract(G5AU08_GOLDEN_V1_RUNTIME_DESCRIPTOR, "g5a_u08_5a08");
  assert.equal(accepted.ok, true);
  assert.equal(accepted.consumer.connectionStatus, "FROZEN_AND_CONNECTED_TO_EXISTING_SHARED_RUNTIME");
  assert.deepEqual(accepted.consumer.runtimeReusePolicy, {
    newGeneratorAllowed: false,
    newValidatorAllowed: false,
    newRendererAllowed: false,
    newUnitWorkflowAllowed: false,
  });
  assert.equal(accepted.consumer.globalContextAdmission.runtimeResolvable, false);

  const rejected = consumeGoldenRuntimeContract({
    ...G5AU08_GOLDEN_V1_RUNTIME_DESCRIPTOR,
    goldenContractVersion: "2.0.0",
  }, "g5a_u08_5a08");
  assert.equal(rejected.ok, false);
  assert.ok(rejected.errors.some(({ code }) => code === "GS04_GOLDEN_CONTRACT_VERSION_UNSUPPORTED"));
});

test("GS04 registry is shared and preserves legacy adapters", () => {
  const registry = validateGlobalPublicSourceUnitAdapterRegistry();
  assert.equal(registry.ok, true, registry.errors.join("\n"));
  assert.equal(registry.affectedUnitCount, 3);
  assert.deepEqual(listGlobalPublicSourceUnitAdapterDescriptors().map(({ sourceId }) => sourceId).sort(), [
    "g4b_u04_4b04", "g5a_u02_5a02", "g5a_u08_5a08",
  ]);

  for (const [sourceId, adapterId, kp, pg] of [
    ["g4b_u04_4b04", "g4b_u04_all_promoted_canonical", 13, 13],
    ["g5a_u02_5a02", "g5a_u02_all_promoted_dynamic", 18, 18],
  ]) {
    const adapted = adaptGlobalPublicSourceUnitPlan({ sourceId, selectionMode: "sourceUnit" });
    assert.equal(adapted.adapter.adapterId, adapterId);
    assert.equal(adapted.plan.selectedKnowledgePointIds.length, kp);
    assert.equal(adapted.plan.selectedPatternGroupIds.length, pg);
  }
});

test("GS04 G5A-U08 source-unit plan reaches existing S60J runtime", () => {
  const adapted = adaptGlobalPublicSourceUnitPlan({
    sourceId: "g5a_u08_5a08",
    selectionMode: "sourceUnit",
    questionCount: 6,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "gs04-shared-runtime-smoke",
  });
  assert.equal(adapted.applied, true);
  assert.equal(adapted.blocked, false);
  assert.equal(adapted.adapter.adapterId, "g5a_u08_golden_v1_shared_runtime");
  assert.equal(adapted.plan.selectedKnowledgePointIds.length, 11);
  assert.equal(adapted.plan.selectedPatternGroupIds.length, 17);
  assert.equal(adapted.plan.goldenRuntimeConsumer.globalContextAdmission.runtimeResolvable, false);

  const result = buildBatchABrowserWorksheetDocument(adapted.plan);
  assert.equal(result.ok, true, JSON.stringify(result.errors ?? []));
  assert.equal(result.worksheetDocument.generatedQuestions.length, 6);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 6);
  assert.equal(result.worksheetDocument.productionUse, "allowed");
  assert.ok(result.worksheetDocument.provenance.sourceTaskIds.includes("S60J_G5A_U08_WorksheetAnswerKeyAndRendererIntegration"));
});

test("GS04 aggregate shared adapter audit passes", () => {
  const audit = validateGlobalPublicSourceUnitAdapters();
  assert.equal(audit.ok, true, audit.errors.join("\n"));
  assert.equal(audit.affectedUnitCount, 3);
});
