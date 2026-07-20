import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  adaptGlobalPublicSourceUnitPlan,
  validateGlobalPublicSourceUnitAdapters,
} from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter.js";
import {
  G3AU01_POSTG_GOLDEN_RUNTIME_DESCRIPTOR,
  resolveGlobalPublicSourceUnitAdapterDescriptor,
  validateGlobalPublicSourceUnitAdapterRegistry,
} from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter-registry.js";
import {
  generateBatchABrowserQuestions,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import {
  validateBatchABrowserQuestions,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-validator.js";
import {
  buildBatchABrowserWorksheetDocument,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import {
  auditPostGoldenPatternLineage,
  attachPostGoldenQuestionLineage,
} from "../../site/modules/curriculum/golden/post-golden-question-lineage.js";
import {
  consumeGoldenRuntimeContract,
} from "../../site/modules/curriculum/golden/shared-golden-runtime-consumer.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const SOURCE_ID = "g3a_u01_3a01";
const KNOWLEDGE_PATH = new URL(
  "../../data/curriculum/knowledge/units/g3a_u01_3a01.knowledge-operation.json",
  import.meta.url,
);
const GOLDEN_REGISTRY_PATH = new URL(
  "../../data/curriculum/golden/G5AU08_GOLDEN_V1.unit-conformance.json",
  import.meta.url,
);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function explicitGoldenPlan(overrides = {}) {
  const adaptation = adaptGlobalPublicSourceUnitPlan({
    sourceId: SOURCE_ID,
    selectionMode: "sourceUnit",
    questionCount: 40,
    ordering: "shuffleAcrossPatterns",
    includeAnswerKey: true,
    generationSeed: "postg-mig-a01-g3a-u01",
    goldenContractId: "G5AU08_GOLDEN_V1",
    goldenContractVersion: "1.0.0",
    goldenRuntimeMode: "shadow",
    ...overrides,
  });
  assert.equal(adaptation.blocked, false, JSON.stringify(adaptation.errors));
  assert.equal(adaptation.applied, true);
  return adaptation.plan;
}

test("A01 maps the exact 8 G3A-U01 KnowledgePoints and 20 PatternSpecs", async () => {
  const registry = await readJson(KNOWLEDGE_PATH);
  const visibleKnowledgePoints = listVisibleBatchAKnowledgePoints()
    .filter((row) => row.sourceId === SOURCE_ID);
  const visiblePatternSpecs = new Set(visibleKnowledgePoints.flatMap((row) =>
    getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId)
      .flatMap((group) => group.patternSpecIds ?? [])));
  const boundPatternSpecs = new Set(registry.existingQuestionBindings.map((row) => row.questionId));
  const registeredKnowledgePoints = new Set(registry.knowledgePoints.map((row) => row.knowledgePointId));

  assert.equal(visibleKnowledgePoints.length, 8);
  assert.equal(visiblePatternSpecs.size, 20);
  assert.equal(registry.knowledgePoints.length, 8);
  assert.equal(registry.existingQuestionBindings.length, 20);
  assert.deepEqual(registeredKnowledgePoints, new Set(visibleKnowledgePoints.map((row) => row.knowledgePointId)));
  assert.deepEqual(boundPatternSpecs, visiblePatternSpecs);
  assert.equal(registry.knowledgeRegistryState, "QUESTION_BINDINGS_COMPLETE");
  assert.equal(registry.coverage.numeric, "COMPLETE");
  assert.equal(registry.coverage.application, "UNASSESSED");

  const modelIds = new Set();
  for (const knowledgePoint of registry.knowledgePoints) {
    assert.equal(knowledgePoint.operationModels.length, 1);
    const model = knowledgePoint.operationModels[0];
    assert.equal(modelIds.has(model.modelId), false, model.modelId);
    modelIds.add(model.modelId);
    assert.ok(model.canonicalExpressions.length > 0);
    assert.ok(Object.keys(model.operandRoles).length > 0);
    assert.ok(model.unknownRoles.length > 0);
    assert.ok(model.validationInvariants.length > 0);
  }
  assert.equal(modelIds.size, 8);

  const kpIds = new Set(registry.knowledgePoints.map((row) => row.knowledgePointId));
  const operationIds = new Set(registry.knowledgePoints.flatMap((row) =>
    row.operationModels.map((model) => model.modelId)));
  for (const binding of registry.existingQuestionBindings) {
    assert.equal(kpIds.has(binding.knowledgePointId), true, binding.questionId);
    assert.equal(operationIds.has(binding.operationModelId), true, binding.questionId);
  }
});

test("A01 shared adapter keeps public default unchanged and connects explicit Golden candidate", () => {
  const registryAudit = validateGlobalPublicSourceUnitAdapterRegistry();
  assert.equal(registryAudit.ok, true, JSON.stringify(registryAudit.errors));
  assert.equal(registryAudit.affectedUnitCount, 4);

  const defaultRoute = adaptGlobalPublicSourceUnitPlan({
    sourceId: SOURCE_ID,
    selectionMode: "sourceUnit",
  });
  assert.equal(defaultRoute.applied, false);
  assert.equal(defaultRoute.blocked, false);
  assert.equal(defaultRoute.adapter, null);

  const plan = explicitGoldenPlan();
  assert.equal(plan.selectionMode, "mixedKnowledgePointsSameUnit");
  assert.equal(plan.selectedKnowledgePointIds.length, 8);
  assert.equal(plan.selectedPatternGroupIds.length, 8);
  assert.equal(plan.patternSpecIds.length, 20);
  assert.equal(
    plan.goldenRuntimeConsumer.connectionStatus,
    "POST_GOLDEN_UNIT_CONNECTED_TO_EXISTING_SHARED_RUNTIME",
  );
  assert.equal(plan.sourceUnitAdapter.patternSpecCount, 20);
  assert.equal(plan.sourceUnitAdapter.goldenDescriptorMode, "post_golden_unit_conformance");

  const allAdapters = validateGlobalPublicSourceUnitAdapters();
  assert.equal(allAdapters.ok, true, JSON.stringify(allAdapters.errors));
});

test("A01 shared question lineage binds every generated question to KP, group and PatternSpec", () => {
  const plan = explicitGoldenPlan();
  const generated = generateBatchABrowserQuestions(plan);
  assert.equal(generated.ok, true, JSON.stringify(generated.errors, null, 2));
  assert.equal(generated.questions.length, 40);
  assert.equal(new Set(generated.questions.map((row) => row.patternSpecId)).size, 20);
  assert.equal(new Set(generated.questions.map((row) => row.knowledgePointId)).size, 8);
  assert.equal(new Set(generated.questions.map((row) => row.patternGroupId)).size, 8);
  assert.equal(generated.postGoldenQuestionLineage.questionCount, 40);
  assert.equal(generated.postGoldenQuestionLineage.mappedPatternSpecCount, 20);

  for (const question of generated.questions) {
    assert.equal(question.sourceId, SOURCE_ID);
    assert.ok(question.knowledgePointId?.startsWith("kp_g3a_u01_"));
    assert.ok(question.patternGroupId?.startsWith("pg_g3a_u01_"));
    assert.equal(question.resolvedPatternGroupId, question.patternGroupId);
    assert.equal(question.metadata.goldenContractId, "G5AU08_GOLDEN_V1");
    assert.equal(
      question.metadata.goldenConnectionStatus,
      "POST_GOLDEN_UNIT_CONNECTED_TO_EXISTING_SHARED_RUNTIME",
    );
  }

  const validation = validateBatchABrowserQuestions(generated.questions);
  assert.equal(validation.ok, true, JSON.stringify(validation.errors, null, 2));
  assert.equal(validation.errors.length, 0);

  const lineageAudit = auditPostGoldenPatternLineage(SOURCE_ID);
  assert.equal(lineageAudit.ok, true, JSON.stringify(lineageAudit.errors));
  assert.equal(lineageAudit.knowledgePointCount, 8);
  assert.equal(lineageAudit.patternSpecCount, 20);
});

test("A01 existing shared worksheet assembles 40 validated questions and answer-key items", () => {
  const plan = explicitGoldenPlan({
    ordering: "groupedByPattern",
    printLayout: {
      paperSize: "A4",
      columns: 2,
      rowsPerPage: 5,
      showQuestionNumbers: true,
      showAnswerKeyPage: true,
    },
    title: "3A-U01 10000以內的數｜Golden Conformance",
  });
  const result = buildBatchABrowserWorksheetDocument(plan);
  assert.equal(result.ok, true, JSON.stringify(result.errors, null, 2));
  assert.equal(result.worksheetDocument.batchA.sourceId, SOURCE_ID);
  assert.equal(result.worksheetDocument.generatedQuestions.length, 40);
  assert.equal(result.worksheetDocument.questionDisplayModels.length, 40);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 40);
  assert.ok(result.worksheetDocument.questionPages.length > 0);
  assert.ok(result.worksheetDocument.answerKeyPages.length > 0);
  assert.equal(result.validation.errors.length, 0);
  assert.equal(
    new Set(result.worksheetDocument.generatedQuestions.map((row) => row.patternSpecId)).size,
    20,
  );
});

test("A01 leaves the three existing Golden anchor states unchanged", async () => {
  const goldenRegistry = await readJson(GOLDEN_REGISTRY_PATH);
  const anchors = new Map(goldenRegistry.rows
    .filter((row) => ["g3b_u04_3b04", "g5a_u08_5a08", "g5a_u02_5a02"].includes(row.sourceId))
    .map((row) => [row.sourceId, row]));
  assert.equal(anchors.size, 3);
  for (const [sourceId, row] of anchors) {
    assert.equal(row.conformanceStatus, "GOLDEN_CONFORMANT", sourceId);
    assert.equal(row.goldenProductionEligible, true, sourceId);
    assert.equal(row.queueState, "COMPLETE", sourceId);
    assert.equal(row.sharedRuntimeBypassed, false, sourceId);
  }
  const active = goldenRegistry.rows.find((row) => row.sourceId === SOURCE_ID);
  assert.equal(active.conformanceStatus, "IN_PROGRESS_GOLDEN_NATIVE");
  assert.equal(active.goldenProductionEligible, false);
  assert.equal(active.queueState, "ACTIVE");
});

test("A01 candidate fails closed on descriptor count drift and unmapped runtime questions", () => {
  const badDescriptor = structuredClone(G3AU01_POSTG_GOLDEN_RUNTIME_DESCRIPTOR);
  badDescriptor.frozenCounts.patternSpecCount = 19;
  const consumed = consumeGoldenRuntimeContract(badDescriptor, SOURCE_ID);
  assert.equal(consumed.ok, false);
  assert.equal(
    consumed.errors.some(({ code }) => code === "POSTG_GOLDEN_PATTERN_SPEC_COVERAGE_INVALID"),
    false,
  );
  assert.equal(
    consumed.errors.some(({ code }) => code === "POSTG_GOLDEN_UNIT_COUNT_INVALID"),
    false,
  );
  const descriptor = resolveGlobalPublicSourceUnitAdapterDescriptor(SOURCE_ID);
  assert.equal(descriptor.expectedCounts.patternSpecs, 20);
  assert.notEqual(badDescriptor.frozenCounts.patternSpecCount, descriptor.expectedCounts.patternSpecs);

  const plan = explicitGoldenPlan();
  const badResult = attachPostGoldenQuestionLineage({
    ok: true,
    errors: [],
    warnings: [],
    plan,
    allocation: [],
    questions: [{
      id: "unknown-1",
      sourceId: SOURCE_ID,
      patternSpecId: "ps_g3a_u01_unknown",
      metadata: { sourceId: SOURCE_ID, patternId: "ps_g3a_u01_unknown" },
    }],
  }, plan);
  assert.equal(badResult.ok, false);
  assert.equal(
    badResult.errors.some(({ code }) => code === "POSTG_QUESTION_PATTERN_UNMAPPED"),
    true,
  );
});
