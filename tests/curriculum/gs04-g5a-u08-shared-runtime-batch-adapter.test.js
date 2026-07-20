import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  BATCH_A_SELECTION_MODES,
  createConfigState,
  setBatchAGenerationSeed,
  setBatchAIncludeAnswerKey,
  setBatchAQuestionCount,
  setBatchASelectionMode,
  setBatchASourceId,
} from "../../site/assets/browser/state/config-state.js";
import { buildWorksheetDocumentFromState } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  adaptGlobalPublicSourceUnitPlan,
  validateGlobalPublicSourceUnitAdapters,
} from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter.js";
import {
  applyGoldenRuntimeContract,
  validateGoldenRuntimeDescriptor,
} from "../../site/modules/curriculum/golden/golden-runtime-contract.js";
import {
  G5A_U08_GOLDEN_RUNTIME_DESCRIPTOR,
  getGoldenRuntimeDescriptor,
  listGoldenRuntimeDescriptors,
  validateGoldenRuntimeRegistry,
} from "../../site/modules/curriculum/registry/golden-runtime-units.js";

const goldenContract = JSON.parse(readFileSync(
  new URL("../../data/curriculum/golden/G5AU08_GOLDEN_V1.contract.json", import.meta.url),
  "utf8",
));

function sourceUnitState(questionCount = 30, includeAnswerKey = true) {
  const state = createConfigState();
  setBatchASourceId(state, "g5a_u08_5a08");
  setBatchASelectionMode(state, BATCH_A_SELECTION_MODES.SOURCE_UNIT);
  setBatchAQuestionCount(state, questionCount);
  setBatchAIncludeAnswerKey(state, includeAnswerKey);
  setBatchAGenerationSeed(state, `gs04:g5a-u08:${questionCount}:${includeAnswerKey}`);
  return state;
}

function issueCodes(result) {
  return [
    ...(result?.errors ?? []),
    ...(result?.validation?.errors ?? []),
  ].map((entry) => entry?.code ?? entry);
}

test("GS04 browser descriptor matches the frozen G5AU08_GOLDEN_V1 identity and counts", () => {
  assert.deepEqual(validateGoldenRuntimeDescriptor(G5A_U08_GOLDEN_RUNTIME_DESCRIPTOR), { ok: true, errors: [] });
  assert.deepEqual(validateGoldenRuntimeRegistry(), {
    ok: true,
    errors: [],
    registryVersion: "gs04-golden-runtime-registry-v1",
    descriptorCount: 1,
  });
  assert.equal(listGoldenRuntimeDescriptors().length, 1);
  assert.equal(getGoldenRuntimeDescriptor("g5a_u08_5a08"), G5A_U08_GOLDEN_RUNTIME_DESCRIPTOR);
  assert.equal(G5A_U08_GOLDEN_RUNTIME_DESCRIPTOR.goldenContractId, goldenContract.goldenContractId);
  assert.equal(G5A_U08_GOLDEN_RUNTIME_DESCRIPTOR.goldenContractVersion, goldenContract.goldenContractVersion);
  assert.equal(G5A_U08_GOLDEN_RUNTIME_DESCRIPTOR.goldenContractStatus, goldenContract.status);
  assert.deepEqual(G5A_U08_GOLDEN_RUNTIME_DESCRIPTOR.expectedCounts, {
    knowledgePointCount: goldenContract.frozenCounts.knowledgePointCount,
    patternGroupCount: goldenContract.frozenCounts.patternGroupCount,
    patternSpecCount: goldenContract.frozenCounts.patternSpecCount,
  });
  assert.deepEqual(
    G5A_U08_GOLDEN_RUNTIME_DESCRIPTOR.requiredQuestionFields,
    goldenContract.schemaContract.requiredQuestionFields,
  );
});

test("GS04 shared source-unit adapter selects the complete frozen G5A-U08 authority", () => {
  assert.deepEqual(validateGlobalPublicSourceUnitAdapters(), { ok: true, errors: [] });
  const adapted = adaptGlobalPublicSourceUnitPlan({
    sourceId: "g5a_u08_5a08",
    selectionMode: "sourceUnit",
    questionCount: 30,
    includeAnswerKey: true,
  });
  assert.equal(adapted.applied, true);
  assert.equal(adapted.plan.publicSelectionMode, "sourceUnit");
  assert.equal(adapted.plan.selectionMode, "mixedKnowledgePointsSameUnit");
  assert.equal(adapted.plan.selectedKnowledgePointIds.length, 11);
  assert.equal(adapted.plan.selectedPatternGroupIds.length, 17);
  assert.equal(adapted.plan.sourceUnitAdapter.goldenContractId, "G5AU08_GOLDEN_V1");
  assert.equal(adapted.plan.sourceUnitAdapter.goldenContractVersion, "1.0.0");
  assert.equal(adapted.plan.sourceUnitAdapter.patternSpecCount, 30);
  assert.equal(adapted.plan.genericFallback, false);
  assert.equal(adapted.plan.freeFormAI, false);
});

test("GS04 public sourceUnit path consumes Golden runtime without copying generator validator or renderer", { timeout: 30_000 }, () => {
  const result = buildWorksheetDocumentFromState(sourceUnitState(30, true));
  assert.equal(result.ok, true, JSON.stringify(issueCodes(result)));
  assert.equal(result.goldenRuntime.accepted, true);
  assert.equal(result.goldenRuntime.adapterApplied, true);
  assert.equal(result.goldenRuntime.goldenContractId, "G5AU08_GOLDEN_V1");
  assert.equal(result.goldenRuntime.goldenContractVersion, "1.0.0");
  assert.equal(result.goldenRuntime.generatedQuestionCount, 30);

  const document = result.worksheetDocument;
  assert.equal(document.generatedQuestions.length, 30);
  assert.equal(document.answerKeyItems.length, 30);
  assert.equal(document.goldenRuntime.accepted, true);
  assert.equal(document.metadata.goldenRuntime.accepted, true);
  assert.equal(document.summary.goldenRuntimeAccepted, true);
  assert.equal(document.publicControls.goldenContractId, "G5AU08_GOLDEN_V1");
  assert.equal(document.provenance.goldenRuntimeConsumerVersion, "gs04-golden-runtime-consumer-v1");
  assert.equal(document.provenance.genericFallbackUsed, false);
  assert.equal(document.provenance.freeFormAIUsed, false);
  assert.equal(new Set(document.generatedQuestions.map((question) => question.knowledgePointId)).size, 11);
  assert.ok(new Set(document.generatedQuestions.map((question) => question.resolvedPatternGroupId ?? question.patternGroupId)).size >= 11);
  assert.ok(document.generatedQuestions.every((question) => question.fallbackUsed === false));
  assert.ok(document.generatedQuestions.every((question) => question.genericFallbackAllowed === false));
});

test("GS04 answer-key-off path remains Golden accepted and emits zero answer rows", { timeout: 30_000 }, () => {
  const result = buildWorksheetDocumentFromState(sourceUnitState(18, false));
  assert.equal(result.ok, true, JSON.stringify(issueCodes(result)));
  assert.equal(result.goldenRuntime.accepted, true);
  assert.equal(result.worksheetDocument.generatedQuestions.length, 18);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 0);
  assert.equal(result.worksheetDocument.answerKeyPages.length, 0);
});

test("GS04 shared consumer blocks output outside frozen KP PatternGroup or PatternSpec authority", { timeout: 30_000 }, () => {
  const accepted = buildWorksheetDocumentFromState(sourceUnitState(18, true));
  assert.equal(accepted.ok, true, JSON.stringify(issueCodes(accepted)));
  const tampered = structuredClone(accepted);
  tampered.worksheetDocument.generatedQuestions[0].patternSpecId = "ps_outside_golden_contract";
  const blocked = applyGoldenRuntimeContract(
    tampered,
    { sourceId: "g5a_u08_5a08", sourceUnitAdapter: { applied: true, version: "test" } },
    G5A_U08_GOLDEN_RUNTIME_DESCRIPTOR,
  );
  assert.equal(blocked.ok, false);
  assert.equal(blocked.worksheetDocument, null);
  assert.ok(issueCodes(blocked).includes("GOLDEN_RUNTIME_PATTERN_OUTSIDE_CONTRACT"));
});

test("GS04 preserves existing non-Golden source-unit adapters", () => {
  const g4b = adaptGlobalPublicSourceUnitPlan({ sourceId: "g4b_u04_4b04", selectionMode: "sourceUnit" });
  const g5aU02 = adaptGlobalPublicSourceUnitPlan({ sourceId: "g5a_u02_5a02", selectionMode: "sourceUnit" });
  assert.equal(g4b.applied, true);
  assert.equal(g4b.plan.selectedKnowledgePointIds.length, 13);
  assert.equal(g5aU02.applied, true);
  assert.equal(g5aU02.plan.selectedKnowledgePointIds.length, 18);
  assert.equal(g4b.plan.goldenRuntimeRequest, undefined);
  assert.equal(g5aU02.plan.goldenRuntimeRequest, undefined);
});
