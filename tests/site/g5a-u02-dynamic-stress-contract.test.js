import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { listG5AU02PublicKnowledgePoints } from "../../site/modules/curriculum/batch-b/g5a-u02-public-knowledge-points.js";
import { resolveG5AU02BrowserPlan } from "../../site/modules/curriculum/batch-b/g5a-u02-browser-resolver.js";
import { buildG5AU02BrowserDynamicWorksheet } from "../../site/modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js";

const SOURCE_ID = "g5a_u02_5a02";
const rows = listG5AU02PublicKnowledgePoints();
const selected = [rows[1], rows[6], rows[12], rows[15]];

function build(questionCount, generationSeed, includeAnswerKey) {
  const resolution = resolveG5AU02BrowserPlan({
    sourceId: SOURCE_ID,
    selectedKnowledgePointIds: selected.map((row) => row.knowledgePointId),
    questionCount,
    generationSeed,
    includeAnswerKey,
    rowsPerPage: 10,
  });
  assert.equal(resolution.ok, true);
  const result = buildG5AU02BrowserDynamicWorksheet(resolution.plan);
  assert.equal(result.ok, true);
  return { resolution, result };
}

test("S96G stress selection covers numeric, application, GCF and geometry KPs", () => {
  assert.equal(rows.length, 18);
  assert.equal(selected.length, 4);
  assert.equal(new Set(selected.flatMap((row) => row.patternSpecIds)).size, 5);
});

test("S96G 200-question dynamic stress is exact, scoped and balanced", () => {
  const { resolution, result } = build(200, 96200, true);
  const document = result.worksheetDocument;
  assert.equal(document.questionCount, 200);
  assert.equal(document.answerKeyItems.length, 200);
  const allowed = new Set(resolution.patternSpecIds);
  assert.ok(document.questionItems.every((row) => allowed.has(row.patternSpecId)));
  const counts = new Map();
  for (const row of document.questionItems) counts.set(row.patternSpecId, (counts.get(row.patternSpecId) ?? 0) + 1);
  const values = [...counts.values()];
  assert.ok(Math.max(...values) - Math.min(...values) <= 1);
});

test("S96G answer suppression and seed variation remain active at stress sizes", () => {
  const suppressed = build(100, 96001, false).result.worksheetDocument;
  assert.equal(suppressed.answerKeyItems.length, 0);
  assert.equal(suppressed.answerKeyPages.length, 0);
  assert.doesNotMatch(suppressed.dynamicHtml, /g5a-u02-section--answer-key/);
  const first = build(100, 96001, true).result.worksheetDocument.questionItems;
  const varied = build(100, 96002, true).result.worksheetDocument.questionItems;
  assert.notDeepEqual(first, varied);
});

test("S96G workflow enforces Chromium, PDF, nonblank, bbox and CJK gates", async () => {
  const workflow = await readFile(".github/workflows/s96g-g5a-u02-dynamic-html-pdf-stress.yml", "utf8");
  for (const token of ["playwright", "pdftoppm", "pdftotext -bbox-layout", "blank page", "bbox overflow", "CJK extraction failed"]) {
    assert.match(workflow, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
