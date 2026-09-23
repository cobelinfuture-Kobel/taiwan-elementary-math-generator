import test from "node:test";
import assert from "node:assert/strict";

import { createConfigState } from "../../site/assets/browser/state/config-state.js";
import { buildWorksheetDocumentFromState } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { listG5AU02PublicKnowledgePoints } from "../../site/modules/curriculum/batch-b/g5a-u02-public-knowledge-points.js";
import {
  buildG5AU02BrowserDynamicWorksheet,
  normalizeG5AU02BrowserSeed,
} from "../../site/modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js";
import { resolveG5AU02BrowserPlan } from "../../site/modules/curriculum/batch-b/g5a-u02-browser-resolver.js";

const SOURCE_ID = "g5a_u02_5a02";
const DEFAULT_PUBLIC_SEED = "batch-a-browser";
const ROWS = listG5AU02PublicKnowledgePoints();
const MULTI_CONSTRAINT_ROW = ROWS.find(
  (row) => row.knowledgePointId === "kp_g5a_u02_multi_constraint_digit_code_number_theory",
);

function stateFor(row, overrides = {}) {
  return createConfigState({
    queryState: {
      sourceId: SOURCE_ID,
      questionCount: overrides.questionCount ?? 1,
      ordering: "groupedByPattern",
      includeAnswerKey: overrides.includeAnswerKey ?? true,
      generationSeed: overrides.generationSeed ?? DEFAULT_PUBLIC_SEED,
      columns: 4,
      rowsPerPage: 10,
      selectionMode: "singleKnowledgePoint",
      selectedKnowledgePointIds: [row.knowledgePointId],
      selectedPatternGroupIds: [row.patternGroupId],
      selectorWarnings: [],
    },
  });
}

test("S96I normalizes public text seeds deterministically into the hidden integer seed contract", () => {
  const first = normalizeG5AU02BrowserSeed(DEFAULT_PUBLIC_SEED);
  const replay = normalizeG5AU02BrowserSeed(DEFAULT_PUBLIC_SEED);
  const varied = normalizeG5AU02BrowserSeed("batch-a-browser-varied");

  assert.ok(Number.isInteger(first));
  assert.ok(first >= 1 && first <= 0x7fffffff);
  assert.equal(first, replay);
  assert.notEqual(first, varied);
  assert.equal(normalizeG5AU02BrowserSeed("96017"), 96017);
  assert.equal(normalizeG5AU02BrowserSeed(96017), 96017);
});

test("S96I reproduces and fixes the public multi-constraint 20-question click path", () => {
  assert.ok(MULTI_CONSTRAINT_ROW, "multi-constraint public KnowledgePoint must exist");
  const result = buildWorksheetDocumentFromState(stateFor(MULTI_CONSTRAINT_ROW, {
    questionCount: 20,
    includeAnswerKey: false,
    generationSeed: DEFAULT_PUBLIC_SEED,
  }));

  assert.equal(result.ok, true, result.errors?.join("\n"));
  assert.equal(result.worksheetDocument.questionCount, 20);
  assert.equal(result.worksheetDocument.answerKeyEnabled, false);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 0);
  assert.equal(result.worksheetDocument.patternSpecIds.length, 1);
  assert.equal(result.worksheetDocument.patternSpecIds[0], "ps_g5a_u02_multi_constraint_digit_code");
  assert.ok(Number.isInteger(result.worksheetDocument.generationSeed));
  assert.match(result.worksheetDocument.dynamicHtml, /^<!doctype html>/);
});

test("S96I all 18 public KnowledgePoints generate through the actual state-to-worksheet pipeline with the UI default text seed", () => {
  assert.equal(ROWS.length, 18);
  for (const row of ROWS) {
    const result = buildWorksheetDocumentFromState(stateFor(row));
    assert.equal(result.ok, true, `${row.knowledgePointId}: ${(result.errors ?? []).join(",")}`);
    assert.equal(result.worksheetDocument.questionCount, 1, row.knowledgePointId);
    assert.ok(
      result.worksheetDocument.questionItems.every((item) => row.patternSpecIds.includes(item.patternSpecId)),
      row.knowledgePointId,
    );
  }
});

test("S96I resolver and dynamic runtime preserve deterministic replay for public text seeds", () => {
  const row = MULTI_CONSTRAINT_ROW;
  const resolution = resolveG5AU02BrowserPlan({
    sourceId: SOURCE_ID,
    selectedKnowledgePointIds: [row.knowledgePointId],
    questionCount: 4,
    generationSeed: DEFAULT_PUBLIC_SEED,
    includeAnswerKey: true,
    rowsPerPage: 10,
  });
  assert.equal(resolution.ok, true);
  const first = buildG5AU02BrowserDynamicWorksheet(resolution.plan);
  const replay = buildG5AU02BrowserDynamicWorksheet(resolution.plan);
  assert.equal(first.ok, true, first.errors?.join("\n"));
  assert.deepEqual(first, replay);
});
