import assert from "node:assert/strict";
import test from "node:test";

import { buildWorksheetDocumentFromState } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  createConfigState,
  setBatchAGenerationSeed,
  setBatchAIncludeAnswerKey,
  setBatchAOrdering,
  setBatchAQuestionCount,
  setBatchASourceId,
} from "../../site/assets/browser/state/config-state.js";
import {
  BATCH_A_ALL_UNITS_PRODUCTION_CLOSEOUT,
  BATCH_A_PRODUCTION_SOURCE_IDS,
  validateBatchAAllUnitsProductionCloseoutContract,
} from "../../site/modules/curriculum/batch-a/batch-a-production-closeout.js";
import { listBatchASourceUnits } from "../../site/modules/curriculum/batch-a/source-units.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s60j-extension.js";

const QUESTION_COUNT = 24;

function build(sourceId, { ordering = "groupedByPattern", includeAnswerKey = true, seed = "s60m" } = {}) {
  const state = createConfigState();
  setBatchASourceId(state, sourceId);
  setBatchAQuestionCount(state, QUESTION_COUNT);
  setBatchAOrdering(state, ordering);
  setBatchAIncludeAnswerKey(state, includeAnswerKey);
  setBatchAGenerationSeed(state, `${seed}-${sourceId}`);
  return buildWorksheetDocumentFromState(state);
}

function questionIds(document) {
  return document.orderedQuestionIds ?? document.generatedQuestions?.map((item) => item.questionId) ?? [];
}

test("S60M contract freezes the exact 13-source Batch A production surface", () => {
  const validation = validateBatchAAllUnitsProductionCloseoutContract();
  assert.equal(validation.ok, true, validation.errors.join(","));
  assert.deepEqual(validation.counts, {
    sourceUnits: 13,
    publicSurfaces: 3,
    orderingModes: 2,
    answerKeyModes: 2,
  });
  assert.equal(BATCH_A_ALL_UNITS_PRODUCTION_CLOSEOUT.productionUse, "allowed");
  assert.equal(BATCH_A_ALL_UNITS_PRODUCTION_CLOSEOUT.goalDistance, "D0_BATCH_A_SOURCE_UNIT_WORKSHEET");
  assert.deepEqual(listBatchASourceUnits().map((unit) => unit.sourceId), [...BATCH_A_PRODUCTION_SOURCE_IDS]);
});

test("S60M all 13 source-unit routes generate exact validated grouped worksheets and answer keys", () => {
  for (const sourceId of BATCH_A_PRODUCTION_SOURCE_IDS) {
    const result = build(sourceId, { ordering: "groupedByPattern", includeAnswerKey: true, seed: "s60m-grouped" });
    assert.equal(result.ok, true, `${sourceId}: ${JSON.stringify(result.errors ?? result.validation?.errors ?? [])}`);
    const document = result.worksheetDocument;
    assert.ok(document, `${sourceId}: worksheet document missing`);
    assert.equal(document.batchA?.sourceId, sourceId, `${sourceId}: source mismatch`);
    assert.equal(document.summary?.questionCount, QUESTION_COUNT, `${sourceId}: summary count mismatch`);
    assert.equal(document.generatedQuestions?.length, QUESTION_COUNT, `${sourceId}: generated count mismatch`);
    assert.equal(document.answerKeyItems?.length, QUESTION_COUNT, `${sourceId}: answer count mismatch`);
    assert.ok(document.questionPages?.length > 0, `${sourceId}: question pages missing`);
    assert.ok(document.answerKeyPages?.length > 0, `${sourceId}: answer pages missing`);
    assert.equal((result.errors ?? result.validation?.errors ?? []).length, 0, `${sourceId}: blocking errors present`);
  }
});

test("S60M all 13 source-unit routes support deterministic shuffled production output", () => {
  for (const sourceId of BATCH_A_PRODUCTION_SOURCE_IDS) {
    const first = build(sourceId, { ordering: "shuffleAcrossPatterns", includeAnswerKey: true, seed: "s60m-shuffle" });
    const second = build(sourceId, { ordering: "shuffleAcrossPatterns", includeAnswerKey: true, seed: "s60m-shuffle" });
    assert.equal(first.ok, true, `${sourceId}: first shuffled generation failed`);
    assert.equal(second.ok, true, `${sourceId}: second shuffled generation failed`);
    assert.deepEqual(questionIds(first.worksheetDocument), questionIds(second.worksheetDocument), `${sourceId}: shuffled replay drift`);
    assert.equal(first.worksheetDocument.summary?.questionCount, QUESTION_COUNT, `${sourceId}: shuffled count mismatch`);
  }
});

test("S60M all 13 source-unit routes suppress answer records and pages when disabled", () => {
  for (const sourceId of BATCH_A_PRODUCTION_SOURCE_IDS) {
    const result = build(sourceId, { includeAnswerKey: false, seed: "s60m-no-answer" });
    assert.equal(result.ok, true, `${sourceId}: answer-suppressed generation failed`);
    assert.equal(result.worksheetDocument.generatedQuestions?.length, QUESTION_COUNT, `${sourceId}: question count mismatch`);
    assert.deepEqual(result.worksheetDocument.answerKeyItems, [], `${sourceId}: answer records leaked`);
    assert.deepEqual(result.worksheetDocument.answerKeyPages, [], `${sourceId}: answer pages leaked`);
  }
});

test("S60M all 13 source-unit routes render printable Traditional Chinese HTML without public internal-id leakage", () => {
  for (const sourceId of BATCH_A_PRODUCTION_SOURCE_IDS) {
    const result = build(sourceId, { includeAnswerKey: true, seed: "s60m-render" });
    assert.equal(result.ok, true, `${sourceId}: generation failed before render`);
    const html = renderWorksheetDocumentToHtml(result.worksheetDocument, {
      title: result.worksheetDocument.title,
      stylesheetHref: "./assets/styles/print-styles.css",
      debugDataAttributes: false,
    });
    assert.match(html, /<!doctype html>/i, `${sourceId}: HTML document missing`);
    assert.match(html, /lang="zh-Hant"/, `${sourceId}: Traditional Chinese language marker missing`);
    assert.match(html, /worksheet-document/, `${sourceId}: worksheet surface missing`);
    assert.match(html, /答案/, `${sourceId}: answer-key text missing`);
    assert.equal(/(?:kp|pg|ps)_g[345][ab]_u\d+/i.test(html), false, `${sourceId}: internal curriculum id leaked`);
    assert.equal(/\{\{\s*[A-Za-z0-9_.-]+\s*\}\}/.test(html), false, `${sourceId}: unresolved placeholder leaked`);
  }
});

test("S60M aggregate gate validates 1,248 production questions across ordering and answer-key modes", () => {
  let validatedQuestionCount = 0;
  for (const sourceId of BATCH_A_PRODUCTION_SOURCE_IDS) {
    for (const ordering of BATCH_A_ALL_UNITS_PRODUCTION_CLOSEOUT.requiredOrderingModes) {
      for (const includeAnswerKey of BATCH_A_ALL_UNITS_PRODUCTION_CLOSEOUT.answerKeyModes) {
        const result = build(sourceId, { ordering, includeAnswerKey, seed: `s60m-matrix-${ordering}-${includeAnswerKey}` });
        assert.equal(result.ok, true, `${sourceId}/${ordering}/${includeAnswerKey}: production matrix failure`);
        validatedQuestionCount += result.worksheetDocument.generatedQuestions.length;
      }
    }
  }
  assert.equal(validatedQuestionCount, 13 * 2 * 2 * QUESTION_COUNT);
});
