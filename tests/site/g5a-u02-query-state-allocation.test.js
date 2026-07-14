import test from "node:test";
import assert from "node:assert/strict";

import { parseQueryState, writeQueryStateFromState } from "../../site/assets/browser/state/query-state.js";
import { resolveG5AU02BrowserPlan } from "../../site/modules/curriculum/batch-b/g5a-u02-browser-resolver.js";
import { buildG5AU02BrowserDynamicWorksheet } from "../../site/modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js";
import { listG5AU02PublicKnowledgePoints } from "../../site/modules/curriculum/batch-b/g5a-u02-public-knowledge-points.js";

const SOURCE_ID = "g5a_u02_5a02";
const [FIRST, SECOND] = listG5AU02PublicKnowledgePoints();

test("S96F parses a single G5A-U02 KnowledgePoint with generation controls", () => {
  const state = parseQueryState(`?sourceId=${SOURCE_ID}&selectionMode=singleKnowledgePoint&kp=${FIRST.knowledgePointId}&pg=${FIRST.patternGroupId}&questionCount=17&generationSeed=96017&answerKey=0&rowsPerPage=5`);
  assert.equal(state.sourceId, SOURCE_ID);
  assert.equal(state.selectionMode, "singleKnowledgePoint");
  assert.deepEqual(state.selectedKnowledgePointIds, [FIRST.knowledgePointId]);
  assert.deepEqual(state.selectedPatternGroupIds, [FIRST.patternGroupId]);
  assert.equal(state.questionCount, 17);
  assert.equal(state.generationSeed, "96017");
  assert.equal(state.includeAnswerKey, false);
  assert.equal(state.rowsPerPage, 5);
  assert.deepEqual(state.selectorWarnings, []);
});

test("S96F parses multi-KP same-unit selection and drops foreign IDs", () => {
  const state = parseQueryState(`?sourceId=${SOURCE_ID}&selectionMode=mixedKnowledgePointsSameUnit&kp=${FIRST.knowledgePointId}&kp=${SECOND.knowledgePointId}&kp=kp_unknown&pg=${FIRST.patternGroupId}&pg=${SECOND.patternGroupId}`);
  assert.equal(state.selectionMode, "mixedKnowledgePointsSameUnit");
  assert.deepEqual(state.selectedKnowledgePointIds, [FIRST.knowledgePointId, SECOND.knowledgePointId]);
  assert.deepEqual(state.selectedPatternGroupIds, [FIRST.patternGroupId, SECOND.patternGroupId]);
  assert.ok(state.selectorWarnings.some((row) => row.code === "selector_id_dropped" && row.field === "knowledgePointIds"));
});

test("S96F writes source, KP, PG, question count, seed and answer-key state", () => {
  const originalWindow = global.window;
  let written = null;
  global.window = {
    location: { href: "https://example.test/" },
    history: { replaceState(_state, _title, url) { written = String(url); } },
  };
  try {
    writeQueryStateFromState({
      batchA: {
        sourceId: SOURCE_ID,
        questionCount: 23,
        ordering: "canonical",
        includeAnswerKey: true,
        generationSeed: "96023",
        columns: 2,
        rowsPerPage: 7,
        selectionMode: "mixedKnowledgePointsSameUnit",
        selectedKnowledgePointIds: [FIRST.knowledgePointId, SECOND.knowledgePointId],
        selectedPatternGroupIds: [FIRST.patternGroupId, SECOND.patternGroupId],
      },
    });
    const url = new URL(written);
    assert.equal(url.searchParams.get("sourceId"), SOURCE_ID);
    assert.equal(url.searchParams.get("questionCount"), "23");
    assert.equal(url.searchParams.get("generationSeed"), "96023");
    assert.equal(url.searchParams.get("answerKey"), "1");
    assert.deepEqual(url.searchParams.getAll("kp"), [FIRST.knowledgePointId, SECOND.knowledgePointId]);
    assert.deepEqual(url.searchParams.getAll("pg"), [FIRST.patternGroupId, SECOND.patternGroupId]);
  } finally {
    global.window = originalWindow;
  }
});

test("S96F resolved multi-KP allocation is exact, balanced and canonical-only", () => {
  const resolution = resolveG5AU02BrowserPlan({
    sourceId: SOURCE_ID,
    selectedKnowledgePointIds: [FIRST.knowledgePointId, SECOND.knowledgePointId],
    questionCount: 23,
    generationSeed: 96023,
    includeAnswerKey: true,
    rowsPerPage: 7,
  });
  assert.equal(resolution.ok, true);
  assert.equal(resolution.mode, "multiKnowledgePoint");
  const built = buildG5AU02BrowserDynamicWorksheet(resolution.plan);
  assert.equal(built.ok, true);
  assert.equal(built.worksheetDocument.questionCount, 23);
  assert.equal(built.worksheetDocument.answerKeyItems.length, 23);
  const allowed = new Set(resolution.patternSpecIds);
  assert.ok(built.worksheetDocument.questionItems.every((row) => allowed.has(row.patternSpecId)));
  const counts = new Map();
  for (const row of built.worksheetDocument.questionItems) counts.set(row.patternSpecId, (counts.get(row.patternSpecId) ?? 0) + 1);
  const values = [...counts.values()];
  assert.ok(Math.max(...values) - Math.min(...values) <= 1);
});
