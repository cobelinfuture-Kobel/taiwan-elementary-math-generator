import test from "node:test";
import assert from "node:assert/strict";

import {
  runPixelWorksheetGeneration,
  subscribePixelGeneration
} from "../../site/pixel/pixel-generation-controller.js";
import { createPixelWorksheetState } from "../../site/pixel/pixel-worksheet-state.js";

test("Pixel generation subscribers receive the authoritative execution once", () => {
  const received = [];
  const unsubscribe = subscribePixelGeneration((execution) => received.push(execution));
  const state = createPixelWorksheetState({
    sourceId: "g3a_u02_3a02",
    questionCount: 6,
    includeAnswerKey: true,
    generationSeed: "pixel-generation-subscriber"
  });

  const execution = runPixelWorksheetGeneration(state);
  unsubscribe();

  assert.equal(execution.summary.ok, true);
  assert.equal(received.length, 1);
  assert.equal(received[0], execution);
  assert.equal(received[0].result.worksheetDocument.worksheetId, state.lastWorksheetDocument.worksheetId);
});

test("Pixel generation subscriber can unsubscribe and invalid subscribers are rejected", () => {
  let calls = 0;
  const unsubscribe = subscribePixelGeneration(() => { calls += 1; });
  unsubscribe();
  runPixelWorksheetGeneration(createPixelWorksheetState({
    sourceId: "g3a_u02_3a02",
    questionCount: 4,
    generationSeed: "pixel-generation-unsubscribe"
  }));
  assert.equal(calls, 0);
  assert.throws(() => subscribePixelGeneration(null), /must be a function/);
});
