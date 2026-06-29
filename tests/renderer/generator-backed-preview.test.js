import test from "node:test";
import assert from "node:assert/strict";

import {
  buildGeneratorBackedPreviewArtifact,
  buildWorksheetDocumentFromConfig
} from "../../tools/preview/generate-generator-backed-preview-html.js";
import { createGroupedPreviewConfig } from "../../tools/preview/fixtures/grouped-preview-config.js";
import { createMultipagePreviewConfig } from "../../tools/preview/fixtures/multipage-preview-config.js";
import { createShuffledPreviewConfig } from "../../tools/preview/fixtures/shuffled-preview-config.js";

test("generator-backed preview script creates a WorksheetDocument through core assembly", () => {
  const worksheetDocument = buildWorksheetDocumentFromConfig(createGroupedPreviewConfig(), {
    generationSeed: "grouped-generation-seed",
    orderingSeed: "grouped-ordering-seed"
  });

  assert.equal(Array.isArray(worksheetDocument.generatedQuestions), true);
  assert.equal(Array.isArray(worksheetDocument.questionPages), true);
  assert.equal(Array.isArray(worksheetDocument.answerKeyPages), true);
  assert.equal(worksheetDocument.generatedQuestions.length > 0, true);
});

test("generated HTML includes question pages from WorksheetDocument.questionPages", () => {
  const artifact = buildGeneratorBackedPreviewArtifact({
    config: createGroupedPreviewConfig(),
    title: "Grouped Worksheet Preview",
    generationSeed: "grouped-generation-seed",
    orderingSeed: "grouped-ordering-seed"
  });

  assert.equal(
    (artifact.html.match(/worksheet-page worksheet-page--questions print-page/g) ?? []).length,
    artifact.worksheetDocument.questionPages.length
  );
});

test("generated HTML includes answer-key pages only when present", () => {
  const withAnswerKey = buildGeneratorBackedPreviewArtifact({
    config: createGroupedPreviewConfig(),
    title: "Grouped Worksheet Preview",
    generationSeed: "grouped-generation-seed",
    orderingSeed: "grouped-ordering-seed"
  });
  const withoutAnswerKeyConfig = createGroupedPreviewConfig();
  withoutAnswerKeyConfig.printLayout.showAnswerKeyPage = false;
  const withoutAnswerKey = buildGeneratorBackedPreviewArtifact({
    config: withoutAnswerKeyConfig,
    title: "Grouped Without Answer Key",
    generationSeed: "grouped-generation-seed",
    orderingSeed: "grouped-ordering-seed"
  });

  assert.equal(withAnswerKey.worksheetDocument.answerKeyPages.length > 0, true);
  assert.equal(withAnswerKey.html.includes("worksheet-section--answer-key"), true);
  assert.equal(withoutAnswerKey.worksheetDocument.answerKeyPages.length, 0);
  assert.equal(withoutAnswerKey.html.includes("worksheet-section--answer-key"), false);
});

test("grouped fixture preserves grouped ordering", () => {
  const worksheetDocument = buildWorksheetDocumentFromConfig(createGroupedPreviewConfig(), {
    generationSeed: "grouped-generation-seed",
    orderingSeed: "grouped-ordering-seed"
  });
  const patternIds = worksheetDocument.questionDisplayModels.map((model) => model.patternId);

  assert.deepEqual(patternIds, ["group_sub", "group_sub", "group_add", "group_add"]);
});

test("shuffled fixture is deterministic with fixed seed", () => {
  const first = buildGeneratorBackedPreviewArtifact({
    config: createShuffledPreviewConfig(),
    title: "Shuffled Worksheet Preview",
    generationSeed: "shuffled-generation-seed",
    orderingSeed: "shuffled-ordering-seed"
  });
  const second = buildGeneratorBackedPreviewArtifact({
    config: createShuffledPreviewConfig(),
    title: "Shuffled Worksheet Preview",
    generationSeed: "shuffled-generation-seed",
    orderingSeed: "shuffled-ordering-seed"
  });

  assert.deepEqual(first.worksheetDocument.orderedQuestionIds, second.worksheetDocument.orderedQuestionIds);
  assert.equal(first.html, second.html);
});

test("multi-page fixture produces more than one question page", () => {
  const worksheetDocument = buildWorksheetDocumentFromConfig(createMultipagePreviewConfig(), {
    generationSeed: "multipage-generation-seed",
    orderingSeed: "multipage-ordering-seed"
  });

  assert.equal(worksheetDocument.questionPages.length > 1, true);
});

test("filler cells remain rendered", () => {
  const artifact = buildGeneratorBackedPreviewArtifact({
    config: createMultipagePreviewConfig(),
    title: "Multipage Worksheet Preview",
    generationSeed: "multipage-generation-seed",
    orderingSeed: "multipage-ordering-seed"
  });

  assert.equal(artifact.html.includes("worksheet-cell worksheet-cell--filler"), true);
});

test("answer-key pages remain after question pages", () => {
  const artifact = buildGeneratorBackedPreviewArtifact({
    config: createMultipagePreviewConfig(),
    title: "Multipage Worksheet Preview",
    generationSeed: "multipage-generation-seed",
    orderingSeed: "multipage-ordering-seed"
  });

  assert.equal(
    artifact.html.indexOf("worksheet-section--questions") < artifact.html.indexOf("worksheet-section--answer-key"),
    true
  );
});

test("preview output is browser-openable html", () => {
  const artifact = buildGeneratorBackedPreviewArtifact({
    config: createGroupedPreviewConfig(),
    title: "Grouped Worksheet Preview",
    generationSeed: "grouped-generation-seed",
    orderingSeed: "grouped-ordering-seed"
  });

  assert.equal(artifact.html.startsWith("<!doctype html>"), true);
  assert.equal(artifact.html.includes("</html>"), true);
});
